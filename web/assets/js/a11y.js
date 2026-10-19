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

  window.ReanGitA11y = { getFocusable, createFocusTrap, announce, focusMain };
})();
