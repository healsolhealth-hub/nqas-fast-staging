// ══════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS ON THIS PHONE (4 Nov 2026) — server: functions/push.js, display: app/pwa/sw.js
//   After login, once: "Get reminders on this phone?" (Allow / Not now; asked again after 7 days). The phone's token is saved
//   for the person who is logged in, with the app language, and again at every login (a shared phone follows its user).
//   Me (staff, UPHC / PHC / CHC, HealSol): "Reminders on this phone" on / off + a test message.
//   HealSol Settings → Programme rules → "Push notifications": the Web Push key and announcements.
//   iPhone: only when the app is added to the Home Screen (Apple's rule).
//   The SC summary (server, nightly) also lists who has a card today (s.due) so the 9 AM reminder goes to the right people.
// ══════════════════════════════════════════════════════════════
var NF_PUSH_SDK = ['https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js'];
var _np = { cfg: null, busy: false, asked: false, reg: '' };
function npHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function npT(en, hi) { return npHi() && hi ? hi : en; }
function npLS(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
function npSupported() { try { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && location.protocol === 'https:'; } catch (e) { return false; } }
function npIos() { try { return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window.navigator.standalone || matchMedia('(display-mode: standalone)').matches); } catch (e) { return false; } }
function npKey() { try { var u = firebase.auth().currentUser; return (u && u.uid) || ''; } catch (e) { return ''; } }
function npLoggedIn() { try { return typeof appMode !== 'undefined' && appMode && appMode !== 'login' && !!npKey(); } catch (e) { return false; } }
async function npCfg() { if (_np.cfg) return _np.cfg; try { _np.cfg = (await fbGet('shared/sc_push_config')) || {}; } catch (e) { _np.cfg = {}; } return _np.cfg; }
async function npToken() {
  var c = await npCfg(); if (!c.vapid) throw new Error(npT('Reminders are not switched on yet by HealSol.', 'HealSol ने अभी रिमाइंडर चालू नहीं किए हैं।'));
  await nfLoadScriptAny(NF_PUSH_SDK, function () { return !!(window.firebase && firebase.messaging); });
  var reg = null; try { reg = await navigator.serviceWorker.getRegistration(); } catch (e) {} if (!reg) reg = await navigator.serviceWorker.register('sw.js');
  try { await navigator.serviceWorker.ready; } catch (e) {}
  return firebase.messaging().getToken({ vapidKey: c.vapid, serviceWorkerRegistration: reg });
}
async function npSave(t) { await nfCall('pushRegister', { token: t, lang: npHi() ? 'hi' : 'en', ua: String(navigator.userAgent || '').slice(0, 120) }); npLS('nfp_on', t); _np.reg = npKey(); }
async function npEnable(quiet) {
  if (!npSupported()) { if (!quiet) showToast(npIos() ? npT('On iPhone, first add NQAS | FAST to the Home Screen (Share → Add to Home Screen).', 'iPhone पर पहले NQAS | FAST को होम स्क्रीन पर जोड़ें (Share → Add to Home Screen)।') : npT('This browser cannot show reminders. Use Chrome.', 'यह ब्राउज़र रिमाइंडर नहीं दिखा सकता। Chrome का उपयोग करें।'), 'err'); return false; }
  try {
    var p = Notification.permission; if (p !== 'granted') p = await Notification.requestPermission();
    if (p !== 'granted') { if (!quiet) showToast(npT('Reminders are blocked for this site. Allow notifications in the browser settings.', 'इस साइट के लिए सूचनाएँ बंद हैं। ब्राउज़र सेटिंग में अनुमति दें।'), 'err'); npLS('nfp_skip', String(Date.now())); return false; }
    var t = await npToken(); if (!t) throw new Error('no token'); await npSave(t);
    if (!quiet) showToast(npT('Reminders are on for this phone.', 'इस फ़ोन पर रिमाइंडर चालू हैं।'), 'ok'); return true;
  } catch (e) { if (!quiet) showToast(npT('Could not switch on reminders: ', 'रिमाइंडर चालू नहीं हो सके: ') + String(e.message || e).slice(0, 120), 'err'); return false; }
}
async function npDisable() {
  var t = npLS('nfp_on'); try { if (t) await nfCall('pushUnregister', { token: t }); } catch (e) {}
  try { if (window.firebase && firebase.messaging) await firebase.messaging().deleteToken(); } catch (e) {}
  npLS('nfp_on', null); npLS('nfp_skip', String(Date.now())); showToast(npT('Reminders are off for this phone.', 'इस फ़ोन पर रिमाइंडर बंद हैं।'), 'ok'); npPaintMe();
}
async function npTest() { try { await nfCall('pushTest', {}); showToast(npT('Test sent — it should arrive in a few seconds.', 'टेस्ट भेजा गया — कुछ सेकंड में आएगा।'), 'ok'); } catch (e) { showToast(String(e.message || e), 'err'); } }
function npOn() { return !!npLS('nfp_on') && npSupported() && Notification.permission === 'granted'; }

// ── the ask, once after login ──
function npAskHTML() {
  return '<div class="np-ask" id="np-ask" role="dialog" aria-label="Reminders"><span class="np-bell">🔔</span><div><b>' + npT('Get reminders on this phone?', 'इस फ़ोन पर रिमाइंडर पाएँ?') + '</b><small>' + npT('Today\'s card, checks waiting for you, and important updates. You can switch them off any time in Me.', 'आज का कार्ड, आपकी जाँच, और ज़रूरी सूचनाएँ। Me में कभी भी बंद कर सकते हैं।') + '</small>'
    + '<div class="np-btns"><button type="button" class="np-yes" onclick="npAskYes()">' + npT('Allow', 'अनुमति दें') + '</button><button type="button" class="np-no" onclick="npAskNo()">' + npT('Not now', 'अभी नहीं') + '</button></div></div></div>';
}
function npAskClose() { var a = document.getElementById('np-ask'); if (a) a.remove(); }
async function npAskYes() { npAskClose(); await npEnable(false); npPaintMe(); }
function npAskNo() { npAskClose(); npLS('nfp_skip', String(Date.now())); }
async function npTick() {
  try {
    if (!npLoggedIn() || !npSupported()) return;
    if ((window.navigator.webdriver && !window.__npAuto) || (typeof NF_SAFE !== 'undefined' && NF_SAFE)) return;
    // already on: make sure this phone is saved for whoever is logged in now (shared phones)
    if (Notification.permission === 'granted' && npLS('nfp_on')) { if (_np.reg !== npKey()) { _np.reg = npKey(); var t = await npToken().catch(function () { return null; }); if (t) await npSave(t).catch(function () {}); } return; }
    if (_np.asked || Notification.permission === 'denied' || document.getElementById('np-ask')) return;
    var sk = +npLS('nfp_skip') || 0; if (sk && Date.now() - sk < 7 * 864e5) return;
    var c = await npCfg(); if (!c.vapid) return;
    _np.asked = true; document.body.insertAdjacentHTML('beforeend', npAskHTML());
  } catch (e) {}
}
(function () { var start = function () { setTimeout(npTick, 4000); setInterval(npTick, 15000); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start(); })();
// the language of the reminders follows the app
(function () { if (typeof setLang !== 'function') return; var o = setLang; setLang = function () { var r = o.apply(this, arguments); try { var t = npLS('nfp_on'); if (t && npLoggedIn()) npSave(t).catch(function () {}); } catch (e) {} return r; }; })();

// ── Me: on / off ──
function npMeHTML() {
  var on = npOn(), ios = !npSupported() && npIos();
  return '<div class="np-me" id="np-me"><div class="np-me-h"><span>🔔</span><div><b>' + npT('Reminders on this phone', 'इस फ़ोन पर रिमाइंडर') + '</b><small>' + (ios ? npT('On iPhone: add the app to the Home Screen first.', 'iPhone पर: पहले ऐप को होम स्क्रीन पर जोड़ें।') : on ? npT('On', 'चालू') : npT('Off', 'बंद')) + '</small></div>'
    + (npSupported() ? '<button type="button" class="np-tg' + (on ? ' on' : '') + '" role="switch" aria-checked="' + on + '" onclick="' + (on ? 'npDisable()' : 'npAskYes()') + '"><i></i></button>' : '') + '</div>'
    + (on ? '<button type="button" class="np-test" onclick="npTest()">' + npT('Send me a test', 'मुझे टेस्ट भेजें') + '</button>' : '') + '</div>';
}
function npPaintMe() { var el = document.getElementById('np-me'); if (el) el.outerHTML = npMeHTML(); }
(function () {
  if (typeof nfRenderMe === 'function') { var o = nfRenderMe; nfRenderMe = function () { var r = o.apply(this, arguments);
    try { var p = document.getElementById('nf-me'); if (p && !document.getElementById('np-me')) { var h = p.querySelector('.nf-ph'); if (h) h.insertAdjacentHTML('afterend', npMeHTML()); else p.insertAdjacentHTML('afterbegin', npMeHTML()); } } catch (e) {} return r; }; }
  if (typeof ndRender === 'function') { var d = ndRender; ndRender = function () { var r = d.apply(this, arguments);
    try { if (_nd && _nd.tab === 'me' && !_nd.view && !_nd.card && !_nd.screen && !document.getElementById('np-me')) { var top = document.querySelector('.nx'); if (top) top.insertAdjacentHTML('afterbegin', npMeHTML()); } } catch (e) {} return r; }; }
})();

// ── SC summary (runs on the server each night): who has a card today ──
(function () {
  if (typeof nfSumFacility !== 'function') return; var o = nfSumFacility;
  nfSumFacility = function (st) { var s = o.apply(this, arguments);
    try { var idx = s && s.day ? s.day - 1 : -1, pid = s && s.progId || 'nqas_12A', S = (st && (st.staff || (st.fac || {}).staff)) || {};
      if (s && idx >= 0 && idx < 56) { var present = scRolesFromRoster(S), d = scDayDef(pid, idx), due = [];
        Object.keys(S).forEach(function (m) { var x = S[m]; if (!x || x.disabled) return; if ((d.cps || []).some(function (cp) { return scCpForRoleIn(cp, x.role || 'CHO', present); })) due.push(m); });
        s.due = due; s.dueDate = scTodayStr(); } } catch (e) { console.warn('[push] due', e); }
    return s; };
})();

// ── HealSol: Settings → Programme rules → Push notifications ──
async function npCfgRender() {
  var el = document.getElementById('hs-push'); if (!el) return; _np.cfg = null; var c = await npCfg();
  var G = [['staff', 'All facility staff'], ['incharge', 'Facility in-charges only'], ['champion', 'Quality Champions'], ['supervisor', 'Supervisors / Mentors'], ['district', 'District Admins'], ['healsol', 'HealSol Admins']];
  el.innerHTML = '<b><i class="ti ti-bell"></i> Push notifications</b><p>Reminders go out by themselves: 9 AM (today\'s card, programme starts tomorrow, checks and overdue actions for in-charges, baseline ending, Champions\' checks, Monday summary for Supervisors and District Admins) and 6 PM (card still open). HealSol phones get new sign-ups, enquiries, payments and start-date requests. Demo, test and paused facilities get nothing.</p>'
    + '<div class="dm-pw"><label>Web Push key (public key from Firebase → Cloud Messaging → Web Push certificates)<input type="text" id="np-vapid" value="' + scEsc(c.vapid || '') + '" placeholder="B…" autocomplete="off"></label><small>' + (c.vapid ? 'Saved — phones can switch reminders on.' : 'Not saved yet — reminders stay off until it is.') + '</small></div>'
    + '<div class="iv-acts"><button type="button" class="hs-btn p" onclick="npCfgSave()">Save key</button>' + (c.vapid ? '<button type="button" class="hs-btn" onclick="npAskYes()">Reminders on this computer / phone</button><button type="button" class="hs-btn" onclick="npTest()">Send me a test</button>' : '') + '</div>'
    + (c.vapid ? '<div class="np-ann"><b>Send an announcement</b><div class="np-grid"><label>Title (English)<input id="np-t" maxlength="80" placeholder="NQAS | FAST launches today!"></label><label>Message (English)<textarea id="np-b" maxlength="240" rows="2"></textarea></label>'
      + '<label>Title (Hindi, optional)<input id="np-th" maxlength="80"></label><label>Message (Hindi, optional)<textarea id="np-bh" maxlength="240" rows="2"></textarea></label></div>'
      + '<div class="np-groups">' + G.map(function (g) { return '<label><input type="checkbox" class="np-g" value="' + g[0] + '"' + (g[0] === 'staff' ? ' checked' : '') + '> ' + g[1] + '</label>'; }).join('') + '</div>'
      + '<label class="np-st">States (optional, comma separated)<input id="np-s" placeholder="Uttar Pradesh, Bihar"></label>'
      + '<div class="iv-acts"><button type="button" class="hs-btn" onclick="npAnnounce(true)">Count who gets it</button><button type="button" class="hs-btn p" onclick="npAnnounce(false)">Send</button></div><div id="np-msg" class="dm-msg"></div></div>' : '');
}
async function npCfgSave() {
  var v = String((document.getElementById('np-vapid') || {}).value || '').trim();
  if (!/^B[A-Za-z0-9_-]{60,}$/.test(v)) { showToast('That does not look like the public key (it starts with B and is about 87 characters).', 'err'); return; }
  if (await fbSet('shared/sc_push_config', { vapid: v, at: new Date().toISOString() }) === false) { showToast('Could not save.', 'err'); return; }
  showToast('Key saved.', 'ok'); npCfgRender();
}
async function npAnnounce(dry) {
  var g = Array.prototype.slice.call(document.querySelectorAll('.np-g:checked')).map(function (x) { return x.value; }), m = document.getElementById('np-msg');
  var d = { title: (document.getElementById('np-t') || {}).value || '', body: (document.getElementById('np-b') || {}).value || '', titleHi: (document.getElementById('np-th') || {}).value || '', bodyHi: (document.getElementById('np-bh') || {}).value || '',
    groups: g, states: String((document.getElementById('np-s') || {}).value || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), dry: !!dry };
  if (!g.length) { showToast('Choose who gets it.', 'err'); return; }
  if (!dry && (d.title.trim().length < 3 || d.body.trim().length < 3)) { showToast('Write a title and a message.', 'err'); return; }
  if (dry) { d.title = d.title || 'x'.repeat(3); d.body = d.body || 'x'.repeat(3); }
  if (!dry && !(await scDialog({ title: 'Send this announcement now?', icon: '📣', okLabel: 'Send', message: d.title + ' — ' + d.body }))) return;
  try { var r = await nfCall('pushAnnounce', d);
    if (dry) { if (m) m.textContent = r.people + ' people · ' + r.phones + ' phones with reminders on'; return; }
    if (m) m.textContent = 'Sent to ' + r.sent + ' phones (' + r.people + ' people).'; showToast('Announcement sent.', 'ok');
  } catch (e) { showToast(String(e.message || e), 'err'); }
}
(function () {
  if (typeof hspSignupRender === 'function') { var o = hspSignupRender; hspSignupRender = async function () { var r = await o.apply(this, arguments);
    try { var su = document.getElementById('hs-signup'), el = document.getElementById('hs-push');
      if (su && !el) { el = document.createElement('div'); el.id = 'hs-push'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); npCfgRender(); } } catch (e) { console.warn('[push]', e); }
    return r; }; }
  if (typeof hsSetupGroup === 'function') { var g = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-push') return 'rules'; return g.apply(this, arguments); }; }
})();
