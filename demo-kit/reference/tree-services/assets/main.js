/* Test Tree Care preview: countdown, menu, motion, preview form. No external requests. */
(function () {
  'use strict';

  var EXPIRES_AT = '2026-11-09T08:51:19.641Z'; // fixed preview expiry, shared by all pages
  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  root.classList.add('js');
  if (!reduce) root.classList.add('motion');

  /* ---------- Preview countdown ---------- */
  var clock = doc.querySelector('[data-countdown]');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function expire() {
    doc.body.innerHTML =
      '<main class="expired"><p class="eyebrow">Private Website Preview</p>' +
      '<h1>This preview has expired</h1>' +
      '<p>The review period for this concept website has ended. ' +
      'Contact SynergyFirst Digital to continue.</p>' +
      '<a class="btn btn-accent" href="https://synergyfirstdigital.com/book-a-call/">Keep This Website</a></main>';
  }
  function tick() {
    var ms = new Date(EXPIRES_AT) - Date.now();
    if (ms <= 0) { expire(); return; }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor(s % 86400 / 3600);
    var m = Math.floor(s % 3600 / 60);
    if (clock) clock.textContent = d + 'd ' + pad(h) + ':' + pad(m) + ':' + pad(s % 60);
    setTimeout(tick, 1000);
  }
  tick();

  /* ---------- Header: menu + scrolled state + progress ---------- */
  var header = doc.querySelector('.site-header');
  var menuBtn = doc.querySelector('.menu-toggle');
  var panel = doc.getElementById('menu-panel');

  function setMenu(open) {
    if (!menuBtn || !panel) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
    if (open) panel.querySelector('a, button').focus();
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
    });
    doc.addEventListener('click', function (e) {
      if (panel.classList.contains('is-open') && !header.contains(e.target)) setMenu(false);
    });
  }

  var progress = doc.querySelector('.progress');
  var layers = doc.querySelectorAll('[data-speed]');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || root.scrollTop;
    header.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    }
    if (!reduce) {
      for (var i = 0; i < layers.length; i++) {
        var el = layers[i];
        el.style.transform = 'translate3d(0,' + (y * parseFloat(el.getAttribute('data-speed'))).toFixed(1) + 'px,0)';
      }
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Scroll reveal (once) ---------- */
  var revealEls = doc.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Cursor spotlight on cards (CSS variables only) ---------- */
  if (!reduce && window.matchMedia('(hover: hover)').matches) {
    doc.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---------- Preview form: never submits ---------- */
  var form = doc.querySelector('form[data-preview-form]');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      var first = null;
      form.querySelectorAll('[required]').forEach(function (field) {
        var err = doc.getElementById(field.id + '-error');
        var bad = !field.value.trim() || (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value));
        field.setAttribute('aria-invalid', String(bad));
        if (err) err.textContent = bad ? (field.value.trim() ? 'Please enter a valid email address.' : 'Please fill in this field.') : '';
        if (bad) { ok = false; if (!first) first = field; }
      });
      var note = form.querySelector('.form-note');
      if (!ok) { first.focus(); note.textContent = ''; return; }
      note.textContent = 'This is a preview, so nothing was sent. On the live website this request would reach the business.';
      note.focus();
    });
  }
})();
