const { PermissionsBitField } = require('discord.js');
const { AGE_RESTRICTED_EMBED_PATTERN } = require('../../config/constants');

// True when an embed's text is just X's age-restricted placeholder.
function embedIsAgeRestricted(embed) {
	const text = `${embed?.title ?? ''} ${embed?.description ?? ''}`.replace(/\\(?=\W)/g, '');
	return AGE_RESTRICTED_EMBED_PATTERN.test(text);
}

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

// Wait for Discord to populate a real embed on the message, or give up after maxWaitMs.
// Resolves early once a non-placeholder embed shows up, instead of always sleeping the full window.
function waitForEmbed(client, message, maxWaitMs) {
	const hasRealEmbed = (msg) => msg.embeds.some((embed) => embedHasContent(embed) && !embedIsAgeRestricted(embed));

	if (hasRealEmbed(message)) return Promise.resolve(message);

	return new Promise((resolve) => {
		const cleanup = () => client.off('messageUpdate', onUpdate);

		const timer = setTimeout(() => {
			cleanup();
			resolve(message);
		}, maxWaitMs);

		const onUpdate = (oldMessage, newMessage) => {
			if (newMessage.id !== message.id) return;
			if (!hasRealEmbed(newMessage)) return;

			clearTimeout(timer);
			cleanup();
			resolve(newMessage);
		};

		client.on('messageUpdate', onUpdate);
	});
}

function msgSpoiled(content) {
	// Match suppressed link embeds <https://...> or spoilered text ||...||
	const linkPattern = /<https?:\/\/[^>\s]+>|\|\|[\s\S]*?\|\|/;
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
	embedIsAgeRestricted,
	msgSpoiled,
	waitForEmbed,
};
