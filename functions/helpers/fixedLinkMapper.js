// Per-platform rebuild rules. Each entry turns a regex match array into a fixed,
// embed-friendly URL and a human-readable label.
//
//   host  - replacement domain
//   path  - () => path string, or null when the link cannot be rebuilt
//   label - () => display label
const platforms = {
	Bsky: {
		host: 'fxbsky.app',
		path: (m) => `/profile/${m[1]}/post/${m[2]}`,
		label: (m) => `Post • ${m[1]} - ${m[2]}`,
	},
	FurAffinity: {
		host: 'xfuraffinity.net',
		path: (m) => `/view/${m[1]}`,
		label: (m) => `FurAffinity • ${m[1]}`,
	},
	Instagram: {
		host: 'vxinstagram.com',
		// Stories are tied to a username we do not capture, so we cannot rebuild them
		path: (m) => (m[1] === 'stories' ? null : `/${m[1]}/${m[2]}`),
		label: (m) => `Instagram • ${m[2]}`,
	},
	Pixiv: {
		host: 'phixiv.net',
		path: (m) => `/en/artworks/${m[1]}`,
		label: (m) => `Pixiv • ${m[1]}`,
	},
	Reddit: {
		host: 'rxddit.com',
		path: (m) => `/r/${m[1]}/${m[2]}/${m[3]}`,
		label: (m) => `Reddit • ${m[1]} - ${m[3]}`,
	},
	TikTok: {
		host: 'tnktok.com',
		path: (m) => `/t/${m[1]}`,
		label: (m) => `TikTok • ${m[1]}`,
	},
	Tumblr: {
		host: 'www.tpmblr.com',
		path: (m) => `/${m[1]}/${m[2]}`,
		label: (m) => `Tumblr • ${m[1]} - ${m[2]}`,
	},
	Twitter: {
		host: 'fixupx.com',
		path: (m) => `/${m[1]}/status/${m[2]}/en`,
		label: (m) => `Tweet • ${m[1]} - ${m[2]}`,
	},
};

/**
 * @param {string} platform - key into the platform table
 * @param {RegExpMatchArray} match
 * @returns {{ url: string, label: string } | null} null if unsupported or unrebuildable
 */
function getFixedLinkData(platform, match) {
	const entry = platforms[platform];
	if (!entry) return null;

	const path = entry.path(match);
	if (path === null) return null;

	return {
		url: `https://${entry.host}${path}`,
		label: entry.label(match),
	};
}

module.exports = { getFixedLinkData };
