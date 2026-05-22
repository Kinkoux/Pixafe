import { onDraw } from '../render/canvas.js';
import { drawChibi } from '../render/sprite.js';
import { makePlayer, startInput } from './player.js';
import { DEFAULT_CUSTOMIZATION } from '../render/avatar.js';
import { locationById } from '../locations/_index.js';
import { store } from '../state/store.js';

/**
 * World orchestrator. Owns the per-frame update + render pipeline for the
 * in-room view: one location's drawBackground + the player sprite + the
 * location's drawForeground (so lamps and tall furniture overlap correctly).
 *
 * Frame timing comes from the canvas.js draw loop — each call provides the
 * elapsed-ms t, and we compute dt against the previous t.
 *
 * Returns an unmount function that:
 *   - removes the draw callback,
 *   - tears down keyboard listeners,
 *   - clears player state from the store.
 */

export function mountWorld({ locationId = 'cafe', customization } = {}) {
  const location = locationById(locationId);
  if (!location) throw new Error(`unknown location: ${locationId}`);

  const spawn = location.spawn ?? { x: 144, y: 160 };
  const { player, step } = makePlayer({
    x: spawn.x,
    y: spawn.y,
    customization: customization ?? store.get().customization ?? DEFAULT_CUSTOMIZATION,
  });

  // Mirror player position into the store so other UI (HUD, presence) can read it.
  store.set({ player: { x: player.x, y: player.y, direction: player.direction, locationId } });

  const stopInput = startInput({
    onPress: (action) => {
      if (action === 'interact') {
        // Phase 4+ will hook this into "sit at chair / order coffee / etc."
        // For now we just emit a console hint so the wiring is testable.
        // (No console.log noise in production — leave a hook for later.)
      }
    },
  });

  let lastT = null;

  const offDraw = onDraw((ctx, t) => {
    const dt = lastT == null ? 16 : Math.min(50, t - lastT); // cap dt to avoid teleports on tab refocus
    lastT = t;

    step(dt, location);

    // Render layers in order:
    //   background (floor / walls / back furniture)
    //   player
    //   foreground (hanging lamps, tall objects that overlap the player)
    location.drawBackground?.(ctx, t);

    drawChibi(ctx, {
      x: player.x,
      y: player.y,
      direction: player.direction,
      frame: player.frame,
      customization: player.customization,
    });

    location.drawForeground?.(ctx, t);

    // Push updated position into the store roughly 8×/sec so Phase 7 can sync.
    if ((t | 0) % 125 === 0) {
      store.set({
        player: {
          x: player.x,
          y: player.y,
          direction: player.direction,
          locationId,
        },
      });
    }
  });

  return function unmountWorld() {
    offDraw();
    stopInput();
    store.set({ player: null });
  };
}
