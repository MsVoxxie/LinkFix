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
		const finalLinks = [];
		for (const { platform, regex } of serviceData) {
			linkMatches = linkMatches.concat(
				[...url.matchAll(regex)].map((match) => ({
					platform,
					data: match,
				})),
			);
		}

		if (linkMatches.length === 0) return false; // If no matches, exit

		// Build the fixed link for every match we support
		for await (const { platform, data } of linkMatches) {
			const linkData = getFixedLinkData(platform, data);
			if (!linkData) {
				console.error(`Unsupported platform: ${platform}`);
				continue;
			}

			finalLinks.push(linkData.url);
		}

		// If nothing could be formatted, exit without touching the counter
		if (finalLinks.length === 0) return false;

		// Update the database with the number of links we actually fixed
		await fixedLinks.findOneAndUpdate({}, { $inc: { linksFixed: finalLinks.length } }, { upsert: true });

		return finalLinks.join('\n');
	} catch (error) {
		throw new Error(error);
	}
}

module.exports = messageFormatter;
