/* Wibe Stories — Pricing & Upgrade Modal */
(function () {
  if (document.getElementById("pricingOverlay")) return;

  if (!document.getElementById("pricing-wave-style")) {
    var s = document.createElement("style");
    s.id = "pricing-wave-style";
    s.textContent =
      "@keyframes pricing-wave{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@media(prefers-reduced-motion:reduce){.pricing-cta-text span{animation:none!important;transform:none!important}}@media(max-width:720px){.pricing-cta-text span{animation:none!important;transform:none!important}}";
    document.head.appendChild(s);
  }

  function wave(el) {
    if (!el || el.dataset.waveInit) return;
    var text = el.textContent;
    if (/[\u0600-\u06FF\u0750-\u077F\u0900-\u0DFF\u0E00-\u0E7F\u0F00-\u0FFF\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF\u0400-\u04FF\u0590-\u05FF\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) return;
    el.dataset.waveText = text;
    el.innerHTML = "";
    el.dataset.waveInit = "true";
    for (var i = 0, idx = 0; i < text.length; i++) {
      if (text[i] === " ") {
        el.appendChild(document.createTextNode(" "));
      } else {
        var span = document.createElement("span");
        span.textContent = text[i];
        span.style.display = "inline-block";
        span.style.animation = "pricing-wave 0.7s ease-in-out " + (idx * 0.05) + "s 1";
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

  function setMsg(id, text, ok) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = text;
      el.className = "pricing-key-msg" + (ok ? " ok" : " err");
    }
  }

  function handleKey() {
    var input = document.getElementById("pricingKeyInput");
    if (!input) return;
    var key = input.value.trim();
    if (!key) { setMsg("pricingKeyMsg", "Please paste your key.", false); return; }
    var btn = document.getElementById("pricingKeyGo");
    if (btn) btn.disabled = true;
    fetch("/api/pro-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: key }) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.isPro === true) {
          try { localStorage.setItem("wsSupporter", "true"); localStorage.setItem("wsSessionToken", data.sessionToken || ""); localStorage.setItem("wsSupporterVerifiedAt", String(Date.now())); if (data.sessionToken) localStorage.removeItem("wsProKey"); } catch (e) {}
          if (typeof window.updateSupporterBadge === "function") window.updateSupporterBadge();
          setMsg("pricingKeyMsg", "\u2713 Pro activated! You can close this window.", true);
        } else {
          var msgs = { revoked: "This key has been revoked.", expired: "This key has expired.", rate_limited: "Too many attempts. Try again later." };
          setMsg("pricingKeyMsg", msgs[data.reason] || "Invalid key. Please check and try again.", false);
        }
      })
      .catch(function () { setMsg("pricingKeyMsg", "Network error. Please try again.", false); })
      .finally(function () { if (btn) btn.disabled = false; });
  }

  function handleEmail() {
    var input = document.getElementById("pricingEmailInput");
    if (!input) return;
    input.setCustomValidity("");
    var raw = input.value;
    var email = raw.trim();
    var btn = document.getElementById("pricingEmailGo");

    if (!email) { setMsg("pricingEmailMsg", "Enter a valid email address.", false); if (btn) btn.disabled = false; return; }

    // Silently trim leading/trailing spaces
    if (raw !== email) { input.value = email; }

    // Length check
    if (email.length > 254) { setMsg("pricingEmailMsg", "Email is too long.", false); return; }

    // Unicode/CJK/emoji check — only ASCII printable + extended ASCII for emails
    if (/[^\x00-\x7F]/.test(email)) { setMsg("pricingEmailMsg", "Email contains unsupported characters.", false); return; }

    // Split on @
    var parts = email.split("@");
    if (parts.length !== 2) { setMsg("pricingEmailMsg", "Enter a valid email address.", false); return; }

    var username = parts[0];
    var domain = parts[1];

    // Username checks
    if (!username) { setMsg("pricingEmailMsg", "Email is missing the part before @.", false); return; }
    if (username.length > 64) { setMsg("pricingEmailMsg", "Email username is too long.", false); return; }
    if (username.indexOf("..") !== -1) { setMsg("pricingEmailMsg", "Email cannot contain consecutive dots.", false); return; }
    if (username.charAt(0) === ".") { setMsg("pricingEmailMsg", "Email cannot start with a dot.", false); return; }
    if (username.charAt(username.length - 1) === ".") { setMsg("pricingEmailMsg", "Email cannot end with a dot.", false); return; }

    // Username character check — only allow RFC 5321 allowed chars
    if (!/^[A-Za-z0-9.!#$%&'*+\-/=?^_`{|}~]+$/.test(username)) { setMsg("pricingEmailMsg", "Email username contains invalid characters.", false); return; }

    // Domain checks
    if (!domain) { setMsg("pricingEmailMsg", "Email is missing the domain after @.", false); return; }
    if (domain.indexOf(".") === -1) { setMsg("pricingEmailMsg", "Enter a valid email address (missing domain extension).", false); return; }
    if (domain.charAt(0) === "." || domain.charAt(domain.length - 1) === ".") { setMsg("pricingEmailMsg", "Email domain is invalid.", false); return; }
    if (domain.indexOf("..") !== -1) { setMsg("pricingEmailMsg", "Email domain is invalid.", false); return; }

    // Domain character check — only letters, digits, dots, hyphens
    if (!/^[A-Za-z0-9.\-]+$/.test(domain)) { setMsg("pricingEmailMsg", "Email domain contains invalid characters.", false); return; }

    // Each domain label must not start or end with hyphen
    var labels = domain.split(".");
    for (var li = 0; li < labels.length; li++) {
      var lbl = labels[li];
      if (!lbl || lbl.charAt(0) === "-" || lbl.charAt(lbl.length - 1) === "-") { setMsg("pricingEmailMsg", "Email domain is invalid.", false); return; }
    }

    // Disposable email check
    var domainLower = domain.toLowerCase();
    if (_disposableDomains.has(domainLower)) { setMsg("pricingEmailMsg", "Disposable email addresses are not supported.", false); return; }

    if (btn) btn.disabled = true;
    setMsg("pricingEmailMsg", "Sending\u2026", false);
    fetch("/api/resend-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email }) })
      .then(function (r) { return r.json(); })
      .then(function () { setMsg("pricingEmailMsg", "\u2713 Check your inbox for your key.", true); })
      .catch(function () { setMsg("pricingEmailMsg", "Something went wrong. Try again.", false); })
      .finally(function () { if (btn) btn.disabled = false; });
  }

  var overlay = document.createElement("div");
  overlay.className = "pricing-overlay";
  overlay.id = "pricingOverlay";
  overlay.innerHTML =
    '<div class="pricing-modal" id="pricingModal">' +
    '<div class="pricing-top-bar">' +
    '<div class="pricing-tabs">' +
    '<button class="pricing-tab active" data-tab="plans">Plans</button>' +
    '<button class="pricing-tab" data-tab="key">Activate Key</button>' +
    "</div>" +
    '<button class="pricing-close" id="pricingClose" aria-label="Close">\u2715</button>' +
    "</div>" +
    '<div class="pricing-panel pricing-panel-plans active">' +
    '<div class="pricing-header">' +
    '<div class="pricing-emoji">&#10024;</div>' +
    '<h2 class="pricing-title"><span class="pricing-title-1">Free for everyone.</span> <span class="pricing-title-2"><em>Pro</em> for the ones who <em>love</em> it.</span></h2>' +
    '<p class="pricing-sub">Basic is free forever. Upgrade to Pro when you want more.</p>' +
    "</div>" +
    '<div class="pricing-gift-banner">' +
    '<span class="pricing-gift-icon">&#127873;</span>' +
    '<div class="pricing-gift-text">' +
    '<span class="pricing-gift-title">Wibe Pass Gift Card &mdash; 2 Months for $11</span>' +
    '<span class="pricing-gift-desc">Perfect for friends &amp; family</span>' +
    '</div>' +
    '<a href="https://buymeacoffee.com/yg_labs/e/557246" class="pricing-gift-cta" target="_blank" rel="noopener">Get Gift Card <i class="fa-solid fa-arrow-right"></i></a>' +
    '</div>' +
    '<div class="pricing-cards">' +
    '<div class="pricing-card pricing-pro">' +
    '<div class="pricing-card-header">' +
    '<div class="pricing-card-tier pricing-pro-tier">Wibe Pass</div>' +
    "</div>" +
    '<div class="pricing-tiers">' +
    '<div class="pricing-tier-row">' +
    '<span class="pricing-tier-label">1 Month</span>' +
    '<span class="pricing-tier-price">$6</span>' +
    '<span class="pricing-tier-unit">$6.00/mo</span>' +
    '</div>' +
    '<div class="pricing-tier-row">' +
    '<span class="pricing-tier-label">3 Months</span>' +
    '<span class="pricing-tier-price">$16</span>' +
    '<span class="pricing-tier-unit">$5.33/mo</span>' +
    '</div>' +
    '<div class="pricing-tier-row pricing-tier-best">' +
    '<span class="pricing-tier-label">12 Months <span class="pricing-tier-badge">&#127942; Best value</span></span>' +
    '<span class="pricing-tier-price">$60</span>' +
    '<span class="pricing-tier-unit">$5.00/mo</span>' +
    '</div>' +
    '</div>' +
    '<div class="pricing-pro-picker">' +
      '<div class="pricing-pro-cost">' +
        '<div class="pricing-pro-cost-amount" id="proCostAmount">$6</div>' +
        '<div class="pricing-pro-cost-detail" id="proCostDetail">$6/mo</div>' +
      '</div>' +
      '<div class="pricing-pro-toggle">' +
        '<div class="pricing-pro-toggle-track">' +
          '<div class="pricing-pro-toggle-slider" id="proToggleSlider"></div>' +
          '<button class="pricing-pro-toggle-btn active" data-plan="1">1mo</button>' +
          '<button class="pricing-pro-toggle-btn" data-plan="3">3mo</button>' +
          '<button class="pricing-pro-toggle-btn" data-plan="12">12mo</button>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="pricing-card-features">' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Color Tools</span><span class="pricing-fval">Unlimited</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Recording</span><span class="pricing-fval">30s &middot; 50/day</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Tone rewrites</span><span class="pricing-fval pricing-unlimited">Unlimited</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Design tools</span><span class="pricing-fval">Full access</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">AI Models</span><span class="pricing-fval">Premium</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Card retention</span><span class="pricing-fval">14 days</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Priority support</span><span class="pricing-fval pricing-check">&#10003;</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Pro badge</span><span class="pricing-fval pricing-check">&#10003;</span></div>' +
    '<div class="pricing-feature-row pricing-feature-highlight"><span class="pricing-flabel"><i class="fa-solid fa-vault"></i> Wibe Vault</span><span class="pricing-fval">Up to 50 cards</span></div>' +
    "</div>" +

    '<a href="https://buymeacoffee.com/yg_labs/extras" class="pricing-cta pricing-cta-pro" target="_blank" rel="noopener"><span class="pricing-cta-text">Get Wibe Pass</span> <i class="fa-solid fa-arrow-right"></i></a>' +
    "</div>" +
    '<div class="pricing-card pricing-free">' +
    '<div class="pricing-card-header">' +
    '<div class="pricing-card-tier">Wibe Basic</div>' +
    "</div>" +
    '<div class="pricing-card-price">$0</div>' +
    '<div class="pricing-card-features">' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Color Tools</span><span class="pricing-fval">Limited</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Recording</span><span class="pricing-fval">15s &middot; 5/day</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Tone rewrites</span><span class="pricing-fval">1/day per tone</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Design tools</span><span class="pricing-fval">Standard</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">AI Models</span><span class="pricing-fval">Basic</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Card retention</span><span class="pricing-fval">7 days</span></div>' +
    '<div class="pricing-feature-row pricing-disabled"><span class="pricing-flabel">Priority support</span><span class="pricing-fval pricing-na">&mdash;</span></div>' +
    '<div class="pricing-feature-row pricing-disabled"><span class="pricing-flabel">Pro badge</span><span class="pricing-fval pricing-na">&mdash;</span></div>' +
    '<div class="pricing-feature-row pricing-disabled"><span class="pricing-flabel"><i class="fa-solid fa-vault"></i> Wibe Vault</span><span class="pricing-fval pricing-na">&mdash;</span></div>' +
    "</div>" +
    '<a href="#" onclick="hidePricingModal();return false;" class="pricing-cta pricing-cta-free"><span class="pricing-cta-text">Try it free</span> <i class="fa-solid fa-arrow-right"></i></a>' +
    "</div>" +
    "</div>" +
    '<div class="pricing-plans-features">All plans include: 53 occasion images \u2022 7 tone styles \u2022 44 languages \u2022 Voice attachment</div>' +
    "</div>" +
    '<div class="pricing-panel pricing-panel-key">' +
    '<div class="pricing-header">' +
    '<div class="pricing-emoji">&#128273;</div>' +
    '<h2 class="pricing-title">Activate your Pro membership</h2>' +
    '<p class="pricing-sub">Enter your supporter key or recover a lost one below.</p>' +
    "</div>" +
    '<div class="pricing-key-section">' +
    '<p class="pricing-key-label">Activate your supporter key</p>' +
    '<div class="pricing-key-row">' +
    '<input class="pricing-key-input" id="pricingKeyInput" placeholder="Paste your key..." />' +
    '<button class="pricing-key-btn" id="pricingKeyGo">Continue</button>' +
    '</div>' +
    '<div id="pricingKeyMsg" class="pricing-key-msg"></div>' +
    '<p class="pricing-key-label pricing-lost-label">Lost your key?</p>' +
    '<div class="pricing-key-row">' +
    '<input class="pricing-key-input" id="pricingEmailInput" type="email" placeholder="Enter the email used at purchase" />' +
    '<button class="pricing-key-btn" id="pricingEmailGo">Submit</button>' +
    "</div>" +
    '<div id="pricingEmailMsg" class="pricing-key-msg"></div>' +
    "</div>" +
    "</div>" +
    '<div class="pricing-footer-tagline">speak \u2022 scribe \u2022 share \u2014 Wibe Stories</div>' +
    "</div>";
  document.body.appendChild(overlay);

  function switchTab(name) {
    document.querySelectorAll(".pricing-tab").forEach(function (t) {
      t.classList.toggle("active", t.dataset.tab === name);
    });
    document.querySelectorAll(".pricing-panel").forEach(function (p) {
      p.classList.toggle("active", p.classList.contains("pricing-panel-" + name));
    });
  }

  function positionProSlider() {
    var active = document.querySelector(".pricing-pro-toggle-btn.active");
    if (!active) return;
    var slider = document.getElementById("proToggleSlider");
    if (!slider) return;
    var track = slider.parentElement;
    var trackRect = track.getBoundingClientRect();
    var btnRect = active.getBoundingClientRect();
    slider.style.left = (btnRect.left - trackRect.left) + "px";
    slider.style.width = btnRect.width + "px";
  }

  function show() {
    document.getElementById("pricingOverlay").classList.add("show");
    document.body.classList.add("modal-open");
    var hasKey = false;
    try { hasKey = !!localStorage.getItem("wsSessionToken") || !!localStorage.getItem("wsProKey"); } catch (e) {}
    switchTab(hasKey ? "key" : "plans");
    setTimeout(positionProSlider, 50);
  }
  function hide() {
    document.getElementById("pricingOverlay").classList.remove("show");
    document.body.classList.remove("modal-open");
  }
  window.showPricingModal = show;
  window.hidePricingModal = hide;

  document.querySelectorAll(".pricing-tab").forEach(function (t) {
    t.addEventListener("click", function () { switchTab(t.dataset.tab); });
  });

  var closeBtn = document.getElementById("pricingClose");
  if (closeBtn) closeBtn.addEventListener("click", hide);
  overlay.addEventListener("click", function (e) {
    if (e.target === e.currentTarget) hide();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("show")) hide();
  });

  overlay.addEventListener("mouseenter", function (e) {
    var t = e.target.closest(".pricing-cta");
    if (t) { var txt = t.querySelector(".pricing-cta-text"); if (txt) wave(txt); }
  }, true);
  overlay.addEventListener("mouseleave", function (e) {
    var t = e.target.closest(".pricing-cta");
    if (t) { var txt = t.querySelector(".pricing-cta-text"); if (txt) unwave(txt); }
  }, true);

  document.getElementById("pricingKeyGo").addEventListener("click", handleKey);
  document.getElementById("pricingEmailGo").addEventListener("click", handleEmail);
  document.getElementById("pricingKeyInput").addEventListener("keydown", function (e) { if (e.key === "Enter") handleKey(); });
  document.getElementById("pricingEmailInput").addEventListener("keydown", function (e) { if (e.key === "Enter") handleEmail(); });

  /* ── Key input: whitelist filter ── */
  document.getElementById("pricingKeyInput").addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z0-9\-_]/g, "").slice(0, 64);
  });

  /* ── Email input: suppress browser tooltip on every change ── */
  document.getElementById("pricingEmailInput").addEventListener("input", function () {
    this.setCustomValidity("");
  });

  /* ── Disposable email domains ── */
  var _disposableDomains = new Set([
    "mailinator.com","guerrillamail.com","10minutemail.com","tempmail.com","throwaway.email",
    "yopmail.com","sharklasers.com","trashmail.com","maildrop.cc","getairmail.com",
    "temp-mail.org","dispostable.com","spamgourmet.com","emailondeck.com","mailnator.com",
    "mailexpire.com","mintemail.com","spambox.us","mail-temp.com","tempemail.net",
    "fakeinbox.com","maileater.com","mailcatch.com","mailsac.com","mailinator2.com",
    "sogetthis.com","mailmetrash.com","thisisnotmyrealemail.com","trash2009.com","wegwerfmail.de",
    "spamherelots.com","sendspamhere.com","spamspot.com","spamthisplease.com","uacro.com",
    "guerillamail.org","guerillamail.net","guerillamail.biz","mailexpire.com","mailmoat.com",
    "mailmetrash.com","mytrashmail.com","quickinbox.com","rcpt.at","sneakemail.com",
    "spam.la","spamconference.com","spamcowboy.com","spamcowboy.net","spamcowboy.org",
    "thankyou2010.com","trash2009.com","trashymail.com","trashymail.net","wh4f.org",
    "whyspam.me","willselfdestruct.com","winemaven.info","wronghead.com","xagloo.com",
    "xoxy.net","yopmail.fr","yopmail.net","zippymail.info","zzz.com",
    "ei8ht.com","casualdx.com","eyblog.net","galaxy.tv","generalgiant.com",
    "guerrillamailblock.com","h8s.org","haltospam.com","hotpop.com","inboxbear.com",
    "inboxcleanup.com","inboxcleaner.org","incognitomail.org","ip6.li","irish2me.com",
    "kaspop.com","klassmaster.com","klassmaster.net","link2mail.net","mail2rss.org",
    "mail4trash.com","mailbiz.biz","mailbucket.org","mailcat.biz","maildealer.net"
  ]);

  /* ── Pro pricing selector ── */
  var _proPickerInit = false;
  function initProPicker() {
    if (_proPickerInit) return;
    _proPickerInit = true;
    var buttons = document.querySelectorAll(".pricing-pro-toggle-btn");
    var slider = document.getElementById("proToggleSlider");
    var costEl = document.getElementById("proCostAmount");
    var detailEl = document.getElementById("proCostDetail");
    if (!buttons.length || !slider || !costEl || !detailEl) return;

    var plans = {
      "1": { price: "$6", detail: "$6/mo" },
      "3": { price: "$16", detail: "$5.33/mo" },
      "12": { price: "$60", detail: '$5/mo <span class="pricing-pro-best">\u{1F3C6} Best Value</span>' }
    };

    function slideTo(btn) {
      var track = slider.parentElement;
      var trackRect = track.getBoundingClientRect();
      var btnRect = btn.getBoundingClientRect();
      slider.style.left = (btnRect.left - trackRect.left) + "px";
      slider.style.width = btnRect.width + "px";
      buttons.forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var p = plans[btn.dataset.plan];
      costEl.style.opacity = "0";
      detailEl.style.opacity = "0";
      setTimeout(function() {
        costEl.textContent = p.price;
        detailEl.innerHTML = p.detail;
        costEl.style.opacity = "1";
        detailEl.style.opacity = "1";
      }, 120);
    }

    var initial = document.querySelector(".pricing-pro-toggle-btn.active");
    if (initial) slideTo(initial);

    buttons.forEach(function(btn) {
      btn.addEventListener("click", function() { slideTo(btn); });
    });

    var _rszTimer;
    window.addEventListener("resize", function() {
      clearTimeout(_rszTimer);
      _rszTimer = setTimeout(function() {
        var a = document.querySelector(".pricing-pro-toggle-btn.active");
        if (!a) return;
        var track = slider.parentElement;
        var trackRect = track.getBoundingClientRect();
        var btnRect = a.getBoundingClientRect();
        slider.style.left = (btnRect.left - trackRect.left) + "px";
        slider.style.width = btnRect.width + "px";
      }, 100);
    });
  }

  /* Init on first Plans tab show */
  var _origSwitchTab = switchTab;
  switchTab = function(name) {
    _origSwitchTab(name);
    if (name === "plans") {
      initProPicker();
      setTimeout(positionProSlider, 50);
    }
  };
})();
