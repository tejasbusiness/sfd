// Dismissible toast messages, used by every form to confirm a submission
// (docs/03 "Forms"). Text is set with textContent, never innerHTML.
//
// Accessibility: the region is a polite live region so screen readers announce a
// new toast without moving focus; each toast has a real dismiss button, Escape
// dismisses the toast that has focus, and the auto-dismiss timer pauses while the
// pointer is over the toast or focus is inside it. Motion is removed by CSS under
// prefers-reduced-motion.

const DEFAULT_DURATION = 8000;
const CHECK_ICON =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/></svg>';
const CLOSE_ICON =
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

let region = null;

function getRegion() {
  if (region && document.body.contains(region)) return region;
  region = document.createElement('div');
  region.className = 'toast-region';
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'false');
  document.body.append(region);
  return region;
}

function removeToast(toast) {
  if (!toast.isConnected) return;
  toast.classList.add('toast--leaving');
  const done = () => toast.remove();
  toast.addEventListener('animationend', done, { once: true });
  // Fallback for reduced motion, where no animation runs.
  setTimeout(done, 250);
}

/**
 * @param {{ title?: string, message?: string, duration?: number }} options
 * @returns {HTMLElement | null}
 */
export function showToast({ title = '', message = '', duration = DEFAULT_DURATION } = {}) {
  if (!title && !message) return null;

  const toast = document.createElement('div');
  toast.className = 'card toast';

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.innerHTML = CHECK_ICON;

  const body = document.createElement('div');
  body.className = 'toast__body';
  if (title) {
    const heading = document.createElement('p');
    heading.className = 'toast__title';
    heading.textContent = title;
    body.append(heading);
  }
  if (message) {
    const text = document.createElement('p');
    text.className = 'toast__message';
    text.textContent = message;
    body.append(text);
  }

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'toast__close';
  close.setAttribute('aria-label', 'Dismiss notification');
  close.innerHTML = CLOSE_ICON;
  close.addEventListener('click', () => removeToast(toast));

  toast.append(icon, body, close);
  toast.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') removeToast(toast);
  });

  let timer = null;
  const start = () => {
    clearTimeout(timer);
    if (duration > 0) timer = setTimeout(() => removeToast(toast), duration);
  };
  const stop = () => clearTimeout(timer);
  toast.addEventListener('mouseenter', stop);
  toast.addEventListener('mouseleave', start);
  toast.addEventListener('focusin', stop);
  toast.addEventListener('focusout', start);

  getRegion().append(toast);
  start();
  return toast;
}
