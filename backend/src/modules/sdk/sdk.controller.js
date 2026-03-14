import { supabase } from '../../config/supabase.js';
import { redis } from '../../config/redis.js';

/**
 * High-performance endpoint for the SDK to fetch all flag states for a project.
 * Implements a Cache-Aside pattern using Redis to ensure sub-500ms responses.
 * @async
 * @function getFlagsForSdk
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 */
export const getFlagsForSdk = async (req, res) => {
    try {
        const projectId = req.projectId; // Attached by requireApiKey middleware
        const cacheKey = `project_flags:${projectId}`;

        // 1. Check Redis Cache First (High Speed)
        const cachedFlags = await redis.get(cacheKey);
        
        if (cachedFlags) {
            return res.status(200).json({ source: 'cache', data: cachedFlags });
        }

        // 2. Cache Miss: Fetch from Supabase (Slower)
        const { data: flags, error } = await supabase
            .from('feature_flags')
            .select('name, status')
            .eq('project_id', projectId);

        if (error) throw error;

        // Convert array to a simple key-value object for the SDK (e.g., { "upi-payments": true })
        const flagMap = flags.reduce((acc, flag) => {
            acc[flag.name] = flag.status;
            return acc;
        }, {});

        // 3. Save to Redis Cache for future requests (Expire after 1 hour as a safety net)
        await redis.set(cacheKey, flagMap, { ex: 3600 });

        res.status(200).json({ source: 'database', data: flagMap });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to evaluate flags.' });
    }
};