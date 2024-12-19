const fixedLinks = require('../../models/linksFixed');

module.exports = {
	name: 'everyFiveMinutes',
	runType: 'infinity',
	async execute(client) {
		// Get the number of links fixed
		const linksFixed = await fixedLinks.findOne();
		const linksFixedCount = linksFixed.linksFixed.toLocaleString();

		// Set the bot's activity
		await client.user.setActivity(`I've Fixed ${linksFixedCount} links.`, { type: ActivityType.Custom });
	},
};
