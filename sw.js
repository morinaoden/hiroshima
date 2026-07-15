// Service Worker — 広島・宮島 旅のしおり
// キャッシュ対象のURLを変更したら CACHE_VERSION を上げること（例: v1 -> v2）。
// 古いバージョンのキャッシュは activate 時に自動削除される。
const CACHE_VERSION = "v1";
const CACHE_NAME = `hiroshima-shiori-${CACHE_VERSION}`;

// 自サイトの静的アセットのみ事前キャッシュ（相対パス。GitHub Pagesのサブパス配信に対応）
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/firebase-config.js",
  "./data/itinerary.json",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const isOwnOrigin = new URL(request.url).origin === self.location.origin;

  if (isOwnOrigin) {
    // 自サイトのアセット: stale-while-revalidate（即キャッシュを返し、裏で更新）
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
            }
            return response;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  } else {
    // 外部CDN（Leaflet・Googleフォント等）: network-first、失敗時はキャッシュ、それも無ければ諦める
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  }
});
