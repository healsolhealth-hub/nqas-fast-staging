// ══════════════════════════════════════════════════════════════
// DEPARTMENT CORE — day plan (UPHC, PHC, CHC). Plain functions, no screen code.
// Agreed 16 Oct 2026: same 60-day shape as SC, run by every department on its own checklist; all departments start the
// baseline together (one facility start date).
//   Days 1–7    baseline: the department's checkpoints in the order structure → process → outcome
//               (Areas of Concern C · D · B · F · A · E · G · H, checklist order inside each), split into 7 days of
//               similar size; a day never splits a Measurable Element.
//   Days 8–49   implementation, 6 weeks: week 1–5 = baseline day 1–5, week 6 = baseline days 6 + 7. Each week's
//               checkpoints are spread over its 7 days, so every item gets attention.
//   Days 50–56  end-line: the baseline days again.
//   Days 57–60  readiness week: 57–58 end-line verification, 59 final team review, 60 graduation (no checklist card).
// ══════════════════════════════════════════════════════════════
var NF_DEPT_AOC_ORDER = ['C', 'D', 'B', 'F', 'A', 'E', 'G', 'H'];
var NF_DEPT_PHASES = { baseline: [1, 7], impl: [8, 49], endline: [50, 56], ready: [57, 60] };   // the 60-day shape (UPHC, PHC)
// a programme's shape from its type settings (cfg.plan): {base, implWeeks, end, ready} → day numbers of each phase.
// 60 days: 7 · 6 weeks · 7 · 4 (default). CHC 90 days: 14 · 8 weeks · 14 · 6.
function nfDeptShape(cfg) {
  var p = (cfg && cfg.plan) || {}, b = p.base || 7, w = p.implWeeks || 6, e = p.end || b, r = p.ready || 4;
  var iN = b + w * 7, eN = iN + e;
  return { base: b, implWeeks: w, end: e, ready: r, b1: 1, bN: b, i1: b + 1, iN: iN, e1: iN + 1, eN: eN, r1: eN + 1, rN: eN + r, days: eN + r };
}
// which baseline days each implementation week revisits: the baseline days shared out over the weeks (60 days: 1…5, then 6+7)
function nfDeptWeekBase(S) {   // equal shares; the extra baseline days go to the last weeks (60 days: 1, 2, 3, 4, 5, 6+7)
  var per = Math.floor(S.base / S.implWeeks), extra = S.base % S.implWeeks, out = [], d = 1;
  for (var w = 0; w < S.implWeeks; w++) { var n = per + (w >= S.implWeeks - extra ? 1 : 0), part = []; for (var k = 0; k < n && d <= S.base; k++) part.push(d++); out.push(part); }
  return out;
}

// split an ordered list into n parts of similar size, cutting only where the group key changes
function nfDeptSplit(list, n, keyOf) {
  var parts = [], i = 0, left = list.length;
  for (var k = 0; k < n; k++) {
    var want = Math.round(left / (n - k)), end = Math.min(list.length, i + want);
    if (k === n - 1) end = list.length;
    else if (end > i && end < list.length) {
      // move the cut to the nearest group boundary (at most a third of the part either way)
      var slack = Math.max(1, Math.floor(want / 3)), best = -1;
      for (var d = 0; d <= slack && best < 0; d++) {
        [end - d, end + d].forEach(function (e) { if (best < 0 && e > i && e < list.length && keyOf(list[e]) !== keyOf(list[e - 1])) best = e; });
      }
      if (best > 0) end = best;
    }
    parts.push(list.slice(i, end)); left -= (end - i); i = end;
  }
  return parts;
}
// items of one department in baseline order. items = checklist rows [id, dept, aoc, std, me, …]
function nfDeptOrder(items, dept) {
  var mine = items.filter(function (r) { return r[1] === dept; });
  var rank = {}; NF_DEPT_AOC_ORDER.forEach(function (a, i) { rank[a] = i; });
  return mine.map(function (r, i) { return { r: r, i: i }; })
    .sort(function (a, b) { return (rank[a.r[2]] - rank[b.r[2]]) || (a.i - b.i); })
    .map(function (x) { return x.r; });
}
// the 7 baseline days of a department → arrays of checkpoint ids
function nfDeptBaseline(items, dept, S) {
  return nfDeptSplit(nfDeptOrder(items, dept), (S && S.base) || 7, function (r) { return r[3] + '|' + r[4]; })
    .map(function (part) { return part.map(function (r) { return r[0]; }); });
}
// what a programme day holds for a department: {phase, day, week, ids:[checkpoint ids], base:[baseline day numbers]}
function nfDeptDay(plan, day, S) {
  day = +day; S = S || nfDeptShape(null);
  if (day >= 1 && day <= S.bN) return { phase: 'baseline', day: day, ids: (plan[day - 1] || []).slice(), base: [day] };
  if (day >= S.e1 && day <= S.eN) { var bd = Math.min(S.base, day - S.iN); return { phase: 'endline', day: day, ids: (plan[bd - 1] || []).slice(), base: [bd] }; }
  if (day >= S.i1 && day <= S.iN) {
    var week = Math.floor((day - S.i1) / 7) + 1, dayInWeek = (day - S.i1) % 7;   // week 1…implWeeks, day 0–6
    var base = nfDeptWeekBase(S)[week - 1] || [], ids = [];
    base.forEach(function (b) { ids = ids.concat(plan[b - 1] || []); });
    var spread = nfDeptSplit(ids.map(function (id) { return [id]; }), 7, function (x) { return x[0]; });
    var out = spread[dayInWeek].map(function (x) { return x[0]; }), imp = plan.imp;
    if (imp) {   // HealSol moved some checkpoints to another implementation day (Step 2c day-plan board)
      out = out.filter(function (id) { return !imp[id] || imp[id] === day; });
      Object.keys(imp).forEach(function (id) { if (imp[id] === day && out.indexOf(id) < 0) out.push(id); });
    }
    return { phase: 'impl', day: day, week: week, ids: out, base: base };
  }
  if (day >= S.r1 && day <= S.rN) return { phase: 'ready', day: day, ids: [], base: [] };
  return { phase: day < 1 ? 'before' : 'after', day: day, ids: [], base: [] };
}
// programme day for a start date ('YYYY-MM-DD') and today (local date string); Day 1 = start date
function nfDeptDayNo(start, today) {
  if (!start) return 0;
  var a = new Date(start + 'T00:00:00'), b = new Date((today || scTodayStr()) + 'T00:00:00');
  return Math.round((b - a) / 86400000) + 1;
}
// readiness: score 2 = Met, 1 = Partial, 0 = Not met. latest = {checkpointId: score}. Returns
// {overall, byDept:{GC:{pct,n,of,byAoc:{A:{pct,n,of}}}}, byAoc:{A:{pct,n,of}}, pass:{overall,dept,aoc}, fails:[…]}
function nfDeptReadiness(items, latest, opts) {
  opts = opts || {}; var mark = opts.pass || 70, on = opts.depts || null;
  var acc = function () { return { got: 0, max: 0, n: 0, of: 0 }; }, all = acc(), byDept = {}, byAoc = {};
  items.forEach(function (r) {
    if (on && on.indexOf(r[1]) < 0) return;
    var d = byDept[r[1]] = byDept[r[1]] || Object.assign(acc(), { byAoc: {} }), a = byAoc[r[2]] = byAoc[r[2]] || acc(), da = d.byAoc[r[2]] = d.byAoc[r[2]] || acc();
    [all, d, a, da].forEach(function (x) { x.of++; });
    var s = latest[r[0]]; if (s === undefined || s === null || s === '') return;
    [all, d, a, da].forEach(function (x) { x.n++; x.got += +s; x.max += 2; });
  });
  // readiness = points ÷ maximum for EVERY checkpoint of the departments switched on (not yet checked = 0), the Sub-Centre rule
  // (HealSol 21 Oct); comp = the score of what has been checked so far ("88% of those Met / Partial"); null until something is checked
  var pct = function (x) { return x.n ? Math.round(100 * x.got / (2 * x.of)) : null; }, comp = function (x) { return x.max ? Math.round(100 * x.got / x.max) : null; };
  var out = function (x) { return { pct: pct(x), comp: comp(x), n: x.n, of: x.of }; };
  var res = { overall: pct(all), comp: comp(all), n: all.n, of: all.of, byDept: {}, byAoc: {}, fails: [] };
  Object.keys(byDept).forEach(function (k) { var d = byDept[k]; res.byDept[k] = Object.assign(out(d), { byAoc: {} }); Object.keys(d.byAoc).forEach(function (a) { res.byDept[k].byAoc[a] = out(d.byAoc[a]); }); });
  Object.keys(byAoc).forEach(function (a) { res.byAoc[a] = out(byAoc[a]); });
  if (res.overall === null || res.overall < mark) res.fails.push('overall');
  Object.keys(res.byDept).forEach(function (k) { var p = res.byDept[k].pct; if (p === null || p < mark) res.fails.push('dept:' + k); });
  Object.keys(res.byAoc).forEach(function (a) { var p = res.byAoc[a].pct; if (p === null || p < mark) res.fails.push('aoc:' + a); });
  res.meets = !res.fails.length && all.n === all.of;
  return res;
}

// ── Step 2c: HealSol's checkpoint master on top of the checklist ──
function nfDeptPlanIds(plan) { var a = []; (plan || []).forEach(function (d) { a = a.concat(d || []); }); return a; }
// a department's plan with HealSol's moves: moves = {id: {b: baseline day, i: implementation day}}.
// b moves the checkpoint to another baseline day (so its implementation week and end-line day follow); i pins its implementation day.
function nfDeptPlan(items, dept, S, moves) {
  var plan = nfDeptBaseline(items, dept, S); moves = moves || {};
  var mine = {}; plan.forEach(function (d) { d.forEach(function (id) { mine[id] = 1; }); });
  Object.keys(moves).sort().forEach(function (id) {
    var m = moves[id]; if (!mine[id] || !m || !m.b) return;
    var k = Math.min(Math.max(1, +m.b), S.base) - 1;
    plan = plan.map(function (d) { return d.filter(function (x) { return x !== id; }); }); plan[k].push(id);
  });
  var imp = {}; Object.keys(moves).forEach(function (id) { var m = moves[id]; if (mine[id] && m && +m.i >= S.i1 && +m.i <= S.iN) imp[id] = +m.i; });
  if (Object.keys(imp).length) plan.imp = imp;
  return plan;
}
// plan stored in the database {b: [[ids]…], i: {id: day}} ⇄ plan array
function nfDeptPlanPack(plan) { var o = { b: plan.map(function (d) { return d.length ? d : ['']; }) }; if (plan.imp) o.i = plan.imp; return o; }
function nfDeptPlanUnpack(o, S) {
  var b = (o && o.b) || [], plan = [];
  for (var k = 0; k < S.base; k++) plan.push(((b[k] || [])).filter(function (x) { return x; }));
  if (o && o.i) plan.imp = o.i;
  return plan;
}
// checklist rows with a published layer {edits, added} (values as the master stores them: method/items/… as JSON text)
// → {rows: active rows, all: {id: row incl. retired}, retired: {id: true}}
function nfDeptLayerRows(items, layer) {
  layer = layer || {}; var E = layer.edits || {}, A = layer.added || {}, all = {}, retired = {}, order = [];
  var j = function (v, d) { if (typeof v !== 'string') return v || d; try { return JSON.parse(v); } catch (e) { return d; } };
  var row = function (r, e) {
    r = r.slice(); if (!e) return r;
    if (e.dept) r[1] = e.dept; if (e.aoc) r[2] = e.aoc; if (e.std) r[3] = e.std; if (e.me) r[4] = e.me; if (e.t) r[5] = e.t;
    if (e.method !== undefined) r[6] = j(e.method, []).join('/');
    if (e.items !== undefined) r[7] = j(e.items, []).map(function (x) { return x.t; }).join('; ');
    return r;
  };
  items.forEach(function (r) { var x = row(r, E[r[0]]); all[x[0]] = x; order.push(x); if (E[r[0]] && E[r[0]].retired) retired[x[0]] = true; });
  Object.keys(A).sort().forEach(function (id) {
    var a = A[id] || {}, x = row([id, a.dept, a.aoc, a.std, a.me, a.t, '', '', a.ord || 9999], a);
    var at = -1; order.forEach(function (o, i) { if (o[1] === x[1] && (o[3] === x[3] || (at < 0 && o[2] === x[2]))) at = i; });
    if (at < 0) order.forEach(function (o, i) { if (o[1] === x[1]) at = i; });
    if (at < 0) order.push(x); else order.splice(at + 1, 0, x);
    all[id] = x; if (a.retired) retired[id] = true;
  });
  return { rows: order.filter(function (r) { return !retired[r[0]]; }), all: all, retired: retired };
}
// ── Step 2d (HealSol 19 Oct): the checklist's MoV text → the things staff tick, as a default HealSol can edit ──
// numbered points "1. … 2. …" → one item each; several sentences → one item each; a short list "A, B, C" (3+ short parts)
// → one item each; anything else stays one item (one item: ✓ = Met, ✗ = Not met).
function nfMovSplit(s) {
  s = String(s || '').replace(/\s+/g, ' ').trim(); if (!s) return [];
  var cap = function (p) { p = String(p).replace(/^[\s.;,\-–•]+|[\s.;,\-–•]+$/g, ''); return p ? p.charAt(0).toUpperCase() + p.slice(1) : p; };
  var words = function (p) { return p.split(' ').filter(Boolean).length; };
  if (/^\(?1[.)]\s*/.test(s) && /\s\(?2[.)]\s*/.test(s)) {
    var np = s.split(/(?:^|\s)\(?\d{1,2}[.)]\s*(?=[A-Za-z])/).map(cap).filter(function (p) { return p.length > 2; });
    if (np.length > 1) return np;
  }
  var sn = s.replace(/([a-z0-9)\]])\s*\.\s+(?=[A-Z])/g, '$1\u0001').split('\u0001').filter(function (p) { return p.trim(); });   // no look-behind (older phones)
  if (sn.length > 1 && sn.every(function (p) { return words(p) >= 3; })) return sn.map(cap);
  var parts = [], cur = '', depth = 0, t = s.replace(/\.$/, '');
  for (var i = 0; i < t.length; i++) {
    var ch = t.charAt(i); if (ch === '(' || ch === '[') depth++; if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1);
    if (!depth && (ch === ';' || (ch === ',' && !(/\d/.test(t.charAt(i - 1)) && /\d/.test(t.charAt(i + 1)))))) { parts.push(cur); cur = ''; } else cur += ch;
  }
  parts.push(cur); parts = parts.map(function (p) { return p.trim().replace(/^(and|&)\s+/i, ''); }).filter(Boolean);
  if (parts.length >= 3 && words(parts[0]) <= 5 && parts.slice(0, -1).every(function (p) { return words(p) <= 6; }) && words(parts[parts.length - 1]) <= 10
    && parts.every(function (p) { return p.length >= 2; }) && parts.reduce(function (a, p) { return a + words(p); }, 0) / parts.length <= 4.5) return parts.map(cap);
  return [cap(s)];
}
