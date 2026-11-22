/* Service worker — Tetris VanBerto's. Rede primeiro para HTML/JS/CSS (como na Beach House), cache para offline. */
const CACHE = 'vb-tetris-v7';
const FONTS = ['nunito-latin-400','nunito-latin-700','nunito-latin-800','baloo-2-latin-700','baloo-2-latin-800','fredoka-one-latin-400','lexend-latin-400','lexend-latin-600'].map(f => 'fonts/' + f + '-normal.woff2');
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', ...FONTS];

self.addEventListener('install', e => {
  // um ficheiro em falta não deve impedir a instalação dos restantes (antes, addAll falhava tudo)
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(CORE.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (url.origin !== location.origin && !isFont) return;
  if (isFont) { // tipos de letra: cache primeiro, atualiza em segundo plano
    e.respondWith(caches.match(req).then(hit => {
      const net = fetch(req).then(r => { caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  e.respondWith(
    fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return r; })
      .catch(() => caches.match(req).then(hit => hit || caches.match('index.html')))
  );
});
