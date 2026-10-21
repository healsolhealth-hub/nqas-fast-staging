// ══════════════════════════════════════════════════════════════
// STEP 4 — ONE FACILITY PAGE for SC · UPHC · PHC · CHC (HealSol, Supervisor, District Admin; canvas
// "Step 4 — One Facility Page & Shared Checkpoints", approved 21 Oct 2026)
//   Header (name, type, ID, place, package, access, start, in-charge) · six tiles · tabs
//   Readiness · Actions · Staff & cards · Programme. Every role keeps its usual view-only limits.
//   Sub-Centre: the existing drill-in pieces are shown under the tabs (Readiness / Review & Action Plan / By staff
//   insights, the staff list, the Programme block) — nothing about them changes.
//   UPHC · PHC · CHC: worked out here from the facility's cards with the department-core functions (_nd swapped
//   while computing, as dept/summary.js does); "Open the facility app" opens the phone view (ndOpenView).
// ══════════════════════════════════════════════════════════════
var _fp = { code: null, tab: 'ready', type: 'sc', D: null, act: 'open' };
function fpE(s) { return scEsc(s == null ? '' : s); }
function fpJ(s) { return scJs(s == null ? '' : String(s)); }
function fpRole() { try { return nfAdminRole(); } catch (e) { return ''; } }
function fpShortDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] : ''; }
function fpPctCls(v) { return v == null ? '' : v >= 70 ? 'g' : v >= 50 ? 'a' : 'r'; }
function fpTypeChip(f) { var t = nfTypeOf(f), L = NF_LEVELS[t] || NF_LEVELS.sc, k = t === 'chc' && typeof nfChcKindLabel === 'function' ? nfChcKindLabel(f) : '';
  return '<span class="fp-type ' + t + '">' + fpE(k || L.name) + '</span>'; }
function fpAccess(f) { var s = f.subscriptionStatus; return s === 'paid' ? 'Paid' : s === 'trial' ? 'Trial' : s === 'contract' ? 'Contract' : ''; }
function fpPkg(f) { var t = nfTypeOf(f); if (t === 'sc') return scPkgLabel(f.progId || 'nqas_12A');
  var p = ((NF_LEVELS[t] || {}).programmes || []).find(function (x) { return x.id === f.progId; }); return p ? String(p.label).replace(/^[^—]*—\s*/, '') : (f.progId || ''); }
function fpInCharge(f) { var t = nfTypeOf(f), L = NF_LEVELS[t] || NF_LEVELS.sc, st = f.staff || {}, ic = L.inCharge || 'CHO';
  var m = Object.keys(st).find(function (k) { return st[k] && !st[k].disabled && (st[k].role || ic) === ic; }); return { label: L.inChargeLabel || ic, name: m ? (st[m].name || m) : (f.choName || '') }; }

// ── the page frame ──
function fpPanel() { return document.getElementById('sc-drill-panel'); }
function fpEnsure() {
  var p = fpPanel(); if (!p) return null;
  if (!document.getElementById('fp-top')) { var t = document.createElement('div'); t.id = 'fp-top'; p.insertBefore(t, p.firstChild); }
  ['fp-prog', 'fp-dept'].forEach(function (id) { if (!document.getElementById(id)) { var d = document.createElement('div'); d.id = id; p.appendChild(d); } });
  p.classList.add('fp');
  return p;
}
function fpTopHTML(code, f, tiles, extra) {
  var role = fpRole(), ic = fpInCharge(f), dept = nfTypeOf(f) !== 'sc', nAct = _fp.nAct;
  var line = [code, [f.district, f.state].filter(Boolean).join(', '), fpPkg(f), fpAccess(f), f.startDate ? 'started ' + fpShortDate(f.startDate) : 'start date not set', ic.name ? ic.label + ' ' + ic.name : 'no ' + ic.label].filter(Boolean).join(' · ');
  var btns = (dept ? '<button type="button" class="fp-btn" onclick="fpOpenApp(\'' + fpJ(code) + '\')"><i class="ti ti-device-mobile"></i> ' + (role === 'supervisor' ? 'Open the facility app' : 'See it as the ' + fpE(ic.label) + ' sees it') + '</button>' : '')
    + (!dept ? '<button type="button" class="fp-btn" onclick="fpScViewAs(\'' + fpJ(code) + '\')"><i class="ti ti-eye"></i> See it as the ' + fpE(ic.label) + ' sees it</button>' : '')
    + (!dept ? '<button type="button" class="fp-btn" onclick="scGenerateReport(\'facility\',\'' + fpJ(code) + '\')"><i class="ti ti-file-text"></i> PDF report</button>' : '')
    + (role === 'admin' && typeof nfFacMenu === 'function' ? '<button type="button" class="fp-btn" aria-label="Manage facility" onclick="nfFacMenu(this,\'' + fpJ(code) + '\')">Manage ⋯</button>' : '');
  var tab = function (k, l) { return '<button type="button" role="tab" aria-selected="' + (_fp.tab === k) + '" class="' + (_fp.tab === k ? 'on' : '') + '" onclick="fpTab(\'' + k + '\')">' + l + '</button>'; };
  return '<div class="fp-head"><div><h1>' + fpE(f.name || code) + ' ' + fpTypeChip(f) + '</h1><div class="fp-line">' + fpE(line) + '</div>' + (extra || '') + '</div><div class="fp-btns">' + btns + '</div></div>'
    + '<div class="fp-tiles">' + tiles.map(function (k) { return '<div class="fp-tile"><small>' + k.l + '</small><b class="' + (k.c || '') + '">' + k.v + '</b><small>' + (k.s || '') + '</small></div>'; }).join('') + '</div>'
    + '<div class="fp-tabs" role="tablist" aria-label="Facility">' + tab('ready', 'Readiness') + tab('act', 'Actions' + (nAct != null ? ' · ' + nAct : '')) + tab('staff', 'Staff &amp; cards') + tab('prog', 'Programme') + '</div>';
}
function fpApplyTab() {
  var p = fpPanel(); if (!p) return; p.setAttribute('data-fptab', _fp.tab); p.classList.toggle('fp-sc', _fp.type === 'sc'); p.classList.toggle('fp-dp', _fp.type !== 'sc'); p.classList.toggle('fp-work', !!_fp.work && _fp.type === 'sc' && _fp.tab === 'act');
  document.querySelectorAll('#fp-top .fp-tabs button').forEach(function (b) { var on = (b.getAttribute('onclick') || '').indexOf("'" + _fp.tab + "'") > 0; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
}
function fpTab(t) {
  _fp.tab = t; fpApplyTab();
  if (t !== 'act' && _fp.work) { _fp.work = false; fpApplyTab(); }
  if (_fp.type === 'sc') { if (t === 'prog') fpScProg(); else fpScRender(); }
  else fpDeptRender();
  try { window.scrollTo(0, 0); } catch (e) {}
}
async function fpOpenApp(code) { if (typeof ndOpenView === 'function') await ndOpenView(code); }

// ── Sub-Centre ──
function fpScTiles(code) {
  var o = null; try { o = hsInfo(code); } catch (e) {}
  if (!o) return [];
  var ch = o.pct != null && o.base != null ? o.pct - o.base : null, res, rs = '';
  var RR = nfResult(nfResultSc(o.agg, o.grad)); res = RR.word; rs = o.grad ? 'graduated ' + nfDateTxt(String(o.grad.at || '').slice(0, 10), true) : RR.cls === 'green' ? 'meets NQAS today' : RR.txt;
  if (!o.assessed && !o.grad) rs = 'no cards yet';
  var ov = o.overdue || 0, open = 0; try { open = scRvList((_scRvAll || {})[code] || {}).filter(function (x) { return x.status !== 'draft' && x.status !== 'closed'; }).length; } catch (e) {}
  _fp.nAct = open;
  return [{ l: 'Day', v: o.phase === 'notstarted' ? '—' : (o.phase === 'catchup' ? o.days : o.day) + ' / ' + o.days, s: HS_PHASE[o.phase] || '' },
    { l: 'Readiness', v: o.pct == null ? '—' : o.pct + '%', s: (o.base != null ? 'baseline ' + o.base + '%' + (ch != null ? ' · ' + (ch >= 0 ? '+' : '') + ch : '') + ' · ' : '') + (o.cov != null ? o.cov + '% checked' : ''), c: fpPctCls(o.pct) },
    { l: o.grad ? 'Graduation result' : 'If graduated today', v: res, s: rs, c: o.grad ? (o.grad.result === 'ready' ? 'g' : 'a') : res === NF_RES_WORD.ready ? 'g' : res === NF_RES_WORD.almost || res === NF_RES_WORD.notyet ? 'a' : '' },
    { l: 'On time', v: o.onTime == null ? '—' : o.onTime + '%', s: o.behind ? 'behind schedule' : o.comp && o.inProg ? 'on track' : '', c: o.behind ? 'r' : '' },
    { l: 'Open actions', v: String(open), s: ov ? ov + ' overdue' : 'none overdue', c: ov ? 'r' : '' },
    { l: 'Staff', v: String(o.staffN), s: o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : 'no ' + o.inChargeLabel }];
}
function fpScMount(code) {
  var p = fpEnsure(), f = (scMasterFacilities || {})[code]; if (!p || !f) return;
  if (_fp.code !== code) { _fp.scAct = 'open'; _fp.work = false; }
  _fp.code = code; _fp.type = 'sc'; _fp.D = null; _fp.M = null;
  var links = document.querySelector('#sc-drill-info .nfl-drill'), extra = links ? '<div class="fp-line">' + links.innerHTML + '</div>' : '';
  document.getElementById('fp-top').innerHTML = fpTopHTML(code, f, fpScTiles(code), extra);
  document.getElementById('fp-dept').innerHTML = '';
  if (_fp.tab === 'prog') fpScProg(); else fpScRender();
  fpApplyTab(); fpScLoadExtras(code);
}
function fpPeopleHTML(code) {
  var out = [];
  try { var S = _scSupervisors || {}; Object.keys(S).forEach(function (k) { var s = S[k]; if (s && !s.disabled && s.facilities && s.facilities[code]) out.push('Supervisor: ' + (s.name || k)); }); } catch (e) {}
  try { if (fpRole() === 'supervisor' && typeof _scSup !== 'undefined' && _scSup && !_scSup.district) out.push('Supervisor: ' + (_scSup.name || _scSup.id) + ' — you'); } catch (e) {}
  try { var C = (_scq && _scq.champions) || {}; Object.keys(C).forEach(function (k) { var c = C[k]; if (c && !c.disabled && c.facilities && c.facilities[code]) out.push('Quality Champion: ' + (c.name || k)); }); } catch (e) {}
  try { var Dd = _scDistricts || {}; Object.keys(Dd).forEach(function (k) { var d = Dd[k]; if (d && !d.disabled && d.facilities && d.facilities[code]) out.push((d.scope === 'block' ? 'Block MOIC view: ' : 'District Admin: ') + (d.name || k) + (d.auto ? ' · all of ' + (d.district || 'the district') : '')); }); } catch (e) {}
  var f = (scMasterFacilities || {})[code] || {}; if (f.nin) out.push('Govt. facility ID (NIN / HFR): ' + f.nin);
  return '<div class="fp-card"><b>People around this facility</b>' + (out.length ? '<ul class="fp-ul">' + out.map(function (x) { return '<li>' + fpE(x) + '</li>'; }).join('') + '</ul>' : '<p class="fp-dim">No Supervisor, Champion or District Admin linked yet.</p>') + '</div>';
}
async function fpCertsHTML(code) {
  var C = {}; try { C = (await fbGet('sc_certs/' + code)) || {}; } catch (e) {}
  var L = Object.keys(C).map(function (m) { return C[m]; }).filter(Boolean);
  return '<div class="fp-card"><b>Certificates issued · ' + L.length + '</b>' + (L.length ? '<p>' + L.slice(0, 8).map(function (c) { return fpE((c.name || '') + (c.grade ? ' (' + c.grade + ')' : '')); }).join(' · ') + (L.length > 8 ? ' · ' + (L.length - 8) + ' more' : '') + '</p>' : '<p class="fp-dim">None yet — staff claim theirs from the last programme day.</p>') + '</div>';
}
async function fpScProg() {
  var host = document.getElementById('fp-prog'), st = _scIns['sc-drill-insights'], code = _fp.code; if (!host || !code) return;
  var h = '<div class="fp-grid"><div class="fp-col">' + (st ? nfgProgHTML(st) + nfgCompHTML(st) : '') + '</div><div class="fp-col">' + fpPeopleHTML(code) + '<div id="fp-certs"></div></div></div>';
  host.innerHTML = h;
  var c = await fpCertsHTML(code), el = document.getElementById('fp-certs'); if (el && _fp.code === code) el.innerHTML = c;
}

// ── UPHC · PHC · CHC: data ──
async function fpDeptLoad(code) {
  var fac = await fbGet(scFacilityPath(code)); if (!fac) return null;
  var t = nfTypeOf(fac), cfg = NF_LEVELS[t]; if (!cfg || cfg.core !== 'dept') return null;
  var cl = await nfLoadData(cfg.checklist);
  var r = await Promise.all([fbGet('sc_dcards/' + code), fbGet('sc_pcards/' + code), fbGet('sc_dactions/' + code), fbGet('sc_certs/' + code).catch(function () { return null; })]);
  var keep = typeof _nd !== 'undefined' ? _nd : null, D = { code: code, fac: fac, cfg: cfg, type: t, certs: r[3] || {} };
  try {
    _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: r[0] || {}, pcards: r[1] || {}, actions: r[2] || {}, sel: {}, view: 'fp' };
    await ndMasterSetup(cfg, cl);
    try { await ndGradLoad(); } catch (e) {}
    D.ctx = _nd; fpDeptCompute(D);
  } finally { _nd = keep; }
  return D;
}
function fpDeptCompute(D) {
  var S = nfDeptShape(D.cfg), today = ndToday(), day = D.fac.startDate ? nfDeptDayNo(D.fac.startDate, today) : null, cur = day ? Math.min(day, S.days) : 0;
  D.S = S; D.day = day; D.cur = cur;
  var sc = ndGradScores(), crit = ndCrit(); D.sc = sc; D.crit = crit; D.rule = ndGradRule(sc, true);
  D.depts = ndDeptDefs().map(function (d) {
    var due = 0; for (var n = 1; n <= cur; n++) { if (ndRes(d.id, n).chk) continue; var c = ndPc(d.id, n); if (Object.keys(c).some(function (m) { return c[m] && c[m].done; }) && !ndSoloDone(d.id, n)) due++; }
    var def = ndDeptDef(d.id); return { id: d.id, name: def.name, prog: def.prog || '', now: sc.byDept[d.id], base: sc.baseDept[d.id], lead: ndLead(d.id) ? ndName(ndLead(d.id)) : '', due: due };
  });
  // weekly readiness
  var rows = _nd.cl.items, deps = ndDeptDefs().map(function (d) { return d.id; }), pts = [];
  if (cur >= 1) { var marks = [Math.min(S.bN, cur)]; for (var w = S.bN + 7; w < cur; w += 7) marks.push(w); if (marks[marks.length - 1] !== cur) marks.push(cur);
    marks.forEach(function (m) { var Lm = ndLatest(m), R = nfDeptReadiness(rows, Lm, { pass: crit.overall, depts: deps }); if (R.overall != null) pts.push(Object.assign({ d: m, v: R.overall, n: R.n, of: R.of, cov: R.of ? Math.round(100 * R.n / R.of) : 0 }, fprSpoAt(rows, Lm, deps))); }); }
  D.trend = pts;
  var Rn = nfDeptReadiness(rows, ndLatest(), { pass: crit.overall, depts: deps }); D.n = Rn.n; D.of = Rn.of; D.cov = Rn.of ? Math.round(100 * Rn.n / Rn.of) : 0;
  // actions
  var A = _nd.actions || {}, staff = ndStaff();
  D.acts = Object.keys(A).map(function (id) { var a = A[id] || {}, od = a.status === 'open' && a.due && a.due < today;
    var owners = a.owners ? Object.keys(a.owners).map(ndName).join(', ') : (a.owner ? ndName(a.owner) : '');
    return { id: id, dept: a.dept || '', deptName: ndDeptDef(a.dept).name, cp: ndCpText(id), how: a.how || '', owner: owners, due: a.due || '', st: od ? 'od' : a.status || 'open', level: a.level || '' }; });
  var F = ndLatestFinal(); D.noAct = Object.keys(F).filter(function (id) { var a = A[id]; return F[id].s < 2 && (!a || a.status === 'closed'); }).length;
  // staff
  var lo = Math.max(1, cur - 29), hi = cur - 1;
  D.staff = Object.keys(staff).map(function (m) {
    var mine = ndDeptDefs().filter(function (d) { return ndFills(d.id, m); }), leads = ndDeptDefs().filter(function (d) { return ndLead(d.id) === m; });
    var exp = 0, done = 0, chk = 0, strip = [];
    for (var n = 1; n <= hi; n++) { var e = false, dn = false, late = false, c1 = false;
      mine.forEach(function (d) { if (!ndMyIds(d.id, n, m).length) return; e = true; var c = ndPc(d.id, n)[m] || {}; if (c.done) { dn = true; var at = String((c.done || {}).at || '').slice(0, 10); if (at && at > ndAddDays(D.fac.startDate, n - 1)) late = true; if (ndRes(d.id, n).chk || ndSolo(d.id)) c1 = true; } });
      if (e) { exp++; if (dn) { done++; if (c1) chk++; } }
      if (n >= lo) strip.push(!e ? 'n' : dn ? (late ? 'l' : 'd') : 'm'); }
    var lchk = null; if (leads.length) { var all = 0, ok = 0; leads.forEach(function (d) { for (var n2 = 1; n2 <= hi; n2++) { var c = ndPc(d.id, n2); if (!Object.keys(c).some(function (k) { return c[k] && c[k].done; })) continue; all++; if (ndRes(d.id, n2).chk || ndSoloDone(d.id, n2)) ok++; } }); lchk = all ? Math.round(100 * ok / all) : null; }
    var st = staff[m] || {};
    return { mob: m, name: st.name || m, role: ndRoleLabel(st.role || D.cfg.inCharge), depts: mine.map(function (d) { return d.name; }).concat(leads.filter(function (d) { return mine.indexOf(d) < 0; }).map(function (d) { return d.name + ' (lead)'; })),
      lead: leads.length > 0, exp: exp, done: done, pct: exp ? Math.round(100 * done / exp) : null, chk: done ? Math.round(100 * chk / done) : null, lchk: lchk, strip: strip, cert: !!(D.certs || {})[m] };
  }).sort(function (a, b) { return (b.lead - a.lead) || String(a.name).localeCompare(String(b.name)); });
  D.checksDue = D.depts.reduce(function (s, d) { return s + d.due; }, 0);
  // on time (Timeline settings of this type)
  var G = typeof nfgCfgFor === 'function' ? nfgCfgFor(D.type) : { green: 80, amber: 60 }, ex = 0, dn2 = 0;
  D.staff.forEach(function (s) { ex += s.exp; dn2 += s.done; }); D.onTime = ex ? Math.round(100 * dn2 / ex) : null;
  D.onState = D.onTime == null ? '' : D.onTime < G.amber ? 'r' : D.onTime < G.green ? 'a' : 'g';
}
function fpDeptTiles(D) {
  var S = D.S, f = D.fac, g = f.graduation, d = D.day, phase = !f.startDate || !d || d < 1 ? 'Not started' : g ? 'Graduated' : d <= S.bN ? 'Baseline' : d <= S.iN ? 'Implementation' : d <= S.eN ? 'End-line' : d <= S.days ? 'Readiness week' : 'Waiting for graduation';
  var sc = D.sc, ch = sc.overall != null && sc.base != null ? sc.overall - sc.base : null, R = D.rule, res, rs;
  var RR = nfResult(g ? { grad: g } : { assessed: D.n, cov: D.cov, meets: R.result === 'ready', pct: sc.overall, mark: D.crit.overall, deptFails: R.deptFails.map(function (x) { return ndDeptDefName(D, x); }), aocFails: R.aocFails, stdFails: R.stdFails });
  res = RR.word; rs = g ? 'graduated ' + nfDateTxt(String(g.at || '').slice(0, 10), true) : sc.overall == null ? 'no cards yet' : RR.cls === 'green' ? 'meets NQAS today' : R.deptFails.length === 1 && sc.overall >= D.crit.overall ? ndDeptDefName(D, R.deptFails[0]) + ' ' + sc.byDept[R.deptFails[0]] + '%' : RR.txt;
  var open = D.acts.filter(function (a) { return a.st !== 'closed'; }).length, od = D.acts.filter(function (a) { return a.st === 'od'; }).length; _fp.nAct = open;
  var on = D.depts.length;
  return [{ l: 'Day', v: !d || d < 1 ? '—' : Math.min(d, S.days) + ' / ' + S.days, s: phase },
    { l: 'Readiness', v: sc.overall == null ? '—' : sc.overall + '%', s: (sc.base != null ? 'baseline ' + sc.base + '%' + (ch != null ? ' · ' + (ch >= 0 ? '+' : '') + ch : '') + ' · ' : '') + D.cov + '% checked', c: fpPctCls(sc.overall) },
    { l: g ? 'Graduation result' : 'If graduated today', v: res, s: rs, c: g ? (g.result === 'ready' ? 'g' : 'a') : res === NF_RES_WORD.ready ? 'g' : res === '—' || res === NF_RES_WORD.early ? '' : 'a' },
    { l: 'On time', v: D.onTime == null ? '—' : D.onTime + '%', s: D.onState === 'r' ? 'behind schedule' : D.onState === 'a' ? 'slipping' : D.onState ? 'on track' : '', c: D.onState === 'r' ? 'r' : '' },
    { l: 'Open actions', v: String(open), s: od ? od + ' overdue' : 'none overdue', c: od ? 'r' : '' },
    { l: 'Staff', v: String(D.staff.length), s: on + ' department' + (on === 1 ? '' : 's') + ' on' }];
}
function ndDeptDefName(D, id) { var d = (D.cfg.departments || []).find(function (x) { return x.id === id; }); return d ? d.name : id; }

// ── UPHC · PHC · CHC: tabs ──
function fpBar(v) { return '<span class="fp-bar"><span class="' + fpPctCls(v) + '" style="width:' + (v == null ? 0 : Math.max(2, v)) + '%"></span></span>'; }
function fpTrendSvg(pts, mark) {
  if (!pts.length) return '<p class="fp-dim">Shows once cards are in.</p>';
  var W = 320, H = 120, x = function (i) { return pts.length === 1 ? W / 2 : 10 + i * (W - 20) / (pts.length - 1); }, y = function (v) { return H - 10 - (v / 100) * (H - 20); };
  return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="fp-trend" role="img" aria-label="Readiness ' + pts[0].v + '% to ' + pts[pts.length - 1].v + '%"><line x1="0" y1="' + y(mark) + '" x2="' + W + '" y2="' + y(mark) + '" stroke="#9FB7B0" stroke-dasharray="4 4"></line><text x="2" y="' + (y(mark) - 4) + '" font-size="10" fill="#4A5A55">' + mark + '%</text>'
    + '<polyline points="' + pts.map(function (p, i) { return x(i) + ',' + y(p.v); }).join(' ') + '" fill="none" stroke="#1E6B5E" stroke-width="3"></polyline>'
    + pts.map(function (p, i) { return '<circle cx="' + x(i) + '" cy="' + y(p.v) + '" r="3.5" fill="#1E6B5E"><title>Day ' + p.d + ': ' + p.v + '%</title></circle>'; }).join('') + '</svg>';
}
function fpDeptReadyHTML(D) {
  var sc = D.sc, std = Object.keys(sc.byStd || {}).map(function (k) { return [k, sc.byStd[k]]; }).sort(function (a, b) { return a[1] - b[1]; }).slice(0, 4);
  var att = [];
  D.depts.forEach(function (d) { if (d.due) att.push(d.name + ': ' + d.due + ' day' + (d.due === 1 ? '' : 's') + ' to check' + (d.lead ? ' (' + d.lead + ', lead)' : '')); });
  var od = D.acts.filter(function (a) { return a.st === 'od'; }); if (od.length) att.push(od.length + ' action' + (od.length === 1 ? '' : 's') + ' overdue — ' + od.slice(0, 2).map(function (a) { return a.cp; }).join('; '));
  if (D.noAct) att.push(D.noAct + ' gap' + (D.noAct === 1 ? '' : 's') + ' checked as unmet with no action yet');
  std.filter(function (s) { return s[1] < 50; }).forEach(function (s) { att.push('Standard ' + s[0] + ' at ' + s[1] + '%'); });
  var aoc = 'ABCDEFGH'.split('').filter(function (a) { return sc.byAoc[a] != null; });
  return '<div class="fp-grid"><div class="fp-col">'
    + '<div class="fp-card"><div class="fp-ch"><b>Departments</b><small>baseline → now · pass ' + D.crit.dept + '% · lead · days to check</small></div>'
    + (D.depts.length ? '<div class="fp-rows">' + D.depts.map(function (d) { return '<div class="fp-row"><span>' + fpE(d.name) + (d.prog ? ' <em>' + fpE(d.prog) + '</em>' : '') + '</span>' + fpBar(d.now) + '<b class="' + fpPctCls(d.now) + '">' + (d.base != null ? d.base + ' → ' : '') + (d.now == null ? '—' : d.now + '%') + '</b><small>' + fpE(d.lead || 'no lead') + ' · ' + d.due + '</small></div>'; }).join('') + '</div>' : '<p class="fp-dim">No departments switched on.</p>')
    + '<p class="fp-dim">Departments switched off at this facility are not listed.' + (D.type === 'chc' ? ' LaQshya (Labour Room, Maternity OT) and MusQan (Paediatric OPD, NBSU) are marked beside NQAS.' : '') + '</p></div>'
    + '<div class="fp-card"><b>Areas of Concern</b><div class="fp-aoc">' + (aoc.length ? aoc.map(function (a) { var v = sc.byAoc[a]; return '<div class="' + (v >= D.crit.aoc ? 'g' : 'a') + '"><b>' + a + '</b><span>' + v + '</span></div>'; }).join('') : '<p class="fp-dim">No scores yet.</p>') + '</div>'
    + (std.length ? '<div class="fp-chips"><b>Weakest Standards</b>' + std.map(function (s) { return '<span class="' + (s[1] < 50 ? 'r' : s[1] < 70 ? 'a' : 'g') + '">' + s[0] + ' · ' + s[1] + '%</span>'; }).join('') + '</div>' : '') + '</div>'
    + '</div><div class="fp-col">'
    + '<div class="fp-card"><b>Readiness over time</b>' + fpTrendSvg(D.trend, D.crit.overall) + (D.trend.length ? '<small class="fp-dim">' + (D.sc.base != null ? D.sc.base + '% baseline → ' : '') + (D.sc.overall == null ? '—' : D.sc.overall + '% now') + ' · weekly</small>' : '') + '</div>'
    + '<div class="fp-card"><b>Needs attention here</b>' + (att.length ? '<ul class="fp-ul">' + att.slice(0, 6).map(function (x) { return '<li>' + fpE(x) + '</li>'; }).join('') + '</ul>' : '<p class="fp-dim">✓ Nothing pending.</p>') + '</div>'
    + '</div></div>';
}
var FP_ST = { od: ['Overdue', 'r'], open: ['Open', 'b'], fixed: ['Fixed · re-check', 'g'], sup: ['With Supervisor', 'a'], closed: ['Closed', 'n'] };
function fpAct(k) { _fp.act = k; fpDeptRender(); }
function fpDeptActHTML(D) {
  var cnt = function (k) { return D.acts.filter(function (a) { return k === 'open' ? a.st !== 'closed' : a.st === k; }).length; };
  var chip = function (k, l) { return '<button type="button" class="fp-chip' + (_fp.act === k ? ' on' : '') + '" onclick="fpAct(\'' + k + '\')">' + l + ' · ' + cnt(k) + '</button>'; };
  var L = D.acts.filter(function (a) { return _fp.act === 'open' ? a.st !== 'closed' : a.st === _fp.act; });
  var by = {}; L.forEach(function (a) { (by[a.deptName] = by[a.deptName] || []).push(a); });
  var role = fpRole();
  var h = '<div class="fp-chiprow">' + chip('open', 'All open') + chip('od', 'Overdue') + chip('sup', 'With Supervisor') + chip('fixed', 'Fixed, waiting re-check') + chip('closed', 'Closed') + '</div>';
  if (D.noAct) h += '<div class="fp-note a"><b>' + D.noAct + ' gap' + (D.noAct === 1 ? '' : 's') + ' have no action yet</b> — checked as unmet and nobody owns them. The department lead assigns them in the facility app.</div>';
  if (!L.length) return h + '<div class="fp-card"><p class="fp-dim">No actions here.</p></div>';
  h += '<div class="fp-card p0 fp-tw"><table class="fp-t"><thead><tr><th>Checkpoint</th><th>What to fix</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody>';
  Object.keys(by).sort().forEach(function (dn) { h += '<tr class="grp"><td colspan="5">' + fpE(dn) + ' · ' + by[dn].length + '</td></tr>';
    by[dn].sort(function (a, b) { return String(a.due).localeCompare(String(b.due)); }).forEach(function (a) { var s = FP_ST[a.st] || FP_ST.open;
      h += '<tr><td><b>' + fpE(a.id) + '</b><small>' + fpE(a.cp) + '</small></td><td>' + fpE(a.how || '—') + '</td><td>' + fpE(a.owner || '—') + '</td><td class="' + (a.st === 'od' ? 'r' : '') + '">' + fpE(a.due ? fpShortDate(a.due) : '—') + '</td><td><span class="fp-st ' + s[1] + '">' + s[0] + '</span></td></tr>'; }); });
  h += '</tbody></table></div><p class="fp-dim">' + (role === 'supervisor' ? 'To write How to fix for actions sent to you, open the facility app.' : 'View only — department leads assign actions in the facility app; the Supervisor answers the ones sent up.') + '</p>';
  return h;
}
function fpDeptStaffHTML(D) {
  var C = { d: '#2E8B57', l: '#8BC4A0', m: '#C8553D', n: '#E2E8E6' };
  var h = '<div class="fp-chiprow"><span class="fp-legend"><i style="background:#2E8B57"></i> done <i style="background:#8BC4A0"></i> done late <i style="background:#C8553D"></i> missed <i style="background:#E2E8E6"></i> no card</span></div>';
  if (!D.staff.length) return h + '<div class="fp-card"><p class="fp-dim">No staff yet — the ' + fpE(D.cfg.inChargeLabel) + ' adds them in the app.</p></div>';
  h += '<div class="fp-card p0 fp-tw"><table class="fp-t"><thead><tr><th>Name</th><th>Departments</th><th>Card days (last 30)</th><th>Done</th><th>Checked</th><th>Certificate</th></tr></thead><tbody>';
  D.staff.forEach(function (s) {
    h += '<tr><td><b>' + fpE(s.name) + '</b><small>' + fpE(s.role) + '</small></td><td>' + fpE(s.depts.join(', ') || '—') + '</td>'
      + '<td><span class="fp-strip">' + s.strip.map(function (x) { return '<i style="background:' + C[x] + '"></i>'; }).join('') + '</span></td>'
      + (s.exp ? '<td class="' + (s.pct < 80 ? 'r' : 'g') + '"><b>' + s.pct + '%</b><small>' + s.done + ' of ' + s.exp + ' card days</small></td>' : '<td><small>' + (s.lead ? 'checks, does not fill' : 'no card days yet') + '</small></td>')
      + '<td>' + (s.lead ? 'leads ' + (s.lchk == null ? '—' : s.lchk + '%') : s.chk == null ? '—' : s.chk + '% of her / his cards') + '</td>'
      + '<td>' + (s.cert ? '🎓 issued' : D.day && D.day >= D.S.days ? (s.pct != null && s.pct >= 80 ? 'can claim' : 'needs 80% done') : 'Day ' + D.S.days) + '</td></tr>';
  });
  return h + '</tbody></table></div><p class="fp-dim">Reset password and staff changes stay with the ' + fpE(D.cfg.inChargeLabel) + ' (facility app) and HealSol.</p>';
}
function fpDeptProgHTML(D) {
  var S = D.S, f = D.fac, g = f.graduation, cu = f.catchup && f.catchup.on ? f.catchup : null, role = fpRole(), C = fpJ(D.code);
  var seg = function (n, l, cls) { return '<div class="' + cls + '" style="flex:' + n + '">' + l + '</div>'; };
  var d = D.day || 0, st = function (a, b) { return d > b ? 'done' : d >= a ? 'now' : ''; };
  var grace = (typeof nfgCfgFor === 'function' ? nfgCfgFor(D.type) : { grace: 7 }).grace;
  var h = '<div class="fp-card"><b>Timeline</b><div class="fp-tl">' + seg(S.bN, 'Baseline 1–' + S.bN, st(1, S.bN)) + seg(S.iN - S.bN, 'Implementation ' + (S.bN + 1) + '–' + S.iN, st(S.bN + 1, S.iN)) + seg(S.eN - S.iN, 'End-line ' + (S.iN + 1) + '–' + S.eN, st(S.iN + 1, S.eN)) + seg(S.days - S.eN, 'Readiness week', st(S.eN + 1, S.days)) + seg(Math.max(2, grace), 'Grace ' + grace, d > S.days ? 'now' : 'g') + '</div>'
    + '<small class="fp-dim">' + (f.startDate ? 'Started ' + fpShortDate(f.startDate) + ' · graduation ' + fpShortDate(ndAddDays(f.startDate, S.days - 1)) + ' · close date ' + fpShortDate(ndAddDays(f.startDate, S.days - 1 + grace)) : 'Start date not set — the ' + fpE(D.cfg.inChargeLabel) + ' sets it') + ' · Timeline settings for ' + fpE(D.cfg.plural) + ' apply.</small></div>';
  h += '<div class="fp-grid"><div class="fp-col"><div class="fp-card"><div class="fp-ch"><b>Graduation result</b>' + (role === 'admin' || role === 'district' ? '<button type="button" class="fp-btn sm" onclick="fpOpenProg(\'' + C + '\')">' + (role === 'admin' ? 'Run again · change · catch-up…' : 'Certification records…') + '</button>' : '') + '</div>';
  if (g) { var R = ND_GRAD_RES[g.result] || ND_GRAD_RES.incomplete, cr = g.criteria || {};
    h += '<div class="fp-res ' + R.c + '"><b>' + fpE(R.t) + '</b><span>Overall ' + g.overall + '%' + (g.base != null ? ' (baseline ' + g.base + '%)' : '') + (g.deptFails && g.deptFails.length ? ' · below: ' + g.deptFails.map(function (x) { return ndDeptDefName(D, x) + ' ' + ((g.byDept || {})[x] != null ? g.byDept[x] + '%' : ''); }).join(', ') : '') + ' · ' + fpE(fpShortDate(String(g.at || '').slice(0, 10))) + (g.round ? ' · after catch-up' : '') + '</span>' + (nfOldRule(g, D.type) ? nfOldRuleNote() : '') + '</div>'
      + '<table class="fp-t sm"><thead><tr><th>Rule</th><th>Needed</th><th>Here</th></tr></thead><tbody>'
      + '<tr><td>Overall</td><td>' + (cr.overall || 70) + '%</td><td class="' + (g.overall >= (cr.overall || 70) ? 'g' : 'r') + '">' + g.overall + '%</td></tr>'
      + '<tr><td>Every department</td><td>' + (cr.dept || 70) + '%</td><td class="' + ((g.deptFails || []).length ? 'r' : 'g') + '">' + ((g.deptFails || []).length ? g.deptFails.length + ' below' : '✓') + '</td></tr>'
      + '<tr><td>Every Area of Concern</td><td>' + (cr.aoc || 70) + '%</td><td class="' + ((g.aocFails || []).length ? 'r' : 'g') + '">' + ((g.aocFails || []).length ? g.aocFails.join(', ') : '✓') + '</td></tr>'
      + '<tr><td>Every Standard</td><td>' + (cr.stdDefault || 50) + '%</td><td class="' + ((g.stdFails || []).length ? 'r' : 'g') + '">' + ((g.stdFails || []).length ? g.stdFails.length + ' below' : '✓') + '</td></tr></tbody></table>'; }
  else h += '<p class="fp-dim">Runs by itself on Day ' + S.days + (f.startDate ? ' (' + fpShortDate(ndAddDays(f.startDate, S.days - 1)) + ')' : '') + ' when every end-line day is checked, or on the close date with what is done.</p>'
    + (D.sc.overall != null ? '<p>On today\'s scores: <b>' + fpE(D.rule.result === 'ready' ? 'NQAS Ready' : D.rule.result === 'almost' ? 'Almost ready' : 'Not yet ready') + '</b> · ' + D.sc.overall + '%</p>' : '');
  h += '<div class="fp-ch" style="margin-top:10px"><b>Catch-up</b><small>' + (cu ? fpE(fpShortDate(cu.start) + ' – ' + fpShortDate(cu.end) + ' · ' + (cu.free ? 'free' : cu.paid ? 'paid' : 'fee not marked') + (cu.done ? ' · done' : '')) : g && g.result !== 'ready' ? '28 days on the weakest departments, then their end-line again' : '—') + '</small></div></div></div>';
  var rec = function (k, l) { var x = f[k]; return '<li><span>' + l + '</span><span class="fp-st ' + (x && x.status === 'certified' ? 'g' : x ? 'b' : 'n') + '">' + fpE(x ? (x.status || 'recorded') + (x.certifiedOn ? ' ' + fpShortDate(x.certifiedOn) : x.appliedOn ? ' ' + fpShortDate(x.appliedOn) : '') : 'Not yet') + '</span></li>'; };
  var certs = Object.keys(D.certs || {}).map(function (m) { return D.certs[m]; }).filter(Boolean);
  h += '<div class="fp-col"><div class="fp-card"><b>Certification records</b><ul class="fp-recs">' + rec('nhsrc', 'NHSRC (NQAS)') + (D.type === 'chc' ? rec('laqshya', 'LaQshya') + rec('musqan', 'MusQan') : '') + '</ul></div>'
    + '<div class="fp-card"><b>Certificates issued · ' + certs.length + '</b>' + (certs.length ? '<p>' + certs.slice(0, 8).map(function (c) { return fpE((c.name || '') + (c.grade ? ' (' + c.grade + ')' : '')); }).join(' · ') + '</p>' : '<p class="fp-dim">None yet — staff claim theirs from Day ' + S.days + '.</p>') + '</div>'
    + fpPeopleHTML(D.code) + '</div></div>';
  return h;
}
async function fpOpenProg(code) { if (typeof ndOpenView !== 'function') return; await ndOpenView(code); try { if (typeof ndGradOpen === 'function') ndGradOpen('admin'); } catch (e) {} }
function fpDeptRender() {
  var host = document.getElementById('fp-dept'), D = _fp.D; if (!host) return;
  if (!D) { host.innerHTML = '<div class="fp-card"><p class="fp-dim">Loading…</p></div>'; return; }
  var keep = typeof _nd !== 'undefined' ? _nd : null;
  try { _nd = D.ctx;
    host.innerHTML = _fp.tab === 'act' ? fpDeptActHTML(D) : _fp.tab === 'staff' ? fpDeptStaffHTML(D) : _fp.tab === 'prog' ? fpDeptProgHTML(D) : fpDeptReadyWrap(D);
  } catch (e) { console.warn('[FP] render', e); host.innerHTML = '<div class="fp-card"><p class="fp-dim">Could not show this tab.</p></div>'; }
  finally { _nd = keep; }
}
async function fpDeptOpen(code) {
  var role = fpRole();
  if (appMode === 'sc-supervisor' && !scSupAllowed(code)) { showToast('This facility is not assigned to you.', 'err'); return; }
  var f = (scMasterFacilities || {})[code]; if (!f) { showToast('Facility not found.', 'err'); return; }
  if (role && _nfOv.view !== 'drill') _nfOv.prev = _nfOv.view;
  var p = fpEnsure(); if (!p) return;
  _fp.code = code; _fp.type = nfTypeOf(f); _fp.D = null; _fp.nAct = null; if (_fp.lastCode !== code) { _fp.tab = 'ready'; _fp.act = 'open'; } _fp.lastCode = code;
  var stub = { day: null }, tiles = [{ l: 'Day', v: '…' }, { l: 'Readiness', v: '…' }, { l: 'If graduated today', v: '…' }, { l: 'On time', v: '…' }, { l: 'Open actions', v: '…' }, { l: 'Staff', v: String(Object.keys(f.staff || {}).filter(function (m) { return f.staff[m] && !f.staff[m].disabled; }).length) }];
  document.getElementById('fp-top').innerHTML = fpTopHTML(code, f, tiles); document.getElementById('fp-prog').innerHTML = '';
  document.getElementById('sc-drill-code').textContent = code;
  p.style.display = ''; var g = document.getElementById('sc-master-grid'); if (g) g.style.display = 'none'; var b = document.getElementById('sc-master-back'); if (b) b.style.display = '';
  fpApplyTab(); fpDeptRender();
  if (role) { _nfOv.view = 'drill'; try { nfAdminApply(); } catch (e) {} } try { window.scrollTo(0, 0); } catch (e) {}
  var D = null; try { D = await fpDeptLoad(code); } catch (e) { console.warn('[FP] load', e); }
  if (_fp.code !== code) return;
  if (!D) { document.getElementById('fp-dept').innerHTML = '<div class="fp-card"><p class="fp-dim">Could not load this facility — check the internet and try again.</p></div>'; return; }
  _fp.D = D;
  var keep = typeof _nd !== 'undefined' ? _nd : null; try { _nd = D.ctx; document.getElementById('fp-top').innerHTML = fpTopHTML(code, D.fac, fpDeptTiles(D)); } finally { _nd = keep; }
  fpApplyTab(); fpDeptRender();
}

// ── wiring: every facility opens here (HealSol, Supervisor, District Admin) ──
(function () {
  if (typeof scDrillIn !== 'function') return;
  var oIn = scDrillIn;
  scDrillIn = async function (code) {
    var f = (scMasterFacilities || {})[code];
    if (f && nfTypeOf(f) !== 'sc' && NF_LEVELS[nfTypeOf(f)] && NF_LEVELS[nfTypeOf(f)].core === 'dept') return fpDeptOpen(code);
    if (_fp.lastCode !== code) { _fp.tab = 'ready'; } _fp.lastCode = code;
    _fp.type = 'sc'; _fp.code = code; try { fpEnsure(); fpApplyTab(); } catch (e) {}
    var r = await oIn.apply(this, arguments);
    try { var p = fpPanel(); if (p && p.style.display !== 'none') fpScMount(code); } catch (e) { console.warn('[FP] mount', e); }
    return r;
  };
  // the Sub-Centre insights keep their own tab strip and Programme block for other screens; on the facility page the
  // Programme block lives in the Programme tab
  var oR = scInsRender;
  scInsRender = function (hostId) { var r = oR.apply(this, arguments);
    try { if (hostId === 'sc-drill-insights' && _fp.type === 'sc' && fpPanel() && fpPanel().classList.contains('fp')) { var h = document.getElementById(hostId); if (h) h.querySelectorAll('.nfg-prog,.nfg-comp').forEach(function (x) { x.remove(); }); } } catch (e) {}
    return r; };
})();
