// Shared accessible dialog controller built on the native <dialog> element.
// showModal()/close() give focus trapping and Escape-to-close natively in
// evergreen browsers; the explicit focus-return below is a cross-browser safety net.

export function setupDialog(dialogEl) {
  let triggerEl = null;

  function open(trigger) {
    triggerEl = trigger || document.activeElement;
    // showModal() does not stop the page behind it from scrolling in most
    // browsers — without this, a tall dialog shows both its own scrollbar
    // and the document's, stacked side by side.
    document.body.classList.add('has-open-dialog');
    dialogEl.showModal();
  }

  function close() {
    dialogEl.close();
  }

  dialogEl.addEventListener('close', () => {
    document.body.classList.remove('has-open-dialog');
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
