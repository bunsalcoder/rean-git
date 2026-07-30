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

  const mount = () => {
    reveal(".lab-track li", { stagger: 45 });
    reveal(".lab-grid a", { stagger: 50 });
    reveal(".method-step", { stagger: 90 });
    typeTerminal();
  };

  window.ReanGitHome = { mount };

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
