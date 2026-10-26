// ══════════════════════════════════════════════════════════════
// CONTENT → IMPORT / EXPORT → APP WORDING IN HINDI (24 Oct 2026)
//   HealSol downloads every English line of the phone screens with its Hindi, corrects or adds lines in Excel and uploads
//   it back. Corrections are saved in shared/ui_hi/items/{id} = {en, hi, at, by} and win over the built-in Hindi on every
//   phone at the next open (shared/hindi-dom.js). A correction left empty in the sheet removes it again.
// ══════════════════════════════════════════════════════════════
var _hiw = { imp: null, saving: false };
var HIW_H = ['ID', 'English (on screen)', 'Hindi (built in)', 'Hindi (your correction)', 'Notes'];
function hiwE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function hiwBuiltIn() { return typeof HINDI_UI === 'object' ? HINDI_UI : {}; }
function hiwCardHTML() {
  var n = Object.keys(hiwBuiltIn()).length, c = Object.keys(NF_HI_OVR || {}).length;
  return '<section class="ce-card hiw-card"><b>App wording in Hindi</b><p>Every English line of the staff phone screens (all facility types) with its Hindi — ' + n.toLocaleString('en-IN') + ' lines'
    + (c ? ', ' + c + ' corrected by HealSol' : '') + '. Correct or add lines in Excel and upload; phones get them at the next open.</p>'
    + '<div class="hiw-acts"><button type="button" class="ce-b" onclick="hiwDownload()">Download Excel</button><button type="button" class="ce-b p" onclick="hiwPick()">Upload corrections</button></div>'
    + (_hiw.imp ? hiwPreviewHTML(_hiw.imp) : '') + '</section>';
}
async function hiwDownload() {
  var X = typeof nfLoadXlsx === 'function' ? await nfLoadXlsx() : window.XLSX; if (!X) { showToast('Excel could not load — check the connection.', 'err'); return; }
  var B = hiwBuiltIn(), O = NF_HI_OVR || {}, keys = Object.keys(B).concat(Object.keys(O).filter(function (k) { return !B[k]; })).sort(function (a, b) { return a.localeCompare(b); });
  var rows = [HIW_H].concat(keys.map(function (k) { return [nfHiKeyId(k), k, B[k] || '', O[k] || '', '']; }));
  var wb = X.utils.book_new(), ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = [{ wch: 12 }, { wch: 60 }, { wch: 60 }, { wch: 60 }, { wch: 30 }];
  X.utils.book_append_sheet(wb, ws, 'App wording');
  X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['NQAS | FAST · App wording in Hindi'], [''],
    ['Write your Hindi in column D only. Leave it empty where the built-in Hindi (column C) is right.'],
    ['{n} stands for a number and {x} for words such as a name or a department — keep them in your Hindi. To change the order, write {1}, {2} … for the first, second … of them.'],
    ['To add a line the app still shows in English: add a row, put the exact English in column B and your Hindi in column D.'],
    ['To undo a correction: empty its cell in column D and upload again.'],
    ['Checkpoint texts, MoV items and How to fix are not here — they are in Content → Checkpoints (Hindi column).']]), 'Read me');
  X.writeFile(wb, 'NQAS-FAST-app-wording-Hindi.xlsx');
}
function hiwPick() { var i = document.createElement('input'); i.type = 'file'; i.accept = '.xlsx,.xls,.csv'; i.onchange = function () { if (i.files && i.files[0]) hiwRead(i.files[0]); }; i.click(); }
async function hiwRead(file) {
  var X = typeof nfLoadXlsx === 'function' ? await nfLoadXlsx() : window.XLSX; if (!X) { showToast('Excel could not load — check the connection.', 'err'); return; }
  try { var buf = await file.arrayBuffer(), wb = X.read(buf, { type: 'array' }), ws = wb.Sheets['App wording'] || wb.Sheets[wb.SheetNames[0]], rows = X.utils.sheet_to_json(ws, { header: 1, defval: '' });
    _hiw.imp = hiwPlan(rows, file.name); hiwRepaint(); } catch (e) { console.warn('[HIW]', e); showToast('Could not read this file.', 'err'); }
}
// rows → what changes: set (new or changed corrections) · clear (corrections emptied) · errors
function hiwPlan(rows, name) {
  var h = (rows[0] || []).map(function (x) { return String(x).trim().toLowerCase(); }), ce = h.findIndex(function (x) { return /^english/.test(x); }), cc = h.findIndex(function (x) { return /correction/.test(x); });
  if (ce < 0 || cc < 0) return { name: name, set: {}, clear: [], errors: ['The sheet needs the columns "English (on screen)" and "Hindi (your correction)" — use the downloaded file.'], n: 0 };
  var B = hiwBuiltIn(), O = NF_HI_OVR || {}, set = {}, empty = {}, errors = [];
  rows.slice(1).forEach(function (r, i) {
    var en = String(r[ce] == null ? '' : r[ce]).replace(/\s+/g, ' ').trim(), hi = String(r[cc] == null ? '' : r[cc]).replace(/\s+/g, ' ').trim(); if (!en) return;
    if (!hi) { empty[en] = 1; return; }
    if (hi.length > 2000 || en.length > 2000) { errors.push('Row ' + (i + 2) + ': too long'); return; }
    var need = (en.match(/\{[nxX]\}/g) || []).length, has = (hi.match(/\{(?:[nxX]|\d)\}/g) || []).length;
    if (need && has !== need) { errors.push('Row ' + (i + 2) + ' "' + en.slice(0, 40) + '": keep ' + need + ' place-holder' + (need === 1 ? '' : 's') + ' ({n} / {x})'); return; }
    if (hi === O[en] || (!O[en] && hi === B[en])) return;
    set[en] = hi;
  });
  var clear = Object.keys(O).filter(function (k) { return empty[k] && !set[k]; });
  return { name: name, set: set, clear: clear, errors: errors, n: Object.keys(set).length };
}
function hiwPreviewHTML(I) {
  var ks = Object.keys(I.set), B = hiwBuiltIn();
  return '<div class="hiw-prev"><b>' + hiwE(I.name) + '</b>'
    + '<div><span>New or changed Hindi</span><b>' + ks.length + '</b></div><div><span>Corrections removed (back to the built-in Hindi)</span><b>' + I.clear.length + '</b></div>'
    + (I.errors.length ? '<div class="r"><span>Rows skipped</span><b>' + I.errors.length + '</b></div><details><summary>See why</summary><ul>' + I.errors.slice(0, 40).map(function (e) { return '<li>' + hiwE(e) + '</li>'; }).join('') + '</ul></details>' : '')
    + (ks.length ? '<details open><summary>See the changes</summary><ul>' + ks.slice(0, 60).map(function (k) { return '<li><span>' + hiwE(k) + '</span> → <b>' + hiwE(I.set[k]) + '</b>' + (B[k] ? '' : ' <em>(new line)</em>') + '</li>'; }).join('') + (ks.length > 60 ? '<li>…and ' + (ks.length - 60) + ' more</li>' : '') + '</ul></details>' : '')
    + '<div class="hiw-acts">' + (ks.length || I.clear.length ? '<button type="button" class="ce-b p" id="hiw-save" onclick="hiwSave()">Save ' + (ks.length + I.clear.length) + ' change' + (ks.length + I.clear.length === 1 ? '' : 's') + '</button>' : '<span class="hiw-none">Nothing to change.</span>')
    + '<button type="button" class="ce-b" onclick="_hiw.imp=null;hiwRepaint()">Cancel</button></div></div>';
}
async function hiwSave() {
  var I = _hiw.imp; if (!I || _hiw.saving) return; _hiw.saving = true;
  var b = document.getElementById('hiw-save'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  var up = {}, at = new Date().toISOString(), by = (typeof nmBy === 'function' && nmBy()) || 'HealSol';
  Object.keys(I.set).forEach(function (en) { up[nfHiKeyId(en)] = { en: en, hi: I.set[en], at: at, by: by }; });
  I.clear.forEach(function (en) { up[nfHiKeyId(en)] = null; });
  try { await db.ref('shared/ui_hi/items').update(up); await db.ref('shared/ui_hi/at').set(at);
    Object.keys(I.set).forEach(function (en) { NF_HI_OVR[en] = I.set[en]; }); I.clear.forEach(function (en) { delete NF_HI_OVR[en]; });
    _nfHiTpl = null; _nfHiCache = {}; try { localStorage.setItem('nf_ui_hi_v1', JSON.stringify(NF_HI_OVR)); } catch (e) {}
    showToast('Hindi wording saved — phones get it at the next open.', 'ok'); _hiw.imp = null;
  } catch (e) { console.warn('[HIW] save', e); showToast('Could not save — check the connection.', 'err'); }
  _hiw.saving = false; hiwRepaint();
}
function hiwRepaint() { try { if (typeof ceType === 'function' && ceType() === 'sc') { if (typeof scCpmRender === 'function') scCpmRender(); } else if (typeof nmRender === 'function') nmRender(); } catch (e) {} }
// the card sits in Import / export of every facility type
(function () {
  if (typeof sccImpHTML === 'function' && !sccImpHTML._hiw) { var a = sccImpHTML; sccImpHTML = function () { return a.apply(this, arguments).replace(/<\/div><\/div>$/, hiwCardHTML() + '</div></div>'); }; sccImpHTML._hiw = true; }
  if (typeof nmExcelHTML === 'function' && !nmExcelHTML._hiw) { var b = nmExcelHTML; nmExcelHTML = function () { return b.apply(this, arguments) + '<div class="ce-imp hiw-row">' + hiwCardHTML() + '</div>'; }; nmExcelHTML._hiw = true; }
})();
