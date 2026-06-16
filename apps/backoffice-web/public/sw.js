// SSTiPOS Support does not use an offline shell.
// This self-removing worker cleans up older POS Preview service workers that
// cached "/" and could leave the Support domain stuck on a blank loading page.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .catch(() => undefined)
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => Promise.all(clients.map((client) => client.navigate(client.url))))
      .catch(() => undefined)
  );
});

self.addEventListener("fetch", () => {
  return;
});
