const { EmbedBuilder } = require('discord.js');
const { embedHasContent, embedIsAgeRestricted, botHasPermissions } = require('./messageFuncs');
const { reqPerm } = require('./reqPerms');
const fixedLinks = require('../../models/linksFixed');
const Logger = require('../logging/logger');
const {
	ERROR_REACTION_LIFETIME_MS,
	OPT_OUT_NOTICE_LIFETIME_MS,
	MANUAL_FIX_COLLECTOR_MS,
	REMOVE_COLLECTOR_MS,
	CHANCE_TO_NOTIFY_MISSING_PERMS,
	CHANCE_TO_INFORM_OPT_OUT,
	EMOJI,
} = require('../../config/constants');

async function linkFix(message, originalMessage, messagesToSend, emoji) {
	try {
		// Nothing to send, bail out before doing any work
		if (!messagesToSend.length) return;

		// Define Variables
		const addTimedErrorReaction = async (emojiToUse) => {
			try {
				const reaction = await message.react(emojiToUse);
				setTimeout(() => reaction.remove().catch(() => null), ERROR_REACTION_LIFETIME_MS);
			} catch (error) {
				null;
			}
		};
		const recordSuccessfulFix = async () => {
			await fixedLinks.findOneAndUpdate(fixedLinks.SINGLETON_FILTER, { $inc: { linksFixed: 1 } }, { upsert: true });

			// Percentage chance to inform users about opting out: 100 = 100%
			const informProbability = Math.min(Math.max(CHANCE_TO_INFORM_OPT_OUT, 0), 100) / 100;
			if (Math.random() < informProbability) {
				const deleteAt = Math.floor((Date.now() + OPT_OUT_NOTICE_LIFETIME_MS) / 1000);
				const optOutMessage = `-# Did you know? You can opt out of automatic link fixing by using the \`/preference\` command!`;
				const autoDeleteMessage = `-# This message will self-destruct <t:${deleteAt}:R>.`;

				await message.channel.send({ content: `${optOutMessage}\n${autoDeleteMessage}` }).then((msg) => {
					setTimeout(() => msg.delete().catch((error) => Logger.error(error)), OPT_OUT_NOTICE_LIFETIME_MS);
				});
			}
		};

		// Define Emojis
		const memberEmoji = EMOJI.MEMBER;
		const botEmoji = EMOJI.BOT;
		const errEmoji = EMOJI.ERROR;
		const fixEmoji = emoji;
		const [emojiName, emojiId] = fixEmoji.match(/<:([^:]+):(\d+)>/).slice(1, 3);

		// Check if the message has a real embed. X's age-restricted placeholder counts as no content,
		// so those links get auto-fixed instead of waiting for a manual opt-in.
		const embedContent = message.embeds.some((embed) => embedHasContent(embed) && !embedIsAgeRestricted(embed));

		// Check if the bot has permissions
		const permCheck = botHasPermissions(message, reqPerm);
		if (permCheck.failedPermissions.length) {
			const canOfferManualFix = embedContent && !permCheck.failedPermissions.includes('AddReactions');

			// If embedded content can still use reactions, let users attempt manual fix
			if (!canOfferManualFix) {
			// For auto-fix flow, treat missing permissions as a failed fix attempt
				if (!embedContent) await addTimedErrorReaction(errEmoji);

				// Only post the larger permissions notice occasionally to reduce noise
				const notifyProbability = Math.min(Math.max(CHANCE_TO_NOTIFY_MISSING_PERMS, 0), 100) / 100;
				if (Math.random() >= notifyProbability) return;

				// Build an embed to send the error message
				const embed = new EmbedBuilder()
					.setColor('#FF0000')
					.setTitle('Missing Permissions')
					.setThumbnail(message.guild.iconURL())
					.setDescription(
						`I am unable to fix ${message.member.displayName}'s message in ${message.guild.name}, ${message.channel.name} due to missing permissions.\n\nPlease inform the server owner or an admin to grant me the following permissions:`,
					)
					.addFields({
						name: 'Missing Permissions',
						value: `\`${permCheck.failedPermissions.join(', ')}\``,
					});

				// Send the embed
				if (!permCheck.failedPermissions.includes('SendMessages')) {
					await message.reply({ embeds: [embed] }).catch(() => null);
					return;
				} else {
					await message.author.send({ embeds: [embed] }).catch(() => null);
					return;
				}
			}
		}

		if (embedContent) {
			// The message already embeds, so add a reaction and let the author opt in to a fix
			await message.react(fixEmoji);

			const filter = (reaction, user) => reaction.emoji.id === emojiId && user.id === message.author.id;
			const collector = message.createReactionCollector({ filter, time: MANUAL_FIX_COLLECTOR_MS });

			collector.on('collect', async () => {
				// Manual fix was requested, so failure should react
				shouldReactOnFailure = true;

				// Stop the collector
				collector.stop();

				// Remove the reaction and the message
				try {
					await message.reactions.cache.get(emojiId).remove();
					if (message) await message?.delete();
				} catch (error) {
					null;
				}

				// Prefix the first message with the author and whatever text they had around the link
				const buildFirstContent = (line) => `From ${message.author}\n${originalMessage.length ? `${originalMessage}\n` : ''}${line}`;
				await sendFixMessages(message, messagesToSend, { linePrefix: memberEmoji, buildFirstContent, replyToReference: true });

				await recordSuccessfulFix();
			});

			// Remove the reaction after the time is up
			collector.on('end', async () => {
				try {
					if (message) await message?.reactions.cache.get(emojiId)?.remove();
				} catch (error) {}
			});
		} else {
			// The message does not have an embed so send the messages automatically
			shouldReactOnFailure = true;
			await sendFixMessages(message, messagesToSend, { linePrefix: botEmoji });

			await recordSuccessfulFix();
		}

		// Catch any errors
	} catch (error) {
		if (shouldReactOnFailure) {
			await message
				.react(EMOJI.ERROR)
				.then((reaction) => {
					setTimeout(() => reaction.remove().catch(() => null), ERROR_REACTION_LIFETIME_MS);
				})
				.catch(() => null);
		}
		throw error;
	}
}

// Try to reply to the message, falling back to a plain channel send if the reply fails
async function safeSend(message, content) {
	try {
		return await message.reply(content);
	} catch (error) {
		return await message.channel.send(content);
	}
}

// Send the first line of a fix, optionally chaining it off the message the author replied to
async function sendFirstMessage(message, content, replyToReference) {
	if (replyToReference && message.reference) {
		const replyMessage = await message.channel.messages.fetch(message.reference.messageId).catch(() => null);
		if (replyMessage) return replyMessage.reply(content);
	}
	return safeSend(message, content);
}

// Send every fixed link as a chain of replies and let the author remove the batch once it is done
async function sendFixMessages(message, messagesToSend, { linePrefix, buildFirstContent = null, replyToReference = false }) {
	const sentMessages = [];
	let lastMessage;
	let firstMessage = true;

	for await (const msg of messagesToSend) {
		// Get the index of the message
		const index = messagesToSend.indexOf(msg);

		// Format the message to send
		const messageToSend = `${linePrefix} | ${msg}`;

		if (firstMessage) {
			const firstContent = buildFirstContent ? buildFirstContent(messageToSend) : messageToSend;
			lastMessage = await sendFirstMessage(message, firstContent, replyToReference);
			sentMessages.push(lastMessage);
			firstMessage = false;
		} else {
			try {
				lastMessage = await lastMessage.reply(messageToSend);
			} catch (error) {
				lastMessage = await message.channel.send(messageToSend);
			}
			sentMessages.push(lastMessage);
		}

		// If the message is the last message, allow the user to remove the messages
		if (index === messagesToSend.length - 1) {
			await allowRemove(message.author, lastMessage, sentMessages);
		}
	}

	return sentMessages;
}

async function allowRemove(author, message, sentMessages) {
	// Add the reaction
	await message.react('🚮');
	// Add a collector to the last message in case the user wants to delete the messages
	const filter = (reaction, user) => reaction.emoji.name === '🚮' && user.id === author.id;
	const collector = message.createReactionCollector({ filter, time: REMOVE_COLLECTOR_MS });

	// Listen for the reaction
	collector.on('collect', async () => {
		// Stop the collector
		collector.stop();

		// Delete the messages
		for await (const msg of sentMessages) {
			// Check if the message exists
			await msg?.delete();
		}
	});

	// Remove the reaction after the time is up
	collector.on('end', async (col, reason) => {
		if (reason === 'time') {
			try {
				await message?.reactions?.cache?.get('🚮')?.remove();
			} catch (error) {
				null;
			}
		}
	});
}

module.exports = linkFix;
// Exposed for unit tests
module.exports.sendFixMessages = sendFixMessages;
