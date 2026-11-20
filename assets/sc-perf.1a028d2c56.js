// ══════════════════════════════════════════════════════════════
// SUB-CENTRE APP SPEED (4 Nov 2026) — measured after a CHO logs in on a low-cost phone: ~3 s of busy screen in the first
// seconds, mostly the welcome block (scb2RenderWsMini) drawn 6 times in a row as each piece of data arrived, and the role
// list of a checkpoint (scCpRoles) worked out 60,000 times.
//  1 Heavy redraws that several loaders ask for one after another run at once the first time, and the calls that follow
//    within 400 ms become one redraw at the end (nothing is skipped, only repeated work).
//  2 A checkpoint's role list is remembered until its role tags change.
// ══════════════════════════════════════════════════════════════
function scCoalesce(name, ms) {
  var f = window[name]; if (typeof f !== 'function' || f.__co) return;
  var last = 0, timer = null;
  var w = function () {
    var now = Date.now(), self = this, args = arguments;
    if (now - last >= ms && !timer) { last = now; return f.apply(self, args); }
    if (!timer) timer = setTimeout(function () { timer = null; last = Date.now(); try { f.apply(self, args); } catch (e) { console.warn('[perf]', name, e); } }, ms);
  };
  w.__co = true; window[name] = w;
}
(function () {
  ['scb2RenderWsMini', 'scRenderWsVerify'].forEach(function (n) { scCoalesce(n, 400); });
  if (typeof scCpRoles === 'function') { var o = scCpRoles, C = new WeakMap();
    scCpRoles = function (cp) { if (!cp || typeof cp !== 'object') return o.apply(this, arguments);
      var k = cp.r, h = C.get(cp); if (h && h.r === k && h.j === (Array.isArray(k) ? k.join(',') : k && typeof k === 'object' ? JSON.stringify(k) : String(k))) return h.v.slice();
      var v = o.apply(this, arguments); C.set(cp, { r: k, j: Array.isArray(k) ? k.join(',') : k && typeof k === 'object' ? JSON.stringify(k) : String(k), v: v.slice() }); return v; }; }
})();
// 3 Day definitions and the checkpoint list, remembered while one piece of work runs (cleared at its end, so Card Editor
//   changes and new data always show): getDaysArr was rebuilt ~800 times per screen, scCpmAll ~30 times.
var _scM = null;
function scMemoBox() { if (!_scM) { _scM = {}; Promise.resolve().then(function () { _scM = null; }); } return _scM; }
function scMemoize(name, copy) {
  var f = window[name]; if (typeof f !== 'function' || f.__memo) return;
  var w = function () { var M = scMemoBox(), k = name + '|' + Array.prototype.map.call(arguments, function (a) { return a && typeof a === 'object' ? JSON.stringify(a) : String(a); }).join('|');
    if (!(k in M)) M[k] = f.apply(this, arguments); var v = M[k]; return copy && Array.isArray(v) ? v.slice() : v; };
  w.__memo = true; window[name] = w;
}
(function () { scMemoize('scCpmAll', true); scMemoize('scDayDef', false); })();
// 4 The old welcome block (scb2RenderWsMini) is hidden in the staff app (display:none) but was drawn 6 times after login:
//   while it is hidden it is only marked "to draw", and drawn the moment a tab shows it.
var _scMiniDirty = false;
(function () {
  var f = window.scb2RenderWsMini; if (typeof f !== 'function') return;
  window.scb2RenderWsMini = function () {
    try { var el = document.getElementById('scb2-ws-mini'); if (el && document.body.classList.contains('nf-staff') && getComputedStyle(el).display === 'none' && el.getAttribute('data-drawn')) { _scMiniDirty = true; return; } } catch (e) {}
    _scMiniDirty = false; var r = f.apply(this, arguments); try { var e2 = document.getElementById('scb2-ws-mini'); if (e2) e2.setAttribute('data-drawn', '1'); } catch (e) {} return r;
  };
  if (typeof nfTab === 'function') { var t = nfTab; nfTab = function () { var r = t.apply(this, arguments);
    try { if (_scMiniDirty) { var el = document.getElementById('scb2-ws-mini'); if (el && getComputedStyle(el).display !== 'none') scb2RenderWsMini(); } } catch (e) {} return r; }; }
})();
