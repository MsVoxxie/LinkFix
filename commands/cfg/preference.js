const { SlashCommandBuilder, InteractionContextType, ApplicationIntegrationType, MessageFlags } = require('discord.js');
const UserChoice = require('../../models/userChoice');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('preference')
		.setDescription('Opt in or out of automatic link fixing.')
		.setContexts([InteractionContextType.Guild, InteractionContextType.PrivateChannel])
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.addStringOption((option) =>
			option
				.setName('choice')
				.setDescription('Whether to opt in or out of automatic link fixing.')
				.setRequired(true)
				.addChoices({ name: 'Opt In', value: 'true' }, { name: 'Opt Out', value: 'false' }),
		),

	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction) {
		try {
			// Get the opt_in boolean from the interaction
			const userChoice = interaction.options.getString('choice') === 'true';

			// Update the user's settings for automatic link fixing
			await UserChoice.findOneAndUpdate({ userId: interaction.user.id }, { autoLinkFix: userChoice }, { upsert: true, new: true });

			// Send a confirmation message
			await interaction.reply({ content: `You have successfully ${userChoice ? 'opted in to' : 'opted out of'} automatic link fixing.`, flags: MessageFlags.Ephemeral });
			return;
		} catch (error) {
			console.error('Error updating user choice:', error);
			await interaction.reply({ content: 'There was an error updating your automatic link fixing preference. Please try again later.', flags: MessageFlags.Ephemeral });
		}
	},
};
