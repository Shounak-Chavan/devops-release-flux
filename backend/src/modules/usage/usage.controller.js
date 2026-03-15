import { redis } from '../../config/redis.js';
import { supabase } from '../../config/supabase.js';

/**
 * Retrieves the current month's evaluation count for a specific project.
 * Reads directly from the high-speed Redis counter.
 * @async
 * @function getProjectUsage
 */
export const getProjectUsage = async (req, res) => {
    try {
        const { projectId } = req.params;
        const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
        const usageKey = `usage:${projectId}:${currentMonth}`;

        // 1. Verify the project belongs to the requesting user
        const { data: project, error } = await supabase
            .from('projects')
            .select('id')
            .eq('id', projectId)
            .eq('owner_id', req.user.id)
            .single();

        if (error || !project) {
            return res.status(403).json({ error: 'Unauthorized to view this project.' });
        }

        // 2. Fetch the live count from Redis
        const countString = await redis.get(usageKey);
        const count = countString ? parseInt(countString, 10) : 0;

        // Note: For Beta, everyone is on the free plan with a 10M limit [cite: 169, 489]
        const planLimit = 10000000; 

        res.status(200).json({ 
            month: currentMonth,
            evaluations: count,
            limit: planLimit,
            percentageUsed: ((count / planLimit) * 100).toFixed(2)
        });

    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to fetch usage stats.' });
    }
};