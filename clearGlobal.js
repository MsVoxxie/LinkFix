const dotenv = require('dotenv');
dotenv.config();

const Logger = require('./functions/logging/logger');
const { putGlobalCommands } = require('./functions/helpers/deployCommands');

// Remove every global command from Discord.
(async () => {
	try {
		Logger.info('Started clearing application (/) commands.');

		await putGlobalCommands([]);
		Logger.success('Successfully cleared application (/) commands.');
	} catch (error) {
		Logger.error(error);
	}
})();
