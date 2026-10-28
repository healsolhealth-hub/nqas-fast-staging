// ══════════════════════════════════════════════════════════════
// SUPERVISOR · DISTRICT ADMIN · QUALITY CHAMPION — the same Facilities table and Reports page as HealSol
// (consistency review items 5–7, agreed 22 Oct 2026). Each role sees only its own facilities; nothing HealSol-only
// (enrol, access / payments, Manage ⋯).
// ══════════════════════════════════════════════════════════════
var _hsr = { type: '', dist: '', phase: '', status: '', flat: false };
// MOIC block view (B, 22 Oct 2026): facilities grouped by PHC (CHC first), "Flat list" to switch off
function hsrBlock() { try { return scIsDistrict() && _scSup && _scSup.scope === 'block'; } catch (e) { return false; } }
function hsrNin(x) { return String(x == null ? '' : x).replace(/[^0-9A-Za-z]/g, '').toUpperCase(); }
function hsrRowsGrouped(sorted, cols, fn) {
  if (!hsrBlock() || _hsr.flat || hsrRole() === 'champion') return sorted.map(fn).join('');
  var G = {}, order = [], add = function (k, o) { if (!G[k]) { G[k] = { k: k, rows: [], head: null, name: '', sc: 0 }; order.push(k); } G[k].rows.push(o); return G[k]; };
  sorted.forEach(function (o) { var f = o.f || {}, L = f.links || {};
    if (o.type === 'chc') { var g = add('chc:' + o.code, o); g.head = o; g.name = o.name; }
    else if (o.type === 'phc') { var g2 = add('phc:' + (hsrNin(f.nin) || o.code), o); g2.head = o; g2.name = o.name; }
    else { var k = L.phc && L.phc.nin ? 'phc:' + hsrNin(L.phc.nin) : 'none'; var g3 = add(k, o); if (!g3.name) g3.name = L.phc && L.phc.name || ''; if (o.type === 'sc') g3.sc++; } });
  order.sort(function (a, b) { var r = function (k) { return /^chc:/.test(k) ? 0 : k === 'none' ? 2 : 1; }; return r(a) - r(b); });
  return order.map(function (k) { var g = G[k], rows = g.head ? [g.head].concat(g.rows.filter(function (o) { return o !== g.head; })) : g.rows;
    var title = k === 'none' ? 'Not linked to a PHC' : g.name || 'PHC', ty = /^chc:/.test(k) ? 'chc' : k === 'none' ? '' : 'phc';
    var sub = ty === 'chc' ? 'CHC' : ty === 'phc' ? (g.head ? '' : 'PHC not enrolled · ') + g.sc + ' sub-centre' + (g.sc === 1 ? '' : 's') : g.sc + ' sub-centre' + (g.sc === 1 ? '' : 's');
    if (ty === 'chc') return rows.map(fn).join('');   // the CHC: its own row is the heading
    return '<tr class="hs-grp"><td colspan="' + cols + '"><b>' + hsE(title) + '</b>' + (ty ? ' ' + hsTypeChip(ty) : '') + (ty !== 'chc' ? '<small>' + hsE(sub) + '</small>' : '') + '</td></tr>' + rows.map(fn).join(''); }).join('');
}
function hsrRole() { try { return document.body.classList.contains('nf-champ') ? 'champion' : nfAdminRole(); } catch (e) { return ''; } }
function hsrOn() { var r = hsrRole(); return !!r && r !== 'admin'; }
// one row object per facility, from the role's own rows (nfAdminRows / nfChampRows)
function hsrInfo(r, champ) {
  var f = champ ? ((_scq.facs || {})[r.code] || {}) : null, o = hsInfo(r.code, f, r.agg, champ ? ((_scq.prog || {})[r.code] || {}) : null);
  o.toVerify = r.toVerify || 0; o.next = r.next || null; if (r.overdue != null) o.overdue = r.overdue; return o;
}
function hsrFilter(list) {
  var q = String(_nfOv.q || '').trim().toLowerCase();
  return list.filter(function (o) {
    if (q && (o.name + ' ' + o.code + ' ' + o.district + ' ' + o.inCharge).toLowerCase().indexOf(q) < 0) return false;
    if (_hsr.type && o.type !== _hsr.type) return false; if (_hsr.dist && o.district !== _hsr.dist) return false;
    if (_hsr.phase === 'inprog' ? !o.inProg : _hsr.phase && o.phase !== _hsr.phase) return false;
    if (_hsr.status === 'behind' && !o.behind) return false; if (_hsr.status === 'overdue' && !o.overdue) return false; if (_hsr.status === 'verify' && !o.toVerify) return false;
    return true; });
}
// the table: the HealSol Facilities table without Access / Manage; Supervisor + Champion get "To verify"; Champion its session buttons
function hsrTableHTML(list, champ, compact) {
  var sk = _nfOv.sort, dir = _nfOv.dir || -1, val = function (o) { return sk === 'name' ? o.name : sk === 'day' ? (o.rawDay == null ? -99 : o.rawDay) : sk === 'overdue' ? (o.overdue || 0) : sk === 'verify' ? (o.toVerify || 0) : sk === 'change' ? (o.pct != null && o.base != null ? o.pct - o.base : -999) : (o.pct == null ? -1 : o.pct); };
  var sorted = list.slice().sort(function (a, b) { if (!sk) return (b.behind - a.behind) || ((b.rawDay || -1) - (a.rawDay || -1)) || a.name.localeCompare(b.name);
    var x = val(a), y = val(b), c = typeof x === 'string' ? x.localeCompare(y) : x - y; return (c * dir) || a.name.localeCompare(b.name); });
  var th = function (k, l, cls) { return '<th' + (cls ? ' class="' + cls + '"' : '') + '><button type="button" class="hs-sort" onclick="nfOvSort(\'' + k + '\')">' + l + (sk === k ? (dir < 0 ? ' ↓' : ' ↑') : '') + '</button></th>'; };
  var role = hsrRole(), ver = role !== 'district', cols = (compact ? 4 : 6) + (ver ? 1 : 0) + (champ ? 1 : 0);
  return '<table class="nfo-t hs-ft hs-rt' + (compact ? ' cmp' : '') + '"><thead><tr>' + th('name', 'Facility') + (compact ? '' : th('day', 'Day · phase')) + th('readiness', 'Readiness (baseline → now)') + '<th>Result</th>' + (compact ? '' : '<th class="c">On time</th>') + th('overdue', 'Overdue actions', 'c') + (ver ? th('verify', 'To verify', 'c') : '') + (champ ? '<th></th>' : '') + '</tr></thead><tbody>'
    + (sorted.length ? hsrRowsGrouped(sorted, cols, function (o) { var ch = o.pct != null && o.base != null ? o.pct - o.base : null, J = hsJ(o.code);
      return '<tr class="nfo-row' + (o.behind ? ' hs-warn' : '') + '" onclick="' + (champ ? "nfChampFacility('" + J + "')" : "scDrillIn('" + J + "')") + '"><td data-l=""><b>' + hsE(o.name) + '</b> ' + hsTypeChip(o.type) + '<small>' + hsE([o.district || o.code, o.inCharge ? o.inChargeLabel + ' ' + o.inCharge : 'No ' + o.inChargeLabel + ' yet'].join(' · ')) + '</small>' + (compact ? '<small>' + (o.phase === 'notstarted' ? 'Not started · ' + (o.f.startDate ? 'starts ' + hsE(hsShortDate(o.f.startDate)) : 'start date not set') : 'Day ' + (o.phase === 'catchup' ? o.days : o.day) + ' · ' + hsE(HS_PHASE[o.phase])) + (o.onTime != null ? ' · ' + o.onTime + '% on time' : '') + '</small>' : '') + '</td>'
        + (compact ? '' : '<td data-l="Day">' + (o.phase === 'notstarted' ? 'Not started<small>' + (o.f.startDate ? 'starts ' + hsE(hsShortDate(o.f.startDate)) : 'start date not set') + '</small>' : 'Day ' + (o.phase === 'catchup' ? o.days : o.day) + '<small>' + hsE(HS_PHASE[o.phase]) + '</small>') + '</td>')
        + '<td data-l="Readiness">' + (o.pct == null ? '<span class="hs-dim">' + (o.loading ? 'Loading…' : o.phase === 'notstarted' ? 'Not assessed yet' : 'No cards yet') + '</span>' : (o.base != null ? o.base + '% → ' : '') + '<b>' + o.pct + '%</b>' + (ch != null ? ' <b class="' + (ch > 0 ? 'up' : ch < 0 ? 'down' : '') + '">' + (ch > 0 ? '+' : '') + ch + '</b>' : '') + (o.cov != null ? '<small>' + o.cov + '% checked</small>' : '')) + '</td>'
        + '<td data-l="Result">' + hsResult(o) + '</td>' + (compact ? '' : '<td data-l="On time" class="c' + (o.behind ? ' red' : '') + '">' + (o.onTime == null ? '—' : o.onTime + '%') + '</td>') + '<td data-l="Overdue actions" class="c' + (o.overdue ? ' red' : '') + '">' + (o.overdue || 0) + '</td>'
        + (ver ? '<td data-l="To verify" class="c">' + (o.toVerify || 0) + '</td>' : '')
        + (champ ? '<td class="nfo-acts"><button type="button" class="hs-btn" onclick="event.stopPropagation();scqOpenActionPlan(\'' + J + '\')">Action Plan</button><button type="button" class="hs-btn p" onclick="event.stopPropagation();scqEditSession(null,\'' + J + '\')">' + (o.next ? 'Session ' + hsE(hsShortDate(String(o.next.startAt || '').slice(0, 10))) : 'Plan session') + '</button></td>' : '') + '</tr>'; })
      : '<tr><td colspan="' + cols + '" class="nfo-empty">' + (_nfOv.q ? 'No facility matches "' + hsE(_nfOv.q) + '".' : 'No facility matches these filters.') + '</td></tr>') + '</tbody></table>';
}
// Overview: the old table in nfOverviewHTML becomes the shared one
(function () {
  if (typeof nfTableHTML !== 'function') return;
  var oT = nfTableHTML;
  nfTableHTML = function (rows, champ) { if (!hsrOn() && !champ) return oT.apply(this, arguments);
    try { return hsrTableHTML(hsrFilter(rows.map(function (r) { return hsrInfo(r, champ); })), champ, true); } catch (e) { console.warn('[HSR] table', e); return oT.apply(this, arguments); } };
})();
// Facilities page (Supervisor · District Admin)
function hsrBox(id, v) { var main = document.querySelector('#admin-app .admin-main'); if (!main) return null; var b = document.getElementById(id); if (!b) { b = document.createElement('div'); b.id = id; b.dataset.nfv = v; b.className = 'hs-page'; main.insertBefore(b, main.firstChild); } return b; }
function hsrSet(k, v) { if (k === 'q') _nfOv.q = v; else _hsr[k] = v; hsrRenderFac(); if (k === 'q') { var i = document.getElementById('hsr-fq'); if (i) { i.focus(); try { i.setSelectionRange(v.length, v.length); } catch (e) {} } } }
function hsrRenderFac() {
  if (!hsrOn() || hsrRole() === 'champion') return; var box = hsrBox('hsr-fac', 'facilities'); if (!box) return;
  var all = nfAdminRows().map(function (r) { return hsrInfo(r, false); }), list = hsrFilter(all), dist = {}, types = {};
  all.forEach(function (o) { if (o.district) dist[o.district] = 1; types[o.type] = 1; });
  var sel = function (k, opts) { return '<select class="hs-sel" aria-label="' + k + '" onchange="hsrSet(\'' + k + '\',this.value)">' + opts.map(function (x) { return '<option value="' + hsE(x[0]) + '"' + (_hsr[k] === x[0] ? ' selected' : '') + '>' + hsE(x[1]) + '</option>'; }).join('') + '</select>'; };
  var role = hsrRole(), behind = all.filter(function (o) { return o.behind; }).length, inprog = all.filter(function (o) { return o.inProg; }).length;
  var blk = hsrBlock();
  box.innerHTML = (blk && typeof nfChcChip === 'function' ? nfChcChip() : '') + '<div class="nfo-top"><div><h1>Facilities</h1><small>' + all.length + ' ' + (blk ? 'in ' + hsE(_scSup.block || _scSup.chcName || 'the') + ' block · view only' : role === 'district' ? 'in your district · view only' : 'assigned to you') + (Object.keys(dist).length ? ' · ' + hsE(Object.keys(dist).sort().join(', ')) : '') + ' · ' + inprog + ' in programme' + (behind ? ' · ' + behind + ' behind schedule' : '') + '</small></div></div>'
    + (blk ? hsrJoinCard(all) : '') + hsrTypeTabs(all)
    + '<div class="hs-filters"><label class="hs-search"><i class="ti ti-search"></i><input id="hsr-fq" type="search" aria-label="Search facilities" placeholder="Search name, ID, in-charge" value="' + hsE(_nfOv.q || '') + '" oninput="hsrSet(\'q\',this.value)"></label>'

    + (Object.keys(dist).length > 1 ? sel('dist', [['', 'All districts']].concat(Object.keys(dist).sort().map(function (d) { return [d, d]; }))) : '')
    + sel('phase', [['', 'Any phase'], ['inprog', 'In programme'], ['notstarted', 'Not started'], ['baseline', 'Baseline'], ['impl', 'Implementation'], ['endline', 'End-line'], ['ready', 'Readiness week'], ['closing', 'Waiting for graduation'], ['graduated', 'Graduated'], ['catchup', 'Catch-up']])
    + sel('status', [['', 'Any status'], ['behind', 'Behind schedule'], ['overdue', 'Overdue actions']].concat(role === 'district' ? [] : [['verify', 'Cards to verify']]))
    + (_hsr.type || _hsr.dist || _hsr.phase || _hsr.status || _nfOv.q ? '<button type="button" class="hs-link" onclick="_hsr.type=_hsr.dist=_hsr.phase=_hsr.status=\'\';_nfOv.q=\'\';hsrRenderFac()">Clear filters</button>' : '') + '</div>'
    + (blk ? '<div class="hs-grpbar"><b>' + (_hsr.flat ? 'All facilities' : 'By PHC') + '</b><button type="button" class="hs-link" onclick="_hsr.flat=!_hsr.flat;hsrRenderFac()">' + (_hsr.flat ? 'Group by PHC' : 'Flat list') + '</button></div>' : '')
    + '<div class="nfo-card hs-tw">' + hsrTableHTML(list, false) + '</div>';
}
// Reports page (Supervisor · District Admin): the HealSol cards they may open
function hsrRenderReports() {
  if (!hsrOn() || hsrRole() === 'champion') return; var box = hsrBox('hsr-rep', 'reports'); if (!box) return;
  var role = hsrRole(), card = function (title, txt, who, btns) { return '<div class="nfo-card hs-rc"><b>' + title + '</b><p>' + txt + '</p><small>' + who + '</small><div>' + btns + '</div></div>'; };
  var b = function (l, js, p) { return '<button type="button" class="hs-btn' + (p ? ' p' : '') + '" onclick="' + js + '">' + l + '</button>'; };
  var rows = nfAdminRows(), hasSc = rows.some(function (r) { return !r.dept; }), hasDept = typeof nfDeptCodes === 'function' && nfDeptCodes().length;
  box.innerHTML = '<div class="nfo-top"><div><h1>Reports</h1><small>Your ' + rows.length + ' facilit' + (rows.length === 1 ? 'y' : 'ies') + ' · what each report contains and its format</small></div><button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh" onclick="scRefreshDashboard()"><i class="ti ti-refresh"></i></button></div><div class="hs-rg">'
    + (hasSc ? card('Facility progress — Sub-Centres', 'Readiness, baseline and change, NQAS check and actions for each of your Sub-Centres, by package and Area of Concern.', 'Printable', b('Open', "openReportModal('prog')", 1)) : '')
    + (hasDept ? card('Facility progress — UPHC · PHC · CHC', 'One row per facility: day, readiness, baseline and change, NQAS result, actions, department-days to check — with sheets by department and by Area of Concern.', 'Excel', b('Download', 'nfDeptReport()', 1)) : '')
    + card('One facility (printable)', 'A facility\'s full report: readiness, weakest Standards, gaps and actions, staff.', 'PDF / print', b('Choose facility…', "openReportModal('facility')"))
    + (role === 'district' ? card('Graduation &amp; certificates', 'Results, criteria below the mark, catch-ups, NHSRC / LaQshya / MusQan status and certificates issued, for your facilities.', 'Excel', b('Download', 'hsGradReport()', 1))
      : card('Staff &amp; roles', 'Each staff member\'s cards, verification and readiness, by role.', 'Printable', b('Open', "openReportModal('role')", 1)))
    + '</div>';
}
(function () {
  if (typeof nfAdminView !== 'function') return;
  var oV = nfAdminView;
  nfAdminView = function (v) { var r = oV.apply(this, arguments);
    try { document.body.classList.toggle('hs-roles', hsrOn()); if (hsrOn()) { if (v === 'facilities') hsrRenderFac(); else if (v === 'reports') hsrRenderReports(); } } catch (e) { console.warn('[HSR] view', e); }
    return r; };
  if (typeof nfRenderOverview === 'function') { var oO = nfRenderOverview;
    nfRenderOverview = function () { var r = oO.apply(this, arguments);
      try { document.body.classList.toggle('hs-roles', hsrOn()); if (hsrOn() && hsrRole() !== 'champion') { if (_nfOv.view === 'facilities') hsrRenderFac(); if (_nfOv.view === 'reports') hsrRenderReports(); } } catch (e) {}
      return r; }; }
})();

// type tabs (28 Oct 2026): All · CHC · PHC · SC (· UPHC) with counts, on the Supervisor / District Admin / MOIC lists
function hsrTypeTabs(all) {
  var c = { '': all.length }; all.forEach(function (o) { c[o.type] = (c[o.type] || 0) + 1; });
  var ts = ['chc', 'phc', 'sc'].concat(c.uphc ? ['uphc'] : []).filter(function (t) { return !hsrBlock() || t !== 'uphc'; });
  return '<div class="rg-types hsr-types" role="tablist" aria-label="Facility type">' + [['', 'All']].concat(ts.map(function (t) { return [t, hsShort(t)]; })).map(function (x) {
    return '<button type="button" role="tab" aria-selected="' + ((_hsr.type || '') === x[0]) + '" class="' + ((_hsr.type || '') === x[0] ? 'on' : '') + '" onclick="hsrSet(\'type\',\'' + x[0] + '\')">' + hsE(x[1]) + ' <em>' + (c[x[0]] || 0) + '</em></button>'; }).join('') + '</div>';
}
// MOIC of a CHC that is not in NQAS FAST yet: a way to ask (28 Oct 2026)
function hsrJoinCard(all) {
  var s = _scSup || {}; if (all.some(function (o) { return o.type === 'chc'; })) return '';
  return '<div class="nfo-card hsr-join"><div><b>Bring ' + hsE(s.chcName || 'your CHC') + ' into NQAS FAST</b><small>Your block view shows the Sub-Centres and PHCs already in the programme. Your CHC is not enrolled yet — its staff, cards and readiness start once it joins.</small></div>'
    + '<button type="button" class="hs-btn p" onclick="nfJoinAsk(\'chc\',\'' + hsJ(s.chcName || '') + '\',\'' + hsJ(s.chcNin || '') + '\',\'' + hsJ(s.block || '') + '\')">Request to join</button></div>';
}
async function nfJoinAsk(kind, name, nin, block) {
  var me = (typeof _scSup !== 'undefined' && _scSup) || {}, fac = null;
  try { if (typeof _nfLogin !== 'undefined' && _nfLogin && _nfLogin.id) me = Object.assign({ mobile: /^\d{10}$/.test(_nfLogin.id) ? _nfLogin.id : '' }, me); } catch (e) {}
  try { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}; fac = F[Object.keys(F)[0]] || null; } catch (e) {}
  var v = await scDialog({ title: 'Request to join NQAS FAST', icon: '🏥', okLabel: 'Send request',
    message: 'HealSol Academy will contact you to bring ' + (name || ('your ' + kind.toUpperCase())) + ' into NQAS FAST.',
    fields: [{ key: 'name', label: 'Your name', value: me.name || '', required: true }, { key: 'mobile', label: 'Your mobile', type: 'tel', value: me.mobile || '', required: true },
      { key: 'msg', label: 'Message (optional)', type: 'textarea', value: '' }],
    validate: function (x) { return /^\d{10}$/.test(String(x.mobile || '').replace(/\D/g, '').slice(-10)) && String(x.name || '').trim() ? null : 'Enter your name and 10-digit mobile number.'; } });
  if (!v) return;
  try { await nfCall('submitEnquiry', { orgName: name || kind.toUpperCase(), contactName: v.name, mobile: String(v.mobile).replace(/\D/g, '').slice(-10), district: (fac && fac.district) || me.district || '', state: (fac && fac.state) || me.state || '',
    designation: kind === 'chc' ? 'MOIC' : 'Medical Officer', source: 'join', ftype: kind, nin: nin || '', block: block || '', message: (v.msg || '') + ' [Request to bring ' + (name || kind.toUpperCase()) + (nin ? ' · NIN ' + nin : '') + (block ? ' · ' + block + ' block' : '') + ' into NQAS FAST]' });
    showToast('Request sent — HealSol Academy will contact you.', 'ok'); }
  catch (e) { showToast(typeof nfErrText === 'function' ? nfErrText(e) : 'Could not send.', 'err'); }
}
