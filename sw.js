/* Kill switch. The review site no longer ships a service worker (the install/PWA build was removed).
   Any browser that still has the old worker picks this one up, which clears the old caches,
   unregisters itself and reloads open tabs so they fetch the live file. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
