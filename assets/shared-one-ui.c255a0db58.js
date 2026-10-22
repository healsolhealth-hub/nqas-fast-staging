// ══════════════════════════════════════════════════════════════
// ONE DESIGN for the staff app and the Facility dashboard, every facility type (canvas "Staff app & Facility dashboard —
// one design", agreed 22 Oct 2026). Small shared pieces used by the Sub-Centre app (sc/…) and UPHC · PHC · CHC (dept/…).
// ══════════════════════════════════════════════════════════════
function oneE(s) { return scEsc(s == null ? '' : String(s)); }
// the four programme phases as a slim strip inside the hero; idx 0–3 (−1 before Day 1, 4 after the last day)
function oneStrip(idx) { var h = '<div class="one-strip" aria-hidden="true">'; for (var i = 0; i < 4; i++) h += '<i class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"></i>'; return h + '</div>'; }
function onePhaseIdx(day, S) { return !day || day < 1 ? -1 : day <= S.bN ? 0 : day <= S.iN ? 1 : day <= S.eN ? 2 : day <= S.days ? 3 : 4; }
// counters row: [[value, label, cls]]
function oneCounters(list) { return '<div class="one-cnt">' + list.map(function (x) { return '<div><b class="' + (x[2] || '') + '">' + oneE(x[0]) + '</b><small>' + oneE(x[1]) + '</small></div>'; }).join('') + '</div>'; }
// segmented tabs: [[key, label]], on, js(key) → onclick string
function oneSeg(list, on, js) { return '<div class="one-seg" role="tablist">' + list.map(function (x) { return '<button type="button" role="tab" aria-selected="' + (x[0] === on) + '" class="' + (x[0] === on ? 'on' : '') + '" onclick="' + js(x[0]) + '">' + oneE(x[1]) + '</button>'; }).join('') + '</div>'; }
// baseline ○ → now ● rows (the Readiness tab's design), in a phone box
function oneDumbRows(rows, mark, more) {
  if (!rows.length) return '<div class="one-card"><p class="one-dim">' + oneE(_appLang === 'hi' ? 'अभी कोई स्कोर नहीं' : 'No scores yet') + '</p></div>';
  return '<div class="one-card fpr-phone one-rows">' + rows.map(function (r) { return fprDumb(r.now, r.base, mark, r.label, r.sub || ''); }).join('')
    + '<div class="fpr-legend"><span><i class="b"></i> ' + oneE(_appLang === 'hi' ? 'बेसलाइन' : 'baseline') + '</span><span><i class="g"></i> ' + oneE(_appLang === 'hi' ? 'अभी' : 'now') + '</span><span><i class="mk"></i> ' + mark + '%</span>' + (more ? '<span>' + oneE(more) + '</span>' : '') + '</div></div>';
}
// the readiness ring card of Progress: my readiness + baseline / implementation / end-line + facility line
function oneRingCard(o) {
  var hi = _appLang === 'hi', row = function (l, v, cls) { return '<div><span>' + oneE(l) + '</span><b class="' + (cls || '') + '">' + v + '</b></div>'; };
  return '<div class="one-card one-ring"><div class="one-ring-c">' + nfRing(o.pct || 0, null, 104, 11, 'var(--teal,#1E6B5E)', '#E3ECE9') + '<span><b>' + (o.pct == null ? '—' : o.pct + '%') + '</b><small>' + oneE(o.label || (hi ? 'मेरी तैयारी' : 'my readiness')) + '</small></span></div>'
    + '<div class="one-ring-l">' + row(hi ? 'बेसलाइन' : 'Baseline', o.base == null ? '—' : o.base + '%')
    + row(hi ? 'क्रियान्वयन' : 'Implementation', o.impl == null ? '<small>' + oneE(o.implFrom || '') + '</small>' : o.impl + '%' + (o.base != null ? ' · ' + (o.impl - o.base >= 0 ? '+' : '') + (o.impl - o.base) : ''), o.impl != null && o.base != null && o.impl < o.base ? 'r' : '')
    + row(hi ? 'एंड-लाइन' : 'End-line', o.end == null ? '<small>' + oneE(o.endFrom || '') + '</small>' : o.end + '%')
    + '<p>' + oneE(o.foot || '') + '</p></div></div>';
}
// profile card of Me
function oneProfile(o) { return '<div class="one-card one-prof"><span class="one-av">' + oneE(String(o.name || '?').charAt(0).toUpperCase()) + '</span><div><b>' + oneE(o.name) + '</b><small>' + oneE(o.sub) + '</small><div class="one-chips">' + (o.chips || []).map(function (c) { return '<span class="' + (c[1] || '') + '">' + c[0] + '</span>'; }).join('') + '</div></div></div>'; }
// "My package" / "My departments" card
function onePkgCard(title, items, note) { return '<div class="one-card one-pkg"><b>' + oneE(title) + '</b>' + items.map(function (x) { return '<span>' + oneE(x) + '</span>'; }).join('') + (note ? '<small>' + oneE(note) + '</small>' : '') + '</div>'; }
// impact card: {title, nums:[[v,l]], btn:{l,js}}
function oneImpact(o) { return '<div class="one-imp"><small>' + oneE(_appLang === 'hi' ? 'मेरा प्रभाव' : 'MY IMPACT') + '</small><b>' + o.title + '</b>' + (o.nums && o.nums.length ? '<div class="one-imp-n">' + o.nums.map(function (n) { return '<div><b>' + oneE(n[0]) + '</b><small>' + oneE(n[1]) + '</small></div>'; }).join('') + '</div>' : '') + (o.line ? '<p>' + o.line + '</p>' : '') + (o.btn ? '<button type="button" onclick="' + o.btn.js + '">' + oneE(o.btn.l) + '</button>' : '') + '</div>'; }
// certificate checklist: {title, sub, rows:[[state 'ok'|'todo'|'wait', label, sub, value]], note, btn}
function oneCert(o) { return '<div class="one-card one-cert" id="' + (o.id || '') + '"><b>' + oneE(o.title) + '</b><small>' + oneE(o.sub) + '</small><div class="one-cert-g">' + o.rows.map(function (r) { return '<i class="' + r[0] + '">' + (r[0] === 'ok' ? '✓' : '○') + '</i><span>' + oneE(r[1]) + (r[2] ? '<small>' + oneE(r[2]) + '</small>' : '') + '</span><b>' + oneE(r[3]) + '</b>'; }).join('') + '</div>' + (o.note ? '<p>' + oneE(o.note) + '</p>' : '') + (o.btn || '') + '</div>'; }
// Facility dashboard: programme card (four phases, next date) and "If we graduated today"
function oneProgCard(o) {   // {S, day, gradDate (iso), next}
  var S = o.S, idx = onePhaseIdx(o.day, S), hi = _appLang === 'hi', ph = [[hi ? 'बेसलाइन' : 'Baseline', 1, S.bN], [hi ? 'क्रियान्वयन' : 'Implementation', S.bN + 1, S.iN], [hi ? 'एंड-लाइन' : 'End-line', S.iN + 1, S.eN], [hi ? 'तैयारी सप्ताह' : 'Readiness week', S.eN + 1, S.days]];
  return '<div class="one-card one-prog"><div class="one-row"><b>' + oneE(hi ? 'कार्यक्रम' : 'Programme') + '</b><small>' + oneE(o.gradDate ? (hi ? 'ग्रेजुएशन ' : 'graduation ') + nfDateTxt(o.gradDate, true) : '') + '</small></div><div class="one-prog-g">'
    + ph.map(function (p, i) { return '<div class="' + (i < idx ? 'd' : i === idx ? 'c' : '') + '"><b>' + oneE(p[0]) + '</b><small>' + (hi ? 'दिन ' : 'Days ') + p[1] + '–' + p[2] + '</small></div>'; }).join('') + '</div>' + (o.next ? '<small class="one-dim">' + oneE(o.next) + '</small>' : '') + '</div>';
}
function oneIfGrad(o) {   // {pct, word, cls, why}
  return '<div class="one-card one-ifg">' + nfRing(o.pct || 0, null, 64, 7, 'var(--teal,#1E6B5E)', '#E3ECE9').replace('<svg', '<svg aria-hidden="true"') + '<span class="one-ifg-p">' + (o.pct == null ? '—' : o.pct + '%') + '</span><div><b>' + oneE(_appLang === 'hi' ? 'अगर आज ग्रेजुएशन हो' : 'If we graduated today') + '</b><span class="one-tag ' + (o.cls || '') + '">' + oneE(o.word) + '</span><small>' + oneE(o.why || '') + '</small></div></div>';
}
function oneQuick(list) { return '<div class="one-qa">' + list.map(function (x) { return '<button type="button" onclick="' + x[2] + '"><span class="' + (x[3] || '') + '"><i class="ti ' + x[0] + '"></i></span>' + oneE(x[1]) + '</button>'; }).join('') + '</div>'; }
