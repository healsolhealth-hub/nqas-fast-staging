// ══════════════════════════════════════════════════════════════
// DEPARTMENT CORE (phase 3) — UPHC now; PHC / CHC later with their own settings and checklist.
// Registered as core 'dept' (NF_LEVELS.uphc.core). Opened by nfGo for a staff member of a facility of that type.
// Screens (#nf-dept-app, full screen; drawn by dept/screens.js): Today · Cards · Progress · Me · Set-up (in-charge) ·
// Compare the cards (checker) · Decide & assign (lead) · How to fix (Facility Supervisor).
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
var ND_PHASE = { baseline: 'Baseline', impl: 'Implementation', endline: 'End-line', ready: 'Readiness week', before: 'Not started', after: 'Programme closed', catchup: 'Catch-up', recheck: 'Catch-up re-check' };
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
  _nd.fa = ndIsInCharge(me) || ndSeesAll(me);   // the in-charge and MO in-charge open on the Facility dashboard; "My cards" for their own screens
  await ndMasterSetup(cfg, cl);
  // first open by the in-charge: save the default departments set-up
  var set0 = fac.depts || {}, hasSetup = Object.keys(set0).some(function (k) { return set0[k] && (set0[k].lead || set0[k].team); });
  if (ndIsInCharge(me) && !hasSetup) {   // first open: the default leads and teams; departments switched off at enrolment stay off
    var def = ndDefaults(); Object.keys(set0).forEach(function (k) { if (set0[k] && set0[k].off && def[k]) def[k].off = true; });
    try { await db.ref(scFacilityPath(code) + '/depts').set(def); _nd.fac.depts = def; } catch (e) { console.warn('[dept] defaults not saved', e); }
  }
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) { _nd.cards = {}; }
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) { _nd.actions = {}; }
  try { _nd.pcards = (await fbGet('sc_pcards/' + code)) || {}; } catch (e) { _nd.pcards = {}; }
  ndQStart();
  try { await ndGradLoad(); } catch (e) {}
  var ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'none';
  ndShow(); ndGradMaybe(); return '';
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
function ndDay() { if (typeof ndCuStarted === 'function' && ndCuStarted()) return ND_GRAD.cuBase + ndCuDay(); return nfDeptDayNo(_nd.fac.startDate); }   // Step 3: catch-up card days 101–128
function ndShape() { return nfDeptShape(_nd.cfg); }   // the programme's phase days (60 or 90)
function ndDayInfo(dept, day) { if (day > 100 && typeof ndCuDayInfo === 'function') return ndCuDayInfo(dept, day); return nfDeptDay(ndPlanFor(day)[dept] || [], day, ndShape()); }
// Step 2c: which version's day plan a programme day uses — the one in force on that day's date (published versions apply from
// the day after publishing, so days already reached keep their checkpoints)
function ndPlanFor(day) {
  var P = _nd.plans; if (!P || P.length < 2 || !_nd.fac.startDate) return _nd.plan;
  var date = ndAddDays(_nd.fac.startDate, day - 1), best = P[0];
  P.forEach(function (p) { if (p.from <= date && (p.from > best.from || (p.from === best.from && p.v >= best.v))) best = p; });
  return best.plan;
}
// the published checkpoint master (Step 2c): live = {v, vers:{v: from}, edits, added, moves, …}; plans/{v} = {from, d:{dept: packed plan}}.
// Kept on the phone per version (localStorage), so it is fetched again only after HealSol publishes.
function ndMcGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function ndMcSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
async function ndMasterLive(T) {
  var key = 'nd_master_' + T, cache = ndMcGet(key), v = null;
  try { v = await fbGet('shared/dept_master/' + T + '/live/v'); } catch (e) {}
  if (v == null) return cache;   // nothing published (or offline: the copy on the phone)
  if (cache && cache.v === v) return cache;
  var L = null; try { L = await fbGet('shared/dept_master/' + T + '/live'); } catch (e) {}
  if (!L) return cache;
  ndMcSet(key, L); return L;
}
async function ndMasterPlan(T, v) {
  var key = 'nd_plan_' + T + '_' + v, c = ndMcGet(key); if (c) return c;
  var p = null; try { p = await fbGet('shared/dept_master/' + T + '/plans/' + v); } catch (e) {}
  if (p) ndMcSet(key, p); return p;
}
async function ndMasterSetup(cfg, cl) {
  var T = cfg.id, S = nfDeptShape(cfg), base = cl.items, deps = cfg.departments || [];
  var basePlan = {}; deps.forEach(function (d) { basePlan[d.id] = nfDeptBaseline(base, d.id, S); });
  var L = null; try { L = await ndMasterLive(T); } catch (e) { L = null; }
  // built-in Hindi: wait for it only when the phone is in Hindi; in English it comes quietly after the card shows (speed, 26 Oct)
  if (ndLangInit() === 'hi') { try { await nfDeptHiLoad(T); } catch (e) {} }
  else setTimeout(function () { nfDeptHiLoad(T).then(function () { if (_nd && _nd.cfg && _nd.cfg.id === T) _nd.ct = {}; }).catch(function () {}); }, 4000);
  // built-in How to fix: only needed at review / actions, so it comes quietly after the card shows (27 Oct)
  setTimeout(function () { nfDeptFixLoad(T).then(function (d) { if (d && _nd && _nd.cfg && _nd.cfg.id === T && _nd.screen === 'lead' && typeof ndKeepScroll === 'function') ndKeepScroll(); }).catch(function () {}); }, 3000);
  var lay = nfDeptLayerRows(base, L || {});
  _nd.cl = Object.assign({}, cl, { items: lay.rows }); _nd.byId = lay.all; _nd.master = L ? { v: L.v, from: L.from } : null;
  _nd.live = L || {}; _nd.ct = {}; _nd.anyRoles = null; _nd.base0 = {}; base.forEach(function (r) { _nd.base0[r[0]] = r; }); _nd.lang = ndLangInit();
  _nd.plans = [{ v: 0, from: '', plan: basePlan }]; _nd.plan = basePlan;
  if (!L || !L.v) return;
  var start = (_nd.fac && _nd.fac.startDate) || '', vers = Object.keys(L.vers || {}).map(function (k) { return { v: +k, from: L.vers[k] }; }).sort(function (a, b) { return a.from < b.from ? -1 : a.from > b.from ? 1 : a.v - b.v; });
  var atStart = null; vers.forEach(function (x) { if (start && x.from <= start) atStart = x; });
  var need = vers.filter(function (x) { return !start || x.from > start || x === atStart; });
  if (!start) need = vers.slice(-1);
  for (var i = 0; i < need.length; i++) {
    var x = need[i], p = await ndMasterPlan(T, x.v), plan = {};
    if (p && p.d) deps.forEach(function (d) { plan[d.id] = p.d[d.id] ? nfDeptPlanUnpack(p.d[d.id], S) : basePlan[d.id]; });
    else if (x.v === L.v) deps.forEach(function (d) { plan[d.id] = nfDeptPlan(lay.rows, d.id, S, L.moves); });   // the newest plan can be made from live itself
    else continue;
    _nd.plans.push({ v: x.v, from: x.from, plan: plan });
  }
  _nd.plan = _nd.plans[_nd.plans.length - 1].plan;
}
// ── render ──
function ndRender() {
  var app = document.getElementById('nf-dept-app'); if (!app || !_nd) return;
  if (_nd.card) { app.innerHTML = ndCardHTML(); ndQBadge(); return; }                                   // Compare the cards (full screen)
  if (_nd.screen === 'lead' && !_nd.view) { app.innerHTML = ndLeadScreenHTML(); ndQBadge(); return; }   // Decide & assign (full screen)
  if (_nd.screen === 'grad' || _nd.screen === 'end' || _nd.screen === 'review' || _nd.screen === 'admin') { app.innerHTML = ndGradScreenHTML(); ndQBadge(); return; }   // Step 3: programme end
  if (ndFaOn()) { app.innerHTML = ndFaHTML(); ndQBadge(); return; }                                       // Facility dashboard (in-charge, MO in-charge)
  var t = _nd.tab, body = t === 'cards' ? ndCardsHTML() : t === 'ready' ? ndReadyHTML() : t === 'actions' ? ndActionsPageHTML() : t === 'setup' ? ndSetupPageHTML() : t === 'dept' ? ndDeptDashHTML()
    : t === 'me' ? ndMeHTML() : t === 'fix' ? ndSupHTML() : ndTodayHTML();
  app.innerHTML = body + ndNavHTML(); ndQBadge();   // screens: dept/screens.js
  if (t === 'cards') ndScrollStrip();
}
function ndTab(t) { if (_nd) _nd.fa = false; if (t === 'timeline' || t === 'day') { _nd.cv = t === 'timeline' ? 'timeline' : 'day'; t = 'cards'; } _nd.tab = t; _nd.card = null; _nd.screen = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndScrollStrip() { try { var box = document.getElementById('nd-ds'), el = box && box.querySelector('.sel'); if (el) box.scrollLeft = Math.max(0, el.offsetLeft - box.offsetLeft - (box.clientWidth - el.offsetWidth) / 2); } catch (e) {} }   // the chosen day in the middle of the strip

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
    + '<div class="nd-sec"><b>Departments</b><small>Staff fill · the lead compares and assigns actions</small></div>';
  (_nd.cfg.departments || []).forEach(function (d) {
    var set = ndDeptSet(d.id), team = set.team || {};
    h += '<details class="nd-card nd-dset" id="nd-dset-' + d.id + '"><summary><span class="nd-dk">' + ndEsc(d.id) + '</span><span class="nd-dn"><b>' + ndEsc(d.name) + (set.off ? ' (off)' : '') + '</b><small>Lead: ' + ndEsc(set.lead ? ndName(set.lead) : '—') + ' · ' + ndFillers(d.id).length + ' fill' + (ndSolo(d.id) ? ' (one person — counts as checked)' : '') + ' · overseen by ' + ndEsc(ndName(ndOverseer(d.id)) || '—') + '</small></span></summary>'
      + '<label class="nd-chk"><input type="checkbox" data-k="off"' + (set.off ? ' checked' : '') + '> Not at this facility (switch off)</label>'
      + '<label class="nd-lbl">Lead — compares the cards, settles disputes, assigns actions (does not fill)<select class="nd-in" data-k="lead"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + (set.lead === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<label class="nd-lbl">Cadre checker — compares first, sends real disputes to the lead (Outreach: ANM / Field Monitor; blank: the lead)<select class="nd-in" data-k="checker"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + ((set.checker || set.xcheck) === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<div class="nd-lbl">Staff posted here — they fill the card (the lead and the checker do not)</div><div class="nd-team">' + mobs.map(function (m) { return '<label class="nd-chk"><input type="checkbox" data-team="' + m + '"' + (team[m] ? ' checked' : '') + '> ' + ndEsc(staff[m].name || m) + ' <small>' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</small></label>'; }).join('') + '</div>'
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
// ── dates ──
function ndToday() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndAddDays(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? (+m[3]) + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m[2] - 1] + ' ' + m[1] : (iso || ''); }   // 2026-10-23 → 23 Oct 2026 (one date format, 21 Oct)
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
  _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: {}, pcards: {}, actions: {}, sel: {}, tab: sup ? 'fix' : 'today', card: null, view: sup ? 'sup' : 'view', supId: sup, supName: supName };
  await ndMasterSetup(cfg, cl);
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) {}
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) {}
  try { _nd.pcards = (await fbGet('sc_pcards/' + code)) || {}; } catch (e) {}
  try { await ndGradLoad(); } catch (e) {}
  ndShow(); ndGradMaybe();
}
function ndCloseView() { ndClose(); _nd = null; nfSetLevel(NF_LEVEL_DEFAULT); try { if (typeof scRenderMasterDashboard === 'function') scRenderMasterDashboard(); } catch (e) {} }

// ── HealSol / Supervisor facility list: card for a department-core facility (UPHC …) — no Sub-Centre figures ──
function nfDeptFacCardHTML(code, fac, LV, adminBtns) {
  var e = ndEsc, prog = (LV.programmes || []).find(function (p) { return p.id === fac.progId; }), k = /([A-Z])$/.exec(String(fac.progId || ''));
  var pkg = prog ? String(prog.label).replace(/^[^—]*—\s*/, '').replace(/\s*\(\d+ days\)\s*$/, '') : (fac.progId || '—');
  var staffN = Object.keys(fac.staff || {}).filter(function (m) { return fac.staff[m] && !fac.staff[m].disabled; }).length;
  var day = fac.startDate ? nfDeptDayNo(fac.startDate) : null, days = LV.days || 60, S = nfDeptShape(LV);
  var when = !fac.startDate ? 'Start date not set' : day < 1 ? 'Starts ' + ndDate(fac.startDate) : day > days ? 'Programme complete' : 'Day ' + day + ' of ' + days;
  var phase = !fac.startDate || day < 1 ? '' : day <= S.bN ? 'Baseline' : day <= S.iN ? 'Implementation' : day <= S.eN ? 'End-line' : day <= days ? 'Readiness week' : '';
  var pct = day && day > 0 ? Math.min(100, Math.round(Math.min(day, days) / days * 100)) : 0;
  return '<div class="mfc-top"><div class="mfc-icon">🏥</div><div style="flex:1;min-width:0;">'
    + '<div class="mfc-name" title="' + e(fac.name || code) + '">' + e(fac.name || code) + '</div>'
    + '<div class="mfc-chips"><span class="t">' + e(LV.short || LV.name) + (k ? ' · Package ' + k[1] : '') + '</span>'
    + (fac.suspended ? '<span class="a">Suspended</span>' : '')
    + (fac.isDemo ? '<span class="b">' + (fac.subscriptionStatus === 'paid' ? 'Self-registered · paid' : 'Free trial') + '</span>' : fac.subscriptionStatus === 'contract' ? '<span class="v">Contract</span>' : '') + '</div>'
    + '<div class="mfc-loc">' + e([fac.district, fac.state].filter(Boolean).join(', ') || '—') + '</div>'
    + '<div style="font-size:9.5px;color:var(--teal);font-weight:700;margin-top:2px;">' + e(pkg) + ' · ' + staffN + ' staff</div>'
    + '</div><div class="mfc-pct" style="color:var(--teal);font-size:13px;text-align:right;line-height:1.2;">' + (day && day >= 1 && day <= days ? 'Day ' + day + '<br><span style="font-size:9.5px;font-weight:700;color:var(--t3);">' + e(phase) + '</span>' : '') + '</div></div>'
    + '<div style="height:6px;border-radius:10px;background:var(--br);margin:8px 0;overflow:hidden;"><div style="height:100%;border-radius:10px;width:' + pct + '%;background:var(--teal);"></div></div>'
    + '<div class="mfc-meta"><span>' + e(when) + '</span><span>' + e(LV.inChargeLabel || LV.inCharge) + ': ' + e(fac.choName || (function () { var st = fac.staff || {}, m = Object.keys(st).find(function (k) { return st[k] && !st[k].disabled && (st[k].role || LV.inCharge) === LV.inCharge; }); return m ? (st[m].name || m) : 'Not set'; })()) + '</span></div>'
    + '<div style="display:flex;gap:6px;margin-top:8px;"><button class="mfc-btn mfc-open" onclick="scDrillIn(\'' + e(code) + '\')"><i class="ti ti-zoom-in" style="font-size:12px;"></i> Open</button>' + (adminBtns || '') + '</div>';
}

nfRegisterCore('dept', { open: { staff: ndOpen } });
