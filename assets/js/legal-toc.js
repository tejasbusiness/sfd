// "On this page" contents list on legal pages: scrolls to the clause without
// writing #section-id into the address bar, so the URL stays clean. The links keep
// their #hrefs, so without JavaScript they still jump to the clause.
export function initLegalToc() {
  const toc = document.querySelector('.legal-doc__toc');
  if (!toc) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  toc.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const clause = document.getElementById(link.getAttribute('href').slice(1));
    if (!clause) return;

    event.preventDefault();
    clause.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });

    // Move keyboard/screen-reader focus to the clause heading.
    const heading = clause.querySelector('h2');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  });
}
