// Progressive-enhancement scroll reveal (docs/13 §7). Elements only get the
// hidden initial state once this runs and adds .reveal-init — with no JS, or
// if IntersectionObserver is unsupported, content stays fully visible.
export function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const elements = document.querySelectorAll('[data-reveal]');
  if (elements.length === 0) return;

  elements.forEach((el) => el.classList.add('reveal-init'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          window.setTimeout(() => el.classList.add('is-visible'), i * 70);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}
