// Shared validation and error display for every SFD form (booking modal,
// Free Preview, Contact, future forms). Errors render into
// <p data-error-for="<field name>"> elements; the owning .field also gets
// .field--invalid so the control's border turns red.

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;
// Optional http(s)://, then a dotted hostname with a 2+ letter TLD, then an
// optional port/path/query. "www." and the protocol are both optional, so
// "example.com" and "www.example.com/about" are valid as typed.
const WEBSITE_PATTERN = /^(https?:\/\/)?([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;

export const WEBSITE_ERROR_MESSAGE = 'Enter a valid website address, e.g. example.com.';

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value || '').trim());
}

export function isValidWebsite(value) {
  return WEBSITE_PATTERN.test(String(value || '').trim());
}

/** Adds https:// when the visitor typed a bare domain; leaves empty values empty. */
export function normalizeWebsite(value) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Form values with every string trimmed. */
export function readForm(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = typeof value === 'string' ? value.trim() : value;
  });
  return data;
}

function errorEl(form, name) {
  return form.querySelector(`[data-error-for="${name}"]`);
}

function setError(form, name, message) {
  const el = errorEl(form, name);
  if (!el) return;
  el.textContent = message || '';
  el.hidden = !message;
  const field = el.closest('.field');
  if (field) field.classList.toggle('field--invalid', Boolean(message));
}

/** Shows `errors` ({ fieldName: message }) and clears every other field's error. */
export function showFormErrors(form, errors) {
  form.querySelectorAll('[data-error-for]').forEach((el) => {
    setError(form, el.getAttribute('data-error-for'), errors[el.getAttribute('data-error-for')]);
  });
  const firstInvalid = form.querySelector('.field--invalid .field__control, .field--invalid input, .field--invalid button');
  if (firstInvalid && Object.keys(errors).length) firstInvalid.focus();
}

/** Validates optional website inputs on blur, like the phone field does. */
export function initWebsiteInputs(form) {
  form.querySelectorAll('input[data-website-input]').forEach((input) => {
    input.addEventListener('blur', () => {
      if (!input.value.trim()) return setError(form, input.name, '');
      setError(form, input.name, isValidWebsite(input.value) ? '' : WEBSITE_ERROR_MESSAGE);
    });
  });
}
