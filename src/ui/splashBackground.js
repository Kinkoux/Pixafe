import { LOGICAL_WIDTH, LOGICAL_HEIGHT, onDraw } from '../render/canvas.js';

/**
 * Warm dim cozy cafe interior ambient background for the splash screen.
 *
 * Reads as a stylised pixel cafe at night — drawn impressionistically with
 * big silhouettes so it stays legible at 288×180 logical pixels:
 *   1. Dark warm-brown ceiling + back wall.
 *   2. Wood floor strip with plank lines.
 *   3. Booth silhouette on the left + window with warm interior light on the right.
 *   4. Chalkboard easel silhouette mid-floor.
 *   5. Three hanging pendant lamps with cords; each one a small bulb plus a
 *      radial amber glow halo, plus a soft pool of light on the floor below.
 *
 * The scene is fully static — rendered ONCE into an off-screen canvas at
 * mount time and then blitted on every draw tick. Keeps per-frame work to a
 * single drawImage call so the splash stays cheap even on slower hardware.
 */

const COLORS = {
  ceiling: '#0e0606',
  wall: '#1f1208',
  floor: '#3a2418',
  floorLine: '#1f1208',
  booth: '#0a0504',
  boothTrim: '#2a1810',
  window: '#d8a040',
  windowFrame: '#3a2418',
  chalkboard: '#0a0d0a',
  chalkboardFrame: '#3a2418',
  bulb: '#fff4c8',
  cord: '#1a0e08',
};

const LAMPS = [
  { x: 58, y: 38, glowRadius: 46 },
  { x: 144, y: 30, glowRadius: 54 },
  { x: 230, y: 36, glowRadius: 42 },
];

let cachedCanvas = null;

function drawWalls(ctx) {
  ctx.fillStyle = COLORS.ceiling;
  ctx.fillRect(0, 0, LOGICAL_WIDTH, 26);
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 26, LOGICAL_WIDTH, LOGICAL_HEIGHT - 26 - 32);
}

function drawFloor(ctx) {
  const floorY = LOGICAL_HEIGHT - 32;
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, floorY, LOGICAL_WIDTH, 32);
  ctx.fillStyle = COLORS.floorLine;
  for (let y = floorY + 6; y < LOGICAL_HEIGHT; y += 6) {
    ctx.fillRect(0, y, LOGICAL_WIDTH, 1);
  }
  const seams = [
    [22, floorY + 6, 1, 6],
    [70, floorY + 12, 1, 6],
    [128, floorY + 6, 1, 6],
    [186, floorY + 18, 1, 6],
    [244, floorY + 12, 1, 6],
  ];
  for (const [x, y, w, h] of seams) ctx.fillRect(x, y, w, h);
}

function drawBooth(ctx) {
  ctx.fillStyle = COLORS.booth;
  ctx.fillRect(0, 70, 54, 78);
  ctx.fillStyle = COLORS.boothTrim;
  ctx.fillRect(0, 70, 54, 2);
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(0, 120, 60, 16);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(58, 110, 4, 26);
}

function drawWindow(ctx) {
  const x = 214;
  const y = 70;
  const w = 60;
  const h = 44;
  ctx.fillStyle = COLORS.windowFrame;
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = COLORS.window;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.windowFrame;
  ctx.fillRect(x + Math.floor(w / 2) - 1, y, 2, h);
  ctx.fillRect(x, y + Math.floor(h / 2) - 1, w, 2);
  const halo = ctx.createRadialGradient(
    x + w / 2, y + h / 2, 4,
    x + w / 2, y + h / 2, 70
  );
  halo.addColorStop(0, 'rgba(255, 180, 80, 0.32)');
  halo.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(x - 70, y - 50, w + 140, h + 110);
}

function drawChalkboard(ctx) {
  const x = 168;
  const y = 130;
  const w = 28;
  const h = 22;
  ctx.fillStyle = COLORS.chalkboardFrame;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.chalkboard;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(x + 4, y + 6, 16, 1);
  ctx.fillRect(x + 4, y + 11, 12, 1);
  ctx.fillRect(x + 4, y + 16, 18, 1);
  ctx.fillStyle = COLORS.chalkboardFrame;
  ctx.fillRect(x + 4, y + h, 2, 6);
  ctx.fillRect(x + w - 6, y + h, 2, 6);
}

function drawLamps(ctx) {
  for (const lamp of LAMPS) {
    ctx.fillStyle = COLORS.cord;
    ctx.fillRect(lamp.x, 0, 1, lamp.y - 2);

    const halo = ctx.createRadialGradient(
      lamp.x, lamp.y, 1,
      lamp.x, lamp.y, lamp.glowRadius
    );
    halo.addColorStop(0, 'rgba(255, 200, 110, 0.55)');
    halo.addColorStop(0.4, 'rgba(255, 160, 60, 0.18)');
    halo.addColorStop(1, 'rgba(255, 140, 40, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(
      lamp.x - lamp.glowRadius,
      lamp.y - lamp.glowRadius,
      lamp.glowRadius * 2,
      lamp.glowRadius * 2
    );

    ctx.fillStyle = '#2a1810';
    ctx.fillRect(lamp.x - 2, lamp.y - 4, 5, 2);
    ctx.fillStyle = COLORS.bulb;
    ctx.fillRect(lamp.x - 1, lamp.y - 2, 3, 4);
    ctx.fillRect(lamp.x, lamp.y - 3, 1, 1);
  }
}

function drawFloorPool(ctx) {
  const cx = LAMPS[1].x;
  const cy = LOGICAL_HEIGHT - 20;
  const pool = ctx.createRadialGradient(cx, cy, 4, cx, cy, 80);
  pool.addColorStop(0, 'rgba(255, 180, 80, 0.18)');
  pool.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(cx - 80, cy - 30, 160, 50);
}

function buildCachedScene() {
  const off = document.createElement('canvas');
  off.width = LOGICAL_WIDTH;
  off.height = LOGICAL_HEIGHT;
  const c = off.getContext('2d');
  c.imageSmoothingEnabled = false;

  drawWalls(c);
  drawWindow(c);
  drawFloor(c);
  drawBooth(c);
  drawChalkboard(c);
  drawFloorPool(c);
  drawLamps(c);

  return off;
}

export function mountSplashBackground() {
  cachedCanvas = buildCachedScene();
  const off = onDraw((ctx /*, t */) => {
    ctx.drawImage(cachedCanvas, 0, 0);
  });
  return () => {
    off();
    cachedCanvas = null;
  };
}
