const CACHE = "rean-git-v4";
const PRECACHE = [
  "./",
  "./index.html",
  "./learn.html",
  "./labs.html",
  "./lab.html",
  "./manifest.webmanifest",
  "./content-precache.json",
  "./data/labs.json",
  "./locales/en.json",
  "./locales/km.json",
  "./assets/css/styles.css",
  "./assets/js/util.js",
  "./assets/js/i18n.js",
  "./assets/js/catalog.js",
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
];

async function precacheContent(cache) {
  const res = await fetch("./content-precache.json");
  if (!res.ok) throw new Error("missing content-precache.json");
  const urls = await res.json();
  if (!Array.isArray(urls) || !urls.length) throw new Error("empty content precache list");
  await cache.addAll(urls);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then(async (cache) => {
        await cache.addAll(PRECACHE);
        await precacheContent(cache);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
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
    if (request.mode === "navigate") return cache.match("./index.html");
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
