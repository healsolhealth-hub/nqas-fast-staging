// ── Move Android visitors to the Qi FAST app (18 Nov 2026) ─────────────────────────────────────
// Android phone, in a browser (not the Qi FAST Play app, not an installed shortcut): a full-screen "Use the Qi FAST app"
// page, at most once a day. "Open Qi FAST" opens the app (Google Play when it is not installed); "Continue in browser"
// carries on. Never on a payment link (/pay/ — payments are made on the website only), never on laptop or iPhone.
var QM_PKG = 'com.thehealsol.qifast', QM_PLAY = 'https://play.google.com/store/apps/details?id=' + QM_PKG;
function qmStandalone() { try { var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); }; return mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || mm('(display-mode: minimal-ui)') || !!navigator.standalone; } catch (e) { return false; } }
function qmAndroidWeb() {
  try {
    if (typeof nfIsPlay === 'function' && nfIsPlay()) return false;
    if (qmStandalone()) return false;
    return /Android/i.test(navigator.userAgent || '');
  } catch (e) { return false; }
}
// opens the installed app on the address it is linked to; Chrome falls back to Google Play when it is not installed
function qmIntent() { return 'intent://' + location.host + '/#Intent;scheme=https;package=' + QM_PKG + ';S.browser_fallback_url=' + encodeURIComponent(QM_PLAY) + ';end'; }
function qmToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function qmSeen() { try { return localStorage.getItem('qm_day') === qmToday(); } catch (e) { return false; } }
function qmMark() { try { localStorage.setItem('qm_day', qmToday()); } catch (e) {} }
function qmPaying() { try { return !!sessionStorage.getItem('nf_pay') || /^\/pay\b/.test(location.pathname) || /[?&](pay|l|cert|impact)=/.test(location.search || '') || window.top !== window.self; } catch (e) { return true; } }   // also: certificate / impact / poster check pages, and inside another site's frame
function qmClose() { qmMark(); var o = document.getElementById('qm-ov'); if (o) o.remove(); try { document.documentElement.classList.remove('qm-lock'); } catch (e) {} }
function qmShow(force) {
  if (!force && (!qmAndroidWeb() || qmSeen() || qmPaying())) return;
  if (document.getElementById('qm-ov')) return;
  var ck = '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E6B5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>';
  var ov = document.createElement('div'); ov.id = 'qm-ov'; ov.className = 'qm-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'qm-h');
  ov.innerHTML = '<div class="qm-in"><div class="qm-logo"><img src="icons/qi-logo.jpg" alt="Qi FAST by HealSol"></div>'
    + '<h1 id="qm-h">Use the Qi FAST app</h1><p class="qm-lead">NQAS | FAST now lives in the Qi FAST app on Google Play. Same login, same data — faster, and it works with weak network.</p>'
    + '<ul class="qm-pts"><li>' + ck + '<span>Log in with your same mobile number</span></li><li>' + ck + '<span>All your scores and reports are already there</span></li><li>' + ck + '<span>Free to download</span></li></ul>'
    + '<div class="qm-sp"></div><div class="qm-acts"><a class="qm-open" id="qm-open" href="' + qmIntent() + '" onclick="qmMark()"><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6"/><path d="M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>Open Qi FAST</a>'
    + '<p class="qm-sm">Not installed yet? This button opens Google Play.</p><button type="button" class="qm-cont" onclick="qmClose()">Continue in browser</button></div>'
    + '<p class="qm-foot">HealSol Academy · ' + String(location.host).replace(/[<>&"]/g, '') + '</p></div>';
  document.body.appendChild(ov);
  try { document.documentElement.classList.add('qm-lock'); } catch (e) {}
  try { var b = document.getElementById('qm-open'); if (b) b.focus(); } catch (e) {}
}
(function () {
  var go = function () { try { qmShow(); } catch (e) { console.warn('[qi]', e); } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
