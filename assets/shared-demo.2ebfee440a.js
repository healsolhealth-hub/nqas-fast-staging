// ══════════════════════════════════════════════════════════════
// DEMO FACILITIES — HealSol Settings → Programme rules → "Demo facilities" (3 Nov 2026)
//   One AAM-SC, UPHC, PHC and CHC in "Demo District, Uttar Pradesh", always on Day 30, with realistic cards, scores,
//   actions and verification, built here with the app's own day plans and sent to the server (demoSetup), which keeps a
//   copy and puts everything back every night (functions/demo.js). Logins: every staff member, a Quality Champion,
//   a Supervisor (demo-mentor) and a District Admin (demo-district), all with one demo password chosen here.
//   Demo facilities are marked showcase: never counted in dashboards, public totals or Quality Stars.
// ══════════════════════════════════════════════════════════════
var DM_DAY = 30, DM_CODES = { sc: 'UP-DMO-SC-0001', uphc: 'UP-DMO-UPHC-0001', phc: 'UP-DMO-PHC-0001', chc: 'UP-DMO-CHC-0001' };
var DM_FAC = {
  sc: { name: 'Demo AAM-SC Rampur', block: 'Rampur', progId: 'nqas_12A', pop: [4200, 3], nin: 'DEMO-SC-01',
    staff: [['9999900001', 'Sunita Devi', 'CHO'], ['9999900002', 'Rekha Kumari', 'ANM'], ['9999900003', 'Meena Kumari', 'ASHA'], ['9999900004', 'Ramesh Yadav', 'MPW']] },
  uphc: { name: 'Demo UPHC Civil Lines', block: 'Civil Lines', progId: 'nqas_uphcA', pop: [52000, 6], nin: 'DEMO-UPHC-01',
    staff: [['9999900011', 'Priya Verma', 'Coordinator'], ['9999900012', 'Dr Alok Gupta', 'MOIC'], ['9999900013', 'Kavita Sharma', 'StaffNurse'], ['9999900014', 'Rahul Jain', 'Pharmacist'], ['9999900015', 'Imran Khan', 'LabTech'], ['9999900016', 'Sushma Devi', 'ANM']] },
  phc: { name: 'Demo PHC Bichpuri', block: 'Bichpuri', progId: 'nqas_phc', pop: [31500, 14], nin: 'DEMO-PHC-01',
    staff: [['9999900021', 'Dr Arvind Mehta', 'MOIC'], ['9999900022', 'Neha Singh', 'StaffNurse'], ['9999900023', 'Geeta Devi', 'ANM'], ['9999900024', 'Vikas Kumar', 'Pharmacist'], ['9999900025', 'Pooja Yadav', 'LabTech']] },
  chc: { name: 'Demo CHC Fatehabad', block: 'Fatehabad', progId: 'nqas_chc', chcKind: 'fru', pop: [148000, 62], nin: 'DEMO-CHC-01',
    staff: [['9999900031', 'Dr Sanjay Rao', 'MOIC'], ['9999900032', 'Dr Anjali Verma', 'ObGyn'], ['9999900033', 'Dr Rohit Saxena', 'Paediatrician'], ['9999900034', 'Sr Mary Joseph', 'Matron'],
      ['9999900035', 'Ritu Pal', 'SNIPD'], ['9999900036', 'Shalini Gupta', 'SNMat'], ['9999900037', 'Deepak Sharma', 'Pharmacist'], ['9999900038', 'Arun Kumar', 'LabTech'], ['9999900039', 'Manoj Tiwari', 'FacilityNodal']] } };
var DM_PEOPLE = { champion: { mob: '9999900041', name: 'Gourav Mishra' }, mentor: { name: 'Dr Demo Mentor' }, district: { name: 'Demo District Programme Manager' } };
function dmE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function dmH(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 1000; }   // steady "random" 0–999
function dmYmd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function dmStart() { var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - (DM_DAY - 1)); return dmYmd(d); }
function dmIso(start, n, hr) { var p = start.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n, hr == null ? 6 : hr)).toISOString(); }
function dmDate(start, n) { return dmIso(start, n).slice(0, 10); }
function dmStaff(t) { var o = {}; DM_FAC[t].staff.forEach(function (s) { o[s[0]] = { name: s[1], role: s[2], mobile: s[0], addedAt: '2026-01-01T00:00:00.000Z', addedBy: 'demo' }; }); return o; }

// ── Sub-Centre: 29 days of cards (Day 30 is today) ──
var DM_HOW = ['Put up the signage and display the list', 'Train the team and record attendance', 'Arrange the equipment and keep a stock register', 'Write the SOP and keep it at the counter', 'Get the record format printed and start using it', 'Check daily and note it in the register'];
var DM_GEO = { sc: [27.2152, 77.9864], uphc: [27.1767, 78.0081], phc: [27.1960, 77.9290], chc: [27.0144, 78.3069] };
function dmGeo(t, start) { return { lat: DM_GEO[t][0], lng: DM_GEO[t][1], at: dmIso(start, 0), by: 'demo' }; }
function dmBuildSc(start) {
  var t = 'sc', F = DM_FAC.sc, staff = dmStaff(t), present = scRolesFromRoster(staff), pid = F.progId, out = {}, ch = DM_PEOPLE.champion;
  Object.keys(staff).forEach(function (m) { var P = {}, role = staff[m].role;
    for (var di = 0; di < DM_DAY - 1; di++) {
      if ((role === 'ASHA' && di % 9 === 5) || (role === 'MPW' && di % 7 === 3 && di > 7)) continue;   // a few missed days
      var d = scDayDef(pid, di), sc = [], tk = {}, any = false, lvl = di < 7 ? 4 : Math.min(9, 7 + Math.floor((di - 7) / 6));
      d.cps.forEach(function (cp, ci) {
        if (!scCpForRoleIn(cp, role, present)) { sc.push(-1); return; } any = true;
        var n = (cp.items || []).length, ticks = n ? Array.from({ length: n }, function (_, i) { return dmH(m + di + ':' + ci + ':' + i) % 10 < lvl ? 1 : 0; }) : null;
        if (n) { tk['c' + ci] = ticks.join(''); sc.push(scMovScore(ticks)); } else sc.push(dmH(m + di + ci) % 10 < lvl ? 2 : 1);
      });
      if (!any) continue;
      var late = role !== 'CHO' && dmH(m + 'late' + di) % 10 === 0, r = { day: di, progId: pid, taskDone: true, cpScores: sc, cpTicks: tk, role: role, staffName: staff[m].name, updatedAt: dmIso(start, di + (late ? 1 : 0), 11), doneAt: dmIso(start, di + (late ? 1 : 0), 11) };
      if (role === 'CHO' && di >= 7 && di < 24 && di % 3 !== 2) { r.verified = true; r.verifiedByMob = ch.mob; r.verifiedBy = ch.name; r.verifiedAt = dmIso(start, di + 1, 9); }
      if (role === 'CHO' && di === 0) { r.blRev = { c0: { '0': { v: 1, r: 'ok', by: ch.name, byId: ch.mob, role: 'Quality Champion', at: dmIso(start, 1, 9) } }, c1: { '0': { v: 0, r: 'notseen', by: ch.name, byId: ch.mob, role: 'Quality Champion', at: dmIso(start, 1, 9) } } }; r.blApproved = { by: ch.name, at: dmIso(start, 1, 10) }; }
      P['day_' + di] = r;
    }
    out[m] = P; });
  return { fac: { name: F.name, type: 'sc', block: F.block, progId: pid, nin: F.nin, choName: F.staff[0][1], contactMobile: F.staff[0][0], staff: staff, population: { n: F.pop[0], villages: F.pop[1], at: dmIso(start, 0) },
    certs: { c1: { name: 'Kayakalp', note: '2025 · commendation', at: dmIso(start, 0) } }, geo: dmGeo('sc', start) }, data: { sc_progress: out } };
}

// ── UPHC / PHC / CHC: department cards, team checks and actions ──
async function dmBuildDept(t, start) {
  var cfg = NF_LEVELS[t], F = DM_FAC[t], staff = dmStaff(t), S = nfDeptShape(cfg), cl = await nfLoadData(cfg.checklist), items = cl.items;
  var inCharge = F.staff[0][0], pool = F.staff.map(function (s) { return s[0]; }), deps = (cfg.departments || []).filter(function (d) { return !(t === 'chc' && d.id === 'BSU'); });
  var depts = {}, pc = {}, dc = {}, act = {}, nAct = 0;
  deps.forEach(function (d, i) {
    var lead = d.clinical === false ? pool[pool.length - 1] : pool[i % Math.min(pool.length, t === 'chc' ? 6 : 3)], team = {};
    pool.filter(function (m) { return m !== lead; }).forEach(function (m, j) { if ((j + i) % 3 === 0) team[m] = true; });
    var filler = Object.keys(team)[0] || lead; depts[d.id] = { lead: lead, team: team };
    var plan = nfDeptPlan(items, d.id, S, {}), latest = {}, gapDay = {}, P = pc[d.id] = {}, D = dc[d.id] = {};
    for (var n = 1; n <= DM_DAY - 1; n++) {
      var day = nfDeptDay(plan, n, S); if (!day.ids.length) continue;
      var s = {}, f = {}, prog = n <= S.bN ? 0 : Math.min(9, 7 + Math.floor((n - S.bN) / 5));
      day.ids.forEach(function (id) { var b = dmH(t + id) % 10, base = b < 5 ? 0 : b < 7 ? 1 : 2, v = n <= S.bN ? base : Math.max(latest[id] == null ? base : latest[id], dmH(t + id + n) % 10 < prog ? 2 : base);
        s[id] = v; f[id] = v; latest[id] = v; });
      P['day_' + n] = {}; P['day_' + n][filler] = { s: s, done: { at: dmIso(start, n - 1, 11) } };
      D['day_' + n] = { f: f, chk: { by: lead, at: dmIso(start, n - 1, 15) } };
      if (n <= S.bN) day.ids.forEach(function (id) { if (s[id] < 2) gapDay[id] = n; });
    }
    // an action for every baseline gap: closed once it is Met, otherwise open (due in the coming weeks) or done and waiting for the check
    Object.keys(gapDay).forEach(function (id, k) { var n0 = gapDay[id], met = latest[id] === 2, st = met ? 'closed' : (k % 10 === 0 ? 'fixed' : 'open');
      var o = { dept: d.id, how: DM_HOW[dmH(id) % DM_HOW.length], owner: k % 2 ? filler : lead, due: dmDate(start, Math.max(n0 + 10, DM_DAY - 3 + (k % 20))), status: st, level: 'lead', at: dmIso(start, n0, 10), by: lead };
      if (met) o.closedAt = dmIso(start, Math.min(DM_DAY - 2, n0 + 12 + (k % 8)), 12);
      act[id] = o; nAct++; });
  });
  var fac = { name: F.name, type: t, block: F.block, progId: F.progId, nin: F.nin, choName: F.staff[0][1], contactMobile: inCharge, staff: staff, depts: depts, population: { n: F.pop[0], villages: F.pop[1], at: dmIso(start, 0) }, geo: dmGeo(t, start) };
  if (F.chcKind) fac.chcKind = F.chcKind;
  if (t === 'chc') { fac.depts.BSU = { off: true }; fac.laqshya = { status: 'state_certified' }; }
  if (t === 'phc') fac.certs = { c1: { name: 'Kayakalp', note: '2024 · commendation', at: dmIso(start, 0) } };
  return { fac: fac, data: { sc_pcards: pc, sc_dcards: dc, sc_dactions: act } };
}
async function dmBuild() {
  var start = dmStart(), T = { base: start, fac: {}, data: { sc_progress: {}, sc_pcards: {}, sc_dcards: {}, sc_dactions: {} }, people: DM_PEOPLE };
  var put = function (t, r) { var c = DM_CODES[t]; T.fac[c] = r.fac; Object.keys(r.data).forEach(function (k) { T.data[k][c] = r.data[k]; }); };
  put('sc', dmBuildSc(start));
  for (var t of ['uphc', 'phc', 'chc']) put(t, await dmBuildDept(t, start));
  return T;
}

// ── Settings card ──
var _dm = { cfg: null, busy: false };
async function dmRender(load) {
  var host = document.getElementById('hs-demo'); if (!host) return;
  if (load || !_dm.cfg) { try { _dm.cfg = (await fbGet('shared/sc_demo')) || {}; } catch (e) { _dm.cfg = _dm.cfg || {}; } }
  var c = _dm.cfg || {}, on = !!c.on, L = c.logins || [];
  var tn = function (code) { var k = Object.keys(DM_CODES).find(function (x) { return DM_CODES[x] === code; }); return k ? DM_FAC[k].name : ''; };
  host.innerHTML = '<b><i class="ti ti-presentation"></i> Demo facilities</b>'
    + '<p>One AAM-SC, UPHC, PHC and CHC in <b>Demo District</b>, always on <b>Day ' + DM_DAY + '</b> with realistic cards, scores, actions and checks — for live demos, officials who want to try it, and the Google Play reviewer. '
    + 'Everything is put back every night at 1:30 AM. Demo facilities never count in dashboards, public totals or Quality Stars.</p>'
    + (on ? '<div class="dm-st ok">✅ Ready · last reset ' + dmE(String(c.at || '').replace('T', ' ').slice(0, 16)) + ' (UTC)</div>' : '<div class="dm-st">Not created yet.</div>')
    + '<div class="dm-pw"><label>Demo password (all demo logins)<input type="text" id="dm-pw" autocomplete="off" placeholder="8+ characters, letters and numbers"></label>'
    + '<small>Share it only with people you demo to. It is set back every night.</small></div>'
    + '<div class="iv-acts"><button type="button" class="hs-btn p" id="dm-go" onclick="dmSetup()"' + (_dm.busy ? ' disabled' : '') + '>' + (on ? 'Rebuild &amp; set password' : 'Create demo facilities') + '</button>'
    + (on ? '<button type="button" class="hs-btn" onclick="dmReset()"' + (_dm.busy ? ' disabled' : '') + '>Reset now</button><button type="button" class="hs-btn" onclick="dmRemove()"' + (_dm.busy ? ' disabled' : '') + '>Remove</button>' : '') + '</div>'
    + '<div id="dm-msg" class="dm-msg"></div>'
    + (on && L.length ? '<div class="rg-scroll"><table class="dm-tab"><thead><tr><th>Login ID</th><th>Name</th><th>Role</th><th>Facility</th></tr></thead><tbody>'
      + L.map(function (l) { return '<tr><td><b>' + dmE(l.id) + '</b></td><td>' + dmE(l.name) + '</td><td>' + dmE(l.role) + '</td><td>' + dmE(tn(l.code)) + '</td></tr>'; }).join('') + '</tbody></table></div>'
      + '<p class="dm-tip">For the Google Play reviewer use <b>' + dmE(DM_FAC.sc.staff[0][0]) + '</b> (CHO, Demo AAM-SC) with the demo password.</p>' : '');
}
function dmMsg(t, err) { var m = document.getElementById('dm-msg'); if (m) { m.textContent = t; m.className = 'dm-msg' + (err ? ' err' : ''); } }
async function dmCallLong(name, data) { try { var r = await nfFns().httpsCallable(name, { timeout: 300000 })(data || {}); return r.data; } catch (e) { throw new Error(typeof nfErrText === 'function' ? nfErrText(e) : (e && e.message) || 'Error'); } }
async function dmRefreshSummaries() {
  for (var k in DM_CODES) { dmMsg('Working out the dashboards… ' + DM_FAC[k].name); try { await dmCallLong('refreshSummary', { code: DM_CODES[k] }); } catch (e) { console.warn('[demo] summary', k, e); } }
}
async function dmSetup() {
  var pw = String((document.getElementById('dm-pw') || {}).value || '').trim();
  if (pw.length < 8 || !/[A-Za-z]/.test(pw) || !/\d/.test(pw)) { dmMsg('Choose a demo password: 8 or more characters, with letters and numbers.', true); return; }
  _dm.busy = true; dmRender(); dmMsg('Building the demo data (about a minute)…');
  try {
    var T = await dmBuild(); dmMsg('Creating the facilities and logins…');
    await dmCallLong('demoSetup', { template: T, password: pw });
    await dmRefreshSummaries();
    _dm.busy = false; await dmRender(true); dmMsg('Done. Log in with any login ID below and the demo password.');
    showToast('Demo facilities ready.', 'ok');
  } catch (e) { _dm.busy = false; dmRender(); dmMsg(String(e.message || e), true); }
}
async function dmReset() {
  _dm.busy = true; dmRender(); dmMsg('Putting everything back…');
  try { await dmCallLong('demoReset', {}); await dmRefreshSummaries(); _dm.busy = false; await dmRender(true); dmMsg('Reset done.'); } catch (e) { _dm.busy = false; dmRender(); dmMsg(String(e.message || e), true); }
}
async function dmRemove() {
  var ok = await scDialog({ title: 'Remove the demo facilities?', icon: '🗑', okLabel: 'Remove', message: 'The four demo facilities, their data and all demo logins will be removed. You can create them again any time.' }); if (!ok) return;
  _dm.busy = true; dmRender(); try { await dmCallLong('demoRemove', {}); _dm.busy = false; await dmRender(true); dmMsg('Removed.'); } catch (e) { _dm.busy = false; dmRender(); dmMsg(String(e.message || e), true); }
}
(function () {
  if (typeof hspSignupRender === 'function') { var o = hspSignupRender; hspSignupRender = async function () { var r = await o.apply(this, arguments);
    try { var su = document.getElementById('hs-signup'), el = document.getElementById('hs-demo');
      if (su && !el) { el = document.createElement('div'); el.id = 'hs-demo'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); dmRender(true); } } catch (e) { console.warn('[demo]', e); }
    return r; }; }
  if (typeof hsSetupGroup === 'function') { var g = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-demo') return 'rules'; return g.apply(this, arguments); }; }
})();
