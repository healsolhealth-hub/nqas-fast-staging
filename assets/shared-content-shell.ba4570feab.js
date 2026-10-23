// ══════════════════════════════════════════════════════════════
// CONTENT — one editor for Sub-Centre, UPHC, PHC and CHC (23 Oct 2026, review items C1–C13).
//   One header: type tabs · one section row (Checkpoints · Day plans · Standards · Import / export) · one publish bar.
//   Two engines underneath: the Sub-Centre Checkpoint Master (sc/cp-master.js + extensions, draft in shared/sc-draft.js)
//   and the UPHC / PHC / CHC master (dept/master*.js). This file only arranges them; no data changes.
//   Phone (< 700 px wide): view only — the list, Standards and a checkpoint's details; no editing, import or publishing.
//   Approved design: canvas "Content editor — merged" (23 Oct 2026).
// ══════════════════════════════════════════════════════════════
var _ce = { hi: false, sec: 'cps', more: false };
try { _ce.hi = localStorage.getItem('nf-ce-hi') === '1'; } catch (e) {}
var CE_TYPES = [['sc', 'Sub-Centre'], ['uphc', 'UPHC'], ['phc', 'PHC'], ['chc', 'CHC']];
var CE_SECS = [['cps', 'Checkpoints'], ['plans', 'Day plans'], ['stds', 'Standards'], ['imp', 'Import / export']];
function ceE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ceOn() { return typeof appMode !== 'undefined' && appMode === 'sc-admin' && typeof _nfOv !== 'undefined' && (_nfOv.view === 'editor' || _nfOv.view === 'dm'); }
function ceType() { return _nfOv.view === 'editor' ? 'sc' : ((typeof _nm !== 'undefined' && _nm.ui && _nm.ui.type) || 'uphc'); }
function ceRO() { return (window.innerWidth || 1280) < 700; }
function ceSec() {
  if (ceType() === 'sc') { var u = typeof _scCpmUi !== 'undefined' ? _scCpmUi : {}; if (u.tab === 'days' || u.view === 'plans') return 'plans'; if (u.view === 'tree') return 'stds'; if (u.view === 'imp') return 'imp'; return 'cps'; }
  var s = _nm.ui.screen; return s === 'plan' ? 'plans' : s === 'stds' ? 'stds' : s === 'excel' ? 'imp' : 'cps';
}
function ceTypeLabel(T) { var x = CE_TYPES.find(function (t) { return t[0] === T; }); return x ? x[1] : String(T).toUpperCase(); }
function ceDate(iso) { try { return typeof fpShortDate === 'function' ? fpShortDate(String(iso).slice(0, 10)) : String(iso).slice(0, 10); } catch (e) { return String(iso || '').slice(0, 10); } }

// ── header ──
function cePubHTML() {
  var T = ceType(), n = 0, v = 0, at = '', by = '', vers = '', disc = '', pub = '';
  if (T === 'sc') {
    n = (typeof SCD !== 'undefined' && SCD.on) ? scdCount() : 0; var m = (typeof SCD !== 'undefined' && SCD.meta) || {}; v = m.v || 1; at = m.at || ''; by = m.by || '';
    vers = "scdOpenPub('vers')"; disc = 'scdDiscard()'; pub = "scdOpenPub('pub')";
  } else {
    if (!_nm.base[T] || !_nm.draft[T]) return '<div class="ce-pub"><span>Loading the ' + ceE(ceTypeLabel(T)) + ' draft…</span></div>';
    n = nmChangeCount(T); var L = _nm.live[T] || {}; v = L.v || 0; at = L.from || L.at || ''; by = L.by || '';
    vers = 'nmPubOpen()'; disc = 'nmDiscardAsk()'; pub = 'nmPubOpen()';
  }
  var seen = v ? 'version ' + v + (at ? ' (published ' + ceE(ceDate(at)) + (by ? ' by ' + ceE(by) : '') + ')' : '') : 'the checklist as it is — not published yet';
  return '<div class="ce-pub' + (n ? ' warn' : '') + '" role="status"><span class="ce-pubt">' + (n
      ? '<b>' + n + ' change' + (n === 1 ? '' : 's') + ' in the ' + ceE(ceTypeLabel(T)) + ' draft</b> — facilities still see ' + seen + '. Nothing changes for them until you publish.'
      : '<b>No changes in the ' + ceE(ceTypeLabel(T)) + ' draft</b> — facilities see ' + seen + '.') + '</span>'
    + '<span class="ce-puba"><button type="button" class="ce-b" onclick="' + vers + '">Versions</button>'
    + (n ? '<button type="button" class="ce-b" onclick="' + disc + '">Discard</button>' : '')
    + '<button type="button" class="ce-b p" onclick="' + pub + '">Review &amp; publish</button></span></div>';
}
function ceHeadHTML() {
  var T = ceType(), sec = ceSec(), ro = ceRO();
  ceFlags();
  var types = CE_TYPES.map(function (t) {
    var n = '';
    try { if (t[0] === 'sc' && typeof scCpmAll === 'function' && typeof _scCpmUi !== 'undefined') n = scCpmAll({ pkg: _scCpmUi.pkg === 'all' ? null : 'nqas_' + _scCpmUi.pkg }).filter(function (c) { return c.kind === 'nqas'; }).length.toLocaleString('en-IN'); else if (t[0] !== 'sc' && _nm.base[t[0]]) n = nmAll(t[0]).filter(function (c) { return !c.retired; }).length.toLocaleString('en-IN'); } catch (e) {}
    return '<button type="button" role="tab" aria-selected="' + (T === t[0]) + '" class="' + (T === t[0] ? 'on' : '') + '" onclick="ceGoType(\'' + t[0] + '\')">' + (ro && t[0] === 'sc' ? 'SC' : t[1]) + (n && !ro ? ' <em>' + n + '</em>' : '') + '</button>';
  }).join('');
  var secs = CE_SECS.filter(function (s) { return !(ro && s[0] === 'imp'); }).map(function (s) {
    return '<button type="button" role="tab" aria-selected="' + (sec === s[0]) + '" class="' + (sec === s[0] ? 'on' : '') + '" onclick="ceGoSec(\'' + s[0] + '\')">' + s[1] + '</button>';
  }).join('');
  var pk = '';
  if (T === 'sc' && typeof _scCpmUi !== 'undefined' && !(sec === 'plans' && _scCpmUi.tab === 'days')) pk = '<span class="ce-pkg" role="group" aria-label="Package">' + (sec === 'plans' ? [['12A', '12A'], ['12B', '12B']] : [['12A', '12A'], ['12B', '12B'], ['all', 'Both']]).map(function (p) {
    return '<button type="button" aria-pressed="' + (_scCpmUi.pkg === p[0]) + '" class="' + (_scCpmUi.pkg === p[0] ? 'on' : '') + '" onclick="ceSetPkg(\'' + p[0] + '\')">' + p[1] + '</button>'; }).join('') + '</span>';
  return '<div class="ce-hd"><div class="ce-ttl"><h1 class="hs-h1">Content</h1><small>' + (ro ? 'View only on a phone — open on a laptop to edit or publish' : 'Checkpoints, day plans and standards for every facility type · HealSol only') + '</small></div>'
    + '<div class="ce-types" role="tablist" aria-label="Facility type">' + types + '</div></div>'
    + '<div class="ce-secs"><div class="ce-secl" role="tablist" aria-label="Content section">' + secs + '</div>'
    + '<div class="ce-sacts">' + pk + (ro || sec === 'imp' || sec === 'plans' ? '' : '<button type="button" class="ce-b p ce-new" onclick="ceNew()">+ New checkpoint</button>') + '</div></div>'
    + (ro ? '' : cePubHTML())
    + (ro && sec === 'plans' && T !== 'sc' ? '<div class="ce-note">Day plans are shown and changed on a laptop.</div>' : '');
}
function ceFlags() {
  var b = document.body; if (!b) return;
  b.classList.toggle('ce-ro', ceRO()); b.classList.toggle('ce-hi', !!_ce.hi);
  b.setAttribute('data-cesec', ceSec()); b.setAttribute('data-cetype', ceType());
}
function ceHeadPaint() {
  if (!ceOn()) return;
  var ct = document.getElementById('hs-ctabs'); if (!ct) return;
  ct.innerHTML = ceHeadHTML(); ct.removeAttribute('role');
}
// the old header painters now draw the Content header
scdTypeTabs = ceHeadHTML;

// ── navigation ──
async function ceGoType(T) {
  if (T === ceType() && ceOn()) return;
  if (typeof nmLeaveEdit === 'function' && _nfOv.view === 'dm' && !await nmLeaveEdit()) return;
  var sec = _ce.sec || 'cps';
  if (T === 'sc') { nfAdminView('editor'); setTimeout(function () { ceGoSec(sec); }, 0); return; }
  if (_nfOv.view !== 'dm') nfAdminView('dm');
  await nmOpen(T);
  if (sec !== 'cps') ceGoSec(sec); else ceHeadPaint();
}
async function ceGoSec(k) {
  if (ceRO() && k === 'imp') k = 'cps';
  _ce.sec = k;
  if (ceType() === 'sc') {
    if (typeof scCpmTab !== 'function') return;
    if (k === 'plans') { if (_scCpmUi.pkg === 'all') _scCpmUi.pkg = '12B'; _scCpmUi.view = 'plans'; scCpmTab('master'); }
    else { _scCpmUi.view = k === 'stds' ? 'tree' : k === 'imp' ? 'imp' : 'cps'; _scCpmUi.check = ''; scCpmTab('master'); }
  } else {
    if (typeof nmLeaveEdit === 'function' && !await nmLeaveEdit()) return;
    _nm.ui.dirty = false;
    if (k === 'plans') { await nmPlanOpen(_nm.ui.dept); } else nmGo(k === 'stds' ? 'stds' : k === 'imp' ? 'excel' : 'list');
  }
  ceHeadPaint();
}
function ceNew() { if (ceRO()) return; if (ceType() === 'sc') scCpmEdit(null); else nmEditOpen(null); }
function ceSetPkg(p) { _scCpmUi.pkg = p; _scCpmUi.limit = 600; scCpmRender(); ceHeadPaint(); }
function ceSetHi(on) {
  _ce.hi = !!on; try { localStorage.setItem('nf-ce-hi', on ? '1' : '0'); } catch (e) {}
  ceFlags(); if (ceType() !== 'sc' && _nm.ui.screen === 'list') nmRender();
}

// ── Sub-Centre list: tiles as filters, fewer filters, labelled buttons, key line, Import / export ──
function ceScChanged() {
  var ids = {}; try { if (typeof SCD !== 'undefined' && SCD.on) scdItems().forEach(function (it) { if (it.key.indexOf('cp:') === 0) ids[it.key.slice(3)] = 1; }); } catch (e) {}
  return ids;
}
function ceScTilesHTML() {
  var u = _scCpmUi, all = scCpmAll({ pkg: u.pkg === 'all' ? null : 'nqas_' + u.pkg, includeRetired: true }), ch = ceScChanged(), iss = 0;
  try { iss = scCpmChecks(u.pkg).filter(function (c) { return c.level === 'error' || c.level === 'warn'; }).length; } catch (e) {}
  var n = { active: all.filter(function (c) { return !c.retired && c.kind === 'nqas'; }).length, attn: iss, changed: all.filter(function (c) { return ch[c.id]; }).length, retired: all.filter(function (c) { return c.retired; }).length };
  var cur = u.view === 'checks' ? 'attn' : u.ceChanged ? 'changed' : u.kind === 'retired' ? 'retired' : u.kind === 'nqas' ? 'active' : '';
  var t = function (k, l, sub, cls) { return '<button type="button" class="ce-tile' + (cls ? ' ' + cls : '') + (cur === k ? ' on' : '') + '" aria-pressed="' + (cur === k) + '" onclick="ceScTile(\'' + k + '\')"><span>' + l + '</span><b>' + n[k].toLocaleString('en-IN') + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>'; };
  return '<div class="ce-tiles">' + t('active', 'All active · ' + (u.pkg === 'all' ? 'both packages' : u.pkg), 'NQAS checkpoints') + t('attn', 'Needs attention', 'checks to review', n.attn ? 'warn' : '')
    + t('changed', 'Changed in draft', '') + t('retired', 'Retired', '') + '</div>';
}
function ceScTile(k) {
  var u = _scCpmUi; u.check = ''; u.limit = 600;
  if (k === 'attn') { u.view = 'checks'; }
  else { u.view = 'cps'; u.ceChanged = k === 'changed'; u.kind = k === 'retired' ? 'retired' : k === 'changed' ? '' : 'nqas'; }
  scCpmRender(); ceHeadPaint();
}
function ceScImpHTML() {
  return '<div class="scm-wrap ce-imp">'
    + '<section class="ce-card"><b>Import a revised checklist</b><p>Upload the revised NQAS Sub-Centre checklist (Excel). You see every new, changed and missing checkpoint before anything goes into the draft.</p>'
    + '<button type="button" class="ce-b p" onclick="scImpPick()">Choose Excel file</button></section>'
    + '<section class="ce-card"><b>Standard and ME titles</b><p>Paste titles for Standards and Measurable Elements, or add new codes.</p>'
    + '<button type="button" class="ce-b" onclick="scRegImport()">Paste titles / add codes</button></section>'
    + '<section class="ce-card"><b>Linked checks</b><p>Answers that must agree between checkpoints — import the reviewed sheet or download the current one.</p>'
    + '<button type="button" class="ce-b" onclick="nfLxOpen(null)">Open linked checks</button></section>'
    + '<section class="ce-card"><b>Download</b><p>All Sub-Centre checkpoints in the current package as a CSV file.</p>'
    + '<button type="button" class="ce-b" onclick="scCpmExport()">Download CSV</button></section>'
    + (typeof scCritEdit === 'function' ? '<section class="ce-card"><b>NQAS criteria</b><p>Overall, Area of Concern and Standard minimums used for Sub-Centre graduation.</p><button type="button" class="ce-b" onclick="scCritEdit()">Edit criteria</button></section>' : '')
    + '</div>';
}
var CE_KEEP_RX = /_scCpmUi\.(aoc|svc|role)=/;
function ceScTidy(p) {
  var wrap = p.querySelector('.scm-wrap'); if (!wrap) return;
  if (_scCpmUi.view === 'tree') return;
  if (!wrap.querySelector('.ce-tiles')) wrap.insertAdjacentHTML('afterbegin', ceScTilesHTML());
  if (_scCpmUi.view === 'checks') return;
  var f = wrap.querySelector('.scm-filters');
  if (f && !f.dataset.ce) {
    f.dataset.ce = '1';
    var more = document.createElement('div'); more.className = 'scm-filters ce-more' + (_ce.more ? ' open' : ''); more.id = 'ce-more';
    var act = 0;
    [].slice.call(f.children).forEach(function (el) {
      if (el.matches('input.scx-in')) return;
      if (el.tagName === 'SELECT' && CE_KEEP_RX.test(el.getAttribute('onchange') || '')) return;
      if (el.tagName === 'SELECT' && el.options[0] && el.options[0].text === 'All service packages') return;
      var oc = el.getAttribute && (el.getAttribute('onchange') || '');
      if (el.tagName === 'SELECT' && /_scCpmUi\.kind=/.test(oc)) { el.remove(); return; }
      if (el.tagName === 'SELECT' && el.value && !el.disabled) act++;
      var cb = el.querySelector && el.querySelector('input[type=checkbox]'); if (cb && cb.checked) act++;
      more.appendChild(el);
    });
    var hi = document.createElement('label'); hi.className = 'ce-sw'; hi.innerHTML = '<input type="checkbox" ' + (_ce.hi ? 'checked ' : '') + 'onchange="ceSetHi(this.checked)"> Show Hindi'; f.appendChild(hi);
    var mb = document.createElement('button'); mb.type = 'button'; mb.className = 'ce-b ce-moreb'; mb.setAttribute('aria-expanded', String(!!_ce.more)); mb.setAttribute('aria-controls', 'ce-more');
    mb.textContent = (_ce.more ? 'Fewer filters' : 'More filters') + (act ? ' (' + act + ' on)' : ''); mb.onclick = function () { _ce.more = !_ce.more; scCpmRender(); }; f.appendChild(mb);
    f.parentNode.insertBefore(more, f.nextSibling);
  }
  // one "New checkpoint" (in the header) — drop the duplicate in the list bar
  [].forEach.call(wrap.querySelectorAll('.scm-bar button'), function (b) { if (/scCpmEdit\(null\)/.test(b.getAttribute('onclick') || '')) b.remove(); });
  var list = wrap.querySelector('.scm-list');
  if (list && !wrap.querySelector('.ce-key')) list.insertAdjacentHTML('afterend', '<div class="ce-key"><b>How it is checked:</b> SI staff interview · RR record review · OB observation · CI client interview &nbsp;·&nbsp; <b>Days:</b> baseline, implementation and end-line day — tap the day to move it</div>');
}
(function () {
  if (typeof scCpmRender !== 'function') return;
  var oRow = scCpmRowHTML;
  scCpmRowHTML = function (c) {
    var h = oRow.apply(this, arguments);
    h = h.replace(/(<button class="scx-btn sm ghost nflx-cnt"[^>]*>)🔗( \d+)?(<\/button>)/, function (m, a, n, b) { return a + 'Linked' + (n || '') + b; })
      .replace(/(<button[^>]*title="How to fix"[^>]*>)🔧(✎)?(<\/button>)/, function (m, a, e, b) { return a + '<i class="ti ti-tools"></i> How to fix' + (e ? ' ✎' : '') + b; })
      .replace('>📅 Baseline', '><i class="ti ti-calendar"></i> Baseline');
    return h;
  };
  var oF = scCpmFiltered;
  scCpmFiltered = function () { var L = oF.apply(this, arguments); if (!_scCpmUi.ceChanged) return L; var ch = ceScChanged(); return L.filter(function (c) { return ch[c.id]; }); };
  var oR = scCpmRender;
  scCpmRender = function () {
    var p = document.getElementById('scm-panel');
    if (_scCpmUi.tab === 'master' && _scCpmUi.view === 'imp') { p = scCpmEnsurePanel(); if (p) p.innerHTML = ceScImpHTML(); ceHeadPaint(); return; }
    var r = oR.apply(this, arguments);
    try { p = document.getElementById('scm-panel'); if (p && _scCpmUi.tab === 'master') ceScTidy(p); ceHeadPaint(); } catch (e) { console.warn('[CE] sc', e); }
    return r;
  };
  if (typeof scCpmTab === 'function') { var oT = scCpmTab; scCpmTab = function () { var r = oT.apply(this, arguments); try { ceHeadPaint(); } catch (e) {} return r; }; }
})();
// default: the list shows every active NQAS checkpoint, not the old "Day cards" tab
if (typeof _scCpmUi !== 'undefined') { _scCpmUi.tab = 'master'; _scCpmUi.view = _scCpmUi.view || 'cps'; }

// ── keep the header in step ──
(function () {
  if (typeof nmRender === 'function') { var oN = nmRender; nmRender = function () { var r = oN.apply(this, arguments); try { if (_nfOv.view === 'dm') ceHeadPaint(); } catch (e) {} return r; }; }
  if (typeof scdBar === 'function') { var oB = scdBar; scdBar = function () { var r = oB.apply(this, arguments); try { ceHeadPaint(); } catch (e) {} return r; }; }
  if (typeof scdBadge === 'function') { var oG = scdBadge; scdBadge = function () { var r = oG.apply(this, arguments); try { ceHeadPaint(); } catch (e) {} return r; }; }
  if (typeof nfAdminView === 'function') {
    var oV = nfAdminView;
    nfAdminView = function (v) {
      var was = _nfOv.view, r = oV.apply(this, arguments);
      try {
        if (v === 'editor' && was !== 'editor' && typeof scCpmTab === 'function') { if (_scCpmUi.tab !== 'days') setTimeout(function () { if (_nfOv.view === 'editor') scCpmTab('master'); }, 0); }
        ceHeadPaint();
      } catch (e) { console.warn('[CE] view', e); }
      return r;
    };
  }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (!ceOn()) return; var was = document.body.classList.contains('ce-ro'); ceHeadPaint(); if (was !== ceRO() && ceRO() && ceSec() === 'imp') ceGoSec('cps'); }, 200); });
})();
