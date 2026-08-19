(() => {
  const LAB_PROGRESS_KEY = "rean-git:lab-progress";

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

  function recordLabChecklist(labId, checked, total) {
    if (!labId || total < 1) return;
    const all = readJson(LAB_PROGRESS_KEY, {});
    all[labId] = {
      checked,
      total,
      complete: checked === total,
    };
    writeJson(LAB_PROGRESS_KEY, all);
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

  window.ReanGitUtil = {
    escapeHtml,
    recordLabChecklist,
    isLabComplete,
    completedLabCount,
  };
})();
