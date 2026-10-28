// ══════════════════════════════════════════════════════════════
// REPORTS — one menu and one dialog for every facility type (review items R1–R10, 23 Oct 2026)
//  Every card: "Choose & download" → one dialog: facilities (type chips, district, search, tick list), format (PDF / Excel),
//  a preview of what goes in, then Download. Reports: Facility progress (all types) · One facility (SC and UPHC / PHC / CHC) ·
//  Programme & timeline · Graduation & certificates · Staff & roles (incl. department teams) · Business (HealSol, own dialog).
//  Every report says when its data is from ("Data as of …, live" or "nightly summary"). Dates are India dates (scTodayStr).
//  Data: hsInfo(code) — the same rows as Facilities / Today; department-core facilities from their summaries (_nfDs).
// ══════════════════════════════════════════════════════════════
var _rp = { id: '', type: '', dist: '', q: '', sel: null, fmt: 'pdf', one: '' };
var NF_REPORTS = [
  { id: 'progress', t: 'Facility progress', what: 'One row per facility: day and phase, readiness from baseline to now, how much is checked, the result (NQAS Ready · Almost ready · Not yet ready · Too early) and why, on-time %, overdue actions. Excel adds sheets by Area of Concern and by department.', helps: 'Review meetings and monthly reporting', fmts: ['pdf', 'xlsx'], roles: ['admin', 'supervisor', 'district'] },
  { id: 'facility', t: 'One facility', what: 'A facility\'s full report: readiness, result, Areas of Concern, departments or service packages, Standards against their minimum, open actions, staff.', helps: 'Sharing with the facility, the MO or the District', fmts: ['pdf'], one: true, roles: ['admin', 'supervisor', 'district'] },
  { id: 'timeline', t: 'Programme & timeline', what: 'Start date, day and phase, cards on time, On track / Slipping / Behind, the next milestone and its date, graduation date and result, catch-ups.', helps: 'Keeping every facility on schedule', fmts: ['xlsx', 'pdf'], roles: ['admin', 'supervisor', 'district'] },
  { id: 'grad', t: 'Graduation & certificates', what: 'Results, what was below the mark, catch-ups, NHSRC / LaQshya / MusQan status and certificates issued.', helps: 'Certification follow-up with the State', fmts: ['xlsx'], roles: ['admin', 'district'] },
  { id: 'staff', t: 'Staff & roles', what: 'Every staff member: role, departments (lead / team), cards filled, cards checked, personal readiness (Sub-Centres).', helps: 'Seeing who needs support', fmts: ['xlsx', 'pdf'], roles: ['admin', 'supervisor'] },
  { id: 'business', t: 'Business', what: 'Revenue, money to collect, customers, growth, payments, registrations and enquiries, for the facility type and dates you choose.', helps: 'HealSol finance and planning', fmts: ['xlsx', 'pdf'], roles: ['admin'], own: 'nfBusinessReport()' }
];
function rpE(s) { return scEsc(s == null ? '' : String(s)); }
function rpRole() { try { return nfAdminRole() || 'admin'; } catch (e) { return 'admin'; } }
function rpCodes() { var F = scMasterFacilities || {}; return scVisibleFacilityCodes().filter(function (c) { return F[c] && !F[c].migratedTo; }); }
function rpAsOf() { var w = new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); return w + (typeof _nfLight !== 'undefined' && _nfLight ? ' · nightly summary' : ' · live'); }
function rpTypeShort(t) { return t === 'sc' ? 'SC' : ((NF_LEVELS[t] || {}).short || String(t || '').toUpperCase()); }
function rpTypeLbl(t) { return t === 'sc' ? 'Sub-Centre' : ((NF_LEVELS[t] || {}).short || String(t || '').toUpperCase()); }
function rpRes(o) { var r; try { r = o.dept ? nfResult(nfResultDept(o.s || {}, o.grad)) : nfResult(nfResultSc(o.agg, o.grad)); } catch (e) { r = { cls: 'grey', txt: '—', word: '—' }; }
  var why = r.word === '—' || r.cls === 'green' ? '' : r.txt.replace(/^Too early · /, ''); return { cls: r.cls, word: r.word === '—' ? r.txt : r.word, why: why === r.word ? '' : why }; }
function rpPhase(o) { return o.phase === 'notstarted' ? (o.f.startDate ? 'Starts ' + nfDateTxt(o.f.startDate, true) : 'Start date not set') : HS_PHASE[o.phase] || ''; }
function rpComp(o) { var s = o.comp && o.comp.state; return !o.inProg ? '' : s === 'g' ? 'On track' : s === 'a' ? 'Slipping' : s === 'r' ? 'Behind' : ''; }
function rpNext(o) { if (!o.f.startDate || o.grad) return { l: '', d: '' }; var S = o.S, d = o.rawDay, at = function (n) { return hsAddDays(o.f.startDate, n - 1); };
  if (d == null || d < 1) return { l: 'Day 1 — baseline starts', d: at(1) }; if (d <= S.bN) return { l: 'Implementation starts (Day ' + (S.bN + 1) + ')', d: at(S.bN + 1) };
  if (d <= S.iN) return { l: 'End-line starts (Day ' + (S.iN + 1) + ')', d: at(S.iN + 1) }; if (d <= S.eN) return { l: 'Readiness week starts (Day ' + (S.eN + 1) + ')', d: at(S.eN + 1) };
  return { l: 'Graduation (Day ' + o.days + ')', d: at(o.days) }; }
function rpInfo(codes) { return codes.map(function (c) { return hsInfo(c); }).sort(function (a, b) { return String(a.district).localeCompare(String(b.district)) || a.name.localeCompare(b.name); }); }

// ── the menu (HealSol, Supervisor, District Admin) ──
function rpMenuHTML(sub) {
  var role = rpRole(), list = NF_REPORTS.filter(function (r) { return r.roles.indexOf(role) >= 0; });
  return '<div class="nfo-top"><div><h1>Reports</h1><small>' + rpE(sub) + '</small></div></div><div class="hs-rg">'
    + list.map(function (r) { return '<div class="nfo-card hs-rc rp-card" data-rp="' + r.id + '"><b>' + rpE(r.t) + '</b><p>' + rpE(r.what) + '</p><small>Helps with: ' + rpE(r.helps) + ' · ' + r.fmts.map(function (f) { return f === 'pdf' ? 'PDF' : 'Excel'; }).join(' or ') + '</small>'
      + '<div><button type="button" class="hs-btn p" onclick="' + (r.own || "nfRepOpen('" + r.id + "')") + '">Choose &amp; download</button>' + (r.id === 'business' ? '<button type="button" class="hs-btn" onclick="nfAdminView(\'business\')">Open Business</button>' : '') + '</div></div>'; }).join('') + '</div>';
}
(function () {
  if (typeof hsRenderReports === 'function') hsRenderReports = function () { if (!hsOn()) return; var box = hsBox('hs-rep', 'reports'); if (!box) return; box.innerHTML = rpMenuHTML('Choose a report, pick the facilities and the format, preview, download'); };
  if (typeof hsrRenderReports === 'function') hsrRenderReports = function () { if (!hsrOn() || hsrRole() === 'champion') return; var box = hsrBox('hsr-rep', 'reports'); if (!box) return; var n = rpCodes().length;
    box.innerHTML = rpMenuHTML('Your ' + n + ' facilit' + (n === 1 ? 'y' : 'ies') + ' · choose a report, preview, download'); };
})();

// ── the dialog ──
function nfRepOpen(id, code) {
  var R = NF_REPORTS.find(function (x) { return x.id === id; }); if (!R) return;
  _rp = { id: id, type: '', dist: '', q: '', sel: null, fmt: R.fmts[0], one: code || '' };
  if (!R.one) { _rp.sel = {}; rpCodes().forEach(function (c) { _rp.sel[c] = 1; }); }
  var go = function () { nfRepRender(); };
  if (typeof nfDeptSumLoad === 'function' && typeof nfDeptCodes === 'function' && nfDeptCodes().length && (!_nfDs.at || _nfDs.loading)) { nfRepRender(true); Promise.resolve(nfDeptSumLoad()).then(go, go); } else go();
}
function nfRepClose() { var o = document.getElementById('rp-ov'); if (o) o.remove(); }
function rpFiltered() { var F = scMasterFacilities || {}, q = String(_rp.q || '').toLowerCase().trim();
  return rpCodes().filter(function (c) { var f = F[c], t = nfTypeOf(f); if (_rp.type && t !== _rp.type) return false; if (_rp.dist && (f.district || '') !== _rp.dist) return false;
    if (q && ((f.name || '') + ' ' + c + ' ' + (f.district || '')).toLowerCase().indexOf(q) < 0) return false; return true; }); }
function rpChosen() { var R = NF_REPORTS.find(function (x) { return x.id === _rp.id; }); if (R.one) return _rp.one ? [_rp.one] : []; var vis = rpFiltered(); return vis.filter(function (c) { return _rp.sel[c]; }); }
function nfRepSet(k, v) { _rp[k] = v; nfRepRender(); if (k === 'q') { var i = document.getElementById('rp-q'); if (i) { i.focus(); try { i.setSelectionRange(v.length, v.length); } catch (e) {} } } }
function nfRepTick(c, on) { var R = NF_REPORTS.find(function (x) { return x.id === _rp.id; }); if (R.one) _rp.one = c; else { if (on) _rp.sel[c] = 1; else delete _rp.sel[c]; } nfRepRender(); }
function nfRepAll(on) { rpFiltered().forEach(function (c) { if (on) _rp.sel[c] = 1; else delete _rp.sel[c]; }); nfRepRender(); }
function nfRepRender(loading) {
  var R = NF_REPORTS.find(function (x) { return x.id === _rp.id; }); if (!R) return;
  var ov = document.getElementById('rp-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'rp-ov'; ov.className = 'scx-ov open'; ov.onclick = function (e) { if (e.target === ov) nfRepClose(); }; document.body.appendChild(ov); }
  var F = scMasterFacilities || {}, all = rpCodes(), types = {}, dists = {}; all.forEach(function (c) { var t = nfTypeOf(F[c]); types[t] = (types[t] || 0) + 1; if (F[c].district) dists[F[c].district] = 1; });
  var vis = rpFiltered(), chosen = loading ? [] : rpChosen();
  var h = '<div class="scx-box rp-box" role="dialog" aria-modal="true" aria-labelledby="rp-h"><div class="rp-hd"><div><b id="rp-h">' + rpE(R.t) + '</b><small>' + rpE(R.what) + '</small></div><button type="button" class="rp-x" aria-label="Close" onclick="nfRepClose()"><i class="ti ti-x"></i></button></div>';
  if (loading) { ov.innerHTML = h + '<div class="rp-b"><p class="rp-dim">Getting the latest numbers…</p></div></div>'; return; }
  h += '<div class="rp-b"><div class="rp-sec">' + (R.one ? 'Facility' : 'Facilities') + '</div>'
    + (Object.keys(types).length > 1 ? '<div class="rp-types" role="group" aria-label="Facility type">' + [['', 'All', all.length]].concat(['sc', 'uphc', 'phc', 'chc'].filter(function (t) { return types[t]; }).map(function (t) { return [t, rpTypeLbl(t), types[t]]; }))
      .map(function (x) { return '<button type="button" aria-pressed="' + (_rp.type === x[0]) + '" class="' + (_rp.type === x[0] ? 'on' : '') + '" onclick="nfRepSet(\'type\',\'' + x[0] + '\')">' + rpE(x[1]) + ' <em>' + x[2] + '</em></button>'; }).join('') + '</div>' : '')
    + '<div class="rp-filt"><label class="rp-search"><i class="ti ti-search"></i><input id="rp-q" type="search" aria-label="Search facilities" placeholder="Search name, ID or district" value="' + rpE(_rp.q) + '" oninput="nfRepSet(\'q\',this.value)"></label>'
    + (Object.keys(dists).length > 1 ? '<select aria-label="District" onchange="nfRepSet(\'dist\',this.value)"><option value="">All districts</option>' + Object.keys(dists).sort().map(function (d) { return '<option' + (_rp.dist === d ? ' selected' : '') + '>' + rpE(d) + '</option>'; }).join('') + '</select>' : '') + '</div>'
    + (R.one ? '' : '<div class="rp-allrow"><span>' + chosen.length + ' of ' + vis.length + ' chosen</span><button type="button" class="hs-link" onclick="nfRepAll(true)">Choose all</button><button type="button" class="hs-link" onclick="nfRepAll(false)">Clear</button></div>')
    + '<div class="rp-list">' + (vis.length ? vis.map(function (c) { var f = F[c], on = R.one ? _rp.one === c : !!_rp.sel[c];
      return '<label class="rp-item' + (on ? ' on' : '') + '"><input type="' + (R.one ? 'radio' : 'checkbox') + '" name="rp-fac"' + (on ? ' checked' : '') + ' onchange="nfRepTick(\'' + scJs(c) + '\',this.checked)"><span><b>' + rpE(f.name || c) + '</b> <i class="rp-ty">' + rpE(rpTypeShort(nfTypeOf(f))) + '</i><small>' + rpE([c, f.district].filter(Boolean).join(' · ')) + '</small></span></label>'; }).join('') : '<p class="rp-dim">No facility matches.</p>') + '</div>';
  if (R.fmts.length > 1) h += '<div class="rp-sec">Format</div><div class="rp-fmt" role="radiogroup" aria-label="Format">' + R.fmts.map(function (f) { return '<label class="' + (_rp.fmt === f ? 'on' : '') + '"><input type="radio" name="rp-fmt"' + (_rp.fmt === f ? ' checked' : '') + ' onchange="nfRepSet(\'fmt\',\'' + f + '\')"> ' + (f === 'pdf' ? 'PDF — to print or share' : 'Excel — to sort and filter') + '</label>'; }).join('') + '</div>';
  h += '<div class="rp-sec">Preview</div><div class="rp-pv" id="rp-pv">' + rpPreviewHTML(R, chosen) + '</div></div>'
    + '<div class="rp-f"><small>Data as of ' + rpE(rpAsOf()) + '</small><button type="button" class="s" onclick="nfRepClose()">Cancel</button><button type="button" class="p" id="rp-go"' + (chosen.length ? '' : ' disabled') + ' onclick="nfRepGo(this)"><i class="ti ti-download"></i> Download ' + (_rp.fmt === 'pdf' ? 'PDF' : 'Excel') + '</button></div></div>';
  ov.innerHTML = h;
}
function rpPreviewHTML(R, codes) {
  if (!codes.length) return '<p class="rp-dim">' + (R.one ? 'Choose a facility.' : 'Choose at least one facility.') + '</p>';
  var T = rpTable(R.id, rpInfo(codes)), n = T.rows.length, LIM = 5;
  return '<p class="rp-dim">' + rpE(T.what) + '</p>' + (T.head ? '<div class="rp-tw"><table><thead><tr>' + T.head.slice(0, 6).map(function (x) { return '<th>' + rpE(x) + '</th>'; }).join('') + '</tr></thead><tbody>'
    + T.rows.slice(0, LIM).map(function (r) { return '<tr>' + r.slice(0, 6).map(function (v) { return '<td>' + rpE(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>' + (n > LIM ? '<p class="rp-dim">… and ' + (n - LIM) + ' more rows in the file.</p>' : '') : '');
}
// one table per report (preview, Excel, PDF use the same rows)
function rpTable(id, list) {
  if (id === 'progress') return { what: list.length + ' facilit' + (list.length === 1 ? 'y' : 'ies'),
    head: ['Facility', 'Type', 'District', 'Readiness %', 'Result', 'Why', 'Baseline %', 'Change', 'Checked %', 'Day', 'Phase', 'On time %', 'Status', 'Overdue actions', 'To verify / check', 'ID', 'Block'],
    rows: list.map(function (o) { var r = rpRes(o); return [o.name, rpTypeShort(o.type), o.district, o.pct == null ? '' : o.pct, r.word, r.why, o.base == null ? '' : o.base, o.pct != null && o.base != null ? o.pct - o.base : '', o.cov == null ? '' : o.cov,
      o.day == null ? '' : o.day, rpPhase(o), o.onTime == null ? '' : o.onTime, rpComp(o), o.overdue || 0, o.dept ? (o.toCheck || 0) : (o.toVerify || 0), o.code, o.f.block || '']; }) };
  if (id === 'facility') { var o = list[0], r = rpRes(o); return { what: o.name + ' · ' + rpTypeLbl(o.type) + ' · ' + rpPhase(o), head: ['Readiness', 'Result', 'Baseline', 'Checked', 'Day', 'Overdue actions'], rows: [[o.pct == null ? '—' : o.pct + '%', r.word, o.base == null ? '—' : o.base + '%', o.cov == null ? '—' : o.cov + '%', o.day == null ? '—' : o.day + ' / ' + o.days, o.overdue || 0]] }; }
  if (id === 'timeline') return { what: list.length + ' facilit' + (list.length === 1 ? 'y' : 'ies'),
    head: ['Facility', 'Type', 'Phase', 'Day', 'Status', 'On time %', 'Next milestone', 'Next date', 'Start date', 'Graduation date', 'Result', 'Catch-up', 'District', 'ID'],
    rows: list.map(function (o) { var n = rpNext(o), g = o.grad; return [o.name, rpTypeShort(o.type), rpPhase(o), o.day == null ? '' : o.day + ' / ' + o.days, rpComp(o), o.onTime == null ? '' : o.onTime, n.l, n.d ? nfDateTxt(n.d) : '', o.f.startDate ? nfDateTxt(o.f.startDate) : '',
      o.gradDate ? nfDateTxt(o.gradDate) : '', g && g.result ? (HS_RES[g.result] || [g.result])[0] + (g.overall != null ? ' (' + g.overall + '%)' : '') : '', o.cu ? (o.cu.done ? 'done' : 'on') + (o.cu.start ? ' ' + nfDateTxt(o.cu.start, true) + ' – ' + nfDateTxt(o.cu.end || '', true) : '') : '', o.district, o.code]; }) };
  if (id === 'grad') return { what: list.length + ' facilit' + (list.length === 1 ? 'y' : 'ies') + ' · certificates on a second sheet',
    head: ['Facility', 'Type', 'Result', 'Graduated on', 'Baseline %', 'End-line %', 'Below the mark', 'Catch-up', 'NHSRC', 'LaQshya', 'MusQan', 'District', 'ID'],
    rows: list.map(function (o) { var g = o.grad || {}; return [o.name, rpTypeShort(o.type), g.result ? (HS_RES[g.result] || [g.result])[0] : '', g.at ? nfDateTxt(String(g.at).slice(0, 10)) : '', g.base == null ? '' : g.base, g.overall == null ? '' : g.overall,
      [].concat((g.deptFails || []).map(function (d) { return 'dept ' + d; }), (g.aocFails || []).map(function (a) { return 'Area ' + a; }), (g.stdFails || []).length ? [(g.stdFails || []).length + ' Standards'] : []).join(', '),
      o.cu ? (o.cu.done ? 'done' : 'on') : '', (o.f.nhsrc || {}).status || '', (o.f.laqshya || {}).status || '', (o.f.musqan || {}).status || '', o.district, o.code]; }) };
  if (id === 'staff') { var rows = rpStaffRows(list); return { what: rows.length + ' staff in ' + list.length + ' facilit' + (list.length === 1 ? 'y' : 'ies'),
    head: ['Name', 'Role', 'Facility', 'Type', 'Departments', 'Cards filled', 'Cards checked', 'Readiness %', 'District'], rows: rows }; }
  return { what: '', head: null, rows: [] };
}
// staff rows: Sub-Centres from the readiness engine; UPHC / PHC / CHC from their cards (loaded by nfRepGo)
var _rpCards = {};
function rpStaffRows(list) {
  var out = [];
  list.forEach(function (o) { var f = o.f, st = f.staff || {};
    if (!o.dept) { var A = o.agg || scFacAggFor(o.code); (A.staff || []).forEach(function (s) { if (!s.inRoster) return; var r = s.res || {};
      out.push([s.name, s.role, o.name, 'SC', '', r.daysDone || 0, r.daysVerified || 0, r.pct == null ? '' : r.pct, o.district]); }); return; }
    var cfg = NF_LEVELS[o.type] || {}, D = f.depts || {}, C = _rpCards[o.code] || null, nm = function (id) { return ((cfg.departments || []).find(function (d) { return d.id === id; }) || { name: id }).name; };
    Object.keys(st).filter(function (m) { return st[m] && !st[m].disabled; }).forEach(function (m) { var s = st[m], ds = [];
      Object.keys(D).forEach(function (id) { var d = D[id] || {}; if (d.off) return; if (d.lead === m) ds.push(nm(id) + ' (lead)'); else if ((d.team || {})[m]) ds.push(nm(id)); });
      out.push([s.name || m, s.role || '', o.name, rpTypeShort(o.type), ds.join(', '), C ? (C.fill[m] || 0) : '', C ? (C.chk[m] || 0) : '', '', o.district]); }); });
  return out;
}
async function rpLoadCards(list) {
  for (var i = 0; i < list.length; i++) { var o = list[i]; if (!o.dept || _rpCards[o.code]) continue;
    var P = {}, Dc = {}; try { P = await fbGet('sc_pcards/' + o.code) || {}; Dc = await fbGet('sc_dcards/' + o.code) || {}; } catch (e) {}
    var fill = {}, chk = {};
    Object.keys(P).forEach(function (d) { Object.keys(P[d] || {}).forEach(function (k) { var day = P[d][k] || {}; Object.keys(day).forEach(function (m) { var c = day[m] || {}; if (c.done) fill[m] = (fill[m] || 0) + 1; }); }); });
    Object.keys(Dc).forEach(function (d) { Object.keys(Dc[d] || {}).forEach(function (k) { var c = Dc[d][k] || {}, by = (c.chk && c.chk.by) || (c.verified && c.verified.by); if (by) chk[by] = (chk[by] || 0) + 1; }); });
    _rpCards[o.code] = { fill: fill, chk: chk }; }
}
// ── download ──
async function nfRepGo(btn) {
  var R = NF_REPORTS.find(function (x) { return x.id === _rp.id; }), codes = rpChosen(); if (!R || !codes.length) return;
  var old = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
  try {
    var list = rpInfo(codes);
    if (R.id === 'staff') await rpLoadCards(list);
    if (R.id === 'facility') { nfRepFacility(codes[0]); nfRepClose(); return; }
    if (_rp.fmt === 'xlsx') await rpExcel(R, list); else rpPdf(R, list);
    nfRepClose();
  } catch (e) { console.warn('[REP]', e); showToast(e && e.message === 'load' ? 'Could not load the Excel tool — check the internet connection.' : 'Could not prepare the report.', 'err'); }
  finally { if (btn && document.body.contains(btn)) { btn.disabled = false; btn.innerHTML = old; } }
}
function rpFile(R, ext) { return 'NQAS-FAST-' + R.t.replace(/&/g, 'and').replace(/[^A-Za-z0-9]+/g, '-').replace(/-+$/, '') + (_rp.type ? '-' + _rp.type : '') + '-' + scTodayStr() + '.' + ext; }
async function rpExcel(R, list) {
  var X = await nfLoadXlsx(), wb = X.utils.book_new(), T = rpTable(R.id, list);
  var head = [['NQAS | FAST — ' + R.t], ['Data as of', rpAsOf()], ['Facilities', list.length + (_rp.type ? ' · ' + rpTypeLbl(_rp.type) + 's only' : '')], []];
  var ws = X.utils.aoa_to_sheet(head.concat([T.head], T.rows)); ws['!cols'] = T.head.map(function (h, i) { return { wch: i === 0 ? 28 : Math.max(10, Math.min(30, h.length + 2)) }; });
  X.utils.book_append_sheet(wb, ws, R.id === 'staff' ? 'Staff' : 'Facilities');
  if (R.id === 'progress') {
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['Facility', 'Type', 'ID', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']].concat(list.map(function (o) { var b = o.dept ? (o.byAoc || {}) : {}; if (!o.dept && o.agg) Object.keys(o.agg.byAoc || {}).forEach(function (k) { var x = o.agg.byAoc[k]; if (x && x.assessed) b[k] = x.pct; });
      return [o.name, rpTypeShort(o.type), o.code].concat('ABCDEFGH'.split('').map(function (a) { return b[a] == null ? '' : b[a]; })); }))), 'By Area of Concern');
    var dr = [['Facility', 'Type', 'ID', 'Department', 'Readiness %']]; list.forEach(function (o) { if (!o.dept) return; var cfg = NF_LEVELS[o.type] || {}; (cfg.departments || []).forEach(function (d) { if ((o.byDept || {})[d.id] == null) return; dr.push([o.name, rpTypeShort(o.type), o.code, d.name, o.byDept[d.id]]); }); });
    if (dr.length > 1) X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(dr), 'By department');
  }
  if (R.id === 'grad') { try { await hsLoadCerts(); } catch (e) {} var C = (_hs && _hs.certs) || {}, cr = [['Certificate No.', 'Name', 'Role', 'Facility', 'Type', 'Grade', 'Facility %', 'Issued']];
    list.forEach(function (o) { Object.keys(C[o.code] || {}).forEach(function (m) { var c = C[o.code][m] || {}; cr.push([c.certId, c.name, c.role, c.facilityName || o.name, rpTypeShort(o.type), c.grade, c.facPct, String(c.issuedAt || '').slice(0, 10)]); }); });
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet(cr), 'Certificates'); }
  nfDoneToast(await nfSaveWb(X, wb, rpFile(R, 'xlsx')));
}
function rpPill(cls) { return cls === 'green' ? 'g' : cls === 'amber' ? 'a' : cls === 'red' ? 'r' : 'n'; }
function rpPdf(R, list) {
  var meta = [['Facilities', list.length + (_rp.type ? ' · ' + rpTypeLbl(_rp.type) + 's only' : '')], ['Data as of', rpAsOf()]], body = '';
  var k = function (v, l, c) { return '<div><b style="color:' + (c || '#13201F') + '">' + v + '</b><small>' + l + '</small></div>'; };
  if (R.id === 'progress' || R.id === 'timeline') {
    var wd = list.filter(function (o) { return o.pct != null; }), avg = wd.length ? Math.round(wd.reduce(function (s, o) { return s + o.pct; }, 0) / wd.length) : null;
    var wb = list.filter(function (o) { return o.pct != null && o.base != null; }), gain = wb.length ? Math.round(wb.reduce(function (s, o) { return s + o.pct - o.base; }, 0) / wb.length) : null;
    var cnt = function (w) { return list.filter(function (o) { return rpRes(o).word === w; }).length; };
    body += '<div class="kp">' + k(list.length, 'Facilities') + k(avg == null ? '—' : avg + '%', 'Average readiness', avg == null ? '#94A3B8' : nfRptColor(avg)) + k(gain == null ? '—' : (gain >= 0 ? '+' : '') + gain, 'Average change since baseline', gain > 0 ? '#15803D' : gain < 0 ? '#B91C1C' : '#6B7A78')
      + k(cnt(NF_RES_WORD.ready), 'NQAS Ready', '#15803D') + k(list.filter(function (o) { return o.behind; }).length, 'Behind schedule', '#B91C1C') + '</div>';
  }
  if (R.id === 'progress') {
    body += '<h2>Facilities<small>bar = readiness now · orange tick = baseline</small></h2><table><thead><tr><th>Facility</th><th style="width:22%">Readiness</th><th class="c">Change</th><th>Result</th><th class="c">Checked</th><th>Day · phase</th><th class="c">On time</th><th class="c">Overdue</th></tr></thead><tbody>'
      + list.map(function (o) { var r = rpRes(o); return '<tr><td><b>' + rpE(o.name) + '</b><small>' + rpE(rpTypeShort(o.type) + ' · ' + o.district + ' · ' + o.code) + '</small></td><td><div class="rbw">' + nfRptBar(o.pct || 0, o.base) + '<b>' + (o.pct == null ? '—' : o.pct + '%') + '</b></div></td>'
        + '<td class="c">' + (o.pct != null && o.base != null ? nfRptChange(o.pct, o.base) : '—') + '</td><td><span class="pill ' + rpPill(r.cls) + '">' + rpE(r.word) + '</span>' + (r.why ? '<small>' + rpE(r.why) + '</small>' : '') + '</td><td class="c">' + (o.cov == null ? '—' : o.cov + '%') + '</td>'
        + '<td>' + (o.day ? 'Day ' + o.day + '<small>' + rpE(rpPhase(o)) + '</small>' : rpE(rpPhase(o))) + '</td><td class="c' + (o.behind ? ' no' : '') + '">' + (o.onTime == null ? '—' : o.onTime + '%') + '</td><td class="c' + (o.overdue ? ' no' : '') + '">' + (o.overdue || 0) + '</td></tr>'; }).join('') + '</tbody></table>';
  } else {
    var T = rpTable(R.id, list), cols = R.id === 'timeline' ? [0, 2, 3, 4, 5, 6, 7, 9, 10] : [0, 1, 2, 3, 4, 5, 6, 7];
    body += '<h2>' + rpE(R.id === 'timeline' ? 'Facilities' : 'Staff') + '<small>' + rpE(T.what) + '</small></h2><table><thead><tr>' + cols.map(function (i) { return '<th>' + rpE(T.head[i]) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + T.rows.map(function (r) { return '<tr>' + cols.map(function (i, j) { return '<td' + (j ? '' : ' style="font-weight:600"') + '>' + rpE(r[i]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  nfRptOpen(nfRptDoc({ title: R.t, subtitle: '', meta: meta, body: body, preview: false }));
}
// ── One facility: Sub-Centre report as before; UPHC / PHC / CHC from the department summary ──
function nfRepFacility(code) {
  var f = (scMasterFacilities || {})[code]; if (!f) return;
  if (nfTypeOf(f) === 'sc') { nfRptOpen(nfFacilityReportHTML(code, false)); return; }
  var go = function () { nfRptOpen(nfDeptFacilityReportHTML(code)); };
  if (typeof _nfDs !== 'undefined' && !_nfDs.map[code] && typeof nfDeptSumLive === 'function') nfDeptSumLive(code).then(function (s) { _nfDs.map[code] = s; go(); }, go); else go();
}
function nfDeptFacilityReportHTML(code) {
  var o = hsInfo(code), f = o.f, s = o.s || {}, cfg = NF_LEVELS[o.type] || {}, r = rpRes(o), crit = (function () { var k = (typeof _ndCrit !== 'undefined' && _ndCrit) || {}; return Object.assign({}, k, (k.byType || {})[o.type] || {}); })(), stdMin = crit.stdDefault || 50, mark = crit.overall || 70;
  var k = function (v, l, c) { return '<div><b style="color:' + (c || '#13201F') + '">' + v + '</b><small>' + l + '</small></div>'; }, acts = s.acts || {};
  var body = '<div class="kp">' + k(o.pct == null ? '—' : o.pct + '%', 'Readiness now', o.pct == null ? '#94A3B8' : nfRptColor(o.pct)) + k(o.base == null ? '—' : o.base + '%', 'Baseline', o.base == null ? '#94A3B8' : nfRptColor(o.base))
    + k(o.pct != null && o.base != null ? (o.pct - o.base >= 0 ? '+' : '') + (o.pct - o.base) : '—', 'Change since baseline') + k((s.assessed || 0) + ' / ' + (s.total || 0), 'Checkpoints scored') + k(o.cov == null ? '—' : o.cov + '%', 'Checklist checked')
    + k(acts.open || 0, 'Open actions') + k(acts.od || 0, 'Overdue actions', acts.od ? '#B91C1C' : '#6B7A78') + k(s.noAct || 0, 'Gaps without an action', '#B45309') + k(s.checksDue || 0, 'Department-days to check') + k(o.onTime == null ? '—' : o.onTime + '%', 'Cards on time') + '</div>';
  body += '<div class="nq-l ' + (r.cls === 'green' ? 'ok' : r.cls === 'grey' ? 'na' : 'no') + '"><b>' + rpE(r.word) + '</b>' + (r.why ? ' — ' + rpE(r.why) : '') + ' · NQAS needs overall ' + mark + '%, every department and Area of Concern ' + mark + '%, every Standard ' + stdMin + '%.</div>';
  var deps = (cfg.departments || []).filter(function (d) { return !(((f.depts || {})[d.id] || {}).off); });
  var card = function (t, sub, p) { return '<div class="cd"><b class="cd-t">' + rpE(t) + '</b>' + (sub ? '<small>' + rpE(sub) + '</small>' : '') + '<div class="cd-v"><b style="color:' + (p == null ? '#94A3B8' : nfRptColor(p)) + '">' + (p == null ? '—' : p + '%') + '</b></div>' + nfRptBar(p || 0, null) + '</div>'; };
  body += '<h2>Departments<small>' + deps.length + ' · needs ' + mark + '% each</small></h2><div class="cds">' + deps.map(function (d) { return card(d.name, (f.depts || {})[d.id] && f.depts[d.id].lead ? 'lead ' + (((f.staff || {})[f.depts[d.id].lead] || {}).name || '') : '', (o.byDept || {})[d.id]); }).join('') + '</div>';
  body += '<h2>Areas of Concern</h2><div class="cds">' + 'ABCDEFGH'.split('').filter(function (a) { return (o.byAoc || {})[a] != null; }).map(function (a) { return card('AoC ' + a + ' · ' + ((typeof SC_CPM_AOC !== 'undefined' && SC_CPM_AOC[a]) || ''), '', o.byAoc[a]); }).join('') + '</div>';
  var stds = Object.keys(o.byStd || {}).sort(typeof scStdCmp === 'function' ? scStdCmp : undefined);
  if (stds.length) body += '<h2 class="pb">Standards<small>minimum ' + stdMin + '%</small></h2><table><thead><tr><th>Standard</th><th class="c">Now</th><th class="c">Min</th><th class="c">Status</th></tr></thead><tbody>'
    + stds.map(function (x) { var p = o.byStd[x], ok = p >= stdMin; return '<tr><td><b>' + rpE(x) + '</b>' + (typeof scRegTitle === 'function' && scRegTitle('std', x) ? '<small>' + rpE(String(scRegTitle('std', x)).slice(0, 80)) + '</small>' : '') + '</td><td class="c" style="color:' + nfRptColor(p) + '"><b>' + p + '%</b></td><td class="c">' + stdMin + '%</td><td class="c ' + (ok ? 'ok' : 'no') + '">' + (ok ? '✓' : '✗') + '</td></tr>'; }).join('') + '</tbody></table>';
  var staff = rpStaffRows([o]);
  body += '<h2>Staff<small>' + staff.length + '</small></h2><table><thead><tr><th>Name</th><th>Role</th><th>Departments</th></tr></thead><tbody>' + staff.map(function (x) { return '<tr><td><b>' + rpE(x[0]) + '</b></td><td>' + rpE(x[1]) + '</td><td>' + rpE(x[4] || '—') + '</td></tr>'; }).join('') + '</tbody></table>';
  body += '<div class="sig"><div>' + rpE(o.inChargeLabel) + ' — name, signature, date</div><div>Supervisor — name, signature, date</div></div>';
  return nfRptDoc({ title: 'Facility readiness report', subtitle: o.name, preview: false, body: body,
    meta: [['Facility', o.name + ' · ' + code], ['Type', rpTypeLbl(o.type)], ['District', [f.district, f.state].filter(Boolean).join(', ') || '—'], [o.inChargeLabel, o.inCharge || '—'], ['Day', o.day == null ? '—' : o.day + ' / ' + o.days + ' · ' + rpPhase(o)], ['Start', f.startDate ? nfDateTxt(f.startDate) : '—'], ['Data as of', rpAsOf()]] });
}
// the facility page: "PDF report" for every type (was Sub-Centres only)
(function () {
  if (typeof fpTopHTML !== 'function') return;
  var oT = fpTopHTML;
  fpTopHTML = function (code, f) { var h = oT.apply(this, arguments);
    if (nfTypeOf(f || {}) !== 'sc' && h.indexOf('nfRepFacility(') < 0) h = h.replace('<div class="fp-btns">', '<div class="fp-btns"><button type="button" class="fp-btn" onclick="nfRepFacility(\'' + scJs(code) + '\')"><i class="ti ti-file-text"></i> PDF report</button>');
    return h; };
})();
