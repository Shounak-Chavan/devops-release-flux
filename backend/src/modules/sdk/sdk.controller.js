import { supabase } from '../../config/supabase.js';
import { redis } from '../../config/redis.js';
import { evaluateRules } from './rulesEngine.js';

/**
 * High-performance endpoint for the SDK to evaluate flags against a user context.
 * Implements Cache-Aside pattern fetching both flags and rules to meet sub-500ms requirements.
 * @async
 * @function evaluateFlagsForContext
 * @param {import('express').Request} req - Express request object containing user context in the body.
 * @param {import('express').Response} res - Express response object.
 */
export const evaluateFlagsForContext = async (req, res) => {
    try {
        const projectId = req.projectId; // Attached by requireApiKey middleware
        const context = req.body.context || {}; // e.g., { userId: 'user_123', city: 'Mumbai' }
        const cacheKey = `project_flags_rules:${projectId}`;

        let flagsData;
        
        // 1. Check Redis Cache First
        const cachedData = await redis.get(cacheKey);
        
        if (cachedData) {
            // Upstash returns parsed JSON automatically, but we ensure it's handled correctly
            flagsData = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
        } else {
            // 2. Cache Miss: Fetch Flags AND Targeting Rules from Supabase
            const { data, error } = await supabase
                .from('feature_flags')
                .select(`
                    id, name, status,
                    targeting_rules ( attribute, operator, value, rollout_percentage )
                `)
                .eq('project_id', projectId);

            if (error) throw error;
            flagsData = data;
            
            // 3. Save to Redis Cache (expire after 1 hour)
            await redis.set(cacheKey, JSON.stringify(flagsData), { ex: 3600 });
        }

        // 4. Evaluate each flag against the provided user context
        const evaluatedFlags = flagsData.reduce((acc, flag) => {
            // If the base status is OFF on the dashboard, it is OFF for everyone
            if (!flag.status) {
                acc[flag.name] = false;
            } else {
                // If ON, pass it through the Rules Engine
                const isTargeted = evaluateRules(context, flag.targeting_rules, flag.id);
                acc[flag.name] = isTargeted;
            }
            return acc;
        }, {});

        res.status(200).json({ data: evaluatedFlags });
    } catch (error) {
        res.status(500).json({ error: error.message || 'Failed to evaluate flags.' });
    }
};