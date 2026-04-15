import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis } from '../../config/redis.js';

/**
 * Standard API Rate Limiter
 * Uses Redis to track IP request counts across all distributed instances.
 */
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
    
    // 🚀 NEW: Correctly configured for ioredis
    store: new RedisStore({
        // ioredis uses `.call()` to execute raw Redis commands
        sendCommand: (...args) => redis.call(...args),
    }),
});

/**
 * SDK Specific Rate Limiter (Allows higher throughput for client SDKs)
 */
export const sdkLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // Allow 1000 requests per minute for SDK polling/evaluations
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'SDK rate limit exceeded.' },
    
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
});