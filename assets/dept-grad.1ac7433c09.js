// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE — PROGRAMME END (Step 3, HealSol 20 Oct 2026): UPHC / PHC / CHC.  Loaded after dept/summary.js.
//   Readiness week (Days 57–60; CHC 85–90): the leads finish checking every end-line day (end-line verification), the
//   in-charge holds the final team review the day before, graduation on the last day.
//   Graduation (server: graduateFacility) runs by itself when someone opens the facility on the last day with every
//   end-line day checked, or on the close date (last day + grace) with what is done. Result: NQAS Ready (overall, every
//   department and every Area of Concern ≥ 70, every Standard ≥ 50) · Almost ready · Not yet ready · Incomplete (end-line
//   not filled). CHC: LaQshya (Labour Room, Maternity OT) and MusQan (Paediatric OPD, NBSU) shown beside NQAS.
//   Close date: after it the cards are view-only (once graduated, the days before the end-line too).
//   Catch-up (HealSol): sc_facilities/{code}/catchup = {on, round, start, end (start + 27), depts:[3 weakest], free, paid, at, by}
//     card days 101–128: weeks 1–3 the departments' checkpoints, week 4 (122–128) their end-line again; graduation re-runs at the end.
//   Final team review: sc_facilities/{code}/finalReview = {at, by, byName} (in-charge).
//   Certificates: see the end of this file (issueCertificate decides).
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
var ND_GRAD = { grace: 7, std: 50, cuDays: 28, cuWork: 21, cuBase: 100 };
var ND_GRAD_RES = { ready: { t: 'NQAS Ready', c: 'g', ic: 'ti-award' }, almost: { t: 'Almost ready', c: 'a', ic: 'ti-award' }, notyet: { t: 'Not yet ready', c: 'r', ic: 'ti-hourglass' }, incomplete: { t: 'Incomplete', c: 'r', ic: 'ti-alert-triangle' } };
var ND_CERT_ST = [['ready', 'Ready (not applied yet)'], ['applied', 'Applied'], ['state', 'State assessment done'], ['national', 'National assessment done'], ['certified', 'Certified'], ['notcertified', 'Not certified']];
var _ndCrit = null;
async function ndGradLoad() {
  // timeline settings of this facility type (shared/sc_grad_config/byType/{type}, falling back to the Sub-Centre values)
  try { var c = await fbGet('shared/sc_grad_config'); if (c) { var t = (c.byType || {})[_nd.cfg.id] || {}, pick = function (k, d) { return t[k] != null && !isNaN(+t[k]) ? +t[k] : c[k] != null && !isNaN(+c[k]) ? +c[k] : d; };
    ND_GRAD.grace = pick('grace', 7); } } catch (e) {}
  try { _ndCrit = await fbGet('shared/dept_criteria'); } catch (e) { _ndCrit = null; }
}
function ndCrit() {
  var p = _nd.cfg.passMark || {}, k = _ndCrit || {}, kt = (k.byType || {})[_nd.cfg.id] || {}, n = function (key, d) { return kt[key] != null && !isNaN(+kt[key]) ? +kt[key] : k[key] != null && !isNaN(+k[key]) ? +k[key] : d; };   // 28 Oct: per type first
  return { overall: n('overall', p.overall || 70), aoc: n('aoc', p.aoc || 70), dept: n('dept', p.dept || 70), std: n('stdDefault', ND_GRAD.std) };
}
function ndProgDay() { return _nd.fac.startDate ? nfDeptDayNo(_nd.fac.startDate) : 0; }   // the programme day by date (not the catch-up day)
function ndGradDates() {
  var s = _nd.fac.startDate, S = ndShape(); if (!s) return null;
  return { last: ndAddDays(s, S.days - 1), close: ndAddDays(s, S.days - 1 + ND_GRAD.grace), lastDay: S.days, closeDay: S.days + ND_GRAD.grace };
}
// ── catch-up ──
function ndCu() { var c = _nd && _nd.fac && _nd.fac.catchup; return c && c.on ? c : null; }
function ndCuStarted() { var c = ndCu(); return !!(c && c.start && ndToday() >= c.start); }
function ndCuActive() { var c = ndCu(); return !!(c && !c.done && c.start && c.end && ndToday() >= c.start && ndToday() <= c.end); }
function ndCuDay() { var c = ndCu(); return c && c.start ? nfDeptDayNo(c.start) : 0; }   // 1 = first catch-up day
function ndCuDepts() { return ((ndCu() || {}).depts || []).filter(function (d) { return typeof d === 'string'; }); }
function ndLastDay() { return ndCuStarted() ? ND_GRAD.cuBase + ND_GRAD.cuDays : _nd.cfg.days; }   // the last card day in use
var _ndCuPlan = {};
function ndCuDayInfo(dept, day) {
  var k = day - ND_GRAD.cuBase, out = { phase: k > ND_GRAD.cuWork ? 'recheck' : 'catchup', day: day, week: Math.min(4, Math.ceil(k / 7)), ids: [], base: [] };
  if (k < 1 || k > ND_GRAD.cuDays || ndCuDepts().indexOf(dept) < 0) return out;
  var key = dept + '|' + ((ndCu() || {}).round || 1);
  if (!_ndCuPlan[key]) {
    var S = ndShape(), plan = ndPlanFor(S.bN)[dept] || [], list = nfDeptPlanIds(plan.slice(0, S.base)), aoc = function (id) { var r = _nd.byId[id]; return r ? r[2] : ''; };
    _ndCuPlan[key] = { work: nfDeptSplit(list, ND_GRAD.cuWork, aoc), re: nfDeptSplit(list, ND_GRAD.cuDays - ND_GRAD.cuWork, aoc) };
  }
  var P = _ndCuPlan[key]; out.ids = (k <= ND_GRAD.cuWork ? P.work[k - 1] : P.re[k - ND_GRAD.cuWork - 1]) || [];
  return out;
}
// ── close date: cards become view-only ──
function ndGradLocked(day) {
  var D = ndGradDates(); if (!D) return false; var t = ndToday();
  if (day > ND_GRAD.cuBase) { var c = ndCu(); return !c || !!c.done || !c.end || t < c.start || t > ndAddDays(c.end, ND_GRAD.grace); }
  if (t > D.close) return true;
  return !!_nd.fac.graduation && day < ndShape().e1;
}
function ndGradLockMsg() { var D = ndGradDates() || {}; ndToast('The programme has closed' + (D.close ? ' (' + ndShortDate(D.close) + ')' : '') + ' — these cards are view-only now.', 'err'); }
(function () {
  var oPut = ndPut;
  ndPut = function (up) {
    var bad = Object.keys(up || {}).some(function (p) { var m = /^sc_[pd]cards\/[^/]+\/[^/]+\/day_(\d+)/.exec(p); return !!m && ndGradLocked(+m[1]); });
    if (bad) { ndGradLockMsg(); return Promise.resolve(false); }
    return oPut.apply(this, arguments);
  };
})();

// ── end-line status per department: every end-line day filled (a card in) and checked (lead's check, or one filler) ──
function ndEndStat(cuOnly) {
  var S = ndShape(), out = { list: [], all: 0, done: 0, filled: 0, notVer: [] }, first = S.e1, last = S.eN, depts = ndDeptDefs();
  if (cuOnly) { first = ND_GRAD.cuBase + ND_GRAD.cuWork + 1; last = ND_GRAD.cuBase + ND_GRAD.cuDays; depts = depts.filter(function (d) { return ndCuDepts().indexOf(d.id) >= 0; }); }
  depts.forEach(function (d) {
    var e = { id: d.id, name: d.name, lead: ndLead(d.id), checker: ndChecker(d.id), days: [], tot: 0, chk: 0, filled: 0 };
    for (var n = first; n <= last; n++) {
      if (!ndDayInfo(d.id, n).ids.length) continue;
      var inn = ndCardsIn(d.id, n), c = !!ndRes(d.id, n).chk || ndSoloDone(d.id, n), st = c ? 'chk' : !inn.done.length ? 'none' : inn.waiting.length ? 'part' : 'ready';
      e.tot++; if (c) e.chk++; if (c || inn.done.length) e.filled++;
      e.days.push({ day: n, st: st, inn: inn });
    }
    e.ok = e.tot > 0 && e.chk === e.tot; e.full = e.filled === e.tot;
    out.list.push(e); if (e.tot) { out.all++; if (e.ok) out.done++; else out.notVer.push(d.id); if (e.full) out.filled++; }
  });
  out.complete = out.all > 0 && out.done === out.all; out.endlineDone = out.all > 0 && out.filled === out.all;
  return out;
}
// ── scores (the same numbers as every dashboard) and the result by the same rule as the server ──
function ndGradScores() {
  var S = ndShape(), deps = ndDeptDefs().map(function (d) { return d.id; }), pass = ndCrit().overall, L = ndLatest();
  var R = nfDeptReadiness(_nd.cl.items, L, { pass: pass, depts: deps }), B = nfDeptReadiness(_nd.cl.items, ndLatest(S.bN), { pass: pass, depts: deps });
  var std = {}; _nd.cl.items.forEach(function (r) { if (deps.indexOf(r[1]) < 0) return; var v = L[r[0]], x = std[r[3]] = std[r[3]] || { g: 0, m: 0, n: 0 }; x.m += 2; if (v === undefined || v === null || v === '') return; x.g += +v; x.n++; });   // whole Standard, not-yet-checked = 0
  var byStd = {}; Object.keys(std).forEach(function (k) { if (/^[A-H]\d{1,2}$/.test(k) && std[k].n) byStd[k] = Math.round(100 * std[k].g / std[k].m); });
  var byAoc = {}; Object.keys(R.byAoc || {}).forEach(function (a) { if (/^[A-H]$/.test(a) && R.byAoc[a].pct !== null) byAoc[a] = R.byAoc[a].pct; });
  var byDept = {}; Object.keys(R.byDept || {}).forEach(function (d) { if (R.byDept[d].pct !== null) byDept[d] = R.byDept[d].pct; });
  var bDept = {}; Object.keys(B.byDept || {}).forEach(function (d) { if (B.byDept[d].pct !== null) bDept[d] = B.byDept[d].pct; });
  var F = ndLatestFinal(), A = _nd.actions || {}, gaps = Object.keys(F).filter(function (id) { return F[id].s < 2; });
  var open = {}; Object.keys(A).forEach(function (id) { var a = A[id]; if (a && a.status !== 'closed') open[a.dept] = (open[a.dept] || 0) + 1; });
  return { overall: R.overall, base: B.n ? B.overall : null, byAoc: byAoc, byStd: byStd, byDept: byDept, baseDept: bDept, openGaps: gaps.length, openByDept: open, n: R.n, of: R.of };
}
function ndGradRule(sc, endlineDone) {
  var C = ndCrit(), f = function (o, m) { return Object.keys(o || {}).filter(function (k) { return o[k] < m; }).sort(); };
  var deptFails = f(sc.byDept, C.dept), aocFails = f(sc.byAoc, C.aoc), stdFails = f(sc.byStd, C.std), ok = sc.overall !== null && sc.overall >= C.overall;
  return { result: !endlineDone ? 'incomplete' : ok && !deptFails.length && !aocFails.length && !stdFails.length ? 'ready' : ok ? 'almost' : 'notyet', deptFails: deptFails, aocFails: aocFails, stdFails: stdFails, crit: C };
}
function ndProgs(byDept) {   // CHC: LaQshya / MusQan from the departments' prog setting
  var C = ndCrit(), out = {};
  ndDeptDefs().forEach(function (d) { var p = ndDeptDef(d.id).prog; if (!p || byDept[d.id] == null) return; var x = out[p] = out[p] || { ok: true, byDept: {} }; x.byDept[d.id] = byDept[d.id]; if (byDept[d.id] < C.dept) x.ok = false; });
  return out;
}
// ── graduation: runs by itself (anyone who opens the facility) ──
var _ndGradTried = {};
async function ndGradMaybe() {
  try {
    if (!_nd || !_nd.fac || !_nd.fac.startDate) return null;
    var D = ndGradDates(), day = ndProgDay(), g = _nd.fac.graduation, cu = ndCu(), t = ndToday(); if (day < D.lastDay) return null;
    var cuDue = !!(g && cu && !cu.done && (+cu.round || 1) > (+g.round || 0) && cu.end && t >= cu.end);
    if (g && !cuDue) return null;
    if (_ndGradTried[_nd.code] && Date.now() - _ndGradTried[_nd.code] < 600000) return null;
    var E = ndEndStat(cuDue);
    if (cuDue) { if (t === cu.end && !E.complete) return null; }
    else if (!E.complete && day < D.closeDay) return null;
    _ndGradTried[_nd.code] = Date.now();
    var sc = ndGradScores(); if (sc.overall === null) return null;
    var r = await nfCall('graduateFacility', { code: _nd.code, complete: E.complete, endlineDone: E.endlineDone, verified: E.complete, notVerified: E.notVer, openGaps: sc.openGaps,
      scores: { overall: sc.overall, base: sc.base, byAoc: sc.byAoc, byStd: sc.byStd, byDept: sc.byDept } });
    if (r && r.graduation) {
      _nd.fac.graduation = r.graduation; _nd.fac.phase = 'complete'; if (cu && r.graduation.round) cu.done = true;
      if (!r.already) ndToast('Graduation result: ' + (ND_GRAD_RES[r.graduation.result] || {}).t + ' · ' + r.graduation.overall + '%', 'ok');
      ndRender(); return r.graduation;
    }
  } catch (e) { console.warn('[dept] graduation', e && e.message); }
  return null;
}

// ── screens ──
function ndGradOpen(s, dept) { _nd.screen = s; if (dept) _nd.endDept = dept; _nd.card = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndGradClose() { _nd.screen = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndGradIsOver(mob) { return !!_nd.view || ndIsInCharge(mob) || ndSeesAll(mob); }   // sees every department's end-line
function ndGradRemindLink(e) {
  var who = e.checker || e.lead, nm = nxFirst(who), left = e.tot - e.chk;
  return who && who !== ndMob() ? ndWaLink(who, 'Namaste ' + nm + ', ' + left + ' end-line day' + (left > 1 ? 's' : '') + ' of ' + e.name + ' still need your check in NQAS | FAST. Please finish by Day ' + (ndShape().rN - 2) + ' so that ' + (_nd.fac.name || 'our facility') + ' can graduate on Day ' + ndShape().days + '.') : '';
}
function ndGradPhaseStrip() {
  var S = ndShape(), day = ndProgDay(), r = S.ready, D = ndGradDates();
  var cell = function (on, t, s) { return '<li class="' + (on ? 'on' : '') + '"><b>' + ndEsc(t) + '</b><span>' + ndEsc(s) + '</span></li>'; };
  return '<ol class="ng-ph">' + cell(day <= S.rN - 2, 'Days ' + S.r1 + '–' + (S.rN - 2), 'Leads check end-line cards') + cell(day === S.rN - 1, 'Day ' + (S.rN - 1), 'Final team review')
    + cell(day >= S.rN, 'Day ' + S.rN + ' · ' + ndShortDate(D.last), 'Graduation') + '</ol>';
}
function ndGradPreviewHTML() {
  var sc = ndGradScores(), E = ndEndStat(), R = ndGradRule(sc, true), res = ND_GRAD_RES[R.result], why = [];
  R.deptFails.forEach(function (d) { why.push('<b>' + ndEsc(ndDeptDef(d).name) + ' ' + sc.byDept[d] + '%</b>'); });
  R.aocFails.forEach(function (a) { why.push('Area of Concern <b>' + a + ' ' + sc.byAoc[a] + '%</b>'); });
  var txt = sc.overall === null ? 'Scores appear once the end-line cards are in.' : R.result === 'ready' ? 'Overall ' + sc.overall + '% and every department and Area of Concern at ' + R.crit.dept + '% or more.'
    : R.result === 'almost' ? 'Overall is ' + R.crit.overall + '% or more, but ' + (why.length ? why.slice(0, 3).join(' and ') + ' ' + (why.length > 1 ? 'are' : 'is') + ' below ' + R.crit.dept + '%' : 'a Standard is below ' + R.crit.std + '%') + '.'
    : 'Overall ' + sc.overall + '% — needs ' + R.crit.overall + '%.';
  return '<div class="nx-card"><div class="ng-row"><b style="flex:1">If we graduated today</b><small class="nx-dim">from checked cards</small></div><div class="ng-row" style="gap:12px">'
    + '<div class="ng-ring">' + nxRing(sc.overall || 0, 64, 7, '#1E6B5E', '#EAF0EE') + '<span>' + (sc.overall === null ? '–' : sc.overall + '%') + '</span></div>'
    + '<div style="flex:1"><span class="nx-chip ' + res.c + '">' + ndEsc(res.t) + '</span><div class="ng-txt">' + txt + '</div>' + (E.complete ? '' : '<div class="ng-txt nx-dim">' + (E.all - E.done) + ' department' + (E.all - E.done > 1 ? 's' : '') + ' still to check.</div>') + '</div></div></div>';
}
// the card on Today / the Facility dashboard
function ndGradTodayHTML() {
  if (!_nd.fac.startDate) return '';
  var me = ndMob(), S = ndShape(), day = ndProgDay(), D = ndGradDates(), g = _nd.fac.graduation, cu = ndCu(), over = ndGradIsOver(me), h = '';
  if (cu && cu.start && !cu.done) {
    var k = ndCuDay(), names = ndCuDepts().map(function (d) { return ndDeptDef(d).name; }).join(', ');
    if (k < 1) h += '<div class="nx-ban b"><b>Catch-up starts ' + ndEsc(nxLongDate(cu.start)) + '</b><span>' + ND_GRAD.cuDays + ' days on ' + ndEsc(names) + ', then their end-line again and graduation re-runs.</span></div>';
    else if (k <= ND_GRAD.cuDays) h += '<div class="nx-ban b"><b>Catch-up · day ' + k + ' of ' + ND_GRAD.cuDays + (k > ND_GRAD.cuWork ? ' · re-check' : ' · week ' + Math.ceil(k / 7)) + '</b><span>' + ndEsc(names) + (k > ND_GRAD.cuWork ? ' — the end-line again; leads check every day by ' + ndShortDate(cu.end) + '.' : ' — work on the gaps; the re-check starts on day ' + (ND_GRAD.cuWork + 1) + '.') + '</span></div>';
  }
  if (g) {
    var r = ND_GRAD_RES[g.result] || ND_GRAD_RES.incomplete;
    h += '<button type="button" class="nx-card ng-res ' + r.c + '" onclick="ndGradOpen(\'grad\')"><span class="ng-ic"><i class="ti ' + r.ic + '"></i></span><span style="flex:1;min-width:0"><small>Graduation result' + (g.round ? ' · after catch-up' : '') + '</small><b>' + ndEsc(r.t) + '</b>'
      + '<small>' + g.overall + '% overall' + (g.base != null ? ' · baseline ' + g.base + '% (' + (g.overall - g.base >= 0 ? '+' : '') + (g.overall - g.base) + ')' : '') + '</small></span><i class="ti ti-chevron-right"></i></button>';
    if (!_nd.view && day <= D.closeDay) h += '<div class="nx-ban o"><b>Cards open until ' + ndEsc(nxLongDate(D.close)) + '</b><span>Then they become view-only.</span></div>';
    return h;
  }
  if (day > S.days) {   // after the last day, waiting for the end-line check or the close date
    var E0 = ndEndStat();
    return h + '<div class="nx-card"><b>Graduation is waiting</b><span class="nx-dim">' + (E0.all - E0.done) + ' of ' + E0.all + ' departments still have end-line days to check. Graduation runs as soon as all are checked — or by itself on the close date, ' + ndEsc(nxLongDate(D.close)) + ', with what is done.</span>'
      + (over ? '<button type="button" class="nx-btn sm" onclick="ndGradOpen(\'end\')">See the end-line check</button>' : '') + '</div>';
  }
  if (day >= S.e1 && day <= S.eN) {
    var mineE = ndDeptDefs().filter(function (d) { return ndChecker(d.id) === me || ndLead(d.id) === me; });
    return h + '<div class="nx-ban b"><b>End-line · Days ' + S.e1 + '–' + S.eN + '</b><span>The baseline days again — the scores that decide graduation. ' + (mineE.length ? 'Check every end-line card of ' + ndEsc(mineE.map(function (d) { return d.name; }).join(', ')) + ' by Day ' + (S.rN - 2) + '.' : 'Fill every card; your lead checks them by Day ' + (S.rN - 2) + '.') + '</span></div>';
  }
  if (day < S.r1 || day > S.rN) return h;
  // readiness week
  var E = ndEndStat();
  if (_nd.view || ndFaOn()) h += '<div class="ng-rw"><small>READINESS WEEK · DAYS ' + S.r1 + '–' + S.rN + '</small><b>' + ndEsc(day >= S.rN ? 'Graduation day' : day === S.rN - 1 ? 'Final team review' : 'End-line verification') + '</b>' + ndGradPhaseStrip() + '</div>';
  var mine = E.list.filter(function (e) { return e.tot && (e.checker === me || e.lead === me); });
  if (!_nd.view && mine.length && !ndFaOn()) h += '<div class="nx-card p0 nx-list">' + mine.map(function (e) { return nxLi(e.ok ? 'ti-circle-check' : 'ti-list-check', e.ok ? 'g' : 'a', 'End-line check · ' + e.name, e.chk + ' of ' + e.tot + ' days checked' + (e.ok ? ' — done' : ' · finish by Day ' + (S.rN - 2)), "ndGradOpen('end','" + e.id + "')"); }).join('') + '</div>';
  if (over) {
    var left = E.list.filter(function (e) { return e.tot && !e.ok; });
    h += '<div class="nx-card p0"><div class="ng-row ng-pad"><b style="flex:1">End-line cards checked</b><b class="ng-k">' + E.done + ' of ' + E.all + ' departments</b></div><div class="ng-pad" style="padding-top:0"><span class="nx-bar"><span style="width:' + Math.round(100 * E.done / Math.max(1, E.all)) + '%"></span></span></div>'
      + left.map(function (e) { var nf = e.days.filter(function (x) { return x.st === 'none'; }).length, wa = ndGradRemindLink(e);
        return '<div class="ng-dl"><i class="ng-dot ' + (e.tot - e.chk > 2 ? 'r' : 'a') + '"></i><span><b>' + ndEsc(e.name) + '</b><small>' + (e.tot - e.chk) + ' end-line day' + (e.tot - e.chk > 1 ? 's' : '') + ' to check' + (nf ? ' · ' + nf + ' not filled' : '') + ' · ' + ndEsc((e.checker || e.lead) ? nxFirst(e.checker || e.lead) : 'no lead') + '</small></span>'
          + (wa ? '<a class="ng-lnk" href="' + ndEsc(wa) + '" target="_blank" rel="noopener"><i class="ti ti-send"></i>Remind</a>' : '<button type="button" class="ng-lnk" onclick="ndGradOpen(\'end\',\'' + e.id + '\')">Open</button>') + '</div>'; }).join('')
      + (E.done ? '<div class="ng-dl"><i class="ti ti-check" style="color:#0F5132"></i><span><small>' + E.done + ' department' + (E.done > 1 ? 's' : '') + ' fully checked — ' + ndEsc(E.list.filter(function (e) { return e.ok; }).map(function (e) { return e.name; }).join(', ')) + '</small></span></div>' : '')
      + '<div class="ng-pad" style="padding-top:4px"><button type="button" class="nx-btn sm ghost" onclick="ndGradOpen(\'end\')">See every department</button></div></div>';
    h += ndGradPreviewHTML();
    var fr = _nd.fac.finalReview;
    h += '<div class="nx-card"><b>Before Day ' + S.rN + '</b><ul class="ng-ul"><li>Ask the leads to finish the end-line checks by <b>Day ' + (S.rN - 2) + '</b>.</li><li>Close the open actions in the weakest departments.</li><li>Day ' + (S.rN - 1) + ': hold the final team review with all leads.' + (fr ? ' <b style="color:#0F5132">✓ Held ' + ndEsc(ndShortDate(String(fr.at).slice(0, 10))) + '</b>' : '') + '</li></ul>'
      + '<span class="nx-dim">Graduation runs by itself on Day ' + S.rN + ' when every end-line card is checked — or on the close date, ' + ndEsc(nxLongDate(D.close)) + ', with what is done.</span>'
      + (day >= S.rN - 2 || _nd.view ? '<button type="button" class="nx-btn sm" onclick="ndGradOpen(\'review\')">Final team review</button>' : '') + '</div>';
  } else if (!mine.length) h += '<div class="nx-card"><span class="nx-dim">Your leads are checking the end-line cards. Graduation is on Day ' + S.rN + ' (' + ndEsc(nxLongDate(D.last)) + ').</span></div>';
  return h;
}
// full screens: end-line check (lead / all), final team review, graduation result
function ndGradScreenHTML() {
  var s = _nd.screen;
  if (s === 'end') return ndGradEndHTML();
  if (s === 'review') return ndGradReviewHTML();
  if (s === 'admin') return ndGradAdminScreenHTML();
  return ndGradResultHTML();
}
function ndGradEndHTML() {
  var me = ndMob(), S = ndShape(), E = ndEndStat(ndCuStarted() && !!_nd.fac.graduation), one = _nd.endDept && E.list.find(function (e) { return e.id === _nd.endDept; });
  var list = one ? [one] : E.list.filter(function (e) { return e.tot; });
  var h = nxBk('ndGradClose()', one ? 'End-line check · ' + one.name : 'End-line check', one ? (one.lead === me || one.checker === me ? 'You check this department · finish by Day ' + (S.rN - 2) : 'Lead: ' + (ndName(one.lead) || '—')) : E.done + ' of ' + E.all + ' departments fully checked') + '<main class="nd-main">';
  list.forEach(function (e) {
    var can = !_nd.view && ndCanCheck(e.id, me), todo = e.days.filter(function (x) { return x.st !== 'chk'; }), done = e.days.filter(function (x) { return x.st === 'chk'; });
    h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">' + (one ? 'End-line days ' + (e.days[0] || {}).day + '–' + (e.days[e.days.length - 1] || {}).day : ndEsc(e.name)) + '</b><b class="ng-k">' + e.chk + ' of ' + e.tot + ' checked</b></div><span class="nx-bar"><span style="width:' + Math.round(100 * e.chk / Math.max(1, e.tot)) + '%"></span></span>'
      + (one ? '<span class="nx-dim">The end-line repeats the baseline days. Compare the cards your staff filled and settle the differences — the same check as every other day.</span>' : '') + '</div>';
    if (todo.length) h += '<div class="nx-card p0"><div class="ng-row ng-pad"><b>Still to check</b></div>' + todo.map(function (x) {
      var sub = x.st === 'none' ? 'No cards yet' : x.st === 'part' ? x.inn.done.length + ' of ' + x.inn.fillers.length + ' cards in · ' + x.inn.waiting.map(nxFirst).join(', ') + ' not yet' : x.inn.done.length + ' card' + (x.inn.done.length > 1 ? 's' : '') + ' in · ready to compare';
      var btn = can && x.st !== 'none' ? '<button type="button" class="ng-go" onclick="ndOpenDept(\'' + e.id + '\',' + x.day + ')">Check</button>' : x.st === 'none' || x.st === 'part' ? '' : '<button type="button" class="ng-go ghost" onclick="ndOpenDept(\'' + e.id + '\',' + x.day + ')">Open</button>';
      return '<div class="ng-dl"><span class="ng-day ' + (x.st === 'none' ? 'r' : 'a') + '"><small>DAY</small><b>' + (x.day > ND_GRAD.cuBase ? 'C' + (x.day - ND_GRAD.cuBase) : x.day) + '</b></span><span><b>' + ndEsc(sub) + '</b><small>' + ndEsc(ndShortDate(ndDateOf(x.day))) + '</small></span>' + btn + '</div>';
    }).join('') + '</div>';
    if (done.length) h += '<div class="nx-card"><b>Checked</b><div class="ng-chips">' + done.map(function (x) { return '<span class="ng-ok">' + (x.day > ND_GRAD.cuBase ? 'C' + (x.day - ND_GRAD.cuBase) : x.day) + (ndRes(e.id, x.day).chk ? ' ✓' : ' · one filler') + '</span>'; }).join('') + '</div>' + (done.some(function (x) { return !ndRes(e.id, x.day).chk; }) ? '<span class="nx-dim">“One filler”: only one person fills this department, so her card counts as checked.</span>' : '') + '</div>';
  });
  var D = ndGradDates();
  h += '<div class="nx-ban o"><b>Not checked by the close date?</b><span>Unchecked days count as filled on ' + ndEsc(nxLongDate(D.close)) + ', but the department shows “end-line not verified” on the graduation result.</span></div>';
  return h + '</main>';
}
function ndGradBars(map, base, mark, names, max) {
  var keys = Object.keys(map).sort(function (a, b) { return map[a] - map[b]; }), shown = keys.slice(0, max || 99), more = keys.length - shown.length;
  return '<div class="ng-bars">' + shown.map(function (k) { var v = map[k], low = v < mark;
    return '<div class="ng-bar"><span>' + ndEsc(names ? names(k) : k) + '</span><i><em class="' + (low ? 'r' : '') + '" style="width:' + v + '%"></em><u style="left:' + mark + '%"></u></i><b class="' + (low ? 'r' : '') + '">' + v + '%</b></div>'; }).join('')
    + (more > 0 ? '<small class="nx-dim">+ ' + more + ' more, all ' + Math.min.apply(null, keys.slice(shown.length).map(function (k) { return map[k]; })) + '% or above</small>' : '') + '</div>';
}
function ndGradAocChips(byAoc, mark) { return '<div class="ng-aoc">' + Object.keys(byAoc).sort().map(function (a) { return '<span class="' + (byAoc[a] < mark ? 'r' : 'g') + '"><b>' + a + '</b> ' + byAoc[a] + '</span>'; }).join('') + '</div>'; }
function ndGradReviewHTML() {
  var S = ndShape(), sc = ndGradScores(), C = ndCrit(), E = ndEndStat(), me = ndMob(), fr = _nd.fac.finalReview, R = ndGradRule(sc, true);
  var gain = sc.overall !== null && sc.base !== null ? sc.overall - sc.base : null;
  var h = nxBk('ndGradClose()', 'Final team review · Day ' + (S.rN - 1), (E.complete ? 'All ' + E.all + ' departments checked' : E.done + ' of ' + E.all + ' departments checked') + ' · graduation on Day ' + S.rN) + '<main class="nd-main">';
  h += '<div class="nx-card ng-3"><div><small>Baseline</small><b>' + (sc.base === null ? '–' : sc.base + '%') + '</b></div><div><small>End-line</small><b class="t">' + (sc.overall === null ? '–' : sc.overall + '%') + '</b></div><div><small>Gain</small><b class="g">' + (gain === null ? '–' : (gain >= 0 ? '+' : '') + gain) + '</b></div></div>';
  h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">Departments</b><small class="nx-dim">pass ' + C.dept + '%</small></div>' + ndGradBars(sc.byDept, sc.baseDept, C.dept, function (k) { return ndDeptDef(k).name; }, 5) + '</div>';
  h += '<div class="nx-card"><b>Areas of Concern</b>' + ndGradAocChips(sc.byAoc, C.aoc) + (R.stdFails.length ? '<span class="nx-dim">Standards below ' + C.std + '%: <b>' + R.stdFails.map(function (s) { return s + ' ' + sc.byStd[s] + '%'; }).join(', ') + '</b></span>' : '<span class="nx-dim">Every Standard at ' + C.std + '% or more.</span>') + '</div>';
  var talk = [];
  Object.keys(sc.openByDept).sort(function (a, b) { return sc.openByDept[b] - sc.openByDept[a]; }).slice(0, 2).forEach(function (d) { talk.push(ndDeptDef(d).name + ' — ' + sc.openByDept[d] + ' open action' + (sc.openByDept[d] > 1 ? 's' : '')); });
  R.stdFails.slice(0, 2).forEach(function (s) { talk.push(s + ' — ' + String((_nd.cl.stds || {})[s] || 'Standard below ' + C.std + '%').slice(0, 70)); });
  R.deptFails.forEach(function (d) { if (!sc.openByDept[d]) talk.push(ndDeptDef(d).name + ' — ' + sc.byDept[d] + '%, below ' + C.dept + '%'); });
  h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">Talk through today</b><small class="nx-dim">from open gaps</small></div>' + (talk.length ? '<ol class="ng-ul">' + talk.slice(0, 4).map(function (t) { return '<li>' + ndEsc(t) + '</li>'; }).join('') + '</ol>' : '<span class="nx-dim">No open gaps — well done.</span>') + '</div>';
  var txt = 'NQAS | FAST final team review — ' + (_nd.fac.name || '') + ': end-line ' + (sc.overall === null ? '–' : sc.overall + '%') + (sc.base !== null ? ' (baseline ' + sc.base + '%)' : '') + '. ' + (R.deptFails.length ? 'Below ' + C.dept + '%: ' + R.deptFails.map(function (d) { return ndDeptDef(d).name + ' ' + sc.byDept[d] + '%'; }).join(', ') + '. ' : '') + 'Graduation on Day ' + S.rN + '.';
  h += '<a class="nx-btn ghost ng-wide" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" target="_blank" rel="noopener"><i class="ti ti-send"></i> Share summary with the team</a>';
  if (!_nd.view && ndIsInCharge(me)) h += fr ? '<div class="nx-ban g"><b>Review held · ' + ndEsc(ndShortDate(String(fr.at).slice(0, 10))) + '</b><span>' + ndEsc(fr.byName || ndName(fr.by)) + '</span></div>'
    : '<button type="button" class="nx-btn ng-wide" onclick="ndGradReviewHeld()">Mark review held</button><span class="nx-dim" style="text-align:center;display:block">Optional. The result on Day ' + S.rN + ' uses the scores as they are then.</span>';
  return h + '</main>';
}
async function ndGradReviewHeld() {
  var rec = { at: new Date().toISOString(), by: ndMob(), byName: String(ndName(ndMob())).slice(0, 80) };
  try { await db.ref(scFacilityPath(_nd.code) + '/finalReview').set(rec); _nd.fac.finalReview = rec; ndToast('Final team review marked as held.', 'ok'); ndRender(); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}
function ndGradResultHTML() {
  var g = _nd.fac.graduation; if (!g) { _nd.screen = null; return ndTodayHTML(); }
  var r = ND_GRAD_RES[g.result] || ND_GRAD_RES.incomplete, C = g.criteria || ndCrit(), dm = C.dept || 70, D = ndGradDates(), names = function (k) { return ndDeptDef(k).name; };
  var gain = g.base != null ? g.overall - g.base : null, fails = (g.deptFails || []).length + (g.aocFails || []).length;
  var line = g.result === 'ready' ? g.overall + '% overall — every department, Area of Concern and Standard at its mark.' : g.result === 'almost' ? g.overall + '% overall — above ' + C.overall + '%. ' + (fails ? fails + ' department' + ((g.deptFails || []).length === 1 && !(g.aocFails || []).length ? '' : 's / Areas of Concern') + ' below ' + dm + '%.' : 'A Standard is below ' + (C.stdDefault || 50) + '%.')
    : g.result === 'notyet' ? g.overall + '% overall — needs ' + C.overall + '%.' : 'The end-line was not filled for every department.';
  var h = nxBk('ndGradClose()', 'Graduation result', (_nd.fac.name || '') + ' · Day ' + (g.day || '') + ' · ' + ndShortDate(String(g.at || '').slice(0, 10))) + '<main class="nd-main">';
  h += '<div class="nx-card ng-big ' + r.c + '"><span class="ng-ic"><i class="ti ' + r.ic + '"></i></span><small>GRADUATION RESULT' + (g.round ? ' · AFTER CATCH-UP' : '') + '</small><b>' + ndEsc(r.t) + '</b><span>' + ndEsc(line) + '</span>'
    + '<div class="ng-3"><div><small>Baseline</small><b>' + (g.base == null ? '–' : g.base + '%') + '</b></div><div><small>End-line</small><b class="t">' + g.overall + '%</b></div><div><small>Gain</small><b class="g">' + (gain === null ? '–' : (gain >= 0 ? '+' : '') + gain) + '</b></div></div>'
    + (g.override ? '<small class="nx-dim">Result set by HealSol: ' + ndEsc(g.reason || '') + '</small>' : '') + '</div>';
  var row = function (ok, t, v) { return '<li><i class="ti ' + (ok ? 'ti-check g' : 'ti-x r') + '"></i><span>' + ndEsc(t) + '</span><b class="' + (ok ? '' : 'r') + '">' + ndEsc(v) + '</b></li>'; };
  var low = function (list, map) { return (list || []).map(function (k) { return (names && map === g.byDept ? names(k) : k) + ' ' + map[k] + '%'; }).slice(0, 2).join(', '); };
  var allD = Object.keys(g.byDept || {}).length, nv = (g.notVerified || []).length;
  h += '<div class="nx-card p0"><div class="ng-row ng-pad"><b>NQAS criteria</b></div><ul class="ng-crit">'
    + row(g.overall >= C.overall, 'Overall at least ' + C.overall + '%', g.overall + '%')
    + row(!(g.deptFails || []).length, 'Every department at least ' + dm + '%', (g.deptFails || []).length ? low(g.deptFails, g.byDept) : allD + ' / ' + allD)
    + row(!(g.aocFails || []).length, 'Every Area of Concern at least ' + C.aoc + '%', (g.aocFails || []).length ? low(g.aocFails, g.byAoc) : '✓')
    + row(!(g.stdFails || []).length, 'Every Standard at least ' + (C.stdDefault || 50) + '%', (g.stdFails || []).length ? low(g.stdFails, g.byStd) : '✓')
    + row(g.endlineDone && !nv, 'End-line filled and checked', g.endlineDone ? (nv ? nv + ' not verified' : 'all') : 'not filled') + '</ul></div>';
  if (g.progs) h += '<div class="nx-card"><b>' + Object.keys(g.progs).join(' · ') + '</b><span class="nx-dim">shown beside NQAS · each department at least ' + dm + '%</span><div class="ng-progs">' + Object.keys(g.progs).map(function (p) { var x = g.progs[p];
    return '<div class="' + (x.ok ? 'g' : 'r') + '"><b>' + ndEsc(p) + '</b><small>' + Object.keys(x.byDept).map(function (d) { return ndEsc(names(d)) + ' ' + x.byDept[d] + '%'; }).join(' · ') + '</small><em>' + (x.ok ? 'Ready' : 'Not yet') + '</em></div>'; }).join('') + '</div></div>';
  h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">Departments</b><small class="nx-dim">end-line · pass ' + dm + '%</small></div>' + ndGradBars(g.byDept || {}, null, dm, names) + '</div>';
  var cu = ndCu(), next = [];
  if (D && ndToday() <= D.close) next.push('Cards stay open until the close date, <b>' + ndEsc(nxLongDate(D.close)) + '</b>, then become view-only.');
  if (g.result !== 'ready' && !cu) next.push('HealSol may offer a <b>' + ND_GRAD.cuDays + '-day catch-up</b> on the weakest departments, then re-check.');
  if (cu && !cu.done) next.push('Catch-up on <b>' + ndEsc(ndCuDepts().map(names).join(', ')) + '</b> from ' + ndEsc(nxLongDate(cu.start)) + ' to ' + ndEsc(nxLongDate(cu.end)) + '; graduation re-runs at the end.');
  if (g.result === 'ready') next.push('Your District can now apply for <b>NQAS certification</b> (NHSRC).');
  next.push('Staff who earned it can get their certificate in <b>Me</b>.');
  h += '<div class="nx-card"><b>What happens next</b><ul class="ng-ul">' + next.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></div>';
  var txt = (_nd.fac.name || '') + ' completed the NQAS | FAST programme: ' + r.t + ' · ' + g.overall + '%' + (g.base != null ? ' (baseline ' + g.base + '%)' : '') + '.';
  h += '<a class="nx-btn ghost ng-wide" href="https://wa.me/?text=' + encodeURIComponent(txt) + '" target="_blank" rel="noopener"><i class="ti ti-send"></i> Share the result on WhatsApp</a>';
  return h + '</main>';
}

// ═══ HealSol / District: the facility's programme block (view mode) ═══
function ndGradIsHS() { return typeof appMode !== 'undefined' && appMode === 'sc-admin'; }
function ndGradCanRecords() { if (ndGradIsHS()) return true; try { return typeof appMode !== 'undefined' && appMode === 'sc-district' && !(typeof _scSup !== 'undefined' && _scSup && _scSup.scope === 'block'); } catch (e) { return false; } }
function ndGradAdminHTML() {   // short block at the top of the facility view
  if (!_nd.view) return '';
  var strip = typeof hsFacStripHTML === 'function' ? '<div class="ng-hsstrip">' + hsFacStripHTML(_nd.code) + '</div>' : '';
  if (!_nd.fac.startDate) return strip;
  var g = _nd.fac.graduation, r = g ? ND_GRAD_RES[g.result] : null, D = ndGradDates(), cu = ndCu();
  var st = g ? r.t + ' · ' + g.overall + '%' : ndProgDay() > ndShape().days ? 'Waiting for graduation' : 'Day ' + Math.max(0, Math.min(ndProgDay(), ndShape().days)) + ' of ' + ndShape().days;
  return strip + '<button type="button" class="nx-card ng-res ' + (r ? r.c : 'b') + '" onclick="ndGradOpen(\'admin\')"><span class="ng-ic"><i class="ti ti-timeline"></i></span><span style="flex:1;min-width:0"><small>Programme · ' + ndShape().days + ' days · close date ' + ndEsc(ndShortDate(D.close)) + '</small><b>' + ndEsc(st) + '</b><small>'
    + (cu ? 'Catch-up ' + (cu.done ? 'done' : 'on') + ' · ' : '') + 'Graduation, catch-up, certification records, certificates</small></span><i class="ti ti-chevron-right"></i></button>';
}
var _ndCerts = { code: '', list: null };
async function ndGradLoadCerts() { if (_ndCerts.code === _nd.code && _ndCerts.list) return; _ndCerts = { code: _nd.code, list: {} }; try { _ndCerts.list = (await fbGet('sc_certs/' + _nd.code)) || {}; } catch (e) { _ndCerts.list = {}; } if (_nd.screen === 'admin') ndRender(); }
function ndGradAdminScreenHTML() {
  var S = ndShape(), g = _nd.fac.graduation, D = ndGradDates(), cu = ndCu(), hs = ndGradIsHS(), names = function (k) { return ndDeptDef(k).name; };
  var h = nxBk('ndGradClose()', 'Programme · ' + S.days + ' days', 'Started ' + ndShortDate(_nd.fac.startDate) + ' · Day ' + S.days + ' on ' + ndShortDate(D.last) + ' · close date ' + ndShortDate(D.close)) + '<main class="nd-main">';
  h += '<div class="nx-card"><div class="ng-tl"><span style="flex:' + S.base + '">Baseline 1–' + S.bN + '</span><span style="flex:' + S.implWeeks * 7 + '">Implementation · ' + S.implWeeks + ' weeks · ' + S.i1 + '–' + S.iN + '</span><span style="flex:' + S.end + '">End-line ' + S.e1 + '–' + S.eN + '</span><span class="on" style="flex:' + S.ready + '">' + S.r1 + '–' + S.rN + '</span></div></div>';
  // graduation
  if (g) {
    var r = ND_GRAD_RES[g.result] || ND_GRAD_RES.incomplete, below = [].concat((g.deptFails || []).map(function (d) { return names(d) + ' ' + g.byDept[d]; }), (g.aocFails || []).map(function (a) { return a + ' ' + g.byAoc[a]; }), (g.stdFails || []).map(function (s) { return s + ' ' + g.byStd[s]; }));
    h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">Graduation</b>' + (hs ? '<button type="button" class="ng-go ghost" onclick="ndGradRerun(false)">Run again…</button><button type="button" class="ng-go ghost" onclick="ndGradRerun(true)">Change result…</button>' : '') + '</div>'
      + '<span class="nx-dim">' + (g.round ? 'Re-run after catch-up' : 'Ran on Day ' + (g.day || '')) + ' · ' + ndEsc(String(g.at || '').slice(0, 16).replace('T', ' ')) + ' · ' + ndEsc(g.by || '') + (g.byRole ? ' (' + ndEsc(g.byRole) + ')' : '') + (g.reason ? ' · “' + ndEsc(g.reason) + '”' : '') + '</span>'
      + '<div class="ng-kpis"><div class="' + r.c + '"><small>Result</small><b>' + ndEsc(r.t) + '</b></div><div><small>Overall</small><b>' + (g.base != null ? g.base + ' → ' : '') + g.overall + '%</b></div><div><small>Below the mark</small><b>' + ndEsc(below.slice(0, 4).join(' · ') || 'none') + '</b></div><div><small>End-line</small><b>' + (g.endlineDone ? 'filled' : 'not filled') + ((g.notVerified || []).length ? ' · ' + g.notVerified.length + ' not verified' : ' · checked') + '</b></div></div>'
      + '<div class="ng-tbl"><table><thead><tr><th>Department</th><th>End-line</th><th>Also counts for</th></tr></thead><tbody>' + Object.keys(g.byDept || {}).sort(function (a, b) { return g.byDept[a] - g.byDept[b]; }).map(function (d) {
        return '<tr><td>' + ndEsc(names(d)) + '</td><td class="' + (g.byDept[d] < (g.criteria || {}).dept ? 'r' : '') + '">' + g.byDept[d] + '%</td><td>' + ndEsc(ndDeptDef(d).prog || '—') + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
  } else h += '<div class="nx-card"><b>Graduation</b><span class="nx-dim">Runs by itself on Day ' + S.days + ' (' + ndEsc(nxLongDate(D.last)) + ') when every end-line day is checked, or on the close date with what is done.</span>' + ndGradPreviewHTML().replace(/^<div class="nx-card">/, '<div>') + '</div>';
  // catch-up
  if (g && hs) {
    var weak = Object.keys(g.byDept || {}).sort(function (a, b) { return g.byDept[a] - g.byDept[b]; }).slice(0, 3);
    h += '<div class="nx-card"><div class="ng-row"><b style="flex:1">Catch-up</b>' + (!cu ? '<button type="button" class="ng-go" onclick="ndGradCuOffer()">Offer catch-up…</button>' : cu.done ? '' : (!cu.paid && !cu.free ? '<button type="button" class="ng-go ghost" onclick="ndGradCuPaid()">Mark paid</button>' : '')) + '</div>'
      + (cu ? '<span class="nx-dim">' + ndEsc(ndCuDepts().map(names).join(', ')) + ' · ' + ndEsc(nxLongDate(cu.start)) + ' – ' + ndEsc(nxLongDate(cu.end)) + ' · ' + (cu.free ? 'free' : cu.paid ? 'paid' : 'fee not marked yet') + (cu.done ? ' · done, result ' + ndEsc((ND_GRAD_RES[cu.result] || {}).t || '') : '') + '</span>'
        : '<span class="nx-dim">' + ND_GRAD.cuDays + ' days on the weakest departments: weeks 1–3 their checkpoints, week 4 their end-line again; graduation re-runs at the end.</span><div class="ng-chips">' + weak.map(function (d) { return '<span class="' + (g.byDept[d] < 70 ? 'ng-bad' : 'ng-mid') + '">' + ndEsc(names(d)) + ' ' + g.byDept[d] + '%</span>'; }).join('') + '</div>') + '</div>';
  }
  // certification records
  var recs = [['nhsrc', 'NQAS (NHSRC)']]; Object.keys(ndProgs(g ? g.byDept || {} : {})).forEach(function (p) { recs.push([p.toLowerCase(), p]); });
  if (_nd.cfg.id === 'chc' && recs.length === 1) { recs.push(['laqshya', 'LaQshya'], ['musqan', 'MusQan']); }
  var can = ndGradCanRecords();
  h += '<div class="nx-card p0"><div class="ng-row ng-pad"><b>Certification records</b></div>' + recs.map(function (x) { var rec = _nd.fac[x[0]] || {}, st = (ND_CERT_ST.find(function (s) { return s[0] === rec.status; }) || [0, 'Not applied yet'])[1];
    return '<div class="ng-dl"><span><b>' + ndEsc(x[1]) + '</b><small>' + ndEsc(st + (rec.appliedOn ? ' · applied ' + ndShortDate(rec.appliedOn) : '') + (rec.certifiedOn ? ' · certified ' + ndShortDate(rec.certifiedOn) : '') + (rec.certNo ? ' · ' + rec.certNo : '')) + '</small></span>' + (can ? '<button type="button" class="ng-go ghost" onclick="ndGradRecEdit(\'' + x[0] + '\',\'' + ndEsc(x[1]) + '\')">Update</button>' : '') + '</div>'; }).join('')
    + '<div class="ng-pad nx-dim" style="font-size:12px">District Admins can update these too.</div></div>';
  // certificates
  ndGradLoadCerts();
  var L = _ndCerts.code === _nd.code ? _ndCerts.list : null, staffN = Object.keys(ndStaff()).length;
  h += '<div class="nx-card p0"><div class="ng-row ng-pad"><b style="flex:1">Certificates</b><small class="nx-dim">' + (L ? Object.keys(L).length + ' issued · ' + staffN + ' staff' : 'Loading…') + '</small></div>'
    + (L && Object.keys(L).length ? Object.keys(L).map(function (m) { var c = L[m]; return '<div class="ng-dl"><span><b>' + ndEsc(c.name) + '</b><small>' + ndEsc(c.role + (c.lead ? ' · lead' : '') + ' · ' + c.certId) + '</small></span><span class="nx-chip g">' + ndEsc(c.grade) + '</span></div>'; }).join('') : L ? '<div class="ng-pad nx-dim">None yet — staff get theirs in Me once the facility has graduated.</div>' : '') + '</div>';
  return h + '</main>';
}
async function ndGradRerun(change) {
  if (!ndGradIsHS()) return;
  var f = [{ key: 'why', label: change ? 'Why are you changing the result?' : 'Why are you running graduation again? It uses the scores as they are now.', type: 'textarea', maxLength: 300, required: true, value: '' }];
  if (change) f.unshift({ key: 'res', label: 'New result', type: 'select', value: (_nd.fac.graduation || {}).result || 'ready', options: Object.keys(ND_GRAD_RES).map(function (k) { return { value: k, label: ND_GRAD_RES[k].t }; }) });
  var v = null; try { v = await scDialog({ title: change ? 'Change the graduation result' : 'Run graduation again', icon: '🎓', fields: f, okLabel: change ? 'Change result' : 'Run again', validate: function (x) { return String(x.why || '').trim() ? '' : 'Write the reason.'; } }); } catch (e) { v = null; }
  if (!v) return;
  var sc = ndGradScores(), E = ndEndStat(), data = { code: _nd.code, reason: String(v.why).trim().slice(0, 300), complete: E.complete, endlineDone: E.endlineDone, verified: E.complete, notVerified: E.notVer, openGaps: sc.openGaps, scores: { overall: sc.overall, base: sc.base, byAoc: sc.byAoc, byStd: sc.byStd, byDept: sc.byDept } };
  if (change && v.res) data.result = v.res;
  try { var r = await nfCall('graduateFacility', data);
    if (r && r.graduation) { _nd.fac.graduation = r.graduation; ndToast('Saved: ' + ND_GRAD_RES[r.graduation.result].t + ' · ' + r.graduation.overall + '%', 'ok'); ndRender(); } } catch (e) { ndToast(nfErrText(e), 'err'); }
}
async function ndGradCuOffer() {
  var g = _nd.fac.graduation; if (!ndGradIsHS() || !g) return;
  var ids = Object.keys(g.byDept || {}).sort(function (a, b) { return g.byDept[a] - g.byDept[b]; }), weak = ids.slice(0, 3);
  var v = null; try { v = await scDialog({ title: 'Offer a catch-up', icon: '🔁', message: ND_GRAD.cuDays + ' days: weeks 1–3 the chosen departments\' checkpoints, week 4 their end-line again; graduation re-runs at the end.', fields: [
    { key: 'depts', label: 'Departments (the weakest are ticked)', type: 'checklist', value: weak, options: ids.map(function (d) { return { value: d, label: ndDeptDef(d).name + ' · ' + g.byDept[d] + '%' }; }) },
    { key: 'start', label: 'Starts on', type: 'date', value: ndAddDays(ndToday(), 1), required: true },
    { key: 'fee', label: 'Fee', type: 'select', value: 'paid', options: [{ value: 'paid', label: 'Paid catch-up (mark paid later)' }, { value: 'free', label: 'Free of charge' }] }], okLabel: 'Offer catch-up',
    validate: function (x) { return !(x.depts || []).length ? 'Tick at least one department.' : !/^\d{4}-\d{2}-\d{2}$/.test(x.start || '') ? 'Choose the start date.' : ''; } }); } catch (e) { v = null; }
  if (!v) return;
  var rec = { on: true, round: (+g.round || 0) + 1, start: v.start, end: ndAddDays(v.start, ND_GRAD.cuDays - 1), depts: v.depts.slice(0, 6), free: v.fee === 'free', at: new Date().toISOString(), by: 'HealSol' };
  try { await db.ref(scFacilityPath(_nd.code) + '/catchup').set(rec); _nd.fac.catchup = rec; _ndCuPlan = {}; ndToast('Catch-up offered — ' + ndShortDate(rec.start) + ' to ' + ndShortDate(rec.end) + '.', 'ok'); ndRender(); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}
async function ndGradCuPaid() { if (!ndGradIsHS() || !ndCu()) return; if (!(await showConfirm('Mark the catch-up fee as paid?', '💳', 'Catch-up fee', 'Mark paid', 'var(--teal)'))) return; try { await db.ref(scFacilityPath(_nd.code) + '/catchup/paid').set(true); _nd.fac.catchup.paid = true; ndRender(); } catch (e) { ndToast(nfErrText(e), 'err'); } }
async function ndGradRecEdit(key, label) {
  var rec = _nd.fac[key] || {}, v = null;
  try { v = await scDialog({ title: label, icon: '🏅', fields: [
    { key: 'status', label: 'Status', type: 'select', value: rec.status || 'ready', options: ND_CERT_ST.map(function (s) { return { value: s[0], label: s[1] }; }) },
    { key: 'appliedOn', label: 'Applied on', type: 'date', value: rec.appliedOn || '' }, { key: 'certifiedOn', label: 'Certified on', type: 'date', value: rec.certifiedOn || '' },
    { key: 'certNo', label: 'Certificate number', value: rec.certNo || '', maxLength: 40 }, { key: 'note', label: 'Note', type: 'textarea', value: rec.note || '', maxLength: 300 }], okLabel: 'Save' }); } catch (e) { v = null; }
  if (!v) return;
  var out = { status: v.status, at: new Date().toISOString() };
  ['appliedOn', 'certifiedOn'].forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(v[k] || '')) out[k] = v[k]; });
  if (String(v.certNo || '').trim()) out.certNo = String(v.certNo).trim().slice(0, 40); if (String(v.note || '').trim()) out.note = String(v.note).trim().slice(0, 300);
  try { await db.ref(scFacilityPath(_nd.code) + '/' + key).set(out); _nd.fac[key] = out; ndToast(label + ' saved.', 'ok'); ndRender(); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}

// ═══ CERTIFICATES (department core) — earned; the server (issueCertificate) checks the same conditions ═══
//   Staff who fill: every baseline card day done · ≥ 80% of their card days done · ≥ half of the done cards checked.
//   Leads (do not fill): ≥ 80% of their department-days checked · every end-line day checked.  From the last day, once graduated.
var _ndCert = { code: '', mob: '', rec: null, loaded: false };
async function ndCertLoad() { var me = ndMob(); if (_ndCert.loaded && _ndCert.code === _nd.code && _ndCert.mob === me) return; _ndCert = { code: _nd.code, mob: me, rec: null, loaded: false }; try { _ndCert.rec = await fbGet('sc_certs/' + _nd.code + '/' + me); } catch (e) {} _ndCert.loaded = true; if (_nd && _nd.tab === 'me' && !_nd.screen) ndRender(); }
function ndCertEval() {
  var me = ndMob(), S = ndShape(), fill = ndDeptDefs().filter(function (d) { return ndFills(d.id, me); }).map(function (d) { return d.id; });
  var lead = ndDeptDefs().filter(function (d) { return ndLead(d.id) === me || ndChecker(d.id) === me; }).map(function (d) { return d.id; });
  var doneOf = function (d, n) { var c = ndPc(d, n), out = 0; Object.keys(c).forEach(function (m) { if (c[m] && c[m].done && !c[m].absent) out++; }); return out; };
  var isChk = function (d, n) { return !!ndRes(d, n).chk || doneOf(d, n) === 1; };
  var o = { fill: fill, lead: lead, exp: 0, expBase: 0, done: 0, base: 0, chk: 0, toCheck: 0, lChk: 0, endPairs: 0, endChk: 0 };
  Object.keys(_nd.pcards || {}).forEach(function (d) { if (fill.indexOf(d) >= 0 || !(_nd.pcards[d])) return; Object.keys(_nd.pcards[d]).forEach(function (k) { if (((_nd.pcards[d][k] || {})[me] || {}).done && fill.indexOf(d) < 0) fill.push(d); }); });
  fill.forEach(function (d) { for (var n = 1; n <= S.eN; n++) { if (ndMyIds(d, n, me).length) { o.exp++; if (n <= S.bN) o.expBase++; } var c = ndPc(d, n)[me] || {}; if (c.done && !c.absent) { o.done++; if (n <= S.bN) o.base++; if (isChk(d, n)) o.chk++; } } });
  lead.forEach(function (d) { for (var n = 1; n <= S.eN; n++) { if (!doneOf(d, n)) continue; o.toCheck++; var ck = isChk(d, n); if (ck) o.lChk++; if (n >= S.e1) { o.endPairs++; if (ck) o.endChk++; } } });
  o.role = o.done > 0 || (fill.length && !lead.length) ? 'fill' : lead.length ? 'lead' : 'none';
  o.exp = Math.max(o.exp, o.done ? 1 : 0);
  if (o.role === 'fill') { o.needDone = Math.ceil(o.exp * 0.8); o.needChk = Math.max(1, Math.ceil(o.done * 0.5)); o.items = [['Baseline card days done', 'every baseline day in your departments', o.base >= o.expBase, o.base + ' / ' + o.expBase], ['Day cards done', 'at least 80% of your ' + o.exp + ' card days', o.done >= o.needDone && o.done > 0, o.done + ' / ' + o.needDone], ['Checked by your lead', 'at least half of your done cards', o.chk >= o.needChk, o.chk + ' / ' + o.needChk]]; }
  else if (o.role === 'lead') { o.need = Math.max(1, Math.ceil(o.toCheck * 0.8)); o.items = [['Department days checked', 'at least 80% of the days with cards', o.lChk >= o.need, o.lChk + ' / ' + o.need], ['End-line days checked', 'every end-line day', o.endChk >= o.endPairs, o.endChk + ' / ' + o.endPairs]]; }
  else o.items = [['You fill or lead a department', 'the in-charge sets this in Set-up', false, '—']];
  var D = ndGradDates(); o.dayOk = !!D && ndProgDay() >= D.lastDay; o.grad = !!_nd.fac.graduation;
  o.items.push(['Facility graduated', 'from Day ' + ndShape().days + ' · any result', o.grad, o.grad ? ndShortDate(String(_nd.fac.graduation.at || '').slice(0, 10)) : D ? ndShortDate(D.last) : '—']);
  o.ok = o.items.every(function (x) { return x[2]; });
  return o;
}
function ndCertPro() { var s = _nd.fac.subscriptionStatus || 'contract'; return s === 'paid' || s === 'contract'; }
function ndCertCardHTML() {
  var rec = _ndCert.loaded && _ndCert.code === _nd.code ? _ndCert.rec : null; if (!_ndCert.loaded) ndCertLoad();
  var head = function (sub, cls) { return '<div class="ng-ch"><span class="ng-ci"><i class="ti ti-certificate"></i></span><span style="flex:1"><b>My NQAS | FAST certificate</b><small class="' + (cls || '') + '">' + ndEsc(sub) + '</small></span></div>'; };
  if (rec) return '<div class="nx-card p0 ng-cert">' + head('You earned it · ' + rec.certId, 'g') + '<div class="ng-pad"><div class="ng-row"><span class="nx-dim" style="flex:1">Grade (facility ' + rec.facPct + '%)</span><b>' + ndEsc(rec.grade) + '</b></div>'
    + '<div class="ng-2"><button type="button" class="nx-btn" onclick="nfShowCert(_ndCert.rec)">View certificate</button><button type="button" class="nx-btn ghost" onclick="nfCertDownload(_ndCert.rec,this)">Download PDF</button></div></div></div>';
  if (!ndCertPro()) return '<div class="nx-card p0 ng-cert">' + head('Certificates are for facilities with full access (PRO).') + '</div>';
  var E = ndCertEval(), sub = E.ok ? 'Earned — ready to get' : !E.dayOk ? 'Unlocks on Day ' + ndShape().days + ' — earn it:' : 'Not earned yet — complete what is still open';
  return '<div class="nx-card p0 ng-cert">' + head(sub, E.ok ? 'g' : '') + '<ul class="ng-crit">' + E.items.map(function (x) { return '<li><i class="ti ' + (x[2] ? 'ti-check g' : 'ti-hourglass a') + '"></i><span>' + ndEsc(x[0]) + '<small>' + ndEsc(x[1]) + '</small></span><b>' + ndEsc(x[3]) + '</b></li>'; }).join('') + '</ul>'
    + (E.ok ? '<div class="ng-pad"><div class="ng-row"><span class="nx-dim" style="flex:1">Grade (facility end-line ' + _nd.fac.graduation.overall + '%)</span><b>' + nfCertGradeOf(_nd.fac.graduation.overall) + '</b></div><button type="button" class="nx-btn ng-wide" onclick="ndClaimCert(this)">Get my certificate</button></div>'
      : '<div class="ng-pad nx-dim" style="font-size:12px">' + (E.role === 'lead' ? 'Leads don’t fill cards, so your conditions come from checking.' : 'Grade comes from the facility’s graduation score: Distinction 80%+, Merit 70–79%.') + '</div>') + '</div>';
}
async function ndClaimCert(btn) {
  var old = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
  try {
    var E = ndCertEval(), me = ndMob(), ids = E.role === 'lead' ? E.lead : E.fill, S = ndShape();
    var R = nfDeptReadiness(_nd.cl.items, ndLatest(), { pass: 70, depts: ids }), B = nfDeptReadiness(_nd.cl.items, ndLatest(S.bN), { pass: 70, depts: ids });
    var prog = (_nd.cfg.programmes || []).find(function (p) { return p.id === _nd.fac.progId; });
    var r = await nfCall('issueCertificate', { code: _nd.code, base: typeof nfCertBase === 'function' ? nfCertBase() : '', expected: { fill: E.exp, base: E.expBase },
      scores: { staffPct: R.overall === null ? _nd.fac.graduation.overall : R.overall, staffBase: B.n ? B.overall : null }, depts: ids.map(function (d) { return ndDeptDef(d).name; }).join(', ').slice(0, 160),
      roleLabel: nxRoleOf(me), packageLabel: prog ? String(prog.label).replace(/\s*\(\d+ days\)\s*$/, '') : (_nd.cfg.name || '') });
    _ndCert = { code: _nd.code, mob: me, rec: r.cert, loaded: true }; ndRender(); nfShowCert(r.cert);
  } catch (e) { ndToast(nfErrText(e), 'err'); }
  finally { if (btn && document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = old; } }
}
