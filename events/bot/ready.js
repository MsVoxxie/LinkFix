const { Events, ActivityType } = require('discord.js');
const Logger = require('../../functions/logging/logger');
const fixedLinks = require('../../models/linksFixed');

module.exports = {
	name: Events.ClientReady,
	runType: 'single',
	async execute(client) {
		// Log that the bot is ready and initalize the mongoose connection
		Logger.success(`Ready! Logged in as ${client.user.tag}`);
		client.mongoose.init();

		// Get the number of links fixed
		const linksFixed = await fixedLinks.findOne();
		const linksFixedCount = linksFixed?.linksFixed?.toLocaleString() ?? '0';

		// Set the bot's activity
		await client.user.setActivity(`I've Fixed ${linksFixedCount} links.`, { type: ActivityType.Custom });
	},
};
