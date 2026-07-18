/* Wibe Stories — Key Status Modal */
(function () {
  if (document.getElementById("ksOverlay")) return;

  /* ── CSS ── */
  var style = document.createElement("style");
  style.textContent =
    ".ks-overlay{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .25s;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}" +
    ".ks-overlay.show{opacity:1;pointer-events:auto}" +
    ".ks-backdrop{position:absolute;inset:0;background:transparent}" +
    ".ks-modal{position:relative;background:var(--cream);border-radius:16px;padding:32px;max-width:420px;width:90vw;box-shadow:0 24px 80px rgba(0,0,0,.3);text-align:center}" +
    ".dark .ks-modal{background:#2a2a2a}" +
    ".ks-close{position:absolute;top:12px;right:16px;background:none;border:none;font-size:clamp(24px,.5vw + 22px,26px);color:var(--ink3);cursor:pointer;line-height:1;padding:10px;touch-action:manipulation}" +
    ".ks-close:hover{color:var(--ink)}" +
    ".ks-emoji{font-size:clamp(40px,1vw + 36px,48px);margin-bottom:12px;line-height:1}" +
    ".ks-header{font-family:var(--serif);font-size:clamp(20px,.5vw + 18px,24px);font-weight:700;color:var(--ink);margin-bottom:12px}" +
    ".ks-body{font-size:clamp(13px,.3vw + 12px,15px);color:var(--ink3);margin-bottom:16px;line-height:1.5}" +
    ".ks-tier-badge{display:inline-flex;align-items:center;gap:6px;background:#f59e0b;color:#1a1a1a;padding:3px 12px;border-radius:20px;font-size:clamp(11px,.3vw + 10px,13px);font-weight:700;margin-bottom:12px}" +
    ".ks-bar{height:6px;border-radius:3px;background:var(--rule);overflow:hidden;margin:0 auto 16px;max-width:240px}" +
    ".ks-fill{height:100%;border-radius:3px;transition:width .6s ease}" +
    ".ks-fill.green{background:#22c55e}" +
    ".ks-fill.yellow{background:#eab308}" +
    ".ks-fill.red{background:#ef4444}" +
    ".ks-cta{margin-top:8px}" +
    ".ks-cta-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border:none;border-radius:10px;font-size:clamp(13px,.3vw + 12px,15px);font-weight:600;cursor:pointer;text-decoration:none;font-family:var(--sans);transition:opacity .2s;background:#f59e0b;color:#1a1a1a;touch-action:manipulation}" +
    ".ks-cta-btn:hover{opacity:.85}" +
    ".ks-cta-btn.urgent{background:#ef4444;color:#fff}" +
    ".ks-cta-btn.invert{background:var(--ink);color:var(--cream)}" +
    ".ks-loading{padding:40px 0;color:var(--ink3)}" +
    ".ks-spinner{display:inline-block;width:28px;height:28px;border:3px solid var(--rule);border-top-color:#f59e0b;border-radius:50%;animation:ks-spin .7s linear infinite;margin-bottom:12px}" +
    "@keyframes ks-spin{to{transform:rotate(360deg)}}" +
    "@keyframes ks-blink{0%,100%{opacity:1}50%{opacity:.2}}" +
    ".ks-indicator{display:inline-block;animation:ks-blink 1s infinite;margin-left:4px}" +
    ".ks-days{font-size:clamp(22px,1vw + 20px,28px);font-weight:800;color:#f59e0b;display:block;margin:8px 0}" +
    ".ks-days.urgent{color:#ef4444}" +
    ".ks-days.active{color:#22c55e}" +
    ".ks-date{font-size:clamp(12px,.2vw + 11px,13px);color:var(--ink4);margin-bottom:16px}" +
    ".ks-prev{margin-top:16px;padding-top:14px;border-top:1px solid var(--rule);font-size:clamp(11px,.2vw + 10px,12px);color:var(--ink3);line-height:1.5}" +
    ".ks-prev strong{color:var(--ink)}" +
    ".ks-prev .gifted{font-style:italic;opacity:.7}" +
    ".ks-welcome{margin-top:12px;font-size:clamp(12px,.2vw + 11px,13px);color:var(--ink4);font-style:italic}" +
    "@media(prefers-reduced-motion:reduce){.ks-dot.blink,.ks-indicator{animation:none!important}}" +
    "@media(max-width:600px){.ks-modal{padding:28px 20px 24px;max-width:none;width:100%;border-radius:20px 20px 0 0;margin-top:auto}.ks-overlay{align-items:flex-end}}" +
    ".ks-dot{position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:#ef4444;display:none}" +
    ".ks-dot.blink{animation:ks-blink 1s infinite}";
  document.head.appendChild(style);

  /* ── Tier labels ── */
  var TIER_LABELS = {
    S1: "1-Month",
    S3: "3-Month",
    S12: "12-Month",
    SG: "Gift",
    pro: "Pro",
    trial: "Trial",
  };

  function getTierLabel(tier) {
    return TIER_LABELS[tier] || tier || "Pro";
  }

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch { return iso; }
  }

  function getDaysRemaining(expiresAt) {
    if (!expiresAt) return null;
    return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  }

  function getDaysColor(days) {
    if (days === null || days === undefined) return "";
    if (days > 14) return "green";
    if (days >= 7) return "yellow";
    return "red";
  }

  function getTotalDays(tier, membershipType) {
    var MAP = { S1: 30, S3: 90, S12: 365, SG: 60 };
    if (tier && MAP[tier]) return MAP[tier];
    if (membershipType === "annual") return 365;
    if (membershipType === "monthly") return 30;
    return 365;
  }

  function renderPrevPassHtml(prevPass) {
    if (!prevPass) return "";
    var tier = getTierLabel(prevPass.tier || "pro");
    var date = formatDate(prevPass.expiresAt);
    var extra = prevPass.tier === "SG" ? ' <span class="gifted">&mdash; gifted</span>' : "";
    return '<div class="ks-prev">Your previous pass: <strong>' + tier + '</strong> (ended ' + date + ')' + extra + '</div>';
  }

  /* ── DOM ── */
  var overlay = document.createElement("div");
  overlay.className = "ks-overlay";
  overlay.id = "ksOverlay";
  overlay.innerHTML =
    '<div class="ks-backdrop" id="ksBackdrop"></div>' +
    '<div class="ks-modal" id="ksModal">' +
      '<button class="ks-close" id="ksClose">&times;</button>' +
      '<div class="ks-content"></div>' +
    '</div>';
  document.body.appendChild(overlay);

  function close() {
    overlay.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  document.getElementById("ksBackdrop").addEventListener("click", close);
  document.getElementById("ksClose").addEventListener("click", close);
  document.addEventListener("keydown", function ksEsc(e) {
    if (e.key === "Escape" && overlay.classList.contains("show")) close();
  });

  /* ── Cache ── */
  var _ksCache = null;
  var _ksDebug = null;

  /* ── Debug parameter ── */
  try {
    var params = new URLSearchParams(location.search);
    var debug = params.get("ks_debug");
    if (debug) {
      var debugData = {
        active: { isPro: true, tier: "S3", expiresAt: new Date(Date.now() + 20 * 86400000).toISOString(), daysRemaining: 20, membershipType: "monthly" },
        warning: { isPro: true, tier: "S12", expiresAt: new Date(Date.now() + 10 * 86400000).toISOString(), daysRemaining: 10, membershipType: "annual" },
        urgent: { isPro: true, tier: "S1", expiresAt: new Date(Date.now() + 3 * 86400000).toISOString(), daysRemaining: 3, membershipType: "monthly" },
        expired: { isPro: false, reason: "expired", tier: "S3", expiresAt: new Date(Date.now() - 3600000).toISOString(), daysRemaining: 0, membershipType: "monthly", prevPass: { tier: "S12", expiresAt: new Date(Date.now() - 400 * 86400000).toISOString() } },
        free: { isPro: false, reason: "no_session" },
      };
      _ksDebug = debugData[debug] || null;
    }
  } catch (e) {}

  /* ── Renderers ── */
  function renderActive(el, data) {
    var tier = getTierLabel(data.tier);
    var date = formatDate(data.expiresAt);
    var days = data.daysRemaining;
    var total = getTotalDays(data.tier, data.membershipType);
    var consumed = total - days;
    var pct = Math.min(100, Math.round((consumed / total) * 100));
    el.innerHTML =
      '<div class="ks-emoji">&#x2705;</div>' +
      '<div class="ks-header">Your Wibe Pass</div>' +
      '<div class="ks-tier-badge">' + tier + '</div>' +
      '<span class="ks-days active">' + days + ' days</span>' +
      '<div class="ks-body">Your pass is active until <strong>' + date + '</strong>.</div>' +
      '<div class="ks-bar"><div class="ks-fill green" style="width:' + pct + '%"></div></div>' +
      '<div class="ks-cta"><a href="https://buymeacoffee.com/yg_labs/extras" class="ks-cta-btn" target="_blank" rel="noopener">Extend Wibe Pass <i class="fa-solid fa-arrow-right"></i></a></div>' +
      renderPrevPassHtml(data.prevPass);
  }

  function renderWarning(el, data) {
    var tier = getTierLabel(data.tier);
    var date = formatDate(data.expiresAt);
    var days = data.daysRemaining;
    var total = getTotalDays(data.tier, data.membershipType);
    var consumed = total - days;
    var pct = Math.min(100, Math.round((consumed / total) * 100));
    el.innerHTML =
      '<div class="ks-emoji">&#x23F3;</div>' +
      '<div class="ks-header">Your Wibe Pass</div>' +
      '<div class="ks-tier-badge">' + tier + '</div>' +
      '<span class="ks-days">' + days + ' days</span>' +
      '<div class="ks-body">Your pass expires on <strong>' + date + '</strong> \u2014 still time, but don\'t wait too long.</div>' +
      '<div class="ks-bar"><div class="ks-fill yellow" style="width:' + pct + '%"></div></div>' +
      '<div class="ks-cta"><a href="https://buymeacoffee.com/yg_labs/extras" class="ks-cta-btn" target="_blank" rel="noopener">Refill now <i class="fa-solid fa-arrow-right"></i></a></div>' +
      renderPrevPassHtml(data.prevPass);
  }

  function renderUrgent(el, data) {
    var tier = getTierLabel(data.tier);
    var date = formatDate(data.expiresAt);
    var days = data.daysRemaining;
    var total = getTotalDays(data.tier, data.membershipType);
    var consumed = total - days;
    var pct = Math.min(100, Math.round((consumed / total) * 100));
    el.innerHTML =
      '<div class="ks-emoji">&#x2049;&#xFE0F;</div>' +
      '<div class="ks-header">Expiring soon</div>' +
      '<div class="ks-tier-badge">' + tier + '</div>' +
      '<span class="ks-days urgent">' + days + ' days</span>' +
      '<div class="ks-body">Your pass expires on <strong>' + date + '</strong>! Refill before it\'s gone.</div>' +
      '<div class="ks-bar"><div class="ks-fill red" style="width:' + pct + '%"></div></div>' +
      '<div class="ks-cta"><a href="https://buymeacoffee.com/yg_labs/extras" class="ks-cta-btn urgent" target="_blank" rel="noopener">Refill now <i class="fa-solid fa-arrow-right"></i></a></div>' +
      renderPrevPassHtml(data.prevPass);
  }

  function renderExpired(el, data) {
    var tier = getTierLabel(data.tier);
    var date = formatDate(data.expiresAt);
    el.innerHTML =
      '<div class="ks-emoji">&#x1F6A9;</div>' +
      '<div class="ks-header">Pass expired</div>' +
      '<div class="ks-tier-badge">' + tier + '</div>' +
      '<div class="ks-body">Your <strong>' + tier + ' Pass</strong> expired on <strong>' + date + '</strong>. All Pro features are now locked. Your cards are safe \u2014 get a new pass to continue creating.</div>' +
      '<div class="ks-cta"><a href="https://buymeacoffee.com/yg_labs/extras" class="ks-cta-btn urgent" target="_blank" rel="noopener">Get a new Wibe Pass <i class="fa-solid fa-arrow-right"></i></a></div>' +
      renderPrevPassHtml(data.prevPass);
  }

  function renderLocked(el, data) {
    var prevPassHtml = "";
    try {
      var cached = localStorage.getItem("wsPrevPass");
      if (cached) {
        var pp = JSON.parse(cached);
        prevPassHtml = renderPrevPassHtml(pp);
      }
    } catch (e) {}
    var welcomeHtml = prevPassHtml ? "" : '<div class="ks-welcome">This is your first Wibe Pass \u2014 welcome!</div>';
    el.innerHTML =
      '<div class="ks-emoji">&#x1F512;</div>' +
      '<div class="ks-header">My Wibe Pass is a Pro feature</div>' +
      '<div class="ks-body">Check your Wibe Pass status, expiry date, and days remaining.</div>' +
      welcomeHtml +
      prevPassHtml +
      '<div class="ks-cta"><button class="ks-cta-btn invert" id="ksUnlockBtn">Unlock Wibe Pass</button></div>';
    var unlockBtn = document.getElementById("ksUnlockBtn");
    if (unlockBtn) {
      unlockBtn.addEventListener("click", function () {
        close();
        if (typeof window.showPricingModal === "function") window.showPricingModal();
      });
    }
  }

  /* ── Response handler ── */
  function handleResponse(data) {
    var content = document.querySelector("#ksOverlay .ks-content");
    if (!content) return;
    if (data.isPro) {
      var days = data.daysRemaining;
      if (days > 14) renderActive(content, data);
      else if (days >= 7) renderWarning(content, data);
      else renderUrgent(content, data);
    } else if (data.reason === "expired" && data.expiresAt) {
      var expiryDate = new Date(data.expiresAt);
      var today = new Date();
      if (expiryDate.toDateString() === today.toDateString()) {
        renderExpired(content, data);
      } else {
        renderLocked(content, data);
      }
    } else {
      renderLocked(content, data);
    }
  }

  /* ── Public API ── */
  window.openKeyStatusModal = function () {
    if (typeof window.hidePricingModal === "function") window.hidePricingModal();
    overlay.classList.add("show");
    document.body.classList.add("modal-open");
    var content = overlay.querySelector(".ks-content");
    content.innerHTML = '<div class="ks-loading"><div class="ks-spinner"></div><p>Loading&hellip;</p></div>';

    if (_ksDebug) { handleResponse(_ksDebug); return; }
    if (_ksCache && _ksCache.isPro) { handleResponse(_ksCache); return; }

    fetch("/api/pro-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then(function (r) { return r.json(); })
      .then(handleResponse)
      .catch(function () { renderLocked(content); });
  };

  window.updateKeyStatusLabel = function () {
    var navLabel = document.getElementById("navKeyStatusLabel");
    var hmLabel = document.getElementById("hmKeyStatusLabel");
    var label = navLabel || hmLabel;
    if (!label) return;
    var isPro = typeof window.isSupporter === "function" && window.isSupporter();
    var text = isPro ? "My Wibe Pass" : 'My Wibe Pass <b class="pro-badge">Pro</b>';
    if (navLabel) navLabel.innerHTML = text;
    if (hmLabel) hmLabel.innerHTML = text;
    var indicator = document.getElementById("ksPassIndicator");
    if (!indicator) {
      indicator = document.createElement("span");
      indicator.id = "ksPassIndicator";
      indicator.className = "ks-indicator";
      indicator.textContent = "\u2757";
      if (navLabel) navLabel.parentNode.insertBefore(indicator, navLabel.nextSibling);
    }
    try {
      var days = parseInt(localStorage.getItem("wsPassDaysRemaining") || "999", 10);
      indicator.style.display = (isPro && days > 0 && days < 7) ? "" : "none";
    } catch (e) { indicator.style.display = "none"; }
  };

  window.updateKeyStatusDot = function () {
    var dot = document.getElementById("ks-dot");
    if (!dot) return;
    try {
      var days = parseInt(localStorage.getItem("wsPassDaysRemaining") || "999", 10);
      dot.style.display = (days > 0 && days < 7) ? "" : "none";
    } catch (e) { dot.style.display = "none"; }
  };

  /* ── Pre-fetch on load (only if ever had Pro) ── */
  try {
    if (localStorage.getItem("wsSessionToken")) {
      fetch("/api/pro-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          _ksCache = data;
          var days = data.isPro ? (data.daysRemaining || 0) : 0;
          try { localStorage.setItem("wsPassDaysRemaining", String(days)); } catch (e) {}
          try { localStorage.setItem("wsPassExpiresAt", data.expiresAt || ""); } catch (e) {}
          if (data.prevPass) {
            try { localStorage.setItem("wsPrevPass", JSON.stringify(data.prevPass)); } catch (e) {}
          }
          if (typeof window.updateKeyStatusDot === "function") window.updateKeyStatusDot();
          if (typeof window.updateKeyStatusLabel === "function") window.updateKeyStatusLabel();
        })
        .catch(function () {});
    }
  } catch (e) {}
})();
