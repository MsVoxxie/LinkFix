const { Events, hyperlink } = require('discord.js');
const linkFixer = require('../../functions/helpers/linkFixer');
const { msgSpoiled } = require('../../functions/helpers/messageFuncs');
const { serviceData } = require('../../noNameLinks');

module.exports = {
	name: Events.MessageCreate,
	runType: 'infinity',
	async execute(client, message) {
		// Check if the message is from a bot
		if (message.author.bot) return;

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
				}))
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
			const match = data;
			msgData.emoji = emoji;

			let finalLink = '';
			switch (platform) {
				case 'Bsky':
					const bskyUserId = match[1];
					const bskyLinkId = match[2];
					finalLink = `https://cbsky.app/profile/${bskyUserId}/post/${bskyLinkId}`;
					msgData.messages.push(hyperlink(`Post • ${bskyUserId} - ${bskyLinkId}`, finalLink));
					break;

				case 'FurAffinity':
					const faId = match[1];
					finalLink = `https://xfuraffinity.net/view/${faId}`;
					msgData.messages.push(hyperlink(`FurAffinity • ${faId}`, finalLink));
					break;

				case 'Instagram':
					const instaId = match[1];
					finalLink = `https://instagramez.com/reel/${instaId}`;
					msgData.messages.push(hyperlink(`Instagram • ${instaId}`, finalLink));
					break;

				case 'Pixiv':
					const pixivId = match[1];
					finalLink = `https://phixiv.net/en/artworks/${pixivId}`;
					msgData.messages.push(hyperlink(`Pixiv • ${pixivId}`, finalLink));
					break;

				case 'Reddit':
					const redditSub = match[1];
					const redditType = match[2];
					const redditId = match[3];
					finalLink = `https://rxddit.com/r/${redditSub}/${redditType}/${redditId}`;
					msgData.messages.push(hyperlink(`Reddit • ${redditSub} - ${redditId}`, finalLink));
					break;

				case 'TikTok':
					const tiktokId = match[1];
					finalLink = `https://tnktok.com/t/${tiktokId}`;
					msgData.messages.push(hyperlink(`TikTok • ${tiktokId}`, finalLink));
					break;

				case 'Tumblr':
					const tumblrUserId = match[1];
					const tumblrLinkId = match[2];
					finalLink = `https://www.tpmblr.com/${tumblrUserId}/${tumblrLinkId}`;
					msgData.messages.push(hyperlink(`Tumblr • ${tumblrUserId} - ${tumblrLinkId}`, finalLink));
					break;

				case 'Twitter':
					const twitterUserId = match[1];
					const twitterLinkId = match[2];
					finalLink = `https://fixupx.com/${twitterUserId}/status/${twitterLinkId}`;
					msgData.messages.push(hyperlink(`Tweet • ${twitterUserId} - ${twitterLinkId}`, finalLink));
					break;

				default:
					console.error(`Unsupported platform: ${platform}`);
			}
		}

		// Run the link fixer
		try {
			await linkFixer(message, originalMessage, msgData.messages, msgData.emoji);
		} catch (error) {
			console.error('An error occurred in the link fixer:', error);
		}
	},
};
