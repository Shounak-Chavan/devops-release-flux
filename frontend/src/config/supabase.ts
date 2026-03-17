import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables');
}

/**
 * The initialized Supabase client for the frontend.
 * Used for authentication and direct database queries if needed.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);