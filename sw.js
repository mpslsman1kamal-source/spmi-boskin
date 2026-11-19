/* SPMI BOSKIN 2026 — Service Worker
   • Cangkang aplikasi (HTML/CSS/JS/ikon) di-cache → terbuka instan & tetap tampil saat offline.
   • Panggilan API ke Google Apps Script TIDAK pernah di-cache/dicegat (data selalu segar, token aman).
   • Naikkan VERSI setiap kali Anda mengubah berkas frontend agar pengguna mendapat pembaruan. */
const VERSI = 'spmi-boskin-v1.1.2';
const SHELL = ['./', './index.html', './manifest.json', './css/app.css', './js/config.js', './js/icons.js', './js/core.js', './js/pages-1.js', './js/pages-2.js', './js/pages-admin.js', './js/pwa.js', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSI).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET') return;
  if (/script\.google(usercontent)?\.com$/.test(u.hostname)) return;                 // API: langsung ke jaringan
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (u.origin !== location.origin && !font) return;
  e.respondWith(caches.match(r, { ignoreSearch: false }).then(hit => {
    const jaringan = fetch(r).then(res => { if (res && res.ok) { const salin = res.clone(); caches.open(VERSI).then(c => c.put(r, salin)); } return res; }).catch(() => hit);
    return hit || jaringan;                                                           // stale-while-revalidate
  }));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
