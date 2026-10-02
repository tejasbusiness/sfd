// Pricing page service links (templates/sections/pricing-summary.njk). Each service
// is its own page (/pricing/, /pricing/seo/, ...), so the links work as plain
// navigation. This only smooths the switch: the next page opens at the same scroll
// position instead of jumping back to the top, and on narrow screens the current
// pill is scrolled into view in the sideways-scrolling row.

const SCROLL_KEY = 'sfd-pricing-scroll';

export function initPricingTabs() {
  const root = document.querySelector('[data-pricing-tabs]');
  if (!root) return;

  const list = root.querySelector('.pricing-tabs__list');
  const current = root.querySelector('[aria-current="page"]');
  if (list && current) {
    const left = current.offsetLeft - list.offsetLeft;
    if (left + current.offsetWidth > list.clientWidth) list.scrollLeft = Math.max(0, left - 8);
  }

  // Storage can be unavailable (private mode, blocked site data): then the next
  // page simply opens at the top.
  try {
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) {
      sessionStorage.removeItem(SCROLL_KEY);
      window.scrollTo(0, Number(saved) || 0);
    }
  } catch (error) {
    /* ignore */
  }

  root.addEventListener('click', (event) => {
    const link = event.target.closest('.pricing-tabs__tab');
    if (!link || link.getAttribute('aria-current') === 'page') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    } catch (error) {
      /* ignore */
    }
  });
}
