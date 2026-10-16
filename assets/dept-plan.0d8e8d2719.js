// ══════════════════════════════════════════════════════════════
// DEPARTMENT CORE — day plan (UPHC now; PHC / CHC later). Plain functions, no screen code.
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
var NF_DEPT_PHASES = { baseline: [1, 7], impl: [8, 49], endline: [50, 56], ready: [57, 60] };

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
function nfDeptBaseline(items, dept) {
  return nfDeptSplit(nfDeptOrder(items, dept), 7, function (r) { return r[3] + '|' + r[4]; })
    .map(function (part) { return part.map(function (r) { return r[0]; }); });
}
// what a programme day holds for a department: {phase, day, week, ids:[checkpoint ids], base:[baseline day numbers]}
function nfDeptDay(plan, day) {
  day = +day;
  if (day >= 1 && day <= 7) return { phase: 'baseline', day: day, ids: plan[day - 1].slice(), base: [day] };
  if (day >= 50 && day <= 56) return { phase: 'endline', day: day, ids: plan[day - 50].slice(), base: [day - 49] };
  if (day >= 8 && day <= 49) {
    var week = Math.floor((day - 8) / 7) + 1, dayInWeek = (day - 8) % 7;           // week 1–6, day 0–6
    var base = week < 6 ? [week] : [6, 7], ids = [];
    base.forEach(function (b) { ids = ids.concat(plan[b - 1]); });
    var spread = nfDeptSplit(ids.map(function (id) { return [id]; }), 7, function (x) { return x[0]; });
    return { phase: 'impl', day: day, week: week, ids: spread[dayInWeek].map(function (x) { return x[0]; }), base: base };
  }
  if (day >= 57 && day <= 60) return { phase: 'ready', day: day, ids: [], base: [] };
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
  var pct = function (x) { return x.max ? Math.round(100 * x.got / x.max) : null; }, out = function (x) { return { pct: pct(x), n: x.n, of: x.of }; };
  var res = { overall: pct(all), n: all.n, of: all.of, byDept: {}, byAoc: {}, fails: [] };
  Object.keys(byDept).forEach(function (k) { var d = byDept[k]; res.byDept[k] = Object.assign(out(d), { byAoc: {} }); Object.keys(d.byAoc).forEach(function (a) { res.byDept[k].byAoc[a] = out(d.byAoc[a]); }); });
  Object.keys(byAoc).forEach(function (a) { res.byAoc[a] = out(byAoc[a]); });
  if (res.overall === null || res.overall < mark) res.fails.push('overall');
  Object.keys(res.byDept).forEach(function (k) { var p = res.byDept[k].pct; if (p === null || p < mark) res.fails.push('dept:' + k); });
  Object.keys(res.byAoc).forEach(function (a) { var p = res.byAoc[a].pct; if (p === null || p < mark) res.fails.push('aoc:' + a); });
  res.meets = !res.fails.length && all.n === all.of;
  return res;
}
