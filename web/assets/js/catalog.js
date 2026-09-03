(() => {
  const DATA_URL = new URL("./data/labs.json", location.href).href;
  const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);

  let labs = [];
  let cheatSheetChapter = "26";
  let filterLevel = "all";
  let filtersWired = false;

  const escapeHtml = (text) => window.ReanGitUtil.escapeHtml(text);

  function labNum(_lab, index) {
    return String(index + 1).padStart(2, "0");
  }

  function labHref(id) {
    return `./lab.html?id=${encodeURIComponent(id)}`;
  }

  function visibleLabs() {
    if (filterLevel === "all") return labs;
    return labs.filter((lab) => lab.level === filterLevel);
  }

  function renderTrack(root) {
    if (!root) return;
    root.innerHTML = labs
      .map((lab, index) => {
        const id = escapeHtml(lab.id);
        const done = window.ReanGitUtil?.isLabComplete?.(lab.id);
        return `<li${done ? ' class="is-complete"' : ""}>
          <a href="${labHref(lab.id)}" data-lab-id="${id}">
            <span class="lab-num">${escapeHtml(labNum(lab, index))}</span>
            <h3 class="lab-title" data-i18n="labs.${id}.title"></h3>
            <p class="lab-desc" data-i18n="labs.${id}.teaser"></p>
            ${done ? `<span class="lab-done" data-i18n="ui.done"></span>` : ""}
          </a>
        </li>`;
      })
      .join("");
  }

  function renderGrid(root) {
    if (!root) return;
    const list = visibleLabs();
    root.innerHTML = list
      .map((lab) => {
        const id = escapeHtml(lab.id);
        const index = labs.indexOf(lab);
        const done = window.ReanGitUtil?.isLabComplete?.(lab.id);
        return `<a href="${labHref(lab.id)}" class="is-visible${done ? " is-complete" : ""}" data-lab-id="${id}">
          <span class="num">${escapeHtml(labNum(lab, index))}</span>
          <div>
            <h3 data-i18n="labs.${id}.title"></h3>
            <p data-i18n="labs.${id}.summary"></p>
            ${done ? `<span class="lab-done" data-i18n="ui.done"></span>` : ""}
          </div>
        </a>`;
      })
      .join("");
    window.ReanGitI18n?.apply?.(root);
  }

  function syncFilterButtons() {
    document.querySelectorAll("[data-lab-filter]").forEach((btn) => {
      const active = btn.getAttribute("data-lab-filter") === filterLevel;
      btn.setAttribute("aria-pressed", String(active));
      btn.classList.toggle("is-active", active);
    });
  }

  function setFilter(level) {
    filterLevel = VALID_LEVELS.has(level) || level === "all" ? level : "all";
    syncFilterButtons();
    renderGrid(document.querySelector("[data-lab-grid]"));
  }

  function wireFilters() {
    if (filtersWired) return;
    const bar = document.querySelector("[data-lab-filters]");
    if (!bar) return;
    filtersWired = true;
    bar.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lab-filter]");
      if (!btn) return;
      setFilter(btn.getAttribute("data-lab-filter"));
    });
  }

  function paintCountTitle() {
    const title = document.querySelector("[data-lab-count-title]");
    const i18n = window.ReanGitI18n;
    if (!title || !i18n?.t) return;
    title.textContent = i18n.t("home.pathTitle", { count: String(labs.length) });
  }

  function cheatSheetHref() {
    return `./learn.html?c=${encodeURIComponent(cheatSheetChapter || "26")}`;
  }

  function syncCheatSheetLinks() {
    document.querySelectorAll("[data-cheat-sheet]").forEach((link) => {
      link.setAttribute("href", cheatSheetHref());
    });
  }

  function mountLists() {
    const track = document.querySelector("[data-lab-track]");
    const grid = document.querySelector("[data-lab-grid]");
    renderTrack(track);
    wireFilters();
    syncFilterButtons();
    renderGrid(grid);
    paintCountTitle();
    syncCheatSheetLinks();
    if (track) window.ReanGitI18n?.apply?.(track);
  }

  const ready = fetch(DATA_URL, { credentials: "same-origin" })
    .then((res) => {
      if (!res.ok) throw new Error(`Could not load ${DATA_URL}`);
      return res.json();
    })
    .then((data) => {
      if (typeof data?.cheatSheetChapter === "string" && data.cheatSheetChapter) {
        cheatSheetChapter = data.cheatSheetChapter;
      }
      const list = Array.isArray(data?.labs) ? data.labs : [];
      labs = list.filter(
        (lab) => lab && typeof lab.id === "string" && VALID_LEVELS.has(lab.level)
      );
      syncCheatSheetLinks();
      return labs;
    });

  function getLabForChapter(chapterId) {
    if (!chapterId) return null;
    return labs.find((lab) => lab.chapter === chapterId) || null;
  }

  window.ReanGitCatalog = {
    ready,
    getLabs: () => labs,
    getLabForChapter,
    getCheatSheetChapter: () => cheatSheetChapter,
    cheatSheetHref,
    mountLists,
    setFilter,
  };

  window.addEventListener("rean-git:lab-progress", () => {
    mountLists();
  });

  window.ReanGitI18n?.onChange?.(paintCountTitle);
})();
