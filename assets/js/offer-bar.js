// Founding Client offer bar: dismiss button (2026-11-09).
// The closed state is stored per spots value, so when the owner changes spotsLeft by hand
// the bar returns for visitors who closed it. The same check runs in an inline head script
// in base.njk so a closed bar never flashes. Storage can be blocked: every access is guarded.
const KEY = 'sfd-offer-founding';

export function initOfferBar() {
  const bar = document.querySelector('[data-offer-bar]');
  if (!bar) return;
  const close = bar.querySelector('[data-offer-bar-close]');
  if (!close) return;

  close.addEventListener('click', () => {
    document.documentElement.classList.add('offer-bar-off');
    try {
      localStorage.setItem(KEY, bar.dataset.spots || '1');
    } catch (e) {
      /* private mode or blocked storage: the bar simply returns on the next page */
    }
    // The focused button is gone; keep keyboard users in the header.
    const logo = document.querySelector('.site-header__logo');
    if (logo) logo.focus();
  });
}
