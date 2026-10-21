// ══════════════════════════════════════════════════════════════
// ONE WORDING FOR EVERY SCREEN (consistency review, agreed 21 Oct 2026)
//   Result: NQAS Ready · Almost ready · Not yet ready · Too early — and one result label for lists, chips and reports.
//   Dates: "19 Sep 2026" ("19 Sep" when short and this year). End-line · Supervisor · Facility dashboard · no "Std" / "Impl.".
// ══════════════════════════════════════════════════════════════
var NF_RES_WORD = { ready: 'NQAS Ready', almost: 'Almost ready', notyet: 'Not yet ready', incomplete: 'Incomplete', early: 'Too early' };
// o: {grad?, assessed, cov (% checked), meets, pct, mark?, deptFails[], aocFails[], stdFails[]} → {cls, txt, word}
function nfResult(o) {
  o = o || {}; var mark = o.mark || 70, A = o.aocFails || [], S = o.stdFails || [], D = o.deptFails || [];
  if (o.grad) { var g = o.grad.result; return { cls: g === 'ready' ? 'green' : g === 'almost' ? 'amber' : 'red', txt: NF_RES_WORD[g] || g, word: NF_RES_WORD[g] || g }; }
  if (!o.assessed) return { cls: 'grey', txt: 'Not assessed yet', word: '—' };
  if (o.cov != null && o.cov < 50) return { cls: 'grey', txt: 'Too early · ' + o.cov + '% checked', word: 'Too early' };
  if (o.meets) return { cls: 'green', txt: '✓ Meets NQAS', word: NF_RES_WORD.ready };
  var word = o.pct != null && o.pct >= mark ? NF_RES_WORD.almost : NF_RES_WORD.notyet, txt;
  if (o.pct != null && o.pct < mark) txt = 'Overall below ' + mark + '%';
  else if (D.length) txt = D.length + ' department' + (D.length === 1 ? '' : 's') + ' below ' + mark + '%';
  else if (A.length) txt = 'Area' + (A.length === 1 ? ' ' : 's ') + A.slice(0, 3).join(', ') + (A.length > 3 ? ' …' : '') + ' below ' + mark + '%';
  else if (S.length) txt = S.length + ' Standard' + (S.length === 1 ? '' : 's') + ' below minimum';
  else txt = 'Not all checked yet';
  return { cls: 'amber', txt: txt, word: word };
}
function nfResultChip(o) { var r = nfResult(o); return '<span class="nfo-chip ' + r.cls + '">' + scEsc(r.txt) + '</span>'; }
// Sub-Centre facility readiness (scFacilityReadiness result) → nfResult input
function nfResultSc(a, grad) { var n = (a && a.nqas) || (a ? scNqasCheckV2(a) : {}), cov = a && a.coverage ? a.coverage : {};
  return { grad: grad, assessed: cov.assessed || 0, cov: cov.assessed ? cov.pct : null, meets: !!n.meets, pct: a ? a.pct : null, mark: n.overallMin || 70, aocFails: n.aocFails || [], stdFails: n.stdFails || [] }; }
// department summary record (dept/summary.js) → nfResult input
function nfResultDept(s, grad) { s = s || {}; var low = function (o) { return Object.keys(o || {}).filter(function (k) { return o[k] != null && o[k] < 70; }).sort(); };
  return { grad: grad, assessed: s.assessed || 0, cov: s.total ? Math.round(100 * (s.assessed || 0) / s.total) : null, meets: !!s.meets, pct: s.pct, deptFails: low(s.byDept), aocFails: low(s.byAoc), stdFails: Object.keys(s.byStd || {}).filter(function (k) { return s.byStd[k] < 50; }) }; }
// dates
var NF_MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function nfDateTxt(iso, short) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || '')); if (!m) return String(iso || '');
  var y = +m[1], s = (+m[3]) + ' ' + NF_MON[+m[2] - 1]; return short && y === new Date().getFullYear() ? s : s + ' ' + y; }
// UPHC · PHC · CHC results saved before the whole-checklist readiness rule (21 Oct 2026) keep their numbers (the official record)
var NF_RULE_DATE = '2026-10-21';
function nfOldRule(g, type) { return !!(g && type && type !== 'sc' && String(g.at || '').slice(0, 10) < NF_RULE_DATE); }
function nfOldRuleNote() { return '<small class="nf-oldrule" title="Saved before 21 Oct 2026, when UPHC / PHC / CHC readiness started counting the whole checklist. Kept as the official record.">scored before 21 Oct</small>'; }
