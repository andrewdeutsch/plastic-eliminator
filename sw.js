const CACHE_NAME = 'plastic-eliminator-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/imgs/icon-192x192.png',
  '/imgs/icon-512x512.png',
  '/imgs/favicon.ico'
];

// Install event - creates cache and pre-caches key assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell and content');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[Service Worker] Install complete');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - implements a cache-first strategy for assets, network-first for everything else
self.addEventListener('fetch', event => {
  // Clone the request to ensure it's safe to read multiple times
  const requestUrl = new URL(event.request.url);
  
  // Is this a request for an app shell asset?
  const isAppShellAsset = ASSETS_TO_CACHE.includes(requestUrl.pathname) || 
                         requestUrl.pathname.startsWith('/imgs/');
  
  if (isAppShellAsset) {
    // For app shell assets, use cache-first strategy
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then(response => {
              // Put a copy of the response in the cache
              return caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            });
        })
        .catch(() => {
          // If both cache and network fail, return a fallback
          console.log('[Service Worker] Both cache and network failed for app shell asset');
          return new Response('Network error occurred', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
  } else {
    // For all other requests (API calls, etc.), use network-first strategy
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response so it can be used by both the browser and our cache
          const responseToCache = response.clone();
          
          // Only cache successful responses
          if (response.status === 200) {
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
          }
          
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // If it's a navigation request and nothing in cache, show offline page
              if (event.request.mode === 'navigate') {
                return new Response(
                  `<!DOCTYPE html>
                  <html>
                    <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <title>Plastic Eliminator - Offline</title>
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 2rem; }
                        h1 { color: #e53e3e; }
                      </style>
                    </head>
                    <body>
                      <h1>You're Offline</h1>
                      <p>Please reconnect to continue your plastic elimination journey.</p>
                    </body>
                  </html>`,
                  {
                    headers: {
                      'Content-Type': 'text/html'
                    }
                  }
                );
              }
              
              // For non-navigation requests that aren't in cache
              return new Response('Resource not available offline', {
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
  }
});

// Add an event listener for when the service worker is periodically waking up
self.addEventListener('periodicsync', event => {
  if (event.tag === 'daily-check') {
    console.log('[Service Worker] Running periodic sync to check for day changes');
    // This is limited as service workers can't directly manipulate localStorage
    // But we can notify all open clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'CHECK_DAY_CHANGE'
        });
      });
    });
  }
});

// Add a message event listener to respond to messages from clients
self.addEventListener('message', event => {
  console.log('[Service Worker] Message received:', event.data);
  
  // Handle specific message types
  if (event.data.type === 'CACHE_NEW_ASSET') {
    // Cache a new asset that wasn't pre-cached
    caches.open(CACHE_NAME).then(cache => {
      cache.add(event.data.url);
    });
  }
});