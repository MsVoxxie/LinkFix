// One-off migration: stamp the existing global links-fixed counter document with
// `key: 'global'` so it matches the new singleton filter (see models/linksFixed.js).
//
// Run once, before deploying the Phase 2 changes:
//   node scripts/migrate-linksFixed-key.js
//
// Safe to run multiple times. If no unkeyed document exists it does nothing.
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const Logger = require('../functions/logging/logger');

(async () => {
	try {
		await mongoose.connect(process.env.DATABASE_TOKEN);
		const collection = mongoose.connection.collection('linksfixeds');

		const unkeyed = await collection.find({ key: { $exists: false } }).toArray();
		if (unkeyed.length === 0) {
			Logger.info('No unkeyed linksFixed document found. Nothing to do.');
		} else if (unkeyed.length === 1) {
			await collection.updateOne({ _id: unkeyed[0]._id }, { $set: { key: 'global' } });
			Logger.success(`Stamped linksFixed document ${unkeyed[0]._id} with key 'global' (count: ${unkeyed[0].linksFixed}).`);
		} else {
			// Multiple legacy docs: merge their counts into one keyed document.
			const total = unkeyed.reduce((sum, doc) => sum + (doc.linksFixed ?? 0), 0);
			await collection.deleteMany({ key: { $exists: false } });
			await collection.updateOne({ key: 'global' }, { $set: { key: 'global' }, $inc: { linksFixed: total } }, { upsert: true });
			Logger.warn(`Merged ${unkeyed.length} legacy linksFixed documents into key 'global' (total added: ${total}).`);
		}
	} catch (error) {
		Logger.error(`Migration failed: ${error?.stack ?? error}`);
		process.exitCode = 1;
	} finally {
		await mongoose.disconnect();
	}
})();
