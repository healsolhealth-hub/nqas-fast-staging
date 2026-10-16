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
function ndToast(m, t) { try { showToast(m, t); } catch (e) {} }
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
function ndIsMember(id, mob) { return !!(ndTeam(id)[mob] || ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndCanVerify(id, mob) { return !!(ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndMyDepts() { var me = ndMob(); return ndDeptDefs().filter(function (d) { return ndSeesAll(me) || ndIsMember(d.id, me); }); }
function ndName(mob) { var st = ndStaff()[mob]; return (st && st.name) || mob || ''; }
function ndRoleLabel(r) { var x = (_nd.cfg.roles || []).find(function (y) { return y.id === r; }); return x ? x.label : r; }
// the default leads and teams from the settings, for departments the in-charge has not set up yet
function ndDefaults() {
  var staff = ndStaff(), byName = Object.keys(staff).sort(function (a, b) { return String(staff[a].name || '').localeCompare(String(staff[b].name || '')); });
  var out = {};
  (_nd.cfg.departments || []).forEach(function (d) {
    var lead = byName.find(function (m) { return (staff[m].role || _nd.cfg.inCharge) === d.lead; }) || byName.find(function (m) { return ndIsInCharge(m); }) || '';
    var team = {}; byName.forEach(function (m) { var r = staff[m].role || _nd.cfg.inCharge; if (((_nd.cfg.defaultTeams || {})[r] || []).indexOf(d.id) >= 0) team[m] = true; });
    out[d.id] = { lead: lead || null, team: team };
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
  _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: {}, tab: 'today', card: null };
  (cfg.departments || []).forEach(function (d) { _nd.plan[d.id] = nfDeptBaseline(cl.items, d.id); });
  _nd.byId = {}; cl.items.forEach(function (r) { _nd.byId[r[0]] = r; });
  // first open by the in-charge: save the default departments set-up
  if (ndIsInCharge(me) && !fac.depts) {
    var def = ndDefaults();
    try { await db.ref(scFacilityPath(code) + '/depts').set(def); _nd.fac.depts = def; } catch (e) { console.warn('[dept] defaults not saved', e); }
  }
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) { _nd.cards = {}; }
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
async function ndReload() { if (!_nd) return; _nd.fac = (await fbGet(scFacilityPath(_nd.code))) || _nd.fac; _nd.cards = (await fbGet(ndPath())) || {}; ndRender(); }

// ── programme day ──
function ndDay() { return nfDeptDayNo(_nd.fac.startDate); }
function ndDayInfo(dept, day) { return nfDeptDay(_nd.plan[dept], day); }
function ndCard(dept, day) { return ((_nd.cards[dept] || {})['day_' + day]) || {}; }
function ndStatus(dept, day) {
  var c = ndCard(dept, day), ids = ndDayInfo(dept, day).ids, n = ids.filter(function (id) { return c.s && c.s[id] !== undefined; }).length;
  if (c.verified) return { k: 'ok', t: 'Verified', n: n, of: ids.length };
  if (c.done) return { k: 'done', t: 'Waiting for the lead', n: n, of: ids.length };
  if (c.sentBack) return { k: 'back', t: 'Sent back', n: n, of: ids.length };
  return n ? { k: 'prog', t: n + ' of ' + ids.length + ' scored', n: n, of: ids.length } : { k: 'new', t: 'Not started', n: 0, of: ids.length };
}
// latest score per checkpoint over all saved cards (highest day number wins)
function ndLatest() {
  var latest = {}, seen = {};
  Object.keys(_nd.cards || {}).forEach(function (dept) {
    var days = _nd.cards[dept] || {};
    Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), s = (days[k] || {}).s || {};
      Object.keys(s).forEach(function (id) { if (!(id in seen) || seen[id] <= n) { seen[id] = n; latest[id] = s[id]; } }); });
  });
  return latest;
}

// ── render ──
function ndRender() {
  var app = document.getElementById('nf-dept-app'); if (!app || !_nd) return;
  if (_nd.card) { app.innerHTML = ndCardHTML(); return; }
  var me = ndMob(), tabs = [['today', 'ti-calendar-check', 'Today'], ['ready', 'ti-chart-bar', 'Readiness']];
  if (ndIsInCharge(me)) tabs.push(['setup', 'ti-settings', 'Set-up']);
  tabs.push(['me', 'ti-user', 'Me']);
  var day = ndDay(), info = nfDeptDay(_nd.plan[(_nd.cfg.departments[0] || {}).id] || [[], [], [], [], [], [], []], day);
  var hd = '<header class="nd-hd"><div><small>' + ndEsc(_nd.cfg.name) + ' · ' + ndEsc(_nd.code) + '</small><b>' + ndEsc(_nd.fac.name || _nd.code) + '</b>'
    + '<span class="nd-sub">' + (_nd.fac.startDate ? (day >= 1 && day <= _nd.cfg.days ? 'Day ' + day + ' of ' + _nd.cfg.days + ' · ' + ND_PHASE[info.phase] : ND_PHASE[info.phase]) : 'Start date not set') + '</span></div>'
    + '<button type="button" class="nd-ib" aria-label="Refresh" title="Refresh" onclick="ndReload()"><i class="ti ti-refresh"></i></button></header>';
  var body = _nd.tab === 'ready' ? ndReadyHTML() : _nd.tab === 'setup' ? ndSetupHTML() : _nd.tab === 'me' ? ndMeHTML() : ndTodayHTML();
  var nav = '<nav class="nd-nav">' + tabs.map(function (t) { return '<button type="button" class="' + (_nd.tab === t[0] ? 'on' : '') + '" onclick="ndTab(\'' + t[0] + '\')"><i class="ti ' + t[1] + '"></i><span>' + t[2] + '</span></button>'; }).join('') + '</nav>';
  app.innerHTML = hd + '<main class="nd-main">' + body + '</main>' + nav;
}
function ndTab(t) { _nd.tab = t; _nd.card = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }

function ndTodayHTML() {
  var me = ndMob(), day = ndDay();
  if (!_nd.fac.startDate) return ndIsInCharge(me)
    ? '<div class="nd-card"><b>Set the programme start date</b><p>All departments start the baseline together on this date (Day 1).</p>' + ndStartForm() + '</div>'
    : '<div class="nd-card nd-empty"><i class="ti ti-clock"></i><b>The programme has not started yet</b><p>The ' + ndEsc(_nd.cfg.inChargeLabel) + ' sets the start date.</p></div>';
  if (day < 1) return '<div class="nd-card nd-empty"><i class="ti ti-calendar"></i><b>Day 1 is ' + ndEsc(_nd.fac.startDate) + '</b><p>Your department cards appear on the start date.</p></div>';
  if (day > _nd.cfg.days) return '<div class="nd-card nd-empty"><i class="ti ti-trophy"></i><b>The ' + _nd.cfg.days + '-day programme is complete</b><p>See Readiness for the result.</p></div>';
  var mine = ndMyDepts();
  if (!mine.length) return '<div class="nd-card nd-empty"><i class="ti ti-users"></i><b>No department yet</b><p>The ' + ndEsc(_nd.cfg.inChargeLabel) + ' adds you to a department team in Set-up.</p></div>';
  var first = nfDeptDay(_nd.plan[mine[0].id], day);
  if (first.phase === 'ready') return '<div class="nd-card nd-empty"><i class="ti ti-trophy"></i><b>Readiness week — Day ' + day + '</b><p>' + ['End-line verification', 'End-line verification', 'Final team review', 'Graduation'][day - 57] + '. No department card today.</p></div>';
  return '<div class="nd-sec"><b>Today · Day ' + day + '</b><small>' + ND_PHASE[first.phase] + (first.week ? ' · week ' + first.week : '') + '</small></div>'
    + mine.map(function (d) {
      var st = ndStatus(d.id, day), lead = ndLead(d.id);
      return '<button type="button" class="nd-dept" onclick="ndOpenCard(\'' + d.id + '\',' + day + ')"><span class="nd-dk">' + ndEsc(d.id) + '</span>'
        + '<span class="nd-dn"><b>' + ndEsc(d.name) + '</b><small>' + st.of + ' checkpoints · lead ' + ndEsc(lead ? ndName(lead) : '—') + '</small></span>'
        + '<span class="nd-st ' + st.k + '">' + ndEsc(st.t) + '</span></button>';
    }).join('');
}

// ── the department card ──
function ndOpenCard(dept, day) { _nd.card = { dept: dept, day: day }; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndCloseCard() { _nd.card = null; ndRender(); }
function ndCardHTML() {
  var dept = _nd.card.dept, day = _nd.card.day, d = (_nd.cfg.departments || []).find(function (x) { return x.id === dept; }) || { name: dept };
  var info = ndDayInfo(dept, day), c = ndCard(dept, day), s = c.s || {}, note = c.note || {}, me = ndMob(), st = ndStatus(dept, day);
  var locked = !!c.verified || !ndIsMember(dept, me), groups = [], cur = null;
  info.ids.forEach(function (id) { var r = _nd.byId[id]; if (!r) return; var key = r[3]; if (!cur || cur.key !== key) { cur = { key: key, rows: [] }; groups.push(cur); } cur.rows.push(r); });
  var html = '<header class="nd-hd"><button type="button" class="nd-ib" aria-label="Back" onclick="ndCloseCard()"><i class="ti ti-arrow-left"></i></button>'
    + '<div><small>Day ' + day + ' · ' + ND_PHASE[info.phase] + (info.week ? ' · week ' + info.week : '') + '</small><b>' + ndEsc(d.name) + '</b><span class="nd-sub">' + ndEsc(st.t) + '</span></div></header><main class="nd-main">';
  if (c.sentBack && !c.done) html += '<div class="nd-note back"><i class="ti ti-arrow-back-up"></i><span><b>Sent back by ' + ndEsc(c.sentBack.byName || '') + ':</b> ' + ndEsc(c.sentBack.reason || '') + '</span></div>';
  if (c.verified) html += '<div class="nd-note ok"><i class="ti ti-circle-check"></i><span>Verified by ' + ndEsc(c.verified.byName || '') + ' (' + ndEsc(ndRoleLabel(c.verified.role || '')) + ')</span></div>';
  if (!ndIsMember(dept, me)) html += '<div class="nd-note"><i class="ti ti-eye"></i><span>View only — you are not on this department\'s team.</span></div>';
  groups.forEach(function (g) {
    html += '<div class="nd-std"><b>Standard ' + ndEsc(g.key) + '</b><small>' + ndEsc(_nd.cl.stds[g.key] || '') + '</small></div>';
    g.rows.forEach(function (r) {
      var v = s[r[0]], m = String(r[6] || '').split('/').filter(Boolean);
      html += '<div class="nd-cp" id="nd-cp-' + r[0] + '"><div class="nd-cpt"><span class="nd-id">' + ndEsc(r[0]) + ' · ME ' + ndEsc(r[4]) + '</span>' + ndEsc(r[5]) + '</div>'
        + (r[7] ? '<div class="nd-mov"><i class="ti ti-search"></i>' + ndEsc(r[7]) + '</div>' : '')
        + '<div class="nd-meth">' + m.map(function (x) { return '<span title="' + ndEsc(ND_METHOD[x] || x) + '">' + ndEsc(x) + '</span>'; }).join('') + '</div>'
        + '<div class="nd-sc">' + ND_SCORE.map(function (o) { return '<button type="button" class="' + o.k + (v === o.v ? ' on' : '') + '"' + (locked || c.done ? ' disabled' : '') + ' onclick="ndScore(\'' + r[0] + '\',' + o.v + ')">' + o.t + '</button>'; }).join('') + '</div>'
        + ((v === 0 || v === 1 || note[r[0]]) ? '<input class="nd-in" placeholder="What is missing? (optional)" value="' + ndEsc(note[r[0]] || '') + '"' + (locked || c.done ? ' disabled' : '') + ' onchange="ndNote(\'' + r[0] + '\',this.value)">' : '')
        + '</div>';
    });
  });
  html += '</main><footer class="nd-ft"><span>' + st.n + ' of ' + st.of + ' scored</span>';
  if (!c.verified && !c.done && ndIsMember(dept, me)) html += '<button type="button" class="nd-btn"' + (st.n < st.of ? ' disabled title="Score every checkpoint first"' : '') + ' onclick="ndDone()">Mark done</button>';
  if (c.done && !c.verified && ndCanVerify(dept, me)) html += '<button type="button" class="nd-btn ghost" onclick="ndSendBack()">Send back</button><button type="button" class="nd-btn" onclick="ndVerify()">Verify &amp; submit</button>';
  return html + '</footer>';
}
async function ndWrite(updates) {
  var base = ndPath(_nd.card.dept + '/day_' + _nd.card.day), up = {};
  Object.keys(updates).forEach(function (k) { up[base + '/' + k] = updates[k]; });
  var me = ndMob(); up[base + '/at'] = new Date().toISOString(); up[base + '/by'] = me; up[base + '/byName'] = ndName(me);
  try { await db.ref().update(up); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); return false; }
  var c = ((_nd.cards[_nd.card.dept] = _nd.cards[_nd.card.dept] || {})['day_' + _nd.card.day] = ndCard(_nd.card.dept, _nd.card.day));
  Object.keys(up).forEach(function (p) { var rel = p.slice(base.length + 1).split('/'), o = c; for (var i = 0; i < rel.length - 1; i++) { o = o[rel[i]] = o[rel[i]] || {}; } if (up[p] === null) delete o[rel[rel.length - 1]]; else o[rel[rel.length - 1]] = up[p]; });
  return true;
}
async function ndScore(id, v) { if (await ndWrite({ ['s/' + id]: v })) { var y = window.scrollY; ndRender(); try { window.scrollTo(0, y); } catch (e) {} } }
async function ndNote(id, t) { await ndWrite({ ['note/' + id]: String(t || '').trim().slice(0, 500) || null }); }
async function ndDone() {
  var me = ndMob();
  if (await ndWrite({ done: { at: new Date().toISOString(), by: me, byName: ndName(me) }, sentBack: null })) { ndToast('Card marked done — the lead checks it next.', 'ok'); ndRender(); }
}
async function ndVerify() {
  var me = ndMob();
  if (await ndWrite({ verified: { at: new Date().toISOString(), by: me, byName: ndName(me), role: ndRole(me) } })) { ndToast('Verified and submitted.', 'ok'); ndCloseCard(); }
}
async function ndSendBack() {
  var r = null; try { r = await scDialog({ title: 'Send back', fields: [{ key: 'reason', label: 'What should the team look at again?', value: '' }], okLabel: 'Send back' }); } catch (e) { r = null; }
  var reason = r && String(r.reason || '').trim(); if (!reason) return;
  var me = ndMob();
  if (await ndWrite({ done: null, sentBack: { at: new Date().toISOString(), by: me, byName: ndName(me), reason: reason.slice(0, 500) } })) { ndToast('Sent back to the team.', 'ok'); ndRender(); }
}

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
    + '<div class="nd-sec"><b>Departments</b><small>Lead verifies the daily card · team fills it</small></div>';
  (_nd.cfg.departments || []).forEach(function (d) {
    var set = ndDeptSet(d.id), team = set.team || {};
    h += '<details class="nd-card nd-dset" id="nd-dset-' + d.id + '"><summary><span class="nd-dk">' + ndEsc(d.id) + '</span><span class="nd-dn"><b>' + ndEsc(d.name) + (set.off ? ' (off)' : '') + '</b><small>Lead: ' + ndEsc(set.lead ? ndName(set.lead) : '—') + ' · team ' + Object.keys(team).length + '</small></span></summary>'
      + '<label class="nd-chk"><input type="checkbox" data-k="off"' + (set.off ? ' checked' : '') + '> Not at this facility (switch off)</label>'
      + '<label class="nd-lbl">Lead<select class="nd-in" data-k="lead"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + (set.lead === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<div class="nd-lbl">Team</div><div class="nd-team">' + mobs.map(function (m) { return '<label class="nd-chk"><input type="checkbox" data-team="' + m + '"' + (team[m] ? ' checked' : '') + '> ' + ndEsc(staff[m].name || m) + ' <small>' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</small></label>'; }).join('') + '</div>'
      + '<button type="button" class="nd-btn" onclick="ndSaveDept(\'' + d.id + '\')">Save ' + ndEsc(d.id) + '</button></details>';
  });
  return h;
}
async function ndSaveDept(id) {
  var box = document.getElementById('nd-dset-' + id); if (!box) return;
  var rec = { lead: box.querySelector('[data-k=lead]').value || null, team: {}, off: box.querySelector('[data-k=off]').checked || null };
  [].forEach.call(box.querySelectorAll('[data-team]'), function (c) { if (c.checked) rec.team[c.getAttribute('data-team')] = true; });
  try { await db.ref(scFacilityPath(_nd.code) + '/depts/' + id).set(rec); _nd.fac.depts = _nd.fac.depts || {}; _nd.fac.depts[id] = rec; ndToast(id + ' saved.', 'ok'); ndRender(); }
  catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}

// ── me ──
function ndMeHTML() {
  var me = ndMob(), st = ndStaff()[me] || {};
  return '<div class="nd-card"><b>' + ndEsc(st.name || me) + '</b><p>' + ndEsc(ndRoleLabel(st.role || _nd.cfg.inCharge)) + ' · ' + ndEsc(_nd.fac.name || _nd.code) + '</p>'
    + '<p class="nd-dim">My departments: ' + (ndMyDepts().map(function (d) { return ndEsc(d.name); }).join(', ') || '—') + '</p></div>'
    + '<div class="nd-card nd-rows"><button type="button" onclick="nfChangeMyPassword()"><i class="ti ti-key"></i>Change my password</button>'
    + '<button type="button" onclick="ndLogout()"><i class="ti ti-logout"></i>Logout</button></div>';
}

nfRegisterCore('dept', { open: { staff: ndOpen } });
