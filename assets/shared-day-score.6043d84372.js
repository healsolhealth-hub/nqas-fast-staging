// ══════════════════════════════════════════════════════════════
// Today's score on the staff cards (HealSol 21 Oct, every facility type): "Today's score 70% · 14 of 20 checked".
// The score of the whole card — Met 2, Partial 1, Not met 0, not yet checked 0 — not the facility's readiness.
// 21 Nov 2026 (HealSol): "Day 8 score 100% · 1 of 13 checked" was the score of the checked ones only; now 1 Met of 13 = 8%,
// the same rule as Readiness (whole checklist).
// ══════════════════════════════════════════════════════════════
function nfScoreLine(sum, n, of, label) {
  if (!of) return '';
  var pct = n ? Math.round(100 * sum / (2 * of)) : null;
  return '<div class="nf-dscore"><b>' + scEsc(label) + (pct == null ? '' : ' ' + pct + '%') + '</b><span>' + n + ' of ' + of + ' checked' + (pct == null ? ' — answer a checkpoint to see the score' : '') + '</span></div>';
}
// ── Sub-Centre staff app ──
function nfScDayScore(di) {
  var own = []; try { own = scMyCpIdx(di); } catch (e) { return null; }
  var c = getCHOCard(di) || {}, sum = 0, n = 0;
  own.forEach(function (ci) { var s = scNormScore((c.cpScores || [])[ci]); if (s !== null) { n++; sum += s; } });
  return { sum: sum, n: n, of: own.length };
}
(function () {
  if (typeof nfRenderToday === 'function') {
    var oT = nfRenderToday;
    nfRenderToday = function () { var r = oT.apply(this, arguments);
      try { var host = document.getElementById('nf-today'), cta = host && host.querySelector('.nf-cta'); if (cta && !host.querySelector('.nf-dscore')) {
        var x = nfScDayScore(scb1TodayIdx()); if (x && x.of) cta.insertAdjacentHTML('afterend', nfScoreLine(x.sum, x.n, x.of, _appLang === 'hi' ? 'आज का स्कोर' : 'Today\'s score')); } } catch (e) {}
      return r; };
  }
  if (typeof renderCard === 'function') {
    var oC = renderCard;
    renderCard = function (di) { var r = oC.apply(this, arguments);
      try { if (typeof nfIsStaff === 'function' && nfIsStaff()) { var cont = document.getElementById('card-container'), body = cont && cont.querySelector('.cbody');
        if (body && !body.querySelector('.nf-dscore')) { var x = nfScDayScore(di); if (x && x.of) body.insertAdjacentHTML('afterbegin', nfScoreLine(x.sum, x.n, x.of, (_appLang === 'hi' ? 'दिन ' : 'Day ') + (di + 1) + (_appLang === 'hi' ? ' स्कोर' : ' score'))); } } } catch (e) {}
      return r; };
  }
})();
// ── UPHC · PHC · CHC staff app ──
function nfDeptCardScore(dept, day, mob) {
  var ids = ndMyIds(dept, day, mob); if (!ids.length) return null;
  var s = (ndPc(dept, day)[mob] || {}).s || {}, sum = 0, n = 0;
  ids.forEach(function (i) { if (s[i] !== undefined && s[i] !== null) { n++; sum += +s[i]; } });
  return { sum: sum, n: n, of: ids.length };
}
(function () {
  if (typeof ndRender === 'function') {
    var oR = ndRender;
    ndRender = function () { var r = oR.apply(this, arguments);
      try { if (_nd && !_nd.view && (_nd.tab === 'today' || !_nd.tab) && !_nd.card && !_nd.screen) { var app = document.getElementById('nf-dept-app'), cta = app && app.querySelector('.nx-hero .nx-cta');
        if (cta && !app.querySelector('.nf-dscore')) { var me = ndMob(), day = ndDay(), sum = 0, n = 0, of = 0;
          ndCardDepts(day > 100 ? day : Math.min(day, _nd.cfg.days)).forEach(function (d) { if (!ndFills(d.id, me)) return; var x = nfDeptCardScore(d.id, day, me); if (x) { sum += x.sum; n += x.n; of += x.of; } });
          if (of) cta.insertAdjacentHTML('afterend', nfScoreLine(sum, n, of, 'Today\'s score')); } } } catch (e) {}
      return r; };
  }
  if (typeof ndDayCardHTML === 'function') {
    var oD = ndDayCardHTML;
    ndDayCardHTML = function (dept, day) { var h = oD.apply(this, arguments);
      try { var me = ndMob(); if (!_nd.view && ndFills(dept, me)) { var x = nfDeptCardScore(dept, day, me); if (x) h = h.replace('<div class="nx-aoc">', nfScoreLine(x.sum, x.n, x.of, 'Day ' + day + ' score') + '<div class="nx-aoc">'); } } catch (e) {}
      return h; };
  }
})();
