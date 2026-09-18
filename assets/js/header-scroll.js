// Minimal, rAF-throttled sticky-header scroll state (docs/13 §6). A fixed
// threshold avoids flicker right at the top; the header's solid background
// is the CSS default regardless of this class (see components.css).
export function initHeaderScroll() {
  const header = document.querySelector('[data-site-header]');
  if (!header) return;

  const THRESHOLD = 12;
  let ticking = false;

  function update() {
    header.classList.toggle('site-header--scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );

  update();
}
