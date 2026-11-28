// cfgarchive service worker
// Bump CACHE when index.json is rebuilt; override files refresh on their own
const CACHE = 'cfgarchive-v2';

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

// index.json is large and rarely rebuilt: cache-first.
// Everything else on meta.cfgarchive.net (overrides, hidden lists, demo and gallery
// indexes) is network-first, falling back to the cache when the network fails.
// Only successful responses are cached.
function fromNetwork(e) {
  return fetch(e.request).then(response => {
    if (response.ok) {
      const clone = response.clone();
      e.waitUntil(caches.open(CACHE).then(c => c.put(e.request, clone)));
    }
    return response;
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || !e.request.url.startsWith(META)) return;
  if (e.request.url === `${META}/index.json`) {
    e.respondWith(caches.match(e.request).then(cached => cached || fromNetwork(e)));
    return;
  }
  e.respondWith(
    fromNetwork(e)
      .then(async response => response.ok ? response : (await caches.match(e.request)) || response)
      .catch(async () => (await caches.match(e.request)) || Response.error())
  );
});
