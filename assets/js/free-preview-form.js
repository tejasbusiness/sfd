// Free Website Preview request ("Show Me My New Website"). Validates in the browser,
// then POSTs to /api/preview-applications (docs/14). Per docs/04-page-blueprints.md it
// must never claim to guarantee a preview. Required: name, email, business name and
// one website or Google Business Profile URL; phone, service and message are optional.

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

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Your name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (data.mobileNumber && !isValidMobileNumber(data.mobileNumber)) errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  if (!data.businessName) errors.businessName = 'Business name is required.';
  if (!data.website) errors.website = 'Add your website or Google Business Profile link.';
  else if (!isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
  if (!data.consent) errors.consent = 'Please confirm before submitting.';
  return errors;
}

export function initFreePreviewForm(form) {
  if (!form) return;

  initPhoneInputs(form);
  initWebsiteInputs(form);

  const submitButton = form.querySelector('[data-free-preview-submit]');
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
    setSubmitting(form, submitButton, true, form.dataset.loadingLabel || undefined);

    try {
      const result = await submitJson('/api/preview-applications', {
        ...data,
        website: normalizeWebsite(data.website),
        ...trackingFields(),
      });
      if (!result.ok) {
        reportSubmitFailure(form, result, 'Please try again in a moment.', 'Your request was not sent');
        return;
      }
      form.reset();
      showFormErrors(form, {});
      showToast({ title: form.dataset.successTitle, message: form.dataset.successMessage });
    } catch (err) {
      showToast({ type: 'error', title: 'Your request was not sent', message: 'Please check your connection and try again.' });
    } finally {
      submitting = false;
      setSubmitting(form, submitButton, false);
    }
  });
}
