self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('nova-ide-v1').then((cache) =>
      cache.addAll([
        '/',
        '/dashboard',
        '/dashboard/projects/sample-project',
        '/manifest.webmanifest',
      ]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);
  const isDocument = event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isDocument) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/dashboard/projects/sample-project')),
    );
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const responseClone = networkResponse.clone();
          caches.open('nova-ide-v1').then((cache) => cache.put(event.request, responseClone));
          return networkResponse;
        })
        .catch(() => caches.match('/dashboard/projects/sample-project'));
    }),
  );
});
