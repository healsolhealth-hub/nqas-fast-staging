// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE — REVIEW FLOW (HealSol 17 Oct 2026). Loaded after dept/core.js; uses its helpers (ndStaff, ndLead …).
//   1. Everyone on a department fills their OWN card for the day (sc_pcards/{code}/{dept}/day_n/{mob}):
//      "All Met" per Standard, a tapped reason for Partial / Not met, optional note. Works without signal (queued writes).
//   2. The department's checker (cadre lead — ANM for USHAs; else the lead) sees ONE comparison screen: rows where all
//      cards agree on Met are confirmed automatically (1 in 10 shown as a spot-check); agreed-unmet rows and rows that
//      differ need her tap; she settles a difference herself or sends it to the lead. Result: sc_dcards/{code}/{dept}/day_n.
//   3. The lead decides what was sent up, and assigns an action (ready-made text, owner, due) for every unmet checkpoint.
//   4. The owner marks it fixed; the checkpoint comes back on the next card; the checker's result closes it (Met) or
//      sends it to the Supervisor (still unmet), who writes how to fix it. Nothing stalls: overdue items move up.
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════

var ND_REASONS = [
  { k: 'reg', t: 'Register / record missing', a: 'Start the register / record and keep it up to date' },
  { k: 'stock', t: 'Stock out', a: 'Indent the item, restore the stock and keep a buffer' },
  { k: 'disp', t: 'Display missing', a: 'Put up the display at the right place' },
  { k: 'train', t: 'Staff not trained', a: 'Brief the staff on this and note the briefing' },
  { k: 'equip', t: 'Equipment not working', a: 'Get the equipment repaired or replaced and record it' },
  { k: 'oth', t: 'Other', a: '' }
];
function ndReason(k) { return ND_REASONS.find(function (x) { return x.k === k; }) || null; }
var ND_SPOT = 10;               // 1 in 10 agreed-Met checkpoints shown to the checker
var ND_CHECK_DUE_H = 24, ND_DECIDE_DUE_H = 48, ND_ACTION_LATE_D = 3;

// ── data helpers ──
function ndPc(dept, day) { return ((_nd.pcards[dept] || {})['day_' + day]) || {}; }
function ndRes(dept, day) { return ((_nd.cards[dept] || {})['day_' + day]) || {}; }
function ndChecker(id) { var s = ndDeptSet(id); return s.checker || s.xcheck || ndLead(id) || ''; }
function ndFillers(id) {   // the staff posted in the department fill; the lead and the checker do not (HealSol 17 Oct)
  var st = ndStaff(), ck = ndDeptSet(id).checker || ndDeptSet(id).xcheck || '', ld = ndLead(id), all = Object.keys(ndTeam(id)).filter(function (m) { return st[m]; });
  var t = all.filter(function (m) { return m !== ck && m !== ld; }); if (!t.length) t = all.filter(function (m) { return m !== ld; }); if (!t.length) t = all;
  if (!t.length && ld && st[ld]) t = [ld];   // nobody else: the lead fills herself
  return t;
}
// one person fills: her card counts as checked when she marks it done; the lead spot-checks 1 in 10 Met and assigns the rest
function ndSolo(id) { return ndFillers(id).length === 1; }
function ndSoloDone(dept, day) { if (!ndSolo(dept) || ndRes(dept, day).chk) return false; var c = ndPc(dept, day)[ndFillers(dept)[0]] || {}; return !!c.done; }
function ndOverseer(id) {   // above the lead: the MO in-charge for clinical departments, the in-charge (Coordinator) for the others
  var d = (_nd.cfg.departments || []).find(function (x) { return x.id === id; }) || {}, st = ndStaff();
  var role = d.clinical ? (_nd.cfg.clinicalInCharge || 'MOIC') : (_nd.cfg.coordinator || _nd.cfg.inCharge);   // CHC: Facility Nodal Officer for the others
  var who = Object.keys(st).find(function (m) { return (st[m].role || _nd.cfg.inCharge) === role; });
  return who || Object.keys(st).find(function (m) { return ndIsInCharge(m); }) || '';
}
function ndFills(id, mob) { return !!mob && ndFillers(id).indexOf(mob) >= 0; }
function ndCanCheck(id, mob) { return !!mob && (ndChecker(id) === mob || ndCanVerify(id, mob)); }
function ndHours(iso) { var t = Date.parse(iso || ''); return isNaN(t) ? 0 : (Date.now() - t) / 3600000; }
function ndHash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0; } return Math.abs(h); }
function ndSpot(dept, day, id) { return ndHash(_nd.code + '|' + dept + '|' + day + '|' + id) % ND_SPOT === 0; }
// checkpoints fixed by an action come back on the next day's cards for a re-check
function ndRecheckIds(dept, day) {
  var A = _nd.actions || {};
  return Object.keys(A).filter(function (id) { var a = A[id]; return a && a.dept === dept && a.status === 'fixed' && (!a.fixed || !a.fixed.day || a.fixed.day < day); });
}
function ndDayIds(dept, day) {
  var ids = ndDayInfo(dept, day).ids.slice(), seen = {}; ids.forEach(function (i) { seen[i] = 1; });
  ndRecheckIds(dept, day).forEach(function (i) { if (!seen[i]) ids.push(i); });
  return ids;
}
function ndCardsIn(dept, day) {   // who has filled / is marked not filled / is still awaited
  var cards = ndPc(dept, day), fl = ndFillers(dept).filter(function (m) { return ndMyIds(dept, day, m).length; }), done = [], absent = [], waiting = [];   // best filled by: someone with nothing that day has no card
  Object.keys(cards).forEach(function (m) { if (fl.indexOf(m) < 0 && cards[m] && cards[m].done) fl.push(m); });   // a card from someone since moved
  fl.forEach(function (m) { var c = cards[m] || {}; if (c.absent) absent.push(m); else if (c.done) done.push(m); else waiting.push(m); });
  var last = done.reduce(function (x, m) { var a = (cards[m].done || {}).at || ''; return a > x ? a : x; }, '');
  return { fillers: fl, done: done, absent: absent, waiting: waiting, lastDone: last };
}
// latest score per checkpoint: the day result where checked, else the lowest score on that day's filled cards
function ndLatest(maxDay, minDay) {   // minDay / maxDay: only cards from those programme days
  var out = {}, seen = {}, cap = maxDay || 999, lo = minDay || 1;
  var put = function (id, v, n, fin) { if (!(id in seen) || seen[id].n < n || (seen[id].n === n && fin && !seen[id].fin)) { seen[id] = { n: n, fin: fin }; out[id] = v; } };
  Object.keys(_nd.cards || {}).forEach(function (dept) { var days = _nd.cards[dept] || {};
    Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), f = (days[k] || {}).f || {}; if (n > cap || n < lo) return; Object.keys(f).forEach(function (id) { put(id, f[id], n, true); }); }); });
  Object.keys(_nd.pcards || {}).forEach(function (dept) { var days = _nd.pcards[dept] || {};
    Object.keys(days).forEach(function (k) {
      var n = +k.replace('day_', ''); if (n > cap || n < lo || (ndRes(dept, n) || {}).chk) return;
      var low = {}; Object.keys(days[k] || {}).forEach(function (m) { var c = days[k][m] || {}; if (!c.done || c.absent) return; Object.keys(c.s || {}).forEach(function (id) { low[id] = id in low ? Math.min(low[id], c.s[id]) : c.s[id]; }); });
      Object.keys(low).forEach(function (id) { put(id, low[id], n, false); });
    }); });
  return out;
}
// latest final (checked) result per checkpoint with the day and the cards behind it
function ndLatestFinal() {
  var out = {};
  Object.keys(_nd.cards || {}).forEach(function (dept) { var days = _nd.cards[dept] || {};
    Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), r = days[k] || {}; if (!r.chk) return;
      Object.keys(r.f || {}).forEach(function (id) { if (!out[id] || out[id].day <= n) out[id] = { s: r.f[id], dept: dept, day: n }; }); }); });
  Object.keys(_nd.pcards || {}).forEach(function (dept) { if (!ndSolo(dept)) return; var who = ndFillers(dept)[0], days = _nd.pcards[dept] || {};   // one person: her done card counts
    Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), c = (days[k] || {})[who] || {}; if (!c.done || ndRes(dept, n).chk) return;
      Object.keys(c.s || {}).forEach(function (id) { if (!out[id] || out[id].day < n) out[id] = { s: c.s[id], dept: dept, day: n }; }); }); });
  return out;
}

// ── writes: applied on the phone at once, sent when there is signal (kept on the phone until the server confirms) ──
var _ndQ = [], _ndOnline = true;
function ndQKey() { return 'nd_q_' + ((_nd && _nd.code) || '') + '_' + ndMob(); }   // per person: a queue never goes out under another login
function ndQSave() { try { localStorage.setItem(ndQKey(), JSON.stringify(_ndQ)); } catch (e) {} }
function ndQLoad() { try { _ndQ = JSON.parse(localStorage.getItem(ndQKey()) || '[]') || []; } catch (e) { _ndQ = []; } }
function ndSetPath(root, rel, v) { var p = rel.split('/'), o = root; for (var i = 0; i < p.length - 1; i++) { o = o[p[i]] = (o[p[i]] && typeof o[p[i]] === 'object') ? o[p[i]] : {}; } if (v === null) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = v; }
function ndApplyLocal(up) {
  Object.keys(up).forEach(function (k) {
    var m = /^(sc_pcards|sc_dcards|sc_dactions)\/([^/]+)\/(.+)$/.exec(k); if (!m || m[2] !== _nd.code) return;
    ndSetPath(m[1] === 'sc_pcards' ? _nd.pcards : m[1] === 'sc_dcards' ? _nd.cards : (_nd.actions = _nd.actions || {}), m[3], up[k]);
  });
}
function ndQBadge() { var b = document.getElementById('nd-q'); if (!b) return; var n = _ndQ.length; b.hidden = !n || _ndOnline; b.textContent = n + ' waiting for signal'; }
function ndSend(item) {
  return db.ref().update(item.up).then(function () { _ndQ = _ndQ.filter(function (x) { return x.id !== item.id; }); ndQSave(); ndQBadge(); return true; },
    function (e) { _ndQ = _ndQ.filter(function (x) { return x.id !== item.id; }); ndQSave(); ndQBadge(); ndToast('Not saved — ' + nfErrText(e), 'err'); try { ndReload(); } catch (x) {} return false; });
}
// fire-and-forget: the screen updates now; offline, Firebase holds the write and sends it when the signal returns
function ndPut(up) {
  ndApplyLocal(up);
  var item = { id: Date.now() + '-' + Math.random().toString(36).slice(2, 7), up: up };
  _ndQ.push(item); ndQSave(); setTimeout(ndQBadge, 1500);
  return ndSend(item);
}
function ndQStart() {
  ndQLoad(); _ndQ.slice().forEach(function (it) { ndSend(it); });   // writes left from an earlier visit
  try { db.ref('.info/connected').on('value', function (s) { _ndOnline = !!s.val(); ndQBadge(); }); } catch (e) {}
}

// ── own card ──
function ndOpenDept(dept, day) {
  var me = ndMob(), mode = 'view', res = ndRes(dept, day), mine = ndPc(dept, day)[me] || {};
  if (!_nd.view && ndFills(dept, me) && !res.chk && !mine.done) mode = 'fill';
  else if (!_nd.view && ndCanCheck(dept, me)) mode = 'check';
  else if (!_nd.view && ndFills(dept, me)) mode = 'fill';
  if (mode === 'fill') { ndGoCard(dept, day); return; }
  _nd.card = { dept: dept, day: day, mode: mode }; ndRender(); try { window.scrollTo(0, 0); } catch (e) {}
}
function ndOpenCard(dept, day) { ndOpenDept(dept, day); }
function ndCloseCard() { _nd.card = null; ndRender(); }
function ndMyBase() { var c = ndCur(); return 'sc_pcards/' + _nd.code + '/' + c.dept + '/day_' + c.day + '/' + ndMob(); }
function ndCardWrite(rel) {
  var base = ndMyBase(), up = {}, me = ndMob();
  Object.keys(rel).forEach(function (k) { up[base + '/' + k] = rel[k]; });
  up[base + '/at'] = new Date().toISOString(); up[base + '/name'] = String(ndName(me)).slice(0, 80);
  return ndPut(up);
}
function ndKeepScroll() { var y = window.scrollY; ndRender(); try { window.scrollTo(0, y); } catch (e) {} }
function ndScore(id, v) { var rel = {}; rel['s/' + id] = v; if (v === 2) { rel['r/' + id] = null; rel['note/' + id] = null; } ndCardWrite(rel); ndKeepScroll(); }
function ndAllMet(list) {
  var me = ndMob(), cc = ndCur(), c = ndPc(cc.dept, cc.day)[me] || {}, s = c.s || {}, rel = {};
  list.split(',').forEach(function (id) { if (s[id] === undefined) { rel['s/' + id] = 2; var n = ndCt(id).items.length; if (n) rel['t/' + id] = new Array(n + 1).join('1'); } });
  if (Object.keys(rel).length) { ndCardWrite(rel); ndKeepScroll(); }
}
function ndReasonSet(id, k) { var rel = {}; rel['r/' + id] = k; ndCardWrite(rel); ndKeepScroll(); }
function ndNote(id, t) { var rel = {}; rel['note/' + id] = String(t || '').trim().slice(0, 300) || null; ndCardWrite(rel); }
function ndDone() {
  var cc = ndCur(), c = ndPc(cc.dept, cc.day)[ndMob()] || {}, miss = Object.keys(c.r || {}).filter(function (id) { return c.r[id] === 'oth' && (c.s || {})[id] < 2 && !String((c.note || {})[id] || '').trim(); });
  if (miss.length) { ndToast('You chose "Other" for ' + miss.join(', ') + ' — write what is missing first.', 'err'); var el = document.getElementById('nd-cp-' + miss[0]); if (el) try { el.scrollIntoView({ block: 'center' }); } catch (e) {} return; }
  ndDoneGo();
}
function ndDoneGo() { var cc = ndCur(); ndCardWrite({ done: { at: new Date().toISOString(), role: ndRole(ndMob()) } }); ndToast(ndSolo(cc.dept) ? 'Card done — it counts as checked. ' + ndName(ndChecker(cc.dept)) + ' spot-checks a few and assigns the gaps.' : 'Card done. ' + ndName(ndChecker(cc.dept)) + ' compares the cards next.', 'ok'); if (_nd.card) ndCloseCard(); else ndKeepScroll(); }

// ── checker: one comparison screen ──
function ndCompare(dept, day) {
  var cards = ndPc(dept, day), inn = ndCardsIn(dept, day), re = ndRecheckIds(dept, day);
  return ndDayIds(dept, day).map(function (id) {
    var sc = inn.done.map(function (m) { var c = cards[m] || {}; return { m: m, s: (c.s || {})[id], r: (c.r || {})[id], note: (c.note || {})[id], t: (c.t || {})[id] }; }).filter(function (x) { return x.s !== undefined; });
    var n = ndCt(id).items.length, tks = n && sc.length && sc.every(function (x) { return x.t && x.t.length === n && x.t.indexOf('-') < 0; }) ? sc.map(function (x) { return ndTk(x.t, n); }) : null, dk = [];
    if (tks) for (var k = 0; k < n; k++) { if (tks.some(function (t) { return t[k] !== tks[0][k]; })) dk.push(k); }
    var vals = sc.map(function (x) { return x.s; }), same = vals.length && vals.every(function (v) { return v === vals[0]; });
    var kind = !vals.length ? 'none' : same ? (vals[0] === 2 ? 'met' : 'unmet') : 'diff';
    var isRe = re.indexOf(id) >= 0;
    return { id: id, sc: sc, kind: kind, spot: kind === 'met' && ndSpot(dept, day, id), re: isRe, low: vals.length ? Math.min.apply(null, vals) : null, n: n, tks: tks, dk: dk,
      look: kind === 'diff' || kind === 'unmet' || isRe || (kind === 'met' && ndSpot(dept, day, id)) };
  });
}
function ndSelKey(dept, day) { return dept + '|' + day; }
function ndSelOf(dept, day) { var k = ndSelKey(dept, day); return (_nd.sel[k] = _nd.sel[k] || {}); }
function ndPick(dept, day, id, v) { var S = ndSelOf(dept, day); S[id] = v; delete S['ft#' + id]; ndKeepScroll(); }
// the checker answers an item the cards differ on; when all such items are answered the score follows (Step 2d)
function ndPickItem(dept, day, id, k, v) {
  var S = ndSelOf(dept, day), x = ndCompare(dept, day).find(function (r) { return r.id === id; }); if (!x || !x.tks) return;
  S[id + '#' + k] = v;
  if (x.dk.every(function (j) { return (id + '#' + j) in S; })) {
    var t = x.tks[0].map(function (val, j) { return x.dk.indexOf(j) >= 0 ? S[id + '#' + j] : val; });
    S[id] = ndMovScore(t); S['ft#' + id] = ndTkStr(t);
  } else { delete S[id]; delete S['ft#' + id]; }
  ndKeepScroll();
}
function ndAbsent(dept, day, m) {
  var up = {}; up['sc_pcards/' + _nd.code + '/' + dept + '/day_' + day + '/' + m + '/absent'] = { at: new Date().toISOString(), by: ndMob() };
  ndPut(up); ndKeepScroll();
}
// the outcome of a re-check: Met closes the action; still unmet sends it to the Supervisor
function ndRecheckUp(up, id, s) {
  var a = (_nd.actions || {})[id]; if (!a || a.status !== 'fixed') return;
  var b = 'sc_dactions/' + _nd.code + '/' + id;
  up[b + '/rc'] = { at: new Date().toISOString(), by: ndMob(), s: s };
  up[b + '/status'] = s === 2 ? 'closed' : 'sup'; if (s !== 2) up[b + '/level'] = 'sup';
}
function ndCheckDone(dept, day) {
  var rows = ndCompare(dept, day), sel = ndSelOf(dept, day), base = 'sc_dcards/' + _nd.code + '/' + dept + '/day_' + day, up = {}, me = ndMob(), sent = 0, re = {};
  rows.forEach(function (x) {
    if (x.kind === 'none') return;
    var v = x.id in sel ? sel[x.id] : (x.kind === 'met' || x.kind === 'unmet' ? x.sc[0].s : undefined);
    if (v === undefined) return;
    if (v === 'esc') { up[base + '/esc/' + x.id] = true; sent++; return; }
    up[base + '/f/' + x.id] = v; up[base + '/via/' + x.id] = (x.kind === 'met' || x.kind === 'unmet') && v === x.sc[0].s ? 'auto' : 'chk';
    var ft = sel['ft#' + x.id] || (x.tks && !(x.id in sel) ? ndTkStr(x.tks[0].map(function (val, j) { return x.tks.every(function (t) { return t[j] === 1; }) ? 1 : 0; })) : null);
    if (ft && v !== 2) up[base + '/ft/' + x.id] = ft;
    if (x.re) re[x.id] = v;
  });
  up[base + '/chk'] = { at: new Date().toISOString(), by: me, byName: String(ndName(me)).slice(0, 80) };
  ndPut(up);
  var up2 = {}; Object.keys(re).forEach(function (id) { ndRecheckUp(up2, id, re[id]); }); if (Object.keys(up2).length) ndPut(up2);
  ndToast('Check done' + (sent ? ' — ' + sent + ' sent to the lead.' : '.'), 'ok'); ndCloseCard();
}

// ── lead: decide what was sent up; assign actions (ready-made) ──
function ndEscItems(mob) {
  var out = [];
  Object.keys(_nd.cards || {}).forEach(function (dept) { if (!ndCanVerify(dept, mob)) return; var days = _nd.cards[dept] || {};
    Object.keys(days).forEach(function (k) { var r = days[k] || {}, n = +k.replace('day_', ''); Object.keys(r.esc || {}).forEach(function (id) { out.push({ dept: dept, day: n, id: id, late: ndHours((r.chk || {}).at) > ND_DECIDE_DUE_H }); }); }); });
  return out;
}
function ndUnassigned(mob) {   // unmet (checked) checkpoints with no live action, for the departments this person leads
  var F = ndLatestFinal(), A = _nd.actions || {};
  return Object.keys(F).filter(function (id) { var x = F[id], a = A[id]; return x.s < 2 && ndCanVerify(x.dept, mob) && (!a || a.status === 'closed'); })
    .map(function (id) { return { id: id, dept: F[id].dept, day: F[id].day, s: F[id].s }; });
}
function ndChecksDue(mob) {   // department-days ready to check (or overdue, for the lead)
  var out = [], today = ndDay(), S = ndShape(), from = today > S.eN && today <= S.days + 30 ? Math.min(S.e1, today - 13) : today - 13;   // readiness week: every end-line day
  ndDeptDefs().forEach(function (d) {
    for (var n = Math.max(1, from); n <= Math.min(today, ndLastDay()); n++) {
      var res = ndRes(d.id, n); if (res.chk || ndGradLocked(n)) continue;
      var inn = ndCardsIn(d.id, n); if (!inn.done.length) continue;
      var solo = ndSolo(d.id);
      if (solo && !ndCompare(d.id, n).some(function (x) { return x.re || x.spot; })) continue;   // one card: nothing to spot-check or re-check
      var late = ndHours(inn.lastDone) > ND_CHECK_DUE_H;
      if (ndChecker(d.id) === mob || (late && ndCanVerify(d.id, mob))) out.push({ dept: d.id, day: n, ready: !inn.waiting.length, late: late, solo: solo });
    }
  });
  return out;
}
function ndDecide(dept, day, id, v) {
  var base = 'sc_dcards/' + _nd.code + '/' + dept + '/day_' + day, me = ndMob(), up = {};
  up[base + '/dec/' + id] = { s: v, by: me, at: new Date().toISOString() }; up[base + '/f/' + id] = v; up[base + '/via/' + id] = 'lead'; up[base + '/esc/' + id] = null;
  ndPut(up);
  var up2 = {}; ndRecheckUp(up2, id, v); if (Object.keys(up2).length) ndPut(up2);
  ndToast('Decided: ' + ['Not met', 'Partial', 'Met'][v] + '.', 'ok'); ndKeepScroll();
}
// built-in How to fix loaded before an action is made from it (waits at most 4 s; offline it goes on without)
function ndFixReady() {
  var T = _nd && _nd.cfg && _nd.cfg.id; if (!T || ND_FIX[T] || typeof nfDeptFixLoad !== 'function') return Promise.resolve();
  return Promise.race([nfDeptFixLoad(T), new Promise(function (ok) { setTimeout(ok, 4000); })]).catch(function () {});
}
// ready-made action: from the most common reason on the unmet cards and the checkpoint's means of verification
function ndSuggest(id, dept, day) {
  var fx = ndFixFor(id, dept, day);
  if (fx) { var owner0 = ndCpFor(dept, id)[0] || ndLead(dept) || ndMob(); return { how: fx.how, owner: owner0, due: fx.due, k: fx.k, ev: fx.ev, tm: fx.tm, each: fx.each, src: 'm' }; }
  var r = _nd.byId[id] || [], cards = ndPc(dept, day), tally = {}, low = [], best = null;
  Object.keys(cards).forEach(function (m) { var c = cards[m] || {}; if (!c.done || c.absent) return; var v = (c.s || {})[id]; if (v === 0 || v === 1) { low.push(m); var k = (c.r || {})[id]; if (k) tally[k] = (tally[k] || 0) + 1; } });
  Object.keys(tally).forEach(function (k) { if (!best || tally[k] > tally[best]) best = k; });
  var rs = ndReason(best), mov = r[7] || r[5] || '', note = '';
  Object.keys(cards).forEach(function (m) { var t = ((cards[m] || {}).note || {})[id]; if (t && !note) note = t; });
  var how = rs && rs.a ? rs.a + (mov ? ' — check: ' + mov : '') : (note ? 'Fix: ' + note + (mov ? ' — check: ' + mov : '') : 'Arrange: ' + mov);
  return { how: how.slice(0, 600), owner: low.length === 1 ? low[0] : (ndLead(dept) || ndMob()), due: ndAddDays(ndToday(), 7) };
}
function ndAssignUp(up, id, dept, x) {
  var me = ndMob();
  var rec = { dept: dept, how: x.how, owner: x.owner, due: x.due, status: 'open', level: 'lead', at: new Date().toISOString(), by: me, byName: String(ndName(me)).slice(0, 80) };
  if (x.k) rec.k = x.k; if (x.src === 'm') rec.src = 'm'; if (x.ev) rec.ev = String(x.ev).slice(0, 400); if (x.tm) rec.tm = String(x.tm).slice(0, 60);
  if (x.each) { var ow = {}; ndFillers(dept).forEach(function (m) { ow[m] = true; }); if (Object.keys(ow).length > 1) { rec.owners = ow; if (!ow[rec.owner]) rec.owner = Object.keys(ow)[0]; } }
  up['sc_dactions/' + _nd.code + '/' + id] = rec;
}
async function ndAssignQuick(id) {
  await ndFixReady();
  var it = ndUnassigned(ndMob()).find(function (x) { return x.id === id; }); if (!it) return;
  var up = {}; ndAssignUp(up, id, it.dept, ndSuggest(id, it.dept, it.day)); ndPut(up); ndToast('Action assigned.', 'ok'); ndKeepScroll();
}
async function ndAssignAll(dept) {
  await ndFixReady();
  var up = {}, n = 0; ndUnassigned(ndMob()).filter(function (x) { return x.dept === dept; }).forEach(function (x) { ndAssignUp(up, x.id, x.dept, ndSuggest(x.id, x.dept, x.day)); n++; });
  if (n) { ndPut(up); ndToast(n + ' actions assigned.', 'ok'); ndKeepScroll(); }
}
async function ndAssign(id) {   // change the text / owner / due before assigning (lead), or write how to fix (Supervisor)
  await ndFixReady();
  var r0 = _nd.byId[id]; if (!r0) return;
  var a = (_nd.actions || {})[id], sup = _nd.view === 'sup', it = ndUnassigned(ndMob()).find(function (x) { return x.id === id; });
  var dept = r0[1], sug = a && a.status !== 'closed' ? a : ndSuggest(id, dept, it ? it.day : ndDay()), staff = ndStaff();
  var opts = Object.keys(staff).map(function (m) { return { value: m, label: (staff[m].name || m) + ' · ' + ndRoleLabel(staff[m].role || _nd.cfg.inCharge) }; });
  var r = null;
  try { r = await scDialog({ title: (sup ? 'How to fix · ' : 'Action · ') + id, icon: '🔧', message: ndCpText(id) + (a && a.rc ? '\nStill ' + ['Not met', 'Partial'][a.rc.s] + ' after the fix.' : ''), fields: [
    { key: 'how', label: 'How to fix', type: 'textarea', maxLength: 600, value: sug.how || '' },
    { key: 'owner', label: 'Who does it', type: 'select', options: opts, value: sug.owner || ndLead(dept) || '' },
    { key: 'due', label: 'Due date', type: 'date', value: sug.due || ndAddDays(ndToday(), 7) }], okLabel: sup ? 'Save and send' : 'Assign' }); } catch (e) { r = null; }
  if (!r) return; var how = String(r.how || '').trim();
  if (how.length < 3 || !/^\d{10}$/.test(r.owner || '') || !/^\d{4}-\d{2}-\d{2}$/.test(r.due || '')) { ndToast('Fill in how to fix, who and the due date.', 'err'); return; }
  var up = {}, b = 'sc_dactions/' + _nd.code + '/' + id;
  if (sup) up[b] = nxSupRec(id, how, r.owner, r.due);
  else ndAssignUp(up, id, dept, { how: how.slice(0, 600), owner: r.owner, due: r.due });
  ndPut(up); ndToast(sup ? 'Sent to ' + ndName(r.owner) + '.' : 'Action assigned.', 'ok'); ndKeepScroll();
}
async function ndFixAction(id) {
  var a0 = (_nd.actions || {})[id] || {}, me0 = ndMob();
  if (a0.owners && a0.owners[me0] && !(a0.dn || {})[me0]) {   // "each staff member": my part; the last one marks the action fixed
    var left = Object.keys(a0.owners).filter(function (m) { return m !== me0 && !(a0.dn || {})[m]; });
    if (left.length) { var u0 = {}; u0['sc_dactions/' + _nd.code + '/' + id + '/dn/' + me0] = { at: new Date().toISOString() }; ndPut(u0); ndToast('Your part is done. ' + left.length + ' more to do it.', 'ok'); ndKeepScroll(); return; }
  }
  var r = null; try { r = await scDialog({ title: 'Mark fixed', icon: '✅', message: ndCpText(id), fields: [{ key: 'note', label: 'What was done? (optional)', type: 'textarea', maxLength: 300, value: '' }], okLabel: 'Mark fixed' }); } catch (e) { r = null; }
  if (!r) return; var fx = { at: new Date().toISOString(), by: ndMob(), day: ndDay() }; if (String(r.note || '').trim()) fx.note = String(r.note).trim().slice(0, 300);
  var b = 'sc_dactions/' + _nd.code + '/' + id, up = {}; up[b + '/status'] = 'fixed'; up[b + '/fixed'] = fx;
  var a1 = (_nd.actions || {})[id] || {}; if (a1.owners && a1.owners[ndMob()] && !(a1.dn || {})[ndMob()]) up[b + '/dn/' + ndMob()] = { at: fx.at };
  ndPut(up); ndToast('Marked fixed — it comes back on the next card for a re-check.', 'ok'); ndKeepScroll();
}
// ── actions list (everyone) and the Supervisor's week ──
function ndMyActions() {
  var me = ndMob(), all = ndIsInCharge(me), A = _nd.actions || {};
  return Object.keys(A).filter(function (id) { var a = A[id]; return a && a.status === 'open' && (all || (a.owners ? !!a.owners[me] && !(a.dn || {})[me] : a.owner === me)); }).sort(function (x, y) { return String(A[x].due).localeCompare(String(A[y].due)); });
}
function ndWaLink(mob, text) { return 'https://wa.me/91' + mob + '?text=' + encodeURIComponent(text); }
// ── Today: one "To do today" list, then my departments ──
function ndTodo(mob) {
  var day = ndDay(), fill = ndDeptDefs().filter(function (d) { var c = ndPc(d.id, day)[mob] || {}; return ndFills(d.id, mob) && !c.done && !c.absent && !ndRes(d.id, day).chk && ndMyIds(d.id, day, mob).length; });
  var late = [];   // missed days still open (not checked) — catch up
  ndDeptDefs().forEach(function (d) { if (!ndFills(d.id, mob)) return; for (var n = Math.max(1, day - 13); n < Math.min(day, ndLastDay() + 1); n++) { var c = ndPc(d.id, n)[mob] || {}; if (!c.done && !c.absent && !ndRes(d.id, n).chk && !ndGradLocked(n) && ndMyIds(d.id, n, mob).length) late.push({ dept: d.id, day: n }); } });
  return { fill: fill, late: late, check: ndChecksDue(mob), decide: ndEscItems(mob), assign: ndUnassigned(mob), fix: ndMyActions() };
}
function ndStreak() {   // days in a row (up to yesterday, plus today when done) with all my cards done
  var me = ndMob(), t = Math.min(ndDay(), ndLastDay()), n = 0;
  var full = function (day) { var ds = ndDeptDefs().filter(function (d) { return ndFills(d.id, me) && ndDayInfo(d.id, day).ids.length; }); if (!ds.length) return null; return ds.every(function (d) { var c = ndPc(d.id, day)[me] || {}; return c.done || c.absent; }); };
  var today = full(t); if (today) n++;
  for (var d = t - 1; d >= 1; d--) { var f = full(d); if (f === null) continue; if (!f) break; n++; }
  return n;
}
function ndMyDepts() { var me = ndMob(); return ndDeptDefs().filter(function (d) { return _nd.view || ndSeesAll(me) || ndFills(d.id, me) || ndCanCheck(d.id, me); }); }
// ═══ Timeline (SC style, 17 Oct): 60 days in weeks, my status per day, tap a day to see / fill / catch up ═══
// A past day's card stays open until the checker has checked that day (HealSol 17 Oct): missed Tuesday → catch up Wednesday.
var ND_ST = {
  upcoming: { t: 'Upcoming', i: 'ti-calendar' }, today: { t: 'Today', i: 'ti-player-play' }, awaiting: { t: 'Done · awaiting check', i: 'ti-clock' },
  verified: { t: 'Checked', i: 'ti-shield-check' }, overdue: { t: 'Missed — catch up', i: 'ti-alert-triangle' }, none: { t: 'No card', i: 'ti-minus' }
};
var _ndWkOpen = {};
function ndDateOf(day) { var cu = day > 100 && typeof ndCu === 'function' ? ndCu() : null; if (cu && cu.start) return ndAddDays(cu.start, day - 101); return _nd.fac.startDate ? ndAddDays(_nd.fac.startDate, day - 1) : ''; }
function ndShortDate(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? (+m[3]) + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m[2] - 1] : ''; }
// my status for one department on one day
function ndMySt(dept, day) {
  var me = ndMob(), today = ndDay(), res = ndRes(dept, day);
  if (!ndDayInfo(dept, day).ids.length) return 'none';
  if (day > today) return 'upcoming';
  if (res.chk || ndSoloDone(dept, day)) return 'verified';
  if (!_nd.view && ndFills(dept, me) && !ndMyIds(dept, day, me).length && !ndCanCheck(dept, me)) return 'none';
  if (!_nd.view && ndFills(dept, me)) { var c = ndPc(dept, day)[me] || {}; return c.done ? 'awaiting' : c.absent ? 'none' : day === today ? 'today' : 'overdue'; }
  var inn = ndCardsIn(dept, day);
  if (inn.done.length) return 'awaiting';
  return day === today ? 'today' : day < today ? 'overdue' : 'upcoming';
}
var ND_ST_RANK = ['overdue', 'today', 'awaiting', 'verified', 'upcoming', 'none'];
function ndDaySt(day) {
  var depts = ndMyDepts(), best = 'none';
  depts.forEach(function (d) { var s = ndMySt(d.id, day); if (ND_ST_RANK.indexOf(s) < ND_ST_RANK.indexOf(best)) best = s; });
  return best;
}
function ndDayTitle(day) {
  var d0 = ndMyDepts()[0] || (_nd.cfg.departments || [])[0], info = d0 ? ndDayInfo(d0.id, day) : { phase: 'baseline' };
  var S = ndShape(); if (day > 100) return ndWeekLabel(day); if (day >= S.r1 && day <= S.rN) { var k = day - S.r1, n = S.ready; return k >= n - 1 ? 'Graduation' : k === n - 2 ? 'Final team review' : 'End-line verification'; }
  return ND_PHASE[info.phase] + (info.week ? ' · week ' + info.week : '');
}
// ═══ Cards tab in the SC design (17 Oct): Cards head · Day / Timeline switch · facility bar · day strip · the day card ═══
function ndCur() { return _nd.card || { dept: _nd.cdept, day: _nd.cday }; }
function ndAocColor(a) { try { if (typeof getAoCDef === 'function') { var c = (getAoCDef(a) || {}).color; if (c) return c; } } catch (e) {} return '#1E6B5E'; }
function ndWeekLabel(day) { var S = ndShape(); if (day > 100) return day - 100 > ND_GRAD.cuWork ? 'Catch-up re-check' : 'Catch-up week ' + Math.ceil((day - 100) / 7); return day <= S.bN ? 'Baseline' : day <= S.iN ? 'Week ' + (Math.floor((day - S.i1) / 7) + 1 + Math.ceil(S.base / 7)) : day <= S.eN ? 'End-line' : 'Readiness week'; }
function ndCardDepts(day) {   // my departments with a card on this day: the ones I fill first, then the ones I check
  var me = ndMob();
  return ndMyDepts().filter(function (d) { return ndDayIds(d.id, day).length && (_nd.view || (ndFills(d.id, me) && ndMyIds(d.id, day, me).length) || ndCanCheck(d.id, me)); })
    .sort(function (a, b) { return (ndFills(b.id, me) ? 1 : 0) - (ndFills(a.id, me) ? 1 : 0); });
}
function ndGoCard(dept, day) { _nd.tab = 'cards'; _nd.cv = 'day'; _nd.cday = day; _nd.cdept = dept; _nd.card = null; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndOpenDay(day) { ndGoCard(null, day); }
function ndCv(v) { _nd.cv = v; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }