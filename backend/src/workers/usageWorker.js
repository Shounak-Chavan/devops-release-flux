import { redis } from '../config/redis.js';
import { sql } from '../config/db.js';

export const processUsageBuffer = async () => {
    const BATCH_SIZE = 5000;
    
    try {
        const items = await redis.lrange('usage_events_buffer', 0, BATCH_SIZE - 1);
        if (!items || items.length === 0) return;

        await redis.ltrim('usage_events_buffer', items.length, -1);

        const aggregated = {};
        const today = new Date().toISOString().split('T')[0];

        for (const item of items) {
            try {
                const event = typeof item === 'string' ? JSON.parse(item) : item;
                
                // Guard against undefined values
                if (!event.flagId || event.count === undefined) continue;

                // Create a unique key for aggregation: Flag + Date + Status
                // If your SDK doesn't send status yet, default to true
                const status = event.status !== undefined ? event.status : true;
                const key = `${event.flagId}_${today}_${status}`;

                if (!aggregated[key]) {
                    aggregated[key] = { 
                        flag_id: event.flagId, 
                        evaluation_date: today,
                        status: status,
                        count: 0 
                    };
                }
                aggregated[key].count += Number(event.count);

            } catch (e) {
                console.warn("⚠️ Skipping malformed event", item);
            }
        }

        const metricsToInsert = Object.values(aggregated);
        if (metricsToInsert.length === 0) return;

        // 🚀 The Upsert: ON CONFLICT must exactly match the UNIQUE constraint we just created
        await sql`
            INSERT INTO usage_logs ${ sql(metricsToInsert, 'flag_id', 'evaluation_date', 'status', 'count') }
            ON CONFLICT (flag_id, evaluation_date, status)
            DO UPDATE SET count = usage_logs.count + EXCLUDED.count;
        `;

        console.log(`✅ Synced ${metricsToInsert.length} metrics to DB.`);
    } catch (error) {
        console.error('❌ Failed to process usage buffer:', error.message);
    }
};

setInterval(processUsageBuffer, 15000);