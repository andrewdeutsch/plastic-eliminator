const CACHE_NAME = 'plastic-eliminator-v1';

// Install event - creates cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/index.js',
        '/imgs/icon-192x192.png',
        '/imgs/icon-512x512.png'
      ]);
    })
  );
  self.skipWaiting();
});

// Fetch event - tries to serve from cache first, then network
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Return the response
        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If all else fails, return a simple offline message
            if (event.request.mode === 'navigate') {
              return new Response('You are offline. Please reconnect to view this page.', {
                headers: { 'Content-Type': 'text/plain' }
              });
            }
            return new Response('Network error occurred', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Activate event - claims clients so the SW is in control
self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});