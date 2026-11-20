// ── Demo & test facilities: open them on purpose, mark a facility as test (4 Nov 2026; filter in shared/hide-demo.js) ──
function nfHidE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
function nfHidOpen(code) {
  var f = _nfHidden[code] || (scMasterFacilities || {})[code]; if (!f) { showToast('Facility not found — refresh the page.', 'err'); return; }
  _nfHidOpen[code] = 1; scMasterFacilities[code] = f; if (_nfHiddenProg[code]) scMasterProgress[code] = _nfHiddenProg[code];
  var ov = document.getElementById('nf-hid-ov'); if (ov) ov.remove();
  try { if (typeof nfAdminView === 'function' && typeof _nfOv !== 'undefined' && _nfOv.view !== 'fac') nfAdminView('fac'); } catch (e) {}
  setTimeout(function () { scDrillIn(code); }, 50);
}
// leaving the facility page puts it back out of the numbers
(function () { if (typeof scDrillBack !== 'function') return; var o = scDrillBack;
  scDrillBack = function () { var r = o.apply(this, arguments); try { if (Object.keys(_nfHidOpen).length) { _nfHidOpen = {}; nfHideSplit(); try { nfAdminApply(); } catch (e) {} } } catch (e) {} return r; }; })();
function nfHidListHTML() {
  var H = _nfHidden, codes = Object.keys(H).sort(function (a, b) { return (H[a].showcase ? 0 : 1) - (H[b].showcase ? 0 : 1) || String(H[a].name).localeCompare(String(H[b].name)); });
  if (!codes.length) return '<p class="hs-dim">No demo or test facilities.</p>';
  return '<table class="dm-tab"><tbody>' + codes.map(function (c) { var f = H[c], t = (typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f.type || 'sc')).toUpperCase();
    return '<tr><td><b>' + nfHidE(f.name || c) + '</b> <span class="nf-hid-tag ' + (f.showcase ? 'd' : 't') + '">' + (f.showcase ? 'DEMO' : 'TEST') + '</span><br><small class="hs-dim">' + nfHidE(c + ' · ' + t + ' · ' + (f.district || '')) + '</small></td>'
      + '<td style="text-align:right;white-space:nowrap"><button type="button" class="hs-btn" onclick="nfHidOpen(\'' + nfHidE(c) + '\')">Open</button>'
      + (f.testFac ? ' <button type="button" class="hs-btn" onclick="nfTestSet(\'' + nfHidE(c) + '\',false)">Not a test facility</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table>';
}
function nfHidShow() {
  var ov = document.getElementById('nf-hid-ov'); if (ov) ov.remove(); ov = document.createElement('div'); ov.id = 'nf-hid-ov'; ov.className = 'scx-ov';
  ov.innerHTML = '<div class="scx-box nf-hid-box"><h3 style="margin:0 0 6px">Demo &amp; test facilities</h3><p class="hs-dim" style="margin:0 0 10px">Not counted anywhere in HealSol\'s screens, reports or partner dashboards. Open one to look at it; it goes back out of the numbers when you leave it.</p>'
    + nfHidListHTML() + '<div class="iv-acts"><button type="button" class="hs-btn" onclick="document.getElementById(\'nf-hid-ov\').remove()">Close</button></div></div>';
  ov.addEventListener('click', function (e) { if (e.target === ov) ov.remove(); }); document.body.appendChild(ov);
}
async function nfTestSet(code, on) {
  var f = (scMasterFacilities || {})[code] || _nfHidden[code]; if (!f) return;
  if (on && !(await scDialog({ title: 'Mark "' + (f.name || code) + '" as a test facility?', icon: '🧪', okLabel: 'Mark as test', message: 'It will be left out of every count, list, to-do, report and business figure. Its staff can still log in. You can undo this any time (Facilities → demo & test facilities).' }))) return;
  var ok = await fbSet(scFacilityPath(code) + '/testFac', on ? true : null); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
  if (on) { f.testFac = true; _nfHidden[code] = f; if (scMasterProgress[code]) _nfHiddenProg[code] = scMasterProgress[code]; delete scMasterFacilities[code]; delete scMasterProgress[code]; delete _nfHidOpen[code]; }
  else { delete f.testFac; delete _nfHidden[code]; scMasterFacilities[code] = f; if (_nfHiddenProg[code]) scMasterProgress[code] = _nfHiddenProg[code]; }
  var ov = document.getElementById('nf-hid-ov'); if (ov) ov.remove();
  try { var dp = document.getElementById('sc-drill-panel'); if (on && dp && typeof scDrillBack === 'function') scDrillBack(); } catch (e) {}
  showToast(on ? 'Marked as a test facility — left out of the numbers.' : 'Counted again as a real facility.', 'ok');
  try { nfAdminApply(); } catch (e) {} try { if (typeof hsRenderFac === 'function') hsRenderFac(); } catch (e) {}
}
// Manage ⋯ menu: Mark as test facility / Not a test facility
(function () { if (typeof nfFacMenu !== 'function') return; var o = nfFacMenu;
  nfFacMenu = function (btn, code) { var r = o.apply(this, arguments);
    try { var m = document.getElementById('mfc-menu'); if (m && m.getAttribute('data-code') === code) { var f = (scMasterFacilities || {})[code] || {}; if (f.showcase) return r;
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'menuitem'); b.innerHTML = '<i class="ti ti-flask"></i>' + (f.testFac ? 'Not a test facility' : 'Mark as test facility');
      b.onclick = function () { m.remove(); nfTestSet(code, !f.testFac); }; var last = m.lastElementChild; m.insertBefore(b, last); } } catch (e) {} return r; }; })();
// Facilities: one line under the totals
(function () { if (typeof hsRenderFac !== 'function') return; var o = hsRenderFac;
  hsRenderFac = function () { var r = o.apply(this, arguments);
    try { var n = Object.keys(_nfHidden).length, box = document.getElementById('hs-fac'), tw = box && box.querySelector('.hs-tw'), old = document.getElementById('nf-hid-line'); if (old) old.remove();
      if (n && tw) { var d = Object.keys(_nfHidden).filter(function (c) { return _nfHidden[c].showcase; }).length, t = n - d;
        tw.insertAdjacentHTML('afterend', '<div class="nf-hid-line" id="nf-hid-line"><i class="ti ti-eye-off"></i> ' + [d ? d + ' demo' : '', t ? t + ' test' : ''].filter(Boolean).join(' · ') + ' facilit' + (n === 1 ? 'y' : 'ies') + ' not counted here <button type="button" onclick="nfHidShow()">Show</button></div>'); } } catch (e) {}
    return r; }; })();
// Settings → Demo facilities: Open each one
(function () { if (typeof dmRender !== 'function') return; var o = dmRender;
  dmRender = async function () { var r = await o.apply(this, arguments);
    try { var host = document.getElementById('hs-demo'); if (host && (_dm.cfg || {}).on && !host.querySelector('.nf-hid-open')) { var w = document.createElement('div'); w.className = 'iv-acts nf-hid-open';
      w.innerHTML = Object.keys(DM_CODES).map(function (k) { return '<button type="button" class="hs-btn" onclick="nfHidOpen(\'' + DM_CODES[k] + '\')">Open ' + nfHidE(DM_FAC[k].name.replace('Demo ', '')) + '</button>'; }).join('');
      var msg = document.getElementById('dm-msg'); if (msg) msg.insertAdjacentElement('beforebegin', w); } } catch (e) {} return r; }; })();
