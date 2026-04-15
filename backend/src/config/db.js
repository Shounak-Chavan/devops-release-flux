import postgres from 'postgres';
import { config } from './env.js';

// Use your SUPABASE_DATABASE_URL here (ensure it uses the connection pooling port, usually 6543)
export const sql = postgres(config.DATABASE_URL, {
    max: 20, // Max connections in the pool
    idle_timeout: 30,
    connect_timeout: 10,
});