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
 *     drawBackground(ctx, t): void,               // pixel background (t = elapsed ms)
 *     seats: Array<{ x: number, y: number }>,    // avatar slot coords in logical px
 *     defaultStation: string,                     // station id used until user overrides
 *     lightingTint: null | { r, g, b, a },        // overlay applied by day/night cycle
 *   }
 *
 * Phase 2 fills in the real drawBackground for Cafe.
 * Phase 5 fills in Home / Library / Rooftop.
 */
export const LOCATIONS = [cafe, home, library, rooftop];

export const locationById = (id) => LOCATIONS.find((l) => l.id === id);
