import { Redis } from 'ioredis'; // (Or your Upstash Redis client)

// Use your existing Upstash Redis URL from your .env file
const upstashUrl = process.env.UPSTASH_REDIS_URL; 

// 1. The main client for Cache-Aside logic and Publishing
export const redis = new Redis(upstashUrl);

// 2. The dedicated client strictly for Subscribing (SSE)
export const redisSubscriber = new Redis(upstashUrl);

// Optional: Add error logging
redis.on('error', (err) => console.error('Redis Client Error', err));
redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));

// 3. The connection tester used in server.js
export const testRedisConnection = async () => {
    try {
        await redis.ping();
        console.log('✅ Connected to Upstash Redis');
    } catch (error) {
        console.error('❌ Upstash Redis connection failed:', error.message);
    }
};