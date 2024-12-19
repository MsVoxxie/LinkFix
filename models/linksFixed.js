const { Schema, model } = require('mongoose');

const linksFixedSchema = new Schema({
	linksFixed: {
		type: Number,
		required: true,
		default: 0,
	},
});

module.exports = model('linksFixed', linksFixedSchema);
