const { Schema, model } = require('mongoose');

const userChoiceSchema = new Schema({
	userId: {
		type: String,
		required: true,
		unique: true,
	},
	autoLinkFix: {
		type: Boolean,
		required: true,
		default: true,
	},
});

module.exports = model('userChoice', userChoiceSchema);
