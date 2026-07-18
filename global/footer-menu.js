(() => {
  // ── Fonts ──
  if (!document.querySelector('link[href*="Space+Grotesk"]')) {
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap";
    document.head.appendChild(fontLink);
  }

  // ── Styles ──
  const style = document.createElement("style");
  style.textContent = `
    .fmenu-root {
      --fmenu-bg: #2a2a2a;
      --fmenu-border: rgba(255, 255, 235, 0.12);
      --fmenu-text: #c0c0b0;
      --fmenu-text-dim: #a0a090;
      --fmenu-accent: #f59e0b;
      --fmenu-toggle-color: #a0a090;
      --fmenu-font-main: "Space Grotesk", sans-serif;
      --fmenu-font-mono: "Space Mono", monospace;
      --fmenu-text-tag: clamp(0.65rem, 0.8vw, 0.75rem);
      --fmenu-text-ui: clamp(0.7rem, 1vw, 1rem);
      --fmenu-z-menu: 100;
      position: relative;
    }

    :root:not(.dark) .fmenu-root {
      --fmenu-bg: #f5f1e6;
      --fmenu-border: rgba(26, 26, 26, 0.12);
      --fmenu-text: #555548;
      --fmenu-text-dim: #77776a;
      --fmenu-toggle-color: #555548;
    }

    .fmenu-toggle {
      font-family: var(--fmenu-font-mono);
      font-size: var(--fmenu-text-tag);
      color: var(--fmenu-toggle-color);
      font-weight: 700;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: color 0.2s;
    }

    .fmenu-toggle:hover {
      color: var(--fmenu-accent);
    }

    .fmenu-toggle:focus-visible {
      outline: 2px solid var(--fmenu-accent);
      outline-offset: 2px;
      border-radius: 2px;
    }

    .fmenu-panel {
      position: absolute;
      bottom: calc(100% + 8px);
      right: 0;
      left: auto;
      background: var(--fmenu-bg);
      border: 1px solid var(--fmenu-border);
      border-radius: 4px;
      padding: 8px 0;
      z-index: var(--fmenu-z-menu);
      min-width: 200px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .fmenu-panel.hidden {
      display: none;
    }

    .fmenu-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 16px;
      color: var(--fmenu-text);
      text-decoration: none;
      font-family: var(--fmenu-font-main);
      font-size: 0.875rem;
      cursor: pointer;
      transition: color 0.15s;
    }

    .footer .fmenu-link:hover,
    .fmenu-link:hover {
      color: var(--fmenu-accent);
    }
    .footer .fmenu-link:hover i,
    .footer .fmenu-link:hover span,
    .fmenu-link:hover i,
    .fmenu-link:hover span {
      color: inherit;
    }

    .fmenu-link i {
      width: 16px;
      text-align: center;
      flex-shrink: 0;
    }

    .fmenu-version {
      display: none;
      padding: 10px 16px 8px;
      border-top: 1px solid var(--fmenu-border);
      line-height: 1.4;
    }
    .fmenu-version.loaded {
      display: block;
    }
    .fmenu-version-number {
      display: block;
      font-family: var(--sans);
      font-size: 0.6rem;
      color: var(--fmenu-text-dim);
    }
    .fmenu-version-name {
      display: block;
      font-family: var(--sans);
      font-size: 0.6rem;
      color: var(--fmenu-text);
    }
  `;
  document.head.appendChild(style);

  // ── HTML ──
  const wrapper = document.createElement("span");
  wrapper.className = "fmenu-root";
  wrapper.innerHTML = `
    <a
      href="#"
      id="fmenu-toggle"
      class="fmenu-toggle"
      rel="noopener noreferrer"
      aria-label="Open menu"
      aria-expanded="false"
    >[ <i class="fa-solid fa-question"></i> ]</a>

    <div class="fmenu-panel hidden" id="fmenu-panel">
      <a href="https://medium.com/" class="fmenu-link" rel="noopener noreferrer" target="_blank">
        <i class="fa-brands fa-medium" aria-hidden="true"></i><span data-i18n="footer.articles">Read Articles</span>
      </a>
      <a href="mailto:yellowgreenlabs@proton.me?subject=Wibe%20Stories%20Feedback" class="fmenu-link">
        <i class="fa-solid fa-pen-clip" aria-hidden="true"></i><span data-i18n="footer.issues">Submit Issues</span>
      </a>
      <a href="#" class="fmenu-link" id="fmenu-help">
        <i class="fa-solid fa-circle-question" aria-hidden="true"></i><span data-i18n="footer.help">How to Use</span>
      </a>
      <a href="/docs/" class="fmenu-link">
        <i class="fa-solid fa-book" aria-hidden="true"></i><span data-i18n="footer.docs">Documentation</span>
      </a>
      <a href="/docs/legal/license" class="fmenu-link">
        <i class="fa-solid fa-file-lines" aria-hidden="true"></i><span data-i18n="footer.legal">Legal</span>
      </a>
      <a href="/key-status" class="fmenu-link">
        <i class="fa-solid fa-key" aria-hidden="true"></i><span>Wibe Pass</span>
      </a>
      <div class="fmenu-version" id="fmenu-version">
        <span class="fmenu-version-number" id="fmenu-version-number"></span>
        <span class="fmenu-version-name">Wibe Stories</span>
      </div>
    </div>
  `;

  document.currentScript
    ? document.currentScript.parentNode.insertBefore(
        wrapper,
        document.currentScript
      )
    : document.body.appendChild(wrapper);

  // ── Behaviour ──
  const toggle = wrapper.querySelector("#fmenu-toggle");
  const panel = wrapper.querySelector("#fmenu-panel");

  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    const isHidden = panel.classList.toggle("hidden");
    toggle.setAttribute("aria-expanded", String(!isHidden));
  });

  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      panel.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  var helpLink = wrapper.querySelector("#fmenu-help");
  helpLink?.addEventListener("click", (e) => {
    e.preventDefault();
    panel.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
    if (typeof window.showOnboarding === "function") window.showOnboarding();
  });

  window.addEventListener("scroll", () => {
    panel.classList.add("hidden");
    toggle.setAttribute("aria-expanded", "false");
  }, { passive: true });

  // ── Version ──
  const versionDiv = wrapper.querySelector("#fmenu-version");
  const versionSpan = wrapper.querySelector("#fmenu-version-number");

  fetch("version.json?v=" + Date.now(), { cache: "no-store" })
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (data.version) {
        versionSpan.textContent = data.version;
        versionDiv.classList.add("loaded");
      }
    })
    .catch(() => {});

  // ── Occasion email subscription modal ──
  // Matches share-modal pattern in overlays.css
  const subStyle = document.createElement("style");
  subStyle.textContent = `
    .fmenu-sub-link {
      font-family: "Space Grotesk", sans-serif;
      font-size: clamp(0.65rem, 0.8vw, 0.75rem);
      color: var(--ink3, #a0a090);
      text-decoration: none;
      cursor: pointer;
      white-space: nowrap;
    }
    .fmenu-sub-link:hover {
      color: #f59e0b;
    }
    .fmenu-sub-sep {
      color: var(--ink3, #a0a090);
      opacity: 0.4;
      margin: 0 4px;
    }
    .fmenu-sub-modal {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.25s;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .fmenu-sub-modal.open {
      opacity: 1;
      pointer-events: auto;
    }
    .fmenu-sub-backdrop {
      position: absolute;
      inset: 0;
      background: transparent;
    }
    .fmenu-sub-content {
      position: relative;
      background: var(--cream);
      border-radius: 16px;
      padding: 32px;
      max-width: 380px;
      width: 90vw;
      text-align: center;
      box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
    }
    :root.dark .fmenu-sub-content {
      background: #2a2a2a;
    }
    .fmenu-sub-close {
      position: absolute;
      top: 12px;
      right: 16px;
      background: none;
      border: none;
      font-size: clamp(24px, 0.5vw + 22px, 26px);
      color: var(--ink3);
      cursor: pointer;
      line-height: 1;
      padding: 10px;
      touch-action: manipulation;
    }
    .fmenu-sub-close:hover {
      color: var(--ink);
    }
    .fmenu-sub-icon {
      font-size: clamp(48px, 1vw + 42px, 54px);
      margin-bottom: 8px;
      line-height: 1;
    }
    .fmenu-sub-title {
      font-family: var(--serif);
      font-size: clamp(22px, 0.5vw + 20px, 24px);
      font-weight: 700;
      color: var(--ink);
      margin-bottom: 12px;
    }
    .fmenu-sub-sub {
      font-size: clamp(12px, 0.3vw + 11px, 13px);
      color: var(--ink3);
      margin-bottom: 20px;
      line-height: 1.5;
    }
    .fmenu-sub-input {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: 1px solid var(--rule);
      background: var(--cream2);
      color: var(--ink);
      font-size: clamp(14px, 0.3vw + 13px, 15px);
      font-family: "Space Grotesk", sans-serif;
      box-sizing: border-box;
      margin-bottom: 10px;
      outline: none;
    }
    .fmenu-sub-input:focus {
      border-color: var(--ink);
    }
    .fmenu-sub-btn {
      width: 100%;
      padding: 12px;
      border-radius: 8px;
      border: none;
      background: var(--ink);
      color: var(--cream);
      font-size: clamp(14px, 0.3vw + 13px, 15px);
      font-weight: 500;
      cursor: pointer;
      font-family: "Space Grotesk", sans-serif;
      transition: opacity 0.18s;
      touch-action: manipulation;
    }
    .fmenu-sub-btn:hover {
      opacity: 0.85;
    }
    .fmenu-sub-btn:disabled {
      opacity: 0.4;
      cursor: default;
    }
    .fmenu-sub-success {
      display: none;
      font-size: clamp(12px, 0.3vw + 11px, 13px);
      color: #22c55e;
      margin-top: 12px;
    }
    .fmenu-sub-success.visible {
      display: block;
    }
    .fmenu-sub-error {
      display: none;
      font-size: clamp(11px, 0.3vw + 10px, 12px);
      color: #ef4444;
      margin-top: 8px;
    }
    .fmenu-sub-error.visible {
      display: block;
    }
    @media (max-width: 600px) {
      .fmenu-sub-content {
        padding: 28px 20px 24px;
        max-width: none;
        width: 100%;
        border-radius: 20px 20px 0 0;
        margin-top: auto;
      }
      .fmenu-sub-modal {
        align-items: flex-end;
      }
    }
  `;
  document.head.appendChild(subStyle);

  // ── Modal DOM ──
  const modal = document.createElement("div");
  modal.className = "fmenu-sub-modal";
  modal.id = "fmenuSubModal";
  modal.innerHTML =
    '<div class="fmenu-sub-backdrop" id="fmenuSubBackdrop"></div>' +
    '<div class="fmenu-sub-content" id="fmenuSubContent">' +
      '<button class="fmenu-sub-close" id="fmenuSubClose">&times;</button>' +
      '<div class="fmenu-sub-icon">\uD83D\uDCEC</div>' +
      '<div class="fmenu-sub-title">Get occasion reminders</div>' +
      '<p class="fmenu-sub-sub">We\'ll email you before festivals and special days so you never miss a celebration.</p>' +
      '<input type="email" class="fmenu-sub-input" id="fmenuSubEmail" placeholder="your@email.com" />' +
      '<button class="fmenu-sub-btn" id="fmenuSubBtn">Subscribe</button>' +
      '<p class="fmenu-sub-success" id="fmenuSubSuccess">\u2713 You\'re in! We\'ll email you before special days.</p>' +
      '<p class="fmenu-sub-error" id="fmenuSubError"></p>' +
    '</div>';
  document.body.appendChild(modal);

  function openSubPopup() {
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    document.getElementById("fmenuSubEmail").focus();
  }

  function closeSubPopup() {
    modal.classList.remove("open");
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
  }

  document.getElementById("fmenuSubBackdrop").addEventListener("click", closeSubPopup);
  document.getElementById("fmenuSubClose").addEventListener("click", closeSubPopup);

  document.addEventListener("keydown", function subEsc(e) {
    if (e.key === "Escape" && modal.classList.contains("open")) {
      closeSubPopup();
    }
  });

  document.getElementById("fmenuSubBtn").addEventListener("click", async function () {
    const emailInput = document.getElementById("fmenuSubEmail");
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const errorEl = document.getElementById("fmenuSubError");
    const successEl = document.getElementById("fmenuSubSuccess");

    errorEl.classList.remove("visible");
    successEl.classList.remove("visible");

    if (!email || !emailRegex.test(email)) {
      errorEl.textContent = "Please enter a valid email address.";
      errorEl.classList.add("visible");
      return;
    }

    const btn = document.getElementById("fmenuSubBtn");
    btn.disabled = true;
    btn.textContent = "Subscribing\u2026";

    try {
      const res = await fetch("/api/subscribe-occasion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.ok) {
        successEl.classList.add("visible");
        emailInput.value = "";
        btn.textContent = "Joined!";
        setTimeout(function () {
          btn.textContent = "Subscribe";
          btn.disabled = false;
        }, 2000);
      } else {
        errorEl.textContent = data.error || "Something went wrong. Try again.";
        errorEl.classList.add("visible");
        btn.disabled = false;
        btn.textContent = "Subscribe";
      }
    } catch {
      errorEl.textContent = "Could not connect. Check your internet and try again.";
      errorEl.classList.add("visible");
      btn.disabled = false;
      btn.textContent = "Subscribe";
    }
  });

  document.getElementById("fmenuSubEmail").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      document.getElementById("fmenuSubBtn").click();
    }
  });

  // ── Insert " | 📬 Get reminders" inside <p> beside "Wibe Stories" ──
  function addSubLink() {
    if (typeof window.isSupporter === 'function' && window.isSupporter()) return;
    var pEl = document.querySelector('.footer p[data-i18n="footer.text"]');
    if (!pEl) return;
    if (pEl.querySelector('.fmenu-sub-link')) return;
    var aEl = pEl.querySelector('a.footer-wave');
    if (!aEl) return;
    var sep = document.createElement('span');
    sep.className = 'fmenu-sub-sep';
    sep.textContent = ' | ';
    var link = document.createElement('a');
    link.href = '#';
    link.className = 'fmenu-sub-link';
    link.textContent = '\uD83D\uDCEC Get Reminders';
    link.addEventListener('click', function (e) { e.preventDefault(); openSubPopup(); });
    aEl.parentNode.insertBefore(sep, aEl.nextSibling);
    aEl.parentNode.insertBefore(link, sep.nextSibling);
  }

  addSubLink();
  window.addEventListener('i18nApplied', addSubLink);
})();
