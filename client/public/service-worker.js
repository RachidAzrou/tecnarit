// Service Worker voor TECNARIT - EMS
const APP_VERSION = '1.2.2';
const CACHE_NAME = `tecnarit-ems-v${APP_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Bestanden om te cachen (statische assets)
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.png',
  '/favicon.svg',
  '/logo192.png',
  '/logo512.png',
  '/apple-touch-icon.png',
  '/manifest.json',
  '/offline.html',
];

// Service Worker installatie
self.addEventListener('install', (event) => {
  // Voorkom dat de oude service worker blijft draaien totdat deze volledig is geïnstalleerd
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache geopend');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Service Worker activatie
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Verwijder oude caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch events afhandelen
self.addEventListener('fetch', (event) => {
  // Skip CORS requests
  if (event.request.mode === 'cors') {
    return;
  }

  // Voor API requests gebruiken we network-first strategie
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Voor andere requests gebruiken we stale-while-revalidate strategie
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - retourneer de response
        if (response) {
          // Probeer de resource te updaten in de achtergrond
          fetch(event.request).then((newResponse) => {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, newResponse);
            });
          });
          return response;
        }

        // Als geen cache hit, haal het op van het netwerk
        return fetch(event.request)
          .then((response) => {
            // Controleer of we een geldige response hebben
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone de response (response body kan maar één keer worden gebruikt)
            const responseToCache = response.clone();

            // Sla de nieuwe resource op in de cache
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Als het netwerk faalt, toon offline pagina
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // Voor afbeeldingen, kunnen we een placeholder retourneren
            if (event.request.destination === 'image') {
              return new Response(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="180" viewBox="0 0 200 180"><rect fill="#233142" width="100%" height="100%"/><text fill="#ffffff" font-family="Arial,sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">Offline</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Anders retourneren we een lege response
            return new Response();
          });
      })
  );
});