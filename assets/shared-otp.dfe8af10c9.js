// ══════════════════════════════════════════════════════════════
// WHATSAPP OTP (6 Nov 2026) — the code screen and the four places that use it
//   · Forgot password (login screen): mobile → code → new password → logged in. No in-charge needed.
//   · First password (temporary password from the in-charge / HealSol): code before choosing the password (the server insists).
//   · New phone: after signing in on a phone not used before, a code once; then the phone is remembered.
//   · Sign-up and join forms: the mobile in the form is confirmed with a code before sending (the server insists).
//   Off until HealSol switches it on (Settings → WhatsApp codes). If the server is not ready the app works as before.
//   Never for demo logins (the Play reviewer) — the server says "not needed" for them.
// ══════════════════════════════════════════════════════════════
Object.assign(typeof HINDI_UI === 'object' ? HINDI_UI : {}, {
  'Confirm it is you': 'पुष्टि करें कि यह आप हैं', 'Enter the 6-digit code we sent on WhatsApp to': 'WhatsApp पर भेजा गया 6 अंकों का कोड डालें —',
  'Verify': 'पुष्टि करें', 'Resend code': 'कोड फिर भेजें', 'Resend in': 'फिर भेजें', 'Change number': 'नंबर बदलें', 'Cancel': 'रद्द करें',
  'Send code on WhatsApp': 'WhatsApp पर कोड भेजें', 'Your mobile number': 'आपका मोबाइल नंबर', 'Reset your password': 'अपना पासवर्ड बदलें',
  'Confirm your mobile number': 'अपना मोबाइल नंबर पक्का करें', 'New phone': 'नया फ़ोन',
  'For your safety, confirm it is you the first time you log in on this phone.': 'आपकी सुरक्षा के लिए, इस फ़ोन पर पहली बार लॉग इन करने पर पुष्टि करें कि यह आप हैं।',
  'Before choosing your password, confirm this mobile number is yours.': 'पासवर्ड चुनने से पहले पक्का करें कि यह मोबाइल नंबर आपका है।',
  'We will send a 6-digit code on WhatsApp.': 'हम WhatsApp पर 6 अंकों का कोड भेजेंगे।',
  'Choose a new password': 'नया पासवर्ड चुनें', 'Your password is changed. Logging you in…': 'आपका पासवर्ड बदल गया। लॉग इन हो रहा है…',
  'Confirm your mobile number with the WhatsApp code to continue.': 'जारी रखने के लिए WhatsApp कोड से अपना मोबाइल नंबर पक्का करें।',
  'Confirm your mobile number with the WhatsApp code to send this form.': 'यह फ़ॉर्म भेजने के लिए WhatsApp कोड से अपना मोबाइल नंबर पक्का करें।',
  'Did not get it? Check WhatsApp on this number, or ask your in-charge / HealSol to reset your password.': 'नहीं मिला? इस नंबर पर WhatsApp देखें, या अपने प्रभारी / HealSol से पासवर्ड रीसेट करवाएँ।'
});
var _ot = {};
function otT(s) { return typeof t === 'function' ? t(s) : s; }
function otE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s); }
function otMob(x) { var d = String(x || '').replace(/\D/g, ''); if (d.length === 12 && d.indexOf('91') === 0) d = d.slice(2); if (d.length === 11 && d[0] === '0') d = d.slice(1); return /^[6-9]\d{9}$/.test(d) ? d : ''; }
function otDevId() {
  try { var d = localStorage.getItem('nf_dev'); if (!d || d.length < 16) { d = Array.prototype.map.call(crypto.getRandomValues(new Uint8Array(16)), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); localStorage.setItem('nf_dev', d); } return d; }
  catch (e) { if (!_ot.dev) _ot.dev = String(Math.random()).slice(2) + String(Date.now()); return _ot.dev; }
}
function otOk(mob) { try { return localStorage.getItem('nf_dev_ok_' + mob) === '1'; } catch (e) { return false; } }
function otSetOk(mob) { try { localStorage.setItem('nf_dev_ok_' + mob, '1'); } catch (e) {} }
// is a code needed? (any problem reaching the server → no: the app keeps working as before)
// signed in: the switches are read from the database first (fast), so nobody waits for the server while codes are off
async function otOn(purpose) { try { var c = await fbGet('shared/sc_otp_config'); return !!(c && c.on && c[purpose] !== false); } catch (e) { return false; } }
async function otNeed(purpose, extra) { try { var r = await nfCall('otpNeeded', Object.assign({ purpose: purpose }, extra || {})); return r || { need: false }; } catch (e) { return { need: false }; } }

// The code screen. opts: purpose, mobile, askMobile, title, sub → resolves {token, mobile} or null (cancelled)
function otAsk(opts) {
  return new Promise(function (done) {
    var o = opts || {}, mob = otMob(o.mobile), tmr = null, left = 0;
    try { if (typeof nfBootOff === 'function') nfBootOff(); if (typeof nfCoverOff === 'function') nfCoverOff(); } catch (e) {}
    var ov = document.createElement('div'); ov.className = 'ot-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    document.body.appendChild(ov);
    var close = function (v) { clearInterval(tmr); if (ov.parentNode) ov.remove(); done(v); };
    var err = function (m) { var e = ov.querySelector('.ot-err'); if (e) { e.textContent = m || ''; e.style.display = m ? 'block' : 'none'; } };
    var busy = function (b, on, label) { if (!b) return; b.disabled = on; if (label) b.textContent = label; };
    var head = '<div class="ot-ic">💬</div><h2>' + otE(o.title || otT('Confirm it is you')) + '</h2>' + (o.sub ? '<p class="ot-sub">' + otE(o.sub) + '</p>' : '');
    var stepMobile = function () {
      ov.innerHTML = '<div class="ot-card">' + head + '<label class="ot-lbl" for="ot-mob">' + otE(otT('Your mobile number')) + '</label>'
        + '<input id="ot-mob" class="ot-in" type="tel" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="10-digit mobile" value="' + otE(mob) + '">'
        + '<p class="ot-sub">' + otE(otT('We will send a 6-digit code on WhatsApp.')) + '</p><div class="ot-err" role="alert"></div>'
        + '<button type="button" class="ot-btn" id="ot-send">' + otE(otT('Send code on WhatsApp')) + '</button><button type="button" class="ot-link" id="ot-x">' + otE(otT('Cancel')) + '</button></div>';
      ov.querySelector('#ot-x').onclick = function () { close(null); };
      ov.querySelector('#ot-send').onclick = function () { var m = otMob(ov.querySelector('#ot-mob').value); if (!m) return err('Enter a valid 10-digit mobile number.'); mob = m; send(this); };
      setTimeout(function () { try { ov.querySelector('#ot-mob').focus(); } catch (e) {} }, 50);
    };
    var stepCode = function (to) {
      ov.innerHTML = '<div class="ot-card">' + head + '<p class="ot-sub">' + otE(otT('Enter the 6-digit code we sent on WhatsApp to')) + ' <b>•••••• ' + otE(to || (mob ? mob.slice(-4) : '')) + '</b></p>'
        + '<input id="ot-code" class="ot-in ot-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••••">'
        + '<div class="ot-err" role="alert"></div><button type="button" class="ot-btn" id="ot-ok">' + otE(otT('Verify')) + '</button>'
        + '<div class="ot-row"><button type="button" class="ot-link" id="ot-re" disabled></button>' + (o.askMobile ? '<button type="button" class="ot-link" id="ot-ch">' + otE(otT('Change number')) + '</button>' : '') + '<button type="button" class="ot-link" id="ot-x">' + otE(otT('Cancel')) + '</button></div>'
        + '<p class="ot-help">' + otE(otT('Did not get it? Check WhatsApp on this number, or ask your in-charge / HealSol to reset your password.')) + '</p></div>';
      var inp = ov.querySelector('#ot-code'), re = ov.querySelector('#ot-re');
      inp.oninput = function () { inp.value = inp.value.replace(/\D/g, '').slice(0, 6); if (inp.value.length === 6) ov.querySelector('#ot-ok').click(); };
      ov.querySelector('#ot-x').onclick = function () { close(null); };
      if (o.askMobile) ov.querySelector('#ot-ch').onclick = function () { clearInterval(tmr); stepMobile(); };
      ov.querySelector('#ot-ok').onclick = async function () {
        var b = this, c = inp.value.replace(/\D/g, ''); if (c.length !== 6) return err('Enter the 6-digit code.');
        err(''); busy(b, true, '…');
        try { var r = await nfCall('otpVerify', { purpose: o.purpose, mobile: mob, code: c, deviceId: otDevId() }); close({ token: r.token, mobile: mob }); }
        catch (e) { busy(b, false, otT('Verify')); err(e.message); inp.value = ''; inp.focus(); }
      };
      left = 45; var tick = function () { if (left > 0) { re.disabled = true; re.textContent = otT('Resend in') + ' ' + left + 's'; left--; } else { clearInterval(tmr); re.disabled = false; re.textContent = otT('Resend code'); } };
      clearInterval(tmr); tick(); tmr = setInterval(tick, 1000);
      re.onclick = function () { send(re); };
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
    };
    var send = async function (btn) {
      err(''); var old = btn && btn.textContent; busy(btn, true, '…');
      try { var r = await nfCall('otpSend', { purpose: o.purpose, mobile: mob }); if (r && r.demo) return close({ token: '', mobile: mob, demo: true }); stepCode(r && r.to); }
      catch (e) { busy(btn, false, old); err(e.message); }
    };
    if (o.askMobile && !mob) stepMobile(); else { ov.innerHTML = '<div class="ot-card">' + head + '<div class="ot-spin"></div></div>'; send(null); }
  });
}

// ── 1. Forgot password ──
(function () {
  var hook = function () {
    if (typeof nfForgot !== 'function' || nfForgot._ot) return;
    var o = nfForgot;
    nfForgot = async function () {
      var r0 = await otNeed('reset'); if (!r0.need) return o.apply(this, arguments);
      var typed = otMob((document.getElementById('nf-id') || {}).value);
      var r = await otAsk({ purpose: 'reset', mobile: typed, askMobile: true, title: otT('Reset your password') });
      if (!r || !r.token) return;
      var v = await scDialog({ title: otT('Choose a new password'), icon: '🔑', okLabel: otT('Save and continue'), fields: [
        { key: 'np', label: otT('New password'), type: 'password', required: true }, { key: 'np2', label: otT('Confirm new password'), type: 'password', required: true }],
        validate: function (x) { if (x.np.length < 8 || !/[A-Za-z]/.test(x.np) || !/[0-9]/.test(x.np)) return otT('Use at least 8 characters, with letters and numbers.'); if (x.np !== x.np2) return otT('The two passwords do not match.'); return null; } });
      if (!v) return;
      try {
        await nfCall('otpResetPassword', { mobile: r.mobile, token: r.token, newPassword: v.np });
        if (typeof showToast === 'function') showToast(otT('Your password is changed. Logging you in…'), 'ok');
        otSetOk(r.mobile);   // this phone just proved the number
        var id = document.getElementById('nf-id'), pw = document.getElementById('nf-pwd'); if (id && pw) { id.value = r.mobile; pw.value = v.np; if (typeof nfSubmit === 'function') nfSubmit(); }
      } catch (e) { if (typeof scAlert === 'function') scAlert(e.message, otT('Reset your password'), '🔑'); }
    };
    nfForgot._ot = 1;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── 2. First password · 4. Sign-up and join forms: a code before the server call that needs it ──
(function () {
  var hook = function () {
    if (typeof nfCall !== 'function' || nfCall._ot) return;
    var o = nfCall;
    nfCall = async function (name, data) {
      var d = data || {};
      if (name === 'setNewPassword' && !d.otpToken) {
        var mob = otMob((typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || '');
        if (mob && (await otOn('first')) && (await otNeed('first')).need) {
          var r = await otAsk({ purpose: 'first', mobile: mob, title: otT('Confirm it is you'), sub: otT('Before choosing your password, confirm this mobile number is yours.') });
          if (!r) throw new Error(otT('Confirm your mobile number with the WhatsApp code to continue.'));
          d = Object.assign({}, d, { otpToken: r.token }); otSetOk(mob);
        }
      }
      if ((name === 'demoSignup' || name === 'submitEnquiry') && !d.otpToken && d.source !== 'delete') {
        var m = otMob(d.mobile), me = otMob((typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || ''), hs = typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.hs;
        if (m && m !== me && !hs && (await otNeed('signup')).need) {
          var r2 = await otAsk({ purpose: 'signup', mobile: m, title: otT('Confirm your mobile number') });
          if (!r2) throw new Error(otT('Confirm your mobile number with the WhatsApp code to send this form.'));
          if (r2.token) d = Object.assign({}, d, { otpToken: r2.token });
        }
      }
      return o.call(this, name, d);
    };
    nfCall._ot = 1;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── 3. New phone: a code once, the first time someone signs in on this phone ──
(function () {
  var hook = function () {
    if (typeof nfRouteAuthed !== 'function' || nfRouteAuthed._ot) return;
    var o = nfRouteAuthed;
    nfRouteAuthed = async function () {
      try {
        var mob = otMob((typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || '');
        if (mob && !otOk(mob) && (await otOn('device'))) {
          var n = await otNeed('device', { deviceId: otDevId() });
          if (n.trusted) otSetOk(mob);
          else if (n.need) {
            var r = await otAsk({ purpose: 'device', mobile: mob, title: otT('New phone'), sub: otT('For your safety, confirm it is you the first time you log in on this phone.') });
            if (!r) { try { nfSecureSignOut(); } catch (e) {} nfRestartAfterSignOut(otT('Confirm your mobile number with the WhatsApp code to continue.')); return; }
            otSetOk(mob);
          }
        }
      } catch (e) { console.warn('[otp] device', e); }
      return o.apply(this, arguments);
    };
    nfRouteAuthed._ot = 1;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── HealSol: Settings → WhatsApp codes ──
async function otAdminRender() {
  var el = document.getElementById('hs-otp'); if (!el) return;
  var c = {}; try { c = (await fbGet('shared/sc_otp_config')) || {}; } catch (e) {}
  var sw = function (k, label, sub) { var on = k === 'on' ? !!c.on : c[k] !== false; return '<label class="ot-sw"><input type="checkbox" data-k="' + k + '"' + (on ? ' checked' : '') + '><span><b>' + otE(label) + '</b><small>' + otE(sub) + '</small></span></label>'; };
  el.innerHTML = '<h3>WhatsApp codes (OTP)</h3><p class="ot-sub" style="text-align:left">A 6-digit code on WhatsApp proves a mobile number belongs to the person. Demo logins never get a code. Set up the number and template in Meta first, send yourself a test, then switch on.</p>'
    + sw('on', 'Codes switched on', 'Master switch — off: the app works as before')
    + '<div class="ot-subs">' + sw('reset', 'Forgot password', 'Staff reset their own password') + sw('first', 'First password', 'Before choosing a password after a temporary one') + sw('device', 'New phone', 'The first login on a phone') + sw('signup', 'Sign-up and join forms', 'The mobile in the form') + '</div>'
    + '<div class="ot-grid"><label>Phone number ID<input id="ot-pid" class="ot-in" inputmode="numeric" value="' + otE(c.phoneId || '') + '" placeholder="from Meta → WhatsApp → API setup"></label>'
    + '<label>Template name<input id="ot-tpl" class="ot-in" value="' + otE(c.template || 'nqas_fast_otp') + '"></label><label>Template language<input id="ot-lang" class="ot-in" value="' + otE(c.lang || 'en') + '"></label></div>'
    + '<div class="ot-row" style="justify-content:flex-start"><button type="button" class="ot-btn sm" onclick="otAdminSave()">Save</button><button type="button" class="ot-link" onclick="otAdminTest()">Send a test code…</button><button type="button" class="ot-link" onclick="otAdminWa()">Check number</button><button type="button" class="ot-link" onclick="otAdminWa(1)">Register number…</button><button type="button" class="ot-link" onclick="otAdminDiag()">Check permissions</button></div>'
    + '<div class="ot-sub" id="ot-adm-msg" style="text-align:left"></div>';
}
async function otAdminSave() {
  var el = document.getElementById('hs-otp'); if (!el) return; var v = {};
  el.querySelectorAll('input[type=checkbox][data-k]').forEach(function (x) { v[x.dataset.k] = x.checked; });
  v.phoneId = String((el.querySelector('#ot-pid') || {}).value || '').replace(/\D/g, ''); v.template = String((el.querySelector('#ot-tpl') || {}).value || '').trim() || 'nqas_fast_otp'; v.lang = String((el.querySelector('#ot-lang') || {}).value || '').trim() || 'en';
  if (v.on && !v.phoneId) { var m = document.getElementById('ot-adm-msg'); if (m) m.textContent = 'Enter the phone number ID before switching codes on.'; return; }
  v.at = new Date().toISOString();
  try { await fbSet('shared/sc_otp_config', v); if (typeof showToast === 'function') showToast('WhatsApp code settings saved.', 'ok'); otAdminRender(); } catch (e) { if (typeof showToast === 'function') showToast(e.message, 'err'); }
}
async function otAdminTest() {
  var v = await scDialog({ title: 'Send a test code', icon: '💬', okLabel: 'Send', fields: [{ key: 'm', label: 'Mobile number (with WhatsApp)', type: 'tel', required: true }] }); if (!v) return;
  var msg = document.getElementById('ot-adm-msg'); if (msg) msg.textContent = 'Sending…';
  try { var r = await nfCall('otpTest', { mobile: v.m }); if (msg) msg.textContent = '✓ Sent to ••••' + r.to + ' — check WhatsApp on that phone.'; }
  catch (e) { if (msg) msg.textContent = '✗ ' + e.message; }
}
async function otAdminWa(reg) {
  var msg = document.getElementById('ot-adm-msg'), d = { action: 'status' };
  if (reg) {
    var v = await scDialog({ title: 'Register the WhatsApp number', icon: '🔐', okLabel: 'Register', message: 'One time, after adding the number in WhatsApp Manager. Choose a 6-digit PIN and keep it safe: it becomes the number\'s two-step PIN, and Meta asks for it if the number is ever moved.', fields: [{ key: 'p', label: '6-digit PIN', type: 'password', required: true }] });
    if (!v) return; d = { action: 'register', pin: String(v.p || '').replace(/\D/g, '') };
    if (d.pin.length !== 6) { if (msg) msg.textContent = '✗ The PIN must be 6 digits.'; return; }
  }
  if (msg) msg.textContent = reg ? 'Registering…' : 'Checking…';
  try {
    var r = await nfCall('otpWaAdmin', d), n = r.number || {};
    var t = { CONNECTED: 'Connected — ready to send', PENDING: 'Pending — not registered yet (use Register number…)', OFFLINE: 'Offline', FLAGGED: 'Flagged by Meta', RESTRICTED: 'Restricted by Meta', BANNED: 'Banned by Meta' };
    if (msg) msg.textContent = (r.registered ? '✓ Registered. ' : '') + (n.display_phone_number || '') + ' · ' + (t[n.status] || n.status || 'status unknown')
      + (n.code_verification_status ? ' · verification: ' + n.code_verification_status : '') + (n.name_status ? ' · name: ' + n.name_status : '') + (n.quality_rating ? ' · quality: ' + n.quality_rating : '');
  } catch (e) { if (msg) msg.textContent = '✗ ' + e.message; }
}
async function otAdminDiag(connect) {
  var msg = document.getElementById('ot-adm-msg'); if (!msg) return;
  msg.textContent = connect ? 'Connecting…' : 'Checking…';
  try {
    var r = await nfCall('otpWaAdmin', { action: connect ? 'connect' : 'diag' }), ws = r.wabas || [], h = ws.find(function (w) { return w.hasPhone; });
    var lines = (r.connected ? '✓ App connected to the WhatsApp account.<br>' : '') + 'Token: ' + otE(r.type || '?') + ' · app ' + otE(r.appId || '?') + ' · ' + otE((r.scopes || []).join(', ') || 'no WhatsApp permissions') + '<br>';
    lines += ws.length ? ws.map(function (w) { return '• ' + otE(w.name || w.id) + ' (' + otE(w.id) + ')' + (w.hasPhone ? ' ← this number' : '') + ' · numbers: ' + otE((w.numbers || []).join(', ') || '—') + ' · send: ' + (w.send ? 'yes' : '<b>no</b>') + ' · manage: ' + (w.manage ? 'yes' : 'no') + ' · apps: ' + otE((w.apps || []).join(', ') || 'none') + (w.err ? ' · ' + otE(w.err) : ''); }).join('<br>') : 'The token cannot see any WhatsApp account.';
    if (!h) lines += '<br><b>The token cannot see the account that holds this number.</b>';
    else if (!h.send) lines += '<br><b>The token may not send for this account.</b>';
    if (h && !r.connected) lines += '<br><button type="button" class="ot-link" onclick="otAdminDiag(1)">Connect our app to this account</button>';
    msg.innerHTML = lines;
  } catch (e) { msg.textContent = '✗ ' + e.message; }
}
(function () {
  var hook = function () {
    if (typeof hspSignupRender === 'function' && !hspSignupRender._ot) { var o = hspSignupRender; hspSignupRender = async function () { var r = await o.apply(this, arguments);
      try { var su = document.getElementById('hs-signup'), el = document.getElementById('hs-otp');
        if (su && !el) { el = document.createElement('div'); el.id = 'hs-otp'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); otAdminRender(); } } catch (e) { console.warn('[otp]', e); }
      return r; }; hspSignupRender._ot = 1; }
    if (typeof hsSetupGroup === 'function' && !hsSetupGroup._ot) { var g = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-otp') return 'rules'; return g.apply(this, arguments); }; hsSetupGroup._ot = 1; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();
