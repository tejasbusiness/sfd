// Cookie consent (docs/08). Necessary cookies are always on; analytics and
// marketing stay off until the visitor opts in. Rejecting is as easy as
// accepting. The choice is stored in one first-party cookie with a version, so
// changing the wording (footer.json cookieConsent.version) asks again.
//
// Any future analytics/marketing script must wait for consent:
//   if (window.sfdConsent.has('analytics')) load();
//   document.addEventListener('sfd:consent', (e) => e.detail.analytics && load());

const COOKIE_NAME = 'sfd_consent';
const MAX_AGE_DAYS = 180;

function readChoice(version) {
  try {
    const match = document.cookie.split('; ').find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (!match) return null;
    const choice = JSON.parse(decodeURIComponent(match.slice(COOKIE_NAME.length + 1)));
    return choice && choice.v === version ? choice : null;
  } catch (err) {
    return null;
  }
}

function writeChoice(choice) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie =
    `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(choice))}` +
    `; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax${secure}`;
}

// Best-effort proof of the visitor's choice (no personal data; the API stores a salted IP hash).
function recordChoice(analytics, marketing) {
  try {
    fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analytics, marketing, sourcePage: window.location.pathname }),
      keepalive: true,
    }).catch(() => {});
  } catch (err) {
    // Never block the banner if the request cannot be made.
  }
}

export function initCookieConsent() {
  const banner = document.querySelector('[data-cookie-banner]');
  if (!banner) return;

  const version = Number(banner.dataset.consentVersion);
  const prefs = banner.querySelector('[data-cookie-prefs]');
  const customiseBtn = banner.querySelector('[data-cookie-customise]');
  const saveBtn = banner.querySelector('[data-cookie-save]');
  const boxes = {
    analytics: banner.querySelector('[data-cookie-category="analytics"]'),
    marketing: banner.querySelector('[data-cookie-category="marketing"]'),
  };
  let opener = null;
  let current = readChoice(version);

  const state = () => ({
    necessary: true,
    analytics: !!(current && current.analytics),
    marketing: !!(current && current.marketing),
  });
  window.sfdConsent = { has: (category) => !!state()[category], get: state, open };

  function showPrefs(show) {
    prefs.hidden = !show;
    saveBtn.hidden = !show;
    customiseBtn.hidden = show;
    customiseBtn.setAttribute('aria-expanded', String(show));
  }

  function close() {
    banner.hidden = true;
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  function save(analytics, marketing) {
    current = { v: version, analytics, marketing, t: new Date().toISOString() };
    writeChoice(current);
    recordChoice(analytics, marketing);
    close();
    document.dispatchEvent(new CustomEvent('sfd:consent', { detail: state() }));
  }

  function open(trigger) {
    opener = trigger instanceof Element ? trigger : null;
    const s = state();
    boxes.analytics.checked = s.analytics;
    boxes.marketing.checked = s.marketing;
    showPrefs(false);
    banner.hidden = false;
    if (current) banner.querySelector('#cookie-banner-title').focus();
  }

  banner.querySelector('[data-cookie-accept]').addEventListener('click', () => save(true, true));
  banner.querySelector('[data-cookie-reject]').addEventListener('click', () => save(false, false));
  customiseBtn.addEventListener('click', () => showPrefs(true));
  saveBtn.addEventListener('click', () => save(boxes.analytics.checked, boxes.marketing.checked));
  banner.addEventListener('keydown', (event) => {
    // Escape only dismisses when a choice already exists (re-opened from the footer).
    if (event.key === 'Escape' && current) close();
  });

  document.querySelectorAll('[data-cookie-settings]').forEach((el) => el.addEventListener('click', () => open(el)));

  if (!current) open();
}
