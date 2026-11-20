// ══════════════════════════════════════════════════════════════
// PROMOTIONS CAROUSEL + ONE HEALSOL (4 Nov 2026)
//   HealSol: Settings → Programme rules → "Promotions": slides (picture, title and text in English / Hindi, a button that opens
//   One HealSol, the Play Store, a web page or the Facility Profile), who sees them (all staff / in-charges; facility types;
//   states), start and end dates, order, on / off, "website only" (hidden in the Play Store app), views and taps per slide.
//   Templates: New offer · Launch announcement · NQAS SELF learning (One HealSol) · Become a Quality Champion · Event / webinar.
//   Staff: a swipeable carousel on the Facility Profile (after "Our impact") and at the top of Me — up to 5 slides, moves every
//   6 s, each slide can be closed for 7 days. Me also has a fixed "NQAS SELF learning — One HealSol app" card.
//   Data: shared/sc_promos/{id} (HealSol writes, signed-in read); sc_promo_stats/{id}/{YYYY-MM}/{v|c} (counts, +1 at a time).
// ══════════════════════════════════════════════════════════════
var NF_ONEHEALSOL = 'https://play.google.com/store/apps/details?id=branded.mef9b5c3432024e5cb5c041e243a0dc1e.ayushmanbharat';
var _pm = { list: null, at: 0, i: 0, timer: null, seen: {} };
function pmHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function pmT(en, hi) { return pmHi() && hi ? hi : en; }
function pmE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function pmLS(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
function pmToday() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
// the Play Store app opens the site with ?src=play (Trusted Web Activity start URL); remembered for the visit
function nfIsPlay() { try { if (/[?&]src=play\b/.test(location.search || '') || /^android-app:\/\/com\.thehealsol\.(?:nqasfast|qifast)(\/|$)/.test(document.referrer || '')) sessionStorage.setItem('nf_play', '1'); return sessionStorage.getItem('nf_play') === '1'; } catch (e) { return false; } }   // only our Play app (TWA opens with this referrer); Gmail / WhatsApp links stay the website
async function pmLoad(force) {
  if (!force && _pm.list && Date.now() - _pm.at < 10 * 60e3) return _pm.list;
  var P = null; try { P = await fbGet('shared/sc_promos'); } catch (e) {}
  _pm.list = Object.keys(P || {}).map(function (k) { return Object.assign({ id: k }, P[k]); }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); }); _pm.at = Date.now(); return _pm.list;
}
function pmViewer() {
  var M = typeof rgMyFac === 'function' ? rgMyFac() : null; if (!M) return null;
  var t = typeof nfTypeOf === 'function' ? nfTypeOf(M.f || {}) : 'sc', ic = typeof rgIsInCharge === 'function' && rgIsInCharge();
  return { type: t, ic: !!ic, state: String((M.f && M.f.state) || '').toLowerCase() };
}
function pmFor(V) {
  var today = pmToday(), play = nfIsPlay();
  return (_pm.list || []).filter(function (p) {
    if (!p || p.on === false) return false; if (p.from && today < p.from) return false; if (p.to && today > p.to) return false;
    if (play && (p.webOnly || p.tag === 'Offer' || /₹|\bprice|\boffer|discount|\bpay|subscri|unlock|early.?bird/i.test([p.titleEn, p.textEn, p.cta].join(' ')))) return false;   // Google Play app: no prices or offers
    if (V) { if (p.who === 'incharge' && !V.ic) return false; if ((p.types || []).length && p.types.indexOf(V.type) < 0) return false;
      if ((p.states || []).length && p.states.map(function (s) { return String(s).toLowerCase(); }).indexOf(V.state) < 0) return false; }
    var d = +pmLS('pm_x_' + p.id) || 0; if (d && Date.now() - d < 7 * 864e5) return false;
    return true;
  }).slice(0, 5);
}
function pmGo(id) {
  var p = (_pm.list || []).find(function (x) { return x.id === id; }); if (!p) return; pmCount(id, 'c');
  if (p.act === 'profile' && typeof fpoOpen === 'function') { fpoOpen(); return; }
  if (p.act === 'champion') { pmChampApply(); return; }
  var url = p.act === 'onehealsol' ? NF_ONEHEALSOL : p.url; if (!url || !/^https:\/\//.test(url)) return;
  var a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove();
}
function pmClose(id) { pmLS('pm_x_' + id, String(Date.now())); pmPaint(); }
function pmCount(id, k) { try { var m = new Date().toISOString().slice(0, 7); db.ref('sc_promo_stats/' + id + '/' + m + '/' + k).transaction(function (n) { return (Number(n) || 0) + 1; }).catch(function () {}); } catch (e) {} }
function pmSlideHTML(p) {
  var hi = pmHi(), title = hi && p.titleHi ? p.titleHi : p.titleEn, text = hi && p.textHi ? p.textHi : p.textEn, btn = hi && p.btnHi ? p.btnHi : (p.btnEn || pmT('Open', 'खोलें'));
  return '<div class="pm-sl' + (p.img ? ' im' : '') + '" style="--pmc:' + pmE(p.color || '#1E6B5E') + '" data-id="' + pmE(p.id) + '">'
    + (p.img ? '<img src="' + pmE(p.img) + '" alt="" loading="lazy">' : '')
    + '<div class="pm-tx"><span class="pm-tag">' + pmE(p.tag || '') + '</span><b>' + pmE(title || '') + '</b>' + (text ? '<small>' + pmE(text) + '</small>' : '')
    + (p.act && p.act !== 'none' ? '<button type="button" onclick="pmGo(\'' + pmE(p.id) + '\')">' + pmE(btn) + ' ›</button>' : '') + '</div>'
    + '<button type="button" class="pm-x" aria-label="' + pmE(pmT('Hide for 7 days', '7 दिन के लिए छिपाएँ')) + '" onclick="pmClose(\'' + pmE(p.id) + '\')">×</button></div>';
}
function pmHTML(L) {
  if (!L.length) return '';
  return '<div class="pm-car" role="region" aria-label="' + pmE(pmT('News and offers', 'समाचार और ऑफ़र')) + '"><div class="pm-track" onscroll="pmOnScroll(this)">' + L.map(pmSlideHTML).join('') + '</div>'
    + (L.length > 1 ? '<div class="pm-dots">' + L.map(function (p, i) { return '<i class="' + (i ? '' : 'on') + '"></i>'; }).join('') + '</div>' : '') + '</div>';
}
function pmOnScroll(tr) { var i = Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)); var d = tr.parentNode.querySelectorAll('.pm-dots i'); d.forEach(function (x, j) { x.className = j === i ? 'on' : ''; }); pmSeen(tr, i); }
function pmSeen(tr, i) { var s = tr.children[i]; if (!s) return; var id = s.getAttribute('data-id'), k = id + '|' + pmToday(); if (_pm.seen[k]) return; _pm.seen[k] = 1; pmCount(id, 'v'); }
function pmAuto() { if (_pm.timer) clearInterval(_pm.timer); _pm.timer = setInterval(function () { document.querySelectorAll('.pm-track').forEach(function (tr) { if (tr.matches(':hover') || !tr.offsetParent || tr.children.length < 2) return;
  var i = Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth)), n = (i + 1) % tr.children.length; try { tr.scrollTo({ left: n * tr.clientWidth, behavior: 'smooth' }); } catch (e) { tr.scrollLeft = n * tr.clientWidth; } }); }, 6000); }
async function pmPaint() {
  var hosts = document.querySelectorAll('.pm-host'); if (!hosts.length) return;
  await pmLoad(); var L = pmFor(pmViewer()), h = pmHTML(L);
  document.querySelectorAll('.pm-host').forEach(function (el) { el.innerHTML = h; var tr = el.querySelector('.pm-track'); if (tr) pmSeen(tr, 0); });
  pmAuto();
}
function pmHostHTML() { return '<div class="pm-host"></div>'; }
// Quality Champion application from inside the app (same request as the login screen's "Become a Quality Champion")
async function pmChampApply() {
  var M = typeof rgMyFac === 'function' ? rgMyFac() : null, f = (M && M.f) || {}, mob = ''; try { mob = (_nfAuth && _nfAuth.claims && _nfAuth.claims.mob) || ''; } catch (e) {}
  var st = (f.staff || {})[mob] || {};
  var v = await scDialog({ title: pmT('Become a Quality Champion', 'क्वालिटी चैंपियन बनें'), icon: '🏅', okLabel: pmT('Send', 'भेजें'), message: pmT('HealSol Academy will call the people it selects.', 'चुने गए लोगों से HealSol Academy संपर्क करेगा।'),
    fields: [{ key: 'years', label: pmT('Years of experience', 'अनुभव (वर्ष)'), type: 'select', value: '3-5', options: [['0-2', '0–2'], ['3-5', '3–5'], ['6-10', '6–10'], ['10+', '10+']].map(function (x) { return { value: x[0], label: x[1] }; }) },
      { key: 'nqas', label: pmT('Your facility and NQAS', 'आपका केंद्र और NQAS'), type: 'select', value: 'process', options: [{ value: 'certified', label: pmT('Certified', 'प्रमाणित') }, { value: 'process', label: pmT('In process', 'प्रक्रिया में') }, { value: 'no', label: pmT('Not yet', 'अभी नहीं') }] },
      { key: 'langs', label: pmT('Languages you speak', 'आप कौन सी भाषाएँ बोलते हैं'), value: 'Hindi, English', maxLength: 80 },
      { key: 'why', label: pmT('Why you (2 lines)', 'आप क्यों (2 पंक्तियाँ)'), type: 'textarea', maxLength: 300 }] });
  if (!v) return;
  try { var r = await nfCall('submitEnquiry', { source: 'champion', orgName: f.name || '', ftype: typeof nfTypeOf === 'function' ? nfTypeOf(f) : 'sc', nin: String(f.nin || '').replace(/\D/g, ''), state: f.state || '', district: f.district || '', block: f.block || '',
      contactName: st.name || '', designation: st.role || '', mobile: mob, years: v.years, nqas: v.nqas, langs: v.langs || '', reach: '', message: v.why || '' });
    showToast(pmT('Application sent', 'आवेदन भेजा गया') + (r && r.ref ? ' · ' + r.ref : ''), 'ok'); } catch (e) { showToast(String(e.message || e), 'err'); }
}
// One HealSol (NQAS SELF learning) on Me
function pmOneHTML() {
  return '<a class="pm-one" id="pm-one" href="' + pmE(NF_ONEHEALSOL) + '" target="_blank" rel="noopener"><span class="pm-one-i">📚</span><span><b>' + pmE(pmT('NQAS SELF learning', 'NQAS SELF सीखना')) + '</b><small>'
    + pmE(pmT('Short video modules for every role — in the One HealSol app', 'हर भूमिका के लिए छोटे वीडियो मॉड्यूल — One HealSol ऐप में')) + '</small></span><span class="pm-one-b">' + pmE(pmT('Open', 'खोलें')) + ' ›</span></a>';
}

// ── wiring: Facility Profile and Me ──
(function () {
  if (typeof fpoImpactHTML === 'function') { var o = fpoImpactHTML; fpoImpactHTML = function () { return o.apply(this, arguments) + pmHostHTML(); }; }
  if (typeof fpoRender === 'function') { var r = fpoRender; fpoRender = function () { var x = r.apply(this, arguments); try { pmPaint(); } catch (e) {} return x; }; }
  if (typeof nfRenderMe === 'function') { var m = nfRenderMe; nfRenderMe = function () { var x = m.apply(this, arguments);
    try { var p = document.getElementById('nf-me'); if (p && !p.querySelector('.pm-host')) { var h = p.querySelector('.nf-ph'); var html = pmHostHTML() + pmOneHTML(); if (h) h.insertAdjacentHTML('afterend', html); else p.insertAdjacentHTML('afterbegin', html); pmPaint(); } } catch (e) {} return x; }; }
  if (typeof ndRender === 'function') { var d = ndRender; ndRender = function () { var x = d.apply(this, arguments);
    try { if (_nd && _nd.tab === 'me' && !_nd.view && !_nd.card && !_nd.screen) { var top = document.querySelector('.nx'); if (top && !top.querySelector('.pm-host')) { top.insertAdjacentHTML('afterbegin', pmHostHTML() + pmOneHTML()); pmPaint(); } } } catch (e) {} return x; }; }
})();

// ── HealSol: Settings → Programme rules → Promotions ──
var PM_TPL = {
  offer: { tag: 'Offer', titleEn: 'Early-bird price for the first 500 facilities', textEn: 'Unlock the full programme at the launch price before the places run out.', titleHi: 'पहले 500 केंद्रों के लिए अर्ली-बर्ड कीमत', textHi: 'जगहें खत्म होने से पहले लॉन्च कीमत पर पूरा कार्यक्रम अनलॉक करें।', btnEn: 'Learn more', btnHi: 'और जानें', act: 'link', url: 'https://app.thehealsol.com/legal.html#about', color: '#B45309', webOnly: true },
  launch: { tag: 'Launch', titleEn: 'NQAS | FAST launches on 20 November 2026', textEn: 'The first batch starts together. Make sure your whole team has logged in.', titleHi: 'NQAS | FAST का शुभारंभ 20 नवंबर 2026', textHi: 'पहला बैच एक साथ शुरू होगा। सुनिश्चित करें कि पूरी टीम ने लॉग इन किया है।', btnEn: 'My facility', btnHi: 'मेरा केंद्र', act: 'profile', color: '#1E6B5E' },
  learning: { tag: 'Learning', titleEn: 'NQAS SELF — learn at your own pace', textEn: 'Short video modules for every role in the One HealSol app.', titleHi: 'NQAS SELF — अपनी गति से सीखें', textHi: 'One HealSol ऐप में हर भूमिका के लिए छोटे वीडियो मॉड्यूल।', btnEn: 'Open One HealSol', btnHi: 'One HealSol खोलें', act: 'onehealsol', color: '#6D4AA8' },
  champion: { tag: 'Quality Champion', titleEn: 'Become a Quality Champion', textEn: 'Help other facilities become NQAS-ready and grow your quality career.', titleHi: 'क्वालिटी चैंपियन बनें', textHi: 'दूसरे केंद्रों को NQAS के लिए तैयार करने में मदद करें।', btnEn: 'Apply', btnHi: 'आवेदन करें', act: 'champion', color: '#0E7490' },
  event: { tag: 'Event', titleEn: 'Live session: preparing for NQAS assessment', textEn: 'Join our experts this Saturday at 4 PM.', titleHi: 'लाइव सत्र: NQAS मूल्यांकन की तैयारी', textHi: 'इस शनिवार शाम 4 बजे हमारे विशेषज्ञों से जुड़ें।', btnEn: 'Join', btnHi: 'जुड़ें', act: 'link', url: 'https://', color: '#BE185D' }
};
async function pmAdminRender() {
  var el = document.getElementById('hs-promos'); if (!el) return; var L = await pmLoad(true), S = {};
  try { S = (await fbGet('sc_promo_stats')) || {}; } catch (e) {}
  var m = new Date().toISOString().slice(0, 7), stat = function (id) { var x = ((S[id] || {})[m]) || {}; var v = x.v || 0, c = x.c || 0; return v + (v === 1 ? ' view · ' : ' views · ') + c + (c === 1 ? ' tap' : ' taps') + ' this month'; };
  el.innerHTML = '<b><i class="ti ti-speakerphone"></i> Promotions (carousel)</b><p>Slides on the Facility Profile and the Me page of facility staff: offers, launch news, NQAS SELF learning (One HealSol), Quality Champions, events. Up to 5 show at a time, in this order; each can be limited by role, facility type, state and dates. "Website only" slides are hidden in the Play Store app.</p>'
    + (L.length ? '<div class="pm-adm">' + L.map(function (p, i) { return '<div class="pm-row"><span class="pm-dot" style="background:' + pmE(p.color || '#1E6B5E') + '"></span><span class="pm-rt"><b>' + pmE(p.titleEn || '(no title)') + '</b><small>' + pmE([p.tag, p.on === false ? 'off' : 'on', p.who === 'incharge' ? 'in-charges' : 'all staff', (p.types || []).join('/').toUpperCase(), (p.states || []).join(', '), p.from || p.to ? (p.from || '…') + ' → ' + (p.to || '…') : '', p.webOnly ? 'website only' : ''].filter(Boolean).join(' · ')) + '</small><small class="pm-st">' + stat(p.id) + '</small></span>'
      + '<span class="pm-ra"><button type="button" class="hs-btn" onclick="pmMove(\'' + pmE(p.id) + '\',-1)"' + (i ? '' : ' disabled') + ' aria-label="Up">↑</button><button type="button" class="hs-btn" onclick="pmMove(\'' + pmE(p.id) + '\',1)"' + (i < L.length - 1 ? '' : ' disabled') + ' aria-label="Down">↓</button>'
      + '<button type="button" class="hs-btn" onclick="pmToggle(\'' + pmE(p.id) + '\')">' + (p.on === false ? 'Turn on' : 'Turn off') + '</button><button type="button" class="hs-btn" onclick="pmEdit(\'' + pmE(p.id) + '\')">Edit</button><button type="button" class="hs-btn" onclick="pmDel(\'' + pmE(p.id) + '\')">Delete</button></span></div>'; }).join('') + '</div>' : '<p class="hs-dim">No slides yet.</p>')
    + '<div class="iv-acts">' + Object.keys(PM_TPL).map(function (k) { return '<button type="button" class="hs-btn' + (k === 'offer' ? ' p' : '') + '" onclick="pmEdit(\'\',\'' + k + '\')">+ ' + pmE(PM_TPL[k].tag) + '</button>'; }).join('') + '</div>';
}
function pmImg(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { var im = new Image(); im.onload = function () { var w = Math.min(720, im.width), h = Math.round(im.height * w / im.width), c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h); res(c.toDataURL('image/jpeg', 0.75)); }; im.onerror = rej; im.src = r.result; }; r.onerror = rej; r.readAsDataURL(file); }); }
async function pmEdit(id, tpl) {
  var p = id ? Object.assign({}, (_pm.list || []).find(function (x) { return x.id === id; }) || {}) : Object.assign({ on: true, who: 'all' }, PM_TPL[tpl] || {});
  var v = await scDialog({ title: id ? 'Edit slide' : 'New slide — ' + (PM_TPL[tpl] || {}).tag, icon: '📣', okLabel: 'Save',
    fields: [{ key: 'tag', label: 'Label (small, above the title)', value: p.tag || '', maxLength: 24 },
      { key: 'titleEn', label: 'Title (English)', value: p.titleEn || '', required: true, maxLength: 70 }, { key: 'textEn', label: 'Text (English)', type: 'textarea', value: p.textEn || '', maxLength: 140 },
      { key: 'titleHi', label: 'Title (Hindi, optional)', value: p.titleHi || '', maxLength: 70 }, { key: 'textHi', label: 'Text (Hindi, optional)', type: 'textarea', value: p.textHi || '', maxLength: 140 },
      { key: 'btnEn', label: 'Button (English)', value: p.btnEn || '', maxLength: 24 }, { key: 'btnHi', label: 'Button (Hindi, optional)', value: p.btnHi || '', maxLength: 24 },
      { key: 'act', label: 'The button opens', type: 'select', value: p.act || 'link', options: [{ value: 'onehealsol', label: 'One HealSol app (Play Store)' }, { value: 'link', label: 'A web page (link below)' }, { value: 'profile', label: 'The Facility Profile' }, { value: 'champion', label: 'Quality Champion application (in the app)' }, { value: 'none', label: 'No button' }] },
      { key: 'url', label: 'Link (https://…)', value: p.url || '', maxLength: 300 },
      { key: 'who', label: 'Who sees it', type: 'select', value: p.who || 'all', options: [{ value: 'all', label: 'All facility staff' }, { value: 'incharge', label: 'Facility in-charges only' }] },
      { key: 'types', label: 'Facility types (empty = all)', type: 'checklist', value: p.types || [], options: [{ value: 'sc', label: 'Sub-Centre' }, { value: 'uphc', label: 'UPHC' }, { value: 'phc', label: 'PHC' }, { value: 'chc', label: 'CHC' }] },
      { key: 'states', label: 'States (comma separated, empty = all)', value: (p.states || []).join(', '), maxLength: 200 },
      { key: 'from', label: 'Show from (optional)', type: 'date', value: p.from || '' }, { key: 'to', label: 'Show until (optional)', type: 'date', value: p.to || '' },
      { key: 'color', label: 'Colour', type: 'select', value: p.color || '#1E6B5E', options: [['#1E6B5E', 'Teal'], ['#B45309', 'Amber'], ['#6D4AA8', 'Violet'], ['#0E7490', 'Blue'], ['#BE185D', 'Pink'], ['#15803D', 'Green']].map(function (c) { return { value: c[0], label: c[1] }; }) },
      { key: 'webOnly', type: 'checklist', value: p.webOnly ? ['yes'] : [], options: [{ value: 'yes', label: 'Website only (hide in the Play Store app — use for prices and paid offers)' }] },
      { key: 'pic', type: 'checklist', value: [], options: [{ value: 'pick', label: p.img ? 'Change the picture after saving' : 'Add a picture after saving' }] }],
    validate: function (x) { if (x.act === 'link' && !/^https:\/\/[^\s]{4,}$/.test(String(x.url || '').trim())) return 'Enter the link, starting with https://'; if (x.from && x.to && x.from > x.to) return '"Show until" is before "Show from".'; return null; } });
  if (!v) return;
  var rec = { tag: v.tag || '', titleEn: v.titleEn, textEn: v.textEn || '', titleHi: v.titleHi || '', textHi: v.textHi || '', btnEn: v.btnEn || '', btnHi: v.btnHi || '', act: v.act, url: v.act === 'link' ? String(v.url).trim() : '',
    who: v.who, types: v.types || [], states: String(v.states || '').split(',').map(function (s) { return s.trim(); }).filter(Boolean), from: v.from || '', to: v.to || '', color: v.color, webOnly: (v.webOnly || []).length > 0,
    on: p.on !== false, order: p.order != null ? p.order : Date.now(), img: p.img || null, at: new Date().toISOString() };
  var key = id || ('p' + Date.now().toString(36));
  if ((v.pic || []).length) { var f = await pmPickFile(); if (f) { try { rec.img = await pmImg(f); } catch (e) { showToast('Could not read that picture.', 'err'); } } }
  if (await fbSet('shared/sc_promos/' + key, JSON.parse(JSON.stringify(rec))) === false) { showToast('Could not save.', 'err'); return; }
  showToast('Slide saved.', 'ok'); pmAdminRender();
}
function pmPickFile() { return new Promise(function (res) { var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; i.onchange = function () { res(i.files && i.files[0] || null); }; i.click(); setTimeout(function () { res(null); }, 120000); }); }
async function pmToggle(id) { var p = (_pm.list || []).find(function (x) { return x.id === id; }); if (!p) return; await fbSet('shared/sc_promos/' + id + '/on', p.on === false); pmAdminRender(); }
async function pmDel(id) { if (!(await scDialog({ title: 'Delete this slide?', icon: '🗑', okLabel: 'Delete', message: ((_pm.list || []).find(function (x) { return x.id === id; }) || {}).titleEn || '' }))) return; await fbSet('shared/sc_promos/' + id, null); pmAdminRender(); }
async function pmMove(id, dir) { var L = _pm.list || [], i = L.findIndex(function (x) { return x.id === id; }), j = i + dir; if (i < 0 || j < 0 || j >= L.length) return;
  var a = L[i].order || i, b = L[j].order || j; if (a === b) b = a + dir; await fbSet('shared/sc_promos/' + L[i].id + '/order', b); await fbSet('shared/sc_promos/' + L[j].id + '/order', a); pmAdminRender(); }
(function () {
  if (typeof hspSignupRender === 'function') { var o = hspSignupRender; hspSignupRender = async function () { var r = await o.apply(this, arguments);
    try { var su = document.getElementById('hs-signup'), el = document.getElementById('hs-promos');
      if (su && !el) { el = document.createElement('div'); el.id = 'hs-promos'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); pmAdminRender(); } } catch (e) { console.warn('[promos]', e); }
    return r; }; }
  if (typeof hsSetupGroup === 'function') { var g = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-promos') return 'rules'; return g.apply(this, arguments); }; }
})();
