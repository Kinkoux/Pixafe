import { openModal, closeModal } from './modal.js';
import { store } from '../state/store.js';
import { signInAnonymous } from '../lib/auth.js';

/**
 * Room code flows. A room code is 4 uppercase letters drawn from a cozy-vibe
 * alphabet that excludes ambiguous characters (I / O) — so codes are easy to
 * share verbally.
 *
 * Phase 2 will swap the "you're in" placeholder for the real cafe view.
 */

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // drop I, O for clarity
const CODE_LENGTH = 4;
const CODE_REGEX = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

function generateRoomCode() {
  let code = '';
  // Use crypto.getRandomValues for an even distribution; falls back gracefully.
  const buf = new Uint8Array(CODE_LENGTH);
  if (globalThis.crypto?.getRandomValues) {
    crypto.getRandomValues(buf);
  } else {
    for (let i = 0; i < CODE_LENGTH; i++) buf[i] = Math.floor(Math.random() * 256);
  }
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[buf[i] % CODE_ALPHABET.length];
  }
  return code;
}

async function landInRoom(code) {
  const { user } = await signInAnonymous();
  store.set({ user, room: { code, hostUserId: user.id } });
  closeModal();
  showPlaceholderRoomBanner(code);
}

function showPlaceholderRoomBanner(code) {
  // Phase 2 will replace this with the real cafe scene. For now we just
  // confirm the room state visually so the user can see the wiring works.
  const root = document.getElementById('ui-root');
  const banner = document.createElement('div');
  banner.className = 'room-placeholder';
  banner.innerHTML = `
    <div class="room-placeholder-inner">
      <p class="room-placeholder-eyebrow">you're in</p>
      <p class="room-placeholder-code">${code}</p>
      <p class="room-placeholder-hint">phase 2 will draw the cafe here.</p>
      <button type="button" class="splash-btn splash-btn--ghost" data-action="leave">leave room</button>
    </div>
  `;
  root.appendChild(banner);
  banner.querySelector('[data-action="leave"]').addEventListener('click', () => {
    store.set({ room: null });
    banner.remove();
  });
}

export function openEnterRoomModal() {
  openModal({
    title: 'enter room',
    body: `
      <p class="modal-hint">
        ask a friend for their 4-letter room code — case doesn't matter.
      </p>
      <label class="modal-label">
        <span>room code</span>
        <input
          type="text"
          class="modal-input modal-input--code"
          maxlength="${CODE_LENGTH}"
          placeholder="e.g. WARM"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
        />
      </label>
      <p class="modal-error" data-role="error" hidden></p>
      <div class="modal-actions">
        <button type="button" class="splash-btn splash-btn--ghost" data-action="cancel">cancel</button>
        <button type="button" class="splash-btn" data-action="join">join</button>
      </div>
    `,
    onMount(modalEl) {
      const input = modalEl.querySelector('input');
      const err = modalEl.querySelector('[data-role="error"]');
      const cancelBtn = modalEl.querySelector('[data-action="cancel"]');
      const joinBtn = modalEl.querySelector('[data-action="join"]');

      cancelBtn.addEventListener('click', closeModal);

      input.addEventListener('input', () => {
        // Auto-uppercase, strip invalid chars while typing.
        const cleaned = input.value.toUpperCase().replace(new RegExp(`[^${CODE_ALPHABET}]`, 'g'), '');
        if (cleaned !== input.value) input.value = cleaned;
      });

      const submit = async () => {
        const code = input.value.trim().toUpperCase();
        if (!CODE_REGEX.test(code)) {
          err.textContent = `room codes are 4 letters from ${CODE_ALPHABET[0]}–${CODE_ALPHABET[CODE_ALPHABET.length - 1]} (no I or O).`;
          err.hidden = false;
          input.focus();
          return;
        }
        joinBtn.disabled = true;
        joinBtn.textContent = 'joining…';
        try {
          await landInRoom(code);
        } catch (e) {
          console.error('[pixafé] enter-room failed:', e);
          err.textContent = 'could not join. try again?';
          err.hidden = false;
          joinBtn.disabled = false;
          joinBtn.textContent = 'join';
        }
      };

      joinBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    },
  });
}

export function openCreateRoomModal() {
  const code = generateRoomCode();
  openModal({
    title: 'create room',
    body: `
      <p class="modal-hint">
        share this code with friends so they can hop in.
      </p>
      <div class="modal-code" data-role="code">${code}</div>
      <p class="modal-copy-state" data-role="copy-state" aria-live="polite"></p>
      <div class="modal-actions">
        <button type="button" class="splash-btn splash-btn--ghost" data-action="copy">copy code</button>
        <button type="button" class="splash-btn" data-action="enter">enter cafe</button>
      </div>
    `,
    onMount(modalEl) {
      const copyBtn = modalEl.querySelector('[data-action="copy"]');
      const enterBtn = modalEl.querySelector('[data-action="enter"]');
      const copyState = modalEl.querySelector('[data-role="copy-state"]');

      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(code);
          copyState.textContent = 'copied!';
        } catch {
          copyState.textContent = `select & copy: ${code}`;
        }
      });

      enterBtn.addEventListener('click', async () => {
        enterBtn.disabled = true;
        enterBtn.textContent = 'entering…';
        try {
          await landInRoom(code);
        } catch (e) {
          console.error('[pixafé] create-room enter failed:', e);
          copyState.textContent = 'could not enter. try again?';
          enterBtn.disabled = false;
          enterBtn.textContent = 'enter cafe';
        }
      });
    },
  });
}
