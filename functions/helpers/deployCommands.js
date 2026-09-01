const { REST, Routes } = require('discord.js');
const getAllFiles = require('./getAllFiles');
const { join } = require('path');

// Load every command's slash-command JSON from the commands directory.
function collectCommandData() {
	const commandsDir = join(__dirname, '../', '../commands');
	const body = [];
	for (const folder of getAllFiles(commandsDir, true)) {
		for (const file of getAllFiles(folder)) {
			if (!file.endsWith('.js')) continue;
			const command = require(file);
			if (command?.data) body.push(command.data.toJSON());
		}
	}
	return body;
}

// Push a command set to Discord, replacing whatever is registered globally.
// Pass an empty array to clear all global commands.
async function putGlobalCommands(body) {
	const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
	return rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
}

module.exports = { collectCommandData, putGlobalCommands };
