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
          try { localStorage.setItem("wsSupporter", "true"); localStorage.setItem("wsProKey", key); localStorage.setItem("wsSupporterVerifiedAt", String(Date.now())); } catch (e) {}
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
    var email = input.value.trim();
    if (!email || email.indexOf("@") === -1) { setMsg("pricingEmailMsg", "Enter a valid email address.", false); return; }
    var btn = document.getElementById("pricingEmailGo");
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
    '<div class="pricing-cards">' +
    '<div class="pricing-card pricing-pro">' +
    '<div class="pricing-card-header">' +
    '<div class="pricing-card-tier pricing-pro-tier">Wibe Pro</div>' +
    "</div>" +
    '<div class="pricing-card-price">$3 <span class="pricing-pp-unit">/monthly</span></div>' +
    '<div class="pricing-card-features">' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Color Tools</span><span class="pricing-fval">Unlimited</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Recording</span><span class="pricing-fval">30s &middot; 50/day</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Tone rewrites</span><span class="pricing-fval pricing-unlimited">Unlimited</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Design tools</span><span class="pricing-fval">Full access</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">AI Models</span><span class="pricing-fval">Premium</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Card retention</span><span class="pricing-fval">14 days</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Priority support</span><span class="pricing-fval pricing-check">&#10003;</span></div>' +
    '<div class="pricing-feature-row"><span class="pricing-flabel">Pro badge</span><span class="pricing-fval pricing-check">&#10003;</span></div>' +
    "</div>" +

    '<a href="https://buymeacoffee.com/yg_labs/membership" class="pricing-cta pricing-cta-pro" target="_blank" rel="noopener"><span class="pricing-cta-text">Unlock Pro</span> <i class="fa-solid fa-arrow-right"></i></a>' +
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

  function show() {
    document.getElementById("pricingOverlay").classList.add("show");
    document.body.classList.add("modal-open");
    var hasKey = false;
    try { hasKey = !!localStorage.getItem("wsProKey"); } catch (e) {}
    switchTab(hasKey ? "key" : "plans");
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
})();
