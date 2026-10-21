// ══════════════════════════════════════════════════════════════
// STEP 4 — SUB-CENTRES IN THE SHARED CHECKPOINTS EDITOR (draft · review & publish · versions)
// Content → Checkpoints has four tabs (Sub-Centre · UPHC · PHC · CHC). The Sub-Centre tab keeps its own tools
// (Checkpoint master with Standards & MEs, Checks, linked checks, NQAS criteria; Day cards), but every change now
// goes into a DRAFT; Publish writes it to the places the Sub-Centre app (and the live pilot app) already read:
//   shared/cp_master/{edits, added, links, registry} · shared/admin_edits · shared/edits
// Draft: shared/dept_master/sc/draft/ops/{key} = {p (path under shared/), v (JSON text), at (ms), by}
//   — each op replaces the value at its path, applied in time order on top of what is published.
// Versions: shared/dept_master/sc/versions/{v} = {at, by, note, from, n, snap (JSON text of the content)}; live meta
//   shared/dept_master/sc/live = {v, at, by, note, from, vers}. v1 = the Sub-Centre content as it was before Step 4.
// Safety: a publish (or roll back) that changes which checkpoints are on a day is refused while any running
//   Sub-Centre has already reached that day — days a facility has passed keep the checkpoints they had.
// ══════════════════════════════════════════════════════════════
var SCD = { on: false, ops: {}, live: null, meta: null, vers: null, busy: false, screen: '' };
var SCD_BASE = 'shared/dept_master/sc';
var SCD_RX = /^shared\/(cp_master\/(edits|added|links|registry)|admin_edits|edits)(\/|$)/;
var SCD_META_RX = /^shared\/cp_master\/(updatedAt|updatedBy|importedAt|lastImport)$/;
function scdRel(p) { return String(p).replace(/^shared\//, ''); }
function scdKey(rel) { return encodeURIComponent(rel).replace(/\./g, '%2E').replace(/%/g, '~'); }
function scdBy() { try { return (typeof nmBy === 'function' && nmBy()) || 'HealSol'; } catch (e) { return 'HealSol'; } }
function scdParts(rel) { return String(rel).split('/').filter(Boolean); }
function scdClone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
function scdSetIn(root, parts, v) {   // returns the new root (parts relative to root)
  if (!parts.length) return scdClone(v);
  var o = root && typeof root === 'object' ? root : {}, cur = o;
  for (var i = 0; i < parts.length - 1; i++) { if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {}; cur = cur[parts[i]]; }
  if (v == null) delete cur[parts[parts.length - 1]]; else cur[parts[parts.length - 1]] = scdClone(v);
  return o;
}
function scdGetIn(root, parts) { var o = root; for (var i = 0; i < parts.length; i++) { if (o == null || typeof o !== 'object') return null; o = o[parts[i]]; } return o === undefined ? null : o; }
function scdOpList() { return Object.keys(SCD.ops || {}).map(function (k) { return Object.assign({ k: k }, SCD.ops[k]); }).sort(function (a, b) { return a.at - b.at; }); }
// the draft applied on top of a value read at `rel`
function scdApply(rel, val, ops) {
  var P = scdParts(rel), out = scdClone(val);
  (ops || scdOpList()).forEach(function (op) {
    var Q = scdParts(op.p), v; try { v = JSON.parse(op.v); } catch (e) { v = null; }
    if (Q.length >= P.length && P.every(function (x, i) { return Q[i] === x; })) out = scdSetIn(out, Q.slice(P.length), v);
    else if (Q.length < P.length && Q.every(function (x, i) { return P[i] === x; })) out = scdClone(scdGetIn(v, P.slice(Q.length)));
  });
  return out === undefined ? null : out;
}
function scdTouches(rel) { var P = scdParts(rel); return scdOpList().some(function (op) { var Q = scdParts(op.p); var n = Math.min(P.length, Q.length); for (var i = 0; i < n; i++) if (P[i] !== Q[i]) return false; return true; }); }

// ── the read / write switch (only while the Sub-Centre tab is open) ──
(function () {
  var oSet = fbSet, oGet = fbGet;
  window.scdRealSet = oSet; window.scdRealGet = oGet;
  fbSet = async function (p, v) {
    if (!SCD.on || typeof p !== 'string') return oSet.apply(this, arguments);
    if (SCD_META_RX.test(p)) return true;   // "updated" stamps follow the publish
    if (!SCD_RX.test(p)) return oSet.apply(this, arguments);
    var rel = scdRel(p), k = scdKey(rel), op = { p: rel, v: JSON.stringify(v === undefined ? null : v), at: Date.now() + (SCD._seq = ((SCD._seq || 0) + 1) % 1000) / 1000, by: scdBy() };
    var ok = await oSet(SCD_BASE + '/draft/ops/' + k, op); if (ok) { SCD.ops[k] = op; scdBadge(); }
    return ok;
  };
  fbGet = async function (p) {
    var r = await oGet.apply(this, arguments);
    if (!SCD.on || typeof p !== 'string' || !/^shared\/(cp_master|admin_edits|edits)(\/|$)/.test(p)) return r;
    var rel = scdRel(p); return scdTouches(rel) ? scdApply(rel, r) : r;
  };
})();
async function scdLoad() {
  var r = await Promise.all([scdRealGet(SCD_BASE + '/draft/ops'), scdRealGet(SCD_BASE + '/live'), scdRealGet('shared/cp_master'), scdRealGet('shared/admin_edits'), scdRealGet('shared/edits')]);
  SCD.ops = r[0] || {}; SCD.meta = r[1] || null; SCD.live = { cp: r[2] || {}, ae: r[3] || {}, ed: r[4] || {} };
}
// v1: the Sub-Centre content as it was before Step 4 (made the first time the tab opens)
async function scdEnsureV1() {
  if (SCD.meta && SCD.meta.v) return;
  var now = new Date().toISOString(), from = nmIsoDay(new Date()), snap = scdSnap(SCD.live);
  var ok = await scdRealSet(SCD_BASE + '/versions/1', { at: now, by: scdBy(), note: 'Sub-Centre master as it was before Step 4', from: from, n: 0, snap: JSON.stringify(snap) });
  if (ok) { SCD.meta = { v: 1, at: now, by: scdBy(), note: 'Sub-Centre master as it was before Step 4', from: from, vers: { 1: from } }; await scdRealSet(SCD_BASE + '/live', SCD.meta); }
}
function scdSnap(L) { var cp = L.cp || {}; return { cp: { edits: cp.edits || null, added: cp.added || null, links: cp.links || null, registry: cp.registry || null }, ae: L.ae || null, ed: L.ed || null }; }
async function scdReloadContent() {
  try { if (typeof scCpmLoad === 'function') await scCpmLoad(true); } catch (e) {}
  try { if (typeof scEnsureAdminEdits === 'function') await scEnsureAdminEdits(true); } catch (e) {}
  try { if (typeof scCpmInvalidate === 'function') scCpmInvalidate(); } catch (e) {}
}
async function scdOn() {
  if (SCD.on || typeof appMode === 'undefined' || appMode !== 'sc-admin') return;
  try { await scdLoad(); await scdEnsureV1(); } catch (e) { console.warn('[SCD] load', e); }
  SCD.on = true; await scdReloadContent();
  try { if (typeof scCpmTab === 'function') scCpmTab('master'); } catch (e) {}
  try { if (typeof buildAeDayStrip === 'function') buildAeDayStrip(); } catch (e) {}
  scdBar();
}
async function scdOff() { if (!SCD.on) return; SCD.on = false; SCD.screen = ''; scdShowPub(false); await scdReloadContent(); }

// ── which checkpoints are on each day (both packages), for the safety check ──
function scdDayLists() {
  var out = {}; ['nqas_12A', 'nqas_12B'].forEach(function (pid) { out[pid] = [];
    for (var di = 0; di < 60; di++) { var d = null; try { d = scDayDef(pid, di); } catch (e) {} var ids = ((d && d.cps) || []).map(function (c) { return (c && (c.id || (typeof scCpmMatch === 'function' ? scCpmMatch(c) : ''))) || (c && c.t) || ''; }); out[pid].push(ids.join('|')); } });
  return out;
}
async function scdListsFor(state) {   // state: null = published, 'draft', or a snapshot {cp, ae, ed}
  var keepOn = SCD.on, keepOps = SCD.ops;
  if (state && state !== 'draft') { SCD.on = true; SCD.ops = {}; var t = Date.now();
    [['cp_master/edits', state.cp.edits], ['cp_master/added', state.cp.added], ['cp_master/links', state.cp.links], ['cp_master/registry', state.cp.registry], ['admin_edits', state.ae], ['edits', state.ed]]
      .forEach(function (x, i) { SCD.ops['s' + i] = { p: x[0], v: JSON.stringify(x[1] == null ? null : x[1]), at: t + i }; }); }
  else SCD.on = state === 'draft';
  try { await scdReloadContent(); return scdDayLists(); }
  finally { SCD.on = keepOn; SCD.ops = keepOps; await scdReloadContent(); }
}
function scdRunning() {   // Sub-Centres in their programme: {code, name, pid, idx (0-based day reached)}
  var F = scMasterFacilities || {}, today = scTodayStr(), out = [];
  Object.keys(F).forEach(function (c) { var f = F[c]; if (!f || f.migratedTo || nfTypeOf(f) !== 'sc' || !f.startDate || f.graduation) return;
    var idx = Math.floor((Date.parse(today) - Date.parse(f.startDate)) / 86400000); if (idx < 0) return; out.push({ code: c, name: f.name || c, pid: f.progId || 'nqas_12A', idx: Math.min(idx, 59) }); });
  return out;
}
function scdConflicts(A, B) {   // days whose checkpoints differ between A and B, reached by a running Sub-Centre
  var run = scdRunning(), out = [];
  Object.keys(A).forEach(function (pid) { (A[pid] || []).forEach(function (s, di) { if (s === (B[pid] || [])[di]) return;
    var who = run.filter(function (r) { return r.pid === pid && r.idx >= di; }); if (who.length) out.push({ pid: pid, day: di + 1, who: who }); }); });
  return out;
}
function scdChangedDays(A, B) { var n = 0; Object.keys(A).forEach(function (pid) { (A[pid] || []).forEach(function (s, di) { if (s !== (B[pid] || [])[di]) n++; }); }); return n; }

// ── the change list ──
function scdItems() {
  var L = SCD.live || { cp: {}, ae: {}, ed: {} }, items = {}, ops = scdOpList();
  ops.forEach(function (op) { var P = scdParts(op.p), key;
    if (P[0] === 'cp_master' && (P[1] === 'edits' || P[1] === 'added') && P[2]) key = 'cp:' + P[2];
    else if (P[0] === 'cp_master' && P[1] === 'links') key = 'links';
    else if (P[0] === 'cp_master' && P[1] === 'registry') key = 'registry';
    else if (P[0] === 'admin_edits') key = 'days';
    else if (P[0] === 'edits') key = 'olddays';
    else key = 'other';
    (items[key] = items[key] || { key: key, ops: [] }).ops.push(op); });
  return Object.keys(items).map(function (k) { var it = items[k];
    if (k.indexOf('cp:') === 0) { var id = k.slice(3), was = (L.cp.added || {})[id] ? Object.assign({}, L.cp.added[id]) : Object.assign({}, (L.cp.edits || {})[id] || {}), isAdd = !(L.cp.added || {})[id] && scdApply('cp_master/added/' + id, null, it.ops);
      var now = isAdd ? scdApply('cp_master/added/' + id, null, it.ops) : scdApply((L.cp.added || {})[id] ? 'cp_master/added/' + id : 'cp_master/edits/' + id, (L.cp.added || {})[id] || (L.cp.edits || {})[id] || null, it.ops) || {};
      var flds = {}; Object.keys(was).concat(Object.keys(now || {})).forEach(function (f) { if (JSON.stringify(was[f] == null ? '' : was[f]) !== JSON.stringify((now || {})[f] == null ? '' : now[f])) flds[f] = 1; });
      var c = null; try { c = scCpmGet(id); } catch (e) {}
      it.kind = isAdd ? 'New' : flds.retired && now && now.retired ? 'Retired' : (flds.blDay || flds.implDay) ? 'Moved' : 'Edited';
      it.title = id + ' · ' + ((c && c.t) || (now && now.t) || ''); it.what = isAdd ? [(now && now.me) || '', (now && now.svc) || '', ((now && now.pk) || []).join(' + ')].filter(Boolean).join(' · ') : 'Changed: ' + (Object.keys(flds).map(function (f) { return SCD_FN[f] || f; }).join(', ') || 'no difference'); }
    else if (k === 'days' || k === 'olddays') { var aeL = k === 'days' ? (L.ae || {}) : (L.ed || {}), aeN = scdApply(k === 'days' ? 'admin_edits' : 'edits', aeL, it.ops) || {}, keys = {};
      Object.keys(aeL).concat(Object.keys(aeN)).forEach(function (x) { if (JSON.stringify(aeL[x] || null) !== JSON.stringify(aeN[x] || null)) keys[x] = 1; });
      it.kind = 'Day cards'; it.title = 'Day card title, task or checkpoints'; it.what = Object.keys(keys).slice(0, 12).map(function (x) { var m = /^([A-Z])_(\d+)$/.exec(x); return m ? (m[1] === 'D' ? '12B' : '12A') + ' Day ' + (+m[2] + 1) : x; }).join(', ') || 'no difference'; }
    else if (k === 'links') { it.kind = 'Linked checks'; it.title = 'Linked checks (answers that must agree)'; it.what = it.ops.length + ' change' + (it.ops.length === 1 ? '' : 's'); }
    else if (k === 'registry') { it.kind = 'Titles'; it.title = 'Standard and ME titles'; it.what = it.ops.length + ' change' + (it.ops.length === 1 ? '' : 's'); }
    else { it.kind = 'Other'; it.title = it.ops.map(function (o) { return o.p; }).join(', '); it.what = ''; }
    return it; }).sort(function (a, b) { return String(a.title).localeCompare(String(b.title)); });
}
var SCD_FN = { t: 'wording', hi: 'Hindi', me: 'ME', aoc: 'Area of Concern', svc: 'service package', r: 'best filled by', method: 'method', video: 'English video', videoHi: 'Hindi video', pk: '12A / 12B', kind: 'kind', retired: 'retired', items: 'things to tick', fix: 'How to fix', cc: 'cross-cutting areas', blDay: 'baseline day', implDay: 'implementation day', mov: 'means of verification' };
function scdCount() { return scdItems().length; }

// ── screens ──
function scdBar() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var b = document.getElementById('scd-bar'); if (!b) { b = document.createElement('div'); b.id = 'scd-bar'; b.dataset.nfv = 'editor'; var ed = document.getElementById('admin-editor-section'); main.insertBefore(b, ed || main.firstChild); }
  var n = SCD.on ? scdCount() : 0, m = SCD.meta || {};
  b.innerHTML = '<div class="scd-bar"><div><b>Sub-Centre checkpoints</b><small>Published: v' + (m.v || 1) + (m.at ? ' · ' + fpShortDate(String(m.at).slice(0, 10)) + (m.by ? ' · ' + scEsc(m.by) : '') : '') + '. Changes wait in a draft until you publish them.</small></div>'
    + '<div class="scd-acts"><span class="scd-badge' + (n ? ' on' : '') + '" id="scd-badge">' + (n ? 'Draft · ' + n + ' change' + (n === 1 ? '' : 's') : 'No draft changes') + '</span>'
    + '<button type="button" class="fp-btn" onclick="scdOpenPub(\'vers\')">Versions</button><button type="button" class="fp-btn pri" onclick="scdOpenPub(\'pub\')">Review &amp; publish</button></div></div>';
}
function scdBadge() { var el = document.getElementById('scd-badge'); if (!el) return; var n = scdCount(); el.className = 'scd-badge' + (n ? ' on' : ''); el.textContent = n ? 'Draft · ' + n + ' change' + (n === 1 ? '' : 's') : 'No draft changes'; }
function scdShowPub(on) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var p = document.getElementById('scd-pub'); if (!p) { p = document.createElement('div'); p.id = 'scd-pub'; p.dataset.nfv = 'editor'; var b = document.getElementById('scd-bar'); main.insertBefore(p, b ? b.nextSibling : main.firstChild); }
  p.style.display = on ? '' : 'none'; var ed = document.getElementById('admin-editor-section'); if (ed) ed.classList.toggle('scd-hide', !!on); var bar = document.getElementById('scd-bar'); if (bar) bar.style.display = on ? 'none' : '';
}
async function scdOpenPub(which) {
  SCD.screen = which || 'pub'; scdShowPub(true);
  var p = document.getElementById('scd-pub'); p.innerHTML = '<div class="fp-card"><p class="fp-dim">Checking…</p></div>';
  try { var v = await scdRealGet(SCD_BASE + '/versions'); SCD.vers = v || {}; } catch (e) { SCD.vers = {}; }
  SCD.check = null; if (scdCount()) { try { var A = await scdListsFor(null), B = await scdListsFor('draft'); SCD.check = { conflicts: scdConflicts(A, B), days: scdChangedDays(A, B) }; } catch (e) { console.warn('[SCD] check', e); SCD.check = { err: true }; } }
  scdPubRender();
}
function scdClosePub() { SCD.screen = ''; scdShowPub(false); scdBar(); try { scCpmRender(); } catch (e) {} }
function scdPubRender() {
  var p = document.getElementById('scd-pub'); if (!p) return;
  var items = scdItems(), m = SCD.meta || {}, C = SCD.check || {}, crit = 0;
  try { crit = scCpmChecks('all').filter(function (c) { return c.level === 'error'; }).length; } catch (e) {}
  var cls = { New: 'b', Edited: 'a', Moved: 'a', Retired: 'r' };
  var h = '<div class="scd-pub"><button type="button" class="scd-back" onclick="scdClosePub()">← Checkpoints · Sub-Centre</button>'
    + '<h2>Review &amp; publish — Sub-Centre</h2><p class="fp-dim">Published now: v' + (m.v || 1) + (m.at ? ' (' + fpShortDate(String(m.at).slice(0, 10)) + (m.by ? ', ' + scEsc(m.by) : '') + ')' : '') + '. This draft becomes v' + ((m.v || 1) + 1) + '.</p>'
    + '<div class="fp-grid"><div class="fp-col"><div class="fp-card"><b>' + items.length + ' change' + (items.length === 1 ? '' : 's') + ' in the draft</b>'
    + (items.length ? items.map(function (it) { return '<div class="scd-ch"><span class="fp-st ' + (cls[it.kind] || 'n') + '">' + scEsc(it.kind) + '</span><div><b>' + scEsc(it.title) + '</b><small>' + scEsc(it.what || '') + '</small></div><button type="button" class="fp-btn sm" onclick="scdUndo(\'' + scJs(it.key) + '\')">Undo</button></div>'; }).join('') : '<p class="fp-dim">Nothing to publish — edit checkpoints or day cards in the Sub-Centre tab first.</p>') + '</div></div>'
    + '<div class="fp-col"><div class="fp-card"><b>Checks</b><ul class="scd-chk">'
    + (C.err ? '<li class="a">! The day check could not run — try again.</li>' : !items.length ? '<li>Nothing to check.</li>' : C.conflicts && C.conflicts.length ? C.conflicts.slice(0, 6).map(function (x) { return '<li class="r">✗ ' + (x.pid === 'nqas_12B' ? '12B' : '12A') + ' Day ' + x.day + ' changes, but ' + scEsc(x.who.slice(0, 3).map(function (w) { return w.name; }).join(', ')) + (x.who.length > 3 ? ' and ' + (x.who.length - 3) + ' more' : '') + ' already reached it.</li>'; }).join('') + (C.conflicts.length > 6 ? '<li class="r">… ' + (C.conflicts.length - 6) + ' more days</li>' : '') : '<li class="g">✓ ' + (C.days ? C.days + ' day card' + (C.days === 1 ? '' : 's') + ' change, none reached yet by a running Sub-Centre' : 'No day card changes which checkpoints it holds') + '</li>')
    + (crit ? '<li class="a">! ' + crit + ' checkpoint problem' + (crit === 1 ? '' : 's') + ' in Checks (Checkpoint master → Checks)</li>' : '<li class="g">✓ No errors in Checks</li>') + '</ul>'
    + (C.conflicts && C.conflicts.length ? '<p class="fp-dim">Days a facility has passed keep their checkpoints: undo the move (or the day-card change), or publish it after those Sub-Centres finish.</p>' : '') + '</div>'
    + '<div class="fp-card"><b>Who sees it, and when</b><p>Sub-Centres see the new wording, things to tick and How to fix on every card they open from the moment you publish. Scores already given are never changed.</p>'
    + '<label class="scd-note">Note (kept with the version)<textarea id="scd-note" rows="2" maxlength="300"></textarea></label>'
    + '<div class="fp-btns"><button type="button" class="fp-btn pri" ' + (!items.length || (C.conflicts && C.conflicts.length) || C.err ? 'disabled' : '') + ' onclick="scdPublish()">Publish v' + ((m.v || 1) + 1) + '</button>'
    + (items.length ? '<button type="button" class="fp-btn" style="color:#8A2A1B" onclick="scdDiscard()">Discard draft</button>' : '') + '</div></div>'
    + '<div class="fp-card" id="scd-vers"><b>Versions</b>' + scdVersHTML() + '</div></div></div></div>';
  p.innerHTML = h;
  if (SCD.screen === 'vers') try { document.getElementById('scd-vers').scrollIntoView({ block: 'start' }); } catch (e) {}
}
function scdVersHTML() {
  var V = SCD.vers || {}, cur = (SCD.meta || {}).v || 1, ks = Object.keys(V).map(Number).sort(function (a, b) { return b - a; });
  if (!ks.length) return '<p class="fp-dim">No versions yet.</p>';
  return '<ul class="scd-vers">' + ks.map(function (v) { var x = V[v] || {}; return '<li><span><b>v' + v + '</b> · ' + fpShortDate(String(x.at || '').slice(0, 10)) + (x.by ? ' · ' + scEsc(x.by) : '') + (x.note ? '<small>' + scEsc(x.note) + '</small>' : '') + '</span>' + (v === cur ? '<em>in use</em>' : '<button type="button" class="fp-btn sm" onclick="scdRollback(' + v + ')">Roll back</button>') + '</li>'; }).join('') + '</ul>';
}
async function scdUndo(key) {
  var it = scdItems().find(function (x) { return x.key === key; }); if (!it) return;
  for (var i = 0; i < it.ops.length; i++) { await scdRealSet(SCD_BASE + '/draft/ops/' + it.ops[i].k, null); delete SCD.ops[it.ops[i].k]; }
  await scdReloadContent(); showToast('Undone — back to the published version.', 'ok'); await scdOpenPub('pub');
}
async function scdDiscard() {
  if (!await showConfirm('Discard every change in the Sub-Centre draft? The published version stays as it is.', '🗑️', 'Discard draft', 'Discard', 'var(--red)')) return;
  await scdRealSet(SCD_BASE + '/draft', null); SCD.ops = {}; await scdReloadContent(); showToast('Draft discarded.', 'ok'); await scdOpenPub('pub');
}
async function scdWriteContent(snap) {   // a whole snapshot onto the published paths
  var w = [['shared/cp_master/edits', snap.cp.edits], ['shared/cp_master/added', snap.cp.added], ['shared/cp_master/links', snap.cp.links], ['shared/cp_master/registry', snap.cp.registry], ['shared/admin_edits', snap.ae], ['shared/edits', snap.ed]];
  for (var i = 0; i < w.length; i++) { if (!await scdRealSet(w[i][0], w[i][1] == null ? null : w[i][1])) return false; } return true;
}
async function scdNewVersion(note, n) {
  var L = { cp: (await scdRealGet('shared/cp_master')) || {}, ae: (await scdRealGet('shared/admin_edits')) || {}, ed: (await scdRealGet('shared/edits')) || {} };
  var m = SCD.meta || { v: 1, vers: {} }, v = (m.v || 1) + 1, now = new Date().toISOString(), from = nmIsoDay(new Date()), by = scdBy();
  await scdRealSet(SCD_BASE + '/versions/' + v, { at: now, by: by, note: note || '', from: from, n: n || 0, snap: JSON.stringify(scdSnap(L)) });
  var vers = Object.assign({}, m.vers || {}); vers[v] = from;
  SCD.meta = { v: v, at: now, by: by, note: note || '', from: from, vers: vers }; await scdRealSet(SCD_BASE + '/live', SCD.meta);
  await scdRealSet('shared/cp_master/updatedAt', now); await scdRealSet('shared/cp_master/updatedBy', by);
  SCD.live = L; return v;
}
async function scdPublish() {
  if (SCD.busy) return; var items = scdItems(); if (!items.length) return;
  var C = SCD.check || {}; if (C.err || (C.conflicts && C.conflicts.length)) { showToast('Fix the checks first.', 'err'); return; }
  SCD.busy = true;
  try {
    var ops = scdOpList(), note = ((document.getElementById('scd-note') || {}).value || '').trim().slice(0, 300);
    for (var i = 0; i < ops.length; i++) { var v; try { v = JSON.parse(ops[i].v); } catch (e) { v = null; } if (!await scdRealSet('shared/' + ops[i].p, v)) { showToast('Could not publish — check the connection. Nothing was lost; try again.', 'err'); return; } }
    var nv = await scdNewVersion(note, items.length);
    await scdRealSet(SCD_BASE + '/draft', null); SCD.ops = {};
    await scdReloadContent(); showToast('Published v' + nv + ' — Sub-Centres see it now.', 'ok'); await scdOpenPub('pub');
  } finally { SCD.busy = false; }
}
async function scdRollback(v) {
  if (scdCount()) { showToast('Publish or discard the draft first.', 'err'); return; }
  var x = (SCD.vers || {})[v]; if (!x || !x.snap) return; var snap; try { snap = JSON.parse(x.snap); } catch (e) { return; }
  var A = await scdListsFor(null), B = await scdListsFor(snap), cf = scdConflicts(A, B);
  if (cf.length) { await scAlert('Rolling back to v' + v + ' would change ' + cf.length + ' day card' + (cf.length === 1 ? '' : 's') + ' that running Sub-Centres have already reached (for example ' + (cf[0].pid === 'nqas_12B' ? '12B' : '12A') + ' Day ' + cf[0].day + ' — ' + cf[0].who[0].name + '). Days a facility has passed keep their checkpoints, so this roll back is not possible now.', 'Roll back', '⚠️'); return; }
  if (!await showConfirm('Make v' + v + ' the Sub-Centre content again? It is published as a new version straight away.', '↩', 'Roll back', 'Roll back', 'var(--teal)')) return;
  if (!await scdWriteContent(snap)) { showToast('Could not roll back — check the connection.', 'err'); return; }
  var nv = await scdNewVersion('Roll back to v' + v, 0); await scdReloadContent(); showToast('v' + v + ' is back (published as v' + nv + ').', 'ok'); await scdOpenPub('vers');
}

// ── Content → Checkpoints: one strip of type tabs; the Sub-Centre tab is the Sub-Centre editor in draft mode ──
function scdTypeTabs() {
  var cur = _nfOv.view === 'editor' ? 'sc' : ((typeof _nm !== 'undefined' && _nm.ui && _nm.ui.type) || 'uphc');
  var b = function (t, l) { return '<button type="button" role="tab" aria-selected="' + (cur === t) + '" class="' + (cur === t ? 'on' : '') + '" onclick="' + (t === 'sc' ? "nfAdminView('editor')" : "nfAdminView('dm');nmOpen('" + t + "')") + '">' + l + '</button>'; };
  return '<h1 class="hs-h1">Checkpoints</h1>' + b('sc', 'Sub-Centre') + b('uphc', 'UPHC') + b('phc', 'PHC') + b('chc', 'CHC');
}
(function () {
  if (typeof nfAdminView !== 'function') return;
  var oV = nfAdminView;
  nfAdminView = function (v) {
    var was = typeof _nfOv !== 'undefined' ? _nfOv.view : '';
    var r = oV.apply(this, arguments);
    try { if (appMode === 'sc-admin') {
      if (_nfOv.view === 'editor' && was !== 'editor') scdOn().then(function () { scdTabsPaint(); });
      if (_nfOv.view !== 'editor' && was === 'editor') scdOff();
      scdTabsPaint(); } } catch (e) { console.warn('[SCD] view', e); }
    return r;
  };
  var oA = nfAdminApply;
  nfAdminApply = function () { var r = oA.apply(this, arguments); try { scdTabsPaint(); } catch (e) {} return r; };
  if (typeof nmOpen === 'function') { var oO = nmOpen; nmOpen = async function () { var r = await oO.apply(this, arguments); try { scdTabsPaint(); } catch (e) {} return r; }; }
})();
(function () { if (typeof scCpmTab !== 'function') return; var oT = scCpmTab; scCpmTab = function (t) { var r = oT.apply(this, arguments); try { var sec = document.getElementById('admin-editor-section'); if (sec) sec.setAttribute('data-scdtab', t); } catch (e) {} return r; }; })();
function scdTabsPaint() {
  if (typeof appMode === 'undefined' || appMode !== 'sc-admin') return;
  var ct = document.getElementById('hs-ctabs'); if (ct && (_nfOv.view === 'editor' || _nfOv.view === 'dm')) ct.innerHTML = scdTypeTabs();
  if (_nfOv.view === 'editor' && SCD.on && !document.getElementById('scd-bar')) scdBar();
  // the old Card editor's tab order: Checkpoints first, then Day cards
  var t = document.getElementById('scm-tabs'); if (t && !t.dataset.scd) { t.dataset.scd = '1'; var a = t.querySelector('[data-t="days"]'), m = t.querySelector('[data-t="master"]');
    if (a && m) { m.innerHTML = '<i class="ti ti-list-details"></i> Checkpoints'; a.innerHTML = '<i class="ti ti-cards"></i> Day cards (titles &amp; tasks)'; t.insertBefore(m, a); } }
}
