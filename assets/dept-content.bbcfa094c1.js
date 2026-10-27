// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
// DEPARTMENT CORE — CHECKPOINT CONTENT ON THE STAFF SIDE (Step 2d, 19 Oct 2026; approved canvas screens 6–9)
// From HealSol's published checkpoint master (_nd.live, see ndMasterSetup): MoV items staff tick (score worked out as in the
// SC app), the Hindi wording, one video in the chosen language, "best filled by" roles and How to fix per MoV item.
//   • Card language EN / हिं (localStorage nd_lang): checkpoint, items, How to fix and the video follow it (screen labels stay
//     English until the Hindi screens step).
//   • Best filled by: a checkpoint goes to the department's fillers with one of its roles; nobody with those roles → everyone.
//   • Ticks: sc_pcards/…/{mob}/t/{cp} = '110' (1 yes, 0 no, - not yet); the score s is set once every item is answered.
//   • The checker settles a difference item by item; the day result keeps the final ticks (sc_dcards/…/ft/{cp}).
//   • Actions: the lead's Assign list fills in HealSol's How to fix for the missed items (src 'm', k = items, ev, tm; the due
//     date from "Time needed"); "each staff member" → one action everyone posted in the department does (owners, dn).
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════
function ndLang() { return _nd && _nd.lang === 'hi' ? 'hi' : 'en'; }
// One language for the whole app (HealSol 26 Oct 2026, like SC): the card's EN / हिं and Me → Language both call setLang,
//   which changes the screens and the card content together and is remembered per phone (nqas_lang).
function ndSetLang(l) {
  l = l === 'hi' ? 'hi' : 'en'; if (_nd) _nd.lang = l;
  if (typeof setLang === 'function') { setLang(l); return; }
  if (_nd) ndKeepScroll();
}
function ndLangSync() {
  if (typeof _nd === 'undefined' || !_nd) return; var l = (typeof _appLang !== 'undefined' && _appLang === 'hi') ? 'hi' : 'en'; _nd.lang = l; try { localStorage.setItem('nd_lang', l); } catch (e) {}
  var T = _nd.cfg && _nd.cfg.id;   // switched to Hindi before the built-in Hindi arrived: fetch it, then redraw the card
  if (l === 'hi' && T && !_ndHiDone[T]) nfDeptHiLoad(T).then(function () { if (_nd && _nd.cfg && _nd.cfg.id === T) { _nd.ct = {}; ndKeepScroll(); } }).catch(function () {});
}
function ndLangInit() { return (typeof _appLang !== 'undefined' && _appLang === 'hi') ? 'hi' : 'en'; }
function ndLangSeg() {
  var hi = ndLang() === 'hi';
  return '<span class="nx-lang" role="tablist" aria-label="Card language"><button type="button" role="tab" aria-selected="' + !hi + '" class="' + (hi ? '' : 'on') + '" onclick="ndSetLang(\'en\')">EN</button><button type="button" role="tab" aria-selected="' + hi + '" class="' + (hi ? 'on' : '') + '" onclick="ndSetLang(\'hi\')">हिं</button></span>';
}
function ndJ(v, d) { if (v == null) return d; if (typeof v !== 'string') return v; try { return JSON.parse(v); } catch (e) { return d; } }
// built-in Hindi for UPHC / PHC / CHC checkpoints and things to check (25 Oct 2026): data/<type>/hindi.json = {English: Hindi}
//   one file per type (built by developer/hindi/content/merge.js), fetched once per page. HealSol's own Hindi (Content)
//   always wins; this fills the gaps so the card's हिं shows Hindi from day one.
var ND_HI = {}, _ndHiDone = {};
async function nfDeptHiLoad(T) {
  T = T || 'chc'; if (_ndHiDone[T]) return ND_HI;
  try { var d = await nfLoadData(T + '-hindi'); if (d) { Object.keys(d).forEach(function (k) { if (!ND_HI[k]) ND_HI[k] = d[k]; }); _ndHiDone[T] = 1; } } catch (e) {}
  return ND_HI;
}
function nfDeptHi(en) { if (!en) return ''; return ND_HI[String(en).replace(/\s+/g, ' ').trim()] || ''; }
// built-in How to fix for UPHC / PHC / CHC (27 Oct 2026): data/<type>/fix.json, built by developer/fix/merge.js in the SC
//   How-to-fix style (who S/E, 3 steps, evidence, time; English + Hindi). HealSol's own How to fix (Card Editor) always wins;
//   this fills the gaps. Shape: {r:[[w,f,fh,e,eh,tm]], i:{"cp\u0001thing": n}, c:{"cp": n}, t:{"thing": n}}.
var ND_FIX = {}, _ndFixP = {};
function nfDeptFixLoad(T) {
  T = T || 'chc'; if (ND_FIX[T]) return Promise.resolve(ND_FIX[T]); if (_ndFixP[T]) return _ndFixP[T];
  return (_ndFixP[T] = nfLoadData(T + '-fix').then(function (d) { ND_FIX[T] = (d && d.r) ? d : { r: [], i: {}, c: {}, t: {} }; return ND_FIX[T]; })
    .catch(function () { delete _ndFixP[T]; return null; }));
}
function nfFixNorm(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/^check (for |that |if |whether )?/, ''); }
// the built-in How to fix of a thing to check (item text) under a checkpoint, or of the whole checkpoint (no item) → {w,f,fh,e,eh,tm,b:1}
function nfFixBuiltin(T, cp, item, nItems) {
  var d = ND_FIX[T]; if (!d || !d.r) return null; var c = nfFixNorm(cp), r;
  if (item) { var t = nfFixNorm(item); r = d.i[c + '\u0001' + t]; if (r == null) r = d.t[t]; if (r == null && nItems === 1) r = d.c[c]; }
  else r = d.c[c];
  var x = r == null ? null : d.r[r]; return x ? { w: x[0], f: x[1], fh: x[2], e: x[3], eh: x[4], tm: x[5], b: 1 } : null;
}
// How to fix of item k (1-based; 0 = the whole checkpoint): HealSol's, else the built-in one (null when neither)
function ndFixEntry(id, k) {
  var c = ndCt(id), f = (c.fix || {})[String(k || 0)]; if (f && (f.f || f.fh)) return f;
  var T = _nd.cfg && _nd.cfg.id; if (!T) return null;
  var L = _nd.live || {}, e = (L.added || {})[id] || (L.edits || {})[id] || {}, cp = e.t || ndCpText(id), n = c.items.length;
  if (k && !c.items[k - 1]) return null;
  return nfFixBuiltin(T, cp, k ? c.items[k - 1].t : '', n);
}
// a checkpoint's content: {hi, items:[{t,h,m}], fix:{'1':{w,f,fh,e,eh,tm}}, video, videoHi, roles:[]}
function ndCt(id) {
  _nd.ct = _nd.ct || {}; if (_nd.ct[id]) return _nd.ct[id];
  var L = _nd.live || {}, e = (L.added || {})[id] || (L.edits || {})[id] || {}, b = (_nd.base0 || {})[id], row = _nd.byId[id] || [];
  var m = String(row[6] || '').split('/').filter(Boolean), items;
  if (e.items !== undefined) items = ndJ(e.items, []);
  else items = nfMovSplit(b ? b[7] : '').map(function (t) { return { t: t, h: '', m: m.slice() }; });   // the checklist's MoV split into things (HealSol 19 Oct)
  (items || []).forEach(function (it) { if (it && !it.h && it.t) it.h = nfDeptHi(it.t); });
  return (_nd.ct[id] = { hi: e.hi || nfDeptHi(e.t || row[5] || (b && b[5])), items: items || [], fix: ndJ(e.fix, {}) || {}, video: e.video || '', videoHi: e.videoHi || '', roles: ndJ(e.roles, []) || [] });
}
function ndCpTextL(id) { var c = ndCt(id); return ndLang() === 'hi' && c.hi ? c.hi : ndCpText(id); }
function ndItemTxt(it) { return ndLang() === 'hi' && it.h ? it.h : it.t; }
function ndVideoUrl(id) { var c = ndCt(id); return ndLang() === 'hi' ? (c.videoHi || c.video) : (c.video || c.videoHi); }
function ndPlayVideo(id) {
  var u = ndVideoUrl(id); if (!u) return;
  if (typeof isVideoUrl === 'function' && isVideoUrl(u) && typeof showVideoPopup === 'function') showVideoPopup(u); else { try { window.open(u, '_blank', 'noopener'); } catch (e) {} }
}
// How to fix of an item (1-based; 0 = the whole checkpoint) in the card language: {w, steps, ev, tm}
function ndFix(id, k) {
  var f = ndFixEntry(id, k); if (!f || !(f.f || f.fh)) return null;
  var hi = ndLang() === 'hi';
  return { w: f.w === 'E' ? 'E' : 'S', steps: hi && f.fh ? f.fh : (f.f || f.fh), en: f.f || f.fh || '', ev: hi && f.eh ? f.eh : (f.e || f.eh || ''), evEn: f.e || '', tm: f.tm || '' };
}
// SC rule: all met = Met (2) · at least half = Partial (1) · fewer = Not met (0)
function ndMovScore(t) {
  if (!t || !t.length || t.some(function (x) { return x !== 0 && x !== 1; })) return null;
  var met = t.filter(function (x) { return x === 1; }).length, n = t.length;
  return met === n ? 2 : met * 2 >= n ? 1 : 0;
}
function ndTk(str, n) { var a = String(str || '').split('').map(function (c) { return c === '1' ? 1 : c === '0' ? 0 : null; }); while (a.length < n) a.push(null); return a.slice(0, n); }
function ndTkStr(a) { return a.map(function (x) { return x === 1 ? '1' : x === 0 ? '0' : '-'; }).join(''); }
function ndRuleTxt(n) {
  if (n === 1) return '1 thing: yes = Met · no = Not met';
  var half = Math.ceil(n / 2), lo = half - 1;
  return n + ' things: all ' + n + ' = Met · ' + (half === n - 1 ? half : half + '–' + (n - 1)) + ' = Partial · ' + (lo ? '0–' + lo : '0') + ' = Not met';
}
// ── best filled by ──
function ndCpFor(dept, id) {   // the fillers a checkpoint goes to
  var fl = ndFillers(dept), roles = ndCt(id).roles || [];
  if (!roles.length) return fl;
  var by = fl.filter(function (m) { return roles.indexOf(ndRole(m)) >= 0; });
  return by.length ? by : fl;
}
function ndCpForMe(dept, id, mob) { return ndCpFor(dept, id).indexOf(mob) >= 0; }
function ndAnyRoles() {   // quick path: no checkpoint has "best filled by" roles
  if (_nd.anyRoles == null) { var L = _nd.live || {}, has = false; [L.edits || {}, L.added || {}].forEach(function (o) { Object.keys(o).forEach(function (id) { var r = ndJ((o[id] || {}).roles, []); if (r && r.length) has = true; }); }); _nd.anyRoles = has; }
  return _nd.anyRoles;
}
function ndMyIds(dept, day, mob) { var ids = ndDayIds(dept, day); if (!ndAnyRoles()) return ndFills(dept, mob) ? ids : []; return ids.filter(function (id) { return ndCpForMe(dept, id, mob); }); }
function ndForYouTag(dept, id) { var r = ndCt(id).roles || []; if (!r.length) return ''; var me = ndMob(), mine = r.indexOf(ndRole(me)) >= 0; return mine ? 'For you · ' + ndRoleLabel(ndRole(me)) : ''; }
// ── ticks on my card ──
function ndTick(id, k, v) {
  var me = ndMob(), cc = ndCur(), c = ndPc(cc.dept, cc.day)[me] || {}, n = ndCt(id).items.length; if (!n) return;
  var t = ndTk((c.t || {})[id], n); t[k] = t[k] === v ? null : v;
  var sc = ndMovScore(t), rel = {}; rel['t/' + id] = ndTkStr(t); rel['s/' + id] = sc === null ? null : sc;
  if (sc === 2) { rel['r/' + id] = null; rel['note/' + id] = null; }
  ndCardWrite(rel); ndKeepScroll();
}
// MoV items missed for a checked checkpoint: from the day result's final ticks, else the cards' ticks (an item counts as met
// only when every card said yes). Returns 1-based numbers.
function ndMissed(id, dept, day) {
  var n = ndCt(id).items.length; if (!n) return [];
  var res = ndRes(dept, day), ft = (res.ft || {})[id], t = null;
  if (ft) t = ndTk(ft, n);
  else { var cards = ndPc(dept, day); Object.keys(cards).forEach(function (m) { var c = cards[m] || {}; if (!c.done || c.absent || !(c.t || {})[id]) return; var x = ndTk(c.t[id], n); t = t ? t.map(function (v, i) { return v === 1 && x[i] === 1 ? 1 : (v === null && x[i] === null ? null : 0); }) : x; }); }
  if (!t) return [];
  var out = []; t.forEach(function (v, i) { if (v === 0) out.push(i + 1); }); return out;
}
// "2 weeks" → 14 days; "10 days", "1 month" (30), Hindi सप्ताह / दिन / महीना; nothing → 7
function ndDueDays(tm) {
  var s = String(tm || '').toLowerCase(), m = /(\d+(?:\.\d+)?)\s*(day|days|d|week|weeks|wk|wks|w|month|months|mo|दिन|सप्ताह|हफ्ते|हफ़्ते|हफ्ता|महीना|महीने)?/.exec(s);
  if (!m) return 7; var n = parseFloat(m[1]), u = m[2] || 'day';
  var d = /^(week|weeks|wk|wks|w|सप्ताह|हफ्ते|हफ़्ते|हफ्ता)$/.test(u) ? n * 7 : /^(month|months|mo|महीना|महीने)$/.test(u) ? n * 30 : n;
  return Math.max(1, Math.min(120, Math.round(d)));
}
// the ready-made action from HealSol's How to fix for the missed items (null when none written)
function ndFixFor(id, dept, day) {
  var miss = ndMissed(id, dept, day), ks = miss.length ? miss : (ndCt(id).items.length ? [] : [0]), parts = [], ev = [], tm = '', each = false;
  if (!ks.length) ks = [0];
  ks.forEach(function (k) {
    var f = ndFixEntry(id, k); if (!f || !f.f) return;
    parts.push((ks.length > 1 && k ? 'Item ' + k + ': ' : '') + f.f); if (f.e) ev.push(f.e); if (f.tm && ndDueDays(f.tm) > ndDueDays(tm || '0 day')) tm = f.tm; if (f.w === 'E') each = true;
  });
  if (!parts.length) return null;
  return { how: parts.join('\n').slice(0, 1500), k: ks.filter(function (k) { return k; }).join(','), ev: ev.join('; ').slice(0, 400), tm: tm.slice(0, 60), each: each, due: ndAddDays(ndToday(), ndDueDays(tm)) };
}
// the steps of an action in the card language (master text when the lead kept it as written)
function ndActSteps(id, a) {
  if (!a || a.src !== 'm') return { steps: a ? a.how : '', ev: a ? a.ev || '' : '', tm: a ? a.tm || '' : '' };
  var ks = String(a.k || '').split(',').filter(Boolean).map(Number); if (!ks.length) ks = [0];
  var st = [], ev = [];
  ks.forEach(function (k) { var f = ndFix(id, k); if (!f) return; st.push((ks.length > 1 && k ? 'Item ' + k + ': ' : '') + f.steps); if (f.ev) ev.push(f.ev); });
  return st.length ? { steps: st.join('\n'), ev: ev.join('; '), tm: a.tm || '' } : { steps: a.how, ev: a.ev || '', tm: a.tm || '' };
}
function ndItemNames(id, ks) { var it = ndCt(id).items; return String(ks || '').split(',').filter(Boolean).map(function (k) { var x = it[+k - 1]; return x ? k + ' · ' + ndItemTxt(x) : ''; }).filter(Boolean); }
