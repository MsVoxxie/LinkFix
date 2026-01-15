const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const messageFormatter = require('../../functions/helpers/messageFormatter');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fx')
		.setDescription('Fix a given url so that it may embed on Discord, If supported.')
		.setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
		.setIntegrationTypes([ApplicationIntegrationType.UserInstall])
		.addStringOption((option) => option.setName('url').setDescription('The url to fix.').setRequired(true)),
	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction, settings) {
		// Get the url from the interaction
		const urlToFix = interaction.options.getString('url');

		// Check that the message can be formatted, format it if so.
		const formattedMessage = await messageFormatter(urlToFix);
		if (!formattedMessage) return interaction.reply({ content: 'The provided url is not supported.', flags: MessageFlags.Ephemeral });

		// Send the formatted message
		await interaction.reply({ content: formattedMessage, flags: MessageFlags.Ephemeral });
	},
};
