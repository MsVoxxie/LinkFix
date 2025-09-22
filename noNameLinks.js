// Configuration File
const dotenv = require('dotenv');
dotenv.config();

// Define Regex patterns for social media links
const serviceData = [
	{ platform: 'Bsky', emoji: '<:bsky:1297323816787120209>', regex: /https:\/\/bsky\.app\/profile\/([^\/]+)\/post\/([a-zA-Z0-9]{1,20})/gm },
	{ platform: 'FurAffinity', emoji: '<:furaffinity:1267698389168947280>', regex: /https:\/\/www\.furaffinity\.net\/view\/(\d+)\//gm },
	{ platform: 'Instagram', emoji: '<:insta:1267698397167747173>', regex: /https:\/\/www\.instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)\/?(?:\?\S+)?/gm },
	{ platform: 'Pixiv', emoji: '<:pixiv:1267698425424511026>', regex: /https:\/\/www\.pixiv\.net\/en\/artworks\/(\d+)/gm },
	{ platform: 'Reddit', emoji: '<:reddit:1267698435461484640>', regex: /https:\/\/(?:www\.)?reddit\.com\/r\/([^\/]+)\/(comments|s)\/([^\/]+)\/?/gm },
	{ platform: 'TikTok', emoji: '<:tiktok:1267698443560943647>', regex: /https:\/\/www\.tiktok\.com\/t\/(\w+)\//gm },
	{ platform: 'Tumblr', emoji: '<:tmblr:1317267509249839114>', regex: /https:\/\/www\.tumblr\.com\/([\w-]+)\/(\d+)/gm },
	{
		platform: 'Twitter',
		emoji: '<:twx:1267698451051708467>',
		regex: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com|nitter\.net)\/([\w_]+)\/status\/(\d+)(\/(?:photo|video)\/\d)?\/?(?:\?\S+)?/gm,
	},
];

module.exports = { serviceData };

// Discord Classes
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');
const cron = require('node-cron');

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

// Every 5 Minutes
cron.schedule('*/5 * * * *', () => {
	client.emit('everyFiveMinutes');
});

client.login(process.env.DISCORD_TOKEN);
