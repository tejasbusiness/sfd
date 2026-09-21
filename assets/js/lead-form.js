// Free AI Prompts Playbook signup (name + email). POSTs to /api/playbook (docs/14),
// which stores the subscriber and notifies the team. The playbook itself is still
// sent by hand until automated delivery exists.

import { isValidEmail, readForm, showFormErrors, submitJson, trackingFields, reportSubmitFailure, setSubmitting } from './form-utils.js';
import { showToast } from './toast.js';

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
      const result = await submitJson('/api/playbook', { ...data, ...trackingFields() });
      if (!result.ok) {
        reportSubmitFailure(form, result, 'Please try again in a moment.', 'Sign-up not completed');
        return;
      }
      form.reset();
      showFormErrors(form, {});
      showToast({ title: form.dataset.successTitle, message: form.dataset.successMessage });
    } catch (err) {
      showToast({ type: 'error', title: 'Sign-up not completed', message: 'Please check your connection and try again.' });
    } finally {
      submitting = false;
      setSubmitting(form, submitButton, false);
    }
  });
}
