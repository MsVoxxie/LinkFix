const { msgSpoiled, botHasPermissions } = require('../../functions/helpers/messageFuncs');
const { reqPerm } = require('../../functions/helpers/reqPerms');
const linkFixer = require('../../functions/helpers/linkFixer');
const { getFixedLinkData } = require('../../functions/helpers/fixedLinkMapper');
const { serviceData } = require('../../noNameLinks');
const UserChoice = require('../../models/userChoice');
const { Events, hyperlink } = require('discord.js');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Check if the message is from a bot
		if (message.author.bot) return;

		// Check if the user has opted out of automatic link fixing
		const userSettings = await UserChoice.findOne({ userId: message.author.id });
		if (userSettings && userSettings.autoLinkFix === false) return;

		// Check if the bot has permissions
		const permCheck = botHasPermissions(message, reqPerm);

		if (permCheck.failedPermissions.length) {
			// Try to add an error reaction
			try {
				await message.react(errEmoji);
			} catch (error) {
				return;
			}

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
				await message.reply({ embeds: [embed] });
				return;
			} else {
				await message.author.send({ embeds: [embed] });
				return;
			}
		}

		// If the message contains <link> or ||link|| or ||link#||, return
		if (msgSpoiled(message.content)) return;

		// Check if any of the patterns match the message content
		let linkMatches = [];
		for (const { platform, emoji, regex } of serviceData) {
			linkMatches = linkMatches.concat(
				[...message.content.matchAll(regex)].map((match) => ({
					platform,
					emoji,
					data: match,
				})),
			);
		}

		// If no matches, exit
		if (linkMatches.length === 0) return;

		// "Wait" a few seconds to make sure the message embeds are cached
		await new Promise((resolve) => setTimeout(resolve, 1500));

		// Define the query string regex
		const queryString = /(\bhttps?:\/\/[^\s?]+)\?[^\s]*/gm;

		// Remove any query strings first
		let originalMessage = message.content.replace(queryString, '');

		// Remove URLs using the regexes defined for each platform
		serviceData.forEach(({ regex }) => {
			originalMessage = originalMessage.replace(regex, '');
		});

		// Trim the message to remove any leading or trailing whitespace
		originalMessage = originalMessage.trim();

		// Define Array for formatted messages
		const msgData = { emoji: '', messages: [] };

		for await (const { platform, emoji, data } of linkMatches) {
			msgData.emoji = emoji;

			const linkData = getFixedLinkData(platform, data);
			if (!linkData) {
				console.error(`Unsupported platform: ${platform}`);
				continue;
			}

			msgData.messages.push(hyperlink(linkData.label, linkData.url));
		}

		// Run the link fixer
		try {
			await linkFixer(message, originalMessage, msgData.messages, msgData.emoji);
		} catch (error) {
			console.error('An error occurred in the link fixer:', error);
		}
	},
};
