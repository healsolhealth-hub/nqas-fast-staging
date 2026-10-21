// ══════════════════════════════════════════════════════════════
// FACILITY PAGE — Sub-Centre tabs in the same layout as UPHC · PHC · CHC (HealSol 21 Oct 2026)
//   Readiness: the shared Readiness design (fac-ready.js) · Actions: the shared table, grouped by service package;
//   "Work on actions" (Supervisor) / "Open the Review & Action Plan" shows the existing Review & Action Plan underneath ·
//   Staff & cards: the shared table (card strip of the last 30 days, done %, verified %, certificate) ·
//   "See it as the CHO sees it": the Facility Admin dashboard, view only (every write is blocked while it is open).
// ══════════════════════════════════════════════════════════════
_fp.certs = {}; _fp.scAct = 'open'; _fp.work = false;
function fpScRender() {
  var host = document.getElementById('fp-dept'), code = _fp.code; if (!host || !code || _fp.type !== 'sc') return;
  try {
    if (_fp.tab === 'act') host.innerHTML = fpScActHTML(code);
    else if (_fp.tab === 'staff') host.innerHTML = fpScStaffHTML(code);
    else { _fp.M = fpScModel(code); _fpr.host = 'fp-ready'; host.innerHTML = '<div id="fp-ready">' + fpReadyHTML(_fp.M) + '</div>'; }
  } catch (e) { console.warn('[FP] sc render', e); host.innerHTML = '<div class="fp-card"><p class="fp-dim">Could not show this tab.</p></div>'; }
}
async function fpScLoadExtras(code) {
  var need = !(_scRvAll || {})[code];
  try { if (need) { var a = await fbGet('sc_corrective/' + code); _scRvAll[code] = a || {}; } } catch (e) {}
  try { if (!_fp.certs[code]) _fp.certs[code] = (await fbGet('sc_certs/' + code)) || {}; } catch (e) { _fp.certs[code] = _fp.certs[code] || {}; }
  if (_fp.code !== code || _fp.type !== 'sc') return;
  try { var f = (scMasterFacilities || {})[code]; if (f) { var links = document.querySelector('#sc-drill-info .nfl-drill'); document.getElementById('fp-top').innerHTML = fpTopHTML(code, f, fpScTiles(code), links ? '<div class="fp-line">' + links.innerHTML + '</div>' : ''); fpApplyTab(); } } catch (e) {}
  if (_fp.tab !== 'prog') fpScRender();
}
// ── Actions ──
var FP_SC_ST = { draft: ['Draft', 'n'], open: ['Open', 'b'], overdue: ['Overdue', 'r'], done: ['Done · re-check', 'g'], awaiting: ['Waiting for Supervisor', 'a'], closed: ['Closed', 'n'] };
function fpScActs(code) {
  var f = (scMasterFacilities || {})[code] || {}, pid = f.progId || 'nqas_12A', pr = (scMasterProgress || {})[code] || {}, sup = fpRole() === 'supervisor';
  return scRvList((_scRvAll || {})[code] || {}).filter(function (a) { return a.status !== 'draft' || sup; }).map(function (a) { return Object.assign({}, a, { st: scRvStatus(a, pid, pr) }); });
}
function fpScAct(k) { _fp.scAct = k; fpScRender(); }
function fpScWork(on) { _fp.work = !!on; fpApplyTab(); var st = _scIns['sc-drill-insights']; if (on && st) { st.tab = 'gaps'; scInsRender('sc-drill-insights'); } fpScRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function fpScActHTML(code) {
  var sup = fpRole() === 'supervisor', canAssign = false; try { canAssign = scRvCanAssign(code); } catch (e) {}
  if (_fp.work) return '<div class="fp-chiprow"><button type="button" class="fp-btn" onclick="fpScWork(false)"><i class="ti ti-arrow-left"></i> Back to the actions list</button><span class="fp-dim" style="margin:0">' + (canAssign ? 'Review & Action Plan — assign, publish and confirm actions here.' : 'Review & Action Plan — view only.') + '</span></div>';
  var L = fpScActs(code), A = scFacAggFor(code), isOpen = function (a) { return a.st !== 'closed'; };
  var match = function (a, k) { return k === 'open' ? isOpen(a) && a.st !== 'draft' : k === 'chk' ? a.st === 'done' || a.st === 'awaiting' : a.st === k; };
  var cnt = function (k) { return L.filter(function (a) { return match(a, k); }).length; };
  var chip = function (k, l) { return '<button type="button" class="fp-chip' + (_fp.scAct === k ? ' on' : '') + '" onclick="fpScAct(\'' + k + '\')">' + l + ' · ' + cnt(k) + '</button>'; };
  var has = {}; L.forEach(function (a) { if (isOpen(a)) has[a.cpId] = 1; });
  var noAct = Object.keys(A.cps || {}).filter(function (id) { var c = A.cps[id]; return c && c.score !== null && c.score < 2 && !has[id]; }).length;
  var h = '<div class="fp-chiprow">' + chip('open', 'All open') + chip('overdue', 'Overdue') + chip('chk', 'Done, waiting re-check') + chip('closed', 'Closed') + (sup ? chip('draft', 'Draft') : '')
    + '<span style="flex:1"></span><button type="button" class="fp-btn" onclick="fpScWork(true)"><i class="ti ti-' + (canAssign ? 'pencil' : 'list-check') + '"></i> ' + (canAssign ? 'Work on actions' : 'Open the Review &amp; Action Plan') + '</button></div>';
  if (noAct) h += '<div class="fp-note a"><b>' + noAct + ' gap' + (noAct === 1 ? '' : 's') + ' have no action yet</b> — checked as Partial or Not met and nobody owns them. ' + (canAssign ? 'Use Work on actions to assign them.' : 'The Supervisor assigns them.') + '</div>';
  var S = L.filter(function (a) { return match(a, _fp.scAct); });
  if (!S.length) return h + '<div class="fp-card"><p class="fp-dim">No actions here.</p></div>';
  var by = {}; S.forEach(function (a) { var k = a.service || 'Other'; (by[k] = by[k] || []).push(a); });
  var order = SC_SVC_GROUPS.service.concat(SC_SVC_GROUPS.support), ix = function (k) { var i = order.indexOf(k); return i < 0 ? 99 : i; };
  h += '<div class="fp-card p0 fp-tw"><table class="fp-t"><thead><tr><th>Checkpoint</th><th>What to fix</th><th>Owner</th><th>Re-check by</th><th>Status</th></tr></thead><tbody>';
  Object.keys(by).sort(function (x, y) { return ix(x) - ix(y); }).forEach(function (g) { h += '<tr class="grp"><td colspan="5">' + fpE(g) + ' · ' + by[g].length + '</td></tr>';
    by[g].sort(function (a, b) { return String(a.dueDate || '').localeCompare(String(b.dueDate || '')); }).forEach(function (a) { var s = FP_SC_ST[a.st] || FP_SC_ST.open;
      h += '<tr><td><b>' + fpE(a.cpId || '') + '</b><small>' + fpE(a.cpText || '') + (a.itemText ? ' — ' + fpE(a.itemText) : '') + '</small></td><td>' + fpE(a.action || '—') + '</td><td>' + fpE(a.assignedToName || a.ownerName || '—') + '</td><td class="' + (a.st === 'overdue' ? 'r' : '') + '">' + fpE(a.dueDate ? fpShortDate(a.dueDate) : '—') + '</td><td><span class="fp-st ' + s[1] + '">' + s[0] + '</span></td></tr>'; }); });
  return h + '</tbody></table></div><p class="fp-dim">' + (canAssign ? 'You assign, publish and close actions in Work on actions.' : 'View only — the Supervisor assigns and closes actions; staff mark them done in their app.') + '</p>';
}
// card days of one person: expected up to yesterday (today when done), done, verified — same count as UPHC / PHC / CHC
function fpScCardDays(f, pid, progress, mob, role, present) {
  var day = nfDayOf(f), todayDi = day == null || day < 1 ? -1 : day - 1, hi = Math.min(todayDi, getDaysArr(pid).length - 1), cards = scCardsFromRemote(progress || {}, pid), exp = 0, done = 0, ver = 0;
  for (var di = 0; di <= hi; di++) { var d = scDayDef(pid, di), mine = !!(d && (d.cps || []).some(function (cp) { return scCpForRoleIn(cp, role, present); })), c = cards[di], dn = !!(c && c.taskDone);
    if (mine && (di < todayDi || dn)) { exp++; if (dn) { done++; if (c.verified) ver++; } } }
  return { exp: exp, done: done, ver: ver, pct: exp ? Math.round(100 * done / exp) : null, cards: cards, todayDi: todayDi, hi: hi };
}
// ── Staff & cards ──
function fpScStaffHTML(code) {
  var f = (scMasterFacilities || {})[code] || {}, pid = f.progId || 'nqas_12A', pr = (scMasterProgress || {})[code] || {}, staff = f.staff || {}, present = scRolesFromRoster(staff);
  var day = nfDayOf(f), todayDi = day == null || day < 1 ? -1 : day - 1, total = getDaysArr(pid).length, hi = Math.min(todayDi, total - 1), lo = Math.max(0, hi - 29), certs = _fp.certs[code] || {}, admin = fpRole() === 'admin';
  var C = { v: '#2E8B57', d: '#8BC4A0', m: '#C8553D', n: '#E2E8E6' };
  var h = '<div class="fp-chiprow"><span class="fp-legend"><i style="background:#2E8B57"></i> done &amp; verified <i style="background:#8BC4A0"></i> done <i style="background:#C8553D"></i> missed <i style="background:#E2E8E6"></i> no card</span></div>';
  var mobs = Object.keys(staff).filter(function (m) { return staff[m] && !staff[m].disabled; });
  if (!mobs.length) return h + '<div class="fp-card"><p class="fp-dim">No staff yet — the CHO adds them in the Facility dashboard.</p></div>';
  var rows = mobs.map(function (m) { var s = staff[m], role = s.role || 'CHO', cards = scCardsFromRemote(pr[m] || {}, pid), exp = 0, done = 0, ver = 0, strip = [];
    for (var di = 0; di <= hi; di++) { var d = scDayDef(pid, di), mine = !!(d && (d.cps || []).some(function (cp) { return scCpForRoleIn(cp, role, present); })), c = cards[di], dn = !!(c && c.taskDone);
      var counts = mine && (di < todayDi || dn); if (counts) { exp++; if (dn) { done++; if (c.verified) ver++; } }
      if (di >= lo) strip.push(!mine ? 'n' : dn ? (c.verified ? 'v' : 'd') : di < todayDi ? 'm' : 'n'); }
    return { mob: m, name: s.name || m, role: role, label: (getScRole(role) || {}).label || role, exp: exp, done: done, pct: exp ? Math.round(100 * done / exp) : null, ver: done ? Math.round(100 * ver / done) : null, strip: strip, cert: certs[m] }; })
    .sort(function (a, b) { return (a.role === 'CHO' ? 0 : 1) - (b.role === 'CHO' ? 0 : 1) || String(a.name).localeCompare(String(b.name)); });
  h += '<div class="fp-card p0 fp-tw"><table class="fp-t"><thead><tr><th>Name</th><th>Card days (last 30)</th><th>Done</th><th>Verified</th><th>Certificate</th>' + (admin ? '<th></th>' : '') + '</tr></thead><tbody>';
  rows.forEach(function (s) {
    h += '<tr><td><b>' + fpE(s.name) + '</b><small>' + fpE(s.label) + ' · ' + fpE(s.mob) + '</small></td>'
      + '<td><span class="fp-strip">' + s.strip.map(function (x) { return '<i style="background:' + C[x] + '"></i>'; }).join('') + '</span></td>'
      + (s.exp ? '<td class="' + (s.pct < 80 ? 'r' : 'g') + '"><b>' + s.pct + '%</b><small>' + s.done + ' of ' + s.exp + ' card days</small></td>' : '<td><small>no card days yet</small></td>')
      + '<td>' + (s.ver == null ? '—' : s.ver + '% of done cards') + '</td>'
      + '<td>' + (s.cert ? '🎓 issued' + (s.cert.grade ? ' (' + fpE(s.cert.grade) + ')' : '') : day && day >= total ? (s.pct != null && s.pct >= 80 ? 'can claim' : 'needs 80% done') : 'Day ' + total) + '</td>'
      + (admin ? '<td><button type="button" class="fp-btn sm" title="Reset password" onclick="scAdminResetPwd(\'' + fpJ(code) + '\',\'' + fpJ(s.mob) + '\')"><i class="ti ti-key"></i> Reset password</button></td>' : '') + '</tr>';
  });
  return h + '</tbody></table></div><p class="fp-dim">Verified = the Supervisor or CHO has checked the card. Staff are added and removed by the CHO in the Facility dashboard.</p>';
}
// ── "See it as the CHO sees it" — the Facility Admin dashboard, view only ──
var _fpVA = null;
async function fpScViewAs(code) {
  var f = (scMasterFacilities || {})[code]; if (!f || _fpVA) return;
  _fpVA = { code: code, mode: appMode, sub: typeof scSubAdminCode !== 'undefined' ? scSubAdminCode : null, subD: typeof scSubAdminData !== 'undefined' ? scSubAdminData : null, y: window.scrollY || 0 };
  document.body.classList.add('nf-viewas');
  var b = document.getElementById('fp-va-bar'); if (!b) { b = document.createElement('div'); b.id = 'fp-va-bar'; document.body.appendChild(b); }
  b.innerHTML = '<i class="ti ti-eye"></i><span><b>Viewing as the CHO</b> · ' + fpE(f.name || code) + ' · view only — nothing can be changed here</span><button type="button" onclick="fpScViewAsClose()">Close</button>';
  try { scSubAdminCode = code; scSubAdminData = Object.assign({}, f); await scStartChoPanel(code, Object.assign({}, f)); }
  catch (e) { console.warn('[FP] view as', e); showToast('Could not open the Facility dashboard.', 'err'); fpScViewAsClose(); }
}
function fpScViewAsClose() {
  var v = _fpVA; if (!v) return; _fpVA = null;
  var a = document.getElementById('sc-cho-app'); if (a) a.classList.remove('vis');
  document.body.classList.remove('nf-viewas', 'nf-fadm'); var b = document.getElementById('fp-va-bar'); if (b) b.remove();
  try { appMode = v.mode; scSubAdminCode = v.sub; scSubAdminData = v.subD; } catch (e) {}
  try { window.scrollTo(0, v.y); } catch (e) {}
}
function fpVaBlocked() { try { showToast('View only — open the CHO\'s own login to make changes.', 'err'); } catch (e) {} return Promise.reject(new Error('View only')); }
(function () {   // while viewing as the CHO nothing is written: fbSet / fbUpdate / database writes / server calls all refuse
  ['fbSet', 'fbUpdate', 'fbRemove', 'fbPush', 'nfCall'].forEach(function (n) { if (typeof window[n] !== 'function') return; var o = window[n];
    window[n] = function () { if (_fpVA) return fpVaBlocked(); return o.apply(this, arguments); }; });
  try { var RP = firebase.database.Reference.prototype;   // every database write, whatever the path or the db object
    ['set', 'update', 'remove', 'push', 'transaction', 'setWithPriority'].forEach(function (m) { var o = RP[m]; if (typeof o !== 'function') return;
      RP[m] = function () { if (_fpVA) return fpVaBlocked(); return o.apply(this, arguments); }; }); } catch (e) {}
})();
(function () {   // the dashboard's own exits and staff tools do nothing harmful while viewing as the CHO
  [['scChoLogout', true], ['faMyCards'], ['scb1OpenCards'], ['faAddStaff'], ['scOpenAddStaff'], ['scResetStaffPwd'], ['scRemoveStaff'], ['scChoSetStartDate']].forEach(function (x) {
    var n = x[0]; if (typeof window[n] !== 'function') return; var o = window[n];
    window[n] = function () { if (_fpVA) { if (x[1]) { fpScViewAsClose(); return; } fpVaBlocked().catch(function () {}); return; } return o.apply(this, arguments); }; });
})();
