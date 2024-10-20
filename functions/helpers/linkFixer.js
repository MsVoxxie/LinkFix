async function linkFix(message, originalMessage, messagesToSend, emoji) {
	const { embedHasContent } = require('../../functions/helpers/messageFuncs');

	try {
		// Define Variables
		let lastMessage;
		let messageToSend;
		let firstMessage = true;
		const sentMessages = [];

		// Define Emojis
		const memberEmoji = '<:members_alt:1267698407573819432>';
		const botEmoji = '<:bot_alt:1267698378117218344>';
		const fixEmoji = emoji;
		const [emojiName, emojiId] = fixEmoji.match(/<:([^:]+):(\d+)>/).slice(1, 3);

		// Check if the message has an embed
		const embedContent = message.embeds.some(embedHasContent);

		switch (embedContent) {
			case true:
				// Add the reaction
				await message.react(fixEmoji);

				// The message has an embed so give the user the ability to manually fix the link
				const filter = (reaction, user) => reaction.emoji.id === emojiId && user.id === message.author.id;
				const collector = message.createReactionCollector({ filter, time: 90 * 1000 });
				collector.on('collect', async () => {
					// Stop the collector
					collector.stop();

					// Remove the reaction
					await message.reactions.cache.get(emojiId).remove();
					if (message) await message?.delete();

					// Send the messages
					for await (const msg of messagesToSend) {
						// Get the index of the message
						const index = messagesToSend.indexOf(msg);

						// Format the message to send
						messageToSend = `${memberEmoji} | ${msg}`;

						// Format the message to send
						const manualFormat = `From ${message.author}\n${originalMessage.length ? `${originalMessage}\n` : ''}${messageToSend}`;

						if (firstMessage) {
							// If the message has a reference, reply to the reference
							if (message.reference) {
								const replyMessage = await message.channel.messages.fetch(message.reference.messageId);
								lastMessage = await replyMessage.reply(manualFormat);
								sentMessages.push(lastMessage);
							} else {
								// If the message does not have a reference, send a new message
								lastMessage = await message.channel.send(manualFormat);
								sentMessages.push(lastMessage);
							}
							firstMessage = false;
						} else {
							lastMessage = await lastMessage.reply(messageToSend);
							sentMessages.push(lastMessage);
						}
						// If the message is the last message, allow the user to remove the messages
						if (index === messagesToSend.length - 1) {
							await allowRemove(message.author, lastMessage, sentMessages);
						}
					}
				});

				// Remove the reaction after the time is up
				collector.on('end', async () => {
					if (message) await message?.reactions.cache.get(emojiId).remove();
				});
				break;

			case false:
				// The message does not have an embed so send the messages automatically
				// Send the messages
				for await (const msg of messagesToSend) {
					// Get the index of the message
					const index = messagesToSend.indexOf(msg);

					// Format the message to send
					messageToSend = `${botEmoji} | ${msg}`;
					if (firstMessage) {
						lastMessage = await message.reply(`${messageToSend}`);
						sentMessages.push(lastMessage);
						firstMessage = false;
					} else {
						lastMessage = await lastMessage.reply(`${messageToSend}`);
						sentMessages.push(lastMessage);
					}

					// If the message is the last message, allow the user to remove the messages
					if (index === messagesToSend.length - 1) {
						await allowRemove(message.author, lastMessage, sentMessages);
					}
				}
				break;
		}
	} catch (error) {
		throw new Error(error);
	}
}

async function allowRemove(author, message, sentMessages) {
	// Add the reaction
	await message.react('🚮');
	// Add a collector to the last message in case the user wants to delete the messages
	const filter = (reaction, user) => reaction.emoji.name === '🚮' && user.id === author.id;
	const collector = message.createReactionCollector({ filter, time: 30 * 1000 });

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
			await message?.reactions?.cache?.get('🚮')?.remove();
		}
	});
}

module.exports = linkFix;
