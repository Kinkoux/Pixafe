/**
 * Avatar renderer. Phase 2 fills this in with the real pixel-art character
 * (skin / hair / outfit / accessory layers) and Phase 4 adds working / coffee /
 * stretching animations. Phase 0 ships the shape only.
 *
 * Customization shape (persisted to profiles.customization in Phase 3):
 *   {
 *     skinTone: 'light' | 'medium' | 'tan' | 'deep',
 *     hairStyle: 'short' | 'bun' | 'long' | 'buzz' | 'curly',
 *     hairColor: hex string,
 *     outfitColor: hex string,
 *     accessory: 'none' | 'glasses' | 'headphones' | 'beanie',
 *     pet: boolean,           // sleeping cat on desk — Phase 3 add-on
 *   }
 *
 * Animation state from Phase 4:
 *   'idle' | 'working' | 'sipping' | 'stretching' | 'on-break'
 */

export const DEFAULT_CUSTOMIZATION = {
  skinTone: 'medium',
  hairStyle: 'short',
  hairColor: '#3a2418',
  outfitColor: '#7a4a2a',
  accessory: 'none',
  pet: false,
};

export function drawAvatar(ctx, opts) {
  const { x, y, customization = DEFAULT_CUSTOMIZATION /*, animation = 'idle', t = 0 */ } = opts;
  // Phase 2 — pixel-art character. Stub: a small marker.
  ctx.fillStyle = customization.outfitColor;
  ctx.fillRect(x - 4, y - 8, 8, 8);
  ctx.fillStyle = skinHex(customization.skinTone);
  ctx.fillRect(x - 3, y - 14, 6, 6);
}

const SKIN = {
  light: '#f1c9a5',
  medium: '#d9a072',
  tan: '#a87149',
  deep: '#6e3f1f',
};

function skinHex(tone) {
  return SKIN[tone] || SKIN.medium;
}
