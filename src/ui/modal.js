/**
 * Tiny reusable modal. The splash flows (create account, enter room,
 * create room) all use it. One modal at a time — opening a new one closes
 * any previous instance.
 *
 * Usage:
 *   openModal({
 *     title: 'enter room',
 *     body: someHtmlString,
 *     onMount(modalEl) { ...wire up inputs/buttons... },
 *   })
 *
 * The returned function closes the modal programmatically.
 */

let active = null;

export function openModal({ title, body, onMount, onClose }) {
  closeModal();

  const root = document.getElementById('ui-root');
  if (!root) throw new Error('ui-root missing');

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
      <button class="modal-close" type="button" aria-label="close">×</button>
      <h2 class="modal-title">${escapeAttr(title)}</h2>
      <div class="modal-body">${body}</div>
    </div>
  `;
  root.appendChild(backdrop);

  const modalEl = backdrop.querySelector('.modal');
  const closeBtn = backdrop.querySelector('.modal-close');
  closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  const onKey = (e) => {
    if (e.key === 'Escape') closeModal();
  };
  document.addEventListener('keydown', onKey);

  active = {
    backdrop,
    cleanup() {
      document.removeEventListener('keydown', onKey);
      onClose?.();
      backdrop.remove();
    },
  };

  // Focus first input if any.
  queueMicrotask(() => {
    const firstInput = modalEl.querySelector('input, textarea, button:not(.modal-close)');
    firstInput?.focus();
  });

  onMount?.(modalEl);

  return closeModal;
}

export function closeModal() {
  if (!active) return;
  active.cleanup();
  active = null;
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
