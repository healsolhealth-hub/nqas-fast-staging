// NQAS | FAST service worker — made by app/build.js (do not edit site/sw.js; edit app/pwa/sw.js).
// • The page (index.html): network first, so everyone gets the latest app when online; the last copy
//   is used only when the network fails or takes longer than 6 s (offline: the app opens and says it cannot reach the server).
// • assets/… (name carries a content hash, never changes): cache first; a new build only downloads changed blocks.
// • Fixed-version libraries from gstatic (Firebase SDK) and cdnjs / jsdelivr / unpkg (jsPDF …): cache first.
// • Nothing else is touched: Firebase database / sign-in / functions, App Check, Razorpay, WhatsApp, the card page.
// Emergency switch: open the app with ?nosw=reset (removes this worker and its caches on that phone), or publish a sw.js
// that only unregisters itself.
const BUILD = "72ebd2101595";
const ASSETS = [
 "assets/data-sc-checkpoints.faf119347a.js",
 "assets/data-sc-days.7879def481.js",
 "assets/data-sc-how-to-fix.370427c0e7.js",
 "assets/dept-admin.e83e9004db.js",
 "assets/dept-content.9efe67bbd1.js",
 "assets/dept-core.05bad2d39a.css",
 "assets/dept-core.a901507589.js",
 "assets/dept-grad.c07401b26c.css",
 "assets/dept-grad.cb9a8cd134.js",
 "assets/dept-master-ui.61064e6f9f.js",
 "assets/dept-master.0c48018e85.js",
 "assets/dept-master.d737b49cc8.css",
 "assets/dept-plan.e35a7f99c9.js",
 "assets/dept-review.7e29837ee2.js",
 "assets/dept-screens.acc4b50f26.js",
 "assets/dept-screens.f786feb4e5.css",
 "assets/dept-summary.12c5f15f53.js",
 "assets/sc-baseline-review.9bd6ffb924.js",
 "assets/sc-baseline-review.cba584c030.css",
 "assets/sc-baseline7.d38d5e0f28.js",
 "assets/sc-build1.7a975d02d8.js",
 "assets/sc-build2.65b20c180e.js",
 "assets/sc-build2.9b9d0fc3cf.css",
 "assets/sc-champion-verify.6be0e5d069.js",
 "assets/sc-champions.caf844a402.js",
 "assets/sc-champions.e1ab6daa4b.css",
 "assets/sc-checklist.63f7006cf3.js",
 "assets/sc-compliance.db47e45d0f.js",
 "assets/sc-cp-master.01f36caf69.js",
 "assets/sc-cp-progress.02e5f35df1.js",
 "assets/sc-cross-cutting.74584f8128.js",
 "assets/sc-day-placement.9020e8e4d1.js",
 "assets/sc-district.d83509bdc1.js",
 "assets/sc-fadm.1fb01e6ce7.css",
 "assets/sc-fadm.90548a4c15.js",
 "assets/sc-gaps.df1042b0ae.js",
 "assets/sc-graduation.3051aaf5b6.js",
 "assets/sc-healsol-view.fdd1503355.js",
 "assets/sc-hierarchy.4d51074fef.js",
 "assets/sc-how-to-fix.7dbba620cc.js",
 "assets/sc-implementation.27485be94c.js",
 "assets/sc-laptop.3b958233dd.css",
 "assets/sc-laptop.c55d6f8774.js",
 "assets/sc-linked-checks.047edf7bec.js",
 "assets/sc-links.847cb78153.js",
 "assets/sc-login-3tier.27abd84fee.js",
 "assets/sc-looks-met.c2aaaff056.js",
 "assets/sc-phases.07a2a34a96.css",
 "assets/sc-phases.97a845a0a6.js",
 "assets/sc-plan-wa.4a4291bea8.js",
 "assets/sc-prep-lists.f656ff32b2.js",
 "assets/sc-readiness.6cf4731cfe.js",
 "assets/sc-review-inbox.1806590a5c.js",
 "assets/sc-review.54a1bc1306.js",
 "assets/sc-staff-app.1f975b2968.js",
 "assets/sc-staff-app.e0189e484b.css",
 "assets/sc-summary.0ba9eaf152.js",
 "assets/sc-v2-core.60647aca2b.js",
 "assets/sc-v2.bfc3486435.css",
 "assets/sc-week-plan.126d067680.js",
 "assets/shared-base.296e41553e.css",
 "assets/shared-biz-dash.333261e206.css",
 "assets/shared-biz-dash.84fb8bf2b3.js",
 "assets/shared-biz-report.7d0c383ae8.js",
 "assets/shared-brand.1b47ef65ba.js",
 "assets/shared-business-ind.a9e4d359b8.js",
 "assets/shared-business-ind.d97663522b.css",
 "assets/shared-cert.2164ff1b2b.js",
 "assets/shared-cert.50af794399.css",
 "assets/shared-dashboards.524d7561de.js",
 "assets/shared-dashboards.c05c6b7e04.css",
 "assets/shared-fac-page.2fe7bc4c95.css",
 "assets/shared-fac-page.9a90acc35f.js",
 "assets/shared-fac-ready.99d756861a.js",
 "assets/shared-fac-sc.32cd70585b.js",
 "assets/shared-hs-home.58962e11de.js",
 "assets/shared-hs-home.f2fa190596.css",
 "assets/shared-hs-settings.f1365f98fb.js",
 "assets/shared-impact.2d70258cc2.js",
 "assets/shared-impact.b1cba457b4.css",
 "assets/shared-one-login.6f478da916.css",
 "assets/shared-one-login.c204d6395c.js",
 "assets/shared-payments.2b35528884.js",
 "assets/shared-pdf-reports.77cff64a9b.js",
 "assets/shared-pdf.33e49f6393.js",
 "assets/shared-registration.6833f0a40c.js",
 "assets/shared-sc-draft.672ef4231a.js",
 "assets/shared-secure.7c38c8228c.js",
 "assets/shared-whatsapp.a3bc984eb3.js",
 "assets/types-settings.c9093f9dc9.js",
 "assets/vendor-pdf-fonts.d24cedb333.js",
 "assets/vendor-poppins-font.7a4a5ae076.css",
 "assets/vendor-qrcode.fabb956c75.js",
 "assets/vendor-sign-font.245deebf21.js",
 "icons/apple-touch-icon.png",
 "icons/icon-192.png",
 "icons/icon-512.png",
 "icons/icon-maskable-512.png",
 "manifest.webmanifest"
];
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
    const keep = new Set(ASSETS.map(scopeUrl)), c = await caches.open(STATIC);
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
