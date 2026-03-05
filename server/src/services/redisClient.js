// server/src/services/redisClient.js
import { createClient } from 'redis';

/**
 * Initializes and configures the Redis client for the high-throughput Evaluation Plane.
 * Uses the REDIS_URL from the environment or defaults to the local Docker container port.
 */
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Event listeners for observability
redisClient.on('error', (err) => console.error('Redis Client Error:', err));
redisClient.on('connect', () => console.log('Successfully connected to Redis'));
redisClient.on('ready', () => console.log('Redis client is ready to accept commands'));
redisClient.on('end', () => console.log('Redis connection closed'));

// Self-invoking async function to establish the connection immediately upon import
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      await redisClient.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
    }
  })();
}

export default redisClient;