/* Chapter & lab markdown reader — rean-git */
const CHAPTER_IDS = [
  "how-to-use",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
];

const LAB_META = [
  { id: "01-first-repo", level: "beginner" },
  { id: "02-branch-merge", level: "beginner" },
  { id: "03-conflict", level: "intermediate" },
  { id: "04-rebase", level: "intermediate" },
  { id: "05-undo", level: "intermediate" },
  { id: "06-remote-pr", level: "intermediate" },
  { id: "07-team-workflow", level: "advanced" },
  { id: "08-stash", level: "advanced" },
  { id: "09-tags", level: "advanced" },
  { id: "10-cherry-pick", level: "advanced" },
  { id: "11-interactive-rebase", level: "advanced" },
  { id: "12-bisect", level: "advanced" },
  { id: "13-internals", level: "advanced" },
  { id: "14-worktrees", level: "advanced" },
  { id: "15-inspect-history", level: "advanced" },
  { id: "16-hooks", level: "advanced" },
];

function t(key, vars) {
  return window.ReanGitI18n?.t?.(key, vars) ?? key;
}

function getChapters() {
  const howToUse = t("chapterMatch.howToUse");
  const howToPatterns = [
    howToUse !== "chapterMatch.howToUse" ? new RegExp(howToUse, "m") : null,
    /^## How to use this guide$/m,
  ].filter(Boolean);

  return CHAPTER_IDS.map((id) => {
    const title = t(`chapters.${id}`);
    if (id === "how-to-use") {
      return {
        id,
        title,
        matchLine: (line) => howToPatterns.some((re) => re.test(line)),
      };
    }
    const num = id;
    const match = new RegExp(`^## ${num}\\. `, "m");
    return {
      id,
      title,
      matchLine: (line) => match.test(line),
    };
  });
}

function getLabs() {
  return LAB_META.map((lab) => ({
    id: lab.id,
    title: t(`labs.${lab.id}.title`),
    level: t(`levels.${lab.level}`),
  }));
}

function tocMatchLine(line) {
  const localized = t("chapterMatch.toc");
  const patterns = [
    localized !== "chapterMatch.toc" ? new RegExp(localized, "m") : null,
    /^## Table of contents$/m,
  ].filter(Boolean);
  return patterns.some((re) => re.test(line));
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function getRouteId(queryKey) {
  const hash = location.hash.replace(/^#/, "").trim();
  if (hash) return decodeURIComponent(hash);
  return getParam(queryKey);
}

function chapterHref(id) {
  return `./learn.html?c=${encodeURIComponent(id)}`;
}

function labHref(id) {
  return `./lab.html?id=${encodeURIComponent(id)}`;
}

function splitGuide(markdown, chapters) {
  const lines = markdown.split("\n");
  const starts = [];

  lines.forEach((line, index) => {
    chapters.forEach((ch, ci) => {
      if (ch.matchLine(line)) {
        starts.push({ ci, index, title: ch.title, id: ch.id });
      }
    });
  });

  starts.sort((a, b) => a.index - b.index);

  return starts.map((s, i) => {
    let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    if (chapters[s.ci].id === "how-to-use") {
      const tocAt = lines.findIndex((line, idx) => idx > s.index && tocMatchLine(line));
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    body = body.replace(/^##\s.+\n+/, "");
    return { ...chapters[s.ci], body };
  });
}

function enhanceCodeBlocks(root) {
  root.querySelectorAll("pre").forEach((pre) => {
    if (pre.closest(".code-block")) return;

    const wrap = document.createElement("div");
    wrap.className = "code-block";
    pre.parentNode.insertBefore(wrap, pre);
    wrap.appendChild(pre);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = t("ui.copy");
    btn.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = t("ui.copied");
        setTimeout(() => {
          btn.textContent = t("ui.copy");
        }, 1400);
      } catch {
        btn.textContent = t("ui.failed");
      }
    });
    wrap.appendChild(btn);
  });
}

function checklistStorageKey() {
  const url = new URL(location.href);
  return `rean-git:checklist:${url.pathname}${url.search}`;
}

function readChecklistState() {
  try {
    const raw = localStorage.getItem(checklistStorageKey());
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeChecklistState(state) {
  try {
    localStorage.setItem(checklistStorageKey(), JSON.stringify(state));
  } catch {
    /* private mode / quota — ignore */
  }
}

const LAST_CHAPTER_KEY = "rean-git:last-chapter";
const LAST_LAB_KEY = "rean-git:last-lab";

function readStorageItem(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorageItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* private mode / quota — ignore */
  }
}

function readLastChapter(chapters) {
  const saved = readStorageItem(LAST_CHAPTER_KEY);
  if (!saved) return null;
  return chapters.some((c) => c.id === saved) ? saved : null;
}

function writeLastChapter(id) {
  writeStorageItem(LAST_CHAPTER_KEY, id);
}

function readLastLab() {
  const saved = readStorageItem(LAST_LAB_KEY);
  if (!saved) return null;
  return LAB_META.some((l) => l.id === saved) ? saved : null;
}

function writeLastLab(id) {
  writeStorageItem(LAST_LAB_KEY, id);
}

function resolveRouteOrResume(queryKey, savedId, fallbackId) {
  const routed = getRouteId(queryKey);
  if (routed) return { id: routed, fromRoute: true };
  if (savedId) return { id: savedId, fromRoute: false };
  return { id: fallbackId, fromRoute: false };
}

function enhanceCheckboxes(root) {
  const boxes = root.querySelectorAll('input[type="checkbox"]');
  if (!boxes.length) return;

  const saved = readChecklistState();

  boxes.forEach((input, index) => {
    const item = input.closest("li") || input.parentElement;
    if (item) {
      item.classList.add("task-list-item");
      item.parentElement?.classList.add("contains-task-list");
    }

    const label = (item?.textContent || "").replace(/\s+/g, " ").trim() || String(index);
    input.disabled = false;
    input.removeAttribute("disabled");

    if (Object.prototype.hasOwnProperty.call(saved, label)) {
      input.checked = Boolean(saved[label]);
    }

    input.addEventListener("change", () => {
      const next = readChecklistState();
      next[label] = input.checked;
      writeChecklistState(next);
      item?.classList.toggle("is-checked", input.checked);
    });

    item?.classList.toggle("is-checked", input.checked);
  });
}

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  return res.text();
}

async function loadLocalizedContent(relativePath) {
  const locale = window.ReanGitI18n?.getLocale?.() || "en";
  const candidates =
    locale === "en"
      ? [`./content/en/${relativePath}`]
      : [`./content/${locale}/${relativePath}`, `./content/en/${relativePath}`];

  let lastError = null;
  for (const url of candidates) {
    try {
      return await loadText(url);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error(`Could not load ${relativePath}`);
}

function renderMarkdown(target, md) {
  if (window.marked) {
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    target.innerHTML = marked.parse(md);
  } else {
    target.innerHTML = `<pre>${md.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]))}</pre>`;
  }
  enhanceCodeBlocks(target);
  enhanceCheckboxes(target);
}

function padNum(n) {
  return String(n).padStart(2, "0");
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function setupSidebarToggle(signal) {
  const sidebar = document.querySelector("[data-sidebar]");
  const toggle = document.querySelector("[data-side-toggle]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!sidebar || !toggle) return { close: () => {} };

  const close = () => {
    sidebar.classList.remove("is-open");
    backdrop?.classList.remove("is-on");
    toggle.setAttribute("aria-expanded", "false");
  };

  const open = () => {
    sidebar.classList.add("is-open");
    backdrop?.classList.add("is-on");
    toggle.setAttribute("aria-expanded", "true");
  };

  toggle.addEventListener(
    "click",
    () => {
      if (sidebar.classList.contains("is-open")) close();
      else open();
    },
    { signal }
  );
  backdrop?.addEventListener("click", close, { signal });
  sidebar.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("a")) close();
    },
    { signal }
  );
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Escape") close();
    },
    { signal }
  );
  window.addEventListener(
    "resize",
    () => {
      if (window.matchMedia("(min-width: 901px)").matches) close();
    },
    { signal }
  );
  signal?.addEventListener("abort", close);

  return { close };
}

async function initLearnPage(signal, { animate = true } = {}) {
  const navEl = document.querySelector("[data-chapter-nav]");
  const bodyEl = document.querySelector("[data-chapter-body]");
  const titleEl = document.querySelector("[data-chapter-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!navEl || !bodyEl) return null;

  setupSidebarToggle(signal);

  try {
    const raw = await loadLocalizedContent("guide.md");
    if (signal?.aborted) return null;
    const chapterDefs = getChapters();
    const chapters = splitGuide(raw, chapterDefs);
    if (!chapters.length) throw new Error("No chapters found");

    let currentIndex = -1;
    let transitionToken = 0;
    const paneEl = bodyEl.closest(".content-pane");
    const CHAPTER_OUT_MS = 380;
    const prefersReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resolveIndex = (id) => {
      let index = chapters.findIndex((c) => c.id === id);
      if (index < 0) index = 0;
      return index;
    };

    const setActiveNav = (id) => {
      navEl.querySelectorAll("a[data-chapter-id]").forEach((a) => {
        a.classList.toggle("is-active", a.dataset.chapterId === id);
      });
    };

    const renderPager = (index) => {
      if (!pagerEl) return;
      const prev = chapters[index - 1];
      const next = chapters[index + 1];
      pagerEl.innerHTML = `
        ${prev ? `<a class="pager-prev" href="${chapterHref(prev.id)}" data-chapter-id="${prev.id}"><span>${escapeHtml(t("learn.previous"))}</span>${escapeHtml(prev.title)}</a>` : ""}
        ${next ? `<a class="pager-next" href="${chapterHref(next.id)}" data-chapter-id="${next.id}"><span>${escapeHtml(t("learn.next"))}</span>${escapeHtml(next.title)}</a>` : ""}
      `;
    };

    const clearChapterMotion = () => {
      bodyEl.classList.remove("is-leaving", "is-switching");
      paneEl?.classList.remove("is-chapter-leaving", "is-chapter-switching");
      document.body.classList.remove("is-leaving", "is-switching");
    };

    const playChapterIn = () => {
      clearChapterMotion();
      void bodyEl.offsetWidth;
      bodyEl.classList.add("is-switching");
      paneEl?.classList.add("is-chapter-switching");
      document.body.classList.add("is-switching");
    };

    const applyChapter = (chapter, index) => {
      setActiveNav(chapter.id);
      writeLastChapter(chapter.id);
      if (titleEl) titleEl.textContent = chapter.title;
      if (progressEl) {
        progressEl.textContent = t("ui.progress", {
          current: index + 1,
          total: chapters.length,
        });
      }
      document.title = `${chapter.title} — rean-git`;
      renderMarkdown(bodyEl, chapter.body);
      renderPager(index);
    };

    const showChapter = async (id, { push = false, animate = true } = {}) => {
      const index = resolveIndex(id);
      const chapter = chapters[index];

      if (index === currentIndex) {
        if (push) history.replaceState({ c: chapter.id }, "", chapterHref(chapter.id));
        return;
      }

      const token = ++transitionToken;
      const hadChapter = currentIndex >= 0;
      currentIndex = index;

      if (push) {
        history.pushState({ c: chapter.id }, "", chapterHref(chapter.id));
      }

      window.scrollTo({ top: 0, behavior: "smooth" });

      const shouldAnimate = animate && !prefersReducedMotion();

      if (shouldAnimate && hadChapter) {
        clearChapterMotion();
        bodyEl.classList.add("is-leaving");
        paneEl?.classList.add("is-chapter-leaving");
        document.body.classList.add("is-leaving");
        await new Promise((resolve) => setTimeout(resolve, CHAPTER_OUT_MS));
        if (token !== transitionToken) return;
      }

      applyChapter(chapter, index);

      if (shouldAnimate) {
        playChapterIn();
      } else {
        clearChapterMotion();
      }
    };

    navEl.innerHTML = chapters
      .map((c, i) => {
        const n = padNum(i + 1);
        return `<li><a href="${chapterHref(c.id)}" data-chapter-id="${c.id}"><small style="display:block;opacity:.55;font-size:.72rem;font-weight:700;letter-spacing:.06em">${n}</small>${escapeHtml(c.title)}</a></li>`;
      })
      .join("");

    const goToChapter = (id, opts) => {
      if (!id) return;
      showChapter(id, opts);
    };

    navEl.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a[data-chapter-id]");
        if (!link) return;
        event.preventDefault();
        goToChapter(link.dataset.chapterId, { push: true, animate: true });
      },
      { signal }
    );

    pagerEl?.addEventListener(
      "click",
      (event) => {
        const link = event.target.closest("a[data-chapter-id]");
        if (!link) return;
        event.preventDefault();
        goToChapter(link.dataset.chapterId, { push: true, animate: true });
      },
      { signal }
    );

    window.addEventListener(
      "popstate",
      () => {
        goToChapter(getRouteId("c") || chapters[0].id, { push: false, animate: true });
      },
      { signal }
    );

    const start = resolveRouteOrResume("c", readLastChapter(chapters), chapters[0].id);
    showChapter(start.id, { push: false, animate });
    if (!start.fromRoute) {
      history.replaceState({ c: start.id }, "", chapterHref(start.id));
    }

    return {
      goTo(id, opts) {
        const target = id || readLastChapter(chapters) || chapters[0].id;
        goToChapter(target, opts);
        if (!id) history.replaceState({ c: target }, "", chapterHref(target));
      },
    };
  } catch (err) {
    if (signal?.aborted) return null;
    bodyEl.innerHTML = `<div class="error"><strong>${escapeHtml(t("learn.loadError"))}</strong><br>${escapeHtml(err.message)}<br><br>${escapeHtml(t("learn.serveHint"))}</div>`;
    return null;
  }
}

async function initLabPage(signal, { animate = true } = {}) {
  const navEl = document.querySelector("[data-lab-nav]");
  const bodyEl = document.querySelector("[data-lab-body]");
  const titleEl = document.querySelector("[data-lab-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!navEl || !bodyEl) return null;

  setupSidebarToggle(signal);

  const labs = getLabs();
  let currentIndex = -1;
  let transitionToken = 0;
  const paneEl = bodyEl.closest(".content-pane");
  const cache = new Map();
  const LAB_OUT_MS = 380;
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resolveIndex = (id) => {
    let index = labs.findIndex((l) => l.id === id);
    if (index < 0) index = 0;
    return index;
  };

  const setActiveNav = (id) => {
    navEl.querySelectorAll("a[data-lab-id]").forEach((a) => {
      a.classList.toggle("is-active", a.dataset.labId === id);
    });
  };

  const renderPager = (index) => {
    if (!pagerEl) return;
    const prev = labs[index - 1];
    const next = labs[index + 1];
    pagerEl.innerHTML = `
      ${prev ? `<a class="pager-prev" href="${labHref(prev.id)}" data-lab-id="${prev.id}"><span>${escapeHtml(t("lab.previous"))}</span>${escapeHtml(prev.title)}</a>` : ""}
      ${next ? `<a class="pager-next" href="${labHref(next.id)}" data-lab-id="${next.id}"><span>${escapeHtml(t("lab.next"))}</span>${escapeHtml(next.title)}</a>` : ""}
    `;
  };

  const clearLabMotion = () => {
    bodyEl.classList.remove("is-leaving", "is-switching");
    paneEl?.classList.remove("is-chapter-leaving", "is-chapter-switching");
    document.body.classList.remove("is-leaving", "is-switching");
  };

  const playLabIn = () => {
    clearLabMotion();
    void bodyEl.offsetWidth;
    bodyEl.classList.add("is-switching");
    paneEl?.classList.add("is-chapter-switching");
    document.body.classList.add("is-switching");
  };

  const loadLabMarkdown = async (id) => {
    if (cache.has(id)) return cache.get(id);
    const md = await loadLocalizedContent(`labs/${id}.md`);
    cache.set(id, md);
    return md;
  };

  const applyLab = async (lab, index) => {
    setActiveNav(lab.id);
    writeLastLab(lab.id);
    if (titleEl) titleEl.textContent = lab.title;
    if (progressEl) {
      progressEl.textContent = t("ui.progressLab", {
        current: index + 1,
        total: labs.length,
        level: lab.level,
      });
    }
    document.title = `${lab.title} — rean-git`;
    renderPager(index);

    try {
      const md = await loadLabMarkdown(lab.id);
      renderMarkdown(bodyEl, md);
      bodyEl.querySelector("h1")?.remove();
    } catch (err) {
      bodyEl.innerHTML = `<div class="error"><strong>${escapeHtml(t("lab.loadError"))}</strong><br>${escapeHtml(err.message)}<br><br>${escapeHtml(t("lab.serveHint"))}</div>`;
    }
  };

  const showLab = async (id, { push = false, animate = true } = {}) => {
    const index = resolveIndex(id);
    const lab = labs[index];

    if (index === currentIndex) {
      if (push) history.replaceState({ id: lab.id }, "", labHref(lab.id));
      return;
    }

    const token = ++transitionToken;
    const hadLab = currentIndex >= 0;
    currentIndex = index;

    if (push) {
      history.pushState({ id: lab.id }, "", labHref(lab.id));
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const shouldAnimate = animate && !prefersReducedMotion();

    if (shouldAnimate && hadLab) {
      clearLabMotion();
      bodyEl.classList.add("is-leaving");
      paneEl?.classList.add("is-chapter-leaving");
      document.body.classList.add("is-leaving");
      await new Promise((resolve) => setTimeout(resolve, LAB_OUT_MS));
      if (token !== transitionToken) return;
    }

    await applyLab(lab, index);
    if (token !== transitionToken) return;

    if (shouldAnimate) {
      playLabIn();
    } else {
      clearLabMotion();
    }
  };

  navEl.innerHTML = labs
    .map(
      (l) =>
        `<li><a href="${labHref(l.id)}" data-lab-id="${l.id}">${escapeHtml(l.title)}<br><span style="opacity:.6;font-weight:500;font-size:.8rem">${escapeHtml(l.level)}</span></a></li>`
    )
    .join("");

  const goToLab = (id, opts) => {
    if (!id) return;
    showLab(id, opts);
  };

  navEl.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[data-lab-id]");
      if (!link) return;
      event.preventDefault();
      goToLab(link.dataset.labId, { push: true, animate: true });
    },
    { signal }
  );

  pagerEl?.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[data-lab-id]");
      if (!link) return;
      event.preventDefault();
      goToLab(link.dataset.labId, { push: true, animate: true });
    },
    { signal }
  );

  window.addEventListener(
    "popstate",
    () => {
      goToLab(getRouteId("id") || labs[0].id, { push: false, animate: true });
    },
    { signal }
  );

  const start = resolveRouteOrResume("id", readLastLab(), labs[0].id);
  goToLab(start.id, { push: false, animate });
  if (!start.fromRoute) {
    history.replaceState({ id: start.id }, "", labHref(start.id));
  }

  return {
    goTo(id, opts) {
      const target = id || readLastLab() || labs[0].id;
      goToLab(target, opts);
      if (!id) history.replaceState({ id: target }, "", labHref(target));
    },
  };
}
(() => {
  let abortController = null;
  let learnApi = null;
  let labApi = null;

  const unmount = () => {
    abortController?.abort();
    abortController = null;
    learnApi = null;
    labApi = null;
  };

  const mount = async ({ animate = true } = {}) => {
    unmount();
    const controller = new AbortController();
    abortController = controller;
    await window.ReanGitI18n?.ready;
    if (controller.signal.aborted || abortController !== controller) return;

    if (document.body.dataset.page === "learn") {
      learnApi = await initLearnPage(controller.signal, { animate });
    } else if (document.body.dataset.page === "lab") {
      labApi = await initLabPage(controller.signal, { animate });
    }
  };

  window.ReanGitContent = {
    mount,
    unmount,
    goLearn(id, opts) {
      learnApi?.goTo(id, opts);
    },
    goLab(id, opts) {
      labApi?.goTo(id, opts);
    },
  };

  const start = () => {
    if (window.__reanGitDeferContentMount) return;
    mount();
  };

  window.ReanGitI18n?.onChange?.(() => {
    const page = document.body.dataset.page;
    if (page === "learn" || page === "lab") {
      mount({ animate: false });
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
