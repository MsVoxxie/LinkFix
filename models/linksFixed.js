const { Schema, model } = require('mongoose');

// This collection holds a single global counter document. The `key` field pins
// it to one row so concurrent upserts cannot silently create duplicates.
const SINGLETON_FILTER = { key: 'global' };

const linksFixedSchema = new Schema({
	key: {
		type: String,
		required: true,
		unique: true,
		default: 'global',
	},
	linksFixed: {
		type: Number,
		required: true,
		default: 0,
	},
});

const LinksFixed = model('linksFixed', linksFixedSchema);

module.exports = LinksFixed;
module.exports.SINGLETON_FILTER = SINGLETON_FILTER;
