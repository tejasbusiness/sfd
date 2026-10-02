// Free Website Review request (homepage band above the footer). POSTs to
// /api/website-review (docs/14), which stores the request and emails the team;
// the review itself is prepared and sent by hand.

import { isValidEmail, isValidWebsite, normalizeWebsite, initWebsiteInputs, readForm, showFormErrors, submitJson, trackingFields, reportSubmitFailure, setSubmitting, WEBSITE_ERROR_MESSAGE } from './form-utils.js';
import { showToast } from './toast.js';

function validate(data) {
  const errors = {};
  if (!data.website) errors.website = 'Website address is required.';
  else if (!isValidWebsite(data.website)) errors.website = WEBSITE_ERROR_MESSAGE;
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.consent) errors.consent = 'Please confirm before sending.';
  return errors;
}

export function initWebsiteReviewForm(form) {
  if (!form) return;

  const submitButton = form.querySelector('[data-website-review-submit]');
  let submitting = false;
  initWebsiteInputs(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const data = readForm(form);
    data.consent = form.elements.consent.checked;
    const errors = validate(data);
    showFormErrors(form, errors);
    if (Object.keys(errors).length > 0) return;
    data.website = normalizeWebsite(data.website);

    submitting = true;
    setSubmitting(form, submitButton, true);

    try {
      const result = await submitJson('/api/website-review', { ...data, ...trackingFields() });
      if (!result.ok) {
        reportSubmitFailure(form, result, 'Please try again in a moment.', 'Request not sent');
        return;
      }
      form.reset();
      showFormErrors(form, {});
      showToast({ title: form.dataset.successTitle, message: form.dataset.successMessage });
    } catch (err) {
      showToast({ type: 'error', title: 'Request not sent', message: 'Please check your connection and try again.' });
    } finally {
      submitting = false;
      setSubmitting(form, submitButton, false);
    }
  });
}
