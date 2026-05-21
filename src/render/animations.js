/**
 * Animation helpers shared across renderers. Phase 4 fills these in with the
 * character reactions; Phase 8 adds the day/night lighting curve and weather
 * particle emitters. Phase 0 ships the math shape only.
 */

/** Map elapsed ms to a smooth 0..1..0 bob loop with given period (ms). */
export function bob(t, periodMs = 1800) {
  const phase = (t % periodMs) / periodMs;
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}

/** Day/night tint curve. Returns an {r,g,b,a} overlay color for current real-world time. */
export function lightingForHour(hour) {
  // Phase 8 — tweak curves per playtesting.
  if (hour < 6 || hour >= 21) return { r: 20, g: 14, b: 50, a: 0.35 }; // night
  if (hour < 9) return { r: 240, g: 180, b: 120, a: 0.15 }; // sunrise
  if (hour < 17) return { r: 0, g: 0, b: 0, a: 0 }; // day
  if (hour < 20) return { r: 240, g: 140, b: 80, a: 0.2 }; // sunset
  return { r: 60, g: 40, b: 80, a: 0.25 }; // dusk
}

/** Map cumulative focus minutes to plant growth stage (Phase 4 growing-plant feature). */
export function plantStage(focusMinutes) {
  if (focusMinutes < 60) return 'sprout';
  if (focusMinutes < 300) return 'leafy';
  return 'flowering';
}
