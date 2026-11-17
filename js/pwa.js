/* SPMI BOSKIN 2026 — pwa.js : service worker, tombol "Pasang aplikasi", lalu mulai aplikasi */
(function () {
  'use strict';
  var A = window.App, deferred = null;
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  var ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  function tombol() {
    if (standalone) return;
    var tampil = !!deferred || ios;
    ['#lg-install', '#side-install'].forEach(function (s) { var b = document.querySelector(s); if (b) b.classList.toggle('hide', !tampil); });
    var l = document.querySelector('#lg-install'); if (l && !l.innerHTML) l.innerHTML = ic('install_desktop') + ' Pasang aplikasi di perangkat ini';
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; tombol(); });
  window.addEventListener('appinstalled', function () { deferred = null; standalone = true; tombol(); A.toast('Aplikasi terpasang di perangkat Anda.', 'ok'); });
  A.acts.install = function () {
    if (deferred) { deferred.prompt(); deferred.userChoice.finally(function () { deferred = null; tombol(); }); return; }
    A.modal({ title: 'Pasang aplikasi', size: 'sm', foot: '<button class="btn primary" data-close>Mengerti</button>', body: ios
      ? '<ol class="small" style="margin:0;padding-left:20px;line-height:28px"><li>Buka halaman ini di <b>Safari</b>.</li><li>Ketuk tombol <b>Bagikan</b> (kotak dengan panah ke atas).</li><li>Pilih <b>Tambah ke Layar Utama</b>.</li><li>Ketuk <b>Tambah</b>.</li></ol>'
      : '<p class="small">Gunakan menu browser (⋮) lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>.</p>' });
  };
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        reg.addEventListener('updatefound', function () { var w = reg.installing; if (w) w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) A.toast('Versi baru tersedia. Muat ulang untuk memperbarui.', 'warn'); }); });
      }).catch(function () { /* PWA opsional */ });
    });
  }
  tombol();
  A.start();
})();
