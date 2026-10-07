// Offline cache for BeatNest's own files only. Third-party requests pass through untouched.
const CACHE_PREFIX = 'beatnest-cache-';
const CACHE_NAME = `${CACHE_PREFIX}v2`;
const APP_SCOPE_PATH = new URL(self.registration.scope).pathname;

const PRECACHE_ASSETS = ['./', './index.html', './manifest.json', './favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  // Keep external services and non-GET requests outside the app's offline cache.
  if (
    request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    !requestUrl.pathname.startsWith(APP_SCOPE_PATH)
  ) {
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const networkResponse = await fetch(request);
      if (networkResponse.ok) await cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch {
      const cachedResponse = await cache.match(request);
      if (cachedResponse) return cachedResponse;
      if (request.mode === 'navigate') {
        return (await cache.match(new URL('./index.html', self.registration.scope).href))
          ?? new Response('Offline', { status: 503, statusText: 'Offline' });
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
