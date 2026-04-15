import { supabase } from '../../config/supabase.js';
import { redis } from '../../config/redis.js';
import { addClient, removeClient } from '../../shared/utils/sse.js';

/**
 * Utility function to pause execution for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Helper function to fetch the complete ruleset for a project.
 * Implements Cache-Aside pattern WITH a Redis Lock to prevent Cache Stampedes.
 * @async
 * @param {string} projectId - The authenticated project ID.
 * @returns {Promise<Array>} The array of flags and their targeting rules.
 */
export const getEnvironmentRuleset = async (projectId) => {
    const cacheKey = `project_flags_rules:${projectId}`;
    const lockKey = `lock:project_flags_rules:${projectId}`;

    // 1. Check Redis Cache First (Fastest Path)
    let cachedData = await redis.get(cacheKey);
    if (cachedData) {
        return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
    }

    // 2. Cache Miss: Attempt to acquire an exclusive lock
    // 'nx: true' means "Set only if it doesn't exist". 
    // 'ex: 10' sets a 10-second safety expiration so the lock doesn't get stuck forever if the server crashes.
    const acquiredLock = await redis.set(lockKey, 'LOCKED','NX', 'EX', 10);

    if (acquiredLock) {
        try {
            // 3. Lock Acquired: We are the designated worker to fetch from Supabase
            const { data, error } = await supabase
                .from('feature_flags')
                .select(`
                    id, name, status,
                    targeting_rules ( attribute, operator, value, rollout_percentage )
                `)
                .eq('project_id', projectId);

            if (error) throw error;

            // 4. Save fresh data to Cache (expires in 1 hour)
            await redis.set(cacheKey, JSON.stringify(data), 'EX' , 3600);
            
            return data;
        } finally {
            // 5. CRITICAL: Always release the lock so future cache misses can execute safely
            await redis.del(lockKey);
        }
    } else {
        // 6. Lock NOT Acquired: Another request is currently querying Supabase.
        // Instead of querying the DB, we poll the cache every 50ms until the other worker finishes.
        let retries = 0;
        const maxRetries = 10; // Max wait time: 10 * 50ms = 500ms

        while (retries < maxRetries) {
            await sleep(50);
            
            cachedData = await redis.get(cacheKey);
            if (cachedData) {
                return typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
            }
            
            retries++;
        }

        // 7. Safety Fallback: If polling times out, throw an error
        throw new Error('Timeout waiting for ruleset cache to populate.');
    }
};

/**
 * REST Endpoint: Serves the complete ruleset to the SDK for local evaluation.
 * @async
 * @function fetchRuleset
 */
export const fetchRuleset = async (req, res) => {
    try {
        // FIXED: Using req.project.id
        const projectId = req.project.id; 
        const ruleset = await getEnvironmentRuleset(projectId);

        res.set('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
        
        res.status(200).json({ data: ruleset });
    } catch (error) {
        // FIXED: Using req.project?.id
        console.error(`[SDK] Failed to fetch ruleset for ${req.project?.id}:`, error);
        res.status(500).json({ error: 'Failed to fetch environment ruleset.' });
    }
};

/**
 * SSE Endpoint: Establishes a persistent connection to stream ruleset updates.
 * @async
 * @function streamRuleset
 */
export const streamRuleset = async (req, res) => {
    // FIXED: Using req.project.id
    const projectId = req.project.id;

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' 
    });

    res.write('event: ping\ndata: "connected"\n\n');

    try {
        const initialRuleset = await getEnvironmentRuleset(projectId);
        res.write(`data: ${JSON.stringify({ type: 'RULESET_SYNC', data: initialRuleset })}\n\n`);
    } catch (error) {
        console.error(`[SSE] Initial sync failed for ${projectId}:`, error);
    }

    addClient(projectId, res);

    req.on('close', () => {
        removeClient(projectId, res);
    });
};