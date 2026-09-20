// Searchable country-code picker (flag + dial code trigger, search-filtered
// listbox) enhancing a native <select data-enhance="country-select"> whose
// options are rendered from data/country-codes.json
// (templates/partials/country-code-options.njk) — plain "Name (+code)" text,
// which is also the no-JS fallback.
//
// The native <select> stays in the DOM, hidden from sight and assistive
// tech, so FormData(form) and any 'change' listeners keep reading the
// selected dial code exactly like assets/js/custom-select.js does for the
// plain dropdowns elsewhere on the site.

let uidCounter = 0;

// Flags are self-hosted SVG images (assets/images/flags/<iso2>.svg, from the MIT-licensed
// flag-icons set). Unicode flag emoji are not used: Windows browsers render them as plain
// two-letter codes ("IN") instead of flags.
const PANEL_MAX_HEIGHT = 360; // keeps the search box and a comfortable list on screen

function setFlag(container, iso2, lazy) {
  container.replaceChildren();
  if (!iso2 || iso2.length !== 2) return;
  const img = document.createElement('img');
  img.src = `/assets/images/flags/${iso2.toLowerCase()}.svg`;
  img.alt = '';
  img.width = 20;
  img.height = 15;
  img.decoding = 'async';
  if (lazy) img.loading = 'lazy';
  container.append(img);
}

function buildOptionEl(option, listboxId) {
  const iso2 = option.dataset.iso2 || '';
  const name = option.dataset.name || option.textContent;
  const li = document.createElement('li');
  li.setAttribute('role', 'option');
  li.id = `${listboxId}-opt-${uidCounter++}`;
  li.dataset.search = `${name} ${option.value}`.toLowerCase();
  li.className = 'country-select__option';

  const flag = document.createElement('span');
  flag.className = 'country-select__option-flag';
  flag.setAttribute('aria-hidden', 'true');
  setFlag(flag, iso2, true);

  const label = document.createElement('span');
  label.className = 'country-select__option-name';
  label.textContent = name;

  const code = document.createElement('span');
  code.className = 'country-select__option-code';
  code.textContent = option.value;

  li.append(flag, label, code);
  return li;
}

function enhanceSelect(select) {
  if (select.dataset.enhanced === 'true') return;
  select.dataset.enhanced = 'true';

  const uid = `country-select-${uidCounter++}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'country-select';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  // Carries over the select's own classes (e.g. phone-field__code) so it
  // inherits that context's sizing for free.
  trigger.className = `${select.className} country-select__trigger`.trim();
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.id = `${uid}-trigger`;

  const flagEl = document.createElement('span');
  flagEl.className = 'country-select__flag';
  flagEl.setAttribute('aria-hidden', 'true');
  const codeEl = document.createElement('span');
  codeEl.className = 'country-select__code';
  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 16 16');
  chevron.setAttribute('aria-hidden', 'true');
  chevron.setAttribute('class', 'country-select__chevron');
  chevron.innerHTML = '<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
  trigger.append(flagEl, codeEl, chevron);

  const panel = document.createElement('div');
  panel.className = 'country-select__panel';
  panel.hidden = true;

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.className = 'country-select__search';
  searchInput.setAttribute('role', 'combobox');
  searchInput.setAttribute('aria-expanded', 'false');
  searchInput.setAttribute('aria-controls', `${uid}-listbox`);
  searchInput.setAttribute('aria-autocomplete', 'list');
  searchInput.setAttribute('autocomplete', 'off');
  searchInput.setAttribute('spellcheck', 'false');
  searchInput.placeholder = 'Search country or code';
  searchInput.setAttribute('aria-label', 'Search country or code');

  const listbox = document.createElement('ul');
  listbox.className = 'country-select__listbox';
  listbox.setAttribute('role', 'listbox');
  listbox.id = `${uid}-listbox`;
  listbox.setAttribute('aria-label', 'Countries');

  const emptyState = document.createElement('p');
  emptyState.className = 'country-select__empty';
  emptyState.textContent = 'No matching country.';
  emptyState.hidden = true;

  const options = [...select.options].map((option) => buildOptionEl(option, uid));
  options.forEach((li) => listbox.appendChild(li));

  panel.append(searchInput, listbox, emptyState);
  wrapper.appendChild(trigger);
  // A native <dialog> renders in the browser's top layer, above every
  // normal-stacking-context element regardless of z-index — a panel for a
  // select inside one must be mounted in that same dialog, not on
  // document.body (see the identical note in custom-select.js).
  const hostDialog = select.closest('dialog');
  (hostDialog || document.body).appendChild(panel);
  select.insertAdjacentElement('afterend', wrapper);

  select.classList.add('country-select__native');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  let activeIndex = -1;
  let visibleOptions = options;

  function syncFromSelect() {
    const idx = select.selectedIndex;
    const selectedOption = select.options[idx];
    options.forEach((li, i) => li.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    setFlag(flagEl, selectedOption ? selectedOption.dataset.iso2 : '', false);
    codeEl.textContent = selectedOption ? selectedOption.value : '';
    trigger.setAttribute(
      'aria-label',
      selectedOption ? `Country code: ${selectedOption.dataset.name || ''} ${selectedOption.value}`.trim() : 'Country code'
    );
  }

  function filterOptions(query) {
    const q = query.trim().toLowerCase();
    visibleOptions = [];
    options.forEach((li) => {
      const matches = q === '' || li.dataset.search.includes(q);
      li.hidden = !matches;
      if (matches) visibleOptions.push(li);
    });
    emptyState.hidden = visibleOptions.length > 0;
    setActive(visibleOptions.length > 0 ? 0 : -1);
  }

  function setActive(visibleIndex) {
    options.forEach((li) => li.classList.remove('country-select__option--active'));
    if (visibleIndex < 0 || visibleIndex >= visibleOptions.length) {
      activeIndex = -1;
      searchInput.removeAttribute('aria-activedescendant');
      return;
    }
    activeIndex = visibleIndex;
    const li = visibleOptions[visibleIndex];
    li.classList.add('country-select__option--active');
    searchInput.setAttribute('aria-activedescendant', li.id);
    li.scrollIntoView({ block: 'nearest' });
  }

  function positionPanel() {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 280 && rect.top > spaceBelow;
    panel.style.left = `${rect.left}px`;
    panel.style.width = `${Math.max(rect.width, 260)}px`;
    if (openUpward) {
      panel.style.top = 'auto';
      panel.style.bottom = `${window.innerHeight - rect.top + 4}px`;
      panel.style.maxHeight = `${Math.min(Math.max(rect.top - 12, 160), PANEL_MAX_HEIGHT)}px`;
    } else {
      panel.style.bottom = 'auto';
      panel.style.top = `${rect.bottom + 4}px`;
      panel.style.maxHeight = `${Math.min(Math.max(spaceBelow - 12, 160), PANEL_MAX_HEIGHT)}px`;
    }
  }

  function onViewportChange() {
    if (!panel.hidden) positionPanel();
  }

  function openPanel() {
    positionPanel();
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    searchInput.setAttribute('aria-expanded', 'true');
    wrapper.classList.add('country-select--open');
    filterOptions('');
    searchInput.value = '';
    searchInput.focus();
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
  }

  function closePanel({ focusTrigger = false } = {}) {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    searchInput.setAttribute('aria-expanded', 'false');
    searchInput.removeAttribute('aria-activedescendant');
    wrapper.classList.remove('country-select--open');
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    if (focusTrigger) trigger.focus();
  }

  function selectVisibleIndex(visibleIndex) {
    const li = visibleOptions[visibleIndex];
    if (!li) return;
    const index = options.indexOf(li);
    if (select.selectedIndex !== index) {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
    syncFromSelect();
  }

  trigger.addEventListener('click', () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });

  trigger.addEventListener('keydown', (event) => {
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      if (panel.hidden) openPanel();
    }
  });

  searchInput.addEventListener('input', () => filterOptions(searchInput.value));

  searchInput.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActive(Math.min(activeIndex + 1, visibleOptions.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        setActive(Math.max(activeIndex - 1, 0));
        break;
      case 'Home':
        event.preventDefault();
        setActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActive(visibleOptions.length - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0) {
          selectVisibleIndex(activeIndex);
          closePanel({ focusTrigger: true });
        }
        break;
      case 'Escape':
        event.preventDefault();
        closePanel({ focusTrigger: true });
        break;
      case 'Tab':
        closePanel();
        break;
      default:
        break;
    }
  });

  options.forEach((li) => {
    li.addEventListener('click', () => {
      const visibleIndex = visibleOptions.indexOf(li);
      selectVisibleIndex(visibleIndex);
      closePanel({ focusTrigger: true });
    });
    li.addEventListener('mouseenter', () => {
      const visibleIndex = visibleOptions.indexOf(li);
      if (visibleIndex >= 0) setActive(visibleIndex);
    });
  });

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target) && !panel.contains(event.target)) closePanel();
  });

  select.addEventListener('change', syncFromSelect);
  if (select.form) {
    select.form.addEventListener('reset', () => setTimeout(syncFromSelect));
  }

  syncFromSelect();
}

export function initCountrySelects(root = document) {
  root.querySelectorAll('select[data-enhance="country-select"]').forEach(enhanceSelect);
}
