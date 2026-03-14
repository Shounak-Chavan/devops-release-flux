import { Redis } from '@upstash/redis';
import { config } from './env.js';

if (!config.REDIS_URL || !config.REDIS_TOKEN) {
    console.warn(' Redis credentials are missing. Caching will not work.');
}

/**
 * The initialized Upstash Redis client instance.
 * Used for high-speed caching of feature flag evaluations.
 * * @constant
 * @type {import('@upstash/redis').Redis}
 */
export const redis = new Redis({
    url: config.REDIS_URL,
    token: config.REDIS_TOKEN,
});

/**
 * Helper function to test the Redis connection on startup.
 * * @async
 * @function testRedisConnection
 * @returns {Promise<void>}
 */
export const testRedisConnection = async () => {
    try {
        await redis.set('health_check', 'Redis is working!');
        const val = await redis.get('health_check');
        console.log(` Redis client initialized successfully: ${val}`);
    } catch (error) {
        console.error(' Failed to connect to Redis:', error.message);
    }
};