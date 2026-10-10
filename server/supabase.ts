import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local explicitly since the server doesn't use Vite's loader
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables');
}

// We use the anon key for now. If service role key is available, use it to bypass RLS.
// For the purpose of backend operations, usually a SERVICE_ROLE_KEY is preferred.
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey;

export const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
  },
});
