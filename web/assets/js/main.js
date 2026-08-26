(() => {
  const reveal = (selector, options = {}) => {
    const items = document.querySelectorAll(selector);
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: options.rootMargin || "0px 0px -6% 0px",
        threshold: options.threshold ?? 0.1,
      }
    );

    items.forEach((el, index) => {
      el.style.transitionDelay = `${index * (options.stagger ?? 40)}ms`;
      observer.observe(el);
    });
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const typeTerminal = async () => {
    const typed = document.querySelector("[data-term-typed]");
    const graph = document.querySelector(".branch-graph");
    const featLine = document.querySelector(".branch-line.feat");
    if (!typed) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = Array.from(document.querySelectorAll("[data-term-reveal]"));
    const command = "git status";

    if (reduce) {
      lines.forEach((line) => line.classList.add("is-shown"));
      typed.textContent = command;
      graph?.classList.add("is-drawn");
      featLine?.classList.add("is-drawn");
      return;
    }

    for (const line of lines) {
      await sleep(220);
      line.classList.add("is-shown");
    }

    await sleep(400);
    typed.textContent = "";
    for (const ch of command) {
      typed.textContent += ch;
      await sleep(55 + Math.random() * 40);
    }

    graph?.classList.add("is-drawn");
    featLine?.classList.add("is-drawn");
  };

  const LAST_CHAPTER_KEY = window.ReanGitUtil?.LAST_CHAPTER_KEY || "rean-git:last-chapter";
  const LAST_LAB_KEY = window.ReanGitUtil?.LAST_LAB_KEY || "rean-git:last-lab";

  function readStorage(key) {
    return window.ReanGitUtil?.readStorageItem?.(key) ?? null;
  }

  function paintHomeResume() {
    const i18n = window.ReanGitI18n;
    const learnBtn = document.querySelector("[data-home-learn]");
    const labBtn = document.querySelector("[data-home-lab-continue]");
    if (!learnBtn) return;

    const chapterId = readStorage(LAST_CHAPTER_KEY);
    const chapterTitle = chapterId ? i18n?.t?.(`chapters.${chapterId}`) : "";
    const hasChapter = Boolean(chapterTitle && chapterTitle !== `chapters.${chapterId}`);

    if (hasChapter) {
      learnBtn.href = `./learn.html?c=${encodeURIComponent(chapterId)}`;
      learnBtn.removeAttribute("data-i18n");
      learnBtn.textContent = i18n.t("home.continueChapter", { title: chapterTitle });
    } else {
      learnBtn.href = "./learn.html";
      learnBtn.setAttribute("data-i18n", "home.startLearning");
      learnBtn.textContent = i18n?.t?.("home.startLearning") || "Start learning";
    }

    if (!labBtn) return;
    const labId = readStorage(LAST_LAB_KEY);
    const labTitle = labId ? i18n?.t?.(`labs.${labId}.title`) : "";
    const hasLab = Boolean(labTitle && labTitle !== `labs.${labId}.title`);
    if (hasLab) {
      labBtn.hidden = false;
      labBtn.href = `./lab.html?id=${encodeURIComponent(labId)}`;
      labBtn.textContent = i18n.t("home.continueLab", { title: labTitle });
    } else {
      labBtn.hidden = true;
      labBtn.removeAttribute("href");
    }
  }

  function paintHomeProgress() {
    const panel = document.querySelector("[data-home-progress]");
    const chapterEl = document.querySelector("[data-home-chapter-progress]");
    const labEl = document.querySelector("[data-home-lab-progress]");
    const completeEl = document.querySelector("[data-home-labs-complete]");
    if (!panel || !chapterEl || !labEl || !completeEl) return;

    const i18n = window.ReanGitI18n;
    const chapters = Object.keys(i18n?.getDict?.()?.chapters || {});
    const catalogLabs = window.ReanGitCatalog?.getLabs?.() || [];
    const chapterId = readStorage(LAST_CHAPTER_KEY);
    const labId = readStorage(LAST_LAB_KEY);
    const chapterIndex = chapterId ? chapters.indexOf(chapterId) + 1 : 0;
    const labIndex = labId ? catalogLabs.findIndex((lab) => lab.id === labId) + 1 : 0;
    const completedLabs = window.ReanGitUtil?.completedLabCount?.(
      catalogLabs.map((lab) => lab.id)
    ) || 0;
    const completedChapters =
      window.ReanGitUtil?.completedChapterCount?.(chapters) || 0;

    if (!chapterIndex && !labIndex && !completedLabs && !completedChapters) {
      panel.hidden = true;
      return;
    }

    panel.hidden = false;

    if (chapterIndex > 0) {
      chapterEl.hidden = false;
      chapterEl.textContent = i18n.t("home.chapterProgress", {
        current: String(chapterIndex),
        total: String(chapters.length),
        title: i18n.t(`chapters.${chapterId}`),
      });
    } else {
      chapterEl.hidden = true;
    }

    if (labIndex > 0) {
      labEl.hidden = false;
      labEl.textContent = i18n.t("home.labProgress", {
        current: String(labIndex),
        total: String(catalogLabs.length),
        title: i18n.t(`labs.${labId}.title`),
      });
    } else {
      labEl.hidden = true;
    }

    const chaptersCompleteEl = document.querySelector("[data-home-chapters-complete]");
    if (chaptersCompleteEl) {
      if (completedChapters > 0) {
        chaptersCompleteEl.hidden = false;
        chaptersCompleteEl.textContent = i18n.t("home.chaptersComplete", {
          current: String(completedChapters),
          total: String(chapters.length),
        });
      } else {
        chaptersCompleteEl.hidden = true;
      }
    }

    if (completedLabs > 0) {
      completeEl.hidden = false;
      completeEl.textContent = i18n.t("home.labsComplete", {
        current: String(completedLabs),
        total: String(catalogLabs.length),
      });
    } else {
      completeEl.hidden = true;
    }
  }

  function paintLabsPageProgress() {
    const el = document.querySelector("[data-labs-progress]");
    if (!el) return;

    const i18n = window.ReanGitI18n;
    const catalogLabs = window.ReanGitCatalog?.getLabs?.() || [];
    const completed =
      window.ReanGitUtil?.completedLabCount?.(catalogLabs.map((lab) => lab.id)) || 0;

    if (!completed) {
      el.hidden = true;
      return;
    }

    el.hidden = false;
    el.textContent = i18n.t("home.labsComplete", {
      current: String(completed),
      total: String(catalogLabs.length),
    });
  }

  function paintHomeCounts() {
    const lede = document.querySelector("[data-home-lede]");
    const i18n = window.ReanGitI18n;
    if (!lede || !i18n?.t) return;
    const chapters = Object.keys(i18n.getDict?.()?.chapters || {});
    const numbered = chapters.filter((id) => /^\d+$/.test(id)).length;
    const labs = window.ReanGitCatalog?.getLabs?.() || [];
    lede.textContent = i18n.t("home.lede", {
      chapterCount: String(numbered || chapters.length),
      labCount: String(labs.length || 19),
    });
  }

  function paintCloneCta() {
    const command = document.querySelector("[data-clone-command]");
    const copyBtn = document.querySelector("[data-clone-copy]");
    const snippet = window.ReanGitUtil?.CLONE_COMMAND || "git clone https://github.com/bunsalcoder/rean-git.git\ncd rean-git";
    if (command) command.textContent = snippet;
    if (!copyBtn || copyBtn.dataset.wired === "true") return;
    copyBtn.dataset.wired = "true";
    copyBtn.addEventListener("click", async () => {
      const i18n = window.ReanGitI18n;
      try {
        await navigator.clipboard.writeText(snippet);
        copyBtn.textContent = i18n?.t?.("ui.copied") || "Copied";
        window.setTimeout(() => {
          copyBtn.textContent = i18n?.t?.("ui.copy") || "Copy";
        }, 1400);
      } catch {
        copyBtn.textContent = i18n?.t?.("ui.failed") || "Failed";
      }
    });
  }

  function wireResetProgress() {
    const btn = document.querySelector("[data-reset-progress]");
    if (!btn || btn.dataset.wired === "true") return;
    btn.dataset.wired = "true";
    btn.addEventListener("click", () => {
      const i18n = window.ReanGitI18n;
      const message = i18n?.t?.("home.resetConfirm") || "Clear your learning progress on this device?";
      if (!window.confirm(message)) return;
      window.ReanGitUtil?.resetProgress?.();
      paintHomeResume();
      paintHomeProgress();
      paintLabsPageProgress();
    });
  }

  const mount = async () => {
    try {
      await window.ReanGitI18n?.ready;
      await window.ReanGitCatalog?.ready;
      window.ReanGitCatalog?.mountLists?.();
    } catch {
      /* catalog missing — leave empty lists */
    }
    reveal(".lab-track li", { stagger: 45 });
    reveal(".lab-grid a", { stagger: 50 });
    reveal(".method-step", { stagger: 90 });
    typeTerminal();
    paintHomeResume();
    paintHomeProgress();
    paintLabsPageProgress();
    paintHomeCounts();
    paintCloneCta();
    wireResetProgress();
  };

  window.ReanGitHome = { mount };
  window.ReanGitI18n?.ready?.then(() => {
    paintHomeResume();
    paintHomeProgress();
    paintLabsPageProgress();
    paintHomeCounts();
    paintCloneCta();
  });
  window.ReanGitI18n?.onChange?.(() => {
    paintHomeResume();
    paintHomeProgress();
    paintLabsPageProgress();
    paintHomeCounts();
    paintCloneCta();
  });

  window.addEventListener("rean-git:lab-progress", () => {
    paintHomeProgress();
    paintLabsPageProgress();
  });
  window.addEventListener("rean-git:chapter-progress", () => {
    paintHomeProgress();
  });

  const start = () => {
    if (window.__reanGitDeferHomeMount) return;
    mount();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
