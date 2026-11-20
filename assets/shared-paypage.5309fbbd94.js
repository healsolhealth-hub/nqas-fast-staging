// ══════════════════════════════════════════════════════════════
// Website payment page (18 Nov 2026) — app.thehealsol.com/pay/  (server: functions/paylinks.js)
//  · Login screen (website only, never in the Qi FAST Play app): a "Pay for a facility" card and "Ask for a payment link".
//  · /pay/ and /pay/?l=PAY-XXXXXX open the login with a "Log in to pay" note; once signed in, the payment page opens.
//  · In-charge with one facility: that facility, its price, pay online or by bank transfer.
//    District / Block / State / partner: their facilities, tick several, one payment and one GST invoice.
//    A HealSol payment link: its own plan and price.
//  · "Ask for a payment link": what the payer would like (ticks HealSol edits) and a note.
// The amount always comes from the server; this page only shows it.
// ══════════════════════════════════════════════════════════════
var _pp = { intent: null, data: null, sel: {}, filt: 'due', view: 'main', busy: false, last: null, pf: null };
function ppE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ppM(n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; }
function ppPlay() { try { return typeof nfIsPlay === 'function' && nfIsPlay(); } catch (e) { return false; } }
function ppToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
var PP_ROLE = { incharge: 'Facility in-charge', district: 'District', block: 'Block', state: 'State', donor: 'Partner' };
var PP_ICON = {
  card: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><path d="M7 15h3"/></svg>',
  x: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  back: '<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  ok: '<svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#1E6B5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>'
};

// ── the intent: /pay/, ?pay=1, ?l=PAY-… (kept for this tab until the page opens) ──
function ppSetIntent(x) { _pp.intent = x; try { if (x) sessionStorage.setItem('nf_pay', JSON.stringify(x)); else sessionStorage.removeItem('nf_pay'); } catch (e) {} }
(function () {
  try {
    var q = location.search || '', l = /[?&]l=(PAY-[A-Z2-9]{6})\b/i.exec(q), p = /[?&]pay=1\b/.test(q) || /^\/pay\b/.test(location.pathname);
    if (l || p) {
      if (!ppPlay()) ppSetIntent(l ? { link: l[1].toUpperCase() } : { list: 1 });
      try { history.replaceState(null, '', location.pathname.replace(/^\/pay\/?.*$/, '/') + (location.hash || '')); } catch (e) {}
    } else { var s = sessionStorage.getItem('nf_pay'); if (s && !ppPlay()) _pp.intent = JSON.parse(s); }
  } catch (e) {}
})();

// ── login screen: the Pay card and, when someone came to pay, a note above the login ──
function ppPaintLogin() {
  var f = document.getElementById('nf-l-form'); if (!f) return;
  var old = document.getElementById('pp-card'); if (old) old.remove(); old = document.getElementById('pp-note'); if (old) old.remove();
  if (ppPlay()) return;
  if (_pp.intent) {
    f.insertAdjacentHTML('afterbegin', '<div class="pp-note" id="pp-note" role="status"><b>' + (_pp.intent.link ? 'Log in to open your payment link' : _pp.intent.ask ? 'Log in to ask for a payment link' : 'Log in to pay for a facility')
      + '</b><span>Use the login of the person paying: facility in-charge, District / Block, State or partner.</span><button type="button" class="pp-note-x" onclick="ppSetIntent(null);ppPaintLogin()">Not now</button></div>');
  }
  var h = '<div class="pp-card" id="pp-card"><div class="pp-card-r"><span class="pp-card-i">' + PP_ICON.card + '</span><span class="pp-card-t"><b>Pay for a facility</b><small>In-charges, Block, District, State and partners</small></span>'
    + '<button type="button" class="pp-card-b" onclick="ppStart({list:1})">Pay now</button></div>'
    + '<button type="button" class="pp-card-l" onclick="ppStart({ask:1})">Need a different plan? Ask for a payment link</button></div>';
  var ga = document.getElementById('ga-card'), chk = document.getElementById('jn-chk');
  if (ga && ga.parentNode === f) ga.insertAdjacentHTML('afterend', h); else if (chk && chk.parentNode === f) chk.insertAdjacentHTML('beforebegin', h); else f.insertAdjacentHTML('beforeend', h);
}
function ppSignedIn() { try { var u = typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth().currentUser; return u || null; } catch (e) { return null; } }
function ppStart(x) {
  if (ppPlay()) return;
  ppSetIntent(x);
  if (ppSignedIn()) { ppOpen(); return; }
  ppPaintLogin();
  try { var i = document.getElementById('nf-id'); if (i) { i.focus(); i.scrollIntoView({ block: 'center', behavior: 'smooth' }); } } catch (e) {}
}
// once someone is signed in (and has set a password), the page opens by itself
var _ppWatch = null;
function ppWatch() {
  if (_ppWatch || ppPlay()) return;
  _ppWatch = setInterval(async function () {
    if (!_pp.intent) { clearInterval(_ppWatch); _ppWatch = null; return; }
    var u = ppSignedIn(); if (!u || document.getElementById('pp-ov')) return;
    try { var t = await u.getIdTokenResult(); if (t && t.claims && t.claims.mc) return; } catch (e) { return; }
    var ls = document.getElementById('login-screen'); if (ls && getComputedStyle(ls).display !== 'none') return;   // still on the login (choosing a role)
    ppOpen();
  }, 900);
}

// ── the page ──
function ppShell(inner) {
  var ov = document.getElementById('pp-ov');
  if (!ov) { ov = document.createElement('div'); ov.id = 'pp-ov'; ov.className = 'pp-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Pay for a facility'); document.body.appendChild(ov); try { document.documentElement.classList.add('pp-lock'); } catch (e) {} }
  var me = (_pp.data && _pp.data.me) || {}, who = [me.name, (me.roles || []).map(function (r) { return PP_ROLE[r] || r; }).join(', ')].filter(Boolean).join(' · ');
  ov.innerHTML = '<div class="pp-top"><div class="pp-top-l">' + (_pp.view !== 'main' && _pp.view !== 'done' ? '<button type="button" class="pp-ic" aria-label="Back" onclick="ppGo(\'main\')">' + PP_ICON.back + '</button>' : '')
    + '<img src="icons/qi-logo.jpg" alt="Qi FAST" class="pp-logo"><b>' + ppE(_pp.view === 'ask' ? 'Ask for a payment link' : _pp.view === 'bank' ? 'Pay by bank transfer' : 'Pay for a facility') + '</b></div>'
    + '<div class="pp-top-r">' + (who ? '<span class="pp-who">Logged in · ' + ppE(who) + '</span>' : '') + '<button type="button" class="pp-ic" aria-label="Close" onclick="ppClose()">' + PP_ICON.x + '</button></div></div>'
    + '<div class="pp-body">' + inner + '</div>';
  return ov;
}
function ppClose() { ppSetIntent(null); _pp.view = 'main'; var o = document.getElementById('pp-ov'); if (o) o.remove(); try { document.documentElement.classList.remove('pp-lock'); } catch (e) {} }
function ppGo(v) { _pp.view = v; ppRender(); try { var b = document.querySelector('#pp-ov .pp-body'); if (b) b.scrollTop = 0; document.getElementById('pp-ov').scrollTop = 0; } catch (e) {} }
async function ppOpen() {
  if (ppPlay()) return;
  var it = _pp.intent || { list: 1 };
  _pp.view = it.ask ? 'ask' : 'main'; ppShell('<div class="pp-empty">Loading…</div>');
  try { _pp.data = await nfCall('payList', it.link ? { link: it.link } : {}); }
  catch (e) { ppShell('<div class="pp-msg err"><b>Could not open the payment page</b><p>' + ppE(nfErrText(e)) + '</p><button type="button" class="pp-b2" onclick="ppOpen()">Try again</button></div>'); return; }
  _pp.sel = {}; ppDue().forEach(function (f) { if (f.price) _pp.sel[f.code] = 1; });   // everything waiting is ticked to start with
  ppRender();
}
function ppDue() { return ((_pp.data || {}).facs || []).filter(function (f) { return f.status === 'due' || f.status === 'office'; }); }
function ppSingle() { var d = _pp.data || {}, r = (d.me || {}).roles || []; return !d.link && r.length === 1 && r[0] === 'incharge' && (d.facs || []).length <= 1; }
function ppRender() {
  var d = _pp.data || {};
  if (!_pp.data) return ppShell('<div class="pp-empty">Loading…</div>');
  if (_pp.view === 'ask') return ppShell(ppAskHTML());
  if (_pp.view === 'bank') return ppShell(ppBankHTML());
  if (_pp.view === 'done') return ppShell(ppDoneHTML());
  if (d.link) return ppShell(ppLinkHTML(d.link));
  if (!((d.me || {}).roles || []).length) return ppShell('<div class="pp-msg"><b>This login cannot pay for a facility</b><p>Payments are made by the facility in-charge (CHO, UPHC Coordinator or MOIC), the District or Block team, the State, or a partner. Log out and log in as one of them, or ask HealSol Academy at info@thehealsol.com.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>');
  return ppShell(ppSingle() ? ppOneHTML() : ppManyHTML());
}
function ppStatus(f) {
  if (f.status === 'paid') return '<span class="pp-st ok">Paid</span>';
  if (f.status === 'active') return '<span class="pp-st ok">Full access</span>';
  if (f.checking) return '<span class="pp-st info">Payment being checked</span>';
  if (f.status === 'office') return '<span class="pp-st warn">Office payment pending</span>';
  return f.day > 7 ? '<span class="pp-st warn">Baseline done</span>' : f.day > 0 ? '<span class="pp-st info">On trial · Day ' + f.day + '</span>' : '<span class="pp-st info">Not started</span>';
}
function ppAmt(base, gst, total, big) {
  return '<div class="pp-amt"><div><span>Price</span><span>' + ppM(base) + '</span></div><div><span>GST 18%</span><span>' + ppM(gst) + '</span></div><div class="pp-tot' + (big ? ' big' : '') + '"><span>Total</span><span>' + ppM(total) + '</span></div></div>';
}
function ppMethods(name) {
  var bank = !!(_pp.data || {}).bank;
  return '<fieldset class="pp-pm"><legend>Pay by</legend><label class="on"><input type="radio" name="' + name + '" value="online" checked onchange="ppPm(this)"> UPI, card or netbanking</label>'
    + (bank ? '<label><input type="radio" name="' + name + '" value="bank" onchange="ppPm(this)"> Bank transfer (proforma invoice)</label>' : '') + '</fieldset>';
}
function ppPm(el) { try { el.closest('fieldset').querySelectorAll('label').forEach(function (l) { l.classList.toggle('on', l.querySelector('input').checked); }); var b = document.getElementById('pp-go'), t = (_pp.last || {}).total; if (b && t != null) b.textContent = el.value === 'bank' ? 'Get proforma invoice' : 'Pay ' + ppM(t); } catch (e) {} }
function ppMethod() { var x = document.querySelector('#pp-ov .pp-pm input:checked'); return x ? x.value : 'online'; }
function ppAskLink(label) { return '<button type="button" class="pp-link" onclick="ppGo(\'ask\')">' + ppE(label || 'Need a different plan? Ask for a payment link') + '</button>'; }
function ppLinksHTML() {
  var L = (_pp.data || {}).links || []; if (!L.length) return '';
  return '<div class="pp-sec"><h3>Payment links from HealSol</h3>' + L.map(function (k) {
    return '<div class="pp-lk"><div><b>' + ppE(k.plan) + '</b><small>' + ppE(k.forName || k.facs.map(function (f) { return f.name; }).join(', ')) + (k.until ? ' · open until ' + ppE(k.until) : '') + '</small></div><div class="pp-lk-r"><b>' + ppM(k.total) + '</b><button type="button" class="pp-b2" onclick="ppOpenLink(\'' + ppE(k.id) + '\')">Open</button></div></div>'; }).join('') + '</div>';
}
function ppOpenLink(id) { ppSetIntent({ link: id }); ppOpen(); }

// in-charge, one facility (board 5)
function ppOneHTML() {
  var f = ((_pp.data || {}).facs || [])[0];
  if (!f) return '<div class="pp-msg"><b>No facility to pay for</b><p>Your login is not the in-charge of an enrolled facility.</p>' + ppAskLink('Ask HealSol for a payment link') + '</div>';
  var top = '<div class="pp-box"><span class="pp-k">Facility</span><b class="pp-big">' + ppE(f.name) + '</b><small>' + ppE([f.typeLabel, f.district ? (/\bdistrict$/i.test(f.district) ? f.district : f.district + ' district') : ''].filter(Boolean).join(' · ')) + ' · ' + ppStatus(f) + '</small></div>';
  if (f.status === 'paid' || f.status === 'active') return top + '<div class="pp-msg"><b>' + (f.status === 'paid' ? 'Already paid' : 'Full access is already open') + '</b><p>There is nothing to pay. Receipts are in the app under Me → Payment receipts.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>' + ppLinksHTML();
  if (!f.price) return top + '<div class="pp-msg"><b>The price is not set yet</b><p>Ask HealSol for a payment link — they will send it on WhatsApp.</p></div>' + ppAskLink('Ask for a payment link');
  _pp.last = { codes: [f.code], total: f.price.total };
  return top + '<div class="pp-box"><span class="pp-k">Plan</span><b class="pp-big">' + ppE(f.price.label) + '</b>' + ppAmt(f.price.base, f.price.gst, f.price.total) + '</div>'
    + (f.checking ? '<p class="pp-info">A bank transfer you sent is being checked by HealSol. You can still pay online.</p>' : '')
    + ppMethods('pp-pm1') + ppBill(false)
    + '<div class="pp-acts"><button type="button" class="pp-b1" id="pp-go" onclick="ppPay([\'' + ppE(f.code) + '\'])">Pay ' + ppM(f.price.total) + '</button><p class="pp-err" id="pp-err" role="alert"></p><p class="pp-sm">Receipt and GST invoice right after payment. The facility unlocks on its own.</p>' + ppAskLink() + '</div>' + ppLinksHTML();
}
// District / Block / State / partner (board 7)
function ppManyHTML() {
  var all = (_pp.data || {}).facs || [], due = ppDue(), rows = _pp.filt === 'due' ? due : all;
  var sel = due.filter(function (f) { return _pp.sel[f.code] && f.price; }), base = 0, gst = 0, tot = 0;
  sel.forEach(function (f) { base += f.price.base; gst += f.price.gst; tot += f.price.total; }); base = Math.round(base * 100) / 100; gst = Math.round(gst * 100) / 100; tot = Math.round(tot * 100) / 100;
  _pp.last = { codes: sel.map(function (f) { return f.code; }), total: tot };
  var allOn = due.length && due.every(function (f) { return _pp.sel[f.code] || !f.price; });
  var table = rows.length ? '<div class="pp-tw"><table class="pp-t"><thead><tr><th class="pp-c"><input type="checkbox" aria-label="Select all waiting for payment"' + (allOn ? ' checked' : '') + ' onchange="ppAll(this.checked)"></th><th>Facility</th><th>Type</th><th>Status</th><th class="pp-r">Price</th></tr></thead><tbody>'
    + rows.map(function (f) { var can = (f.status === 'due' || f.status === 'office') && f.price;
      return '<tr class="' + (can ? '' : 'pp-off') + '"><td class="pp-c">' + (can ? '<input type="checkbox" aria-label="' + ppE(f.name) + '"' + (_pp.sel[f.code] ? ' checked' : '') + ' onchange="ppTick(\'' + ppE(f.code) + '\',this.checked)">' : '') + '</td><td data-l="Facility"><b>' + ppE(f.name) + '</b><small>' + ppE([f.block ? f.block + ' block' : '', f.district].filter(Boolean).join(', ')) + '</small></td><td data-l="Type">' + ppE(f.typeLabel) + '</td><td data-l="Status">' + ppStatus(f) + '</td><td data-l="Price" class="pp-r">' + (f.price ? ppM(f.price.total) + '<small>incl. GST</small>' : (f.status === 'due' ? '<small>Ask for a link</small>' : '—')) + '</td></tr>'; }).join('')
    + '</tbody></table></div>' : '<div class="pp-empty">' + (_pp.filt === 'due' ? 'No facility is waiting for payment.' : 'No facilities on your list yet.') + '</div>';
  var side = '<div class="pp-side"><b class="pp-big">' + sel.length + ' facilit' + (sel.length === 1 ? 'y' : 'ies') + ' selected</b>' + ppAmt(base, gst, tot, true) + ppMethods('pp-pmN') + ppBill(false)
    + '<button type="button" class="pp-b1" id="pp-go"' + (sel.length ? '' : ' disabled') + ' onclick="ppPay(_pp.last.codes)">Pay ' + ppM(tot) + '</button><p class="pp-err" id="pp-err" role="alert"></p>'
    + '<p class="pp-sm">One GST invoice for all. Each facility unlocks as soon as the payment is confirmed.</p>' + ppAskLink('Need a different plan or price? Ask for a payment link') + '</div>';
  return '<div class="pp-many"><div class="pp-main"><div class="pp-hd"><h2>Facilities on your list</h2><div class="pp-flt" role="group" aria-label="Show"><button type="button" class="' + (_pp.filt === 'due' ? 'on' : '') + '" aria-pressed="' + (_pp.filt === 'due') + '" onclick="_pp.filt=\'due\';ppRender()">Waiting for payment (' + due.length + ')</button><button type="button" class="' + (_pp.filt === 'all' ? 'on' : '') + '" aria-pressed="' + (_pp.filt === 'all') + '" onclick="_pp.filt=\'all\';ppRender()">All (' + all.length + ')</button></div></div>'
    + table + '<p class="pp-sm">' + ppE(ppScopeNote()) + '</p>' + ppLinksHTML() + '</div>' + side + '</div>';
}
function ppScopeNote() { var r = (((_pp.data || {}).me || {}).roles || []); return r.indexOf('donor') >= 0 ? 'You see the facilities your organisation supports.' : r.indexOf('state') >= 0 ? 'You see the facilities in your state.' : r.indexOf('district') >= 0 ? 'You see the facilities of your district.' : r.indexOf('block') >= 0 ? 'You see the facilities of your block.' : ''; }
function ppTick(code, on) { if (on) _pp.sel[code] = 1; else delete _pp.sel[code]; ppKeepBill(); ppRender(); }
function ppAll(on) { ppDue().forEach(function (f) { if (on && f.price) _pp.sel[f.code] = 1; else delete _pp.sel[f.code]; }); ppKeepBill(); ppRender(); }
// bill-to (invoice in the name of): typed values survive a repaint
var _ppBill = null;
function ppDefaultBill() { return { name: '', address: '', gstin: '', state: '' }; }
function ppKeepBill() { var g = function (id) { var e = document.getElementById(id); return e ? e.value : null; }; if (g('pp-bn') != null) _ppBill = { name: g('pp-bn'), address: g('pp-ba'), gstin: g('pp-bg'), state: g('pp-bs') || '' }; ppGstHint(); }
// the states as on the GST invoice (functions/invoices.js STATE_CODES); the GSTIN's first two digits are the state code
var PP_STATES = [['01', 'Jammu and Kashmir'], ['02', 'Himachal Pradesh'], ['03', 'Punjab'], ['04', 'Chandigarh'], ['05', 'Uttarakhand'], ['06', 'Haryana'], ['07', 'Delhi'], ['08', 'Rajasthan'], ['09', 'Uttar Pradesh'], ['10', 'Bihar'], ['11', 'Sikkim'], ['12', 'Arunachal Pradesh'], ['13', 'Nagaland'], ['14', 'Manipur'], ['15', 'Mizoram'], ['16', 'Tripura'], ['17', 'Meghalaya'], ['18', 'Assam'], ['19', 'West Bengal'], ['20', 'Jharkhand'], ['21', 'Odisha'], ['22', 'Chhattisgarh'], ['23', 'Madhya Pradesh'], ['24', 'Gujarat'], ['26', 'Dadra and Nagar Haveli and Daman and Diu'], ['27', 'Maharashtra'], ['29', 'Karnataka'], ['30', 'Goa'], ['31', 'Lakshadweep'], ['32', 'Kerala'], ['33', 'Tamil Nadu'], ['34', 'Puducherry'], ['35', 'Andaman and Nicobar Islands'], ['36', 'Telangana'], ['37', 'Andhra Pradesh'], ['38', 'Ladakh']];
function ppGstState(g) { g = String(g || '').trim().toUpperCase(); if (!/^\d{2}/.test(g)) return ''; var x = PP_STATES.filter(function (s) { return s[0] === g.slice(0, 2); })[0]; return x ? x[1] : ''; }
function ppGstHint() {
  var h = document.getElementById('pp-bgh'), b = _ppBill || {}; if (!h) return; var gs = ppGstState(b.gstin);
  h.textContent = gs ? 'GSTIN state: ' + gs + (b.state && b.state !== gs ? ' — it does not match the state chosen below' : '') : '';
  h.className = 'pp-hint' + (gs && b.state && b.state !== gs ? ' err' : '');
}
function ppBill(open) {
  var b = _ppBill || (open ? ppDefaultBill() : { name: '', address: '', gstin: '', state: '' });
  return '<details class="pp-bill"' + (open ? ' open' : '') + '><summary>Invoice in the name of' + (open ? '' : ' (optional)') + '</summary>'
    + '<p class="pp-sm pp-l">Leave empty to bill the facility itself. Fill in only when an office or organisation pays and wants the invoice in its name.</p>'
    + '<label>Name of office or organisation<input type="text" id="pp-bn" maxlength="120" value="' + ppE(b.name) + '" oninput="ppKeepBill()"></label>'
    + '<label>Address<input type="text" id="pp-ba" maxlength="300" value="' + ppE(b.address) + '" oninput="ppKeepBill()"></label>'
    + '<label>GSTIN (optional)<input type="text" id="pp-bg" maxlength="15" autocapitalize="characters" value="' + ppE(b.gstin) + '" oninput="ppKeepBill()"></label><small id="pp-bgh" class="pp-hint"></small>'
    + '<label>State (optional)<select id="pp-bs" onchange="ppKeepBill()"><option value="">Automatic — from the GSTIN, your login or the facility</option>'
    + PP_STATES.map(function (x) { return '<option value="' + ppE(x[1]) + '"' + (b.state === x[1] ? ' selected' : '') + '>' + ppE(x[1]) + '</option>'; }).join('') + '</select></label>'
    + '<p class="pp-sm pp-l">The state decides the GST: Delhi = CGST 9% + SGST 9%, other states = IGST 18%.</p></details>';
}
function ppBillVal() { ppKeepBill(); var b = _ppBill || {}; return { name: (b.name || '').trim(), address: (b.address || '').trim(), gstin: (b.gstin || '').trim().toUpperCase(), state: b.state || '' }; }
// a message under the Pay button (stays until the next try), and the toast
function ppErr(m) { var e = document.getElementById('pp-err'); if (e) { e.textContent = m || ''; e.style.display = m ? 'block' : 'none'; } if (m) showToast(m, 'err'); }
var PP_BLOCKED = 'The payment window could not open. A browser extension (ad blocker) or your network may be blocking Razorpay. Try an Incognito window, another browser, or your phone.';

// a HealSol payment link
function ppLinkHTML(k) {
  var head = '<div class="pp-box"><span class="pp-k">Payment link · ' + ppE(k.id) + '</span><b class="pp-big">' + ppE(k.plan) + '</b><small>For ' + ppE(k.forName || '') + '</small>'
    + '<ul class="pp-fl">' + k.facs.map(function (f) { return '<li>' + ppE(f.name) + ' <small>(' + ppE(f.code) + ')</small></li>'; }).join('') + '</ul>' + ppAmt(k.base, k.gst, k.total) + '</div>';
  if (k.status === 'paid') return head + '<div class="pp-msg"><b>This link is paid</b><p>Receipt ' + ppE((k.paid || {}).receiptNo || '') + ' · tax invoice ' + ppE((k.paid || {}).invoiceNo || '') + '. The facilities are unlocked.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>';
  if (!k.open) return head + '<div class="pp-msg err"><b>This link is no longer open</b><p>' + (k.status === 'stopped' ? 'HealSol has stopped it.' : 'It has expired.') + ' Ask HealSol Academy for a new one.</p>' + ppAskLink('Ask for a new payment link') + '</div>';
  _pp.last = { link: k.id, total: k.total };
  var utr = k.utr && k.utr.status === 'pending' ? '<p class="pp-info">Your bank transfer (UTR ' + ppE(k.utr.utr) + ') is waiting for HealSol to confirm.</p>' : k.utr && k.utr.status === 'rejected' ? '<p class="pp-info err">HealSol could not match your bank transfer (UTR ' + ppE(k.utr.utr) + '): ' + ppE(k.utr.reason || '') + '</p>' : '';
  return head + (k.until ? '<p class="pp-sm">Open until ' + ppE(k.until) + '</p>' : '') + utr + ppMethods('pp-pmL') + ppBill(false)
    + '<div class="pp-acts"><button type="button" class="pp-b1" id="pp-go" onclick="ppPay(null,\'' + ppE(k.id) + '\')">Pay ' + ppM(k.total) + '</button><p class="pp-err" id="pp-err" role="alert"></p><p class="pp-sm">Receipt and GST invoice right after payment.</p></div>';
}

// ── paying ──
async function ppPay(codes, link) {
  if (_pp.busy) return;
  if (ppMethod() === 'bank') return ppProforma(codes, link);
  ppErr('');
  if (!link && (!codes || !codes.length)) { ppErr('Tick at least one facility.'); return; }
  var bill = ppBillVal(), billOn = !!(bill.name || bill.address || bill.gstin);
  if (billOn && (!bill.name || !bill.address)) { ppErr('For an invoice in another name, fill in both the name and the address — or leave all of it empty.'); return; }
  var gs = ppGstState(bill.gstin); if (gs && bill.state && gs !== bill.state) { ppErr('This GSTIN is registered in ' + gs + ', but the state chosen is ' + bill.state + '. Choose ' + gs + ', or set the state to Automatic.'); return; }
  if (typeof Razorpay === 'undefined') { try { await nfLoadScriptAny(['https://checkout.razorpay.com/v1/checkout.js'], function () { return typeof Razorpay !== 'undefined'; }); } catch (e) {} }
  if (typeof Razorpay === 'undefined') { ppErr(PP_BLOCKED); return; }
  var btn = document.getElementById('pp-go'), label = btn ? btn.textContent : ''; _pp.busy = true; if (btn) { btn.disabled = true; btn.textContent = 'Preparing payment…'; }
  var o;
  try { o = await nfCall('payOrder', link ? { link: link, billTo: billOn ? bill : null } : { codes: codes, billTo: billOn ? bill : null }); }
  catch (e) { ppErr(nfErrText(e)); _pp.busy = false; if (btn) { btn.disabled = false; btn.textContent = label; } return; }
  _pp.busy = false; if (btn) { btn.disabled = false; btn.textContent = label; }
  var rzp = new Razorpay({ key: o.keyId, order_id: o.orderId, amount: o.amount, currency: o.currency || 'INR', name: 'HealSol Academy', description: (o.label || 'NQAS | FAST programme') + ' (incl. 18% GST)',
    prefill: { name: (o.prefill || {}).name || '', contact: (o.prefill || {}).contact || '' }, notes: { facilities: String(o.n) }, theme: { color: '#1E6B5E' },
    handler: async function (resp) {
      ppShell('<div class="pp-empty">Payment received — confirming…</div>');
      try { var v = await nfCall('payVerify', { orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature }); _pp.done = { receipt: v.receipt, n: o.n }; ppGo('done'); }
      catch (e) { _pp.done = { pending: resp.razorpay_payment_id, n: o.n }; ppGo('done'); }
    }, modal: { ondismiss: function () {} } });
  if (rzp.on) rzp.on('payment.failed', function (r) { showToast('Payment failed' + (r && r.error && r.error.description ? ': ' + r.error.description : '') + '. No money was taken — you can try again.', 'err'); });
  rzp.open();
}
function ppDoneHTML() {
  var D = _pp.done || {};
  if (D.pending) return '<div class="pp-msg"><span class="pp-okc">' + PP_ICON.ok + '</span><b>Payment received</b><p>Your payment (' + ppE(D.pending) + ') was received. It is confirmed automatically within a few minutes — the facilities unlock then. If anything is still locked after an hour, send this payment ID to HealSol Academy.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>';
  if (D.utr) return '<div class="pp-msg"><span class="pp-okc">' + PP_ICON.ok + '</span><b>Thank you — HealSol will confirm</b><p>We have your UTR ' + ppE(D.utr) + '. HealSol checks it in the bank account, then the facilities unlock and the tax invoice is made. You can see it under Me → Payment receipts.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>';
  var r = D.receipt || {}, n = r.n || D.n || 1;
  return '<div class="pp-msg"><span class="pp-okc">' + PP_ICON.ok + '</span><b>Payment successful</b><p>' + (n > 1 ? n + ' facilities are' : ppE(r.facilityName || 'The facility') + ' is') + ' unlocked. Receipt ' + ppE(r.receiptNo || '') + (r.invoice ? ' · tax invoice ' + ppE(r.invoice.no) : '') + '.</p>'
    + '<div class="pp-acts">' + (r.invoice && typeof ivDownload === 'function' ? '<button type="button" class="pp-b1" onclick="ivDownload(ivDoc(\'tax\',_pp.done.receipt),this)">Download tax invoice (PDF)</button>' : '') + '<button type="button" class="pp-b2" onclick="ppClose();location.reload()">Back to the app</button></div></div>';
}

// ── bank transfer: proforma, then the UTR ──
async function ppProforma(codes, link) {
  var bill = ppBillVal();
  if (!bill.name || !bill.address) { var d = document.querySelector('#pp-ov .pp-bill'); if (d) d.open = true; ppErr('Fill in who the proforma invoice is addressed to: name and address.'); try { document.getElementById(bill.name ? 'pp-ba' : 'pp-bn').focus(); } catch (e) {} return; }
  if (!link && (!codes || !codes.length)) { ppErr('Tick at least one facility.'); return; }
  var gs = ppGstState(bill.gstin); if (gs && bill.state && gs !== bill.state) { ppErr('This GSTIN is registered in ' + gs + ', but the state chosen is ' + bill.state + '. Choose ' + gs + ', or set the state to Automatic.'); return; }
  var btn = document.getElementById('pp-go'), label = btn ? btn.textContent : ''; _pp.busy = true; if (btn) { btn.disabled = true; btn.textContent = 'Making the proforma…'; }
  try { var r = await nfCall('payProforma', link ? { link: link, billTo: bill } : { codes: codes, billTo: bill }); _pp.pf = r; ppGo('bank'); }
  catch (e) { ppErr(nfErrText(e)); }
  finally { _pp.busy = false; if (btn && document.body.contains(btn)) { btn.disabled = false; btn.textContent = label; } }
  try { if (typeof bpCfg === 'function') { await bpCfg(); if (_pp.view === 'bank') ppRender(); } } catch (e) {}
}
function ppPfDoc() {
  var r = _pp.pf || {}, p = r.proforma || {};
  return { kind: 'proforma', title: 'PROFORMA INVOICE', no: p.no, date: p.issuedAt, validTill: p.validTill, seller: p.seller, buyer: p.billTo, sac: p.sac, item: p.item, lines: p.lines, base: p.base, gst: p.gst, cgst: p.cgst, sgst: p.sgst, igst: p.igst, total: p.total,
    facility: (p.lines || []).length > 1 ? p.lines.length + ' facilities (listed below)' : ((p.lines || [])[0] || {}).name || '', place: '', note: 'This is a proforma invoice for approval and payment — it is not a tax invoice. Write ' + (p.no || '') + ' in the payment remarks. The tax invoice is issued when the payment is received.' };
}
function ppBankHTML() {
  var r = _pp.pf || {}, p = r.proforma || {}, c = (typeof _bp !== 'undefined' && _bp.cfg) || {}, kv = function (k, v) { return v ? '<div><span>' + ppE(k) + '</span><b>' + ppE(v) + '</b></div>' : ''; };
  return '<div class="pp-box"><span class="pp-k">Proforma invoice ' + ppE(p.no || '') + '</span><b class="pp-big">' + ppM(p.total) + '</b><small>Valid until ' + ppE(p.validTill || '') + ' · ' + ppE(((p.billTo || {}).name) || '') + '</small>'
    + '<div class="pp-acts row"><button type="button" class="pp-b2" onclick="ivDownload(ppPfDoc(),this)">Download PDF</button><button type="button" class="pp-b2" onclick="ivShow(ppPfDoc())">View</button></div></div>'
    + ((c.acc || c.upi) ? '<div class="pp-box"><span class="pp-k">Pay to</span><div class="pp-kv">' + kv('Name', c.payee) + kv('Bank', [c.bank, c.branch].filter(Boolean).join(', ')) + kv('Account no.', c.acc) + kv('IFSC', c.ifsc) + kv('UPI ID', c.upi) + kv('Payment remarks', p.no) + '</div></div>' : '')
    + '<div class="pp-box"><span class="pp-k">Already paid?</span><p class="pp-sm">Add the UTR / transaction ID from the bank. HealSol confirms it, then the facilities unlock.</p>'
    + '<label class="pp-fld">UTR / transaction ID<input type="text" id="pp-utr" maxlength="40" autocomplete="off"></label><label class="pp-fld">Paid on<input type="date" id="pp-utrd" value="' + ppToday() + '" max="' + ppToday() + '"></label>'
    + '<button type="button" class="pp-b1" id="pp-utrb" onclick="ppUtr()">Send the UTR to HealSol</button></div>'
    + '<p class="pp-sm">You can also come back later: the link stays open and HealSol sees the proforma.</p>';
}
async function ppUtr() {
  var u = (document.getElementById('pp-utr') || {}).value || '', d = (document.getElementById('pp-utrd') || {}).value || '', id = ((_pp.pf || {}).link || {}).id, btn = document.getElementById('pp-utrb');
  if (!u.trim()) { showToast('Enter the UTR / transaction ID.', 'err'); return; }
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  try { await nfCall('payUtr', { link: id, utr: u, paidOn: d }); _pp.done = { utr: u.toUpperCase().replace(/\s+/g, '') }; ppGo('done'); }
  catch (e) { showToast(nfErrText(e), 'err'); if (btn) { btn.disabled = false; btn.textContent = 'Send the UTR to HealSol'; } }
}

// ── "Ask for a payment link" (board 6) ──
function ppAskHTML() {
  var d = _pp.data || {}, facs = (d.facs || []), mine = facs.filter(function (f) { return f.status !== 'paid' && f.status !== 'active'; });
  if (!((d.me || {}).roles || []).length) return '<div class="pp-msg"><b>Log in as the person paying</b><p>A facility in-charge, District / Block, State or partner can ask for a payment link.</p><button type="button" class="pp-b2" onclick="ppClose()">Back to the app</button></div>';
  if (_pp.askSent) return '<div class="pp-msg"><span class="pp-okc">' + PP_ICON.ok + '</span><b>Request sent</b><p>HealSol Academy will make a plan and price for you and send the payment link on WhatsApp and by email.</p><button type="button" class="pp-b2" onclick="_pp.askSent=0;ppClose()">Back to the app</button></div>';
  var forH = mine.length <= 1 ? '<div class="pp-box"><span class="pp-k">For</span><b class="pp-big">' + ppE(mine[0] ? mine[0].name : (d.me.org || d.me.name || '')) + '</b></div>'
    : '<fieldset class="pp-ck"><legend>For which facilities?</legend>' + mine.map(function (f) { return '<label><input type="checkbox" value="' + ppE(f.code) + '"' + (_pp.sel[f.code] ? ' checked' : '') + ' name="pp-askf"> ' + ppE(f.name) + '</label>'; }).join('') + '</fieldset>';
  return '<p class="pp-lead">Tell us what you need. HealSol will make a plan and price for you and send a payment link.</p>' + forH
    + '<fieldset class="pp-ck"><legend>What would you like?</legend>' + (d.options || []).concat(['Something else']).map(function (o, i) { return '<label><input type="checkbox" name="pp-asko" value="' + ppE(o) + '"' + (i === 0 ? ' checked' : '') + '> ' + ppE(o) + '</label>'; }).join('') + '</fieldset>'
    + '<label class="pp-fld">Anything else we should know? (optional)<textarea id="pp-askn" rows="3" maxlength="600"></textarea></label>'
    + '<p class="pp-sm">We reply on WhatsApp and by email to the contact on your login.</p><div class="pp-acts"><button type="button" class="pp-b1" id="pp-askb" onclick="ppAsk()">Send request</button></div>';
}
async function ppAsk() {
  var d = _pp.data || {}, facs = (d.facs || []).filter(function (f) { return f.status !== 'paid' && f.status !== 'active'; });
  var codes = facs.length <= 1 ? facs.map(function (f) { return f.code; }) : Array.prototype.map.call(document.querySelectorAll('#pp-ov input[name=pp-askf]:checked'), function (x) { return x.value; });
  var opts = Array.prototype.map.call(document.querySelectorAll('#pp-ov input[name=pp-asko]:checked'), function (x) { return x.value; }), note = ((document.getElementById('pp-askn') || {}).value || '').trim();
  if (!opts.length && !note) { showToast('Tick what you would like, or write a note.', 'err'); return; }
  var btn = document.getElementById('pp-askb'); if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  try { await nfCall('payRequest', { codes: codes, options: opts, note: note }); _pp.askSent = 1; ppRender(); }
  catch (e) { showToast(nfErrText(e), 'err'); if (btn) { btn.disabled = false; btn.textContent = 'Send request'; } }
}

(function () {
  try { if (typeof jnPaintLogin === 'function' && !jnPaintLogin._pp) { var o = jnPaintLogin; jnPaintLogin = function () { var r = o.apply(this, arguments); try { ppPaintLogin(); } catch (e) {} return r; }; jnPaintLogin._pp = 1; } } catch (e) {}
  var go = function () { try { ppPaintLogin(); } catch (e) {} if (_pp.intent && !ppPlay()) ppWatch(); };
  if (document.readyState !== 'loading') go(); else document.addEventListener('DOMContentLoaded', go);
  // starting from the card also starts the watch
  var oS = ppStart; ppStart = function (x) { oS(x); if (_pp.intent && !document.getElementById('pp-ov')) ppWatch(); };
})();
