(() => {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const header = document.querySelector(".site-header-bar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navMotionQuery = window.matchMedia("(min-width: 721px)");
  const MARKED_SRC = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
  const LEARN_SRC = new URL("./assets/js/learn.js", location.href).href;
  const MAIN_SRC = new URL("./assets/js/main.js", location.href).href;
  const PILL_MS = 340;
  const PAGE_OUT_MS = 360;
  const PAGE_IN_MS = 720;

  let lastPageKey = pageKey(location.href);
  let navToken = 0;
  const pageCache = new Map();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  }

  if (header) {
    const syncHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  function pageKey(url) {
    const target = new URL(url, location.href);
    return target.pathname.replace(/\/index\.html$/, "/");
  }

  function syncActiveLinks() {
    if (!nav) return;
    const path = pageKey(location.href);

    [...nav.querySelectorAll("a")].forEach((a) => {
      a.removeAttribute("aria-current");
      const href = a.getAttribute("href");
      if (!href) return;
      const target = new URL(href, location.href);
      if (pageKey(target) !== path) return;
      const linkC = target.searchParams.get("c");
      const pageC = new URLSearchParams(location.search).get("c");
      if (linkC && pageC !== linkC) return;
      if (!linkC && pageC === "14") return;
      a.setAttribute("aria-current", "page");
    });
  }

  syncActiveLinks();

  if (!nav) return;

  const links = [...nav.querySelectorAll("a")];
  if (!links.length) return;

  let indicator = nav.querySelector(".nav-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.prepend(indicator);
  }

  const activeLink = () => nav.querySelector('[aria-current="page"]');

  const moveIndicator = (link, { animate = true } = {}) => {
    if (!link || !navMotionQuery.matches) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const top = linkRect.top - navRect.top;

    if (!animate || prefersReducedMotion) {
      indicator.style.transition = "none";
    }

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;

    if (!animate || prefersReducedMotion) {
      indicator.offsetHeight;
      indicator.style.transition = "";
    }
  };

  const syncIndicator = ({ animate = false } = {}) => {
    const current = activeLink();
    if (!current) {
      indicator.style.opacity = "0";
      nav.classList.remove("is-indicator-ready");
      return;
    }

    moveIndicator(current, { animate });
    nav.classList.add("is-indicator-ready");
  };

  syncIndicator();

  function selectTab(link, { animate = true } = {}) {
    links.forEach((item) => item.removeAttribute("aria-current"));
    link.setAttribute("aria-current", "page");
    moveIndicator(link, { animate: animate && !prefersReducedMotion });
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  function pageShellNodes() {
    return [
      document.querySelector("main"),
      document.querySelector(".app-shell"),
      ...document.querySelectorAll("body > .site-footer, body > .pager-footer"),
    ].filter(Boolean);
  }

  async function leavePage() {
    if (prefersReducedMotion) return;
    const nodes = pageShellNodes();
    if (!nodes.length) return;
    nodes.forEach((el) => {
      el.classList.remove("is-page-entering", "is-page-pending");
      el.classList.add("is-page-leaving");
    });
    await wait(PAGE_OUT_MS);
  }

  function holdPage() {
    if (prefersReducedMotion) return;
    pageShellNodes().forEach((el) => {
      el.classList.remove("is-page-leaving", "is-page-entering");
      el.classList.add("is-page-pending");
    });
  }

  function enterPage() {
    if (prefersReducedMotion) return;
    const nodes = pageShellNodes();
    if (!nodes.length) return;
    nodes.forEach((el) => {
      el.classList.remove("is-page-leaving", "is-page-pending");
      void el.offsetWidth;
      el.classList.add("is-page-entering");
    });
    window.setTimeout(() => {
      nodes.forEach((el) => el.classList.remove("is-page-entering"));
    }, PAGE_IN_MS);
  }

  async function prefetchPage(href) {
    if (pageCache.has(href)) return pageCache.get(href);

    const pending = fetch(href, { credentials: "same-origin" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Could not load ${href}`);
        return response.text();
      })
      .catch((error) => {
        pageCache.delete(href);
        throw error;
      });

    pageCache.set(href, pending);
    return pending;
  }

  function loadScript(src) {
    const absolute = new URL(src, location.href).href;
    if ([...document.scripts].some((script) => script.src === absolute)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = absolute;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${absolute}`));
      document.body.appendChild(script);
    });
  }

  async function ensurePageScripts(doc) {
    const needsMarked = Boolean(doc.querySelector('script[src*="marked"]'));
    const needsLearn = Boolean(doc.querySelector('script[src*="learn.js"]'));
    const needsMain = Boolean(doc.querySelector('script[src*="main.js"]'));

    window.__reanGitDeferContentMount = true;
    window.__reanGitDeferHomeMount = true;

    try {
      if (needsMarked && !window.marked) await loadScript(MARKED_SRC);
      if (needsLearn) await loadScript(LEARN_SRC);
      if (needsMain) await loadScript(MAIN_SRC);
    } finally {
      window.__reanGitDeferContentMount = false;
      window.__reanGitDeferHomeMount = false;
    }
  }

  function replaceShell(doc) {
    document.title = doc.title;

    document.body.className = doc.body.className;
    const page = doc.body.getAttribute("data-page");
    if (page) document.body.setAttribute("data-page", page);
    else document.body.removeAttribute("data-page");

    document
      .querySelectorAll("body > main, body > .app-shell, body > .backdrop, body > footer")
      .forEach((el) => el.remove());

    const header = document.querySelector("body > header");
    let anchor = header;
    doc
      .querySelectorAll("body > .backdrop, body > main, body > .app-shell, body > footer")
      .forEach((el) => {
        const node = document.importNode(el, true);
        if (anchor) {
          anchor.after(node);
          anchor = node;
        } else {
          document.body.appendChild(node);
          anchor = node;
        }
      });
  }

  async function bootPage({ animate = true } = {}) {
    window.ReanGitContent?.unmount?.();

    const page = document.body.dataset.page;
    if (page === "learn" || page === "lab") {
      await window.ReanGitContent?.mount?.({ animate });
      return;
    }

    window.ReanGitHome?.mount?.();
  }

  async function applyDocument(href, html, { push = true, animate = true } = {}) {
    const targetUrl = new URL(href, location.href);
    const doc = new DOMParser().parseFromString(html, "text/html");

    await ensurePageScripts(doc);
    await nextFrame();

    replaceShell(doc);
    if (animate) holdPage();
    if (push) history.pushState({ soft: true }, "", targetUrl.href);
    lastPageKey = pageKey(targetUrl);
    syncActiveLinks();
    syncIndicator({ animate: false });

    // Mount first (no inner motion), then ease the whole page in once content is ready.
    await nextFrame();
    await bootPage({ animate: false });
    window.scrollTo(0, 0);

    if (animate) {
      await nextFrame();
      enterPage();
    }
  }

  async function softNavigate(href, { push = true, animatePill = false, animate = true } = {}) {
    const targetUrl = new URL(href, location.href);
    if (targetUrl.origin !== location.origin) {
      location.assign(targetUrl.href);
      return;
    }

    const sameDocument = pageKey(targetUrl) === pageKey(location.href);

    if (sameDocument && document.body.dataset.page === "learn") {
      const chapterId = targetUrl.searchParams.get("c");
      if (push) history.pushState({ soft: true }, "", targetUrl.href);
      lastPageKey = pageKey(targetUrl);
      syncActiveLinks();
      if (!animatePill) syncIndicator({ animate: false });
      window.ReanGitContent?.goLearn?.(chapterId, { push: false, animate });
      return;
    }

    if (sameDocument && document.body.dataset.page === "lab") {
      const labId = targetUrl.searchParams.get("id");
      if (push) history.pushState({ soft: true }, "", targetUrl.href);
      lastPageKey = pageKey(targetUrl);
      syncActiveLinks();
      if (!animatePill) syncIndicator({ animate: false });
      window.ReanGitContent?.goLab?.(labId, { push: false, animate });
      return;
    }

    if (animate) await leavePage();
    const html = await prefetchPage(targetUrl.href);
    await applyDocument(targetUrl.href, html, { push, animate });
  }

  async function navigateFromLink(link) {
    const href = link.href;
    if (href === location.href) return;

    const token = ++navToken;
    const shouldAnimatePill = navMotionQuery.matches && !prefersReducedMotion;
    const shouldAnimatePage = !prefersReducedMotion;

    // Paint the pill immediately — before any network/DOM work.
    selectTab(link, { animate: shouldAnimatePill });
    await nextFrame();
    if (token !== navToken) return;

    const targetUrl = new URL(href, location.href);
    const sameDocument = pageKey(targetUrl) === pageKey(location.href);
    const sameLearnOrLab =
      sameDocument &&
      (document.body.dataset.page === "learn" || document.body.dataset.page === "lab");
    const prefetch = sameDocument ? null : prefetchPage(href);

    // Fade outgoing page while the pill travels (same-doc chapter/lab handles its own leave).
    const leavePromise =
      shouldAnimatePage && !sameLearnOrLab ? leavePage() : Promise.resolve();

    if (shouldAnimatePill) await wait(PILL_MS);
    await leavePromise;
    if (token !== navToken) return;

    try {
      if (sameDocument && document.body.dataset.page === "learn") {
        await softNavigate(href, { push: true, animatePill: true, animate: true });
        return;
      }

      if (sameDocument && document.body.dataset.page === "lab") {
        await softNavigate(href, { push: true, animatePill: true, animate: true });
        return;
      }

      const html = await (prefetch || prefetchPage(href));
      if (token !== navToken) return;
      await applyDocument(href, html, { push: true, animate: true });
    } catch {
      if (token === navToken) location.assign(href);
    }
  }

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => {
      if (link.href === location.href) return;
      const targetUrl = new URL(link.href, location.href);
      if (pageKey(targetUrl) === pageKey(location.href)) return;
      prefetchPage(link.href).catch(() => {});
    });

    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank"
      ) {
        return;
      }

      if (link.href === location.href) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      navigateFromLink(link);
    });
  });

  window.addEventListener("popstate", () => {
    const nextKey = pageKey(location.href);
    if (nextKey === lastPageKey) return;

    const token = ++navToken;
    softNavigate(location.href, { push: false })
      .then(() => {
        if (token !== navToken) return;
        syncActiveLinks();
        syncIndicator({ animate: false });
      })
      .catch(() => {
        if (token === navToken) location.reload();
      });
  });

  navMotionQuery.addEventListener("change", () => syncIndicator());
  window.addEventListener("resize", () => syncIndicator());
  window.addEventListener("pageshow", () => syncIndicator());
})();
