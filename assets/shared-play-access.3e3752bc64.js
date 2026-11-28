// ══════════════════════════════════════════════════════════════
// PROGRAMME ACCESS IN THE GOOGLE PLAY APP + THE PUBLIC TOUR (approved 28 Nov 2026, canvas "Payments in the Play app")
//   Play app = consumption-only: no price, no pay button, no "pay on the website". Instead "Programme access":
//     · before Day 1 (baseline fee due) and at the Day 8 lock → "Ask HealSol to contact me" (payRequest, marked "From the
//       Google Play app") → a status with three ticks; the app opens by itself when HealSol records the payment
//     · Me → Programme access: baseline / implementation Active or Waiting, the close date
//   HealSol: Payments → Payment links → New requests shows "From the app" with WhatsApp; "Make link" sends the website pay link.
//   Website: pays as before (the setup step no longer repeats the "Your facility is approved" box).
//   Tour (app.thehealsol.com/tour/, no login, no prices): login "New here? See how it works", Me → App tour, before Day 1.
// ══════════════════════════════════════════════════════════════
var PAC_OPT = 'From the Google Play app: please contact me about programme access';
function pacHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function pacT(en, hi) { return pacHi() && hi ? hi : en; }
function pacE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s).replace(/[&<>"']/g, ''); }
function pacPlay() { return typeof nfIsPlay === 'function' && nfIsPlay(); }
function pacKey(code) { return 'nf_accreq_' + code; }
function pacAsked(code) { try { return localStorage.getItem(pacKey(code)) || ''; } catch (e) { return ''; } }
function pacCtx() {   // the facility on screen, its record and whether this person is the in-charge
  try { if (typeof _nd !== 'undefined' && _nd && _nd.code && (typeof appMode === 'undefined' || appMode !== 'cho')) return { code: _nd.code, f: _nd.fac || {}, ic: typeof nduInCharge === 'function' ? nduInCharge() : true, mob: (typeof _nd.me === 'object' && _nd.me && _nd.me.mob) || '' }; } catch (e) {}
  try { if (typeof choState !== 'undefined' && choState.facilityCode) return { code: choState.facilityCode, f: choState.facility || {}, ic: (choState.roleId || 'CHO') === 'CHO', mob: String(choState.staffMobile || '') }; } catch (e) {}
  return null;
}
function pacWhen(iso) { try { var d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(); } catch (e) { return ''; } }
function pacIc(n, c) { return '<i class="ti ti-' + n + '"' + (c ? ' style="color:' + c + '"' : '') + '></i>'; }

// kind 'bl' = before Day 1 (baseline fee) · 'impl' = from Day 8
function pacBoxHTML(kind, ctx) {
  ctx = ctx || pacCtx() || {}; var code = ctx.code || '', at = code ? pacAsked(code) : '', mob = ctx.mob || '';
  var after = kind === 'bl' ? pacT('you can choose Day 1 here', 'आप यहीं दिन 1 चुन सकते हैं') : pacT('the next days open here', 'आगे के दिन यहीं खुलेंगे');
  var h = '<div class="pac" data-kind="' + kind + '">';
  if (at) {
    h += '<div class="pac-h">' + pacIc('circle-check', '#1F7A4A') + '<span><b>' + pacE(pacT('Request sent · ', 'अनुरोध भेजा · ') + pacWhen(at)) + '</b><small>' + pacE(pacT('HealSol Academy will contact you' + (mob ? ' on ' + mob : '') + '. Your district may also confirm it for you.', 'HealSol Academy आपसे' + (mob ? ' ' + mob + ' पर' : '') + ' संपर्क करेगी। आपका ज़िला भी इसकी पुष्टि कर सकता है।')) + '</small></span></div>'
      + '<div class="pac-ticks"><div>' + pacIc('circle-check', '#1F7A4A') + pacE(pacT('Request received by HealSol', 'HealSol को अनुरोध मिला')) + '</div><div>' + pacIc('clock', '#E9963A') + pacE(pacT('Access being arranged', 'सुविधा तय हो रही है')) + '</div><div class="dim">' + pacIc('circle-check', '#B9C4C1') + pacE(kind === 'bl' ? pacT('Access recorded — choose Day 1', 'सुविधा दर्ज — दिन 1 चुनें') : pacT('Access recorded — Day 8 opens', 'सुविधा दर्ज — दिन 8 खुलेगा')) + '</div></div>';
  } else {
    h += '<div class="pac-h q">' + pacIc('lock', '#1E6B5E') + '<span><b>' + pacE(pacT('Programme access', 'कार्यक्रम की सुविधा')) + '</b><small>' + pacE(pacT('HealSol Academy arranges your facility\'s access with you or your district. When it is recorded, ' + after + ' — nothing else to do in the app.', 'HealSol Academy आपके या आपके ज़िले के साथ केंद्र की सुविधा तय करती है। दर्ज होते ही ' + after + ' — ऐप में और कुछ नहीं करना।')) + '</small></span></div>';
    if (ctx.ic) h += '<button type="button" class="pac-b" onclick="pacAsk(\'' + pacE(kind) + '\',this)">' + pacE(pacT('Ask HealSol to contact me', 'HealSol मुझसे संपर्क करे')) + '</button>'
      + '<small class="pac-s">' + pacE(pacT('HealSol calls or sends a WhatsApp' + (mob ? ' to ' + mob : '') + ' within one working day.', 'HealSol एक कार्य-दिवस में' + (mob ? ' ' + mob + ' पर' : '') + ' कॉल या WhatsApp करेगी।')) + '</small>';
    else h += '<small class="pac-s">' + pacE(pacT('Your in-charge arranges this with HealSol Academy.', 'आपके प्रभारी यह HealSol Academy के साथ तय करते हैं।')) + '</small>';
  }
  return h + '</div>';
}
async function pacAsk(kind, btn) {
  var ctx = pacCtx(); if (!ctx || !ctx.code) return; if (btn) { btn.disabled = true; btn.textContent = pacT('Sending…', 'भेज रहे हैं…'); }
  try { await nfCall('payRequest', { codes: [ctx.code], options: [PAC_OPT], note: kind === 'bl' ? 'Baseline — before Day 1 (sent from the app)' : 'Implementation — from Day 8 (sent from the app)' }); }
  catch (e) { showToast(typeof nfErrText === 'function' ? nfErrText(e) : String(e.message || e), 'err'); if (btn) { btn.disabled = false; btn.textContent = pacT('Ask HealSol to contact me', 'HealSol मुझसे संपर्क करे'); } return; }
  try { localStorage.setItem(pacKey(ctx.code), new Date().toISOString()); } catch (e) {}
  showToast(pacT('Request sent. HealSol Academy will contact you.', 'अनुरोध भेजा गया। HealSol Academy आपसे संपर्क करेगी।'), 'ok');
  document.querySelectorAll('.pac').forEach(function (el) { var w = document.createElement('div'); w.innerHTML = pacBoxHTML(el.getAttribute('data-kind'), ctx); el.replaceWith(w.firstChild); });
}

// ── Me → Programme access (Play app) ──
function pacStatus(f) {
  var today = new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10), st = f.subscriptionStatus, op = f.officePay;
  var bl = !(typeof fbNeedsBl === 'function' && fbNeedsBl(f)), full = !st || st === 'paid' || st === 'contract' || !!(op && (op.commit || (op.until && op.until >= today)));
  var close = ''; try { if (f.startDate && typeof nfgDates === 'function') close = (nfgDates(f) || {}).close || ''; } catch (e) {}
  return { bl: bl, full: full, close: close };
}
function pacMeHTML() {
  var ctx = pacCtx(); if (!ctx) return ''; var S = pacStatus(ctx.f), pill = function (on) { return '<span class="pac-p ' + (on ? 'on' : '') + '">' + pacE(on ? pacT('Active', 'सक्रिय') : pacT('Waiting', 'बाकी')) + '</span>'; };
  var row = function (ic, t, s, r) { return '<div class="pac-r">' + pacIc(ic) + '<span><b>' + pacE(t) + '</b>' + (s ? '<small>' + pacE(s) + '</small>' : '') + '</span>' + (r || '') + '</div>'; };
  return '<div class="one-card pac-me" id="pac-me"><span class="pac-k">' + pacE(pacT('PROGRAMME ACCESS', 'कार्यक्रम की सुविधा')) + '</span>'
    + row('clipboard-check', pacT('Baseline · Days 1–7', 'बेसलाइन · दिन 1–7'), '', pill(S.bl))
    + row('tools', pacT('Implementation and end-line · Days 8–60', 'कार्यान्वयन और एंड-लाइन · दिन 8–60'), '', pill(S.full))
    + (S.close ? row('calendar', pacT('Programme closes', 'कार्यक्रम बंद'), typeof scFmtDate === 'function' ? scFmtDate(S.close) : S.close, '') : '')
    + '<small class="pac-s">' + pacE(pacT('Invoices and receipts are sent to the facility\'s email.', 'बिल और रसीदें केंद्र के ईमेल पर भेजी जाती हैं।')) + '</small>'
    + (!S.full && ctx.ic ? pacBoxHTML(S.bl ? 'impl' : 'bl', ctx) : '') + '</div>';
}

// ── the public tour ──
function pacTour() { try { window.open('/tour/', '_blank', 'noopener'); } catch (e) { location.href = '/tour/'; } }
function pacTourBox() {
  return '<button type="button" class="pac-tour" id="pac-tour" onclick="pacTour()">' + pacIc('map-2') + '<span><b>' + pacE(pacT('New here? See how it works', 'नए हैं? देखें यह कैसे काम करता है')) + '</b><small>' + pacE(pacT('A 3-minute tour of the app — no login', 'ऐप का 3 मिनट का टूर — लॉग इन की ज़रूरत नहीं')) + '</small></span>' + pacIc('chevron-right') + '</button>';
}

(function () {
  // Play app: the baseline-fee box (before Day 1) and the Day 8 lock become "Programme access"
  if (typeof fbPayStartHTML === 'function') { var o = fbPayStartHTML; fbPayStartHTML = function (code, f) { if (pacPlay()) { var c = pacCtx() || {}; return pacBoxHTML('bl', { code: code, f: f || c.f, ic: c.code === code ? c.ic : true, mob: c.mob }); } return o.apply(this, arguments); }; }
  if (typeof plAccessHTML === 'function') { plAccessHTML = function () { return '<div class="upgrade-card pl-note pac-lock"><div class="upgrade-body">' + pacBoxHTML('impl') + '<p class="pl-p pl-sm">' + pacE(pacT('Your baseline work is saved.', 'आपका बेसलाइन काम सहेजा हुआ है।')) + '</p></div></div>'; }; }
  // Me: Programme access (Play) and App tour (everyone)
  if (typeof nfRenderMe === 'function') { var m = nfRenderMe; nfRenderMe = function () { var r = m.apply(this, arguments); try {
      var p = document.getElementById('nf-me'), rows = p && p.querySelector('.nf-rows'); if (!rows) return r;
      if (pacPlay() && !document.getElementById('pac-me')) { var c = p.querySelector('.nf-cert') || rows; c.insertAdjacentHTML('beforebegin', pacMeHTML()); }
      if (!rows.querySelector('.pac-trow')) { var b = document.createElement('button'); b.type = 'button'; b.className = 'nf-row pac-trow'; b.onclick = pacTour;
        b.innerHTML = '<i class="ti ti-map-2"></i><span>' + pacE(pacT('App tour', 'ऐप टूर')) + '<small class="nf-row-s">' + pacE(pacT('See every screen in 3 minutes', '3 मिनट में हर स्क्रीन देखें')) + '</small></span><i class="ti ti-chevron-right nf-row-chev"></i>';
        var help = [].slice.call(rows.children).find(function (x) { return /nfHelp/.test(x.getAttribute('onclick') || ''); }); rows.insertBefore(b, help ? help.nextSibling : null); } } catch (e) { console.warn('[PAC] me', e); } return r; }; }
  // login: the tour
  var addTour = function () { try { var f = document.getElementById('nf-l-form'); if (f && !document.getElementById('pac-tour')) f.insertAdjacentHTML('afterend', pacTourBox()); } catch (e) {} };
  if (typeof jnPaintLogin === 'function') { var j = jnPaintLogin; jnPaintLogin = function () { var r = j.apply(this, arguments); addTour(); return r; }; }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addTour); else setTimeout(addTour, 0);
  // before Day 1: in the Play app the first step is "Programme access"; everyone gets the tour
  if (typeof susStep === 'function') { var s = susStep; susStep = function (n, state, t, sub, go, body) {
      if (pacPlay()) { if (t === 'Pay the baseline fee' || t === 'बेसलाइन शुल्क जमा करें') { t = pacT('Programme access', 'कार्यक्रम की सुविधा'); }
        if ((t === 'Choose your Day 1' || t === 'अपना दिन 1 चुनें') && /fee is paid|शुल्क जमा/.test(sub || '')) sub = pacT('After access is recorded.', 'सुविधा दर्ज होने के बाद।'); }
      return s.call(this, n, state, t, sub, go, body); }; }
  if (typeof susReadyStaff === 'function') { var rs = susReadyStaff; susReadyStaff = function () { var h = rs.apply(this, arguments); return h.replace(/<\/div>$/, susRow('map-2', pacT('App tour', 'ऐप टूर'), pacT('See every screen in 3 minutes', '3 मिनट में हर स्क्रीन देखें'), 'pacTour()', false) + '</div>'); }; }
  // HealSol: requests sent from the app
  if (typeof hspPayRender === 'function') { var hp = hspPayRender; hspPayRender = async function () { var r = await hp.apply(this, arguments); try { pacMarkReqs(); } catch (e) {} return r; }; }
  if (typeof plaPaint === 'function') { var pp = plaPaint; plaPaint = function () { var r = pp.apply(this, arguments); try { pacMarkReqs(); } catch (e) {} return r; }; }
})();
function pacMarkReqs() {
  var R = (typeof _pla !== 'undefined' && _pla.reqs) || {};
  document.querySelectorAll('.pla-req').forEach(function (el) {
    if (el.querySelector('.pac-from')) return; var mk = el.querySelector('[onclick^="plaFromReq"]'), id = mk && (/plaFromReq\('([^']+)'/.exec(mk.getAttribute('onclick')) || [])[1], r = id && R[id];
    if (!r || (r.options || []).indexOf(PAC_OPT) < 0) return;
    el.querySelector('b').insertAdjacentHTML('afterend', ' <span class="pac-from">From the app</span>');
    var mob = String(r.mobile || '').replace(/\D/g, '').slice(-10), nm = Object.keys(r.codes || {}).map(function (c) { return r.codes[c]; }).join(', ');
    if (mob.length === 10) { var a = el.querySelector('.pla-ra'), msg = encodeURIComponent('Namaste' + (r.name ? ' ' + r.name : '') + ', this is HealSol Academy about NQAS | FAST access' + (nm ? ' for ' + nm : '') + '.');
      if (a) a.insertAdjacentHTML('afterbegin', '<a class="hs-btn" href="https://wa.me/91' + mob + '?text=' + msg + '" target="_blank" rel="noopener">WhatsApp</a>'); }
  });
}
