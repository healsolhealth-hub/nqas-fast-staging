// ══════════════════════════════════════════════════════════════
// CHECKPOINT MASTER — HealSol Admin screens (Step 2b). Admin menu → "Checkpoints" (view 'dm').
// Screens: list (departments · table · side panel), edit (Details · Content · Where used), To check, Excel.
// Approved design: canvas "Card Editor & Checkpoint Master" (19 Oct 2026).
// ══════════════════════════════════════════════════════════════
var NM_I = {
  back: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>',
  search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  down: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>',
  up: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 15V3"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/></svg>',
  x: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  play: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
  ok: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12l5 5 9-9"/></svg>',
  cal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  warn: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>'
};
function nmBox() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return null;
  var box = document.getElementById('nf-dm');
  if (!box) { box = document.createElement('div'); box.id = 'nf-dm'; box.dataset.nfv = 'dm'; main.insertBefore(box, main.firstChild); }
  return box;
}
async function nmOpen(T) {
  var u = _nm.ui; if (T) { u.type = T; u.dept = ''; u.sel = null; u.screen = 'list'; }
  var box = nmBox(); if (!box) return;
  if (!_nm.base[u.type] || !_nm.draft[u.type]) box.innerHTML = '<div class="nm-empty">Loading checkpoints…</div>';
  try { await nmLoad(u.type); }
  catch (e) { console.warn('[NM] load', e); box.innerHTML = '<div class="nm-empty">Could not load the ' + nmE(nmCfg(u.type).short || u.type) + ' checklist. <button type="button" class="nm-btn" onclick="nmOpen()">Try again</button></div>'; return; }
  if (!u.dept) u.dept = ((_nm.base[u.type].depts || [])[0] || {}).id || '';
  nmRender();
  // the other types' counts on the tabs, loaded quietly
  NM_TYPES.forEach(function (T) { if (!_nm.base[T]) nmLoadBase(T).then(function () { var el = document.querySelector('#nf-dm .nm-types'); if (el) el.outerHTML = nmTypeTabs(); }).catch(function () {}); });
}
function nmRender() {
  var box = nmBox(); if (!box || !_nm.base[_nm.ui.type]) return;
  var s = _nm.ui.screen;
  box.innerHTML = s === 'edit' ? nmEditHTML() : s === 'stds' ? nmStdsHTML() : s === 'tocheck' ? nmToCheckHTML() : s === 'excel' ? nmExcelHTML() : s === 'plan' ? nmPlanHTML() : s === 'publish' ? nmPubHTML() : nmListHTML();
}
function nmGo(screen) { _nm.ui.screen = screen; nmRender(); try { window.scrollTo(0, 0); } catch (e) {} }
function nmUi(k, v) { _nm.ui[k] = v; if (k !== 'limit') _nm.ui.limit = 400; if (k === 'dept' || k === 'aoc') _nm.ui.std = ''; nmRender(); }
function nmQ(v) { _nm.ui.q = v; clearTimeout(window._nmT); window._nmT = setTimeout(function () { _nm.ui.limit = 400; nmRender(); var i = document.getElementById('nm-q'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }, 250); }

// ── small pieces ──
function nmChip(m, off) { return '<span class="nm-m ' + (off ? 'off' : m.toLowerCase()) + '">' + nmE(m) + '</span>'; }
function nmTag(st) {
  return st === 'new' ? '<span class="nm-tag new">New</span>' : st === 'edited' ? '<span class="nm-tag ed">Edited</span>' : st === 'retired' ? '<span class="nm-tag ret">Retired</span>' : st === 'moved' ? '<span class="nm-tag mv">Moved</span>' : '';
}
function nmOpt(v, l, cur) { return '<option value="' + nmE(v) + '"' + (String(cur) === String(v) ? ' selected' : '') + '>' + nmE(l) + '</option>'; }
function nmDayTxt(T, id) { var d = nmDays(T)[id]; return d ? 'B ' + d.b + (d.i ? ' · I ' + d.i : '') : '—'; }
function nmTopHTML(title, sub) {
  var T = _nm.ui.type, n = nmChangeCount(T);
  return '<div class="nm-top"><div><h1>' + title + '</h1><small>' + sub + '</small></div>'
    + '<span class="nm-draft' + (n ? '' : ' none') + '">' + (n ? 'Draft · ' + n + ' change' + (n === 1 ? '' : 's') : 'Nothing to publish') + '</span>'
    + '<button type="button" class="nm-btn pri" onclick="nmPubOpen()">Review &amp; publish</button></div>';
}
function nmTypeTabs() {
  var u = _nm.ui;
  return '<div class="nm-types" role="tablist" aria-label="Facility type">' + NM_TYPES.map(function (T) {
    var B = _nm.base[T], n = B ? (nmAll(T).filter(function (c) { return !c.retired; }).length).toLocaleString('en-IN') : '';
    return '<button type="button" role="tab" aria-selected="' + (u.type === T) + '" class="' + (u.type === T ? 'on' : '') + '" onclick="nmOpen(\'' + T + '\')">' + nmE(nmCfg(T).short || T.toUpperCase()) + (n ? ' <span>· ' + n + '</span>' : '') + '</button>';
  }).join('') + '</div>';
}

// ── list (Content → Checkpoints, 23 Oct 2026: tiles are the filters, panel only when a row is picked) ──
function nmAttn(c) { return !c.retired && !c.method.length; }
function nmFiltered(noShow) {
  var u = _nm.ui, T = u.type, q = u.q.trim().toLowerCase();
  return nmAll(T).filter(function (c) {
    if (u.dept && c.dept !== u.dept) return false;
    if (!noShow) {
      var st = nmStatus(T, c.id);
      if (u.show === 'active' && c.retired) return false;
      if (u.show === 'retired' && !c.retired) return false;
      if (u.show === 'changed' && !st) return false;
      if (u.show === 'attn' && !nmAttn(c)) return false;
    }
    if (u.aoc && c.aoc !== u.aoc) return false;
    if (u.std && c.std !== u.std) return false;
    if (u.method === 'none' ? c.method.length : (u.method && c.method.indexOf(u.method) < 0)) return false;
    if (q && (c.id + ' ' + c.me + ' ' + c.t + ' ' + c.hi + ' ' + c.items.map(function (x) { return x.t; }).join(' ')).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function nmShowHi() { return typeof _ce !== 'undefined' && !!_ce.hi; }
function nmTilesHTML() {
  var u = _nm.ui, T = u.type, L = nmFiltered(true), n = { active: 0, attn: 0, changed: 0, retired: 0 };
  L.forEach(function (c) { if (c.retired) n.retired++; else n.active++; if (nmAttn(c)) n.attn++; if (nmStatus(T, c.id)) n.changed++; });
  var t = function (k, l, sub, cls) { return '<button type="button" class="ce-tile' + (cls ? ' ' + cls : '') + (u.show === k ? ' on' : '') + '" aria-pressed="' + (u.show === k) + '" onclick="nmUi(\'show\',\'' + k + '\')"><span>' + l + '</span><b>' + n[k].toLocaleString('en-IN') + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>'; };
  return '<div class="ce-tiles">' + t('active', 'All active', '') + t('attn', 'Needs attention', 'no assessment method', n.attn ? 'warn' : '') + t('changed', 'Changed in draft', '') + t('retired', 'Retired', '') + '</div>';
}
function nmDayTxt2(T, c) { var d = nmDays(T)[c.id]; return c.retired || !d ? '—' : 'Base ' + d.b + (d.i ? ' · Impl ' + d.i : ''); }
function nmListHTML() {
  var u = _nm.ui, T = u.type, B = _nm.base[T], data = B.data, all = nmAll(T), list = nmFiltered(), sel = u.sel ? nmGet(T, u.sel) : null, hi = nmShowHi();
  var cnt = {}, att = {}; all.forEach(function (c) { if (!c.retired) cnt[c.dept] = (cnt[c.dept] || 0) + 1; if (nmAttn(c)) att[c.dept] = (att[c.dept] || 0) + 1; });
  var h = nmTilesHTML()
    + '<div class="nm-body' + (sel ? ' has-sel' : '') + '">'
    + '<aside class="nm-depts" aria-label="Departments"><div class="nm-cap">Departments</div><div class="nm-dl">'
    + B.depts.map(function (d) { return '<button type="button" class="' + (u.dept === d.id ? 'on' : '') + '" onclick="nmUi(\'dept\',\'' + nmJ(d.id) + '\')"><span>' + nmE(d.name) + '</span><em>' + (att[d.id] ? '<i class="ce-dot" title="' + att[d.id] + ' need attention"></i>' : '') + (cnt[d.id] || 0) + '</em></button>'; }).join('')
    + '</div></aside>'
    + '<section class="nm-tbl" aria-label="Checkpoints">'
    + '<div class="nm-filt"><label class="nm-search">' + NM_I.search + '<span class="nm-sr">Search checkpoints</span><input id="nm-q" type="search" placeholder="Search ID, ME or text" value="' + nmE(u.q) + '" oninput="nmQ(this.value)"></label>'
    + '<label>Area<select onchange="nmUi(\'aoc\',this.value)">' + nmOpt('', 'All', u.aoc) + Object.keys(data.aocs || {}).map(function (a) { return nmOpt(a, a + ' · ' + String(data.aocs[a]).replace(/^[:\s]+/, ''), u.aoc); }).join('') + '</select></label>'
    + '<label>Method<select onchange="nmUi(\'method\',this.value)">' + nmOpt('', 'Any', u.method) + NM_METHODS.map(function (m) { return nmOpt(m, NM_MLABEL[m], u.method); }).join('') + nmOpt('none', 'None set', u.method) + '</select></label>'
    + '<label class="ce-sw"><input type="checkbox" ' + (hi ? 'checked ' : '') + 'onchange="ceSetHi(this.checked)"> Show Hindi</label></div>'
    + (u.std ? '<div class="ce-chips"><button type="button" class="ce-chip" onclick="nmUi(\'std\',\'\')" aria-label="Clear the Standard filter">Standard ' + nmE(u.std) + (data.stds && data.stds[u.std] ? ' · ' + nmE(String(data.stds[u.std]).slice(0, 60)) : '') + ' <span aria-hidden="true">×</span></button></div>' : '')
    + '<div class="nm-sum"><span><b>' + list.length + '</b> of ' + (cnt[u.dept] || 0) + ' in ' + nmE(nmDeptName(T, u.dept)) + '</span>'
    + (u.show === 'attn' && list.length ? '<button type="button" class="nm-lnk" onclick="nmGo(\'tocheck\')">Set methods quickly</button>' : '')
    + (list.length ? '<button type="button" class="nm-lnk ce-edit" onclick="nmBulkRoles()">Set “best filled by” for these ' + list.length + '</button>' : '') + '</div>'
    + '<div class="nm-scroll"><table><thead><tr><th scope="col">ID</th><th scope="col">Checkpoint</th><th scope="col">How it is checked</th><th scope="col">Day</th></tr></thead><tbody>'
    + list.slice(0, u.limit).map(function (c) {
      var st = nmStatus(T, c.id);
      return '<tr class="' + (u.sel === c.id ? 'on ' : '') + (c.retired ? 'ret' : '') + '" onclick="nmPick(\'' + nmJ(c.id) + '\')"><td class="id">' + nmE(c.id) + '</td>'
        + '<td class="t"><button type="button" class="nm-rowbtn" onclick="event.stopPropagation();nmPick(\'' + nmJ(c.id) + '\')">' + nmE(c.t) + '</button>'
        + (hi ? '<div class="ce-hi' + (c.hi ? '' : ' miss') + '">' + (c.hi ? nmE(c.hi) : 'No Hindi yet') + '</div>' : '') + '<div class="ce-sub">' + nmE(c.me) + ' · Area ' + nmE(c.aoc) + (nmAttn(c) ? ' <span class="nm-tag tc">Needs attention</span>' : '') + (st ? ' ' + nmTag(st) : '') + '</div></td>'
        + '<td class="m">' + (c.method.length ? c.method.map(function (m) { return '<span class="nm-m ' + (c.retired ? 'off' : m.toLowerCase()) + '">' + nmE(NM_MLABEL[m] || m) + '</span>'; }).join(' ') : '<span class="nm-tag tc">None set</span>') + '</td>'
        + '<td class="d">' + nmDayTxt2(T, c) + '</td></tr>';
    }).join('') + '</tbody></table>'
    + (list.length ? '' : '<div class="nm-empty sm">No checkpoints match.</div>') + '</div>'
    + '<div class="nm-foot"><span>Base = baseline day · Impl = implementation day · the end-line repeats the baseline checkpoints</span>' + (list.length > u.limit ? '<button type="button" class="nm-lnk" onclick="nmUi(\'limit\',' + (u.limit + 200) + ')">Show ' + Math.min(200, list.length - u.limit) + ' more</button>' : '') + '</div></section>'
    + (sel ? '<aside class="nm-side" aria-label="Selected checkpoint">' + nmSideHTML(T, sel) + '</aside>' : '') + '</div>';
  return h;
}
// ── Standards: Area of Concern → Standard → ME for one department, with counts; "View" opens the list filtered ──
function nmStdsHTML() {
  var u = _nm.ui, T = u.type, B = _nm.base[T], data = B.data, all = nmAll(T).filter(function (c) { return !c.retired && c.dept === u.dept; });
  var A = {}; all.forEach(function (c) { var a = A[c.aoc] = A[c.aoc] || { n: 0, std: {} }; a.n++; var s = a.std[c.std] = a.std[c.std] || { n: 0, me: {} }; s.n++; s.me[c.me] = (s.me[c.me] || 0) + 1; });
  var cmp = function (x, y) { return String(x).localeCompare(String(y), 'en', { numeric: true }); };
  return '<div class="ce-stdhd"><label>Department<select onchange="_nm.ui.dept=this.value;nmRender()">' + B.depts.map(function (d) { return nmOpt(d.id, d.name, u.dept); }).join('') + '</select></label>'
    + '<span>' + Object.keys(A).length + ' Areas of Concern · ' + Object.keys(A).reduce(function (n, a) { return n + Object.keys(A[a].std).length; }, 0) + ' Standards · ' + all.length + ' checkpoints</span></div>'
    + Object.keys(A).sort(cmp).map(function (a) {
      return '<section class="nm-card ce-aoc"><b class="nm-h">Area ' + nmE(a) + ' · ' + nmE(String((data.aocs || {})[a] || '').replace(/^[:\s]+/, '')) + ' <em>' + A[a].n + ' checkpoints</em></b>'
        + Object.keys(A[a].std).sort(cmp).map(function (s) { var S = A[a].std[s];
          return '<div class="ce-std"><div class="ce-stdr"><b>' + nmE(s) + '</b><span>' + nmE((data.stds || {})[s] || '') + '</span><em>' + S.n + '</em>'
            + '<button type="button" class="nm-btn" onclick="_nm.ui.aoc=\'' + nmJ(a) + '\';_nm.ui.std=\'' + nmJ(s) + '\';_nm.ui.show=\'active\';nmGo(\'list\');ceHeadPaint()">View</button></div>'
            + '<ul class="ce-mes">' + Object.keys(S.me).sort(cmp).map(function (m) { return '<li><b>' + nmE(m) + '</b> ' + nmE((data.mes || {})[u.dept + '|' + m] || '') + ' <em>' + S.me[m] + '</em></li>'; }).join('') + '</ul></div>';
        }).join('') + '</section>';
    }).join('') + (all.length ? '' : '<div class="nm-empty sm">No checkpoints in this department.</div>');
}
function nmPick(id) { _nm.ui.sel = _nm.ui.sel === id ? null : id; nmRender(); if (_nm.ui.sel && window.innerWidth < 1180) { var sd = document.querySelector('#nf-dm .nm-side'); if (sd && sd.scrollIntoView) sd.scrollIntoView({ block: 'start' }); } }
function nmSideHTML(T, c) {
  var st = nmStatus(T, c.id), d = nmDays(T)[c.id], data = _nm.base[T].data, base = _nm.base[T].byId[c.id];
  var fixN = Object.keys(c.fix || {}).filter(function (k) { return c.fix[k] && c.fix[k].f; }).length;
  return '<div class="nm-sh"><span>' + nmE(c.id) + ' · ' + nmE(nmDeptName(T, c.dept)) + '</span>' + nmTag(st) + '<button type="button" class="ce-x" aria-label="Close" onclick="_nm.ui.sel=null;nmRender()">' + NM_I.x + '</button></div>'
    + '<div class="nm-st">' + nmE(c.t) + '</div>' + (c.hi ? '<div class="nm-hi">' + nmE(c.hi) + '</div>' : '')
    + '<div class="nm-me">' + nmE((data.mes || {})[c.dept + '|' + c.me] || (data.stds || {})[c.std] || '') + '</div>'
    + (c.items.length ? '<div class="nm-box"><b>MoV · ' + c.items.length + ' item' + (c.items.length === 1 ? '' : 's') + '</b><ol>' + c.items.map(function (x) { return '<li>' + nmE(x.t) + '</li>'; }).join('') + '</ol>'
      + (base && st === 'edited' && !nmSame('items', base.items, c.items) ? '<div class="nm-was">Checklist: ' + nmE(base.what || '(blank)') + '</div>' : '') + '</div>' : '')
    + '<dl class="nm-dl2"><dt>Area</dt><dd>' + nmE(c.aoc + ' · ' + String((data.aocs || {})[c.aoc] || '').replace(/^[:\s]+/, '')) + '</dd>'
    + '<dt>Method</dt><dd>' + (c.method.length ? c.method.map(function (m) { return NM_MLABEL[m]; }).join(', ') : '<span class="nm-tag tc">Not set</span>') + '</dd>'
    + '<dt>Best filled by</dt><dd>' + (c.roles.length ? c.roles.map(function (r) { return nmE(nmRoleLabel(T, r)); }).join(', ') : 'Staff posted in ' + nmE(nmDeptName(T, c.dept))) + '</dd>'
    + '<dt>Days</dt><dd>' + (c.retired || !d ? '—' : 'Baseline ' + d.b + (d.i ? ' · Implementation ' + d.i : '') + ' · End-line ' + d.e) + '</dd>'
    + '<dt>Content</dt><dd>' + [c.hi ? 'Hindi' : '', fixN ? 'How to fix ' + fixN : '', c.video || c.videoHi ? 'Video' : ''].filter(Boolean).join(' · ') + ([c.hi, fixN, c.video || c.videoHi].some(Boolean) ? '' : 'Not added yet') + '</dd>'
    + '<dt>In use at</dt><dd>' + nmFacs(T).length + ' ' + nmE(nmCfg(T).short || T) + (nmFacs(T).length === 1 ? '' : 's') + '</dd></dl>'
    + '<div class="nm-sbtn ce-edit"><button type="button" class="nm-btn pri" onclick="nmEditOpen(\'' + nmJ(c.id) + '\')">Edit</button><button type="button" class="nm-btn" onclick="nmPlanOpen(\'' + nmJ(c.dept) + '\',\'' + nmJ(c.id) + '\')">Move day</button>'
    + (st ? '<button type="button" class="nm-btn" onclick="nmUndoAsk(\'' + nmJ(c.id) + '\')">' + (st === 'new' ? 'Remove' : 'Undo change') + '</button>' : '') + '</div>';
}
function nmRoleLabel(T, id) { var r = (nmCfg(T).roles || []).find(function (x) { return x.id === id; }); return r ? r.label : id; }
function nmFacs(T) {
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {};
  return Object.keys(F).filter(function (k) { var f = F[k] || {}; return f.type === T && !f.suspended && !f.demo; }).map(function (k) { return Object.assign({ code: k }, F[k]); });
}
async function nmUndoAsk(id) {
  var T = _nm.ui.type, st = nmStatus(T, id);
  var ok = await showConfirm(st === 'new' ? 'Remove the new checkpoint ' + id + ' from the draft?' : 'Undo every draft change to ' + id + '? It goes back to ' + (_nm.live[T].v ? 'the published version (v' + _nm.live[T].v + ')' : 'the checklist') + '.', '↩️', st === 'new' ? 'Remove checkpoint' : 'Undo change', st === 'new' ? 'Remove' : 'Undo', 'var(--teal)');
  if (!ok) return;
  if (await nmUndo(T, id)) { if (st === 'new') _nm.ui.sel = null; showToast('Done.', 'ok'); if (_nm.ui.screen === 'edit') _nm.ui.screen = 'list'; nmRender(); }
}
// bulk "best filled by" for the checkpoints shown (e.g. Laboratory + Record review → Lab Technician)
async function nmBulkRoles() {
  var T = _nm.ui.type, list = nmFiltered().filter(function (c) { return !c.retired; }), roles = nmCfg(T).roles || [];
  if (!list.length) return;
  var v = await scDialog({ title: 'Best filled by — ' + list.length + ' checkpoints', icon: '👥', wide: true, okLabel: 'Save to draft',
    message: 'Applies to the ' + list.length + ' checkpoints shown now (' + nmDeptName(T, _nm.ui.dept) + (_nm.ui.method ? ' · ' + _nm.ui.method : '') + (_nm.ui.std ? ' · ' + _nm.ui.std : '') + (_nm.ui.q ? ' · “' + _nm.ui.q + '”' : '') + '). Leave all unticked to send them to everyone posted in the department again.',
    fields: [{ key: 'roles', type: 'checklist', label: 'Roles', value: [], options: roles.map(function (r) { return { value: r.id, label: r.label }; }) },
      { key: 'mode', type: 'select', label: 'How', value: 'set', options: [{ value: 'set', label: 'Replace the roles' }, { value: 'add', label: 'Add to the roles they have' }] }] });
  if (!v) return;
  var pick = Array.isArray(v.roles) ? v.roles : [], recs = {};
  list.forEach(function (c) { var r = v.mode === 'add' ? c.roles.concat(pick.filter(function (x) { return c.roles.indexOf(x) < 0; })) : pick.slice(); recs[c.id] = { roles: r }; });
  if (await nmSaveMany(T, recs, 'bulk roles')) { showToast('Saved for ' + list.length + ' checkpoints.', 'ok'); nmRender(); }
}

// ── edit ──
function nmEditOpen(id) {
  var T = _nm.ui.type, c = id ? nmGet(T, id) : null, u = _nm.ui;
  if (!nmCanEdit()) { showToast('Only HealSol Admin can change checkpoints.', 'err'); return; }
  if (!c) { var first = nmAll(T).find(function (x) { return x.dept === u.dept; }) || {};
    c = { id: '', dept: u.dept, aoc: u.aoc || first.aoc || 'A', std: u.std || '', me: '', t: '', hi: '', method: [], items: [], video: '', videoHi: '', fix: {}, roles: [], pk: '', retired: false }; }
  u.form = JSON.parse(JSON.stringify(c)); u.formId = id || ''; u.etab = 'details'; u.fixAt = 1; u.hist = null; u.dirty = false;
  if (id) { u.sel = id; nmHist(T, id).then(function (h) { if (u.formId === id) { u.hist = h; if (u.screen === 'edit' && u.etab === 'used') nmRender(); } }); }
  nmGo('edit');
}
function nmF(k, v) { _nm.ui.form[k] = v; _nm.ui.dirty = true; if (k === 'hi' || k === 't') nmPrevRefresh(); }
function nmFR(k, v) { nmF(k, v); nmRender(); }
function nmTab(t) { _nm.ui.etab = t; nmRender(); }
function nmToggleM(m) { var f = _nm.ui.form, i = f.method.indexOf(m); if (i >= 0) f.method.splice(i, 1); else f.method.push(m); f.method = NM_METHODS.filter(function (x) { return f.method.indexOf(x) >= 0; }); _nm.ui.dirty = true; nmRender(); }
function nmEditHTML() {
  var u = _nm.ui, T = u.type, f = u.form, id = u.formId, cfg = nmCfg(T);
  var tabs = [['details', 'Details'], ['content', 'Content']].concat(id ? [['used', 'Where used']] : []);
  return '<div class="nm-ehd"><button type="button" class="nm-ib" aria-label="Back to checkpoint list" onclick="nmEditClose()">' + NM_I.back + '</button>'
    + '<div class="nm-et"><b>' + (id ? 'Edit checkpoint · ' + nmE(cfg.short || T) + ' · ' + nmE(id) : 'New checkpoint · ' + nmE(cfg.short || T)) + '</b><small>' + nmE(f.t || 'Not written yet') + '</small></div>'
    + (id ? nmTag(nmStatus(T, id)) : '') + '<span class="nm-draft">Draft</span>'
    + '<div class="nm-acts"><button type="button" class="nm-btn" onclick="nmEditClose()">Cancel</button><button type="button" class="nm-btn pri" id="nm-save" onclick="nmEditSave()">' + (id ? 'Save to draft' : 'Add to draft') + '</button></div></div>'
    + '<div class="nm-etabs" role="tablist" aria-label="Edit sections">' + tabs.map(function (t) { return '<button type="button" role="tab" aria-selected="' + (u.etab === t[0]) + '" class="' + (u.etab === t[0] ? 'on' : '') + '" onclick="nmTab(\'' + t[0] + '\')">' + t[1] + '</button>'; }).join('') + '</div>'
    + '<div class="nm-esplit"><div class="nm-ecol">' + (u.etab === 'content' ? nmContentHTML() : u.etab === 'used' ? nmUsedHTML() : nmDetailsHTML()) + '</div>'
    + '<aside class="nm-ecol">' + nmPreviewHTML() + (u.etab === 'content' ? nmStatsHTML() : '') + '</aside></div>';
}
function nmDetailsHTML() {
  var u = _nm.ui, T = u.type, f = u.form, data = _nm.base[T].data, B = _nm.base[T], id = u.formId;
  var stds = {}, mes = {};
  nmAll(T).forEach(function (c) { if (c.dept === f.dept && c.aoc === f.aoc) stds[c.std] = 1; if (c.dept === f.dept && c.std === f.std) mes[c.me] = 1; });
  if (f.std) stds[f.std] = 1; if (f.me) mes[f.me] = 1;
  var srt = function (o) { return Object.keys(o).filter(Boolean).sort(function (a, b) { return a.localeCompare(b, 'en', { numeric: true }); }); };
  var d = id ? nmDays(T)[id] : null, base = id ? B.byId[id] : null;
  return '<form class="nm-card nm-form" onsubmit="return false">'
    + '<div class="nm-g3"><label>Department<select onchange="nmFR(\'dept\',this.value)"' + (id ? ' disabled' : '') + '>' + B.depts.map(function (x) { return nmOpt(x.id, x.name, f.dept); }).join('') + '</select></label>'
    + '<label>Area of Concern<select onchange="nmF(\'std\',\'\');nmFR(\'aoc\',this.value)">' + Object.keys(data.aocs || {}).map(function (a) { return nmOpt(a, a + ' · ' + String(data.aocs[a]).replace(/^[:\s]+/, ''), f.aoc); }).join('') + '</select></label>'
    + '<label>Standard<select onchange="nmFR(\'std\',this.value)">' + nmOpt('', 'Choose…', f.std) + srt(stds).map(function (s) { return nmOpt(s, s + ((data.stds || {})[s] ? ' · ' + String(data.stds[s]).slice(0, 60) : ''), f.std); }).join('') + '</select></label></div>'
    + '<label>Measurable element<input type="text" list="nm-mes" value="' + nmE(f.me) + '" placeholder="e.g. ' + nmE(f.std ? f.std + '.1' : 'C4.4') + '" oninput="nmF(\'me\',this.value.trim())"><datalist id="nm-mes">' + srt(mes).map(function (m) { return '<option value="' + nmE(m) + '">' + nmE((data.mes || {})[f.dept + '|' + m] || '') + '</option>'; }).join('') + '</datalist>'
    + (f.me && (data.mes || {})[f.dept + '|' + f.me] ? '<span class="nm-hint">' + nmE(data.mes[f.dept + '|' + f.me]) + '</span>' : '') + '</label>'
    + '<label>Checkpoint<textarea rows="2" oninput="nmF(\'t\',this.value)">' + nmE(f.t) + '</textarea>' + (base && !nmSame('t', base.t, f.t) ? '<span class="nm-was">Checklist: ' + nmE(base.t) + '</span>' : '') + '</label>'
    + '<fieldset><legend>Assessment method</legend><div class="nm-pills">' + NM_METHODS.map(function (m) { var on = f.method.indexOf(m) >= 0;
      return '<button type="button" aria-pressed="' + on + '" class="nm-pill' + (on ? ' on' : '') + '" onclick="nmToggleM(\'' + m + '\')">' + m + ' · ' + NM_MLABEL[m] + '</button>'; }).join('') + '</div>'
    + (f.method.length ? '' : '<span class="nm-hint warn">No method yet — staff can’t fill this checkpoint until one is set.</span>') + '</fieldset>'
    + '<div class="nm-g2"><fieldset><legend>Status</legend><div class="nm-pills">'
    + '<button type="button" aria-pressed="' + !f.retired + '" class="nm-pill' + (!f.retired ? ' on' : '') + '" onclick="nmFR(\'retired\',false)">Active</button>'
    + '<button type="button" aria-pressed="' + !!f.retired + '" class="nm-pill' + (f.retired ? ' on' : '') + '" onclick="nmFR(\'retired\',true)">Retired</button></div>'
    + (f.retired ? '<span class="nm-hint">Leaves future days; past answers stay in reports.</span>' : '') + '</fieldset>'
    + '<label>Package tag <span class="nm-hint">Optional — LaQshya, MusQan</span><select onchange="nmF(\'pk\',this.value)">' + nmOpt('', 'None (core NQAS)', f.pk) + nmOpt('LaQshya', 'LaQshya', f.pk) + nmOpt('MusQan', 'MusQan', f.pk) + '</select></label></div>'
    + (id ? '<div class="nm-days"><b>Days in the plan</b><div>' + (d && !f.retired ? '<span class="b">Baseline · Day ' + d.b + '</span>' + (d.i ? '<span class="i">Implementation · Day ' + d.i + '</span>' : '') + '<span class="e">End-line · Day ' + d.e + '</span>' : '<span>Not on any day</span>') + '</div><small>Move it on the <button type="button" class="nm-lnk" onclick="nmPlanOpen(\'' + nmJ(f.dept) + '\',\'' + nmJ(id) + '\')">day-plan board</button>.</small></div>' : '')
    + (id ? '<div class="nm-efoot"><span>Past answers stay linked to ' + nmE(id) + '.</span></div>' : '<div class="nm-efoot"><span>New checkpoints get an ID like ' + nmE(nmNextId(T, f.dept || 'X')) + ' and are placed after the last checkpoint of their Standard.</span></div>')
    + '</form>';
}
// Content: Hindi, MoV items, How to fix, videos, best filled by
function nmItem(k, i, v) { var it = _nm.ui.form.items[i]; if (!it) return; it[k] = v; _nm.ui.dirty = true; if (k === 't' || k === 'h') nmPrevRefresh(); }
function nmItemM(i, m) { var it = _nm.ui.form.items[i]; var j = it.m.indexOf(m); if (j >= 0) it.m.splice(j, 1); else it.m.push(m); _nm.ui.dirty = true; nmRender(); }
function nmItemAdd() { var f = _nm.ui.form; f.items.push({ t: '', h: '', m: f.method.slice() }); _nm.ui.fixAt = f.items.length; _nm.ui.dirty = true; nmRender(); var L = document.querySelectorAll('.nm-item input[data-k="t"]'); if (L.length) L[L.length - 1].focus(); }
function nmItemDel(i) {
  var f = _nm.ui.form; f.items.splice(i, 1);
  var fx = {}; Object.keys(f.fix || {}).forEach(function (k) { var n = +k; if (n === i + 1) return; fx[String(n > i + 1 ? n - 1 : n)] = f.fix[k]; }); f.fix = fx;
  _nm.ui.fixAt = Math.min(_nm.ui.fixAt, Math.max(1, f.items.length)); _nm.ui.dirty = true; nmRender();
}
function nmItemSplit() {
  var f = _nm.ui.form, src = f.items.length ? f.items.map(function (x) { return x.t; }).join(', ') : (_nm.base[_nm.ui.type].byId[_nm.ui.formId] || {}).what || '';
  var L = nmSplitMov(src, f.method); if (L.length < 2) { showToast('Nothing to split — the text has no commas.', ''); return; }
  var old = f.items; f.items = L.map(function (x, i) { var o = old.find(function (y) { return y.t === x.t; }); return o ? o : x; });
  f.fix = {}; _nm.ui.fixAt = 1; _nm.ui.dirty = true; nmRender();
}
// built-in How to fix of item n (0 = whole checkpoint) of the open form — shown to staff until HealSol writes one
function nmFixBi(n) {
  var f = _nm.ui.form; if (!f || typeof nfFixBuiltin !== 'function') return null;
  return nfFixBuiltin(_nm.ui.type, f.t, n ? ((f.items[n - 1] || {}).t || '') : '', f.items.length);
}
function nmFixHas(n) { var e = ((_nm.ui.form || {}).fix || {})[String(n)]; return !!(e && (e.f || e.fh)); }
function nmFixCopy(n) {   // start from the built-in wording
  var b = nmFixBi(n), f = _nm.ui.form; if (!b || !f) return; f.fix = f.fix || {};
  f.fix[String(n)] = { w: b.w, f: b.f, fh: b.fh, e: b.e, eh: b.eh, tm: b.tm }; _nm.ui.dirty = true; nmRender();
}
function nmFixAt(n) { _nm.ui.fixAt = n; nmRender(); }
function nmFix(k, v) { var f = _nm.ui.form, n = String(f.items.length ? (_nm.ui.fixAt || 1) : 0); f.fix = f.fix || {}; var e = f.fix[n] = f.fix[n] || { w: 'S' }; e[k] = v; if (!e.f && !e.fh && !e.e && !e.eh && !e.tm && k !== 'w') delete f.fix[n]; _nm.ui.dirty = true; }
function nmRoleAdd(v) { var f = _nm.ui.form; if (v && f.roles.indexOf(v) < 0) f.roles.push(v); _nm.ui.dirty = true; nmRender(); }
function nmRoleDel(v) { var f = _nm.ui.form; f.roles = f.roles.filter(function (x) { return x !== v; }); _nm.ui.dirty = true; nmRender(); }
function nmRuleTxt(n) {
  if (!n) return 'No MoV items: staff choose Met, Partial or Not met for the whole checkpoint.';
  if (n === 1) return '1 item: met = Met · not met = Not met';
  var half = Math.ceil(n / 2), lo = half - 1;
  return n + ' items: all ' + n + ' met = Met · ' + (half === n - 1 ? half : half + '–' + (n - 1)) + ' = Partial · ' + (lo === 0 ? '0' : '0–' + lo) + ' = Not met';
}
function nmContentHTML() {
  var u = _nm.ui, T = u.type, f = u.form, roles = nmCfg(T).roles || [], base = _nm.base[T].byId[u.formId], n = f.items.length;
  var at = n ? Math.min(Math.max(1, u.fixAt || 1), n) : 0, fx = (f.fix || {})[String(at)] || {};
  var itemHTML = function (it, i) {
    var cur = at === i + 1;
    return '<div class="nm-item' + (cur ? ' on' : '') + '"><button type="button" class="nm-num" aria-label="How to fix item ' + (i + 1) + '" onclick="nmFixAt(' + (i + 1) + ')">' + (i + 1) + '</button>'
      + '<div class="nm-g2"><label>English<input type="text" data-k="t" value="' + nmE(it.t) + '" oninput="nmItem(\'t\',' + i + ',this.value)"></label>'
      + '<label>Hindi<input type="text" lang="hi" value="' + nmE(it.h) + '" oninput="nmItem(\'h\',' + i + ',this.value)"></label></div>'
      + '<div class="nm-im">' + NM_METHODS.map(function (m) { var on = (it.m || []).indexOf(m) >= 0; return '<button type="button" aria-pressed="' + on + '" class="nm-mb' + (on ? ' on' : '') + '" onclick="nmItemM(' + i + ',\'' + m + '\')">' + m + '</button>'; }).join('')
      + '<button type="button" class="nm-ib sm" aria-label="Remove item ' + (i + 1) + '" onclick="nmItemDel(' + i + ')">' + NM_I.x + '</button></div>'
      + (cur ? nmFixHTML(at, fx) : '<div class="nm-fixst">' + (nmFixHas(i + 1) ? 'How to fix written' : nmFixBi(i + 1) ? 'Built-in How to fix' : 'How to fix empty') + ' · <button type="button" class="nm-lnk" onclick="nmFixAt(' + (i + 1) + ')">Edit</button></div>') + '</div>';
  };
  return '<section class="nm-card"><label>Checkpoint in Hindi<input type="text" lang="hi" value="' + nmE(f.hi) + '" placeholder="हिंदी में चेकपॉइंट" oninput="nmF(\'hi\',this.value)"></label></section>'
    + '<section class="nm-card nm-mov"><div class="nm-ch"><div><b>MoV items · ' + n + '</b><small>' + nmE(nmRuleTxt(n)) + '</small></div>'
    + '<div class="nm-acts"><button type="button" class="nm-btn" onclick="nmItemSplit()">Split at commas</button><button type="button" class="nm-btn out" onclick="nmItemAdd()">' + NM_I.plus + 'Add item</button></div></div>'
    + (base && base.what ? '<div class="nm-src">From the checklist: “' + nmE(base.what) + '”</div>' : '')
    + f.items.map(itemHTML).join('')
    + (n ? '' : '<div class="nm-fixst">How to fix for the whole checkpoint</div>' + nmFixHTML(0, (f.fix || {})['0'] || {}))
    + '</section>'
    + '<div class="nm-g2 top"><section class="nm-card"><b class="nm-h">Videos</b>'
    + '<label>English video link<input type="url" value="' + nmE(f.video) + '" placeholder="[YouTube or Drive link]" oninput="nmF(\'video\',this.value.trim())"></label>'
    + '<label>Hindi video link<input type="url" value="' + nmE(f.videoHi) + '" placeholder="[YouTube or Drive link]" oninput="nmF(\'videoHi\',this.value.trim())"></label>'
    + (f.me ? '<label class="nm-chk"><input type="checkbox" id="nm-vme"> Use the same videos for every checkpoint under ME ' + nmE(f.me) + ' in ' + nmE(nmDeptName(T, f.dept)) + '</label>' : '') + '</section>'
    + '<section class="nm-card"><b class="nm-h">Best filled by</b><small class="nm-hint">Empty = everyone posted in ' + nmE(nmDeptName(T, f.dept)) + '. If none of these roles is posted there, everyone in the department gets it.</small>'
    + '<div class="nm-roles">' + f.roles.map(function (r) { return '<span>' + nmE(nmRoleLabel(T, r)) + '<button type="button" aria-label="Remove ' + nmE(nmRoleLabel(T, r)) + '" onclick="nmRoleDel(\'' + nmJ(r) + '\')">×</button></span>'; }).join('') + '</div>'
    + '<label>Add a role<select onchange="nmRoleAdd(this.value)">' + nmOpt('', 'Choose a ' + nmE(nmCfg(T).short || '') + ' role…', '') + roles.filter(function (r) { return f.roles.indexOf(r.id) < 0; }).map(function (r) { return nmOpt(r.id, r.label, ''); }).join('') + '</select></label></section></div>';
}
function nmFixHTML(n, fx) {
  var w = fx.w || 'S', bi = (fx.f || fx.fh) ? null : nmFixBi(n);
  return '<div class="nm-fix">' + (bi ? '<div class="nm-fixbi"><b>Built-in How to fix</b> · staff see this until you write your own<div class="nm-fixbi-s">' + nmE(bi.f).replace(/\n/g, '<br>') + '</div>' + (bi.e ? '<div><small>Evidence: ' + nmE(bi.e) + '</small></div>' : '') + (bi.tm ? '<div><small>Time: ' + nmE(bi.tm) + ' · ' + (bi.w === 'E' ? 'Each staff member' : 'One person fixes') + '</small></div>' : '') + '<button type="button" class="nm-btn out" onclick="nmFixCopy(' + n + ')">Edit a copy</button></div>' : '') + '<div class="nm-ch"><b>How to fix ' + (n ? 'item ' + n : 'this checkpoint') + '</b><div class="nm-pills" role="radiogroup" aria-label="Who fixes it">'
    + '<button type="button" role="radio" aria-checked="' + (w === 'S') + '" class="nm-pill' + (w === 'S' ? ' on' : '') + '" onclick="nmFix(\'w\',\'S\');nmRender()">One person fixes</button>'
    + '<button type="button" role="radio" aria-checked="' + (w === 'E') + '" class="nm-pill' + (w === 'E' ? ' on' : '') + '" onclick="nmFix(\'w\',\'E\');nmRender()">Each staff member</button></div></div>'
    + '<div class="nm-g2"><label>Steps · English<textarea rows="4" oninput="nmFix(\'f\',this.value)" placeholder="1. …">' + nmE(fx.f) + '</textarea></label>'
    + '<label>Steps · Hindi<textarea rows="4" lang="hi" oninput="nmFix(\'fh\',this.value)" placeholder="1. …">' + nmE(fx.fh) + '</textarea></label>'
    + '<label>Evidence to show · English<input type="text" value="' + nmE(fx.e) + '" oninput="nmFix(\'e\',this.value)"></label>'
    + '<label>Evidence to show · Hindi<input type="text" lang="hi" value="' + nmE(fx.eh) + '" oninput="nmFix(\'eh\',this.value)"></label></div>'
    + '<label class="nm-inl">Time needed<input type="text" value="' + nmE(fx.tm) + '" placeholder="e.g. 2 weeks" oninput="nmFix(\'tm\',this.value)"></label></div>';
}
function nmStatsHTML() {
  var T = _nm.ui.type, s = nmContentStats(T), f = function (n) { return n.toLocaleString('en-IN'); };
  return '<section class="nm-card nm-cstat"><b class="nm-h">' + nmE(nmCfg(T).short || T) + ' content filled</b><div>'
    + [['Hindi wording', s.hi], ['MoV items split', s.split], ['How to fix', s.fix], ['Videos', s.video], ['Best filled by', s.roles]].map(function (x) { return '<span>' + x[0] + '</span><b>' + f(x[1]) + ' of ' + f(s.n) + '</b>'; }).join('') + '</div></section>';
}
function nmPreviewHTML() {
  var u = _nm.ui, T = u.type, f = u.form, hi = u.prevHi, d = u.formId ? nmDays(T)[u.formId] : null;
  var role = f.roles.length ? nmRoleLabel(T, f.roles[0]) : 'Staff';
  var n = f.items.length;
  return '<section class="nm-card nm-prev" aria-label="Preview as staff see it"><div class="nm-ch"><b class="nm-h">Preview · staff day card</b>'
    + '<div class="nm-seg" role="tablist" aria-label="Preview language"><button type="button" role="tab" aria-selected="' + !hi + '" class="' + (hi ? '' : 'on') + '" onclick="_nm.ui.prevHi=false;nmPrevRefresh()">EN</button><button type="button" role="tab" aria-selected="' + hi + '" class="' + (hi ? 'on' : '') + '" onclick="_nm.ui.prevHi=true;nmPrevRefresh()">हिं</button></div></div>'
    + '<div id="nm-prev">' + nmPrevInner() + '</div></section>';
}
function nmPrevInner() {
  var u = _nm.ui, T = u.type, f = u.form, hi = u.prevHi, d = u.formId ? nmDays(T)[u.formId] : null;
  var role = f.roles.length ? nmRoleLabel(T, f.roles[0]) : 'Staff', n = f.items.length;
  return '<div class="nm-phone"><div class="nm-phd">Day ' + (d ? d.b : 1) + ' · ' + nmE(nmDeptName(T, f.dept)) + ' · ' + nmE(role) + '</div><div class="nm-pcard">'
    + '<small>' + nmE(f.me || f.std || '') + (f.method.length ? ' · ' + f.method.map(function (m) { return NM_MLABEL[m]; }).join(' · ') : '') + '</small>'
    + '<b>' + nmE(hi && f.hi ? f.hi : (f.t || 'Checkpoint text')) + '</b>'
    + (f.video || f.videoHi ? '<div class="nm-pv">' + (f.video ? '<span>' + NM_I.play + 'Video</span>' : '') + (f.videoHi ? '<span>' + NM_I.play + 'हिंदी वीडियो</span>' : '') + '</div>' : '')
    + (n ? '<div class="nm-pt">' + f.items.map(function (x) { return '<span><i></i>' + nmE(hi && x.h ? x.h : (x.t || '…')) + '</span>'; }).join('') + '</div><div class="nm-pr">' + nmE(nmRuleTxt(n)) + '</div>'
      : '<div class="nm-p3"><span>Met</span><span>Partial</span><span>Not met</span></div>')
    + '</div></div>';
}
function nmPrevRefresh() { var el = document.getElementById('nm-prev'); if (el) el.innerHTML = nmPrevInner(); var s = document.querySelectorAll('.nm-seg button'); if (s.length === 2) { s[0].classList.toggle('on', !_nm.ui.prevHi); s[1].classList.toggle('on', !!_nm.ui.prevHi); } }
function nmUsedHTML() {
  var u = _nm.ui, T = u.type, F = nmFacs(T), d = nmDays(T)[u.formId], today = typeof scTodayStr === 'function' ? scTodayStr() : new Date().toISOString().slice(0, 10);
  var S = nfDeptShape(nmCfg(T));
  var row = function (fc) {
    var day = fc.startDate ? nfDeptDayNo(fc.startDate, today) : 0, on = (fc.depts && fc.depts[_nm.ui.form.dept] && fc.depts[_nm.ui.form.dept].off) ? 'department off' : !fc.startDate ? 'not started' : day > S.days ? 'finished' : 'Day ' + day;
    return '<li><span>' + nmE(fc.name || fc.code) + '</span><span class="nm-mut">' + nmE(on) + '</span></li>';
  };
  return '<section class="nm-card"><b class="nm-h">Where it is used · ' + F.length + ' ' + nmE(nmCfg(T).short || T) + (F.length === 1 ? '' : 's') + '</b>'
    + (F.length ? '<ul class="nm-ul">' + F.slice(0, 30).map(row).join('') + '</ul>' + (F.length > 30 ? '<small class="nm-hint">and ' + (F.length - 30) + ' more</small>' : '') : '<div class="nm-hint">No ' + nmE(nmCfg(T).short || T) + ' uses the checklist yet.</div>')
    + (d ? '<div class="nm-hint">On baseline day ' + d.b + (d.i ? ', implementation day ' + d.i : '') + ' and end-line day ' + d.e + ' of each facility’s plan.</div>' : '')
    + '<div class="nm-note">Changes reach facilities when the draft is published, from the next day. Days a facility has already reached keep their checkpoints.</div></section>'
    + '<section class="nm-card"><b class="nm-h">History</b>' + (u.hist == null ? '<div class="nm-hint">Loading…</div>' : u.hist.length ? '<ul class="nm-ul hist">' + u.hist.slice(0, 20).map(function (h) {
      return '<li><span><b>' + nmE(h.by) + '</b> · ' + nmE(nmFieldNames(h.f)) + '</span><span class="nm-mut">' + nmE(String(h.at || '').slice(0, 10)) + '</span></li>'; }).join('') + '</ul>' : '<div class="nm-hint">As in the checklist — no changes yet.</div>') + '</section>';
}
var NM_FNAME = { t: 'wording', hi: 'Hindi', method: 'method', items: 'MoV items', fix: 'How to fix', video: 'English video', videoHi: 'Hindi video', roles: 'best filled by', pk: 'package tag', retired: 'status', aoc: 'Area', std: 'Standard', me: 'ME', dept: 'department', new: 'added', undo: 'undone (back to the checklist)', removed: 'removed' };
function nmFieldNames(s) { var p = String(s || '').split(' · '); return p[0].split(',').map(function (x) { return NM_FNAME[x] || x; }).join(', ') + (p[1] ? ' (' + p[1] + ')' : ''); }
async function nmEditClose() {
  if (_nm.ui.dirty && !await showConfirm('Leave without saving? Your changes to this checkpoint will be lost.', '✏️', 'Unsaved changes', 'Leave', 'var(--red)')) return;
  _nm.ui.dirty = false; nmGo('list');
}
async function nmEditSave() {
  var u = _nm.ui, T = u.type, f = u.form, id = u.formId;
  f.t = String(f.t || '').replace(/\s+/g, ' ').trim(); f.hi = String(f.hi || '').trim();
  f.items = f.items.map(function (x) { return { t: String(x.t || '').trim(), h: String(x.h || '').trim(), m: NM_METHODS.filter(function (m) { return (x.m || []).indexOf(m) >= 0; }) }; }).filter(function (x) { return x.t; });
  if (!f.t) { showToast('Write the checkpoint first.', 'err'); return; }
  if (!f.std || !f.me) { showToast('Choose the Standard and write the Measurable element.', 'err'); u.etab = 'details'; nmRender(); return; }
  var btn = document.getElementById('nm-save'); if (btn) btn.disabled = true;
  var vals = {}; NM_FIELDS.forEach(function (k) { vals[k] = f[k]; });
  var ok;
  if (id) {
    var recs = {}; recs[id] = vals;
    var vme = document.getElementById('nm-vme');
    if (vme && vme.checked) nmAll(T).forEach(function (c) { if (c.id !== id && c.dept === f.dept && c.me === f.me && !c.retired) recs[c.id] = { video: f.video, videoHi: f.videoHi }; });
    ok = await nmSaveMany(T, recs);
    if (ok) showToast('Saved to the draft' + (Object.keys(recs).length > 1 ? ' (videos on ' + (Object.keys(recs).length - 1) + ' more)' : '') + '.', 'ok');
  } else {
    var nid = await nmAdd(T, vals); ok = !!nid; if (ok) { u.sel = nid; u.dept = f.dept; showToast('Added ' + nid + ' to the draft.', 'ok'); }
  }
  if (btn) btn.disabled = false;
  if (ok) { u.dirty = false; nmGo('list'); }
}

// ── To check: checkpoints without a method ──
function nmToCheckHTML() {
  var u = _nm.ui, T = u.type, all = nmToCheck(T), list = all.filter(function (c) { return !u.tcDept || c.dept === u.tcDept; }), data = _nm.base[T].data;
  var depts = {}; all.forEach(function (c) { depts[c.dept] = (depts[c.dept] || 0) + 1; });
  return '<div class="nm-ehd"><button type="button" class="nm-ib" aria-label="Back" onclick="nmGo(\'list\')">' + NM_I.back + '</button><div class="nm-et"><b>To check · ' + nmE(nmCfg(T).short || T) + '</b><small>Checkpoints without an assessment method</small></div></div>'
    + '<section class="nm-card p0"><div class="nm-ch pad"><div><b>To check · ' + all.length + '</b><small>No assessment method in the source checklist. Staff can’t fill these until a method is set. Tap a method — it is saved to the draft at once.</small></div>'
    + '<label>Department<select onchange="_nm.ui.tcDept=this.value;_nm.ui.tcLimit=10;nmRender()">' + nmOpt('', 'All (' + all.length + ')', u.tcDept) + Object.keys(depts).map(function (d) { return nmOpt(d, nmDeptName(T, d) + ' (' + depts[d] + ')', u.tcDept); }).join('') + '</select></label></div>'
    + (list.length ? '<ul class="nm-tc">' + list.slice(0, u.tcLimit).map(function (c) {
      return '<li><span class="id">' + nmE(c.id) + '</span><div><b>' + nmE(c.t) + '</b><small>' + nmE(c.me + ' · ' + String((data.aocs || {})[c.aoc] || '').replace(/^[:\s]+/, '') + ' · ' + nmDeptName(T, c.dept)) + '</small></div>'
        + '<div class="nm-im">' + NM_METHODS.map(function (m) { return '<button type="button" class="nm-mb" title="' + NM_MLABEL[m] + '" onclick="nmTcSet(\'' + nmJ(c.id) + '\',\'' + m + '\')">' + m + '</button>'; }).join('') + '</div></li>';
    }).join('') + '</ul>' : '<div class="nm-empty sm">' + NM_I.ok + ' Every checkpoint has a method.</div>')
    + '<div class="nm-foot pad"><span>Need two methods? Set one here, then add the other in Edit.</span>' + (list.length > u.tcLimit ? '<button type="button" class="nm-lnk" onclick="_nm.ui.tcLimit+=10;nmRender()">Show next 10</button>' : '') + '</div></section>';
}
async function nmTcSet(id, m) { var T = _nm.ui.type; if (await nmSave(T, id, { method: [m] }, 'method from To check')) { showToast(id + ': ' + NM_MLABEL[m] + ' — saved to the draft.', 'ok'); nmRender(); } }

// ── Excel ──
var NM_XH = ['ID', 'Department', 'Area', 'Standard', 'ME', 'Checkpoint', 'Checkpoint (Hindi)', 'Method', 'MoV items', 'MoV items (Hindi)', 'Best filled by', 'Video (English)', 'Video (Hindi)', 'Package tag', 'Status', 'Baseline day', 'Implementation day'];
var NM_FH = ['ID', 'MoV #', 'MoV item', 'Who fixes', 'Steps (English)', 'Steps (Hindi)', 'Evidence (English)', 'Evidence (Hindi)', 'Time needed'];
function nmSheetName(s) { return String(s).replace(/[\\\/\?\*\[\]:]/g, ' ').slice(0, 31); }
async function nmExport() {
  var T = _nm.ui.type, cfg = nmCfg(T), B = _nm.base[T], days = nmDays(T);
  try {
    var X = await nfLoadXlsx(), wb = X.utils.book_new(), date = scNowIso().slice(0, 10);
    var rd = X.utils.aoa_to_sheet([['NQAS | FAST — ' + (cfg.short || T) + ' checkpoint master (draft)'], ['Downloaded ' + date + ' — includes every draft change.'], [''],
      ['One sheet per department. Change any cell and upload the file in Checkpoints → Excel. Nothing is changed until you confirm, and nothing reaches facilities until the draft is published.'],
      ['Method: SI, OB, RR, PI separated by /.  MoV items: one per line (Alt+Enter); Hindi lines in the same order.  Best filled by: role IDs separated by commas (see the Roles sheet).'],
      ['Status: Active or Retired.  New checkpoint: add a row with an empty ID (Department sheet, Area, Standard, ME, Checkpoint and Method filled).'],
      ['How to fix: one row per checkpoint and MoV # (0 = the whole checkpoint) on the How to fix sheet. Who fixes: One or Each.']]);
    rd['!cols'] = [{ wch: 130 }]; X.utils.book_append_sheet(wb, rd, 'Read me');
    var fixRows = [NM_FH];
    B.depts.forEach(function (d) {
      var rows = [NM_XH];
      nmAll(T).filter(function (c) { return c.dept === d.id; }).forEach(function (c) {
        var dd = days[c.id] || {};
        rows.push([c.id, c.dept, c.aoc, c.std, c.me, c.t, c.hi, c.method.join('/'), c.items.map(function (x) { return x.t; }).join('\n'), c.items.map(function (x) { return x.h || ''; }).join('\n'),
          c.roles.join(', '), c.video, c.videoHi, c.pk, c.retired ? 'Retired' : 'Active', c.retired ? '' : (dd.b || ''), c.retired ? '' : (dd.i || '')]);
        Object.keys(c.fix || {}).sort(function (a, b) { return a - b; }).forEach(function (k) { var e = c.fix[k] || {}; fixRows.push([c.id, +k, +k ? ((c.items[+k - 1] || {}).t || '') : '(whole checkpoint)', e.w === 'E' ? 'Each' : 'One', e.f || '', e.fh || '', e.e || '', e.eh || '', e.tm || '']); });
      });
      var ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = [10, 8, 6, 9, 8, 60, 50, 9, 50, 50, 22, 26, 26, 11, 9, 9, 9].map(function (w) { return { wch: w }; });
      ws['!autofilter'] = { ref: 'A1:Q' + rows.length }; X.utils.book_append_sheet(wb, ws, nmSheetName(d.id + ' ' + d.name));
    });
    var fs = X.utils.aoa_to_sheet(fixRows); fs['!cols'] = [10, 7, 40, 9, 50, 50, 36, 36, 12].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, fs, 'How to fix');
    var rs = X.utils.aoa_to_sheet([['Role ID', 'Role']].concat((cfg.roles || []).map(function (r) { return [r.id, r.label]; }))); rs['!cols'] = [{ wch: 18 }, { wch: 40 }]; X.utils.book_append_sheet(wb, rs, 'Roles');
    X.writeFile(wb, 'NQAS-FAST-' + (cfg.short || T) + '-checkpoints-draft-' + date + '.xlsx'); showToast('Excel downloaded.', 'ok');
  } catch (e) { console.warn(e); showToast('Could not create the Excel file — check the connection.', 'err'); }
}
function nmImportPick() {
  var i = document.createElement('input'); i.type = 'file'; i.accept = '.xlsx,.xls';
  i.onchange = async function () { var f = i.files && i.files[0]; if (!f) return;
    try { var X = await nfLoadXlsx(), wb = X.read(await f.arrayBuffer(), { type: 'array' }); nmImportRead(X, wb, f.name); }
    catch (e) { console.warn(e); showToast('Could not read that file.', 'err'); } };
  i.click();
}
// compare the file with the draft → _nm.ui.imp = {name, recs:{id:vals}, newRecs:[vals], missing:[ids], errors:[text], n:{match,new,changed,missing,errors}}
function nmImportRead(X, wb, name) {
  var T = _nm.ui.type, B = _nm.base[T], deptIds = B.depts.map(function (d) { return d.id; }), roleIds = (nmCfg(T).roles || []).map(function (r) { return r.id; });
  var seen = {}, recs = {}, newRecs = [], errors = [], match = 0, sheets = 0;
  var cur = {}; nmAll(T).forEach(function (c) { cur[c.id] = c; });
  var lines = function (s) { return String(s || '').split(/\r?\n/).map(function (x) { return x.trim(); }); };
  wb.SheetNames.forEach(function (sn) {
    var rows = X.utils.sheet_to_json(wb.Sheets[sn], { header: 1, defval: '', raw: false });
    if (!rows.length || String(rows[0][0]).trim() !== 'ID' || String(rows[0][5]).trim() !== 'Checkpoint') return;
    sheets++;
    var sheetDept = deptIds.find(function (d) { return sn.indexOf(d + ' ') === 0 || sn === d; });
    rows.slice(1).forEach(function (r, ri) {
      var id = String(r[0] || '').trim(), t = String(r[5] || '').replace(/\s+/g, ' ').trim(); if (!id && !t) return;
      var en = lines(r[8]).filter(Boolean), hiL = lines(r[9]);
      var roles = String(r[10] || '').split(/[,;]+/).map(function (x) { return x.trim(); }).filter(Boolean);
      var badR = roles.filter(function (x) { return roleIds.indexOf(x) < 0; });
      var v = { aoc: String(r[2] || '').trim().toUpperCase(), std: String(r[3] || '').trim(), me: String(r[4] || '').trim(), t: t, hi: String(r[6] || '').trim(),
        method: nmMethods(r[7]), roles: roles.filter(function (x) { return roleIds.indexOf(x) >= 0; }), video: String(r[11] || '').trim(), videoHi: String(r[12] || '').trim(),
        pk: String(r[13] || '').trim(), retired: /^retired$/i.test(String(r[14] || '').trim()) };
      var where = sn + ' row ' + (ri + 2);
      if (badR.length) errors.push(where + ': unknown role ' + badR.join(', '));
      if (!id) {
        var dept = String(r[1] || '').trim() || sheetDept;
        if (deptIds.indexOf(dept) < 0 || !v.t || !v.std || !v.me || !v.aoc) { errors.push(where + ': new row needs Department, Area, Standard, ME and Checkpoint'); return; }
        v.dept = dept; v.items = en.map(function (x, i) { return { t: x, h: hiL[i] || '', m: v.method.slice() }; }); newRecs.push(v); return;
      }
      var c = cur[id]; if (!c) { errors.push(where + ': ID ' + id + ' is not in the master (leave ID empty for a new checkpoint)'); return; }
      if (seen[id]) { errors.push(where + ': ID ' + id + ' appears twice'); return; }
      seen[id] = 1; match++;
      // keep each item's own methods when the item text is unchanged
      v.items = en.map(function (x, i) { var o = c.items.find(function (y) { return y.t === x; }) || c.items[i]; return { t: x, h: hiL[i] || '', m: o && o.t === x ? (o.m || []).slice() : v.method.slice() }; });
      if (!v.t) { errors.push(where + ': checkpoint text is empty'); return; }
      var nz = function (x) { return String(x || '').replace(/\s+/g, ' ').trim(); };
      if (nz(v.t) === nz(c.t)) v.t = c.t; if (nz(v.hi) === nz(c.hi)) v.hi = c.hi;
      var ch = nmChanged(v, c); if (ch.length) { var o = {}; ch.forEach(function (k) { o[k] = v[k]; }); recs[id] = o; }
    });
  });
  // How to fix sheet
  var fsn = wb.SheetNames.find(function (n) { return n === 'How to fix'; });
  if (fsn) {
    var fixBy = {};
    X.utils.sheet_to_json(wb.Sheets[fsn], { header: 1, defval: '', raw: false }).slice(1).forEach(function (r, ri) {
      var id = String(r[0] || '').trim(); if (!id) return; if (!cur[id]) { errors.push('How to fix row ' + (ri + 2) + ': ID ' + id + ' is not in the master'); return; }
      var k = String(parseInt(r[1], 10) || 0); fixBy[id] = fixBy[id] || {};
      var e = { w: /^each/i.test(String(r[3] || '')) ? 'E' : 'S', f: String(r[4] || '').trim(), fh: String(r[5] || '').trim(), e: String(r[6] || '').trim(), eh: String(r[7] || '').trim(), tm: String(r[8] || '').trim() };
      Object.keys(e).forEach(function (x) { if (!e[x]) delete e[x]; }); if (e.f || e.fh || e.e || e.eh || e.tm) fixBy[id][k] = e;
    });
    Object.keys(cur).forEach(function (id) { if (!seen[id] && !fixBy[id]) return; var nf = fixBy[id] || {}; if (!nmSame('fix', nf, cur[id].fix)) { recs[id] = recs[id] || {}; recs[id].fix = nf; } });
  }
  if (!sheets) { showToast('This file has no department sheets from the checkpoint download.', 'err'); return; }
  var missing = Object.keys(cur).filter(function (id) { return !seen[id] && !cur[id].retired; });
  _nm.ui.imp = { name: name, recs: recs, newRecs: newRecs, missing: missing, errors: errors, retireMissing: false, show: false,
    n: { match: match, changed: Object.keys(recs).length, new: newRecs.length, missing: missing.length, errors: errors.length } };
  nmRender();
}
async function nmImportApply() {
  var T = _nm.ui.type, I = _nm.ui.imp; if (!I) return;
  var recs = Object.assign({}, I.recs);
  if (I.retireMissing) I.missing.forEach(function (id) { recs[id] = Object.assign({}, recs[id] || {}, { retired: true }); });
  var total = Object.keys(recs).length + I.newRecs.length; if (!total) { showToast('Nothing to change.', ''); return; }
  _nm.ui.busy = true; nmRender();
  var ok = await nmSaveMany(T, recs, 'Excel ' + I.name);
  for (var i = 0; ok && i < I.newRecs.length; i++) ok = !!await nmAdd(T, Object.assign({ fix: {}, createdAt: scNowIso() }, I.newRecs[i]));
  _nm.ui.busy = false;
  if (ok) { showToast(total + ' change' + (total === 1 ? '' : 's') + ' added to the draft.', 'ok'); _nm.ui.imp = null; }
  nmRender();
}
function nmExcelHTML() {
  var u = _nm.ui, T = u.type, I = u.imp, cfg = nmCfg(T), s = nmContentStats(T), add = I ? I.n.changed + I.n.new + (I.retireMissing ? I.n.missing : 0) : 0;
  return '<p class="ce-lead"><b>Excel · ' + nmE(cfg.short || T) + ' checkpoints</b> — download, edit offline, upload back into the draft</p>'
    + '<div class="nm-xsplit"><div class="nm-ecol">'
    + '<section class="nm-card"><b class="nm-h">Download as Excel</b><small class="nm-hint">One sheet per department with the checklist columns plus Hindi, MoV items, Best filled by, videos and days; a How to fix sheet; a Roles sheet.</small>'
    + '<div class="nm-acts"><button type="button" class="nm-btn pri" onclick="nmExport()">' + NM_I.down + 'Draft (.xlsx)</button></div></section>'
    + '<section class="nm-card"><b class="nm-h">Upload Excel into the draft</b>'
    + '<button type="button" class="nm-drop" onclick="nmImportPick()">' + NM_I.up + '<span><b>Choose file</b></span><small>The file you downloaded here, edited</small></button>'
    + (I ? '<div class="nm-imp"><b>' + nmE(I.name) + '</b>'
      + '<div><span>Matched by ID</span><b>' + I.n.match.toLocaleString('en-IN') + '</b></div>'
      + '<div><span class="g">New rows</span><b>' + I.n.new + '</b></div>'
      + '<div><span class="a">Changed (wording, Hindi, method, MoV, roles, videos, How to fix, status)</span><b>' + I.n.changed + '</b></div>'
      + '<div><span>Missing from the file</span><b>' + I.n.missing + '</b></div>'
      + (I.n.missing ? '<label class="nm-chk"><input type="checkbox"' + (I.retireMissing ? ' checked' : '') + ' onchange="_nm.ui.imp.retireMissing=this.checked;nmRender()"> Retire the ' + I.n.missing + ' missing checkpoints</label>' : '')
      + '<div><span class="r">Rows with errors (skipped)</span><b>' + I.n.errors + '</b></div>'
      + (I.errors.length ? '<details><summary>See the errors</summary><ul>' + I.errors.slice(0, 50).map(function (e) { return '<li>' + nmE(e) + '</li>'; }).join('') + '</ul></details>' : '')
      + (I.n.changed ? '<details><summary>See the changes</summary><ul>' + Object.keys(I.recs).slice(0, 80).map(function (id) { return '<li><b>' + nmE(id) + '</b> · ' + nmE(nmFieldNames(Object.keys(I.recs[id]).join(','))) + '</li>'; }).join('') + (I.n.changed > 80 ? '<li>…and ' + (I.n.changed - 80) + ' more</li>' : '') + '</ul></details>' : '')
      + '<div class="nm-acts"><button type="button" class="nm-btn pri"' + (add && !u.busy ? '' : ' disabled') + ' onclick="nmImportApply()">' + (u.busy ? 'Saving…' : 'Add ' + add + ' change' + (add === 1 ? '' : 's') + ' to draft') + '</button><button type="button" class="nm-btn" onclick="_nm.ui.imp=null;nmRender()">Cancel</button></div></div>' : '')
      + '<small class="nm-hint">Nothing reaches facilities until the draft is published.</small></section></div>'
    + '<aside class="nm-ecol">' + nmStatsHTML() + '<section class="nm-card"><b class="nm-h">To check</b><small class="nm-hint">' + nmToCheck(T).length + ' checkpoints have no method.</small><div class="nm-acts"><button type="button" class="nm-btn" onclick="nmGo(\'tocheck\')">Open To check</button></div></section></aside></div>';
}

// ── admin menu: "Checkpoints" (HealSol only) ──
(function () {
  if (typeof nfAdminItems !== 'function') return;
  var oItems = nfAdminItems;
  nfAdminItems = function () { var L = oItems.apply(this, arguments); if (nfAdminRole() !== 'admin') return L;
    var i = L.findIndex(function (it) { return it.v === 'editor'; }); L.splice(i < 0 ? L.length : i + 1, 0, { v: 'dm', l: 'Checkpoints', icon: 'ti-list-check', onclick: "nfAdminView('dm')" }); return L; };
  var oApply = nfAdminApply;
  nfAdminApply = function () { document.body.classList.toggle('nfv-dm', _nfOv.view === 'dm'); return oApply.apply(this, arguments); };
  var oView = nfAdminView;
  nfAdminView = function (v) { if (_nfOv.view === 'dm' && v !== 'dm' && _nm.ui.dirty) { _nm.ui.dirty = false; } var r = oView.apply(this, arguments); if (v === 'dm') nmOpen(); return r; };
})();

// ══ Step 2c: published version line, day-plan board, review & publish ══
function nmLiveTxt(T) {
  var L = _nm.live[T] || {}, cfg = nmCfg(T), days = nfDeptShape(cfg).days, today = nmIsoDay(new Date());
  if (!L.v) return nmE(cfg.short || T) + ' · ' + days + '-day plan · not published yet — facilities use the checklist as it is';
  return nmE(cfg.short || T) + ' · ' + days + '-day plan · published <b>v' + L.v + '</b> ' + (L.from > today ? 'starts ' + nmE(nmDmy(L.from)) : 'in use since ' + nmE(nmDmy(L.from))) + (L.by ? ' · by ' + nmE(L.by) : '');
}
function nmDmy(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); return m ? m[3] + '-' + m[2] + '-' + m[1] : (iso || ''); }
async function nmLeaveEdit() { if (_nm.ui.screen === 'edit' && _nm.ui.dirty && !await showConfirm('Leave without saving? Your changes to this checkpoint will be lost.', '✏️', 'Unsaved changes', 'Leave', 'var(--red)')) return false; _nm.ui.dirty = false; return true; }
// ── day-plan board ──
async function nmPlanOpen(dept, id) {
  if (!await nmLeaveEdit()) return;
  var u = _nm.ui, T = u.type, S = nfDeptShape(nmCfg(T));
  u.pdept = dept || u.pdept || u.dept; if (!(_nm.base[T].depts || []).some(function (d) { return d.id === u.pdept; })) u.pdept = u.dept;
  u.psel = id || null; u.pphase = u.pphase || 'impl'; u.pweek = u.pweek || 1; u.ppage = u.ppage || 0;
  if (id) { var d = nmDays(T)[id]; if (d && d.i) { u.pphase = 'impl'; u.pweek = Math.floor((d.i - S.i1) / 7) + 1; } else if (d) { u.pphase = 'baseline'; u.ppage = Math.floor((d.b - 1) / 7); } }
  nmGo('plan');
}
function nmPlanUi(k, v) { _nm.ui[k] = v; nmRender(); }
function nmPlanCols(T) {
  var u = _nm.ui, S = nfDeptShape(nmCfg(T)), plan = nmPlan(T, u.pdept), cols = [];
  if (u.pphase === 'baseline') { for (var d = u.ppage * 7 + 1; d <= Math.min(S.base, u.ppage * 7 + 7); d++) cols.push({ day: d, kind: 'b', ids: plan[d - 1] || [] }); }
  else if (u.pphase === 'impl') { var w1 = S.i1 + (u.pweek - 1) * 7; for (var e = w1; e < w1 + 7 && e <= S.iN; e++) cols.push({ day: e, kind: 'i', ids: nfDeptDay(plan, e, S).ids }); }
  return cols;
}
function nmPlanChip(T, id) {
  var c = nmGet(T, id); if (!c) return '';
  var st = nmStatus(T, id), u = _nm.ui;
  return '<button type="button" draggable="true" class="nm-chip' + (u.psel === id ? ' on' : '') + (st ? ' ' + st : '') + '" ondragstart="event.dataTransfer.setData(\'text/plain\',\'' + nmJ(id) + '\')" onclick="nmPlanUi(\'psel\',\'' + nmJ(id) + '\')">'
    + '<span class="nm-ct"><b>' + nmE(c.me) + '</b> ' + nmE(c.t) + '</span>' + (st === 'new' ? '<em>New</em>' : st === 'moved' ? '<em>Moved</em>' : '') + '</button>';
}
async function nmPlanDrop(ev, kind, day) {
  ev.preventDefault(); var id = ev.dataTransfer.getData('text/plain'); if (!id) return;
  _nm.ui.psel = id; await nmPlanMove(kind, day);
}
async function nmPlanMove(kind, day) {
  var u = _nm.ui, T = u.type, id = u.psel; if (!id || !day) return;
  var d = nmDays(T)[id] || {};
  if ((kind === 'b' && d.b === +day) || (kind === 'i' && d.i === +day)) { showToast('It is already on Day ' + day + '.', ''); return; }
  if (await nmMove(T, id, kind, day)) { showToast(id + ' → Day ' + day + ' (in the draft).', 'ok'); nmRender(); }
}
async function nmPlanRespread() {
  var u = _nm.ui, T = u.type;
  if (!await showConfirm('Put ' + nmDeptName(T, u.pdept) + ' back to the even spread? Every move made on this board for the department is removed from the draft.', '↺', 'Re-spread evenly', 'Re-spread', 'var(--teal)')) return;
  if (await nmRespread(T, u.pdept)) { showToast('Back to the even spread.', 'ok'); nmRender(); }
}
function nmPlanHTML() {
  var u = _nm.ui, T = u.type, cfg = nmCfg(T), S = nfDeptShape(cfg), B = _nm.base[T], wb = nfDeptWeekBase(S);
  var all = nmRows(T).filter(function (r) { return r[1] === u.pdept; }).length, cols = nmPlanCols(T);
  var moved = Object.keys((_nm.draft[T] || {}).moves || {}).filter(function (id) { var c = nmGet(T, id); return c && c.dept === u.pdept; }).length;
  var ph = function (k, l, from, to, fr) { return '<button type="button" class="ph-' + k + (u.pphase === k ? ' on' : '') + '" style="flex:' + fr + '" onclick="nmPlanUi(\'pphase\',\'' + k + '\')">' + l + ' · ' + from + '–' + to + '</button>'; };
  var rng = function (a) { return a.length ? (a.length > 1 ? a[0] + '–' + a[a.length - 1] : a[0]) : ''; };
  var sub = '';
  if (u.pphase === 'baseline' && S.base > 7) { sub = '<div class="nm-wk" role="tablist" aria-label="Baseline days">'; for (var p = 0; p * 7 < S.base; p++) sub += '<button type="button" role="tab" aria-selected="' + (u.ppage === p) + '" class="' + (u.ppage === p ? 'on' : '') + '" onclick="nmPlanUi(\'ppage\',' + p + ')">Days ' + (p * 7 + 1) + '–' + Math.min(S.base, p * 7 + 7) + '</button>'; sub += '</div>'; }
  if (u.pphase === 'impl') { sub = '<div class="nm-wk" role="tablist" aria-label="Implementation week">'; for (var w = 1; w <= S.implWeeks; w++) sub += '<button type="button" role="tab" aria-selected="' + (u.pweek === w) + '" class="' + (u.pweek === w ? 'on' : '') + '" onclick="nmPlanUi(\'pweek\',' + w + ')">Wk ' + w + ' <small>· B ' + rng(wb[w - 1]) + '</small></button>'; sub += '</div>'; }
  var sel = u.psel ? nmGet(T, u.psel) : null, sd = sel ? nmDays(T)[sel.id] : null;
  var opts = function (kind) { var o = ''; if (kind === 'b') { for (var d = 1; d <= S.base; d++) o += nmOpt(d, 'Baseline day ' + d + ' (' + (nmPlan(T, u.pdept)[d - 1] || []).length + ')', sd && sd.b); }
    else { var plan = nmPlan(T, u.pdept); for (var e = S.i1; e <= S.iN; e++) o += nmOpt(e, 'Day ' + e + ' · week ' + (Math.floor((e - S.i1) / 7) + 1) + ' (' + nfDeptDay(plan, e, S).ids.length + ')', sd && sd.i); } return o; };
  var kind = u.pphase === 'baseline' ? 'b' : 'i';
  return '<p class="ce-lead"><b>Day plans · ' + nmE(cfg.short || T) + ' · ' + S.days + ' days</b> — moves are saved in the draft and reach facilities when you publish</p>'
    + '<div class="nm-bar"><label class="nm-lbl">Department<select onchange="_nm.ui.psel=null;nmPlanUi(\'pdept\',this.value)">' + B.depts.map(function (d) { return nmOpt(d.id, d.name, u.pdept); }).join('') + '</select></label>'
    + '<span class="nm-live">' + all + ' checkpoints' + (moved ? ' · ' + moved + ' moved on this board' : '') + '</span>'
    + '<div class="nm-acts"><button type="button" class="nm-btn"' + (moved ? '' : ' disabled') + ' onclick="nmPlanRespread()">Re-spread evenly</button></div></div>'
    + '<section class="nm-card"><div class="nm-phases">' + ph('baseline', 'Baseline', 1, S.bN, S.base) + ph('impl', 'Implementation · ' + S.implWeeks + ' weeks', S.i1, S.iN, S.implWeeks * 7) + ph('endline', 'End-line', S.e1, S.eN, S.end) + ph('ready', 'Readiness week', S.r1, S.rN, S.ready) + '</div>' + sub + '</section>'
    + '<div class="nm-psplit"><div class="nm-pcols-wrap">'
    + (cols.length ? '<div class="nm-pcols" style="grid-template-columns:repeat(' + cols.length + ',minmax(104px,1fr));min-width:' + (cols.length * 112) + 'px">' + cols.map(function (c) {
        var heavy = c.ids.length > NM_DAY_WARN;
        return '<div class="nm-pcol' + (heavy ? ' heavy' : '') + '" ondragover="event.preventDefault()" ondrop="nmPlanDrop(event,\'' + c.kind + '\',' + c.day + ')"><div class="nm-pch"><span>Day ' + c.day + '</span><em>' + c.ids.length + (heavy ? ' · over ' + NM_DAY_WARN : '') + '</em></div>'
          + '<div class="nm-pcl">' + c.ids.map(function (id) { return nmPlanChip(T, id); }).join('') + (c.ids.length ? '' : '<div class="nm-hint">No checkpoints</div>') + '</div></div>';
      }).join('') + '</div>'
      : '<div class="nm-empty">' + (u.pphase === 'endline' ? 'End-line days ' + S.e1 + '–' + S.eN + ' repeat the baseline days 1–' + S.bN + ' in the same order. Move a checkpoint on the baseline to change its end-line day too.' : 'Readiness days ' + S.r1 + '–' + S.rN + ': end-line verification, final team review and graduation — no checklist cards.') + '</div>')
    + '</div><aside class="nm-ecol">'
    + (sel ? '<section class="nm-card"><div class="nm-sh"><span>' + nmE(sel.id + ' · ' + sel.me) + '</span>' + nmTag(nmStatus(T, sel.id)) + '</div><div class="nm-st">' + nmE(sel.t) + '</div>'
        + (sd ? '<div class="nm-days"><div><span class="b">Baseline · Day ' + sd.b + '</span>' + (sd.i ? '<span class="i">Implementation · Day ' + sd.i + '</span>' : '') + '<span class="e">End-line · Day ' + sd.e + '</span></div></div>' : '')
        + (u.pphase === 'baseline' || u.pphase === 'impl' ? '<label>Move to<select id="nm-mvto">' + opts(kind) + '</select></label><button type="button" class="nm-btn pri" onclick="nmPlanMove(\'' + kind + '\',document.getElementById(\'nm-mvto\').value)">Move</button>'
          + '<small class="nm-hint">' + (kind === 'b' ? 'A new baseline day also changes its implementation week and its end-line day.' : 'Only its implementation day changes; baseline and end-line stay.') + ' Or drag the card onto another day.</small>' : '')
        + (nmStatus(T, sel.id) ? '<button type="button" class="nm-btn" onclick="nmUndoAsk(\'' + nmJ(sel.id) + '\')">Undo changes to ' + nmE(sel.id) + '</button>' : '') + '</section>'
      : '<section class="nm-card"><b class="nm-h">Move a checkpoint</b><small class="nm-hint">Click a checkpoint, then choose its new day — or drag it onto another day.</small></section>')
    + '<section class="nm-card"><small class="nm-hint"><b>Baseline</b> and <b>End-line</b> spread every checkpoint of the department over ' + S.base + ' days. <b>Implementation</b> week n revisits baseline day(s) shown on its tab, spread over 7 days. Days over ' + NM_DAY_WARN + ' checkpoints are marked; you are warned before publishing.</small></section>'
    + '</aside></div>';
}

// ── review & publish ──
function nmPubOpen() { nmLeaveEdit().then(function (ok) { if (!ok) return; _nm.ui.vers = null; _nm.ui.plimit = 50; nmGo('publish'); var T = _nm.ui.type; nmVersions(T).then(function (v) { _nm.ui.vers = v; if (_nm.ui.screen === 'publish' && _nm.ui.type === T) nmRender(); }); }); }
function nmChangeDetail(T, x) {
  var d = nmGet(T, x.id), l = nmGetLive(T, x.id);
  if (x.st === 'new') return d ? [d.me, d.method.join('/'), nmDeptName(T, d.dept)].filter(Boolean).join(' · ') : '';
  if (x.st === 'retired') return 'Leaves future days; past answers stay in reports';
  if (x.st === 'moved') { var m = ((_nm.draft[T] || {}).moves || {})[x.id] || {}; return 'Day plan: ' + [m.b ? 'baseline day ' + m.b : '', m.i ? 'implementation day ' + m.i : ''].filter(Boolean).join(', ') + (!m.b && !m.i ? 'back to the even spread' : ''); }
  if (!d) return 'Removed from the draft';
  var f = NM_FIELDS.filter(function (k) { return !nmSame(k, d[k], l ? l[k] : null); }).map(function (k) { return NM_FNAME[k] || k; });
  var mv = nmStable(((_nm.draft[T] || {}).moves || {})[x.id]) !== nmStable(((_nm.live[T] || {}).moves || {})[x.id]);
  return (f.length ? 'Changed: ' + f.join(', ') : '') + (mv ? (f.length ? ' · ' : '') + 'day plan' : '');
}
async function nmPubGo() {
  var T = _nm.ui.type, n = nmChangeCount(T), heavy = nmHeavy(T), facs = nmFacs(T).length, note = (document.getElementById('nm-pnote') || {}).value || '';
  if (heavy.length && !await showConfirm(heavy.length + ' day' + (heavy.length === 1 ? ' has' : 's have') + ' more than ' + NM_DAY_WARN + ' checkpoints. Publish anyway?', '⚠️', 'Heavy days', 'Publish anyway', 'var(--amber-dk)')) return;
  if (!await showConfirm('Publish v' + ((_nm.live[T].v || 0) + 1) + ' with ' + n + ' change' + (n === 1 ? '' : 's') + '? It reaches ' + facs + ' ' + (nmCfg(T).short || T) + (facs === 1 ? '' : 's') + ' from ' + nmDmy(nmTomorrow()) + '.', '🚀', 'Publish', 'Publish', 'var(--teal)')) return;
  _nm.ui.busy = true; nmRender();
  var v = await nmPublish(T, note.trim()); _nm.ui.busy = false;
  if (v) { showToast('Published v' + v + ' — facilities get it from ' + nmDmy(nmTomorrow()) + '.', 'ok'); nmPubOpen(); } else nmRender();
}
async function nmDiscardAsk() {
  var T = _nm.ui.type;
  if (!await showConfirm('Discard all ' + nmChangeCount(T) + ' draft changes? The draft goes back to the published version' + (_nm.live[T].v ? ' (v' + _nm.live[T].v + ')' : ' (the checklist)') + '.', '🗑️', 'Discard draft', 'Discard', 'var(--red)')) return;
  if (await nmDiscard(T)) { showToast('Draft discarded.', 'ok'); nmRender(); }
}
async function nmRollbackAsk(v) {
  var T = _nm.ui.type, n = nmChangeCount(T);
  if (!await showConfirm((v ? 'Roll back to v' + v : 'Go back to the checklist as it is') + '? It is published as a new version from ' + nmDmy(nmTomorrow()) + ' and becomes the draft too' + (n ? ' — the ' + n + ' unpublished draft change' + (n === 1 ? '' : 's') + ' will be lost' : '') + '.', '↩️', 'Roll back', 'Roll back', 'var(--red)')) return;
  var nv = await nmRollback(T, v); if (nv) { showToast('Published v' + nv + ' (' + (v ? 'same as v' + v : 'the checklist') + ').', 'ok'); nmPubOpen(); }
}
function nmPubHTML() {
  var u = _nm.ui, T = u.type, L = _nm.live[T] || {}, ch = nmChanges(T), heavy = nmHeavy(T), tc = nmToCheck(T).length, facs = nmFacs(T).length, cnt = {};
  ch.forEach(function (x) { cnt[x.st] = (cnt[x.st] || 0) + 1; });
  var nv = (L.v || 0) + 1, tag = function (st, n, l) { return n ? '<span class="nm-tag ' + ({ new: 'new', edited: 'ed', retired: 'ret', moved: 'mv' })[st] + '">' + n + ' ' + l + '</span>' : ''; };
  var V = u.vers;
  return '<div class="nm-ehd"><button type="button" class="nm-ib" aria-label="Back" onclick="nmGo(\'list\')">' + NM_I.back + '</button><div class="nm-et"><b>Review &amp; publish · ' + nmE(nmCfg(T).short || T) + '</b><small>' + nmLiveTxt(T).replace(/<[^>]+>/g, '') + '</small></div></div>'
    + '<div class="nm-esplit"><section class="nm-card p0" aria-label="Changes in this draft"><div class="nm-ch pad"><div><b class="nm-h">Draft v' + nv + ' — ' + ch.length + ' change' + (ch.length === 1 ? '' : 's') + '</b><small>Compared with ' + (L.v ? 'published v' + L.v + ' (' + nmDmy(L.from) + ')' : 'the checklist (nothing published yet)') + '</small></div>'
    + '<div class="nm-acts">' + tag('new', cnt.new, 'new') + tag('edited', cnt.edited, 'edited') + tag('retired', cnt.retired, 'retired') + tag('moved', cnt.moved, 'moved') + '</div></div>'
    + (ch.length ? '<ul class="nm-chl">' + ch.slice(0, u.plimit || 50).map(function (x) { var c = nmGet(T, x.id) || nmGetLive(T, x.id) || { t: '' };
        return '<li>' + nmTag(x.st) + '<div><b>' + nmE(x.id) + ' · ' + nmE(c.t) + '</b><small>' + nmE(nmChangeDetail(T, x)) + '</small></div><button type="button" class="nm-lnk" onclick="nmUndoAsk(\'' + nmJ(x.id) + '\')">Undo</button></li>'; }).join('') + '</ul>'
        + (ch.length > (u.plimit || 50) ? '<div class="nm-foot pad"><span></span><button type="button" class="nm-lnk" onclick="_nm.ui.plimit=(_nm.ui.plimit||50)+100;nmRender()">Show ' + Math.min(100, ch.length - (u.plimit || 50)) + ' more</button></div>' : '')
      : '<div class="nm-empty sm">' + NM_I.ok + ' The draft is the same as the published version.</div>')
    + '</section><aside class="nm-ecol">'
    + '<section class="nm-card nm-checks" aria-label="Checks before publishing"><b class="nm-h">Checks</b>'
    + '<div class="ok">' + NM_I.ok + 'Every active checkpoint has a day</div>'
    + (heavy.length ? '<div class="w">' + NM_I.warn + '<span>' + heavy.length + ' day' + (heavy.length === 1 ? '' : 's') + ' over ' + NM_DAY_WARN + ' checkpoints: ' + heavy.slice(0, 4).map(function (h) { return nmE(h.dept) + ' day ' + h.day + ' (' + h.n + ')'; }).join(', ') + (heavy.length > 4 ? '…' : '') + '</span></div>' : '<div class="ok">' + NM_I.ok + 'No day over ' + NM_DAY_WARN + ' checkpoints</div>')
    + (tc ? '<div class="w">' + NM_I.warn + '<span>' + tc + ' checkpoint' + (tc === 1 ? ' has' : 's have') + ' no method — <button type="button" class="nm-lnk" onclick="nmGo(\'tocheck\')">To check</button></span></div>' : '<div class="ok">' + NM_I.ok + 'Every checkpoint has a method</div>') + '</section>'
    + '<section class="nm-card"><b class="nm-h">When you publish</b><ul class="nm-bul"><li>v' + nv + ' goes to all <b>' + facs + ' ' + nmE(nmCfg(T).short || T) + (facs === 1 ? '' : 's') + '</b> from <b>' + nmE(nmDmy(nmTomorrow())) + '</b>.</li><li>Days a facility has already reached keep their checkpoints.</li><li>Phones pick it up the next time they open the app.</li><li>' + (L.v ? 'v' + L.v + ' is kept — you can roll back.' : 'The checklist stays available — you can roll back to it.') + '</li></ul></section>'
    + '<label class="nm-lbl col">Note for this version<input type="text" id="nm-pnote" maxlength="200" placeholder="e.g. Methods for LAB-027, EM-012; OPD wording"></label>'
    + '<button type="button" class="nm-btn pri big"' + (ch.length && !u.busy ? '' : ' disabled') + ' onclick="nmPubGo()">' + (u.busy ? 'Publishing…' : 'Publish v' + nv) + '</button>'
    + '<button type="button" class="nm-btn danger"' + (ch.length ? '' : ' disabled') + ' onclick="nmDiscardAsk()">Discard draft</button>'
    + '<section class="nm-card" aria-label="Versions"><b class="nm-h">Versions</b>'
    + (V == null ? '<div class="nm-hint">Loading…</div>' : '<ul class="nm-ul vers">' + V.map(function (x) { return '<li><span><b>v' + x.v + '</b>' + (x.v === L.v ? ' · live' : '') + ' · ' + nmE(nmDmy(x.from)) + ' · ' + nmE(x.by || '') + (x.note ? '<small>' + nmE(x.note) + '</small>' : '') + '</span>' + (x.v === L.v ? '<span class="nm-mut">' + facs + ' in use</span>' : '<button type="button" class="nm-lnk" onclick="nmRollbackAsk(' + x.v + ')">Roll back</button>') + '</li>'; }).join('')
      + '<li><span><b>v0</b> · the checklist as it is</span>' + (L.v ? '<button type="button" class="nm-lnk" onclick="nmRollbackAsk(0)">Roll back</button>' : '<span class="nm-mut">live</span>') + '</li></ul>') + '</section>'
    + '</aside></div>';
}
