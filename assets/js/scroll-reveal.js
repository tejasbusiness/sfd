// Progressive-enhancement scroll reveal (docs/13 §7). Elements only get the
// hidden initial state once this runs and adds .reveal-init — with no JS, or
// if IntersectionObserver is unsupported, content stays fully visible.
export function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  const elements = document.querySelectorAll('[data-reveal]');
  if (elements.length === 0) return;

  elements.forEach((el) => {
    el.classList.add('reveal-init');
    // Index each card inside the block so motion.css can stagger them.
    el.querySelectorAll('.card').forEach((card, i) => card.style.setProperty('--i', String(Math.min(i, 8))));
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          window.setTimeout(() => {
            el.classList.add('is-visible');
            // Once the entrance has played, drop the hidden-state class so cards get their normal hover transitions back.
            window.setTimeout(() => el.classList.remove('reveal-init'), 1700);
          }, i * 70);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}
