(() => {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const header = document.querySelector(".site-header-bar");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      toggle.setAttribute("aria-expanded", "false");
      nav.classList.remove("is-open");
    });
  }

  if (header) {
    const syncHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });
  }

  const path = location.pathname.replace(/index\.html$/, "");
  document.querySelectorAll(".nav a").forEach((a) => {
    a.removeAttribute("aria-current");
    const href = a.getAttribute("href");
    if (!href) return;
    const target = new URL(href, location.href);
    const samePath = target.pathname.replace(/index\.html$/, "") === path;
    if (!samePath) return;
    const linkC = target.searchParams.get("c");
    const pageC = new URLSearchParams(location.search).get("c");
    if (linkC && pageC !== linkC) return;
    if (!linkC && pageC === "14") return;
    a.setAttribute("aria-current", "page");
  });
})();
