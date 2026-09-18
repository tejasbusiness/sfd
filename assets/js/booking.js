// Booking modal controller — FRONTEND-ONLY DEMO.
//
// Dates and times are mock data generated in the browser. The real availability
// query, slot recheck, event/Meet creation and Sheets logging happen server-side
// via the secure n8n workflow documented in docs/12-booking-integration-contract.md.
// This file never calls Google APIs and never holds a credential (CLAUDE.md rule 11).

const STEPS = ['date', 'slot', 'details', 'confirmation'];
const MOCK_SLOT_TIMES = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00'];

function getMockAvailableDates(count) {
  const dates = [];
  const cursor = new Date();
  cursor.setDate(cursor.getDate() + 1);
  while (dates.length < count) {
    const day = cursor.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

// Stands in for the secure backend: query availability, recheck the slot immediately
// before creating it, then create the booking. This is a recheck-then-create pattern,
// not a claim of full atomicity — a real race is still possible, so callers must
// handle an "ok: false" (slot taken) response gracefully rather than assume success.
async function mockSubmitBooking(payload, idempotencyKey) {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return {
    ok: true,
    idempotencyKey,
    eventId: `demo-${idempotencyKey.slice(0, 8)}`,
    meetUrl: null,
  };
}

export function initBookingModal(dialogEl) {
  if (!dialogEl) return;

  const state = {
    selectedDate: null,
    selectedTime: null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    idempotencyKey: null,
    submitting: false,
  };

  const stepSections = new Map(STEPS.map((step) => [step, dialogEl.querySelector(`[data-booking-step="${step}"]`)]));
  const stepIndicators = new Map(STEPS.map((step) => [step, dialogEl.querySelector(`[data-step-indicator="${step}"]`)]));
  const datesEl = dialogEl.querySelector('[data-booking-dates]');
  const slotsEl = dialogEl.querySelector('[data-booking-slots]');
  const selectedDateEl = dialogEl.querySelector('[data-booking-selected-date]');
  const timezoneEl = dialogEl.querySelector('[data-booking-timezone]');
  const timezoneSelect = dialogEl.querySelector('[data-booking-timezone-select]');
  const form = dialogEl.querySelector('[data-booking-form]');
  const submitError = dialogEl.querySelector('[data-booking-submit-error]');
  const submitButton = dialogEl.querySelector('[data-booking-submit]');
  const confirmationSummary = dialogEl.querySelector('[data-booking-confirmation-summary]');

  function showStep(step) {
    STEPS.forEach((s) => {
      const section = stepSections.get(s);
      if (section) section.hidden = s !== step;
      const indicator = stepIndicators.get(s);
      if (indicator) {
        if (s === step) indicator.setAttribute('aria-current', 'step');
        else indicator.removeAttribute('aria-current');
      }
    });
    const section = stepSections.get(step);
    const focusable = section && section.querySelector('button, input, select, textarea');
    if (focusable) focusable.focus();
  }

  function renderTimezone() {
    timezoneEl.textContent = state.timezone;
  }

  function renderDates() {
    const dates = getMockAvailableDates(6);
    datesEl.innerHTML = '';
    dates.forEach((date) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-modal__option';
      button.setAttribute('role', 'option');
      button.textContent = formatDate(date);
      button.addEventListener('click', () => {
        state.selectedDate = date;
        selectedDateEl.textContent = `${formatDate(date)} — ${state.timezone}`;
        renderSlots();
        showStep('slot');
      });
      datesEl.appendChild(button);
    });
  }

  function renderSlots() {
    slotsEl.innerHTML = '';
    MOCK_SLOT_TIMES.forEach((time) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-modal__option';
      button.setAttribute('role', 'option');
      button.textContent = time;
      button.addEventListener('click', () => {
        state.selectedTime = time;
        state.idempotencyKey = crypto.randomUUID();
        showStep('details');
      });
      slotsEl.appendChild(button);
    });
  }

  function validateForm(data) {
    const errors = {};
    if (!data.fullName.trim()) errors.fullName = 'Full name is required.';
    if (!/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Enter a valid email address.';
    if (!/^\+?[0-9()\-\s]{7,}$/.test(data.phone)) errors.phone = 'Enter a valid phone number with country code.';
    if (!data.businessName.trim()) errors.businessName = 'Business name is required.';
    return errors;
  }

  function showFormErrors(errors) {
    form.querySelectorAll('[data-booking-error-for]').forEach((el) => {
      const field = el.getAttribute('data-booking-error-for');
      el.textContent = errors[field] || '';
      el.hidden = !errors[field];
    });
  }

  dialogEl.querySelectorAll('[data-booking-back]').forEach((button) => {
    button.addEventListener('click', () => showStep(button.getAttribute('data-booking-back')));
  });

  if (timezoneSelect) {
    timezoneSelect.addEventListener('change', () => {
      state.timezone = timezoneSelect.value || Intl.DateTimeFormat().resolvedOptions().timeZone;
      renderTimezone();
      if (state.selectedDate) {
        selectedDateEl.textContent = `${formatDate(state.selectedDate)} — ${state.timezone}`;
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.submitting) return; // duplicate-submission guard

      const data = Object.fromEntries(new FormData(form).entries());
      const errors = validateForm(data);
      showFormErrors(errors);
      if (Object.keys(errors).length > 0) return;

      state.submitting = true;
      submitButton.disabled = true;
      submitError.hidden = true;

      try {
        const result = await mockSubmitBooking(
          {
            ...data,
            date: state.selectedDate ? state.selectedDate.toISOString() : null,
            time: state.selectedTime,
            timezone: state.timezone,
          },
          state.idempotencyKey
        );

        if (!result.ok) {
          // Graceful handling when a slot becomes unavailable: send the visitor
          // back to pick a new time instead of failing silently.
          submitError.textContent = 'That time was just taken. Please choose another slot.';
          submitError.hidden = false;
          showStep('slot');
          return;
        }

        confirmationSummary.textContent =
          `${formatDate(state.selectedDate)} at ${state.selectedTime} (${state.timezone}) — ` +
          `confirmation will be sent to ${data.email}.`;
        showStep('confirmation');
      } catch (err) {
        // Safe retry: idempotencyKey is unchanged, so resubmitting reuses the same
        // key instead of risking a duplicate booking once this calls the real backend.
        submitError.textContent = 'Something went wrong. Please try again.';
        submitError.hidden = false;
      } finally {
        state.submitting = false;
        submitButton.disabled = false;
      }
    });
  }

  dialogEl.addEventListener('close', () => {
    state.selectedDate = null;
    state.selectedTime = null;
    state.idempotencyKey = null;
    if (form) form.reset();
    showFormErrors({});
    showStep('date');
  });

  renderTimezone();
  renderDates();
  showStep('date');
}
