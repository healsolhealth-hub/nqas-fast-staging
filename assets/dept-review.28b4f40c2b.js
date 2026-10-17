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
function ndFillers(id) {   // the team, without the checker (she checks their cards; she fills only if nobody else does)
  var st = ndStaff(), ck = ndDeptSet(id).checker || ndDeptSet(id).xcheck || '', all = Object.keys(ndTeam(id)).filter(function (m) { return st[m]; });
  var t = all.filter(function (m) { return m !== ck; }); if (!t.length) t = all;
  if (!t.length && ndLead(id) && st[ndLead(id)]) t = [ndLead(id)];
  return t;
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
  var cards = ndPc(dept, day), fl = ndFillers(dept), done = [], absent = [], waiting = [];
  Object.keys(cards).forEach(function (m) { if (fl.indexOf(m) < 0 && cards[m] && cards[m].done) fl.push(m); });   // a card from someone since moved
  fl.forEach(function (m) { var c = cards[m] || {}; if (c.absent) absent.push(m); else if (c.done) done.push(m); else waiting.push(m); });
  var last = done.reduce(function (x, m) { var a = (cards[m].done || {}).at || ''; return a > x ? a : x; }, '');
  return { fillers: fl, done: done, absent: absent, waiting: waiting, lastDone: last };
}
// latest score per checkpoint: the day result where checked, else the lowest score on that day's filled cards
function ndLatest() {
  var out = {}, seen = {};
  var put = function (id, v, n, fin) { if (!(id in seen) || seen[id].n < n || (seen[id].n === n && fin && !seen[id].fin)) { seen[id] = { n: n, fin: fin }; out[id] = v; } };
  Object.keys(_nd.cards || {}).forEach(function (dept) { var days = _nd.cards[dept] || {};
    Object.keys(days).forEach(function (k) { var n = +k.replace('day_', ''), f = (days[k] || {}).f || {}; Object.keys(f).forEach(function (id) { put(id, f[id], n, true); }); }); });
  Object.keys(_nd.pcards || {}).forEach(function (dept) { var days = _nd.pcards[dept] || {};
    Object.keys(days).forEach(function (k) {
      var n = +k.replace('day_', ''); if ((ndRes(dept, n) || {}).chk) return;
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
  return out;
}

// ── writes: applied on the phone at once, sent when there is signal (kept on the phone until the server confirms) ──
var _ndQ = [], _ndOnline = true;
function ndQKey() { return 'nd_q_' + ((_nd && _nd.code) || ''); }
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
  _nd.card = { dept: dept, day: day, mode: mode }; _nd.sel = {}; ndRender(); try { window.scrollTo(0, 0); } catch (e) {}
}
function ndOpenCard(dept, day) { ndOpenDept(dept, day); }
function ndCloseCard() { _nd.card = null; ndRender(); }
function ndMode(m) { _nd.card.mode = m; ndRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function ndCardHTML() {
  var c = _nd.card, d = ndDeptDef(c.dept), info = ndDayInfo(c.dept, c.day), me = ndMob();
  var both = !_nd.view && ndFills(c.dept, me) && ndCanCheck(c.dept, me);
  var h = '<header class="nd-hd"><button type="button" class="nd-ib" aria-label="Back" onclick="ndCloseCard()"><i class="ti ti-arrow-left"></i></button>'
    + '<div><small>Day ' + c.day + ' · ' + ND_PHASE[info.phase] + (info.week ? ' · week ' + info.week : '') + '</small><b>' + ndEsc(d.name) + '</b>'
    + '<span class="nd-sub">' + (c.mode === 'fill' ? 'My card' : c.mode === 'check' ? 'Check · compare the cards' : 'View') + '</span></div>'
    + '<span class="nd-qb" id="nd-q" hidden></span></header>';
  if (both) h += '<div class="nd-seg"><button type="button" class="' + (c.mode === 'fill' ? 'on' : '') + '" onclick="ndMode(\'fill\')">My card</button><button type="button" class="' + (c.mode !== 'fill' ? 'on' : '') + '" onclick="ndMode(\'check\')">Check</button></div>';
  return h + (c.mode === 'fill' ? ndFillHTML(c.dept, c.day) : ndCheckHTML(c.dept, c.day, c.mode !== 'check'));
}
function ndGroups(ids) {
  var groups = [], cur = null, re = ndRecheckIds(_nd.card.dept, _nd.card.day), plan = ndDayInfo(_nd.card.dept, _nd.card.day).ids;
  ids.forEach(function (id) { var r = _nd.byId[id]; if (!r) return; var key = plan.indexOf(id) < 0 && re.indexOf(id) >= 0 ? '__re' : r[3];
    if (!cur || cur.key !== key) { cur = { key: key, rows: [] }; groups.push(cur); } cur.rows.push(r); });
  return groups;
}
function ndCpHead(r) {
  var m = String(r[6] || '').split('/').filter(Boolean);
  return '<div class="nd-cpt"><span class="nd-id">' + ndEsc(r[0]) + ' · ME ' + ndEsc(r[4]) + '</span>' + ndEsc(r[5]) + '</div>'
    + (r[7] ? '<div class="nd-mov"><i class="ti ti-search"></i>' + ndEsc(r[7]) + '</div>' : '')
    + '<div class="nd-meth">' + m.map(function (x) { return '<span title="' + ndEsc(ND_METHOD[x] || x) + '">' + ndEsc(x) + '</span>'; }).join('') + '</div>';
}
function ndFillHTML(dept, day) {
  var me = ndMob(), c = ndPc(dept, day)[me] || {}, s = c.s || {}, rs = c.r || {}, nt = c.note || {}, res = ndRes(dept, day);
  var ids = ndDayIds(dept, day), locked = !!res.chk || !ndFills(dept, me), n = ids.filter(function (i) { return s[i] !== undefined; }).length;
  var h = '<main class="nd-main">';
  if (res.chk) h += '<div class="nd-note ok"><i class="ti ti-circle-check"></i><span>Checked by ' + ndEsc(res.chk.byName || ndName(res.chk.by)) + '. Your card is closed.</span></div>';
  else if (c.done) h += '<div class="nd-note"><i class="ti ti-clock"></i><span>Done. You can still change a score until ' + ndEsc(ndName(ndChecker(dept))) + ' checks the cards.</span></div>';
  else if (!locked) h += '<div class="nd-note"><i class="ti ti-info-circle"></i><span>Fill this for your own area. Tap <b>All Met</b> for a Standard, then change only what is not met.</span></div>';
  ndGroups(ids).forEach(function (g) {
    var open = g.rows.filter(function (r) { return s[r[0]] === undefined; }).length;
    h += '<div class="nd-std"><div><b>' + (g.key === '__re' ? 'Re-check after a fix' : 'Standard ' + ndEsc(g.key)) + '</b><small>' + ndEsc(g.key === '__re' ? 'An action was marked fixed — score it again' : (_nd.cl.stds[g.key] || '')) + '</small></div>'
      + (!locked && open ? '<button type="button" class="nd-allmet" onclick="ndAllMet(\'' + g.rows.map(function (r) { return r[0]; }).join(',') + '\')">All Met</button>' : '') + '</div>';
    g.rows.forEach(function (r) {
      var id = r[0], v = s[id];
      h += '<div class="nd-cp" id="nd-cp-' + id + '">' + ndCpHead(r)
        + '<div class="nd-sc">' + ND_SCORE.map(function (o) { return '<button type="button" class="' + o.k + (v === o.v ? ' on' : '') + '"' + (locked ? ' disabled' : '') + ' onclick="ndScore(\'' + id + '\',' + o.v + ')">' + o.t + '</button>'; }).join('') + '</div>';
      if (v === 0 || v === 1) {
        h += '<div class="nd-rs">' + ND_REASONS.map(function (x) { return '<button type="button" class="' + (rs[id] === x.k ? 'on' : '') + '"' + (locked ? ' disabled' : '') + ' onclick="ndReasonSet(\'' + id + '\',\'' + x.k + '\')">' + ndEsc(x.t) + '</button>'; }).join('') + '</div>';
        if (rs[id] === 'oth' || nt[id]) h += '<input class="nd-in" maxlength="300" placeholder="What is missing?" value="' + ndEsc(nt[id] || '') + '"' + (locked ? ' disabled' : '') + ' onchange="ndNote(\'' + id + '\',this.value)">';
      }
      h += '</div>';
    });
  });
  h += '</main><footer class="nd-ft"><span>' + n + ' of ' + ids.length + ' scored</span>';
  if (!locked && !c.done) h += '<button type="button" class="nd-btn"' + (n < ids.length ? ' disabled title="Score every checkpoint first"' : '') + ' onclick="ndDone()">Mark done</button>';
  return h + '</footer>';
}
function ndMyBase() { return 'sc_pcards/' + _nd.code + '/' + _nd.card.dept + '/day_' + _nd.card.day + '/' + ndMob(); }
function ndCardWrite(rel) {
  var base = ndMyBase(), up = {}, me = ndMob();
  Object.keys(rel).forEach(function (k) { up[base + '/' + k] = rel[k]; });
  up[base + '/at'] = new Date().toISOString(); up[base + '/name'] = String(ndName(me)).slice(0, 80);
  return ndPut(up);
}
function ndKeepScroll() { var y = window.scrollY; ndRender(); try { window.scrollTo(0, y); } catch (e) {} }
function ndScore(id, v) { var rel = {}; rel['s/' + id] = v; if (v === 2) { rel['r/' + id] = null; rel['note/' + id] = null; } ndCardWrite(rel); ndKeepScroll(); }
function ndAllMet(list) {
  var me = ndMob(), c = ndPc(_nd.card.dept, _nd.card.day)[me] || {}, s = c.s || {}, rel = {};
  list.split(',').forEach(function (id) { if (s[id] === undefined) rel['s/' + id] = 2; });
  if (Object.keys(rel).length) { ndCardWrite(rel); ndKeepScroll(); }
}
function ndReasonSet(id, k) { var rel = {}; rel['r/' + id] = k; ndCardWrite(rel); ndKeepScroll(); }
function ndNote(id, t) { var rel = {}; rel['note/' + id] = String(t || '').trim().slice(0, 300) || null; ndCardWrite(rel); }
function ndDone() { ndCardWrite({ done: { at: new Date().toISOString(), role: ndRole(ndMob()) } }); ndToast('Card done. ' + ndName(ndChecker(_nd.card.dept)) + ' compares the cards next.', 'ok'); ndCloseCard(); }

// ── checker: one comparison screen ──
function ndCompare(dept, day) {
  var cards = ndPc(dept, day), inn = ndCardsIn(dept, day), re = ndRecheckIds(dept, day);
  return ndDayIds(dept, day).map(function (id) {
    var sc = inn.done.map(function (m) { var c = cards[m] || {}; return { m: m, s: (c.s || {})[id], r: (c.r || {})[id], note: (c.note || {})[id] }; }).filter(function (x) { return x.s !== undefined; });
    var vals = sc.map(function (x) { return x.s; }), same = vals.length && vals.every(function (v) { return v === vals[0]; });
    var kind = !vals.length ? 'none' : same ? (vals[0] === 2 ? 'met' : 'unmet') : 'diff';
    var isRe = re.indexOf(id) >= 0;
    return { id: id, sc: sc, kind: kind, spot: kind === 'met' && ndSpot(dept, day, id), re: isRe, low: vals.length ? Math.min.apply(null, vals) : null,
      look: kind === 'diff' || kind === 'unmet' || isRe || (kind === 'met' && ndSpot(dept, day, id)) };
  });
}
function ndSelKey(dept, day) { return dept + '|' + day; }
function ndSelOf(dept, day) { var k = ndSelKey(dept, day); return (_nd.sel[k] = _nd.sel[k] || {}); }
function ndCheckHTML(dept, day, ro) {
  var me = ndMob(), res = ndRes(dept, day), inn = ndCardsIn(dept, day), can = !ro && ndCanCheck(dept, me) && !res.chk;
  var h = '<main class="nd-main">';
  // who is in
  h += '<div class="nd-card"><b>Cards</b><div class="nd-who">' + inn.fillers.map(function (m) {
    var st = inn.done.indexOf(m) >= 0 ? 'ok' : inn.absent.indexOf(m) >= 0 ? 'na' : 'wait';
    return '<span class="nd-pill ' + st + '">' + ndEsc(ndName(m)) + ' · ' + (st === 'ok' ? 'done' : st === 'na' ? 'not filled today' : 'awaited')
      + (st === 'wait' && can ? ' <button type="button" onclick="ndAbsent(\'' + dept + '\',' + day + ',\'' + m + '\')">Not filled today</button>' : '') + '</span>';
  }).join('') + '</div>' + (inn.fillers.length ? '' : '<p class="nd-dim">No team set for this department — the in-charge adds people in Set-up.</p>') + '</div>';
  if (res.chk) h += '<div class="nd-note ok"><i class="ti ti-circle-check"></i><span>Checked by ' + ndEsc(res.chk.byName || ndName(res.chk.by)) + '.' + (Object.keys(res.esc || {}).length ? ' ' + Object.keys(res.esc).length + ' sent to the lead.' : '') + '</span></div>';
  if (!inn.done.length) return h + '<div class="nd-card nd-empty"><i class="ti ti-clock"></i><b>No card is done yet</b><p>The comparison opens when the cards come in.</p></div></main>';
  if (inn.waiting.length && !res.chk) h += '<div class="nd-note"><i class="ti ti-clock"></i><span>Waiting for ' + inn.waiting.map(ndName).map(ndEsc).join(', ') + '. Check now by marking them "Not filled today", or wait.</span></div>';
  var rows = ndCompare(dept, day), sel = ndSelOf(dept, day);
  var cnt = { met: 0, spot: 0, unmet: 0, diff: 0, re: 0 }; rows.forEach(function (x) { if (x.re) cnt.re++; else if (x.kind === 'diff') cnt.diff++; else if (x.kind === 'unmet') cnt.unmet++; else if (x.spot) cnt.spot++; else if (x.kind === 'met') cnt.met++; });
  h += '<div class="nd-card nd-sum4"><div><b class="ok">' + cnt.met + '</b><small>agreed Met · done</small></div><div><b>' + cnt.spot + '</b><small>spot-check</small></div><div><b>' + cnt.unmet + '</b><small>agreed unmet</small></div><div><b class="warn">' + cnt.diff + '</b><small>cards differ</small></div></div>';
  var look = rows.filter(function (x) { return x.look; }), order = { diff: 0, unmet: 1, met: 2, none: 3 };
  look.sort(function (a, b) { return (a.re ? -1 : 0) - (b.re ? -1 : 0) || order[a.kind] - order[b.kind]; });
  // the comparison table (as agreed): checkpoints as rows, one column per person, then the decision and where it goes
  var cols = inn.done, chip = function (v) { return v === undefined ? '<span class="nd-c na">—</span>' : '<span class="nd-c s' + v + '">' + ['Not met', 'Partial', 'Met'][v] + '</span>'; };
  var where = function (x, cur) {
    if (cur === 'esc') return 'Lead decides';
    if (cur === undefined) return x.kind === 'diff' ? 'Choose, or send to the lead' : '';
    return cur === 2 ? 'Closed as Met' + (x.re ? ' · action closed' : '') : x.re ? 'Still unmet → Supervisor' : 'Lead assigns an action';
  };
  var groups = [['re', 'Re-check after a fix'], ['diff', 'Cards differ — settle or send to the lead'], ['unmet', 'All cards say unmet — confirm'], ['spot', 'Spot-check (1 in ' + ND_SPOT + ' agreed Met)']];
  var grp = function (x) { return x.re ? 're' : x.kind === 'diff' ? 'diff' : x.kind === 'unmet' ? 'unmet' : 'spot'; };
  h += '<div class="nd-tblw"><table class="nd-cmpt"><thead><tr><th class="cp">Checkpoint</th>' + cols.map(function (m) { return '<th>' + ndEsc(ndName(m)) + '</th>'; }).join('') + '<th class="dec">Decision · where it goes</th></tr></thead><tbody>';
  groups.forEach(function (g) {
    var list = look.filter(function (x) { return grp(x) === g[0]; }); if (!list.length) return;
    h += '<tr class="nd-gr"><th colspan="' + (cols.length + 2) + '">' + ndEsc(g[1]) + ' · ' + list.length + '</th></tr>';
    list.forEach(function (x) {
      var r = _nd.byId[x.id]; if (!r) return;
      var cur = res.chk ? (res.esc && res.esc[x.id] ? 'esc' : (res.f || {})[x.id]) : (x.id in sel ? sel[x.id] : (x.kind === 'met' || x.kind === 'unmet' ? x.sc[0].s : undefined));
      var by = {}; x.sc.forEach(function (v) { by[v.m] = v; });
      h += '<tr class="nd-cmpr' + (x.kind === 'diff' && cur === undefined ? ' todo' : '') + '" id="nd-cmp-' + x.id + '"><td class="cp"><b>' + ndEsc(x.id) + '</b><span>' + ndEsc(r[5]) + '</span>' + (r[7] ? '<small><i class="ti ti-search"></i> ' + ndEsc(r[7]) + '</small>' : '') + '</td>'
        + cols.map(function (m) { var v = by[m] || {}, rr = ndReason(v.r); return '<td class="pc">' + chip(v.s) + (rr ? '<small>' + ndEsc(rr.t) + '</small>' : '') + (v.note ? '<small>“' + ndEsc(v.note) + '”</small>' : '') + '</td>'; }).join('')
        + '<td class="dec"><div class="nd-seg3">' + ND_SCORE.map(function (o) { return '<button type="button" class="' + o.k + (cur === o.v ? ' on' : '') + '"' + (!can ? ' disabled' : '') + ' title="' + o.t + '" onclick="ndPick(\'' + dept + '\',' + day + ',\'' + x.id + '\',' + o.v + ')">' + o.t + '</button>'; }).join('')
        + (x.kind === 'diff' ? '<button type="button" class="esc' + (cur === 'esc' ? ' on' : '') + '"' + (!can ? ' disabled' : '') + ' onclick="ndPick(\'' + dept + '\',' + day + ',\'' + x.id + '\',\'esc\')">To lead</button>' : '') + '</div>'
        + '<small class="nd-where">' + ndEsc(where(x, cur)) + '</small></td></tr>';
    });
  });
  h += '</tbody></table></div>';
  var auto = rows.filter(function (x) { return x.kind === 'met' && !x.look; });
  if (auto.length) h += '<details class="nd-card nd-dset"><summary><span class="nd-dn"><b>' + auto.length + ' agreed Met · closed automatically</b><small>every card says Met — the lead never sees them</small></span></summary>'
    + auto.map(function (x) { return '<div class="nd-srow"><span class="nd-dn"><b>' + ndEsc(x.id) + '</b><small>' + ndEsc(ndCpText(x.id)) + '</small></span><span class="nd-c s2">Met</span></div>'; }).join('') + '</details>';
  var open = look.filter(function (x) { return x.kind === 'diff' && !(x.id in sel); }).length;
  h += '</main><footer class="nd-ft"><span>' + (res.chk ? 'Checked' : open ? open + ' difference' + (open > 1 ? 's' : '') + ' to settle' : 'Ready') + '</span>';
  if (can) h += '<button type="button" class="nd-btn"' + (open || inn.waiting.length ? ' disabled title="' + (inn.waiting.length ? 'Some cards are still awaited' : 'Settle every difference or send it to the lead') + '"' : '') + ' onclick="ndCheckDone(\'' + dept + '\',' + day + ')">Check done</button>';
  return h + '</footer>';
}
function ndPick(dept, day, id, v) { ndSelOf(dept, day)[id] = v; ndKeepScroll(); }
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
  var out = [], today = ndDay();
  ndDeptDefs().forEach(function (d) {
    for (var n = Math.max(1, today - 13); n <= Math.min(today, _nd.cfg.days); n++) {
      var res = ndRes(d.id, n); if (res.chk) continue;
      var inn = ndCardsIn(d.id, n); if (!inn.done.length) continue;
      var late = ndHours(inn.lastDone) > ND_CHECK_DUE_H;
      if (ndChecker(d.id) === mob || (late && ndCanVerify(d.id, mob))) out.push({ dept: d.id, day: n, ready: !inn.waiting.length, late: late });
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
// ready-made action: from the most common reason on the unmet cards and the checkpoint's means of verification
function ndSuggest(id, dept, day) {
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
  up['sc_dactions/' + _nd.code + '/' + id] = { dept: dept, how: x.how, owner: x.owner, due: x.due, status: 'open', level: 'lead', at: new Date().toISOString(), by: me, byName: String(ndName(me)).slice(0, 80) };
}
function ndAssignQuick(id) {
  var it = ndUnassigned(ndMob()).find(function (x) { return x.id === id; }); if (!it) return;
  var up = {}; ndAssignUp(up, id, it.dept, ndSuggest(id, it.dept, it.day)); ndPut(up); ndToast('Action assigned.', 'ok'); ndKeepScroll();
}
function ndAssignAll(dept) {
  var up = {}, n = 0; ndUnassigned(ndMob()).filter(function (x) { return x.dept === dept; }).forEach(function (x) { ndAssignUp(up, x.id, x.dept, ndSuggest(x.id, x.dept, x.day)); n++; });
  if (n) { ndPut(up); ndToast(n + ' actions assigned.', 'ok'); ndKeepScroll(); }
}
async function ndAssign(id) {   // change the text / owner / due before assigning (lead), or write how to fix (Supervisor)
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
  if (sup) { up[b] = { dept: dept, how: how.slice(0, 600), owner: r.owner, due: r.due, status: 'open', level: (a && a.level) || 'sup', at: new Date().toISOString(), by: _nd.supId || 'sup', byName: _nd.supName || '' }; if (a && a.rc) up[b].rc = a.rc; }
  else ndAssignUp(up, id, dept, { how: how.slice(0, 600), owner: r.owner, due: r.due });
  ndPut(up); ndToast(sup ? 'Sent to ' + ndName(r.owner) + '.' : 'Action assigned.', 'ok'); ndKeepScroll();
}
async function ndFixAction(id) {
  var r = null; try { r = await scDialog({ title: 'Mark fixed', icon: '✅', message: ndCpText(id), fields: [{ key: 'note', label: 'What was done? (optional)', type: 'textarea', maxLength: 300, value: '' }], okLabel: 'Mark fixed' }); } catch (e) { r = null; }
  if (!r) return; var fx = { at: new Date().toISOString(), by: ndMob(), day: ndDay() }; if (String(r.note || '').trim()) fx.note = String(r.note).trim().slice(0, 300);
  var b = 'sc_dactions/' + _nd.code + '/' + id, up = {}; up[b + '/status'] = 'fixed'; up[b + '/fixed'] = fx;
  ndPut(up); ndToast('Marked fixed — it comes back on the next card for a re-check.', 'ok'); ndKeepScroll();
}
function ndLeadHTML(mob) {   // the lead's queue (shown on Today and on Actions)
  var esc = ndEscItems(mob), un = ndUnassigned(mob), h = '';
  if (esc.length) {
    h += '<div class="nd-sec"><b>Decide</b><small>' + esc.length + ' sent up by the checker</small></div>';
    esc.forEach(function (x) {
      var r = _nd.byId[x.id]; if (!r) return; var cards = ndPc(x.dept, x.day);
      h += '<div class="nd-cp nd-cmp"><span class="nd-tag warn">' + ndEsc(x.dept) + ' · Day ' + x.day + (x.late ? ' · waiting ' + ND_DECIDE_DUE_H + 'h+' : '') + '</span>' + ndCpHead(r)
        + '<div class="nd-votes">' + Object.keys(cards).filter(function (m) { var c = cards[m] || {}; return c.done && !c.absent && (c.s || {})[x.id] !== undefined; }).map(function (m) { var c = cards[m], v = c.s[x.id], rr = ndReason((c.r || {})[x.id]); return '<span class="nd-vote s' + v + '"><b>' + ndEsc(ndName(m)) + '</b> ' + ['Not met', 'Partial', 'Met'][v] + (rr ? ' · ' + ndEsc(rr.t) : '') + '</span>'; }).join('') + '</div>'
        + '<div class="nd-sc">' + ND_SCORE.map(function (o) { return '<button type="button" class="' + o.k + '" onclick="ndDecide(\'' + x.dept + '\',' + x.day + ',\'' + x.id + '\',' + o.v + ')">' + o.t + '</button>'; }).join('') + '</div></div>';
    });
  }
  if (un.length) {
    h += '<div class="nd-sec"><b>Assign actions</b><small>' + un.length + ' unmet · text ready, one tap</small></div>';
    ndDeptDefs().forEach(function (d) {
      var rows = un.filter(function (x) { return x.dept === d.id; }); if (!rows.length) return;
      h += '<div class="nd-card"><div class="nd-std" style="margin:0 0 6px"><div><b>' + ndEsc(d.name) + '</b><small>' + rows.length + ' unmet</small></div>' + (rows.length > 1 ? '<button type="button" class="nd-allmet" onclick="ndAssignAll(\'' + d.id + '\')">Assign all ' + rows.length + '</button>' : '') + '</div>'
        + rows.map(function (x) { var sg = ndSuggest(x.id, x.dept, x.day); return '<div class="nd-asg"><div class="nd-cpt"><span class="nd-id">' + ndEsc(x.id) + ' · ' + (x.s === 0 ? 'Not met' : 'Partial') + '</span>' + ndEsc(ndCpText(x.id)) + '</div>'
          + '<div class="nd-how"><i class="ti ti-info-circle"></i><span>' + ndEsc(sg.how) + '<br><small>' + ndEsc(ndName(sg.owner)) + ' · due ' + ndEsc(ndDate(sg.due)) + '</small></span></div>'
          + '<div class="nd-row"><button type="button" class="nd-btn" onclick="ndAssignQuick(\'' + x.id + '\')">Assign</button><button type="button" class="nd-btn ghost" onclick="ndAssign(\'' + x.id + '\')">Change</button></div></div>'; }).join('') + '</div>';
    });
  }
  return h;
}

// ── actions list (everyone) and the Supervisor's week ──
function ndMyActions() {
  var me = ndMob(), all = ndIsInCharge(me), A = _nd.actions || {};
  return Object.keys(A).filter(function (id) { var a = A[id]; return a && a.status === 'open' && (all || a.owner === me); }).sort(function (x, y) { return String(A[x].due).localeCompare(String(A[y].due)); });
}
function ndActionRow(id) {
  var a = (_nd.actions || {})[id], me = ndMob(), over = a.status === 'open' && a.due < ndToday(), sup = _nd.view === 'sup';
  var canFix = !_nd.view && a.status === 'open' && (a.owner === me || ndIsInCharge(me));
  var st = { open: ['prog', 'Open'], fixed: ['done', 'Fixed — re-check on the next card'], sup: ['back', 'With the Supervisor'], closed: ['ok', 'Closed'] }[a.status] || ['', a.status];
  return '<div class="nd-cp nd-act"><div class="nd-cpt"><span class="nd-id">' + ndEsc(id) + ' · ' + ndEsc(ndDeptDef(a.dept).name) + (a.level === 'sup' ? ' · Supervisor' : '') + '</span>' + ndEsc(ndCpText(id)) + '</div>'
    + '<div class="nd-how"><i class="ti ti-info-circle"></i><span>' + ndEsc(a.how) + '</span></div>'
    + '<div class="nd-am"><span>' + ndEsc(ndName(a.owner)) + '</span><span class="' + (over ? 'over' : '') + '">due ' + ndEsc(ndDate(a.due)) + (over ? ' · overdue' : '') + '</span><span class="nd-st ' + st[0] + '">' + st[1] + '</span></div>'
    + (a.fixed ? '<div class="nd-dim">Fixed by ' + ndEsc(ndName(a.fixed.by)) + (a.fixed.note ? ': ' + ndEsc(a.fixed.note) : '') + '</div>' : '')
    + (a.rc ? '<div class="nd-dim">Re-check: ' + ['Not met', 'Partial', 'Met'][a.rc.s] + ' (' + ndEsc(ndName(a.rc.by)) + ')</div>' : '')
    + (canFix ? '<div class="nd-row" style="margin-top:8px"><button type="button" class="nd-btn" onclick="ndFixAction(\'' + id + '\')">Mark fixed</button></div>' : '')
    + (sup && (a.status === 'sup' || a.status === 'open') ? '<div class="nd-row" style="margin-top:8px"><button type="button" class="nd-btn' + (a.status === 'open' ? ' ghost' : '') + '" onclick="ndAssign(\'' + id + '\')">' + (a.status === 'sup' ? 'Write how to fix' : 'Change') + '</button></div>' : '')
    + '</div>';
}
function ndWaLink(mob, text) { return 'https://wa.me/91' + mob + '?text=' + encodeURIComponent(text); }
function ndActionsHTML() {
  var A = _nd.actions || {}, ids = Object.keys(A), sup = _nd.view === 'sup', today = ndToday(), wk = ndAddDays(today, 7), me = ndMob();   // rolling week
  var by = function (st) { return ids.filter(function (i) { return A[i].status === st; }).sort(function (a, b) { return String(A[a].due).localeCompare(String(A[b].due)); }); };
  var open = by('open'), fixed = by('fixed'), withSup = by('sup'), closed = by('closed');
  var late = open.filter(function (i) { return ndHours(A[i].due + 'T23:59:59') > ND_ACTION_LATE_D * 24; });
  var h = '<div class="nd-card nd-sum4"><div><b>' + open.length + '</b><small>open</small></div><div><b>' + fixed.length + '</b><small>re-check due</small></div><div><b class="warn">' + withSup.length + '</b><small>with the Supervisor</small></div><div><b class="ok">' + closed.length + '</b><small>closed</small></div></div>';
  if (sup) {
    h += '<div class="nd-sec"><b>Waiting for your how-to-fix</b><small>still unmet after the lead\'s action and the re-check</small></div>' + (withSup.length ? withSup.map(ndActionRow).join('') : '<div class="nd-card nd-dim">Nothing waiting for you.</div>');
    if (late.length) h += '<div class="nd-sec"><b>Overdue ' + ND_ACTION_LATE_D + '+ days</b><small>' + late.length + '</small></div>' + late.map(ndActionRow).join('');
  } else if (!_nd.view) h += ndLeadHTML(me);
  // this week's plan, grouped by owner, with a WhatsApp message per person
  var week = open.filter(function (i) { return A[i].due <= wk; }), owners = {};
  week.forEach(function (i) { (owners[A[i].owner] = owners[A[i].owner] || []).push(i); });
  h += '<div class="nd-sec"><b>Action plan · next 7 days</b><small>due by ' + ndEsc(ndDate(wk)) + '</small></div>';
  if (!week.length) h += '<div class="nd-card nd-dim">Nothing due this week.</div>';
  var share = sup || ndIsInCharge(me);
  Object.keys(owners).forEach(function (m) {
    var list = owners[m], msg = 'NQAS | FAST — ' + (_nd.fac.name || _nd.code) + '\nYour actions (next 7 days):\n' + list.map(function (i, n) { return (n + 1) + '. ' + ndCpText(i) + ' — ' + A[i].how + ' (due ' + ndDate(A[i].due) + ')'; }).join('\n');
    h += '<div class="nd-card"><div class="nd-std" style="margin:0 0 6px"><div><b>' + ndEsc(ndName(m)) + '</b><small>' + list.length + ' action' + (list.length > 1 ? 's' : '') + (list.some(function (i) { return A[i].due < today; }) ? ' · overdue' : '') + '</small></div>'
      + (share ? '<a class="nd-wa" target="_blank" rel="noopener" href="' + ndEsc(ndWaLink(m, msg)) + '"><i class="ti ti-send"></i> WhatsApp</a>' : '') + '</div>' + list.map(ndActionRow).join('') + '</div>';
  });
  var later = open.filter(function (i) { return A[i].due > wk; });
  if (fixed.length) h += '<div class="nd-sec"><b>Fixed — re-check on the next card</b><small>' + fixed.length + '</small></div>' + fixed.map(ndActionRow).join('');
  if (!sup && withSup.length) h += '<div class="nd-sec"><b>With the Supervisor</b><small>' + withSup.length + '</small></div>' + withSup.map(ndActionRow).join('');
  if (later.length) h += '<div class="nd-sec"><b>Later</b><small>' + later.length + '</small></div>' + later.map(ndActionRow).join('');
  if (closed.length) h += '<details class="nd-card nd-dset"><summary><span class="nd-dn"><b>Closed</b><small>' + closed.length + '</small></span></summary>' + closed.map(ndActionRow).join('') + '</details>';
  return h;
}

// ── Today: one "To do today" list, then my departments ──
function ndTodo(mob) {
  var day = ndDay(), fill = ndDeptDefs().filter(function (d) { var c = ndPc(d.id, day)[mob] || {}; return ndFills(d.id, mob) && !c.done && !ndRes(d.id, day).chk; });
  return { fill: fill, check: ndChecksDue(mob), decide: ndEscItems(mob), assign: ndUnassigned(mob), fix: ndMyActions() };
}
function ndTodoHTML() {
  if (_nd.view) return '';
  var me = ndMob(), t = ndTodo(me), rows = [];
  var row = function (icon, label, n, js, warn) { return '<button type="button" class="nd-todo-r" onclick="' + js + '"><i class="ti ' + icon + '"></i><span>' + label + '</span><b class="' + (warn ? 'warn' : '') + '">' + n + '</b></button>'; };
  if (t.fill.length) rows.push(row('ti-pencil', 'Fill my card' + (t.fill.length > 1 ? 's' : ''), t.fill.length, "ndOpenDept('" + t.fill[0].id + "'," + ndDay() + ")"));
  if (t.check.length) { var c0 = t.check.find(function (x) { return x.ready; }) || t.check[0]; rows.push(row('ti-list-check', 'Compare the cards', t.check.length, "ndOpenDept('" + c0.dept + "'," + c0.day + ")", t.check.some(function (x) { return x.late; }))); }
  if (t.decide.length) rows.push(row('ti-alert-triangle', 'Decide (sent up)', t.decide.length, "ndTab('actions')", t.decide.some(function (x) { return x.late; })));
  if (t.assign.length) rows.push(row('ti-checklist', 'Assign actions', t.assign.length, "ndTab('actions')"));
  if (t.fix.length) rows.push(row('ti-circle-check', ndIsInCharge(me) ? 'Open actions' : 'My actions to fix', t.fix.length, "ndTab('actions')", t.fix.some(function (i) { return _nd.actions[i].due < ndToday(); })));
  var h = '<div class="nd-sec"><b>To do today</b><small>' + (rows.length ? '' : 'all clear') + '</small></div>';
  h += rows.length ? '<div class="nd-card nd-todo">' + rows.join('') + '</div>' : '<div class="nd-card nd-dim">Nothing waiting for you. Well done.</div>';
  if (ndIsInCharge(me)) h += ndRemindHTML();
  return h;
}
// in-charge: a WhatsApp reminder to each person with something pending today
function ndRemindHTML() {
  var day = ndDay(), staff = ndStaff(), out = [];
  Object.keys(staff).forEach(function (m) {
    if (m === ndMob()) return; var t = ndTodo(m), parts = [];
    if (t.fill.length) parts.push('fill your card for ' + t.fill.map(function (d) { return d.name; }).join(', '));
    if (t.check.length) parts.push('compare the cards (' + t.check.length + ')');
    if (t.decide.length) parts.push('decide ' + t.decide.length + ' checkpoint' + (t.decide.length > 1 ? 's' : ''));
    if (t.assign.length) parts.push('assign ' + t.assign.length + ' action' + (t.assign.length > 1 ? 's' : ''));
    var mine = Object.keys(_nd.actions || {}).filter(function (i) { var a = _nd.actions[i]; return a.status === 'open' && a.owner === m; });
    if (mine.length) parts.push('fix ' + mine.length + ' action' + (mine.length > 1 ? 's' : ''));
    if (parts.length) out.push({ m: m, msg: 'NQAS | FAST — ' + (_nd.fac.name || _nd.code) + ', Day ' + day + ': please ' + parts.join('; ') + '.' });
  });
  if (!out.length) return '';
  return '<details class="nd-card nd-dset"><summary><span class="nd-dn"><b>Send reminders</b><small>' + out.length + ' people have work pending</small></span></summary>'
    + out.map(function (x) { return '<div class="nd-srow"><span class="nd-dn"><b>' + ndEsc(ndName(x.m)) + '</b><small>' + ndEsc(x.msg.replace(/^[^:]*: /, '')) + '</small></span><a class="nd-wa" target="_blank" rel="noopener" href="' + ndEsc(ndWaLink(x.m, x.msg)) + '"><i class="ti ti-send"></i></a></div>'; }).join('') + '</details>';
}
function ndDeptStatus(dept, day) {
  var me = ndMob(), res = ndRes(dept, day), inn = ndCardsIn(dept, day), mine = ndPc(dept, day)[me] || {}, ids = ndDayIds(dept, day);
  if (res.chk) { var e = Object.keys(res.esc || {}).length; return e ? { k: 'back', t: e + ' with the lead' } : { k: 'ok', t: 'Checked' }; }
  if (!_nd.view && ndFills(dept, me) && !mine.done) { var n = ids.filter(function (i) { return (mine.s || {})[i] !== undefined; }).length; return n ? { k: 'prog', t: n + ' of ' + ids.length + ' scored' } : { k: 'new', t: 'Fill your card' }; }
  if (inn.waiting.length) return { k: 'prog', t: inn.done.length + ' of ' + inn.fillers.length + ' cards in' };
  if (!inn.done.length) return { k: 'new', t: 'No cards yet' };
  return ndCanCheck(dept, me) && !_nd.view ? { k: 'done', t: 'Ready to compare' } : { k: 'done', t: 'Waiting for the check' };
}
function ndMyDepts() { var me = ndMob(); return ndDeptDefs().filter(function (d) { return _nd.view || ndSeesAll(me) || ndFills(d.id, me) || ndCanCheck(d.id, me); }); }
function ndTodayHTML() {
  var me = ndMob(), day = ndDay();
  if (!_nd.fac.startDate) return ndIsInCharge(me) && !_nd.view
    ? '<div class="nd-card"><b>Set the programme start date</b><p>All departments start the baseline together on this date (Day 1).</p>' + ndStartForm() + '</div>'
    : '<div class="nd-card nd-empty"><i class="ti ti-clock"></i><b>The programme has not started yet</b><p>The ' + ndEsc(_nd.cfg.inChargeLabel) + ' sets the start date.</p></div>';
  if (day < 1) return '<div class="nd-card nd-empty"><i class="ti ti-calendar"></i><b>Day 1 is ' + ndEsc(ndDate(_nd.fac.startDate)) + '</b><p>Your cards appear on the start date.</p></div>';
  var h = ndTodoHTML();
  if (day > _nd.cfg.days) return h + '<div class="nd-card nd-empty"><i class="ti ti-trophy"></i><b>The ' + _nd.cfg.days + '-day programme is complete</b><p>See Readiness for the result.</p></div>';
  var mine = ndMyDepts();
  if (!mine.length) return h + '<div class="nd-card nd-empty"><i class="ti ti-users"></i><b>No department yet</b><p>The ' + ndEsc(_nd.cfg.inChargeLabel) + ' adds you to a department team in Set-up.</p></div>';
  var first = nfDeptDay(_nd.plan[mine[0].id], day);
  if (first.phase === 'ready') return h + '<div class="nd-card nd-empty"><i class="ti ti-trophy"></i><b>Readiness week — Day ' + day + '</b><p>' + ['End-line verification', 'End-line verification', 'Final team review', 'Graduation'][day - 57] + '. No department card today.</p></div>';
  return h + '<div class="nd-sec"><b>Today · Day ' + day + '</b><small>' + ND_PHASE[first.phase] + (first.week ? ' · week ' + first.week : '') + '</small></div>'
    + mine.map(function (d) {
      var st = ndDeptStatus(d.id, day), ids = ndDayIds(d.id, day), role = ndFills(d.id, me) ? 'you fill' + (ndChecker(d.id) === me ? ' · you check' : '') : ndChecker(d.id) === me ? 'you check' : 'checker ' + ndName(ndChecker(d.id));
      return '<button type="button" class="nd-dept" onclick="ndOpenDept(\'' + d.id + '\',' + day + ')"><span class="nd-dk">' + ndEsc(d.id) + '</span>'
        + '<span class="nd-dn"><b>' + ndEsc(d.name) + '</b><small>' + ids.length + ' checkpoints · ' + ndEsc(_nd.view ? 'checker ' + ndName(ndChecker(d.id)) : role) + '</small></span>'
        + '<span class="nd-st ' + st.k + '">' + ndEsc(st.t) + '</span></button>';
    }).join('');
}
