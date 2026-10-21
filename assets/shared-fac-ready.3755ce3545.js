// ══════════════════════════════════════════════════════════════
// FACILITY PAGE — READINESS TAB, one design for SC · UPHC · PHC · CHC (HealSol 21 Oct 2026)
//   phase strip · key numbers · NQAS criteria line · readiness over time (one line + "checked" columns, phases as bands,
//   Structure / Process / Outcome on a switch) · Structure / Process / Outcome baseline → now ·
//   tabs: Standards heat-map (Baseline / Now) · Areas of Concern · Service packages (SC) or Departments (tap → its 8 AoC bars)
// Readiness everywhere = points ÷ maximum for every checkpoint (not yet checked = 0); "checked" = how many have a score.
// Model M: {type, phases:[{k,a,b}], day, days, pct, base, comp, n, of, crit:{overall,aoc,std(fn)}, verdict:{meets,why},
//   aoc:{A:{now,base}}, cat:{Structure:{now,base}}, std:{A1:{now,base,min}}, groups:[{id,name,now,base,aoc?:{A:{now,base}},tag}],
//   groups2 (SC cross-cutting areas), trend:[{x (day),label,pct,cov,S,P,O}], tiles:[{l,v,s,c}], groupLabel}
// ══════════════════════════════════════════════════════════════
var FP_AOC = { A: 'Service Provision', B: 'Patient Rights', C: 'Inputs', D: 'Support Services', E: 'Clinical Services', F: 'Infection Control', G: 'Quality Management', H: 'Outcome' };
var _fpr = { tab: 'std', dept: null, spo: false, stdPh: 'now' };
function fprCls(v, min) { return v == null ? 'n' : v >= (min == null ? 70 : min) ? 'g' : v >= 50 ? 'a' : 'r'; }
function fprCat(a) { try { return scAocCat(a); } catch (e) { return ({ A: 'Outcome', B: 'Process', C: 'Structure', D: 'Process', E: 'Process', F: 'Process', G: 'Process', H: 'Outcome' })[a] || ''; } }

// ── Sub-Centre model ──
function fpScModel(code, src) {   // src (Facility dashboard): {fac, progress, acts}; otherwise the HealSol / Supervisor lists
  src = src || {};
  var f = src.fac || (scMasterFacilities || {})[code] || {}, pid = f.progId || 'nqas_12A', pr = src.progress || (scMasterProgress || {})[code] || {};
  var P = nfFacPhases({ progId: pid, progress: pr, staff: f.staff || {}, fac: f, agg: src.fac ? null : scFacAggFor(code) }), A = P.A, B = P.B || {}, has = !!(A.coverage && A.coverage.assessed), hasB = !!B.assessed;
  var v = function (b) { return b && b.assessed ? b.pct : null; }, pair = function (a, b) { return { now: v(a), base: hasB ? v(b) : null }; };
  var M = { type: 'sc', day: P.day, days: 60, pct: has ? A.pct : null, base: hasB ? B.pct : null, comp: has ? A.compliance : null, n: (A.coverage || {}).assessed || 0, of: (A.coverage || {}).total || 0, groupLabel: 'Service packages' };
  M.phases = [{ k: 'Baseline', a: 1, b: 7 }, { k: 'Implementation', a: 8, b: 49 }, { k: 'End-line', a: 50, b: 56 }, { k: 'Readiness week', a: 57, b: 60 }];
  M.crit = { overall: _scCrit.overall, aoc: _scCrit.aoc != null ? +_scCrit.aoc : 70, std: function (s) { return scNqasStdMin(s); } };
  var nq = A.nqas || {}; M.verdict = { has: !!nq.hasData, meets: !!nq.meets, overall: A.pct, aocFails: nq.aocFails || [], stdFails: nq.stdFails || [] };
  M.aoc = {}; Object.keys(FP_AOC).forEach(function (k) { if (A.byAoc[k] && A.byAoc[k].max) M.aoc[k] = pair(A.byAoc[k], (B.byAoc || {})[k]); });
  M.cat = {}; ['Structure', 'Process', 'Outcome'].forEach(function (k) { if (A.byCat[k]) M.cat[k] = pair(A.byCat[k], (B.byCat || {})[k]); });
  M.std = {}; Object.keys(A.byStd || {}).filter(function (s) { return /^[A-H]\d+$/.test(s); }).forEach(function (s) { M.std[s] = Object.assign(pair(A.byStd[s], (B.byStd || {})[s]), { min: scNqasStdMin(s) }); });
  var sv = Object.keys(A.byService || {}), order = SC_SVC_GROUPS.service.concat(SC_SVC_GROUPS.support);
  sv.sort(function (x, y) { return (order.indexOf(x) < 0 ? 99 : order.indexOf(x)) - (order.indexOf(y) < 0 ? 99 : order.indexOf(y)); });
  // each service package / cross-cutting area by Area of Concern (whole checklist; not yet checked = 0)
  var ga = {}; scPkgNqas(pid).forEach(function (cp) { var c = (A.cps || {})[cp.id] || {}, keys = [cp.svc || 'Other'].concat((Array.isArray(cp.cc) ? cp.cc : []).filter(function (x) { return x && x !== (cp.svc || 'Other'); }));
    keys.forEach(function (k) { var x = (ga[k] = ga[k] || {})[cp.aoc] = ga[k][cp.aoc] || { g: 0, gb: 0, n: 0, nb: 0, of: 0 }; x.of++; if (c.score != null) { x.g += c.score; x.n++; } if (c.base != null) { x.gb += c.base; x.nb++; } }); });
  var gAoc = function (k) { var o = {}; Object.keys(ga[k] || {}).forEach(function (a) { var x = ga[k][a]; o[a] = { now: x.n ? Math.round(100 * x.g / (2 * x.of)) : null, base: hasB && x.nb ? Math.round(100 * x.gb / (2 * x.of)) : null, n: x.n, of: x.of }; }); return o; };
  var grp = function (k) { var b = A.byService[k] || {}; return Object.assign({ id: k, name: k, n: b.assessed || 0, of: b.n || 0, aoc: gAoc(k) }, pair(b, (B.byService || {})[k])); };
  M.groups = sv.filter(function (k) { return scSvcGroup(k) === 'service'; }).map(grp);
  M.groups2 = sv.filter(function (k) { return scSvcGroup(k) === 'support'; }).map(grp);
  M.trend = (P.weeks || []).map(function (w) { return { x: Math.min(60, w.w * 7), label: 'W' + w.w, pct: w.pct, cov: w.cov, n: w.n, of: w.of, S: w.S, P: w.P, O: w.O }; });
  var gaps = Object.keys(A.cps || {}).filter(function (id) { var c = A.cps[id]; return c && c.score !== null && c.score < 2; }).length, today = scTodayStr(), od = scRvList(src.acts || (_scRvAll || {})[code] || (typeof _scRvActs !== 'undefined' && _scRvActs[code]) || {}).filter(function (x) { return x.status !== 'draft' && x.status !== 'closed' && x.dueDate && x.dueDate < today; }).length;
  M.tiles = fprTiles(M, [{ l: 'Open gaps', v: String(gaps), c: gaps ? 'a' : '' }, { l: 'Overdue actions', v: String(od), c: od ? 'r' : '' }, { l: 'Cards verified', v: A.daysVerified + ' / ' + A.daysDone, s: 'by the Supervisor or CHO' }]);
  M.blIncomplete = P.day && P.day > 7 && P.blDone != null && P.blDone < 7 ? P.blDone : null;
  return M;
}
// ── UPHC · PHC · CHC model (from fpDeptLoad's D, computed with _nd = D.ctx) ──
function fpDeptModel(D) {
  var keep = typeof _nd !== 'undefined' ? _nd : null, M;
  try { _nd = D.ctx;
    var S = D.S, rows = _nd.cl.items, deps = ndDeptDefs().map(function (d) { return d.id; }), crit = D.crit, L = ndLatest(), Lb = ndLatest(S.bN);
    var R = nfDeptReadiness(rows, L, { pass: crit.overall, depts: deps }), B = nfDeptReadiness(rows, Lb, { pass: crit.overall, depts: deps }), hasB = B.n > 0;
    var acc = {}, add = function (k, s) { var x = acc[k] = acc[k] || { g: 0, gb: 0, m: 0, n: 0, nb: 0 }; return x; };
    rows.forEach(function (r) { if (deps.indexOf(r[1]) < 0) return; var a = r[2], cat = fprCat(a), std = r[3], s = L[r[0]], sb = Lb[r[0]];
      [cat, 's:' + std].forEach(function (k) { var x = add(k); x.m += 2; if (s !== undefined && s !== null && s !== '') { x.g += +s; x.n++; } if (sb !== undefined && sb !== null && sb !== '') { x.gb += +sb; x.nb++; } }); });
    var pc = function (x, b) { return !x ? null : b ? (x.nb ? Math.round(100 * x.gb / x.m) : null) : (x.n ? Math.round(100 * x.g / x.m) : null); };
    M = { type: D.type, day: D.day, days: S.days, pct: R.overall, base: hasB ? B.overall : null, comp: R.comp, n: R.n, of: R.of, groupLabel: 'Departments' };
    M.phases = [{ k: 'Baseline', a: 1, b: S.bN }, { k: 'Implementation', a: S.bN + 1, b: S.iN }, { k: 'End-line', a: S.iN + 1, b: S.eN }, { k: 'Readiness week', a: S.eN + 1, b: S.days }];
    M.crit = { overall: crit.overall, aoc: crit.aoc, dept: crit.dept, std: function () { return crit.std; } };
    var rule = D.rule; M.verdict = { has: R.n > 0, meets: rule.result === 'ready', overall: R.overall, aocFails: rule.aocFails, stdFails: rule.stdFails, deptFails: rule.deptFails };
    M.aoc = {}; Object.keys(FP_AOC).forEach(function (k) { if (R.byAoc[k]) M.aoc[k] = { now: R.byAoc[k].pct, base: hasB && B.byAoc[k] ? B.byAoc[k].pct : null }; });
    M.cat = {}; ['Structure', 'Process', 'Outcome'].forEach(function (k) { if (acc[k]) M.cat[k] = { now: pc(acc[k]), base: hasB ? pc(acc[k], true) : null }; });
    M.std = {}; Object.keys(acc).filter(function (k) { return /^s:[A-H]\d+$/.test(k); }).forEach(function (k) { M.std[k.slice(2)] = { now: pc(acc[k]), base: hasB ? pc(acc[k], true) : null, min: crit.std }; });
    M.groups = ndDeptDefs().map(function (d) { var def = ndDeptDef(d.id), r = R.byDept[d.id] || {}, b = B.byDept[d.id] || {}, dd = (D.depts || []).find(function (x) { return x.id === d.id; }) || {}, aoc = {};
      Object.keys(FP_AOC).forEach(function (a) { var x = (r.byAoc || {})[a], y = (b.byAoc || {})[a]; if (x && x.of) aoc[a] = { now: x.pct, base: hasB && y ? y.pct : null, n: x.n, of: x.of }; });
      return { id: d.id, name: def.name, tag: def.prog || '', now: r.pct, base: hasB ? b.pct : null, n: r.n || 0, of: r.of || 0, aoc: aoc, lead: dd.lead || '', due: dd.due || 0 }; });
    M.groups2 = [];
    M.trend = (D.trend || []).map(function (p, i) { return { x: p.d, label: 'D' + p.d, pct: p.v, cov: p.cov, n: p.n, of: p.of, S: p.S, P: p.P, O: p.O }; });
    var od = D.acts.filter(function (a) { return a.st === 'od'; }).length;
    M.tiles = fprTiles(M, [{ l: 'Open gaps', v: String(D.noAct + D.acts.filter(function (a) { return a.st !== 'closed'; }).length), s: D.noAct ? D.noAct + ' without an action' : '', c: D.noAct ? 'a' : '' }, { l: 'Overdue actions', v: String(od), c: od ? 'r' : '' }, { l: 'Days to check', v: String(D.checksDue || 0), s: 'by department leads', c: D.checksDue ? 'a' : '' }]);
  } finally { _nd = keep; }
  return M;
}
function fprTiles(M, extra) {
  var g = M.pct != null && M.base != null ? M.pct - M.base : null, cov = M.of ? Math.round(100 * M.n / M.of) : 0;
  return [{ l: 'Readiness', v: M.pct == null ? '—' : M.pct + '%', s: 'whole checklist · not yet checked = 0', c: fprCls(M.pct, M.crit.overall) },
    { l: 'Growth since baseline', v: g == null ? '—' : (g >= 0 ? '+' : '') + g, s: M.base == null ? 'no baseline yet' : 'baseline ' + M.base + '%', c: g == null ? '' : g >= 0 ? 'g' : 'r' },
    { l: 'Checked', v: M.n + ' / ' + M.of, s: cov + '% of the checklist' + (M.comp != null ? ' · ' + M.comp + '% score of those' : ''), c: cov < 50 ? 'a' : '' }].concat(extra || []);
}
// ── pieces ──
function fprPhaseHTML(M) {
  var d = M.day || 0, idx = d < 1 ? -1 : M.phases.findIndex(function (p) { return d >= p.a && d <= p.b; }); if (d > M.days) idx = 99;
  return '<div class="fpr-ph">' + M.phases.map(function (p, i) { var c = i < idx ? 'done' : i === idx ? 'cur' : ''; return '<div class="' + c + '"><i>' + (i < idx ? '✓' : i + 1) + '</i><b>' + p.k + '</b><small>Days ' + p.a + '–' + p.b + '</small></div>'; }).join('') + '</div>'
    + (M.blIncomplete != null ? '<div class="fp-note a" style="margin-top:8px"><b>Baseline incomplete:</b> ' + M.blIncomplete + ' of 7 days done.</div>' : '');
}
function fprVerdictHTML(M) {
  var V = M.verdict; if (!V.has) return '<div class="fpr-verdict n">No scores yet — readiness appears once staff finish cards.</div>';
  var cov = M.of ? Math.round(100 * M.n / M.of) : 0;
  if (V.meets) return '<div class="fpr-verdict g"><b>✓ Meets the NQAS criteria today</b><span>Overall ' + V.overall + '% (needs ' + M.crit.overall + '%), every ' + (M.type === 'sc' ? '' : 'department, ') + 'Area of Concern and Standard at its minimum.</span></div>';
  var why = []; if (V.overall < M.crit.overall) why.push('Overall ' + V.overall + '% (needs ' + M.crit.overall + '%)');
  if (V.deptFails && V.deptFails.length) why.push(V.deptFails.length + ' department' + (V.deptFails.length === 1 ? '' : 's') + ' below ' + M.crit.dept + '%');
  if (V.aocFails.length) why.push('Area' + (V.aocFails.length === 1 ? '' : 's') + ' ' + V.aocFails.join(', ') + ' below ' + M.crit.aoc + '%');
  if (V.stdFails.length) why.push(V.stdFails.length + ' Standard' + (V.stdFails.length === 1 ? '' : 's') + ' below minimum');
  return '<div class="fpr-verdict ' + (cov < 50 ? 'n' : 'r') + '"><b>' + (cov < 50 ? 'Too early to judge — ' + cov + '% of the checklist checked' : '✗ Not yet at the NQAS criteria') + '</b><span>' + scEsc(why.join(' · ')) + '</span></div>';
}
function fprTrendSVG(M) {
  var T = M.trend.filter(function (p) { return p.pct != null || p.cov != null; }); if (!T.length) return '<p class="fp-dim">The chart starts once cards are in.</p>';
  var W = 760, H = 280, L = 34, R = 10, Tp = 22, Bt = 26, iw = W - L - R, ih = H - Tp - Bt, days = M.days;
  var x = function (d) { return L + iw * Math.max(0, Math.min(days, d)) / days; }, y = function (v) { return Tp + ih - ih * v / 100; };
  var bandCol = ['#EEF2F6', '#E9F3F0', '#ECEBF8', '#FBF1E4'], h = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="fpr-trend" role="img" aria-label="Readiness over time">';
  M.phases.forEach(function (p, i) { h += '<rect x="' + x(p.a - 1) + '" y="' + Tp + '" width="' + (x(p.b) - x(p.a - 1)) + '" height="' + ih + '" fill="' + bandCol[i] + '"></rect><text x="' + (x(p.a - 1) + 4) + '" y="' + (Tp - 6) + '" font-size="10.5" fill="#5C6B66">' + p.k + '</text>'; });
  [0, 25, 50, 75, 100].forEach(function (v) { h += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#DCE4E1" stroke-width="0.6"></line><text x="' + (L - 6) + '" y="' + (y(v) + 3) + '" font-size="10" text-anchor="end" fill="#5C6B66">' + v + '%</text>'; });
  var bw = Math.max(6, Math.min(26, iw / Math.max(T.length, 8) * 0.5));
  T.forEach(function (p) { if (p.cov == null) return; h += '<rect x="' + (x(p.x) - bw / 2) + '" y="' + y(p.cov) + '" width="' + bw + '" height="' + (y(0) - y(p.cov)) + '" fill="#CBD5E1" opacity=".7"><title>' + p.label + ': ' + p.cov + '% of the checklist checked</title></rect>'; });
  h += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(M.crit.overall) + '" y2="' + y(M.crit.overall) + '" stroke="#D4912A" stroke-dasharray="5 4" stroke-width="1.4"></line><text x="' + (W - R - 2) + '" y="' + (y(M.crit.overall) - 4) + '" font-size="10" text-anchor="end" fill="#9A5B12">NQAS ' + M.crit.overall + '%</text>';
  var line = function (k, col, w) { var P = T.filter(function (p) { return p[k] != null; }); if (!P.length) return ''; return '<polyline points="' + P.map(function (p) { return x(p.x) + ',' + y(p[k]); }).join(' ') + '" fill="none" stroke="' + col + '" stroke-width="' + w + '" stroke-linejoin="round"></polyline>'; };
  if (_fpr.spo) h += line('S', '#2E8B57', 2) + line('P', '#D4912A', 2) + line('O', '#3B6FD4', 2);
  h += line('pct', '#134A41', 3.2);
  T.forEach(function (p) { if (p.pct == null) return; h += '<circle cx="' + x(p.x) + '" cy="' + y(p.pct) + '" r="4.5" fill="#134A41"><title>' + p.label + ' · ' + p.pct + '% readiness · ' + (p.n != null ? p.n + ' of ' + p.of + ' checked' : p.cov + '% checked') + '</title></circle>'; });
  if (M.day && M.day >= 1 && M.day <= days) h += '<line x1="' + x(M.day) + '" x2="' + x(M.day) + '" y1="' + Tp + '" y2="' + (Tp + ih) + '" stroke="#134A41" stroke-dasharray="3 3"></line><text x="' + (x(M.day) + 3) + '" y="' + (Tp + ih - 4) + '" font-size="10" fill="#134A41">today</text>';
  return h + '</svg>';
}
function fprDumb(now, base, min, label, sub, extra, js) {
  var c = fprCls(now, min), w = function (v) { return Math.max(0, Math.min(100, v)); };
  var track = '<span class="fpr-tr"><span class="fpr-mk" style="left:' + w(min) + '%"></span>'
    + (base != null && now != null ? '<span class="fpr-ln ' + (now >= base ? 'up' : 'dn') + '" style="left:' + w(Math.min(base, now)) + '%;width:' + Math.abs(now - base) + '%"></span>' : '')
    + (base != null ? '<span class="fpr-dot b" style="left:' + w(base) + '%" title="Baseline ' + base + '%"></span>' : '') + (now != null ? '<span class="fpr-dot ' + c + '" style="left:' + w(now) + '%" title="Now ' + now + '%"></span>' : '') + '</span>';
  var tag = js ? 'button type="button" onclick="' + js + '"' : 'div';
  return '<' + tag + ' class="fpr-row' + (js ? ' click' : '') + '"><span class="fpr-l"><b>' + scEsc(label) + '</b>' + (sub ? '<small>' + scEsc(sub) + '</small>' : '') + '</span>' + track
    + '<span class="fpr-v"><b class="' + c + '">' + (now == null ? '—' : now + '%') + '</b><small>' + (base != null ? 'from ' + base + '%' : '') + '</small></span>' + (extra || '') + '</' + (js ? 'button' : 'div') + '>';
}
function fprSpoHTML(M) {
  return '<div class="fp-card"><div class="fp-ch"><b>Structure · Process · Outcome</b><small>baseline ● → now ●</small></div>' + ['Structure', 'Process', 'Outcome'].map(function (k) { var x = M.cat[k] || {};
    var aocs = Object.keys(FP_AOC).filter(function (a) { return fprCat(a) === k; }).join(', '); return fprDumb(x.now, x.base, M.crit.aoc, k, 'AoC ' + aocs); }).join('')
    + '<div class="fpr-legend"><span><i class="b"></i> baseline</span><span><i class="g"></i> now (green = at or above the mark)</span><span><i class="mk"></i> ' + M.crit.aoc + '% mark</span></div></div>';
}
function fprStdHTML(M) {
  var keys = Object.keys(M.std).sort(function (a, b) { return a[0] === b[0] ? (+a.slice(1)) - (+b.slice(1)) : a < b ? -1 : 1; }), ph = _fpr.stdPh;
  if (!keys.length) return '<p class="fp-dim">No Standards scored yet.</p>';
  var low = keys.filter(function (k) { return M.std[k].now != null; }).sort(function (a, b) { return M.std[a].now - M.std[b].now; }).slice(0, 5);
  var h = '<div class="fp-chiprow"><button type="button" class="fp-chip' + (ph === 'base' ? ' on' : '') + '" onclick="fprStdPh(\'base\')">Baseline</button><button type="button" class="fp-chip' + (ph === 'now' ? ' on' : '') + '" onclick="fprStdPh(\'now\')">Now</button><span class="fp-dim" style="margin:0">Outlined: the 5 lowest now · each Standard against its minimum</span></div><div class="fpr-heat">';
  Object.keys(FP_AOC).forEach(function (a) { var ks = keys.filter(function (k) { return k[0] === a; }); if (!ks.length) return;
    h += '<div class="fpr-hr"><span class="fpr-hl"><b>' + a + '</b> ' + FP_AOC[a] + '</span><span class="fpr-hc">' + ks.map(function (k) { var s = M.std[k], v = ph === 'base' ? s.base : s.now;
      return '<span class="fpr-cell ' + (v == null ? 'n' : v < s.min ? 'r' : v < 70 ? 'a' : 'g') + (low.indexOf(k) >= 0 && ph === 'now' ? ' low' : '') + '" title="' + k + (v == null ? ' — not checked' : ': ' + v + '% (minimum ' + s.min + '%)') + '"><b>' + k + '</b>' + (v == null ? '—' : v) + '</span>'; }).join('') + '</span></div>'; });
  return h + '</div><div class="fpr-legend"><span><i class="r"></i> below minimum</span><span><i class="a"></i> at minimum, under 70%</span><span><i class="hg"></i> 70% or more</span><span><i class="n"></i> not checked</span></div>';
}
function fprAocHTML(M) {
  return '<div class="fpr-rows">' + Object.keys(FP_AOC).filter(function (a) { return M.aoc[a]; }).map(function (a) { var x = M.aoc[a]; return fprDumb(x.now, x.base, M.crit.aoc, a + ' · ' + FP_AOC[a], fprCat(a)); }).join('') + '</div>'
    + '<div class="fpr-legend"><span><i class="b"></i> baseline</span><span><i class="g"></i> now</span><span><i class="mk"></i> ' + M.crit.aoc + '% mark</span></div>';
}
function fprDrillList(L, mark, aocMark, unit, subFn) {
  return '<div class="fpr-rows">' + L.map(function (g) { var open = _fpr.dept === g.id;
    var row = fprDumb(g.now, g.base, mark, g.name + (g.tag ? ' · ' + g.tag : ''), subFn(g), '<i class="ti ti-chevron-down fpr-chev' + (open ? ' up' : '') + '"></i>', "fprDept('" + scJs(g.id) + "')");
    if (!open) return row;
    return row + '<div class="fpr-drill"><div class="fp-ch"><b>' + scEsc(g.name) + ' — Areas of Concern</b><small>bar = now · faint bar = baseline · line = ' + aocMark + '%</small></div>' + fprBarsHTML(g.aoc || {}, aocMark) + '</div>'; }).join('') + '</div>'
    + '<p class="fp-dim">Tap ' + unit + ' to see its Areas of Concern.</p>';
}
function fprGroupsHTML(M, cc) {
  var chk = function (g) { return g.of ? g.n + ' of ' + g.of + ' checked' : ''; };
  if (M.type === 'sc') return fprDrillList(cc ? M.groups2 : M.groups, 70, M.crit.aoc, cc ? 'an area' : 'a service package', chk);
  return fprDrillList(M.groups, M.crit.dept, M.crit.aoc, 'a department', function (g) { return chk(g) + (g.lead ? ' · lead ' + g.lead : '') + (g.due ? ' · ' + g.due + ' day' + (g.due === 1 ? '' : 's') + ' to check' : ''); });
}
function fprBarsHTML(aoc, mark) {
  var ks = Object.keys(FP_AOC).filter(function (a) { return aoc[a]; }); if (!ks.length) return '<p class="fp-dim">No checkpoints in this department yet.</p>';
  return '<div class="fpr-bars">' + ks.map(function (a) { var x = aoc[a], v = x.now == null ? 0 : x.now, b = x.base == null ? 0 : x.base;
    return '<div class="fpr-bar" title="' + a + ' · ' + FP_AOC[a] + ': ' + (x.now == null ? 'not checked' : x.now + '%') + (x.base != null ? ' (baseline ' + x.base + '%)' : '') + ' · ' + x.n + ' of ' + x.of + ' checked">'
      + '<span class="fpr-bv ' + fprCls(x.now, mark) + '">' + (x.now == null ? '—' : x.now) + '</span><span class="fpr-col"><span class="fpr-mark" style="bottom:' + mark + '%"></span><span class="fpr-ghost" style="height:' + b + '%"></span><span class="fpr-fill ' + fprCls(x.now, mark) + '" style="height:' + v + '%"></span></span><b>' + a + '</b><small>' + scEsc(FP_AOC[a]) + '</small></div>'; }).join('') + '</div>';
}
function fprStdPh(p) { _fpr.stdPh = p; fprRerender(); }
function fprTab(t) { _fpr.tab = t; _fpr.dept = null; fprRerender(); }
function fprDept(id) { _fpr.dept = _fpr.dept === id ? null : id; fprRerender(); }
function fprSpo() { _fpr.spo = !_fpr.spo; fprRerender(); }
function fprRerender() { if (_fp.M) { var el = document.getElementById(_fpr.host || 'fp-ready'); if (el) el.innerHTML = fpReadyHTML(_fp.M); } }
function fpReadyHTML(M) {
  var tab = function (k, l) { return '<button type="button" role="tab" aria-selected="' + (_fpr.tab === k) + '" class="' + (_fpr.tab === k ? 'on' : '') + '" onclick="fprTab(\'' + k + '\')">' + l + '</button>'; };
  return '<div class="fp-card">' + fprPhaseHTML(M) + '</div>'
    + '<div class="fpr-kpis">' + M.tiles.map(function (k) { return '<div><b class="' + (k.c || '') + '">' + k.v + '</b><small>' + k.l + '</small>' + (k.s ? '<em>' + k.s + '</em>' : '') + '</div>'; }).join('') + '</div>'
    + fprVerdictHTML(M)
    + '<div class="fp-grid"><div class="fp-col"><div class="fp-card"><div class="fp-ch"><b>Readiness over time</b><label class="fpr-sw"><input type="checkbox"' + (_fpr.spo ? ' checked' : '') + ' onchange="fprSpo()"> Structure · Process · Outcome</label></div>'
    + fprTrendSVG(M) + '<div class="fpr-legend"><span><i class="ln"></i> readiness (whole checklist)</span><span><i class="col"></i> % of the checklist checked</span>' + (_fpr.spo ? '<span><i style="background:#2E8B57"></i> Structure</span><span><i style="background:#D4912A"></i> Process</span><span><i style="background:#3B6FD4"></i> Outcome</span>' : '') + '<span><i class="mk"></i> NQAS ' + M.crit.overall + '%</span></div></div></div>'
    + '<div class="fp-col">' + fprSpoHTML(M) + '</div></div>'
    + fprAttnHTML(M)
    + '<div class="fp-card"><div class="fp-tabs" role="tablist" aria-label="Readiness detail">' + tab('std', 'Standards heat-map') + tab('aoc', 'Areas of Concern') + tab('grp', M.groupLabel) + (M.groups2 && M.groups2.length ? tab('cc', 'Cross-cutting areas') : '') + '</div>'
    + (_fpr.tab === 'aoc' ? fprAocHTML(M) : _fpr.tab === 'grp' ? fprGroupsHTML(M) : _fpr.tab === 'cc' ? fprGroupsHTML(M, true) : fprStdHTML(M)) + '</div>';
}
// Structure / Process / Outcome readiness on one set of scores (department types; whole checklist, not yet checked = 0)
function fprSpoAt(rows, L, deps) {
  var a = { Structure: [0, 0, 0], Process: [0, 0, 0], Outcome: [0, 0, 0] };
  rows.forEach(function (r) { if (deps.indexOf(r[1]) < 0) return; var x = a[fprCat(r[2])]; if (!x) return; x[1] += 2; var s = L[r[0]]; if (s !== undefined && s !== null && s !== '') { x[0] += +s; x[2]++; } });
  var p = function (x) { return x[2] ? Math.round(100 * x[0] / x[1]) : null; };
  return { S: p(a.Structure), P: p(a.Process), O: p(a.Outcome) };
}
function fprAttnHTML(M) { return M.attn && M.attn.length ? '<div class="fp-card"><b>Needs attention here</b><ul class="fp-ul">' + M.attn.slice(0, 6).map(function (x) { return '<li>' + scEsc(x) + '</li>'; }).join('') + '</ul></div>' : ''; }
function fpDeptReadyWrap(D, host) {
  var M = fpDeptModel(D), att = [];
  D.depts.forEach(function (d) { if (d.due) att.push(d.name + ': ' + d.due + ' day' + (d.due === 1 ? '' : 's') + ' to check' + (d.lead ? ' (' + d.lead + ', lead)' : '')); });
  var od = D.acts.filter(function (a) { return a.st === 'od'; }); if (od.length) att.push(od.length + ' action' + (od.length === 1 ? '' : 's') + ' overdue — ' + od.slice(0, 2).map(function (a) { return a.cp; }).join('; '));
  if (D.noAct) att.push(D.noAct + ' gap' + (D.noAct === 1 ? '' : 's') + ' checked as unmet with no action yet');
  M.attn = att; _fp.M = M; _fpr.host = host || 'fp-ready';
  return '<div id="' + _fpr.host + '"' + (host ? ' class="fpr-phone"' : '') + '>' + fpReadyHTML(M) + '</div>';
}

// ── the same Readiness design in the Facility dashboard (Sub-Centre CHO · UPHC / PHC / CHC in-charge) — HealSol 21 Oct ──
(function () {
  if (typeof scInsRender === 'function') {
    var oR = scInsRender;
    scInsRender = function (hostId) { var r = oR.apply(this, arguments);
      try { var st = _scIns[hostId]; if (hostId === 'sc-cho-progress' && st && st.tab === 'readiness' && typeof faOn === 'function' && faOn()) {
        var host = document.getElementById(hostId), tabs = host && host.querySelector('.scx-tabs');
        if (host) { if (tabs) { while (tabs.nextSibling) host.removeChild(tabs.nextSibling); } else host.innerHTML = '';
          _fp.M = fpScModel(st.code, { fac: Object.assign({}, st.fac || {}, { staff: st.staff || (st.fac || {}).staff || {} }), progress: st.progress || {}, acts: (typeof _scRvActs !== 'undefined' && _scRvActs[st.code]) || null });
          _fpr.host = 'fa-fpr'; var d = document.createElement('div'); d.id = 'fa-fpr'; d.className = 'fpr-phone'; d.innerHTML = fpReadyHTML(_fp.M); host.appendChild(d); } } } catch (e) { console.warn('[FPR] dashboard', e); }
      return r; };
  }
  if (typeof nxFaReadyHTML === 'function') {
    var oD = nxFaReadyHTML;
    nxFaReadyHTML = function () {
      try { var D = { code: _nd.code, fac: _nd.fac, cfg: _nd.cfg, type: nfTypeOf(_nd.fac), certs: {}, ctx: _nd }; fpDeptCompute(D);
        return fpDeptReadyWrap(D, 'fa-fpr'); }
      catch (e) { console.warn('[FPR] dept dashboard', e); return oD.apply(this, arguments); } };
  }
})();
