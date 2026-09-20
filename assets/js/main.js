import { setupDialog } from './dialog.js';
import { initBookingModal } from './booking.js';
import { initFreePreviewForm } from './free-preview-form.js';
import { initContactForm } from './contact-form.js';
import { initLeadForm } from './lead-form.js';
import { initHeaderScroll } from './header-scroll.js';
import { initScrollReveal } from './scroll-reveal.js';
import { initCustomSelects } from './custom-select.js';
import { initCountrySelects } from './country-select.js';
import { initLegalToc } from './legal-toc.js';

// Several triggers (header button, mobile-nav button, page CTAs) can all open the
// same sitewide dialog (e.g. #booking-modal) — one controller per dialog, shared.
function initDialogTriggers() {
  const controllers = new Map();

  document.querySelectorAll('[data-dialog-target]').forEach((trigger) => {
    const targetId = trigger.getAttribute('data-dialog-target');
    const dialogEl = document.getElementById(targetId);
    if (!dialogEl) return;

    if (!controllers.has(targetId)) {
      controllers.set(targetId, setupDialog(dialogEl));

      dialogEl.querySelectorAll('[data-dialog-close]').forEach((closeButton) => {
        closeButton.addEventListener('click', () => dialogEl.close());
      });
    }
    const controller = controllers.get(targetId);

    trigger.addEventListener('click', (event) => {
      // Triggers that are real links (e.g. "Book a Free 30-Minute Discovery Call" -> /book-a-call/)
      // work as plain navigation without JS; with JS, open the modal instead.
      event.preventDefault();
      // A trigger living inside another open dialog (e.g. "Book a 15-Minute
      // Call" inside the More drawer) closes that dialog first — only one
      // modal makes sense open at a time on top of the drawer.
      const ancestorDialog = trigger.closest('dialog');
      if (ancestorDialog && ancestorDialog !== dialogEl && ancestorDialog.open) {
        ancestorDialog.close();
      }
      if (trigger.hasAttribute('aria-expanded')) {
        trigger.setAttribute('aria-expanded', 'true');
      }
      controller.open(trigger);
    });

    dialogEl.addEventListener('close', () => {
      if (trigger.hasAttribute('aria-expanded')) {
        trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initDialogTriggers();
  initBookingModal(document.getElementById('booking-modal'));
  initFreePreviewForm(document.querySelector('[data-free-preview-form]'));
  initContactForm(document.querySelector('[data-contact-form]'));
  initLeadForm(document.querySelector('[data-lead-form]'));
  initHeaderScroll();
  initScrollReveal();
  initCustomSelects();
  initCountrySelects();
  initLegalToc();
});
