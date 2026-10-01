// Offline support for the web version. Every file the game needs is cached on the first launch;
// later launches start from the cache at once and refresh it in the background, so updates show up on the next launch.
const CACHE = 'wavemadness-v1';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest', 'fonts/fonts.css',
  'fonts/unbounded-cyrillic-ext-wght-normal.woff2', 'fonts/unbounded-cyrillic-wght-normal.woff2',
  'fonts/unbounded-latin-ext-wght-normal.woff2', 'fonts/unbounded-latin-wght-normal.woff2',
  'fonts/nunito-cyrillic-ext-wght-normal.woff2', 'fonts/nunito-cyrillic-wght-normal.woff2',
  'fonts/nunito-latin-ext-wght-normal.woff2', 'fonts/nunito-latin-wght-normal.woff2',
  'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE)
    .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  // other projects live on the same origin, so only this game's old caches are removed
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('wavemadness-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  url.search = '';
  const key = url.href;
  const fresh = fetch(key, { cache: 'no-cache' }).then(async (res) => {
    if (res.ok && !res.redirected) await (await caches.open(CACHE)).put(key, res.clone());
    return res;
  });
  e.waitUntil(fresh.catch(() => {}));
  e.respondWith(caches.open(CACHE).then((c) => c.match(key)).then((hit) => hit || fresh));
});
