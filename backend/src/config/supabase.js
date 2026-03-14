import { createClient } from '@supabase/supabase-js';
import { config } from './env.js';

/**
 * Validates that the required Supabase environment variables are present.
 * @throws {Error} If SUPABASE_URL or SUPABASE_ANON_KEY are missing.
 */
if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase credentials in environment variables.');
}

/**
 * The initialized Supabase client instance.
 * Use this to interact with the PostgreSQL database and Auth services.
 * * @constant
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

console.log(' Supabase client initialized successfully.');