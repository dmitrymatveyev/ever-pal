// EverPal Service Worker - Offline-First Caching Strategy
// Version 1.0

const CACHE_NAME = 'everpal-v2.0.3';
const API_CACHE_NAME = 'everpal-api-v2.0.3';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
];

// API endpoints that should be cached
const API_PATTERNS = [
  /\/api\/pets/,
  /\/api\/healthlogs/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );

  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control immediately
  return self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check if it's an API request
  const isApiRequest = API_PATTERNS.some(pattern => pattern.test(url.pathname));

  if (isApiRequest) {
    // Network-first strategy for API requests
    event.respondWith(
      networkFirstStrategy(request)
    );
  } else {
    // Cache-first strategy for static assets
    event.respondWith(
      cacheFirstStrategy(request)
    );
  }
});

/**
 * Network-first strategy: Try network, fall back to cache
 * Ideal for API requests where fresh data is preferred
 */
async function networkFirstStrategy(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try to fetch from network
    const networkResponse = await fetch(request);

    // Clone the response before caching (response can only be read once)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[Service Worker] Network failed, serving from cache:', request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback response
    return new Response(
      JSON.stringify({
        error: 'Offline - No cached data available',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Cache-first strategy: Try cache, fall back to network
 * Ideal for static assets that don't change often
 */
async function cacheFirstStrategy(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Failed to fetch:', request.url);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Generic error response
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});
