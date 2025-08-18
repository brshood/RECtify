// Minimal service worker to enable PWA installability
// Caches can be added later for offline support

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch; customize later for offline caching
self.addEventListener('fetch', () => {
  // Intentionally left blank to keep network default behavior
});


