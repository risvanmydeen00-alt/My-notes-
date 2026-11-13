
const CACHE_NAME = "my-notes-v6";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(function(names) {
            return Promise.all(
                names
                    .filter(function(name) {
                        return name !== CACHE_NAME;
                    })
                    .map(function(name) {
                        return caches.delete(name);
                    })
            );
        }).then(function() {
            return clients.claim();
        })
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.method !== "GET") return;

    if (event.request.mode === "navigate" ||
        event.request.url.endsWith("/index.html")) {

        event.respondWith(
            fetch(event.request, { cache: "no-store" })
                .then(function(response) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put("./index.html", copy);
                    });
                    return response;
                })
                .catch(function() {
                    return caches.match("./index.html");
                })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});
