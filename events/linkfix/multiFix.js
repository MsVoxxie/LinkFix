const { msgSpoiled } = require('../../functions/helpers/messageFuncs');
const linkFixer = require('../../functions/helpers/linkFixer');
const { getFixedLinkData } = require('../../functions/helpers/fixedLinkMapper');
const { extractLinks } = require('../../functions/helpers/linkExtractor');
const { serviceData } = require('../../config/services');
const { EMBED_CACHE_WAIT_MS } = require('../../config/constants');
const Logger = require('../../functions/logging/logger');
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

		// If the message contains <link> or ||link|| or ||link#||, return
		if (msgSpoiled(message.content)) return;

		// Check if any of the patterns match the message content
		const linkMatches = extractLinks(message.content);

		// If no matches, exit
		if (linkMatches.length === 0) return;

		// "Wait" a few seconds to make sure the message embeds are cached
		await new Promise((resolve) => setTimeout(resolve, EMBED_CACHE_WAIT_MS));

		// Define the query string regex
		const queryString = /(\bhttps?:\/\/[^\s?]+)\?[^\s]*/gm;

		// Remove any query strings first, keeping the base url intact
		let originalMessage = message.content.replace(queryString, '$1');

		// Remove URLs using the regexes defined for each platform
		serviceData.forEach(({ regex }) => {
			originalMessage = originalMessage.replace(regex, '');
		});

		// Trim the message to remove any leading or trailing whitespace
		originalMessage = originalMessage.trim();

		// Define object for formatted messages, react with the first matched platform's emoji
		const msgData = { emoji: linkMatches[0].emoji, messages: [] };

		for await (const { platform, data } of linkMatches) {
			const linkData = getFixedLinkData(platform, data);
			if (!linkData) {
				Logger.warn(`Unsupported platform: ${platform}`);
				continue;
			}

			msgData.messages.push(hyperlink(linkData.label, linkData.url));
		}

		// If nothing could be formatted, exit without touching the counter
		if (msgData.messages.length === 0) return;

		// Run the link fixer
		try {
			await linkFixer(message, originalMessage, msgData.messages, msgData.emoji);
		} catch (error) {
			Logger.error(error);
		}
	},
};
