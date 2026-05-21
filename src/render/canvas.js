/**
 * Canvas bootstrap. Owns the logical-pixel framebuffer + an integer-scaled blit
 * to the visible canvas, so the result is always crisp regardless of viewport.
 *
 * The visible <canvas id="scene"> is what the page CSS-sizes; we draw the world
 * into an off-screen logical canvas at 288×180 and copy it up with integer scale.
 */

export const LOGICAL_WIDTH = 288;
export const LOGICAL_HEIGHT = 180;

let visibleCanvas = null;
let visibleCtx = null;
let logicalCanvas = null;
let logicalCtx = null;
let rafId = null;
const drawCallbacks = new Set();
let startedAt = 0;

export function initCanvas(canvas) {
  visibleCanvas = canvas;
  visibleCtx = canvas.getContext('2d');
  visibleCtx.imageSmoothingEnabled = false;

  logicalCanvas = document.createElement('canvas');
  logicalCanvas.width = LOGICAL_WIDTH;
  logicalCanvas.height = LOGICAL_HEIGHT;
  logicalCtx = logicalCanvas.getContext('2d');
  logicalCtx.imageSmoothingEnabled = false;

  resize();
  window.addEventListener('resize', resize);

  startedAt = performance.now();
  loop(startedAt);
}

function resize() {
  if (!visibleCanvas) return;
  const cssWidth = visibleCanvas.clientWidth || LOGICAL_WIDTH * 4;
  const scale = Math.max(1, Math.floor(cssWidth / LOGICAL_WIDTH));
  visibleCanvas.width = LOGICAL_WIDTH * scale;
  visibleCanvas.height = LOGICAL_HEIGHT * scale;
  visibleCtx.imageSmoothingEnabled = false;
}

function loop(now) {
  rafId = requestAnimationFrame(loop);
  const t = now - startedAt;

  // Clear logical buffer.
  logicalCtx.fillStyle = '#1a1410';
  logicalCtx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  // Allow registered scenes/avatars to draw.
  for (const cb of drawCallbacks) {
    try {
      cb(logicalCtx, t);
    } catch (err) {
      console.error('[render] draw callback failed:', err);
    }
  }

  // Blit logical -> visible with integer scale, no smoothing.
  visibleCtx.imageSmoothingEnabled = false;
  visibleCtx.drawImage(
    logicalCanvas,
    0,
    0,
    LOGICAL_WIDTH,
    LOGICAL_HEIGHT,
    0,
    0,
    visibleCanvas.width,
    visibleCanvas.height
  );
}

/** Register a draw callback; returns an unregister function. */
export function onDraw(cb) {
  drawCallbacks.add(cb);
  return () => drawCallbacks.delete(cb);
}

export function stopRender() {
  if (rafId != null) cancelAnimationFrame(rafId);
  rafId = null;
}
