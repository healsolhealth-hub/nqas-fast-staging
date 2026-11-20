// ══════════════════════════════════════════════════════════════
// PHONE BACK, ONE SCREEN AT A TIME (6 Nov 2026)
//   Department / facility app (UPHC, PHC, CHC staff and in-charge) and the dashboards (HealSol, district, block,
//   supervisor). Every move to another screen records where you were; the phone's Back returns there. From the
//   home screen Back leaves the app as before. Uses back-button.js (window.nfBackPush / nfBackSteps).
// ══════════════════════════════════════════════════════════════
(function () {
  window.nfBackSteps = window.nfBackSteps || [];
  var push = function () { try { if (typeof window.nfBackPush === 'function') window.nfBackPush(); } catch (e) {} };

  // ── department / facility app ──
  var ND_KEYS = ['fa', 'fatab', 'tab', 'cv', 'cday', 'cdept', 'card', 'screen', 'ltab', 'endDept', 'supOpen'];
  var ndStack = [], ndLast = null, ndRestoring = false;
  var ndSnap = function () { var o = {}; ND_KEYS.forEach(function (k) { o[k] = _nd[k]; }); return o; };
  var ndKey = function (s) { return [s.fa ? 'fa' : '', s.fa ? s.fatab : s.tab, s.fa ? '' : s.cv, s.fa ? '' : s.cday, s.fa ? '' : s.cdept, s.card ? (s.card.dept + '/' + s.card.day) : '', s.screen || '', s.screen === 'lead' ? s.ltab : ''].join('|'); };
  var ndHome = function (s) { return !s.card && !s.screen && (s.fa ? (s.fatab || 'home') === 'home' : (s.tab || 'today') === 'today'); };
  var hookNd = function () {
    if (typeof ndRender !== 'function' || ndRender._bk) return;
    var o = ndRender;
    ndRender = function () {
      var r = o.apply(this, arguments);
      try {
        if (typeof _nd === 'undefined' || !_nd || !_nd.cfg) return r;
        var cur = ndSnap(), k = ndKey(cur);
        if (ndLast && ndLast.k !== k && !ndRestoring) {
          if (ndHome(cur)) { ndStack = []; if (typeof window.nfBackReset === 'function') window.nfBackReset(); }
          else { ndStack.push(ndLast.s); push(); }
        }
        ndLast = { k: k, s: cur };
      } catch (e) {}
      return r;
    };
    ndRender._bk = 1;
  };
  window.nfBackSteps.push(function () {
    var app = document.getElementById('nf-dept-app'); if (!app || app.offsetParent === null || !ndStack.length || typeof _nd === 'undefined' || !_nd) return false;
    var s = ndStack.pop(); ND_KEYS.forEach(function (k) { _nd[k] = s[k]; });
    ndRestoring = true; try { ndRender(); window.scrollTo(0, 0); } finally { ndRestoring = false; }
    ndLast = { k: ndKey(ndSnap()), s: ndSnap() };
    return true;
  });

  // ── dashboards: views and the facility drill-down ──
  var avStack = [], avRestoring = false;
  var avHome = function (v) { return v === 'today' || v === 'overview'; };
  var hookAv = function () {
    if (typeof nfAdminView !== 'function' || nfAdminView._bk) return;
    var o = nfAdminView;
    nfAdminView = function (v) {
      var before = typeof _nfOv !== 'undefined' ? _nfOv.view : null, r = o.apply(this, arguments), after = typeof _nfOv !== 'undefined' ? _nfOv.view : null;
      try { if (!avRestoring && before && after && before !== after) { if (avHome(after)) { avStack = []; if (typeof window.nfBackReset === 'function') window.nfBackReset(); } else { avStack.push(before); push(); } } } catch (e) {}
      return r;
    };
    nfAdminView._bk = 1;
    if (typeof scDrillIn === 'function' && !scDrillIn._bk) {
      var d = scDrillIn;
      scDrillIn = async function () { var before = typeof _nfOv !== 'undefined' ? _nfOv.view : null; var r = await d.apply(this, arguments);
        try { if (!avRestoring && before && before !== 'drill' && _nfOv.view === 'drill') { avStack.push(before); push(); } } catch (e) {} return r; };
      scDrillIn._bk = 1;
    }
  };
  window.nfBackSteps.push(function () {
    if (!document.body.classList.contains('nf-admin') || !avStack.length) return false;
    var to = avStack.pop(); avRestoring = true;
    try { if (_nfOv.view === 'drill' && typeof scDrillBack === 'function') { scDrillBack(); if (_nfOv.view !== to) nfAdminView(to); } else nfAdminView(to); } finally { avRestoring = false; }
    return true;
  });

  var hook = function () { hookNd(); hookAv(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
  window.addEventListener('load', function () { setTimeout(hook, 0); });
})();
