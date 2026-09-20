// Free Preview application form. Validates in the browser, then POSTs to
// /api/preview-applications (docs/14). Per docs/04-page-blueprints.md it must never
// claim to guarantee a preview.

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
  initWebsiteInputs,
  WEBSITE_ERROR_MESSAGE,
} from './form-utils.js';

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.countryCode) errors.countryCode = 'Select a country code.';
  if (!isValidMobileNumber(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  if (!data.businessName) errors.businessName = 'Business name is required.';
  if (data.website && !isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
  if (data.gbpUrl && !isValidWebsite(data.gbpUrl)) errors.gbpUrl = WEBSITE_ERROR_MESSAGE;
  if (!data.country) errors.country = 'Country is required.';
  if (!data.city) errors.city = 'City is required.';
  if (!data.category) errors.category = 'Choose a business category.';
  if (!data.primaryService) errors.primaryService = 'Primary service is required.';
  if (!data.problem) errors.problem = 'Tell us a bit about the main problem.';
  if (!data.consent) errors.consent = 'Please confirm before submitting.';
  return errors;
}

export function initFreePreviewForm(form) {
  if (!form) return;

  initPhoneInputs(form);
  initWebsiteInputs(form);

  const submitButton = form.querySelector('[data-free-preview-submit]');
  const submitError = form.querySelector('[data-submit-error]');
  const successEl = document.querySelector('[data-free-preview-success]');
  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const data = readForm(form);
    data.consent = form.elements.consent.checked;

    const errors = validate(data);
    showFormErrors(form, errors);
    if (Object.keys(errors).length > 0) return;

    submitting = true;
    submitButton.disabled = true;
    submitError.hidden = true;

    try {
      const result = await submitJson('/api/preview-applications', {
        ...data,
        website: normalizeWebsite(data.website),
        gbpUrl: normalizeWebsite(data.gbpUrl),
        ...trackingFields(),
      });
      if (!result.ok) {
        reportSubmitFailure(form, submitError, result, 'Something went wrong submitting your application. Please try again.');
        return;
      }
      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        successEl.setAttribute('tabindex', '-1');
        successEl.focus();
      }
    } catch (err) {
      submitError.textContent = 'Something went wrong submitting your application. Please try again.';
      submitError.hidden = false;
    } finally {
      submitting = false;
      submitButton.disabled = false;
    }
  });
}
