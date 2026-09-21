// Booking modal controller.
//
// Available dates and times come from GET /api/availability (MySQL opening rules,
// existing bookings and, when connected, Google Calendar). Submitting POSTs to
// /api/bookings with an Idempotency-Key (docs/12, docs/14). The slot is rechecked on
// the server; a 409 means someone else just took it. This file never calls Google
// APIs and never holds a credential (CLAUDE.md rule 11).

import { initPhoneInputs, isValidMobileNumber } from './phone-input.js';
import {
  isValidEmail,
  isValidWebsite,
  normalizeWebsite,
  readForm,
  showFormErrors,
  initWebsiteInputs,
  submitJson,
  setSubmitting,
  trackingFields,
  reportSubmitFailure,
  WEBSITE_ERROR_MESSAGE,
} from './form-utils.js';

const STEPS = ['date', 'slot', 'details', 'confirmation'];

// "YYYY-MM-DD" -> local Date (built from parts, so it never shifts a day).
function parseDate(value) {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

const detectedTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

export function initBookingModal(dialogEl) {
  if (!dialogEl) return;

  const state = {
    days: [], // [{ date: 'YYYY-MM-DD', times: [{ time: 'HH:mm', start: ISO }] }]
    selectedDate: null,
    selectedTime: null,
    selectedStart: null,
    timezone: detectedTimezone(),
    idempotencyKey: null,
    submitting: false,
    loadId: 0,
    loadedAt: 0,
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

  function showMessage(container, text) {
    container.innerHTML = '';
    const p = document.createElement('p');
    p.setAttribute('role', 'status');
    p.textContent = text;
    container.appendChild(p);
  }

  function renderDates() {
    datesEl.innerHTML = '';
    if (state.days.length === 0) {
      showMessage(datesEl, 'No times are open right now. Please try again later or use the contact page.');
      return;
    }
    // The first eight open days keep the step compact; each has real times behind it.
    state.days.slice(0, 8).forEach((day) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-modal__option';
      button.setAttribute('role', 'option');
      button.textContent = formatDate(day.date);
      button.addEventListener('click', () => {
        state.selectedDate = day.date;
        [...datesEl.children].forEach((el) => el.setAttribute('aria-selected', el === button ? 'true' : 'false'));
        selectedDateEl.textContent = `${formatDate(day.date)} — ${state.timezone}`;
        renderSlots(day);
        showStep('slot');
      });
      datesEl.appendChild(button);
    });
  }

  function renderSlots(day) {
    slotsEl.innerHTML = '';
    day.times.forEach(({ time, start }) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'booking-modal__option';
      button.setAttribute('role', 'option');
      button.textContent = time;
      button.addEventListener('click', () => {
        state.selectedTime = time;
        state.selectedStart = start;
        [...slotsEl.children].forEach((el) => el.setAttribute('aria-selected', el === button ? 'true' : 'false'));
        state.idempotencyKey = crypto.randomUUID();
        showStep('details');
      });
      slotsEl.appendChild(button);
    });
  }

  async function loadAvailability() {
    const loadId = ++state.loadId;
    showMessage(datesEl, 'Loading available times…');
    try {
      const response = await fetch(`/api/availability?timezone=${encodeURIComponent(state.timezone)}`, { credentials: 'same-origin' });
      const data = await response.json();
      if (loadId !== state.loadId) return; // a newer request superseded this one
      if (!response.ok || !data.ok) throw new Error('availability failed');
      state.days = data.slots;
      state.loadedAt = Date.now();
      if (data.timezone && data.timezone !== state.timezone) {
        state.timezone = data.timezone;
        renderTimezone();
      }
      renderDates();
    } catch (err) {
      if (loadId !== state.loadId) return;
      state.days = [];
      showMessage(datesEl, 'We could not load available times. Please close this window and try again in a moment.');
    }
  }

  function validateForm(data) {
    const errors = {};
    if (!data.fullName) errors.fullName = 'Full name is required.';
    if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
    if (!data.countryCode) errors.countryCode = 'Select a country code.';
    if (!isValidMobileNumber(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
    if (!data.businessName) errors.businessName = 'Business name is required.';
    if (data.website && !isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
    if (!data.consent) errors.consent = 'Please confirm before booking.';
    if (!data.message) errors.message = 'Tell us a bit about what you need — it helps us prepare for the call.';
    return errors;
  }

  dialogEl.querySelectorAll('[data-booking-back]').forEach((button) => {
    button.addEventListener('click', () => showStep(button.getAttribute('data-booking-back')));
  });

  if (timezoneSelect) {
    timezoneSelect.addEventListener('change', () => {
      state.timezone = timezoneSelect.value || detectedTimezone();
      state.selectedDate = null;
      state.selectedTime = null;
      state.selectedStart = null;
      renderTimezone();
      loadAvailability();
      showStep('date');
    });
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (state.submitting) return; // duplicate-submission guard

      const data = readForm(form);
      data.consent = form.elements.consent.checked;
      const errors = validateForm(data);
      showFormErrors(form, errors);
      if (Object.keys(errors).length > 0) return;

      state.submitting = true;
      let booked = false;
      setSubmitting(form, submitButton, true, 'Confirming your booking…');
      submitError.hidden = true;

      try {
        const result = await submitJson(
          '/api/bookings',
          {
            ...data,
            website: normalizeWebsite(data.website),
            start: state.selectedStart,
            timezone: state.timezone,
            ...trackingFields(),
          },
          { 'Idempotency-Key': state.idempotencyKey }
        );

        if (result.status === 409) {
          // The slot was taken while the visitor was typing: refresh and send them back to pick another.
          submitError.textContent = 'That time was just taken. Please choose another slot.';
          submitError.hidden = false;
          state.selectedStart = null;
          await loadAvailability();
          showStep('date');
          return;
        }
        if (!result.ok) {
          reportSubmitFailure(form, submitError, result, 'Something went wrong. Please try again.');
          return;
        }

        const link = result.data.meetUrl ? ` Your Google Meet link: ${result.data.meetUrl}.` : '';
        confirmationSummary.textContent =
          `${formatDate(state.selectedDate)} at ${state.selectedTime} (${state.timezone}). ` +
          `We have emailed your confirmation to ${data.email}.${link}`;
        showStep('confirmation');
        booked = true;
      } catch (err) {
        // Safe retry: idempotencyKey is unchanged, so resubmitting reuses the same
        // key instead of risking a duplicate booking.
        submitError.textContent = 'Something went wrong. Please try again.';
        submitError.hidden = false;
      } finally {
        state.submitting = false;
        setSubmitting(form, submitButton, false);
        // A confirmed booking keeps the button disabled until the form is reset (modal closed).
        if (booked) submitButton.disabled = true;
      }
    });
  }

  dialogEl.addEventListener('close', () => {
    state.selectedDate = null;
    state.selectedTime = null;
    state.selectedStart = null;
    state.idempotencyKey = null;
    if (form) form.reset();
    showFormErrors(form, {});
    if (submitButton) submitButton.disabled = false;
    showStep('date');
  });

  initPhoneInputs(dialogEl);
  if (form) initWebsiteInputs(form);
  renderTimezone();
  showStep('date');

  // Times are fetched only when the modal opens (and again if they are over a minute old),
  // so pages that never open it make no API calls.
  new MutationObserver(() => {
    if (dialogEl.open && Date.now() - state.loadedAt > 60000) loadAvailability();
  }).observe(dialogEl, { attributes: true, attributeFilter: ['open'] });
}
