const CACHE = 'nancy-system-v8';
const FILES = [
  './', 'index.html', 'nancy.html', 'app.html', 'system.html', 'reports.html', 'ai.html',
  'upload.html', 'scanned-data.html', 'formulas.html', 'settings.html',
  'drinks.js', 'drinks.json', 'logo.png',
  'assets/fish4.jpg',
  'assets/fish3.jpg',
  'assets/fish2.jpg',
  'assets/fish1.jpg',
  'icon-192.png', 'icon-512.png', 'manifest.json'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(e.request, copy));
    return res;
  }).catch(() => caches.match('index.html'))));
});
