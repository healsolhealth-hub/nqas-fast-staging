// ══════════════════════════════════════════════════════════════
// HealSol Settings refinements (21 Oct 2026)
//   • facility picker for pop-ups: state / district / type filters, search, "Tick all" per group
//   • District Admin: state + district, "all facilities in this district, including ones enrolled later"
//   • Quality Champion: state + district, type filter and search over the Supervisor's facilities
//   (certificate signatory, timeline and pricing per facility type, Recognition list: below)
// ══════════════════════════════════════════════════════════════
function hsxE(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function hsxTypeName(t) { return (NF_LEVELS[t] || NF_LEVELS.sc).plural; }
// every enrolled facility as a picker item
function hsxFacItems() {
  var F = scMasterFacilities || {};
  return Object.keys(F).filter(function (c) { return F[c] && !F[c].migratedTo; }).map(function (c) {
    var f = F[c], t = nfTypeOf(f);
    return { value: c, name: f.name || c, district: f.district || '', state: f.state || '', type: t, prog: f.progId || '',
      label: (f.name || c) + ' · ' + c + ' · ' + scPkgShort(f.progId || 'nqas_12A') };
  }).sort(function (a, b) { return a.district.localeCompare(b.district) || a.name.localeCompare(b.name); });
}
function hsxStates() { return (typeof NF_STATE_LIST !== 'undefined' ? NF_STATE_LIST : []).map(function (x) { return x[0]; }); }
function hsxDistricts(state) { var c = ((typeof NF_STATE_LIST !== 'undefined' ? NF_STATE_LIST : []).find(function (x) { return x[0] === state; }) || [])[1]; return (typeof NF_DISTRICTS !== 'undefined' && NF_DISTRICTS[c]) || []; }
function hsxFillSelect(sel, opts, value, first) {
  if (!sel) return;
  sel.innerHTML = (first ? '<option value="">' + hsxE(first) + '</option>' : '') + opts.map(function (o) { var v = typeof o === 'string' ? o : o.value, l = typeof o === 'string' ? o : o.label; return '<option value="' + hsxE(v) + '"' + (String(v) === String(value || '') ? ' selected' : '') + '>' + hsxE(l) + '</option>'; }).join('');
}
// Render a grouped facility checklist into a scDialog checklist element (values() still reads input:checked).
// items: hsxFacItems(); groupBy: 'type' | 'district'; keeps ticks across re-renders.
function hsxPicker(el, items, selected, groupBy, emptyText) {
  var sel = (selected || []).map(String);
  el.innerHTML = ''; el.style.cssText = ''; el.classList.add('hsx-pick');
  if (!items.length) { el.textContent = emptyText || 'No facilities match.'; el.style.cssText = 'font-size:11px;color:var(--t3);'; return; }
  var groups = {}, order = [];
  items.forEach(function (it) { var g = groupBy === 'district' ? (it.district || 'No district') : hsxTypeName(it.type); if (!groups[g]) { groups[g] = []; order.push(g); } groups[g].push(it); });
  order.forEach(function (g) {
    var box = document.createElement('div'); box.className = 'hsx-grp';
    var hd = document.createElement('div'); hd.className = 'hsx-grp-hd';
    var b = document.createElement('b'); b.textContent = g + ' · ' + groups[g].length; hd.appendChild(b);
    var all = document.createElement('button'); all.type = 'button'; all.className = 'hsx-mini'; all.textContent = 'Tick all';
    all.onclick = function () { var cbs = [].filter.call(box.querySelectorAll('label.scx-chk'), function (lb) { return lb.style.display !== 'none'; }).map(function (lb) { return lb.querySelector('input'); }).filter(function (c) { return !c.disabled; });
      var on = cbs.some(function (c) { return !c.checked; }); cbs.forEach(function (c) { c.checked = on; c.parentNode.classList.toggle('on', on); c.dispatchEvent(new Event('change')); }); all.textContent = on ? 'Untick all' : 'Tick all'; };
    hd.appendChild(all); box.appendChild(hd);
    var row = document.createElement('div'); row.className = 'scx-chk-list'; row.style.maxHeight = 'none';
    groups[g].forEach(function (it) {
      var lb = document.createElement('label'); lb.className = 'scx-chk' + (sel.indexOf(it.value) >= 0 ? ' on' : '');
      lb.setAttribute('data-q', (it.name + ' ' + it.value + ' ' + it.district).toLowerCase());
      var cb = document.createElement('input'); cb.type = 'checkbox'; cb.value = it.value; cb.checked = sel.indexOf(it.value) >= 0;
      cb.addEventListener('change', function () { lb.classList.toggle('on', cb.checked); });
      lb.appendChild(cb); lb.appendChild(document.createTextNode(it.label)); row.appendChild(lb);
    });
    box.appendChild(row); el.appendChild(box);
  });
}
function hsxPickerSearch(el, q) {
  var t = String(q || '').trim().toLowerCase();
  el.querySelectorAll('.hsx-grp').forEach(function (g) { var n = 0; g.querySelectorAll('label.scx-chk').forEach(function (lb) { var on = !t || String(lb.getAttribute('data-q')).indexOf(t) >= 0; lb.style.display = on ? '' : 'none'; if (on) n++; }); g.style.display = n ? '' : 'none'; });
}
function hsxVals(el) { return el ? [].map.call(el.querySelectorAll('input:checked'), function (c) { return c.value; }) : []; }
// a filter row (type / district / search) placed above a checklist
function hsxFilterBar(el, parts) {
  var bar = document.createElement('div'); bar.className = 'hsx-fbar';
  var out = {};
  parts.forEach(function (p) {
    var x;
    if (p === 'search') { x = document.createElement('input'); x.className = 'scx-in'; x.placeholder = 'Search facility, ID or district…'; x.autocomplete = 'off'; }
    else { x = document.createElement('select'); x.className = 'scx-in'; }
    x.setAttribute('data-hsx', p); bar.appendChild(x); out[p] = x;
  });
  el.parentNode.insertBefore(bar, el);
  return out;
}

// ── District Admin ────────────────────────────────────────────
function hsxDistItems(state, district) {
  var low = function (x) { return String(x || '').trim().toLowerCase(); };
  return hsxFacItems().filter(function (it) { return (!state || low(it.state) === low(state)) && (!district || low(it.district) === low(district)); });
}
