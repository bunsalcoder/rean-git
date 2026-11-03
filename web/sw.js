const CACHE = "rean-git-d5b3fe8c05ad";

const PRECACHE = [
  "./",
  "./index.html",
  "./learn.html",
  "./labs.html",
  "./lab.html",
  "./404.html",
  "./manifest.webmanifest",
  "./manifest-km.webmanifest",
  "./content-precache.json",
  "./data/labs.json",
  "./locales/en.json",
  "./locales/km.json",
  "./assets/css/styles.css",
  "./assets/js/util.js",
  "./assets/js/i18n.js",
  "./assets/js/catalog.js",
  "./assets/js/a11y.js",
  "./assets/js/search.js",
  "./assets/js/site.js",
  "./assets/js/main.js",
  "./assets/js/learn.js",
  "./assets/vendor/marked.min.js",
  "./assets/vendor/purify.min.js",
  "./assets/fonts/epilogue-latin.woff2",
  "./assets/fonts/epilogue-latin-ext.woff2",
  "./assets/fonts/ibm-plex-mono-400-latin.woff2",
  "./assets/fonts/ibm-plex-mono-500-latin.woff2",
  "./assets/fonts/kantumruy-pro-khmer.woff2",
  "./assets/fonts/kantumruy-pro-latin.woff2",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./assets/img/icon-maskable-192.png",
  "./assets/img/icon-maskable-512.png",
];

async function cacheUrlsSettled(cache, urls) {
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        await cache.add(url);
      } catch {
        /* skip missing/optional assets so install can finish */
      }
    })
  );
}

function splitContentByLocale(urls, preferred) {
  const primary = [];
  const secondary = [];
  for (const url of urls) {
    if (typeof url !== "string") continue;
    if (url.includes(`/content/${preferred}/`)) primary.push(url);
    else secondary.push(url);
  }
  return { primary, secondary };
}

async function loadContentUrls() {
  const res = await fetch("./content-precache.json");
  if (!res.ok) throw new Error("missing content-precache.json");
  const urls = await res.json();
  if (!Array.isArray(urls) || !urls.length) throw new Error("empty content precache list");
  return urls.filter((url) => typeof url === "string");
}

async function precachePreferredContent(cache, preferred = "en") {
  try {
    const urls = await loadContentUrls();
    const { primary } = splitContentByLocale(urls, preferred);
    await cacheUrlsSettled(cache, primary.length ? primary : urls);
  } catch {
    /* shell still works; content fills via network / SWR */
  }
}

async function warmRemainingContent(cache, preferred = "en") {
  try {
    const urls = await loadContentUrls();
    const { secondary } = splitContentByLocale(urls, preferred);
    await cacheUrlsSettled(cache, secondary);
  } catch {
    /* ignore */
  }
}

let preferredLocale = "en";

async function detectPreferredLocale() {
  if (self.cookieStore) {
    try {
      const cookie = await self.cookieStore.get("rean-git-lang");
      if (cookie && (cookie.value === "km" || cookie.value === "en")) return cookie.value;
    } catch {
      /* unsupported / blocked */
    }
  }
  return preferredLocale;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      preferredLocale = await detectPreferredLocale();
      const cache = await caches.open(CACHE);
      await cache.addAll(PRECACHE);
      await precachePreferredContent(cache, preferredLocale);
      // First visit: activate now. Updates wait so the page can prompt.
      if (!self.registration.active) await self.skipWaiting();
    })()
  );
});

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || typeof data !== "object") return;
  if (data.type === "skipWaiting") {
    self.skipWaiting();
    return;
  }
  if (data.type === "preferLocale" && (data.locale === "en" || data.locale === "km")) {
    preferredLocale = data.locale;
    event.waitUntil(
      caches.open(CACHE).then(async (cache) => {
        await precachePreferredContent(cache, preferredLocale);
        await warmRemainingContent(cache, preferredLocale);
      })
    );
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      const cache = await caches.open(CACHE);
      await warmRemainingContent(cache, preferredLocale);
      await self.clients.claim();
    })()
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.mode === "navigate") {
      return (await cache.match("./404.html")) || cache.match("./index.html");
    }
    throw new Error(`offline: ${request.url}`);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const fetching = fetch(request)
    .then((fresh) => {
      if (fresh.ok) cache.put(request, fresh.clone());
      return fresh;
    })
    .catch(() => cached);
  return cached || fetching;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  const isPage =
    request.mode === "navigate" ||
    url.pathname.endsWith(".html") ||
    url.pathname.endsWith("/");

  event.respondWith(isPage ? networkFirst(request) : staleWhileRevalidate(request));
});
