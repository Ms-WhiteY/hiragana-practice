importScripts('./app-version.js');

const CACHE_PREFIX = 'hiragana-practice-';
const CACHE = `${CACHE_PREFIX}v${self.APP_VERSION}`;
const ASSETS = ['./','./index.html','./app-version.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./assets/hanamaru.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith(CACHE_PREFIX) && k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(new Request(event.request, {cache: 'no-store'})).then(response => {
        if (!response.ok) return response;
        const copy = response.clone();
        return caches.open(CACHE).then(cache => cache.put('./index.html', copy)).then(() => response);
      }).catch(() => caches.open(CACHE).then(cache => cache.match('./index.html')))
    );
    return;
  }

  if (requestUrl.origin === self.location.origin && requestUrl.pathname.endsWith('/app-version.js')) {
    event.respondWith(
      fetch(new Request(event.request, {cache: 'no-store'})).then(response => {
        if (!response.ok) return response;
        const copy = response.clone();
        return caches.open(CACHE).then(cache => cache.put(event.request, copy)).then(() => response);
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
