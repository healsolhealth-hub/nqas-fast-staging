// ══════════════════════════════════════════════════════════════
// FREE BASELINE AS A HEALSOL SETTING + TWO-PART PRICE (21 Nov 2026; canvas "Implementation start after payment", screens 8–11)
//   HealSol, Settings → Pricing: "Free baseline" (defaults per type, State / District exceptions with dates, Check a place)
//     → shared/sc_freebl_config. The baseline fee is the second column of the package prices (days.js).
//   Decided once, the day a facility is approved (server: functions/freebl.js) → sc_facilities/{code}/freeBl {free, why, on}.
//   In-charge of a facility WITHOUT a free baseline, before Day 1: "Pay baseline and choose Day 1" instead of the date
//     (startdate.js card); "Pay the full programme now instead"; a District / partner commitment works too.
//   Join form: "Free baseline" / "Baseline fee" for the type, state and district chosen, and how the facility starts.
//   HealSol Facilities: "Baseline fee due"; ⋯ menu → change one facility's free baseline (before its Day 1, with a reason).
// ══════════════════════════════════════════════════════════════
var _fb = { cfg: null, prices: null, at: 0, price: {}, edit: null };
var FB_TYPES = ['sc', 'uphc', 'phc', 'chc'];
var FB_NAMES = { sc: 'Sub-Centre', uphc: 'UPHC', phc: 'PHC', chc: 'CHC' };
var FB_DEF = { types: { sc: { mode: 'free' }, uphc: { mode: 'until', until: '2026-12-31' }, phc: { mode: 'until', until: '2026-12-31' }, chc: { mode: 'until', until: '2026-12-31' } }, rules: {} };
function fbE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fbHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function fbT(en, hi) { return fbHi() && hi ? hi : en; }
function fbToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function fbFmt(ymd) { try { return new Date(ymd + 'T12:00:00Z').toLocaleDateString(fbHi() ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }); } catch (e) { return ymd; } }
function fbM(n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; }
function fbBase(t) { try { var L = (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[t]) || {}; return (L.plan && L.plan.base) || 7; } catch (e) { return 7; } }
function fbType(f) { try { return typeof nfTypeOf === 'function' ? nfTypeOf(f) : ((f && f.type) || 'sc'); } catch (e) { return 'sc'; } }

// ── the rules, the same as the server's (freebl.js decide) — used by the join form and Settings ──
function fbCfgOf(raw) {
  var c = raw && typeof raw === 'object' ? raw : {}, out = { types: {}, rules: {} };
  FB_TYPES.forEach(function (t) { var x = (c.types || {})[t] || FB_DEF.types[t]; out.types[t] = { mode: ['free', 'until', 'paid'].indexOf(x.mode) >= 0 ? x.mode : 'free', until: /^\d{4}-\d{2}-\d{2}$/.test(x.until || '') ? x.until : '' }; if (out.types[t].mode === 'until' && !out.types[t].until) out.types[t].mode = 'free'; });
  Object.keys(c.rules || {}).forEach(function (id) { var r = c.rules[id]; if (r && r.state) out.rules[id] = { state: String(r.state), district: String(r.district || ''), types: r.types || {}, free: r.free !== false, from: r.from || '', until: r.until || '', note: r.note || '' }; });
  return out;
}
function fbLow(s) { return String(s || '').trim().toLowerCase(); }
function fbDecide(cfg, t, state, district, date) {
  cfg = fbCfgOf(cfg); var m = Object.keys(cfg.rules).map(function (k) { return cfg.rules[k]; }).filter(function (r) { return r.types[t] && fbLow(r.state) === fbLow(state) && (!r.district || fbLow(r.district) === fbLow(district)) && (!r.from || date >= r.from) && (!r.until || date <= r.until); });
  var r = m.filter(function (x) { return x.district; })[0] || m.filter(function (x) { return !x.district; })[0];
  if (r) return { free: r.free, until: r.free ? r.until : '' };
  var d = cfg.types[t]; return d.mode === 'free' ? { free: true } : d.mode === 'until' ? (date <= d.until ? { free: true, until: d.until } : { free: false }) : { free: false };
}
function fbHasBlFee(t, progId) {   // the server's rule: "not free" needs a baseline fee for the package (CHC: its FRU / Non-FRU base)
  var items = (_fb.prices || {}).items || [], ids = t === 'chc' ? ['nqas_chc_fru', 'nqas_chc_nonfru'] : progId ? [progId] : null;
  var pre = { sc: /^nqas_12/, uphc: /^nqas_uphc/, phc: /^nqas_phc/, chc: /^nqas_chc_/ }[t];
  return items.some(function (x) { return x && Number(x.blPrice) > 0 && (ids ? ids.indexOf(x.id) >= 0 : pre && pre.test(x.id)); });
}
async function fbLoadPublic(force) {
  if (_fb.cfg && !force && Date.now() - _fb.at < 120000) return;
  try { _fb.cfg = (await fbGet('shared/sc_freebl_config')) || null; } catch (e) { _fb.cfg = null; }
  try { _fb.prices = (await fbGet('shared/sc_pricing_config')) || {}; } catch (e) { _fb.prices = {}; }
  _fb.at = Date.now();
}
// the facility's own answer (fixed at approval), and what is still due before Day 1
function fbIsFree(f) { return !(f && f.freeBl && f.freeBl.free === false); }
function fbNeedsBl(f) {
  if (fbIsFree(f) || !f || f.subscriptionStatus !== 'trial' || f.blPaid) return false;
  var op = f.officePay; return !(op && (op.commit || (op.until && op.until >= fbToday())));
}

// ══ Join form (screen 11): "Free baseline" / "Baseline fee" and how the facility starts ══
function fbJoinFree(t, state, district) {
  if (!_fb.at) { fbLoadPublic().then(function () { try { if (typeof _jn !== 'undefined' && _jn.step === 'fac' && typeof jnRender === 'function') jnRender(); } catch (e) {} }); return true; }
  var d = fbDecide(_fb.cfg, t, state, district, fbToday()); return d.free || !fbHasBlFee(t, typeof _jn !== 'undefined' && _jn.type === t ? _jn.pkg : '');
}
function fbJoinNote(t, state, district) {
  var free = fbJoinFree(t, state, district), d = _fb.at ? fbDecide(_fb.cfg, t, state, district, fbToday()) : { free: true }, b = fbBase(t), n = FB_NAMES[t] || t.toUpperCase();
  if (free) return '<div class="fb-join ok"><b>' + fbE(fbT('Free baseline', 'निःशुल्क बेसलाइन')) + (d.until ? ' · ' + fbE(fbT('for facilities approved until ' + fbFmt(d.until), fbFmt(d.until) + ' तक स्वीकृत केंद्रों के लिए')) : '') + '</b>'
    + '<span>' + fbE(fbT('Days 1–' + b + ' cost nothing: your team checks itself against the NQAS standards and sees its gaps. Implementation from Day ' + (b + 1) + ' starts once it is paid, or your District / partner confirms with HealSol Academy.',
      'दिन 1–' + b + ' निःशुल्क: आपकी टीम NQAS मानकों पर स्वयं जाँच करती है और कमियाँ देखती है। दिन ' + (b + 1) + ' से कार्यान्वयन भुगतान या ज़िले / सहयोगी की पुष्टि के बाद शुरू होता है।')) + '</span></div>';
  return '<div class="fb-join"><b>' + fbE(fbT('How a ' + n + ' starts', n + ' कैसे शुरू होता है')) + '</b>'
    + '<span>' + fbE(fbT('1. HealSol Academy approves your facility.', '1. HealSol Academy आपके केंद्र को स्वीकृत करती है।')) + '<br>' + fbE(fbT('2. You pay the baseline fee, or your District / partner confirms with HealSol Academy.', '2. आप बेसलाइन शुल्क देते हैं, या आपका ज़िला / सहयोगी HealSol Academy से पुष्टि करता है।'))
    + '<br>' + fbE(fbT('3. You choose Day 1. Implementation follows from Day ' + (b + 1) + ' the same way.', '3. आप दिन 1 चुनते हैं। दिन ' + (b + 1) + ' से कार्यान्वयन इसी तरह आगे चलता है।')) + '</span></div>';
}

// ══ In-charge, before Day 1 (screen 10): pay the baseline, then choose Day 1 ══
function fbPayStartHTML(code, f) {
  var t = fbType(f), b = fbBase(t), P = _fb.price[code];
  if (!P) { fbLoadPrice(code); return '<p class="sd-dim">' + fbE(fbT('Loading…', 'लोड हो रहा है…')) + '</p>'; }
  var h = '<div class="fb-start"><div class="fb-hero"><span>' + fbE(fbT('WELCOME TO NQAS | FAST', 'NQAS | FAST में स्वागत है')) + '</span><b>' + fbE(fbT('Your facility is approved', 'आपका केंद्र स्वीकृत है')) + '</b>'
    + '<small>' + fbE(fbT('Start with the baseline: ' + b + ' days in which every department checks itself against the NQAS standards. Nothing counts until you choose Day 1.', 'बेसलाइन से शुरू करें: ' + b + ' दिन जिनमें हर विभाग NQAS मानकों पर स्वयं जाँच करता है। दिन 1 चुनने तक कुछ नहीं गिना जाता।')) + '</small></div>';
  if (P.err) return h + '<p class="sd-dim">' + fbE(P.err) + '</p></div>';
  if (!P.price) return h + '<div class="fb-box"><p class="sd-dim">' + fbE(fbT('The baseline fee is not set yet. Please contact HealSol Academy — they will send a payment link.', 'बेसलाइन शुल्क अभी तय नहीं है। कृपया HealSol Academy से संपर्क करें।')) + '</p></div></div>';
  var p = P.price, play = typeof nfIsPlay === 'function' && nfIsPlay(), inc = (typeof nfIsChoNow === 'function' && typeof choState !== 'undefined' && choState.facilityCode === code) ? nfIsChoNow() : (typeof nduInCharge === 'function' ? nduInCharge() : true);
  h += '<div class="fb-box"><span class="fb-k">' + fbE(fbT('STEP 1 · BASELINE (DAYS 1–' + b + ')', 'चरण 1 · बेसलाइन (दिन 1–' + b + ')')) + '</span>'
    + '<div class="fb-line"><span>' + fbE(fbT('Baseline fee + GST 18%', 'बेसलाइन शुल्क + GST 18%')) + '</span><b>' + fbM(p.total) + '</b></div>';
  if (play) h += '<p class="sd-dim">' + fbE(fbT('Payments are made on the website: open app.thehealsol.com/pay in a browser and log in with this mobile number.', 'भुगतान वेबसाइट पर होता है: ब्राउज़र में app.thehealsol.com/pay खोलें और इसी मोबाइल नंबर से लॉग इन करें।')) + '</p>';
  else if (!inc) h += '<p class="sd-dim">' + fbE(fbT('Your in-charge pays the baseline fee and then chooses Day 1.', 'आपके प्रभारी बेसलाइन शुल्क देकर दिन 1 चुनते हैं।')) + '</p>';
  else {
    h += '<button type="button" class="fb-b1" id="fb-pay" onclick="fbPay(\'' + fbE(code) + '\',\'bl\',this)">' + fbE(fbT('Pay baseline and choose Day 1', 'बेसलाइन भुगतान करें और दिन 1 चुनें')) + '</button>'
      + (typeof ppStart === 'function' ? '<button type="button" class="fb-b2" onclick="ppStart({list:1})">' + fbE(fbT('Bank transfer / proforma invoice', 'बैंक ट्रांसफ़र / प्रोफ़ॉर्मा इनवॉइस')) + '</button>' : '');
  }
  if (P.impl) h += '<div class="fb-line sm"><span>' + fbE(fbT('Step 2 · implementation (from Day ' + (b + 1) + ')', 'चरण 2 · कार्यान्वयन (दिन ' + (b + 1) + ' से)')) + '</span><span>' + fbM(P.impl.total) + ' ' + fbE(fbT('later', 'बाद में')) + '</span></div>';
  if (P.full && inc && !play) h += '<button type="button" class="fb-link" onclick="fbPay(\'' + fbE(code) + '\',\'full\',this)">' + fbE(fbT('Pay the full programme now instead (' + fbM(P.full.total) + ')', 'इसके बजाय पूरा कार्यक्रम अभी भुगतान करें (' + fbM(P.full.total) + ')')) + '</button>';
  return h + '</div><p class="fb-note">' + fbE(fbT('District or partner paying? Ask them to tell HealSol Academy. You can choose Day 1 as soon as it is recorded.', 'ज़िला या सहयोगी भुगतान कर रहा है? उनसे HealSol Academy को बताने को कहें। दर्ज होते ही आप दिन 1 चुन सकते हैं।')) + '</p></div>';
}
async function fbLoadPrice(code) {
  if (_fb.price[code] && _fb.price[code].loading) return; _fb.price[code] = { loading: true };
  try { var r = await nfCall('priceFor', { code: code }); _fb.price[code] = { price: r.price, full: r.full || null, impl: r.impl || null, part: r.part }; }
  catch (e) { _fb.price[code] = { err: String((typeof nfErrText === 'function' ? nfErrText(e) : e.message) || e) }; }
  try { if (typeof sdPaintAll === 'function') sdPaintAll(); } catch (e) {}
}
function fbLocal(code, x) {
  [function () { return typeof choState !== 'undefined' && choState.facilityCode === code && choState.facility; }, function () { return typeof _nd !== 'undefined' && _nd && _nd.code === code && _nd.fac; },
   function () { return typeof scMasterFacilities !== 'undefined' && scMasterFacilities[code]; }, function () { return typeof scSubAdminData !== 'undefined' && scSubAdminCode === code && scSubAdminData; }].forEach(function (g) { try { var f = g(); if (f) Object.assign(f, x); } catch (e) {} });
}
async function fbPay(code, part, btn) {
  if (typeof Razorpay === 'undefined') { try { await nfLoadScriptAny(['https://checkout.razorpay.com/v1/checkout.js'], function () { return typeof Razorpay !== 'undefined'; }); } catch (e) {} }
  if (typeof Razorpay === 'undefined') { showToast(fbT('The payment window could not load — check your internet connection.', 'भुगतान विंडो नहीं खुली — इंटरनेट जाँचें।'), 'err'); return; }
  var label = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.textContent = fbT('Preparing payment…', 'भुगतान तैयार हो रहा है…'); }
  var o; try { o = await nfCall('createPaymentOrder', { code: code, part: part }); } catch (e) { showToast(nfErrText(e), 'err'); if (btn) { btn.disabled = false; btn.innerHTML = label; } return; }
  if (btn) { btn.disabled = false; btn.innerHTML = label; }
  var rzp = new Razorpay({ key: o.keyId, order_id: o.orderId, amount: o.amount, currency: o.currency || 'INR', name: 'HealSol Academy', description: 'NQAS | FAST — ' + (o.packageLabel || 'programme') + ' (incl. 18% GST)',
    prefill: { name: (o.prefill || {}).name || '', contact: (o.prefill || {}).contact || '' }, notes: { facility: code, part: part }, theme: { color: '#1E6B5E' },
    handler: async function (resp) {
      showToast(fbT('Payment received — confirming…', 'भुगतान मिला — पुष्टि हो रही है…'), '');
      try { var v = await nfCall('verifyPayment', { orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature });
        fbLocal(code, Object.assign({ blPaid: { at: v.receipt.paidAt, receiptNo: v.receipt.receiptNo } }, o.part === 'full' ? { subscriptionStatus: 'paid' } : {}));
        showToast(fbT('Payment successful — now choose your Day 1.', 'भुगतान सफल — अब अपना दिन 1 चुनें।'), 'ok');
        delete _fb.price[code]; try { delete _sd.info[code]; sdLoad(code); } catch (e) {}
        if (typeof nfShowReceipt === 'function') nfShowReceipt(v.receipt); }
      catch (e) { scAlert('Your payment (' + resp.razorpay_payment_id + ') was received. It will be confirmed automatically within a few minutes — reopen the app shortly. If it is still waiting after an hour, send this payment ID to HealSol Academy.', 'Payment received', '💳'); }
    }, modal: { ondismiss: function () {} } });
  if (rzp.on) rzp.on('payment.failed', function (r) { showToast('Payment failed' + (r && r.error && r.error.description ? ': ' + r.error.description : '') + '. No money was taken — you can try again.', 'err'); });
  rzp.open();
}
// the start-date card shows the payment first while the baseline is unpaid
(function () { if (typeof sdBodyHTML !== 'function') return; var o = sdBodyHTML;
  sdBodyHTML = function (code) { try { var I = (typeof _sd !== 'undefined' && _sd.info[code]) || null; if (I && !I.err && !I.locked && I.needsBl) return fbPayStartHTML(code, fbFacOf(code)); } catch (e) {} return o.apply(this, arguments); }; })();
function fbFacOf(code) {
  try { if (typeof choState !== 'undefined' && choState.facilityCode === code && choState.facility) return choState.facility; } catch (e) {}
  try { if (typeof _nd !== 'undefined' && _nd && _nd.code === code && _nd.fac) return _nd.fac; } catch (e) {}
  try { if (typeof scSubAdminData !== 'undefined' && scSubAdminData && scSubAdminCode === code) return scSubAdminData; } catch (e) {}
  try { if (typeof scMasterFacilities !== 'undefined' && scMasterFacilities[code]) return scMasterFacilities[code]; } catch (e) {}
  return {};
}

// ══ HealSol, Settings → Pricing → Free baseline (screen 8) ══
async function fbRender() {
  var host = document.getElementById('pricing-list'); if (!host) return; var card = host.parentNode, box = document.getElementById('fb-cfg');
  if (!box) { box = document.createElement('div'); box.id = 'fb-cfg'; box.className = 'bp-cfg fb-cfg'; var after = host.nextElementSibling; card.insertBefore(box, after ? after.nextSibling : null); }
  await fbLoadPublic(true); if (!_fb.edit) _fb.edit = JSON.parse(JSON.stringify(fbCfgOf(_fb.cfg)));
  var C = _fb.edit, saved = !!_fb.cfg;
  var typeCard = function (t) { var x = C.types[t];
    return '<div class="fb-tc' + (x.mode === 'paid' ? ' off' : '') + '"><b>' + FB_NAMES[t] + '</b><select class="bp-i" aria-label="Free baseline for ' + FB_NAMES[t] + '" onchange="fbSetType(\'' + t + '\',this.value)">'
      + [['free', 'Free'], ['until', 'Free until…'], ['paid', 'Baseline fee']].map(function (o) { return '<option value="' + o[0] + '"' + (x.mode === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
      + (x.mode === 'until' ? '<input class="bp-i" type="date" aria-label="Free until (' + FB_NAMES[t] + ')" value="' + fbE(x.until) + '" onchange="_fb.edit.types.' + t + '.until=this.value">' : '') + '</div>'; };
  var rules = Object.keys(C.rules).sort(function (a, b) { var A = C.rules[a], B = C.rules[b]; return (A.state + A.district).localeCompare(B.state + B.district); });
  box.innerHTML = '<div class="bp-h"><i class="ti ti-calendar-check"></i> Free baseline' + (saved ? '' : ' <span class="bp-tag">Defaults — not saved yet</span>') + '</div>'
    + '<div class="bp-sub">Checked on the day a facility is approved, and kept by that facility. Without a free baseline, the facility pays the baseline fee (or a District / partner commits) before Day 1, and the implementation fee before Day 8 (Day 15 for a CHC). A facility whose package has no baseline fee (above) stays free.</div>'
    + '<div class="fb-k2">ALL INDIA (DEFAULT)</div><div class="fb-tg">' + FB_TYPES.map(typeCard).join('') + '</div>'
    + '<div class="fb-k2">EXCEPTIONS (A DISTRICT BEATS A STATE)</div>'
    + (rules.length ? '<div class="fb-rl">' + rules.map(function (id) { var r = C.rules[id];
      return '<div class="fb-r"><span><b>' + fbE(r.district ? r.district + ' (district, ' + r.state + ')' : r.state + ' (state)') + '</b><small>' + fbE(FB_TYPES.filter(function (t) { return r.types[t]; }).map(function (t) { return FB_NAMES[t]; }).join(', ')) + ' · ' + (r.free ? 'free' : 'not free') + (r.from ? ' from ' + fbFmt(r.from) : '') + (r.until ? ' until ' + fbFmt(r.until) : '') + (r.note ? ' (' + fbE(r.note) + ')' : '') + '</small></span>'
        + '<button type="button" class="hs-btn" onclick="fbRuleEdit(\'' + id + '\')">Edit</button><button type="button" class="hs-btn" onclick="fbRuleDel(\'' + id + '\')" aria-label="Remove this exception">Remove</button></div>'; }).join('') + '</div>' : '<p class="bp-sub">No exceptions yet.</p>')
    + '<div class="fb-acts"><button type="button" class="hs-btn" onclick="fbRuleEdit(\'\',0)">+ State exception</button><button type="button" class="hs-btn" onclick="fbRuleEdit(\'\',1)">+ District exception</button></div><div id="fb-red"></div>'
    + '<div class="fb-chk"><b>Check a place</b><div class="bp-g"><label class="bp-l">Type<select class="bp-i" id="fb-ct">' + FB_TYPES.map(function (t) { return '<option value="' + t + '">' + FB_NAMES[t] + '</option>'; }).join('') + '</select></label>'
      + '<label class="bp-l">State<input class="bp-i" id="fb-cs" list="fb-states" placeholder="e.g. Uttar Pradesh"></label><label class="bp-l">District<input class="bp-i" id="fb-cd" list="fb-dists" placeholder="e.g. Agra"></label>'
      + '<label class="bp-l">Approved on<input class="bp-i" type="date" id="fb-cdt" value="' + fbToday() + '"></label></div><button type="button" class="hs-btn" onclick="fbCheck()">Check</button><div id="fb-cr" class="fb-cr" role="status"></div>'
      + '<p class="bp-sub">The check uses the saved settings and the saved prices — save first.</p></div>'
    + fbDatalists()
    + '<button type="button" class="bp-save" onclick="fbSave()"><i class="ti ti-device-floppy"></i> Save free baseline settings</button>';
}
function fbDatalists() {
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, st = {}, di = {};
  Object.keys(F).forEach(function (c) { var f = F[c] || {}; if (f.state) st[f.state] = 1; if (f.district) di[f.district] = 1; });
  try { if (typeof JN_STATES !== 'undefined') Object.keys(JN_STATES).forEach(function (s) { st[s] = 1; }); } catch (e) {}
  return '<datalist id="fb-states">' + Object.keys(st).sort().map(function (s) { return '<option value="' + fbE(s) + '">'; }).join('') + '</datalist><datalist id="fb-dists">' + Object.keys(di).sort().map(function (s) { return '<option value="' + fbE(s) + '">'; }).join('') + '</datalist>';
}
function fbSetType(t, v) { _fb.edit.types[t].mode = v; if (v === 'until' && !_fb.edit.types[t].until) _fb.edit.types[t].until = '2026-12-31'; fbRender(); }
function fbRuleEdit(id, dist) {
  var r = id ? _fb.edit.rules[id] : { state: '', district: '', types: {}, free: true, from: '', until: '', note: '' }, isD = id ? !!r.district : !!dist;
  document.getElementById('fb-red').innerHTML = '<div class="of-ed"><div class="bp-k">' + (id ? 'Edit exception' : isD ? 'New district exception' : 'New state exception') + '</div><div class="bp-g">'
    + '<label class="bp-l">State *<input class="bp-i" id="fb-rs" list="fb-states" value="' + fbE(r.state) + '"></label>'
    + (isD ? '<label class="bp-l">District *<input class="bp-i" id="fb-rd" list="fb-dists" value="' + fbE(r.district) + '"></label>' : '')
    + '<label class="bp-l">Baseline<select class="bp-i" id="fb-rf"><option value="1"' + (r.free ? ' selected' : '') + '>Free</option><option value="0"' + (!r.free ? ' selected' : '') + '>Not free (baseline fee)</option></select></label>'
    + '<label class="bp-l">From (optional)<input class="bp-i" type="date" id="fb-rfr" value="' + fbE(r.from) + '"></label><label class="bp-l">Until (optional)<input class="bp-i" type="date" id="fb-ru" value="' + fbE(r.until) + '"></label>'
    + '<label class="bp-l">Note (optional)<input class="bp-i" id="fb-rn" maxlength="60" value="' + fbE(r.note) + '" placeholder="e.g. pilot"></label></div>'
    + '<fieldset class="fb-tys"><legend>Facility types *</legend>' + FB_TYPES.map(function (t) { return '<label class="bp-chk"><input type="checkbox" data-fbt="' + t + '"' + (r.types[t] ? ' checked' : '') + '> ' + FB_NAMES[t] + '</label>'; }).join('') + '</fieldset>'
    + '<div class="iv-acts"><button type="button" class="hs-btn p" onclick="fbRuleKeep(\'' + (id || '') + '\',' + (isD ? 1 : 0) + ')">Keep</button><button type="button" class="hs-btn" onclick="document.getElementById(\'fb-red\').innerHTML=\'\'">Cancel</button></div>'
    + '<p class="bp-sub">Kept here until you press "Save free baseline settings".</p></div>';
}
function fbRuleKeep(id, isD) {
  var g = function (k) { var e = document.getElementById(k); return e ? String(e.value || '').trim() : ''; }, types = {};
  document.querySelectorAll('#fb-red input[data-fbt]').forEach(function (c) { if (c.checked) types[c.getAttribute('data-fbt')] = true; });
  var r = { state: g('fb-rs'), district: isD ? g('fb-rd') : '', types: types, free: g('fb-rf') === '1', from: g('fb-rfr'), until: g('fb-ru'), note: g('fb-rn') };
  if (!r.state) { showToast('Write the state.', 'err'); return; } if (isD && !r.district) { showToast('Write the district.', 'err'); return; }
  if (!Object.keys(types).length) { showToast('Tick at least one facility type.', 'err'); return; }
  if (r.from && r.until && r.until < r.from) { showToast('"Until" is before "From".', 'err'); return; }
  _fb.edit.rules[id || ('r' + Date.now().toString(36))] = r; fbRender();
}
function fbRuleDel(id) { delete _fb.edit.rules[id]; fbRender(); }
async function fbSave() {
  var C = _fb.edit, bad = FB_TYPES.filter(function (t) { return C.types[t].mode === 'until' && !/^\d{4}-\d{2}-\d{2}$/.test(C.types[t].until || ''); });
  if (bad.length) { showToast('Choose the "free until" date for ' + bad.map(function (t) { return FB_NAMES[t]; }).join(', ') + '.', 'err'); return; }
  var v = { types: {}, rules: C.rules, at: new Date().toISOString() }; FB_TYPES.forEach(function (t) { v.types[t] = C.types[t].mode === 'until' ? { mode: 'until', until: C.types[t].until } : { mode: C.types[t].mode }; });
  var ok = await fbSet('shared/sc_freebl_config', v); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
  _fb.cfg = v; _fb.edit = null; showToast('Free baseline settings saved. They apply to facilities approved from now on.', 'ok'); fbRender();
}
async function fbCheck() {
  var out = document.getElementById('fb-cr'), g = function (k) { return String((document.getElementById(k) || {}).value || '').trim(); }; if (!out) return;
  if (!g('fb-cs')) { out.textContent = 'Write the state.'; return; } out.textContent = 'Checking…';
  try { var r = await nfCall('freeBlCheck', { type: g('fb-ct'), state: g('fb-cs'), district: g('fb-cd'), date: g('fb-cdt') });
    out.innerHTML = '<b>' + fbE(FB_NAMES[g('fb-ct')] + ' in ' + (g('fb-cd') ? g('fb-cd') + ', ' : '') + g('fb-cs') + ', approved ' + fbFmt(g('fb-cdt'))) + '</b> → ' + (r.free ? 'free baseline' : 'baseline fee before Day 1') + ' <small>(' + fbE(r.why) + ')</small>'; }
  catch (e) { out.textContent = nfErrText(e); }
}
(function () { if (typeof adminRenderPricingPanel !== 'function') return; var o = adminRenderPricingPanel;
  adminRenderPricingPanel = async function () { var r = await o.apply(this, arguments); try { _fb.edit = null; await fbRender(); } catch (e) { console.warn('[freebl] settings', e); } return r; }; })();

// ══ HealSol: Facilities list and the ⋯ menu ══
(function () { if (typeof hsInfo !== 'function') return; var o = hsInfo;
  hsInfo = function (code) { var r = o.apply(this, arguments); try { if (r && r.f && fbNeedsBl(r.f)) { r.access = 'Baseline fee due'; r.payDue = false; } } catch (e) {} return r; }; })();
(function () { if (typeof nfFacMenu !== 'function') return; var o = nfFacMenu;
  nfFacMenu = function (btn, code) { var r = o.apply(this, arguments);
    try { var m = document.getElementById('mfc-menu'), f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {};
      if (!m || f.subscriptionStatus !== 'trial' || (f.startDate && f.startDate <= fbToday())) return r;
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.innerHTML = '<i class="ti ti-calendar-check"></i>' + fbE(fbIsFree(f) ? 'Free baseline: yes — change' : 'Free baseline: no — change');
      b.setAttribute('onclick', "document.getElementById('mfc-menu').remove();fbFacDialog('" + String(code).replace(/'/g, "\\'") + "')"); m.appendChild(b); } catch (e) {}
    return r; }; })();
async function fbFacDialog(code) {
  var f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {}, free = fbIsFree(f);
  var v = await scDialog({ title: free ? 'Remove the free baseline?' : 'Give a free baseline?', icon: '🎁', okLabel: free ? 'Baseline fee before Day 1' : 'Make the baseline free',
    message: (f.name || code) + '\nNow: ' + (free ? 'free baseline' : 'baseline fee before Day 1') + (f.freeBl && f.freeBl.why ? ' (' + f.freeBl.why + ')' : ' (joined before the setting existed)') + '.\nOnly before Day 1. The reason is kept with the facility.',
    fields: [{ key: 'why', label: 'Reason', value: '', required: true }] });
  if (!v) return;
  try { var r = await nfCall('setFreeBl', { code: code, free: !free, why: v.why }); fbLocal(code, { freeBl: r }); showToast(r.free ? 'Free baseline given.' : 'The baseline fee is now due before Day 1.', 'ok');
    if (typeof hsRenderFac === 'function' && document.getElementById('hs-fq')) hsRenderFac(); }
  catch (e) { showToast(nfErrText(e), 'err'); }
}
