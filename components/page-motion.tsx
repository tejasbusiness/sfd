'use client';
import { useEffect } from 'react';
export default function PageMotion() {
  useEffect(() => {
    let cleanup = () => {};
    let dead = false;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (dead) return;
      gsap.registerPlugin(ScrollTrigger);
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.hero-copy > *', { y: 22, opacity: 0, duration: 1, stagger: .13, ease: 'power2.out', clearProps: 'all' });
        gsap.utils.toArray<HTMLElement>('.reveal').forEach(el => gsap.from(el, { y: 30, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true }, clearProps: 'all' }));
        gsap.utils.toArray<HTMLElement>('.moving-heading span').forEach((el, i) => gsap.fromTo(el, { x: i ? 80 : -80 }, { x: i ? -20 : 20, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 } }));
      });
      mm.add({ desktop: '(min-width: 981px)', tablet: '(min-width: 641px) and (max-width: 980px)', mobile: '(max-width: 640px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
        if (!context.conditions?.motion) return;
        const { desktop, mobile } = context.conditions;
        gsap.utils.toArray<HTMLElement>('[data-card-spread]').forEach(grid => {
          const cards = Array.from(grid.children) as HTMLElement[];
          const columns = mobile ? 1 : desktop || grid.classList.contains('process-grid') ? 3 : 2;
          for (let row = 0; row < cards.length; row += columns) {
            const group = cards.slice(row, row + columns);
            group.forEach((card, column) => {
              const side = column - (group.length - 1) / 2;
              // Each row fans outward into its natural layout as it enters the viewport.
              gsap.fromTo(card, { x: () => -side * card.offsetWidth * .66, y: mobile ? 36 : Math.abs(side) * 10, rotation: mobile ? (row % 2 ? 3 : -3) : side * 9, transformOrigin: '50% 50%' }, {
                x: 0, y: 0, rotation: 0, ease: 'none',
                scrollTrigger: { trigger: grid, start: () => `top+=${card.offsetTop} 95%`, end: () => `top+=${card.offsetTop} ${mobile ? '65%' : '48%'}`, scrub: .65, invalidateOnRefresh: true },
              });
            });
          }
        });
      });
      cleanup = () => mm.revert();
      document.fonts.ready.then(() => { if (!dead) ScrollTrigger.refresh(); });
    }).catch(() => {});
    return () => { dead = true; cleanup(); };
  }, []);
  return null;
}
