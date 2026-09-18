// Custom-styled dropdown, replacing the browser's native <select> popup (which
// cannot be restyled with CSS) with a themed listbox-button widget, following
// the WAI-ARIA APG "select-only combobox" pattern:
// https://www.w3.org/WAI/ARIA/apg/patterns/combobox/#combobox-select-only
//
// Progressive enhancement: the native <select> stays in the DOM (hidden from
// sight and from assistive tech) so it keeps working as the form's real
// field — FormData(form), form.reset() and any existing 'change' listeners
// (e.g. booking.js's timezone select) all keep working unmodified. If this
// script fails to run, the native select is left untouched and fully usable.

let uidCounter = 0;

function buildOptionEl(option, listboxId) {
  const li = document.createElement('li');
  li.setAttribute('role', 'option');
  li.id = `${listboxId}-opt-${uidCounter++}`;
  li.dataset.value = option.value;
  li.textContent = option.textContent;
  li.className = 'custom-select__option';
  if (option.disabled) li.setAttribute('aria-disabled', 'true');
  return li;
}

function enhanceSelect(select) {
  if (select.dataset.enhanced === 'true') return;
  select.dataset.enhanced = 'true';

  const uid = `custom-select-${uidCounter++}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'custom-select';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  // Carries over the select's own classes (e.g. field__control,
  // booking-modal__timezone-select) so it inherits that context's sizing —
  // a full-width form field vs. a compact inline pill — for free.
  trigger.className = `${select.className} custom-select__trigger`.trim();
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', `${uid}-listbox`);
  trigger.id = `${uid}-trigger`;
  if (select.required) trigger.setAttribute('aria-required', 'true');
  if (select.disabled) trigger.disabled = true;
  if (select.id) {
    const labelEl = document.querySelector(`label[for="${select.id}"]`);
    if (labelEl) {
      if (!labelEl.id) labelEl.id = `${select.id}-label`;
      trigger.setAttribute('aria-labelledby', `${labelEl.id} ${trigger.id}`);
    }
  }

  const valueEl = document.createElement('span');
  valueEl.className = 'custom-select__value';

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  chevron.setAttribute('viewBox', '0 0 16 16');
  chevron.setAttribute('aria-hidden', 'true');
  chevron.setAttribute('class', 'custom-select__chevron');
  chevron.innerHTML = '<path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';

  trigger.appendChild(valueEl);
  trigger.appendChild(chevron);

  const listbox = document.createElement('ul');
  listbox.className = 'custom-select__listbox';
  listbox.setAttribute('role', 'listbox');
  listbox.id = `${uid}-listbox`;
  listbox.tabIndex = -1;
  listbox.hidden = true;

  const options = [...select.options].map((option) => buildOptionEl(option, uid));
  options.forEach((li) => listbox.appendChild(li));

  wrapper.appendChild(trigger);
  // A native <dialog> renders in the browser's top layer, above every
  // normal-stacking-context element regardless of z-index — so a listbox
  // for a select inside one must be mounted in that same dialog, not on
  // document.body, or it would render invisibly behind the dialog.
  const hostDialog = select.closest('dialog');
  (hostDialog || document.body).appendChild(listbox);
  select.insertAdjacentElement('afterend', wrapper);

  select.classList.add('custom-select__native');
  select.setAttribute('aria-hidden', 'true');
  select.tabIndex = -1;

  let activeIndex = -1;

  function syncFromSelect() {
    const selected = select.selectedIndex;
    options.forEach((li, i) => {
      const isSelected = i === selected;
      li.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      li.classList.toggle('custom-select__option--selected', isSelected);
    });
    valueEl.textContent = select.options[selected] ? select.options[selected].textContent : '';
    valueEl.classList.toggle('custom-select__value--placeholder', select.value === '');
    activeIndex = selected;
  }

  function setActive(index) {
    if (index < 0 || index >= options.length) return;
    if (options[index].getAttribute('aria-disabled') === 'true') return;
    activeIndex = index;
    options.forEach((li, i) => li.classList.toggle('custom-select__option--active', i === index));
    trigger.setAttribute('aria-activedescendant', options[index].id);
    options[index].scrollIntoView({ block: 'nearest' });
  }

  function positionListbox() {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward = spaceBelow < 200 && rect.top > spaceBelow;
    listbox.style.left = `${rect.left}px`;
    listbox.style.width = `${rect.width}px`;
    if (openUpward) {
      listbox.style.top = 'auto';
      listbox.style.bottom = `${window.innerHeight - rect.top + 4}px`;
      listbox.style.maxHeight = `${Math.max(rect.top - 12, 120)}px`;
    } else {
      listbox.style.bottom = 'auto';
      listbox.style.top = `${rect.bottom + 4}px`;
      listbox.style.maxHeight = `${Math.max(spaceBelow - 12, 120)}px`;
    }
  }

  function onViewportChange() {
    if (!listbox.hidden) positionListbox();
  }

  function openListbox() {
    positionListbox();
    listbox.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    wrapper.classList.add('custom-select--open');
    setActive(select.selectedIndex >= 0 ? select.selectedIndex : 0);
    window.addEventListener('resize', onViewportChange);
    window.addEventListener('scroll', onViewportChange, true);
  }

  function closeListbox({ focusTrigger = false } = {}) {
    listbox.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    wrapper.classList.remove('custom-select--open');
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    if (focusTrigger) trigger.focus();
  }

  function selectOption(index) {
    if (index < 0 || index >= options.length) return;
    if (select.selectedIndex !== index) {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
    syncFromSelect();
  }

  trigger.addEventListener('click', () => {
    if (listbox.hidden) openListbox();
    else closeListbox();
  });

  trigger.addEventListener('keydown', (event) => {
    const isOpen = !listbox.hidden;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) openListbox();
        else setActive(Math.min(activeIndex + 1, options.length - 1));
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) openListbox();
        else setActive(Math.max(activeIndex - 1, 0));
        break;
      case 'Home':
        if (isOpen) {
          event.preventDefault();
          setActive(0);
        }
        break;
      case 'End':
        if (isOpen) {
          event.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          selectOption(activeIndex);
          closeListbox({ focusTrigger: true });
        } else {
          openListbox();
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          closeListbox({ focusTrigger: true });
        }
        break;
      case 'Tab':
        if (isOpen) closeListbox();
        break;
      default:
        // Type-ahead: jump to the next option starting with the typed letter.
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const key = event.key.toLowerCase();
          const afterActive = options.find((li, i) => i > activeIndex && li.textContent.trim().toLowerCase().startsWith(key));
          const fromStart = options.find((li) => li.textContent.trim().toLowerCase().startsWith(key));
          const target = afterActive || fromStart;
          if (target) {
            const index = options.indexOf(target);
            if (isOpen) setActive(index);
            else selectOption(index);
          }
        }
    }
  });

  options.forEach((li, i) => {
    li.addEventListener('click', () => {
      selectOption(i);
      closeListbox({ focusTrigger: true });
    });
    li.addEventListener('mouseenter', () => setActive(i));
  });

  document.addEventListener('click', (event) => {
    if (!wrapper.contains(event.target) && !listbox.contains(event.target)) closeListbox();
  });

  select.addEventListener('change', syncFromSelect);
  if (select.form) {
    select.form.addEventListener('reset', () => setTimeout(syncFromSelect));
  }

  syncFromSelect();
}

export function initCustomSelects(root = document) {
  root.querySelectorAll('select[data-enhance="select"]').forEach(enhanceSelect);
}
