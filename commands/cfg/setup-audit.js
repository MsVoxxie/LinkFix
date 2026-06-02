const {
	SlashCommandBuilder,
	InteractionContextType,
	ApplicationIntegrationType,
	MessageFlags,
	PermissionFlagsBits,
	EmbedBuilder,
} = require('discord.js');
const { auditGuildChannels } = require('../../functions/helpers/channelPermAudit');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup-audit')
		.setDescription('Audit all channels for link-fix permissions and show what needs to be fixed.')
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

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const audit = auditGuildChannels(interaction.guild);
		const blockedPreview = audit.blockedChannels.slice(0, 12);

		const embed = new EmbedBuilder()
			.setColor(audit.blockedChannels.length ? '#FFAA00' : '#00C853')
			.setTitle('Channel Permission Audit')
			.setDescription(
				[
					`I scanned ${audit.totalChannels.toLocaleString()} channels for the permissions that I need.`,
					'',
					`Healthy: **${audit.healthyChannels.length.toLocaleString()}**`,
					`Needs updates: **${audit.blockedChannels.length.toLocaleString()}**`,
				].join('\n'),
			)
			.addFields({
				name: 'Fix Tip',
				value:
					'If channels are synced, update the category override once and re-sync the channel permissions to fix multiple channels at the same time.',
			});

		if (blockedPreview.length) {
			embed.addFields({
				name: 'Channels Missing Permissions',
				value: blockedPreview
					.map(({ channel, failedPermissions }) => `${channel} -> \`${failedPermissions.join(', ')}\``)
					.join('\n'),
			});
		}

		if (audit.blockedChannels.length > blockedPreview.length) {
			embed.setFooter({ text: `Showing ${blockedPreview.length} of ${audit.blockedChannels.length} channels that need updates.` });
		}

		await interaction.editReply({ embeds: [embed] });
	},
};