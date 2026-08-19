(() => {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const header = document.querySelector(".site-header-bar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navMotionQuery = window.matchMedia("(min-width: 721px)");
  const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const THEME_KEY = "rean-git-theme";
  const MARKED_SRC = new URL("./assets/vendor/marked.min.js", location.href).href;
  const MARKED_INTEGRITY =
    "sha384-948ahk4ZmxYVYOc+rxN1H2gM1EJ2Duhp7uHtZ4WSLkV4Vtx5MUqnV+l7u9B+jFv+";
  const PURIFY_SRC = new URL("./assets/vendor/purify.min.js", location.href).href;
  const PURIFY_INTEGRITY =
    "sha384-JEyTNhjM6R1ElGoJns4U2Ln4ofPcqzSsynQkmEc/KGy6336qAZl70tDLufbkla+3";
  const LEARN_SRC = new URL("./assets/js/learn.js", location.href).href;
  const MAIN_SRC = new URL("./assets/js/main.js", location.href).href;
  const CATALOG_SRC = new URL("./assets/js/catalog.js", location.href).href;
  const UTIL_SRC = new URL("./assets/js/util.js", location.href).href;
  const PILL_MS = 340;
  const PAGE_OUT_MS = 360;
  const PAGE_IN_MS = 720;

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

  window.ReanGitA11y = { getFocusable, createFocusTrap };

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || navigator.webdriver) return;
    const src = new URL("./sw.js", location.href);
    const scope = new URL("./", location.href).pathname;
    navigator.serviceWorker.register(src, { scope }).catch(() => {});
  }

  let lastPageKey = pageKey(location.href);
  let navToken = 0;
  const pageCache = new Map();

  function systemTheme() {
    return themeQuery.matches ? "dark" : "light";
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  let themeBusy = false;

  function setThemeRevealOrigin(x, y) {
    const root = document.documentElement;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    root.style.setProperty("--theme-x", `${x}px`);
    root.style.setProperty("--theme-y", `${y}px`);
    root.style.setProperty("--theme-r", `${radius}px`);
  }

  function paintTheme(theme) {
    const next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.setAttribute("content", next === "dark" ? "#2f3644" : "#f3f5f7");
    if (themeToggle) {
      const i18n = window.ReanGitI18n;
      const label =
        next === "dark"
          ? i18n?.t?.("nav.themeToLight") || "Switch to light mode"
          : i18n?.t?.("nav.themeToDark") || "Switch to dark mode";
      themeToggle.setAttribute("aria-label", label);
    }
    return next;
  }

  function applyTheme(theme, { persist = false, animate = false, originX, originY } = {}) {
    const next = theme === "dark" ? "dark" : "light";
    if (next === currentTheme()) {
      paintTheme(next);
      if (persist) localStorage.setItem(THEME_KEY, next);
      return;
    }

    const commit = () => {
      paintTheme(next);
      if (persist) localStorage.setItem(THEME_KEY, next);
    };

    const canViewTransition =
      animate &&
      !prefersReducedMotion &&
      !themeBusy &&
      typeof document.startViewTransition === "function";

    if (canViewTransition) {
      const fallbackX = themeToggle
        ? themeToggle.getBoundingClientRect().left + themeToggle.offsetWidth / 2
        : window.innerWidth / 2;
      const fallbackY = themeToggle
        ? themeToggle.getBoundingClientRect().top + themeToggle.offsetHeight / 2
        : window.innerHeight / 2;
      const x = Number.isFinite(originX) && originX > 0 ? originX : fallbackX;
      const y = Number.isFinite(originY) && originY > 0 ? originY : fallbackY;

      setThemeRevealOrigin(x, y);
      themeBusy = true;
      document.documentElement.classList.add("theme-transitioning");

      try {
        const transition = document.startViewTransition(commit);
        transition.finished
          .catch(() => {})
          .finally(() => {
            themeBusy = false;
            document.documentElement.classList.remove("theme-transitioning");
          });
      } catch {
        themeBusy = false;
        document.documentElement.classList.remove("theme-transitioning");
        commit();
      }
      return;
    }

    if (animate && !prefersReducedMotion) {
      document.documentElement.classList.add("theme-animate");
      commit();
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-animate");
      }, 900);
      return;
    }

    commit();
  }

  applyTheme(localStorage.getItem(THEME_KEY) || systemTheme());
  window.ReanGitI18n?.ready?.then(() => paintTheme(currentTheme()));
  window.ReanGitI18n?.onChange?.(() => paintTheme(currentTheme()));

  if (themeToggle) {
    themeToggle.addEventListener("click", (event) => {
      applyTheme(currentTheme() === "dark" ? "light" : "dark", {
        persist: true,
        animate: true,
        originX: event.clientX,
        originY: event.clientY,
      });
    });
  }

  const onSystemThemeChange = () => {
    if (localStorage.getItem(THEME_KEY)) return;
    applyTheme(systemTheme());
  };
  if (typeof themeQuery.addEventListener === "function") {
    themeQuery.addEventListener("change", onSystemThemeChange);
  } else if (typeof themeQuery.addListener === "function") {
    themeQuery.addListener(onSystemThemeChange);
  }

  if (toggle && nav) {
    let navTrap = null;

    const setNavOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      const mobile = !navMotionQuery.matches;
      if (open && mobile) {
        if (!navTrap) {
          navTrap = createFocusTrap(nav, [toggle]);
          navTrap.activate();
        }
      } else if (navTrap) {
        navTrap.deactivate();
        navTrap = null;
      }
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      setNavOpen(!open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavOpen(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      setNavOpen(false);
    });

    navMotionQuery.addEventListener("change", () => {
      if (navMotionQuery.matches) setNavOpen(false);
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
    const pageC = new URLSearchParams(location.search).get("c");
    const links = [...nav.querySelectorAll("a")];
    const hasChapterMatch = links.some((a) => {
      const href = a.getAttribute("href");
      if (!href) return false;
      const target = new URL(href, location.href);
      if (pageKey(target) !== path) return false;
      const linkC = target.searchParams.get("c");
      return Boolean(linkC && pageC === linkC);
    });

    links.forEach((a) => {
      a.removeAttribute("aria-current");
      const href = a.getAttribute("href");
      if (!href) return;
      const target = new URL(href, location.href);
      if (pageKey(target) !== path) return;
      const linkC = target.searchParams.get("c");
      if (linkC) {
        if (pageC === linkC) a.setAttribute("aria-current", "page");
        return;
      }
      // Prefer a chapter-specific nav link (e.g. Cheat sheet) over the generic page link (Learn).
      if (hasChapterMatch) return;
      a.setAttribute("aria-current", "page");
    });
  }

  syncActiveLinks();

  function escapeSearchHtml(text) {
    return window.ReanGitUtil.escapeHtml(text);
  }

  function setupSearch() {
    const toggle = document.querySelector("[data-search-toggle]");
    if (!toggle) return;

    let modal = document.querySelector("[data-search-modal]");
    if (!modal) {
      modal = document.createElement("div");
      modal.className = "search-modal";
      modal.hidden = true;
      modal.setAttribute("data-search-modal", "");
      modal.innerHTML = `
        <div class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
          <h2 id="site-search-title" class="visually-hidden" data-i18n="nav.search">Search</h2>
          <input
            type="search"
            data-search-input
            autocomplete="off"
            data-i18n="nav.searchPlaceholder"
            data-i18n-attr="placeholder"
            placeholder="Search chapters and labs"
          />
          <ul class="search-results" data-search-results role="listbox"></ul>
          <p class="search-empty" data-search-empty hidden data-i18n="nav.searchEmpty">No matching chapters or labs</p>
          <p class="search-hint" data-i18n="nav.searchHint">Type to search · Esc to close</p>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const dialog = modal.querySelector(".search-dialog");
    const input = modal.querySelector("[data-search-input]");
    const list = modal.querySelector("[data-search-results]");
    const empty = modal.querySelector("[data-search-empty]");
    if (!dialog || !input || !list) return;

    let trap = null;
    let activeIndex = 0;

    function isOpen() {
      return !modal.hidden;
    }

    function collectItems() {
      const i18n = window.ReanGitI18n;
      const dict = i18n?.getDict?.() || {};
      const chapters = Object.entries(dict.chapters || {}).map(([id, title]) => ({
        href: `./learn.html?c=${encodeURIComponent(id)}`,
        title: String(title),
        haystack: String(title).toLowerCase(),
        kind: i18n?.t?.("learn.chapters") || "Chapters",
      }));
      const labs = (window.ReanGitCatalog?.getLabs?.() || []).map((lab) => {
        const title = i18n?.t?.(`labs.${lab.id}.title`) || lab.id;
        const teaser = i18n?.t?.(`labs.${lab.id}.teaser`) || "";
        const summary = i18n?.t?.(`labs.${lab.id}.summary`) || "";
        return {
          href: `./lab.html?id=${encodeURIComponent(lab.id)}`,
          title: String(title),
          haystack: `${title} ${teaser} ${summary} ${lab.id}`.toLowerCase(),
          kind: i18n?.t?.("lab.labs") || "Labs",
        };
      });
      return [...chapters, ...labs];
    }

    function resultLinks() {
      return [...list.querySelectorAll("a")];
    }

    function setActive(index) {
      const links = resultLinks();
      if (!links.length) {
        activeIndex = 0;
        return;
      }
      activeIndex = (index + links.length) % links.length;
      links.forEach((link, i) => link.classList.toggle("is-active", i === activeIndex));
      links[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function render(query) {
      const needle = query.trim().toLowerCase();
      const matches = collectItems().filter((item) => !needle || item.haystack.includes(needle));
      const limited = matches.slice(0, 12);
      list.innerHTML = limited
        .map(
          (item) =>
            `<li><a href="${escapeSearchHtml(item.href)}"><strong>${escapeSearchHtml(item.title)}</strong><small>${escapeSearchHtml(item.kind)}</small></a></li>`
        )
        .join("");
      if (empty) empty.hidden = limited.length > 0;
      setActive(0);
    }

    function open() {
      modal.hidden = false;
      window.ReanGitI18n?.apply?.(modal);
      render(input.value);
      trap = createFocusTrap(dialog);
      trap.activate();
      input.focus();
      input.select();
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      trap?.deactivate();
      trap = null;
      toggle.focus();
    }

    toggle.addEventListener("click", () => {
      if (isOpen()) close();
      else open();
    });

    modal.addEventListener("click", (event) => {
      if (event.target === modal) close();
    });

    list.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });

    input.addEventListener("input", () => render(input.value));

    modal.addEventListener("keydown", (event) => {
      if (!isOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActive(activeIndex + 1);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActive(activeIndex - 1);
        return;
      }
      if (event.key === "Enter") {
        const current = resultLinks()[activeIndex];
        if (!current) return;
        event.preventDefault();
        close();
        current.click();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented) return;
      const typing =
        event.target instanceof HTMLElement &&
        (event.target.closest("input, textarea, select, [contenteditable='true']"));
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (isOpen()) close();
        else open();
        return;
      }
      if (event.key !== "/" || typing || event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      open();
    });

    window.ReanGitI18n?.onChange?.(() => {
      if (!isOpen()) return;
      window.ReanGitI18n?.apply?.(modal);
      render(input.value);
    });
    window.ReanGitCatalog?.ready?.then(() => {
      if (isOpen()) render(input.value);
    });
  }

  setupSearch();
  registerServiceWorker();

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

  function loadScript(src, integrity) {
    const absolute = new URL(src, location.href).href;
    if ([...document.scripts].some((script) => script.src === absolute)) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = absolute;
      if (integrity) {
        script.integrity = integrity;
        script.crossOrigin = "anonymous";
      }
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${absolute}`));
      document.body.appendChild(script);
    });
  }

  async function ensurePageScripts(doc) {
    const needsMarked = Boolean(doc.querySelector('script[src*="marked"]'));
    const needsLearn = Boolean(doc.querySelector('script[src*="learn.js"]'));
    const needsMain = Boolean(doc.querySelector('script[src*="main.js"]'));
    const needsCatalog =
      needsLearn ||
      needsMain ||
      Boolean(doc.querySelector('script[src*="catalog.js"]'));

    window.__reanGitDeferContentMount = true;
    window.__reanGitDeferHomeMount = true;

    try {
      if (needsMarked && !window.marked) {
        await loadScript(MARKED_SRC, MARKED_INTEGRITY);
      }
      if (needsMarked && !window.DOMPurify) {
        await loadScript(PURIFY_SRC, PURIFY_INTEGRITY);
      }
      if (!window.ReanGitUtil) await loadScript(UTIL_SRC);
      if (needsCatalog) await loadScript(CATALOG_SRC);
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
    window.ReanGitI18n?.apply?.();
    if (animate) holdPage();
    if (push) history.pushState({ soft: true }, "", targetUrl.href);
    lastPageKey = pageKey(targetUrl);
    syncActiveLinks();
    syncIndicator({ animate: false });

    // Mount first (no inner motion), then ease the whole page in once content is ready.
    await nextFrame();
    await bootPage({ animate: false });
    window.scrollTo(0, 0);
    window.ReanGitI18n?.syncSeo?.();

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
      window.ReanGitI18n?.syncSeo?.();
      return;
    }

    if (sameDocument && document.body.dataset.page === "lab") {
      const labId = targetUrl.searchParams.get("id");
      if (push) history.pushState({ soft: true }, "", targetUrl.href);
      lastPageKey = pageKey(targetUrl);
      syncActiveLinks();
      if (!animatePill) syncIndicator({ animate: false });
      window.ReanGitContent?.goLab?.(labId, { push: false, animate });
      window.ReanGitI18n?.syncSeo?.();
      return;
    }

    if (animate) await leavePage();
    const html = await prefetchPage(targetUrl.href);
    await applyDocument(targetUrl.href, html, { push, animate });
  }

  async function navigateTo(href, { animatePill = false } = {}) {
    if (href === location.href) return;

    const token = ++navToken;
    const shouldAnimatePill = animatePill && navMotionQuery.matches && !prefersReducedMotion;
    const shouldAnimatePage = !prefersReducedMotion;

    if (shouldAnimatePill) {
      const navLink = links.find((item) => item.href === href);
      if (navLink) selectTab(navLink, { animate: true });
      await nextFrame();
      if (token !== navToken) return;
    }

    const targetUrl = new URL(href, location.href);
    const sameDocument = pageKey(targetUrl) === pageKey(location.href);
    const sameLearnOrLab =
      sameDocument &&
      (document.body.dataset.page === "learn" || document.body.dataset.page === "lab");
    const prefetch = sameDocument ? null : prefetchPage(href);

    const leavePromise =
      shouldAnimatePage && !sameLearnOrLab ? leavePage() : Promise.resolve();

    if (shouldAnimatePill) await wait(PILL_MS);
    await leavePromise;
    if (token !== navToken) return;

    try {
      if (sameDocument && document.body.dataset.page === "learn") {
        await softNavigate(href, { push: true, animatePill, animate: true });
        return;
      }

      if (sameDocument && document.body.dataset.page === "lab") {
        await softNavigate(href, { push: true, animatePill, animate: true });
        return;
      }

      const html = await (prefetch || prefetchPage(href));
      if (token !== navToken) return;
      await applyDocument(href, html, { push: true, animate: true });
    } catch {
      if (token === navToken) location.assign(href);
    }
  }

  function shouldSoftNavigate(event, link) {
    if (event.defaultPrevented) return false;
    if (event.button !== 0) return false;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
    if (link.target === "_blank" || link.hasAttribute("download")) return false;

    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#") || /^(mailto:|tel:|javascript:)/i.test(raw)) {
      return false;
    }

    const targetUrl = new URL(link.href, location.href);
    if (targetUrl.origin !== location.origin) return false;

    const currentUrl = new URL(location.href);
    if (
      targetUrl.pathname === currentUrl.pathname &&
      targetUrl.search === currentUrl.search &&
      targetUrl.hash
    ) {
      return false;
    }

    return true;
  }

  async function navigateFromLink(link) {
    await navigateTo(link.href, { animatePill: true });
  }

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => {
      if (link.href === location.href) return;
      const targetUrl = new URL(link.href, location.href);
      if (pageKey(targetUrl) === pageKey(location.href)) return;
      prefetchPage(link.href).catch(() => {});
    });

    link.addEventListener("click", (event) => {
      if (!shouldSoftNavigate(event, link)) return;

      if (link.href === location.href) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      navigateFromLink(link);
    });
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || nav?.contains(link) || !shouldSoftNavigate(event, link)) return;

    if (link.href === location.href) {
      event.preventDefault();
      return;
    }

    event.preventDefault();
    navigateTo(link.href);
  });

  document.addEventListener(
    "mouseover",
    (event) => {
      const link = event.target.closest("a[href]");
      if (!link || nav?.contains(link)) return;
      if (link.href === location.href) return;
      const targetUrl = new URL(link.href, location.href);
      if (targetUrl.origin !== location.origin) return;
      if (pageKey(targetUrl) === pageKey(location.href)) return;
      prefetchPage(link.href).catch(() => {});
    },
    true
  );

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

  // Remeasure after locale text/font changes — Khmer labels are longer and taller.
  const resyncNavPill = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => syncIndicator({ animate: false }));
    });
  };
  window.ReanGitI18n?.ready?.then(resyncNavPill);
  window.ReanGitI18n?.onChange?.(resyncNavPill);
  if (document.fonts?.ready) {
    document.fonts.ready.then(resyncNavPill).catch(() => {});
  }
  if (document.fonts?.addEventListener) {
    document.fonts.addEventListener("loadingdone", resyncNavPill);
  }
})();
