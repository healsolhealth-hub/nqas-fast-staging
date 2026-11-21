// ══════════════════════════════════════════════════════════════
// COMMUNITY OUTREACH · REFERRAL LINKAGES · VHSND / UHND PLANNER (21 Nov 2026; canvas "Community Outreach", approved)
//  Data: sc_outreach/{code}
//   team/{aid}     = { name, role, at }    an ASHA / USHA without app login yet (no mobile); the name lives only here (21 Nov 2026)
//   villages/{vid} = { name, pop, hh, km, ashas:{mob:true}, others:{aid:true}, awc, aww, geo:{lat,lng,by,at}, slot:{n,d}, at }
//   referral       = { up:{1:{name,t,nin,km,phone,wa,h24,svc:{},lat,lng},2:…,3:…}, amb:{e,m}, at }
//   vhsnd          = { days:{3:true,6:true}, from, to, svc:{…}, at }        one set-up per facility (the state's fixed days)
//   sessions/{YYYY-MM}/{vid} = { status:'held'|'postponed'|'planned', date (moved to), from, reason, by, at }
//   printed        = { chart, plan }
//  The month's plan is worked out from the set-up: each village has a fixed slot (the n-th session day of the month);
//  a postponed session moves to any day (HealSol). Only the in-charge and the ANM mark held / postponed (HealSol).
//  UPHC: "Area / ward" and UHND. Sub-Centre: no "facilities that refer to us" (first point of contact).
//  Entry: Facility profile → Community Outreach / Referral Linkages; Today → my villages (ASHA), this week's sessions.
// ══════════════════════════════════════════════════════════════
var _co = { code: null, d: null, staff: null, at: 0, view: 'co', vid: null, lvl: null, below: null, choices: null, month: null, sel: null, share: { r: 'week', hi: true }, place: null, map: null, note: null, back: [] };
var CO_SVC = [['imm', 'Immunisation', 'टीकाकरण'], ['anc', 'ANC check-up', 'गर्भवती जाँच'], ['gm', 'Growth monitoring', 'बच्चों का वज़न'], ['thr', 'Take-home ration', 'पोषण आहार'], ['fp', 'Family planning', 'परिवार नियोजन'], ['ncd', 'NCD screening', 'बीपी-शुगर जाँच'], ['cou', 'Counselling', 'परामर्श']];
var CO_REF_SVC = [['del', 'Delivery'], ['csec', 'C-section'], ['blood', 'Blood'], ['sncu', 'SNCU / sick newborn'], ['bite', 'Snake bite / poisoning'], ['emg', 'All emergencies'], ['tbncd', 'TB / NCD'], ['lab', 'Lab']];
var CO_RT = { phc: 'PHC', chc: 'CHC (FRU)', uphc: 'UPHC', dh: 'District Hospital', mc: 'Medical college', other: 'Other' };
var CO_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], CO_DAYS_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
var CO_MON_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
var CO_REASONS = ['Heavy rain / flood', 'Staff on leave or training', 'Vaccine / logistics not available', 'Holiday / festival', 'Election or other duty', 'Other'];
function coHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function coT(en, hi) { return coHi() && hi ? hi : en; }
function coE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function coJ(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function coN(n) { return n == null || n === '' ? '—' : Number(n).toLocaleString('en-IN'); }
function coYmd(d) { return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function coToday() { return coYmd(new Date()); }
function coDate(ymd) { var p = String(ymd).split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
function coFmt(ymd, long) { var d = coDate(ymd); return (coHi() ? CO_DAYS_HI : CO_DAYS)[d.getDay()] + ' ' + d.getDate() + (long ? ' ' + (coHi() ? CO_MON_HI[d.getMonth()] : d.toLocaleString('en-IN', { month: 'short' })) : ''); }
function coIcon(p) { return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + p + '</svg>'; }
var CO_BACK = '<path d="M15 6l-6 6 6 6"></path>', CO_PIN = '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"></path><circle cx="12" cy="10" r="2.5"></circle>';

// ── who and where ──
function coCtx() {
  var M = typeof rgMyFac === 'function' ? rgMyFac() : null; if (!M || !M.code) return null;
  var f = M.f || {}, t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f.type || 'sc'), Lv = (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[t]) || { inCharge: 'CHO' };
  var mob = ''; try { mob = (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || (typeof choState !== 'undefined' && choState.staffMobile) || ''; } catch (e) {}
  var S = _co.staff || f.staff || {}, r = S[mob] || {}, role = '';
  if (!M.dept) { try { role = choState.roleId || ''; } catch (e) {} if (!role) role = r.role || 'CHO'; if (t === 'sc' && role === 'CHO') role = Lv.inCharge; }
  else role = r.role || '';
  var inc = typeof rgIsInCharge === 'function' ? rgIsInCharge() : role === Lv.inCharge; if (inc) role = role || Lv.inCharge;
  return { code: M.code, f: f, t: t, dept: !!M.dept, mob: mob, role: role, inc: inc, anm: role === 'ANM', asha: role === 'ASHA' || role === 'USHA', urban: t === 'uphc', inChargeRole: Lv.inCharge };
}
function coV(X, plural) { return X.urban ? coT(plural ? 'Areas / wards' : 'Area / ward', plural ? 'क्षेत्र / वार्ड' : 'क्षेत्र / वार्ड') : coT(plural ? 'Villages' : 'Village', 'गाँव'); }
function coVH(X) { return X.urban ? 'UHND' : 'VHSND'; }
function coName(mob) { var S = _co.staff || {}; return (S[mob] && S[mob].name) || mob; }
function coAshaRoles() { return ['ASHA', 'USHA']; }
function coAshas() { var S = _co.staff || {}; return Object.keys(S).filter(function (m) { return S[m] && !S[m].disabled && coAshaRoles().indexOf(S[m].role) >= 0; }).map(function (m) { return { mob: m, name: S[m].name || m }; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
async function coLoad(force) {
  var X = coCtx(); if (!X) return null;
  if (!force && _co.d && _co.code === X.code && Date.now() - _co.at < 120000) return _co.d;
  var d = null; try { d = await fbGet('sc_outreach/' + X.code); } catch (e) {}
  _co.d = Object.assign({ villages: {}, referral: {}, vhsnd: {}, sessions: {}, printed: {} }, d || {}); ['villages', 'referral', 'vhsnd', 'sessions', 'printed', 'team'].forEach(function (k) { _co.d[k] = _co.d[k] || {}; });
  if (_co.code !== X.code || !_co.staff || force) { try { _co.staff = (await fbGet('sc_facilities/' + X.code + '/staff')) || (X.f.staff || {}); } catch (e) { _co.staff = X.f.staff || {}; } }
  _co.code = X.code; _co.at = Date.now();
  if (X.inc) { try { await coMigrateOthers(X); } catch (e) {} }
  return _co.d;
}
// names typed into a village before 21 Nov 2026 move to the team list once, so each name is kept in one place
async function coMigrateOthers(X) {
  var V = _co.d.villages || {}, T = _co.d.team, byName = {}; Object.keys(T).forEach(function (k) { if (T[k] && T[k].name) byName[T[k].name.toLowerCase()] = k; });
  for (var vid in V) { var o = V[vid].others || {}, ch = false, nw = {};
    for (var k in o) { if (o[k] === true) { nw[k] = true; continue; } var nm = String((o[k] || {}).name || '').trim(); if (!nm) { ch = true; continue; }
      var aid = byName[nm.toLowerCase()]; if (!aid) { aid = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); var rec = { name: nm, role: X.urban ? 'USHA' : 'ASHA', at: new Date().toISOString() };
        if ((await fbSet('sc_outreach/' + X.code + '/team/' + aid, rec)) === false) return; T[aid] = rec; byName[nm.toLowerCase()] = aid; }
      nw[aid] = true; ch = true; }
    if (ch && (await fbSet('sc_outreach/' + X.code + '/villages/' + vid + '/others', Object.keys(nw).length ? nw : null)) !== false) { if (Object.keys(nw).length) V[vid].others = nw; else delete V[vid].others; } }
}
function coVillages() { var V = (_co.d && _co.d.villages) || {}; return Object.keys(V).map(function (k) { return Object.assign({ id: k }, V[k]); }).sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); }); }
function coTeam() { return (_co.d && _co.d.team) || {}; }
function coOtherName(v, k) { var o = (v.others || {})[k]; if (o && typeof o === 'object') return o.name || ''; var t = coTeam()[k]; return t && t.name ? t.name : ''; }
function coAshaNames(v) { var n = Object.keys(v.ashas || {}).map(coName); Object.keys(v.others || {}).forEach(function (k) { var x = coOtherName(v, k); if (x) n.push(x); }); return n; }
// the ASHAs without app login, each with her villages
function coNoApp() { var T = coTeam(); return Object.keys(T).filter(function (k) { return T[k] && T[k].name; }).map(function (k) { return { aid: k, name: T[k].name, role: T[k].role || 'ASHA', vs: coVillages().filter(function (v) { return (v.others || {})[k]; }) }; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
function coVillagesOf(mob) { return coVillages().filter(function (v) { return (v.ashas || {})[mob]; }); }
function coPl(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
function coVn(X, n) { return coPl(n, coV(X).toLowerCase(), coV(X, true).toLowerCase()); }
function coAn(X, n) { var w = X.urban ? 'USHA' : 'ASHA'; return coPl(n, w, w + 's'); }
function coTotals() { var vs = coVillages(), p = 0, h = 0, a = {}; vs.forEach(function (v) { p += +v.pop || 0; h += +v.hh || 0; coAshaNames(v).forEach(function (n) { a[n] = 1; }); }); return { n: vs.length, pop: p, hh: h, ashas: Object.keys(a).length }; }
// the people an ASHA cares for: a village shared by two ASHAs counts half for each
function coMine(mob) { var out = [], tot = 0; coVillages().forEach(function (v) { if (!(v.ashas || {})[mob]) return; var k = coAshaNames(v).length || 1, share = Math.round((+v.pop || 0) / k); tot += share; out.push({ v: v, share: share, with: coAshaNames(v).filter(function (n) { return n !== coName(mob); }) }); }); return { list: out, pop: tot }; }

// ── the overlay ──
async function coOpen(view, arg) {
  var X = coCtx(); if (!X) return;
  var ov = document.getElementById('co-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'co-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); document.body.appendChild(ov); }
  document.body.classList.add('co-open'); _co.back = []; _co.view = view || 'co'; if (view === 'vhs') _co.sel = arg;
  ov.innerHTML = '<div class="co-page"><p class="co-dim">' + coE(coT('Loading…', 'लोड हो रहा है…')) + '</p></div>';
  await coLoad(); coRender();
}
function coClose() { var ov = document.getElementById('co-ov'); if (ov) ov.remove(); document.body.classList.remove('co-open'); if (_co.map) { try { _co.map.remove(); } catch (e) {} _co.map = null; } try { if (typeof nfRenderToday === 'function' && !(typeof _nd !== 'undefined' && _nd && document.body.classList.contains('nd-on'))) nfRenderToday(); else if (typeof ndRender === 'function') ndRender(); } catch (e) {} }
function coGo(view, arg) { _co.back.push({ v: _co.view, vid: _co.vid, lvl: _co.lvl, sel: _co.sel }); _co.view = view; if (view === 'vedit') _co.vid = arg || null; if (view === 'refedit') _co.lvl = arg || null; if (view === 'vhs' || view === 'note') _co.sel = arg; coRender(); }
function coBack() { var b = _co.back.pop(); if (!b) { coClose(); return; } _co.view = b.v; _co.vid = b.vid; _co.lvl = b.lvl; _co.sel = b.sel; coRender(); }
function coHead(title, sub, right) { return '<header class="co-hd"><button type="button" class="co-ic" onclick="coBack()" aria-label="' + coE(coT('Back', 'वापस')) + '">' + coIcon(CO_BACK) + '</button><div class="co-hd-t"><b>' + coE(title) + '</b>' + (sub ? '<span>' + coE(sub) + '</span>' : '') + '</div>' + (right || '') + '</header>'; }
function coRender() {
  var ov = document.getElementById('co-ov'), X = coCtx(); if (!ov || !X) return;
  if (_co.map && _co.view !== 'map') { try { _co.map.remove(); } catch (e) {} _co.map = null; }
  var V = { co: coCoHTML, vedit: coVeditHTML, map: coMapHTML, ref: coRefHTML, refedit: coRefEditHTML, note: coNoteHTML, vh: coVhHTML, vhset: coVhSetHTML, vhs: coVhsHTML, share: coShareHTML }[_co.view] || coCoHTML;
  ov.innerHTML = '<div class="co-page">' + V(X) + '</div>'; ov.scrollTop = 0;
  if (_co.view === 'map') coMapDraw(X);
  if (_co.view === 'ref' && X.t !== 'sc' && X.t !== 'uphc' && !_co.below) coLoadBelow(X);
}

// ══ 1 · Community Outreach ══
function coCoHTML(X) {
  var T = coTotals(), vs = coVillages(), placed = vs.filter(function (v) { return v.geo && v.geo.lat != null; }).length, f = X.f;
  var h = coHead(coT('Community Outreach', 'सामुदायिक पहुँच'), f.name || X.code);
  h += '<div class="co-hero"><span>' + coE(coT('COMMUNITY OUTREACH', 'सामुदायिक पहुँच')) + '</span><div class="co-tiles">'
    + [[T.n, T.n === 1 ? coV(X).toLowerCase() : coV(X, true).toLowerCase()], [coN(T.pop), coT('people', 'लोग')], [coN(T.hh || null), coT('households', 'परिवार')], [T.ashas, coAn(X, T.ashas).replace(/^\d+ /, '')]].map(function (x) { return '<div><b>' + coE(x[0]) + '</b><small>' + coE(x[1]) + '</small></div>'; }).join('') + '</div></div>';
  if (vs.length) h += '<button type="button" class="co-mapbtn" onclick="coGo(\'map\')">' + coIcon(CO_PIN) + '<span><b>' + coE(coT('Outreach map', 'पहुँच का नक्शा')) + '</b><small>' + coE(coT(placed + ' of ' + vs.length + ' placed', vs.length + ' में से ' + placed + ' नक्शे पर')) + '</small></span></button>';
  h += '<section class="co-card"><div class="co-row"><b>' + coE(coV(X, true) + ' & ' + (X.urban ? 'USHAs' : 'ASHAs')) + '</b>' + (X.inc ? '<button type="button" class="co-link" onclick="coGo(\'vedit\')">' + coE(vs.length ? coT('Edit', 'बदलें') : coT('Add', 'जोड़ें')) + '</button>' : '') + '</div>';
  if (!vs.length) h += '<p class="co-dim">' + coE(X.inc ? coT('Add your ' + coV(X, true).toLowerCase() + ' with their population and ASHA — the facility\'s population is then worked out from them.', 'अपने गाँव, जनसंख्या और आशा जोड़ें — केंद्र की जनसंख्या इन्हीं से बनेगी।') : coT('Your in-charge has not added the ' + coV(X, true).toLowerCase() + ' yet.', 'प्रभारी ने अभी गाँव नहीं जोड़े हैं।')) + '</p>';
  else h += '<div class="co-tbl"><div class="co-th"><span>' + coE(coV(X).toUpperCase()) + '</span><span>' + coE(coT('PEOPLE', 'लोग')) + '</span><span>' + (X.urban ? 'USHA' : 'ASHA') + '</span></div>'
    + vs.map(function (v) { return '<div class="co-tr"><b>' + coE(v.name) + '</b><span>' + coN(v.pop) + '</span><span>' + coE(coAshaNames(v).join(', ') || '—') + '</span></div>'; }).join('') + '</div>';
  h += '</section>';
  var S = coVhState(X); h += '<section class="co-card co-flex"><div><b>' + coE(coT(coVH(X) + ' this month', coVH(X) + ' इस महीने')) + '</b><small>' + coE(S.line) + '</small></div><button type="button" class="co-btn2" onclick="coGo(\'vh\')">' + coE(coT('Open plan', 'योजना खोलें')) + '</button></section>';
  var up = coUp(), names = up.map(function (u) { return u.name; }).join(' → ');
  h += '<button type="button" class="co-nav" onclick="coGo(\'ref\')"><span><b>' + coE(coT('Referral Linkages', 'रेफरल लिंकेज')) + '</b><small>' + coE(names || coT('Not set yet', 'अभी नहीं')) + ' · 108 / 102</small></span>' + coIcon('<path d="M9 6l6 6-6 6"></path>') + '</button>';
  return h;
}

// ══ 2 · Villages & ASHAs — edit (in-charge) ══
function coVeditHTML(X) {
  var vs = coVillages(), T = coTotals(), h = coHead(coV(X, true) + ' & ' + (X.urban ? 'USHAs' : 'ASHAs'), coT('Only the in-charge edits', 'केवल प्रभारी बदलते हैं'));
  if (_co.vid !== null) h += coVformHTML(X, _co.vid === '_new' ? null : (_co.d.villages || {})[_co.vid], _co.vid);
  h += '<section class="co-card co-list">' + (vs.length ? vs.map(function (v) {
    var g = v.geo && v.geo.lat != null; return '<div class="co-li"><span><b>' + coE(v.name) + '</b><small>' + coE([coN(v.pop) + ' ' + coT('people', 'लोग'), v.hh ? v.hh + ' ' + coT('households', 'परिवार') : '', v.km != null && v.km !== '' ? v.km + ' km' : '', coAshaNames(v).join(', ')].filter(Boolean).join(' · ')) + (g ? '' : ' · <em>' + coE(coT('no location yet', 'स्थान नहीं')) + '</em>') + '</small></span><button type="button" class="co-btn2" onclick="_co.vid=\'' + coJ(v.id) + '\';coRender()">' + coE(coT('Edit', 'बदलें')) + '</button></div>'; }).join('') : '<p class="co-dim">' + coE(coT('No ' + coV(X, true).toLowerCase() + ' yet.', 'अभी कोई गाँव नहीं।')) + '</p>') + '</section>';
  var NA = coNoApp(); if (NA.length) h += '<section class="co-card co-list"><div class="co-li"><span><b>' + coE(coT((X.urban ? 'USHAs' : 'ASHAs') + ' without app login', 'ऐप लॉगिन के बिना आशा')) + '</b><small>' + coE(coT('Add her mobile and she gets her own login — her ' + coV(X, true).toLowerCase() + ' stay.', 'मोबाइल जोड़ें — उन्हें अपना लॉगिन मिलेगा।')) + '</small></span></div>'
    + NA.map(function (a) { return '<div class="co-li"><span><b>' + coE(a.name) + '</b><small>' + coE(a.vs.map(function (v) { return v.name; }).join(', ') || coT('no ' + coV(X).toLowerCase() + ' yet', 'अभी कोई गाँव नहीं')) + '</small></span><button type="button" class="co-btn2" onclick="coGiveLogin(\'' + coJ(a.aid) + '\')">' + coE(coT('Add mobile', 'मोबाइल जोड़ें')) + '</button></div>'; }).join('') + '</section>';
  h += '<button type="button" class="co-add" onclick="_co.vid=\'_new\';coRender()">+ ' + coE(coT('Add a ' + coV(X).toLowerCase(), 'गाँव जोड़ें')) + '</button>';
  if (vs.length) {
    h += '<div class="co-ok"><b>' + coE(coT('Total: ' + coVn(X, T.n) + ' · ' + coN(T.pop) + ' people · ' + coAn(X, T.ashas) + '.', 'कुल: ' + T.n + ' गाँव · ' + coN(T.pop) + ' लोग · ' + T.ashas + ' आशा।')) + '</b> ' + coE(coT('This is your facility\'s population on the profile, the Impact page and reports.', 'यही आपके केंद्र की जनसंख्या है।')) + '</div>';
    coAshas().forEach(function (a) { var m = coMine(a.mob); if (m.pop > 1500) h += '<div class="co-warn">' + coE(coT(a.name + ' covers ' + m.list.length + ' ' + coV(X, true).toLowerCase() + ' (' + coN(m.pop) + ' people) — more than the usual 1 ASHA per about 1,000. Fine if that is how it is.', a.name + ' ' + coN(m.pop) + ' लोगों की देखभाल करती हैं — सामान्य (लगभग 1,000) से अधिक।')) + '</div>'; });
  }
  return h;
}
function coVformHTML(X, v, id) {
  v = v || { name: '', ashas: {}, others: {} }; var A = coAshas(), NA = coNoApp(), on = v.ashas || {}, onO = v.others || {}, g = v.geo && v.geo.lat != null;
  var fld = function (k, lab, val, type, ex) { return '<label class="co-f">' + coE(lab) + '<input id="cv-' + k + '" type="' + (type || 'text') + '" value="' + coE(val == null ? '' : val) + '"' + (ex || '') + '></label>'; };
  var h = '<section class="co-card co-form"><b>' + coE(v.name || coT('New ' + coV(X).toLowerCase(), 'नया गाँव')) + '</b>' + fld('name', coV(X) + ' *', v.name, 'text', ' maxlength="80"')
    + '<div class="co-g3">' + fld('pop', coT('Population *', 'जनसंख्या *'), v.pop, 'number', ' min="1" inputmode="numeric"') + fld('hh', coT('Households', 'परिवार'), v.hh, 'number', ' min="0" inputmode="numeric"') + fld('km', coT('Distance km', 'दूरी km'), v.km, 'number', ' min="0" step="0.1" inputmode="decimal"') + '</div>'
    + '<div class="co-g2">' + fld('awc', coT('Anganwadi centre', 'आंगनवाड़ी केंद्र'), v.awc, 'text', ' maxlength="60"') + fld('aww', coT('Anganwadi worker', 'आंगनवाड़ी कार्यकर्ता'), v.aww, 'text', ' maxlength="60"') + '</div>'
    + '<span class="co-lab">' + coE(coT('Location (for the outreach map)', 'स्थान (नक्शे के लिए)')) + '</span>'
    + '<div class="co-geo">' + coIcon(CO_PIN) + '<span>' + (g ? '<b>' + coE(coT('Placed', 'स्थान दर्ज')) + '</b> · ' + (+v.geo.lat).toFixed(4) + ', ' + (+v.geo.lng).toFixed(4) : coE(coT('Not placed yet', 'अभी दर्ज नहीं'))) + '</span></div>'
    + (id && id !== '_new' ? '<div class="co-g2b"><button type="button" class="co-btn2" onclick="coGeoHere(\'' + coJ(id) + '\')">' + coE(coT('Use my location here', 'मेरा वर्तमान स्थान')) + '</button><button type="button" class="co-btn2" onclick="_co.place=\'' + coJ(id) + '\';coGo(\'map\')">' + coE(coT('Pick on the map', 'नक्शे पर चुनें')) + '</button></div>'
      + '<small class="co-dim">' + coE(coT('Stand at the Anganwadi centre or the middle of the ' + coV(X).toLowerCase() + '. The ASHA can also place her own ' + coV(X, true).toLowerCase() + ' from her phone.', 'आंगनवाड़ी केंद्र या गाँव के बीच खड़े होकर दर्ज करें। आशा भी अपने गाँव दर्ज कर सकती हैं।')) + '</small>' : '<small class="co-dim">' + coE(coT('Keep it first; then place it on the map.', 'पहले सहेजें, फिर नक्शे पर दर्ज करें।')) + '</small>')
    + '<span class="co-lab">' + coE(coT((X.urban ? 'USHA' : 'ASHA') + '(s) — tap to choose from your team', 'आशा — अपनी टीम से चुनें')) + '</span><div class="co-chips" id="cv-chips">'
    + A.map(function (a) { return coChipHTML('data-mob', a.mob, a.name, !!on[a.mob], ''); }).join('')
    + NA.map(function (a) { return coChipHTML('data-aid', a.aid, a.name, !!onO[a.aid], coT('no app', 'ऐप नहीं')); }).join('')
    + (A.length || NA.length ? '' : '<small class="co-dim" id="cv-none">' + coE(coT('No ' + (X.urban ? 'USHA' : 'ASHA') + ' in your team yet — add her below.', 'टीम में अभी कोई आशा नहीं — नीचे जोड़ें।')) + '</small>') + '</div>'
    + '<div id="cv-new"></div><button type="button" class="co-link" id="cv-newbtn" onclick="coNewAshaForm()">+ ' + coE(coT('Add a new ' + (X.urban ? 'USHA' : 'ASHA') + ' to the team', 'टीम में नई आशा जोड़ें')) + '</button>'
    + '<div class="co-g2b"><button type="button" class="co-btn1" onclick="coSaveVillage(\'' + coJ(id) + '\')">' + coE(coT('Keep', 'सहेजें')) + '</button>' + (id && id !== '_new' ? '<button type="button" class="co-btn2 co-red" onclick="coDelVillage(\'' + coJ(id) + '\')">' + coE(coT('Remove', 'हटाएँ')) + '</button>' : '<button type="button" class="co-btn2" onclick="_co.vid=null;coRender()">' + coE(coT('Cancel', 'रद्द')) + '</button>') + '</div></section>';
  return h;
}
function coChipHTML(attr, key, name, on, tag) { return '<button type="button" class="co-chip' + (on ? ' on' : '') + '" aria-pressed="' + (on ? 'true' : 'false') + '" ' + attr + '="' + coE(key) + '" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\'))">' + coE(name) + (tag ? ' <em class="co-noapp">' + coE(tag) + '</em>' : '') + '</button>'; }
function coNewAshaForm() {
  var X = coCtx(), b = document.getElementById('cv-new'), btn = document.getElementById('cv-newbtn'); if (!b || !X) return; if (btn) btn.style.display = 'none';
  b.innerHTML = '<div class="co-newa"><b>' + coE(coT('New ' + (X.urban ? 'USHA' : 'ASHA') + ' — her name is kept once, in your team', 'नई आशा — नाम एक ही जगह, टीम में')) + '</b>'
    + '<label class="co-f">' + coE(coT('Name *', 'नाम *')) + '<input id="cn-aname" maxlength="60" autocomplete="off"></label>'
    + '<label class="co-f">' + coE(coT('Mobile (optional — with it she gets her own app login)', 'मोबाइल (वैकल्पिक — इससे उन्हें ऐप लॉगिन मिलेगा)')) + '<input id="cn-amob" type="tel" inputmode="numeric" maxlength="10" autocomplete="off"></label>'
    + '<div class="co-g2b"><button type="button" class="co-btn1" id="cn-ago" onclick="coNewAsha()">' + coE(coT('Add to team', 'टीम में जोड़ें')) + '</button><button type="button" class="co-btn2" onclick="coNewAshaCancel()">' + coE(coT('Cancel', 'रद्द')) + '</button></div>'
    + '<small class="co-dim">' + coE(coT('Without a mobile she is in the team as "no app login"; add her mobile any time from the Staff page or here.', 'मोबाइल के बिना वह टीम में "ऐप लॉगिन नहीं" के रूप में रहेंगी; मोबाइल बाद में भी जोड़ सकते हैं।')) + '</small></div>';
  var i = document.getElementById('cn-aname'); if (i) i.focus();
}
function coNewAshaCancel() { var b = document.getElementById('cv-new'), btn = document.getElementById('cv-newbtn'); if (b) b.innerHTML = ''; if (btn) btn.style.display = ''; }
// one new team member: with a mobile → a real staff login (the same createAccount as Staff → Add staff); without → team/{aid}
async function coAddTeamAsha(X, name, mob) {
  var role = X.urban ? 'USHA' : 'ASHA', S = _co.staff || {};
  if (mob) {
    if (!/^\d{10}$/.test(mob)) throw new Error(coT('Enter a 10-digit mobile number, or leave it empty.', '10 अंकों का मोबाइल लिखें, या खाली छोड़ें।'));
    if (S[mob] && !S[mob].disabled) { if (coAshaRoles().indexOf(S[mob].role) >= 0) return { mob: mob, name: S[mob].name || name, had: true }; throw new Error(coT('This mobile is already in your team as ' + (S[mob].role || 'staff') + '.', 'यह मोबाइल पहले से टीम में है।')); }
    var r = await nfCall('createAccount', { kind: 'staff', code: X.code, role: role, mobile: mob, name: name });
    var rec = { name: name, mobile: mob, role: role, addedAt: new Date().toISOString() }; S[mob] = rec; _co.staff = S;
    try { if (X.f.staff) X.f.staff[mob] = rec; if (typeof scSubAdminStaff !== 'undefined' && scSubAdminStaff && typeof scSubAdminCode !== 'undefined' && scSubAdminCode === X.code) scSubAdminStaff[mob] = rec; } catch (e) {}
    try { if (X.dept && typeof _nd !== 'undefined' && _nd && _nd.code === X.code) { _nd.fac.staff = _nd.fac.staff || {}; _nd.fac.staff[mob] = rec; if (typeof ndSaveDepts === 'function' && typeof ndJoinDefaults === 'function') await ndSaveDepts(ndJoinDefaults(mob, role)); } } catch (e) {}
    return { mob: mob, name: name, pwd: r };
  }
  var T = _co.d.team, same = Object.keys(T).find(function (k) { return T[k] && String(T[k].name).toLowerCase() === name.toLowerCase(); }); if (same) return { aid: same, name: T[same].name, had: true };
  var aid = 'a' + Date.now().toString(36), t = { name: name, role: role, at: new Date().toISOString() };
  if ((await fbSet('sc_outreach/' + X.code + '/team/' + aid, t)) === false) throw new Error(coT('Could not save — check the connection.', 'सहेजा नहीं गया — कनेक्शन देखें।'));
  T[aid] = t; return { aid: aid, name: name };
}
async function coNewAsha() {
  var X = coCtx(); if (!X || !X.inc) return; var name = coVal('cn-aname').replace(/\s+/g, ' '), mob = coVal('cn-amob').replace(/\D/g, ''), go = document.getElementById('cn-ago');
  if (!name) { showToast(coT('Write her name.', 'नाम लिखें।'), 'err'); return; }
  if (go) go.disabled = true;
  try {
    var r = await coAddTeamAsha(X, name, mob), box = document.getElementById('cv-chips');
    if (box) { var n = document.getElementById('cv-none'); if (n) n.remove(); var sel = r.mob ? '[data-mob="' + r.mob + '"]' : '[data-aid="' + r.aid + '"]', ex = box.querySelector(sel);
      if (ex) { ex.classList.add('on'); ex.setAttribute('aria-pressed', 'true'); } else box.insertAdjacentHTML('beforeend', r.mob ? coChipHTML('data-mob', r.mob, r.name, true, '') : coChipHTML('data-aid', r.aid, r.name, true, coT('no app', 'ऐप नहीं'))); }
    coNewAshaCancel();
    if (r.pwd && typeof nfShowTempPassword === 'function') nfShowTempPassword(r.name, r.pwd.identifier, r.pwd.tempPassword, r.name + ' added');
    else showToast(r.had ? coT(r.name + ' is already in your team — chosen.', r.name + ' पहले से टीम में हैं — चुनी गईं।') : coT(r.name + ' added to the team. Press Keep to save the ' + coV(X).toLowerCase() + '.', r.name + ' टीम में जोड़ी गईं। सहेजें दबाएँ।'), 'ok');
  } catch (e) { showToast(e && e.code ? nfErrText(e) : (e && e.message) || String(e), 'err'); if (go) go.disabled = false; }
}
// an ASHA without app login gets her mobile: a real login, and every village moves her from others to ashas
async function coGiveLogin(aid) {
  var X = coCtx(); if (!X || !X.inc) return; await coLoad(); var t = coTeam()[aid]; if (!t) return;
  var v = await scDialog({ title: coT('App login for ' + t.name, t.name + ' के लिए ऐप लॉगिन'), icon: '📱', okLabel: coT('Give login', 'लॉगिन दें'), message: coT('Her villages stay as they are. She gets a temporary password once and then logs in with her mobile number.', 'उनके गाँव वैसे ही रहेंगे। उन्हें एक बार अस्थायी पासवर्ड मिलेगा।'), fields: [{ key: 'mob', label: coT('Her mobile number', 'उनका मोबाइल नंबर'), required: true, placeholder: '10 digits' }] });
  if (!v) return; var mob = String(v.mob || '').replace(/\D/g, '');
  try {
    var r = await coAddTeamAsha(X, t.name, mob), V = _co.d.villages || {};
    for (var vid in V) { if (!(V[vid].others || {})[aid]) continue; var o = Object.assign({}, V[vid].others); delete o[aid]; var a = Object.assign({}, V[vid].ashas || {}); a[mob] = true;
      if ((await fbSet('sc_outreach/' + X.code + '/villages/' + vid + '/ashas', a)) === false) throw new Error(coT('Could not move her villages — try again.', 'गाँव नहीं बदले — दोबारा प्रयास करें।'));
      await fbSet('sc_outreach/' + X.code + '/villages/' + vid + '/others', Object.keys(o).length ? o : null); V[vid].ashas = a; if (Object.keys(o).length) V[vid].others = o; else delete V[vid].others; }
    await fbSet('sc_outreach/' + X.code + '/team/' + aid, null); delete _co.d.team[aid];
    if (r.pwd && typeof nfShowTempPassword === 'function') nfShowTempPassword(t.name, r.pwd.identifier, r.pwd.tempPassword, t.name + ' can now log in'); else showToast(coT(t.name + ' now uses her app login.', t.name + ' अब ऐप लॉगिन से।'), 'ok');
    coRefreshTeamViews();
  } catch (e) { showToast(e && e.code ? nfErrText(e) : (e && e.message) || String(e), 'err'); }
}
async function coRemoveNoApp(aid) {
  var X = coCtx(); if (!X || !X.inc) return; var t = coTeam()[aid]; if (!t) return;
  if (!(await showConfirm(coT('Remove ' + t.name + ' from the team? She is taken off her ' + coV(X, true).toLowerCase() + '.', t.name + ' को टीम से हटाएँ?'), '🗑', coT('Remove', 'हटाएँ'), coT('Remove', 'हटाएँ'), 'var(--red)'))) return;
  var V = _co.d.villages || {};
  for (var vid in V) { if (!(V[vid].others || {})[aid]) continue; var o = Object.assign({}, V[vid].others); delete o[aid]; await fbSet('sc_outreach/' + X.code + '/villages/' + vid + '/others', Object.keys(o).length ? o : null); if (Object.keys(o).length) V[vid].others = o; else delete V[vid].others; }
  await fbSet('sc_outreach/' + X.code + '/team/' + aid, null); delete _co.d.team[aid]; coRefreshTeamViews();
}
function coRefreshTeamViews() {
  try { if (document.getElementById('co-ov')) coRender(); } catch (e) {}
  try { if (typeof faStaffRender === 'function' && document.getElementById('sc-cho-staff-roster')) faStaffRender(); } catch (e) {}
  try { if (typeof _nd !== 'undefined' && _nd && typeof ndRender === 'function' && document.getElementById('nd-add')) ndRender(); } catch (e) {}
  try { if (document.getElementById('fpo-ov') && typeof fpoRender === 'function') fpoRender(); } catch (e) {}
}
function coAddOther() { var b = document.getElementById('cv-others'); if (!b) return; var d = document.createElement('div'); d.className = 'co-oth'; d.setAttribute('data-k', 'o' + Date.now().toString(36)); d.innerHTML = '<input aria-label="ASHA name" placeholder="Name" maxlength="60"><input aria-label="Mobile" placeholder="Mobile (optional)" inputmode="numeric" maxlength="10"><button type="button" class="co-ic" aria-label="Remove" onclick="this.parentNode.remove()">×</button>'; b.appendChild(d); d.querySelector('input').focus(); }
function coVal(id) { var e = document.getElementById(id); return e ? String(e.value || '').trim() : ''; }
async function coSaveVillage(id) {
  var X = coCtx(); if (!X || !X.inc) return; var name = coVal('cv-name'), pop = Math.round(+coVal('cv-pop'));
  if (!name) { showToast(coT('Write the name.', 'नाम लिखें।'), 'err'); return; } if (!(pop > 0) || pop > 200000) { showToast(coT('Enter the population.', 'जनसंख्या लिखें।'), 'err'); return; }
  var old = id && id !== '_new' ? (_co.d.villages[id] || {}) : {}, ashas = {}, others = {};
  document.querySelectorAll('#co-ov .co-chip.on[data-mob]').forEach(function (b) { ashas[b.getAttribute('data-mob')] = true; });
  document.querySelectorAll('#co-ov .co-chip.on[data-aid]').forEach(function (b) { others[b.getAttribute('data-aid')] = true; });
  var num = function (k) { var x = coVal(k); return x === '' ? null : +x; };
  var rec = Object.assign({}, old, { name: name, pop: pop, hh: num('cv-hh'), km: num('cv-km'), awc: coVal('cv-awc') || null, aww: coVal('cv-aww') || null, ashas: Object.keys(ashas).length ? ashas : null, others: Object.keys(others).length ? others : null, at: new Date().toISOString() });
  Object.keys(rec).forEach(function (k) { if (rec[k] === null || rec[k] === undefined || (typeof rec[k] === 'number' && isNaN(rec[k]))) delete rec[k]; });
  var vid = id && id !== '_new' ? id : 'v' + Date.now().toString(36);
  var ok = await fbSet('sc_outreach/' + X.code + '/villages/' + vid, rec); if (ok === false) { showToast(coT('Could not save — check the connection.', 'सहेजा नहीं गया — कनेक्शन देखें।'), 'err'); return; }
  _co.d.villages[vid] = rec; _co.vid = null; await coSyncPop(X); showToast(coT('Saved.', 'सहेजा गया।'), 'ok'); coRender();
}
async function coDelVillage(id) {
  var X = coCtx(); if (!X || !X.inc) return; var v = _co.d.villages[id] || {};
  if (!(await showConfirm(coT('Remove ' + (v.name || 'this ' + coV(X).toLowerCase()) + '? Its ' + coVH(X) + ' sessions go too.', (v.name || '') + ' हटाएँ?'), '🗑', coT('Remove', 'हटाएँ'), coT('Remove', 'हटाएँ'), 'var(--red)'))) return;
  if ((await fbSet('sc_outreach/' + X.code + '/villages/' + id, null)) === false) { showToast(coT('Could not remove.', 'हटाया नहीं गया।'), 'err'); return; }
  delete _co.d.villages[id]; _co.vid = null; await coSyncPop(X); coRender();
}
// one set of numbers: the village list is the facility's population (profile, Impact page, reports)
async function coSyncPop(X) {
  var T = coTotals(); if (!T.n || !(T.pop > 0)) return;
  var rec = { n: T.pop, villages: T.n, at: new Date().toISOString(), by: coName(X.mob) || X.role || 'in-charge', src: 'outreach' }; if (T.hh) rec.households = T.hh;
  if ((await fbSet('sc_facilities/' + X.code + '/population', rec)) !== false) { try { X.f.population = rec; if (typeof choState !== 'undefined' && choState.facility && choState.facilityCode === X.code) choState.facility.population = rec; } catch (e) {} }
}
function coGeoHere(id) {
  if (!navigator.geolocation) { showToast(coT('Location is not available on this phone.', 'इस फ़ोन पर स्थान उपलब्ध नहीं।'), 'err'); return; }
  showToast(coT('Finding your location…', 'स्थान खोज रहे हैं…'), '');
  navigator.geolocation.getCurrentPosition(function (p) { coSetGeo(id, p.coords.latitude, p.coords.longitude, p.coords.accuracy); }, function () { showToast(coT('Could not get the location — allow location for this app and try again outdoors.', 'स्थान नहीं मिला — अनुमति दें और बाहर दोबारा प्रयास करें।'), 'err'); }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}
async function coSetGeo(id, lat, lng, acc) {
  var X = coCtx(); if (!X) return; var v = _co.d.villages[id]; if (!v) return;
  if (!(X.inc || (X.asha && (v.ashas || {})[X.mob]))) { showToast(coT('Only the in-charge or this village\'s ASHA can place it.', 'केवल प्रभारी या इस गाँव की आशा।'), 'err'); return; }
  if (!(lat >= 6 && lat <= 38 && lng >= 68 && lng <= 98)) { showToast(coT('That place is outside India.', 'यह स्थान भारत से बाहर है।'), 'err'); return; }
  var g = { lat: Math.round(lat * 1e5) / 1e5, lng: Math.round(lng * 1e5) / 1e5, by: coName(X.mob) || X.role, at: new Date().toISOString() }; if (acc) g.acc = Math.round(acc);
  if ((await fbSet('sc_outreach/' + X.code + '/villages/' + id + '/geo', g)) === false) { showToast(coT('Could not save the location.', 'स्थान सहेजा नहीं गया।'), 'err'); return; }
  v.geo = g; _co.place = null; showToast(coT(v.name + ' placed on the map.', v.name + ' नक्शे पर दर्ज।'), 'ok'); coRender();
}

// ══ 3 · Outreach map ══
function coMapHTML(X) {
  var vs = coVillages(), miss = vs.filter(function (v) { return !(v.geo && v.geo.lat != null); }), T = coTotals();
  var h = coHead(coT('Outreach map', 'पहुँच का नक्शा'), (X.f.name || X.code) + ' · ' + coN(T.pop) + ' ' + coT('people', 'लोग'));
  if (_co.place) h += '<div class="co-warn">' + coE(coT('Tap the map where ' + ((_co.d.villages[_co.place] || {}).name || 'the village') + ' is.', 'नक्शे पर वहाँ टैप करें जहाँ ' + ((_co.d.villages[_co.place] || {}).name || 'गाँव') + ' है।')) + ' <button type="button" class="co-link" onclick="_co.place=null;coRender()">' + coE(coT('Cancel', 'रद्द')) + '</button></div>';
  h += '<div id="co-map" class="co-map" role="application" aria-label="' + coE(coT('Map of the facility, its villages and referral facilities', 'केंद्र, गाँव और रेफरल केंद्रों का नक्शा')) + '"></div>';
  h += '<div class="co-legend"><span><i class="sq"></i>' + coE(coT('Facility', 'केंद्र')) + '</span><span><i class="dot"></i>' + coE(coV(X) + coT(' (size = people)', ' (आकार = लोग)')) + '</span><span><i class="sq o"></i>' + coE(coT('Referral facility', 'रेफरल केंद्र')) + '</span></div>';
  if (!(X.f.geo && X.f.geo.lat != null)) h += '<div class="co-warn">' + coE(coT('The facility\'s own location is not set — the in-charge sets it in Facility profile → "Use my location".', 'केंद्र का स्थान दर्ज नहीं — प्रभारी इसे प्रोफ़ाइल में दर्ज करें।')) + '</div>';
  miss.forEach(function (v) { h += '<div class="co-warn co-flex"><span><b>' + coE(v.name) + '</b> ' + coE(coT('has no location yet.', 'का स्थान अभी नहीं।')) + '</span>' + ((X.inc || (X.asha && (v.ashas || {})[X.mob])) ? '<button type="button" class="co-link" onclick="_co.place=\'' + coJ(v.id) + '\';coRender()">' + coE(coT('Place it', 'दर्ज करें')) + '</button>' : '') + '</div>'; });
  h += '<div id="co-mapinfo"></div>';
  return h;
}
async function coMapDraw(X) {
  var el = document.getElementById('co-map'); if (!el) return; var L;
  try { L = await rgLoadLeaflet(); } catch (e) { el.innerHTML = '<p class="co-dim">' + coE(coT('The map could not load — check the internet connection.', 'नक्शा नहीं खुला — इंटरनेट देखें।')) + '</p>'; return; }
  if (!document.getElementById('co-map')) return;
  var pts = [], fg = X.f.geo && X.f.geo.lat != null ? [+X.f.geo.lat, +X.f.geo.lng] : null, m = L.map(el, { zoomControl: true }); _co.map = m;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(m);
  if (fg) { pts.push(fg); L.marker(fg, { title: X.f.name || X.code }).addTo(m).bindPopup('<b>' + coE(X.f.name || X.code) + '</b>'); L.circle(fg, { radius: 5000, color: '#135A55', weight: 1, fill: false, dashArray: '4 6' }).addTo(m); }
  coVillages().forEach(function (v) { if (!(v.geo && v.geo.lat != null)) return; var p = [+v.geo.lat, +v.geo.lng]; pts.push(p);
    L.circleMarker(p, { radius: Math.max(7, Math.min(22, Math.sqrt(+v.pop || 100) / 2.2)), color: '#9D174D', fillColor: '#9D174D', fillOpacity: .75, weight: 1 }).addTo(m)
      .bindPopup('<b>' + coE(v.name) + '</b><br>' + coN(v.pop) + ' ' + coE(coT('people', 'लोग')) + (v.hh ? ' · ' + v.hh + ' ' + coE(coT('households', 'परिवार')) : '') + '<br>' + coE(coAshaNames(v).join(', ')) + '<br><a href="https://www.google.com/maps/dir/?api=1&destination=' + v.geo.lat + ',' + v.geo.lng + '" target="_blank" rel="noopener">' + coE(coT('Directions', 'रास्ता')) + '</a>'); });
  coUp().forEach(function (u) { if (u.lat == null) return; var p = [+u.lat, +u.lng]; pts.push(p); L.circleMarker(p, { radius: 9, color: '#B45309', fillColor: '#B45309', fillOpacity: .9, weight: 1 }).addTo(m).bindPopup('<b>' + coE(u.name) + '</b><br>' + coE(CO_RT[u.t] || '')); });
  if (pts.length > 1) m.fitBounds(pts, { padding: [24, 24], maxZoom: 14 }); else if (pts.length) m.setView(pts[0], 13); else m.setView([22.5, 79], 5);
  m.on('click', function (ev) { if (_co.place) coSetGeo(_co.place, ev.latlng.lat, ev.latlng.lng); });
  setTimeout(function () { try { m.invalidateSize(); } catch (e) {} }, 200);
}

// ══ 4 · Referral Linkages ══
function coUp() { var U = ((_co.d && _co.d.referral) || {}).up || {}; return ['1', '2', '3'].map(function (k) { return U[k] ? Object.assign({ lvl: k }, U[k]) : null; }).filter(function (u) { return u && u.name; }); }
function coAmb() { var a = ((_co.d && _co.d.referral) || {}).amb || {}; return { e: a.e || '108', m: a.m || '102' }; }
function coTel(n) { return 'tel:' + String(n || '').replace(/[^\d+]/g, ''); }
function coWa(n, text) { var d = String(n || '').replace(/\D/g, ''); if (d.length === 10) d = '91' + d; return 'https://wa.me/' + d + (text ? '?text=' + encodeURIComponent(text) : ''); }
function coDir(u) { return u.lat != null ? 'https://www.google.com/maps/dir/?api=1&destination=' + u.lat + ',' + u.lng : 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent([u.name, (coCtx() || { f: {} }).f.district].filter(Boolean).join(' ')); }
function coRefHTML(X) {
  var up = coUp(), A = coAmb(), h = coHead(coT('Referral Linkages', 'रेफरल लिंकेज'), (X.f.name || X.code) + ' · ' + ((typeof NF_LEVELS !== 'undefined' && NF_LEVELS[X.t] && NF_LEVELS[X.t].name) || X.t.toUpperCase()));
  h += '<div class="co-amb"><a href="' + coTel(A.e) + '"><b>' + coE(A.e) + '</b><small>' + coE(coT('Emergency ambulance', 'आपात एम्बुलेंस')) + '</small></a><a href="' + coTel(A.m) + '"><b>' + coE(A.m) + '</b><small>' + coE(coT('Mother & child', 'माँ और बच्चा')) + '</small></a></div>';
  h += '<section class="co-card"><div class="co-row"><b>' + coE(coT('Upward referral', 'ऊपर रेफरल')) + '</b>' + (X.inc ? '<button type="button" class="co-link" onclick="coGo(\'refedit\')">' + coE(up.length ? coT('Edit', 'बदलें') : coT('Set up', 'दर्ज करें')) + '</button>' : '') + '</div>';
  if (!up.length) h += '<p class="co-dim">' + coE(X.inc ? coT('Add where you send patients — up to 3 levels, with phone and WhatsApp.', 'जहाँ मरीज़ भेजते हैं वह जोड़ें — 3 स्तर तक।') : coT('Your in-charge has not set the referral facilities yet.', 'प्रभारी ने अभी रेफरल केंद्र दर्ज नहीं किए।')) + '</p>';
  up.forEach(function (u) {
    var svc = CO_REF_SVC.filter(function (s) { return (u.svc || {})[s[0]]; }).map(function (s) { return s[1]; }).join(', ');
    h += '<div class="co-lvl"><span class="co-num">' + u.lvl + '</span><div><b>' + coE(u.name) + (u.h24 ? ' · 24×7' : '') + '</b><small>' + coE([u.km != null && u.km !== '' ? u.km + ' km' : '', CO_RT[u.t] || '', svc].filter(Boolean).join(' · ')) + '</small>' + (u.phone ? '<small>' + coE(u.phone) + '</small>' : '')
      + '<div class="co-acts">' + (u.phone ? '<a class="co-a1" href="' + coTel(u.phone) + '">' + coE(coT('Call', 'कॉल')) + '</a>' : '') + (u.wa ? '<button type="button" class="co-wa" onclick="coGo(\'note\',\'' + u.lvl + '\')">WhatsApp</button>' : '') + '<a class="co-a2" href="' + coDir(u) + '" target="_blank" rel="noopener">' + coE(coT('Directions', 'रास्ता')) + '</a></div></div></div>';
  });
  h += '</section><section class="co-card"><b>' + coE(coT('Facilities that refer to us', 'हमें रेफर करने वाले केंद्र')) + '</b>';
  if (X.t === 'sc') h += '<p class="co-dim">' + coE(coT('None — a Sub-Centre is the first point of contact. Your community: ', 'कोई नहीं — उप-केंद्र पहला संपर्क बिंदु है। आपका समुदाय: ')) + '<button type="button" class="co-link" onclick="coGo(\'co\')">' + coE(coVn(X, coTotals().n) + ', ' + coAn(X, coTotals().ashas)) + '</button></p>';
  else if (X.t === 'uphc') h += '<p class="co-dim">' + coE(coT('Your areas / wards and USHAs: ', 'आपके क्षेत्र / वार्ड और उषा: ')) + '<button type="button" class="co-link" onclick="coGo(\'co\')">' + coE(coVn(X, coTotals().n)) + '</button></p>';
  else if (!_co.below) h += '<p class="co-dim">' + coE(coT('Loading…', 'लोड हो रहा है…')) + '</p>';
  else if (_co.below.err) h += '<p class="co-dim">' + coE(_co.below.err) + '</p>';
  else if (!_co.below.rows.length) h += '<p class="co-dim">' + coE(coT('None found in the district list. HealSol or the District Admin links facilities in Facilities → Registry.', 'ज़िला सूची में कोई नहीं मिला।')) + '</p>';
  else { var pop = 0; _co.below.rows.forEach(function (r) { pop += +r.pop || 0; });
    h += '<p class="co-dim">' + coE(coT('From the district list. Population from each facility\'s own villages.', 'ज़िला सूची से। जनसंख्या हर केंद्र के अपने गाँवों से।')) + '</p>' + _co.below.rows.map(function (r) { return '<div class="co-li"><span><b>' + coE(r.name) + ' <em class="co-t">' + coE(String(r.t).toUpperCase()) + '</em></b><small>' + coE([r.villages ? r.villages + ' ' + coT('villages', 'गाँव') : '', r.pop ? coN(r.pop) + ' ' + coT('people', 'लोग') : coT('population not entered', 'जनसंख्या दर्ज नहीं'), r.km != null ? r.km + ' km' : ''].filter(Boolean).join(' · ')) + '</small></span><span class="co-pill' + (r.enrolled ? '' : ' o') + '">' + coE(r.enrolled ? 'In NQAS FAST' : coT('Not joined', 'नहीं जुड़ा')) + '</span></div>'; }).join('')
      + '<p class="co-dim">' + coE(coT('Population of the facilities that entered it: ', 'दर्ज जनसंख्या: ')) + '<b>' + coN(pop) + '</b></p>'; }
  h += '</section><button type="button" class="co-btn1" onclick="coPrintChart()">' + coE(coT('Print referral chart', 'रेफरल चार्ट प्रिंट करें')) + '</button>';
  var pr = (_co.d.printed || {}).chart, ch = (_co.d.referral || {}).at;
  h += '<p class="co-dim co-c">' + coE(coT('A4 in Hindi and English, with a QR code for each facility\'s location.', 'A4 हिंदी और अंग्रेज़ी में, हर केंद्र के स्थान का QR कोड।')) + (pr ? ' ' + coE(coT('Last printed: ', 'पिछली बार: ') + new Date(pr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) + (ch && ch > pr ? ' · <b>' + coE(coT('changed since — print again', 'उसके बाद बदला — दोबारा प्रिंट करें')) + '</b>' : '') : '') + '</p>';
  return h;
}
async function coLoadBelow(X) { _co.below = { rows: [] }; try { _co.below = await nfCall('outreachBelow', { code: X.code }); } catch (e) { _co.below = { rows: [], err: nfErrText(e) }; } if (_co.view === 'ref') coRender(); }
function coRefEditHTML(X) {
  var h = coHead(coT('Upward referral', 'ऊपर रेफरल'), coT('Where you send patients — up to 3 levels', 'जहाँ मरीज़ भेजते हैं — 3 स्तर तक'));
  if (!_co.choices) { coLoadChoices(X); return h + '<p class="co-dim">' + coE(coT('Loading the district list…', 'ज़िला सूची लोड हो रही है…')) + '</p>'; }
  var U = ((_co.d.referral || {}).up) || {}, def = coRefDefaults(X), A = coAmb(), C = _co.choices.rows || [];
  if (!Object.keys(U).length) h += '<div class="co-ok">' + coE(coT('Filled from your PHC & CHC link and the district list. Change them if you send patients somewhere else (for example a 24×7 PHC for delivery).', 'आपके PHC / CHC लिंक से भरा गया। ज़रूरत हो तो बदलें।')) + '</div>';
  ['1', '2', '3'].forEach(function (k) {
    var u = U[k] || def[k] || {}, opts = '<option value="">' + coE(coT('— choose, or type below —', '— चुनें या नीचे लिखें —')) + '</option>' + C.map(function (c, i) { return '<option value="' + i + '"' + (u.nin && c.nin === u.nin ? ' selected' : '') + '>' + coE(c.name + ' (' + String(c.t).toUpperCase() + (c.km != null ? ', ' + c.km + ' km' : '') + ')') + '</option>'; }).join('');
    h += '<section class="co-card co-form" data-lvl="' + k + '"><span class="co-k">' + coE(coT('LEVEL ' + k, 'स्तर ' + k)) + (k === '3' ? ' · ' + coE(coT('optional', 'वैकल्पिक')) : '') + '</span>'
      + '<label class="co-f">' + coE(coT('From the district list', 'ज़िला सूची से')) + '<select class="cr-pick" onchange="coRefPick(this)">' + opts + '</select></label>'
      + '<label class="co-f">' + coE(coT('Facility name', 'केंद्र का नाम')) + '<input class="cr-name" value="' + coE(u.name || '') + '" maxlength="80" placeholder="' + coE(k === '3' ? coT('e.g. District Hospital', 'जैसे ज़िला अस्पताल') : '') + '"></label>'
      + '<div class="co-g2"><label class="co-f">' + coE(coT('Type', 'प्रकार')) + '<select class="cr-t">' + Object.keys(CO_RT).map(function (t) { return '<option value="' + t + '"' + ((u.t || (k === '3' ? 'dh' : k === '2' ? 'chc' : 'phc')) === t ? ' selected' : '') + '>' + coE(CO_RT[t]) + '</option>'; }).join('') + '</select></label>'
      + '<label class="co-f">' + coE(coT('Distance km', 'दूरी km')) + '<input class="cr-km" type="number" min="0" step="0.1" inputmode="decimal" value="' + coE(u.km == null ? '' : u.km) + '"></label></div>'
      + '<label class="co-f">' + coE(coT('Phone (labour room / emergency)', 'फ़ोन (प्रसव कक्ष / आपात)')) + '<input class="cr-ph" type="tel" value="' + coE(u.phone || '') + '" maxlength="15"></label>'
      + '<label class="co-f">' + coE(coT('WhatsApp number (duty doctor / labour room, for referral notes)', 'व्हाट्सऐप नंबर (रेफरल नोट के लिए)')) + '<input class="cr-wa" type="tel" inputmode="numeric" value="' + coE(u.wa || '') + '" maxlength="13"></label>'
      + '<label class="co-chk"><input type="checkbox" class="cr-24"' + (u.h24 ? ' checked' : '') + '> ' + coE(coT('Open 24×7', '24×7 खुला')) + '</label>'
      + '<span class="co-lab">' + coE(coT('Services you refer for', 'किन सेवाओं के लिए')) + '</span><div class="co-chips">' + CO_REF_SVC.map(function (s) { var on = (u.svc || {})[s[0]]; return '<button type="button" class="co-chip' + (on ? ' on' : '') + '" data-s="' + s[0] + '" aria-pressed="' + (on ? 'true' : 'false') + '" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\'))">' + coE(s[1]) + '</button>'; }).join('') + '</div>'
      + '<input type="hidden" class="cr-nin" value="' + coE(u.nin || '') + '"><input type="hidden" class="cr-lat" value="' + coE(u.lat == null ? '' : u.lat) + '"><input type="hidden" class="cr-lng" value="' + coE(u.lng == null ? '' : u.lng) + '">'
      + '<small class="co-dim cr-loc">' + coE(u.lat != null ? coT('Location known — the chart gets a map QR.', 'स्थान ज्ञात — चार्ट पर नक्शे का QR।') : coT('No location — the QR opens a map search by name.', 'स्थान नहीं — QR नाम से नक्शा खोजेगा।')) + '</small></section>';
  });
  h += '<section class="co-card"><b>' + coE(coT('Ambulance numbers', 'एम्बुलेंस नंबर')) + '</b><div class="co-g2"><label class="co-f">' + coE(coT('Emergency', 'आपात')) + '<input id="cr-ae" type="tel" value="' + coE(A.e) + '" maxlength="12"></label><label class="co-f">' + coE(coT('Mother & child', 'माँ और बच्चा')) + '<input id="cr-am" type="tel" value="' + coE(A.m) + '" maxlength="12"></label></div></section>'
    + '<button type="button" class="co-btn1" onclick="coSaveRef()">' + coE(coT('Save', 'सहेजें')) + '</button>';
  return h;
}
async function coLoadChoices(X) { try { _co.choices = await nfCall('referralChoices', { code: X.code }); } catch (e) { _co.choices = { rows: [], parents: {} }; } if (_co.view === 'refedit') coRender(); }
function coRefDefaults(X) {
  var C = (_co.choices && _co.choices.rows) || [], P = (_co.choices && _co.choices.parents) || {}, out = {}, pick = function (n) { return C.find(function (c) { return c.nin && c.nin === n; }); };
  var mk = function (c, t) { return c ? { name: c.name, t: t || c.t, nin: c.nin, km: c.km, lat: c.lat, lng: c.lng } : null; };
  var lk = X.f.links || {};
  if (X.t === 'sc') { out['1'] = mk(pick(P.phc), 'phc') || (lk.phc ? { name: lk.phc.name, t: 'phc', nin: lk.phc.nin } : null); out['2'] = mk(pick(P.chc), 'chc') || (lk.chc ? { name: lk.chc.name, t: 'chc', nin: lk.chc.nin } : null); }
  else if (X.t === 'phc') out['1'] = mk(pick(P.chc), 'chc');
  out['3'] = { t: 'dh' }; return out;
}
function coRefPick(sel) {
  var box = sel.closest('[data-lvl]'), c = ((_co.choices && _co.choices.rows) || [])[+sel.value]; if (!box || !c) return;
  var s = function (cl, v) { var e = box.querySelector('.' + cl); if (e) e.value = v == null ? '' : v; };
  s('cr-name', c.name); s('cr-nin', c.nin); s('cr-km', c.km); s('cr-lat', c.lat); s('cr-lng', c.lng); s('cr-t', c.t === 'chc' ? 'chc' : c.t === 'uphc' ? 'uphc' : 'phc');
  var l = box.querySelector('.cr-loc'); if (l) l.textContent = c.lat != null ? coT('Location known — the chart gets a map QR.', 'स्थान ज्ञात — चार्ट पर नक्शे का QR।') : coT('No location — the QR opens a map search by name.', 'स्थान नहीं — QR नाम से नक्शा खोजेगा।');
}
async function coSaveRef() {
  var X = coCtx(); if (!X || !X.inc) return; var up = {}, bad = '';
  document.querySelectorAll('#co-ov [data-lvl]').forEach(function (box) {
    var g = function (cl) { var e = box.querySelector('.' + cl); return e ? String(e.value || '').trim() : ''; }, name = g('cr-name'); if (!name) return;
    var wa = g('cr-wa').replace(/\D/g, ''); if (wa && !(wa.length === 10 || (wa.length === 12 && wa.indexOf('91') === 0))) bad = coT('Level ' + box.getAttribute('data-lvl') + ': the WhatsApp number needs 10 digits.', 'स्तर ' + box.getAttribute('data-lvl') + ': व्हाट्सऐप नंबर 10 अंकों का हो।');
    var svc = {}; box.querySelectorAll('.co-chip.on[data-s]').forEach(function (b) { svc[b.getAttribute('data-s')] = true; });
    var u = { name: name, t: g('cr-t') || 'other', km: g('cr-km') === '' ? null : +g('cr-km'), phone: g('cr-ph') || null, wa: wa ? wa.slice(-10) : null, h24: !!(box.querySelector('.cr-24') || {}).checked, svc: Object.keys(svc).length ? svc : null, nin: g('cr-nin') || null, lat: g('cr-lat') === '' ? null : +g('cr-lat'), lng: g('cr-lng') === '' ? null : +g('cr-lng') };
    Object.keys(u).forEach(function (k) { if (u[k] === null || (typeof u[k] === 'number' && isNaN(u[k]))) delete u[k]; }); up[box.getAttribute('data-lvl')] = u; });
  if (bad) { showToast(bad, 'err'); return; }
  var rec = { up: up, amb: { e: coVal('cr-ae') || '108', m: coVal('cr-am') || '102' }, at: new Date().toISOString() };
  if ((await fbSet('sc_outreach/' + X.code + '/referral', rec)) === false) { showToast(coT('Could not save — check the connection.', 'सहेजा नहीं गया।'), 'err'); return; }
  _co.d.referral = rec; showToast(coT('Referral linkages saved.', 'रेफरल लिंकेज सहेजे गए।'), 'ok'); coBack();
}
// WhatsApp referral note: built on the phone, never saved; no name / ID fields (patient privacy)
function coNoteHTML(X) {
  var u = coUp().find(function (x) { return x.lvl === _co.sel; }) || {}, n = _co.note || {};
  var h = coHead(coT('Referral note', 'रेफरल नोट'), coT('To ', 'प्रति: ') + (u.name || '') + (u.wa ? ' · WhatsApp ' + u.wa : ''));
  h += '<div class="co-warn">' + coE(coT('Nothing here is saved in the app. Write only what the receiving doctor needs — no Aadhaar or other ID numbers.', 'यहाँ कुछ भी ऐप में सहेजा नहीं जाता। केवल ज़रूरी जानकारी लिखें — आधार या अन्य पहचान संख्या नहीं।')) + '</div>';
  var R = [['Pregnancy emergency', 'गर्भावस्था आपात'], ['Sick newborn', 'बीमार नवजात'], ['Child', 'बच्चा'], ['Injury / bite', 'चोट / काटना'], ['NCD / other', 'अन्य']];
  var f = function (k, lab, ph, w) { return '<label class="co-f' + (w ? ' ' + w : '') + '">' + coE(lab) + '<input id="cn-' + k + '" value="' + coE(n[k] || '') + '" placeholder="' + coE(ph || '') + '" oninput="coNotePrev()" maxlength="120"></label>'; };
  h += '<section class="co-card co-form"><span class="co-lab">' + coE(coT('Reason', 'कारण')) + '</span><div class="co-chips" id="cn-r">' + R.map(function (r, i) { return '<button type="button" class="co-chip' + ((n.r || 0) === i ? ' on' : '') + '" aria-pressed="' + ((n.r || 0) === i) + '" onclick="(_co.note=_co.note||{}).r=' + i + ';coNoteKeep();coRender()">' + coE(coT(r[0], r[1])) + '</button>'; }).join('') + '</div>'
    + '<div class="co-g2">' + f('age', coT('Age / sex', 'आयु / लिंग'), '24 F') + f('vil', coV(X), '') + '</div>' + f('prob', coT('Problem', 'समस्या'), coT('e.g. 38 weeks, bleeding since 1 hour', 'जैसे 38 सप्ताह, 1 घंटे से रक्तस्राव'))
    + '<div class="co-g3">' + f('bp', 'BP', '') + f('pulse', coT('Pulse', 'नाड़ी'), '') + f('hb', 'Hb / SpO₂', '') + '</div>' + f('given', coT('Given before referral', 'रेफर से पहले दिया'), '')
    + '<div class="co-g2"><label class="co-f">' + coE(coT('Transport', 'वाहन')) + '<select id="cn-tr" onchange="coNotePrev()">' + ['102 ambulance', '108 ambulance', 'Own vehicle'].map(function (x) { return '<option' + (n.tr === x ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label><label class="co-f">' + coE(coT('Leaving at', 'निकलने का समय')) + '<input id="cn-time" type="time" value="' + coE(n.time || new Date().toTimeString().slice(0, 5)) + '" oninput="coNotePrev()"></label></div></section>';
  h += '<div class="co-bub" id="cn-prev"></div><a id="cn-send" class="co-wa co-big" href="#" target="_blank" rel="noopener">' + coE(coT('Send on WhatsApp', 'व्हाट्सऐप पर भेजें')) + '</a>'
    + '<p class="co-dim co-c">' + coE(coT('WhatsApp opens on the facility\'s number with this message — you press send. Also write it in the referral register.', 'व्हाट्सऐप उसी नंबर पर संदेश के साथ खुलेगा — आप भेजें। रेफरल रजिस्टर में भी लिखें।')) + '</p>';
  setTimeout(coNotePrev, 0); return h;
}
function coNoteKeep() { var n = _co.note = _co.note || {}; ['age', 'vil', 'prob', 'bp', 'pulse', 'hb', 'given', 'time'].forEach(function (k) { var e = document.getElementById('cn-' + k); if (e) n[k] = e.value; }); var t = document.getElementById('cn-tr'); if (t) n.tr = t.value; }
function coNoteText() {
  var X = coCtx(), u = coUp().find(function (x) { return x.lvl === _co.sel; }) || {}, n = _co.note || {}, R = ['Pregnancy emergency', 'Sick newborn', 'Child', 'Injury / bite', 'NCD / other'];
  var vit = [n.bp ? 'BP ' + n.bp : '', n.pulse ? 'Pulse ' + n.pulse : '', n.hb ? 'Hb/SpO2 ' + n.hb : ''].filter(Boolean).join(' · ');
  var me = X ? coName(X.mob) : '', role = X ? X.role : '';
  return ['REFERRAL · ' + ((X && X.f.name) || '') + ' → ' + (u.name || ''), [R[n.r || 0], n.age, n.vil].filter(Boolean).join(' · '), [n.prob, vit].filter(Boolean).join(' · '), n.given ? 'Given: ' + n.given : '', (n.tr || '102 ambulance') + (n.time ? ', leaving ' + n.time : ''), '— ' + [role, me].filter(Boolean).join(' ') + (X && X.mob ? ', ' + X.mob : '')].filter(Boolean).join('\n');
}
function coNotePrev() { coNoteKeep(); var p = document.getElementById('cn-prev'), a = document.getElementById('cn-send'), u = coUp().find(function (x) { return x.lvl === _co.sel; }) || {}, t = coNoteText(); if (p) p.textContent = t; if (a) a.href = coWa(u.wa, t); }

// ══ 5 · VHSND / UHND planner ══
function coMonth() { return _co.month || coToday().slice(0, 7); }
function coDaysOn() { var D = ((_co.d && _co.d.vhsnd) || {}).days || {}; return Object.keys(D).filter(function (k) { return D[k]; }).map(Number).sort(); }
// the session dates of a month (all the set-up's weekdays)
function coSlots(month) { var ds = coDaysOn(), y = +month.slice(0, 4), m = +month.slice(5, 7) - 1, out = []; for (var d = 1; d <= 31; d++) { var dt = new Date(y, m, d); if (dt.getMonth() !== m) break; if (ds.indexOf(dt.getDay()) >= 0) out.push(coYmd(dt)); } return out; }
// a village's fixed slot: { n: 1..5 (n-th week), d: weekday }; none saved → in order over the session days
function coSlotOf(v, i) { var ds = coDaysOn(); if (v.slot && v.slot.n && ds.indexOf(+v.slot.d) >= 0) return { n: +v.slot.n, d: +v.slot.d }; if (!ds.length) return null; return { n: Math.floor(i / ds.length) + 1, d: ds[i % ds.length] }; }
function coSlotDate(month, s) { if (!s) return null; var y = +month.slice(0, 4), m = +month.slice(5, 7) - 1, list = []; for (var d = 1; d <= 31; d++) { var dt = new Date(y, m, d); if (dt.getMonth() !== m) break; if (dt.getDay() === s.d) list.push(coYmd(dt)); } return list[Math.min(s.n, list.length) - 1] || null; }
function coPlan(month) {
  var vs = coVillages(), S = ((_co.d && _co.d.sessions) || {})[month] || {}, rows = [];
  vs.forEach(function (v, i) { var o = coSlotDate(month, coSlotOf(v, i)); if (!o) return; var s = S[v.id] || {}, st = s.status || 'planned';
    if (st === 'postponed' && s.date) { rows.push({ v: v, date: o, status: 'moved', s: s }); rows.push({ v: v, date: s.date, status: s.done ? 'held' : 'planned', moved: o, s: s }); }
    else rows.push({ v: v, date: s.date || o, status: st, s: s, moved: s.from && s.from !== (s.date || o) ? s.from : null }); });
  var used = {}; rows.forEach(function (r) { used[r.date] = 1; });
  coSlots(month).forEach(function (d) { if (!used[d]) rows.push({ spare: true, date: d }); });
  rows.sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : (a.spare ? 1 : 0) - (b.spare ? 1 : 0); });
  return rows;
}
function coVhState(X) {
  if (!coDaysOn().length) return { line: X.inc ? coT('Not set up yet — choose your session days', 'अभी तय नहीं — सत्र के दिन चुनें') : coT('Not set up yet', 'अभी तय नहीं'), rows: [] };
  var m = coToday().slice(0, 7), R = coPlan(m).filter(function (r) { return !r.spare && r.status !== 'moved'; }), held = R.filter(function (r) { return r.status === 'held'; }).length, nx = R.filter(function (r) { return r.status === 'planned' && r.date >= coToday(); })[0];
  return { line: coT(held + ' of ' + R.length + ' held', R.length + ' में से ' + held + ' हुए') + (nx ? coT(' · next: ', ' · अगला: ') + nx.v.name + ', ' + coFmt(nx.date, true) : ''), rows: R };
}
function coCanMark(X) { return X.inc || X.anm; }
function coVhHTML(X) {
  var m = coMonth(), y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1, title = coVH(X) + ' · ' + (coHi() ? CO_MON_HI[mo] : new Date(y, mo, 1).toLocaleString('en-IN', { month: 'long' })) + ' ' + y, V = _co.d.vhsnd || {};
  var h = coHead(title, coDaysOn().map(function (d) { return (coHi() ? CO_DAYS_HI : CO_DAYS)[d]; }).join(' & ') + (V.from ? ' · ' + V.from + '–' + (V.to || '') : ''), X.inc ? '<button type="button" class="co-link" onclick="coGo(\'vhset\')">' + coE(coT('Set-up', 'सेटअप')) + '</button>' : '');
  if (!coDaysOn().length) return h + '<section class="co-card"><p class="co-dim">' + coE(X.inc ? coT('Choose your state\'s session days once — the app then plans every month: each ' + coV(X).toLowerCase() + ' once a month.', 'अपने राज्य के सत्र दिन एक बार चुनें — फिर हर महीने की योजना बनेगी।') : coT('The in-charge has not set up the ' + coVH(X) + ' days yet.', 'प्रभारी ने अभी सत्र के दिन तय नहीं किए।')) + '</p>' + (X.inc ? '<button type="button" class="co-btn1" onclick="coGo(\'vhset\')">' + coE(coT('Set up ' + coVH(X), coVH(X) + ' सेटअप')) + '</button>' : '') + '</section>';
  if (!coVillages().length) return h + '<section class="co-card"><p class="co-dim">' + coE(coT('Add the ' + coV(X, true).toLowerCase() + ' first (Community Outreach).', 'पहले गाँव जोड़ें।')) + '</p></section>';
  var P = coPlan(m), R = P.filter(function (r) { return !r.spare && r.status !== 'moved'; }), held = R.filter(function (r) { return r.status === 'held'; }).length, post = P.filter(function (r) { return r.status === 'moved'; }).length;
  var pm = new Date(y, mo - 1, 1), nm = new Date(y, mo + 1, 1);
  h += '<div class="co-mnav"><button type="button" class="co-btn2" onclick="_co.month=\'' + coYmd(pm).slice(0, 7) + '\';coRender()" aria-label="' + coE(coT('Previous month', 'पिछला महीना')) + '">‹</button><div class="co-tiles3"><div><b class="g">' + held + '</b><small>' + coE(coT('held', 'हुए')) + '</small></div><div><b>' + (R.length - held) + '</b><small>' + coE(coT('to come', 'बाकी')) + '</small></div><div><b class="r">' + post + '</b><small>' + coE(coT('postponed', 'टले')) + '</small></div></div><button type="button" class="co-btn2" onclick="_co.month=\'' + coYmd(nm).slice(0, 7) + '\';coRender()" aria-label="' + coE(coT('Next month', 'अगला महीना')) + '">›</button></div>';
  var today = coToday(), nextShown = false;
  h += '<section class="co-card co-list">' + P.map(function (r) {
    var d = coDate(r.date), dd = '<span class="co-dd"><b>' + d.getDate() + '</b><small>' + coE((coHi() ? CO_DAYS_HI : CO_DAYS)[d.getDay()]) + '</small></span>';
    if (r.spare) return '<div class="co-li co-spare">' + dd + '<span>' + coE(coT('Spare slot', 'खाली स्लॉट')) + (r.date === today ? ' · ' + coE(coT('today', 'आज')) : '') + '</span></div>';
    var chip = r.status === 'held' ? '<span class="co-pill">' + coE(coT('Held', 'हुआ')) + '</span>' : r.status === 'moved' ? '<span class="co-pill o">' + coE(coT('Moved', 'टला')) + '</span>' : (r.date < today ? '<span class="co-pill o">' + coE(coT('Not marked', 'दर्ज नहीं')) + '</span>' : !nextShown ? (nextShown = true, '<span class="co-pill n">' + coE(coT('Next', 'अगला')) + '</span>') : '<span class="co-pill w">' + coE(coT('Planned', 'तय')) + '</span>');
    var sub = r.status === 'moved' ? coT('Postponed: ', 'टला: ') + (r.s.reason || '') + ' → ' + coFmt(r.s.date, true) : (r.moved ? coT('Moved from ', 'से टला: ') + coFmt(r.moved, true) + ' · ' : '') + [r.v.awc ? 'AWC ' + r.v.awc : '', coAshaNames(r.v).join(', ')].filter(Boolean).join(' · ');
    return '<button type="button" class="co-li co-sess' + (r.status === 'moved' ? ' mv' : '') + '" onclick="coGo(\'vhs\',\'' + coJ(r.v.id) + '\')">' + dd + '<span class="co-grow"><b>' + coE(r.v.name) + '</b><small>' + coE(sub) + '</small></span>' + chip + '</button>';
  }).join('') + '</section>';
  h += '<div class="co-g2b"><button type="button" class="co-wa" onclick="_co.share.r=\'week\';coGo(\'share\')">' + coE(coT('Share on WhatsApp', 'व्हाट्सऐप पर भेजें')) + '</button><button type="button" class="co-btn2" onclick="coPrintPlan()">' + coE(coT('Print micro-plan', 'माइक्रो-प्लान प्रिंट')) + '</button></div>';
  return h;
}
function coVhSetHTML(X) {
  var V = _co.d.vhsnd || {}, on = V.days || {}, svc = V.svc || { imm: 1, anc: 1, gm: 1, thr: 1, fp: 1, ncd: 1, cou: 1 }, vs = coVillages(), ds = coDaysOn();
  var h = coHead(coVH(X) + coT(' set-up', ' सेटअप'), coT('Once for the facility · the in-charge changes it', 'केंद्र के लिए एक बार · प्रभारी बदलते हैं'));
  h += '<section class="co-card"><b>' + coE(coT('Session days (as fixed by your state)', 'सत्र के दिन (राज्य द्वारा तय)')) + '</b><div class="co-days">' + CO_DAYS.map(function (d, i) { return '<button type="button" class="co-day' + (on[i] ? ' on' : '') + '" data-d="' + i + '" aria-pressed="' + (on[i] ? 'true' : 'false') + '" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\'))">' + coE((coHi() ? CO_DAYS_HI : CO_DAYS)[i]) + '</button>'; }).join('') + '</div>'
    + '<div class="co-g2"><label class="co-f">' + coE(coT('From', 'से')) + '<input id="vs-from" type="time" value="' + coE(V.from || '10:00') + '"></label><label class="co-f">' + coE(coT('To', 'तक')) + '<input id="vs-to" type="time" value="' + coE(V.to || '14:00') + '"></label></div>'
    + '<small class="co-dim">' + coE(coT('Each ' + coV(X).toLowerCase() + ' gets one session a month; spare slots catch up postponed sessions.', 'हर गाँव में महीने में एक सत्र; खाली स्लॉट टले सत्रों के लिए।')) + '</small></section>';
  if (ds.length && vs.length) {
    var opt = function (cur) { var o = ''; for (var n = 1; n <= 5; n++) ds.forEach(function (d) { var sel = cur && cur.n === n && cur.d === d; o += '<option value="' + n + '-' + d + '"' + (sel ? ' selected' : '') + '>' + ['1st', '2nd', '3rd', '4th', '5th'][n - 1] + ' ' + CO_DAYS[d] + '</option>'; }); return o; };
    h += '<section class="co-card co-list"><div class="co-li"><span><b>' + coE(coT('Each ' + coV(X).toLowerCase() + '\'s fixed slot', 'हर गाँव का तय स्लॉट')) + '</b><small>' + coE(coT('Suggested in order; change any. Site = the Anganwadi centre.', 'क्रम से सुझाया गया; बदल सकते हैं।')) + '</small></span></div>'
      + vs.map(function (v, i) { return '<div class="co-li"><span class="co-grow"><b>' + coE(v.name) + '</b><small>' + coE([v.awc ? 'AWC ' + v.awc : '', v.aww ? 'AWW ' + v.aww : '', coAshaNames(v).join(', ')].filter(Boolean).join(' · ') || '—') + '</small></span><select class="vs-slot" data-v="' + coE(v.id) + '" aria-label="' + coE(coT('Slot for ', 'स्लॉट: ') + v.name) + '">' + opt(coSlotOf(v, i)) + '</select></div>'; }).join('') + '</section>';
  } else if (vs.length) h += '<p class="co-dim">' + coE(coT('Choose the days and save — then each ' + coV(X).toLowerCase() + ' gets its slot here.', 'दिन चुनकर सहेजें — फिर हर गाँव का स्लॉट दिखेगा।')) + '</p>';
  h += '<section class="co-card"><b>' + coE(coT('Services at every session', 'हर सत्र में सेवाएँ')) + '</b><div class="co-chips">' + CO_SVC.map(function (s) { return '<button type="button" class="co-chip' + (svc[s[0]] ? ' on' : '') + '" data-s="' + s[0] + '" aria-pressed="' + (svc[s[0]] ? 'true' : 'false') + '" onclick="this.classList.toggle(\'on\');this.setAttribute(\'aria-pressed\',this.classList.contains(\'on\'))">' + coE(coT(s[1], s[2])) + '</button>'; }).join('') + '</div></section>'
    + '<button type="button" class="co-btn1" onclick="coSaveVh()">' + coE(coT('Save and make the plan', 'सहेजें और योजना बनाएँ')) + '</button>' + (X.urban ? '<p class="co-dim co-c">UHND · ' + coE(coT('one row per area / ward', 'हर क्षेत्र / वार्ड की एक पंक्ति')) + '</p>' : '');
  return h;
}
async function coSaveVh() {
  var X = coCtx(); if (!X || !X.inc) return; var days = {}, svc = {};
  document.querySelectorAll('#co-ov .co-day.on').forEach(function (b) { days[b.getAttribute('data-d')] = true; });
  if (!Object.keys(days).length) { showToast(coT('Choose at least one session day.', 'कम से कम एक दिन चुनें।'), 'err'); return; }
  document.querySelectorAll('#co-ov .co-chip.on[data-s]').forEach(function (b) { svc[b.getAttribute('data-s')] = true; });
  var rec = { days: days, from: coVal('vs-from') || '10:00', to: coVal('vs-to') || '14:00', svc: svc, at: new Date().toISOString() };
  if ((await fbSet('sc_outreach/' + X.code + '/vhsnd', rec)) === false) { showToast(coT('Could not save.', 'सहेजा नहीं गया।'), 'err'); return; }
  _co.d.vhsnd = rec; var sels = document.querySelectorAll('#co-ov .vs-slot'), dsn = Object.keys(days).map(Number);
  for (var i = 0; i < sels.length; i++) { var p = String(sels[i].value).split('-'), s = { n: +p[0], d: +p[1] }, id = sels[i].getAttribute('data-v'); if (dsn.indexOf(s.d) < 0) continue; if ((await fbSet('sc_outreach/' + X.code + '/villages/' + id + '/slot', s)) !== false && _co.d.villages[id]) _co.d.villages[id].slot = s; }
  showToast(coT(coVH(X) + ' plan saved.', coVH(X) + ' योजना सहेजी गई।'), 'ok'); _co.view = 'vh'; _co.back = _co.back.filter(function (b) { return b.v !== 'vhset'; }); coRender();
}
function coSessOf(vid) { var m = coMonth(), r = coPlan(m).filter(function (x) { return x.v && x.v.id === vid && x.status !== 'moved'; })[0]; return r || null; }
function coVhsHTML(X) {
  var r = coSessOf(_co.sel); if (!r) return coHead(coVH(X), '') + '<p class="co-dim">' + coE(coT('Not in this month\'s plan.', 'इस महीने की योजना में नहीं।')) + '</p>';
  var v = r.v, V = _co.d.vhsnd || {}, S = _co.staff || {}, ic = Object.keys(S).filter(function (m) { return S[m] && !S[m].disabled && (S[m].role || X.inChargeRole) === X.inChargeRole; }).map(coName), anm = Object.keys(S).filter(function (m) { return S[m] && !S[m].disabled && S[m].role === 'ANM'; }).map(coName), s = r.s || {};
  var h = coHead(coVH(X) + ' · ' + v.name, coFmt(r.date, true) + ' ' + new Date().getFullYear() + (V.from ? ' · ' + V.from + '–' + (V.to || '') : ''));
  var row = function (a, b) { return b ? '<div class="co-kv"><span>' + coE(a) + '</span><b>' + coE(b) + '</b></div>' : ''; };
  h += '<section class="co-card"><span class="co-k">' + coE(coT('PLACE', 'स्थान')) + '</span><b>' + coE(v.awc ? coT('Anganwadi centre ', 'आंगनवाड़ी केंद्र ') + v.awc : v.name) + '</b>' + (v.geo && v.geo.lat != null ? '<a class="co-link" href="https://www.google.com/maps/dir/?api=1&destination=' + v.geo.lat + ',' + v.geo.lng + '" target="_blank" rel="noopener">' + coE(coT('Directions', 'रास्ता')) + '</a>' : '')
    + '<span class="co-k">' + coE(coT('TEAM', 'टीम')) + '</span>' + row(X.inChargeRole, ic.join(', ')) + row('ANM', anm.join(', ')) + row(X.urban ? 'USHA' : 'ASHA', coAshaNames(v).join(', ')) + row('AWW', v.aww || '')
    + '<span class="co-k">' + coE(coT('SERVICES', 'सेवाएँ')) + '</span><p class="co-p">' + coE(CO_SVC.filter(function (x) { return (V.svc || {})[x[0]]; }).map(function (x) { return coT(x[1], x[2]); }).join(' · ')) + '</p></section>';
  if (r.status === 'held') h += '<div class="co-ok">' + coE(coT('Held · marked by ', 'हुआ · दर्ज: ') + (s.by || '')) + '</div>';
  if (s.status === 'postponed') h += '<div class="co-warn">' + coE(coT('Postponed from ', 'टला: ') + coFmt(s.from || r.moved || r.date, true) + ' · ' + (s.reason || '')) + '</div>';
  if (coCanMark(X)) {
    h += '<section class="co-card"><b>' + coE(coT('After the session', 'सत्र के बाद')) + '</b>' + (r.status !== 'held' ? '<button type="button" class="co-btn1" onclick="coMark(\'held\')">' + coE(coT('Held ✓', 'हुआ ✓')) + '</button>' : '<button type="button" class="co-btn2" onclick="coMark(\'planned\')">' + coE(coT('Undo "held"', '"हुआ" हटाएँ')) + '</button>')
      + (r.status !== 'held' ? '<details class="co-post"><summary class="co-btn2 co-red">' + coE(coT('Postponed', 'टल गया')) + '</summary><label class="co-f">' + coE(coT('Reason', 'कारण')) + '<select id="vp-r">' + CO_REASONS.map(function (x) { return '<option>' + coE(x) + '</option>'; }).join('') + '</select></label><label class="co-f">' + coE(coT('New date (any day)', 'नई तारीख (कोई भी दिन)')) + '<input id="vp-d" type="date" value="' + coE(coNextFree(r.date)) + '" min="' + coE(coToday()) + '"></label><button type="button" class="co-btn1 co-redb" onclick="coMark(\'postponed\')">' + coE(coT('Move and tell the team', 'बदलें और टीम को बताएँ')) + '</button></details>' : '')
      + '<small class="co-dim">' + coE(coT('Counts (children immunised, ANC …) come in a later version.', 'गिनती (टीकाकरण, ANC …) अगले संस्करण में।')) + '</small></section>';
  } else h += '<p class="co-dim co-c">' + coE(coT('The in-charge or the ANM marks the session held or postponed.', 'प्रभारी या ANM सत्र दर्ज करते हैं।')) + '</p>';
  h += '<button type="button" class="co-wa co-big" onclick="_co.share.r=\'one\';coGo(\'share\',\'' + coJ(v.id) + '\')">' + coE(coT('Share this session', 'यह सत्र भेजें')) + '</button>';
  return h;
}
function coNextFree(from) { var used = {}; coPlan(coMonth()).forEach(function (r) { if (!r.spare) used[r.date] = 1; }); var d = coDate(from > coToday() ? from : coToday()); for (var i = 1; i < 40; i++) { d.setDate(d.getDate() + 1); var y = coYmd(d); if (!used[y] && d.getDay() !== 0) return y; } return coToday(); }
async function coMark(st) {
  var X = coCtx(); if (!X || !coCanMark(X)) return; var r = coSessOf(_co.sel); if (!r) return; var m = coMonth(), old = (r.s || {});
  var rec = { status: st, by: coName(X.mob) || X.role, at: new Date().toISOString() };
  if (st === 'postponed') { var nd = coVal('vp-d'); if (!/^\d{4}-\d{2}-\d{2}$/.test(nd)) { showToast(coT('Choose the new date.', 'नई तारीख चुनें।'), 'err'); return; } rec.date = nd; rec.from = old.from || r.date; rec.reason = coVal('vp-r'); }
  else if (old.status === 'postponed' && old.date) { rec.date = old.date; rec.from = old.from; rec.reason = old.reason; if (st === 'held') { rec.status = 'postponed'; rec.done = true; } }
  if (st === 'planned' && old.done) { rec.status = 'postponed'; rec.done = false; rec.date = old.date; rec.from = old.from; rec.reason = old.reason; }
  if ((await fbSet('sc_outreach/' + X.code + '/sessions/' + m + '/' + r.v.id, rec)) === false) { showToast(coT('Could not save — only the in-charge or the ANM can mark sessions.', 'सहेजा नहीं गया।'), 'err'); return; }
  (_co.d.sessions[m] = _co.d.sessions[m] || {})[r.v.id] = rec;
  if (st === 'postponed') { showToast(coT('Moved to ' + coFmt(rec.date, true) + '. Share the new date with the team.', coFmt(rec.date, true) + ' पर बदला। टीम को बताएँ।'), 'ok'); _co.share.r = 'one'; _co.view = 'share'; coRender(); return; }
  showToast(st === 'held' || rec.done ? coT('Marked held.', 'हुआ दर्ज।') : coT('Back to planned.', 'फिर से तय।'), 'ok'); coRender();
}
// share: the week, the month or one session · Hindi or English · WhatsApp opens; the person chooses the group
function coShareText(X, hi) {
  var V = _co.d.vhsnd || {}, f = X.f, T = function (en, h) { return hi ? h : en; }, m = coMonth(), P = coPlan(m).filter(function (r) { return !r.spare && r.status !== 'moved'; }), today = coToday();
  var D = hi ? CO_DAYS_HI : CO_DAYS, fmt = function (y) { var d = coDate(y); return D[d.getDay()] + ' ' + d.getDate() + ' ' + (hi ? CO_MON_HI[d.getMonth()] : d.toLocaleString('en-IN', { month: 'short' })); };
  var wk = new Date(); wk.setDate(wk.getDate() + 7); var end = coYmd(wk);
  var rows = _co.share.r === 'one' ? P.filter(function (r) { return r.v.id === _co.sel; }) : _co.share.r === 'week' ? P.filter(function (r) { return r.date >= today && r.date <= end && r.status !== 'held'; }) : P;
  var time = V.from ? (hi ? 'सुबह ' : '') + V.from + '–' + (V.to || '') : '';
  var name = X.urban ? T('Urban Health & Nutrition Day (UHND)', 'शहरी स्वास्थ्य एवं पोषण दिवस (UHND)') : T('Village Health, Sanitation & Nutrition Day (VHSND)', 'ग्राम स्वास्थ्य, स्वच्छता एवं पोषण दिवस (VHSND)');
  var svc = CO_SVC.filter(function (s) { return (V.svc || {})[s[0]]; }).map(function (s) { return hi ? s[2] : s[1]; }).join(', ');
  var lines = [name, (f.name || '') + ' · ' + (_co.share.r === 'week' ? T('this week', 'इस सप्ताह') : _co.share.r === 'one' ? '' : T('this month', 'इस महीने'))];
  if (!rows.length) lines.push(T('No session in this period.', 'इस अवधि में कोई सत्र नहीं।'));
  rows.forEach(function (r) { lines.push('• ' + fmt(r.date) + ' · ' + r.v.name + (r.v.awc ? ', ' + T('Anganwadi centre ', 'आंगनवाड़ी केंद्र ') + r.v.awc : '') + (time ? ' · ' + time : '') + (r.moved ? ' (' + T('moved from ', 'बदली हुई तारीख, पहले ') + fmt(r.moved) + ')' : '')); });
  if (svc) lines.push(svc + '.');
  lines.push(T('Pregnant women and children due for vaccines, please come. Bring the MCP card.', 'गर्भवती महिलाएँ और जिन बच्चों का टीका बाकी है, ज़रूर आएँ। MCP कार्ड साथ लाएँ।'));
  lines.push('— ' + [X.role, coName(X.mob)].filter(Boolean).join(' ') + (X.mob ? ', ' + X.mob : ''));
  return lines.filter(Boolean).join('\n');
}
function coShareHTML(X) {
  var h = coHead(coT('Share the plan', 'योजना भेजें'), coT('Ready-made message · edit before sending', 'तैयार संदेश · भेजने से पहले बदल सकते हैं'));
  var seg = function (k, v, lab) { return '<button type="button" class="co-seg' + (_co.share[k] === v ? ' on' : '') + '" onclick="_co.share.' + k + '=' + JSON.stringify(v).replace(/"/g, '\'') + ';coRender()">' + coE(lab) + '</button>'; };
  h += '<div class="co-segs">' + seg('r', 'week', coT('This week', 'इस सप्ताह')) + seg('r', 'month', coT('Whole month', 'पूरा महीना')) + (_co.sel ? seg('r', 'one', coT('One session', 'एक सत्र')) : '') + '</div>'
    + '<div class="co-segs">' + seg('hi', true, 'हिंदी') + seg('hi', false, 'English') + '</div>';
  var t = coShareText(X, _co.share.hi);
  h += '<label class="co-f">' + coE(coT('Message', 'संदेश')) + '<textarea id="sh-t" rows="12">' + coE(t) + '</textarea></label>'
    + '<a class="co-wa co-big" href="#" onclick="this.href=\'https://wa.me/?text=\'+encodeURIComponent(document.getElementById(\'sh-t\').value)" target="_blank" rel="noopener">' + coE(coT('Share on WhatsApp', 'व्हाट्सऐप पर भेजें')) + '</a>'
    + '<button type="button" class="co-btn2" onclick="coCopy()">' + coE(coT('Copy text', 'टेक्स्ट कॉपी करें')) + '</button><p class="co-dim co-c">' + coE(coT('WhatsApp opens with the message; you choose the group. The app never sends anything by itself.', 'व्हाट्सऐप संदेश के साथ खुलेगा; समूह आप चुनें। ऐप अपने आप कुछ नहीं भेजता।')) + '</p>';
  return h;
}
function coCopy() { var t = (document.getElementById('sh-t') || {}).value || ''; try { if (typeof nfCopyText === 'function') nfCopyText(t); else navigator.clipboard.writeText(t); showToast(coT('Copied.', 'कॉपी हुआ।'), 'ok'); } catch (e) {} }

// ══ Printing (A4 PDF, Hindi + English; QR codes = facility locations) ══
async function coPdf(draw, name) {
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
  var W = 1240, H = 1754, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'); if (!g) return;
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); draw(g, W, H);
  var url = c.toDataURL('image/jpeg', 0.92);
  try { var J = await nfLoadPdf(), doc = new J({ orientation: 'p', unit: 'mm', format: 'a4', compress: true }); doc.addImage(url, 'JPEG', 0, 0, 210, 297); doc.save(name + '.pdf'); }
  catch (e) { var a = document.createElement('a'); a.href = url; a.download = name + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); }
}
var CO_F = '"Poppins","Noto Sans Devanagari","Mangal",sans-serif';
function coQr(g, text, x, y, s) { try { var q = qrcode(0, 'M'); q.addData(text); q.make(); var n = q.getModuleCount(), cell = s / n; g.fillStyle = '#0F172A'; for (var r = 0; r < n; r++) for (var cc = 0; cc < n; cc++) if (q.isDark(r, cc)) g.fillRect(x + cc * cell, y + r * cell, Math.ceil(cell), Math.ceil(cell)); } catch (e) {} }
function coFit(g, t, max, size, bold) { var s = size; g.font = (bold ? 'bold ' : '') + s + 'px ' + CO_F; while (g.measureText(t).width > max && s > 14) { s -= 2; g.font = (bold ? 'bold ' : '') + s + 'px ' + CO_F; } return t; }
async function coPrintChart() {
  var X = coCtx(); if (!X) return; var up = coUp(), A = coAmb(), vs = coVillages(), T = coTotals(), f = X.f, ic = Object.keys(_co.staff || {}).filter(function (m) { var r = _co.staff[m]; return r && !r.disabled && (r.role || X.inChargeRole) === X.inChargeRole; }).map(coName)[0] || '';
  if (!up.length) { showToast(coT('Add the referral facilities first.', 'पहले रेफरल केंद्र जोड़ें।'), 'err'); return; }
  await coPdf(function (g, W, H) {
    var x0 = 70, y = 90; g.textAlign = 'left';
    g.fillStyle = '#135A55'; coFit(g, 'रेफरल चार्ट · Referral chart', 700, 30, true); g.fillText('रेफरल चार्ट · Referral chart', x0, y);
    g.fillStyle = '#10302B'; coFit(g, f.name || X.code, 760, 50, true); g.fillText(f.name || X.code, x0, y + 62);
    g.fillStyle = '#334A45'; g.font = '26px ' + CO_F; g.fillText([((typeof NF_LEVELS !== 'undefined' && NF_LEVELS[X.t]) || {}).name || X.t.toUpperCase(), f.block, f.district].filter(Boolean).join(' · ') + (ic ? ' · ' + X.inChargeRole + ': ' + ic : ''), x0, y + 104);
    g.textAlign = 'right'; g.fillStyle = '#9A3412'; g.font = 'bold 52px ' + CO_F; g.fillText(A.e + ' · ' + A.m, W - 70, y + 50); g.font = '24px ' + CO_F; g.fillStyle = '#334A45'; g.fillText('एम्बुलेंस · Ambulance', W - 70, y + 86); g.textAlign = 'left';
    g.fillStyle = '#135A55'; g.fillRect(x0, y + 130, W - 140, 6); y += 190;
    g.fillStyle = '#10302B'; g.font = 'bold 30px ' + CO_F; g.fillText('गंभीर मरीज़ को कहाँ भेजें · Where to refer', x0, y); y += 26;
    up.forEach(function (u) {
      var bh = 200; g.strokeStyle = '#C9D6D2'; g.lineWidth = 3; g.strokeRect(x0, y, W - 140, bh);
      g.fillStyle = '#1E6B5E'; g.beginPath(); g.arc(x0 + 56, y + 60, 32, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = 'bold 34px ' + CO_F; g.textAlign = 'center'; g.fillText(u.lvl, x0 + 56, y + 72); g.textAlign = 'left';
      g.fillStyle = '#10302B'; coFit(g, u.name + (u.h24 ? ' · 24×7' : ''), 720, 34, true); g.fillText(u.name + (u.h24 ? ' · 24×7' : ''), x0 + 110, y + 62);
      var svc = CO_REF_SVC.filter(function (s) { return (u.svc || {})[s[0]]; }).map(function (s) { return s[1]; }).join(', ');
      g.font = '24px ' + CO_F; g.fillStyle = '#334A45'; if (svc) { coFit(g, svc, 720, 24); g.fillText(svc, x0 + 110, y + 104); }
      g.font = '26px ' + CO_F; g.fillText([u.km != null && u.km !== '' ? u.km + ' km' : '', CO_RT[u.t] || '', u.phone ? 'Phone ' + u.phone : ''].filter(Boolean).join(' · '), x0 + 110, y + 146);
      coQr(g, coDir(u), W - 70 - 180, y + 10, 180); y += bh + 22;
    });
    g.fillStyle = '#334A45'; g.font = '22px ' + CO_F; g.fillText('QR स्कैन करें — नक्शे पर रास्ता खुलेगा · Scan a QR: the facility opens on the map with directions.', x0, y + 6); y += 56;
    if (vs.length) {
      g.fillStyle = '#10302B'; g.font = 'bold 30px ' + CO_F; g.fillText((X.urban ? 'हमारे क्षेत्र और उषा · Our areas and USHAs' : 'हमारे गाँव और आशा · Our villages and ASHAs'), x0, y); y += 22;
      var cols = [x0 + 16, x0 + 420, x0 + 600, x0 + 740], rh = 44, max = Math.min(vs.length, Math.floor((H - y - 160) / rh) - 2);
      g.fillStyle = '#F0F4F3'; g.fillRect(x0, y, W - 140, rh); g.fillStyle = '#10302B'; g.font = 'bold 22px ' + CO_F;
      [(X.urban ? 'क्षेत्र · Area' : 'गाँव · Village'), 'जनसंख्या', 'दूरी km', 'आशा · ASHA'].forEach(function (t, i) { g.fillText(t, cols[i], y + 30); }); y += rh;
      g.font = '23px ' + CO_F; vs.slice(0, max).forEach(function (v) { g.strokeStyle = '#EEF2F1'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(W - 70, y); g.stroke(); g.fillStyle = '#10302B'; g.fillText(String(v.name).slice(0, 26), cols[0], y + 31); g.fillText(coN(v.pop), cols[1], y + 31); g.fillText(v.km != null && v.km !== '' ? String(v.km) : '', cols[2], y + 31); g.fillText(coAshaNames(v).join(', ').slice(0, 34), cols[3], y + 31); y += rh; });
      g.font = 'bold 23px ' + CO_F; g.fillText('कुल · Total ' + T.n, cols[0], y + 31); g.fillText(coN(T.pop), cols[1], y + 31); g.fillText(coAn(X, T.ashas), cols[3], y + 31);
    }
    g.fillStyle = '#4F625D'; g.font = '20px ' + CO_F; g.fillText('Updated ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · NQAS | FAST by HealSol Academy · based on the NQAS standards', x0, H - 60);
    g.textAlign = 'right'; g.fillText('Print again when a phone or ASHA changes', W - 70, H - 60);
  }, 'Referral-chart-' + String(f.name || X.code).replace(/[^A-Za-z0-9]+/g, '-'));
  try { var t = new Date().toISOString(); await fbSet('sc_outreach/' + X.code + '/printed/chart', t); _co.d.printed.chart = t; } catch (e) {}
}
async function coPrintPlan() {
  var X = coCtx(); if (!X) return; var m = coMonth(), P = coPlan(m), V = _co.d.vhsnd || {}, f = X.f, y0 = +m.slice(0, 4), mo = +m.slice(5, 7) - 1;
  var S = _co.staff || {}, ic = Object.keys(S).filter(function (k) { var r = S[k]; return r && !r.disabled && (r.role || X.inChargeRole) === X.inChargeRole; }).map(coName)[0] || '', anm = Object.keys(S).filter(function (k) { return S[k] && !S[k].disabled && S[k].role === 'ANM'; }).map(coName).join(', ');
  await coPdf(function (g, W, H) {
    var x0 = 70, y = 90; g.textAlign = 'left';
    g.fillStyle = '#135A55'; g.font = 'bold 30px ' + CO_F; g.fillText(coVH(X) + ' माइक्रो-प्लान · Micro-plan', x0, y);
    g.fillStyle = '#10302B'; coFit(g, (f.name || X.code) + ' · ' + new Date(y0, mo, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' }), 820, 44, true); g.fillText((f.name || X.code) + ' · ' + new Date(y0, mo, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' }), x0, y + 58);
    g.fillStyle = '#334A45'; g.font = '26px ' + CO_F; g.fillText(coDaysOn().map(function (d) { return CO_DAYS_HI[d] + ' / ' + CO_DAYS[d]; }).join(' · ') + (V.from ? ' · ' + V.from + '–' + (V.to || '') : ''), x0, y + 100);
    g.textAlign = 'right'; g.font = '24px ' + CO_F; g.fillText(X.inChargeRole + ': ' + ic, W - 70, y + 40); if (anm) g.fillText('ANM: ' + anm, W - 70, y + 76); g.textAlign = 'left';
    g.fillStyle = '#135A55'; g.fillRect(x0, y + 128, W - 140, 6); y += 170;
    var cols = [x0 + 14, x0 + 150, x0 + 400, x0 + 640, x0 + 800, x0 + 980], rh = 52;
    g.fillStyle = '#F0F4F3'; g.fillRect(x0, y, W - 140, rh); g.fillStyle = '#10302B'; g.font = 'bold 22px ' + CO_F;
    ['तारीख Date', (X.urban ? 'क्षेत्र Area' : 'गाँव Village'), 'स्थान Site', 'AWW', 'आशा ASHA', 'हुआ? Held'].forEach(function (t, i) { g.fillText(t, cols[i], y + 34); }); y += rh;
    g.font = '23px ' + CO_F;
    P.forEach(function (r) { if (y > H - 420) return; var d = coDate(r.date); g.strokeStyle = '#EEF2F1'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y); g.lineTo(W - 70, y); g.stroke();
      g.fillStyle = r.status === 'moved' ? '#9A3412' : r.spare ? '#6B7280' : '#10302B'; g.fillText(CO_DAYS[d.getDay()] + ' ' + d.getDate(), cols[0], y + 34);
      if (r.spare) { g.fillText('— spare —', cols[1], y + 34); }
      else { g.fillText(String(r.v.name).slice(0, 18), cols[1], y + 34); g.fillText(String(r.v.awc ? 'AWC ' + r.v.awc : '').slice(0, 18), cols[2], y + 34); g.fillText(String(r.v.aww || '').slice(0, 12), cols[3], y + 34); g.fillText(coAshaNames(r.v).join(', ').slice(0, 14), cols[4], y + 34);
        if (r.status === 'held') g.fillText('✓ held', cols[5], y + 34); else if (r.status === 'moved') g.fillText('→ ' + coDate(r.s.date).getDate() + ' ' + coDate(r.s.date).toLocaleString('en-IN', { month: 'short' }), cols[5], y + 34); else { g.fillRect(cols[5], y + 40, 120, 2); } }
      y += rh; });
    y += 30; g.fillStyle = '#10302B'; g.font = 'bold 26px ' + CO_F; g.fillText('हर सत्र में सेवाएँ · Services at every session', x0, y); y += 40; g.font = '23px ' + CO_F; g.fillStyle = '#334A45';
    var sv = CO_SVC.filter(function (s) { return (V.svc || {})[s[0]]; }); g.fillText(sv.map(function (s) { return s[2]; }).join(' · '), x0, y); y += 36; coFit(g, sv.map(function (s) { return s[1]; }).join(' · '), W - 140, 23); g.fillText(sv.map(function (s) { return s[1]; }).join(' · '), x0, y); y += 56;
    g.font = '22px ' + CO_F; g.fillText('आशा: गर्भवती महिलाओं और टीके वाले बच्चों को लाएँ, MCP कार्ड · ASHA: bring the pregnant women and children due; MCP cards.', x0, y); y += 34;
    g.fillText('आंगनवाड़ी: केंद्र खोलें, वज़न मशीन, पोषण आहार · AWW: open the centre, weighing scale, take-home ration.', x0, y);
    g.fillStyle = '#10302B'; g.fillRect(x0, H - 190, 330, 2); g.fillRect(W - 70 - 330, H - 190, 330, 2); g.font = '22px ' + CO_F; g.fillText(X.inChargeRole + ' signature', x0, H - 160); g.textAlign = 'right'; g.fillText('Medical Officer', W - 70, H - 160);
    g.textAlign = 'left'; g.fillStyle = '#4F625D'; g.font = '20px ' + CO_F; g.fillText('Printed ' + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · NQAS | FAST by HealSol Academy', x0, H - 60);
  }, coVH(X) + '-plan-' + m);
  try { var t = new Date().toISOString(); await fbSet('sc_outreach/' + X.code + '/printed/plan', t); } catch (e) {}
}

// ══ Facility profile: the two entries ══
(function () { if (typeof fpoAboutHTML !== 'function') return; var o = fpoAboutHTML;
  fpoAboutHTML = function (M) { var h = o.apply(this, arguments); try { h += coProfileHTML(); } catch (e) {} return h; }; })();
function coProfileHTML() {
  var X = coCtx(); if (!X) return ''; if (!_co.d || _co.code !== X.code) { coLoad().then(function () { try { if (document.getElementById('fpo-ov') && typeof fpoRender === 'function') fpoRender(); } catch (e) {} }); }
  var T = _co.d && _co.code === X.code ? coTotals() : null, up = _co.d && _co.code === X.code ? coUp() : [];
  return '<div class="fpo-card co-prof"><button type="button" class="co-nav" onclick="coOpen(\'co\')"><span><b>' + coE(coT('Community Outreach', 'सामुदायिक पहुँच')) + '</b><small>' + coE(T && T.n ? coVn(X, T.n) + ' · ' + coN(T.pop) + ' ' + coT('people', 'लोग') + ' · ' + coAn(X, T.ashas) : coT(coV(X, true) + ', ASHAs, map, ' + coVH(X) + ' plan', 'गाँव, आशा, नक्शा, ' + coVH(X) + ' योजना')) + '</small></span>' + coIcon('<path d="M9 6l6 6-6 6"></path>') + '</button>'
    + '<button type="button" class="co-nav" onclick="coOpen(\'ref\')"><span><b>' + coE(coT('Referral Linkages', 'रेफरल लिंकेज')) + '</b><small>' + coE(up.length ? up.map(function (u) { return u.name; }).join(' → ') : coT('Where to refer · Call · WhatsApp · chart', 'कहाँ रेफर करें · कॉल · व्हाट्सऐप · चार्ट')) + '</small></span>' + coIcon('<path d="M9 6l6 6-6 6"></path>') + '</button></div>';
}

// ══ Today: the ASHA's villages, this week's sessions, tomorrow's reminder ══
function coTodayHTML() {
  var X = coCtx(); if (!X || !_co.d || _co.code !== X.code) return '';
  var h = '', today = coToday(), tm = new Date(); tm.setDate(tm.getDate() + 1); var tom = coYmd(tm), wk = new Date(); wk.setDate(wk.getDate() + 7); var end = coYmd(wk);
  var P = coDaysOn().length ? coPlan(coToday().slice(0, 7)).concat(end.slice(0, 7) !== today.slice(0, 7) ? (function () { var s = _co.month; _co.month = end.slice(0, 7); var p = coPlan(_co.month); _co.month = s; return p; })() : []).filter(function (r) { return !r.spare && r.status !== 'moved' && r.status !== 'held' && r.date >= today && r.date <= end; }) : [];
  if (X.asha) {
    var M = coMine(X.mob);
    if (M.list.length) h += '<section class="co-today co-asha"><span class="co-k">' + coE(coT('MY ' + coV(X, true).toUpperCase(), 'मेरे गाँव')) + '</span><div class="co-tiles2"><div><b>' + M.list.length + '</b><small>' + coE(coV(X, true).toLowerCase()) + '</small></div><div><b>' + coN(M.pop) + '</b><small>' + coE(coT('people I care for', 'लोग मेरी देखभाल में')) + '</small></div></div>'
      + M.list.map(function (x) { return '<div class="co-vrow"><b>' + coE(x.v.name) + '</b><span>' + coN(x.v.pop) + (x.with.length ? ' · ' + coE(coT('with ', 'साथ: ') + x.with.join(', ')) : '') + '</span></div>'; }).join('')
      + (M.list.some(function (x) { return x.with.length; }) ? '<small>' + coE(coT('People of a shared village are divided equally between its ASHAs. Wrong village? Tell your in-charge.', 'साझा गाँव के लोग उसकी आशाओं में बराबर बँटते हैं। गलत हो तो प्रभारी को बताएँ।')) + '</small>' : '') + '</section>';
    P = P.filter(function (r) { return (r.v.ashas || {})[X.mob]; });
  }
  var tmr = P.filter(function (r) { return r.date === tom; })[0];
  if (tmr) h += '<div class="co-remind" role="status">' + coIcon('<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>') + '<span><b>' + coE(coT('Tomorrow: ' + coVH(X) + ' in ' + tmr.v.name, 'कल: ' + tmr.v.name + ' में ' + coVH(X))) + '</b>' + coE(((_co.d.vhsnd || {}).from ? (_co.d.vhsnd.from + ' · ') : '') + (tmr.v.awc ? coT('Anganwadi centre ', 'आंगनवाड़ी केंद्र ') + tmr.v.awc : '')) + (X.asha ? ' · ' + coE(coT('bring the pregnant women and children who are due', 'गर्भवती महिलाओं और टीके वाले बच्चों को लाएँ')) : '') + '</span></div>';
  if (P.length) h += '<section class="co-today"><div class="co-row"><b>' + coE(coT('This week\'s ' + coVH(X) + 's', 'इस सप्ताह ' + coVH(X))) + '</b><button type="button" class="co-link" onclick="coOpen(\'vh\')">' + coE(coT('Month', 'महीना')) + '</button></div>'
    + P.map(function (r) { var d = coDate(r.date); return '<button type="button" class="co-li co-sess" onclick="coOpen(\'vhs\',\'' + coJ(r.v.id) + '\')"><span class="co-dd"><b>' + d.getDate() + '</b><small>' + coE((coHi() ? CO_DAYS_HI : CO_DAYS)[d.getDay()]) + '</small></span><span class="co-grow"><b>' + coE(r.v.name) + '</b><small>' + coE([coAshaNames(r.v).join(', '), r.v.aww ? 'AWW ' + r.v.aww : '', r.moved ? coT('moved from ', 'टला: ') + coFmt(r.moved, true) : ''].filter(Boolean).join(' · ')) + '</small></span></button>'; }).join('') + '</section>';
  return h;
}
function coTodayMount(host, after) {
  try { if (!host || host.querySelector('.co-tw')) return; var X = coCtx(); if (!X) return;
    var put = function () { if (!host.isConnected || host.querySelector('.co-tw')) return; var h = coTodayHTML(); if (!h) return; var w = document.createElement('div'); w.className = 'co-tw'; w.innerHTML = h; if (after && after.parentNode === host) host.insertBefore(w, after.nextSibling); else host.appendChild(w); };
    if (_co.d && _co.code === X.code) put(); else coLoad().then(put);
  } catch (e) {}
}
(function () {
  if (typeof nfRenderToday === 'function') { var o = nfRenderToday; nfRenderToday = function () { var r = o.apply(this, arguments); try { var host = document.getElementById('nf-today'); if (host) coTodayMount(host, host.querySelector('.nf-dscore') || host.querySelector('.nf-cta')); } catch (e) {} return r; }; }
  if (typeof ndRender === 'function') { var p = ndRender; ndRender = function () { var r = p.apply(this, arguments); try { if (_nd && !_nd.view && (_nd.tab === 'today' || !_nd.tab) && !_nd.card && !_nd.screen) { var app = document.getElementById('nf-dept-app'), hero = app && app.querySelector('.nx-hero'); if (hero && hero.parentNode) coTodayMount(hero.parentNode, hero); } } catch (e) {} return r; }; }
})();

// ══ One team: the ASHAs (with or without app login) and their villages show on Our team and the Staff pages (21 Nov 2026) ══
function coVillLine(X, list) { if (!list.length) return ''; var p = 0; list.forEach(function (v) { p += +v.pop || 0; }); return list.map(function (v) { return v.name; }).join(', ') + ' · ' + coN(p) + ' ' + coT('people', 'लोग'); }
function coNoAppRowsHTML(X, cls) {
  var NA = coNoApp(); if (!NA.length) return '';
  return '<div class="co-staffx ' + (cls || '') + '"><b>' + coE(coT((X.urban ? 'USHAs' : 'ASHAs') + ' without app login', 'ऐप लॉगिन के बिना आशा')) + '</b>'
    + NA.map(function (a) { return '<div class="co-sx"><span class="co-sx-av">' + coE(String(a.name).charAt(0).toUpperCase()) + '</span><span class="co-sx-t"><b>' + coE(a.name) + '</b><small>' + coE(a.role + ' · ' + coT('no app login', 'ऐप लॉगिन नहीं')) + (a.vs.length ? ' · ' + coE(coVillLine(X, a.vs)) : '') + '</small></span>'
      + (X.inc ? '<span class="co-sx-b"><button type="button" class="co-btn2" onclick="coGiveLogin(\'' + coJ(a.aid) + '\')">' + coE(coT('Add mobile', 'मोबाइल जोड़ें')) + '</button><button type="button" class="co-ic" aria-label="' + coE(coT('Remove ', 'हटाएँ ') + a.name) + '" onclick="coRemoveNoApp(\'' + coJ(a.aid) + '\')">×</button></span>' : '') + '</div>'; }).join('')
    + '<small class="co-dim">' + coE(coT('Added in Community Outreach. With a mobile number she gets her own login and sees her ' + coV(X, true).toLowerCase() + '.', 'सामुदायिक पहुँच में जोड़ी गईं। मोबाइल से उन्हें अपना लॉगिन मिलेगा।')) + '</small></div>';
}
// Sub-Centre Staff page (fadm roster)
(function () {
  if (typeof faStaffRender !== 'function') return; var o = faStaffRender;
  faStaffRender = function () { var r = o.apply(this, arguments); try { coStaffDecorate(); } catch (e) {} return r; };
  if (typeof faStaffMeta === 'function') { var m = faStaffMeta; faStaffMeta = function () { var r = m.apply(this, arguments); try { var miss = document.getElementById('fa-staff-miss'); if (miss && coNoApp().length) miss.textContent = miss.textContent.replace(/ · ASHA\b|ASHA · |^Not added yet: ASHA$/, '').replace(/^Not added yet: $/, ''); } catch (e) {} return r; }; }
})();
function coStaffDecorate() {
  var cont = document.getElementById('sc-cho-staff-roster'), X = coCtx(); if (!cont || !X) return;
  var go = function () { if (!cont.isConnected) return; var X2 = coCtx(); if (!X2 || !_co.d || _co.code !== X2.code) return;
    cont.querySelectorAll('.fa-p[data-mob]').forEach(function (p) { var mob = p.getAttribute('data-mob'), vs = coVillagesOf(mob), pb = p.querySelector('.fa-pb'); if (!pb || pb.querySelector('.co-vl') || !vs.length) return; var d = document.createElement('div'); d.className = 'co-vl'; d.textContent = '🏘 ' + coVillLine(X2, vs); var sm = pb.querySelector('small'); if (sm) sm.insertAdjacentElement('afterend', d); else pb.appendChild(d); });
    var old = cont.parentNode && cont.parentNode.querySelector('.co-staffx'); if (old) old.remove();
    var h = coNoAppRowsHTML(X2, 'fa'); if (h) cont.insertAdjacentHTML('afterend', h);
    try { if (typeof faStaffMeta === 'function') faStaffMeta(); } catch (e) {} };
  if (_co.d && _co.code === X.code) go(); else coLoad().then(go);
}
// department facilities (UPHC / PHC / CHC): the Staff tab
(function () {
  if (typeof ndRender !== 'function') return; var o = ndRender;
  ndRender = function () { var r = o.apply(this, arguments); try { var add = document.getElementById('nd-add'); if (add) { var X = coCtx(); if (!X) return r; var go = function () { var a2 = document.getElementById('nd-add'); if (!a2 || !a2.parentNode) return; var old = a2.parentNode.querySelector('.co-staffx'); if (old) old.remove(); var h = coNoAppRowsHTML(coCtx(), 'nd'); if (h) a2.insertAdjacentHTML('beforebegin', h); };
    if (_co.d && _co.code === X.code) go(); else coLoad().then(go); } } catch (e) {} return r; };
})();
// Facility profile → Our team: the ASHAs' villages, and the ASHAs without app login
(function () {
  if (typeof fpoStaff !== 'function') return; var o = fpoStaff;
  fpoStaff = function (M) { var L = o.apply(this, arguments); try { var X = coCtx(); if (!X || !_co.d || _co.code !== X.code) return L;
    L = L.map(function (x) { var vs = x.mob ? coVillagesOf(x.mob) : []; return vs.length ? Object.assign({}, x, { role: x.role + ' · ' + vs.map(function (v) { return v.name; }).join(', ') }) : x; });
    coNoApp().forEach(function (a) { L.push({ name: a.name, role: a.role + ' · ' + coT('no app login', 'ऐप लॉगिन नहीं') + (a.vs.length ? ' · ' + a.vs.map(function (v) { return v.name; }).join(', ') : ''), mob: '', ic: false }); });
  } catch (e) {} return L; };
})();
// Staff → Add staff (ASHA / USHA): tick her villages in the same step
function coAddStaffVillHTML(sel) { var X = coCtx(), vs = coVillages(); if (!X || !X.inc || !vs.length) return ''; return '<div class="co-addv"><span class="co-lab">' + coE(coT('Her ' + coV(X, true).toLowerCase() + ' (optional)', 'उनके गाँव (वैकल्पिक)')) + '</span><div class="co-chips">' + vs.map(function (v) { return coChipHTML('data-vid', v.id, v.name, false, ''); }).join('') + '</div></div>'; }
async function coAfterAddStaff(sel, mob) {
  var X = coCtx(), box = document.querySelector(sel); if (!X || !box || !mob) return; var ids = [].map.call(box.querySelectorAll('.co-chip.on[data-vid]'), function (b) { return b.getAttribute('data-vid'); }); if (!ids.length) return;
  for (var i = 0; i < ids.length; i++) { var v = _co.d.villages[ids[i]]; if (!v) continue; var a = Object.assign({}, v.ashas || {}); a[mob] = true; if ((await fbSet('sc_outreach/' + X.code + '/villages/' + ids[i] + '/ashas', a)) !== false) v.ashas = a; }
  coRefreshTeamViews();
}
(function () {
  if (typeof scOpenAddStaff === 'function') { var o = scOpenAddStaff; scOpenAddStaff = function (roleId) { var r = o.apply(this, arguments); try { var m = document.getElementById('sc-add-modal'), old = m && m.querySelector('.co-addv'); if (old) old.remove();
      if (m && coAshaRoles().indexOf(roleId) >= 0) { var put = function () { var e = document.getElementById('sc-add-err'), h = coAddStaffVillHTML(); if (h && e && !m.querySelector('.co-addv')) e.insertAdjacentHTML('beforebegin', h); }; var X = coCtx(); if (X && _co.d && _co.code === X.code) put(); else coLoad().then(put); } } catch (e) {} return r; }; }
  if (typeof scSaveNewStaff === 'function') { var s = scSaveNewStaff; scSaveNewStaff = async function () { var mob = ((document.getElementById('sc-add-mob') || {}).value || '').trim(), had = typeof scSubAdminStaff !== 'undefined' && scSubAdminStaff && scSubAdminStaff[mob] && !scSubAdminStaff[mob].disabled;
      var keep = document.querySelector('#sc-add-modal .co-addv'), ids = keep ? [].map.call(keep.querySelectorAll('.co-chip.on[data-vid]'), function (b) { return b.getAttribute('data-vid'); }) : [];
      var r = await s.apply(this, arguments);
      try { if (!had && ids.length && scSubAdminStaff[mob]) { if (_co.staff) _co.staff[mob] = scSubAdminStaff[mob]; var tmp = document.createElement('div'); tmp.id = 'co-tmpv'; tmp.style.display = 'none'; tmp.innerHTML = ids.map(function (id) { return '<i class="co-chip on" data-vid="' + coE(id) + '"></i>'; }).join(''); document.body.appendChild(tmp); await coAfterAddStaff('#co-tmpv', mob); tmp.remove(); } } catch (e) {}
      return r; }; }
  if (typeof ndAddStaff === 'function') { var n = ndAddStaff; ndAddStaff = async function () { var mob = ((document.getElementById('nd-add-mob') || {}).value || '').replace(/\D/g, ''), role = ((document.getElementById('nd-add-role') || {}).value || ''), box = document.querySelector('#nd-add .co-addv'), ids = box ? [].map.call(box.querySelectorAll('.co-chip.on[data-vid]'), function (b) { return b.getAttribute('data-vid'); }) : [], had = !!(typeof ndStaff === 'function' && ndStaff()[mob]);
      var r = await n.apply(this, arguments);
      try { if (!had && ids.length && coAshaRoles().indexOf(role) >= 0 && _nd.fac.staff && _nd.fac.staff[mob]) { if (_co.staff) _co.staff[mob] = _nd.fac.staff[mob]; var tmp = document.createElement('div'); tmp.id = 'co-tmpv'; tmp.style.display = 'none'; tmp.innerHTML = ids.map(function (id) { return '<i class="co-chip on" data-vid="' + coE(id) + '"></i>'; }).join(''); document.body.appendChild(tmp); await coAfterAddStaff('#co-tmpv', mob); tmp.remove(); } } catch (e) {}
      return r; };
    // the village chips sit in the dept Add staff form; they matter only when the role chosen is ASHA / USHA
    var nr = ndRender; ndRender = function () { var r = nr.apply(this, arguments); try { var add = document.getElementById('nd-add'), go = document.getElementById('nd-add-go'); if (add && go && !add.querySelector('.co-addv')) { var put = function () { var a2 = document.getElementById('nd-add'), g2 = document.getElementById('nd-add-go'); if (!a2 || !g2 || a2.querySelector('.co-addv')) return; var h = coAddStaffVillHTML(); if (!h) return; g2.insertAdjacentHTML('beforebegin', h); var sel = document.getElementById('nd-add-role'), box = a2.querySelector('.co-addv'), sync = function () { box.style.display = coAshaRoles().indexOf(sel ? sel.value : '') >= 0 ? '' : 'none'; }; if (sel) sel.addEventListener('change', sync); sync(); }; var X = coCtx(); if (X && _co.d && _co.code === X.code) put(); else if (X) coLoad().then(put); } } catch (e) {} return r; }; }
})();
