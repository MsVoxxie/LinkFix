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
		const fixEmoji = '🔗';
		const messagesToSend = [];

		// Loop over every match
		for (const match of linkMatches) {
			// Define Variables
			const twitUser = match[1];
			const twitID = match[2];

			// Format the message
			const formattedMessage = hyperlink(`{TYPE} Tweet • ${twitUser} - ${twitID}`, `https://fixupx.com/${twitUser}/status/${twitID}`);

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
				const filter = (reaction, user) => reaction.emoji.name === fixEmoji && user.id === message.author.id;
				const collector = message.createReactionCollector({ filter, time: 90 * 1000 });
				collector.on('collect', async () => {
					// Stop the collector
					collector.stop();

					// Get the original message but remove any found lins
					const originalMessage = message.content.replace(twitRegex, '').trim();

					// Remove the reaction
					await message.reactions.cache.get(fixEmoji).remove();
					if (message) await message?.delete();

					// Send the messages
					for await (const msg of messagesToSend) {
						messageToSend = msg.replace('{TYPE}', 'M |');
						if (firstMessage) {
							lastMessage = await message.channel.send(`From: ${message.author}\n${originalMessage}\n${messageToSend}`);
							firstMessage = false;
						} else {
							lastMessage = await lastMessage.reply(messageToSend);
						}
					}
				});

				// Remove the reaction after the time is up
				collector.on('end', async () => {
					if (message) await message?.reactions.cache.get(fixEmoji).remove();
				});
				break;

			case false:
				// The message does not have an embed so send the messages automatically
				// Send the messages
				for await (const msg of messagesToSend) {
					messageToSend = msg.replace('{TYPE}', 'A |');
					if (firstMessage) {
						lastMessage = await message.reply(messageToSend);
						firstMessage = false;
					} else {
						lastMessage = await lastMessage.reply(messageToSend);
					}
				}
				break;
		}
	},
};
