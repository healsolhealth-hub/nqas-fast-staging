// ═══ Settings in the page instead of pop-ups (15 Nov 2026) ═══
//  Programme rules → Timeline (was the "Programme timeline settings" pop-up), Verification sampling (was a pop-up in
//  Review & actions), Join screen announcement (was inside Self sign-up), NQAS criteria with the Sub-Centre row editable
//  in place (the Content → Checkpoints pop-up now opens here). Content → Checkpoints → Areas… opens in the page.
function spE(s) { return typeof hsE === 'function' ? hsE(s) : (typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s)); }
function spField(id, label, val, unit, hint, attrs) {
  return '<label class="sp-fld" for="' + id + '"><span>' + label + '</span><span class="sp-num">' + (unit && unit.pre ? unit.pre + ' ' : '') + '<input type="number" inputmode="numeric" id="' + id + '" value="' + spE(val) + '"' + (attrs || '') + '>' + (unit && unit.post ? ' ' + unit.post : (typeof unit === 'string' ? ' ' + unit : '')) + '</span>' + (hint ? '<small id="' + id + '-h">' + hint + '</small>' : '') + '</label>';
}

// ── Timeline ──
var _tl = { t: 'sc', buf: null, dirty: false };
function tlTypes() { return Object.keys(NF_LEVELS); }
function tlDays(t) { return t === 'sc' ? 60 : ((NF_LEVELS[t] || {}).days || 60); }
async function tlLoad() { try { _nfgRaw = (await fbGet('shared/sc_grad_config')) || {}; } catch (e) { _nfgRaw = _nfgRaw || {}; } _tl.buf = {}; tlTypes().forEach(function (t) { _tl.buf[t] = nfgCfgFor(t); }); _tl.dirty = false; }
function tlBar(x) { var a = Math.max(0, Math.min(100, x.amber)), g = Math.max(a, Math.min(100, x.green));
  return '<div class="tl-bar" aria-hidden="true"><span class="b" style="width:' + a + '%">Behind · below ' + a + '%</span><span class="s" style="width:' + (g - a) + '%">Slipping</span><span class="o" style="width:' + (100 - g) + '%">On track · ' + g + '%+</span></div>'; }
function tlHTML() {
  var t = _tl.t, x = _tl.buf[t], d = tlDays(t), sc = t === 'sc', P = (NF_LEVELS[t] || {}).plural || t;
  return '<b><i class="ti ti-calendar"></i> Timeline</b><p>When a programme closes, how catch-up works, and when a facility counts as on track. Each facility type has its own settings.</p>'
    + '<div class="sp-types" role="tablist" aria-label="Facility type">' + tlTypes().map(function (k) { return '<button type="button" role="tab" aria-selected="' + (k === t) + '" class="' + (k === t ? 'on' : '') + '" onclick="tlType(\'' + k + '\')">' + spE((NF_LEVELS[k] || {}).plural || k) + '</button>'; }).join('') + '</div>'
    + '<div class="sp-sec"><h3>Closing and catch-up</h3><div class="sp-grid3">'
    + spField('tl-grace', 'Grace days after Day ' + d, x.grace, 'days', 'The programme closes on Day ' + (d + x.grace))
    + spField('tl-catchDays', 'Catch-up length', x.catchDays, 'days', sc ? 'For facilities that miss the mark' : 'Fixed for ' + spE(P) + ': 3 weeks on the weakest departments, then 1 week of end-line', sc ? '' : ' disabled')
    + spField('tl-maxCatch', 'Catch-ups allowed', x.maxCatch, 'per facility', sc ? '' : 'Fixed at one for ' + spE(P), sc ? '' : ' disabled') + '</div></div>'
    + '<div class="sp-sec"><h3>On track, slipping or behind</h3><div id="tl-bar">' + tlBar(x) + '</div><small class="sp-hint">Share of cards finished on time.</small><div class="sp-grid2">'
    + spField('tl-green', 'On track from', x.green, '% on time') + spField('tl-amber', 'Slipping from', x.amber, '% on time', 'Below this is Behind')
    + spField('tl-missDays', 'On track only if no card is missing for more than', x.missDays, 'days') + spField('tl-blLate', 'Behind if the baseline is not finished by', x.blLate, { pre: 'Day' }) + '</div></div>'
    + '<div class="sp-sec"><h3>Certificate</h3><div class="sp-grid3">' + spField('tl-certYears', 'NHSRC certificate valid for', x.certYears, 'years') + '</div></div>'
    + '<div class="sp-save"><small>Applies to every facility of this type.</small><button type="button" class="hs-btn" onclick="tlUndo()">Undo changes</button><button type="button" class="hs-btn p" onclick="tlSave()">Save timeline</button></div>';
}
function tlBind() {
  NFG_KEYS.forEach(function (k) { var el = document.getElementById('tl-' + k); if (!el) return;
    el.oninput = function () { _tl.buf[_tl.t][k] = el.value === '' ? NaN : +el.value; _tl.dirty = true;
      if (k === 'green' || k === 'amber') { var b = document.getElementById('tl-bar'); if (b) b.innerHTML = tlBar(_tl.buf[_tl.t]); }
      if (k === 'grace') { var h = document.getElementById('tl-grace-h'); if (h) h.textContent = 'The programme closes on Day ' + (tlDays(_tl.t) + (+el.value || 0)); } }; });
}
async function tlRender() {
  var el = document.getElementById('hs-rules'); if (!el) return;
  el.setAttribute('data-tl', '1'); el.classList.add('sp-card');
  if (!_tl.buf) { el.innerHTML = '<b><i class="ti ti-calendar"></i> Timeline</b><p>Loading…</p>'; await tlLoad(); }
  el.innerHTML = tlHTML(); tlBind();
}
function tlType(t) { _tl.t = t; tlRender(); }
async function tlUndo() { await tlLoad(); tlRender(); }
async function tlSave() {
  var types = tlTypes(), buf = _tl.buf;
  for (var i = 0; i < types.length; i++) { var t = types[i], x = buf[t];
    if (NFG_KEYS.some(function (k) { return !(x[k] >= 0 && x[k] <= 1000); })) { showToast((NF_LEVELS[t] || {}).plural + ': use numbers between 0 and 1000.', 'err'); return; }
    if (x.amber > x.green) { showToast((NF_LEVELS[t] || {}).plural + ': Slipping must start below On track.', 'err'); return; } }
  var up = { updatedAt: scNowIso() }; NFG_KEYS.forEach(function (k) { up[k] = buf.sc[k]; });
  types.forEach(function (t) { if (t === 'sc') return; var o = {}; NFG_KEYS.forEach(function (k) { if (k !== 'catchDays' && k !== 'maxCatch') o[k] = buf[t][k]; }); up['byType/' + t] = o; });
  var ok = false; try { await db.ref('shared/sc_grad_config').update(up); ok = true; } catch (e) {}
  if (ok) { NFG_KEYS.forEach(function (k) { NF_GRAD[k] = buf.sc[k]; }); _nfgRaw = Object.assign({}, _nfgRaw, up, { byType: Object.assign({}, (_nfgRaw || {}).byType) }); types.forEach(function (t) { if (t !== 'sc') _nfgRaw.byType[t] = up['byType/' + t]; }); try { NF_BL.autoEnd = NF_GRAD.days + NF_GRAD.grace; } catch (e) {} _tl.dirty = false; }
  showToast(ok ? 'Timeline saved for every facility type.' : 'Could not save — check the connection.', ok ? 'ok' : 'err');
}
nfgSettings = function () { if (typeof _hs !== 'undefined') { _hs.stab = 'rules'; _hs.rk = 'time'; _hs.rkUser = 1; } nfAdminView('setup'); };

// ── Verification sampling ──
function spSampRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-sampling');
  if (!el) { el = document.createElement('div'); el.id = 'hs-sampling'; el.dataset.nfv = 'setup'; el.className = 'nfo-card sp-card'; el.setAttribute('data-hsg', 'rules'); var c = document.getElementById('hs-crit') || document.getElementById('hs-rules'); if (c && c.parentNode === main) c.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  var v = (typeof _scVCfg !== 'undefined' && _scVCfg) || { pct: 20, min: 3 };
  el.innerHTML = '<b><i class="ti ti-target"></i> Verification sampling</b><p>For CHO and MO cards, the verifier always checks every Half, Zero and re-attempted checkpoint, plus a random share of the Full scores. The rest are accepted on completion. Set 100% to check every checkpoint.</p>'
    + '<div class="sp-grid2">' + spField('sp-pct', 'Share of Full scores to check', v.pct, '%', '1 to 100') + spField('sp-min', 'At least this many Full scores per card', v.min, 'checkpoints', '0 to 50') + '</div>'
    + '<div class="sp-save"><button type="button" class="hs-btn p" onclick="spSampSave()">Save sampling</button></div>';
}
async function spSampSave() {
  var p = Math.round(+document.getElementById('sp-pct').value), m = Math.round(+document.getElementById('sp-min').value);
  if (!(p >= 1 && p <= 100) || !(m >= 0 && m <= 50)) { showToast('Enter a share between 1 and 100% and a minimum between 0 and 50.', 'err'); return; }
  var ok = await fbSet('shared/sc_verify_config', { pct: p, min: m, updatedAt: scNowIso(), updatedBy: 'HealSol Admin' });
  if (ok) { _scVCfg = { pct: p, min: m }; showToast('Sampling saved.', 'ok'); try { scAdmVRender(); } catch (e) {} } else showToast('Could not save.', 'err');
}
scAdmVerifySettings = function () { if (typeof _hs !== 'undefined') { _hs.stab = 'rules'; _hs.rk = 'samp'; _hs.rkUser = 1; } nfAdminView('setup'); };

// ── Join screen announcement: its own tab under Communication ──
function spJoinMove() {
  var su = document.getElementById('hs-signup'), set = su && su.querySelector('.nl-set'); if (!set) return;
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-joinann');
  if (!el) { el = document.createElement('div'); el.id = 'hs-joinann'; el.dataset.nfv = 'setup'; el.className = 'nfo-card sp-card'; el.setAttribute('data-hsg', 'rules'); su.insertAdjacentElement('afterend', el); }
  el.innerHTML = ''; el.appendChild(set);
  var ic = set.querySelector('b .ti'); if (ic) ic.className = 'ti ti-broadcast';
}
(function () { if (typeof hspSignupRender !== 'function') return; var o = hspSignupRender;
  hspSignupRender = async function () { var r = await o.apply(this, arguments); try { spJoinMove(); if (typeof hsRkApply === 'function') hsRkApply(); } catch (e) { console.warn('[sp] join', e); } return r; }; })();

// ── NQAS criteria: the Sub-Centre row is edited in place, one Save for every type ──
function spCritSc() {
  var row = document.querySelector('#hs-crit .hsc-rows .hsc-r'); if (!row || row.getAttribute('data-sp')) return;
  var c = (typeof _scCrit !== 'undefined' && _scCrit) || {}; if (c.overall == null) return;
  var std = Object.keys(c.std || {}).sort().map(function (s) { return s + ' ' + c.std[s]; }).join(', ');
  var cats = function (n) { return Object.keys(typeof SC_CPM_AOC !== 'undefined' ? SC_CPM_AOC : {}).filter(function (a) { return typeof scAocCat === 'function' && scAocCat(a) === n; }).join(', '); };
  var inp = function (k, v, lab) { return '<label class="hsc-in"><span>' + lab + '</span><input type="number" min="0" max="100" inputmode="numeric" id="hsc-sc-' + k + '" value="' + spE(v) + '" aria-label="Sub-Centre ' + lab + '">%</label>'; };
  row.setAttribute('data-sp', '1');
  row.innerHTML = '<span class="hsc-t"><b>Sub-Centre</b><small>overall · every Area of Concern · every Standard</small></span><span class="hsc-f">' + inp('overall', c.overall, 'Overall') + inp('aoc', c.aoc != null ? c.aoc : 70, 'Area of Concern') + inp('stdDefault', c.stdDefault, 'Standard') + '</span>'
    + '<details class="sp-more"><summary>Standards with their own minimum, and Structure · Process · Outcome</summary><div class="sp-grid1">'
    + '<label class="sp-fld"><span>Standards with a different minimum</span><input type="text" id="hsc-sc-std" value="' + spE(std) + '" placeholder="A1 60, D3 60"><small>Write each like "A1 60"</small></label>'
    + '<label class="sp-fld"><span>Structure: Areas of Concern</span><input type="text" id="hsc-sc-cS" value="' + spE(cats('Structure')) + '"></label>'
    + '<label class="sp-fld"><span>Process: Areas of Concern</span><input type="text" id="hsc-sc-cP" value="' + spE(cats('Process')) + '"></label>'
    + '<label class="sp-fld"><span>Outcome: Areas of Concern</span><input type="text" id="hsc-sc-cO" value="' + spE(cats('Outcome')) + '"></label></div></details>';
  var b = document.querySelector('#hs-crit .hsc-act .hs-btn.p'); if (b) b.textContent = 'Save criteria';
}
async function spCritScSave() {
  var g = function (k) { var e = document.getElementById('hsc-sc-' + k); return e ? e.value : null; };
  if (g('overall') == null) return true;
  var o = Math.round(+g('overall')), ao = Math.round(+g('aoc')), d = Math.round(+g('stdDefault'));
  if (!(o > 0 && o <= 100) || !(ao > 0 && ao <= 100) || !(d > 0 && d <= 100)) { showToast('Sub-Centre: percentages must be between 1 and 100.', 'err'); return false; }
  var bad = String(g('std') || '').split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean).filter(function (x) { return !/^[A-H]\d+\s*[:=]?\s*\d{1,3}$/i.test(x); });
  if (bad.length) { showToast('Write each Standard minimum like "A1 60" — check: ' + bad.join(', '), 'err'); return false; }
  var std = {}; String(g('std') || '').split(/[,;\n]+/).map(function (x) { return x.trim(); }).filter(Boolean).forEach(function (x) { var m = /^([A-H]\d+)\s*[:=]?\s*(\d{1,3})$/i.exec(x); std[m[1].toUpperCase()] = +m[2]; });
  var cat = {}, seen = {}, err = null;
  [['cS', 'Structure'], ['cP', 'Process'], ['cO', 'Outcome']].forEach(function (p) { String(g(p[0]) || '').toUpperCase().split(/[,\s]+/).filter(Boolean).forEach(function (a) { if (typeof SC_CPM_AOC !== 'undefined' && !SC_CPM_AOC[a]) err = 'Unknown Area of Concern "' + a + '".'; if (seen[a]) err = 'Area of Concern ' + a + ' is in two categories.'; seen[a] = 1; cat[a] = p[1]; }); });
  if (!err && typeof SC_CPM_AOC !== 'undefined') { var miss = Object.keys(SC_CPM_AOC).filter(function (a) { return !seen[a]; }); if (miss.length) err = 'Put every Area of Concern in a category — missing: ' + miss.join(', '); }
  if (err) { showToast(err, 'err'); return false; }
  var rec = { overall: o, aoc: ao, stdDefault: d, std: std, aocCat: cat, updatedAt: scNowIso(), updatedBy: 'HealSol Admin' };
  if (!await fbSet('shared/nqas_criteria', rec)) { showToast('Could not save — check the connection.', 'err'); return false; }
  _scCrit = rec; try { scCpmRender(); } catch (e) {} return true;
}
(function () {
  if (typeof hspCritRender === 'function') { var oR = hspCritRender; hspCritRender = async function () { var r = await oR.apply(this, arguments); try { spCritSc(); } catch (e) { console.warn('[sp] crit', e); } return r; }; }
  if (typeof hspCritSave === 'function') { var oS = hspCritSave; hspCritSave = async function () { if (!(await spCritScSave())) return; return oS.apply(this, arguments); }; }
  // Content → Checkpoints → "Edit criteria" opens Programme rules → NQAS criteria
  if (typeof scCritEdit === 'function') scCritEdit = function () { if (typeof _hs !== 'undefined') { _hs.stab = 'rules'; _hs.rk = 'crit'; _hs.rkUser = 1; } nfAdminView('setup'); };
})();

// ── Cross-cutting areas: edited in the page ──
async function nfCcManage() {
  if (typeof scCpmCanEdit === 'function' && !scCpmCanEdit()) return;
  var L = await nfCcLoad(), host = document.getElementById('scm-panel'); if (!host) return;
  var old = document.getElementById('sp-cc'); if (old) { old.remove(); return; }
  var el = document.createElement('div'); el.id = 'sp-cc'; el.className = 'nfo-card sp-card';
  el.innerHTML = '<b><i class="ti ti-list-details"></i> Cross-cutting areas</b><p>One area per line. These are the areas you can tick for any checkpoint. Removing an area here does not untick it on checkpoints that already have it — edit those checkpoints to move them.</p>'
    + '<label class="sp-fld"><span>Areas</span><textarea id="sp-cc-t" rows="10">' + spE(L.join('\n')) + '</textarea></label>'
    + '<div class="sp-save"><button type="button" class="hs-btn" onclick="document.getElementById(\'sp-cc\').remove()">Close</button><button type="button" class="hs-btn p" onclick="spCcSave()">Save list</button></div>';
  host.insertBefore(el, host.firstChild); try { el.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (e) {}
}
async function spCcSave() { var t = document.getElementById('sp-cc-t'); if (!t) return; var ok = await nfCcSave(String(t.value || '').split('\n'));
  showToast(ok ? 'Cross-cutting areas saved.' : 'Could not save — check the connection.', ok ? 'ok' : 'err'); if (ok) { var e = document.getElementById('sp-cc'); if (e) e.remove(); try { scCpmRender(); } catch (x) {} } }

// ── tabs: Sampling under Assessment, Join screen announcement under Communication ──
(function () {
  if (typeof HS_RTABS !== 'undefined') {
    HS_RTABS.forEach(function (g) {
      if (g[0] === 'Assessment' && !g[1].some(function (x) { return x[0] === 'samp'; })) g[1].push(['samp', 'hs-sampling', 'Verification sampling', 'How many Full scores are re-checked']);
      if (g[0] === 'Communication' && !g[1].some(function (x) { return x[0] === 'join'; })) g[1].push(['join', 'hs-joinann', 'Join screen announcement', 'Launch text and early-bird places']);
    });
  }
  if (typeof hsSetupGroup === 'function') { var oG = hsSetupGroup; hsSetupGroup = function (el) { if (el && (el.id === 'hs-sampling' || el.id === 'hs-joinann')) return 'rules'; return oG.apply(this, arguments); }; }
  if (typeof hsRkApply === 'function') {
    var oK = hsRkApply;
    hsRkApply = function () {
      try { if (typeof hsOn === 'function' && hsOn() && _nfOv.view === 'setup') {
        if (document.getElementById('hs-rules') && !document.getElementById('hs-rules').getAttribute('data-tl')) tlRender();
        if (!document.getElementById('hs-sampling')) spSampRender();
        spJoinMove(); spCritSc(); } } catch (e) { console.warn('[sp] panels', e); }
      return oK.apply(this, arguments);
    };
  }
})();
