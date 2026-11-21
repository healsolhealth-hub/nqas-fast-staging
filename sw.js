// NQAS | FAST service worker — made by app/build.js (do not edit site/sw.js; edit app/pwa/sw.js).
// • The page (index.html): the latest when the network answers within 1.5 s; otherwise the saved copy opens at once and
//   the latest is saved in the background for next time (offline: the app opens and says it cannot reach the server).
// • assets/… (name carries a content hash, never changes): cache first; a new build only downloads changed blocks.
// • Fixed-version libraries from gstatic (Firebase SDK) and cdnjs / jsdelivr / unpkg (jsPDF …): cache first.
// • Nothing else is touched: Firebase database / sign-in / functions, App Check, Razorpay, WhatsApp, the card page.
// Emergency switch: open the app with ?nosw=reset (removes this worker and its caches on that phone), or publish a sw.js
// that only unregisters itself.
const BUILD = "89cba8afc128";
const ASSETS = [
 "assets/data-sc-days.f202fca2e5.js",
 "assets/dept-admin.ee8d5ffab0.js",
 "assets/dept-content.216868c381.js",
 "assets/dept-core.298f55fad5.js",
 "assets/dept-core.4ed6e40053.css",
 "assets/dept-grad.1ac7433c09.js",
 "assets/dept-grad.c07401b26c.css",
 "assets/dept-master-ui.e493849b6c.js",
 "assets/dept-master.1ceca8c5a8.css",
 "assets/dept-master.8cc7ea5f67.js",
 "assets/dept-perf.8cb12ed429.js",
 "assets/dept-plan.e35a7f99c9.js",
 "assets/dept-review.28e080f175.js",
 "assets/dept-screens.2c800245d3.css",
 "assets/dept-screens.9c78e4007c.js",
 "assets/dept-summary.5fb8e55baf.js",
 "assets/dept-unlock.122201474a.js",
 "assets/sc-baseline-review.cba584c030.css",
 "assets/sc-baseline-review.fe49dd9480.js",
 "assets/sc-baseline7.d38d5e0f28.js",
 "assets/sc-build1.176238c84a.js",
 "assets/sc-build2.7bf047c30a.js",
 "assets/sc-build2.9b9d0fc3cf.css",
 "assets/sc-champion-verify.6be0e5d069.js",
 "assets/sc-champions.caf844a402.js",
 "assets/sc-champions.e1ab6daa4b.css",
 "assets/sc-checklist.f5e8f6206b.js",
 "assets/sc-compliance.db47e45d0f.js",
 "assets/sc-cp-master.c533185d48.js",
 "assets/sc-cp-progress.02e5f35df1.js",
 "assets/sc-cross-cutting.74584f8128.js",
 "assets/sc-day-placement.9f84827e93.js",
 "assets/sc-district.94320f56ac.js",
 "assets/sc-fadm.5bedb6f3f4.css",
 "assets/sc-fadm.dfad8a8bb9.js",
 "assets/sc-gaps.8a4a1631c2.js",
 "assets/sc-graduation.5fcd31094e.js",
 "assets/sc-healsol-view.fdd1503355.js",
 "assets/sc-hierarchy.4d51074fef.js",
 "assets/sc-how-to-fix.7dbba620cc.js",
 "assets/sc-implementation.8bce442784.js",
 "assets/sc-laptop.2c57667b0d.js",
 "assets/sc-laptop.3b958233dd.css",
 "assets/sc-linked-checks.0eddd56dc9.js",
 "assets/sc-links.128b1d1d45.js",
 "assets/sc-links.e145d9c6bb.css",
 "assets/sc-login-3tier.2923158b47.js",
 "assets/sc-looks-met.c2aaaff056.js",
 "assets/sc-perf.1a028d2c56.js",
 "assets/sc-phases.07a2a34a96.css",
 "assets/sc-phases.23968f3a3c.js",
 "assets/sc-plan-wa.6779c88a70.js",
 "assets/sc-prep-lists.f656ff32b2.js",
 "assets/sc-readiness.6cf4731cfe.js",
 "assets/sc-review-inbox.1806590a5c.js",
 "assets/sc-review.54a1bc1306.js",
 "assets/sc-staff-app.4f4b2c6a3d.css",
 "assets/sc-staff-app.dfc9643785.js",
 "assets/sc-summary.15830c67e5.js",
 "assets/sc-v2-core.91f954bf9d.js",
 "assets/sc-v2.bfc3486435.css",
 "assets/sc-week-plan.126d067680.js",
 "assets/shared-accountant.a3886b11ca.js",
 "assets/shared-assess.7905e88e71.js",
 "assets/shared-assess.a09970a869.css",
 "assets/shared-back-steps.e2d664b3e4.js",
 "assets/shared-bankpay.9b74de7822.css",
 "assets/shared-bankpay.dfa3d0f99e.js",
 "assets/shared-base.5275096455.css",
 "assets/shared-biz-dash.6781dbeb60.js",
 "assets/shared-biz-dash.c8831fea1d.css",
 "assets/shared-biz-report.7d0c383ae8.js",
 "assets/shared-brand.caf29d94d7.js",
 "assets/shared-business-ind.0814bee156.js",
 "assets/shared-business-ind.d97663522b.css",
 "assets/shared-cert-design.8bb45407bd.js",
 "assets/shared-cert.3b1db0651a.css",
 "assets/shared-cert.d1a45ad5ab.js",
 "assets/shared-content-shell.afbafa0c3e.css",
 "assets/shared-content-shell.ba4570feab.js",
 "assets/shared-dashboards.538fcc6c83.js",
 "assets/shared-dashboards.9030b996af.css",
 "assets/shared-demo.2ebfee440a.js",
 "assets/shared-enquiries.106de16b0e.js",
 "assets/shared-fac-page.7d7df7d9b9.css",
 "assets/shared-fac-page.f6d63b3ce5.js",
 "assets/shared-fac-ready.abcc07b2cb.js",
 "assets/shared-fac-sc.5e2a4ee502.js",
 "assets/shared-freebl.7a4f27d2b7.js",
 "assets/shared-getapp.8fe42b80ef.js",
 "assets/shared-hide-demo-ui.4b2f5a9239.js",
 "assets/shared-hindi-admin.a43e18db13.js",
 "assets/shared-hindi-dom.82e2be6c6a.js",
 "assets/shared-hindi-ui.4dcfc4c93a.js",
 "assets/shared-hs-home.8bbbf957dc.js",
 "assets/shared-hs-home.f2fa190596.css",
 "assets/shared-hs-pages.69e3f4fdd7.js",
 "assets/shared-hs-people.27b03a54f6.css",
 "assets/shared-hs-people.9db514dd1d.js",
 "assets/shared-hs-roles.d381b3e930.js",
 "assets/shared-hs-settings.f1365f98fb.js",
 "assets/shared-impact.497ea52277.js",
 "assets/shared-impact.cf89da6a80.css",
 "assets/shared-implstart.1446744e81.js",
 "assets/shared-invoices.02ba7a9c9b.js",
 "assets/shared-join.9428db2918.js",
 "assets/shared-join.dc1f2976b7.css",
 "assets/shared-launch.8c644d0f13.js",
 "assets/shared-offers.34751fff03.js",
 "assets/shared-one-login.772ed79108.css",
 "assets/shared-one-login.973a9e8d61.js",
 "assets/shared-one-ui.1b4350b497.css",
 "assets/shared-one-ui.c255a0db58.js",
 "assets/shared-otp.dfe8af10c9.js",
 "assets/shared-paylinks-admin.91e860033b.js",
 "assets/shared-payments.12fb4e5a71.js",
 "assets/shared-paypage.48e914e699.css",
 "assets/shared-paypage.65f124fc1e.js",
 "assets/shared-pdf-reports.1d3126482f.js",
 "assets/shared-pdf.105ae69b9e.js",
 "assets/shared-play-brand.5ff1546d4a.js",
 "assets/shared-play.cb2e293f2e.js",
 "assets/shared-profile.7819df7a1c.js",
 "assets/shared-profile.be420dea99.css",
 "assets/shared-promos.86d79bb8da.js",
 "assets/shared-push.827fb3f07d.js",
 "assets/shared-qi-start.0c0a500d2c.js",
 "assets/shared-qi-start.2220ec1eff.css",
 "assets/shared-qimove.d9cef5b7f6.js",
 "assets/shared-registration.6833f0a40c.js",
 "assets/shared-registry.0152bb4061.css",
 "assets/shared-registry.a1047f8ae0.js",
 "assets/shared-reports.69da7fca0e.js",
 "assets/shared-review-fixes.c3f0ee2481.js",
 "assets/shared-review-fixes.c5ae88ebba.css",
 "assets/shared-sc-content.057fe71840.js",
 "assets/shared-sc-content.4dd2befa79.css",
 "assets/shared-sc-draft.672ef4231a.js",
 "assets/shared-secure.613bbaaa24.js",
 "assets/shared-settings-panels.265369271f.js",
 "assets/shared-settings-panels.bdc5b8ccfb.css",
 "assets/shared-startdate.643905932c.js",
 "assets/shared-tourcodes.6848cfe516.js",
 "assets/shared-verifylinks.c143f90b05.js",
 "assets/shared-vocab.22993a26fc.js",
 "assets/shared-whatsapp.a1352a77c3.js",
 "assets/types-settings.7241570a21.js",
 "assets/vendor-poppins-font.0ea9314335.css",
 "assets/vendor-qrcode.fabb956c75.js",
 "icons/apple-touch-icon.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "icons/play-qr.png",
 "icons/qi-apple-touch-icon.png",
 "icons/qi-icon-192.png",
 "icons/qi-icon-512.png",
 "icons/qi-icon-maskable-512.png",
 "icons/qi-logo.jpg",
 "manifest.webmanifest"
];
const KEEP = [
 "assets/data-chc-checklist.1d22f2ed41.json",
 "assets/data-chc-fix.ad0f694a2c.json",
 "assets/data-chc-hindi.fa7c99a1ef.json",
 "assets/data-phc-checklist.0f179b7980.json",
 "assets/data-phc-fix.4875d574ef.json",
 "assets/data-phc-hindi.32c71d43c3.json",
 "assets/data-sc-checkpoints.faf119347a.js",
 "assets/data-sc-how-to-fix.370427c0e7.js",
 "assets/data-uphc-checklist.09cb37887b.json",
 "assets/data-uphc-fix.a1e44c80ea.json",
 "assets/data-uphc-hindi.29e9e07d2c.json",
 "assets/font-58dba357cb.woff2",
 "assets/font-6b986471df.woff2",
 "assets/font-7d93459d86.woff2",
 "assets/font-9338e65fc0.woff2",
 "assets/font-cd36de204a.woff2",
 "assets/font-de10eb6f1f.woff2",
 "assets/font-f018c9ad67.woff2",
 "assets/font-f4e80d9dfd.woff2",
 "assets/vendor-pdf-fonts.d24cedb333.js",
 "assets/vendor-sign-font.245deebf21.js"
];   // data, fonts and on-demand scripts: not downloaded at install, but not thrown away while still used
const STATIC = 'nqf-static', PAGES = 'nqf-pages', LIBS = 'nqf-libs';
const LIB_RE = /^https:\/\/(www\.gstatic\.com\/firebasejs\/\d+\.\d+\.\d+\/|cdnjs\.cloudflare\.com\/ajax\/libs\/[^/]+\/\d[^/]*\/|cdn\.jsdelivr\.net\/npm\/[^/]+@\d[^/]*\/|unpkg\.com\/[^/]+@\d[^/]*\/)/;
const scopeUrl = p => new URL(p, self.registration.scope).href;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(STATIC), have = new Set((await c.keys()).map(r => r.url));
    // only what this build adds; a failed download is retried on first use
    await Promise.all(ASSETS.map(scopeUrl).filter(u => !have.has(u)).map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = new Set(ASSETS.concat(KEEP).map(scopeUrl)), c = await caches.open(STATIC);
    await Promise.all((await c.keys()).filter(r => !keep.has(r.url)).map(r => c.delete(r)));   // blocks of older builds
    const names = await caches.keys();
    await Promise.all(names.filter(n => [STATIC, PAGES, LIBS].indexOf(n) < 0).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

async function networkFirstPage(req, ev) {
  // The newest page if the network answers within 1.5 s; otherwise the saved copy opens at once and the new page
  // is saved in the background for the next opening (6 Nov 2026 — was: wait up to 6 s on a weak signal).
  const c = await caches.open(PAGES), key = scopeUrl('./');
  const net = fetch(req).then(res => { if (res && res.ok && res.type === 'basic') c.put(key, res.clone()); return res; });
  const hit = await c.match(key);
  if (!hit) return net;                                   // first opening on this phone: wait for the network
  if (ev) ev.waitUntil(net.catch(() => {}));              // keep the background update alive
  try { return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 1500))]); }
  catch (err) { return hit; }
}
async function cacheFirst(name, req) {
  const c = await caches.open(name), hit = await c.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone());
  return res;
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url), scope = new URL(self.registration.scope);
  if (url.origin === scope.origin && url.pathname.startsWith(scope.pathname)) {
    const rel = url.pathname.slice(scope.pathname.length);
    if (rel === '' || rel === 'index.html') { if (url.searchParams.has('cert') || url.searchParams.has('impact')) return; e.respondWith(networkFirstPage(req, e)); return; }   // the app page (Verify links: plain network)
    if (rel.startsWith('assets/')) { e.respondWith(cacheFirst(STATIC, req)); return; }
    return;                                             // manifest, icons, app-inline.html …: normal network
  }
  if (LIB_RE.test(req.url)) e.respondWith(cacheFirst(LIBS, req));
});

// ── Push notifications (4 Nov 2026): messages come from the server (functions/push.js) as data {title, body, url, tag} ──
self.addEventListener('push', e => {
  let d = {}; try { const j = e.data ? e.data.json() : {}; d = j.data || j.notification || j || {}; } catch (x) { try { d = { body: e.data.text() }; } catch (y) {} }
  const title = d.title || 'NQAS | FAST';
  e.waitUntil(self.registration.showNotification(title, { body: d.body || '', tag: d.tag || 'nqf', renotify: true, icon: scopeUrl('icons/icon-192.png'), badge: scopeUrl('icons/icon-192.png'), data: { url: d.url || scopeUrl('./') } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close(); const url = (e.notification.data && e.notification.data.url) || scopeUrl('./');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) return c.focus(); }
    return self.clients.openWindow ? self.clients.openWindow(url) : null; }));
});
