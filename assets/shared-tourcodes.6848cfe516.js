// ── App tour access codes (18 Nov 2026) — HealSol Settings → Access → Tour access ───────────────────────────────
// Each person or organisation gets their own code for the role tours (app.thehealsol.com/tour/<role>/). The code is checked
// on the server (functions/tour.js), which records every open. Stop a code and it no longer opens anything.
//  sc_tour_codes/{CODE} = {for, tours:{district:true}, until, stopped, opens, lastAt, createdAt, by}; sc_tour_opens/{id} = {code, for, tour, dev, at}
var TC_TOURS = [['district', 'District', 'DIST'], ['block', 'Block', 'BLCK'], ['state', 'State', 'STAT'], ['donor', 'Donor / Partner', 'DONR'], ['champion', 'Quality Champion', 'CHMP'], ['mentor', 'Mentor', 'MNTR'], ['full-access', 'Full access (payment)', 'FULL']];
var _tc = { list: null, opens: null, pick: { district: true } };
function tcE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function tcName(id) { return (TC_TOURS.filter(function (t) { return t[0] === id; })[0] || [id, id])[1]; }
function tcToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
function tcWhen(iso) { if (!iso) return ''; try { var d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); } catch (e) { return String(iso).slice(0, 16); } }
function tcCode(first) {
  var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = function (n) { var s = '', a = new Uint32Array(n); (window.crypto || window.msCrypto).getRandomValues(a); for (var i = 0; i < n; i++) s += A[a[i] % A.length]; return s; };
  var pre = (TC_TOURS.filter(function (t) { return t[0] === first; })[0] || [0, 0, 'TOUR'])[2]; return pre + '-' + r(4) + '-' + r(2);
}
function tcLink(id) { return location.origin + '/tour/' + id + '/'; }
async function tcLoad() {
  try { _tc.list = (await fbGet('sc_tour_codes')) || {}; } catch (e) { _tc.list = {}; }
  try { var s = await db.ref('sc_tour_opens').orderByKey().limitToLast(30).get(); _tc.opens = s.val() || {}; } catch (e) { _tc.opens = {}; }
}
async function tcRender() {
  var main = document.querySelector('#admin-app .admin-main'); if (!main) return;
  var el = document.getElementById('hs-tour');
  if (!el) { el = document.createElement('div'); el.id = 'hs-tour'; el.dataset.nfv = 'setup'; el.className = 'nfo-card sp-card'; el.setAttribute('data-hsg', 'rules'); var c = document.getElementById('hs-otp') || document.getElementById('hs-signup'); if (c && c.parentNode === main) c.insertAdjacentElement('afterend', el); else main.appendChild(el); }
  if (!_tc.list) { el.innerHTML = '<b><i class="ti ti-map-2"></i> Tour access</b><p>Loading…</p>'; await tcLoad(); }
  var L = _tc.list || {}, today = tcToday(), codes = Object.keys(L).sort(function (a, b) { return String(L[b].createdAt || '').localeCompare(String(L[a].createdAt || '')); });
  var opens = Object.keys(_tc.opens || {}).sort().reverse().map(function (k) { return _tc.opens[k]; });
  var st = function (x) { if (x.stopped) return ['Stopped', 'off']; if (x.until && x.until < today) return ['Expired', 'off']; if (x.until) return ['Until ' + x.until.slice(8) + '/' + x.until.slice(5, 7), 'warn']; return ['Active', 'ok']; };
  el.innerHTML = '<b><i class="ti ti-map-2"></i> Tour access</b><p>Give each person or organisation their own code for the role tours. Every open is recorded here. Stop a code and it no longer opens anything. The public tour (' + tcE(location.origin) + '/tour/) needs no code.</p>'
    + '<div class="tc-new"><label class="sp-fld">For (name or organisation)<input type="text" id="tc-for" maxlength="80" placeholder="e.g. Dr Rao, DPM Sitapur"></label>'
    + '<label class="sp-fld">Valid until (optional)<input type="date" id="tc-until" min="' + today + '"></label>'
    + '<fieldset class="tc-tours"><legend>Tours this code opens</legend>' + TC_TOURS.map(function (t) { return '<label><input type="checkbox" value="' + t[0] + '"' + (_tc.pick[t[0]] ? ' checked' : '') + ' onchange="_tc.pick[this.value]=this.checked"> ' + tcE(t[1]) + '</label>'; }).join('') + '</fieldset>'
    + '<button type="button" class="hs-btn p lg" onclick="tcCreate(this)">Create code</button></div>'
    + (codes.length ? '<div class="tc-tw"><table class="tc-tb"><thead><tr><th>Code</th><th>For</th><th>Tours</th><th>Opens</th><th>Status</th><th><span class="tc-sr">Actions</span></th></tr></thead><tbody>'
      + codes.map(function (k) { var x = L[k], s = st(x), t = Object.keys(x.tours || {});
        return '<tr class="' + (s[1] === 'off' ? 'tc-off' : '') + '"><td data-l="Code"><b class="tc-code">' + tcE(k) + '</b></td><td data-l="For">' + tcE(x.for) + '</td><td data-l="Tours">' + tcE(t.map(tcName).join(', ')) + '</td>'
          + '<td data-l="Opens"><b>' + (x.opens || 0) + '</b>' + (x.lastAt ? '<small>last ' + tcE(tcWhen(x.lastAt)) + '</small>' : '<small>not opened yet</small>') + '</td>'
          + '<td data-l="Status"><span class="tc-st ' + s[1] + '">' + tcE(s[0]) + '</span></td><td class="tc-acts">'
          + (s[1] !== 'off' ? '<button type="button" class="hs-btn" onclick="tcShare(\'' + tcE(k) + '\')">Copy message</button><button type="button" class="hs-btn" onclick="tcStop(\'' + tcE(k) + '\')">Stop</button>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div>'
      : '<p class="tc-p">No codes yet. Create one above, then send it with the link.</p>')
    + '<div class="tc-log"><h3>Recent opens</h3>' + (opens.length ? '<ul>' + opens.map(function (o) { return '<li><b>' + tcE(o.for || o.code) + '</b><span>' + tcE(tcName(o.tour)) + ' · ' + tcE(tcWhen(o.at)) + ' · ' + tcE(o.dev || '') + '</span></li>'; }).join('') + '</ul>' : '<p class="tc-p">No opens yet.</p>')
    + '<button type="button" class="hs-btn" onclick="_tc.list=null;tcRender()">Refresh</button></div>';
}
async function tcCreate(btn) {
  var f = (document.getElementById('tc-for').value || '').trim(), u = document.getElementById('tc-until').value || '', tours = {};
  TC_TOURS.forEach(function (t) { if (_tc.pick[t[0]]) tours[t[0]] = true; });
  if (!f) { showToast('Write who the code is for.', 'err'); return; }
  if (!Object.keys(tours).length) { showToast('Tick at least one tour.', 'err'); return; }
  if (u && u < tcToday()) { showToast('The date has passed.', 'err'); return; }
  var first = TC_TOURS.filter(function (t) { return tours[t[0]]; })[0][0], code = tcCode(first);
  var rec = { for: f.slice(0, 80), tours: tours, createdAt: new Date().toISOString(), by: String((typeof _nfAuth !== 'undefined' && _nfAuth && _nfAuth.claims && _nfAuth.claims.hs) || 'HealSol').slice(0, 80) };
  if (u) rec.until = u;
  if (btn) btn.disabled = true;
  var ok = await fbSet('sc_tour_codes/' + code, rec); if (btn) btn.disabled = false;
  if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
  _tc.list = _tc.list || {}; _tc.list[code] = rec; await tcRender(); showToast('Code ' + code + ' created.', 'ok'); tcShare(code);
}
function tcMsg(code) {
  var x = (_tc.list || {})[code] || {}, t = Object.keys(x.tours || {});
  return 'NQAS | FAST app tour' + (x.for ? ' for ' + x.for : '') + '\n\n' + t.map(function (id) { return tcName(id) + ': ' + tcLink(id); }).join('\n') + '\n\nAccess code: ' + code + (x.until ? '\nValid until: ' + x.until : '') + '\n\nHealSol Academy · info@thehealsol.com';
}
function tcShare(code) {
  var m = tcMsg(code);
  try { if (typeof nfCopyText === 'function') nfCopyText(m); else navigator.clipboard.writeText(m); showToast('Message with the link and code copied — paste it in WhatsApp or email.', 'ok'); }
  catch (e) { window.prompt('Copy this message:', m); }
}
async function tcStop(code) {
  var go = true; try { go = await showConfirm('Stop code ' + code + '? It will no longer open any tour.', '⛔', 'Stop', 'Cancel', 'var(--red)'); } catch (e) {} if (!go) return;
  var ok = await fbSet('sc_tour_codes/' + code + '/stopped', true); if (ok === false) { showToast('Could not save — check the connection.', 'err'); return; }
  if (_tc.list && _tc.list[code]) _tc.list[code].stopped = true; tcRender(); showToast('Stopped.', 'ok');
}
(function () {
  if (typeof HS_RTABS !== 'undefined') HS_RTABS.forEach(function (g) { if (g[0] === 'Access' && !g[1].some(function (x) { return x[0] === 'tour'; })) g[1].push(['tour', 'hs-tour', 'Tour access', 'Codes for the role tours']); });
  if (typeof hsSetupGroup === 'function') { var oG = hsSetupGroup; hsSetupGroup = function (el) { if (el && el.id === 'hs-tour') return 'rules'; return oG.apply(this, arguments); }; }
  if (typeof hsRkApply === 'function') { var oK = hsRkApply; hsRkApply = function () { try { if (typeof hsOn === 'function' && hsOn() && _nfOv.view === 'setup' && !document.getElementById('hs-tour')) tcRender(); } catch (e) { console.warn('[tour] adm', e); } return oK.apply(this, arguments); }; }
})();
