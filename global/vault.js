(function () {
  if (document.getElementById("vault-overlay")) return;

  /* ── SAMPLE CARDS for Phase 1 testing ── */
  var SAMPLE_CARDS = [
    { id: "s1", shortId: "demo-a1", name: "Happy Birthday to Mom", text: "Happy Birthday Mom! Love you!", authorName: "Sarah", tone: "warm", occasion: "birthday", hasAudio: false, audioUrl: "", createdAt: "2026-07-10T10:30:00Z", theme: "birthday" },
    { id: "s2", shortId: "demo-b2", name: "Diwali Wishes", text: "Wishing you a festival of lights filled with joy!", authorName: "Raj", tone: "poetic", occasion: "diwali", hasAudio: true, audioUrl: "", createdAt: "2026-07-08T14:00:00Z", theme: "diwali" },
    { id: "s3", shortId: "demo-c3", name: "Happy Anniversary", text: "To many more years of love and happiness.", authorName: "Priya", tone: "warm", occasion: "anniversary", hasAudio: false, audioUrl: "", createdAt: "2026-07-05T09:00:00Z", theme: "anniversary" },
    { id: "s4", shortId: "demo-d4", name: "Get Well Soon", text: "Sending you warm wishes for a speedy recovery!", authorName: "Mike", tone: "warm", occasion: "get-well", hasAudio: true, audioUrl: "", createdAt: "2026-07-03T16:45:00Z", theme: "get-well" },
    { id: "s5", shortId: "demo-e5", name: "Just Thinking of You", text: "Hey, just wanted to say I miss you. Hope you're doing great!", authorName: "Emma", tone: "honest", occasion: "", hasAudio: false, audioUrl: "", createdAt: "2026-06-28T20:15:00Z", theme: "just-because" },
    { id: "s6", shortId: "demo-f6", name: "Congratulations!", text: "You did it! So proud of everything you've achieved.", authorName: "Alex", tone: "bold", occasion: "congratulations", hasAudio: true, audioUrl: "", createdAt: "2026-06-20T11:00:00Z", theme: "congratulations" },
    { id: "s7", shortId: "demo-g7", name: "Happy Eid", text: "Eid Mubarak! Wishing you peace and blessings.", authorName: "Fatima", tone: "warm", occasion: "eid", hasAudio: false, audioUrl: "", createdAt: "2026-06-15T08:30:00Z", theme: "eid" },
    { id: "s8", shortId: "demo-h8", name: "Thank You", text: "Thank you for everything you do. You're the best!", authorName: "David", tone: "reflective", occasion: "thank-you", hasAudio: false, audioUrl: "", createdAt: "2026-06-10T13:00:00Z", theme: "thank-you" }
  ];

  var cards = [];
  var selectedIds = {};
  var selectMode = false;
  var _vaultIsLocal = false;

  /* ── Helpers ── */
  function getCards() {
    return cards;
  }

  function loadCards() {
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem("wsVaultCards") || "[]"); } catch (e) {}
    if (stored.length > 0) {
      cards = stored;
      _vaultIsLocal = true;
    } else {
      cards = SAMPLE_CARDS.slice();
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

  /* ── Create DOM ── */
  function buildVault() {
    var overlay = document.createElement("div");
    overlay.className = "vault-overlay";
    overlay.id = "vault-overlay";

    overlay.innerHTML =
      '<div class="vault-header">' +
        '<button class="vault-back-btn" id="vault-back">' +
          '<i class="fa-solid fa-arrow-left"></i> Back to App' +
        '</button>' +
        '<span class="vault-title"><i class="fa-solid fa-vault"></i> Wibe Vault</span>' +
        '<button class="vault-select-btn" id="vault-select-btn">Select</button>' +
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
          '<button class="vault-locked-btn" id="vault-locked-btn">\u{1F48E} Upgrade to Pro</button>' +
        '</div>' +
      '</div>' +
      '<div class="vault-action-bar" id="vault-action-bar">' +
        '<span class="vault-action-count" id="vault-action-count">0 selected</span>' +
        '<button class="vault-select-all-btn" id="vault-select-all"><i class="fa-solid fa-check-double"></i> Select All</button>' +
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
    document.getElementById("vault-del-btn").addEventListener("click", showDeleteConfirm);
    document.getElementById("vault-dl-btn").addEventListener("click", downloadSelected);
    document.getElementById("vault-select-all").addEventListener("click", selectAllCards);
    document.getElementById("vault-confirm-cancel").addEventListener("click", hideDeleteConfirm);
    document.getElementById("vault-confirm-ok").addEventListener("click", confirmDelete);
    document.getElementById("vault-card-view").addEventListener("click", function (e) {
      if (e.target === e.currentTarget) closeCardView();
    });
    document.getElementById("vault-cv-back").addEventListener("click", closeCardView);
    document.getElementById("vault-cv-share").addEventListener("click", shareCardView);
    document.getElementById("vault-cv-dl").addEventListener("click", downloadCardView);
    document.getElementById("vault-cv-del").addEventListener("click", deleteCardView);

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
      html +=
        '<div class="vault-tile" data-id="' + c.id + '">' +
          '<div class="vault-tile-check' + checked + '"><i class="fa-solid fa-check"></i></div>' +
          '<div class="vault-tile-thumb">' +
            '<span>' + emoji + '</span>' +
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

    /* audio badge click handling */
    grid.querySelectorAll(".vault-tile-audio-badge").forEach(function (badge) {
      badge.addEventListener("click", function (e) {
        e.stopPropagation();
        toggleAudio(badge);
      });
    });

    updateSelectBtnLabel();
    updateActionBar();
  }

  /* ── Audio toggle ── */
  function toggleAudio(badge) {
    var isPlaying = badge.classList.contains("playing");
    if (!isPlaying) {
      var cardId = badge.dataset.id;
      var card = cards.filter(function (c) { return c.id === cardId; })[0];
      if (card && card.audioUrl) {
        badge.classList.add("playing");
        badge.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        badge.title = "Stop";
      } else {
        showToast("Audio recording not available yet");
      }
    } else {
      badge.classList.remove("playing");
      badge.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
      badge.title = "Play recording";
    }
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
    }
    var overlay = document.getElementById("vault-overlay");
    overlay.classList.toggle("vault-select-mode", selectMode);
    updateSelectBtnLabel();
    updateActionBar();
    render();
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
    selectedIds = {};
    allCards.forEach(function (c) { selectedIds[c.id] = true; });
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
    var selectAll = document.getElementById("vault-select-all");
    var countEl = document.getElementById("vault-action-count");
    var btns = document.querySelector(".vault-action-btns");

    if (!selectMode) {
      bar.classList.remove("visible");
      return;
    }

    bar.classList.add("visible");
    if (selectAll) selectAll.style.display = count === 0 ? "inline-flex" : "none";
    if (countEl) {
      countEl.style.display = count === 0 ? "none" : "";
      countEl.textContent = count + " selected";
    }
    if (btns) btns.style.display = count === 0 ? "none" : "";
  }

  /* ── Delete ── */
  function showDeleteConfirm() {
    var count = Object.keys(selectedIds).length;
    document.getElementById("vault-confirm-desc").textContent =
      "Remove " + count + " card" + (count > 1 ? "s" : "") + " from your vault?";
    document.getElementById("vault-confirm").classList.add("open");
  }

  function hideDeleteConfirm() {
    document.getElementById("vault-confirm").classList.remove("open");
  }

  function confirmDelete() {
    cards = cards.filter(function (c) { return !selectedIds[c.id]; });
    selectedIds = {};
    saveCards();
    if (selectMode) toggleSelectMode();
    hideDeleteConfirm();
    render();
  }

  /* ── Download ── */
  function downloadSelected() {
    var count = Object.keys(selectedIds).length;
    showToast("Download will work when you save cards from the app");
  }

  /* ── Full card view ── */
  var cardViewCard = null;

  function openCardView(id) {
    cardViewCard = cards.filter(function (c) { return c.id === id; })[0];
    if (!cardViewCard) return;
    document.getElementById("vault-cv-name").textContent = cardViewCard.name;
    document.getElementById("vault-cv-img").innerHTML =
      '<span style="font-size:64px">' + getOccasionEmoji(cardViewCard.occasion) + '</span>';
    var detail = formatDate(cardViewCard.createdAt);
    if (cardViewCard.occasion) detail += " \u00B7 " + cardViewCard.occasion.charAt(0).toUpperCase() + cardViewCard.occasion.slice(1);
    if (cardViewCard.hasAudio) detail += " \u00B7 \u{1F50A} Voice";
    document.getElementById("vault-cv-detail").textContent = detail;
    document.getElementById("vault-card-view").classList.add("open");
  }

  function closeCardView() {
    cardViewCard = null;
    document.getElementById("vault-card-view").classList.remove("open");
  }

  function shareCardView() {
    if (cardViewCard) {
      showToast("Share will work when you save cards from the app");
    }
  }

  function downloadCardView() {
    if (cardViewCard) {
      showToast("Download will work when you save cards from the app");
    }
  }

  function deleteCardView() {
    if (!cardViewCard) return;
    cards = cards.filter(function (c) { return c.id !== cardViewCard.id; });
    saveCards();
    closeCardView();
    render();
    if (typeof window.showToast === "function") {
      window.showToast("Card removed from vault");
    }
  }

  /* ── Menu label ── */
  function updateMenuLabel(retries) {
    if (retries === undefined) retries = 0;
    if (retries > 50) return;
    var label = document.getElementById("fmenu-vault-label");
    if (!label) return;
    if (typeof window.isSupporter !== "function") {
      setTimeout(function () { updateMenuLabel(retries + 1); }, 100);
      return;
    }
    label.textContent = isPro() ? "Wibe Vault" : "\u{1F512} Wibe Vault";
  }

  /* ── Open / Close ── */
  function showVault() {
    var overlay = document.getElementById("vault-overlay");
    if (!overlay) return;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    selectMode = false;
    selectedIds = {};
    document.getElementById("vault-overlay").classList.remove("vault-select-mode");
    loadCards();
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
