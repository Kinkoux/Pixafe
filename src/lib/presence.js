import { getSupabase } from './supabase.js';

/**
 * Realtime Presence wrapper. Phase 7 fills in the join/leave/sync handlers and
 * the avatar-rendering pipeline. Phase 0 ships the shape only.
 *
 * Presence payload per user:
 *   {
 *     userId: string,
 *     locationId: string,        // which location they're in
 *     seatIndex: number,         // which seat slot in that location
 *     customization: object,     // skin/hair/outfit/accessory/pet
 *     status: string,            // 'in flow' | 'on break' | 'reading' | 'afk' | custom
 *     station: string | null,    // optionally broadcast for room "now playing"
 *     emote: string | null,      // transient — ☕ 📚 ✨ 😴
 *   }
 */

export function joinRoom(roomCode, initialPayload, handlers = {}) {
  const supabase = getSupabase();
  if (!supabase) {
    // Offline scaffold mode: synthetic channel that just echoes the user's own payload.
    let payload = initialPayload;
    queueMicrotask(() => handlers.onSync?.({ [payload.userId]: [payload] }));
    return {
      track(next) {
        payload = { ...payload, ...next };
        handlers.onSync?.({ [payload.userId]: [payload] });
      },
      leave() {},
      isOffline: true,
    };
  }

  const channel = supabase.channel(`room:${roomCode}`, {
    config: { presence: { key: initialPayload.userId } },
  });

  channel
    .on('presence', { event: 'sync' }, () => handlers.onSync?.(channel.presenceState()))
    .on('presence', { event: 'join' }, ({ newPresences }) => handlers.onJoin?.(newPresences))
    .on('presence', { event: 'leave' }, ({ leftPresences }) => handlers.onLeave?.(leftPresences))
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(initialPayload);
      }
    });

  return {
    track: (next) => channel.track({ ...initialPayload, ...next }),
    leave: () => supabase.removeChannel(channel),
    isOffline: false,
  };
}
