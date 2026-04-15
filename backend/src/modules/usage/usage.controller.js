import { sql } from '../../config/db.js';
import { redis } from '../../config/redis.js';

export const trackUsage = async (req, res) => {
    try {
        // 1. Fix the ID extraction from middleware
        const projectId = req.project.id; 
        const { evaluations } = req.body; 

        if (!evaluations || typeof evaluations !== 'object') {
            return res.status(400).json({ error: 'Invalid evaluations payload' });
        }

        const entries = Object.entries(evaluations);
        if (entries.length === 0) return res.status(202).send();

        // 2. Map the batch into Redis events
        // We store as: projectId | flagId | count
        const pipeline = redis.pipeline();
        
        for (const [flagId, count] of entries) {
            const event = JSON.stringify({
                projectId,
                flagId,
                count, // Important: we need the volume!
                timestamp: new Date().toISOString()
            });
            pipeline.lpush('usage_events_buffer', event);
        }

        // 3. Execute all pushes in one go
        await pipeline.exec();

        // 202 Accepted: "We got it, we will process it shortly"
        res.status(202).send();
    } catch (error) {
        console.error('Usage track error:', error);
        res.status(500).json({ error: 'Failed to track usage' });
    }
};

/**
 * Retrieves the usage summary and 30-day historical data for a project.
 * @async
 * @function getProjectUsageSummary
 */
export const getProjectUsageSummary = async (req, res) => {
    try {
        const { projectId } = req.params;

        // 1. Get the total evaluations for the current project
        const totalResult = await sql`
            SELECT SUM(count) as total
            FROM usage_logs ul
            JOIN feature_flags ff ON ul.flag_id = ff.id
            WHERE ff.project_id = ${projectId}
        `;
        const totalEvaluations = parseInt(totalResult[0]?.total || 0);

        // 2. Generate the 30-Day Time-Series Data for Recharts
        // We use a CTE (WITH clause) to generate a perfect 30-day calendar series.
        // This ensures the graph doesn't have "missing days" if there were 0 evaluations.
        const historyResult = await sql`
            WITH last_30_days AS (
                SELECT generate_series(CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE, '1 day'::interval)::date AS calc_date
            )
            SELECT 
                TO_CHAR(d.calc_date, 'Mon DD') as date,
                COALESCE(SUM(ul.count), 0)::int as evaluations
            FROM last_30_days d
            LEFT JOIN usage_logs ul ON d.calc_date = ul.evaluation_date
            LEFT JOIN feature_flags ff ON ul.flag_id = ff.id AND ff.project_id = ${projectId}
            GROUP BY d.calc_date
            ORDER BY d.calc_date ASC;
        `;

        // 3. Format the response to perfectly match the Frontend's expected interface
        const freeTierLimit = 10000000; // 10M evaluations per month
        const percentageUsed = ((totalEvaluations / freeTierLimit) * 100).toFixed(3);

        res.status(200).json({
            month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
            evaluations: totalEvaluations,
            limit: freeTierLimit,
            percentageUsed: percentageUsed,
            history: historyResult // Array of { date: "Apr 12", evaluations: 1500 }
        });

    } catch (error) {
        console.error('Failed to fetch project usage:', error);
        res.status(500).json({ error: 'Failed to fetch usage statistics.' });
    }
};