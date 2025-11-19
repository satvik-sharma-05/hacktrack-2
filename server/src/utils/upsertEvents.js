// src/utils/upsertEvents.js
import Event from '../models/Event.js';
import CacheMeta from '../models/CacheMeta.js';
import { normalizeEvent } from './normalizeEvent.js';
import { normalizeMLHEvent } from './normalizeMLHEvent.js';

export async function upsertEvents(platform, rawEvents) {
    try {
        console.log(`🔄 Upserting ${rawEvents.length} events for platform: ${platform}`);

        const bulkOps = rawEvents.map(raw => {
            try {
                // Use different normalization for MLH
                let doc;
                if (platform === 'mlh') {
                    doc = normalizeMLHEvent(raw);
                } else {
                    doc = normalizeEvent({ ...raw, platform, type: 'api' });
                }

                if (!doc || !doc.title || !doc.start) {
                    console.warn('⚠️ Skipping event missing title or start date:', doc?.title);
                    return null;
                }

                // Use _key for MLH, externalId for others
                const identifier = platform === 'mlh' ? doc._key : doc.externalId;
                const filter = platform === 'mlh' 
                    ? { _key: identifier }
                    : { platform, externalId: identifier };

                // Create update document
                const updateDoc = { ...doc };
                
                // Remove non-schema fields for non-MLH events
                if (platform !== 'mlh') {
                  delete updateDoc._key;
                  delete updateDoc.mlhEventId;
                  delete updateDoc.diversityEvent;
                  delete updateDoc.highSchoolEvent;
                  // ... remove other MLH-specific fields
                }

                Object.keys(updateDoc).forEach(key => {
                    if (updateDoc[key] === undefined) delete updateDoc[key];
                });

                return {
                    updateOne: {
                        filter,
                        update: { $set: updateDoc },
                        upsert: true
                    }
                };
            } catch (error) {
                console.error('❌ Error processing event:', error, raw);
                return null;
            }
        }).filter(op => op !== null);

        if (bulkOps.length === 0) {
            console.log('⚠️ No valid operations to perform');
            return;
        }

        console.log(`📝 Executing ${bulkOps.length} bulk operations`);
        console.log("🧾 First 3 filters:", bulkOps.slice(0, 3).map(op => op.updateOne.filter));

        const result = await Event.bulkWrite(bulkOps, { ordered: false });
        console.log(`✅ Database updated: ${result.upsertedCount} new, ${result.modifiedCount} modified`);

        // ✅ Update cache metadata
        await CacheMeta.findOneAndUpdate(
            { source: platform },
            { $set: { lastFetched: new Date(), totalEvents: rawEvents.length } },
            { upsert: true }
        );

        console.log(`✅ Cache updated for platform: ${platform}`);

    } catch (error) {
        console.error('❌ Error in upsertEvents:', error);
        throw error;
    }
}