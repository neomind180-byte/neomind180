import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error(
        '❌ Supabase environment variables are missing. Please check your .env.local or Vercel settings.\n' +
        'Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
}

/**
 * Browser-side Supabase client using @supabase/ssr.
 *
 * Key difference from the old createClient():
 * - Uses cookies as the auth storage mechanism (not just localStorage)
 * - Syncs auth state with the server-side middleware
 * - When the middleware refreshes an expired JWT, this client picks up the fresh token automatically
 *
 * This is a singleton — importing it in multiple components returns the same instance.
 */
export const supabase = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
);