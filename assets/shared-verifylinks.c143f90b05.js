// ── Verify ↔ Impact (19 Nov 2026; canvas "Impact & Verify pages") ─────────────────────────────────────────────
// Every check result (certificate NQF-…, staff picture IMP-…, facility poster FAC-…) gets, under it:
//   "See NQAS | FAST impact" (thehealsol.com/impact) with the headline number, and "Check another number".
// app.thehealsol.com/?join=1 opens the Join (registration) screen — the Impact page's "Join NQAS | FAST" button.
var NF_IMPACT_URL = (typeof NF_STAGE !== 'undefined' && NF_STAGE) ? location.origin + '/impact/' : 'https://www.thehealsol.com/impact';
var NF_IMPACT_API = 'https://asia-south1-' + ((typeof NF_STAGE !== 'undefined' && NF_STAGE) ? 'healsol-nqas-uphc' : 'healsol-nqas') + '.cloudfunctions.net/impactStats?format=json';
function vlE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function vlIn(n) { try { return Number(n || 0).toLocaleString('en-IN'); } catch (e) { return String(n || 0); } }
function vlOpen(url) { if (typeof nfOpenOut === 'function') return nfOpenOut(url); try { window.open(url, '_blank', 'noopener'); } catch (e) {} return false; }
function vlCheck() {
  var v = String((document.getElementById('vl-n') || {}).value || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!/^(NQF|FAC|IMP)-[A-Z0-9-]{4,30}$/.test(v)) { var e = document.getElementById('vl-err'); if (e) e.textContent = 'Type the number printed under the QR code, e.g. NQF-SC-2026-00001.'; return; }
  location.href = location.pathname + '?cert=' + encodeURIComponent(v);
}
function vlAdd() {
  var pg = document.getElementById('nf-verify'); if (!pg || document.getElementById('vl-box')) return;
  var st = pg.querySelector('.nfv-st'); if (st && /^\s*Checking/.test(st.textContent || '')) return;   // wait for the result ("Checking…" / "Checking certificate NQF-…")
  if (/Checking…/.test(pg.textContent || '') && pg.textContent.length < 40) return;
  var box = document.createElement('div'); box.id = 'vl-box'; box.className = 'vl-box';
  box.innerHTML = '<a class="vl-imp" id="vl-imp" href="' + vlE(NF_IMPACT_URL) + '" target="_blank" rel="noopener" onclick="return vlOpen(this.href)"><span><b>See NQAS | FAST impact</b><small id="vl-num">People, facilities and staff across India</small></span><i class="ti ti-arrow-right" aria-hidden="true"></i></a>'
    + '<div class="vl-chk"><label for="vl-n">Check another number</label><div class="vl-row"><input id="vl-n" type="text" maxlength="40" placeholder="NQF-… · FAC-… · IMP-…" autocapitalize="characters" onkeydown="if(event.key===\'Enter\')vlCheck()"><button type="button" onclick="vlCheck()">Check</button></div><small id="vl-err" class="vl-err" role="alert"></small></div>';
  var foot = pg.querySelector('.nfv-foot'); if (foot) pg.insertBefore(box, foot); else pg.appendChild(box);
  try { fetch(NF_IMPACT_API).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) { if (j && j.people && j.facilities) { var n = document.getElementById('vl-num'); if (n) n.textContent = vlIn(j.people) + ' people in the areas of ' + vlIn(j.facilities) + ' facilities'; } }).catch(function () {}); } catch (e) {}
}
(function () {
  // the check pages build #nf-verify a moment after loading: add the links once the result is there
  try { if (/[?&]cert=/.test(location.search || '')) { var tries = 0, t = setInterval(function () { vlAdd(); if (++tries > 120) clearInterval(t); }, 250); } } catch (e) {}   // keeps checking for 30 s: the result can replace the page after the links were added
  // ?join=1 → the Join screen (only for someone not signed in)
  try {
    if (/[?&]join=1\b/.test(location.search || '')) {
      try { history.replaceState(null, '', location.pathname + (location.hash || '')); } catch (e) {}
      var k = 0, j = setInterval(function () {
        var signed = false; try { signed = !!(typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length && firebase.auth().currentUser); } catch (e) {}
        if (signed || ++k > 60) { clearInterval(j); return; }
        if (typeof jnOpen === 'function' && document.getElementById('nf-login')) { clearInterval(j); jnOpen('who'); }
      }, 250);
    }
  } catch (e) {}
})();
