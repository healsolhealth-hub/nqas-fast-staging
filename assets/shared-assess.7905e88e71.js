// ══════════════════════════════════════════════════════════════
// ASSESSMENT TAB (17 Nov 2026; approved design "Assessment tab design")
//   Facility staff (SC · UPHC · PHC · CHC): "📅 State in 90 days" on Today opens the Assessment page —
//     next assessment (level, date, Proposed / Confirmed, reference, note) with a countdown · readiness against 70% ·
//     documents (HealSol's curated list per facility type; status ticks only: Not started / In progress / Ready,
//     owner and due date) · NQAS journey (Internal → District → State → National → Certified) · preparation plan
//     worked back from the date · past assessments.
//   The in-charge sets and confirms the date and records results; a document's owner may tick its status.
//   Supervisors, district, block and HealSol: "Assessments" in the menu — every facility with a date, nearest first.
//   HealSol: Settings → Programme rules → Assessment documents — the list per facility type (Excel upload / download).
//   Data: sc_facilities/{code}/assess {next, hist/{id}, docs/{id}} · shared/sc_assess_docs/{type} {items, at, by}.
//   Reminders (functions/push.js, 9 AM): 60, 30, 14, 7 and 1 day before, to the team; still "Proposed" 30 days before → in-charge.
// ══════════════════════════════════════════════════════════════
var _ax = { code: null, fac: null, list: null, pct: null, page: 'main', flt: 'rem', open: null, sheet: null, chip: {}, all: null, up: 'n90', busy: false };
var AX_LV = [['internal', 'Internal', 'आंतरिक'], ['district', 'District (DQAC)', 'ज़िला (DQAC)'], ['state', 'State', 'राज्य'], ['national', 'National (NHSRC)', 'राष्ट्रीय (NHSRC)']];
var AX_ST = [['ns', 'Not started', 'शुरू नहीं'], ['ip', 'In progress', 'चल रहा है'], ['rd', 'Ready', 'तैयार']];
var AX_PLAN = [[60, 'All documents ready', 'सभी दस्तावेज़ तैयार'], [30, 'Mock internal assessment', 'अभ्यास आंतरिक आकलन'], [14, 'Last gaps closed', 'आख़िरी कमियाँ दूर'], [7, 'Team briefing', 'टीम ब्रीफ़िंग']];
var AX_TARGET = 70;
function axHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function axT(en, hi) { return axHi() && hi ? hi : en; }
function axE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function axJ(s) { return typeof scJs === 'function' ? scJs(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function axPad(n) { return ('0' + n).slice(-2); }
function axToday() { var d = new Date(); return d.getFullYear() + '-' + axPad(d.getMonth() + 1) + '-' + axPad(d.getDate()); }
function axAdd(ymd, n) { var p = String(ymd).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2] + n); return d.getFullYear() + '-' + axPad(d.getMonth() + 1) + '-' + axPad(d.getDate()); }
function axDays(ymd) { if (!ymd) return null; var p = String(ymd).split('-'), t = axToday().split('-'); return Math.round((Date.UTC(+p[0], +p[1] - 1, +p[2]) - Date.UTC(+t[0], +t[1] - 1, +t[2])) / 864e5); }
function axFmt(ymd, wd) { if (!ymd) return ''; var p = String(ymd).split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]); if (isNaN(d)) return ymd;
  var M = axHi() ? ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], W = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (wd && !axHi() ? W[d.getDay()] + ' ' : '') + d.getDate() + ' ' + M[d.getMonth()] + ' ' + d.getFullYear(); }
function axLv(k, short) { var x = AX_LV.filter(function (l) { return l[0] === k; })[0]; if (!x) return k || ''; var s = axT(x[1], x[2]); return short ? s.replace(/ \(.*\)$/, '') : s; }
function axStName(k) { var x = AX_ST.filter(function (l) { return l[0] === k; })[0] || AX_ST[0]; return axT(x[1], x[2]); }
function axMob() { try { return (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || (typeof choState !== 'undefined' && choState.staffMobile) || ''; } catch (e) { return ''; } }
function axCtx() { var M = typeof rgMyFac === 'function' ? rgMyFac() : null; if (!M || !M.code) return null; M.mob = axMob(); M.ic = typeof rgIsInCharge === 'function' && rgIsInCharge(); M.t = typeof nfTypeOf === 'function' ? nfTypeOf(M.f || {}) : 'sc'; return M; }
function axPath(code, sub) { return (typeof scFacilityPath === 'function' ? scFacilityPath(code) : 'sc_facilities/' + code) + '/assess' + (sub ? '/' + sub : ''); }
function axNoProg() { try { if (typeof navigator !== 'undefined' && navigator.onLine === false) return true; } catch (e) {} return false; }

// the curated list for a facility type, in order: [{id, aoc, name, kind, std, owner, tip}]
function axItems(list) { var I = (list && list.items) || {}; return Object.keys(I).map(function (k) { return Object.assign({ id: k }, I[k]); }).sort(function (a, b) { return (a.o || 0) - (b.o || 0); }); }
function axDocCounts(items, docs) { var c = { total: items.length, rd: 0, ip: 0, ns: 0, od: 0 }, t = axToday(); docs = docs || {};
  items.forEach(function (x) { var d = docs[x.id] || {}, st = d.st || 'ns'; c[st] = (c[st] || 0) + 1; if (st !== 'rd' && d.due && d.due < t) c.od++; }); return c; }
// the journey: what is done, from recorded results and the NHSRC record
function axJourney(f) {
  var A = (f && f.assess) || {}, H = A.hist || {}, done = {};
  Object.keys(H).forEach(function (k) { var h = H[k]; if (!h || !h.level) return; if (!done[h.level] || String(h.date) > String(done[h.level].date)) done[h.level] = h; });
  var nh = (f && f.nhsrc) || {}, s = nh.status;
  if ((s === 'state' || s === 'national' || s === 'certified') && !done.state) done.state = { level: 'state', date: nh.stateOn || null };
  if ((s === 'national' || s === 'certified') && !done.national) done.national = { level: 'national', date: nh.nationalOn || null };
  var cert = s === 'certified' ? { date: nh.certifiedOn || null, score: nh.score != null ? nh.score : null } : null;
  return { done: done, cert: cert, next: A.next || null };
}

// ── staff: open / close ──
async function axOpen(page) {
  var M = axCtx(); if (!M) return;
  _ax.code = M.code; _ax.page = page || 'main'; _ax.open = null; _ax.sheet = null;
  var ov = document.getElementById('ax-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'ax-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', axT('Assessment', 'आकलन')); document.body.appendChild(ov); }
  document.body.classList.add('ax-open');
  if (!_ax.fac || _ax.fac._code !== M.code) { _ax.fac = null; _ax.list = null; _ax.pct = null; }
  axRender();
  await axLoad(M);
  if (document.getElementById('ax-ov')) axRender();
}
async function axLoad(M) {
  M = M || axCtx(); if (!M) return;
  try { var f = await fbGet('sc_facilities/' + M.code); _ax.fac = Object.assign(f || {}, { _code: M.code }); } catch (e) { _ax.fac = Object.assign({}, M.f || {}, { _code: M.code }); }
  var t = typeof nfTypeOf === 'function' ? nfTypeOf(_ax.fac) : M.t;
  try { _ax.list = (await fbGet('shared/sc_assess_docs/' + t)) || {}; } catch (e) { _ax.list = {}; }
  try { var p = await fbGet('sc_profile/' + M.code); _ax.pct = p && p.pct != null ? p.pct : null; } catch (e) {}
  _ax.chip[M.code] = { at: Date.now(), a: (_ax.fac && _ax.fac.assess) || null };
}
function axClose() { var ov = document.getElementById('ax-ov'); if (ov) ov.remove(); document.body.classList.remove('ax-open'); axChipPaint(true); }
function axBack() { if (_ax.page === 'docs') { _ax.page = 'main'; _ax.open = null; axRender(); try { document.getElementById('ax-ov').scrollTop = 0; } catch (e) {} } else axClose(); }

function axRender() {
  var ov = document.getElementById('ax-ov'), M = axCtx(); if (!ov || !M) return;
  var y = ov.scrollTop, f = _ax.fac || Object.assign({}, M.f || {});
  var head = '<header class="ax-head"><div class="ax-hrow"><button type="button" class="ax-back" onclick="axBack()" aria-label="' + axE(axT('Back', 'वापस')) + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>'
    + '<div class="ax-ht"><b>' + axE(_ax.page === 'docs' ? axT('Documents for assessment', 'आकलन के दस्तावेज़') : (f.name || M.code)) + '</b><small>' + axE(_ax.page === 'docs' ? axT('List from HealSol Academy', 'HealSol Academy की सूची') : axT('Assessment', 'आकलन')) + '</small></div></div></header>';
  var body = !_ax.fac ? '<div class="ax-load">' + axE(axT('Loading…', 'लोड हो रहा है…')) + '</div>' : _ax.page === 'docs' ? axDocsHTML(M, f) : axMainHTML(M, f);
  ov.innerHTML = '<div class="ax-page">' + head + body + '</div>' + (_ax.sheet ? axSheetHTML(M, f) : '');
  ov.scrollTop = y;
}

// ── the page ──
function axMainHTML(M, f) {
  var J = axJourney(f), n = J.next, items = axItems(_ax.list), docs = ((f.assess || {}).docs) || {}, h = '<main class="ax-main">';
  // next assessment
  if (n && n.date) {
    var d = axDays(n.date), conf = n.status === 'confirmed';
    h += '<section class="ax-hero" aria-label="' + axE(axT('Next assessment', 'अगला आकलन')) + '"><div class="ax-row"><span class="ax-hk">' + axE(axT('Next · ' + axLv(n.level) + ' assessment', 'अगला · ' + axLv(n.level) + ' आकलन')) + '</span><span class="ax-pill ' + (conf ? 'cf' : 'pr') + '">' + axE(conf ? axT('Confirmed', 'पक्का') : axT('Proposed', 'प्रस्तावित')) + '</span></div>'
      + (d >= 0 ? '<div class="ax-cd"><b>' + d + '</b><div><b>' + axE(d === 1 ? axT('day to go', 'दिन बाकी') : d === 0 ? axT('today', 'आज') : axT('days to go', 'दिन बाकी')) + '</b><span>' + axE(axFmt(n.date, true)) + '</span></div></div>'
        : '<div class="ax-cd"><div><b>' + axE(axT('Was due on ' + axFmt(n.date, true), axFmt(n.date) + ' को था')) + '</b><span>' + axE(axT('Record the result once you have it.', 'परिणाम मिलने पर दर्ज करें।')) + '</span></div></div>')
      + '<p class="ax-hs">' + axE(axT('Set by ', 'तय किया: ') + (n.byName || '') + (n.at ? ' · ' + axFmt(String(n.at).slice(0, 10)) : '') + (n.ref ? ' · ' + axT('Ref. ', 'संदर्भ ') + n.ref : '')) + '</p>'
      + (n.note ? '<p class="ax-hn">' + axE(n.note) + '</p>' : '')
      + (M.ic ? '<div class="ax-hb">' + (d < 0 ? '<button type="button" class="ax-w" onclick="axSheet(\'result\')">' + axE(axT('Record the result', 'परिणाम दर्ज करें')) + '</button>'
        : !conf ? '<button type="button" class="ax-w" onclick="axConfirm()">' + axE(axT('Mark as confirmed', 'पक्का करें')) + '</button>' : '')
        + '<button type="button" class="ax-o" onclick="axSheet(\'next\')">' + axE(axT('Change', 'बदलें')) + '</button></div>' : '')
      + '</section>';
  } else {
    h += '<section class="ax-hero ax-empty" aria-label="' + axE(axT('Next assessment', 'अगला आकलन')) + '"><span class="ax-hk">' + axE(axT('Next assessment', 'अगला आकलन')) + '</span>'
      + '<b class="ax-eh">' + axE(axT('No date yet', 'अभी तारीख़ तय नहीं')) + '</b>'
      + '<p class="ax-hs">' + axE(M.ic ? axT('Add the date you expect (Proposed) or have been given (Confirmed). Your team sees the countdown and gets reminders.', 'अपेक्षित (प्रस्तावित) या मिली हुई (पक्की) तारीख़ जोड़ें। टीम को उलटी गिनती और रिमाइंडर मिलेंगे।') : axT('Your in-charge adds the date when it is known.', 'तारीख़ पता चलने पर प्रभारी इसे जोड़ेंगे।')) + '</p>'
      + (M.ic ? '<div class="ax-hb"><button type="button" class="ax-w" onclick="axSheet(\'next\')">' + axE(axT('Set the next assessment', 'अगला आकलन तय करें')) + '</button></div>' : '') + '</section>';
  }
  // readiness against the target
  if (_ax.pct != null) {
    var gap = AX_TARGET - _ax.pct;
    h += '<section class="ax-card" aria-label="' + axE(axT('Readiness', 'तैयारी')) + '"><div class="ax-row"><span class="ax-k">' + axE(axT('Readiness', 'तैयारी')) + '</span><small>' + axE(axT('target for assessment ' + AX_TARGET + '%', 'आकलन का लक्ष्य ' + AX_TARGET + '%')) + '</small></div>'
      + '<div class="ax-row ax-big"><b>' + _ax.pct + '%</b><span class="' + (gap > 0 ? 'ax-warn' : 'ax-ok') + '">' + axE(gap > 0 ? axT(gap + ' points to go', gap + ' अंक बाकी') : axT('At or above the target', 'लक्ष्य पूरा')) + '</span></div>'
      + '<div class="ax-bar"><i style="width:' + Math.max(0, Math.min(100, _ax.pct)) + '%"></i><em style="left:' + AX_TARGET + '%"></em></div><small>' + axE(axT('From the latest nightly summary of your cards.', 'आपके कार्डों के रात के सारांश से।')) + '</small></section>';
  }
  // documents
  if (items.length) {
    var c = axDocCounts(items, docs), w1 = Math.round(c.rd * 100 / c.total), w2 = Math.round(c.ip * 100 / c.total);
    h += '<section class="ax-card" aria-label="' + axE(axT('Documents', 'दस्तावेज़')) + '"><div class="ax-row"><span class="ax-k">' + axE(axT('Documents', 'दस्तावेज़')) + '</span><button type="button" class="ax-link" onclick="axDocs()">' + axE(axT('Open list', 'सूची खोलें')) + '</button></div>'
      + '<div class="ax-big2"><b>' + c.rd + '</b><span>' + axE(axT('of ' + c.total + ' ready', c.total + ' में से तैयार')) + '</span></div>'
      + '<div class="ax-bar2"><i style="width:' + w1 + '%"></i><u style="width:' + w2 + '%"></u></div>'
      + '<div class="ax-cnt"><span><b>' + c.rd + '</b> ' + axE(axT('ready', 'तैयार')) + '</span><span><b>' + c.ip + '</b> ' + axE(axT('in progress', 'चल रहे')) + '</span><span><b>' + c.ns + '</b> ' + axE(axT('not started', 'शुरू नहीं')) + '</span>' + (c.od ? '<span class="ax-red"><b>' + c.od + '</b> ' + axE(axT('overdue', 'देर')) + '</span>' : '') + '</div>';
    if (M.mob) { var mine = items.filter(function (x) { return (docs[x.id] || {}).owner === M.mob; }); if (mine.length) { var mr = mine.filter(function (x) { return (docs[x.id] || {}).st === 'rd'; }).length; h += '<div class="ax-mine"><span>' + axE(axT('Your documents: ', 'आपके दस्तावेज़: ')) + '<b>' + axE(axT(mr + ' of ' + mine.length + ' ready', mine.length + ' में से ' + mr + ' तैयार')) + '</b></span><button type="button" class="ax-link" onclick="axDocs(\'mine\')">' + axE(axT('Open', 'खोलें')) + '</button></div>'; } }
    h += '</section>';
  }
  // journey
  var cur = n && n.level;
  h += '<section class="ax-card" aria-label="' + axE(axT('NQAS journey', 'NQAS यात्रा')) + '"><span class="ax-k">' + axE(axT('NQAS journey', 'NQAS यात्रा')) + '</span>';
  AX_LV.forEach(function (l) {
    var dn = J.done[l[0]], isN = cur === l[0] && !dn;
    h += '<div class="ax-step"><span class="ax-dot ' + (dn ? 'y' : isN ? 'n' : '') + '">' + (dn ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '') + '</span><div><b class="' + (dn || isN ? '' : 'ax-dim') + '">' + axE(axLv(l[0]) + axT(' assessment', ' आकलन')) + '</b><small class="' + (isN ? 'ax-warn' : '') + '">'
      + axE(dn ? axT('Done', 'हो गया') + (dn.date ? ' ' + axFmt(dn.date) : '') + (dn.score != null ? ' · ' + dn.score + '%' : '') : isN ? (n.status === 'confirmed' ? axT('Confirmed ', 'पक्का ') : axT('Proposed ', 'प्रस्तावित ')) + axFmt(n.date) + (axDays(n.date) >= 0 ? axT(' · in ' + axDays(n.date) + ' days', ' · ' + axDays(n.date) + ' दिन में') : '') : l[0] === 'national' ? axT('After the State recommends', 'राज्य की सिफ़ारिश के बाद') : axT('Not yet', 'अभी नहीं')) + '</small></div></div>';
  });
  h += '<div class="ax-step"><span class="ax-dot ' + (J.cert ? 'y' : '') + '">' + (J.cert ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>' : '') + '</span><div><b class="' + (J.cert ? '' : 'ax-dim') + '">' + axE(axT('Certified', 'प्रमाणित')) + '</b><small>' + axE(J.cert ? (J.cert.date ? axFmt(J.cert.date) : '') + (J.cert.score != null ? ' · ' + J.cert.score + '%' : '') : axT('Recorded by the district or HealSol', 'ज़िला या HealSol दर्ज करते हैं')) + '</small></div></div>'
    + (M.ic ? '<button type="button" class="ax-btn" onclick="axSheet(\'result\')">' + axE(axT('Record an assessment result', 'आकलन का परिणाम दर्ज करें')) + '</button>' : '') + '</section>';
  // preparation plan
  if (n && n.date && axDays(n.date) > 0) {
    var t = axToday();
    h += '<section class="ax-card" aria-label="' + axE(axT('Preparation plan', 'तैयारी योजना')) + '"><div class="ax-row"><span class="ax-k">' + axE(axT('Preparation plan', 'तैयारी योजना')) + '</span><small>' + axE(axT('worked back from ' + axFmt(n.date), axFmt(n.date) + ' से पीछे गिनकर')) + '</small></div>';
    AX_PLAN.forEach(function (p, i) { var dt = axAdd(n.date, -p[0]), past = dt < t;
      h += '<div class="ax-plan' + (past ? ' past' : '') + '"><div><b>' + axE(axT(p[1], p[2])) + '</b><small>' + axE(axT(p[0] + ' days before', p[0] + ' दिन पहले')) + (past ? ' · ' + axE(axT('date passed', 'तारीख़ निकल गई')) : '') + '</small></div><span>' + axE(axFmt(dt)) + '</span></div>'; });
    h += '<p class="ax-note"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E6B5E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>' + axE(axT('Phone reminders to the team 60, 30, 14, 7 and 1 day before.', 'टीम को 60, 30, 14, 7 और 1 दिन पहले फ़ोन रिमाइंडर।')) + '</p></section>';
  }
  // past assessments
  var H = (f.assess || {}).hist || {}, past = Object.keys(H).map(function (k) { return H[k]; }).filter(Boolean).sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  if (past.length) h += '<section class="ax-card" aria-label="' + axE(axT('Past assessments', 'पिछले आकलन')) + '"><span class="ax-k">' + axE(axT('Past assessments', 'पिछले आकलन')) + '</span>' + past.map(function (x) { return '<div class="ax-row ax-past"><span>' + axE(axLv(x.level) + ' · ' + axFmt(x.date)) + '</span><b>' + (x.score != null ? x.score + '%' : '—') + '</b></div>'; }).join('') + '</section>';
  return h + '</main>';
}

// ── documents ──
function axDocs(flt) { _ax.page = 'docs'; _ax.flt = flt || 'rem'; _ax.open = null; axRender(); try { document.getElementById('ax-ov').scrollTop = 0; } catch (e) {} }
function axFlt(k) { _ax.flt = k; _ax.open = null; axRender(); }
function axToggle(id) { _ax.open = _ax.open === id ? null : id; axRender(); }
function axCanEdit(M, d) { return M.ic || (!!M.mob && (d || {}).owner === M.mob); }
function axDocsHTML(M, f) {
  var items = axItems(_ax.list), docs = ((f.assess || {}).docs) || {}, t = axToday();
  if (!items.length) return '<main class="ax-main"><div class="ax-card"><p class="ax-p">' + axE(axT('HealSol Academy has not added the documents list for your facility type yet.', 'HealSol Academy ने अभी आपके केंद्र के लिए दस्तावेज़ सूची नहीं जोड़ी है।')) + '</p></div></main>';
  var c = axDocCounts(items, docs), mine = items.filter(function (x) { return M.mob && (docs[x.id] || {}).owner === M.mob; });
  var F = { all: items, rem: items.filter(function (x) { return (docs[x.id] || {}).st !== 'rd'; }), mine: mine, rd: items.filter(function (x) { return (docs[x.id] || {}).st === 'rd'; }) };
  var L = F[_ax.flt] || F.rem, S = (f.staff || {}), w1 = Math.round(c.rd * 100 / c.total), w2 = Math.round(c.ip * 100 / c.total);
  var h = '<div class="ax-dh"><div class="ax-row"><span><b>' + axE(axT(c.rd + ' of ' + c.total, c.total + ' में से ' + c.rd)) + '</b> ' + axE(axT('ready', 'तैयार')) + '</span><small>' + axE(axT((c.total - c.rd) + ' remaining', (c.total - c.rd) + ' बाकी')) + '</small></div><div class="ax-bar2"><i style="width:' + w1 + '%"></i><u style="width:' + w2 + '%"></u></div>'
    + '<div class="ax-chips" role="tablist" aria-label="' + axE(axT('Show', 'दिखाएँ')) + '">' + [['all', axT('All', 'सभी'), F.all.length], ['rem', axT('Remaining', 'बाकी'), F.rem.length], ['mine', axT('Mine', 'मेरे'), F.mine.length], ['rd', axT('Ready', 'तैयार'), F.rd.length]].map(function (x) {
      return '<button type="button" role="tab" aria-selected="' + (_ax.flt === x[0]) + '" class="' + (_ax.flt === x[0] ? 'on' : '') + '" onclick="axFlt(\'' + x[0] + '\')">' + axE(x[1]) + ' ' + x[2] + '</button>'; }).join('') + '</div></div><main class="ax-main">';
  if (!L.length) h += '<div class="ax-card"><p class="ax-p">' + axE(_ax.flt === 'mine' ? axT('No documents are assigned to you.', 'आपको कोई दस्तावेज़ नहीं सौंपा गया है।') : _ax.flt === 'rem' ? axT('Every document is ready.', 'सभी दस्तावेज़ तैयार हैं।') : axT('Nothing here.', 'यहाँ कुछ नहीं।')) + '</p></div>';
  var groups = [], gi = {}; L.forEach(function (x) { var g = x.aoc || axT('Other', 'अन्य'); if (gi[g] == null) { gi[g] = groups.length; groups.push({ g: g, L: [] }); } groups[gi[g]].L.push(x); });
  groups.forEach(function (G) {
    h += '<span class="ax-grp">' + axE(G.g) + '</span><div class="ax-box">';
    G.L.forEach(function (x) {
      var d = docs[x.id] || {}, st = d.st || 'ns', who = d.owner ? ((S[d.owner] || {}).name || d.owner) : '', od = st !== 'rd' && d.due && d.due < t, open = _ax.open === x.id, ed = axCanEdit(M, d);
      var sub = (who ? who : axT('No owner yet', 'अभी कोई ज़िम्मेदार नहीं')) + (d.due ? ' · ' : '');
      h += '<div class="ax-doc' + (open ? ' open' : '') + '"><button type="button" class="ax-dr" aria-expanded="' + open + '" onclick="axToggle(\'' + axJ(x.id) + '\')"><span class="ax-dn"><b>' + axE(x.name) + '</b><small>' + axE(sub) + (d.due ? (od ? '<b class="ax-red">' + axE(axT('overdue ' + (-axDays(d.due)) + ' day' + (-axDays(d.due) === 1 ? '' : 's'), (-axDays(d.due)) + ' दिन देर')) + '</b>' : axE(axT('due ', 'तक ') + axFmt(d.due))) : '') + '</small></span><span class="ax-st ' + st + '">' + axE(axStName(st)) + '</span></button>';
      if (open) {
        h += '<div class="ax-de">' + ((x.kind || x.std) ? '<small class="ax-meta">' + axE([x.kind, x.std ? axT('Standard ', 'मानक ') + x.std : ''].filter(Boolean).join(' · ')) + '</small>' : '');
        if (ed) {
          h += '<div class="ax-seg" role="radiogroup" aria-label="' + axE(axT('Status', 'स्थिति')) + '">' + AX_ST.map(function (s) { return '<button type="button" role="radio" aria-checked="' + (st === s[0]) + '" class="' + (st === s[0] ? 'on ' + s[0] : '') + '" onclick="axSetSt(\'' + axJ(x.id) + '\',\'' + s[0] + '\')">' + axE(axT(s[1], s[2])) + '</button>'; }).join('') + '</div>';
          if (M.ic) {
            var opts = Object.keys(S).filter(function (m) { return S[m] && !S[m].disabled && /^[0-9]{10}$/.test(m); }).map(function (m) { return '<option value="' + axE(m) + '"' + (d.owner === m ? ' selected' : '') + '>' + axE((S[m].name || m) + (S[m].role ? ' (' + S[m].role + ')' : '')) + '</option>'; }).join('');
            h += '<div class="ax-g2"><label>' + axE(axT('Owner', 'ज़िम्मेदार')) + '<select id="ax-ow-' + axE(x.id) + '" onchange="axSetMeta(\'' + axJ(x.id) + '\')"><option value="">' + axE(axT('— nobody —', '— कोई नहीं —')) + '</option>' + opts + '</select></label>'
              + '<label>' + axE(axT('Due', 'तारीख़')) + '<input type="date" id="ax-du-' + axE(x.id) + '" value="' + axE(d.due || '') + '" onchange="axSetMeta(\'' + axJ(x.id) + '\')"></label></div>';
          }
        } else h += '<p class="ax-p">' + axE(axT('Status: ', 'स्थिति: ') + axStName(st)) + '</p>';
        if (x.tip) h += '<small class="ax-tip">' + axE(axT('HealSol\'s tip: ', 'HealSol का सुझाव: ') + x.tip) + '</small>';
        if (d.at) h += '<small class="ax-meta">' + axE(axT('Updated ', 'अपडेट ') + axFmt(String(d.at).slice(0, 10)) + (d.byName ? ' · ' + d.byName : '')) + '</small>';
        h += '</div>';
      }
      h += '</div>';
    });
    h += '</div>';
  });
  return h + '</main>';
}
function axMyName(M) { var S = ((_ax.fac || {}).staff) || {}; return (S[M.mob] && S[M.mob].name) || (typeof choState !== 'undefined' && choState.staffName) || (M.ic ? axT('In-charge', 'प्रभारी') : ''); }
async function axSaveDoc(id, rec) {
  var M = axCtx(); if (!M || _ax.busy) return; _ax.busy = true;
  var ok = await fbSet(axPath(M.code, 'docs/' + id), rec); _ax.busy = false;
  if (ok === false) { showToast(axT('Could not save — check the connection.', 'सेव नहीं हुआ — कनेक्शन जाँचें।'), 'err'); return false; }
  _ax.fac.assess = _ax.fac.assess || {}; _ax.fac.assess.docs = _ax.fac.assess.docs || {}; _ax.fac.assess.docs[id] = rec; axRender(); return true;
}
async function axSetSt(id, st) {
  var M = axCtx(); if (!M) return; var d = (((_ax.fac || {}).assess || {}).docs || {})[id] || {};
  if (!axCanEdit(M, d)) return;
  var rec = { st: st, owner: d.owner || null, due: d.due || null, at: (typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString()), by: M.mob || null, byName: axMyName(M) || null };
  if (await axSaveDoc(id, rec)) showToast(axT('Saved: ', 'सेव: ') + axStName(st), 'ok');
}
async function axSetMeta(id) {
  var M = axCtx(); if (!M || !M.ic) return; var d = (((_ax.fac || {}).assess || {}).docs || {})[id] || {};
  var ow = (document.getElementById('ax-ow-' + id) || {}).value || '', du = (document.getElementById('ax-du-' + id) || {}).value || '';
  var rec = { st: d.st || 'ns', owner: ow || null, due: du || null, at: (typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString()), by: M.mob || null, byName: axMyName(M) || null };
  if (await axSaveDoc(id, rec)) showToast(axT('Saved.', 'सेव हो गया।'), 'ok');
}

// ── in-charge: set / confirm the next assessment, record a result ──
function axSheet(kind) { var n = ((_ax.fac || {}).assess || {}).next || {}; _ax.sheet = { kind: kind, level: n.level || 'state', status: kind === 'next' ? (n.status || 'proposed') : null }; axRender(); }
function axSheetClose() { _ax.sheet = null; axRender(); }
function axPick(k, v) { if (!_ax.sheet) return; ['date', 'ref', 'note', 'score'].forEach(function (f) { var el = document.getElementById('ax-s-' + f); if (el) _ax.sheet[f] = el.value; }); _ax.sheet[k] = v; axRender(); }
function axSheetHTML(M, f) {
  var S = _ax.sheet, n = ((f.assess || {}).next) || {}, res = S.kind === 'result';
  var v = function (k, d) { return S[k] != null ? S[k] : d; };
  var chips = AX_LV.map(function (l) { return '<button type="button" class="ax-chip' + (S.level === l[0] ? ' on' : '') + '" aria-pressed="' + (S.level === l[0]) + '" onclick="axPick(\'level\',\'' + l[0] + '\')">' + axE(axLv(l[0], true)) + '</button>'; }).join('');
  var h = '<div class="ax-sov" onclick="if(event.target===this)axSheetClose()"><form class="ax-sheet" onsubmit="event.preventDefault();axSheetSave()" aria-label="' + axE(res ? axT('Record an assessment result', 'आकलन का परिणाम') : axT('Next assessment', 'अगला आकलन')) + '"><i class="ax-grab"></i>'
    + '<div class="ax-row"><b class="ax-st2">' + axE(res ? axT('Assessment result', 'आकलन का परिणाम') : axT('Next assessment', 'अगला आकलन')) + '</b><button type="button" class="ax-back" aria-label="' + axE(axT('Close', 'बंद करें')) + '" onclick="axSheetClose()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg></button></div>'
    + '<fieldset><legend>' + axE(axT('Level', 'स्तर')) + '</legend><div class="ax-chs">' + chips + '</div></fieldset>'
    + '<label class="ax-l">' + axE(res ? axT('Date of the assessment', 'आकलन की तारीख़') : axT('Date', 'तारीख़')) + '<input id="ax-s-date" type="date" required value="' + axE(v('date', res ? (n.date && axDays(n.date) <= 0 ? n.date : axToday()) : (n.date || ''))) + '"></label>';
  if (res) h += '<label class="ax-l">' + axE(axT('Score (%)', 'स्कोर (%)')) + ' <span class="ax-h">' + axE(axT('optional', 'वैकल्पिक')) + '</span><input id="ax-s-score" type="number" min="0" max="100" inputmode="numeric" value="' + axE(v('score', '')) + '"></label>'
    + '<p class="ax-h">' + axE(axT('The result is added to "Past assessments" and the journey. NHSRC certification is recorded by the district or HealSol.', 'परिणाम "पिछले आकलन" और यात्रा में जुड़ता है। NHSRC प्रमाणन ज़िला या HealSol दर्ज करते हैं।')) + '</p>';
  else h += '<fieldset><legend>' + axE(axT('Is the date fixed?', 'क्या तारीख़ पक्की है?')) + '</legend><div class="ax-g2b">'
    + '<button type="button" class="ax-opt' + (S.status === 'proposed' ? ' on pr' : '') + '" aria-pressed="' + (S.status === 'proposed') + '" onclick="axPick(\'status\',\'proposed\')"><b>' + axE(axT('Proposed', 'प्रस्तावित')) + '</b><span>' + axE(axT('Expected, not yet fixed', 'अपेक्षित, अभी पक्की नहीं')) + '</span></button>'
    + '<button type="button" class="ax-opt' + (S.status === 'confirmed' ? ' on cf' : '') + '" aria-pressed="' + (S.status === 'confirmed') + '" onclick="axPick(\'status\',\'confirmed\')"><b>' + axE(axT('Confirmed', 'पक्की')) + '</b><span>' + axE(axT('Letter or call received', 'पत्र या कॉल मिली')) + '</span></button></div></fieldset>'
    + '<label class="ax-l">' + axE(axT('Reference', 'संदर्भ')) + ' <span class="ax-h">' + axE(axT('optional — letter number, assessor team', 'वैकल्पिक — पत्र संख्या, आकलन टीम')) + '</span><input id="ax-s-ref" type="text" maxlength="80" value="' + axE(v('ref', n.ref || '')) + '"></label>'
    + '<label class="ax-l">' + axE(axT('Note for the team', 'टीम के लिए नोट')) + ' <span class="ax-h">' + axE(axT('optional', 'वैकल्पिक')) + '</span><textarea id="ax-s-note" rows="2" maxlength="300">' + axE(v('note', n.note || '')) + '</textarea></label>'
    + '<p class="ax-h">' + axE(axT('Your team, your Supervisor and the district see this date. Reminders go out 60, 30, 14, 7 and 1 day before.', 'आपकी टीम, सुपरवाइज़र और ज़िला यह तारीख़ देखते हैं। 60, 30, 14, 7 और 1 दिन पहले रिमाइंडर जाते हैं।')) + '</p>';
  h += '<div class="ax-err" id="ax-s-err" role="alert"></div><button type="submit" class="ax-save">' + axE(axT('Save', 'सेव करें')) + '</button>'
    + (!res && n.date ? '<button type="button" class="ax-btn" onclick="axClearNext()">' + axE(axT('Remove this date', 'यह तारीख़ हटाएँ')) + '</button>' : '') + '</form></div>';
  return h;
}
async function axSheetSave() {
  var M = axCtx(), S = _ax.sheet; if (!M || !M.ic || !S || _ax.busy) return;
  var g = function (k) { var el = document.getElementById('ax-s-' + k); return el ? String(el.value || '').trim() : ''; }, err = function (m) { var e = document.getElementById('ax-s-err'); if (e) e.textContent = m; };
  var date = g('date'); if (!/^20\d{2}-[01]\d-[0-3]\d$/.test(date)) { err(axT('Choose the date.', 'तारीख़ चुनें।')); return; }
  var now = typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString(), ok;
  _ax.busy = true;
  if (S.kind === 'result') {
    var sc = g('score'); if (sc !== '' && (isNaN(+sc) || +sc < 0 || +sc > 100)) { _ax.busy = false; err(axT('The score is a number from 0 to 100.', 'स्कोर 0 से 100 के बीच हो।')); return; }
    if (axDays(date) > 0) { _ax.busy = false; err(axT('A result can only be recorded for a date that has passed.', 'परिणाम केवल बीती तारीख़ का दर्ज होता है।')); return; }
    var id = 'h' + date.replace(/-/g, '') + '_' + S.level, rec = { level: S.level, date: date, score: sc === '' ? null : Math.round(+sc), at: now, by: M.mob || null, byName: axMyName(M) || null };
    var upd = {}; upd['hist/' + id] = rec;
    var n = ((_ax.fac.assess || {}).next) || null; if (n && n.level === S.level) upd.next = null;   // that assessment has happened
    ok = false; try { await db.ref(axPath(M.code)).update(upd); ok = true; } catch (e) { console.warn('[assess] result', e); }
    if (ok !== false) { _ax.fac.assess = _ax.fac.assess || {}; _ax.fac.assess.hist = Object.assign({}, _ax.fac.assess.hist || {}, (function () { var o = {}; o[id] = rec; return o; })()); if (upd.next === null) delete _ax.fac.assess.next; }
  } else {
    if (axDays(date) < 0) { _ax.busy = false; err(axT('The next assessment needs a date from today onwards.', 'अगले आकलन की तारीख़ आज या आगे की हो।')); return; }
    var nx = { level: S.level, date: date, status: S.status || 'proposed', ref: g('ref') || null, note: g('note') || null, at: now, by: M.mob || null, byName: axMyName(M) || null };
    ok = await fbSet(axPath(M.code, 'next'), nx);
    if (ok !== false) { _ax.fac.assess = _ax.fac.assess || {}; _ax.fac.assess.next = nx; }
  }
  _ax.busy = false;
  if (ok === false) { err(axT('Could not save — check the connection.', 'सेव नहीं हुआ — कनेक्शन जाँचें।')); return; }
  _ax.sheet = null; _ax.chip[M.code] = { at: Date.now(), a: _ax.fac.assess }; axRender(); showToast(axT('Saved.', 'सेव हो गया।'), 'ok');
}
async function axConfirm() {
  var M = axCtx(), n = ((_ax.fac || {}).assess || {}).next; if (!M || !M.ic || !n) return;
  var nx = Object.assign({}, n, { status: 'confirmed', at: typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString(), by: M.mob || null, byName: axMyName(M) || null });
  var ok = await fbSet(axPath(M.code, 'next'), nx); if (ok === false) { showToast(axT('Could not save — check the connection.', 'सेव नहीं हुआ — कनेक्शन जाँचें।'), 'err'); return; }
  _ax.fac.assess.next = nx; _ax.chip[M.code] = { at: Date.now(), a: _ax.fac.assess }; axRender(); showToast(axT('Marked as confirmed.', 'पक्का किया गया।'), 'ok');
}
async function axClearNext() {
  var M = axCtx(); if (!M || !M.ic) return;
  var go = true; try { go = await showConfirm(axT('Remove the next assessment date? Reminders stop.', 'अगले आकलन की तारीख़ हटाएँ? रिमाइंडर बंद हो जाएँगे।'), '📅', axT('Remove', 'हटाएँ'), axT('Cancel', 'रद्द करें'), 'var(--red)'); } catch (e) {} if (!go) return;
  var ok = await fbSet(axPath(M.code, 'next'), null); if (ok === false) { showToast(axT('Could not save — check the connection.', 'सेव नहीं हुआ — कनेक्शन जाँचें।'), 'err'); return; }
  if (_ax.fac.assess) delete _ax.fac.assess.next; _ax.sheet = null; _ax.chip[M.code] = { at: Date.now(), a: _ax.fac.assess }; axRender();
}

// ── Today: the countdown chip (all staff; in-charge without a date: "Set assessment date") ──
function axChipText(a, ic) {
  var n = a && a.next; if (n && n.date) { var d = axDays(n.date); if (d < 0) return ic ? axT(axLv(n.level, true) + ': record the result', axLv(n.level, true) + ': परिणाम दर्ज करें') : null;
    return d === 0 ? axT(axLv(n.level, true) + ' assessment today', axLv(n.level, true) + ' आकलन आज') : axT(axLv(n.level, true) + ' in ' + d + ' day' + (d === 1 ? '' : 's'), axLv(n.level, true) + ' ' + d + ' दिन में'); }
  return ic ? axT('Set assessment date', 'आकलन की तारीख़ तय करें') : null;
}
async function axChipPaint(force) {
  var M = axCtx(); if (!M) return;
  var c = _ax.chip[M.code];
  if (!c || force === 'load' || Date.now() - c.at > 5 * 60e3) { try { var a = await fbGet(axPath(M.code)); _ax.chip[M.code] = c = { at: Date.now(), a: a || null }; } catch (e) { return; } }
  var txt = axChipText(c.a, M.ic), old = document.getElementById('ax-chip');
  if (!txt) { if (old) old.remove(); return; }
  var n = c.a && c.a.next, cls = 'ax-chipb' + (n && n.date ? (n.status === 'confirmed' ? ' cf' : ' pr') : ' set');
  var html = '<button type="button" class="' + cls + '" id="ax-chip" onclick="axOpen()"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>' + axE(txt) + '</button>';
  if (old) { old.outerHTML = html; return; }
  var fc = document.getElementById('fpo-chip');
  if (fc) fc.insertAdjacentHTML('afterend', html);
  else if (M.dept) { var top = document.querySelector('.nx'); if (top) top.insertAdjacentHTML('afterbegin', '<div class="fpo-chiprow">' + html + '</div>'); }
  else { var t2 = document.querySelector('#nf-today .nf-top-l'); if (t2) t2.insertAdjacentHTML('beforeend', html); }
}
(function () {
  var paint = function () { setTimeout(function () { try { axChipPaint(); } catch (e) { console.warn('[assess] chip', e); } }, 120); };
  if (typeof nfRenderToday === 'function') { var o = nfRenderToday; nfRenderToday = function () { var r = o.apply(this, arguments); try { if (typeof nfIsStaff === 'function' && nfIsStaff()) paint(); } catch (e) {} return r; }; }
  if (typeof ndRender === 'function') { var d = ndRender; ndRender = function () { var r = d.apply(this, arguments); try { if (_nd && _nd.fac && !_nd.view && _nd.tab === 'today' && !_nd.card && !_nd.screen && !(typeof ndFaOn === 'function' && ndFaOn())) paint(); } catch (e) {} return r; }; }
})();

// ══ Supervisors, district, block and HealSol: "Assessments" — every facility with a date, nearest first ══
async function axAllLists() { if (_ax.all && Date.now() - _ax.all.at < 5 * 60e3) return _ax.all.L; var L = {}; try { L = (await fbGet('shared/sc_assess_docs')) || {}; } catch (e) {} _ax.all = { at: Date.now(), L: L }; return L; }
function axFacPct(code) {
  try { var s = typeof _nfSum !== 'undefined' && _nfSum && _nfSum.map && _nfSum.map[code]; if (s && s.pct != null) return s.pct; } catch (e) {}
  try { if (typeof scFacAggFor === 'function') { var a = scFacAggFor(code); if (a && a.coverage && a.coverage.assessed) return a.pct; } } catch (e) {}
  return null;
}
function axUpRows() {
  var codes = []; try { codes = typeof scVisibleFacilityCodes === 'function' ? scVisibleFacilityCodes() : Object.keys(scMasterFacilities || {}); } catch (e) {}
  var lists = (_ax.all && _ax.all.L) || {};
  return codes.map(function (c) { var f = (scMasterFacilities || {})[c] || {}; if (f.showcase || f.testFac) return null; var t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : 'sc', A = f.assess || {}, n = A.next || null, J = axJourney(f), items = axItems(lists[t]), dc = items.length ? axDocCounts(items, A.docs) : null;
    var stage = J.cert ? axT('Certified', 'प्रमाणित') : ['national', 'state', 'district', 'internal'].filter(function (k) { return J.done[k]; }).map(function (k) { var x = J.done[k]; return axLv(k, true) + ' ' + axT('done', 'हो गया') + (x.score != null ? ' · ' + x.score + '%' : ''); })[0] || axT('Not started', 'शुरू नहीं');
    return { code: c, name: f.name || c, type: t, block: f.block || '', district: f.district || '', n: n, days: n && n.date ? axDays(n.date) : null, pct: axFacPct(c), dc: dc, stage: stage };
  }).filter(Boolean);
}
async function axUpRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var b = document.getElementById('ax-upv'); if (!b) { b = document.createElement('div'); b.id = 'ax-upv'; b.dataset.nfv = 'axup'; main.insertBefore(b, main.firstChild); }
  if (!_ax.all) { b.innerHTML = '<div class="nfo-card"><p class="ax-p">Loading…</p></div>'; await axAllLists(); }
  var R = axUpRows(), withD = R.filter(function (r) { return r.n && r.days != null && r.days >= 0; }).sort(function (a, b) { return a.days - b.days; });
  var L = _ax.up === 'n90' ? withD.filter(function (r) { return r.days <= 90; }) : _ax.up === 'none' ? R.filter(function (r) { return !r.n; }) : withD.concat(R.filter(function (r) { return r.n && r.days < 0; }));
  var T = function (k, n) { return '<button type="button" role="tab" aria-selected="' + (_ax.up === k) + '" class="' + (_ax.up === k ? 'on' : '') + '" onclick="_ax.up=\'' + k + '\';axUpRender()">' + n + '</button>'; };
  var tiles = [['Next 30 days', withD.filter(function (r) { return r.days <= 30; }).length, ''], ['Next 90 days', withD.filter(function (r) { return r.days <= 90; }).length, ''], ['Still "Proposed"', withD.filter(function (r) { return r.n.status !== 'confirmed'; }).length, ''], ['Below ' + AX_TARGET + '% with a date', withD.filter(function (r) { return r.pct != null && r.pct < AX_TARGET; }).length, 'w']];
  var lbl = { sc: 'Sub-Centre', uphc: 'UPHC', phc: 'PHC', chc: 'CHC' };
  b.innerHTML = '<div class="ax-up"><div class="ax-uph"><div><small>' + axE(R.length + ' facilit' + (R.length === 1 ? 'y' : 'ies')) + '</small><h2>Upcoming assessments</h2></div><div class="ax-upt" role="tablist" aria-label="Show">' + T('n90', 'Next 90 days') + T('all', 'All dates') + T('none', 'No date yet') + '</div></div>'
    + '<div class="ax-tiles">' + tiles.map(function (x) { return '<div class="ax-tile"><small>' + axE(x[0]) + '</small><b class="' + x[2] + '">' + x[1] + '</b></div>'; }).join('') + '</div>'
    + (L.length ? '<div class="ax-tw"><table class="ax-tb"><thead><tr><th>Facility</th><th>Level</th><th>Date</th><th>Days to go</th><th>Readiness</th><th>Documents</th><th>Stage now</th></tr></thead><tbody>'
      + L.map(function (r) { var n = r.n || {};
        return '<tr><td data-l=""><b>' + axE(r.name) + '</b><small>' + axE([lbl[r.type] || r.type, r.block || r.district].filter(Boolean).join(' · ')) + '</small></td><td data-l="Level">' + axE(n.level ? axLv(n.level, true) : '—') + '</td>'
          + '<td data-l="Date">' + (n.date ? axE(axFmt(n.date)) + ' <span class="ax-pill ' + (n.status === 'confirmed' ? 'cf' : 'pr') + '">' + (n.status === 'confirmed' ? 'Confirmed' : 'Proposed') + '</span>' : '—') + '</td>'
          + '<td data-l="Days to go" class="ax-dd">' + (r.days == null ? '—' : r.days < 0 ? '<small>passed</small>' : r.days) + '</td>'
          + '<td data-l="Readiness">' + (r.pct == null ? '—' : '<span class="ax-rb"><span class="ax-bar"><i style="width:' + r.pct + '%"></i></span>' + r.pct + '%</span>') + '</td>'
          + '<td data-l="Documents"' + (r.dc && r.n && r.days != null && r.days <= 60 && r.dc.rd < r.dc.total ? ' class="ax-red"' : '') + '>' + (r.dc ? r.dc.rd + ' of ' + r.dc.total : '—') + '</td><td data-l="Stage now">' + axE(r.stage) + '</td></tr>'; }).join('') + '</tbody></table></div>'
      : '<div class="nfo-card"><p class="ax-p">' + axE(_ax.up === 'none' ? 'Every facility has a date.' : 'No facility has an assessment date in this period. The facility in-charge adds it in the app (Today → "Set assessment date").') + '</p></div>')
    + '<p class="ax-p ax-sm">Sorted by the nearest date. Dates and document ticks are entered by each facility in-charge; "Proposed" means expected, "Confirmed" means the letter or call has come.</p></div>';
}
(function () {
  if (typeof nfAdminItems === 'function') {
    var oI = nfAdminItems;
    nfAdminItems = function () {
      var L = oI.apply(this, arguments); if (document.body.classList.contains('nf-champ')) return L;
      if (L.some(function (x) { return x.v === 'axup'; })) return L;
      var i = -1; L.forEach(function (x, k) { if (x.v === 'facilities' || x.v === 'hsfac' || x.v === 'hsprog') i = k; });
      L.splice(i + 1, 0, { v: 'axup', l: 'Assessments', icon: 'ti-calendar-event', onclick: "nfAdminView('axup')" });
      return L;
    };
  }
  if (typeof nfAdminApply === 'function') { var oA = nfAdminApply; nfAdminApply = function () { var r = oA.apply(this, arguments); document.body.classList.toggle('nfv-axup', _nfOv.view === 'axup');
    try { var side = document.getElementById('nfs-side'); if (side && _nfOv.view === 'axup') side.querySelectorAll('.nfs-nav button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === 'axup'); }); } catch (e) {} return r; }; }
  if (typeof nfAdminView === 'function') { var oV = nfAdminView; nfAdminView = function (v) { var r = oV.apply(this, arguments); if (v === 'axup') axUpRender(); return r; }; }
  if (typeof HS_MORE !== 'undefined') HS_MORE.push('axup');
  if (typeof hsMoreOpen === 'function') { var oM = hsMoreOpen; hsMoreOpen = function () { var r = oM.apply(this, arguments);
    try { var sh = document.querySelector('#hs-more .hs-more-sh'), k = sh && (sh.querySelector('[data-hsp]') || sh.querySelector('.hs-more-k')); if (sh && k && !sh.querySelector('[data-axm]')) {
      k.insertAdjacentHTML(k.hasAttribute('data-hsp') ? 'beforebegin' : 'afterend', '<button type="button" data-axm="1" onclick="hsMoreClose();nfAdminView(\'axup\')"><span class="hs-more-i"><i class="ti ti-calendar-event"></i></span><span><b>Assessments</b><small>Facilities with an assessment date, nearest first</small></span><i class="ti ti-chevron-right"></i></button>'); } } catch (e) {}
    return r; }; }
})();

// ══ HealSol: Settings → Programme rules → Assessment documents (one list per facility type) ══
var _axa = { t: 'sc', L: null };
var AX_TYPES = [['sc', 'Sub-Centre'], ['uphc', 'UPHC'], ['phc', 'PHC'], ['chc', 'CHC']];
var AX_COLS = ['Area of Concern', 'Document', 'Type', 'Standard', 'Who usually owns it', 'Tip for staff'];
function axSlug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'doc'; }
async function axAdmLoad(force) { if (!_axa.L || force) { try { _axa.L = (await fbGet('shared/sc_assess_docs')) || {}; } catch (e) { _axa.L = {}; } } return _axa.L; }
async function axAdmRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-axdocs');
  if (!el) { el = document.createElement('div'); el.id = 'hs-axdocs'; el.dataset.nfv = 'setup'; el.className = 'nfo-card sp-card'; el.setAttribute('data-hsg', 'rules'); var c = document.getElementById('hs-sampling') || document.getElementById('hs-crit') || document.getElementById('hs-rules'); if (c && c.parentNode === main) c.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  if (!_axa.L) { el.innerHTML = '<b><i class="ti ti-file-check"></i> Assessment documents</b><p>Loading…</p>'; await axAdmLoad(); }
  var L = _axa.L || {}, cur = L[_axa.t] || {}, items = axItems(cur);
  el.innerHTML = '<b><i class="ti ti-file-check"></i> Assessment documents</b><p>The list each facility type sees in its Assessment tab. Staff only tick the status; nothing is uploaded. Changes reach facilities at their next open; their ticks are kept for documents that stay on the list (same name).</p>'
    + '<div class="sp-types" role="tablist" aria-label="Facility type">' + AX_TYPES.map(function (t) { var n = axItems(L[t[0]]).length; return '<button type="button" role="tab" aria-selected="' + (_axa.t === t[0]) + '" class="' + (_axa.t === t[0] ? 'on' : '') + '" onclick="_axa.t=\'' + t[0] + '\';axAdmRender()">' + t[1] + ' · ' + n + '</button>'; }).join('') + '</div>'
    + '<div class="ax-adm-acts"><label class="hs-btn p">Upload Excel<input type="file" accept=".xlsx,.xls,.csv" hidden onchange="axAdmUpload(this)"></label><button type="button" class="hs-btn" onclick="axAdmDownload()">' + (items.length ? 'Download this list' : 'Download the template') + '</button><button type="button" class="hs-btn" onclick="axAdmAdd()">Add one document</button>'
    + (cur.at ? '<small>Last updated ' + axE(axFmt(String(cur.at).slice(0, 10))) + (cur.by ? ' by ' + axE(cur.by) : '') + '</small>' : '') + '</div>'
    + (items.length ? '<div class="ax-tw"><table class="ax-tb"><thead><tr><th>Area of Concern</th><th>Document</th><th>Type</th><th>Standard</th><th>Usual owner</th><th>Tip for staff</th><th><span class="ax-sr">Remove</span></th></tr></thead><tbody>'
      + items.map(function (x) { return '<tr><td data-l="Area">' + axE(x.aoc || '') + '</td><td data-l=""><b>' + axE(x.name) + '</b></td><td data-l="Type">' + axE(x.kind || '') + '</td><td data-l="Standard">' + axE(x.std || '') + '</td><td data-l="Owner">' + axE(x.owner || '') + '</td><td data-l="Tip">' + axE(x.tip || '') + '</td><td><button type="button" class="hs-btn" aria-label="Remove ' + axE(x.name) + '" onclick="axAdmRemove(\'' + axJ(x.id) + '\')"><i class="ti ti-trash"></i></button></td></tr>'; }).join('') + '</tbody></table></div>'
      : '<p class="ax-p">No list for ' + axE((AX_TYPES.filter(function (t) { return t[0] === _axa.t; })[0] || [])[1]) + ' yet. Download the template, fill one row per document and upload it.</p>');
}
function axAdmRows(rows) {   // [[aoc, name, kind, std, owner, tip], …] → items (ids from the name, kept across uploads)
  var items = {}, seen = {};
  rows.forEach(function (r, i) { var name = String(r[1] || '').trim(); if (!name) return; var id = 'd_' + axSlug(name), k = id, j = 2; while (seen[k]) k = id + '_' + (j++); seen[k] = 1;
    items[k] = { o: i + 1, aoc: String(r[0] || '').trim().slice(0, 60), name: name.slice(0, 120), kind: String(r[2] || '').trim().slice(0, 30), std: String(r[3] || '').trim().slice(0, 20), owner: String(r[4] || '').trim().slice(0, 40), tip: String(r[5] || '').trim().slice(0, 200) }; });
  return items;
}
async function axAdmSave(items) {
  var rec = { items: items, at: typeof scNowIso === 'function' ? scNowIso() : new Date().toISOString(), by: (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.hs) || 'HealSol' };
  var ok = await fbSet('shared/sc_assess_docs/' + _axa.t, rec); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return false; }
  _axa.L = _axa.L || {}; _axa.L[_axa.t] = rec; _ax.all = null; axAdmRender(); return true;
}
async function axAdmUpload(inp) {
  var file = inp.files && inp.files[0]; inp.value = ''; if (!file) return;
  var X = typeof nfLoadXlsx === 'function' ? await nfLoadXlsx() : window.XLSX; if (!X) { showToast('Excel could not load — check the connection.', 'err'); return; }
  try {
    var wb = X.read(await file.arrayBuffer(), { type: 'array' }), ws = wb.Sheets[wb.SheetNames[0]], A = X.utils.sheet_to_json(ws, { header: 1, defval: '' });
    var start = A.length && /document/i.test(String(A[0][1] || '')) ? 1 : 0, rows = A.slice(start).filter(function (r) { return String(r[1] || '').trim(); });
    if (!rows.length) { showToast('No documents found — column B must have the document names.', 'err'); return; }
    var tn = (AX_TYPES.filter(function (t) { return t[0] === _axa.t; })[0] || [])[1], old = axItems((_axa.L || {})[_axa.t]).length;
    var go = true; try { go = await showConfirm('Replace the ' + tn + ' list' + (old ? ' (' + old + ' documents)' : '') + ' with ' + rows.length + ' documents from this file?', '📄', 'Replace', 'Cancel', 'var(--teal)'); } catch (e) {} if (!go) return;
    if (await axAdmSave(axAdmRows(rows))) showToast(tn + ': ' + rows.length + ' documents saved.', 'ok');
  } catch (e) { console.warn('[assess] upload', e); showToast('Could not read that file.', 'err'); }
}
async function axAdmDownload() {
  var X = typeof nfLoadXlsx === 'function' ? await nfLoadXlsx() : window.XLSX; if (!X) { showToast('Excel could not load — check the connection.', 'err'); return; }
  var items = axItems((_axa.L || {})[_axa.t]), A = [AX_COLS].concat(items.length ? items.map(function (x) { return [x.aoc || '', x.name, x.kind || '', x.std || '', x.owner || '', x.tip || '']; }) : [['A · Service provision', 'Citizen\'s Charter (displayed)', 'Display', 'A1', 'In-charge', 'At the entrance, in Hindi']]);
  var wb = X.utils.book_new(), ws = X.utils.aoa_to_sheet(A); ws['!cols'] = [{ wch: 24 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 18 }, { wch: 40 }];
  X.utils.book_append_sheet(wb, ws, 'Documents'); X.writeFile(wb, 'assessment-documents-' + _axa.t + '.xlsx');
}
async function axAdmAdd() {
  var v = await scDialog({ title: 'Add a document', icon: '📄', okLabel: 'Add', fields: [{ key: 'aoc', label: 'Area of Concern', placeholder: 'e.g. B · Patient rights' }, { key: 'name', label: 'Document', required: true }, { key: 'kind', label: 'Type', type: 'select', value: 'SOP', options: ['SOP', 'Register', 'Record', 'Policy', 'Display', 'Other'].map(function (x) { return { value: x, label: x }; }) }, { key: 'std', label: 'Standard (optional)', placeholder: 'e.g. B4' }, { key: 'owner', label: 'Who usually owns it (optional)' }, { key: 'tip', label: 'Tip for staff (optional)', type: 'textarea', rows: 2 }] });
  if (!v || !v.name) return;
  var items = axItems((_axa.L || {})[_axa.t]), rows = items.map(function (x) { return [x.aoc, x.name, x.kind, x.std, x.owner, x.tip]; }); rows.push([v.aoc, v.name, v.kind, v.std, v.owner, v.tip]);
  if (await axAdmSave(axAdmRows(rows))) showToast('Added.', 'ok');
}
async function axAdmRemove(id) {
  var items = axItems((_axa.L || {})[_axa.t]), x = items.filter(function (i) { return i.id === id; })[0]; if (!x) return;
  var go = true; try { go = await showConfirm('Remove "' + x.name + '" from the list? Facilities\' ticks for it are no longer shown.', '🗑️', 'Remove', 'Cancel', 'var(--red)'); } catch (e) {} if (!go) return;
  if (await axAdmSave(axAdmRows(items.filter(function (i) { return i.id !== id; }).map(function (i) { return [i.aoc, i.name, i.kind, i.std, i.owner, i.tip]; })))) showToast('Removed.', 'ok');
}
(function () {
  if (typeof HS_RTABS !== 'undefined') HS_RTABS.forEach(function (g) { if (g[0] === 'Assessment' && !g[1].some(function (x) { return x[0] === 'axdocs'; })) g[1].push(['axdocs', 'hs-axdocs', 'Assessment documents', 'The documents list per facility type']); });
  if (typeof hsSetupGroup === 'function') { var oG = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-axdocs') return 'rules'; return oG.apply(this, arguments); }; }
  if (typeof hsRkApply === 'function') { var oK = hsRkApply; hsRkApply = function () { try { if (typeof hsOn === 'function' && hsOn() && _nfOv.view === 'setup' && !document.getElementById('hs-axdocs')) axAdmRender(); } catch (e) { console.warn('[assess] adm', e); } return oK.apply(this, arguments); }; }
})();
