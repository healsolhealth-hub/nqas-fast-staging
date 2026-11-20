// ═══ Your own certificate design (15 Nov 2026) ═══
// Settings → Programme rules → Certificate signatory → Certificate design: HealSol uploads a blank A4 landscape
// background (border, logos, artwork; no names or scores). Certificates on screen and in the PDF are drawn on it:
// the app's own border and logos are left out, everything else (title, name, facility, scores, signatures, QR) is printed on top.
// Stored at shared/sc_cert_design {img: JPEG data URL, w, h, at} (HealSol writes, signed-in apps read).
var _ncd = { at: 0, img: null, busy: false };
async function ncdLoad(force) {
  if (!force && _ncd.at && Date.now() - _ncd.at < 5 * 60e3) return _ncd.img;
  try { var d = await fbGet('shared/sc_cert_design'); _ncd.img = d && d.img ? d.img : null; _ncd.meta = d || null; } catch (e) {}
  _ncd.at = Date.now(); return _ncd.img;
}
function ncdShrink(file) {
  return new Promise(function (res, rej) {
    var fr = new FileReader(); fr.onerror = rej;
    fr.onload = function () { var im = new Image(); im.onerror = rej; im.onload = function () {
      var W = Math.min(2480, im.naturalWidth), H = Math.round(W * im.naturalHeight / im.naturalWidth), c = document.createElement('canvas'); c.width = W; c.height = H;
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(im, 0, 0, W, H);
      var q = 0.88, out = c.toDataURL('image/jpeg', q); while (out.length > 1.4e6 && q > 0.5) { q -= 0.08; out = c.toDataURL('image/jpeg', q); }
      res({ img: out, w: im.naturalWidth, h: im.naturalHeight }); }; im.src = fr.result; };
    fr.readAsDataURL(file);
  });
}
function ncdSetHTML() {
  var m = _ncd.meta, has = !!_ncd.img;
  return '<div class="ncd" id="ncd"><h4><i class="ti ti-certificate"></i> Certificate design</h4>'
    + '<p>Use your own design for every new and existing certificate: a <b>blank A4 landscape</b> image (297 × 210 mm, for example 3508 × 2480 pixels) with your border, logos and artwork, and <b>no names, scores or signatures</b>. The app prints the title, name, facility, scores, signatures and QR code on top, in the middle of the page, so keep that area light and plain.</p>'
    + '<div class="ncd-row">' + (has ? '<img class="ncd-prev" src="' + _ncd.img + '" alt="Your certificate design">' : '<div class="ncd-prev ncd-none">The app\'s own design is used</div>')
    + '<div class="ncd-act"><label class="hs-btn p ncd-up">' + (has ? 'Replace design' : 'Upload design') + '<input type="file" accept="image/jpeg,image/png" onchange="ncdPick(this)" hidden></label>'
    + (has ? '<button type="button" class="hs-btn" onclick="ncdPreview()">Preview a certificate</button><button type="button" class="hs-btn" onclick="ncdRemove()">Use the app\'s design</button>' : '')
    + (m && m.at ? '<small>Uploaded ' + (typeof scFmtDate === 'function' ? scFmtDate(String(m.at).slice(0, 10)) : String(m.at).slice(0, 10)) + (m.w ? ' · ' + m.w + ' × ' + m.h + ' px' : '') + '</small>' : '<small>JPG or PNG. Made in Canva: choose "A4 landscape", remove the text, download as PNG.</small>') + '</div></div></div>';
}
async function ncdPaint() { var c = document.getElementById('nf-certset'); if (!c) return; await ncdLoad(); var old = document.getElementById('ncd'); var w = document.createElement('div'); w.innerHTML = ncdSetHTML(); if (old) old.replaceWith(w.firstChild); else { var how = c.querySelector('.nf-cs-how'); if (how) how.insertAdjacentElement('beforebegin', w.firstChild); else c.appendChild(w.firstChild); } }
async function ncdPick(inp) {
  var f = inp.files && inp.files[0]; inp.value = ''; if (!f) return;
  if (!/^image\/(jpeg|png)$/.test(f.type)) { showToast('Choose a JPG or PNG image.', 'err'); return; }
  if (f.size > 15e6) { showToast('That file is very large — export it under 15 MB.', 'err'); return; }
  try {
    var r = await ncdShrink(f), ratio = r.w / r.h;
    if (ratio < 1.3 || ratio > 1.52) { var go = true; try { go = await showConfirm('This image is ' + r.w + ' × ' + r.h + ' px, not A4 landscape (about 1.41 : 1). It will be stretched to fit the page. Use it anyway?', '📐', 'Use it', 'Cancel', 'var(--teal)'); } catch (e) {} if (!go) return; }
    var rec = { img: r.img, w: r.w, h: r.h, at: scNowIso(), by: 'HealSol Admin' };
    var ok = await fbSet('shared/sc_cert_design', rec); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
    _ncd.img = rec.img; _ncd.meta = rec; _ncd.at = Date.now(); showToast('Certificate design saved. Every certificate now uses it.', 'ok'); ncdPaint();
  } catch (e) { console.warn('[cert design]', e); showToast('Could not read that image.', 'err'); }
}
async function ncdRemove() {
  var go = true; try { go = await showConfirm('Go back to the app\'s own certificate design? Your uploaded design is removed.', '🎨', 'Use the app\'s design', 'Cancel', 'var(--teal)'); } catch (e) {} if (!go) return;
  var ok = await fbSet('shared/sc_cert_design', null); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
  _ncd.img = null; _ncd.meta = null; _ncd.at = Date.now(); showToast('The app\'s own design is used again.', 'ok'); ncdPaint();
}
function ncdSample() { return { certId: 'NQF-SAMPLE-0001', grade: 'Merit', name: 'Sunita Devi', role: 'CHO', facilityName: 'Sample Sub-Centre', code: 'XX-XXX-SC-0001', district: 'District', state: 'State', tier: '12A', facPct: 74, facBase: 52, staffPct: 76, staffBase: 50, issuedAt: new Date().toISOString(), startDate: '2026-11-20', endDate: '2027-01-18', baselineDays: 7, daysDone: 58, totalDays: 60, daysVerified: 52, packageLabel: '12A — 12 Services', verifyUrl: 'https://app.thehealsol.com/verify', signers: [{ name: 'Name One', role: 'HealSol Academy', title: 'Programme Coordinator' }, { name: 'Name Two', role: 'Quality Mentor' }] }; }
function ncdPreview() { try { nfShowCert(Object.assign(ncdSample(), (typeof _nfCertOpen === 'object' && _nfCertOpen) ? {} : {})); } catch (e) { console.warn('[cert design] preview', e); showToast('Could not show the preview.', 'err'); } }
(function () {
  if (typeof nfEnsureCertSetup === 'function') { var oS = nfEnsureCertSetup; nfEnsureCertSetup = async function () { var r = await oS.apply(this, arguments); try { await ncdPaint(); } catch (e) {} return r; }; }
  if (typeof nfCertHTML === 'function') {
    var oH = nfCertHTML;
    nfCertHTML = function () { var h = oH.apply(this, arguments); if (!_ncd.img) return h;
      return h.replace('<div class="nfcd" id="nfcd">', '<div class="nfcd ncd-own" id="nfcd" style="background-image:url(\'' + _ncd.img + '\')">'); };
  }
  if (typeof nfShowCert === 'function') {
    var oV = nfShowCert;
    nfShowCert = function (r) { var self = this, a = arguments; if (_ncd.at) return oV.apply(self, a); return ncdLoad().then(function () { return oV.apply(self, a); }, function () { return oV.apply(self, a); }); };
  }
  if (typeof nfCertPdf === 'function') {
    var oP = nfCertPdf;
    nfCertPdf = async function () {
      await ncdLoad(); if (!_ncd.img) return oP.apply(this, arguments);
      var oNew = nfPdfNew, oImg = nfPdfImg, img = _ncd.img;
      nfPdfNew = function () { var doc = oNew.apply(this, arguments); try { doc.addImage(img, 'JPEG', 0, 0, 297, 210); } catch (e) { console.warn('[cert design] pdf', e); }
        var oR = doc.roundedRect; doc.roundedRect = function (x, y) { if ((x === 8 && y === 8) || (x === 11 && y === 11)) return doc; return oR.apply(doc, arguments); }; return doc; };
      nfPdfImg = function (doc, src) { if (src === SC_BRAND.logoNqas || src === SC_BRAND.logoHealsol) return; return oImg.apply(this, arguments); };
      try { return await oP.apply(this, arguments); } finally { nfPdfNew = oNew; nfPdfImg = oImg; }
    };
  }
})();
