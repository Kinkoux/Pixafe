/**
 * Pixafé Main Cafe — the central hub location, drawn top-down at 288×180.
 *
 * Layout (logical pixels, y grows downward):
 *
 *      x:0                                  144                          288
 *  y:0 ┌─────────────────────────────────────────────────────────────────┐
 *      │  CEILING / BACK WALL  ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ ▣ │
 *      │                                                                 │
 *  y:46│ ━━━━━━━━ window ━━━━━━━━━━━━━━━━━━━━━━━━━━ COUNTER ━━━━━━━━━━━ │
 *      │                                                                 │
 *      │  [booth]               [desk]                                   │
 *      │  [booth]                                  [desk]                │
 *      │  [booth]                                                        │
 *      │                                                                 │
 *      │                  [desk]                                  [easel]│
 *      │                                                                 │
 *      │                                                                 │
 *      │                                                                 │
 *  y:170│ wall ─────────────┐         door         ┌──────── wall ────── │
 *      └──────────────────────────────────────────────────────────────────┘
 *
 * Colliders are kept tight to the player's feet so movement feels natural.
 */

const COLORS = {
  // walls / ceiling
  ceiling: '#0e0606',
  wall: '#2a1810',
  wallTrim: '#5a3a1a',
  wallShadow: '#1a0e08',

  // floor
  floor: '#5a3a1f',
  floorLight: '#6c4a28',
  floorLine: '#2a1810',
  floorSeam: '#3a2418',

  // counter
  counterTop: '#8a5a2a',
  counterFace: '#3a2418',
  counterEdge: '#1a0e08',
  counterShadow: '#1a0e08',

  // booth
  booth: '#1a0e08',
  boothTrim: '#3a2418',
  boothSeat: '#2a1810',

  // desk + chair
  desk: '#8a5a2a',
  deskTop: '#a87149',
  deskShadow: '#1a0e08',
  chair: '#3a2418',
  chairShadow: '#1a0e08',

  // window
  window: '#d8a040',
  windowFrame: '#3a2418',
  windowMullion: '#1a0e08',

  // chalkboard
  chalkboard: '#0a0d0a',
  chalkboardFrame: '#3a2418',
  chalk: '#d8c8a0',

  // pendant lamp
  bulb: '#fff4c8',
  bulbCore: '#fff8d8',
  lampCap: '#2a1810',
  lampCord: '#1a0e08',

  // accents
  plant: '#3a5a28',
  plantPot: '#5a3a1a',
  rug: '#7a3a3a',
  rugTrim: '#a85a3a',
  doorDark: '#0a0504',
  doorJamb: '#1a0e08',
};

const LAMPS = [
  { x: 64, y: 30, glowRadius: 38 },
  { x: 144, y: 26, glowRadius: 46 },
  { x: 224, y: 30, glowRadius: 38 },
];

// Static furniture colliders — tuned to the *feet* of the player, not the
// silhouette. The player slides naturally past desks and chairs.
const COLLIDERS = [
  // Back wall (anything above y=46 is wall area).
  { x: 0, y: 0, w: 288, h: 46 },
  // Side walls.
  { x: 0, y: 46, w: 6, h: 134 },
  { x: 282, y: 46, w: 6, h: 134 },
  // Bottom wall — leaves an opening (door) in the middle.
  { x: 0, y: 168, w: 126, h: 12 },
  { x: 162, y: 168, w: 126, h: 12 },
  // Booth (left).
  { x: 8, y: 60, w: 42, h: 56 },
  // Desks.
  { x: 76, y: 92, w: 18, h: 14 },
  { x: 142, y: 124, w: 18, h: 14 },
  { x: 214, y: 92, w: 18, h: 14 },
  // Chalkboard easel.
  { x: 252, y: 138, w: 18, h: 18 },
];

const SEATS = [
  // Chairs around the desks + booth seating positions (used by Phase 7
  // presence to place visiting avatars).
  { x: 22, y: 116 },   // booth seat 1
  { x: 22, y: 100 },   // booth seat 2
  { x: 22, y: 84 },    // booth seat 3
  { x: 64, y: 100 },   // desk 1 chair (left of desk)
  { x: 104, y: 100 },  // desk 1 chair (right)
  { x: 132, y: 132 },  // desk 2 chair (left)
  { x: 170, y: 132 },  // desk 2 chair (right)
  { x: 204, y: 100 },  // desk 3 chair (left)
  { x: 242, y: 100 },  // desk 3 chair (right)
];

// ─────────────────────── drawing ───────────────────────

function drawFloor(ctx) {
  // Base wood color.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 46, 288, 134);

  // Horizontal plank lines.
  ctx.fillStyle = COLORS.floorLine;
  for (let y = 52; y < 180; y += 10) {
    ctx.fillRect(0, y, 288, 1);
  }

  // Staggered seam ticks for depth.
  const seams = [
    [16, 56], [60, 66], [110, 56], [160, 66], [210, 56], [256, 66],
    [32, 76], [88, 86], [140, 76], [200, 86], [252, 76],
    [24, 96], [76, 106], [120, 96], [180, 106], [232, 96],
    [8, 116], [70, 126], [128, 116], [196, 126], [264, 116],
    [44, 136], [104, 146], [156, 136], [220, 146],
    [20, 156], [88, 166], [148, 156], [212, 166], [268, 156],
  ];
  ctx.fillStyle = COLORS.floorSeam;
  for (const [x, y] of seams) ctx.fillRect(x, y, 1, 6);

  // Highlight band in the warmest light pool (under central lamp).
  const cx = LAMPS[1].x;
  const grad = ctx.createRadialGradient(cx, 120, 4, cx, 120, 110);
  grad.addColorStop(0, 'rgba(255, 200, 120, 0.18)');
  grad.addColorStop(1, 'rgba(255, 200, 120, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(cx - 110, 60, 220, 130);
}

function drawRug(ctx) {
  // Warm rug under the central desk so the floor reads as inviting.
  const x = 110;
  const y = 134;
  const w = 70;
  const h = 30;
  ctx.fillStyle = COLORS.rug;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.rugTrim;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);
}

function drawWalls(ctx) {
  // Ceiling band.
  ctx.fillStyle = COLORS.ceiling;
  ctx.fillRect(0, 0, 288, 14);
  // Back wall.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 14, 288, 32);
  // Wall trim (skirting along the floor edge).
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, 44, 288, 2);
  // Side walls + bottom wall framing.
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 46, 6, 134);
  ctx.fillRect(282, 46, 6, 134);
  ctx.fillRect(0, 168, 126, 12);
  ctx.fillRect(162, 168, 126, 12);
  // Door darkness (opening at the bottom).
  ctx.fillStyle = COLORS.doorDark;
  ctx.fillRect(126, 168, 36, 12);
  ctx.fillStyle = COLORS.doorJamb;
  ctx.fillRect(124, 168, 2, 12);
  ctx.fillRect(162, 168, 2, 12);
}

function drawWindow(ctx) {
  // Window in the back wall on the left side.
  const x = 22;
  const y = 18;
  const w = 50;
  const h = 24;
  ctx.fillStyle = COLORS.windowFrame;
  ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
  ctx.fillStyle = COLORS.window;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = COLORS.windowMullion;
  ctx.fillRect(x + Math.floor(w / 2) - 1, y, 2, h);
  ctx.fillRect(x, y + Math.floor(h / 2) - 1, w, 2);
  // Warm glow spilling onto the wall below the window.
  const glow = ctx.createRadialGradient(x + w / 2, y + h + 4, 2, x + w / 2, y + h + 4, 60);
  glow.addColorStop(0, 'rgba(255, 180, 80, 0.32)');
  glow.addColorStop(1, 'rgba(255, 180, 80, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 40, y, w + 80, h + 60);
}

function drawCounter(ctx) {
  // Long counter on the upper-right side. Top in lighter wood, face in darker.
  const x = 138;
  const yTop = 30;
  const yFace = 38;
  const w = 144;
  // Face (darker, lower).
  ctx.fillStyle = COLORS.counterFace;
  ctx.fillRect(x, yFace, w, 12);
  // Top (lighter, narrow band).
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(x, yTop, w, 10);
  // Top edge highlight + bottom shadow.
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(x, yTop, w, 1);
  ctx.fillRect(x, yTop + 9, w, 1);
  ctx.fillRect(x, yFace + 11, w, 1);
  // A few cups/jars on the counter top for texture.
  drawCup(ctx, x + 10, yTop + 2, '#d8a040');
  drawCup(ctx, x + 22, yTop + 2, '#a85a3a');
  drawCup(ctx, x + 96, yTop + 2, '#5a3a1a');
  drawCup(ctx, x + 110, yTop + 2, '#d8a040');
  drawCup(ctx, x + 130, yTop + 2, '#a85a3a');
  // Espresso machine silhouette.
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(x + 60, yTop - 4, 22, 14);
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(x + 60, yTop - 4, 22, 1);
  ctx.fillStyle = '#d8c8a0';
  ctx.fillRect(x + 63, yTop, 2, 2);
  ctx.fillRect(x + 77, yTop, 2, 2);
}

function drawCup(ctx, x, y, rim) {
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(x, y, 6, 6);
  ctx.fillStyle = rim;
  ctx.fillRect(x + 1, y + 1, 4, 1);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(x + 1, y + 2, 4, 4);
}

function drawBooth(ctx) {
  // Booth on the left: tall padded back + seat cushion + small table edge.
  const x = 8;
  const y = 56;
  const w = 42;
  const h = 64;
  // Back panel.
  ctx.fillStyle = COLORS.booth;
  ctx.fillRect(x, y, w, h);
  // Top trim.
  ctx.fillStyle = COLORS.boothTrim;
  ctx.fillRect(x, y, w, 2);
  // Seat cushion (slightly brighter near the front so it reads as a seat).
  ctx.fillStyle = COLORS.boothSeat;
  ctx.fillRect(x, y + h - 8, w, 8);
  ctx.fillStyle = COLORS.boothTrim;
  ctx.fillRect(x, y + h - 9, w, 1);
  // Three pillow seat dividers.
  ctx.fillStyle = COLORS.boothTrim;
  for (const sy of [y + 16, y + 32, y + 48]) {
    ctx.fillRect(x, sy, w, 1);
  }
  // Tiny table edge next to the booth (suggests a built-in table).
  ctx.fillStyle = COLORS.counterTop;
  ctx.fillRect(x + w + 2, y + 30, 8, 4);
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(x + w + 2, y + 30, 8, 1);
  ctx.fillRect(x + w + 2, y + 33, 8, 1);
}

function drawDesks(ctx) {
  for (const [x, y] of [[76, 92], [142, 124], [214, 92]]) {
    const w = 18;
    const h = 14;
    // Top surface (lighter).
    ctx.fillStyle = COLORS.deskTop;
    ctx.fillRect(x, y, w, h - 4);
    // Apron (darker).
    ctx.fillStyle = COLORS.desk;
    ctx.fillRect(x, y + h - 4, w, 4);
    // Edges.
    ctx.fillStyle = COLORS.deskShadow;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillRect(x + w - 1, y, 1, h);
    // Small steaming cup on the desk for life.
    drawSteamingCup(ctx, x + 4, y + 2);

    // Chairs (only the front-facing chair is drawn behind the desk; the player
    // can sit on either side, but only the back-side chair is rendered behind
    // furniture — the front chair is part of the foreground layer in
    // drawForeground so it doesn't get drawn under the player).
    // Back chair.
    ctx.fillStyle = COLORS.chair;
    ctx.fillRect(x + 5, y - 6, 8, 6);
    ctx.fillStyle = COLORS.chairShadow;
    ctx.fillRect(x + 5, y - 6, 8, 1);
  }
}

function drawSteamingCup(ctx, x, y) {
  ctx.fillStyle = '#1a0e08';
  ctx.fillRect(x, y, 6, 5);
  ctx.fillStyle = '#5a3a1a';
  ctx.fillRect(x + 1, y + 1, 4, 3);
  ctx.fillStyle = '#fff8d8';
  ctx.fillRect(x + 1, y, 1, 1);
  ctx.fillRect(x + 4, y, 1, 1);
}

function drawChalkboard(ctx) {
  const x = 250;
  const y = 134;
  const w = 22;
  const h = 22;
  // Frame.
  ctx.fillStyle = COLORS.chalkboardFrame;
  ctx.fillRect(x, y, w, h);
  // Board.
  ctx.fillStyle = COLORS.chalkboard;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  // Chalk text lines.
  ctx.fillStyle = COLORS.chalk;
  ctx.fillRect(x + 4, y + 5, 13, 1);
  ctx.fillRect(x + 4, y + 9, 10, 1);
  ctx.fillRect(x + 4, y + 13, 14, 1);
  // Easel legs.
  ctx.fillStyle = COLORS.chalkboardFrame;
  ctx.fillRect(x + 3, y + h, 2, 6);
  ctx.fillRect(x + w - 5, y + h, 2, 6);
}

function drawPlants(ctx) {
  // A potted plant in the lower-left corner.
  ctx.fillStyle = COLORS.plantPot;
  ctx.fillRect(54, 156, 12, 8);
  ctx.fillStyle = '#3a2418';
  ctx.fillRect(54, 156, 12, 1);
  ctx.fillStyle = COLORS.plant;
  ctx.fillRect(56, 148, 8, 8);
  ctx.fillRect(54, 150, 12, 4);
  ctx.fillStyle = '#588a2a';
  ctx.fillRect(58, 150, 4, 4);

  // Another by the chalkboard.
  ctx.fillStyle = COLORS.plantPot;
  ctx.fillRect(232, 156, 10, 8);
  ctx.fillStyle = COLORS.plant;
  ctx.fillRect(234, 148, 6, 8);
  ctx.fillRect(232, 150, 10, 4);
  ctx.fillStyle = '#588a2a';
  ctx.fillRect(236, 150, 2, 4);
}

function drawLamps(ctx) {
  for (const lamp of LAMPS) {
    // Cord from ceiling.
    ctx.fillStyle = COLORS.lampCord;
    ctx.fillRect(lamp.x, 0, 1, lamp.y - 3);

    // Glow halo.
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

    // Lamp cap + bulb.
    ctx.fillStyle = COLORS.lampCap;
    ctx.fillRect(lamp.x - 2, lamp.y - 4, 5, 2);
    ctx.fillStyle = COLORS.bulb;
    ctx.fillRect(lamp.x - 1, lamp.y - 2, 3, 4);
    ctx.fillStyle = COLORS.bulbCore;
    ctx.fillRect(lamp.x, lamp.y - 1, 1, 1);
  }
}

// ─────────────────────── exported ───────────────────────

export const cafe = {
  id: 'cafe',
  name: 'Pixafé Main Cafe',
  defaultStation: 'cafe-buzz',
  lightingTint: null,
  spawn: { x: 144, y: 162 },
  seats: SEATS,
  colliders: COLLIDERS,
  drawBackground(ctx /*, t */) {
    drawFloor(ctx);
    drawRug(ctx);
    drawWalls(ctx);
    drawWindow(ctx);
    drawCounter(ctx);
    drawBooth(ctx);
    drawDesks(ctx);
    drawChalkboard(ctx);
    drawPlants(ctx);
  },
  drawForeground(ctx /*, t */) {
    drawLamps(ctx);
  },
};
