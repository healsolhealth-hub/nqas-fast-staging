// ══════════════════════════════════════════════════════════════
// UPHC / PHC / CHC: the Unlock card after the no-cost baseline (3 Nov 2026; approved mock-up "unlock-mockup-uphc-phc-chc")
//   Trial facilities lock after their baseline days (7 UPHC / PHC, 14 CHC) unless paid, on contract, or HealSol keeps them
//   open while the office pays (officePay). In-charge: Pay & Unlock (Razorpay) · bank transfer / UPI · proforma invoice.
//   Staff: "Ask your <in-charge> to unlock". Today: a banner after the baseline, a reminder during it (in-charge).
//   The price comes from the server (priceFor): the package, or for a CHC the base plus each optional department it runs.
// ══════════════════════════════════════════════════════════════
var _ndu = { price: undefined, code: '' };
function nduHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function nduT(en, hi) { return nduHi() && hi ? hi : en; }
function nduE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function nduToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function nduBase() { try { return ndShape().bN; } catch (e) { return 7; } }
function nduOpen() {   // true when the programme is open beyond the baseline
  if (!_nd || !_nd.fac) return true; var f = _nd.fac, st = f.subscriptionStatus;
  if (!st || st === 'contract' || st === 'paid') return true;
  return !!(f.officePay && f.officePay.until && f.officePay.until >= nduToday());
}
function nduLocked(day) { return !!_nd && !_nd.view && !nduOpen() && day > nduBase(); }
function nduInCharge() { try { return ndIsInCharge(ndMob()); } catch (e) { return false; } }
function nduInChargeName() { var S = (typeof ndStaff === 'function' ? ndStaff() : {}) || {}, k = Object.keys(S).find(function (m) { try { return ndIsInCharge(m) && !(S[m] || {}).disabled; } catch (e) { return false; } }); return k ? (S[k].name || '') : ''; }
async function nduPrice(force) {
  if (_ndu.price !== undefined && _ndu.code === _nd.code && !force) return _ndu.price;
  try { var r = await nfCall('priceFor', { code: _nd.code }); _ndu.price = r.price; } catch (e) { _ndu.price = null; }
  _ndu.code = _nd.code; return _ndu.price;
}
function nduCtx(p) { window._payCtx = { code: _nd.code, fac: Object.assign({ type: _nd.fac.type }, _nd.fac), price: p, after: function () { nduAfter(); } }; }
async function nduAfter() { try { await ndReload(); } catch (e) {} _ndu.price = undefined; try { ndRender(); } catch (e) {} }
function nduHead() {
  var b = nduBase(), n = (_nd.cfg && _nd.cfg.days) || 90;
  return '<div class="ndu-hd"><div class="ndu-lk">🔒</div><b>' + nduE(nduT('Your no-cost baseline assessment is complete', 'आपका निःशुल्क बेसलाइन आकलन पूरा हो गया है')) + '</b><small>'
    + nduE(nduT(b + ' baseline days done for ' + (_nd.fac.name || _nd.code) + '. Implementation starts from Day ' + (b + 1) + ' when payment or a District / partner commitment is confirmed. Your clock is paused, so no days are lost. District or partner paying? Ask them to tell HealSol Academy.',
      (_nd.fac.name || _nd.code) + ' के ' + b + ' बेसलाइन दिन पूरे हुए। भुगतान या ज़िले / सहयोगी की पुष्टि होने पर कार्यान्वयन दिन ' + (b + 1) + ' से शुरू होगा। आपकी घड़ी रुकी है, कोई दिन नहीं छूटेगा। ज़िला या सहयोगी भुगतान कर रहा है? उनसे HealSol Academy को बताने को कहें।')) + '</small></div>';
}
function nduCardShell() { return '<div class="upgrade-card ndu-card" id="ndu-card">' + nduHead() + '<div class="upgrade-body ndu-body" id="ndu-body"><div class="ndu-wait">' + nduE(nduT('Loading your package…', 'आपका पैकेज लोड हो रहा है…')) + '</div></div></div>'; }
async function nduFill() {
  var body = document.getElementById('ndu-body'); if (!body) return;
  if (!nduInCharge()) {
    var nm = nduInChargeName(), lab = (_nd.cfg && (_nd.cfg.inChargeLabel || _nd.cfg.inCharge)) || 'in-charge';
    body.innerHTML = '<div class="ndu-staff">👤 <b>' + nduE(nduT('Ask ' + (nm ? nm + ' (' + lab + ')' : 'your ' + lab), (nm ? nm + ' (' + lab + ')' : 'अपने ' + lab) + ' से कहें')) + '</b> ' + nduE(nduT('to confirm the programme. Your cards start again from Day ' + (nduBase() + 1) + ' — your baseline work is saved, and no days are lost while you wait.', 'कि वे कार्यक्रम अनलॉक करें। अनलॉक होते ही आपके कार्ड यहाँ फिर खुल जाएँगे — आपका किया कुछ भी नहीं खोएगा।')) + '</div>';
    return;
  }
  var p = await nduPrice(); if (!document.getElementById('ndu-body')) return; body = document.getElementById('ndu-body');
  if (!p) { body.innerHTML = '<div class="ndu-wait">' + nduE(nduT('Pricing has not been set for your package yet — please contact HealSol Academy to subscribe.', 'आपके पैकेज का मूल्य अभी तय नहीं है — सदस्यता के लिए HealSol Academy से संपर्क करें।')) + '</div>'; return; }
  nduCtx(p);
  var M = function (n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; };
  body.innerHTML = (typeof ofBadge === 'function' ? ofBadge(p) : '') + '<div class="ndu-k">' + nduE(nduT('YOUR PACKAGE', 'आपका पैकेज')) + ' · ' + nduE(p.label) + '</div>'
    + (p.lines || []).map(function (l) { return '<div class="ndu-row"><span>' + nduE(l.label) + '</span><b>' + (l.regular > l.price ? '<s class="ndu-was">' + M(l.regular) + '</s>' : '') + M(l.price) + '</b></div>'; }).join('')
    + '<div class="ndu-tot"><span>' + nduE(nduT('TOTAL', 'कुल')) + '</span><span><small>' + M(p.base) + ' + GST 18% ' + M(p.gst) + '</small><b>' + M(p.total) + '</b></span></div>'
    + '<button type="button" class="fc-add-btn ndu-pay" id="upgrade-pay-btn" onclick="nduPay(this)"><i class="ti ti-credit-card"></i> ' + nduE(nduT('Pay ' + M(p.total) + ' & Unlock', M(p.total) + ' भुगतान करें और अनलॉक करें')) + '</button>';
  var card = document.getElementById('ndu-card');
  try { if (typeof bpUpgradeExtra === 'function') await bpUpgradeExtra(card); } catch (e) {}
  try { if (typeof ivUpgradeExtra === 'function') await ivUpgradeExtra(card); } catch (e) {}
}
async function nduPay(btn) {
  if (!nduInCharge()) return;
  if (typeof Razorpay === 'undefined') { try { await nfLoadScriptAny(['https://checkout.razorpay.com/v1/checkout.js'], function () { return typeof Razorpay !== 'undefined'; }); } catch (e) {} }
  if (typeof Razorpay === 'undefined') { showToast('The payment window could not load — check your internet connection.', 'err'); return; }
  var label = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.textContent = 'Preparing payment…'; }
  var o; try { o = await nfCall('createPaymentOrder', { code: _nd.code }); } catch (e) { showToast(nfErrText(e), 'err'); if (btn) { btn.disabled = false; btn.innerHTML = label; } return; }
  if (btn) { btn.disabled = false; btn.innerHTML = label; }
  var rzp = new Razorpay({ key: o.keyId, order_id: o.orderId, amount: o.amount, currency: o.currency || 'INR', name: 'HealSol Academy', description: 'NQAS | FAST — ' + (o.packageLabel || 'subscription') + ' (incl. 18% GST)',
    prefill: { name: (o.prefill || {}).name || '', contact: (o.prefill || {}).contact || '' }, notes: { facility: _nd.code }, theme: { color: '#1E6B5E' },
    handler: async function (resp) {
      showToast('Payment received — confirming…', '');
      try { var v = await nfCall('verifyPayment', { orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        _nd.fac.subscriptionStatus = 'paid'; showToast('Payment successful — your programme is unlocked.', 'ok'); await nduAfter(); if (typeof nfShowReceipt === 'function') nfShowReceipt(v.receipt); }
      catch (e) { scAlert('Your payment (' + resp.razorpay_payment_id + ') was received. It will be confirmed automatically within a few minutes — reopen the app shortly. If it is still locked after an hour, send this payment ID to HealSol Academy.', 'Payment received', '💳'); }
    }, modal: { ondismiss: function () {} } });
  if (rzp.on) rzp.on('payment.failed', function (r) { showToast('Payment failed' + (r && r.error && r.error.description ? ': ' + r.error.description : '') + '. No money was taken — you can try again.', 'err'); });
  rzp.open();
}
function nduGoUnlock() { _nd.cday = nduBase() + 1; ndTab('cards'); setTimeout(function () { var c = document.getElementById('ndu-card'); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 300); }
// after every render: swap the locked day's card for the Unlock card; banners on Today
function nduApply() {
  if (!_nd || _nd.view || !_nd.fac) { window._payCtx = null; return; }
  var app = document.getElementById('nf-dept-app'); if (!app) return;
  var day = ndDay(), b = nduBase(), nm = _nd.fac.name || _nd.code;
  if (_nd.tab === 'cards' && !_nd.card && !_nd.screen && !ndFaOn() && (_nd.cv || 'day') === 'day' && nduLocked(_nd.cday || day)) {
    var dc = app.querySelector('.nx-dc') || app.querySelector('.nx-card'), pills = app.querySelector('.nx-pills'), ban = app.querySelector('.nx-ban.b');
    if (pills) pills.remove();
    if (ban) ban.innerHTML = '<b style="font-size:13.5px">' + nduE((_nd.cday || day) > 100 ? 'Catch-up' : 'Day ' + (_nd.cday || day)) + '</b><span style="font-size:11.5px;color:#1E3A8A">' + nduE(nduT('Locked — the programme continues after it is unlocked', 'लॉक — अनलॉक होने के बाद कार्यक्रम आगे चलेगा')) + '</span>';
    var w = document.createElement('div'); w.innerHTML = nduCardShell();
    if (dc) dc.replaceWith(w.firstChild); else (app.querySelector('.nx') || app).appendChild(w.firstChild);
    nduFill();
  }
  if (_nd.tab === 'today' && !_nd.card && !_nd.screen && !ndFaOn()) {
    var top = app.querySelector('.nx'), old = document.getElementById('ndu-ban'); if (old) old.remove();
    var html = '';
    var play = typeof nfIsPlay === 'function' && nfIsPlay();   // Google Play app: no unlock call-to-action (Payments policy)
    if (nduLocked(day) && play) html = '<div class="ndu-ban" id="ndu-ban"><span class="ndu-bi">🔒</span><span><b>' + nduE(nduT('Baseline complete', 'बेसलाइन पूरी')) + '</b><small>' + nduE(nduT('The next days open when your facility\'s full programme is active.', 'केंद्र का पूरा कार्यक्रम सक्रिय होने पर आगे के दिन खुलेंगे।')) + '</small></span></div>';
    else if (nduLocked(day)) html = '<div class="ndu-ban" id="ndu-ban"><span class="ndu-bi">🔒</span><span><b>' + nduE(nduT('Baseline complete — implementation paused', 'बेसलाइन पूरी — कार्यान्वयन रुका है')) + '</b><small>' + nduE(nduT('Day ' + (b + 1) + ' starts when payment or a District / partner commitment is confirmed. No days are lost.', 'भुगतान या ज़िले / सहयोगी की पुष्टि होने पर दिन ' + (b + 1) + ' शुरू होगा। कोई दिन नहीं छूटेगा।')) + '</small></span><button type="button" onclick="nduGoUnlock()">' + nduE(nduT('Start', 'शुरू करें')) + '</button></div>';
    else if (!nduOpen() && day >= 1 && day <= b && nduInCharge() && play) html = '<div class="ndu-soft" id="ndu-ban"><span>🎁 <b>' + nduE(nduT('No-cost baseline · Day ' + day + ' of ' + b, 'निःशुल्क बेसलाइन · दिन ' + day + ' / ' + b)) + '</b></span></div>';
    else if (!nduOpen() && day >= 1 && day <= b && nduInCharge()) html = '<div class="ndu-soft" id="ndu-ban"><span>🎁 <b>' + nduE(nduT('No-cost baseline · Day ' + day + ' of ' + b, 'निःशुल्क बेसलाइन · दिन ' + day + ' / ' + b)) + '</b><small>' + nduE(nduT('Unlock the full programme any time — before Day ' + (b + 1) + ' keeps it running without a break.', 'पूरा कार्यक्रम कभी भी अनलॉक करें — दिन ' + (b + 1) + ' से पहले करने पर बिना रुकावट चलता रहेगा।')) + '</small></span><button type="button" onclick="nduGoUnlock()">' + nduE(nduT('Unlock', 'अनलॉक')) + '</button></div>';
    if (html && top) top.insertAdjacentHTML('afterbegin', html);
  }
  if (!(_nd.tab === 'cards' && nduLocked(_nd.cday || day))) window._payCtx = window._payCtx && document.getElementById('ndu-card') ? window._payCtx : null;
}
(function () {
  if (typeof ndRender !== 'function') return; var o = ndRender;
  ndRender = function () {
    if (_nd && _nd.card && nduLocked(_nd.card.day)) { _nd.card = null; _nd.tab = 'cards'; _nd.cday = _nd.cday || ndDay(); }   // a locked day's compare screen → the Unlock card
    var r = o.apply(this, arguments); try { nduApply(); } catch (e) { console.warn('[unlock]', e); } return r;
  };
})();
// the bank / UPI and proforma buttons ask "is this the in-charge?": in the UPHC / PHC / CHC app that is ndIsInCharge
(function () { if (typeof nfIsChoNow !== 'function') return; var o = nfIsChoNow; nfIsChoNow = function () { if (window._payCtx && typeof _nd !== 'undefined' && _nd) return nduInCharge(); return o.apply(this, arguments); }; })();
