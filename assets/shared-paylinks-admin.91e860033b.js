// ── HealSol: Payments → Payment links (18 Nov 2026) — server: functions/paylinks.js ─────────────────────────
// New "Ask for a payment link" requests, making a link with HealSol's own plan and price for one or more facilities,
// the links sent (Open / UTR to check / Paid / Stopped / Expired), confirming a bank transfer, and the ticks people see.
var _pla = { links: null, reqs: null, opts: null, f: { codes: [], plan: '', price: '', until: '', forName: '', reqId: '' } };
function plaE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s).replace(/[&<>"']/g, ''); }
function plaM(n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; }
function plaToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function plaWhen(iso) { try { var d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return String(iso || '').slice(0, 16); } }
async function plaLoad() {
  try { _pla.links = (await fbGet('sc_paylinks')) || {}; } catch (e) { _pla.links = {}; }
  try { _pla.reqs = (await fbGet('sc_payreqs')) || {}; } catch (e) { _pla.reqs = {}; }
  try { var o = await fbGet('shared/sc_payreq_options'); _pla.opts = o && o.list ? o.list : null; } catch (e) { _pla.opts = null; }
}
function plaNewReqs() { var R = _pla.reqs || {}; return Object.keys(R).filter(function (k) { return R[k] && R[k].status === 'new'; }).sort().reverse().map(function (k) { return Object.assign({ _id: k }, R[k]); }); }
function plaState(k) {
  if (k.status === 'paid') return ['Paid', 'ok'];
  if (k.status === 'stopped') return ['Stopped', 'off'];
  if (k.until && k.until < plaToday()) return ['Expired', 'off'];
  if (k.utr && k.utr.status === 'pending') return ['UTR to check', 'warn'];
  if (k.proforma) return ['Proforma sent · not paid', 'warn'];
  return ['Sent · not paid', 'warn'];
}
function plaRows() { var L = _pla.links || {}; return Object.keys(L).map(function (k) { return L[k]; }).filter(Boolean).sort(function (a, b) { return String(b.createdAt || '').localeCompare(String(a.createdAt || '')); }); }
function plaCounts() { var n = plaNewReqs().length, u = plaRows().filter(function (k) { return k.status === 'open' && k.utr && k.utr.status === 'pending'; }).length; return { reqs: n, utr: u, all: n + u }; }
function plaFacName(c) { var f = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities[c]) || {}; return f.name || c; }
function plaOptsList() { return _pla.opts && _pla.opts.length ? _pla.opts : ['Full programme for my facility', 'A longer programme', 'Several facilities together', 'Extra support visits or training']; }
function plaHTML() {
  var R = plaNewReqs(), F = _pla.f, base = Number(F.price) || 0, gst = Math.round(base * 18) / 100, tot = Math.round((base + gst) * 100) / 100;
  var facs = typeof scMasterFacilities !== 'undefined' ? scMasterFacilities : {};
  var dl = '<datalist id="pla-dl">' + Object.keys(facs).filter(function (c) { return facs[c] && !facs[c].migratedTo; }).slice(0, 3000).map(function (c) { return '<option value="' + plaE(c) + '">' + plaE((facs[c].name || c) + ' · ' + (facs[c].district || '')) + '</option>'; }).join('') + '</datalist>';
  var reqs = '<div class="pla-col"><b class="pla-h">New requests (' + R.length + ')</b>' + (R.length ? R.map(function (r) {
    var cs = Object.keys(r.codes || {});
    return '<div class="pla-req"><b>' + plaE(r.org || r.name || 'Request') + '</b><small>' + plaE([r.name, ({ incharge: 'In-charge', district: 'District', block: 'Block', state: 'State', donor: 'Partner' })[r.role] || r.role, r.mobile].filter(Boolean).join(' · ')) + ' · ' + plaE(plaWhen(r.at)) + '</small>'
      + (cs.length ? '<span>' + plaE(cs.length + ' facilit' + (cs.length > 1 ? 'ies' : 'y') + ': ' + cs.map(function (c) { return r.codes[c]; }).slice(0, 6).join(', ') + (cs.length > 6 ? '…' : '')) + '</span>' : '')
      + ((r.options || []).length ? '<span>' + plaE(r.options.join(' · ')) + '</span>' : '') + (r.note ? '<span class="pla-q">“' + plaE(r.note) + '”</span>' : '')
      + '<div class="pla-ra"><button type="button" class="hs-btn p" onclick="plaFromReq(\'' + plaE(r._id) + '\')">Make link</button><button type="button" class="hs-btn" onclick="plaReqDone(\'' + plaE(r._id) + '\')">Done</button></div></div>'; }).join('')
    : '<p class="pla-p">No new requests. People ask from the payment page: “Need a different plan? Ask for a payment link”.</p>') + '</div>';
  var form = '<div class="pla-form"><b class="pla-h">Make a payment link</b>' + dl
    + '<div class="pla-fld"><label for="pla-add">Facilities</label><div class="pla-chips">' + F.codes.map(function (c) { return '<span class="pla-chip">' + plaE(plaFacName(c)) + ' <small>' + plaE(c) + '</small><button type="button" aria-label="Remove ' + plaE(plaFacName(c)) + '" onclick="plaDrop(\'' + plaE(c) + '\')">×</button></span>'; }).join('')
    + '</div><div class="pla-addr"><input type="text" id="pla-add" list="pla-dl" placeholder="Type a facility ID or pick from the list" autocomplete="off" onkeydown="if(event.key===\'Enter\'){event.preventDefault();plaAdd();}"><button type="button" class="hs-btn" onclick="plaAdd()">Add</button></div></div>'
    + '<div class="pla-g">'
    + '<label class="pla-fld">Plan name (shown to payer)<input type="text" id="pla-plan" maxlength="120" value="' + plaE(F.plan) + '" placeholder="e.g. Full programme · 6 months" oninput="_pla.f.plan=this.value"></label>'
    + '<label class="pla-fld">Shown as “For” (optional)<input type="text" id="pla-for" maxlength="120" value="' + plaE(F.forName) + '" placeholder="e.g. Jhansi district" oninput="_pla.f.forName=this.value"></label>'
    + '<label class="pla-fld">Price before GST (₹), all facilities together<input type="number" id="pla-price" min="1" step="0.01" value="' + plaE(F.price) + '" oninput="_pla.f.price=this.value;plaTot()"></label>'
    + '<label class="pla-fld">Link valid until (optional)<input type="date" id="pla-until" min="' + plaToday() + '" value="' + plaE(F.until) + '" oninput="_pla.f.until=this.value"></label></div>'
    + '<p class="pla-p">Who can pay: the facility\'s in-charge, or the District / Block / State / partner that covers it — after logging in on the website.</p>'
    + '<div class="pla-go"><button type="button" class="hs-btn p lg" onclick="plaCreate(this)">Create link and copy WhatsApp message</button><span id="pla-tot">' + (base ? 'Total with GST: <b>' + plaM(tot) + '</b>' : '') + '</span></div></div>';
  var rows = plaRows();
  var table = rows.length ? '<div class="pla-tw"><table class="pla-t"><thead><tr><th>Link</th><th>For</th><th>Plan</th><th>Total</th><th>Status</th><th><span class="tc-sr">Actions</span></th></tr></thead><tbody>' + rows.map(function (k) {
    var s = plaState(k), live = s[1] !== 'off' && k.status !== 'paid', id = plaE(k.id), n = Object.keys(k.codes || {}).length;
    return '<tr><td data-l="Link"><b class="tc-code">' + id + '</b><small>' + plaE(k.kind === 'custom' ? 'HealSol' : 'Proforma by payer') + ' · ' + plaE(plaWhen(k.createdAt)) + '</small></td><td data-l="For">' + plaE(k.forName || '') + '<small>' + n + ' facilit' + (n > 1 ? 'ies' : 'y') + '</small></td><td data-l="Plan">' + plaE(k.plan) + (k.proforma ? '<small>' + plaE(k.proforma.no) + '</small>' : '') + '</td><td data-l="Total"><b>' + plaM(k.total) + '</b></td>'
      + '<td data-l="Status"><span class="tc-st ' + s[1] + '">' + plaE(s[0]) + '</span>' + (k.utr && k.utr.status === 'pending' ? '<small>UTR ' + plaE(k.utr.utr) + ' · ' + plaE(k.utr.paidOn) + '</small>' : '') + (k.paid ? '<small>' + plaE(k.paid.receiptNo) + ' · ' + plaE(k.paid.invoiceNo) + '</small>' : '') + '</td>'
      + '<td class="pla-act"><div class="tc-acts">' + (live ? '<button type="button" class="hs-btn" onclick="plaCopy(\'' + id + '\')">Copy message</button><button type="button" class="hs-btn" onclick="plaConfirm(\'' + id + '\')">' + (k.utr && k.utr.status === 'pending' ? 'Confirm UTR' : 'Record payment') + '</button>' : '')
      + (live && k.utr && k.utr.status === 'pending' ? '<button type="button" class="hs-btn" onclick="plaReject(\'' + id + '\')">Reject UTR</button>' : '') + (live ? '<button type="button" class="hs-btn" onclick="plaStop(\'' + id + '\')">Stop</button>' : '')
      + (k.status === 'paid' ? '<button type="button" class="hs-btn" onclick="plaInvoice(\'' + id + '\',this)">Invoice</button>' : '') + '</div></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="pla-p">No links yet.</p>';
  var opts = '<details class="pla-opts"><summary>Ticks people see on “Ask for a payment link”</summary><p class="pla-p">One per line, up to 12. “Something else” is always added at the end.</p><textarea id="pla-opts" rows="5">' + plaE(plaOptsList().join('\n')) + '</textarea><button type="button" class="hs-btn" onclick="plaSaveOpts(this)">Save ticks</button></details>';
  return '<p class="hsp-note">Payment links: your own plan and price for one or more facilities. Payers open the link on the website, log in and pay online or by bank transfer — it unlocks the facilities and makes one GST invoice. Payments are never taken in the Qi FAST app.</p>'
    + '<div class="pla-top">' + reqs + form + '</div><div class="nfo-card pla-links"><b class="pla-h">Links</b>' + table + '</div>' + opts;
}
function plaTot() { var b = Number(_pla.f.price) || 0, t = Math.round(b * 118) / 100, e = document.getElementById('pla-tot'); if (e) e.innerHTML = b ? 'Total with GST: <b>' + plaM(t) + '</b>' : ''; }
function plaPaint() { var b = document.querySelector('#hs-payv .hsp-body'); if (b && _pp_plaOn()) b.innerHTML = plaHTML(); }
function _pp_plaOn() { return typeof _hsp !== 'undefined' && _hsp.pt === 'links'; }
function plaAdd() {
  var i = document.getElementById('pla-add'), v = ((i || {}).value || '').trim(); if (!v) return;
  var facs = typeof scMasterFacilities !== 'undefined' ? scMasterFacilities : {}, code = facs[v] ? v : Object.keys(facs).find(function (c) { return String((facs[c] || {}).name || '').toLowerCase() === v.toLowerCase(); });
  if (!code) { showToast('No facility with that ID or name.', 'err'); return; }
  if (_pla.f.codes.indexOf(code) < 0) _pla.f.codes.push(code); plaPaint(); try { document.getElementById('pla-add').focus(); } catch (e) {}
}
function plaDrop(c) { _pla.f.codes = _pla.f.codes.filter(function (x) { return x !== c; }); plaPaint(); }
function plaFromReq(id) {
  var r = (_pla.reqs || {})[id] || {}; _pla.f = { codes: Object.keys(r.codes || {}), plan: '', price: '', until: '', forName: r.org || r.name || '', reqId: id }; plaPaint();
  try { document.getElementById('pla-plan').focus(); document.querySelector('.pla-form').scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
}
async function plaReqDone(id) { try { await nfCall('payReqDone', { id: id }); if (_pla.reqs[id]) _pla.reqs[id].status = 'done'; plaPaint(); plaBadge(); } catch (e) { showToast(nfErrText(e), 'err'); } }
function plaMsg(k) {
  return 'Payment link — NQAS | FAST' + (k.forName ? '\nFor: ' + k.forName : '') + '\nPlan: ' + k.plan + '\nAmount: ' + plaM(k.total) + ' (incl. 18% GST)' + (k.until ? '\nOpen until: ' + k.until : '')
    + '\n\nPay here: ' + location.origin + '/pay/?l=' + k.id + '\nLog in with your NQAS | FAST login (facility in-charge, District / Block, State or partner). On a phone, open the link in Chrome; or use a laptop.'
    + '\n\nHealSol Academy · info@thehealsol.com';
}
function plaCopy(id) { var k = (_pla.links || {})[id]; if (!k) return; var m = plaMsg(k); try { if (typeof nfCopyText === 'function') nfCopyText(m); else navigator.clipboard.writeText(m); showToast('Message with the link copied — paste it in WhatsApp or email.', 'ok'); } catch (e) { window.prompt('Copy this message:', m); } }
async function plaCreate(btn) {
  var F = _pla.f; F.plan = (document.getElementById('pla-plan') || {}).value || F.plan; F.price = (document.getElementById('pla-price') || {}).value || F.price;
  if (!F.codes.length) { showToast('Add at least one facility.', 'err'); return; }
  if (!String(F.plan).trim()) { showToast('Write the plan name the payer will see.', 'err'); return; }
  if (!(Number(F.price) > 0)) { showToast('Enter the price before GST.', 'err'); return; }
  if (btn) btn.disabled = true;
  try { var r = await nfCall('payLinkCreate', { codes: F.codes, plan: F.plan, price: Number(F.price), until: F.until || '', forName: F.forName || '', reqId: F.reqId || '' });
    await plaLoad(); _pla.f = { codes: [], plan: '', price: '', until: '', forName: '', reqId: '' }; plaPaint(); plaBadge(); plaCopy(r.link.id); }
  catch (e) { showToast(nfErrText(e), 'err'); }
  finally { if (btn) btn.disabled = false; }
}
async function plaConfirm(id) {
  var k = (_pla.links || {})[id]; if (!k) return; var u = k.utr && k.utr.status === 'pending' ? k.utr : null;
  var v = await scDialog({ title: 'Record payment for ' + id, icon: '💰', okLabel: 'Record payment & unlock', message: (k.forName || '') + ' · ' + k.plan + ' · ' + plaM(k.total) + '\nCheck the money is in the bank account first. This unlocks ' + Object.keys(k.codes || {}).length + ' facilit' + (Object.keys(k.codes || {}).length > 1 ? 'ies' : 'y') + ' and makes the tax invoice.',
    fields: [{ key: 'reference', label: 'UTR / reference', value: u ? u.utr : '', required: true, maxLength: 80 }, { key: 'method', label: 'Paid by', type: 'select', value: 'Bank transfer', options: ['Bank transfer', 'UPI', 'Cheque', 'Razorpay payment link', 'Other'].map(function (x) { return { value: x, label: x }; }) },
      { key: 'paidOn', label: 'Payment date', type: 'date', value: u ? u.paidOn : plaToday() }] });
  if (!v) return;
  try { var r = await nfCall('payLinkConfirm', { id: id, reference: v.reference, method: v.method, paidOn: v.paidOn }); showToast('Payment recorded — ' + r.receipt.receiptNo, 'ok'); await plaLoad(); plaPaint(); plaBadge(); }
  catch (e) { showToast(nfErrText(e), 'err'); }
}
async function plaReject(id) {
  var v = await scDialog({ title: 'Reject this UTR?', icon: '✋', okLabel: 'Reject', message: 'The payer sees the reason on the payment page and can send a new UTR.', fields: [{ key: 'reason', label: 'Reason', type: 'select', value: 'Payment not received in our account yet.',
    options: ['Payment not received in our account yet.', 'The amount received does not match.', 'The UTR does not match any payment received.'].map(function (x) { return { value: x, label: x }; }) }] });
  if (!v) return;
  try { await nfCall('payLinkConfirm', { id: id, action: 'reject', reason: v.reason }); await plaLoad(); plaPaint(); plaBadge(); } catch (e) { showToast(nfErrText(e), 'err'); }
}
async function plaStop(id) {
  var ok = await scDialog({ title: 'Stop link ' + id + '?', icon: '⛔', okLabel: 'Stop link', message: 'Nobody can pay with it any more. You can make a new one.' }); if (!ok) return;
  try { await nfCall('payLinkStop', { id: id }); await plaLoad(); plaPaint(); } catch (e) { showToast(nfErrText(e), 'err'); }
}
async function plaInvoice(id, btn) {
  var k = (_pla.links || {})[id], c = k && Object.keys(k.codes || {})[0]; if (!c) return;
  try { var all = (await fbGet('sc_payments/' + c)) || {}, r = Object.keys(all).map(function (x) { return all[x]; }).find(function (x) { return x && x.receiptNo === (k.paid || {}).receiptNo; });
    if (!r) { showToast('The receipt is not found yet — refresh in a moment.', 'err'); return; } ivDownload(ivDoc('tax', r), btn); } catch (e) { showToast(nfErrText(e), 'err'); }
}
async function plaSaveOpts(btn) {
  var list = String((document.getElementById('pla-opts') || {}).value || '').split('\n').map(function (x) { return x.trim().slice(0, 80); }).filter(function (x) { return x && x.toLowerCase() !== 'something else'; }).slice(0, 12);
  if (!list.length) { showToast('Write at least one tick.', 'err'); return; }
  if (btn) btn.disabled = true;
  var ok = await fbSet('shared/sc_payreq_options', { list: list, at: new Date().toISOString(), by: 'HealSol' }); if (btn) btn.disabled = false;
  if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; } _pla.opts = list; showToast('Saved.', 'ok');
}
function plaBadge() { try { var t = document.querySelector('#hs-payv .hsp-tabs button[data-pla] em'); var c = plaCounts(); if (t) { t.textContent = c.all; t.className = c.all ? 'hot' : ''; } } catch (e) {} }
// the 6th tab on HealSol's Payments page
(function () {
  if (typeof hspPayRender !== 'function') return;
  var o = hspPayRender;
  hspPayRender = async function (force) {
    if (force || !_pla.links) { try { await plaLoad(); } catch (e) {} }
    var r = await o.apply(this, arguments);
    try {
      var tabs = document.querySelector('#hs-payv .hsp-tabs'); if (!tabs) return r;
      var c = plaCounts(), on = _hsp.pt === 'links';
      tabs.insertAdjacentHTML('beforeend', '<button type="button" role="tab" data-pla="1" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" onclick="_hsp.pt=\'links\';hspPayRender()"><b>Payment links <em class="' + (c.all ? 'hot' : '') + '">' + c.all + '</em></b></button>');
      if (on) { var b = document.querySelector('#hs-payv .hsp-body'); if (b) b.innerHTML = plaHTML(); }
    } catch (e) { console.warn('[paylinks]', e); }
    return r;
  };
})();
