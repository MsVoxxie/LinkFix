const { Events, hyperlink } = require('discord.js');
const linkFixer = require('../../functions/helpers/linkFixer');
const { msgSpoiled } = require('../../functions/helpers/messageFuncs');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Check if the message is from a bot
		if (message.author.bot) return;

		// If the message contains <link> or ||link|| or ||link#||, return
		if (msgSpoiled(message.content)) return;

		// Define Regex
		const linkRegex = /https:\/\/www\.instagram\.com\/reel\/([A-Za-z0-9_-]+)\//gm;
		const queryString = /(\bhttps?:\/\/[^\s?]+)\?[^\s]*/gm;
		const linkMatches = [...message.content.matchAll(linkRegex)];
		if (!linkMatches.length) return;

		// "Wait" a few seconds to make sure the message embeds are cached
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Get the original message but remove any found lines as well as any query strings
		let originalMessage = message.content.replace(queryString, '').replace(linkRegex, '').trim();

		// Define Array
		const messagesToSend = [];

		// Loop over every match
		for (const match of linkMatches) {
			// Define Variables
			const linkId = match[1];
			const finalLink = `https://ddinstagram.com/reel/${linkId}`;

			// Format the message
			const formattedMessage = hyperlink(`Instagram • ${linkId}`, finalLink);

			// Add the message to the array
			messagesToSend.push(formattedMessage);
		}

		// Run the link fixer
		try {
			await linkFixer(message, originalMessage, messagesToSend, '<:insta:1252935517784506398>');
		} catch (error) {
			console.error('An error occurred in the link fixer:', error);
		}
	},
};
