// ══════════════════════════════════════════════════════════════
// GOOGLE PLAY APP (4 Nov 2026)
//   The Play Store app (package com.thehealsol.nqasfast) is this website inside a Trusted Web Activity, opened at
//   /?src=play (nfIsPlay() in promos.js). In it:
//   · no prices and no way to pay: the "Day 8 onwards" unlock cards (Sub-Centre and UPHC / PHC / CHC), bank transfer
//     and Razorpay are replaced by a plain note — access is arranged with HealSol / the district outside the app
//     (Google Play payments policy). "Website only" promotions are already hidden (promos.js).
//   · everyone (website too) can ask to delete their account from Me → "Delete my account"; the request reaches
//     HealSol as an enquiry (source 'delete', ref DEL-…) and the person is told what is deleted and what is kept.
//     The same request can be made without the app at delete-account.html (Google Play needs both).
// ══════════════════════════════════════════════════════════════
var NF_PLAY_PKG = 'com.thehealsol.qifast';   // 18 Nov 2026: the live Play app (Qi FAST)
function plHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function plT(en, hi) { return plHi() && hi ? hi : en; }
function plE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function plOn() { return typeof nfIsPlay === 'function' && nfIsPlay(); }

// ── the note shown instead of a price / pay button ──
function plAccessHTML() {
  return '<div class="upgrade-card pl-note"><div class="upgrade-hd"><div style="font-size:30px;margin-bottom:6px;">🔒</div>'
    + '<div style="font-size:16px;font-weight:800;">' + plE(plT('The next days are part of the full programme', 'आगे के दिन पूरे कार्यक्रम का हिस्सा हैं')) + '</div></div>'
    + '<div class="upgrade-body"><p class="pl-p">' + plE(plT('Your facility\'s access to the full programme is arranged by HealSol Academy with your facility in-charge or district. Once it is active, the next days open here automatically.',
      'पूरे कार्यक्रम की सुविधा HealSol Academy आपके केंद्र प्रभारी या ज़िले के साथ तय करती है। सक्रिय होते ही अगले दिन यहाँ अपने-आप खुल जाएँगे।')) + '</p>'
    + '<p class="pl-p pl-sm">' + plE(plT('Your baseline work is saved.', 'आपका बेसलाइन काम सहेजा हुआ है।')) + '</p></div></div>';
}
function plNoPay() { if (typeof showToast === 'function') showToast(plT('Payments are not available in this app. Your access is arranged with HealSol Academy.', 'इस ऐप में भुगतान उपलब्ध नहीं है। आपकी सुविधा HealSol Academy के साथ तय होती है।'), 'info'); }

(function () {
  var hook = function () {
    if (!plOn()) return;
    try { document.documentElement.classList.add('nf-play'); } catch (e) {}
    // Sub-Centre: the upgrade card on Day 8+
    if (typeof renderUpgradeCard === 'function' && !renderUpgradeCard._pl) { renderUpgradeCard = function (container) { if (container) container.innerHTML = plAccessHTML(); }; renderUpgradeCard._pl = 1; }
    // UPHC / PHC / CHC: the unlock card
    if (typeof nduCardShell === 'function' && !nduCardShell._pl) { nduCardShell = function () { return '<div id="ndu-card">' + plAccessHTML() + '</div>'; }; nduCardShell._pl = 1; }
    if (typeof nduFill === 'function' && !nduFill._pl) { nduFill = async function () {}; nduFill._pl = 1; }
    if (typeof nduPay === 'function' && !nduPay._pl) { nduPay = async function () { plNoPay(); }; nduPay._pl = 1; }
    // bank transfer and Razorpay, wherever they are opened from
    if (typeof bpOpen === 'function' && !bpOpen._pl) { bpOpen = async function () { plNoPay(); }; bpOpen._pl = 1; }
    if (typeof phcStartCheckout === 'function' && !phcStartCheckout._pl) { phcStartCheckout = async function () { plNoPay(); }; phcStartCheckout._pl = 1; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── Delete my account (Me page, all staff; website and Play app) ──
function plWho() {
  var mob = (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || '', name = '', fac = '';
  try { if (typeof choState !== 'undefined' && choState) { name = choState.staffName || ''; fac = (choState.facility && choState.facility.name) || choState.facilityCode || ''; } } catch (e) {}
  try { var dv = document.getElementById('nf-dept-app'); if (dv && dv.offsetParent !== null && typeof _nd !== 'undefined' && _nd && _nd.fac) { fac = _nd.fac.name || _nd.code || fac; var r = ((_nd.fac.staff || {})[mob]) || {}; name = r.name || name; } } catch (e) {}
  return { mob: mob, name: name, fac: fac };
}
function plDelHTML() {
  return '<div class="pl-del" id="pl-del"><button type="button" class="pl-del-b" onclick="plDelete()"><i class="ti ti-user-x"></i> ' + plE(plT('Delete my account', 'मेरा खाता हटाएँ')) + '</button>'
    + '<a class="pl-del-l" href="legal.html#privacy" target="_blank" rel="noopener">' + plE(plT('Privacy policy', 'गोपनीयता नीति')) + '</a></div>';
}
async function plDelete() {
  var W = plWho(); if (!W.mob) { if (typeof showToast === 'function') showToast(plT('Please sign in again first.', 'पहले फिर से लॉग इन करें।'), 'err'); return; }
  var v = await scDialog({ title: plT('Delete my account', 'मेरा खाता हटाएँ'), icon: '🗑', okLabel: plT('Send request', 'अनुरोध भेजें'), wide: true,
    message: plT('HealSol Academy will close your login and delete your personal details (name, mobile number, email) within 30 days, and confirm to you on this mobile number. '
      + 'The facility\'s programme records (checklists, scores, actions) stay with the facility, without your name, because they belong to the facility\'s NQAS work. Payment records are kept as the law requires.',
      'HealSol Academy 30 दिनों में आपका लॉग इन बंद करके आपकी निजी जानकारी (नाम, मोबाइल नंबर, ईमेल) हटा देगी और इसी मोबाइल नंबर पर पुष्टि करेगी। '
      + 'केंद्र के कार्यक्रम रिकॉर्ड (चेकलिस्ट, स्कोर, कार्य) आपके नाम के बिना केंद्र के पास रहेंगे, क्योंकि वे केंद्र के NQAS काम का हिस्सा हैं। भुगतान रिकॉर्ड क़ानून के अनुसार रखे जाते हैं।'),
    fields: [{ key: 'reason', label: plT('Reason (optional)', 'कारण (वैकल्पिक)'), type: 'textarea', value: '', maxLength: 300 },
      { key: 'ok', type: 'checklist', value: [], options: [{ value: 'y', label: plT('I understand and want my account deleted', 'मैं समझता/समझती हूँ और अपना खाता हटवाना चाहता/चाहती हूँ') }] }],
    validate: function (x) { return (x.ok || []).length ? null : plT('Tick the box to confirm.', 'पुष्टि के लिए बॉक्स पर टिक करें।'); } });
  if (!v || !(v.ok || []).length) return;
  try {
    var r = await nfCall('submitEnquiry', { source: 'delete', orgName: W.fac || 'NQAS | FAST user', contactName: W.name || W.mob, mobile: W.mob, message: String(v.reason || '').slice(0, 300) });
    await scDialog({ title: plT('Request sent', 'अनुरोध भेजा गया'), icon: '✅', okLabel: 'OK', message: plT('Reference ' + (r && r.ref || '') + '. HealSol Academy will confirm on ' + W.mob + ' within 30 days.', 'संदर्भ ' + (r && r.ref || '') + '। HealSol Academy 30 दिनों में ' + W.mob + ' पर पुष्टि करेगी।') });
  } catch (e) { if (typeof showToast === 'function') showToast((e && e.message) || plT('Could not send. Check the internet and try again.', 'भेजा नहीं जा सका। इंटरनेट जाँचकर फिर कोशिश करें।'), 'err'); }
}
(function () {
  var hook = function () {
    if (typeof nfRenderMe === 'function' && !nfRenderMe._pl) { var m = nfRenderMe; nfRenderMe = function () { var x = m.apply(this, arguments);
      try { var p = document.getElementById('nf-me'); if (p && !p.querySelector('.pl-del')) p.insertAdjacentHTML('beforeend', plDelHTML()); } catch (e) {} return x; }; nfRenderMe._pl = 1; }
    if (typeof ndRender === 'function' && !ndRender._pl) { var d = ndRender; ndRender = function () { var x = d.apply(this, arguments);
      try { if (_nd && _nd.tab === 'me' && !_nd.view && !_nd.card && !_nd.screen) { var top = document.querySelector('.nx'); if (top && !top.querySelector('.pl-del')) top.insertAdjacentHTML('beforeend', plDelHTML()); } } catch (e) {} return x; }; ndRender._pl = 1; }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ══════════════════════════════════════════════════════════════
// INSIDE THE PLAY APP, KEEP EVERYTHING IN THE APP (5 Nov 2026)
//   In the Play app any page outside app.thehealsol.com opens as a browser tab, and pop-up windows don't work.
//   · Reports, certificates and print previews (window.open('') + document.write) → a full-screen viewer in the
//     app with "Print / Save as PDF" and "Close" (phone Back closes it too).
//   · Impact card: "WhatsApp / Instagram" shares the picture straight from the app (Android share sheet) and
//     "Save picture" saves it — no server page. LinkedIn still opens LinkedIn (it needs the public link).
//   The website and the One HealSol web view keep their own ways (unchanged).
// ══════════════════════════════════════════════════════════════
function plViewer(html) {
  var old = document.getElementById('pl-view'); if (old) old.remove();
  var ov = document.createElement('div'); ov.id = 'pl-view'; ov.className = 'pl-view';
  ov.innerHTML = '<div class="pl-vbar"><button type="button" class="pl-vx" aria-label="Close">✕ ' + plE(plT('Close', 'बंद करें')) + '</button>'
    + '<button type="button" class="pl-vp"><i class="ti ti-printer"></i> ' + plE(plT('Print / Save as PDF', 'प्रिंट / PDF सहेजें')) + '</button></div><iframe class="pl-vf" title="Report"></iframe>';
  document.body.appendChild(ov);
  var f = ov.querySelector('iframe'), shut = function () { if (ov.parentNode) ov.remove(); window._nfAllowPrint = false; };
  window._nfAllowPrint = true;   // printing a report the user opened is allowed (the content protection blanks other prints)
  ov.querySelector('.pl-vx').onclick = shut;
  ov.querySelector('.pl-vp').onclick = function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } };
  f.addEventListener('load', function () { try { f.contentWindow.close = shut; } catch (e) { } });   // the report's own "Close" button
  // reports are laid out as an A4 page (width=840): show the whole page scaled to the phone, like the website does
  var m = /name=["']?viewport["']?\s+content=["']?width=(\d+)/i.exec(html) || /content=["']?width=(\d+)["']?\s+name=["']?viewport/i.exec(html), pw = m ? +m[1] : 0;
  var fit = function () { try { var W = ov.clientWidth, H = ov.clientHeight - ov.querySelector('.pl-vbar').offsetHeight; if (pw && W < pw) { var k = W / pw; f.style.width = pw + 'px'; f.style.height = Math.round(H / k) + 'px'; f.style.transform = 'scale(' + k + ')'; f.style.transformOrigin = '0 0'; f.style.flex = 'none'; } else { f.style.width = '100%'; f.style.height = H + 'px'; f.style.transform = ''; } } catch (e) { } };
  fit(); window.addEventListener('resize', fit);
  f.srcdoc = html;
  try { if (typeof window.nfBackPush === 'function') window.nfBackPush(); } catch (e) { }
  return f;
}
// a stand-in for the pop-up window: collects what is written, shows it in the viewer on close()
function plFakeWin() {
  var buf = '', f = null, shown = false;
  var show = function () { if (!shown) { shown = true; f = plViewer(buf); } };
  var w = { closed: false, document: { write: function (s) { buf += String(s == null ? '' : s); }, writeln: function (s) { buf += String(s == null ? '' : s) + '\n'; }, open: function () { buf = ''; }, close: show },
    print: function () { show(); setTimeout(function () { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } }, 400); },
    focus: function () { }, close: function () { var v = document.getElementById('pl-view'); if (v) v.remove(); w.closed = true; } };
  return w;
}
(function () {
  var hook = function () {
    if (!plOn() || window.open._pl) return;
    var o = window.open;
    window.open = function (url) { var u = String(url == null ? '' : url); if (!u || u === 'about:blank') return plFakeWin(); return o.apply(window, arguments); };
    window.open._pl = 1;
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── impact card: share / save the picture from the app ──
var _plCard = {};   // key|sig → File
function plCardSig(rec) { return [rec.key, rec.level, rec.stars, rec.updatedAt, rec.name, typeof nfImpNameChoice === 'function' ? nfImpNameChoice() : '', typeof nfImpHi === 'function' && nfImpHi() ? 'hi' : 'en', rec.citation || '', rec.showNums ? 1 : 0].join('|'); }
async function plCardFile(rec) {
  var k = plCardSig(rec); if (_plCard[k]) return _plCard[k];
  var b = await nfImpBlob(rec); if (!b) return null;
  var f = null; try { f = new File([b], 'nqas-fast-card.jpg', { type: 'image/jpeg' }); } catch (e) { f = b; f.name = 'nqas-fast-card.jpg'; }
  return (_plCard[k] = f);
}
function plCanShareFiles(f) { try { return !!(navigator.share && navigator.canShare && navigator.canShare({ files: [f] })); } catch (e) { return false; } }
async function plCardAct(kind, rec, f) {
  if (kind === 'save') { if (typeof nfImpDownload === 'function') nfImpDownload(f); if (typeof showToast === 'function') showToast(plT('Picture saved — check your Downloads / Gallery.', 'तस्वीर सहेजी गई — Downloads / गैलरी देखें।'), 'ok'); return; }
  var cap = typeof nfImpCaption === 'function' ? nfImpCaption(rec, kind === 'ig') : '';
  try { if (typeof nfImpCopy === 'function') nfImpCopy(cap); } catch (e) { }
  try { await navigator.share({ files: [f], text: cap }); }
  catch (e) { if (!(e && e.name === 'AbortError') && typeof showToast === 'function') showToast(plT('Could not open sharing. Use "Save picture" and share it from your Gallery.', 'साझा नहीं हो सका। "तस्वीर सहेजें" दबाकर गैलरी से साझा करें।'), 'err'); }
}
(function () {
  var hook = function () {
    if (!plOn()) return;
    if (typeof nfImpGo === 'function' && !nfImpGo._pl) {
      var o = nfImpGo;
      nfImpGo = async function (kind, btn) {
        var rec = (typeof _nfImp !== 'undefined' && _nfImp) ? _nfImp.rec : null;
        if (!rec || kind === 'li') return o.apply(this, arguments);
        var k = plCardSig(rec), f = _plCard[k];
        if (f) { if (kind !== 'save' && !plCanShareFiles(f)) return o.apply(this, arguments); return plCardAct(kind, rec, f); }   // ready: share at once (still within the tap)
        var old = typeof nfImpBusy === 'function' ? nfImpBusy(btn, true) : null;
        try { f = await plCardFile(rec); } catch (e) { f = null; }
        if (typeof nfImpBusy === 'function') nfImpBusy(btn, false, old);
        if (!f) { if (typeof showToast === 'function') showToast(plT('Could not prepare the card. Try again.', 'कार्ड तैयार नहीं हो सका। फिर कोशिश करें।'), 'err'); return; }
        if (kind !== 'save' && !plCanShareFiles(f)) return o.apply(this, arguments);
        // making the picture took a moment, so ask for one more tap (sharing must start from a tap)
        var ov = document.createElement('div'); ov.className = 'nfi-ov';
        ov.innerHTML = '<div><div style="font-size:40px">✅</div><h2>' + plE(plT('Your card is ready', 'आपका कार्ड तैयार है')) + '</h2><div class="nfi-btns"><button type="button" class="wa" id="pl-card-go">'
          + plE(kind === 'save' ? plT('Save picture', 'तस्वीर सहेजें') : plT('Share picture', 'तस्वीर साझा करें')) + '</button><button type="button" class="sv" onclick="this.closest(\'.nfi-ov\').remove()">' + plE(plT('Close', 'बंद करें')) + '</button></div></div>';
        document.body.appendChild(ov);
        ov.querySelector('#pl-card-go').onclick = function () { ov.remove(); plCardAct(kind, rec, f); };
      };
      nfImpGo._pl = 1;
    }
    // make the picture in the background while "My impact" is on screen, so the first tap shares at once
    if (typeof nfImpPrepare === 'function' && !nfImpPrepare._pl) {
      var p = nfImpPrepare;
      nfImpPrepare = function (rec) { try { if (rec && rec.level) setTimeout(function () { plCardFile(rec).catch(function () { }); }, 800); } catch (e) { } return p.apply(this, arguments); };
      nfImpPrepare._pl = 1;
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else setTimeout(hook, 0);
})();

// ── 17 Nov 2026: the last prices in the Play app (Google Play Payments policy) ──
//   · login screen: the launch line only, without the "Early-bird pricing" line
//   · Terms / Privacy / Refunds open with ?src=play, so legal.html leaves out the price list
(function () {
  if (!plOn()) return;
  if (typeof nlPaint === 'function' && !nlPaint._pl) { var o = nlPaint; nlPaint = async function () { var r = await o.apply(this, arguments); try { var b = document.querySelector('#nl-banner b'); if (b) b.remove(); } catch (e) {} return r; }; nlPaint._pl = 1; }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="legal.html"]') : null; if (!a || /[?&]src=play/.test(a.getAttribute('href'))) return;
    var h = a.getAttribute('href'), i = h.indexOf('#'); a.setAttribute('href', (i < 0 ? h : h.slice(0, i)) + '?src=play' + (i < 0 ? '' : h.slice(i)));
  }, true);
})();
