// ══════════════════════════════════════════════════════════════
// BEFORE DAY 1 (approved 28 Nov 2026)
//   S1 In-charge (CHO), no start date: "Set up your facility" instead of Today — baseline fee (only where it must be paid
//      first) · choose Day 1 (same picker and rules: shared/startdate.js) · team · checklist · population and location
//   S2 In-charge, Day 1 chosen but not here yet: a countdown and Get ready
//   S3 ANM / ASHA / MPW: the countdown (or "your in-charge chooses Day 1") — never a Day 1 card before Day 1
//   The Facility profile does not open by itself while the in-charge still has to choose Day 1.
// ══════════════════════════════════════════════════════════════
function susHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function susT(en, hi) { return susHi() && hi ? hi : en; }
function susE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function susToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function susAdd(ymd, n) { var d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function susDays(a, b) { return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5); }
function susFmt(ymd, wd) { try { var d = new Date(ymd + 'T00:00:00Z'), M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (wd ? W[d.getUTCDay()] + ', ' : '') + d.getUTCDate() + ' ' + M[d.getUTCMonth()]; } catch (e) { return ymd; } }
function susIc(n) { return '<i class="ti ti-' + n + '"></i>'; }
// where the facility is: 'setup' (in-charge, no Day 1) · 'nodate' (others, no Day 1) · 'wait' (Day 1 ahead) · null (started)
function susState() {
  try { if (typeof appMode === 'undefined' || appMode !== 'cho' || !choState.facilityCode) return null;
    var f = choState.facility || {}, st = choState.startDate || f.startDate || '', role = choState.roleId || 'CHO';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(st)) return role === 'CHO' ? 'setup' : 'nodate';
    return st > susToday() ? 'wait' : null; } catch (e) { return null; }
}
function susTeam() {
  var S = (typeof _nfFac !== 'undefined' && _nfFac && _nfFac.code === choState.facilityCode && _nfFac.staff) || (choState.facility || {}).staff || {}, me = String(choState.staffMobile || ''), roles = {}, n = 0;
  Object.keys(S).forEach(function (m) { var s = S[m]; if (!s || s.disabled) return; n++; roles[s.role || 'CHO'] = 1; });
  var miss = ['ANM', 'ASHA', 'MPW'].filter(function (r) { return !roles[r]; });
  return { n: n, miss: miss, line: ['ANM', 'ASHA', 'MPW'].map(function (r) { return r + (roles[r] ? ' ✓' : ' —'); }).join(' · ') };
}
function susFlagsSet() { try { return !!(typeof blsFlags === 'function' && blsFlags().at); } catch (e) { return false; } }
function susPopLoc() { var f = choState.facility || {}; return { pop: !!(f.population && f.population.n), geo: !!(f.geo && f.geo.lat != null) }; }
function susOpenTeam() { try { if (typeof _scDual !== 'undefined' && _scDual && typeof scb1ShowTab === 'function') { Promise.resolve(scb1ShowTab('dash')).then(function () { setTimeout(function () { try { faTab('staff'); } catch (e) {} }, 300); }); return; } } catch (e) {} showToast(susT('Ask HealSol to add your staff.', 'स्टाफ़ जोड़ने के लिए HealSol से कहें।'), 'ok'); }
function susVideo() { try { if (typeof ahUrl === 'function' && typeof _ah !== 'undefined' && _ah.d) { var L = _ah.d.baseline || {}, u = ahUrl(susHi() ? (L.hi || L.en) : (L.en || L.hi)); if (u) { window.open(u, '_blank', 'noopener'); return; } } } catch (e) {} if (typeof nfHelp === 'function') nfHelp(); }

// ── S1: set up your facility ──
function susStep(n, state, t, s, go, body) {
  var mark = state === 'done' ? susIc('check') : n;
  return '<div class="sus-st ' + state + '"' + (go && state !== 'now' ? ' role="button" tabindex="0" onclick="' + go + '"' : '') + '><div class="sus-sh"><span class="sus-n">' + mark + '</span><span class="sus-tx"><b>' + susE(t) + '</b><small>' + susE(s) + '</small></span>'
    + (state !== 'now' ? susIc('chevron-right') : '') + '</div>' + (body || '') + '</div>';
}
function susSetupHTML() {
  var f = choState.facility || {}, code = choState.facilityCode, fee = !fbFree(f), feeDue = fee && fbDue(f), T = susTeam(), cl = susFlagsSet(), pl = susPopLoc(), steps = [], done = 0, k = 1;
  if (fee) { steps.push(feeDue ? susStep(k++, 'now', susT('Pay the baseline fee', 'बेसलाइन शुल्क जमा करें'), susT('Needed before you choose Day 1.', 'दिन 1 चुनने से पहले ज़रूरी।'), '', '<div class="sus-sd sd-host" data-sus="1"></div>')
      : susStep(k++, 'done', susT('Your baseline fee', 'आपका बेसलाइन शुल्क'), susT('Paid ✓', 'जमा ✓'), '')); if (!feeDue) done++; }
  steps.push(susStep(k++, feeDue ? 'next' : 'now', susT('Choose your Day 1', 'अपना दिन 1 चुनें'), feeDue ? susT('After the fee is paid.', 'शुल्क जमा होने के बाद।') : susT('The 60 days start on this date — the baseline is Days 1–7.', '60 दिन इसी तारीख से शुरू — बेसलाइन दिन 1–7।'), '', feeDue ? '' : '<div class="sus-sd sd-host" data-sus="1"></div>'));
  steps.push(susStep(k++, T.miss.length ? 'next' : 'done', susT('Check your team', 'अपनी टीम देखें'), susT(T.n + ' staff added · ' + T.line + ' · they can log in before Day 1', T.n + ' स्टाफ़ जोड़े · ' + T.line + ' · दिन 1 से पहले लॉग इन कर सकते हैं'), 'susOpenTeam()')); if (!T.miss.length) done++;
  steps.push(susStep(k++, cl ? 'done' : 'next', susT('Checklist for your facility', 'आपके केंद्र की चेकलिस्ट'), cl ? susT('Set ✓', 'सेट ✓') : susT('1 minute · it decides which lines your team answers', '1 मिनट · इससे तय होता है कि टीम कौन-सी पंक्तियाँ भरेगी'), 'blsFlagsOpen()')); if (cl) done++;
  steps.push(susStep(k++, pl.pop && pl.geo ? 'done' : 'next', susT('Population and location', 'जनसंख्या और स्थान'), pl.pop && pl.geo ? susT('Added ✓', 'दर्ज ✓') : susT('Optional · can be done later', 'वैकल्पिक · बाद में भी कर सकते हैं'), 'fpoOpen()')); if (pl.pop && pl.geo) done++;
  var tot = k - 1, bars = ''; for (var i = 0; i < tot; i++) bars += '<i' + (i < done ? ' class="on"' : '') + '></i>';
  var nm = (choState.staffName || '').split(' ')[0];
  return '<div class="sus-x sus-top"><small>' + susE((f.name || code) + ' · CHO · ' + susT('in-charge', 'प्रभारी')) + '</small><h1>' + susE(susT('Namaste, ', 'नमस्ते, ') + nm) + ' 🙏</h1></div>'
    + '<div class="sus-x sus-hero"><span class="sus-k">' + susE(susT('SET UP YOUR FACILITY · ' + done + ' OF ' + tot + ' DONE', 'अपना केंद्र तैयार करें · ' + tot + ' में से ' + done + ' पूरे')) + '</span><b>' + susE(susT(tot + ' steps before Day 1', 'दिन 1 से पहले ' + tot + ' कदम')) + '</b>'
    + '<small>' + susE(susT('Only Day 1 is needed to start. You can finish the rest any time before the baseline.', 'शुरू करने के लिए केवल दिन 1 ज़रूरी है। बाकी बेसलाइन से पहले कभी भी पूरा करें।')) + '</small><div class="sus-bar">' + bars + '</div></div>'
    + '<div class="sus-x sus-steps">' + steps.join('') + '</div>';
}
function fbFree(f) { return typeof fbIsFree === 'function' ? fbIsFree(f) : true; }
function fbDue(f) { return typeof fbNeedsBl === 'function' ? fbNeedsBl(f) : false; }

// ── S2 / S3: waiting for Day 1 ──
function susRow(icon, t, s, go, done) {
  return '<div class="sus-r" role="button" tabindex="0" onclick="' + go + '">' + susIc(icon) + '<span class="sus-tx"><b' + (done ? ' class="done"' : '') + '>' + susE(t) + '</b><small>' + susE(s) + '</small></span>' + (done ? '<i class="ti ti-circle-check ok"></i>' : susIc('chevron-right')) + '</div>';
}
function susWaitHTML(st) {
  var f = choState.facility || {}, role = choState.roleId || 'CHO', cho = role === 'CHO', start = choState.startDate || f.startDate || '', nm = (choState.staffName || '').split(' ')[0];
  var hrs = new Date(Date.now() + 5.5 * 3600e3).getUTCHours(), gr = hrs < 12 ? susT('Good morning', 'सुप्रभात') : hrs < 17 ? susT('Good afternoon', 'नमस्ते') : susT('Good evening', 'शुभ संध्या');
  var stars = (document.querySelector('#nf-today .nf-top h1 .nfi-tag') || {}).outerHTML || '';
  var h = '<div class="sus-x sus-top sus-row"><div><small>' + susE((f.name || choState.facilityCode) + ' · ' + role) + '</small><h1>' + susE(gr + ', ' + nm) + '</h1>' + stars + '</div>'
    + (start ? '<span class="sus-chip">' + susE(susT('Starts ', 'शुरुआत ') + susFmt(start)) + '</span>' : '') + '</div>';
  if (st === 'nodate') return h + '<div class="sus-x sus-hero"><span class="sus-k">' + susE(susT('NOT STARTED YET', 'अभी शुरू नहीं')) + '</span><b>' + susE(susT('Your in-charge chooses Day 1', 'आपके प्रभारी दिन 1 चुनेंगे')) + '</b><small>' + susE(susT('Your cards open on that day. Until then, get ready below.', 'आपके कार्ड उसी दिन खुलेंगे। तब तक नीचे तैयारी करें।')) + '</small></div>' + susReadyStaff();
  var left = susDays(susToday(), start), end = susAdd(start, 6);
  h += '<div class="sus-x sus-hero"><span class="sus-k">' + susE(susT('BEFORE DAY 1', 'दिन 1 से पहले')) + '</span><div class="sus-cd"><span class="sus-ring"><b>' + left + '</b><small>' + susE(left === 1 ? susT('day to go', 'दिन बाकी') : susT('days to go', 'दिन बाकी')) + '</small></span><span><b>' + susE(susT('Day 1 starts ' + susFmt(start, true), 'दिन 1 की शुरुआत ' + susFmt(start, true))) + '</b><small>' + susE(susT('Baseline Days 1–7 · ends ' + susFmt(end, true), 'बेसलाइन दिन 1–7 · ' + susFmt(end, true) + ' तक')) + '</small></span></div>'
    + '<small>' + susE(cho ? susT('Cards open on Day 1. Until then, get the team ready.', 'कार्ड दिन 1 पर खुलेंगे। तब तक टीम को तैयार करें।') : susT('Your cards open on Day 1. Your in-charge set this date.', 'आपके कार्ड दिन 1 पर खुलेंगे। यह तारीख आपके प्रभारी ने तय की।')) + '</small></div>';
  if (!cho) return h + susReadyStaff();
  var T = susTeam(), cl = susFlagsSet(), pl = susPopLoc();
  h += '<div class="nf-card sus-x sus-card"><span class="sus-k2">' + susE(susT('GET READY', 'तैयारी')) + '</span>'
    + susRow('users', T.miss.length ? susT('Add the ' + T.miss.join(', '), T.miss.join(', ') + ' जोड़ें') : susT('Your team', 'आपकी टीम'), susT(T.n + ' staff · ' + T.line, T.n + ' स्टाफ़ · ' + T.line), 'susOpenTeam()', !T.miss.length)
    + susRow('adjustments', susT('Checklist for your facility', 'आपके केंद्र की चेकलिस्ट'), cl ? susT('Set ✓', 'सेट ✓') : susT('1 minute — before Day 1', '1 मिनट — दिन 1 से पहले'), 'blsFlagsOpen()', cl)
    + susRow('player-play', susT('Watch: Doing a baseline day', 'देखें: बेसलाइन का दिन कैसे करें'), susT('Short video · EN / हिं', 'छोटा वीडियो · EN / हिं'), 'susVideo()', false)
    + susRow('map', susT('Population and location', 'जनसंख्या और स्थान'), pl.pop && pl.geo ? susT('Added ✓', 'दर्ज ✓') : susT('Optional · on the Facility profile', 'वैकल्पिक · केंद्र प्रोफ़ाइल पर'), 'fpoOpen()', pl.pop && pl.geo) + '</div>'
    + '<button type="button" class="sus-x sus-chg" onclick="susChange()">' + susE(susT('Change Day 1 (until it begins) ›', 'दिन 1 बदलें (शुरू होने तक) ›')) + '</button>';
  return h;
}
function susReadyStaff() {
  return '<div class="nf-card sus-x sus-card"><span class="sus-k2">' + susE(susT('BEFORE DAY 1', 'दिन 1 से पहले')) + '</span>'
    + susRow('player-play', susT('Watch: Doing a baseline day', 'देखें: बेसलाइन का दिन कैसे करें'), susT('Short video · EN / हिं', 'छोटा वीडियो · EN / हिं'), 'susVideo()', false)
    + susRow('help-circle', susT('How the 60 days work', '60 दिन कैसे चलते हैं'), susT('Me → How to use the app', 'Me → ऐप कैसे इस्तेमाल करें'), 'nfHelp()', false)
    + (typeof nfChangeMyPassword === 'function' ? susRow('key', susT('Change your password', 'अपना पासवर्ड बदलें'), susT('Do it once now', 'अभी एक बार कर लें'), 'nfChangeMyPassword()', false) : '') + '</div>';
}
function susChange() {   // the same picker, in a sheet
  var ov = document.createElement('div'); ov.id = 'sus-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
  ov.innerHTML = '<div class="sus-sheet"><b>' + susE(susT('Change Day 1', 'दिन 1 बदलें')) + '</b><div class="sus-sd sd-host"></div><button type="button" class="sus-close" onclick="document.getElementById(\'sus-ov\').remove()">' + susE(susT('Close', 'बंद करें')) + '</button></div>';
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov);
  if (typeof sdMount === 'function') { delete _sd.info[choState.facilityCode]; sdMount(ov.querySelector('.sd-host'), choState.facilityCode); }
}

// ── Today ──
function susApply() {
  var host = document.getElementById('nf-today'); if (!host) return; var st = susState();
  host.classList.toggle('sus', !!st); document.body.classList.toggle('sus-on', !!st); host.querySelectorAll('.sus-x').forEach(function (e) { e.remove(); }); if (!st) return;
  host.insertAdjacentHTML('beforeend', st === 'setup' ? susSetupHTML() : susWaitHTML(st));
  host.querySelectorAll('.sd-host[data-sus]').forEach(function (h) { if (typeof sdMount === 'function') sdMount(h, choState.facilityCode); });
  try { if (typeof ahLoad === 'function' && typeof _ah !== 'undefined' && !_ah.d) ahLoad(); } catch (e) {}
}
(function () {
  if (typeof nfRenderToday === 'function') { var o = nfRenderToday; nfRenderToday = function () { var r = o.apply(this, arguments); try { susApply(); } catch (e) { console.warn('[SUS]', e); } return r; }; }
  if (typeof fpoAuto === 'function') { var a = fpoAuto; fpoAuto = function () { if (susState() === 'setup') return; return a.apply(this, arguments); }; }   // set up first
  if (typeof sdAfter === 'function') { var s = sdAfter; sdAfter = function (code) { var r = s.apply(this, arguments); try { var ov = document.getElementById('sus-ov'); if (ov) ov.remove(); if (document.getElementById('nf-today') && typeof nfRenderToday === 'function') nfRenderToday(); } catch (e) {} return r; }; }
})();
