// Minimal service worker: enables PWA installability only.
// No caching of app shell, data, or navigation — everything is fetched from the network as usual.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // No-op: intentionally does not intercept or cache requests.
})
