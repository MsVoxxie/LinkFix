const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

// Pretty, human-readable lines in development; structured JSON in production.
const log = pino(
	isProduction
		? { level: process.env.LOG_LEVEL || 'info' }
		: {
				level: process.env.LOG_LEVEL || 'debug',
				transport: {
					target: 'pino-pretty',
					options: { translateTime: 'SYS:standard', ignore: 'pid,hostname' },
				},
			},
);

// Keep the original Logger surface so existing call sites are unchanged.
// - success: an info-level line tagged for the "things went right" case
// - banner:  printed straight to stdout, for ascii art like the loader tables
module.exports = {
	info: (message) => log.info(message),
	warn: (message) => log.warn(message),
	error: (message) => log.error(message),
	success: (message) => log.info({ success: true }, message),
	banner: (message) => console.log(message),
};
