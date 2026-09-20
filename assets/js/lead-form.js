// Free AI Prompts Playbook signup (name + email) — FRONTEND-ONLY DEMO, same status
// as the other forms. It validates and shows a mock success state; nothing is
// stored or sent until a secure endpoint exists (integrations.public.json
// webhookUrl is null), so no playbook is delivered yet.

import { isValidEmail, readForm, showFormErrors } from './form-utils.js';

function validate(data) {
  const errors = {};
  if (!data.fullName) errors.fullName = 'Full name is required.';
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email address.';
  if (!data.consent) errors.consent = 'Please confirm before signing up.';
  return errors;
}

async function mockSubscribe() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
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
    const errors = validate(data);
    showFormErrors(form, errors);
    if (Object.keys(errors).length > 0) return;

    submitting = true;
    submitButton.disabled = true;
    submitError.hidden = true;

    try {
      const result = await mockSubscribe(data);
      if (!result.ok) throw new Error('subscribe failed');
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
