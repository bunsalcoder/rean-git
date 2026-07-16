const labs = document.querySelectorAll(".lab-list li");

if (labs.length && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
  );

  labs.forEach((lab, index) => {
    lab.style.transitionDelay = `${index * 45}ms`;
    observer.observe(lab);
  });
} else {
  labs.forEach((lab) => lab.classList.add("is-visible"));
}
