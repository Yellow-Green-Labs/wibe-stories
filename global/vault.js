(function () {
  if (document.getElementById("vault-overlay")) return;

  var cards = [];
  var selectedIds = {};
  var selectMode = false;
  var _vaultIsLocal = false;
  var _loadFailed = false;
  var _loading = false;
  var _sort = "newest";
  var _query = "";
  try {
    var _savedSort = localStorage.getItem("wsVaultSort");
    if (_savedSort === "newest" || _savedSort === "oldest") _sort = _savedSort;
  } catch (e) {}

  /* ── Helpers ── */
  function getCards() {
    return cards;
  }

  function getSessionToken() {
    try { return localStorage.getItem("wsSessionToken") || localStorage.getItem("wsProKey") || ""; } catch (e) { return ""; }
  }

  async function loadCards() {
    _loadFailed = false;
    if (isPro()) {
      var token = getSessionToken();
      if (token) {
        try {
          var res = await fetch(window._API_BASE + "/api/vault/list", { headers: { "X-Session-Token": token } });
          if (res.ok) {
            var data = await res.json();
            if (data.cards && data.cards.length > 0) {
              cards = data.cards;
              _vaultIsLocal = false;
              _loadFailed = false;
              return;
            }
          } else {
            _loadFailed = true;
            if (typeof window.showToast === "function") window.showToast("Couldn't load cards from server");
          }
        } catch (e) {
          _loadFailed = true;
          if (typeof window.showToast === "function") window.showToast("Couldn't load cards from server");
        }
        var stored = [];
        try { stored = JSON.parse(localStorage.getItem("wsVaultCards") || "[]"); } catch (e2) {}
        if (stored.length > 0) {
          try {
            await fetch(window._API_BASE + "/api/vault/migrate", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Session-Token": token },
              body: JSON.stringify({ cards: stored })
            });
            var res2 = await fetch(window._API_BASE + "/api/vault/list", { headers: { "X-Session-Token": token } });
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
          _loadFailed = false;
          return;
        }
      }
    }
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem("wsVaultCards") || "[]"); } catch (e) {}
    if (stored.length > 0) {
      cards = stored;
      _vaultIsLocal = true;
      _loadFailed = false;
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
      '<div class="vault-counter-row">' +
        '<div class="vault-counter" id="vault-counter"></div>' +
        '<button class="vault-sort-btn" id="vault-sort-btn" title="Sort cards">' +
          '<i class="fa-solid fa-arrow-down-short-wide"></i> <span id="vault-sort-label">Newest</span>' +
        '</button>' +
      '</div>' +
      '<div class="vault-search-wrap" id="vault-search-wrap">' +
        '<div class="vault-search">' +
          '<i class="fa-solid fa-magnifying-glass"></i>' +
          '<input type="text" id="vault-search-input" placeholder="Search your cards" autocomplete="off" />' +
          '<button class="vault-search-clear" id="vault-search-clear" title="Clear"><i class="fa-solid fa-times"></i></button>' +
        '</div>' +
      '</div>' +
      '<div class="vault-content" id="vault-content">' +
        '<div class="vault-grid" id="vault-grid"></div>' +
        '<div class="vault-empty" id="vault-empty">' +
          '<div class="vault-empty-icon">\u{1F3E0}</div>' +
          '<div class="vault-empty-title">Your Wibe Vault is empty</div>' +
          '<div class="vault-empty-desc">Save your first card to get started. Only you can see them.</div>' +
          '<button class="vault-empty-btn" id="vault-empty-btn">\u2728 Create a Card</button>' +
        '</div>' +
        '<div class="vault-error" id="vault-error">' +
          '<div class="vault-error-icon">\u26A0\uFE0F</div>' +
          '<div class="vault-error-title">Couldn\'t load your vault</div>' +
          '<div class="vault-error-desc">Check your connection and try again. Your cards are safe.</div>' +
          '<button class="vault-error-btn" id="vault-retry-btn">Retry</button>' +
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
          '<button class="vault-card-view-action" id="vault-cv-rename" title="Rename"><i class="fa-solid fa-pen"></i></button>' +
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
    document.getElementById("vault-retry-btn").addEventListener("click", function () {
      var btn = document.getElementById("vault-retry-btn");
      if (btn) btn.disabled = true;
      _loading = true;
      render();
      loadCards().then(function () {
        if (btn) btn.disabled = false;
        _loading = false;
        render();
      }).catch(function () {
        if (btn) btn.disabled = false;
        _loading = false;
        render();
      });
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
    document.getElementById("vault-sort-btn").addEventListener("click", function () {
      _sort = _sort === "newest" ? "oldest" : "newest";
      try { localStorage.setItem("wsVaultSort", _sort); } catch (e) {}
      updateSortBtn();
      render();
    });
    updateSortBtn();
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
    /* ── Search ── */
    var searchInput = document.getElementById("vault-search-input");
    var searchClear = document.getElementById("vault-search-clear");
    var searchWrap = document.getElementById("vault-search-wrap");
    if (searchInput && searchClear && searchWrap) {
      /* live filter on input */
      searchInput.addEventListener("input", function () {
        _query = this.value.trim().toLowerCase();
        render();
        /* show/hide search clear */
        if (_query) searchClear.classList.add("visible");
        else searchClear.classList.remove("visible");
      });
      /* clear button */
      searchClear.addEventListener("click", function (e) {
        e.preventDefault();
        searchInput.value = "";
        _query = "";
        searchInput.classList.remove("visible");
        searchClear.classList.remove("visible");
        render();
        searchInput.focus();
      });
      /* Esc while focused — clear query, don't close vault */
      searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.preventDefault();
          e.stopPropagation();
          searchInput.value = "";
          _query = "";
          searchClear.classList.remove("visible");
          render();
          searchInput.blur();
        }
      });
      /* hide search wrap in non‑Pro / empty / locked states */
      function updateSearchVisibility() {
        var cards = getCards();
        var show = isPro() && cards.length > 0;
        if (searchWrap) searchWrap.style.display = show ? "" : "none";
      }
      /* call on open/close */
      updateSearchVisibility();
    }
    /* ── End search ── */
    var _renameOriginal = null;
    var renamePencil = document.getElementById("vault-cv-rename");
    var renameName = document.getElementById("vault-cv-name");
    if (renamePencil && renameName) {
      renamePencil.addEventListener("click", function (e) {
        e.stopPropagation();
        if (_renameOriginal === null) {
          _renameOriginal = renameName.textContent;
          renameName.contentEditable = "true";
          renameName.classList.add("editing");
          renameName.focus();
          /* select all text for easy replacement */
          var range = document.createRange();
          range.selectNodeContents(renameName);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          renameName.classList.remove("editing");
          renameName.contentEditable = "false";
          renameName.textContent = _renameOriginal;
          _renameOriginal = null;
        }
      });
      renameName.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
          e.stopPropagation();
          renameName.classList.remove("editing");
          renameName.contentEditable = "false";
          renameName.textContent = _renameOriginal || "";
          _renameOriginal = null;
        } else if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          var newName = renameName.textContent.trim();
          if (_renameOriginal !== null && newName && newName !== _renameOriginal) {
            var oldName = _renameOriginal;
            _renameOriginal = null;
            renameName.classList.remove("editing");
            renameName.contentEditable = "false";
            renameName.textContent = newName;
            /* update card in vault + UI immediately */
            if (cardViewCard) {
              cardViewCard.name = newName;
              var idx = cards.findIndex(function (c) { return c.id === cardViewCard.id; });
              if (idx >= 0) cards[idx].name = newName;
            }
            render();
            var key = getSessionToken();
            fetch(window._API_BASE + "/api/vault/rename", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-pro-key": key
              },
              body: JSON.stringify({ clientId: cardViewCard.id, name: newName })
            }).then(function (r) {
              if (r.ok) return r.json();
              throw new Error("rename failed");
            }).then(function (data) {
              if (!data.ok) throw new Error(data.error || "rename failed");
              /* update card in vault + UI */
              if (cardViewCard) {
                cardViewCard.name = newName;
                /* update card in the main cards array (if it exists) */
                var idx = cards.findIndex(function (c) { return c.id === cardViewCard.id; });
                if (idx >= 0) cards[idx].name = newName;
              }
              /* re-render vault to update tile + card-view name */
              render();
            }).catch(function (err) {
              console.error('[Vault Rename] Error:', err.message);
              /* revert on failure */
              if (_renameOriginal === null) {
                renameName.classList.remove("editing");
                renameName.textContent = cardViewCard ? cardViewCard.name : "";
              } else {
                renameName.textContent = _renameOriginal;
              }
            });
          } else {
            /* empty or unchanged — exit edit */
            _renameOriginal = null;
            renameName.classList.remove("editing");
            renameName.textContent = _renameOriginal !== null ? _renameOriginal : "";
          }
        }
      });
    }
    /* ── End rename ── */
    /* Tile audio badge — delegated so it survives re-renders */
    var gridEl = document.getElementById("vault-grid");
    gridEl.addEventListener("click", function (e) {
      var badge = e.target.closest(".vault-tile-audio-badge");
      if (!badge) return;
      if (selectMode) return; // selecting, not playing
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
    var err = document.getElementById("vault-error");
    var counter = document.getElementById("vault-counter");
    var selectBtn = document.getElementById("vault-select-btn");
    var sortBtn = document.getElementById("vault-sort-btn");

    if (_loading) {
      /* skeleton placeholders while cards load */
      var sk = "";
      for (var s = 0; s < 6; s++) {
        sk +=
          '<div class="vault-skeleton">' +
            '<div class="vault-skeleton-thumb"></div>' +
            '<div class="vault-skeleton-info">' +
              '<div class="vault-skeleton-line"></div>' +
              '<div class="vault-skeleton-line vault-skeleton-line-short"></div>' +
            '</div>' +
          '</div>';
      }
      grid.innerHTML = sk;
      empty.classList.remove("visible");
      locked.classList.remove("visible");
      if (err) err.classList.remove("visible");
      counter.textContent = "";
      selectBtn.classList.remove("visible");
      if (sortBtn) sortBtn.classList.remove("visible");
      document.getElementById("vault-select-all-header").classList.remove("visible");
      document.getElementById("vault-action-bar").classList.remove("visible");
      return;
    }

    if (!isPro()) {
      grid.innerHTML = "";
      empty.classList.remove("visible");
      if (err) err.classList.remove("visible");
      locked.classList.add("visible");
      counter.textContent = "";
      selectBtn.classList.remove("visible");
      if (sortBtn) sortBtn.classList.remove("visible");
      document.getElementById("vault-select-all-header").classList.remove("visible");
      document.getElementById("vault-action-bar").classList.remove("visible");
      updateMenuLabel();
      return;
    }

    locked.classList.remove("visible");
    selectBtn.classList.add("visible");

    if (_loadFailed) {
      grid.innerHTML = "";
      empty.classList.remove("visible");
      if (err) err.classList.add("visible");
      counter.textContent = "";
      selectBtn.classList.remove("visible");
      if (sortBtn) sortBtn.classList.remove("visible");
      document.getElementById("vault-select-all-header").classList.remove("visible");
      document.getElementById("vault-action-bar").classList.remove("visible");
      updateMenuLabel();
      return;
    }

var allCards = getCards();

var view = allCards;
if (_query) {
  view = allCards.filter(function (c) {
    var hay = ((c.name || "") + " " + (c.text || "")).toLowerCase();
    return hay.indexOf(_query) !== -1;
  });
}

/* update counter */
var used = allCards.length;
var max = 50;
counter.textContent = "\u{1F4BE} " + used + " of " + max + " cards saved";

/* show empty state when vault is empty or no matches */
if (allCards.length === 0) {
  /* no matches when query is set but returns no results */
  if (_query) {
    grid.innerHTML = "";
    if (err) err.classList.remove("visible");
    empty.classList.add("visible");
    var emptyTitle = document.getElementById("vault-empty-title");
    var emptyDesc = document.getElementById("vault-empty-desc");
    if (emptyTitle) emptyTitle.textContent = "No cards match";
    if (emptyDesc) emptyDesc.textContent = 'Nothing found for "' + _query + '". Try a different name or word.';
    selectBtn.classList.remove("visible");
    if (sortBtn) sortBtn.classList.remove("visible");
    document.getElementById("vault-select-all-header").classList.remove("visible");
    document.getElementById("vault-action-bar").classList.remove("visible");
    updateMenuLabel();
    return;
  }
  /* normal empty */
  grid.innerHTML = "";
  if (err) err.classList.remove("visible");
  empty.classList.add("visible");
  selectBtn.classList.remove("visible");
  if (sortBtn) sortBtn.classList.remove("visible");
  document.getElementById("vault-select-all-header").classList.remove("visible");
  counter.textContent = "\u{1F4BE} 0 of 50 cards saved";
  document.getElementById("vault-action-bar").classList.remove("visible");
  updateMenuLabel();
  return;
}

empty.classList.remove("visible");
if (err) err.classList.remove("visible");
if (sortBtn) sortBtn.classList.add("visible");

/* render grid (sorted copy — never mutates the underlying cards) */
var sorted = view.slice();
sorted.sort(_sort === "oldest"
  ? function (a, b) { return new Date(a.createdAt) - new Date(b.createdAt); }
  : function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
var html = "";
for (var i = 0; i < sorted.length; i++) {
  var c = sorted[i];
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
    var html = "";
    for (var i = 0; i < sorted.length; i++) {
      var c = sorted[i];
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
    var view = allCards;
    if (_query) {
      view = allCards.filter(function (c) {
        var hay = ((c.name || "") + " " + (c.text || "")).toLowerCase();
        return hay.indexOf(_query) !== -1;
      });
    }
    var headerBtn = document.getElementById("vault-select-all-header");
    var allSelected = !headerBtn.classList.contains("all-selected");
    if (allSelected) {
      selectedIds = {};
      view.forEach(function (c) { selectedIds[c.id] = true; });
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

  function updateSortBtn() {
    var btn = document.getElementById("vault-sort-btn");
    if (!btn) return;
    var isNewest = _sort !== "oldest";
    var icon = btn.querySelector("i");
    if (icon) icon.className = "fa-solid " + (isNewest ? "fa-arrow-down-short-wide" : "fa-arrow-up-short-wide");
    var label = document.getElementById("vault-sort-label");
    if (label) label.textContent = isNewest ? "Newest" : "Oldest";
    btn.classList.toggle("active", !isNewest);
    btn.setAttribute("aria-label", isNewest
      ? "Sort: newest first. Tap to sort oldest first."
      : "Sort: oldest first. Tap to sort newest first.");
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
            var delRes = await fetch(window._API_BASE + "/api/vault/delete", {
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
          var delRes2 = await fetch(window._API_BASE + "/api/vault/delete", {
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
  // Legacy cards saved before the image_url column exist may have an empty
  // imageUrl — fall back to the known Blob host so their voices stay playable.
  var BLOB_HOST = "jkzbaevzmimaelrr.public.blob.vercel-storage.com";
  function voiceUrlForCard(card) {
    if (!card || !card.shortId) return "";
    var host = "";
    try { host = new URL(card.imageUrl || "").origin; } catch (e) {}
    if (!host) host = "https://" + BLOB_HOST;
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
      if (!host) host = "https://" + BLOB_HOST;
      urls.push(host + "/voice/" + card.shortId);
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
        var res2 = await fetch(window._API_BASE + "/api/download/" + card.shortId);
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
    _loading = true;
    _query = "";
    try { document.getElementById("vault-search-input").value = ""; } catch (e) {}
    render();
    try {
      await loadCards();
    } finally {
      _loading = false;
      render();
    }
  }

  function hideVault() {
    var overlay = document.getElementById("vault-overlay");
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    selectMode = false;
    selectedIds = {};
    _loading = false;
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
