// ══════════════════════════════════════════════════════════════
// FACILITY REGISTRY · COVERAGE · MAP (24 Oct 2026, canvas "Facility registry & map", approved).
//   HealSol: Facilities → tabs Enrolled · Registry · Coverage · Map. The registry (sc_registry) holds every facility we know,
//   enrolled or not: type, NIN, name, state, district, block, parent PHC / CHC, GPS, population — by import (Excel / CSV)
//   or by editing a record. Enrolled facilities join their record by code or NIN; PHC / CHC links and sc_units fill gaps.
//   District Admin / MOIC: Enrolled · Coverage · Map, view only (records through the myRegistry function).
//   In-charge (every type): "Use my location" (sc_facilities/{code}/geo) and population, on the phone. The in-charge's
//   location wins over the registry's on the map. Map: OpenStreetMap tiles through Leaflet (loaded when the Map opens);
//   every facility card links to Google Maps.
// ══════════════════════════════════════════════════════════════
var _rg = { tab: 'enrolled', type: '', dist: '', block: '', status: '', q: '', tile: 'all', flat: false, sel: null, R: null, U: null, mine: null, loading: false, err: '',
  imp: null, color: 'status', showNot: true, links: false, pick: null, map: null, covOpen: {}, at: 0, open: {}, show: '', draft: null };
var RG_TYPES = ['sc', 'phc', 'chc', 'uphc'];
var RG_LABEL = { sc: 'SC', phc: 'PHC', chc: 'CHC', uphc: 'UPHC' };
var RG_NAME = { sc: 'Sub-Centre', phc: 'PHC', chc: 'CHC', uphc: 'UPHC' };
var RG_LONG = { sc: 'Sub-Centres', phc: 'Primary Health Centres', chc: 'Community Health Centres', uphc: 'Urban PHCs' };
var RG_LEAFLET = { js: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js', css: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css' };
var RG_POP = { sc: [500, 30000], phc: [5000, 150000], chc: [30000, 600000], uphc: [10000, 200000] };
function rgE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function rgJ(s) { return String(s == null ? '' : s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
function rgNin(x) { return String(x == null ? '' : x).replace(/[^0-9A-Za-z]/g, '').toUpperCase(); }
function rgLow(x) { return String(x == null ? '' : x).trim().toLowerCase(); }
function rgDk(state, district) { return rgLow(state) + '|' + rgLow(district); }
function rgHS() { try { return typeof hsOn === 'function' && hsOn(); } catch (e) { return false; } }
function rgDist() { try { return typeof hsrOn === 'function' && hsrOn() && hsrRole() === 'district'; } catch (e) { return false; } }
// who may change the registry: HealSol, and a District Admin for their own district (27 Oct 2026; the block MOIC view stays view only)
function rgEditor() { return rgHS() || (rgDist() && !!(_rg.mine && _rg.mine.edit)); }
function rgDistEd() { return !rgHS() && rgEditor(); }
function rgAreas() { return (_rg.mine && _rg.mine.areas) || []; }
function rgMyArea(st, di) { return rgAreas().some(function (a) { return rgLow(a.district) === rgLow(di) && (!a.state || !st || rgLow(a.state) === rgLow(st)); }); }
function rgBy() { try { if (typeof nmBy === 'function' && rgHS()) return nmBy(); } catch (e) {} try { return (_scSup && (_scSup.name || _scSup.id)) || 'District Admin'; } catch (e) { return 'District Admin'; } }
function rgFmtN(n) { return n == null ? '' : Number(n).toLocaleString('en-IN'); }
function rgLakh(n) { return n >= 100000 ? (Math.round(n / 10000) / 10) + ' lakh' : rgFmtN(n); }
function rgGmaps(lat, lng) { return 'https://www.google.com/maps/search/?api=1&query=' + lat + ',' + lng; }
function rgTypeOf(v) {
  var x = rgLow(v).replace(/[^a-z]/g, '');
  if (!x) return '';
  if (x === 'sc' || /subcent|subcentre|subcenter|hwcsc|aamsc|^hsc/.test(x)) return 'sc';
  if (/uphc|urbanphc/.test(x)) return 'uphc';
  if (x === 'phc' || /primaryhealth|hwcphc|aamphc|^phc/.test(x)) return 'phc';
  if (x === 'chc' || /communityhealth|^chc/.test(x)) return 'chc';
  return '';
}

// ── data ──
async function rgLoad(force) {
  if (_rg.loading || (!force && _rg.R && Date.now() - _rg.at < 120000)) return;
  _rg.loading = true; _rg.err = '';
  try {
    if (rgHS()) { var a = await Promise.all([fbGet('sc_registry'), fbGet('sc_units')]); _rg.R = a[0] || {}; _rg.U = a[1] || {}; _rg.mine = null; }
    else if (rgDist()) { var r = await nfCall('myRegistry', {}); _rg.R = (r && r.rows) || {}; _rg.U = {}; _rg.mine = r || {}; }
    else { _rg.R = {}; _rg.U = {}; }
    _rg.at = Date.now();
  } catch (e) { console.warn('[RG] load', e); _rg.err = 'Could not load the registry — check the connection.'; _rg.R = _rg.R || {}; _rg.U = _rg.U || {}; }
  _rg.loading = false; rgRender();
  if (_rg.tab === 'enrolled') { try { var bx = rgBox(), tb = bx && bx.querySelector('.rg-tabs'); if (tb) tb.outerHTML = rgTabs(); } catch (e) {} }   // a District Admin's Registry tab appears once we know they may edit
}
function rgInfo(code) { try { return hsInfo(code); } catch (e) { return null; } }
// every facility we know: registry records + enrolled facilities + PHC / CHC units from the links
function rgNodes() {
  var R = _rg.R || {}, U = _rg.U || {}, F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, out = [], byNin = {}, byCode = {};
  Object.keys(R).forEach(function (rid) { var r = R[rid] || {}; if (!r.t || !r.name) return;
    var n = { id: rid, rid: rid, rec: r, t: r.t, nin: rgNin(r.nin), name: r.name, state: r.state || '', district: r.district || '', block: r.block || '', phc: rgNin(r.phc), chc: rgNin(r.chc), code: r.code || '', rlat: r.lat, rlng: r.lng, rpop: r.pop };
    out.push(n); if (n.nin) byNin[n.nin] = n; if (n.code) byCode[n.code] = n; });
  Object.keys(F).forEach(function (code) { var f = F[code]; if (!f || f.migratedTo || f.deleted) return;
    var t = typeof nfTypeOf === 'function' ? nfTypeOf(f) : (f.type || 'sc'), fn = rgNin(f.nin), L = f.links || {};
    var n = byCode[code] || (fn && byNin[fn] && !byNin[fn].f ? byNin[fn] : null);
    if (!n && !fn) { var nk = rgLow(f.name) + '|' + rgDk(f.state, f.district), hits = out.filter(function (x) { return x.rec && !x.f && !x.code && x.t === t && rgLow(x.name) + '|' + rgDk(x.state, x.district) === nk; }); if (hits.length === 1) n = hits[0]; }
    if (!n) { n = { id: 'F:' + code, rid: null, rec: null, t: t, nin: fn, name: f.name || code, state: f.state || '', district: f.district || '', block: '', phc: '', chc: '' }; out.push(n); if (fn) byNin[fn] = n; }
    n.code = code; n.f = f; byCode[code] = n;
    if (!n.state) n.state = f.state || ''; if (!n.district) n.district = f.district || '';
    if (!n.phc && L.phc && L.phc.nin) n.phc = rgNin(L.phc.nin); if (!n.chc && L.chc && L.chc.nin) n.chc = rgNin(L.chc.nin);
    if (!n.block && L.chc && L.chc.block) n.block = L.chc.block;
    if (!n.phc && L.phc && L.phc.nin && !byNin[rgNin(L.phc.nin)]) n._phcName = L.phc.name; });
  Object.keys(U).forEach(function (k) { var u = U[k] || {}, un = rgNin(u.nin || k); if (!un || byNin[un]) return;
    var t = rgLow(u.type) === 'chc' ? 'chc' : 'phc';
    var n = { id: 'U:' + un, rid: null, rec: null, t: t, nin: un, name: u.name || un, state: u.state || '', district: u.district || '', block: u.block || '', phc: '', chc: rgNin(u.chcNin), code: u.facCode || '', unit: u };
    if (n.code && byCode[n.code]) return; out.push(n); byNin[un] = n; });
  out.forEach(function (n) {
    var f = n.f || {}, g = f.geo;
    if (g && g.lat != null && g.lng != null) { n.lat = +g.lat; n.lng = +g.lng; n.gsrc = 'in-charge'; n.gat = g.at; }
    else if (n.rlat != null && n.rlng != null) { n.lat = +n.rlat; n.lng = +n.rlng; n.gsrc = 'registry'; }
    n.pop = f.population && f.population.n ? +f.population.n : (n.rpop ? +n.rpop : null);
    n.info = n.code && n.f ? rgInfo(n.code) : null;
    var R0 = n.rec || {}, nh = f.nhsrc || {};
    n.acc = R0.acc ? +R0.acc : (nh.status === 'certified' ? (+(String(nh.certifiedOn || nh.nationalOn || '').slice(0, 4)) || true) : null);
    n.closed = R0.closed || ''; n.ver = R0.ver || null;
    // details that came from the facility itself (enrolment, its in-charge, a Settings link) and nobody has checked yet
    n.unver = !n.ver && !!(n.code || n.unit || R0.src === 'link');
  });
  var blockOf = function (n, d) { if (n.block) return n.block; if ((d || 0) > 3) return ''; var p = n.t === 'sc' ? (byNin[n.phc] || byNin[n.chc]) : n.t === 'phc' ? byNin[n.chc] : null; return p ? blockOf(p, (d || 0) + 1) : ''; };
  out.forEach(function (n) { n.blk = n.t === 'uphc' ? '' : blockOf(n); n.dk = rgDk(n.state, n.district); });
  out.byNin = byNin;
  return out;
}
function rgStatus(n) {
  if (!n.code) return 'not';
  var o = n.info || {};
  if (o.grad) return o.grad.result === 'ready' ? 'ready' : 'grad';
  if (o.phase === 'notstarted' || !o.phase) return 'start';
  if (o.comp && o.comp.state === 'r') return 'behind';
  if (o.comp && o.comp.state === 'a') return 'slip';
  return 'ok';
}
var RG_ST = { not: ['Not enrolled', '#FFFFFF', '#7A8A85'], start: ['Enrolled, not started', '#3D6FA8', '#FFFFFF'], ok: ['In programme, on track', '#1E6B5E', '#FFFFFF'], slip: ['Slipping', '#D4912A', '#FFFFFF'],
  behind: ['Behind', '#B3402A', '#FFFFFF'], ready: ['Graduated · Ready', '#0B2E28', '#FFFFFF'], grad: ['Graduated · not yet Ready', '#7B5EA7', '#FFFFFF'] };
function rgStatusTxt(n) {
  if (!n.code) return '<span class="rg-dim">Not enrolled</span>';
  var o = n.info || {}, s = rgStatus(n);
  if (s === 'start') return '<b class="rg-en">Enrolled</b> · not started';
  if (s === 'ready' || s === 'grad') return '<b class="rg-en">Enrolled</b> · graduated' + (o.grad && typeof nfResult === 'function' ? '' : '');
  return '<b class="rg-en">Enrolled</b> · Day ' + (o.day || '—') + (s === 'behind' ? ' <span class="rg-tag r">behind</span>' : s === 'slip' ? ' <span class="rg-tag a">slipping</span>' : '');
}

// ── filters ──
function rgScope(nodes) {   // type + district + block + status + search (not the tile)
  var q = rgLow(_rg.q);
  return nodes.filter(function (n) {
    if (_rg.type && n.t !== _rg.type) return false;
    if (!rgIn(n)) return false;
    if (_rg.block && rgLow(n.blk) !== rgLow(_rg.block)) return false;
    if (_rg.status === 'closed') { if (!n.closed) return false; } else if (n.closed) return false;
    if (_rg.status === 'en' && !n.code) return false; if (_rg.status === 'not' && n.code) return false;
    if (q && (n.name + ' ' + n.nin + ' ' + (n.code || '')).toLowerCase().indexOf(q) < 0) return false;
    return true;
  });
}
function rgTileOk(n, k) { return k === 'en' ? !!n.code : k === 'nogps' ? n.lat == null : k === 'nopop' ? !n.pop : k === 'unver' ? n.unver : k === 'noparent' ? (n.t === 'sc' && !n.phc && !n.chc) : true; }
function rgSet(k, v) { _rg[k] = v; if (k === 'dist') { _rg.block = ''; _rg.sel = null; _rg.open = {}; } if (k === 'tab') { _rg.sel = null; _rg.pick = null; } rgRender(); }
function rgQ(v) { _rg.q = v; clearTimeout(window._rgT); window._rgT = setTimeout(function () { rgRender(); var i = document.getElementById('rg-q'); if (i) { i.focus(); try { i.setSelectionRange(i.value.length, i.value.length); } catch (e) {} } }, 250); }

// ── page ──
function rgBox() {
  if (rgHS()) return typeof hsBox === 'function' ? hsBox('hs-fac', 'hsfac') : null;
  if (rgDist()) return typeof hsrBox === 'function' ? hsrBox('hsr-fac', 'facilities') : null;
  return null;
}
function rgTabs() {
  if (rgDist() && !_rg.mine && !_rg.loading && !_rg.R) setTimeout(function () { rgLoad(); }, 0);
  var t = [['enrolled', 'Enrolled']].concat(rgEditor() ? [['registry', 'Registry']] : []).concat([['coverage', 'Coverage'], ['map', 'Map']]);
  return '<div class="rg-tabs" role="tablist" aria-label="Facilities view">' + t.map(function (x) { return '<button type="button" role="tab" aria-selected="' + (_rg.tab === x[0]) + '" class="' + (_rg.tab === x[0] ? 'on' : '') + '" onclick="rgSet(\'tab\',\'' + x[0] + '\')">' + x[1] + '</button>'; }).join('') + '</div>';
}
function rgTypeTabs(nodes) {
  var c = { '': nodes.length }; nodes.forEach(function (n) { c[n.t] = (c[n.t] || 0) + 1; });
  return '<div class="rg-types" role="tablist" aria-label="Facility type">' + [['', 'All']].concat(RG_TYPES.filter(function (t) { return c[t]; }).map(function (t) { return [t, RG_LABEL[t]]; })).map(function (x) {
    return '<button type="button" role="tab" aria-selected="' + (_rg.type === x[0]) + '" class="' + (_rg.type === x[0] ? 'on' : '') + '" onclick="rgSet(\'type\',\'' + x[0] + '\')">' + x[1] + ' <em>' + rgFmtN(c[x[0]] || 0) + '</em></button>'; }).join('') + '</div>';
}
function rgHeadHTML(nodes) {
  var hs = rgHS(), dists = {}; nodes.forEach(function (n) { if (n.district) dists[n.dk] = 1; });
  var ed = rgEditor(), blk = _rg.mine && _rg.mine.scope === 'block';
  var sub = hs ? 'Every facility we know, enrolled or not · HealSol' : blk ? 'Your block · view only' : ed ? 'Your district · you can add and correct facilities' : 'Your district · view only';
  return '<div class="nfo-top rg-top"><div><h1>Facilities</h1><small>' + sub + '</small></div>'
    + (ed ? '<div class="rg-acts"><button type="button" class="hs-btn" onclick="rgDownload()">' + (hs ? 'Download' : 'Download district sheet') + '</button><button type="button" class="hs-btn" onclick="rgImportPick()">' + (hs ? 'Import list' : 'Upload sheet') + '</button>'
      + (hs ? '<button type="button" class="hs-btn" id="rg-apply" onclick="rgApplyTree()" title="Make the logins and links of the chosen district match its registry now (also runs on every save and every night)">Apply links &amp; logins</button>' : '')
      + '<button type="button" class="hs-btn" onclick="rgLogOpen()">' + (hs ? 'Registry changes' : 'Recent changes') + '</button>'
      + '<button type="button" class="hs-btn p" onclick="rgEdit(null)">+ Add facility</button></div>'
      : '<div class="rg-acts">' + (blk ? '<button type="button" class="hs-btn" onclick="rgDownload()">Download block sheet</button>' : '') + '<button type="button" class="hs-btn" onclick="rgLoad(true)">Refresh</button></div>') + '</div>'
    + (_rg.log ? rgLogHTML() : '')
    + '<div class="rg-bar">' + rgTabs() + (_rg.tab !== 'enrolled' && _rg.tab !== 'coverage' ? rgTypeTabs(nodes.filter(function (n) { return _rg.tab === 'coverage' || rgIn(n); })) : '') + '</div>';
}
function rgRender() {
  if (_rg.tab === 'enrolled') return;
  var box = rgBox(); if (!box) return;
  if (!_rg.R) { box.innerHTML = rgHeadHTML([]) + '<div class="nfo-card rg-empty">Loading the registry…</div>'; rgLoad(); return; }
  var nodes = rgNodes();
  if (_rg.dist && !nodes.some(rgIn)) _rg.dist = '';
  if (!_rg.dist) { var c = {}; nodes.forEach(function (n) { if (n.district) c[n.dk] = (c[n.dk] || 0) + 1; }); var best = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0]; if (best && _rg.tab === 'registry') _rg.dist = best; }
  var body = _rg.tab === 'registry' ? rgRegistryHTML(nodes) : _rg.tab === 'coverage' ? rgCoverageHTML(nodes) : rgMapHTML(nodes);
  if (_rg.map && _rg.tab !== 'map') { try { _rg.map.remove(); } catch (e) {} _rg.map = null; }
  box.innerHTML = rgHeadHTML(nodes) + (_rg.err ? '<div class="rg-err">' + rgE(_rg.err) + '</div>' : '') + (_rg.imp ? rgImpHTML(_rg.imp) : '') + body;
  if (_rg.tab === 'map') rgMapDraw(nodes);
}
function rgDistList(nodes) {
  if (!rgHS()) { var D = {}; nodes.forEach(function (n) { if (!n.district || n.closed) return; var d = D[n.dk] = D[n.dk] || { name: n.district, n: 0, b: {} }; d.n++; if (n.blk) d.b[n.blk] = (d.b[n.blk] || 0) + 1; });
    return '<nav class="rg-dl" aria-label="District and blocks">' + Object.keys(D).sort().map(function (k) { var d = D[k];
      return '<div class="rg-cap">' + rgE(d.name) + '</div><button type="button" class="' + (_rg.dist === k && !_rg.block ? 'on' : '') + '" onclick="rgSet(\'block\',\'\');rgSet(\'dist\',\'' + rgJ(k) + '\')"><span>Whole district</span><em>' + d.n + '</em></button>'
        + Object.keys(d.b).sort().map(function (b) { return '<button type="button" class="' + (_rg.dist === k && rgLow(_rg.block) === rgLow(b) ? 'on' : '') + '" onclick="_rg.dist=\'' + rgJ(k) + '\';rgSet(\'block\',\'' + rgJ(b) + '\')"><span>' + rgE(b) + ' block</span><em>' + d.b[b] + '</em></button>'; }).join(''); }).join('') + '</nav>'; }
  var S = {}; nodes.forEach(function (n) { if (!n.district) return; var st = n.state || 'Other'; S[st] = S[st] || {}; S[st][n.dk] = S[st][n.dk] || { name: n.district, n: 0 }; S[st][n.dk].n++; });
  return '<nav class="rg-dl" aria-label="States and districts">' + Object.keys(S).sort().map(function (st) {
    var tot = Object.keys(S[st]).reduce(function (a, k) { return a + S[st][k].n; }, 0), sk = 'S:' + rgLow(st);
    return '<div class="rg-cap">' + rgE(st) + '</div><button type="button" class="rg-whole' + (_rg.dist === sk ? ' on' : '') + '" onclick="rgOpenState(\'' + rgJ(st) + '\')"><span>Whole state</span><em>' + rgFmtN(tot) + '</em></button>' + Object.keys(S[st]).sort(function (a, b) { return S[st][a].name.localeCompare(S[st][b].name); }).map(function (k) {
      return '<button type="button" class="' + (_rg.dist === k ? 'on' : '') + '" onclick="rgSet(\'dist\',\'' + rgJ(k) + '\')"><span>' + rgE(S[st][k].name) + '</span><em>' + S[st][k].n + '</em></button>'; }).join(''); }).join('')
    + (nodes.some(function (n) { return !n.district; }) ? '<div class="rg-cap">No district</div><button type="button" class="' + (_rg.dist === '|' ? 'on' : '') + '" onclick="rgSet(\'dist\',\'|\')"><span>Not set</span><em>' + nodes.filter(function (n) { return !n.district; }).length + '</em></button>' : '') + '</nav>';
}

// ── whole state: State → district → block → CHC → PHC → SC, opened one level at a time (24 Oct 2026) ──
function rgIsState() { return String(_rg.dist || '').indexOf('S:') === 0; }
function rgIn(n) { var d = _rg.dist || ''; if (!d) return true; if (d.indexOf('S:') === 0) return rgLow(n.state) === d.slice(2); return n.dk === d; }
function rgOpenState(state) { _rg.tab = 'registry'; _rg.dist = 'S:' + rgLow(state); _rg.block = ''; _rg.sel = null; _rg.open = {}; _rg.q = ''; _rg.show = ''; rgRender(); }
// what needs a look: a Sub-Centre with no PHC, an enrolled Sub-Centre without its MO / MOIC login, an enrolled facility with no location
function rgAttn(n, byNin) {
  var out = [];
  if (n.t === 'sc' && (!n.phc || !byNin[n.phc]) && !(n.chc && byNin[n.chc])) out.push('no PHC / CHC');
  if (n.code && n.t === 'sc') { var L = (n.f && n.f.links) || {}; if (n.phc && !L.moMobile) out.push('no MO login'); if (n.chc && !L.moicId) out.push('no MOIC login'); }
  if (n.code && n.lat == null) out.push('no location');
  return out;
}
function rgOpenT(k) { _rg.open = _rg.open || {}; _rg.open[k] = !_rg.open[k]; rgRender(); }
function rgOpenAll(keys) { _rg.open = _rg.open || {}; keys.split(',').forEach(function (k) { if (k) _rg.open[k] = true; }); rgRender(); }
function rgStateTree(nodes) {
  var byNin = nodes.byNin || {}, key = String(_rg.dist).slice(2), all = nodes.filter(function (n) { return rgLow(n.state) === key && (!_rg.type || n.t === _rg.type); });
  var q = rgLow(_rg.q), show = _rg.show || '', forced = !!(q || show);
  // search / "needs attention" / "enrolled": keep the matches and the chain above them, all opened
  var keep = null;
  if (forced) { keep = {};
    var hit = function (n) { if (q && (n.name + ' ' + n.nin + ' ' + (n.code || '')).toLowerCase().indexOf(q) < 0) return false;
      if (show === 'attn') return rgAttn(n, byNin).length > 0; if (show === 'en') return !!n.code; if (show === 'not') return !n.code; return true; };
    all.forEach(function (n) { if (!hit(n)) return; keep[n.id] = 1; var p = n.t === 'sc' ? byNin[n.phc] : null, c = byNin[n.t === 'phc' ? n.chc : n.t === 'sc' ? (p && p.chc) || n.chc : ''];
      if (p) keep[p.id] = 1; if (c) keep[c.id] = 1; });
    all = all.filter(function (n) { return keep[n.id]; }); }
  var open = function (k) { return forced || !!(_rg.open || {})[k]; };
  var byName = function (a, b) { return a.name.localeCompare(b.name); };
  var D = {}; all.forEach(function (n) { (D[n.dk] = D[n.dk] || { name: n.district || 'No district', L: [] }).L.push(n); });
  var cnt = function (L) { var c = { chc: 0, phc: 0, sc: 0, uphc: 0, en: 0, at: 0, b: {} }; L.forEach(function (n) { c[n.t]++; if (n.code) c.en++; if (rgAttn(n, byNin).length) c.at++; if (n.blk) c.b[n.blk] = 1; }); c.nb = Object.keys(c.b).length; return c; };
  var under = function (c, withBlocks) { return [withBlocks && c.nb ? c.nb + ' block' + (c.nb === 1 ? '' : 's') : '', c.chc ? c.chc + ' CHC' + (c.chc === 1 ? '' : 's') : '', c.phc ? c.phc + ' PHC' + (c.phc === 1 ? '' : 's') : '', c.sc ? rgFmtN(c.sc) + ' SC' + (c.sc === 1 ? '' : 's') : '', c.uphc ? c.uphc + ' UPHC' + (c.uphc === 1 ? '' : 's') : ''].filter(Boolean).join(' · '); };
  var stat = function (c) { return '<b class="rg-en">' + c.en + ' of ' + rgFmtN(c.chc + c.phc + c.sc + c.uphc) + ' enrolled</b>' + (c.at ? ' · <span class="rg-tag a">' + c.at + ' need' + (c.at === 1 ? 's' : '') + ' a look</span>' : ''); };
  var rows = [], LIMIT = 800, more = 0;
  var grp = function (lvl, k, label, c, withBlocks, all2, cls) { var o = open(k);
    rows.push('<tr class="rg-tg ' + (cls || '') + '"><td style="padding-left:' + (10 + lvl * 22) + 'px"><button type="button" class="rg-car" aria-expanded="' + o + '" onclick="rgOpenT(\'' + rgJ(k) + '\')"><span aria-hidden="true">' + (o ? '▾' : '▸') + '</span>' + label + '</button>'
      + (o && all2 && !forced ? ' <button type="button" class="hs-link rg-xall" onclick="rgOpenAll(\'' + rgJ(all2) + '\')">Expand all</button>' : '') + '</td><td class="rg-dim">' + under(c, withBlocks) + '</td><td>' + stat(c) + '</td></tr>'); return o; };
  var fac = function (lvl, n, k, kids) { if (rows.length > LIMIT) { more++; return false; }
    var o = kids ? open(k) : false, at = rgAttn(n, byNin);
    rows.push('<tr class="rg-r rg-tf' + (_rg.sel === n.id ? ' on' : '') + '" onclick="rgPick(\'' + rgJ(n.id) + '\')"><td style="padding-left:' + (10 + lvl * 22) + 'px">'
      + (kids ? '<button type="button" class="rg-car sm" aria-expanded="' + o + '" aria-label="' + (o ? 'Close' : 'Open') + ' ' + rgE(n.name) + '" onclick="event.stopPropagation();rgOpenT(\'' + rgJ(k) + '\')"><span aria-hidden="true">' + (o ? '▾' : '▸') + '</span></button>' : '<span class="rg-car-sp"></span>')
      + '<span class="rg-ty ' + n.t + '">' + RG_LABEL[n.t] + '</span> <button type="button" class="rg-rb" onclick="event.stopPropagation();rgPick(\'' + rgJ(n.id) + '\')">' + rgE(n.name) + '</button> <small class="rg-dim">' + rgE(n.nin || n.code || '') + '</small>' + rgHeadTag(n) + '</td>'
      + '<td class="rg-dim">' + (kids ? kids : '') + '</td><td>' + rgStatusTxt(n) + at.map(function (x) { return ' <span class="rg-tag a">' + rgE(x) + '</span>'; }).join('') + '</td></tr>'); return o; };
  var sc0 = cnt(all), dks = Object.keys(D).sort(function (a, b) { return D[a].name.localeCompare(D[b].name); });
  var stName = (all[0] || nodes.find(function (n) { return rgLow(n.state) === key; }) || {}).state || key;
  rows.push('<tr class="rg-tg rg-t0"><td><b>' + rgE(stName) + '</b> <small class="rg-dim">' + dks.length + ' district' + (dks.length === 1 ? '' : 's') + '</small></td><td class="rg-dim">' + under(sc0, true) + '</td><td>' + stat(sc0) + '</td></tr>');
  dks.forEach(function (dk) { var L = D[dk].L, c = cnt(L), dkK = 'd:' + dk;
    var B = {}; L.forEach(function (n) { var b = n.t === 'uphc' ? '~urban' : (n.blk || '~none'); (B[b] = B[b] || []).push(n); });
    var bks = Object.keys(B).sort(function (a, b) { var r = function (x) { return x === '~none' ? 2 : x === '~urban' ? 1 : 0; }; return r(a) - r(b) || a.localeCompare(b); });
    var keysIn = [dkK]; bks.forEach(function (b) { keysIn.push('b:' + dk + '|' + b); B[b].forEach(function (n) { keysIn.push('n:' + n.id); }); });
    if (!grp(1, dkK, '<b>' + rgE(D[dk].name) + '</b>', c, true, keysIn.join(','), 'rg-t1')) return;
    bks.forEach(function (b) { var BL = B[b], bk = 'b:' + dk + '|' + b, bc = cnt(BL);
      var label = b === '~none' ? '<span class="rg-warnt">Not linked to a block</span>' : b === '~urban' ? 'Urban (UPHC)' : rgE(b) + ' block';
      var keysB = [bk].concat(BL.map(function (n) { return 'n:' + n.id; })).join(',');
      if (!grp(2, bk, label, bc, false, keysB, 'rg-t2')) return;
      var done = {}, chcs = BL.filter(function (n) { return n.t === 'chc'; }).sort(byName), phcs = BL.filter(function (n) { return n.t === 'phc'; }).sort(byName), scs = BL.filter(function (n) { return n.t === 'sc'; }).sort(byName);
      var scsOf = function (p) { return scs.filter(function (s) { return p.nin && s.phc === p.nin; }); };
      var lone = function (c) { return scs.filter(function (s) { return c.nin && s.chc === c.nin && (!s.phc || !byNin[s.phc]); }); };
      var phcRow = function (p, lvl) { done[p.id] = 1; var S = scsOf(p); if (fac(lvl, p, 'n:' + p.id, S.length ? S.length + ' SC' + (S.length === 1 ? '' : 's') : '')) S.forEach(function (s) { done[s.id] = 1; fac(lvl + 1, s); }); else S.forEach(function (s) { done[s.id] = 1; }); };
      chcs.forEach(function (c) { done[c.id] = 1; var P = phcs.filter(function (p) { return c.nin && p.chc === c.nin; }), Ls = lone(c);
        var kidsTxt = [P.length ? P.length + ' PHC' + (P.length === 1 ? '' : 's') : '', Ls.length ? Ls.length + ' SC' + (Ls.length === 1 ? '' : 's') + ' direct' : ''].filter(Boolean).join(' · ');
        if (fac(3, c, 'n:' + c.id, kidsTxt)) { P.forEach(function (p) { phcRow(p, 4); }); Ls.forEach(function (s) { done[s.id] = 1; fac(4, s); }); }
        else { P.forEach(function (p) { done[p.id] = 1; scsOf(p).forEach(function (s) { done[s.id] = 1; }); }); Ls.forEach(function (s) { done[s.id] = 1; }); } });
      phcs.forEach(function (p) { if (!done[p.id]) phcRow(p, 3); });
      var rest = BL.filter(function (n) { return !done[n.id]; }).sort(byName);
      if (rest.length && (chcs.length || phcs.length) && rows.length <= LIMIT) rows.push('<tr class="rg-sub"><td colspan="3" style="padding-left:' + (10 + 3 * 22) + 'px">Not linked to a PHC · ' + rest.length + '</td></tr>');
      rest.forEach(function (n) { fac(3, n); }); }); });
  if (more) rows.push('<tr class="rg-sub"><td colspan="3">' + rgFmtN(more) + ' more not shown — search, or open one district at a time.</td></tr>');
  return { html: rows.join(''), empty: !all.length };
}

// ── Registry ──
function rgRegistryHTML(nodes) {
  var sc = rgScope(nodes), list = sc.filter(function (n) { return rgTileOk(n, _rg.tile); }), sel = _rg.sel ? nodes.find(function (n) { return n.id === _rg.sel; }) : null;
  var st = rgIsState(), dn = st ? ((nodes.find(rgIn) || {}).state || 'the state') : _rg.dist ? ((nodes.find(function (n) { return n.dk === _rg.dist; }) || {}).district || 'no district') : 'all districts';
  var cnt = { all: sc.length, en: sc.filter(function (n) { return n.code; }).length, nogps: sc.filter(function (n) { return n.lat == null; }).length, nopop: sc.filter(function (n) { return !n.pop; }).length, unver: sc.filter(function (n) { return n.unver; }).length, noparent: sc.filter(function (n) { return rgTileOk(n, 'noparent'); }).length };
  var tile = function (k, l, sub, warn) { return '<button type="button" class="ce-tile' + (warn && cnt[k] ? ' warn2' : '') + (_rg.tile === k ? ' on' : '') + '" aria-pressed="' + (_rg.tile === k) + '" onclick="rgSet(\'tile\',\'' + k + '\')"><span>' + l + '</span><b>' + rgFmtN(cnt[k]) + '</b><small>' + sub + '</small></button>'; };
  var blocks = {}; nodes.forEach(function (n) { if (rgIn(n) && n.blk) blocks[n.blk] = 1; });
  var tree = st && !_rg.flat, T = tree ? rgStateTree(nodes) : null;
  var h = rgSuggestHTML() + '<div class="ce-tiles">' + tile('all', 'In the registry', 'in ' + rgE(dn)) + tile('en', 'Enrolled', cnt.all ? Math.round(100 * cnt.en / cnt.all) + '% of the registry' : '')
    + tile('nogps', 'No location', 'not on the map yet', 1) + tile('nopop', 'No population', 'left out of coverage', 1)
    + tile('noparent', 'SC with no PHC / CHC', 'link them to their parents', 1) + tile('unver', 'Not verified', 'details from the facility itself', 1) + '</div>'
    + (_rg.tile === 'unver' && list.length ? '<div class="rg-verall"><span>' + rgFmtN(list.length) + ' facilit' + (list.length === 1 ? 'y' : 'ies') + ' gave these details themselves (enrolment, their in-charge, a link). Check name, NIN, block, parents, location and population, then verify.</span><button type="button" class="hs-btn p" onclick="rgVerifyMany()">Verify all ' + rgFmtN(list.length) + ' shown</button></div>' : '')
    + '<div class="rg-body' + (sel ? ' has-sel' : '') + '">' + rgDistList(nodes)
    + '<section class="rg-tbl" aria-label="Registry"><div class="rg-filt"><label class="rg-search"><span class="rg-sr">Search</span><input id="rg-q" type="search" placeholder="' + (st ? 'Find a facility in ' + rgE(dn) + ' — opens its chain' : 'Search name, NIN or ID') + '" value="' + rgE(_rg.q) + '" oninput="rgQ(this.value)"></label>'
    + (tree ? '<label>Show<select onchange="rgSet(\'show\',this.value)"><option value="">Everything</option><option value="attn"' + (_rg.show === 'attn' ? ' selected' : '') + '>Needs a look</option><option value="en"' + (_rg.show === 'en' ? ' selected' : '') + '>Enrolled only</option><option value="not"' + (_rg.show === 'not' ? ' selected' : '') + '>Not enrolled</option></select></label>'
        + '<button type="button" class="hs-btn" onclick="_rg.open={};rgRender()">Collapse all</button>'
      : (st ? '' : '<label>Block<select onchange="rgSet(\'block\',this.value)"><option value="">All blocks</option>' + Object.keys(blocks).sort().map(function (b) { return '<option' + (rgLow(_rg.block) === rgLow(b) ? ' selected' : '') + '>' + rgE(b) + '</option>'; }).join('') + '</select></label>')
        + '<label>Status<select onchange="rgSet(\'status\',this.value)"><option value="">Enrolled or not</option><option value="en"' + (_rg.status === 'en' ? ' selected' : '') + '>Enrolled</option><option value="not"' + (_rg.status === 'not' ? ' selected' : '') + '>Not enrolled</option><option value="closed"' + (_rg.status === 'closed' ? ' selected' : '') + '>Closed / merged</option></select></label>')
    + '<label class="rg-sw"><input type="checkbox" ' + (_rg.flat ? 'checked ' : '') + 'onchange="rgSet(\'flat\',this.checked)"> Flat list</label></div>'
    + (tree ? '<div class="rg-scroll rg-tree"><table><thead><tr><th scope="col">State → district → block → CHC → PHC → SC</th><th scope="col">Under it</th><th scope="col">Status</th></tr></thead><tbody>' + T.html + '</tbody></table>'
        + (T.empty ? '<div class="rg-empty">' + (_rg.q || _rg.show ? 'No facility matches.' : 'No facilities in this state yet.') + '</div>' : '') + '</div>'
      : '<div class="rg-scroll"><table><thead><tr><th scope="col">Facility</th><th scope="col">NIN</th><th scope="col">Status</th><th scope="col">Location</th><th scope="col">Population</th></tr></thead><tbody>'
    + rgRowsHTML(list, nodes) + '</tbody></table>' + (list.length ? '' : '<div class="rg-empty">' + (nodes.length ? 'No facility matches.' : 'The registry is empty. Import the district\'s facility list, or add facilities one by one.') + '</div>') + '</div>')
    + '<div class="rg-foot">Pick a row to see and edit the record. Location set by the in-charge on the phone is used first; otherwise the registry\'s.</div></section>'
    + (sel ? '<aside class="rg-side" aria-label="Facility record">' + rgSideHTML(sel, nodes) + '</aside>' : '') + '</div>';
  return h;
}
function rgRow(n, depth) {
  var gps = n.lat != null ? (n.gsrc === 'in-charge' ? 'Set by in-charge' : 'Set') : '<span class="rg-tag a">No location</span>';
  return '<tr class="rg-r' + (_rg.sel === n.id ? ' on' : '') + '" onclick="rgPick(\'' + rgJ(n.id) + '\')"><td style="padding-left:' + (14 + depth * 20) + 'px"><span class="rg-ty ' + n.t + '">' + RG_LABEL[n.t] + '</span> <button type="button" class="rg-rb" onclick="event.stopPropagation();rgPick(\'' + rgJ(n.id) + '\')">' + rgE(n.name) + '</button>' + rgHeadTag(n) + '</td>'
    + '<td class="rg-dim">' + rgE(n.nin || '—') + '</td><td>' + rgStatusTxt(n) + (n.closed ? ' <span class="rg-tag r">' + (n.closed === 'merged' ? 'merged' : 'closed') + '</span>' : '') + (n.unver ? ' <span class="rg-tag a">not verified</span>' : n.ver ? ' <span class="rg-tag g">verified</span>' : '') + (n.acc ? ' <span class="rg-tag g">NQAS ' + (n.acc === true ? '' : n.acc) + '</span>' : '') + '</td><td>' + gps + '</td><td>' + (n.pop ? rgFmtN(n.pop) : '<span class="rg-tag a">Missing</span>') + '</td></tr>';
}
function rgHeadTag(n) { var h = n.rec && n.rec.head, ic = n.info && n.info.inCharge; if (n.t !== 'chc' && n.t !== 'phc') return ''; var nm = (h && (h.name || h.mobile)) || ic;
  return (n.rec && n.rec.bhead ? ' <span class="rg-tag g">Block PHC</span>' : '') + (nm ? ' <small class="rg-dim">' + (n.t === 'chc' ? 'MOIC ' : 'MO ') + rgE(nm) + '</small>' : ' <span class="rg-tag a">no ' + (n.t === 'chc' ? 'MOIC' : 'MO') + '</span>'); }
function rgRowsHTML(list, nodes) {
  if (!list.length) return '';
  var byName = function (a, b) { return a.name.localeCompare(b.name); };
  if (_rg.flat) return list.slice().sort(function (a, b) { return RG_TYPES.indexOf(b.t === 'uphc' ? 'sc' : b.t) - RG_TYPES.indexOf(a.t === 'uphc' ? 'sc' : a.t) || byName(a, b); }).map(function (n) { return rgRow(n, 0); }).join('');
  var inList = {}; list.forEach(function (n) { inList[n.id] = 1; });
  var G = {}, order = []; list.forEach(function (n) { var k = n.t === 'uphc' ? '~urban' : (n.blk || '~none'); if (!G[k]) { G[k] = []; order.push(k); } G[k].push(n); });
  order.sort(function (a, b) { var r = function (k) { return k === '~none' ? 2 : k === '~urban' ? 1 : 0; }; return r(a) - r(b) || a.localeCompare(b); });
  return order.map(function (k) {
    var L = G[k], en = L.filter(function (n) { return n.code; }).length, out = [], done = {};
    var title = k === '~none' ? 'Not linked to a block yet' : k === '~urban' ? 'Urban (UPHC)' : k + ' block';
    var push = function (n, d) { if (done[n.id]) return; done[n.id] = 1; out.push(rgRow(n, d)); };
    var chcs = L.filter(function (n) { return n.t === 'chc'; }).sort(byName), phcs = L.filter(function (n) { return n.t === 'phc'; }).sort(byName), scs = L.filter(function (n) { return n.t === 'sc'; }).sort(byName);
    var scsOf = function (p) { return scs.filter(function (s) { return p.nin && s.phc === p.nin; }); };
    chcs.forEach(function (c) { push(c, 0); phcs.filter(function (p) { return c.nin && p.chc === c.nin; }).forEach(function (p) { push(p, 1); scsOf(p).forEach(function (s) { push(s, 2); }); }); });
    phcs.forEach(function (p) { if (done[p.id]) return; push(p, chcs.length ? 1 : 0); scsOf(p).forEach(function (s) { push(s, chcs.length ? 2 : 1); }); });
    var lone = scs.filter(function (s) { return !done[s.id]; });
    if (lone.length && (chcs.length || phcs.length)) out.push('<tr class="rg-sub"><td colspan="5">Not linked to a PHC · ' + lone.length + '</td></tr>');
    lone.forEach(function (s) { push(s, chcs.length || phcs.length ? 1 : 0); });
    L.filter(function (n) { return !done[n.id]; }).sort(byName).forEach(function (n) { push(n, 0); });
    return '<tr class="rg-grp"><td colspan="5">' + rgE(title) + ' · ' + L.length + ' facilit' + (L.length === 1 ? 'y' : 'ies') + ' · ' + en + ' enrolled</td></tr>' + out.join('');
  }).join('');
}
function rgPick(id) { if (_rg.R && _rg.R.NEW && id !== 'NEW') delete _rg.R.NEW; _rg.draft = null; _rg.sel = _rg.sel === id ? null : id; rgRender(); if (_rg.sel && (window.innerWidth || 1280) < 1180) { var s = document.querySelector('.rg-side'); if (s && s.scrollIntoView) s.scrollIntoView({ block: 'start' }); } }
// form values in the panel survive a redraw (Type change) — kept per record until Save / close
function rgFormVals() { var o = {}; ['t', 'nin', 'name', 'state', 'district', 'block', 'phc', 'chc', 'lat', 'lng', 'pop', 'acc', 'closed', 'hname', 'hmob'].forEach(function (k) { var e = document.getElementById('rg-f-' + k); if (e) o[k] = e.value; });
  var bh = document.getElementById('rg-f-bhead'); if (bh) o.bhead = bh.checked;
  var kids = {}; document.querySelectorAll('.rg-kids input[type=checkbox]').forEach(function (c) { kids[c.value + '|' + c.getAttribute('data-k')] = c.checked; }); o.kids = kids; return o; }
function rgTypeChange(id) { var v = rgFormVals(); _rg.draft = { id: id, v: v }; rgRender(); }
function rgKidsFilter(box, q) { q = rgLow(q); var el = document.getElementById(box); if (!el) return; el.querySelectorAll('label[data-n]').forEach(function (l) { l.style.display = !q || l.getAttribute('data-n').indexOf(q) >= 0 ? '' : 'none'; }); }
// the facilities a PHC / CHC can take under it, in the same district
function rgKidsHTML(n, nodes, kind, d) {
  var byNin = nodes.byNin || {}, me = rgNin(d && d.nin != null ? d.nin : n.nin);
  var cand = nodes.filter(function (x) { if (x.dk !== n.dk || x.id === n.id) return false;
    if (kind === 'sc-phc') return x.t === 'sc';
    if (kind === 'phc-chc') return x.t === 'phc';
    if (kind === 'sc-chc') return x.t === 'sc' && (!x.phc || !byNin[x.phc] || (me && x.chc === me && !x.phc)); return false; });
  var field = kind === 'sc-phc' ? 'phc' : 'chc';
  var title = kind === 'sc-phc' ? 'Linked Sub-Centres' : kind === 'phc-chc' ? 'Linked PHCs' : 'Sub-Centres with no PHC';
  var sub = kind === 'sc-phc' ? 'Tick the Sub-Centres that report to this PHC.' : kind === 'phc-chc' ? 'Tick the PHCs in this block. Their Sub-Centres come with them.' : 'Sub-Centres that report straight to this CHC.';
  var on = function (x) { var k = x.id + '|' + kind; if (d && d.kids && k in d.kids) return d.kids[k]; return !!me && x[field] === me; };
  cand.sort(function (a, b) { return (on(b) - on(a)) || a.name.localeCompare(b.name); });
  var box = 'rg-kids-' + kind;
  var rows = cand.map(function (x) { var other = x[field] && x[field] !== me ? byNin[x[field]] : null;
    return '<label data-n="' + rgE(rgLow(x.name + ' ' + x.nin)) + '"><input type="checkbox" value="' + rgE(x.id) + '" data-k="' + kind + '"' + (on(x) ? ' checked' : '') + '><span>' + rgE(x.name) + (x.code ? ' <em class="rg-en">enrolled</em>' : '')
      + (other ? ' <small class="rg-dim">now under ' + rgE(other.name) + '</small>' : x[field] && x[field] !== me ? ' <small class="rg-dim">now under NIN ' + rgE(x[field]) + '</small>' : '') + '</span></label>'; }).join('');
  return '<div class="rg-kids"><b>' + title + ' <em>' + cand.filter(on).length + ' of ' + cand.length + '</em></b><small class="rg-dim">' + sub + '</small>'
    + (cand.length > 8 ? '<input type="search" placeholder="Find…" aria-label="Find in ' + title + '" oninput="rgKidsFilter(\'' + box + '\',this.value)">' : '')
    + (cand.length ? '<div class="rg-kids-l" id="' + box + '">' + rows + '</div>' : '<small class="rg-dim">None in ' + rgE(n.district || 'this district') + ' yet.</small>') + '</div>';
}
function rgWant(n) { return { phc: rgNin(n.phc), chc: rgNin(n.chc) }; }
function rgSideHTML(n, nodes) {
  var hs = rgHS(), ed = rgEditor(), de = rgDistEd(), rec = n.rec || {}, f = n.f || {}, g = f.geo, I = rgJ(n.id);
  var d = _rg.draft && _rg.draft.id === n.id ? _rg.draft.v : null, t = (d && d.t) || n.t;
  var val = function (k, dv) { return d && k in d ? d[k] : dv; };
  var sameD = nodes.filter(function (x) { return x.dk === n.dk; });
  var opt = function (v, l, cur) { return '<option value="' + rgE(v) + '"' + (String(cur || '') === String(v) ? ' selected' : '') + '>' + rgE(l) + '</option>'; };
  var parents = function (pt, cur) { var L = sameD.filter(function (x) { return x.nin && x.id !== n.id && (x.t === pt || (pt === 'chc' && x.t === 'phc' && x.rec && x.rec.bhead)); }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    return opt('', '— none —', cur) + L.map(function (x) { return opt(x.nin, x.name + (pt === 'chc' && x.t === 'phc' ? ' (Block PHC)' : '') + (x.blk ? ' · ' + x.blk + ' block' : '') + ' · ' + x.nin, cur); }).join('') + (cur && !L.some(function (x) { return x.nin === cur; }) ? opt(cur, 'NIN ' + cur + ' (not in the registry)', cur) : ''); };
  var noNin = function (pt) { var L = sameD.filter(function (x) { return x.t === pt && !x.nin && x.id !== n.id; }); if (!L.length) return '';
    return '<small class="rg-dim rg-nonin">' + rgE(L.map(function (x) { return x.name; }).join(', ')) + (L.length === 1 ? ' has' : ' have') + ' no NIN, so ' + (L.length === 1 ? 'it is' : 'they are') + ' not in this list. Links use the NIN: open ' + (L.length === 1 ? 'it' : 'each') + ', add the NIN and Save, then come back here.</small>'; };
  var ro = !ed, lock = { state: de, district: de, nin: de && !!n.code };
  var inp = function (id, label, v, extra) { v = val(id, v); return '<label>' + label + '<input id="rg-f-' + id + '" ' + (ro || lock[id] ? 'readonly ' : '') + (extra || '') + ' value="' + rgE(v == null ? '' : v) + '"></label>'; };
  var hasNin = !!rgNin(val('nin', n.nin));
  var kids = function (kind) { return hasNin ? rgKidsHTML(n, nodes, kind, d && { nin: d.nin, kids: d.kids }) : '<small class="rg-dim">Enter this ' + RG_NAME[t] + '\'s NIN to link facilities under it.</small>'; };
  var h = '<div class="rg-sh"><span>' + RG_NAME[t] + (n.nin ? ' · ' + rgE(n.nin) : '') + '</span><button type="button" class="ce-x" aria-label="Close" onclick="rgPick(null)">×</button></div>'
    + '<b class="rg-st">' + rgE(n.rid === 'NEW' ? 'New ' + RG_NAME[t] : n.name) + '</b>'
    + (n.code ? '<div class="rg-en-box"><span>' + rgStatusTxt(n) + ' · ' + rgE(n.code) + '</span><button type="button" class="hs-link" onclick="scDrillIn(\'' + rgJ(n.code) + '\')">Open facility</button></div>' : '')
    + (g ? '<div class="rg-geo">Location set by the in-charge on ' + rgE(String(g.at || '').slice(0, 10)) + ': ' + (+g.lat).toFixed(5) + ', ' + (+g.lng).toFixed(5) + (g.acc ? ' (±' + Math.round(g.acc) + ' m)' : '') + ' — used on the map.</div>' : '')
    + (n.lat != null ? '<a class="rg-gm" href="' + rgGmaps(n.lat, n.lng) + '" target="_blank" rel="noopener">Open in Google Maps</a>' : '')
    + '<div class="rg-form">'
    + '<label>Type<select id="rg-f-t"' + (ro || n.code ? ' disabled' : '') + ' onchange="rgTypeChange(\'' + I + '\')">' + RG_TYPES.map(function (x) { return opt(x, RG_NAME[x], t); }).join('') + '</select></label>'
    + inp('nin', 'NIN', n.nin) + inp('name', 'Name', n.rid === 'NEW' ? '' : n.name)
    + '<div class="rg-2">' + inp('state', 'State', n.state) + inp('district', 'District', n.district) + '</div>'
    + inp('block', t === 'uphc' ? 'City / ward' : 'Block', rec.block || n.block || '')
    + (t === 'sc' ? '<label>Parent PHC<select id="rg-f-phc"' + (ro ? ' disabled' : '') + '>' + parents('phc', val('phc', n.phc)) + '</select></label>' + (hs ? noNin('phc') : '') : '')
    + (t === 'sc' || (t === 'phc' && !val('bhead', rec.bhead)) ? '<label>' + (t === 'sc' ? 'Block (CHC or Block PHC)' : 'Under block (CHC or Block PHC)') + '<select id="rg-f-chc"' + (ro ? ' disabled' : '') + '>' + parents('chc', val('chc', n.chc)) + '</select>' + (t === 'sc' ? '<small class="rg-dim">Leave it empty when the PHC is set — the block comes from the PHC.</small>' : '') + '</label>' + (hs ? noNin('chc') : '') : '')
    + (t === 'phc' ? '<label class="rg-chk"><input type="checkbox" id="rg-f-bhead"' + (val('bhead', rec.bhead) ? ' checked' : '') + (ro ? ' disabled' : '') + ' onchange="rgTypeChange(\'' + I + '\')"> This PHC heads its block (Block PHC)</label>' : '')
    + (t === 'chc' || t === 'phc' ? rgHeadFields(n, t, val, ro) : '')
    + (ed && t === 'phc' ? kids('sc-phc') : '')
    + (ed && t === 'chc' ? kids('phc-chc') + (hasNin ? rgKidsHTML(n, nodes, 'sc-chc', d && { nin: d.nin, kids: d.kids }) : '') : '')
    + '<div class="rg-2">' + inp('lat', 'Latitude', n.rlat, 'inputmode="decimal" placeholder="e.g. 25.45210"') + inp('lng', 'Longitude', n.rlng, 'inputmode="decimal" placeholder="e.g. 78.56120"') + '</div>'
    + '<div class="rg-2">' + inp('pop', 'Population', n.rpop || '', 'inputmode="numeric" placeholder="' + (n.pop && !n.rpop ? rgFmtN(n.pop) + ' (from the in-charge)' : t === 'sc' ? 'e.g. 5000' : 'area as per HMIS') + '"')
    + inp('acc', 'NQAS accredited (year)', rec.acc || '', 'inputmode="numeric" placeholder="' + (n.acc === true ? 'certified (NHSRC record)' : n.acc && !rec.acc ? n.acc + ' (NHSRC record)' : 'e.g. 2024') + '"') + '</div>'
    + (!n.code ? '<label>Status<select id="rg-f-closed"' + (ro ? ' disabled' : '') + '>' + opt('', 'Working', val('closed', rec.closed || '')) + opt('closed', 'Closed', val('closed', rec.closed || '')) + opt('merged', 'Merged with another facility', val('closed', rec.closed || '')) + '</select></label>' : '')
    + '</div>'
    + (n.unver ? '<div class="rg-warn rg-verbox"><b>Not verified</b> — these details came from the facility itself (' + (n.code ? 'enrolment and its in-charge' : 'a Settings link') + ').' + (ed ? ' Check them, correct anything wrong, then <button type="button" class="hs-link" onclick="rgSave(\'' + I + '\',true)">Save and verify</button>.' : '') + '</div>'
      : n.ver ? '<small class="rg-dim">Verified by ' + rgE(n.ver.by || '') + ' on ' + rgE(String(n.ver.at || '').slice(0, 10)) + '</small>' : '')
    + rgTreeLoginsHTML(n, nodes)
    + (hs && !n.code && n.rid && n.rid !== 'NEW' ? '<div class="rg-enrol"><button type="button" class="hs-btn" onclick="rgEnrol(\'' + I + '\')">Enrol in NQAS FAST</button><small class="rg-dim">Opens the enrolment with this facility\'s details; it stays this record.</small></div>' : '')
    + (ed ? '<div class="rg-sbtn"><button type="button" class="hs-btn p" id="rg-save" onclick="rgSave(\'' + I + '\')">Save</button>' + (hs && n.rid && n.rid !== 'NEW' && !n.code ? '<button type="button" class="hs-btn" onclick="rgDelete(\'' + I + '\')">Delete</button>' : '') + '</div>'
      + (de ? '<small class="rg-dim">Saved straight away and logged. ' + (n.code && t === 'sc' ? 'Its MO and block view follow at once (the facility tree).' : 'A facility is never deleted — mark it Closed or Merged.') + '</small>' : '')
      + '<small class="rg-dim">' + (n.rid && n.rid !== 'NEW' ? 'In the registry' + (rec.src ? ' · ' + rgE(rec.src === 'import' ? 'imported' : rec.src === 'link' ? 'from a Settings link (before 28 Oct)' : rec.src === 'signup' ? 'from a sign-up' : 'added by hand') : '') + (rec.at ? ' · ' + rgE(String(rec.at).slice(0, 10)) : '') : 'Not in the registry yet — Save adds it') + '</small>'
      + '' : '');
  return h;
}
function rgEdit(id) {
  if (!rgEditor()) return;
  if (id) { _rg.sel = id; rgRender(); return; }
  var n0 = (rgNodes().find(function (n) { return rgIsState() ? rgIn(n) : n.dk === _rg.dist; }) || {}); if (rgIsState()) n0 = { state: n0.state };
  if (rgDistEd() && !rgMyArea(n0.state, n0.district)) { var a0 = rgAreas()[0] || {}; n0 = { state: a0.state || '', district: a0.district || '' }; }
  _rg.R = _rg.R || {}; var rid = 'NEW'; _rg.draft = null;
  _rg.R[rid] = { t: 'sc', name: 'New facility', state: n0.state || '', district: n0.district || '', _new: true };   // always opens as a Sub-Centre
  _rg.tab = 'registry'; _rg.sel = rid; rgRender();
  var nm = document.getElementById('rg-f-name'); if (nm) nm.focus();
}
function rgNum(v) { v = String(v == null ? '' : v).trim().replace(/,/g, ''); if (v === '') return null; var x = +v; return isFinite(x) ? x : NaN; }
function rgRecOf(x) {   // a full registry record for any node (virtual ones get one when they are first linked)
  var r = Object.assign({}, x.rec || {}); delete r._new;
  if (!r.t) r.t = x.t; if (!r.name) r.name = x.name; if (!r.nin && x.nin) r.nin = x.nin; if (!r.state && x.state) r.state = x.state; if (!r.district && x.district) r.district = x.district;
  if (!r.code && x.code) r.code = x.code; if (r.phc == null && x.phc) r.phc = x.phc; if (r.chc == null && x.chc) r.chc = x.chc;
  if (!r.src) r.src = 'manual'; return r;
}
async function rgSave(id, verify) {
  var nodes = rgNodes(), n = nodes.find(function (x) { return x.id === id; }); if (!n) return;
  var v = rgFormVals();
  var rec = Object.assign({}, n.rec || {}); delete rec._new;
  rec.t = v.t || n.t; rec.nin = rgNin(v.nin); rec.name = String(v.name || '').trim(); rec.state = String(v.state || '').trim(); rec.district = String(v.district || '').trim(); rec.block = String(v.block || '').trim();
  rec.phc = rec.t === 'sc' && v.phc !== undefined ? rgNin(v.phc) : ''; rec.chc = (rec.t === 'sc' || rec.t === 'phc') && v.chc !== undefined ? rgNin(v.chc) : '';
  var lat = rgNum(v.lat), lng = rgNum(v.lng), pop = rgNum(v.pop), acc = rgNum(v.acc);
  if (!rec.name) { showToast('Enter the facility name.', 'err'); return; }
  if (acc !== null && (isNaN(acc) || acc < 2000 || acc > 2100)) { showToast('NQAS accredited: the year, like 2024 (or leave it empty).', 'err'); return; }
  if (rgDistEd() && !rgMyArea(rec.state, rec.district)) { showToast('You can add and change facilities of your own district only.', 'err'); return; }
  rec.acc = acc != null ? Math.round(acc) : null; rec.closed = !n.code && (v.closed === 'closed' || v.closed === 'merged') ? v.closed : null;
  var hm = String(v.hmob || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
  if ((rec.t === 'chc' || rec.t === 'phc') && (hm || String(v.hname || '').trim())) { if (!/^[6-9]\d{9}$/.test(hm)) { showToast((rec.t === 'chc' ? 'MOIC' : 'MO in-charge') + ': enter a 10-digit mobile number.', 'err'); return; } rec.head = { name: String(v.hname || '').trim().slice(0, 80) || (rec.t === 'chc' ? 'MOIC' : 'Medical Officer'), mobile: hm }; }
  else if (rec.t === 'chc' || rec.t === 'phc') rec.head = null;
  rec.bhead = rec.t === 'phc' && v.bhead ? true : null; if (rec.bhead) rec.chc = '';
  if ((lat == null) !== (lng == null) || lat !== null && (isNaN(lat) || lat < 6 || lat > 38) || lng !== null && (isNaN(lng) || lng < 68 || lng > 98)) { showToast('Enter both latitude (6–38) and longitude (68–98), or leave both empty.', 'err'); return; }
  if (pop !== null && (isNaN(pop) || pop < 1 || pop > 10000000)) { showToast('Population: a whole number from 1 to 1,00,00,000.', 'err'); return; }
  if (rec.nin && nodes.some(function (x) { return x.id !== n.id && x.nin === rec.nin; })) { showToast('NIN ' + rec.nin + ' already belongs to ' + nodes.find(function (x) { return x.id !== n.id && x.nin === rec.nin; }).name + '.', 'err'); return; }
  rec.lat = lat; rec.lng = lng; rec.pop = pop != null ? Math.round(pop) : null;
  if (n.code) rec.code = n.code;
  var who = rgBy() || 'HealSol', now = new Date().toISOString();
  rec.src = rec.src || 'manual'; rec.at = now; rec.by = who; if (verify) rec.ver = { by: who, at: now };
  var clean = function (r) { Object.keys(r).forEach(function (k) { if (r[k] === '' || r[k] == null) delete r[k]; }); return r; };
  clean(rec);
  var rid = n.rid && n.rid !== 'NEW' ? n.rid : rgNewId(rec.nin), up = {}; up[rid] = rec;
  // facilities ticked / unticked under this PHC / CHC
  var touched = [], me = rec.nin;
  Object.keys(v.kids || {}).forEach(function (k) { var p = k.split('|'), xid = p.slice(0, -1).join('|'), kind = p[p.length - 1], x = nodes.find(function (y) { return y.id === xid; }); if (!x || !me) return;
    var field = kind === 'sc-phc' ? 'phc' : 'chc', isOn = !!v.kids[k], was = x[field] === (rgNin(n.nin) || me) && !!x[field];
    if (isOn === was && !(isOn && x[field] !== me)) return;
    var r = rgRecOf(x); if (isOn) { r[field] = me; if (kind === 'sc-phc' && rec.chc) r.chc = rec.chc; } else if (r[field] === (rgNin(n.nin) || me)) { r[field] = ''; }
    r.at = now; r.by = who; clean(r);
    var xr = x.rid || rgNewId(r.nin, up); up[xr] = r; touched.push({ x: x, rid: xr, rec: r }); });
  // PHCs ticked / unticked under a CHC take their Sub-Centres along
  touched.slice().forEach(function (q) { if (q.rec.t !== 'phc' || !q.rec.nin) return; nodes.forEach(function (x) { if (x.t === 'sc' && x.phc === q.rec.nin && !touched.some(function (z) { return z.x.id === x.id; })) {
    var r = rgRecOf(x); r.chc = q.rec.chc || ''; r.at = now; r.by = who; clean(r); var xr = x.rid || rgNewId(r.nin, up); up[xr] = r; touched.push({ x: x, rid: xr, rec: r }); } }); });
  // a PHC that moves to another CHC takes its Sub-Centres along
  if (rec.t === 'phc' && me && (rgNin(n.chc) !== (rec.chc || ''))) nodes.forEach(function (x) { if (x.t === 'sc' && x.phc === me && !touched.some(function (q) { return q.x.id === x.id; })) {
    var r = rgRecOf(x); r.chc = rec.chc || ''; r.at = now; r.by = who; clean(r); var xr = x.rid || rgNewId(r.nin, up); up[xr] = r; touched.push({ x: x, rid: xr, rec: r }); } });
  var b = document.getElementById('rg-save'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  if (rgDistEd()) {   // District Admin: through the server (own district, enrolled facilities protected, logged)
    var res = null; try { res = await nfCall('distRegistrySave', { rows: up, kind: verify ? 'verify' : 'edit', verify: verify ? [rid] : [] }); } catch (e) { showToast(nfErrText(e), 'err'); }
    if (res) rgAfterTree(res);
    if (!res) { if (b) { b.disabled = false; b.textContent = 'Save'; } return; }
    if (res.errors && res.errors.length) showToast(res.errors.join(' · '), 'err');
    if (res.saved) showToast(rec.name + (verify ? ' saved and verified' : ' saved') + (touched.length ? ' · ' + touched.length + ' linked facilit' + (touched.length === 1 ? 'y' : 'ies') + ' updated' : '') + '.', 'ok');
    delete _rg.R.NEW; _rg.draft = null; _rg.sel = res.saved ? rid : _rg.sel; await rgLoad(true); return rid;
  }
  var ok = false; try { await db.ref('sc_registry').update(up); ok = true; } catch (e) { console.warn('[RG] save', e); }
  if (!ok) { showToast('Could not save — check the connection.', 'err'); if (b) { b.disabled = false; b.textContent = 'Save'; } return; }
  delete _rg.R.NEW; Object.keys(up).forEach(function (k) { _rg.R[k] = up[k]; }); _rg.sel = rid; _rg.draft = null; _rg.dist = rgDk(rec.state, rec.district);
  showToast(rec.name + ' saved' + (touched.length ? ' · ' + touched.length + ' linked facilit' + (touched.length === 1 ? 'y' : 'ies') + ' updated' : '') + '.', 'ok'); rgRender();
  // the tree: block views, MO access and logins follow the registry (28 Oct)
  await rgTreeSync(rec.state, rec.district);
  return rid;
}
// verify every facility shown under "Not verified" (their details as they are)
async function rgVerifyMany() {
  var nodes = rgNodes(), list = rgScope(nodes).filter(function (n) { return n.unver; }); if (!list.length) return;
  if (!(await showConfirm('Mark ' + list.length + ' facilit' + (list.length === 1 ? 'y' : 'ies') + ' as verified? Do this only after checking their details.', '✅', 'Verify', 'Verify ' + list.length))) return;
  var who = rgBy(), now = new Date().toISOString(), up = {}, extra = {};
  list.forEach(function (x) { var r = rgRecOf(x); if (r.lat == null && x.lat != null) { r.lat = x.lat; r.lng = x.lng; } if (r.pop == null && x.pop) r.pop = x.pop; Object.keys(r).forEach(function (k) { if (r[k] === '' || r[k] == null) delete r[k]; });
    r.ver = { by: who, at: now }; r.at = now; r.by = who; var rid = x.rid || rgNewId(r.nin, extra); extra[rid] = 1; up[rid] = r; });
  var keys = Object.keys(up), done = 0, errs = [];
  if (rgDistEd()) { var batch = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    for (var i = 0; i < keys.length; i += 400) { var part = {}; keys.slice(i, i + 400).forEach(function (k) { part[k] = up[k]; });
      try { var r = await nfCall('distRegistrySave', { rows: part, kind: 'verify', batch: batch, verify: Object.keys(part) }); done += r.saved || 0; errs = errs.concat(r.errors || []); } catch (e) { errs.push(nfErrText(e)); break; } } }
  else { try { await db.ref('sc_registry').update(up); done = keys.length; } catch (e) { errs.push('Could not save — check the connection.'); } }
  if (done) showToast(done + ' verified.', 'ok'); if (errs.length) showToast(errs.slice(0, 4).join(' · ') + (errs.length > 4 ? ' …' : ''), 'err');
  _rg.tile = 'all'; await rgLoad(true);
}
// ── change log: District Admin sees their district's recent changes; HealSol sees all and can undo a whole save / upload ──
async function rgLogOpen() {
  if (_rg.log) { _rg.log = null; rgRender(); return; }
  _rg.log = { loading: true }; rgRender();
  try {
    if (rgHS()) { var L = (await fbGet('sc_registry_log')) || {}, out = [];
      Object.keys(L).forEach(function (b) { var parts = L[b] || {}, g = null; Object.keys(parts).forEach(function (k) { var x = parts[k] || {};
        g = g || { batch: b, kind: x.kind, at: x.at, by: x.byName || x.by, district: x.district, state: x.state, n: 0, undone: true }; g.n += x.n || 0; if (!x.undone) g.undone = false; if (String(x.at) > String(g.at)) g.at = x.at; }); if (g) out.push(g); });
      out.sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }); _rg.log = { rows: out.slice(0, 60) }; }
    else { await rgLoad(true); var G = {}; ((_rg.mine && _rg.mine.logs) || []).forEach(function (x) { var g = G[x.batch] = G[x.batch] || { batch: x.batch, kind: x.kind, at: x.at, by: x.by, district: x.district, n: 0, undone: true }; g.n += x.n || 0; if (!x.undone) g.undone = false; });
      _rg.log = { rows: Object.keys(G).map(function (k) { return G[k]; }).sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); }) }; }
  } catch (e) { _rg.log = { rows: [], err: 'Could not load the changes.' }; }
  rgRender();
}
function rgLogHTML() {
  var L = _rg.log || {}, hs = rgHS(), K = { edit: 'Edited', upload: 'Uploaded a sheet', verify: 'Verified' };
  return '<div class="nfo-card rg-log"><div class="rg-imp-h"><b>' + (hs ? 'Registry changes by District Admins' : 'Recent changes in your district') + '</b><button type="button" class="ce-x" aria-label="Close" onclick="rgLogOpen()">×</button></div>'
    + (L.loading ? '<small class="rg-dim">Loading…</small>' : !(L.rows || []).length ? '<small class="rg-dim">' + (L.err || 'No changes yet.') + '</small>'
      : '<div class="rg-scroll"><table><thead><tr><th scope="col">When</th><th scope="col">Who</th><th scope="col">District</th><th scope="col">What</th><th scope="col">Facilities</th>' + (hs ? '<th scope="col"></th>' : '') + '</tr></thead><tbody>'
        + L.rows.map(function (x) { return '<tr><td>' + rgE(String(x.at || '').slice(0, 16).replace('T', ' ')) + '</td><td>' + rgE(x.by || '') + '</td><td>' + rgE(x.district || '') + '</td><td>' + rgE(K[x.kind] || x.kind || '') + (x.undone ? ' <span class="rg-tag r">undone</span>' : '') + '</td><td>' + rgFmtN(x.n) + '</td>'
          + (hs ? '<td>' + (x.undone ? '' : '<button type="button" class="hs-link" onclick="rgUndo(\'' + rgJ(x.batch) + '\')">Undo</button>') + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table></div>')
    + (hs ? '' : '<small class="rg-dim">Saved changes show at once. HealSol can undo a save if something went wrong.</small>') + '</div>';
}
async function rgUndo(batch) {
  if (!rgHS()) return;
  if (!(await showConfirm('Put every facility of this change back as it was before? A facility changed again since is left as it is.', '↩️', 'Undo change', 'Undo', 'var(--red)'))) return;
  try { var r = await nfCall('undoRegistryBatch', { batch: batch }); showToast(r.restored + ' put back' + (r.skipped ? ' · ' + r.skipped + ' changed again since, left as they are' : '') + '.', 'ok'); }
  catch (e) { showToast(nfErrText(e), 'err'); return; }
  _rg.log = null; await rgLoad(true); await rgLogOpen();
}
// ── the person who heads a CHC (MOIC) / PHC (MO in-charge): their login comes from here (28 Oct 2026) ──
function rgHeadFields(n, t, val, ro) {
  var h = (n.rec && n.rec.head) || {}, ic = n.info && n.info.inChargeMob ? { name: n.info.inCharge, mobile: n.info.inChargeMob } : null;
  var lab = t === 'chc' ? 'MOIC' : 'MO in-charge', I = function (id, l, v, ph, extra) { return '<label>' + l + '<input id="rg-f-' + id + '" ' + (ro ? 'readonly ' : '') + (extra || '') + ' value="' + rgE(v == null ? '' : v) + '" placeholder="' + rgE(ph || '') + '"></label>'; };
  return '<div class="rg-head"><b>' + lab + (t === 'chc' || val('bhead', n.rec && n.rec.bhead) ? ' · gets the block view' : ' · sees this PHC\'s Sub-Centres') + '</b>'
    + '<div class="rg-2">' + I('hname', 'Name', val('hname', h.name || ''), ic ? ic.name + ' (in-charge)' : 'e.g. Dr Verma') + I('hmob', 'Mobile', val('hmob', h.mobile || ''), ic ? ic.mobile + ' (in-charge)' : '10-digit mobile', 'inputmode="tel"') + '</div>'
    + '<small class="rg-dim">' + (ic ? 'Left empty, the enrolled facility\'s in-charge (' + rgE(ic.name || ic.mobile) + ') is the ' + lab + '. ' : '') + 'Saving makes or moves their login; a new one-time password is shown once.</small></div>';
}
// who has a login through this record (read only — everything comes from the tree)
function rgTreeLoginsHTML(n, nodes) {
  if (!n.code || n.t !== 'sc') return '';
  var L = (n.f && n.f.links) || {};
  return '<div class="rg-logins"><b>Who sees this Sub-Centre</b><span>' + (L.moMobile ? 'MO: ' + rgE(L.moName || 'Medical Officer') + ' (' + rgE(L.moMobile) + ')' : 'No MO yet — set the PHC and its MO in-charge') + '</span><span>' + (L.moicId ? 'Block view: ' + rgE(L.moicId) : 'No block view yet — set the block (CHC) and its MOIC') + '</span></div>';
}
// HealSol "Apply links & logins" (28 Oct 2026): run the tree for the district chosen on the left, without saving a record
async function rgApplyTree() {
  var n = rgNodes().filter(function (x) { return x.dk === _rg.dist && x.district; })[0];
  if (!n) { scAlert('Pick a district on the left first (not the whole state).', 'Apply links & logins', 'ℹ️'); return; }
  var ok = await scDialog({ title: 'Apply links & logins', icon: '🔗', okLabel: 'Apply', message: 'Make the block logins, MO logins and links of ' + n.district + ' match the registry now?\n\nThis also runs on every save and every night. New logins show their one-time password.' });
  if (!ok) return;
  var b = document.getElementById('rg-apply'); if (b) { b.disabled = true; b.textContent = 'Applying…'; }
  var r = await rgTreeSync(n.state, n.district);
  if (r) showToast(n.district + ': links and logins match the registry' + ((r.accounts || []).length ? ' · ' + r.accounts.length + ' new login' + (r.accounts.length === 1 ? '' : 's') : '') + '.', 'ok');
  var b2 = document.getElementById('rg-apply'); if (b2) { b2.disabled = false; b2.textContent = 'Apply links & logins'; }
}
async function rgTreeSync(state, district) {
  if (!district) return null; var r = null;
  try { r = await nfCall('syncTree', { state: state || '', district: district }); } catch (e) { showToast('Saved. Logins will follow tonight (' + nfErrText(e) + ').', 'err'); return null; }
  if (rgHS()) { try { await rgRefreshLinks(Object.keys((typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}).filter(function (c) { var f = scMasterFacilities[c] || {}; return rgLow(f.district) === rgLow(district); })); } catch (e) {} }
  rgAfterTree(r || {}); rgRender(); return r;
}
// new logins (one-time passwords) and anything the tree could not decide
async function rgAfterTree(r) {
  var acc = (r && r.accounts) || [], con = (r && r.conflicts) || [];
  if (con.length) scAlert(con.map(function (c) { return '• ' + c.msg; }).join('\n') + '\n\nCorrect the NIN on the facility or in the registry, then save again.', 'Needs a decision', '⚠️');
  var T = { block: 'Block view login', moic: 'MOIC — sign-in with their mobile', mo: 'MO — sign-in with their mobile' };
  for (var i = 0; i < acc.length; i++) { var a = acc[i]; nfShowTempPassword(a.name || a.id, a.id, a.tempPassword, (T[a.kind] || 'New login') + (a.block ? ' · ' + a.block + ' block' : a.phc ? ' · ' + a.phc : ''));
    await new Promise(function (res) { var t = setInterval(function () { if (!document.getElementById('nf-tmp-ov')) { clearInterval(t); res(); } }, 300); }); }
}
// HealSol: enrol a facility from its row — the enrolment form already filled; the facility stays this record
async function rgEnrol(id) {
  var n = rgNodes().find(function (x) { return x.id === id; }); if (!n || n.code || !rgHS()) return;
  var LV = NF_LEVELS[n.t] || {}, h = (n.rec && n.rec.head) || {}, progs = (LV.programmes || []).map(function (p) { return { value: p.id, label: p.label }; });
  var f = [{ type: 'info', value: RG_NAME[n.t] + ' · ' + n.name + (n.nin ? ' · NIN ' + n.nin : '') + ' · ' + [n.blk ? n.blk + ' block' : '', n.district, n.state].filter(Boolean).join(', ') },
    { key: 'choName', label: (LV.inChargeLabel || 'In-charge') + ' — name', value: h.name || '' }, { key: 'choMobile', label: (LV.inChargeLabel || 'In-charge') + ' — mobile', type: 'tel', value: h.mobile || '', required: true },
    { key: 'progId', label: 'Programme', type: 'select', value: (progs[0] || {}).value, options: progs }, { key: 'access', label: 'Access', type: 'select', value: 'contract', options: [{ value: 'contract', label: 'Contract (full access)' }, { value: 'trial', label: 'Trial' }] }];
  if (n.t === 'chc') f.push({ key: 'chcKind', label: 'CHC kind', type: 'select', value: 'fru', options: [{ value: 'fru', label: 'CHC (FRU)' }, { value: 'nonfru', label: 'CHC (Non-FRU)' }] });
  var v = await scDialog({ title: 'Enrol ' + n.name, icon: '🏥', okLabel: 'Enrol', fields: f, validate: function (x) { return /^\d{10}$/.test(String(x.choMobile || '').replace(/\D/g, '').slice(-10)) ? null : 'Enter the 10-digit mobile number.'; } });
  if (!v) return;
  var r = null; try { r = await nfCall('enrollFacility', { rid: n.rid, type: n.t, name: n.name, state: n.state, district: n.district, nin: n.nin || '', choName: v.choName || LV.inChargeLabel, choMobile: String(v.choMobile).replace(/\D/g, '').slice(-10), progId: v.progId, access: v.access, chcKind: v.chcKind }); }
  catch (e) { showToast(nfErrText(e), 'err'); return; }
  showToast(n.name + ' enrolled as ' + r.code + '.', 'ok');
  if (r.tempPassword) { nfShowTempPassword(v.choName || LV.inChargeLabel, r.identifier, r.tempPassword, n.name + ' — ' + (LV.inChargeLabel || 'in-charge') + ' login'); await new Promise(function (res) { var t = setInterval(function () { if (!document.getElementById('nf-tmp-ov')) { clearInterval(t); res(); } }, 300); }); }
  try { if (typeof scLoadMasterData === 'function') await scLoadMasterData(); } catch (e) {}
  await rgAfterTree(r); _rg.at = 0; await rgLoad(true);
}
// facilities' own "Suggest my PHC / CHC" (CHO on the phone) — HealSol / the District Admin accept here
function rgSuggestions() {
  if (rgHS()) { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}; return Object.keys(F).filter(function (c) { return F[c] && F[c].linkProposal && !F[c].migratedTo; }).map(function (c) { var p = F[c].linkProposal; return { code: c, name: F[c].name || c, district: F[c].district || '', phc: p.phc, chc: p.chc, by: p.proposedBy || '' }; }); }
  return (_rg.mine && _rg.mine.suggest) || [];
}
function rgSuggestHTML() {
  var L = rgSuggestions(); if (!L.length) return '';
  return '<div class="nfo-card rg-sug"><b>Suggested by facilities · ' + L.length + '</b><small class="rg-dim">A CHO picked their PHC / block. Accept puts it in the tree (and gives the MO / MOIC access); Turn down clears it.</small>'
    + L.map(function (x) { return '<div class="rg-sugr"><span><b>' + rgE(x.name) + '</b> → ' + [x.phc && x.phc.name ? 'PHC ' + rgE(x.phc.name) : '', x.chc && x.chc.name ? rgE(x.chc.name) + (x.chc.block ? ' (' + rgE(x.chc.block) + ')' : '') : ''].filter(Boolean).join(' · ') + (x.by ? ' <small class="rg-dim">by ' + rgE(x.by) + '</small>' : '') + '</span>'
      + '<button type="button" class="hs-btn p" onclick="rgSuggest(\'' + rgJ(x.code) + '\',true)">Accept</button><button type="button" class="hs-btn" onclick="rgSuggest(\'' + rgJ(x.code) + '\',false)">Turn down</button></div>'; }).join('') + '</div>';
}
async function rgSuggest(code, yes) {
  var r = null; try { r = await nfCall('acceptSuggestion', { code: code, accept: !!yes }); } catch (e) { showToast(nfErrText(e), 'err'); return; }
  try { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}; if (F[code]) delete F[code].linkProposal; } catch (e) {}
  showToast(yes ? 'Accepted — in the tree.' : 'Turned down.', 'ok'); await rgAfterTree(r || {}); _rg.at = 0; await rgLoad(true);
}
function rgNewId(nin, extra) { var R = _rg.R || {}, X = extra || {}; if (nin && !R['N' + nin] && !X['N' + nin]) return 'N' + nin; var id; do { id = 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); } while (R[id] || X[id]); return id; }

// the HealSol facility list is read once at sign-in: refresh the links of the facilities just changed
async function rgRefreshLinks(codes) { var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, U = await Promise.all(codes.map(function (c) { return fbGet('sc_facilities/' + c + '/links').catch(function () { return undefined; }); }));
  codes.forEach(function (c, i) { if (F[c] && U[i] !== undefined) { if (U[i]) F[c].links = U[i]; else delete F[c].links; } });
  try { var u = await fbGet('sc_units'); if (u) _rg.U = u; } catch (e) {} }
async function rgDelete(id) {
  var n = rgNodes().find(function (x) { return x.id === id; }); if (!n || !n.rid || n.code) return;
  if (!(await showConfirm('Delete ' + n.name + ' from the registry? Enrolled facilities are not affected.', '🗑️', 'Delete from the registry', 'Delete', 'var(--red)'))) return;
  if (n.rid === 'NEW') { delete _rg.R.NEW; _rg.sel = null; rgRender(); return; }
  if (await fbSet('sc_registry/' + n.rid, null)) { delete _rg.R[n.rid]; _rg.sel = null; showToast('Deleted from the registry.', 'ok'); rgRender(); }
}

// ── Coverage (27 Oct 2026, HealSol: "District name · State name", then one line per type) ──
//   Type · Total · Enrolled in FAST · NQAS accredited · Population served · % of population with quality care.
//   Population served = the population of every facility of that type we know (enrolled or not; the in-charge's figure
//   first, else the registry's). Quality care = the share of it served by an NQAS-accredited facility. The types overlap
//   (a Sub-Centre's area is inside its PHC's, which is inside the CHC's block), so the lines are never added up.
//   District Admin: their district (no state row) and its blocks · MOIC: their block · HealSol: all states → state → district → block.
function rgCovStats(L) {
  var S = { t: {}, n: 0, en: 0, acc: 0, ready: 0, nopop: 0, nogps: 0, noparent: 0, unver: 0 };
  RG_TYPES.forEach(function (t) { S.t[t] = { n: 0, en: 0, acc: 0, pop: 0, popN: 0, qpop: 0 }; });
  L.forEach(function (n) { if (n.closed) return; var T = S.t[n.t]; if (!T) return;
    T.n++; S.n++; if (n.code) { T.en++; S.en++; } if (n.acc) { T.acc++; S.acc++; }
    if (n.pop) { T.pop += n.pop; T.popN++; if (n.acc) T.qpop += n.pop; } else S.nopop++;
    if (n.lat == null) S.nogps++; if (n.t === 'sc' && !n.phc && !n.chc) S.noparent++; if (n.unver) S.unver++; if (rgStatus(n) === 'ready') S.ready++; });
  var P = { pop: S.t.sc.pop + S.t.uphc.pop, qpop: S.t.sc.qpop + S.t.uphc.qpop }; S.prim = P;   // Sub-Centre + UPHC areas do not overlap
  return S;
}
function rgPct(a, b) { return b ? Math.round(100 * a / b) : null; }
function rgCovTypes(S, types) {
  var row = function (t) { var T = S.t[t], p = rgPct(T.en, T.n), q = rgPct(T.qpop, T.pop);
    return '<tr><th scope="row"><b>' + RG_LABEL[t] + '</b><small>' + RG_LONG[t] + '</small></th><td data-l="Total"><b>' + rgFmtN(T.n) + '</b></td>'
      + '<td data-l="Enrolled in FAST">' + (T.n ? '<b>' + rgFmtN(T.en) + '</b> <small>' + p + '%</small><div class="rg-barx"><i style="width:' + p + '%"></i></div>' : '<span class="rg-dim">—</span>') + '</td>'
      + '<td data-l="NQAS accredited">' + (T.n ? '<b>' + rgFmtN(T.acc) + '</b>' + (T.acc ? ' <small>' + rgPct(T.acc, T.n) + '%</small>' : '') : '<span class="rg-dim">—</span>') + '</td>'
      + '<td data-l="Population served">' + (T.pop ? '<b>' + rgLakh(T.pop) + '</b>' + (T.popN < T.n ? '<small>' + T.popN + ' of ' + T.n + ' have a population</small>' : '') : '<span class="rg-dim">' + (T.n ? 'no population yet' : '—') + '</span>') + '</td>'
      + '<td data-l="% with quality care">' + (T.pop ? '<b>' + q + '%</b><small>' + rgLakh(T.qpop) + ' people</small>' : '<span class="rg-dim">—</span>') + '</td></tr>'; };
  return '<div class="rg-scroll"><table class="rg-ctab"><thead><tr><th scope="col">Type</th><th scope="col">Total</th><th scope="col">Enrolled in FAST</th><th scope="col">NQAS accredited</th><th scope="col">Population served</th><th scope="col">% of population with quality care</th></tr></thead><tbody>'
    + types.map(row).join('') + '</tbody></table></div>';
}
function rgGoTile(k) { _rg.tile = k; _rg.status = ''; _rg.q = ''; rgSet('tab', 'registry'); }
function rgCovCard(title, sub, L, opt) {
  opt = opt || {}; var S = rgCovStats(L), types = ['chc', 'phc', 'sc', 'uphc'].filter(function (t) { return t !== 'uphc' || (!opt.block && S.t.uphc.n); });
  var ed = rgEditor(), chip = function (k, n, l) { if (!n) return ''; return ed ? '<button type="button" class="rg-chip" onclick="rgGoTile(\'' + k + '\')">' + rgFmtN(n) + ' ' + l + '</button>' : '<span class="rg-chip">' + rgFmtN(n) + ' ' + l + '</span>'; };
  var att = chip('nopop', S.nopop, 'with no population') + chip('nogps', S.nogps, 'with no location') + chip('noparent', S.noparent, 'SCs with no PHC / CHC') + chip('unver', S.unver, 'not verified');
  var q = rgPct(S.prim.qpop, S.prim.pop);
  return '<section class="nfo-card rg-ccard"><div class="rg-chead"><div><h2>' + rgE(title) + '</h2><small>' + rgE(sub) + '</small></div>' + (opt.back ? '<button type="button" class="hs-link" onclick="' + opt.back + '">‹ Back</button>' : '') + '</div>'
    + '<div class="rg-kpis"><div class="rg-kpi hero"><small>Enrolled in FAST</small><b>' + rgFmtN(S.en) + ' of ' + rgFmtN(S.n) + '</b><small>' + (S.n ? rgPct(S.en, S.n) + '% of the facilities we know' : 'no facilities yet') + '</small></div>'
    + '<div class="rg-kpi"><small>NQAS accredited</small><b>' + rgFmtN(S.acc) + '</b><small>' + (S.n ? rgPct(S.acc, S.n) + '% of all facilities' : '') + '</small></div>'
    + '<div class="rg-kpi"><small>Population with quality care</small><b>' + (q == null ? '—' : q + '%') + '</b><small>' + (S.prim.pop ? rgLakh(S.prim.qpop) + ' of ' + rgLakh(S.prim.pop) + ' (Sub-Centre and UPHC areas)' : 'add population') + '</small></div>'
    + '<div class="rg-kpi"><small>NQAS Ready in FAST</small><b>' + rgFmtN(S.ready) + '</b><small>graduated "Ready"</small></div></div>'
    + rgCovTypes(S, types)
    + (att ? '<div class="rg-att"><b>Needs attention</b>' + att + (ed ? '' : '<small class="rg-dim">Ask your District Admin to add these.</small>') + '</div>' : '')
    + (opt.extra || '') + '</section>';
}
function rgCovBlocks(L, dkey) {
  var B = {}; L.forEach(function (n) { if (n.closed || n.t === 'uphc') return; var b = n.blk || '~none'; (B[b] = B[b] || []).push(n); });
  var ks = Object.keys(B).sort(function (a, b) { return (a === '~none') - (b === '~none') || a.localeCompare(b); }); if (!ks.length) return '';
  return '<div class="rg-cap">Blocks</div><div class="rg-bgrid">' + ks.map(function (b) { var S = rgCovStats(B[b]), q = rgPct(S.prim.qpop, S.prim.pop);
    var line = ['chc', 'phc', 'sc'].filter(function (t) { return S.t[t].n; }).map(function (t) { return RG_LABEL[t] + ' ' + S.t[t].en + '/' + S.t[t].n; }).join(' · ');
    return '<button type="button" class="rg-bc' + (S.en ? '' : ' none') + '" onclick="_rg.covBlock=\'' + rgJ(dkey + '|' + b) + '\';rgRender()"><b>' + (b === '~none' ? 'Not linked to a block' : rgE(b)) + '</b><small>' + line + '</small><small>' + (S.acc ? S.acc + ' NQAS accredited · ' : '') + (q == null ? 'no population yet' : q + '% population with quality care') + '</small></button>'; }).join('') + '</div>'
    + '<small class="rg-dim">Enrolled / all facilities of the block. Pick a block to see it in full.</small>';
}
function rgCovRollup(rows, label) {   // HealSol: a line per state or district under the card
  return '<div class="rg-cap">' + rgE(label) + '</div><div class="rg-scroll"><table class="rg-ctab"><thead><tr><th scope="col">' + rgE(label.replace(/^By /, '').replace(/^\w/, function (c) { return c.toUpperCase(); })) + '</th><th scope="col">Enrolled in FAST</th><th scope="col">NQAS accredited</th><th scope="col">Population served (SC + UPHC)</th><th scope="col">% with quality care</th><th scope="col">NQAS Ready in FAST</th></tr></thead><tbody>'
    + rows.map(function (r) { var S = r.S, q = rgPct(S.prim.qpop, S.prim.pop);
      return '<tr class="rg-cr" onclick="' + r.go + '"><td><button type="button" class="rg-rb"><b>' + rgE(r.name) + '</b></button>' + (r.sub ? '<small>' + rgE(r.sub) + '</small>' : '') + '</td><td data-l="Enrolled in FAST"><b>' + rgFmtN(S.en) + '</b> of ' + rgFmtN(S.n) + '</td><td data-l="NQAS accredited">' + rgFmtN(S.acc) + '</td><td data-l="Population (SC + UPHC)">' + (S.prim.pop ? rgLakh(S.prim.pop) : '<span class="rg-dim">—</span>') + '</td><td data-l="% with quality care">' + (q == null ? '<span class="rg-dim">—</span>' : q + '%') + '</td><td data-l="NQAS Ready in FAST">' + S.ready + '</td></tr>'; }).join('')
    + '</tbody></table></div>';
}
function rgCovArea(v) { _rg.covArea = v; _rg.covBlock = ''; rgRender(); }
function rgCoverageHTML(nodes) {
  var live = nodes.filter(function (n) { return !n.closed; }), foot = '<div class="rg-foot">Population served = every facility of that type we know, enrolled or not (the in-charge\'s figure first, else the registry\'s). Quality care = the part of it served by an NQAS-accredited facility. The lines overlap — a Sub-Centre\'s area is inside its PHC\'s, which is inside the CHC\'s block — so they are not added up; the top figure uses Sub-Centre and UPHC areas, which do not overlap.</div>';
  var stOf = function (L) { return (L[0] || {}).state || ''; };
  // a block opened from a district card
  if (_rg.covBlock) { var p = _rg.covBlock.split('|'), b = p.pop(), dk = p.join('|'), L = live.filter(function (n) { return n.dk === dk && (b === '~none' ? !n.blk : rgLow(n.blk) === rgLow(b)) && n.t !== 'uphc'; });
    var d0 = L[0] || {}; return rgCovCard(b === '~none' ? 'Not linked to a block' : b + ' block', [d0.district, d0.state].filter(Boolean).join(' · '), L, { block: true, back: "_rg.covBlock='';rgRender()" }) + foot; }
  if (_rg.mine && _rg.mine.scope === 'block') { var a = rgAreas()[0] || {}; return rgCovCard((_rg.mine.block || 'Your') + ' block', [a.district, a.state].filter(Boolean).join(' · ') + ' · MOIC · view only', live.filter(function (n) { return n.t !== 'uphc'; }), { block: true }) + foot; }
  var D = {}; live.forEach(function (n) { (D[n.dk] = D[n.dk] || []).push(n); });
  var dCard = function (dk, back) { var L = D[dk] || []; return rgCovCard((L[0] || {}).district || 'No district', stOf(L) || '', L, { back: back, extra: rgCovBlocks(L, dk) }); };
  if (rgDist()) { var mine = Object.keys(D).filter(function (dk) { return !rgAreas().length || rgAreas().some(function (x) { return rgDk(x.state, x.district) === dk || rgLow(x.district) === dk.split('|')[1]; }); });
    if (!mine.length) mine = Object.keys(D);
    return mine.sort().map(function (dk) { return dCard(dk); }).join('') + foot; }
  // HealSol: all states → a state → a district
  var area = _rg.covArea || '', SD = {}; live.forEach(function (n) { var st = n.state || 'No state'; (SD[st] = SD[st] || {})[n.dk] = n.district || 'No district'; });
  var pick = '<div class="rg-filt"><label>Area<select onchange="rgCovArea(this.value)"><option value="">All states</option>' + Object.keys(SD).sort().map(function (st) { var sk = 'S:' + rgLow(st);
    return '<optgroup label="' + rgE(st) + '"><option value="' + rgE(sk) + '"' + (area === sk ? ' selected' : '') + '>' + rgE(st) + ' · whole state</option>' + Object.keys(SD[st]).sort(function (x, y) { return SD[st][x].localeCompare(SD[st][y]); }).map(function (k) { return '<option value="' + rgE(k) + '"' + (area === k ? ' selected' : '') + '>' + rgE(SD[st][k]) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label></div>';
  if (area && area.indexOf('S:') !== 0) return pick + dCard(area, "rgCovArea('S:" + rgJ(rgLow((D[area] && stOf(D[area])) || '')) + "')") + foot;
  if (area) { var sk2 = area.slice(2), L2 = live.filter(function (n) { return rgLow(n.state || 'No state') === sk2; }), st2 = stOf(L2) || sk2;
    var rows = Object.keys(D).filter(function (dk) { return rgLow(stOf(D[dk]) || 'No state') === sk2; }).sort(function (x, y) { return (D[x][0].district || '').localeCompare(D[y][0].district || ''); }).map(function (dk) { return { name: D[dk][0].district || 'No district', S: rgCovStats(D[dk]), go: "rgCovArea('" + rgJ(dk) + "')" }; });
    return pick + rgCovCard(st2, rows.length + ' district' + (rows.length === 1 ? '' : 's'), L2, { back: "rgCovArea('')", extra: rgCovRollup(rows, 'By district') }) + foot; }
  var srows = Object.keys(SD).sort().map(function (st) { var L3 = live.filter(function (n) { return (n.state || 'No state') === st; }); return { name: st, sub: Object.keys(SD[st]).length + ' district' + (Object.keys(SD[st]).length === 1 ? '' : 's'), S: rgCovStats(L3), go: "rgCovArea('S:" + rgJ(rgLow(st)) + "')" }; });
  return pick + rgCovCard('All states', srows.length + ' state' + (srows.length === 1 ? '' : 's') + ' · every facility we know', live, { extra: rgCovRollup(srows, 'By state') }) + foot;
}

// ── Map ──
function rgColorOf(n) {
  if (_rg.color === 'readiness') { if (!n.code) return RG_ST.not; var p = n.info && n.info.pct; return p == null ? ['No readiness yet', '#9AA8A3', '#FFFFFF'] : p >= 70 ? ['70% and above', '#1E6B5E', '#FFFFFF'] : p >= 50 ? ['50–69%', '#D4912A', '#FFFFFF'] : ['Below 50%', '#B3402A', '#FFFFFF']; }
  return RG_ST[rgStatus(n)];
}
function rgShapeSVG(t, fill, stroke, sz) {
  sz = sz || (t === 'chc' ? 26 : t === 'sc' ? 16 : 20); var s = sz, half = s / 2, sw = 2;
  var shape = t === 'chc' ? '<polygon points="' + half + ',' + sw + ' ' + (s - sw) + ',' + (s - sw) + ' ' + sw + ',' + (s - sw) + '"/>'
    : t === 'phc' ? '<rect x="' + sw + '" y="' + sw + '" width="' + (s - 2 * sw) + '" height="' + (s - 2 * sw) + '" rx="2"/>'
    : t === 'uphc' ? '<polygon points="' + half + ',' + sw + ' ' + (s - sw) + ',' + half + ' ' + half + ',' + (s - sw) + ' ' + sw + ',' + half + '"/>'
    : '<circle cx="' + half + '" cy="' + half + '" r="' + (half - sw) + '"/>';
  return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true"><g fill="' + fill + '" stroke="' + stroke + '" stroke-width="' + sw + '">' + shape + '</g></svg>';
}
function rgMapPoints(nodes) {
  return rgScope(nodes).filter(function (n) { return n.lat != null && (_rg.showNot || n.code); }).map(function (n) { var c = rgColorOf(n); return { id: n.id, t: n.t, lat: n.lat, lng: n.lng, name: n.name, fill: n.code ? c[1] : '#FFFFFF', stroke: n.code ? '#FFFFFF' : '#7A8A85', label: c[0] }; });
}
function rgMapHTML(nodes) {
  var sc = rgScope(nodes), noGeo = sc.filter(function (n) { return n.lat == null && (_rg.showNot || n.code); }), pick = _rg.pick ? nodes.find(function (n) { return n.id === _rg.pick; }) : null;
  var D = {}; nodes.forEach(function (n) { if (n.district) D[n.dk] = n.district; });
  var leg = _rg.color === 'readiness' ? [['70% and above', '#1E6B5E'], ['50–69%', '#D4912A'], ['Below 50%', '#B3402A'], ['No readiness yet', '#9AA8A3']] : ['ok', 'slip', 'behind', 'start', 'ready', 'grad'].map(function (k) { return [RG_ST[k][0], RG_ST[k][1]]; });
  var SD = {}; nodes.forEach(function (n) { if (!n.district) return; var st = n.state || 'Other'; (SD[st] = SD[st] || {})[n.dk] = n.district; });
  return '<div class="rg-filt rg-mapf">' + rgAreaPick(nodes, SD)
    + '<label>Colour by<select onchange="rgSet(\'color\',this.value)"><option value="status">Programme status</option><option value="readiness"' + (_rg.color === 'readiness' ? ' selected' : '') + '>Readiness</option></select></label>'
    + '<label class="rg-sw"><input type="checkbox" ' + (_rg.showNot ? 'checked ' : '') + 'onchange="rgSet(\'showNot\',this.checked)"> Show facilities not enrolled</label>'
    + '<label class="rg-sw"><input type="checkbox" ' + (_rg.links ? 'checked ' : '') + 'onchange="rgSet(\'links\',this.checked)"> Show links SC → PHC → CHC</label></div>'
    + '<div class="rg-mapw"><div class="rg-mapbox"><div id="rg-map" role="region" aria-label="Map of facilities"></div><div id="rg-map-msg" class="rg-map-msg" hidden></div></div>'
    + '<aside class="rg-mapside">'
    + (pick ? '<div class="nfo-card rg-pick"><small class="rg-dim">' + RG_NAME[pick.t] + (pick.blk ? ' · ' + rgE(pick.blk) + ' block' : '') + (pick.nin ? ' · ' + rgE(pick.nin) : '') + '</small><b class="rg-st">' + rgE(pick.name) + '</b><div>' + rgStatusTxt(pick) + '</div>'
        + '<dl class="rg-dl2">' + (pick.info && pick.info.pct != null ? '<dt>Readiness</dt><dd>' + pick.info.pct + '%' + (pick.info.base != null ? ' (baseline ' + pick.info.base + '%)' : '') + '</dd>' : '') + '<dt>Population</dt><dd>' + (pick.pop ? rgFmtN(pick.pop) : '—') + '</dd>'
        + (pick.t === 'sc' && pick.phc ? '<dt>PHC</dt><dd>' + rgE(((nodes.byNin || {})[pick.phc] || {}).name || pick._phcName || pick.phc) + '</dd>' : '') + (pick.info && pick.info.inCharge ? '<dt>In-charge</dt><dd>' + rgE(pick.info.inChargeLabel + ' ' + pick.info.inCharge) + '</dd>' : '') + '<dt>Location</dt><dd>' + (pick.gsrc === 'in-charge' ? 'set by the in-charge' : 'from the registry') + '</dd></dl>'
        + (pick.code ? '<button type="button" class="hs-btn p" onclick="scDrillIn(\'' + rgJ(pick.code) + '\')">Open facility</button>' : '') + '<a class="rg-gm" href="' + rgGmaps(pick.lat, pick.lng) + '" target="_blank" rel="noopener">Open in Google Maps</a></div>'
      : '<div class="nfo-card rg-pick"><b>Pick a facility on the map</b><small class="rg-dim">Its status, readiness and a link to Google Maps appear here.</small></div>')
    + '<div class="nfo-card rg-leg"><b>' + (_rg.color === 'readiness' ? 'Readiness' : 'Programme status') + '</b>' + leg.map(function (x) { return '<span><i style="background:' + x[1] + '"></i>' + rgE(x[0]) + '</span>'; }).join('') + '<span><i class="o"></i>Not enrolled</span>'
    + '<span class="rg-shapes">' + rgShapeSVG('chc', '#33433E', '#33433E', 14) + ' CHC ' + rgShapeSVG('phc', '#33433E', '#33433E', 13) + ' PHC ' + rgShapeSVG('sc', '#33433E', '#33433E', 12) + ' SC ' + rgShapeSVG('uphc', '#33433E', '#33433E', 13) + ' UPHC</span></div>'
    + (noGeo.length ? '<div class="nfo-card rg-nogeo"><b>' + noGeo.length + ' facilit' + (noGeo.length === 1 ? 'y has' : 'ies have') + ' no location</b><small>They are not on the map. Ask the in-charge to tap "Use my location"' + (rgHS() ? ', or add it in the Registry' : '') + '.</small>'
      + (rgHS() ? '<button type="button" class="hs-link" onclick="_rg.tile=\'nogps\';rgSet(\'tab\',\'registry\')">See the list</button>' : '<small class="rg-dim">' + noGeo.slice(0, 8).map(function (n) { return rgE(n.name); }).join(', ') + (noGeo.length > 8 ? ' …' : '') + '</small>') + '</div>' : '')
    + '</aside></div>';
}
// the Area list (28 Oct): HealSol — states and districts; District Admin — their district(s) and blocks; MOIC — their block (no list)
function rgAreaPick(nodes, SD) {
  if (rgHS()) return '<label>Area<select onchange="rgSet(\'dist\',this.value)"><option value="">All states</option>' + Object.keys(SD).sort().map(function (st) { var sk = 'S:' + rgLow(st);
      return '<optgroup label="' + rgE(st) + '"><option value="' + rgE(sk) + '"' + (_rg.dist === sk ? ' selected' : '') + '>' + rgE(st) + ' · whole state</option>' + Object.keys(SD[st]).sort(function (x, y) { return SD[st][x].localeCompare(SD[st][y]); }).map(function (k) { return '<option value="' + rgE(k) + '"' + (_rg.dist === k ? ' selected' : '') + '>' + rgE(SD[st][k]) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label>';
  if (_rg.mine && _rg.mine.scope === 'block') { var a = rgAreas()[0] || {}; return '<b class="rg-mapttl">' + rgE((_rg.mine.block || 'Your') + ' block') + (a.district ? ' · ' + rgE(a.district) : '') + '</b>'; }
  var D = {}; nodes.forEach(function (n) { if (!n.district) return; var d = D[n.dk] = D[n.dk] || { name: n.district, b: {} }; if (n.blk) d.b[n.blk] = 1; });
  var cur = _rg.block ? 'B:' + _rg.dist + '|' + _rg.block : _rg.dist;
  return '<label>Area<select onchange="rgAreaSet(this.value)">' + Object.keys(D).sort().map(function (k) { var d = D[k];
    return '<option value="' + rgE(k) + '"' + (cur === k || (!cur && Object.keys(D).length === 1) ? ' selected' : '') + '>' + rgE(d.name) + ' · whole district</option>' + Object.keys(d.b).sort().map(function (b) { var v = 'B:' + k + '|' + b; return '<option value="' + rgE(v) + '"' + (cur === v ? ' selected' : '') + '>  ' + rgE(b) + ' block</option>'; }).join(''); }).join('') + '</select></label>';
}
function rgAreaSet(v) { if (String(v).indexOf('B:') === 0) { var p = v.slice(2).split('|'), b = p.pop(); _rg.dist = p.join('|'); _rg.block = b; _rg.sel = null; rgRender(); } else rgSet('dist', v); }
function rgLoadLeaflet() {
  if (window.L && window.L.map) return Promise.resolve(window.L);
  if (rgLoadLeaflet._p) return rgLoadLeaflet._p;
  rgLoadLeaflet._p = new Promise(function (res, rej) {
    if (!document.getElementById('rg-leaflet-css')) { var l = document.createElement('link'); l.id = 'rg-leaflet-css'; l.rel = 'stylesheet'; l.href = RG_LEAFLET.css; document.head.appendChild(l); }
    var s = document.createElement('script'); s.src = RG_LEAFLET.js; s.onload = function () { window.L && window.L.map ? res(window.L) : rej(new Error('leaflet')); }; s.onerror = function () { rgLoadLeaflet._p = null; rej(new Error('leaflet')); };
    document.head.appendChild(s);
  });
  return rgLoadLeaflet._p;
}
function rgMapDraw(nodes) {
  var pts = rgMapPoints(nodes), el = document.getElementById('rg-map'), msg = document.getElementById('rg-map-msg');
  if (!el) return;
  rgLoadLeaflet().then(function (L) {
    if (!document.body.contains(el)) return;
    if (_rg.map) { try { _rg.map.remove(); } catch (e) {} _rg.map = null; }
    var m = L.map(el, { scrollWheelZoom: true }); _rg.map = m;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors' }).addTo(m);
    var byId = {}; pts.forEach(function (p) { byId[p.id] = p; });
    if (_rg.links) nodes.forEach(function (n) { var a = byId[n.id]; if (!a) return; [n.t === 'sc' ? n.phc : '', n.t !== 'chc' ? n.chc : ''].forEach(function (pn) { var pnode = pn && nodes.byNin[pn], b = pnode && byId[pnode.id]; if (b) L.polyline([[a.lat, a.lng], [b.lat, b.lng]], { color: '#5D6D68', weight: 1.5, opacity: .7, dashArray: '4 4' }).addTo(m); }); });
    pts.forEach(function (p) { var sz = p.t === 'chc' ? 26 : p.t === 'sc' ? 16 : 20;
      var ic = L.divIcon({ className: 'rg-pin' + (_rg.pick === p.id ? ' on' : ''), html: rgShapeSVG(p.t, p.fill, p.stroke, sz), iconSize: [sz, sz], iconAnchor: [sz / 2, sz / 2] });
      L.marker([p.lat, p.lng], { icon: ic, title: p.name + ' · ' + p.label, keyboard: true }).addTo(m).on('click', function () { _rg.pick = p.id; var c = _rg.map && _rg.map.getCenter(), z = _rg.map && _rg.map.getZoom(); _rg.keep = c ? { c: c, z: z } : null; rgRender(); }); });
    if (_rg.keep) { m.setView(_rg.keep.c, _rg.keep.z); _rg.keep = null; }
    else if (pts.length) m.fitBounds(L.latLngBounds(pts.map(function (p) { return [p.lat, p.lng]; })).pad(0.15), { maxZoom: 13 });
    else m.setView([23.5, 80.5], 5);
    if (msg) { msg.hidden = !!pts.length; msg.textContent = pts.length ? '' : 'No facility with a location here yet.'; }
  }).catch(function () { if (msg) { msg.hidden = false; msg.textContent = 'The map could not load — check the internet connection and open the Map tab again.'; } });
}

// ── Import / download ──
var RG_COLS = [['t', ['type', 'facility type', 'facility_type']], ['nin', ['nin', 'nin number', 'hfr id', 'hfr', 'facility id (nin)']], ['name', ['name', 'facility name', 'facility_name']], ['state', ['state']], ['district', ['district']],
  ['block', ['block', 'city', 'block / city', 'block/city', 'city / ward']], ['phc', ['parent phc nin', 'phc nin', 'parent phc']], ['chc', ['parent chc nin', 'chc nin', 'parent chc']], ['lat', ['latitude', 'lat']], ['lng', ['longitude', 'long', 'lng', 'lon']], ['pop', ['population', 'pop', 'catchment population']],
  ['acc', ['nqas accredited (year)', 'nqas accredited', 'nqas year', 'accredited', 'nqas certified (year)']], ['closed', ['closed / merged', 'closed', 'status (working / closed / merged)']]];
var RG_XH = ['Type', 'NIN', 'Name', 'State', 'District', 'Block', 'Parent PHC NIN', 'Parent CHC NIN', 'Latitude', 'Longitude', 'Population', 'NQAS accredited (year)', 'Closed / merged'];
function rgImportPick() { if (!rgEditor()) return; var i = document.createElement('input'); i.type = 'file'; i.accept = '.xlsx,.xls,.csv'; i.onchange = function () { var f = i.files && i.files[0]; if (f) rgImportFile(f); }; i.click(); }
async function rgImportFile(f) {
  try { var X = await nfLoadXlsx(), buf = await f.arrayBuffer(), wb = X.read(buf, { type: 'array' }); return rgImportWb(X, wb); }
  catch (e) { console.warn('[RG] import', e); showToast('Could not read this file.', 'err'); }
}
function rgImportWb(X, wb) {
  var ws = wb.Sheets[wb.SheetNames.find(function (n) { return /facilit|registry|list/i.test(n); }) || wb.SheetNames[0]], A = X.utils.sheet_to_json(ws, { header: 1, defval: '' });
  var hi = A.findIndex(function (r) { return r.some(function (c) { return rgLow(c) === 'name' || rgLow(c) === 'facility name'; }); });
  if (hi < 0) { scAlert('Could not find the header row. The first row must have the column names: ' + RG_XH.join(', ') + '. Download the template to see the layout.', 'Import list', '⚠️'); return null; }
  var hd = A[hi].map(rgLow), col = {}; RG_COLS.forEach(function (c) { var i = hd.findIndex(function (h) { return c[1].indexOf(h) >= 0; }); if (i >= 0) col[c[0]] = i; });
  if (col.name == null || col.t == null) { scAlert('The list needs at least the "Type" and "Name" columns.', 'Import list', '⚠️'); return null; }
  var R = _rg.R || {}, byNin = {}, byName = {}; Object.keys(R).forEach(function (k) { var r = R[k] || {}; if (r.nin) byNin[rgNin(r.nin)] = k; byName[rgLow(r.name) + '|' + rgLow(r.district)] = k; });
  var F = (typeof scMasterFacilities !== 'undefined' && scMasterFacilities) || {}, fByNin = {}; Object.keys(F).forEach(function (c) { var f = F[c] || {}; if (f.nin && !f.migratedTo) fByNin[rgNin(f.nin)] = c; });
  var rep = { add: [], change: [], same: 0, bad: [], seen: {} };
  A.slice(hi + 1).forEach(function (row, i) {
    var g = function (k) { return col[k] == null ? undefined : String(row[col[k]] == null ? '' : row[col[k]]).trim(); };
    if (!row.some(function (c) { return String(c).trim(); })) return;
    var rn = 'Row ' + (hi + i + 2), t = rgTypeOf(g('t')), name = g('name');
    if (!name) { rep.bad.push(rn + ': no name'); return; } if (!t) { rep.bad.push(rn + ' (' + name + '): type "' + g('t') + '" not known — use SC, PHC, CHC or UPHC'); return; }
    var v = { t: t, name: name }; ['state', 'district', 'block'].forEach(function (k) { if (g(k)) v[k] = g(k); });
    ['nin', 'phc', 'chc'].forEach(function (k) { var x = rgNin(g(k)); if (x) v[k] = x; });
    var lat = rgNum(g('lat')), lng = rgNum(g('lng')), pop = rgNum(g('pop'));
    if (lat != null || lng != null) { if (lat == null || lng == null || isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) rep.bad.push(rn + ' (' + name + '): GPS outside India — left out'); else { v.lat = Math.round(lat * 1e6) / 1e6; v.lng = Math.round(lng * 1e6) / 1e6; } }
    if (pop != null) { if (isNaN(pop) || pop < 1 || pop > 10000000) rep.bad.push(rn + ' (' + name + '): population not a number — left out'); else v.pop = Math.round(pop); }
    var acc = rgNum(g('acc')); if (acc != null) { if (isNaN(acc) || acc < 2000 || acc > 2100) rep.bad.push(rn + ' (' + name + '): NQAS accredited is not a year like 2024 — left out'); else v.acc = Math.round(acc); }
    var cl = rgLow(g('closed')); if (cl) { if (/merg/.test(cl)) v.closed = 'merged'; else if (/clos/.test(cl)) v.closed = 'closed'; }
    if (rgDistEd()) {   // District Admin: their own district only; state / district filled when the sheet leaves them out
      var A = rgAreas(); if (A.length === 1) { if (!v.district) v.district = A[0].district; if (!v.state || rgLow(v.district) === rgLow(A[0].district)) v.state = A[0].state || v.state; }
      if (!rgMyArea(v.state, v.district)) { rep.bad.push(rn + ' (' + name + '): ' + (v.district || 'no district') + ' is not your district — left out'); return; } }
    var key = v.nin ? 'n:' + v.nin : 'm:' + rgLow(name) + '|' + rgLow(v.district); if (rep.seen[key]) { rep.bad.push(rn + ' (' + name + '): appears twice in the file — second one left out'); return; } rep.seen[key] = 1;
    if (v.nin && fByNin[v.nin]) v.code = fByNin[v.nin];
    var rid = (v.nin && byNin[v.nin]) || byName[rgLow(name) + '|' + rgLow(v.district)];
    if (rid && (R[rid] || {}).code && (v.t !== R[rid].t || (v.nin && v.nin !== rgNin(R[rid].nin)))) { rep.bad.push(rn + ' (' + name + '): enrolled facility — type and NIN stay as they are; left out'); return; }
    if (rid && (R[rid] || {}).code && v.closed) { rep.bad.push(rn + ' (' + name + '): enrolled facility — cannot be closed; left out'); return; }
    if (!rid) { rep.add.push({ rid: rgNewIdFor(v.nin, rep), v: v }); return; }
    var cur = R[rid] || {}, diff = {}; Object.keys(v).forEach(function (k) { if (String(v[k]) !== String(cur[k] == null ? '' : cur[k])) diff[k] = v[k]; });
    if (Object.keys(diff).length) rep.change.push({ rid: rid, name: cur.name || name, diff: diff, v: Object.assign({}, cur, v) }); else rep.same++;
  });
  delete rep.seen; _rg.imp = rep; _rg.tab = 'registry'; rgRender();
  return rep;
}
function rgNewIdFor(nin, rep) { var R = _rg.R || {}, used = {}; rep.add.forEach(function (a) { used[a.rid] = 1; }); if (nin && !R['N' + nin] && !used['N' + nin]) return 'N' + nin; var id; do { id = 'R' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); } while (R[id] || used[id]); return id; }
var RG_FN = { t: 'type', nin: 'NIN', name: 'name', state: 'state', district: 'district', block: 'block', phc: 'parent PHC', chc: 'parent CHC', lat: 'GPS', lng: 'GPS', pop: 'population', code: 'enrolled link', acc: 'NQAS accredited', closed: 'closed / merged' };
function rgImpHTML(I) {
  var n = I.add.length + I.change.length;
  return '<div class="nfo-card rg-imp"><div class="rg-imp-h"><b>Import: ' + I.add.length + ' new · ' + I.change.length + ' changed</b><small> · ' + I.same + ' the same' + (I.bad.length ? ' · ' + I.bad.length + ' left out' : '') + '</small></div>'
    + '<ul>' + I.add.slice(0, 30).map(function (a) { return '<li><b>New</b> ' + RG_LABEL[a.v.t] + ' · ' + rgE(a.v.name) + (a.v.district ? ' · ' + rgE(a.v.district) : '') + (a.v.code ? ' · <em>matches enrolled ' + rgE(a.v.code) + '</em>' : '') + '</li>'; }).join('')
    + I.change.slice(0, 30).map(function (c) { return '<li><b>' + rgE(c.name) + '</b> — ' + Object.keys(c.diff).map(function (k) { return RG_FN[k] || k; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ') + '</li>'; }).join('')
    + (n > 60 ? '<li>… and ' + (n - 60) + ' more</li>' : '') + I.bad.slice(0, 12).map(function (b) { return '<li class="bad">' + rgE(b) + '</li>'; }).join('') + (I.bad.length > 12 ? '<li class="bad">… and ' + (I.bad.length - 12) + ' more</li>' : '') + '</ul>'
    + '<div class="rg-sbtn"><button type="button" class="hs-btn" onclick="_rg.imp=null;rgRender()">Cancel</button>' + (n ? '<button type="button" class="hs-btn p" id="rg-imp-go" onclick="rgImportApply()">Save ' + n + ' to the registry</button>' : '') + '</div></div>';
}
async function rgImportApply() {
  var I = _rg.imp; if (!I) return; var b = document.getElementById('rg-imp-go'); if (b) { b.disabled = true; b.textContent = 'Saving…'; }
  var now = new Date().toISOString(), by = rgBy() || 'HealSol', upd = {};
  I.add.forEach(function (a) { upd[a.rid] = Object.assign({}, a.v, { src: 'import', at: now, by: by }); });
  I.change.forEach(function (c) { upd[c.rid] = Object.assign({}, c.v, { at: now, by: by }); if (!upd[c.rid].src) upd[c.rid].src = 'import'; });
  var keys = Object.keys(upd), ok = 0;
  if (rgDistEd()) {   // through the server, one batch (HealSol can undo it as one)
    _rg.lastTree = null;
    var batch = 'U' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), errs = [];
    for (var j = 0; j < keys.length; j += 400) { var pt = {}; keys.slice(j, j + 400).forEach(function (k) { pt[k] = upd[k]; });
      try { var res = await nfCall('distRegistrySave', { rows: pt, kind: 'upload', batch: batch }); ok += res.saved || 0; errs = errs.concat(res.errors || []); _rg.lastTree = { accounts: ((_rg.lastTree || {}).accounts || []).concat(res.accounts || []), conflicts: ((_rg.lastTree || {}).conflicts || []).concat(res.conflicts || []) }; } catch (e) { errs.push(nfErrText(e)); break; } }
    _rg.imp = null; showToast(ok + ' facilities saved.' + (errs.length ? ' ' + errs.length + ' left out.' : ''), ok ? 'ok' : 'err');
    rgAfterTree(_rg.lastTree || {});
    if (errs.length) scAlert('Saved ' + ok + ' of ' + keys.length + '. Left out:\n' + errs.slice(0, 15).join('\n') + (errs.length > 15 ? '\n… and ' + (errs.length - 15) + ' more' : ''), 'Upload', '⚠️');
    await rgLoad(true); return ok;
  }
  try {
    for (var i = 0; i < keys.length; i += 300) { var part = {}; keys.slice(i, i + 300).forEach(function (k) { part[k] = upd[k]; }); await db.ref('sc_registry').update(part); ok += Object.keys(part).length; }
  } catch (e) { console.warn('[RG] import save', e); showToast('Saved ' + ok + ' of ' + keys.length + ' — check the connection and import again.', 'err'); }
  Object.keys(upd).slice(0, ok).forEach(function (k) { _rg.R[k] = upd[k]; });
  _rg.imp = null; if (ok === keys.length) showToast(ok + ' facilities saved in the registry.', 'ok'); rgRender();
  var ds = {}; Object.keys(upd).slice(0, ok).forEach(function (k) { var r = upd[k]; if (r.district) ds[rgDk(r.state, r.district)] = r; });
  for (var dk in ds) await rgTreeSync(ds[dk].state, ds[dk].district);
  return ok;
}
function rgRows(nodes) {
  return [RG_XH.concat(['Enrolled (facility ID)', 'Status', 'Location from', 'Population from', 'Verified'])].concat(nodes.slice().sort(function (a, b) { return a.district.localeCompare(b.district) || (a.blk || '').localeCompare(b.blk || '') || a.name.localeCompare(b.name); }).map(function (n) {
    return [RG_NAME[n.t], n.nin || '', n.name, n.state, n.district, n.blk || '', n.phc || '', n.chc || '', n.lat != null ? n.lat : '', n.lng != null ? n.lng : '', n.pop || '', n.acc && n.acc !== true ? n.acc : '', n.closed || '', n.code || '', n.code ? RG_ST[rgStatus(n)][0] : 'Not enrolled',
      n.lat == null ? '' : n.gsrc === 'in-charge' ? 'In-charge (phone)' : 'Registry', !n.pop ? '' : n.f && n.f.population && n.f.population.n ? 'In-charge' : 'Registry', n.ver ? 'Verified ' + String(n.ver.at || '').slice(0, 10) : n.unver ? 'Not verified (from the facility)' : '']; }));
}
async function rgDownload(template) {
  try {
    var X = await nfLoadXlsx(), wb = X.utils.book_new();
    var all = rgNodes(), rows = template ? [RG_XH, ['SC', '1234567890', 'Example Sub-Centre', 'Uttar Pradesh', 'Jhansi', 'Babina', '2234567890', '3234567890', 25.4521, 78.5612, 5200, 2024, '']] : rgRows(rgHS() ? rgScope(all) : all);
    var ws = X.utils.aoa_to_sheet(rows); ws['!cols'] = [8, 14, 34, 16, 16, 16, 14, 14, 11, 11, 11, 12, 12, 18, 22, 16, 14, 18].map(function (w) { return { wch: w }; }); X.utils.book_append_sheet(wb, ws, 'Facilities');
    X.utils.book_append_sheet(wb, X.utils.aoa_to_sheet([['NQAS FAST · Facility registry'], ['Columns: ' + RG_XH.join(', ') + '. Type is SC, PHC, CHC or UPHC. NIN is the national facility number (used to match rows). Parent PHC / CHC are given by their NIN.'],
      ['Latitude 6 to 38 and longitude 68 to 98 (India), in decimal degrees, e.g. 25.4521 and 78.5612. Population is a whole number (PHC / CHC: their area as per HMIS).'],
      ['NQAS accredited (year): the year the facility was NQAS certified, e.g. 2024; leave empty if not. Closed / merged: leave empty for a working facility.'],
      ['Columns after "Closed / merged" are for reading only (they come from the app).'],
      ['Upload it in Facilities → ' + (rgHS() ? 'Import list' : 'Upload sheet') + '. Every new and changed row is shown before saving; rows already the same are left alone.']]), 'Read me');
    var blk = _rg.mine && _rg.mine.scope === 'block', area = rgDistEd() || blk ? ((rgAreas()[0] || {}).district || 'district') + (blk ? '-' + (_rg.mine.block || 'block') : '') : '';
    var name = template ? 'NQAS-FAST-registry-template.xlsx' : 'NQAS-FAST-facilities-' + (area ? area.replace(/[^A-Za-z0-9]+/g, '-') + '-' : '') + new Date().toISOString().slice(0, 10) + '.xlsx';
    if (typeof nfSaveWb === 'function') await nfSaveWb(X, wb, name); else X.writeFile(wb, name);
    showToast(template ? 'Template downloaded.' : 'Registry downloaded.', 'ok');
  } catch (e) { console.warn('[RG] download', e); showToast('Could not create the Excel file.', 'err'); }
}

// ── In-charge on the phone: location and population (every type) ──
function rgHi() { try { return typeof nfgHi === 'function' ? nfgHi() : false; } catch (e) { return false; } }
function rgT(en, hi) { return rgHi() && hi ? hi : en; }
function rgMyFac() {
  try { if (typeof _nd !== 'undefined' && _nd && _nd.code && document.body.classList.contains('nd-on')) return { code: _nd.code, f: _nd.fac, dept: true }; } catch (e) {}
  try { if (typeof appMode !== 'undefined' && appMode === 'cho' && choState && choState.facilityCode) return { code: choState.facilityCode, f: choState.facility || (scMasterFacilities || {})[choState.facilityCode] || {}, dept: false }; } catch (e) {}
  return null;
}
function rgIsInCharge() {
  var M = rgMyFac(); if (!M) return false;
  if (M.dept) { try { return ndIsInCharge(ndMob()); } catch (e) { return false; } }
  try { return (choState.roleId || 'CHO') === 'CHO'; } catch (e) { return false; }
}
function rgGeoLine(f) { var g = f && f.geo; return g && g.lat != null ? (+g.lat).toFixed(5) + ', ' + (+g.lng).toFixed(5) : ''; }
function rgGeoOpen() {
  var M = rgMyFac(); if (!M) return; if (!rgIsInCharge()) { showToast(rgT('Only the facility in-charge sets the location.', 'केवल प्रभारी स्थान दर्ज करते हैं।'), 'err'); return; }
  var old = document.getElementById('rg-geo'); if (old) old.remove();
  var ov = document.createElement('div'); ov.id = 'rg-geo'; ov.className = 'scx-ov rg-geo-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'rg-geo-t');
  var tn = (NF_LEVELS[(typeof nfTypeOf === 'function' ? nfTypeOf(M.f) : 'sc')] || {}).name || 'facility';
  ov.innerHTML = '<div class="scx-box rg-geo-box"><div class="rg-geo-hd"><b id="rg-geo-t">' + rgT('Facility location', 'स्वास्थ्य केंद्र का स्थान') + '</b><button type="button" class="ce-x" aria-label="Close" onclick="document.getElementById(\'rg-geo\').remove()">×</button></div>'
    + '<p>' + rgT('Stand at the ' + rgE(tn) + ' and tap the button. It puts your facility on the district map. One time only.', 'स्वास्थ्य केंद्र पर खड़े होकर बटन दबाएँ। इससे आपकी स्वास्थ्य केंद्र ज़िले के नक्शे पर आ जाएगी।') + '</p>'
    + '<div id="rg-geo-now" class="rg-geo-now">' + (rgGeoLine(M.f) ? rgT('Saved: ', 'दर्ज: ') + rgGeoLine(M.f) + (M.f.geo.acc ? ' (±' + Math.round(M.f.geo.acc) + ' m)' : '') + ' · ' + rgE(String(M.f.geo.at || '').slice(0, 10)) + ' · <a href="' + rgGmaps(M.f.geo.lat, M.f.geo.lng) + '" target="_blank" rel="noopener">' + rgT('See on Google Maps', 'Google Maps पर देखें') + '</a>' : rgT('Not saved yet.', 'अभी दर्ज नहीं।')) + '</div>'
    + '<button type="button" class="rg-geo-go" id="rg-geo-use" onclick="rgGeoUse()">' + rgT('Use my location', 'मेरा स्थान लें') + '</button>'
    + '<div id="rg-geo-res" class="rg-geo-res" hidden></div>'
    + '<details class="rg-geo-type"><summary>' + rgT('Type it in', 'स्वयं लिखें') + '</summary><div class="rg-2"><label>' + rgT('Latitude', 'अक्षांश') + '<input id="rg-geo-lat" inputmode="decimal" placeholder="25.45210"></label><label>' + rgT('Longitude', 'देशांतर') + '<input id="rg-geo-lng" inputmode="decimal" placeholder="78.56120"></label></div>'
    + '<button type="button" class="rg-geo-sec" onclick="rgGeoSaveTyped()">' + rgT('Save', 'सहेजें') + '</button></details></div>';
  document.body.appendChild(ov);
}
function rgGeoUse() {
  var res = document.getElementById('rg-geo-res'), b = document.getElementById('rg-geo-use');
  if (!navigator.geolocation) { if (res) { res.hidden = false; res.textContent = rgT('This phone cannot share its location. Use "Type it in".', 'यह फ़ोन स्थान नहीं दे सकता। "स्वयं लिखें" का उपयोग करें।'); } return; }
  if (b) { b.disabled = true; b.textContent = rgT('Finding your location…', 'स्थान खोजा जा रहा है…'); }
  navigator.geolocation.getCurrentPosition(function (p) {
    var c = p.coords; if (b) { b.disabled = false; b.textContent = rgT('Try again', 'फिर से'); }
    _rg.geo = { lat: Math.round(c.latitude * 1e6) / 1e6, lng: Math.round(c.longitude * 1e6) / 1e6, acc: Math.round(c.accuracy || 0) };
    if (res) { res.hidden = false; var far = _rg.geo.acc > 150;
      res.innerHTML = '<b>' + _rg.geo.lat.toFixed(5) + ', ' + _rg.geo.lng.toFixed(5) + '</b> · ' + rgT('accurate to about ', 'लगभग ') + _rg.geo.acc + ' m' + (far ? '<div class="rg-geo-warn">' + rgT('Not very accurate — step outside, wait a few seconds and tap "Try again".', 'सटीक नहीं — बाहर जाकर कुछ सेकंड रुकें और "फिर से" दबाएँ।') + '</div>' : '')
        + '<button type="button" class="rg-geo-go" onclick="rgGeoSave(_rg.geo)">' + rgT('Save this location', 'यह स्थान सहेजें') + '</button>'; }
  }, function (e) {
    if (b) { b.disabled = false; b.textContent = rgT('Use my location', 'मेरा स्थान लें'); }
    if (res) { res.hidden = false; res.textContent = e && e.code === 1 ? rgT('Location permission was refused. Allow location for this app in the phone settings, or use "Type it in".', 'स्थान की अनुमति नहीं मिली। फ़ोन की सेटिंग में अनुमति दें या "स्वयं लिखें" का उपयोग करें।') : rgT('Could not find the location. Step outside and try again.', 'स्थान नहीं मिला। बाहर जाकर फिर से प्रयास करें।'); }
  }, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
}
function rgGeoSaveTyped() {
  var lat = rgNum((document.getElementById('rg-geo-lat') || {}).value), lng = rgNum((document.getElementById('rg-geo-lng') || {}).value);
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng) || lat < 6 || lat > 38 || lng < 68 || lng > 98) { showToast(rgT('Enter latitude 6–38 and longitude 68–98 (India).', 'अक्षांश 6–38 और देशांतर 68–98 लिखें।'), 'err'); return; }
  rgGeoSave({ lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6, typed: true });
}
async function rgGeoSave(gv) {
  var M = rgMyFac(); if (!M || !gv) return false;
  var me = ''; try { me = M.dept ? ndMob() : choState.staffMobile; } catch (e) {}
  var rec = { lat: gv.lat, lng: gv.lng, at: new Date().toISOString(), by: me || '' }; if (gv.acc) rec.acc = gv.acc; if (gv.typed) rec.typed = true;
  var ok = await fbSet('sc_facilities/' + M.code + '/geo', rec);
  if (!ok) { showToast(rgT('Could not save — check the connection.', 'सहेजा नहीं जा सका — कनेक्शन जाँचें।'), 'err'); return false; }
  try { M.f.geo = rec; if (scMasterFacilities && scMasterFacilities[M.code]) scMasterFacilities[M.code].geo = rec; } catch (e) {}
  var ov = document.getElementById('rg-geo'); if (ov) ov.remove();
  showToast(rgT('Location saved — your facility is on the map.', 'स्थान सहेजा गया।'), 'ok');
  rgRefreshStaff(); return true;
}
async function rgPopEdit() {
  var M = rgMyFac(); if (!M) return;
  if (!M.dept && typeof nfgPopEdit === 'function') return nfgPopEdit(M.code);
  if (!rgIsInCharge()) { showToast('Only the facility in-charge fills the population.', 'err'); return; }
  var t = typeof nfTypeOf === 'function' ? nfTypeOf(M.f) : 'sc', B = RG_POP[t] || [500, 1000000], p = M.f.population || {};
  var v = await scDialog({ title: 'Population served — ' + (M.f.name || M.code), icon: '👪', okLabel: 'Save', message: 'The population of your ' + ((NF_LEVELS[t] || {}).name || 'facility') + ' area (as per HMIS / the district).',
    fields: [{ key: 'n', label: 'Population served', type: 'number', required: true, value: p.n || '' }, { key: 'villages', label: t === 'uphc' ? 'Wards (optional)' : 'Villages (optional)', type: 'number', value: p.villages || '' },
      { key: 'households', label: 'Households (optional)', type: 'number', value: p.households || '' }, { key: 'confirm', type: 'checklist', value: [], options: [{ value: 'yes', label: 'The number is correct' }] }],
    validate: function (x) { var n = +x.n; if (!(n >= 1 && n <= 1000000) || Math.floor(n) !== n) return 'Enter the population as a whole number.';
      if ((n < B[0] || n > B[1]) && !(x.confirm || []).length) return 'This number is unusual for a ' + RG_LABEL[t] + ' — check it and tick "The number is correct".'; return null; } });
  if (!v) return;
  var me = ''; try { me = ndMob(); } catch (e) {}
  var rec = { n: +v.n, at: new Date().toISOString(), by: me }; if (v.villages) rec.villages = +v.villages; if (v.households) rec.households = +v.households;
  if (!(await fbSet('sc_facilities/' + M.code + '/population', rec))) { showToast('Could not save — check the connection.', 'err'); return; }
  M.f.population = rec; showToast('Population saved.', 'ok'); rgRefreshStaff();
}
function rgRefreshStaff() { try { if (typeof ndRender === 'function' && document.body.classList.contains('nd-on')) ndRender(); else { if (typeof nfRenderToday === 'function') nfRenderToday(); if (typeof faMore === 'function' && document.getElementById('fa-acct')) faMore(); } } catch (e) {} }
function rgPromptHTML(f) {
  var noGeo = !rgGeoLine(f);
  if (!noGeo || !rgIsInCharge()) return '';
  var tn = ((NF_LEVELS[(typeof nfTypeOf === 'function' ? nfTypeOf(f) : 'sc')] || {}).name || 'facility');
  return '<div class="rg-prompt" id="rg-prompt"><b>' + rgT('Add your ' + rgE(tn) + '\'s location', 'अपने स्वास्थ्य केंद्र का स्थान जोड़ें') + '</b><span>' + rgT('Stand at the facility and tap the button — it puts you on the district map.', 'स्वास्थ्य केंद्र पर खड़े होकर बटन दबाएँ।') + '</span>'
    + '<button type="button" onclick="rgGeoOpen()">' + rgT('Use my location', 'मेरा स्थान लें') + '</button></div>';
}

// ── wiring ──
(function () {
  // HealSol Facilities page: the tab strip, and our views in place of the enrolled list
  if (typeof hsRenderFac === 'function') { var oF = hsRenderFac;
    hsRenderFac = function () {
      if (rgHS() && _rg.tab !== 'enrolled') { rgRender(); return; }
      var r = oF.apply(this, arguments);
      try { var box = document.getElementById('hs-fac'); if (box && rgHS() && !box.querySelector('.rg-tabs')) { var top = box.querySelector('.nfo-top'); if (top) top.insertAdjacentHTML('afterend', '<div class="rg-bar">' + rgTabs() + '</div>'); } } catch (e) {}
      return r; }; }
  // District Admin / MOIC Facilities page
  if (typeof hsrRenderFac === 'function') { var oR = hsrRenderFac;
    hsrRenderFac = function () {
      if (rgDist() && _rg.tab !== 'enrolled') { rgRender(); return; }
      var r = oR.apply(this, arguments);
      try { var box = document.getElementById('hsr-fac'); if (box && rgDist() && !box.querySelector('.rg-tabs')) { var top = box.querySelector('.nfo-top'); if (top) top.insertAdjacentHTML('afterend', '<div class="rg-bar">' + rgTabs() + '</div>'); } } catch (e) {}
      return r; }; }
  var oSet = rgSet;
  rgSet = function (k, v) { if (k === 'tab' && v === 'enrolled') { _rg.tab = 'enrolled'; _rg.sel = null; _rg.pick = null; if (_rg.map) { try { _rg.map.remove(); } catch (e) {} _rg.map = null; } if (rgHS()) hsRenderFac(); else if (rgDist()) hsrRenderFac(); return; } return oSet(k, v); };
  // SC staff app (CHO): Today prompt and a More row
  if (typeof nfRenderToday === 'function') { var oT = nfRenderToday;
    nfRenderToday = function () { var r = oT.apply(this, arguments);
      try { var host = document.getElementById('nf-today'), M = rgMyFac(); if (!host || !M || M.dept) return r; var old = document.getElementById('rg-prompt'); if (old) old.remove();
        var h = rgPromptHTML(M.f); if (h) { var at = document.getElementById('nfg-staff') || host.querySelector('.nf-hero'); if (at) at.insertAdjacentHTML('afterend', h); else host.insertAdjacentHTML('afterbegin', h); } } catch (e) { console.warn('[RG] today', e); }
      return r; }; }
  if (typeof faMore === 'function') { var oM = faMore;
    faMore = function () { var r = oM.apply(this, arguments);
      try { var a = document.getElementById('fa-acct'); if (!a || document.getElementById('rg-geo-row')) return r; var M = rgMyFac(); if (!M || !rgIsInCharge()) return r; var g = rgGeoLine(M.f);
        var html = '<button type="button" class="nf-row" id="rg-geo-row" onclick="rgGeoOpen()"><i class="ti ti-map"></i><span>' + rgT('Facility location', 'स्वास्थ्य केंद्र का स्थान') + ' <span class="nfl-st ' + (g ? 'ok' : 'no') + '">' + (g ? rgT('Added', 'दर्ज') : rgT('Not set', 'नहीं')) + '</span><small style="display:block;color:var(--t3);font-size:11.5px;">' + (g ? rgE(g) : rgT('Puts your facility on the district map', 'आपकी स्वास्थ्य केंद्र नक्शे पर')) + '</small></span><i class="ti ti-chevron-right nf-row-chev"></i></button>';
        var pr = document.getElementById('nfg-pop-row'); if (pr) pr.insertAdjacentHTML('afterend', html); else a.insertAdjacentHTML('afterbegin', html); } catch (e) { console.warn('[RG] more', e); }
      return r; }; }
  // UPHC / PHC / CHC in-charge: Facility dashboard home prompt and More → Facility details
  if (typeof nxFaHomeHTML === 'function') { var oH = nxFaHomeHTML; nxFaHomeHTML = function () { var h = oH.apply(this, arguments); try { var M = rgMyFac(); if (M && M.dept) { var p = rgPromptHTML(M.f); if (p) h = p + h; } } catch (e) {} return h; }; }
  if (typeof nxFaMoreHTML === 'function') { var oX = nxFaMoreHTML;
    nxFaMoreHTML = function () { var h = oX.apply(this, arguments);
      try { var M = rgMyFac(); if (M && M.dept && rgIsInCharge()) { var g = rgGeoLine(M.f), p = M.f.population && M.f.population.n;
        var mi = function (icon, t, sub, js, ok) { return '<button type="button" class="nx-mi" onclick="' + js + '"><i class="ti ' + icon + '"></i><span>' + t + ' <small class="nx-dim">' + sub + '</small></span><em class="rg-st2 ' + (ok ? 'ok' : 'no') + '">' + (ok ? 'Added' : 'Not set') + '</em></button>'; };
        h = '<div class="nx-sec"><b>Facility details</b></div><div class="nx-card nx-menu" id="rg-fd">' + mi('ti-map', 'Location', g ? rgE(g) : 'puts the facility on the district map', 'rgGeoOpen()', !!g) + mi('ti-users', 'Population served', p ? rgFmtN(p) : 'for coverage reports', 'rgPopEdit()', !!p) + '</div>' + h; } } catch (e) { console.warn('[RG] dept more', e); }
      return h; }; }
})();
