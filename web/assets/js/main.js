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

  const LAST_CHAPTER_KEY = "rean-git:last-chapter";
  const LAST_LAB_KEY = "rean-git:last-lab";

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
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

  const mount = () => {
    reveal(".lab-track li", { stagger: 45 });
    reveal(".lab-grid a", { stagger: 50 });
    reveal(".method-step", { stagger: 90 });
    typeTerminal();
    paintHomeResume();
  };

  window.ReanGitHome = { mount };
  window.ReanGitI18n?.ready?.then(paintHomeResume);
  window.ReanGitI18n?.onChange?.(paintHomeResume);

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
