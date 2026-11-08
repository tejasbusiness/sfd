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
  list.dataset.cloned = '1';
  const originals = Array.from(list.children);
  // Tile enough copies of the set to cover the track plus one spare set, then shift by
  // exactly one set's width so the loop is seamless at any viewport width.
  const build = () => {
    list.querySelectorAll('[data-clone]').forEach((n) => n.remove());
    list.style.removeProperty('--marquee-shift');
    const setW = originals.reduce((sum, li) => sum + li.getBoundingClientRect().width, 0);
    if (!setW) return;
    const sets = Math.ceil(track.clientWidth / setW) + 1;
    for (let i = 0; i < sets; i += 1) {
      originals.forEach((li) => {
        const c = li.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.setAttribute('data-clone', '');
        c.querySelectorAll('img').forEach((img) => img.setAttribute('alt', ''));
        list.appendChild(c);
      });
    }
    list.style.setProperty('--marquee-shift', setW.toFixed(1) + 'px');
    list.style.setProperty('--marquee-duration', Math.max(18, setW / 45).toFixed(1) + 's'); // about 45px per second
  };
  build();
  let t = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(t);
    t = window.setTimeout(build, 200);
  });
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
  // Thinner weights are narrower, so without this a thinned cluster shortens the line
  // and the headline re-wraps. Each letter keeps the width it has at weight 900.
  const lockWidths = () => {
    chars.forEach((c) => {
      c.el.style.width = '';
      c.el.style.fontVariationSettings = '"wght" 900';
    });
    const widths = chars.map((c) => c.el.getBoundingClientRect().width);
    chars.forEach((c, i) => {
      c.el.style.width = widths[i].toFixed(2) + 'px';
      c.el.style.fontVariationSettings = '"wght" ' + c.w.toFixed(0);
    });
    measured = false;
  };
  const measure = () => {
    chars.forEach((c) => {
      const r = c.el.getBoundingClientRect();
      c.x = r.left + r.width / 2;
      c.y = r.top + r.height / 2;
    });
    measured = true;
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(lockWidths);
  else lockWidths();
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
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      lockWidths();
      kick();
    }, 120);
  });
  // The headline reveal moves the letters for about a second after load.
  window.setTimeout(invalidate, 1800);
}

/* "Based in" local time in the footer: hours and minutes in the company time zone. */
function initLocalTime() {
  const els = document.querySelectorAll('[data-local-time]');
  if (!els.length) return;
  const tick = () => {
    els.forEach((el) => {
      try {
        el.textContent = new Intl.DateTimeFormat([], { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: el.dataset.localTime }).format(new Date());
      } catch (e) {
        el.textContent = '';
      }
    });
  };
  tick();
  window.setInterval(tick, 30000);
}

/* The fixed dock slides away while a hero's button row would sit under it (short
   viewports), and returns as soon as the buttons scroll clear. */
function initDock() {
  const dock = document.querySelector('.dock');
  const avoid = document.querySelectorAll('.hero-statement__actions, .hero-split__actions');
  if (!dock || !avoid.length) return;
  let raf = 0;
  const update = () => {
    raf = 0;
    const h = dock.offsetHeight;
    if (!h) return;
    const dockTop = window.innerHeight - 20 - h - 12; // bottom offset plus breathing room
    let hit = false;
    avoid.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.height && r.bottom > dockTop && r.top < window.innerHeight) hit = true;
    });
    dock.classList.toggle('is-hidden', hit);
  };
  const kick = () => {
    if (!raf) raf = window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', kick, { passive: true });
  window.addEventListener('resize', kick);
  update();
  window.setTimeout(update, 1800);
}

/* Sticker sheen: the highlight on a hovered sticker follows the pointer (CSS --mx/--my). */
function initStickerShine() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('.sticker').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    }, { passive: true });
    el.addEventListener('pointerleave', () => {
      el.style.removeProperty('--mx');
      el.style.removeProperty('--my');
    });
  });
}

/* Draggable stickers: pointer drag inside the hero (or the footer statement), clamped so a
   sticker never leaves its area; it stays where it is dropped. Desktop layout only (above 1280px). */
function initStickerDrag() {
  if (!document.documentElement.classList.contains('motion')) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (window.matchMedia('(max-width: 760px)').matches) return; // stickers are a static chip row on phones
  document.querySelectorAll('.sticker').forEach((el) => {
    const area = el.closest('.hero-statement, .footer-statement');
    if (!area) return;
    el.classList.add('is-draggable');
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let baseY = 0;
    let rect0 = null;
    let areaRect = null;
    let active = false;
    el.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      active = true;
      el.setPointerCapture(e.pointerId);
      el.classList.add('is-dragging');
      startX = e.clientX;
      startY = e.clientY;
      baseX = parseFloat(el.dataset.dx || '0');
      baseY = parseFloat(el.dataset.dy || '0');
      rect0 = el.getBoundingClientRect();
      areaRect = area.getBoundingClientRect();
      e.preventDefault();
    });
    el.addEventListener('pointermove', (e) => {
      if (!active) return;
      let mx = e.clientX - startX;
      let my = e.clientY - startY;
      mx = Math.min(Math.max(mx, areaRect.left - rect0.left), areaRect.right - rect0.right);
      my = Math.min(Math.max(my, areaRect.top - rect0.top), areaRect.bottom - rect0.bottom);
      el.style.setProperty('--dx', (baseX + mx).toFixed(1) + 'px');
      el.style.setProperty('--dy', (baseY + my).toFixed(1) + 'px');
    });
    const end = (e) => {
      if (!active) return;
      active = false;
      el.classList.remove('is-dragging');
      el.dataset.dx = parseFloat(el.style.getPropertyValue('--dx')) || baseX;
      el.dataset.dy = parseFloat(el.style.getPropertyValue('--dy')) || baseY;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
  });
}

export function initStudioFx() {
  initLocalTime();
  initStickerShine();
  initDock();
  // After motion.js (same DOMContentLoaded handler, runs later) has added html.motion and
  // split the headlines: these three behave differently with and without motion, so they
  // must not read the class before it is set.
  window.setTimeout(() => {
    initQuoteReveal();
    initLogoMarquee();
    initWeightField();
    initStickerDrag();
  }, 0);
}
