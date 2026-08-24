/* Wibe Stories — Standalone Pricing Page */
(function () {
  var html = document.documentElement;

  /* ── Theme (same as about/features pages) ── */
  var saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) html.classList.add('dark');
  var themeToggle = document.getElementById('themeToggle');
  function setTheme(mode) {
    if (mode === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
    try { localStorage.setItem('theme', mode); } catch (e) {}
    if (themeToggle) {
      themeToggle.innerHTML = mode === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      themeToggle.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    }
  }
  if (themeToggle) {
    themeToggle.addEventListener('click', function() {
      setTheme(html.classList.contains('dark') ? 'light' : 'dark');
    });
  }
  setTheme(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

  /* ── Back to top ── */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) backToTop.classList.add('visible');
      else backToTop.classList.remove('visible');
    }, { passive: true });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ── Pro banner (golden) ── */
  var banner = document.getElementById('proBanner');
  var bannerSub = document.getElementById('proBannerSub');

  function isSupporter() {
    try { return localStorage.getItem('wsSupporter') === 'true'; } catch (e) { return false; }
  }

  function renderBanner(data) {
    if (!banner) return;
    if (!data.isPro) { banner.hidden = true; return; }
    var days = data.daysRemaining;
    var msg;
    if (days === null || days === undefined) msg = 'Your Wibe Pass is active. Thanks for the love \uD83D\uDC9B';
    else if (days <= 0) msg = 'Your Wibe Pass is active. Top up or renew below.';
    else if (days === 1) msg = '1 day left. Top up or renew below.';
    else msg = days + ' days left. Top up or renew below.';
    if (bannerSub) bannerSub.textContent = msg;
    banner.hidden = false;
  }

  /* Fast path: paint immediately for returning Pro users */
  try {
    var cachedDays = parseInt(localStorage.getItem('wsPassDaysRemaining') || '', 10);
    if (isSupporter()) renderBanner({ isPro: true, daysRemaining: isNaN(cachedDays) ? null : cachedDays });
  } catch (e) {}

  /* Server truth: one verify per page load (30/min rate limit, fail silent) */
  var _apiBase = window._API_BASE || 'https://wibe-stories-production.up.railway.app';
  fetch(_apiBase + '/api/pro-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' } })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      renderBanner(data);
      try {
        if (data.isPro) localStorage.setItem('wsPassDaysRemaining', String(data.daysRemaining || 0));
        else localStorage.removeItem('wsPassDaysRemaining');
      } catch (e) {}
    })
    .catch(function () {});

  /* ── CTA text wave (same as pricing modal) ── */
  function wave(el) {
    if (!el || el.dataset.waveInit) return;
    var text = el.textContent;
    if (/[\u0600-\u06FF\u0750-\u077F\u0900-\u0DFF\u0E00-\u0E7F\u0F00-\u0FFF\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u0400-\u04FF\u0590-\u05FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) return;
    el.dataset.waveText = text;
    el.innerHTML = '';
    el.dataset.waveInit = 'true';
    for (var i = 0, idx = 0; i < text.length; i++) {
      if (text[i] === ' ') {
        el.appendChild(document.createTextNode(' '));
      } else {
        var span = document.createElement('span');
        span.textContent = text[i];
        span.style.display = 'inline-block';
        span.style.animation = 'pricing-wave 0.7s ease-in-out ' + (idx * 0.05) + 's 1';
        el.appendChild(span);
        idx++;
      }
    }
  }

  function unwave(el) {
    if (el && el.dataset.waveText) {
      el.textContent = el.dataset.waveText;
      delete el.dataset.waveInit;
      delete el.dataset.waveText;
    }
  }

  document.addEventListener('mouseenter', function (e) {
    var t = e.target instanceof Element ? e.target.closest('.pricing-cta') : null;
    if (t) { var txt = t.querySelector('.pricing-cta-text'); if (txt) wave(txt); }
  }, true);
  document.addEventListener('mouseleave', function (e) {
    var t = e.target instanceof Element ? e.target.closest('.pricing-cta') : null;
    if (t) { var txt = t.querySelector('.pricing-cta-text'); if (txt) unwave(txt); }
  }, true);

  /* ── Pro tier picker (same as pricing modal) ── */
  var _proPickerInit = false;
  function initProPicker() {
    if (_proPickerInit) return;
    _proPickerInit = true;
    var buttons = document.querySelectorAll('.pricing-pro-toggle-btn');
    var slider = document.getElementById('proToggleSlider');
    var costEl = document.getElementById('proCostAmount');
    var detailEl = document.getElementById('proCostDetail');
    if (!buttons.length || !slider || !costEl || !detailEl) return;

    var plans = {
      '1': { price: '$6', detail: '$6/mo' },
      '3': { price: '$16', detail: '$5.33/mo' },
      '12': { price: '$60', detail: '$5/mo <span class="pricing-pro-best">\u{1F3C6} Best Value</span>' }
    };

    function positionSlider(instant) {
      var track = slider.parentElement;
      var trackRect = track.getBoundingClientRect();
      var a = document.querySelector('.pricing-pro-toggle-btn.active');
      if (!a) return;
      var btnRect = a.getBoundingClientRect();
      if (instant) slider.style.transition = 'none';
      slider.style.left = (btnRect.left - trackRect.left) + 'px';
      slider.style.width = btnRect.width + 'px';
      if (instant) {
        void slider.offsetWidth;
        slider.style.transition = '';
      }
    }

    function slideTo(btn) {
      buttons.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      positionSlider();
      var p = plans[btn.dataset.plan];
      costEl.style.opacity = '0';
      detailEl.style.opacity = '0';
      setTimeout(function() {
        costEl.textContent = p.price;
        detailEl.innerHTML = p.detail;
        costEl.style.opacity = '1';
        detailEl.style.opacity = '1';
        positionSlider(true);
      }, 120);
    }

    var initial = document.querySelector('.pricing-pro-toggle-btn.active');
    if (initial) slideTo(initial);

    buttons.forEach(function(btn) {
      btn.addEventListener('click', function() { slideTo(btn); });
    });

    var _rszTimer;
    window.addEventListener('resize', function() {
      clearTimeout(_rszTimer);
      _rszTimer = setTimeout(function() { positionSlider(); }, 100);
    });
  }

  initProPicker();
})();