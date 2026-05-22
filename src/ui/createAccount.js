import { openModal, closeModal } from './modal.js';
import { store } from '../state/store.js';
import { signInAnonymous, updateDisplayName } from '../lib/auth.js';

/**
 * Create / update display name. Pixafé uses Supabase anonymous auth under the
 * hood — the user never sees a password field. This modal just collects a
 * display name and persists it as user metadata (or to localStorage when
 * running in offline scaffold mode).
 *
 * The Phase 3 customization modal will extend this with skin/hair/outfit.
 */

const MAX_NAME_LENGTH = 18;

export function openCreateAccountModal(onSaved) {
  const current = store.get();
  const initialName = current.displayName ?? '';

  openModal({
    title: current.displayName ? 'change display name' : 'create account',
    body: `
      <p class="modal-hint">
        pick a display name your friends will see in the room.
        you can change it anytime.
      </p>
      <label class="modal-label">
        <span>display name</span>
        <input
          type="text"
          class="modal-input"
          maxlength="${MAX_NAME_LENGTH}"
          placeholder="e.g. moonbeam"
          value="${escapeAttr(initialName)}"
          autocomplete="off"
          spellcheck="false"
        />
      </label>
      <p class="modal-error" data-role="error" hidden></p>
      <div class="modal-actions">
        <button type="button" class="splash-btn splash-btn--ghost" data-action="cancel">cancel</button>
        <button type="button" class="splash-btn" data-action="save">save</button>
      </div>
    `,
    onMount(modalEl) {
      const input = modalEl.querySelector('input');
      const err = modalEl.querySelector('[data-role="error"]');
      const cancelBtn = modalEl.querySelector('[data-action="cancel"]');
      const saveBtn = modalEl.querySelector('[data-action="save"]');

      cancelBtn.addEventListener('click', closeModal);

      const submit = async () => {
        const value = input.value.trim();
        if (value.length < 2) {
          err.textContent = 'display name needs at least 2 characters.';
          err.hidden = false;
          input.focus();
          return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'saving…';
        try {
          const { user } = await signInAnonymous();
          await updateDisplayName(value);
          store.set({ user, displayName: value });
          closeModal();
          onSaved?.();
        } catch (e) {
          console.error('[pixafé] create-account save failed:', e);
          err.textContent = 'something glitched. try again?';
          err.hidden = false;
          saveBtn.disabled = false;
          saveBtn.textContent = 'save';
        }
      };

      saveBtn.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
    },
  });
}

function escapeAttr(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[c]));
}
