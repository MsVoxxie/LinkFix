const platformMap = {
	Bsky: (match) => {
		const userId = match[1];
		const linkId = match[2];
		return {
			url: `https://fxbsky.app/profile/${userId}/post/${linkId}`,
			label: `Post • ${userId} - ${linkId}`,
		};
	},
	FurAffinity: (match) => {
		const id = match[1];
		return {
			url: `https://xfuraffinity.net/view/${id}`,
			label: `FurAffinity • ${id}`,
		};
	},
	Instagram: (match) => {
		const id = match[1];
		return {
			url: `https://vxinstagram.com/reel/${id}`,
			label: `Instagram • ${id}`,
		};
	},
	Pixiv: (match) => {
		const id = match[1];
		return {
			url: `https://phixiv.net/en/artworks/${id}`,
			label: `Pixiv • ${id}`,
		};
	},
	Reddit: (match) => {
		const subreddit = match[1];
		const type = match[2];
		const id = match[3];
		return {
			url: `https://rxddit.com/r/${subreddit}/${type}/${id}`,
			label: `Reddit • ${subreddit} - ${id}`,
		};
	},
	TikTok: (match) => {
		const id = match[1];
		return {
			url: `https://tnktok.com/t/${id}`,
			label: `TikTok • ${id}`,
		};
	},
	Tumblr: (match) => {
		const userId = match[1];
		const linkId = match[2];
		return {
			url: `https://www.tpmblr.com/${userId}/${linkId}`,
			label: `Tumblr • ${userId} - ${linkId}`,
		};
	},
	Twitter: (match) => {
		const userId = match[1];
		const linkId = match[2];
		return {
			url: `https://fixupx.com/${userId}/status/${linkId}/en`,
			label: `Tweet • ${userId} - ${linkId}`,
		};
	},
};

function getFixedLinkData(platform, match) {
	const mapper = platformMap[platform];
	if (!mapper) return null;

	return mapper(match);
}

module.exports = { getFixedLinkData };
