/* Wibe Stories — Key Status page */
(function () {
  var mainEl = document.getElementById("ksMain");

  var TIER_LABELS = {
    S1: "1 Month",
    S3: "3 Months",
    S12: "12 Months",
    SG: "Gift (2 Months)",
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
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return iso;
    }
  }

  function getDaysColor(days) {
    if (days === null || days === undefined) return "";
    if (days > 30) return "high";
    if (days >= 7) return "med";
    return "low";
  }

  function renderPro(data) {
    var tier = getTierLabel(data.tier);
    var expiresAt = formatDate(data.expiresAt);
    var days = data.daysRemaining;
    var daysColor = getDaysColor(days);
    var daysPct = days !== null && days !== undefined
      ? Math.min(100, Math.round((days / 365) * 100))
      : 0;

    mainEl.innerHTML =
      '<div class="ks-hero">' +
        '<div class="ks-hero-icon">&#10024;</div>' +
        '<h1>Your Wibe Pass</h1>' +
        '<p>Here is your current plan and access details.</p>' +
      '</div>' +
      '<div class="ks-container">' +
        '<div class="ks-card">' +
          '<div class="ks-row">' +
            '<span class="ks-label">Plan</span>' +
            '<span class="ks-value"><span class="ks-tier-badge">' + tier + '</span></span>' +
          '</div>' +
          '<div class="ks-row">' +
            '<span class="ks-label">Expires</span>' +
            '<span class="ks-value">' + expiresAt + '</span>' +
          '</div>' +
          '<div class="ks-row">' +
            '<span class="ks-label">Days remaining</span>' +
            '<span class="ks-value">' +
              '<span class="ks-days-number ' + daysColor + '">' + (days !== null ? days : "—") + '</span>' +
            '</span>' +
          '</div>' +
          (days !== null && days !== undefined
            ? '<div class="ks-days-bar"><div class="ks-days-fill ' + daysColor + '" style="width:' + daysPct + '%"></div></div>'
            : '') +
        '</div>' +
        '<div class="ks-cta">' +
          '<a href="https://buymeacoffee.com/yg_labs/extras" class="ks-cta-btn" target="_blank" rel="noopener">' +
            'Extend Wibe Pass <i class="fa-solid fa-arrow-right"></i>' +
          '</a>' +
        '</div>' +
      '</div>';
  }

  function renderFree() {
    mainEl.innerHTML =
      '<div class="ks-status-free">' +
        '<h2>This page is for Wibe Pass holders</h2>' +
        '<p>You are currently on the free plan. Upgrade to unlock unlimited cards, longer recordings, and more.</p>' +
        '<a href="/" class="ks-cta-btn" id="ksGoHome">Go to app <i class="fa-solid fa-arrow-right"></i></a>' +
      '</div>';
    document.getElementById("ksGoHome")?.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof window.openPricingModal === "function") window.openPricingModal();
      else window.location.href = "/";
    });
  }

  function renderError(msg) {
    mainEl.innerHTML =
      '<div class="ks-error">' +
        '<p>' + (msg || "Could not load your plan details. Try again later.") + '</p>' +
        '<a href="/" class="ks-cta-btn" style="margin-top:20px;display:inline-block">Go to app</a>' +
      '</div>';
  }

  async function load() {
    try {
      var sessionToken = "";
      try { sessionToken = localStorage.getItem("wsSessionToken") || ""; } catch (e) {}

      var res = await fetch("/api/pro-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken: sessionToken || undefined }),
      });
      var data = await res.json();

      if (data.isPro) {
        renderPro(data);
      } else {
        renderFree();
      }
    } catch (e) {
      renderError();
    }
  }

  load();
})();
