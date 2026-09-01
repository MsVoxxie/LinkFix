const { serviceData } = require('../../config/services');

/**
 * Finds every supported social media link in a string.
 *
 * Matches are grouped by platform in `serviceData` order (all Bsky matches, then
 * all FurAffinity matches, ...), not by position in the text.
 *
 * @param {string} text
 * @returns {Array<{ platform: string, emoji: string, data: RegExpMatchArray }>}
 */
function extractLinks(text) {
	const matches = [];
	for (const { platform, emoji, regex } of serviceData) {
		regex.lastIndex = 0;
		for (const match of text.matchAll(regex)) {
			matches.push({ platform, emoji, data: match });
		}
	}
	return matches;
}

module.exports = { extractLinks };
