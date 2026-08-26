(() => {
  const LAST_CHAPTER_KEY = "rean-git:last-chapter";
  const LAST_LAB_KEY = "rean-git:last-lab";
  const LAB_PROGRESS_KEY = "rean-git:lab-progress";
  const CHAPTER_PROGRESS_KEY = "rean-git:chapter-progress";
  const CHECKLIST_PREFIX = "rean-git:checklist:";
  const CLONE_COMMAND = "git clone https://github.com/bunsalcoder/rean-git.git\ncd rean-git";

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function readJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* private mode / quota — ignore */
    }
  }

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

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail }));
  }

  function recordLabChecklist(labId, checked, total) {
    if (!labId || total < 1) return;
    const all = readJson(LAB_PROGRESS_KEY, {});
    all[labId] = {
      checked,
      total,
      complete: checked === total,
    };
    writeJson(LAB_PROGRESS_KEY, all);
    emit("rean-git:lab-progress", { labId });
  }

  function labProgress(labId) {
    const all = readJson(LAB_PROGRESS_KEY, {});
    return all[labId] && typeof all[labId] === "object" ? all[labId] : null;
  }

  function isLabComplete(labId) {
    const progress = labProgress(labId);
    return Boolean(progress && progress.total > 0 && progress.checked === progress.total);
  }

  function completedLabCount(labIds) {
    return (labIds || []).filter(isLabComplete).length;
  }

  function recordChapterComplete(chapterId, complete = true) {
    if (!chapterId) return;
    const all = readJson(CHAPTER_PROGRESS_KEY, {});
    all[chapterId] = { complete: Boolean(complete) };
    writeJson(CHAPTER_PROGRESS_KEY, all);
    emit("rean-git:chapter-progress", { chapterId });
  }

  function isChapterComplete(chapterId) {
    const all = readJson(CHAPTER_PROGRESS_KEY, {});
    return Boolean(all[chapterId] && all[chapterId].complete);
  }

  function completedChapterCount(chapterIds) {
    return (chapterIds || []).filter(isChapterComplete).length;
  }

  function resetProgress() {
    const remove = [];
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key) continue;
        if (
          key === LAST_CHAPTER_KEY ||
          key === LAST_LAB_KEY ||
          key === LAB_PROGRESS_KEY ||
          key === CHAPTER_PROGRESS_KEY ||
          key.startsWith(CHECKLIST_PREFIX)
        ) {
          remove.push(key);
        }
      }
      remove.forEach((key) => localStorage.removeItem(key));
    } catch {
      /* private mode */
    }
    emit("rean-git:lab-progress", { reset: true });
    emit("rean-git:chapter-progress", { reset: true });
  }

  function parseGuideChapters(markdown) {
    const lines = String(markdown || "").split("\n");
    const starts = [];
    const seen = new Set();
    lines.forEach((line, index) => {
      let id = null;
      if (/^## How to use this guide$/.test(line) || /^## របៀបប្រើមគ្គុទ្ទេសក៍នេះ$/.test(line)) {
        id = "how-to-use";
      } else {
        const numbered = /^## (\d+)\. /.exec(line);
        if (numbered) id = numbered[1];
      }
      if (!id || seen.has(id)) return;
      seen.add(id);
      starts.push({
        index,
        id,
        title: line.replace(/^##\s+/, "").replace(/^\d+\.\s+/, ""),
      });
    });
    return starts.map((start, i) => {
      const end = i + 1 < starts.length ? starts[i + 1].index : lines.length;
      return {
        id: start.id,
        title: start.title,
        body: lines.slice(start.index + 1, end).join("\n"),
      };
    });
  }

  window.ReanGitUtil = {
    escapeHtml,
    LAST_CHAPTER_KEY,
    LAST_LAB_KEY,
    CLONE_COMMAND,
    readStorageItem,
    writeStorageItem,
    recordLabChecklist,
    labProgress,
    isLabComplete,
    completedLabCount,
    recordChapterComplete,
    isChapterComplete,
    completedChapterCount,
    resetProgress,
    parseGuideChapters,
  };
})();
