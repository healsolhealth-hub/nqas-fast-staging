// ══════════════════════════════════════════════════════════════
// Invoices (2 Nov 2026; HealSol: the office pays for government facilities)
//   CHO: Unlock card → "Office will pay — proforma invoice" (Bill to the office, PDF, valid 30 days).
//   Every payment → GST tax invoice (HS/{FY}/0001): Me → Payment receipts, and HealSol's receipts.
//   HealSol: Business → Proforma invoices — give "payment by office" time (15 days or more), cancel, download.
// ══════════════════════════════════════════════════════════════
var _iv = { list: null };
function ivE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ivHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function ivT(en, hi) { return ivHi() && hi ? hi : en; }
function ivM(n) { return typeof nfMoney === 'function' ? nfMoney(n) : '₹' + n; }
function ivDate(iso) { if (!iso) return ''; var d = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(iso + 'T12:00:00+05:30') : new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
function ivToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
// rupees in words, Indian system: "Four Thousand One Hundred Twenty-Eight Rupees and Eighty-Two Paise Only"
function ivWords(n) {
  var a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'],
    b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  var two = function (x) { return x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? '-' + a[x % 10] : ''); };
  var three = function (x) { return (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' : '') : '') + (x % 100 ? two(x % 100) : ''); };
  var w = function (x) { if (!x) return 'Zero'; var out = [], cr = Math.floor(x / 1e7), l = Math.floor(x / 1e5) % 100, th = Math.floor(x / 1e3) % 100, r = x % 1000;
    if (cr) out.push(w(cr) + ' Crore'); if (l) out.push(two(l) + ' Lakh'); if (th) out.push(two(th) + ' Thousand'); if (r) out.push(three(r)); return out.join(' '); };
  var rs = Math.floor(n + 1e-9), p = Math.round((n - rs) * 100);
  return w(rs) + (rs === 1 ? ' Rupee' : ' Rupees') + (p ? ' and ' + two(p) + ' Paise' : '') + ' Only';
}

// ── one document model for proforma and tax invoice ──
function ivDoc(kind, r) {
  if (kind === 'proforma') return { kind: kind, title: 'PROFORMA INVOICE', no: r.no, date: r.issuedAt, validTill: r.validTill, seller: r.seller, buyer: r.billTo, sac: r.sac, item: r.item, base: r.base, gst: r.gst, cgst: r.cgst, sgst: r.sgst, igst: r.igst, total: r.total,
    facility: r.facilityName + ' (' + r.code + ')' + (r.nin ? ' · NIN ' + r.nin : ''), place: [r.block ? r.block + ' block' : '', r.district, r.state].filter(Boolean).join(', '), note: 'This is a proforma invoice for approval and payment — it is not a tax invoice. The tax invoice is issued when the payment is received.' };
  var v = r.invoice || {}, G = v.group;
  if (G) return { kind: 'tax', title: 'TAX INVOICE', no: v.no, date: v.date || r.paidAt, seller: v.seller, buyer: v.buyer, sac: v.sac, lines: G.lines, base: G.base, gst: G.gst, cgst: v.cgst, sgst: v.sgst, igst: v.igst, total: G.total,
    facility: G.n + ' facilities (listed below)', place: '', paid: { method: r.method, ref: r.paymentId || r.reference || '', receiptNo: r.receiptNo, proformaNo: v.proformaNo }, note: 'Payment received in full for all the facilities listed. This is a computer-generated invoice and does not need a signature.' };   // 18 Nov 2026: one invoice for several facilities
  return { kind: 'tax', title: 'TAX INVOICE', no: v.no, date: v.date || r.paidAt, seller: v.seller, buyer: v.buyer, sac: v.sac, item: 'NQAS | FAST programme — ' + (r.packageLabel || r.package || ''), base: r.base, gst: r.gst, cgst: v.cgst, sgst: v.sgst, igst: v.igst, total: r.total,
    facility: (r.facilityName || '') + ' (' + (r.code || '') + ')', place: [r.district, r.state].filter(Boolean).join(', '), paid: { method: r.method, ref: r.paymentId || r.reference || '', receiptNo: r.receiptNo, proformaNo: v.proformaNo }, note: 'Payment received in full. This is a computer-generated invoice and does not need a signature.' };
}
function ivHTML(d) {
  var S = d.seller || {}, B = d.buyer || {}, kv = function (k, v) { return v ? '<tr><td>' + ivE(k) + '</td><td>' + ivE(v) + '</td></tr>' : ''; };
  var tax = d.igst ? '<tr><td>IGST @ 18%</td><td>' + ivM(d.igst) + '</td></tr>' : '<tr><td>CGST @ 9%</td><td>' + ivM(d.cgst) + '</td></tr><tr><td>SGST @ 9%</td><td>' + ivM(d.sgst) + '</td></tr>';
  var B0 = typeof SC_BRAND !== 'undefined' ? SC_BRAND : {};
  return '<div class="nf-rcpt iv-doc"><div class="iv-brand">' + (B0.logoNqas ? '<img src="' + B0.logoNqas + '" alt="NQAS.QI" class="iv-nq">' : '') + '<span class="iv-fast"><b>NQAS<i>|</i>FAST</b><small>Make your facility NQAS-ready</small></span><span class="iv-by">by ' + (B0.logoHealsol ? '<img src="' + B0.logoHealsol + '" alt="HealSol Academy">' : 'HealSol Academy') + '</span></div><div class="nf-rcpt-top"><div><b>' + ivE(S.name) + '</b><small>' + ivE(S.address) + '<br>GSTIN ' + ivE(S.gstin) + ' · ' + ivE(S.email) + ' · ' + ivE(S.phone) + '</small></div><div class="nf-rcpt-t">' + ivE(d.title) + '<small>' + ivE(d.no) + '</small></div></div>'
    + '<table class="nf-rcpt-kv">' + kv('Date', ivDate(d.date)) + (d.validTill ? kv('Valid till', ivDate(d.validTill)) : '') + kv('Bill to', [B.name, B.address].filter(Boolean).join(', ')) + kv('Buyer GSTIN', B.gstin || 'Unregistered') + kv('Place of supply', (B.state || '') + (B.stateCode ? ' (' + B.stateCode + ')' : '')) + kv('Facility', d.facility) + kv('Location', d.place) + '</table>'
    + '<table class="nf-rcpt-amt"><tr><th>Description · SAC ' + ivE(d.sac) + '</th><th>Amount</th></tr>' + (d.lines && d.lines.length ? d.lines.map(function (x) { return '<tr><td>' + ivE(x.item) + '</td><td>' + (x.base != null ? ivM(x.base) : '') + '</td></tr>'; }).join('') : '<tr><td>' + ivE(d.item) + '</td><td>' + ivM(d.base) + '</td></tr>') + tax
    + '<tr class="tot"><td>' + (d.kind === 'tax' ? 'Total paid' : 'Total payable') + '</td><td>' + ivM(d.total) + '</td></tr></table>'
    + '<div class="iv-words">' + ivE(ivWords(d.total)) + '</div>'
    + (d.paid ? '<table class="nf-rcpt-kv">' + kv('Paid by', d.paid.method) + kv('Payment reference', d.paid.ref) + kv('Receipt', d.paid.receiptNo) + kv('Against proforma', d.paid.proformaNo) + '</table>' : '')
    + (d.kind === 'proforma' && typeof _bp !== 'undefined' && _bp.cfg && (_bp.cfg.acc || _bp.cfg.upi) ? '<table class="nf-rcpt-kv">' + kv('Pay to', _bp.cfg.payee) + kv('Bank', [_bp.cfg.bank, _bp.cfg.branch].filter(Boolean).join(', ')) + kv('Account no.', _bp.cfg.acc) + kv('IFSC', _bp.cfg.ifsc) + kv('UPI ID', _bp.cfg.upi) + kv('Payment remarks', d.no) + '</table>' : '')
    + '<div class="nf-rcpt-note">' + ivE(d.note) + '</div></div>';
}
async function ivPdf(d) {
  var J = await nfLoadPdf(), doc = nfPdfNew(J, 'p'), F = doc._nfFont, M = function (n) { return nfPdfMoney(doc, n); }, T = function (s) { return nfPdfTxt(doc, s); };
  var L = 16, R = 194, y = 16, TEAL = [19, 90, 85], GREY = [100, 116, 139], INK = [15, 23, 42], S = d.seller || {}, B = d.buyer || {};
  // brand band (3 Nov 2026): NQAS.QI logo · NQAS | FAST · HealSol Academy logo
  var B0 = typeof SC_BRAND !== 'undefined' ? SC_BRAND : {}, lw = B0.logoNqas ? nfPdfImg(doc, B0.logoNqas, L, y - 2, 11) : 0, bx = L + (lw ? lw + 5 : 0);
  doc.setFont(F, 'bold'); doc.setFontSize(15); doc.setTextColor.apply(doc, INK); doc.text('NQAS', bx, y + 4.6); var nw = doc.getTextWidth('NQAS ');
  doc.setTextColor(232, 132, 30); doc.text('|', bx + nw, y + 4.6); var pw = doc.getTextWidth('| '); doc.setTextColor.apply(doc, TEAL); doc.text('FAST', bx + nw + pw, y + 4.6);
  doc.setFont(F, 'normal'); doc.setFontSize(7.8); doc.setTextColor.apply(doc, GREY); doc.text('Make your facility NQAS-ready', bx, y + 8.6);
  var hw = B0.logoHealsol ? nfPdfImg(doc, B0.logoHealsol, R, y, 6.5, true) : 0;
  if (!hw) { doc.setFont(F, 'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc, TEAL); doc.text('HealSol Academy', R, y + 4.6, { align: 'right' }); }
  doc.setFont(F, 'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, GREY); doc.text('by', R - (hw || doc.getTextWidth('HealSol Academy') + 1) - 2, y + 4.6, { align: 'right' });
  y += 14; doc.setDrawColor(226, 232, 240); doc.setLineWidth(0.3); doc.line(L, y, R, y); y += 7;
  doc.setFont(F, 'bold'); doc.setFontSize(12); doc.setTextColor.apply(doc, INK); doc.text(T(S.name || ''), L, y + 3);
  doc.setFont(F, 'normal'); doc.setFontSize(8.3); doc.setTextColor.apply(doc, GREY);
  doc.text(doc.splitTextToSize(T(S.address || ''), 105), L, y + 8); doc.text(T('GSTIN ' + (S.gstin || '') + '  ·  ' + (S.email || '') + '  ·  ' + (S.phone || '')), L, y + 16.5);
  doc.setFont(F, 'bold'); doc.setFontSize(13); doc.setTextColor.apply(doc, TEAL); doc.text(d.title, R, y + 3, { align: 'right' });
  doc.setFontSize(10); doc.setTextColor.apply(doc, INK); doc.text(T(d.no || ''), R, y + 9, { align: 'right' });
  doc.setFont(F, 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, GREY); doc.text('Date: ' + ivDate(d.date) + (d.validTill ? '   Valid till: ' + ivDate(d.validTill) : ''), R, y + 14, { align: 'right' });
  y += 21; doc.setDrawColor.apply(doc, TEAL); doc.setLineWidth(0.6); doc.line(L, y, R, y); y += 7;
  var kv = function (k, v) { if (!v) return; doc.setFont(F, 'normal'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, GREY); doc.text(k, L, y);
    doc.setTextColor.apply(doc, INK); var lines = doc.splitTextToSize(T(v), R - L - 44); doc.text(lines, L + 44, y); y += 5.6 * Math.max(1, lines.length); };
  doc.setFont(F, 'bold'); doc.setFontSize(9); doc.setTextColor.apply(doc, TEAL); doc.text('BILL TO', L, y); y += 5.5;
  kv('Name', B.name); kv('Address', B.address); kv('GSTIN', B.gstin || 'Unregistered'); kv('Place of supply', (B.state || '') + (B.stateCode ? ' (' + B.stateCode + ')' : '')); kv('For facility', d.facility); kv('Location', d.place);
  y += 2;
  var body = d.lines && d.lines.length ? d.lines.map(function (x) { return [T(x.item), String(d.sac || ''), x.base != null ? M(x.base) : '']; }) : [[T(d.item), String(d.sac || ''), M(d.base)]];
  if (d.igst) body.push(['IGST @ 18%', '', M(d.igst)]); else { body.push(['CGST @ 9%', '', M(d.cgst)]); body.push(['SGST @ 9%', '', M(d.sgst)]); }
  doc.autoTable({ startY: y, margin: { left: L, right: 210 - R }, theme: 'plain', head: [['Description', 'SAC', 'Amount']], body: body, foot: [[d.kind === 'tax' ? 'Total paid' : 'Total payable', '', M(d.total)]],
    styles: { font: F, fontSize: 9.5, textColor: INK, cellPadding: { top: 2.4, bottom: 2.4, left: 0, right: 0 } },
    headStyles: { font: F, fontStyle: 'bold', fontSize: 8.3, textColor: GREY, lineWidth: { bottom: 0.2 }, lineColor: [226, 232, 240] },
    bodyStyles: { lineWidth: { bottom: 0.2 }, lineColor: [241, 245, 249] }, footStyles: { font: F, fontStyle: 'bold', fontSize: 11.5, textColor: INK, lineWidth: { bottom: 0.6 }, lineColor: TEAL },
    columnStyles: { 1: { cellWidth: 22 }, 2: { halign: 'right', cellWidth: 38 } }, didParseCell: function (h) { if (h.column.index === 2 && h.section !== 'body') h.cell.styles.halign = 'right'; } });
  y = doc.lastAutoTable.finalY + 6; doc.setFont(F, 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, INK); doc.text(doc.splitTextToSize('Amount in words: ' + ivWords(d.total), R - L), L, y); y += 9;
  if (d.paid) { kv('Paid by', d.paid.method); kv('Payment reference', d.paid.ref); kv('Receipt', d.paid.receiptNo); kv('Against proforma', d.paid.proformaNo); }
  var c = (typeof _bp !== 'undefined' && _bp.cfg) || {};
  if (d.kind === 'proforma' && (c.acc || c.upi)) { doc.setFont(F, 'bold'); doc.setFontSize(9); doc.setTextColor.apply(doc, TEAL); doc.text('PAYMENT DETAILS', L, y); y += 5.5;
    kv('Pay to', c.payee); kv('Bank', [c.bank, c.branch].filter(Boolean).join(', ')); kv('Account no.', c.acc); kv('IFSC', c.ifsc); kv('UPI ID', c.upi); kv('Payment remarks', d.no); }
  y += 3; doc.setFontSize(8.3); doc.setTextColor.apply(doc, GREY); doc.text(doc.splitTextToSize(d.note, R - L), L, y);
  doc.setFontSize(7.5); doc.text('NQAS | FAST · by HealSol Academy · generated ' + new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }), L, 287);
  return doc;
}
async function ivDownload(d, btn) {
  var old = btn ? btn.innerHTML : ''; if (btn) { btn.disabled = true; btn.textContent = 'Preparing…'; }
  try { if (d.kind === 'proforma' && typeof bpCfg === 'function') await bpCfg(); var doc = await ivPdf(d); nfDoneToast(await nfSaveDoc(doc, (d.kind === 'tax' ? 'Tax-Invoice-' : 'Proforma-') + String(d.no || '').replace(/[^A-Za-z0-9-]+/g, '-') + '.pdf')); }
  catch (e) { console.warn('[invoice] pdf', e); showToast('Could not make the PDF — check the internet connection and try again.', 'err'); }
  finally { if (btn) { btn.disabled = false; btn.innerHTML = old; } }
}
async function ivShow(d) {
  if (d.kind === 'proforma' && typeof bpCfg === 'function') await bpCfg();
  var id = d.kind === 'tax' ? 'nf-rcpt-ov' : 'iv-ov', old = document.getElementById(id); if (old) old.remove();   // the tax invoice takes the receipt's place
  var ov = document.createElement('div'); ov.className = 'scx-ov open'; ov.id = id; window.__ivDoc = d;
  ov.innerHTML = '<div class="scx-box nf-rcpt-box">' + ivHTML(d) + '<div class="nf-tmp-acts"><button class="scx-btn ghost" onclick="ivDownload(window.__ivDoc,this)">Download PDF</button><button class="scx-btn" onclick="document.getElementById(\'' + id + '\').remove()">Done</button></div></div>';
  document.body.appendChild(ov);
}
// payment receipts → tax invoices (older payments without an invoice keep the receipt)
(function () {
  // the receipt window stays (Print, Send to CHO on WhatsApp …); only what it shows and downloads becomes the tax invoice
  if (typeof nfReceiptHTML === 'function') { var oh = nfReceiptHTML; nfReceiptHTML = function (r) { return r && r.invoice ? ivHTML(ivDoc('tax', r)) : oh.apply(this, arguments); }; }
  if (typeof nfDownloadReceiptPdf === 'function') { var od = nfDownloadReceiptPdf; nfDownloadReceiptPdf = function (r, btn) { return r && r.invoice ? ivDownload(ivDoc('tax', r), btn) : od.apply(this, arguments); }; }
  try { if (typeof HINDI_UI === 'object') Object.assign(HINDI_UI, { 'Payment receipts': 'भुगतान रसीदें / टैक्स इनवॉइस' }); } catch (e) {}
})();

// ── CHO: "Office will pay — proforma invoice" on the Unlock card ──
async function ivMine(code) { var all = {}; try { all = (await fbGet('sc_proforma/' + code)) || {}; } catch (e) {} var k = Object.keys(all).filter(function (x) { return (all[x] || {}).status === 'issued'; }).sort(function (a, b) { return String(all[b].issuedAt).localeCompare(String(all[a].issuedAt)); })[0]; return k ? all[k] : null; }
async function ivUpgradeExtra(container) {
  var body = container && container.querySelector('.upgrade-body'); if (!body || body.querySelector('.iv-box')) return;
  var code = nfPayCode(), isCho = window._payCtx ? true : (typeof nfIsChoNow === 'function' ? nfIsChoNow() : true); if (!code || !isCho) return;
  var pi = await ivMine(code), box = document.createElement('div'); box.className = 'iv-box'; window.__ivPi = pi;
  var valid = pi && pi.validTill >= ivToday();
  box.innerHTML = (valid ? '<div class="iv-pi"><b>📄 ' + ivE(ivT('Proforma invoice', 'प्रोफ़ॉर्मा इनवॉइस')) + ' ' + ivE(pi.no) + '</b><small>' + ivE(ivT('To', 'प्रति')) + ': ' + ivE(pi.billTo.name) + ' · ' + ivM(pi.total) + ' · ' + ivE(ivT('valid till', 'मान्य')) + ' ' + ivE(ivDate(pi.validTill)) + '</small>'
      + '<div class="iv-acts"><button type="button" class="hs-btn" onclick="ivShow(ivDoc(\'proforma\',window.__ivPi))">' + ivE(ivT('View / download', 'देखें / डाउनलोड')) + '</button><button type="button" class="hs-btn" onclick="ivForm()">' + ivE(ivT('Make a new one', 'नया बनाएँ')) + '</button></div>'
      + '<small>' + ivE(ivT('Need time while your office pays? Ask HealSol Academy to keep your programme open (Help → WhatsApp).', 'ऑफ़िस से भुगतान में समय लगेगा? कार्यक्रम खुला रखने के लिए HealSol Academy से कहें (मदद → WhatsApp)।')) + '</small></div>'
    : '<button type="button" class="bp-alt iv-alt" onclick="ivForm()"><i class="ti ti-file-text"></i> ' + ivE(ivT('Office will pay — get a proforma invoice', 'ऑफ़िस भुगतान करेगा — प्रोफ़ॉर्मा इनवॉइस लें')) + '</button>');
  body.appendChild(box);
}
(function () { if (typeof renderUpgradeCard !== 'function') return; var o = renderUpgradeCard;
  renderUpgradeCard = async function (container) { var r = await o.apply(this, arguments); try { await ivUpgradeExtra(container); } catch (e) { console.warn('[invoice] card', e); } return r; }; })();
function ivForm() {
  var f = nfPayFac(), st = (typeof NF_STATE_LIST !== 'undefined' ? NF_STATE_LIST : [['Uttar Pradesh']]).map(function (x) { return x[0]; });
  var ov = document.createElement('div'); ov.className = 'scx-ov open'; ov.id = 'iv-form';
  ov.innerHTML = '<div class="scx-box bp-sheet"><div class="nfcf-head"><span style="font-size:22px;">📄</span><div style="flex:1;"><b>' + ivE(ivT('Proforma invoice for your office', 'आपके ऑफ़िस के लिए प्रोफ़ॉर्मा इनवॉइस')) + '</b><div style="font-size:11.5px;color:var(--t3);">' + ivE(ivT('Who will pay? The invoice is addressed to them. Valid 30 days.', 'भुगतान कौन करेगा? इनवॉइस उनके नाम बनेगा। 30 दिन मान्य।')) + '</div></div></div>'
    + '<label class="bp-l">' + ivE(ivT('Bill to — office name *', 'बिल किसके नाम — ऑफ़िस का नाम *')) + '<input class="bp-i" id="iv-n" placeholder="e.g. Medical Officer In-charge, CHC Bah / District Health Society, ' + ivE(f.district || 'Agra') + '"></label>'
    + '<label class="bp-l">' + ivE(ivT('Office address *', 'ऑफ़िस का पता *')) + '<textarea class="bp-i" id="iv-a" rows="2" style="padding:8px 12px;min-height:60px">' + ivE([f.block ? f.block + ' block' : '', f.district, f.state].filter(Boolean).join(', ')) + '</textarea></label>'
    + '<label class="bp-l">' + ivE(ivT('State', 'राज्य')) + '<select class="bp-i" id="iv-s">' + st.map(function (s) { return '<option' + (s === (f.state || 'Uttar Pradesh') ? ' selected' : '') + '>' + ivE(s) + '</option>'; }).join('') + '</select></label>'
    + '<label class="bp-l">' + ivE(ivT('Office GSTIN (if it has one)', 'ऑफ़िस का GSTIN (यदि हो)')) + '<input class="bp-i" id="iv-g" autocapitalize="characters" placeholder="e.g. 09ABCDE1234F1Z5"></label>'
    + '<div class="nf-mp-err" id="iv-err" style="display:none"></div>'
    + '<div class="nf-tmp-acts"><button class="scx-btn ghost" onclick="document.getElementById(\'iv-form\').remove()">' + ivE(ivT('Cancel', 'रद्द करें')) + '</button><button class="scx-btn" id="iv-go" onclick="ivCreate()">' + ivE(ivT('Make proforma invoice', 'प्रोफ़ॉर्मा इनवॉइस बनाएँ')) + '</button></div></div>';
  document.body.appendChild(ov);
}
async function ivCreate() {
  var v = function (id) { return ((document.getElementById(id) || {}).value || '').trim(); }, err = document.getElementById('iv-err'), show = function (m) { if (err) { err.textContent = m; err.style.display = m ? 'block' : 'none'; } };
  if (!v('iv-n') || !v('iv-a')) return show(ivT('Fill in the office name and address.', 'ऑफ़िस का नाम और पता भरें।'));
  var b = document.getElementById('iv-go'); if (b) { b.disabled = true; b.textContent = ivT('Making…', 'बन रहा है…'); }
  try {
    var r = await nfCall('createProforma', { code: nfPayCode(), billTo: { name: v('iv-n'), address: v('iv-a'), state: v('iv-s'), gstin: v('iv-g') } });
    var f = document.getElementById('iv-form'); if (f) f.remove();
    await ivShow(ivDoc('proforma', r.proforma));
    nfPayAfter();
  } catch (e) { show(typeof nfErrText === 'function' ? nfErrText(e) : String(e.message || e)); if (b) { b.disabled = false; b.textContent = ivT('Make proforma invoice', 'प्रोफ़ॉर्मा इनवॉइस बनाएँ'); } }
}
// the programme stays open while the office pays (HealSol sets the date)
(function () { if (typeof phcCheckAccess !== 'function') return; var o = phcCheckAccess;
  phcCheckAccess = function () { try { var f = (typeof choState !== 'undefined' && choState.facility) || {}; if (f.officePay && f.officePay.until && f.officePay.until >= ivToday() && f.subscriptionStatus !== 'paid') return true; } catch (e) {} return o.apply(this, arguments); }; })();

// ── HealSol: Business → Proforma invoices ──
async function ivLoad() { try { _iv.list = (await fbGet('sc_proforma')) || {}; } catch (e) { _iv.list = {}; } return _iv.list; }
function ivRows() { var A = _iv.list || {}, out = []; Object.keys(A).forEach(function (c) { Object.keys(A[c] || {}).forEach(function (id) { out.push(Object.assign({ _code: c, _id: id }, A[c][id])); }); }); return out.sort(function (a, b) { return String(b.issuedAt).localeCompare(String(a.issuedAt)); }); }
function ivAdminHTML() {
  var R = ivRows().filter(function (x) { return x.status !== 'replaced'; }), F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, today = ivToday();
  var open = R.filter(function (x) { return x.status === 'issued'; }), rest = R.filter(function (x) { return x.status !== 'issued'; }).slice(0, 8);
  var row = function (x) {
    var J = function (s) { return String(s).replace(/'/g, "\\'"); }, k = "'" + J(x._code) + "','" + J(x._id) + "'", op = (F[x._code] || {}).officePay;
    var st = x.status === 'paid' ? '<span class="eq-st g">Paid · ' + ivE(x.invoiceNo || '') + '</span>' : x.status === 'cancelled' ? '<span class="eq-st n">Cancelled</span>' : x.validTill < today ? '<span class="eq-st n">Expired ' + ivE(ivDate(x.validTill)) + '</span>' : '<span class="eq-st a">Waiting for payment</span>';
    var acts = '<button type="button" class="eq-btn" onclick="ivAdminView(' + k + ')">View</button>' + (x.status === 'issued' ? '<button type="button" class="eq-btn p" onclick="ivOfficeTime(\'' + J(x._code) + '\')">' + (op ? 'More time' : 'Keep open while office pays') + '</button><button type="button" class="eq-btn x" onclick="ivCancel(' + k + ')">Cancel</button>' : '');
    return '<div class="eq-r"><div class="eq-c1"><span class="eq-kind q">Proforma</span><small>' + ivE(ivDate(x.issuedAt)) + '</small><small>' + ivE(x.no) + '</small></div>'
      + '<div class="eq-c2"><b>' + ivE(x.facilityName) + ' <i>· ' + ivE(x._code) + '</i></b><small>To: ' + ivE(x.billTo && x.billTo.name) + (x.billTo && x.billTo.gstin ? ' · GSTIN ' + ivE(x.billTo.gstin) : '') + '</small><small class="eq-b">' + ivM(x.total) + ' · valid till ' + ivE(ivDate(x.validTill)) + '</small>'
      + (op ? '<small class="eq-g">Open while the office pays — until ' + ivE(ivDate(op.until)) + '</small>' : '') + '</div><div class="eq-c3">' + st + '</div><div class="eq-c4">' + acts + '</div></div>'; };
  return '<div class="nfo-card eq" id="iv-list"><div class="eq-head"><div><b>Proforma invoices</b><small>' + open.length + ' waiting for payment by an office · tax invoices are made automatically when a payment is confirmed</small></div><div class="eq-hr"><button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh proforma invoices" onclick="ivRefresh()"><i class="ti ti-refresh"></i></button></div></div>'
    + '<div class="eq-list">' + (open.length ? open.map(row).join('') : '<div class="eq-empty">No proforma invoices waiting.</div>') + '</div>'
    + (rest.length ? '<div class="bp-k" style="margin:12px 0 6px">Recent</div><div class="eq-list">' + rest.map(row).join('') + '</div>' : '') + '</div>';
}
async function ivRefresh() { await ivLoad(); var el = document.getElementById('iv-list'); if (el) el.outerHTML = ivAdminHTML(); }
function ivAdminView(code, id) { var x = ((_iv.list || {})[code] || {})[id]; if (x) ivShow(ivDoc('proforma', x)); }
async function ivCancel(code, id) { var x = ((_iv.list || {})[code] || {})[id]; if (!x) return; var ok = await scDialog({ title: 'Cancel this proforma?', icon: '✋', okLabel: 'Cancel proforma', message: x.no + ' · ' + x.facilityName + ' · ' + ivM(x.total) + '\n\nThe facility can make a new one.' }); if (!ok) return;
  try { await nfCall('cancelProforma', { code: code, id: id }); await ivRefresh(); showToast('Proforma cancelled.', 'ok'); } catch (e) { showToast(nfErrText(e), 'err'); } }
async function ivOfficeTime(code) {
  var f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {}, op = f.officePay;
  var v = await scDialog({ title: 'Keep the programme open while the office pays', icon: '🏛️', okLabel: 'Save', message: (f.name || code) + (op ? '\nOpen now until ' + ivDate(op.until) + ' — the days below are added to that.' : '\nThe facility can use Day 8 onwards until the date below; it locks again if the payment has not come by then.'),
    fields: [{ key: 'days', label: 'Days', type: 'number', value: 15 }] });
  if (!v) return; var d = parseInt(v.days, 10); if (!(d >= 0 && d <= 120)) { showToast('Give 1 to 120 days (0 ends it).', 'err'); return; }
  try { var r = await nfCall('setOfficePay', { code: code, days: d }); if (scMasterFacilities[code]) scMasterFacilities[code].officePay = r.officePay; await ivRefresh(); showToast(r.officePay ? 'Open until ' + ivDate(r.officePay.until) + '.' : 'Office-payment time ended.', 'ok'); } catch (e) { showToast(nfErrText(e), 'err'); }
}
(function () { if (typeof nfRenderBizDash !== 'function') return; var o = nfRenderBizDash;
  nfRenderBizDash = async function () { var r = await o.apply(this, arguments);
    try { await ivLoad(); var box = document.getElementById('nf-biz'), after = document.getElementById('bp-list') || document.getElementById('nf-eq'); if (box && !document.getElementById('iv-list')) { var w = document.createElement('div'); w.innerHTML = ivAdminHTML(); if (after) after.insertAdjacentElement('afterend', w.firstChild); else box.insertBefore(w.firstChild, box.firstChild); } } catch (e) { console.warn('[invoice] biz', e); }
    return r; }; })();
