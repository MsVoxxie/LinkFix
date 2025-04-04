const { serviceData } = require('../../noNameLinks');
const fixedLinks = require('../../models/linksFixed');

/**
 * Formats a given Discord message object by extracting, processing, and reformatting social media links.
 *
 * @param {Object} message - The Discord message object.
 * @returns {Object|boolean} - Returns an object with formatted message data or false if no links are found.
 */

async function messageFormatter(url) {
	try {
		// Check if any of the patterns match the message content
		let linkMatches = [];
		let finalLink = '';
		for (const { platform, regex } of serviceData) {
			linkMatches = linkMatches.concat(
				[...url.matchAll(regex)].map((match) => ({
					platform,
					data: match,
				}))
			);
		}

		if (linkMatches.length === 0) return false; // If no matches, exit

		// Define Array for formatted messages
		for await (const { platform, data } of linkMatches) {
			const match = data;

			switch (platform) {
				case 'Bsky':
					finalLink = `https://bskye.app/profile/${match[1]}/post/${match[2]}`;
					break;

				case 'FurAffinity':
					finalLink = `https://xfuraffinity.net/view/${match[1]}`;
					break;

				case 'Instagram':
					finalLink = `https://instagramez.com/reel/${match[1]}`;
					break;

				case 'Pixiv':
					finalLink = `https://phixiv.net/en/artworks/${match[1]}`;
					break;

				case 'Reddit':
					finalLink = `https://rxddit.com/r/${match[1]}/${match[2]}/${match[3]}`;
					break;

				case 'TikTok':
					finalLink = `https://tnktok.com/t/${match[1]}`;
					break;

				case 'Tumblr':
					finalLink = `https://www.tpmblr.com/${match[1]}/${match[2]}`;
					break;

				case 'Twitter':
					finalLink = `https://fxtwitter.com/${match[1]}/status/${match[2]}`;
					break;

				default:
					console.error(`Unsupported platform: ${platform}`);
			}
		}

		// Update the database
		await fixedLinks.findOneAndUpdate({}, { $inc: { linksFixed: 1 } }, { upsert: true });

		return finalLink;
	} catch (error) {
		throw new Error(error);
	}
}

module.exports = messageFormatter;
