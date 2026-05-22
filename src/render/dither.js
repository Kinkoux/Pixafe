/**
 * Bayer-dithered hard-edge primitives — used for halos, drop shadows, and
 * corner vignettes. NEVER use createLinearGradient / createRadialGradient on
 * the world canvas; those produce smooth anti-aliased blends that break the
 * pixel-art look. These helpers plot every pixel by hand using a 4×4 Bayer
 * threshold matrix, so every transition is a hard, dithered edge.
 *
 * All coordinates are in logical (288×180) pixels. These functions are
 * intended for one-shot bakes into an off-screen canvas — they do per-pixel
 * work and aren't cheap to call every frame.
 */

const BAYER_4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

function bayer(x, y) {
  return BAYER_4[((y % 4) + 4) % 4][((x % 4) + 4) % 4] / 16;
}

/**
 * Plot a radial halo of dithered pixels: dense at the center, sparse at the
 * edge. `falloff` shapes the curve (>1 = wider bright core, <1 = tighter
 * core), `intensity` scales the overall density.
 */
export function drawDitheredHalo(ctx, cx, cy, radius, color, opts = {}) {
  const { falloff = 1, intensity = 1 } = opts;
  ctx.fillStyle = color;
  const r = Math.ceil(radius);
  const cxi = Math.round(cx);
  const cyi = Math.round(cy);
  for (let y = cyi - r; y <= cyi + r; y++) {
    for (let x = cxi - r; x <= cxi + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius) continue;
      const t = dist / radius;
      const tCurve = Math.pow(t, 1 / Math.max(0.1, falloff));
      const density = (1 - tCurve) * intensity;
      if (density > bayer(x, y)) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

/**
 * Elliptical drop shadow — wider than tall, fading toward the edges with
 * a Bayer dither. Useful under furniture and characters.
 */
export function drawDitheredEllipseShadow(ctx, cx, cy, rx, ry, color, opts = {}) {
  const { intensity = 0.9 } = opts;
  ctx.fillStyle = color;
  const rxC = Math.ceil(rx);
  const ryC = Math.ceil(ry);
  const cxi = Math.round(cx);
  const cyi = Math.round(cy);
  for (let y = cyi - ryC; y <= cyi + ryC; y++) {
    for (let x = cxi - rxC; x <= cxi + rxC; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const tSq = dx * dx + dy * dy;
      if (tSq > 1) continue;
      const density = (1 - tSq) * intensity;
      if (density > bayer(x, y)) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

/**
 * Corner vignette — dark dithered overlay that gets denser toward the edges
 * of the supplied rectangle. Anchors the scene and creates depth without
 * smooth fades.
 */
export function drawCornerVignette(ctx, x, y, w, h, color, opts = {}) {
  const { intensity = 0.6, falloff = 2 } = opts;
  ctx.fillStyle = color;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const maxDist = Math.sqrt((w / 2) * (w / 2) + (h / 2) * (h / 2));
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const dx = xx - cx;
      const dy = yy - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.min(1, dist / maxDist);
      const density = Math.pow(t, falloff) * intensity;
      if (density > bayer(xx, yy)) {
        ctx.fillRect(xx, yy, 1, 1);
      }
    }
  }
}

/**
 * Soft warm pool on the floor under a lamp — wider and flatter than a halo
 * so it reads like reflected light. Drawn as a flattened ellipse with a low
 * intensity so it tints the floor without blowing it out.
 */
export function drawDitheredFloorPool(ctx, cx, cy, rx, ry, color, opts = {}) {
  const { intensity = 0.4, falloff = 1.5 } = opts;
  ctx.fillStyle = color;
  const rxC = Math.ceil(rx);
  const ryC = Math.ceil(ry);
  const cxi = Math.round(cx);
  const cyi = Math.round(cy);
  for (let y = cyi - ryC; y <= cyi + ryC; y++) {
    for (let x = cxi - rxC; x <= cxi + rxC; x++) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const tSq = dx * dx + dy * dy;
      if (tSq > 1) continue;
      const tCurve = Math.pow(tSq, 1 / Math.max(0.1, falloff));
      const density = (1 - tCurve) * intensity;
      if (density > bayer(x, y)) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}
