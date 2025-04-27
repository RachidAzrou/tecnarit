// Service worker voor TECNARIT EMS PWA

const CACHE_NAME = 'tecnarit-ems-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/apple-touch-icon.png',
  '/logo192.png',
  '/logo512.png',
  '/manifest.json'
];

// Cache bestanden bij installatie
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activeer service worker en verwijder oude caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Probeer eerst de cache te gebruiken, dan het netwerk
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});