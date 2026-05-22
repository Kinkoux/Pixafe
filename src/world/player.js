/**
 * Player controller — keyboard input + delta-time movement + axis-separated AABB
 * collision against the current location's collider list.
 *
 * Coordinates are in logical (288×180) pixels. The player's footprint is small
 * (about feet-sized) so collisions feel like the character's feet — not the
 * whole body — touch obstacles. This makes navigating between desks feel right
 * top-down in the Stardew/Eastward style.
 */

const PRESSED = new Set();
let listenersAttached = false;
let onPress = null;
let onKeyChange = null;

const KEY_ALIASES = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
  e: 'interact',
  ' ': 'interact',
  enter: 'interact',
  escape: 'cancel',
};

function normalize(key) {
  return KEY_ALIASES[key.toLowerCase?.() ?? key];
}

function handleDown(e) {
  const k = normalize(e.key);
  if (!k) return;
  // Suppress browser scroll for movement keys when this listener is active.
  if (['up', 'down', 'left', 'right'].includes(k)) e.preventDefault();
  if (PRESSED.has(k)) return;
  PRESSED.add(k);
  onKeyChange?.(PRESSED);
  if (k === 'interact') onPress?.('interact');
  if (k === 'cancel') onPress?.('cancel');
}

function handleUp(e) {
  const k = normalize(e.key);
  if (!k) return;
  PRESSED.delete(k);
  onKeyChange?.(PRESSED);
}

function handleBlur() {
  PRESSED.clear();
  onKeyChange?.(PRESSED);
}

/** Hook up global key listeners. Returns an unsubscribe function. */
export function startInput(handlers = {}) {
  onPress = handlers.onPress ?? null;
  onKeyChange = handlers.onKeyChange ?? null;
  if (!listenersAttached) {
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    window.addEventListener('blur', handleBlur);
    listenersAttached = true;
  }
  return () => {
    window.removeEventListener('keydown', handleDown);
    window.removeEventListener('keyup', handleUp);
    window.removeEventListener('blur', handleBlur);
    listenersAttached = false;
    onPress = null;
    onKeyChange = null;
    PRESSED.clear();
  };
}

export function getMoveVector() {
  let dx = 0;
  let dy = 0;
  if (PRESSED.has('up')) dy -= 1;
  if (PRESSED.has('down')) dy += 1;
  if (PRESSED.has('left')) dx -= 1;
  if (PRESSED.has('right')) dx += 1;
  if (dx !== 0 && dy !== 0) {
    const inv = Math.SQRT1_2;
    dx *= inv;
    dy *= inv;
  }
  return { dx, dy };
}

/**
 * Player state container. The world keeps one of these and ticks it each frame.
 *
 *   makePlayer({ x, y, customization, footprint? })
 *     .step(dt, location)         // advance one frame
 *     .player                     // current public state
 */
export function makePlayer({
  x,
  y,
  customization,
  footprint = { w: 8, h: 4 },     // small feet-sized AABB
  speed = 64,                      // logical px / sec
}) {
  const player = {
    x,
    y,
    direction: 'down',
    walking: false,
    frame: 0,
    customization,
    footprint,
    speed,
    walkPhaseMs: 0,
  };

  function tryMove(dx, dy, colliders) {
    // Resolve X then Y so the player slides along walls.
    if (dx !== 0) {
      const nextX = player.x + dx;
      if (!collides(nextX, player.y, player.footprint, colliders)) {
        player.x = nextX;
      }
    }
    if (dy !== 0) {
      const nextY = player.y + dy;
      if (!collides(player.x, nextY, player.footprint, colliders)) {
        player.y = nextY;
      }
    }
  }

  function step(dt, location) {
    const { dx, dy } = getMoveVector();
    const moving = dx !== 0 || dy !== 0;

    if (moving) {
      // Prefer the dominant axis for the facing direction so diagonal movement
      // doesn't strobe between four animations.
      if (Math.abs(dx) > Math.abs(dy)) {
        player.direction = dx > 0 ? 'right' : 'left';
      } else if (Math.abs(dy) > 0) {
        player.direction = dy > 0 ? 'down' : 'up';
      }

      const stepDist = player.speed * (dt / 1000);
      tryMove(dx * stepDist, dy * stepDist, location.colliders ?? []);

      // Keep the player inside the room.
      const half = player.footprint.w / 2;
      if (player.x < half) player.x = half;
      if (player.x > 288 - half) player.x = 288 - half;
      if (player.y < player.footprint.h) player.y = player.footprint.h;
      if (player.y > 180) player.y = 180;

      // Walking frame timing: alternate every 220 ms.
      player.walkPhaseMs = (player.walkPhaseMs + dt) % 440;
      player.frame = player.walkPhaseMs < 220 ? 0 : 1;
    } else {
      // Idle: park on frame 0 with a slow blink/bob handled by the renderer.
      player.frame = 0;
      player.walkPhaseMs = 0;
    }

    player.walking = moving;
  }

  return { player, step };
}

function collides(px, py, footprint, colliders) {
  const half = footprint.w / 2;
  const left = px - half;
  const right = px + half;
  const top = py - footprint.h;
  const bottom = py;
  for (const c of colliders) {
    if (
      left < c.x + c.w &&
      right > c.x &&
      top < c.y + c.h &&
      bottom > c.y
    ) return true;
  }
  return false;
}
