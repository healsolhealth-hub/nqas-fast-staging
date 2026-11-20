// ══ Business → Enquiries & sign-ups (28 Oct 2026; approved mock-up) ═══════════════════════════════════════════════
// Everything in shared/sc_leads in one list: self sign-ups waiting for approval (source 'signup'), district / bulk enquiries
// (source 'bulk', or older ones without a source) and "Request to join" from a MOIC / MO inside the app (source 'join').
// Kind tabs · Facility type tabs (rows · facilities asked about) · status. Open ones always show, whatever the Business dates.
// Approve & enrol → approveSignup (server). Mark contacted / Close / Decline write the status (HealSol may write sc_leads).
// Replaces the old Leads panel of the retired Facilities screen. Today shows "N sign-ups to approve · N new enquiries".
var _nfEq = { kind: '', type: '', st: 'open', busy: '' };
var NF_EQ_KIND = { signup: ['Sign-up', 't'], bulk: ['District / bulk', 'q'], join: ['Request to join', 'o'], champion: ['Quality Champion', 'g'], delete: ['Delete account', 'x'], interest: ['Qi FAST interest', 'q'] };
function nfEqE(s) { return typeof scEsc === 'function' ? scEsc(s) : String(s == null ? '' : s); }
function nfEqJ(s) { return typeof scJs === 'function' ? scJs(s) : String(s || '').replace(/'/g, "\\'"); }
function nfEqKind(x) { return x.source === 'signup' ? 'signup' : x.source === 'join' ? 'join' : x.source === 'champion' ? 'champion' : x.source === 'delete' ? 'delete' : x.source === 'interest' ? 'interest' : 'bulk'; }
function nfEqOpen(x) { return ['approved', 'declined', 'closed'].indexOf(x.status || 'new') < 0; }
function nfEqRows() { var L = (typeof _nfBiz !== 'undefined' && _nfBiz.leads) || {}; return Object.keys(L).map(function (k) { return Object.assign({ _k: k }, L[k] || {}); }).filter(function (x) { return x.orgName || x.contactName; }); }
function nfEqTypes(x) { var o = {}; if (x.ftype) o[x.ftype] = 1; var c = x.counts || {}; Object.keys(c).forEach(function (t) { if (c[t]) o[t] = c[t]; }); return o; }
function nfEqStatusOk(x) { var s = x.status || 'new'; return _nfEq.st === 'all' || (_nfEq.st === 'open' ? nfEqOpen(x) : _nfEq.st === 'approved' ? s === 'approved' : (s === 'closed' || s === 'declined')); }
function nfEqToApprove(R) { return R.filter(function (x) { return nfEqKind(x) === 'signup' && nfEqOpen(x); }); }
function nfEqNewEnq(R) { return R.filter(function (x) { return nfEqKind(x) !== 'signup' && (x.status || 'new') === 'new'; }); }
function nfEqWhen(iso) { try { var d = new Date(iso); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }); } catch (e) { return ''; } }
function nfEqPkg(x) { if (x.ftype === 'chc') return 'CHC (' + (x.chcKind === 'nonfru' ? 'Non-FRU' : 'FRU') + ')'; if (typeof JN_PKG !== 'undefined') { var j = (JN_PKG[x.ftype] || []).filter(function (y) { return y.id === x.progId; })[0]; if (j) return j.label; } try { var p = getProg(x.progId); if (p && p.label) return p.label; } catch (e) {} var L = (NF_LEVELS[x.ftype] || {}).programmes || []; var q = L.filter(function (y) { return y.id === x.progId; })[0]; return q ? q.label : (x.progId || ''); }
function nfEqStatusHTML(x) {
  var s = x.status || 'new';
  if (s === 'approved' && nfEqKind(x) === 'champion') return '<span class="eq-st g">Selected</span>';
  if (s === 'approved') return '<span class="eq-st g">Approved' + (x.code ? ' · ' + nfEqE(x.code) : '') + '</span>';
  if (s === 'declined') return '<span class="eq-st n">Declined' + (x.declineReason ? ' · ' + nfEqE(x.declineReason === 'other' ? (x.declineNote || 'other') : (NF_EQ_REASONS.filter(function (r) { return r[0] === x.declineReason; })[0] || ['', ''])[1]) : '') + '</span>';
  if (s === 'closed') return '<span class="eq-st n">Closed</span>';
  if (s === 'contacted') return '<span class="eq-st b">Contacted' + (x.contactedAt ? ' · ' + nfEqE(nfEqWhen(x.contactedAt).split(',')[0]) : '') + '</span>';
  return '<span class="eq-st a">New' + (nfEqKind(x) === 'signup' ? ' · waiting for you' : '') + '</span>';
}
function nfEqRowHTML(x) {
  var k = nfEqKind(x), K = NF_EQ_KIND[k], t = x.ftype ? ((NF_LEVELS[x.ftype] || {}).short || x.ftype.toUpperCase()) : '', open = nfEqOpen(x), id = nfEqJ(x._k);
  var who = [x.contactName, x.designation, x.mobile].filter(Boolean).join(' · '), where = [x.block ? x.block + ' block' : '', x.district, x.state].filter(Boolean).join(', ');
  var c = x.counts || {}, cnt = [['sc', 'SC'], ['uphc', 'UPHC'], ['phc', 'PHC'], ['chc', 'CHC']].filter(function (y) { return c[y[0]]; }).map(function (y) { return c[y[0]] + ' ' + y[1]; });
  var line2 = '';
  if (k === 'signup') line2 = x.rid ? '<small class="eq-g">Found in the registry' + (x.nin ? ' · NIN ' + nfEqE(x.nin) : '') + '</small>' : '<small class="eq-a">Typed by the applicant' + (x.nin ? ' · NIN ' + nfEqE(x.nin) : '') + ' — Approve adds it to the registry too</small>';
  else if (k === 'champion') { var q = x.champ || {}, NQ = { certified: 'NQAS-certified facility', process: 'NQAS in process', no: 'Not yet certified' };
    line2 = '<small class="eq-g">' + nfEqE([x.ftype ? (NF_LEVELS[x.ftype] || {}).short || x.ftype.toUpperCase() : '', x.nin ? 'NIN ' + x.nin : '', q.years ? q.years + ' yrs in role' : '', NQ[q.nqas] || '', q.reach ? 'can support ' + q.reach + ' facilities' : '', q.langs ? 'guides in ' + q.langs : ''].filter(Boolean).join(' · ')) + '</small>'; }
  else if (k === 'interest') { var iq = x.interest || {}; line2 = '<small class="eq-b">' + nfEqE(['Qi FAST', iq.program, iq.ftype, iq.setting === 'private' ? 'Private' : iq.setting === 'public' ? 'Public' : '', iq.beds ? iq.beds + ' beds' : ''].filter(Boolean).join(' · ')) + '</small>'; }
  else if (k === 'delete') line2 = '<small class="eq-a">Close the login (People → remove) and delete the personal details within 30 days, then tell them on WhatsApp' + (x.message ? ' · reason: ' + nfEqE(x.message) : '') + '</small>';
  else if (cnt.length) line2 = '<small class="eq-b">' + nfEqE(cnt.join(' · ')) + ' = ' + nfEqE(x.facilityCount || '') + ' facilities</small>';
  else if (x.facilityCount) line2 = '<small class="eq-b">~' + nfEqE(x.facilityCount) + ' facilities</small>';
  if (x.checks) line2 += '<small class="eq-m">Applicant checked their request ' + nfEqE(x.checks) + '×' + (x.checkedAt ? ' · last ' + nfEqE(nfEqWhen(x.checkedAt)) : '') + '</small>';
  var btn = function (cls, label, js) { return '<button type="button" class="eq-btn ' + cls + '" onclick="' + js + '"' + (_nfEq.busy === x._k ? ' disabled' : '') + '>' + label + '</button>'; };
  var acts = '';
  if (open && k === 'signup') acts += btn('p', 'Approve &amp; enrol', "nfEqApprove('" + id + "')") + (x.rid ? btn('', 'Open in Registry', "nfEqRegistry('" + id + "')") : '');
  if (open && k === 'champion') acts += btn('p', 'Select', "nfEqSet('" + id + "','approved')");
  if (open && k === 'join') acts += btn('p', 'Enrol from Registry', "nfEqRegistry('" + id + "')");
  if (x.mobile) acts += btn('wa', 'WhatsApp', "nfBizMsg('lead','" + id + "')");
  if (open && (x.status || 'new') === 'new' && k !== 'signup') acts += btn('', 'Mark contacted', "nfEqSet('" + id + "','contacted')");
  if (open && k === 'signup' && (x.status || 'new') === 'new') acts += btn('', 'Mark contacted', "nfEqSet('" + id + "','contacted')");
  if (open && k === 'signup') acts += btn('x', 'Decline', "nfEqSet('" + id + "','declined')");
  else if (open) acts += btn('', 'Close', "nfEqSet('" + id + "','closed')");
  if (!open && x.status !== 'approved') acts += btn('', 'Reopen', "nfEqSet('" + id + "','new')");
  return '<div class="eq-r" data-k="' + nfEqE(x._k) + '"><div class="eq-c1"><span class="eq-kind ' + K[1] + '">' + nfEqE(K[0]) + (k === 'signup' && t ? ' · ' + nfEqE(t) : '') + '</span><small>' + nfEqE(nfEqWhen(x.submittedAt)) + '</small>' + (x.ref ? '<small>' + nfEqE(x.ref) + '</small>' : '') + '</div>'
    + '<div class="eq-c2"><b>' + nfEqE(x.orgName || '') + (k === 'join' ? ' <i>· from inside the app</i>' : x.orgType ? ' <i>· ' + nfEqE(x.orgType) + '</i>' : '') + '</b><small>' + nfEqE(who) + (where ? ' · ' + nfEqE(where) : '') + (k === 'signup' && x.progId ? ' · ' + nfEqE(nfEqPkg(x)) : '') + '</small>' + line2
    + (x.message ? '<small class="eq-m">Message: ' + nfEqE(String(x.message).slice(0, 200)) + '</small>' : '') + '</div>'
    + '<div class="eq-c3">' + nfEqStatusHTML(x) + '</div><div class="eq-c4">' + acts + '</div></div>';
}
function nfEqHTML() {
  var R = nfEqRows(), base = R.filter(nfEqStatusOk), kinds = { '': base.length, signup: 0, bulk: 0, join: 0, champion: 0, interest: 0, delete: 0 };
  base.forEach(function (x) { kinds[nfEqKind(x)]++; });
  var inKind = base.filter(function (x) { return !_nfEq.kind || nfEqKind(x) === _nfEq.kind; });
  var T = { sc: [0, 0], uphc: [0, 0], phc: [0, 0], chc: [0, 0] };
  inKind.forEach(function (x) { var o = nfEqTypes(x); Object.keys(o).forEach(function (t) { if (T[t]) { T[t][0]++; T[t][1] += o[t] === 1 && !(x.counts || {})[t] ? 1 : o[t]; } }); });
  var rows = inKind.filter(function (x) { return !_nfEq.type || nfEqTypes(x)[_nfEq.type]; }).sort(function (a, b) { return (nfEqOpen(b) - nfEqOpen(a)) || String(b.submittedAt || '').localeCompare(String(a.submittedAt || '')); });
  var toAp = nfEqToApprove(R).length, newE = nfEqNewEnq(R).length;
  var kb = function (k, l) { return '<button type="button" role="tab" aria-selected="' + (_nfEq.kind === k) + '" class="' + (_nfEq.kind === k ? 'on' : '') + '" onclick="nfEqSetF(\'kind\',\'' + k + '\')">' + l + ' <em>' + kinds[k] + '</em></button>'; };
  var tb = function (t, l) { var c = T[t] || [0, 0]; return '<button type="button" class="' + (_nfEq.type === t ? 'on' : '') + '" aria-pressed="' + (_nfEq.type === t) + '" onclick="nfEqSetF(\'type\',\'' + t + '\')">' + l + (t ? ' <em>' + c[0] + (c[1] > c[0] ? ' · ' + c[1] : '') + '</em>' : '') + '</button>'; };
  return '<div class="nfo-card eq" id="nf-eq"><div class="eq-head"><div><b>Enquiries &amp; sign-ups</b><small>' + (toAp ? toAp + ' sign-up' + (toAp === 1 ? '' : 's') + ' to approve · ' : '') + newE + ' new enquir' + (newE === 1 ? 'y' : 'ies') + ' · open ones always show, whatever dates you pick</small></div>'
    + '<div class="eq-hr"><select aria-label="Status" onchange="nfEqSetF(\'st\',this.value)">' + [['open', 'Open (new + contacted)'], ['approved', 'Approved'], ['closed', 'Closed / declined'], ['all', 'All']].map(function (o) { return '<option value="' + o[0] + '"' + (_nfEq.st === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>'
    + '<button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh enquiries" onclick="nfEqRefresh()"><i class="ti ti-refresh"></i></button></div></div>'
    + '<div class="eq-kinds" role="tablist" aria-label="Kind">' + kb('', 'All') + kb('signup', 'Sign-ups to approve') + kb('bulk', 'District / bulk') + kb('join', 'Request to join') + kb('champion', 'Quality Champions') + (kinds['interest'] ? kb('interest', 'Qi FAST interest') : '') + (kinds['delete'] ? kb('delete', 'Account deletion') : '') + '</div>'
    + '<div class="eq-types"><span>Facility type</span>' + tb('', 'All') + tb('sc', 'SC') + tb('uphc', 'UPHC') + tb('phc', 'PHC') + tb('chc', 'CHC') + '<span class="eq-tn">rows · facilities asked about</span></div>'
    + '<div class="eq-list">' + (rows.length ? rows.map(nfEqRowHTML).join('') : '<div class="eq-empty">Nothing here' + (_nfEq.st === 'open' ? ' — no open enquiries or sign-ups.' : '.') + '</div>') + '</div>'
    + '<div class="eq-foot">Self sign-up: Settings → Programme rules → <button type="button" class="hs-link" onclick="_hs.stab=\'rules\';nfAdminView(\'setup\')">Self sign-up</button> (no-cost baseline at once, per type)</div></div>';
}
function nfEqPaint() { var el = document.getElementById('nf-eq'); if (el) el.outerHTML = nfEqHTML(); }
function nfEqSetF(k, v) { _nfEq[k] = v; nfEqPaint(); }
async function nfEqRefresh() { try { await nfBizLoad(true); } catch (e) {} nfEqPaint(); }
function nfEqOpenList(kind) { _nfEq.kind = kind || ''; _nfEq.st = 'open'; nfAdminView('business'); setTimeout(function () { var el = document.getElementById('nf-eq'); try { el && el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {} }, 500); }
async function nfEqSet(id, status) {
  var L = (_nfBiz.leads || {}), x = L[id]; if (!x) return;
  var up = { status: status };
  if (status === 'declined') {
    var v = await scDialog({ title: 'Decline this sign-up?', icon: '✋', okLabel: 'Decline', message: (x.orgName || '') + ' · ' + (x.contactName || '') + '\n\nNo facility or login is made. The applicant sees the reason when they check their request. You can reopen it later.',
      fields: [{ key: 'reason', label: 'Reason (shown to the applicant)', type: 'select', value: 'verify', options: NF_EQ_REASONS.map(function (r) { return { value: r[0], label: r[1] }; }) }, { key: 'note', label: 'If Other: the reason in a few words', value: '', placeholder: 'e.g. the facility is a private clinic' }] });
    if (!v) return; up.declineReason = v.reason || 'other'; up.declineNote = String(v.note || '').trim().slice(0, 200) || null;
    if (up.declineReason === 'other' && !up.declineNote) { showToast('Write the reason in a few words.', 'err'); return; } } if (status === 'contacted') up.contactedAt = new Date().toISOString(); if (status === 'closed' || status === 'declined') up.closedAt = new Date().toISOString();
  var nx = Object.assign({}, x, up); if (status === 'new') { delete nx.closedAt; delete nx.declineReason; delete nx.declineNote; }
  var okw = await fbSet('shared/sc_leads/' + id, nx);
  if (okw !== false && status === 'declined' && x.mobile) setTimeout(function () { nfEqWaPrompt('Let ' + (x.contactName || 'them') + ' know', x.mobile, nfEqDeclinedText(nx)); }, 300);
  if (okw !== false && status === 'approved' && nfEqKind(x) === 'champion') setTimeout(function () { try { scAlert('Selected. Now add ' + (x.contactName || 'them') + ' (' + (x.mobile || '') + ') in Settings → Recognition → Quality Champions, with their Supervisor and the facilities they will guide. That gives them their Champion login.', 'Quality Champion', '🏅'); } catch (e) {} }, 300);
  if (okw === false) { showToast('Could not save — check the connection.', 'err'); return; }
  L[id] = nx; nfEqPaint(); showToast({ contacted: 'Marked contacted.', closed: 'Closed.', declined: 'Declined.', new: 'Reopened.' }[status] || 'Saved.', 'ok');
}
async function nfEqApprove(id) {
  var x = (_nfBiz.leads || {})[id]; if (!x) return;
  var ok = await scDialog({ title: 'Approve & enrol', icon: '✅', okLabel: 'Approve & enrol', message: (x.orgName || '') + ' (' + ((NF_LEVELS[x.ftype] || {}).short || '') + ')' + (x.nin ? ' · NIN ' + x.nin : '') + '\n' + [x.block ? x.block + ' block' : '', x.district, x.state].filter(Boolean).join(', ') + '\nIn-charge: ' + (x.contactName || '') + ' · ' + (x.mobile || '') + '\n\nMakes the facility' + (x.rid ? ' from its registry row' : ' and its registry row') + ', the in-charge login with a one-time password, the tree links, and starts the no-cost baseline.' });
  if (!ok) return;
  _nfEq.busy = id; nfEqPaint();
  try {
    var r = await nfCall('approveSignup', { id: id });
    _nfEq.busy = ''; try { await nfBizLoad(true); } catch (e) {} try { if (typeof scRefreshDashboard === 'function') scRefreshDashboard(); } catch (e) {}
    nfEqPaint();
    if (r && r.tempPassword && typeof nfShowTempPassword === 'function') await nfShowTempPassword(x.contactName || '', r.identifier, r.tempPassword, (x.orgName || 'Facility') + ' · ' + r.code, nfEqApprovedText(x, r));
    else showToast((x.orgName || 'Facility') + ' enrolled · ' + (r && r.code || '') + (r && !r.tempPassword ? ' (their existing login now opens it)' : ''), 'ok');
    try { if (typeof rgAfterTree === 'function' && r && ((r.accounts || []).length || (r.conflicts || []).length)) await rgAfterTree(r); } catch (e) {}
  } catch (e) { _nfEq.busy = ''; nfEqPaint(); showToast(typeof nfErrText === 'function' ? nfErrText(e) : 'Could not approve.', 'err'); }
}
// open the facility's registry row (sign-up from the list, or a "Request to join" by NIN) — enrol it there
async function nfEqRegistry(id) {
  var x = (_nfBiz.leads || {})[id] || {}, rid = x.rid || (x.nin ? 'N' + String(x.nin).replace(/\D/g, '') : '');
  nfAdminView('hsfac');
  try { await rgSet('tab', 'registry'); } catch (e) { try { rgSet('tab', 'registry'); } catch (e2) {} }
  for (var i = 0; i < 60 && !(typeof _rg !== 'undefined' && _rg.R && !_rg.loading); i++) await new Promise(function (r) { setTimeout(r, 150); });
  if (rid && _rg.R && _rg.R[rid]) { try { rgPick(rid); } catch (e) {} }
  else { try { _rg.q = x.orgName || ''; rgRender(); } catch (e) {} showToast('Not found by NIN — search shows "' + (x.orgName || '') + '". Add it with + Add facility if it is missing.', 'err'); }
}
// Business: the list sits under the header; the "Enquiries" tile opens it
(function () {
  if (typeof nfRenderBizDash !== 'function') return;
  var o = nfRenderBizDash;
  nfRenderBizDash = async function () {
    var r = await o.apply(this, arguments);
    try { var box = document.getElementById('nf-biz'); if (box && !document.getElementById('nf-eq')) { var bar = box.querySelector('.bz-bar'); var w = document.createElement('div'); w.innerHTML = nfEqHTML(); (bar || box.firstChild).insertAdjacentElement(bar ? 'beforebegin' : 'afterend', w.firstChild); }
      [].forEach.call(box ? box.querySelectorAll('.bz-k') : [], function (k) { if (/nfBizTab\('enq'/.test(k.getAttribute('onclick') || '')) k.setAttribute('onclick', "nfEqOpenList('')"); }); } catch (e) { console.warn('[enquiries]', e); }
    return r;
  };
})();
// Today: one line for HealSol
(function () {
  if (typeof hsTodo !== 'function') return;
  var o = hsTodo;
  hsTodo = function (list) {
    var out = o.apply(this, arguments);
    try {
      if (typeof _nfBiz === 'undefined' || !_nfBiz.leads) { if (!_nfEq.loading && typeof nfBizLoad === 'function') { _nfEq.loading = true; nfBizLoad().then(function () { try { if (_nfOv.view === 'today') hsRenderToday(); } catch (e) {} }); } return out; }
      var R = nfEqRows(), a = nfEqToApprove(R).length, n = nfEqNewEnq(R).length;
      if (a || n) out.unshift({ key: 'enq', lvl: a ? 'red' : 'amber', raw: 1, t: '<b>' + [a ? a + ' sign-up' + (a === 1 ? '' : 's') + ' to approve' : '', n ? n + ' new enquir' + (n === 1 ? 'y' : 'ies') : ''].filter(Boolean).join(' · ') + '</b>',
        sub: 'Business → Enquiries & sign-ups', btn: { l: 'Open', js: "nfEqOpenList('" + (a ? 'signup' : '') + "')", p: 1 } });
    } catch (e) {}
    return out;
  };
})();
// WhatsApp text for a sign-up or a request to join (the enquiry text stays for district / bulk)
(function () {
  if (typeof nfBizMsgText !== 'function') return;
  var o = nfBizMsgText;
  nfBizMsgText = function (kind, id) {
    var m = o.apply(this, arguments);
    try { if (kind === 'lead') { var x = ((_nfBiz && _nfBiz.leads) || {})[id] || {}, first = String(x.contactName || '').replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').split(' ')[0], k = nfEqKind(x);
      if (k === 'signup') m.text = 'Namaste' + (first ? ' ' + first : '') + ' ji,\nThank you for registering ' + (x.orgName || 'your facility') + ' on NQAS | FAST' + (x.ref ? ' (' + x.ref + ')' : '') + '. I am from HealSol Academy. I would like to confirm a few details before we start your no-cost baseline assessment. When is a good time to talk?';
      else if (k === 'champion') m.text = 'Namaste' + (first ? ' ' + first : '') + ' ji,\nThank you for applying to be a Quality Champion with NQAS | FAST' + (x.ref ? ' (' + x.ref + ')' : '') + '. I am from HealSol Academy. When is a good time to talk about your application?';
      else if (k === 'join') m.text = 'Namaste' + (first ? ' ' + first : '') + ' ji,\nThank you for asking to bring ' + (x.orgName || 'your facility') + ' into NQAS | FAST. I am from HealSol Academy. When is a good time to talk about enrolling it?'; } } catch (e) {}
    return m;
  };
})();
// the old Leads panel (retired Facilities screen) is replaced by this list
try { renderLeadsPanel = function () { var b = document.getElementById('leads-box'); if (b) b.remove(); }; } catch (e) {}

// ── approve / decline messages (2 Nov 2026) ───────────────────
var NF_EQ_REASONS = [['verify', 'Could not verify the facility details'], ['exists', 'Facility already registered by its in-charge'], ['scope', 'Not a public health facility covered by NQAS FAST'], ['duplicate', 'Duplicate request'], ['other', 'Other (write it below)']];
var NF_EQ_REASON_TXT = { verify: 'we could not verify the facility details', exists: 'this facility is already registered in NQAS FAST by its in-charge', scope: 'this facility is not a public health facility covered by NQAS FAST', duplicate: 'this is a duplicate of another request' };
function nfEqFirst(x) { return String(x.contactName || '').replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i, '').split(' ')[0]; }
function nfEqApprovedText(x, r) {
  var f = nfEqFirst(x);
  return 'Namaste' + (f ? ' ' + f : '') + ' ji, 🎉\n' + (x.orgName || 'Your facility') + ' is now enrolled in NQAS | FAST' + (x.ref ? ' (' + x.ref + ')' : '') + '.\n\nLog in at app.thehealsol.com\nMobile: ' + (r.identifier || x.mobile || '') + '\nOne-time password: ' + (r.tempPassword || '') + '\n\nYou will set your own password at first login. Your no-cost baseline assessment (' + (typeof nfBlDays === 'function' ? nfBlDays(x.ftype) : 7) + ' days) starts today.\n— HealSol Academy';
}
function nfEqDeclinedText(x) {
  var f = nfEqFirst(x), why = x.declineReason === 'other' ? (x.declineNote || '') : (NF_EQ_REASON_TXT[x.declineReason] || '');
  return 'Namaste' + (f ? ' ' + f : '') + ' ji,\nThank you for your interest in NQAS | FAST' + (x.ref ? ' (' + x.ref + ')' : '') + '. We are sorry, we could not approve the request for ' + (x.orgName || 'your facility') + (why ? ' because ' + why : '') + '.\n\nIf you think this is a mistake, please reply here and we will help.\n— HealSol Academy';
}
function nfEqWaPrompt(title, mobile, text) {
  var mob = String(mobile || '').replace(/\D/g, '').slice(-10), ov = document.createElement('div'); ov.className = 'scx-ov open'; ov.id = 'nf-eq-wa';
  ov.innerHTML = '<div class="scx-box"><div class="nfcf-head"><span style="font-size:22px;">💬</span><div style="flex:1;"><b>' + nfEqE(title) + '</b><div style="font-size:11.5px;color:var(--t3);">The message opens in WhatsApp — check it and press send</div></div></div>'
    + '<pre class="eq-wa-pre">' + nfEqE(text) + '</pre><div class="nf-tmp-acts"><button class="scx-btn ghost" id="nf-eq-wa-x">Not now</button><a class="scx-btn" target="_blank" rel="noopener" href="https://wa.me/' + (mob ? '91' + mob : '') + '?text=' + encodeURIComponent(text) + '" onclick="setTimeout(function(){var o=document.getElementById(\'nf-eq-wa\');o&&o.remove();},300)">Send on WhatsApp</a></div></div>';
  document.body.appendChild(ov); ov.querySelector('#nf-eq-wa-x').onclick = function () { ov.remove(); };
}
