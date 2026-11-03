// Sitewide motion layer: ambient particle fields, headline word reveals, card
// spotlight, magnetic buttons, parallax and a scroll-progress bar. Vanilla JS,
// no dependency. Everything is progressive enhancement: JS adds `motion` to
// <html> only when the visitor has not asked for reduced motion, and every
// effect below is gated on it, so reduced-motion and no-JS visitors get the
// fully visible static page (CLAUDE.md rule 12).

const FX_TARGETS = '.hero--band, .hero-split, .trust-signals, .section--brand, .section--dark, .cta-banner';
const MAGNETIC = '.hero--band .button, .hero-split .button, .cta-editorial .button, .cta-banner .button';

const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

function rgbaFromCssColor(value, alpha) {
  const m = String(value).match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return `rgba(214, 149, 0, ${alpha})`;
  return `rgba(${m[0]}, ${m[1]}, ${m[2]}, ${alpha})`;
}

/* ---------------------------------------------------------------- particles */

function createParticleField(host, canvas, tone) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const small = window.matchMedia('(max-width: 700px)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const saveData = navigator.connection && navigator.connection.saveData;
  if (saveData) return null;

  const root = document.documentElement;
  const useDark = () => tone === 'dark' || root.getAttribute('data-theme') === 'dark';
  const LIGHT_DOT = rgbaFromCssColor('rgb(60, 30, 110)', 0.35);
  const DARK_DOT = 'rgba(214, 149, 0, 0.7)';
  const THEME_DARK_DOT = 'rgba(150, 175, 255, 0.8)'; // dark theme is blue, not gold

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let running = false;
  let raf = 0;
  let last = 0;
  const pointer = { x: -9999, y: -9999, active: false };

  function resize() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const base = (width * height) / (small ? 16000 : 11000);
    const count = Math.round(Math.min(small ? 26 : cores <= 4 ? 44 : 64, Math.max(14, base)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.6 + 0.7,
    }));
  }

  function frame(now) {
    if (!running) return;
    raf = window.requestAnimationFrame(frame);
    if (now - last < 28) return; // about 35 fps is plenty for slow drift
    const dt = Math.min(2, (now - last) / 16.7 || 1);
    last = now;
    ctx.clearRect(0, 0, width, height);
    const dark = useDark();
    const dotColor = dark ? (root.getAttribute('data-theme') === 'dark' ? THEME_DARK_DOT : DARK_DOT) : LIGHT_DOT;
    const lineColor = dark ? [255, 255, 255] : [60, 30, 110];
    const lineAlpha = dark ? 0.16 : 0.12;
    const linkDist = small ? 86 : 118;

    for (const p of particles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.x < -10) p.x = width + 10;
      else if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      else if (p.y > height + 10) p.y = -10;
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 130 * 130 && d2 > 1) {
          const d = Math.sqrt(d2);
          const push = (1 - d / 130) * 0.9;
          p.x += (dx / d) * push;
          p.y += (dy / d) * push;
        }
      }
    }

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < linkDist * linkDist) {
          const alpha = (1 - Math.sqrt(d2) / linkDist) * lineAlpha;
          ctx.strokeStyle = `rgba(${lineColor[0]}, ${lineColor[1]}, ${lineColor[2]}, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = dotColor;
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    if (running || reduceQuery.matches) return;
    running = true;
    last = performance.now();
    raf = window.requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    window.cancelAnimationFrame(raf);
  }

  resize();
  if ('ResizeObserver' in window) {
    let t = 0;
    new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(resize, 120);
    }).observe(host);
  }
  if (canHover.matches) {
    host.addEventListener('pointermove', (e) => {
      const rect = host.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = true;
    });
    host.addEventListener('pointerleave', () => {
      pointer.active = false;
    });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0 }).observe(host);
  } else {
    start();
  }
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  return { start, stop };
}

function initAmbientFields() {
  const hosts = document.querySelectorAll(FX_TARGETS);
  // The homepage stays calm (2026-11-05): soft glow fields only, no particle canvas.
  const calm = document.body.classList.contains('page-home');
  hosts.forEach((host) => {
    if (host.querySelector(':scope > .fx')) return;
    const dark = !host.classList.contains('hero-split');
    const fx = document.createElement('div');
    fx.className = 'fx fx--' + (dark ? 'dark' : 'light');
    fx.setAttribute('aria-hidden', 'true');
    fx.innerHTML = '<span class="fx-blob fx-blob--a" data-parallax="0.12"></span><span class="fx-blob fx-blob--b" data-parallax="-0.08"></span>' + (calm ? '' : '<canvas class="fx-canvas"></canvas>');
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    host.insertBefore(fx, host.firstChild);
    // Lift in-flow content above the effect layer.
    Array.from(host.children).forEach((child) => {
      if (child === fx) return;
      if (getComputedStyle(child).position === 'static') {
        child.style.position = 'relative';
        child.style.zIndex = '1';
      }
    });
    if (!calm) createParticleField(host, fx.querySelector('canvas'), dark ? 'dark' : 'light');
  });
}

/* -------------------------------------------------------------- word reveal */

function splitWords(el) {
  if (el.dataset.split) return;
  el.dataset.split = '1';
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
  let index = 0;
  nodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.nodeValue.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
        return;
      }
      const outer = document.createElement('span');
      outer.className = 'w';
      const inner = document.createElement('span');
      inner.className = 'wi';
      inner.style.setProperty('--wi', String(Math.min(index, 14)));
      inner.textContent = part;
      outer.appendChild(inner);
      frag.appendChild(outer);
      index += 1;
    });
    node.parentNode.replaceChild(frag, node);
  });
  el.classList.add('split');
}

function initHeadlines() {
  const h1s = document.querySelectorAll('main h1');
  h1s.forEach((h) => splitWords(h));
  window.requestAnimationFrame(() => h1s.forEach((h) => h.classList.add('split-in')));

  const h2s = Array.from(document.querySelectorAll('main h2')).filter((h) => !h.closest('dialog, .faq, .site-footer'));
  h2s.forEach((h) => splitWords(h));
  if (!('IntersectionObserver' in window)) {
    h2s.forEach((h) => h.classList.add('split-in'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('split-in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4, rootMargin: '0px 0px -8% 0px' }
  );
  h2s.forEach((h) => io.observe(h));
}

/* ------------------------------------------------- spotlight, magnetic, etc */

function initPointerEffects() {
  if (!canHover.matches) return;

  // Cursor spotlight on cards: one delegated listener sets --mx and --my.
  document.addEventListener(
    'pointermove',
    (e) => {
      const card = e.target.closest && e.target.closest('.card');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - rect.left + 'px');
      card.style.setProperty('--my', e.clientY - rect.top + 'px');
    },
    { passive: true }
  );

  // Magnetic primary buttons: the button leans a few pixels toward the cursor.
  const buttons = Array.from(document.querySelectorAll(MAGNETIC)).filter((b) => !b.closest('form, dialog'));
  if (!buttons.length) return;
  buttons.forEach((b) => b.classList.add('is-magnetic'));
  let queued = false;
  let pos = { x: 0, y: 0 };
  function update() {
    queued = false;
    buttons.forEach((b) => {
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = pos.x - cx;
      const dy = pos.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < 110 && r.bottom > 0 && r.top < window.innerHeight) {
        b.style.setProperty('--tx', Math.max(-7, Math.min(7, dx * 0.18)).toFixed(1) + 'px');
        b.style.setProperty('--ty', Math.max(-5, Math.min(5, dy * 0.22)).toFixed(1) + 'px');
      } else {
        b.style.setProperty('--tx', '0px');
        b.style.setProperty('--ty', '0px');
      }
    });
  }
  document.addEventListener(
    'pointermove',
    (e) => {
      pos = { x: e.clientX, y: e.clientY };
      if (!queued) {
        queued = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
}

function initParallaxAndProgress() {
  const bar = document.createElement('div');
  bar.className = 'scroll-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  const layers = Array.from(document.querySelectorAll('[data-parallax]'));
  let ticking = false;
  function update() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    layers.forEach((el) => {
      const host = el.parentElement && el.parentElement.parentElement;
      if (!host) return;
      const rect = host.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > window.innerHeight + 100) return;
      const speed = parseFloat(el.dataset.parallax) || 0;
      el.style.setProperty('--py', (-rect.top * speed).toFixed(1) + 'px');
    });
  }
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    },
    { passive: true }
  );
  update();
}

export function initMotion() {
  if (reduceQuery.matches) return;
  document.documentElement.classList.add('motion');
  initAmbientFields();
  initHeadlines();
  initPointerEffects();
  initParallaxAndProgress();
}
