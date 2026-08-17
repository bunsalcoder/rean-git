(() => {
  const LANG_KEY = "rean-git-lang";
  const SUPPORTED = ["en", "km"];
  const DEFAULT_LOCALE = "en";
  const OG_LOCALES = { en: "en_US", km: "km_KH" };

  let locale = DEFAULT_LOCALE;
  let dict = {};
  const listeners = new Set();
  const cache = new Map();

  function normalizeLocale(value) {
    return SUPPORTED.includes(value) ? value : null;
  }

  function detectLocale() {
    const fromQuery = normalizeLocale(new URLSearchParams(location.search).get("lang"));
    if (fromQuery) return fromQuery;
    try {
      const saved = normalizeLocale(localStorage.getItem(LANG_KEY));
      if (saved) return saved;
    } catch {
      /* private mode */
    }
    return DEFAULT_LOCALE;
  }

  function lookup(key) {
    return key.split(".").reduce((cur, part) => {
      if (cur && typeof cur === "object" && part in cur) return cur[part];
      return undefined;
    }, dict);
  }

  function t(key, vars) {
    const value = lookup(key);
    if (typeof value !== "string") return key;
    return value.replace(/\{(\w+)\}/g, (_, name) =>
      vars && vars[name] != null ? String(vars[name]) : ""
    );
  }

  function tOr(key, fallback) {
    const value = lookup(key);
    return typeof value === "string" ? value : fallback;
  }

  async function loadDict(lang) {
    if (cache.has(lang)) return cache.get(lang);
    const url = new URL(`./locales/${lang}.json`, location.href).href;
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) throw new Error(`Could not load locale ${lang}`);
    const data = await res.json();
    cache.set(lang, data);
    return data;
  }

  function syncLangControls(root = document, activeLocale = locale) {
    root.querySelectorAll(".lang-switch").forEach((group) => {
      group.querySelectorAll("[data-set-lang]").forEach((btn) => {
        const lang = btn.getAttribute("data-set-lang");
        const active = lang === activeLocale;
        btn.setAttribute("aria-pressed", String(active));
        btn.classList.toggle("is-active", active);
      });
    });
  }

  function apply(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const value = lookup(key);
      if (typeof value !== "string") return;
      const attr = el.getAttribute("data-i18n-attr");
      if (attr) el.setAttribute(attr, value);
      else el.textContent = value;
    });

    document.documentElement.lang = locale;
    document.documentElement.setAttribute("data-lang", locale);
    document.querySelectorAll(".lang-switch").forEach((group) => {
      group.removeAttribute("data-pending");
    });
    syncLangControls(root);

    const themeToggle = document.querySelector("[data-theme-toggle]");
    if (themeToggle) {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      themeToggle.setAttribute(
        "aria-label",
        dark ? t("nav.themeToLight") : t("nav.themeToDark")
      );
    }

    syncDocumentSeo();
  }

  function langHref(lang) {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    const url = new URL(canonical || location.href, location.href);
    const current = new URL(location.href);
    for (const key of ["c", "id"]) {
      const value = current.searchParams.get(key);
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    if (lang === DEFAULT_LOCALE) url.searchParams.delete("lang");
    else url.searchParams.set("lang", lang);
    return url.toString();
  }

  function upsertHreflang(hreflang, href) {
    let link = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!link) {
      link = document.createElement("link");
      link.rel = "alternate";
      link.setAttribute("hreflang", hreflang);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  }

  function syncDocumentSeo() {
    const og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute("content", OG_LOCALES[locale] || OG_LOCALES.en);

    const alt = document.querySelector('meta[property="og:locale:alternate"]');
    if (alt) {
      const other = locale === "km" ? "en" : "km";
      alt.setAttribute("content", OG_LOCALES[other]);
    }

    const enHref = langHref("en");
    const kmHref = langHref("km");
    upsertHreflang("en", enHref);
    upsertHreflang("km", kmHref);
    upsertHreflang("x-default", enHref);

    const ld = document.querySelector('script[type="application/ld+json"]');
    if (!ld) return;
    try {
      const data = JSON.parse(ld.textContent);
      const desc = lookup("meta.homeDescription");
      if (typeof desc === "string") data.description = desc;
      data.inLanguage = [...SUPPORTED];
      ld.textContent = JSON.stringify(data);
    } catch {
      /* keep existing JSON-LD if it is not valid JSON */
    }
  }

  function persist(lang) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* private mode */
    }
  }

  async function setLocale(lang, { persist: shouldPersist = true, notify = true } = {}) {
    const next = normalizeLocale(lang) || DEFAULT_LOCALE;
    document.querySelectorAll(".lang-switch").forEach((group) => {
      group.setAttribute("data-pending", next);
    });
    syncLangControls(document, next);

    dict = await loadDict(next);
    locale = next;
    if (shouldPersist) persist(next);
    apply();
    if (notify) listeners.forEach((fn) => fn(locale));
    return locale;
  }

  function onChange(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  function wireControls() {
    document.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-set-lang]");
      if (!btn) return;
      const lang = btn.getAttribute("data-set-lang");
      if (!lang || lang === locale) return;
      setLocale(lang).catch(() => {});
    });
  }

  const ready = (async () => {
    locale = detectLocale();
    try {
      dict = await loadDict(locale);
    } catch {
      locale = DEFAULT_LOCALE;
      dict = await loadDict(DEFAULT_LOCALE);
    }
    document.documentElement.lang = locale;
    document.documentElement.setAttribute("data-lang", locale);
    apply();
    wireControls();
    return locale;
  })();

  window.ReanGitI18n = {
    ready,
    t,
    tOr,
    apply,
    setLocale,
    getLocale: () => locale,
    getDict: () => dict,
    onChange,
    syncSeo: syncDocumentSeo,
    supported: [...SUPPORTED],
  };
})();
