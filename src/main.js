import { initCanvas } from './render/canvas.js';
import { store } from './state/store.js';
import { mountSplash } from './ui/splash.js';
import { getStoredDisplayName } from './lib/auth.js';

const sceneCanvas = document.getElementById('scene');
const uiRoot = document.getElementById('ui-root');

initCanvas(sceneCanvas);

// Hydrate any previously-saved display name so the splash screen reflects it.
getStoredDisplayName()
  .then((name) => {
    if (name) store.set({ displayName: name });
  })
  .catch(() => {
    /* offline or session not yet established — fine */
  });

// Defensive: clear any prior overlay nodes left behind by a stale HMR session.
uiRoot.innerHTML = '';

mountSplash(uiRoot);

// Force a full reload when this entry module changes, so we don't end up with
// duplicated DOM from a previous mount.
if (import.meta.hot) {
  import.meta.hot.invalidate();
}
