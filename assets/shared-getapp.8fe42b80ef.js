// ── Get the Qi FAST app (17 Nov 2026) ─────────────────────────────────────────────
// Login screen only. Android phone in a browser: a card under "Join NQAS FAST" with a Google Play button.
// Laptop / desktop: a card beside the login with a QR code to Google Play (shown at 1000px and wider).
// Never inside the Qi FAST Play app, never in the installed web app, never on iPhone / iPad (no iOS app yet).
// A small "Part of the Qi FAST family" line sits at the foot of the login in every case.
var GA_PLAY = 'https://play.google.com/store/apps/details?id=com.thehealsol.qifast';
function gaHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function gaT(en, hi) { return gaHi() ? hi : en; }
function gaMode() {
  try {
    if (typeof nfIsPlay === 'function' && nfIsPlay()) return '';
    var mm = function (q) { return !!(window.matchMedia && window.matchMedia(q).matches); };
    if (mm('(display-mode: standalone)') || mm('(display-mode: fullscreen)') || mm('(display-mode: minimal-ui)') || navigator.standalone) return '';
    var ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) return 'card';
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return '';
    if (/Mobi|Tablet/i.test(ua)) return '';
    return 'qr';
  } catch (e) { return ''; }
}
function gaPaint() {
  var root = document.getElementById('nf-login'), scr = document.getElementById('login-screen'); if (!root || !scr) return;
  var mode = gaMode(), old;
  // Android: card under Join, before "Already applied?"
  old = document.getElementById('ga-card'); if (old) old.remove();
  if (mode === 'card') {
    var f = document.getElementById('nf-l-form'), chk = document.getElementById('jn-chk');
    if (f) {
      var h = '<div class="ga-card" id="ga-card"><div class="ga-row"><img class="ga-logo" src="icons/qi-logo.jpg" alt="Qi FAST"><div class="ga-tx"><b>' + gaT('Get the Qi FAST app', 'Qi FAST ऐप पाएँ') + '</b><small>'
        + gaT('Same login. Opens straight from your home screen.', 'वही लॉगिन। होम स्क्रीन से सीधे खुलता है।') + '</small></div></div>'
        + '<a class="ga-btn" href="' + GA_PLAY + '" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
        + gaT('Download from Google Play', 'Google Play से डाउनलोड करें') + '</a></div>';
      if (chk && chk.parentNode === f) chk.insertAdjacentHTML('beforebegin', h); else f.insertAdjacentHTML('beforeend', h);
    }
  }
  // Laptop: QR card beside the login
  old = document.getElementById('ga-side'); if (old) old.remove();
  scr.classList.toggle('ga-qr', mode === 'qr');
  if (mode === 'qr') {
    scr.insertAdjacentHTML('beforeend', '<aside class="ga-side" id="ga-side" aria-label="' + gaT('Get the app on your phone', 'अपने फ़ोन पर ऐप पाएँ') + '"><img class="ga-slogo" src="icons/qi-logo.jpg" alt="Qi FAST">'
      + '<b>' + gaT('Get the app on your phone', 'अपने फ़ोन पर ऐप पाएँ') + '</b>'
      + '<small>' + gaT('Scan with your Android phone’s camera to install Qi FAST from Google Play. Same login.', 'Google Play से Qi FAST इंस्टॉल करने के लिए अपने Android फ़ोन के कैमरे से स्कैन करें। वही लॉगिन।') + '</small>'
      + '<img class="ga-qrimg" src="icons/play-qr.png" alt="' + gaT('QR code to Qi FAST on Google Play', 'Google Play पर Qi FAST का QR कोड') + '">'
      + '<a href="' + GA_PLAY + '" target="_blank" rel="noopener">' + gaT('Open in Google Play', 'Google Play में खोलें') + '</a></aside>');
  }
  // foot line, every case
  var foot = document.getElementById('ga-foot');
  if (!foot) { foot = document.createElement('div'); foot.id = 'ga-foot'; foot.className = 'ga-foot'; root.appendChild(foot); }
  foot.innerHTML = gaHi() ? '<img src="icons/qi-logo.jpg" alt="Qi FAST"><span>परिवार का हिस्सा</span>'
    : '<span>Part of the</span><img src="icons/qi-logo.jpg" alt="Qi FAST"><span>family</span>';
}
(function () {
  try { if (typeof jnPaintLogin === 'function' && !jnPaintLogin._ga) { var o = jnPaintLogin; jnPaintLogin = function () { var r = o.apply(this, arguments); try { gaPaint(); } catch (e) {} return r; }; jnPaintLogin._ga = 1; } } catch (e) {}
  try { if (document.readyState !== 'loading') gaPaint(); else document.addEventListener('DOMContentLoaded', function () { try { gaPaint(); } catch (e) {} }); } catch (e) {}
})();
