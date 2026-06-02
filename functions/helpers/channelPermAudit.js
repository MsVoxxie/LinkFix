const { ChannelType, PermissionsBitField } = require('discord.js');
const { reqPerm } = require('./reqPerms');

const supportedChannelTypes = new Set([ChannelType.GuildText, ChannelType.GuildAnnouncement]);

function getPermissionName(permission) {
	return new PermissionsBitField(permission).toArray()[0];
}

function isAuditableChannel(channel) {
	return supportedChannelTypes.has(channel.type);
}

function getChannelPermissionState(channel, permissions = reqPerm) {
	const passedPermissions = [];
	const failedPermissions = [];

	const me = channel.guild.members.me;
	const botPermissions = me ? channel.permissionsFor(me) : null;

	for (const permission of permissions) {
		const permissionName = getPermissionName(permission);

		if (botPermissions?.has(permission)) passedPermissions.push(permissionName);
		else failedPermissions.push(permissionName);
	}

	return { passedPermissions, failedPermissions };
}

function auditGuildChannels(guild, permissions = reqPerm) {
	const textChannels = guild.channels.cache.filter(isAuditableChannel);

	const healthyChannels = [];
	const blockedChannels = [];

	for (const channel of textChannels.values()) {
		const permState = getChannelPermissionState(channel, permissions);

		if (permState.failedPermissions.length) {
			blockedChannels.push({ channel, ...permState });
		} else {
			healthyChannels.push({ channel, ...permState });
		}
	}

	return {
		totalChannels: textChannels.size,
		healthyChannels,
		blockedChannels,
	};
}

module.exports = {
	auditGuildChannels,
	getChannelPermissionState,
};