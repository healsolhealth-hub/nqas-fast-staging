// ══════════════════════════════════════════════════════════════
// HINDI ON THE PHONE SCREENS (24 Oct 2026)
//   When a staff member picks हिं, every phone screen (SC staff and CHO, UPHC / PHC / CHC staff and in-charge,
//   MO / MOIC phone views, login) is shown in Hindi. Screens are written in English; this layer swaps the words on
//   screen as they appear, so no screen needs its own translation code:
//     1. exact line        HINDI_UI['Mark as done']
//     2. numbers           'Day {n} of {n}'  (Hindi may reorder with {1} {2} …)
//     3. parts             'Day 4 · Baseline' → each part on its own
//     4. trailing : … .    'Population:' → 'जनसंख्या:'
//   Wording corrections from HealSol (shared/ui_hi, Excel upload in Content → App wording) win over the built-in Hindi.
//   Laptop portals (HealSol, Supervisor, District Admin) stay English. Text people typed (names, notes) is never
//   touched: only lines found in the word list change. Switching back to English restores the original words.
// ══════════════════════════════════════════════════════════════
var NF_HI_OVR = {};            // HealSol corrections: English → Hindi
var _nfHiObs = null, _nfHiBusy = false;
function nfHiKeyId(en) { var h = 5381, s = String(en); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return 'k' + h.toString(36) + s.length.toString(36); }
function nfHiDict(k) { return Object.prototype.hasOwnProperty.call(NF_HI_OVR, k) && NF_HI_OVR[k] ? NF_HI_OVR[k] : (typeof HINDI_UI === 'object' && Object.prototype.hasOwnProperty.call(HINDI_UI, k) ? HINDI_UI[k] : null); }
// which screens: phone apps only (not the laptop portals)
function nfHiScope() {
  try { if (typeof hsOn === 'function' && hsOn()) return false; } catch (e) {}
  try { if (typeof scIsDistrict === 'function' && scIsDistrict()) return typeof hsrBlock === 'function' && hsrBlock(); } catch (e) {}   // MOIC block view yes, District Admin no
  try { if (typeof appMode !== 'undefined' && /^(sc-admin|sc-supervisor|sc-district|sc-state|sc-partner|sc-healsol)$/.test(appMode)) return false; } catch (e) {}
  try { if (document.body && document.body.classList.contains('nfd-on') && !(typeof hsrBlock === 'function' && hsrBlock())) return false; } catch (e) {}   // State / Partner dashboards
  return true;
}
function nfHiOn() { return typeof _appLang !== 'undefined' && _appLang === 'hi' && nfHiScope(); }
// templates with words in them: 'Lead: {x} · {n} fill' — {n} a number, {x} any words (translated on their own when they can be)
var _nfHiTpl = null, _nfHiCache = {}, _nfHiCacheN = 0;
var NF_HI_NUM = '(\\d+(?:[.,]\\d+)*%?)';
function nfHiTplBuild() {
  var src = {}, add = function (o) { if (o) Object.keys(o).forEach(function (k) { if (/\{[xX]\}/.test(k)) src[k] = 1; }); };
  if (typeof HINDI_UI === 'object') add(HINDI_UI); add(NF_HI_OVR);
  _nfHiTpl = Object.keys(src).map(function (k) {
    var lits = k.split(/\{[nxX]\}/), longest = lits.slice().sort(function (a, b) { return b.length - a.length; })[0] || '';
    var re = '^' + k.split(/(\{[nxX]\})/).map(function (p) { return p === '{n}' ? NF_HI_NUM : (p === '{x}' || p === '{X}') ? '(.+?)' : p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('') + '$';
    return { k: k, sep: /\s[·|—–]\s/.test(k), lit: longest, re: new RegExp(re), kinds: (k.match(/\{[nxX]\}/g) || []), n: k.replace(/\{[nxX]\}/g, '').length };
  }).sort(function (a, b) { return b.n - a.n; });
}
function nfHiFill(t, caps) { var i = 0; t = t.replace(/\{(\d)\}/g, function (m, k) { return caps[+k - 1] != null ? caps[+k - 1] : m; }); return t.replace(/\{[nxX]\}/g, function () { return caps[i] != null ? caps[i++] : ''; }); }
function nfHiWords(x, depth) {   // a captured part: the whole, or a list 'A, B and C'; known words in brackets too
  var w = nfHiLine(x, depth); if (w) return w;
  if (/\([^()]*[A-Za-z]{2,}[^()]*\)/.test(x)) { var b = x.replace(/\(([^()]+)\)/g, function (m0, inner) { var v = nfHiLine(inner.trim(), depth); return v ? '(' + v + ')' : m0; }); if (b !== x) return b; }
  if (/[,;]\s/.test(x)) { var any = false, out = x.split(/([,;]\s+)/).map(function (p, j) { if (j % 2) return p; var v = nfHiLine(p.trim(), depth); if (v) { any = true; return v; } return p; }); if (any) return out.join(''); }
  return x;
}
var NF_HI_MON = { Jan: 'जन॰', Feb: 'फ़र॰', Mar: 'मार्च', Apr: 'अप्रैल', May: 'मई', Jun: 'जून', Jul: 'जुला॰', Aug: 'अग॰', Sep: 'सित॰', Oct: 'अक्टू॰', Nov: 'नव॰', Dec: 'दिस॰',
  January: 'जनवरी', February: 'फ़रवरी', March: 'मार्च', April: 'अप्रैल', June: 'जून', July: 'जुलाई', August: 'अगस्त', September: 'सितंबर', October: 'अक्टूबर', November: 'नवंबर', December: 'दिसंबर',
  Mon: 'सोम', Tue: 'मंगल', Wed: 'बुध', Thu: 'गुरु', Fri: 'शुक्र', Sat: 'शनि', Sun: 'रवि' };
// one line of screen text → Hindi, or null when it is not in the word list
function nfHiLine(s, depth) {
  if (!s || !/[A-Za-z]{2,}/.test(s)) return null;
  depth = depth || 0;
  if (!depth && Object.prototype.hasOwnProperty.call(_nfHiCache, s)) return _nfHiCache[s];
  var r = nfHiLine0(s, depth);
  if (!depth) { if (_nfHiCacheN > 20000) { _nfHiCache = {}; _nfHiCacheN = 0; } _nfHiCache[s] = r; _nfHiCacheN++; }
  return r;
}
function nfHiSplitParts(s) {   // split on ' · ' ' | ' ' — ' ' – ', not inside brackets or quotes
  var out = [], buf = '', dep = 0, re = /\s+[·|—–]\s+/y;
  for (var i = 0; i < s.length; i++) { var ch = s[i];
    if (ch === '(' || ch === '“') dep++; else if ((ch === ')' || ch === '”') && dep) dep--;
    if (!dep && /\s/.test(ch)) { re.lastIndex = i; var m = re.exec(s); if (m) { out.push(buf, m[0]); buf = ''; i += m[0].length - 1; continue; } }
    buf += ch; }
  out.push(buf); return out;
}
function nfHiLine0(s, depth) {
  var d = nfHiDict(s); if (d) return d;
  // dates and days: '30 Nov 2026', 'Sat, 25 Oct'
  if (/^[\d\s,.\-–\/]*(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December|Mon|Tue|Wed|Thu|Fri|Sat|Sun)\b[\d\s,.\-–\/]*)+$/.test(s))
    return s.replace(/\b[A-Z][a-z]+\b/g, function (m) { return NF_HI_MON[m] || m; });
  // numbers: 'Day 4 of 60' → 'Day {n} of {n}'
  var nums = [], key = s.replace(/\d+(?:[.,]\d+)*%?/g, function (m) { nums.push(m); return '{n}'; });
  if (nums.length) { var t = nfHiDict(key); if (t) return nfHiFill(t, nums); }
  if (depth > 3) return null;
  // templates with words
  if (!_nfHiTpl) nfHiTplBuild();
  var hasSep = /\s[·|—–]\s/.test(s);
  for (var i = 0; i < _nfHiTpl.length; i++) { var T = _nfHiTpl[i]; if (T.lit && s.indexOf(T.lit) < 0) continue; if (hasSep && !T.sep) continue; var m = T.re.exec(s); if (!m) continue;
    var bad = false, caps = m.slice(1).map(function (c, j) { if (T.kinds[j] === '{X}') { var y = nfHiLine(c.trim(), depth + 1); if (!y) bad = true; return y; } return T.kinds[j] === '{x}' ? nfHiWords(c.trim(), depth + 1) : c; });
    if (bad) continue;
    return nfHiFill(nfHiDict(T.k), caps); }
  // parts joined by · | — –
  var parts = nfHiSplitParts(s); if (parts.length > 1) { var any = false, out = parts.map(function (p, j) { if (j % 2) return p; var w = nfHiLine(p.trim(), depth + 1); if (w) { any = true; return p.replace(p.trim(), w); } return p; }); if (any) return out.join(''); }
  // trailing punctuation
  var mm = /^(.*?)([:.…!?]+)$/.exec(s); if (mm && mm[1]) { var u = nfHiLine(mm[1], depth + 1); if (u) return u + (mm[2] === '.' ? '।' : mm[2]); }
  // leading / trailing symbols: '✓ Done', '+ Add', '📊 Readiness', 'Share ›'
  mm = /^([^A-Za-z0-9]*)(.*?)([^A-Za-z0-9.:…!?)]*)$/.exec(s); if (mm && (mm[1] || mm[3]) && mm[2] && mm[2] !== s) { var v = nfHiLine(mm[2].trim(), depth + 1); if (v) return mm[1] + v + mm[3]; }
  // a list: 'Maternity Health, Immunization, Family Planning' — only when every item is known
  if (/,\s/.test(s)) { var L = s.split(/,\s+/), outL = []; for (var q = 0; q < L.length; q++) { var y = nfHiLine(L[q].trim(), depth + 1); if (!y) { outL = null; break; } outL.push(y); } if (outL) return outL.join(', '); }
  return null;
}
function nfHiText(node) {
  var cur = node.nodeValue; if (!cur || !/[A-Za-z]{2,}/.test(cur)) return;
  var trimmed = cur.replace(/\s+/g, ' ').trim(), hi = nfHiLine(trimmed); if (!hi || hi === trimmed) return;
  if (node.__nfEn == null) node.__nfEn = cur;
  node.nodeValue = cur.replace(cur.trim(), hi);
}
var NF_HI_ATTRS = ['placeholder', 'aria-label', 'title', 'data-l'];   // data-l: phone table labels drawn by CSS
function nfHiEl(el) {
  if (!el || el.nodeType !== 1) return;
  if (/^(SCRIPT|STYLE|NOSCRIPT|CODE|PRE)$/.test(el.tagName) || (el.closest && el.closest('[data-no-hi],.nf-no-hi'))) return;
  for (var a = 0; a < NF_HI_ATTRS.length; a++) { var v = el.getAttribute && el.getAttribute(NF_HI_ATTRS[a]); if (v && /[A-Za-z]{2,}/.test(v)) { var h = nfHiLine(v.trim()); if (h) { if (!el.__nfEnA) el.__nfEnA = {}; if (el.__nfEnA[NF_HI_ATTRS[a]] == null) el.__nfEnA[NF_HI_ATTRS[a]] = v; el.setAttribute(NF_HI_ATTRS[a], h); } } }
  if (el.tagName === 'INPUT' && /^(button|submit)$/i.test(el.type) && el.value) { var hv = nfHiLine(el.value.trim()); if (hv) { if (!el.__nfEnA) el.__nfEnA = {}; if (el.__nfEnA.value == null) el.__nfEnA.value = el.value; el.value = hv; } }
}
function nfHiTree(root) {
  if (!root) return;
  if (root.nodeType === 3) { var p = root.parentElement; if (p && !/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(p.tagName) && !(p.closest && p.closest('[data-no-hi],.nf-no-hi'))) nfHiText(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) { if (root.tagName === 'TEXTAREA') { nfHiEl(root); return; } if (/^(SCRIPT|STYLE|NOSCRIPT)$/.test(root.tagName) || (root.closest && root.closest('[data-no-hi],.nf-no-hi'))) return; nfHiEl(root); }
  var w = document.createTreeWalker(root, 5 /* element + text */, null), n;
  while ((n = w.nextNode())) {
    if (n.nodeType === 1) { if (n.tagName === 'TEXTAREA') nfHiEl(n); if (/^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA)$/.test(n.tagName) || n.hasAttribute('data-no-hi') || (n.classList && n.classList.contains('nf-no-hi'))) { var nx = n; while (nx && !nx.nextSibling && nx !== root) nx = nx.parentNode; if (!nx || nx === root) break; w.currentNode = nx; continue; } nfHiEl(n); }
    else nfHiText(n);
  }
}
function nfHiApply() {
  if (!nfHiOn()) { nfHiStop(); return; }
  _nfHiBusy = true; try { nfHiTree(document.body); } catch (e) { console.warn('[HI]', e); } _nfHiBusy = false;
  if (!_nfHiObs && typeof MutationObserver !== 'undefined') {
    _nfHiObs = new MutationObserver(function (list) {
      if (_nfHiBusy || !nfHiOn()) return; _nfHiBusy = true;
      try { for (var i = 0; i < list.length; i++) { var r = list[i];
        if (r.type === 'characterData') nfHiTree(r.target);
        else if (r.type === 'attributes') nfHiEl(r.target);
        else for (var j = 0; j < r.addedNodes.length; j++) nfHiTree(r.addedNodes[j]); } } catch (e) { console.warn('[HI]', e); }
      _nfHiBusy = false;
    });
    _nfHiObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: NF_HI_ATTRS });
  }
}
function nfHiStop() { if (_nfHiObs) { try { _nfHiObs.disconnect(); } catch (e) {} _nfHiObs = null; } }
// back to English: restore every swapped word
function nfHiRestore() {
  nfHiStop(); if (!document.body) return;
  var w = document.createTreeWalker(document.body, 5, null), n;
  while ((n = w.nextNode())) {
    if (n.nodeType === 3) { if (n.__nfEn != null) { n.nodeValue = n.__nfEn; n.__nfEn = null; } }
    else if (n.__nfEnA) { Object.keys(n.__nfEnA).forEach(function (a) { if (a === 'value') n.value = n.__nfEnA[a]; else n.setAttribute(a, n.__nfEnA[a]); }); n.__nfEnA = null; }
  }
}
// HealSol corrections: shared/ui_hi/items/{id} = {en, hi, at, by} — read by anyone (the login screen is in Hindi too)
function nfHiLoadOverrides() {
  try { var c = localStorage.getItem('nf_ui_hi_v1'); if (c) { NF_HI_OVR = JSON.parse(c) || {}; _nfHiTpl = null; _nfHiCache = {}; } } catch (e) {}
  try {
    if (typeof db === 'undefined' || !db || !db.ref) return;
    db.ref('shared/ui_hi/items').once('value').then(function (s) {
      var v = s.val() || {}, o = {}; Object.keys(v).forEach(function (k) { var r = v[k]; if (r && r.en && r.hi) o[r.en] = r.hi; });
      NF_HI_OVR = o; _nfHiTpl = null; _nfHiCache = {}; _nfHiCacheN = 0; try { localStorage.setItem('nf_ui_hi_v1', JSON.stringify(o)); } catch (e) {}
      if (nfHiOn()) nfHiApply();
    }, function () {});
  } catch (e) {}
}
(function () {
  if (typeof setLang === 'function' && !setLang._nfHi) {
    var o = setLang;
    setLang = function (lang, silent) {
      var r = o.apply(this, arguments);
      try {
        if (lang === 'hi') nfHiApply();
        else { nfHiRestore(); if (typeof _nd !== 'undefined' && _nd && typeof ndRender === 'function') ndRender(); }
      } catch (e) {}
      return r;
    };
    setLang._nfHi = true;
  }
  var start = function () { nfHiLoadOverrides(); if (nfHiOn()) nfHiApply(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  // the scope can change after sign-in (a HealSol login is English even if हिं was picked on this phone)
  setInterval(function () { try { if (nfHiOn()) { if (!_nfHiObs) nfHiApply(); } else if (_nfHiObs) { nfHiRestore(); } } catch (e) {} }, 1500);
})();
