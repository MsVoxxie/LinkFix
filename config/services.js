// Regex patterns for supported social media links.
// Kept in its own module so it can be required without booting the Discord client.
const serviceData = [
	{ platform: 'Bsky', emoji: '<:bsky:1297323816787120209>', regex: /https?:\/\/(?:www\.)?bsky\.app\/profile\/@?([^\/\s?]+)\/post\/([a-zA-Z0-9]+)/gm },
	{ platform: 'FurAffinity', emoji: '<:furaffinity:1267698389168947280>', regex: /https?:\/\/www\.furaffinity\.net\/view\/(\d+)\/?/gm },
	{ platform: 'Instagram', emoji: '<:insta:1267698397167747173>', regex: /https?:\/\/(?:www\.)?instagram\.com\/(reel|p|tv|stories)\/([A-Za-z0-9_-]+)\/?(?:\?\S+)?/gm },
	{ platform: 'Pixiv', emoji: '<:pixiv:1267698425424511026>', regex: /https?:\/\/www\.pixiv\.net\/(?:en\/)?artworks\/(\d+)/gm },
	{ platform: 'Reddit', emoji: '<:reddit:1267698435461484640>', regex: /https?:\/\/(?:www\.)?reddit\.com\/r\/([^\/]+)\/(comments|s)\/([^\/]+)(?:\/[^\s]*)?/gm },
	{
		platform: 'TikTok',
		emoji: '<:tiktok:1267698443560943647>',
		regex: /https?:\/\/(?:www\.|m\.|vm\.|vt\.)?tiktok\.com\/(?:@?[\w\.-]+\/video\/|t\/|v\/|.+?\/)?([A-Za-z0-9_-]+)(?=[\/\s\?]|$)/gm,
	},
	{ platform: 'Tumblr', emoji: '<:tmblr:1317267509249839114>', regex: /https?:\/\/(?:www\.)?tumblr\.com\/([\w-]+)\/(\d+)(?:\/[^\s]*)?/gm },
	{
		platform: 'Twitter',
		emoji: '<:twx:1267698451051708467>',
		regex: /https?:\/\/(?:www\.)?(?:twitter\.com|x\.com|nitter\.net)\/([\w_]+)\/status\/(\d+)(\/(?:photo|video)\/\d)?\/?(?:\?\S+)?/gm,
	},
];

module.exports = { serviceData };
