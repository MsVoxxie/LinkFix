import { describe, it, expect } from 'vitest';
import servicesPkg from '../config/services.js';

const { serviceData } = servicesPkg;

function matches(platform, text) {
	const entry = serviceData.find((s) => s.platform === platform);
	entry.regex.lastIndex = 0;
	return [...text.matchAll(entry.regex)];
}

const shouldMatch = {
	Bsky: [
		'https://bsky.app/profile/renc0.bsky.social/post/3muh65culv22v',
		'https://bsky.app/profile/@renc0.bsky.social/post/3muh65culv22v',
		'https://www.bsky.app/profile/did:plc:abc123/post/3kabc',
	],
	FurAffinity: ['https://www.furaffinity.net/view/12345678', 'https://www.furaffinity.net/view/1/'],
	Instagram: ['https://instagram.com/p/AbC1/', 'https://www.instagram.com/tv/Zz9/', 'https://www.instagram.com/reel/Q_-1/?igsh=abc'],
	Pixiv: ['https://www.pixiv.net/en/artworks/98765432', 'https://www.pixiv.net/artworks/1'],
	Reddit: ['https://www.reddit.com/r/aww/comments/abc123/title/', 'https://reddit.com/r/aww/s/xyz789'],
	TikTok: ['https://www.tiktok.com/@user/video/1234567890123456789', 'https://vm.tiktok.com/ZM8abcDEF/'],
	Tumblr: ['https://www.tumblr.com/blog-name/123456789', 'https://tumblr.com/staff/987654321/some-slug'],
	Twitter: ['https://twitter.com/jack/status/20', 'https://x.com/jack/status/20', 'https://nitter.net/jack/status/20?s=21'],
};

const shouldNotMatch = {
	Bsky: ['https://bsky.app/profile/alice.bsky.social', 'https://example.com/post/abc'],
	FurAffinity: ['https://www.furaffinity.net/user/someone'],
	Instagram: ['https://instagram.com/someuser', 'https://instagram.com/'],
	Pixiv: ['https://www.pixiv.net/users/12345'],
	Reddit: ['https://www.reddit.com/r/aww/', 'https://www.reddit.com/user/someone'],
	Tumblr: ['https://blog.tumblr.com/', 'https://www.tumblr.com/blog-name'],
	Twitter: ['https://twitter.com/jack', 'https://x.com/home'],
};

describe('serviceData regexes - positive', () => {
	for (const [platform, urls] of Object.entries(shouldMatch)) {
		for (const url of urls) {
			it(`${platform} matches ${url}`, () => {
				expect(matches(platform, url).length).toBeGreaterThan(0);
			});
		}
	}
});

describe('serviceData regexes - negative', () => {
	for (const [platform, urls] of Object.entries(shouldNotMatch)) {
		for (const url of urls) {
			it(`${platform} does not match ${url}`, () => {
				expect(matches(platform, url).length).toBe(0);
			});
		}
	}
});

// ReDoS guard: pathological inputs must complete fast. Fails loud if a
// pattern regresses into catastrophic backtracking.
describe('serviceData regexes - ReDoS resistance', () => {
	const evil = [
		'https://www.tiktok.com/' + 'a/'.repeat(20000),
		'https://www.tiktok.com/@' + 'a'.repeat(50000) + '/video/',
		'https://www.reddit.com/r/' + 'a'.repeat(50000),
		'https://x.com/' + 'a'.repeat(50000) + '/status/',
		'https://bsky.app/profile/' + 'a'.repeat(50000) + '/post/',
		'h'.repeat(100000),
	];
	for (const { platform, regex } of serviceData) {
		it(`${platform} handles pathological input under 500ms`, () => {
			for (const input of evil) {
				const start = Date.now();
				regex.lastIndex = 0;
				void [...input.matchAll(regex)];
				expect(Date.now() - start).toBeLessThan(500);
			}
		});
	}
});
