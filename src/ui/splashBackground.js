import { LOGICAL_WIDTH, LOGICAL_HEIGHT, onDraw } from '../render/canvas.js';

/**
 * Cozy dusk-sky ambient background for the splash screen.
 *
 * Layers (back → front, all drawn at 288×180 logical):
 *   1. Vertical gradient — deep dusk-purple at top → warm amber near horizon.
 *   2. Procedural twinkling stars scattered in the upper band.
 *   3. Soft horizon glow (subtle warm-light band).
 *   4. Distant rolling hill silhouette so the scene reads as a place.
 *
 * Returns a function that unregisters the draw callback (called when the
 * splash screen tears down on Phase 2 hand-off).
 */

const STAR_COUNT = 36;
let stars = null;

function ensureStars() {
  if (stars) return;
  // Stable seed by hashing the position; reproducible across reloads.
  stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const x = pseudoRandom(i * 7 + 1) * LOGICAL_WIDTH;
    const y = pseudoRandom(i * 11 + 3) * (LOGICAL_HEIGHT * 0.55);
    const twinkleSpeed = 0.6 + pseudoRandom(i * 13 + 5) * 1.4;
    const phase = pseudoRandom(i * 17 + 7) * Math.PI * 2;
    stars.push({ x: Math.floor(x), y: Math.floor(y), twinkleSpeed, phase });
  }
}

function pseudoRandom(seed) {
  // Mulberry32-ish, deterministic for given int seed.
  let t = (seed * 0x6d2b79f5) >>> 0;
  t = ((t ^ (t >>> 15)) * (t | 1)) >>> 0;
  t = (t ^ (t + (t ^ (t >>> 7)) * (t | 61))) >>> 0;
  return ((t ^ (t >>> 14)) >>> 0) / 0xffffffff;
}

function drawSky(ctx) {
  // Vertical gradient. Logical-pixel addressing keeps it crisp.
  const g = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
  g.addColorStop(0, '#1c1538');     // deep night above
  g.addColorStop(0.45, '#4a2a55');  // dusk purple
  g.addColorStop(0.75, '#a85a3a');  // amber band near horizon
  g.addColorStop(1, '#3a2418');     // warm dark ground
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
}

function drawHorizonGlow(ctx) {
  // Soft warm band centered on horizon (~ y = 130).
  const g = ctx.createRadialGradient(
    LOGICAL_WIDTH / 2, 138, 8,
    LOGICAL_WIDTH / 2, 138, LOGICAL_WIDTH * 0.55
  );
  g.addColorStop(0, 'rgba(255, 200, 130, 0.55)');
  g.addColorStop(1, 'rgba(255, 200, 130, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 90, LOGICAL_WIDTH, 80);
}

function drawStars(ctx, t) {
  ensureStars();
  ctx.fillStyle = '#f4e4c1';
  for (const s of stars) {
    const alpha = 0.45 + 0.55 * Math.abs(Math.sin(t / 1000 * s.twinkleSpeed + s.phase));
    ctx.globalAlpha = alpha;
    ctx.fillRect(s.x, s.y, 1, 1);
  }
  ctx.globalAlpha = 1;
}

function drawHills(ctx) {
  // Far hills — a single warm-dark silhouette curve, hand-rolled with line segments.
  ctx.fillStyle = '#2a1a14';
  ctx.beginPath();
  ctx.moveTo(0, LOGICAL_HEIGHT);
  const baseY = 148;
  const seed = 5;
  for (let x = 0; x <= LOGICAL_WIDTH; x += 4) {
    const wobble =
      Math.sin((x + seed) * 0.06) * 4 +
      Math.sin((x + seed) * 0.13) * 2.5;
    ctx.lineTo(x, Math.floor(baseY + wobble));
  }
  ctx.lineTo(LOGICAL_WIDTH, LOGICAL_HEIGHT);
  ctx.closePath();
  ctx.fill();
}

export function mountSplashBackground() {
  const off = onDraw((ctx, t) => {
    drawSky(ctx);
    drawHorizonGlow(ctx);
    drawStars(ctx, t);
    drawHills(ctx);
  });
  return off;
}
