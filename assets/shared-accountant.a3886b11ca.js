// ═══ Accountant login (15 Nov 2026) ═══
// HealSol adds an Accountant in Settings → People → HealSol Admins (sc_accountants/{id} {name, mobile}; claim "acct").
// The Accountant signs in and sees only Payments: To confirm (bank / UPI — confirm or reject), Proforma invoices (view),
// Invoices & receipts (download). Facility lists, money to collect and reports stay with HealSol.
var _ac = { who: null, t: 'confirm', busy: false };
var AC_TABS = [['confirm', 'To confirm', 'To confirm'], ['proforma', 'Proforma invoices', 'Proforma'], ['invoices', 'Invoices & receipts', 'Receipts']];
function acE(s) { return typeof scEsc === 'function' ? scEsc(s == null ? '' : s) : String(s == null ? '' : s); }
async function acLoad() {
  var jobs = [];
  if (typeof bpLoad === 'function') jobs.push(bpLoad(true));
  if (typeof ivLoad === 'function') jobs.push(ivLoad());
  jobs.push((async function () { try { _nfBd.pays = (await fbGet('sc_payments')) || {}; _nfBd.paysAt = Date.now(); } catch (e) { _nfBd.pays = _nfBd.pays || {}; } })());
  await Promise.all(jobs.map(function (p) { return p.catch(function () {}); }));
}
function acCounts() {
  var c = { confirm: 0, proforma: 0, invoices: 0 };
  try { c.confirm = bpPending().length; } catch (e) {}
  try { c.proforma = ivRows().filter(function (x) { return x.status === 'issued'; }).length; } catch (e) {}
  try { c.invoices = hspInvRows().length; } catch (e) {}
  return c;
}
function acInvHTML() {
  var R = typeof hspInvRows === 'function' ? hspInvRows() : [];
  if (!R.length) return '<div class="nfo-card"><div class="eq-empty">No receipts yet.</div></div>';
  return '<p class="hsp-note">Every receipt and tax invoice, newest first.</p><div class="nfo-card"><div class="nfo-tw"><table class="nfo-t bz-lt"><thead><tr><th>Paid on</th><th>Facility</th><th>Receipt</th><th>Tax invoice</th><th>Total</th><th></th></tr></thead><tbody>'
    + R.map(function (r, i) {
      var inv = r.invoice || {};
      return '<tr><td data-l="Paid on">' + acE(String(r.paidAt || r.date || '').slice(0, 10)) + '</td><td data-l=""><b>' + acE(r.facilityName || r.code) + '</b><small>' + acE(r.code) + '</small></td>'
        + '<td data-l="Receipt">' + acE(r.receiptNo || '—') + '</td><td data-l="Tax invoice">' + acE(inv.no || '—') + '</td><td data-l="Total">' + acE(typeof nfMoney === 'function' ? nfMoney(r.total) : r.total) + '</td>'
        + '<td data-l="" class="hsp-dl">' + (inv.no ? '<button type="button" class="eq-btn" onclick="hspDoc(' + i + ',\'tax\',this)">Tax invoice</button>' : '') + (r.receiptNo ? '<button type="button" class="eq-btn" onclick="hspDoc(' + i + ',\'rcpt\',this)">Receipt</button>' : '') + '</td></tr>'; }).join('')
    + '</tbody></table></div></div>';
}
function acRender() {
  var app = document.getElementById('ac-app'); if (!app) return;
  var c = acCounts(), t = _ac.t, w = _ac.who || {};
  var body = t === 'confirm' ? (typeof bpHTML === 'function' ? bpHTML() : '') : t === 'proforma' ? (typeof ivAdminHTML === 'function' ? ivAdminHTML() : '') : acInvHTML();
  app.innerHTML = '<header class="ac-top"><div class="ac-brand"><i class="ti ti-currency-rupee"></i><div><b>Payments</b><small>' + acE(w.name || w.id || '') + ' · Accountant</small></div></div>'
    + '<div class="ac-hr"><button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh" onclick="acRefresh()"><i class="ti ti-refresh"></i></button>'
    + '<button type="button" class="hs-btn" onclick="acLogout()"><i class="ti ti-logout"></i> Sign out</button></div></header>'
    + '<main class="ac-main"><div class="hsp-tabs" role="tablist" aria-label="Payments">' + AC_TABS.map(function (x) { var n = c[x[0]], hot = x[0] === 'confirm' && n > 0;
      return '<button type="button" role="tab" aria-selected="' + (t === x[0]) + '" class="' + (t === x[0] ? 'on' : '') + '" onclick="acTab(\'' + x[0] + '\')"><b><span class="ac-l">' + acE(x[1]) + '</span><span class="ac-s">' + acE(x[2]) + '</span> <em class="' + (hot ? 'hot' : '') + '">' + n + '</em></b></button>'; }).join('') + '</div>'
    + '<div class="hsp-body">' + body + '</div>'
    + '<p class="ac-foot">Confirm a payment only after you see the same amount and UTR in the bank account. Confirming unlocks the programme for the facility and issues the receipt and tax invoice.</p></main>';
}
function acTab(t) { _ac.t = t; acRender(); }
async function acRefresh() { await acLoad(); acRender(); showToast('Up to date.', 'ok'); }
async function acOpen(acc) {
  var ls = document.getElementById('login-screen'); if (ls) ls.style.display = 'none';
  var w = acc.rec || (await fbGet('sc_accountants/' + acc.id)) || {};
  _ac.who = { id: acc.id, name: w.name || acc.id }; _ac.t = 'confirm';
  var app = document.getElementById('ac-app'); if (!app) { app = document.createElement('div'); app.id = 'ac-app'; document.body.appendChild(app); }
  app.innerHTML = '<div class="ac-load">Loading payments…</div>'; app.style.display = 'block'; document.body.classList.add('ac-on');
  try { window.scrollTo(0, 0); } catch (e) {}
  await acLoad(); acRender(); return true;
}
async function acLogout() {
  var app = document.getElementById('ac-app'); if (app) { app.style.display = 'none'; app.innerHTML = ''; } document.body.classList.remove('ac-on'); _ac.who = null;
  var ls = document.getElementById('login-screen'); if (ls) ls.style.display = '';
  try { await nfSecureSignOut(); } catch (e) {}
  if (typeof nfRestartAfterSignOut === 'function') nfRestartAfterSignOut(); else try { nfBack(); } catch (e) {}
}

// ── HealSol: Accountants, in Settings → People → HealSol Admins ──
async function acPeopleHTML() {
  var A = {}; try { A = (await fbGet('sc_accountants')) || {}; } catch (e) {}
  var K = Object.keys(A).filter(function (k) { return A[k] && !A[k].disabled; });
  return '<div class="nfs-card" id="ac-people"><h3><i class="ti ti-currency-rupee"></i> Accountants</h3><div class="nfs-sub">An Accountant sees only Payments: confirms bank / UPI payments, views proforma invoices and downloads receipts and tax invoices. No facilities, reports or settings.</div>'
    + K.map(function (k) { var a = A[k] || {}; return '<div class="nfs-row ac-row"><b>' + acE(a.name || k) + '</b><span>' + acE(k) + (a.mobile ? ' · ' + acE(a.mobile) : '') + '</span>'
      + '<button class="scx-btn sm ghost" onclick="nfResetAccount(\'accountant\',\'' + scJs(k) + '\',\'' + scJs(a.name || k) + '\')"><i class="ti ti-key"></i> Reset password</button>'
      + '<button class="scx-btn sm ghost" aria-label="Remove ' + acE(a.name || k) + '" onclick="acRemove(\'' + scJs(k) + '\')"><i class="ti ti-trash"></i></button></div>'; }).join('')
    + '<button class="scx-btn" onclick="acAdd()"><i class="ti ti-user-plus"></i> Add Accountant</button></div>';
}
async function acPeoplePaint() {
  var box = document.getElementById('nf-sec-panel'); if (!box) return;
  var w = document.createElement('div'); w.innerHTML = await acPeopleHTML();
  var old = document.getElementById('ac-people'); if (old) old.replaceWith(w.firstChild);
  else { var first = box.querySelector('.nfs-card'); if (first) first.insertAdjacentElement('afterend', w.firstChild); else box.appendChild(w.firstChild); }
  try { if (typeof hspRender === 'function' && document.getElementById('hs-ppl')) hspRender(); } catch (e) {}
}
async function acAdd() {
  var v = await scDialog({ title: 'Add Accountant', icon: '🧾', okLabel: 'Add', message: 'They will see only Payments and can confirm or reject bank / UPI payments.',
    fields: [{ key: 'id', label: 'Login ID (letters, at least 3)', required: true, placeholder: 'e.g. accounts' }, { key: 'name', label: 'Full name', required: true }, { key: 'mobile', label: 'Mobile (optional, for WhatsApp)', value: '' }] });
  if (!v) return;
  try { var r = await nfCall('createAccount', { kind: 'accountant', id: v.id, name: v.name, mobile: v.mobile }); nfShowTempPassword(v.name, r.identifier, r.tempPassword, 'Accountant added'); acPeoplePaint(); }
  catch (e) { showToast(nfErrText(e), 'err'); }
}
async function acRemove(id) {
  if (!(await showConfirm('Remove Accountant "' + id + '"? They will no longer be able to sign in.', '🗑️', 'Remove', 'Remove', 'var(--red)'))) return;
  try { await nfCall('removeAccount', { kind: 'accountant', key: id }); showToast('Removed.', 'ok'); acPeoplePaint(); } catch (e) { showToast(nfErrText(e), 'err'); }
}

(function () {
  if (typeof nfGo === 'function') { var oGo = nfGo; nfGo = async function (acc) { if (acc && acc.kind === 'accountant') return acOpen(acc); return oGo.apply(this, arguments); }; }
  // HealSol's dashboard refresh reads every facility: not for the Accountant
  if (typeof scRefreshDashboard === 'function') { var oD = scRefreshDashboard; scRefreshDashboard = function () { if (document.body.classList.contains('ac-on')) return; return oD.apply(this, arguments); }; }
  if (typeof bpReview === 'function') { var oR = bpReview; bpReview = async function () { var r = await oR.apply(this, arguments); if (document.body.classList.contains('ac-on')) { try { _nfBd.pays = (await fbGet('sc_payments')) || {}; } catch (e) {} acRender(); } return r; }; }
  // People → HealSol Admins tile counts HealSol Admins only
  if (typeof hspCount === 'function') { var oC = hspCount; hspCount = function (g) { var n = oC.apply(this, arguments); if (g === 'hsa') n -= document.querySelectorAll('#ac-people .nfs-row').length; return Math.max(0, n); }; }
  if (typeof nfRenderSecurityPanel === 'function') { var oS = nfRenderSecurityPanel; nfRenderSecurityPanel = async function () { var r = await oS.apply(this, arguments); try { if (typeof appMode !== 'undefined' && appMode === 'sc-admin') await acPeoplePaint(); } catch (e) { console.warn('[acct] people', e); } return r; }; }
})();
