// Pricing page service tabs (templates/sections/pricing-summary.njk). The HTML is a
// plain list of links to stacked panels, so it works without JavaScript; this turns
// it into the ARIA tabs pattern: one panel visible, arrow keys / Home / End move
// between tabs, and #pricing-<id> in the URL opens that tab (service pages and ads
// can link straight to a service's prices).

export function initPricingTabs() {
  const root = document.querySelector('[data-pricing-tabs]');
  if (!root) return;

  const list = root.querySelector('.pricing-tabs__list');
  const tabs = [...root.querySelectorAll('.pricing-tabs__tab')];
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute('href').slice(1)));
  if (!tabs.length || panels.some((panel) => !panel)) return;

  list.setAttribute('role', 'tablist');
  list.querySelectorAll('li').forEach((item) => item.setAttribute('role', 'presentation'));
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('tabindex', '0');
  });

  function select(index, { focus = false, updateUrl = false } = {}) {
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      tab.classList.toggle('is-active', active);
      panels[i].hidden = !active;
    });
    // On narrow screens the pill row scrolls sideways: keep the active pill visible
    // (moves the row only, never the page).
    const tab = tabs[index];
    const left = tab.offsetLeft - list.offsetLeft;
    if (left < list.scrollLeft || left + tab.offsetWidth > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = Math.max(0, left - 8);
    }
    if (focus) tab.focus({ preventScroll: true });
    if (updateUrl) history.replaceState(null, '', `#${panels[index].id}`);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', (event) => {
      event.preventDefault();
      select(index, { updateUrl: true });
    });
    tab.addEventListener('keydown', (event) => {
      const last = tabs.length - 1;
      const next = {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, { focus: true, updateUrl: true });
    });
  });

  const indexFromHash = () => panels.findIndex((panel) => `#${panel.id}` === window.location.hash);

  const initial = indexFromHash();
  select(initial === -1 ? 0 : initial);
  if (initial > -1) root.scrollIntoView({ block: 'start' });

  // A #pricing-<id> link elsewhere on this page, or Back/Forward, switches tab too.
  window.addEventListener('hashchange', () => {
    const index = indexFromHash();
    if (index === -1) return;
    select(index);
    root.scrollIntoView({ block: 'start' });
  });
}
