import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] MISSING ENV VARS — Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
    `  URL: ${supabaseUrl || '(not set)'}\n` +
    `  KEY: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 12) + '...' : '(not set)'}`
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
