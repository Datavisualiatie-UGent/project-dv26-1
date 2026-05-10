const CACHE_NAME = "talen-v1";

// Files to cache on install
const PRECACHE = [
    "./data/traditional/languages.geojson",
    "./data/contemporary/languages.geojson",
    "./js/d3.v7.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    // Clean up old caches when you bump CACHE_NAME
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    // Only cache GeoJSON requests
    if (!event.request.url.includes(".geojson")) return;

    event.respondWith(
        caches.match(event.request)
            .then(cached => {
                if (cached) return cached;

                // Not in cache yet — fetch, store, return
                return fetch(event.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, clone));
                    return response;
                });
            })
    );
});