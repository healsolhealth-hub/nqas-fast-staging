// ══════════════════════════════════════════════════════════════
// IMPLEMENTATION AS FIX → RE-CHECK (24 Nov 2026, HealSol: canvas I1–I5 approved)
//  Sub-Centres in line mode, after the facility baseline is complete, Days 8–49.
//  • Each person's fixes for the week = the checkpoints of the week's theme where one of THEIR lines was not met
//    in the baseline. They are spread over the 7 days of the week (so nobody has an empty week while gaps wait);
//    anything not done carries to the next day. The plan is fixed from the baseline, so it never reshuffles.
//  • A fix shows what the baseline found (line by line, who answered), what to do (the How to fix text),
//    what the checker will ask to see, then "Done — check it now" → the same plain questions again.
//  • Storage keeps the science: the re-check is saved on the checkpoint's own implementation day record
//    (its re-check date): fxAns/c{ci} = line answers, fx/c{ci} = {st:'done'|'later'|'redo', at, prev},
//    cpScores[ci] = the person's score for their lines (0/1/2, same rule). The facility score of a
//    checkpoint is worked out line by line from the latest answers (baseline, then re-checks).
//  • Checking a fix: the CHO checks other staff's fixes; the Quality Champion / Supervisor checks the CHO's
//    (the app's verification matrix). fxv/c{ci} = {ok, by, byRole, at, note}. "Doubtful" sends the fix
//    back to the person and the line answers stop counting until they re-check.
// ══════════════════════════════════════════════════════════════
var _imf = { di: null, ids: [], i: 0, mode: 'fix', tmp: {}, more: false, dir: 0, end: false };
var IMF_ROUTE = { A: ['ARRANGE', 'व्यवस्था', 'a'], R: ['RECORD', 'रिकॉर्ड', 'r'], L: ['LEARN', 'सीखें', 'l'], P: ['PRACTISE', 'अभ्यास', 'p'] };
function imfT(en, hi) { return typeof blsT === 'function' ? blsT(en, hi) : en; }
function imfE(s) { return typeof blsE === 'function' ? blsE(s) : String(s == null ? '' : s); }
function imfNow() { return typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString(); }
function imfToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function imfIst(iso) { try { return new Date(new Date(iso).getTime() + 5.5 * 3600e3).toISOString().slice(0, 10); } catch (e) { return ''; } }
function cOf(o, ci) { if (!o) return undefined; return o['c' + ci] !== undefined ? o['c' + ci] : o[ci]; }

// ── where things are ──
function imfOn(di) {
  try { return typeof appMode !== 'undefined' && appMode === 'cho' && blsSC() && blsLineMode() && blsComplete() && typeof scIsImplDay === 'function' && scIsImplDay(di); } catch (e) { return false; }
}
var _imfLoc = {};
function imfBaseLoc(progId, id) { var k = 'b|' + progId + '|' + id; if (_imfLoc[k] !== undefined) return _imfLoc[k]; var r = null;
  for (var di = 0; di < blsBaseN() && !r; di++) { var d = scDayDef(progId, di); (d && d.cps || []).some(function (cp, ci) { if (cp.id === id) { r = { di: di, ci: ci }; return true; } return false; }); }
  return (_imfLoc[k] = r); }
function imfImplLoc(progId, id) { var k = 'i|' + progId + '|' + id; if (_imfLoc[k] !== undefined) return _imfLoc[k]; var r = null;
  try { var di = scImplDayOf(progId, id) - 1, d = scImplDay(progId, di), ci = d ? d.cps.findIndex(function (c) { return c.id === id; }) : -1; if (ci >= 0) r = { di: di, ci: ci }; } catch (e) {}
  return (_imfLoc[k] = r); }

// ── the records: everyone's (from the facility) with my own cards on top (freshest) ──
function imfCtxMine() {
  var F = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode) ? _nfFac : null;
  var staff = (F && F.staff) || (choState.facility || {}).staff || {};
  return { code: choState.facilityCode, progId: choState.progId, P: (F && F.progress) || {}, staff: staff, me: String(choState.staffMobile || ''), role: choState.roleId || 'CHO', flags: blsFlags(), present: scRolesFromRoster(staff), mine: true, loaded: !!(F && F.progress) };
}
function imfRec(ctx, mob, di) {
  if (ctx.mine && mob === ctx.me) { var c = (choState.cards || {})[di]; if (!c) return ((ctx.P[mob] || {})['day_' + di]) || null; return c; }
  return ((ctx.P[mob] || {})['day_' + di]) || null;
}
function imfMobs(ctx) { var m = {}; Object.keys(ctx.staff || {}).forEach(function (k) { if (!(ctx.staff[k] || {}).disabled) m[k] = 1; }); Object.keys(ctx.P || {}).forEach(function (k) { m[k] = 1; }); if (ctx.me) m[ctx.me] = 1; return Object.keys(m); }
function imfRoleOf(ctx, mob) { var s = (ctx.staff || {})[mob]; if (s && s.role) return s.role; if (mob === ctx.me) return ctx.role; var r0 = ''; Object.keys(ctx.P[mob] || {}).some(function (k) { var r = ctx.P[mob][k]; if (r && r.role) { r0 = r.role; return true; } return false; }); return r0 || 'CHO'; }
function imfNameOf(ctx, mob) { var s = (ctx.staff || {})[mob]; return String((s && s.name) || '').split(' ')[0] || imfRoleOf(ctx, mob); }

// ── each line of a checkpoint: what the baseline found, what it is now ──
function imfLines(ctx, cp) {
  var S = blsSlots(cp, ctx.flags), st = {}, b = imfBaseLoc(ctx.progId, cp.id), im = imfImplLoc(ctx.progId, cp.id);
  S.forEach(function (s) { st[s.id] = { s: s, base: null, raw: undefined, by: '', byRole: '', now: null, nraw: undefined, at: '', who: '' }; });
  imfMobs(ctx).forEach(function (mob) {
    var role = imfRoleOf(ctx, mob), nm = imfNameOf(ctx, mob);
    if (b) { var r = imfRec(ctx, mob, b.di);
      if (r && r.taskDone) { var A = cOf(r.blAns, b.ci) || {};
        S.forEach(function (s) { var v = blsVal(s, A[s.id]); if (v === null) return;   // 27 Nov: a baseline answer counts even if the line has since moved to another owner
 var x = st[s.id]; if (x.base === null || v < x.base) { x.base = v; x.raw = A[s.id]; x.by = nm; x.byRole = role; } });
        var R = r.blRev && cOf(r.blRev, b.ci); if (R) Object.keys(R).forEach(function (k) { var e = R[k] || {}; if (e.v == null || e.r === 'ok') return; var kk = k === 's' ? 0 : +k, met = k === 's' ? +e.v === 2 : +e.v === 1; S.forEach(function (s) { if (s.k === kk) { st[s.id].base = met ? 1 : 0; st[s.id].by = e.by || st[s.id].by; st[s.id].byRole = e.role || 'Quality Champion'; } }); }); } }
    if (im) { var r2 = imfRec(ctx, mob, im.di), fx = r2 && cOf(r2.fx, im.ci);
      if (fx && fx.st === 'done') { var vf = cOf(r2.fxv, im.ci); if (vf && vf.ok === false && String(vf.at || '') >= String(fx.at || '')) return;
        var A2 = cOf(r2.fxAns, im.ci) || {};
        S.forEach(function (s) { if (A2[s.id] === undefined) return; var v = blsVal(s, A2[s.id]); if (v === null) return; var x = st[s.id]; if (!x.at || String(fx.at) > String(x.at)) { x.now = v; x.nraw = A2[s.id]; x.at = fx.at; x.who = nm; } }); } }
  });
  S.forEach(function (s) { var x = st[s.id]; if (!x.at) { x.now = x.base; x.nraw = x.raw; } });
  return { S: S, st: st, impl: im, base: b };
}
function imfScoreOf(S, valOf) {   // the NQAS rule on a set of lines: each MoV = its weakest line; checkpoint = share of MoVs met
  var byK = {}; S.forEach(function (s) { (byK[s.k] = byK[s.k] || []).push(s); });
  var vals = Object.keys(byK).map(function (k) { var vs = byK[k].map(valOf); return vs.some(function (x) { return x === null || x === undefined; }) ? null : Math.min.apply(null, vs); });
  return vals.length ? blsScoreOf(vals) : 2;
}

// ── my fixes for the week, spread over its 7 days ──
function imfWeekStart(di) { return 7 + Math.floor((di - 7) / 7) * 7; }
function imfItems(ctx, di, mob, role) {
  mob = mob || ctx.me; role = role || ctx.role;
  var start = imfWeekStart(di), plan = scImplPlan(ctx.progId), items = [], full = [], today = imfToday();
  for (var dd = start; dd < start + 7; dd++) { var day = scImplDay(ctx.progId, dd); if (!day) continue;
    day.cps.forEach(function (cp, ci) {
      var own = blsSlots(cp, ctx.flags).filter(function (s) { return blsOwnerOK(s.own, role, ctx.present); }); if (!own.length) return;
      var L = imfLines(ctx, cp), it = { cp: cp, di: dd, ci: ci, own: own, L: L };
      if (own.some(function (s) { var b = L.st[s.id].base; return b === null || b < 0.9999; })) items.push(it); else full.push(it);
    }); }
  // 27 Nov 2026: checkpoints that were Full at baseline, spread over the week the same way, for a re-check if anything changed.
  // A re-check that finds a gap turns it into a fix on that same day.
  var m = full.length, still = [];
  full.forEach(function (it, j) { it.k = Math.floor(j * 7 / Math.max(1, m)); it.isFull = true;
    var r = imfRec(ctx, mob, it.di); it.fx = (r && cOf(r.fx, it.ci)) || null;
    var gapNow = it.own.some(function (s) { var x = it.L.st[s.id]; return x.now !== null && x.now < 0.9999; });
    if (gapNow) { it.turned = true; items.push(it); } else still.push(it); });
  var n = items.filter(function (it) { return !it.turned; }).length, gi = 0;
  items.forEach(function (it, i) {
    if (!it.turned) it.k = Math.floor((gi++) * 7 / Math.max(1, n));
    var r = imfRec(ctx, mob, it.di), fx = r && cOf(r.fx, it.ci), vf = r && cOf(r.fxv, it.ci);
    var doubt = !!(fx && vf && vf.ok === false && String(vf.at || '') >= String(fx.at || ''));
    var ok = it.own.every(function (s) { var x = it.L.st[s.id]; return x.now !== null && x.now >= 0.9999; });
    it.fx = fx || null; it.vf = vf || null; it.doubt = doubt;
    it.st = doubt ? 'doubt' : (fx && fx.st === 'done' && ok) ? 'fixed' : (fx && fx.st === 'done' && !fx.full) ? 'partial' : (fx && fx.st === 'later') ? 'later' : 'open';
    it.touched = !!(fx && fx.at && imfIst(fx.at) === today && !doubt);
    it.gap = it.own.filter(function (s) { var x = it.L.st[s.id]; return x.now === null || x.now < 0.9999; });
    if (it.turned && fx && fx.full) it.touched = false;   // a gap found at a Full re-check is a new fix, not one already worked on
  });
  items.full = still;
  return items;
}
function imfQuota(items) { return Math.min(6, Math.max(3, Math.ceil(items.length / 7))); }
function imfTodayList(items, di) {   // today's share: what is due so far this week, at most a fair day's work (more on request)
  var k = di - imfWeekStart(di), due = items.filter(function (it) { return it.k <= k && (it.st !== 'fixed' || it.touched); });
  var touched = due.filter(function (it) { return it.touched; }).length, room = Math.max(0, imfQuota(items) + (_imf.extra || 0) - touched), out = [];
  due.forEach(function (it) { if (it.touched) out.push(it); else if (room > 0) { out.push(it); room--; } });
  return out;
}
function imfMoreLeft(items, di) { var k = di - imfWeekStart(di); return items.filter(function (it) { return it.st !== 'fixed' && !it.touched; }).length - imfTodayList(items, di).filter(function (it) { return !it.touched; }).length; }
function imfAddressed(it) { return it.st === 'fixed' || it.touched; }
function imfRouteOf(it) { var s = (it.gap[0] || it.own[0]), lc = s ? blsLC(s.key) : null, r = lc && IMF_ROUTE[lc.r] ? lc.r : 'A'; return r; }
function imfRouteChip(r) { var R = IMF_ROUTE[r] || IMF_ROUTE.A; return '<span class="imf-rt ' + R[2] + '">' + imfE(imfT(R[0], R[1])) + '</span>'; }
function imfTitle(cp) { var hi = typeof blsHi === 'function' && blsHi(); return String(hi && cp.hi ? cp.hi : cp.t || ''); }

// ── today's card is done when every fix on today's list has been looked at (fixed, re-checked, or "not done yet") ──
function imfMaybeCloseDay(di, list) {
  try { var c = getCHOCard(di); if (c.taskDone || !list.every(imfAddressed)) return;
    c.taskDone = true; c.doneAt = c.doneAt || imfNow(); c.updatedAt = imfNow(); c.cpScores = c.cpScores || []; saveCHOState(); } catch (e) {}
}

// ── Today (staff) ──
function imfTodayHTML(di) {
  var ctx = imfCtxMine(); if (!ctx.loaded) return null;
  var items = imfItems(ctx, di), list = imfTodayList(items, di), done = list.filter(imfAddressed).length, k = di - imfWeekStart(di);
  imfMaybeCloseDay(di, list);
  var rows = list.slice(0, 5).map(function (it) { var ad = imfAddressed(it), fixed = it.st === 'fixed';
    return '<button type="button" class="imf-row' + (fixed ? ' ok' : '') + '" onclick="imfOpen(' + di + ',\'' + imfE(it.cp.id) + '\')">' + (fixed ? '<span class="imf-ck"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#14514A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg></span>' : imfRouteChip(imfRouteOf(it)))
      + '<span class="imf-rtx">' + imfE(imfTitle(it.cp)) + (it.doubt ? '<small>' + imfE(imfT('Checker was doubtful — look again', 'जाँचकर्ता को संदेह — फिर देखें')) + '</small>' : it.st === 'later' && it.touched ? '<small>' + imfE(imfT('Not done yet', 'अभी नहीं हुआ')) + '</small>' : it.k < k && !ad ? '<small>' + imfE(imfT('From earlier this week', 'इस सप्ताह पहले का')) + '</small>' : '') + '</span></button>'; }).join('');
  var left = list.length - done, cta = !list.length ? '' : left ? '<button type="button" class="nf-cta" onclick="imfOpen(' + di + ')">' + imfE(done ? imfT('Continue — ' + left + ' to go', 'जारी रखें — ' + left + ' बाकी') : imfT('Start', 'शुरू करें')) + ' <i class="ti ti-chevron-right"></i></button>'
    : '<div class="nf-cta bls-ok">✓ ' + imfE(imfT('Today\'s fixes done', 'आज के सुधार पूरे')) + '</div>';
  var hero = '<div class="nf-hero bls-dayhero imf-hero' + (list.length ? ' has-rows' : '') + '">' + (typeof blsArt === 'function' ? blsArt(Math.floor((di - 7) / 7)) : '') + '<div class="nf-hero-k imf-hk"><span>' + imfE(imfT('DAY ' + (di + 1) + ' · YOUR FIXES TODAY', 'दिन ' + (di + 1) + ' · आज के आपके सुधार')) + '</span>' + (list.length ? '<span>' + imfE(imfT(done + ' of ' + list.length + ' done', list.length + ' में से ' + done + ' पूरे')) + '</span>' : '') + '</div>'
    + (list.length ? '<div class="imf-rows">' + rows + (list.length > 5 ? '<div class="imf-more">' + imfE(imfT('+ ' + (list.length - 5) + ' more', '+ ' + (list.length - 5) + ' और')) + '</div>' : '') + '</div>'
      : '<div class="nf-hero-t">' + imfE(imfT('Nothing to fix today', 'आज सुधारने को कुछ नहीं')) + '</div><div class="nf-hero-s">' + imfE(items.length ? imfT('Your fixes for this week are done or come later in the week.', 'इस सप्ताह के आपके सुधार पूरे हैं या सप्ताह में आगे हैं।') : imfT('None of your lines in this week\'s theme needed fixing. Use the time to learn something new.', 'इस सप्ताह के विषय में आपकी कोई पंक्ति सुधारनी नहीं है। कुछ नया सीखें।')) + '</div>')
    + cta + '</div>';
  return { hero: hero, items: items, list: list, ctx: ctx };
}
function imfReadyHTML() {
  try { var F = _nfFac, A = F && F.agg; if (!A || !A.max) return ''; var tg = (typeof _scCrit !== 'undefined' && _scCrit.overall) || 70, b = A.baseline && A.baseline.assessed ? A.baseline.pct : null, g = b === null ? null : A.pct - b;
    return '<div class="nf-card imf-ready"><div class="imf-rh"><b>' + imfE(imfT('Facility readiness', 'केंद्र की तैयारी')) + '</b><span><b>' + A.pct + '%</b>' + (g !== null ? ' <em class="' + (g >= 0 ? 'up' : 'dn') + '">' + (g >= 0 ? '+' : '') + g + ' ' + imfE(imfT('since baseline', 'बेसलाइन से')) + '</em>' : '') + '</span></div>'
      + '<div class="imf-bar"><i style="width:' + Math.min(100, A.pct) + '%"></i><u style="left:' + tg + '%"></u></div><small>' + imfE(A.pct >= tg ? imfT('Above the NQAS ' + tg + '% line — keep every area there too', 'NQAS ' + tg + '% से ऊपर — हर क्षेत्र भी वहीं रखें') : imfT('NQAS needs ' + tg + '% — ' + (tg - A.pct) + ' more points to go', 'NQAS के लिए ' + tg + '% चाहिए — ' + (tg - A.pct) + ' अंक और')) + '</small></div>'; } catch (e) { return ''; }
}
function imfTeamHTML(ctx, di) {
  try { var rows = [];
    imfMobs(ctx).forEach(function (m) { if (m === ctx.me) return; var p = (ctx.staff || {})[m]; if (!p || p.disabled) return;
      var L = imfTodayList(imfItems(ctx, di, m, p.role), di); if (!L.length) return; var d = L.filter(imfAddressed).length, k = rows.length % 5;
      rows.push('<div class="imf-tm"><span class="bls-ti' + (d ? '' : ' z') + '" style="' + (d ? 'background:' + BLS_ACC[k][0] : '') + '">' + imfE(String(p.name || p.role).charAt(0).toUpperCase()) + '</span><small>' + imfE(String(p.name || p.role).split(' ')[0]) + '</small><b>' + d + ' / ' + L.length + '</b></div>'); });
    if (!rows.length) return '';
    return '<div class="nf-card imf-team"><b>' + imfE(imfT('Team fixes today', 'आज टीम के सुधार')) + '</b><div>' + rows.join('') + '</div></div>'; } catch (e) { return ''; }
}
function imfWeekHTML(ctx, di, items) {
  try { var total = 0; Object.keys(scImplPlan(ctx.progId).days).forEach(function (dd) { dd = +dd; if (dd < 7 || dd > 48) return; var day = scImplDay(ctx.progId, dd); (day && day.cps || []).forEach(function (cp) {
        var own = blsSlots(cp, ctx.flags).filter(function (s) { return blsOwnerOK(s.own, ctx.role, ctx.present); }); if (!own.length) return;
        var L = imfLines(ctx, cp); if (own.some(function (s) { var x = L.st[s.id]; return x.now === null || x.now < 0.9999; })) total++; }); });
    var n = items.length, fixed = items.filter(function (it) { return it.st === 'fixed'; }).length, other = Math.max(0, total - items.filter(function (it) { return it.st !== 'fixed'; }).length), per = Math.max(1, Math.round(n / 7));
    if (!n) return '';
    var seg = ''; for (var i = 0; i < n; i++) seg += '<i class="' + (i < fixed ? 'ok' : '') + '"></i>';
    return '<div class="nf-card imf-week"><b>' + imfE(imfT('This week', 'यह सप्ताह')) + '</b><p>' + imfE(imfT('You have ' + n + ' thing' + (n === 1 ? '' : 's') + ' to fix in this week\'s theme, about ' + per + ' a day.' + (other ? ' Your other ' + other + ' come in their own weeks — never all at once.' : ''), 'इस सप्ताह के विषय में आपको ' + n + ' सुधार करने हैं, लगभग ' + per + ' रोज़।' + (other ? ' आपके बाकी ' + other + ' अपने सप्ताह में आएँगे — एक साथ नहीं।' : ''))) + '</p><div class="imf-seg" style="grid-template-columns:repeat(' + Math.min(n, 12) + ',minmax(0,1fr))">' + seg.split('</i>').slice(0, 12).join('</i>') + '</div><small>' + imfE(imfT(fixed + ' of ' + n + ' fixed this week', 'इस सप्ताह ' + n + ' में से ' + fixed + ' सुधरे')) + '</small></div>';
  } catch (e) { return ''; }
}

// ── checking fixes (CHO: staff fixes; Champion / Supervisor: the CHO's) ──
function imfToCheck(ctx, who) {   // who(mob, role) → may I check this person's fixes?
  var out = [];
  imfMobs(ctx).forEach(function (mob) { var role = imfRoleOf(ctx, mob); if (!who(mob, role)) return; var nm = imfNameOf(ctx, mob);
    for (var di = 7; di <= 48; di++) { var r = ((ctx.P[mob] || {})['day_' + di]); if (!r || !r.fx) continue; var day = scImplDay(ctx.progId, di); if (!day) continue;
      Object.keys(r.fx).forEach(function (k) { var ci = +String(k).replace(/^c/, ''), fx = r.fx[k] || {}, vf = cOf(r.fxv, ci); if (fx.st !== 'done' || fx.full) return; if (vf && String(vf.at || '') >= String(fx.at || '')) return;
        var cp = day.cps[ci]; if (!cp) return; var A = cOf(r.fxAns, ci) || {}, S = blsSlots(cp, ctx.flags).filter(function (s) { return A[s.id] !== undefined; });
        var ok = S.length && S.every(function (s) { var v = blsVal(s, A[s.id]); return v !== null && v >= 0.9999; }); if (!ok) return;
        var ev = ''; S.some(function (s) { var lc = blsLC(s.key); if (lc && lc.ev) { ev = lc.ev; return true; } return false; });
        if (!ev && typeof nfFixOf === 'function') { var f = nfFixOf(cp, S[0] ? S[0].k : null); if (f) ev = (typeof blsHi === 'function' && blsHi() && f.evh) ? f.evh : (f.ev || ''); }
        out.push({ code: ctx.code, mob: mob, name: nm, role: role, di: di, ci: ci, cp: cp, at: fx.at, prev: fx.prev, ev: ev }); }); } });
  return out.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); });
}
function imfCheckCardHTML(x, i) {
  var acc = BLS_ACC[i % BLS_ACC.length], id = 'imfv-' + i, when = imfIst(x.at) === imfToday() ? imfT('fixed today', 'आज सुधारा') : imfT('fixed ', 'सुधारा ') + (typeof scFmtDate === 'function' ? scFmtDate(imfIst(x.at)) : imfIst(x.at));
  return '<div class="imf-vc" id="' + id + '" style="--acc:' + acc[0] + ';--acc-t:' + acc[1] + '"><i class="bls-band"></i><div class="imf-vb"><div class="imf-vm"><span>' + imfE(x.name + ' · ' + x.role + ' · ' + when) + '</span><span>' + imfE(x.cp.id || '') + '</span></div><b>' + imfE(imfTitle(x.cp)) + '</b>'
    + (x.ev ? '<div class="imf-ask"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span>' + imfE(imfT('Ask to see: ', 'देखने को कहें: ') + x.ev) + '</span></div>' : '')
    + '<div class="imf-va"><button type="button" class="p" onclick="imfVerify(\'' + imfE(x.code) + '\',\'' + imfE(x.mob) + '\',' + x.di + ',' + x.ci + ',true,\'' + id + '\')">' + imfE(imfT('Looks right', 'सही लगता है')) + '</button><button type="button" onclick="imfDoubt(\'' + id + '\')">' + imfE(imfT('Doubtful', 'संदेह है')) + '</button></div>'
    + '<div class="imf-dn" hidden><label for="' + id + '-n">' + imfE(imfT('What did you see? (they will read this)', 'आपने क्या देखा? (वे इसे पढ़ेंगे)')) + '</label><textarea id="' + id + '-n" rows="2" maxlength="300"></textarea><button type="button" onclick="imfVerify(\'' + imfE(x.code) + '\',\'' + imfE(x.mob) + '\',' + x.di + ',' + x.ci + ',false,\'' + id + '\',' + (x.prev == null ? 'null' : +x.prev) + ')">' + imfE(imfT('Send back to re-check', 'दोबारा जाँचने के लिए भेजें')) + '</button></div></div></div>';
}
function imfDoubt(id) { var e = document.getElementById(id); if (!e) return; var d = e.querySelector('.imf-dn'); if (d) { d.hidden = !d.hidden; var t = d.querySelector('textarea'); if (t && !d.hidden) t.focus(); } }
async function imfVerify(code, mob, di, ci, ok, id, prev) {
  var e = document.getElementById(id), note = ''; if (!ok && e) { var t = e.querySelector('textarea'); note = t ? String(t.value || '').trim().slice(0, 300) : ''; if (!note) { showToast(imfT('Please write what you saw.', 'कृपया लिखें कि आपने क्या देखा।'), 'err'); return; } }
  var who = appMode === 'sc-champion' ? ((typeof _scq !== 'undefined' && _scq.me) || {}) : null, byName = who ? (who.name || who.id || '') : (choState.staffName || ''), byRole = appMode === 'sc-champion' ? 'Quality Champion' : appMode === 'sc-supervisor' ? 'Supervisor' : (choState.roleId || 'CHO');
  var at = imfNow(), v = typeof scClean === 'function' ? scClean({ ok: !!ok, by: byName, byRole: byRole, at: at, note: note || null }) : { ok: !!ok, by: byName, byRole: byRole, at: at, note: note };
  var base = scProgressPath(code, mob, di), up = {}; up['fxv/c' + ci] = v;
  if (!ok) { up['fx/c' + ci + '/st'] = 'redo'; if (prev != null) up['cpScores/' + ci] = prev; up.updatedAt = at; }
  try { await db.ref(base).update(up); } catch (err) { showToast(imfT('Could not save — check the internet and try again.', 'सेव नहीं हुआ — इंटरनेट जाँचकर फिर कोशिश करें।'), 'err'); return; }
  try { var P = appMode === 'sc-champion' ? (_scq.prog || {})[code] : (_nfFac && _nfFac.code === code ? _nfFac.progress : null); if (P) { var r = ((P[mob] = P[mob] || {})['day_' + di] = (P[mob] || {})['day_' + di] || {}); r.fxv = r.fxv || {}; r.fxv['c' + ci] = v; if (!ok) { r.fx = r.fx || {}; r.fx['c' + ci] = Object.assign({}, r.fx['c' + ci] || {}, { st: 'redo' }); } } } catch (er) {}
  if (e) { e.classList.add('gone'); setTimeout(function () { e.remove(); }, 250); }
  showToast(ok ? imfT('Checked — thank you.', 'जाँच हो गई — धन्यवाद।') : imfT('Sent back with your note.', 'आपकी टिप्पणी के साथ वापस भेजा।'), 'ok');
}
function imfChoCheckHTML(ctx) {
  if ((ctx.role || 'CHO') !== 'CHO') return '';
  var L = imfToCheck(ctx, function (mob, role) { return mob !== ctx.me && role !== 'CHO' && role !== 'MO'; }); if (!L.length) return '';
  return '<div class="imf-vsec"><div class="imf-vh"><b>' + imfE(imfT('Staff fixes to check · ' + L.length, 'स्टाफ़ के सुधार जाँचें · ' + L.length)) + '</b></div>' + L.slice(0, 3).map(imfCheckCardHTML).join('') + (L.length > 3 ? '<p class="imf-dim">' + imfE(imfT('+ ' + (L.length - 3) + ' more after these', '+ ' + (L.length - 3) + ' और')) + '</p>' : '') + '</div>';
}

// ── the fix flow (Cards tab) ──
function imfOpen(di, cpId) {
  var t = scb1TodayIdx(); di = di == null ? t : di; _imf.di = di; _imf.flow = di; _imf.want = cpId || null; _imf.mode = 'fix'; _imf.tmp = {}; _imf.more = false; _imf.end = false; _imf.dir = 0;
  try { var onCards = typeof _nfTab !== 'undefined' && _nfTab === 'cards' && typeof choState !== 'undefined' && choState.view === 'cards'; if (!onCards && typeof nfTab === 'function') nfTab('cards'); } catch (e) {}
  // 26 Nov 2026: selectDay keeps the date strip on the fix's own day (renderCard alone left the strip on today)
  try { if (typeof selectDay === 'function') selectDay(di + 1); else if (typeof renderCard === 'function') renderCard(di); } catch (e) { try { renderCard(di); } catch (e2) {} }
}
function imfBackToDay(di) { _imf.flow = null; _imf.mode = 'fix'; _imf.end = false; _imf.tmp = {}; imfRender(di); try { window.scrollTo(0, 0); } catch (e) {} }
function imfFlowList(ctx, di) { var items = imfItems(ctx, di), today = scb1TodayIdx(), k = di - imfWeekStart(di);
  var list = di === today ? imfTodayList(items, di) : items.filter(function (it) { return it.k === k; });   // 26 Nov: an earlier day opens every fix it lists, Fixed ones too
  return { items: items, list: list }; }
function imfRender(di) {
  var cont = document.getElementById('card-container'); if (!cont) return;
  var ctx = imfCtxMine();
  if (!ctx.loaded) { cont.innerHTML = '<div class="bls imf"><div class="nf-card"><span class="nf-skel" style="width:60%;height:16px"></span><span class="nf-skel" style="width:90%;height:12px;margin-top:10px"></span><span class="nf-skel" style="width:80%;height:12px;margin-top:8px"></span></div></div>';
    if (typeof nfLoadFacility === 'function') nfLoadFacility().then(function () { if (_imf.di === di || _imf.di == null) imfRender(di); }); return; }
  var today = scb1TodayIdx(), F = imfFlowList(ctx, di), L = F.list;
  var head = '<div class="bls-hd"><small>' + imfE(imfT('IMPLEMENTATION · WEEK ' + (Math.floor((di - 7) / 7) + 2) + ' · DAY ' + (di + 1), 'क्रियान्वयन · सप्ताह ' + (Math.floor((di - 7) / 7) + 2) + ' · दिन ' + (di + 1))) + '</small><b>' + imfE(typeof blsTheme === 'function' ? (function () { var w = SC_IMPL_WEEKS[Math.floor((di - 7) / 7)]; return w ? imfT(w.title, w.hi) : ''; })() : '') + '</b></div>';
  if (_imf.mode === 'full' && _imf.fullDi === di) { var fi = (F.items.full || []).filter(function (x) { return x.cp.id === _imf.fullId; })[0];
    if (fi) { cont.innerHTML = '<div class="bls imf">' + head + '<button type="button" class="imf-back" onclick="imfFullClose()">‹ ' + imfE(di < today ? imfT('Day ' + (di + 1) + ' fixes', 'दिन ' + (di + 1) + ' के सुधार') : imfT('Back', 'वापस')) + '</button>' + imfFullHTML(fi, ctx) + '</div>'; return; }
    _imf.mode = 'fix'; _imf.fullId = null; }
  if (di > today || (di < today && (_imf.flow !== di || !L.length))) { if (_imf.di !== di) _imf.flow = null; _imf.di = di; cont.innerHTML = '<div class="bls imf">' + head + imfDayListHTML(ctx, di, F.items) + '</div>'; return; }
  if (!L.length) { cont.innerHTML = '<div class="bls imf">' + head + '<div class="bls-done"><span aria-hidden="true">✅</span><b>' + imfE(imfT('Nothing to fix today', 'आज सुधारने को कुछ नहीं')) + '</b><small>' + imfE(imfT('Your fixes for this week are done or come later in the week.', 'इस सप्ताह के आपके सुधार पूरे हैं या सप्ताह में आगे हैं।')) + '</small></div>' + imfDayListHTML(ctx, di, F.items) + '</div>'; imfMaybeCloseDay(di, L); return; }
  _imf.ids = L.map(function (it) { return it.cp.id; });
  if (_imf.want && (_imf.flow == null || _imf.flow === di)) { var w = _imf.ids.indexOf(_imf.want); if (w >= 0) { _imf.i = w; _imf.end = false; } _imf.want = null; }   // 27 Nov: a render of another day no longer eats the tapped fix
  else if (_imf.di !== di || _imf.i == null || _imf.i >= L.length) { var f0 = L.findIndex(function (it) { return !imfAddressed(it); }); _imf.i = f0 < 0 ? 0 : f0; if (f0 < 0) _imf.end = true; }
  _imf.di = di;
  if (_imf.end) { cont.innerHTML = '<div class="bls imf">' + head + (di < today ? '<button type="button" class="imf-back" onclick="imfBackToDay(' + di + ')">‹ ' + imfE(imfT('Day ' + (di + 1) + ' fixes', 'दिन ' + (di + 1) + ' के सुधार')) + '</button>' : '') + imfEndHTML(L) + imfFullFoldHTML(di, F.items) + '</div>'; imfMaybeCloseDay(di, L); return; }
  var it = L[_imf.i];
  var back = di < today ? '<button type="button" class="imf-back" onclick="imfBackToDay(' + di + ')">‹ ' + imfE(imfT('Day ' + (di + 1) + ' fixes', 'दिन ' + (di + 1) + ' के सुधार')) + '</button>' : '';
  cont.innerHTML = '<div class="bls imf">' + head + back + imfDotsHTML(L) + (_imf.mode === 'check' ? imfCheckHTML(it) : imfFixHTML(it, ctx)) + '</div>';
  var sl = cont.querySelector('.bls-slide');
  if (sl) { var x0 = null, y0 = null; sl.addEventListener('touchstart', function (e) { var p = e.touches[0]; x0 = p.clientX; y0 = p.clientY; }, { passive: true });
    sl.addEventListener('touchend', function (e) { if (x0 == null) return; var p = e.changedTouches[0], dx = p.clientX - x0, dy = p.clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5 && _imf.mode === 'fix') imfGo(dx < 0 ? 1 : -1); }, { passive: true }); }
  try { imfVidMeta(cont); } catch (e) {}
}
function imfDotsHTML(L) {
  var h = L.map(function (it, k) { return k === _imf.i ? '<span class="bls-d cur" style="background:' + BLS_ACC[k % BLS_ACC.length][0] + '">' + (k + 1) + '</span>' : '<span class="bls-d ' + (it.st === 'fixed' ? 'a' : imfAddressed(it) ? 's' : '') + '"></span>'; }).join('');
  return '<div class="bls-map imf-map"><div class="bls-dots" aria-hidden="true">' + h + '</div><span class="bls-dm">' + imfE(imfT('Fix ' + (_imf.i + 1) + ' of ' + L.length + (_imf.mode === 'check' ? ' · re-check' : ''), 'सुधार ' + (_imf.i + 1) + ' / ' + L.length + (_imf.mode === 'check' ? ' · दोबारा जाँच' : ''))) + '</span></div>';
}
function imfAnsText(s, raw) {   // what an answer said, in the staff member's words
  if (raw === undefined || raw === null || raw === '') return imfT('Not answered', 'उत्तर नहीं');
  var hi = typeof blsHi === 'function' && blsHi();
  if (s.kind === 'mcq') return /^o/.test(String(raw)) && blsVal(s, raw) === 1 ? imfT('Answered right', 'सही उत्तर') : imfT('Answer was not right', 'उत्तर सही नहीं था');
  if (s.kind === 'list' && String(raw).length !== (s.items || []).length) return imfT('Some items were missing (answered before the list was split by item)', 'कुछ चीज़ें कम थीं (सूची बँटने से पहले का उत्तर)');
  if (s.kind === 'list') { var str = String(raw), out = (s.items || []).map(function (x, i) { var g = typeof blsItemGap === 'function' ? blsItemGap(s, str, i) : (str.charAt(i) === '0' ? '' : null); return g === null ? null : x.n + (g ? ' (' + g + ')' : ''); }).filter(function (x) { return x !== null; }); return out.length ? imfT('Not in place: ', 'मौजूद नहीं: ') + out.join(', ') : imfT('All in place', 'सब मौजूद'); }
  if (s.kind === 'sample') return imfT(raw + ' of 5 records complete', '5 में से ' + raw + ' रिकॉर्ड पूरे');
  if (s.kind === 'ind') return imfT('Not recorded for every month', 'हर महीने दर्ज नहीं');
  var B = (typeof BLS_BTN !== 'undefined' && (BLS_BTN[s.ty] || BLS_BTN[''])) || [['Met', 'पूरा'], ['Not met', 'पूरा नहीं']];
  return raw === '1' ? (hi ? B[0][1] : B[0][0]) : raw === '0' ? (hi ? B[1][1] : B[1][0]) : imfT('Not sure', 'पता नहीं');
}
function imfFixHTML(it, ctx) {
  var acc = BLS_ACC[_imf.i % BLS_ACC.length], hi = typeof blsHi === 'function' && blsHi(), r = imfRouteOf(it);
  var found = it.gap.map(function (s) { var x = it.L.st[s.id], who = x.at ? (x.who + ' · ' + imfT('last re-check', 'पिछली जाँच')) : (x.by ? x.by + (x.byRole ? ' (' + x.byRole + ')' : '') + ' · ' + imfT('baseline', 'बेसलाइन') : '');
    return '<div class="imf-found"><span class="imf-ans">' + imfE(imfAnsText(s, x.at ? x.nraw : x.raw)) + '</span><span class="imf-fq">' + imfE(hi && s.h ? s.h : s.t) + (who ? '<small>' + imfE(who) + '</small>' : '') + '</span></div>'; }).join('');
  var ks = []; it.gap.forEach(function (s) { if (ks.indexOf(s.k) < 0) ks.push(s.k); });
  var todo = '', ev = '', tm = '';
  ks.forEach(function (k) { var f = typeof nfFixOf === 'function' ? nfFixOf(it.cp, (it.cp.items || []).length ? k : null) : null; if (!f) return; var fx = hi && f.fxh ? f.fxh : f.fx; if (fx && todo.indexOf(fx) < 0) todo += (todo ? '\n\n' : '') + fx; if (!ev) ev = hi && f.evh ? f.evh : (f.ev || ''); if (!tm && f.tm) tm = f.tm; });
  if (!todo) { it.gap.some(function (s) { var lc = blsLC(s.key); if (lc && lc.n) { todo = lc.n; return true; } return false; }); }
  if (!ev) { it.gap.some(function (s) { var lc = blsLC(s.key); if (lc && lc.ev) { ev = lc.ev; return true; } return false; }); }
  var checker = (ctx.role || 'CHO') === 'CHO' ? imfT('The Quality Champion', 'क्वालिटी चैंपियन') : imfT('Your CHO', 'आपके CHO');
  var note = it.doubt && it.vf ? '<div class="imf-doubt"><b>' + imfE(imfT((it.vf.by || 'The checker') + ' was doubtful', (it.vf.by || 'जाँचकर्ता') + ' को संदेह था')) + '</b>' + (it.vf.note ? '<span>“' + imfE(it.vf.note) + '”</span>' : '') + '</div>' : '';
  return '<div class="bls-slide' + (_imf.dir > 0 ? ' in-r' : _imf.dir < 0 ? ' in-l' : '') + '"><div class="bls-card bls-acc" style="--acc:' + acc[0] + ';--acc-t:' + acc[1] + '"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">' + (_imf.i + 1) + '</span><div class="bls-chm"><span class="bls-k">' + imfE((it.cp.id || '') + ' · ') + imfRouteChip(r) + '</span><div class="bls-cpt">' + imfE(imfTitle(it.cp)) + '</div></div></div>'
    + '<div class="bls-cbody imf-body">' + note + '<div class="imf-sec"><small>' + imfE(imfT('WHAT THE BASELINE FOUND', 'बेसलाइन में क्या मिला')) + '</small>' + found + '</div>'
    + (todo ? '<div class="imf-sec"><small>' + imfE(imfT('WHAT TO DO', 'क्या करें')) + '</small><p class="imf-todo">' + imfE(todo) + '</p>' + (tm ? '<span class="imf-tm2">⏱ ' + imfE(tm) + '</span>' : '') + '</div>' : '')
    + imfVidHTML(it.cp) + imfAqHTML(it.cp)
    + (ev ? '<div class="imf-ask2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><span><b>' + imfE(checker + imfT(' will ask to see: ', ' देखना चाहेंगे: ')) + '</b>' + imfE(ev) + '</span></div>' : '')
    + '</div></div></div>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back" onclick="imfLater()">' + imfE(imfT('Not done yet', 'अभी नहीं हुआ')) + '</button><button type="button" class="bls-next imf-go" onclick="imfCheck()">' + imfE(imfT('Done — check it now', 'हो गया — अभी जाँचें')) + '</button></div>';
}
function imfCheckHTML(it) {
  var acc = BLS_ACC[_imf.i % BLS_ACC.length], rest = it.own.filter(function (s) { return it.gap.indexOf(s) < 0; }), show = _imf.more ? it.gap.concat(rest) : it.gap;
  var rows = show.map(function (s) { var v = _imf.tmp[s.id]; var h = blsRowHTML(it.di, it.ci, s, v, show.length === 1); return h.replace(/blsSetItem\(|blsPartTap\(/g, 'imfSetItem(').replace(/blsSetRange\(/g, 'imfSetRange(').replace(/blsSetInd\(/g, 'imfSetInd(').replace(/blsSet\(/g, 'imfSet('); }).join('');
  var valNow = function (s) { if (_imf.tmp[s.id] !== undefined) { var v = blsVal(s, _imf.tmp[s.id]); if (v !== null) return v; } return it.L.st[s.id].now; };
  var seg = function (fn) { return it.own.map(function (s) { var v = fn(s); return '<i class="' + (v !== null && v >= 0.9999 ? 'ok' : '') + '"></i>'; }).join(''); };
  var nb = it.own.filter(function (s) { var v = it.L.st[s.id].base; return v !== null && v >= 0.9999; }).length, nn = it.own.filter(function (s) { var v = valNow(s); return v !== null && v >= 0.9999; }).length;
  var ready = (it.gap.length ? it.gap : show).every(function (s) { return _imf.tmp[s.id] !== undefined && blsDone1(s, _imf.tmp[s.id]); }), all = nn === it.own.length;
  var checker = (choState.roleId || 'CHO') === 'CHO' ? imfT('The Quality Champion', 'क्वालिटी चैंपियन') : imfT('Your CHO', 'आपके CHO');
  return '<div class="bls-slide"><div class="bls-card bls-acc" style="--acc:' + acc[0] + ';--acc-t:' + acc[1] + '"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">' + (_imf.i + 1) + '</span><div class="bls-chm"><span class="bls-k">' + imfE((it.cp.id || '') + ' · ' + imfT('LOOK AGAIN', 'फिर देखें')) + '</span><div class="bls-cpt">' + imfE(imfTitle(it.cp)) + '</div></div></div>'
    + '<div class="bls-cbody">' + rows + (rest.length && !_imf.more ? '<div class="imf-rest"><span>' + imfE(imfT('The other ' + rest.length + ' line' + (rest.length === 1 ? ' was' : 's were') + ' fine last time', 'बाकी ' + rest.length + ' पंक्तियाँ पिछली बार ठीक थीं')) + '</span><button type="button" onclick="_imf.more=true;imfRender(_imf.di)">' + imfE(imfT('Check them too', 'उन्हें भी जाँचें')) + '</button></div>' : '') + '</div></div></div>'
    + '<div class="nf-card imf-ba"><div><span>' + imfE(imfT('Before', 'पहले')) + '</span><div class="imf-sg">' + seg(function (s) { return it.L.st[s.id].base; }) + '</div><em>' + nb + ' / ' + it.own.length + '</em></div><div class="now"><span>' + imfE(imfT('Now', 'अब')) + '</span><div class="imf-sg">' + seg(valNow) + '</div><em>' + nn + ' / ' + it.own.length + '</em></div>'
    + '<p>' + imfE(!ready ? imfT('Answer the line' + (it.gap.length === 1 ? '' : 's') + ' above to see where it stands.', 'स्थिति देखने के लिए ऊपर की पंक्तियों का उत्तर दें।') : all ? imfT('Every line is in place. ' + checker + ' will look at it before long.', 'हर पंक्ति ठीक है। ' + checker + ' जल्द इसे देखेंगे।') : imfT('Not every line is in place yet — it stays on your list.', 'अभी हर पंक्ति ठीक नहीं — यह आपकी सूची में रहेगा।')) + '</p></div>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back" onclick="_imf.mode=\'fix\';_imf.tmp={};_imf.more=false;imfRender(_imf.di)">‹ ' + imfE(imfT('Back', 'वापस')) + '</button><button type="button" class="bls-next imf-go" onclick="imfSave()"' + (ready ? '' : ' disabled') + '>' + imfE(imfT('Save · next', 'सेव · आगे')) + ' ›</button></div>';
}
function imfOneMore() { _imf.extra = (_imf.extra || 0) + 1; _imf.end = false; _imf.mode = 'fix'; _imf.i = null; imfRender(_imf.di); }
function imfEndHTML(L) {
  var fixed = L.filter(function (it) { return it.st === 'fixed'; }).length, later = L.length - fixed, more = 0;
  var past = _imf.di != null && _imf.di < scb1TodayIdx();
  try { if (!past) more = imfMoreLeft(imfItems(imfCtxMine(), scb1TodayIdx()), scb1TodayIdx()); } catch (e) {}
  return '<div class="bls-done"><span aria-hidden="true">✅</span><b>' + imfE(past ? imfT('That\'s this day\'s fixes', 'इस दिन के सुधार पूरे') : imfT('That\'s today\'s fixes', 'आज के सुधार पूरे')) + '</b><small>' + imfE(past ? imfT(fixed + ' fixed' + (later ? ' · ' + later + ' still to finish — open this day again when they are done' : ''), fixed + ' सुधरे' + (later ? ' · ' + later + ' बाकी — पूरा होने पर यह दिन फिर खोलें' : '')) : imfT(fixed + ' fixed' + (later ? ' · ' + later + ' still to finish — they come back tomorrow' : ''), fixed + ' सुधरे' + (later ? ' · ' + later + ' बाकी — कल फिर आएँगे' : ''))) + '</small></div>'
    + '<button type="button" class="bls-submit" onclick="nfTab(\'today\')">' + imfE(imfT('Back to Today', 'आज पर वापस')) + '</button>'
    + (more > 0 ? '<button type="button" class="bls-back2" onclick="imfOneMore()">' + imfE(imfT('Do one more (' + more + ' left this week)', 'एक और करें (इस सप्ताह ' + more + ' बाकी)')) + '</button>' : '')
    + (L.length ? '<button type="button" class="bls-back2" onclick="_imf.end=false;_imf.i=0;_imf.mode=\'fix\';imfRender(_imf.di)">' + imfE(imfT('Look through them again', 'फिर से देखें')) + '</button>' : '');
}
function imfDayListHTML(ctx, di, items) {
  var k = di - imfWeekStart(di), L = items.filter(function (it) { return it.k === k; }), today = scb1TodayIdx();
  if (!L.length) return '<p class="bls-dim">' + imfE(imfT('No fixes were planned for this day.', 'इस दिन कोई सुधार तय नहीं था।')) + '</p>' + imfFullFoldHTML(di, items);
  var open = L.filter(function (it) { return it.st !== 'fixed'; }).length;
  return (di <= today && open ? '<p class="imf-how">' + imfE(imfT('Tap a fix to work on it: read what the baseline found and what to do, do it at the facility, then tap “Done — check it now” and answer the same question again.', 'किसी सुधार पर टैप करें: बेसलाइन में क्या मिला और क्या करना है पढ़ें, केंद्र पर करें, फिर “हो गया — अभी जाँचें” दबाकर वही सवाल फिर से उत्तर दें।')) + '</p>' : '') + '<div class="bls-card bls-list">' + L.map(function (it, i) { var st = it.st === 'fixed' ? imfT('Fixed', 'सुधरा') : it.st === 'partial' ? imfT('Re-checked — not all in place', 'दोबारा जाँचा — सब ठीक नहीं') : it.st === 'doubt' ? imfT('Sent back', 'वापस भेजा') : imfT('To do', 'करना है');
    return '<button type="button" class="bls-li' + (it.st === 'fixed' ? '' : ' open') + '"' + (di <= today ? ' onclick="imfOpen(' + di + ',\'' + imfE(it.cp.id) + '\')"' : ' disabled') + '><span class="bls-n">' + (i + 1) + '</span><span class="bls-lt">' + imfE(imfTitle(it.cp)) + '</span><span class="bls-ls"><span class="bls-pill ' + (it.st === 'fixed' ? 'y' : 'o') + '">' + imfE(st) + '</span></span></button>'; }).join('') + '</div>'
    + (di > today ? '<p class="bls-dim">' + imfE(imfT('These come on their day. Anything not finished carries on to the next day.', 'ये अपने दिन आएँगे। जो पूरा न हो, अगले दिन आता है।')) + '</p>' : '')
    + imfFullFoldHTML(di, items);
}
// ── 27 Nov 2026: Full at baseline — re-check if anything has changed ──
function imfFullWhen(it) {
  var fx = it.fx; if (fx && fx.full && fx.at) return imfT('Full · re-checked ', 'पूरा · दोबारा जाँचा ') + (typeof scFmtDate === 'function' ? scFmtDate(imfIst(fx.at)) : imfIst(fx.at));
  var x = it.L.st[it.own[0].id] || {}, b = imfBaseLoc((imfCtxMine() || {}).progId, it.cp.id), me = x.by && x.by === (choState.staffName || '');
  var day = b ? b.di + 1 : null;
  return me || !x.by ? imfT('Full · your baseline' + (day ? ', Day ' + day : ''), 'पूरा · आपकी बेसलाइन' + (day ? ', दिन ' + day : ''))
    : imfT('Full · ' + x.by + (x.byRole ? ' (' + x.byRole + ')' : '') + (day ? ', Day ' + day : ''), 'पूरा · ' + x.by + (day ? ', दिन ' + day : ''));
}
function imfFullFoldHTML(di, items) {
  var k = di - imfWeekStart(di), F = ((items && items.full) || []).filter(function (it) { return it.k === k; }), today = scb1TodayIdx(); if (!F.length) return '';
  var open = _imf.fold === di;
  return '<details class="imf-full"' + (open ? ' open' : '') + ' ontoggle="_imf.fold=this.open?' + di + ':null"><summary><span class="imf-fi">✓</span><span class="imf-ft"><b>' + imfE(imfT('Full at baseline (' + F.length + ')', 'बेसलाइन में पूरे (' + F.length + ')')) + '</b><small>'
    + imfE(imfT('Re-check if anything has changed. Not counted in the day\'s fixes.', 'कुछ बदला हो तो दोबारा जाँचें। दिन के सुधारों में नहीं गिने जाते।')) + '</small></span><i class="imf-fc" aria-hidden="true"></i></summary>'
    + F.map(function (it) { return '<div class="imf-fr"><span><b>' + imfE(imfTitle(it.cp)) + '</b><small>' + imfE(imfFullWhen(it)) + '</small></span>'
      + (di <= today ? '<button type="button" onclick="imfFullOpen(' + di + ',\'' + imfE(it.cp.id) + '\')">' + imfE(imfT('Re-check', 'दोबारा जाँचें')) + '</button>' : '') + '</div>'; }).join('') + '</details>';
}
function imfFullOpen(di, id) { _imf.di = di; _imf.mode = 'full'; _imf.fullDi = di; _imf.fullId = id; _imf.tmp = {}; _imf.fold = di; imfRender(di); try { window.scrollTo(0, 0); } catch (e) {} }
function imfFullClose() { var di = _imf.fullDi; _imf.mode = 'fix'; _imf.fullId = null; _imf.tmp = {}; imfRender(di == null ? _imf.di : di); }
function imfFullCur() { var di = _imf.fullDi; if (di == null) return null; return ((imfItems(imfCtxMine(), di).full) || []).filter(function (x) { return x.cp.id === _imf.fullId; })[0] || null; }
function imfFullHTML(it, ctx) {
  var acc = BLS_ACC[0];
  var rows = it.own.map(function (s) { var h = blsRowHTML(it.di, it.ci, s, _imf.tmp[s.id], it.own.length === 1); return h.replace(/blsSetItem\(|blsPartTap\(/g, 'imfSetItem(').replace(/blsSetRange\(/g, 'imfSetRange(').replace(/blsSetInd\(/g, 'imfSetInd(').replace(/blsSet\(/g, 'imfSet('); }).join('');
  var ready = it.own.every(function (s) { return _imf.tmp[s.id] !== undefined && blsDone1(s, _imf.tmp[s.id]); });
  return '<div class="bls-slide"><div class="bls-card bls-acc" style="--acc:' + acc[0] + ';--acc-t:' + acc[1] + '"><i class="bls-band"></i><div class="bls-chd"><div class="bls-chm"><span class="bls-k">' + imfE((it.cp.id || '') + ' · ' + imfT('FULL AT BASELINE · RE-CHECK', 'बेसलाइन में पूरा · दोबारा जाँच')) + '</span><div class="bls-cpt">' + imfE(imfTitle(it.cp)) + '</div></div></div>'
    + '<div class="bls-cbody"><div class="imf-fnote"><b>' + imfE(imfFullWhen(it)) + '.</b> ' + imfE(imfT('If it is still the same, tap “Still full”. If anything has changed, answer what you see now — a gap becomes a fix.', 'अगर सब वैसा ही है तो “अब भी पूरा” दबाएँ। कुछ बदला हो तो अभी जो दिखे वह उत्तर दें — कमी सुधार बन जाएगी।')) + '</div>' + rows + '</div></div></div>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back imf-still" onclick="imfFullStill()">' + imfE(imfT('Still full', 'अब भी पूरा')) + ' ✓</button><button type="button" class="bls-next imf-go" onclick="imfFullSave()"' + (ready ? '' : ' disabled') + '>' + imfE(imfT('Save what I see', 'जो दिखा वह सेव करें')) + '</button></div>';
}
function imfFullStill() {
  var it = imfFullCur(); if (!it) { imfFullClose(); return; }
  var c = getCHOCard(it.di), now = imfNow(); c.fx = c.fx || {}; c.fx[it.ci] = { st: 'done', at: now, full: true, still: true }; c.updatedAt = now; saveCHOState();
  showToast(imfT('Kept as Full — thank you for checking.', 'पूरा ही रखा — जाँचने के लिए धन्यवाद।'), 'ok'); imfFullClose();
}
function imfFullSave() {
  var it = imfFullCur(); if (!it) { imfFullClose(); return; }
  if (!it.own.every(function (s) { return _imf.tmp[s.id] !== undefined && blsDone1(s, _imf.tmp[s.id]); })) { showToast(imfT('Answer every line first.', 'पहले हर पंक्ति का उत्तर दें।'), 'err'); return; }
  var c = getCHOCard(it.di), now = imfNow(), prevC = (c.cpScores || [])[it.ci];
  c.fxAns = c.fxAns || {}; var A = Object.assign({}, c.fxAns[it.ci] || {}); it.own.forEach(function (s) { A[s.id] = _imf.tmp[s.id]; }); c.fxAns[it.ci] = A;
  var valNow = function (s) { var v = blsVal(s, _imf.tmp[s.id]); return v === null ? it.L.st[s.id].now : v; };
  var full = it.own.every(function (s) { var v = valNow(s); return v !== null && v >= 0.9999; });
  c.fx = c.fx || {}; c.fx[it.ci] = { st: 'done', at: now, full: true, prev: prevC != null && prevC >= 0 ? prevC : 2 };
  c.cpScores = c.cpScores || []; c.cpScores[it.ci] = imfScoreOf(it.own, valNow);
  c.updatedAt = now; c.role = choState.roleId || ''; saveCHOState();
  try { if (typeof scCpRecord === 'function') scCpRecord(it.di, it.ci); } catch (e) {}
  showToast(full ? imfT('Still Full — saved.', 'अब भी पूरा — सेव हुआ।') : imfT('Saved. It is now one of this day\'s fixes.', 'सेव हुआ। यह अब इस दिन का सुधार है।'), 'ok');
  imfFullClose();
}
function imfGo(step) { var n = _imf.i + step; if (n < 0 || n >= _imf.ids.length) { if (n >= _imf.ids.length) { _imf.end = true; imfRender(_imf.di); } return; } _imf.i = n; _imf.mode = 'fix'; _imf.tmp = {}; _imf.more = false; _imf.dir = step; if (typeof blsBuzz === 'function') blsBuzz(); imfRender(_imf.di); imfTop(); }
function imfTop() { try { var cc = document.getElementById('card-container'); if (cc && cc.scrollIntoView) cc.scrollIntoView({ block: 'start' }); } catch (e) {} }
function imfCur() { var ctx = imfCtxMine(), L = imfFlowList(ctx, _imf.di == null ? scb1TodayIdx() : _imf.di).list; return L.filter(function (it) { return it.cp.id === _imf.ids[_imf.i]; })[0] || null; }
function imfCheck() { _imf.mode = 'check'; _imf.tmp = {}; _imf.more = false; imfRender(_imf.di); imfTop(); }
function imfKeep(fn) { var y = window.scrollY; fn(); imfRender(_imf.di); try { window.scrollTo(0, y); } catch (e) {} }
function imfSet(di, ci, id, val) { imfKeep(function () { _imf.tmp[id] = val; }); }
function imfSetItem(di, ci, id, n, len, val) { imfKeep(function () { var s = String(_imf.tmp[id] || ''); while (s.length < len) s += '-'; _imf.tmp[id] = s.slice(0, n) + val + s.slice(n + 1); }); }
function imfSetRange(di, ci, id, len, from, to, val) { imfKeep(function () { var s = String(_imf.tmp[id] || ''); while (s.length < len) s += '-'; var a = s.split(''); for (var i = from; i < to; i++) a[i] = val; _imf.tmp[id] = a.join(''); }); }
function imfSetInd(di, ci, id, n, val) { imfKeep(function () { var p = String(_imf.tmp[id] || '||').split('|'); while (p.length < 3) p.push(''); p[n] = String(val == null ? '' : val).replace(/[^0-9x]/g, '').slice(0, 6); _imf.tmp[id] = p.join('|'); }); }
function imfLater() {
  var it = imfCur(); if (!it) { imfGo(1); return; }
  var c = getCHOCard(it.di); c.fx = c.fx || {}; var old = c.fx[it.ci] || {};
  if (old.st !== 'done' || it.doubt) { c.fx[it.ci] = { st: 'later', at: imfNow() }; c.updatedAt = imfNow(); saveCHOState(); }
  imfGo(1);
}
function imfSave() {
  var it = imfCur(); if (!it) return;
  if (!(it.gap.length ? it.gap : it.own).every(function (s) { return _imf.tmp[s.id] !== undefined && blsDone1(s, _imf.tmp[s.id]); })) { showToast(imfT('Answer every line first.', 'पहले हर पंक्ति का उत्तर दें।'), 'err'); return; }
  var c = getCHOCard(it.di), now = imfNow(), prevC = (c.cpScores || [])[it.ci];
  var prev = imfScoreOf(it.own, function (s) { return it.L.st[s.id].now; });
  c.fxAns = c.fxAns || {}; var A = Object.assign({}, c.fxAns[it.ci] || {}); it.own.forEach(function (s) { if (_imf.tmp[s.id] !== undefined) A[s.id] = _imf.tmp[s.id]; }); c.fxAns[it.ci] = A;
  c.fx = c.fx || {}; c.fx[it.ci] = { st: 'done', at: now, prev: prevC != null && prevC >= 0 ? prevC : prev };
  var valNow = function (s) { if (_imf.tmp[s.id] !== undefined) { var v = blsVal(s, _imf.tmp[s.id]); if (v !== null) return v; } return it.L.st[s.id].now; };
  c.cpScores = c.cpScores || []; c.cpScores[it.ci] = imfScoreOf(it.own, valNow);
  var items = it.cp.items || []; if (items.length) { c.cpTicks = c.cpTicks || {}; c.cpTicks[it.ci] = items.map(function (_, k) { var L = it.own.filter(function (s) { return s.k === k; }); if (!L.length) return null; var vs = L.map(valNow); return vs.some(function (x) { return x === null; }) ? null : Math.min.apply(null, vs) >= 0.9999 ? 1 : 0; }); }
  if (!c.taskDone) { c.taskDone = true; c.doneAt = c.doneAt || now; }
  c.updatedAt = now; c.role = choState.roleId || ''; saveCHOState();
  try { if (typeof scCpRecord === 'function') scCpRecord(it.di, it.ci); } catch (e) {}
  if (typeof blsTick === 'function') blsTick();
  _imf.mode = 'fix'; _imf.tmp = {}; _imf.more = false;
  setTimeout(function () { imfGo(1); }, 350);
}

// what NQAS assessors ask about this checkpoint (a video from the checkpoint list)
function imfAqHTML(cp) {
  if (!cp || (!cp.faq && !cp.faqHi) || typeof lrnAq !== 'function') return ''; var v = lrnAq(cp); if (!v) return '';
  return '<button type="button" class="imf-aq" onclick="lrnPlay(\'aq\',\'' + imfE(cp.id) + '\')"><span class="imf-aqi"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><span><b>' + imfE(imfT('What assessors ask about this', 'आकलनकर्ता इस पर क्या पूछते हैं')) + '</b><small>' + imfE(v.l === 'hi' ? 'हिंदी' : 'English') + ' <i class="lrn-du2" data-vurl="' + imfE(v.u) + '"></i></small></span></button>';
}
// ── videos inside a fix: in the app's language, with a switch; length read from the file itself ──
var _imfVid = { lang: null, dur: {} };
function imfVidHTML(cp) {
  if (!cp || (!cp.video && !cp.videoHi)) return '';
  var hi = typeof blsHi === 'function' && blsHi(), lang = _imfVid.lang || (hi && cp.videoHi ? 'hi' : cp.video ? 'en' : 'hi'), url = lang === 'hi' ? (cp.videoHi || cp.video) : (cp.video || cp.videoHi), real = lang === 'hi' && !cp.videoHi ? 'en' : lang === 'en' && !cp.video ? 'hi' : lang;
  var both = !!(cp.video && cp.videoHi);
  return '<div class="imf-vid"><button type="button" class="imf-vt" onclick="imfPlay(\'' + imfE(cp.id) + '\')" aria-label="' + imfE(imfT('Play the video', 'वीडियो चलाएँ')) + '"><span class="imf-vp"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span><span class="imf-vl">' + (real === 'hi' ? 'हिंदी' : 'English') + '</span><span class="imf-vd" data-vurl="' + imfE(url) + '">' + imfE(_imfVid.dur[url] || '') + '</span></button>'
    + '<div class="imf-vrow">' + (both ? '<div class="imf-lang"><button type="button" class="' + (real === 'hi' ? 'on' : '') + '" onclick="_imfVid.lang=\'hi\';imfRender(_imf.di)">हिंदी</button><button type="button" class="' + (real === 'en' ? 'on' : '') + '" onclick="_imfVid.lang=\'en\';imfRender(_imf.di)">English</button></div>' : '<small>' + imfE(real === 'en' && hi ? 'हिंदी वीडियो जल्द आएगा' : '') + '</small>') + '<small>' + imfE(imfT('Uses mobile data · Wi-Fi is better', 'मोबाइल डेटा लगेगा · Wi-Fi बेहतर')) + '</small></div></div>';
}
function imfPlay(id) { try { var cp = scCpmApply({}, id), hi = typeof blsHi === 'function' && blsHi(), lang = _imfVid.lang || (hi && cp.videoHi ? 'hi' : 'en'), url = lang === 'hi' ? (cp.videoHi || cp.video) : (cp.video || cp.videoHi); if (url) { showVideoPopup(url); if (typeof lrnMarkWatched === 'function') lrnMarkWatched(id, url); } } catch (e) {} }
function imfVidMeta(root) {   // the length of a Wix / mp4 file, read from its first bytes only
  (root || document).querySelectorAll('[data-vurl]').forEach(function (el) { var u = el.getAttribute('data-vurl'); if (!u || _imfVid.dur[u] !== undefined || !/\.(mp4|webm|m4v|mov)(\?|#|$)|video\.wixstatic\.com/i.test(u)) return; _imfVid.dur[u] = '';
    try { var v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.onloadedmetadata = function () { var s = Math.round(v.duration || 0); if (s > 0) { _imfVid.dur[u] = Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); document.querySelectorAll('[data-vurl]').forEach(function (e2) { if (e2.getAttribute('data-vurl') === u) e2.textContent = _imfVid.dur[u]; }); } v.removeAttribute('src'); try { v.load(); } catch (e) {} }; v.src = u; } catch (e) {} });
}

// ── wiring ──
(function () {
  // my fixes travel with the day record
  if (typeof scCardFromRecord === 'function') { var f = scCardFromRecord; scCardFromRecord = function (rec) { var c = f.apply(this, arguments); try { ['fxAns', 'fx', 'fxv'].forEach(function (key) { var b = (rec && rec[key]) || {}; c[key] = {}; Object.keys(b).forEach(function (k) { var m = /^c(\d+)$/.exec(k); if (m) c[key][+m[1]] = Object.assign({}, b[k]); }); }); } catch (e) {} return c; }; }
  if (typeof scCardSig === 'function') { var sg = scCardSig; scCardSig = function (c) { var r = sg.apply(this, arguments); return c && (c.fx || c.fxAns) ? r + JSON.stringify([c.fx || {}, c.fxAns || {}]) : r; }; }
  if (typeof scCardIsEmpty === 'function') { var em = scCardIsEmpty; scCardIsEmpty = function (c) { if (c && c.fx && Object.keys(c.fx).length) return false; return em.apply(this, arguments); }; }
  if (typeof scSyncProgress === 'function') { var sp = scSyncProgress; scSyncProgress = async function (di) { var ok = await sp.apply(this, arguments);
    if (ok) { var c = choState.cards[di]; if (c && c.fx && Object.keys(c.fx).length) { var up = {}; Object.keys(c.fx).forEach(function (k) { up['fx/c' + k] = c.fx[k]; }); Object.keys(c.fxAns || {}).forEach(function (k) { up['fxAns/c' + k] = c.fxAns[k]; });
      try { await db.ref(scProgressPath(choState.facilityCode, choState.staffMobile, di)).update(up); } catch (e) { return false; } } }
    return ok; }; }
  // the facility score of a checkpoint follows its lines' latest answers once someone has re-checked it
  if (typeof scFacilityReadiness === 'function') { var fr = scFacilityReadiness; scFacilityReadiness = function (progId, progressByMob, staffMap) { var A = fr.apply(this, arguments); try { return imfFacMerge(progId || 'nqas_12A', progressByMob || {}, staffMap || {}, A); } catch (e) { console.warn('[IMF] merge', e); return A; } }; }
  // the card of an implementation day is the fix flow
  if (typeof renderCard === 'function') { var rc = renderCard; renderCard = function (di) { try { di = +di; if (imfOn(di) && scDayUnlocked(di) && (typeof phcCheckAccess !== 'function' || phcCheckAccess(di, getDay(di)))) { window._scLastDi = di; imfRender(di); return; } } catch (e) { console.warn('[IMF]', e); } return rc.apply(this, arguments); }; }
  // the future days of this week can be looked at (what comes when)
  // Today on an implementation day: your fixes, readiness, the team, this week
  if (typeof nfRenderToday === 'function') { var rt = nfRenderToday; nfRenderToday = function () { var r = rt.apply(this, arguments);
    try { var host = document.getElementById('nf-today'); if (!host || (typeof wsIsPre === 'function' && wsIsPre())) return r; var today = scb1TodayIdx(), on = imfOn(today); document.body.classList.toggle('imf-day', !!on); if (!on) return r;
      var T = imfTodayHTML(today);
      if (!T) { if (typeof nfLoadFacility === 'function' && !_imf.asked) { _imf.asked = true; nfLoadFacility().then(function () { _imf.asked = false; nfRenderToday(); }); } return r; }
      host.querySelectorAll('.nf-sec').forEach(function (sec) { var nx = sec.nextElementSibling; if (nx && (nx.classList.contains('nf-list') || nx.classList.contains('nf-q'))) { nx.remove(); sec.remove(); } });
      host.querySelectorAll('.imf-x').forEach(function (e) { e.remove(); });
      var box = document.createElement('div'); box.innerHTML = T.hero + imfChoCheckHTML(T.ctx) + imfReadyHTML() + imfTeamHTML(T.ctx, today) + imfWeekHTML(T.ctx, today, T.items);
      [].forEach.call(box.children, function (e) { e.classList.add('imf-x'); });
      var old = host.querySelector('.nf-hero'), frag = document.createDocumentFragment(); while (box.firstChild) frag.appendChild(box.firstChild);
      if (old) old.parentNode.replaceChild(frag, old); else { var top = host.querySelector('.nf-top'); if (top) top.parentNode.insertBefore(frag, top.nextSibling); else host.insertBefore(frag, host.firstChild); }
    } catch (e) { console.warn('[IMF] today', e); }
    return r; }; }
  // the old day-card verification leaves out implementation days that run as fixes (they are checked fix by fix)
  if (typeof scVPending === 'function') { var vp = scVPending; scVPending = function (ctx) { var L = vp.apply(this, arguments); try { return L.filter(function (x) { if (x.di < 7 || x.di > 48) return true; var r = x.rec || {}; if (r.fx) return false; return (r.cpScores || []).some(function (v) { return v !== null && v !== undefined && +v >= 0; }); }); } catch (e) { return L; } }; }
  // Quality Champion: what to verify today, before everything else
  if (typeof nfRenderChampOverview === 'function') { var co = nfRenderChampOverview; nfRenderChampOverview = function () { var r = co.apply(this, arguments); try { imfChampHTML(); } catch (e) { console.warn('[IMF] champ', e); } return r; }; }
})();
function imfChampHTML() {
  var ov = document.getElementById('nf-cov'); if (!ov || typeof _scq === 'undefined' || !_scq.me) return;
  var L = [];
  Object.keys(_scq.facs || {}).forEach(function (code) { var f = _scq.facs[code] || {}; if (!/^nqas_12[AB]$/.test(f.progId || '') || !f.blDoneOn) return;
    var staff = f.staff || {}, ctx = { code: code, progId: f.progId, P: (_scq.prog || {})[code] || {}, staff: staff, me: '', role: '', flags: f.clFlags || {}, present: scRolesFromRoster(staff), mine: false, loaded: true };
    L = L.concat(imfToCheck(ctx, function (mob, role) { return role === 'CHO' || role === 'MO'; }).map(function (x) { x.fac = f.name || code; return x; })); });
  var old = document.getElementById('imf-champ'); if (old) old.remove();
  var box = document.createElement('div'); box.id = 'imf-champ'; box.className = 'imf-vsec imf-champ';
  box.innerHTML = '<div class="imf-vh"><b>' + imfE('To verify today · ' + L.length) + '</b>' + (L.length ? '<span>' + imfE(L[0].fac + (L.some(function (x) { return x.fac !== L[0].fac; }) ? ' and others' : '')) + '</span>' : '') + '</div>'
    + (L.length ? L.slice(0, 6).map(imfCheckCardHTML).join('') + (L.length > 6 ? '<p class="imf-dim">+ ' + (L.length - 6) + ' more after these</p>' : '') : '<p class="imf-dim">Nothing waiting. Fixes the CHO re-checks appear here, each with what to ask to see.</p>');
  var hd = ov.querySelector('.nfo-head,.nfo-hero,h1,h2'); var anchor = ov.firstElementChild;
  if (anchor && anchor.nextSibling) ov.insertBefore(box, anchor.nextSibling); else ov.appendChild(box);
}

// ── facility score from the lines' latest answers (baseline, then re-checks) ──
function imfFacMerge(progId, P, staff, A) {
  if (!blsLineMode() || !/^nqas_12[AB]$/.test(progId) || !A || !A.cps) return A;
  var any = Object.keys(P).some(function (m) { return Object.keys(P[m] || {}).some(function (k) { var r = P[m][k]; return r && r.fx; }); }); if (!any) return A;
  var flags = (typeof _blsFlagsFor !== 'undefined' && _blsFlagsFor) || blsFlags(), ctx = { progId: progId, P: P, staff: staff, me: '', role: '', flags: flags, present: scRolesFromRoster(staff), mine: false, loaded: true };
  var touched = {}; Object.keys(P).forEach(function (m) { Object.keys(P[m] || {}).forEach(function (k) { var r = P[m][k], mm = /^day_(\d+)$/.exec(k); if (!r || !r.fx || !mm) return; var day = scImplDay(progId, +mm[1]); if (!day) return; Object.keys(r.fx).forEach(function (c) { var ci = +String(c).replace(/^c/, ''), cp = day.cps[ci]; if (cp && r.fx[c] && r.fx[c].st === 'done') touched[cp.id] = cp; }); }); });
  var ids = Object.keys(touched); if (!ids.length) return A;
  ids.forEach(function (id) { var cp = touched[id], L = imfLines(ctx, cp), s = imfScoreOf(L.S, function (sl) { return L.st[sl.id].now; }); var e = A.cps[id] || (A.cps[id] = { score: null, base: null, by: [], owners: 0 }); if (s !== null) e.score = s; });
  var cps = scPkgNqas(progId), A2 = scDimsEmpty(), xp = 0, max = 0, assessed = 0;
  cps.forEach(function (cp) { var e = A.cps[cp.id] || {}; max += 2; if (e.score !== null && e.score !== undefined) { xp += e.score; assessed++; } scDimsAdd(A2, cp, e.score || 0, e.score !== null && e.score !== undefined); });
  Object.assign(A, A2); A.xp = xp; A.max = max; A.assessed = assessed; scDimsFinish(A);
  A.coverage = { assessed: assessed, total: cps.length, pct: cps.length ? Math.round(assessed / cps.length * 100) : 0 };
  A.compliance = assessed ? Math.round(xp / (assessed * 2) * 100) : 0;
  if (typeof scNqasCheckV2 === 'function') A.nqas = scNqasCheckV2(A);
  A.fixMerged = true; return A;
}
