// ══════════════════════════════════════════════════════════════
// Pay by bank transfer / UPI (2 Nov 2026; HealSol: "I want both the options" — Razorpay and direct payment)
//   Settings → Pricing: UPI ID, QR, bank details, on / off (shared/sc_pay_config).
//   CHO, on the Unlock card: pays to HealSol directly, then sends the UTR (+ screenshot) → waits for HealSol (sc_manualpay).
//   HealSol, Business → Payments to confirm: Confirm (receipt + unlock, same as any payment) or Reject with a reason.
// ══════════════════════════════════════════════════════════════
var _bp = { cfg: null, list: null, loading: false };
// which facility is paying (3 Nov 2026): the Sub-Centre app (choState) or the UPHC / PHC / CHC app (window._payCtx = {code, fac, price, after})
function nfPayCode() { return (window._payCtx && _payCtx.code) || (typeof choState !== 'undefined' && choState && choState.facilityCode) || ''; }
function nfPayFac() { return (window._payCtx && _payCtx.fac) || (typeof choState !== 'undefined' && choState && choState.facility) || {}; }
function nfPayAfter() { try { if (window._payCtx && typeof _payCtx.after === 'function') return _payCtx.after(); if (typeof renderCard === 'function') renderCard(typeof window._scLastDi === 'number' ? window._scLastDi : 7); } catch (e) {} }
function bpE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function bpHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function bpT(en, hi) { return bpHi() && hi ? hi : en; }
async function bpCfg(force) { if (_bp.cfg && !force) return _bp.cfg; try { _bp.cfg = (await fbGet('shared/sc_pay_config')) || {}; } catch (e) { _bp.cfg = {}; } return _bp.cfg; }
function bpRef(code) { return 'NQ-' + String(code || '').replace(/[^A-Za-z0-9]/g, ''); }
function bpMoney(n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; }

// ── Settings → Pricing: the account HealSol is paid into ──
async function bpCfgRender() {
  var host = document.getElementById('pricing-list'); if (!host) return;
  var card = host.parentNode, box = document.getElementById('bp-cfg');
  if (!box) { box = document.createElement('div'); box.id = 'bp-cfg'; box.className = 'bp-cfg'; card.appendChild(box); }   // inside the Pricing card, so it shows only on Settings → Pricing
  var c = await bpCfg(true), f = function (k, l, ph, extra) { return '<label class="bp-l">' + l + '<input class="bp-i" id="bp-' + k + '" value="' + bpE(c[k] || '') + '" placeholder="' + bpE(ph || '') + '"' + (extra || '') + '></label>'; };
  box.innerHTML = '<div class="bp-h"><i class="ti ti-building-bank"></i> Bank transfer / UPI <span class="bp-tag' + (c.on ? ' on' : '') + '">' + (c.on ? 'On' : 'Off') + '</span></div>'
    + '<div class="bp-sub">A second way to pay, next to online payment: the facility pays to this account, sends the UTR, and you confirm it in Business → Payments to confirm. Shown only to signed-in facility in-charges.</div>'
    + '<label class="bp-chk"><input type="checkbox" id="bp-on"' + (c.on ? ' checked' : '') + '> Offer "Pay by bank transfer / UPI" to facilities</label>'
    + '<div class="bp-g">' + f('payee', 'Account name', 'HEALSOL HEALTHCARE PRIVATE LIMITED') + f('upi', 'UPI ID', 'e.g. healsol@icici') + f('bank', 'Bank name', 'e.g. ICICI Bank') + f('acc', 'Account number', '', ' inputmode="numeric"') + f('ifsc', 'IFSC', 'e.g. ICIC0001234', ' style="text-transform:uppercase"') + f('branch', 'Branch', '') + '</div>'
    + '<label class="bp-l">UPI QR code (image)<input type="file" accept="image/*" id="bp-qrf" onchange="bpQrPick(this)"></label>'
    + '<div id="bp-qrv">' + (c.qr ? '<img src="' + c.qr + '" alt="UPI QR" class="bp-qr"> <button type="button" class="hs-btn" onclick="_bp.cfg.qr=\'\';document.getElementById(\'bp-qrv\').innerHTML=\'\'">Remove</button>' : '') + '</div>'
    + '<button type="button" class="bp-save" onclick="bpCfgSave()"><i class="ti ti-device-floppy"></i> Save bank / UPI details</button>';
}
async function bpImg(file, max, q) {
  return new Promise(function (res, rej) {
    var r = new FileReader(); r.onerror = rej; r.onload = function () { var im = new Image(); im.onerror = rej; im.onload = function () {
      var s = Math.min(1, max / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * s); c.height = Math.round(im.height * s);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', q)); }; im.src = r.result; };
    r.readAsDataURL(file); });
}
async function bpQrPick(inp) { var f = inp.files && inp.files[0]; if (!f) return; try { var d = await bpImg(f, 600, 0.9); _bp.cfg.qr = d; document.getElementById('bp-qrv').innerHTML = '<img src="' + d + '" alt="UPI QR" class="bp-qr">'; } catch (e) { showToast('Could not read this image.', 'err'); } }
async function bpCfgSave() {
  var v = function (k) { return ((document.getElementById('bp-' + k) || {}).value || '').trim(); }, on = !!(document.getElementById('bp-on') || {}).checked;
  var c = { on: on, payee: v('payee'), upi: v('upi'), bank: v('bank'), acc: v('acc').replace(/\s+/g, ''), ifsc: v('ifsc').toUpperCase(), branch: v('branch'), qr: (_bp.cfg && _bp.cfg.qr) || '', at: new Date().toISOString() };
  if (on && !c.upi && !c.acc) { showToast('Add a UPI ID or a bank account before switching it on.', 'err'); return; }
  if (c.upi && !/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(c.upi)) { showToast('The UPI ID looks wrong — it should look like name@bank.', 'err'); return; }
  if (c.ifsc && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(c.ifsc)) { showToast('The IFSC looks wrong — 11 characters, like ICIC0001234.', 'err'); return; }
  var ok = await fbSet('shared/sc_pay_config', c); if (ok === false) return;
  _bp.cfg = c; showToast('Bank / UPI details saved' + (on ? ' — facilities can now pay this way.' : ' (switched off).'), 'ok'); bpCfgRender();
}
(function () { if (typeof adminRenderPricingPanel !== 'function') return; var o = adminRenderPricingPanel;
  adminRenderPricingPanel = async function () { var r = await o.apply(this, arguments); try { await bpCfgRender(); } catch (e) { console.warn('[bankpay] cfg', e); } return r; }; })();

// ── CHO: the Unlock card gets "Pay by bank transfer / UPI" ──
async function bpMine(code) { try { return (await fbGet('sc_manualpay/' + code)) || {}; } catch (e) { return {}; } }
function bpLatest(M) { var k = Object.keys(M || {}).sort(function (a, b) { return String((M[b] || {}).at).localeCompare(String((M[a] || {}).at)); })[0]; return k ? Object.assign({ _k: k }, M[k]) : null; }
async function bpUpgradeExtra(container) {
  var body = container && container.querySelector('.upgrade-body'); if (!body || body.querySelector('.bp-box')) return;
  var code = nfPayCode(); if (!code) return;
  var c = await bpCfg(), last = bpLatest(await bpMine(code)), box = document.createElement('div'); box.className = 'bp-box';
  var payBtn = document.getElementById('upgrade-pay-btn');
  if (last && last.status === 'pending') {
    box.innerHTML = '<div class="bp-wait"><b>🕐 ' + bpE(bpT('Payment submitted — waiting for HealSol to confirm', 'भुगतान भेजा गया — HealSol की पुष्टि की प्रतीक्षा')) + '</b><small>' + bpE(last.method) + ' · ' + bpMoney(last.total) + ' · UTR ' + bpE(last.utr) + '</small><small>' + bpE(bpT('Usually within 1–2 working days. Your programme unlocks as soon as it is confirmed.', 'आमतौर पर 1–2 कार्य-दिवस में। पुष्टि होते ही कार्यक्रम खुल जाएगा।')) + '</small></div>';
    if (payBtn) payBtn.style.display = 'none';
  } else if (c.on && (c.upi || c.acc)) {
    box.innerHTML = (last && last.status === 'rejected' ? '<div class="bp-rej"><b>✋ ' + bpE(bpT('Your last bank / UPI payment could not be confirmed', 'आपका पिछला बैंक / UPI भुगतान पुष्ट नहीं हो सका')) + '</b><small>' + bpE(last.reason || '') + '</small></div>' : '')
      + '<div class="bp-or"><span></span><b>' + bpE(bpT('or', 'या')) + '</b><span></span></div>'
      + '<button type="button" class="bp-alt" onclick="bpOpen()"><i class="ti ti-building-bank"></i> ' + bpE(bpT('Pay by bank transfer / UPI', 'बैंक ट्रांसफ़र / UPI से भुगतान करें')) + '</button>';
  } else return;
  body.appendChild(box);
}
(function () { if (typeof renderUpgradeCard !== 'function') return; var o = renderUpgradeCard;
  renderUpgradeCard = async function (container) { var r = await o.apply(this, arguments); try { await bpUpgradeExtra(container); } catch (e) { console.warn('[bankpay] card', e); } return r; }; })();

function bpTotal() { if (window._payCtx && _payCtx.price) return { base: _payCtx.price.base, gst: _payCtx.price.gst, total: _payCtx.price.total }; var base = Object.values(typeof _upgradeSelected !== 'undefined' ? _upgradeSelected : {}).reduce(function (a, b) { return a + Number(b || 0); }, 0); return typeof nfWithGst === 'function' ? nfWithGst(base) : { base: base, gst: Math.round(base * 18) / 100, total: Math.round(base * 118) / 100 }; }
function bpCopy(t) { if (typeof nfCopyText === 'function') nfCopyText(t); else { try { navigator.clipboard.writeText(t); showToast('Copied', 'ok'); } catch (e) {} } }
async function bpOpen() {
  var c = await bpCfg(), code = nfPayCode(), g = bpTotal(), ref = bpRef(code), hi = bpHi();
  var row = function (l, v) { return v ? '<div class="bp-r"><small>' + bpE(l) + '</small><b>' + bpE(v) + '</b><button type="button" onclick="bpCopy(\'' + bpE(v) + '\')" aria-label="Copy ' + bpE(l) + '"><i class="ti ti-copy"></i></button></div>' : ''; };
  var upiLink = c.upi ? 'upi://pay?pa=' + encodeURIComponent(c.upi) + '&pn=' + encodeURIComponent(c.payee || 'HealSol Healthcare') + '&am=' + g.total.toFixed(2) + '&cu=INR&tn=' + encodeURIComponent(ref) : '';
  var ov = document.createElement('div'); ov.className = 'scx-ov open'; ov.id = 'bp-ov';
  ov.innerHTML = '<div class="scx-box bp-sheet"><div class="nfcf-head"><span style="font-size:22px;">🏦</span><div style="flex:1;"><b>' + bpE(bpT('Pay by bank transfer / UPI', 'बैंक ट्रांसफ़र / UPI से भुगतान')) + '</b><div style="font-size:11.5px;color:var(--t3);">' + bpE(bpT('Pay first, then send us the UTR below.', 'पहले भुगतान करें, फिर नीचे UTR भेजें।')) + '</div></div></div>'
    + '<div class="bp-amt"><small>' + bpE(bpT('Amount to pay', 'भुगतान राशि')) + '</small><b>' + bpMoney(g.total) + '</b><span>' + bpMoney(g.base) + ' + GST 18% ' + bpMoney(g.gst) + '</span></div>'
    + '<div class="bp-ref">' + bpE(bpT('Write this in the UPI note / bank remarks:', 'UPI नोट / बैंक रिमार्क में यह लिखें:')) + ' <b>' + bpE(ref) + '</b> <button type="button" onclick="bpCopy(\'' + bpE(ref) + '\')"><i class="ti ti-copy"></i></button></div>'
    + (c.upi ? '<div class="bp-sec"><div class="bp-k">UPI</div>' + (c.qr ? '<img src="' + c.qr + '" class="bp-qr" alt="UPI QR code">' : '') + row('UPI ID', c.upi)
      + '<a class="bp-upi" href="' + upiLink + '"><i class="ti ti-device-mobile"></i> ' + bpE(bpT('Open my UPI app', 'मेरा UPI ऐप खोलें')) + '</a></div>' : '')
    + (c.acc ? '<div class="bp-sec"><div class="bp-k">' + bpE(bpT('Bank transfer (NEFT / IMPS / RTGS)', 'बैंक ट्रांसफ़र (NEFT / IMPS / RTGS)')) + '</div>' + row(bpT('Account name', 'खाता नाम'), c.payee) + row(bpT('Account number', 'खाता संख्या'), c.acc) + row('IFSC', c.ifsc) + row(bpT('Bank', 'बैंक'), [c.bank, c.branch].filter(Boolean).join(', ')) + '</div>' : '')
    + '<div class="bp-sec"><div class="bp-k">' + bpE(bpT('After paying', 'भुगतान के बाद')) + '</div>'
    + '<label class="bp-l">' + bpE(bpT('Paid by', 'भुगतान का तरीका')) + '<select class="bp-i" id="bp-m">' + (c.upi ? '<option value="upi">UPI</option>' : '') + (c.acc ? '<option value="bank">' + bpE(bpT('Bank transfer', 'बैंक ट्रांसफ़र')) + '</option>' : '') + '</select></label>'
    + '<label class="bp-l">' + bpE(bpT('UTR / transaction ID *', 'UTR / ट्रांज़ैक्शन ID *')) + '<input class="bp-i" id="bp-utr" autocapitalize="characters" placeholder="e.g. 428712345678"></label>'
    + '<label class="bp-l">' + bpE(bpT('Payment date', 'भुगतान तिथि')) + '<input class="bp-i" type="date" id="bp-d" value="' + (typeof scTodayStr === 'function' ? scTodayStr() : '') + '"></label>'
    + '<label class="bp-l">' + bpE(bpT('Screenshot of the payment (optional)', 'भुगतान का स्क्रीनशॉट (वैकल्पिक)')) + '<input type="file" accept="image/*" id="bp-f"></label>'
    + '<div class="nf-mp-err" id="bp-err" style="display:none"></div></div>'
    + '<div class="nf-tmp-acts"><button class="scx-btn ghost" onclick="document.getElementById(\'bp-ov\').remove()">' + bpE(bpT('Cancel', 'रद्द करें')) + '</button><button class="scx-btn" id="bp-go" onclick="bpSend()">' + bpE(bpT('I have paid — send', 'भुगतान कर दिया — भेजें')) + '</button></div></div>';
  document.body.appendChild(ov);
}
async function bpSend() {
  var err = document.getElementById('bp-err'), show = function (m) { if (err) { err.textContent = m; err.style.display = m ? 'block' : 'none'; } };
  var utr = ((document.getElementById('bp-utr') || {}).value || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^[A-Z0-9]{6,40}$/.test(utr)) return show(bpT('Enter the UTR / transaction ID from your payment (letters and numbers, at least 6).', 'अपने भुगतान का UTR / ट्रांज़ैक्शन ID लिखें (कम से कम 6 अक्षर / अंक)।'));
  var img = null, f = (document.getElementById('bp-f') || {}).files; if (f && f[0]) { try { img = await bpImg(f[0], 1100, 0.7); } catch (e) {} }
  var b = document.getElementById('bp-go'); if (b) { b.disabled = true; b.textContent = bpT('Sending…', 'भेजा जा रहा है…'); }
  try {
    await nfCall('submitBankPayment', { code: nfPayCode(), utr: utr, method: (document.getElementById('bp-m') || {}).value || 'upi', paidOn: (document.getElementById('bp-d') || {}).value || '', img: img });
    var ov = document.getElementById('bp-ov'); if (ov) ov.remove();
    showToast(bpT('Payment sent to HealSol for confirmation.', 'भुगतान पुष्टि के लिए HealSol को भेजा गया।'), 'ok');
    nfPayAfter();
  } catch (e) { show(typeof nfErrText === 'function' ? nfErrText(e) : String(e.message || e)); if (b) { b.disabled = false; b.textContent = bpT('I have paid — send', 'भुगतान कर दिया — भेजें'); } }
}

// ── HealSol: Business → Payments to confirm ──
async function bpLoad(force) { if (_bp.list && !force) return _bp.list; try { _bp.list = (await fbGet('sc_manualpay')) || {}; } catch (e) { _bp.list = {}; } return _bp.list; }
function bpRows() { var A = _bp.list || {}, out = []; Object.keys(A).forEach(function (code) { var M = A[code] || {}; Object.keys(M).forEach(function (id) { out.push(Object.assign({ _code: code, _id: id }, M[id])); }); });
  return out.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }); }
function bpPending() { return bpRows().filter(function (x) { return x.status === 'pending'; }); }
function bpHTML() {
  var R = bpRows(), P = R.filter(function (x) { return x.status === 'pending'; }), done = R.filter(function (x) { return x.status !== 'pending'; }).slice(0, 8);
  var row = function (x) {
    var st = x.status === 'confirmed' ? '<span class="eq-st g">Confirmed · ' + bpE(x.receiptNo || '') + '</span>' : x.status === 'rejected' ? '<span class="eq-st n">Rejected</span>' : '<span class="eq-st a">Waiting for you</span>';
    var J = function (s) { return String(s).replace(/'/g, "\\'"); }, k = "'" + J(x._code) + "','" + J(x._id) + "'";
    var acts = x.status === 'pending' ? '<button type="button" class="eq-btn p" onclick="bpReview(' + k + ',\'confirm\')">Confirm received</button><button type="button" class="eq-btn x" onclick="bpReview(' + k + ',\'reject\')">Reject</button>' : '';
    if (x.img) acts += '<button type="button" class="eq-btn" onclick="bpProof(\'' + J(x._id) + '\')">Screenshot</button>';
    if (x.by) acts += '<button type="button" class="eq-btn wa" onclick="bpWa(' + k + ')">WhatsApp</button>';
    return '<div class="eq-r"><div class="eq-c1"><span class="eq-kind t">' + bpE(x.method) + '</span><small>' + bpE(typeof nfEqWhen === 'function' ? nfEqWhen(x.at) : x.at) + '</small></div>'
      + '<div class="eq-c2"><b>' + bpE(x.facilityName || x._code) + ' <i>· ' + bpE(x._code) + '</i></b><small>' + bpMoney(x.total) + ' (' + bpMoney(x.base) + ' + GST) · ' + bpE(x.packageLabel || '') + '</small><small class="eq-b">UTR ' + bpE(x.utr) + ' · paid on ' + bpE(x.paidOn) + ' · ref ' + bpE(bpRef(x._code)) + '</small>' + (x.reason ? '<small class="eq-m">' + bpE(x.reason) + '</small>' : '') + '</div>'
      + '<div class="eq-c3">' + st + '</div><div class="eq-c4">' + acts + '</div></div>'; };
  return '<div class="nfo-card eq" id="bp-list"><div class="eq-head"><div><b>Payments to confirm</b><small>' + P.length + ' waiting · bank transfer / UPI — check the amount and UTR in your bank account, then confirm</small></div><div class="eq-hr"><button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh payments" onclick="bpRefresh()"><i class="ti ti-refresh"></i></button></div></div>'
    + '<div class="eq-list">' + (P.length ? P.map(row).join('') : '<div class="eq-empty">Nothing waiting — no bank / UPI payments to confirm.</div>') + '</div>'
    + (done.length ? '<div class="bp-k" style="margin:12px 0 6px">Recently reviewed</div><div class="eq-list">' + done.map(row).join('') + '</div>' : '') + '</div>';
}
async function bpRefresh() { await bpLoad(true); var el = document.getElementById('bp-list'); if (el) el.outerHTML = bpHTML(); }
async function bpProof(id) { var d = null; try { d = await fbGet('sc_payproof/' + id); } catch (e) {} if (!d) { showToast('Screenshot not found.', 'err'); return; }
  var ov = document.createElement('div'); ov.className = 'scx-ov open'; ov.onclick = function () { ov.remove(); }; ov.innerHTML = '<div class="scx-box" style="max-width:520px"><img src="' + d + '" alt="Payment screenshot" style="width:100%;border-radius:10px"></div>'; document.body.appendChild(ov); }
var BP_REASONS = [['notreceived', 'Payment not received in our account yet'], ['amount', 'Amount does not match the package amount'], ['utr', 'UTR does not match any payment received'], ['duplicate', 'Payment already used for another facility'], ['other', 'Other (write it below)']];
async function bpReview(code, id, action) {
  var x = ((_bp.list || {})[code] || {})[id]; if (!x) return; var data = { code: code, id: id, action: action };
  if (action === 'reject') {
    var v = await scDialog({ title: 'Reject this payment?', icon: '✋', okLabel: 'Reject', message: (x.facilityName || code) + ' · ' + bpMoney(x.total) + ' · UTR ' + x.utr + '\n\nThe in-charge sees the reason and can send the payment again.',
      fields: [{ key: 'reason', label: 'Reason (shown to the facility)', type: 'select', value: 'notreceived', options: BP_REASONS.map(function (r) { return { value: r[0], label: r[1] }; }) }, { key: 'note', label: 'If Other: the reason in a few words', value: '' }] });
    if (!v) return; data.reason = v.reason; data.note = String(v.note || '').trim(); if (v.reason === 'other' && !data.note) { showToast('Write the reason in a few words.', 'err'); return; }
  } else {
    var ok = await scDialog({ title: 'Confirm payment received?', icon: '✅', okLabel: 'Confirm & unlock', message: (x.facilityName || code) + ' (' + code + ')\n' + bpMoney(x.total) + ' by ' + x.method + ' · UTR ' + x.utr + ' · ' + x.paidOn + '\n\nOnly confirm after you have seen this amount and UTR in the bank account. This unlocks the programme and issues a receipt.' });
    if (!ok) return;
  }
  try {
    var r = await nfCall('reviewBankPayment', data); await bpRefresh();
    try { if (typeof scRefreshDashboard === 'function') scRefreshDashboard(); } catch (e) {}
    if (r.status === 'confirmed') { showToast('Confirmed — ' + r.receipt.receiptNo, 'ok'); if (x.by && typeof nfEqWaPrompt === 'function') setTimeout(function () { nfEqWaPrompt('Let the facility know', x.by, bpWaText(code, Object.assign({}, x, { status: 'confirmed', receiptNo: r.receipt.receiptNo }))); }, 300); }
    else { showToast('Rejected.', 'ok'); var y = ((_bp.list || {})[code] || {})[id] || x; if (x.by && typeof nfEqWaPrompt === 'function') setTimeout(function () { nfEqWaPrompt('Let the facility know', x.by, bpWaText(code, y)); }, 300); }
  } catch (e) { showToast(typeof nfErrText === 'function' ? nfErrText(e) : 'Could not save.', 'err'); }
}
function bpWaText(code, x) {
  if (x.status === 'confirmed') return 'Namaste ji, ✅\nWe have received your payment of ' + bpMoney(x.total) + ' (UTR ' + x.utr + ') for ' + (x.facilityName || code) + '. Your NQAS | FAST programme is now unlocked. Receipt: ' + (x.receiptNo || '') + ' (Me → Payment receipts).\n— HealSol Academy';
  if (x.status === 'rejected') return 'Namaste ji,\nWe could not confirm your payment of ' + bpMoney(x.total) + ' (UTR ' + x.utr + ') for ' + (x.facilityName || code) + (x.reason ? ': ' + x.reason : '') + '\nPlease check and send it again from the app, or reply here.\n— HealSol Academy';
  return 'Namaste ji,\nThank you for your payment of ' + bpMoney(x.total) + ' (UTR ' + x.utr + ') for ' + (x.facilityName || code) + '. We are checking it with our bank and will confirm soon.\n— HealSol Academy';
}
function bpWa(code, id) { var x = ((_bp.list || {})[code] || {})[id]; if (x && typeof nfEqWaPrompt === 'function') nfEqWaPrompt('WhatsApp the facility', x.by, bpWaText(code, x)); }
(function () { if (typeof nfRenderBizDash !== 'function') return; var o = nfRenderBizDash;
  nfRenderBizDash = async function () { var r = await o.apply(this, arguments);
    try { await bpLoad(true); var box = document.getElementById('nf-biz'), eq = document.getElementById('nf-eq'); if (box && !document.getElementById('bp-list')) { var w = document.createElement('div'); w.innerHTML = bpHTML(); if (eq) eq.insertAdjacentElement('afterend', w.firstChild); else box.insertBefore(w.firstChild, box.firstChild); } } catch (e) { console.warn('[bankpay] biz', e); }
    return r; }; })();
// Today: "N payments to confirm"
(function () { if (typeof hsTodo !== 'function') return; var o = hsTodo;
  hsTodo = function () { var out = o.apply(this, arguments);
    try { if (!_bp.list) { if (!_bp.loading) { _bp.loading = true; bpLoad().then(function () { try { if (_nfOv.view === 'today') hsRenderToday(); } catch (e) {} }); } return out; }
      var n = bpPending().length; if (n) out.unshift({ key: 'bankpay', lvl: 'red', raw: 1, t: '<b>' + n + ' bank / UPI payment' + (n === 1 ? '' : 's') + ' to confirm</b>', sub: 'Business → Payments to confirm', btn: { l: 'Open', js: "nfAdminView('business');setTimeout(function(){var e=document.getElementById('bp-list');e&&e.scrollIntoView({behavior:'smooth'})},700)", p: 1 } }); } catch (e) {}
    return out; }; })();
