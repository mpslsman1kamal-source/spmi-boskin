/* SPMI BOSKIN 2026 — pages-1.js : Dashboard · SK & Tim · Pemetaan Mutu · Penetapan Prioritas */
(function () {
'use strict';
const A = window.App, { $, $$, esc, num, dateID, rp, fsize, Sel, badge, badgeKat, bar, kpi, head, field, selOpts, modal, toast, busy, formData, empty, api } = A;
const kat = A.kat, KT = A.KT, KCOL = A.KCOL;
const write = (btn, action, data, okMsg) => busy(btn, () => api(action, data, { write: true })).then(r => { r.success ? toast(okMsg || r.message || 'Tersimpan', 'ok') : toast(r.message, 'bad'); return r; });
A.write = write;
const katalog = () => String(Sel.set('KATALOG_ASPEK')).split('\n').map(l => l.split('|')).filter(a => a[0] && a[1]).map(a => ({ kode: a[0].trim(), aspek: a[1].trim(), domain: (a[2] || '').trim(), standar: (a[3] || '').trim() }));
const mutuPer = per => A.d.mutu.filter(m => m.periode === per);
function periodePilihan(act, cur) { return `<select class="select" style="width:auto;min-height:40px" data-chg="${act}" aria-label="Periode">${selOpts(Sel.periodes(), cur)}</select>`; }

// =============================================================== DASHBOARD
A.page('dashboard', { render(el) {
  const d = A.d, tulis = Sel.tulis(), ambM = Sel.ambM(), progs = Sel.programs();
  const skOk = d.sk.filter(s => s.status === 'terunggah').length, skN = d.sk.length || 8;
  const rata = progs.length ? Math.round(progs.reduce((a, p) => a + (+p.progres || 0), 0) / progs.length) : 0;
  const bln = Sel.bulanIni(), monevBln = d.monev.filter(m => String(m.tanggal).slice(0, 7) === bln).length, target = +Sel.set('MONEV_TARGET_BULAN') || progs.length || 7;
  const perhatian = progs.filter(p => p.status === 'Perlu Perhatian');
  let per = Sel.periodeAktif(), rows = mutuPer(per); if (!rows.length) { const ada = Sel.periodes().find(p => mutuPer(p).length); if (ada) { per = ada; rows = mutuPer(ada); } }
  rows = rows.slice().sort((a, b) => String(a.kode).localeCompare(String(b.kode)));
  const items = rows.map(r => ({ code: r.kode, label: r.aspek, val: +r.capaian, color: KCOL[KT[kat(+r.capaian, ambM)]] || 'var(--primary)' }));
  const keg = d.kegiatan.slice().sort((a, b) => String(b.dibuat || b.tanggal).localeCompare(String(a.dibuat || a.tanggal))).slice(0, 5);
  const jadwal = Sel.set('MONEV_JADWAL').split(/\s+/).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).filter(x => x >= A.today()).sort().slice(0, 4);
  const waOn = Sel.set('NOTIF_WA_AKTIF') === 'YA';
  el.innerHTML = head('Dashboard', 'Ringkasan Mutu', `${Sel.set('NAMA_SEKOLAH')} · ${Sel.periodeAktif()}`,
    tulis ? `<a class="btn primary" href="#/monev">${ic('add')} Entri Monev</a><a class="btn" href="#/berkas">${ic('cloud_upload')} Unggah Bukti</a><a class="btn" href="#/laporan">${ic('picture_as_pdf')} Unduh PDF</a>` : '') +
  `<div class="grid g4" style="margin-bottom:24px">
    ${kpi('SK terunggah', `${skOk}<small>/${skN}</small>`, bar(skOk / skN * 100, skOk === skN ? 'ok' : ''), badge(Math.round(skOk / skN * 100) + '% lengkap', skOk === skN ? 'ok' : 'warn'))}
    ${kpi('Rata-rata progres RTL', `${rata}<small>%</small>`, bar(rata), badge(rata >= 100 ? 'Selesai' : rata ? 'Berjalan' : 'Belum mulai', rata >= 100 ? 'ok' : rata ? 'info' : 'mute'))}
    ${kpi('Monev bulan ini', `${monevBln}<small> sesi</small>`, bar(monevBln / target * 100) + `<div class="xs muted" style="margin-top:4px">Target ${target} · sisa ${Math.max(0, target - monevBln)}</div>`)}
    ${kpi('Program perlu perhatian', `${perhatian.length}<small> item</small>`, perhatian.length ? esc(perhatian.map(p => 'P' + p.kode).join(', ')) : 'Semua program terpantau', perhatian.length ? badge('Prioritas', 'bad') : badge('Aman', 'ok'))}
  </div>
  <div class="grid g-main" style="margin-bottom:24px">
    <div class="card"><div class="card-h" style="margin:-24px -24px 0"><h3>${ic('bar_chart')} Capaian per aspek mutu</h3><span class="badge b-mute">${esc(per)}</span></div>
      ${items.length ? A.barChart(items, ambM[1]) + `<div class="legend" style="margin-top:16px"><span><i style="background:var(--ok)"></i>Baik / Sangat Baik</span><span><i style="background:var(--warn)"></i>Perlu Peningkatan</span><span><i style="background:var(--bad)"></i>Perhatian Khusus</span><span><i style="background:transparent;border-top:2px dashed var(--bad);height:0;width:16px"></i>Ambang ${ambM[1]}%</span></div>` : empty('bar_chart', 'Belum ada data pemetaan mutu', Sel.admin() ? 'Admin dapat menambahkan di menu Pemetaan Mutu.' : 'Menunggu Admin mengisi data Rapor Pendidikan.')}</div>
    <div class="card"><div class="card-h" style="margin:-24px -24px 16px"><h3>${ic('trending_up')} Progres 7 program RTL</h3></div><div class="stack">${progs.map(p => `<a href="#/rtl/${p.kode}" style="text-decoration:none;color:inherit" class="hb"><div class="t"><span>${esc(p.kode)} · ${esc(p.nama)} ${p.status === 'Perlu Perhatian' ? badge('Perhatian', 'bad') : ''}</span><b>${+p.progres || 0}%</b></div>${bar(p.progres, p.status === 'Perlu Perhatian' ? 'bad' : '')}</a>`).join('')}</div></div>
  </div>
  <div class="grid g-main">
    <div class="card flat"><div class="card-h"><h3>${ic('history')} Kegiatan terbaru</h3><a class="btn sm" href="#/rtl">Lihat semua</a></div>
      ${keg.length ? `<div class="twrap"><table><thead><tr><th>Kegiatan</th><th class="hide-m">Program</th><th class="hide-m">Pelaksana</th><th>Status</th></tr></thead><tbody>${keg.map(k => `<tr><td><b>${esc(k.nama)}</b><div class="sub">${dateID(k.tanggal)}</div></td><td class="hide-m">P${esc(k.program_kode)}</td><td class="hide-m">${esc(k.pelaksana)}</td><td>${badge(k.status)}</td></tr>`).join('')}</tbody></table></div>` : empty('assignment', 'Belum ada kegiatan', 'Kegiatan RTL ditambahkan dari menu Program RTL.')}</div>
    <div class="card"><div class="card-h" style="margin:-24px -24px 16px"><h3>${ic('event')} Pengingat monev mendatang</h3>${badge(waOn ? 'WA aktif' : 'WA nonaktif', waOn ? 'ok' : 'mute')}</div>
      ${jadwal.length ? `<div class="stack">${jadwal.map(t => { const n = Math.round((new Date(t) - new Date(A.today())) / 864e5); return `<div class="rem"><div class="row between"><b>${dateID(t)}</b>${badge(n === 0 ? 'Hari ini' : 'H-' + n, n <= 1 ? 'bad' : n <= 3 ? 'warn' : 'info')}</div><span class="small muted">Batas akhir pengisian monev</span></div>`; }).join('')}</div>` : empty('event', 'Belum ada jadwal', Sel.admin() ? 'Atur jadwal di Pengguna & Pengaturan → Sekolah & Siklus.' : 'Jadwal diatur oleh Admin.')}
      ${Sel.admin() ? `<a class="btn sm" href="#/wa" style="margin-top:16px;width:100%">${ic('send')} Kirim uji notifikasi</a>` : ''}</div>
  </div>`;
} });

// =============================================================== SK & TIM
A.tab.sk = A.tab.sk || 'sk';
const STATUS_SK = [{ v: 'terunggah', l: 'Terunggah' }, { v: 'belum', l: 'Belum ada berkas' }];
A.page('sk', { render(el) {
  const d = A.d, adm = Sel.admin(), skOk = d.sk.filter(s => s.status === 'terunggah').length, pokja = new Set(d.tim.map(t => t.pokja).filter(Boolean)).size, waOn = Sel.set('NOTIF_WA_AKTIF') === 'YA';
  el.innerHTML = head('Data SK & Tim', 'SK & Tim TPMPS', 'Dokumen SK dan struktur Tim Pengembang Mutu Pendidikan Sekolah.', adm ? `<button class="btn" data-act="tim-form">${ic('person_add')} Tambah anggota</button>` : '') +
  `<div class="grid g4" style="margin-bottom:24px">${kpi('Kelengkapan SK', `${skOk}<small>/${d.sk.length}</small>`, bar(skOk / (d.sk.length || 1) * 100, skOk === d.sk.length ? 'ok' : ''))}${kpi('Personel tim', d.tim.length, 'Anggota TPMPS terdaftar')}${kpi('Kelompok kerja', pokja, 'Pokja aktif')}${kpi('Gateway notifikasi', waOn ? 'Aktif' : 'Mati', waOn ? 'Pengingat dikirim via WhatsApp' : 'Aktifkan di Pengaturan')}</div>
  <div class="tabs" role="tablist"><button class="${A.tab.sk === 'sk' ? 'on' : ''}" data-act="sk-tab" data-t="sk">${ic('description')} Dokumen SK</button><button class="${A.tab.sk === 'tim' ? 'on' : ''}" data-act="sk-tab" data-t="tim">${ic('group')} Struktur & personel</button></div>
  <div class="card flat" ${A.tab.sk === 'sk' ? '' : 'hidden'}>${A.table('t-sk', () => ({ rows: A.d.sk.slice().sort((a, b) => a.nomor_urut - b.nomor_urut), search: ['kode', 'judul', 'nomor_sk'], placeholder: 'Cari kode, judul, nomor SK…', size: 10, empty: 'Belum ada SK', filters: [{ key: 'status', label: 'Semua status', options: STATUS_SK }],
    cols: [{ key: 'kode', label: 'Kode', sort: 1, html: r => `<span class="mono">${esc(r.kode)}</span>` }, { key: 'judul', label: 'Judul SK', sort: 1, html: r => `<b>${esc(r.judul)}</b>${r.deskripsi ? `<div class="sub">${esc(r.deskripsi)}</div>` : ''}` },
      { key: 'nomor_sk', label: 'Nomor & tanggal', hm: 1, html: r => r.nomor_sk ? `${esc(r.nomor_sk)}<div class="sub">${dateID(r.tanggal_sk)}</div>` : '<span class="muted">–</span>' },
      { key: 'tanggal_unggah', label: 'Diunggah', hm: 1, html: r => r.berkas_id ? `${dateID(r.tanggal_unggah)}<div class="sub">${esc(r.pengunggah)} · ${fsize(+r.ukuran || 0)}</div>` : '<span class="muted">–</span>' },
      { key: 'status', label: 'Status', sort: 1, html: r => badge(r.status === 'terunggah' ? 'Terunggah' : 'Belum ada', r.status === 'terunggah' ? 'ok' : 'warn') },
      { key: 'x', label: '', cls: 'right', html: r => `<div class="rowacts">${r.berkas_id ? `<button class="btn ghost icon sm" data-act="berkas-buka" data-id="${esc(r.berkas_id)}" title="Lihat" aria-label="Lihat">${ic('visibility')}</button><button class="btn ghost icon sm" data-act="berkas-unduh" data-id="${esc(r.berkas_id)}" title="Unduh" aria-label="Unduh">${ic('download')}</button>` : ''}${adm ? `<button class="btn ghost icon sm" data-act="sk-upload" data-id="${esc(r.id)}" title="${r.berkas_id ? 'Ganti berkas' : 'Unggah'}" aria-label="Unggah">${ic('cloud_upload')}</button><button class="btn ghost icon sm" data-act="sk-edit" data-id="${esc(r.id)}" title="Ubah data" aria-label="Ubah">${ic('edit')}</button>${r.berkas_id ? `<button class="btn ghost icon sm" data-act="sk-hapus" data-id="${esc(r.id)}" title="Hapus berkas" aria-label="Hapus berkas">${ic('delete')}</button>` : ''}` : ''}</div>` }] }))}</div>
  <div ${A.tab.sk === 'tim' ? '' : 'hidden'}>${timView()}</div>`;
} });
function timView() {
  const t = A.d.tim.slice().sort((a, b) => (+a.urut || 99) - (+b.urut || 99)), adm = Sel.admin();
  const node = (x, top) => `<div class="node ${top ? 'top' : ''}"><b>${esc(x.nama)}</b><div class="xs">${esc(x.jabatan)}</div></div>`;
  const pj = t.find(x => /penanggung|kepala sekolah/i.test(x.jabatan)), ketua = t.find(x => /ketua/i.test(x.jabatan)), sisa = t.filter(x => x !== pj && x !== ketua);
  const chart = t.length ? `<div class="card" style="margin-bottom:24px"><div class="org">${pj ? node(pj, 1) : ''}${ketua ? node(ketua) : ''}<div class="lvl">${sisa.slice(0, 8).map(x => node(x)).join('')}</div></div></div>` : '';
  return chart + `<div class="card flat">${A.table('t-tim', () => ({ rows: A.d.tim.slice().sort((a, b) => (+a.urut || 99) - (+b.urut || 99)), search: ['nama', 'jabatan', 'unit', 'tugas', 'pokja'], placeholder: 'Cari nama, jabatan, pokja…', size: 10, empty: 'Belum ada anggota tim', emptyHint: adm ? 'Tambahkan anggota dengan tombol di kanan atas.' : '',
    cols: [{ key: 'nama', label: 'Nama', sort: 1, html: r => `<b>${esc(r.nama)}</b>${r.nip ? `<div class="sub">NIP ${esc(r.nip)}</div>` : ''}` }, { key: 'jabatan', label: 'Jabatan', sort: 1, html: r => `${esc(r.jabatan)}<div class="sub">${esc(r.unit)}</div>` }, { key: 'tugas', label: 'Tugas', hm: 1 }, { key: 'pokja', label: 'Pokja', hm: 1, sort: 1 }, { key: 'wa', label: 'WhatsApp', hm: 1, html: r => r.wa ? `<span class="mono">${esc(r.wa)}</span>` : '–' },
      { key: 'x', label: '', cls: 'right', html: r => adm ? `<div class="rowacts"><button class="btn ghost icon sm" data-act="tim-form" data-id="${esc(r.id)}" aria-label="Ubah">${ic('edit')}</button><button class="btn ghost icon sm" data-act="tim-hapus" data-id="${esc(r.id)}" aria-label="Hapus">${ic('delete')}</button></div>` : '' }] }))}</div>`;
}
Object.assign(A.acts, {
  'sk-tab': el => { A.tab.sk = el.dataset.t; A.rerender('sk'); },
  'berkas-buka': el => A.unduhBerkas(el.dataset.id, el, true), 'berkas-unduh': el => A.unduhBerkas(el.dataset.id, el),
  'sk-upload': el => { const s = A.d.sk.find(x => x.id === el.dataset.id); modal({ title: `${s.berkas_id ? 'Ganti' : 'Unggah'} berkas — ${s.kode}`, form: 'sk-up', ok: 'Unggah', body: `<input type="hidden" name="id" value="${esc(s.id)}"><div class="note">${ic('info')}<div>${esc(s.judul)}. Format PDF, maksimal ${esc(Sel.set('MAKS_PDF_MB'))} MB.</div></div>` +
    field('Berkas SK (PDF)', '<input class="input" type="file" name="file" accept="application/pdf" required>', { req: 1 }) + `<div class="form-grid">${field('Nomor SK', `<input class="input" name="nomor_sk" value="${esc(s.nomor_sk)}" maxlength="80">`)}${field('Tanggal SK', `<input class="input" type="date" name="tanggal_sk" value="${esc(s.tanggal_sk)}">`)}${field('Terverifikasi oleh', `<input class="input" name="verifikator" value="${esc(s.verifikator || A.user.nama)}" maxlength="80">`)}${field('Catatan', '<input class="input" name="catatan" maxlength="300">')}</div>` }); },
  'sk-edit': el => { const s = A.d.sk.find(x => x.id === el.dataset.id); modal({ title: `Ubah data — ${s.kode}`, form: 'sk-ed', body: `<input type="hidden" name="id" value="${esc(s.id)}">${field('Judul SK', `<input class="input" name="judul" value="${esc(s.judul)}" maxlength="200">`, { req: 1 })}${field('Deskripsi', `<input class="input" name="deskripsi" value="${esc(s.deskripsi)}" maxlength="300">`)}<div class="form-grid">${field('Nomor SK', `<input class="input" name="nomor_sk" value="${esc(s.nomor_sk)}">`)}${field('Tanggal SK', `<input class="input" type="date" name="tanggal_sk" value="${esc(s.tanggal_sk)}">`)}${field('Verifikator', `<input class="input" name="verifikator" value="${esc(s.verifikator)}">`)}${field('Catatan', `<input class="input" name="catatan" value="${esc(s.catatan)}">`)}</div>` }); },
  'sk-hapus': async el => { const s = A.d.sk.find(x => x.id === el.dataset.id); if (await A.confirmBox(`Hapus berkas <b>${esc(s.kode)}</b> dari Drive? Data nomor SK tetap tersimpan.`, 'Hapus berkas', 'danger')) write(el, 'sk.hapusBerkas', { id: s.id }); },
  'tim-form': el => { const t = el.dataset.id ? A.d.tim.find(x => x.id === el.dataset.id) : {}; modal({ title: t.id ? 'Ubah anggota tim' : 'Tambah anggota tim', form: 'tim', body: `<input type="hidden" name="id" value="${esc(t.id || '')}"><div class="form-grid">${field('Nama lengkap', `<input class="input" name="nama" value="${esc(t.nama)}" maxlength="120">`, { req: 1 })}${field('Jabatan dalam tim', `<input class="input" name="jabatan" value="${esc(t.jabatan)}" maxlength="80" placeholder="mis. Ketua TPMPS">`, { req: 1 })}${field('Unit kerja', `<input class="input" name="unit" value="${esc(t.unit)}" maxlength="120">`)}${field('NIP', `<input class="input" name="nip" value="${esc(t.nip)}" maxlength="30" inputmode="numeric">`)}${field('Kelompok kerja', `<input class="input" name="pokja" value="${esc(t.pokja)}" maxlength="80">`)}${field('Nomor WhatsApp', `<input class="input" name="wa" value="${esc(t.wa)}" inputmode="tel" placeholder="08123456789">`)}${field('Tugas', `<textarea class="textarea" name="tugas" maxlength="300">${esc(t.tugas)}</textarea>`, { full: 1 })}${field('Urutan tampil', `<input class="input" type="number" name="urut" value="${esc(t.urut || '')}" min="0" max="999">`)}</div>` }); },
  'tim-hapus': async el => { const t = A.d.tim.find(x => x.id === el.dataset.id); if (await A.confirmBox(`Hapus <b>${esc(t.nama)}</b> dari tim?`, 'Hapus', 'danger')) write(el, 'tim.hapus', { id: t.id }); }
});
Object.assign(A.forms, {
  'sk-up': async f => { const d = A.formData(f), file = f.elements.file.files[0]; if (!file) return toast('Pilih berkas PDF.', 'bad'); if (file.type !== 'application/pdf') return toast('Berkas harus PDF.', 'bad');
    const btn = $('[data-submit]', f.closest('.modal')); const r = await busy(btn, async () => { const b = await A.bacaFile(file); return api('sk.upload', { id: d.id, nama: b.nama, mime: b.mime, b64: b.b64, nomor_sk: d.nomor_sk, tanggal_sk: d.tanggal_sk, verifikator: d.verifikator, catatan: d.catatan }, { write: true, timeout: 120000 }); });
    r.success ? (toast(r.message, 'ok'), f.closest('.modal-bg').close()) : toast(r.message, 'bad'); },
  'sk-ed': async f => { const d = A.formData(f), r = await write($('[data-submit]', f.closest('.modal')), 'sk.save', d); if (r.success) f.closest('.modal-bg').close(); },
  tim: async f => { const r = await write($('[data-submit]', f.closest('.modal')), 'tim.save', A.formData(f)); if (r.success) f.closest('.modal-bg').close(); }
});

// =============================================================== PEMETAAN MUTU
A.tab.mutuPer = null;
A.page('mutu', { render(el) {
  const adm = Sel.admin(), per = A.tab.mutuPer || Sel.periodeAktif(), ambM = Sel.ambM(), rows = mutuPer(per).slice().sort((a, b) => String(a.kode).localeCompare(String(b.kode)));
  const cnt = k => rows.filter(r => kat(+r.capaian, ambM) === k).length, rata = rows.length ? rows.reduce((a, r) => a + +r.capaian, 0) / rows.length : null;
  const items = rows.map(r => ({ code: r.kode, label: r.aspek, val: +r.capaian, color: KCOL[KT[kat(+r.capaian, ambM)]] }));
  const tren = Sel.periodes().slice().reverse().map(p => { const m = mutuPer(p); return m.length ? { x: p.replace('TA ', ''), y: m.reduce((a, r) => a + +r.capaian, 0) / m.length } : null; }).filter(Boolean);
  el.innerHTML = head('Pemetaan Mutu', 'Pemetaan Mutu & Rapor Pendidikan', 'Capaian setiap aspek mutu berdasarkan Standar Nasional Pendidikan dan Rapor Pendidikan.', periodePilihan('mutu-per', per) + (adm ? `<button class="btn primary" data-act="mutu-form">${ic('add')} Tambah data mutu</button>` : '')) +
  `<div class="grid g4" style="margin-bottom:24px">${kpi('Indikator terpetakan', rows.length, esc(per))}${kpi('Rata-rata capaian', rata == null ? '–' : `${num(rata, 1)}<small>%</small>`, rata == null ? 'Belum ada data' : badgeKat(kat(rata, ambM)))}${kpi('Baik / Sangat Baik', cnt('Sangat Baik') + cnt('Baik'), `Capaian ≥ ${ambM[1]}%`)}${kpi('Perlu perhatian', cnt('Perlu Peningkatan') + cnt('Perlu Perhatian Khusus'), `${cnt('Perlu Perhatian Khusus')} perhatian khusus`)}</div>
  <div class="grid g-main" style="margin-bottom:24px"><div class="card"><div class="card-h" style="margin:-24px -24px 0"><h3>${ic('bar_chart')} Capaian per aspek</h3></div>${items.length ? A.barChart(items, ambM[1]) : empty('bar_chart', 'Belum ada data pada periode ini', adm ? 'Gunakan tombol "Tambah data mutu".' : '')}</div>
  <div class="stack"><div class="card"><h4 style="margin-bottom:12px">Kategori capaian</h4><div class="stack" style="gap:10px">${[['Sangat Baik', `≥ ${ambM[0]}%`, 'Pertahankan dan imbaskan praktik baik.'], ['Baik', `${ambM[1]}–${ambM[0] - 0.01}%`, 'Lanjutkan, pantau berkala.'], ['Perlu Peningkatan', `${ambM[2]}–${ambM[1] - 0.01}%`, 'Perlu program perbaikan terarah.'], ['Perlu Perhatian Khusus', `< ${ambM[2]}%`, 'Prioritaskan intervensi segera.']].map(k => `<div class="row between" style="align-items:flex-start">${badgeKat(k[0])}<div style="flex:1;margin-left:8px"><b class="mono">${k[1]}</b><div class="xs muted">${k[2]}</div></div></div>`).join('')}</div><p class="xs muted" style="margin-top:12px">Ambang dapat diubah Admin. Pastikan sesuai ketentuan resmi Rapor Pendidikan.</p></div>
  <div class="card"><h4 style="margin-bottom:8px">Tren rata-rata antarperiode</h4>${A.lineChart(tren, ambM[1])}</div></div></div>
  <div class="card flat">${A.table('t-mutu', () => ({ rows: mutuPer(A.tab.mutuPer || Sel.periodeAktif()), search: ['kode', 'aspek', 'domain', 'standar', 'rekomendasi'], placeholder: 'Cari kode, aspek, standar…', size: 10, empty: 'Belum ada data mutu', emptyIcon: 'fact_check',
    filters: [{ key: 'kategori', label: 'Semua kategori', options: ['Sangat Baik', 'Baik', 'Perlu Peningkatan', 'Perlu Perhatian Khusus'] }, { key: 'standar', label: 'Semua standar', options: [...new Set(A.d.mutu.map(m => m.standar).filter(Boolean))] }],
    cols: [{ key: 'kode', label: 'Kode', sort: 1, html: r => `<span class="mono">${esc(r.kode)}</span>` }, { key: 'aspek', label: 'Aspek mutu', sort: 1, html: r => `<b>${esc(r.aspek)}</b><div class="sub">${esc(r.domain)}</div>` }, { key: 'standar', label: 'Standar', hm: 1 },
      { key: 'capaian', label: 'Capaian', sort: 1, val: r => +r.capaian, html: r => `<b class="mono">${num(+r.capaian)}%</b>` }, { key: 'kategori', label: 'Kategori', html: r => badgeKat(kat(+r.capaian, Sel.ambM())) },
      { key: 'prioritas', label: 'Prioritas / rekomendasi', hm: 1, html: r => `${r.prioritas ? badge(r.prioritas, 'info') : ''}<div class="sub">${esc(r.rekomendasi)}</div>` },
      { key: 'x', label: '', cls: 'right', html: r => adm ? `<div class="rowacts"><button class="btn ghost icon sm" data-act="mutu-form" data-id="${esc(r.id)}" aria-label="Ubah">${ic('edit')}</button><button class="btn ghost icon sm" data-act="mutu-hapus" data-id="${esc(r.id)}" aria-label="Hapus">${ic('delete')}</button></div>` : '' }] }))}</div>`;
} });
Object.assign(A.acts, {
  'mutu-per': el => { A.tab.mutuPer = el.value; A.rerender('mutu'); },
  'mutu-form': el => {
    const m = el.dataset.id ? A.d.mutu.find(x => x.id === el.dataset.id) : {}, kt = katalog(), per = m.periode || A.tab.mutuPer || Sel.periodeAktif();
    modal({ title: m.id ? 'Ubah data mutu' : 'Tambah data mutu', form: 'mutu', size: 'lg', body: `<input type="hidden" name="id" value="${esc(m.id || '')}"><div class="form-grid">
      ${field('Aspek mutu (katalog)', `<select class="select" name="katalog" data-chg="mutu-kat"><option value="">— pilih / isi manual —</option>${kt.map(k => `<option value="${esc(k.kode)}" ${m.kode === k.kode ? 'selected' : ''}>${esc(k.kode)} · ${esc(k.aspek)}</option>`).join('')}</select>`, { req: 1, hint: 'Katalog dapat diubah Admin di Pengaturan.' })}
      ${field('Periode', `<select class="select" name="periode">${selOpts(Sel.periodes(), per)}</select>`, { req: 1 })}
      ${field('Kode', `<input class="input" name="kode" value="${esc(m.kode)}" maxlength="12">`, { req: 1 })}${field('Nama aspek', `<input class="input" name="aspek" value="${esc(m.aspek)}" maxlength="150">`, { req: 1 })}
      ${field('Domain / sub-aspek', `<input class="input" name="domain" value="${esc(m.domain)}" maxlength="200">`)}${field('Standar', `<input class="input" name="standar" value="${esc(m.standar)}" maxlength="120">`)}
      ${field('Nilai capaian (%)', `<input class="input" type="number" name="capaian" step="0.01" min="0" max="100" inputmode="decimal" value="${esc(m.capaian)}" data-chg="mutu-live">`, { req: 1 })}<div class="field"><label>Kategori otomatis</label><div id="mutu-live" style="min-height:44px;display:flex;align-items:center">${m.capaian !== undefined ? badgeKat(kat(+m.capaian, Sel.ambM())) : '<span class="muted">Isi nilai capaian</span>'}</div></div>
      ${field('Prioritas', `<select class="select" name="prioritas">${selOpts(['P1', 'P2', 'P3', 'P4', 'Non-Prioritas'], m.prioritas, '— belum ditetapkan —')}</select>`)}${field('Rekomendasi tindak lanjut', `<input class="input" name="rekomendasi" value="${esc(m.rekomendasi)}" maxlength="300">`)}
      ${field('Analisis akar masalah', `<textarea class="textarea" name="akar_masalah" maxlength="1000">${esc(m.akar_masalah)}</textarea>`, { full: 1 })}</div>` });
  },
  'mutu-kat': el => { const k = katalog().find(x => x.kode === el.value), f = el.closest('form'); if (k) { const E = f.elements; E.kode.value = k.kode; E.aspek.value = k.aspek; E.domain.value = k.domain; E.standar.value = k.standar; } },
  'mutu-live': el => { $('#mutu-live').innerHTML = el.value === '' ? '<span class="muted">Isi nilai capaian</span>' : badgeKat(kat(+el.value, Sel.ambM())); },
  'mutu-hapus': async el => { const m = A.d.mutu.find(x => x.id === el.dataset.id); if (await A.confirmBox(`Hapus data mutu <b>${esc(m.kode)} ${esc(m.aspek)}</b>?`, 'Hapus', 'danger')) write(el, 'mutu.hapus', { id: m.id }); }
});
A.forms.mutu = async f => { const d = A.formData(f); delete d.katalog; const r = await write($('[data-submit]', f.closest('.modal')), 'mutu.save', d); if (r.success) f.closest('.modal-bg').close(); };

// =============================================================== PENETAPAN PRIORITAS
const KRIT = [['K1', 'Mutu pembelajaran', 'Berdampak langsung pada kompetensi literasi, numerasi, dan karakter murid di kelas.'], ['K2', 'Mandat rapor mutu', 'Relevan dengan rekomendasi prioritas atas masalah (Perlu Peningkatan) dari Rapor Pendidikan.'], ['K3', 'Daya dukung & dana', 'Sesuai kapasitas SDM guru, alokasi waktu, dan pagu belanja BOS Kinerja.'], ['K4', 'Relevansi temporal', 'Dapat dituntaskan secara realistis dalam siklus satu tahun anggaran.']];
let draft = {}, draftPer = '', draftDirty = false;
const bobot = () => { const w = String(Sel.set('BOBOT_PRIORITAS')).split(',').map(Number); return w.length === 4 && !w.some(isNaN) ? w : [35, 30, 20, 15]; };
const skorOf = k => { const w = bobot(); return k.reduce((a, x, i) => a + (x ? w[i] : 0), 0); };
const tingkatOf = s => { const t = String(Sel.set('SKALA_PRIORITAS')).split(',').map(Number); return s >= (t[0] || 90) ? 'P1' : s >= (t[1] || 80) ? 'P2' : s >= (t[2] || 70) ? 'P3' : 'P4'; };
function bangunDraft(per) {
  const ambM = Sel.ambM(), saved = {}; A.d.prio.filter(p => p.periode === per).forEach(p => { saved[p.kode] = p; });
  draft = {}; mutuPer(per).filter(m => +m.capaian < ambM[1]).sort((a, b) => +a.capaian - +b.capaian).forEach((m, i) => {
    const s = saved[m.kode]; draft[m.kode] = { kode: m.kode, aspek: m.aspek, capaian: +m.capaian, k: s ? [s.k1, s.k2, s.k3, s.k4].map(x => x === 'YA') : [false, true, false, false], alasan: s ? s.alasan : '', program_rtl: s ? s.program_rtl : '', urut: s ? +s.urut : i + 1, kunci: s && s.terkunci === 'YA' };
  }); draftPer = per;
}
A.tab.prioPer = null;
function prioPaint(el) {
  const adm = Sel.admin(), list = Object.values(draft).map(x => Object.assign(x, { skor: skorOf(x.k), tingkat: tingkatOf(skorOf(x.k)) })).sort((a, b) => a.tingkat.localeCompare(b.tingkat) || a.urut - b.urut), w = bobot();
  const progOpts = Sel.programs().map(p => ({ v: `${p.kode} ${p.nama}`, l: `${p.kode} · ${p.nama}` }));
  el.querySelector('[data-prio-matrix]').innerHTML = list.length ? `<div class="twrap"><table><thead><tr><th>Aspek</th><th>Capaian</th>${KRIT.map((k, i) => `<th class="center" title="${esc(k[1])}">${k[0]}<br><span class="mono">${w[i]}%</span></th>`).join('')}<th>Skor</th><th>Tingkat</th></tr></thead><tbody>${list.map(x => `<tr><td><b>${esc(x.kode)}</b> ${esc(x.aspek)}</td><td class="mono">${num(x.capaian)}%</td>${x.k.map((c, i) => `<td class="chk-cell"><input type="checkbox" data-pk="${esc(x.kode)}|${i}" ${c ? 'checked' : ''} ${adm ? '' : 'disabled'} aria-label="${esc(KRIT[i][1])} untuk ${esc(x.kode)}"></td>`).join('')}<td><b class="mono">${num(x.skor, 1)}</b></td><td>${badge(x.tingkat, x.tingkat === 'P1' ? 'bad' : x.tingkat === 'P2' ? 'warn' : x.tingkat === 'P3' ? 'gold' : 'mute')}</td></tr>`).join('')}</tbody></table></div>` : empty('flag', 'Belum ada aspek kandidat', `Kandidat = aspek dengan capaian di bawah ${Sel.ambM()[1]}% pada periode ini. Isi dulu Pemetaan Mutu.`);
  el.querySelector('[data-prio-tiers]').innerHTML = ['P1', 'P2', 'P3', 'P4'].map(t => { const g = list.filter(x => x.tingkat === t); return g.length ? `<div class="ptier ${t.toLowerCase()}"><div class="h"><span>${t} · ${({ P1: 'Sangat prioritas', P2: 'Mendesak', P3: 'Menengah', P4: 'Rutin' })[t]}</span><span>${g.length} aspek</span></div><div class="card-b stack" style="padding:16px">${g.map(x => `<div class="stack" style="gap:8px"><div class="row between"><b>${esc(x.kode)} ${esc(x.aspek)}</b><span class="mono">skor ${num(x.skor, 1)}</span></div>
    <textarea class="textarea" data-pf="${esc(x.kode)}|alasan" placeholder="Dasar pemilihan prioritas…" maxlength="600" ${adm ? '' : 'disabled'} style="min-height:64px">${esc(x.alasan)}</textarea>
    <div class="row"><select class="select" data-pf="${esc(x.kode)}|program_rtl" style="flex:1;min-height:40px" ${adm ? '' : 'disabled'} aria-label="Program RTL">${selOpts(progOpts, x.program_rtl, '— alokasi program RTL —')}</select>${adm ? `<button class="btn icon sm" data-act="prio-geser" data-k="${esc(x.kode)}" data-d="-1" aria-label="Naik">${ic('arrow_upward')}</button><button class="btn icon sm" data-act="prio-geser" data-k="${esc(x.kode)}" data-d="1" aria-label="Turun">${ic('arrow_downward')}</button>` : ''}</div></div>`).join('<hr style="border:0;border-top:1px solid var(--surface-hi);width:100%">')}</div></div>` : ''; }).join('');
}
A.page('prioritas', { render(el) {
  const adm = Sel.admin(), per = A.tab.prioPer || Sel.periodeAktif(), w = bobot(); if (draftPer !== per || !Object.keys(draft).length || !draftDirty) bangunDraft(per);
  el.innerHTML = head('Penetapan Prioritas', 'Penetapan Prioritas Benahi Mutu', 'Tingkat prioritas P1–P4 dihitung dari empat kriteria berbobot untuk aspek yang masih di bawah ambang.', periodePilihan('prio-per', per) + (adm ? `<button class="btn primary" data-act="prio-simpan">${ic('save')} Simpan urutan prioritas</button>` : '')) +
  `<div class="mx" style="margin-bottom:24px">${KRIT.map((k, i) => `<div class="crit"><span class="w">${k[0]} · BOBOT ${w[i]}%</span><b>${esc(k[1])}</b><span class="small muted">${esc(k[2])}</span></div>`).join('')}</div>
  ${!adm ? `<div class="note" style="margin-bottom:16px">${ic('info')}<div>Anda melihat hasil penetapan. Hanya Admin yang dapat mengubahnya.</div></div>` : ''}
  <div class="grid g-main"><div class="card flat"><div class="card-h"><h3>${ic('rule')} Matriks skoring kandidat</h3><span class="badge b-mute">${esc(per)}</span></div><div data-prio-matrix></div></div><div class="stack" data-prio-tiers></div></div>
  <div class="note" style="margin-top:24px">${ic('info')}<div>Dasar regulasi: Permendikbudristek No. 28 Tahun 2021 tentang SPMI dan Juknis BOS Kinerja. Aspek berstatus Perlu Peningkatan minimal diwujudkan dalam rencana kegiatan di RKT/RKAS.</div></div>`;
  prioPaint(el);
  if (!el._bound) { el._bound = 1;
    el.addEventListener('change', e => { const t = e.target; if (t.dataset.pk) { const [k, i] = t.dataset.pk.split('|'); draft[k].k[+i] = t.checked; draftDirty = true; prioPaint(el); } });
    el.addEventListener('input', e => { const t = e.target; if (t.dataset.pf) { const [k, f] = t.dataset.pf.split('|'); draft[k][f] = t.value; draftDirty = true; } });
    el.addEventListener('change', e => { const t = e.target; if (t.dataset.pf) { const [k, f] = t.dataset.pf.split('|'); draft[k][f] = t.value; draftDirty = true; } }); }
} });
Object.assign(A.acts, {
  'prio-per': el => { A.tab.prioPer = el.value; draft = {}; draftDirty = false; A.rerender('prioritas'); },
  'prio-geser': el => { const x = draft[el.dataset.k], d = +el.dataset.d, tg = x.tingkat; const grup = Object.values(draft).filter(y => y.tingkat === tg).sort((a, b) => a.urut - b.urut), i = grup.indexOf(x), j = i + d; if (j < 0 || j >= grup.length) return; const t = grup[j].urut; grup[j].urut = x.urut; x.urut = t; if (x.urut === grup[j].urut) x.urut += d * 0.5; prioPaint($('#pg-prioritas')); },
  'prio-simpan': async el => { const items = Object.values(draft).map(x => ({ kode: x.kode, periode: draftPer, k: x.k, alasan: x.alasan, program_rtl: x.program_rtl, urut: x.urut })); if (!items.length) return toast('Tidak ada aspek kandidat.', 'bad'); const r = await write(el, 'prioritas.save', { items, kunci: true }, 'Urutan prioritas disimpan.'); if (r.success) draftDirty = false; }
});
})();
