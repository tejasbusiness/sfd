// Studio effects (2026-11-05): the oversized quote that lights up word by word as it
// scrolls through the viewport, the duplicated logo list for the marquee, and the word
// flip on display statements (each word crossfades from the display face to light Inter
// on hover, and one random word flips now and then). All decorative: the quote and the
// statements stay plain text in the DOM, the marquee copy is aria-hidden. Reduced-motion
// visitors get the lit quote, a static logo row and no flips (html.motion gate).

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

/* Word flip. motion.js may already have split the headline into .wi word boxes; when it
   has, each .wi becomes the flip box, otherwise the words are split here. */
function makeFlip(node) {
  const text = node.textContent;
  if (!text.trim()) return null;
  node.textContent = '';
  node.classList.add('flip-word');
  const a = document.createElement('span');
  a.className = 'flip-word__a';
  a.textContent = text;
  const b = document.createElement('span');
  b.className = 'flip-word__b';
  b.setAttribute('aria-hidden', 'true');
  b.textContent = text;
  node.append(a, b);
  return node;
}

function initWordFlip() {
  if (!document.documentElement.classList.contains('motion')) return;
  const boxes = [];
  document.querySelectorAll('[data-flip-words]').forEach((el) => {
    const inner = el.querySelectorAll('.wi');
    if (inner.length) {
      inner.forEach((wi) => {
        const f = makeFlip(wi);
        if (f) boxes.push(f);
      });
      return;
    }
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.textContent = w;
      el.appendChild(span);
      const f = makeFlip(span);
      if (f) boxes.push(f);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });
  if (!boxes.length) return;
  let last = -1;
  const tick = () => {
    if (document.hidden) return;
    let i = Math.floor(Math.random() * boxes.length);
    if (i === last) i = (i + 1) % boxes.length;
    last = i;
    const box = boxes[i];
    box.classList.add('is-flipped');
    window.setTimeout(() => box.classList.remove('is-flipped'), 1100);
  };
  window.setInterval(tick, 2600);
}

export function initStudioFx() {
  initQuoteReveal();
  initLogoMarquee();
  // After motion.js (same DOMContentLoaded handler) has split the headlines.
  window.setTimeout(initWordFlip, 0);
}
