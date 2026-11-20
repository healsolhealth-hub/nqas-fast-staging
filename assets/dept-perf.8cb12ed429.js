// ══════════════════════════════════════════════════════════════
// DEPARTMENT APP SPEED (4 Nov 2026) — measured on a Day-30 CHC (4,589 checkpoints, 13 departments, 1,000+ actions): every tab
// took ~1 s on a low-cost phone because the same lists were worked out thousands of times per screen (ndStaff 19,000×,
// ndRecheckIds 429× over every action, the Today badge counting all checks) and the Actions tab drew every action card.
//  1 Remember results while one screen is being drawn: cleared at the start of every ndRender, after every local change
//    (ndApplyLocal / ndPut) and by itself as soon as the current piece of work ends (microtask), so nothing can go stale.
//  2 ndRecheckIds: the "fixed, re-check due" actions grouped by department once, not filtered from all actions each time.
//  3 Actions: the cards inside each person's list (and "Closed") are drawn when the list is opened.
// ══════════════════════════════════════════════════════════════
var _ndM = null;
function ndMemoBox() { if (!_ndM) { _ndM = {}; Promise.resolve().then(function () { _ndM = null; }); } return _ndM; }
function ndMemoClear() { _ndM = null; }
function ndMemoize(name, copy) {
  var f = window[name]; if (typeof f !== 'function' || f.__memo) return;
  var w = function () {
    var M = ndMemoBox(), k = name + '|' + Array.prototype.join.call(arguments, '|');
    if (!(k in M)) M[k] = f.apply(this, arguments);
    var v = M[k]; return copy && Array.isArray(v) ? v.slice() : v;
  };
  w.__memo = true; window[name] = w;
}
(function () {
  ['ndStaff', 'ndDeptDefs', 'ndLatestFinal', 'ndAnyRoles', 'ndShape'].forEach(function (n) { ndMemoize(n, false); });
  ['ndDayInfo', 'ndRecheckIds', 'ndDayIds', 'ndMyIds', 'ndFillers', 'ndCardsIn', 'ndChecksDue', 'ndUnassigned', 'ndEscItems', 'nxLeads'].forEach(function (n) { ndMemoize(n, true); });
  ['nxJobCount', 'ndDaySt', 'ndMySt', 'ndShareMap'].forEach(function (n) { ndMemoize(n, false); });
  // re-check ids per department, once per screen
  if (typeof ndRecheckIds === 'function') {
    var byDept = function () { var M = ndMemoBox(); if (M.__fx) return M.__fx; var A = (_nd && _nd.actions) || {}, o = {};
      Object.keys(A).forEach(function (id) { var a = A[id]; if (a && a.status === 'fixed') (o[a.dept] = o[a.dept] || []).push(id); }); return (M.__fx = o); };
    var inner = function (dept, day) { var A = _nd.actions || {}; return (byDept()[dept] || []).filter(function (id) { var a = A[id]; return !a.fixed || !a.fixed.day || a.fixed.day < day; }); };
    window.ndRecheckIds = inner; ndMemoize('ndRecheckIds', true);
  }
  if (typeof ndRender === 'function') { var r = ndRender; ndRender = function () { ndMemoClear(); return r.apply(this, arguments); }; }
  ['ndApplyLocal', 'ndPut'].forEach(function (n) { var f = window[n]; if (typeof f !== 'function') return; window[n] = function () { ndMemoClear(); var x = f.apply(this, arguments); ndMemoClear(); return x; }; });
})();

// ── Actions: draw a list's cards when it is opened ──
var _nxLz = {}, _nxLzN = 0;
function nxLazyList(ids) { var k = 'lz' + (++_nxLzN); _nxLz[k] = ids; return k; }
function nxLazyFill(el) { try { if (!el.open) return; var k = el.getAttribute('data-lz'), box = el.querySelector('.nx-lz'); if (!k || !box || box.getAttribute('data-done')) return;
  box.insertAdjacentHTML('beforeend', (_nxLz[k] || []).map(nxActCard).join('')); box.setAttribute('data-done', '1'); } catch (e) { console.warn('[nx] lazy', e); } }
(function () {
  if (typeof nxPlanHTML === 'function') { var o = nxPlanHTML; nxPlanHTML = function (me, ro) { _nxLz = {}; _nxLzN = 0; var keep = nxActCard, lists = [];
    nxActCard = function () { return '\u0000'; };   // placeholder while the frame is drawn
    var h; try {
      var A = _nd.actions || {}, mine = {}; (_nd.view ? ndDeptDefs() : nxLeads(me)).forEach(function (d) { mine[d.id] = 1; });
      var ids = Object.keys(A).filter(function (id) { return mine[A[id].dept] && (A[id].status === 'open' || A[id].status === 'fixed' || A[id].status === 'sup'); }), owners = {};
      ids.forEach(function (id) { var x = A[id].status === 'sup' ? '__sup' : A[id].owner; (owners[x] = owners[x] || []).push(id); });
      Object.keys(owners).sort(function (a, b) { return a === '__sup' ? 1 : b === '__sup' ? -1 : String(ndName(a)).localeCompare(String(ndName(b))); }).forEach(function (x) { lists.push(owners[x]); });
      h = o.apply(this, arguments);
    } finally { nxActCard = keep; }
    var i = 0; return h.replace(/<details class="nx-it" style="gap:0">([\s\S]*?)<div style="display:flex;flex-direction:column;gap:8px;margin-top:10px">([^\u0000]*?)(\u0000)+<\/div><\/details>/g, function (m, sum, wa) {
      var k = nxLazyList(lists[i++] || []); return '<details class="nx-it" style="gap:0" data-lz="' + k + '" ontoggle="nxLazyFill(this)">' + sum + '<div class="nx-lz" style="display:flex;flex-direction:column;gap:8px;margin-top:10px">' + wa + '</div></details>'; }); }; }
  if (typeof nxActListsHTML === 'function') { nxActListsHTML = function () {
    var A = _nd.actions || {}, me = ndMob(), mine = {}; (_nd.view ? ndDeptDefs() : nxLeads(me)).forEach(function (d) { mine[d.id] = 1; });
    var closed = Object.keys(A).filter(function (id) { return mine[A[id].dept] && A[id].status === 'closed'; });
    return closed.length ? '<details class="nx-card" data-lz="' + nxLazyList(closed) + '" ontoggle="nxLazyFill(this)"><summary style="cursor:pointer;font-weight:700;font-size:14px">Closed · ' + closed.length + '</summary><div class="nx-lz"></div></details>' : ''; }; }
})();
