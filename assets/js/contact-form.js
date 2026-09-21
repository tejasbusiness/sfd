// Contact enquiry form. Validates in the browser, then POSTs to /api/contact (docs/14),
// which re-validates, stores the enquiry in MySQL and emails the team.

import { initPhoneInputs, isValidMobileNumber } from './phone-input.js';
import {
  isValidEmail,
  isValidWebsite,
  normalizeWebsite,
  readForm,
  showFormErrors,
  submitJson,
  trackingFields,
  reportSubmitFailure,
  setSubmitting,
  initWebsiteInputs,
  WEBSITE_ERROR_MESSAGE,
} from './form-utils.js';
import { showToast } from './toast.js';

const OTHER_SOURCE_VALUE = 'other';

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.countryCode) errors.countryCode = 'Select a country code.';
  if (!isValidMobileNumber(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  if (data.website && !isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
  if (!data.topic) errors.topic = 'Choose what we can help with.';
  // Compact forms (e.g. the Websites hero) have no "how did you hear" select.
  if ('source' in data && !data.source) errors.source = 'Let us know how you heard about us.';
  if (data.source === OTHER_SOURCE_VALUE && !data.sourceOther) errors.sourceOther = 'Please tell us where you heard about us.';
  if (!data.consent) errors.consent = 'Please confirm before sending.';
  if (!data.message) errors.message = 'Tell us a bit about what you need.';
  return errors;
}

export function initContactForm(form) {
  if (!form) return;

  initPhoneInputs(form);
  initWebsiteInputs(form);

  const submitButton = form.querySelector('[data-contact-submit]');
  const sourceSelect = form.querySelector('select[name="source"]');
  const otherInput = form.querySelector('input[name="sourceOther"]');
  const otherField = otherInput ? otherInput.closest('.field') : null;
  let submitting = false;

  // "Other" reveals a free-text field; picking anything else hides and clears it.
  if (sourceSelect && otherInput) {
    sourceSelect.addEventListener('change', () => {
      const isOther = sourceSelect.value === OTHER_SOURCE_VALUE;
      otherField.hidden = !isOther;
      if (!isOther) otherInput.value = '';
      else otherInput.focus();
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const data = readForm(form);
    data.consent = form.elements.consent.checked;
    const errors = validate(data);
    showFormErrors(form, errors);
    if (Object.keys(errors).length > 0) return;

    submitting = true;
    setSubmitting(form, submitButton, true, form.dataset.loadingLabel || undefined);

    try {
      const result = await submitJson('/api/contact', { ...data, website: normalizeWebsite(data.website), ...trackingFields() });
      if (!result.ok) {
        reportSubmitFailure(form, result, 'Please try again in a moment.', 'Your message was not sent');
        return;
      }
      form.reset();
      showFormErrors(form, {});
      if (otherField) otherField.hidden = true;
      showToast({ title: form.dataset.successTitle, message: form.dataset.successMessage });
    } catch (err) {
      showToast({ type: 'error', title: 'Your message was not sent', message: 'Please check your connection and try again.' });
    } finally {
      submitting = false;
      setSubmitting(form, submitButton, false);
    }
  });
}

// Contact page: show the slim details strip under the header once the details card
// has scrolled up out of view, and hide it again when the card is back.
function initContactPin() {
  const pin = document.querySelector('[data-contact-pin]');
  const card = document.querySelector('.contact-card');
  if (!pin || !card || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(([entry]) => {
    pin.hidden = entry.isIntersecting || entry.boundingClientRect.top > 0;
  }).observe(card);
}
initContactPin();
