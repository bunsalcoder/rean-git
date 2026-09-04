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

  function remapLabKey(id, resolveLabId) {
    if (!id || typeof resolveLabId !== "function") return id;
    const next = resolveLabId(id);
    return next || id;
  }

  function migrateLabIds(resolveLabId) {
    if (typeof resolveLabId !== "function") return;

    const lastLab = readStorageItem(LAST_LAB_KEY);
    if (lastLab) {
      const canonical = remapLabKey(lastLab, resolveLabId);
      if (canonical !== lastLab) writeStorageItem(LAST_LAB_KEY, canonical);
    }

    const labs = readJson(LAB_PROGRESS_KEY, {});
    let labsChanged = false;
    const nextLabs = {};
    Object.entries(labs).forEach(([id, value]) => {
      const canonical = remapLabKey(id, resolveLabId);
      if (canonical !== id) labsChanged = true;
      if (!nextLabs[canonical] || (value && value.complete)) {
        nextLabs[canonical] = value;
      }
    });
    if (labsChanged) writeJson(LAB_PROGRESS_KEY, nextLabs);

    try {
      const checklistMoves = [];
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(`${CHECKLIST_PREFIX}lab:`)) continue;
        const oldId = key.slice(`${CHECKLIST_PREFIX}lab:`.length);
        const canonical = remapLabKey(oldId, resolveLabId);
        if (!canonical || canonical === oldId) continue;
        checklistMoves.push({
          from: key,
          to: `${CHECKLIST_PREFIX}lab:${canonical}`,
          value: localStorage.getItem(key),
        });
      }
      checklistMoves.forEach(({ from, to, value }) => {
        if (value != null && localStorage.getItem(to) == null) {
          localStorage.setItem(to, value);
        }
        localStorage.removeItem(from);
      });
    } catch {
      /* private mode */
    }
  }

  function recordLabChecklist(labId, checked, total) {
    if (!labId || total < 1) return;
    const id = window.ReanGitCatalog?.resolveLabId?.(labId) || labId;
    const all = readJson(LAB_PROGRESS_KEY, {});
    all[id] = {
      checked,
      total,
      complete: checked === total,
    };
    writeJson(LAB_PROGRESS_KEY, all);
    emit("rean-git:lab-progress", { labId: id });
  }

  function labProgress(labId) {
    const id = window.ReanGitCatalog?.resolveLabId?.(labId) || labId;
    const all = readJson(LAB_PROGRESS_KEY, {});
    return all[id] && typeof all[id] === "object" ? all[id] : null;
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

  const PROGRESS_VERSION = 1;

  function collectChecklists() {
    const checklists = {};
    try {
      for (let i = 0; i < localStorage.length; i += 1) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(CHECKLIST_PREFIX)) continue;
        const relative = key.slice(CHECKLIST_PREFIX.length);
        checklists[relative] = readJson(key, {});
      }
    } catch {
      /* private mode */
    }
    return checklists;
  }

  function exportProgress() {
    return {
      version: PROGRESS_VERSION,
      exportedAt: new Date().toISOString(),
      lastChapter: readStorageItem(LAST_CHAPTER_KEY),
      lastLab: readStorageItem(LAST_LAB_KEY),
      labs: readJson(LAB_PROGRESS_KEY, {}),
      chapters: readJson(CHAPTER_PROGRESS_KEY, {}),
      checklists: collectChecklists(),
    };
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function importProgress(payload) {
    if (!isPlainObject(payload)) throw new Error("invalid progress file");
    const version = payload.version == null ? PROGRESS_VERSION : payload.version;
    if (version !== PROGRESS_VERSION) throw new Error("unsupported progress version");

    const labs = isPlainObject(payload.labs) ? payload.labs : {};
    const chapters = isPlainObject(payload.chapters) ? payload.chapters : {};
    const checklists = isPlainObject(payload.checklists) ? payload.checklists : {};

    resetProgress();

    if (typeof payload.lastChapter === "string" && payload.lastChapter) {
      writeStorageItem(LAST_CHAPTER_KEY, payload.lastChapter);
    }
    const resolve = window.ReanGitCatalog?.resolveLabId;
    if (typeof payload.lastLab === "string" && payload.lastLab) {
      writeStorageItem(LAST_LAB_KEY, remapLabKey(payload.lastLab, resolve));
    }

    const remappedLabs = {};
    Object.entries(labs).forEach(([id, value]) => {
      remappedLabs[remapLabKey(id, resolve)] = value;
    });
    writeJson(LAB_PROGRESS_KEY, remappedLabs);
    writeJson(CHAPTER_PROGRESS_KEY, chapters);
    Object.entries(checklists).forEach(([relative, state]) => {
      if (
        !relative ||
        !isPlainObject(state) ||
        relative.includes("..") ||
        !/^[a-zA-Z0-9._/-]+$/.test(relative)
      ) {
        return;
      }
      let key = relative;
      if (key.startsWith("lab:")) {
        key = `lab:${remapLabKey(key.slice(4), resolve)}`;
      }
      writeJson(`${CHECKLIST_PREFIX}${key}`, state);
    });

    emit("rean-git:lab-progress", { imported: true });
    emit("rean-git:chapter-progress", { imported: true });
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
    migrateLabIds,
    recordLabChecklist,
    labProgress,
    isLabComplete,
    completedLabCount,
    recordChapterComplete,
    isChapterComplete,
    completedChapterCount,
    resetProgress,
    exportProgress,
    importProgress,
    parseGuideChapters,
  };
})();
