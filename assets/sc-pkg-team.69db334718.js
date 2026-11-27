// ══════════════════════════════════════════════════════════════
// ONE SERVICE PACKAGE AT A TIME · TEAM'S FIXES (27 Nov 2026; HealSol design canvas page "One service package at a time",
// approved 27 Nov with the icons on board P0 — newborn icon redrawn)
//  • Within a day, AoC A (availability) and AoC E (clinical) checkpoints of the same service package sit together, in the order
//    the packages first appear. Display order only: which day a checkpoint is on, and where answers are stored, do not change.
//  • Baseline: package tiles (icon + done / total) above the card; a short note when a package is finished; "All checkpoints"
//    grouped by package. Implementation: the day's fixes grouped by package; for facilities whose baseline closes from
//    28 Nov 2026 the week's fixes are spread package after package (facilities already in implementation keep their days).
//  • Team's fixes: every staff member sees the day's fixes of the others, read-only — what the baseline found, how to fix /
//    how it was fixed, what to show the assessor, and a practice question that is not scored or saved.
// ══════════════════════════════════════════════════════════════
var PKG_SHORT = { 'Pregnancy & Child Birth': ['Pregnancy & Child Birth', 'गर्भावस्था और प्रसव'], 'Neonatal & Infant Care': ['Neonatal & Infant Care', 'नवजात और शिशु देखभाल'], 'Childhood & Adolescent Health': ['Childhood & Adolescent Health', 'बाल और किशोर स्वास्थ्य'],
  'Family Planning': ['Family Planning', 'परिवार नियोजन'], 'Management of Communicable Diseases': ['Communicable Diseases', 'संचारी रोग'], 'Care of Common Ophthalmic and ENT': ['Eye & ENT Care', 'आँख और ENT देखभाल'],
  'Management of Non-Communicable Diseases': ['Non-Communicable Diseases', 'गैर-संचारी रोग'], 'Oral Health Care': ['Oral Health', 'मुख स्वास्थ्य'], 'Elderly & Palliative Care': ['Elderly & Palliative Care', 'बुज़ुर्ग और उपशामक देखभाल'],
  'Emergency': ['Emergency', 'आपातकालीन'], 'Mental Health': ['Mental Health', 'मानसिक स्वास्थ्य'], 'Drugs & Diagnostics': ['Drugs & Diagnostics', 'दवाएँ और जाँच'], 'General Clinical Processes': ['General Clinical Processes', 'सामान्य क्लिनिकल प्रक्रियाएँ'] };
var PKG_ICON = {
  'Pregnancy & Child Birth': '<circle cx="10" cy="4" r="2"/><path d="M9 7.5c-1.2 1.6 -1.5 4 -1.2 6.5l.7 7"/><path d="M10.8 7.5c.9 .8 1.3 1.8 1.4 3c2.6 .4 4.3 2.3 4.3 4.4c0 1.6 -1.3 2.6 -3 2.6h-2.2l-.4 3.5"/><path d="M8.6 11.5l2.6 1"/>',
  'Neonatal & Infant Care': '<circle cx="12" cy="6" r="3"/><path d="M11 5.8h.01"/><path d="M13 5.8h.01"/><path d="M9 8.8c-1.6 1.5 -2.5 3.6 -2.5 5.9c0 3.5 2.4 6.3 5.5 6.3s5.5 -2.8 5.5 -6.3c0 -2.3 -.9 -4.4 -2.5 -5.9"/><path d="M7 13.5l9.5 3"/><path d="M8.5 18.5l8.5 -4.5"/>',
  'Childhood & Adolescent Health': '<circle cx="12" cy="12" r="9"/><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M9.5 15a3.5 3.5 0 0 0 5 0"/><path d="M12 3a2 2 0 0 0 0 4"/>',
  'Family Planning': '<circle cx="8" cy="6" r="2"/><circle cx="16" cy="6" r="2"/><path d="M4.5 20v-5a3.5 3.5 0 0 1 7 0"/><path d="M12.5 15a3.5 3.5 0 0 1 7 0v5"/><path d="M12 21l-1.6 -1.5a1 1 0 0 1 1.6 -1.3a1 1 0 0 1 1.6 1.3z"/>',
  'Management of Communicable Diseases': '<circle cx="12" cy="12" r="5"/><path d="M12 7v-4"/><path d="M12 21v-4"/><path d="M7 12h-4"/><path d="M21 12h-4"/><path d="M8.5 8.5l-2.8 -2.8"/><path d="M18.3 18.3l-2.8 -2.8"/><path d="M15.5 8.5l2.8 -2.8"/><path d="M5.7 18.3l2.8 -2.8"/>',
  'Care of Common Ophthalmic and ENT': '<path d="M2 11c2.5 -4 5.5 -6 8.5 -6s6 2 8.5 6c-2.5 4 -5.5 6 -8.5 6s-6 -2 -8.5 -6"/><circle cx="10.5" cy="11" r="2.5"/><path d="M19.5 15.5a2.5 2.5 0 0 1 2 2.5c0 1.5 -1 2 -1.5 3"/>',
  'Management of Non-Communicable Diseases': '<path d="M19.5 12.6l-7.5 7.4l-7.5 -7.4a5 5 0 1 1 7.5 -6.6a5 5 0 1 1 7.5 6.6"/><path d="M5 12h3l1.5 -3l2.5 6l1.5 -3h5"/>',
  'Oral Health Care': '<path d="M12 5.5c-1.5 -1.3 -3 -2 -5 -1.5c-2.5 .6 -3.5 3 -3 5.5c.4 2 1.3 3.2 1.6 5c.3 2 .5 5.5 2.4 5.5c1.8 0 1.4 -4.5 4 -4.5s2.2 4.5 4 4.5c1.9 0 2.1 -3.5 2.4 -5.5c.3 -1.8 1.2 -3 1.6 -5c.5 -2.5 -.5 -4.9 -3 -5.5c-2 -.5 -3.5 .2 -5 1.5z"/>',
  'Elderly & Palliative Care': '<circle cx="10" cy="4" r="2"/><path d="M9.5 8l-1.5 6l3 2v5"/><path d="M8 14l-2 7"/><path d="M9.5 8c2 1 3 2.5 4.5 3.5"/><path d="M15 11v10"/><path d="M15 11a1.5 1.5 0 0 1 2.5 -1"/>',
  'Emergency': '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M12 10v7"/><path d="M8.5 13.5h7"/><path d="M9 3l1 2"/><path d="M15 3l-1 2"/><path d="M12 2.5v2"/>',
  'Mental Health': '<path d="M15.5 21v-3.5h2a1.5 1.5 0 0 0 1.5 -1.5v-2.5l1.5 -.5l-1.6 -3.2a7.5 7.5 0 1 0 -13.4 4.7v6.5"/><path d="M10.5 12.5c0 -2 1.5 -3.5 3.5 -3.5c0 2 -1.5 3.5 -3.5 3.5z"/><path d="M10.5 12.5c-1.5 0 -2.5 -1 -2.5 -2.5c1.5 0 2.5 1 2.5 2.5z"/><path d="M10.5 12.5v2.5"/>',
  'Drugs & Diagnostics': '<path d="M4.5 12.5l6 -6a3.5 3.5 0 0 1 5 5l-6 6a3.5 3.5 0 0 1 -5 -5z"/><path d="M7.5 9.5l5 5"/><path d="M18 13v6.5a1.5 1.5 0 0 1 -3 0v-6.5z"/><path d="M14.5 13h4"/>',
  'General Clinical Processes': '<path d="M6 4h-1a2 2 0 0 0 -2 2v3.5a5.5 5.5 0 0 0 11 0v-3.5a2 2 0 0 0 -2 -2h-1"/><path d="M8.5 15a5.5 5.5 0 0 0 11 0v-2"/><circle cx="19.5" cy="11" r="2"/><path d="M6 3v2"/><path d="M11 3v2"/>' };
var PKG_PLAN_FROM = '2026-11-28';   // facilities whose baseline closes from this day get the package-after-package week plan
function pkgT(en, hi) { return typeof blsT === 'function' ? blsT(en, hi) : en; }
function pkgE(s) { return typeof blsE === 'function' ? blsE(s) : String(s == null ? '' : s); }
function pkgOf(cp) { if (!cp) return null; var c = cp; try { if ((!cp.aoc || !cp.svc) && cp.id && typeof scCpmGet === 'function') c = Object.assign({}, scCpmGet(cp.id) || {}, cp); } catch (e) {}
  return (c.aoc === 'A' || c.aoc === 'E') && c.svc ? c.svc : null; }
function pkgName(p) { var n = PKG_SHORT[p]; return n ? pkgT(n[0], n[1]) : p; }
function pkgIcon(p, size) { var d = PKG_ICON[p]; return d ? '<svg width="' + (size || 26) + '" height="' + (size || 26) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>' : ''; }
// stable order: A/E checkpoints of a package together, at the place the package first appears; everything else stays put
function pkgOrder(list, cpOf) {
  var first = {}, keyed = list.map(function (x, i) { var p = pkgOf(cpOf(x)), g = p ? 'p:' + p : 'i:' + i; if (first[g] == null) first[g] = i; return { x: x, i: i, g: g }; });
  return keyed.sort(function (a, b) { return first[a.g] - first[b.g] || a.i - b.i; }).map(function (y) { return y.x; });
}
function pkgGroups(list, cpOf) {   // consecutive runs: [{p, from, to}] (p null for non-package checkpoints)
  var out = []; list.forEach(function (x, i) { var p = pkgOf(cpOf(x)); var last = out[out.length - 1]; if (last && last.p === p) last.to = i; else out.push({ p: p, from: i, to: i }); }); return out;
}

// ── baseline: order, tiles, "package done", grouped "All checkpoints" ──
(function () {
  if (typeof blsMine === 'function') { var o = blsMine; blsMine = function (di) { var m = o.apply(this, arguments); try { if (!blsLineMode()) return m; var d = getDay(di); return pkgOrder(m, function (ci) { return d.cps[ci]; }); } catch (e) { return m; } }; }
  if (typeof blsSlideHTML === 'function') { var s = blsSlideHTML; blsSlideHTML = function (di, mine) { var h = s.apply(this, arguments); try { var t = pkgTilesHTML(di, mine); if (t) h = t + h; } catch (e) { console.warn('[PKG] tiles', e); } return h; }; }
  if (typeof blsGo === 'function') { var g = blsGo; blsGo = function (step) { var di = _bls.di, before = null, mine = null;
      try { if (di != null && !_bls.review && step > 0) { mine = blsMine(di); before = pkgOf(getDay(di).cps[mine[_bls.i]]); } } catch (e) {}
      var r = g.apply(this, arguments);
      try { if (before && mine) { var d = getDay(di), now = _bls.review ? null : pkgOf(d.cps[mine[_bls.i]]); if (now !== before) { var L = mine.filter(function (ci) { return pkgOf(d.cps[ci]) === before; });
        if (L.length && L.every(function (ci) { return blsSlideDone(di, ci); })) { var nx = now ? mine.filter(function (ci) { return pkgOf(d.cps[ci]) === now; }).length : 0;
          showToast(pkgT(pkgName(before) + ' done ✓ — ' + L.length + ' checked' + (now ? '. Next: ' + pkgName(now) + ' (' + nx + ')' : ''), pkgName(before) + ' पूरा ✓ — ' + L.length + ' जाँचे' + (now ? '। अगला: ' + pkgName(now) + ' (' + nx + ')' : '')), 'ok'); } } } } catch (e) {}
      return r; }; }
  if (typeof blsMapOpen === 'function') { var mo = blsMapOpen; blsMapOpen = function () { var r = mo.apply(this, arguments);
    try { var di = _bls.di, d = getDay(di), mine = blsMine(di), G = pkgGroups(mine, function (ci) { return d.cps[ci]; }), grid = document.querySelector('#bls-map .blsm-grid');
      if (grid && G.filter(function (x) { return x.p; }).length >= 2) { var tiles = [].slice.call(grid.children), h = '';
        G.forEach(function (x) { var n = x.to - x.from + 1, done = 0; for (var i = x.from; i <= x.to; i++) if (blsSlideDone(di, mine[i])) done++;
          h += '<div class="pkg-mh">' + (x.p ? '<span class="pkg-mi">' + pkgIcon(x.p, 18) + '</span><b>' + pkgE(pkgName(x.p)) + '</b>' : '<b>' + pkgE(pkgT('Other checkpoints', 'अन्य चेकपॉइंट')) + '</b>') + '<small>' + done + ' / ' + n + (done === n ? ' ✓' : '') + '</small></div><div class="blsm-grid pkg-mg">' + tiles.slice(x.from, x.to + 1).map(function (t) { return t.outerHTML; }).join('') + '</div>'; });
        grid.outerHTML = '<div class="pkg-mgw">' + h + '</div>'; } } catch (e) { console.warn('[PKG] map', e); }
    return r; }; }
})();
function pkgTilesHTML(di, mine) {
  var d = getDay(di), G = pkgGroups(mine, function (ci) { return d.cps[ci]; }).filter(function (x) { return x.p; }); if (G.length < 2) return '';
  var cur = pkgOf(d.cps[mine[_bls.i]]), curG = null, idx = 0;
  var tiles = G.map(function (x, j) { var n = x.to - x.from + 1, done = 0, first = -1; for (var i = x.from; i <= x.to; i++) { if (blsSlideDone(di, mine[i])) done++; else if (first < 0) first = i; }
    var on = x.p === cur, ok = done === n; if (on) { curG = x; idx = j; }
    return '<button type="button" class="pkg-t' + (ok ? ' ok' : '') + (on ? ' on' : '') + '" title="' + pkgE(pkgName(x.p)) + '" aria-label="' + pkgE(pkgName(x.p) + ' · ' + done + ' / ' + n) + '" onclick="blsJump(' + (first < 0 ? x.from : first) + ')">' + pkgIcon(x.p, 28) + '<span>' + done + ' / ' + n + '</span>' + (ok ? '<i>✓</i>' : '') + '</button>'; }).join('');
  var name = curG ? '<div class="pkg-name"><b>' + pkgE(pkgName(curG.p)) + '</b><small>' + pkgE(pkgT('Package ' + (idx + 1) + ' of ' + G.length + ' · checkpoint ' + (_bls.i - curG.from + 1) + ' of ' + (curG.to - curG.from + 1), 'पैकेज ' + (idx + 1) + ' / ' + G.length + ' · चेकपॉइंट ' + (_bls.i - curG.from + 1) + ' / ' + (curG.to - curG.from + 1))) + '</small></div>' : '<div class="pkg-name"><small>' + pkgE(pkgT('Other checkpoints of the day', 'दिन के अन्य चेकपॉइंट')) + '</small></div>';
  return '<div class="pkg-tiles">' + tiles + '</div>' + name;
}

// ── implementation: the week plan, and the day's list grouped by package, then the team's fixes ──
function imfPlanSort(ctx, items) {   // called by imfItems before the week is spread
  try { var F = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === ctx.code) ? _nfFac : (choState.facility || {}), on = F && F.blDoneOn && String(F.blDoneOn) >= PKG_PLAN_FROM;
    return on ? pkgOrder(items, function (it) { return it.cp; }) : items; } catch (e) { return items; }
}
(function () {
  if (typeof imfDayListHTML !== 'function') return; var o = imfDayListHTML;
  imfDayListHTML = function (ctx, di, items) {
    var h;
    try { var k = di - imfWeekStart(di), L = items.filter(function (it) { return it.k === k; }), G = pkgGroups(pkgOrder(L, function (it) { return it.cp; }), function (it) { return it.cp; });
      h = o.apply(this, arguments);
      if (L.length && G.filter(function (x) { return x.p; }).length >= 2) {   // group the list: same rows, package headers between them
        var Ls = pkgOrder(L, function (it) { return it.cp; }), m = /<div class="bls-card bls-list">([\s\S]*?)<\/div>(?=<p class="bls-dim">|<details|$)/.exec(h);
        if (m) { var rows = m[1].match(/<button type="button" class="bls-li[\s\S]*?<\/button>/g) || [], byId = {};
          rows.forEach(function (r) { var id = (/imfOpen\(\d+,'([^']+)'\)/.exec(r) || [])[1]; if (id) byId[id] = r; });
          if (Object.keys(byId).length === L.length) { var n = 0, inner = G.map(function (g) { var part = Ls.slice(g.from, g.to + 1), fx = part.filter(function (it) { return it.st === 'fixed'; }).length;
              return '<div class="pkg-lh">' + (g.p ? '<span class="pkg-mi">' + pkgIcon(g.p, 18) + '</span><b>' + pkgE(pkgName(g.p)) + '</b>' : '<b>' + pkgE(pkgT('Other', 'अन्य')) + '</b>') + '<small>' + pkgE(pkgT(fx + ' of ' + part.length + ' fixed', part.length + ' में से ' + fx + ' सुधरे')) + '</small></div>' + part.map(function (it) { n++; return byId[it.cp.id].replace(/<span class="bls-n">\d+<\/span>/, '<span class="bls-n">' + n + '</span>'); }).join(''); }).join('');
            h = h.replace(m[0], '<div class="bls-card bls-list">' + inner + '</div>'); } } }
    } catch (e) { console.warn('[PKG] list', e); if (h == null) h = o.apply(this, arguments); }
    try { h += imtListHTML(ctx, di); } catch (e) { console.warn('[IMT] list', e); }
    return h; };
})();

// ── team's fixes ──
var _imt = { di: null, list: [], i: 0, pick: {} };
function imtItems(ctx, di) {
  var k = di - imfWeekStart(di), mine = {}, out = [], seen = {};
  try { imfItems(ctx, di).forEach(function (it) { if (it.k === k) mine[it.cp.id] = 1; }); } catch (e) {}
  imfMobs(ctx).forEach(function (m) { if (m === ctx.me) return; var p = (ctx.staff || {})[m]; if (p && p.disabled) return; var role = imfRoleOf(ctx, m), L = [];
    try { L = imfItems(Object.assign({}, ctx, { mine: false }), di, m, role); } catch (e) {}
    L.forEach(function (it) { if (it.k !== k || mine[it.cp.id]) return; var key = it.cp.id; if (seen[key]) { seen[key].who.push({ m: m, role: role, it: it }); return; }
      var x = { cp: it.cp, it: it, who: [{ m: m, role: role, it: it }] }; seen[key] = x; out.push(x); }); });
  return pkgOrder(out, function (x) { return x.cp; });
}
function imtStatus(it) { return it.st === 'fixed' && it.vf && it.vf.ok ? ['c', pkgT('Checked ✓', 'जाँचा ✓')] : it.st === 'fixed' ? ['f', pkgT('Fixed', 'सुधरा')] : it.st === 'doubt' ? ['b', pkgT('Sent back', 'वापस भेजा')] : ['o', pkgT('To do', 'करना है')]; }
function imtWho(ctx, x) { return x.who.map(function (w) { return String(imfNameOf(ctx, w.m)).split(' ')[0] + ' (' + w.role + ')'; }).join(', '); }
function imtListHTML(ctx, di) {
  if (!ctx.loaded || di > scb1TodayIdx()) return ''; var L = imtItems(ctx, di); _imt.cache = { di: di, L: L }; if (!L.length) return '';
  return '<div class="bls-card bls-list imt-list"><span class="imt-k">' + pkgE(pkgT('TEAM\'S FIXES · LEARN HOW · ' + L.length, 'टीम के सुधार · सीखें · ' + L.length)) + '</span>'
    + L.map(function (x, i) { var st = imtStatus(x.it);
      return '<button type="button" class="bls-li imt-li" onclick="imtOpen(' + di + ',' + i + ')"><span class="bls-lt">' + pkgE(imfTitle(x.cp)) + '<small>' + pkgE(pkgT(imtWho(ctx, x) + ' fix' + (x.who.length > 1 ? '' : 'es') + ' this', imtWho(ctx, x) + ' इसे सुधारते हैं')) + '</small></span><span class="bls-ls"><span class="bls-pill imt-' + st[0] + '">' + pkgE(st[1]) + '</span></span></button>'; }).join('')
    + '<p class="imt-note">' + pkgE(pkgT('Read how your team fixes these — the assessor can ask anyone. Only the person named fixes it.', 'देखें कि टीम इन्हें कैसे सुधारती है — मूल्यांकनकर्ता किसी से भी पूछ सकते हैं। सुधार वही करेंगे जिनका नाम है।')) + '</p></div>';
}
function imtOpen(di, i) { var ctx = imfCtxMine(), L = (_imt.cache && _imt.cache.di === di) ? _imt.cache.L : imtItems(ctx, di); _imt = { di: di, list: L, i: i, pick: {} }; imtRender(); try { imfTop(); } catch (e) {} }
function imtGo(step) { var n = _imt.i + step; if (n < 0 || n >= _imt.list.length) { imfBackToDay(_imt.di); return; } _imt.i = n; _imt.pick = {}; imtRender(); try { imfTop(); } catch (e) {} }
function imtPick(id, j) { _imt.pick[id] = j; imtRender(); }
function imtRender() {
  var cont = document.getElementById('card-container'), x = _imt.list[_imt.i]; if (!cont || !x) return;
  var ctx = imfCtxMine(), it = x.it, hi = blsHi(), di = _imt.di, st = imtStatus(it), done = it.st === 'fixed';
  var was = it.own.filter(function (s) { var v = it.L.st[s.id]; return v.base === null || v.base < 0.9999; }); if (!was.length) was = it.own;
  var found = was.map(function (s) { var v = it.L.st[s.id]; return '<div class="imf-found"><span class="imf-ans">' + pkgE(imfAnsText(s, v.raw)) + '</span><span class="imf-fq">' + pkgE(typeof blrQText === 'function' ? blrQText(s) : (hi && s.h ? s.h : s.t)) + (v.by ? '<small>' + pkgE(v.by + (v.byRole ? ' (' + v.byRole + ')' : '') + pkgT(' · baseline', ' · बेसलाइन')) + '</small>' : '') + '</span></div>'; }).join('');
  var H = imfHowOf(it, was, hi, ctx), vf = it.vf;
  var stTxt = st[0] === 'c' && vf ? pkgT('Checked ✓ by ' + (vf.by || '') + (vf.at ? ', ' + (typeof scFmtDate === 'function' ? scFmtDate(imfIst(vf.at)) : imfIst(vf.at)) : ''), (vf.by || '') + ' ने जाँचा ✓') : st[1];
  var mcq = it.own.filter(function (s) { return s.kind === 'mcq' && s.q; }).map(function (s) { var q = s.q, p = _imt.pick[s.id], o = hi && q.oh ? q.oh : q.o;
    return '<div class="imt-try"><small>' + pkgE(pkgT('TRY THE QUESTION YOURSELF · NOT SCORED', 'ख़ुद सवाल आज़माएँ · अंक नहीं')) + '</small><b>' + pkgE(hi && q.qh ? q.qh : q.q) + '</b>'
      + o.map(function (t, j) { var cls = p == null ? '' : j === q.a ? ' ok' : j === p ? ' no' : ''; return '<button type="button" class="imt-o' + cls + '" onclick="imtPick(\'' + pkgE(s.id) + '\',' + j + ')">' + (p == null ? '○ ' : j === q.a ? '✓ ' : j === p ? '✗ ' : '○ ') + pkgE(t) + '</button>'; }).join('')
      + (p != null && (q.x || q.xh) ? '<p class="imt-x">' + pkgE(hi && q.xh ? q.xh : q.x) + '</p>' : '') + '</div>'; }).join('');
  cont.innerHTML = '<div class="bls imf"><div class="bls-hd"><small>' + pkgE(pkgT('IMPLEMENTATION · WEEK ' + (Math.floor(di / 7) + 1) + ' · DAY ' + (di + 1), 'कार्यान्वयन · सप्ताह ' + (Math.floor(di / 7) + 1) + ' · दिन ' + (di + 1))) + '</small></div>'
    + '<button type="button" class="imf-back" onclick="imfBackToDay(' + di + ')">‹ ' + pkgE(pkgT('Day ' + (di + 1) + ' fixes', 'दिन ' + (di + 1) + ' के सुधार')) + '</button>'
    + '<div class="bls-slide"><div class="bls-card bls-acc imt-card" style="--acc:#8E6BC4;--acc-t:#F7F3FC"><i class="bls-band"></i><div class="bls-chd"><span class="bls-num">' + (_imt.i + 1) + '</span><div class="bls-chm"><span class="bls-k">' + pkgE(it.cp.id + pkgT(' · TEAM\'S FIX · LEARN HOW', ' · टीम का सुधार · सीखें')) + '</span><div class="bls-cpt">' + pkgE(imfTitle(it.cp)) + '</div><small class="imt-by">' + pkgE(pkgT(imtWho(ctx, x) + ' fix' + (x.who.length > 1 ? '' : 'es') + ' this', imtWho(ctx, x) + ' इसे सुधारते हैं')) + ' · <b class="imt-' + st[0] + '">' + pkgE(stTxt) + '</b></small></div></div>'
    + '<div class="bls-cbody imf-body"><div class="imf-sec"><small>' + pkgE(pkgT('WHAT THE BASELINE FOUND', 'बेसलाइन में क्या मिला')) + '</small>' + found + '</div>' + imfHowHTML(H, done)
    + (H.ev ? '<div class="imf-evb"><small>' + pkgE(pkgT('IF THE ASSESSOR ASKS YOU', 'अगर मूल्यांकनकर्ता आपसे पूछें')) + '</small><span>' + pkgE(H.ev) + '</span></div>' : '') + mcq + '</div></div></div>'
    + '<div class="bls-spacer"></div><div class="bls-nav bls-fixed"><button type="button" class="bls-back" onclick="imtGo(-1)">' + (_imt.i === 0 ? '‹ ' + pkgE(pkgT('Day list', 'सूची')) : '‹ ' + pkgE(pkgT('Previous', 'पिछला'))) + '</button><button type="button" class="bls-next" onclick="imtGo(1)">' + pkgE(_imt.i === _imt.list.length - 1 ? pkgT('Done', 'पूरा') : pkgT('Next', 'अगला')) + ' ›</button></div></div>';
}
