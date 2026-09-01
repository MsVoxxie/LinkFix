import { describe, it, expect } from 'vitest';
import Logger from '../functions/logging/logger.js';

describe('Logger', () => {
	it('exposes the expected surface', () => {
		for (const method of ['info', 'warn', 'error', 'success', 'banner']) {
			expect(typeof Logger[method]).toBe('function');
		}
	});

	it('accepts strings and Error objects without throwing', () => {
		expect(() => Logger.info('hello')).not.toThrow();
		expect(() => Logger.success('done')).not.toThrow();
		expect(() => Logger.warn('careful')).not.toThrow();
		expect(() => Logger.error(new Error('boom'))).not.toThrow();
	});
});
