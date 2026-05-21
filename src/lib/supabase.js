import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

/**
 * Returns a singleton Supabase client. Returns null if env vars are missing,
 * so Phase 0 / offline development still boots cleanly with a placeholder UI.
 */
export function getSupabase() {
  if (client) return client;
  if (!url || !anonKey) {
    console.warn(
      '[pixafé] Supabase env vars missing — running in offline scaffold mode.\n' +
        'Copy .env.example to .env and fill VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.'
    );
    return null;
  }
  client = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 8 } },
  });
  return client;
}

export const isOnline = () => Boolean(url && anonKey);
