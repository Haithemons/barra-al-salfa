const CACHE_NAME = 'barra-alsalfa-v6';
const PAGE_PATH = './barra%20al-salfa.html';
const ICON_PATH = './photo_2026-11-27_00-06-53.jpg';
const CORE_ASSETS = [
  './',
  PAGE_PATH,
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(CORE_ASSETS);
      try {
        const res = await fetch(ICON_PATH);
        if (res.ok) await cache.put(ICON_PATH, res);
      } catch (e) {}
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            event.request.url.startsWith(self.location.origin)
          ) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(PAGE_PATH));
    })
  );
});
