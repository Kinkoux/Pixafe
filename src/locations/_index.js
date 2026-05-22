import { cafe } from './cafe.js';
import { home } from './home.js';
import { library } from './library.js';
import { rooftop } from './rooftop.js';

/**
 * Location shape contract — every entry must satisfy:
 *
 *   {
 *     id: string,                                 // stable id used by Presence payloads
 *     name: string,                               // human-friendly label
 *     drawBackground(ctx, t): void,               // floor + walls + back furniture (under player)
 *     drawForeground?(ctx, t): void,              // optional: things drawn ABOVE the player
 *                                                 //   (hanging lamps, top of tall furniture, etc.)
 *     spawn: { x, y },                            // where the player appears on entry
 *     colliders: Array<{ x, y, w, h }>,           // AABB rects the player can't walk through
 *     seats: Array<{ x: number, y: number }>,    // avatar slot coords (Phase 7 presence)
 *     defaultStation: string,                     // station id used until user overrides
 *     lightingTint: null | { r, g, b, a },        // overlay applied by day/night cycle
 *   }
 *
 * Phase 2 fills in the real cafe.
 * Phase 5 fills in Home / Library / Rooftop.
 */
export const LOCATIONS = [cafe, home, library, rooftop];

export const locationById = (id) => LOCATIONS.find((l) => l.id === id);
