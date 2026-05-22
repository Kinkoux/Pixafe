import { getSupabase, isOnline } from './supabase.js';

const LOCAL_USER_KEY = 'pixafe.local.user';
const LOCAL_NAME_KEY = 'pixafe.local.displayName';

/**
 * Anonymous sign-in. Phase 1 wires this into the splash screen.
 * Offline scaffold mode returns a synthetic user (persisted in localStorage
 * so reloading keeps the same identity) so the UI stays usable.
 */
export async function signInAnonymous() {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: getOrCreateLocalUser() };
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
  if (!supabase) return getStoredLocalUser();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Persist a display name. Online → stored as Supabase user metadata.
 * Offline → stored in localStorage so it survives reloads.
 */
export async function updateDisplayName(name) {
  const trimmed = String(name).trim();
  const supabase = getSupabase();
  if (!supabase) {
    localStorage.setItem(LOCAL_NAME_KEY, trimmed);
    return { displayName: trimmed };
  }
  const { error } = await supabase.auth.updateUser({
    data: { display_name: trimmed },
  });
  if (error) throw error;
  return { displayName: trimmed };
}

export async function getStoredDisplayName() {
  const supabase = getSupabase();
  if (!supabase) {
    return localStorage.getItem(LOCAL_NAME_KEY) || null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.user_metadata?.display_name ?? null;
}

function getOrCreateLocalUser() {
  const existing = getStoredLocalUser();
  if (existing) return existing;
  const user = {
    id: `local-${crypto.randomUUID()}`,
    isAnonymous: true,
    offline: true,
  };
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
  return user;
}

function getStoredLocalUser() {
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const authIsOnline = isOnline;
