/* Test Garage Doors preview. Shared by all pages. No tracking, no network requests. */
(function () {
  'use strict';

  var EXPIRES_AT = '2026-11-09T09:00:00.000Z'; /* fixed UTC expiry, never reset */
  var html = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var motion = !reduced;

  html.classList.add('js');
  if (motion) html.classList.add('motion');

  /* ---- Countdown and expiry ---- */
  var clock = document.querySelector('[data-countdown]');
  var timer;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function expire() {
    clearInterval(timer);
    document.title = 'This preview has expired';
    document.body.innerHTML =
      '<main class="expired"><h1>This preview has expired</h1>' +
      '<p>This private concept website for Test Garage Doors was available for seven days and is no longer shown.</p>' +
      '<p><a class="btn btn-accent" href="https://synergyfirstdigital.com/book-a-call/">Keep This Website</a></p></main>';
  }

  function tick() {
    var ms = Date.parse(EXPIRES_AT) - Date.now();
    if (ms <= 0) { expire(); return; }
    var s = Math.floor(ms / 1000);
    var d = Math.floor(s / 86400);
    var h = Math.floor((s % 86400) / 3600);
    var m = Math.floor((s % 3600) / 60);
    if (clock) clock.textContent = d + 'd ' + pad(h) + 'h ' + pad(m) + 'm ' + pad(s % 60) + 's';
  }
  tick();
  timer = setInterval(tick, 1000);

  /* ---- Sticky top block height (used by sticky steps and side titles) ---- */
  var topBlock = document.querySelector('.top');
  function measureTop() {
    if (topBlock) html.style.setProperty('--top-h', topBlock.offsetHeight + 'px');
  }
  measureTop();
  window.addEventListener('resize', measureTop);

  /* ---- Header: scrolled state, progress line, parallax ---- */
  var header = document.querySelector('.site-header');
  var progress = document.querySelector('.progress');
  var hero = document.querySelector('.hero');
  var layers = [];
  if (motion) {
    layers = Array.prototype.map.call(document.querySelectorAll('[data-speed]'), function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-speed')) || 0 };
    });
  }
  var queued = false;

  function onScroll() {
    queued = false;
    var y = window.scrollY || 0;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (progress) {
      var max = html.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
    }
    if (layers.length && hero && y <= hero.offsetHeight + 200) {
      for (var i = 0; i < layers.length; i++) {
        layers[i].el.style.transform = 'translate3d(0,' + (y * layers[i].speed).toFixed(1) + 'px,0)';
      }
    }
  }
  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---- Menu (below 1100px) ---- */
  var menuBtn = document.querySelector('.menu-btn');
  if (menuBtn && topBlock) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      topBlock.classList.toggle('menu-open', open);
    };
    menuBtn.addEventListener('click', function () {
      var open = menuBtn.getAttribute('aria-expanded') !== 'true';
      setMenu(open);
      if (open) {
        var first = document.querySelector('.site-nav a');
        if (first) first.focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && topBlock.classList.contains('menu-open')) { setMenu(false); menuBtn.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (topBlock.classList.contains('menu-open') && !topBlock.contains(e.target)) setMenu(false);
    });
    document.querySelectorAll('.site-nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1100) setMenu(false); });
  }

  /* ---- Scroll reveal (motion only; the static page is already visible) ---- */
  if (motion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('[data-reveal], [data-watch]').forEach(function (el) { io.observe(el); });
  }

  /* ---- Cursor spotlight on cards (pointer devices only) ---- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', function (e) {
      var card = e.target.closest ? e.target.closest('.card') : null;
      if (!card) return;
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });
  }

  /* ---- Preview form: validates, never submits ---- */
  var form = document.querySelector('form[data-preview-form]');
  if (form) {
    var status = form.querySelector('.form-status');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function check(field) {
      var value = field.value.trim();
      var msg = '';
      if (field.required && !value) msg = field.getAttribute('data-error') || 'Please fill in this field.';
      else if (field.type === 'email' && value && !emailRe.test(value)) msg = 'Please enter an email address like name@example.com.';
      var err = document.getElementById(field.id + '-error');
      if (err) err.textContent = msg;
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      return !msg;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input, select, textarea');
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      status.classList.remove('is-ok');
      if (firstBad) {
        status.textContent = 'Please check the highlighted fields.';
        firstBad.focus();
        return;
      }
      status.textContent = 'This is a preview, so nothing was sent.';
      status.classList.add('is-ok');
      form.reset();
      fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
    });
    form.addEventListener('blur', function (e) {
      if (e.target.matches && e.target.matches('input, select, textarea')) check(e.target);
    }, true);
  }
})();
