// ══════════════════════════════════════════════════════════════
// Launch (3 Nov 2026; HealSol: official launch 20 November 2026, registrations open, early-bird for the first 500 facilities)
//   · Login screen: an announcement under "Join NQAS FAST" (Settings → Programme rules → Join screen announcement)
//   · Business: "Early-bird places: X of 500 taken" with sign-ups still waiting
// Stored in shared/sc_signup_config (public read, HealSol write): banner (text; '' hides it), earlyLimit (number).
// ══════════════════════════════════════════════════════════════
var NF_LAUNCH_DEFAULT = '🚀 Official launch: 20 November 2026 · Registrations open now|Early-bird pricing for the first 500 facilities';
var NF_LAUNCH_DEFAULT_HI = '🚀 आधिकारिक लॉन्च: 20 नवंबर 2026 · पंजीकरण अभी खुले हैं|पहले 500 स्वास्थ्य केंद्रों के लिए अर्ली-बर्ड मूल्य';
var _nfLaunch = null;
function nlE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
async function nlCfg(force) {
  if (_nfLaunch && !_nfLaunch.early && !force) return _nfLaunch;
  // 20 Nov 2026: the login screen asked before the database was connected, got nothing and kept the built-in launch text for good.
  // Until the database is ready the answer is only for now (early); the login screen asks again a moment later.
  var ready = typeof db !== 'undefined' && !!db;
  var c = {}; try { c = (ready && (await fbGet('shared/sc_signup_config'))) || {}; } catch (e) {}
  _nfLaunch = { banner: c.banner == null ? NF_LAUNCH_DEFAULT : String(c.banner), limit: parseInt(c.earlyLimit, 10) > 0 ? parseInt(c.earlyLimit, 10) : 500, early: !ready };
  return _nfLaunch;
}
// ── login screen announcement ──
async function nlPaint() {
  var f = document.getElementById('nf-l-form'), hint = document.getElementById('jn-join-s'); if (!f || !hint) return;
  var c0 = await nlCfg(); if (c0.early) { if ((nlPaint._n = (nlPaint._n || 0) + 1) < 40) setTimeout(function () { try { nlPaint(); } catch (e) {} }, 500); return; }   // wait for the database, so the old text never flashes
  var c = c0, box = document.getElementById('nl-banner'), txt = c.banner === NF_LAUNCH_DEFAULT && typeof _appLang !== 'undefined' && _appLang === 'hi' ? NF_LAUNCH_DEFAULT_HI : c.banner, parts = String(txt).replace(/ \| /g, '\u0001').split('|').map(function (s) { return s.replace(/\u0001/g, ' | ').trim(); }).filter(Boolean);   // " | " with spaces (NQAS | FAST) is part of the text; a bare | starts the second line
  if (!parts.length) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement('div'); box.id = 'nl-banner'; box.className = 'nl-banner'; hint.insertAdjacentElement('afterend', box); }
  box.innerHTML = '<span>' + nlE(parts[0]) + '</span>' + (parts[1] ? '<b>' + nlE(parts[1]) + '</b>' : '');
}
(function () { if (typeof jnPaintLogin !== 'function') return; var o = jnPaintLogin;
  jnPaintLogin = function () { var r = o.apply(this, arguments); try { nlPaint(); } catch (e) {} return r; }; })();
try { if (document.readyState !== 'loading') setTimeout(function () { try { nlPaint(); } catch (e) {} }, 800); else document.addEventListener('DOMContentLoaded', function () { setTimeout(function () { try { nlPaint(); } catch (e) {} }, 800); }); } catch (e) {}

// ── Settings → Programme rules: the announcement and the early-bird number ──
function nlSettingsHTML(c) {
  return '<div class="nl-set"><b><i class="ti ti-speakerphone"></i> Join screen announcement</b><p>Shown on the login screen under "Join NQAS FAST". Put a | (no spaces around it) between the first line and the bold second line. Leave it empty to hide it.</p>'
    + '<input class="bp-i" id="nl-banner-i" value="' + nlE(c.banner) + '">'
    + '<label class="bp-l">Early-bird places (Business shows how many are taken)<input class="bp-i" id="nl-limit-i" type="number" min="1" value="' + c.limit + '" style="max-width:160px"></label>'
    + '<div class="iv-acts"><button type="button" class="hs-btn p" onclick="nlSave()">Save</button><button type="button" class="hs-btn" onclick="document.getElementById(\'nl-banner-i\').value=NF_LAUNCH_DEFAULT">Use the launch text</button></div></div>';
}
async function nlSave() {
  var b = String((document.getElementById('nl-banner-i') || {}).value || '').trim().slice(0, 220), l = parseInt((document.getElementById('nl-limit-i') || {}).value, 10);
  if (!(l > 0)) { showToast('Enter the number of early-bird places.', 'err'); return; }
  var cur = {}; try { cur = (await fbGet('shared/sc_signup_config')) || {}; } catch (e) {}
  var ok = await fbSet('shared/sc_signup_config', Object.assign({}, cur, { banner: b, earlyLimit: l })); if (ok === false) return;
  try { if (typeof _hspSU !== 'undefined' && _hspSU) Object.assign(_hspSU, { banner: b, earlyLimit: l }); } catch (e) {}
  _nfLaunch = null; await nlCfg(true); showToast(b ? 'Announcement saved.' : 'Announcement hidden.', 'ok');
}
(function () { if (typeof hspSignupRender !== 'function') return; var o = hspSignupRender;
  hspSignupRender = async function () { var r = await o.apply(this, arguments);
    try { var el = document.getElementById('hs-signup'); if (el && !el.querySelector('.nl-set')) { var c = await nlCfg(true); el.insertAdjacentHTML('beforeend', nlSettingsHTML(c)); } } catch (e) { console.warn('[launch] settings', e); }
    return r; }; })();

// ── Business: early-bird counter ──
function nlTaken() {   // facilities registered in NQAS FAST (enrolled), and sign-ups still waiting for approval
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, n = 0;
  Object.keys(F).forEach(function (k) { var f = F[k] || {}; if (!f.migratedTo && f.active !== false && !f.excludeFromCounts) n++; });
  var L = (typeof _nfBiz !== 'undefined' && _nfBiz && _nfBiz.leads) || {}, w = 0;
  Object.keys(L).forEach(function (k) { var x = L[k] || {}; if (x.source === 'signup' && ['approved', 'declined', 'closed'].indexOf(x.status || 'new') < 0) w++; });
  return { n: n, wait: w };
}
function nlCounterHTML(c) {
  var t = nlTaken(), pct = Math.min(100, Math.round(100 * t.n / c.limit)), left = Math.max(0, c.limit - t.n);
  return '<div class="nfo-card nl-count" id="nl-count"><div class="nl-ch"><div><b>Early-bird places</b><small>' + (left ? left + ' of ' + c.limit + ' still open' : 'All ' + c.limit + ' places taken') + (t.wait ? ' · ' + t.wait + ' sign-up' + (t.wait === 1 ? '' : 's') + ' waiting for approval' : '') + '</small></div><span class="nl-n">' + t.n + '<i> / ' + c.limit + '</i></span></div>'
    + '<div class="nl-bar"><i style="width:' + pct + '%"></i></div>' + (left && left <= 100 ? '<div class="nl-hint">Only ' + left + ' places left — a good moment for a "last places" post.</div>' : '') + '</div>';
}
(function () { if (typeof nfRenderBizDash !== 'function') return; var o = nfRenderBizDash;
  nfRenderBizDash = async function () { var r = await o.apply(this, arguments);
    try { var box = document.getElementById('nf-biz'), old = document.getElementById('nl-count'), c = await nlCfg(true); if (old) old.remove();
      if (box) { var eq = document.getElementById('nf-eq'), w = document.createElement('div'); w.innerHTML = nlCounterHTML(c); if (eq) eq.insertAdjacentElement('beforebegin', w.firstChild); else box.insertBefore(w.firstChild, box.firstChild); } } catch (e) { console.warn('[launch] counter', e); }
    return r; }; })();
