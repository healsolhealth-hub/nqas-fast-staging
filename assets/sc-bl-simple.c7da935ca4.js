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
// the answer lines of one checkpoint
function blsSlots(cp) {
  var items = cp.items || [], out = [];
  var add = function (key, k, txt, txh, meth) {
    var S = (typeof SC_BLS !== 'undefined' && SC_BLS[key]) || null, Q = SC_BLQ[key] || null;
    if (S) {
      if (Q) Q.forEach(function (q, i) { out.push({ id: k + 'q' + i, k: k, key: key, kind: 'mcq', q: q, qi: i, m: 'SI', part: 'a' }); });
      else out.push({ id: k + 'a', k: k, key: key, kind: 'tri', t: S.a ? S.a.t : txt, h: S.a ? S.a.h : txh, m: 'SI', part: 'a' });
      out.push({ id: k + 'b', k: k, key: key, kind: 'tri', t: S.b.t, h: S.b.h, m: S.b.m, part: 'b' });
    } else if (Q) Q.forEach(function (q, i) { out.push({ id: k + 'q' + i, k: k, key: key, kind: 'mcq', q: q, qi: i, m: 'SI' }); });
    else out.push({ id: String(k), k: k, key: key, kind: 'tri', t: txt, h: txh, m: (SC_BLM && SC_BLM[key]) || meth || '' });
  };
  if (!items.length) add(cp.id + '.0', 0, cp.t, cp.hi, (cp.method || cp.methods || []).join('/'));
  else items.forEach(function (it, k) { add(cp.id + '.' + (k + 1), k, it.t, it.h, (it.m || []).join('/')); });
  return out;
}
function blsAns(c, ci) { c.blAns = c.blAns || {}; return (c.blAns[ci] = c.blAns[ci] || {}); }
function blsMet(s, v) { return s.kind === 'mcq' ? v === 'o' + s.q.a : v === '1'; }
// ticks per MoV and the checkpoint score, from the answers
function blsApply(di, ci) {
  var d = getDay(di), cp = d.cps[ci], c = getCHOCard(di), A = blsAns(c, ci), S = blsSlots(cp), items = cp.items || [];
  var byK = {}; S.forEach(function (s) { (byK[s.k] = byK[s.k] || []).push(s); });
  var tickOf = function (k) { var L = byK[k] || []; if (!L.length || L.some(function (s) { return A[s.id] == null; })) return null; return L.every(function (s) { return blsMet(s, A[s.id]); }) ? 1 : 0; };
  if (items.length) { var tk = items.map(function (_, k) { return tickOf(k); }); c.cpTicks = c.cpTicks || {}; c.cpTicks[ci] = tk; c.cpScores[ci] = scMovScore(tk); }
  else { var v = tickOf(0); c.cpScores[ci] = v === null ? null : v ? 2 : 0; }
  c.updatedAt = typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString();
  try { if (typeof scCpRecord === 'function') scCpRecord(di, ci); } catch (e) {}
}
function blsMine(di) { return scMyCpIdx(di); }
function blsOpenCount(di) { var c = getCHOCard(di), d = getDay(di); return blsMine(di).reduce(function (n, ci) { var A = ((c.blAns || {})[ci]) || {}; return n + blsSlots(d.cps[ci]).filter(function (s) { return A[s.id] == null; }).length; }, 0); }
function blsSlideDone(di, ci) { var A = ((getCHOCard(di).blAns || {})[ci]) || {}; return blsSlots(getDay(di).cps[ci]).every(function (s) { return A[s.id] != null; }); }
function blsTheme(di) { try { return blsT(SC_BASELINE[di].title, SC_BASELINE[di].hi); } catch (e) { return (getDay(di) || {}).title || ''; } }

// ── the card ──
function blsRender(di) {
  var cont = document.getElementById('card-container'); if (!cont) return;
  var c = getCHOCard(di), mine = blsMine(di), hi = blsHi();
  if (_bls.di !== di) { _bls = { di: di, i: 0, review: false, want: null }; var first = mine.findIndex(function (ci) { return !blsSlideDone(di, ci); }); _bls.i = first < 0 ? 0 : first; _bls.review = first < 0 && mine.length > 0; }
  if (_bls.want != null) { var w = mine.indexOf(_bls.want); if (w >= 0) { _bls.i = w; _bls.review = false; } _bls.want = null; }
  var head = '<div class="bls-hd"><small>' + blsE(blsT('BASELINE · DAY ', 'बेसलाइन · दिन ') + (di + 1) + blsT(' OF ', ' / ') + blsBaseN()) + '</small><b>' + blsE(blsTheme(di)) + '</b></div>';
  if (c.taskDone) { cont.innerHTML = '<div class="bls">' + head + blsDoneHTML(di) + '</div>'; return; }
  if (!mine.length) { cont.innerHTML = '<div class="bls">' + head + '<div class="bls-card"><p>' + blsE(blsT('No checkpoints are assigned to your role on this day. Your colleagues answer them.', 'इस दिन आपकी भूमिका के लिए कोई चेकपॉइंट नहीं है। आपके साथी इनका उत्तर देंगे।')) + '</p></div></div>'; return; }
  if (_bls.i >= mine.length) { _bls.i = mine.length - 1; _bls.review = true; }
  var body = _bls.review ? blsReviewHTML(di, mine) : blsSlideHTML(di, mine);
  var sent = c.sentBackAt ? '<div class="bls-warn">' + blsE(blsT('Your reviewer sent this day back — please check your answers again.', 'समीक्षक ने यह दिन वापस भेजा है — कृपया अपने उत्तर फिर जाँचें।')) + (c.sentBackNote ? ' ' + blsE(c.sentBackNote) : '') + '</div>' : '';
  cont.innerHTML = '<div class="bls">' + head + sent + body + '</div>';
  var sl = cont.querySelector('.bls-slide');
  if (sl) { var x0 = null, y0 = null;
    sl.addEventListener('touchstart', function (e) { var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; }, { passive: true });
    sl.addEventListener('touchend', function (e) { if (x0 == null) return; var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) blsGo(dx < 0 ? 1 : -1); }, { passive: true }); }
}
function blsProg(n, tot) { return '<div class="bls-prog"><div class="bls-pt"><b>' + n + blsT(' of ', ' / ') + tot + '</b><span>' + blsE(blsT('checkpoints', 'चेकपॉइंट')) + '</span></div><div class="bls-pb"><i style="width:' + Math.round(n / tot * 100) + '%"></i></div></div>'; }
function blsSlideHTML(di, mine) {
  var ci = mine[_bls.i], d = getDay(di), cp = d.cps[ci], A = ((getCHOCard(di).blAns || {})[ci]) || {}, S = blsSlots(cp), hi = blsHi();
  var mob = (choState.staffMobile || '') + '';
  var rows = S.map(function (s, n) {
    var M = BLS_METH[s.m] || BLS_METH[String(s.m).split('/')[0]] || null, v = A[s.id];
    var chip = M ? '<span class="bls-m">' + M[0] + ' ' + blsE(blsT(M[1], M[2])) + '</span>' : '';
    if (s.kind === 'mcq') {
      var q = s.q, ord = blsOrder(mob + '|' + s.key + '|' + s.qi);
      return '<div class="bls-row"><div class="bls-rt">' + chip + '<b>' + blsE(hi && q.qh ? q.qh : q.q) + '</b></div><div class="bls-opts" role="radiogroup">'
        + ord.map(function (oi) { var on = v === 'o' + oi; return '<button type="button" role="radio" aria-checked="' + on + '" class="bls-opt' + (on ? ' on' : '') + '" onclick="blsSet(' + di + ',' + ci + ',\'' + s.id + '\',\'o' + oi + '\')"><span class="bls-dot"></span>' + blsE(hi && q.oh ? q.oh[oi] : q.o[oi]) + '</button>'; }).join('') + '</div></div>';
    }
    var b = function (val, lab, labh, cls) { var on = v === val; return '<button type="button" aria-pressed="' + on + '" class="bls-b ' + cls + (on ? ' on' : '') + '" onclick="blsSet(' + di + ',' + ci + ',\'' + s.id + '\',\'' + val + '\')">' + (on ? '✓ ' : '') + blsE(blsT(lab, labh)) + '</button>'; };
    return '<div class="bls-row"><div class="bls-rt">' + chip + '<span>' + blsE(hi && s.h ? s.h : s.t) + '</span></div><div class="bls-tri' + (S.length === 1 ? ' big' : '') + '">' + b('1', 'Met', 'पूरा', 'y') + b('0', 'Not met', 'पूरा नहीं', 'n') + b('?', 'Not sure', 'पता नहीं', 'q') + '</div></div>';
  }).join('');
  var nItems = (cp.items || []).length;
  return blsProg(_bls.i + 1, mine.length)
    + '<div class="bls-slide"><div class="bls-card"><span class="bls-k">' + blsE(cp.id || '') + (nItems > 1 ? ' · ' + blsE(blsT(nItems + ' THINGS TO CHECK', 'जाँचने की ' + nItems + ' बातें')) : '') + '</span><div class="bls-cpt">' + (typeof getCPText === 'function' ? getCPText(cp) : blsE(cp.t)) + '</div>' + rows + '</div></div>'
    + '<p class="bls-swipe">' + blsE(blsT('‹ swipe for the previous / next checkpoint ›', '‹ पिछले / अगले चेकपॉइंट के लिए स्वाइप करें ›')) + '</p>'
    + '<div class="bls-nav"><button type="button" class="bls-back" onclick="blsGo(-1)"' + (_bls.i === 0 ? ' disabled' : '') + '>‹ ' + blsE(blsT('Back', 'वापस')) + '</button><button type="button" class="bls-next" onclick="blsGo(1)">' + blsE(_bls.i === mine.length - 1 ? blsT('Review & submit', 'जाँचें और जमा करें') : blsT('Next', 'आगे')) + ' ›</button></div>';
}
function blsSet(di, ci, id, val) {
  if (!scDayUnlocked(di)) return; var c = getCHOCard(di); if (c.taskDone) return;
  var A = blsAns(c, ci); A[id] = val;
  blsApply(di, ci); saveCHOState();
  var done = blsSlideDone(di, ci); blsRender(di);
  if (done && _bls.di === di && !_bls.review) { var mine = blsMine(di); if (mine[_bls.i] === ci) setTimeout(function () { if (_bls.di === di && !_bls.review && blsMine(di)[_bls.i] === ci && blsSlideDone(di, ci)) blsGo(1); }, 450); }
}
function blsGo(step) {
  var di = _bls.di; if (di == null) return; var mine = blsMine(di);
  if (_bls.review) { if (step < 0) { _bls.review = false; _bls.i = mine.length - 1; } }
  else { var n = _bls.i + step; if (n < 0) return; if (n >= mine.length) { _bls.review = true; } else _bls.i = n; }
  blsRender(di); try { var cc = document.getElementById('card-container'); if (cc && cc.scrollIntoView) cc.scrollIntoView({ block: 'start' }); } catch (e) {}
}
function blsJump(i) { _bls.review = false; _bls.i = i; blsRender(_bls.di); }
function blsReviewHTML(di, mine) {
  var c = getCHOCard(di), d = getDay(di), hi = blsHi(), met = 0, not = 0, ns = 0, qa = 0, open = 0;
  var list = mine.map(function (ci, i) {
    var cp = d.cps[ci], A = ((c.blAns || {})[ci]) || {}, S = blsSlots(cp), parts = [];
    S.forEach(function (s) { var v = A[s.id]; if (v == null) { open++; return; } if (s.kind === 'mcq') { qa++; return; } if (v === '1') met++; else if (v === '0') not++; else ns++; });
    var a = S.filter(function (s) { return A[s.id] != null; }).length, st;
    if (a < S.length) st = '<span class="bls-pill o">' + blsE(blsT((S.length - a) + ' to answer', (S.length - a) + ' बाकी')) + '</span>';
    else { var M = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '1'; }).length, N = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '0'; }).length, Q = S.filter(function (s) { return s.kind === 'tri' && A[s.id] === '?'; }).length, Qa = S.filter(function (s) { return s.kind === 'mcq'; }).length;
      st = [M ? '<span class="bls-pill y">' + M + ' ' + blsE(blsT('Met', 'पूरा')) + '</span>' : '', N ? '<span class="bls-pill n">' + N + ' ' + blsE(blsT('Not met', 'पूरा नहीं')) + '</span>' : '', Q ? '<span class="bls-pill q">' + Q + ' ' + blsE(blsT('Not sure', 'पता नहीं')) + '</span>' : '', Qa ? '<span class="bls-pill w">' + Qa + ' ' + blsE(blsT('answered', 'उत्तर दिया')) + '</span>' : ''].join(''); }
    return '<button type="button" class="bls-li" onclick="blsJump(' + i + ')"><span class="bls-n">' + (i + 1) + '</span><span class="bls-lt">' + (typeof getCPText === 'function' ? getCPText(cp) : blsE(cp.t)) + '</span><span class="bls-ls">' + st + '</span></button>';
  }).join('');
  var tiles = '<div class="bls-tiles"><div class="y"><b>' + met + '</b><small>' + blsE(blsT('Met', 'पूरा')) + '</small></div><div class="n"><b>' + not + '</b><small>' + blsE(blsT('Not met', 'पूरा नहीं')) + '</small></div><div class="q"><b>' + ns + '</b><small>' + blsE(blsT('Not sure', 'पता नहीं')) + '</small></div>' + (qa ? '<div class="w"><b>' + qa + '</b><small>' + blsE(blsT('questions', 'प्रश्न')) + '</small></div>' : '') + '</div>';
  return '<div class="bls-rev"><b class="bls-rh">' + blsE(blsT('Review & submit', 'जाँचें और जमा करें')) + '</b>' + tiles + '<div class="bls-card bls-list">' + list + '</div>'
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
  var c = getCHOCard(di); if (c.taskDone) { c.doneAt = c.doneAt || new Date().toISOString(); saveCHOState(); _bls.di = null; renderCard(di); try { if (typeof nfRenderToday === 'function') nfRenderToday(); } catch (e) {} }
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
      var total = mine.reduce(function (n, ci) { return n + blsSlots(getDay(today).cps[ci]).length; }, 0), mins = Math.max(5, Math.round(mine.length * 0.9));
      var cta = c.taskDone ? '<div class="nf-cta bls-ok">✓ ' + blsE(blsT('Baseline done for today', 'आज की बेसलाइन पूरी')) + '</div>'
        : !mine.length ? '<div class="nf-cta bls-ok">' + blsE(blsT('Nothing for your role today', 'आज आपकी भूमिका के लिए कुछ नहीं')) + '</div>'
        : '<button type="button" class="nf-cta" onclick="nfOpenToday()">' + blsE(open < total ? blsT('Continue', 'जारी रखें') : blsT('Start', 'शुरू करें')) + ' <i class="ti ti-chevron-right"></i></button>';
      var hero = '<div class="nf-hero"><div class="nf-hero-k">' + blsE(blsT('BASELINE · DAY ' + (today + 1) + ' OF ' + blsBaseN(), 'बेसलाइन · दिन ' + (today + 1) + ' / ' + blsBaseN())) + '</div><div class="nf-hero-t">' + blsE(blsTheme(today)) + '</div>'
        + (mine.length && !c.taskDone ? '<div class="nf-hero-s">' + blsE(blsT(mine.length + ' checkpoints · about ' + mins + ' minutes' + (open < total ? ' · ' + (total - open) + ' of ' + total + ' answered' : ''), mine.length + ' चेकपॉइंट · लगभग ' + mins + ' मिनट' + (open < total ? ' · ' + total + ' में से ' + (total - open) + ' उत्तर' : ''))) + '</div>' : '') + cta + '</div>';
      var how = '<div class="nf-card bls-how"><b>' + blsE(blsT('How the baseline works', 'बेसलाइन कैसे होती है')) + '</b><span>' + blsE(blsT('Look at each checkpoint in your facility today and answer honestly: Met, Not met or Not sure. Some lines are a short question. There are no right answers to aim for — the baseline shows where your team starts.', 'आज अपने केंद्र में हर चेकपॉइंट देखें और ईमानदारी से उत्तर दें: पूरा, पूरा नहीं या पता नहीं। कुछ पंक्तियाँ छोटा प्रश्न हैं। लक्ष्य कोई सही उत्तर नहीं — बेसलाइन बताती है कि आपकी टीम कहाँ से शुरू कर रही है।')) + '</span></div>';
      // keep everything else on Today (location, All my facilities, outreach…); swap the hero, drop the scored to-do list and missions
      host.querySelectorAll('.nf-sec').forEach(function (sec) { var nx = sec.nextElementSibling; if (nx && (nx.classList.contains('nf-list') || nx.classList.contains('nf-q'))) { nx.remove(); sec.remove(); } });
      var oldHero = host.querySelector('.nf-hero'), box = document.createElement('div');
      box.innerHTML = hero + '<div class="nf-card bls-wk"><b>' + blsE(blsT('Baseline week', 'बेसलाइन सप्ताह')) + '</b>' + blsWeekHTML() + '</div>' + how;
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
      el.innerHTML = '<i class="ti ti-clipboard-check"></i><span>' + blsE(blsT('Baseline report · ' + G.length + ' understanding gaps', 'बेसलाइन रिपोर्ट · ' + G.length + ' समझ की कमियाँ')) + '</span><i class="ti ti-chevron-right"></i>';
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
      box.innerHTML = '🧭 <b>' + blsE(blsT('Your team saw this differently in the baseline', 'बेसलाइन में आपकी टीम की राय इस पर अलग थी')) + '</b><br>' + blsE(mine.map(blsReasonText).join(' · ')) + (x ? '<div class="bls-wx">' + blsE(x) + '</div>' : '');
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
