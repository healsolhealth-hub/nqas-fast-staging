// NQAS | FAST service worker — made by app/build.js (do not edit site/sw.js; edit app/pwa/sw.js).
// • The page (index.html): network first, so everyone gets the latest app when online; the last copy
//   is used only when the network fails or takes longer than 6 s (offline: the app opens and says it cannot reach the server).
// • assets/… (name carries a content hash, never changes): cache first; a new build only downloads changed blocks.
// • Fixed-version libraries from gstatic (Firebase SDK) and cdnjs / jsdelivr / unpkg (jsPDF …): cache first.
// • Nothing else is touched: Firebase database / sign-in / functions, App Check, Razorpay, WhatsApp, the card page.
// Emergency switch: open the app with ?nosw=reset (removes this worker and its caches on that phone), or publish a sw.js
// that only unregisters itself.
const BUILD = "0d395ca984e9";
const ASSETS = [
 "assets/data-sc-days.0eb3c1d272.js",
 "assets/dept-admin.ee8d5ffab0.js",
 "assets/dept-content.bbcfa094c1.js",
 "assets/dept-core.4ed6e40053.css",
 "assets/dept-core.fa10621186.js",
 "assets/dept-grad.1ac7433c09.js",
 "assets/dept-grad.c07401b26c.css",
 "assets/dept-master-ui.e493849b6c.js",
 "assets/dept-master.1ceca8c5a8.css",
 "assets/dept-master.8cc7ea5f67.js",
 "assets/dept-plan.e35a7f99c9.js",
 "assets/dept-review.28e080f175.js",
 "assets/dept-screens.1ab0b095db.js",
 "assets/dept-screens.f9291d80a9.css",
 "assets/dept-summary.5fb8e55baf.js",
 "assets/sc-baseline-review.9bd6ffb924.js",
 "assets/sc-baseline-review.cba584c030.css",
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
 "assets/sc-fadm.1fb01e6ce7.css",
 "assets/sc-fadm.3f3b4d2d74.js",
 "assets/sc-gaps.df1042b0ae.js",
 "assets/sc-graduation.5fcd31094e.js",
 "assets/sc-healsol-view.fdd1503355.js",
 "assets/sc-hierarchy.4d51074fef.js",
 "assets/sc-how-to-fix.7dbba620cc.js",
 "assets/sc-implementation.8bce442784.js",
 "assets/sc-laptop.3b958233dd.css",
 "assets/sc-laptop.a3d55c3bdb.js",
 "assets/sc-linked-checks.0eddd56dc9.js",
 "assets/sc-links.776611d768.js",
 "assets/sc-links.e145d9c6bb.css",
 "assets/sc-login-3tier.6baeea5ce4.js",
 "assets/sc-looks-met.c2aaaff056.js",
 "assets/sc-phases.07a2a34a96.css",
 "assets/sc-phases.23968f3a3c.js",
 "assets/sc-plan-wa.4a4291bea8.js",
 "assets/sc-prep-lists.f656ff32b2.js",
 "assets/sc-readiness.6cf4731cfe.js",
 "assets/sc-review-inbox.1806590a5c.js",
 "assets/sc-review.54a1bc1306.js",
 "assets/sc-staff-app.14042a7974.js",
 "assets/sc-staff-app.e0189e484b.css",
 "assets/sc-summary.0ba9eaf152.js",
 "assets/sc-v2-core.329f5d3321.js",
 "assets/sc-v2.bfc3486435.css",
 "assets/sc-week-plan.126d067680.js",
 "assets/shared-base.296e41553e.css",
 "assets/shared-biz-dash.1058fd58bd.js",
 "assets/shared-biz-dash.c8831fea1d.css",
 "assets/shared-biz-report.7d0c383ae8.js",
 "assets/shared-brand.1b47ef65ba.js",
 "assets/shared-business-ind.a9e4d359b8.js",
 "assets/shared-business-ind.d97663522b.css",
 "assets/shared-cert.210bb0517e.js",
 "assets/shared-cert.50af794399.css",
 "assets/shared-content-shell.afbafa0c3e.css",
 "assets/shared-content-shell.ba4570feab.js",
 "assets/shared-dashboards.6389b2bdbd.js",
 "assets/shared-dashboards.9030b996af.css",
 "assets/shared-enquiries.b52b45dc3b.js",
 "assets/shared-fac-page.7d7df7d9b9.css",
 "assets/shared-fac-page.f6d63b3ce5.js",
 "assets/shared-fac-ready.3755ce3545.js",
 "assets/shared-fac-sc.5e2a4ee502.js",
 "assets/shared-hindi-admin.a43e18db13.js",
 "assets/shared-hindi-dom.82e2be6c6a.js",
 "assets/shared-hindi-ui.4dcfc4c93a.js",
 "assets/shared-hs-home.e238ffd188.js",
 "assets/shared-hs-home.f2fa190596.css",
 "assets/shared-hs-people.3edc650740.css",
 "assets/shared-hs-people.5cfb83bc29.js",
 "assets/shared-hs-roles.d381b3e930.js",
 "assets/shared-hs-settings.f1365f98fb.js",
 "assets/shared-impact.9f7d5ac345.js",
 "assets/shared-impact.b1cba457b4.css",
 "assets/shared-join.096521446f.css",
 "assets/shared-join.6ad5ff74c1.js",
 "assets/shared-one-login.39388a85bf.js",
 "assets/shared-one-login.6f478da916.css",
 "assets/shared-one-ui.1b4350b497.css",
 "assets/shared-one-ui.c255a0db58.js",
 "assets/shared-payments.12fb4e5a71.js",
 "assets/shared-pdf-reports.1da837fa8c.js",
 "assets/shared-pdf.da58c8e364.js",
 "assets/shared-registration.6833f0a40c.js",
 "assets/shared-registry.0152bb4061.css",
 "assets/shared-registry.a19478cbcf.js",
 "assets/shared-reports.69da7fca0e.js",
 "assets/shared-sc-content.057fe71840.js",
 "assets/shared-sc-content.4dd2befa79.css",
 "assets/shared-sc-draft.672ef4231a.js",
 "assets/shared-secure.96c5e9e074.js",
 "assets/shared-vocab.22993a26fc.js",
 "assets/shared-whatsapp.0f06cebdec.js",
 "assets/types-settings.c9093f9dc9.js",
 "assets/vendor-poppins-font.0ea9314335.css",
 "assets/vendor-qrcode.fabb956c75.js",
 "icons/apple-touch-icon.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
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

async function networkFirstPage(req) {
  const c = await caches.open(PAGES), key = scopeUrl('./');
  try {
    const res = await Promise.race([fetch(req), new Promise((_, rej) => setTimeout(() => rej(new Error('slow')), 6000))]);
    if (res && res.ok && res.type === 'basic') c.put(key, res.clone());
    return res;
  } catch (err) {
    const hit = await c.match(key);
    if (hit) return hit;
    return fetch(req);                                  // slow but not offline: keep waiting for the network
  }
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
    if (rel === '' || rel === 'index.html') { if (url.searchParams.has('cert') || url.searchParams.has('impact')) return; e.respondWith(networkFirstPage(req)); return; }   // the app page (Verify links: plain network)
    if (rel.startsWith('assets/')) { e.respondWith(cacheFirst(STATIC, req)); return; }
    return;                                             // manifest, icons, app-inline.html …: normal network
  }
  if (LIB_RE.test(req.url)) e.respondWith(cacheFirst(LIBS, req));
});
