(() => {
  function getFocusable(root) {
    return [...root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter((el) => el.getClientRects().length > 0);
  }

  function createFocusTrap(container, extras = []) {
    let previous = null;
    const itemsOf = () => {
      const found = getFocusable(container);
      const extra = extras.filter(
        (el) => el && !found.includes(el) && el.getClientRects().length > 0
      );
      return [...found, ...extra];
    };
    const onKey = (event) => {
      if (event.key !== "Tab") return;
      const items = itemsOf();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    return {
      activate() {
        previous = document.activeElement;
        document.addEventListener("keydown", onKey);
        const items = itemsOf();
        (items[0] || container).focus();
      },
      deactivate() {
        document.removeEventListener("keydown", onKey);
        if (previous && typeof previous.focus === "function") previous.focus();
        previous = null;
      },
    };
  }

  function ensureLiveRegion() {
    let el = document.querySelector("[data-live-region]");
    if (el) return el;
    el = document.createElement("div");
    el.className = "visually-hidden";
    el.setAttribute("data-live-region", "");
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    document.body.appendChild(el);
    return el;
  }

  function announce(message) {
    if (!message) return;
    const el = ensureLiveRegion();
    el.textContent = "";
    window.requestAnimationFrame(() => {
      el.textContent = String(message);
    });
  }

  function enhanceExternalLinks(root = document) {
    if (!root?.querySelectorAll) return;
    const hint =
      window.ReanGitI18n?.t?.("a11y.opensInNewTab") || "opens in a new tab";
    root.querySelectorAll("a[href]").forEach((anchor) => {
      const href = anchor.getAttribute("href") || "";
      let external = anchor.getAttribute("target") === "_blank";
      if (/^https?:\/\//i.test(href)) {
        try {
          const url = new URL(href, location.href);
          if (url.origin !== location.origin) external = true;
        } catch {
          /* ignore bad URLs */
        }
      }
      if (!external) return;
      anchor.setAttribute("target", "_blank");
      const rel = new Set(
        String(anchor.getAttribute("rel") || "")
          .split(/\s+/)
          .filter(Boolean)
      );
      rel.add("noopener");
      rel.add("noreferrer");
      anchor.setAttribute("rel", [...rel].join(" "));
      if (anchor.querySelector("[data-external-hint]")) return;
      const span = document.createElement("span");
      span.className = "visually-hidden";
      span.setAttribute("data-external-hint", "");
      span.textContent = ` (${hint})`;
      anchor.appendChild(span);
    });
  }

  function focusMain({ message } = {}) {
    const main = document.getElementById("main-content");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      try {
        main.focus({ preventScroll: true });
      } catch {
        main.focus();
      }
    }
    if (message) announce(message);
  }

  function confirmAction({
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
  } = {}) {
    return new Promise((resolve) => {
      const existing = document.querySelector("[data-confirm-modal]");
      existing?.remove();

      const modal = document.createElement("div");
      modal.className = "confirm-modal";
      modal.setAttribute("data-confirm-modal", "");
      modal.innerHTML = `
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
          <h2 id="confirm-title" class="confirm-title"></h2>
          <p class="confirm-message"></p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-ghost" data-confirm-cancel></button>
            <button type="button" class="btn btn-primary" data-confirm-ok></button>
          </div>
        </div>
      `;
      const dialog = modal.querySelector(".confirm-dialog");
      const titleEl = modal.querySelector(".confirm-title");
      const messageEl = modal.querySelector(".confirm-message");
      const okBtn = modal.querySelector("[data-confirm-ok]");
      const cancelBtn = modal.querySelector("[data-confirm-cancel]");
      titleEl.textContent = title || message || "";
      messageEl.textContent = title ? message || "" : "";
      messageEl.hidden = !title || !message;
      okBtn.textContent = confirmLabel;
      cancelBtn.textContent = cancelLabel;

      const finish = (value) => {
        trap.deactivate();
        modal.remove();
        document.removeEventListener("keydown", onKey);
        resolve(value);
      };

      const onKey = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          finish(false);
        }
      };

      okBtn.addEventListener("click", () => finish(true));
      cancelBtn.addEventListener("click", () => finish(false));
      modal.addEventListener("click", (event) => {
        if (event.target === modal) finish(false);
      });
      document.addEventListener("keydown", onKey);

      document.body.appendChild(modal);
      const trap = createFocusTrap(dialog);
      trap.activate();
      okBtn.focus();
    });
  }

  function alertAction({ title, message, okLabel = "OK" } = {}) {
    return new Promise((resolve) => {
      const existing = document.querySelector("[data-confirm-modal]");
      existing?.remove();

      const modal = document.createElement("div");
      modal.className = "confirm-modal";
      modal.setAttribute("data-confirm-modal", "");
      modal.innerHTML = `
        <div class="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" tabindex="-1">
          <h2 id="confirm-title" class="confirm-title"></h2>
          <p class="confirm-message"></p>
          <div class="confirm-actions">
            <button type="button" class="btn btn-primary" data-confirm-ok></button>
          </div>
        </div>
      `;
      const dialog = modal.querySelector(".confirm-dialog");
      const titleEl = modal.querySelector(".confirm-title");
      const messageEl = modal.querySelector(".confirm-message");
      const okBtn = modal.querySelector("[data-confirm-ok]");
      titleEl.textContent = title || message || "";
      messageEl.textContent = title ? message || "" : "";
      messageEl.hidden = !title || !message;
      okBtn.textContent = okLabel;

      const finish = () => {
        trap.deactivate();
        modal.remove();
        document.removeEventListener("keydown", onKey);
        resolve();
      };

      const onKey = (event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          finish();
        }
      };

      okBtn.addEventListener("click", finish);
      modal.addEventListener("click", (event) => {
        if (event.target === modal) finish();
      });
      document.addEventListener("keydown", onKey);

      document.body.appendChild(modal);
      const trap = createFocusTrap(dialog);
      trap.activate();
      okBtn.focus();
    });
  }

  window.ReanGitA11y = {
    getFocusable,
    createFocusTrap,
    announce,
    focusMain,
    confirmAction,
    alertAction,
    enhanceExternalLinks,
  };
})();
