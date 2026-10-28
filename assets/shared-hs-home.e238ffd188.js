// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// HEALSOL DASHBOARD (redesign approved 21 Oct 2026; canvas "HealSol Dashboard Redesign"). HealSol Admin only —
// Supervisors, District Admins and Champions keep their dashboards. Loaded last: it wraps the menu and views.
//   Menu: Today · Facilities · Programme · Business · Reports · Content · Settings (each answers one question).
//   Today       to-do list (Act today / This week) + 4 headline numbers (total, then each type) + Peer reviews,
//               Live sessions (summary + Add) and a one-line Business summary.            (replaces Overview, Review inbox)
//   Facilities  totals by type + one facility table (search, type, district, phase, status; ⋯ = manage). (replaces cards)
//   Programme   tabs: Quality (Standards, one type at a time) · Graduation & certification · Peer reviews · Live sessions.
//   Reports     one list of report cards.   Content: Card editor (SC) + Checkpoints (UPHC · PHC · CHC) behind tabs.
//   Settings    the old Setup page split into tabs + State & Donor (Partners) + Impact & Recognition.
// The old views stay in the page (other roles use them); the Review inbox is still reachable from Today.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
var _hs = { type: '', q: '', dist: '', phase: '', status: '', ptab: 'grad', qtype: '', stab: 'enrol', certs: null, certsAt: 0, sessAt: 0, liveAt: 0 };
var HS_TYPES = ['sc', 'uphc', 'phc', 'chc'];
var HS_RES = { ready: ['NQAS Ready', 'green'], almost: ['Almost ready', 'amber'], notyet: ['Not yet ready', 'red'], incomplete: ['Incomplete', 'red'] };
function hsOn() { try { return typeof nfAdminRole === 'function' && nfAdminRole() === 'admin'; } catch (e) { return false; } }
function hsE(s) { return scEsc(s); }
function hsJ(s) { return scJs(s); }
function hsShort(t) { return t === 'sc' ? 'SC' : ((NF_LEVELS[t] || {}).short || String(t).toUpperCase()); }
function hsPlural(t) { return t === 'sc' ? 'Sub-Centres' : ((NF_LEVELS[t] || {}).plural || hsShort(t) + 's'); }
function hsTypeChip(t) { return '<span class="hs-tc t-' + t + '">' + hsE(hsShort(t)) + '</span>'; }
function hsCodes() { var F = scMasterFacilities || {}; return scVisibleFacilityCodes().filter(function (c) { return F[c] && !F[c].migratedTo; }); }
function hsTodayIso() { return scTodayStr(); }
function hsAddDays(iso, n) { var p = String(iso).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function hsShortDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] : ''; }
// one record per facility, the same shape for every type
function hsInfo(code, f0, agg0, prog0) {   // f0 / agg0 / prog0: the Champion's own copies (the HealSol lists use the master)
  if (typeof f0 !== 'object') { f0 = null; agg0 = null; prog0 = null; }   // called from .map(hsInfo): index / array are not copies
  var F = scMasterFacilities || {}, f = f0 || F[code] || {}, t = nfTypeOf(f), dept = t !== 'sc', LV = NF_LEVELS[t] || {}, today = hsTodayIso();
  var staff = f.staff || {}, ic = LV.inCharge || 'CHO', who = Object.keys(staff).find(function (m) { return staff[m] && !staff[m].disabled && (staff[m].role || ic) === ic; });
  var o = { code: code, f: f, type: t, dept: dept, name: f.name || code, district: f.district || '', inCharge: who ? (staff[who].name || who) : '', inChargeMob: who || '', inChargeLabel: LV.inChargeLabel || ic,
    grad: f.graduation || null, cu: f.catchup && f.catchup.on ? f.catchup : null, staffN: Object.keys(staff).filter(function (m) { return staff[m] && !staff[m].disabled; }).length };
  if (dept) {
    var S = nfDeptShape(LV), s = (typeof _nfDs !== 'undefined' && _nfDs.map) ? _nfDs.map[code] : null;
    o.s = s; o.days = S.days; o.S = S; o.rawDay = f.startDate ? nfDeptDayNo(f.startDate, today) : null;
    o.pct = s && s.assessed ? s.pct : null; o.base = s && s.base != null ? s.base : null; o.assessed = s ? s.assessed : 0; o.cov = s && s.total ? Math.round(100 * (s.assessed || 0) / s.total) : null;
    o.overdue = s ? s.acts.od : 0; o.toCheck = s ? s.checksDue : 0; o.loading = !s && !!f.startDate;
    o.byStd = s ? s.byStd || {} : {}; o.byDept = s ? s.byDept || {} : {}; o.byAoc = s ? s.byAoc || {} : {};
    // on track / slipping / behind with this type's timeline settings (Settings → Programme rules → Timeline)
    if (s && s.tl) { var G = typeof nfgCfgFor === 'function' ? nfgCfgFor(t) : { green: 80, amber: 60, missDays: 3, blLate: 10 }, tl = s.tl;
      o.comp = { pct: tl.pct, oldMiss: tl.oldMiss, state: tl.pct < G.amber || (s.day || 0) > G.blLate && !tl.blDone ? 'r' : tl.pct < G.green || tl.oldMiss > G.missDays ? 'a' : 'g' }; }
  } else {
    var p = getProg(f.progId || 'nqas_12A') || {}, a = agg0 || scFacAggFor(code), b = a.baseline || {};
    o.days = p.days || 60; o.S = { bN: 7, iN: 49, e1: 50, eN: 56, r1: 57, rN: 60, days: o.days };
    o.rawDay = f.startDate ? Math.floor((Date.parse(today) - Date.parse(f.startDate)) / 86400000) + 1 : null;
    o.agg = a; o.pct = a.coverage && a.coverage.assessed ? a.pct : null; o.base = b.assessed ? b.pct : null; o.assessed = a.coverage ? a.coverage.assessed : 0; o.cov = a.coverage ? a.coverage.pct : null;
    o.byStd = {}; Object.keys(a.byStd || {}).forEach(function (k) { var x = a.byStd[k]; if (x && x.assessed) o.byStd[k] = x.pct; });
    var acts = scRvList((_scRvAll || {})[code] || {}); o.overdue = acts.filter(function (x) { return x.status !== 'draft' && x.status !== 'closed' && x.dueDate && x.dueDate < today; }).length;
    try { var c = nfgCompFor(code, f, prog0 || (scMasterProgress || {})[code] || {}, (_scRvAll || {})[code] || null); o.comp = c; } catch (e) {}
  }
  // activity (Today): last card and cards saved this week
  if (dept) { o.lastAt = o.s && o.s.lastAt ? String(o.s.lastAt).slice(0, 10) : null; o.cards7 = o.s ? (o.s.cards7 || 0) : 0; }
  else { var la = typeof nfLastActivity === 'function' ? nfLastActivity(code) : ''; o.lastAt = la ? nfIsoLocal(la) : null; var wk = hsAddDays(today, -6), n7 = 0, P7 = prog0 || (scMasterProgress || {})[code] || {};
    Object.keys(P7).forEach(function (m) { Object.keys(P7[m] || {}).forEach(function (k) { var x = P7[m][k] || {}; if (x.updatedAt && nfIsoLocal(x.updatedAt) >= wk) n7++; }); }); o.cards7 = n7; }
  o.idle = o.lastAt ? Math.max(0, Math.round((Date.parse(today) - Date.parse(o.lastAt)) / 864e5)) : null;
  var d = o.rawDay, S2 = o.S;
  o.day = d == null ? null : Math.min(d, o.days);
  o.phase = !f.startDate ? 'notstarted' : d < 1 ? 'notstarted' : o.cu && !o.cu.done && o.cu.start && today >= o.cu.start ? 'catchup' : o.grad ? 'graduated' : d <= S2.bN ? 'baseline' : d <= S2.iN ? 'impl' : d <= S2.eN ? 'endline' : d <= S2.days ? 'ready' : 'closing';
  o.inProg = ['baseline', 'impl', 'endline', 'ready', 'closing', 'catchup'].indexOf(o.phase) >= 0;
  o.behind = !!(o.comp && o.comp.state === 'r' && o.inProg);
  o.onTime = o.comp && o.comp.pct != null && o.inProg ? o.comp.pct : null;
  o.gradDate = f.startDate ? hsAddDays(f.startDate, o.days - 1) : '';
  o.gradSoon = !o.grad && d != null && d >= 1 && d <= o.days && o.days - d <= 6;
  o.grad14 = !o.grad && d != null && d >= 1 && o.days - d <= 13;   // the Programme list's window (incl. past the last day, waiting)
  var ti = typeof nfTrialInfo === 'function' ? nfTrialInfo(f) : null; o.trial = ti; o.payDue = !!(ti && ti.ended);
  o.access = f.subscriptionStatus === 'paid' ? 'Paid' + (dept ? '' : ' · ' + (String(f.progId || '').indexOf('12B') >= 0 ? '12B' : '12A')) : f.subscriptionStatus === 'trial' ? (o.payDue ? 'Trial ended' : 'Trial') : 'Contract';
  return o;
}
var HS_PHASE = { notstarted: 'Not started', baseline: 'Baseline', impl: 'Implementation', endline: 'End-line', ready: 'Readiness week', closing: 'Waiting for graduation', graduated: 'Graduated', catchup: 'Catch-up' };
function hsResult(o) {   // the result column: graduation result, else the NQAS check by the type's own rules
  if (o.loading && !o.grad) return '<span class="nfo-chip grey">Loading…</span>';
  if (!o.assessed && !o.grad) return '<span class="hs-dim">—</span>';
  return nfResultChip(o.dept ? nfResultDept(o.s, o.grad) : nfResultSc(o.agg, o.grad));
}
function hsAll() { return hsCodes().map(hsInfo); }
function hsSplit(list, pred) { var by = {}; list.forEach(function (o) { if (pred(o)) by[o.type] = (by[o.type] || 0) + 1; }); var n = 0; Object.keys(by).forEach(function (k) { n += by[k]; });
  return { n: n, txt: HS_TYPES.filter(function (t) { return by[t]; }).map(function (t) { return hsShort(t) + ' ' + by[t]; }).join(' · ') }; }
function hsTypeTabs(on, fn, list) {
  var cnt = {}; list.forEach(function (o) { cnt[o.type] = (cnt[o.type] || 0) + 1; });
  return '<div class="hs-types" role="tablist" aria-label="Facility type"><button type="button" role="tab" aria-selected="' + (!on) + '" class="' + (!on ? 'on' : '') + '" onclick="' + fn + '(\'\')">All ' + list.length + '</button>'
    + HS_TYPES.filter(function (t) { return cnt[t]; }).map(function (t) { return '<button type="button" role="tab" aria-selected="' + (on === t) + '" class="' + (on === t ? 'on' : '') + '" onclick="' + fn + '(\'' + t + '\')">' + hsE(hsShort(t)) + ' ' + cnt[t] + '</button>'; }).join('') + '</div>';
}
function hsBox(id, v) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return null;
  var b = document.getElementById(id); if (!b) { b = document.createElement('div'); b.id = id; b.dataset.nfv = v; b.className = 'hs-page'; main.insertBefore(b, main.firstChild); }
  return b;
}

// ═══ TODAY ═══
function hsSetType(t) { _hs.type = t; hsRenderToday(); }
function hsTodo(list) {
  var out = [], seen = {}, F = scMasterFacilities || {}, byCode = {}; list.forEach(function (o) { byCode[o.code] = o; });
  var add = function (x) { var k = (x.code || '') + '|' + x.key; if (seen[k]) return; seen[k] = 1; out.push(x); };
  var open = function (c) { return { l: 'Open', js: "scDrillIn('" + hsJ(c) + "')" }; };
  list.forEach(function (o) {
    if (o.payDue) add({ code: o.code, key: 'pay', lvl: 'red', t: 'trial ended ' + o.trial.daysOver + ' day' + (o.trial.daysOver === 1 ? '' : 's') + ' ago, not paid', sub: (o.day ? 'Day ' + o.day + ' · ' : '') + (o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : ''),
      btn: o.inChargeMob && typeof nfBizMsg === 'function' ? { l: 'Message', js: "nfBizMsg('due','" + hsJ(o.code) + "')", p: 1 } : { l: 'Open Business', js: "nfAdminView('business')" } });
    var idleN = typeof NF_IDLE_DAYS !== 'undefined' ? NF_IDLE_DAYS : 7;
    if (o.inProg && o.phase !== 'catchup' && !o.payDue && o.rawDay > 1 && (o.idle == null || o.idle >= idleN)) add({ code: o.code, key: 'idle', lvl: o.idle != null && o.idle >= 2 * idleN ? 'red' : 'amber',
      t: o.idle == null ? 'no card saved yet' : 'no activity for ' + o.idle + ' days', sub: 'Day ' + o.day + ' · ' + HS_PHASE[o.phase] + (o.lastAt ? ' · last card ' + hsShortDate(o.lastAt) : ''),
      btn: o.inChargeMob && typeof nfWaSend === 'function' ? { l: 'Remind', js: "nfWaSend('idle','" + hsJ(o.code) + "',{idle:" + (o.idle || 0) + "})" } : open(o.code) });
    if (o.dept && !o.grad && o.rawDay != null && o.rawDay >= o.S.r1 && o.rawDay <= o.days + 7 && o.toCheck) add({ code: o.code, key: 'endchk', lvl: 'red', t: o.toCheck + ' department-day' + (o.toCheck > 1 ? 's' : '') + ' still to check', sub: (o.rawDay > o.days ? 'Waiting for graduation' : 'Readiness week, Day ' + o.rawDay) + ' · graduation needs every end-line day checked', btn: open(o.code) });
    if (o.grad && o.grad.result !== 'ready' && !o.cu) add({ code: o.code, key: 'cu', lvl: 'amber', t: 'graduated ' + (HS_RES[o.grad.result] || HS_RES.incomplete)[0] + ' (' + o.grad.overall + '%)', sub: 'Decide: offer a catch-up' + ((o.grad.deptFails || []).length ? ' on ' + o.grad.deptFails.map(function (d) { return ((NF_LEVELS[o.type].departments || []).find(function (x) { return x.id === d; }) || { name: d }).name; }).join(', ') : '') + '?', btn: open(o.code) });
    if (o.gradSoon) add({ code: o.code, key: 'soon', lvl: 'amber', t: 'graduation on Day ' + o.days + ' · ' + hsShortDate(o.gradDate), sub: HS_PHASE[o.phase] + ', Day ' + o.day, btn: open(o.code) });
    if (!o.f.startDate) add({ code: o.code, key: 'start', lvl: 'amber', t: 'start date not set', sub: (o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : 'No ' + o.inChargeLabel + ' on the staff list'), btn: o.inChargeMob && typeof nfWaOpen === 'function' ? { l: 'Remind', js: "hsWaStart('" + hsJ(o.code) + "')" } : open(o.code) });
  });
  var att = []; try { att = scRvAttention(); } catch (e) {}
  att.forEach(function (x) { if (/without an action/.test(x.txt)) return; var o = byCode[x.code]; if (!o) return;
    if (o.payDue && /trial ended|payment due/i.test(x.txt)) return; if (seen[x.code + '|endchk'] && /waiting for the check/.test(x.txt)) return; add({ code: x.code, key: x.txt, lvl: x.lvl === 'red' ? 'red' : 'amber', t: x.txt.charAt(0).toLowerCase() + x.txt.slice(1), sub: (o.day ? 'Day ' + o.day + ' · ' : '') + HS_PHASE[o.phase], btn: open(x.code) }); });
  var behind = list.filter(function (o) { return o.behind; });
  if (behind.length) add({ key: 'behind', lvl: 'amber', t: '<b>' + behind.length + ' ' + (behind.length === 1 ? 'facility' : 'facilities') + ' behind schedule</b> — ' + hsE(behind.map(function (o) { return o.name; }).slice(0, 5).join(', ')), raw: 1, sub: 'Cards on time under the Slipping mark, or baseline late (Timeline settings of each type)', btn: { l: 'See list', js: "_hs.status='behind';nfAdminView('hsfac')" } });
  var rank = { red: 0, amber: 1 }; out.sort(function (a, b) { return rank[a.lvl] - rank[b.lvl]; });
  return out;
}
function hsWaPay(code) { var o = hsInfo(code); var m = typeof nfWaMsg === 'function' ? nfWaMsg('due', code) : null; nfWaOpen(o.inChargeMob, (m && m.text) || ('Namaste ' + o.inCharge + ', the NQAS | FAST free trial for ' + o.name + ' has ended. Please complete the payment to continue.')); }
function hsWaStart(code) { var o = hsInfo(code); nfWaOpen(o.inChargeMob, 'Namaste ' + o.inCharge + ', please set the programme start date for ' + o.name + ' in NQAS | FAST (Set-up → Programme start date) so that your team can begin the baseline.'); }
function hsTodoHTML(items) {
  var row = function (x) { var o = x.code ? hsInfo(x.code) : null;
    return '<li class="hs-td"><span class="hs-dot ' + x.lvl + '"></span><div><div class="hs-tdt">' + (o ? '<b>' + hsE(o.name) + '</b> ' + hsTypeChip(o.type) + ' — ' : '') + (x.raw ? x.t : hsE(x.t)) + '</div><small>' + hsE(x.sub || '') + '</small></div>'
      + '<button type="button" class="hs-btn' + (x.btn.p ? ' p' : '') + '" onclick="' + x.btn.js + '">' + hsE(x.btn.l) + '</button></li>'; };
  var red = items.filter(function (x) { return x.lvl === 'red'; }), amb = items.filter(function (x) { return x.lvl !== 'red'; });
  if (!items.length) return '<div class="nfo-empty">✓ Nothing to do right now — every facility is up to date.</div>';
  return (red.length ? '<div class="hs-grp r">ACT TODAY</div><ul class="hs-tdl">' + red.map(row).join('') + '</ul>' : '') + (amb.length ? '<div class="hs-grp a">THIS WEEK</div><ul class="hs-tdl">' + amb.map(row).join('') + '</ul>' : '');
}
function hsTodayCount() { try { if (!hsOn()) return 0; return hsTodo(hsAll()).filter(function (x) { return x.lvl === 'red'; }).length; } catch (e) { return 0; } }
function hsLoadSide() {
  var go = false;
  if (!_hs.sessAt && typeof scqLoadSessions === 'function') { _hs.sessAt = Date.now(); go = true; Promise.all([scqLoadSessions(), scqLoadChampions ? scqLoadChampions() : null]).then(function () { if (_nfOv.view === 'today') hsRenderToday(); }, function () {}); }
  if (!_hs.liveAt && typeof scLoadLive === 'function') { _hs.liveAt = Date.now(); go = true; scLoadLive().then(function () { if (_nfOv.view === 'today') hsRenderToday(); }, function () {}); }
  return go;
}
function hsPeerCardHTML() {
  var all = (typeof scqVisibleSessions === 'function' && typeof _scq !== 'undefined' && _scq.sessions) ? scqVisibleSessions() : [], now = Date.now(), wk = now + 7 * 864e5, mo = hsTodayIso().slice(0, 7);
  var week = all.filter(function (s) { var t = Date.parse(s.startAt); return s.status !== 'cancelled' && t >= now - 864e5 && t <= wk; });
  var pend = all.filter(function (s) { return s.status === 'proposed' || s.status === 'submitted'; });
  var month = all.filter(function (s) { return s.status === 'approved' && String(s.startAt || '').slice(0, 7) === mo; });
  var next = all.filter(function (s) { return s.status === 'scheduled' && Date.parse(s.startAt) >= now; })[0];
  return '<div class="nfo-card hs-side"><div class="hs-sh"><b>Peer reviews</b><button type="button" class="hs-btn p" onclick="scqEditSession(null)">+ Add</button></div>'
    + '<div class="hs-mini"><div><b>' + week.length + '</b><small>this week</small></div><div><b>' + pend.length + '</b><small>to approve</small></div><div><b>' + (typeof scqHours === 'function' ? scqHours(month) : 0) + ' h</b><small>this month</small></div></div>'
    + (next ? '<small class="hs-dim">Next: ' + hsE(scFmtDateTime(next.startAt)) + ' · ' + hsE(scqFacName(next.code)) + '</small>' : '<small class="hs-dim">No session scheduled.</small>')
    + '<button type="button" class="hs-link" onclick="_hs.ptab=\'peer\';nfAdminView(\'hsprog\')">Open peer reviews</button></div>';
}
function hsLiveCardHTML() {
  var L = typeof _scLive !== 'undefined' ? _scLive || {} : {}, now = Date.now();
  var up = Object.keys(L).map(function (k) { return Object.assign({ id: k }, L[k]); }).filter(function (s) { return s && !s.cancelled && Date.parse(s.startAt) >= now - 3600e3; }).sort(function (a, b) { return Date.parse(a.startAt) - Date.parse(b.startAt); });
  return '<div class="nfo-card hs-side"><div class="hs-sh"><b>Live sessions</b><button type="button" class="hs-btn p" onclick="scEditLive(null)">+ Add</button></div>'
    + (up.length ? '<ul class="hs-ll">' + up.slice(0, 3).map(function (s) { return '<li><span>' + hsE(scFmtDateTime(s.startAt)) + '</span><b>' + hsE(s.title || 'Live session') + '</b></li>'; }).join('') + '</ul>' : '<small class="hs-dim">No upcoming session.</small>')
    + '<button type="button" class="hs-link" onclick="_hs.ptab=\'live\';nfAdminView(\'hsprog\')">All sessions</button></div>';
}
function hsBizLineHTML(list) {
  var paid = 0, con = 0, tr = 0, due = 0, rec = 0, mo = hsTodayIso().slice(0, 7);
  list.forEach(function (o) { var st = o.f.subscriptionStatus || 'contract'; if (st === 'paid') paid++; else if (st === 'trial') tr++; else con++; if (o.payDue) due++;
    var lp = o.f.lastPayment; if (lp && lp.amount && String(lp.at || '').slice(0, 7) === mo) rec += Number(lp.amount) || 0; });
  return '<div class="nfo-card hs-side"><b>Business</b><div class="hs-bl">' + paid + ' paid · ' + con + ' contract · ' + tr + ' on trial<br>₹' + rec.toLocaleString('en-IN') + ' received this month · ' + due + ' payment' + (due === 1 ? '' : 's') + ' due</div>'
    + '<button type="button" class="hs-link" onclick="nfAdminView(\'business\')">Open Business</button></div>';
}
// "Cards saved this week" (moved from Business, 23 Oct 2026): cards saved in the last 7 days, by how many facilities; in-programme ones with none
function hsCardsKpi(list) {
  var n = 0, fac = 0, none = 0; list.forEach(function (o) { n += o.cards7 || 0; if (o.cards7) fac++; else if (o.inProg && o.rawDay > 1) none++; });
  return '<button type="button" class="hs-kpi' + (none ? ' a' : '') + '" onclick="_hs.phase=\'inprog\';nfAdminView(\'hsfac\')"><small>Cards saved this week</small><b>' + n.toLocaleString('en-IN') + '</b><span>' + (fac ? 'by ' + fac + ' facilit' + (fac === 1 ? 'y' : 'ies') : 'no cards this week') + (none ? ' · ' + none + ' saved nothing' : '') + '</span></button>';
}
function hsRenderToday() {
  if (!hsOn()) return; var box = hsBox('hs-today', 'today'); if (!box) return;
  hsLoadSide();
  var all = hsAll(), list = _hs.type ? all.filter(function (o) { return o.type === _hs.type; }) : all, dist = {};
  all.forEach(function (o) { if (o.district) dist[o.district] = 1; });
  var k1 = hsSplit(list, function (o) { return o.inProg; }), k2 = hsSplit(list, function (o) { return o.behind; }), k3 = hsSplit(list, function (o) { return o.grad14; }), k4 = hsSplit(list, function (o) { return o.payDue; });
  var soon = list.filter(function (o) { return o.grad14; }).sort(function (a, b) { return a.gradDate < b.gradDate ? -1 : 1; })[0];
  var kpi = function (l, k, sub, cls, js) { return '<button type="button" class="hs-kpi ' + cls + '" onclick="' + js + '"><small>' + l + '</small><b>' + k.n + '</b><span>' + hsE(k.txt || sub) + '</span></button>'; };
  var items = hsTodo(list), ib = null; try { ib = nfInboxData().tot; } catch (e) {}
  var foot = ib ? [[ib.ver, 'cards to verify'], [ib.confirm, 'actions to confirm'], [ib.overdue, 'overdue actions'], [ib.drafts, 'draft actions']].map(function (x) { return x[0] ? '<button type="button" class="hs-zero n" onclick="nfAdminView(\'inbox\')">' + x[0] + ' ' + x[1] + '</button>' : '<span class="hs-zero">✓ 0 ' + x[1] + '</span>'; }).join('') : '';
  var h = '<div class="nfo-top"><div><h1>Today</h1><small>' + hsE(new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })) + ' · ' + all.length + ' facilit' + (all.length === 1 ? 'y' : 'ies') + (Object.keys(dist).length ? ' in ' + Object.keys(dist).length + ' district' + (Object.keys(dist).length > 1 ? 's' : '') : '') + (typeof _nfLight !== 'undefined' && _nfLight ? ' · from the nightly summary' : '') + '</small></div>'
    + hsTypeTabs(_hs.type, 'hsSetType', all) + '<button type="button" class="nfo-ic" title="Refresh" onclick="scRefreshDashboard()"><i class="ti ti-refresh"></i></button></div>'
    + '<div class="hs-kpis">' + kpi('In programme', k1, 'none', '', "_hs.phase='inprog';nfAdminView('hsfac')") + kpi('Behind schedule', k2, 'none behind', k2.n ? 'r' : '', "_hs.status='behind';nfAdminView('hsfac')")
    + kpi('Graduating in 14 days', k3, soon ? soon.name + ' · ' + hsShortDate(soon.gradDate) : 'none in 14 days', k3.n ? 't' : '', "_hs.ptab='grad';nfAdminView('hsprog')") + hsCardsKpi(list) + '</div>'
    + '<div class="hs-two"><div class="nfo-card hs-todo"><div class="nfo-ch"><b>To do</b><span>' + items.length + ' item' + (items.length === 1 ? '' : 's') + ' · most urgent first</span></div>' + hsTodoHTML(items) + (foot ? '<div class="hs-foot">' + foot + '<button type="button" class="hs-link" onclick="nfAdminView(\'inbox\')">Review inbox</button></div>' : '') + '</div>'
    + '<div class="hs-col">' + hsPeerCardHTML() + hsLiveCardHTML() + '</div></div>';
  box.innerHTML = h;
}

// ═══ FACILITIES ═══
function hsFacSet(k, v) { _hs[k] = v; hsRenderFac(); if (k === 'q') { var s = document.getElementById('hs-fq'); if (s) { s.focus(); s.setSelectionRange(v.length, v.length); } } }
function hsFacFilter(all) {
  var q = _hs.q.trim().toLowerCase();
  return all.filter(function (o) {
    if (_hs.type && o.type !== _hs.type) return false;
    if (_hs.dist && o.district !== _hs.dist) return false;
    if (_hs.phase === 'inprog' ? !o.inProg : _hs.phase && o.phase !== _hs.phase) return false;
    if (_hs.status === 'behind' && !o.behind) return false; if (_hs.status === 'pay' && !o.payDue) return false; if (_hs.status === 'notstarted' && o.phase !== 'notstarted') return false;
    if (q && (o.name + ' ' + o.code + ' ' + o.district + ' ' + o.inCharge).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function hsTotalsHTML(all) {
  var row = function (lab, L, total) {
    var g = L.filter(function (o) { return o.grad; }), ready = g.filter(function (o) { return o.grad.result === 'ready'; }).length, alm = g.filter(function (o) { return o.grad.result === 'almost'; }).length;
    var av = L.filter(function (o) { return o.pct != null; }), avg = !total && av.length ? Math.round(av.reduce(function (s, o) { return s + o.pct; }, 0) / av.length) + '%' : '—';
    var beh = L.filter(function (o) { return o.behind; }).length;
    return '<tr' + (total ? ' class="hs-tot"' : '') + '><td>' + hsE(lab) + '</td><td>' + L.length + '</td><td>' + L.filter(function (o) { return o.inProg; }).length + '</td><td>' + L.filter(function (o) { return o.phase === 'notstarted'; }).length + '</td>'
      + '<td class="' + (beh ? 'red' : '') + '">' + beh + '</td><td>' + g.length + (alm && !total ? ' <small>· ' + alm + ' almost</small>' : '') + '</td><td>' + ready + '</td><td>' + avg + '</td></tr>'; };
  var types = HS_TYPES.filter(function (t) { return all.some(function (o) { return o.type === t; }); });
  return '<div class="nfo-card hs-tw"><table class="nfo-t hs-tt"><thead><tr><th></th><th>Enrolled</th><th>In programme</th><th>Not started</th><th>Behind schedule</th><th>Graduated</th><th>NQAS Ready</th><th>Avg readiness</th></tr></thead><tbody>'
    + row('Total', all, true) + types.map(function (t) { return row(hsPlural(t), all.filter(function (o) { return o.type === t; })); }).join('') + '</tbody></table>'
    + '<small class="hs-dim">Average readiness is shown per type only — the checklists of different facility types are not comparable.</small></div>';
}
function hsRenderFac() {
  if (!hsOn()) return; var box = hsBox('hs-fac', 'hsfac'); if (!box) return;
  var all = hsAll(), list = hsFacFilter(all), dist = {}; all.forEach(function (o) { if (o.district) dist[o.district] = 1; });
  var sel = function (k, opts) { return '<select class="hs-sel" aria-label="' + k + '" onchange="hsFacSet(\'' + k + '\',this.value)">' + opts.map(function (x) { return '<option value="' + hsE(x[0]) + '"' + (_hs[k] === x[0] ? ' selected' : '') + '>' + hsE(x[1]) + '</option>'; }).join('') + '</select>'; };
  var h = '<div class="nfo-top"><div><h1>Facilities</h1><small>' + all.length + ' enrolled' + (Object.keys(dist).length ? ' · ' + hsE(Object.keys(dist).sort().join(', ')) : '') + '</small></div>'
    + '<button type="button" class="hs-btn p lg" onclick="_hs.stab=\'enrol\';nfAdminView(\'setup\')">+ Enrol a facility</button></div>'
    + hsTotalsHTML(all)
    + '<div class="hs-filters"><label class="hs-search"><i class="ti ti-search"></i><input id="hs-fq" type="search" aria-label="Search facilities" placeholder="Search name, ID, in-charge" value="' + hsE(_hs.q) + '" oninput="hsFacSet(\'q\',this.value)"></label>'
    + sel('type', [['', 'All types']].concat(HS_TYPES.map(function (t) { return [t, hsShort(t)]; })))
    + sel('dist', [['', 'All districts']].concat(Object.keys(dist).sort().map(function (d) { return [d, d]; })))
    + sel('phase', [['', 'Any phase'], ['inprog', 'In programme'], ['notstarted', 'Not started'], ['baseline', 'Baseline'], ['impl', 'Implementation'], ['endline', 'End-line'], ['ready', 'Readiness week'], ['closing', 'Waiting for graduation'], ['graduated', 'Graduated'], ['catchup', 'Catch-up']])
    + sel('status', [['', 'Any status'], ['behind', 'Behind schedule'], ['pay', 'Payment due'], ['notstarted', 'Start date not set']])
    + (_hs.type || _hs.dist || _hs.phase || _hs.status || _hs.q ? '<button type="button" class="hs-link" onclick="_hs.type=_hs.dist=_hs.phase=_hs.status=_hs.q=\'\';hsRenderFac()">Clear filters</button>' : '') + '</div>';
  var rank = { red: 0 }, sorted = list.slice().sort(function (a, b) { return (b.behind - a.behind) || (b.payDue - a.payDue) || ((b.rawDay || -1) - (a.rawDay || -1)) || a.name.localeCompare(b.name); });
  h += '<div class="nfo-card hs-tw"><table class="nfo-t hs-ft"><thead><tr><th>Facility</th><th>Day · phase</th><th>Readiness (baseline → now)</th><th>Result</th><th class="c">On time</th><th class="c">Overdue actions</th><th>Access</th><th></th></tr></thead><tbody>'
    + (sorted.length ? sorted.map(function (o) { var ch = o.pct != null && o.base != null ? o.pct - o.base : null;
      return '<tr class="nfo-row' + (o.behind || o.payDue ? ' hs-warn' : '') + '" onclick="scDrillIn(\'' + hsJ(o.code) + '\')"><td><b>' + hsE(o.name) + '</b> ' + hsTypeChip(o.type) + (o.f.suspended ? ' <span class="nfo-chip grey">Paused</span>' : '') + '<small>' + hsE([o.district || o.code, o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : 'No ' + o.inChargeLabel + ' yet'].join(' · ')) + '</small></td>'
        + '<td>' + (o.phase === 'notstarted' ? 'Not started<small>' + (o.f.startDate ? 'starts ' + hsE(hsShortDate(o.f.startDate)) : 'start date not set') + '</small>' : 'Day ' + (o.phase === 'catchup' ? o.days : o.day) + '<small>' + hsE(HS_PHASE[o.phase]) + (o.phase === 'graduated' && o.grad ? ' ' + hsE(hsShortDate(String(o.grad.at || '').slice(0, 10))) : '') + '</small>') + '</td>'
        + '<td>' + (o.pct == null ? '<span class="hs-dim">' + (o.loading ? 'Loading…' : o.phase === 'notstarted' ? '—' : 'No cards yet') + '</span>' : (o.base != null ? o.base + '% → ' : '') + '<b>' + o.pct + '%</b>' + (ch != null ? ' <b class="' + (ch > 0 ? 'up' : ch < 0 ? 'down' : '') + '">' + (ch > 0 ? '+' : '') + ch + '</b>' : '') + (o.cov != null ? '<small>' + o.cov + '% checked</small>' : '')) + '</td>'
        + '<td>' + hsResult(o) + '</td><td class="c' + (o.behind ? ' red' : '') + '">' + (o.onTime == null ? '—' : o.onTime + '%') + '</td><td class="c' + (o.overdue ? ' red' : '') + '">' + (o.overdue || 0) + '</td>'
        + '<td class="' + (o.payDue ? 'red' : '') + '">' + hsE(o.access) + '</td><td><button type="button" class="hs-dots" aria-label="Manage ' + hsE(o.name) + '" onclick="event.stopPropagation();nfFacMenu(this,\'' + hsJ(o.code) + '\')">⋯</button></td></tr>'; }).join('')
      : '<tr><td colspan="8" class="nfo-empty">No facility matches these filters.</td></tr>') + '</tbody></table></div>';
  box.innerHTML = h;
}

// ═══ PROGRAMME ═══
function hsProgTab(t) { _hs.ptab = t; hsRenderProg(); }
async function hsLoadCerts() { if (_hs.certs && Date.now() - _hs.certsAt < 120000) return; _hs.certsAt = Date.now(); try { _hs.certs = (await fbGet('sc_certs')) || {}; } catch (e) { _hs.certs = {}; } if (_nfOv.view === 'hsprog') hsRenderProg(); }
function hsGradHTML(all) {
  if (!_hs.certs) hsLoadCerts();
  var C = _hs.certs || {}, certN = function (L) { return L.reduce(function (s, o) { return s + Object.keys(C[o.code] || {}).length; }, 0); };
  var pop = function (o) { return o.f.population && o.f.population.n ? +o.f.population.n : 0; };
  var row = function (lab, L, total, extra) { var g = L.filter(function (o) { return o.grad; }), r = function (k) { return g.filter(function (o) { return o.grad.result === k; }).length; };
    return '<tr' + (total ? ' class="hs-tot"' : '') + '><td>' + hsE(lab) + (extra ? ' <small>' + hsE(extra) + '</small>' : '') + '</td><td>' + g.length + '</td><td>' + r('ready') + '</td><td>' + r('almost') + '</td><td>' + (r('notyet') + r('incomplete')) + '</td><td>' + L.filter(function (o) { return o.phase === 'catchup'; }).length + '</td>'
      + '<td>' + L.filter(function (o) { return (o.f.nhsrc || {}).status === 'certified'; }).length + '</td><td>' + certN(L) + '</td><td>' + g.filter(function (o) { return o.grad.result === 'ready'; }).reduce(function (s, o) { return s + pop(o); }, 0).toLocaleString('en-IN') + '</td></tr>'; };
  var types = HS_TYPES.filter(function (t) { return all.some(function (o) { return o.type === t; }); });
  var chc = all.filter(function (o) { return o.type === 'chc'; }), lq = chc.filter(function (o) { return (o.f.laqshya || {}).status === 'certified'; }).length, mq = chc.filter(function (o) { return (o.f.musqan || {}).status === 'certified'; }).length;
  var h = '<div class="nfo-card hs-tw"><table class="nfo-t hs-tt"><thead><tr><th></th><th>Graduated</th><th>NQAS Ready</th><th>Almost</th><th>Not yet</th><th>In catch-up</th><th>NHSRC certified</th><th>Certificates issued</th><th>People covered (Ready)</th></tr></thead><tbody>'
    + row('Total', all, true) + types.map(function (t) { return row(hsPlural(t), all.filter(function (o) { return o.type === t; }), false, t === 'chc' ? '· LaQshya ' + lq + ' · MusQan ' + mq : ''); }).join('') + '</tbody></table></div>';
  var g = all.filter(function (o) { return o.grad; }).sort(function (a, b) { return String(b.grad.at || '').localeCompare(String(a.grad.at || '')); });
  var below = function (o) { var x = o.grad, nm = function (d) { return ((NF_LEVELS[o.type].departments || []).find(function (y) { return y.id === d; }) || { name: d }).name; };
    return [].concat((x.deptFails || []).map(function (d) { return nm(d) + ' ' + ((x.byDept || {})[d]) + '%'; }), (x.aocFails || []).map(function (a) { return 'AoC ' + a; }), (x.stdFails || []).slice(0, 3)).join(' · ') || '—'; };
  var next = function (o) { var x = o.grad;
    if (o.cu && !o.cu.done) return '<span class="hs-dim">Catch-up until ' + hsE(hsShortDate(o.cu.end)) + '</span>';
    if (x.result === 'ready') return '<button type="button" class="hs-btn" onclick="event.stopPropagation();scDrillIn(\'' + hsJ(o.code) + '\')">Update NHSRC record</button>';
    return '<button type="button" class="hs-btn p" onclick="event.stopPropagation();scDrillIn(\'' + hsJ(o.code) + '\')">Offer catch-up</button>'; };
  h += '<div class="hs-two"><div class="nfo-card hs-tw"><div class="nfo-ch"><b>Results</b><span>graduated facilities, newest first</span></div>'
    + (g.length ? '<table class="nfo-t"><thead><tr><th>Facility</th><th>Result</th><th>Score</th><th>Below the mark</th><th>Next step</th></tr></thead><tbody>' + g.map(function (o) { var r = HS_RES[o.grad.result] || HS_RES.incomplete;
      return '<tr class="nfo-row" onclick="scDrillIn(\'' + hsJ(o.code) + '\')"><td><b>' + hsE(o.name) + '</b> ' + hsTypeChip(o.type) + '<small>' + hsE(hsShortDate(String(o.grad.at || '').slice(0, 10)) + ' · ' + (o.district || '')) + (o.grad.round ? ' · after catch-up' : '') + '</small></td><td><span class="nfo-chip ' + r[1] + '">' + r[0] + '</span></td>'
        + '<td>' + (o.grad.base != null ? o.grad.base + ' → ' : '') + o.grad.overall + '%' + (nfOldRule(o.grad, o.type) ? nfOldRuleNote() : '') + '</td><td>' + hsE(below(o)) + '</td><td>' + next(o) + '</td></tr>'; }).join('') + '</tbody></table>'
      : '<div class="nfo-empty sm">No facility has graduated yet.</div>') + '</div>';
  var soon = all.filter(function (o) { return !o.grad && o.rawDay != null && o.rawDay >= 1 && o.days - o.rawDay <= 13; }).sort(function (a, b) { return a.gradDate < b.gradDate ? -1 : 1; });
  h += '<div class="nfo-card hs-col1"><div class="nfo-ch"><b>Graduating in the next 14 days</b></div>' + (soon.length ? soon.map(function (o) { var note = o.rawDay > o.days ? 'waiting — past Day ' + o.days : o.dept ? (o.toCheck ? o.toCheck + ' department-days to check' : 'end-line on track') : (o.comp && o.comp.state === 'r' ? 'behind schedule' : HS_PHASE[o.phase]);
      return '<button type="button" class="hs-sl" onclick="scDrillIn(\'' + hsJ(o.code) + '\')"><span><b>' + hsE(o.name) + '</b> ' + hsTypeChip(o.type) + '<small>' + hsE(note) + '</small></span><em>' + hsE(hsShortDate(o.gradDate)) + '</em></button>'; }).join('')
    : '<div class="nfo-empty sm">None in the next 14 days.</div>') + '</div></div>';
  return h;
}
function hsQualityHTML(all) {
  var types = HS_TYPES.filter(function (t) { return all.some(function (o) { return o.type === t && o.assessed; }); }); if (!types.length) return '<div class="nfo-card"><div class="nfo-empty">The Standards fill in once facilities complete their baseline.</div></div>';
  if (!_hs.qtype || types.indexOf(_hs.qtype) < 0) _hs.qtype = types[0];
  var L = all.filter(function (o) { return o.type === _hs.qtype && o.assessed; }), rows = L.map(function (o) { var a = o.dept ? nfDeptAgg(o.s) : o.agg; return { code: o.code, name: o.name, agg: a }; });
  var tabs = '<div class="hs-types" role="tablist" aria-label="Type">' + types.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (_hs.qtype === t) + '" class="' + (_hs.qtype === t ? 'on' : '') + '" onclick="_hs.qtype=\'' + t + '\';hsRenderProg()">' + hsE(hsPlural(t)) + '</button>'; }).join('') + '</div>';
  return '<div class="nfo-card"><div class="nfo-ch"><b>Standards across facilities</b><span>one facility type at a time · green ≥70% · amber at minimum · red below minimum · <button type="button" class="nfo-link" onclick="_nfOv.allStd=!_nfOv.allStd;hsRenderProg()">' + (_nfOv.allStd ? 'Show the weakest 12' : 'Show all Standards') + '</button></span></div>' + tabs + nfHeatHTML(rows) + '</div>'
    + '<div class="nfo-card"><div class="nfo-ch"><b>Most improved since baseline</b></div>' + nfImprovedHTML(rows) + '</div>';
}
function hsRenderProg() {
  if (!hsOn()) return; var box = hsBox('hs-prog', 'hsprog'); if (!box) return;
  var all = hsAll(), t = _hs.ptab, tab = function (k, l) { return '<button type="button" role="tab" aria-selected="' + (t === k) + '" class="' + (t === k ? 'on' : '') + '" onclick="hsProgTab(\'' + k + '\')">' + l + '</button>'; };
  var h = '<div class="nfo-top"><div><h1>Programme</h1><small>How the programme is going across all facilities</small></div>' + (t === 'peer' ? '<button type="button" class="hs-btn p lg" onclick="scqEditSession(null)">+ Schedule a peer review</button>' : t === 'live' ? '<button type="button" class="hs-btn p lg" onclick="scEditLive(null)">+ Schedule a live session</button>' : '') + '</div>'
    + '<div class="hs-tabs" role="tablist" aria-label="Programme">' + tab('quality', 'Quality') + tab('grad', 'Graduation &amp; certification') + tab('peer', 'Peer reviews') + tab('live', 'Live sessions') + '</div>';
  if (t === 'quality') h += hsQualityHTML(all);
  else if (t === 'peer') h += '<div class="nfo-card"><div id="scq-rv-body"><div class="nfo-empty sm">Loading sessions…</div></div></div>';
  else if (t === 'live') h += '<div class="nfo-card"><div id="scx-live-list"><div class="nfo-empty sm">Loading sessions…</div></div></div>';
  else h += hsGradHTML(all);
  box.innerHTML = h;
  if (t === 'peer') Promise.all([scqLoadChampions(), scqLoadSessions()]).then(function () { try { if (!_scqTab) _scqTab = 'approve'; } catch (e) {} scqRenderReviews(); }, function () {});
  if (t === 'live') scLoadLive().then(function () { scRenderLiveList(); }, function () {});
}

// ═══ REPORTS ═══
function hsRenderReports() {
  if (!hsOn()) return; var box = hsBox('hs-rep', 'reports'); if (!box) return;
  var card = function (title, txt, who, btns) { return '<div class="nfo-card hs-rc"><b>' + title + '</b><p>' + txt + '</p><small>' + who + '</small><div>' + btns + '</div></div>'; };
  var b = function (l, js, p) { return '<button type="button" class="hs-btn' + (p ? ' p' : '') + '" onclick="' + js + '">' + l + '</button>'; };
  var hasDept = typeof nfDeptCodes === 'function' && nfDeptCodes().length;
  box.innerHTML = '<div class="nfo-top"><div><h1>Reports</h1><small>What each report contains, who it is for and its format</small></div></div><div class="hs-rg">'
    + card('Facility progress — Sub-Centres', 'Readiness, baseline and change, NQAS check and actions for every Sub-Centre, by package and Area of Concern.', 'HealSol, District, donors · printable', b('Open', "openReportModal('prog')", 1))
    + (hasDept ? card('Facility progress — UPHC · PHC · CHC', 'One row per facility: day, readiness, baseline and change, NQAS result, actions, department-days to check — with sheets by department and by Area of Concern.', 'HealSol, District, donors · Excel', b('Download', 'nfDeptReport()', 1)) : '')
    + card('One facility (printable)', 'A facility\'s full report: readiness, weakest Standards, gaps and actions, staff.', 'For the facility and the District · PDF / print', b('Choose facility…', "openReportModal('facility')"))
    + card('Graduation &amp; certificates', 'Results, criteria below the mark, catch-ups, NHSRC / LaQshya / MusQan status and certificates issued, per facility — every type.', 'HealSol, State, donors · Excel', b('Download', 'hsGradReport()', 1))
    + card('Staff &amp; roles', 'Each staff member\'s cards, verification and readiness, by role.', 'HealSol and Supervisors · printable', b('Open', "openReportModal('role')", 1))
    + card('Business', 'Registrations, payments, trials, follow-up and enquiries for the dates you choose.', 'HealSol only · Excel or PDF', b('Preview &amp; download', 'nfBusinessReport()', 1) + b('Open Business', "nfAdminView('business')"))
    + '</div>';
}
async function hsGradReport() {
  try {
    await hsLoadCerts(); var X = await nfLoadXlsx(), wb = X.utils.book_new(), all = hsAll(), C = _hs.certs || {}, date = hsTodayIso();
    var rows = [['Type', 'Facility', 'ID', 'District', 'Start date', 'Days', 'Phase', 'Result', 'Graduated on', 'Baseline %', 'End-line %', 'Departments below', 'Areas of Concern below', 'Standards below', 'End-line not verified', 'Catch-up', 'NHSRC', 'LaQshya', 'MusQan', 'Certificates issued', 'Population']];
    all.forEach(function (o) { var g = o.grad || {}, cu = o.cu;
      rows.push([hsShort(o.type), o.name, o.code, o.district, o.f.startDate || '', o.days, HS_PHASE[o.phase], g.result ? (HS_RES[g.result] || [g.result])[0] : '', g.at ? String(g.at).slice(0, 10) : '', g.base == null ? '' : g.base, g.overall == null ? '' : g.overall,
        (g.deptFails || []).join(', '), (g.aocFails || []).join(', '), (g.stdFails || []).join(', '), (g.notVerified || []).join(', '), cu ? (cu.done ? 'done' : 'on') + ' ' + (cu.start || '') + '–' + (cu.end || '') : '',
        (o.f.nhsrc || {}).status || '', (o.f.laqshya || {}).status || '', (o.f.musqan || {}).status || '', Object.keys(C[o.code] || {}).length, o.f.population && o.f.population.n ? o.f.population.n : '']); });
    var ws = X.utils.aoa_to_sheet(rows); X.utils.book_append_sheet(wb, ws, 'Graduation');
    var cr = [['Certificate No.', 'Name', 'Role', 'Facility', 'Type', 'Grade', 'Facility %', 'Issued']];
    Object.keys(C).forEach(function (code) { var f = (scMasterFacilities || {})[code] || {}; Object.keys(C[code] || {}).forEach(function (m) { var c = C[code][m] || {}; cr.push([c.certId, c.name, c.role, c.facilityName || f.name || code, hsShort(nfTypeOf(f)), c.grade, c.facPct, String(c.issuedAt || '').slice(0, 10)]); }); });
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(cr), 'Certificates');
    var name = 'NQAS-FAST-graduation-' + date + '.xlsx'; if (typeof nfSaveWb === 'function') await nfSaveWb(X, wb, name); else X.writeFile(wb, name);
    showToast('Report downloaded.', 'ok');
  } catch (e) { console.warn(e); showToast('Could not create the report — check the connection.', 'err'); }
}

// ═══ SETTINGS (tabs over the old Setup panels) and CONTENT (tabs over Card editor / Checkpoints) ═══
var HS_STABS = [['enrol', 'Enrol & links'], ['people', 'People'], ['rules', 'Programme rules'], ['pricing', 'Pricing'], ['partners', 'Partners'], ['recog', 'Recognition'], ['support', 'Support'], ['danger', 'Danger zone']];
function hsSetupGroup(el) {
  var id = el.id || '', t = (el.textContent || '').slice(0, 400);
  if (id === 'scb-reset-panel' || /Security migration|Reset progress/.test(t)) return 'danger';
  if (id === 'scd-dist-panel' || id === 'nf-plogins' || id === 'scq-champ-panel' || id === 'nf-ho-card' || id === 'nf-sec-panel' || el.querySelector('#sc-sup-list')) return 'people';
  if (el.querySelector('#pricing-list')) return 'pricing';
  if (id === 'nf-supset') return 'support';
  if (id === 'nf-certset' || id === 'hs-rules') return 'rules';
  return 'enrol';   // enrol form, access key
}
function hsTagSetup() { var main = document.querySelector('#admin-app .admin-main'); if (!main) return; [].forEach.call(main.children, function (el) { if (el.dataset.nfv === 'setup') el.dataset.hsg = hsSetupGroup(el); }); }
function hsSetTab(t) {
  _hs.stab = t;
  if (t === 'partners') nfAdminView('stdon'); else if (t === 'recog') nfAdminView('recog'); else { if (_nfOv.view !== 'setup') nfAdminView('setup'); else nfAdminApply(); }
}
function hsEnsureTabs() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var st = document.getElementById('hs-stabs'); if (!st) { st = document.createElement('div'); st.id = 'hs-stabs'; st.dataset.nfv = 'hstabs'; st.className = 'hs-tabs hs-stabs'; st.setAttribute('role', 'tablist'); main.insertBefore(st, main.firstChild); }
  var cur = _nfOv.view === 'stdon' ? 'partners' : _nfOv.view === 'recog' ? 'recog' : _hs.stab;
  st.innerHTML = '<h1 class="hs-h1">Settings</h1>' + HS_STABS.map(function (x) { return '<button type="button" role="tab" aria-selected="' + (cur === x[0]) + '" class="' + (cur === x[0] ? 'on' : '') + (x[0] === 'danger' ? ' danger' : '') + '" onclick="hsSetTab(\'' + x[0] + '\')">' + hsE(x[1]) + '</button>'; }).join('');
  var ct = document.getElementById('hs-ctabs'); if (!ct) { ct = document.createElement('div'); ct.id = 'hs-ctabs'; ct.dataset.nfv = 'hstabs'; ct.className = 'hs-tabs hs-ctabs'; ct.setAttribute('role', 'tablist'); main.insertBefore(ct, main.firstChild); }
  ct.innerHTML = typeof scdTypeTabs === 'function' ? scdTypeTabs() : '<h1 class="hs-h1">Checkpoints</h1>';
  if (!document.getElementById('hs-rules')) { var r = document.createElement('div'); r.id = 'hs-rules'; r.dataset.nfv = 'setup'; r.className = 'nfo-card hs-rules';
    r.innerHTML = '<b><i class="ti ti-adjustments"></i> Programme rules</b><p>NQAS criteria (overall, Area of Concern, Standard minimums) are set in Content → Checkpoints → Sub-Centre → NQAS criteria; UPHC / PHC / CHC use 70% overall, per department and per Area of Concern, 50% per Standard. Timeline — grace days after the last day, catch-up, on-time thresholds — is set separately for Sub-Centres, UPHCs, PHCs and CHCs:</p>'
      + '<button type="button" class="hs-btn p" onclick="nfgSettings()">Timeline settings</button>';
    main.appendChild(r); }
  if (main.firstChild !== ct) main.insertBefore(ct, main.firstChild); if (main.firstChild !== st) main.insertBefore(st, main.firstChild);
  hsTagSetup();
}

// ═══ FACILITY PAGE: one summary strip for every type (SC drill-in and the UPHC / PHC / CHC view) ═══
function hsFacStripHTML(code) {
  if (!hsOn() || !(scMasterFacilities || {})[code]) return '';
  var o = hsInfo(code), ch = o.pct != null && o.base != null ? o.pct - o.base : null, r;
  if (o.grad) r = '<b class="' + (o.grad.result === 'ready' ? 'g' : o.grad.result === 'almost' ? 'a' : 'r') + '">' + (HS_RES[o.grad.result] || HS_RES.incomplete)[0] + '</b><small>graduated ' + hsE(hsShortDate(String(o.grad.at || '').slice(0, 10))) + '</small>';
  else r = hsResult(o) + '<small>' + (o.phase === 'notstarted' ? 'not started' : 'graduation ' + hsE(hsShortDate(o.gradDate))) + '</small>';
  var c = function (l, v, s, cls) { return '<div class="hs-fs' + (cls ? ' ' + cls : '') + '"><small>' + l + '</small>' + v + (s ? '<small>' + s + '</small>' : '') + '</div>'; };
  return '<div class="hs-fstrip" id="hs-fstrip">' + c('Day', '<b>' + (o.phase === 'notstarted' ? '—' : (o.phase === 'catchup' ? o.days : o.day) + ' / ' + o.days) + '</b>', hsE(HS_PHASE[o.phase]))
    + c('Readiness', '<b>' + (o.pct == null ? '—' : o.pct + '%') + '</b>', o.base != null ? 'baseline ' + o.base + '%' + (ch != null ? ' · ' + (ch >= 0 ? '+' : '') + ch : '') : '')
    + c(o.grad ? 'Result' : 'NQAS', r, '')
    + c('On time', '<b>' + (o.onTime == null ? '—' : o.onTime + '%') + '</b>', o.behind ? 'behind schedule' : o.comp && o.inProg ? 'on track' : '', o.behind ? 'r' : '')
    + c('Overdue actions', '<b>' + (o.overdue || 0) + '</b>', '', o.overdue ? 'r' : '')
    + c('Staff', '<b>' + o.staffN + '</b>', hsE(o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : 'no ' + o.inChargeLabel)) + '</div>';
}
(function () {
  if (typeof scDrillIn !== 'function') return;
  var oIn = scDrillIn;
  scDrillIn = async function (code) {
    var r = await oIn.apply(this, arguments);
    try { if (hsOn()) { var old = document.getElementById('hs-fstrip'); if (old) old.remove(); var at = document.getElementById('sc-drill-info'); var f = (scMasterFacilities || {})[code];
      if (at && f && nfTypeOf(f) === 'sc') at.insertAdjacentHTML('afterend', hsFacStripHTML(code)); } } catch (e) { console.warn('[HS] strip', e); }
    return r;
  };
})();

// ═══ wiring ═══
(function () {
  if (typeof nfAdminItems !== 'function') return;
  var oItems = nfAdminItems;
  nfAdminItems = function () {
    if (!hsOn()) return oItems.apply(this, arguments);
    var n = hsTodayCount();
    return [{ v: 'today', l: 'Today', icon: 'ti-checklist', onclick: "nfAdminView('today')", badge: n || '' }, { v: 'hsfac', l: 'Facilities', icon: 'ti-building-hospital', onclick: "nfAdminView('hsfac')" },
      { v: 'hsprog', l: 'Programme', icon: 'ti-chart-bar', onclick: "nfAdminView('hsprog')" }, { v: 'business', l: 'Business', icon: 'ti-briefcase', onclick: "nfAdminView('business')" },
      { v: 'reports', l: 'Reports', icon: 'ti-file-text', onclick: "nfAdminView('reports')" }, { v: 'content', l: 'Content', icon: 'ti-list-details', onclick: "nfAdminView('editor')" },
      { v: 'settings', l: 'Settings', icon: 'ti-settings', onclick: "_hs.stab=_hs.stab||'enrol';nfAdminView('setup')" }];
  };
  var oApply = nfAdminApply;
  nfAdminApply = function () {
    var r = oApply.apply(this, arguments);
    var on = hsOn(), v = _nfOv.view; document.body.classList.toggle('hs-admin', on);
    if (!on) return r;
    ['today', 'hsfac', 'hsprog'].forEach(function (x) { document.body.classList.toggle('nfv-' + x, v === x); });
    document.body.setAttribute('data-hsst', v === 'setup' ? _hs.stab : '');
    try { hsEnsureTabs(); } catch (e) { console.warn('[HS] tabs', e); }
    var side = document.getElementById('nfs-side'), map = { editor: 'content', dm: 'content', setup: 'settings', stdon: 'settings', recog: 'settings', inbox: 'today', overview: 'today', facilities: 'hsfac' };
    var cur = v === 'drill' ? (map[_nfOv.prev] || _nfOv.prev) : (map[v] || v);
    if (side) side.querySelectorAll('.nfs-nav button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === cur); });
    return r;
  };
  var oView = nfAdminView;
  nfAdminView = function (v) {
    if (hsOn() && v === 'overview') v = 'today';
    if (hsOn() && v === 'facilities') v = 'hsfac';
    var r = oView.call(this, v);
    if (!hsOn()) return r;
    try { if (v === 'today') hsRenderToday(); else if (v === 'hsfac') hsRenderFac(); else if (v === 'hsprog') hsRenderProg(); else if (v === 'reports') hsRenderReports(); hsEnsureTabs(); setTimeout(function () { try { hsEnsureTabs(); } catch (e) {} }, 400); } catch (e) { console.warn('[HS] view', e); }
    return r;
  };
  var oShell = nfAdminShell;
  nfAdminShell = function () { if (hsOn() && (_nfOv.view === 'overview' || _nfOv.view === 'inbox' && !_hs.seen)) { _nfOv.view = 'today'; } _hs.seen = true; return oShell.apply(this, arguments); };
  var oOv = nfRenderOverview;
  nfRenderOverview = function () {
    var r = oOv.apply(this, arguments);
    try { if (hsOn()) { var v = _nfOv.view; if (v === 'today') hsRenderToday(); else if (v === 'hsfac') hsRenderFac(); else if (v === 'hsprog' && _hs.ptab !== 'peer' && _hs.ptab !== 'live') hsRenderProg(); else if (v === 'reports') hsRenderReports();
      var side = document.getElementById('nfs-side'); if (side) { var b = side.querySelector('[data-v="today"] em'), n = hsTodayCount(); if (b) b.textContent = n || ''; } } } catch (e) { console.warn('[HS] render', e); }
    return r;
  };
  if (typeof logoutAdmin === 'function') { var oLo = logoutAdmin; logoutAdmin = async function () { _hs.seen = false; _hs.sessAt = 0; _hs.liveAt = 0; _hs.certs = null; return oLo.apply(this, arguments); }; }
})();
