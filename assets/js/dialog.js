// Shared accessible dialog controller built on the native <dialog> element.
// showModal()/close() give focus trapping and Escape-to-close natively in
// evergreen browsers; the explicit focus-return below is a cross-browser safety net.

export function setupDialog(dialogEl) {
  let triggerEl = null;

  function open(trigger) {
    triggerEl = trigger || document.activeElement;
    dialogEl.showModal();
  }

  function close() {
    dialogEl.close();
  }

  dialogEl.addEventListener('close', () => {
    if (triggerEl && typeof triggerEl.focus === 'function') {
      triggerEl.focus();
    }
  });

  // Click on the backdrop (the <dialog> element itself, outside its panel) closes it.
  dialogEl.addEventListener('click', (event) => {
    if (event.target === dialogEl) {
      close();
    }
  });

  return { open, close };
}
