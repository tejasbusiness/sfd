// Light / Dark / System theme. An inline script in <head> (templates/layouts/base.njk)
// applies the saved choice before first paint so there is no flash; this module
// wires up the switch buttons and follows the device setting while "System" is chosen.
const KEY = 'sfd-theme';
const media = window.matchMedia('(prefers-color-scheme: dark)');

function readPref() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch (e) {
    return 'system';
  }
}

function apply(pref) {
  const dark = pref === 'dark' || (pref === 'system' && media.matches);
  const root = document.documentElement;
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-theme-pref', pref);
  document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
    btn.setAttribute('aria-pressed', String(btn.dataset.themeChoice === pref));
  });
  const names = { light: 'light', dark: 'dark', system: 'match my device' };
  const next = { light: 'dark', dark: 'system', system: 'light' };
  document.querySelectorAll('[data-theme-cycle]').forEach((btn) => {
    btn.setAttribute('aria-label', 'Colour theme: ' + names[pref] + '. Activate for ' + names[next[pref]] + '.');
    btn.title = 'Theme: ' + names[pref];
  });
}

function save(pref) {
  try {
    if (pref === 'system') window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, pref);
  } catch (e) {
    /* storage blocked: the choice still applies for this visit */
  }
  apply(pref);
}

export function initTheme() {
  apply(readPref());
  document.querySelectorAll('[data-theme-choice]').forEach((btn) => {
    btn.addEventListener('click', () => {
      save(btn.dataset.themeChoice);
    });
  });
  document.querySelectorAll('[data-theme-cycle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const order = { light: 'dark', dark: 'system', system: 'light' };
      save(order[readPref()]);
    });
  });
  const onChange = () => {
    if (readPref() === 'system') apply('system');
  };
  if (media.addEventListener) media.addEventListener('change', onChange);
  else if (media.addListener) media.addListener(onChange);
}
