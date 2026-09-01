import { describe, it, expect, vi } from 'vitest';
import linkFixPkg from '../functions/helpers/linkFixer.js';
import constantsPkg from '../config/constants.js';

const { sendFixMessages } = linkFixPkg;
const { EMOJI } = constantsPkg;

// A stand-in for a message the bot has sent: it can be replied to, reacted to,
// and (for the last message in a batch) collect a removal reaction.
function fakeSent(label) {
	return {
		label,
		reply: vi.fn(async (content) => fakeSent(`reply-of-${label}`)),
		react: vi.fn(async () => {}),
		createReactionCollector: vi.fn(() => ({ on: vi.fn() })),
		delete: vi.fn(async () => {}),
	};
}

// A stand-in for the user's original message.
function fakeMessage({ reference = null, referencedMessage = undefined, replyThrows = false } = {}) {
	const channelSend = vi.fn(async (content) => fakeSent('channel-send'));
	return {
		author: '<@user123>',
		reference,
		channel: {
			send: channelSend,
			messages: {
				fetch: vi.fn(async () => referencedMessage ?? null),
			},
		},
		reply: vi.fn(async (content) => {
			if (replyThrows) throw new Error('cannot reply');
			return fakeSent('message-reply');
		}),
	};
}

describe('sendFixMessages', () => {
	it('auto flow: replies to the original message with the prefixed line', async () => {
		const message = fakeMessage();
		const sent = await sendFixMessages(message, ['link1'], { linePrefix: EMOJI.BOT });

		expect(message.reply).toHaveBeenCalledWith(`${EMOJI.BOT} | link1`);
		expect(message.channel.send).not.toHaveBeenCalled();
		expect(sent).toHaveLength(1);
	});

	it('auto flow: falls back to a channel send when the first reply fails', async () => {
		const message = fakeMessage({ replyThrows: true });
		await sendFixMessages(message, ['link1'], { linePrefix: EMOJI.BOT });

		expect(message.channel.send).toHaveBeenCalledWith(`${EMOJI.BOT} | link1`);
	});

	it('chains every extra link as a reply to the previous sent message', async () => {
		const message = fakeMessage();
		const sent = await sendFixMessages(message, ['a', 'b', 'c'], { linePrefix: EMOJI.BOT });

		expect(message.reply).toHaveBeenCalledTimes(1);
		expect(sent).toHaveLength(3);
		expect(sent[0].reply).toHaveBeenCalledWith(`${EMOJI.BOT} | b`);
		expect(sent[1].reply).toHaveBeenCalledWith(`${EMOJI.BOT} | c`);
	});

	it('falls back to a channel send when chaining a reply fails', async () => {
		const message = fakeMessage();
		const firstSent = fakeSent('first');
		firstSent.reply.mockRejectedValueOnce(new Error('cannot reply'));
		message.reply.mockResolvedValueOnce(firstSent);

		await sendFixMessages(message, ['a', 'b'], { linePrefix: EMOJI.BOT });

		expect(message.channel.send).toHaveBeenCalledWith(`${EMOJI.BOT} | b`);
	});

	it('only offers batch removal on the final message', async () => {
		const message = fakeMessage();
		const sent = await sendFixMessages(message, ['a', 'b'], { linePrefix: EMOJI.BOT });

		// allowRemove reacts with the wastebasket on whichever message it is given
		expect(sent[1].react).toHaveBeenCalledWith('🚮');
		expect(sent[0].react).not.toHaveBeenCalledWith('🚮');
	});

	it('manual flow: prefixes the first line and replies to the referenced message', async () => {
		const referenced = fakeSent('referenced');
		const message = fakeMessage({ reference: { messageId: '42' }, referencedMessage: referenced });
		const buildFirstContent = (line) => `From ${message.author}\noriginal text\n${line}`;

		await sendFixMessages(message, ['link1'], { linePrefix: EMOJI.MEMBER, buildFirstContent, replyToReference: true });

		expect(message.channel.messages.fetch).toHaveBeenCalledWith('42');
		expect(referenced.reply).toHaveBeenCalledWith(`From <@user123>\noriginal text\n${EMOJI.MEMBER} | link1`);
		expect(message.reply).not.toHaveBeenCalled();
	});

	it('manual flow: replies to the author when there is no reference', async () => {
		const message = fakeMessage({ reference: null });
		const buildFirstContent = (line) => `From ${message.author}\n${line}`;

		await sendFixMessages(message, ['link1'], { linePrefix: EMOJI.MEMBER, buildFirstContent, replyToReference: true });

		expect(message.reply).toHaveBeenCalledWith(`From <@user123>\n${EMOJI.MEMBER} | link1`);
	});

	it('manual flow: falls back to the author when the referenced message cannot be fetched', async () => {
		const message = fakeMessage({ reference: { messageId: '42' }, referencedMessage: null });
		const buildFirstContent = (line) => `From ${message.author}\n${line}`;

		await sendFixMessages(message, ['link1'], { linePrefix: EMOJI.MEMBER, buildFirstContent, replyToReference: true });

		expect(message.channel.messages.fetch).toHaveBeenCalledWith('42');
		expect(message.reply).toHaveBeenCalledWith(`From <@user123>\n${EMOJI.MEMBER} | link1`);
	});
});
