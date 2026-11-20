// ══════════════════════════════════════════════════════════════
// PROGRAMME START DATE (4 Nov 2026) — set once before Day 1; after that, a request to HealSol
//   In-charge (SC Facility dashboard → More, UPHC / PHC / CHC → Programme start date): before Day 1 a date from the opening
//   date (first batch 20 Nov 2026) or today, up to 7 days ahead; from Day 1 the date is locked and "Request a change"
//   sends the new date and a reason. HealSol: Business → "Start date requests" (approve a new date / give catch-up instead /
//   decline, with a WhatsApp message), Settings → Programme rules → "Programme start date" (opening date; move facilities
//   that have not started to it). Server: functions/startdate.js.
// ══════════════════════════════════════════════════════════════
var _sd = { info: {}, cfg: null, reqs: null };
function sdE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function sdHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function sdT(en, hi) { return sdHi() && hi ? hi : en; }
function sdFmt(d) { try { return scFmtDate(d); } catch (e) { return d || ''; } }
function sdDay(start, today) { return Math.floor((Date.parse(today) - Date.parse(start)) / 864e5) + 1; }
var SD_REASON_HI = { transfer: 'प्रभारी का स्थानांतरण / नई टीम', closed: 'केंद्र बंद या कार्यरत नहीं', wrong: 'गलत तारीख डाली गई', training: 'टीम प्रशिक्षण / ओरिएंटेशन नहीं हुआ', other: 'अन्य' };

// ── in-charge: the card body ──
function sdBodyHTML(code) {
  var I = _sd.info[code]; if (!I) return '<p class="sd-dim">' + sdE(sdT('Loading…', 'लोड हो रहा है…')) + '</p>';
  if (I.err) return '<p class="sd-dim">' + sdE(I.err) + '</p>';
  var h = '';
  if (!I.locked) {
    h += '<div class="sd-now">' + (I.startDate ? sdE(sdT('Day 1 starts on ', 'दिन 1 की शुरुआत: ')) + '<b>' + sdE(sdFmt(I.startDate)) + '</b>' : sdE(sdT('No start date yet', 'अभी कोई तारीख नहीं'))) + '</div>'
      + '<div class="sd-row"><input type="date" id="sd-date" class="sd-in" min="' + I.from + '" max="' + I.to + '" value="' + sdE(I.startDate && I.startDate >= I.from && I.startDate <= I.to ? I.startDate : I.from) + '"><button type="button" class="sd-btn" onclick="sdSave(\'' + sdE(code) + '\')">' + sdE(sdT('Set date', 'तारीख सेट करें')) + '</button></div>'
      + '<p class="sd-dim">' + sdE(sdT('You can choose from ' + sdFmt(I.from) + ' to ' + sdFmt(I.to) + '. Once Day 1 begins, the date is locked — after that only HealSol can change it on your request.', sdFmt(I.from) + ' से ' + sdFmt(I.to) + ' तक चुन सकते हैं। दिन 1 शुरू होने के बाद तारीख लॉक हो जाती है — फिर आपके अनुरोध पर केवल HealSol बदल सकता है।')) + '</p>';
    return h;
  }
  var d = sdDay(I.startDate, I.today), R = I.request;
  h += '<div class="sd-now">🔒 ' + sdE(sdT('Day 1 was ', 'दिन 1: ')) + '<b>' + sdE(sdFmt(I.startDate)) + '</b>' + sdE(sdT(' · today is Day ' + d, ' · आज दिन ' + d)) + '</div>'
    + '<p class="sd-dim">' + sdE(sdT('The start date is locked once the programme begins, so everyone\'s days and scores stay correct.', 'कार्यक्रम शुरू होने पर तारीख लॉक हो जाती है, ताकि सबके दिन और स्कोर सही रहें।')) + '</p>';
  if (R && R.status === 'open') h += '<div class="sd-req w">⏳ ' + sdE(sdT('Request sent on ' + sdFmt(String(R.at).slice(0, 10)) + ' for ' + sdFmt(R.date) + ' — waiting for HealSol.', sdFmt(R.date) + ' के लिए अनुरोध भेजा गया — HealSol के उत्तर की प्रतीक्षा।')) + '</div>';
  else {
    if (R && R.status === 'approved') h += '<div class="sd-req ok">✅ ' + sdE(sdT('HealSol approved the new start date ' + sdFmt(R.newDate) + '.', 'HealSol ने नई तारीख ' + sdFmt(R.newDate) + ' स्वीकार की।')) + (R.message ? '<small>' + sdE(R.message) + '</small>' : '') + '</div>';
    if (R && R.status === 'catchup') h += '<div class="sd-req ok">🔁 ' + sdE(sdT('HealSol will give your facility catch-up days instead — your finished cards are kept.', 'HealSol आपके केंद्र को कैच-अप दिन देगा — आपके पूरे कार्ड सुरक्षित रहेंगे।')) + (R.message ? '<small>' + sdE(R.message) + '</small>' : '') + '</div>';
    if (R && R.status === 'declined') h += '<div class="sd-req no">✖ ' + sdE(sdT('HealSol could not change the date.', 'HealSol तारीख नहीं बदल सका।')) + (R.message ? '<small>' + sdE(R.message) + '</small>' : '') + '</div>';
    h += '<button type="button" class="sd-btn ghost" onclick="sdRequest(\'' + sdE(code) + '\')">' + sdE(sdT('Request a change', 'बदलाव का अनुरोध करें')) + '</button>';
  }
  return h;
}
async function sdLoad(code) {
  try { _sd.info[code] = await nfCall('startDateInfo', { code: code }); } catch (e) { _sd.info[code] = { err: String(e.message || e) }; }
  sdPaintAll();
}
function sdPaintAll() { try { document.querySelectorAll('.sd-body').forEach(function (el) { el.innerHTML = sdBodyHTML(el.getAttribute('data-code')); }); } catch (e) {} }
function sdMount(host, code) { if (!host || !code) return; host.innerHTML = '<div class="sd-body" data-code="' + sdE(code) + '">' + sdBodyHTML(code) + '</div>'; if (!_sd.info[code]) sdLoad(code); }
async function sdSave(code) {
  var v = (document.getElementById('sd-date') || {}).value, I = _sd.info[code] || {};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) { showToast(sdT('Choose a date.', 'तारीख चुनें।'), 'err'); return; }
  if (v < I.from || v > I.to) { showToast(sdT('Choose a date from ' + sdFmt(I.from) + ' to ' + sdFmt(I.to) + '.', sdFmt(I.from) + ' से ' + sdFmt(I.to) + ' के बीच तारीख चुनें।'), 'err'); return; }
  try { await nfCall('setStartDate', { code: code, date: v }); } catch (e) { showToast(String(e.message || e), 'err'); return; }
  sdLocal(code, v); showToast(sdT('Start date saved: ' + sdFmt(v), 'तारीख सहेजी गई: ' + sdFmt(v)), 'ok'); delete _sd.info[code]; sdAfter(code);
}
function sdLocal(code, v) {
  try { if (typeof scSubAdminData !== 'undefined' && scSubAdminData && scSubAdminCode === code) scSubAdminData.startDate = v; } catch (e) {}
  try { if (typeof choState !== 'undefined' && choState.facilityCode === code) { choState.startDate = v; if (choState.facility) choState.facility.startDate = v; } } catch (e) {}
  try { if (typeof _nd !== 'undefined' && _nd && _nd.code === code) _nd.fac.startDate = v; } catch (e) {}
  try { if (typeof scMasterFacilities !== 'undefined' && scMasterFacilities[code]) scMasterFacilities[code].startDate = v; } catch (e) {}
}
function sdAfter(code) {
  try { if (typeof faOn === 'function' && faOn()) { faHeader(); faMore(); return; } } catch (e) {}
  try { if (typeof _nd !== 'undefined' && _nd && _nd.code === code && typeof ndRender === 'function') { ndRender(); return; } } catch (e) {}
  sdLoad(code);
}
async function sdRequest(code) {
  var I = _sd.info[code] || {}, R = I.reasons || {};
  var v = await scDialog({ title: sdT('Request a new start date', 'नई शुरुआत तारीख का अनुरोध'), icon: '📅', okLabel: sdT('Send to HealSol', 'HealSol को भेजें'),
    message: sdT('HealSol will look at your request. Often the better answer is catch-up days, which keep the cards your team has finished.', 'HealSol आपका अनुरोध देखेगा। अक्सर कैच-अप दिन बेहतर होते हैं — टीम के पूरे कार्ड सुरक्षित रहते हैं।'),
    fields: [{ key: 'date', label: sdT('New start date', 'नई तारीख'), type: 'date', required: true, value: I.today || '' },
      { key: 'reason', label: sdT('Reason', 'कारण'), type: 'select', value: 'transfer', options: Object.keys(R).map(function (k) { return { value: k, label: sdHi() ? (SD_REASON_HI[k] || R[k]) : R[k] }; }) },
      { key: 'note', label: sdT('A few words (what happened)', 'संक्षेप में (क्या हुआ)'), type: 'textarea', maxLength: 300 }],
    validate: function (x) { if (!/^\d{4}-\d{2}-\d{2}$/.test(x.date || '') || x.date < I.today) return sdT('Choose today or a later date.', 'आज या बाद की तारीख चुनें।'); if (x.reason === 'other' && String(x.note || '').trim().length < 5) return sdT('Write a few words about the reason.', 'कारण के बारे में कुछ शब्द लिखें।'); return null; } });
  if (!v) return;
  try { await nfCall('requestStartChange', { code: code, date: v.date, reason: v.reason, note: v.note || '' }); } catch (e) { showToast(String(e.message || e), 'err'); return; }
  showToast(sdT('Request sent to HealSol.', 'अनुरोध HealSol को भेजा गया।'), 'ok'); sdLoad(code);
}

// ── wiring: SC Facility dashboard (More) and the department app ──
(function () {
  if (typeof faMore === 'function') { var o = faMore; faMore = function () { var r = o.apply(this, arguments);
    try { var box = document.getElementById('fa-set'), code = typeof scSubAdminCode !== 'undefined' ? scSubAdminCode : ''; if (box && code) {
      if (!box.querySelector('.sd-body')) box.innerHTML = '<label>' + sdE(typeof faT === 'function' ? faT('Programme start date') : 'Programme start date') + '</label><div class="sd-host"></div>';
      var host = box.querySelector('.sd-host'); if (host) sdMount(host, code); } } catch (e) { console.warn('[startdate]', e); } return r; }; }
  if (typeof ndStartForm === 'function') { ndStartForm = function () { return '<div class="sd-host" data-nd="1"></div>'; }; }
  if (typeof ndRender === 'function') { var d = ndRender; ndRender = function () { var r = d.apply(this, arguments);
    try { var host = document.querySelector('.sd-host[data-nd]'); if (host && _nd && _nd.code) sdMount(host, _nd.code); } catch (e) {} return r; }; }
  // HealSol's own "Set start date" (facility list): through the server, so the change is recorded
  if (typeof scSaveAdminDate === 'function') { scSaveAdminDate = async function () {
    var code = document.getElementById('sc-date-fac-code').textContent, val = document.getElementById('sc-date-input').value; if (!val) { showToast('Select a date.', 'err'); return; }
    try { await nfCall('setStartDate', { code: code, date: val, why: 'Set by HealSol (facility list)' }); } catch (e) { showToast(String(e.message || e), 'err'); return; }
    sdLocal(code, val); document.getElementById('sc-date-modal').classList.remove('open'); try { scRenderMasterDashboard(); } catch (e) {} showToast('Start date set for ' + code, 'ok'); }; }
})();

// ── HealSol: Business → Start date requests ──
var SD_REASON = { transfer: 'In-charge transferred / new team', closed: 'Facility closed or not functional', wrong: 'Wrong date entered', training: 'Team training / orientation not done', other: 'Other' };
function sdReqHTML() {
  var L = Object.values(_sd.reqs || {}).filter(function (r) { return r && r.status === 'open'; }).sort(function (a, b) { return String(a.at).localeCompare(String(b.at)); });
  if (!L.length) return '';
  return '<div class="nfo-card sd-reqs" id="sd-reqs"><b><i class="ti ti-calendar-event"></i> Start date requests (' + L.length + ')</b><p>The programme has started at these facilities, so the in-charge cannot change the date. A new date moves every finished card to another day — it is safest in the first week. After that, catch-up days are usually better: the team keeps its work.</p>'
    + L.map(function (r) { var c = sdE(r.code);
      return '<div class="sd-ri"><div><b>' + sdE(r.name) + '</b> <small>' + sdE([r.code, (r.type || 'sc').toUpperCase(), r.district].filter(Boolean).join(' · ')) + '</small>'
        + '<div class="sd-rl">Day <b>' + r.day + '</b> · ' + r.cards + ' cards done · started ' + sdE(sdFmt(r.from)) + ' → asks for <b>' + sdE(sdFmt(r.date)) + '</b></div>'
        + '<div class="sd-rl">' + sdE(SD_REASON[r.reason] || r.reason) + (r.note ? ' — “' + sdE(r.note) + '”' : '') + ' · ' + sdE(r.byName || r.by) + ', ' + sdE(String(r.at).slice(0, 10)) + '</div></div>'
        + '<div class="iv-acts"><button type="button" class="hs-btn p" onclick="sdDecide(\'' + c + '\',\'approve\')">Approve new date</button><button type="button" class="hs-btn" onclick="sdDecide(\'' + c + '\',\'catchup\')">Catch-up instead</button><button type="button" class="hs-btn" onclick="sdDecide(\'' + c + '\',\'decline\')">Decline</button></div></div>'; }).join('') + '</div>';
}
async function sdReqLoad() { try { _sd.reqs = (await fbGet('sc_start_req')) || {}; } catch (e) { _sd.reqs = {}; } }
async function sdDecide(code, d) {
  var r = (_sd.reqs || {})[code]; if (!r) return;
  var f = d === 'approve' ? [{ key: 'date', label: 'New start date', type: 'date', required: true, value: r.date }, { key: 'message', label: 'Message to the in-charge (optional)', type: 'textarea', maxLength: 300 }]
    : [{ key: 'message', label: d === 'decline' ? 'Reason (the in-charge sees this)' : 'Message to the in-charge (optional)', type: 'textarea', maxLength: 300, required: d === 'decline',
      value: d === 'catchup' ? 'Your finished cards are kept. We will open catch-up days for the cards you missed.' : '' }];
  var v = await scDialog({ title: d === 'approve' ? 'Approve a new start date — ' + r.name : d === 'catchup' ? 'Give catch-up instead — ' + r.name : 'Decline — ' + r.name, icon: d === 'decline' ? '✖' : '📅', okLabel: d === 'approve' ? 'Approve' : d === 'catchup' ? 'Send' : 'Decline',
    message: d === 'approve' ? 'Day ' + r.day + ' · ' + r.cards + ' cards done. Every finished card moves with the new date.' : d === 'catchup' ? 'Then set up catch-up from the facility page (Programme).' : '', fields: f,
    validate: function (x) { if (d === 'decline' && String(x.message || '').trim().length < 3) return 'Write the reason.'; return null; } });
  if (!v) return;
  var out; try { out = await nfCall('decideStartChange', { code: code, decision: d, date: v.date || '', message: v.message || '' }); } catch (e) { showToast(String(e.message || e), 'err'); return; }
  r.status = out.status; showToast(d === 'approve' ? 'Start date changed to ' + sdFmt(out.newDate) + '.' : d === 'catchup' ? 'Answered: catch-up instead.' : 'Request declined.', 'ok');
  try { var txt = 'Namaste ' + (r.byName || '') + ', about your request to change the NQAS | FAST start date for ' + r.name + ': '
      + (d === 'approve' ? 'approved — Day 1 is now ' + sdFmt(out.newDate) + '.' : d === 'catchup' ? 'we will give catch-up days instead, so your finished cards are kept.' : 'we could not change it.') + (v.message ? ' ' + v.message : '') + ' — HealSol Academy';
    if (r.by && typeof nfWaOpen === 'function' && await scDialog({ title: 'Tell the in-charge on WhatsApp?', icon: '💬', okLabel: 'Open WhatsApp', message: txt })) nfWaOpen(r.by, txt); } catch (e) {}
  sdPaintReqs();
}
function sdPaintReqs() { var old = document.getElementById('sd-reqs'), box = document.getElementById('nf-biz'); if (old) old.remove(); if (!box) return; var h = sdReqHTML(); if (!h) return;
  var w = document.createElement('div'); w.innerHTML = h; var eq = document.getElementById('nf-eq'); if (eq) eq.insertAdjacentElement('beforebegin', w.firstChild); else box.insertBefore(w.firstChild, box.firstChild); }
(function () { if (typeof nfRenderBizDash !== 'function') return; var o = nfRenderBizDash;
  nfRenderBizDash = async function () { var r = await o.apply(this, arguments); try { await sdReqLoad(); sdPaintReqs(); } catch (e) { console.warn('[startdate] reqs', e); } return r; }; })();

// ── HealSol: Settings → Programme rules → Programme start date ──
async function sdCfgRender() {
  var el = document.getElementById('hs-start'); if (!el) return;
  try { _sd.cfg = (await fbGet('shared/sc_start_config')) || {}; } catch (e) { _sd.cfg = _sd.cfg || {}; }
  var c = _sd.cfg || {};
  el.innerHTML = '<b><i class="ti ti-calendar"></i> Programme start date</b><p>The in-charge sets the start date once, before Day 1: from the opening date (or today, if later) up to <b>7 days</b> ahead. From Day 1 it is locked; changes come to you as requests in Business. Facilities that register before the opening date start on it automatically.</p>'
    + '<div class="dm-pw"><label>Opening date (first batch)<input type="date" id="sd-open" value="' + sdE(c.earliest || '2026-11-20') + '"></label><small>' + (c.earliest ? 'Saved: ' + sdE(sdFmt(c.earliest)) : 'Not saved yet — tap Save to use it.') + '</small></div>'
    + '<div class="iv-acts"><button type="button" class="hs-btn p" onclick="sdCfgSave()">Save</button><button type="button" class="hs-btn" onclick="sdOpening()">Move facilities that have not started to this date…</button></div><div id="sd-cfg-msg" class="dm-msg"></div>';
}
async function sdCfgSave() {
  var v = (document.getElementById('sd-open') || {}).value; if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) { showToast('Choose the opening date.', 'err'); return; }
  var ok = await fbSet('shared/sc_start_config', { earliest: v, windowDays: 7, at: new Date().toISOString() }); if (ok === false) { showToast('Could not save.', 'err'); return; }
  showToast('Opening date saved: ' + sdFmt(v), 'ok'); sdCfgRender();
}
async function sdOpening() {
  var m = document.getElementById('sd-cfg-msg'), r;
  try { r = await nfCall('applyOpeningStart', { apply: false }); } catch (e) { if (m) { m.textContent = String(e.message || e); m.className = 'dm-msg err'; } return; }
  if (!r.n) { if (m) { m.textContent = 'Nothing to move: every facility that has not started already starts on or after ' + sdFmt(r.earliest) + '.'; m.className = 'dm-msg'; } return; }
  var ok = await scDialog({ title: 'Move ' + r.n + ' facilit' + (r.n === 1 ? 'y' : 'ies') + ' to ' + sdFmt(r.earliest) + '?', icon: '📅', okLabel: 'Move',
    message: r.n + ' facilit' + (r.n === 1 ? 'y has' : 'ies have') + ' not started and would start before the opening date (or have no date). They will start on ' + sdFmt(r.earliest) + '. ' + r.alreadyStarted + ' facilit' + (r.alreadyStarted === 1 ? 'y has' : 'ies have') + ' already started and will not change.' });
  if (!ok) return;
  try { r = await nfCall('applyOpeningStart', { apply: true }); } catch (e) { showToast(String(e.message || e), 'err'); return; }
  if (m) { m.textContent = r.n + ' facilities now start on ' + sdFmt(r.earliest) + '.'; m.className = 'dm-msg'; } showToast('Done.', 'ok');
}
(function () {
  if (typeof hspSignupRender === 'function') { var o = hspSignupRender; hspSignupRender = async function () { var r = await o.apply(this, arguments);
    try { var su = document.getElementById('hs-signup'), el = document.getElementById('hs-start');
      if (su && !el) { el = document.createElement('div'); el.id = 'hs-start'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); sdCfgRender(); } } catch (e) { console.warn('[startdate]', e); }
    return r; }; }
  if (typeof hsSetupGroup === 'function') { var g = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-start') return 'rules'; return g.apply(this, arguments); }; }
})();
