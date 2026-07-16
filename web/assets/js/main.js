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

  reveal(".lab-track li", { stagger: 45 });
  reveal(".lab-grid a", { stagger: 50 });
})();
