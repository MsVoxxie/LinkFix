const { Events, hyperlink } = require('discord.js');
const { embedHasContent } = require('../../functions/helpers/messageFuncs');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Check if the message is from a bot
		if (message.author.bot) return;

		// Define Regex
		const twitRegex = /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com|nitter\.net)\/([\w_]+)\/status\/(\d+)(\/(?:photo|video)\/\d)?\/?(?:\?\S+)?/gm;
		const linkMatches = [...message.content.matchAll(twitRegex)];
		if (!linkMatches.length) return;

		// "Wait" a few seconds to make sure the message embeds are cached
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Define Variables
		let lastMessage;
		let messageToSend;
		let firstMessage = true;

		// Define Emojis
		const memberEmoji = '<:members_alt:1251856831819808789>';
		const botEmoji = '<:bot_alt:1251856830917771357>';
		const fixEmoji = '<:twx:1251856156381548614>';
		const [emojiName, emojiId] = fixEmoji.match(/<:([^:]+):(\d+)>/).slice(1, 3);

		// Get the original message but remove any found lines
		let originalMessage = message.content.replace(twitRegex, '').trim();

		// Define Array
		const messagesToSend = [];

		// Loop over every match
		for (const match of linkMatches) {
			// Define Variables
			const twitUser = match[1];
			const twitID = match[2];
			const twitLink = `https://fixupx.com/${twitUser}/status/${twitID}`;

			// Format the message
			const formattedMessage = hyperlink(`Tweet • ${twitUser} - ${twitID}`, twitLink);

			// Add the message to the array
			messagesToSend.push(formattedMessage);
		}

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
						// Format the message to send
						messageToSend = `${memberEmoji} | ${msg}`;

						// Format the message to send
						const manualFormat = `From ${message.author}\n${originalMessage.length ? `${originalMessage}\n` : ''}${messageToSend}`;

						if (firstMessage) {
							// If the message has a reference, reply to the reference
							if (message.reference) {
								const replyMessage = await message.channel.messages.fetch(message.reference.messageId);
								lastMessage = await replyMessage.reply(manualFormat);
							} else {
								// If the message does not have a reference, send a new message
								lastMessage = await message.channel.send(manualFormat);
							}
							firstMessage = false;
						} else {
							lastMessage = await lastMessage.reply(messageToSend);
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
					// Format the message to send
					messageToSend = `${botEmoji} | ${msg}`;
					if (firstMessage) {
						lastMessage = await message.reply(`From ${message.author}\n${originalMessage.length ? `${originalMessage}\n` : ''}${messageToSend}`);
						firstMessage = false;
					} else {
						lastMessage = await lastMessage.reply(`${messageToSend}`);
					}
				}
				break;
		}
	},
};
