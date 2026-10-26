// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE — SCREENS (approved design, HealSol 17 Oct 2026). Same look as the SC staff app, for every cadre of
// a UPHC (later PHC / CHC). Loaded after dept/review.js, which holds the flow (cards, comparison, actions).
//   Staff:   Today · Cards (Daily card / Timeline) · ▶ (today's card) · Progress · Me
//   Jobs:    shown only to people who have them, from Today ("Your review jobs") and the Me menu —
//            Compare the cards (checker) · Decide & assign (department lead, in-charge) · How to fix (Facility Supervisor)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

var ND_SNAME = ['Not met', 'Partial', 'Met'];
var ND_CAUSES = [{ k: 'store', t: 'Needs district / store' }, { k: 'budget', t: 'Budget needed' }, { k: 'staff', t: 'Staff shortage' }, { k: 'process', t: 'Process change' }, { k: 'train', t: 'Training' }];
var ND_WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── small helpers ──
function nxRing(pct, size, stroke, col, track) {
  var r = (size - stroke) / 2, c = 2 * Math.PI * r, a = Math.max(0, Math.min(100, pct || 0)) / 100 * c;
  return '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size + '" height="' + size + '" aria-hidden="true"><circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="' + track + '" stroke-width="' + stroke + '" fill="none"/>'
    + '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" stroke="' + col + '" stroke-width="' + stroke + '" fill="none" stroke-linecap="round" stroke-dasharray="' + a + ' ' + c + '" transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/></svg>';
}
function nxFirst(mob) { var p = String(ndName(mob) || '').split(/\s+/).filter(Boolean); if (p.length > 1 && /^(dr|mr|mrs|ms|smt|shri)\.?$/i.test(p[0])) return p[0] + ' ' + p[1]; return p[0] || ndName(mob); }   // "Dr Jain", not "Dr"
function nxRoleOf(mob) { return ndRoleLabel(ndRole(mob) || _nd.cfg.inCharge); }
function nxPkg() { var p = (_nd.cfg.programmes || []).find(function (x) { return x.id === _nd.fac.progId; }); var m = (p ? /package\s*([A-Z])\b/i.exec(p.label) : null) || /([A-Z])$/.exec(String(_nd.fac.progId || '')); return m ? m[1].toUpperCase() : ''; }
function nxPkgLabel() { var k = nxPkg(); return k ? 'Package ' + k : (_nd.cfg.short || ''); }
function nxDateOf(day) { return ndDateOf(day); }
function nxLongDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] + ' ' + m[1] : ''; }
function nxWd(day) { var iso = nxDateOf(day); if (!iso) return ''; return ND_WD[new Date(iso + 'T00:00:00').getDay()]; }
function nxDayOfIso(iso) { if (!iso || !_nd.fac.startDate) return null; var a = Date.parse(String(iso).slice(0, 10) + 'T00:00:00'), b = Date.parse(_nd.fac.startDate + 'T00:00:00'); return isNaN(a) || isNaN(b) ? null : Math.round((a - b) / 864e5) + 1; }
function nxFillIds() { var me = ndMob(); return _nd.view ? [] : ndDeptDefs().filter(function (d) { return ndFills(d.id, me); }).map(function (d) { return d.id; }); }
function nxMineIds() {   // the departments a person's progress is about: the ones they fill, else every department
  var f = nxFillIds(); return f.length ? f : ndDeptDefs().map(function (d) { return d.id; });
}
function nxReady(depts, maxDay, minDay) { return nfDeptReadiness(_nd.cl.items, ndLatest(maxDay, minDay), { pass: (_nd.cfg.passMark || {}).overall || 70, depts: depts }); }
function nxDueText(iso, hours) {   // "due in 6 h" / "late 3 h"
  if (!iso) return ''; var left = Math.round(hours - ndHours(iso));
  return left >= 0 ? 'due in ' + Math.max(1, left) + ' h' : 'late ' + Math.min(99, -left) + ' h';
}
function nxCheckerLabel(dept) { var c = ndChecker(dept); return c ? nxRoleOf(c) : 'checker'; }
function nxMethod(r) { var m = String(r[6] || '').split('/').filter(Boolean)[0]; return m ? m + ' · ' + ({ SI: 'Interview', RR: 'Records', OB: 'Observation', PI: 'Patient' }[m] || m) : ''; }
function nxThings(r) { var t = String(r[7] || '').trim(); return t ? t.split(/\s*[,;]\s*/).filter(Boolean).length : 0; }
function nxBack(js) { return '<button type="button" aria-label="Back" title="Back" onclick="' + js + '"><i class="ti ti-arrow-left"></i></button>'; }
function nxBk(js, title, sub, right) { return '<div class="nx-bk"><div class="nx-bk-in">' + nxBack(js) + '<div><b>' + ndEsc(title) + '</b>' + (sub ? '<small>' + ndEsc(sub) + '</small>' : '') + '</div>' + (right || '') + '</div></div>'; }
function nxLi(icon, cls, title, sub, js, right) {
  return '<button type="button" class="nx-li" onclick="' + js + '"><i class="ti ' + icon + (cls ? ' ' + cls : '') + '"></i><span><b>' + ndEsc(title) + '</b><small>' + ndEsc(sub) + '</small></span>' + (right == null ? '<i class="ti ti-chevron-right" style="width:auto;height:auto;background:none;color:#94A3B8;font-size:16px"></i>' : right) + '</button>';
}

// ── which jobs this person has (review jobs on Today, red count on the Today tab) ──
function nxLeads(mob) { return ndDeptDefs().filter(function (d) { return ndLead(d.id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'; }); }
function nxIsChecker(mob) { return ndDeptDefs().some(function (d) { return ndChecker(d.id) === mob; }); }
function nxRecheckFor(mob) { var A = _nd.actions || {}; return Object.keys(A).filter(function (id) { var a = A[id]; return a && a.status === 'fixed' && ndChecker(a.dept) === mob; }); }
function nxJobCount(mob) { if (_nd.view) return 0; return ndChecksDue(mob).length + ndEscItems(mob).length + ndUnassigned(mob).length; }

// ═══ TODAY ═══
function ndTodayHTML() {
  var me = ndMob(), day = ndDay(), n = _nd.cfg.days, st = ndStaff()[me] || {}, pk = nxPkg();
  var who = _nd.view ? (_nd.view === 'sup' ? 'Facility Supervisor' : 'Facility view') : nxRoleOf(me);
  var top = '<div class="nx-top">' + (_nd.view ? '<button type="button" class="nx-ib" aria-label="Back to the facility list" title="Back" onclick="ndCloseView()"><i class="ti ti-arrow-left"></i></button>' : '')
    + '<div><small>' + ndEsc(_nd.fac.name || _nd.code) + (pk ? ' <span class="nx-pk"><b>' + ndEsc(_nd.cfg.short || 'UPHC') + '</b><span>' + pk + '</span></span>' : '') + ' · ' + ndEsc(who) + '</small>'
    + '<h1>' + (_nd.view ? ndEsc(_nd.fac.name || _nd.code) : 'Namaste, ' + ndEsc(String(st.name || '').split(' ')[0])) + '</h1></div>'
    + '<span class="nd-qb" id="nd-q" hidden></span>'
    + (_nd.view ? '' : '<button type="button" class="nx-streak" onclick="ndTab(\'ready\')" title="Days in a row with all my cards done" aria-label="Days in a row with all my cards done"><i class="ti ti-flame"></i>' + ndStreak() + '</button>')
    + '<button type="button" class="nx-ib nd-rf" onclick="ndReload()" aria-label="Refresh" title="Refresh"><i class="ti ti-refresh"></i></button></div>';
  if (!_nd.fac.startDate) return '<div class="nx">' + top + (ndIsInCharge(me) && !_nd.view
    ? '<div class="nx-card"><b>Set the programme start date</b><span class="nx-dim">All departments start the baseline together on this date (Day 1).</span>' + ndStartForm() + '</div>'
    : '<div class="nx-hero"><div class="nx-hero-k">Programme not started</div><div class="nx-hero-t">Waiting for the start date</div><div class="nx-hero-k">The ' + ndEsc(_nd.cfg.inChargeLabel) + ' sets it.</div></div>') + '</div>';
  if (day < 1) return '<div class="nx">' + top + '<div class="nx-hero"><div class="nx-hero-k">Programme starts · ' + ndEsc(nxLongDate(_nd.fac.startDate)) + '</div><div class="nx-hero-t">' + (1 - day) + ' day' + (1 - day > 1 ? 's' : '') + ' to go</div><div class="nx-hero-k">The baseline starts on Day 1 for every department.</div></div></div>';
  var cuD = day > 100, d0 = cuD ? day : Math.min(day, n), mine = nxMineIds(), all = ndDeptDefs().map(function (d) { return d.id; });
  var S = ndShape(), R = nxReady(mine), F = nxReady(all), B = nxReady(mine, S.bN);
  var my = R.overall === null ? 0 : R.overall, gain = day > S.bN && B.overall !== null && R.overall !== null ? R.overall - B.overall : null;
  var t = _nd.view ? null : ndTodo(me), fillToday = ndCardDepts(d0).filter(function (d) { return !_nd.view && ndFills(d.id, me); });
  var doneN = fillToday.filter(function (d) { var c = ndPc(d.id, day)[me] || {}; return c.done || c.absent; }).length;
  var scored = 0, total = 0; fillToday.forEach(function (d) { var c = ndPc(d.id, day)[me] || {}, ids = ndDayIds(d.id, day); total += ids.length; scored += ids.filter(function (i) { return (c.s || {})[i] !== undefined; }).length; });
  var cta = _nd.view || !fillToday.length ? '<button type="button" class="nx-cta" onclick="ndTab(\'cards\')">Open the cards ›</button>'
    : t.fill.length ? '<button type="button" class="nx-cta" onclick="ndGoCard(\'' + t.fill[0].id + '\',' + day + ')">Open today\'s card · ' + scored + ' of ' + total + ' done ›</button>'
    : '<button type="button" class="nx-cta" onclick="ndTab(\'cards\')">All done for today ✓</button>';
  var h = '<div class="nx">' + top
    + '<div class="nx-hero"><div class="nx-hero-row"><div class="nx-hero-txt"><div class="nx-hero-k">' + (cuD ? 'Catch-up · day ' + Math.min(day - 100, ND_GRAD.cuDays) + ' / ' + ND_GRAD.cuDays : 'Day ' + d0 + ' / ' + n) + ' · ' + ndEsc(ndWeekLabel(d0)) + '</div>'
    + '<div class="nx-hero-t">' + ndEsc((cuD ? day > ndLastDay() : day > n) ? (_nd.fac.graduation ? 'Programme complete · ' + (ND_GRAD_RES[_nd.fac.graduation.result] || {}).t : 'Programme complete') : nxTheme(d0)) + '</div></div>'
    + '<div class="nx-ring">' + nxRing(F.overall === null ? 0 : F.overall, 88, 9, '#fff', 'rgba(255,255,255,.2)') + '<span><b>' + (F.overall === null ? '–' : F.overall + '%') + '</b><small>facility</small></span></div></div>'
    + oneStrip(cuD ? 4 : onePhaseIdx(day, S))
    + '<div class="nx-hero-n"><div><b>' + (R.overall === null ? '–' : R.overall + '%') + '</b><small>' + (_nd.view || !nxFillIds().length ? 'Facility readiness' : 'My readiness') + '</small></div><i></i>'
    + (gain !== null ? '<div><b class="acc">' + (gain >= 0 ? '+' : '') + gain + '</b><small>since baseline</small></div>' : '<div><b>' + R.n + '</b><small>of ' + R.of + ' checked</small></div>')
    + (total ? '<i></i><div><b>' + scored + ' / ' + total + '</b><small>checked today</small></div>' : '') + '</div>' + cta + '</div>';
  // Step 3: programme end (readiness week, graduation result, catch-up); HealSol / District: the programme block
  if (_nd.view) h += ndGradAdminHTML();
  h += ndGradTodayHTML();
  if (day <= n && day < ndShape().e1) h += '<div class="nx-ban o"><b>Graduation on Day ' + n + ' · ' + ndEsc(nxLongDate(nxDateOf(n))) + '</b><span>Finish any missing cards and comparisons as you go — the end-line starts on Day ' + ndShape().e1 + '.</span></div>';
  if (!_nd.view && nxFillIds().length) {
    var ts = nxTeamOnTime(), late = t.late.length, chips = [];
    if (ts !== null) chips.push('<span class="nx-chip ' + (ts >= 80 ? 'g' : ts >= 60 ? 'a' : 'r') + '">Team: ' + (ts >= 80 ? 'On track' : ts >= 60 ? 'Slipping' : 'Behind') + ' · ' + ts + '% on time</span>');
    if (late) chips.push('<span class="nx-chip r">You are ' + late + ' card' + (late > 1 ? 's' : '') + ' behind — catch up today</span>');
    if (chips.length) h += '<div class="nx-chips">' + chips.join('') + '</div>';
  }
  if (!_nd.view && !ndFaCan(me)) h += nxJobsHTML(me);
  if (cuD ? day > ndLastDay() : day > n) return h + '</div>';
  if (!_nd.view) h += nxTodoHTML(me, t) + nxTabsHTML(me) + nxMissionsHTML();
  if (_nd.view) h += nxDeptListHTML();
  return h + '</div>';
}
function nxTheme(day) {   // "Week 4 · Outreach, General Clinic"
  var ds = ndCardDepts(day).map(function (d) { return d.name; });
  if (!ds.length) return ndDayTitle(day);
  return (ds.length > 2 ? ds.slice(0, 2).join(', ') + ' +' + (ds.length - 2) : ds.join(', '));
}
function nxTeamOnTime() {   // of the cards due so far in my departments (yesterday and before), how many came in
  var me = ndMob(), day = Math.min(ndDay(), ndLastDay() + 1), due = 0, inn = 0;
  nxFillIds().forEach(function (dept) {
    for (var d = Math.max(1, day - 14); d < day; d++) {
      if (!ndDayInfo(dept, d).ids.length) continue; var cards = ndPc(dept, d);
      ndFillers(dept).forEach(function (m) { due++; var c = cards[m] || {}; if (c.done || c.absent) inn++; });
    }
  });
  return due ? Math.round(100 * inn / due) : null;
}
function nxJobsHTML(me) {
  var out = [], check = ndChecksDue(me), re = nxRecheckFor(me), leads = nxLeads(me), esc = ndEscItems(me), un = ndUnassigned(me), waiting = 0;
  check.slice(0, 3).forEach(function (x) {
    var inn = ndCardsIn(x.dept, x.day), diff = x.ready ? ndCompare(x.dept, x.day).filter(function (r) { return r.kind === 'diff'; }).length : 0, due = nxDueText(inn.lastDone, ND_CHECK_DUE_H); waiting++;
    out.push('<button type="button" class="nx-job hot" onclick="ndOpenDept(\'' + x.dept + '\',' + x.day + ')"><i class="ti ti-list-check" style="background:#F59E0B;color:#fff"></i><span><b>' + (x.solo ? 'Spot-check · ' : 'Compare the cards · ') + ndEsc(ndDeptDef(x.dept).name) + '</b><small>Day ' + x.day + ' · ' + inn.done.length + ' of ' + inn.fillers.length + ' sent' + (x.ready ? (diff ? ' · ' + diff + ' disagree' : ' · ready') : ' · cards awaited') + '</small></span>'
      + (due ? '<em style="background:' + (/late/.test(due) ? '#FEE2E2;color:#991B1B' : '#FEF3C7;color:#92400E') + '">' + due + '</em>' : '') + '</button>');
  });
  if (check.length > 3) out.push('<div class="nx-dim nx-c">+' + (check.length - 3) + ' more days to compare</div>');
  if (re.length) out.push('<button type="button" class="nx-job" onclick="nxOpenFirstCheck()"><i class="ti ti-refresh-alert" style="background:#DBEAFE;color:#1D4ED8"></i><span><b>Re-check fixed actions</b><small>' + re.length + ' marked fixed · check ' + (re.length > 1 ? 'them' : 'it') + ' on the next card</small></span><em style="background:#DBEAFE;color:#1D4ED8">' + re.length + '</em></button>');
  if (leads.length) {
    if (esc.length || un.length) waiting++;
    var sub = esc.length || un.length ? [esc.length ? esc.length + ' to decide' : '', un.length ? un.length + ' action' + (un.length > 1 ? 's' : '') + ' to assign' : ''].filter(Boolean).join(' · ') : 'Nothing waiting · see this week\'s plan';
    out.push('<button type="button" class="nx-job' + (esc.length || un.length ? ' hot' : '') + '" onclick="ndLeadOpen()"><i class="ti ti-checklist" style="background:#EDE9FE;color:#5B21B6"></i><span><b>' + (leads.length === 1 ? ndEsc(leads[0].name) + ' lead: ' : '') + 'Decide &amp; assign</b><small>' + ndEsc(sub) + '</small></span>'
      + (esc.length + un.length ? '<em style="background:#EDE9FE;color:#5B21B6">' + (esc.length + un.length) + '</em>' : '') + '</button>');
  }
  var sup = Object.keys(_nd.actions || {}).filter(function (id) { var a = _nd.actions[id]; return a.status === 'sup' && nxLeads(me).some(function (d) { return d.id === a.dept; }); }).length;
  if (sup) out.push('<div class="nx-dim">' + sup + ' checkpoint' + (sup > 1 ? 's are' : ' is') + ' with the Facility Supervisor for a how-to-fix.</div>');
  if (ndIsInCharge(me)) { var rm = ndRemindHTML(); if (rm) out.push(rm); }
  if (!out.length) return '';
  var hot = check.length + (esc.length + un.length ? 1 : 0);
  return '<div class="nx-sec"><b>Your review jobs</b>' + (hot ? '<span class="w">' + hot + ' waiting</span>' : '') + '</div>' + out.join('');
}
function nxOpenFirstCheck() { var c = ndChecksDue(ndMob()); if (c.length) { var x = c.find(function (y) { return y.ready; }) || c[0]; ndOpenDept(x.dept, x.day); } else ndToast('They come up on the next cards to compare.', 'ok'); }
// To do today: my checkpoints for today, ticked as I score them
function nxTodoHTML(me, t) {
  var day = ndDay(), rows = [], more = 0, first = null, fill = t.fill.concat(ndDeptDefs().filter(function (d) { var c = ndPc(d.id, day)[me] || {}; return ndFills(d.id, me) && (c.done) && !ndRes(d.id, day).chk && ndDayInfo(d.id, day).ids.length; }));
  if (t.late.length) rows.push(nxLi('ti-alert-triangle', 'r', 'Catch up missed cards', 'Open until checked · ' + t.late.map(function (x) { return ndDeptDef(x.dept).name + ' Day ' + x.day; }).slice(0, 3).join(', '), "ndGoCard('" + t.late[0].dept + "'," + t.late[0].day + ")", '<span class="nx-chip r">' + t.late.length + '</span>'));
  fill.forEach(function (d) {
    var c = ndPc(d.id, day)[me] || {}, s = c.s || {}, r = c.r || {}; if (!first) first = d.id;
    ndDayIds(d.id, day).forEach(function (id) {
      if (rows.length >= 5) { more++; return; }
      var row = _nd.byId[id] || [], v = s[id], rs = ndReason(r[id]);
      var icon = v === 2 ? 'ti-check' : v === 1 || v === 0 ? 'ti-alert-triangle' : 'ti-clipboard-list', cls = v === 2 ? 'g' : v === 1 ? 'a' : v === 0 ? 'r' : '';
      var sub = id + ' · ' + (v === undefined ? (nxThings(row) ? nxThings(row) + ' thing' + (nxThings(row) > 1 ? 's' : '') + ' to check' : d.name) : ND_SNAME[v] + (rs ? ' · ' + rs.t : ''));
      rows.push(nxLi(icon, cls, row[5] || id, sub, "nxGoCp('" + d.id + "'," + day + ",'" + id + "')", '<span class="nx-tick' + (v !== undefined ? ' on' : '') + '"></span>'));
    });
  });
  var h = '<div class="nx-sec"><b>To do today</b><span>Day ' + day + (fill.length ? ' · ' + ndEsc(fill.map(function (d) { return d.id; }).join(', ')) : '') + '</span></div>';
  if (!rows.length) return h + '<div class="nx-card"><div class="nx-empty"><i class="ti ti-circle-check"></i>' + (nxFillIds().length ? 'All done for today' : 'No card for you today') + '</div></div>';
  return h + '<div class="nx-card p0 nx-list">' + rows.join('') + (more ? '<button type="button" class="nx-more" onclick="ndGoCard(\'' + first + '\',' + day + ')">+' + more + ' more</button>' : '') + '</div>';
}
function nxGoCp(dept, day, id) { ndGoCard(dept, day); setTimeout(function () { var el = document.getElementById('nd-cp-' + id); if (el) try { el.scrollIntoView({ block: 'center' }); } catch (e) {} }, 60); }
// My actions · Re-checks · My gaps
function nxMyGaps() {
  var me = ndMob(), F = ndLatestFinal(), A = _nd.actions || {}, mine = {};
  ndDeptDefs().forEach(function (d) { if (ndFills(d.id, me) || ndChecker(d.id) === me) mine[d.id] = 1; });
  return Object.keys(F).filter(function (id) { return F[id].s < 2 && mine[F[id].dept] && !(A[id] && A[id].status === 'closed' && F[id].day <= (nxDayOfIso(A[id].at) || 0)); }).sort();
}
function nxMyRechecks() { var me = ndMob(), A = _nd.actions || {}; return Object.keys(A).filter(function (id) { var a = A[id]; return a.status === 'fixed' && (ndFills(a.dept, me) || ndChecker(a.dept) === me || a.owner === me); }); }
function nxTabsHTML(me) {
  var acts = ndMyActions(), re = nxMyRechecks(), gaps = nxMyGaps(), tab = _nd.ttab || 'act', A = _nd.actions || {};
  var b = function (k, t, n) { return '<button type="button" class="' + (tab === k ? 'on' : '') + '" onclick="_nd.ttab=\'' + k + '\';ndKeepScroll()">' + t + ' <em>' + n + '</em></button>'; };
  var h = '<div class="nx-seg">' + b('act', ndIsInCharge(me) ? 'Actions' : 'My actions', acts.length) + b('re', 'Re-checks', re.length) + b('gap', 'My gaps', gaps.length) + '</div>';
  if (tab === 'act') {
    if (!acts.length) return h + '<div class="nx-card"><div class="nx-empty">No actions for you right now.</div></div>';
    h += acts.slice(0, _nd.allAct ? 99 : 3).map(function (id) { return nxActCard(id); }).join('');
    if (acts.length > 3 && !_nd.allAct) h += '<button type="button" class="nx-more" onclick="_nd.allAct=1;ndKeepScroll()">See all ' + acts.length + '</button>';
    return h;
  }
  if (tab === 're') {
    if (!re.length) return h + '<div class="nx-card"><div class="nx-empty">Nothing waiting for a re-check.</div></div>';
    return h + '<div class="nx-card p0 nx-list">' + re.map(function (id) { var a = A[id], fd = (a.fixed || {}).day; return nxLi('ti-refresh-alert', 'b', ndCpText(id), id + ' · fixed by ' + ndName((a.fixed || {}).by) + (fd ? ' on Day ' + fd + ' · comes back on the Day ' + (fd + 1) + ' card' : ''), "ndTab('cards')"); }).join('') + '</div>';
  }
  if (!gaps.length) return h + '<div class="nx-card"><div class="nx-empty">No open gaps in your departments.</div></div>';
  return h + '<div class="nx-card p0 nx-list">' + gaps.slice(0, 6).map(function (id) {
    var a = A[id], st = !a || a.status === 'closed' ? 'waiting for an action' : a.status === 'open' ? 'action · ' + nxFirst(a.owner) + ' · due ' + ndShortDate(a.due) : a.status === 'fixed' ? 're-check due' : 'with the Facility Supervisor';
    return nxLi('ti-target', 'r', ndCpText(id), id + ' · ' + st, "nxGapOpen('" + id + "')");
  }).join('') + (gaps.length > 6 ? '<div class="nx-more">+' + (gaps.length - 6) + ' more</div>' : '') + '</div>';
}
function nxGapOpen(id) { var F = ndLatestFinal()[id]; if (F) ndGoCard(F.dept, F.day); }
function nxActCard(id) {
  var a = (_nd.actions || {})[id], me = ndMob(); if (!a) return '';
  var over = a.status === 'open' && a.due < ndToday(), myPart = !!(a.owners && a.owners[me] && !(a.dn || {})[me]), canFix = !_nd.view && a.status === 'open' && (a.owners ? myPart || ndIsInCharge(me) : (a.owner === me || ndIsInCharge(me)));
  var stp = ndActSteps(id, a), vu = ndVideoUrl(id), nOw = a.owners ? Object.keys(a.owners).length : 0, nDn = a.owners ? Object.keys(a.dn || {}).filter(function (m) { return a.owners[m]; }).length : 0;
  var leadEdit = !_nd.view && a.status === 'open' && a.level !== 'sup' && ndCanVerify(a.dept, me), sup = _nd.view === 'sup';
  var stt = { open: over ? ['r', 'overdue'] : ['t', 'open'], fixed: ['b', 're-check on the next card'], sup: ['v', 'with the Facility Supervisor'], closed: ['g', 'closed'] }[a.status] || ['', a.status];
  return '<div class="nx-card nd-act"><div class="nx-dim" style="font-weight:700">' + ndEsc(id) + ' · from the ' + (a.level === 'sup' ? 'Facility Supervisor' : ndEsc(ndDeptDef(a.dept).name) + ' lead') + ' · due ' + ndEsc(ndShortDate(a.due)) + '</div>'
    + '<b style="font-size:14px;font-weight:600">' + ndEsc(ndCpTextL(id)) + '</b>' + (a.k ? '<span class="nx-miss">' + ndItemNames(id, a.k).map(ndEsc).join(' · ') + '</span>' : '')
    + '<div class="nx-how" style="white-space:pre-line">' + ndEsc(stp.steps) + '</div>' + (stp.ev ? '<div class="nx-dim"><b>Evidence to show:</b> ' + ndEsc(stp.ev) + '</div>' : '') + (vu ? '<button type="button" class="nx-vid" onclick="ndPlayVideo(\'' + id + '\')"><i class="ti ti-player-play"></i>Watch video</button>' : '')
    + '<div class="nx-tg"><span>' + ndEsc(a.owners ? 'Each staff member · ' + nDn + ' of ' + nOw + ' done' : ndName(a.owner)) + '</span><span class="' + stt[0] + '">' + ndEsc(stt[1]) + '</span></div>'
    + (a.fixed && a.status !== 'open' ? '<div class="nx-dim">Fixed by ' + ndEsc(ndName(a.fixed.by)) + (a.fixed.note ? ': ' + ndEsc(a.fixed.note) : '') + '</div>' : '')
    + (canFix || leadEdit || (sup && a.status !== 'closed') ? '<div class="nx-two">' + (canFix ? '<button type="button" class="nx-btn sm" onclick="ndFixAction(\'' + id + '\')">' + (myPart && nOw - nDn > 1 ? 'Mark my part done' : 'Mark fixed') + '</button>' : '')
      + (leadEdit ? '<button type="button" class="nx-btn sm ghost" onclick="ndAssign(\'' + id + '\')">Change</button>' : '')
      + (sup && a.status !== 'closed' ? '<button type="button" class="nx-btn sm ghost" onclick="nxSupEdit(\'' + id + '\')">' + (a.status === 'sup' ? 'Write how to fix' : 'Change') + '</button>' : '') + '</div>' : '')
    + '</div>';
}
// team missions: this week's checkpoints Met; this week's actions closed
function nxMissions() {
  var day = Math.min(ndDay(), ndLastDay()), ws = day - ((day - 1) % 7), we = Math.min(ws + 6, ndLastDay()), depts = nxFillIds(), out = [];
  if (!depts.length) return out;
  var L = ndLatest(), seen = {}, met = 0, tot = 0;
  depts.forEach(function (dp) { for (var d = ws; d <= we; d++) ndDayInfo(dp, d).ids.forEach(function (id) { if (seen[id]) return; seen[id] = 1; tot++; if (L[id] === 2 && d <= day) met++; }); });
  if (tot) out.push({ t: 'Keep this week\'s ' + (depts.length === 1 ? ndDeptDef(depts[0]).name + ' ' : '') + 'checkpoints Met', n: met, of: tot, end: 'ends Day ' + we, icon: 'ti-target' });
  var A = _nd.actions || {}, wkEnd = nxDateOf(we), wkStart = nxDateOf(ws), an = 0, ao = 0;
  Object.keys(A).forEach(function (id) { var a = A[id]; if (depts.indexOf(a.dept) < 0 || a.due < wkStart || a.due > wkEnd) return; ao++; if (a.status === 'closed') an++; });
  if (ao) out.push({ t: 'Close this week\'s actions', n: an, of: ao, end: 'due by ' + ndShortDate(wkEnd), icon: 'ti-checklist' });
  return out;
}
function nxMissionsHTML() {
  var M = nxMissions(); if (!M.length) return '';
  return '<div class="nx-sec"><b>Team mission</b><span>' + M.length + ' mission' + (M.length > 1 ? 's' : '') + '</span></div>' + M.map(function (m) {
    return '<div class="nx-mis"><i class="ti ' + m.icon + '"></i><span><b>' + ndEsc(m.t) + '</b><span class="nx-bar"><span style="width:' + Math.round(100 * m.n / Math.max(1, m.of)) + '%"></span></span><small class="nx-dim">' + ndEsc(m.end) + '</small></span><b>' + m.n + '/' + m.of + '</b></div>';
  }).join('');
}
// in-charge / viewer: every department's status today
function nxDeptListHTML() {
  var day = ndDay(), list = ndMyDepts(); if (day > ndLastDay() || (day > ndShape().eN && day <= 100) || !list.length) return '';   // readiness week: no day cards
  return '<div class="nx-sec"><b>Departments · Day ' + day + '</b><span>' + list.length + '</span></div><div class="nx-card p0 nx-list">' + list.map(function (d) {
    var s = ndDeptStatus(d.id, day), cls = s.k === 'ok' ? 'g' : s.k === 'back' ? 'r' : s.k === 'done' ? 'b' : 'a';
    return '<button type="button" class="nx-li nd-dept-row" onclick="ndOpenDept(\'' + d.id + '\',' + day + ')"><i class="ti ' + (s.k === 'ok' ? 'ti-shield-check' : s.k === 'done' ? 'ti-clock' : 'ti-clipboard-list') + ' ' + cls + '"></i><span><b>' + ndEsc(d.name) + '</b><small>' + ndDayIds(d.id, day).length + ' checkpoints · checker ' + ndEsc(nxFirst(ndChecker(d.id)) || '—') + '</small></span><span class="nx-chip ' + cls + '">' + ndEsc(s.t) + '</span></button>';
  }).join('') + '</div>';
}
function ndDeptStatus(dept, day) {
  var me = ndMob(), res = ndRes(dept, day), inn = ndCardsIn(dept, day), mine = ndPc(dept, day)[me] || {}, ids = ndDayIds(dept, day);
  if (!ids.length) return { k: 'new', t: 'No card' };
  if (res.chk) { var e = Object.keys(res.esc || {}).length; return e ? { k: 'back', t: e + ' with the lead' } : { k: 'ok', t: 'Checked' }; }
  if (!_nd.view && ndFills(dept, me) && !mine.done) { var n = ids.filter(function (i) { return (mine.s || {})[i] !== undefined; }).length; return n ? { k: 'prog', t: n + ' of ' + ids.length + ' scored' } : { k: 'new', t: 'Fill your card' }; }
  if (inn.waiting.length) return { k: 'prog', t: inn.done.length + ' of ' + inn.fillers.length + ' cards in' };
  if (!inn.done.length) return { k: 'new', t: 'No cards yet' };
  return ndCanCheck(dept, me) && !_nd.view ? { k: 'done', t: 'Ready to compare' } : { k: 'done', t: 'Waiting for the check' };
}
// in-charge: a WhatsApp reminder to each person with something pending today
function ndRemindHTML() {
  var day = ndDay(), staff = ndStaff(), out = [];
  Object.keys(staff).forEach(function (m) {
    if (m === ndMob()) return; var t = ndTodo(m), parts = [];
    if (t.fill.length) parts.push('fill your card for ' + t.fill.map(function (d) { return d.name; }).join(', '));
    if (t.late.length) parts.push('catch up ' + t.late.length + ' missed card' + (t.late.length > 1 ? 's' : ''));
    if (t.check.length) parts.push('compare the cards (' + t.check.length + ')');
    if (t.decide.length) parts.push('decide ' + t.decide.length + ' checkpoint' + (t.decide.length > 1 ? 's' : ''));
    if (t.assign.length) parts.push('assign ' + t.assign.length + ' action' + (t.assign.length > 1 ? 's' : ''));
    var mine = Object.keys(_nd.actions || {}).filter(function (i) { var a = _nd.actions[i]; return a.status === 'open' && a.owner === m; });
    if (mine.length) parts.push('fix ' + mine.length + ' action' + (mine.length > 1 ? 's' : ''));
    if (parts.length) out.push({ m: m, msg: 'NQAS | FAST — ' + (_nd.fac.name || _nd.code) + ', Day ' + day + ': please ' + parts.join('; ') + '.' });
  });
  if (!out.length) return '';
  return '<details class="nx-card nd-dset"><summary style="display:flex;gap:12px;align-items:center;cursor:pointer;list-style:none"><i class="ti ti-send" style="width:44px;height:44px;border-radius:12px;background:#DCFCE7;color:#166534;display:flex;align-items:center;justify-content:center;font-size:20px"></i><span style="flex:1;display:flex;flex-direction:column"><b style="font-size:14px;font-weight:600">Send reminders</b><small class="nx-dim">' + out.length + ' people have work pending</small></span><i class="ti ti-chevron-down"></i></summary>'
    + out.map(function (x) { return '<div class="nx-it row"><span><b>' + ndEsc(ndName(x.m)) + '</b><br><small class="nx-dim">' + ndEsc(x.msg.replace(/^[^:]*: /, '')) + '</small></span><a class="nx-wa" target="_blank" rel="noopener" href="' + ndEsc(ndWaLink(x.m, x.msg)) + '"><i class="ti ti-send"></i> WhatsApp</a></div>'; }).join('') + '</details>';
}

// ═══ CARDS › Daily card ═══
function nxCardsHead() {
  var today = Math.min(ndDay(), ndLastDay()), cv = _nd.cv || 'day';
  return '<div class="nx-ph"><div class="nx-ph-in"><div class="nx-ph-r"><h1>Cards</h1><span class="nd-qb" id="nd-q" hidden></span>'
    + '<span class="nx-chip o">' + (today > 100 ? 'Catch-up · day ' + (today - 100) : ndEsc(ndWeekLabel(Math.max(today, 1))) + ' · Day ' + Math.max(today, 0) + ' / ' + _nd.cfg.days) + '</span></div>'
    + '<div class="nx-ul"><button type="button" class="' + (cv === 'day' ? 'on' : '') + '" onclick="ndCv(\'day\')">Daily Cards</button><button type="button" class="' + (cv === 'timeline' ? 'on' : '') + '" onclick="ndCv(\'timeline\')">Timeline</button></div></div></div>';
}
function ndCardsHTML() {
  var today = ndDay(), n = _nd.cfg.days;
  if (!_nd.fac.startDate || today < 1) return ndTodayHTML();
  if (!_nd.cday) _nd.cday = Math.min(today, ndLastDay());
  var day = _nd.cday, cv = _nd.cv || 'day', h = nxCardsHead() + '<div class="nx">';
  if (cv === 'timeline') return h + ndTimelineHTML() + '</div>';
  var cuOn = ndCuStarted(), seg = cuOn ? (day > 100 ? 'cu' : 'prog') : 'prog', d1 = seg === 'cu' ? 101 : 1, dN = seg === 'cu' ? ndLastDay() : n;   // Step 3: catch-up days
  if (cuOn) h += '<div class="nx-seg ng-seg"><button type="button" class="' + (seg === 'prog' ? 'on' : '') + '" onclick="_nd.cday=' + n + ';ndRender()">Programme · ' + n + ' days</button><button type="button" class="' + (seg === 'cu' ? 'on' : '') + '" onclick="_nd.cday=' + Math.min(today, ndLastDay()) + ';ndRender()">Catch-up · ' + ND_GRAD.cuDays + ' days</button></div>';
  h += '<div class="nx-strip" id="nd-ds">';
  for (var d = d1; d <= dN; d++) {
    var st = _nd.view ? nxFacSt(d) : ndDaySt(d), can = d <= today;
    h += '<button type="button" class="nx-d ds-day ' + st + (d === day ? ' sel' : '') + '" title="' + (d > 100 ? 'Catch-up day ' + (d - 100) : 'Day ' + d) + ' · ' + ndEsc(nxLongDate(nxDateOf(d))) + ' · ' + ndEsc(ND_ST[st].t) + '"' + (can ? ' onclick="ndOpenDay(' + d + ')"' : ' disabled') + '><small>' + ndEsc(nxWd(d)) + '</small><b>' + (d > 100 ? d - 100 : d) + '</b><small>' + ndEsc(String(nxLongDate(nxDateOf(d))).replace(/ \d{4}$/, '')) + '</small></button>';
  }
  h += '</div><div class="nx-leg"><span><i class="g">●</i> Checked</span><span><i class="a">●</i> Waiting for the check</span><span><i class="r">●</i> Missed — still open</span></div>';
  var depts = ndCardDepts(day);
  if (!depts.length) return h + '<div class="nx-card"><div class="nx-empty"><i class="ti ti-calendar"></i>No card for you on Day ' + day + '<br><small>' + ndEsc(ndDayTitle(day)) + '</small></div></div></div>';
  if (!_nd.cdept || !depts.some(function (x) { return x.id === _nd.cdept; })) _nd.cdept = depts[0].id;
  var me = ndMob(), fillD = depts.filter(function (x) { return !_nd.view && ndFills(x.id, me); }), sc = 0, tot = 0;
  fillD.forEach(function (x) { var c = ndPc(x.id, day)[me] || {}, ids = ndMyIds(x.id, day, me); tot += ids.length; sc += ids.filter(function (i) { return (c.s || {})[i] !== undefined; }).length; });
  var info = ndDayInfo(_nd.cdept, day), cur = ndDeptDef(_nd.cdept);
  h += '<div class="nx-ban b"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b style="font-size:13.5px">' + ndEsc(ND_PHASE[info.phase] || ndWeekLabel(day)) + ' · ' + (day > 100 ? 'Catch-up day ' + (day - 100) : 'Day ' + day) + ' · ' + ndEsc(cur.name) + '</b>' + (tot ? '<b style="font-size:12.5px">' + sc + '/' + tot + '</b>' : '') + '</div>'
    + (tot ? '<span class="nx-bar b"><span style="width:' + Math.round(100 * sc / tot) + '%"></span></span>' : '')
    + '<span style="font-size:11.5px;color:#1E3A8A">' + (day === Math.min(today, ndLastDay()) ? 'Today' : day > 100 ? 'Catch-up day ' + (day - 100) : 'Day ' + day) + ': ' + depts.length + ' department' + (depts.length > 1 ? 's' : '') + (fillD.length ? ' for your role' : '') + ' · ' + ndEsc(depts.map(function (x) { return x.id; }).join(', ')) + '</span></div>';
  if (depts.length > 1) h += '<div class="nx-pills">' + depts.map(function (x) {
    var lab = x.name; if (!_nd.view && ndFills(x.id, me)) { var c = ndPc(x.id, day)[me] || {}, ids = ndMyIds(x.id, day, me); lab += ' · ' + ids.filter(function (i) { return (c.s || {})[i] !== undefined; }).length + '/' + ids.length; } else if (!_nd.view && ndCanCheck(x.id, me)) lab += ' · compare';
    return '<button type="button" class="nx-pill' + (x.id === _nd.cdept ? ' on' : '') + '" onclick="_nd.cdept=\'' + x.id + '\';ndRender()">' + ndEsc(lab) + '</button>';
  }).join('') + '</div>';
  return h + ndDayCardHTML(_nd.cdept, day) + '</div>';
}
function ndDayCardHTML(dept, day) {
  var me = ndMob(), today = ndDay(), d = ndDeptDef(dept), info = ndDayInfo(dept, day), ids = ndDayIds(dept, day), res = ndRes(dept, day);
  if (!_nd.view && ndFills(dept, me)) { var mine = ndMyIds(dept, day, me); if (mine.length) ids = mine; }   // best filled by: my checkpoints only
  var fills = !_nd.view && ndFills(dept, me) && ndMyIds(dept, day, me).length > 0, c = fills ? (ndPc(dept, day)[me] || {}) : {}, s = c.s || {}, rs = c.r || {}, nt = c.note || {};
  var locked = !fills || !!res.chk || day > today || ndGradLocked(day), n = ids.filter(function (i) { return s[i] !== undefined; }).length, st = ndMySt(dept, day);
  var aocs = [], stds = []; ids.forEach(function (id) { var r = _nd.byId[id]; if (!r) return; if (aocs.indexOf(r[2]) < 0) aocs.push(r[2]); if (stds.indexOf(r[3]) < 0) stds.push(r[3]); });
  var lead = ndLead(dept), ck = ndChecker(dept), myRole = nxRoleOf(me);
  var h = '<div class="nx-dc"><div class="nx-dc-hd"><div class="nx-dn"><small>DAY</small><b>' + day + '</b></div><div><b>' + ndEsc(d.name) + '</b><small>' + ndEsc((nxWd(day) ? nxWd(day) + ', ' : '') + ndShortDate(nxDateOf(day))) + (lead ? ' · lead: ' + ndEsc(ndName(lead)) + ' (' + ndEsc(nxRoleOf(lead)) + ')' : '') + '</small></div></div>'
    + '<div class="nx-aoc"><b>Area of Concern</b>' + aocs.map(function (a) { return '<span>' + ndEsc(a + ' · ' + String(_nd.cl.aocs[a] || '').replace(/^[:\s]+/, '')) + '</span>'; }).join('') + '</div>';
  var about = fills ? 'Today you check ' + ids.length + ' checkpoint' + (ids.length > 1 ? 's' : '') + ' of ' + d.name + (stds.length ? ' — ' + stds.map(function (k) { return _nd.cl.stds[k] ? k : k; }).join(', ') : '') + (ndSolo(dept) ? '. You are the only one filling this department, so your card counts as checked when you tap Done; ' + (ck && ck !== me ? nxFirst(ck) + ' (' + nxRoleOf(ck) + ')' : 'the lead') + ' spot-checks a few and assigns actions for the gaps.' : '. Fill your own card; ' + (ck && ck !== me ? nxFirst(ck) + ' (' + nxRoleOf(ck) + ')' : 'the checker') + ' compares the cards later.')
    : 'Your team fills their own cards for ' + d.name + '. ' + (ndCanCheck(dept, me) && !_nd.view ? 'You compare them on one screen: agreed Met closes by itself.' : 'The checker compares them on one screen.');
  h += '<div class="nx-blk"><b>About this day</b><span>' + ndEsc(about) + '</span></div>';
  // status
  if (res.chk) h += '<div class="nx-blk" style="background:#F0FDF4"><span style="color:#166534;font-weight:600">Checked by ' + ndEsc(res.chk.byName || ndName(res.chk.by)) + ' · ' + ndEsc(ndShortDate((res.chk.at || '').slice(0, 10))) + (Object.keys(res.esc || {}).length ? ' · ' + Object.keys(res.esc).length + ' with the lead' : '') + '</span></div>';
  else if (fills && c.done && ndSolo(dept)) h += '<div class="nx-blk" style="background:#F0FDF4"><span style="color:#166534;font-weight:600">Done · counts as checked. ' + ndEsc(ndName(ck)) + ' spot-checks a few and assigns actions for the gaps.</span></div>';
  else if (fills && c.done) h += '<div class="nx-blk" style="background:#FFFBEB"><span style="color:#92400E;font-weight:600">Done · waiting for ' + ndEsc(ndName(ck)) + ' to compare. You can still change a score until then.</span></div>';
  else if (fills && st === 'overdue') h += '<div class="nx-blk" style="background:#FEF2F2"><span style="color:#991B1B;font-weight:600">Missed. The card stays open until it is checked — fill it now to catch up.</span></div>';
  if (!fills) {
    var inn = ndCardsIn(dept, day);
    h += '<div class="nx-blk"><b>Cards from the team</b><div class="nx-chips">' + inn.fillers.map(function (m) { var k = inn.done.indexOf(m) >= 0 ? 'g' : inn.absent.indexOf(m) >= 0 ? '' : 'a'; return '<span class="nx-chip ' + k + '">' + ndEsc(ndName(m)) + ' · ' + (k === 'g' ? 'done' : k === '' ? 'not filled' : 'awaited') + '</span>'; }).join('') + '</div></div>'
      + '<div class="nx-foot"><button type="button" class="nx-btn" onclick="ndOpenDept(\'' + dept + '\',' + day + ')">' + (res.chk || _nd.view || !ndCanCheck(dept, me) ? 'See the comparison' : 'Compare the cards') + '</button></div></div>';
    return h;
  }
  var re = ndRecheckIds(dept, day), plan = info.ids, groups = [], cur = null;
  ids.forEach(function (id) { var r = _nd.byId[id]; if (!r) return; var key = plan.indexOf(id) < 0 && re.indexOf(id) >= 0 ? '__re' : r[3]; if (!cur || cur.key !== key) { cur = { key: key, rows: [] }; groups.push(cur); } cur.rows.push(r); });
  var many = groups.filter(function (g) { return g.key !== '__re'; }).length > 1;
  groups.forEach(function (g) {
    if (g.key === '__re') h += '<div class="nx-stdh" style="color:#1D4ED8;background:#EFF6FF">Re-check after a fix · an action was marked fixed — score it again</div>';
    else if (many) h += '<div class="nx-stdh">Standard ' + ndEsc(g.key) + ' · ' + ndEsc(_nd.cl.stds[g.key] || '') + '</div>';
    g.rows.forEach(function (r) {
      var id = r[0], v = s[id], isRe = g.key === '__re', a = (_nd.actions || {})[id], ct = ndCt(id), its = ct.items, fy = ndForYouTag(dept, id), vu = ndVideoUrl(id);
      h += '<div class="nx-cp' + (v === 1 ? ' s1' : v === 0 ? ' s0' : isRe ? ' re' : '') + '" id="nd-cp-' + id + '"><div class="nx-tg">' + (isRe ? '<span class="b">Re-check</span>' : '') + '<span>' + ndEsc(id) + '</span>' + (fy ? '<span class="v">' + ndEsc(fy) + '</span>' : '<span class="v">@' + ndEsc(myRole) + '</span>') + (nxMethod(r) ? '<span class="s">' + ndEsc(nxMethod(r)) + '</span>' : '') + '<span>ME ' + ndEsc(r[4]) + '</span></div>'
        + '<b' + (ndLang() === 'hi' && ct.hi ? ' lang="hi"' : '') + '>' + ndEsc(ndCpTextL(id)) + '</b>'
        + (vu ? '<button type="button" class="nx-vid" onclick="ndPlayVideo(\'' + id + '\')"><i class="ti ti-player-play"></i>Watch video</button>' : '')
        + (isRe && a && a.fixed ? '<span style="font-size:11.5px;color:#1E3A8A">Marked fixed by ' + ndEsc(ndName(a.fixed.by)) + (a.fixed.day ? ' on Day ' + a.fixed.day : '') + ' — is it Met now?</span>' : '');
      if (its.length) {   // MoV items: a yes / no for each; the score is worked out (SC rule)
        var tk = ndTk((c.t || {})[id], its.length), met = tk.filter(function (x) { return x === 1; }).length;
        h += '<span class="nx-q" style="color:#4A5A55">' + (its.length > 1 ? 'Check each thing — the score is worked out for you' : '1 thing to check') + '</span><div class="nx-mov">' + its.map(function (it, k) {
          var t = tk[k];
          return '<div class="nx-mi2' + (t === 0 ? ' no' : '') + '"><span' + (ndLang() === 'hi' && it.h ? ' lang="hi"' : '') + '>' + ((it.m || [])[0] ? '<em>' + ndEsc(it.m[0]) + '</em> ' : '') + ndEsc(ndItemTxt(it)) + '</span>'
            + '<button type="button" aria-label="Yes" aria-pressed="' + (t === 1) + '" class="y' + (t === 1 ? ' on' : '') + '"' + (locked ? ' disabled' : '') + ' onclick="ndTick(\'' + id + '\',' + k + ',1)">✓</button>'
            + '<button type="button" aria-label="No" aria-pressed="' + (t === 0) + '" class="n' + (t === 0 ? ' on' : '') + '"' + (locked ? ' disabled' : '') + ' onclick="ndTick(\'' + id + '\',' + k + ',0)">✗</button></div>';
        }).join('') + '</div>';
        if (v !== undefined) h += '<div class="nx-movr s' + v + '"><span>' + met + ' of ' + its.length + ' met</span><b>' + ND_SNAME[v] + '</b></div>';
        else if (its.length > 1 && !locked) h += '<span class="nx-dim">' + ndEsc(ndRuleTxt(its.length)) + '</span>';
        else if (locked && fills) h += '<div class="nx-ro na">Not scored</div>';
      }
      else if (locked) h += '<div class="nx-ro ' + (v === undefined ? 'na' : 's' + v) + '">' + (v === undefined ? (fills ? 'Not scored' : '') : ND_SNAME[v]) + '</div>';
      else h += '<div class="nx-3">' + [2, 1, 0].map(function (k) { return '<button type="button" class="s' + k + (v === k ? ' on' : '') + '" onclick="ndScore(\'' + id + '\',' + k + ')">' + ND_SNAME[k] + '</button>'; }).join('') + '</div>';
      if ((v === 0 || v === 1) && !its.length) {
        h += '<span class="nx-q">What is missing? (one tap)</span><div class="nx-rs nd-rs">' + ND_REASONS.map(function (x) { return '<button type="button" class="' + (rs[id] === x.k ? 'on' : '') + '"' + (locked ? ' disabled' : '') + ' onclick="ndReasonSet(\'' + id + '\',\'' + x.k + '\')">' + ndEsc(x.k === 'oth' ? 'Other (add note)' : x.t) + '</button>'; }).join('') + '</div>';
        if (rs[id] === 'oth' || nt[id]) h += '<input class="nx-in' + (rs[id] === 'oth' && !nt[id] ? ' need' : '') + '" maxlength="300" placeholder="' + (rs[id] === 'oth' ? 'What is missing? (needed for Other)' : 'What is missing?') + '" value="' + ndEsc(nt[id] || '') + '"' + (locked ? ' disabled' : '') + ' onchange="ndNote(\'' + id + '\',this.value)">';
      }
      h += '</div>';
    });
    var open = g.rows.filter(function (r) { return s[r[0]] === undefined; });
    if (!locked && open.length && g.key !== '__re') h += '<div class="nx-foot" style="padding-bottom:0"><button type="button" class="nx-btn dash nd-allmet" onclick="ndAllMet(\'' + open.map(function (r) { return r[0]; }).join(',') + '\')">All Met for the rest of ' + (many ? 'Standard ' + ndEsc(g.key) : 'this Standard') + '</button></div>';
  });
  h += '<div class="nx-foot">';
  if (!locked && !c.done) h += '<button type="button" class="nx-btn" id="nd-done"' + (n < ids.length ? ' disabled title="Score every checkpoint first"' : '') + ' onclick="ndDone()">' + (ndSolo(dept) ? 'Done · counts as checked' : 'Done · send to ' + ndEsc(ck && ck !== me ? nxRoleOf(ck) : 'the checker')) + (n < ids.length ? ' · ' + n + '/' + ids.length : '') + '</button>';
  if (!locked) h += '<span class="nx-dim nx-c">Saved on your phone · works without signal</span>';
  return h + '</div></div>';
}

// ═══ CARDS › Timeline ═══
function nxFacSt(day) {   // the whole facility's status for a day
  var today = ndDay(), list = ndDeptDefs().filter(function (d) { return ndDayInfo(d.id, day).ids.length; });
  if (!list.length) return 'none'; if (day > today) return 'upcoming';
  if (list.every(function (d) { return ndRes(d.id, day).chk; })) return 'verified';
  if (list.some(function (d) { return ndCardsIn(d.id, day).done.length; })) return day === today ? 'today' : 'awaiting';
  return day === today ? 'today' : 'overdue';
}
function nxDayPct(day, depts) { var g = 0, m = 0; depts.forEach(function (dp) { var f = ndRes(dp, day).f || {}; Object.keys(f).forEach(function (id) { g += +f[id]; m += 2; }); }); return m ? Math.round(100 * g / m) : null; }
function ndTimelineHTML() {
  if (!_nd.fac.startDate) return '<div class="nx-card"><div class="nx-empty"><i class="ti ti-clock"></i>The timeline appears once the start date is set.</div></div>';
  var n = _nd.cfg.days, today = ndDay(), fac = !!_nd.view || !!_nd.tlAll, me = ndMob(), sum = {}, rows = [];
  for (var d = 1; d <= n; d++) { var st = fac ? nxFacSt(d) : ndDaySt(d); sum[st] = (sum[st] || 0) + 1; rows.push({ day: d, st: st }); }
  var ckLab = 'the checker'; var md = ndMyDepts().find(function (x) { return ndFills(x.id, me); }); if (md) ckLab = nxCheckerLabel(md.id);
  var h = (_nd.view ? '' : '<div class="nx-seg"><button type="button" class="' + (!fac ? 'on' : '') + '" onclick="_nd.tlAll=0;ndKeepScroll()">My days</button><button type="button" class="' + (fac ? 'on' : '') + '" onclick="_nd.tlAll=1;ndKeepScroll()">Whole facility</button></div>')
    + '<div class="nx-stat"><div><b style="color:#166534">' + (sum.verified || 0) + '</b><small>Checked</small></div><div><b style="color:#92400E">' + (sum.awaiting || 0) + '</b><small>With ' + ndEsc(fac ? 'the checkers' : ckLab) + '</small></div>'
    + '<div><b style="color:#991B1B">' + (sum.overdue || 0) + '</b><small>' + (fac ? 'Not checked' : 'To catch up') + '</small></div><div><b style="color:#475569">' + (sum.upcoming || 0) + '</b><small>Coming</small></div></div>';
  var cw = Math.floor((Math.max(1, Math.min(today, n)) - 1) / 7), weeks = Math.ceil(n / 7);
  if (_ndWkOpen[cw] === undefined) _ndWkOpen[cw] = true; if (cw > 0 && _ndWkOpen[cw - 1] === undefined) _ndWkOpen[cw - 1] = true;
  h += '<div class="nx-card p0">';
  for (var w = cw; w >= 0; w--) {
    var wd = rows.slice(w * 7, w * 7 + 7), a = wd[0], z = wd[wd.length - 1], open = !!_ndWkOpen[w];
    var nck = wd.filter(function (x) { return x.st === 'verified'; }).length, nmiss = wd.filter(function (x) { return x.st === 'overdue'; }).length;
    h += '<button type="button" class="nx-wk" id="nd-wk-' + w + '" onclick="ndWeek(' + w + ')"><b>Week ' + (w + 1) + ' · ' + ndEsc(/^Week/.test(ndWeekLabel(a.day)) ? nxTheme(a.day) : ndWeekLabel(a.day)) + '</b><span>Day ' + a.day + '–' + z.day + (!open ? ' · ' + (nmiss ? nmiss + ' to catch up' : nck + ' checked') : '') + ' <i class="ti ' + (open ? 'ti-chevron-down' : 'ti-chevron-right') + '"></i></span></button>';
    if (open) wd.forEach(function (m) { if (m.day <= today || w === cw) h += nxTlRow(m, fac); });
  }
  if (cw + 1 < weeks) h += '<div class="nx-wk" style="cursor:default"><b style="color:#64748B">Coming next · Week ' + (cw + 2) + (weeks > cw + 2 ? '–' + weeks : '') + '</b><span>Day ' + ((cw + 1) * 7 + 1) + '–' + n + '</span></div>';
  h += '</div>';
  if (sum.overdue && !fac) h += '<div class="nx-dim nx-c">A missed day stays open until ' + ndEsc(ckLab) + ' has checked that day — tap it to catch up.</div>';
  return h;
}
function nxTlRow(m, fac) {
  var today = ndDay(), me = ndMob(), depts = fac ? ndDeptDefs().filter(function (d) { return ndDayInfo(d.id, m.day).ids.length; }) : ndCardDepts(m.day);
  var title = depts.length ? depts.slice(0, 2).map(function (d) { return d.name; }).join(' · ') + (depts.length > 2 ? ' +' + (depts.length - 2) : '') : ndDayTitle(m.day);
  var chips = depts.slice(0, 6).map(function (d) { var s = fac ? (ndRes(d.id, m.day).chk ? 'verified' : '') : ndMySt(d.id, m.day); return '<span class="' + (s === 'verified' ? 'g' : s === 'awaiting' ? 'a' : s === 'overdue' ? 'r' : 't') + '">' + ndEsc(d.id) + '</span>'; }).join('');
  var lab = m.st === 'verified' ? 'Checked' : m.st === 'awaiting' ? (fac ? 'Being checked' : 'With ' + (depts[0] ? nxCheckerLabel(depts[0].id) : 'checker')) : m.st === 'overdue' ? (fac ? 'Not checked' : 'Catch up') : m.st === 'today' ? 'Today' : m.st === 'upcoming' ? nxWd(m.day) : 'No card';
  if (m.st === 'verified') { var p = nxDayPct(m.day, depts.map(function (d) { return d.id; })); if (p !== null) lab += ' · ' + p + '%'; }
  if (m.st === 'today' && !fac) { var sc = 0, tot = 0; depts.filter(function (d) { return ndFills(d.id, me); }).forEach(function (d) { var c = ndPc(d.id, m.day)[me] || {}, ids = ndDayIds(d.id, m.day); tot += ids.length; sc += ids.filter(function (i) { return (c.s || {})[i] !== undefined; }).length; }); if (tot) lab += ' · ' + sc + '/' + tot; }
  return '<button type="button" class="nx-tr' + (m.day === today ? ' now' : '') + '"' + (m.day <= today ? ' onclick="ndOpenDay(' + m.day + ')"' : ' disabled') + '><span class="nx-tdn ' + m.st + '"><small>DAY</small>' + m.day + '</span><span><b' + (m.day > today ? ' style="color:#64748B"' : '') + '>' + ndEsc(title) + '</b><span class="nx-tg">' + chips + '</span></span><em class="' + m.st + '">' + ndEsc(lab) + '</em></button>';
}
function ndWeek(w) { _ndWkOpen[w] = !_ndWkOpen[w]; ndKeepScroll(); }

// ═══ PROGRESS ═══
function ndReadyHTML() {
  var me = ndMob(), day = Math.min(ndDay(), _nd.cfg.days), mine = nxMineIds(), mineOnly = !!nxFillIds().length, pass = (_nd.cfg.passMark || {}).overall || 70;
  var S = ndShape(), R = nxReady(mine), B = nxReady(mine, S.bN), I = day > S.bN ? nxReady(mine, S.iN, S.i1) : null, E = day >= S.e1 ? nxReady(mine, 999, S.e1) : null, F = nxReady(ndDeptDefs().map(function (d) { return d.id; }));
  var v = function (x) { return x && x.overall !== null ? x.overall : null; };
  var h = '<div class="nx"><div class="nx-ph-r"><h1 style="margin:0;font-size:21px;font-weight:700;flex:1">' + (mineOnly ? 'My progress' : 'Facility progress') + '</h1><span class="nx-chip o">Day ' + Math.max(day, 0) + ' / ' + _nd.cfg.days + '</span></div>'
    + oneRingCard({ pct: v(R), label: mineOnly ? 'my readiness' : 'readiness', base: v(B), impl: v(I), implFrom: 'from Day ' + S.i1, end: v(E), endFrom: 'from Day ' + S.e1,
      foot: (mineOnly && F.overall !== null ? 'Facility ' + F.overall + '% · ' : '') + 'target ' + pass + '% · ' + R.n + ' of ' + R.of + ' checked' });
  if (!_nd.view && mineOnly) { var I2 = nxImpact(); h += oneCounters([[ndStreak(), 'days on time in a row', 'o'], [I2.checked, 'checkpoints checked'], [I2.fixed, 'gaps you fixed', 'g']]); }
  var tab = _nd.ptab || 'dept';
  h += oneSeg([['aoc', 'Areas of Concern'], ['dept', mineOnly ? 'My departments' : 'Departments']], tab, function (k) { return "_nd.ptab='" + k + "';ndKeepScroll()"; });
  var rows = [];
  if (tab === 'aoc') Object.keys(_nd.cl.aocs).forEach(function (a) { if (!R.byAoc[a]) return; rows.push({ label: a + ' · ' + String(_nd.cl.aocs[a]).replace(/^[:\s]+/, ''), now: R.byAoc[a].pct, base: (B.byAoc[a] || {}).pct }); });
  else mine.forEach(function (id) { if (!R.byDept[id]) return; rows.push({ label: ndDeptDef(id).name, now: R.byDept[id].pct, base: (B.byDept[id] || {}).pct, sub: R.byDept[id].n + ' of ' + R.byDept[id].of + ' checked' }); });
  h += oneDumbRows(rows, pass) + '<p class="one-dim" style="margin:6px 2px 0">' + (mineOnly ? 'Only the departments you are part of. Your department lead sees the whole team.' : 'Whole checklist — not yet checked counts as 0.') + '</p>';
  if (_nd.view) h += '<details class="nx-card"><summary style="cursor:pointer;font-weight:700;font-size:14px">Department × Area of Concern grid</summary>' + nxGridHTML() + '</details>';
  if (!_nd.view && mineOnly) {
    var BD = nxBadges();
    h += '<div class="nx-sec"><b>Badges</b><span>' + BD.filter(function (b) { return b.on; }).length + ' of ' + BD.length + '</span></div><div class="nx-card nx-badges">'
      + BD.map(function (b) { return '<div class="nx-badge' + (b.on ? '' : ' off') + '"><i class="ti ' + b.icon + '" style="background:' + b.bg + ';color:' + b.fg + '"></i>' + b.t + '</div>'; }).join('') + '</div>';
    var M = nxMissions();
    if (M.length) h += '<div class="nx-sec"><b>Team missions</b></div><div class="nx-card">' + M.map(function (m) { return '<div style="display:flex;gap:10px;align-items:center"><span style="flex:1;font-size:13px;font-weight:600">' + ndEsc(m.t) + '</span><b style="color:#4F46B8">' + m.n + '/' + m.of + '</b></div><span class="nx-bar" style="background:#EEF0FC"><span style="width:' + Math.round(100 * m.n / Math.max(1, m.of)) + '%"></span></span>'; }).join('') + '</div>';
  }
  return h + '</div>';
}
function nxGridHTML(only) {
  var on = only && only.length ? only : ndDeptDefs().map(function (d) { return d.id; }), R = nfDeptReadiness(_nd.cl.items, ndLatest(), { pass: (_nd.cfg.passMark || {}).overall || 70, depts: on });
  var aocs = Object.keys(_nd.cl.aocs), cls = function (p) { return p === null ? 'na' : p >= 70 ? 'g' : p >= 50 ? 'a' : 'r'; };
  var cell = function (x) { return '<td class="' + cls(x && x.pct !== undefined ? x.pct : null) + '">' + (x && x.pct !== null && x.pct !== undefined ? x.pct : '–') + '</td>'; };
  var h = '<div class="nd-grid" style="margin-top:10px"><table><thead><tr><th>Dept</th>' + aocs.map(function (a) { return '<th title="' + ndEsc(_nd.cl.aocs[a]) + '">' + a + '</th>'; }).join('') + '<th>All</th></tr></thead><tbody>';
  ndDeptDefs().filter(function (d) { return on.indexOf(d.id) >= 0; }).forEach(function (d) { var x = R.byDept[d.id] || {}; h += '<tr><th title="' + ndEsc(d.name) + '">' + ndEsc(d.id) + '</th>' + aocs.map(function (a) { return cell((x.byAoc || {})[a]); }).join('') + cell(x) + '</tr>'; });
  if (!(only && only.length === 1)) h += '<tr class="tot"><th>' + (only && only.length ? 'Mine' : 'All') + '</th>' + aocs.map(function (a) { return cell(R.byAoc[a]); }).join('') + cell({ pct: R.overall }) + '</tr>';
  h += '</tbody></table></div>';
  return h + '<div class="nd-legend"><span class="g">≥ 70</span><span class="a">50–69</span><span class="r">&lt; 50</span><span class="na">not assessed</span></div>';
}
function nxImpact() {   // what I did: checkpoints scored on my done cards, gaps I fixed, share of my cards in on time
  var me = ndMob(), checked = 0, due = 0, inn = 0, day = Math.min(ndDay(), _nd.cfg.days);
  nxFillIds().forEach(function (dp) {
    var days = _nd.pcards[dp] || {}; Object.keys(days).forEach(function (k) { var c = (days[k] || {})[me]; if (c && c.done) checked += Object.keys(c.s || {}).length; });
    for (var d = 1; d < day; d++) { if (!ndDayInfo(dp, d).ids.length) continue; due++; var c = ndPc(dp, d)[me] || {}; if (c.done || c.absent) inn++; }
  });
  var A = _nd.actions || {}, fixed = Object.keys(A).filter(function (id) { var a = A[id]; return (a.fixed && a.fixed.by === me) || (a.owner === me && a.status === 'closed'); }).length;
  var open = Object.keys(A).filter(function (id) { var a = A[id]; return a.owner === me && a.status !== 'closed'; }).length;
  return { checked: checked, fixed: fixed, onTime: due ? Math.round(100 * inn / due) : null, open: open };
}
function nxBaselineDone() { var me = ndMob(), ok = true, any = false; nxFillIds().forEach(function (dp) { for (var d = 1; d <= ndShape().bN; d++) { if (!ndDayInfo(dp, d).ids.length) continue; any = true; var c = ndPc(dp, d)[me] || {}; if (!c.done && !c.absent) ok = false; } }); return any && ok && ndDay() > ndShape().bN; }
function nxBadges() {
  var I = nxImpact(), E = ndDay() >= ndShape().e1 ? nxReady(nxMineIds(), 999, ndShape().e1) : null, st = ndStreak();
  return [
    { t: '7-day<br>streak', on: st >= 7, icon: 'ti-flame', bg: '#FFF1DE', fg: '#E8963A' },
    { t: 'Baseline<br>done', on: nxBaselineDone(), icon: 'ti-circle-check', bg: '#DCFCE7', fg: '#166534' },
    { t: 'First gap<br>fixed', on: I.fixed > 0, icon: 'ti-tools', bg: '#E0F2FE', fg: '#075985' },
    { t: 'End-line<br>70%+', on: !!(E && E.overall !== null && E.overall >= 70), icon: 'ti-award', bg: '#F1F5F9', fg: '#64748B' }];
}

// ═══ ME ═══
function ndMeHTML() {
  var me = ndMob(), st = ndStaff()[me] || {}, nm = st.name || me, day = Math.min(ndDay(), _nd.cfg.days), I = nxImpact(), fillIds = nxFillIds();
  var type = (NF_LEVELS[nfTypeOf(_nd.fac)] || {}).short || _nd.cfg.short || '';
  var h = '<div class="nx"><div class="nx-ph-r"><h1 style="margin:0;font-size:21px;font-weight:700;flex:1">Me</h1></div>'
    + oneProfile({ name: nm, sub: nxRoleOf(me) + ' · ' + (_nd.fac.name || _nd.code) + (_nd.fac.district ? ', ' + _nd.fac.district : ''), chips: [[ndEsc(type)]].concat(_nd.fac.startDate && day >= 1 ? [['Day ' + day + ' / ' + _nd.cfg.days, 'o'], [ndStreak() + ' on time', 'o']] : []) });
  var depts = ndMyDepts().filter(function (d) { return ndFills(d.id, me) || ndCanCheck(d.id, me); });
  h += onePkgCard('My departments', depts.map(function (d) { return d.name + (ndLead(d.id) === me ? ' · you lead' : ndChecker(d.id) === me ? ' · you compare' : ndFills(d.id, me) && ndChecker(d.id) ? ' · checked by ' + nxRoleOf(ndChecker(d.id)) + ' ' + nxFirst(ndChecker(d.id)) : ''); }), depts.length ? '' : 'None yet — the ' + _nd.cfg.inChargeLabel + ' adds you in Set-up.');
  if (fillIds.length) h += oneImpact({ title: 'My work so far', nums: [[I.checked, 'checked'], [I.fixed, 'gaps fixed'], [I.onTime === null ? '–' : I.onTime + '%', 'days on time']], line: 'Updated as you finish cards.' });
  h += ndCertCardHTML();   // Step 3: the real certificate (issueCertificate)
  var help = ''; try { if (typeof nfSupportOn === 'function' && nfSupportOn()) help = '<button type="button" class="nx-btn sm" style="background:#16A34A" onclick="nfOpenSupport(\'me\')">Chat</button>'; } catch (e) {}
  h += '<div class="nx-card" style="flex-direction:row;align-items:center;gap:12px"><i class="ti ti-message" style="width:40px;height:40px;border-radius:12px;background:#DCFCE7;color:#166534;display:flex;align-items:center;justify-content:center;font-size:20px;flex:none"></i><span style="flex:1;display:flex;flex-direction:column"><b style="font-size:13.5px">Need help?</b><small class="nx-dim">' + (help ? 'WhatsApp HealSol support' : 'Ask your ' + ndEsc(_nd.cfg.inChargeLabel) + ' or HealSol Academy') + '</small></span>' + help + '</div>';
  var mi = function (icon, t, js, em, cls) { return '<button type="button" class="nx-mi' + (cls ? ' ' + cls : '') + '" onclick="' + js + '"><i class="ti ' + icon + '"></i><span>' + t + '</span>' + (em ? '<em>' + em + '</em>' : '') + '</button>'; };
  var nCheck = ndChecksDue(me).length, nLead = ndEscItems(me).length + ndUnassigned(me).length;
  h += '<div class="nx-card nx-menu">' + (ndFaCan(me) ? mi('ti-layout-dashboard', 'Facility dashboard', 'ndFaOpen()') : '') + '<div class="nx-mi nx-mi-lang"><i class="ti ti-language"></i><span>Language</span><span class="nf-lang"><button type="button" class="' + (ndLang() === 'hi' ? '' : 'on') + '" onclick="ndSetLang(\'en\')">EN</button><button type="button" class="' + (ndLang() === 'hi' ? 'on' : '') + '" onclick="ndSetLang(\'hi\')">हिं</button></span></div>'
    + (nxMyDeptIds().length ? mi('ti-layout-grid', 'Department dashboard', "ndTab('dept')") : '')
    + (!ndFaCan(me) && nxIsChecker(me) ? mi('ti-list-check', 'Cards to compare', 'nxOpenFirstCheck()', nCheck || '') : '')
    + (!ndFaCan(me) && nxLeads(me).length ? mi('ti-checklist', 'Decide &amp; assign', 'ndLeadOpen()', nLead || '') : '')
    + (typeof scOpenLiveSessions === 'function' ? mi('ti-broadcast', 'Live sessions', 'scOpenLiveSessions()') : '')
    + mi('ti-refresh', 'Refresh data', 'ndReload()') + mi('ti-help-circle', 'How to use the app', 'nxHelp()')
    + mi('ti-key', 'Change password', 'nfChangeMyPassword()') + mi('ti-logout', 'Log out', 'ndLogout()', '', 'red') + '</div>';
  return h + '</div>';
}
function nxHelp() {
  var m = 'Today: open today\'s card with the orange ▶ button. Score each checkpoint Met, Partial or Not met; for Partial or Not met tap what is missing. Tap "All Met for the rest" to finish quickly, then Done.\n\nCards: pick a day in the strip; Timeline shows all 60 days. A missed day stays open until it is checked.\n\nProgress: your readiness, badges and team missions.\n\nYour review jobs (if you have one) are on Today and in this menu.';
  try { if (typeof scDialog === 'function') { scDialog({ title: 'How to use the app', icon: '❓', message: m, fields: [], okLabel: 'OK' }); return; } } catch (e) {}
  ndToast(m.split('\n')[0], 'ok');
}

// ═══ ANM › Compare the cards (full screen) ═══
function ndCardHTML() {
  var c = _nd.card, dept = c.dept, day = c.day, me = ndMob(), res = ndRes(dept, day), inn = ndCardsIn(dept, day), can = c.mode === 'check' && ndCanCheck(dept, me) && !res.chk && !_nd.view;
  var due = !res.chk && inn.lastDone ? nxDueText(inn.lastDone, ND_CHECK_DUE_H) : '';
  var solo = ndSolo(dept), h = nxBk('ndCloseCard()', solo ? 'Spot-check the card' : 'Compare the cards', ndDeptDef(dept).name + ' · Day ' + day + ' · ' + (can ? 'you are the checker' : res.chk ? 'checked' : 'view only'),
    '<span class="nd-qb" id="nd-q" hidden></span>' + (due ? '<span class="nx-chip ' + (/late/.test(due) ? 'r' : 'a') + '" style="font-size:10.5px">' + due + '</span>' : '')) + '<div class="nx">';
  if (solo && !res.chk) h += '<div class="nx-ban b"><span>Only ' + ndEsc(ndName(ndFillers(dept)[0])) + ' fills this department, so her card already counts as checked. Look at the spot-checks (and any re-check), then tap Done. Partial and Not met go to your Assign list.</span></div>';
  if (res.chk) h += '<div class="nx-ban g"><b>Checked by ' + ndEsc(res.chk.byName || ndName(res.chk.by)) + '.</b>' + (Object.keys(res.esc || {}).length ? '<span>' + Object.keys(res.esc).length + ' sent to the lead.</span>' : '') + '</div>';
  var cols = inn.done, tag = {}; inn.fillers.forEach(function (m, i) { tag[m] = 'U' + (i + 1); });
  var rows = inn.done.length ? ndCompare(dept, day) : [], sel = ndSelOf(dept, day);
  var cnt = { met: 0, spot: 0, unmet: 0, diff: 0, re: 0 }; rows.forEach(function (x) { if (x.re) cnt.re++; else if (x.kind === 'diff') cnt.diff++; else if (x.kind === 'unmet') cnt.unmet++; else if (x.spot) cnt.spot++; else if (x.kind === 'met') cnt.met++; });
  h += '<div class="nx-sum"><div><b>' + cnt.met + '</b><small>agreed Met · auto</small></div><div><b class="y">' + cnt.diff + '</b><small>disagree</small></div><div><b class="p">' + cnt.unmet + '</b><small>agreed unmet</small></div><div><b>' + cnt.spot + '</b><small>spot-check</small></div></div>';
  h += '<div class="nx-in-row"><b>Cards in:</b>' + inn.fillers.map(function (m) {
    var k = inn.done.indexOf(m) >= 0 ? 'ok' : inn.absent.indexOf(m) >= 0 ? 'na' : 'wait';
    return '<span class="' + k + '">' + tag[m] + ' ' + ndEsc(nxFirst(m)) + (k === 'ok' ? ' ✓' : k === 'na' ? ' · not filled' : ' · awaited') + (k === 'wait' && can ? '<button type="button" onclick="ndAbsent(\'' + dept + '\',' + day + ',\'' + m + '\')">Not filled today</button>' : '') + '</span>';
  }).join('') + (inn.fillers.length ? '' : '<span class="na">No team set — the in-charge adds people in Set-up</span>') + '</div>';
  if (!inn.done.length) return h + '<div class="nx-card"><div class="nx-empty"><i class="ti ti-clock"></i><b>No card is done yet</b><br>The comparison opens when the cards come in.</div></div></div>';
  if (inn.waiting.length && !res.chk) h += '<div class="nx-ban o"><span>Waiting for ' + inn.waiting.map(ndName).map(ndEsc).join(', ') + '. Check now by marking them "Not filled today", or wait.</span></div>';
  var grid = 'grid-template-columns:minmax(0,1fr)' + cols.map(function () { return ' 34px'; }).join('');
  var chip = function (v) { return '<span class="nx-m' + (v === undefined ? '' : ' s' + v) + '">' + (v === undefined ? '–' : ['N', 'P', 'M'][v]) + '</span>'; };
  var curOf = function (x) { return res.chk ? (res.esc && res.esc[x.id] ? 'esc' : (res.f || {})[x.id]) : (x.id in sel ? sel[x.id] : (x.kind === 'met' || x.kind === 'unmet' ? x.sc[0].s : undefined)); };
  var sub = function (x) { var t = []; x.sc.forEach(function (v) { var rr = ndReason(v.r); if (v.s < 2 && (rr || v.note)) t.push(tag[v.m] + ': ' + (v.note ? '“' + v.note + '”' : rr.t.toLowerCase())); }); return t.join(' · '); };
  var btn = function (x, v, label, cls) { var cur = curOf(x); return '<button type="button" class="' + cls + (cur === v ? ' on' : '') + '"' + (!can ? ' disabled' : '') + ' onclick="ndPick(\'' + dept + '\',' + day + ',\'' + x.id + '\',' + (v === 'esc' ? '\'esc\'' : v) + ')">' + label + '</button>'; };
  var row = function (x, btns, where) {
    var by = {}; x.sc.forEach(function (v) { by[v.m] = v; }); var s2 = sub(x);
    return '<div class="nx-r nd-cmpr" id="nd-cmp-' + x.id + '" style="' + grid + '"><div><b>' + ndEsc(ndCpText(x.id)) + '</b><small>' + ndEsc(x.id + (s2 ? ' · ' + s2 : '')) + '</small></div>' + cols.map(function (m) { return chip((by[m] || {}).s); }).join('') + (btns ? '<div class="nx-3">' + btns + '</div>' : '') + (where ? '<small class="nx-where">' + ndEsc(where) + '</small>' : '') + '</div>';
  };
  var look = rows.filter(function (x) { return x.look; }), toLeadOk = !!ndLead(dept) && ndChecker(dept) !== ndLead(dept);   // the lead settles disputes herself
  h += '<div class="nx-card p0 nd-cmpt"><div class="nx-r hd" style="' + grid + '"><span>Checkpoint</span>' + cols.map(function (m) { return '<span title="' + ndEsc(ndName(m)) + '">' + tag[m] + '</span>'; }).join('') + '</div>';
  var G = function (k, t, list) { return list.length ? '<div class="nx-grp ' + k + '"><span>' + t + '</span><span>' + list.length + '</span></div>' : ''; };
  var reL = look.filter(function (x) { return x.re; }), diffL = look.filter(function (x) { return !x.re && x.kind === 'diff'; }), unL = look.filter(function (x) { return !x.re && x.kind === 'unmet'; }), spL = look.filter(function (x) { return !x.re && x.kind === 'met'; });
  h += G('re', 'Re-check of a fixed action', reL) + reL.map(function (x) { var low = x.low === null ? 0 : Math.min(x.low, 1), cur = curOf(x); return row(x, btn(x, 2, 'Confirm fixed', 's2') + btn(x, low, 'Still unmet → Supervisor', 's0'), cur === undefined ? 'Fixed by ' + ndName(((_nd.actions || {})[x.id] || {}).fixed ? _nd.actions[x.id].fixed.by : '') : cur === 2 ? 'Action closed' : 'Goes to the Facility Supervisor'); }).join('');
  h += G('diff', 'Disagree — you decide', diffL) + diffL.map(function (x) {
    var cur = curOf(x);
    if (x.tks && x.dk.length) return row(x, '', '') + nxCmpItems(x, cols, tag, dept, day, can, res, sel) + (toLeadOk ? '<div class="nx-r" style="' + grid + ';border-top:0;padding-top:0"><div class="nx-3">' + btn(x, 'esc', 'Can’t tell — send to the lead', 'esc') + '</div><small class="nx-where">' + ndEsc(cur === undefined ? 'Answer the item(s) they differ on' : cur === 'esc' ? 'The lead decides' : cur === 2 ? 'Closed as Met' : ND_SNAME[cur] + ' — the lead assigns an action') + '</small></div>' : '');
    return row(x, btn(x, 2, 'Met', 's2') + btn(x, 1, 'Partial', 's1') + btn(x, 0, 'Not met', 's0') + (toLeadOk ? btn(x, 'esc', 'To lead', 'esc') : ''), cur === undefined ? (toLeadOk ? 'Choose, or send to the lead' : 'Choose the score') : cur === 'esc' ? 'The lead decides' : cur === 2 ? 'Closed as Met' : 'The lead assigns an action'); }).join('');
  if (unL.length) { var showAll = _nd.cmpMore || unL.length <= 3; h += G('unmet', 'Agreed unmet — goes to the lead for an action', unL) + unL.slice(0, showAll ? 99 : 2).map(function (x) { return row(x, '', ''); }).join('') + (showAll ? '' : '<button type="button" class="nx-more" style="border-top:1px solid #F1F5F9" onclick="_nd.cmpMore=1;ndKeepScroll()">+' + (unL.length - 2) + ' more</button>'); }
  h += G('spot', 'Spot-check (1 in ' + ND_SPOT + ' agreed Met) · look at it yourself', spL) + spL.map(function (x) { return row(x, btn(x, 2, 'Yes, Met', 's2') + btn(x, 0, 'No — not met', 's0'), ''); }).join('');
  var auto = rows.filter(function (x) { return x.kind === 'met' && !x.look; });
  if (auto.length) h += '<button type="button" class="nx-grp met" onclick="_nd.cmpMet=!_nd.cmpMet;ndKeepScroll()"><span>Agreed Met — confirmed automatically</span><span>' + auto.length + ' ' + (_nd.cmpMet ? '▾' : '›') + '</span></button>' + (_nd.cmpMet ? auto.map(function (x) { return row(x, '', ''); }).join('') : '');
  h += '</div><div class="nx-dim">' + cols.map(function (m) { return tag[m] + ' = ' + ndEsc(ndName(m)); }).join(' · ') + ' · M Met · P Partial · N Not met</div>';
  if (can) {
    var open = diffL.filter(function (x) { return !(x.id in sel); }).length, toLead = 0, forAct = 0;
    rows.forEach(function (x) { var v = curOf(x); if (v === 'esc') toLead++; else if (v !== undefined && v < 2 && !x.re) forAct++; });
    h += '<button type="button" class="nx-btn nd-btn" id="nd-chk-done"' + (open || inn.waiting.length ? ' disabled title="' + (inn.waiting.length ? 'Some cards are still awaited' : 'Settle every difference or send it to the lead') + '"' : '') + ' onclick="ndCheckDone(\'' + dept + '\',' + day + ')">'
      + (open ? open + ' difference' + (open > 1 ? 's' : '') + ' to settle' : 'Done · ' + toLead + ' to lead · ' + forAct + ' for actions') + '</button>';
  }
  return h + '</div>';
}

// the items of a checkpoint the cards differ on: each card's ✓ / ✗, the checker answers the differing ones (Step 2d)
function nxCmpItems(x, cols, tag, dept, day, can, res, sel) {
  var its = ndCt(x.id).items, by = {}; x.sc.forEach(function (v, i) { by[v.m] = x.tks[i]; });
  var ft = res.chk ? ndTk((res.ft || {})[x.id], its.length) : null;
  var gridI = 'grid-template-columns:minmax(0,1fr)' + cols.map(function () { return ' 34px'; }).join('');
  return '<div class="nx-cmpi">' + its.map(function (it, k) {
    var diff = x.dk.indexOf(k) >= 0, a = sel[x.id + '#' + k];
    var cells = cols.map(function (m) { var t = (by[m] || [])[k]; return '<span class="nx-tkc ' + (t === 1 ? 'y' : t === 0 ? 'n' : '') + '">' + (t === 1 ? '✓' : t === 0 ? '✗' : '–') + '</span>'; }).join('');
    var h = '<div class="nx-cmpir' + (diff ? ' d' : '') + '" style="' + gridI + '"><span>' + ndEsc(ndItemTxt(it)) + (diff ? '<small>They differ here</small>' : '') + '</span>' + cells + '</div>';
    if (diff && !res.chk) h += '<div class="nx-3 nx-cmpib"><button type="button" class="s2' + (a === 1 ? ' on' : '') + '"' + (can ? '' : ' disabled') + ' onclick="ndPickItem(\'' + dept + '\',' + day + ',\'' + x.id + '\',' + k + ',1)">Yes ✓</button><button type="button" class="s0' + (a === 0 ? ' on' : '') + '"' + (can ? '' : ' disabled') + ' onclick="ndPickItem(\'' + dept + '\',' + day + ',\'' + x.id + '\',' + k + ',0)">No ✗</button></div>';
    return h;
  }).join('') + '</div>';
}

// ═══ Lead › Decide & assign (full screen) ═══
function ndLeadOpen(t) { var me = ndMob(); _nd.screen = 'lead'; _nd.ltab = t || (ndEscItems(me).length ? 'dec' : ndUnassigned(me).length ? 'asg' : 'plan'); _nd.card = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndLeadClose() { _nd.screen = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function nxLeadActs(me) { var A = _nd.actions || {}, mine = {}; nxLeads(me).forEach(function (d) { mine[d.id] = 1; }); return Object.keys(A).filter(function (id) { return mine[A[id].dept] && A[id].status !== 'closed'; }); }
function ndLeadScreenHTML() {
  var me = ndMob(), leads = nxLeads(me), esc = ndEscItems(me), un = ndUnassigned(me), acts = nxLeadActs(me), tab = _nd.ltab || 'dec';
  var h = nxBk('ndLeadClose()', leads.length === 1 ? leads[0].name + ' · lead' : 'Decide & assign', ndName(me) + ' · ' + nxRoleOf(me), '<span class="nd-qb" id="nd-q" hidden></span>') + '<div class="nx">';
  var b = function (k, t, n) { return '<button type="button" class="' + (tab === k ? 'on' : '') + '" onclick="_nd.ltab=\'' + k + '\';ndKeepScroll()">' + t + ' · ' + n + '</button>'; };
  h += '<div class="nx-seg">' + b('dec', 'To decide', esc.length) + b('asg', 'To assign', un.length) + b('plan', 'Actions', acts.length) + '</div>';
  if (tab === 'dec') {
    if (!esc.length) return h + '<div class="nx-card"><div class="nx-empty"><i class="ti ti-circle-check"></i>Nothing to decide. Differences the checker sends to you appear here.</div></div></div>';
    esc.forEach(function (x) {
      var r = _nd.byId[x.id]; if (!r) return; var cards = ndPc(x.dept, x.day), res = ndRes(x.dept, x.day), fl = ndCardsIn(x.dept, x.day).fillers, tags = '', notes = [];
      Object.keys(cards).forEach(function (m) { var c = cards[m] || {}; if (!c.done || c.absent || (c.s || {})[x.id] === undefined) return; var v = c.s[x.id], rr = ndReason((c.r || {})[x.id]), u = 'U' + (fl.indexOf(m) + 1); tags += '<span class="' + ['r', 'a', 'g'][v] + '">' + u + ' ' + ND_SNAME[v] + '</span>'; if (v < 2 && (rr || (c.note || {})[x.id])) notes.push(nxFirst(m) + ': ' + ((c.note || {})[x.id] ? '“' + c.note[x.id] + '”' : rr.t)); });
      var left = ND_DECIDE_DUE_H - ndHours((res.chk || {}).at);
      h += '<div class="nx-card p0"><div class="nx-hd v"><span>Sent to you by ' + ndEsc(nxRoleOf(ndChecker(x.dept)) + ' ' + nxFirst(ndChecker(x.dept))) + ' · ' + ndEsc(x.dept) + ' Day ' + x.day + '</span><span>' + (left >= 0 ? 'due in ' + Math.max(1, Math.round(left)) + ' h' : 'waiting ' + Math.round(-left + ND_DECIDE_DUE_H) + ' h') + '</span></div>'
        + '<div class="nx-it" style="border-top:0"><div class="nx-tg"><span>' + ndEsc(x.id) + '</span>' + tags + '</div><b>' + ndEsc(r[5]) + '</b>' + (notes.length ? '<span class="nx-dim">' + ndEsc(notes.join(' · ')) + '</span>' : '')
        + '<div class="nx-3">' + [2, 1, 0].map(function (v) { return '<button type="button" class="s' + v + '" onclick="ndDecide(\'' + x.dept + '\',' + x.day + ',\'' + x.id + '\',' + v + ')">' + ND_SNAME[v] + '</button>'; }).join('') + '</div></div></div>';
    });
    return h + '</div>';
  }
  if (tab === 'asg') {
    if (!un.length) return h + '<div class="nx-card"><div class="nx-empty"><i class="ti ti-circle-check"></i>Nothing to assign. Every unmet checkpoint has an action.</div></div>' + nxPlanHTML(me, false) + '</div>';
    var staff = ndStaff(), mobs = Object.keys(staff).sort(function (a, c) { return String(staff[a].name || '').localeCompare(String(staff[c].name || '')); });
    var page = un.slice(0, 10), rest = un.length - page.length;   // ten at a time: after the baseline a lead can have many
    h += '<div class="nx-card p0"><div class="nx-hd r"><span>Assign actions — text is ready, change if needed</span><span>' + un.length + '</span></div>';
    page.forEach(function (x) {
      var sg = ndSuggest(x.id, x.dept, x.day), cards = ndPc(x.dept, x.day), tally = {}, best = null, note = '';
      Object.keys(cards).forEach(function (m) { var c = cards[m] || {}; if (!c.done || c.absent) return; var v = (c.s || {})[x.id]; if (v === 0 || v === 1) { var k = (c.r || {})[x.id]; if (k) tally[k] = (tally[k] || 0) + 1; if ((c.note || {})[x.id] && !note) note = nxFirst(m) + ': “' + c.note[x.id] + '”'; } });
      Object.keys(tally).forEach(function (k) { if (!best || tally[k] > tally[best]) best = k; });
      var rr = ndReason(best), other = sg.src !== 'm' && (!rr || rr.k === 'oth'), how = other ? '' : sg.how, miss = ndMissed(x.id, x.dept, x.day);
      h += '<div class="nx-it nd-asg" id="nd-asg-' + x.id + '" data-dept="' + x.dept + '"><div class="nx-tg"><span>' + ndEsc(x.id) + '</span><span class="' + (x.s === 0 ? 'r' : 'a') + '">' + (x.s === 0 ? 'Not met' : 'Partial') + (rr ? ' · ' + ndEsc(rr.t) : '') + '</span>' + (leads.length > 1 ? '<span class="t">' + ndEsc(x.dept) + '</span>' : '') + '</div><b>' + ndEsc(ndCpText(x.id)) + '</b>'
        + (miss.length ? '<div class="nx-miss">Not met: ' + ndItemNames(x.id, miss.join(',')).map(ndEsc).join(' · ') + '</div>' : '')
        + (sg.src === 'm' ? '<div class="nx-how g"><b>How to fix' + (sg.k ? ' · item ' + ndEsc(sg.k) : '') + '</b> · ' + (sg.each ? 'each staff member in ' + ndEsc(ndDeptDef(x.dept).name) : 'one person fixes') + (sg.ev ? '<br>Evidence: ' + ndEsc(sg.ev) : '') + (sg.tm ? '<br>Time needed: ' + ndEsc(sg.tm) : '') + '</div>' : '')
        + (other ? '<div class="nx-how a">' + (note ? ndEsc(note) + ' — write the action:' : 'No How to fix written by HealSol yet — write the action:') + '</div>' : '')
        + '<textarea class="nx-in" data-k="how" maxlength="1500" rows="' + (sg.src === 'm' ? 4 : 2) + '" placeholder="Type what needs to be done…"' + (other ? '' : ' style="background:#F0FDF4;border-color:#BBF7D0;color:#14532D"') + ' data-orig="' + ndEsc(sg.src === 'm' ? sg.how : '') + '" data-mk="' + ndEsc(sg.k || '') + '" data-ev="' + ndEsc(sg.ev || '') + '" data-tm="' + ndEsc(sg.tm || '') + '" data-each="' + (sg.each ? 1 : '') + '">' + ndEsc(how) + '</textarea>'
        + (sg.src === 'm' ? '<span class="nx-dim">Change the steps for this facility if needed — HealSol\'s master stays as it is.</span>' : '')
        + '<div class="nx-meta">' + (sg.each ? '<label>Owner<select data-k="owner"><option value="' + ndEsc(sg.owner) + '" selected>Everyone in ' + ndEsc(ndDeptDef(x.dept).name) + '</option></select></label>' : '<label>Owner<select data-k="owner">' + mobs.map(function (m) { return '<option value="' + m + '"' + (m === sg.owner ? ' selected' : '') + '>' + ndEsc(nxFirst(m) + ' · ' + nxRoleOf(m)) + '</option>'; }).join('') + '</select></label>')
        + '<label>Due<input type="date" data-k="due" value="' + ndEsc(sg.due) + '"></label></div></div>';
    });
    h += '<div class="nx-it"><button type="button" class="nx-btn" onclick="ndAssignForm()">' + (rest ? 'Assign these ' + page.length + ' actions' : 'Assign all ' + un.length + ' action' + (un.length > 1 ? 's' : '')) + '</button>' + (rest ? '<span class="nx-dim nx-c">' + rest + ' more come up next.</span>' : '') + '<span class="nx-dim nx-c">Owners see them in "My actions". ' + ndEsc(un.length && ndChecker(un[0].dept) ? nxRoleOf(ndChecker(un[0].dept)) + ' ' + nxFirst(ndChecker(un[0].dept)) : 'The checker') + ' re-checks on the next card.</span></div></div>';
    return h + '</div>';
  }
  return h + nxPlanHTML(me, false) + nxActListsHTML(acts) + '</div>';
}
function ndAssignForm() {
  var up = {}, n = 0, skip = [];
  [].forEach.call(document.querySelectorAll('#nf-dept-app .nd-asg'), function (el) {
    var id = el.id.replace('nd-asg-', ''), dept = el.getAttribute('data-dept'), g = function (k) { var x = el.querySelector('[data-k="' + k + '"]'); return x ? String(x.value || '').trim() : ''; };
    var how = g('how'), owner = g('owner'), due = g('due'), ta = el.querySelector('[data-k="how"]');
    if (how.length < 3 || !/^\d{10}$/.test(owner) || !/^\d{4}-\d{2}-\d{2}$/.test(due)) { skip.push(id); return; }
    var orig = ta ? ta.getAttribute('data-orig') || '' : '', x = { how: how.slice(0, 1500), owner: owner, due: due };
    if (ta && ta.getAttribute('data-mk')) x.k = ta.getAttribute('data-mk');
    if (orig) { x.ev = ta.getAttribute('data-ev') || ''; x.tm = ta.getAttribute('data-tm') || ''; x.each = !!ta.getAttribute('data-each'); if (orig.replace(/\s+/g, ' ').trim() === how.replace(/\s+/g, ' ').trim()) x.src = 'm'; }
    ndAssignUp(up, id, dept, x); n++;
  });
  if (n) ndPut(up);
  if (skip.length) { ndToast((n ? n + ' assigned. ' : '') + 'Write the action for ' + skip.join(', ') + '.', 'err'); var el = document.getElementById('nd-asg-' + skip[0]); ndKeepScroll(); if (el) try { document.getElementById('nd-asg-' + skip[0]).scrollIntoView({ block: 'center' }); } catch (e) {} return; }
  ndToast(n + ' action' + (n > 1 ? 's' : '') + ' assigned.', 'ok'); if (!ndUnassigned(ndMob()).length) _nd.ltab = 'plan'; ndKeepScroll(); try { window.scrollTo(0, 0); } catch (e) {}
}
// this week's plan by owner, with a WhatsApp message (one per person, and the whole plan)
function nxPlanHTML(me, ro) {
  var A = _nd.actions || {}, today = ndToday(), wk = ndAddDays(today, 7), mine = {};
  (_nd.view ? ndDeptDefs() : nxLeads(me)).forEach(function (d) { mine[d.id] = 1; });
  var ids = Object.keys(A).filter(function (id) { return mine[A[id].dept] && (A[id].status === 'open' || A[id].status === 'fixed' || A[id].status === 'sup'); });
  var owners = {}; ids.forEach(function (id) { var o = A[id].status === 'sup' ? '__sup' : A[id].owner; (owners[o] = owners[o] || []).push(id); });
  var all = 'NQAS | FAST — ' + (_nd.fac.name || _nd.code) + '\nAction plan (next 7 days):\n' + ids.filter(function (i) { return A[i].status === 'open' && A[i].due <= wk; }).map(function (i, k) { return (k + 1) + '. ' + ndName(A[i].owner) + ': ' + A[i].how + ' (due ' + ndDate(A[i].due) + ')'; }).join('\n');
  var h = '<div class="nx-card p0"><div class="nx-hd b"><span>This week\'s plan</span>' + (ids.length ? '<a class="nx-wa" style="color:#1D4ED8" target="_blank" rel="noopener" href="' + ndEsc('https://wa.me/?text=' + encodeURIComponent(all)) + '">Share on WhatsApp ›</a>' : '') + '</div>';
  if (!ids.length) return h + '<div class="nx-empty">No open actions.</div></div>';
  Object.keys(owners).sort(function (a, b) { return a === '__sup' ? 1 : b === '__sup' ? -1 : String(ndName(a)).localeCompare(String(ndName(b))); }).forEach(function (o) {
    var list = owners[o], openN = list.filter(function (i) { return A[i].status === 'open'; }).length, fx = list.filter(function (i) { return A[i].status === 'fixed'; }).length, late = list.filter(function (i) { return A[i].status === 'open' && A[i].due < today; }).length;
    var msg = 'NQAS | FAST — ' + (_nd.fac.name || _nd.code) + '\nYour actions:\n' + list.filter(function (i) { return A[i].status === 'open'; }).map(function (i, k) { return (k + 1) + '. ' + ndCpText(i) + ' — ' + A[i].how + ' (due ' + ndDate(A[i].due) + ')'; }).join('\n');
    h += '<details class="nx-it" style="gap:0"><summary style="display:flex;align-items:center;gap:10px;cursor:pointer;list-style:none"><span style="flex:1;font-size:12.5px"><b>' + ndEsc(o === '__sup' ? 'Facility Supervisor' : ndName(o)) + '</b> · ' + (o === '__sup' ? list.length + ' for a how-to-fix' : openN + ' open' + (fx ? ' · ' + fx + ' fixed' : '')) + '</span>'
      + '<span class="nx-chip ' + (o === '__sup' ? '' : late ? 'r' : 'g') + '" style="font-size:10.5px;padding:2px 8px' + (o === '__sup' ? ';background:#F5F3FF;color:#5B21B6' : '') + '">' + (o === '__sup' ? 'how to fix' : late ? late + ' late' : 'on track') + '</span></summary>'
      + '<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">' + (o !== '__sup' && openN && !ro ? '<a class="nx-wa" target="_blank" rel="noopener" href="' + ndEsc(ndWaLink(o, msg)) + '"><i class="ti ti-send"></i> WhatsApp ' + ndEsc(nxFirst(o)) + '</a>' : '') + list.map(nxActCard).join('') + '</div></details>';
  });
  return h + '</div>';
}
function nxActListsHTML(acts) {
  var A = _nd.actions || {}, me = ndMob(), mine = {}; (_nd.view ? ndDeptDefs() : nxLeads(me)).forEach(function (d) { mine[d.id] = 1; });
  var closed = Object.keys(A).filter(function (id) { return mine[A[id].dept] && A[id].status === 'closed'; });
  return closed.length ? '<details class="nx-card"><summary style="cursor:pointer;font-weight:700;font-size:14px">Closed · ' + closed.length + '</summary>' + closed.map(nxActCard).join('') + '</details>' : '';
}
// HealSol / Supervisor "Actions" tab
function ndActionsPageHTML() {
  var A = _nd.actions || {}, ids = Object.keys(A), by = function (s) { return ids.filter(function (i) { return A[i].status === s; }).length; };
  return '<div class="nx-ph"><div class="nx-ph-in" style="padding-bottom:14px"><div class="nx-ph-r"><h1>Actions</h1><span class="nd-qb" id="nd-q" hidden></span><span class="nx-chip t">' + ndEsc(_nd.fac.name || _nd.code) + '</span></div></div></div><div class="nx">'
    + '<div class="nx-stat"><div><b>' + by('open') + '</b><small>open</small></div><div><b>' + by('fixed') + '</b><small>re-check due</small></div><div><b style="color:#991B1B">' + by('sup') + '</b><small>with the Supervisor</small></div><div><b style="color:#166534">' + by('closed') + '</b><small>closed</small></div></div>'
    + nxPlanHTML(ndMob(), true) + nxActListsHTML() + '</div>';
}
function ndSetupPageHTML() { return nxBk("ndTab('me')", 'Set-up', 'Staff, departments and the start date') + '<main class="nd-main">' + ndSetupHTML() + '</main>'; }

// ═══ Facility Supervisor › How to fix (own screen) ═══
function nxSupEdit(id) { _nd.tab = 'fix'; _nd.supOpen = id; ndRender(); setTimeout(function () { var el = document.getElementById('nx-sup-' + id); if (el) try { el.scrollIntoView({ block: 'start' }); } catch (e) {} }, 60); }
function nxOrigin(id, a) {   // the checked day on which the checkpoint was found unmet before the lead's action
  var L = a.prev || a, lim = nxDayOfIso(L.at) || 999, days = _nd.cards[a.dept] || {}, best = null;
  Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), f = (days[k] || {}).f || {}; if (n <= lim && f[id] !== undefined && f[id] < 2 && (best === null || n > best)) best = n; });
  return best;
}
function nxIsSupRec(a) { return !!a && !!a.by && !/^\d{10}$/.test(String(a.by)); }   // written by the Supervisor (by = supervisor id, not a mobile)
function nxHistHTML(id, a) {
  var out = [], o = nxOrigin(id, a), sr = nxIsSupRec(a), L = a.prev || (!sr ? a : null), fx1 = a.prev ? a.prev.fixed : a.fixed, rc1 = a.prev ? a.prev.rc : a.rc;
  if (o) { var cards = ndPc(a.dept, o), who = [], rsn = ''; Object.keys(cards).forEach(function (m) { var c = cards[m] || {}; if (c.done && (c.s || {})[id] < 2) { who.push(nxFirst(m)); if (!rsn) { var rr = ndReason((c.r || {})[id]); rsn = (c.note || {})[id] || (rr ? rr.t : ''); } } });
    out.push(['r', 'Day ' + o, (who.length ? who.join(' & ') + ' marked ' : 'Found ') + ND_SNAME[(ndRes(a.dept, o).f || {})[id] || 0] + (rsn ? ' — ' + rsn : '')]); }
  if (L) out.push(['v', 'Day ' + (nxDayOfIso(L.at) || '?'), 'Lead ' + (L.byName || ndName(L.by)) + ': “' + L.how + '” → ' + ndName(L.owner) + ', due ' + ndShortDate(L.due)]);
  if (fx1) out.push(['g', 'Day ' + (fx1.day || nxDayOfIso(fx1.at) || '?'), ndName(fx1.by) + ' marked fixed' + (fx1.note ? ' — ' + fx1.note : '')]);
  if (rc1) out.push(['r', 'Day ' + (nxDayOfIso(rc1.at) || '?'), 'Re-check by ' + ndName(rc1.by) + ': still ' + ND_SNAME[rc1.s]]);
  if (sr) {
    out.push(['o', 'Day ' + (nxDayOfIso(a.at) || '?'), 'Supervisor' + (a.byName ? ' ' + a.byName : '') + ': “' + a.how + '” → ' + ndName(a.owner) + ', due ' + ndShortDate(a.due)]);
    if (a.prev && a.fixed) out.push(['g', 'Day ' + (a.fixed.day || nxDayOfIso(a.fixed.at) || '?'), ndName(a.fixed.by) + ' marked fixed' + (a.fixed.note ? ' — ' + a.fixed.note : '')]);
    if (a.prev && a.rc) out.push(['r', 'Day ' + (nxDayOfIso(a.rc.at) || '?'), 'Re-check by ' + ndName(a.rc.by) + ': still ' + ND_SNAME[a.rc.s]]);
  }
  return out.map(function (x) { return '<div class="nx-hist"><i class="' + x[0] + '"></i><span><b>' + ndEsc(x[1]) + '</b> · ' + ndEsc(x[2]) + '</span></div>'; }).join('');
}
function ndSupHTML() {
  var A = _nd.actions || {}, ids = Object.keys(A), f = _nd.supDept || '';
  var need = ids.filter(function (i) { return A[i].status === 'sup'; }), prog = ids.filter(function (i) { return A[i].level === 'sup' && (A[i].status === 'open' || A[i].status === 'fixed'); }), done = ids.filter(function (i) { return A[i].level === 'sup' && A[i].status === 'closed'; });
  var h = nxBk('ndCloseView()', 'How to fix', (_nd.supName ? _nd.supName + ' · ' : '') + 'Facility Supervisor · ' + (_nd.fac.name || _nd.code), '<span class="nd-qb" id="nd-q" hidden></span>') + '<div class="nx">';
  h += '<div class="nx-sum red c3"><div><b>' + need.length + '</b><small>need your fix</small></div><div><b class="y">' + prog.length + '</b><small>your fixes in progress</small></div><div><b class="gg">' + done.length + '</b><small>closed after your fix</small></div></div>';
  var dset = {}; need.forEach(function (i) { dset[A[i].dept] = (dset[A[i].dept] || 0) + 1; });
  if (Object.keys(dset).length > 1) h += '<div class="nx-pills"><button type="button" class="nx-pill' + (!f ? ' on' : '') + '" onclick="_nd.supDept=\'\';ndKeepScroll()">All departments · ' + need.length + '</button>' + Object.keys(dset).map(function (d) { return '<button type="button" class="nx-pill' + (f === d ? ' on' : '') + '" onclick="_nd.supDept=\'' + d + '\';ndKeepScroll()">' + ndEsc(ndDeptDef(d).name) + ' · ' + dset[d] + '</button>'; }).join('') + '</div>';
  var list = need.filter(function (i) { return !f || A[i].dept === f; }).sort(function (x, y) { return String((A[x].rc || {}).at || A[x].at).localeCompare(String((A[y].rc || {}).at || A[y].at)); });
  if (!list.length) h += '<div class="nx-card"><div class="nx-empty"><i class="ti ti-circle-check"></i>Nothing waiting for your how-to-fix. Checkpoints come here only when they are still unmet after the lead\'s action and the re-check.</div></div>';
  var open = _nd.supOpen && A[_nd.supOpen] ? _nd.supOpen : list[0];
  list.forEach(function (id) { h += id === open ? nxSupItem(id, true) : nxSupItem(id, false); });
  if (open && list.indexOf(open) < 0 && A[open]) h += nxSupItem(open, true);
  if (prog.length) h += '<div class="nx-card p0"><div class="nx-hd a"><span>Your fixes in progress · ' + prog.length + '</span></div>' + prog.map(function (id) {
    var a = A[id], late = a.status === 'open' && a.due < ndToday();
    return '<div class="nx-it row"><span><b>' + ndEsc(id) + '</b> · ' + ndEsc(nxFirst(a.owner) + ' (' + nxRoleOf(a.owner) + ')') + ' · due ' + ndEsc(ndShortDate(a.due)) + '</span><span class="nx-chip ' + (a.status === 'fixed' ? '' : late ? 'r' : 'g') + '" style="font-size:10.5px;padding:2px 8px;flex:none">' + (a.status === 'fixed' ? 're-check' : late ? 'late' : 'on time') + '</span><button type="button" class="nx-lnk" onclick="nxSupEdit(\'' + id + '\')">Change</button></div>';
  }).join('') + '</div>';
  return h + '<div class="nx-dim nx-c">After your fix, ' + ndEsc('the checker') + ' re-checks it on the next card. If it is Met, it closes and the lead and the owner see it.</div></div>';
}
function nxSupItem(id, openIt) {
  var a = (_nd.actions || {})[id]; if (!a) return '';
  var wait = Math.max(0, Math.floor(ndHours((a.rc || {}).at || a.at) / 24)), last = a.rc ? a.rc.s : null, src = a.prev || a;
  var head = '<div class="nx-hd r"><span>' + (a.status === 'sup' ? 'Still unmet after the lead\'s action' : 'Your fix · ' + (a.status === 'fixed' ? 'marked fixed, re-check due' : 'in progress')) + '</span><span>' + (a.status === 'sup' ? 'waiting ' + (wait ? wait + ' day' + (wait > 1 ? 's' : '') : 'since today') : '') + '</span></div>';
  var tags = '<div class="nx-tg"><span>' + ndEsc(id) + '</span><span class="t">' + ndEsc(ndDeptDef(a.dept).name) + '</span>' + (last !== null ? '<span class="r">' + ND_SNAME[last] + '</span>' : '') + (a.cause ? '<span class="a">' + ndEsc((ND_CAUSES.find(function (c) { return c.k === a.cause; }) || {}).t || a.cause) + '</span>' : '') + '</div>';
  if (!openIt) return '<div class="nx-card p0" id="nx-sup-' + id + '">' + head + '<button type="button" class="nx-it row" style="border:0;background:none;width:100%;text-align:left;font-family:inherit;cursor:pointer" onclick="_nd.supOpen=\'' + id + '\';ndKeepScroll()"><span style="display:flex;flex-direction:column;gap:6px">' + tags + '<b style="font-size:13.5px;font-weight:600">' + ndEsc(ndCpText(id)) + '</b></span><i class="ti ti-chevron-right" style="color:#94A3B8"></i></button></div>';
  var staff = ndStaff(), mobs = Object.keys(staff).sort(function (x, y) { return String(staff[x].name || '').localeCompare(String(staff[y].name || '')); });
  var cause = (_nd.supCause || {})[id] !== undefined ? _nd.supCause[id] : (a.cause || '');
  var mineNow = nxIsSupRec(a) && a.status !== 'sup', how = mineNow ? a.how : '', owner = mineNow ? a.owner : (src.owner || ndLead(a.dept)), due = mineNow ? a.due : ndAddDays(ndToday(), 7);
  return '<div class="nx-card p0" id="nx-sup-' + id + '">' + head + '<div class="nx-it" style="border-top:0">' + tags + '<b>' + ndEsc(ndCpText(id)) + '</b></div>'
    + '<div class="nx-it"><span class="nx-lbl">What happened so far</span>' + nxHistHTML(id, a) + '</div>'
    + '<div class="nx-it y"><span class="nx-lbl" style="color:#92400E">How to fix — the root cause (one tap)</span><div class="nx-rs">' + ND_CAUSES.map(function (c) { return '<button type="button" class="' + (cause === c.k ? 'on' : '') + '" onclick="nxSupCause(\'' + id + '\',\'' + c.k + '\')">' + ndEsc(c.t) + '</button>'; }).join('') + '</div>'
    + '<span class="nx-lbl">Your instructions</span><textarea class="nx-in" id="nx-sh-' + id + '" maxlength="600" rows="3" placeholder="What should be done, by whom, and how it will be checked…">' + ndEsc(how) + '</textarea>'
    + '<div class="nx-meta"><label>Owner<select id="nx-so-' + id + '">' + mobs.map(function (m) { return '<option value="' + m + '"' + (m === owner ? ' selected' : '') + '>' + ndEsc(nxFirst(m) + ' · ' + nxRoleOf(m)) + '</option>'; }).join('') + '</select></label><label>Due<input type="date" id="nx-sd-' + id + '" value="' + ndEsc(due) + '"></label></div>'
    + '<div class="nx-meta"><label>Re-check by<span style="font-weight:700;color:#1E6B5E;font-size:12px">' + ndEsc(nxFirst(ndChecker(a.dept)) + ' (' + nxCheckerLabel(a.dept) + ')') + '</span></label><label>Lead sees it<span style="font-weight:700;color:#1E6B5E;font-size:12px">' + ndEsc(nxFirst(ndLead(a.dept)) || '—') + '</span></label></div></div>'
    + '<div class="nx-it"><div class="nx-two"><button type="button" class="nx-btn" onclick="ndSupSend(\'' + id + '\')">' + (a.status === 'sup' ? 'Send the fix' : 'Save changes') + '</button>' + (a.status === 'sup' ? '<button type="button" class="nx-btn ghost" onclick="ndSupAccept(\'' + id + '\')">Accept as is · close</button>' : '') + '</div></div></div>';
}
function nxSupCause(id, k) { _nd.supCause = _nd.supCause || {}; var cur = _nd.supCause[id] !== undefined ? _nd.supCause[id] : ((_nd.actions[id] || {}).cause || ''); _nd.supCause[id] = cur === k ? '' : k; var t = document.getElementById('nx-sh-' + id), keep = t ? t.value : null; ndKeepScroll(); if (keep !== null) { var t2 = document.getElementById('nx-sh-' + id); if (t2) t2.value = keep; } }
function nxSupRec(id, how, owner, due) {   // the action written by the Supervisor, keeping the lead's action and what happened as history
  var a = (_nd.actions || {})[id] || {}, cause = (_nd.supCause || {})[id] !== undefined ? _nd.supCause[id] : (a.cause || '');
  var rec = { dept: a.dept, how: how.slice(0, 600), owner: owner, due: due, status: 'open', level: 'sup', at: new Date().toISOString(), by: _nd.supId || 'sup', byName: String(_nd.supName || '').slice(0, 80) };
  if (cause) rec.cause = cause;
  var prev = a.prev || (!nxIsSupRec(a) && a.how ? { how: a.how, owner: a.owner, due: a.due, at: a.at, by: a.by, byName: a.byName || '' } : null);
  if (prev) { prev = Object.assign({}, prev); if (!a.prev) { if (a.fixed) prev.fixed = a.fixed; if (a.rc) prev.rc = a.rc; } rec.prev = prev; }
  return rec;
}
function ndSupSend(id) {
  var g = function (p) { var el = document.getElementById(p + id); return el ? String(el.value || '').trim() : ''; }, how = g('nx-sh-'), owner = g('nx-so-'), due = g('nx-sd-');
  if (how.length < 3) { ndToast('Write your instructions first.', 'err'); var t = document.getElementById('nx-sh-' + id); if (t) t.focus(); return; }
  if (!/^\d{10}$/.test(owner) || !/^\d{4}-\d{2}-\d{2}$/.test(due)) { ndToast('Choose the owner and the due date.', 'err'); return; }
  var up = {}; up['sc_dactions/' + _nd.code + '/' + id] = nxSupRec(id, how, owner, due);
  ndPut(up); if (_nd.supCause) delete _nd.supCause[id]; _nd.supOpen = null; ndToast('Sent to ' + ndName(owner) + '.', 'ok'); ndKeepScroll();
}
async function ndSupAccept(id) {
  var ok = true; try { if (typeof showConfirm === 'function') ok = await showConfirm('Close ' + id + ' as it is? Use this when nothing more can be done at the facility now. It stays in the record as accepted by you.', '✅', 'Accept as is', 'Close', 'var(--teal)'); } catch (e) {}
  if (!ok) return;
  var b = 'sc_dactions/' + _nd.code + '/' + id, up = {}; up[b + '/status'] = 'closed'; up[b + '/acc'] = { at: new Date().toISOString(), by: _nd.supId || 'sup', byName: String(_nd.supName || '').slice(0, 80) };
  ndPut(up); _nd.supOpen = null; ndToast(id + ' closed.', 'ok'); ndKeepScroll();
}

// ═══ bottom navigation ═══
function ndNavHTML() {
  var me = ndMob(), tab = _nd.tab, b = function (k, icon, label, em, on) { return '<button type="button" class="' + ((on !== undefined ? on : tab === k) ? 'on' : '') + '" onclick="ndTab(\'' + k + '\')"><i class="ti ' + icon + '"></i>' + label + (em ? '<em>' + em + '</em>' : '') + '</button>'; };
  if (_nd.view === 'sup') return '<nav class="nx-nav">' + b('fix', 'ti-tools', 'How to fix') + b('cards', 'ti-cards', 'Cards') + b('ready', 'ti-chart-bar', 'Progress') + b('actions', 'ti-checklist', 'Actions') + '</nav>';
  if (_nd.view) return '<nav class="nx-nav">' + b('today', 'ti-home', 'Today') + b('cards', 'ti-cards', 'Cards') + b('ready', 'ti-chart-bar', 'Progress') + b('actions', 'ti-checklist', 'Actions') + '</nav>';
  var jobs = nxJobCount(me);
  return '<nav class="nx-nav">' + b('today', 'ti-home', 'Today', jobs || '') + b('cards', 'ti-cards', 'Cards')
    + '<button type="button" class="nx-fab" aria-label="Continue today\'s card" title="Continue today\'s card" onclick="ndFab()"><i class="ti ti-player-play"></i></button>'
    + b('ready', 'ti-chart-bar', 'Progress') + b('me', 'ti-user', 'Me', '', tab === 'me' || tab === 'setup' || tab === 'dept') + '</nav>';
}
function ndFab() {
  var me = ndMob(), day = ndDay(); if (!_nd.fac.startDate || day < 1) { ndTab('today'); return; }
  var t = ndTodo(me); if (t.fill.length) ndGoCard(t.fill[0].id, day); else if (t.late.length) ndGoCard(t.late[0].dept, t.late[0].day); else { _nd.cday = Math.min(day, ndLastDay()); ndTab('cards'); }
}

// ═══ FACILITY DASHBOARD (UPHC Coordinator · MO in-charge) — own header and menu like the SC facility dashboard ═══
//   Header: Day n of 60 · Facility dashboard · name · package · refresh · "My cards" (their own staff screens).
//   Tabs: Home (readiness, needs your attention, quick actions, departments today) · Staff · Readiness · More.
function ndFaOn() { return !!_nd && !_nd.view && !!_nd.fa; }
function ndFaCan(mob) { return ndIsInCharge(mob) || ndSeesAll(mob); }
function ndFaOpen(t) { _nd.fa = true; _nd.fatab = t || _nd.fatab || 'home'; _nd.card = null; _nd.screen = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndFaTab(t) { _nd.fatab = t; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndMyCards() { _nd.fa = false; _nd.tab = 'today'; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function nxFaItems() {
  var me = ndMob(), day = ndDay(), n = _nd.cfg.days, out = [], A = _nd.actions || {}, staff = ndStaff();
  if (!_nd.fac.startDate) return out;   // the start date form is in the hero
  var others = Object.keys(staff).filter(function (m) { return m !== me; });
  if (others.length < 3) out.push({ ic: 'ti-user-plus', cls: 'a', t: 'Add your staff', s: 'Add the MO, Staff Nurse, ANM, LHV, Pharmacist, Lab Technician, USHAs …', go: "ndFaTab('staff')" });
  var chk = ndChecksDue(me);   // my comparisons and spot-checks, and anyone's that is over 24 h late
  chk.slice(0, 4).forEach(function (x) { var inn = ndCardsIn(x.dept, x.day), mine = ndChecker(x.dept) === me;
    out.push({ ic: x.solo ? 'ti-eye' : 'ti-list-check', cls: x.late ? 'r' : 'a', t: (x.solo ? 'Spot-check · ' : 'Compare the cards · ') + ndDeptDef(x.dept).name, s: 'Day ' + x.day + ' · ' + (x.solo ? 'one person fills' : inn.done.length + ' of ' + inn.fillers.length + ' sent') + (x.late ? ' · late' + (mine ? '' : ' — ' + nxFirst(ndChecker(x.dept)) + ' has not compared') : ''), go: "ndOpenDept('" + x.dept + "'," + x.day + ")" }); });
  if (chk.length > 4) out.push({ ic: 'ti-list-check', cls: 'a', t: (chk.length - 4) + ' more to compare', s: 'Open them from Cards', go: 'nxOpenFirstCheck()' });
  var esc = ndEscItems(me), un = ndUnassigned(me);
  if (esc.length || un.length) out.push({ ic: 'ti-checklist', cls: esc.some(function (x) { return x.late; }) ? 'r' : 'a', t: 'Decide & assign', s: [esc.length ? esc.length + ' to decide' : '', un.length ? un.length + ' action' + (un.length > 1 ? 's' : '') + ' to assign' : ''].filter(Boolean).join(' · '), go: 'ndLeadOpen()' });
  var over = Object.keys(A).filter(function (id) { var a = A[id]; return a.status === 'open' && ndHours(a.due + 'T23:59:59') > ND_ACTION_LATE_D * 24; });
  if (over.length) out.push({ ic: 'ti-alert-triangle', cls: 'r', t: over.length + ' action' + (over.length > 1 ? 's' : '') + ' overdue', s: 'Past the due date by ' + ND_ACTION_LATE_D + '+ days — remind the owners', go: "ndLeadOpen('plan')" });
  var sup = Object.keys(A).filter(function (id) { return A[id].status === 'sup'; }).length;
  if (sup) out.push({ ic: 'ti-tools', cls: 'v', t: sup + ' with the Facility Supervisor', s: 'Still unmet after the action — waiting for a how-to-fix', go: "ndLeadOpen('plan')" });
  if (day >= 2) { var idle = Object.keys(staff).filter(function (m) { if (m === me) return false; var any = false, mine = false; ndDeptDefs().forEach(function (d) { if (!ndFills(d.id, m)) return; mine = true; var days = _nd.pcards[d.id] || {}; Object.keys(days).forEach(function (k) { if ((days[k][m] || {}).done) any = true; }); }); return mine && !any; });
    if (idle.length) out.push({ ic: 'ti-user-question', cls: 'a', t: idle.length === 1 ? ndName(idle[0]) + ' has not completed any card yet' : idle.length + ' staff have not completed any card yet', s: idle.length === 1 ? 'Day ' + Math.min(day, n) + ' of the programme' : idle.map(nxFirst).slice(0, 5).join(', '), go: "ndFaTab('staff')" }); }
  return out;
}
function nxFaCount() { try { return nxFaItems().filter(function (x) { return x.cls === 'r'; }).length; } catch (e) { return 0; } }
function ndFaHTML() {
  var t = _nd.fatab || 'home', day = ndDay(), n = _nd.cfg.days, pk = nxPkg();
  var hd = '<div class="nx-fa-hd"><div class="nx-fa-hd-in"><div><small>' + (_nd.fac.startDate && day >= 1 ? 'Day ' + Math.min(day, n) + ' of ' + n + ' · ' : '') + 'Facility dashboard</small>'
    + '<h1><span>' + ndEsc(_nd.fac.name || _nd.code) + '</span>' + (pk ? '<span class="nx-pk"><b>' + ndEsc(_nd.cfg.short || 'UPHC') + '</b><span>' + pk + '</span></span>' : '') + '</h1></div>'
    + '<span class="nd-qb" id="nd-q" hidden></span><button type="button" class="nx-ib nd-rf" aria-label="Refresh" title="Refresh" onclick="ndReload()"><i class="ti ti-refresh"></i></button>'
    + '<button type="button" class="nx-mc" onclick="ndMyCards()"><i class="ti ti-cards"></i><span>My cards</span></button></div></div>';
  var body = t === 'staff' ? nxFaStaffHTML() : t === 'ready' ? nxFaReadyHTML() : t === 'more' ? nxFaMoreHTML() : nxFaHomeHTML();
  var c = nxFaCount(), b = function (k, icon, label, em) { return '<button type="button" class="' + (t === k ? 'on' : '') + '" onclick="ndFaTab(\'' + k + '\')"><i class="ti ' + icon + '"></i>' + label + (em ? '<em>' + em + '</em>' : '') + '</button>'; };
  return hd + '<div class="nx">' + body + '</div><nav class="nx-nav">' + b('home', 'ti-home', 'Home', c || '') + b('staff', 'ti-users', 'Staff') + b('ready', 'ti-chart-bar', 'Readiness') + b('more', 'ti-settings', 'More') + '</nav>';
}
function nxFaHomeHTML() {
  var day = ndDay(), n = _nd.cfg.days, all = ndDeptDefs().map(function (d) { return d.id; });
  var S = ndShape(), R = nxReady(all), B = nxReady(all, S.bN), cur = R.overall, gain = day > S.bN && B.overall !== null && cur !== null ? cur - B.overall : null;
  var ph = !_nd.fac.startDate ? 'Not started' : day < 1 ? 'Starts ' + nxLongDate(_nd.fac.startDate) : day > n ? 'Programme complete' : ndWeekLabel(day);
  var gs = null, rr = null; try { gs = ndGradScores(); rr = ndGradRule(gs, true); } catch (e) {}
  var why = []; if (rr) { var C = rr.crit; if (cur !== null && cur < C.overall) why.push('overall ' + cur + '% (needs ' + C.overall + '%)'); if (rr.deptFails.length) why.push(rr.deptFails.length === 1 ? ndDeptDef(rr.deptFails[0]).name + ' ' + gs.byDept[rr.deptFails[0]] + '% (needs ' + C.dept + '%)' : rr.deptFails.length + ' departments below ' + C.dept + '%'); if (rr.aocFails.length) why.push('Area' + (rr.aocFails.length === 1 ? ' ' : 's ') + rr.aocFails.join(', ') + ' below ' + C.aoc + '%'); if (rr.stdFails.length) why.push(rr.stdFails.length + ' Standard' + (rr.stdFails.length === 1 ? '' : 's') + ' below minimum'); }
  var nq = R.n === 0 ? 'Readiness appears once staff mark day cards as done.' : rr && rr.result === 'ready' ? '<b>✓ Meets NQAS criteria</b> — overall ' + cur + '%' : '<b>Not yet at NQAS</b> — ' + ndEsc(why.join(' · ') || 'not every checkpoint checked yet');
  var h = '<div class="nx-hero"><div class="nx-hero-row"><div class="nx-hero-txt"><div class="nx-hero-k">Facility readiness</div><div class="nx-hero-t" style="font-size:18px">' + ndEsc(ph) + '</div>'
    + '<div class="nx-hero-k">' + (_nd.fac.startDate && day >= 1 ? 'Day ' + Math.min(day, n) + ' of ' + n : _nd.fac.startDate ? '' : 'Start date not set') + '</div></div>'
    + '<div class="nx-ring">' + nxRing(cur || 0, 88, 9, '#fff', 'rgba(255,255,255,.2)') + '<span><b>' + (cur === null ? '–' : cur + '%') + '</b><small>readiness</small></span></div></div>'
    + '<div class="nx-hero-n"><div><b class="acc">' + (B.overall === null ? '–' : B.overall + '%') + '</b><small>Baseline</small></div><i></i><div><b>' + (gain === null ? '–' : (gain >= 0 ? '+' : '') + gain) + '</b><small>Growth</small></div><i></i><div><b>' + R.n + '<small style="font-size:13px;opacity:.8">/' + R.of + '</small></b><small>checked' + (R.of ? ' · ' + Math.round(100 * R.n / R.of) + '%' : '') + '</small></div></div>'
    + '<div class="nx-fa-nq">' + nq + '</div>'
    + (_nd.fac.startDate ? '<button type="button" class="nx-cta" onclick="ndFaTab(\'ready\')">Open readiness</button>' : '<div class="nx-card" style="color:#0F172A"><b>Set the programme start date</b><span class="nx-dim">All departments start the baseline together on this date (Day 1).</span>' + ndStartForm() + '</div>') + '</div>';
  var rw = _nd.fac.startDate && day >= S.r1 && day <= S.rN && !_nd.fac.graduation;
  if (_nd.fac.startDate && !rw) { var nxt = day < 1 ? 'Day 1 · ' + nfDateTxt(_nd.fac.startDate, true) : day <= S.bN ? 'Implementation starts on Day ' + (S.bN + 1) + ' · ' + nfDateTxt(nxDateOf(S.bN + 1), true) : day <= S.iN ? 'End-line starts on Day ' + (S.iN + 1) + ' · ' + nfDateTxt(nxDateOf(S.iN + 1), true) : day <= S.eN ? 'Readiness week starts on Day ' + (S.eN + 1) + ' · ' + nfDateTxt(nxDateOf(S.eN + 1), true) : '';
    h += oneProgCard({ S: S, day: day, gradDate: nxDateOf(n), next: nxt ? 'Next: ' + nxt : '' }); }
  h += ndGradTodayHTML();   // Step 3: readiness week (phase strip, end-line checks, If we graduated today) / graduation result / catch-up
  if (!rw && !_nd.fac.graduation && R.n > 0 && rr) { var RR = nfResult({ assessed: R.n, cov: R.of ? Math.round(100 * R.n / R.of) : null, meets: rr.result === 'ready', pct: cur, mark: rr.crit.overall, deptFails: rr.deptFails.map(function (x) { return ndDeptDef(x).name; }), aocFails: rr.aocFails, stdFails: rr.stdFails });
    h += oneIfGrad({ pct: cur, word: RR.word, cls: RR.cls, why: RR.cls === 'green' ? '' : RR.txt }); }
  var items = nxFaItems();
  h += '<div class="nx-sec"><b>Needs your attention</b>' + (items.length ? '<span class="nx-dim">' + items.length + '</span>' : '') + '</div>';
  h += items.length ? '<div class="nx-card p0 nx-list">' + items.map(function (x) { return nxLi(x.ic, x.cls === 'v' ? 'b' : x.cls, x.t, x.s, x.go); }).join('') + '</div>'
    : '<div class="nx-card"><div class="nx-empty"><i class="ti ti-circle-check"></i><b>All clear</b><br>Nothing needs your attention right now.</div></div>';
  h += '<div class="nx-sec"><b>Quick actions</b></div>' + oneQuick([['ti-user-plus', 'Add staff', "ndFaTab('staff');setTimeout(function(){var d=document.getElementById('nd-add');if(d){d.open=true;d.scrollIntoView({block:'center'});}},80)"], ['ti-checklist', 'Action plan', "ndLeadOpen('plan')", 'o'], ['ti-download', 'Download', "ndFaTab('more')", 'g']].concat(typeof scOpenLiveSessions === 'function' ? [['ti-broadcast', 'Live session', 'scOpenLiveSessions()']] : []));
  if (_nd.fac.startDate && day >= 1) h += nxDeptListHTML();
  return h;
}
function nxFaStaffHTML() {
  var staff = ndStaff(), me = ndMob(), day = Math.min(ndDay(), _nd.cfg.days), roles = (_nd.cfg.roles || []).map(function (r) { return r.id; });
  var mobs = Object.keys(staff).sort(function (a, b) { var ra = roles.indexOf(ndRole(a)), rb = roles.indexOf(ndRole(b)); return (ra - rb) || String(staff[a].name || '').localeCompare(String(staff[b].name || '')); });
  var have = {}; mobs.forEach(function (m) { have[ndRole(m)] = 1; });
  var miss = (_nd.cfg.roles || []).filter(function (r) { return !have[r.id] && r.id !== 'MO'; }).map(function (r) { return r.label; });
  var h = '<div class="nx-sec"><b>Staff</b><span class="nx-dim">' + mobs.length + ' ' + (mobs.length === 1 ? 'person' : 'people') + ' · cards in on time</span></div>';
  h += '<div class="nx-card p0">' + mobs.map(function (m) {
    var st = staff[m], due = 0, done = 0, lead = [], fill = [];
    ndDeptDefs().forEach(function (d) { var dn = ndDeptDef(d.id).name; if (ndLead(d.id) === m) lead.push(dn); else if (ndChecker(d.id) === m) lead.push(dn + ' (compares)'); if (!ndFills(d.id, m)) return; fill.push(dn);
      for (var k = 1; k <= day; k++) { if (!ndDayInfo(d.id, k).ids.length) continue; due++; var c = ndPc(d.id, k)[m] || {}; if (c.done || c.absent) done++; } });
    var pct = due ? Math.round(100 * done / due) : null, ic = ndIsInCharge(m), you = m === me;
    return '<details class="nx-fa-p"><summary><span class="nx-av" style="width:42px;height:42px;font-size:16px">' + ndEsc(String(st.name || m).charAt(0).toUpperCase()) + '</span><span class="nx-fa-pb"><b>' + ndEsc(st.name || m) + '</b>'
      + '<small><span class="nx-chip t" style="font-size:10.5px;padding:1px 7px">' + ndEsc(ndRoleLabel(ndRole(m))) + '</span>' + (you ? '<span class="nx-chip o" style="font-size:10.5px;padding:1px 7px">you</span>' : '') + ' ' + ndEsc(m) + '</small>'
      + (fill.length ? '<span class="nx-fa-pg"><span class="nx-bar" style="background:#E6F2EF"><span style="width:' + (pct || 0) + '%;background:#1E6B5E"></span></span><small>' + done + ' of ' + due + ' cards in' + (pct !== null ? ' · ' + pct + '%' : '') + '</small></span>' : '')
      + '<small>' + ndEsc((fill.length ? 'Fills: ' + fill.join(', ') : '') + (fill.length && lead.length ? ' · ' : '') + (lead.length ? 'Leads: ' + lead.join(', ') : '') || 'No department yet') + '</small></span><i class="ti ti-dots-vertical" style="color:#94A3B8"></i></summary>'
      + (ic || you ? '<div class="nx-dim" style="padding:0 0 10px 54px">The ' + ndEsc(_nd.cfg.inChargeLabel) + '\'s own login is managed by HealSol.</div>' : '<div class="nx-two" style="padding:0 0 12px 54px"><button type="button" class="nx-btn sm ghost" onclick="ndResetStaff(\'' + m + '\')"><i class="ti ti-key"></i> Reset password</button><button type="button" class="nx-btn sm ghost" style="color:#B91C1C;border-color:#FCA5A5" onclick="ndRemoveStaff(\'' + m + '\')"><i class="ti ti-trash"></i> Remove</button></div>')
      + '</details>';
  }).join('') + '</div>';
  if (miss.length) h += '<details class="nx-dim one-miss"><summary>Not added yet: ' + ndEsc(miss.slice(0, 5).join(' · ')) + (miss.length > 5 ? ' + ' + (miss.length - 5) + ' more' : '') + '</summary>' + (miss.length > 5 ? ndEsc(miss.slice(5).join(' · ')) : '') + '</details>';
  h += '<details class="nx-card" id="nd-add"' + (mobs.length < 3 ? ' open' : '') + '><summary style="cursor:pointer;font-weight:700;font-size:14px;color:#135A55;display:flex;gap:8px;align-items:center"><i class="ti ti-user-plus"></i> Add staff</summary>'
    + '<label class="nx-lbl">Role<select class="nx-in" id="nd-add-role">' + ndStaffRoles().map(function (r) { return '<option value="' + ndEsc(r.id) + '">' + ndEsc(r.label) + '</option>'; }).join('') + '</select></label>'
    + '<label class="nx-lbl">Full name<input class="nx-in" id="nd-add-name" maxlength="60" autocomplete="off"></label>'
    + '<label class="nx-lbl">Mobile number (their login ID)<input class="nx-in" id="nd-add-mob" inputmode="numeric" maxlength="10" autocomplete="off"></label>'
    + '<div class="nd-err" id="nd-add-err" role="alert"></div><button type="button" class="nx-btn" id="nd-add-go" onclick="ndAddStaff()">Add and get login</button>'
    + '<span class="nx-dim">They join their usual departments automatically; change it in More → Departments.</span></details>';
  return h;
}
function nxFaReadyHTML() {
  var day = Math.min(ndDay(), _nd.cfg.days), all = ndDeptDefs().map(function (d) { return d.id; }), pass = (_nd.cfg.passMark || {}).overall || 70;
  var S = ndShape(), R = nxReady(all), B = nxReady(all, S.bN), I = day > S.bN ? nxReady(all, S.iN, S.i1) : null, E = day >= S.e1 ? nxReady(all, 999, S.e1) : null, pct = R.overall === null ? 0 : R.overall, fmt = function (x) { return x && x.overall !== null ? x.overall + '%' : '–'; };
  var h = '<div class="nx-card nx-pring"><div class="nx-ring">' + nxRing(pct, 104, 11, '#1E6B5E', '#E6F2EF') + '<span><b>' + pct + '%</b><small>facility</small></span></div><div class="nx-kv">'
    + '<div><span>Baseline</span><b>' + fmt(B) + '</b></div><div><span>Implementation</span><b style="color:#135A55">' + (I ? fmt(I) : '<span style="color:#94A3B8;font-weight:600">from Day ' + S.i1 + '</span>') + '</b></div>'
    + '<div><span>End-line</span><b>' + (E ? fmt(E) : '<span style="color:#94A3B8;font-weight:600">from Day ' + S.e1 + '</span>') + '</b></div><div class="nx-dim">' + (R.meets ? '✓ Meets NQAS criteria' : 'Needs ' + pass + '% overall, in each department and each Area of Concern') + ' · ' + R.n + ' of ' + R.of + ' assessed</div></div></div>';
  var tab = _nd.ptab || 'dept';
  h += '<div class="nx-seg"><button type="button" class="' + (tab === 'dept' ? 'on' : '') + '" onclick="_nd.ptab=\'dept\';ndKeepScroll()">Departments</button><button type="button" class="' + (tab === 'aoc' ? 'on' : '') + '" onclick="_nd.ptab=\'aoc\';ndKeepScroll()">Areas of Concern</button><button type="button" class="' + (tab === 'grid' ? 'on' : '') + '" onclick="_nd.ptab=\'grid\';ndKeepScroll()">Grid</button></div>';
  if (tab === 'grid') return h + '<div class="nx-card">' + nxGridHTML() + '</div>';
  var bar = function (name, cur, base) {
    if (cur === null || cur === undefined) return '<div class="nx-hb"><div><b>' + ndEsc(name) + '</b><span class="nx-dim">not assessed</span></div><p></p></div>';
    var b = base === null || base === undefined ? cur : Math.min(base, cur);
    return '<div class="nx-hb"><div><b>' + ndEsc(name) + '</b><span style="font-weight:700;color:' + (cur >= pass ? '#166534' : cur >= 50 ? '#92400E' : '#991B1B') + '">' + cur + '%</span></div><p><span class="b" style="width:' + b + '%"></span>' + (cur > b ? '<span class="i" style="width:' + (cur - b) + '%"></span>' : '') + '</p></div>';
  };
  h += '<div class="nx-card"><div class="nx-leg"><span><i style="color:#CBD5E1">■</i> Baseline</span><span><i style="color:#1E6B5E">■</i> Gain since baseline</span><span>target ' + pass + '%</span></div>';
  if (tab === 'aoc') Object.keys(_nd.cl.aocs).forEach(function (a) { if (R.byAoc[a]) h += bar(a + ' · ' + String(_nd.cl.aocs[a]).replace(/^[:\s]+/, ''), R.byAoc[a].pct, (B.byAoc[a] || {}).pct); });
  else ndDeptDefs().forEach(function (d) { if (R.byDept[d.id]) h += bar(d.name + ' · lead ' + (nxFirst(ndLead(d.id)) || '—'), R.byDept[d.id].pct, (B.byDept[d.id] || {}).pct); });
  return h + '</div>';
}
function nxFaMoreHTML() {
  var me = ndMob(), rm = ndRemindHTML(), mi = function (icon, t, js, cls) { return '<button type="button" class="nx-mi' + (cls ? ' ' + cls : '') + '" onclick="' + js + '"><i class="ti ' + icon + '"></i><span>' + t + '</span></button>'; };
  var h = '';
  if (ndIsInCharge(me)) h += '<div class="nx-sec"><b>Programme start date</b></div><div class="nx-card">' + ndStartForm() + '</div>';
  h += '<div class="nx-sec"><b>Reminders</b></div>' + (rm || '<div class="nx-card"><div class="nx-empty">Nobody has work pending today.</div></div>');
  if (ndIsInCharge(me)) h += '<div class="nx-sec"><b>Departments</b></div><div class="nx-dim">Staff posted in a department fill the card; its lead compares, settles disputes and assigns actions. Tap a department to change it.</div><div class="nd-main" style="padding:0;max-width:none">' + ndSetupHTML().split('<div class="nd-sec"><b>Departments</b>')[1].replace(/^[^<]*<small>[^<]*<\/small><\/div>/, '') + '</div>';
  h += '<div class="nx-card nx-menu" style="margin-top:6px">' + mi('ti-checklist', 'Action plan · all departments', "ndLeadOpen('plan')")
    + mi('ti-help-circle', 'How to use the app', 'nxHelp()') + mi('ti-key', 'Change password', 'nfChangeMyPassword()') + mi('ti-logout', 'Log out', 'ndLogout()', 'red') + '</div>';
  return h;
}

// ═══ Department dashboard (Me menu): only the departments a person works in — fills, leads or compares ═══
function nxMyDeptIds() { var me = ndMob(); if (_nd.view) return []; return ndDeptDefs().filter(function (d) { return ndFills(d.id, me) || ndLead(d.id) === me || ndChecker(d.id) === me; }).map(function (d) { return d.id; }); }
function ndDeptDashHTML() {
  var me = ndMob(), ids = nxMyDeptIds(), pass = (_nd.cfg.passMark || {}).overall || 70, A = _nd.actions || {}, F = ndLatestFinal();
  var R = nxReady(ids), B = nxReady(ids, ndShape().bN);
  var h = nxBk("ndTab('me')", 'Department dashboard', ids.length ? ids.length + ' department' + (ids.length > 1 ? 's' : '') + ' you work in' : 'No department yet') + '<div class="nx">';
  if (!ids.length) return h + '<div class="nx-card"><div class="nx-empty">You are not on a department yet — the ' + ndEsc(_nd.cfg.inChargeLabel) + ' adds you in Set-up.</div></div></div>';
  h += ids.map(function (id) {
    var d = ndDeptDef(id), x = R.byDept[id] || {}, b = (B.byDept[id] || {}).pct, role = ndLead(id) === me ? 'You lead' : ndChecker(id) === me ? 'You compare' : 'You fill';
    var gaps = Object.keys(F).filter(function (k) { return F[k].dept === id && F[k].s < 2; }).length, open = Object.keys(A).filter(function (k) { return A[k].dept === id && A[k].status !== 'closed'; }).length;
    var p = x.pct === null || x.pct === undefined ? null : x.pct;
    return '<div class="nx-card"><div style="display:flex;align-items:center;gap:10px"><b style="flex:1;font-size:14.5px">' + ndEsc(d.name) + '</b><span class="nx-chip t" style="font-size:10.5px;padding:2px 8px">' + role + '</span><b style="font-size:18px;color:' + (p === null ? '#94A3B8' : p >= pass ? '#166534' : p >= 50 ? '#92400E' : '#991B1B') + '">' + (p === null ? '–' : p + '%') + '</b></div>'
      + '<div class="nx-hb"><p>' + (p === null ? '' : '<span class="b" style="width:' + Math.min(b === null || b === undefined ? p : b, p) + '%"></span>' + (b !== null && b !== undefined && p > b ? '<span class="i" style="width:' + (p - b) + '%"></span>' : '')) + '</p></div>'
      + '<div class="nx-tg"><span>Lead: ' + ndEsc(nxFirst(ndLead(id)) || '—') + '</span><span>' + ndFillers(id).length + ' fill</span><span class="' + (gaps ? 'r' : 'g') + '">' + gaps + ' open gap' + (gaps === 1 ? '' : 's') + '</span><span class="' + (open ? 'a' : 'g') + '">' + open + ' action' + (open === 1 ? '' : 's') + ' open</span>' + (b !== null && b !== undefined ? '<span>baseline ' + b + '%</span>' : '') + '</div></div>';
  }).join('');
  h += '<div class="nx-sec"><b>Department × Area of Concern</b></div><div class="nx-card">' + nxGridHTML(ids) + '<span class="nx-dim">Latest checked score of each checkpoint, % of the maximum · target ' + pass + '%</span></div>';
  return h + '</div>';
}
