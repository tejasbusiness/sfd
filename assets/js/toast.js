// Dismissible toast messages, used by every form (docs/03 "Forms"): a green toast
// confirms a success, a red one reports an error. Text is set with textContent,
// never innerHTML.
//
// Each toast auto-dismisses after 5 seconds and shows a progress bar that shrinks
// over that time. Accessibility: the region is a polite live region so a success is
// announced without moving focus (errors use role="alert" and are announced at once);
// there is a real dismiss button, Escape dismisses the toast that has focus, and the
// timer and bar pause while the pointer is over the toast or focus is inside it.
// Motion and the bar are removed by CSS under prefers-reduced-motion.

const DEFAULT_DURATION = 5000;
const CHECK_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16 9.8"/></svg>';
const ERROR_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5.5M12 16.4v.1"/></svg>';
const CLOSE_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

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
  if (!toast.isConnected || toast.classList.contains('toast--leaving')) return;
  toast.classList.add('toast--leaving');
  const done = () => toast.remove();
  toast.addEventListener('animationend', done, { once: true });
  // Fallback for reduced motion, where no animation runs.
  setTimeout(done, 250);
}

/**
 * @param {{ title?: string, message?: string, duration?: number, type?: 'success' | 'error' }} options
 * @returns {HTMLElement | null}
 */
export function showToast({ title = '', message = '', duration = DEFAULT_DURATION, type = 'success' } = {}) {
  if (!title && !message) return null;

  const isError = type === 'error';
  const toast = document.createElement('div');
  toast.className = isError ? 'toast toast--error' : 'toast toast--success';
  // Errors are announced immediately; confirmations politely (via the region).
  if (isError) toast.setAttribute('role', 'alert');

  const icon = document.createElement('span');
  icon.className = 'toast__icon';
  icon.innerHTML = isError ? ERROR_ICON : CHECK_ICON;

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

  if (duration > 0) {
    const bar = document.createElement('span');
    bar.className = 'toast__progress';
    bar.setAttribute('aria-hidden', 'true');
    bar.style.animationDuration = `${duration}ms`;
    toast.append(bar);
  }

  toast.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') removeToast(toast);
  });

  // Countdown that can pause (pointer over the toast, or focus inside it) and resume
  // with the time that is left; the CSS bar pauses with it via .toast--paused.
  let remaining = duration;
  let startedAt = 0;
  let timer = null;
  let hovering = false;
  let focused = false;

  const resume = () => {
    if (duration <= 0 || timer !== null) return;
    startedAt = Date.now();
    timer = setTimeout(() => removeToast(toast), remaining);
    toast.classList.remove('toast--paused');
  };
  const pause = () => {
    if (timer === null) return;
    clearTimeout(timer);
    timer = null;
    remaining = Math.max(0, remaining - (Date.now() - startedAt));
    toast.classList.add('toast--paused');
  };
  const sync = () => (hovering || focused ? pause() : resume());

  toast.addEventListener('mouseenter', () => { hovering = true; sync(); });
  toast.addEventListener('mouseleave', () => { hovering = false; sync(); });
  toast.addEventListener('focusin', () => { focused = true; sync(); });
  toast.addEventListener('focusout', () => { focused = false; sync(); });

  getRegion().append(toast);
  resume();
  return toast;
}
