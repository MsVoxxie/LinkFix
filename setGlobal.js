const dotenv = require('dotenv');
dotenv.config();

const Logger = require('./functions/logging/logger');
const { collectCommandData, putGlobalCommands } = require('./functions/helpers/deployCommands');

// Register every local command with Discord, replacing the current global set.
(async () => {
	try {
		const commands = collectCommandData();
		Logger.info(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await putGlobalCommands(commands);
		Logger.success(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		Logger.error(error);
	}
})();
