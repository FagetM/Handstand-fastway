// Service worker : l'app s'ouvre instantanément depuis l'appareil, même hors connexion (salle, parc…).
// Les fichiers de l'app sont mis en cache à l'installation ; chaque nouvelle version change CACHE, s'installe en arrière-plan
// puis attend que l'utilisateur accepte la mise à jour (ou ferme l'app), pour ne jamais couper une séance en cours.
const CACHE = "hs-fastway-v138", RUNTIME = "hs-runtime", SPRITES = "hs-sprites";
const CORE = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-mask-512.png",
  "fonts/nunito-latin.woff2", "avatar3d.js", "spr-worker.js", "vendor/three.module.min.js",
  "css/app.css", "js/data.js", "js/state.js", "js/parcours.js", "js/sprites.js", "js/views.js", "js/voice.js", "js/seance.js", "js/zen.js", "js/main.js"];

self.addEventListener("install", e => {
  // tout ou rien : si un seul fichier manque (réseau instable), la nouvelle version ne s'installe pas et l'ancienne reste entière
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, {cache:"reload"})))).catch(err => caches.delete(CACHE).then(() => { throw err; })));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== RUNTIME && k !== SPRITES).map(k => caches.delete(k))))
    // les copies de passage des fichiers de l'app sont purgées : jamais de mélange entre deux versions
    .then(() => caches.open(RUNTIME)).then(c => c.keys().then(ks => Promise.all(ks.filter(r => !new URL(r.url).pathname.includes("/programs/") && !new URL(r.url).pathname.includes("/anim/")).map(r => c.delete(r)))))
    .then(() => self.clients.claim()));
});
self.addEventListener("message", e => { if (e.data === "skip") self.skipWaiting(); });

self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  // programmes : toujours la dernière version si le réseau répond, sinon la copie gardée
  if (url.pathname.includes("/programs/")) {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)).catch(() => {}); return r; }).catch(() => caches.match(req)));
    return;
  }
  // fichiers de l'app : la copie de l'appareil d'abord (ouverture immédiate) ; le reste est gardé au premier passage
  const opt = {ignoreSearch:req.mode === "navigate"};
  e.respondWith(caches.open(CACHE).then(c => c.match(req, opt)).then(hit => hit || caches.open(RUNTIME).then(c => c.match(req, opt))).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(RUNTIME).then(c => c.put(req, copy)).catch(() => {}); }
    return r;
  }).catch(() => req.mode === "navigate" ? caches.open(CACHE).then(c => c.match("index.html")) : Response.error())));
});
