// Service Worker Version (update this to force cache refresh)
const CACHE_VERSION = 'v1';
const CACHE_NAME = `dailynewsv-cache-${CACHE_VERSION}`;

// Files to cache (essential assets)
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/logo.jpg',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css?family=Segoe+UI'
];

// ===== INSTALL EVENT =====
// Caches essential files when SW is installed
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching core assets');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE EVENT =====
// Clears old caches when a new SW version is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Clearing old cache');
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// ===== FETCH EVENT =====
// Serves cached files when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests (like POST)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached file if found
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((response) => {
            // Clone the response to cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // Fallback for failed requests (e.g., offline)
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html'); // Optional: Create an offline page
            }
          });
      })
  );
});
