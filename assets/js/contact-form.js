// Contact enquiry form — FRONTEND-ONLY DEMO, same status as the Free Preview form.
// Validates client-side and shows a mock success state. No real submission endpoint
// exists yet (integrations.public.json webhookUrl is null), so messages are NOT
// delivered until a secure backend is wired in.

import { initPhoneInputs, isValidMobileNumber } from './phone-input.js';
import {
  isValidEmail,
  isValidWebsite,
  normalizeWebsite,
  readForm,
  showFormErrors,
  initWebsiteInputs,
  WEBSITE_ERROR_MESSAGE,
} from './form-utils.js';

const OTHER_SOURCE_VALUE = 'other';

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.countryCode) errors.countryCode = 'Select a country code.';
  if (!isValidMobileNumber(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  if (data.website && !isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
  if (!data.topic) errors.topic = 'Choose what we can help with.';
  if (!data.source) errors.source = 'Let us know how you heard about us.';
  if (data.source === OTHER_SOURCE_VALUE && !data.sourceOther) errors.sourceOther = 'Please tell us where you heard about us.';
  if (!data.message) errors.message = 'Tell us a bit about what you need.';
  return errors;
}

async function mockSubmitEnquiry() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}

export function initContactForm(form) {
  if (!form) return;

  initPhoneInputs(form);
  initWebsiteInputs(form);

  const submitButton = form.querySelector('[data-contact-submit]');
  const submitError = form.querySelector('[data-submit-error]');
  const successEl = document.querySelector('[data-contact-success]');
  const sourceSelect = form.querySelector('select[name="source"]');
  const otherInput = form.querySelector('input[name="sourceOther"]');
  const otherField = otherInput.closest('.field');
  let submitting = false;

  // "Other" reveals a free-text field; picking anything else hides and clears it.
  sourceSelect.addEventListener('change', () => {
    const isOther = sourceSelect.value === OTHER_SOURCE_VALUE;
    otherField.hidden = !isOther;
    if (!isOther) otherInput.value = '';
    else otherInput.focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const data = readForm(form);
    const errors = validate(data);
    showFormErrors(form, errors);
    if (Object.keys(errors).length > 0) return;

    submitting = true;
    submitButton.disabled = true;
    submitError.hidden = true;

    try {
      const result = await mockSubmitEnquiry({ ...data, website: normalizeWebsite(data.website) });
      if (!result.ok) throw new Error('submit failed');
      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        successEl.setAttribute('tabindex', '-1');
        successEl.focus();
      }
    } catch (err) {
      submitError.textContent = 'Something went wrong sending your message. Please try again.';
      submitError.hidden = false;
    } finally {
      submitting = false;
      submitButton.disabled = false;
    }
  });
}
