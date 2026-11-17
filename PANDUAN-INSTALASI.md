# Panduan Instalasi — SPMI BOSKIN 2026

Aplikasi ini terdiri dari **dua bagian terpisah**:

| Bagian | Isi | Dipasang di |
|---|---|---|
| **Backend** | 5 berkas `.gs` + `appsscript.json` | Google Apps Script (akun Google sekolah) |
| **Frontend** | `spmi-boskin-2026-frontend.zip` (`index.html`, `css/`, `js/`, …) | GitHub Pages |

Urutan wajib: **A. Backend → B. Hubungkan → C. Frontend → D. Percobaan pertama → E. Pasang di HP**.
Estimasi: 30–45 menit pertama kali.

---

## A. Pasang Backend (Google Apps Script)

Gunakan **akun Google milik sekolah** (bukan akun pribadi), karena database (Spreadsheet) dan berkas (Drive) akan tersimpan di akun ini.

1. Buka <https://script.google.com> → **New project** → ubah nama menjadi `SPMI BOSKIN 2026`.
2. Klik ikon **⚙ Project Settings** → centang **Show "appsscript.json" manifest file in editor**.
3. Kembali ke **Editor**. Buka `appsscript.json`, **hapus isinya**, tempel isi berkas `appsscript.json` dari saya.
4. Buat 5 berkas skrip dengan nama **persis** berikut (tanpa `.gs`; tombol **+ → Script**). Untuk setiap berkas, hapus isi bawaan lalu tempel isi dari saya:
   `Kode` · `Domain` · `Laporan` · `Notifikasi` · `Migrasi`
   (berkas `Code.gs` bawaan: ubah namanya jadi `Kode`, atau hapus setelah `Kode` dibuat.)
5. Klik **💾 Simpan**.
6. Pilih fungsi **`setupAppEnvironment`** di menu dropdown atas → **▶ Run**.
   - Muncul "Authorization required" → **Review permissions** → pilih akun → **Advanced** → **Go to SPMI BOSKIN 2026 (unsafe)** → **Allow**. (Peringatan ini normal untuk skrip buatan sendiri.)
7. Buka **Execution log**. Anda akan melihat dua baris penting — **catat sekarang, hanya tampil sekali**:
   ```
   🔐 AKSES DARURAT : darurat / ••••••••••••••••
   👤 AKUN ADMIN AWAL: admin / ••••••••••••
   ```
   Simpan di pengelola kata sandi. Setup juga membuat Spreadsheet database, folder Drive, dan 2 trigger otomatis.
8. **Deploy** → **New deployment** → ikon ⚙ → **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - **Deploy** → **salin Web app URL** (berakhiran `/exec`).

> "Anyone" tidak berarti data terbuka: semua data hanya keluar setelah login dengan token sesi yang ditandatangani server.

**Setup aman diulang.** Menjalankan `setupAppEnvironment` kedua kali tidak menggandakan data dan tidak mengganti sandi.

---

## B. Hubungkan frontend ke backend

Di folder hasil ekstrak ZIP, buka **`js/config.js`** dengan Notepad dan ganti:

```js
API_URL: 'GANTI_DENGAN_URL_EXEC_APPS_SCRIPT',
```
menjadi URL `/exec` Anda. Simpan. (URL ini bukan rahasia; **jangan** menaruh sandi/token di berkas ini.)

---

## C. Pasang Frontend di GitHub Pages

> **Folder yang di-`git init` adalah folder hasil ekstrak ZIP itu sendiri** — folder yang langsung berisi `index.html`. Jangan masuk lebih dalam, jangan naik satu level.
> **Jangan** memakai "Add file → Upload files" di web GitHub: itu meratakan folder `css/` dan `js/` sehingga situs rusak.

1. Buat akun di <https://github.com> dan install Git dari <https://git-scm.com/downloads>.
2. Di GitHub: **New repository** → nama `spmi-boskin-2026` → **Public** → *tanpa* README → **Create**.
3. Ekstrak ZIP ke, misalnya, `C:\spmi-boskin-2026`. Buka **Command Prompt**:
   ```
   cd C:\spmi-boskin-2026
   dir
   ```
   **Gerbang wajib:** daftar teratas harus menampilkan `index.html`, `css`, `js`. Jika tidak, Anda di folder yang salah — jangan lanjut.
4. Jalankan satu per satu (ganti `USERNAME`):
   ```
   git init
   git add .
   git commit -m "SPMI BOSKIN 2026 v1.0.0"
   git branch -M main
   git remote add origin https://github.com/USERNAME/spmi-boskin-2026.git
   git push -u origin main
   ```
   Saat diminta *password*, tempel **Personal Access Token**: GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Generate → centang `repo` → salin token.
5. Di repository: **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
6. Tunggu 1–3 menit. Alamat aplikasi: `https://USERNAME.github.io/spmi-boskin-2026/`

**Memperbarui nanti:** ubah berkas → `git add .` → `git commit -m "pembaruan"` → `git push`. Setelah mengubah berkas frontend, naikkan angka `VERSI` di `sw.js` (mis. `v1.0.1`) agar HP pengguna ikut diperbarui.

**Memperbarui backend:** ubah kode di Apps Script → **Deploy → Manage deployments → ✏ → Version: New version → Deploy**. (URL `/exec` tidak berubah.)

---

## D. Percobaan pertama (checklist)

Buka alamat aplikasi, lalu:

- [ ] Login `admin` + sandi dari log → dashboard tampil (kosong adalah normal).
- [ ] **Pengguna & Pengaturan → Sekolah & siklus**: isi nama sekolah, alamat, periode, tanggal batas monev. Simpan.
- [ ] **Akun & hak akses → Tambah pengguna**: buat 1 akun uji (peran *Pengguna*). Catat sandi awal yang tampil.
- [ ] **Pemetaan Mutu → Tambah data mutu**: isi 1–2 aspek → grafik dashboard muncul.
- [ ] **SK & Tim**: unggah 1 PDF SK → status berubah *Terunggah*.
- [ ] Login di jendela lain sebagai akun uji → menu Admin **tidak** terlihat.
- [ ] **Laporan PDF → Buat laporan** → PDF terunduh dan masuk folder Drive *Laporan PDF*.
- [ ] **Berkas → Unggah foto** dari HP → muncul di daftar.

> ⚠ **Penting:** seluruh logika backend sudah diuji dengan simulator (93 skenario) dan frontend dengan peramban nyata terhadap simulator itu, **tetapi belum pernah dijalankan di Google Apps Script/Drive/Fonnte sungguhan.** Checklist di atas adalah uji nyata pertama — laporkan jika ada yang gagal.

---

## E. WhatsApp (Fonnte) — opsional, bawaan MATI

1. Daftar di <https://fonnte.com>, hubungkan nomor WA sekolah, salin **token**.
2. **Pengguna & Pengaturan → WhatsApp & notifikasi**: tempel token (disimpan di server, tak pernah ditampilkan lagi) → **Kirim uji** ke nomor Anda → bila masuk, centang **Aktifkan notifikasi WhatsApp** → Simpan.
3. Isi **URL aplikasi** (alamat GitHub Pages) agar `{link}` di pesan berfungsi.
4. Atur kejadian mana yang mengirim pesan di **Matriks notifikasi**.
5. Pengingat monev: isi tanggal batas di **Sekolah & siklus**; sistem mengirim otomatis pukul 07.00 pada H-3, H-1, dan hari-H (dapat diubah).

Pesan dikirim lewat **antrean** (menu *WhatsApp & CRM → Antrean*), diproses tiap menit oleh trigger. Blast massal dikirim per batch 10/20/50 dengan jeda; nomor yang tidak terdaftar WA dan yang *opt-out* otomatis dilewati.

> Gunakan WhatsApp hanya untuk pesan dinas ke warga sekolah yang berkepentingan. Pengiriman massal berlebihan berisiko nomor diblokir WhatsApp.

---

## F. Pasang di HP (PWA)

- **Android (Chrome):** buka alamat aplikasi → ketuk **Pasang aplikasi** (di layar login/menu) atau menu ⋮ → *Instal aplikasi*.
- **iPhone (Safari):** ketuk **Bagikan** → **Tambah ke Layar Utama** → **Tambah**.

Aplikasi terbuka layar penuh dengan ikon sendiri. Saat offline, data terakhir tetap terlihat (hanya baca); menyimpan butuh internet.

---

## G. Jika ada masalah

| Gejala | Penyebab | Solusi |
|---|---|---|
| Halaman GitHub 404 | `index.html` tidak di root repo | Lihat repo di browser: harus ada `index.html` di daftar teratas. Jika ada folder `frontend/`, Anda salah folder saat `git init` — ulangi dari folder yang benar |
| Tampil tanpa gaya/rusak | Folder `css/` `js/` rata/hilang | Ulangi push dari terminal (bukan Upload files) |
| "Aplikasi belum dikonfigurasi" | `API_URL` belum diisi | Langkah B |
| "Koneksi ke server gagal" | Deploy belum "Anyone", atau URL salah | Deploy ulang web app; cek URL berakhiran `/exec` |
| Perubahan backend tak berlaku | Belum membuat *New version* | Manage deployments → New version |
| Lupa sandi admin | — | Editor Apps Script → jalankan `resetSandiAdmin` (isi `'admin'`) atau masuk dengan akun `darurat`; sandi baru muncul di log |
| Lupa sandi darurat | — | Jalankan `resetAksesDarurat` |
| "Terlalu banyak percobaan" | 5× salah sandi | Tunggu 15 menit atau Admin reset sandi |
| WA tidak terkirim | Token/saklar/trigger | Cek *Integrasi* (token, saklar), *Antrean* (alasan gagal), dan trigger `tickPekerja` aktif |
| Hemat kuota trigger | KeepWarm memakai ±10–20 mnt/hari | Jalankan `matikanKeepWarm()` (aplikasi tetap jalan; login pertama bisa lebih lambat) |

---

## H. Keamanan — ringkas

- Sandi di-hash (HMAC-SHA256 ×300 + salt); token sesi bertanda tangan, berlaku 60 menit sejak aktivitas terakhir; 5× salah sandi mengunci 15 menit.
- Token Fonnte & rahasia sesi **hanya** di *Script Properties*; tidak pernah ada di Sheet, kode frontend, atau log.
- Hak akses diperiksa di **server** pada setiap aksi; berkas Drive tetap privat dan diunduh lewat server.
- Setiap tambah/ubah/hapus tercatat di **Log audit** (sandi/token disamarkan).
- Rutin: **Sistem & data → Cadangkan spreadsheet**.
