const { ActivityType } = require('discord.js');
const fixedLinks = require('../../models/linksFixed');
const Logger = require('../logging/logger');
const { STATUS_REFRESH_MS } = require('../../config/constants');

/**
 * Sets the bot's presence to the current lifetime links-fixed count.
 * @param {import('discord.js').Client} client
 */
async function updateLinkCountActivity(client) {
	const doc = await fixedLinks.findOne(fixedLinks.SINGLETON_FILTER);
	const count = doc?.linksFixed?.toLocaleString() ?? '0';
	await client.user.setActivity(`I've Fixed ${count} links.`, { type: ActivityType.Custom });
}

/**
 * Refresh the presence once now, then on a fixed interval for the life of the process.
 * @param {import('discord.js').Client} client
 */
function startStatusUpdates(client) {
	const refresh = () => updateLinkCountActivity(client).catch((error) => Logger.error(error));
	refresh();
	setInterval(refresh, STATUS_REFRESH_MS);
}

module.exports = { updateLinkCountActivity, startStatusUpdates };
