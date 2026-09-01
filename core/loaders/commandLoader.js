const ascii = require('ascii-table');
const commandTable = new ascii().setTitle('Command Loader').setHeading('Category', 'Command', 'Load Status');
const getAllFiles = require('../../functions/helpers/getAllFiles');
const Logger = require('../../functions/logging/logger');
const { join } = require('path');
module.exports = (client) => {
	// Read the commands directory
	const commandFolders = getAllFiles(join(__dirname, '../', '../commands'), true);
	// Loop over the commands directory to retrieve all command files
	for (const commandFolder of commandFolders) {
		const commandFolderName = commandFolder.replace(/\\/g, '/').split('/').pop();
		// Get command files and sort them by load order
		const commandFiles = getAllFiles(commandFolder);
		commandFiles.sort((a, b) => a.localeCompare(b));
		// Loop over the command files to retrieve all commands
		for (const commandFile of commandFiles) {
			const loadedCommand = require(commandFile);
			// A valid command exposes both a `data` builder and an `execute` handler
			if ('data' in loadedCommand && 'execute' in loadedCommand) {
				client.commands.set(loadedCommand.data.name, loadedCommand);
				commandTable.addRow(commandFolderName, loadedCommand.data.name, '✔ » Loaded');
			} else {
				commandTable.addRow(commandFolderName, `${loadedCommand?.data?.name ? loadedCommand.data.name : 'Unknown'}`, '✕ » Errored');
			}
		}
	}
	Logger.banner(commandTable.toString());
};
