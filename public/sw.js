const CACHE_NAME = 'convoice-cache-v2'; // Updated cache name
const APP_SHELL_URLS = [
  '/convoice/manifest.json', // Assuming this is the correct path after deployment
  '/convoice/icon-192x192.png',
  '/convoice/icon-512x512.png'
  // DO NOT cache index.html or specific JS/CSS bundles here if they are versioned by hash
  // and index.html needs to be network-first for navigations.
  // index.html itself will be cached on successful network fetch for offline.
];

// Install event:
// - Calls skipWaiting() to force the new SW to activate immediately.
// - Pre-caches the app shell (manifest, icons).
self.addEventListener('install', event => {
  console.log('[SW] Install event, new CACHE_NAME:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell:', APP_SHELL_URLS);
        return cache.addAll(APP_SHELL_URLS);
      })
      .then(() => self.skipWaiting()) // Force activation of new SW
      .catch(error => {
        console.error('[SW] App shell caching failed during install:', error);
      })
  );
});

// Activate event:
// - Calls clients.claim() to take control of open clients.
// - Cleans up old caches.
self.addEventListener('activate', event => {
  console.log('[SW] Activate event');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of clients
  );
});

// Fetch event:
self.addEventListener('fetch', event => {
  const request = event.request;

  // Strategy for navigation requests (e.g., index.html)
  // Network first, then cache. If network fails, serve from cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If fetch is successful, clone the response, cache it, and return original.
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                console.log('[SW] Caching successful navigation request:', request.url);
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(error => {
          // If network fails, try to serve from cache.
          console.log('[SW] Network fetch failed for navigation, trying cache:', request.url, error);
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // If not in cache either (e.g. first time offline for this page),
              // respond with a generic offline page or error.
              // For now, just let the browser handle the error if nothing is cached.
              console.error('[SW] Navigation request not in cache and network failed:', request.url);
              // You might want to return a custom offline.html page here:
              // return caches.match('/convoice/offline.html');
              return new Response('Network error and not in cache. ConVoice is offline.', {
                status: 404,
                statusText: 'Network error and not in cache.'
              });
            });
        })
    );
    return; // IMPORTANT: End execution for navigate requests here.
  }

  // Strategy for non-navigation requests (assets like JS, CSS, images)
  // Cache first, then network. If fetched from network, cache it.
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        // console.log('[SW] Not in cache, fetching from network:', request.url);
        return fetch(request)
          .then(networkResponse => {
            // If fetch is successful, clone, cache, and return.
            if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  // console.log('[SW] Caching new asset from network:', request.url);
                  cache.put(request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Fetching asset failed and not in cache:', request.url, error);
            // For assets, if they are not in cache and network fails,
            // it will result in a broken page, which is expected if offline
            // and assets weren't cached.
            // You could return a placeholder for images here if desired.
            return new Response(`Asset not found: ${request.url}`, {
                status: 404,
                statusText: 'Asset not found.'
              });
          });
      })
  );
});
