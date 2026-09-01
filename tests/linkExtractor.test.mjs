import { describe, it, expect } from 'vitest';
import extractorPkg from '../functions/helpers/linkExtractor.js';
import mapperPkg from '../functions/helpers/fixedLinkMapper.js';

const { extractLinks } = extractorPkg;
const { getFixedLinkData } = mapperPkg;

describe('extractLinks', () => {
	it('returns [] when no supported link is present', () => {
		expect(extractLinks('just some text https://example.com/foo')).toEqual([]);
	});

	it('finds a single link with its platform, emoji and match data', () => {
		const [hit, ...rest] = extractLinks('see https://x.com/jack/status/20 !');
		expect(rest).toHaveLength(0);
		expect(hit.platform).toBe('Twitter');
		expect(hit.emoji).toMatch(/^<:twx:\d+>$/);
		expect(hit.data[1]).toBe('jack');
		expect(hit.data[2]).toBe('20');
	});

	it('match data feeds straight into getFixedLinkData', () => {
		const [hit] = extractLinks('https://www.tiktok.com/@user/video/1234567890123456789 ');
		expect(getFixedLinkData(hit.platform, hit.data)).toEqual({
			url: 'https://tnktok.com/t/1234567890123456789',
			label: 'TikTok • 1234567890123456789',
		});
	});

	it('finds multiple links across platforms, grouped in serviceData order', () => {
		const text = 'https://twitter.com/a/status/1 and https://www.pixiv.net/en/artworks/2 and https://x.com/b/status/3';
		const hits = extractLinks(text);
		expect(hits.map((h) => h.platform)).toEqual(['Pixiv', 'Twitter', 'Twitter']);
	});

	it('is stable across repeated calls (no leaked regex lastIndex)', () => {
		const text = 'https://x.com/jack/status/20';
		expect(extractLinks(text)).toHaveLength(1);
		expect(extractLinks(text)).toHaveLength(1);
		expect(extractLinks(text)).toHaveLength(1);
	});
});
