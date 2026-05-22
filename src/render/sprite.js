import { drawDitheredEllipseShadow } from './dither.js';

/**
 * Chibi character sprite renderer.
 *
 * Sprites are described as plain-string pixel grids in SPRITE_PIXELS — each
 * character maps to a palette key (D=outline, H=hair, S=skin, E=eye, O=outfit,
 * P=pants, B=boots, .=transparent). buildSpriteCanvas() rasterises a (direction,
 * frame, palette) combo into an off-screen canvas once and caches it; drawChibi
 * is then a single drawImage per call.
 *
 * Three base directions are defined: `down`, `up`, `side`. Left is rendered by
 * horizontally flipping the side sprite at draw time.
 *
 * Character footprint: 14×18 logical pixels. Anchor at bottom-center of the
 * feet (so position is the "ground point", matching how floor placement reads).
 */

const SKIN_HEX = {
  light: '#f1c9a5',
  medium: '#d9a072',
  tan: '#a87149',
  deep: '#6e3f1f',
};

const DEFAULT_CUSTOMIZATION = {
  skinTone: 'medium',
  hairColor: '#3a2418',
  outfitColor: '#7a4a2a',
  pantsColor: '#2a1a10',
  bootsColor: '#1a0e08',
};

// 14-wide grids. Use '.' for transparent.
const SPRITE_PIXELS = {
  // Facing the camera. Frame 0 = idle, frame 1 = walking (legs swapped).
  down: [
    [
      '....DDDDDD....',
      '..DDHHHHHHDD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHSSSSSSSSHHD',
      'DHSSEESSEESSHD',
      'DHSSSSSSSSSSHD',
      'DSSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPDDDDPPD..',
      '..DPPD..DPPD..',
      '..DBBD..DBBD..',
    ],
    [
      '....DDDDDD....',
      '..DDHHHHHHDD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHSSSSSSSSHHD',
      'DHSSEESSEESSHD',
      'DHSSSSSSSSSSHD',
      'DSSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPDDDDPPD..',
      '.DPPDD..DDPPD.',
      '.DBBD....DBBD.',
    ],
  ],

  // Facing away — same silhouette, hair where the face would be.
  up: [
    [
      '....DDDDDD....',
      '..DDHHHHHHDD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHHHHHHHHHHHD',
      'DHHHHHHHHHHHHD',
      'DHHHHHHHHHHHHD',
      'DSSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPDDDDPPD..',
      '..DPPD..DPPD..',
      '..DBBD..DBBD..',
    ],
    [
      '....DDDDDD....',
      '..DDHHHHHHDD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHHHHHHHHHHHD',
      'DHHHHHHHHHHHHD',
      'DHHHHHHHHHHHHD',
      'DSSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPDDDDPPD..',
      '.DPPDD..DDPPD.',
      '.DBBD....DBBD.',
    ],
  ],

  // Facing right (default for side). Profile head, one visible eye.
  side: [
    [
      '...DDDDDDD....',
      '..DHHHHHHHHD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHHSSSSSSSSHD',
      'DHHSEESSSSSSSD',
      'DHHSSSSSSSSSSD',
      'DHSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPPPPPPPD..',
      '..DPPPD.DPPD..',
      '..DBBBD.DBBD..',
    ],
    [
      '...DDDDDDD....',
      '..DHHHHHHHHD..',
      '.DHHHHHHHHHHD.',
      '.DHHHHHHHHHHD.',
      'DHHHSSSSSSSSHD',
      'DHHSEESSSSSSSD',
      'DHHSSSSSSSSSSD',
      'DHSSSSSSSSSSSD',
      '.DSSSSSSSSSSD.',
      '..DOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '.DOOOOOOOOOOD.',
      '..DPPPPPPPPD..',
      '.DPPPDD.DDPPD.',
      '.DBBBD...DBBD.',
    ],
  ],
};

const SPRITE_W = 14;
const SPRITE_H = 18;

const spriteCache = new Map();

function paletteFor(customization) {
  const c = { ...DEFAULT_CUSTOMIZATION, ...(customization || {}) };
  return {
    D: '#1a0e08',
    H: c.hairColor,
    S: SKIN_HEX[c.skinTone] || SKIN_HEX.medium,
    E: '#0a0504',
    O: c.outfitColor,
    P: c.pantsColor,
    B: c.bootsColor,
  };
}

function buildSpriteCanvas(directionKey, frame, palette) {
  const cacheKey = `${directionKey}|${frame}|${palette.H}|${palette.S}|${palette.O}|${palette.P}|${palette.B}`;
  if (spriteCache.has(cacheKey)) return spriteCache.get(cacheKey);

  const grid = SPRITE_PIXELS[directionKey][frame % SPRITE_PIXELS[directionKey].length];
  const off = document.createElement('canvas');
  off.width = SPRITE_W;
  off.height = SPRITE_H;
  const ctx = off.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      const color = palette[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  spriteCache.set(cacheKey, off);
  return off;
}

/**
 * Draw a chibi character anchored at (x, y) = bottom-center of feet.
 *
 * direction: 'down' | 'up' | 'left' | 'right'
 * frame:    integer (0/1 alternate for walking)
 */
export function drawChibi(ctx, opts) {
  const {
    x,
    y,
    direction = 'down',
    frame = 0,
    customization = DEFAULT_CUSTOMIZATION,
  } = opts;

  const palette = paletteFor(customization);
  const directionKey = direction === 'left' || direction === 'right' ? 'side' : direction;
  const sprite = buildSpriteCanvas(directionKey, frame, palette);
  const drawX = Math.floor(x - SPRITE_W / 2);
  const drawY = Math.floor(y - SPRITE_H);

  // Dithered ground shadow under the feet — anchors the character to the floor.
  drawDitheredEllipseShadow(
    ctx,
    Math.round(x),
    Math.round(y) - 1,
    5,
    2,
    'rgba(10, 5, 4, 1)',
    { intensity: 0.85 }
  );

  if (direction === 'left') {
    ctx.save();
    ctx.translate(drawX + SPRITE_W, drawY);
    ctx.scale(-1, 1);
    ctx.drawImage(sprite, 0, 0);
    ctx.restore();
  } else {
    ctx.drawImage(sprite, drawX, drawY);
  }
}

export const CHIBI_WIDTH = SPRITE_W;
export const CHIBI_HEIGHT = SPRITE_H;
