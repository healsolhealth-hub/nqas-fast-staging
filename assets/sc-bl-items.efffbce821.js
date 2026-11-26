// ══ Richer item rows (26 Nov): training · drugs with their forms · equipment · "All there / Some missing" ══
// Answers stay one character per item in the line's string, so storage, sync and the facility merge are unchanged.
//   '1' met · '0' not met · 'n' trained, no certificate (not met) · 'b' broken (not met) · 'x' not applicable (left out)
//   'a' drug form not tapped after "Available"  → not met once any form of that drug is tapped, otherwise unanswered
//   'm' part not tapped after "Some missing"    → met once any part is marked missing, otherwise unanswered
BLS_LISTS.train = 1; BLS_LISTS.drug = 1; BLS_LISTS.some = 1; BLS_LISTS.somerec = 1;
BLS_ITEMBTN.equip = [['Working', 'चालू'], ['Broken', 'ख़राब'], ['Not available', 'उपलब्ध नहीं']];
BLS_ITEMBTN.train = [['Not trained', 'प्रशिक्षण नहीं'], ['Trained, no certificate', 'प्रशिक्षित, प्रमाणपत्र नहीं'], ['Certificate seen', 'प्रमाणपत्र देखा']];
BLS_ITEMBTN.drug = [['Available', 'उपलब्ध'], ['Not available', 'उपलब्ध नहीं']];
BLS_ITEMBTN.some = [['All there', 'सब मौजूद'], ['Some missing', 'कुछ नहीं है']];
BLS_ITEMBTN.somerec = [['All recorded', 'सब दर्ज'], ['Some missing', 'कुछ दर्ज नहीं']];
BLS_CHIP.train = 'RR'; BLS_CHIP.drug = 'OB'; BLS_CHIP.some = 'OB'; BLS_CHIP.somerec = 'RR';

// drug entries are "Name|form 1|form 2…"; each form becomes its own item, grouped under the drug
(function () {
  var base = blsSlots;
  blsSlots = function (cp, F) {
    return base.apply(this, arguments).map(function (s) {
      if (s.kind !== 'list') return s;
      var L = blsLC(s.key), raw = (L && L.i) || [];
      var flag = function (it) { var x = raw[it.j]; return Array.isArray(x) && x[2] ? String(x[2]) : ''; };
      if (s.ty === 'drug') {
        var out = [];
        s.items.forEach(function (it) {
          var p = String(it.n).split('|'), name = p[0], forms = p.slice(1);
          if (forms.length < 2) { out.push({ n: forms.length ? name + ' ' + forms[0] : name, a: it.a, j: it.j, g: -1 }); return; }
          forms.forEach(function (f) { out.push({ n: name + ' ' + f, gn: name, f: f, a: it.a, j: it.j, g: it.j }); });
        });
        s = Object.assign({}, s, { items: out });
      } else if (s.ty === 'train') {
        s = Object.assign({}, s, { items: s.items.map(function (it) { return Object.assign({}, it, { na: /na/.test(flag(it)) }); }) });
      }
      return s;
    });
  };
})();

// one item's state from the line string: 'y' met · 'n' not met · 'x' left out · null not answered yet
function blsItemState(s, str, i) {
  var c = str.charAt(i);
  if (c === '1') return 'y';
  if (c === '0' || c === 'n' || c === 'b') return 'n';
  if (c === 'x') return 'x';
  if (c === 'a') { var g = s.items[i].g; for (var k = 0; k < s.items.length; k++) if (s.items[k].g === g && str.charAt(k) === '1') return 'n'; return null; }
  if (c === 'm') return str.indexOf('0') >= 0 ? 'y' : null;
  if ((s.ty === 'some' || s.ty === 'somerec') && (c === '-' || c === '')) return str.indexOf('1') >= 0 ? 'n' : null;
  return null;
}
(function () {
  var base = blsVal;
  blsVal = function (s, v) {
    if (!s || s.kind !== 'list' || v == null || v === '') return base.apply(this, arguments);
    var str = String(v), y = 0, n = 0;
    if (str.length < s.items.length) return null;
    for (var i = 0; i < s.items.length; i++) { var st = blsItemState(s, str, i); if (st === null) return null; if (st === 'y') y++; else if (st === 'n') n++; }
    return y + n ? y / (y + n) : 1;
  };
})();

// 26 Nov 2026: a chip tap (a drug form, or one part of a list) keeps the card still — no slide replay, no jump to the
// next checkpoint while staff are still ticking. It moves on by itself only when every part of a list is ticked.
function blsPartTap(di, ci, id, n, len, val) {
  var c = getCHOCard(di), str = String(((c.blAns || {})[ci] || {})[id] || ''); while (str.length < len) str += '-';
  var after = str.slice(0, n) + val + str.slice(n + 1), sl = blsSlots(getDay(di).cps[ci]).filter(function (x) { return x.id === id; })[0];
  _bls.hold = !(sl && (sl.ty === 'some' || sl.ty === 'somerec') && /^1+$/.test(after.slice(0, len)));
  try { blsSetItem(di, ci, id, n, len, val); } finally { _bls.hold = false; }
}

// set several items at once (Not available for a drug, All there, Some missing)
function blsSetRange(di, ci, id, len, from, to, val) {
  var c = getCHOCard(di); if (c.taskDone || !scDayUnlocked(di)) return; var A = blsAns(c, ci), str = String(A[id] || '');
  while (str.length < len) str += '-'; var a = str.split(''); for (var i = from; i < to; i++) a[i] = val; blsSet(di, ci, id, a.join(''));
}

// what an item's answer means, in words, for fixes and lists (null = fine)
function blsItemGap(s, str, i) {
  var c = str.charAt(i), st = blsItemState(s, str, i); if (st !== 'n') return null;
  if (s.ty === 'train') return c === 'n' ? blsT('trained, no certificate', 'प्रशिक्षित, प्रमाणपत्र नहीं') : blsT('not trained', 'प्रशिक्षण नहीं');
  if (s.ty === 'equip') return c === 'b' ? blsT('broken', 'ख़राब') : blsT('not available', 'उपलब्ध नहीं');
  if (s.ty === 'drug' || s.ty === 'stock') return blsT('out of stock', 'स्टॉक खत्म');
  if (s.ty === 'somerec') return blsT('not recorded', 'दर्ज नहीं');
  return blsT('missing', 'नहीं है');
}

(function () {
  var base = blsRowHTML;
  blsRowHTML = function (di, ci, s, v, single) {
    if (!s || s.kind !== 'list' || !/^(train|drug|equip|some|somerec)$/.test(s.ty)) return base.apply(this, arguments);
    var hi = blsHi(), str = String(v || ''), len = s.items.length, W = BLS_ITEMBTN[s.ty];
    var txt = (function () { var h = base.call(this, di, ci, Object.assign({}, s, { items: [] }), '', single); var m = h.match(/^<div class="bls-row">([\s\S]*?)<div class="bls-items">/); return m ? m[1] : ''; })();
    var q = function (x) { return '\'' + String(x).replace(/\\/g, '\\\\').replace(/'/g, '\\\'') + '\''; };
    var one = function (n, val, lab, extra) { var on = str.charAt(n) === val; return '<button type="button" aria-pressed="' + on + '" class="bls-ib' + (on ? ' on' : '') + (extra || '') + '" onclick="blsSetItem(' + di + ',' + ci + ',' + q(s.id) + ',' + n + ',' + len + ',' + q(val) + ')">' + (on ? '✓ ' : '') + blsE(blsT(lab[0], lab[1])) + '</button>'; };
    var range = function (from, to, val, lab, on, keep) { return '<button type="button" aria-pressed="' + on + '" class="bls-ib' + (on ? ' on' : '') + '" onclick="' + (keep ? 'void(0)' : 'blsSetRange(' + di + ',' + ci + ',' + q(s.id) + ',' + len + ',' + from + ',' + to + ',' + q(val) + ')') + '">' + (on ? '✓ ' : '') + blsE(blsT(lab[0], lab[1])) + '</button>'; };
    var chip = function (n, val, label, on, cls) { return '<button type="button" aria-pressed="' + on + '" class="bls-chp' + (on ? ' on' : '') + (cls || '') + '" onclick="blsPartTap(' + di + ',' + ci + ',' + q(s.id) + ',' + n + ',' + len + ',' + q(val) + ')">' + blsE(label) + '</button>'; };
    var body = '';
    if (s.ty === 'train') {
      body = s.items.map(function (it, n) {
        var na = it.na ? '<button type="button" class="bls-na' + (str.charAt(n) === 'x' ? ' on' : '') + '" onclick="blsSetItem(' + di + ',' + ci + ',' + q(s.id) + ',' + n + ',' + len + ',\'x\')">' + (str.charAt(n) === 'x' ? '✓ ' : '') + blsE(blsT('Not applicable', 'लागू नहीं')) + '</button>' : '';
        return '<div class="bls-it bls-it3"><div class="bls-ith"><span>' + blsE(it.n) + '</span>' + na + '</div><div class="bls-g3">' + one(n, '0', W[0]) + one(n, 'n', W[1]) + one(n, '1', W[2]) + '</div></div>';
      }).join('');
    } else if (s.ty === 'equip') {
      body = s.items.map(function (it, n) { return '<div class="bls-it bls-it3"><div class="bls-ith"><span>' + blsE(it.n) + '</span></div><div class="bls-g3">' + one(n, '1', W[0]) + one(n, 'b', W[1]) + one(n, '0', W[2]) + '</div></div>'; }).join('');
    } else if (s.ty === 'drug') {
      var seen = {};
      s.items.forEach(function (it, n) {
        if (it.g < 0) { body += '<div class="bls-it bls-it3"><div class="bls-ith"><span>' + blsE(it.n) + '</span></div><div class="bls-g2">' + one(n, '1', BLS_ITEMBTN.stock[0]) + one(n, '0', BLS_ITEMBTN.stock[1]) + '</div></div>'; return; }
        if (seen[it.g]) return; seen[it.g] = 1;
        var idx = []; s.items.forEach(function (x, k) { if (x.g === it.g) idx.push(k); });
        var from = idx[0], to = idx[idx.length - 1] + 1, cs = idx.map(function (k) { return str.charAt(k); });
        var isNo = cs.every(function (c) { return c === '0'; }), isYes = !isNo && cs.every(function (c) { return c === '1' || c === 'a'; }) && cs.some(function (c) { return c === '1' || c === 'a'; });
        var head = '<div class="bls-ith"><span>' + blsE(it.gn) + '</span></div><div class="bls-g2">' + range(from, to, 'a', W[0], isYes, isYes) + range(from, to, '0', W[1], isNo) + '</div>';
        var sub = '';
        if (isYes) {
          var any = cs.some(function (c) { return c === '1'; });
          sub = '<div class="bls-sub"><span>' + blsE(blsT('Tap each one that is in stock and not expired', 'जो स्टॉक में है और एक्सपायर नहीं, उस पर टैप करें')) + '</span><div class="bls-chps">'
            + idx.map(function (k) { var on = str.charAt(k) === '1'; return chip(k, on ? 'a' : '1', s.items[k].f, on); }).join('') + '</div>'
            + '<small' + (any ? '' : ' class="need"') + '>' + blsE(any ? blsT(cs.filter(function (c) { return c === '1'; }).length + ' of ' + idx.length + ' in stock', idx.length + ' में से ' + cs.filter(function (c) { return c === '1'; }).length + ' स्टॉक में') : blsT('Tap at least one to finish this drug', 'इस दवा को पूरा करने के लिए कम से कम एक पर टैप करें')) + '</small></div>';
        }
        body += '<div class="bls-it bls-it3">' + head + sub + '</div>';
      });
    } else {
      // every part visible from the start: tap what is there; "All N …" at the end; untapped = missing once one is tapped
      var cs = []; for (var i = 0; i < len; i++) cs.push(str.charAt(i) || '-');
      var nY = cs.filter(function (c) { return c === '1'; }).length, none = cs.every(function (c) { return c === '0'; }), all = nY === len;
      var rec = s.ty === 'somerec', miss = nY ? s.items.filter(function (it, n) { return cs[n] !== '1'; }).map(function (it) { return it.n; }) : [];
      var allLab = rec ? ['All ' + len + ' recorded', 'सभी ' + len + ' दर्ज'] : ['All ' + len + ' there', 'सभी ' + len + ' मौजूद'];
      var noneLab = rec ? ['None recorded', 'कुछ भी दर्ज नहीं'] : ['None of these', 'इनमें से कोई नहीं'];
      body = '<div class="bls-it bls-it3"><div class="bls-sub bls-pick"><span>' + blsE(blsT(rec ? 'Tap each one that is recorded' : 'Tap each one that is there', rec ? 'जो दर्ज है उस पर टैप करें' : 'जो मौजूद है उस पर टैप करें')) + '</span><div class="bls-chps">'
        + s.items.map(function (it, n) { var on = cs[n] === '1'; return chip(n, on ? '-' : '1', it.n, on); }).join('')
        + range(0, len, '1', allLab, all, all).replace('class="bls-ib', 'class="bls-ib bls-all') + '</div>'
        + '<div class="bls-pk-f"><small' + (nY || none ? '' : ' class="need"') + '>' + blsE(none ? blsT('None of them', 'कोई नहीं') : nY ? (all ? blsT('All ' + len + ' in place', 'सभी ' + len + ' मौजूद') : blsT(nY + ' of ' + len + (rec ? ' recorded' : ' there') + ' · missing: ' + miss.join(', '), len + ' में से ' + nY + ' · नहीं: ' + miss.join(', '))) : blsT('Tap what you find, or “All” if everything is there', 'जो मिले उस पर टैप करें, सब हो तो “सभी”')) + '</small>'
        + '<button type="button" class="bls-na' + (none ? ' on' : '') + '" onclick="blsSetRange(' + di + ',' + ci + ',' + q(s.id) + ',' + len + ',0,' + len + ',\'0\')">' + (none ? '✓ ' : '') + blsE(blsT(noneLab[0], noneLab[1])) + '</button></div></div></div>';
    }
    return '<div class="bls-row">' + txt + '<div class="bls-items">' + body + '</div></div>';
  };
})();

// 26 Nov 2026 (live release): answers saved before the item rows changed shape (e.g. one answer per drug, now one per form)
// no longer line up with the rows. On a day not yet submitted, such a line is cleared so staff answer it again with the new
// rows; a submitted day keeps its saved scores untouched.
function blsShapeFix(di) {
  var c = getCHOCard(di), d = getDay(di); if (!c || !d || !d.cps || c.taskDone || !c.blAns) return 0;
  var n = 0;
  d.cps.forEach(function (cp, ci) { var A = c.blAns[ci]; if (!cp || !A) return; var hit = false;
    blsSlots(cp).forEach(function (s) { if (s.kind !== 'list' || !s.items) return; var v = A[s.id]; if (v == null || v === '') return;
      if (String(v).length !== s.items.length) { delete A[s.id]; hit = true; n++; } });
    if (hit) { try { blsApply(di, ci); } catch (e) {} } });
  if (n) { try { saveCHOState(); } catch (e) {} }
  return n;
}
(function () { var orig = blsRender; blsRender = function (di) { try { if (!(_bls && _bls.di === di)) blsShapeFix(di); } catch (e) {} return orig.apply(this, arguments); }; })();
