// Mobile-number input handling, shared by the booking modal and the Free
// Preview form. The country code is a separate field (assets/js/country-select.js)
// — this only covers the local 10-digit mobile number. type="tel" imposes no
// format restriction on its own, so without this a user could type letters
// or an unbounded run of digits.

const MOBILE_DIGITS = 10;

function sanitizeMobile(value) {
  return value.replace(/\D/g, '').slice(0, MOBILE_DIGITS);
}

export function isValidMobileNumber(value) {
  return new RegExp(`^\\d{${MOBILE_DIGITS}}$`).test(String(value || '').trim());
}

function findField(input) {
  return input.closest('.field');
}

function findErrorEl(input) {
  const scope = input.closest('form') || document;
  return (
    scope.querySelector(`[data-booking-error-for="${input.name}"]`) ||
    scope.querySelector(`[data-error-for="${input.name}"]`)
  );
}

const MOBILE_ERROR_MESSAGE = `Enter a valid ${MOBILE_DIGITS}-digit mobile number.`;

export function initPhoneInputs(root = document) {
  root.querySelectorAll('input[type="tel"].phone-field__number').forEach((input) => {
    if (input.dataset.phoneEnhanced === 'true') return;
    input.dataset.phoneEnhanced = 'true';

    input.addEventListener('input', () => {
      const before = input.value;
      const after = sanitizeMobile(before);
      if (after !== before) {
        const diff = before.length - after.length;
        const caret = input.selectionStart;
        input.value = after;
        if (caret != null) {
          const nextCaret = Math.max(caret - diff, 0);
          input.setSelectionRange(nextCaret, nextCaret);
        }
      }

      // Clear a stale invalid state as soon as the value becomes valid again —
      // full re-validation (including "still empty") happens on blur/submit.
      const field = findField(input);
      if (field && field.classList.contains('field--invalid') && isValidMobileNumber(input.value)) {
        field.classList.remove('field--invalid');
        const errorEl = findErrorEl(input);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.hidden = true;
        }
      }
    });

    input.addEventListener('blur', () => {
      if (!input.value) return; // required-field check belongs to submit validation
      const valid = isValidMobileNumber(input.value);
      const field = findField(input);
      const errorEl = findErrorEl(input);
      if (field) field.classList.toggle('field--invalid', !valid);
      if (errorEl) {
        errorEl.textContent = valid ? '' : MOBILE_ERROR_MESSAGE;
        errorEl.hidden = valid;
      }
    });
  });
}
