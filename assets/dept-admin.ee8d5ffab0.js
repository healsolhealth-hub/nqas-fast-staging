// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE IN THE ADMIN APP (Step 2e, 19 Oct 2026): UPHC / PHC / CHC facilities in HealSol's (and Supervisors')
// Overview, Facilities and Reports, with the same columns as Sub-Centres.
//   • Each department-core facility gets a summary (dept/summary.js): live from its cards when there are up to
//     NF_DSUM_LIVE of them, else the nightly one (sc_summary/fac/{code}); a row opens the facility (ndOpenView).
//   • Overview: a facility-type filter (All · SC · UPHC · PHC · CHC) when more than one type is enrolled.
//   • Reports: "UPHC · PHC · CHC report" — Excel with one row per facility and a by-department sheet.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
var NF_DSUM_LIVE = 60;
var _nfDs = { map: {}, loading: null, live: {}, at: 0 };
function nfIsDeptFac(f) { return !!f && (NF_LEVELS[nfTypeOf(f)] || {}).core === 'dept'; }
function nfDeptCodes() { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}; return scVisibleFacilityCodes().filter(function (c) { return nfIsDeptFac(F[c]) && !F[c].migratedTo; }); }
async function nfDeptLive(T) {   // the published checkpoint master of a type (null when nothing is published)
  if (T in _nfDs.live) return _nfDs.live[T];
  var L = null; try { L = await fbGet('shared/dept_master/' + T + '/live'); } catch (e) {}
  return (_nfDs.live[T] = L);
}
async function nfDeptSumLive(code) {
  var f = scMasterFacilities[code], T = nfTypeOf(f), cfg = NF_LEVELS[T];
  var r = await Promise.all([nfLoadData(cfg.checklist), nfDeptLive(T), fbGet('sc_pcards/' + code), fbGet('sc_dcards/' + code), fbGet('sc_dactions/' + code)]);
  return nfDeptSumFacility({ code: code, fac: f, cl: r[0], live: r[1], pcards: r[2] || {}, dcards: r[3] || {}, actions: r[4] || {}, today: ndToday() });
}
// load the summaries of the department-core facilities, then re-draw the Overview
function nfDeptSumLoad(force) {
  if (_nfDs.loading && !force) return _nfDs.loading;
  var codes = nfDeptCodes(); if (!codes.length) { _nfDs.map = {}; return Promise.resolve(); }
  if (force) _nfDs.live = {};
  _nfDs.loading = (async function () {
    var map = {};
    if (codes.length <= NF_DSUM_LIVE) {
      for (var i = 0; i < codes.length; i++) { try { map[codes[i]] = await nfDeptSumLive(codes[i]); } catch (e) { console.warn('[dept] summary', codes[i], e); } }
    } else {
      var all = null; try { all = await fbGet('sc_summary/fac'); } catch (e) {}
      codes.forEach(function (c) { if (all && all[c] && all[c].type) map[c] = all[c]; });
    }
    _nfDs.map = map; _nfDs.at = Date.now(); _nfDs.loading = null;
    try { if (typeof nfRenderOverview === 'function' && nfAdminRole()) nfRenderOverview(); } catch (e) {}
  })();
  return _nfDs.loading.then(function () { _nfDs.loading = null; }, function () { _nfDs.loading = null; });
}
// a summary in the shape the Overview reads (like nfSumAgg)
function nfDeptAgg(s) {
  var bA = {}, bS = {};
  Object.keys(s.byAoc || {}).forEach(function (a) { bA[a] = { pct: s.byAoc[a], xp: s.byAoc[a], max: 100, n: 1, assessed: 1 }; });
  Object.keys(s.byStd || {}).forEach(function (k) { bS[k] = { pct: s.byStd[k], xp: s.byStd[k], max: 100, n: 1, assessed: 1 }; });
  var has = (s.assessed || 0) > 0, mark = 70, aocFails = Object.keys(s.byAoc || {}).filter(function (a) { return s.byAoc[a] < mark; });
  return { dept: true, type: s.type, pct: s.pct || 0, total: s.total || 0, assessed: s.assessed || 0, coverage: { assessed: s.assessed || 0, total: s.total || 0, pct: s.total ? Math.round((s.assessed || 0) / s.total * 100) : 0 },
    baseline: { assessed: s.base != null ? 1 : 0, pct: s.base || 0 }, byAoc: bA, byStd: bS, byService: {}, cps: {}, staff: [], gaps: [],
    nqas: { hasData: has, overallOk: (s.pct || 0) >= mark, stdFails: [], aocFails: aocFails, aocMin: mark, meets: !!s.meets, overallMin: mark } };
}
function nfDeptEmptyAgg(f) { return nfDeptAgg({ type: nfTypeOf(f), assessed: 0, total: 0, pct: 0, base: null, byAoc: {}, byStd: {} }); }
function nfOvTypes() { var F = scMasterFacilities || {}, t = {}; scVisibleFacilityCodes().forEach(function (c) { if (F[c] && !F[c].migratedTo) t[nfTypeOf(F[c])] = 1; }); return Object.keys(t); }
function nfOvType(t) { _nfOv.type = t; nfRenderOverview(); }
(function () {
  if (typeof nfAdminRows !== 'function') return;
  var oRows = nfAdminRows;
  nfAdminRows = function () {
    var F = scMasterFacilities || {}, dc = {}, sav = scVisibleFacilityCodes;
    nfDeptCodes().forEach(function (c) { dc[c] = 1; });
    var rows;
    try { scVisibleFacilityCodes = function () { return sav.apply(this, arguments).filter(function (c) { return !dc[c]; }); }; rows = oRows.apply(this, arguments); }
    finally { scVisibleFacilityCodes = sav; }
    rows.forEach(function (r) { r.type = nfTypeOf(F[r.code]); });
    Object.keys(dc).forEach(function (code) {
      var f = F[code] || {}, s = _nfDs.map[code];
      rows.push({ code: code, name: f.name || code, district: f.district || '', type: nfTypeOf(f), dept: true, day: s ? s.day : (f.startDate ? nfDeptDayNo(f.startDate, ndToday()) : null),
        agg: s ? nfDeptAgg(s) : nfDeptEmptyAgg(f), overdue: s ? s.acts.od : 0, confirm: s ? s.acts.fixed : 0, doubts: 0, noAct: s ? s.noAct : 0, toVerify: s ? s.checksDue : 0, planMissing: false, trial: f.subscriptionStatus === 'trial', loading: !s });
    });
    var t = _nfOv.type; return t ? rows.filter(function (r) { return r.type === t; }) : rows;
  };
  var oOv = nfOverviewHTML;
  nfOverviewHTML = function (rows, opts) {
    var h = oOv.apply(this, arguments), types = nfOvTypes(); if (types.length < 2 && !_nfOv.type) return h;
    var order = ['sc', 'uphc', 'phc', 'chc'], chips = '<div class="nfo-types" role="tablist" aria-label="Facility type">' + [''].concat(order.filter(function (t) { return types.indexOf(t) >= 0; })).map(function (t) {
      return '<button type="button" role="tab" aria-selected="' + ((_nfOv.type || '') === t) + '" class="' + ((_nfOv.type || '') === t ? 'on' : '') + '" onclick="nfOvType(\'' + t + '\')">' + (t ? scEsc((NF_LEVELS[t] || {}).short || t.toUpperCase()) : 'All facilities') + '</button>'; }).join('')
      + (_nfDs.loading ? '<span class="nfo-ld">Loading UPHC · PHC · CHC cards…</span>' : '') + '</div>';
    var i = h.indexOf('<div class="nfo-kpis">'); return i >= 0 ? h.slice(0, i) + chips + h.slice(i) : chips + h;
  };
  // a department-core row opens the facility (the department app in view mode)
  var oIn = scDrillIn;
  scDrillIn = async function (code) { var f = (scMasterFacilities || {})[code]; if (nfIsDeptFac(f) && typeof ndOpenView === 'function') return ndOpenView(code); return oIn.apply(this, arguments); };
  // load the summaries whenever the facilities are (re)loaded
  var oLoad = scLoadMasterData;
  scLoadMasterData = async function () { var r = await oLoad.apply(this, arguments); try { if (nfAdminRole()) nfDeptSumLoad(true); } catch (e) {} return r; };
  // Needs attention: the SC checks skip department-core facilities; theirs come from the summaries
  if (typeof scRvAttention === 'function') {
    var oAtt = scRvAttention;
    scRvAttention = function () {
      var F = scMasterFacilities || {}, sav = scVisibleFacilityCodes, out;
      try { scVisibleFacilityCodes = function () { return sav.apply(this, arguments).filter(function (c) { return !nfIsDeptFac(F[c]); }); }; out = oAtt.apply(this, arguments); }
      finally { scVisibleFacilityCodes = sav; }
      out = out.filter(function (x) { return !nfIsDeptFac(F[x.code]); });   // e.g. "No CHO login yet" is about Sub-Centres
      Object.keys(_nfDs.map).forEach(function (code) { var s = _nfDs.map[code]; if (!s || s.suspended) return;
        if (s.acts.od) out.push({ code: code, lvl: 'red', txt: s.acts.od + ' overdue action' + (s.acts.od === 1 ? '' : 's') });
        if (s.checksDue) out.push({ code: code, lvl: 'amber', txt: s.checksDue + ' department-day' + (s.checksDue === 1 ? '' : 's') + ' waiting for the check' });
        if (s.noAct) out.push({ code: code, lvl: 'amber', txt: s.noAct + ' gap' + (s.noAct === 1 ? '' : 's') + ' without an action' });
        if (s.acts.sup) out.push({ code: code, lvl: 'amber', txt: s.acts.sup + ' with the Facility Supervisor for a how-to-fix' });
        if (!s.staff || s.staff < 2) out.push({ code: code, lvl: 'amber', txt: 'Only the in-charge is on the staff list — add the team in Set-up' });
      });
      return out;
    };
  }
  // Programme & timeline card: the Sub-Centre 60-day timeline (UPHC / PHC / CHC graduation comes in Step 3)
  if (typeof nfgOvCardHTML === 'function') { var oTl = nfgOvCardHTML; nfgOvCardHTML = function (rows) { return oTl.call(this, (rows || []).filter(function (r) { return !r.dept; })); }; }
  // the PRO / package badge is for Sub-Centres; department-core facilities show their type
  if (typeof nfProBadge === 'function') { var oPro = nfProBadge; nfProBadge = function (f) { if (nfIsDeptFac(f)) return ' <span class="nfo-chip blue sm">' + scEsc((NF_LEVELS[nfTypeOf(f)] || {}).short || '') + '</span>'; return oPro.apply(this, arguments); }; }
  var oChip = nfStatusChip;
  nfStatusChip = function (r) {
    if (!r.dept) return oChip.apply(this, arguments);
    if (r.loading) return '<span class="nfo-chip grey">Loading…</span>';
    var f = (scMasterFacilities || {})[r.code] || {}, g = f.graduation, s = _nfDs.map[r.code] || {};
    return nfResultChip(nfResultDept(s, g));
  };
})();

// ── Reports: UPHC · PHC · CHC (Excel) ──
function nfEnsureDeptReportCard() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main || document.getElementById('nf-dsrep') || !nfDeptCodes().length) return;
  var c = document.createElement('div'); c.id = 'nf-dsrep'; c.dataset.nfv = 'reports'; c.className = 'nf-bizrep';
  c.innerHTML = '<div class="nf-bizrep-h"><i class="ti ti-building-hospital"></i> UPHC · PHC · CHC report <span>' + nfDeptCodes().length + ' facilit' + (nfDeptCodes().length === 1 ? 'y' : 'ies') + '</span></div>'
    + '<div class="nf-bizrep-p">One row per facility: day, readiness, baseline and change, NQAS result, gaps without an action, actions (open, overdue, fixed, with the Supervisor), department-days to check — plus sheets by department and by Area of Concern. Excel.</div>'
    + '<button type="button" class="nf-bizrep-btn" onclick="nfDeptReport()"><i class="ti ti-download"></i> Download Excel</button>';
  var bar = main.querySelector('.sc-report-bar'); if (bar && bar.parentNode === main) main.insertBefore(c, bar); else main.appendChild(c);
}
async function nfDeptReport() {
  try {
    if (_nfDs.loading) await _nfDs.loading;
    var X = await nfLoadXlsx(), wb = X.utils.book_new(), F = scMasterFacilities || {}, codes = nfDeptCodes().filter(function (c) { return _nfDs.map[c]; });
    var date = scNowIso().slice(0, 10), rows = [['Type', 'Facility', 'ID', 'District', 'Block', 'Start date', 'Day', 'Of days', 'Readiness %', 'Baseline %', 'Change', 'Meets NQAS', 'Checkpoints scored', 'Of', 'Gaps without an action', 'Actions open', 'Overdue', 'Fixed · re-check due', 'With the Supervisor', 'Closed', 'Department-days to check', 'Checkpoint master']];
    codes.forEach(function (c) { var s = _nfDs.map[c];
      rows.push([(NF_LEVELS[s.type] || {}).short || s.type, s.name, c, s.district, s.block, s.startDate || '', s.day == null ? '' : s.day, s.days, s.assessed ? s.pct : '', s.base == null ? '' : s.base,
        s.assessed && s.base != null ? s.pct - s.base : '', s.meets ? 'Yes' : 'No', s.assessed, s.total, s.noAct, s.acts.open, s.acts.od, s.acts.fixed, s.acts.sup, s.acts.closed, s.checksDue, s.master ? 'v' + s.master : 'checklist']); });
    var ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = [6, 30, 18, 14, 14, 11, 6, 7, 11, 10, 8, 10, 10, 8, 12, 10, 8, 12, 12, 8, 12, 12].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, 'Facilities');
    var dr = [['Type', 'Facility', 'ID', 'Department', 'Readiness %']];
    codes.forEach(function (c) { var s = _nfDs.map[c], cfg = NF_LEVELS[s.type] || {}; (cfg.departments || []).forEach(function (d) { if (s.byDept[d.id] == null) return; dr.push([cfg.short || s.type, s.name, c, d.name, s.byDept[d.id]]); }); });
    var ws2 = X.utils.aoa_to_sheet(dr); ws2['!cols'] = [6, 30, 18, 30, 11].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws2, 'By department');
    var ar = [['Type', 'Facility', 'ID', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']];
    codes.forEach(function (c) { var s = _nfDs.map[c]; ar.push([(NF_LEVELS[s.type] || {}).short || s.type, s.name, c].concat('ABCDEFGH'.split('').map(function (a) { return s.byAoc[a] == null ? '' : s.byAoc[a]; }))); });
    var ws3 = X.utils.aoa_to_sheet(ar); X.utils.book_append_sheet(wb, ws3, 'By Area of Concern');
    if (typeof nfSaveWb === 'function') await nfSaveWb(X, wb, 'NQAS-FAST-UPHC-PHC-CHC-report-' + date + '.xlsx'); else X.writeFile(wb, 'NQAS-FAST-UPHC-PHC-CHC-report-' + date + '.xlsx');
    showToast('Report downloaded.', 'ok');
  } catch (e) { console.warn(e); showToast('Could not create the report — check the connection.', 'err'); }
}
(function () {
  if (typeof nfAdminApply !== 'function') return;
  var oA = nfAdminApply; nfAdminApply = function () { try { nfEnsureDeptReportCard(); } catch (e) {} return oA.apply(this, arguments); };
})();
