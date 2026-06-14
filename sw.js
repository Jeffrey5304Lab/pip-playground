/* sw.js — offline cache (stale-while-revalidate) for Pip's Playground. */
const CACHE = "pip-v8";
const ASSETS = [
  "./", "./index.html", "./styles.css", "./manifest.webmanifest",
  "./src/app.js", "./src/audio.js", "./src/mascot.js", "./src/confetti.js", "./src/art.js",
  "./src/progress.js",
  "./src/games/colors.js", "./src/games/shapes.js",
  "./src/games/counting.js", "./src/games/animals.js",
  "./src/games/letters.js", "./src/games/words.js", "./src/games/patterns.js",
  "./icons/icon.svg", "./audio/manifest.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === "basic") {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
