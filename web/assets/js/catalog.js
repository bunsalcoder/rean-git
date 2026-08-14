(() => {
  const DATA_URL = new URL("./data/labs.json", location.href).href;
  const VALID_LEVELS = new Set(["beginner", "intermediate", "advanced"]);

  let labs = [];

  function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  function labNum(lab, index) {
    const match = /^(\d+)/.exec(lab.id);
    return match ? match[1] : String(index + 1).padStart(2, "0");
  }

  function labHref(id) {
    return `./lab.html?id=${encodeURIComponent(id)}`;
  }

  function renderTrack(root) {
    if (!root) return;
    root.innerHTML = labs
      .map((lab, index) => {
        const id = escapeHtml(lab.id);
        return `<li>
          <a href="${labHref(lab.id)}">
            <span class="lab-num">${escapeHtml(labNum(lab, index))}</span>
            <h3 class="lab-title" data-i18n="labs.${id}.title"></h3>
            <p class="lab-desc" data-i18n="labs.${id}.teaser"></p>
          </a>
        </li>`;
      })
      .join("");
  }

  function renderGrid(root) {
    if (!root) return;
    root.innerHTML = labs
      .map((lab, index) => {
        const id = escapeHtml(lab.id);
        return `<a href="${labHref(lab.id)}">
          <span class="num">${escapeHtml(labNum(lab, index))}</span>
          <div>
            <h3 data-i18n="labs.${id}.title"></h3>
            <p data-i18n="labs.${id}.summary"></p>
          </div>
        </a>`;
      })
      .join("");
  }

  function paintCountTitle() {
    const title = document.querySelector("[data-lab-count-title]");
    const i18n = window.ReanGitI18n;
    if (!title || !i18n?.t) return;
    title.textContent = i18n.t("home.pathTitle", { count: String(labs.length) });
  }

  function mountLists() {
    const track = document.querySelector("[data-lab-track]");
    const grid = document.querySelector("[data-lab-grid]");
    renderTrack(track);
    renderGrid(grid);
    paintCountTitle();
    if (track) window.ReanGitI18n?.apply?.(track);
    if (grid) window.ReanGitI18n?.apply?.(grid);
  }

  const ready = fetch(DATA_URL, { credentials: "same-origin" })
    .then((res) => {
      if (!res.ok) throw new Error(`Could not load ${DATA_URL}`);
      return res.json();
    })
    .then((data) => {
      const list = Array.isArray(data?.labs) ? data.labs : [];
      labs = list.filter(
        (lab) => lab && typeof lab.id === "string" && VALID_LEVELS.has(lab.level)
      );
      return labs;
    });

  window.ReanGitCatalog = {
    ready,
    getLabs: () => labs,
    mountLists,
  };

  window.ReanGitI18n?.onChange?.(paintCountTitle);
})();
