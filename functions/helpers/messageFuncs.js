const { PermissionsBitField } = require('discord.js');

function embedHasContent(embed) {
	// Check if theres any content in the embed
	const image = embed?.image;
	const thumbnail = embed?.thumbnail;
	const description = embed?.description;

	// If the image height and width are 0, return false
	if (image && image.height === 0 && image.width === 0) return false;

	// If any of the above is true, return true
	if (image || thumbnail || description) return true;
	return false;
}

function msgSpoiled(content) {
	const linkPattern = /<[^>]*>|(\|\|.*?\|\|)/;
	return linkPattern.test(content);
}

// Loop over an array of permissions and check if the bot has the permission to do so in the current message channel
function botHasPermissions(message, permissions = []) {
	if (!permissions.length) throw new Error('No permissions provided');
	if (!message) throw new Error('No message provided');

	// Arrays
	const passedPermissions = [];
	const failedPermissions = [];

	// Check if the bot has the permissions
	const botPermissions = message.channel.permissionsFor(message.guild.members.me);

	// Add permissions that succeed to the array
	permissions.forEach((permission) => {
		// Get the human-readable name of the permission
		const permissionName = new PermissionsBitField(permission).toArray()[0];

		if (botPermissions.has(permission)) passedPermissions.push(permissionName);
		else failedPermissions.push(permissionName);
	});
	return { passedPermissions, failedPermissions };
}

module.exports = {
	botHasPermissions,
	embedHasContent,
	msgSpoiled,
};
