// ══════════════════════════════════════════════════════════════
// FACILITY PROFILE — the first page of the day for facility staff (SC · UPHC · PHC · CHC), approved 3 Nov 2026
//   Opens by itself on the first login of the day (per facility and person); afterwards from "🏥 Facility profile" on Today.
//   1 Profile: name, place, NIN, type, package, day · greeting · population / villages / team (in-charge edits) ·
//     NQAS journey (baseline → now, steps) · team with levels and stars · Continue
//   2 Impact: "Working to ensure / Ensuring quality of care for N people" · 3 verified numbers · Share / Save picture ·
//     milestones and own level · certifications (NQAS from the programme; in-charge adds Kayakalp, LaQshya, …) ·
//     Hindi wall poster (A4 PDF, QR to the poster check page) · partner strip
//   3 Quality Stars: Block / District (default) / State — 3 most improved, NQAS Ready, 3 top quality staff;
//     "your facility is #n" only when it is in the district's top 10; own "Show my name" switch
//   Data: sc_profile/{code} and sc_leaders/{s|d|b}/{key} (nightly summary, functions/profile.js), the facility record.
// ══════════════════════════════════════════════════════════════
var _fpo = { code: null, prof: null, lvl: 'd', L: {}, all: false, opt: null };
function fpoHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function fpoT(en, hi) { return fpoHi() && hi ? hi : en; }
function fpoE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function fpoJ(s) { return typeof scJs === 'function' ? scJs(String(s == null ? '' : s)) : String(s).replace(/'/g, "\\'"); }
function fpoN(n) { return n == null ? '—' : Number(n).toLocaleString('en-IN'); }
function fpoMob() { try { return (typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || (typeof choState !== 'undefined' && choState.staffMobile) || ''; } catch (e) { return ''; } }
function fpoCtx() { var M = typeof rgMyFac === 'function' ? rgMyFac() : null; if (!M || !M.code) return null; if (_fpo.fac && _fpo.fac._code === M.code) M.f = Object.assign({}, M.f || {}, _fpo.fac); M.t = typeof nfTypeOf === 'function' ? nfTypeOf(M.f || {}) : 'sc'; M.L = (typeof NF_LEVELS !== 'undefined' && NF_LEVELS[M.t]) || {}; M.ic = typeof rgIsInCharge === 'function' && rgIsInCharge(); M.mob = fpoMob(); return M; }
function fpoToday() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function fpoDay(M) {
  try { if (M.dept) return { day: ndDay(), days: (_fpo.prof && _fpo.prof.days) || 90 }; } catch (e) {}
  try { return { day: scb1TodayIdx() + 1, days: 60 }; } catch (e) {}
  return { day: _fpo.prof && _fpo.prof.day, days: (_fpo.prof && _fpo.prof.days) || 60 };
}
function fpoStaff(M) { var S = (M.f && M.f.staff) || {}, ic = M.L.inCharge || 'CHO';
  return Object.keys(S).filter(function (m) { return S[m] && !S[m].disabled; }).map(function (m) { var r = S[m]; return { mob: m, name: r.name || m, role: r.role || ic, ic: (r.role || ic) === ic, imp: r.impact || null }; })
    .sort(function (a, b) { return (b.ic - a.ic) || ((b.imp && b.imp.stars || 0) - (a.imp && a.imp.stars || 0)) || String(a.name).localeCompare(String(b.name)); }); }
function fpoMyName(M) { var S = (M.f && M.f.staff) || {}, r = S[M.mob]; var n = (r && r.name) || (typeof choState !== 'undefined' && choState.staffName) || ''; return nfShortName(n); }
function fpoInit(n) { var p = String(n || '').trim().split(/\s+/); return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); }

// ── open / close ──
async function fpoOpen(auto) {
  var M = fpoCtx(); if (!M) return;
  _fpo.code = M.code; _fpo.all = false;
  try { localStorage.setItem('fpo_day_' + M.code + '_' + M.mob, fpoToday()); } catch (e) {}
  var ov = document.getElementById('fpo-ov'); if (!ov) { ov = document.createElement('div'); ov.id = 'fpo-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Facility profile'); document.body.appendChild(ov); }
  document.body.classList.add('fpo-open');
  if (!_fpo.prof || _fpo.prof._code !== M.code) _fpo.prof = null;
  fpoRender();
  try { var full = await fbGet('sc_facilities/' + M.code); if (full) _fpo.fac = Object.assign(full, { _code: M.code }); } catch (e) {}   // the SC app keeps a short copy (no team / certificates)
  try { var p = await fbGet('sc_profile/' + M.code); _fpo.prof = p ? Object.assign(p, { _code: M.code }) : { _code: M.code, none: true }; } catch (e) { _fpo.prof = { _code: M.code, none: true }; }
  try { if (M.mob) _fpo.opt = (await fbGet('sc_impact_optout/' + M.mob)) === true; } catch (e) {}
  try { if (typeof nfImpCfg === 'function') await nfImpCfg(); } catch (e) {}
  if (!document.getElementById('fpo-ov')) return;
  fpoRender(); fpoLoadStars();
}
function fpoClose() { var ov = document.getElementById('fpo-ov'); if (ov) ov.remove(); document.body.classList.remove('fpo-open'); }
function fpoContinue() { fpoClose(); var M = fpoCtx(); try { if (M && M.dept) ndTab('today'); else if (typeof nfTab === 'function') nfTab('today'); } catch (e) {} }
function fpoSeenToday(M) { try { return localStorage.getItem('fpo_day_' + M.code + '_' + M.mob) === fpoToday(); } catch (e) { return true; } }
function fpoAuto() { try { if ((navigator.webdriver || window.__dq) && !window.__fpoAuto) return; if (typeof NF_SAFE !== 'undefined' && NF_SAFE) return; if (document.getElementById('fpo-ov')) return; var M = fpoCtx(); if (!M || fpoSeenToday(M)) return; fpoOpen(true); } catch (e) {} }

// ── the page ──
function fpoRender() {
  var ov = document.getElementById('fpo-ov'), M = fpoCtx(); if (!ov || !M) return;
  var y = ov.scrollTop; ov.innerHTML = '<div class="fpo-page">' + fpoCoverHTML(M) + fpoAboutHTML(M) + fpoJourneyHTML(M) + fpoTeamHTML(M)
    + '<button type="button" class="fpo-go" onclick="fpoContinue()">▶ ' + fpoE(fpoT('Continue to today\'s card', 'आज के कार्ड पर चलें')) + '</button>'
    + fpoImpactHTML(M) + fpoMsHTML(M) + fpoCertsHTML(M) + fpoPosterHTML(M) + '<div id="fpo-stars">' + fpoStarsHTML(M) + '</div>' + fpoPartnerHTML(M) + '</div>';
  ov.scrollTop = y;
}
function fpoCoverHTML(M) {
  var f = M.f || {}, D = fpoDay(M), pkg = ''; try { pkg = fpPkg(f); } catch (e) {}
  var tn = (M.t === 'chc' && typeof nfChcKindLabel === 'function' ? nfChcKindLabel(f) : '') || M.L.name || 'Facility';
  var place = [f.block, f.district, f.state].filter(Boolean).join(' · ') + (f.nin ? ' · NIN ' + f.nin : '');
  var P = _fpo.prof || {}, n = P.nums || {}, line;
  if (n.gain > 0) line = fpoT('Your team is ' + n.gain + ' points better than at the baseline. Keep going!', 'आपकी टीम बेसलाइन से ' + n.gain + ' अंक आगे है। ऐसे ही चलते रहें!');
  else if (D.day && D.day <= (M.dept ? nfBlDays(M.t) : 7)) line = fpoT('Baseline week: every card you finish shows where ' + (f.name || 'your facility') + ' stands today.', 'बेसलाइन: हर पूरा कार्ड दिखाता है कि आपका केंद्र आज कहाँ है।');
  else line = fpoT('Every card you finish moves ' + (f.name || 'your facility') + ' closer to NQAS Ready.', 'हर पूरा कार्ड आपके केंद्र को NQAS तैयारी के करीब लाता है।');
  return '<div class="fpo-cover"><div class="fpo-topb"><button type="button" class="fpo-x" onclick="fpoContinue()" aria-label="' + fpoE(fpoT('Close', 'बंद करें')) + '">‹ ' + fpoE(fpoT('Today', 'आज')) + '</button><span>NQAS | FAST · HealSol</span></div>'
    + '<h1 class="fpo-name">' + fpoE(f.name || M.code) + '</h1><div class="fpo-meta">' + fpoE(place) + '</div>'
    + '<div class="fpo-chips"><span>' + fpoE(tn) + '</span>' + (pkg ? '<span>' + fpoE(pkg) + '</span>' : '') + (D.day && D.day >= 1 ? '<span class="o">' + fpoE(fpoT('Day ' + Math.min(D.day, D.days) + ' of ' + D.days, 'दिन ' + Math.min(D.day, D.days) + ' / ' + D.days)) + '</span>' : '') + '</div>'
    + '<div class="fpo-hello"><b>' + fpoE(fpoT('Namaste', 'नमस्ते')) + ', ' + fpoE(fpoMyName(M)) + ' 🙏</b>' + fpoE(line) + '</div></div>';
}
function fpoAboutHTML(M) {
  var p = (M.f && M.f.population) || {}, P = _fpo.prof || {}, pop = p.n || P.pop, vil = p.villages || P.villages, team = fpoStaff(M).length;
  var ed = M.ic ? '<button type="button" class="fpo-ed" onclick="fpoPopEdit()">✎ ' + fpoE(fpoT(pop ? 'Edit' : 'Add population', pop ? 'बदलें' : 'जनसंख्या जोड़ें')) + '</button>' : '';
  return '<div class="fpo-card"><h3>' + fpoE(fpoT('About our facility', 'हमारा स्वास्थ्य केंद्र')) + ed + '</h3><div class="fpo-facts">'
    + '<div><b>' + (pop ? fpoN(pop) : '—') + '</b><small>' + fpoE(fpoT('people served', 'लोगों की सेवा')) + '</small></div>'
    + '<div><b>' + (vil ? fpoN(vil) : '—') + '</b><small>' + fpoE(M.t === 'uphc' ? fpoT('wards', 'वार्ड') : fpoT('villages', 'गाँव')) + '</small></div>'
    + '<div><b>' + team + '</b><small>' + fpoE(fpoT('team members', 'टीम सदस्य')) + '</small></div></div>'
    + (!pop ? '<p class="fpo-dim">' + fpoE(M.ic ? fpoT('Add your population so your impact can be shown.', 'अपनी जनसंख्या जोड़ें ताकि आपका प्रभाव दिखे।') : fpoT('Your in-charge adds the population.', 'जनसंख्या प्रभारी जोड़ते हैं।')) + '</p>' : '') + '</div>';
}
async function fpoPopEdit() { if (typeof rgPopEdit !== 'function') return; await rgPopEdit(); try { var M = rgMyFac(); if (_fpo.fac && M && M.f && M.f.population) _fpo.fac.population = M.f.population; } catch (e) {} fpoRender(); }
function fpoSteps(M, day) {
  var dept = M.dept, N = dept ? ((_fpo.prof && _fpo.prof.days) || 90) : 60, b = dept ? nfBlDays(M.t) : 7, e = dept ? N - 7 : 49, z = dept ? N : 56;
  var cur = !day || day < 1 ? -1 : day <= b ? 0 : day <= e ? 1 : day <= z ? 2 : 3, L = [fpoT('Baseline', 'बेसलाइन'), fpoT('Implement', 'सुधार'), fpoT('End-line', 'एंड-लाइन'), fpoT('Result', 'परिणाम')];
  return '<div class="fpo-steps">' + L.map(function (x, i) { return '<div class="' + (i < cur ? 'd' : i === cur ? 'c' : '') + '">' + fpoE(x) + '</div>'; }).join('') + '</div>';
}
function fpoJourneyHTML(M) {
  var P = _fpo.prof, D = fpoDay(M), f = M.f || {};
  var since = f.startDate ? (typeof scFmtDate === 'function' ? scFmtDate(f.startDate) : f.startDate) : '';
  var h = '<div class="fpo-card"><h3>' + fpoE(fpoT('Our NQAS journey', 'हमारी NQAS यात्रा')) + (since ? '<small>' + fpoE(fpoT('since ', 'शुरुआत ')) + fpoE(since) + '</small>' : '') + '</h3>';
  if (!P) return h + '<p class="fpo-dim">' + fpoE(fpoT('Loading…', 'लोड हो रहा है…')) + '</p></div>';
  if (P.none || P.pct == null) return h + '<p class="fpo-dim">' + fpoE(fpoT('Your readiness appears here after the first night in the programme.', 'कार्यक्रम की पहली रात के बाद आपकी तैयारी यहाँ दिखेगी।')) + '</p>' + fpoSteps(M, D.day) + '</div>';
  var pct = Math.round(P.pct), base = P.base != null ? Math.round(P.base) : null, g = base != null ? pct - base : null, to = Math.max(0, 70 - pct);
  var st = P.status === 'certified' ? fpoT('NHSRC certified 🏆', 'NHSRC प्रमाणित 🏆') : P.status === 'ready' ? fpoT('NQAS Ready ✅', 'NQAS तैयार ✅') : to ? fpoT('NQAS Ready at 70% · ' + to + ' points to go', 'NQAS तैयार 70% पर · ' + to + ' अंक बाकी') : fpoT('Above 70% — keep it up to the end-line', '70% से ऊपर — एंड-लाइन तक बनाए रखें');
  return h + '<div class="fpo-jr"><div class="fpo-ring" style="--p:' + Math.max(0, Math.min(100, pct)) + '"><i><b>' + pct + '%</b><small>' + fpoE(fpoT('readiness', 'तैयारी')) + '</small></i></div><div class="fpo-jt">'
    + (base != null ? fpoE(fpoT('Baseline', 'बेसलाइन')) + ' <b>' + base + '%</b> → ' + fpoE(fpoT('now', 'अब')) + ' <b>' + pct + '%</b><br>' : '')
    + (g != null ? '<b class="' + (g >= 0 ? 'up' : 'dn') + '">' + (g >= 0 ? '▲ ' + g : '▼ ' + (-g)) + '</b> ' + fpoE(fpoT('points since baseline', 'अंक बेसलाइन से')) + '<br>' : '') + fpoE(st) + '</div></div>'
    + fpoSteps(M, D.day) + '<p class="fpo-upd">' + fpoE(fpoT('Updated every night', 'हर रात अपडेट')) + '</p></div>';
}
function fpoTeamHTML(M) {
  var S = fpoStaff(M), show = _fpo.all ? S : S.slice(0, 4), lv = function (x) { if (!x.imp || !x.imp.level || typeof NF_LEVEL === 'undefined' || !NF_LEVEL[x.imp.level]) return ''; return '<span class="fpo-lv">' + NF_LEVEL[x.imp.level].ic + ' ' + fpoE(nfImpLv(x.imp.level)) + (x.imp.stars ? '<br><span class="fpo-st">' + nfImpStars(x.imp.stars) + '</span>' : '') + '</span>'; };
  return '<div class="fpo-card"><h3>' + fpoE(fpoT('Our team', 'हमारी टीम')) + '<small>' + fpoE(fpoT('level · stars', 'स्तर · स्टार')) + '</small></h3>'
    + show.map(function (x) { return '<div class="fpo-mem"><span class="fpo-av">' + fpoE(fpoInit(x.name)) + '</span><span class="fpo-mn">' + fpoE(x.name) + '<small>' + fpoE(x.role) + (x.ic ? ' · ' + fpoT('in-charge', 'प्रभारी') : '') + (x.mob === M.mob ? ' · ' + fpoT('you', 'आप') : '') + '</small></span>' + lv(x) + '</div>'; }).join('')
    + (S.length > 4 && !_fpo.all ? '<button type="button" class="fpo-more" onclick="_fpo.all=true;fpoRender()">' + fpoE(fpoT('See all ' + S.length + ' ›', 'सभी ' + S.length + ' देखें ›')) + '</button>' : '') + '</div>';
}

// ── impact ──
function fpoCare(M) {
  var P = _fpo.prof || {}, p = (M.f && M.f.population) || {}, n = p.n || P.pop, v = p.villages || P.villages, ok = P.status === 'ready' || P.status === 'certified'; if (!n) return '';
  var num = Number(n).toLocaleString('en-IN'), vl = v ? (M.t === 'uphc' ? v + ' wards' : v + ' villages') : '';
  if (fpoHi()) return (v ? v + (M.t === 'uphc' ? ' वार्डों' : ' गाँवों') + ' के ' : '') + num + ' लोगों के लिए गुणवत्तापूर्ण देखभाल सुनिश्चित' + (ok ? '' : ' करने की ओर');
  return (ok ? 'Ensuring' : 'Working to ensure') + ' quality of care for ' + num + ' people' + (vl ? ' · ' + vl : '');
}
function fpoImpactHTML(M) {
  var P = _fpo.prof || {}, n = P.nums || {}, care = fpoCare(M);
  return '<div class="fpo-card fpo-imp"><h3>' + fpoE(fpoT('Our impact', 'हमारा प्रभाव')) + '<small>' + fpoE(fpoT('verified · updated every night', 'सत्यापित · हर रात')) + '</small></h3>'
    + (care ? '<div class="fpo-care">' + fpoE(care) + '</div>' : '<p class="fpo-dim">' + fpoE(fpoT('Add the population to show how many people your work reaches.', 'जनसंख्या जोड़ें ताकि दिखे कि आपका काम कितने लोगों तक पहुँचता है।')) + '</p>')
    + '<div class="fpo-nums"><div><b>' + fpoN(n.fixed || 0) + '</b><small>' + fpoE(M.dept ? fpoT('gaps fixed', 'कमियाँ सुधारीं') : fpoT('gaps closed · Not met → Met', 'कमियाँ दूर कीं')) + '</small></div>'
    + '<div><b>' + fpoN(n.onTime || 0) + '</b><small>' + fpoE(fpoT('cards on time', 'समय पर कार्ड')) + '</small></div>'
    + '<div><b>' + (n.gain != null ? '+' + n.gain : '—') + '</b><small>' + fpoE(fpoT('points since baseline', 'अंक बेसलाइन से')) + '</small></div></div>'
    + '<div class="fpo-share"><button type="button" class="wa" onclick="fpoShare()">' + fpoE(fpoT('Share on WhatsApp', 'WhatsApp पर साझा करें')) + '</button><button type="button" onclick="fpoPoster(\'jpg\')">' + fpoE(fpoT('Save picture', 'चित्र सहेजें')) + '</button></div>'
    + '<p class="fpo-upd">✔ ' + fpoE(fpoT('The picture has a QR code that shows it is genuine', 'चित्र पर QR कोड है जो इसकी पुष्टि करता है')) + '</p></div>';
}
function fpoShareText(M) {
  var f = M.f || {}, P = _fpo.prof || {}, n = P.nums || {}, care = fpoCare(M), hi = fpoHi();
  var lines = [hi ? '🏥 ' + (f.name || '') + ' — NQAS की ओर हमारी यात्रा' : '🏥 ' + (f.name || '') + ' — our NQAS journey'];
  if (care) lines.push(care);
  if (P.pct != null) lines.push((hi ? 'तैयारी: ' : 'Readiness: ') + (P.base != null ? Math.round(P.base) + '% → ' : '') + Math.round(P.pct) + '%');
  if (n.fixed) lines.push((hi ? 'कमियाँ दूर कीं: ' : 'Gaps closed: ') + n.fixed);
  lines.push((P.pid ? fpoVerifyUrl(P.pid) + '\n' : '') + '#NQAS #QualityOfCare #NQASFAST #HealSolAcademy');
  return lines.join('\n');
}
function fpoShare() { var M = fpoCtx(); if (!M) return; var t = fpoShareText(M); try { window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank', 'noopener'); } catch (e) {} }
var FPO_MS = { start: ['🚀', 'Programme started', 'कार्यक्रम शुरू'], baseline: ['📋', 'Baseline complete', 'बेसलाइन पूरी'], gaps10: ['🔧', 'First 10 gaps closed', 'पहली 10 कमियाँ दूर'],
  pct70: ['🎯', 'Readiness reached 70%', 'तैयारी 70% पहुँची'], graduated: ['🎓', 'Programme completed', 'कार्यक्रम पूरा'], ready: ['✅', 'NQAS Ready', 'NQAS तैयार'], certified: ['🏆', 'NHSRC certified', 'NHSRC प्रमाणित'] };
var FPO_MS_ORDER = ['start', 'baseline', 'gaps10', 'pct70', 'graduated', 'ready', 'certified'];
function fpoMsHTML(M) {
  var P = _fpo.prof || {}, got = P.ms || [], next = FPO_MS_ORDER.find(function (k) { return got.indexOf(k) < 0; }), me = ((M.f && M.f.staff) || {})[M.mob], tag = me && me.impact;
  var rows = FPO_MS_ORDER.filter(function (k) { return got.indexOf(k) >= 0; }).reverse().slice(0, 3).map(function (k) { var x = FPO_MS[k]; return '<div class="fpo-ms"><span>' + x[0] + '</span><b>' + fpoE(fpoT(x[1], x[2])) + '</b></div>'; }).join('');
  if (tag && tag.level && typeof NF_LEVEL !== 'undefined' && NF_LEVEL[tag.level]) rows = '<div class="fpo-ms me"><span>' + NF_LEVEL[tag.level].ic + '</span><b>' + fpoE(fpoT('You are a ', 'आप ')) + fpoE(nfImpLv(tag.level)) + (fpoHi() ? ' हैं' : '') + (tag.stars ? ' <span class="fpo-st">' + nfImpStars(tag.stars) + '</span>' : '') + '</b></div>' + rows;
  if (!rows && !next) return '';
  return '<div class="fpo-card"><h3>' + fpoE(fpoT('Recognition & milestones', 'सम्मान और उपलब्धियाँ')) + '</h3>' + (rows || '<p class="fpo-dim">' + fpoE(fpoT('Your first milestone is on its way.', 'आपकी पहली उपलब्धि जल्द।')) + '</p>')
    + (next ? '<p class="fpo-next">' + fpoE(fpoT('Next: ', 'अगला: ')) + FPO_MS[next][0] + ' ' + fpoE(fpoT(FPO_MS[next][1], FPO_MS[next][2])) + '</p>' : '') + '</div>';
}

// ── certifications ──
var FPO_CERT_OPTS = ['Kayakalp', 'LaQshya', 'MusQan', 'NQAS (State)', 'NQAS (National)', 'Other'];
function fpoCertsHTML(M) {
  var P = _fpo.prof || {}, f = M.f || {}, C = f.certs || {}, chips = [];
  chips.push('<span class="fpo-cert"><b>NQAS</b> · ' + fpoE(P.status === 'certified' ? fpoT('NHSRC certified', 'प्रमाणित') : P.status === 'ready' ? fpoT('Ready', 'तैयार') : fpoT('working towards', 'प्रयासरत')) + '</span>');
  [['laqshya', 'LaQshya'], ['musqan', 'MusQan']].forEach(function (x) { var r = f[x[0]]; if (r && r.status) chips.push('<span class="fpo-cert"><b>' + x[1] + '</b> · ' + fpoE(String(r.status).replace(/_/g, ' ')) + '</span>'); });
  Object.keys(C).sort().forEach(function (id) { var c = C[id] || {}; chips.push('<span class="fpo-cert"><b>' + fpoE(c.name) + '</b>' + (c.note ? ' · ' + fpoE(c.note) : '') + (M.ic ? ' <button type="button" class="fpo-cx" aria-label="Remove" onclick="fpoCertDel(\'' + fpoJ(id) + '\')">×</button>' : '') + '</span>'); });
  if (M.ic) chips.push('<button type="button" class="fpo-cert add" onclick="fpoCertAdd()">+ ' + fpoE(fpoT('Add', 'जोड़ें')) + '</button>');
  return '<div class="fpo-card"><h3>' + fpoE(fpoT('Certifications & awards', 'प्रमाणन और पुरस्कार')) + '</h3><div class="fpo-certs">' + chips.join('') + '</div></div>';
}
async function fpoCertAdd() {
  var M = fpoCtx(); if (!M || !M.ic) return;
  var v = await scDialog({ title: fpoT('Add a certification or award', 'प्रमाणन / पुरस्कार जोड़ें'), icon: '🏅', okLabel: fpoT('Add', 'जोड़ें'),
    fields: [{ key: 'kind', label: fpoT('Which', 'कौन सा'), type: 'select', value: 'Kayakalp', options: FPO_CERT_OPTS.map(function (x) { return { value: x, label: x }; }) },
      { key: 'other', label: fpoT('Name (for "Other")', 'नाम ("Other" के लिए)'), maxLength: 60 },
      { key: 'note', label: fpoT('Year / result (e.g. 2025 · commendation)', 'वर्ष / परिणाम'), maxLength: 60 }],
    validate: function (x) { if (x.kind === 'Other' && String(x.other || '').trim().length < 2) return fpoT('Type the name.', 'नाम लिखें।'); return null; } });
  if (!v) return;
  var name = v.kind === 'Other' ? String(v.other).trim() : v.kind, rec = { name: name.slice(0, 60), at: new Date().toISOString(), by: M.mob || '' }; if (String(v.note || '').trim()) rec.note = String(v.note).trim().slice(0, 60);
  var id = 'c' + Date.now().toString(36);
  if (!(await fbSet('sc_facilities/' + M.code + '/certs/' + id, rec))) { showToast(fpoT('Could not save — check the connection.', 'सहेजा नहीं जा सका।'), 'err'); return; }
  if (_fpo.fac) { _fpo.fac.certs = _fpo.fac.certs || {}; _fpo.fac.certs[id] = rec; } fpoRender(); showToast(fpoT('Added.', 'जोड़ा गया।'), 'ok');
}
async function fpoCertDel(id) {
  var M = fpoCtx(); if (!M || !M.ic) return;
  var ok = await scDialog({ title: fpoT('Remove this?', 'हटाएँ?'), icon: '🗑', okLabel: fpoT('Remove', 'हटाएँ'), message: ((M.f.certs || {})[id] || {}).name || '' }); if (!ok) return;
  if (!(await fbSet('sc_facilities/' + M.code + '/certs/' + id, null))) { showToast(fpoT('Could not remove.', 'हटाया नहीं जा सका।'), 'err'); return; }
  if (_fpo.fac && _fpo.fac.certs) delete _fpo.fac.certs[id]; fpoRender();
}

// ── wall poster (A4, Hindi; QR → poster check page) ──
function fpoPosterHTML() {
  return '<div class="fpo-card"><h3>' + fpoE(fpoT('Wall poster for patients', 'मरीज़ों के लिए दीवार पोस्टर')) + '<small>' + fpoE(fpoT('A4 · English', 'A4 · हिंदी')) + '</small></h3><p class="fpo-jt">' + fpoE(fpoT('Readiness, date and a QR code to check it. Print it for the waiting area.', 'तैयारी, तारीख और जाँच के लिए QR कोड। प्रतीक्षा क्षेत्र के लिए प्रिंट करें।')) + '</p>'
    + '<button type="button" class="fpo-ghost" onclick="fpoPoster(\'pdf\')">⬇ ' + fpoE(fpoT('Download poster (PDF)', 'पोस्टर डाउनलोड (PDF)')) + '</button></div>';
}
function fpoVerifyUrl(pid) { var b = (typeof _nfImp !== 'undefined' && _nfImp.cfg && _nfImp.cfg.verifyBase) || (typeof NF_IMP_VERIFY !== 'undefined' ? NF_IMP_VERIFY : 'https://app.thehealsol.com/'); return b + (b.indexOf('?') >= 0 ? '&' : '?') + 'cert=FAC-' + encodeURIComponent(pid || ''); }
async function fpoPosterCanvas(M) {
  var P = _fpo.prof || {}, f = M.f || {}, W = 1240, H = 1754, c = document.createElement('canvas'); c.width = W; c.height = H; var g = c.getContext('2d'); if (!g) return null;
  // 18 Nov 2026: the poster and the "Save picture" image follow the app's language (English or हिंदी)
  var hi = fpoHi(), T = function (en, h) { return hi ? h : en; };
  var F = hi ? '"Noto Sans Devanagari","Poppins","Mangal",sans-serif' : '"Poppins","Noto Sans Devanagari",sans-serif';
  var tn = (hi ? { sc: 'उप-स्वास्थ्य केंद्र', uphc: 'शहरी प्राथमिक स्वास्थ्य केंद्र', phc: 'प्राथमिक स्वास्थ्य केंद्र', chc: 'सामुदायिक स्वास्थ्य केंद्र' } : { sc: 'Sub-Centre', uphc: 'Urban Primary Health Centre', phc: 'Primary Health Centre', chc: 'Community Health Centre' })[M.t] || T('Health facility', 'स्वास्थ्य केंद्र');
  var ok = P.status === 'ready' || P.status === 'certified', R = typeof nfImpRound === 'function' ? nfImpRound : function (g, x, y, w, h) { g.beginPath(); g.rect(x, y, w, h); };
  var wrap = function (t, x, y, max, lh) { var w = String(t || '').split(' '), line = '', yy = y; w.forEach(function (word) { var test = line ? line + ' ' + word : word; if (g.measureText(test).width > max && line) { g.fillText(line, x, yy); line = word; yy += lh; } else line = test; }); if (line) g.fillText(line, x, yy); return yy; };
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
  var grd = g.createLinearGradient(0, 0, W, 520); grd.addColorStop(0, '#144D44'); grd.addColorStop(1, '#2A8A79'); g.fillStyle = grd; g.fillRect(0, 0, W, 520);
  var B = typeof SC_BRAND !== 'undefined' ? SC_BRAND : {}, li = function (src) { var L = typeof nfImpLoadImg === 'function' ? nfImpLoadImg(src) : Promise.resolve(null); return Promise.race([L, new Promise(function (r) { setTimeout(function () { r(null); }, 4000); })]); };
  var l1 = await li(B.logoNqas), l2 = await li(B.logoHealsol);
  // logo strip: each logo fits in its own half (no overlap, no stretching); the name 'NQAS | FAST' is only drawn when there is room
  g.fillStyle = '#fff'; R(g, 60, 50, W - 120, 120, 24); g.fill();
  var half = (W - 120 - 90) / 2, fit = function (im, maxW) { var h = 84, w = h * im.width / im.height; if (w > maxW) { w = maxW; h = w * im.height / im.width; } return { w: w, h: h }; };
  var used = 0; if (l1) { var s1 = fit(l1, half); g.drawImage(l1, 90, 110 - s1.h / 2, s1.w, s1.h); used += s1.w; } if (l2) { var s2 = fit(l2, half); g.drawImage(l2, W - 90 - s2.w, 110 - s2.h / 2, s2.w, s2.h); used += s2.w; }
  // 18 Nov 2026: the name goes in the real gap between the two logos (it overlapped the HealSol logo when the logos differ in width)
  var gapL = 90 + (l1 ? s1.w : 0) + 30, gapR = W - 90 - (l2 ? s2.w : 0) - 30;
  g.textAlign = 'center'; g.font = 'bold 40px ' + F; if (gapR - gapL >= g.measureText('NQAS | FAST').width) { g.fillStyle = '#144D44'; g.fillText('NQAS | FAST', (gapL + gapR) / 2, 124); }
  g.fillStyle = '#fff'; g.font = 'bold 66px ' + F; var ny = wrap(f.name || M.code, W / 2, (g.measureText(f.name || M.code).width > W - 160) ? 285 : 315, W - 160, 78);
  g.font = '34px ' + F; g.globalAlpha = 0.92; g.fillText([tn, f.block, f.district].filter(Boolean).join(' · '), W / 2, Math.min(ny + 82, 470)); g.globalAlpha = 1;
  g.fillStyle = '#144D44'; g.font = 'bold 74px ' + F; var head = ok ? (P.status === 'certified' ? T('This facility is NQAS certified', 'यह केंद्र NQAS प्रमाणित है') : T('This facility is ready for NQAS', 'यह केंद्र NQAS के लिए तैयार है')) : T('Working towards quality', 'यह केंद्र गुणवत्ता की ओर');
  for (var fs = 74; g.measureText(head).width > W - 140 && fs > 40; fs -= 4) g.font = 'bold ' + fs + 'px ' + F; g.fillText(head, W / 2, 660);
  g.fillStyle = '#374151'; g.font = '36px ' + F; g.fillText(T('We are improving your care as per the', 'हम राष्ट्रीय गुणवत्ता आश्वासन मानकों (NQAS) के अनुसार'), W / 2, 740); g.fillText(T('National Quality Assurance Standards (NQAS)', 'आपकी देखभाल को बेहतर बना रहे हैं'), W / 2, 790);
  if (P.pct != null) {
    g.fillStyle = '#E8F5F2'; R(g, 160, 860, W - 320, 300, 30); g.fill();
    g.fillStyle = '#144D44'; g.font = 'bold 130px ' + F; g.fillText(Math.round(P.pct) + '%', W / 2, 1020);
    g.font = '36px ' + F; g.fillStyle = '#374151'; g.fillText(T('Quality readiness', 'गुणवत्ता तैयारी') + (P.base != null ? T(' (' + Math.round(P.base) + '% at the start)', ' (शुरुआत में ' + Math.round(P.base) + '%)') : ''), W / 2, 1090);
    g.font = '28px ' + F; g.fillStyle = '#6B7280'; g.fillText(T('Date: ', 'दिनांक: ') + new Date().toLocaleDateString(hi ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), W / 2, 1138);
  }
  var care = fpoCare(M);
  if (care) { g.fillStyle = '#D4891A'; g.font = 'bold 38px ' + F; wrap(care, W / 2, 1240, W - 200, 50); }
  try { var q = qrcode(0, 'M'); q.addData(fpoVerifyUrl(P.pid)); q.make(); var n = q.getModuleCount(), qs = 290, cell = qs / n, qx = W / 2 - qs / 2, qy = 1335;
    g.fillStyle = '#0F172A'; for (var r = 0; r < n; r++) for (var cc = 0; cc < n; cc++) if (q.isDark(r, cc)) g.fillRect(qx + cc * cell, qy + r * cell, Math.ceil(cell), Math.ceil(cell)); } catch (e) {}
  g.fillStyle = '#6B7280'; g.font = '26px ' + F; g.fillText(T('Scan the QR code to check · Based on the NQAS standards', 'जाँचने के लिए QR स्कैन करें · NQAS मानकों पर आधारित'), W / 2, 1672);
  g.fillText('NQAS | FAST · HealSol Academy', W / 2, 1712);
  g.strokeStyle = '#2A8A79'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
  return c;
}
async function fpoPoster(kind) {
  var M = fpoCtx(); if (!M) return; if (!_fpo.prof || !_fpo.prof.pid) { showToast(fpoT('The poster is ready after the first night in the programme.', 'पोस्टर कार्यक्रम की पहली रात के बाद तैयार होगा।'), 'err'); return; }
  try { if (document.fonts && document.fonts.ready) await document.fonts.ready; } catch (e) {}
  var c = await fpoPosterCanvas(M); if (!c) return; var url = c.toDataURL('image/jpeg', 0.9), nm = 'NQAS-' + String((M.f && M.f.name) || M.code).replace(/[^A-Za-z0-9]+/g, '-');
  if (kind === 'jpg') { var a = document.createElement('a'); a.href = url; a.download = nm + '.jpg'; document.body.appendChild(a); a.click(); a.remove(); return; }
  try { var J = await nfLoadPdf(), doc = new J({ orientation: 'p', unit: 'mm', format: 'a4', compress: true }); doc.addImage(url, 'JPEG', 0, 0, 210, 297); doc.save(nm + '-poster.pdf'); }
  catch (e) { showToast(fpoT('Could not make the PDF — saving a picture instead.', 'PDF नहीं बना — चित्र सहेज रहे हैं।'), 'err'); fpoPoster('jpg'); }
}

// ── Quality Stars ──
function fpoAreaKey(l) { var A = (_fpo.prof && _fpo.prof.areas) || null; return A ? A[l] : null; }
async function fpoLoadStars() {
  var l = _fpo.lvl, k = fpoAreaKey(l); if (!k) { fpoStarsPaint(); return; }
  var id = l + '/' + k; if (!(id in _fpo.L)) { try { _fpo.L[id] = await fbGet('sc_leaders/' + id); } catch (e) { _fpo.L[id] = null; } }
  fpoStarsPaint();
}
function fpoStarsPaint() { var h = document.getElementById('fpo-stars'), M = fpoCtx(); if (h && M) h.innerHTML = fpoStarsHTML(M); }
function fpoSetLvl(l) { _fpo.lvl = l; fpoStarsPaint(); fpoLoadStars(); }
function fpoStarsHTML(M) {
  var A = (_fpo.prof && _fpo.prof.areas) || {}, l = _fpo.lvl, k = A[l], d = k ? _fpo.L[l + '/' + k] : undefined, f = M.f || {};
  var mon = new Date().toLocaleDateString(fpoHi() ? 'hi-IN' : 'en-IN', { month: 'long', year: 'numeric' });
  var seg = '<div class="fpo-seg">' + [['b', fpoT('Block', 'ब्लॉक'), A.bn], ['d', fpoT('District', 'ज़िला'), A.dn], ['s', fpoT('State', 'राज्य'), A.sn]].map(function (x) { return '<button type="button" class="' + (l === x[0] ? 'on' : '') + '" onclick="fpoSetLvl(\'' + x[0] + '\')">' + fpoE(x[1]) + (l === x[0] && x[2] ? ' · ' + fpoE(x[2]) : '') + '</button>'; }).join('') + '</div>';
  var h = '<div class="fpo-card"><h3>' + fpoE(fpoT('Quality Stars', 'क्वालिटी स्टार्स')) + ' 🌟<small>' + fpoE(mon) + '</small></h3>' + seg;
  if (!_fpo.prof || (!k && !(_fpo.prof || {}).none)) return h + '<p class="fpo-dim">' + fpoE(fpoT('Loading…', 'लोड हो रहा है…')) + '</p></div>';
  if (!k) return h + '<p class="fpo-dim">' + fpoE(fpoT('Quality Stars appear after your first night in the programme.', 'क्वालिटी स्टार्स कार्यक्रम की पहली रात के बाद दिखेंगे।')) + '</p></div>';
  if (d === undefined) return h + '<p class="fpo-dim">' + fpoE(fpoT('Loading…', 'लोड हो रहा है…')) + '</p></div>';
  if (!d || d.few) return h + '<p class="fpo-dim">' + fpoE(fpoT('Quality Stars appear when 3 or more facilities in this area are in the programme. Try the district or state.', 'जब इस क्षेत्र के 3 या अधिक केंद्र कार्यक्रम में हों, तब क्वालिटी स्टार्स दिखेंगे। ज़िला या राज्य देखें।')) + '</p></div>';
  var tn = function (t) { return ((typeof NF_LEVELS !== 'undefined' && NF_LEVELS[t]) || {}).short || String(t || 'sc').toUpperCase(); };
  var med = ['🥇', '🥈', '🥉'], mine = function (e) { return e.name && e.name === f.name && (e.block || '') === (f.block || ''); };
  if ((d.improved || []).length) h += '<div class="fpo-sub">' + fpoE(fpoT('Most improved facilities', 'सबसे अधिक सुधार')) + '</div>' + d.improved.map(function (e, i) {
    return '<div class="fpo-lead"><span class="fpo-md">' + med[i] + '</span><span class="fpo-mn">' + fpoE(e.name || fpoT('A ' + tn(e.type) + ' in ' + (e.block || 'this area'), (e.block || '') + ' का एक ' + tn(e.type))) + '<small>' + fpoE([e.block, tn(e.type)].filter(Boolean).join(' · ')) + (mine(e) ? ' · <b>' + fpoE(fpoT('your facility', 'आपका केंद्र')) + '</b>' : '') + '</small></span><span class="fpo-v">+' + e.gain + '<small>' + fpoE(fpoT('points', 'अंक')) + '</small></span></div>'; }).join('');
  if (d.ready && d.ready.n) { var nm = (d.ready.names || []).filter(Boolean); h += '<div class="fpo-sub">' + fpoE(fpoT('NQAS Ready', 'NQAS तैयार')) + '</div><div class="fpo-lead"><span class="fpo-md g">✅</span><span class="fpo-mn">' + fpoE(nm.slice(0, 3).join(' · ') || fpoT(d.ready.n + ' facilities', d.ready.n + ' केंद्र')) + '<small>' + fpoE(fpoT(d.ready.n + ' ' + (d.ready.n === 1 ? 'facility has' : 'facilities have') + ' reached NQAS Ready', d.ready.n + ' केंद्र NQAS तैयार')) + '</small></span></div>'; }
  if ((d.staff || []).length) h += '<div class="fpo-sub">' + fpoE(fpoT('Top quality staff', 'शीर्ष गुणवत्ता कर्मी')) + '</div>' + d.staff.map(function (x) {
    var lv = typeof NF_LEVEL !== 'undefined' && NF_LEVEL[x.level] ? NF_LEVEL[x.level].ic + ' ' + nfImpLv(x.level) : '';
    return '<div class="fpo-lead"><span class="fpo-md v">⭐</span><span class="fpo-mn">' + fpoE(x.name) + (x.role ? ' · ' + fpoE(x.role) : '') + '<small>' + fpoE([x.fac, x.helped ? fpoT('helped ' + x.helped + ' facilities', x.helped + ' केंद्रों की मदद') : '', lv].filter(Boolean).join(' · ')) + '</small></span><span class="fpo-v st">' + nfImpStars(x.stars) + '</span></div>'; }).join('');
  if (!(d.improved || []).length && !(d.ready && d.ready.n) && !(d.staff || []).length) h += '<p class="fpo-dim">' + fpoE(fpoT('The first Quality Stars appear once facilities finish their baseline.', 'बेसलाइन पूरी होने के बाद पहले क्वालिटी स्टार्स दिखेंगे।')) + '</p>';
  var R = _fpo.prof.rank; if (R && R.n) h += '<div class="fpo-you">🎯 ' + fpoE(fpoT((f.name || 'Your facility') + ' is #' + R.n + ' most improved in ' + R.area + ' (+' + R.gain + ' points).', (f.name || 'आपका केंद्र') + ' ' + R.area + ' में सुधार में #' + R.n + ' है (+' + R.gain + ' अंक)।')) + '</div>';
  if (M.mob) h += '<label class="fpo-opt"><input type="checkbox" ' + (_fpo.opt ? '' : 'checked') + ' onchange="fpoOptSet(!this.checked)"> ' + fpoE(fpoT('Show my name in Quality Stars and on the HealSol impact page', 'क्वालिटी स्टार्स और HealSol इम्पैक्ट पेज पर मेरा नाम दिखाएँ')) + '</label>';
  return h + '<p class="fpo-upd">' + fpoE(fpoT('Recognition only · first name and initial · updated every night', 'केवल सम्मान · नाम का पहला भाग · हर रात अपडेट')) + '</p></div>';
}
async function fpoOptSet(out) {
  var M = fpoCtx(); if (!M || !M.mob) return;
  var ok = await fbSet('sc_impact_optout/' + M.mob, out ? true : null);
  if (!ok) { showToast(fpoT('Could not save.', 'सहेजा नहीं जा सका।'), 'err'); fpoStarsPaint(); return; }
  _fpo.opt = !!out; showToast(out ? fpoT('Your name will be left out from tomorrow.', 'कल से आपका नाम नहीं दिखेगा।') : fpoT('Your name can be shown from tomorrow.', 'कल से आपका नाम दिख सकता है।'), 'ok');
}
function fpoPartnerHTML(M) {
  var f = M.f || {}, PL = typeof nfImpPartnersFor === 'function' ? nfImpPartnersFor({ facilities: [{ state: f.state, district: f.district }] }) : [];
  return '<div class="fpo-partner">NQAS | FAST · <b>HealSol Academy</b>' + (PL.length ? '<div>' + fpoE(fpoT('In partnership with', 'सहयोग से')) + ' ' + PL.map(function (p) { return '<img src="' + fpoE(p.img) + '" alt="' + fpoE(p.name || 'Partner') + '">'; }).join('') + '</div>' : '')
    + '<small>' + fpoE(fpoT('Checklists based on NHSRC, MoHFW NQAS standards', 'NHSRC, MoHFW के NQAS मानकों पर आधारित')) + '</small></div>';
}

// ── poster check page (QR): ?cert=FAC-<id> or ?poster=<id> ──
async function fpoVerifyBoot() {
  var id = ''; try { var q = new URLSearchParams(location.search), c = (q.get('cert') || '').trim(); id = (q.get('poster') || '').trim() || (/^FAC-/i.test(c) ? c.slice(4) : ''); id = id.toLowerCase(); } catch (e) {} if (!/^[a-f0-9]{8,20}$/.test(id)) return false;
  var B = typeof SC_BRAND !== 'undefined' ? SC_BRAND : {}, pg = document.createElement('div'); pg.id = 'nf-verify'; pg.className = 'nfi-vp'; pg.innerHTML = '<div class="nfv-st">Checking…</div>'; document.body.appendChild(pg);
  try { if (typeof db === 'undefined' || !db) initFirebase(); } catch (e) {} for (var i = 0; i < 50 && (typeof db === 'undefined' || !db); i++) await new Promise(function (r) { setTimeout(r, 100); });
  var r = null; try { r = await fbGet('sc_fac_public/' + id); } catch (e) {}
  var tn = r ? (((typeof NF_LEVELS !== 'undefined' && NF_LEVELS[r.type]) || {}).name || 'Facility') : '', st = r ? (r.status === 'certified' ? 'NHSRC certified' : r.status === 'ready' ? 'NQAS Ready' : 'Working towards NQAS') : '';
  pg.innerHTML = nfVTop()
    + (r ? '<div class="nfi-v"><div class="nfi-ok"><i class="ti ti-shield-check"></i>Genuine NQAS | FAST facility poster</div><h2>' + fpoE(r.name || ('A ' + tn)) + '</h2><p style="font-size:13.5px;color:#334155;margin:6px 0;">' + fpoE([tn, r.block, r.district, r.state].filter(Boolean).join(' · ')) + '</p>'
      + '<p style="font-weight:700;color:#0F766E;font-size:16px;margin:8px 0;">' + fpoE(st) + '</p>' + (r.pct != null ? '<p style="font-size:14px;margin:6px 0;">Readiness <b>' + Math.round(r.pct) + '%</b>' + (r.base != null ? ' (baseline ' + Math.round(r.base) + '%)' : '') + '</p>' : '')
      + '<p class="nfi-upd">Worked out by HealSol Academy from programme data · updated ' + fpoE(String(r.at || '').slice(0, 10)) + '</p></div>'
      : '<div class="nfv-st no"><i class="ti ti-alert-triangle"></i><div><b>Poster not found</b><small>This poster could not be checked. Ask the facility for a new one from the app.</small></div></div>')
    + '<div class="nfv-foot">' + nfVBy() + '</div>';
  return true;
}
(function () { var go = function () { fpoVerifyBoot(); }; if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else setTimeout(go, 0); })();

// ── wiring: entry chip on Today + once a day ──
function fpoChipHTML() { return '<button type="button" class="fpo-chip" id="fpo-chip" onclick="fpoOpen()">🏥 ' + fpoE(fpoT('Facility profile', 'केंद्र प्रोफ़ाइल')) + ' ›</button>'; }
(function () {
  if (typeof nfRenderToday === 'function') { var o = nfRenderToday; nfRenderToday = function () { var r = o.apply(this, arguments);
    try { if (typeof nfIsStaff === 'function' && nfIsStaff()) { var top = document.querySelector('#nf-today .nf-top-l'); if (top && !document.getElementById('fpo-chip')) top.insertAdjacentHTML('beforeend', fpoChipHTML()); setTimeout(fpoAuto, 300); } } catch (e) { console.warn('[profile]', e); } return r; }; }
  if (typeof ndRender === 'function') { var d = ndRender; ndRender = function () { var r = d.apply(this, arguments);
    try { if (_nd && _nd.fac && !_nd.view && _nd.tab === 'today' && !_nd.card && !_nd.screen && !(typeof ndFaOn === 'function' && ndFaOn())) { var top = document.querySelector('.nx'); if (top && !document.getElementById('fpo-chip')) top.insertAdjacentHTML('afterbegin', '<div class="fpo-chiprow">' + fpoChipHTML() + '</div>'); setTimeout(fpoAuto, 300); } } catch (e) { console.warn('[profile]', e); } return r; }; }
})();

// 18 Nov 2026: the certificate check (cert.js) also answered ?cert=FAC-… and covered this page with "Certificate not found" — it now leaves FAC- to the poster page above
(function () {
  var isFac = function () { try { return /^FAC-/i.test((new URLSearchParams(location.search).get('cert') || '').trim()); } catch (e) { return false; } };
  if (typeof nfVerifyBoot === 'function') { var oV = nfVerifyBoot; nfVerifyBoot = function () { if (isFac()) return Promise.resolve(false); return oV.apply(this, arguments); }; }
})();
