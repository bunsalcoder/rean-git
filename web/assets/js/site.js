(() => {
  const nav = document.querySelector("[data-nav]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const header = document.querySelector(".site-header-bar");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navMotionQuery = window.matchMedia("(min-width: 721px)");

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
  const links = nav ? [...nav.querySelectorAll("a")] : [];

  links.forEach((a) => {
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

  if (!nav || !links.length) return;

  let indicator = nav.querySelector(".nav-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "nav-indicator";
    indicator.setAttribute("aria-hidden", "true");
    nav.prepend(indicator);
  }

  const activeLink = () => nav.querySelector('[aria-current="page"]');

  const moveIndicator = (link, { animate = true } = {}) => {
    if (!link || !navMotionQuery.matches) return;

    const navRect = nav.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const left = linkRect.left - navRect.left;
    const top = linkRect.top - navRect.top;

    if (!animate || prefersReducedMotion) {
      indicator.style.transition = "none";
    }

    indicator.style.width = `${linkRect.width}px`;
    indicator.style.height = `${linkRect.height}px`;
    indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;

    if (!animate || prefersReducedMotion) {
      indicator.offsetHeight;
      indicator.style.transition = "";
    }
  };

  const syncIndicator = ({ animate = false } = {}) => {
    const current = activeLink();
    if (!current) {
      indicator.style.opacity = "0";
      nav.classList.remove("is-indicator-ready");
      return;
    }

    moveIndicator(current, { animate });
    nav.classList.add("is-indicator-ready");
  };

  syncIndicator();

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        link.target === "_blank" ||
        !navMotionQuery.matches ||
        prefersReducedMotion
      ) {
        return;
      }

      const href = link.href;
      if (href === location.href) {
        event.preventDefault();
        return;
      }

      event.preventDefault();

      links.forEach((item) => item.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "page");
      moveIndicator(link, { animate: true });

      const navigate = () => {
        location.assign(href);
      };

      let didNavigate = false;
      const go = () => {
        if (didNavigate) return;
        didNavigate = true;
        navigate();
      };

      indicator.addEventListener("transitionend", go, { once: true });
      window.setTimeout(go, 420);
    });
  });

  navMotionQuery.addEventListener("change", () => syncIndicator());
  window.addEventListener("resize", () => syncIndicator());
  window.addEventListener("pageshow", () => syncIndicator());
})();
