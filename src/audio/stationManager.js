/**
 * Station shape contract — every entry under src/audio/stations/* must satisfy:
 *
 *   {
 *     id: string,                                       // stable id (cafe, home, library use this)
 *     name: string,                                     // human-friendly label
 *     start(ctx: AudioContext, dest: AudioNode): void,  // build the node graph, connect to dest
 *     stop(): void,                                     // tear down all nodes; release timers
 *     setVolume(v: number): void,                       // 0..1, applied to station gain
 *   }
 *
 * The manager owns the AudioContext and a shared master gain node, and crossfades
 * between stations when switch() is called. Phase 6 implements the real station modules
 * and the crossfade logic; for Phase 0 it's a stub that holds the registry.
 */

import { rainyDay } from './stations/rainyDay.js';
import { cafeBuzz } from './stations/cafeBuzz.js';
import { vinylLounge } from './stations/vinylLounge.js';
import { fireside } from './stations/fireside.js';
import { brownNoise } from './stations/brownNoise.js';
import { forestWalk } from './stations/forestWalk.js';
import { oceanTide } from './stations/oceanTide.js';
import { jazzBar } from './stations/jazzBar.js';

const REGISTRY = [
  rainyDay,
  cafeBuzz,
  vinylLounge,
  fireside,
  brownNoise,
  forestWalk,
  oceanTide,
  jazzBar,
];

let ctx = null;
let masterGain = null;
let current = null;

export const stationManager = {
  list() {
    return REGISTRY.map(({ id, name }) => ({ id, name }));
  },

  get(id) {
    return REGISTRY.find((s) => s.id === id);
  },

  /** Lazy-init the AudioContext on first interaction (browser autoplay rules). */
  ensureContext() {
    if (!ctx) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctor();
      masterGain = ctx.createGain();
      masterGain.gain.value = 0.7;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  },

  /** Phase 6 implements smooth crossfade. Stub: just remember the choice. */
  switch(id) {
    const station = this.get(id);
    if (!station) return;
    if (current) current.stop?.();
    current = station;
    // Phase 6: station.start(ctx, masterGain) once real audio is wired up.
  },

  setMasterVolume(v) {
    if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
  },
};
