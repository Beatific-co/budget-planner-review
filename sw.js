/* Budget Planner service worker. Caches the whole app on install so it opens offline afterwards.
   e3c3b4ff19 is replaced at build time with a hash of the app, so a new build becomes a new cache. */
const VERSION = 'e3c3b4ff19';
const CACHE = 'budget-planner-' + VERSION;
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('budget-planner-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = req.mode === 'navigate' ? './index.html' : req;
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) {
      // Refresh in the background when online; the next open gets the new file.
      e.waitUntil(fetch(req).then((res) => { if (res && res.ok) return cache.put(key, res.clone()); }).catch(() => {}));
      return hit;
    }
    try { const res = await fetch(req); if (res && res.ok) cache.put(req, res.clone()); return res; }
    catch (err) { return (await cache.match('./index.html')) || Response.error(); }
  })());
});
