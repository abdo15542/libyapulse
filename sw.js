/* Libya Pulse — Service Worker (libyapulse-v1) */
var CACHE = 'libyapulse-v1';
var HOME = './';
var SHELL = ["./", "assets/style.css", "assets/site.js", "https://abdo15542.github.io/wamdalibya/assets/logo.png"];
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(SHELL.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});
self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  var url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function (resp) {
        if (resp && resp.ok) {
          var copy = resp.clone();
          caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
        }
        return resp;
      }).catch(function () {
        return caches.match(HOME).then(function (r) { return r || caches.match(event.request); });
      })
    );
    return;
  }
  if (url.pathname.indexOf('/assets/') !== -1 || url.pathname.indexOf('/images/') !== -1) {
    event.respondWith(
      caches.match(event.request).then(function (cached) {
        var network = fetch(event.request).then(function (resp) {
          if (resp && resp.ok) {
            var copy = resp.clone();
            caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
          }
          return resp;
        }).catch(function () { return cached; });
        return cached || network;
      })
    );
  }
});
