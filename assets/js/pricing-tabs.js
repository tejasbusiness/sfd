// Pricing page service pills (templates/sections/pricing-summary.njk). Each service
// is its own static page (/pricing/, /pricing/seo/, ...), so without JavaScript the
// pills are plain links. With JavaScript they switch in place, with no reload or
// flicker: the target page's HTML is fetched (and prefetched on hover/focus), its
// <main> replaces this one, the title/description/canonical are updated and the URL
// changes with history.pushState. The pills stay where they were on screen, and
// Back/Forward work. Any failure falls back to normal navigation.

const cache = new Map();

function load(url) {
  if (!cache.has(url)) {
    const request = fetch(url, { credentials: 'same-origin' })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .catch((error) => {
        cache.delete(url);
        throw error;
      });
    cache.set(url, request);
  }
  return cache.get(url);
}

function keepCurrentPillVisible(root) {
  const list = root.querySelector('.pricing-tabs__list');
  const current = root.querySelector('[aria-current="page"]');
  if (!list || !current) return;
  const left = current.offsetLeft - list.offsetLeft;
  if (left < list.scrollLeft || left + current.offsetWidth > list.scrollLeft + list.clientWidth) {
    list.scrollLeft = Math.max(0, left - 8);
  }
}

function syncHead(doc) {
  document.title = doc.title;
  ['meta[name="description"]', 'link[rel="canonical"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[property="og:url"]'].forEach((selector) => {
    const next = doc.head.querySelector(selector);
    const current = document.head.querySelector(selector);
    if (!next || !current) return;
    const attr = current.hasAttribute('content') ? 'content' : 'href';
    current.setAttribute(attr, next.getAttribute(attr));
  });
}

export function initPricingTabs({ onSwap } = {}) {
  const main = document.getElementById('main-content');
  if (!main || !main.querySelector('[data-pricing-tabs]')) return;

  keepCurrentPillVisible(main.querySelector('[data-pricing-tabs]'));
  history.replaceState({ pricing: true }, '', location.href);

  async function show(url, { push, focusPill }) {
    const pills = main.querySelector('[data-pricing-tabs]');
    const topBefore = pills ? pills.getBoundingClientRect().top : 0;
    let html;
    try {
      html = await load(url);
    } catch (error) {
      window.location.href = url;
      return;
    }
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const nextMain = doc.getElementById('main-content');
    if (!nextMain || !nextMain.querySelector('[data-pricing-tabs]')) {
      window.location.href = url;
      return;
    }

    main.replaceChildren(...[...nextMain.childNodes].map((node) => document.importNode(node, true)));
    syncHead(doc);
    if (push) history.pushState({ pricing: true }, '', url);

    // Keep the pills exactly where they were on screen (the hero above them can
    // change height with a shorter or longer heading).
    const newPills = main.querySelector('[data-pricing-tabs]');
    window.scrollBy(0, newPills.getBoundingClientRect().top - topBefore);
    keepCurrentPillVisible(newPills);
    if (focusPill) newPills.querySelector('[aria-current="page"]')?.focus({ preventScroll: true });
    if (onSwap) onSwap(main);
  }

  const isPill = (target) => target.closest?.('[data-pricing-tabs] .pricing-tabs__tab');

  main.addEventListener('click', (event) => {
    const pill = isPill(event.target);
    if (!pill || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (pill.getAttribute('aria-current') === 'page') return;
    show(pill.href, { push: true, focusPill: true });
  });

  // Prefetch on hover/focus so the switch is instant.
  const prefetch = (event) => {
    const pill = isPill(event.target);
    if (pill && pill.getAttribute('aria-current') !== 'page') load(pill.href).catch(() => {});
  };
  main.addEventListener('pointerover', prefetch);
  main.addEventListener('focusin', prefetch);

  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.pricing) show(location.href, { push: false, focusPill: false });
  });
}
