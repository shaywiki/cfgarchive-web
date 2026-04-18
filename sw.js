// cfgarchive service worker
// Bump CACHE on each deploy to invalidate all cached data
const CACHE = 'cfgarchive-v1';

const META = 'https://meta.cfgarchive.net';

// Files fetched on every page load — pre-cached at install time
const PRECACHE = [
  `${META}/index.json`,
  `${META}/categories-v2.json`,
  `${META}/tags-v2.json`,
  `${META}/games-v2.json`,
  `${META}/titles-v2.json`,
  `${META}/authors-v2.json`,
  `${META}/uploaders-v2.json`,
  `${META}/stats-v2.json`,
  `${META}/hidden.json`,
];

// Pre-cache on install, then take control immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Delete any old cache versions on activate
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first for all meta.cfgarchive.net requests
// Covers pre-cached files + lazy-loaded ones (demos-index, gallery-index, hidden-gallery)
self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(META)) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      });
    })
  );
});
