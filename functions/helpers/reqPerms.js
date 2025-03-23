const { PermissionFlagsBits } = require('discord.js');

const reqPerm = [
	PermissionFlagsBits.ViewChannel,
	PermissionFlagsBits.SendMessages,
	PermissionFlagsBits.AddReactions,
	PermissionFlagsBits.EmbedLinks,
	PermissionFlagsBits.ManageMessages,
];

module.exports = { reqPerm };
