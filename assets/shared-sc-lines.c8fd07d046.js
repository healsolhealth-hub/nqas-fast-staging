// ══════════════════════════════════════════════════════════════
// THINGS TO CHECK — one place for what staff see (27 Nov 2026; HealSol design canvas page "Content Manager — what staff see",
// approved 27 Nov, with multiple owners, a lead, "Together / Each one", and option order locked)
//  • The 941 lines (data/sc/line-cards.js) and 122 knowledge questions (SC_BLQ) stay the built-in base. The content master
//    can now change, per checkpoint, through the same draft → Review & publish:
//       ln  {l1: {q, qh, ev, evh, r, at, ah, bt, bh}}   — what staff see, evidence hint, fix type (only fields that differ)
//       kq  {l3: [{q, qh, o:[4], oh:[4], a, x, xh}]}     — the knowledge question(s) of a line (same count, options in order)
//       own {l1: 'ANM+ASHA'}                              — who answers (one or more; ALL = everyone)
//       fix {'1': {w, f, fh, e, eh, tm, by, ld}}          — How to fix per line; by = who fixes, ld = lead, w: S together / E each
//  • Locked: the number, order and type of lines, and the order of a question's options — answers are stored by position.
//  • Built for every checklist: for a checklist without line cards, each MoV item is one line with its MoV text.
// ══════════════════════════════════════════════════════════════
if (typeof SC_CPM_FIELDS !== 'undefined') ['ln', 'kq'].forEach(function (f) { if (SC_CPM_FIELDS.indexOf(f) < 0) SC_CPM_FIELDS.push(f); });
if (typeof SCD_FN !== 'undefined') { SCD_FN.ln = 'things to check'; SCD_FN.kq = 'knowledge questions'; }
if (typeof SCC_FN !== 'undefined') { SCC_FN.ln = 'things to check'; SCC_FN.kq = 'knowledge questions'; SCC_FN.fix = 'How to fix'; }
var SCL_ROLES = ['CHO', 'ANM', 'ASHA', 'MPW'];
var SCL_TYPE = { rec: ['Check records', 'रिकॉर्ड देखें'], know: ['Ask staff · knowledge', 'स्टाफ़ से पूछें · ज्ञान'], obs: ['Look', 'देखें'], disp: ['Look · displayed', 'देखें · प्रदर्शित'], avail: ['Look · available', 'देखें · उपलब्ध'],
  client: ['Ask clients', 'लाभार्थी से पूछें'], people: ['Ask people', 'लोगों से पूछें'], do: ['Staff show how', 'स्टाफ़ करके दिखाएँ'], use: ['Look · in use', 'देखें · उपयोग में'], train: ['Training record', 'प्रशिक्षण रिकॉर्ड'],
  drug: ['List · drugs', 'सूची · दवाएँ'], stock: ['List · stock', 'सूची · स्टॉक'], equip: ['List · equipment', 'सूची · उपकरण'], tests: ['List · tests', 'सूची · जाँचें'], some: ['List · tick what is there', 'सूची'], somerec: ['List · in records', 'सूची · रिकॉर्ड'],
  yn: ['Yes / No', 'हाँ / नहीं'], sample: ['Sample of records', 'रिकॉर्ड का नमूना'], ind: ['Indicator', 'संकेतक'], mov: ['Check', 'जाँचें'] };
var SCL_ROUTE = { A: 'Arrange', L: 'Learn', R: 'Record', P: 'Practise' };
function sclE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function sclJ(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function sclKeyN(key) { var p = String(key).lastIndexOf('.'); return { id: String(key).slice(0, p), n: String(key).slice(p + 1) }; }

// ── the overrides, read from the content master (cached per version) ──
var _sclOv = { ver: -2, map: {} };
function sclOv(id) {
  try { if (typeof _scCpm === 'undefined') return null;
    if (_sclOv.ver !== _scCpm.ver) { var m = {}; [_scCpm.edits || {}, _scCpm.added || {}].forEach(function (E) { Object.keys(E).forEach(function (k) { var e = E[k]; if (e && (e.ln || e.kq)) m[k] = { ln: e.ln || {}, kq: e.kq || {} }; }); }); _sclOv = { ver: _scCpm.ver, map: m }; }
    return _sclOv.map[id] || null; } catch (e) { return null; }
}
function sclLnOv(key) { var k = sclKeyN(key), o = sclOv(k.id); return o && o.ln['l' + k.n] || null; }
function sclKqOf(key, all) {   // the knowledge questions of a line: the built-in ones (edited) + questions added per topic (x: true)
  var k = sclKeyN(key), o = sclOv(k.id), base = (typeof SC_BLQ !== 'undefined' && SC_BLQ[key]) || null; var ov = o && o.kq['l' + k.n];
  if (!base) return null; if (!ov || !ov.length) return base;
  var out = base.map(function (q, i) { var x = ov[i]; if (!x) return q; return Object.assign({}, q, { q: x.q || q.q, qh: x.qh || q.qh, o: (x.o && x.o.length === q.o.length) ? x.o.map(function (t, j) { return t || q.o[j]; }) : q.o, oh: (x.oh && q.oh && x.oh.length === q.oh.length) ? x.oh.map(function (t, j) { return t || q.oh[j]; }) : q.oh, a: x.a != null && x.a >= 0 && x.a < q.o.length ? +x.a : q.a, x: x.x || q.x, xh: x.xh || q.xh, tp: x.tp || q.tp, tph: x.tph || q.tph }); });
  ov.slice(base.length).forEach(function (x) { if (x && x.q && x.o && x.o.length >= 2) out.push(Object.assign({}, x, { a: +x.a || 0, add: true })); });
  return out; }
// 27 Nov 2026: a question added per topic reaches a facility on baseline days dated on or after the day it was added
// (days already open keep the questions they had); HealSol screens always show it
function sclKqGate(cp, at) {
  try { if (!at || typeof appMode === 'undefined' || appMode !== 'cho' || typeof imfBaseLoc !== 'function') return true;
    var loc = imfBaseLoc(choState.progId, cp.id), st = choState.startDate; if (!loc || !st) return true;
    var d = new Date(st + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + loc.di); return d.toISOString().slice(0, 10) >= String(at).slice(0, 10); } catch (e) { return true; }
}
(function () {
  if (typeof blsLC === 'function') { var o = blsLC; blsLC = function (key) { var L = o.apply(this, arguments); if (!L) return L; var v = sclLnOv(key); if (!v) return L;
    var out = Object.assign({}, L); ['q', 'qh', 'ev', 'evh', 'r'].forEach(function (f) { if (v[f]) out[f] = v[f]; }); return out; }; }
  if (typeof blsSlots === 'function') { var s0 = blsSlots; blsSlots = function () { var S = s0.apply(this, arguments), cp = arguments[0] || {};
    try { S = S.map(function (s) { if (!s || !s.key) return s; var v = sclLnOv(s.key), q = s.kind === 'mcq' ? sclKqOf(s.key) : null, t = s;
      if (q && q[s.qi] && q[s.qi] !== s.q) t = Object.assign({}, t, { q: q[s.qi] });
      if (v && s.part === 'a' && s.kind === 'tri' && (v.at || v.ah)) t = Object.assign({}, t, { t: v.at || t.t, h: v.ah || t.h });
      if (v && s.part === 'b' && (v.bt || v.bh)) t = Object.assign({}, t, { t: v.bt || t.t, h: v.bh || t.h });
      return t; });
      var out = []; S.forEach(function (s, i) { out.push(s); var nx = S[i + 1];
        if (s.kind === 'mcq' && s.key && !(nx && nx.kind === 'mcq' && nx.key === s.key)) { var Q = sclKqOf(s.key) || [];
          Q.forEach(function (q, qi) { if (!q.add || !sclKqGate(cp, q.at)) return; out.push(Object.assign({}, s, { id: s.k + 'q' + qi, q: q, qi: qi, x: true })); }); } });
      return out; } catch (e) { return S; } }; }
  if (typeof blsExplain === 'function') { blsExplain = function (key) { var Q = sclKqOf(key); if (!Q) return ''; var hi = blsHi(); return Q.map(function (q) { return hi && q.xh ? q.xh : q.x; }).join(' '); }; }
})();

// ── who fixes a line: by (roles), ld (lead), w (S together / E each). Without by, the old rule: every owner fixes their own ──
function sclFixEntry(cp, k) { try { var key = typeof nfFixKey === 'function' ? nfFixKey(cp, k) : String(+k + 1), m = scCpmGet(cp.id), e = m && m.fix && m.fix[key]; return e || null; } catch (e) { return null; } }
function sclFixers(cp, s, present) {   // → {by:[roles], ld, w, set} for the line of slot s
  var e = sclFixEntry(cp, s.k), own = blsOwnList(s.own);
  var by = e && e.by ? String(e.by).split('+') : (own[0] === 'ALL' || !own.length ? SCL_ROLES.slice() : own.slice());
  var here = by.filter(function (r) { return !present || present[r] || r === 'CHO'; }); if (!here.length) here = ['CHO'];
  var ld = e && e.ld && here.indexOf(e.ld) >= 0 ? e.ld : here[0];
  return { by: here, ld: ld, w: e && e.w === 'E' ? 'E' : 'S', set: !!(e && e.by) };
}
function imfOwnFix(cp, s, role, present) {   // does this person get the fix of this line?
  try { var F = sclFixers(cp, s, present); if (!F.set) return blsOwnerOK(s.own, role, present);
    return F.w === 'E' ? F.by.indexOf(role) >= 0 : role === F.ld; } catch (e) { return blsOwnerOK(s.own, role, present); }
}
function sclFixWho(cp, s, present, names) {   // "Together with Meena (ASHA) — Rekha (ANM) leads" for the card
  try { var F = sclFixers(cp, s, present); if (!F.set || F.by.length < 2) return '';
    var nm = function (r) { return (names && names[r]) ? names[r] + ' (' + r + ')' : r; };
    return F.w === 'E' ? blsT('Each of ' + F.by.map(nm).join(', ') + ' fixes their own', F.by.map(nm).join(', ') + ' — हर कोई अपना सुधार करे')
      : blsT('Together — ' + nm(F.ld) + ' leads, with ' + F.by.filter(function (r) { return r !== F.ld; }).map(nm).join(', '), 'साथ में — ' + nm(F.ld) + ' नेतृत्व करें, ' + F.by.filter(function (r) { return r !== F.ld; }).map(nm).join(', ') + ' के साथ'); } catch (e) { return ''; }
}

// ── the lines of a checkpoint, for the content screens ──
function sclLines(c) {
  var items = (c.items || []).length ? c.items : [{ t: c.t, h: c.hi }], out = [];
  items.forEach(function (it, k) {
    var n = (c.items || []).length ? k + 1 : 0, key = c.id + '.' + n, B = (typeof SC_LC !== 'undefined' && SC_LC[key]) || null, L = B ? blsLC(key) : null;
    var S = (typeof SC_BLS !== 'undefined' && SC_BLS[key]) || null, Q = sclKqOf(key), QB = (typeof SC_BLQ !== 'undefined' && SC_BLQ[key]) || null, v = sclLnOv(key) || {};
    var fx = typeof nfFixOf === 'function' ? nfFixOf(c, (c.items || []).length ? k : null) : null, fe = sclFixEntry(c, (c.items || []).length ? k : null);
    out.push({ n: n, k: k, key: key, has: !!B, ty: B ? B.t : 'mov', o: L ? L.o : ((c.r || [])[0] || 'CHO'), r: L ? (L.r || 'A') : 'A',
      q: L ? L.q : it.t, qh: L ? L.qh : (it.h || ''), ev: L ? (L.ev || '') : '', evh: (L && L.evh) || '', mov: it.t,
      split: S ? { at: v.at || (S.a ? S.a.t : ''), ah: v.ah || (S.a ? S.a.h : ''), bt: v.bt || S.b.t, bh: v.bh || S.b.h } : null, kq: Q, kqBase: QB, fix: fx, fe: fe });
  });
  return out;
}
function sclOwnTxt(o) { return o === 'ALL' ? 'All' : String(o || '').split('+').join(' + '); }

// ── Content Manager side panel: Things to check first ──
function sclPanelHTML(c) {
  var L = sclLines(c), lc = L.some(function (x) { return x.has; });
  return '<div class="scl-p"><div class="scl-ph"><b>Things to check · ' + L.length + '</b><small>' + (lc ? 'What staff see' : 'From the MoV items — this checklist has no line cards yet') + '</small></div>'
    + '<small class="scl-lock">🔒 Lines and their types are fixed · text, owner, evidence and fixes can change</small>'
    + L.map(function (x) {
      var T = SCL_TYPE[x.ty] || SCL_TYPE.mov, fx = x.fix, steps = fx && fx.fx ? String(fx.fx).split(/\n+/).filter(Boolean).length : 0, F = x.fe && x.fe.by ? String(x.fe.by).split('+') : null;
      var kq = (x.kq || []).map(function (q, qi) { return '<div class="scl-kq' + (q.add ? ' add' : '') + '"><span>' + (x.kq.length > 1 ? 'Question ' + (qi + 1) + ' of ' + x.kq.length + (q.tp ? ' · ' + sclE(q.tp) : '') : 'Knowledge question · staff see this instead of the line') + (q.add ? ' · <b class="scl-new">New</b>' : '') + '</span><b>' + sclE(q.q) + '</b>' + (q.qh ? '<small>' + sclE(q.qh) + '</small>' : '') + '<ol>' + q.o.map(function (t, j) { return '<li' + (j === q.a ? ' class="ok"' : '') + '>' + sclE(t) + (j === q.a ? ' · right answer' : '') + '</li>'; }).join('') + '</ol>' + (q.x ? '<small>Explanation: ' + sclE(String(q.x).slice(0, 140)) + (String(q.x).length > 140 ? '…' : '') + '</small>' : '') + '</div>'; }).join('');
      var parts = x.split ? '<div class="scl-part"><small>Asked: </small>' + sclE(x.split.at) + '</div><div class="scl-part"><small>Then checked: </small>' + sclE(x.split.bt) + '</div>' : '';
      return '<div class="scl-ln"><span class="scl-n">' + (x.n || 1) + '</span><div class="scl-lb"><span class="scl-chips"><i class="scl-ty">' + sclE(T[0]) + '</i><i class="scl-ow">Answers · ' + sclE(sclOwnTxt(x.o)) + '</i>' + (x.has ? '<i class="scl-rt ' + sclE(x.r) + '">Fix · ' + sclE(SCL_ROUTE[x.r] || x.r) + '</i>' : '') + '</span>'
        + '<span class="scl-q">' + sclE(x.q) + '</span>' + (x.qh ? '<small class="scl-h">' + sclE(x.qh) + '</small>' : '<small class="scl-h miss">No Hindi yet</small>') + parts
        + (x.ev ? '<small class="scl-ev">Evidence: ' + sclE(x.ev) + '</small>' : '') + kq
        + '<button type="button" class="scl-fx" onclick="sclEdit(\'' + sclJ(c.id) + '\',\'fix\',' + x.k + ')">How to fix · ' + (steps ? steps + ' step' + (steps === 1 ? '' : 's') + (fx.tm ? ' · ' + sclE(fx.tm) : '') + ' · ' + (F ? (x.fe.w === 'E' ? 'Each one: ' : 'Together, ' + sclE(x.fe.ld || F[0]) + ' leads: ') + sclE(F.join(' + ')) : (fx.who === 'E' ? 'Each person' : 'Shared')) : 'not written yet') + ' ›</button></div></div>'; }).join('')
    + '<div class="scl-faq"><b>Assessor FAQ · videos</b><div>' + (c.faq ? '<a href="' + sclE(c.faq) + '" target="_blank" rel="noopener">▶ English</a>' : '<button type="button" onclick="sclEdit(\'' + sclJ(c.id) + '\',\'faq\')">＋ Add English video</button>') + (c.faqHi ? '<a href="' + sclE(c.faqHi) + '" target="_blank" rel="noopener">▶ Hindi</a>' : '<button type="button" onclick="sclEdit(\'' + sclJ(c.id) + '\',\'faq\')">＋ Add Hindi video</button>') + '</div></div></div>';
}
(function () {
  if (typeof sccSideHTML !== 'function') return; var o = sccSideHTML;
  sccSideHTML = function (c, ch) { var h = o.apply(this, arguments);
    try { var I = sclJ(c.id);
      // MoV list → folded "Official checklist wording", things to check in its place
      h = h.replace(/<div class="nm-box"><b>MoV · [\s\S]*?<\/ol><\/div>/, function (m) { return sclPanelHTML(c) + '<details class="scl-off"><summary>Official checklist wording (MoV) · used in reports</summary>' + m.replace('<div class="nm-box">', '<div class="nm-box scl-offb">') + '</details>'; });
      if (h.indexOf('scl-p') < 0 && !(c.items || []).length && c.kind === 'nqas') h = h.replace('<dl class="nm-dl2">', sclPanelHTML(c) + '<dl class="nm-dl2">');
      h = h.replace(/<dt>Who<\/dt><dd>[^<]*<\/dd>/, '');   // who answers is per line now
      h = h.replace('<button type="button" class="nm-btn pri" onclick="scCpmEdit(\'' + I + '\')">Edit</button><button type="button" class="nm-btn" onclick="nfFixEdit(\'' + I + '\')">How to fix</button>',
        '<button type="button" class="nm-btn pri" onclick="sclEdit(\'' + I + '\')">Edit</button><button type="button" class="nm-btn" onclick="sclPreview(\'' + I + '\')">See as staff</button>');
    } catch (e) { console.warn('[SCL] panel', e); }
    return h; };
  if (typeof nfFixEdit === 'function') nfFixEdit = function (id) { return sclEdit(id, 'fix'); };
})();

// ── the editor: Checkpoint · Things to check · How to fix · Assessor FAQ ──
var _scl = { id: null, tab: 'lines', d: null, open: {} };
function sclEdit(id, tab, k) {
  if (typeof scCpmCanEdit === 'function' && !scCpmCanEdit()) { showToast('Only HealSol Admin can edit the Checkpoint Master.', 'err'); return; }
  var c = scCpmGet(id); if (!c) return;
  var L = sclLines(c), d = { lines: {}, fix: {}, faq: c.faq || '', faqHi: c.faqHi || '' };
  L.forEach(function (x) {
    d.lines[x.k] = { q: x.q || '', qh: x.qh || '', ev: x.ev || '', evh: x.evh || '', r: x.r, own: blsOwnList(x.o).map(function (r) { return r === 'ALL' ? SCL_ROLES : [r]; }).reduce(function (a, b) { return a.concat(b); }, []),
      split: x.split ? Object.assign({}, x.split) : null, kq: (x.kq || []).map(function (q) { return { q: q.q || '', qh: q.qh || '', o: q.o.slice(), oh: (q.oh || []).slice(), a: q.a, x: q.x || '', xh: q.xh || '', tp: q.tp || '', tph: q.tph || '', add: !!q.add, at: q.at || '' }; }) };
    var f = x.fix || { who: 'S', fx: '', fxh: '', ev: '', evh: '', tm: '' }, e = x.fe || {};
    d.fix[x.k] = { set: !!e.by, by: e.by ? String(e.by).split('+') : d.lines[x.k].own.slice(), ld: e.ld || '', w: (e.w || f.who) === 'E' ? 'E' : 'S', f: f.fx || '', fh: f.fxh || '', e: f.ev || '', eh: f.evh || '', tm: f.tm || '' };
    if (!d.fix[x.k].ld) d.fix[x.k].ld = d.fix[x.k].by[0] || 'CHO';
  });
  _scl = { id: id, tab: tab || 'lines', d: d, L: L, open: {} }; if (k != null) _scl.open[k] = true; else if (L.length) _scl.open[L[0].k] = true;
  sclDraw();
}
function sclClose() { var o = document.getElementById('scl-ov'); if (o) o.remove(); _scl.id = null; }
function sclTab(t) { sclRead(); _scl.tab = t; sclDraw(); }
function sclToggle(k) { sclRead(); _scl.open[k] = !_scl.open[k]; sclDraw(); }
function sclRoleChip(kind, k, r, on, lead) { return '<button type="button" class="scl-rc' + (on ? ' on' : '') + '" onclick="sclRole(\'' + kind + '\',' + k + ',\'' + r + '\')">' + (on ? '✓ ' : '') + r + (lead ? ' · lead' : '') + '</button>'; }
function sclRole(kind, k, r) { sclRead(); var d = _scl.d;
  if (kind === 'own') { var a = d.lines[k].own, i = a.indexOf(r); if (i >= 0) { if (a.length > 1) a.splice(i, 1); } else a.push(r); a.sort(function (x, y) { return SCL_ROLES.indexOf(x) - SCL_ROLES.indexOf(y); }); }
  else if (kind === 'all') { d.lines[k].own = SCL_ROLES.slice(); }
  if (kind === 'own' || kind === 'all') { var G = d.fix[k]; if (G && !G.set) { G.by = d.lines[k].own.slice(); G.ld = G.by[0]; } }   // who fixes follows who answers until it is set
  else { var F = d.fix[k]; F.set = true; var j = F.by.indexOf(r); if (j < 0) { F.by.push(r); F.by.sort(function (x, y) { return SCL_ROLES.indexOf(x) - SCL_ROLES.indexOf(y); }); } else if (F.ld !== r && F.w === 'S') F.ld = r; else if (F.by.length > 1) { F.by.splice(j, 1); if (F.ld === r) F.ld = F.by[0]; } }
  sclDraw(); }
function sclSet(path, v) { sclRead(); var p = path.split('.'), o = _scl.d; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = v; sclDraw(); }
function sclRead() {   // pull typed text back into the draft object
  var ov = document.getElementById('scl-ov'); if (!ov) return;
  ov.querySelectorAll('[data-p]').forEach(function (el) { var p = el.getAttribute('data-p').split('.'), o = _scl.d; for (var i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p[p.length - 1]] = el.value; });
}
function sclKqAdd(k) { sclRead(); _scl.d.lines[k].kq.push({ q: '', qh: '', o: ['', '', '', ''], oh: ['', '', '', ''], a: 0, x: '', xh: '', tp: '', tph: '', add: true, at: new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10) }); sclDraw(); }
function sclKqDel(k, qi) { sclRead(); var L = _scl.d.lines[k].kq; if (L[qi] && L[qi].add) L.splice(qi, 1); sclDraw(); }
function sclTA(p, v, rows, ph) { return '<textarea data-p="' + p + '" rows="' + (rows || 2) + '"' + (ph ? ' placeholder="' + sclE(ph) + '"' : '') + '>' + sclE(v) + '</textarea>'; }
function sclIn(p, v, ph) { return '<input data-p="' + p + '" value="' + sclE(v) + '"' + (ph ? ' placeholder="' + sclE(ph) + '"' : '') + '>'; }
function sclLinesTab() {
  return _scl.L.map(function (x) { var D = _scl.d.lines[x.k], T = SCL_TYPE[x.ty] || SCL_TYPE.mov, k = x.k, P = 'lines.' + k;
    var own = SCL_ROLES.map(function (r) { return sclRoleChip('own', k, r, D.own.indexOf(r) >= 0); }).join('') + '<button type="button" class="scl-all" onclick="sclRole(\'all\',' + k + ')">All four</button>';
    var rt = x.has ? Object.keys(SCL_ROUTE).map(function (r) { return '<button type="button" class="scl-rc' + (D.r === r ? ' on' : '') + '" onclick="sclSet(\'' + P + '.r\',\'' + r + '\')">' + SCL_ROUTE[r] + '</button>'; }).join('') : '';
    var kq = D.kq.map(function (q, qi) { var Q = P + '.kq.' + qi;
      return '<div class="scl-kqe' + (q.add ? ' add' : '') + '"><span class="scl-k">Knowledge question' + (D.kq.length > 1 ? ' ' + (qi + 1) + ' of ' + D.kq.length : '') + (q.add ? ' · <b class="scl-new">New' + (q.at ? ' · added ' + sclE(q.at) : '') + '</b> <button type="button" class="scl-rm" onclick="sclKqDel(' + k + ',' + qi + ')">Remove</button>' : ' · asked instead of the line text') + '</span>'
        + '<div class="scl-2"><label>Topic (English) — shown as “Gap: …” when missed' + sclIn(Q + '.tp', q.tp, 'e.g. Danger signs') + '</label><label>Topic (Hindi)' + sclIn(Q + '.tph', q.tph) + '</label></div>'
        + '<div class="scl-2"><label>Question (English)' + sclTA(Q + '.q', q.q, 2) + '</label><label>Question (Hindi)' + sclTA(Q + '.qh', q.qh, 2) + '</label></div>'
        + '<div class="scl-opts"><span></span><b>Option (English)</b><b>Option (Hindi)</b>' + q.o.map(function (t, j) { return '<button type="button" class="scl-ra' + (q.a === j ? ' on' : '') + '" title="Mark as the right answer" onclick="sclSet(\'' + Q + '.a\',' + j + ')">' + (q.a === j ? '●' : '○') + '</button>' + sclIn(Q + '.o.' + j, t) + sclIn(Q + '.oh.' + j, q.oh[j] || ''); }).join('') + '</div>'
        + '<div class="scl-2"><label>Why (English) — shown after answering' + sclTA(Q + '.x', q.x, 2) + '</label><label>Why (Hindi)' + sclTA(Q + '.xh', q.xh, 2) + '</label></div>'
        + '<small>' + (q.add ? 'A new question reaches a facility on baseline days dated on or after the day it is added; days already open keep the questions they had.' : q.o.length + ' options, always in this order (answers are saved by position) · tap ○ to mark the right one' + ((x.kqBase || [])[qi] && (x.kqBase[qi].a !== q.a) ? ' · <b class="scl-warn">The right answer is changed — baseline answers already given will be re-scored.</b>' : '')) + '</small></div>'; }).join('')
      + ((x.kqBase || []).length ? '<button type="button" class="scl-addq" onclick="sclKqAdd(' + k + ')">＋ Add a question (one per topic)</button>' : '');
    var split = D.split ? '<div class="scl-2"><label>Asked first (English)' + sclTA(P + '.split.at', D.split.at, 2) + '</label><label>Asked first (Hindi)' + sclTA(P + '.split.ah', D.split.ah, 2) + '</label></div><div class="scl-2"><label>Then checked (English)' + sclTA(P + '.split.bt', D.split.bt, 2) + '</label><label>Then checked (Hindi)' + sclTA(P + '.split.bh', D.split.bh, 2) + '</label></div>' : '';
    return '<div class="scl-box"><div class="scl-bh"><span class="scl-n">' + (x.n || 1) + '</span><b>Line ' + (x.n || 1) + '</b><i class="scl-ty">🔒 ' + sclE(T[0]) + '</i><span class="scl-mov">Official MoV: “' + sclE(String(x.mov || '').slice(0, 60)) + (String(x.mov || '').length > 60 ? '…' : '') + '”</span></div>'
      + (x.has ? '<div class="scl-2"><label>What staff see (English)' + sclTA(P + '.q', D.q, 3) + '</label><label>What staff see (Hindi)' + sclTA(P + '.qh', D.qh, 3) + '</label></div>' + split
        : '<p class="scl-note">This checklist has no line cards yet — staff see the MoV item. Change its wording with “Checkpoint details”.</p>')
      + '<div class="scl-row"><div><span class="scl-l">Who answers · tick one or more</span><div class="scl-chs">' + own + '</div></div>' + (rt ? '<div><span class="scl-l">Fix type</span><div class="scl-chs">' + rt + '</div></div>' : '') + '</div>'
      + (x.has ? '<div class="scl-2"><label>How the assessor checks it — evidence hint (English)' + sclIn(P + '.ev', D.ev) + '</label><label>Evidence hint (Hindi)' + sclIn(P + '.evh', D.evh) + '</label></div>' : '') + kq + '</div>'; }).join('')
    + '<p class="scl-note">🔒 Adding, removing or changing a line\'s type is locked — answers are stored against each line.</p>';
}
function sclFixTab() {
  return _scl.L.map(function (x) { var F = _scl.d.fix[x.k], k = x.k, P = 'fix.' + k, open = !!_scl.open[k], steps = String(F.f || '').split(/\n+/).filter(Boolean).length;
    var head = '<button type="button" class="scl-bh scl-tg" onclick="sclToggle(' + k + ')"><span class="scl-n">' + (x.n || 1) + '</span><b>' + sclE(_scl.d.lines[k].q || x.q) + '</b><i class="scl-ow">Fixes · ' + sclE(F.by.length > 1 && F.w === 'S' ? F.ld + ' (lead) + ' + F.by.filter(function (r) { return r !== F.ld; }).join(' + ') : F.by.join(' + ')) + '</i><span>' + (open ? '⌃' : '⌄') + '</span></button>';
    if (!open) return '<div class="scl-box">' + head + '<small class="scl-sum">' + (steps ? steps + ' step' + (steps === 1 ? '' : 's') : 'No steps yet') + (F.tm ? ' · ' + sclE(F.tm) : '') + ' · ' + (F.w === 'E' ? 'Each one fixes their own' : 'Together') + ' · tap to open</small></div>';
    var by = SCL_ROLES.map(function (r) { return sclRoleChip('fix', k, r, F.by.indexOf(r) >= 0, F.w === 'S' && F.by.length > 1 && F.ld === r); }).join('');
    var md = [['S', 'Together — one fix, the lead re-checks'], ['E', 'Each one fixes their own']].map(function (m) { return '<button type="button" class="scl-rc' + (F.w === m[0] ? ' on' : '') + '" onclick="sclSet(\'' + P + '.w\',\'' + m[0] + '\')">' + m[1] + '</button>'; }).join('');
    return '<div class="scl-box">' + head
      + '<div class="scl-row"><div><span class="scl-l">Who fixes · tick one or more' + (F.w === 'S' ? ', tap a ticked one to make them lead' : '') + '</span><div class="scl-chs">' + by + '</div></div><div><span class="scl-l">How they fix it</span><div class="scl-chs">' + md + '</div></div></div>'
      + '<small class="scl-sum">Starts as “who answers”. Together: the lead gets the fix card, the others read it under “Team\'s fixes”. Each one: every ticked person gets their own fix.</small>'
      + '<div class="scl-2"><label>Steps (English) · one per line' + sclTA(P + '.f', F.f, 5, '1. …\n2. …') + '</label><label>Steps (Hindi) · same steps' + sclTA(P + '.fh', F.fh, 5) + '</label></div>'
      + '<div class="scl-3"><label>Evidence to show (English)' + sclTA(P + '.e', F.e, 2) + '</label><label>Evidence to show (Hindi)' + sclTA(P + '.eh', F.eh, 2) + '</label><label>Time to fix' + sclIn(P + '.tm', F.tm, 'e.g. 1 week') + '</label></div></div>'; }).join('')
    + '<p class="scl-note">Staff see these steps on the fix card (“How to fix”) and on a Fixed card (“How it was fixed”). A line with no steps shows its short built-in note.</p>';
}
function sclFaqTab() { var d = _scl.d;
  return '<div class="scl-box"><div class="scl-2"><label>Assessor FAQ video (English) — https link' + sclIn('faq', d.faq, 'https://…') + '</label><label>Assessor FAQ video (Hindi) — https link' + sclIn('faqHi', d.faqHi, 'https://…') + '</label></div><p class="scl-note">Staff see these under “FAQs” in Learn and inside each fix of this checkpoint.</p></div>'; }
function sclCpTab() { var c = scCpmGet(_scl.id);
  return '<div class="scl-box"><p><b>' + sclE(c.t) + '</b></p><p class="scl-h">' + sclE(c.hi || 'No Hindi yet') + '</p><p class="scl-note">' + sclE([c.aoc ? 'AoC ' + c.aoc : '', c.std ? 'Standard ' + c.std : '', c.me || '', c.svc || ''].filter(Boolean).join(' · ')) + '</p>'
    + '<button type="button" class="scl-btn" onclick="sclRead();var id=_scl.id;sclClose();scCpmEdit(id)">Checkpoint details — wording, Area, Standard, ME, package, official MoV…</button></div>'; }
function sclDraw() {
  var c = scCpmGet(_scl.id); if (!c) return; var o = document.getElementById('scl-ov');
  if (!o) { o = document.createElement('div'); o.id = 'scl-ov'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); document.body.appendChild(o); }
  var y = o.querySelector('.scl-body') ? o.querySelector('.scl-body').scrollTop : 0, used = []; try { used = scCpmUsage(_scl.id); } catch (e) {}
  var tabs = [['cp', 'Checkpoint'], ['lines', 'Things to check · ' + _scl.L.length], ['fix', 'How to fix · ' + _scl.L.length], ['faq', 'Assessor FAQ']];
  o.innerHTML = '<div class="scl-bg" onclick="sclClose()"></div><div class="scl-m"><div class="scl-mh"><div><b>Edit checkpoint ' + sclE(_scl.id) + '</b><small>' + sclE(used.length ? 'Used on ' + used.map(function (u) { return u.pkg + ' Day ' + u.day; }).join(', ') + '. ' : '') + 'Changes go to the draft, then Review &amp; publish.</small></div><button type="button" class="ce-x" aria-label="Close" onclick="sclClose()">✕</button></div>'
    + '<div class="scl-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" class="' + (_scl.tab === t[0] ? 'on' : '') + '" onclick="sclTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') + '</div>'
    + '<div class="scl-body">' + (_scl.tab === 'cp' ? sclCpTab() : _scl.tab === 'fix' ? sclFixTab() : _scl.tab === 'faq' ? sclFaqTab() : sclLinesTab()) + '</div>'
    + '<div class="scl-mf"><button type="button" class="scl-btn" onclick="sclRead();sclPreview(_scl.id,true)">See as staff</button><span></span><button type="button" class="scl-btn" onclick="sclClose()">Cancel</button><button type="button" class="scl-btn pri" id="scl-save" onclick="sclSave()">Save to draft</button></div></div>';
  var b = o.querySelector('.scl-body'); if (b) b.scrollTop = y;
}
// what changed, as content-master fields (only what differs from the built-in base)
function sclDiff() {
  var c = scCpmGet(_scl.id), d = _scl.d, ln = {}, kq = {}, own = {}, fix = {}, errs = [];
  _scl.L.forEach(function (x) { var D = d.lines[x.k], l = 'l' + (x.n || 0), B = x.has ? SC_LC[x.key] : null;
    if (B) { var e = {}; [['q', B.q], ['qh', B.qh], ['ev', B.ev], ['evh', B.evh || ''], ['r', B.r]].forEach(function (p) { var v = String(D[p[0]] || '').trim(); if (v && v !== String(p[1] || '')) e[p[0]] = v; });
      var S = (typeof SC_BLS !== 'undefined' && SC_BLS[x.key]) || null; if (S && D.split) [['at', S.a ? S.a.t : ''], ['ah', S.a ? S.a.h : ''], ['bt', S.b.t], ['bh', S.b.h]].forEach(function (p) { var v = String(D.split[p[0]] || '').trim(); if (v && v !== String(p[1] || '')) e[p[0]] = v; });
      if (!String(D.q || '').trim()) errs.push('Line ' + x.n + ': what staff see (English) is empty.');
      if (Object.keys(e).length) ln[l] = e; }
    var QB = x.kqBase || []; if (QB.length) { var changed = D.kq.length !== QB.length, arr = D.kq.map(function (q, i) { var b = QB[i] || {}, o2 = { q: String(q.q || '').trim(), qh: String(q.qh || '').trim(), o: q.o.map(function (t) { return String(t || '').trim(); }), oh: q.oh.map(function (t) { return String(t || '').trim(); }), a: +q.a, x: String(q.x || '').trim(), xh: String(q.xh || '').trim() };
      var tp = String(q.tp || '').trim(), tph = String(q.tph || '').trim(); if (tp) o2.tp = tp; if (tph) o2.tph = tph;
      if (q.add) { o2.add = true; o2.at = q.at || ''; if (!o2.q) errs.push('Line ' + x.n + ': a new question has no question text.'); if (!tp) errs.push('Line ' + x.n + ': give the new question a topic (it is shown as “Gap: …”).'); }
      if (o2.o.some(function (t) { return !t; })) errs.push('Line ' + x.n + ': every option needs English text.');
      if (q.add || o2.q !== b.q || o2.qh !== (b.qh || '') || JSON.stringify(o2.o) !== JSON.stringify(b.o) || JSON.stringify(o2.oh) !== JSON.stringify(b.oh || []) || o2.a !== b.a || o2.x !== (b.x || '') || o2.xh !== (b.xh || '') || (tp || '') !== (b.tp || '') || (tph || '') !== (b.tph || '')) changed = true; return o2; });
      if (changed) kq[l] = arr; }
    var o = SCL_ROLES.every(function (r) { return D.own.indexOf(r) >= 0; }) ? 'ALL' : D.own.join('+'), bo = B ? B.o : null; if (B && o !== bo) own[l] = o;
    var F = d.fix[x.k], key = (c.items || []).length ? String(x.k + 1) : '0';
    fix[key] = { w: F.w === 'E' ? 'E' : 'S', f: String(F.f || '').trim(), fh: String(F.fh || '').trim(), e: String(F.e || '').trim(), eh: String(F.eh || '').trim(), tm: String(F.tm || '').trim() };
    if (F.set) { fix[key].by = F.by.join('+'); fix[key].ld = F.by.indexOf(F.ld) >= 0 ? F.ld : F.by[0]; }
  });
  ['faq', 'faqHi'].forEach(function (f) { if (d[f] && !/^https:\/\//.test(d[f])) errs.push('Assessor FAQ video must start with https://'); });
  // fix: keep the built-in steps when nothing was written or changed
  var fixSame = Object.keys(fix).every(function (key) { var cur = (c.fix || {})[key], nf = typeof NF_FIX !== 'undefined' && NF_FIX[c.id] && NF_FIX[c.id][key], f = fix[key];
    var base = cur ? { w: cur.w || 'S', f: cur.f || '', fh: cur.fh || '', e: cur.e || '', eh: cur.eh || '', tm: cur.tm || '' } : nf ? { w: nf[0] === 'E' ? 'E' : 'S', f: nf[1] || '', fh: nf[2] || '', e: nf[3] || '', eh: nf[4] || '', tm: nf[5] || '' } : { w: 'S', f: '', fh: '', e: '', eh: '', tm: '' };
    return !f.by && JSON.stringify(base) === JSON.stringify({ w: f.w, f: f.f, fh: f.fh, e: f.e, eh: f.eh, tm: f.tm }) && !(cur && cur.by); });
  return { errs: errs, vals: { ln: Object.keys(ln).length ? ln : null, kq: Object.keys(kq).length ? kq : null, own: Object.keys(own).length ? own : null, fix: fixSame ? (c.fix || undefined) : fix, faq: d.faq.trim(), faqHi: d.faqHi.trim() } };
}
async function sclSave() {
  sclRead(); var R = sclDiff(); if (R.errs.length) { scAlert(R.errs.slice(0, 4).join('\n'), 'Please check', '⚠️'); return; }
  var b = document.getElementById('scl-save'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  var v = R.vals; if (v.fix === undefined) delete v.fix;
  var ok = await scCpmSave(_scl.id, v);
  showToast(ok ? 'Saved to the draft — ' + _scl.id + '. Review & publish when ready.' : 'Could not save — check connection.', ok ? 'ok' : 'err');
  if (ok) { sclClose(); try { if (typeof scdBadge === 'function') scdBadge(); } catch (e) {} scCpmRender(); } else if (b) { b.disabled = false; b.textContent = 'Save to draft'; }
}

// ── See as staff: the baseline card and the fix card, from the draft (or what is being edited) ──
var _sclPv = { id: null, hi: false, live: false };
function sclPreview(id, live) { _sclPv = { id: id, hi: _sclPv.id === id ? _sclPv.hi : false, live: !!live }; sclPvDraw(); }
function sclPvLang(hi) { _sclPv.hi = !!hi; sclPvDraw(); }
function sclPvDraw() {
  var c = scCpmGet(_sclPv.id); if (!c) return; var keep = typeof _appLang !== 'undefined' ? _appLang : 'en', d = _sclPv.live && _scl.id === c.id ? _scl.d : null, bl = '', fx = '';
  try { if (typeof _appLang !== 'undefined') _appLang = _sclPv.hi ? 'hi' : 'en';
    var hi = _sclPv.hi, S = []; try { S = blsSlots(c, { elderly: true }); } catch (e) {}
    S = S.map(function (s) { if (!d) return s; var D = d.lines[s.k]; if (!D) return s; var t = Object.assign({}, s);
      if (s.kind === 'mcq' && D.kq[s.qi]) { var q = D.kq[s.qi]; t.q = Object.assign({}, s.q, { q: q.q, qh: q.qh, o: q.o, oh: q.oh, a: +q.a }); }
      else if (s.part === 'a' && D.split) { t.t = D.split.at; t.h = D.split.ah; } else if (s.part === 'b' && D.split) { t.t = D.split.bt; t.h = D.split.bh; }
      else if (!s.part) { t.t = D.q; t.h = D.qh; }
      t.own = SCL_ROLES.every(function (r) { return D.own.indexOf(r) >= 0; }) ? 'ALL' : D.own.join('+'); return t; });
    var rows = S.map(function (s) { var who = '<small class="scl-pw">' + sclE(sclOwnTxt(s.own)) + '</small>'; try { return who + blsRowHTML(0, 0, s, undefined, S.length === 1); } catch (e) { return who + '<p>' + sclE(hi && s.h ? s.h : s.t) + '</p>'; } }).join('');
    bl = '<div class="bls-card bls-acc" style="--acc:#1E6B5E;--acc-t:#E6F2EF"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">1</span><div class="bls-chm"><span class="bls-k">' + sclE(c.id) + '</span><div class="bls-cpt">' + sclE(hi && c.hi ? c.hi : c.t) + '</div></div></div><div class="bls-cbody">' + rows + '</div></div>';
    var L = sclLines(c), first = L.filter(function (x) { var F = d ? d.fix[x.k] : null; return F ? F.f : x.fix && x.fix.fx; })[0] || L[0];
    if (first) { var F = d ? d.fix[first.k] : null, f = F ? { fx: F.f, fxh: F.fh, ev: F.e, evh: F.eh, tm: F.tm } : (first.fix || {}), st = String((hi && f.fxh) || f.fx || '').split(/\n+/).filter(Boolean);
      fx = '<div class="bls-card bls-acc imf-fixc" style="--acc:#C9852F;--acc-t:#FBF3E4"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">1</span><div class="bls-chm"><span class="bls-k">' + sclE(c.id) + ' · ' + sclE((SCL_ROUTE[first.r] || '').toUpperCase()) + '</span><div class="bls-cpt">' + sclE(hi && c.hi ? c.hi : c.t) + '</div></div></div><div class="bls-cbody imf-body">'
        + (st.length ? '<div class="imf-sec"><small>' + (hi ? 'कैसे सुधारें' : 'HOW TO FIX') + ' · ' + st.length + '</small>' + sclStepsHTML(st, false) + '</div>' : '<p class="scl-note">No steps written for this line yet.</p>')
        + ((hi && f.evh) || f.ev ? '<div class="imf-evb"><small>' + (hi ? 'दिखाने के लिए प्रमाण' : 'EVIDENCE TO SHOW') + '</small><span>' + sclE((hi && f.evh) || f.ev) + '</span>' + (f.tm ? '<em>⏱ ' + sclE(f.tm) + '</em>' : '') + '</div>' : '') + '</div></div>'; }
  } finally { if (typeof _appLang !== 'undefined') _appLang = keep; }
  var o = document.getElementById('scl-pv'); if (!o) { o = document.createElement('div'); o.id = 'scl-pv'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); document.body.appendChild(o); }
  o.innerHTML = '<div class="scl-bg" onclick="document.getElementById(\'scl-pv\').remove()"></div><div class="scl-m scl-pvm"><div class="scl-mh"><div><b>See as staff · ' + sclE(c.id) + '</b><small>' + (_sclPv.live ? 'What you are editing, before saving' : 'The draft, as it will look after publishing') + '</small></div><span class="scl-lang"><button type="button" class="' + (_sclPv.hi ? '' : 'on') + '" onclick="sclPvLang(false)">English</button><button type="button" class="' + (_sclPv.hi ? 'on' : '') + '" onclick="sclPvLang(true)">हिंदी</button></span><button type="button" class="ce-x" aria-label="Close" onclick="document.getElementById(\'scl-pv\').remove()">✕</button></div>'
    + '<div class="scl-phones"><div class="scl-ph1"><small>BASELINE CARD</small><div class="bls scl-inert">' + bl + '</div></div><div class="scl-ph1"><small>FIX CARD</small><div class="bls scl-inert">' + fx + '</div></div></div></div>';
}
function sclStepsHTML(steps, done) {
  return '<ol class="imf-steps' + (done ? ' done' : '') + '">' + steps.map(function (t, i) { return '<li><i>' + (done ? '✓' : i + 1) + '</i><span>' + sclE(String(t).replace(/^\s*\d+[.)]\s*/, '')) + '</span></li>'; }).join('') + '</ol>';
}

// ══ Excel: Things to check · Knowledge questions · How to fix (one row per line) ══
var SCL_XT = ['ID', 'Line', 'Type', 'Official MoV', 'What staff see (English)', 'What staff see (Hindi)', 'Who answers (CHO / ANM / ASHA / MPW, + for more, or All)', 'Fix type (Arrange / Learn / Record / Practise)', 'Evidence hint (English)', 'Evidence hint (Hindi)'];
var SCL_XQ = ['ID', 'Line', 'Q no.', 'Question (English)', 'Question (Hindi)', 'Option A', 'Option A (Hindi)', 'Option B', 'Option B (Hindi)', 'Option C', 'Option C (Hindi)', 'Option D', 'Option D (Hindi)', 'Right answer (A–D)', 'Why (English)', 'Why (Hindi)', 'Topic (shown as Gap: …)', 'Topic (Hindi)'];
var SCL_XF = ['ID', 'Line', 'Thing to check', 'Who fixes (+ for more)', 'Lead', 'How (Together / Each one)', 'Steps (English, one per line)', 'Steps (Hindi)', 'Evidence (English)', 'Evidence (Hindi)', 'Time to fix'];
function sclAllLc() { return scCpmAll({ includeRetired: false }).filter(function (c) { return c.kind === 'nqas'; }); }
function sclXRows() {
  var T = [SCL_XT], Q = [SCL_XQ], F = [SCL_XF];
  sclAllLc().forEach(function (c) { sclLines(c).forEach(function (x) { if (!x.has) return; var n = x.n;
    T.push([c.id, n, (SCL_TYPE[x.ty] || SCL_TYPE.mov)[0], x.mov || '', x.q || '', x.qh || '', sclOwnTxt(x.o), SCL_ROUTE[x.r] || x.r, x.ev || '', x.evh || '']);
    (x.kq || []).forEach(function (q, i) { var r = [c.id, n, i + 1, q.q || '', q.qh || '']; for (var j = 0; j < 4; j++) r.push(q.o[j] || '', (q.oh || [])[j] || ''); r.push('ABCD'.charAt(q.a), q.x || '', q.xh || '', q.tp || '', q.tph || ''); Q.push(r); });
    var f = x.fix || {}, e = x.fe || {}, by = e.by ? String(e.by).split('+') : blsOwnList(x.o);
    F.push([c.id, n, x.q || '', by.join(' + ') === 'ALL' ? 'All' : by.join(' + '), e.by ? (e.ld || by[0]) : '', (e.w || f.who) === 'E' ? 'Each one' : 'Together', f.fx || '', f.fxh || '', f.ev || '', f.evh || '', f.tm || '']); }); });
  return { T: T, Q: Q, F: F };
}
sccExport = async function () {
  try {
    var X = await nfLoadXlsx(), wb = X.utils.book_new(), R = sccRows(), L = sclXRows();
    var ws = X.utils.aoa_to_sheet(R.rows); ws['!cols'] = [8, 6, 8, 9, 60, 50, 26, 16, 26, 10, 10, 10, 34, 30, 30, 8].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, 'Checkpoints');
    var wt = X.utils.aoa_to_sheet(R.tick); wt['!cols'] = [8, 5, 60, 50, 26].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, wt, 'Things to tick');
    var w1 = X.utils.aoa_to_sheet(L.T); w1['!cols'] = [8, 5, 18, 40, 60, 55, 22, 14, 40, 40].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, w1, 'Things to check');
    var w2 = X.utils.aoa_to_sheet(L.Q); w2['!cols'] = [8, 5, 5, 50, 45, 24, 24, 24, 24, 24, 24, 24, 24, 10, 50, 45].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, w2, 'Knowledge questions');
    var w3 = X.utils.aoa_to_sheet(L.F); w3['!cols'] = [8, 5, 50, 18, 8, 12, 60, 55, 40, 40, 12].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, w3, 'How to fix');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['NQAS FAST · Sub-Centre checkpoints'],
      ['Checkpoints: you can change Checkpoint, Checkpoint (Hindi), Service package / area, How it is checked, Packages, Baseline day (moved, 1–7), Implementation day (moved, 8–49), Video, Video (Hindi), Assessor FAQ video, Assessor FAQ video (Hindi), Retired (yes / blank). Things to tick = the official MoV wording, used in reports.'],
      ['Things to check: one row per thing to check — what staff see. You can change What staff see (English / Hindi), Who answers (e.g. ANM, ANM + ASHA, All), Fix type and the evidence hints. Type and Official MoV are for reference.'],
      ['Knowledge questions: the question asked instead of the line text. You can change the question, the option texts, the right answer (A–D) and Why. Keep the options in the same order — answers are saved by position. Changing the right answer re-scores answers already given.'],
      ['How to fix: one row per thing to check. Who fixes (e.g. ANM + ASHA), Lead (one of them), How (Together = the lead fixes and re-checks; Each one = everyone fixes their own), Steps (one per line), Evidence and Time.'],
      ['Do not add, remove or reorder rows in these three sheets — lines are locked. Do not change ID or Line.'],
      ['Upload the file in Content → Sub-Centre → Import / export. Every change is shown before it goes into the draft; nothing reaches facilities until you publish.']]), 'Read me');
    var name = 'NQAS-FAST-SC-checkpoints-' + new Date().toISOString().slice(0, 10) + '.xlsx';
    if (typeof nfSaveWb === 'function') await nfSaveWb(X, wb, name); else X.writeFile(wb, name);
    showToast('Excel downloaded.', 'ok');
  } catch (e) { console.warn('[SCL] export', e); showToast('Could not create the Excel file.', 'err'); }
};
function sclParseOwn(v) {   // "ANM + ASHA" / "All" → 'ANM+ASHA' / 'ALL'; null when not valid
  var t = String(v || '').toUpperCase().replace(/\s+/g, ' ').trim(); if (!t) return null; if (/^ALL( STAFF)?$/.test(t)) return 'ALL';
  var L = t.split(/\s*[+,&\/]\s*|\s+AND\s+/).filter(Boolean); if (!L.length || L.some(function (r) { return SCL_ROLES.indexOf(r) < 0; })) return null;
  L = SCL_ROLES.filter(function (r) { return L.indexOf(r) >= 0; }); return L.length === 4 ? 'ALL' : L.join('+');
}
function sclRouteOf(v) { var t = String(v || '').trim().toLowerCase(); if (!t) return null; var k = Object.keys(SCL_ROUTE).filter(function (r) { return SCL_ROUTE[r].toLowerCase() === t || r.toLowerCase() === t; })[0]; return k || null; }
function sclImportSheets(X, wb, rep) {
  var rows = function (name) { var s = wb.Sheets[name]; return s ? X.utils.sheet_to_json(s, { header: 1, defval: '' }).slice(1) : null; }, N = sccNorm;
  var acc = {}, note = rep.lines = rep.lines || [];
  var get = function (id) { if (acc[id]) return acc[id]; var c = scCpmGet(id); if (!c) return null; var e = (_scCpm.added[id] || _scCpm.edits[id] || {});
    acc[id] = { c: c, ln: JSON.parse(JSON.stringify(e.ln || {})), kq: JSON.parse(JSON.stringify(e.kq || {})), own: Object.assign({}, c.own || {}), fix: JSON.parse(JSON.stringify(c.fix || {})), ch: {} }; return acc[id]; };
  var T = rows('Things to check');
  if (T) T.forEach(function (r, i) { var id = N(r[0]), n = N(r[1]); if (!id) return; var key = id + '.' + n, B = typeof SC_LC !== 'undefined' && SC_LC[key]; if (!B) { rep.bad.push('Things to check row ' + (i + 2) + ': ' + key + ' is not a line in the checklist'); return; }
    var A = get(id); if (!A) return; var l = 'l' + n, cur = blsLC(key), e = A.ln[l] || {}, chg = [];
    [['q', 4, 'text'], ['qh', 5, 'Hindi'], ['ev', 8, 'evidence hint'], ['evh', 9, 'evidence hint (Hindi)']].forEach(function (p) { var v = N(r[p[1]]); if (p[0] === 'q' && !v) { rep.bad.push(key + ': what staff see is empty — kept as it was'); return; } if (v === N(cur[p[0]] || '')) return; if (v === N(B[p[0]] || '')) delete e[p[0]]; else e[p[0]] = v; chg.push(p[2]); });
    var rt = N(r[7]); if (rt) { var rr = sclRouteOf(rt); if (!rr) rep.bad.push(key + ': fix type must be Arrange, Learn, Record or Practise — kept as it was'); else if (rr !== cur.r) { if (rr === B.r) delete e.r; else e.r = rr; chg.push('fix type'); } }
    if (Object.keys(e).length) A.ln[l] = e; else delete A.ln[l];
    var ow = N(r[6]); if (ow) { var o = sclParseOwn(ow); if (!o) rep.bad.push(key + ': who answers must be CHO, ANM, ASHA, MPW (+ for more) or All — kept as it was'); else if (o !== cur.o) { if (o === B.o) delete A.own[l]; else A.own[l] = o; chg.push('who answers ' + sclOwnTxt(cur.o) + ' → ' + sclOwnTxt(o)); } }
    if (chg.length) { A.ch.ln = 1; note.push(key + ': ' + chg.join(', ')); } });
  var Q = rows('Knowledge questions');
  if (Q) { var byLine = {}; Q.forEach(function (r, i) { var id = N(r[0]), n = N(r[1]), qi = (+N(r[2]) || 1) - 1; if (!id) return; (byLine[id + '.' + n] = byLine[id + '.' + n] || []).push({ qi: qi, r: r, row: i + 2 }); });
    Object.keys(byLine).forEach(function (key) { var QB = typeof SC_BLQ !== 'undefined' && SC_BLQ[key]; if (!QB) { rep.bad.push('Knowledge questions: ' + key + ' has no knowledge question'); return; }
      var k = sclKeyN(key), A = get(k.id); if (!A) return; var cur = sclKqOf(key), arr = cur.map(function (q) { var y = { q: q.q, qh: q.qh || '', o: q.o.slice(), oh: (q.oh || []).slice(), a: q.a, x: q.x || '', xh: q.xh || '' }; if (q.tp) y.tp = q.tp; if (q.tph) y.tph = q.tph; if (q.add) { y.add = true; y.at = q.at || ''; } return y; }), chg = false;
      byLine[key].sort(function (a, b) { return a.qi - b.qi; }).forEach(function (x) { var q = arr[x.qi], r = x.r;
        if (!q) { if (x.qi !== arr.length) { rep.bad.push('Knowledge questions row ' + x.row + ': ' + key + ' question ' + (x.qi + 1) + ' — number the new questions in order'); return; }
          if (!N(r[3]) || !N(r[16])) { rep.bad.push('Knowledge questions row ' + x.row + ': a new question needs the question and a topic'); return; }
          q = { q: '', qh: '', o: ['', '', '', ''], oh: ['', '', '', ''], a: 0, x: '', xh: '', add: true, at: new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10) }; arr.push(q); chg = true; note.push(key + ': new question ' + (x.qi + 1) + ' (' + N(r[16]) + ')'); }
        var nq = { q: N(r[3]) || q.q, qh: N(r[4]), o: [], oh: [], a: 'ABCD'.indexOf(N(r[13]).toUpperCase()), x: N(r[14]), xh: N(r[15]) };
        if (N(r[16])) nq.tp = N(r[16]); if (N(r[17])) nq.tph = N(r[17]); if (q.add) { nq.add = true; nq.at = q.at || ''; }
        for (var j = 0; j < q.o.length; j++) { nq.o.push(N(r[5 + j * 2]) || q.o[j]); nq.oh.push(N(r[6 + j * 2])); }
        if (nq.a < 0 || nq.a >= q.o.length) { rep.bad.push(key + ' question ' + (x.qi + 1) + ': right answer must be ' + 'ABCD'.slice(0, q.o.length).split('').join(', ') + ' — kept as it was'); nq.a = q.a; }
        if (JSON.stringify(nq) !== JSON.stringify(q)) { chg = true; note.push(key + ' question ' + (x.qi + 1) + ': ' + (nq.a !== q.a ? 'right answer ' + 'ABCD'.charAt(q.a) + ' → ' + 'ABCD'.charAt(nq.a) + ' (answers already given are re-scored)' : 'wording')); arr[x.qi] = nq; } });
      if (chg) { var same = arr.length === QB.length && arr.every(function (q, i) { var b = QB[i]; return !q.tp && !q.tph && q.q === b.q && q.qh === (b.qh || '') && JSON.stringify(q.o) === JSON.stringify(b.o) && JSON.stringify(q.oh) === JSON.stringify(b.oh || []) && q.a === b.a && q.x === (b.x || '') && q.xh === (b.xh || ''); });
        if (same) delete A.kq['l' + k.n]; else A.kq['l' + k.n] = arr; A.ch.kq = 1; } }); }
  var Fx = rows('How to fix');
  if (Fx) Fx.forEach(function (r, i) { var id = N(r[0]), n = N(r[1]); if (!id) return; var A = get(id); if (!A) { rep.bad.push('How to fix row ' + (i + 2) + ': ID ' + id + ' is not in the checklist'); return; }
    var c = A.c, key = (c.items || []).length ? String(n) : '0', cur = typeof nfFixOf === 'function' ? nfFixOf(c, (c.items || []).length ? (+n - 1) : null) : null; cur = cur || { who: 'S', fx: '', fxh: '', ev: '', evh: '', tm: '' };
    var e0 = A.fix[key] || {}, by = N(r[3]), byP = by ? sclParseOwn(by) : null; if (by && !byP) { rep.bad.push(id + ' line ' + n + ': who fixes must be CHO, ANM, ASHA, MPW (+ for more) or All — kept as it was'); byP = null; }
    var nf = { w: /each/i.test(N(r[5])) ? 'E' : 'S', f: N(r[6]), fh: N(r[7]), e: N(r[8]), eh: N(r[9]), tm: N(r[10]) };
    var was = { w: (e0.w || cur.who) === 'E' ? 'E' : 'S', f: cur.fx || '', fh: cur.fxh || '', e: cur.ev || '', eh: cur.evh || '', tm: cur.tm || '' };
    var byList = byP ? (byP === 'ALL' ? SCL_ROLES.slice() : byP.split('+')) : null, ld = N(r[4]).toUpperCase();
    var lineOwn = (typeof SC_LC !== 'undefined' && SC_LC[id + '.' + n]) ? blsLC(id + '.' + n).o : '', defBy = lineOwn === 'ALL' ? SCL_ROLES.join('+') : lineOwn;
    if (byList && ld && byList.indexOf(ld) < 0) { rep.bad.push(id + ' line ' + n + ': the lead must be one of who fixes — first one used'); ld = ''; }
    var setBy = byList && (byList.join('+') !== defBy || e0.by || (ld && ld !== byList[0])) ? byList.join('+') : null;
    var same = JSON.stringify(nf) === JSON.stringify(was) && (setBy || '') === (e0.by || '') && (!setBy || (ld || byList[0]) === (e0.ld || byList[0]));
    if (same) return;
    var rec = Object.assign({}, nf); if (setBy) { rec.by = setBy; rec.ld = ld || byList[0]; }
    // keep every other line's How to fix as it is (the content master stores the whole map)
    (c.items || []).length ? c.items.forEach(function (_, j) { var kk = String(j + 1); if (!A.fix[kk]) { var f0 = nfFixOf(c, j); if (f0) A.fix[kk] = { w: f0.who === 'E' ? 'E' : 'S', f: f0.fx || '', fh: f0.fxh || '', e: f0.ev || '', eh: f0.evh || '', tm: f0.tm || '' }; } }) : null;
    A.fix[key] = rec; A.ch.fix = 1; note.push(id + ' line ' + n + ': How to fix' + (setBy ? ' · ' + (rec.w === 'E' ? 'each one: ' : 'together, ' + rec.ld + ' leads: ') + setBy.split('+').join(' + ') : '')); });
  Object.keys(acc).forEach(function (id) { var A = acc[id]; if (!Object.keys(A.ch).length) return;
    var d = {}; if (A.ch.ln) { d.ln = Object.keys(A.ln).length ? A.ln : null; d.own = Object.keys(A.own).length ? A.own : null; } if (A.ch.kq) d.kq = Object.keys(A.kq).length ? A.kq : null; if (A.ch.fix) d.fix = A.fix;
    var ex = rep.changed.filter(function (y) { return y.id === id; })[0]; if (ex) Object.assign(ex.diff, d); else { rep.changed.push({ id: id, t: A.c.t, diff: d }); if (rep.same > 0) rep.same--; } });
  return rep;
}
(function () {
  if (typeof sccImportWb !== 'function') return; var o = sccImportWb;
  sccImportWb = function (X, wb) { var rep = o.apply(this, arguments); if (!rep) return rep; try { sclImportSheets(X, wb, rep); } catch (e) { console.warn('[SCL] import', e); } _scc.imp = rep; scCpmRender(); return rep; };
  if (typeof sccImpPreviewHTML === 'function') { var p = sccImpPreviewHTML; sccImpPreviewHTML = function (I) { var h = p.apply(this, arguments); var L = I.lines || [];
    if (L.length) h = h.replace('</ul>', '<li><b>' + L.length + ' change' + (L.length === 1 ? '' : 's') + ' to things to check, knowledge questions or How to fix</b> · ' + sclE(L.slice(0, 12).join(' · ')) + (L.length > 12 ? ' …' : '') + '</li></ul>'); return h; }; }
})();

// ══ 27 Nov 2026: suggested questions, one per topic (data/sc/kq-extra.js) → the Sub-Centre draft, for review here ══
function sclDraftCount() { if (typeof SC_KQ_DRAFT === 'undefined') return { lines: 0, qs: 0, done: 0 }; var n = 0, done = 0;
  Object.keys(SC_KQ_DRAFT).forEach(function (key) { var have = (sclKqOf(key) || []).map(function (q) { return q.q; }); SC_KQ_DRAFT[key].add.forEach(function (q) { n++; if (have.indexOf(q.q) >= 0) done++; }); });
  return { lines: Object.keys(SC_KQ_DRAFT).length, qs: n, done: done }; }
async function sclLoadDrafts() {
  if (typeof SC_KQ_DRAFT === 'undefined' || !scCpmCanEdit()) return;
  var today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10), byId = {}, added = 0;
  Object.keys(SC_KQ_DRAFT).forEach(function (key) { var k = sclKeyN(key), D = SC_KQ_DRAFT[key], cur = sclKqOf(key) || [];
    var arr = cur.map(function (q, i) { var y = { q: q.q, qh: q.qh || '', o: q.o.slice(), oh: (q.oh || []).slice(), a: q.a, x: q.x || '', xh: q.xh || '' };
      var tp = q.tp || (i === 0 && D.t0 ? D.t0[0] : ''), tph = q.tph || (i === 0 && D.t0 ? D.t0[1] : ''); if (tp) y.tp = tp; if (tph) y.tph = tph; if (q.add) { y.add = true; y.at = q.at || ''; } return y; });
    var have = arr.map(function (q) { return q.q; });
    D.add.forEach(function (q) { if (have.indexOf(q.q) >= 0) return; arr.push({ q: q.q, qh: q.qh, o: q.o.slice(), oh: q.oh.slice(), a: q.a, x: q.x, xh: q.xh, tp: q.tp[0], tph: q.tp[1], add: true, at: today }); added++; });
    var e = (_scCpm.added[k.id] || _scCpm.edits[k.id] || {}); byId[k.id] = byId[k.id] || Object.assign({}, JSON.parse(JSON.stringify(e.kq || {}))); byId[k.id]['l' + k.n] = arr; });
  if (!added) { showToast('The suggested questions are already in the draft.', 'ok'); return; }
  var ok = 0, ids = Object.keys(byId); for (var i = 0; i < ids.length; i++) { if (await scCpmSave(ids[i], { kq: byId[ids[i]] })) ok++; }
  showToast(added + ' suggested questions put in the draft (' + ok + ' checkpoints). Review each in Checkpoints → Edit → Things to check, then Review & publish.', ok === ids.length ? 'ok' : 'err');
  try { if (typeof scdBadge === 'function') scdBadge(); } catch (e) {} scCpmRender();
}
(function () {
  if (typeof sccImpHTML !== 'function') return; var o = sccImpHTML;
  sccImpHTML = function () { var h = o.apply(this, arguments); try { var C = sclDraftCount(); if (!C.qs) return h;
    h += '<section class="ce-card scl-sug"><b>Suggested knowledge questions · one per topic</b><p>' + C.qs + ' new questions for ' + C.lines + ' knowledge lines that cover several topics (e.g. A-001 line 3: diet, calcium, birth preparedness, danger signs), in English and Hindi. They go into the draft, marked <em>New</em>, for you to review, edit or remove in each checkpoint before publishing.</p>'
      + (C.done >= C.qs ? '<p class="scl-note">All ' + C.qs + ' are already in the content.</p>' : '<button type="button" class="scl-btn pri" onclick="sclLoadDrafts()">Put ' + (C.qs - C.done) + ' suggested questions in the draft</button>') + '</section>'; } catch (e) { console.warn('[SCL] sug', e); } return h; };
})();
