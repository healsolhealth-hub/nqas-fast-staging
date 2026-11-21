// ══════════════════════════════════════════════════════════════
// BASELINE FIRST, AND NO CARD BEFORE DAY 1 (21 Nov 2026; HealSol, staging review)
//  1. No start date yet → the Cards screen shows "Choose your Day 1" (the start-date card) instead of opening Day 1.
//     Staff (not the in-charge) see "Your in-charge chooses Day 1".
//  2. Past the last baseline day with baseline cards still missing → Day 8 on (Day 15 CHC) stay locked: "Finish your baseline
//     first", with the days and the people still to submit. The clock is paused: when the last baseline card is in, the app calls
//     baselineDone (functions/implstart.js) — the server records blDoneOn and, for a facility that may start implementation
//     (paid / contract / commitment) with no implementation card yet, moves the clock so tomorrow is Day 8.
//     Complete = every baseline card submitted (Sub-Centre: scBaselineStatus — every staff member whose role has checkpoints
//     that day; UPHC / PHC / CHC: a card done in every department for every baseline day).
//  HealSol: ⋯ menu → "Mark baseline complete" when a team member who left blocks it (the server then skips its check).
// ══════════════════════════════════════════════════════════════
var _bg = { called: {}, loadAt: 0 };
function bgHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function bgT(en, hi) { return bgHi() && hi ? hi : en; }
function bgE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

// ── Sub-Centre ──
function bgScState() {
  if (typeof choState === 'undefined' || !choState.facilityCode) return null;
  var f = choState.facility || {}, s = choState.startDate || f.startDate;
  if (!s) return { k: 'nostart' };
  if (f.showcase || /-DMO-/.test(choState.facilityCode)) return null;   // demo facilities (screenshots, tours) keep their prepared data
  if (f.blDoneOn) return null;
  var today = typeof scb1TodayIdx === 'function' ? scb1TodayIdx() : 0; if (today < 7) return null;
  if (typeof _nfFac === 'undefined' || _nfFac.code !== choState.facilityCode || !_nfFac.progress || !_nfFac.staff) { bgLoadSc(); return null; }
  var P = JSON.parse(JSON.stringify(_nfFac.progress || {})), me = choState.staffMobile;
  if (me) { P[me] = P[me] || {}; Object.keys(choState.cards || {}).forEach(function (di) { var c = choState.cards[di]; if (c && c.taskDone) P[me]['day_' + di] = Object.assign({}, P[me]['day_' + di] || {}, { taskDone: true }); }); }
  var st = []; try { st = scBaselineStatus(choState.progId, P, _nfFac.staff || {}); } catch (e) { return null; }
  var open = st.filter(function (x) { return !x.complete; });
  if (!open.length) { bgDone(choState.facilityCode); return null; }
  return { k: 'bl', open: open.map(function (x) { return { n: x.di + 1, title: x.title, who: x.pending || [] }; }), base: 7 };
}
function bgLoadSc() { if (Date.now() - _bg.loadAt < 30000 || typeof nfLoadFacility !== 'function') return; _bg.loadAt = Date.now();
  nfLoadFacility(true).then(function () { try { if (bgScState() && typeof renderCard === 'function') renderCard(typeof window._scLastDi === 'number' ? window._scLastDi : scb1TodayIdx()); } catch (e) {} }); }
// ── UPHC / PHC / CHC ──
function bgDeptState() {
  if (typeof _nd === 'undefined' || !_nd || _nd.view || !_nd.fac) return null;
  var f = _nd.fac; if (!f.startDate) return { k: 'nostart' };
  if (f.showcase || /-DMO-/.test(_nd.code || '')) return null;
  if (f.blDoneOn) return null;
  var bN = typeof nduBase === 'function' ? nduBase() : 7, day = typeof ndDay === 'function' ? ndDay() : 0; if (!(day > bN) || day > 100) return null;
  var open = [];
  ndDeptDefs().forEach(function (d) { var miss = []; for (var n = 1; n <= bN; n++) { var c = ndPc(d.id, n); if (!Object.keys(c).some(function (m) { return c[m] && c[m].done; })) miss.push(n); }
    if (miss.length) open.push({ dept: d.name || d.id, days: miss }); });
  if (!open.length) { bgDone(_nd.code); return null; }
  return { k: 'bl', depts: open, base: bN };
}
// the last baseline card is in: tell the server (once per session)
function bgDone(code) {
  if (!code || _bg.called[code] || typeof nfCall !== 'function') return; _bg.called[code] = 1;
  nfCall('baselineDone', { code: code }).then(function (r) {
    if (!r || !r.done || r.already) return;
    var up = { blDoneOn: r.blDoneOn }; if (r.implFrom) { var b = (typeof choState !== 'undefined' && choState.facilityCode === code) ? 7 : (typeof nduBase === 'function' ? nduBase() : 7), d = new Date(r.implFrom + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() - b); up.startDate = d.toISOString().slice(0, 10); up.implFrom = r.implFrom; }
    try { if (typeof choState !== 'undefined' && choState.facilityCode === code) { Object.assign(choState.facility || {}, up); if (up.startDate) { up.baselineStart = choState.startDate; choState.startDate = up.startDate; choState.facility.baselineStart = choState.facility.baselineStart || up.baselineStart; } } } catch (e) {}
    try { if (typeof _nd !== 'undefined' && _nd && _nd.code === code) Object.assign(_nd.fac, up); } catch (e) {}
    showToast(r.implFrom ? bgT('Baseline complete — implementation (Day 8) starts tomorrow.', 'बेसलाइन पूरी — कार्यान्वयन (दिन 8) कल से शुरू।') : bgT('Baseline complete.', 'बेसलाइन पूरी।'), 'ok');
    try { if (typeof ndRender === 'function' && typeof _nd !== 'undefined' && _nd && _nd.code === code) ndRender(); else if (typeof renderCard === 'function') { if (typeof buildDaySelector === 'function') buildDaySelector(); renderCard(typeof window._scLastDi === 'number' ? window._scLastDi : 0); } } catch (e) {}
  }, function () { _bg.called[code] = 0; });
}

// ── the cards: what a locked card shows ──
function bgBlHTML(g) {
  var rows = g.open ? g.open.map(function (x) { return '<li><b>' + bgE(bgT('Day ', 'दिन ') + x.n) + '</b> · ' + bgE(x.title || '') + (x.who && x.who.length ? '<small>' + bgE(bgT('Waiting for: ', 'बाकी: ') + x.who.join(', ')) + '</small>' : '') + '</li>'; }).join('')
    : g.depts.map(function (x) { return '<li><b>' + bgE(x.dept) + '</b><small>' + bgE(bgT('Baseline day', 'बेसलाइन दिन') + (x.days.length > 1 ? 's ' : ' ') + x.days.join(', ')) + '</small></li>'; }).join('');
  return '<div class="bg-card"><div class="bg-h"><span>' + bgE(bgT('BASELINE FIRST', 'पहले बेसलाइन')) + '</span><b>' + bgE(bgT('Finish your baseline first', 'पहले अपनी बेसलाइन पूरी करें')) + '</b>'
    + '<small>' + bgE(bgT('Implementation (Day ' + (g.base + 1) + ' on) opens when every baseline card is in. Your clock is paused — no implementation day is lost.', 'हर बेसलाइन कार्ड जमा होने पर कार्यान्वयन (दिन ' + (g.base + 1) + ' से) खुलेगा। आपकी घड़ी रुकी है — कार्यान्वयन का कोई दिन नहीं छूटेगा।')) + '</small></div>'
    + '<div class="bg-b"><span class="bg-k">' + bgE(bgT('STILL TO SUBMIT', 'अभी जमा करना है')) + '</span><ul class="bg-l">' + rows + '</ul>'
    + '<p class="bg-n">' + bgE(bgT('Open the day above, finish the card and press Submit. The baseline gaps become your action plan.', 'ऊपर वह दिन खोलें, कार्ड पूरा करें और जमा करें। बेसलाइन की कमियाँ आपकी कार्य-योजना बनेंगी।')) + '</p></div></div>';
}
function bgNoStartHTML(code) {
  return '<div class="bg-card"><div class="bg-h"><span>' + bgE(bgT('NOT STARTED YET', 'अभी शुरू नहीं')) + '</span><b>' + bgE(bgT('Choose your Day 1', 'अपना दिन 1 चुनें')) + '</b>'
    + '<small>' + bgE(bgT('The programme starts on the day you choose. All cards open from that day.', 'कार्यक्रम आपके चुने दिन से शुरू होगा। सभी कार्ड उसी दिन से खुलेंगे।')) + '</small></div><div class="bg-b"><div class="sd-host"></div></div></div>';
}
function bgMountNoStart(host, code) { host.innerHTML = bgNoStartHTML(code); var h = host.querySelector('.sd-host'); if (h && typeof sdMount === 'function') sdMount(h, code); }
// staff who are not the in-charge cannot open the date (server: in-charge only)
(function () { if (typeof sdBodyHTML !== 'function') return; var o = sdBodyHTML;
  sdBodyHTML = function (code) { try { var I = (typeof _sd !== 'undefined' && _sd.info[code]) || null; if (I && I.err && /in-charge/i.test(I.err)) return '<p class="sd-dim">' + bgE(bgT('Your in-charge chooses Day 1 of the programme. Your cards open on that day.', 'आपके प्रभारी कार्यक्रम का दिन 1 चुनते हैं। आपके कार्ड उसी दिन खुलेंगे।')) + '</p>'; } catch (e) {} return o.apply(this, arguments); }; })();

// Sub-Centre gate, card and headers
(function () { if (typeof phcCheckAccess !== 'function') return; var o = phcCheckAccess;
  phcCheckAccess = function (di) { try { var g = bgScState(); if (g && g.k === 'nostart') return false; if (g && g.k === 'bl' && di >= g.base) return false; } catch (e) {} return o.apply(this, arguments); }; })();
(function () { if (typeof renderUpgradeCard !== 'function') return; var o = renderUpgradeCard;
  renderUpgradeCard = async function (container) {
    try { var g = bgScState(), code = choState.facilityCode;
      if (container && g && g.k === 'nostart') { bgMountNoStart(container, code); return; }
      if (container && g && g.k === 'bl') { container.innerHTML = bgBlHTML(g); return; } } catch (e) { console.warn('[blgate]', e); }
    return o.apply(this, arguments); }; })();
function bgScLabel(g) { return g.k === 'nostart' ? bgT('Not started · choose Day 1', 'शुरू नहीं · दिन 1 चुनें') : bgT('Baseline · finish Day ' + g.open.map(function (x) { return x.n; }).join(', '), 'बेसलाइन · दिन ' + g.open.map(function (x) { return x.n; }).join(', ') + ' पूरे करें'); }
(function () { if (typeof nfCardsHead !== 'function') return; var o = nfCardsHead;
  nfCardsHead = function () { var r = o.apply(this, arguments); try { var g = bgScState(), c = document.querySelector('#nf-cards-head .nf-chip'); if (g && c) c.textContent = bgScLabel(g); } catch (e) {} return r; }; })();
(function () { if (typeof nfRenderToday !== 'function') return; var o = nfRenderToday;
  nfRenderToday = function () { var r = o.apply(this, arguments);
    try { var g = bgScState(); if (g && g.k === 'bl') { var k = document.querySelector('.nf-hero-k'), t = document.querySelector('.nf-hero-t'); if (k && t) { k.textContent = bgScLabel(g); t.textContent = bgT('Finish your baseline first — implementation waits, no days lost', 'पहले बेसलाइन पूरी करें — कार्यान्वयन रुका है, कोई दिन नहीं छूटेगा'); } } } catch (e) {}
    return r; }; })();
(function () { if (typeof renderCard !== 'function') return; var o = renderCard;
  renderCard = function (di) { var r = o.apply(this, arguments);
    try { var g = bgScState(); if (g && (g.k === 'nostart' || (g.k === 'bl' && di >= g.base))) { var c = document.getElementById('card-container'); if (c) c.querySelectorAll('.scd-banner').forEach(function (b) { b.remove(); }); } } catch (e) {}
    return r; }; })();

// UPHC / PHC / CHC gate and card
(function () {
  if (typeof nduLocked === 'function') { var o = nduLocked; nduLocked = function (day) { try { var g = bgDeptState(); if (g && g.k === 'nostart') return true; if (g && g.k === 'bl' && day > g.base) return true; } catch (e) {} return o.apply(this, arguments); }; }
  if (typeof nduOpen === 'function') { var p = nduOpen; nduOpen = function () { try { if (bgDeptState()) return false; } catch (e) {} return p.apply(this, arguments); }; }
})();
(function () { if (typeof nduFill !== 'function') return; var o = nduFill;
  nduFill = async function () {
    try { var card = document.getElementById('ndu-card'), g = bgDeptState();
      if (card && g && g.k === 'nostart') { bgMountNoStart(card, _nd.code); return; }
      if (card && g && g.k === 'bl' && (_nd.cday || 0) > g.base) { card.innerHTML = bgBlHTML(g); return; } } catch (e) { console.warn('[blgate]', e); }
    return o.apply(this, arguments); }; })();

// HealSol: a team member who has left can block the baseline for ever — HealSol marks it complete (with a reason)
(function () { if (typeof nfFacMenu !== 'function') return; var o = nfFacMenu;
  nfFacMenu = function (btn, code) { var r = o.apply(this, arguments);
    try { var m = document.getElementById('mfc-menu'), f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {}; if (!m || !f.startDate || f.blDoneOn) return r;
      var t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f.type || 'sc'), b = ((NF_LEVELS[t] || {}).plan || {}).base || 7, d = Math.floor((Date.now() + 5.5 * 3600e3 - Date.parse(f.startDate + 'T00:00:00Z')) / 864e5) + 1; if (d <= b) return r;
      var x = document.createElement('button'); x.type = 'button'; x.setAttribute('role', 'menuitem'); x.innerHTML = '<i class="ti ti-clipboard-check"></i>Mark baseline complete';
      x.setAttribute('onclick', "document.getElementById('mfc-menu').remove();bgForce('" + String(code).replace(/'/g, "\\'") + "')"); m.appendChild(x); } catch (e) {}
    return r; }; })();
async function bgForce(code) {
  var f = ((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {})[code] || {};
  var v = await scDialog({ title: 'Mark the baseline complete?', icon: '📋', okLabel: 'Mark complete', message: (f.name || code) + '\nUse this when a team member who has left (or is on long leave) still has baseline cards open. Implementation opens; if no implementation card is in yet, tomorrow becomes Day ' + ((((NF_LEVELS[(typeof nfTypeOf === 'function' ? nfTypeOf(f) : 'sc')] || {}).plan || {}).base || 7) + 1) + '.', fields: [{ key: 'why', label: 'Reason', value: '', required: true }] });
  if (!v) return;
  try { var r = await nfCall('baselineDone', { code: code, force: true, why: v.why }); if (r && r.done) { Object.assign(f, { blDoneOn: r.blDoneOn }, r.implFrom ? { implFrom: r.implFrom } : {}); showToast('Baseline marked complete' + (r.implFrom ? ' — implementation starts ' + r.implFrom : '') + '.', 'ok'); } else showToast('Not changed: ' + ((r && (r.why || ('Day ' + r.open + ' open'))) || ''), 'err'); }
  catch (e) { showToast(nfErrText(e), 'err'); }
}
