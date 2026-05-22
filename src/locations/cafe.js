import {
  drawDitheredHalo,
  drawDitheredEllipseShadow,
  drawCornerVignette,
  drawDitheredFloorPool,
} from '../render/dither.js';

/**
 * Pixafé Main Cafe — top-down with a 3/4 hint of perspective. Every fill is
 * hand-placed, no smooth gradients. All atmospheric lighting goes through the
 * dither helpers in src/render/dither.js — never createRadialGradient.
 *
 * Composition (logical 288×180):
 *
 *      x:0                                  144                          288
 *  y:0 ┌─────────────────────────────────────────────────────────────────┐
 *      │  CEILING band                                                   │
 *      │  ━━━━━ wall paneling ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
 *      │  [WINDOW]                                COUNTER                │
 *  y:46│ ━━━━━ skirting board ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
 *      │                                                                 │
 *      │  [booth]    [deskA]                                             │
 *      │  [booth]                       [deskC]                          │
 *      │  [booth]                                                        │
 *      │                  [deskB]                       [easel]          │
 *      │                                                                 │
 *      │  [plant]                                       [plant]          │
 *  y:168│ wall ─────────┐         DOOR        ┌─────── wall ─────────── │
 *      └──────────────────────────────────────────────────────────────────┘
 */

const PALETTE = {
  // walls / ceiling
  ceiling: '#080403',
  ceilingShadow: '#1a0e08',
  wallA: '#2a1810',
  wallB: '#341d12',
  wallSeam: '#180a05',
  wallTrim: '#5a3a1a',
  skirting: '#3a2418',
  skirtingHighlight: '#5a3a1a',

  // floor planks (alternating)
  plankA: '#5a3a1f',
  plankAGrain: '#4a2a14',
  plankAHighlight: '#704728',
  plankB: '#6a4624',
  plankBGrain: '#583a1f',
  plankBHighlight: '#7c5430',
  plankSeam: '#2a1810',

  // light wood (counter top, desk top)
  woodLight1: '#b07a4a',
  woodLight2: '#8a5a2a',
  woodLight3: '#5a3a1a',

  // mid wood (apron, counter face)
  woodMid1: '#6c4626',
  woodMid2: '#4a2a14',
  woodMid3: '#2a1810',

  // dark wood (booth, legs)
  woodDark1: '#2a1810',
  woodDark2: '#1a0e08',
  woodDark3: '#0a0504',

  // booth fabric
  booth1: '#3a1f1a',
  booth2: '#26120e',
  booth3: '#150806',
  boothCushion1: '#5a2e26',
  boothCushion2: '#3a1f1a',

  // window
  windowLight: '#fdd07e',
  windowMid: '#e8a040',
  windowEdge: '#a85a2a',
  windowFrame1: '#3a2418',
  windowFrame2: '#1a0e08',

  // espresso machine
  machineDark: '#1a0e08',
  machineMid: '#3a2418',
  machineHighlight: '#5a3a1a',
  machineSteel: '#a8a89c',

  // cup colors
  cupRim1: '#e8a040',
  cupRim2: '#c06030',
  cupRim3: '#a85a3a',
  cupBody: '#5a3a1a',
  cupBodyShadow: '#3a2418',
  cupSteam: '#d8c8a0',

  // chalkboard
  chalkboard: '#0a0d0a',
  chalkboardFrame1: '#3a2418',
  chalkboardFrame2: '#1a0e08',
  chalk: '#d8c8a0',

  // plants
  pot1: '#5a3a1a',
  pot2: '#3a2418',
  pot3: '#1a0e08',
  leafDark: '#2c5028',
  leafMid: '#3a6a38',
  leafLight: '#5a8a4a',
  leafBright: '#7caa64',

  // rug
  rugBase: '#5a2828',
  rugBorder: '#d8c08a',
  rugInner: '#3a1818',
  rugMotif: '#e8c8a0',

  // accents
  shadow: 'rgba(8, 4, 2, 1)',
  warmHaloCore: '#fff4c8',
  warmHaloMid: '#e89a4a',
  warmHaloFar: '#a85a3a',
  bulbCore: '#ffeebb',
  bulbShell: '#3a2418',
  lampCord: '#1a0e08',

  // door
  doorDark: '#050302',
  doorJamb: '#1a0e08',
  doorThreshold: '#2a1810',

  // vignette
  vignette: 'rgba(0, 0, 0, 1)',
};

const LAMPS = [
  { x: 56, y: 32, haloR: 56 },
  { x: 144, y: 28, haloR: 64 },
  { x: 232, y: 32, haloR: 56 },
];

// Collider rects (tight to the player's feet — see player.js footprint).
const COLLIDERS = [
  // Back wall.
  { x: 0, y: 0, w: 288, h: 46 },
  // Side walls.
  { x: 0, y: 46, w: 6, h: 122 },
  { x: 282, y: 46, w: 6, h: 122 },
  // Bottom walls with door gap.
  { x: 0, y: 168, w: 126, h: 12 },
  { x: 162, y: 168, w: 126, h: 12 },
  // Booth.
  { x: 6, y: 56, w: 42, h: 60 },
  // Booth-side table.
  { x: 50, y: 96, w: 16, h: 16 },
  // Desks.
  { x: 70, y: 100, w: 16, h: 14 },
  { x: 124, y: 132, w: 16, h: 14 },
  { x: 180, y: 100, w: 16, h: 14 },
  // Chalkboard easel.
  { x: 252, y: 130, w: 20, h: 20 },
  // Plants.
  { x: 6, y: 146, w: 14, h: 16 },
  { x: 268, y: 146, w: 14, h: 16 },
];

const SEATS = [
  // booth (3 spots)
  { x: 24, y: 76 },
  { x: 24, y: 96 },
  { x: 24, y: 116 },
  // desk chairs
  { x: 78, y: 90 },
  { x: 132, y: 122 },
  { x: 188, y: 90 },
];

// Static NPCs — visible in the scene but not interactive yet (Phase 3+).
export const CAFE_NPCS = [
  {
    id: 'barista',
    x: 212,
    y: 44,
    direction: 'down',
    customization: {
      skinTone: 'tan',
      hairColor: '#222',
      outfitColor: '#c06030',
      pantsColor: '#2a1a10',
      bootsColor: '#1a0e08',
    },
  },
  {
    id: 'booth-customer',
    x: 24,
    y: 96,
    direction: 'down',
    customization: {
      skinTone: 'light',
      hairColor: '#d8a04a',
      outfitColor: '#3a6a4a',
      pantsColor: '#2a1a10',
      bootsColor: '#1a0e08',
    },
  },
  {
    id: 'desk-customer',
    x: 188,
    y: 90,
    direction: 'down',
    customization: {
      skinTone: 'medium',
      hairColor: '#7a3a5a',
      outfitColor: '#3a4a7a',
      pantsColor: '#2a1a10',
      bootsColor: '#1a0e08',
    },
  },
];

// ─────────────────────── helpers ───────────────────────

function deterministicHash(x, y, seed = 1) {
  // Stable per-pixel pseudo-random for grain/knot placement.
  let h = (x * 374761393 + y * 668265263 + seed * 982451653) | 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 1274126177) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 1000) / 1000;
}

// ─────────────────────── drawing ───────────────────────

function drawFloor(ctx) {
  const floorTop = 46;
  const floorBottom = 180;
  const plankHeight = 11;
  let plankIndex = 0;

  for (let y = floorTop; y < floorBottom; y += plankHeight) {
    const isA = plankIndex % 2 === 0;
    const base = isA ? PALETTE.plankA : PALETTE.plankB;
    const grain = isA ? PALETTE.plankAGrain : PALETTE.plankBGrain;
    const highlight = isA ? PALETTE.plankAHighlight : PALETTE.plankBHighlight;
    const h = Math.min(plankHeight, floorBottom - y);

    // Base fill.
    ctx.fillStyle = base;
    ctx.fillRect(0, y, 288, h);

    // Highlight strip across the top of the plank (the lit edge).
    ctx.fillStyle = highlight;
    ctx.fillRect(0, y, 288, 1);

    // Plank seam at the bottom.
    ctx.fillStyle = PALETTE.plankSeam;
    ctx.fillRect(0, y + h - 1, 288, 1);

    // Hand-placed grain marks per plank — same positions each load (hash).
    ctx.fillStyle = grain;
    for (let x = 0; x < 288; x += 1) {
      const r = deterministicHash(x, y, plankIndex + 1);
      if (r > 0.93) ctx.fillRect(x, y + 2 + Math.floor(r * (h - 4)), 1, 1);
      if (r > 0.97) ctx.fillRect(x, y + 2 + Math.floor((1 - r) * (h - 4)), 2, 1);
    }

    // Plank end seams — vertical 1px lines at staggered intervals.
    const staggerOffset = (plankIndex * 41) % 60;
    ctx.fillStyle = PALETTE.plankSeam;
    for (let x = 20 + staggerOffset; x < 288; x += 60) {
      ctx.fillRect(x, y, 1, h - 1);
    }

    plankIndex++;
  }
}

function drawWalls(ctx) {
  // Ceiling (deepest dark).
  ctx.fillStyle = PALETTE.ceiling;
  ctx.fillRect(0, 0, 288, 8);
  ctx.fillStyle = PALETTE.ceilingShadow;
  ctx.fillRect(0, 8, 288, 4);

  // Back wall — vertical wood paneling.
  const wallTop = 12;
  const wallBottom = 44;
  for (let x = 0; x < 288; x++) {
    const panelIndex = Math.floor(x / 18);
    const baseColor = panelIndex % 2 === 0 ? PALETTE.wallA : PALETTE.wallB;
    ctx.fillStyle = baseColor;
    ctx.fillRect(x, wallTop, 1, wallBottom - wallTop);
  }
  // Panel seams (every 18px).
  ctx.fillStyle = PALETTE.wallSeam;
  for (let x = 18; x < 288; x += 18) {
    ctx.fillRect(x, wallTop, 1, wallBottom - wallTop);
  }
  // Top trim row of the wall (just below ceiling).
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 12, 288, 1);
  // Subtle grain ticks on the wall.
  ctx.fillStyle = PALETTE.wallSeam;
  for (let x = 0; x < 288; x += 1) {
    const r = deterministicHash(x, 0, 42);
    if (r > 0.95) {
      const y = wallTop + 2 + Math.floor(r * 26);
      ctx.fillRect(x, y, 1, 2);
    }
  }

  // Skirting board — 2px trim where wall meets floor.
  ctx.fillStyle = PALETTE.skirting;
  ctx.fillRect(0, 44, 288, 2);
  ctx.fillStyle = PALETTE.skirtingHighlight;
  ctx.fillRect(0, 44, 288, 1);

  // Side walls (visible only as a thin strip on left/right edges).
  ctx.fillStyle = PALETTE.wallA;
  ctx.fillRect(0, 46, 6, 122);
  ctx.fillRect(282, 46, 6, 122);
  ctx.fillStyle = PALETTE.wallSeam;
  ctx.fillRect(5, 46, 1, 122);
  ctx.fillRect(282, 46, 1, 122);

  // Bottom walls + door opening.
  ctx.fillStyle = PALETTE.wallA;
  ctx.fillRect(0, 168, 126, 12);
  ctx.fillRect(162, 168, 126, 12);
  ctx.fillStyle = PALETTE.wallTrim;
  ctx.fillRect(0, 168, 126, 1);
  ctx.fillRect(162, 168, 126, 1);

  // Door opening (the dark void you walk out through).
  ctx.fillStyle = PALETTE.doorDark;
  ctx.fillRect(126, 168, 36, 12);
  // Door jambs.
  ctx.fillStyle = PALETTE.doorJamb;
  ctx.fillRect(124, 168, 2, 12);
  ctx.fillRect(162, 168, 2, 12);
  // Threshold.
  ctx.fillStyle = PALETTE.doorThreshold;
  ctx.fillRect(126, 178, 36, 2);
}

function drawWindow(ctx) {
  const x = 20;
  const y = 16;
  const w = 60;
  const h = 26;

  // Frame (outer dark).
  ctx.fillStyle = PALETTE.windowFrame2;
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  // Frame (inner mid).
  ctx.fillStyle = PALETTE.windowFrame1;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);

  // Pane base (warm amber).
  ctx.fillStyle = PALETTE.windowMid;
  ctx.fillRect(x, y, w, h);

  // Center is brighter (hand-shaded, no gradient).
  ctx.fillStyle = PALETTE.windowLight;
  ctx.fillRect(x + 4, y + 4, w - 8, h - 8);

  // Inner highlights (small hot spots).
  ctx.fillRect(x + 8, y + 6, 8, 1);
  ctx.fillRect(x + w - 16, y + 6, 8, 1);

  // Edge darkening on the right + bottom.
  ctx.fillStyle = PALETTE.windowEdge;
  ctx.fillRect(x + w - 1, y, 1, h);
  ctx.fillRect(x, y + h - 1, w, 1);

  // Mullions (cross of panes).
  ctx.fillStyle = PALETTE.windowFrame2;
  ctx.fillRect(x + Math.floor(w / 2) - 1, y, 2, h);
  ctx.fillRect(x, y + Math.floor(h / 2) - 1, w, 2);

  // Sill (a thin warm wood ledge below the window).
  ctx.fillStyle = PALETTE.woodLight2;
  ctx.fillRect(x - 4, y + h + 1, w + 8, 2);
  ctx.fillStyle = PALETTE.woodLight3;
  ctx.fillRect(x - 4, y + h + 3, w + 8, 1);
}

function drawCounter(ctx) {
  const x = 144;
  const yTopBand = 22;
  const yFace = 30;
  const w = 140;
  const faceH = 18;

  // Counter face (the cabinet front, mid wood).
  ctx.fillStyle = PALETTE.woodMid2;
  ctx.fillRect(x, yFace, w, faceH);
  // Vertical paneling on the front.
  ctx.fillStyle = PALETTE.woodMid3;
  for (let px = x + 18; px < x + w; px += 18) {
    ctx.fillRect(px, yFace + 1, 1, faceH - 2);
  }
  // Bottom shadow line.
  ctx.fillStyle = PALETTE.woodDark2;
  ctx.fillRect(x, yFace + faceH - 1, w, 1);

  // Counter top (light wood, the bartop surface).
  ctx.fillStyle = PALETTE.woodLight2;
  ctx.fillRect(x, yTopBand, w, 8);
  // Top edge highlight.
  ctx.fillStyle = PALETTE.woodLight1;
  ctx.fillRect(x, yTopBand, w, 1);
  // Front lip (small overhang shadow).
  ctx.fillStyle = PALETTE.woodMid3;
  ctx.fillRect(x, yTopBand + 8, w, 1);
  ctx.fillStyle = PALETTE.woodLight3;
  ctx.fillRect(x, yTopBand + 7, w, 1);

  // Items on the counter:
  // Espresso machine (left of center).
  const emX = x + 28;
  const emY = yTopBand - 6;
  ctx.fillStyle = PALETTE.machineMid;
  ctx.fillRect(emX, emY, 24, 8);
  ctx.fillStyle = PALETTE.machineDark;
  ctx.fillRect(emX, emY, 24, 1);
  ctx.fillRect(emX, emY + 7, 24, 1);
  ctx.fillStyle = PALETTE.machineHighlight;
  ctx.fillRect(emX + 1, emY + 1, 22, 1);
  // Group head (the silver portafilter button).
  ctx.fillStyle = PALETTE.machineSteel;
  ctx.fillRect(emX + 8, emY + 2, 3, 4);
  ctx.fillRect(emX + 16, emY + 2, 3, 4);
  // Tiny steam dots above.
  ctx.fillStyle = PALETTE.cupSteam;
  ctx.fillRect(emX + 10, emY - 2, 1, 1);
  ctx.fillRect(emX + 17, emY - 3, 1, 1);

  // Cups along the counter top.
  drawCup(ctx, x + 6, yTopBand + 1, PALETTE.cupRim1);
  drawCup(ctx, x + 64, yTopBand + 1, PALETTE.cupRim2);
  drawCup(ctx, x + 92, yTopBand + 1, PALETTE.cupRim3);
  drawCup(ctx, x + 116, yTopBand + 1, PALETTE.cupRim1);
  drawCup(ctx, x + 130, yTopBand + 1, PALETTE.cupRim2);

  // Hanging chalkboard above counter (small menu sign).
  const mbX = x + 72;
  const mbY = 4;
  ctx.fillStyle = PALETTE.chalkboardFrame2;
  ctx.fillRect(mbX, mbY, 26, 14);
  ctx.fillStyle = PALETTE.chalkboard;
  ctx.fillRect(mbX + 1, mbY + 1, 24, 12);
  ctx.fillStyle = PALETTE.chalk;
  ctx.fillRect(mbX + 3, mbY + 3, 18, 1);
  ctx.fillRect(mbX + 3, mbY + 6, 14, 1);
  ctx.fillRect(mbX + 3, mbY + 9, 16, 1);
  // Two small chains holding it.
  ctx.fillStyle = PALETTE.lampCord;
  ctx.fillRect(mbX + 2, 0, 1, mbY);
  ctx.fillRect(mbX + 23, 0, 1, mbY);
}

function drawCup(ctx, x, y, rimColor) {
  // 6×6 cup with handle.
  ctx.fillStyle = PALETTE.woodDark3;
  ctx.fillRect(x, y, 6, 6);
  ctx.fillStyle = PALETTE.cupBody;
  ctx.fillRect(x + 1, y + 2, 4, 3);
  ctx.fillStyle = PALETTE.cupBodyShadow;
  ctx.fillRect(x + 4, y + 2, 1, 3);
  ctx.fillRect(x + 1, y + 4, 4, 1);
  ctx.fillStyle = rimColor;
  ctx.fillRect(x + 1, y + 1, 4, 1);
  // Handle (1px on the right side).
  ctx.fillStyle = PALETTE.cupBody;
  ctx.fillRect(x + 6, y + 2, 1, 2);
  ctx.fillStyle = PALETTE.cupBodyShadow;
  ctx.fillRect(x + 6, y + 3, 1, 1);
}

function drawBoothShadow(ctx) {
  drawDitheredEllipseShadow(ctx, 28, 120, 28, 4, PALETTE.shadow, { intensity: 0.8 });
}

function drawBooth(ctx) {
  const x = 6;
  const y = 54;
  const w = 42;
  const h = 64;

  // Back panel (high padded back).
  ctx.fillStyle = PALETTE.booth2;
  ctx.fillRect(x, y, w, h - 14);
  // Highlight along the top of the cushion.
  ctx.fillStyle = PALETTE.booth1;
  ctx.fillRect(x, y, w, 2);
  // Shadow under the top trim.
  ctx.fillStyle = PALETTE.booth3;
  ctx.fillRect(x, y + 2, w, 1);
  // Tufted dots — small dark pixels in a grid.
  ctx.fillStyle = PALETTE.booth3;
  for (let ty = y + 8; ty < y + h - 18; ty += 8) {
    for (let tx = x + 6; tx < x + w - 6; tx += 8) {
      ctx.fillRect(tx, ty, 1, 1);
    }
  }
  // Brass tack highlights nearby.
  ctx.fillStyle = '#b07a4a';
  for (let ty = y + 8; ty < y + h - 18; ty += 8) {
    for (let tx = x + 6; tx < x + w - 6; tx += 8) {
      ctx.fillRect(tx + 1, ty, 1, 1);
    }
  }

  // Seat cushion (front, brighter — the part you sit on).
  const seatY = y + h - 16;
  ctx.fillStyle = PALETTE.boothCushion1;
  ctx.fillRect(x, seatY, w, 10);
  ctx.fillStyle = PALETTE.boothCushion2;
  ctx.fillRect(x, seatY + 9, w, 1);
  // Cushion top highlight.
  ctx.fillStyle = '#7a3e30';
  ctx.fillRect(x, seatY, w, 1);
  // Cushion divisions between seats.
  ctx.fillStyle = PALETTE.boothCushion2;
  ctx.fillRect(x + 12, seatY, 1, 10);
  ctx.fillRect(x + 28, seatY, 1, 10);

  // Front face of the booth base (wood plinth under the seat).
  ctx.fillStyle = PALETTE.woodDark1;
  ctx.fillRect(x, y + h - 6, w, 6);
  ctx.fillStyle = PALETTE.woodDark2;
  ctx.fillRect(x, y + h - 1, w, 1);
  ctx.fillStyle = PALETTE.woodMid1;
  ctx.fillRect(x, y + h - 6, w, 1);

  // Booth-side table (the small wooden table next to the booth seats).
  const tX = 50;
  const tY = 96;
  const tW = 16;
  const tH = 16;
  // Drop shadow under the table.
  drawDitheredEllipseShadow(ctx, tX + tW / 2, tY + tH + 1, 10, 2, PALETTE.shadow, { intensity: 0.7 });
  // Table top.
  ctx.fillStyle = PALETTE.woodLight2;
  ctx.fillRect(tX, tY, tW, 5);
  // Top highlight.
  ctx.fillStyle = PALETTE.woodLight1;
  ctx.fillRect(tX, tY, tW, 1);
  // Edge shadow.
  ctx.fillStyle = PALETTE.woodLight3;
  ctx.fillRect(tX, tY + 4, tW, 1);
  // Apron.
  ctx.fillStyle = PALETTE.woodMid1;
  ctx.fillRect(tX, tY + 5, tW, 4);
  ctx.fillStyle = PALETTE.woodMid3;
  ctx.fillRect(tX, tY + 8, tW, 1);
  // Legs (2 visible).
  ctx.fillStyle = PALETTE.woodDark1;
  ctx.fillRect(tX + 1, tY + 9, 2, 7);
  ctx.fillRect(tX + tW - 3, tY + 9, 2, 7);
  // Small cup on table.
  drawCup(ctx, tX + 5, tY + 1, PALETTE.cupRim2);
  // Steam from cup.
  ctx.fillStyle = PALETTE.cupSteam;
  ctx.fillRect(tX + 7, tY - 2, 1, 1);
  ctx.fillRect(tX + 8, tY - 4, 1, 1);
}

function drawDesk(ctx, dx, dy) {
  // 3/4 perspective desk: top + apron + 2 visible legs.
  const w = 16;
  // Drop shadow.
  drawDitheredEllipseShadow(ctx, dx + w / 2, dy + 16, 11, 2, PALETTE.shadow, { intensity: 0.7 });
  // Top surface.
  ctx.fillStyle = PALETTE.woodLight2;
  ctx.fillRect(dx, dy, w, 5);
  // Top highlight strip (the lit edge).
  ctx.fillStyle = PALETTE.woodLight1;
  ctx.fillRect(dx, dy, w, 1);
  // Inset wood-grain line.
  ctx.fillStyle = PALETTE.woodLight3;
  ctx.fillRect(dx + 2, dy + 2, w - 4, 1);
  // Edge shadow.
  ctx.fillStyle = PALETTE.woodLight3;
  ctx.fillRect(dx, dy + 4, w, 1);
  // Apron (the visible front face).
  ctx.fillStyle = PALETTE.woodMid1;
  ctx.fillRect(dx, dy + 5, w, 5);
  // Apron darker shadow on the lower portion.
  ctx.fillStyle = PALETTE.woodMid2;
  ctx.fillRect(dx, dy + 8, w, 2);
  ctx.fillStyle = PALETTE.woodMid3;
  ctx.fillRect(dx, dy + 9, w, 1);
  // Legs (2 visible at front corners).
  ctx.fillStyle = PALETTE.woodDark1;
  ctx.fillRect(dx + 1, dy + 10, 2, 5);
  ctx.fillRect(dx + w - 3, dy + 10, 2, 5);
  ctx.fillStyle = PALETTE.woodDark2;
  ctx.fillRect(dx + 1, dy + 14, 2, 1);
  ctx.fillRect(dx + w - 3, dy + 14, 2, 1);

  // Steaming cup on top.
  drawCup(ctx, dx + 5, dy + 1, PALETTE.cupRim2);
  ctx.fillStyle = PALETTE.cupSteam;
  ctx.fillRect(dx + 7, dy - 2, 1, 1);
  ctx.fillRect(dx + 8, dy - 4, 1, 1);
}

function drawChair(ctx, cx, cy) {
  // Small chair behind the desk — drawn at a higher y so it peeks above the desk top.
  // 8 wide x 8 tall back + small seat hint.
  // Chair back.
  ctx.fillStyle = PALETTE.woodDark1;
  ctx.fillRect(cx, cy, 8, 8);
  // Back highlight.
  ctx.fillStyle = PALETTE.woodMid1;
  ctx.fillRect(cx, cy, 8, 1);
  // Back inner detail (vertical slat).
  ctx.fillStyle = PALETTE.woodDark3;
  ctx.fillRect(cx + 3, cy + 1, 2, 6);
  // Seat cushion peeking under.
  ctx.fillStyle = PALETTE.boothCushion1;
  ctx.fillRect(cx, cy + 8, 8, 2);
  ctx.fillStyle = PALETTE.boothCushion2;
  ctx.fillRect(cx, cy + 9, 8, 1);
}

function drawChalkboardEasel(ctx) {
  const x = 252;
  const y = 130;
  const w = 20;
  const h = 22;
  // Drop shadow.
  drawDitheredEllipseShadow(ctx, x + w / 2, y + h + 2, 12, 3, PALETTE.shadow, { intensity: 0.75 });
  // Board frame.
  ctx.fillStyle = PALETTE.chalkboardFrame2;
  ctx.fillRect(x, y, w, h);
  // Frame highlight on top.
  ctx.fillStyle = PALETTE.chalkboardFrame1;
  ctx.fillRect(x, y, w, 1);
  ctx.fillRect(x, y, 1, h);
  // Inner board.
  ctx.fillStyle = PALETTE.chalkboard;
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  // Chalk lines (menu).
  ctx.fillStyle = PALETTE.chalk;
  ctx.fillRect(x + 4, y + 5, 12, 1);
  ctx.fillRect(x + 4, y + 9, 10, 1);
  ctx.fillRect(x + 4, y + 13, 8, 1);
  ctx.fillRect(x + 4, y + 17, 12, 1);
  // Easel legs (A-frame).
  ctx.fillStyle = PALETTE.chalkboardFrame2;
  ctx.fillRect(x + 3, y + h, 2, 6);
  ctx.fillRect(x + w - 5, y + h, 2, 6);
  ctx.fillStyle = PALETTE.chalkboardFrame1;
  ctx.fillRect(x + 3, y + h + 5, 2, 1);
  ctx.fillRect(x + w - 5, y + h + 5, 2, 1);
}

function drawPlant(ctx, px, py) {
  const w = 14;
  // Drop shadow.
  drawDitheredEllipseShadow(ctx, px + w / 2, py + 16, 10, 2, PALETTE.shadow, { intensity: 0.7 });
  // Pot.
  ctx.fillStyle = PALETTE.pot1;
  ctx.fillRect(px, py + 8, w, 8);
  // Pot rim (slightly lighter, top band).
  ctx.fillStyle = '#7a4e26';
  ctx.fillRect(px, py + 8, w, 1);
  // Pot shadow side.
  ctx.fillStyle = PALETTE.pot2;
  ctx.fillRect(px, py + 14, w, 2);
  ctx.fillStyle = PALETTE.pot3;
  ctx.fillRect(px, py + 15, w, 1);
  // Pot left highlight.
  ctx.fillStyle = '#a06a3a';
  ctx.fillRect(px, py + 9, 1, 5);

  // Foliage — several layered leaves.
  // Base layer (dark).
  ctx.fillStyle = PALETTE.leafDark;
  ctx.fillRect(px + 2, py + 4, 10, 5);
  ctx.fillRect(px, py + 6, 14, 3);
  // Mid layer.
  ctx.fillStyle = PALETTE.leafMid;
  ctx.fillRect(px + 3, py + 2, 8, 5);
  ctx.fillRect(px + 1, py + 5, 12, 3);
  // Top leaves (light).
  ctx.fillStyle = PALETTE.leafLight;
  ctx.fillRect(px + 4, py, 6, 5);
  ctx.fillRect(px + 2, py + 4, 10, 2);
  // Bright leaf highlight.
  ctx.fillStyle = PALETTE.leafBright;
  ctx.fillRect(px + 5, py + 1, 2, 1);
  ctx.fillRect(px + 8, py + 3, 2, 1);
  ctx.fillRect(px + 3, py + 5, 1, 1);
  ctx.fillRect(px + 10, py + 6, 1, 1);
}

function drawRug(ctx) {
  const x = 98;
  const y = 142;
  const w = 64;
  const h = 28;

  // Base.
  ctx.fillStyle = PALETTE.rugBase;
  ctx.fillRect(x, y, w, h);

  // Outer border ribbon.
  ctx.fillStyle = PALETTE.rugBorder;
  ctx.fillRect(x, y, w, 2);
  ctx.fillRect(x, y + h - 2, w, 2);
  ctx.fillRect(x, y, 2, h);
  ctx.fillRect(x + w - 2, y, 2, h);

  // Inner border (darker).
  ctx.fillStyle = PALETTE.rugInner;
  ctx.fillRect(x + 4, y + 4, w - 8, 1);
  ctx.fillRect(x + 4, y + h - 5, w - 8, 1);
  ctx.fillRect(x + 4, y + 4, 1, h - 8);
  ctx.fillRect(x + w - 5, y + 4, 1, h - 8);

  // Center motifs (3 small diamonds).
  ctx.fillStyle = PALETTE.rugMotif;
  for (let i = 0; i < 3; i++) {
    const mx = x + 14 + i * 18;
    const my = y + h / 2 - 1;
    ctx.fillRect(mx + 1, my - 2, 2, 1);
    ctx.fillRect(mx, my - 1, 4, 1);
    ctx.fillRect(mx - 1, my, 6, 1);
    ctx.fillRect(mx, my + 1, 4, 1);
    ctx.fillRect(mx + 1, my + 2, 2, 1);
  }

  // Fringe at top + bottom.
  ctx.fillStyle = PALETTE.rugBorder;
  for (let fx = x + 2; fx < x + w - 2; fx += 3) {
    ctx.fillRect(fx, y - 1, 2, 1);
    ctx.fillRect(fx, y + h, 2, 1);
  }
}

function drawCornerShadows(ctx) {
  // Soft shadows in the upper corners of the wall (depth cue).
  drawDitheredEllipseShadow(ctx, 0, 22, 30, 22, 'rgba(0, 0, 0, 1)', { intensity: 0.5 });
  drawDitheredEllipseShadow(ctx, 288, 22, 30, 22, 'rgba(0, 0, 0, 1)', { intensity: 0.5 });
  // Soft shadow under the counter.
  drawDitheredEllipseShadow(ctx, 214, 52, 80, 5, 'rgba(0, 0, 0, 1)', { intensity: 0.55 });
}

function drawLamps(ctx) {
  for (const lamp of LAMPS) {
    // Cord from ceiling to lamp.
    ctx.fillStyle = PALETTE.lampCord;
    ctx.fillRect(lamp.x, 0, 1, lamp.y - 3);
    // Lamp shell (small dark cap).
    ctx.fillStyle = PALETTE.bulbShell;
    ctx.fillRect(lamp.x - 2, lamp.y - 4, 5, 2);
    ctx.fillStyle = PALETTE.woodDark2;
    ctx.fillRect(lamp.x - 2, lamp.y - 5, 5, 1);
    // Bulb.
    ctx.fillStyle = PALETTE.warmHaloCore;
    ctx.fillRect(lamp.x - 1, lamp.y - 2, 3, 4);
    ctx.fillStyle = PALETTE.bulbCore;
    ctx.fillRect(lamp.x, lamp.y - 1, 1, 2);

    // Dithered halos — three layered passes for richness.
    drawDitheredHalo(ctx, lamp.x, lamp.y, 6, PALETTE.warmHaloCore, { falloff: 2, intensity: 1.4 });
    drawDitheredHalo(ctx, lamp.x, lamp.y + 1, lamp.haloR * 0.45, PALETTE.warmHaloMid, { falloff: 1.2, intensity: 0.65 });
    drawDitheredHalo(ctx, lamp.x, lamp.y + 4, lamp.haloR, PALETTE.warmHaloFar, { falloff: 0.7, intensity: 0.4 });
  }
}

function drawFloorPools(ctx) {
  // Warm reflected pools under each lamp on the floor.
  for (const lamp of LAMPS) {
    drawDitheredFloorPool(ctx, lamp.x, 120, 50, 22, PALETTE.warmHaloMid, {
      intensity: 0.4,
      falloff: 1.4,
    });
    drawDitheredFloorPool(ctx, lamp.x, 130, 70, 36, PALETTE.warmHaloFar, {
      intensity: 0.22,
      falloff: 1.6,
    });
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
  npcs: CAFE_NPCS,
  drawBackground(ctx /*, t */) {
    drawFloor(ctx);
    drawFloorPools(ctx);
    drawRug(ctx);
    drawWalls(ctx);
    drawWindow(ctx);
    drawCounter(ctx);
    drawBooth(ctx);
    drawChalkboardEasel(ctx);
    drawDesk(ctx, 70, 100);
    drawDesk(ctx, 124, 132);
    drawDesk(ctx, 180, 100);
    drawChair(ctx, 73, 90);
    drawChair(ctx, 127, 122);
    drawChair(ctx, 183, 90);
    drawPlant(ctx, 6, 146);
    drawPlant(ctx, 268, 146);
    drawCornerShadows(ctx);
  },
  drawForeground(ctx /*, t */) {
    // Vignette first — anchors the scene with subtle corner darkening.
    drawCornerVignette(ctx, 0, 0, 288, 180, PALETTE.vignette, {
      intensity: 0.32,
      falloff: 3.4,
    });
    // Lamps drawn LAST so their halos read brightly over the vignette.
    drawLamps(ctx);
  },
};
