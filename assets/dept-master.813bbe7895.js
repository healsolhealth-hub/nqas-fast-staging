// ══════════════════════════════════════════════════════════════
// CHECKPOINT MASTER — UPHC · PHC · CHC (Step 2b, 19 Oct 2026). HealSol Admin only.
// Base data: the type's checklist file (app/src/data/{type}/checklist.json, rows [id, dept, aoc, std, me, text, method, MoV, row]).
// HealSol's changes are kept in a draft on top of it:
//   shared/dept_master/{type}/draft/edits/{id}  = {field: value}   changed fields of a checklist checkpoint
//   shared/dept_master/{type}/draft/added/{id}  = {all fields}     checkpoints HealSol added
//   shared/dept_master/{type}/draft/hist/{id}/{key} = {at, by, f}  who changed what (fields, comma separated)
//   shared/dept_master/{type}/draft/updatedAt · updatedBy
// method, items, fix and roles are stored as JSON text (so empty lists and numbered keys survive the database).
// Fields: dept aoc std me t hi method[] items[{t,h,m[]}] video videoHi fix{'1':{w,f,fh,e,eh,tm}} roles[] pk retired.
// items = MoV items the staff tick (same shape as the SC app); fix = How to fix per MoV item (1-based, '0' = whole checkpoint).
// Publishing the draft to facilities and the day-plan board come in Step 2c; staff screens use the content in Step 2d.
// ══════════════════════════════════════════════════════════════
var NM_TYPES = ['uphc', 'phc', 'chc'];
var NM_METHODS = ['SI', 'OB', 'RR', 'PI'];
var NM_MLABEL = { SI: 'Staff interview', OB: 'Observation', RR: 'Record review', PI: 'Patient interview' };
var NM_CPX = ['method', 'items', 'fix', 'roles'];
var NM_FIELDS = ['dept', 'aoc', 'std', 'me', 't', 'hi', 'method', 'items', 'video', 'videoHi', 'fix', 'roles', 'pk', 'retired'];
var NM_DAY_WARN = 40;   // publishing warns when a day holds more checkpoints than this (Step 2c)
var _nm = { base: {}, draft: {}, loadedAt: {}, cache: {}, days: {},
  ui: { type: 'chc', dept: '', q: '', aoc: '', std: '', method: '', show: 'active', limit: 60, sel: null, screen: 'list',
        etab: 'details', form: null, fixAt: 1, prevHi: false, tcDept: '', tcLimit: 10, imp: null, busy: false } };

function nmCanEdit() { return typeof appMode !== 'undefined' && appMode === 'sc-admin'; }
function nmCfg(T) { return (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[T]) || {}; }
function nmBy() { var a = typeof _nfAuth !== 'undefined' && _nfAuth; return (a && a.claims && a.claims.name) || (a && a.email ? String(a.email).split('@')[0] : '') || 'HealSol'; }
function nmPath(T) { return 'shared/dept_master/' + T + '/draft'; }
function nmE(s) { return scEsc(s == null ? '' : s); }
function nmJ(s) { return scJs(s == null ? '' : String(s)); }
function nmMethods(s) {
  var out = []; (Array.isArray(s) ? s : String(s || '').toUpperCase().split(/[\/,;\s]+/)).forEach(function (x) {
    x = String(x).toUpperCase(); if (x === 'CI') x = 'PI'; if (NM_METHODS.indexOf(x) >= 0 && out.indexOf(x) < 0) out.push(x); });
  return out;
}
function nmFromRow(r) {
  var m = nmMethods(r[6]), what = String(r[7] || '').replace(/\s+/g, ' ').trim();
  return { id: r[0], dept: r[1], aoc: r[2], std: r[3], me: r[4], t: r[5], method: m, what: what, ord: r[8] || 0, hi: '',
    items: what ? [{ t: what, h: '', m: m.slice() }] : [], video: '', videoHi: '', fix: {}, roles: [], pk: '', retired: false };
}
// encode one field for the database / compare
function nmEnc(f, v) {
  if (f === 'retired') return v ? true : null;
  if (NM_CPX.indexOf(f) >= 0) return JSON.stringify(v == null ? (f === 'fix' ? {} : []) : v);
  return v == null ? '' : String(v);
}
function nmDec(f, v) {
  if (f === 'retired') return !!v;
  if (NM_CPX.indexOf(f) < 0) return v == null ? '' : v;
  if (typeof v !== 'string') return v || (f === 'fix' ? {} : []);
  try { return JSON.parse(v); } catch (e) { return f === 'fix' ? {} : []; }
}
function nmSame(f, a, b) { return nmEnc(f, a) === nmEnc(f, b); }
function nmEncRec(c) { var o = {}; NM_FIELDS.forEach(function (f) { var v = nmEnc(f, c[f]); if (v !== null && v !== '') o[f] = v; }); if (c.ord) o.ord = c.ord; o.createdAt = c.createdAt || scNowIso(); return o; }
function nmDecRec(id, o) { var c = { id: id, what: '', ord: (o && o.ord) || 9999, createdAt: o && o.createdAt }; NM_FIELDS.forEach(function (f) { c[f] = nmDec(f, o ? o[f] : null); }); return c; }

// ── loading ──
async function nmLoadBase(T) {
  if (_nm.base[T]) return _nm.base[T];
  var d = await nfLoadData(nmCfg(T).checklist || (T + '-checklist'));
  var B = { data: d, byId: {}, ids: [], depts: d.depts || [], toCheck: d.toCheck || [] };
  (d.items || []).forEach(function (r) { var c = nmFromRow(r); B.byId[c.id] = c; B.ids.push(c.id); });
  _nm.base[T] = B; return B;
}
async function nmLoad(T, force) {
  await nmLoadBase(T);
  if (!force && _nm.draft[T] && (Date.now() - (_nm.loadedAt[T] || 0)) < 60000) return;
  if (typeof db === 'undefined' || !db) { if (typeof initFirebase === 'function') initFirebase(); }
  var P = nmPath(T), r = await Promise.all([fbGet(P + '/edits'), fbGet(P + '/added'), fbGet(P + '/updatedAt'), fbGet(P + '/updatedBy')]);
  _nm.draft[T] = { edits: r[0] || {}, added: r[1] || {}, updatedAt: r[2] || '', updatedBy: r[3] || '' };
  _nm.loadedAt[T] = Date.now(); nmInval(T);
}
function nmInval(T) { delete _nm.cache[T]; delete _nm.days[T]; }

// ── reading (base + draft) ──
function nmGet(T, id) {
  var D = _nm.draft[T] || { edits: {}, added: {} }, B = _nm.base[T];
  if (D.added[id]) return nmDecRec(id, D.added[id]);
  var b = B && B.byId[id]; if (!b) return null;
  var c = JSON.parse(JSON.stringify(b)), e = D.edits[id] || {};
  Object.keys(e).forEach(function (f) { if (NM_FIELDS.indexOf(f) >= 0) c[f] = nmDec(f, e[f]); });
  return c;
}
function nmAll(T) {
  if (_nm.cache[T]) return _nm.cache[T];
  var B = _nm.base[T], D = _nm.draft[T] || { added: {} }; if (!B) return [];
  var order = {}; B.depts.forEach(function (d, i) { order[d.id] = i; });
  var list = B.ids.map(function (id) { return nmGet(T, id); });
  var add = Object.keys(D.added).map(function (id) { return nmGet(T, id); });
  // a new checkpoint sits after the last one of its Standard (else at the end of its department)
  add.forEach(function (a) {
    var at = -1; list.forEach(function (c, i) { if (c.dept === a.dept && (c.std === a.std || at < 0 && c.aoc === a.aoc)) at = i; });
    if (at < 0) list.forEach(function (c, i) { if (c.dept === a.dept) at = i; });
    if (at < 0) list.push(a); else list.splice(at + 1, 0, a);
  });
  _nm.cache[T] = list; return list;
}
function nmStatus(T, id) {
  var D = _nm.draft[T] || { edits: {}, added: {} };
  if (D.added[id]) return D.added[id].retired ? 'retired' : 'new';
  var e = D.edits[id]; if (!e) return '';
  if (e.retired) return 'retired';
  return Object.keys(e).length ? 'edited' : '';
}
function nmChangeCount(T) { var D = _nm.draft[T]; return D ? Object.keys(D.edits).length + Object.keys(D.added).length : 0; }
function nmDeptName(T, id) { var d = ((_nm.base[T] || {}).depts || []).find(function (x) { return x.id === id; }); return d ? d.name : id; }
function nmToCheck(T) { return nmAll(T).filter(function (c) { return !c.retired && !c.method.length; }); }
// checklist rows of the draft (active checkpoints) — the form the day plan uses
function nmRows(T) { return nmAll(T).filter(function (c) { return !c.retired; }).map(function (c) { return [c.id, c.dept, c.aoc, c.std, c.me, c.t, c.method.join('/'), c.items.map(function (x) { return x.t; }).join('; '), c.ord]; }); }
// days a checkpoint is on in the plan made from the draft: {b, i, e}
function nmDays(T) {
  if (_nm.days[T]) return _nm.days[T];
  var S = nfDeptShape(nmCfg(T)), rows = nmRows(T), out = {}, depts = {};
  rows.forEach(function (r) { depts[r[1]] = 1; });
  Object.keys(depts).forEach(function (dep) {
    var plan = nfDeptBaseline(rows, dep, S);
    plan.forEach(function (ids, i) { ids.forEach(function (id) { out[id] = { b: i + 1, i: 0, e: S.iN + i + 1 }; }); });
    for (var day = S.i1; day <= S.iN; day++) nfDeptDay(plan, day, S).ids.forEach(function (id) { if (out[id] && !out[id].i) out[id].i = day; });
  });
  _nm.days[T] = out; return out;
}

// ── writing (HealSol Admin only) ──
function nmChanged(a, b) { return NM_FIELDS.filter(function (f) { return a[f] !== undefined && !nmSame(f, a[f], b ? b[f] : null); }); }
// one database update for many checkpoints: recs = {id: full record}
async function nmSaveMany(T, recs, note) {
  if (!nmCanEdit()) { showToast('Only HealSol Admin can change checkpoints.', 'err'); return false; }
  var D = _nm.draft[T], B = _nm.base[T], up = {}, now = scNowIso(), by = nmBy(), n = 0, local = [];
  Object.keys(recs).forEach(function (id) {
    var v = recs[id], cur = nmGet(T, id), changed = nmChanged(v, cur);
    if (!changed.length && cur) return;
    n++;
    var key = db.ref().push().key;
    if (!cur || D.added[id]) {
      var rec = nmEncRec(Object.assign({}, cur || {}, v)); up['added/' + id] = rec; local.push(['added', id, rec]);
    } else {
      var base = B.byId[id], merged = Object.assign({}, cur, v), diff = {};
      NM_FIELDS.forEach(function (f) { if (!nmSame(f, merged[f], base[f])) diff[f] = nmEnc(f, merged[f]); });
      up['edits/' + id] = Object.keys(diff).length ? diff : null; local.push(['edits', id, Object.keys(diff).length ? diff : null]);
    }
    up['hist/' + id + '/' + key] = { at: now, by: by, f: (cur ? changed : ['new']).join(',') + (note ? ' · ' + note : '') };
  });
  if (!n) return true;
  up.updatedAt = now; up.updatedBy = by;
  try { await db.ref(nmPath(T)).update(up); }
  catch (e) { console.warn('[NM] save failed', e); showToast('Could not save — check the connection and try again.', 'err'); return false; }
  local.forEach(function (x) { if (x[2]) D[x[0]][x[1]] = x[2]; else delete D[x[0]][x[1]]; });
  D.updatedAt = now; D.updatedBy = by; nmInval(T);
  return true;
}
async function nmSave(T, id, vals, note) { var o = {}; o[id] = vals; return nmSaveMany(T, o, note); }
function nmNextId(T, dept) {
  var n = 0, re = new RegExp('^' + dept + '-N(\\d+)$');
  nmAll(T).forEach(function (c) { var m = re.exec(c.id); if (m) n = Math.max(n, +m[1]); });
  return dept + '-N' + String(n + 1).padStart(3, '0');
}
async function nmAdd(T, vals) {
  var id = nmNextId(T, vals.dept), o = {}; o[id] = Object.assign({ hi: '', items: [], video: '', videoHi: '', fix: {}, roles: [], pk: '', retired: false, createdAt: scNowIso() }, vals);
  return (await nmSaveMany(T, o)) ? id : null;
}
// undo = back to the checklist (edited) or remove (added)
async function nmUndo(T, id) {
  if (!nmCanEdit()) return false;
  var D = _nm.draft[T], up = {}, now = scNowIso(), was = D.added[id] ? 'added' : 'edits';
  up[was + '/' + id] = null; up['hist/' + id + '/' + db.ref().push().key] = { at: now, by: nmBy(), f: was === 'added' ? 'removed' : 'undo' };
  up.updatedAt = now; up.updatedBy = nmBy();
  try { await db.ref(nmPath(T)).update(up); } catch (e) { showToast('Could not undo — check the connection.', 'err'); return false; }
  delete D[was][id]; nmInval(T); return true;
}
async function nmHist(T, id) {
  var h = await fbGet(nmPath(T) + '/hist/' + id) || {};
  return Object.keys(h).map(function (k) { return h[k]; }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
}
// MoV text → items (split at commas / semicolons / new lines; "and" inside an item stays)
function nmSplitMov(s, m) {
  return String(s || '').split(/\s*[,;\n]\s*|\s*\d+\.\s+/).map(function (x) { return x.replace(/^[\s\-–•.]+|[\s.]+$/g, ''); })
    .filter(function (x) { return x.length > 1; }).map(function (x) { return { t: x.charAt(0).toUpperCase() + x.slice(1), h: '', m: (m || []).slice() }; });
}
// content filled (Content tab and Excel screen)
function nmContentStats(T) {
  var L = nmAll(T).filter(function (c) { return !c.retired; }), s = { n: L.length, hi: 0, split: 0, fix: 0, video: 0, roles: 0 };
  L.forEach(function (c) {
    if (c.hi) s.hi++; if (c.items.length > 1 || c.items.some(function (x) { return x.h; })) s.split++;
    if (Object.keys(c.fix || {}).some(function (k) { return c.fix[k] && c.fix[k].f; })) s.fix++;
    if (c.video || c.videoHi) s.video++; if (c.roles.length) s.roles++;
  });
  return s;
}
