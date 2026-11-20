// ═══ HealSol: Enquiries and Payments pages (15 Nov 2026) ═══
// Enquiries: Our programmes · Coming soon (Qi FAST interest, by programme) · Other requests (account deletion).
// Payments: To confirm · Proforma invoices · Money to collect · Payments received · Invoices & receipts.
// Business keeps the totals and charts, with a strip at the top that opens these pages.
var _hsp = { eg: 'ours', prog: '', set: '', pt: 'confirm', loaded: 0 };
var HSP_SOON = [['nabh', 'NABH'], ['nabl', 'NABL'], ['jci', 'JCI'], ['other', 'Other']], HSP_NQ = [['mch', 'MCH wing'], ['dh', 'District Hospital'], ['mc', 'Medical College']];
function hspOn() { return typeof hsOn === 'function' && hsOn(); }
function hspE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function hspBox(id, v) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return null;
  var b = document.getElementById(id); if (!b) { b = document.createElement('div'); b.id = id; b.dataset.nfv = v; main.insertBefore(b, main.firstChild); }
  return b;
}
function hspEqGroup(x) { var k = nfEqKind(x); return k === 'interest' ? 'soon' : k === 'delete' ? 'other' : 'ours'; }
function hspIntKey(x) {
  var iq = x.interest || {}, p = String(iq.program || ''), t = String(iq.ftype || '');
  if (/^nqas/i.test(p)) return /mch/i.test(t) ? 'mch' : /district/i.test(t) ? 'dh' : /medical/i.test(t) ? 'mc' : 'other';
  return /nabh/i.test(p) ? 'nabh' : /nabl/i.test(p) ? 'nabl' : /jci/i.test(p) ? 'jci' : 'other';
}
function hspAllLeads() { var g = window._hspEqG; window._hspEqG = ''; var R = []; try { R = nfEqRows(); } catch (e) {} window._hspEqG = g; return R; }
(function () {
  if (typeof nfEqRows !== 'function') return;
  var o = nfEqRows;
  nfEqRows = function () {
    var R = o.apply(this, arguments), g = window._hspEqG; if (!g) return R;
    return R.filter(function (x) {
      if (hspEqGroup(x) !== g) return false;
      if (g === 'soon') { if (_hsp.prog && hspIntKey(x) !== _hsp.prog) return false; if (_hsp.set && (x.interest || {}).setting !== _hsp.set) return false; }
      return true;
    });
  };
})();

// ── Enquiries page ──
async function hspEnqRender() {
  if (!hspOn()) return; var b = hspBox('hs-enqv', 'hsenq'); if (!b) return;
  if (!_nfBiz.at) { b.innerHTML = '<div class="nfbd-empty">Loading…</div>'; try { await nfBizLoad(); } catch (e) {} }
  window._hspEqG = _hsp.eg;
  var all = hspAllLeads(), ok = all.filter(nfEqStatusOk), n = { ours: 0, soon: 0, other: 0 }, nw = { ours: 0, soon: 0, other: 0 };
  ok.forEach(function (x) { var g = hspEqGroup(x); n[g]++; if ((x.status || 'new') === 'new' || (nfEqKind(x) === 'signup' && nfEqOpen(x))) nw[g]++; });
  var tab = function (id, l, sub) { var on = _hsp.eg === id;
    return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" onclick="_hsp.eg=\'' + id + '\';hspEnqRender()"><b>' + l + ' <em class="' + (nw[id] ? 'hot' : '') + '">' + n[id] + '</em></b><small>' + sub + '</small></button>'; };
  var h = '<div class="nfo-top"><div><h1>Enquiries</h1><small>Everyone who has asked to join, or to be told when a programme is ready</small></div></div>'
    + '<div class="hsp-tabs" role="tablist" aria-label="Enquiry groups">' + tab('ours', 'Our programmes', 'NQAS · SC, UPHC, PHC, CHC') + tab('soon', 'Coming soon', 'Qi FAST interest') + tab('other', 'Other requests', 'Account deletion') + '</div>';
  if (_hsp.eg === 'soon') {
    var I = ok.filter(function (x) { return hspEqGroup(x) === 'soon'; }), cnt = {}, cnew = {};
    I.forEach(function (x) { var k = hspIntKey(x); cnt[k] = (cnt[k] || 0) + 1; if ((x.status || 'new') === 'new') cnew[k] = (cnew[k] || 0) + 1; });
    var tile = function (k, l) { var on = _hsp.prog === k, c = cnt[k] || 0;
      return '<button type="button" class="hsp-tile' + (on ? ' on' : '') + (c ? '' : ' zero') + '" aria-pressed="' + on + '" onclick="_hsp.prog=_hsp.prog===\'' + k + '\'?\'\':\'' + k + '\';hspEnqRender()"><small>' + l + '</small><b>' + c + '</b>' + (cnew[k] ? '<span>' + cnew[k] + ' new</span>' : '') + '</button>'; };
    var sb = function (v, l) { return '<button type="button" class="hsp-chip' + (_hsp.set === v ? ' on' : '') + '" aria-pressed="' + (_hsp.set === v) + '" onclick="_hsp.set=\'' + v + '\';hspEnqRender()">' + l + '</button>'; };
    h += '<div class="hsp-k">Other accreditations</div><div class="hsp-tiles">' + HSP_SOON.map(function (x) { return tile(x[0], x[1]); }).join('') + '</div>'
      + '<div class="hsp-k">NQAS · new facility types</div><div class="hsp-tiles">' + HSP_NQ.map(function (x) { return tile(x[0], x[1]); }).join('')
      + '<div class="hsp-set"><small>Setting</small><div>' + sb('', 'All') + sb('public', 'Public') + sb('private', 'Private') + '</div></div></div>';
  }
  b.innerHTML = h + '<div class="hsp-eq" data-g="' + _hsp.eg + '">' + nfEqHTML() + '</div>';
}
(function () {
  if (typeof nfEqPaint === 'function') { var oP = nfEqPaint; nfEqPaint = function () { if (_nfOv.view === 'hsenq' && hspOn()) return hspEnqRender(); return oP.apply(this, arguments); }; }
  if (typeof nfEqOpenList === 'function') { nfEqOpenList = function (kind) { _nfEq.kind = kind || ''; _nfEq.st = 'open'; _hsp.eg = kind === 'interest' ? 'soon' : kind === 'delete' ? 'other' : 'ours'; nfAdminView('hsenq'); }; }
})();

// ── Payments page ──
function hspPayCounts() {
  var c = { confirm: 0, proforma: 0 };
  try { c.confirm = bpPending().length; } catch (e) {}
  try { c.proforma = ivRows().filter(function (x) { return x.status === 'issued'; }).length; } catch (e) {}
  return c;
}
function hspTable(C, rows, empty) {
  if (!rows.length) return '<div class="nfbd-empty">' + empty + '</div>';
  return '<div class="nfo-tw"><table class="nfo-t bz-lt"><thead><tr>' + C.head.map(function (x) { return '<th>' + hspE(x) + '</th>'; }).join('') + '</tr></thead><tbody>'
    + rows.slice(0, 200).map(function (r) { var code = r.code, cls = C.cls ? C.cls(r) : ''; return '<tr class="' + cls + (C.go && code && (scMasterFacilities || {})[code] ? ' go" onclick="scDrillIn(\'' + scJs(code) + '\')"' : '"') + '>' + C.cell(r).map(function (v, i) { return '<td data-l="' + hspE((C.lab || [])[i] || '') + '">' + v + '</td>'; }).join('') + '</tr>'; }).join('')
    + '</tbody></table></div>';
}
function hspInvRows() {
  var P = (_nfBd && _nfBd.pays) || {}, out = [];
  Object.keys(P).forEach(function (c) { Object.keys(P[c] || {}).forEach(function (id) { var r = P[c][id]; if (r && typeof r === 'object' && (r.receiptNo || r.invoice)) out.push(Object.assign({ code: r.code || c, _id: id }, r)); }); });
  return out.sort(function (a, b) { return String(b.paidAt || '').localeCompare(String(a.paidAt || '')); });
}
function hspDoc(i, kind, btn) {
  var r = hspInvRows()[i]; if (!r) return;
  if (kind === 'tax' && typeof ivDownload === 'function') return ivDownload(ivDoc('tax', r), btn);
  if (typeof nfDownloadReceiptPdf === 'function') return nfDownloadReceiptPdf(r, btn);
}
async function hspPayRender(force) {
  if (!hspOn()) return; var b = hspBox('hs-payv', 'hspay'); if (!b) return;
  if (force || !_hsp.loaded) {
    if (!b.innerHTML) b.innerHTML = '<div class="nfbd-empty">Loading…</div>';
    try { await Promise.all([typeof bpLoad === 'function' ? bpLoad(true) : 0, typeof ivLoad === 'function' ? ivLoad() : 0, nfBizLoad(force ? 'force' : false)]); } catch (e) {}
    _hsp.loaded = Date.now();
  }
  var c = hspPayCounts(), D = null; try { D = nfBizData(); _nfBd._D = _nfBd._D || D; } catch (e) {}
  var T = [['confirm', 'To confirm', c.confirm, 1], ['proforma', 'Proforma invoices', c.proforma, 1], ['collect', 'Money to collect', D ? D.collectList.length : 0], ['received', 'Payments received', D ? D.pays.length : 0], ['invoices', 'Invoices & receipts', hspInvRows().length]];
  var t = _hsp.pt;
  var h = '<div class="nfo-top"><div><h1>Payments</h1><small>Everything about money coming in: confirm, follow up, download</small></div>'
    + '<button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh" onclick="hspPayRender(true)"><i class="ti ti-refresh"></i></button>'
    + '<button type="button" class="nfbd-dl" onclick="nfBizPreview()"><i class="ti ti-download"></i> Download (Excel / PDF)</button></div>'
    + '<div class="hsp-tabs" role="tablist" aria-label="Payments">' + T.map(function (x) { var on = t === x[0]; return '<button type="button" role="tab" aria-selected="' + on + '" class="' + (on ? 'on' : '') + '" onclick="_hsp.pt=\'' + x[0] + '\';hspPayRender()"><b>' + x[1] + ' <em class="' + (x[3] && x[2] ? 'hot' : '') + '">' + x[2] + '</em></b></button>'; }).join('') + '</div>';
  var body = '';
  if (t === 'confirm') body = '<p class="hsp-note">Bank transfer / UPI payments a facility says it has made. Check the amount and UTR in the bank account, then confirm: this unlocks the facility and makes the tax invoice.</p>' + (typeof bpHTML === 'function' ? bpHTML() : '');
  else if (t === 'proforma') body = '<p class="hsp-note">Proforma invoices for offices that pay by bank transfer. The tax invoice is made automatically once the payment is confirmed.</p>' + (typeof ivAdminHTML === 'function' ? ivAdminHTML() : '');
  else if (t === 'collect' && D) body = '<p class="hsp-note">Trials that have ended unpaid, or end in the next 7 days.</p><div class="nfo-card">' + hspTable(nfBizListDefs(D).collect, D.collectList, 'Nothing to collect — no trial has ended unpaid or ends in the next 7 days.') + '</div>';
  else if (t === 'received' && D) body = '<p class="hsp-note">' + hspE(D.rg.label) + ' · ' + hspE(D.rg.text) + ' · change the period on Business</p><div class="nfo-card">' + hspTable(nfBizListDefs(D).pays, D.pays.slice().reverse(), 'No payments in this period.') + '</div>';
  else if (t === 'invoices') {
    var R = hspInvRows();
    body = '<p class="hsp-note">Every receipt and tax invoice, newest first.</p><div class="nfo-card">' + (R.length ? '<div class="nfo-tw"><table class="nfo-t bz-lt"><thead><tr><th>Paid on</th><th>Facility</th><th>Receipt</th><th>Tax invoice</th><th>Total</th><th></th></tr></thead><tbody>'
      + R.map(function (r, i) { return '<tr><td data-l="Paid on">' + hspE(typeof nfDateTxt === 'function' ? nfDateTxt(nfIsoLocal(r.paidAt)) : String(r.paidAt || '').slice(0, 10)) + '</td><td data-l=""><b>' + hspE(r.facilityName || r.code) + '</b><small>' + hspE(r.code) + '</small></td><td data-l="Receipt">' + hspE(r.receiptNo || '—') + '</td><td data-l="Tax invoice">' + hspE((r.invoice || {}).no || '—') + '</td><td data-l="Total"><b>' + hspE(typeof nfMoney === 'function' ? nfMoney(r.total) : r.total) + '</b></td>'
        + '<td data-l="" class="hsp-dl">' + ((r.invoice || {}).no ? '<button type="button" class="eq-btn" onclick="hspDoc(' + i + ',\'tax\',this)">Tax invoice</button>' : '') + (r.receiptNo ? '<button type="button" class="eq-btn" onclick="hspDoc(' + i + ',\'rcpt\',this)">Receipt</button>' : '') + '</td></tr>'; }).join('')
      + '</tbody></table></div>' : '<div class="nfbd-empty">No receipts or tax invoices yet.</div>') + '</div>';
  }
  b.innerHTML = h + '<div class="hsp-body">' + body + '</div>';
}
// bank / proforma refreshes repaint the page when it is open
(function () {
  ['bpRefresh', 'ivRefresh'].forEach(function (fn) { if (typeof window[fn] !== 'function') return; var o = window[fn]; window[fn] = async function () { var r = await o.apply(this, arguments); if (_nfOv.view === 'hspay' && hspOn()) { _hsp.loaded = Date.now(); hspPayRender(); } return r; }; });
  if (typeof bpReview === 'function') { var oR = bpReview; bpReview = async function () { var r = await oR.apply(this, arguments); if (_nfOv.view === 'hspay' && hspOn()) { try { await bpLoad(true); } catch (e) {} hspPayRender(); } return r; }; }
})();

// ── Business: the lists move out; a strip opens them ──
function hspStripHTML() {
  var c = hspPayCounts(), all = hspAllLeads(), nE = all.filter(function (x) { return (x.status || 'new') === 'new' || (nfEqKind(x) === 'signup' && nfEqOpen(x)); }).length;
  return '<div class="hsp-strip" id="hsp-strip"><button type="button" onclick="nfAdminView(\'hspay\')"><i class="ti ti-currency-rupee"></i><span><b>Payments</b><small>' + (c.confirm ? c.confirm + ' to confirm' : 'nothing to confirm') + ' · ' + (c.proforma ? c.proforma + ' proforma waiting' : 'no proforma waiting') + '</small></span><em>Open</em></button>'
    + '<button type="button" onclick="nfAdminView(\'hsenq\')"><i class="ti ti-inbox"></i><span><b>Enquiries</b><small>' + (nE ? nE + ' new' : 'nothing new') + '</small></span><em>Open</em></button></div>';
}
(function () {
  if (typeof nfRenderBizDash !== 'function') return;
  var o = nfRenderBizDash;
  nfRenderBizDash = async function () {
    var r = await o.apply(this, arguments);
    try { if (!hspOn()) return r; var box = document.getElementById('nf-biz'); if (!box) return r;
      ['nf-eq', 'bp-list', 'iv-list'].forEach(function (id) { var el = document.getElementById(id); if (el && box.contains(el)) el.remove(); });
      var old = document.getElementById('hsp-strip'); if (old) old.remove();
      var top = box.querySelector('.nfo-top'), w = document.createElement('div'); w.innerHTML = hspStripHTML();
      if (top) top.insertAdjacentElement('afterend', w.firstChild); else box.insertBefore(w.firstChild, box.firstChild);
    } catch (e) { console.warn('[hs pages] business', e); }
    return r;
  };
})();

// ── menu, views, phone More, Today links ──
(function () {
  if (typeof nfAdminItems === 'function') {
    var oI = nfAdminItems;
    nfAdminItems = function () {
      var L = oI.apply(this, arguments); if (!hspOn()) return L;
      var i = -1; L.forEach(function (x, k) { if (x.v === 'business') i = k; });
      var c = { confirm: 0 }; try { c = hspPayCounts(); } catch (e) {}
      var nE = 0; try { nE = hspAllLeads().filter(function (x) { return (x.status || 'new') === 'new' || (nfEqKind(x) === 'signup' && nfEqOpen(x)); }).length; } catch (e) {}
      L.splice(i + 1, 0, { v: 'hspay', l: 'Payments', icon: 'ti-currency-rupee', onclick: "nfAdminView('hspay')", badge: c.confirm || '' }, { v: 'hsenq', l: 'Enquiries', icon: 'ti-inbox', onclick: "nfAdminView('hsenq')", badge: nE || '' });
      return L;
    };
  }
  if (typeof nfAdminApply === 'function') {
    var oA = nfAdminApply;
    nfAdminApply = function () {
      var r = oA.apply(this, arguments); var v = _nfOv.view;
      document.body.classList.toggle('nfv-hsenq', v === 'hsenq'); document.body.classList.toggle('nfv-hspay', v === 'hspay');
      if (v !== 'hsenq') window._hspEqG = '';
      try { var side = document.getElementById('nfs-side'); if (side && (v === 'hsenq' || v === 'hspay')) side.querySelectorAll('.nfs-nav button').forEach(function (b) { var d = b.getAttribute('data-v'); b.classList.toggle('on', d === v || (d === 'more' && window.innerWidth < 900)); }); } catch (e) {}
      return r;
    };
  }
  if (typeof nfAdminView === 'function') {
    var oV = nfAdminView;
    nfAdminView = function (v) { var r = oV.apply(this, arguments); if (hspOn()) { if (v === 'hsenq') hspEnqRender(); else if (v === 'hspay') hspPayRender(); } return r; };
  }
  if (typeof HS_MORE !== 'undefined') { HS_MORE.push('hspay', 'hsenq'); }
  if (typeof hsMoreOpen === 'function') {
    var oM = hsMoreOpen;
    hsMoreOpen = function () {
      var r = oM.apply(this, arguments);
      try { var sh = document.querySelector('#hs-more .hs-more-sh'), k = sh && sh.querySelector('.hs-more-k'); if (sh && k && hspOn() && !sh.querySelector('[data-hsp]')) {
        var c = hspPayCounts(), it = function (v, icon, l, s) { return '<button type="button" data-hsp="1" onclick="hsMoreClose();nfAdminView(\'' + v + '\')"><span class="hs-more-i"><i class="ti ' + icon + '"></i></span><span><b>' + l + '</b><small>' + s + '</small></span><i class="ti ti-chevron-right"></i></button>'; };
        k.insertAdjacentHTML('afterend', it('hspay', 'ti-currency-rupee', 'Payments', c.confirm ? c.confirm + ' to confirm' : 'Confirm, follow up, download') + it('hsenq', 'ti-inbox', 'Enquiries', 'Sign-ups and Qi FAST interest')); } } catch (e) {}
      return r;
    };
  }
  if (typeof hsTodo === 'function') {
    var oT = hsTodo;
    hsTodo = function () { var out = oT.apply(this, arguments);
      try { out.forEach(function (x) { if (x && x.btn && /bp-list|iv-list/.test(x.btn.js || '')) { x.btn.js = "_hsp.pt='" + (/iv-list/.test(x.btn.js) ? 'proforma' : 'confirm') + "';nfAdminView('hspay')"; x.sub = String(x.sub || '').replace(/Business → /, 'Payments → '); } }); } catch (e) {}
      return out; };
  }
})();
