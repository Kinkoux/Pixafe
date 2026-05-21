/**
 * Phase 1 — splash/login UI: rotating splash line, anon sign-in, enter/create
 * room flow, Stardew × Minecraft styling. Phase 0 ships the data only.
 */

export const SPLASH_LINES = [
  'warm pixels, good company',
  'the coffee is always fresh.',
  'no notifications, just vibes.',
  'study together, alone.',
  'rainy days included.',
  'pixel cozy.',
  'now playing: anything you want.',
  'a soft place to land.',
  'one window, infinite afternoons.',
  'sit anywhere.',
];

export function pickSplash() {
  return SPLASH_LINES[Math.floor(Math.random() * SPLASH_LINES.length)];
}

export function renderSplash(/* root */) {
  // Phase 1.
}
