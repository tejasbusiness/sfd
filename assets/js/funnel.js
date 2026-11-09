// Cookieless funnel counter (docs/14 "Funnel tracking"). Sends an anonymous beacon for two
// steps: a click on any "Start My Free Website Preview" link and the first interaction with
// a preview form, plus (2026-11-09) any click on a link to /founding-clients/ (founding_click).
// Only the step and the page path are sent: no cookie, no id, no storage.
// Submitted, qualified, delivered and paid are counted from preview_applications instead.
function send(event) {
  try {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, page: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) {
    /* counting must never break the page */
  }
}

export function initFunnel() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest && e.target.closest('a[href^="/free-preview/"]');
    if (link) send('cta_click');
    if (e.target.closest && e.target.closest('a[href^="/founding-clients/"]')) send('founding_click');
  });
  document.querySelectorAll('form').forEach((form) => {
    if (!form.querySelector('[data-free-preview-submit]')) return;
    const start = () => {
      form.removeEventListener('focusin', start);
      send('form_start');
    };
    form.addEventListener('focusin', start);
  });
}
