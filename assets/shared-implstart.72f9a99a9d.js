// ══════════════════════════════════════════════════════════════
// Implementation starts after payment or a commitment (20 Nov 2026; canvas "Implementation start after payment")
//   After the free baseline a trial facility WAITS — its programme clock is paused. Payment, or a District / Block / State /
//   partner commitment recorded by HealSol, lets the in-charge choose the first implementation day (Day 8; CHC Day 15):
//   the server (implstart.js) moves the clock so that day is Day 8. Until it comes the cards stay closed ("starting").
//   States (nfWait): wait · pick · starting. Server twin: functions/implstart.js waitOf.
// ══════════════════════════════════════════════════════════════
var _nfis = { info: null };
function isE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function isHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function isT(en, hi) { return isHi() && hi ? hi : en; }
function isToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function isAdd(ymd, n) { var d = new Date(ymd + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function isDayNo(start, today) { return Math.floor((Date.parse(today) - Date.parse(start)) / 864e5) + 1; }
function isFmt(ymd, wd) { try { return new Date(ymd + 'T12:00:00Z').toLocaleDateString(isHi() ? 'hi-IN' : 'en-IN', wd ? { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'short' }); } catch (e) { return ymd; } }
function isBase(f) { try { var t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f && f.type) || 'sc', L = (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[t]) || {}; return (L.plan && L.plan.base) || 7; } catch (e) { return 7; } }
function isDays(f) { try { var t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f && f.type) || 'sc', L = (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[t]) || {}; return L.days || 60; } catch (e) { return 60; } }
function isCommit(f) { return !!(f && f.officePay && f.officePay.commit); }
// the facility's wait state, or null
function nfWait(f, startDate) {
  var s = startDate || (f && f.startDate), today = isToday(); if (!f || !/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return null;
  if (f.implFrom && f.implFrom > today) return { k: 'starting', on: f.implFrom };
  if (f.implPick) return { k: 'pick', since: f.implPick.since || null };
  var st = f.subscriptionStatus, b = isBase(f), d = isDayNo(s, today), op = f.officePay;
  var open = !st || st === 'paid' || st === 'contract' || isCommit(f) || !!(op && op.until && op.until >= today);
  if (d > b && !f.implFrom && !open) { var since = f.blDoneOn && f.blDoneOn > isAdd(s, b - 1) ? isAdd(f.blDoneOn, 1) : isAdd(s, b); return { k: 'wait', d: Math.max(0, isDayNo(since, today) - 1), since: since }; }   // from the day after the baseline was finished
  return null;
}

// ── the gates: Sub-Centre (phcCheckAccess) and UPHC / PHC / CHC (nduLocked / nduOpen) ──
function isScFac() { var f = (typeof choState !== 'undefined' && choState.facility) || {}; return Object.assign({}, f, { startDate: (typeof choState !== 'undefined' && choState.startDate) || f.startDate }); }
(function () { if (typeof phcCheckAccess !== 'function') return; var o = phcCheckAccess;
  phcCheckAccess = function (di) {
    try { var f = isScFac(), b = isBase(f);
      if (f.implFrom && f.implFrom > isToday()) return false;     // starting soon: every card waits for the chosen day
      if (f.implPick) return (di + 1) <= b;                        // choose Day 8 first
      if (isCommit(f)) return true;                               // a District / partner has committed
    } catch (e) {}
    return o.apply(this, arguments); }; })();
(function () {
  if (typeof nduLocked === 'function') { var o = nduLocked;
    nduLocked = function (day) { try { if (_nd && !_nd.view && _nd.fac) { var f = _nd.fac;
      if (f.implFrom && f.implFrom > isToday()) return true;
      if (f.implPick) return day > nduBase();
      if (isCommit(f)) return false; } } catch (e) {} return o.apply(this, arguments); }; }
  if (typeof nduOpen === 'function') { var p = nduOpen;
    nduOpen = function () { try { if (_nd && _nd.fac && (isCommit(_nd.fac) || _nd.fac.implPick)) return true; } catch (e) {} return p.apply(this, arguments); }; }
})();

// ── the cards: choose Day 8 · starting on … ──
function isTimeline(f, date) {
  var b = isBase(f), n = isDays(f), d = function (k) { return isAdd(date, k - b - 1); }, bs = f.baselineStart || f.startDate;
  var rows = [[isT('Baseline', 'बेसलाइन'), bs ? isFmt(bs) + ' – ' + isFmt(isAdd(bs, b - 1)) : '—']];
  var S = typeof nfDeptShape === 'function' && (typeof nfTypeOf === 'function' ? nfTypeOf(f) : 'sc') !== 'sc' ? nfDeptShape((NF_LEVELS[nfTypeOf(f)] || {})) : { i1: b + 1, iN: 49, e1: 50, eN: 56, days: n };
  rows.push([isT('Implementation', 'कार्यान्वयन') + ' (' + isT('Days', 'दिन') + ' ' + S.i1 + '–' + S.iN + ')', isFmt(d(S.i1)) + ' – ' + isFmt(d(S.iN))]);
  rows.push([isT('End-line', 'एंड-लाइन') + ' (' + isT('Days', 'दिन') + ' ' + S.e1 + '–' + S.eN + ')', isFmt(d(S.e1)) + ' – ' + isFmt(d(S.eN))]);
  rows.push([isT('Graduation', 'ग्रेजुएशन') + ' (' + isT('Day', 'दिन') + ' ' + S.days + ')', isFmt(d(S.days))]);
  return '<div class="is-tl">' + rows.map(function (r) { return '<div><span>' + isE(r[0]) + '</span><b>' + isE(r[1]) + '</b></div>'; }).join('') + '</div>';
}
function isPickHTML(f, code, inCharge, icName) {
  var b = isBase(f), op = f.officePay, paid = f.subscriptionStatus === 'paid';
  var head = paid ? '<div class="is-ok"><i class="ti ti-circle-check" aria-hidden="true"></i><span><b>' + isE(isT('Payment received', 'भुगतान प्राप्त हुआ')) + '</b><small>' + isE(isT('Your programme is confirmed.', 'आपका कार्यक्रम पक्का हो गया है।')) + '</small></span></div>'
    : isCommit(f) ? '<div class="is-ok c"><i class="ti ti-building-community" aria-hidden="true"></i><span><b>' + isE(isT((op.org || 'Your District') + ' will pay for your programme', (op.org || 'आपका ज़िला') + ' आपके कार्यक्रम का भुगतान करेगा')) + '</b><small>' + isE(isT('Nothing to pay from your side.', 'आपकी ओर से कोई भुगतान नहीं।')) + '</small></span></div>' : '';
  if (!inCharge) return '<div class="is-card" id="is-card">' + head + '<b class="is-h">' + isE(isT('Implementation is about to start', 'कार्यान्वयन शुरू होने वाला है')) + '</b><p>' + isE(isT((icName || 'Your in-charge') + ' is choosing the day your cards start again from Day ' + (b + 1) + '. You will get a message.', (icName || 'आपके प्रभारी') + ' दिन ' + (b + 1) + ' से कार्ड फिर शुरू होने का दिन चुन रहे हैं। आपको संदेश मिलेगा।')) + '</p></div>';
  return '<div class="is-card" id="is-card">' + head + '<b class="is-h">' + isE(isT('When should Day ' + (b + 1) + ' start?', 'दिन ' + (b + 1) + ' कब से शुरू हो?')) + '</b>'
    + '<p>' + isE(isT('Pick a day when your team is ready. Implementation counts from that day — no days are lost.', 'जब आपकी टीम तैयार हो, वह दिन चुनें। कार्यान्वयन उसी दिन से गिना जाएगा — कोई दिन नहीं छूटेगा।')) + '</p>'
    + '<label class="is-l" for="is-date">' + isE(isT('Day ' + (b + 1) + ' date', 'दिन ' + (b + 1) + ' की तारीख़')) + '</label><select id="is-date" class="is-sel" onchange="isPreview(\'' + isE(code) + '\')"><option>' + isE(isT('Loading…', 'लोड हो रहा है…')) + '</option></select>'
    + '<div id="is-tl"></div><div class="is-err" id="is-err" role="alert"></div>'
    + '<button type="button" class="is-btn" id="is-go" onclick="isConfirm(\'' + isE(code) + '\')" disabled>' + isE(isT('Confirm and tell my team', 'पक्का करें और टीम को बताएँ')) + '</button></div>';
}
function isStartingHTML(f) {
  var b = isBase(f);
  return '<div class="is-card" id="is-card"><div class="is-ok"><i class="ti ti-calendar-check" aria-hidden="true"></i><span><b>' + isE(isT('Implementation starts on ' + isFmt(f.implFrom, true), 'कार्यान्वयन ' + isFmt(f.implFrom, true) + ' से शुरू होगा')) + '</b><small>'
    + isE(isT('Your cards open again on that day, from Day ' + (b + 1) + '. Your baseline report stays open meanwhile.', 'उस दिन दिन ' + (b + 1) + ' से आपके कार्ड फिर खुलेंगे। तब तक आपकी बेसलाइन रिपोर्ट खुली रहेगी।')) + '</small></span></div>' + isTimeline(f, f.implFrom) + '</div>';
}
async function isLoadPick(code, f) {
  var sel = document.getElementById('is-date'); if (!sel) return;
  try { _nfis.info = await nfCall('implStartInfo', { code: code }); } catch (e) { var er = document.getElementById('is-err'); if (er) er.textContent = typeof nfErrText === 'function' ? nfErrText(e) : String(e.message || e); return; }
  var I = _nfis.info, opts = '', d = I.from; _nfis.f = f;
  for (var k = 0; k < 7 && d <= I.to; k++) { opts += '<option value="' + d + '">' + isE(isFmt(d, true) + (k === 0 ? ' (' + isT('tomorrow', 'कल') + ')' : '')) + '</option>'; d = isAdd(d, 1); }
  sel.innerHTML = opts; var go = document.getElementById('is-go'); if (go) go.disabled = false; isPreview(code);
}
function isPreview() { var sel = document.getElementById('is-date'), tl = document.getElementById('is-tl'); if (!sel || !tl || !_nfis.f || !/^\d{4}/.test(sel.value)) return; tl.innerHTML = isTimeline(_nfis.f, sel.value); }
async function isConfirm(code) {
  var sel = document.getElementById('is-date'), go = document.getElementById('is-go'), er = document.getElementById('is-err'); if (!sel || !/^\d{4}/.test(sel.value)) return;
  if (go) { go.disabled = true; go.textContent = isT('Saving…', 'सहेज रहे हैं…'); } if (er) er.textContent = '';
  try { await nfCall('setImplStart', { code: code, date: sel.value }); if (typeof showToast === 'function') showToast(isT('Day ' + (isBase(_nfis.f) + 1) + ' is ' + isFmt(sel.value, true) + '. Your team will see it in the app.', 'दिन ' + (isBase(_nfis.f) + 1) + ': ' + isFmt(sel.value, true)), 'ok'); setTimeout(function () { location.reload(); }, 900); }
  catch (e) { if (er) er.textContent = typeof nfErrText === 'function' ? nfErrText(e) : String(e.message || e); if (go) { go.disabled = false; go.textContent = isT('Confirm and tell my team', 'पक्का करें और टीम को बताएँ'); } }
}
// Sub-Centre: the locked day shows these instead of the payment card
(function () { if (typeof renderUpgradeCard !== 'function') return; var o = renderUpgradeCard;
  renderUpgradeCard = async function (container, day) {
    try { var f = isScFac(), w = nfWait(f), code = (typeof choState !== 'undefined' && choState.facilityCode) || f.code || '';
      if (w && (w.k === 'pick' || w.k === 'starting')) {
        var ic = typeof nfIsChoNow === 'function' ? nfIsChoNow() : true;
        container.innerHTML = w.k === 'starting' ? isStartingHTML(f) : isPickHTML(f, code, ic, f.choName || 'CHO');
        if (w.k === 'pick' && ic) isLoadPick(code, f); return; }
    } catch (e) { console.warn('[implstart]', e); }
    return o.apply(this, arguments); }; })();
// UPHC / PHC / CHC: the Unlock card's place
(function () { if (typeof nduFill !== 'function') return; var o = nduFill;
  nduFill = async function () {
    try { var f = _nd && _nd.fac, w = f && nfWait(f), card = document.getElementById('ndu-card');
      if (card && w && (w.k === 'pick' || w.k === 'starting')) {
        var ic = typeof nduInCharge === 'function' ? nduInCharge() : true, nm = typeof nduInChargeName === 'function' ? nduInChargeName() : '';
        var tmp = document.createElement('div'); tmp.innerHTML = w.k === 'starting' ? isStartingHTML(Object.assign({}, f)) : isPickHTML(f, _nd.code, ic, nm);
        card.replaceWith(tmp.firstChild); if (w.k === 'pick' && ic) isLoadPick(_nd.code, f); return; }
    } catch (e) { console.warn('[implstart]', e); }
    return o.apply(this, arguments); }; })();

// ── HealSol: record a commitment (facility Manage menu) ──
var IS_KINDS = [{ value: 'district', label: 'District' }, { value: 'block', label: 'Block' }, { value: 'state', label: 'State' }, { value: 'partner', label: 'Partner / CSR' }];
function isWaitingInDistrict(code) {
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, me = F[code] || {};
  return Object.keys(F).filter(function (c) { var f = F[c]; if (c === code || !f || f.migratedTo || f.showcase || f.testFac) return false;
    var w = nfWait(f); return w && w.k === 'wait' && f.district === me.district && f.state === me.state; });
}
async function isCommitDialog(code) {
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, f = F[code] || {}, others = isWaitingInDistrict(code);
  var fields = [{ key: 'kind', label: 'Who has committed?', type: 'select', value: 'district', options: IS_KINDS },
    { key: 'org', label: 'Name', value: f.district ? f.district + ' District Health Society' : '', required: true },
    { key: 'payBy', label: 'Payment expected by', type: 'date', value: isAdd(isToday(), 30), required: true },
    { key: 'ref', label: 'Letter / order number (optional)', value: '' }];
  if (others.length) fields.push({ key: 'more', label: 'Also for these waiting facilities of ' + (f.district || 'this district'), type: 'checklist', options: others.map(function (c) { return { value: c, label: (F[c].name || c) + ' · ' + c }; }), value: others });
  var v = await scDialog({ title: 'Start implementation without payment', icon: '🏛️', okLabel: 'Record commitment',
    message: (f.name || code) + '\nFor a District, Block, State or partner that has committed to pay. ' + (f.startDate ? 'The facility chooses its Day ' + (isBase(f) + 1) + ' straight away.' : 'The facility can choose its Day 1 now, without paying the baseline fee first.') + ' If nothing is paid by the date, it shows in Business → Collect; its cards stay open.', fields: fields });
  if (!v) return;
  var codes = [code].concat(Array.isArray(v.more) ? v.more : []);
  try { var r = await nfCall('commitProgramme', { codes: codes, kind: v.kind, org: v.org, payBy: v.payBy, ref: v.ref });
    (r.done || []).forEach(function (x) { if (F[x.code]) { F[x.code].officePay = { commit: true, kind: v.kind, org: v.org, until: v.payBy, ref: v.ref || null }; if (x.pick) F[x.code].implPick = { since: isToday() }; } });
    showToast('Commitment recorded for ' + (r.done || []).length + ' facilit' + ((r.done || []).length === 1 ? 'y' : 'ies') + ((r.skipped || []).length ? ' · ' + r.skipped.length + ' skipped (already paid)' : '') + '.', 'ok');
    if (typeof scRenderMasterDashboard === 'function') try { scRenderMasterDashboard(); } catch (e) {} if (typeof hsRenderFac === 'function' && document.getElementById('hs-fq')) try { hsRenderFac(); } catch (e) {}
  } catch (e) { showToast(nfErrText(e), 'err'); }
}
async function isEndCommit(code) {
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, f = F[code] || {}, op = f.officePay || {};
  var ok = await scDialog({ title: 'End this commitment?', icon: '✋', okLabel: 'End commitment', message: (f.name || code) + '\nCommitted by ' + (op.org || '—') + ', payment expected by ' + (op.until || '—') + '.\n\n' + (f.implFrom && f.implFrom > isToday() ? 'Day ' + (isBase(f) + 1) + ' was set for ' + isFmt(f.implFrom, true) + '. That date is cancelled and the facility goes back to waiting (its clock is paused again).' : f.implFrom ? 'Implementation is already running. If the facility has not paid, its cards after the baseline lock again.' : 'The facility goes back to waiting. Its cards after the baseline stay locked until it pays.') }); if (!ok) return;
  try { await nfCall('endCommitment', { code: code }); if (F[code]) { var g = F[code]; g.officePay = null; g.implPick = null; if (g.implFrom && g.implFrom > isToday()) { g.startDate = g.baselineStart || g.startDate; g.implFrom = null; g.baselineStart = null; } } showToast('Commitment ended.', 'ok'); if (typeof scRenderMasterDashboard === 'function') try { scRenderMasterDashboard(); } catch (e) {} if (typeof hsRenderFac === 'function' && document.getElementById('hs-fq')) try { hsRenderFac(); } catch (e) {} } catch (e) { showToast(nfErrText(e), 'err'); }
}
(function () { if (typeof nfFacMenu !== 'function') return; var o = nfFacMenu;
  nfFacMenu = function (btn, code) { var r = o.apply(this, arguments);
    try { var m = document.getElementById('mfc-menu'), f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {}; if (!m || f.subscriptionStatus === 'paid' || f.subscriptionStatus === 'contract') return r;
      var C = String(code).replace(/'/g, "\\'"), b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem');
      if (isCommit(f)) { b.className = 'a'; b.innerHTML = '<i class="ti ti-building-community"></i>End commitment (' + isE(f.officePay.org || '') + ')'; b.setAttribute('onclick', "document.getElementById('mfc-menu').remove();isEndCommit('" + C + "')"); }
      else { b.innerHTML = '<i class="ti ti-building-community"></i>Record a District / partner commitment'; b.setAttribute('onclick', "document.getElementById('mfc-menu').remove();isCommitDialog('" + C + "')"); }
      var last = m.querySelector('button.r'); if (last) m.insertBefore(b, last); else m.appendChild(b);
    } catch (e) {} return r; }; })();

// ── dashboards: "Waiting · 9 days" instead of On track / Behind ──
function isWaitChip(w) {
  if (!w) return '';
  if (w.k === 'pick') return '<span class="nfd-chip a">' + isE(isT('Choosing Day 8', 'दिन 8 चुन रहे')) + '</span>';
  if (w.k === 'starting') return '<span class="nfd-chip g">' + isE(isT('Starts ' + isFmt(w.on), isFmt(w.on) + ' से शुरू')) + '</span>';
  return '<span class="nfd-chip ' + (w.d >= 30 ? 'r' : 'a') + '">' + isE(isT('Waiting · ' + w.d + ' day' + (w.d === 1 ? '' : 's'), 'इंतज़ार · ' + w.d + ' दिन')) + '</span>';
}
(function () { if (typeof nfDStatusChip !== 'function') return; var o = nfDStatusChip;
  nfDStatusChip = function (r) { if (r && r.wt) return isWaitChip(r.wt); return o.apply(this, arguments); }; })();
// HealSol home: a commitment that is still running is not "payment due"
(function () { if (typeof nfTrialInfo !== 'function') return; var o = nfTrialInfo;
  nfTrialInfo = function (f) { var r = o.apply(this, arguments); try { if (r && f && isCommit(f) && f.officePay.until >= isToday()) r = Object.assign({}, r, { ended: false, committed: true }); } catch (e) {} return r; }; })();
// UPHC / PHC / CHC Today: the banner says what is next once the programme is confirmed
(function () { if (typeof ndRender !== 'function') return; var o = ndRender;
  ndRender = function () { var r = o.apply(this, arguments);
    try { var ban = document.getElementById('ndu-ban'), f = _nd && _nd.fac, w = f && nfWait(f); if (ban && w && (w.k === 'pick' || w.k === 'starting')) {
      var b = isBase(f), ic = typeof nduInCharge === 'function' && nduInCharge();
      ban.innerHTML = '<span class="ndu-bi">📅</span><span><b>' + isE(w.k === 'starting' ? isT('Implementation starts on ' + isFmt(f.implFrom, true), 'कार्यान्वयन ' + isFmt(f.implFrom, true) + ' से') : isT('Programme confirmed — choose Day ' + (b + 1), 'कार्यक्रम पक्का — दिन ' + (b + 1) + ' चुनें')) + '</b><small>'
        + isE(w.k === 'starting' ? isT('Your cards open again on that day.', 'उस दिन आपके कार्ड फिर खुलेंगे।') : ic ? isT('Pick the day your team starts implementation.', 'वह दिन चुनें जब आपकी टीम कार्यान्वयन शुरू करे।') : isT('Your in-charge is choosing the start day.', 'आपके प्रभारी शुरुआत का दिन चुन रहे हैं।')) + '</small></span>'
        + (w.k === 'pick' && ic ? '<button type="button" onclick="nduGoUnlock()">' + isE(isT('Choose', 'चुनें')) + '</button>' : ''); } } catch (e) {}
    return r; }; })();
// UPHC / PHC / CHC Facility dashboard (where the in-charge lands): the same news at the top
(function () { if (typeof ndRender !== 'function') return; var o = ndRender;
  ndRender = function () { var r = o.apply(this, arguments);
    try { if (typeof ndFaOn === 'function' && ndFaOn() && _nd && _nd.fac) { var w = nfWait(_nd.fac), app = document.getElementById('nf-dept-app'), old = document.getElementById('is-faban'); if (old) old.remove();
      if (w && app) { var b = isBase(_nd.fac), t, s, btn;
        if (w.k === 'wait') { t = isT('Baseline complete — implementation paused · ' + w.d + ' day' + (w.d === 1 ? '' : 's') + ' waiting', 'बेसलाइन पूरी — कार्यान्वयन रुका है · ' + w.d + ' दिन से'); s = isT('Day ' + (b + 1) + ' starts when payment or a District / partner commitment is confirmed. No days are lost.', 'भुगतान या ज़िले / सहयोगी की पुष्टि होने पर दिन ' + (b + 1) + ' शुरू होगा। कोई दिन नहीं छूटेगा।'); btn = isT('Pay / start', 'भुगतान / शुरू करें'); }
        else if (w.k === 'pick') { t = isT('Programme confirmed — choose Day ' + (b + 1), 'कार्यक्रम पक्का — दिन ' + (b + 1) + ' चुनें'); s = isT('Pick the day your team starts implementation.', 'वह दिन चुनें जब आपकी टीम कार्यान्वयन शुरू करे।'); btn = isT('Choose', 'चुनें'); }
        else { t = isT('Implementation starts on ' + isFmt(w.on, true), 'कार्यान्वयन ' + isFmt(w.on, true) + ' से'); s = isT('Your team’s cards open again on that day.', 'उस दिन आपकी टीम के कार्ड फिर खुलेंगे।'); btn = ''; }
        var top = app.querySelector('.nx') || app; top.insertAdjacentHTML('afterbegin', '<div class="ndu-ban" id="is-faban"><span class="ndu-bi">📅</span><span><b>' + isE(t) + '</b><small>' + isE(s) + '</small></span>' + (btn && typeof nduGoUnlock === 'function' ? '<button type="button" onclick="nduGoUnlock()">' + isE(btn) + '</button>' : '') + '</div>'); } } } catch (e) {}
    return r; }; })();
// Sub-Centre headers (20 Nov 2026, staging review): while waiting / choosing / starting, no "Week 3 · Day 15 / 60" and no
// "Implementation · Day 15 · 0/9 to work on today" banner on a closed card — they say what is really happening.
function isWaitLabel(w) {
  if (!w) return '';
  if (w.k === 'pick') return isT('Baseline done · choose Day 8', 'बेसलाइन पूरी · दिन 8 चुनें');
  if (w.k === 'starting') return isT('Day 8 starts ' + isFmt(w.on), 'दिन 8: ' + isFmt(w.on));
  return isT('Baseline done · paused ' + w.d + ' day' + (w.d === 1 ? '' : 's'), 'बेसलाइन पूरी · ' + w.d + ' दिन से रुका');
}
(function () { if (typeof nfCardsHead !== 'function') return; var o = nfCardsHead;
  nfCardsHead = function () { var r = o.apply(this, arguments); try { var w = nfWait(isScFac()), c = document.querySelector('#nf-cards-head .nf-chip'); if (w && c) c.textContent = isWaitLabel(w); } catch (e) {} return r; }; })();
(function () { if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () { var r = o.apply(this, arguments);
    try { var w = nfWait(isScFac()), k = document.querySelector('.nf-hero-k'), t = document.querySelector('.nf-hero-t'); if (w && k && t) { k.textContent = isWaitLabel(w);
      t.textContent = w.k === 'pick' ? isT('Programme confirmed — choose when Day 8 starts', 'कार्यक्रम पक्का — दिन 8 कब शुरू हो, चुनें') : w.k === 'starting' ? isT('Implementation starts on ' + isFmt(w.on, true), 'कार्यान्वयन ' + isFmt(w.on, true) + ' से') : isT('Implementation is paused — no days are lost', 'कार्यान्वयन रुका है — कोई दिन नहीं छूटेगा'); } } catch (e) {}
    return r; }; })();
(function () { if (typeof renderCard !== 'function') return; var o = renderCard;
  renderCard = function (di) { var r = o.apply(this, arguments);
    try { if (nfWait(isScFac()) && !phcCheckAccess(di)) { var c = document.getElementById('card-container'); if (c) c.querySelectorAll('.scd-banner').forEach(function (b) { b.remove(); }); } } catch (e) {}
    return r; }; })();
(function () { if (typeof scb2RenderWsMini !== 'function') return; var o = scb2RenderWsMini;
  scb2RenderWsMini = function () { var r = o.apply(this, arguments);
    try { var w = nfWait(isScFac()), s = document.querySelector('#scb2-ws-mini .scb2-sub'); if (w && s) s.textContent = isWaitLabel(w); } catch (e) {} return r; }; })();
