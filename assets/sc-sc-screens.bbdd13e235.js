// ══════════════════════════════════════════════════════════════
// SC SCREENS IN THE NEW STYLE (approved 28 Nov 2026)
//   Me: profile first, one list (Language · Reminders · Live sessions · NQAS SELF learning · How to use · Change my password · Refresh · Log out)
//   How to use the app: the 60 days in 5 steps + Video FAQs (EN / हिं; green when HealSol has set a link, grey when not)
//   Video FAQ links: shared/app_help = { <topic>: { en, hi } } — set in the Content Manager → Import / export → App help videos
// ══════════════════════════════════════════════════════════════
var SC_APP_HELP = [
  ['login', 'Logging in and changing my password', 'लॉग इन करना और पासवर्ड बदलना'],
  ['baseline', 'Doing a baseline day', 'बेसलाइन का दिन करना'],
  ['fix', 'Doing a fix and re-checking it', 'सुधार करना और दोबारा जाँचना'],
  ['check', 'Checking my team\'s fixes (CHO)', 'टीम के सुधार जाँचना (CHO)'],
  ['live', 'Joining a live session or Champion call', 'लाइव सत्र या चैंपियन कॉल से जुड़ना']
];
var _ah = { d: null, at: 0 };
function ahHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function ahT(en, hi) { return ahHi() && hi ? hi : en; }
function ahE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function ahUrl(u) { u = String(u || '').trim(); return /^https:\/\/[^\s"'<>]+$/i.test(u) ? u : ''; }
async function ahLoad(force) { if (!force && _ah.d && Date.now() - _ah.at < 10 * 60e3) return _ah.d; try { _ah.d = (await fbGet('shared/app_help')) || {}; } catch (e) { _ah.d = _ah.d || {}; } _ah.at = Date.now(); return _ah.d; }
function ahIcon(name) { return '<i class="ti ti-' + name + '"></i>'; }

// ── How to use the app (sheet) ──
function ahStep(n, t, s) { return '<div class="ah-st"><span>' + n + '</span><div><b>' + ahE(t) + '</b><small>' + ahE(s) + '</small></div></div>'; }
function ahVidRow(k, en, hi) {
  var L = (_ah.d || {})[k] || {}, b = function (lab, url, lang) { return url ? '<button type="button" class="ah-v on" onclick="ahPlay(\'' + k + '\',\'' + lang + '\')" aria-label="' + ahE((ahHi() ? hi : en) + ' · ' + lab) + '">' + ahIcon('player-play') + lab + '</button>' : '<span class="ah-v" aria-label="' + ahE(ahT('Coming soon', 'जल्द')) + '">' + ahIcon('player-play') + lab + '</span>'; };
  return '<div class="ah-vr"><span>' + ahE(ahT(en, hi)) + '</span>' + b('EN', ahUrl(L.en), 'en') + b('हिं', ahUrl(L.hi), 'hi') + '</div>';
}
function ahPlay(k, lang) { var u = ahUrl(((_ah.d || {})[k] || {})[lang]); if (u) window.open(u, '_blank', 'noopener'); }
function ahHTML() {
  return '<div class="ah-sh" role="document"><span class="ah-grab"></span><b class="ah-h">' + ahE(ahT('How the 60 days work', '60 दिन कैसे चलते हैं')) + '</b>'
    + ahStep(1, ahT('Baseline · Days 1–7', 'बेसलाइन · दिन 1–7'), ahT('Answer your lines on each day\'s card. The result shows where the facility stands.', 'हर दिन के कार्ड पर अपनी पंक्तियाँ भरें। परिणाम दिखाता है कि केंद्र कहाँ है।'))
    + ahStep(2, ahT('Fix · Days 8–49', 'सुधार · दिन 8–49'), ahT('Today shows your fixes. Open one, follow How to fix, then re-check it.', 'आज आपके सुधार दिखाता है। एक खोलें, सुधार कैसे करें देखें, फिर दोबारा जाँचें।'))
    + ahStep(3, ahT('Checks', 'जाँच'), ahT('Your CHO checks your fixes ("Looks right"); the Quality Champion checks the CHO\'s. Checked fixes count for your certificate.', 'आपके CHO आपके सुधार जाँचते हैं ("सही"); क्वालिटी चैंपियन CHO के। जाँचे गए सुधार आपके प्रमाणपत्र में गिने जाते हैं।'))
    + ahStep(4, ahT('End-line · Days 50–56', 'एंड-लाइन · दिन 50–56'), ahT('Answer your lines again. The difference is your team\'s improvement.', 'अपनी पंक्तियाँ फिर भरें। अंतर ही आपकी टीम का सुधार है।'))
    + ahStep(5, ahT('Result · Day 60', 'परिणाम · दिन 60'), ahT('Readiness against NQAS 70%. Certificates for staff who met the conditions.', 'NQAS 70% के सामने तैयारी। शर्तें पूरी करने वाले स्टाफ़ को प्रमाणपत्र।'))
    + '<div class="ah-vh">' + ahIcon('video') + '<b>' + ahE(ahT('Video FAQs', 'वीडियो FAQ')) + '</b><small>' + ahE(ahT('green = ready · grey = coming', 'हरा = तैयार · धूसर = जल्द')) + '</small></div>'
    + (_ah.d ? SC_APP_HELP.map(function (x) { return ahVidRow(x[0], x[1], x[2]); }).join('') : '<p class="ah-dim">' + ahE(ahT('Loading…', 'लोड हो रहा है…')) + '</p>')
    + '<p class="ah-dim">' + ahE(ahT('Need help? Ask your CHO, or WhatsApp HealSol Academy from Me.', 'मदद चाहिए? अपने CHO से पूछें, या Me से HealSol Academy को WhatsApp करें।')) + '</p>'
    + '<button type="button" class="ah-ok" onclick="ahClose()">' + ahE(ahT('Got it', 'समझ गया')) + '</button></div>';
}
function ahOpen() {
  var ov = document.getElementById('ah-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'ah-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.addEventListener('mousedown', function (e) { if (e.target === ov) ahClose(); }); document.body.appendChild(ov); }
  ov.setAttribute('aria-label', ahT('How to use the app', 'ऐप कैसे इस्तेमाल करें')); ov.innerHTML = ahHTML();
  ahLoad().then(function () { var o = document.getElementById('ah-ov'); if (o) o.innerHTML = ahHTML(); });
}
function ahClose() { var ov = document.getElementById('ah-ov'); if (ov) ov.remove(); }

// ── Me ──
function scMeTidy() {
  var p = document.getElementById('nf-me'); if (!p || typeof appMode === 'undefined' || appMode !== 'cho') return;
  var rows = p.querySelector('.nf-rows'); if (!rows) return;
  var pm = document.getElementById('pm-one'), np = document.getElementById('np-me');
  var mk = function (cls, icon, label, sub, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'nf-row ' + cls; b.onclick = fn; b.innerHTML = '<i class="ti ti-' + icon + '"></i><span>' + ahE(label) + (sub ? '<small class="nf-row-s">' + ahE(sub) + '</small>' : '') + '</span><i class="ti ti-chevron-right nf-row-chev"></i>'; return b; };
  var lang = rows.querySelector('.nf-lang'), langRow = lang ? lang.closest('.nf-row') : rows.firstChild, live = rows.querySelector('.nf-me-live');
  // Reminders: the switch stays where it was made (push.js); the list row opens it
  if (np && !rows.querySelector('.sm-rem')) { var on = typeof npOn === 'function' && npOn();
    var rb = mk('sm-rem', 'bell', ahT('Reminders on this phone', 'इस फ़ोन पर रिमाइंडर'), on ? ahT('On', 'चालू') : ahT('Off', 'बंद'), function () { var n = document.getElementById('np-me'); if (n) { n.classList.toggle('sm-show'); } });
    if (langRow && langRow.nextSibling) rows.insertBefore(rb, langRow.nextSibling); else rows.appendChild(rb); rows.insertBefore(np, rb.nextSibling); np.classList.add('sm-in'); }
  if (pm && !rows.querySelector('.sm-self')) { var href = pm.getAttribute('href'); var sb = mk('sm-self', 'book', ahT('NQAS SELF learning', 'NQAS SELF सीखना'), ahT('Short videos for every role · One HealSol app', 'हर भूमिका के लिए छोटे वीडियो · One HealSol ऐप'), function () { if (href) window.open(href, '_blank', 'noopener'); });
    var help = [].slice.call(rows.children).find(function (b) { return /nfHelp/.test(b.getAttribute('onclick') || ''); }); rows.insertBefore(sb, help || null); pm.remove(); }
  var hb = [].slice.call(rows.children).find(function (b) { return /nfHelp/.test(b.getAttribute('onclick') || ''); });
  if (hb && !hb.querySelector('.nf-row-s')) { var sp = hb.querySelector('span'); if (sp) sp.insertAdjacentHTML('beforeend', '<small class="nf-row-s">' + ahE(ahT('Steps and video FAQs', 'चरण और वीडियो FAQ')) + '</small>'); }
  // Live sessions: when the next one is
  try { if (live && typeof scLiveSorted === 'function' && !live.querySelector('.nf-row-s')) { var nx = scLiveSorted(scLiveAudience()).filter(function (x) { return scLiveStatus(x) !== 'ended'; })[0];
      if (nx) live.querySelector('span').insertAdjacentHTML('beforeend', '<small class="nf-row-s">' + ahE((scLiveStatus(nx) === 'live' ? ahT('Live now', 'अभी लाइव') : ahT('Next: ', 'अगला: ') + (typeof tdiWhen === 'function' ? tdiWhen(nx.startAt) : scFmtDateTime(nx.startAt)))) + '</small>'); } } catch (e) {}
  // Payment receipts (paid facilities) above Log out
  var out = [].slice.call(rows.children).find(function (b) { return /logoutCHO/.test(b.getAttribute('onclick') || ''); }), rc = document.getElementById('nf-me-rcpt');
  if (rc && out) rows.insertBefore(rc, out);
  // the profile card first
  var prof = p.querySelector('.nf-prof'), ph = p.querySelector('.nf-ph'); if (prof && ph && ph.nextElementSibling !== prof) ph.insertAdjacentElement('afterend', prof);
}
(function () {
  if (typeof nfHelp === 'function') nfHelp = function () { ahOpen(); };
  if (typeof nfRenderMe === 'function') { var o = nfRenderMe; nfRenderMe = function () { var r = o.apply(this, arguments); try { scMeTidy(); } catch (e) { console.warn('[SCS] me', e); } return r; }; }
  if (typeof npPaintMe === 'function') { var np = npPaintMe; npPaintMe = function () { var r = np.apply(this, arguments); try { var rows = document.querySelector('#nf-me .nf-rows'), rem = rows && rows.querySelector('.sm-rem'); if (rem) { rem.remove(); scMeTidy(); var n = document.getElementById('np-me'); if (n) n.classList.add('sm-show'); } } catch (e) {} return r; }; }
})();

// ── Content Manager → Import / export: App help videos (HealSol) ──
function ahCmHTML() {
  var D = _ah.d || {};
  return '<section class="ce-card ah-cm"><b>App help videos · How to use the app</b><p>Links for the Video FAQs on Me → How to use the app. Paste an https link (YouTube, Drive…) in English and Hindi; an empty box shows a grey button. Saved straight to the app — no publishing step.</p>'
    + SC_APP_HELP.map(function (x) { var L = D[x[0]] || {}; return '<div class="ah-cmr"><b>' + ahE(x[1]) + '</b><label>EN<input type="url" data-k="' + x[0] + '" data-l="en" value="' + ahE(L.en || '') + '" placeholder="https://"></label><label>हिं<input type="url" data-k="' + x[0] + '" data-l="hi" value="' + ahE(L.hi || '') + '" placeholder="https://"></label></div>'; }).join('')
    + '<button type="button" class="scl-btn pri" onclick="ahCmSave()">Save the links</button></section>';
}
async function ahCmSave() {
  var out = {}, bad = [];
  document.querySelectorAll('.ah-cm input[data-k]').forEach(function (i) { var v = String(i.value || '').trim(); if (!v) return; var u = ahUrl(v); if (!u) { bad.push(i.dataset.k + ' ' + i.dataset.l); return; } (out[i.dataset.k] = out[i.dataset.k] || {})[i.dataset.l] = u; });
  if (bad.length) { showToast('Use full https:// links — check: ' + bad.join(', '), 'err'); return; }
  try { await db.ref('shared/app_help').set(Object.keys(out).length ? out : null); _ah.d = out; _ah.at = Date.now(); showToast('App help videos saved.', 'ok'); } catch (e) { showToast('Could not save — check the connection.', 'err'); }
}
(function () {
  if (typeof sccImpHTML !== 'function') return; var o = sccImpHTML;
  sccImpHTML = function () { var h = o.apply(this, arguments); try { if (!_ah.d) ahLoad().then(function () { try { if (typeof scCpmRender === 'function') scCpmRender(); } catch (e) {} }); h += ahCmHTML(); } catch (e) { console.warn('[SCS] cm', e); } return h; };
})();
