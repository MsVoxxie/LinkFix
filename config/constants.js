// Tunable magic numbers and shared literals, kept in one place.

module.exports = {
	// How long a temporary error reaction stays on a message before it is removed (ms)
	ERROR_REACTION_LIFETIME_MS: 15000,

	// How long the "you can opt out" notice stays before it self-deletes (ms)
	OPT_OUT_NOTICE_LIFETIME_MS: 15000,

	// Reaction-collector windows (ms)
	MANUAL_FIX_COLLECTOR_MS: 90 * 1000,
	REMOVE_COLLECTOR_MS: 30 * 1000,

	// Percent chance (0-100) to surface occasional, noise-reducing notices
	CHANCE_TO_NOTIFY_MISSING_PERMS: 10,
	CHANCE_TO_INFORM_OPT_OUT: 10,

	// How long to wait for Discord to cache link embeds before fixing (ms)
	EMBED_CACHE_WAIT_MS: 1500,

	// How often to refresh the "links fixed" presence (ms)
	STATUS_REFRESH_MS: 5 * 60 * 1000,

	// Shared custom-emoji literals
	EMOJI: {
		MEMBER: '<:members_alt:1267698407573819432>',
		BOT: '<:bot_alt:1267698378117218344>',
		ERROR: '<:error:1318812498769481778>',
	},
};
