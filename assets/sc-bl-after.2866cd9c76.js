// ══════════════════════════════════════════════════════════════
// BASELINE — WAITING, AND AFTER (27 Nov 2026; HealSol design canvas pages "Baseline not finished — Today & Cards" and
// "Baseline result & Fixed card", approved 27 Nov)
//  1. Today while the baseline is not finished and the clock is paused (Day 8 on, no blDoneOn): one job — finish the
//     baseline. One card with a Continue button, the seven baseline days (each opens its card), the team's days
//     (in-charge). No scores, no "behind", no old to-do list, no action tabs or team mission.
//  2. Cards on a locked day: a calm note and the seven baseline days, each one tappable.
//  3. Facility profile → "Facility set-up" (in-charge): the checklist, population and location — moved off Today.
// ══════════════════════════════════════════════════════════════
function blaHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function blaT(en, hi) { return blaHi() && hi ? hi : en; }
function blaE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function blaFirst(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
function blaWaiting() { try { var g = typeof bgScState === 'function' ? bgScState() : null; return g && g.k === 'bl' ? g : null; } catch (e) { return null; } }
function blaIC() { return (typeof choState !== 'undefined' && (choState.roleId || 'CHO')) === 'CHO'; }

// my own baseline days: lines to answer, answered, submitted
function blaMyDays() {
  var N = typeof blsBaseN === 'function' ? blsBaseN() : 7, out = [];
  for (var d = 0; d < N; d++) {
    var c = getCHOCard(d), mine = [], tot = 0, open = 0;
    try { mine = blsMine(d); tot = mine.length; open = mine.filter(function (ci) { return !blsSlideDone(d, ci); }).length; } catch (e) {}   // checkpoints, as the card counts them
    out.push({ d: d, tot: tot, ans: tot - open, done: !!(c && c.taskDone), title: typeof blsTheme === 'function' ? blsTheme(d) : '' });
  }
  return out;
}
function blaMyState(x) { return x.done ? 's' : !x.tot ? 'x' : x.ans > 0 ? 'p' : 'n'; }
function blaMyLine(x) {
  if (x.done) return blaT('Submitted ✓', 'जमा ✓');
  if (!x.tot) return blaT('Nothing for you this day', 'इस दिन आपके लिए कुछ नहीं');
  if (x.ans > 0) return blaT(x.ans + ' of ' + x.tot + ' answered', x.tot + ' में से ' + x.ans + ' उत्तर');
  return blaT('Not started · ' + x.tot + ' to answer', 'शुरू नहीं · ' + x.tot + ' उत्तर देने हैं');
}
function blaNext(D) { for (var i = 0; i < D.length; i++) if (!D[i].done && D[i].tot) return D[i]; return null; }
function blaOpenDay(d) {
  try { var onCards = typeof _nfTab !== 'undefined' && _nfTab === 'cards' && choState.view === 'cards'; if (typeof nfTab === 'function' && !onCards) nfTab('cards'); } catch (e) {}   // the shown tab is _nfTab (choState.view can say cards behind Today)
  try { selectDay(d + 1); } catch (e) {}
  try { window.scrollTo(0, 0); } catch (e) {}
}
// who is still answering a day (from the gate), as "Kamla (ANM)"
function blaWho(g, d) {
  var x = (g && g.open || []).filter(function (o) { return o.n === d + 1; })[0]; if (!x) return null;
  var S = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.staff) || (choState.facility || {}).staff || {}, me = String(choState.staffName || '');
  var byName = {}; Object.keys(S).forEach(function (m) { if (S[m] && S[m].name) byName[S[m].name] = S[m].role || ''; });
  return (x.who || []).filter(function (n) { return n !== me; }).map(function (n) { return blaFirst(n) + (byName[n] ? ' (' + byName[n] + ')' : ''); });
}
function blaDayRow(x, g, withWho) {
  var st = blaMyState(x), act = x.done ? '' : !x.tot ? '' : x.ans > 0 ? blaT('Continue', 'जारी रखें') : blaT('Open', 'खोलें');
  var whoTxt = '';
  if (withWho) { var who = blaWho(g, x.d); whoTxt = who == null ? blaT('Everyone has submitted ✓', 'सबने जमा किया ✓') : who.length ? blaT('Still answering: ', 'अभी उत्तर दे रहे: ') + who.join(' · ') : ''; }
  return '<button type="button" class="bla-day ' + st + '" onclick="blaOpenDay(' + x.d + ')"><span class="bla-n">' + (x.d + 1) + '</span><span class="bla-dt"><b>' + blaE(x.title) + '</b>'
    + '<small class="bla-me">' + blaE(blaT('You: ', 'आप: ') + blaMyLine(x)) + '</small>' + (whoTxt ? '<small class="bla-who">' + blaE(whoTxt) + '</small>' : '') + '</span>'
    + (act ? '<span class="bla-go">' + blaE(act) + ' ›</span>' : '<span class="bla-chev">›</span>') + '</button>';
}
// the team's days (in-charge): dots per baseline day
function blaTeamHTML() {
  var F = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode && _nfFac.progress) ? _nfFac : null; if (!F) return '';
  var S = F.staff || {}, me = String(choState.staffMobile || ''), present = scRolesFromRoster(S), N = blsBaseN(), rows = '';
  Object.keys(S).forEach(function (m) { var p = S[m] || {}; if (m === me || p.disabled) return; var role = p.role || '', dots = '', sub = 0, need = 0, cur = null;
    for (var d = 0; d < N; d++) { var day = getDay(d), has = (day.cps || []).some(function (cp) { return blsSlots(cp).some(function (s) { return blsOwnerOK(s.own, role, present); }); });
      var rec = ((F.progress || {})[m] || {})['day_' + d] || null, st = !has ? 'x' : rec && rec.taskDone ? 's' : rec && rec.blAns && Object.keys(rec.blAns).length ? 'p' : 'n';
      if (has) need++; if (st === 's') sub++; if (st === 'p' && cur == null) cur = d; dots += '<i class="' + st + '"></i>'; }
    if (!need) return;
    var meta = sub === need ? blaT('All ' + need + ' days submitted ✓', 'सभी ' + need + ' दिन जमा ✓') : sub || cur != null ? blaT(sub + ' of ' + need + ' submitted' + (cur != null ? ' · on Day ' + (cur + 1) : ''), need + ' में से ' + sub + ' जमा' + (cur != null ? ' · दिन ' + (cur + 1) + ' पर' : '')) : blaT('Not started yet', 'अभी शुरू नहीं');
    rows += '<div class="bla-tm"><span class="bla-av">' + blaE(blaFirst(p.name || role).charAt(0).toUpperCase()) + '</span><span class="bla-tt"><b>' + blaE((p.name || role) + ' · ' + role) + '</b><small>' + blaE(meta) + '</small></span><span class="bla-dots">' + dots + '</span></div>'; });
  return rows ? '<div class="nf-card bla-card"><span class="bla-k">' + blaE(blaT('YOUR TEAM\'S BASELINE', 'आपकी टीम की बेसलाइन')) + '</span>' + rows + '</div>' : '';
}
function blaTodayHTML(g) {
  var D = blaMyDays(), nx = blaNext(D), sub = D.filter(function (x) { return x.done; }).length, need = D.filter(function (x) { return x.tot; }).length;
  var bar = D.map(function (x) { return '<i class="' + blaMyState(x) + '"></i>'; }).join('');
  var line = nx ? blaT('You: ' + sub + ' of ' + need + ' days submitted · Day ' + (nx.d + 1) + (nx.ans ? ' is ' + nx.ans + ' of ' + nx.tot + ' answered' : ' not started'), 'आप: ' + need + ' में से ' + sub + ' दिन जमा · दिन ' + (nx.d + 1) + (nx.ans ? ' में ' + nx.tot + ' में से ' + nx.ans + ' उत्तर' : ' शुरू नहीं'))
    : blaT('You have submitted all your baseline days ✓ — waiting for the rest of the team.', 'आपने सभी बेसलाइन दिन जमा कर दिए ✓ — बाकी टीम की प्रतीक्षा।');
  var cta = nx ? '<button type="button" class="nf-cta" onclick="blaOpenDay(' + nx.d + ')">' + blaE(nx.ans ? blaT('Continue Day ' + (nx.d + 1) + ' · ' + nx.ans + ' of ' + nx.tot, 'दिन ' + (nx.d + 1) + ' जारी रखें · ' + nx.tot + ' में से ' + nx.ans) : blaT('Start Day ' + (nx.d + 1), 'दिन ' + (nx.d + 1) + ' शुरू करें')) + ' <i class="ti ti-chevron-right"></i></button>' : '';
  return '<div class="nf-hero bla-hero"><div class="nf-hero-k">' + blaE(blaT('BASELINE · YOUR CLOCK IS PAUSED', 'बेसलाइन · आपकी घड़ी रुकी है')) + '</div><div class="nf-hero-t">' + blaE(blaT('Finish your baseline — implementation starts when all ' + D.length + ' days are in', 'बेसलाइन पूरी करें — सभी ' + D.length + ' दिन जमा होने पर कार्यान्वयन शुरू होगा')) + '</div>'
    + '<div class="bla-bar">' + bar + '</div><div class="nf-hero-s">' + blaE(line) + '</div>' + cta + '</div>'
    + '<div class="nf-card bla-card"><span class="bla-k">' + blaE(blaT('YOUR BASELINE DAYS · TAP TO OPEN', 'आपके बेसलाइन दिन · खोलने के लिए टैप करें')) + '</span>' + D.map(function (x) { return blaDayRow(x, g, false); }).join('') + '</div>'
    + (blaIC() ? blaTeamHTML() : '');
}
(function () {
  if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () { var r = o.apply(this, arguments);
    try {
      var host = document.getElementById('nf-today'), g = blaWaiting(); if (!host || !g || (typeof wsIsPre === 'function' && wsIsPre())) return r;
      if (!blsLineMode()) return r;
      var park = document.getElementById('nftt-park');
      [].slice.call(host.children).forEach(function (el) { if (el.classList.contains('nf-top')) return; if (el.id === 'nf-tt' && park) { [].slice.call(el.children).forEach(function (k) { park.appendChild(k); }); } el.remove(); });
      host.insertAdjacentHTML('beforeend', blaTodayHTML(g));
      if (!(typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode && _nfFac.progress) && typeof nfLoadFacility === 'function' && !blaTodayHTML._asked) { blaTodayHTML._asked = true; nfLoadFacility().then(function () { blaTodayHTML._asked = false; nfRenderToday(); }); }
    } catch (e) { console.warn('[BLA] today', e); }
    return r; };
})();
// nflm (staff fixes to check) paints after Today — not while the baseline is waiting
(function () { if (typeof nfLmPaint !== 'function') return; var o = nfLmPaint; nfLmPaint = function () { if (blaWaiting()) return; return o.apply(this, arguments); }; })();

// ── 2. Cards on a locked day ──
(function () {
  if (typeof bgBlHTML !== 'function') return; var o = bgBlHTML;
  bgBlHTML = function (g) { try { if (g && g.open && typeof blsMine === 'function') {
    var D = blaMyDays();
    return '<div class="bla-wrap"><div class="bla-note"><span class="bla-k">' + blaE(blaT('DAY ' + (scb1TodayIdx() + 1) + ' · OPENS AFTER THE BASELINE', 'दिन ' + (scb1TodayIdx() + 1) + ' · बेसलाइन के बाद खुलेगा')) + '</span><b>' + blaE(blaT('Finish your baseline first', 'पहले अपनी बेसलाइन पूरी करें')) + '</b><small>' + blaE(blaT('Implementation days open when every baseline day is submitted. Your clock is paused — no implementation day is lost.', 'हर बेसलाइन दिन जमा होने पर कार्यान्वयन के दिन खुलेंगे। आपकी घड़ी रुकी है — कोई दिन नहीं छूटेगा।')) + '</small></div>'
      + '<div class="nf-card bla-card"><span class="bla-k">' + blaE(blaT('BASELINE DAYS · TAP TO OPEN', 'बेसलाइन दिन · खोलने के लिए टैप करें')) + '</span>' + D.map(function (x) { return blaDayRow(x, g, true); }).join('') + '</div></div>'; } } catch (e) { console.warn('[BLA] cards', e); }
    return o.apply(this, arguments); };
  if (typeof bgScLabel === 'function') { var l = bgScLabel; bgScLabel = function (g) { try { if (g && g.k === 'bl' && g.open) { var N = blsBaseN(), inn = N - g.open.length; return blaT('Baseline · ' + inn + ' of ' + N + ' days in', 'बेसलाइन · ' + N + ' में से ' + inn + ' दिन पूरे'); } } catch (e) {} return l.apply(this, arguments); }; }
})();

// ── 3. Facility profile → Facility set-up (in-charge); off Today ──
function blaSetupHTML(M) {
  if (!M || !M.ic) return '';
  var sc = !M.dept && (M.t || 'sc') === 'sc' && typeof blsFlagsOpen === 'function' && typeof blsLineMode === 'function' && blsLineMode() && /^nqas_12[AB]$/.test((typeof choState !== 'undefined' && choState.progId) || '');
  var f = M.f || {}, pop = f.population && f.population.n, geo = typeof rgGeoLine === 'function' ? rgGeoLine(f) : '', cl = sc && !!(blsFlags().at);
  var row = function (ic, t, st, ok, fn) { return '<button type="button" class="bla-set" onclick="' + fn + '"><i class="ti ' + ic + '"></i><span><b>' + blaE(t) + '</b><small class="' + (ok ? 'ok' : 'no') + '">' + blaE(st) + '</small></span><i class="ti ti-chevron-right"></i></button>'; };
  return '<div class="fpo-card bla-setup"><h3>' + blaE(blaT('Facility set-up', 'केंद्र सेट-अप')) + '</h3>'
    + (sc ? row('ti-adjustments', blaT('Checklist for your facility', 'आपके केंद्र की चेकलिस्ट'), cl ? blaT('Set ✓ · tap to change', 'सेट ✓ · बदलने के लिए टैप करें') : blaT('Not set · 1 minute — it decides which lines your team answers', 'सेट नहीं · 1 मिनट — इससे तय होता है कि टीम कौन-सी पंक्तियाँ भरेगी'), cl, 'blsFlagsOpen()') : '')
    + row('ti-users', blaT('Population', 'जनसंख्या'), pop ? blaT(Number(pop).toLocaleString('en-IN') + ' people · tap to change', Number(pop).toLocaleString('en-IN') + ' लोग · बदलने के लिए टैप करें') : blaT('Not added · as per HMIS / ASHA survey', 'नहीं जोड़ी · HMIS / आशा सर्वे के अनुसार'), !!pop, 'fpoPopEdit()')
    + (typeof rgGeoOpen === 'function' ? row('ti-map', blaT('Location', 'स्थान'), geo ? blaT('Added ✓ · ' + geo, 'दर्ज ✓ · ' + geo) : blaT('Not set · stand at the facility and tap', 'नहीं · केंद्र पर खड़े होकर टैप करें'), !!geo, 'rgGeoOpen()') : '') + '</div>';
}
(function () {
  if (typeof fpoSteps === 'function') { var fs = fpoSteps; fpoSteps = function (M, day) { try { if (!M.dept && blaWaiting()) day = Math.min(day || 0, blsBaseN()); } catch (e) {} return fs.call(this, M, day); }; }   // still on the baseline while it waits
  if (typeof fpoAboutHTML === 'function') { var a = fpoAboutHTML; fpoAboutHTML = function (M) { var h = a.apply(this, arguments); try { h += blaSetupHTML(M); } catch (e) { console.warn('[BLA] setup', e); } return h; }; }
  // after saving the checklist or the location from the profile, redraw it
  ['blsFlagsSave', 'rgGeoSave', 'rgGeoUse'].forEach(function (fn) { var o = window[fn]; if (typeof o !== 'function') return;
    window[fn] = function () { var r = o.apply(this, arguments); var redraw = function () { try { if (document.getElementById('fpo-ov') && typeof fpoRender === 'function') fpoRender(); } catch (e) {} };
      if (r && typeof r.then === 'function') r.then(redraw, redraw); else setTimeout(redraw, 0); return r; }; });
  // Today: no checklist, population or location prompts for SC staff — they live on the Facility profile
  if (typeof nfRenderToday === 'function') { var t = nfRenderToday; nfRenderToday = function () { var r = t.apply(this, arguments);
    try { var host = document.getElementById('nf-today'); if (host) host.querySelectorAll('.bls-setup, #rg-prompt').forEach(function (el) { el.remove(); });
      var gs = document.getElementById('nfg-staff'); if (gs) gs.querySelectorAll('.nfg-banner').forEach(function (b) { if (/population|जनसंख्या/i.test(b.textContent) && b.querySelector('button')) b.remove(); }); if (gs && !gs.children.length) gs.remove(); } catch (e) {}
    return r; }; }
})();

// ══ 4. A baseline day after the baseline: a result you read (score · checkpoints by staff · gaps to close) ══
// Read-only. Checks the Quality Champion had not made by Day 8 show as "Not checked". Everyone sees the whole facility,
// arranged by staff (you first). Gaps to close come from the same plan as the implementation days.
var _blr = { di: null, tab: 'cp', open: {}, det: null };
function blrOn(di) { try { return typeof appMode !== 'undefined' && appMode === 'cho' && blsSC() && blsLineMode() && blsComplete() && di >= 0 && di < blsBaseN() && typeof imfLines === 'function'; } catch (e) { return false; } }
function blrStd(cp) { var m = /ME\s*([A-Z]\d+)/.exec(cp.me || ''); return m ? m[1] : (cp.aoc || ''); }
function blrStdTitle(code) { var t = ''; try { if (typeof scRegTitle === 'function') t = scRegTitle('std', code) || ''; } catch (e) {} return code + (t ? ' · ' + t : blaT(' · Standard ' + code, ' · मानक ' + code)); }
function blrChip(sc) { return sc === 2 ? '<span class="blr-c f">' + blaE(blaT('Full', 'पूरा')) + '</span>' : sc === 1 ? '<span class="blr-c h">' + blaE(blaT('Half', 'आधा')) + '</span>' : sc === 0 ? '<span class="blr-c z">' + blaE(blaT('Zero', 'शून्य')) + '</span>' : '<span class="blr-c n">—</span>'; }
function blrPct(scores) { var L = scores.filter(function (x) { return x != null; }); return L.length ? Math.round(L.reduce(function (a, b) { return a + b; }, 0) / (2 * L.length) * 100) : null; }
// the Quality Champion's checks on one checkpoint, from every record of that baseline day
function blrQC(ctx, di, ci, mobs) {
  var out = { ok: 0, bad: 0, notes: [] };
  (mobs || imfMobs(ctx)).forEach(function (m) { var r = imfRec(ctx, m, di), R = r && r.blRev && cOf(r.blRev, ci); if (!R) return;
    Object.keys(R).forEach(function (k) { var e = R[k] || {}; if (e.v == null && !e.r) return; if (!e.r || e.r === 'ok' || e.r === 'inplace') out.ok++; else { out.bad++; out.notes.push(e); } }); });
  out.k = out.bad ? 'd' : out.ok ? 'm' : 'n'; return out;
}
function blrQCLabel(k) { return k === 'm' ? '<b class="blr-q m">✓ ' + blaE(blaT('Matched', 'मेल खाया')) + '</b>' : k === 'd' ? '<b class="blr-q d">✗ ' + blaE(blaT('Didn\'t match', 'मेल नहीं खाया')) + '</b>' : '<b class="blr-q n">' + blaE(blaT('Not checked', 'जाँचा नहीं')) + '</b>'; }
function blrReason(r) { if (typeof NF_BL_WHY !== 'undefined' && NF_BL_WHY[r]) return NF_BL_WHY[r]; return r === 'notseen' ? blaT('MoV not seen', 'प्रमाण नहीं दिखा') : r === 'changed' ? blaT('answer changed', 'उत्तर बदला') : r === 'differs' ? blaT('what was seen differs', 'जो देखा वह अलग') : String(r || ''); }
// where each person's gaps are planned: mob|cpId → {day, st}
function blrPlan(ctx) {
  var key = ctx.code + '|' + Object.keys(ctx.P || {}).length + '|' + (_blr.planAt || 0); if (_blr.plan && _blr.planKey === key) return _blr.plan;
  var P = {}, today = scb1TodayIdx();
  imfMobs(ctx).forEach(function (m) { var role = imfRoleOf(ctx, m);
    for (var ws = 7; ws <= 42; ws += 7) { var c2 = Object.assign({}, ctx, { mine: m === ctx.me }); var items = []; try { items = imfItems(c2, ws, m, role); } catch (e) {}
      items.forEach(function (it) { P[m + '|' + it.cp.id] = { day: ws + it.k, st: it.st, vf: it.vf, past: ws + it.k <= today }; }); } });
  _blr.plan = P; _blr.planKey = key; return P;
}
function blrQText(s) { var q = blsHi() && s.h ? s.h : s.t; if (!q && s.q) q = (blsHi() && s.q.qh) || s.q.q || ''; return String(q || ''); }
function blrGapText(s, x) {   // what is not in place: the missing items of a list, otherwise the question
  try { if (s.kind === 'list' && x && x.raw != null && String(x.raw).length === (s.items || []).length) { var t = imfAnsText(s, x.raw); if (t && !/^All in place|^सब मौजूद/.test(t)) return t.replace(/^Not in place: |^मौजूद नहीं: /, ''); } } catch (e) {}
  return blrQText(s).trim(); }
function blrStLabel(p) {
  if (!p) return ['n', blaT('Not planned', 'तय नहीं')];
  if (p.st === 'fixed' && p.vf && p.vf.ok) return ['c', blaT('Checked ✓', 'जाँचा ✓')];
  if (p.st === 'fixed') return ['f', blaT('Fixed', 'सुधरा')];
  if (p.st === 'doubt') return ['b', blaT('Sent back', 'वापस भेजा')];
  if (p.st === 'partial') return ['o', blaT('Not all in place', 'सब ठीक नहीं')];
  return ['o', blaT('To do', 'करना है')];
}
// everything about one baseline day, computed once per render
function blrData(di) {
  var ctx = imfCtxMine(), d = getDay(di), people = {}, rows = [];
  var mobs = imfMobs(ctx).filter(function (m) { var s = ctx.staff[m]; return !(s && s.disabled); });
  (d.cps || []).forEach(function (cp, ci) {
    var S = blsSlots(cp, ctx.flags); if (!S.length) return;
    var L = imfLines(ctx, cp), fac = imfScoreOf(S, function (s) { return L.st[s.id].base; });
    if (S.every(function (s) { return L.st[s.id].base === null; })) fac = null;
    var qc = blrQC(ctx, di, ci, mobs), row = { cp: cp, ci: ci, S: S, L: L, sc: fac, qc: qc, std: blrStd(cp), by: {} };
    mobs.forEach(function (m) { var role = imfRoleOf(ctx, m), own = S.filter(function (s) { return blsOwnerOK(s.own, role, ctx.present); }); if (!own.length) return;
      var r = imfRec(ctx, m, di), A = (r && cOf(r.blAns, ci)) || null, sc;
      if (A) { sc = imfScoreOf(own, function (s) { return blsVal(s, A[s.id]); }); if (own.every(function (s) { return blsVal(s, A[s.id]) === null; })) sc = null; }
      else { sc = r && r.taskDone ? scNormScore((r.cpScores || [])[ci]) : null; }
      var gap = own.filter(function (s) { var b = L.st[s.id].base; return b === null || b < 0.9999; });
      row.by[m] = { own: own, sc: sc, gap: gap, qc: blrQC(ctx, di, ci, [m]) };
      var P = people[m] || (people[m] = { m: m, role: role, name: (ctx.staff[m] || {}).name || imfNameOf(ctx, m), rows: [] }); P.rows.push(row); });
    rows.push(row);
  });
  var order = { CHO: 0, ANM: 1, ASHA: 2, MPW: 3 };
  var list = Object.keys(people).map(function (m) { return people[m]; }).sort(function (a, b) { return (b.m === ctx.me) - (a.m === ctx.me) || ((order[a.role] == null ? 9 : order[a.role]) - (order[b.role] == null ? 9 : order[b.role])) || String(a.name).localeCompare(b.name); });
  return { ctx: ctx, rows: rows, people: list, plan: blrPlan(ctx) };
}
function blrHead(di) {
  return '<div class="bls-hd"><small>' + blaE(blaT('BASELINE · DAY ' + (di + 1) + ' · RESULT', 'बेसलाइन · दिन ' + (di + 1) + ' · परिणाम')) + '</small><b>' + blaE(typeof blsTheme === 'function' ? blsTheme(di) : '') + '</b></div>';
}
function blrRender(di) {
  var cont = document.getElementById('card-container'); if (!cont) return; window._scLastDi = di;
  if (_blr.di !== di) { _blr = { di: di, tab: _blr.tab || 'cp', open: {}, det: null }; }
  if (_blr.det == null && !_blr.keepPlan) _blr.plan = null; _blr.keepPlan = false;
  var ctx = imfCtxMine();
  if (!ctx.loaded) { cont.innerHTML = '<div class="bls blr">' + blrHead(di) + '<div class="nf-card"><span class="nf-skel" style="width:60%;height:16px"></span><span class="nf-skel" style="width:90%;height:12px;margin-top:10px"></span></div></div>';
    if (typeof nfLoadFacility === 'function') nfLoadFacility().then(function () { if (_blr.di === di) blrRender(di); }); return; }
  var D = blrData(di), me = ctx.me;
  if (_blr.det != null) { var row = D.rows.filter(function (r) { return r.ci === _blr.det; })[0]; if (row) { cont.innerHTML = '<div class="bls blr">' + blrHead(di) + blrDetailHTML(D, row) + '</div>'; return; } _blr.det = null; }
  var chk = D.rows.filter(function (r) { return r.sc != null; }), full = chk.filter(function (r) { return r.sc === 2; }).length, pct = blrPct(chk.map(function (r) { return r.sc; }));
  var qm = D.rows.filter(function (r) { return r.qc.k === 'm'; }).length, qd = D.rows.filter(function (r) { return r.qc.k === 'd'; }).length, qn = D.rows.length - qm - qd;
  var gapsN = chk.length - full;
  var h = '<div class="bls blr">' + blrHead(di)
    + '<div class="blr-score"><div class="blr-big"><b>' + (pct == null ? '—' : pct + '%') + '</b><span>' + blaE(blaT('Day ' + (di + 1) + ' score', 'दिन ' + (di + 1) + ' का स्कोर')) + '</span></div>'
    + '<div class="blr-pills"><span>' + blaE(blaT(chk.length + ' checked', chk.length + ' जाँचे')) + '</span><span>' + blaE(blaT(full + ' full', full + ' पूरे')) + '</span><span>' + blaE(blaT(gapsN + ' gaps', gapsN + ' कमियाँ')) + '</span></div>'
    + '<small>' + blaE(blaT('Quality Champion: ' + qm + ' matched · ' + qd + ' didn\'t match · ' + qn + ' not checked', 'क्वालिटी चैंपियन: ' + qm + ' मेल · ' + qd + ' मेल नहीं · ' + qn + ' जाँचे नहीं')) + '</small></div>'
    + '<div class="blr-tabs" role="tablist"><button type="button" role="tab" class="' + (_blr.tab === 'cp' ? 'on' : '') + '" onclick="blrTab(\'cp\')">' + blaE(blaT('Checkpoints · ' + D.rows.length, 'चेकपॉइंट · ' + D.rows.length)) + '</button><button type="button" role="tab" class="' + (_blr.tab === 'gap' ? 'on' : '') + '" onclick="blrTab(\'gap\')">' + blaE(blaT('Gaps to close · ' + gapsN, 'दूर करनी कमियाँ · ' + gapsN)) + '</button></div>';
  D.people.forEach(function (P, i) {
    var open = _blr.open[P.m] != null ? _blr.open[P.m] : i === 0, mine = P.m === me;
    var sc = P.rows.map(function (r) { return r.by[P.m].sc; }), done = sc.filter(function (x) { return x != null; }), f = done.filter(function (x) { return x === 2; }).length, pp = blrPct(sc);
    var gp = P.rows.filter(function (r) { return r.by[P.m].gap.length; });
    var meta;
    if (_blr.tab === 'cp') meta = blaT(P.rows.length + ' checkpoints · ' + f + ' full · ' + (done.length - f) + ' gaps', P.rows.length + ' चेकपॉइंट · ' + f + ' पूरे · ' + (done.length - f) + ' कमियाँ');
    else { var cnt = { f: 0, c: 0, o: 0, b: 0, n: 0 }; gp.forEach(function (r) { cnt[blrStLabel(D.plan[P.m + '|' + r.cp.id])[0]]++; });
      meta = blaT(gp.length + ' gaps · ' + (cnt.f + cnt.c) + ' fixed' + (cnt.c ? ' · ' + cnt.c + ' checked' : '') + (cnt.b ? ' · ' + cnt.b + ' sent back' : '') + ' · ' + (cnt.o + cnt.n) + ' to do', gp.length + ' कमियाँ · ' + (cnt.f + cnt.c) + ' सुधरीं · ' + (cnt.o + cnt.n) + ' बाकी'); }
    h += '<div class="nf-card blr-p"><button type="button" class="blr-ph" onclick="blrToggle(\'' + P.m + '\',' + (open ? 0 : 1) + ')" aria-expanded="' + open + '"><span class="bla-av">' + blaE(blaFirst(P.name).charAt(0).toUpperCase()) + '</span><span class="bla-tt"><b>' + blaE(P.name + ' · ' + P.role) + (mine ? ' <i class="blr-you">' + blaE(blaT('You', 'आप')) + '</i>' : '') + '</b><small>' + blaE(meta) + '</small></span>' + (_blr.tab === 'cp' && pp != null ? '<span class="blr-pp">' + pp + '%</span>' : '') + '<span class="blr-ar">' + (open ? '⌃' : '⌄') + '</span></button>';
    if (open) { var list = _blr.tab === 'cp' ? P.rows : gp, last = null;
      if (!list.length) h += '<p class="bls-dim">' + blaE(_blr.tab === 'cp' ? blaT('Nothing for this person on this day.', 'इस दिन इनके लिए कुछ नहीं।') : blaT('No gaps — everything was in place.', 'कोई कमी नहीं — सब ठीक था।')) + '</p>';
      list.forEach(function (r) { if (r.std !== last) { last = r.std; h += '<span class="blr-std">' + blaE(blrStdTitle(r.std)) + '</span>'; }
        var b = r.by[P.m];
        if (_blr.tab === 'cp') h += '<button type="button" class="blr-row" onclick="blrOpen(' + r.ci + ')">' + blrChip(b.sc) + '<span class="blr-rt"><b>' + blaE(imfTitle(r.cp)) + '</b><small>' + blaE(r.cp.id) + ' · ' + blrQCLabel(b.qc.k) + '</small></span><span class="bla-chev">›</span></button>';
        else { var pl = D.plan[P.m + '|' + r.cp.id], st = blrStLabel(pl), miss = b.gap.map(function (s) { return blrGapText(s, r.L.st[s.id]); }).filter(Boolean);
          h += '<button type="button" class="blr-row g" onclick="blrOpen(' + r.ci + ')"><span class="blr-rt"><b>' + blaE(imfTitle(r.cp)) + '</b><small class="blr-miss">' + blaE(miss.length ? blaT('Gap: ', 'कमी: ') + miss.slice(0, 2).join(' · ') + (miss.length > 2 ? blaT(' +' + (miss.length - 2) + ' more', ' +' + (miss.length - 2) + ' और') : '') : '') + '</small><small>' + (pl ? blaE(blaT('Fix on ', 'सुधार: ')) + '<b class="blr-fd">' + blaE(blaT('Day ' + (pl.day + 1), 'दिन ' + (pl.day + 1))) + '</b>' : blaE(blaT('No fix day planned for this checkpoint', 'इसका कोई सुधार दिन तय नहीं'))) + '</small></span><span class="blr-st ' + st[0] + '">' + blaE(st[1]) + '</span></button>'; } }); }
    h += '</div>';
  });
  if (!D.people.length) h += '<p class="bls-dim">' + blaE(blaT('No baseline answers for this day.', 'इस दिन के बेसलाइन उत्तर नहीं।')) + '</p>';
  cont.innerHTML = h + '<p class="bls-dim blr-foot">' + blaE(blaT('The baseline is closed — this day is a record and can\'t be changed. Gaps are closed on the implementation days.', 'बेसलाइन बंद है — यह दिन एक रिकॉर्ड है, बदला नहीं जा सकता। कमियाँ कार्यान्वयन के दिनों में दूर होती हैं।')) + '</p></div>';
}
function blrDetailHTML(D, row) {
  var ctx = D.ctx, cp = row.cp, sc = row.sc, cls = sc === 2 ? 'f' : sc === 1 ? 'h' : sc === 0 ? 'z' : 'n';
  var lines = row.S.map(function (s) { var x = row.L.st[s.id], ok = x.base !== null && x.base >= 0.9999;
    return '<div class="blr-ln"><span class="blr-lt">' + blaE(blrQText(s)) + '</span><span class="blr-la"><b class="' + (x.base === null ? 'n' : ok ? 'y' : 'x') + '">' + blaE(x.base === null ? blaT('Not answered', 'उत्तर नहीं') : imfAnsText(s, x.raw)) + '</b>' + (x.by ? '<small>' + blaE(x.by + (x.byRole ? ' (' + x.byRole + ')' : '') + blaT(' · Day ' + (_blr.di + 1), ' · दिन ' + (_blr.di + 1))) + '</small>' : '') + '</span></div>'; }).join('');
  var qc = row.qc, qh = qc.k === 'd' ? '<div class="blr-qbox d"><small>' + blaE(blaT('QUALITY CHAMPION · DIDN\'T MATCH', 'क्वालिटी चैंपियन · मेल नहीं')) + '</small>' + qc.notes.map(function (e) { return '<span>' + blaE((e.by || blaT('Quality Champion', 'क्वालिटी चैंपियन')) + (e.at ? ', ' + (typeof scFmtDate === 'function' ? scFmtDate(imfIst(e.at)) : imfIst(e.at)) : '') + ': ' + blrReason(e.r) + (e.note ? ' — “' + e.note + '”' : '')) + '</span>'; }).join('') + '</div>'
    : qc.k === 'm' ? '<div class="blr-qbox m"><small>' + blaE(blaT('QUALITY CHAMPION · MATCHED ✓', 'क्वालिटी चैंपियन · मेल ✓')) + '</small></div>'
    : '<div class="blr-qbox n"><small>' + blaE(blaT('QUALITY CHAMPION · NOT CHECKED', 'क्वालिटी चैंपियन · जाँचा नहीं')) + '</small><span>' + blaE(blaT('Not checked before the baseline closed.', 'बेसलाइन बंद होने से पहले नहीं जाँचा।')) + '</span></div>';
  var fx = []; Object.keys(row.by).forEach(function (m) { var b = row.by[m]; if (!b.gap.length) return; var pl = D.plan[m + '|' + cp.id], st = blrStLabel(pl), nm = blaFirst((ctx.staff[m] || {}).name || imfNameOf(ctx, m)), role = imfRoleOf(ctx, m);
    var go = pl && m === ctx.me && pl.past ? '<button type="button" class="blr-see" onclick="blrSeeFix(' + pl.day + ',\'' + blaE(cp.id) + '\')">' + blaE(blaT('Open fix ›', 'सुधार खोलें ›')) + '</button>' : '';
    fx.push('<div class="blr-fx"><span>' + blaE((pl ? blaT('Day ' + (pl.day + 1), 'दिन ' + (pl.day + 1)) : blaT('Not planned', 'तय नहीं')) + ' · ' + nm + ' (' + role + ')') + ' · <b class="blr-st ' + st[0] + '">' + blaE(st[1]) + '</b></span>' + go + '</div>'); });
  return '<button type="button" class="imf-back" onclick="blrBack()">‹ ' + blaE(blaT('Day ' + (_blr.di + 1) + ' result', 'दिन ' + (_blr.di + 1) + ' का परिणाम')) + '</button>'
    + '<div class="bls-card blr-det ' + cls + '"><i class="bls-band"></i><div class="blr-dh"><small>' + blaE(cp.id + ' · ' + blrStdTitle(row.std).split(' · ')[0] + ' · ' + (sc === 2 ? blaT('FULL', 'पूरा') : sc === 1 ? blaT('HALF', 'आधा') : sc === 0 ? blaT('ZERO', 'शून्य') : blaT('NOT SCORED', 'स्कोर नहीं'))) + '</small><b>' + blaE(imfTitle(cp)) + '</b></div>'
    + '<div class="blr-db">' + lines + qh + (fx.length ? '<div class="blr-qbox g"><small>' + blaE(blaT('GAP TO CLOSE', 'दूर करनी कमी')) + '</small>' + fx.join('') + '</div>' : '') + '</div></div>';
}
function blrTab(t) { _blr.tab = t; _blr.open = {}; blrRender(_blr.di); }
function blrToggle(m, on) { _blr.open[m] = !!on; _blr.keepPlan = true; blrRender(_blr.di); }
function blrOpen(ci) { _blr.det = ci; _blr.y = window.scrollY; blrRender(_blr.di); try { window.scrollTo(0, 0); var cc = document.getElementById('card-container'); if (cc && cc.scrollIntoView) cc.scrollIntoView({ block: 'start' }); } catch (e) {} }
function blrBack() { _blr.det = null; _blr.keepPlan = true; blrRender(_blr.di); try { window.scrollTo(0, _blr.y || 0); } catch (e) {} }
function blrSeeFix(day, id) { try { if (typeof imfOpen === 'function') imfOpen(day, id); } catch (e) {} }
(function () {
  if (typeof renderCard !== 'function') return; var o = renderCard;
  renderCard = function (di) { try { di = +di; if (blrOn(di)) { blrRender(di); return; } } catch (e) { console.warn('[BLR]', e); } var r = o.apply(this, arguments);
    try { var g = blaWaiting(), ch = document.querySelector('#nf-cards-head .nf-chip'); if (g && ch && typeof bgScLabel === 'function') ch.textContent = bgScLabel(g); } catch (e) {}   // the header follows the gate
    return r; };
})();
// cards to verify: baseline cards leave the queue once the baseline is closed (they show as "Not checked")
(function () { if (typeof scPendingVerifications !== 'function') return; var o = scPendingVerifications;
  scPendingVerifications = function () { var L = o.apply(this, arguments); try { if (blsSC() && blsComplete()) L = (L || []).filter(function (p) { return !(+p.di < blsBaseN()); }); } catch (e) {} return L; }; })();

// ══ 5. A Fixed fix shows the whole story: what the baseline found, the re-check, who checked it ══
function blaFixedHTML(it, ctx) {
  var acc = BLS_ACC[_imf.i % BLS_ACC.length], b = imfBaseLoc(ctx.progId, it.cp.id);
  var was = it.own.filter(function (s) { var x = it.L.st[s.id]; return x.base === null || x.base < 0.9999; });
  var found = (was.length ? was : it.own).map(function (s) { var x = it.L.st[s.id];
    return '<div class="imf-found"><span class="imf-ans">' + blaE(imfAnsText(s, x.raw)) + '</span><span class="imf-fq">' + blaE(blrQText(s)) + '<small>' + blaE((x.by ? x.by + (x.byRole ? ' (' + x.byRole + ')' : '') + ' · ' : '') + blaT('baseline' + (b ? ' Day ' + (b.di + 1) : ''), 'बेसलाइन' + (b ? ' दिन ' + (b.di + 1) : ''))) + '</small></span></div>'; }).join('');
  var at = '', who = ''; it.own.forEach(function (s) { var x = it.L.st[s.id]; if (x.at && x.at > at) { at = x.at; who = x.who; } });
  var nb = it.own.filter(function (s) { var v = it.L.st[s.id].base; return v !== null && v >= 0.9999; }).length, nn = it.own.filter(function (s) { var v = it.L.st[s.id].now; return v !== null && v >= 0.9999; }).length;
  var when = at ? (typeof scFmtDate === 'function' ? scFmtDate(imfIst(at)) : imfIst(at)) : '';
  var checker = (ctx.role || 'CHO') === 'CHO' ? blaT('the Quality Champion', 'क्वालिटी चैंपियन') : blaT('your CHO', 'आपके CHO');
  var vf = it.vf, chk = vf && vf.ok ? '<b class="ok">' + blaE(blaT('Looks right', 'सही लगता है')) + '</b> — ' + blaE((vf.by || '') + (vf.role ? ' (' + vf.role + ')' : '') + (vf.at ? ', ' + (typeof scFmtDate === 'function' ? scFmtDate(imfIst(vf.at)) : imfIst(vf.at)) : '')) + (vf.note ? '<small>“' + blaE(vf.note) + '”</small>' : '')
    : blaE(blaT('Waiting for ' + checker + ' to check it.', checker + ' के जाँचने की प्रतीक्षा।'));
  return '<div class="bls-slide"><div class="bls-card bls-acc imf-fixed" style="--acc:#2E8B57;--acc-t:#E3F3EA"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">' + (_imf.i + 1) + '</span><div class="bls-chm"><span class="bls-k">' + blaE((it.cp.id || '') + ' · ') + imfRouteChip(imfRouteOf({ gap: was.length ? was : it.own, own: it.own })) + ' <b class="imf-fixedk">' + blaE(blaT('FIXED ✓', 'सुधरा ✓')) + '</b></span><div class="bls-cpt">' + blaE(imfTitle(it.cp)) + '</div></div></div>'
    + '<div class="bls-cbody imf-body"><div class="imf-sec"><small>' + blaE(blaT('WHAT THE BASELINE FOUND', 'बेसलाइन में क्या मिला')) + '</small>' + found + '</div>'
    + '<div class="imf-sec"><small>' + blaE(blaT('RE-CHECK', 'दोबारा जाँच')) + '</small><div class="imf-found"><span class="imf-ans ok">' + blaE(blaT('Every line in place', 'हर पंक्ति ठीक')) + '</span><span class="imf-fq">' + blaE((who ? who + ' · ' : '') + when) + '</span></div>'
    + '<div class="imf-ba2"><span>' + blaE(blaT('Before', 'पहले')) + ' <b>' + nb + ' / ' + it.own.length + '</b></span><span>→</span><span>' + blaE(blaT('Now', 'अब')) + ' <b class="ok">' + nn + ' / ' + it.own.length + '</b></span></div></div>'
    + '<div class="imf-sec"><small>' + blaE(blaT('CHECKED BY', 'किसने जाँचा')) + '</small><p class="imf-chk">' + chk + '</p></div></div></div></div>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back" onclick="blaAgain()">' + blaE(blaT('Check it again', 'फिर से जाँचें')) + '</button><button type="button" class="bls-next imf-go" onclick="imfGo(1)">' + blaE(blaT('Next fix', 'अगला सुधार')) + ' ›</button></div>';
}
function blaAgain() { _imf.mode = 'check'; _imf.tmp = {}; _imf.more = true; imfRender(_imf.di); try { imfTop(); } catch (e) {} }
(function () { if (typeof imfFixHTML !== 'function') return; var o = imfFixHTML;
  imfFixHTML = function (it, ctx) { try { if (it && it.st === 'fixed' && !(it.gap || []).length) return blaFixedHTML(it, ctx || imfCtxMine()); } catch (e) { console.warn('[BLA] fixed', e); } return o.apply(this, arguments); }; })();
