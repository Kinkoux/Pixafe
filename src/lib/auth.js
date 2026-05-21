import { getSupabase, isOnline } from './supabase.js';

/**
 * Anonymous sign-in. Phase 1 wires this into the splash screen.
 * Offline scaffold mode returns a synthetic user so the UI stays usable.
 */
export async function signInAnonymous() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      user: { id: `local-${crypto.randomUUID()}`, isAnonymous: true, offline: true },
    };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.user) return { user: session.user };

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return { user: data.user };
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export const authIsOnline = isOnline;
