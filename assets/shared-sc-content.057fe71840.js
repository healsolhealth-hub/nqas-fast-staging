// ══════════════════════════════════════════════════════════════
// CONTENT · SUB-CENTRE — the same screens as UPHC / PHC / CHC (23 Oct 2026, canvas "Content editor — merged", round 2).
//   Checkpoints: Areas of Concern on the left (every checkpoint is in exactly one), filters Search · Service package / area ·
//   Role · Show Hindi · More filters (Standard, ME, day, linked checks); table ID · Checkpoint · Who · How it is checked · Day;
//   side panel only on a pick (Edit · How to fix · Linked checks · Move day).
//   Day plans: phase bar, week tabs, one column per day (moves follow the Sub-Centre rules through scCpMoveDay;
//   "Titles & tasks" opens the day-card editor). Standards: Area → Standard → ME with counts, titles and minimums.
//   Import / export: Excel download (Checkpoints + Things to tick + Read me) and upload of that Excel back, or the revised
//   NQAS checklist (CSV). The data and the Sub-Centre draft (shared/sc-draft.js) are unchanged — this file only draws.
// ══════════════════════════════════════════════════════════════
var _scc = { sel: null, more: false, ph: 'impl', wk: 0, psel: null, imp: null };
var SCC_M = { SI: 'Staff interview', RR: 'Record review', OB: 'Observation', CI: 'Client interview', PI: 'Client interview' };
var SCC_ROLES = ['CHO', 'ANM', 'ASHA', 'MPW', 'MO', 'General'];
function sccE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function sccJ(s) { return typeof scJs === 'function' ? scJs(s) : String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function sccPk() { return _scCpmUi.pkg === '12A' ? 'nqas_12A' : 'nqas_12B'; }
function sccPkOf(c) { var pk = sccPk(); return c.pk.indexOf(pk === 'nqas_12A' ? '12A' : '12B') >= 0 ? pk : (c.pk.indexOf('12B') >= 0 ? 'nqas_12B' : 'nqas_12A'); }
function sccBase(inclRet) { var u = _scCpmUi; return scCpmAll({ pkg: u.pkg === 'all' ? null : 'nqas_' + u.pkg, includeRetired: !!inclRet }); }
function sccActive(c) { return !c.retired && c.kind === 'nqas'; }
function sccDays(c) { try { return c.kind === 'nqas' ? scCpDays(sccPkOf(c), c.id) : null; } catch (e) { return null; } }
function sccStatus(c, ch) { return ch[c.id] ? (_scCpm.added && _scCpm.added[c.id] ? 'new' : 'edited') : ''; }
function sccHi() { return typeof _ce !== 'undefined' && !!_ce.hi; }
function sccSvcLabel(s) { return s; }

// ── Checkpoints ──
function sccTilesHTML(ch) {
  var u = _scCpmUi, all = sccBase(true).filter(function (c) { return !u.aoc || c.aoc === u.aoc; }), iss = 0;
  try { iss = scCpmChecks(u.pkg).filter(function (c) { return c.level === 'error' || c.level === 'warn'; }).length; } catch (e) {}
  var n = { active: all.filter(sccActive).length, attn: iss, changed: all.filter(function (c) { return ch[c.id]; }).length, retired: all.filter(function (c) { return c.retired; }).length };
  var cur = u.view === 'checks' ? 'attn' : u.ceChanged ? 'changed' : u.kind === 'retired' ? 'retired' : 'active';
  var where = u.aoc ? 'in ' + u.aoc + ' · ' + SC_CPM_AOC[u.aoc] : 'NQAS checkpoints';
  var t = function (k, l, sub, cls) { return '<button type="button" class="ce-tile' + (cls ? ' ' + cls : '') + (cur === k ? ' on' : '') + '" aria-pressed="' + (cur === k) + '" onclick="ceScTile(\'' + k + '\')"><span>' + l + '</span><b>' + n[k].toLocaleString('en-IN') + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</button>'; };
  return '<div class="ce-tiles">' + t('active', 'All active · ' + (u.pkg === 'all' ? 'both' : u.pkg), sccE(where)) + t('attn', 'Needs attention', 'checks to review', n.attn ? 'warn' : '') + t('changed', 'Changed in draft', '') + t('retired', 'Retired', '') + '</div>';
}
function sccListHTML() {
  var u = _scCpmUi, ch = ceScChanged(), base = sccBase(false).filter(sccActive), list = scCpmFiltered(), hi = sccHi();
  if (_scc.sel && !scCpmGet(_scc.sel)) _scc.sel = null;
  var sel = _scc.sel ? scCpmGet(_scc.sel) : null;
  var cnt = {}; base.forEach(function (c) { cnt[c.aoc] = (cnt[c.aoc] || 0) + 1; });
  var inA = base.filter(function (c) { return !u.aoc || c.aoc === u.aoc; });
  var svc = {}, role = {}; inA.forEach(function (c) { if (c.svc) svc[c.svc] = (svc[c.svc] || 0) + 1; c.r.forEach(function (r) { role[r] = (role[r] || 0) + 1; }); });
  var opt = function (v, l, cur) { return '<option value="' + sccE(v) + '"' + (String(cur || '') === String(v) ? ' selected' : '') + '>' + sccE(l) + '</option>'; };
  var pkgs = SC_SVC_GROUPS.service.filter(function (s) { return svc[s] || u.svc === s; }), others = Object.keys(svc).filter(function (s) { return pkgs.indexOf(s) < 0 && SC_SVC_GROUPS.service.indexOf(s) < 0; }).sort();
  var svcSel = '<select class="rd-svcsel" aria-label="Service package or area" onchange="sccSet(\'svc\',this.value)">' + opt('', 'All packages and areas', u.svc)
    + '<optgroup label="Service packages">' + pkgs.map(function (s) { return opt(s, s + ' · ' + (svc[s] || 0), u.svc); }).join('') + '</optgroup>'
    + (others.length ? '<optgroup label="Other areas">' + others.map(function (s) { return opt(s, s + ' · ' + svc[s], u.svc); }).join('') + '</optgroup>' : '') + '</select>';
  var roleSel = '<select aria-label="Role" onchange="sccSet(\'role\',this.value)">' + opt('', 'All roles', u.role) + SCC_ROLES.map(function (r) { return opt(r, r + ' · ' + (role[r] || 0), u.role); }).join('') + '</select>';
  // more filters
  var H = scCpmHierarchy(u.pkg === 'all' ? null : 'nqas_' + u.pkg), stds = Object.keys(H.std).filter(function (s) { return !u.aoc || s.charAt(0) === u.aoc; }).sort(scStdCmp), mes = u.std && H.std[u.std] ? H.std[u.std].me : [];
  var rng = u.phase === 'bl' ? [1, 7] : u.phase === 'impl' ? [8, 49] : u.phase === 'rev' ? [50, 56] : null, dopts = '<option value="">' + (u.phase ? '— choose a day —' : 'Day (choose a phase)') + '</option>';
  if (rng) for (var d = rng[0]; d <= rng[1]; d++) { var nd = (scDayDef(sccPk(), d - 1).cps || []).length; dopts += '<option value="' + d + '"' + (String(u.day) === String(d) ? ' selected' : '') + '>' + sccE(d <= 49 ? scDpDayLabel(d) : 'Day ' + d + ' · End-line · ' + SC_BASELINE[d - 50].title) + ' (' + nd + ')</option>'; }
  var moreN = [u.std, u.me, u.phase && u.day, u.lk].filter(Boolean).length;
  var more = '<div class="nm-filt ce-more2' + (_scc.more ? ' open' : '') + '" id="scc-more">'
    + '<label>Standard<select onchange="_scCpmUi.me=\'\';sccSet(\'std\',this.value)">' + opt('', 'All', u.std) + stds.map(function (s) { return opt(s, s + (H.std[s].title ? ' · ' + H.std[s].title.slice(0, 40) : ''), u.std); }).join('') + '</select></label>'
    + '<label>ME<select' + (u.std ? '' : ' disabled') + ' onchange="sccSet(\'me\',this.value)">' + opt('', u.std ? 'All in ' + u.std : 'Choose a Standard', u.me) + mes.map(function (m) { return opt(m, m + (H.me[m].title ? ' · ' + H.me[m].title.slice(0, 40) : ''), u.me); }).join('') + '</select></label>'
    + '<label>Day<select class="scdp-phase" onchange="_scCpmUi.day=\'\';sccSet(\'phase\',this.value)">' + [['', 'All days'], ['bl', 'Baseline (Days 1–7)'], ['impl', 'Implementation (Days 8–49)'], ['rev', 'End-line (Days 50–56)']].map(function (o) { return opt(o[0], o[1], u.phase); }).join('') + '</select>'
    + '<select class="scdp-day"' + (u.phase ? '' : ' disabled') + ' onchange="sccSet(\'day\',this.value)">' + dopts + '</select></label>'
    + '<label class="scm-lkf ce-sw"><input type="checkbox" ' + (u.lk ? 'checked ' : '') + 'onchange="sccSet(\'lk\',this.checked)"> Has linked checks</label></div>';
  var chk = u.check ? (scCpmChecks(u.pkg).find(function (x) { return x.key === u.check; }) || null) : null;
  var h = (typeof scCpmPendingImport === 'function' && scCpmPendingImport() ? '<div class="scm-import"><div style="flex:1;"><b>Card Editor edits found from before the Checkpoint Master.</b><br>Import them once so the master has your latest wording, Hindi text, roles and videos.</div><button class="nm-btn" onclick="scCpmDoImport()">Import edits</button></div>' : '')
    + sccTilesHTML(ch)
    + '<div class="nm-body' + (sel ? ' has-sel' : '') + '">'
    + '<aside class="nm-depts" aria-label="Areas of Concern"><div class="nm-dl"><button type="button" class="' + (u.aoc ? '' : 'on') + '" onclick="sccSet(\'aoc\',\'\')"><span>All checkpoints</span><em>' + base.length + '</em></button></div>'
    + '<div class="nm-cap">Areas of Concern</div><div class="nm-dl">'
    + Object.keys(SC_CPM_AOC).map(function (a) { return '<button type="button" class="' + (u.aoc === a ? 'on' : '') + '" onclick="sccSet(\'aoc\',\'' + a + '\')"><span><b>' + a + '</b> ' + sccE(SC_CPM_AOC[a]) + '</span><em>' + (cnt[a] || 0) + '</em></button>'; }).join('')
    + '</div></aside>'
    + '<section class="nm-tbl" aria-label="Checkpoints">'
    + '<div class="nm-filt"><label class="nm-search"><span class="nm-sr">Search checkpoints</span><input id="scc-q" type="search" placeholder="Search ID, text or ME" value="' + sccE(u.q) + '" oninput="sccQ(this.value)"></label>'
    + '<label>Package / area' + svcSel + '</label><label>Role' + roleSel + '</label>'
    + '<label class="ce-sw"><input type="checkbox" ' + (hi ? 'checked ' : '') + 'onchange="ceSetHi(this.checked)"> Show Hindi</label>'
    + '<button type="button" class="nm-btn ce-moreb" aria-expanded="' + !!_scc.more + '" aria-controls="scc-more" onclick="_scc.more=!_scc.more;scCpmRender()">' + (_scc.more ? 'Fewer filters' : 'More filters') + (moreN ? ' (' + moreN + ' on)' : '') + '</button></div>'
    + more
    + (chk ? '<div class="ce-chips"><button type="button" class="ce-chip" onclick="_scCpmUi.check=\'\';scCpmRender()">Showing: ' + sccE(chk.label) + ' (' + chk.n + ') <span aria-hidden="true">×</span></button></div>' : '')
    + '<div class="nm-sum"><span><b>' + list.length + '</b>' + (u.kind === 'retired' || u.ceChanged || chk ? '' : ' of ' + inA.length) + ' ' + (u.aoc ? 'in ' + sccE(u.aoc + ' · ' + SC_CPM_AOC[u.aoc]) : 'shown') + (u.svc ? ' · ' + sccE(u.svc) : '') + (u.role ? ' · ' + sccE(u.role) : '') + '</span>'
    + '<span class="scc-acts">' + (list.length ? '<button type="button" class="nm-lnk ce-edit" onclick="sccBulkRoles()">Set role for these ' + list.length + '</button>' : '') + '<button type="button" class="nm-lnk nflx-open" onclick="nfLxOpen(null)">Linked checks</button></span></div>'
    + '<div class="nm-scroll"><table><thead><tr><th scope="col">ID</th><th scope="col">Checkpoint</th><th scope="col">Who</th><th scope="col">How it is checked</th><th scope="col">Day</th></tr></thead><tbody>'
    + list.slice(0, u.limit).map(function (c) {
      var st = sccStatus(c, ch), d = sccDays(c), lx = typeof nfLxCount === 'function' ? nfLxCount(c.id) : 0, ni = (c.items || []).length;
      var sub = (c.kind === 'nqas' ? 'AoC ' + c.aoc + ' › ' + c.std + ' › ' + String(c.me).replace(/^ME /, '') : 'Programme milestone') + (ni ? ' · ' + ni + ' MoV item' + (ni === 1 ? '' : 's') : '') + (lx ? ' · Linked ' + lx : '') + (c.svc ? ' · ' + sccE(c.svc) : '');
      return '<tr class="scm-row' + (_scc.sel === c.id ? ' on' : '') + (c.retired ? ' ret' : '') + '" onclick="sccPick(\'' + sccJ(c.id) + '\')"><td class="id">' + sccE(c.id) + '</td>'
        + '<td class="t"><button type="button" class="nm-rowbtn" onclick="event.stopPropagation();sccPick(\'' + sccJ(c.id) + '\')">' + sccE(c.t) + '</button>'
        + (hi ? '<div class="ce-hi scm-hi' + (c.hi ? '' : ' miss') + '">' + (c.hi ? sccE(c.hi) : 'No Hindi yet') + '</div>' : '')
        + '<div class="ce-sub">' + sub + (st === 'new' ? ' <span class="nm-tag new">New</span>' : st ? ' <span class="nm-tag ed">Changed</span>' : '') + (c.retired ? ' <span class="nm-tag ret">Retired</span>' : '') + (c.movChanged ? ' <span class="nm-tag tc">MoV changed</span>' : '') + '</div></td>'
        + '<td class="w">' + sccE(c.r.join(', ')) + '</td>'
        + '<td class="m">' + (c.method.length ? c.method.map(function (m) { return '<span class="nm-m ' + (c.retired ? 'off' : ({ SI: 'si', RR: 'rr', OB: 'ob', CI: 'pi' })[m] || 'off') + '">' + sccE(SCC_M[m] || m) + '</span>'; }).join('') : '<span class="nm-tag tc">None set</span>') + '</td>'
        + '<td class="d">' + (d ? 'Base ' + d.bl + (d.blMoved ? '*' : '') + ' · Impl ' + d.impl + (d.implMoved ? '*' : '') : '—') + '</td></tr>';
    }).join('') + '</tbody></table>'
    + (list.length ? '' : '<div class="nm-empty sm">No checkpoints match.</div>') + '</div>'
    + '<div class="nm-foot"><span>Base = baseline day · Impl = implementation day · * moved by hand · the end-line repeats the baseline checkpoints</span>' + (list.length > u.limit ? '<button type="button" class="nm-lnk" onclick="_scCpmUi.limit+=300;scCpmRender()">Show ' + Math.min(300, list.length - u.limit) + ' more</button>' : '') + '</div></section>'
    + (sel ? '<aside class="nm-side" aria-label="Selected checkpoint">' + sccSideHTML(sel, ch) + '</aside>' : '') + '</div>';
  return '<div class="scc">' + h + '</div>';
}
function sccSideHTML(c, ch) {
  var d = sccDays(c), lx = typeof nfLxCount === 'function' ? nfLxCount(c.id) : 0, st = sccStatus(c, ch), I = sccJ(c.id);
  var also = (typeof nfCcOf === 'function' ? nfCcOf(c) : []).filter(function (a) { return a !== c.svc; });
  var std = c.std ? (scRegTitle('std', c.std) || '') : '', me = c.me ? (scRegTitle('me', c.me) || '') : '';
  return '<div class="nm-sh"><span>' + sccE(c.id + (c.aoc ? ' · ' + c.aoc : '') + (c.svc ? ' · ' + c.svc : '')) + '</span>' + (st === 'new' ? '<span class="nm-tag new">New</span>' : st ? '<span class="nm-tag ed">Changed</span>' : '') + '<button type="button" class="ce-x" aria-label="Close" onclick="sccPick(null)">' + NM_I.x + '</button></div>'
    + '<div class="nm-st">' + sccE(c.t) + '</div>' + (c.hi ? '<div class="nm-hi">' + sccE(c.hi) + '</div>' : '<div class="nm-hi miss">No Hindi yet</div>')
    + ((c.items || []).length ? '<div class="nm-box"><b>MoV · ' + c.items.length + ' item' + (c.items.length === 1 ? '' : 's') + '</b><ol>' + c.items.map(function (x) { return '<li>' + sccE(x.t) + (x.m && x.m.length ? ' <small>(' + sccE(x.m.join(', ')) + ')</small>' : '') + '</li>'; }).join('') + '</ol></div>'
      : (c.full ? '<div class="nm-box"><b>What Full looks like</b><div>' + sccE(c.full) + '</div></div>' : ''))
    + '<dl class="nm-dl2"><dt>Area</dt><dd>' + sccE(c.kind === 'nqas' ? c.aoc + ' · ' + SC_CPM_AOC[c.aoc] : 'Programme milestone') + '</dd>'
    + (c.std ? '<dt>Standard</dt><dd>' + sccE(c.std + (std ? ' · ' + std : '')) + '</dd><dt>ME</dt><dd>' + sccE(c.me + (me ? ' · ' + me : '')) + '</dd>' : '')
    + '<dt>Who</dt><dd>' + sccE(c.r.join(', ')) + '</dd>'
    + '<dt>Method</dt><dd>' + (c.method.length ? c.method.map(function (m) { return SCC_M[m] || m; }).join(', ') : '<span class="nm-tag tc">Not set</span>') + '</dd>'
    + '<dt>Days (' + sccPkOf(c).slice(5) + ')</dt><dd>' + (d ? 'Baseline ' + d.bl + ' · Implementation ' + d.impl + ' · End-line ' + d.rev : '—') + '</dd>'
    + '<dt>Packages</dt><dd>' + sccE(c.pk.join(' · ')) + '</dd>'
    + (also.length ? '<dt>Also in</dt><dd>' + sccE(also.join(', ')) + '</dd>' : '')
    + '<dt>Video</dt><dd>' + (c.video ? 'English' + (c.videoHi ? ' · Hindi' : '') : 'None') + '</dd></dl>'
    + '<div class="scc-sbtn ce-edit"><button type="button" class="nm-btn pri" onclick="scCpmEdit(\'' + I + '\')">Edit</button><button type="button" class="nm-btn" onclick="nfFixEdit(\'' + I + '\')">How to fix</button>'
    + '<button type="button" class="nm-btn" onclick="nfLxOpen(\'' + I + '\')">Linked checks' + (lx ? ' ' + lx : '') + '</button>' + (c.kind === 'nqas' ? '<button type="button" class="nm-btn" onclick="scCpMoveDay(\'' + I + '\')">Move day</button>' : '') + '</div>';
}
function sccSet(k, v) { var u = _scCpmUi; u[k] = v; u.limit = 600; if (k === 'aoc') { u.std = ''; u.me = ''; } if (k === 'aoc' || k === 'svc') _scc.sel = null; scCpmRender(); }
function sccQ(v) { _scCpmUi.q = v; clearTimeout(window._sccT); window._sccT = setTimeout(function () { _scCpmUi.limit = 600; scCpmRender(); var i = document.getElementById('scc-q'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } }, 250); }
function sccPick(id) {
  _scc.sel = id && _scc.sel !== id ? id : null; scCpmRender();
  if (_scc.sel && (window.innerWidth || 1280) < 1180) { var sd = document.querySelector('#scm-panel .nm-side'); if (sd && sd.scrollIntoView) sd.scrollIntoView({ block: 'start' }); }
}
function sccBulkRoles() { _scCpmUi.sel = {}; scCpmFiltered().slice(0, _scCpmUi.limit).forEach(function (c) { _scCpmUi.sel[c.id] = true; }); scCpmBulkRoles(); }

// ── Standards ──
function sccStdsHTML() {
  var u = _scCpmUi, H = scCpmHierarchy(u.pkg === 'all' ? null : 'nqas_' + u.pkg), nStd = Object.keys(H.std).length, nMe = Object.keys(H.me).length;
  var titled = Object.keys(H.std).filter(function (s) { return H.std[s].title; }).length + Object.keys(H.me).filter(function (m) { return H.me[m].title; }).length, tot = 0;
  Object.keys(H.aoc).forEach(function (a) { tot += H.aoc[a].cps; });
  var crit = typeof _scCrit !== 'undefined' ? _scCrit : null;
  var minTxt = function (s) { if (!crit || typeof scNqasStdMin !== 'function') return ''; var m = scNqasStdMin(s); return '<i class="scm-min' + (m !== crit.stdDefault ? ' hi' : '') + '">≥' + m + '%</i>'; };
  return '<div class="scc">'
    + (crit ? '<div class="ce-lead">NQAS criteria · overall ≥' + crit.overall + '% · every Area of Concern ≥' + (crit.aoc != null ? crit.aoc : 70) + '% · every Standard ≥' + crit.stdDefault + '%' + Object.keys(crit.std || {}).sort(scStdCmp).map(function (s) { return ' · ' + s + ' ≥' + crit.std[s] + '%'; }).join('') + (typeof scAocCat === 'function' ? ' · ' + ['Structure', 'Process', 'Outcome'].map(function (k) { return k + ': ' + Object.keys(SC_CPM_AOC).filter(function (a) { return scAocCat(a) === k; }).join(', '); }).join(' · ') : '') + ' <button type="button" class="nm-lnk ce-edit" onclick="scCritEdit()">Edit criteria</button></div>' : '')
    + '<div class="ce-stdhd"><span>8 Areas of Concern · ' + nStd + ' Standards · ' + nMe + ' MEs · ' + tot + ' checkpoints · titles ' + titled + ' / ' + (nStd + nMe) + '</span></div>'
    + Object.keys(H.aoc).map(function (a) { var A = H.aoc[a];
      return '<section class="nm-card ce-aoc scm-aoc"><b class="nm-h">AoC ' + a + ' · ' + sccE(A.title) + (typeof scAocCat === 'function' && scAocCat(a) ? ' <span class="nm-tag">' + sccE(scAocCat(a)) + '</span>' : '') + ' <em>' + A.cps + ' checkpoints</em></b>'
        + A.std.map(function (s) { var S = H.std[s];
          return '<div class="ce-std"><div class="ce-stdr scm-std-hd"><b>' + s + '</b><span class="' + (S.title ? '' : 'miss') + '">' + sccE(S.title || 'No title yet') + '</span>' + minTxt(s) + '<em>' + S.cps + '</em>'
            + '<button type="button" class="nm-btn ce-edit" onclick="scRegEdit(\'std\',\'' + s + '\')">Edit title</button>'
            + (S.cps ? '<button type="button" class="nm-btn" onclick="sccStdView(\'' + a + '\',\'' + s + '\',\'\')">View</button>' : '') + '</div>'
            + '<ul class="ce-mes">' + S.me.map(function (m) { var M = H.me[m], mj = sccJ(m);
              return '<li><b>' + sccE(m.replace(/^ME /, '')) + '</b> <span class="' + (M.title ? '' : 'miss') + '">' + sccE(M.title || 'No title yet') + '</span> <em class="' + (M.cps ? '' : 'zero') + '">' + M.cps + '</em>'
                + ' <button type="button" class="nm-lnk ce-edit" onclick="scRegEdit(\'me\',\'' + mj + '\')">Edit title</button>'
                + (M.cps ? ' <button type="button" class="nm-lnk" onclick="sccStdView(\'' + a + '\',\'' + s + '\',\'' + mj + '\')">View</button>' : ' <button type="button" class="nm-lnk ce-edit" onclick="scCpmEdit(null,\'' + mj + '\')">+ Checkpoint</button>') + '</li>';
            }).join('') + '</ul></div>';
        }).join('') + '</section>';
    }).join('') + '</div>';
}
function sccStdView(a, s, m) { var u = _scCpmUi; u.aoc = a; u.std = s; u.me = m || ''; u.kind = 'nqas'; u.ceChanged = false; u.check = ''; _scc.more = true; _scc.sel = null; ceGoSec('cps'); }

// ── Day plans ──
function sccPlanCols() {
  var ph = _scc.ph, a, b;
  if (ph === 'bl') { a = 1; b = 7; } else if (ph === 'rev') { a = 50; b = 56; } else if (ph === 'rd') { a = 57; b = 60; } else { a = 8 + _scc.wk * 7; b = a + 6; }
  var out = [], pk = sccPk();
  for (var d = a; d <= b; d++) { var def = scDayDef(pk, d - 1) || {}; out.push({ day: d, title: def.title || '', ids: (def.cps || []).filter(function (c) { return c && c.id && c.kind !== 'milestone'; }).map(function (c) { return c.id; }) }); }
  return out;
}
function sccPlanHTML() {
  if (_scCpmUi.pkg === 'all') _scCpmUi.pkg = '12B';
  var pk = sccPk(), cols = sccPlanCols(), sel = _scc.psel ? scCpmGet(_scc.psel) : null, sd = sel ? sccDays(sel) : null, ro = typeof ceRO === 'function' && ceRO();
  var ph = function (k, l, fr) { return '<button type="button" class="ph-' + ({ bl: 'baseline', impl: 'impl', rev: 'endline', rd: 'ready' })[k] + (_scc.ph === k ? ' on' : '') + '" style="flex:' + fr + '" onclick="_scc.ph=\'' + k + '\';_scc.psel=null;scCpmRender()">' + l + '</button>'; };
  var wk = _scc.ph === 'impl' ? '<div class="nm-wk" role="tablist" aria-label="Implementation week">' + SC_IMPL_WEEKS.map(function (w, i) { return '<button type="button" role="tab" aria-selected="' + (_scc.wk === i) + '" class="' + (_scc.wk === i ? 'on' : '') + '" title="' + sccE(w.title) + '" onclick="_scc.wk=' + i + ';_scc.psel=null;scCpmRender()">Week ' + (i + 2) + ' <small>· ' + (8 + i * 7) + '–' + (14 + i * 7) + '</small></button>'; }).join('') + '</div>'
    + '<div class="nm-hint">Week ' + (_scc.wk + 2) + ' · ' + sccE(SC_IMPL_WEEKS[_scc.wk].title) + '</div>' : '';
  return '<div class="scc"><p class="ce-lead"><b>Day plans · Sub-Centre ' + pk.slice(5) + ' · 60 days</b> — moves are saved in the draft and reach facilities when you publish</p>'
    + '<section class="nm-card"><div class="nm-phases">' + ph('bl', 'Baseline · 1–7', 7) + ph('impl', 'Implementation · 6 theme weeks · 8–49', 42) + ph('rev', 'End-line · 50–56', 7) + ph('rd', 'Readiness · 57–60', 5) + '</div>' + wk + '</section>'
    + '<div class="nm-psplit"><div class="nm-pcols-wrap"><div class="nm-pcols" style="grid-template-columns:repeat(' + cols.length + ',minmax(104px,1fr));min-width:' + (cols.length * 112) + 'px">'
    + cols.map(function (c) { var heavy = c.ids.length > 20;
      return '<div class="nm-pcol' + (heavy ? ' heavy' : '') + '"><div class="nm-pch"><span title="' + sccE(c.title) + '">Day ' + c.day + '</span><em>' + c.ids.length + '</em></div>'
        + (ro ? '' : '<button type="button" class="nm-lnk scc-tt" onclick="sccOpenDayCard(' + (c.day - 1) + ')">Titles &amp; tasks</button>')
        + '<div class="nm-pcl">' + c.ids.map(function (id) { var x = scCpmGet(id) || { t: '' };
          return '<button type="button" class="nm-chip' + (_scc.psel === id ? ' on' : '') + '" onclick="_scc.psel=\'' + sccJ(id) + '\';scCpmRender()"><span class="nm-ct"><b>' + sccE(id) + '</b> ' + sccE(x.t) + '</span></button>'; }).join('')
        + (c.ids.length ? '' : '<div class="nm-hint">' + (c.day > 56 ? 'Mock assessment and readiness — no new checkpoints' : 'No checkpoints') + '</div>') + '</div></div>';
    }).join('') + '</div></div><aside class="nm-ecol">'
    + (sel ? '<section class="nm-card"><div class="nm-sh"><span>' + sccE(sel.id + ' · ' + sel.me) + '</span></div><div class="nm-st">' + sccE(sel.t) + '</div>'
        + (sd ? '<div class="nm-days"><div><span class="b">Baseline · Day ' + sd.bl + '</span><span class="i">Implementation · Day ' + sd.impl + '</span><span class="e">End-line · Day ' + sd.rev + '</span></div></div>' : '')
        + '<button type="button" class="nm-btn pri ce-edit" onclick="scCpMoveDay(\'' + sccJ(sel.id) + '\')">Move day</button>'
        + '<button type="button" class="nm-btn" onclick="sccOpenCp(\'' + sccJ(sel.id) + '\')">Open checkpoint</button></section>'
      : '<section class="nm-card"><b class="nm-h">Move a checkpoint</b><small class="nm-hint">Click a checkpoint to see its days and move it.</small></section>')
    + '<section class="nm-card"><small class="nm-hint"><b>Baseline</b> groups checkpoints by Area of Concern. <b>Implementation</b> follows the theme weeks. The <b>end-line</b> day always follows the baseline day. A move outside these rules asks you to confirm, and warns when running Sub-Centres have saved work on those days.</small></section>'
    + '</aside></div></div>';
}
function sccOpenCp(id) { var c = scCpmGet(id); if (!c) return; var u = _scCpmUi; u.aoc = c.aoc || ''; u.svc = ''; u.role = ''; u.q = ''; u.std = ''; u.me = ''; u.kind = 'nqas'; u.ceChanged = false; _scc.sel = id; ceGoSec('cps'); }
function sccOpenDayCard(di) {
  if (typeof scCpmTab !== 'function') return;
  scCpmTab('days');
  try { adminActiveProg = _scCpmUi.pkg === '12A' ? 'C' : 'D'; adminEditorDay = null; buildAeDayStrip(); aeOpenDay(di); } catch (e) { console.warn('[SCC] day card', e); }
  var sec = document.getElementById('admin-editor-section');
  if (sec && !document.getElementById('scc-back')) { var b = document.createElement('div'); b.id = 'scc-back'; b.className = 'scc-back';
    b.innerHTML = '<button type="button" class="nm-lnk" onclick="ceGoSec(\'plans\')">← Back to the day-plan board</button><span>Day card titles and tasks · ' + (_scCpmUi.pkg === '12A' ? '12A' : '12B') + '</span>';
    var hdr = sec.firstElementChild; if (hdr && hdr.nextSibling) sec.insertBefore(b, hdr.nextSibling); else sec.appendChild(b); }
  if (typeof ceHeadPaint === 'function') ceHeadPaint();
}

// ── Import / export ──
var SCC_XH = ['ID', 'Area of Concern', 'Standard', 'ME', 'Checkpoint', 'Checkpoint (Hindi)', 'Service package / area', 'Who', 'How it is checked', 'Packages', 'Baseline day (moved)', 'Implementation day (moved)', 'Days now', 'Video', 'Video (Hindi)', 'Retired'];
var SCC_TH = ['ID', 'No.', 'Thing to tick', 'Thing to tick (Hindi)', 'How it is checked'];
function sccImpHTML() {
  var I = _scc.imp;
  return '<div class="scc"><p class="ce-lead"><b>Excel · Sub-Centre checkpoints</b> — download, edit offline, upload back into the draft</p>'
    + '<div class="nm-xsplit scc-x2"><section class="nm-card"><b class="nm-h">Download</b><small class="nm-hint">All Sub-Centre checkpoints (both packages) in one sheet with ID, Area of Concern, Standard, ME, checkpoint in English and Hindi, service package / area, who, method, packages, days and videos; a Things to tick sheet; a Read me sheet that says which columns you can change.</small>'
    + '<div class="nm-acts"><button type="button" class="nm-btn pri" onclick="sccExport()">Download Excel</button><button type="button" class="nm-btn" onclick="scCpmExport()">Download CSV</button></div></section>'
    + '<section class="nm-card ce-edit"><b class="nm-h">Upload</b><small class="nm-hint">Upload the Excel you downloaded and edited, or the revised NQAS Sub-Centre checklist (CSV). You see every new and changed checkpoint before anything goes into the draft.</small>'
    + '<div class="nm-acts"><button type="button" class="nm-btn pri" onclick="sccImportPick()">Choose a file</button></div>'
    + (I ? sccImpPreviewHTML(I) : '') + '</section></div>'
    + '<div class="ce-imp scc-x3"><section class="ce-card"><b>Standard and ME titles</b><p>Paste titles for Standards and Measurable Elements, or add new codes.</p><button type="button" class="ce-b" onclick="scRegImport()">Paste titles / add codes</button></section>'
    + '<section class="ce-card"><b>Linked checks</b><p>Answers that must agree between checkpoints — import the reviewed sheet or download the current one.</p><button type="button" class="ce-b" onclick="nfLxOpen(null)">Open linked checks</button></section>'
    + (typeof scCritEdit === 'function' ? '<section class="ce-card"><b>NQAS criteria</b><p>Overall, Area of Concern and Standard minimums used for Sub-Centre graduation.</p><button type="button" class="ce-b" onclick="scCritEdit()">Edit criteria</button></section>' : '')
    + '</div></div>';
}
function sccMethods(s) { var out = []; String(s || '').split(/[,;\/]+/).forEach(function (x) { x = x.trim().toLowerCase(); if (!x) return; var k = Object.keys(SCC_M).find(function (m) { return m.toLowerCase() === x || SCC_M[m].toLowerCase() === x || (m === 'CI' && /patient|client/.test(x)); }); if (k && out.indexOf(k) < 0) out.push(k); }); return ['SI', 'RR', 'OB', 'CI'].filter(function (m) { return out.indexOf(m) >= 0; }); }
function sccList(s) { return String(s || '').split(/[,;\/\n]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
function sccRows() {
  var rows = [SCC_XH], tick = [SCC_TH];
  scCpmAll({ includeRetired: true }).forEach(function (c) {
    var d = sccDays(c);
    rows.push([c.id, c.aoc || '', c.std || '', c.me || '', c.t, c.hi || '', c.svc || '', c.r.join(', '), c.method.map(function (m) { return SCC_M[m] || m; }).join(', '), c.pk.join(', '),
      +c.blDay || '', +c.implDay || '', d ? 'Baseline ' + d.bl + ' · Implementation ' + d.impl + ' · End-line ' + d.rev : '', c.video || '', c.videoHi || '', c.retired ? 'yes' : '']);
    (c.items || []).forEach(function (x, i) { tick.push([c.id, i + 1, x.t || '', x.h || '', (x.m || []).map(function (m) { return SCC_M[m] || m; }).join(', ')]); });
  });
  return { rows: rows, tick: tick };
}
async function sccExport() {
  try {
    var X = await nfLoadXlsx(), wb = X.utils.book_new(), R = sccRows();
    var ws = X.utils.aoa_to_sheet(R.rows); ws['!cols'] = [8, 6, 8, 9, 60, 50, 26, 16, 26, 10, 10, 10, 34, 30, 30, 8].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, 'Checkpoints');
    var wt = X.utils.aoa_to_sheet(R.tick); wt['!cols'] = [8, 5, 60, 50, 26].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, wt, 'Things to tick');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['NQAS FAST · Sub-Centre checkpoints'], ['You can change: Checkpoint, Checkpoint (Hindi), Service package / area, Who (CHO, ANM, ASHA, MPW, MO, General), How it is checked (Staff interview, Record review, Observation, Client interview), Packages (12A, 12B), Baseline day (moved, 1–7), Implementation day (moved, 8–49), Video, Video (Hindi), Retired (yes / blank) and the Things to tick sheet.'],
      ['Do not change: ID, Area of Concern, Standard, ME, Days now. To add a checkpoint, leave ID blank and fill ME (for example "ME A1.1") and Checkpoint.'], ['Upload the file in Content → Sub-Centre → Import / export. Every change is shown before it goes into the draft; nothing reaches facilities until you publish.']]), 'Read me');
    var name = 'NQAS-FAST-SC-checkpoints-' + new Date().toISOString().slice(0, 10) + '.xlsx';
    if (typeof nfSaveWb === 'function') await nfSaveWb(X, wb, name); else X.writeFile(wb, name);
    showToast('Excel downloaded.', 'ok');
  } catch (e) { console.warn('[SCC] export', e); showToast('Could not create the Excel file.', 'err'); }
}
function sccImportPick() {
  if (!scCpmCanEdit()) return;
  var inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.xlsx,.xls,.csv';
  inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; sccImportFile(f); };
  inp.click();
}
async function sccImportFile(f) {
  var name = String(f.name || '').toLowerCase(), buf = await f.arrayBuffer();
  if (/\.csv$/.test(name)) { var txt = new TextDecoder('utf-8').decode(buf); if (txt.indexOf('�') >= 0) { try { txt = new TextDecoder('windows-1252').decode(buf); } catch (e) {} } return scImpFromText(txt); }
  try { var X = await nfLoadXlsx(), wb = X.read(buf, { type: 'array' }); return sccImportWb(X, wb); }
  catch (e) { console.warn('[SCC] read', e); showToast('Could not read this file.', 'err'); }
}
function sccNorm(v) { return String(v == null ? '' : v).replace(/\r/g, '').trim(); }
function sccImportWb(X, wb) {
  var ws = wb.Sheets.Checkpoints || wb.Sheets[wb.SheetNames[0]], A = X.utils.sheet_to_json(ws, { header: 1, defval: '' }), hd = (A[0] || []).map(sccNorm);
  var col = function (n) { return hd.indexOf(n); };
  if (col('ID') < 0 || col('Checkpoint') < 0) { scAlert('This is not the Sub-Centre checkpoints Excel. Download it from this tab, edit it, and upload it here — or upload the revised NQAS checklist as a CSV file.', 'Upload', '⚠️'); return null; }
  var tick = {}, wt = wb.Sheets['Things to tick'];
  if (wt) X.utils.sheet_to_json(wt, { header: 1, defval: '' }).slice(1).forEach(function (r) { var id = sccNorm(r[0]); if (!id || !sccNorm(r[2])) return; (tick[id] = tick[id] || []).push({ t: sccNorm(r[2]), h: sccNorm(r[3]), m: sccMethods(r[4]) }); });
  var rep = { changed: [], added: [], bad: [], same: 0 };
  A.slice(1).forEach(function (r, i) {
    var g = function (n) { var k = col(n); return k < 0 ? undefined : sccNorm(r[k]); }, id = g('ID'), t = g('Checkpoint');
    if (!id && !t) return;
    var v = {};
    if (t !== undefined) v.t = t; if (g('Checkpoint (Hindi)') !== undefined) v.hi = g('Checkpoint (Hindi)');
    if (g('Service package / area') !== undefined) v.svc = g('Service package / area');
    if (g('Who') !== undefined) v.r = sccList(g('Who')).filter(function (x) { return SCC_ROLES.indexOf(x) >= 0; });
    if (g('How it is checked') !== undefined) v.method = sccMethods(g('How it is checked'));
    if (g('Packages') !== undefined) v.pk = ['12A', '12B'].filter(function (p) { return sccList(g('Packages')).indexOf(p) >= 0; });
    if (g('Baseline day (moved)') !== undefined) v.blDay = +g('Baseline day (moved)') || null;
    if (g('Implementation day (moved)') !== undefined) v.implDay = +g('Implementation day (moved)') || null;
    if (g('Video') !== undefined) v.video = g('Video'); if (g('Video (Hindi)') !== undefined) v.videoHi = g('Video (Hindi)');
    if (g('Retired') !== undefined) v.retired = /^(yes|y|true|1|retired)$/i.test(g('Retired'));
    if (!id) { var me = g('ME'); if (!me || !t) { rep.bad.push('Row ' + (i + 2) + ': a new checkpoint needs ME and Checkpoint'); return; } v.me = me; if (tick['']) v.items = tick['']; rep.added.push({ row: i + 2, v: v }); return; }
    var c = scCpmGet(id); if (!c) { rep.bad.push('Row ' + (i + 2) + ': ID ' + id + ' is not in the checklist'); return; }
    if (tick[id]) v.items = tick[id];
    if (v.blDay && (v.blDay < 1 || v.blDay > 7)) { rep.bad.push(id + ': baseline day must be 1–7'); delete v.blDay; }
    if (v.implDay && (v.implDay < 8 || v.implDay > 49)) { rep.bad.push(id + ': implementation day must be 8–49'); delete v.implDay; }
    if (v.r && !v.r.length) { rep.bad.push(id + ': "Who" is empty — kept as it was'); delete v.r; }
    var cur = { t: c.t, hi: c.hi || '', svc: c.svc || '', r: c.r, method: c.method, pk: c.pk, blDay: +c.blDay || null, implDay: +c.implDay || null, video: c.video || '', videoHi: c.videoHi || '', retired: !!c.retired,
      items: (c.items || []).map(function (x) { return { t: x.t || '', h: x.h || '', m: x.m || [] }; }) };
    var diff = {}; Object.keys(v).forEach(function (k) { if (JSON.stringify(sccCanon(k, v[k])) !== JSON.stringify(sccCanon(k, cur[k]))) diff[k] = v[k]; });
    if (Object.keys(diff).length) rep.changed.push({ id: id, t: c.t, diff: diff }); else rep.same++;
  });
  _scc.imp = rep; scCpmRender();
  return rep;
}
function sccCanonM(a) { a = (a || []).map(function (m) { return m === 'PI' ? 'CI' : m; }); return ['SI', 'RR', 'OB', 'CI'].filter(function (m) { return a.indexOf(m) >= 0; }); }
function sccCanon(k, v) {
  if (v == null || v === '') return null;
  if (k === 'method') return sccCanonM(v);
  if (k === 'r') return SCC_ROLES.filter(function (r) { return v.indexOf(r) >= 0; });
  if (k === 'pk') return ['12A', '12B'].filter(function (p) { return v.indexOf(p) >= 0; });
  if (k === 'items') return v.map(function (x) { return [sccNorm(x.t), sccNorm(x.h), sccCanonM(x.m)]; });
  if (k === 'retired') return v ? true : null;
  if (typeof v === 'string') return sccNorm(v) || null;
  return v;
}
var SCC_FN = { t: 'wording', hi: 'Hindi', svc: 'service package / area', r: 'who', method: 'method', pk: 'packages', blDay: 'baseline day', implDay: 'implementation day', video: 'video', videoHi: 'Hindi video', retired: 'retired', items: 'things to tick' };
function sccImpPreviewHTML(I) {
  var n = I.changed.length + I.added.length;
  return '<div class="scc-prev"><b>' + (n ? I.changed.length + ' changed · ' + I.added.length + ' new' : 'No changes found') + '</b> <small>· ' + I.same + ' the same' + (I.bad.length ? ' · ' + I.bad.length + ' skipped' : '') + '</small>'
    + '<ul>' + I.changed.slice(0, 60).map(function (x) { return '<li><b>' + sccE(x.id) + '</b> ' + sccE(String(x.t).slice(0, 70)) + ' — <em>' + Object.keys(x.diff).map(function (k) { return SCC_FN[k] || k; }).join(', ') + '</em></li>'; }).join('')
    + I.added.slice(0, 20).map(function (x) { return '<li><b>New</b> ' + sccE(x.v.me) + ' · ' + sccE(String(x.v.t).slice(0, 70)) + '</li>'; }).join('')
    + (n > 80 ? '<li>… and ' + (n - 80) + ' more</li>' : '') + I.bad.slice(0, 10).map(function (b) { return '<li class="bad">' + sccE(b) + '</li>'; }).join('') + '</ul>'
    + '<div class="nm-acts"><button type="button" class="nm-btn" onclick="_scc.imp=null;scCpmRender()">Cancel</button>' + (n ? '<button type="button" class="nm-btn pri" id="scc-apply" onclick="sccImportApply()">Put ' + n + ' change' + (n === 1 ? '' : 's') + ' in the draft</button>' : '') + '</div></div>';
}
async function sccImportApply() {
  var I = _scc.imp; if (!I) return; var b = document.getElementById('scc-apply'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  var up = 0, ad = 0;
  for (var i = 0; i < I.changed.length; i++) { if (await scCpmSave(I.changed[i].id, I.changed[i].diff)) up++; }
  for (var j = 0; j < I.added.length; j++) { var id = await scCpmAdd(I.added[j].v); if (id) { ad++; if (I.added[j].v.items) await scCpmSave(id, { items: I.added[j].v.items }); } }
  _scc.imp = null; showToast(up + ' updated, ' + ad + ' added — in the draft. Review & publish when ready.', 'ok');
  try { if (typeof scdBadge === 'function') scdBadge(); } catch (e) {}
  scCpmRender();
  return { updated: up, added: ad };
}

// ── wiring: these views replace the old Sub-Centre panels ──
(function () {
  if (typeof scCpmRender !== 'function') return;
  var oR = scCpmRender;
  scCpmRender = function () {
    var u = _scCpmUi;
    if (u.tab === 'master' && (u.view === 'cps' || !u.view || u.view === 'tree' || u.view === 'imp' || u.view === 'plans')) {
      var p = scCpmEnsurePanel(); if (!p) return;
      try { p.innerHTML = u.view === 'tree' ? sccStdsHTML() : u.view === 'imp' ? sccImpHTML() : u.view === 'plans' ? sccPlanHTML() : sccListHTML(); }
      catch (e) { console.warn('[SCC] render', e); return oR.apply(this, arguments); }
      if (typeof ceHeadPaint === 'function') ceHeadPaint();
      return;
    }
    return oR.apply(this, arguments);
  };
  if (typeof scCpmTab === 'function') { var oT = scCpmTab; scCpmTab = function (t) { var r = oT.apply(this, arguments); var bk = document.getElementById('scc-back'); if (bk && t !== 'days') bk.remove(); return r; }; }
  if (typeof _scCpmUi !== 'undefined') _scCpmUi.limit = 600;
})();
