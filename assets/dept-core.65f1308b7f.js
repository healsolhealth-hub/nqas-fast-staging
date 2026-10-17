// ══════════════════════════════════════════════════════════════
// DEPARTMENT CORE (phase 3) — UPHC now; PHC / CHC later with their own settings and checklist.
// Registered as core 'dept' (NF_LEVELS.uphc.core). Opened by nfGo for a staff member of a facility of that type.
// Screens (#nf-dept-app, full screen): Today (my departments' cards for the programme day) · Readiness (department ×
// Area of Concern) · Set-up (in-charge: start date, departments, leads, teams) · Me.
// Data
//   sc_facilities/{code}/startDate            one date for all departments (baseline starts together)
//   sc_facilities/{code}/depts/{dept}         {lead: mobile, team: {mobile: true}, off: true?}  (in-charge writes)
//   sc_dcards/{code}/{dept}/day_{n}           {s: {checkpoint: 2|1|0}, note: {checkpoint: text}, at, by, byName,
//                                              done: {at, by, byName}, verified: {at, by, byName, role},
//                                              sentBack: {at, by, byName, reason}}
// Scores: 2 Met · 1 Partial · 0 Not met. Who works on a card: its team, its lead, the in-charge and the MO in-charge
// (rules: DEPT_MEMBER). Who verifies: its lead, the in-charge, the MO in-charge. A verified card cannot be changed.
// The first time the in-charge opens the app, the default leads and teams (settings) are saved for every department.
// ══════════════════════════════════════════════════════════════
var _nd = null;
var ND_SCORE = [{ v: 2, k: 'met', t: 'Met' }, { v: 1, k: 'part', t: 'Partial' }, { v: 0, k: 'not', t: 'Not met' }];
var ND_PHASE = { baseline: 'Baseline', impl: 'Implementation', endline: 'End-line', ready: 'Readiness week', before: 'Not started', after: 'Programme closed' };
var ND_METHOD = { SI: 'Staff interview', RR: 'Record review', OB: 'Observation', PI: 'Patient interview' };

function ndEsc(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
// own toast: the SC showToast lives in a Sub-Centre data file that a UPHC never loads
var _ndToastT = null;
function ndToast(m, t) {
  var el = document.getElementById('toast');
  if (!el) { try { if (typeof showToast === 'function') showToast(m, t); } catch (e) {} return; }
  el.className = 'toast show' + (t ? ' ' + t : ''); el.textContent = String(m || '');
  clearTimeout(_ndToastT); _ndToastT = setTimeout(function () { el.classList.remove('show'); }, 3200);
}
function ndMob() { return (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || ''; }
function ndPath(p) { return 'sc_dcards/' + _nd.code + (p ? '/' + p : ''); }

// ── who is who ──
function ndStaff() { var s = (_nd.fac && _nd.fac.staff) || {}, out = {}; Object.keys(s).forEach(function (m) { if (s[m] && !s[m].disabled) out[m] = s[m]; }); return out; }
function ndRole(mob) { var st = ndStaff()[mob]; return st ? (st.role || _nd.cfg.inCharge) : ''; }
function ndIsInCharge(mob) { return ndRole(mob) === _nd.cfg.inCharge; }
function ndSeesAll(mob) { return (_nd.cfg.seeAll || []).indexOf(ndRole(mob)) >= 0; }
function ndDeptDefs() { return (_nd.cfg.departments || []).filter(function (d) { var s = ((_nd.fac.depts || {})[d.id]) || {}; return !s.off; }); }
function ndDeptSet(id) { return ((_nd.fac.depts || {})[id]) || {}; }
function ndLead(id) { return ndDeptSet(id).lead || ''; }
function ndTeam(id) { return ndDeptSet(id).team || {}; }
function ndDeptDef(id) { return (_nd.cfg.departments || []).find(function (x) { return x.id === id; }) || { id: id, name: id }; }
function ndIsMember(id, mob) { return !!(ndTeam(id)[mob] || ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndCanVerify(id, mob) { return !!(ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndName(mob) { var st = ndStaff()[mob]; return (st && st.name) || mob || ''; }
function ndRoleLabel(r) { var x = (_nd.cfg.roles || []).find(function (y) { return y.id === r; }); return x ? x.label : r; }
// the default leads and teams from the settings, for departments the in-charge has not set up yet
function ndDefaults() {
  var staff = ndStaff(), byName = Object.keys(staff).sort(function (a, b) { return String(staff[a].name || '').localeCompare(String(staff[b].name || '')); });
  var out = {};
  (_nd.cfg.departments || []).forEach(function (d) {
    var lead = byName.find(function (m) { return (staff[m].role || _nd.cfg.inCharge) === d.lead; }) || byName.find(function (m) { return ndIsInCharge(m); }) || '';
    var team = {}; byName.forEach(function (m) { var r = staff[m].role || _nd.cfg.inCharge; if (((_nd.cfg.defaultTeams || {})[r] || []).indexOf(d.id) >= 0) team[m] = true; });
    var xr = (_nd.cfg.xcheckDepts || []).indexOf(d.id) >= 0 ? byName.find(function (m) { return (_nd.cfg.xcheckRoles || []).indexOf(staff[m].role) >= 0; }) : null;
    out[d.id] = { lead: lead || null, team: team }; if (xr) out[d.id].checker = xr;
  });
  return out;
}

// ── open / close ──
async function ndOpen(acc) {
  var code = acc.code, me = ndMob(), cfg = NF_CFG;
  var fac = await fbGet(scFacilityPath(code));
  if (!fac) return 'Facility not found.';
  var st = (fac.staff || {})[me]; if (!st || st.disabled) return 'You are not on this facility\'s staff list.';
  var cl; try { cl = await nfLoadData(cfg.checklist); } catch (e) { return 'The ' + cfg.name + ' checklist could not be loaded. Check the internet and try again.'; }
  _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: {}, pcards: {}, actions: {}, sel: {}, tab: 'today', card: null };
  (cfg.departments || []).forEach(function (d) { _nd.plan[d.id] = nfDeptBaseline(cl.items, d.id); });
  _nd.byId = {}; cl.items.forEach(function (r) { _nd.byId[r[0]] = r; });
  // first open by the in-charge: save the default departments set-up
  if (ndIsInCharge(me) && !fac.depts) {
    var def = ndDefaults();
    try { await db.ref(scFacilityPath(code) + '/depts').set(def); _nd.fac.depts = def; } catch (e) { console.warn('[dept] defaults not saved', e); }
  }
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) { _nd.cards = {}; }
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) { _nd.actions = {}; }
  try { _nd.pcards = (await fbGet('sc_pcards/' + code)) || {}; } catch (e) { _nd.pcards = {}; }
  ndQStart();
  var ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'none';
  ndShow(); return '';
}
function ndShow() {
  var app = document.getElementById('nf-dept-app');
  if (!app) { app = document.createElement('div'); app.id = 'nf-dept-app'; document.body.appendChild(app); }
  app.style.display = 'block'; document.body.classList.add('nd-on'); ndRender(); try { window.scrollTo(0, 0); } catch (e) {}
}
function ndClose() { var app = document.getElementById('nf-dept-app'); if (app) app.style.display = 'none'; document.body.classList.remove('nd-on'); }
async function ndLogout() {
  ndClose(); _nd = null; var ls = document.getElementById('login-screen'); if (ls) ls.style.display = '';
  try { await nfSecureSignOut(); } catch (e) {} try { nfBack(); } catch (e) {}
}
async function ndReload() { if (!_nd) return; _nd.fac = (await fbGet(scFacilityPath(_nd.code))) || _nd.fac; _nd.cards = (await fbGet(ndPath())) || {}; try { _nd.actions = (await fbGet('sc_dactions/' + _nd.code)) || {}; } catch (e) {} try { _nd.pcards = (await fbGet('sc_pcards/' + _nd.code)) || {}; } catch (e) {} ndRender(); }

// ── programme day ──
function ndDay() { return nfDeptDayNo(_nd.fac.startDate); }
function ndDayInfo(dept, day) { return nfDeptDay(_nd.plan[dept], day); }
// ── render ──
function ndRender() {
  var app = document.getElementById('nf-dept-app'); if (!app || !_nd) return;
  if (_nd.card) { app.innerHTML = ndCardHTML(); ndQBadge(); return; }
  var me = ndMob(), tabs = [['today', 'ti-home', 'Today'], ['cards', 'ti-cards', 'Cards'], ['ready', 'ti-chart-bar', 'Progress'], ['actions', 'ti-checklist', 'Actions']];   // SC staff tabs + Actions
  if (!_nd.view && ndIsInCharge(me)) tabs.push(['setup', 'ti-settings', 'Set-up']);
  if (!_nd.view) tabs.push(['me', 'ti-user', 'Me']);
  var day = ndDay(), info = nfDeptDay(_nd.plan[(_nd.cfg.departments[0] || {}).id] || [[], [], [], [], [], [], []], day);
  var hd = '<header class="nd-hd">' + (_nd.view ? '<button type="button" class="nd-ib" aria-label="Back to the facility list" title="Back" onclick="ndCloseView()"><i class="ti ti-arrow-left"></i></button>' : '') + '<div><small>' + ndEsc(_nd.cfg.name) + ' · ' + ndEsc(_nd.code) + '</small><b>' + ndEsc(_nd.fac.name || _nd.code) + '</b>'
    + '<span class="nd-sub">' + (_nd.fac.startDate ? (day >= 1 && day <= _nd.cfg.days ? 'Day ' + day + ' of ' + _nd.cfg.days + ' · ' + ND_PHASE[info.phase] : ND_PHASE[info.phase]) : 'Start date not set') + '</span></div>'
    + '<span class="nd-qb" id="nd-q" hidden></span><button type="button" class="nd-ib" aria-label="Refresh" title="Refresh" onclick="ndReload()"><i class="ti ti-refresh"></i></button></header>';
  var body = _nd.tab === 'cards' ? ndCardsHTML() : _nd.tab === 'ready' ? ndReadyHTML() : _nd.tab === 'actions' ? ndActionsHTML() : _nd.tab === 'setup' ? ndSetupHTML() : _nd.tab === 'me' ? ndMeHTML() : ndTodayHTML();
  var nav = '<nav class="nd-nav">' + tabs.map(function (t) { return '<button type="button" class="' + (_nd.tab === t[0] ? 'on' : '') + '" onclick="ndTab(\'' + t[0] + '\')"><i class="ti ' + t[1] + '"></i><span>' + t[2] + '</span></button>'; }).join('') + '</nav>';
  if (!_nd.view && (_nd.tab === 'today' || _nd.tab === 'cards') && _nd.fac.startDate) hd = '';   // SC design: these tabs carry their own heading
  app.innerHTML = hd + '<main class="nd-main">' + body + '</main>' + nav; ndQBadge();
}
function ndTab(t) { if (t === 'timeline' || t === 'day') { _nd.cv = t === 'timeline' ? 'timeline' : 'day'; t = 'cards'; } _nd.tab = t; _nd.card = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} if (t === 'cards') ndScrollStrip(); }
function ndScrollStrip() { try { var el = document.querySelector('#nd-ds .scb2-sel, #nd-ds .today-ring'); if (el) el.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {} }

// ── readiness: department × Area of Concern ──
function ndReadyHTML() {
  var on = ndDeptDefs().map(function (d) { return d.id; }), R = nfDeptReadiness(_nd.cl.items, ndLatest(), { pass: (_nd.cfg.passMark || {}).overall || 70, depts: on });
  var aocs = Object.keys(_nd.cl.aocs), cls = function (p) { return p === null ? 'na' : p >= 70 ? 'g' : p >= 50 ? 'a' : 'r'; };
  var cell = function (x) { return '<td class="' + cls(x && x.pct !== undefined ? x.pct : null) + '">' + (x && x.pct !== null && x.pct !== undefined ? x.pct : '–') + '</td>'; };
  var h = '<div class="nd-card nd-sum"><div><b>' + (R.overall === null ? '–' : R.overall + '%') + '</b><small>overall</small></div><div><b>' + R.n + '</b><small>of ' + R.of + ' assessed</small></div>'
    + '<div><b class="' + (R.meets ? 'ok' : '') + '">' + (R.meets ? 'Meets' : R.n < R.of ? 'In progress' : 'Not yet') + '</b><small>70% overall · each department · each Area of Concern</small></div></div>';
  h += '<div class="nd-grid"><table><thead><tr><th>Dept</th>' + aocs.map(function (a) { return '<th title="' + ndEsc(_nd.cl.aocs[a]) + '">' + a + '</th>'; }).join('') + '<th>All</th></tr></thead><tbody>';
  ndDeptDefs().forEach(function (d) { var x = R.byDept[d.id] || {}; h += '<tr><th title="' + ndEsc(d.name) + '">' + ndEsc(d.id) + '</th>' + aocs.map(function (a) { return cell((x.byAoc || {})[a]); }).join('') + cell(x) + '</tr>'; });
  h += '<tr class="tot"><th>All</th>' + aocs.map(function (a) { return cell(R.byAoc[a]); }).join('') + cell({ pct: R.overall }) + '</tr></tbody></table></div>';
  h += '<div class="nd-legend"><span class="g">≥ 70</span><span class="a">50–69</span><span class="r">&lt; 50</span><span class="na">not assessed</span> · latest score of each checkpoint, % of the maximum</div>';
  return h;
}

// ── set-up (in-charge) ──
function ndStartForm() {
  return '<div class="nd-row"><input type="date" id="nd-start" class="nd-in" value="' + ndEsc(_nd.fac.startDate || '') + '"><button type="button" class="nd-btn" onclick="ndSaveStart()">Save</button></div>';
}
async function ndSaveStart() {
  var v = (document.getElementById('nd-start') || {}).value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) { ndToast('Choose a date.', 'err'); return; }
  if (_nd.fac.startDate && nfDeptDayNo(_nd.fac.startDate) >= 1 && !(await showConfirm('The programme has already started. Change the start date for all departments?', '📅', 'Change start date', 'Change', 'var(--teal)'))) return;
  try { await db.ref(scFacilityPath(_nd.code) + '/startDate').set(v); _nd.fac.startDate = v; ndToast('Start date saved.', 'ok'); ndRender(); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}
function ndSetupHTML() {
  var staff = ndStaff(), mobs = Object.keys(staff).sort(function (a, b) { return String(staff[a].name || '').localeCompare(String(staff[b].name || '')); });
  var h = '<div class="nd-sec"><b>Programme start date</b><small>One date for all departments</small></div><div class="nd-card">' + ndStartForm() + '</div>'
    + ndStaffHTML()
    + '<div class="nd-sec"><b>Departments</b><small>Lead verifies the daily card · team fills it</small></div>';
  (_nd.cfg.departments || []).forEach(function (d) {
    var set = ndDeptSet(d.id), team = set.team || {};
    h += '<details class="nd-card nd-dset" id="nd-dset-' + d.id + '"><summary><span class="nd-dk">' + ndEsc(d.id) + '</span><span class="nd-dn"><b>' + ndEsc(d.name) + (set.off ? ' (off)' : '') + '</b><small>Lead: ' + ndEsc(set.lead ? ndName(set.lead) : '—') + ' · team ' + Object.keys(team).length + '</small></span></summary>'
      + '<label class="nd-chk"><input type="checkbox" data-k="off"' + (set.off ? ' checked' : '') + '> Not at this facility (switch off)</label>'
      + '<label class="nd-lbl">Lead<select class="nd-in" data-k="lead"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + (set.lead === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<label class="nd-lbl">Checker — compares the cards (blank: the lead)<select class="nd-in" data-k="checker"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + ((set.checker || set.xcheck) === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<div class="nd-lbl">Team</div><div class="nd-team">' + mobs.map(function (m) { return '<label class="nd-chk"><input type="checkbox" data-team="' + m + '"' + (team[m] ? ' checked' : '') + '> ' + ndEsc(staff[m].name || m) + ' <small>' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</small></label>'; }).join('') + '</div>'
      + '<button type="button" class="nd-btn" onclick="ndSaveDept(\'' + d.id + '\')">Save ' + ndEsc(d.id) + '</button></details>';
  });
  return h;
}
async function ndSaveDept(id) {
  var box = document.getElementById('nd-dset-' + id); if (!box) return;
  var rec = { lead: box.querySelector('[data-k=lead]').value || null, team: {}, off: box.querySelector('[data-k=off]').checked || null, checker: box.querySelector('[data-k=checker]').value || null };
  [].forEach.call(box.querySelectorAll('[data-team]'), function (c) { if (c.checked) rec.team[c.getAttribute('data-team')] = true; });
  try { await db.ref(scFacilityPath(_nd.code) + '/depts/' + id).set(rec); _nd.fac.depts = _nd.fac.depts || {}; _nd.fac.depts[id] = rec; ndToast(id + ' saved.', 'ok'); ndRender(); }
  catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}

// ── staff (in-charge): add, reset password, remove — through the server (createAccount / resetPassword / removeStaff) ──
function ndStaffRoles() { return (_nd.cfg.roles || []).filter(function (r) { return r.id !== _nd.cfg.inCharge; }); }
function ndStaffHTML() {
  var staff = ndStaff(), me = ndMob(), mobs = Object.keys(staff).sort(function (a, b) { return String(staff[a].name || '').localeCompare(String(staff[b].name || '')); });
  var h = '<div class="nd-sec"><b>Staff</b><small>' + mobs.length + ' · each gets their own login</small></div><div class="nd-card nd-staff">';
  mobs.forEach(function (m) {
    var st = staff[m], ic = ndIsInCharge(m);
    h += '<div class="nd-srow"><span class="nd-dn"><b>' + ndEsc(st.name || m) + '</b><small>' + ndEsc(ndRoleLabel(st.role || _nd.cfg.inCharge)) + ' · ' + ndEsc(m) + '</small></span>'
      + (ic || m === me ? '' : '<button type="button" class="nd-ib2" title="Reset password" aria-label="Reset password" onclick="ndResetStaff(\'' + m + '\')"><i class="ti ti-key"></i></button>'
        + '<button type="button" class="nd-ib2 red" title="Remove" aria-label="Remove" onclick="ndRemoveStaff(\'' + m + '\')"><i class="ti ti-trash"></i></button>') + '</div>';
  });
  h += '<details class="nd-add" id="nd-add"><summary class="nd-btn ghost"><i class="ti ti-user-plus"></i> Add staff</summary>'
    + '<label class="nd-lbl">Role<select class="nd-in" id="nd-add-role">' + ndStaffRoles().map(function (r) { return '<option value="' + ndEsc(r.id) + '">' + ndEsc(r.label) + '</option>'; }).join('') + '</select></label>'
    + '<label class="nd-lbl">Full name<input class="nd-in" id="nd-add-name" maxlength="60" autocomplete="off"></label>'
    + '<label class="nd-lbl">Mobile number (their login ID)<input class="nd-in" id="nd-add-mob" inputmode="numeric" maxlength="10" autocomplete="off"></label>'
    + '<div class="nd-err" id="nd-add-err" role="alert"></div>'
    + '<button type="button" class="nd-btn" id="nd-add-go" onclick="ndAddStaff()">Add and get login</button>'
    + '<p class="nd-dim">They are put on their usual departments automatically; change it below under Departments.</p></details></div>';
  return h;
}
// a new person joins the departments their role usually works on, and leads a department whose usual lead role is theirs
// while it is still led by the in-charge (the default when nobody of that role existed yet)
function ndJoinDefaults(mob, role) {
  var out = {};
  (_nd.cfg.departments || []).forEach(function (d) {
    var cur = ndDeptSet(d.id), rec = { lead: cur.lead || null, team: Object.assign({}, cur.team || {}), off: cur.off || null, checker: cur.checker || cur.xcheck || null }, ch = false;
    if ((_nd.cfg.xcheckDepts || []).indexOf(d.id) >= 0 && (_nd.cfg.xcheckRoles || []).indexOf(role) >= 0 && !rec.checker) { rec.checker = mob; ch = true; }
    if (((_nd.cfg.defaultTeams || {})[role] || []).indexOf(d.id) >= 0 && !rec.team[mob]) { rec.team[mob] = true; ch = true; }
    if (d.lead === role && (!rec.lead || ndIsInCharge(rec.lead))) { rec.lead = mob; ch = true; }
    if (ch) out[d.id] = rec;
  });
  return out;
}
// someone leaves: off every team; a department they led goes back to the in-charge
function ndLeaveDepts(mob) {
  var out = {}, ic = Object.keys(ndStaff()).find(function (m) { return ndIsInCharge(m); }) || null;
  (_nd.cfg.departments || []).forEach(function (d) {
    var cur = ndDeptSet(d.id), ck = cur.checker || cur.xcheck || null; if (!(cur.team || {})[mob] && cur.lead !== mob && ck !== mob) return;
    var rec = { lead: cur.lead === mob ? ic : (cur.lead || null), team: Object.assign({}, cur.team || {}), off: cur.off || null, checker: ck === mob ? null : ck }; delete rec.team[mob]; out[d.id] = rec;
  });
  return out;
}
async function ndSaveDepts(map) {
  var ids = Object.keys(map); if (!ids.length) return;
  var up = {}; ids.forEach(function (id) { up[id] = map[id]; });
  await db.ref(scFacilityPath(_nd.code) + '/depts').update(up);
  _nd.fac.depts = _nd.fac.depts || {}; ids.forEach(function (id) { _nd.fac.depts[id] = map[id]; });
}
async function ndAddStaff() {
  var g = function (id) { return ((document.getElementById(id) || {}).value || '').trim(); }, err = document.getElementById('nd-add-err'), btn = document.getElementById('nd-add-go');
  var bad = function (m) { if (err) { err.textContent = m; err.style.display = 'block'; } };
  var role = g('nd-add-role'), name = g('nd-add-name'), mob = g('nd-add-mob').replace(/\D/g, '');
  if (!name) return bad('Name is required.'); if (!/^\d{10}$/.test(mob)) return bad('Enter a valid 10-digit mobile number.');
  if (ndStaff()[mob]) return bad('This mobile number is already on the staff list.');
  if (btn) btn.disabled = true;
  try {
    var r = await nfCall('createAccount', { kind: 'staff', code: _nd.code, role: role, mobile: mob, name: name });
    _nd.fac.staff = _nd.fac.staff || {}; _nd.fac.staff[mob] = { name: name, mobile: mob, role: role };
    try { await ndSaveDepts(ndJoinDefaults(mob, role)); } catch (e) { console.warn('[dept] departments not updated', e); ndToast('Added — set their departments below.', 'err'); }
    ndRender(); nfShowTempPassword(name, r.identifier, r.tempPassword, name + ' added');
  } catch (e) { bad(nfErrText(e)); if (btn) btn.disabled = false; }
}
async function ndResetStaff(mob) {
  var nm = ndName(mob);
  if (!(await showConfirm('Give ' + nm + ' a new temporary password? They will be signed out and choose a new password at their next login.', '🔑', 'Reset password', 'Reset', 'var(--teal)'))) return;
  try { var r = await nfCall('resetPassword', { identifier: mob, code: _nd.code }); nfShowTempPassword(nm, r.identifier, r.tempPassword, 'Password reset'); } catch (e) { ndToast(nfErrText(e), 'err'); }
}
async function ndRemoveStaff(mob) {
  var nm = ndName(mob);
  if (!(await showConfirm('Remove ' + nm + '? Their work so far is kept; they can no longer log in to this UPHC. Departments they led go back to you.', '🗑️', 'Remove staff', 'Remove', 'var(--red-dk)'))) return;
  var move = ndLeaveDepts(mob);
  try {
    await nfCall('removeStaff', { code: _nd.code, mobile: mob });
    try { await ndSaveDepts(move); } catch (e) { console.warn('[dept] departments not updated', e); }
    if (_nd.fac.staff && _nd.fac.staff[mob]) _nd.fac.staff[mob].disabled = true;
    ndToast(nm + ' removed.', 'ok'); ndRender();
  } catch (e) { ndToast(nfErrText(e), 'err'); }
}

// ── me ──
function ndMeHTML() {
  var me = ndMob(), st = ndStaff()[me] || {};
  return '<div class="nd-card"><b>' + ndEsc(st.name || me) + '</b><p>' + ndEsc(ndRoleLabel(st.role || _nd.cfg.inCharge)) + ' · ' + ndEsc(_nd.fac.name || _nd.code) + '</p>'
    + '<p class="nd-dim">My departments: ' + (ndMyDepts().map(function (d) { return ndEsc(d.name); }).join(', ') || '—') + '</p></div>'
    + '<div class="nd-card nd-rows"><button type="button" onclick="nfChangeMyPassword()"><i class="ti ti-key"></i>Change my password</button>'
    + '<button type="button" onclick="ndLogout()"><i class="ti ti-logout"></i>Logout</button></div>';
}

// ── dates ──
function ndToday() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndAddDays(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? m[3] + '-' + m[2] + '-' + m[1] : (iso || ''); }   // 2026-10-23 → 23-10-2026
function ndWeekEnd() { var d = new Date(), add = (7 - d.getDay()) % 7; return ndAddDays(ndToday(), add); }   // this Sunday
function ndCpText(id) { var r = _nd.byId[id]; return r ? r[5] : id; }

// ── Supervisor / HealSol / District: open a department-core facility from the facility list (no staff login) ──
async function ndOpenView(code) {
  var fac = null; try { fac = await fbGet(scFacilityPath(code)); } catch (e) {}
  if (!fac) { ndToast('Facility not found.', 'err'); return; }
  var t = nfTypeOf(fac), cfg = NF_LEVELS[t]; if (!cfg || cfg.core !== 'dept') return;
  var cl; try { cl = await nfLoadData(cfg.checklist); } catch (e) { ndToast('The ' + cfg.name + ' checklist could not be loaded. Check the internet and try again.', 'err'); return; }
  nfSetLevel(t);
  var claims = (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims) || {}, sup = (typeof appMode !== 'undefined' && appMode === 'sc-supervisor') ? claims.sup : null, supName = '';
  if (sup) { try { supName = ((await fbGet('sc_supervisors/' + sup)) || {}).name || ''; } catch (e) {} }
  _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: {}, pcards: {}, actions: {}, sel: {}, tab: sup ? 'actions' : 'today', card: null, view: sup ? 'sup' : 'view', supId: sup, supName: supName };
  (cfg.departments || []).forEach(function (d) { _nd.plan[d.id] = nfDeptBaseline(cl.items, d.id); });
  _nd.byId = {}; cl.items.forEach(function (r) { _nd.byId[r[0]] = r; });
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) {}
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) {}
  try { _nd.pcards = (await fbGet('sc_pcards/' + code)) || {}; } catch (e) {}
  ndShow();
}
function ndCloseView() { ndClose(); _nd = null; nfSetLevel(NF_LEVEL_DEFAULT); try { if (typeof scRenderMasterDashboard === 'function') scRenderMasterDashboard(); } catch (e) {} }

// ── HealSol / Supervisor facility list: card for a department-core facility (UPHC …) — no Sub-Centre figures ──
function nfDeptFacCardHTML(code, fac, LV, adminBtns) {
  var e = ndEsc, prog = (LV.programmes || []).find(function (p) { return p.id === fac.progId; });
  var pkg = prog ? String(prog.label).replace(/^[^—]*—\s*/, '').replace(/\s*\(\d+ days\)\s*$/, '') : (fac.progId || '—');
  var staffN = Object.keys(fac.staff || {}).filter(function (m) { return fac.staff[m] && !fac.staff[m].disabled; }).length;
  var day = fac.startDate ? nfDeptDayNo(fac.startDate) : null, days = LV.days || 60;
  var when = !fac.startDate ? 'Start date not set' : day < 1 ? 'Starts ' + ndDate(fac.startDate) : day > days ? 'Programme complete' : 'Day ' + day + ' of ' + days;
  var pct = day && day > 0 ? Math.min(100, Math.round(Math.min(day, days) / days * 100)) : 0;
  var chip = function (t, bg, fg) { return ' <span style="background:' + bg + ';color:' + fg + ';border-radius:8px;padding:1px 6px;font-size:8px;font-weight:800;">' + t + '</span>'; };
  return '<div class="mfc-top"><div class="mfc-icon">🏥</div><div style="flex:1;min-width:0;">'
    + '<div class="mfc-name">' + e(fac.name || code) + chip(e(LV.short || LV.name), '#E6F2EF', '#1E6B5E')
    + (fac.suspended ? chip('Suspended', '#FEF3C7', '#92400E') : '')
    + (fac.isDemo ? chip(fac.subscriptionStatus === 'paid' ? 'SELF-REGISTERED · PAID' : 'FREE TRIAL', '#DBEAFE', '#1D4ED8') : fac.subscriptionStatus === 'contract' ? chip('Contract', '#EDE9FE', '#6D28D9') : '') + '</div>'
    + '<div class="mfc-loc">' + e([fac.district, fac.state].filter(Boolean).join(', ') || '—') + '</div>'
    + '<div style="font-size:9px;color:var(--teal);font-weight:700;margin-top:1px;">📋 ' + e(pkg) + ' · 👥 ' + staffN + ' staff</div>'
    + '</div><div class="mfc-pct" style="color:var(--teal);font-size:12px;">' + e(when.replace(/ of \d+$/, '')) + '</div></div>'
    + '<div style="height:6px;border-radius:10px;background:var(--br);margin:7px 0;overflow:hidden;"><div style="height:100%;border-radius:10px;width:' + pct + '%;background:var(--teal);"></div></div>'
    + '<div class="mfc-meta"><span>' + e(when) + '</span><span>' + e(LV.inChargeLabel || LV.inCharge) + ': ' + e(fac.choName || 'Not set') + '</span></div>'
    + '<div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;"><button class="mfc-btn" style="flex:2;" onclick="ndOpenView(\'' + e(code) + '\')"><i class="ti ti-zoom-in" style="font-size:11px;"></i> Open</button>' + (adminBtns || '') + '</div>';
}

nfRegisterCore('dept', { open: { staff: ndOpen } });
