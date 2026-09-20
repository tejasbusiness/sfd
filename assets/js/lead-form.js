// Free AI Prompts Playbook signup (name + email). POSTs to /api/playbook (docs/14),
// which stores the subscriber and notifies the team. The playbook itself is still
// sent by hand until automated delivery exists.

import { isValidEmail, readForm, showFormErrors, submitJson, trackingFields, reportSubmitFailure } from './form-utils.js';

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.consent) errors.consent = 'Please confirm before signing up.';
  return errors;
}

export function initLeadForm(form) {
  if (!form) return;

  const submitButton = form.querySelector('[data-lead-submit]');
  const submitError = form.querySelector('[data-submit-error]');
  const successEl = document.querySelector('[data-lead-success]');
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
      const result = await submitJson('/api/playbook', { ...data, ...trackingFields() });
      if (!result.ok) {
        reportSubmitFailure(form, submitError, result, 'Something went wrong. Please try again.');
        return;
      }
      form.hidden = true;
      if (successEl) {
        successEl.hidden = false;
        successEl.setAttribute('tabindex', '-1');
        successEl.focus();
      }
    } catch (err) {
      submitError.textContent = 'Something went wrong. Please try again.';
      submitError.hidden = false;
    } finally {
      submitting = false;
      submitButton.disabled = false;
    }
  });
}
