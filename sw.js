/* Service Worker for Offline Caching */
const CACHE_NAME = 'kcs-pwa-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/variables.css',
  './css/main.css',
  './css/components.css',
  './css/pdf-extraction.css',
  './data/songs.json',
  './js/store.js',
  './js/search.js',
  './js/chord-transposer.js',
  './js/player.js',
  './js/router.js',
  './js/app.js',
  './img/logo.png',
  './icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
