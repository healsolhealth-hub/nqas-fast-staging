// ══════════════════════════════════════════════════════════════
// QI FAST START SCREEN (12 Nov 2026) — Google Play app only
//   First open: choose your setting (public / private) → choose the programme → (NQAS) choose the facility type.
//   Ready today: NQAS for AAM-SC, UPHC, PHC and CHC → straight on to log in / sign up.
//   Coming soon (NABH, NABL, JCI, other; NQAS MCH wings, district hospitals, medical colleges) → a short interest form
//   that lands in HealSol's enquiries as "Qi FAST interest" (submitEnquiry, source 'interest').
//   The choice is remembered on the phone; anyone who has signed in once never sees this screen again by itself.
//   "Programmes" on the login screen opens it again.
// ══════════════════════════════════════════════════════════════
Object.assign(typeof HINDI_UI === 'object' ? HINDI_UI : {}, {
  'Quality accreditation, made simple': 'गुणवत्ता प्रमाणन, आसान तरीक़े से',
  'Daily checklists that get your health facility assessment-ready.': 'रोज़ की चेकलिस्ट जो आपके स्वास्थ्य केंद्र को आकलन के लिए तैयार करे।',
  'Choose your setting': 'अपनी व्यवस्था चुनें', 'Public health facility': 'सरकारी स्वास्थ्य केंद्र', 'Government AAM, PHC, CHC, hospitals': 'सरकारी AAM, PHC, CHC, अस्पताल',
  'Private hospital, clinic or lab': 'निजी अस्पताल, क्लिनिक या लैब', 'Private and trust healthcare': 'निजी और ट्रस्ट स्वास्थ्य सेवा',
  'Select programme': 'कार्यक्रम चुनें', 'Select your facility type': 'अपने केंद्र का प्रकार चुनें', 'Available': 'उपलब्ध', 'Coming soon': 'जल्द आ रहा है',
  'I already have an account': 'मेरा खाता पहले से है', 'Back': 'वापस', 'Continue': 'आगे बढ़ें',
  'National Quality Assurance Standards for public health facilities': 'सरकारी स्वास्थ्य केंद्रों के लिए राष्ट्रीय गुणवत्ता आश्वासन मानक',
  'Hospital and healthcare provider accreditation': 'अस्पताल और स्वास्थ्य सेवा प्रदाता प्रमाणन', 'Testing and medical laboratory accreditation': 'जाँच और मेडिकल लैब प्रमाणन',
  'International hospital accreditation': 'अंतरराष्ट्रीय अस्पताल प्रमाणन', 'Another programme': 'कोई और कार्यक्रम', 'Tell us what you are working towards': 'बताइए आप किस पर काम कर रहे हैं',
  'Ayushman Arogya Mandir Sub-Centre': 'आयुष्मान आरोग्य मंदिर उप-केंद्र', 'Urban Primary Health Centre': 'शहरी प्राथमिक स्वास्थ्य केंद्र', 'Primary Health Centre': 'प्राथमिक स्वास्थ्य केंद्र', 'Community Health Centre': 'सामुदायिक स्वास्थ्य केंद्र',
  'MCH wing': 'MCH विंग', 'District Hospital': 'ज़िला अस्पताल', 'Medical College': 'मेडिकल कॉलेज',
  'is coming soon': 'जल्द आ रहा है', 'Tell us about your facility and we will contact you first when it opens.': 'अपने केंद्र के बारे में बताइए — शुरू होते ही हम सबसे पहले आपसे संपर्क करेंगे।',
  'Your name': 'आपका नाम', 'Mobile number': 'मोबाइल नंबर', 'Hospital / facility name': 'अस्पताल / केंद्र का नाम', 'District or city': 'ज़िला या शहर', 'State': 'राज्य',
  'Number of beds (optional)': 'बेड की संख्या (वैकल्पिक)', 'Anything else? (optional)': 'कुछ और? (वैकल्पिक)', 'Keep me informed': 'मुझे जानकारी दें',
  'Thank you!': 'धन्यवाद!', 'We will contact you on WhatsApp when it opens. Your reference:': 'शुरू होते ही हम WhatsApp पर संपर्क करेंगे। आपका संदर्भ:',
  'Explore NQAS': 'NQAS देखें', 'An independent product of HealSol Academy · Not a government app': 'HealSol Academy का स्वतंत्र उत्पाद · सरकारी ऐप नहीं', 'Done': 'हो गया', 'Programmes': 'कार्यक्रम'
});
var _qi = { step: 'setting', setting: '', program: '', ftype: '' };
var QI_PROGRAMS = {
  public: [
    { id: 'nqas', name: 'NQAS', sub: 'National Quality Assurance Standards for public health facilities', ready: true },
    { id: 'nabh', name: 'NABH', sub: 'Hospital and healthcare provider accreditation' },
    { id: 'nabl', name: 'NABL', sub: 'Testing and medical laboratory accreditation' },
    { id: 'other', name: 'Other', sub: 'Tell us what you are working towards' }],
  private: [
    { id: 'nabh', name: 'NABH', sub: 'Hospital and healthcare provider accreditation' },
    { id: 'nabl', name: 'NABL', sub: 'Testing and medical laboratory accreditation' },
    { id: 'jci', name: 'JCI', sub: 'International hospital accreditation' },
    { id: 'other', name: 'Other', sub: 'Tell us what you are working towards' }]
};
var QI_NQAS_TYPES = [
  { id: 'sc', name: 'AAM-SC', sub: 'Ayushman Arogya Mandir Sub-Centre', ready: true },
  { id: 'uphc', name: 'UPHC', sub: 'Urban Primary Health Centre', ready: true },
  { id: 'phc', name: 'PHC', sub: 'Primary Health Centre', ready: true },
  { id: 'chc', name: 'CHC', sub: 'Community Health Centre', ready: true },
  { id: 'mch', name: 'MCH wing', sub: 'Maternal and child health wing' },
  { id: 'dh', name: 'District Hospital', sub: 'District Hospital' },
  { id: 'mc', name: 'Medical College', sub: 'Medical College hospital' }];
function qiT(s) { return typeof t === 'function' ? t(s) : s; }
function qiE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
function qiIsPlay() { try { return sessionStorage.getItem('nf_play') === '1' || /[?&]src=play\b/.test(location.search || ''); } catch (e) { return false; } }
function qiGetPick() { try { return JSON.parse(localStorage.getItem('qi_pick') || 'null'); } catch (e) { return null; } }
function qiSetPick(p) { try { localStorage.setItem('qi_pick', JSON.stringify(p)); } catch (e) {} }
function qiMark() { return (typeof NF_PLAY_BRAND === 'object' && NF_PLAY_BRAND && NF_PLAY_BRAND.mark) || 'icons/qi-icon-192.png'; }

function qiOpen(step) {
  var ov = document.getElementById('qi-ov');
  if (!ov) { ov = document.createElement('div'); ov.id = 'qi-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Qi FAST'); document.body.appendChild(ov); }
  _qi.step = step || 'setting'; qiRender();
}
function qiClose() { var ov = document.getElementById('qi-ov'); if (ov) ov.remove(); }
function qiCard(o, onclick, selected) {
  return '<button type="button" class="qi-card' + (o.ready ? ' ok' : '') + (selected ? ' on' : '') + '" onclick="' + onclick + '">'
    + '<span class="qi-card-t"><b>' + qiE(qiT(o.name)) + '</b><small>' + qiE(qiT(o.sub)) + '</small></span>'
    + (o.id === 'other' ? '<i class="ti ti-chevron-right qi-go" aria-hidden="true"></i>' : '<span class="qi-badge ' + (o.ready ? 'ok' : 'soon') + '">' + qiE(qiT(o.ready ? 'Available' : 'Coming soon')) + '</span>') + '</button>';
}
function qiRender() {
  var ov = document.getElementById('qi-ov'); if (!ov) return;
  var head = '<div class="qi-top"><img class="qi-logo" src="' + qiMark() + '" alt="Qi FAST"><div class="qi-lang"><button type="button" onclick="setLang(\'en\');qiRender()">EN</button><button type="button" onclick="setLang(\'hi\');qiRender()">हिं</button></div></div>';
  var back = function (to) { return '<button type="button" class="qi-back" onclick="_qi.step=\'' + to + '\';qiRender()"><i class="ti ti-arrow-left" aria-hidden="true"></i> ' + qiE(qiT('Back')) + '</button>'; };
  var dots = function (n) { return '<div class="qi-dots" aria-hidden="true">' + [1, 2, 3].map(function (i) { return '<span class="' + (i <= n ? 'on' : '') + '"></span>'; }).join('') + '</div>'; };
  var h = '';
  if (_qi.step === 'setting') {
    h = '<div class="qi-hero"><h1>' + qiE(qiT('Quality accreditation, made simple')) + '</h1><p>' + qiE(qiT('Daily checklists that get your health facility assessment-ready.')) + '</p></div>'
      + dots(1) + '<h2>' + qiE(qiT('Choose your setting')) + '</h2>'
      + '<button type="button" class="qi-card big" onclick="_qi.setting=\'public\';_qi.step=\'program\';qiRender()"><i class="ti ti-building-hospital" aria-hidden="true"></i><span class="qi-card-t"><b>' + qiE(qiT('Public health facility')) + '</b><small>' + qiE(qiT('Government AAM, PHC, CHC, hospitals')) + '</small></span><i class="ti ti-chevron-right qi-go" aria-hidden="true"></i></button>'
      + '<button type="button" class="qi-card big" onclick="_qi.setting=\'private\';_qi.step=\'program\';qiRender()"><i class="ti ti-building-community" aria-hidden="true"></i><span class="qi-card-t"><b>' + qiE(qiT('Private hospital, clinic or lab')) + '</b><small>' + qiE(qiT('Private and trust healthcare')) + '</small></span><i class="ti ti-chevron-right qi-go" aria-hidden="true"></i></button>'
      + '<button type="button" class="qi-link" onclick="qiSkip()">' + qiE(qiT('I already have an account')) + '</button>';
  } else if (_qi.step === 'program') {
    h = back('setting') + dots(2) + '<h2>' + qiE(qiT('Select programme')) + '</h2>'
      + (QI_PROGRAMS[_qi.setting] || QI_PROGRAMS.public).map(function (p) { return qiCard(p, "qiPickProgram('" + p.id + "')"); }).join('');
  } else if (_qi.step === 'type') {
    h = back('program') + dots(3) + '<h2>' + qiE(qiT('Select your facility type')) + '</h2><p class="qi-sub">NQAS</p>'
      + QI_NQAS_TYPES.map(function (f) { return qiCard(f, "qiPickType('" + f.id + "')"); }).join('');
  } else if (_qi.step === 'interest') {
    var pr = qiProgName(), what = _qi.ftype ? qiTypeName() + ' · ' + pr : pr;
    h = back(_qi.ftype ? 'type' : 'program') + '<h2>' + (_qi.program === 'other' ? qiE(qiT('Tell us what you are working towards')) : qiE(what) + ' ' + qiE(qiT('is coming soon'))) + '</h2><p class="qi-sub">' + qiE(qiT('Tell us about your facility and we will contact you first when it opens.')) + '</p>'
      + '<form class="qi-form" onsubmit="event.preventDefault();qiSend()">'
      + '<label for="qi-nm">' + qiE(qiT('Your name')) + '</label><input id="qi-nm" autocomplete="name" maxlength="80" required>'
      + '<label for="qi-mob">' + qiE(qiT('Mobile number')) + '</label><input id="qi-mob" type="tel" inputmode="numeric" autocomplete="tel" maxlength="14" placeholder="98765 43210" required>'
      + '<label for="qi-org">' + qiE(qiT('Hospital / facility name')) + '</label><input id="qi-org" maxlength="100" required>'
      + '<div class="qi-two"><div><label for="qi-dist">' + qiE(qiT('District or city')) + '</label><input id="qi-dist" maxlength="60" required></div><div><label for="qi-st">' + qiE(qiT('State')) + '</label><input id="qi-st" maxlength="40"></div></div>'
      + (_qi.program === 'nabl' ? '' : '<label for="qi-beds">' + qiE(qiT('Number of beds (optional)')) + '</label><input id="qi-beds" inputmode="numeric" maxlength="6">')
      + '<label for="qi-msg">' + qiE(qiT('Anything else? (optional)')) + '</label><textarea id="qi-msg" maxlength="500" rows="2"' + (_qi.program === 'other' ? ' placeholder="e.g. Kayakalp, LaQshya, ISO"' : '') + '></textarea>'
      + '<div class="qi-err" role="alert"></div><button type="submit" class="qi-btn">' + qiE(qiT('Keep me informed')) + '</button></form>';
  } else if (_qi.step === 'thanks') {
    h = '<div class="qi-thanks"><div class="qi-tick"><i class="ti ti-check" aria-hidden="true"></i></div><h2>' + qiE(qiT('Thank you!')) + '</h2><p class="qi-sub">' + qiE(qiT('We will contact you on WhatsApp when it opens. Your reference:')) + ' <b>' + qiE(_qi.ref || '') + '</b></p>'
      + (_qi.setting === 'public' ? '<button type="button" class="qi-btn" onclick="_qi.ftype=\'\';_qi.program=\'nqas\';_qi.step=\'type\';qiRender()">' + qiE(qiT('Explore NQAS')) + '</button>' : '')
      + '<button type="button" class="qi-link" onclick="_qi.step=\'setting\';_qi.ftype=\'\';qiRender()">' + qiE(qiT('Done')) + '</button></div>';
  }
  ov.innerHTML = '<div class="qi-in">' + head + '<div class="qi-body">' + h + '</div><div class="qi-foot">' + qiE(qiT('An independent product of HealSol Academy · Not a government app')) + '</div></div>';
  try { ov.scrollTop = 0; } catch (e) {}
}
function qiProgName() { var all = QI_PROGRAMS.public.concat(QI_PROGRAMS.private); for (var i = 0; i < all.length; i++) if (all[i].id === _qi.program) return all[i].id === 'other' ? qiT('Another programme') : all[i].name; return _qi.program.toUpperCase(); }
function qiTypeName() { for (var i = 0; i < QI_NQAS_TYPES.length; i++) if (QI_NQAS_TYPES[i].id === _qi.ftype) return qiT(QI_NQAS_TYPES[i].name); return ''; }
function qiPickProgram(id) {
  _qi.program = id; _qi.ftype = '';
  if (id === 'nqas') { _qi.step = 'type'; qiRender(); return; }
  _qi.step = 'interest'; qiRender();
}
function qiPickType(id) {
  _qi.ftype = id; var f = QI_NQAS_TYPES.filter(function (x) { return x.id === id; })[0];
  if (f && f.ready) { qiSetPick({ setting: 'public', program: 'nqas', ftype: id, at: Date.now() }); qiClose(); return; }
  _qi.step = 'interest'; qiRender();
}
function qiSkip() { qiSetPick({ skip: 1, at: Date.now() }); qiClose(); }
async function qiSend() {
  var g = function (id) { var el = document.getElementById(id); return el ? String(el.value || '').trim() : ''; };
  var err = function (m) { var e = document.querySelector('#qi-ov .qi-err'); if (e) { e.textContent = m || ''; e.style.display = m ? 'block' : 'none'; } };
  var mob = g('qi-mob').replace(/\D/g, '').slice(-10);
  if (!g('qi-nm') || !g('qi-org') || !g('qi-dist')) return err(qiT('Please fill organisation, your name and a valid 10-digit mobile number.'));
  if (!/^[6-9]\d{9}$/.test(mob)) return err(qiT('Enter a valid 10-digit mobile number.'));
  var b = document.querySelector('#qi-ov .qi-btn'); if (b) { b.disabled = true; b.textContent = '…'; } err('');
  try {
    var r = await nfCall('submitEnquiry', { source: 'interest', app: 'play', program: qiProgName(), setting: _qi.setting, interestType: _qi.ftype ? qiTypeName() : '',
      orgName: g('qi-org'), contactName: g('qi-nm'), mobile: mob, district: g('qi-dist'), state: g('qi-st'), beds: g('qi-beds'), message: g('qi-msg') });
    _qi.ref = (r && r.ref) || ''; _qi.step = 'thanks'; qiRender();
  } catch (e) { if (b) { b.disabled = false; b.textContent = qiT('Keep me informed'); } err(e.message); }
}
(function () {
  if (!qiIsPlay()) return;
  var start = function () {
    // signed in once on this phone = not new: never show it by itself again
    if (typeof nfRouteAuthed === 'function' && !nfRouteAuthed._qi) { var o = nfRouteAuthed; nfRouteAuthed = function () { qiClose(); if (!qiGetPick()) qiSetPick({ skip: 1, at: Date.now() }); return o.apply(this, arguments); }; nfRouteAuthed._qi = 1; }
    if (!qiGetPick()) qiOpen('setting');
    // "Programmes" on the login screen
    var add = function () { var top = document.querySelector('.nf-l-top'); if (top && !top.querySelector('.qi-prog')) { var b = document.createElement('button'); b.type = 'button'; b.className = 'qi-prog'; b.innerHTML = '<i class="ti ti-layout-grid" aria-hidden="true"></i> ' + qiE(qiT('Programmes')); b.onclick = function () { _qi.setting = ''; qiOpen('setting'); }; top.insertBefore(b, top.querySelector('.nf-l-lang')); } };
    add(); try { new MutationObserver(function () { add(); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
