# DESIGN-SYNC — SPMI BOSKIN 2026

Hasil sinkronisasi **ZIP Stitch (15 folder: `code.html` + `screen.png`)** × **PRD Final**.
Semua folder dibuka satu per satu; `code.html` dibaca (token Tailwind, struktur, label), PNG dicocokkan secara visual.

## 1. Temuan utama

ZIP ini adalah **wireframe monokrom** (hitam/abu, label teknis seperti `WF_SPEC`, `SYS_ID`, `MOD_01`), bukan UI berwarna.
PRD §7.1 meminta **biru tua solid + emas + hijau/oranye/merah untuk status**. Keduanya dipertemukan begini:

| Aspek | Sumber | Keputusan |
|---|---|---|
| Layout, urutan menu, komponen, isi halaman, alur | ZIP | Diikuti persis |
| Skala tipografi, spacing, radius, token netral | ZIP (`tailwind.config` w_02–w_15) | Dipakai apa adanya |
| **Palet warna** | PRD §7.1 (ZIP tidak punya warna) | **Diturunkan** — HEX dipilih & diuji kontras (lihat §2) |
| Label teknis wireframe (`SEC_01 //`, `DOC_COUNT`, `WF_SPEC`…) | ZIP | **Tidak ditampilkan** — perancah wireframe, bukan isi produk |
| Garis hitam 1px + bayangan keras (gaya blueprint) | ZIP | Dilunakkan: garis `outline-variant`, radius ZIP, tanpa bayangan keras (PRD: "sudut membulat, banyak ruang kosong") |

## 2. Token desain final

| Token | Nilai | Asal |
|---|---|---|
| `--surface` / `--background` | `#f9f9f9` | ZIP |
| `--surface-low` / `--surface-container` | `#f3f3f3` / `#eeeeee` | ZIP |
| `--surface-lowest` (kartu) | `#ffffff` | ZIP |
| `--outline` / `--outline-variant` | `#747878` / `#c4c7c7` | ZIP |
| `--on-surface` / `--on-surface-variant` | `#1a1c1c` / `#444748` | ZIP |
| `--error` | `#ba1a1a` | ZIP (token `error`) |
| `--primary` (biru tua) | `#0B3A8F` (putih 10,4:1) | **PRD, diturunkan** |
| `--primary-hover` | `#082C6E` | diturunkan |
| `--accent` (emas) | `#F2B01E` (hanya dengan teks `#1a1c1c`, 9:1) | **PRD, diturunkan** |
| `--ok` hijau | `#1E7B3A` (putih 5,3:1) | PRD, diturunkan |
| `--warn` oranye | `#B45309` (putih 5,0:1) | PRD, diturunkan |
| `--bad` merah | `#BA1A1A` | ZIP + PRD |
| Radius | `4px` / `8px` / `12px` / `9999px` | ZIP |
| Spacing | 4 · 8 · 16 · 24 · 32 · 40 · margin 48 (desktop) / 16 (mobile) | ZIP |
| Font judul | Space Grotesk 600/700 | ZIP (w_02–w_15) |
| Font isi | Geist 400/500/600 | ZIP |
| Font label/angka | JetBrains Mono 400/500 | ZIP |
| Ikon | Material Symbols Outlined (subset SVG inline) | ZIP |

Skala huruf ZIP: headline-xl 48/56, headline-lg 36/44, headline-md 24/32, headline-sm 20/28, body-lg 18/28, body-md 16/24, body-sm 14/20, label-lg 14/20, label-md 12/16, label-sm 11/14.

## 3. Peta halaman PRD ↔ folder ZIP

| # | Halaman PRD (§7.2) | Folder ZIP | Status |
|---|---|---|---|
| 1 | Login | `w_01_login_screen` | **sinkron** (font w_01 berbeda → diseragamkan, lihat §4) |
| 2 | Dashboard | `w_02_dashboard`, `w_13_dashboard_mobile_frame` | **sinkron** (desktop + mobile) |
| 3 | Data SK & Tim TPMPS | `w_03_data_sk_tim_tpmps` | **sinkron** |
| 4 | Pemetaan Mutu | `w_04_pemetaan_mutu` | **sinkron** |
| 5 | Penetapan Prioritas | `w_05_penetapan_prioritas` | **sinkron** |
| 6 | Program RTL & Kegiatan | `w_06_program_rtl`, `w_07_detail_program_kegiatan` | **sinkron** |
| 7 | Monev & Refleksi | `w_08_form_monev_refleksi`, `w_14_form_monev_refleksi_mobile_frame` | **sinkron** |
| 8 | Berkas | `w_09_manajemen_berkas_bukti_fisik`, `w_15_…_mobile_frame`, `w_15_…_interactive_mobile` | **sinkron** (varian `interactive` = keadaan panel unggah terbuka + progres) |
| 9 | Laporan PDF | `w_10_laporan_ekspor_pdf` | **sinkron** |
| 10 | Kelola Pengguna & Pengaturan | `w_11_kelola_pengguna_pengaturan_admin` | **sinkron** |
| — | Login versi mobile | *(tidak ada; penomoran `w_12` hilang dari ZIP)* | **diturunkan** dari w_01 + pola mobile w_13 |
| — | WhatsApp & Notifikasi (blast, antrean, matriks) | — | **diturunkan** (diminta user via `/gas-notifikasi-wa-crm`) |
| — | CRM Kontak | — | **diturunkan** (diwajibkan skill notifikasi) |
| — | Import Data (migrasi) | — | **diturunkan** (diminta user via `/gas-migrasi-database`) |
| — | Audit Log | tab 5 di w_11 | **sinkron** |

Pola mobile (w_13–w_15): app bar atas (menu, judul, lonceng, avatar) + **bottom nav 4 tab** (Beranda · RTL/Monev · Berkas · Akun); panel unggah cepat dengan **kamera / galeri / PDF**; kartu berkas dengan tombol aksi.

## 4. Ketidaksesuaian & keputusan

| # | Ketidaksesuaian | Keputusan |
|---|---|---|
| 1 | ZIP monokrom vs PRD berwarna | Lihat §1–2. Mudah diubah: semua warna ada di satu blok `:root` di `css/app.css`. |
| 2 | Login memakai Space Grotesk + Space Mono + palet `wire.*`; halaman lain memakai Geist + JetBrains Mono | Seluruh app memakai satu sistem (Space Grotesk / Geist / JetBrains Mono). |
| 3 | PNG tampil font serif; `code.html` memakai Geist/Space Grotesk | PNG dirender tanpa font web; **`code.html` diikuti** (lebih presisi). |
| 4 | **Ambang kategori**: Pemetaan memakai ≥85 / ≥80 / ≥70 / <70 (4 level); Monev memakai ≥85 / 70–84,9 / 50–69,9 / <50; PRD: "<80% = Perlu Peningkatan" dan "angka resmi perlu dicek ulang" | Ambang **dapat diatur Admin** (Pengaturan → tab Ambang). Bawaan: Pemetaan 85/80/70, Monev 85/70/50. Label disatukan dengan PRD: **Sangat Baik · Baik · Perlu Peningkatan · Perlu Perhatian Khusus** (label "Cukup"/"Perlu Intervensi" di wireframe tidak dipakai). **Angka resmi Rapor Pendidikan harus Anda cek.** |
| 5 | Wireframe memuat **anggaran** (pagu, realisasi SPJ) di Program/Kegiatan; PRD tidak memasukkannya ke sheet | Ditambahkan sebagai kolom **opsional** (`anggaran`, `realisasi`) — dapat dikosongkan. |
| 6 | Wireframe memuat peran ke-3 **Validator Eksternal/Pengawas** (baca-saja); PRD hanya Admin & Pengguna | Ditambahkan sebagai peran baca-saja. Jika tidak diperlukan, tidak perlu dibuat akunnya. |
| 7 | Nama 7 program di wireframe berbeda-beda antar halaman (mis. "Modul Literasi Terpadu") | **Seed PRD dipakai** (Pemetaan dan Analisis Mutu … Penyusunan Rekomendasi dan Tindak Lanjut). Angka/nama di wireframe adalah contoh. |
| 8 | Skor prioritas contoh di wireframe (95; 92,5; 82,5; 74; 45) tidak cocok dengan bobot 35/30/20/15 | Skor = jumlah bobot kriteria yang terpenuhi. Skala P1 ≥90 · P2 80–89 · P3 70–79 · P4 <70 (dari wireframe). Bobot dapat diatur. |
| 9 | Folder Drive: PRD = `SK/`, `Foto Kegiatan/`, `Laporan PDF/`; wireframe = 4 folder bernomor (+ Instrumen Monev) | Struktur PRD dipakai + `Bukti Lainnya/` (notula & SPJ) dan `Instrumen Monev/`. |
| 10 | Dashboard wireframe: "Monev Bulan Ini: 12 sesi, target 15" | Target bulanan = `MONEV_TARGET_BULAN` di Pengaturan (bawaan = jumlah program, 7). |
| 12 | Login wireframe memuat pemilih "Target peran: Admin/KS vs Pengguna/Guru" | **Tidak dibuat.** Peran ditentukan oleh akun di server; pemilih di layar login hanya menyesatkan dan bisa dimanipulasi. |
| 11 | Form monev wireframe memuat 3 "tab" dalam satu halaman, mobile memuat 4 seksi | Satu halaman dengan 3 tab (Capaian · Refleksi · Riwayat) di semua ukuran layar. |

## 5. Komponen berulang (dibuat sekali)

AppShell (sidebar + topbar + bottom-nav) · KpiCard · StatusBadge (4 kategori) · ProgressBar · DataTable (cari/filter/urut/halaman, lokal) · Modal/Drawer form · Tabs · BarChart (vertikal + ambang) · HBar (progres) · LineChart · UploadZone (kamera/galeri/PDF, kompres klien) · FileCard · Toast · EmptyState · Skeleton.

## 6. Bukti visual yang diperiksa
15/15 `code.html` dibaca; 15/15 PNG dibuka (dashboard dan login satu per satu; sisanya dalam montase per kelompok).

## 7. Catatan alat
`/ui-ux-pro-max`: direktori skill hanya berisi `SKILL.md` (tanpa `search.py`/database), sehingga pencarian palet/font tidak dijalankan. Yang dipakai: tabel prioritas di SKILL.md (kontras ≥ 4,5:1, target sentuh ≥ 44 px, animasi 150–300 ms, ikon SVG bukan emoji, `prefers-reduced-motion`). Font memakai sistem desain dari ZIP.
