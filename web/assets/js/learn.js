/* Chapter & lab markdown reader — rean-git */
const CHAPTERS = [
  { id: "how-to-use", title: "How to use this guide", match: /^## How to use this guide$/m },
  { id: "1", title: "What problem does Git solve?", match: /^## 1\. /m },
  { id: "2", title: "Core mental model", match: /^## 2\. /m },
  { id: "3", title: "Install & first config", match: /^## 3\. /m },
  { id: "4", title: "Your first repository", match: /^## 4\. /m },
  { id: "5", title: "Staging, commits, and history", match: /^## 5\. /m },
  { id: "6", title: "Branching", match: /^## 6\. /m },
  { id: "7", title: "Merging", match: /^## 7\. /m },
  { id: "8", title: "Conflicts", match: /^## 8\. /m },
  { id: "9", title: "Rebase (carefully)", match: /^## 9\. /m },
  { id: "10", title: "Undoing mistakes", match: /^## 10\. /m },
  { id: "11", title: "Remotes & GitHub", match: /^## 11\. /m },
  { id: "12", title: "Pull requests", match: /^## 12\. /m },
  { id: "13", title: "Team workflows", match: /^## 13\. /m },
  { id: "14", title: "Cheat sheet", match: /^## 14\. /m },
  { id: "15", title: "Learning path checklist", match: /^## 15\. /m },
];

const LABS = [
  { id: "01-first-repo", title: "First repo", level: "Beginner" },
  { id: "02-branch-merge", title: "Branch & merge", level: "Beginner" },
  { id: "03-conflict", title: "Conflict", level: "Intermediate" },
  { id: "04-rebase", title: "Rebase", level: "Intermediate" },
  { id: "05-undo", title: "Undo", level: "Intermediate" },
  { id: "06-remote-pr", title: "Remote & PR", level: "Intermediate" },
  { id: "07-team-workflow", title: "Team workflow", level: "Advanced" },
];

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

function splitGuide(markdown) {
  const lines = markdown.split("\n");
  const starts = [];

  lines.forEach((line, index) => {
    CHAPTERS.forEach((ch, ci) => {
      if (ch.match.test(line)) {
        starts.push({ ci, index, title: ch.title, id: ch.id });
      }
    });
  });

  starts.sort((a, b) => a.index - b.index);

  return starts.map((s, i) => {
    let end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
    if (CHAPTERS[s.ci].id === "how-to-use") {
      const tocAt = lines.findIndex(
        (line, idx) => idx > s.index && /^## Table of contents$/m.test(line)
      );
      if (tocAt !== -1) end = tocAt;
    }
    let body = lines.slice(s.index, end).join("\n").trim();
    body = body.replace(/^##\s.+\n+/, "");
    return { ...CHAPTERS[s.ci], body };
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
    btn.textContent = "Copy";
    btn.addEventListener("click", async () => {
      const text = pre.querySelector("code")?.textContent || pre.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        setTimeout(() => {
          btn.textContent = "Copy";
        }, 1400);
      } catch {
        btn.textContent = "Failed";
      }
    });
    wrap.appendChild(btn);
  });
}

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}`);
  return res.text();
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
}

async function initLearnPage(signal, { animate = true } = {}) {
  const selectEl = document.querySelector("[data-chapter-select]");
  const bodyEl = document.querySelector("[data-chapter-body]");
  const titleEl = document.querySelector("[data-chapter-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!selectEl || !bodyEl) return null;

  try {
    const raw = await loadText("./content/guide.md");
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

    const syncSelect = (id) => {
      selectEl.value = id;
    };

    const renderPager = (index) => {
      if (!pagerEl) return;
      const prev = chapters[index - 1];
      const next = chapters[index + 1];
      pagerEl.innerHTML = `
        ${prev ? `<a class="pager-prev" href="${chapterHref(prev.id)}" data-chapter-id="${prev.id}"><span>Previous</span>${prev.title}</a>` : ""}
        ${next ? `<a class="pager-next" href="${chapterHref(next.id)}" data-chapter-id="${next.id}"><span>Next</span>${next.title}</a>` : ""}
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
      syncSelect(chapter.id);
      if (titleEl) titleEl.textContent = chapter.title;
      if (progressEl) progressEl.textContent = `${index + 1} / ${chapters.length}`;
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

    selectEl.innerHTML = chapters
      .map((c, i) => {
        const n = String(i + 1).padStart(2, "0");
        return `<option value="${c.id}">${n} — ${c.title}</option>`;
      })
      .join("");

    const goToChapter = (id, opts) => {
      if (!id) return;
      showChapter(id, opts);
    };

    selectEl.addEventListener(
      "change",
      () => {
        goToChapter(selectEl.value, { push: true, animate: true });
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

    showChapter(getRouteId("c") || chapters[0].id, { push: false, animate });

    return {
      goTo(id, opts) {
        goToChapter(id || chapters[0].id, opts);
      },
    };
  } catch (err) {
    if (signal?.aborted) return null;
    bodyEl.innerHTML = `<div class="error"><strong>Could not load lessons.</strong><br>${err.message}<br><br>Serve the <code>web/</code> folder over HTTP (for example <code>python3 -m http.server 4173</code>), then open the site from that URL.</div>`;
    return null;
  }
}

async function initLabPage(signal, { animate = true } = {}) {
  const selectEl = document.querySelector("[data-lab-select]");
  const bodyEl = document.querySelector("[data-lab-body]");
  const titleEl = document.querySelector("[data-lab-title]");
  const progressEl = document.querySelector("[data-progress]");
  const pagerEl = document.querySelector("[data-pager]");
  if (!selectEl || !bodyEl) return null;

  let currentIndex = -1;
  let transitionToken = 0;
  const paneEl = bodyEl.closest(".content-pane");
  const cache = new Map();
  const LAB_OUT_MS = 380;
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const resolveIndex = (id) => {
    let index = LABS.findIndex((l) => l.id === id);
    if (index < 0) index = 0;
    return index;
  };

  const syncSelect = (id) => {
    selectEl.value = id;
  };

  const renderPager = (index) => {
    if (!pagerEl) return;
    const prev = LABS[index - 1];
    const next = LABS[index + 1];
    pagerEl.innerHTML = `
      ${prev ? `<a class="pager-prev" href="${labHref(prev.id)}" data-lab-id="${prev.id}"><span>Previous lab</span>${prev.title}</a>` : ""}
      ${next ? `<a class="pager-next" href="${labHref(next.id)}" data-lab-id="${next.id}"><span>Next lab</span>${next.title}</a>` : ""}
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
    const md = await loadText(`./content/labs/${id}.md`);
    cache.set(id, md);
    return md;
  };

  const applyLab = async (lab, index) => {
    syncSelect(lab.id);
    if (titleEl) titleEl.textContent = lab.title;
    if (progressEl) progressEl.textContent = `${index + 1} / ${LABS.length} · ${lab.level}`;
    document.title = `${lab.title} — rean-git`;
    renderPager(index);

    try {
      const md = await loadLabMarkdown(lab.id);
      renderMarkdown(bodyEl, md);
      bodyEl.querySelector("h1")?.remove();
    } catch (err) {
      bodyEl.innerHTML = `<div class="error"><strong>Could not load lab.</strong><br>${err.message}<br><br>Serve the <code>web/</code> folder over HTTP.</div>`;
    }
  };

  const showLab = async (id, { push = false, animate = true } = {}) => {
    const index = resolveIndex(id);
    const lab = LABS[index];

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

  selectEl.innerHTML = LABS.map((l, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `<option value="${l.id}">${n} — ${l.title}</option>`;
  }).join("");

  const goToLab = (id, opts) => {
    if (!id) return;
    showLab(id, opts);
  };

  selectEl.addEventListener(
    "change",
    () => {
      goToLab(selectEl.value, { push: true, animate: true });
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
      goToLab(getRouteId("id") || LABS[0].id, { push: false, animate: true });
    },
    { signal }
  );

  goToLab(getRouteId("id") || LABS[0].id, { push: false, animate });

  return {
    goTo(id, opts) {
      goToLab(id || LABS[0].id, opts);
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
    abortController = new AbortController();
    const { signal } = abortController;

    if (document.body.dataset.page === "learn") {
      learnApi = await initLearnPage(signal, { animate });
    } else if (document.body.dataset.page === "lab") {
      labApi = await initLabPage(signal, { animate });
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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
