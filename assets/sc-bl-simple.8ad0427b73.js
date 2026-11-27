// ══════════════════════════════════════════════════════════════
// SIMPLE BASELINE (23 Nov 2026; canvas "Simple baseline", approved; question and split sheets reviewed by HealSol)
//  Sub-Centre baseline days (1–7) show one checkpoint per slide. Each MoV line is answered:
//    • Met / Not met / Not sure (Not sure counts as Not met and marks a learning need), or
//    • a multiple-choice question for SI knowledge MoVs (SC_BLQ) — Met only if the right choice is picked; the answer is never shown in the baseline
//  MoVs with two methods (SC_BLS) become part A (question / ask staff) + part B (records / observe / ask a client); the MoV is met only
//  when both parts are met, so the NQAS 0/1/2 score per checkpoint is unchanged (scMovScore on the per-MoV ticks).
//  No videos, How to fix, Doesn't match or scores during the baseline week: Review & submit → "Baseline done ✓" only.
//  Answers: day record blAns/c{ci} = {slot: '1' | '0' | '?' | 'o0'..'o3'}; ticks and scores are worked out from them as before.
//  After the baseline is complete (facility blDoneOn): the in-charge sees the baseline report with "Understanding gaps", and
//  implementation cards open with "Your team saw this differently in the baseline".
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI, { 'Not sure': 'पता नहीं', 'Review & submit': 'जाँचें और जमा करें', 'Baseline done': 'बेसलाइन पूरी', 'Back': 'वापस', 'Next': 'आगे' });
var _bls = { di: null, i: 0, review: false, want: null };
var BLS_METH = { SI: ['💬', 'Ask staff', 'स्टाफ़ से पूछें'], RR: ['📄', 'Check records', 'रिकॉर्ड देखें'], OB: ['👁', 'Observe', 'देखें'], CI: ['🧑', 'Ask a client', 'लाभार्थी से पूछें'], 'CI+SI': ['🧑', 'Ask staff and 2–3 people', 'स्टाफ़ और 2–3 लोगों से पूछें'] };
function blsHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function blsT(en, hi) { return blsHi() && hi ? hi : en; }
function blsE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function blsBaseN() { return typeof SC_BASELINE_DAYS !== 'undefined' ? SC_BASELINE_DAYS : 7; }
function blsSC() { try { return typeof appMode !== 'undefined' && appMode === 'cho' && /^nqas_12[AB]$/.test(choState.progId || ''); } catch (e) { return false; } }
function blsComplete() { try { return !!((choState.facility || {}).blDoneOn); } catch (e) { return false; } }
function blsDemo() { try { var f = choState.facility || {}; return !!f.showcase || /-DMO-/.test(choState.facilityCode || ''); } catch (e) { return false; } }
// simple baseline: a Sub-Centre staff login, a baseline day, before the baseline is complete
function blsOn(di) { try { return typeof appMode !== 'undefined' && appMode === 'cho' && /^nqas_12[AB]$/.test(choState.progId || '') && di >= 0 && di < blsBaseN() && !blsComplete() && !blsDemo() && typeof SC_BLQ !== 'undefined'; } catch (e) { return false; } }
function blsHash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function blsOrder(seed) { var o = [0, 1, 2, 3], x = blsHash(seed) || 1; for (var i = 3; i > 0; i--) { x = Math.imul(x ^ (x >>> 15), 2246822519) >>> 0; var j = x % (i + 1), t0 = o[i]; o[i] = o[j]; o[j] = t0; } return o; }
// the answer lines of one checkpoint — from the line cards (SC_LC, HealSol master sheet 24 Nov 2026) where present
// kinds: mcq (knowledge question) · tri (3 buttons, worded by answer type) · list (one tap per item) · sample (0–5 of 5 cases) · ind (3 monthly numbers)
var BLS_LISTS = { stock: 1, equip: 1, tests: 1, yn: 1 };
function blsFlags() { try { return (choState.facility || {}).clFlags || {}; } catch (e) { return {}; } }
function blsApplies(code, F) { F = F || blsFlags(); if (!code || code === '12B') return true; if (code === 'elderly') return F.elderly !== false; if (code === 'maleCHO') return !!F.maleCHO; return !!F[code]; }
function blsLC(key) { var L = (typeof SC_LC !== 'undefined' && SC_LC[key]) || null; if (!L) return null; var o = blsOwnFor(key); return o && o !== L.o ? Object.assign({}, L, { o: o }) : L; }
// 27 Nov 2026: who owns each thing to check can be changed in the content master ("Lines & owners" sheet → draft → publish).
// Stored on the checkpoint as own: {l1: 'CHO', l2: 'ALL'} — only the lines that differ from the built-in sheet.
var _blsOwn = { ver: -1, map: {} };
function blsOwnFor(key) {
  try { if (typeof _scCpm === 'undefined') return null;
    if (_blsOwn.ver !== _scCpm.ver) { var m = {}; [_scCpm.edits || {}, _scCpm.added || {}].forEach(function (E) { Object.keys(E).forEach(function (id) { if (E[id] && E[id].own) m[id] = E[id].own; }); }); _blsOwn = { ver: _scCpm.ver, map: m }; }
    var p = String(key).lastIndexOf('.'), o = _blsOwn.map[String(key).slice(0, p)]; return o ? (o['l' + String(key).slice(p + 1)] || null) : null; } catch (e) { return null; }
}
function blsSlots(cp, F) {
  var items = cp.items || [], out = [];
  var add = function (key, k, txt, txh, meth) {
    var S = (typeof SC_BLS !== 'undefined' && SC_BLS[key]) || null, Q = SC_BLQ[key] || null, L = blsLC(key);
    if (L && !blsApplies(L.a, F)) return;                                   // not applicable here (facility profile) — left out
    var own = L ? L.o : '', ty = L ? L.t : '', hn = L ? (L.hn || '') : '';
    if (S) {
      if (Q) Q.forEach(function (q, i) { out.push({ id: k + 'q' + i, k: k, key: key, kind: 'mcq', q: q, qi: i, m: 'SI', part: 'a', own: own }); });
      else out.push({ id: k + 'a', k: k, key: key, kind: 'tri', t: S.a ? S.a.t : txt, h: S.a ? S.a.h : txh, m: 'SI', ty: 'know', part: 'a', own: own });
      out.push({ id: k + 'b', k: k, key: key, kind: 'tri', t: S.b.t, h: S.b.h, m: S.b.m, ty: (ty && !BLS_LISTS[ty] && ty !== 'sample' && ty !== 'ind') ? ty : '', part: 'b', own: own });
    } else if (Q) Q.forEach(function (q, i) { out.push({ id: k + 'q' + i, k: k, key: key, kind: 'mcq', q: q, qi: i, m: 'SI', own: own }); });
    else if (L && BLS_LISTS[ty]) {
      var its = (L.i || []).map(function (x, j) { return Array.isArray(x) ? { n: x[0], a: x[1], j: j } : { n: x, j: j }; }).filter(function (x) { return blsApplies(x.a, F); });
      out.push({ id: String(k), k: k, key: key, kind: 'list', ty: ty, t: L.q, h: L.qh, items: its, own: own, hn: hn });
    }
    else if (L && ty === 'sample') out.push({ id: String(k), k: k, key: key, kind: 'sample', ty: ty, t: L.q, h: L.qh, own: own, hn: hn });
    else if (L && ty === 'ind') out.push({ id: String(k), k: k, key: key, kind: 'ind', ty: ty, t: L.q, h: L.qh, own: own, hn: hn });
    else out.push({ id: String(k), k: k, key: key, kind: 'tri', t: L ? L.q : txt, h: L ? L.qh : txh, m: (SC_BLM && SC_BLM[key]) || meth || '', ty: ty, own: own, hn: hn });
  };
  if (!items.length) add(cp.id + '.0', 0, cp.t, cp.hi, (cp.method || cp.methods || []).join('/'));
  else items.forEach(function (it, k) { add(cp.id + '.' + (k + 1), k, it.t, it.h, (it.m || []).join('/')); });
  return out;
}
// is this line mine? owner role from the line card; ALL = everyone; a role the facility does not have falls to the CHO
function blsOwnerOK(own, role, present) {
  if (!own) return true; if (own === 'ALL') return true; role = role || 'CHO'; if (own === role) return true;
  // 27 Nov 2026: several owners, written "ANM+ASHA" — each of them answers; if none of them works here, the CHO does
  var L = String(own).split('+'); if (L.length > 1) { if (L.indexOf(role) >= 0 || L.indexOf('ALL') >= 0) return true; return role === 'CHO' && !!present && L.every(function (r) { return !present[r]; }); }
  if (role === 'CHO' && present && !present[own]) return true; return false;
}
function blsOwnList(own) { return !own ? [] : own === 'ALL' ? ['ALL'] : String(own).split('+'); }
function blsOwnLabel(own) { return !own ? '' : own === 'ALL' ? 'All' : String(own).split('+').join(' + '); }
function blsRolesPresent() { try { if (typeof _scRolesPresent !== 'undefined' && _scRolesPresent) return _scRolesPresent; return scRolesFromRoster((choState.facility || {}).staff || {}); } catch (e) { return null; } }
function blsSlotsMine(cp) { var role = choState.roleId || 'CHO', pr = blsRolesPresent(); return blsSlots(cp).filter(function (s) { return blsOwnerOK(s.own, role, pr); }); }
// value of one answer: 1 met · 0 not met · fraction for lists, samples, indicators · null = not answered yet
function blsVal(s, v) {
  if (v == null || v === '') return null;
  if (s.kind === 'mcq') return v === 'o' + s.q.a ? 1 : 0;
  if (s.kind === 'tri') return v === '1' ? 1 : 0;
  if (s.kind === 'list') { var str = String(v); if (str.length < s.items.length || /-/.test(str.slice(0, s.items.length))) return null; var y = 0, n = 0; for (var i = 0; i < s.items.length; i++) { if (str[i] === '1') y++; else if (str[i] === '0') n++; } return y + n ? y / (y + n) : 1; }
  if (s.kind === 'sample') { var x = +v; return isNaN(x) ? null : Math.max(0, Math.min(5, x)) / 5; }
  if (s.kind === 'ind') { var p = String(v).split('|'); if (p.length < 3 || p.some(function (q) { return q === ''; })) return null; return p.filter(function (q) { return q !== 'x'; }).length / 3; }
  return null;
}
function blsMet(s, v) { return blsVal(s, v) === 1; }
function blsDone1(s, v) { return blsVal(s, v) !== null; }
// NQAS rule on the share met: all = 2, 50–99% = 1, below 50% = 0
function blsScoreOf(vals) { var L = vals.filter(function (x) { return x !== null; }); if (!L.length || L.length < vals.length) return null; var m = L.reduce(function (a, b) { return a + b; }, 0) / L.length; return m >= 0.9999 ? 2 : m >= 0.5 ? 1 : 0; }
function blsAns(c, ci) { c.blAns = c.blAns || {}; return (c.blAns[ci] = c.blAns[ci] || {}); }
// ticks per MoV and the checkpoint score, from MY lines (the facility score merges everyone's lines — blsFacMerge)
function blsApply(di, ci) {
  var d = getDay(di), cp = d.cps[ci], c = getCHOCard(di), A = blsAns(c, ci), S = blsSlotsMine(cp), items = cp.items || [];
  var byK = {}; S.forEach(function (s) { (byK[s.k] = byK[s.k] || []).push(s); });
  var valOf = function (k) { var L = byK[k]; if (!L || !L.length) return undefined; var vs = L.map(function (s) { return blsVal(s, A[s.id]); }); if (vs.some(function (x) { return x === null; })) return null; return Math.min.apply(null, vs); };
  var ks = Object.keys(byK).map(Number), vals = ks.map(valOf);
  if (items.length) { c.cpTicks = c.cpTicks || {}; c.cpTicks[ci] = items.map(function (_, k) { var v = valOf(k); return v === undefined || v === null ? null : v >= 0.9999 ? 1 : 0; }); }
  c.cpScores[ci] = ks.length ? blsScoreOf(vals) : 2;                     // no lines of mine left (all not applicable) → nothing against it
  c.updatedAt = typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString();
  try { if (typeof scCpRecord === 'function') scCpRecord(di, ci); } catch (e) {}
}
function blsLineMode() { return typeof SC_LC !== 'undefined'; }
function blsMine(di) { if (!blsLineMode()) return scMyCpIdx(di); var d = getDay(di), out = []; (d && d.cps || []).forEach(function (cp, ci) { if (blsSlotsMine(cp).length) out.push(ci); }); return out; }
function blsOpenCount(di) { var c = getCHOCard(di), d = getDay(di); return blsMine(di).reduce(function (n, ci) { var A = ((c.blAns || {})[ci]) || {}; return n + blsSlotsMine(d.cps[ci]).filter(function (s) { return !blsDone1(s, A[s.id]); }).length; }, 0); }
function blsSlideDone(di, ci) { var A = ((getCHOCard(di).blAns || {})[ci]) || {}; return blsSlotsMine(getDay(di).cps[ci]).every(function (s) { return blsDone1(s, A[s.id]); }); }
function blsTheme(di) { try { return blsT(SC_BASELINE[di].title, SC_BASELINE[di].hi); } catch (e) { return (getDay(di) || {}).title || ''; } }

// ── the card ──
function blsRender(di) {
  var cont = document.getElementById('card-container'); if (!cont) return;
  var c = getCHOCard(di), mine = blsMine(di), hi = blsHi();
  if (_bls.di !== di) { var mem = blsMem(di); _bls = { di: di, i: 0, review: false, want: null, dir: 0, resumed: false }; var first = mine.findIndex(function (ci) { return !blsSlideDone(di, ci); });
    if (first < 0 && mine.length) _bls.review = true;
    else if (mine.length && mem.seen != null && mem.seen >= mine.length - 1) { _bls.review = true; _bls.i = first < 0 ? 0 : first; }
    else if (mem.last != null && mem.last > 0 && mem.last < mine.length) { _bls.i = mem.last; _bls.resumed = true; }
    else _bls.i = first < 0 ? 0 : first; }
  if (_bls.want != null) { var w = mine.indexOf(_bls.want); if (w >= 0) { _bls.i = w; _bls.review = false; } _bls.want = null; }
  var head = '<div class="bls-hd"><small>' + blsE(blsT('BASELINE · DAY ', 'बेसलाइन · दिन ') + (di + 1) + blsT(' OF ', ' / ') + blsBaseN()) + '</small><b>' + blsE(blsTheme(di)) + '</b></div>';
  if (c.taskDone) { cont.innerHTML = '<div class="bls">' + head + blsDoneHTML(di) + '</div>'; return; }
  if (!mine.length) { cont.innerHTML = '<div class="bls">' + head + '<div class="bls-card"><p>' + blsE(blsT('No checkpoints are assigned to your role on this day. Your colleagues answer them.', 'इस दिन आपकी भूमिका के लिए कोई चेकपॉइंट नहीं है। आपके साथी इनका उत्तर देंगे।')) + '</p></div></div>'; return; }
  if (_bls.i >= mine.length) { _bls.i = mine.length - 1; _bls.review = true; }
  if (!_bls.review) blsMemSet(di, _bls.i); else blsMemSet(di, mine.length - 1, true);
  blsMapClose();
  var body = _bls.review ? blsReviewHTML(di, mine) : blsSlideHTML(di, mine);
  var sent = c.sentBackAt ? '<div class="bls-warn">' + blsE(blsT('Your reviewer sent this day back — please check your answers again.', 'समीक्षक ने यह दिन वापस भेजा है — कृपया अपने उत्तर फिर जाँचें।')) + (c.sentBackNote ? ' ' + blsE(c.sentBackNote) : '') + '</div>' : '';
  cont.innerHTML = '<div class="bls">' + head + sent + body + '</div>';
  var sl = cont.querySelector('.bls-slide');
  if (sl) { var x0 = null, y0 = null;
    sl.addEventListener('touchstart', function (e) { var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; }, { passive: true });
    sl.addEventListener('touchend', function (e) { if (x0 == null) return; var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) blsGo(dx < 0 ? 1 : -1); }, { passive: true }); }
}
// each checkpoint takes the next colour, so a swipe is plainly a new checkpoint (HealSol, 24 Nov 2026)
var BLS_ACC = [['#1E6B5E', '#E6F2EF'], ['#2B5A9B', '#E8EEF8'], ['#74468A', '#F1E9F5'], ['#8A5410', '#F6EDE0'], ['#A23E5A', '#F7E6EC']];
function blsBuzz() { try { if (navigator.vibrate) navigator.vibrate(12); } catch (e) {} }
// where this person got to on each day (this phone only): seen = furthest checkpoint seen, last = where they were
function blsMemKey(di) { var u = ''; try { u = (firebase.auth().currentUser || {}).uid || ''; } catch (e) {} return 'blsNav:' + (choState.facilityCode || '') + ':' + u + ':' + (choState.progId || '') + ':' + di; }
function blsMem(di) { try { return JSON.parse(localStorage.getItem(blsMemKey(di)) || '{}') || {}; } catch (e) { return {}; } }
function blsMemSet(di, i, all) { try { var m = blsMem(di); m.seen = Math.max(m.seen == null ? -1 : m.seen, i); if (!all) m.last = i; localStorage.setItem(blsMemKey(di), JSON.stringify(m)); } catch (e) {} }
function blsCpState(di, ci, idx, seen) { var A = ((getCHOCard(di).blAns || {})[ci]) || {}, S = blsSlotsMine(getDay(di).cps[ci]), a = S.filter(function (s) { return blsDone1(s, A[s.id]); }).length;
  return a === S.length ? 'a' : (a > 0 || idx <= seen) ? 's' : 'n'; }
function blsMapRow(di, mine) {
  var seen = blsMem(di).seen; seen = seen == null ? -1 : seen; var W = 11, st = Math.max(0, Math.min(_bls.i - 5, mine.length - W)), en = Math.min(mine.length, st + W), h = '';
  if (st > 0) h += '<span class="bls-dm">' + st + '+</span>';
  for (var k = st; k < en; k++) h += k === _bls.i ? '<span class="bls-d cur" style="background:' + BLS_ACC[k % BLS_ACC.length][0] + '">' + (k + 1) + '</span>' : '<span class="bls-d ' + blsCpState(di, mine[k], k, seen) + '"></span>';
  if (en < mine.length) h += '<span class="bls-dm">+' + (mine.length - en) + '</span>';
  return '<div class="bls-map"><div class="bls-dots" aria-hidden="true">' + h + '</div><button type="button" class="bls-mapb" onclick="blsMapOpen()">' + blsE(blsT('All checkpoints', 'सभी चेकपॉइंट')) + '</button></div>';
}
function blsMapClose() { var o = document.getElementById('bls-map'); if (o) o.remove(); }
function blsMapOpen() {
  var di = _bls.di; if (di == null) return; var mine = blsMine(di), seen = blsMem(di).seen; seen = seen == null ? -1 : seen; var n = { a: 0, s: 0, n: 0 };
  var tiles = mine.map(function (ci, k) { var t = blsCpState(di, ci, k, seen); n[t]++;
    return '<button type="button" class="bls-mt ' + t + (k === _bls.i && !_bls.review ? ' cur' : '') + '" onclick="blsJump(' + k + ')" aria-label="' + blsE(blsT('Checkpoint ', 'चेकपॉइंट ') + (k + 1)) + '">' + (k + 1) + '</button>'; }).join('');
  blsMapClose(); var o = document.createElement('div'); o.id = 'bls-map'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
  o.innerHTML = '<div class="blsm-bg" onclick="blsMapClose()"></div><div class="blsm-sheet"><i class="blsm-grab"></i><div class="blsm-h"><div><b>' + blsE(blsT('Day ' + (di + 1) + ' · all checkpoints', 'दिन ' + (di + 1) + ' · सभी चेकपॉइंट')) + '</b><small>' + blsE(blsT('Tap a number, or search by ID or words', 'नंबर छुएँ, या ID / शब्द से खोजें')) + '</small></div><button type="button" class="blsm-x" onclick="blsMapClose()" aria-label="' + blsE(blsT('Close', 'बंद करें')) + '"><i class="ti ti-x"></i></button></div>'
    + '<label class="blsm-q"><i class="ti ti-search" aria-hidden="true"></i><input id="blsm-q" type="search" autocomplete="off" aria-label="' + blsE(blsT('Search checkpoints', 'चेकपॉइंट खोजें')) + '" placeholder="' + blsE(blsT('Search ID or words, e.g. E-135, ANC', 'ID या शब्द खोजें, जैसे E-135, ANC')) + '" oninput="blsFind(this.value)"><button type="button" class="blsm-qx" hidden onclick="var q=document.getElementById(\'blsm-q\');q.value=\'\';blsFind(\'\');q.focus()" aria-label="' + blsE(blsT('Clear', 'साफ़ करें')) + '">✕</button></label><div id="blsm-res" hidden></div><div id="blsm-all">'
    + '<div class="blsm-key"><span><i class="a"></i>' + blsE(blsT('Answered', 'उत्तर दिया')) + '</span><span><i class="s"></i>' + blsE(blsT('Skipped / part done', 'छोड़ा / अधूरा')) + '</span><span><i class="n"></i>' + blsE(blsT('Not seen yet', 'अभी नहीं देखा')) + '</span><span><i class="c"></i>' + blsE(blsT('You are here', 'आप यहाँ हैं')) + '</span></div>'
    + '<div class="blsm-grid">' + tiles + '</div>'
    + '<div class="blsm-n"><span><b>' + n.a + '</b> ' + blsE(blsT('answered', 'उत्तर दिए')) + '</span><span><b>' + n.s + '</b> ' + blsE(blsT('skipped', 'छोड़े')) + '</span><span><b>' + n.n + '</b> ' + blsE(blsT('to go', 'बाकी')) + '</span></div>'
    + '<button type="button" class="blsm-rev" onclick="blsMapClose();blsToReview()">' + blsE(blsT('Go to review & submit', 'जाँचें और जमा करें पर जाएँ')) + '</button><small class="blsm-f">' + blsE(blsT('Submit unlocks when every checkpoint is answered', 'सभी चेकपॉइंट का उत्तर देने पर जमा खुलेगा')) + '</small></div></div>';
  document.body.appendChild(o);
}
// 26 Nov 2026: find a checkpoint — inside "All checkpoints". Looks in the ID, title, question and the parts to tick,
// across every baseline day (this day first). Open days jump straight to the card; days to come say when they open.
function blsTxt(x) { return String(x == null ? '' : x).replace(/<[^>]*>/g, ' ').toLowerCase(); }
function blsFindList(q) {
  q = String(q || '').trim().toLowerCase(); if (q.length < 2) return [];
  var words = q.split(/\s+/), res = words.map(function (w) { return new RegExp('(^|[^a-z0-9])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); }), has = function (t) { return res.every(function (r) { return r.test(t); }); }, cur = _bls.di, out = [], N = blsBaseN(), order = [cur];
  for (var d = 0; d < N; d++) if (d !== cur) order.push(d);
  order.forEach(function (di) { var day = getDay(di); if (!day || !day.cps) return; var mine = blsMine(di);
    mine.forEach(function (ci, k) { var cp = day.cps[ci]; if (!cp) return; var S = blsSlotsMine(cp), parts = [];
      var hay = [cp.id, cp.t, typeof getCPText === 'function' ? getCPText(cp) : ''].concat(S.map(function (sl) { return [sl.t, sl.h, sl.q && (sl.q.q || sl.q.t)].join(' '); })).map(blsTxt).join(' ');
      S.forEach(function (sl) { (sl.items || []).forEach(function (it) { var n = String(it.n || ''); if (has(n.toLowerCase())) parts.push(n); }); });
      var all = hay + ' ' + S.map(function (sl) { return (sl.items || []).map(function (it) { return blsTxt(it.n); }).join(' '); }).join(' ');
      if (has(all)) out.push({ di: di, ci: ci, k: k, cp: cp, parts: parts, idHit: String(cp.id || '').toLowerCase().indexOf(q) === 0 }); }); });
  out.sort(function (a, b) { return (b.idHit - a.idHit) || ((a.di === cur ? 0 : 1) - (b.di === cur ? 0 : 1)) || (a.di - b.di) || (a.k - b.k); });
  return out;
}
function blsFind(q) {
  var res = document.getElementById('blsm-res'), all = document.getElementById('blsm-all'), x = document.querySelector('#bls-map .blsm-qx'); if (!res || !all) return;
  var on = String(q || '').trim().length >= 2; res.hidden = !on; all.hidden = on; var sh = res.closest && res.closest('.blsm-sheet'); if (sh) sh.classList.toggle('q', !!String(q || '').length); if (x) x.hidden = !String(q || '').length; if (!on) { res.innerHTML = ''; return; }
  var L = blsFindList(q), cur = _bls.di, nCur = L.filter(function (r) { return r.di === cur; }).length, shown = L.slice(0, 30);
  var esc = function (t) { return blsE(t); };
  var row = function (r) {
    var c = getCHOCard(r.di), open = scDayUnlocked(r.di), seen = blsMem(r.di).seen, st = blsCpState(r.di, r.ci, r.k, seen == null ? -1 : seen);
    var here = r.di === cur && r.k === _bls.i && !_bls.review, tile = here ? 'cur' : st;
    var tag = here ? [blsT('You are here', 'आप यहाँ हैं'), 'cur'] : !open ? [blsT('Opens', 'खुलेगा') + ' ' + (typeof scb2DayShort === 'function' && scb2DayShort(r.di) ? scb2DayShort(r.di) : blsT('on Day ', 'दिन ') + (r.di + 1)), 'lock']
      : c.taskDone ? [blsT('Answered · Day ' + (r.di + 1) + ' submitted', 'उत्तर दिया · दिन ' + (r.di + 1) + ' जमा'), 'a'] : st === 'a' ? [blsT('Answered', 'उत्तर दिया'), 'a'] : st === 's' ? [blsT('Skipped / part done', 'छोड़ा / अधूरा'), 's'] : [blsT('Not seen yet', 'अभी नहीं देखा'), 'n'];
    var title = typeof getCPText === 'function' ? blsTxt(getCPText(r.cp)) && getCPText(r.cp) : esc(r.cp.t);
    return '<button type="button" class="blsm-r' + (open ? '' : ' lock') + '"' + (open ? ' onclick="blsFindGo(' + r.di + ',' + r.ci + ')"' : ' aria-disabled="true"') + '><span class="bls-mt ' + tile + '">' + (r.k + 1) + '</span><span class="blsm-rt"><small>' + esc(r.cp.id || '') + ' · ' + esc(blsT('Day ' + (r.di + 1) + ' · no. ' + (r.k + 1), 'दिन ' + (r.di + 1) + ' · क्र. ' + (r.k + 1))) + '</small><b>' + title + '</b>'
      + (r.parts.length ? '<em>' + esc(blsT('Part: ', 'भाग: ')) + r.parts.slice(0, 3).map(esc).join(' · ') + '</em>' : '') + '<i class="blsm-tag ' + tag[1] + '">' + esc(tag[0]) + '</i></span></button>';
  };
  res.innerHTML = '<small class="blsm-rn">' + esc(L.length ? blsT(L.length + ' checkpoint' + (L.length === 1 ? '' : 's') + ' match' + (L.length === 1 ? 'es' : '') + ' “' + String(q).trim() + '”' + (nCur && nCur < L.length ? ' · this day first' : ''), '“' + String(q).trim() + '” से ' + L.length + ' चेकपॉइंट मिले') : blsT('Nothing matches “' + String(q).trim() + '”. Try a checkpoint ID like E-135, or one word.', '“' + String(q).trim() + '” से कुछ नहीं मिला। E-135 जैसी ID या एक शब्द आज़माएँ।')) + '</small>'
    + shown.map(row).join('') + (L.length > shown.length ? '<small class="blsm-rn">' + esc(blsT('Showing the first 30 — type more to narrow down.', 'पहले 30 दिखाए — और लिखकर छाँटें।')) + '</small>' : '');
}
function blsFindGo(di, ci) {
  blsMapClose(); if (!scDayUnlocked(di)) return;
  if (di !== _bls.di) { try { if (typeof renderCard === 'function') renderCard(di); else blsRender(di); } catch (e) { blsRender(di); } }
  var mine = blsMine(di), k = mine.indexOf(ci); if (k < 0) return;
  if (getCHOCard(di).taskDone) return;   // a submitted day opens on its summary
  blsJump(k);
}
// a simple line drawing for each day's theme (baseline day d, or implementation week d) — original drawings, no emblems
function blsArt(d) {
  var P = [
    '<path d="M14 96h104"/><path d="M26 96V48l40-26 40 26v48"/><path d="M56 96V70h20v26"/><rect x="34" y="56" width="14" height="12" rx="2"/><rect x="84" y="56" width="14" height="12" rx="2"/><path d="M60 40h12M66 34v12"/><path d="M118 96V76"/><circle cx="118" cy="68" r="9"/>',
    '<rect x="30" y="34" width="36" height="58" rx="6"/><path d="M34 34v-8h28v8"/><path d="M38 56h20M48 46v20"/><rect x="78" y="58" width="36" height="16" rx="8" transform="rotate(-30 96 66)"/><path d="M90 74l12-20" /><path d="M14 96h104"/>',
    '<path d="M60 18c14 18 24 30 24 44a24 24 0 0 1-48 0c0-14 10-26 24-44z"/><path d="M50 64a10 10 0 0 0 10 10"/><path d="M96 30l18 6v16c0 14-8 22-18 26-10-4-18-12-18-26V36z"/><path d="M89 50l5 5 10-10"/>',
    '<circle cx="48" cy="28" r="11"/><path d="M28 96V62c0-12 9-20 20-20s20 8 20 20v34"/><circle cx="84" cy="54" r="8"/><path d="M68 70c6-6 22-6 28 4"/><path d="M60 64c8 4 20 10 36 10"/><path d="M14 96h104"/>',
    '<path d="M12 56c14-22 34-32 52-32s38 10 52 32c-14 22-34 32-52 32S26 78 12 56z"/><circle cx="64" cy="56" r="16"/><circle cx="64" cy="56" r="6"/>',
    '<path d="M64 92S20 66 20 40a20 20 0 0 1 44-6 20 20 0 0 1 44 6c0 26-44 52-44 52z"/><path d="M30 56h18l6-12 10 24 8-16h26"/>',
    '<circle cx="50" cy="22" r="10"/><path d="M50 32v30l-12 32"/><path d="M50 62l12 32"/><path d="M50 42l18 10"/><path d="M76 52v44"/><path d="M90 96V72M102 96V60M114 96V46"/>' ];
  return '<svg class="bls-art" width="120" height="100" viewBox="0 0 132 104" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[((d % 7) + 7) % 7] + '</svg>';
}
// the tick on the number badge when every line of the checkpoint is answered (whatever the answers were)
function blsTick() { try { var b = document.querySelector('#card-container .bls-num'); if (!b) return; b.classList.add('done'); b.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'; } catch (e) {} }
// greeting by the time of day (India time)
function blsGreet() { var h = new Date(Date.now() + 5.5 * 3600e3).getUTCHours(); return h < 12 ? blsT('Good morning', 'सुप्रभात') : h < 17 ? blsT('Good afternoon', 'नमस्ते') : blsT('Good evening', 'शुभ संध्या'); }
// "Your team today": who has finished their lines of the day, who has some left — counts answers, never scores
var _blsTeamAsk = 0;
function blsTeamHTML(di) {
  try {
    var F = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode && _nfFac.progress) ? _nfFac : null;
    if (!F) { if (Date.now() - _blsTeamAsk > 60000 && typeof nfLoadFacility === 'function') { _blsTeamAsk = Date.now(); nfLoadFacility().then(function (x) { if (x && x.progress && typeof nfRenderToday === 'function') nfRenderToday(); }); }
      return Date.now() - _blsTeamAsk < 20000 ? '<div class="nf-card bls-team" aria-busy="true"><div class="bls-th"><b>' + blsE(blsT('Your team today', 'आज आपकी टीम')) + '</b></div>' + [1, 2, 3].map(function () { return '<div class="bls-tm"><span class="nf-skel" style="width:38px;height:38px;border-radius:50%"></span><div class="bls-tn"><span class="nf-skel" style="width:55%;height:12px"></span><span class="nf-skel" style="width:35%;height:10px;margin-top:6px"></span></div></div>'; }).join('') + '</div>' : ''; }
    var staff = F.staff || (choState.facility || {}).staff || {}, me = String(choState.staffMobile || ''), present = scRolesFromRoster(staff), d = getDay(di), ic = (choState.roleId || 'CHO') === 'CHO', rows = [];
    Object.keys(staff).forEach(function (m) {
      var p = staff[m] || {}, role = p.role || ''; if (m === me) return;
      var tot = 0, ans = 0, rec = ((F.progress || {})[m] || {})['day_' + di] || null;
      (d.cps || []).forEach(function (cp, ci) { var S = blsSlots(cp).filter(function (s) { return blsOwnerOK(s.own, role, present); }); if (!S.length) return; var A = blsAnsOfRec(rec, ci) || {}; tot += S.length; S.forEach(function (s) { if (blsDone1(s, A[s.id])) ans++; }); });
      if (!tot) return;
      var nm = String(p.name || role).split(' ')[0], ini = blsE(nm.charAt(0).toUpperCase()), done = !!(rec && rec.taskDone), k = rows.length % 5;
      var st = done ? '<small class="ok">' + blsE(blsT('Finished the Day ' + (di + 1) + ' lines', 'दिन ' + (di + 1) + ' की पंक्तियाँ पूरी')) + '</small>'
        : ans ? '<i class="bls-tb"><i style="width:' + Math.round(ans / tot * 100) + '%;background:' + BLS_ACC[k][0] + '"></i></i>'
        : '<small>' + blsE(blsT('Not started yet', 'अभी शुरू नहीं')) + '</small>';
      var right = done ? '<svg class="bls-tok" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2E8B57" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'
        : ans ? '<span class="bls-tl">' + blsE(blsT((tot - ans) + ' left', (tot - ans) + ' बाकी')) + '</span>'
        : (ic && typeof nfWaOpen === 'function' && p.mobile !== '' ? '<button type="button" class="bls-tr" onclick="blsRemind(\'' + blsE(m) + '\',' + di + ')">' + blsE(blsT('Remind', 'याद दिलाएँ')) + '</button>' : '');
      rows.push('<div class="bls-tm"><span class="bls-ti' + (done || ans ? '' : ' z') + '" style="' + (done || ans ? 'background:' + BLS_ACC[k][0] : '') + '">' + ini + '</span><div class="bls-tn"><b>' + blsE(nm) + ' · ' + blsE(role) + '</b>' + st + '</div>' + right + '</div>');
    });
    if (!rows.length) return '';
    return '<div class="nf-card bls-team"><div class="bls-th"><b>' + blsE(blsT('Your team today', 'आज आपकी टीम')) + '</b><span>' + blsE(blsT('Day ', 'दिन ')) + (di + 1) + '</span></div>' + rows.join('') + '</div>';
  } catch (e) { return ''; }
}
function blsRemind(m, di) {
  var p = ((choState.facility || {}).staff || {})[m] || ((typeof _nfFac !== 'undefined' && _nfFac.staff) || {})[m] || {}, nm = String(p.name || '').split(' ')[0], from = (typeof nfFirstName === 'function' ? nfFirstName() : '');
  var txt = blsHi() ? 'नमस्ते ' + nm + ' जी, NQAS | FAST में आज बेसलाइन दिन ' + (di + 1) + ' की आपकी पंक्तियाँ इंतज़ार कर रही हैं। लगभग 15–20 मिनट लगेंगे। धन्यवाद — ' + from
    : 'Namaste ' + nm + ' ji, a reminder: your baseline Day ' + (di + 1) + ' lines are waiting in NQAS | FAST. It takes about 15–20 minutes. Thank you — ' + from;
  nfWaOpen(p.mobile || m, txt);
}
function blsProg(di, mine) { var n = mine.filter(function (ci) { return blsSlideDone(di, ci); }).length, tot = mine.length;
  return '<div class="bls-prog"><div class="bls-pt"><b>' + n + blsT(' of ', ' / ') + tot + '</b><span>' + blsE(blsT('answered', 'उत्तर दिए')) + '</span><em>' + blsE(blsT('Checkpoint ' + (_bls.i + 1) + ' of ' + tot, 'चेकपॉइंट ' + (_bls.i + 1) + ' / ' + tot)) + '</em></div><div class="bls-pb"><i style="width:' + Math.round(n / Math.max(1, tot) * 100) + '%"></i></div></div>'; }
// button words by answer type (staff) — HealSol master sheet, "Button wording"
var BLS_BTN = {
  disp: [['Displayed', 'लगा है'], ['Not displayed', 'नहीं लगा']], avail: [['Available & working', 'उपलब्ध और चालू'], ['Not available', 'उपलब्ध नहीं / ख़राब']],
  obs: [['Yes, I can see it', 'हाँ, दिख रहा है'], ['No', 'नहीं']], rec: [['Records show it', 'रिकॉर्ड में है'], ["Records don't show it", 'रिकॉर्ड में नहीं']],
  client: [['Client confirmed', 'लाभार्थी ने पुष्टि की'], ['Client did not', 'पुष्टि नहीं की']], people: [['Confirmed', 'पुष्टि हुई'], ['Not confirmed', 'पुष्टि नहीं हुई']],
  use: [['Yes, I use it', 'हाँ, उपयोग करते हैं'], ['No', 'नहीं']], 'do': [['Yes, I can do it', 'हाँ, कर सकते हैं'], ['No', 'नहीं']], know: [['Yes, I know it', 'हाँ, जानते हैं'], ['No', 'नहीं']],
  '': [['Met', 'पूरा'], ['Not met', 'पूरा नहीं']] };
var BLS_ITEMBTN = { stock: [['In stock', 'स्टॉक में'], ['Out / expired', 'खत्म / एक्सपायर']], equip: [['Working', 'चालू'], ['Not working', 'ख़राब / नहीं']], tests: [['Available', 'उपलब्ध'], ['Not available', 'उपलब्ध नहीं']], yn: [['Yes', 'हाँ'], ['No', 'नहीं']] };
var BLS_CHIP = { rec: 'RR', obs: 'OB', disp: 'OB', avail: 'OB', stock: 'OB', equip: 'OB', tests: 'OB', yn: 'RR', client: 'CI', people: 'CI+SI', sample: 'RR' };
function blsChip(s) {
  if (s.kind === 'mcq') s = { m: 'SI' };
  if (s.ty === 'know' || s.ty === 'do' || s.ty === 'use') return '<span class="bls-m">🙋 ' + blsE(blsT('About you', 'आपके बारे में')) + '</span>';
  if (s.ty === 'ind') return '<span class="bls-m">📊 ' + blsE(blsT('Enter the numbers', 'संख्या भरें')) + '</span>';
  var key = BLS_CHIP[s.ty] || s.m, M = BLS_METH[key] || BLS_METH[String(key || '').split('/')[0]] || null;
  return M ? '<span class="bls-m">' + M[0] + ' ' + blsE(blsT(M[1], M[2])) + '</span>' : '';
}
function blsMonths() { var out = [], d = new Date(Date.now() + 5.5 * 3600e3); for (var i = 3; i >= 1; i--) { var x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1)); out.push(x.toLocaleString(blsHi() ? 'hi-IN' : 'en-IN', { month: 'short', timeZone: 'UTC' })); } return out; }
function blsRowHTML(di, ci, s, v, single) {
  var hi = blsHi(), mob = (choState.staffMobile || '') + '', chip = blsChip(s), hint = s.hn ? '<small class="bls-hn">' + blsE(blsT(s.hn, '')) + '</small>' : '';
  var txt = '<div class="bls-rt">' + chip + '<span>' + blsE(hi && s.h ? s.h : s.t) + '</span>' + hint + '</div>';
  if (s.kind === 'mcq') {
    var q = s.q, ord = blsOrder(mob + '|' + s.key + '|' + s.qi);
    return '<div class="bls-row"><div class="bls-rt">' + chip + '<b>' + blsE(hi && q.qh ? q.qh : q.q) + '</b></div><div class="bls-opts" role="radiogroup">'
      + ord.map(function (oi) { var on = v === 'o' + oi; return '<button type="button" role="radio" aria-checked="' + on + '" class="bls-opt' + (on ? ' on' : '') + '" onclick="blsSet(' + di + ',' + ci + ',\'' + s.id + '\',\'o' + oi + '\')"><span class="bls-dot"></span>' + blsE(hi && q.oh ? q.oh[oi] : q.o[oi]) + '</button>'; }).join('') + '</div></div>';
  }
  if (s.kind === 'list') {
    var str = String(v || ''), W = BLS_ITEMBTN[s.ty] || BLS_ITEMBTN.yn;
    return '<div class="bls-row">' + txt + '<div class="bls-items">' + s.items.map(function (it, n) { var c0 = str[n] || '-';
      var ib = function (val, lab, cls) { var on = c0 === val; return '<button type="button" aria-pressed="' + on + '" class="bls-ib ' + cls + (on ? ' on' : '') + '" onclick="blsSetItem(' + di + ',' + ci + ',\'' + s.id + '\',' + n + ',' + s.items.length + ',\'' + val + '\')">' + (on ? '✓ ' : '') + blsE(blsT(lab[0], lab[1])) + '</button>'; };
      return '<div class="bls-it"><span>' + blsE(it.n) + '</span><div>' + ib('1', W[0], 'y') + ib('0', W[1], 'n') + '</div></div>'; }).join('') + '</div></div>';
  }
  if (s.kind === 'sample') {
    return '<div class="bls-row">' + txt + '<div class="bls-samp" role="radiogroup">' + [0, 1, 2, 3, 4, 5].map(function (n) { var on = String(v) === String(n);
      return '<button type="button" role="radio" aria-checked="' + on + '" class="bls-sn' + (on ? ' on' : '') + '" onclick="blsSet(' + di + ',' + ci + ',\'' + s.id + '\',\'' + n + '\')">' + n + '</button>'; }).join('') + '<small>' + blsE(blsT('of 5 complete', '5 में से पूरे')) + '</small></div></div>';
  }
  if (s.kind === 'ind') {
    var P = String(v || '||').split('|'), mon = blsMonths();
    return '<div class="bls-row">' + txt + '<div class="bls-ind">' + [0, 1, 2].map(function (n) { var x = P[n] || '', nr = x === 'x';
      return '<label><small>' + blsE(mon[n]) + '</small><input type="number" inputmode="decimal" min="0" step="any" value="' + (nr ? '' : blsE(x)) + '"' + (nr ? ' disabled' : '') + ' onchange="blsSetInd(' + di + ',' + ci + ',\'' + s.id + '\',' + n + ',this.value)"><button type="button" class="bls-nr' + (nr ? ' on' : '') + '" onclick="blsSetInd(' + di + ',' + ci + ',\'' + s.id + '\',' + n + ',\'' + (nr ? '' : 'x') + '\')">' + blsE(blsT('Not recorded', 'दर्ज नहीं')) + '</button></label>'; }).join('') + '</div></div>';
  }
  var W2 = BLS_BTN[s.ty] || BLS_BTN[''];
  var b = function (val, lab, labh, cls) { var on = v === val; return '<button type="button" aria-pressed="' + on + '" class="bls-b ' + cls + (on ? ' on' : '') + '" onclick="blsSet(' + di + ',' + ci + ',\'' + s.id + '\',\'' + val + '\')">' + (on ? '✓ ' : '') + blsE(blsT(lab, labh)) + '</button>'; };
  return '<div class="bls-row">' + txt + '<div class="bls-tri' + (single ? ' big' : '') + '">' + b('1', W2[0][0], W2[0][1], 'y') + b('0', W2[1][0], W2[1][1], 'n') + b('?', 'Not sure', 'पता नहीं', 'q') + '</div></div>';
}
function blsSlideHTML(di, mine) {
  var ci = mine[_bls.i], d = getDay(di), cp = d.cps[ci], A = ((getCHOCard(di).blAns || {})[ci]) || {}, S = blsSlotsMine(cp);
  var rows = S.map(function (s) { return blsRowHTML(di, ci, s, A[s.id], S.length === 1); }).join('');
  var nItems = S.length;
  var acc = BLS_ACC[_bls.i % BLS_ACC.length], anim = _bls.dir > 0 ? ' in-r' : _bls.dir < 0 ? ' in-l' : '';
  var resumed = _bls.resumed ? '<div class="bls-resume"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#CDE6DE" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 4v5h5"></path><path d="M12 8v4l3 2"></path></svg><span>' + blsE(blsT('Picked up where you left off', 'जहाँ छोड़ा था वहीं से')) + '</span><button type="button" onclick="blsJump(0)">' + blsE(blsT('Start from 1', '1 से शुरू करें')) + '</button></div>' : '';
  return resumed + blsProg(di, mine) + blsMapRow(di, mine)
    + '<div class="bls-slide' + anim + '"><div class="bls-card bls-acc" style="--acc:' + acc[0] + ';--acc-t:' + acc[1] + '"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">' + (_bls.i + 1) + '</span><div class="bls-chm"><span class="bls-k">' + blsE(cp.id || '') + (nItems > 1 ? ' · ' + blsE(blsT(nItems + ' THINGS TO CHECK', 'जाँचने की ' + nItems + ' बातें')) : '') + '</span><div class="bls-cpt">' + (typeof getCPText === 'function' ? getCPText(cp) : blsE(cp.t)) + '</div></div></div><div class="bls-cbody">' + rows + '</div></div></div>'
    + '<p class="bls-swipe">' + blsE(blsT('‹ swipe for the previous / next checkpoint ›', '‹ पिछले / अगले चेकपॉइंट के लिए स्वाइप करें ›')) + '</p>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back" onclick="blsGo(-1)"' + (_bls.i === 0 ? ' disabled' : '') + '>‹ ' + blsE(blsT('Back', 'वापस')) + '</button><button type="button" class="bls-next' + (_bls.i < mine.length - 1 && !blsSlideDone(di, ci) ? ' skip' : '') + '" onclick="blsGo(1)">' + blsE(_bls.i === mine.length - 1 ? blsT('Review & submit', 'जाँचें और जमा करें') : blsSlideDone(di, ci) ? blsT('Next', 'आगे') : blsT('Skip for now', 'अभी छोड़ें')) + ' ›</button></div>';
}
function blsSetItem(di, ci, id, n, len, val) {
  var c = getCHOCard(di); if (c.taskDone || !scDayUnlocked(di)) return; var A = blsAns(c, ci), str = String(A[id] || '');
  while (str.length < len) str += '-'; str = str.slice(0, n) + val + str.slice(n + 1); blsSet(di, ci, id, str);
}
function blsSetInd(di, ci, id, n, val) {
  var c = getCHOCard(di); if (c.taskDone || !scDayUnlocked(di)) return; var A = blsAns(c, ci), P = String(A[id] || '||').split('|');
  while (P.length < 3) P.push(''); val = String(val == null ? '' : val).trim(); if (val !== 'x' && val !== '' && !(+val >= 0)) val = ''; P[n] = val; blsSet(di, ci, id, P.join('|'));
}
function blsSet(di, ci, id, val) {
  if (!scDayUnlocked(di)) return; var c = getCHOCard(di); if (c.taskDone) return;
  var A = blsAns(c, ci); A[id] = val;
  blsApply(di, ci); saveCHOState();
  var done = blsSlideDone(di, ci), y = window.scrollY; _bls.dir = 0; blsRender(di);   // 26 Nov: an answer never replays the slide-in
  try { if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y); } catch (e) {}
  if (done && !_bls.hold && _bls.di === di && !_bls.review) { var mine = blsMine(di); if (mine[_bls.i] === ci) blsTick(); if (mine[_bls.i] === ci) setTimeout(function () { if (_bls.di === di && !_bls.review && blsMine(di)[_bls.i] === ci && blsSlideDone(di, ci)) blsGo(1); }, 450); }
}
function blsGo(step) {
  var di = _bls.di; if (di == null) return; var mine = blsMine(di);
  if (_bls.review) { if (step < 0) { _bls.review = false; _bls.i = mine.length - 1; } }
  else { var n = _bls.i + step; if (n < 0) return; if (n >= mine.length) { _bls.review = true; } else _bls.i = n; }
  _bls.dir = step; _bls.resumed = false; blsBuzz();
  blsRender(di); try { var cc = document.getElementById('card-container'); if (cc && cc.scrollIntoView) cc.scrollIntoView({ block: 'start' }); } catch (e) {}
}
function blsJump(i) { _bls.dir = i > _bls.i || _bls.review ? 1 : i < _bls.i ? -1 : 0; _bls.review = false; _bls.i = i; _bls.resumed = false; blsBuzz(); blsRender(_bls.di); try { var cc = document.getElementById('card-container'); if (cc && cc.scrollIntoView) cc.scrollIntoView({ block: 'start' }); } catch (e) {} }
function blsToReview() { _bls.review = true; _bls.dir = 0; _bls.resumed = false; blsRender(_bls.di); }
function blsReviewHTML(di, mine) {
  var c = getCHOCard(di), d = getDay(di), hi = blsHi(), met = 0, not = 0, ns = 0, qa = 0, open = 0;
  var rows = mine.map(function (ci, i) {
    var cp = d.cps[ci], A = ((c.blAns || {})[ci]) || {}, S = blsSlotsMine(cp), parts = [];
    S.forEach(function (s) { var v = A[s.id]; if (!blsDone1(s, v)) { open++; return; } if (s.kind !== 'tri') { qa++; return; } if (v === '1') met++; else if (v === '0') not++; else ns++; });
    var a = S.filter(function (s) { return blsDone1(s, A[s.id]); }).length, st;
    if (a < S.length) st = '<span class="bls-pill o">' + blsE(blsT((S.length - a) + ' to answer', (S.length - a) + ' बाकी')) + '</span>';
    else { var M = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '1'; }).length, N = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '0'; }).length, Q = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '?'; }).length, Qa = S.filter(function (s) { return s.kind !== 'tri'; }).length;
      st = [M ? '<span class="bls-pill y">' + M + ' ' + blsE(blsT('Met', 'पूरा')) + '</span>' : '', N ? '<span class="bls-pill n">' + N + ' ' + blsE(blsT('Not met', 'पूरा नहीं')) + '</span>' : '', Q ? '<span class="bls-pill q">' + Q + ' ' + blsE(blsT('Not sure', 'पता नहीं')) + '</span>' : '', Qa ? '<span class="bls-pill w">' + Qa + ' ' + blsE(blsT('answered', 'उत्तर दिया')) + '</span>' : ''].join(''); }
    return { open: a < S.length, h: '<button type="button" class="bls-li' + (a < S.length ? ' open' : '') + '" onclick="blsJump(' + i + ')"><span class="bls-n">' + (i + 1) + '</span><span class="bls-lt">' + (typeof getCPText === 'function' ? getCPText(cp) : blsE(cp.t)) + '</span><span class="bls-ls">' + st + '</span></button>' };
  });
  var nOpen = rows.filter(function (r) { return r.open; }).length;
  var list = (nOpen ? '<div class="bls-lh">' + blsE(blsT('Skipped — still to answer (' + nOpen + ')', 'छोड़े गए — उत्तर बाकी (' + nOpen + ')')) + '</div>' + rows.filter(function (r) { return r.open; }).map(function (r) { return r.h; }).join('') + '<div class="bls-lh">' + blsE(blsT('Answered', 'उत्तर दिए')) + '</div>' : '')
    + rows.filter(function (r) { return !r.open; }).map(function (r) { return r.h; }).join('');
  var tiles = '<div class="bls-tiles"><div class="y"><b>' + met + '</b><small>' + blsE(blsT('Met', 'पूरा')) + '</small></div><div class="n"><b>' + not + '</b><small>' + blsE(blsT('Not met', 'पूरा नहीं')) + '</small></div><div class="q"><b>' + ns + '</b><small>' + blsE(blsT('Not sure', 'पता नहीं')) + '</small></div>' + (qa ? '<div class="w"><b>' + qa + '</b><small>' + blsE(blsT('lists & questions', 'सूची और प्रश्न')) + '</small></div>' : '') + '</div>';
  var firstOpen = mine.findIndex(function (ci) { return !blsSlideDone(di, ci); });
  var where = nOpen ? '<div class="bls-where"><b>' + blsE(blsT('You have seen all ' + mine.length + ' checkpoints. ' + nOpen + ' still to answer, then you can submit Day ' + (di + 1) + '.', 'आपने सभी ' + mine.length + ' चेकपॉइंट देख लिए। ' + nOpen + ' का उत्तर बाकी है, फिर दिन ' + (di + 1) + ' जमा कर सकते हैं।')) + '</b><div><button type="button" class="p" onclick="blsJump(' + firstOpen + ')">' + blsE(blsT('Answer the ' + nOpen + ' skipped', 'छोड़े गए ' + nOpen + ' का उत्तर दें')) + '</button><button type="button" onclick="blsMapOpen()">' + blsE(blsT('All checkpoints', 'सभी चेकपॉइंट')) + '</button></div></div>' : '';
  return '<div class="bls-rev"><b class="bls-rh">' + blsE(blsT('Review & submit', 'जाँचें और जमा करें')) + '</b>' + where + tiles + '<div class="bls-card bls-list">' + list + '</div>'
    + '<p class="bls-dim">' + blsE(blsT('Tap any line to change it before you submit. There is no score here.', 'जमा करने से पहले कोई भी पंक्ति छूकर बदलें। यहाँ कोई स्कोर नहीं है।')) + '</p>'
    + (open ? '<div class="bls-warn">' + blsE(blsT(open + ' answer' + (open === 1 ? '' : 's') + ' still needed.', open + ' उत्तर अभी बाकी।')) + '</div>' : '')
    + '<button type="button" class="bls-submit" onclick="blsSubmit(' + di + ')"' + (open ? ' disabled' : '') + '>' + blsE(blsT('Submit Day ' + (di + 1), 'दिन ' + (di + 1) + ' जमा करें')) + '</button>'
    + '<button type="button" class="bls-back2" onclick="blsGo(-1)">‹ ' + blsE(blsT('Back to the checkpoints', 'चेकपॉइंट पर वापस')) + '</button></div>';
}
async function blsSubmit(di) {
  if (blsOpenCount(di)) { showToast(blsT('Some answers are still needed.', 'कुछ उत्तर अभी बाकी हैं।'), 'err'); return; }
  var ok = typeof showConfirm === 'function' ? await showConfirm(blsT('Submit Day ' + (di + 1) + '? Answers cannot be changed after this.', 'दिन ' + (di + 1) + ' जमा करें? इसके बाद उत्तर नहीं बदले जा सकते।'), '✅', blsT('Submit', 'जमा करें'), blsT('Submit', 'जमा करें'), 'var(--green)') : true;
  if (!ok) return;
  blsMine(di).forEach(function (ci) { blsApply(di, ci); });
  markDone(di);
  var c = getCHOCard(di); if (c.taskDone) { c.doneAt = c.doneAt || new Date().toISOString(); saveCHOState(); _bls.di = null; renderCard(di); try { if (typeof nfRenderToday === 'function') nfRenderToday(); } catch (e) {} blsDayDoneShow(di); }
}
function blsDayDoneClose() { var o = document.getElementById('bls-dd'); if (o) o.remove(); try { if (typeof nfTab === 'function') nfTab('today'); } catch (e) {} }
function blsDayDoneShow(di) {
  try {
    var n = blsMine(di).length, N = blsBaseN(), nm = typeof nfFirstName === 'function' ? nfFirstName() : '', team = '';
    var F = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode && _nfFac.progress) ? _nfFac : null;
    if (F) { var staff = F.staff || {}, me = String(choState.staffMobile || ''), present = scRolesFromRoster(staff), d = getDay(di), fin = [], left = [];
      Object.keys(staff).forEach(function (m) { if (m === me) return; var p = staff[m] || {}, tot = 0, ans = 0, rec = ((F.progress || {})[m] || {})['day_' + di] || null;
        (d.cps || []).forEach(function (cp, ci) { var S = blsSlots(cp).filter(function (s) { return blsOwnerOK(s.own, p.role, present); }); var A = blsAnsOfRec(rec, ci) || {}; tot += S.length; S.forEach(function (s) { if (blsDone1(s, A[s.id])) ans++; }); });
        if (!tot) return; var f = String(p.name || p.role).split(' ')[0]; if (rec && rec.taskDone) fin.push(f); else left.push([f, tot - ans]); });
      team = [fin.length ? blsT(fin.join(', ') + (fin.length > 1 ? ' have' : ' has') + ' finished too.', fin.join(', ') + ' ने भी पूरा कर लिया।') : '', left.slice(0, 2).map(function (x) { return blsT(x[0] + ' has ' + x[1] + ' lines left.', x[0] + ' की ' + x[1] + ' पंक्तियाँ बाकी।'); }).join(' ')].join(' ').trim(); }
    var wk = ''; for (var k = 0; k < N; k++) { var cc = (choState.cards || {})[k], dn = !!(cc && cc.taskDone) || k === di; wk += '<span class="' + (dn ? 'ok' : '') + '">' + (dn ? '✓' : (k + 1)) + '</span>'; }
    var next = di + 1 < N ? blsT('Day ' + (di + 2) + ' opens on its date: ', 'दिन ' + (di + 2) + ' अपनी तारीख पर खुलेगा: ') + blsTheme(di + 1) : blsT('That was your last baseline day. The facility baseline appears when the whole team has submitted.', 'यह आपका अंतिम बेसलाइन दिन था। पूरी टीम के जमा करने पर केंद्र की बेसलाइन दिखेगी।');
    var conf = ''; ['#E9963A', '#8FB4E8', '#D7B6E6', '#F2C4D2', '#7FD1A4', '#E9963A', '#8FB4E8', '#7FD1A4', '#D7B6E6', '#F2C4D2', '#E9963A', '#7FD1A4'].forEach(function (c, i) { conf += '<i style="left:' + (6 + i * 8) + '%;background:' + c + ';animation-delay:' + (i % 5) * 0.12 + 's"></i>'; });
    var o = document.getElementById('bls-dd'); if (o) o.remove(); o = document.createElement('div'); o.id = 'bls-dd'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', blsT('Day ' + (di + 1) + ' done', 'दिन ' + (di + 1) + ' पूरा'));
    o.innerHTML = '<div class="bls-conf" aria-hidden="true">' + conf + '</div><div class="bls-ddb"><span class="bls-ddt"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14514A" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></span>'
      + '<b>' + blsE(blsT('Day ' + (di + 1) + ' done', 'दिन ' + (di + 1) + ' पूरा')) + '</b><p>' + blsE(blsT('Thank you' + (nm ? ', ' + nm : '') + '. You looked honestly at ' + n + ' checkpoints — that is what makes the plan right.', 'धन्यवाद' + (nm ? ' ' + nm : '') + '। आपने ' + n + ' चेकपॉइंट ईमानदारी से देखे — इसी से योजना सही बनती है।')) + '</p>'
      + '<div class="bls-ddw"><small>' + blsE(blsT('YOUR BASELINE WEEK', 'आपका बेसलाइन सप्ताह')) + '</small><div>' + wk + '</div>' + (team ? '<p>' + blsE(team) + '</p>' : '') + '</div>'
      + '<p class="bls-ddn">' + blsE(next) + '</p>' + (typeof lrnOpen === 'function' ? '<button type="button" class="bls-ddl" onclick="blsDayDoneClose();lrnOpen(\'faq\',' + di + ')">' + blsE(blsT('What assessors ask about today\'s checkpoints', 'आज के चेकपॉइंट पर आकलनकर्ता क्या पूछते हैं')) + '</button>' : '') + '<button type="button" onclick="blsDayDoneClose()">' + blsE(blsT('Back to Today', 'आज पर वापस')) + '</button></div>';
    document.body.appendChild(o); blsBuzz();
  } catch (e) { console.warn('[BLS] day done', e); }
}
function blsWeekHTML() {
  var today = typeof scb1TodayIdx === 'function' ? scb1TodayIdx() : 0, N = blsBaseN(), h = '<div class="bls-week">';
  for (var d = 0; d < N; d++) { var c = (choState.cards || {})[d], done = !!(c && c.taskDone), mine = 0; try { mine = blsMine(d).length; } catch (e) {}
    var cls = done ? 'ok' : (!mine ? 'na' : d === today ? 'now' : d < today ? 'late' : '');
    h += '<span class="' + cls + '"><i>' + (done ? '✓' : !mine ? '–' : (d + 1)) + '</i><small>' + blsE(blsT('Day ', 'दिन ')) + (d + 1) + '</small></span>'; }
  return h + '</div>';
}
function blsDoneHTML(di) {
  return '<div class="bls-done"><span aria-hidden="true">✅</span><b>' + blsE(blsT('Baseline done · Day ' + (di + 1), 'बेसलाइन पूरी · दिन ' + (di + 1))) + '</b><small>' + blsE(blsT('Thank you. The next baseline day opens on its date.', 'धन्यवाद। अगला बेसलाइन दिन अपनी तारीख पर खुलेगा।')) + '</small></div>'
    + '<div class="bls-card"><b>' + blsE(blsT('Baseline week', 'बेसलाइन सप्ताह')) + '</b>' + blsWeekHTML() + '<p class="bls-dim">' + blsE(blsT('Your facility\'s baseline appears when the whole team has submitted all ' + blsBaseN() + ' days.', 'पूरी टीम के सभी ' + blsBaseN() + ' दिन जमा होने पर आपके केंद्र की बेसलाइन दिखेगी।')) + '</p></div>';
}
// the card for a baseline day goes through the simple baseline
(function () {
  if (typeof renderCard !== 'function') return; var o = renderCard;
  renderCard = function (di) { try { di = +di; if (blsOn(di) && scDayUnlocked(di) && typeof phcCheckAccess === 'function' && phcCheckAccess(di, getDay(di))) { window._scLastDi = di; blsRender(di); return; } } catch (e) { console.warn('[BLS]', e); } return o.apply(this, arguments); };
  if (typeof nfOpenToday === 'function') { var n = nfOpenToday; nfOpenToday = function (ci) { try { var t0 = scb1TodayIdx(); if (blsOn(t0) && ci != null) { _bls.di = t0; _bls.want = ci; } } catch (e) {} return n.apply(this, arguments); }; }
  // partial answers count as a change, so they sync too
  if (typeof scCardSig === 'function') { var sg = scCardSig; scCardSig = function (c) { var r = sg.apply(this, arguments); return c && c.blAns && Object.keys(c.blAns).length ? r + JSON.stringify(c.blAns) : r; }; }
  if (typeof scCardIsEmpty === 'function') { var em = scCardIsEmpty; scCardIsEmpty = function (c) { if (c && c.blAns && Object.keys(c.blAns).some(function (k) { return c.blAns[k] && Object.keys(c.blAns[k]).length; })) return false; return em.apply(this, arguments); }; }
  // answers travel with the day record
  if (typeof scCardFromRecord === 'function') { var f = scCardFromRecord; scCardFromRecord = function (rec) { var c = f.apply(this, arguments); try { var b = (rec && rec.blAns) || {}; c.blAns = {}; Object.keys(b).forEach(function (k) { var m = /^c(\d+)$/.exec(k); if (m) c.blAns[+m[1]] = Object.assign({}, b[k]); }); } catch (e) {} return c; }; }
  if (typeof scSyncProgress === 'function') { var sp = scSyncProgress; scSyncProgress = async function (di) { var ok = await sp.apply(this, arguments);
    if (ok) { var c = choState.cards[di]; if (c && c.blAns && Object.keys(c.blAns).length) { var o2 = {}; Object.keys(c.blAns).forEach(function (k) { if (c.blAns[k] && Object.keys(c.blAns[k]).length) o2['c' + k] = c.blAns[k]; });
      try { await db.ref(scProgressPath(choState.facilityCode, choState.staffMobile, di) + '/blAns').set(o2); } catch (e) { return false; } } }
    return ok; }; }
})();
// Today during the baseline week: no scores — the day, the checkpoints, "Baseline done ✓"
(function () {
  if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () {
    var r = o.apply(this, arguments);
    try {
      var host = document.getElementById('nf-today'); if (!host || (typeof wsIsPre === 'function' && wsIsPre())) return r;
      var today = scb1TodayIdx(); if (!blsOn(today)) return r;
      var top = host.querySelector('.nf-top'), c = getCHOCard(today), mine = blsMine(today), open = mine.length ? blsOpenCount(today) : 0;
      var total = mine.reduce(function (n, ci) { return n + blsSlotsMine(getDay(today).cps[ci]).length; }, 0), mins = Math.max(5, Math.round(total * 0.6));
      var cta = c.taskDone ? '<div class="nf-cta bls-ok">✓ ' + blsE(blsT('Baseline done for today', 'आज की बेसलाइन पूरी')) + '</div>'
        : !mine.length ? '<div class="nf-cta bls-ok">' + blsE(blsT('Nothing for your role today', 'आज आपकी भूमिका के लिए कुछ नहीं')) + '</div>'
        : '<button type="button" class="nf-cta" onclick="nfOpenToday()">' + blsE(open < total ? blsT('Continue', 'जारी रखें') : blsT('Start', 'शुरू करें')) + ' <i class="ti ti-chevron-right"></i></button>';
      var hero = '<div class="nf-hero bls-dayhero">' + blsArt(today) + '<div class="nf-hero-k">' + blsE(blsT('BASELINE · DAY ' + (today + 1) + ' OF ' + blsBaseN(), 'बेसलाइन · दिन ' + (today + 1) + ' / ' + blsBaseN())) + '</div><div class="nf-hero-t">' + blsE(blsTheme(today)) + '</div>'
        + (mine.length && !c.taskDone ? '<div class="nf-hero-s">' + blsE(blsT((open < total ? (total - open) + ' of ' + total + ' answered' : total + ' questions') + ' · about ' + mins + ' minutes', (open < total ? total + ' में से ' + (total - open) + ' उत्तर' : total + ' प्रश्न') + ' · लगभग ' + mins + ' मिनट')) + '</div>' : '') + cta + '</div>';
      var how = '<div class="nf-card bls-how"><b>' + blsE(blsT('How the baseline works', 'बेसलाइन कैसे होती है')) + '</b><span>' + blsE(blsT('Look at each line in your facility today and answer honestly — tap what you see, count items in stock, or check a few records. If you are unsure, say Not sure. There are no right answers to aim for — the baseline shows where your team starts.', 'आज अपने केंद्र में हर पंक्ति देखें और ईमानदारी से उत्तर दें — जो दिखे वह चुनें, स्टॉक में सामान गिनें, या कुछ रिकॉर्ड जाँचें। पक्का न हो तो “पता नहीं” चुनें। लक्ष्य कोई सही उत्तर नहीं — बेसलाइन बताती है कि आपकी टीम कहाँ से शुरू कर रही है।')) + '</span></div>';
      // keep everything else on Today (location, All my facilities, outreach…); swap the hero, drop the scored to-do list and missions
      host.querySelectorAll('.nf-sec').forEach(function (sec) { var nx = sec.nextElementSibling; if (nx && (nx.classList.contains('nf-list') || nx.classList.contains('nf-q'))) { nx.remove(); sec.remove(); } });
      var oldHero = host.querySelector('.nf-hero'), box = document.createElement('div');
      box.innerHTML = hero + blsTeamHTML(today) + '<div class="nf-card bls-wk"><b>' + blsE(blsT('Baseline week', 'बेसलाइन सप्ताह')) + '</b>' + blsWeekHTML() + '</div>' + how;
      var anchor = oldHero || (top ? host.querySelector('.nf-top') : null);
      var frag = document.createDocumentFragment(); while (box.firstChild) frag.appendChild(box.firstChild);
      if (oldHero) oldHero.parentNode.replaceChild(frag, oldHero); else if (anchor) anchor.parentNode.insertBefore(frag, anchor.nextSibling); else host.insertBefore(frag, host.firstChild);
    } catch (e) { console.warn('[BLS] today', e); }
    return r;
  };
})();

// ══ After the baseline: understanding gaps (from all the team's baseline answers) ══
var _blsG = { code: null, at: 0, gaps: null };
function blsAnsOfRec(rec, ci) { var b = (rec && rec.blAns && rec.blAns['c' + ci]) || null; return b; }
function blsGapsFrom(progress, staff) {
  var G = {}, N = blsBaseN(), progId = choState.progId;
  var gap = function (key, cp, k) { return G[key] || (G[key] = { key: key, cp: cp, k: k, notsure: 0, wrong: 0, met: 0, not: 0, linked: 0, review: 0, who: {} }); };
  Object.keys(progress || {}).forEach(function (mob) {
    var P = progress[mob] || {}, nm = ((staff || {})[mob] || {}).name || mob;
    for (var di = 0; di < N; di++) {
      var rec = P['day_' + di]; if (!rec || !rec.taskDone) continue; var own = typeof nfSelfRec === 'function' ? nfSelfRec(rec) : rec; var d = getDay(di);   // own = the staff's own answers, before any reviewer change
      if (!d || !d.cps) continue;
      d.cps.forEach(function (cp, ci) {
        var A = blsAnsOfRec(rec, ci), S = blsSlots(cp);
        if (A) S.forEach(function (s) { var v = A[s.id]; if (v == null) return; var g = gap(s.key, cp, s.k);
          if (s.kind === 'mcq') { if (v !== 'o' + s.q.a) { g.wrong++; g.who[nm] = 'wrong'; } else g.who[nm] = g.who[nm] || 'right'; }
          else if (v === '?') { g.notsure++; g.who[nm] = 'notsure'; } });
        var tk = own.cpTicks && own.cpTicks['c' + ci];
        if (tk != null) String(tk).split('').forEach(function (ch, k) { if (ch !== '1' && ch !== '0') return; var g = gap(cp.id + '.' + (k + 1), cp, k); if (ch === '1') g.met++; else g.not++; });
        else if (!(cp.items || []).length) { var sc = (own.cpScores || [])[ci]; if (sc === 2 || sc === 0) { var g0 = gap(cp.id + '.0', cp, 0); if (sc === 2) g0.met++; else g0.not++; } }
        var R = rec.blRev && rec.blRev['c' + ci]; if (R) Object.keys(R).forEach(function (k) { var e = R[k] || {}; if (e.r && e.r !== 'ok' && e.r !== 'inplace') { var key = k === 's' ? cp.id + '.0' : cp.id + '.' + (+k + 1); gap(key, cp, k === 's' ? 0 : +k).review++; } });
      });
    }
    try { if (typeof nfContras === 'function') nfContras(progId, function (di) { var rec = P['day_' + di]; var r0 = rec && rec.taskDone && di < N ? (typeof nfSelfRec === 'function' ? nfSelfRec(rec) : rec) : null; return r0 ? scCardFromRecord(r0, (getDay(di).cps || []).length) : null; })
      .forEach(function (x) { [x.a, x.b].forEach(function (a) { if (a && a.cp && a.cp.id) { var g = gap(a.cp.id + '.' + (a.k != null ? a.k + 1 : 0), a.cp, a.k || 0); g.linked++; } }); }); } catch (e) {}
  });
  return Object.keys(G).map(function (k) { var g = G[k]; g.differ = g.met > 0 && g.not > 0; g.signals = g.notsure + g.wrong + (g.differ ? 1 : 0) + g.linked + g.review; return g; })
    .filter(function (g) { return g.signals > 0; }).sort(function (a, b) { return b.signals - a.signals || a.key.localeCompare(b.key); });
}
async function blsLoadGaps(force) {
  if (!blsComplete() || typeof nfLoadFacility !== 'function') return null;
  if (!force && _blsG.gaps && _blsG.code === choState.facilityCode && Date.now() - _blsG.at < 600000) return _blsG.gaps;
  var F = await nfLoadFacility(); if (!F || !F.progress) return null;
  _blsG = { code: choState.facilityCode, at: Date.now(), gaps: blsGapsFrom(F.progress, F.staff) }; return _blsG.gaps;
}
function blsReasonText(g) {
  var R = [];
  if (g.notsure) R.push(blsT(g.notsure + ' not sure', g.notsure + ' को पता नहीं'));
  if (g.wrong) R.push(blsT(g.wrong + ' chose a different answer', g.wrong + ' ने अलग उत्तर चुना'));
  if (g.differ) R.push(blsT(g.met + ' said Met, ' + g.not + ' Not met', g.met + ' ने पूरा, ' + g.not + ' ने पूरा नहीं कहा'));
  if (g.linked) R.push(blsT('linked answers differ', 'जुड़े उत्तर अलग'));
  if (g.review) R.push(blsT('the reviewer\'s check differed', 'समीक्षक की जाँच अलग'));
  return R.join(' · ');
}
function blsMovText(g) { var hi = blsHi(), it = (g.cp.items || [])[g.k]; return it ? (hi && it.h ? it.h : it.t) : (hi && g.cp.hi ? g.cp.hi : g.cp.t); }
function blsExplain(key) { var Q = SC_BLQ[key]; if (!Q) return ''; var hi = blsHi(); return Q.map(function (q) { return hi && q.xh ? q.xh : q.x; }).join(' '); }
// the in-charge's baseline report
async function blsReport() {
  var ov = document.getElementById('bls-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'bls-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); document.body.appendChild(ov); }
  ov.innerHTML = '<div class="bls-page"><p class="bls-dim">' + blsE(blsT('Loading…', 'लोड हो रहा है…')) + '</p></div>';
  var G = await blsLoadGaps(true) || [], F = (typeof _nfFac !== 'undefined' && _nfFac) || {}, B = (F.agg && F.agg.baseline) || {};
  var h = '<div class="bls-page"><header class="bls-ovh"><button type="button" class="bls-x" onclick="document.getElementById(\'bls-ov\').remove()" aria-label="' + blsE(blsT('Close', 'बंद करें')) + '">‹</button><div><b>' + blsE(blsT('Baseline report', 'बेसलाइन रिपोर्ट')) + '</b><small>' + blsE(((choState.facility || {}).name) || '') + '</small></div></header>';
  h += '<div class="bls-hero"><div class="bls-ring">' + (B.assessed ? B.pct + '%' : '—') + '</div><div><b>' + blsE(blsT('Facility baseline', 'केंद्र की बेसलाइन')) + '</b><small>' + blsE(blsT('All ' + blsBaseN() + ' days in · NQAS Ready at 70%', 'सभी ' + blsBaseN() + ' दिन पूरे · NQAS तैयार 70% पर')) + '</small></div></div>';
  h += '<div class="bls-card"><div class="bls-row2"><b>' + blsE(blsT('Understanding gaps · ' + G.length, 'समझ की कमियाँ · ' + G.length)) + '</b><small>' + blsE(blsT('learn these first', 'पहले इन्हें सीखें')) + '</small></div><p class="bls-dim">' + blsE(blsT('Checkpoints where the team saw things differently. They open the implementation cards with a short explainer.', 'वे चेकपॉइंट जहाँ टीम की राय अलग थी। ये लागू करने के कार्डों में छोटी व्याख्या के साथ खुलेंगे।')) + '</p>'
    + (G.length ? G.slice(0, 60).map(function (g) { return '<div class="bls-g"><span class="bls-gk">' + blsE(g.key) + '</span><span class="bls-gt"><b>' + blsE(blsMovText(g)) + '</b><small>' + blsE(blsReasonText(g)) + '</small></span></div>'; }).join('') : '<p>' + blsE(blsT('No understanding gaps — the team agreed throughout.', 'कोई समझ की कमी नहीं — टीम हर जगह सहमत रही।')) + '</p>') + '</div></div>';
  ov.innerHTML = h;
}
// in-charge's Today: the report entry (after the baseline is complete, in the first weeks of implementation)
(function () {
  if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () { var r = o.apply(this, arguments); try {
    if (!blsSC() || !blsComplete() || blsDemo() || (choState.roleId || 'CHO') !== 'CHO') return r; var host = document.getElementById('nf-today'), today = scb1TodayIdx(); if (!host || today >= blsBaseN() + 21 || host.querySelector('.bls-rep')) return r;
    var put = function (G) { if (!host.isConnected || host.querySelector('.bls-rep') || !G) return; var cta = host.querySelector('.nf-hero');
      var el = document.createElement('button'); el.type = 'button'; el.className = 'nf-link-card bls-rep'; el.setAttribute('onclick', 'blsReport()');
      var nA = (_blsG.arr || {}).total || 0; el.innerHTML = '<i class="ti ti-clipboard-check"></i><span>' + blsE(blsT('Baseline report · ' + G.length + ' understanding gaps' + (nA ? ' · ' + nA + ' things to arrange' : ''), 'बेसलाइन रिपोर्ट · ' + G.length + ' समझ की कमियाँ' + (nA ? ' · ' + nA + ' व्यवस्थाएँ' : ''))) + '</span><i class="ti ti-chevron-right"></i>';
      if (cta && cta.parentNode) cta.parentNode.insertBefore(el, cta.nextSibling); else host.appendChild(el); };
    if (_blsG.gaps && _blsG.code === choState.facilityCode) put(_blsG.gaps); else blsLoadGaps().then(put);
  } catch (e) {} return r; };
})();
// implementation cards: "Your team saw this differently in the baseline"
(function () {
  if (typeof renderCard !== 'function') return; var o = renderCard;
  renderCard = function (di) { var r = o.apply(this, arguments); try {
    di = +di; if (!blsSC() || di < blsBaseN() || !blsComplete() || blsDemo()) return r;
    var draw = function (G) { if (!G || !G.length) return; var d = getDay(di); (d.cps || []).forEach(function (cp, ci) {
      var el = document.getElementById('cp-' + di + '-' + ci); if (!el || el.querySelector('.bls-was')) return;
      var mine = G.filter(function (g) { return g.cp.id === cp.id; }); if (!mine.length) return;
      var x = mine.map(function (g) { return blsExplain(g.key); }).filter(Boolean).join(' ');
      var box = document.createElement('div'); box.className = 'bls-was';
      box.innerHTML = '🧭 <b>' + blsE(blsT('Your team saw this differently in the baseline', 'बेसलाइन में आपकी टीम की राय इस पर अलग थी')) + '</b>' + mine.map(function (g) { return '<div class="bls-wr">' + ((cp.items || []).length ? '<b>' + blsE(blsT('MoV ', 'MoV ') + (g.k + 1)) + '</b> — ' : '') + blsE(blsReasonText(g)) + '</div>'; }).join('') + (x ? '<div class="bls-wx">' + blsE(x) + '</div>' : '');
      var body = el.querySelector('.cp-body') || el; body.insertBefore(box, body.firstChild); }); };
    if (_blsG.gaps && _blsG.code === choState.facilityCode) draw(_blsG.gaps); else blsLoadGaps().then(function (G) { if (window._scLastDi === di) draw(G); });
  } catch (e) { console.warn('[BLS] was', e); } return r; };
})();
// Progress tab during the baseline (23 Nov 2026, HealSol): no readiness numbers until the whole baseline is in
function blsHideNumbers() { try { return blsSC() && !blsComplete() && !blsDemo(); } catch (e) { return false; } }
(function () {
  if (typeof nfRenderProgress !== 'function') return; var o = nfRenderProgress;
  nfRenderProgress = async function () {
    if (!blsHideNumbers()) return o.apply(this, arguments);
    var p = nfPage('nf-progress'), today = Math.max(0, scb1TodayIdx()), N = blsBaseN(), done = 0;
    for (var d = 0; d < N; d++) { var c = (choState.cards || {})[d]; if (c && c.taskDone) done++; }
    p.innerHTML = '<div class="one-wrap"><div class="nf-ph one-ph"><h1>' + blsE(t('My progress')) + '</h1><span class="nf-chip o">' + blsE(blsT('Baseline week', 'बेसलाइन सप्ताह')) + '</span></div>'
      + '<div class="bls-card"><b>' + blsE(blsT('Baseline week · ' + done + ' of ' + N + ' days submitted', 'बेसलाइन सप्ताह · ' + N + ' में से ' + done + ' दिन जमा')) + '</b>' + blsWeekHTML() + '</div>'
      + '<div class="bls-card bls-wait"><span aria-hidden="true">📊</span><b>' + blsE(blsT('Your readiness appears after the baseline', 'आपकी तैयारी बेसलाइन के बाद दिखेगी')) + '</b><p class="bls-dim">' + blsE(blsT('Scores and readiness stay hidden until the whole team has submitted all ' + N + ' days, so everyone answers as they see things today. Then you see your facility\'s starting point and what to learn first.', 'जब तक पूरी टीम सभी ' + N + ' दिन जमा नहीं कर देती, स्कोर और तैयारी छिपे रहते हैं, ताकि हर कोई आज जैसा देखता है वैसा उत्तर दे। फिर आप अपने केंद्र की शुरुआत और पहले क्या सीखना है, देखेंगे।')) + '</p></div></div>';
  };
})();
// Day preview on baseline days (23 Nov 2026, HealSol): "What you'll look at", not "What to keep ready" — have things to hand, fix nothing first
function blsPrepDay(di) { return blsHideNumbers() && di >= 0 && di < blsBaseN(); }
(function () {
  if (typeof scb2OpenPrep === 'function') { var o = scb2OpenPrep; scb2OpenPrep = function (di) { var r = o.apply(this, arguments); try {
    di = +di; if (!blsPrepDay(di)) return r; var ov = [].slice.call(document.querySelectorAll('.scx-ov.scb2-ov')).pop(); if (!ov) return r;
    var pre = typeof wsIsPre === 'function' && wsIsPre(), when = typeof scb2DayLong === 'function' ? scb2DayLong(di) : '', lk = ov.querySelector('.scb2-lock span');
    if (lk) lk.textContent = scDayUnlocked(di) ? blsT('Baseline Day ' + (di + 1) + ' is open — open the card to answer.', 'बेसलाइन दिन ' + (di + 1) + ' खुला है — उत्तर देने के लिए कार्ड खोलें।')
      : (pre ? blsT('The programme has not started yet. ', 'कार्यक्रम अभी शुरू नहीं हुआ। ') : '') + blsT('Baseline Day ' + (di + 1) + ' opens on ' + when, 'बेसलाइन दिन ' + (di + 1) + ' ' + when + ' को खुलेगा');
    var kr = t('What to keep ready');
    [].forEach.call(ov.querySelectorAll('.scb2-sec-t'), function (el) { if (el.textContent.trim() !== kr) return;
      el.innerHTML = '<i class="ti ti-eye"></i> ' + blsE(blsT('What you\'ll look at on Day ' + (di + 1), 'दिन ' + (di + 1) + ' पर आप क्या देखेंगे'));
      el.insertAdjacentHTML('afterend', '<div class="bls-prepnote">' + blsE(blsT('Just have these to hand. Don\'t fix or add anything before the baseline — it should show how things are today.', 'बस इन्हें पास रखें। बेसलाइन से पहले कुछ ठीक या नया न करें — बेसलाइन को आज की असली स्थिति दिखानी है।')) + '</div>'); });
  } catch (e) { console.warn('[BLS] prep', e); } return r; }; }
  if (typeof scb2OpenDaySheet === 'function') { var od = scb2OpenDaySheet; scb2OpenDaySheet = function (di) { var r = od.apply(this, arguments); try {
    di = +di; if (!blsPrepDay(di)) return r; var ov = [].slice.call(document.querySelectorAll('.scx-ov.scb2-ov')).pop(); if (!ov) return r;
    [].forEach.call(ov.querySelectorAll('button[onclick^="scb2OpenPrep"]'), function (b) { b.innerHTML = '<i class="ti ti-eye"></i> ' + blsE(blsT('What you\'ll look at', 'आप क्या देखेंगे')); });
  } catch (e) {} return r; }; }
})();

// ══ Things to arrange (Day 8): what the Not met / Not sure evidence lines point to — records, items, displays ══
function blsArrangeFrom(progress) {
  var N = blsBaseN(), mov = {}, LIST = {};
  Object.keys(progress || {}).forEach(function (mob) { var P = progress[mob] || {};
    for (var di = 0; di < N; di++) { var rec = P['day_' + di]; if (!rec || !rec.taskDone || !rec.blAns) continue; var d = getDay(di); if (!d || !d.cps) continue;
      d.cps.forEach(function (cp, ci) { var A = rec.blAns['c' + ci]; if (!A) return;
        blsSlots(cp).forEach(function (s) {
          if (s.kind === 'list' && s.ty !== 'yn') { var str = String(A[s.id] || ''); s.items.forEach(function (itm, n) { var gp = typeof blsItemGap === 'function' ? blsItemGap(s, str, n) : (str[n] === '0' ? '' : null); if (gp === null) return;
              var tag = ' — ' + gp;
              var b0 = LIST[itm.n] || (LIST[itm.n] = { text: itm.n + tag, n: 0, cps: {} }); b0.n++; b0.cps[cp.id] = 1; }); return; }
          if (s.kind !== 'tri' || (s.m === 'SI' && s.part !== 'b')) return; var v = A[s.id]; if (v !== '0' && v !== '?') return;
          var it = (cp.items || [])[s.k], key = s.key + (s.part ? s.part : '');
          if (!mov[key]) mov[key] = { cp: cp, t: [s.t, it && it.t !== s.t ? it.t : ''].join(' '), m: String(s.m || '').split(/[+\/]/).filter(Boolean) }; }); }); }
  });
  var cats = { rec: {}, item: LIST, disp: {} };
  Object.keys(mov).forEach(function (k) { var x = mov[k], P;
    try { P = scb2PrepFor([{ id: x.cp.id, t: x.t, method: x.m.length ? x.m : ['OB'], items: [], role: x.cp.role, roles: x.cp.roles }]); } catch (e) { return; }
    ['rec', 'item', 'disp'].forEach(function (c) { (P[c] || []).forEach(function (e) { var txt = typeof e === 'string' ? e : e.text; if (/Areas to be observed|जिन जगहों/.test(txt)) return;
      var b = cats[c][txt] || (cats[c][txt] = { text: txt, n: 0, cps: {} }); b.n++; b.cps[x.cp.id] = 1; }); }); });
  var out = {}, total = 0; ['rec', 'item', 'disp'].forEach(function (c) { out[c] = Object.keys(cats[c]).map(function (k) { return cats[c][k]; }).sort(function (a, b) { return b.n - a.n || a.text.localeCompare(b.text); }); total += out[c].length; });
  out.total = total; return out;
}
(function () {
  var oL = blsLoadGaps; blsLoadGaps = async function (force) { var G = await oL.apply(this, arguments);
    try { if (G && (force || !_blsG.arr)) { var F = typeof _nfFac !== 'undefined' ? _nfFac : null; if (F && F.progress) _blsG.arr = blsArrangeFrom(F.progress); } } catch (e) { console.warn('[BLS] arrange', e); }
    return G; };
  var oR = blsReport; blsReport = async function () { var r = await oR.apply(this, arguments); try {
    var A = _blsG.arr, pg = document.querySelector('#bls-ov .bls-page'); if (!A || !pg) return r;
    var sec = function (c, title, th, icon) { var L = A[c] || []; if (!L.length) return ''; return '<div class="bls-ah"><i class="ti ' + icon + '"></i> ' + blsE(blsT(title, th)) + '</div>'
      + L.slice(0, 25).map(function (x) { var ids = Object.keys(x.cps); return '<div class="bls-a"><span class="bls-at"><b>' + blsE(x.text) + '</b><small>' + blsE(ids.slice(0, 4).join(' · ') + (ids.length > 4 ? ' +' + (ids.length - 4) : '')) + '</small></span><span class="bls-an">' + x.n + '<small>' + blsE(blsT(x.n === 1 ? 'MoV' : 'MoVs', 'MoV')) + '</small></span></div>'; }).join(''); };
    var h = '<div class="bls-card"><div class="bls-row2"><b>' + blsE(blsT('Things to arrange · ' + A.total, 'क्या व्यवस्था करें · ' + A.total)) + '</b><small>' + blsE(blsT('from Not met and Not sure', 'पूरा नहीं और पता नहीं से')) + '</small></div>'
      + '<p class="bls-dim">' + blsE(blsT('What the baseline found missing: records to start, items to get or request from the block, displays to put up. The number is how many MoVs depend on it.', 'बेसलाइन में जो कमी मिली: शुरू करने वाले रिकॉर्ड, लाने या ब्लॉक से माँगने वाला सामान, लगाने वाले डिस्प्ले। संख्या बताती है कि कितने MoV इस पर निर्भर हैं।')) + '</p>'
      + (A.total ? sec('item', 'Items & equipment', 'सामान और उपकरण', 'ti-box') + sec('disp', 'Displays & signage', 'डिस्प्ले और साइनबोर्ड', 'ti-presentation') + sec('rec', 'Records & registers', 'रिकॉर्ड और रजिस्टर', 'ti-notebook')
        : '<p>' + blsE(blsT('Nothing missing was linked to a record, item or display.', 'किसी रिकॉर्ड, सामान या डिस्प्ले की कमी नहीं मिली।')) + '</p>') + '</div>';
    var hero = pg.querySelector('.bls-hero'); if (hero) hero.insertAdjacentHTML('afterend', h); else pg.insertAdjacentHTML('beforeend', h);
  } catch (e) { console.warn('[BLS] arrange view', e); } return r; };
})();

// ══ Line cards: whose line is it, and the facility score from everyone's lines (24 Nov 2026, HealSol decisions 1–6) ══
// A checkpoint's lines can belong to different people (MPW: the board · ANM: the charter · ASHA: ask 2–3 patients). Each
// staff card scores only its own lines; the facility baseline merges every owner's answers line by line and then applies
// the NQAS rule once (all = 2, 50–99% = 1, below 50% = 0). Two people answering the same line: the stricter answer counts.
var _blsFlagsFor = null;   // facility flags while scoring another facility (dashboards)
(function () {
  var o0 = blsFlags; blsFlags = function () { return _blsFlagsFor || o0(); };
  if (typeof scMyCp === 'function') { var m0 = scMyCp; scMyCp = function (di, ci) { try { if (blsLineMode() && blsOn(+di)) { var cp = (getDay(di).cps || [])[ci]; return !!cp && blsSlotsMine(cp).length > 0; } } catch (e) {} return m0.apply(this, arguments); }; }
  if (typeof scFacAggFor === 'function') { var a0 = scFacAggFor; scFacAggFor = function (code) { var fac = (scMasterFacilities || {})[code] || {}; _blsFlagsFor = fac.clFlags || {}; try { return a0.apply(this, arguments); } finally { _blsFlagsFor = null; } }; }
})();
function blsFacMerge(progId, progressByMob, staffMap, A) {
  if (!blsLineMode() || !/^nqas_12[AB]$/.test(progId || '')) return A;
  var any = Object.keys(progressByMob || {}).some(function (m) { return Object.keys(progressByMob[m] || {}).some(function (k) { var r = progressByMob[m][k]; return r && r.blAns; }); });
  if (!any) return A;
  var present = scRolesFromRoster(staffMap || {}), roleOf = function (mob) { var s = (staffMap || {})[mob]; if (s && s.role) return s.role; var r0 = ''; Object.keys(progressByMob[mob] || {}).some(function (k) { var r = progressByMob[mob][k]; if (r && r.role) { r0 = r.role; return true; } return false; }); return r0 || 'CHO'; };
  var merged = {};
  for (var di = 0; di < blsBaseN(); di++) {
    var d = scDayDef(progId, di); if (!d || !d.cps) continue;
    d.cps.forEach(function (cp, ci) {
      if (merged[cp.id] !== undefined) return;
      var S = blsSlots(cp); if (!S.length) { merged[cp.id] = 2; return; }
      var best = {};
      Object.keys(progressByMob || {}).forEach(function (mob) {
        var rec = (progressByMob[mob] || {})['day_' + di]; if (!rec || !rec.taskDone) return;
        var own = typeof nfSelfRec === 'function' && rec.blRev ? rec : rec, Ans = (own.blAns || {})['c' + ci] || {}, role = roleOf(mob);
        S.forEach(function (s) { var v = blsVal(s, Ans[s.id]); if (v === null) return; best[s.id] = best[s.id] === undefined ? v : Math.min(best[s.id], v); });
        // the Champion's change on a MoV (blRev) overrides that MoV for everyone
        var R = rec.blRev && rec.blRev['c' + ci]; if (R) Object.keys(R).forEach(function (k) { var e = R[k] || {}; if (e.v == null || e.r === 'ok') return; var kk = k === 's' ? 0 : +k, met = k === 's' ? +e.v === 2 : +e.v === 1; S.forEach(function (s) { if (s.k === kk) best[s.id] = met ? 1 : 0; }); });
      });
      var byK = {}; S.forEach(function (s) { (byK[s.k] = byK[s.k] || []).push(s); });
      var vals = Object.keys(byK).map(function (k) { var vs = byK[k].map(function (s) { return best[s.id] === undefined ? null : best[s.id]; }); return vs.some(function (x) { return x === null; }) ? null : Math.min.apply(null, vs); });
      merged[cp.id] = blsScoreOf(vals);
    });
  }
  var cps = scPkgNqas(progId), B = Object.assign({ xp: 0, max: 0, pct: 0, assessed: 0 }, scDimsEmpty()), A2 = scDimsEmpty(), xp = 0, max = 0, assessed = 0;
  cps.forEach(function (cp) {
    var e = A.cps[cp.id] || (A.cps[cp.id] = { score: null, base: null, by: [], owners: 0 });
    if (merged[cp.id] !== undefined) {
      var later = (A.staff || []).some(function (p) { var L = p.res && p.res.latest && p.res.latest[cp.id]; return L && L.di >= blsBaseN(); });
      e.base = merged[cp.id]; if (!later) e.score = merged[cp.id];
    }
    B.max += 2; if (e.base !== null) { B.xp += e.base; B.assessed++; } scDimsAdd(B, cp, e.base || 0, e.base !== null);
    max += 2; if (e.score !== null) { xp += e.score; assessed++; } scDimsAdd(A2, cp, e.score || 0, e.score !== null);
  });
  scDimsFinish(B); A.baseline = B;
  Object.assign(A, A2); A.xp = xp; A.max = max; A.assessed = assessed; scDimsFinish(A);
  A.coverage = { assessed: assessed, total: cps.length, pct: cps.length ? Math.round(assessed / cps.length * 100) : 0 };
  A.compliance = assessed ? Math.round(xp / (assessed * 2) * 100) : 0;
  if (typeof scNqasCheckV2 === 'function') A.nqas = scNqasCheckV2(A);
  A.lineMerged = true;
  return A;
}
(function () {
  if (typeof scFacilityReadiness !== 'function') return; var f0 = scFacilityReadiness;
  scFacilityReadiness = function (progId, progressByMob, staffMap) { var A = f0.apply(this, arguments); try { return blsFacMerge(progId || 'nqas_12A', progressByMob || {}, staffMap || {}, A); } catch (e) { console.warn('[BLS] merge', e); return A; } };
})();

// ══ Checklist settings for the facility (in-charge): which lines apply here (HealSol decision 4: Not applicable only from the profile) ══
var BLS_FLAGS = [
  ['lf', 'This is an LF-endemic (filariasis) district', 'यह LF (फ़ाइलेरिया) प्रभावित ज़िला है', 'Adds DEC tablets and the filariasis test to the checklist.', 'DEC गोलियाँ और फ़ाइलेरिया जाँच चेकलिस्ट में जुड़ेंगी।'],
  ['maleCHO', 'The CHO is a man', 'CHO पुरुष हैं', 'Adds the line on a female attendant during examinations of women.', 'महिलाओं की जाँच के समय महिला सहायिका वाली पंक्ति जुड़ेगी।'],
  ['elderly', 'Elderly and palliative care packages are offered', 'बुज़ुर्ग और उपशामक देखभाल पैकेज दिए जाते हैं', 'Keeps the physiotherapy training lines.', 'फ़िज़ियोथेरेपी प्रशिक्षण वाली पंक्तियाँ रहेंगी।'],
  ['pit', 'The facility uses a deep burial pit for waste', 'केंद्र कचरे के लिए डीप बरियल पिट उपयोग करता है', 'Adds the Pollution Control Board approval line.', 'प्रदूषण नियंत्रण बोर्ड की अनुमति वाली पंक्ति जुड़ेगी।'],
  ['hhfridge', 'Medicines and vaccines are kept in a household fridge (not an ILR)', 'दवाएँ और टीके घरेलू फ़्रिज में रखे जाते हैं (ILR नहीं)', 'Adds the defrosting line.', 'डीफ़्रॉस्ट वाली पंक्ति जुड़ेगी।']];
function blsFlagsOpen() {
  var F = blsFlags(), ov = document.getElementById('bls-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'bls-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); document.body.appendChild(ov); }
  ov.innerHTML = '<div class="bls-page"><header class="bls-ovh"><button type="button" class="bls-x" onclick="document.getElementById(\'bls-ov\').remove()" aria-label="' + blsE(blsT('Close', 'बंद करें')) + '">‹</button><div><b>' + blsE(blsT('Checklist settings', 'चेकलिस्ट सेटिंग')) + '</b><small>' + blsE(blsT('Only lines that apply to your facility are asked', 'केवल आपके केंद्र पर लागू पंक्तियाँ पूछी जाएँगी')) + '</small></div></header>'
    + '<div class="bls-card">' + BLS_FLAGS.map(function (f) { var on = f[0] === 'elderly' ? F.elderly !== false : !!F[f[0]];
      return '<label class="bls-flag"><input type="checkbox" id="blsf-' + f[0] + '"' + (on ? ' checked' : '') + '><span><b>' + blsE(blsT(f[1], f[2])) + '</b><small>' + blsE(blsT(f[3], f[4])) + '</small></span></label>'; }).join('') + '</div>'
    + '<button type="button" class="bls-submit" onclick="blsFlagsSave()">' + blsE(blsT('Save', 'सहेजें')) + '</button></div>';
}
async function blsFlagsSave() {
  var v = { at: new Date().toISOString(), by: choState.staffMobile || '' };
  BLS_FLAGS.forEach(function (f) { var el = document.getElementById('blsf-' + f[0]); v[f[0]] = !!(el && el.checked); });
  try { await db.ref('sc_facilities/' + choState.facilityCode + '/clFlags').set(v); } catch (e) { showToast(blsT('Could not save — check the connection.', 'सहेज नहीं सके — कनेक्शन देखें।'), 'err'); return; }
  choState.facility = choState.facility || {}; choState.facility.clFlags = v; try { saveCHOState(); } catch (e) {}
  var ov = document.getElementById('bls-ov'); if (ov) ov.remove(); showToast(blsT('Saved', 'सहेजा गया'));
  try { if (typeof nfRenderToday === 'function') nfRenderToday(); } catch (e) {}
}
// in-charge's Today in the baseline week (and before it starts): set the checklist up once
(function () {
  if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () { var r = o.apply(this, arguments); try {
    if (!blsSC() || blsComplete() || blsDemo() || (choState.roleId || 'CHO') !== 'CHO' || !blsLineMode()) return r;
    var host = document.getElementById('nf-today'); if (!host || host.querySelector('.bls-setup')) return r;
    var set = !!(blsFlags().at), el = document.createElement('button'); el.type = 'button'; el.className = 'nf-link-card bls-setup' + (set ? '' : ' todo'); el.setAttribute('onclick', 'blsFlagsOpen()');
    el.innerHTML = '<i class="ti ti-adjustments"></i><span>' + blsE(set ? blsT('Checklist settings', 'चेकलिस्ट सेटिंग') : blsT('Set up the checklist for your facility (1 minute)', 'अपने केंद्र के लिए चेकलिस्ट सेट करें (1 मिनट)')) + '</span><i class="ti ti-chevron-right"></i>';
    var hero = host.querySelector('.nf-hero'); if (hero && hero.parentNode) hero.parentNode.insertBefore(el, set ? hero.nextSibling : hero); else host.appendChild(el);
  } catch (e) {} return r; };
})();
