const CACHE_NAME = 'my-site-cache-v3'; // Version Bump!
const OFFLINE_URL = './offline.html';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  OFFLINE_URL
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
      .then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(
          networkResponse => {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          },
          error => {
            if (event.request.mode === 'navigate') {
                return caches.match(OFFLINE_URL);
            }
            return Promise.reject(error);
          }
        );
        return cachedResponse || fetchPromise;
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});