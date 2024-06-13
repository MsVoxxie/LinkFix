// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Discord Classes
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

// Define Client
const client = new Client({
	intents: [GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel],
	allowedMentions: { parse: [] },
});

// Define Collections
client.commands = new Collection();
client.events = new Collection();

// Client Constants
client.color = '#f3d600';

// Run Loaders
require('./core/loaders/commandLoader')(client);
require('./core/loaders/eventLoader')(client);

client.login(process.env.DISCORD_TOKEN);
