// ═══ Screen review fixes (15 Nov 2026) ═══
//  1  Supervisor (and any non-HealSol admin role with more than 5 menu items): phone bottom bar shows the first 3 + More.
// 12  HealSol Settings → Programme rules: one tab per rule instead of one long page.
// 14  UPHC / PHC / CHC in-charges: one bottom menu (Home · My cards · Staff · Readiness · More) on the facility
//     dashboard and on their own cards; their own Today · Cards · Progress · Me sit in a row just above it.

// ── 1 · More sheet for long admin menus ──
var _nfOvf = [];
function nfOvfOpen() {
  if (document.getElementById('hs-more')) { hsMoreClose(); return; }
  var all = (typeof nfAdminItems === 'function' ? nfAdminItems() : []).filter(function (x) { return _nfOvf.indexOf(x.v) >= 0; });
  var SUB = { peer: 'Peer review sessions', live: 'Scheduled live sessions', reports: 'Reports and downloads', editor: 'Cards and checkpoints', setup: 'Settings' };
  var ov = document.createElement('div'); ov.id = 'hs-more'; ov.className = 'hs-more';
  ov.innerHTML = '<div class="hs-more-bg" onclick="hsMoreClose()"></div><div class="hs-more-sh" role="dialog" aria-label="More"><i class="hs-more-grip"></i><div class="hs-more-k">MORE</div>'
    + all.map(function (x) { return '<button type="button" onclick="hsMoreClose();' + String(x.onclick).replace(/"/g, '&quot;') + '"><span class="hs-more-i"><i class="ti ' + x.icon + '"></i></span><span><b>' + scEsc(x.l) + '</b>' + (SUB[x.v] ? '<small>' + SUB[x.v] + '</small>' : '') + '</span><i class="ti ti-chevron-right"></i></button>'; }).join('') + '</div>';
  document.body.appendChild(ov); document.body.classList.add('hs-more-on');
  var b = document.querySelector('.nfs-nav [data-v=more]'); if (b) b.classList.add('on');
}
function nfOvfMark() {
  try {
    var on = _nfOvf.length > 0; document.body.classList.toggle('nf-ovf-on', on);
    document.querySelectorAll('#nfs-side .nfs-nav button').forEach(function (b) {
      var v = b.getAttribute('data-v'); b.classList.toggle('nf-ovf', on && _nfOvf.indexOf(v) >= 0);
      if (on && v === 'more') b.classList.toggle('on', _nfOvf.indexOf(_nfOv.view) >= 0 || (_nfOv.view === 'drill' && _nfOvf.indexOf(_nfOv.prev) >= 0));
    });
  } catch (e) {}
}
(function () {
  if (typeof nfAdminItems !== 'function') return;
  var oI = nfAdminItems;
  nfAdminItems = function () {
    var L = oI.apply(this, arguments);
    if ((typeof hsOn === 'function' && hsOn()) || L.length <= 5 || L.some(function (x) { return x.v === 'more'; })) { _nfOvf = []; return L; }
    _nfOvf = L.slice(3).map(function (x) { return x.v; });
    return L.concat([{ v: 'more', l: 'More', icon: 'ti-dots', onclick: 'nfOvfOpen()' }]);
  };
  if (typeof nfAdminApply === 'function') { var oA = nfAdminApply; nfAdminApply = function () { var r = oA.apply(this, arguments); nfOvfMark(); if (_nfOvf.length && typeof hsMoreClose === 'function') hsMoreClose(); return r; }; }
  if (typeof nfAdminShell === 'function') { var oS = nfAdminShell; nfAdminShell = function () { var r = oS.apply(this, arguments); setTimeout(nfOvfMark, 0); return r; }; }
})();

// ── 12 · Programme rules as tabs ──
var HS_RTABS = [
  ['Assessment', [['crit', 'hs-crit', 'NQAS criteria', 'Overall, area and standard minimums'], ['time', 'hs-rules', 'Timeline', 'Grace and catch-up days']]],
  ['Programme', [['start', 'hs-start', 'Programme start date', 'When facilities may start']]],
  ['Access', [['signup', 'hs-signup', 'Self sign-up', 'Approval for each facility type'], ['otp', 'hs-otp', 'WhatsApp codes', 'Codes for staff logins']]],
  ['Communication', [['push', 'hs-push', 'Push notifications', 'Reminders at 9 AM and 6 PM'], ['promos', 'hs-promos', 'Promotions', 'Slides for facility staff']]],
  ['Other', [['demo', 'hs-demo', 'Demo facilities', 'Demo SC, UPHC, PHC and CHC'], ['cert', 'nf-certset', 'Certificate signatory', 'Names on certificates']]]
];
function hsRkSet(k) { _hs.rk = k; _hs.rkUser = 1; hsRkApply(); try { var m = document.querySelector('#admin-app .admin-main'); if (m && window.innerWidth < 900) { var nav = document.getElementById('hs-rtabs'); if (nav) nav.scrollIntoView({ block: 'nearest' }); } } catch (e) {} }
function hsRkApply() {
  try {
    var main = document.querySelector('#admin-app .admin-main'); if (!main || typeof _hs === 'undefined') return;
    var present = {}, byId = {};
    HS_RTABS.forEach(function (g) { g[1].forEach(function (x) { byId[x[1]] = x[0]; if (document.getElementById(x[1])) present[x[0]] = 1; }); });
    if (!_hs.rkUser || !_hs.rk || !present[_hs.rk]) _hs.rk = present.crit ? 'crit' : Object.keys(present)[0] || 'crit';
    var nav = document.getElementById('hs-rtabs');
    if (!nav) { nav = document.createElement('nav'); nav.id = 'hs-rtabs'; nav.className = 'hs-rtabs'; nav.setAttribute('aria-label', 'Programme rules'); nav.dataset.nfv = 'setup'; nav.dataset.hsg = 'rules'; }
    var first = null; [].forEach.call(main.children, function (el) { if (!first && el.dataset && el.dataset.hsg === 'rules' && el !== nav) first = el; });
    if (first && nav.nextElementSibling !== first) main.insertBefore(nav, first); else if (!first && !nav.parentNode) main.appendChild(nav);
    var h = '';
    HS_RTABS.forEach(function (g) {
      var items = g[1].filter(function (x) { return present[x[0]]; }); if (!items.length) return;
      h += '<div class="hs-rt-g">' + g[0] + '</div>' + items.map(function (x) { var on = _hs.rk === x[0];
        return '<button type="button" class="' + (on ? 'on' : '') + '" aria-current="' + (on ? 'true' : 'false') + '" onclick="hsRkSet(\'' + x[0] + '\')"><b>' + x[2] + '</b><small>' + x[3] + '</small></button>'; }).join('');
    });
    if (nav.innerHTML !== h) nav.innerHTML = h;
    if (window.innerWidth < 900) { var onb = nav.querySelector('button.on'); if (onb) nav.scrollLeft = Math.max(0, onb.offsetLeft - nav.offsetLeft - 16); }
    [].forEach.call(main.children, function (el) {
      if (!el.id || !(el.id in byId)) return;
      el.setAttribute('data-rk', byId[el.id]);
      if (byId[el.id] === _hs.rk) el.setAttribute('data-rkon', ''); else el.removeAttribute('data-rkon');
    });
  } catch (e) { console.warn('[rules tabs]', e); }
}
(function () {
  if (typeof hsSetupGroup === 'function') { var oG = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-rtabs') return 'rules'; return oG.apply(this, arguments); }; }
  if (typeof hsTagSetup === 'function') { var oT = hsTagSetup; hsTagSetup = function () { var r = oT.apply(this, arguments); hsRkApply(); return r; }; }
  if (typeof nfAdminApply === 'function') { var oA = nfAdminApply; nfAdminApply = function () { var r = oA.apply(this, arguments); if (typeof hsOn === 'function' && hsOn()) hsRkApply(); return r; }; }
  // cards that are added later (start date, codes, promotions …) get their tab as soon as they appear
  var mo = null, hook = function () { var main = document.querySelector('#admin-app .admin-main'); if (!main || mo) return; mo = new MutationObserver(function (L) { if (!(typeof hsOn === 'function' && hsOn())) return; if (L.some(function (m) { return [].some.call(m.addedNodes, function (n) { return n.nodeType === 1 && n.id && n.id !== 'hs-rtabs'; }); })) hsRkApply(); }); mo.observe(main, { childList: true }); };
  document.addEventListener('DOMContentLoaded', function () { setTimeout(hook, 0); });
  setInterval(hook, 3000);
})();

// ── 14 · One bottom menu for UPHC / PHC / CHC in-charges ──
function ndIcOn() { try { return !!_nd && !_nd.view && ndFaCan(ndMob()); } catch (e) { return false; } }
function ndIcNav(cur) {
  var b = function (k, icon, label, js, em) { return '<button type="button" class="' + (cur === k ? 'on' : '') + '" onclick="' + js + '"><i class="ti ' + icon + '"></i>' + label + (em ? '<em>' + em + '</em>' : '') + '</button>'; };
  var c = 0, j = 0; try { c = nxFaCount(); } catch (e) {} try { j = nxJobCount(ndMob()); } catch (e) {}
  return '<nav class="nx-nav nx-ic">' + b('home', 'ti-home', 'Home', "ndFaOpen('home')", c || '') + b('mine', 'ti-cards', 'My cards', 'ndMyCards()', j || '')
    + b('staff', 'ti-users', 'Staff', "ndFaOpen('staff')") + b('ready', 'ti-chart-bar', 'Readiness', "ndFaOpen('ready')") + b('more', 'ti-settings', 'More', "ndFaOpen('more')") + '</nav>';
}
(function () {
  if (typeof ndFaHTML === 'function') {
    var oF = ndFaHTML;
    ndFaHTML = function () {
      var h = oF.apply(this, arguments); if (!ndIcOn()) return h;
      document.body.classList.remove('nd-ic-mine');
      h = h.replace(/<button type="button" class="nx-mc"[\s\S]*?<\/button>/, '');
      var i = h.lastIndexOf('<nav class="nx-nav">'); if (i < 0) return h;
      return h.slice(0, i) + ndIcNav(_nd.fatab || 'home');
    };
  }
  if (typeof ndNavHTML === 'function') {
    var oN = ndNavHTML;
    ndNavHTML = function () {
      if (!ndIcOn()) { document.body.classList.remove('nd-ic-mine'); return oN.apply(this, arguments); }
      document.body.classList.add('nd-ic-mine');
      var tab = _nd.tab, s = function (k, label, on) { return '<button type="button" class="' + ((on !== undefined ? on : tab === k) ? 'on' : '') + '" onclick="ndTab(\'' + k + '\')">' + label + '</button>'; };
      return '<div class="nx-icsub" role="tablist" aria-label="My cards">' + s('today', 'Today') + s('cards', 'Cards') + s('ready', 'Progress') + s('me', 'Me', tab === 'me' || tab === 'setup' || tab === 'dept') + '</div>' + ndIcNav('mine');
    };
  }
})();
