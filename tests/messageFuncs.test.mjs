import { describe, it, expect } from 'vitest';
import { PermissionFlagsBits } from 'discord.js';
import msgFuncsPkg from '../functions/helpers/messageFuncs.js';

const { msgSpoiled, embedHasContent, botHasPermissions } = msgFuncsPkg;

describe('msgSpoiled', () => {
	it('true for suppressed link embed <https://...>', () => {
		expect(msgSpoiled('check <https://x.com/jack/status/20>')).toBe(true);
	});
	it('true for spoilered link ||https://...||', () => {
		expect(msgSpoiled('||https://x.com/jack/status/20||')).toBe(true);
	});
	it('true for any spoiler text', () => {
		expect(msgSpoiled('a ||spoiler|| b')).toBe(true);
	});
	it('false for a plain visible link', () => {
		expect(msgSpoiled('hello https://x.com/jack/status/20')).toBe(false);
	});
	it('false for empty string', () => {
		expect(msgSpoiled('')).toBe(false);
	});
});

describe('embedHasContent', () => {
	it('false for empty embed', () => {
		expect(embedHasContent({})).toBe(false);
	});
	it('true when description present', () => {
		expect(embedHasContent({ description: 'hi' })).toBe(true);
	});
	it('true when thumbnail present', () => {
		expect(embedHasContent({ thumbnail: { url: 'x' } })).toBe(true);
	});
	it('true for a real-sized image', () => {
		expect(embedHasContent({ image: { height: 100, width: 100 } })).toBe(true);
	});
	it('false for a 0x0 placeholder image', () => {
		expect(embedHasContent({ image: { height: 0, width: 0 } })).toBe(false);
	});
});

// Minimal Discord message stand-in: only what botHasPermissions touches.
function fakeMessage(grantedBits) {
	const granted = new Set(grantedBits);
	const me = Symbol('me');
	return {
		guild: { members: { me } },
		channel: {
			permissionsFor(member) {
				expect(member).toBe(me);
				return { has: (bit) => granted.has(bit) };
			},
		},
	};
}

describe('botHasPermissions', () => {
	it('throws when no permissions requested', () => {
		expect(() => botHasPermissions(fakeMessage([]), [])).toThrow('No permissions provided');
	});
	it('throws when no message given', () => {
		expect(() => botHasPermissions(null, [PermissionFlagsBits.ViewChannel])).toThrow('No message provided');
	});
	it('splits granted vs missing and maps to names', () => {
		const req = [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks];
		const msg = fakeMessage([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks]);
		const res = botHasPermissions(msg, req);
		expect(res.passedPermissions).toEqual(['ViewChannel', 'EmbedLinks']);
		expect(res.failedPermissions).toEqual(['SendMessages']);
	});
});
