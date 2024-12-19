const mongoose = require('mongoose');
const mongoKey = process.env.DATABASE_TOKEN;
const Logger = require('../../functions/logging/logger');

module.exports = {
	init: () => {
		function mongoConnect() {
			return mongoose.connect(mongoKey);
		}

		mongoConnect();

		mongoose.connection.on('connected', () => {
			Logger.success('Connected to MongoDB');
		});

		mongoose.connection.on('disconnected', () => {
			Logger.error('Disconnected from MongoDB');
			setTimeout(() => {
				mongoConnect();
			}, 5000);
		});

		mongoose.connection.on('error', (err) => {
			Logger.error(`MongoDB Error: ${err}`);
		});

		mongoose.connection.on('reconnected', () => {
			Logger.info('Reconnected to MongoDB');
		});

		mongoose.connection.on('reconnectFailed', () => {
			Logger.error('Failed to reconnect to MongoDB');
		});
	},
};
