const CACHE_NAME = 'convoice-cache-v1';
const urlsToCache = [
  '/convoice/',
  '/convoice/index.html',
  // Add other important assets here, e.g., CSS, JS bundles
  // Vite will automatically generate hashed assets,
  // so we might need a more dynamic way to cache them later,
  // or rely on Vite PWA plugins if we choose to use one.
  '/convoice/icon-192x192.png',
  '/convoice/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
