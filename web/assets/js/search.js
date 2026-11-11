(() => {
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
            id="site-search-input"
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded="false"
            aria-controls="site-search-results"
            data-search-input
            autocomplete="off"
            data-i18n="nav.searchPlaceholder"
            data-i18n-attr="placeholder"
            placeholder="Search chapters and labs"
          />
          <ul id="site-search-results" class="search-results" data-search-results role="listbox"></ul>
          <p class="search-empty" data-search-empty hidden data-i18n="nav.searchEmpty">No matching chapters or labs</p>
          <p class="search-status" data-search-status hidden role="status"></p>
          <p class="search-hint" data-i18n="nav.searchHint">Type to search · Esc to close</p>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const dialog = modal.querySelector(".search-dialog");
    const input = modal.querySelector("[data-search-input]");
    const list = modal.querySelector("[data-search-results]");
    const empty = modal.querySelector("[data-search-empty]");
    const status = modal.querySelector("[data-search-status]");
    if (!dialog || !input || !list) return;

    let trap = null;
    let activeIndex = 0;
    let chapterBodies = new Map();
    let labBodies = new Map();
    let indexLocale = null;
    let deepIndexReady = false;
    let indexPromise = null;
    let debounceTimer = 0;
    let latestQuery = "";

    function isOpen() {
      return !modal.hidden;
    }

    function setStatus(message) {
      if (!status) return;
      if (!message) {
        status.hidden = true;
        status.textContent = "";
        return;
      }
      status.hidden = false;
      status.textContent = message;
    }

    async function ensureSearchIndex() {
      const locale = window.ReanGitI18n?.getLocale?.() || "en";
      if (indexLocale === locale && deepIndexReady) return;
      if (indexPromise) return indexPromise;

      const loadMd = window.ReanGitUtil?.loadLocalizedMarkdown;
      if (!loadMd) return;

      const indexingLabel =
        window.ReanGitI18n?.t?.("nav.searchIndexing") || "Indexing chapters and labs…";
      setStatus(indexingLabel);

      indexPromise = (async () => {
        try {
          const guide = await loadMd("guide.md", { optional: true });
          const parsed = window.ReanGitUtil?.parseGuideChapters?.(guide) || [];
          chapterBodies = new Map(parsed.map((chapter) => [chapter.id, chapter.body]));

          await window.ReanGitCatalog?.ready;
          const catalog = window.ReanGitCatalog?.getLabs?.() || [];
          const entries = await Promise.all(
            catalog.map(async (lab) => [lab.id, await loadMd(`labs/${lab.id}.md`, { optional: true })])
          );
          labBodies = new Map(entries);
          indexLocale = locale;
          deepIndexReady = true;
        } finally {
          indexPromise = null;
          if (isOpen()) setStatus("");
        }
      })();

      return indexPromise;
    }

    function collectItems() {
      const i18n = window.ReanGitI18n;
      const dict = i18n?.getDict?.() || {};
      const chapters = Object.entries(dict.chapters || {}).map(([id, title]) => ({
        href: `./learn.html?c=${encodeURIComponent(id)}`,
        title: String(title),
        haystack: `${title} ${chapterBodies.get(id) || ""}`.toLowerCase(),
        kind: i18n?.t?.("learn.chapters") || "Chapters",
      }));
      const labs = (window.ReanGitCatalog?.getLabs?.() || []).map((lab) => {
        const title = i18n?.t?.(`labs.${lab.id}.title`) || lab.id;
        const teaser = i18n?.t?.(`labs.${lab.id}.teaser`) || "";
        const summary = i18n?.t?.(`labs.${lab.id}.summary`) || "";
        const body = labBodies.get(lab.id) || "";
        return {
          href: `./lab.html?id=${encodeURIComponent(lab.id)}`,
          title: String(title),
          haystack: `${title} ${teaser} ${summary} ${lab.id} ${body}`.toLowerCase(),
          kind: i18n?.t?.("lab.labs") || "Labs",
        };
      });
      return [...chapters, ...labs];
    }

    function resultLinks() {
      return [...list.querySelectorAll('[role="option"]')];
    }

    function setActive(index) {
      const links = resultLinks();
      if (!links.length) {
        activeIndex = 0;
        input.removeAttribute("aria-activedescendant");
        return;
      }
      activeIndex = (index + links.length) % links.length;
      links.forEach((link, i) => {
        const selected = i === activeIndex;
        link.classList.toggle("is-active", selected);
        link.setAttribute("aria-selected", String(selected));
      });
      input.setAttribute("aria-activedescendant", links[activeIndex].id);
      links[activeIndex].scrollIntoView({ block: "nearest" });
    }

    function paintResultStatus(matchCount, shownCount, needle) {
      if (indexPromise) return;
      if (!needle || !matchCount) {
        setStatus("");
        return;
      }
      const i18n = window.ReanGitI18n;
      if (matchCount > shownCount) {
        setStatus(
          i18n?.t?.("nav.searchResultsTruncated", {
            count: String(matchCount),
            shown: String(shownCount),
          }) || `${matchCount} results — showing first ${shownCount}`
        );
        return;
      }
      setStatus(
        i18n?.t?.("nav.searchResults", { count: String(matchCount) }) ||
          `${matchCount} result${matchCount === 1 ? "" : "s"}`
      );
    }

    function render(query = input.value) {
      latestQuery = query;
      const needle = query.trim().toLowerCase();
      const matches = collectItems().filter((item) => !needle || item.haystack.includes(needle));
      const limited = matches.slice(0, 12);
      list.innerHTML = limited
        .map(
          (item, index) =>
            `<li role="presentation"><a id="search-opt-${index}" role="option" aria-selected="${index === 0 ? "true" : "false"}" href="${escapeSearchHtml(item.href)}"><strong>${escapeSearchHtml(item.title)}</strong><small>${escapeSearchHtml(item.kind)}</small></a></li>`
        )
        .join("");
      if (empty) empty.hidden = limited.length > 0;
      paintResultStatus(matches.length, limited.length, needle);
      setActive(0);
    }

    function open() {
      modal.hidden = false;
      input.setAttribute("aria-expanded", "true");
      window.ReanGitI18n?.apply?.(modal);
      render(input.value);
      trap = window.ReanGitA11y.createFocusTrap(dialog);
      trap.activate();
      input.focus();
      input.select();
      ensureSearchIndex().then(() => {
        if (isOpen()) render(input.value);
      });
    }

    function close() {
      if (modal.hidden) return;
      modal.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      setStatus("");
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

    input.addEventListener("input", () => {
      const query = input.value;
      // Clear stale matches immediately so callers don't read the previous result set.
      if (query.trim() !== latestQuery.trim()) {
        list.innerHTML = "";
        if (empty) empty.hidden = true;
        input.removeAttribute("aria-activedescendant");
      }
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => render(query), 80);
    });

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
      if (event.key !== "/" || typing || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      event.preventDefault();
      open();
    });

    window.ReanGitI18n?.onChange?.(() => {
      chapterBodies = new Map();
      labBodies = new Map();
      indexLocale = null;
      deepIndexReady = false;
      indexPromise = null;
      if (!isOpen()) return;
      window.ReanGitI18n?.apply?.(modal);
      render(input.value);
      ensureSearchIndex().then(() => {
        if (isOpen()) render(input.value);
      });
    });
    window.ReanGitCatalog?.ready?.then(() => {
      if (isOpen()) render(input.value);
    });
  }

  setupSearch();
})();
