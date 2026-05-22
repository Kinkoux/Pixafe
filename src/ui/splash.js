import { store } from '../state/store.js';
import { mountSplashBackground } from './splashBackground.js';
import { openCreateAccountModal } from './createAccount.js';
import { openEnterRoomModal, openCreateRoomModal } from './roomEntry.js';

/**
 * Random splash lines that show in the yellow rotated text next to the logo.
 * One is picked on each page load (intentionally not rotating mid-session —
 * felt too restless during early playtesting in the spec).
 */
export const SPLASH_LINES = [
  'warm pixels, good company',
  'the coffee is always fresh.',
  'no notifications, just vibes.',
  'study together, alone.',
  'rainy days included.',
  'pixel cozy.',
  'now playing: anything you want.',
  'a soft place to land.',
  'one window, infinite afternoons.',
  'sit anywhere.',
  'BYO mug.',
  'window seat available.',
];

export function pickSplash() {
  return SPLASH_LINES[Math.floor(Math.random() * SPLASH_LINES.length)];
}

let unmountBackground = null;

export function mountSplash(root) {
  // Ambient sky scene on the canvas underneath.
  unmountBackground = mountSplashBackground();

  const splashLine = pickSplash();
  const state = store.get();
  const accountLabel = state.displayName
    ? `change name (${state.displayName})`
    : 'create account';

  const screen = document.createElement('div');
  screen.className = 'splash-screen';
  screen.innerHTML = `
    <div class="splash-version">pixafé 0.1.0 · phase 1</div>

    <div class="splash-logo-wrap">
      <div class="splash-sign" role="img" aria-label="Pixafé">
        <span class="splash-sign-rope splash-sign-rope--l" aria-hidden="true"></span>
        <span class="splash-sign-rope splash-sign-rope--r" aria-hidden="true"></span>
        <span class="splash-sign-bolt splash-sign-bolt--tl"></span>
        <span class="splash-sign-bolt splash-sign-bolt--tr"></span>
        <span class="splash-sign-bolt splash-sign-bolt--bl"></span>
        <span class="splash-sign-bolt splash-sign-bolt--br"></span>
        <span class="splash-sign-text">PIXAFÉ</span>
        <div class="splash-line" aria-hidden="true">${escapeHtml(splashLine)}</div>
      </div>
    </div>

    <nav class="splash-buttons" aria-label="main menu">
      <button class="splash-btn" data-action="enter-room">enter room</button>
      <button class="splash-btn" data-action="create-room">create room</button>
      <button class="splash-btn" data-action="create-account">${escapeHtml(accountLabel)}</button>
    </nav>

    <div class="splash-footnote">v0.1.0 — built with warm intentions</div>
  `;

  root.appendChild(screen);

  screen.querySelector('[data-action="enter-room"]').addEventListener('click', () =>
    openEnterRoomModal()
  );
  screen.querySelector('[data-action="create-room"]').addEventListener('click', () =>
    openCreateRoomModal()
  );
  screen.querySelector('[data-action="create-account"]').addEventListener('click', () =>
    openCreateAccountModal(() => {
      // Refresh the button label after the user saves a display name.
      const next = store.get();
      const btn = screen.querySelector('[data-action="create-account"]');
      btn.textContent = next.displayName
        ? `change name (${next.displayName})`
        : 'create account';
    })
  );

  // Subscribe to roomId so we can swap the screen when the user joins a room
  // (Phase 2 will replace the placeholder with the real cafe view).
  const unsubStore = store.subscribe((s) => {
    if (s.room) {
      screen.classList.add('splash-screen--leaving');
    }
  });

  return function unmountSplash() {
    unsubStore();
    unmountBackground?.();
    unmountBackground = null;
    screen.remove();
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
