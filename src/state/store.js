/**
 * Tiny pub-sub store. Vanilla JS; no framework. Phases 1+ subscribe to slices
 * for UI updates and presence broadcasts.
 */

const initialState = {
  user: null,                // { id, isAnonymous, offline? }
  room: null,                // { code, hostUserId? }
  locationId: 'cafe',
  stationId: 'cafe-buzz',
  customization: null,       // filled from profiles row in Phase 3
  pomodoro: { mode: 'idle', remainingMs: 0, cyclesCompleted: 0 },
  status: 'in flow',
  stats: { totalFocusMinutes: 0, sessions: 0, streak: 0, coffees: 0 },
  reducedMotion: false,
};

let state = { ...initialState };
const listeners = new Set();

export const store = {
  get() {
    return state;
  },
  set(patch) {
    state = { ...state, ...patch };
    for (const cb of listeners) cb(state);
  },
  subscribe(cb) {
    listeners.add(cb);
    cb(state);
    return () => listeners.delete(cb);
  },
  reset() {
    state = { ...initialState };
    for (const cb of listeners) cb(state);
  },
};
