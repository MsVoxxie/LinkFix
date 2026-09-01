// Configuration File
const dotenv = require('dotenv');
dotenv.config();

const Logger = require('./functions/logging/logger');

// Catch anything that slips through so the process does not crash silently
process.on('unhandledRejection', (error) => Logger.error(`Unhandled Rejection: ${error?.stack ?? error}`));
process.on('uncaughtException', (error) => Logger.error(`Uncaught Exception: ${error?.stack ?? error}`));

// Link regex patterns live in config/services.js and are required directly by consumers.

// Discord Classes
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

// Define Client
const client = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel],
	allowedMentions: { parse: [] },
});

// Define Collections
client.commands = new Collection();
client.events = new Collection();

// Client Constants
client.color = '#f3d600';

// Run Loaders
client.mongoose = require('./core/loaders/mongoLoader');
require('./core/loaders/commandLoader')(client);
require('./core/loaders/eventLoader')(client);

// Connect to MongoDB before logging in so queries fired during startup are not lost
client.mongoose.init();

client.login(process.env.DISCORD_TOKEN);
