/* SPMI BOSKIN 2026 — core.js : API client, state (SWR), router, UI kit, tabel, grafik */
(function () {
'use strict';
const CFG = window.APP_CONFIG, A = window.App = { token: null, user: null, d: null, rev: 0, ts: 0, pengguna: null, admin: null, tab: {}, pages: {}, acts: {}, forms: {} };
const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const dateID = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); return m ? (+m[3]) + ' ' + BLN[+m[2] - 1] + ' ' + m[1] : ''; };
const num = (n, d) => (n === '' || n == null || isNaN(n)) ? '–' : Number(n).toLocaleString('id-ID', { maximumFractionDigits: d == null ? 2 : d });
const rp = n => (n === '' || n == null || isNaN(n)) ? '–' : 'Rp' + Number(n).toLocaleString('id-ID');
const fsize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const today = () => { const d = new Date(Date.now() + (7 * 60 + new Date().getTimezoneOffset()) * 60000); return d.toISOString().slice(0, 10); };
Object.assign(A, { $, $$, esc, dateID, num, rp, fsize, uid, sleep, debounce, today });

// ---------- penyimpanan lokal ----------
const Store = { get(k) { try { return JSON.parse(localStorage.getItem('spmi_' + k)); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem('spmi_' + k, JSON.stringify(v)); } catch (e) { /* kuota penuh */ } }, del(k) { try { localStorage.removeItem('spmi_' + k); } catch (e) { /* abaikan */ } } };
A.Store = Store;

// ---------- API ----------
async function api(action, data, o) {
  o = o || {};
  const body = JSON.stringify({ action, data: data || {}, token: A.token, reqId: o.write ? uid() : undefined });
  const tries = o.write ? 2 : 2;
  for (let i = 0; i < tries; i++) {
    try {
      const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), o.timeout || 45000);
      const r = await fetch(CFG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body, signal: ctl.signal, redirect: 'follow' });
      clearTimeout(to);
      const j = await r.json(); ingest(j, action); return j;
    } catch (e) { if (i < tries - 1) await sleep(700); }
  }
  return { success: false, message: navigator.onLine ? 'Koneksi ke server gagal. Coba lagi.' : 'Anda sedang offline.' };
}
function ingest(j, action) {
  if (j.tok) { A.token = j.tok; Store.set('token', j.tok); }
  if (!j.success && j.data && j.data.code === 'AUTH' && action !== 'login') { logout('Sesi berakhir. Silakan masuk kembali.', true); return; }
  if (j.boot) setBoot(j.boot);
  if (j.pengguna) { A.pengguna = j.pengguna; A.rerender('pengguna'); }
}
A.api = api;

// ---------- state ----------
function setBoot(b) {
  A.d = b; A.ts = Date.now(); A.rev++;
  if (b.user) { A.user = b.user; Store.set('user', b.user); }
  Store.set('boot', b);
  paintUser(); bell(); paintTitle(); A.refresh();
}
const amb = k => String((A.d && A.d.set[k]) || '').split(',').map(Number);
const Sel = {
  admin: () => A.user && A.user.peran === 'admin',
  tulis: () => A.user && A.user.peran !== 'validator',
  set: k => (A.d && A.d.set[k]) || '',
  programs: () => A.d.program.slice().sort((a, b) => String(a.kode).localeCompare(String(b.kode))),
  prog: k => A.d.program.find(p => p.kode === k),
  kegOf: k => A.d.kegiatan.filter(x => x.program_kode === k),
  ambM: () => { const a = amb('AMBANG_MUTU'); return a.length === 3 && !a.some(isNaN) ? a : [85, 80, 70]; },
  ambN: () => { const a = amb('AMBANG_MONEV'); return a.length === 3 && !a.some(isNaN) ? a : [85, 70, 50]; },
  periodes: () => String(Sel.set('DAFTAR_PERIODE')).split('\n').map(s => s.trim()).filter(Boolean),
  periodeAktif: () => Sel.set('PERIODE_AKTIF'),
  bulanIni: () => today().slice(0, 7)
};
A.Sel = Sel;
const kat = (v, a) => (v === '' || v == null || isNaN(v)) ? '' : v >= a[0] ? 'Sangat Baik' : v >= a[1] ? 'Baik' : v >= a[2] ? 'Perlu Peningkatan' : 'Perlu Perhatian Khusus';
const KT = { 'Sangat Baik': 'ok', 'Baik': 'ok', 'Perlu Peningkatan': 'warn', 'Perlu Perhatian Khusus': 'bad' };
const KCOL = { ok: 'var(--ok)', warn: 'var(--warn)', bad: 'var(--bad)' };
const badgeKat = k => k ? `<span class="badge b-${KT[k] || 'mute'}">${esc(k)}</span>` : '<span class="muted">–</span>';
const STT = { 'Selesai': 'ok', 'Berjalan': 'info', 'Review': 'gold', 'Terjadwal': 'mute', 'Tertunda': 'bad', 'Belum Mulai': 'mute', 'Perlu Perhatian': 'bad', 'terunggah': 'ok', 'belum': 'warn', 'terverifikasi': 'ok', 'menunggu': 'warn', 'ditolak': 'bad', 'aktif': 'ok', 'nonaktif': 'mute' };
const badge = (t, tone) => `<span class="badge b-${tone || STT[t] || 'mute'}">${esc(t)}</span>`;
const bar = (p, tone) => `<div class="bar ${tone || ''}"><i style="width:${Math.max(0, Math.min(100, +p || 0))}%"></i></div>`;
Object.assign(A, { kat, KT, KCOL, badgeKat, badge, bar, STT });

// ---------- kit UI ----------
function toast(msg, tone) {
  const t = document.createElement('div'); t.className = 'toast ' + (tone || ''); t.setAttribute('role', 'status');
  t.innerHTML = ic(tone === 'ok' ? 'check_circle' : tone === 'bad' ? 'error' : 'info') + `<div>${esc(msg)}</div>`;
  $('#toasts').appendChild(t); setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .3s'; setTimeout(() => t.remove(), 300); }, tone === 'bad' ? 6000 : 3200);
}
function modal(o) {
  const bg = document.createElement('div'); bg.className = 'modal-bg';
  bg.innerHTML = `<div class="modal ${o.size || ''}" role="dialog" aria-modal="true" aria-label="${esc(o.title)}"><div class="modal-h"><h3>${esc(o.title)}</h3><button class="btn ghost icon sm" data-close aria-label="Tutup">${ic('close')}</button></div>
  <form class="modal-b" ${o.form ? `data-form="${o.form}" novalidate` : ''} style="${o.form ? '' : 'margin:0'}">${o.body}${o.form ? `<button type="submit" class="hide"></button>` : ''}</form>${o.foot === false ? '' : `<div class="modal-f">${o.foot || `<button class="btn" data-close>Batal</button>${o.form ? `<button class="btn primary" data-submit>${esc(o.ok || 'Simpan')}</button>` : ''}`}</div>`}</div>`;
  $('#modal-root').appendChild(bg);
  const close = () => { bg.remove(); document.body.style.overflow = ''; };
  bg.addEventListener('mousedown', e => { if (e.target === bg && !o.sticky) close(); });
  bg.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
    if (e.target.closest('[data-submit]')) { const f = $('form', bg); f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }
  });
  bg.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  document.body.style.overflow = 'hidden';
  const f = $('input:not([type=hidden]),select,textarea', bg); if (f && !o.noFocus && innerWidth > 1023) f.focus();
  bg.close = close; return bg;
}
function confirmBox(msg, ok, tone) {
  return new Promise(res => {
    const m = modal({ title: 'Konfirmasi', size: 'sm', body: `<p>${msg}</p>`, foot: `<button class="btn" data-close>Batal</button><button class="btn ${tone || 'primary'}" data-ok>${esc(ok || 'Ya, lanjutkan')}</button>`, noFocus: true });
    let done = false; $('[data-ok]', m).addEventListener('click', () => { done = true; m.close(); res(true); });
    const ob = new MutationObserver(() => { if (!document.body.contains(m)) { ob.disconnect(); if (!done) { done = true; res(false); } } }); ob.observe($('#modal-root'), { childList: true });
  });
}
async function busy(btn, fn) { if (btn) btn.classList.add('busy'); try { return await fn(); } finally { if (btn) btn.classList.remove('busy'); } }
function formData(f) {
  const o = {}; $$('input,select,textarea', f).forEach(i => { if (!i.name) return; if (i.type === 'checkbox') o[i.name] = i.checked; else if (i.type === 'radio') { if (i.checked) o[i.name] = i.value; } else if (i.type !== 'file') o[i.name] = i.value.trim(); });
  return o;
}
const empty = (ico, t, s) => `<div class="empty">${ic(ico || 'inventory_2')}<b>${esc(t)}</b>${s ? `<span class="small">${esc(s)}</span>` : ''}</div>`;
const skel = n => Array.from({ length: n || 3 }, () => '<div class="skel" style="height:72px;margin-bottom:12px"></div>').join('');
const kpi = (lbl, val, sub, extra) => `<div class="card kpi"><div class="k-top"><span class="k-lbl">${esc(lbl)}</span>${extra || ''}</div><div class="k-val">${val}</div>${sub ? `<div class="k-sub">${sub}</div>` : ''}</div>`;
const head = (eyebrow, title, desc, acts) => `<div class="page-h"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1>${desc ? `<p class="muted">${esc(desc)}</p>` : ''}</div>${acts ? `<div class="acts">${acts}</div>` : ''}</div>`;
const selOpts = (list, cur, ph) => (ph != null ? `<option value="">${esc(ph)}</option>` : '') + list.map(x => { const v = typeof x === 'object' ? x.v : x, l = typeof x === 'object' ? x.l : x; return `<option value="${esc(v)}" ${String(v) === String(cur) ? 'selected' : ''}>${esc(l)}</option>`; }).join('');
const field = (lbl, inner, o) => { o = o || {}; return `<div class="field ${o.full ? 'full' : ''}"><label ${o.req ? 'class="req"' : ''}>${esc(lbl)}</label>${inner}${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ''}</div>`; };
Object.assign(A, { toast, modal, confirmBox, busy, formData, empty, skel, kpi, head, selOpts, field });

// ---------- tabel generik (cari/filter/urut/halaman — semua lokal, tanpa panggilan server) ----------
const Tables = {};
function table(id, defFn) {
  Tables[id] = { def: defFn, st: (Tables[id] && Tables[id].st) || { q: '', f: {}, sort: '', dir: 1, page: 1 } };
  const d = defFn(), st = Tables[id].st;
  const tb = `<div class="tbar"><div class="grow">${ic('search')}<input class="input" data-tq="${id}" type="search" placeholder="${esc(d.placeholder || 'Cari…')}" value="${esc(st.q)}" aria-label="Cari"></div>` +
    (d.filters || []).map(f => `<select class="select" data-tf="${id}|${f.key}" aria-label="${esc(f.label)}">${selOpts(f.options, st.f[f.key] || '', f.label)}</select>`).join('') + (d.toolbar || '') + '</div>';
  return `<div data-tbl="${id}">${tb}<div data-tbody>${tableBody(id)}</div></div>`;
}
function tableBody(id) {
  const T = Tables[id], d = T.def(), st = T.st; let rows = d.rows.slice();
  if (st.q) { const q = st.q.toLowerCase(); rows = rows.filter(r => (d.search || []).some(k => String(typeof k === 'function' ? k(r) : r[k] == null ? '' : r[k]).toLowerCase().includes(q))); }
  (d.filters || []).forEach(f => { const v = st.f[f.key]; if (v) rows = rows.filter(r => String(f.get ? f.get(r) : r[f.key]) === v); });
  if (st.sort) { const c = d.cols.find(c => c.key === st.sort); if (c) rows.sort((a, b) => { const x = c.val ? c.val(a) : a[c.key], y = c.val ? c.val(b) : b[c.key]; return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x == null ? '' : x).localeCompare(String(y == null ? '' : y), 'id', { numeric: true })) * st.dir; }); }
  const size = d.size || 10, pages = Math.max(1, Math.ceil(rows.length / size)); st.page = Math.min(st.page, pages);
  const part = rows.slice((st.page - 1) * size, st.page * size);
  let h = `<div class="twrap"><table><thead><tr>${d.cols.map(c => `<th class="${c.sort ? 'sort' : ''} ${c.hm ? 'hide-m' : ''} ${c.cls || ''}" ${c.sort ? `data-ts="${id}|${c.key}"` : ''}>${esc(c.label)}${st.sort === c.key ? (st.dir > 0 ? ' ↑' : ' ↓') : ''}</th>`).join('')}</tr></thead><tbody>`;
  h += part.length ? part.map(r => `<tr>${d.cols.map(c => `<td class="${c.hm ? 'hide-m' : ''} ${c.cls || ''}">${c.html ? c.html(r) : esc(r[c.key])}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${d.cols.length}">${empty(d.emptyIcon, d.empty || 'Belum ada data', d.emptyHint)}</td></tr>`;
  h += `</tbody></table></div><div class="tfoot"><span>${rows.length ? `Menampilkan ${(st.page - 1) * size + 1}–${Math.min(rows.length, st.page * size)} dari ${rows.length}` : '0 data'}</span>`;
  if (pages > 1) { h += '<div class="pager">'; const from = Math.max(1, Math.min(st.page - 2, pages - 4)), to = Math.min(pages, from + 4); h += `<button class="btn sm" data-tp="${id}|${st.page - 1}" ${st.page === 1 ? 'disabled' : ''} aria-label="Sebelumnya">‹</button>`; for (let p = from; p <= to; p++) h += `<button class="btn sm ${p === st.page ? 'on' : ''}" data-tp="${id}|${p}">${p}</button>`; h += `<button class="btn sm" data-tp="${id}|${st.page + 1}" ${st.page === pages ? 'disabled' : ''} aria-label="Berikutnya">›</button></div>`; }
  return h + '</div>';
}
function tblRefresh(id) { const el = $(`[data-tbl="${id}"] [data-tbody]`); if (el) el.innerHTML = tableBody(id); }
A.table = table; A.tblRefresh = tblRefresh; A.Tables = Tables;

// ---------- grafik ----------
function barChart(items, th) {
  const grid = [100, 75, 50, 25].filter(v => !th || Math.abs(v - th) > 6).map(v => `<div class="ygrid" style="bottom:${v}%"><span>${v}%</span></div>`).join('') + (th ? `<div class="ygrid th" style="bottom:${th}%"><span>${th}%</span></div>` : '');
  return `<div class="chart" role="img" aria-label="Grafik capaian">${grid}${items.map(i => `<div class="col"><b>${num(i.val)}%</b><i style="height:${Math.max(1, Math.min(100, i.val)) * 0.86}%;background:${i.color}" title="${esc(i.label)}"></i></div>`).join('')}</div><div class="chart-x">${items.map(i => `<div title="${esc(i.label)}"><b>${esc(i.code || '')}</b>${items.length > 5 ? '' : `<br><span class="muted">${esc(i.label)}</span>`}</div>`).join('')}</div>${items.length > 5 ? `<p class="xs muted" style="margin-top:8px">${items.map(i => `<b>${esc(i.code)}</b> ${esc(i.label)}`).join(' · ')}</p>` : ''}`;
}
function lineChart(pts, th) {
  if (pts.length < 2) return `<p class="muted small center" style="padding:24px 0">Grafik tren muncul setelah ada data dari minimal 2 periode.</p>`;
  const W = 600, H = 200, px = 36, py = 16, x = i => px + i * (W - px - 12) / (pts.length - 1), y = v => H - py - (Math.min(100, v) / 100) * (H - 2 * py);
  const path = pts.map((p, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(p.y).toFixed(1)).join(' ');
  return `<svg viewBox="0 0 ${W} ${H + 24}" style="width:100%;height:auto" role="img" aria-label="Tren capaian">${[0, 25, 50, 75, 100].map(v => `<line x1="${px}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#c4c7c7" stroke-dasharray="3 4"/><text x="0" y="${y(v) + 4}" font-size="10" fill="#444748" font-family="JetBrains Mono,monospace">${v}</text>`).join('')}
  ${th ? `<line x1="${px}" x2="${W}" y1="${y(th)}" y2="${y(th)}" stroke="#BA1A1A" stroke-width="2" stroke-dasharray="6 4"/>` : ''}
  <path d="${path}" fill="none" stroke="#0B3A8F" stroke-width="3" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.y)}" r="5" fill="#F2B01E" stroke="#0B3A8F" stroke-width="2"/><text x="${x(i)}" y="${y(p.y) - 10}" font-size="11" text-anchor="middle" font-family="JetBrains Mono,monospace" fill="#1a1c1c">${num(p.y, 1)}</text><text x="${x(i)}" y="${H + 14}" font-size="10" text-anchor="middle" fill="#444748">${esc(p.x)}</text>`).join('')}</svg>`;
}
A.barChart = barChart; A.lineChart = lineChart;

// ---------- unduhan ----------
function download(nama, mime, b64) {
  const bin = atob(b64), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  const url = URL.createObjectURL(new Blob([arr], { type: mime })), a = document.createElement('a'); a.href = url; a.download = nama; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
}
async function unduhBerkas(id, btn, buka) {
  const r = await busy(btn, () => api('berkas.unduh', { id }));
  if (!r.success) return toast(r.message, 'bad');
  if (buka) { const bin = atob(r.data.b64), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); window.open(URL.createObjectURL(new Blob([arr], { type: r.data.mime })), '_blank'); } else download(r.data.nama, r.data.mime, r.data.b64);
}
function toCSV(rows) { return rows.map(r => r.map(c => '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"').join(',')).join('\r\n'); }
function saveText(nama, txt, mime) { const u = URL.createObjectURL(new Blob(['\ufeff' + txt], { type: mime || 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = u; a.download = nama; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000); }
Object.assign(A, { download, unduhBerkas, toCSV, saveText });

// ---------- berkas: baca & kompres di klien (hemat kuota & batas unggah) ----------
function bacaFile(file, maxPx) {
  return new Promise((res, rej) => {
    const rd = new FileReader(); rd.onerror = () => rej(new Error('Gagal membaca berkas'));
    if (/^image\/(jpeg|png)$/.test(file.type) && file.size > 300 * 1024) {
      rd.onload = () => { const im = new Image(); im.onload = () => {
        const k = Math.min(1, (maxPx || 1600) / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        const url = c.toDataURL('image/jpeg', 0.82); res({ nama: file.name.replace(/\.\w+$/, '') + '.jpg', mime: 'image/jpeg', b64: url.split(',')[1], ukuran: Math.round(url.length * 0.75) }); };
        im.onerror = () => rej(new Error('Gambar tidak valid')); im.src = rd.result; };
      rd.readAsDataURL(file);
    } else { rd.onload = () => res({ nama: file.name, mime: file.type, b64: String(rd.result).split(',')[1], ukuran: file.size }); rd.readAsDataURL(file); }
  });
}
A.bacaFile = bacaFile;

// ---------- navigasi ----------
const NAV = [['dashboard', 'Dashboard', 'grid_view'], ['sk', 'SK & Tim TPMPS', 'group'], ['mutu', 'Pemetaan Mutu', 'fact_check'], ['prioritas', 'Penetapan Prioritas', 'flag'], ['rtl', 'Program RTL', 'assignment'], ['monev', 'Monev & Refleksi', 'monitoring'], ['berkas', 'Berkas', 'folder'], ['laporan', 'Laporan PDF', 'picture_as_pdf'], ['pengguna', 'Pengguna & Pengaturan', 'settings', 1], ['wa', 'WhatsApp & CRM', 'chat', 1]];
A.NAV = NAV;
A.page = (name, def) => { A.pages[name] = def; };
let cur = { name: '', param: '' };
function parseHash() { const h = location.hash.replace(/^#\/?/, '').split('?')[0].split('/'); return { name: h[0] || 'dashboard', param: h[1] || '' }; }
function paintNav() {
  const adm = Sel.admin();
  $('#nav').innerHTML = NAV.filter(n => !n[3] || adm).map((n, i) => (n[3] && !NAV[i - 1][3] ? '<div class="sep">Admin</div>' : '') + `<a href="#/${n[0]}" data-nav="${n[0]}">${ic(n[2])}<span>${esc(n[1])}</span></a>`).join('');
  $('#bnav').innerHTML = [['dashboard', 'Beranda', 'home'], ['rtl', 'RTL', 'assignment'], ['monev', 'Monev', 'monitoring'], ['berkas', 'Berkas', 'folder']].map(n => `<a href="#/${n[0]}" data-nav="${n[0]}">${ic(n[2], 'lg')}<span>${n[1]}</span></a>`).join('') + `<a href="#" data-act="menu-open" role="button">${ic('menu', 'lg')}<span>Menu</span></a>`;
  $('[data-act="logout"]').innerHTML = ic('logout') + ' Keluar'; $('[data-act="ubah-sandi"]', $('#side')).innerHTML = ic('key') + ' Ubah kata sandi';
  $('.menu-btn').innerHTML = ic('menu'); $('#bell button').innerHTML = ic('notifications'); $('#side-logo').innerHTML = ic('shield'); $('#side-install').innerHTML = ic('install_desktop') + ' Pasang aplikasi';
}
function paintUser() { if (!A.user) return; $('#u-name').textContent = A.user.nama; $('#u-role').textContent = ({ admin: 'Administrator', pengguna: 'Pengguna', validator: 'Validator' })[A.user.peran] || A.user.peran; $('#u-av').textContent = (A.user.nama || '?').split(/\s+/).map(x => x[0]).slice(0, 2).join('').toUpperCase(); }
function show(name, param) {
  const meta = NAV.find(n => n[0] === name);
  if (!meta || (meta[3] && !Sel.admin()) || !A.pages[name]) { location.hash = '#/dashboard'; return; }
  cur = { name, param };
  let el = $('#pg-' + name); if (!el) { el = document.createElement('section'); el.id = 'pg-' + name; el.className = 'page'; el.addEventListener('input', () => { el.dataset.dirty = '1'; }); $('#host').appendChild(el); }
  $$('.page').forEach(p => p.classList.toggle('on', p === el));
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === name));
  paintTitle();
  const key = A.rev + '|' + param; if (el.dataset.key !== key || el.dataset.force) { renderPage(el, name, param); }
  closeMenu(); window.scrollTo(0, 0);
}
function paintTitle() { const meta = NAV.find(n => n[0] === cur.name); if (!meta || !A.d) return; $('#top-title').innerHTML = `${esc(Sel.set('NAMA_SEKOLAH') || 'SPMI BOSKIN')} / <b>${esc(meta[1])}</b>`; document.title = meta[1] + ' · SPMI BOSKIN 2026'; }
function renderPage(el, name, param) { try { A.pages[name].render(el, param); } catch (e) { console.error(e); el.innerHTML = `<div class="note bad">${ic('error')}<div>Halaman gagal ditampilkan: ${esc(e.message)}</div></div>`; } el.dataset.key = A.rev + '|' + param; el.dataset.dirty = ''; delete el.dataset.force; }
A.refresh = () => { if (!A.d || !$('#shell').classList.contains('on')) return; const el = $('#pg-' + cur.name); if (!el) return route(); if (el.dataset.dirty === '1' && document.activeElement && el.contains(document.activeElement)) return; renderPage(el, cur.name, cur.param); };
A.rerender = name => { const el = $('#pg-' + name); if (el) { el.dataset.force = '1'; if (cur.name === name) renderPage(el, name, cur.param); } };
A.go = h => { location.hash = h; };
function route() { if (!A.d) return; const p = parseHash(); show(p.name, p.param); }
function openMenu() { $('#side').classList.add('open'); $('#scrim').classList.add('on'); }
function closeMenu() { $('#side').classList.remove('open'); $('#scrim').classList.remove('on'); }
window.addEventListener('hashchange', route);

function bell() {
  if (!A.d) return;
  const items = [], d = A.d, adm = Sel.admin();
  const skBelum = d.sk.filter(s => s.status !== 'terunggah').length; if (skBelum) items.push(['sk', 'description', `${skBelum} dokumen SK belum diunggah`]);
  Sel.set('MONEV_JADWAL').split(/\s+/).filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x)).forEach(t => { const n = Math.round((new Date(t) - new Date(today())) / 864e5); if (n >= 0 && n <= 7) items.push(['monev', 'event', `Batas monev ${dateID(t)} (${n === 0 ? 'hari ini' : 'H-' + n})`]); });
  const ph = d.program.filter(p => p.status === 'Perlu Perhatian').length; if (ph) items.push(['rtl', 'warning', `${ph} program RTL perlu perhatian`]);
  if (adm) { const mw = d.berkas.filter(b => b.status_verifikasi === 'menunggu').length; if (mw) items.push(['berkas', 'verified', `${mw} berkas menunggu verifikasi`]); }
  $('#bell-n').textContent = items.length; $('#bell-n').classList.toggle('hide', !items.length);
  $('#bell-pop').innerHTML = items.length ? items.map(i => `<a href="#/${i[0]}">${ic(i[1])}<span>${esc(i[2])}</span></a>`).join('') : `<div class="it muted">${ic('check_circle')}<span>Tidak ada pemberitahuan.</span></div>`;
}

// ---------- autentikasi ----------
function showLogin(msg) {
  $('#shell').classList.remove('on'); $('#login').style.display = 'flex'; $('#login-logo').innerHTML = ic('shield'); $('[data-act="toggle-pass"]').innerHTML = ic('visibility');
  const e = $('#lg-err'); if (msg) { e.textContent = msg; e.classList.remove('hide'); } else e.classList.add('hide');
  $('#lg-pass').value = ''; setTimeout(() => $('#lg-user').focus(), 50);
}
function showShell() { $('#login').style.display = 'none'; $('#shell').classList.add('on'); paintNav(); paintUser(); bell(); if (!location.hash || location.hash === '#/') location.hash = '#/dashboard'; route(); }
function logout(msg, silent) {
  if (!silent && A.token) api('logout', {}, { timeout: 5000 });
  A.token = null; A.user = null; A.d = null; ['token', 'user', 'boot'].forEach(k => Store.del(k)); $('#host').innerHTML = ''; Object.keys(Tables).forEach(k => delete Tables[k]); A.pengguna = null; A.admin = null;
  showLogin(msg);
}
A.logout = logout;
A.forms.login = async f => {
  const d = formData(f), err = $('#lg-err'); err.classList.add('hide');
  if (!d.username || !d.password) { err.textContent = 'Isi username dan kata sandi.'; err.classList.remove('hide'); return; }
  const r = await busy($('#lg-btn'), () => api('login', d, { timeout: 60000 }));
  if (!r.success) { err.textContent = r.message; err.classList.remove('hide'); return; }
  A.token = r.data.token; Store.set('token', A.token); A.user = r.data.user; Store.set('user', A.user); setBoot(r.data.boot); markActive(); showShell();
  if (Sel.admin()) setTimeout(prefetchAdmin, 1500);
};
async function prefetchAdmin() { const r = await api('batch', { calls: [{ action: 'adminBoot' }, { action: 'notif.config' }, { action: 'crm.stats' }] }); if (r.success) { const o = r.data; if (o.adminBoot && o.adminBoot.success) { A.admin = o.adminBoot.data; A.pengguna = A.admin.pengguna; } A.cfgNotif = o['notif.config'] && o['notif.config'].data; A.crmStats = o['crm.stats'] && o['crm.stats'].data; } }
A.prefetchAdmin = prefetchAdmin;
A.forms.sandi = async f => {
  const d = formData(f); if (d.baru !== d.ulang) return toast('Konfirmasi kata sandi tidak sama.', 'bad');
  const r = await busy($('[data-submit]', f.closest('.modal')), () => api('ubahSandi', { lama: d.lama, baru: d.baru }, { write: true }));
  if (!r.success) return toast(r.message, 'bad'); A.token = r.data.token; Store.set('token', A.token); toast('Kata sandi diperbarui.', 'ok'); f.closest('.modal-bg').close();
};

// ---------- delegasi event ----------
Object.assign(A.acts, {
  'toggle-pass': el => { const i = $('#lg-pass'); i.type = i.type === 'password' ? 'text' : 'password'; el.innerHTML = ic(i.type === 'password' ? 'visibility' : 'visibility_off'); },
  'menu-open': () => openMenu(), 'menu-close': () => closeMenu(),
  bell: () => { $('#bell-pop').classList.toggle('hide'); },
  logout: async () => { if (await confirmBox('Keluar dari aplikasi?', 'Keluar')) logout(); },
  'ubah-sandi': () => modal({ title: 'Ubah kata sandi', size: 'sm', form: 'sandi', ok: 'Perbarui', body: field('Kata sandi lama', '<input class="input" name="lama" type="password" autocomplete="current-password" required>', { req: 1 }) + field('Kata sandi baru', '<input class="input" name="baru" type="password" autocomplete="new-password" minlength="8">', { req: 1, hint: 'Minimal 8 karakter, memuat huruf dan angka.' }) + field('Ulangi kata sandi baru', '<input class="input" name="ulang" type="password" autocomplete="new-password">', { req: 1 }) })
});
document.addEventListener('click', e => {
  if (!e.target.closest('#bell')) $('#bell-pop').classList.add('hide');
  const t = e.target.closest('[data-ts]'); if (t) { const [id, k] = t.dataset.ts.split('|'), st = Tables[id].st; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; tblRefresh(id); return; }
  const p = e.target.closest('[data-tp]'); if (p) { const [id, n] = p.dataset.tp.split('|'); Tables[id].st.page = +n; tblRefresh(id); return; }
  const a = e.target.closest('[data-act]'); if (a && A.acts[a.dataset.act]) { if (a.tagName === 'A') e.preventDefault(); A.acts[a.dataset.act](a, e); }
});
document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f && A.forms[f.dataset.form]) { e.preventDefault(); A.forms[f.dataset.form](f, e); } });
document.addEventListener('input', e => { const t = e.target;
  if (t.dataset && t.dataset.tq) { debounce(() => { Tables[t.dataset.tq].st.q = t.value; Tables[t.dataset.tq].st.page = 1; tblRefresh(t.dataset.tq); }, 150)(); } });
document.addEventListener('change', e => { const t = e.target; if (t.dataset && t.dataset.chg && A.acts[t.dataset.chg]) A.acts[t.dataset.chg](t, e); if (t.dataset && t.dataset.tf) { const [id, k] = t.dataset.tf.split('|'); Tables[id].st.f[k] = t.value; Tables[id].st.page = 1; tblRefresh(id); } });

// ---------- sesi idle & jaringan ----------
let lastAct = Date.now(); const markActive = () => { lastAct = Date.now(); }; ['click', 'keydown', 'touchstart', 'scroll'].forEach(ev => addEventListener(ev, markActive, { passive: true }));
setInterval(() => { if (A.token && Date.now() - lastAct > CFG.IDLE_MENIT * 60000) logout('Sesi berakhir karena tidak aktif 60 menit.', true); }, 30000);
const net = () => document.body.classList.toggle('offline', !navigator.onLine); addEventListener('online', () => { net(); if (A.token) A.sync(); }); addEventListener('offline', net);
A.sync = async () => { const r = await api('boot', {}); if (r.success) setBoot(r.data); return r; };
document.addEventListener('visibilitychange', () => { if (!document.hidden && A.token && Date.now() - A.ts > 60000) A.sync(); });

// ---------- mulai ----------
async function init() {
  net();
  if (/GANTI_DENGAN/.test(CFG.API_URL)) { showLogin('Aplikasi belum dikonfigurasi: isi API_URL di js/config.js.'); return; }
  A.token = Store.get('token'); A.user = Store.get('user'); const cached = Store.get('boot');
  if (A.token && A.user && cached) {            // tampil instan dari cache lokal, lalu segarkan di latar (stale-while-revalidate)
    A.d = cached; showShell(); const r = await api('boot', {}); if (r.success) { setBoot(r.data); if (Sel.admin()) setTimeout(prefetchAdmin, 1200); } return;
  }
  showLogin();
  fetch(CFG.API_URL + '?w=1', { mode: 'no-cors' }).catch(() => {});   // pemanasan server saat layar login tampil
}
A.start = init;   // dipanggil dari pwa.js (skrip terakhir) agar semua halaman sudah terdaftar
})();
