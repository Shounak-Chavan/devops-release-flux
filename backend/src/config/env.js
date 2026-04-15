import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application environment configuration object.
 * Centralizes all environment variables for the FeatureFlow backend.
 * * @constant
 * @type {Object}
 * @property {number} PORT - The port on which the Express server will run.
 * @property {string} NODE_ENV - The current environment (development, staging, production).
 * @property {string} SUPABASE_URL - The URL for the Supabase instance.
 * @property {string} SUPABASE_ANON_KEY - The Anon for the Supabase instance.
 * @property {string} REDIS_URL - The upstash URL for redis instance.
 * @property {string} REDIS_TOKEN - The redis secret key
 * @property {String} DATABASE_URL - The Supabase db URL.
 * @property {String} RESEND_API_KEY - The API key for the Resend instance.
 * @property {String} FRONTEND_URL - The frontend URL for CORS. 
 */
export const config = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || '',    
    REDIS_URL : process.env.UPSTASH_REDIS_URL || '',  
    REDIS_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || '' ,
    DATABASE_URL: process.env.DATABASE_URL || '' ,
    RESEND_API_KEY: process.env.RESEND_API_KEY || '',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};
