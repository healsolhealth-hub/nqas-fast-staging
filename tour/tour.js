/* NQAS | FAST app tour (18 Nov 2026) — one engine for the public tour (/tour/) and the role tours (/tour/<role>/, by access code) */
(function () {
  'use strict';
  var D = window.NQT || { tours: [], diff: [] }, R = window.NQT_ROLE || null, BASE = R ? '../' : '';
  var S = { type: 'sc', p: 0, play: false, list: [], t0: 0, timer: null, raf: null };
  try { var st = localStorage.getItem('nqt-type'); if (/^(sc|uphc|phc|chc)$/.test(st)) S.type = st; } catch (e) {}
  var TYPES = [['sc', 'Sub-Centre'], ['uphc', 'UPHC'], ['phc', 'PHC'], ['chc', 'CHC']];
  var POINT_MS = 3800, STEP_MS = 6000;
  var root = document.getElementById('app');
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function small() { return window.matchMedia && window.matchMedia('(max-width:900px)').matches; }
  function reduce() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function tour(id) { return D.tours.filter(function (t) { return t.id === id; })[0]; }
  function steps(T) { return (T.steps || []).filter(function (s) { return !s.only || s.only.indexOf(S.type) >= 0; }); }
  function vr(s) { if (!s.v) return s; return s.v[S.type] || (S.type !== 'sc' && s.v.dept) || s.v.sc || s.v[Object.keys(s.v)[0]]; }
  function img(u) { return /^data:/.test(u) ? u : BASE + u; }
  function typeName() { return (TYPES.filter(function (x) { return x[0] === S.type; })[0] || TYPES[0])[1]; }
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>';
  // 18 Nov 2026: on an Android phone (in a browser) the button opens the Qi FAST app, or Google Play when it is not installed
  function openApp() {
    var and = /Android/i.test(navigator.userAgent || ''), sa = false;
    try { sa = window.matchMedia && (window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches); } catch (e) {}
    if (and && !sa) return '<a class="btn dark sm" href="intent://app.thehealsol.com/#Intent;scheme=https;package=com.thehealsol.qifast;S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.thehealsol.qifast') + ';end">Open Qi FAST</a>';
    return '<a class="btn dark sm" href="https://app.thehealsol.com">Open the app</a>';
  }
  function mark() { return '<a class="mark" href="#">NQAS <i>|</i> FAST <span>Tour</span></a>'; }
  function foot() {
    return '<footer class="foot"><p>Screens show sample data. Based on the National Quality Assurance Standards. NQAS | FAST is an independent programme by HealSol Academy; it is not a government app and does not certify facilities. Questions: info@thehealsol.com · WhatsApp +91 83840 63112</p>'
      + '<div class="fam">Part of the <img src="' + BASE + '../icons/qi-logo.jpg" alt="Qi FAST"> family</div></footer>';
  }
  function setType(t) { S.type = t; try { localStorage.setItem('nqt-type', t); } catch (e) {} }
  function playlist() { return R ? ['how', R.id] : ['how', 'join', 'staff', 'incharge']; }

  // ── routing ──
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  window.addEventListener('hashchange', function () { render(); });
  function parse() { var h = location.hash.replace(/^#/, ''), m = /^t\/([a-z-]+)\/(\d+)$/.exec(h); if (m) return { v: 'step', t: m[1], n: +m[2] }; if (h === 'different') return { v: 'diff' }; return { v: 'home' }; }
  function render() {
    stopTimer();
    if (R && !R.ready) { gate(); return; }
    var r = parse();
    if (r.v === 'step' && tour(r.t)) { var T = tour(r.t), L = steps(T); if (r.n >= 1 && r.n <= L.length) { stepView(T, r.n - 1); return; } }
    if (r.v === 'diff' && !R) { diffView(); return; }
    S.play = false; R ? landing() : home();
  }

  // ── public home ──
  function home() {
    document.title = 'NQAS | FAST · App tour';
    var pub = ['how', 'join', 'staff', 'incharge'].map(tour).filter(Boolean), first = steps(tour('staff') || { steps: [] })[0];
    var hero = first ? vr(first).img : '';
    root.innerHTML = '<header class="bar">' + mark() + '' + openApp() + '</header>'
      + '<main class="wrap"><section class="hero"><div class="t"><p class="eyebrow">App tour</p><h1 class="disp">See how NQAS | FAST works, screen by screen</h1>'
      + '<p class="lead">Pick where you want to start. Each step shows a real screen with sample data, what each part is for, and a tip for using it well.</p>'
      + '<div class="acts"><button type="button" class="btn" id="h-play">' + PLAY + 'Auto-play the whole tour</button><button type="button" class="btn ghost" id="h-start">Start with how it works</button></div></div>'
      + (hero ? '<div class="ph"><div class="phone"><img src="' + img(hero) + '" alt="A staff member’s Today screen, sample data" width="390" height="844"></div></div>' : '') + '</section>'
      + '<section class="sec" aria-labelledby="h-ch"><h2 class="disp" id="h-ch">Chapters</h2><div class="grid">'
      + pub.map(function (T, i) { return '<a class="ch' + (i === 0 ? ' first' : '') + '" href="#t/' + T.id + '/1"><p class="n">' + (i + 1) + ' · ' + steps(T).length + ' steps</p><h3>' + E(T.title) + '</h3><p>' + E(T.intro) + '</p></a>'; }).join('')
      + '</div><div class="types"><p id="h-tl">Show screens for</p><div class="seg" role="group" aria-labelledby="h-tl">'
      + TYPES.map(function (x) { return '<button type="button" data-t="' + x[0] + '" aria-pressed="' + (S.type === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div><small>Staff and in-charge screens change with the facility type.</small></div>'
      + '<button type="button" class="diff" id="h-diff"><div><p class="eyebrow" style="color:var(--sa3)">5 · Summary</p><h3>What makes NQAS | FAST different</h3><p>The features you won’t find in a checklist or a spreadsheet, each linked to the step that shows it.</p></div><span>See all ' + (D.diff || []).length + ' →</span></button>'
      + '</section></main>' + foot();
    root.querySelector('#h-play').onclick = function () { startPlay(); };
    root.querySelector('#h-start').onclick = function () { go('#t/how/1'); };
    root.querySelector('#h-diff').onclick = function () { go('#different'); };
    [].forEach.call(root.querySelectorAll('.seg button'), function (b) { b.onclick = function () { setType(b.dataset.t); home(); var nb = root.querySelector('.seg button[data-t="' + S.type + '"]'); if (nb) nb.focus(); }; });
    window.scrollTo(0, 0);
  }
  function startPlay(list) { S.list = (list || playlist()).filter(function (id) { return tour(id) && steps(tour(id)).length; }); if (!S.list.length) return; S.play = true; S.p = 0; go('#t/' + S.list[0] + '/1'); }

  // ── one step ──
  function stepView(T, i) {
    var L = steps(T), s = L[i], v = vr(s), pts = v.pts || s.pts || [], cn = s.k === 'concept', sm = small();
    if (S.p >= pts.length) S.p = 0;
    document.title = s.title + ' · ' + T.title + ' · NQAS | FAST tour';
    var next = i + 1 < L.length ? L[i + 1] : null, nt = !next && S.list.length ? nextTour(T.id) : null;
    var upNext = next ? next.title : nt ? 'Chapter: ' + nt.title : '', nextLbl = next || nt ? 'Next' : (R ? 'Back to the start' : 'Back to the chapters');
    var stage = cn ? art(s, pts) : device(v, pts);
    root.innerHTML = '<header class="bar"><div class="crumb">' + mark() + '<span class="sep" aria-hidden="true">/</span><b>' + E(T.title) + '</b>'
      + (T.types ? '<span class="chip">' + E(typeName()) + '</span>' : '') + (R && T.id === R.id ? '<span class="chip dark">' + E('For ' + (R.who || T.who || '')) + '</span>' : '') + '</div>'
      + (T.types && !sm ? '<div class="seg" role="group" aria-label="Facility type">' + TYPES.map(function (x) { return '<button type="button" data-t="' + x[0] + '" aria-pressed="' + (S.type === x[0]) + '">' + x[1] + '</button>'; }).join('') + '</div>' : '') + '</header>'
      + '<main class="step' + (S.play ? ' playing' : '') + '"><div class="stage' + (cn ? ' cn' : '') + '" id="stage">' + stage + (S.play ? '<div class="apbar" aria-hidden="true"><i id="apb"></i></div>' : '') + '</div>'
      + '<section class="side" aria-live="polite"><p class="meta">Step ' + (i + 1) + ' of ' + L.length + (s.phase ? ' · ' + E(s.phase) : '') + '</p>'
      + '<h1 class="disp">' + E(s.title) + '</h1>' + (s.unique ? '<span class="uniq">Only in NQAS | FAST</span>' : '') + '<p class="txt">' + E(s.text) + '</p>'
      + (pts.length ? '<ol class="pts' + (sm ? ' one' : '') + '">' + pts.map(function (p, k) { return '<li class="' + (k === S.p ? 'on' : '') + '"><button type="button" data-p="' + k + '"><span class="k">' + (k + 1) + '</span><span class="x"><b>' + E(p.l) + '.</b> ' + E(p.t) + '</span></button></li>'; }).join('') + '</ol>' : '')
      + (s.tip ? '<div class="tip"><small>How to use it well</small><p>' + E(s.tip) + '</p></div>' : '')
      + '<div class="nav">' + (upNext && !sm ? '<p class="upn">Up next: ' + E(upNext) + '</p>' : '') + '<div class="prog" aria-hidden="true">' + L.map(function (x, k) { return '<span class="' + (k <= i ? 'd' : '') + '"></span>'; }).join('') + '</div>'
      + '<div class="navb"><button type="button" class="btn plain" id="s-back" aria-label="Back">←<span class="lbl"> Back</span></button>'
      + '<button type="button" class="btn ghost ap" id="s-play" aria-label="' + (S.play ? 'Pause auto-play' : 'Auto-play') + '">' + (S.play ? PAUSE : PLAY) + '<span class="lbl">' + (S.play ? ' Pause' : ' Auto-play') + '</span></button>'
      + '<button type="button" class="btn nx" id="s-next"><span>' + E(sm && S.p + 1 < pts.length ? 'Next point →' : nextLbl + ' →') + '</span></button></div></div></section></main>';
    var A = { T: T, i: i, L: L, pts: pts, next: next, nt: nt };
    root.querySelector('#s-next').onclick = function () { S.play = false; advance(A, sm); };
    root.querySelector('#s-back').onclick = function () { S.play = false; back(A, sm); };
    root.querySelector('#s-play').onclick = function () { if (S.play) { S.play = false; stopTimer(); stepView(T, i); } else { if (!S.list.length || S.list.indexOf(T.id) < 0) S.list = [T.id]; S.play = true; stepView(T, i); } };
    [].forEach.call(root.querySelectorAll('.pts button,.dot'), function (b) { b.onclick = function () { S.play = false; S.p = +b.dataset.p; stepView(T, i); }; });
    [].forEach.call(root.querySelectorAll('header .seg button'), function (b) { b.onclick = function () { setType(b.dataset.t); S.p = 0; var L2 = steps(T); go('#t/' + T.id + '/' + Math.min(i + 1, L2.length)); render(); }; });
    place();
    var im = root.querySelector('#stage img'); if (im && !im.complete) im.onload = place;
    if (S.play) startTimer(A, pts.length ? POINT_MS : STEP_MS);
    window.scrollTo(0, 0);
  }
  function nextTour(id) { var k = S.list.indexOf(id); return k >= 0 && k + 1 < S.list.length ? tour(S.list[k + 1]) : null; }
  function advance(A, sm) {
    if ((sm || S.play) && S.p + 1 < A.pts.length) { S.p++; stepView(A.T, A.i); return; }
    S.p = 0;
    if (A.next) { go('#t/' + A.T.id + '/' + (A.i + 2)); return; }
    if (A.nt) { go('#t/' + A.nt.id + '/1'); return; }
    S.play = false; S.list = []; go(R ? '#' : '#');
    if (location.hash === '' || location.hash === '#') render();
  }
  function back(A, sm) {
    if (sm && S.p > 0) { S.p--; stepView(A.T, A.i); return; }
    S.p = 0; if (A.i > 0) go('#t/' + A.T.id + '/' + A.i); else go('#');
  }
  function stopTimer() { clearTimeout(S.timer); cancelAnimationFrame(S.raf); }
  function startTimer(A, ms) {
    var t0 = Date.now(), bar = document.getElementById('apb');
    var tick = function () { var f = Math.min(1, (Date.now() - t0) / ms); if (bar) bar.style.width = (f * 100) + '%'; if (f < 1) S.raf = requestAnimationFrame(tick); };
    if (!reduce()) tick();
    S.timer = setTimeout(function () { if (S.play) advance(A, small()); }, ms);
  }

  // screenshot with the ring and numbered points
  function device(v, pts) {
    var ph = v.dev !== 'laptop', p = pts[S.p], b = p && p.b;
    var ring = b ? '<div class="ring" style="left:' + pc(b[0] - 0.008) + ';top:' + pc(b[1] - 0.006) + ';width:' + pc(b[2] - b[0] + 0.016) + ';height:' + pc(b[3] - b[1] + 0.012) + '"></div>' : '';
    var dots = pts.map(function (q, k) { if (!q.b) return ''; var x = Math.max(q.b[0] - (ph ? 0.035 : 0.012), 0.04), y = (q.b[1] + q.b[3]) / 2;
      return '<button type="button" class="dot' + (k === S.p ? ' on' : '') + '" data-p="' + k + '" style="left:' + pc(x) + ';top:' + pc(y) + '" aria-label="Point ' + (k + 1) + ': ' + E(q.l) + '">' + (k + 1) + '</button>'; }).join('');
    return '<div class="dev ' + (ph ? 'phone-d' : 'lap-d') + '"><div class="scr"><div class="vp"><div class="mv" id="mv"><img src="' + img(v.img) + '" alt="' + E(v.alt || 'App screen, sample data') + '" width="' + (ph ? 390 : 1280) + '" height="' + (ph ? 844 : 800) + '">' + ring + dots + '</div></div></div></div>';
  }
  function pc(x) { return (x * 100).toFixed(2) + '%'; }
  function place() {   // on a phone the screen scrolls so the current point is in view
    var mv = document.getElementById('mv'); if (!mv) return; mv.style.transform = ''; mv.style.width = '';
    if (!small()) return; var vp = mv.parentNode, r = mv.querySelector('.ring'), lap = !!mv.closest('.lap-d');
    if (lap) mv.style.width = '230%';   // a laptop screen is zoomed in on the current point
    if (!r) return;
    var H = mv.offsetHeight, V = vp.offsetHeight, W = mv.offsetWidth, VW = vp.offsetWidth;
    var cy = r.offsetTop + r.offsetHeight / 2, cx = r.offsetLeft + r.offsetWidth / 2;
    var oy = Math.max(0, Math.min(H - V, cy - V / 2)), ox = lap ? Math.max(0, Math.min(W - VW, cx - VW / 2)) : 0;
    mv.style.transform = 'translate(' + (-ox) + 'px,' + (-oy) + 'px)';
  }
  window.addEventListener('resize', function () { place(); });

  // concept steps: drawn, not screenshots
  function art(s, pts) {
    if (s.art === 'path') {
      var seg = function (cls, f, b, d, k, mw) { return '<div class="sg ' + cls + (k === S.p || (k === 2 && S.p === 2 && cls === 'r') ? ' on' : '') + '" style="flex:' + f + (mw ? ';min-width:' + mw + 'px' : '') + '"><b>' + b + '</b>' + d + '</div>'; };
      return '<div class="art"><p class="big disp">60 or 90 days, four stages</p><div class="path"><p>Sub-Centre · UPHC · PHC · 60 days</p><div class="row">' + seg('b', 7, 'Baseline', '1–7', 0, 84) + seg('i', 42, 'Implementation', 'Days 8–49 · 6 weekly themes', 1) + seg('e', 7, 'End-line', '50–56', 2, 84) + seg('r', 4, 'Ready', '57–60', 2, 70) + '</div>'
        + '<p>CHC · 90 days</p><div class="row">' + seg('b', 14, 'Baseline', '1–14', 0, 84) + seg('i', 56, 'Implementation', 'Days 15–70 · 8 weekly themes', 1) + seg('e', 14, 'End-line', '71–84', 2, 84) + seg('r', 6, 'Ready', '85–90', 2, 70) + '</div></div>'
        + '<div class="cards">' + pts.map(function (p, k) { return '<div class="c' + (k === S.p ? ' on' : '') + '"><b>' + E(p.l) + '</b><span>' + E(p.t) + '</span></div>'; }).join('') + '</div></div>';
    }
    return '<div class="art"><p class="big disp">' + E(s.title) + '</p><div class="cards">' + pts.map(function (p, k) { return '<div class="c' + (k === S.p ? ' on' : '') + '"><span class="num">' + (k + 1) + '</span><b>' + E(p.l) + '</b><span>' + E(p.t) + '</span></div>'; }).join('') + '</div></div>';
  }

  // ── what makes it different ──
  function diffView() {
    document.title = 'What makes NQAS | FAST different · NQAS | FAST tour';
    root.innerHTML = '<header class="bar">' + mark() + '' + openApp() + '</header><main class="wrap"><section class="hero" style="padding-bottom:20px"><div class="t"><p class="eyebrow">Summary</p><h1 class="disp">What makes NQAS | FAST different</h1><p class="lead">Tap any one to see it in the app.</p></div></section>'
      + '<section class="sec"><div class="dgrid">' + (D.diff || []).map(function (d, k) { return '<button type="button" class="dcard" data-k="' + k + '"><span class="k">' + (k + 1) + '</span><span><b>' + E(d[0]) + '</b><span>' + E(d[1]) + '</span></span></button>'; }).join('') + '</div>'
      + '<div class="acts"><a class="btn ghost" href="#">← All chapters</a></div></section></main>' + foot();
    [].forEach.call(root.querySelectorAll('.dcard'), function (b) { b.onclick = function () { var d = D.diff[+b.dataset.k], T = tour(d[2]); if (!T) return; var want = T.steps[d[3]], L = steps(T), n = Math.max(0, L.indexOf(want)); S.p = 0; S.list = []; go('#t/' + d[2] + '/' + (n + 1)); }; });
    window.scrollTo(0, 0);
  }

  // ── role tours: access code, then the landing ──
  function apiUrl() {
    if (window.NQT_API) return window.NQT_API; var h = location.hostname;
    if (h === 'staging.thehealsol.com') return 'https://asia-south1-healsol-nqas-uphc.cloudfunctions.net/tourOpen';
    return 'https://asia-south1-healsol-nqas.cloudfunctions.net/tourOpen';
  }
  function b64(s) { var b = atob(s), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
  async function unlock(key) {
    var res = await fetch(R.enc || 'data.enc', { cache: 'no-store' }); if (!res.ok) throw new Error('data');
    var buf = new Uint8Array(await res.arrayBuffer()), k = await crypto.subtle.importKey('raw', b64(key), { name: 'AES-GCM' }, false, ['decrypt']);
    var plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: buf.slice(0, 12) }, k, buf.slice(12));
    var T = JSON.parse(new TextDecoder().decode(plain)); D.tours = D.tours.filter(function (t) { return t.id !== T.id; }).concat([T]); R.ready = true;
  }
  function gate(msg) {
    document.title = (R.title || 'Tour') + ' · NQAS | FAST tour';
    var saved = null; try { saved = sessionStorage.getItem('nqt-k-' + R.id); } catch (e) {}
    if (saved && !msg) { unlock(saved).then(render).catch(function () { try { sessionStorage.removeItem('nqt-k-' + R.id); } catch (e) {} gate(); }); root.innerHTML = '<header class="bar">' + mark() + '</header><div class="gate"><p>Opening the tour…</p></div>'; return; }
    root.innerHTML = '<header class="bar">' + mark() + '</header><main class="gate"><form id="g-f" novalidate><span class="chip dark" style="align-self:flex-start">' + E(R.title + ' tour') + '</span>'
      + '<h1 class="disp">This tour is shared by invitation</h1><p class="txt" style="font-size:16px;line-height:1.5;color:var(--ink2)">Enter the access code HealSol sent you.</p>'
      + (msg ? '<div class="err" role="alert">' + E(msg) + '</div>' : '')
      + '<label for="g-c">Access code</label><input id="g-c" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="20" required>'
      + '<button type="submit" class="btn" id="g-go">Open the tour</button>'
      + '<small>No code? Ask HealSol: info@thehealsol.com · WhatsApp +91 83840 63112</small><small>Or see the <a href="../">public tour</a>, open to everyone.</small></form></main>';
    var f = root.querySelector('#g-f'), inp = root.querySelector('#g-c'); inp.focus();
    f.onsubmit = async function (e) {
      e.preventDefault(); var code = inp.value.trim().toUpperCase().replace(/\s+/g, ''); if (!/^[A-Z0-9-]{6,20}$/.test(code)) { gate('Check the code and try again.'); return; }
      var btn = root.querySelector('#g-go'); btn.disabled = true; btn.textContent = 'Checking…';
      try {
        var r = await fetch(apiUrl(), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: code, tour: R.id, dev: small() ? 'phone' : 'laptop' }) });
        var j = await r.json().catch(function () { return {}; });
        if (!r.ok || !j.key) { gate(j.error || 'This code does not open this tour. Check it, or ask HealSol for a new one.'); return; }
        await unlock(j.key); try { sessionStorage.setItem('nqt-k-' + R.id, j.key); } catch (x) {}
        render();
      } catch (x) { gate('Could not check the code — check the internet and try again.'); }
    };
  }
  function landing() {
    var T = tour(R.id); if (!T) { R.ready = false; gate(); return; }
    var how = tour('how'), L = steps(T), sh = L.filter(function (s) { return s.k !== 'concept'; })[0], v = sh ? vr(sh) : null;
    document.title = T.title + ' tour · NQAS | FAST';
    root.innerHTML = '<header class="bar"><div class="crumb">' + mark() + '<span class="chip dark">' + E('Prepared for ' + (T.who || R.who || '')) + '</span></div></header>'
      + '<main class="wrap"><section class="land"><div style="display:flex;flex-direction:column;gap:16px"><p class="eyebrow">' + E(T.title) + '</p><h1 class="disp">' + E(T.intro) + '</h1>'
      + '<p class="lead" style="font-size:17px;line-height:1.5;color:var(--ink2)">' + (how ? 'Starts with a short look at how NQAS | FAST works, then ' : '') + L.length + ' steps for ' + E(T.who || 'you') + '.</p>'
      + '<div class="acts"><button type="button" class="btn" id="l-play">' + PLAY + 'Auto-play</button><button type="button" class="btn ghost" id="l-step">Step through</button></div>'
      + '<ol class="list">' + (how ? '<li><button type="button" data-t="how" data-n="1"><b>0</b><span>How NQAS | FAST works (' + steps(how).length + ' short steps)</span></button></li>' : '')
      + L.map(function (s, k) { return '<li><button type="button" data-t="' + T.id + '" data-n="' + (k + 1) + '"><b>' + (k + 1) + '</b><span>' + E(s.title) + '</span></button></li>'; }).join('') + '</ol></div>'
      + (v ? '<div><div class="' + (v.dev === 'laptop' ? 'dev lap-d' : 'dev phone-d') + '" style="' + (v.dev === 'laptop' ? '' : 'margin:0 auto') + '"><div class="scr"><img src="' + img(v.img) + '" alt="' + E(T.title) + ' screen, sample data"></div></div><p style="font-size:13.5px;color:var(--mute);margin-top:10px">Sample data.</p></div>' : '')
      + '</section></main>' + foot();
    root.querySelector('#l-play').onclick = function () { startPlay(); };
    root.querySelector('#l-step').onclick = function () { S.list = playlist(); S.p = 0; go('#t/' + (how ? 'how' : T.id) + '/1'); };
    [].forEach.call(root.querySelectorAll('.list button'), function (b) { b.onclick = function () { S.list = playlist(); S.p = 0; go('#t/' + b.dataset.t + '/' + b.dataset.n); }; });
    window.scrollTo(0, 0);
  }
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test((e.target && e.target.tagName) || '')) return;
    var nb = document.getElementById('s-next'), bb = document.getElementById('s-back');
    if (e.key === 'ArrowRight' && nb) { nb.click(); } else if (e.key === 'ArrowLeft' && bb) { bb.click(); }
  });
  render();
})();
