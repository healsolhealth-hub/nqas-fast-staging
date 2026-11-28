// ══════════════════════════════════════════════════════════════
// TODAY DURING IMPLEMENTATION — one of each thing, in the order of the day (approved 28 Nov 2026)
//   1 name · stars · Facility profile · Day N / 60      (the streak, "Set assessment date" and other one-time prompts are off Today)
//   2 Your fixes today (with "this week x of n")
//   3 Facility readiness
//   4 Your team today (CHO) — one row per staff: today's fixes + "n to check"; tap → that person's fixes to check
//   5 My actions — only when a supervisor has assigned a corrective action
//   6 Coming up — Quality Champion call · live session · NQAS assessment · next VHSND
//   7 Learn · Facility dashboard
//   Removed here: the long open check list, Team fixes today, This week, the Learn card, "Team: Behind", Cards to verify, My gaps.
// ══════════════════════════════════════════════════════════════
var _tdi = { qc: 0, live: 0, co: 0, ax: 0 };
function tdiT(en, hi) { return typeof imfT === 'function' ? imfT(en, hi) : en; }
function tdiE(s) { return typeof imfE === 'function' ? imfE(s) : String(s == null ? '' : s); }
function tdiJ(s) { return typeof scJs === 'function' ? scJs(String(s == null ? '' : s)) : String(s).replace(/'/g, "\\'"); }
function tdiHost() { var h = document.getElementById('nf-today'); return h && h.classList.contains('tdi') ? h : null; }
function tdiRole() { return (typeof choState !== 'undefined' && choState.roleId) || 'CHO'; }
function tdiIcon(p) { return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
var TDI_IC = {
  qc: '<path d="M15 10l4.5-2.5v9L15 14"/><rect x="3" y="7" width="12" height="10" rx="2"/>',
  live: '<circle cx="12" cy="12" r="2"/><path d="M16.2 7.8a6 6 0 0 1 0 8.4M7.8 16.2a6 6 0 0 1 0-8.4M19 5a10 10 0 0 1 0 14M5 19A10 10 0 0 1 5 5"/>',
  ax: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  co: '<circle cx="12" cy="7" r="3"/><path d="M6 21v-2a6 6 0 0 1 12 0v2"/>'
};

// ── 4. the team: one row per staff member ──
function tdiToCheck(ctx) {
  if (tdiRole() !== 'CHO' || typeof imfToCheck !== 'function') return [];
  return imfToCheck(ctx, function (mob, role) { return mob !== ctx.me && role !== 'CHO' && role !== 'MO'; });
}
function tdiTeam(ctx, di) {
  var L = tdiToCheck(ctx), by = {}, out = [];
  L.forEach(function (x) { (by[x.mob] = by[x.mob] || []).push(x); });
  imfMobs(ctx).forEach(function (m) { if (m === ctx.me) return; var p = (ctx.staff || {})[m]; if (!p || p.disabled) return; var role = p.role || imfRoleOf(ctx, m); if (role === 'CHO' || role === 'MO') return;
    var T = imfTodayList(imfItems(ctx, di, m, role), di), chk = (by[m] || []).length; if (!T.length && !chk) return;
    out.push({ mob: m, name: imfNameOf(ctx, m), role: role, done: T.filter(imfAddressed).length, n: T.length, chk: chk, L: by[m] || [] }); });
  return { rows: out.sort(function (a, b) { return (b.chk - a.chk) || String(a.name).localeCompare(String(b.name)); }), total: L.length };
}
function tdiTodayText(r) { return r.n ? tdiT('Today ' + r.done + ' of ' + r.n + ' fixed', 'आज ' + r.n + ' में से ' + r.done + ' सुधरे') : tdiT('No fixes today', 'आज कोई सुधार नहीं'); }
function tdiTeamHTML(ctx, di) {
  if (tdiRole() !== 'CHO') return '';
  var T = tdiTeam(ctx, di); if (!T.rows.length) return '';
  return '<div class="nf-card tdi-card tdi-team"><span class="tdi-k">' + tdiE(T.total ? tdiT('YOUR TEAM TODAY · ' + T.total + ' FIX' + (T.total === 1 ? '' : 'ES') + ' TO CHECK', 'आज आपकी टीम · ' + T.total + ' सुधार जाँचने हैं') : tdiT('YOUR TEAM TODAY', 'आज आपकी टीम')) + '</span>'
    + T.rows.map(function (r) {
      return '<button type="button" class="tdi-row" onclick="tdiCheckOpen(\'' + tdiJ(r.mob) + '\')"><span class="tdi-av">' + tdiE(String(r.name).charAt(0).toUpperCase()) + '</span><span class="tdi-tx"><b>' + tdiE(r.name + ' · ' + r.role) + '</b><small>' + tdiE(tdiTodayText(r)) + '</small></span>'
        + (r.chk ? '<span class="tdi-chip">' + tdiE(tdiT(r.chk + ' to check', r.chk + ' जाँचें')) + '</span>' : '<span class="tdi-okc">' + tdiE(tdiT('All checked ✓', 'सब जाँचे ✓')) + '</span>') + '<i class="ti ti-chevron-right"></i></button>'; }).join('') + '</div>';
}
// tap a row → that person's fixes to check (the same cards as before)
function tdiCheckOpen(mob) {
  var ctx = imfCtxMine(); if (!ctx || !ctx.loaded) return;
  var di = scb1TodayIdx(), T = tdiTeam(ctx, di), i = -1; T.rows.some(function (r, k) { if (r.mob === mob) { i = k; return true; } return false; });
  var r = i >= 0 ? T.rows[i] : { mob: mob, name: imfNameOf(ctx, mob), role: imfRoleOf(ctx, mob), done: 0, n: 0, chk: 0, L: [] };
  var nx = null; for (var k = 1; k <= T.rows.length; k++) { var c = T.rows[(i + k) % T.rows.length]; if (c && c.mob !== mob && c.chk) { nx = c; break; } }
  var ov = document.getElementById('tdi-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'tdi-ov'; ov.setAttribute('role', 'dialog'); document.body.appendChild(ov); }
  ov.setAttribute('aria-label', tdiT(r.name + '\'s fixes to check', r.name + ' के सुधार जाँचें'));
  ov.innerHTML = '<div class="tdi-ovp"><button type="button" class="tdi-back" onclick="tdiCheckClose()">‹ ' + tdiE(tdiT('Today', 'आज')) + '</button>'
    + '<h2>' + tdiE(tdiT(r.name + '\'s fixes to check · ' + r.chk, r.name + ' के सुधार जाँचें · ' + r.chk)) + '</h2><p class="tdi-sub">' + tdiE(r.role + ' · ' + tdiTodayText(r).toLowerCase()) + '</p>'
    + (r.L.length ? r.L.map(imfCheckCardHTML).join('') : '<p class="tdi-none">' + tdiE(tdiT('Nothing to check — all of ' + r.name + '\'s fixes are checked.', r.name + ' के सब सुधार जाँचे जा चुके हैं।')) + '</p>')
    + (nx ? '<button type="button" class="tdi-next" onclick="tdiCheckOpen(\'' + tdiJ(nx.mob) + '\')">' + tdiE(tdiT('Next: ' + nx.name + ' (' + nx.chk + ')', 'अगला: ' + nx.name + ' (' + nx.chk + ')')) + ' ›</button>' : '') + '</div>';
  ov.scrollTop = 0; document.body.classList.add('tdi-open');
}
function tdiCheckClose() { var ov = document.getElementById('tdi-ov'); if (ov) ov.remove(); document.body.classList.remove('tdi-open'); try { nfRenderToday(); } catch (e) {} }

// ── 6. coming up ──
function tdiUpRow(ic, cls, t, s, btn, go) {
  return '<div class="tdi-row tdi-up-r"' + (go ? ' role="button" tabindex="0" onclick="' + go + '"' : '') + '><span class="tdi-ic ' + cls + '">' + tdiIcon(TDI_IC[ic]) + '</span><span class="tdi-tx"><b>' + tdiE(t) + '</b><small>' + tdiE(s) + '</small></span>' + (btn || '') + '</div>';
}
function tdiBtn(label, fn, ghost) { return '<button type="button" class="tdi-btn' + (ghost ? ' g' : '') + '" onclick="event.stopPropagation();' + fn + '">' + tdiE(label) + '</button>'; }
function tdiWhen(iso) {   // "Today, 4:00 pm" · "Tomorrow, 4:00 pm" · "Mon, 1 Dec, 4:00 pm"
  try { var d = new Date(iso); if (isNaN(d)) return String(iso || ''); var k = function (x) { return x.getFullYear() + '-' + x.getMonth() + '-' + x.getDate(); }, n = new Date(), tm = new Date(); tm.setDate(tm.getDate() + 1);
    var tx = d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    if (k(d) === k(n)) return tdiT('Today, ', 'आज, ') + tx; if (k(d) === k(tm)) return tdiT('Tomorrow, ', 'कल, ') + tx; return scFmtDateTime(iso); } catch (e) { return String(iso || ''); } }
function tdiQcRow() {
  try { if (typeof scqFacUpcoming !== 'function' || typeof _scq === 'undefined' || !_scq.facSessions) return ''; var s = scqFacUpcoming()[0]; if (!s) return '';
    var live = scqPhase(s) === 'live', I = tdiJ(s.id);
    return tdiUpRow('qc', 'g', tdiT('Quality Champion call', 'क्वालिटी चैंपियन कॉल') + (s.championName ? ' · ' + s.championName : ''), tdiWhen(s.startAt) + (s.dayFrom ? ' · ' + tdiT('peer review, Days ', 'सहकर्मी समीक्षा, दिन ') + s.dayFrom + '–' + s.dayTo : ''),
      live ? tdiBtn(tdiT('Join', 'जुड़ें'), 'scqJoin(\'' + I + '\')') : tdiBtn(tdiT('Prepare', 'तैयारी'), 'scqOpenChecklist(\'' + I + '\')', true), live ? 'scqJoin(\'' + I + '\')' : 'scqOpenChecklist(\'' + I + '\')'); } catch (e) { return ''; }
}
function tdiLiveRow() {
  try { if (typeof scLiveSorted !== 'function' || typeof _scLive === 'undefined') return ''; var s = scLiveSorted(scLiveAudience()).filter(function (x) { return scLiveStatus(x) !== 'ended'; })[0]; if (!s) return '';
    var live = scLiveStatus(s) === 'live', I = tdiJ(s.id);
    return tdiUpRow('live', 'p', tdiT('Live session: ', 'लाइव सत्र: ') + (s.title || ''), tdiWhen(s.startAt), live ? tdiBtn(tdiT('Join', 'जुड़ें'), 'scJoinLive(\'' + I + '\')') : tdiBtn(tdiT('Details', 'विवरण'), 'scOpenLiveSessions()', true), live ? 'scJoinLive(\'' + I + '\')' : 'scOpenLiveSessions()'); } catch (e) { return ''; }
}
function tdiAxRow() {
  try { if (typeof axCtx !== 'function' || typeof _ax === 'undefined') return ''; var M = axCtx(); if (!M) return ''; var c = _ax.chip && _ax.chip[M.code], n = c && c.a && c.a.next; if (!n || !n.date) return '';
    var txt = axChipText(c.a, M.ic); if (!txt) return '';
    return tdiUpRow('ax', 'o', txt, (typeof scFmtDate === 'function' ? scFmtDate(n.date) : n.date) + ' · ' + (n.status === 'confirmed' ? tdiT('confirmed', 'पक्की') : tdiT('planned', 'प्रस्तावित')), '', 'axOpen()'); } catch (e) { return ''; }
}
function tdiCoRow() {
  try { if (typeof coCtx !== 'function' || typeof _co === 'undefined') return ''; var X = coCtx(); if (!X || X.asha || !_co.d || _co.code !== X.code || !coDaysOn().length) return '';
    var today = coToday(), e = new Date(); e.setDate(e.getDate() + 31); var end = coYmd(e), wk = new Date(); wk.setDate(wk.getDate() + 7); var w7 = coYmd(wk), months = [today.slice(0, 7)];
    if (end.slice(0, 7) !== months[0]) months.push(end.slice(0, 7));
    var P = []; months.forEach(function (m) { var s = _co.month; _co.month = m; try { P = P.concat(coPlan(m)); } catch (er) {} _co.month = s; });
    P = P.filter(function (r) { return !r.spare && r.status !== 'moved' && r.status !== 'held' && r.date >= today && r.date <= end; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var r = P[0]; if (!r) return ''; var more = P.filter(function (x) { return x !== r && x.date <= w7; }).length, from = (_co.d.vhsnd || {}).from;
    var tm = new Date(); tm.setDate(tm.getDate() + 1); var when = r.date === today ? tdiT('Today', 'आज') : r.date === coYmd(tm) ? tdiT('Tomorrow', 'कल') : coFmt(r.date, true);
    return tdiUpRow('co', 'y', coVH(X) + ' · ' + r.v.name, [when + (from ? ' ' + from : ''), r.v.awc ? tdiT('Anganwadi centre ', 'आंगनवाड़ी केंद्र ') + r.v.awc : '', more ? tdiT('+' + more + ' more this week', 'इस सप्ताह +' + more + ' और') : ''].filter(Boolean).join(' · '), '', 'coOpen(\'vhs\',\'' + tdiJ(r.v.id) + '\')'); } catch (e) { return ''; }
}
function tdiUpHTML() {
  var rows = [tdiQcRow(), tdiLiveRow(), tdiAxRow(), tdiCoRow()].filter(Boolean); if (!rows.length) return '';
  return '<div class="nf-card tdi-card tdi-up"><span class="tdi-k">' + tdiE(tdiT('COMING UP', 'आगे क्या है')) + '</span>' + rows.join('') + '</div>';
}
function tdiUpPaint() {
  var host = tdiHost(); if (!host) return; var old = host.querySelector('.tdi-up'), h = tdiUpHTML();
  if (!h) { if (old) old.remove(); return; }
  var w = document.createElement('div'); w.innerHTML = h; if (old) old.replaceWith(w.firstChild); else host.appendChild(w.firstChild);
}
function tdiUpLoad() {   // what Coming up needs; each loads once, then Coming up repaints
  var now = Date.now(), again = function () { setTimeout(tdiUpPaint, 0); };
  try { if (typeof scqLoadFacilitySessions === 'function' && now - _tdi.qc > 5 * 60e3) { _tdi.qc = now; scqLoadFacilitySessions().then(again, function () {}); } } catch (e) {}
  try { if (typeof scLoadLive === 'function' && now - _tdi.live > 5 * 60e3) { _tdi.live = now; scLoadLive().then(again, function () {}); } } catch (e) {}
  try { if (typeof coLoad === 'function' && typeof coCtx === 'function' && !_tdi.co) { var X = coCtx(); if (X && !(_co.d && _co.code === X.code)) { _tdi.co = 1; coLoad().then(function () { _tdi.co = 0; again(); }, function () { _tdi.co = 0; }); } } } catch (e) {}
  if (!_tdi.ax) { _tdi.ax = 1; setTimeout(function () { _tdi.ax = 0; tdiUpPaint(); }, 1500); }   // the assessment date arrives with the (hidden) Today chip
}

// ── 7. links ──
function tdiLinksHTML() {
  var L = [];
  if (typeof lrnOpen === 'function') L.push('<button type="button" onclick="lrnOpen()">' + tdiIcon('<path d="M8 5v14l11-7z"/>') + tdiE(tdiT('Learn', 'सीखें')) + '</button>');
  if (tdiRole() === 'CHO' && typeof _scDual !== 'undefined' && _scDual) L.push('<button type="button" onclick="scb1ShowTab(\'dash\')">' + tdiE(tdiT('Facility dashboard', 'केंद्र डैशबोर्ड')) + '</button>');
  return L.length ? '<div class="tdi-links">' + L.join('') + '</div>' : '';
}

// ── 5. My actions: shown only when there is one (the tab bar keeps only "My actions") ──
function tdiActSync() {
  var host = tdiHost(); if (!host) return; var n = 0; try { n = nfTTCounts().a; } catch (e) {}
  host.classList.toggle('tdi-act', n > 0);
}

// ── the screen ──
function tdiApply() {
  var host = document.getElementById('nf-today'); if (!host) return;
  var on = document.body.classList.contains('imf-day') && !!host.querySelector('.imf-hero') && !(typeof wsIsPre === 'function' && wsIsPre());
  host.classList.toggle('tdi', on); document.body.classList.toggle('tdi-on', on); if (!on) return;
  var di = scb1TodayIdx(), ctx = imfCtxMine(); if (!ctx || !ctx.loaded) return;
  var X = typeof coCtx === 'function' ? coCtx() : null; host.classList.toggle('tdi-asha', !!(X && X.asha));
  // 1 header: Day N / 60 in place of the streak
  var top = host.querySelector('.nf-top'); if (top && !top.querySelector('.tdi-day')) { var wl = ''; try { var w = typeof nfWait === 'function' && typeof isScFac === 'function' ? nfWait(isScFac()) : null; if (w && typeof isWaitLabel === 'function') wl = isWaitLabel(w); } catch (e) {}   // paused / choosing Day 8: say so, not the day number
    top.insertAdjacentHTML('beforeend', '<span class="tdi-day">' + tdiE(wl || tdiT('Day ' + (di + 1) + ' / 60', 'दिन ' + (di + 1) + ' / 60')) + '</span>'); }
  // 2 this week, inside the fixes card
  var hero = host.querySelector('.imf-hero');
  if (hero && !hero.querySelector('.tdi-wk')) { try { var it = imfItems(ctx, di), n = it.length, f = it.filter(function (x) { return x.st === 'fixed'; }).length;
      if (n) { var cta = hero.querySelector('.nf-cta'), s = '<small class="tdi-wk">' + tdiE(tdiT('This week ' + f + ' of ' + n + ' fixed', 'इस सप्ताह ' + n + ' में से ' + f + ' सुधरे')) + '</small>'; if (cta) cta.insertAdjacentHTML('beforebegin', s); else hero.insertAdjacentHTML('beforeend', s); } } catch (e) {} }
  // old sections that the new ones replace
  host.querySelectorAll('.imf-vsec, .imf-team, .imf-week, .tdi-team, .tdi-links').forEach(function (e) { e.remove(); });
  var gs = document.getElementById('nfg-staff'); if (gs) { gs.querySelectorAll('.nfg-row').forEach(function (e) { e.remove(); }); gs.querySelectorAll('.nfg-banner').forEach(function (b) { if (/population|जनसंख्या/i.test(b.textContent) && b.querySelector('button')) b.remove(); }); if (!gs.children.length) gs.remove(); }
  // 4 team · 6 coming up · 7 links
  host.insertAdjacentHTML('beforeend', tdiTeamHTML(ctx, di) + tdiLinksHTML());
  tdiUpPaint(); tdiUpLoad();
  try { if (typeof _nfTT !== 'undefined') { _nfTT = 'a'; if (typeof nfTTPlace === 'function' && host.querySelector('#nf-tt')) nfTTPlace(); } } catch (e) {}
  tdiActSync();
}
(function () {
  if (typeof nfRenderToday === 'function') { var o = nfRenderToday; nfRenderToday = function () { var r = o.apply(this, arguments); try { tdiApply(); } catch (e) { console.warn('[TDI]', e); } return r; }; }
  if (typeof nfTTPlace === 'function') { var p = nfTTPlace; nfTTPlace = function () { if (tdiHost() && typeof _nfTT !== 'undefined') _nfTT = 'a'; var r = p.apply(this, arguments); try { tdiActSync(); var h = tdiHost(), sl = h && h.querySelector('#nf-tt'); if (sl && !sl.querySelector('.tdi-k')) { var n = nfTTCounts().a; sl.insertAdjacentHTML('afterbegin', '<span class="tdi-k">' + tdiE(tdiT('MY ACTIONS · ' + n + ' · FROM YOUR SUPERVISOR', 'मेरे कार्य · ' + n + ' · पर्यवेक्षक से')) + '</span>'); } } catch (e) {} return r; }; }
  if (typeof axChipPaint === 'function') { var a = axChipPaint; axChipPaint = async function () { var r = await a.apply(this, arguments); try { tdiUpPaint(); } catch (e) {} return r; }; }
  // Facility profile → Facility set-up: the NQAS assessment date (one-time, in-charge) lives here, not on Today
  if (typeof blaSetupHTML === 'function') { var b = blaSetupHTML; blaSetupHTML = function (M) { var h = b.apply(this, arguments); try { if (!h || typeof axOpen !== 'function') return h;
      var c = typeof _ax !== 'undefined' && _ax.chip ? _ax.chip[M.code] : null, n = c && c.a && c.a.next;
      if (!c && typeof fbGet === 'function' && typeof axPath === 'function' && !_tdi.axp) { _tdi.axp = 1; fbGet(axPath(M.code)).then(function (a) { _tdi.axp = 0; _ax.chip[M.code] = { at: Date.now(), a: a || null }; if (document.getElementById('fpo-ov')) fpoRender(); }, function () { _tdi.axp = 0; }); }
      var st = n && n.date ? (axChipText(c.a, true) || '') + ' · ' + (typeof scFmtDate === 'function' ? scFmtDate(n.date) : n.date) : tdiT('Not set · tap to set the date', 'तय नहीं · तारीख़ तय करने के लिए टैप करें');
      var row = '<button type="button" class="bla-set" onclick="axOpen()"><i class="ti ti-calendar"></i><span><b>' + tdiE(tdiT('NQAS assessment date', 'NQAS आकलन की तारीख़')) + '</b><small class="' + (n && n.date ? 'ok' : 'no') + '">' + tdiE(st) + '</small></span><i class="ti ti-chevron-right"></i></button>';
      var k = h.lastIndexOf('</div>'); return h.slice(0, k) + row + h.slice(k); } catch (e) { return h; } }; }
})();
