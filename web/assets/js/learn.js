/* Chapter & lab markdown reader — rean-git */
function t(key, vars) {
  return window.ReanGitI18n?.t?.(key, vars) ?? key;
}

function getLabMeta() {
  return window.ReanGitCatalog?.getLabs?.() || [];
}

function matchesHeading(line, key, fallback) {
  const localized = t(key);
  const patterns = [
    localized !== key ? new RegExp(localized) : null,
    fallback,
  ].filter(Boolean);
  return patterns.some((re) => re.test(line));
}

function isHowToUseHeading(line) {
  return matchesHeading(line, "chapterMatch.howToUse", /^## How to use this guide$/);
}

function isTocHeading(line) {
  return matchesHeading(line, "chapterMatch.toc", /^## Table of contents$/);
}

function chapterIdFromHeading(line) {
  if (isHowToUseHeading(line)) return "how-to-use";
  const numbered = /^## (\d+)\. /.exec(line);
  return numbered ? numbered[1] : null;
}

function chapterTitle(id, headingLine) {
  const title = t(`chapters.${id}`);
  if (title && title !== `chapters.${id}`) return title;
  return headingLine.replace(/^##\s+/, "").replace(/^\d+\.\s+/, "");
}

function getLabs() {
  return getLabMeta().map((lab) => ({
    id: lab.id,
    title: t(`labs.${lab.id}.title`),
    level: t(`levels.${lab.level}`),
    chapter: lab.chapter,
  }));
}

function getParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function getRouteId(queryKey) {
  return getParam(queryKey);
}

function chapterHref(id) {
  return `./learn.html?c=${encodeURIComponent(id)}`;
}

function labHref(id) {
  return `./lab.html?id=${encodeURIComponent(id)}`;
}

function splitGuide(markdown) {
  const lines = markdown.split("\n");
  const starts = [];

  lines.forEach((line, index) => {
    const id = chapterIdFromHeading(line);
    if (!id) return;
    starts.push({ index, id, title: chapterTitle(id, line) });
  });

  return starts.map((s, i) => {
    let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    if (s.id === "how-to-use") {
      const tocAt = lines.findIndex((line, idx) => idx > s.index && isTocHeading(line));
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    body = body.replace(/^##\s.+\n+/, "");
    return { id: s.id, title: s.title, body };
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
  const page = document.body.getAttribute("data-page");
  if (page === "lab") {
    return `rean-git:checklist:lab:${getParam("id") || ""}`;
  }
  if (page === "learn") {
    return `rean-git:checklist:learn:${getParam("c") || ""}`;
  }
  return `rean-git:checklist:${location.pathname}`;
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

function readLastChapter(chapters) {
  const saved = window.ReanGitUtil?.readStorageItem?.(window.ReanGitUtil.LAST_CHAPTER_KEY);
  if (!saved) return null;
  return chapters.some((c) => c.id === saved) ? saved : null;
}

function writeLastChapter(id) {
  window.ReanGitUtil?.writeStorageItem?.(window.ReanGitUtil.LAST_CHAPTER_KEY, id);
}

function readLastLab() {
  const saved = window.ReanGitUtil?.readStorageItem?.(window.ReanGitUtil.LAST_LAB_KEY);
  if (!saved) return null;
  return getLabMeta().some((l) => l.id === saved) ? saved : null;
}

function writeLastLab(id) {
  window.ReanGitUtil?.writeStorageItem?.(window.ReanGitUtil.LAST_LAB_KEY, id);
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

    const key = String(index);
    input.disabled = false;
    input.removeAttribute("disabled");

    if (Object.prototype.hasOwnProperty.call(saved, key)) {
      input.checked = Boolean(saved[key]);
    }

    input.addEventListener("change", () => {
      const next = readChecklistState();
      next[key] = input.checked;
      writeChecklistState(next);
      item?.classList.toggle("is-checked", input.checked);
      syncLabChecklistProgress();
      syncChapterChecklistProgress(root);
    });

    item?.classList.toggle("is-checked", input.checked);
  });

  syncLabChecklistProgress();
  syncChapterChecklistProgress(root);
}

function paintChecklistProgress(root, checked, total) {
  if (!root || total < 1) return;
  let meter = root.querySelector("[data-checklist-progress]");
  if (!meter) {
    meter = document.createElement("p");
    meter.className = "checklist-progress";
    meter.setAttribute("data-checklist-progress", "");
    root.insertBefore(meter, root.firstChild);
  }
  meter.textContent = t("learn.checklistProgress", {
    checked: String(checked),
    total: String(total),
  });
  meter.hidden = false;
}

function syncChapterChecklistProgress(root) {
  if (document.body.getAttribute("data-page") !== "learn") return;
  const chapterId = getParam("c");
  if (!chapterId || !root) return;
  const boxes = root.querySelectorAll('input[type="checkbox"]');
  if (!boxes.length) return;
  const checked = [...boxes].filter((el) => el.checked).length;
  const total = boxes.length;
  paintChecklistProgress(root, checked, total);
  if (checked === total) {
    window.ReanGitUtil?.recordChapterComplete?.(chapterId, true);
    paintMarkDone(chapterId);
  }
}

function currentLabId() {
  if (document.body.getAttribute("data-page") !== "lab") return null;
  return getParam("id");
}

function syncLabChecklistProgress(labId) {
  const id = labId || currentLabId();
  if (!id || !window.ReanGitUtil?.recordLabChecklist) return;
  const boxes = document.querySelectorAll('[data-lab-body] input[type="checkbox"]');
  if (!boxes.length) return;
  const checked = [...boxes].filter((el) => el.checked).length;
  const total = boxes.length;
  window.ReanGitUtil.recordLabChecklist(id, checked, total);
}

function appendVerifyHint(target, labId) {
  if (!target || !labId) return;
  const wrap = document.createElement("aside");
  wrap.className = "lab-verify";
  wrap.innerHTML = `
    <p class="lab-verify-title">${escapeHtml(t("lab.verifyTitle"))}</p>
    <p>${escapeHtml(t("lab.verifyBody"))}</p>
    <pre><code>cd labs/${escapeHtml(labId)}
./verify.sh</code></pre>
  `;
  target.appendChild(wrap);
  enhanceCodeBlocks(wrap);
}

function labNavItem(lab) {
  const done = window.ReanGitUtil?.isLabComplete?.(lab.id);
  const doneBadge = done
    ? `<span class="side-done">${escapeHtml(t("ui.done"))}</span>`
    : "";
  return `<li${done ? ' class="is-complete"' : ""}><a href="${labHref(lab.id)}" data-lab-id="${lab.id}"${done ? ' class="is-complete"' : ""}>${doneBadge}${escapeHtml(lab.title)}<br><span class="side-level">${escapeHtml(lab.level)}</span></a></li>`;
}

function paintNavDone(link, done) {
  link.classList.toggle("is-complete", done);
  link.closest("li")?.classList.toggle("is-complete", done);
  let badge = link.querySelector(".side-done");
  if (done && !badge) {
    badge = document.createElement("span");
    badge.className = "side-done";
    badge.textContent = t("ui.done");
    link.prepend(badge);
  } else if (!done && badge) {
    badge.remove();
  }
}

function paintLabNavCompletion(navEl) {
  if (!navEl) return;
  navEl.querySelectorAll("a[data-lab-id]").forEach((link) => {
    paintNavDone(link, window.ReanGitUtil?.isLabComplete?.(link.dataset.labId));
  });
}

function paintChapterNavCompletion(navEl) {
  if (!navEl) return;
  navEl.querySelectorAll("a[data-chapter-id]").forEach((link) => {
    paintNavDone(link, window.ReanGitUtil?.isChapterComplete?.(link.dataset.chapterId));
  });
}

function paintRelatedChapter(lab) {
  const el = document.querySelector("[data-related-chapter]");
  if (!el) return;
  if (!lab?.chapter) {
    el.hidden = true;
    el.replaceChildren();
    return;
  }
  const title = t(`chapters.${lab.chapter}`);
  const label =
    title && title !== `chapters.${lab.chapter}`
      ? t("lab.relatedChapter", { title })
      : t("lab.relatedChapterFallback");
  el.hidden = false;
  el.innerHTML = `<a href="${chapterHref(lab.chapter)}">${escapeHtml(label)}</a>`;
}

function paintRelatedLab(chapterId) {
  const el = document.querySelector("[data-related-lab]");
  if (!el) return;
  const lab = window.ReanGitCatalog?.getLabForChapter?.(chapterId);
  if (!lab) {
    el.hidden = true;
    el.replaceChildren();
    return;
  }
  const title = t(`labs.${lab.id}.title`);
  const label =
    title && title !== `labs.${lab.id}.title`
      ? t("learn.relatedLab", { title })
      : t("learn.relatedLabFallback");
  el.hidden = false;
  el.innerHTML = `<a href="${labHref(lab.id)}" data-lab-id="${escapeHtml(lab.id)}">${escapeHtml(label)}</a>`;
}

function paintMarkDone(chapterId) {
  const btn = document.querySelector("[data-mark-done]");
  if (!btn) return;
  if (!chapterId) {
    btn.hidden = true;
    return;
  }
  const done = window.ReanGitUtil?.isChapterComplete?.(chapterId);
  btn.hidden = false;
  btn.setAttribute("aria-pressed", String(Boolean(done)));
  btn.textContent = done ? t("learn.markedDone") : t("learn.markDone");
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

const labMarkdownCache = new Map();
const labMarkdownPending = new Map();

async function fetchLabMarkdown(id) {
  if (labMarkdownCache.has(id)) return labMarkdownCache.get(id);
  if (labMarkdownPending.has(id)) return labMarkdownPending.get(id);

  const promise = loadLocalizedContent(`labs/${id}.md`)
    .then((md) => {
      labMarkdownCache.set(id, md);
      labMarkdownPending.delete(id);
      return md;
    })
    .catch((err) => {
      labMarkdownPending.delete(id);
      throw err;
    });

  labMarkdownPending.set(id, promise);
  return promise;
}

function prefetchLabMarkdown(id) {
  if (!id || labMarkdownCache.has(id)) return;
  fetchLabMarkdown(id).catch(() => {});
}

function prefetchAdjacentLabMarkdown(labIds, index) {
  if (index > 0) prefetchLabMarkdown(labIds[index - 1]);
  if (index + 1 < labIds.length) prefetchLabMarkdown(labIds[index + 1]);
}

function sanitizeMarkdownHtml(html) {
  if (!window.DOMPurify) return null;
  // Task-list checkboxes from GFM need <input type="checkbox">.
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ["input"],
    ADD_ATTR: ["checked", "disabled", "type"],
  });
}

function renderMarkdown(target, md) {
  if (!window.marked) {
    target.innerHTML = `<pre>${escapeHtml(md)}</pre>`;
    return;
  }

  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  const safe = sanitizeMarkdownHtml(marked.parse(md));
  if (safe == null) {
    target.innerHTML = `<pre>${escapeHtml(md)}</pre>`;
    return;
  }

  target.innerHTML = safe;
  enhanceCodeBlocks(target);
  enhanceCheckboxes(target);
}

function padNum(n) {
  return String(n).padStart(2, "0");
}

function escapeHtml(text) {
  return window.ReanGitUtil.escapeHtml(text);
}

function isTypingTarget(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("input, textarea, select, [contenteditable='true']"));
}

function searchModalOpen() {
  const modal = document.querySelector("[data-search-modal]");
  return Boolean(modal && !modal.hidden);
}

function shortcutsModalOpen() {
  return Boolean(window.ReanGitA11y?.shortcutsOpen?.());
}

function setupPagerKeys(getNeighbors, goTo, signal) {
  window.addEventListener(
    "keydown",
    (event) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (searchModalOpen() || shortcutsModalOpen()) return;

      const goingPrev = event.key === "ArrowLeft" || event.key === "k" || event.key === "K";
      const goingNext = event.key === "ArrowRight" || event.key === "j" || event.key === "J";
      if (!goingPrev && !goingNext) return;

      const { prev, next } = getNeighbors();
      const target = goingPrev ? prev : next;
      if (!target) return;
      event.preventDefault();
      goTo(target.id, { push: true, animate: true });
    },
    { signal }
  );
}

function setupSideSearch(navEl, signal) {
  const input = document.querySelector("[data-side-search]");
  const empty = document.querySelector("[data-side-search-empty]");
  if (!input || !navEl) return;

  const filter = () => {
    const query = input.value.trim().toLowerCase();
    let shown = 0;
    navEl.querySelectorAll(":scope > li").forEach((item) => {
      if (item.classList.contains("status")) return;
      const match = !query || (item.textContent || "").toLowerCase().includes(query);
      item.hidden = !match;
      if (match) shown += 1;
    });
    if (empty) empty.hidden = shown > 0;
  };

  input.addEventListener("input", filter, { signal });
  filter();
}

function setupSidebarToggle(signal) {
  const sidebar = document.querySelector("[data-sidebar]");
  const toggle = document.querySelector("[data-side-toggle]");
  const backdrop = document.querySelector("[data-backdrop]");
  if (!sidebar || !toggle) return { close: () => {} };

  const drawerQuery = window.matchMedia("(max-width: 900px)");
  let trap = null;

  const close = () => {
    sidebar.classList.remove("is-open");
    backdrop?.classList.remove("is-on");
    toggle.setAttribute("aria-expanded", "false");
    trap?.deactivate();
    trap = null;
  };

  const open = () => {
    sidebar.classList.add("is-open");
    backdrop?.classList.add("is-on");
    toggle.setAttribute("aria-expanded", "true");
    if (drawerQuery.matches && window.ReanGitA11y?.createFocusTrap) {
      trap = window.ReanGitA11y.createFocusTrap(sidebar);
      trap.activate();
    }
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
    const chapters = splitGuide(raw);
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
      paintMarkDone(chapter.id);
      paintRelatedLab(chapter.id);
      const relatedLab = window.ReanGitCatalog?.getLabForChapter?.(chapter.id);
      if (relatedLab?.id) prefetchLabMarkdown(relatedLab.id);
      window.ReanGitI18n?.syncSeo?.();
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

      if (hadChapter) {
        window.ReanGitA11y?.focusMain?.({
          message: t("a11y.chapterLoaded", { title: chapter.title }),
        });
      }

      if (shouldAnimate) {
        playChapterIn();
      } else {
        clearChapterMotion();
      }
    };

    navEl.innerHTML = chapters
      .map((c, i) => {
        const n = padNum(i + 1);
        const done = window.ReanGitUtil?.isChapterComplete?.(c.id);
        const doneBadge = done
          ? `<span class="side-done">${escapeHtml(t("ui.done"))}</span>`
          : "";
        return `<li${done ? ' class="is-complete"' : ""}><a href="${chapterHref(c.id)}" data-chapter-id="${c.id}"${done ? ' class="is-complete"' : ""}>${doneBadge}<small class="side-num">${n}</small>${escapeHtml(c.title)}</a></li>`;
      })
      .join("");

    setupSideSearch(navEl, signal);

    const goToChapter = (id, opts) => {
      if (!id) return;
      if (currentIndex >= 0) {
        const nextIndex = resolveIndex(id);
        if (nextIndex === currentIndex + 1) {
          window.ReanGitUtil?.recordChapterComplete?.(chapters[currentIndex].id);
        }
      }
      showChapter(id, opts);
    };

    window.addEventListener(
      "rean-git:chapter-progress",
      () => {
        paintChapterNavCompletion(navEl);
        if (currentIndex >= 0) paintMarkDone(chapters[currentIndex].id);
      },
      { signal }
    );

    const markDoneBtn = document.querySelector("[data-mark-done]");
    markDoneBtn?.addEventListener(
      "click",
      () => {
        const chapter = chapters[currentIndex];
        if (!chapter) return;
        const done = window.ReanGitUtil?.isChapterComplete?.(chapter.id);
        window.ReanGitUtil?.recordChapterComplete?.(chapter.id, !done);
      },
      { signal }
    );

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

    setupPagerKeys(
      () => ({
        prev: chapters[currentIndex - 1],
        next: chapters[currentIndex + 1],
      }),
      goToChapter,
      signal
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

  await window.ReanGitCatalog?.ready;
  if (signal?.aborted) return null;

  const labs = getLabs();
  if (!labs.length) {
    bodyEl.innerHTML = `<div class="error"><strong>${escapeHtml(t("lab.loadError"))}</strong><br>${escapeHtml(t("lab.serveHint"))}</div>`;
    return null;
  }
  const labIds = labs.map((lab) => lab.id);
  let currentIndex = -1;
  let transitionToken = 0;
  const paneEl = bodyEl.closest(".content-pane");
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

  const loadLabMarkdown = (id) => fetchLabMarkdown(id);

  const wireLabPrefetch = (root) => {
    if (!root) return;
    root.addEventListener(
      "pointerenter",
      (event) => {
        const link = event.target.closest("a[data-lab-id]");
        if (!link) return;
        prefetchLabMarkdown(link.dataset.labId);
      },
      { signal, capture: true }
    );
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
    paintRelatedChapter(lab);
    window.ReanGitI18n?.syncSeo?.();
    prefetchAdjacentLabMarkdown(labIds, index);

    try {
      const md = await loadLabMarkdown(lab.id);
      renderMarkdown(bodyEl, md);
      bodyEl.querySelector("h1")?.remove();
      appendVerifyHint(bodyEl, lab.id);
      syncLabChecklistProgress(lab.id);
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

    if (hadLab) {
      window.ReanGitA11y?.focusMain?.({
        message: t("a11y.labLoaded", { title: lab.title }),
      });
    }

    if (shouldAnimate) {
      playLabIn();
    } else {
      clearLabMotion();
    }
  };

  navEl.innerHTML = labs.map((l) => labNavItem(l)).join("");

  setupSideSearch(navEl, signal);
  wireLabPrefetch(navEl);
  wireLabPrefetch(pagerEl);

  window.addEventListener(
    "rean-git:lab-progress",
    () => {
      paintLabNavCompletion(navEl);
    },
    { signal }
  );

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

  setupPagerKeys(
    () => ({
      prev: labs[currentIndex - 1],
      next: labs[currentIndex + 1],
    }),
    goToLab,
    signal
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
    await window.ReanGitCatalog?.ready;
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
