const { serviceData } = require('../../noNameLinks');
const fixedLinks = require('../../models/linksFixed');
const { getFixedLinkData } = require('./fixedLinkMapper');

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
				})),
			);
		}

		if (linkMatches.length === 0) return false; // If no matches, exit

		// Define Array for formatted messages
		for await (const { platform, data } of linkMatches) {
			const linkData = getFixedLinkData(platform, data);
			if (!linkData) {
				console.error(`Unsupported platform: ${platform}`);
				continue;
			}

			finalLink = linkData.url;
		}

		// Update the database
		await fixedLinks.findOneAndUpdate({}, { $inc: { linksFixed: 1 } }, { upsert: true });

		return finalLink;
	} catch (error) {
		throw new Error(error);
	}
}

module.exports = messageFormatter;
