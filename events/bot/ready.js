const { Events } = require('discord.js');
const Logger = require('../../functions/logging/logger');
const { startStatusUpdates } = require('../../functions/helpers/statusActivity');

module.exports = {
	name: Events.ClientReady,
	runType: 'single',
	async execute(client) {
		// Mongo connection is started before login (see noNameLinks.js)
		Logger.success(`Ready! Logged in as ${client.user.tag}`);

		// Show the current links-fixed count in the bot's presence and keep it refreshed
		startStatusUpdates(client);
	},
};
