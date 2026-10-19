// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE — FACILITY SUMMARY (Step 2e, 19 Oct 2026): one record per UPHC / PHC / CHC, worked out with the same
// functions the department app uses (readiness from the latest scores, the published checkpoint master, actions).
//   • HealSol Overview / Reports compute it live for each department-core facility (dept/admin.js).
//   • The nightly summary (functions/summary.js) opens this page on the server and calls nfDeptSumAsync() → sc_summary/fac/{code}.
// Record: {v, type, code, name, state, district, block, staff, startDate, day, days, phase, pct, base, assessed, total, meets,
//   byAoc, byStd, byDept, noAct, acts:{open, od, fixed, sup, closed}, checksDue, master, suspended, sub, demo, at}
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
var ND_SUM_VER = 1;
function nfDeptSumFacility(st) {   // synchronous; st = {code, fac, cl (checklist data), live (published master or null), pcards, dcards, actions, today}
  var keep = typeof _nd !== 'undefined' ? _nd : null, f = st.fac || {}, T = nfTypeOf(f), cfg = NF_LEVELS[T] || {};
  try {
    _nd = { code: st.code, fac: f, cfg: cfg, cl: st.cl, plan: {}, cards: st.dcards || {}, pcards: st.pcards || {}, actions: st.actions || {}, sel: {}, view: 'sum' };
    var S = nfDeptShape(cfg), live = st.live || {}, lay = nfDeptLayerRows(st.cl.items, live);
    _nd.cl = Object.assign({}, st.cl, { items: lay.rows }); _nd.byId = lay.all; _nd.live = live; _nd.ct = {}; _nd.base0 = {}; _nd.lang = 'en';
    st.cl.items.forEach(function (r) { _nd.base0[r[0]] = r; });
    var deps = ndDeptDefs().map(function (d) { return d.id; }), pass = (cfg.passMark || {}).overall || 70, today = st.today || ndToday();
    var L = ndLatest(), R = nfDeptReadiness(lay.rows, L, { pass: pass, depts: deps }), B = nfDeptReadiness(lay.rows, ndLatest(S.bN), { pass: pass, depts: deps });
    var std = {}; lay.rows.forEach(function (r) { if (deps.indexOf(r[1]) < 0) return; var v = L[r[0]]; if (v === undefined || v === null || v === '') return; var x = std[r[3]] = std[r[3]] || { g: 0, m: 0 }; x.g += +v; x.m += 2; });
    var byStd = {}; Object.keys(std).forEach(function (k) { if (/^[A-H]\d{1,2}$/.test(k)) byStd[k] = Math.round(100 * std[k].g / std[k].m); });
    var byAoc = {}; Object.keys(R.byAoc || {}).forEach(function (a) { if (R.byAoc[a].pct !== null) byAoc[a] = R.byAoc[a].pct; });
    var byDept = {}; Object.keys(R.byDept || {}).forEach(function (d) { if (R.byDept[d].pct !== null) byDept[d] = R.byDept[d].pct; });
    var A = _nd.actions || {}, acts = { open: 0, od: 0, fixed: 0, sup: 0, closed: 0 };
    Object.keys(A).forEach(function (id) { var a = A[id] || {}; if (acts[a.status] != null) acts[a.status]++; if (a.status === 'open' && a.due && a.due < today) acts.od++; });
    var F = ndLatestFinal(), noAct = Object.keys(F).filter(function (id) { var a = A[id]; return F[id].s < 2 && (!a || a.status === 'closed'); }).length;
    var day = f.startDate ? nfDeptDayNo(f.startDate, today) : null, checksDue = 0;
    if (day) ndDeptDefs().forEach(function (d) { for (var n = 1; n <= Math.min(day, S.days); n++) { if (ndRes(d.id, n).chk) continue; var c = ndPc(d.id, n); if (Object.keys(c).some(function (m) { return c[m] && c[m].done; }) && !ndSoloDone(d.id, n)) checksDue++; } });
    var staff = Object.keys(f.staff || {}).filter(function (m) { return f.staff[m] && !f.staff[m].disabled; }).length;
    return JSON.parse(JSON.stringify({ v: ND_SUM_VER, type: T, code: st.code, name: f.name || st.code, state: f.state || '', district: f.district || '', block: f.block || '',
      staff: staff, startDate: f.startDate || null, day: day, days: S.days, phase: !day || day < 1 ? 'notstarted' : day > S.days ? 'complete' : 'running',
      pct: R.overall, base: B.n ? B.overall : null, assessed: R.n || 0, total: R.of || 0, meets: !!R.meets, byAoc: byAoc, byStd: byStd, byDept: byDept,
      noAct: noAct, acts: acts, checksDue: checksDue, master: live.v || 0, suspended: !!f.suspended, sub: f.subscriptionStatus || '', demo: !!f.isDemo, at: new Date().toISOString() }));
  } finally { _nd = keep; }
}
// the server's entry: loads the type's checklist from this page, then works it out
async function nfDeptSumAsync(st) { var cfg = NF_LEVELS[nfTypeOf(st.fac || {})] || {}; st.cl = await nfLoadData(cfg.checklist); return nfDeptSumFacility(st); }
