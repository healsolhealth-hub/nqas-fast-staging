// ══════════════════════════════════════════════════════════════
// Offers (3 Nov 2026; HealSol: "offer price — offer name and price, to run an offer or special price again and again")
//   Settings → Pricing → Offers: name, places (e.g. 500), end date, on / off, an offer price per package (blank = regular).
//   One offer is active at a time. Facilities that enrol while it is active keep its price (server: offers.js, payments.js).
//   Unlock card: the offer name, the regular price struck through, the offer price. Business: places used.
// ══════════════════════════════════════════════════════════════
var _of = { all: null, used: {}, edit: null };
function ofE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ofToday() { return new Date(Date.now() + 5.5 * 3600e3).toISOString().slice(0, 10); }
async function ofLoad() { try { _of.all = (await fbGet('shared/sc_offers')) || {}; } catch (e) { _of.all = {}; } return _of.all; }
function ofLive(A) { var t = ofToday(); return Object.keys(A || {}).map(function (k) { return Object.assign({ id: k }, A[k]); }).filter(function (o) { return o.on === true && (!o.until || o.until >= t); }).sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); })[0] || null; }
function ofCount(id) { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}; return Object.keys(F).filter(function (k) { return ((F[k] || {}).offer || {}).id === id; }).length; }
function ofStatus(o) { var t = ofToday(), n = ofCount(o.id), lim = parseInt(o.limit, 10) || 0;
  if (!o.on) return ['Off', 'n']; if (o.until && o.until < t) return ['Ended ' + o.until, 'n']; if (lim && n >= lim) return ['All ' + lim + ' places used', 'n']; return ['Active', 'g']; }

// ── Settings → Pricing → Offers ──
async function ofRender() {
  var host = document.getElementById('pricing-list'); if (!host) return; var card = host.parentNode, box = document.getElementById('of-cfg');
  if (!box) { box = document.createElement('div'); box.id = 'of-cfg'; box.className = 'bp-cfg of-cfg'; card.appendChild(box); }
  await ofLoad(); var L = Object.keys(_of.all).map(function (k) { return Object.assign({ id: k }, _of.all[k]); }).sort(function (a, b) { return String(b.at || '').localeCompare(String(a.at || '')); }), live = ofLive(_of.all);
  box.innerHTML = '<div class="bp-h">🏷️ Offers &amp; special prices ' + (live ? '<span class="bp-tag on">' + ofE(live.name) + ' active</span>' : '<span class="bp-tag">None active</span>') + '</div>'
    + '<div class="bp-sub">An offer gives a special price to the facilities that join while it runs — for example "Early-bird 2026: first 500 facilities". They keep the offer price whenever they pay. One offer runs at a time; it ends by itself at its end date or when its places are used.</div>'
    + (L.length ? '<div class="of-list">' + L.map(function (o) { var s = ofStatus(o), n = ofCount(o.id), lim = parseInt(o.limit, 10) || 0;
      return '<div class="of-r"><div><b>' + ofE(o.name) + '</b><small>' + n + (lim ? ' of ' + lim + ' places' : ' facilities') + (o.until ? ' · until ' + ofE(o.until) : '') + ' · ' + Object.keys(o.prices || {}).filter(function (k) { return Number(o.prices[k]) > 0; }).length + ' offer prices</small></div><span class="eq-st ' + s[1] + '">' + ofE(s[0]) + '</span><button type="button" class="hs-btn" onclick="ofEdit(\'' + o.id + '\')">Edit</button></div>'; }).join('') + '</div>' : '')
    + '<button type="button" class="hs-btn p" onclick="ofEdit(\'\')"><i class="ti ti-plus"></i> New offer</button><div id="of-ed"></div>';
}
async function ofEdit(id) {
  var o = id ? Object.assign({ id: id }, _of.all[id]) : { id: '', name: '', on: true, limit: 500, until: '', prices: {} }, cfg = await phcLoadPricing(true), items = cfg.items || [];
  var tabs = ['sc', 'uphc', 'phc', 'chc'], nm = function (t) { return t === 'sc' ? 'Sub-Centre' : t.toUpperCase(); };
  var rows = tabs.map(function (t) { var its = items.filter(function (it) { return (it.type || 'sc') === t && it.grp !== 'catchup'; }); if (!its.length) return '';
    return '<div class="of-tk">' + nm(t) + '</div>' + its.map(function (it) { var v = (o.prices || {})[it.id];
      return '<div class="of-pr"><span>' + ofE(String(it.label).replace(/^Sub-Centre · /, '')) + '<small>Regular: ' + (it.price != null ? '₹' + it.price : 'not set') + '</small></span><span>₹ <input type="number" min="1" data-of="' + ofE(it.id) + '" value="' + (v > 0 ? v : '') + '" placeholder="Offer price"></span></div>'; }).join(''); }).join('');
  document.getElementById('of-ed').innerHTML = '<div class="of-ed"><div class="bp-k">' + (id ? 'Edit offer' : 'New offer') + '</div>'
    + '<div class="bp-g"><label class="bp-l">Offer name *<input class="bp-i" id="of-n" value="' + ofE(o.name) + '" placeholder="e.g. Early-bird 2026"></label>'
    + '<label class="bp-l">Places (facilities)<input class="bp-i" id="of-l" type="number" min="0" value="' + (o.limit || '') + '" placeholder="e.g. 500 · blank = no limit"></label>'
    + '<label class="bp-l">Ends on<input class="bp-i" id="of-u" type="date" value="' + ofE(o.until || '') + '"></label></div>'
    + '<label class="bp-chk"><input type="checkbox" id="of-on"' + (o.on ? ' checked' : '') + '> Offer is on (new facilities join it)</label>'
    + '<div class="bp-sub">Offer price per package (before GST). Leave a box empty to keep the regular price for that package.</div><div class="of-prs">' + rows + '</div>'
    + (id ? '<div class="bp-k" style="margin-top:12px">Facilities in this offer (' + ofCount(id) + ')</div><div class="of-fac">' + ofFacList(id) + '</div><div class="of-add"><input class="bp-i" id="of-fc" placeholder="Facility ID, e.g. UP-AGR-SC-0001"><button type="button" class="hs-btn" onclick="ofSetFac(document.getElementById(\'of-fc\').value,\'' + id + '\')">Add to this offer</button></div>' : '')
    + '<div class="iv-acts" style="margin-top:12px"><button type="button" class="hs-btn p" onclick="ofSave(\'' + (id || '') + '\')">Save offer</button><button type="button" class="hs-btn" onclick="document.getElementById(\'of-ed\').innerHTML=\'\'">Close</button></div></div>';
}
function ofFacList(id) { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, ks = Object.keys(F).filter(function (k) { return ((F[k] || {}).offer || {}).id === id; });
  if (!ks.length) return '<small class="of-none">None yet — facilities join when they enrol while the offer is on.</small>';
  return ks.slice(0, 200).map(function (k) { var f = F[k] || {}; return '<span class="of-fc">' + ofE(f.name || k) + ' <i>' + ofE(k) + '</i>' + (f.subscriptionStatus === 'paid' ? ' · paid' : '<button type="button" title="Take out of the offer" onclick="ofSetFac(\'' + k + '\',\'\')">×</button>') + '</span>'; }).join(''); }
async function ofSave(id) {
  var v = function (x) { return ((document.getElementById(x) || {}).value || '').trim(); }, name = v('of-n').slice(0, 80); if (!name) { showToast('Give the offer a name.', 'err'); return; }
  var prices = {}; [].forEach.call(document.querySelectorAll('#of-ed [data-of]'), function (i) { var n = Number(i.value); if (n > 0) prices[i.getAttribute('data-of')] = Math.round(n); });
  if (!Object.keys(prices).length) { showToast('Enter at least one offer price.', 'err'); return; }
  var on = !!(document.getElementById('of-on') || {}).checked, key = id || ('O' + Date.now().toString(36));
  var rec = Object.assign({}, id ? _of.all[id] : {}, { name: name, on: on, limit: parseInt(v('of-l'), 10) > 0 ? parseInt(v('of-l'), 10) : null, until: /^\d{4}-\d{2}-\d{2}$/.test(v('of-u')) ? v('of-u') : null, prices: prices, at: (id && _of.all[id].at) || new Date().toISOString(), updatedAt: new Date().toISOString() });
  if (on) { var other = ofLive(_of.all); if (other && other.id !== key) { var ok = await scDialog({ title: 'Switch offers?', icon: '🏷️', okLabel: 'Switch', message: '"' + other.name + '" is active now. Only one offer runs at a time — switch it off and start "' + name + '"?\n\nFacilities already in "' + other.name + '" keep their price.' }); if (!ok) return;
    var o2 = Object.assign({}, _of.all[other.id], { on: false }); if ((await fbSet('shared/sc_offers/' + other.id, o2)) === false) return; } }
  if ((await fbSet('shared/sc_offers/' + key, rec)) === false) return;
  showToast('Offer saved' + (on ? ' — facilities that join now get the offer price.' : ' (off).'), 'ok'); await ofRender(); ofEdit(key);
}
async function ofSetFac(code, offerId) {
  code = String(code || '').trim().toUpperCase(); if (!code) { showToast('Enter the facility ID.', 'err'); return; }
  try { var r = await nfCall('setFacilityOffer', { code: code, offerId: offerId || '' }); if (scMasterFacilities[code]) scMasterFacilities[code].offer = r.offer;
    showToast(offerId ? code + ' added to the offer.' : code + ' taken out of the offer.', 'ok'); var cur = (_of.edit = offerId || (document.querySelector('#of-ed') && _of.edit)); await ofRender(); if (offerId) ofEdit(offerId); }
  catch (e) { showToast(nfErrText(e), 'err'); }
}
(function () { if (typeof adminRenderPricingPanel !== 'function') return; var o = adminRenderPricingPanel;
  adminRenderPricingPanel = async function () { var r = await o.apply(this, arguments); try { await ofRender(); } catch (e) { console.warn('[offers] settings', e); } return r; }; })();

// ── Sub-Centre Unlock card: the server's price (offer price with the regular one struck through) ──
function ofBadge(p) { var M = typeof nfMoney === 'function' ? nfMoney : function (n) { return '₹' + n; };
  return p && p.offer ? '<div class="of-badge">🎉 <b>' + ofE(p.offer.name) + '</b> · your offer price <s>' + M(p.offer.regularTotal) + '</s> <b>' + M(p.total) + '</b> (incl. GST)</div>' : ''; }
(function () { if (typeof renderUpgradeCard !== 'function') return; var o = renderUpgradeCard;
  renderUpgradeCard = async function (container) { var r = await o.apply(this, arguments);
    try { if (window._payCtx || typeof choState === 'undefined' || !choState.facilityCode) return r;
      var pr = (await nfCall('priceFor', { code: choState.facilityCode })).price; if (!pr || !pr.offer) return r;
      var body = container.querySelector('.upgrade-body'), list = document.getElementById('upgrade-pkg-list'); if (!body || !list) return r;
      var pid = (choState.facility || {}).progId || choState.progId; _upgradeSelected = {}; _upgradeSelected[pid] = pr.base;
      var row = list.querySelector('.pkg-item'); if (row && row.lastChild) row.lastChild.innerHTML = '<s style="opacity:.55;font-weight:600;margin-right:6px">₹' + pr.offer.regularBase + '</s>₹' + pr.base;
      list.insertAdjacentHTML('afterbegin', ofBadge(pr)); if (typeof updateUpgradeTotal === 'function') updateUpgradeTotal();
    } catch (e) { console.warn('[offers] card', e); }
    return r; }; })();

// ── Business: places used in the active offer (replaces the fixed early-bird counter when an offer runs) ──
(function () { if (typeof nlCounterHTML !== 'function') return; var o = nlCounterHTML;
  nlCounterHTML = function (c) { var live = _of.all ? ofLive(_of.all) : null; if (!live) return o.apply(this, arguments);
    var n = ofCount(live.id), lim = parseInt(live.limit, 10) || 0, pct = lim ? Math.min(100, Math.round(100 * n / lim)) : 0, left = lim ? Math.max(0, lim - n) : null;
    return '<div class="nfo-card nl-count" id="nl-count"><div class="nl-ch"><div><b>' + ofE(live.name) + '</b><small>' + (lim ? (left ? left + ' of ' + lim + ' places still open' : 'All ' + lim + ' places used') : 'No place limit') + (live.until ? ' · until ' + ofE(live.until) : '') + '</small></div><span class="nl-n">' + n + (lim ? '<i> / ' + lim + '</i>' : '') + '</span></div>'
      + (lim ? '<div class="nl-bar"><i style="width:' + pct + '%"></i></div>' : '') + (left != null && left && left <= 100 ? '<div class="nl-hint">Only ' + left + ' places left — a good moment for a "last places" post.</div>' : '') + '</div>'; }; })();
(function () { if (typeof nfRenderBizDash !== 'function') return; var o = nfRenderBizDash;
  nfRenderBizDash = async function () { try { await ofLoad(); } catch (e) {} return o.apply(this, arguments); }; })();
