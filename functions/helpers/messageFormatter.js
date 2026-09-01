const fixedLinks = require('../../models/linksFixed');
const { getFixedLinkData } = require('./fixedLinkMapper');
const { extractLinks } = require('./linkExtractor');
const Logger = require('../logging/logger');

/**
 * Extracts supported social media links from a string and returns their fixed,
 * embed-friendly equivalents (newline-joined). Increments the global links-fixed
 * counter by the number of links rebuilt.
 *
 * @param {string} url - Raw text that may contain one or more supported links.
 * @returns {Promise<string|false>} Newline-joined fixed URLs, or false if nothing supported was found.
 */

async function messageFormatter(url) {
	try {
		// Check if any of the patterns match the message content
		const linkMatches = extractLinks(url);
		const finalLinks = [];

		if (linkMatches.length === 0) return false; // If no matches, exit

		// Build the fixed link for every match we support
		for await (const { platform, data } of linkMatches) {
			const linkData = getFixedLinkData(platform, data);
			if (!linkData) {
				Logger.warn(`Unsupported platform: ${platform}`);
				continue;
			}

			finalLinks.push(linkData.url);
		}

		// If nothing could be formatted, exit without touching the counter
		if (finalLinks.length === 0) return false;

		// Update the database with the number of links we actually fixed
		await fixedLinks.findOneAndUpdate(fixedLinks.SINGLETON_FILTER, { $inc: { linksFixed: finalLinks.length } }, { upsert: true });

		return finalLinks.join('\n');
	} catch (error) {
		// Preserve the original error (and its stack) for the caller
		throw error;
	}
}

module.exports = messageFormatter;
