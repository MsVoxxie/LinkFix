import { describe, it, expect } from 'vitest';
import servicesPkg from '../config/services.js';
import mapperPkg from '../functions/helpers/fixedLinkMapper.js';

const { serviceData } = servicesPkg;
const { getFixedLinkData } = mapperPkg;

// Pull the first regex match for a platform out of a sample string.
function firstMatch(platform, text) {
	const entry = serviceData.find((s) => s.platform === platform);
	if (!entry) throw new Error(`no serviceData entry for ${platform}`);
	entry.regex.lastIndex = 0;
	return [...text.matchAll(entry.regex)][0];
}

// Characterization: locks in the CURRENT regex + mapper behavior.
// input = a raw message string, so regex extraction is exercised too.
const cases = [
	{
		platform: 'Bsky',
		input: 'look https://bsky.app/profile/alice.bsky.social/post/abc123XYZ done',
		url: 'https://fxbsky.app/profile/alice.bsky.social/post/abc123XYZ',
		label: 'Post • alice.bsky.social - abc123XYZ',
	},
	{
		platform: 'Bsky',
		input: 'https://bsky.app/profile/renc0.bsky.social/post/3muh65culv22v',
		url: 'https://fxbsky.app/profile/renc0.bsky.social/post/3muh65culv22v',
		label: 'Post • renc0.bsky.social - 3muh65culv22v',
	},
	{
		platform: 'Bsky',
		input: 'https://bsky.app/profile/@renc0.bsky.social/post/3muh65culv22v',
		url: 'https://fxbsky.app/profile/renc0.bsky.social/post/3muh65culv22v',
		label: 'Post • renc0.bsky.social - 3muh65culv22v',
	},
	{
		platform: 'FurAffinity',
		input: 'https://www.furaffinity.net/view/12345678/',
		url: 'https://xfuraffinity.net/view/12345678',
		label: 'FurAffinity • 12345678',
	},
	{
		platform: 'Instagram',
		input: 'https://www.instagram.com/reel/AbC123_-x/',
		url: 'https://vxinstagram.com/reel/AbC123_-x',
		label: 'Instagram • AbC123_-x',
	},
	{
		platform: 'Pixiv',
		input: 'https://www.pixiv.net/en/artworks/98765432',
		url: 'https://phixiv.net/en/artworks/98765432',
		label: 'Pixiv • 98765432',
	},
	{
		platform: 'Pixiv',
		input: 'https://www.pixiv.net/artworks/98765432',
		url: 'https://phixiv.net/en/artworks/98765432',
		label: 'Pixiv • 98765432',
	},
	{
		platform: 'Reddit',
		input: 'https://www.reddit.com/r/aww/comments/abc123/some_title/',
		url: 'https://rxddit.com/r/aww/comments/abc123',
		label: 'Reddit • aww - abc123',
	},
	{
		platform: 'TikTok',
		input: 'https://www.tiktok.com/@user.name/video/1234567890123456789 ',
		url: 'https://tnktok.com/t/1234567890123456789',
		label: 'TikTok • 1234567890123456789',
	},
	{
		platform: 'Tumblr',
		input: 'https://www.tumblr.com/blogname/123456789',
		url: 'https://www.tpmblr.com/blogname/123456789',
		label: 'Tumblr • blogname - 123456789',
	},
	{
		platform: 'Twitter',
		input: 'https://twitter.com/jack/status/20',
		url: 'https://fixupx.com/jack/status/20/en',
		label: 'Tweet • jack - 20',
	},
	{
		platform: 'Twitter',
		input: 'https://x.com/jack/status/20',
		url: 'https://fixupx.com/jack/status/20/en',
		label: 'Tweet • jack - 20',
	},
];

describe('getFixedLinkData', () => {
	for (const { platform, input, url, label } of cases) {
		it(`${platform}: ${input.trim()}`, () => {
			const match = firstMatch(platform, input);
			expect(match, 'regex should match the sample URL').toBeTruthy();
			const data = getFixedLinkData(platform, match);
			expect(data).toEqual({ url, label });
		});
	}

	it('Instagram stories cannot be rebuilt -> null', () => {
		const match = firstMatch('Instagram', 'https://www.instagram.com/stories/highlights12/');
		expect(match).toBeTruthy();
		expect(getFixedLinkData('Instagram', match)).toBeNull();
	});

	it('unknown platform -> null', () => {
		expect(getFixedLinkData('MySpace', ['x'])).toBeNull();
	});
});
