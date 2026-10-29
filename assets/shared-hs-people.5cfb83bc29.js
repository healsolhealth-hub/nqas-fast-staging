// ══ Settings tidy-up (28 Oct 2026; HealSol: Partner logos → Partners · People as tabs with counts · Quality Champions →
//    Recognition) and Programme rules → Self sign-up (free baseline at once, per facility type; off = HealSol approves) ══
var HSP_TABS = [['sup', 'Supervisors', 'ti-binoculars'], ['dist', 'District Admins', 'ti-map-2'], ['moic', 'MOIC & MO', 'ti-building-hospital'], ['hsa', 'HealSol Admins', 'ti-shield-lock']];
function hspGroupOf(el) {
  var id = el.id || '';
  if (id === 'scd-dist-panel') return 'dist'; if (id === 'nf-plogins') return 'moic'; if (id === 'nf-sec-panel') return 'hsa';
  if (id === 'nf-ho-card' || (el.querySelector && el.querySelector('#sc-sup-list'))) return 'sup';
  return '';
}
function hspCount(g) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return 0; var n = 0;
  [].forEach.call(main.children, function (el) { if (el.getAttribute('data-hsp') === g && el.id !== 'nf-ho-card') n += el.querySelectorAll('.scx-sup-row,.nfs-row').length; });
  return n;
}
function hspRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main || typeof _hs === 'undefined') return;
  if (!_hs.ptab2) _hs.ptab2 = 'sup';
  var first = null;
  [].forEach.call(main.children, function (el) { if (el.dataset.nfv !== 'setup' || el.id === 'hs-ppl') return; var g = hspGroupOf(el); if (g) { el.setAttribute('data-hsp', g); if (!first) first = el; } });
  var head = document.getElementById('hs-ppl');
  if (!head) { head = document.createElement('div'); head.id = 'hs-ppl'; head.dataset.nfv = 'setup'; head.className = 'hs-ppl'; }
  head.setAttribute('data-hsg', 'people');
  if (first && head.nextSibling !== first) main.insertBefore(head, first);
  head.innerHTML = '<div class="hsp-tiles">' + HSP_TABS.map(function (t) { var n = hspCount(t[0]);
    return '<button type="button" class="hsp-t' + (_hs.ptab2 === t[0] ? ' on' : '') + '" aria-pressed="' + (_hs.ptab2 === t[0]) + '" onclick="hspSet(\'' + t[0] + '\')"><i class="ti ' + t[2] + '"></i><b>' + n + '</b><span>' + hsE(t[1]) + '</span></button>'; }).join('') + '</div>';
  document.body.setAttribute('data-hspt', _hs.ptab2);
}
function hspSet(t) { _hs.ptab2 = t; hspRender(); try { if (t === 'moic' && typeof nfPLoginsRender === 'function') nfPLoginsRender(); } catch (e) {} }
// ── Recognition: "Quality Champions" tab in place of Partner logos ──
function hspChampHost() {
  var box = document.getElementById('nf-recog'); if (!box) return;
  var tabs = box.querySelector('.nfr-tabs'); if (!tabs) return;
  var lb = [].filter.call(tabs.querySelectorAll('button'), function (b) { return /nfrTab\('logos'\)/.test(b.getAttribute('onclick') || ''); })[0];
  var nC = 0; try { nC = Object.keys((_scq && _scq.champions) || {}).length; } catch (e) {}
  var cb = '<button type="button" role="tab" class="' + (_nfR.tab === 'champion' ? 'on' : '') + '" onclick="nfrTab(\'champion\')">🤝 Quality Champions <em id="hsp-nchamp">' + (nC || '') + '</em></button>';
  if (lb) lb.outerHTML = cb;
  if (_nfR.tab !== 'champion') return;
  var lad = box.querySelector('.nfr-ladder'); if (!lad) return;
  while (lad.nextSibling) lad.parentNode.removeChild(lad.nextSibling);
  var host = document.createElement('div'); host.id = 'hsp-champ'; host.className = 'hsp-champ'; lad.parentNode.appendChild(host);
  var el = document.getElementById('scq-champ-panel'); if (!el && typeof scqEnsureAdminPanel === 'function') el = scqEnsureAdminPanel();
  if (el) { el.removeAttribute('data-nfv'); el.removeAttribute('data-hsg'); host.appendChild(el); }
  try { if (typeof scqRenderChampionAdmin === 'function') scqRenderChampionAdmin(); } catch (e) {}
  var n = document.querySelectorAll('#scq-champ-list .scx-sup-row').length, em = document.getElementById('hsp-nchamp'); if (em && n) em.textContent = n;
}
(function () {
  if (typeof nfrRender !== 'function') return;
  var o = nfrRender;
  nfrRender = async function () {
    if (_nfR.tab === 'logos' && _nfOv.view === 'recog') _nfR.tab = 'champion';
    var r = await o.apply(this, arguments);
    try { var sm = document.querySelector('#nf-recog .nfo-top small'); if (sm) sm.textContent = 'HealSol only · Quality Champions, Quality Leader and Quality Pioneer titles · partner logos are under Partners'; hspChampHost(); } catch (e) { console.warn('[hsp] recog', e); }
    try { if (_nfOv.view === 'stdon' && typeof _nfD !== 'undefined' && _nfD.tab === 'logos' && typeof nfDAdminRender === 'function') nfDAdminRender(); } catch (e) {}
    return r;
  };
})();
// ── Partners: a "Partner logos" tab next to Portfolios / Logins / Public page ──
(function () {
  if (typeof nfDAdminRender !== 'function') return;
  var o = nfDAdminRender;
  nfDAdminRender = async function () {
    var r = await o.apply(this, arguments);
    try {
      var box = document.getElementById('nf-stdon'), tabs = box && box.querySelector('.nfr-tabs'); if (!tabs) return r;
      if (!_nfImp.logos) { try { _nfImp.logos = await fbGet('shared/sc_impact_logos') || {}; } catch (e) { _nfImp.logos = {}; } }
      var L = _nfImp.logos || {}, nLive = Object.keys(L).filter(function (k) { return nfrLive(L[k]); }).length, on = _nfD.tab === 'logos';
      if (!tabs.querySelector('[data-hsp-logos]')) tabs.insertAdjacentHTML('beforeend', '<button type="button" role="tab" data-hsp-logos="1" class="' + (on ? 'on' : '') + '" onclick="_nfD.tab=\'logos\';nfDAdminRender()">🤝 Partner logos <em>' + nLive + '</em></button>');
      if (on) { [].forEach.call(tabs.querySelectorAll('button'), function (b) { b.classList.toggle('on', !!b.getAttribute('data-hsp-logos')); });
        while (tabs.nextSibling) tabs.parentNode.removeChild(tabs.nextSibling);
        var d = document.createElement('div'); d.id = 'hsp-logos'; d.innerHTML = nfrLogosHTML(); tabs.parentNode.appendChild(d); }
      var sm = box.querySelector('.nfo-top small'); if (sm) sm.textContent = 'HealSol only · view-only dashboards for State Admins and Donors / Partners, the public impact page, and partner logos on impact cards';
      var h1 = box.querySelector('.nfo-top h1'); if (h1) h1.textContent = 'Partners';
    } catch (e) { console.warn('[hsp] partners', e); }
    return r;
  };
})();
// ── Programme rules → Self sign-up ──
var _hspSU = null;
async function hspSignupRender(load) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-signup');
  if (!el) { el = document.createElement('div'); el.id = 'hs-signup'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-signup'; var r = document.getElementById('hs-rules'); if (r && r.parentNode === main) r.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  el.setAttribute('data-hsg', 'rules');
  if (load || !_hspSU) { try { _hspSU = (await fbGet('shared/sc_signup_config')) || {}; } catch (e) { _hspSU = _hspSU || {}; } }
  var T = [['sc', 'Sub-Centre'], ['uphc', 'UPHC'], ['phc', 'PHC'], ['chc', 'CHC']];
  el.innerHTML = '<b><i class="ti ti-user-plus"></i> Self sign-up (Join NQAS FAST)</b><p>Off: every sign-up from the login screen waits for your approval in Business → Enquiries &amp; sign-ups. On: that type is enrolled at once and its free baseline starts; you still see it in the list as approved.</p>'
    + '<div class="hsp-sw">' + T.map(function (t) { var on = _hspSU[t[0]] === true;
      return '<label class="hsp-swr"><span><b>' + t[1] + '</b><small>' + (on ? 'Free baseline at once' : 'Needs your approval') + '</small></span><span class="hsp-tg"><input type="checkbox" id="hsp-su-' + t[0] + '"' + (on ? ' checked' : '') + ' onchange="hspSignupSet(\'' + t[0] + '\',this.checked)"> Free baseline at once</span></label>'; }).join('') + '</div>';
}
async function hspSignupSet(t, on) {
  var prev = _hspSU || {}, nx = Object.assign({}, prev); nx[t] = !!on;
  var ok = await fbSet('shared/sc_signup_config', nx);
  if (ok === false) { showToast('Could not save — check the connection.', 'err'); hspSignupRender(); return; }
  _hspSU = nx; showToast((t === 'sc' ? 'Sub-Centre' : t.toUpperCase()) + ': ' + (on ? 'free baseline starts at once on sign-up.' : 'sign-ups wait for your approval.'), 'ok'); hspSignupRender();
}
// wiring: Settings view
(function () {
  if (typeof nfAdminApply !== 'function') return;
  var o = nfAdminApply;
  nfAdminApply = function () {
    var r = o.apply(this, arguments);
    try { if (typeof hsOn === 'function' && hsOn() && _nfOv.view === 'setup') { if (_hs.stab === 'people') hspRender(); if (_hs.stab === 'rules') hspSignupRender(); } else document.body.removeAttribute('data-hspt'); } catch (e) { console.warn('[hsp]', e); }
    return r;
  };
})();
// keep the new cards in their tab when Settings re-tags its panels
(function () {
  if (typeof hsSetupGroup !== 'function') return;
  var o = hsSetupGroup;
  hsSetupGroup = function (el) { if (el && el.id === 'hs-signup') return 'rules'; if (el && el.id === 'hs-ppl') return 'people'; return o.apply(this, arguments); };
})();
(function () {
  var o = hspRender;
  hspRender = function () { var r = o.apply(this, arguments);
    try { if (!_hs.plDone && typeof nfPLoginsRender === 'function') { _hs.plDone = 1; Promise.resolve(nfPLoginsRender()).then(function () { try { if (_nfOv.view === 'setup' && _hs.stab === 'people') o(); } catch (e) {} }); } } catch (e) {}
    return r; };
})();
// ── Programme rules → NQAS criteria, one row per facility type (consistency review item 23, 28 Oct 2026) ──
//  Sub-Centre: shared/nqas_criteria (overall, Area of Concern, Standard minimums — the same editor as Content → Checkpoints).
//  UPHC / PHC / CHC: shared/dept_criteria/byType/{type} {overall, aoc, dept, stdDefault} (else the shared marks, else 70 / 70 / 70 / 50).
var _hspCr = null;
async function hspCritRender(load) {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-crit');
  if (!el) { el = document.createElement('div'); el.id = 'hs-crit'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-crit'; var r = document.getElementById('hs-rules'); if (r && r.parentNode === main) r.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  el.setAttribute('data-hsg', 'rules');
  if (load || !_hspCr) { try { _hspCr = (await fbGet('shared/dept_criteria')) || {}; } catch (e) { _hspCr = _hspCr || {}; } try { if (typeof scCritLoad === 'function') await scCritLoad(); } catch (e) {} }
  var sc = (typeof _scCrit !== 'undefined' && _scCrit) || {}, nStd = Object.keys(sc.std || {}).length;
  var val = function (t, k, d) { var a = (_hspCr.byType || {})[t] || {}; return a[k] != null ? a[k] : _hspCr[k] != null ? _hspCr[k] : d; };
  var inp = function (t, k, d, lab) { return '<label class="hsc-in"><span>' + lab + '</span><input type="number" min="0" max="100" inputmode="numeric" id="hsc-' + t + '-' + k + '" value="' + hsE(val(t, k, d)) + '" aria-label="' + hsE((NF_LEVELS[t] || {}).short + ' ' + lab) + '">%</label>'; };
  el.innerHTML = '<b><i class="ti ti-target"></i> NQAS criteria</b><p>The minimums a facility must reach to meet NQAS — used by every readiness screen, the reports and graduation. Results already saved keep the marks they were scored with.</p>'
    + '<div class="hsc-rows"><div class="hsc-r"><span class="hsc-t"><b>Sub-Centre</b><small>' + (sc.overall != null ? 'Overall ' + sc.overall + '% · every Area of Concern ' + (sc.aoc != null ? sc.aoc : 70) + '% · every Standard ' + sc.stdDefault + '%' + (nStd ? ' · ' + nStd + ' Standards with their own minimum' : '') : 'Loading…') + '</small></span>'
    + '<button type="button" class="hs-btn" onclick="hspCritSc()">Edit</button></div>'
    + ['uphc', 'phc', 'chc'].map(function (t) { return '<div class="hsc-r"><span class="hsc-t"><b>' + hsE((NF_LEVELS[t] || {}).short || t) + '</b><small>overall · every Area of Concern · every department · every Standard</small></span><span class="hsc-f">'
      + inp(t, 'overall', 70, 'Overall') + inp(t, 'aoc', 70, 'Area of Concern') + inp(t, 'dept', 70, 'Department') + inp(t, 'stdDefault', 50, 'Standard') + '</span></div>'; }).join('')
    + '</div><div class="hsc-act"><button type="button" class="hs-btn p" onclick="hspCritSave()">Save UPHC / PHC / CHC criteria</button></div>';
}
async function hspCritSc() { try { if (typeof scCritLoad === 'function') await scCritLoad(); if (typeof scCritEdit === 'function') await scCritEdit(); } catch (e) { console.warn('[hsp] crit', e); } hspCritRender(true); }
async function hspCritSave() {
  var by = {}, bad = '';
  ['uphc', 'phc', 'chc'].forEach(function (t) { var o = {}; ['overall', 'aoc', 'dept', 'stdDefault'].forEach(function (k) { var e = document.getElementById('hsc-' + t + '-' + k), v = e ? Math.round(+e.value) : NaN;
    if (!(v >= 0 && v <= 100) || e.value === '') bad = bad || ((NF_LEVELS[t] || {}).short + ': enter 0–100'); else o[k] = v; }); by[t] = o; });
  if (bad) { showToast(bad, 'err'); return; }
  var nx = Object.assign({}, _hspCr || {}, { byType: by, at: new Date().toISOString() });
  if (await fbSet('shared/dept_criteria', nx) === false) { showToast('Could not save — check the connection.', 'err'); return; }
  _hspCr = nx; try { if (typeof _ndCrit !== 'undefined') _ndCrit = nx; } catch (e) {} showToast('NQAS criteria saved for UPHC, PHC and CHC.', 'ok'); hspCritRender();
}
(function () {
  var o = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-crit') return 'rules'; return o.apply(this, arguments); };
  var a = nfAdminApply; nfAdminApply = function () { var r = a.apply(this, arguments); try { if (hsOn() && _nfOv.view === 'setup' && _hs.stab === 'rules') { hspCritRender(); var p = document.querySelector('#hs-rules p'); if (p && /set in Content/.test(p.textContent)) p.textContent = 'Timeline — grace days after the last day, catch-up, on-time thresholds — is set separately for Sub-Centres, UPHCs, PHCs and CHCs. NQAS criteria are just below.'; } } catch (e) {} return r; };
})();
// ── phone (28 Oct, HealSol screenshots of Partners / Recognition): Settings tabs on one scrolling row; tables become cards ──
function hspTabsRow() {
  var st = document.getElementById('hs-stabs'); if (!st || st.querySelector('.hs-strow')) return;
  var row = document.createElement('div'); row.className = 'hs-strow'; row.setAttribute('role', 'tablist');
  [].slice.call(st.querySelectorAll(':scope > button')).forEach(function (b) { row.appendChild(b); }); st.appendChild(row); st.removeAttribute('role');
}
// keep the chosen tab in view on a phone (Settings row and the inner Partners / Recognition tabs)
function hspScrollTabs() {
  if (window.innerWidth >= 900) return;
  [].forEach.call(document.querySelectorAll('#hs-stabs .hs-strow, #nf-stdon .nfr-tabs, #nf-recog .nfr-tabs'), function (row) {
    var on = row.querySelector('button.on'); if (!on) return; try { row.scrollLeft = Math.max(0, on.offsetLeft - row.offsetLeft - 24); } catch (e) {} });
}
function hspLabelTables(root) {
  [].forEach.call((root || document).querySelectorAll('table.nfr-t'), function (t) {
    var hd = [].map.call(t.querySelectorAll('thead th'), function (th) { return (th.textContent || '').trim(); });
    [].forEach.call(t.querySelectorAll('tbody tr'), function (tr) { [].forEach.call(tr.children, function (td, i) { if (!td.hasAttribute('data-label')) td.setAttribute('data-label', hd[i] || ''); }); });
  });
}
(function () {
  var a = nfAdminApply; nfAdminApply = function () { var r = a.apply(this, arguments); try { if (hsOn()) { hspTabsRow(); setTimeout(function () { hspTabsRow(); hspScrollTabs(); }, 450); hspLabelTables(document.querySelector('#admin-app .admin-main')); hspScrollTabs(); } } catch (e) {} return r; };
  if (typeof nfrRender === 'function') { var o = nfrRender; nfrRender = async function () { var r = await o.apply(this, arguments); try { hspLabelTables(document.getElementById('nf-recog')); hspLabelTables(document.getElementById('nf-stdon')); hspScrollTabs(); } catch (e) {} return r; }; }
  if (typeof nfDAdminRender === 'function') { var d = nfDAdminRender; nfDAdminRender = async function () { var r = await d.apply(this, arguments); try { hspLabelTables(document.getElementById('nf-stdon')); hspScrollTabs(); } catch (e) {} return r; }; }
  if (typeof hsEnsureTabs === 'function') { var e = hsEnsureTabs; hsEnsureTabs = function () { var r = e.apply(this, arguments); try { hspTabsRow(); hspScrollTabs(); } catch (x) {} return r; }; }
})();
// ── Danger zone → Start fresh (29 Oct 2026): clear demo data before go-live; keep HealSol Admins, content, settings, Registry lists ──
var _hspFr = { plan: null, shared: null, file: '', busy: false };
var HSF_LBL = { sc_facilities: 'Facilities', sc_pcards: 'Staff cards (UPHC / PHC / CHC)', sc_dcards: 'Department cards', sc_dactions: 'Department actions', sc_progress: 'Staff cards (Sub-Centre)', sc_cpprog: 'Checkpoint progress',
  sc_corrective: 'Corrective actions', sc_review_sessions: 'Peer review sessions', sc_live_sessions: 'Live sessions', sc_units: 'PHC / CHC units (old links)', sc_registry_log: 'Registry change log', sc_nin_index: 'NIN index',
  sc_moic_by_mob: 'MOIC mobiles', sc_summary: 'Nightly summaries', sc_impact: 'Impact records', sc_impact_public: 'Public impact cards', sc_impact_pid: 'Impact card IDs', sc_impact_img: 'Impact card images', sc_pioneers: 'Quality Pioneers',
  sc_portfolios: 'State / donor portfolios', sc_viewers: 'State / donor logins', sc_views: 'State / donor dashboards', sc_public_stats: 'Public page figures', sc_dirty: 'Pending summary updates', sc_supervisors: 'Supervisors',
  sc_district_admins: 'District Admins and MOIC block views', sc_champions: 'Quality Champions', sc_staff_index: 'Staff logins index', sc_payments: 'Payments and receipts', sc_certs: 'Certificates', sc_cert_public: 'Public certificate pages',
  sc_secure: 'Counters and rate limits', sc_audit: 'Audit log', 'shared/sc_leads': 'Enquiries and sign-ups' };
function hspFreshRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-fresh');
  if (!el) { el = document.createElement('div'); el.id = 'hs-fresh'; el.dataset.nfv = 'setup'; el.className = 'nfo-card hs-fresh'; main.appendChild(el); }
  el.setAttribute('data-hsg', 'danger');
  var P = _hspFr.plan, row = function (a, b) { return '<tr><td>' + hsE(a) + '</td><td>' + hsE(String(b)) + '</td></tr>'; };
  var h = '<b class="hsf-t"><i class="ti ti-alert-triangle"></i> Start fresh (before go-live)</b>'
    + '<p>Deletes every facility and everything that belongs to it (cards, progress, actions, sessions, certificates, payments, impact records), every login except the HealSol Admins, enquiries, counters and logs. Keeps the HealSol Admins, all content and settings, and the Registry lists. Export a backup of the database first (Firebase console → Realtime Database → ⋮ → Export JSON).</p>'
    + '<label class="hsf-f"><span>Copy content and settings from staging (optional): the staging database\'s <b>shared</b> node, exported as JSON</span><input type="file" accept=".json,application/json" onchange="hspFreshFile(this)"></label>'
    + (_hspFr.file ? '<small class="hsf-ok">Loaded: ' + hsE(_hspFr.file) + '</small>' : '')
    + '<div class="hsf-b"><button type="button" class="hs-btn" onclick="hspFreshCheck()"' + (_hspFr.busy ? ' disabled' : '') + '>Check what would be deleted</button></div>';
  if (P && P.dryRun) {
    h += '<div class="hsf-p"><b>Project: ' + hsE(P.project) + '</b><table class="nfo-t"><tbody>'
      + P.wipe.concat(P.shared).map(function (w) { return row(HSF_LBL[w.path] || w.path, w.n + ' to delete'); }).join('')
      + row('Sign-ins deleted', P.users.delete) + row('Sign-ins kept (HealSol Admins)', P.users.keep) + row('Registry records kept', P.registry.rows + (P.registry.links ? ' (' + P.registry.links + ' lose their link to a deleted facility)' : ''))
      + (P.copy.length ? row('Copied from staging', P.copy.join(', ')) : '') + (P.skip.length ? row('Not copied', P.skip.join(', ')) : '') + '</tbody></table>'
      + '<label class="hsf-f"><span>Type the project name <b>' + hsE(P.project) + '</b> to start fresh</span><input id="hsf-confirm" autocomplete="off" oninput="var b=document.getElementById(\'hsf-go\'); if(b) b.disabled=this.value.trim()!==\'' + hsJ(P.project) + '\'"></label>'
      + '<div class="hsf-b"><button type="button" class="hs-btn hsf-go" id="hsf-go" disabled onclick="hspFreshRun()">Start fresh now</button></div></div>';
  } else if (P && P.done) h += '<div class="hsf-p hsf-done"><b>Done.</b> ' + P.usersDeleted + ' sign-ins deleted' + (P.copy.length ? ' · copied from staging: ' + hsE(P.copy.join(', ')) : '') + '. Reload the page to see the fresh app.</div>';
  el.innerHTML = h;
}
function hspFreshFile(inp) {
  var f = inp.files && inp.files[0]; if (!f) return;
  var rd = new FileReader(); rd.onload = function () { try { var j = JSON.parse(rd.result); if (j && j.shared && typeof j.shared === 'object' && !j.cp_master) j = j.shared; _hspFr.shared = j; _hspFr.file = f.name + ' · ' + Object.keys(j).length + ' settings'; _hspFr.plan = null; hspFreshRender(); }
    catch (e) { showToast('That file is not a JSON export.', 'err'); } }; rd.readAsText(f);
}
async function hspFreshCheck() {
  _hspFr.busy = true; hspFreshRender();
  try { _hspFr.plan = await nfCall('startFresh', { mode: 'dry', importShared: _hspFr.shared || undefined }); } catch (e) { showToast(typeof nfErrText === 'function' ? nfErrText(e) : 'Could not check.', 'err'); }
  _hspFr.busy = false; hspFreshRender();
}
async function hspFreshRun() {
  var c = (document.getElementById('hsf-confirm') || {}).value || '', P = _hspFr.plan || {};
  if (c.trim() !== P.project) return;
  var ok = await scDialog({ title: 'Start fresh on ' + P.project + '?', icon: '⚠️', okLabel: 'Yes, start fresh', message: 'This cannot be undone except from your backup export. Every facility and every login except the HealSol Admins will be deleted.' }); if (!ok) return;
  var b = document.getElementById('hsf-go'); if (b) { b.disabled = true; b.textContent = 'Working…'; }
  try { _hspFr.plan = await nfCall('startFresh', { mode: 'run', confirm: c.trim(), importShared: _hspFr.shared || undefined }); showToast('Started fresh — reload the page.', 'ok'); }
  catch (e) { showToast(typeof nfErrText === 'function' ? nfErrText(e) : 'Could not start fresh.', 'err'); }
  hspFreshRender();
}
(function () {
  var o = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-fresh') return 'danger'; return o.apply(this, arguments); };
  var a = nfAdminApply; nfAdminApply = function () { var r = a.apply(this, arguments); try { if (hsOn() && _nfOv.view === 'setup' && _hs.stab === 'danger' && !document.getElementById('hs-fresh')) hspFreshRender(); } catch (e) {} return r; };
})();
