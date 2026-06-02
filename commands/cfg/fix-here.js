const {
	SlashCommandBuilder,
	InteractionContextType,
	ApplicationIntegrationType,
	MessageFlags,
	PermissionFlagsBits,
	EmbedBuilder,
} = require('discord.js');
const { getChannelPermissionState } = require('../../functions/helpers/channelPermAudit');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fix-here')
		.setDescription('Check whether this channel has the permissions that I need.')
		.setContexts([InteractionContextType.Guild])
		.setIntegrationTypes([ApplicationIntegrationType.GuildInstall])
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

	options: {
		devOnly: false,
		disabled: false,
	},
	async execute(client, interaction) {
		if (!interaction.guild) {
			return interaction.reply({ content: 'This command can only be used in a server.', flags: MessageFlags.Ephemeral });
		}

		const permState = getChannelPermissionState(interaction.channel);

		if (!permState.failedPermissions.length) {
			const successEmbed = new EmbedBuilder()
				.setColor('#00C853')
				.setTitle('Channel Check Passed')
				.setDescription('This channel has everything that I need.')
				.addFields({ name: 'Permissions', value: `\`${permState.passedPermissions.join(', ')}\`` });

			return interaction.reply({ embeds: [successEmbed], flags: MessageFlags.Ephemeral });
		}

		const failedEmbed = new EmbedBuilder()
			.setColor('#FFAA00')
			.setTitle('Channel Needs Updates')
			.setDescription('Channel overrides are blocking me here.')
			.addFields({ name: 'Missing Permissions', value: `\`${permState.failedPermissions.join(', ')}\`` })
			.addFields({
				name: 'Fix Tip',
				value: 'If this channel is synced to a category, update the category override to fix all synced channels at once.',
			});

		await interaction.reply({ embeds: [failedEmbed], flags: MessageFlags.Ephemeral });
	},
};