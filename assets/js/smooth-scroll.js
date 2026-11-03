// Inertial smooth scrolling (Lenis, vendored at assets/js/vendor/lenis.min.js, loaded
// before this module). Skipped for visitors who ask for reduced motion; dialogs and
// drawers keep native scrolling.
export function initSmoothScroll() {
  if (typeof window.Lenis !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('dialog, [role="dialog"], .more-drawer').forEach((el) => {
    el.setAttribute('data-lenis-prevent', '');
  });
  const lenis = new window.Lenis({ lerp: 0.09, anchors: true });
  document.documentElement.classList.add('lenis', 'lenis-smooth');
  const raf = (t) => {
    lenis.raf(t);
    window.requestAnimationFrame(raf);
  };
  window.requestAnimationFrame(raf);
}
