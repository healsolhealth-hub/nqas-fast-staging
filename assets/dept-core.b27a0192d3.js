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
function ndXcheck(id) { return ndDeptSet(id).xcheck || ''; }
function ndDeptDef(id) { return (_nd.cfg.departments || []).find(function (x) { return x.id === id; }) || { id: id, name: id }; }
// a dispute goes to the MO in-charge for a clinical department, to the in-charge (Coordinator) otherwise
function ndDisputeTo(id) { return ndDeptDef(id).clinical ? (_nd.cfg.clinicalInCharge || 'MOIC') : _nd.cfg.inCharge; }
function ndCanResolve(to, mob) { var r = ndRole(mob); return !!mob && (r === to || ndIsInCharge(mob)); }
function ndNeedsXc(c) { return !!(c.done && c.done.role === 'USHA' && !c.xc); }
function ndOpenDispute(c) { return c.dispute && !c.dispute.resolved ? c.dispute : null; }
function ndIsMember(id, mob) { return !!(ndTeam(id)[mob] || ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndCanVerify(id, mob) { return !!(ndLead(id) === mob || ndIsInCharge(mob) || ndRole(mob) === 'MOIC'); }
function ndMyDepts() { var me = ndMob(); return ndDeptDefs().filter(function (d) { return _nd.view || ndSeesAll(me) || ndIsMember(d.id, me) || ndXcheck(d.id) === me; }); }
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
    out[d.id] = { lead: lead || null, team: team }; if (xr) out[d.id].xcheck = xr;
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
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) { _nd.actions = {}; }
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
async function ndReload() { if (!_nd) return; _nd.fac = (await fbGet(scFacilityPath(_nd.code))) || _nd.fac; _nd.cards = (await fbGet(ndPath())) || {}; try { _nd.actions = (await fbGet('sc_dactions/' + _nd.code)) || {}; } catch (e) {} ndRender(); }

// ── programme day ──
function ndDay() { return nfDeptDayNo(_nd.fac.startDate); }
function ndDayInfo(dept, day) { return nfDeptDay(_nd.plan[dept], day); }
function ndCard(dept, day) { return ((_nd.cards[dept] || {})['day_' + day]) || {}; }
function ndStatus(dept, day) {
  var c = ndCard(dept, day), ids = ndDayInfo(dept, day).ids, n = ids.filter(function (id) { return c.s && c.s[id] !== undefined; }).length;
  if (c.verified) return { k: 'ok', t: 'Verified', n: n, of: ids.length };
  if (ndOpenDispute(c)) return { k: 'back', t: 'Disputed → ' + ndRoleLabel(c.dispute.to), n: n, of: ids.length };
  if (ndNeedsXc(c)) return { k: 'done', t: 'Waiting for cross-check', n: n, of: ids.length };
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
  var me = ndMob(), tabs = [['today', 'ti-calendar-check', 'Today'], ['ready', 'ti-chart-bar', 'Readiness'], ['actions', 'ti-checklist', 'Actions']];
  if (!_nd.view && ndIsInCharge(me)) tabs.push(['setup', 'ti-settings', 'Set-up']);
  if (!_nd.view) tabs.push(['me', 'ti-user', 'Me']);
  var day = ndDay(), info = nfDeptDay(_nd.plan[(_nd.cfg.departments[0] || {}).id] || [[], [], [], [], [], [], []], day);
  var hd = '<header class="nd-hd">' + (_nd.view ? '<button type="button" class="nd-ib" aria-label="Back to the facility list" title="Back" onclick="ndCloseView()"><i class="ti ti-arrow-left"></i></button>' : '') + '<div><small>' + ndEsc(_nd.cfg.name) + ' · ' + ndEsc(_nd.code) + '</small><b>' + ndEsc(_nd.fac.name || _nd.code) + '</b>'
    + '<span class="nd-sub">' + (_nd.fac.startDate ? (day >= 1 && day <= _nd.cfg.days ? 'Day ' + day + ' of ' + _nd.cfg.days + ' · ' + ND_PHASE[info.phase] : ND_PHASE[info.phase]) : 'Start date not set') + '</span></div>'
    + '<button type="button" class="nd-ib" aria-label="Refresh" title="Refresh" onclick="ndReload()"><i class="ti ti-refresh"></i></button></header>';
  var body = _nd.tab === 'ready' ? ndReadyHTML() : _nd.tab === 'actions' ? ndActionsHTML() : _nd.tab === 'setup' ? ndSetupHTML() : _nd.tab === 'me' ? ndMeHTML() : ndTodayHTML();
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
  return ndInboxHTML() + '<div class="nd-sec"><b>Today · Day ' + day + '</b><small>' + ND_PHASE[first.phase] + (first.week ? ' · week ' + first.week : '') + '</small></div>'
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
  var xcMe = ndNeedsXc(c) && ndXcheck(dept) === me, dsp = ndOpenDispute(c);
  var locked = !!c.verified || !(ndIsMember(dept, me) || xcMe), frozen = locked || (c.done && !xcMe), groups = [], cur = null;
  info.ids.forEach(function (id) { var r = _nd.byId[id]; if (!r) return; var key = r[3]; if (!cur || cur.key !== key) { cur = { key: key, rows: [] }; groups.push(cur); } cur.rows.push(r); });
  var html = '<header class="nd-hd"><button type="button" class="nd-ib" aria-label="Back" onclick="ndCloseCard()"><i class="ti ti-arrow-left"></i></button>'
    + '<div><small>Day ' + day + ' · ' + ND_PHASE[info.phase] + (info.week ? ' · week ' + info.week : '') + '</small><b>' + ndEsc(d.name) + '</b><span class="nd-sub">' + ndEsc(st.t) + '</span></div></header><main class="nd-main">';
  if (c.sentBack && !c.done) html += '<div class="nd-note back"><i class="ti ti-arrow-back-up"></i><span><b>Sent back by ' + ndEsc(c.sentBack.byName || '') + ':</b> ' + ndEsc(c.sentBack.reason || '') + '</span></div>';
  if (c.verified) html += '<div class="nd-note ok"><i class="ti ti-circle-check"></i><span>Verified by ' + ndEsc(c.verified.byName || '') + ' (' + ndEsc(ndRoleLabel(c.verified.role || '')) + ')</span></div>';
  if (c.done && c.done.role === 'USHA') html += '<div class="nd-note' + (c.xc ? ' ok' : '') + '"><i class="ti ti-user-check"></i><span>Filled by ' + ndEsc(c.done.byName || ndName(c.done.by)) + ' (USHA) · '
    + (c.xc ? 'cross-checked by ' + ndEsc(c.xc.byName || ndName(c.xc.by)) : ndXcheck(dept) ? (xcMe ? '<b>you cross-check it</b>: correct any score, then confirm' : 'waiting for the cross-check by ' + ndEsc(ndName(ndXcheck(dept)))) : 'no cross-checker set — the ' + ndEsc(_nd.cfg.inChargeLabel) + ' names one in Set-up') + '</span></div>';
  if (c.dispute) html += '<div class="nd-note' + (dsp ? ' back' : ' ok') + '"><i class="ti ti-alert-triangle"></i><span><b>Dispute by ' + ndEsc(c.dispute.byName || ndName(c.dispute.by)) + ':</b> ' + ndEsc(c.dispute.reason || '')
    + (dsp ? ' — waiting for the ' + ndEsc(ndRoleLabel(c.dispute.to)) : '<br><b>Resolved by ' + ndEsc(c.dispute.resolved.byName || ndName(c.dispute.resolved.by)) + ':</b> ' + ndEsc(c.dispute.resolved.note || '')) + '</span></div>';
  if (locked && !c.verified) html += '<div class="nd-note"><i class="ti ti-eye"></i><span>View only — ' + (_nd.view ? 'Supervisor / HealSol view.' : 'you are not on this department\'s team.') + '</span></div>';
  groups.forEach(function (g) {
    html += '<div class="nd-std"><b>Standard ' + ndEsc(g.key) + '</b><small>' + ndEsc(_nd.cl.stds[g.key] || '') + '</small></div>';
    g.rows.forEach(function (r) {
      var v = s[r[0]], m = String(r[6] || '').split('/').filter(Boolean);
      html += '<div class="nd-cp" id="nd-cp-' + r[0] + '"><div class="nd-cpt"><span class="nd-id">' + ndEsc(r[0]) + ' · ME ' + ndEsc(r[4]) + '</span>' + ndEsc(r[5]) + '</div>'
        + (r[7] ? '<div class="nd-mov"><i class="ti ti-search"></i>' + ndEsc(r[7]) + '</div>' : '')
        + '<div class="nd-meth">' + m.map(function (x) { return '<span title="' + ndEsc(ND_METHOD[x] || x) + '">' + ndEsc(x) + '</span>'; }).join('') + '</div>'
        + '<div class="nd-sc">' + ND_SCORE.map(function (o) { return '<button type="button" class="' + o.k + (v === o.v ? ' on' : '') + '"' + (frozen ? ' disabled' : '') + ' onclick="ndScore(\'' + r[0] + '\',' + o.v + ')">' + o.t + '</button>'; }).join('') + '</div>'
        + ((v === 0 || v === 1 || note[r[0]]) ? '<input class="nd-in" placeholder="What is missing? (optional)" value="' + ndEsc(note[r[0]] || '') + '"' + (frozen ? ' disabled' : '') + ' onchange="ndNote(\'' + r[0] + '\',this.value)">' : '')
        + '</div>';
    });
  });
  html += '</main><footer class="nd-ft"><span>' + st.n + ' of ' + st.of + ' scored</span>';
  if (!c.verified && !c.done && ndIsMember(dept, me)) html += '<button type="button" class="nd-btn"' + (st.n < st.of ? ' disabled title="Score every checkpoint first"' : '') + ' onclick="ndDone()">Mark done</button>';
  if (xcMe) html += '<button type="button" class="nd-btn" onclick="ndXc()">Cross-checked → lead</button>';
  if (dsp && ndCanResolve(dsp.to, me)) html += '<button type="button" class="nd-btn" onclick="ndResolve()">Resolve dispute</button>';
  if (c.done && !c.verified && ndCanVerify(dept, me)) {
    var anyV = ndIsInCharge(me) || ndRole(me) === 'MOIC', wait = ndNeedsXc(c) ? 'Waiting for the cross-check' : (dsp && !anyV) ? 'Disputed — waiting for the ' + ndRoleLabel(dsp.to) : '';
    html += '<button type="button" class="nd-btn ghost" onclick="ndSendBack()">Send back</button><button type="button" class="nd-btn"' + (wait ? ' disabled title="' + ndEsc(wait) + '"' : '') + ' onclick="ndVerify()">Verify &amp; submit</button>';
  }
  if (!c.verified && !dsp && !_nd.view && (ndIsMember(dept, me) || xcMe) && (c.done || st.n)) html += '<button type="button" class="nd-btn ghost" title="Disagree with a score or a send-back? The ' + ndEsc(ndRoleLabel(ndDisputeTo(dept))) + ' decides." onclick="ndDispute()">Dispute</button>';
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
  if (await ndWrite({ done: { at: new Date().toISOString(), by: me, byName: ndName(me), role: ndRole(me) }, sentBack: null })) { ndToast('Card marked done — the lead checks it next.', 'ok'); ndRender(); }
}
async function ndXc() {
  var me = ndMob();
  if (await ndWrite({ xc: { at: new Date().toISOString(), by: me, byName: ndName(me) } })) { ndToast('Cross-check done — the lead verifies next.', 'ok'); ndRender(); }
}
async function ndDispute() {
  var dept = _nd.card.dept, to = ndDisputeTo(dept), r = null;
  try { r = await scDialog({ title: 'Raise a dispute', icon: '⚖️', message: 'The ' + ndRoleLabel(to) + ' looks at this card and decides.', fields: [{ key: 'reason', label: 'What do you disagree with?', type: 'textarea', maxLength: 500, value: '' }], okLabel: 'Send to ' + ndRoleLabel(to) }); } catch (e) { r = null; }
  var reason = r && String(r.reason || '').trim(); if (!reason) return;
  var me = ndMob();
  if (await ndWrite({ dispute: { at: new Date().toISOString(), by: me, byName: ndName(me), reason: reason.slice(0, 500), to: to } })) { ndToast('Dispute sent to the ' + ndRoleLabel(to) + '.', 'ok'); ndRender(); }
}
async function ndResolve() {
  var r = null; try { r = await scDialog({ title: 'Resolve the dispute', icon: '⚖️', message: 'Correct any score on the card first if needed. Your decision is shown to the team.', fields: [{ key: 'note', label: 'Your decision', type: 'textarea', maxLength: 500, value: '' }], okLabel: 'Resolve' }); } catch (e) { r = null; }
  var note = r && String(r.note || '').trim(); if (!note) return;
  var me = ndMob();
  if (await ndWrite({ 'dispute/resolved': { at: new Date().toISOString(), by: me, byName: ndName(me), note: note.slice(0, 500) } })) { ndToast('Dispute resolved.', 'ok'); ndRender(); }
}
async function ndVerify() {
  var me = ndMob();
  if (await ndWrite({ verified: { at: new Date().toISOString(), by: me, byName: ndName(me), role: ndRole(me) } })) { ndToast('Verified and submitted.', 'ok'); ndCloseCard(); }
}
async function ndSendBack() {
  var r = null; try { r = await scDialog({ title: 'Send back', fields: [{ key: 'reason', label: 'What should the team look at again?', value: '' }], okLabel: 'Send back' }); } catch (e) { r = null; }
  var reason = r && String(r.reason || '').trim(); if (!reason) return;
  var me = ndMob();
  if (await ndWrite({ done: null, xc: null, sentBack: { at: new Date().toISOString(), by: me, byName: ndName(me), reason: reason.slice(0, 500) } })) { ndToast('Sent back to the team.', 'ok'); ndRender(); }
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
    + ndStaffHTML()
    + '<div class="nd-sec"><b>Departments</b><small>Lead verifies the daily card · team fills it</small></div>';
  (_nd.cfg.departments || []).forEach(function (d) {
    var set = ndDeptSet(d.id), team = set.team || {};
    h += '<details class="nd-card nd-dset" id="nd-dset-' + d.id + '"><summary><span class="nd-dk">' + ndEsc(d.id) + '</span><span class="nd-dn"><b>' + ndEsc(d.name) + (set.off ? ' (off)' : '') + '</b><small>Lead: ' + ndEsc(set.lead ? ndName(set.lead) : '—') + ' · team ' + Object.keys(team).length + '</small></span></summary>'
      + '<label class="nd-chk"><input type="checkbox" data-k="off"' + (set.off ? ' checked' : '') + '> Not at this facility (switch off)</label>'
      + '<label class="nd-lbl">Lead<select class="nd-in" data-k="lead"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + (set.lead === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<label class="nd-lbl">Cross-checker for USHA cards<select class="nd-in" data-k="xcheck"><option value="">—</option>' + mobs.map(function (m) { return '<option value="' + m + '"' + (set.xcheck === m ? ' selected' : '') + '>' + ndEsc(staff[m].name || m) + ' · ' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</option>'; }).join('') + '</select></label>'
      + '<div class="nd-lbl">Team</div><div class="nd-team">' + mobs.map(function (m) { return '<label class="nd-chk"><input type="checkbox" data-team="' + m + '"' + (team[m] ? ' checked' : '') + '> ' + ndEsc(staff[m].name || m) + ' <small>' + ndEsc(ndRoleLabel(staff[m].role || _nd.cfg.inCharge)) + '</small></label>'; }).join('') + '</div>'
      + '<button type="button" class="nd-btn" onclick="ndSaveDept(\'' + d.id + '\')">Save ' + ndEsc(d.id) + '</button></details>';
  });
  return h;
}
async function ndSaveDept(id) {
  var box = document.getElementById('nd-dset-' + id); if (!box) return;
  var rec = { lead: box.querySelector('[data-k=lead]').value || null, team: {}, off: box.querySelector('[data-k=off]').checked || null, xcheck: box.querySelector('[data-k=xcheck]').value || null };
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
    var cur = ndDeptSet(d.id), rec = { lead: cur.lead || null, team: Object.assign({}, cur.team || {}), off: cur.off || null, xcheck: cur.xcheck || null }, ch = false;
    if ((_nd.cfg.xcheckDepts || []).indexOf(d.id) >= 0 && (_nd.cfg.xcheckRoles || []).indexOf(role) >= 0 && !rec.xcheck) { rec.xcheck = mob; ch = true; }
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
    var cur = ndDeptSet(d.id); if (!(cur.team || {})[mob] && cur.lead !== mob && cur.xcheck !== mob) return;
    var rec = { lead: cur.lead === mob ? ic : (cur.lead || null), team: Object.assign({}, cur.team || {}), off: cur.off || null, xcheck: cur.xcheck === mob ? null : (cur.xcheck || null) }; delete rec.team[mob]; out[d.id] = rec;
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

// ── inbox on Today: disputes I decide, cross-checks waiting for me, actions to fix ──
function ndAllCards(fn) { Object.keys(_nd.cards || {}).forEach(function (dept) { var days = _nd.cards[dept] || {}; Object.keys(days).forEach(function (k) { fn(dept, +k.replace('day_', ''), days[k] || {}); }); }); }
function ndMyActions() {
  var me = ndMob(), all = ndIsInCharge(me), A = _nd.actions || {};
  return Object.keys(A).filter(function (id) { var a = A[id]; return a && a.status === 'open' && (all || a.owner === me); }).sort(function (x, y) { return String(A[x].due).localeCompare(String(A[y].due)); });
}
function ndInboxHTML() {
  if (_nd.view) return '';
  var me = ndMob(), rows = [];
  ndAllCards(function (dept, day, c) {
    if (c.verified) return; var d = ndDeptDef(dept), dsp = ndOpenDispute(c);
    if (dsp && ndCanResolve(dsp.to, me)) rows.push('<button type="button" class="nd-dept" onclick="ndOpenCard(\'' + dept + '\',' + day + ')"><span class="nd-dk">' + ndEsc(dept) + '</span><span class="nd-dn"><b>Dispute · ' + ndEsc(d.name) + ' · Day ' + day + '</b><small>' + ndEsc(dsp.byName || ndName(dsp.by)) + ': ' + ndEsc(dsp.reason) + '</small></span><span class="nd-st back">Decide</span></button>');
    if (ndNeedsXc(c) && ndXcheck(dept) === me) rows.push('<button type="button" class="nd-dept" onclick="ndOpenCard(\'' + dept + '\',' + day + ')"><span class="nd-dk">' + ndEsc(dept) + '</span><span class="nd-dn"><b>Cross-check · ' + ndEsc(d.name) + ' · Day ' + day + '</b><small>Filled by ' + ndEsc(c.done.byName || ndName(c.done.by)) + ' (USHA)</small></span><span class="nd-st done">Cross-check</span></button>');
  });
  var acts = ndMyActions(), h = '';
  if (rows.length) h += '<div class="nd-sec"><b>Waiting for you</b><small>' + rows.length + '</small></div>' + rows.join('');
  if (acts.length) h += '<div class="nd-sec"><b>' + (ndIsInCharge(me) ? 'Open actions' : 'My actions') + '</b><small>from the Supervisor · ' + acts.length + '</small></div>' + acts.slice(0, 5).map(ndActionRow).join('')
    + (acts.length > 5 ? '<button type="button" class="nd-btn ghost" onclick="ndTab(\'actions\')">All ' + acts.length + ' actions</button>' : '');
  return h;
}

// ── actions: unmet checkpoint → Supervisor's action (how to fix · owner · due) → fixed → Supervisor closes ──
function ndToday() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndAddDays(iso, n) { var d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function ndWeekEnd() { var d = new Date(), add = (7 - d.getDay()) % 7; return ndAddDays(ndToday(), add); }   // this Sunday
// latest score and note per checkpoint (highest day wins), with the card it came from
function ndLatestInfo() {
  var out = {};
  ndAllCards(function (dept, day, c) { var s = c.s || {}; Object.keys(s).forEach(function (id) { if (!out[id] || out[id].day <= day) out[id] = { s: s[id], note: (c.note || {})[id] || '', dept: dept, day: day }; }); });
  return out;
}
function ndCpText(id) { var r = _nd.byId[id]; return r ? r[5] : id; }
function ndActionRow(id) {
  var a = (_nd.actions || {})[id], me = ndMob(), over = a.status === 'open' && a.due < ndToday();
  var canFix = !_nd.view && a.status === 'open' && (a.owner === me || ndIsInCharge(me)), sup = _nd.view === 'sup';
  return '<div class="nd-cp nd-act"><div class="nd-cpt"><span class="nd-id">' + ndEsc(id) + ' · ' + ndEsc(ndDeptDef(a.dept).name) + '</span>' + ndEsc(ndCpText(id)) + '</div>'
    + '<div class="nd-how"><i class="ti ti-info-circle"></i><span>' + ndEsc(a.how) + '</span></div>'
    + '<div class="nd-am"><span>' + ndEsc(ndName(a.owner)) + '</span><span class="' + (over ? 'over' : '') + '">due ' + ndEsc(a.due) + (over ? ' · overdue' : '') + '</span>'
    + '<span class="nd-st ' + (a.status === 'open' ? 'prog' : a.status === 'fixed' ? 'done' : 'ok') + '">' + (a.status === 'open' ? 'Open' : a.status === 'fixed' ? 'Fixed — Supervisor checks' : 'Closed') + '</span></div>'
    + (a.fixed ? '<div class="nd-dim">Fixed by ' + ndEsc(ndName(a.fixed.by)) + (a.fixed.note ? ': ' + ndEsc(a.fixed.note) : '') + '</div>' : '')
    + (canFix ? '<div class="nd-row" style="margin-top:8px"><button type="button" class="nd-btn" onclick="ndFixAction(\'' + id + '\')">Mark fixed</button></div>' : '')
    + (sup ? '<div class="nd-row" style="margin-top:8px">' + (a.status === 'fixed' ? '<button type="button" class="nd-btn" onclick="ndSetAction(\'' + id + '\',\'closed\')">Close</button><button type="button" class="nd-btn ghost" onclick="ndSetAction(\'' + id + '\',\'open\')">Reopen</button>' : '')
      + (a.status !== 'closed' ? '<button type="button" class="nd-btn ghost" onclick="ndAssign(\'' + id + '\')">Edit</button>' : '') + '</div>' : '')
    + '</div>';
}
function ndActionsHTML() {
  var A = _nd.actions || {}, ids = Object.keys(A), sup = _nd.view === 'sup', today = ndToday(), wk = ndWeekEnd();
  var open = ids.filter(function (i) { return A[i].status === 'open'; }), fixed = ids.filter(function (i) { return A[i].status === 'fixed'; }), closed = ids.filter(function (i) { return A[i].status === 'closed'; });
  var byDue = function (a, b) { return String(A[a].due).localeCompare(String(A[b].due)); };
  var h = '<div class="nd-card nd-sum"><div><b>' + open.length + '</b><small>open</small></div><div><b>' + fixed.length + '</b><small>fixed · to check</small></div><div><b class="ok">' + closed.length + '</b><small>closed</small></div></div>';
  var week = open.filter(function (i) { return A[i].due <= wk; }).sort(byDue);
  h += '<div class="nd-sec"><b>This week\'s action plan</b><small>due by ' + ndEsc(wk) + (week.filter(function (i) { return A[i].due < today; }).length ? ' · ' + week.filter(function (i) { return A[i].due < today; }).length + ' overdue' : '') + '</small></div>'
    + (week.length ? week.map(ndActionRow).join('') : '<div class="nd-card nd-dim">Nothing due this week.</div>');
  if (fixed.length) h += '<div class="nd-sec"><b>Fixed — ' + (sup ? 'check and close' : 'waiting for the Supervisor') + '</b><small>' + fixed.length + '</small></div>' + fixed.sort(byDue).map(ndActionRow).join('');
  var later = open.filter(function (i) { return A[i].due > wk; }).sort(byDue);
  if (later.length) h += '<div class="nd-sec"><b>Later</b><small>' + later.length + '</small></div>' + later.map(ndActionRow).join('');
  if (sup) {
    var L = ndLatestInfo(), on = {}; ndDeptDefs().forEach(function (d) { on[d.id] = true; });
    var un = Object.keys(L).filter(function (id) { var r = _nd.byId[id], a = A[id]; return r && on[r[1]] && L[id].s < 2 && (!a || a.status === 'closed'); });
    h += '<div class="nd-sec"><b>Unmet checkpoints without an action</b><small>' + un.length + ' · latest score Partial / Not met</small></div>';
    if (!un.length) h += '<div class="nd-card nd-dim">None — every unmet checkpoint has an action.</div>';
    ndDeptDefs().forEach(function (d) {
      var rows = un.filter(function (id) { return _nd.byId[id][1] === d.id; }); if (!rows.length) return;
      h += '<details class="nd-card nd-dset"><summary><span class="nd-dk">' + ndEsc(d.id) + '</span><span class="nd-dn"><b>' + ndEsc(d.name) + '</b><small>' + rows.length + ' unmet</small></span></summary>'
        + rows.map(function (id) { var x = L[id]; return '<div class="nd-srow"><span class="nd-dn"><b>' + ndEsc(id) + ' · ' + (x.s === 0 ? 'Not met' : 'Partial') + '</b><small>' + ndEsc(ndCpText(id)) + (x.note ? ' — “' + ndEsc(x.note) + '”' : '') + '</small></span><button type="button" class="nd-btn ghost" onclick="ndAssign(\'' + id + '\')">Assign</button></div>'; }).join('')
        + '</details>';
    });
  }
  if (closed.length) h += '<details class="nd-card nd-dset"><summary><span class="nd-dn"><b>Closed</b><small>' + closed.length + '</small></span></summary>' + closed.map(ndActionRow).join('') + '</details>';
  return h;
}
async function ndAssign(id) {
  var r0 = _nd.byId[id]; if (!r0) return; var dept = r0[1], a = (_nd.actions || {})[id] || {}, staff = ndStaff();
  var opts = Object.keys(staff).map(function (m) { return { value: m, label: (staff[m].name || m) + ' · ' + ndRoleLabel(staff[m].role || _nd.cfg.inCharge) }; });
  var info = ndLatestInfo()[id] || {}, r = null;
  try { r = await scDialog({ title: 'Action · ' + id, icon: '🔧', message: ndCpText(id) + (info.note ? '\nTeam note: ' + info.note : ''), fields: [
    { key: 'how', label: 'How to fix', type: 'textarea', maxLength: 600, value: a.how || '' },
    { key: 'owner', label: 'Who does it', type: 'select', options: opts, value: a.owner || ndLead(dept) || '' },
    { key: 'due', label: 'Due date', type: 'date', value: a.due || ndAddDays(ndToday(), 7) }], okLabel: a.how ? 'Save' : 'Assign' }); } catch (e) { r = null; }
  if (!r) return; var how = String(r.how || '').trim();
  if (how.length < 3 || !/^\d{10}$/.test(r.owner || '') || !/^\d{4}-\d{2}-\d{2}$/.test(r.due || '')) { ndToast('Fill in how to fix, who and the due date.', 'err'); return; }
  var rec = { dept: dept, how: how.slice(0, 600), owner: r.owner, due: r.due, status: 'open', at: new Date().toISOString(), by: _nd.supId || 'sup', byName: _nd.supName || '' };
  try { await db.ref('sc_dactions/' + _nd.code + '/' + id).set(rec); (_nd.actions = _nd.actions || {})[id] = rec; ndToast('Action saved.', 'ok'); ndRender(); } catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}
async function ndFixAction(id) {
  var r = null; try { r = await scDialog({ title: 'Mark fixed', icon: '✅', message: ndCpText(id), fields: [{ key: 'note', label: 'What was done? (optional)', type: 'textarea', maxLength: 300, value: '' }], okLabel: 'Mark fixed' }); } catch (e) { r = null; }
  if (!r) return; var me = ndMob(), fx = { at: new Date().toISOString(), by: me }; if (String(r.note || '').trim()) fx.note = String(r.note).trim().slice(0, 300);
  try { await db.ref('sc_dactions/' + _nd.code + '/' + id).update({ status: 'fixed', fixed: fx }); var a = _nd.actions[id]; a.status = 'fixed'; a.fixed = fx; ndToast('Marked fixed — re-score it on the next card.', 'ok'); ndRender(); }
  catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}
async function ndSetAction(id, st) {
  var up = { status: st }; if (st === 'open') up.fixed = null;
  try { await db.ref('sc_dactions/' + _nd.code + '/' + id).update(up); var a = _nd.actions[id]; a.status = st; if (st === 'open') delete a.fixed; ndToast(st === 'closed' ? 'Closed.' : 'Reopened.', 'ok'); ndRender(); }
  catch (e) { ndToast('Not saved — ' + nfErrText(e), 'err'); }
}

// ── Supervisor / HealSol / District: open a department-core facility from the facility list (no staff login) ──
async function ndOpenView(code) {
  var fac = null; try { fac = await fbGet(scFacilityPath(code)); } catch (e) {}
  if (!fac) { ndToast('Facility not found.', 'err'); return; }
  var t = nfTypeOf(fac), cfg = NF_LEVELS[t]; if (!cfg || cfg.core !== 'dept') return;
  var cl; try { cl = await nfLoadData(cfg.checklist); } catch (e) { ndToast('The ' + cfg.name + ' checklist could not be loaded. Check the internet and try again.', 'err'); return; }
  nfSetLevel(t);
  var claims = (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims) || {}, sup = (typeof appMode !== 'undefined' && appMode === 'sc-supervisor') ? claims.sup : null, supName = '';
  if (sup) { try { supName = ((await fbGet('sc_supervisors/' + sup)) || {}).name || ''; } catch (e) {} }
  _nd = { code: code, fac: fac, cfg: cfg, cl: cl, plan: {}, cards: {}, actions: {}, tab: sup ? 'actions' : 'today', card: null, view: sup ? 'sup' : 'view', supId: sup, supName: supName };
  (cfg.departments || []).forEach(function (d) { _nd.plan[d.id] = nfDeptBaseline(cl.items, d.id); });
  _nd.byId = {}; cl.items.forEach(function (r) { _nd.byId[r[0]] = r; });
  try { _nd.cards = (await fbGet(ndPath())) || {}; } catch (e) {}
  try { _nd.actions = (await fbGet('sc_dactions/' + code)) || {}; } catch (e) {}
  ndShow();
}
function ndCloseView() { ndClose(); _nd = null; nfSetLevel(NF_LEVEL_DEFAULT); try { if (typeof scRenderMasterDashboard === 'function') scRenderMasterDashboard(); } catch (e) {} }

// ── HealSol / Supervisor facility list: card for a department-core facility (UPHC …) — no Sub-Centre figures ──
function nfDeptFacCardHTML(code, fac, LV, adminBtns) {
  var e = ndEsc, prog = (LV.programmes || []).find(function (p) { return p.id === fac.progId; });
  var pkg = prog ? String(prog.label).replace(/^[^—]*—\s*/, '').replace(/\s*\(\d+ days\)\s*$/, '') : (fac.progId || '—');
  var staffN = Object.keys(fac.staff || {}).filter(function (m) { return fac.staff[m] && !fac.staff[m].disabled; }).length;
  var day = fac.startDate ? nfDeptDayNo(fac.startDate) : null, days = LV.days || 60;
  var when = !fac.startDate ? 'Start date not set' : day < 1 ? 'Starts ' + fac.startDate : day > days ? 'Programme complete' : 'Day ' + day + ' of ' + days;
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
