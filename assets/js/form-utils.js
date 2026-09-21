// Shared validation and error display for every SFD form (booking modal,
// Free Preview, Contact, future forms). Errors render into
// <p data-error-for="<field name>"> elements; the owning .field also gets
// .field--invalid so the control's border turns red.

import { showToast } from './toast.js';

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

/** Where the visitor came from, sent with every lead form (current URL only, nothing is stored on the device). */
export function trackingFields() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['source', 'medium', 'campaign', 'term', 'content'].forEach((key) => {
    const value = params.get(`utm_${key}`);
    if (value) utm[key] = value.slice(0, 150);
  });
  return { sourcePage: window.location.pathname, utm };
}

/**
 * POSTs JSON to the SFD API (see docs/14). Resolves with { ok, status, data };
 * only a network failure rejects, so callers can show their usual error message.
 */
export async function submitJson(url, body, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  });
  let data = {};
  try {
    data = await response.json();
  } catch (err) {
    data = {};
  }
  return { ok: response.ok && data.ok === true, status: response.status, data };
}

/**
 * Reports a failed submit. Field errors from the server (422) are shown under their
 * fields; everything else (rate limit, server or network trouble) is a red toast.
 */
export function reportSubmitFailure(form, result, fallbackMessage, title = 'Something went wrong') {
  if (result.status === 422 && result.data.errors) {
    showFormErrors(form, result.data.errors);
    const stray = Object.keys(result.data.errors).some((name) => !form.querySelector(`[data-error-for="${name}"]`));
    if (!stray) return;
  }
  if (result.status === 429) {
    showToast({ type: 'error', title: 'Too many attempts', message: 'Please wait a little while and try again.' });
    return;
  }
  showToast({ type: 'error', title, message: fallbackMessage });
}

/**
 * Puts a form's submit button into (or out of) its "sending" state: disabled so it
 * cannot be pressed twice, with a spinner and a busy label, and a polite screen-reader
 * message. Call with busy = false after a failed request or once the form has been reset.
 */
export function setSubmitting(form, button, busy, label = 'Sending…') {
  if (!button) return;
  let status = form.querySelector('[data-submit-status]');
  if (!status) {
    status = document.createElement('p');
    status.className = 'visually-hidden';
    status.setAttribute('role', 'status');
    status.setAttribute('data-submit-status', '');
    form.append(status);
  }
  if (busy) {
    if (button.dataset.idleLabel === undefined) button.dataset.idleLabel = button.textContent;
    const spinner = document.createElement('span');
    spinner.className = 'button__spinner';
    spinner.setAttribute('aria-hidden', 'true');
    button.replaceChildren(spinner, document.createTextNode(label));
    button.classList.add('is-loading');
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    form.setAttribute('aria-busy', 'true');
    status.textContent = label;
  } else {
    if (button.dataset.idleLabel !== undefined) {
      button.textContent = button.dataset.idleLabel;
      delete button.dataset.idleLabel;
    }
    button.classList.remove('is-loading');
    button.disabled = false;
    button.removeAttribute('aria-busy');
    form.removeAttribute('aria-busy');
    status.textContent = '';
  }
}
