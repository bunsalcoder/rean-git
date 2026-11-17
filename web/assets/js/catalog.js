(() => {
  const DATA_URL = new URL("./data/labs.json", location.href).href;
  const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);
  const VALID_STAGES = new Set(["foundations", "collaboration", "power", "professional", "mastery"]);

  let labs = [];
  let labIdAliases = {};
  let cheatSheetChapter = "26";
  let filterStage = "all";
  let filterLevel = "all";

  const escapeHtml = (text) => window.ReanGitUtil.escapeHtml(text);

  function resolveLabId(id) {
    if (!id) return id;
    let current = id;
    const seen = new Set();
    while (labIdAliases[current] && !seen.has(current)) {
      seen.add(current);
      current = labIdAliases[current];
    }
    return current;
  }

  function labNum(_lab, index) {
    return String(index + 1).padStart(2, "0");
  }

  function labHref(id) {
    return `./lab.html?id=${encodeURIComponent(id)}`;
  }

  function labMinutesForLevel(level) {
    if (level === "beginner") return 15;
    if (level === "intermediate") return 25;
    if (level === "advanced") return 40;
    return 20;
  }

  const STAGES = [
    { id: "foundations", max: 5 },
    { id: "collaboration", max: 13 },
    { id: "power", max: 20 },
    { id: "professional", max: 24 },
    { id: "mastery", max: Infinity },
  ];

  function stageIdForLab(lab) {
    const n = Number(lab && lab.chapter);
    const stage = STAGES.find((item) => Number.isFinite(n) && n <= item.max);
    return stage ? stage.id : "mastery";
  }

  function stageHeading(stageId, tag) {
    return `<${tag} class="lab-stage">
      <p class="lab-stage-kicker" data-i18n="stages.kicker"></p>
      <p class="lab-stage-title" data-i18n="stages.${stageId}"></p>
      <p class="lab-stage-range" data-i18n="stages.${stageId}Range"></p>
    </${tag}>`;
  }

  function visibleLabs() {
    if (filterStage !== "all") {
      return labs.filter((lab) => stageIdForLab(lab) === filterStage);
    }
    if (filterLevel !== "all") return labs.filter((lab) => lab.level === filterLevel);
    return labs;
  }

  function renderTrack(root) {
    if (!root) return;
    const nextLab = labs.find((lab) => !window.ReanGitUtil?.isLabComplete?.(lab.id));
    root.setAttribute("aria-busy", "false");
    let lastStage = "";
    root.innerHTML = labs
      .map((lab, index) => {
        const id = escapeHtml(lab.id);
        const done = window.ReanGitUtil?.isLabComplete?.(lab.id);
        const isNext = Boolean(nextLab && nextLab.id === lab.id && !done);
        const classes = [done ? "is-complete" : "", isNext ? "is-next" : ""]
          .filter(Boolean)
          .join(" ");
        const minutes = labMinutesForLevel(lab.level);
        const githubBadge = lab.verifyManual
          ? `<span class="lab-github" data-i18n="lab.githubRequiredBadge"></span>`
          : "";
        const stage = stageIdForLab(lab);
        const heading = stage === lastStage ? "" : stageHeading(stage, "li");
        lastStage = stage;
        return `${heading}<li${classes ? ` class="${classes}"` : ""}>
          <a href="${labHref(lab.id)}" data-lab-id="${id}">
            <span class="lab-num">${escapeHtml(labNum(lab, index))}</span>
            <h3 class="lab-title" data-i18n="labs.${id}.title"></h3>
            <p class="lab-desc" data-i18n="labs.${id}.teaser"></p>
            <span class="lab-level" data-i18n="levels.${escapeHtml(lab.level)}"></span>
            <span class="lab-time">${escapeHtml(
              window.ReanGitI18n?.t?.("lab.estimatedTime", { minutes: String(minutes) }) ||
                `~${minutes} min`
            )}</span>
            ${githubBadge}
            ${isNext ? `<span class="lab-next" data-i18n="home.startHere"></span>` : ""}
            ${done ? `<span class="lab-done" data-i18n="ui.done"></span>` : ""}
          </a>
        </li>`;
      })
      .join("");
  }

  function renderGrid(root) {
    if (!root) return;
    const list = visibleLabs();
    root.setAttribute("aria-busy", "false");
    if (!list.length) {
      const empty = window.ReanGitI18n?.t?.("labsPage.filterEmpty") || "No labs at this level.";
      root.innerHTML = `<p class="lab-grid-empty" role="status">${escapeHtml(empty)}</p>`;
      window.ReanGitI18n?.apply?.(root);
      return;
    }
    let lastStage = "";
    const showStageHeadings = filterStage === "all";
    root.innerHTML = list
      .map((lab) => {
        const id = escapeHtml(lab.id);
        const index = labs.indexOf(lab);
        const done = window.ReanGitUtil?.isLabComplete?.(lab.id);
        const minutes = labMinutesForLevel(lab.level);
        const githubBadge = lab.verifyManual
          ? `<span class="lab-github" data-i18n="lab.githubRequiredBadge"></span>`
          : "";
        const stage = stageIdForLab(lab);
        const heading = !showStageHeadings || stage === lastStage ? "" : stageHeading(stage, "div");
        lastStage = stage;
        return `${heading}<a href="${labHref(lab.id)}"${done ? ' class="is-complete"' : ""} data-lab-id="${id}">
          <span class="num">${escapeHtml(labNum(lab, index))}</span>
          <div>
            <h3 data-i18n="labs.${id}.title"></h3>
            <p data-i18n="labs.${id}.summary"></p>
            <span class="lab-level" data-i18n="levels.${escapeHtml(lab.level)}"></span>
            <span class="lab-time">${escapeHtml(
              window.ReanGitI18n?.t?.("lab.estimatedTime", { minutes: String(minutes) }) ||
                `~${minutes} min`
            )}</span>
            ${githubBadge}
            ${done ? `<span class="lab-done" data-i18n="ui.done"></span>` : ""}
          </div>
        </a>`;
      })
      .join("");
    window.ReanGitI18n?.apply?.(root);
  }

  function syncFilterButtons() {
    const active = filterStage !== "all" ? filterStage : filterLevel === "all" ? "all" : "";
    document.querySelectorAll("[data-lab-filter]").forEach((btn) => {
      const pressed = btn.getAttribute("data-lab-filter") === active;
      btn.setAttribute("aria-pressed", String(pressed));
      btn.classList.toggle("is-active", pressed);
    });
  }

  function normalizeLevel(level) {
    if (level === "all" || VALID_LEVELS.has(level)) return level;
    return "all";
  }

  function normalizeStage(stage) {
    if (stage === "all" || VALID_STAGES.has(stage)) return stage;
    return "all";
  }

  function queryParam(name) {
    if (!document.querySelector("[data-lab-grid]")) return null;
    const value = new URLSearchParams(location.search).get(name);
    if (value == null || value === "") return null;
    return value;
  }

  function syncFilterUrl() {
    if (!document.querySelector("[data-lab-grid]")) return;
    const url = new URL(location.href);
    url.searchParams.delete("stage");
    url.searchParams.delete("level");
    if (filterStage !== "all") url.searchParams.set("stage", filterStage);
    else if (filterLevel !== "all") url.searchParams.set("level", filterLevel);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${location.pathname}${location.search}${location.hash}`;
    if (next !== current) history.replaceState(history.state, "", next);
  }

  function paintFilterSummary({ announce = false } = {}) {
    const el = document.querySelector("[data-lab-filter-summary]");
    if (!el) return;
    const count = String(visibleLabs().length);
    const i18n = window.ReanGitI18n;
    let message;
    let label = "";
    if (filterStage !== "all") label = i18n?.t?.(`stages.${filterStage}`) || filterStage;
    else if (filterLevel !== "all") label = i18n?.t?.(`levels.${filterLevel}`) || filterLevel;
    if (!label) {
      message = i18n?.t?.("labsPage.filterSummaryAll", { count }) || `${count} labs`;
    } else {
      message = i18n?.t?.("labsPage.filterSummary", { count, label }) || `${count} labs · ${label}`;
    }
    el.hidden = false;
    el.textContent = message;
    if (announce) window.ReanGitA11y?.announce?.(message);
  }

  function setFilter(stage, { updateUrl = true, announce = false } = {}) {
    filterStage = normalizeStage(stage);
    filterLevel = "all";
    syncFilterButtons();
    renderGrid(document.querySelector("[data-lab-grid]"));
    paintFilterSummary({ announce });
    if (updateUrl) syncFilterUrl();
  }

  function wireFilters() {
    const bar = document.querySelector("[data-lab-filters]");
    if (!bar) return;
    // Soft nav replaces the filter bar DOM — bind per element, not once globally.
    if (bar.dataset.filtersBound === "1") return;
    bar.dataset.filtersBound = "1";
    bar.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-lab-filter]");
      if (!btn) return;
      setFilter(btn.getAttribute("data-lab-filter"), { announce: true });
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
    const stageFromUrl = queryParam("stage");
    const levelFromUrl = queryParam("level");
    if (stageFromUrl) {
      filterStage = normalizeStage(stageFromUrl);
      filterLevel = "all";
    } else if (levelFromUrl) {
      filterStage = "all";
      filterLevel = normalizeLevel(levelFromUrl);
    }
    renderTrack(track);
    wireFilters();
    syncFilterButtons();
    renderGrid(grid);
    paintFilterSummary();
    if (grid) syncFilterUrl();
    document.querySelector("[data-labs-loading]")?.setAttribute("hidden", "");
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
      labIdAliases =
        data?.labIdAliases && typeof data.labIdAliases === "object" && !Array.isArray(data.labIdAliases)
          ? data.labIdAliases
          : {};
      const list = Array.isArray(data?.labs) ? data.labs : [];
      labs = list
        .filter((lab) => lab && typeof lab.id === "string" && VALID_LEVELS.has(lab.level))
        .sort((a, b) => {
          const chapterDelta = Number(a.chapter) - Number(b.chapter);
          if (chapterDelta) return chapterDelta;
          return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        });
      window.ReanGitUtil?.migrateLabIds?.(resolveLabId);
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
    resolveLabId,
    getCheatSheetChapter: () => cheatSheetChapter,
    cheatSheetHref,
    mountLists,
    setFilter,
  };

  window.addEventListener("rean-git:lab-progress", () => {
    mountLists();
  });

  window.ReanGitI18n?.onChange?.(() => {
    paintCountTitle();
    paintFilterSummary();
  });
})();
