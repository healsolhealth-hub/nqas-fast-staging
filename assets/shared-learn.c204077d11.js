// ══════════════════════════════════════════════════════════════
// LEARN (24 Nov 2026, HealSol: canvas I7 approved, FAQ tab added)
//  Every checkpoint video in the app's language (English / Hindi links from the checkpoint list), in one place:
//  For my fixes · This week · All · FAQs. FAQs here = the assessor questions for each checkpoint, as videos
//  (checkpoint list columns "Assessor FAQ video" / "(Hindi)" → cp.faq / cp.faqHi); they also show inside each fix and
//  from the baseline day-done screen. "Watched" ticks: sc_learn/{code}/{mob}/{id} = when (cp id, aq_{cp id}, or faq_{id}).
//  App-help videos (how to use the app) are a separate list HealSol keeps in Settings → Communication → App help videos
//  (shared/sc_faq_videos); they show on Today. Videos stay out of the baseline questions (an honest first look).
// ══════════════════════════════════════════════════════════════
if (typeof SC_CPM_FIELDS !== 'undefined') SC_CPM_FIELDS.push('faq', 'faqHi');
(function () { if (typeof scCpmApply !== 'function') return; var oA = scCpmApply; scCpmApply = function (cp, id) { var r = oA.apply(this, arguments); try { var m = scCpmGet(id); if (m && r && r !== cp) { r.faq = m.faq || cp.faq || ''; r.faqHi = m.faqHi || cp.faqHi || ''; } } catch (e) {} return r; }; })();
function lrnAq(cp) { return cp && (cp.faq || cp.faqHi) ? lrnUrl(cp.faq, cp.faqHi) : null; }
var _lrn = { tab: null, w: null, faq: null, at: 0 };
function lrnT(en, hi) { return typeof _appLang !== 'undefined' && _appLang === 'hi' && hi ? hi : en; }
function lrnE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function lrnHi() { return typeof _appLang !== 'undefined' && _appLang === 'hi'; }
function lrnPath() { return choState && choState.facilityCode && choState.staffMobile ? 'sc_learn/' + choState.facilityCode + '/' + choState.staffMobile : null; }
async function lrnLoad(force) {
  if (!force && _lrn.at && Date.now() - _lrn.at < 120000) return;
  var p = lrnPath(); try { _lrn.w = p ? (await fbGet(p)) || {} : {}; } catch (e) { _lrn.w = _lrn.w || {}; }
  try { var f = await fbGet('shared/sc_faq_videos'); _lrn.faq = (f && f.items) || {}; } catch (e) { _lrn.faq = _lrn.faq || {}; }
  _lrn.at = Date.now();
}
function lrnMarkWatched(id, url) {
  var p = lrnPath(); if (!p || !id) return; var k = String(id).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60), at = new Date().toISOString();
  _lrn.w = _lrn.w || {}; _lrn.w[k] = at; try { db.ref(p + '/' + k).set(at); } catch (e) {}
  setTimeout(function () { if (document.getElementById('lrn')) lrnRender(); }, 400);
}
function lrnUrl(v, vh) { var hi = lrnHi(); return hi && vh ? { u: vh, l: 'hi' } : v ? { u: v, l: 'en', soon: hi && !vh } : vh ? { u: vh, l: 'hi' } : null; }
function lrnCps() { try { return scPkgNqas(choState.progId || 'nqas_12A').filter(function (c) { return c.video || c.videoHi; }); } catch (e) { return []; } }
function lrnWeekOf(cp) { try { return scDayGroup(cp); } catch (e) { return -1; } }
function lrnThisWeek() { var t = scb1TodayIdx(); if (t < 7) return t; if (t < 49) return Math.floor((t - 7) / 7); if (t < 56) return t - 49; return -1; }
function lrnRow(o, i) {
  var acc = (typeof BLS_ACC !== 'undefined' ? BLS_ACC : [['#1E6B5E', '#E6F2EF']])[i % 5], seen = _lrn.w && _lrn.w[o.wk];
  var lang = (o.both ? 'हिंदी · English' : o.l === 'hi' ? 'हिंदी' : 'English') + (o.soon ? lrnT(' · Hindi coming soon', ' · हिंदी जल्द') : '');
  return '<button type="button" class="lrn-row" onclick="lrnPlay(\'' + lrnE(o.kind) + '\',\'' + lrnE(o.id) + '\')"><span class="lrn-th" style="background:' + acc[0] + '">'
    + (seen ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>' : '<svg width="22" height="22" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>')
    + '<span class="lrn-du" data-vurl="' + lrnE(o.u) + '">' + lrnE((typeof _imfVid !== 'undefined' && _imfVid.dur[o.u]) || '') + '</span></span><span class="lrn-tx"><b>' + lrnE(o.t) + '</b><small class="' + (seen ? 'ok' : '') + '">' + lrnE((o.code ? o.code + ' · ' : '') + (o.aq ? lrnT('Assessor questions · ', 'आकलनकर्ता के प्रश्न · ') : '') + (seen ? lrnT('Watched', 'देखा') + ' · ' : '') + lang) + '</small></span></button>';
}
function lrnAqCps() { try { return scPkgNqas(choState.progId || 'nqas_12A').filter(function (c) { return c.faq || c.faqHi; }); } catch (e) { return []; } }
function lrnAqItem(cp) { var v = lrnAq(cp); if (!v) return null; return { kind: 'aq', id: cp.id, wk: 'aq_' + cp.id.replace(/[^A-Za-z0-9_-]/g, '_'), code: cp.id, t: (lrnHi() && cp.hi ? cp.hi : cp.t), u: v.u, l: v.l, soon: v.soon, both: !!(cp.faq && cp.faqHi), aq: true }; }
function lrnCpItem(cp) { var v = lrnUrl(cp.video, cp.videoHi); if (!v) return null; return { kind: 'cp', id: cp.id, wk: cp.id.replace(/[^A-Za-z0-9_-]/g, '_'), code: cp.id, t: lrnHi() && cp.hi ? cp.hi : cp.t, u: v.u, l: v.l, soon: v.soon, both: !!(cp.video && cp.videoHi) }; }
function lrnFaqList() { var F = _lrn.faq || {}; return Object.keys(F).map(function (k) { var f = F[k] || {}; return Object.assign({ id: k }, f); }).filter(function (f) { return f.on !== false && (f.url || f.urlHi); }).sort(function (a, b) { return (+a.ord || 0) - (+b.ord || 0); }); }
function lrnRender() {
  var o = document.getElementById('lrn'); if (!o) return;
  var cps = lrnCps(), tab = _lrn.tab, hi = lrnHi(), wk = lrnThisWeek(), list = [], sections = '';
  var fixes = []; try { var di = scb1TodayIdx(); if (typeof imfOn === 'function' && imfOn(di)) fixes = imfItems(imfCtxMine(), di).filter(function (it) { return it.st !== 'fixed' && (it.cp.video || it.cp.videoHi); }).map(function (it) { return it.cp; }); } catch (e) {}
  if (!tab) tab = _lrn.tab = fixes.length ? 'fix' : 'week';
  var hdr = tab === 'faq' ? lrnAqCps() : cps, hp = tab === 'faq' ? 'aq_' : '';
  var watched = hdr.filter(function (c) { return _lrn.w && _lrn.w[hp + c.id.replace(/[^A-Za-z0-9_-]/g, '_')]; }).length;
  var tabs = [['fix', lrnT('For my fixes', 'मेरे सुधार')], ['week', lrnT('This week', 'यह सप्ताह')], ['all', lrnT('All', 'सभी')], ['faq', lrnT('FAQs', 'सवाल-जवाब')]].filter(function (t) { return t[0] !== 'fix' || fixes.length; });
  if (tab === 'fix') list = fixes.map(lrnCpItem).filter(Boolean);
  else if (tab === 'week') list = cps.filter(function (c) { return lrnWeekOf(c) === wk; }).map(lrnCpItem).filter(Boolean);
  else if (tab === 'faq') { var aqs = lrnAqCps().filter(function (c) { return _lrn.grp == null || lrnWeekOf(c) === _lrn.grp; });
    var GA = (typeof SC_BASELINE !== 'undefined' ? SC_BASELINE : []).map(function (g, i) { return { t: hi && g.hi ? g.hi : g.title, L: aqs.filter(function (c) { return lrnWeekOf(c) === i; }) }; }).filter(function (g) { return g.L.length; });
    var na = 0; sections = (_lrn.grp != null ? '<div class="lrn-flt">' + lrnE(lrnT('Showing one day\'s checkpoints', 'एक दिन के चेकपॉइंट')) + ' <button type="button" onclick="_lrn.grp=null;lrnRender()">' + lrnE(lrnT('Show all', 'सभी दिखाएँ')) + '</button></div>' : '')
      + (GA.length ? '<p class="lrn-int">' + lrnE(lrnT('What NQAS assessors ask about each checkpoint, and good answers.', 'हर चेकपॉइंट पर NQAS आकलनकर्ता क्या पूछते हैं, और अच्छे उत्तर।')) + '</p>' : '')
      + GA.map(function (g) { return '<div class="lrn-sh">' + lrnE(g.t + ' · ' + g.L.length) + '</div>' + g.L.map(function (c) { var x = lrnAqItem(c); return x ? lrnRow(x, na++) : ''; }).join(''); }).join(''); }
  if (tab === 'all') {
    var G = (typeof SC_BASELINE !== 'undefined' ? SC_BASELINE : []).map(function (g, i) { return { t: hi && g.hi ? g.hi : g.title, L: cps.filter(function (c) { return lrnWeekOf(c) === i; }) }; }).filter(function (g) { return g.L.length; });
    var n = 0; sections = G.map(function (g) { return '<div class="lrn-sh">' + lrnE(g.t + ' · ' + g.L.length) + '</div>' + g.L.map(function (c) { var x = lrnCpItem(c); return x ? lrnRow(x, n++) : ''; }).join(''); }).join('');
  }
  var empty = tab === 'faq' ? lrnT('No assessor question videos yet. HealSol Academy adds them checkpoint by checkpoint.', 'अभी आकलनकर्ता प्रश्नों के वीडियो नहीं। HealSol Academy इन्हें हर चेकपॉइंट के लिए जोड़ेगी।') : tab === 'fix' ? lrnT('None of today\'s fixes has a video.', 'आज के किसी सुधार का वीडियो नहीं है।') : lrnT('No videos for this week\'s checkpoints yet.', 'इस सप्ताह के चेकपॉइंट के वीडियो अभी नहीं।');
  o.innerHTML = '<div class="lrn-top"><button type="button" class="lrn-back" onclick="lrnClose()" aria-label="' + lrnE(lrnT('Back', 'वापस')) + '"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button><b>' + lrnE(lrnT('Learn', 'सीखें')) + '</b><span>' + lrnE(lrnT(watched + ' of ' + hdr.length + ' watched', hdr.length + ' में से ' + watched + ' देखे')) + '</span></div>'
    + '<div class="lrn-tabs" role="tablist">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (t[0] === tab) + '" class="' + (t[0] === tab ? 'on' : '') + '" onclick="_lrn.tab=\'' + t[0] + '\';lrnRender()">' + lrnE(t[1]) + '</button>'; }).join('') + '</div>'
    + '<div class="lrn-list">' + (tab === 'all' || tab === 'faq' ? (sections || '<p class="lrn-empty">' + lrnE(empty) + '</p>') : (list.length ? list.map(lrnRow).join('') : '<p class="lrn-empty">' + lrnE(empty) + '</p>')) + '</div>'
    + '<p class="lrn-note">' + lrnE(lrnT('Videos play in your app language when there is one. They use mobile data — Wi-Fi is better.', 'वीडियो आपकी ऐप भाषा में चलते हैं (यदि उपलब्ध)। मोबाइल डेटा लगता है — Wi-Fi बेहतर।')) + '</p>';
  try { if (typeof imfVidMeta === 'function') imfVidMeta(o); } catch (e) {}
}
function lrnFindCp(id) { var c = null; try { c = scPkgNqas(choState.progId || 'nqas_12A').filter(function (x) { return x.id === id; })[0]; } catch (e) {} if (!c) { try { c = scCpmApply({}, id); } catch (e) {} } return c || {}; }
function lrnPlay(kind, id) {
  var u = null;
  if (kind === 'faq') { var f = (_lrn.faq || {})[id]; if (f) { var v = lrnUrl(f.url, f.urlHi); u = v && v.u; } lrnMarkWatched('faq_' + id, u); }
  else if (kind === 'aq') { try { var ca = lrnFindCp(id), va = lrnAq(ca); u = va && va.u; } catch (e) {} lrnMarkWatched('aq_' + id, u); }
  else { try { var cp = lrnFindCp(id), v2 = lrnUrl(cp.video, cp.videoHi); u = v2 && v2.u; } catch (e) {} lrnMarkWatched(id, u); }
  if (u) showVideoPopup(u);
}
async function lrnOpen(tab, grp) { _lrn.grp = grp == null ? null : grp;
  var o = document.getElementById('lrn'); if (!o) { o = document.createElement('div'); o.id = 'lrn'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-label', lrnT('Learn', 'सीखें')); document.body.appendChild(o); }
  _lrn.tab = tab || _lrn.tab || null;
  o.innerHTML = '<div class="lrn-top"><b>' + lrnE(lrnT('Learn', 'सीखें')) + '</b></div><div class="lrn-list">' + [1, 2, 3, 4].map(function () { return '<div class="lrn-row"><span class="nf-skel" style="width:92px;height:60px;border-radius:10px"></span><span class="lrn-tx"><span class="nf-skel" style="width:70%;height:13px"></span><span class="nf-skel" style="width:40%;height:10px;margin-top:6px"></span></span></div>'; }).join('') + '</div>';
  await lrnLoad(); lrnRender();
}
function lrnClose() { var o = document.getElementById('lrn'); if (o) o.remove(); }
function lrnCardHTML() {
  var cps = lrnCps(), watched = cps.filter(function (c) { return _lrn.w && _lrn.w[c.id.replace(/[^A-Za-z0-9_-]/g, '_')]; }).length, nf = lrnAqCps().length;
  return '<button type="button" class="nf-card lrn-card" onclick="lrnOpen()"><span class="lrn-ci"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9l5 3-5 3z"/></svg></span><span class="lrn-cx"><b>' + lrnE(lrnT('Learn', 'सीखें')) + '</b><small>' + lrnE(lrnT(cps.length + ' videos' + (nf ? ' · ' + nf + ' assessor FAQs' : '') + (_lrn.w ? ' · ' + watched + ' watched' : ''), cps.length + ' वीडियो' + (nf ? ' · ' + nf + ' आकलन सवाल' : '') + (_lrn.w ? ' · ' + watched + ' देखे' : ''))) + '</small></span><i class="ti ti-chevron-right"></i></button>';
}
(function () {
  // Progress tab and Today: the way in
  if (typeof nfRenderProgress === 'function') { var rp = nfRenderProgress; nfRenderProgress = function () { var r = rp.apply(this, arguments); try { var p = document.getElementById('nf-progress'); if (p && typeof nfIsStaff === 'function' && nfIsStaff() && !p.querySelector('.lrn-card')) { var d = document.createElement('div'); d.innerHTML = lrnCardHTML(); var h = p.querySelector('h1,.nf-ph,.nf-top'); if (h && h.parentNode === p) h.insertAdjacentElement('afterend', d.firstChild); else p.insertBefore(d.firstChild, p.firstChild); if (!_lrn.at) lrnLoad().then(function () { var c = p.querySelector('.lrn-card'); if (c) c.outerHTML = lrnCardHTML(); }); } } catch (e) { console.warn('[learn]', e); } return r; }; }
  if (typeof nfRenderToday === 'function') { var rh = nfRenderToday; nfRenderToday = function () { var r = rh.apply(this, arguments); try { lrnHelpMount(); } catch (e) { console.warn('[help]', e); } return r; }; }
  if (typeof nfRenderToday === 'function') { var rt = nfRenderToday; nfRenderToday = function () { var r = rt.apply(this, arguments); try { var host = document.getElementById('nf-today'); if (!host || !nfIsStaff() || host.querySelector('.lrn-card')) return r; var di = scb1TodayIdx(); if (di < 7) return r; var anchor = host.querySelector('.imf-week') || host.querySelector('.imf-team') || host.querySelector('.imf-ready'); if (!anchor) return r; var d = document.createElement('div'); d.innerHTML = lrnCardHTML(); anchor.insertAdjacentElement('afterend', d.firstChild); } catch (e) {} return r; }; }
  // HealSol Settings → Communication → FAQ videos
  if (typeof HS_RTABS !== 'undefined') HS_RTABS.forEach(function (g) { if (g[0] === 'Communication' && !g[1].some(function (x) { return x[0] === 'faq'; })) g[1].push(['faq', 'hs-faq', 'App help videos', 'How to use the app — on Today']); });
  if (typeof hsSetupGroup === 'function') { var oG = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-faq') return 'rules'; return oG.apply(this, arguments); }; }
  if (typeof hsRkApply === 'function') { var oK = hsRkApply; hsRkApply = function () { try { if (typeof hsOn === 'function' && hsOn() && _nfOv.view === 'setup' && !document.getElementById('hs-faq')) fqRender(); } catch (e) { console.warn('[faq] adm', e); } return oK.apply(this, arguments); }; }
})();

// ── HealSol: the FAQ video list ──
var _fq = { items: null, busy: false };
async function fqRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-faq');
  if (!el) { el = document.createElement('div'); el.id = 'hs-faq'; el.dataset.nfv = 'setup'; el.className = 'nfo-card sp-card'; el.setAttribute('data-hsg', 'rules'); var c = document.getElementById('hs-promos') || document.getElementById('hs-push'); if (c && c.parentNode === main) c.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  if (!_fq.items) { el.innerHTML = '<b><i class="ti ti-video"></i> App help videos</b><p>Loading…</p>'; try { var f = await fbGet('shared/sc_faq_videos'); _fq.items = (f && f.items) || {}; } catch (e) { _fq.items = {}; } }
  var L = Object.keys(_fq.items).map(function (k) { return Object.assign({ id: k }, _fq.items[k]); }).sort(function (a, b) { return (+a.ord || 0) - (+b.ord || 0); });
  el.innerHTML = '<b><i class="ti ti-video"></i> App help videos</b><p>Short MP4 answers to "how do I…" questions about the app. They show on every staff member\'s Today screen under "How to use the app", in the app\'s language when a Hindi link is given. Use the direct video link from the Wix site (video.wixstatic.com/…/file.mp4). The assessor questions for each checkpoint are separate: add them as the "Assessor FAQ video" columns in Content → Checkpoints (download the sheet, fill the links, upload it).</p>'
    + '<div class="fq-list">' + (L.length ? L.map(function (f, i) { return '<div class="fq-row" data-id="' + lrnE(f.id) + '"><span class="fq-n">' + (i + 1) + '</span><div class="fq-f">'
      + '<label>Question (English)<input type="text" maxlength="160" data-k="q" value="' + lrnE(f.q || '') + '"></label><label>Question (Hindi)<input type="text" maxlength="160" data-k="qh" value="' + lrnE(f.qh || '') + '"></label>'
      + '<label>Video link (English)<input type="url" maxlength="400" data-k="url" value="' + lrnE(f.url || '') + '" placeholder="https://video.wixstatic.com/…/file.mp4"></label><label>Video link (Hindi)<input type="url" maxlength="400" data-k="urlHi" value="' + lrnE(f.urlHi || '') + '"></label>'
      + '<label class="fq-on"><input type="checkbox" data-k="on"' + (f.on !== false ? ' checked' : '') + '> Show to staff</label></div>'
      + '<div class="fq-act"><button type="button" class="hs-btn" onclick="fqMove(\'' + lrnE(f.id) + '\',-1)"' + (i ? '' : ' disabled') + ' aria-label="Move up">↑</button><button type="button" class="hs-btn" onclick="fqMove(\'' + lrnE(f.id) + '\',1)"' + (i < L.length - 1 ? '' : ' disabled') + ' aria-label="Move down">↓</button><button type="button" class="hs-btn" onclick="fqDel(\'' + lrnE(f.id) + '\')">Remove</button></div></div>'; }).join('') : '<p class="fq-empty">No FAQ videos yet.</p>') + '</div>'
    + '<div class="sp-save"><button type="button" class="hs-btn" onclick="fqAdd()">Add a question</button><button type="button" class="hs-btn p" onclick="fqSave(this)"' + (_fq.busy ? ' disabled' : '') + '>Save FAQ videos</button></div>';
}
function fqRead() { document.querySelectorAll('#hs-faq .fq-row').forEach(function (r) { var id = r.getAttribute('data-id'), it = _fq.items[id] || (_fq.items[id] = {}); r.querySelectorAll('[data-k]').forEach(function (i) { var k = i.getAttribute('data-k'); it[k] = i.type === 'checkbox' ? i.checked : String(i.value || '').trim(); }); }); }
function fqAdd() { fqRead(); var id = 'f' + Date.now().toString(36), n = Object.keys(_fq.items).length; _fq.items[id] = { q: '', qh: '', url: '', urlHi: '', on: true, ord: n + 1 }; fqRender(); }
function fqDel(id) { fqRead(); delete _fq.items[id]; fqRender(); }
function fqMove(id, d) { fqRead(); var L = Object.keys(_fq.items).sort(function (a, b) { return (+_fq.items[a].ord || 0) - (+_fq.items[b].ord || 0); }), i = L.indexOf(id), j = i + d; if (j < 0 || j >= L.length) return; var t = L[i]; L[i] = L[j]; L[j] = t; L.forEach(function (k, n) { _fq.items[k].ord = n + 1; }); fqRender(); }
async function fqSave(btn) {
  fqRead(); var bad = '';
  Object.keys(_fq.items).forEach(function (k) { var f = _fq.items[k]; if (!f.q && !f.qh) bad = bad || 'Every question needs its words (English or Hindi).'; [f.url, f.urlHi].forEach(function (u) { if (u && !/^https:\/\//.test(u)) bad = bad || 'Video links must start with https://'; }); if (!f.url && !f.urlHi) bad = bad || 'Every question needs a video link.'; });
  if (bad) { showToast(bad, 'err'); return; }
  var L = Object.keys(_fq.items).sort(function (a, b) { return (+_fq.items[a].ord || 0) - (+_fq.items[b].ord || 0); }), out = {}; L.forEach(function (k, n) { var f = _fq.items[k]; out[k] = { q: f.q || '', qh: f.qh || '', url: f.url || '', urlHi: f.urlHi || '', on: f.on !== false, ord: n + 1 }; });
  _fq.busy = true; if (btn) btn.disabled = true;
  var ok = await fbSet('shared/sc_faq_videos', { items: out, at: new Date().toISOString() }); _fq.busy = false;
  if (ok === false) { showToast('Could not save — check the connection.', 'err'); fqRender(); return; }
  _fq.items = out; fqRender(); showToast('App help videos saved.', 'ok');
}

// ── Today: "How to use the app" (app help videos) ──
var _lrnHelpAsk = 0;
function lrnHelpMount() {
  var host = document.getElementById('nf-today'); if (!host || typeof nfIsStaff !== 'function' || !nfIsStaff()) return;
  var old = host.querySelector('.lrn-help'); if (old) old.remove();
  if (!_lrn.faq) { if (Date.now() - _lrnHelpAsk > 60000) { _lrnHelpAsk = Date.now(); lrnLoad().then(function () { if (_lrn.faq) lrnHelpMount(); }); } return; }
  var L = lrnFaqList(); if (!L.length) return;
  var di = typeof scb1TodayIdx === 'function' ? scb1TodayIdx() : 0, early = di < 9, key = function (f) { return 'faq_' + String(f.id).replace(/[^A-Za-z0-9_-]/g, '_'); }, seenN = L.filter(function (f) { return _lrn.w && _lrn.w[key(f)]; }).length;
  var cards = L.map(function (f, i) { var v = lrnUrl(f.url, f.urlHi), acc = (typeof BLS_ACC !== 'undefined' ? BLS_ACC : [['#1E6B5E']])[i % 5], seen = _lrn.w && _lrn.w[key(f)];
    return '<button type="button" class="lrn-hc" onclick="lrnPlay(\'faq\',\'' + lrnE(f.id) + '\')"><span class="lrn-hp" style="background:' + acc[0] + '">' + (seen ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>') + '<i class="lrn-du" data-vurl="' + lrnE(v ? v.u : '') + '"></i></span><b>' + lrnE(lrnHi() && f.qh ? f.qh : (f.q || f.qh || '')) + '</b></button>'; }).join('');
  var box = document.createElement('div'); box.className = 'nf-card lrn-help';
  box.innerHTML = '<div class="lrn-hh"><b>' + lrnE(lrnT('How to use the app', 'ऐप कैसे इस्तेमाल करें')) + '</b><span>' + lrnE(lrnT(seenN + ' of ' + L.length + ' watched', L.length + ' में से ' + seenN + ' देखे')) + '</span></div><div class="lrn-hs">' + cards + '</div>';
  var hero = host.querySelector('.nf-hero'), nx = hero && hero.nextElementSibling, after = early && hero ? (nx && nx.classList.contains('bls-team') ? nx : hero) : null;
  if (after && after.parentNode) after.insertAdjacentElement('afterend', box); else host.appendChild(box);
  try { if (typeof imfVidMeta === 'function') imfVidMeta(box); } catch (e) {}
}
