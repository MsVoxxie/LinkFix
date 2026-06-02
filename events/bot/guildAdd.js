const { Events, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
	name: Events.GuildCreate,
	runType: 'infinity',
	async execute(client, guild) {
		// Try to get the bot member in this guild
		const me = guild.members.me ?? (await guild.members.fetchMe().catch(() => null));
		if (!me) return;

		// Build a list of channels to try, system channel first
		const channelsToTry = [];
		if (guild.systemChannel) channelsToTry.push(guild.systemChannel);

		const fallbackChannels = guild.channels.cache
			.filter((channel) => [ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type))
			.sort((a, b) => a.rawPosition - b.rawPosition);

		for (const channel of fallbackChannels.values()) {
			if (!channelsToTry.includes(channel)) channelsToTry.push(channel);
		}

		let onboardingChannel;
		for (const channel of channelsToTry) {
			const permissions = channel.permissionsFor(me);
			if (!permissions?.has(PermissionFlagsBits.ViewChannel)) continue;
			if (!permissions?.has(PermissionFlagsBits.SendMessages)) continue;

			onboardingChannel = channel;
			break;
		}

		if (!onboardingChannel) return;

		// Build the onboarding message for staff
		const introLines = [
			'Hi! Thanks for adding me.',
			'',
			'I fix supported social links so they embed cleanly.',
			'',
			'Staff setup:',
			'1. Run `/setup-audit` to scan the server for channel override issues.',
			'2. Run `/fix-here` in any channel that still fails.',
			'3. If channels are synced, update the category override once to fix all synced channels.',
			'',
			'User controls:',
			'- Anyone can use `/preference` to opt in or out of automatic link fixing.',
		].join('\n');

		const embedAllowed = onboardingChannel.permissionsFor(me)?.has(PermissionFlagsBits.EmbedLinks);
		if (embedAllowed) {
			const embed = new EmbedBuilder()
				.setColor(client.color || '#f3d600')
				.setTitle('Setup Guide')
				.setDescription(introLines);

			await onboardingChannel.send({ embeds: [embed] }).catch(() => null);
			return;
		}

		await onboardingChannel.send({ content: introLines }).catch(() => null);
	},
};
