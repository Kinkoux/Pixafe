import { store } from '../state/store.js';
import { mountWorld } from '../world/world.js';

/**
 * In-room view. Mounts the walkable world and overlays a thin HUD: room code
 * chip, location label, hint about controls, and a "leave room" button that
 * tears the world down and returns the user to the splash.
 *
 * This replaces the Phase 1 placeholder banner.
 */

export function mountRoomView({ code, onLeave }) {
  const uiRoot = document.getElementById('ui-root');
  if (!uiRoot) return () => {};

  const unmountWorld = mountWorld({ locationId: 'cafe' });

  const hud = document.createElement('div');
  hud.className = 'room-hud';
  hud.innerHTML = `
    <div class="room-hud-top">
      <div class="room-hud-chip">
        <span class="room-hud-eyebrow">room</span>
        <span class="room-hud-code">${escapeHtml(code)}</span>
      </div>
      <button type="button" class="splash-btn splash-btn--ghost room-hud-leave" data-action="leave">leave</button>
    </div>
    <div class="room-hud-bottom">
      <div class="room-hud-hint">
        <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> to walk
      </div>
    </div>
  `;
  uiRoot.appendChild(hud);

  hud.querySelector('[data-action="leave"]').addEventListener('click', () => {
    store.set({ room: null });
    onLeave?.();
  });

  return function unmount() {
    unmountWorld();
    hud.remove();
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
