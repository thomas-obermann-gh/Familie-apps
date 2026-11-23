/* Vorrat: hält die App auch ohne Netz startbar (z. B. im Keller).
   Eigene Dateien: erst Netz, sonst Zwischenspeicher. Bibliotheken vom CDN: Zwischenspeicher zuerst.
   Daten (Supabase) und Produktbilder werden nicht zwischengespeichert. */
const VERSION = "vorrat-v1";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const CDN = ["https://cdn.jsdelivr.net/npm/", "https://fastly.jsdelivr.net/npm/"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("vorrat-") && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function withTimeout(p, ms){
  return Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]);
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    e.respondWith(
      withTimeout(fetch(req), 4000)
        .then(res => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req, {ignoreSearch: true})
          .then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : Response.error())))
    );
    return;
  }

  if (CDN.some(p => req.url.startsWith(p))) {
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
