(function () {
  if (document.getElementById("vault-overlay")) return;

  var cards = [];
  var selectedIds = {};
  var selectMode = false;
  var _vaultIsLocal = false;

  /* ── Helpers ── */
  function getCards() {
    return cards;
  }

  function getSessionToken() {
    try { return localStorage.getItem("wsSessionToken") || localStorage.getItem("wsProKey") || ""; } catch (e) { return ""; }
  }

  async function loadCards() {
    if (isPro()) {
      var token = getSessionToken();
      if (token) {
        try {
          var res = await fetch("/api/vault/list", { headers: { "X-Session-Token": token } });
          if (res.ok) {
            var data = await res.json();
            if (data.cards && data.cards.length > 0) {
              cards = data.cards;
              _vaultIsLocal = false;
              return;
            }
          } else {
            if (typeof window.showToast === "function") window.showToast("Couldn't load cards from server");
          }
        } catch (e) {
          if (typeof window.showToast === "function") window.showToast("Couldn't load cards from server");
        }
        var stored = [];
        try { stored = JSON.parse(localStorage.getItem("wsVaultCards") || "[]"); } catch (e2) {}
        if (stored.length > 0) {
          try {
            await fetch("/api/vault/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Session-Token": token },
              body: JSON.stringify({ cards: stored })
            });
            var res2 = await fetch("/api/vault/list", { headers: { "X-Session-Token": token } });
            if (res2.ok) {
              var data2 = await res2.json();
              if (data2.cards && data2.cards.length > 0) {
                cards = data2.cards;
                _vaultIsLocal = false;
                return;
              }
            }
          } catch (e2) {
            if (typeof window.showToast === "function") window.showToast("Couldn't sync your cards");
          }
          cards = stored;
          _vaultIsLocal = false;
          return;
        }
      }
    }
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem("wsVaultCards") || "[]"); } catch (e) {}
    if (stored.length > 0) {
      cards = stored;
      _vaultIsLocal = true;
    } else {
      cards = [];
      _vaultIsLocal = false;
    }
  }

  function saveCards() {
    if (!_vaultIsLocal) return;
    try { localStorage.setItem("wsVaultCards", JSON.stringify(cards)); } catch (e) {}
  }

  function formatDate(iso) {
    var d = new Date(iso);
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  }

  function getOccasionEmoji(occ) {
    var map = {
      "birthday": "\u{1F382}", "diwali": "\u{1F9E1}", "anniversary": "\u{1F48D}",
      "get-well": "\u{1F49A}", "congratulations": "\u{1F389}", "eid": "\u{1F54B}",
      "thank-you": "\u{1F64F}", "just-because": "\u{1F495}", "holi": "\u{1F3E8}",
      "christmas": "\u{1F384}", "new-year": "\u{1F389}", "valentine": "\u{2764}\u{FE0F}",
      "mothers-day": "\u{1F479}", "fathers-day": "\u{1F468}"
    };
    return map[occ] || "\u{1F4DD}";
  }

  function isPro() {
    return typeof window.isSupporter === "function" && window.isSupporter();
  }

  /* ── Inject wave-letter keyframe backup ── */
  (function () {
    var s = document.createElement("style");
    s.textContent = "@keyframes wave-letter{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@media (prefers-reduced-motion: reduce){#vault-locked-btn span{animation:none!important;transform:none!important}}";
    document.head.appendChild(s);
  })();

  /* ── Create DOM ── */
  function buildVault() {
    var overlay = document.createElement("div");
    overlay.className = "vault-overlay";
    overlay.id = "vault-overlay";

    overlay.innerHTML =
      '<div class="vault-header">' +
        '<button class="vault-back-btn" id="vault-back" aria-label="Back to App">' +
          '<i class="fa-solid fa-arrow-left"></i>' +
        '</button>' +
        '<span class="vault-title"><i class="fa-solid fa-vault"></i> Wibe Vault</span>' +
        '<div class="vault-header-right">' +
          '<button class="vault-select-all-header-btn" id="vault-select-all-header"><i class="fa-solid fa-check-double"></i> Select All</button>' +
          '<button class="vault-select-btn" id="vault-select-btn">Select</button>' +
        '</div>' +
      '</div>' +
      '<div class="vault-counter" id="vault-counter"></div>' +
      '<div class="vault-content" id="vault-content">' +
        '<div class="vault-grid" id="vault-grid"></div>' +
        '<div class="vault-empty" id="vault-empty">' +
          '<div class="vault-empty-icon">\u{1F3E0}</div>' +
          '<div class="vault-empty-title">Your Wibe Vault is empty</div>' +
          '<div class="vault-empty-desc">Save your first card to get started. Only you can see them.</div>' +
          '<button class="vault-empty-btn" id="vault-empty-btn">\u2728 Create a Card</button>' +
        '</div>' +
        '<div class="vault-locked" id="vault-locked">' +
          '<div class="vault-locked-icon">\u{1F512}</div>' +
          '<div class="vault-locked-title">Wibe Vault is a Pro feature</div>' +
          '<div class="vault-locked-desc">Save your cards forever. Your collection, always there for you.</div>' +
          '<button class="vault-locked-btn" id="vault-locked-btn"><span class="vault-locked-btn-text">Upgrade to Pro</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="vault-action-bar" id="vault-action-bar">' +
        '<span class="vault-action-count" id="vault-action-count">0 selected</span>' +
        '<div class="vault-action-btns">' +
          '<button class="vault-action-btn vault-action-btn-download" id="vault-dl-btn"><i class="fa-solid fa-download"></i> Download</button>' +
          '<button class="vault-action-btn vault-action-btn-delete" id="vault-del-btn"><i class="fa-solid fa-trash-can"></i> Delete</button>' +
        '</div>' +
      '</div>' +
      '<div class="vault-confirm-overlay" id="vault-confirm">' +
        '<div class="vault-confirm-box">' +
          '<div class="vault-confirm-title">Delete cards?</div>' +
          '<div class="vault-confirm-desc" id="vault-confirm-desc"></div>' +
          '<div class="vault-confirm-btns">' +
            '<button class="vault-confirm-btn vault-confirm-btn-cancel" id="vault-confirm-cancel">Cancel</button>' +
            '<button class="vault-confirm-btn vault-confirm-btn-delete" id="vault-confirm-ok">Delete</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="vault-card-view" id="vault-card-view">' +
        '<div class="vault-card-view-header">' +
          '<button class="vault-card-view-back" id="vault-cv-back"><i class="fa-solid fa-arrow-left"></i> Back</button>' +
          '<div class="vault-card-view-actions">' +
            '<button class="vault-card-view-action" id="vault-cv-share" title="Share"><i class="fa-solid fa-share-nodes"></i></button>' +
            '<button class="vault-card-view-action" id="vault-cv-dl" title="Download"><i class="fa-solid fa-download"></i></button>' +
            '<button class="vault-card-view-action" id="vault-cv-del" title="Delete"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div>' +
        '</div>' +
        '<div class="vault-card-view-body">' +
          '<div class="vault-card-view-img" id="vault-cv-img"></div>' +
          '<div class="vault-card-view-info">' +
            '<div class="vault-card-view-name" id="vault-cv-name"></div>' +
            '<div class="vault-card-view-detail" id="vault-cv-detail"></div>' +
            '<button class="vault-cv-play" id="vault-cv-play" title="Play recording" data-label="Play" style="display:none"><i class="fa-solid fa-volume-xmark"></i> Play</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    updateMenuLabel();
    wireEvents();
  }

  /* ── Wire events ── */
  function wireEvents() {
    document.getElementById("vault-back").addEventListener("click", hideVault);
    document.getElementById("vault-select-btn").addEventListener("click", toggleSelectMode);
    document.getElementById("vault-empty-btn").addEventListener("click", function () {
      hideVault();
      var ta = document.getElementById("sta");
      if (ta) setTimeout(function () { ta.focus(); }, 350);
    });
    document.getElementById("vault-locked-btn").addEventListener("click", function () {
      hideVault();
      if (typeof window.showPricingModal === "function") {
        setTimeout(window.showPricingModal, 350);
      }
    });
    /* ── Wave animation on locked button text ── */
    (function () {
      var btn = document.getElementById("vault-locked-btn");
      if (!btn || (typeof isMobile === "function" && isMobile())) return;
      var txt = btn.querySelector(".vault-locked-btn-text");
      if (!txt) return;
      function doWave() {
        var text = txt.textContent;
        txt.dataset.origText = text;
        txt.innerHTML = "";
        for (var i = 0, idx = 0; i < text.length; i++) {
          if (text[i] === " ") {
            txt.appendChild(document.createTextNode(" "));
          } else {
            var span = document.createElement("span");
            span.textContent = text[i];
            span.style.display = "inline-block";
            span.style.animation = "wave-letter 0.7s ease-in-out " + (idx * 0.05) + "s 1";
            txt.appendChild(span);
            idx++;
          }
        }
      }
      function undoWave() {
        txt.textContent = txt.dataset.origText || "Upgrade to Pro";
      }
      btn.addEventListener("mouseenter", doWave);
      btn.addEventListener("mouseleave", undoWave);
      btn.addEventListener("focus", doWave);
      btn.addEventListener("blur", undoWave);
    })();
    document.getElementById("vault-del-btn").addEventListener("click", showDeleteConfirm);
    document.getElementById("vault-select-all-header").addEventListener("click", selectAllCards);
    document.getElementById("vault-confirm-cancel").addEventListener("click", hideDeleteConfirm);
    document.getElementById("vault-confirm-ok").addEventListener("click", confirmDelete);
    document.getElementById("vault-card-view").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closeCardView();
    });
    document.getElementById("vault-cv-back").addEventListener("click", closeCardView);
    document.getElementById("vault-cv-share").addEventListener("click", shareCardView);
    document.getElementById("vault-cv-dl").addEventListener("click", downloadCardView);
    document.getElementById("vault-cv-del").addEventListener("click", deleteCardView);
    document.getElementById("vault-cv-play").addEventListener("click", function () {
      if (cardViewCard) playVaultVoice(cardViewCard, this);
    });
    /* Tile audio badge — delegated so it survives re-renders */
    var gridEl = document.getElementById("vault-grid");
    gridEl.addEventListener("click", function (e) {
      var badge = e.target.closest(".vault-tile-audio-badge");
      if (!badge) return;
      var id = badge.dataset.id;
      var card = getCards().filter(function (c) { return c.id === id; })[0];
      if (card) playVaultVoice(card, badge);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (cardViewCard) { closeCardView(); return; }
        if (document.getElementById("vault-confirm").classList.contains("open")) {
          hideDeleteConfirm(); return;
        }
        hideVault();
      }
    });
  }

  /* ── Render ── */
  function render() {
    stopVaultVoice();
    var grid = document.getElementById("vault-grid");
    var empty = document.getElementById("vault-empty");
    var locked = document.getElementById("vault-locked");
    var counter = document.getElementById("vault-counter");
    var selectBtn = document.getElementById("vault-select-btn");

    if (!isPro()) {
      grid.innerHTML = "";
      empty.classList.remove("visible");
      locked.classList.add("visible");
      counter.textContent = "";
      selectBtn.classList.remove("visible");
      document.getElementById("vault-select-all-header").classList.remove("visible");
      document.getElementById("vault-action-bar").classList.remove("visible");
      updateMenuLabel();
      return;
    }

    locked.classList.remove("visible");
    selectBtn.classList.add("visible");

    var allCards = getCards();

    if (allCards.length === 0) {
      grid.innerHTML = "";
      empty.classList.add("visible");
      selectBtn.classList.remove("visible");
      document.getElementById("vault-select-all-header").classList.remove("visible");
      counter.textContent = "\u{1F4BE} 0 of 50 cards saved";
      document.getElementById("vault-action-bar").classList.remove("visible");
      updateMenuLabel();
      return;
    }

    empty.classList.remove("visible");

    /* update counter */
    var used = allCards.length;
    var max = 50;
    counter.textContent = "\u{1F4BE} " + used + " of " + max + " cards saved";

    /* render grid */
    var html = "";
    for (var i = 0; i < allCards.length; i++) {
      var c = allCards[i];
      var checked = selectedIds[c.id] ? " checked" : "";
      var emoji = getOccasionEmoji(c.occasion);
      var delay = (i * 30) + 'ms';
      html +=
        '<div class="vault-tile" style="animation-delay:' + delay + '" data-id="' + c.id + '">' +
          '<div class="vault-tile-check' + checked + '"><i class="fa-solid fa-check"></i></div>' +
          '<div class="vault-tile-thumb">' +
            (c.imageUrl ? '<img src="' + c.imageUrl + '" alt="' + escHtml(c.name) + '" loading="lazy" />' : '<span>' + emoji + '</span>') +
            (c.hasAudio ? '<button class="vault-tile-audio-badge" data-id="' + c.id + '" title="Play recording"><i class="fa-solid fa-volume-xmark"></i></button>' : '') +
          '</div>' +
          '<div class="vault-tile-info">' +
            '<div class="vault-tile-name">' + escHtml(c.name) + '</div>' +
            '<div class="vault-tile-date">' + formatDate(c.createdAt) + '</div>' +
          '</div>' +
        '</div>';
    }
    grid.innerHTML = html;

    /* tile click handling */
    grid.querySelectorAll(".vault-tile").forEach(function (tile) {
      tile.addEventListener("click", function (e) {
        if (e.target.closest(".vault-tile-audio-badge")) return;
        if (selectMode) {
          toggleTileSelect(tile);
        } else {
          openCardView(tile.dataset.id);
        }
      });
    });

    updateSelectBtnLabel();
    updateActionBar();
  }

  function showToast(msg) {
    if (typeof window.showToast === "function") {
      window.showToast(msg);
    }
  }

  function escHtml(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  /* ── Select mode ── */
  function toggleSelectMode() {
    selectMode = !selectMode;
    if (!selectMode) {
      selectedIds = {};
      document.querySelectorAll("#vault-grid .vault-tile-check.checked").forEach(function(c) {
        c.classList.remove("checked");
      });
      var headerBtn = document.getElementById("vault-select-all-header");
      headerBtn.classList.remove("all-selected");
      headerBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Select All';
    }
    document.getElementById("vault-overlay").classList.toggle("vault-select-mode", selectMode);
    document.getElementById("vault-select-all-header").classList.toggle("visible", selectMode);
    updateSelectBtnLabel();
    updateActionBar();
  }

  function toggleTileSelect(tile) {
    var id = tile.dataset.id;
    if (selectedIds[id]) {
      delete selectedIds[id];
    } else {
      selectedIds[id] = true;
    }
    var check = tile.querySelector(".vault-tile-check");
    if (check) check.classList.toggle("checked", !!selectedIds[id]);
    updateActionBar();
  }

  function selectAllCards() {
    var allCards = getCards();
    var headerBtn = document.getElementById("vault-select-all-header");
    var allSelected = !headerBtn.classList.contains("all-selected");
    if (allSelected) {
      selectedIds = {};
      allCards.forEach(function (c) { selectedIds[c.id] = true; });
      headerBtn.classList.add("all-selected");
      headerBtn.innerHTML = '<i class="fa-solid fa-times"></i> Deselect All';
    } else {
      selectedIds = {};
      headerBtn.classList.remove("all-selected");
      headerBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Select All';
    }
    updateActionBar();
    render();
  }

  function updateSelectBtnLabel() {
    var btn = document.getElementById("vault-select-btn");
    if (selectMode) {
      btn.textContent = "Cancel";
      btn.classList.add("active");
    } else {
      btn.textContent = "Select";
      btn.classList.remove("active");
    }
  }

  function updateActionBar() {
    var count = Object.keys(selectedIds).length;
    var bar = document.getElementById("vault-action-bar");
    var countEl = document.getElementById("vault-action-count");
    var btns = document.querySelector(".vault-action-btns");

    if (!selectMode) {
      bar.classList.remove("visible");
      return;
    }

    bar.classList.add("visible");
    if (countEl) {
      countEl.style.display = count === 0 ? "none" : "";
      countEl.textContent = count + " selected";
    }
    if (btns) btns.style.display = count === 0 ? "none" : "";
  }

  /* ── Delete ── */
  var _pendingCardViewDeleteId = null;

  function showDeleteConfirm() {
    var count = Object.keys(selectedIds).length;
    document.getElementById("vault-confirm-desc").textContent =
      "Remove " + count + " card" + (count > 1 ? "s" : "") + " from your vault?";
    document.getElementById("vault-confirm").classList.add("open");
  }

  function showCardViewDeleteConfirm() {
    document.getElementById("vault-confirm-desc").textContent = "Remove this card from your vault?";
    document.getElementById("vault-confirm").classList.add("open");
  }

  function hideDeleteConfirm() {
    _pendingCardViewDeleteId = null;
    document.getElementById("vault-confirm").classList.remove("open");
  }

  async function confirmDelete() {
    if (_pendingCardViewDeleteId) {
      var id = _pendingCardViewDeleteId;
      _pendingCardViewDeleteId = null;
      var delOk = true;
      if (isPro()) {
        var token = getSessionToken();
        if (token) {
          try {
            var delRes = await fetch("/api/vault/delete", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Session-Token": token },
              body: JSON.stringify({ ids: [id] })
            });
            delOk = delRes.ok;
            if (!delRes.ok && typeof window.showToast === "function") window.showToast("Couldn't remove card from server");
          } catch (e) {
            delOk = false;
            if (typeof window.showToast === "function") window.showToast("Couldn't remove card from server");
          }
        }
      }
      var delCard = cards.filter(function (c) { return c.id === id; })[0];
      cards = cards.filter(function (c) { return c.id !== id; });
      if (!isPro()) saveCards();
      closeCardView();
      hideDeleteConfirm();
      render();
      if (delCard && window._lastBtnCText !== undefined && (delCard.text || "").trim() === window._lastBtnCText && (delCard.name || "").trim() === window._lastBtnCName) {
        window._lastBtnCText = undefined; window._lastBtnCName = undefined; window._lastBtnCColor = undefined; window._lastBtnCTone = undefined; window._lastBtnCRounded = undefined; window._lastBtnCFontBump = undefined; window._lastBtnCTexture = undefined; window._lastBtnCVoice = undefined;
      }
      if (delOk && typeof window.showToast === "function") window.showToast("Card removed from vault");
      return;
    }
    var delOk2 = true;
    if (isPro()) {
      var token = getSessionToken();
      if (token) {
        try {
          var delRes2 = await fetch("/api/vault/delete", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Session-Token": token },
            body: JSON.stringify({ ids: Object.keys(selectedIds) })
          });
          delOk2 = delRes2.ok;
          if (!delRes2.ok && typeof window.showToast === "function") window.showToast("Couldn't remove cards from server");
        } catch (e) {
          delOk2 = false;
          if (typeof window.showToast === "function") window.showToast("Couldn't remove cards from server");
        }
      }
    }
    var deletedCards = cards.filter(function (c) { return selectedIds[c.id]; });
    for (var i = 0; i < deletedCards.length; i++) {
      if (window._lastBtnCText !== undefined && (deletedCards[i].text || "").trim() === window._lastBtnCText && (deletedCards[i].name || "").trim() === window._lastBtnCName) {
        window._lastBtnCText = undefined; window._lastBtnCName = undefined; window._lastBtnCColor = undefined; window._lastBtnCTone = undefined; window._lastBtnCRounded = undefined; window._lastBtnCFontBump = undefined; window._lastBtnCTexture = undefined; window._lastBtnCVoice = undefined;
        break;
      }
    }
    cards = cards.filter(function (c) { return !selectedIds[c.id]; });
    selectedIds = {};
    if (!isPro()) saveCards();
    if (selectMode) toggleSelectMode();
    hideDeleteConfirm();
    render();
    if (delOk2 && typeof window.showToast === "function") window.showToast("Card removed from vault");
  }

  /* ── Voice playback ── */
  var _vaultAudio = null;
  var _vaultPlayingId = null;

  function isAppleDevice() {
    return /iPad|iPhone|iPod|Mac/.test(navigator.userAgent) && !window.MSStream;
  }

  // Voice URL for a card. Non-Apple devices get the original WebM blob URL.
  // Apple browsers can't decode the WebM container, so they are pointed at
  // the lazy /api/voice/m4a/:shortId endpoint, which transcodes the WebM to
  // AAC/M4A on first play (once per card, then cached in Blob).
  function voiceUrlForCard(card) {
    if (!card || !card.shortId) return "";
    var host = "";
    try { host = new URL(card.imageUrl || "").origin; } catch (e) {}
    if (!host) return "";
    if (isAppleDevice()) return "/api/voice/m4a/" + card.shortId;
    return host + "/voice/" + card.shortId;
  }

  function setVoiceButtonState(btn, playing) {
    if (!btn) return;
    btn.classList.toggle("playing", playing);
    var label = btn.dataset.label || "";
    btn.innerHTML = playing
      ? '<i class="fa-solid fa-volume-high"></i>' + (label ? " " + label : "")
      : '<i class="fa-solid fa-volume-xmark"></i>' + (label ? " " + label : "");
  }

  function endVoicePlayback(card, btn) {
    if (_vaultAudio) { try { _vaultAudio.pause(); } catch (e) {} _vaultAudio = null; }
    if (_vaultPlayingId === card.id) _vaultPlayingId = null;
    setVoiceButtonState(btn, false);
  }

  function stopVaultVoice() {
    if (_vaultAudio) { try { _vaultAudio.pause(); } catch (e) {} _vaultAudio = null; }
    _vaultPlayingId = null;
    document.querySelectorAll("#vault-grid .vault-tile-audio-badge.playing").forEach(function (b) {
      b.classList.remove("playing");
      b.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    });
    var cvPlay = document.getElementById("vault-cv-play");
    if (cvPlay) {
      cvPlay.classList.remove("playing");
      cvPlay.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> ' + (cvPlay.dataset.label || "Play");
    }
  }

  function playVaultVoice(card, btn) {
    if (!card || !card.hasAudio) return;
    var primary = voiceUrlForCard(card);
    if (!primary) { showToast("Voice no longer available"); return; }
    if (_vaultPlayingId === card.id && _vaultAudio) {
      endVoicePlayback(card, btn);
      return;
    }
    stopVaultVoice();
    _vaultPlayingId = card.id;
    var urls = [primary];
    // Apple fallback: if the lazy /api/voice/m4a/:id endpoint fails (e.g.
    // transcode error, no webm), fall back to the raw WebM blob URL.
    if (isAppleDevice() && primary.indexOf("/api/voice/m4a/") === 0) {
      var host = "";
      try { host = new URL(card.imageUrl || "").origin; } catch (e) {}
      if (host) urls.push(host + "/voice/" + card.shortId);
    }
    function tryPlay(index) {
      var audio = new Audio(urls[index]);
      _vaultAudio = audio;
      setVoiceButtonState(btn, true);
      audio.onended = function () { endVoicePlayback(card, btn); };
      audio.onerror = function () {
        if (index + 1 < urls.length) {
          tryPlay(index + 1);
        } else {
          endVoicePlayback(card, btn);
          showToast("Voice no longer available");
        }
      };
      audio.play().catch(function () {
        if (index + 1 < urls.length) {
          tryPlay(index + 1);
        } else {
          endVoicePlayback(card, btn);
          showToast("Voice no longer available");
        }
      });
    }
    tryPlay(0);
  }

  /* ── Download ── */
  function saveBlobDownload(blob, filename) {
    var a = document.createElement("a");
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
  }

  async function downloadCardView() {
    if (!cardViewCard) return;
    var card = cardViewCard;
    var filename = ((card.name || "").replace(/[\\/:*?"<>|]/g, "").trim() || "wibe-story") + ".png";
    if (card.imageUrl) {
      try {
        var res = await fetch(card.imageUrl);
        if (res.ok) {
          saveBlobDownload(await res.blob(), filename);
          showToast("Saved ✓");
          return;
        }
      } catch (e) {}
    }
    if (card.shortId && /^[a-zA-Z0-9]{4,12}$/.test(card.shortId)) {
      try {
        var res2 = await fetch("/api/download/" + card.shortId);
        if (res2.ok) {
          saveBlobDownload(await res2.blob(), filename);
          showToast("Saved ✓");
          return;
        }
      } catch (e) {}
    }
    showToast("Image no longer available");
  }

  /* ── Full card view ── */
  var cardViewCard = null;

  function openCardView(id) {
    cardViewCard = cards.filter(function (c) { return c.id === id; })[0];
    if (!cardViewCard) return;
    document.getElementById("vault-cv-name").textContent = cardViewCard.name;
    document.getElementById("vault-cv-img").innerHTML =
      cardViewCard.imageUrl
        ? '<img src="' + cardViewCard.imageUrl + '" alt="' + escHtml(cardViewCard.name) + '" style="width:100%;height:100%;object-fit:contain" />'
        : '<span style="font-size:64px">' + getOccasionEmoji(cardViewCard.occasion) + '</span>';
    var detail = formatDate(cardViewCard.createdAt);
    if (cardViewCard.occasion) detail += " \u00B7 " + cardViewCard.occasion.charAt(0).toUpperCase() + cardViewCard.occasion.slice(1);
    if (cardViewCard.hasAudio) detail += " \u00B7 \u{1F50A} Voice";
    document.getElementById("vault-cv-detail").textContent = detail;
    var cvPlay = document.getElementById("vault-cv-play");
    if (cvPlay) {
      cvPlay.style.display = cardViewCard.hasAudio ? "" : "none";
      cvPlay.classList.remove("playing");
      cvPlay.innerHTML = '<i class="fa-solid fa-volume-xmark"></i> ' + (cvPlay.dataset.label || "Play");
    }
    document.getElementById("vault-card-view").classList.add("open");
  }

  function closeCardView() {
    stopVaultVoice();
    cardViewCard = null;
    document.getElementById("vault-card-view").classList.remove("open");
  }

  async function shareCardView() {
    if (cardViewCard && cardViewCard.shortId && typeof window.openVaultShareModal === "function") {
      var opened = false;
      try { opened = await window.openVaultShareModal(cardViewCard); } catch (e) {}
      if (opened) return;
    }
    if (cardViewCard && cardViewCard.shortId) {
      var url = window.location.origin + "/c/" + cardViewCard.shortId;
      if (typeof navigator.share === "function") {
        navigator.share({ title: cardViewCard.name || "Wibe Story", url: url }).catch(function(){});
      } else {
        navigator.clipboard.writeText(url).then(function() {
          showToast("Link copied to clipboard");
        }).catch(function() {
          showToast("Copy this link: " + url);
        });
      }
    } else {
      showToast("Saved cards can be shared from the main app");
    }
  }

  async function deleteCardView() {
    if (!cardViewCard) return;
    _pendingCardViewDeleteId = cardViewCard.id;
    showCardViewDeleteConfirm();
  }

  /* ── Menu label ── */
  function updateMenuLabel(retries) {
    if (retries === undefined) retries = 0;
    if (retries > 50) return;
    var label = document.getElementById("fmenu-vault-label");
    var hmLabel = document.getElementById("hmVaultLabel");
    var navLabel = document.getElementById("navVaultLabel");
    if (!label && !hmLabel && !navLabel) return;
    if (typeof window.isSupporter !== "function") {
      setTimeout(function () { updateMenuLabel(retries + 1); }, 100);
      return;
    }
    var vaultText = isPro() ? "Wibe Vault" : 'Wibe Vault <b class="pro-badge">Pro</b>';
    if (label) label.innerHTML = vaultText;
    if (hmLabel) hmLabel.innerHTML = vaultText;
    if (navLabel) navLabel.innerHTML = vaultText;
  }

  /* ── Open / Close ── */
  async function showVault() {
    var overlay = document.getElementById("vault-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    selectMode = false;
    selectedIds = {};
    document.getElementById("vault-overlay").classList.remove("vault-select-mode");
    await loadCards();
    render();
  }

  function hideVault() {
    var overlay = document.getElementById("vault-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    selectMode = false;
    selectedIds = {};
    cardViewCard = null;
    stopVaultVoice();
    document.getElementById("vault-card-view").classList.remove("open");
    document.getElementById("vault-confirm").classList.remove("open");
  }

  /* ── Expose globals ── */
  window.showVault = showVault;
  window.hideVault = hideVault;
  window.updateMenuLabel = updateMenuLabel;

  /* ── Install ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildVault);
  } else {
    buildVault();
  }
})();
