// Studio effects (2026-11-05): the oversized quote that lights up word by word as it
// scrolls through the viewport, the duplicated logo list for the marquee, and the
// cursor weight field on display statements (each letter of the variable display font
// eases toward a thinner weight the closer the pointer is, as in the owner's reference
// video docs/text-effect.mp4). All decorative: the quote and the statements stay plain
// text in the DOM, the marquee copy is aria-hidden. Reduced-motion visitors get the lit
// quote, a static logo row and the plain heavy headline (html.motion gate).

function initQuoteReveal() {
  const quotes = document.querySelectorAll('[data-quote-reveal]');
  if (!quotes.length) return;
  const motion = document.documentElement.classList.contains('motion');
  quotes.forEach((p) => {
    const words = p.textContent.trim().split(/\s+/);
    p.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'quote-word' + (motion ? '' : ' is-lit');
      span.textContent = w;
      p.appendChild(span);
      if (i < words.length - 1) p.appendChild(document.createTextNode(' '));
    });
  });
  if (!motion) return;
  const spans = Array.from(document.querySelectorAll('.quote-word'));
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = window.innerHeight * 0.68;
    spans.forEach((s) => {
      const r = s.getBoundingClientRect();
      s.classList.toggle('is-lit', r.top + r.height / 2 < line);
    });
  };
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
}

function initLogoMarquee() {
  const list = document.querySelector('.page-home .client-logos__list');
  if (!list || list.dataset.cloned) return;
  const track = document.createElement('div');
  track.className = 'client-logos__track';
  list.parentNode.insertBefore(track, list);
  track.appendChild(list);
  if (!document.documentElement.classList.contains('motion')) return;
  const copy = list.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
  Array.from(copy.children).forEach((li) => list.appendChild(li));
  list.dataset.cloned = '1';
}

/* Weight field. Letters are wrapped in spans (words stay unbreakable); motion.js may
   already have split the headline into .wi word boxes, which are reused as the words. */
const HEAVY = 900;
const LIGHT = 280;
const RADIUS = 240; // px from the pointer at which letters are fully heavy again

function splitLetters(wordEl) {
  const text = wordEl.textContent;
  wordEl.textContent = '';
  wordEl.classList.add('wf-word');
  const chars = [];
  for (const ch of text) {
    const s = document.createElement('span');
    s.className = 'wf-char';
    s.textContent = ch;
    wordEl.appendChild(s);
    chars.push({ el: s, w: HEAVY, target: HEAVY, x: 0, y: 0 });
  }
  return chars;
}

function initWeightField() {
  if (!document.documentElement.classList.contains('motion')) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const chars = [];
  document.querySelectorAll('[data-weight-field]').forEach((el) => {
    if (!el.getAttribute('aria-label') && el.getAttribute('aria-hidden') !== 'true') {
      el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    }
    const words = el.querySelectorAll('.wi');
    if (words.length) {
      words.forEach((w) => chars.push(...splitLetters(w)));
      return;
    }
    const parts = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    parts.forEach((p, i) => {
      const w = document.createElement('span');
      w.textContent = p;
      el.appendChild(w);
      chars.push(...splitLetters(w));
      if (i < parts.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  if (!chars.length) return;

  let px = -1e4;
  let py = -1e4;
  let raf = 0;
  let measured = false;
  const measure = () => {
    chars.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2;
      c.y = r.top + r.height / 2;
    });
    measured = true;
  };
  const frame = () => {
    raf = 0;
    if (!measured) measure();
    let busy = false;
    chars.forEach((c) => {
      const d = Math.hypot(c.x - px, c.y - py);
      const t = Math.max(0, 1 - d / RADIUS);
      const ease = t * t * (3 - 2 * t);
      c.target = HEAVY - (HEAVY - LIGHT) * ease;
      c.w += (c.target - c.w) * 0.18;
      if (Math.abs(c.target - c.w) > 0.5) busy = true;
      c.el.style.fontVariationSettings = '"wght" ' + c.w.toFixed(0);
    });
    if (busy) raf = window.requestAnimationFrame(frame);
  };
  const kick = () => {
    if (!raf) raf = window.requestAnimationFrame(frame);
  };
  document.addEventListener('pointermove', (e) => {
    px = e.clientX;
    py = e.clientY;
    kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => {
    px = -1e4;
    py = -1e4;
    kick();
  });
  const invalidate = () => {
    measured = false;
    kick();
  };
  window.addEventListener('scroll', invalidate, { passive: true });
  window.addEventListener('resize', invalidate);
  // The headline reveal moves the letters for about a second after load.
  window.setTimeout(invalidate, 1800);
}

export function initStudioFx() {
  initQuoteReveal();
  initLogoMarquee();
  // After motion.js (same DOMContentLoaded handler) has split the headlines.
  window.setTimeout(initWeightField, 0);
}
