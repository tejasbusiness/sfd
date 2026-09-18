// Free Preview application form — FRONTEND-ONLY DEMO.
// Validates client-side and shows a mock success state. No real submission endpoint
// exists yet — wiring this to a secure backend is a later phase — and per
// docs/04-page-blueprints.md it must never claim to guarantee a preview.

import { initPhoneInputs, isValidMobileNumber } from './phone-input.js';

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'countryCode',
  'mobileNumber',
  'businessName',
  'country',
  'city',
  'category',
  'primaryService',
  'problem',
];

function validate(data) {
  const errors = {};
  REQUIRED_FIELDS.forEach((field) => {
    if (!String(data[field] || '').trim()) errors[field] = 'This field is required.';
  });
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Enter a valid email address.';
  if (data.mobileNumber && !isValidMobileNumber(data.mobileNumber)) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number.';
  }
  if (!data.consent) errors.consent = 'Please confirm before submitting.';
  return errors;
}

async function mockSubmitApplication() {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}

export function initFreePreviewForm(form) {
  if (!form) return;

  initPhoneInputs(form);

  const submitButton = form.querySelector('[data-free-preview-submit]');
  const submitError = form.querySelector('[data-submit-error]');
  const successEl = document.querySelector('[data-free-preview-success]');
  let submitting = false;

  function showErrors(errors) {
    form.querySelectorAll('[data-error-for]').forEach((el) => {
      const field = el.getAttribute('data-error-for');
      el.textContent = errors[field] || '';
      el.hidden = !errors[field];
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.consent = formData.get('consent') === 'on';

    const errors = validate(data);
    showErrors(errors);
    if (Object.keys(errors).length > 0) return;

    submitting = true;
    submitButton.disabled = true;
    submitError.hidden = true;

    try {
      const result = await mockSubmitApplication();
      if (!result.ok) throw new Error('submit failed');
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
