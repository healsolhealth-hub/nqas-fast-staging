
// ══════════════════════════════════════════════════════════════
// HEALSOL BUSINESS REPORT (HealSol Admin only) — Reports page → one Excel workbook
//  Sheets: Summary · Facilities · Follow-up · Self-registrations · Payments · Not moving · Districts · Enquiries
//  Same numbers as the Business cards on the Overview (nfBizStats).
// ══════════════════════════════════════════════════════════════
var NF_XLSX_URLS=['https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js','https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'];
var NF_IDLE_DAYS=7;   // "Not moving": programme running, no card saved for this many days
function nfLoadXlsx(){
  if(window.XLSX) return Promise.resolve(window.XLSX);
  var tryAt=function(i){ return new Promise(function(res,rej){ if(i>=NF_XLSX_URLS.length) return rej(new Error('load'));
    var s=document.createElement('script'); s.src=NF_XLSX_URLS[i]; s.onload=function(){ window.XLSX?res(window.XLSX):tryAt(i+1).then(res,rej); }; s.onerror=function(){ tryAt(i+1).then(res,rej); }; document.head.appendChild(s); }); };
  return tryAt(0);
}
function nfDaysBetween(aISO,bISO){ if(!aISO||!bISO) return null; var a=new Date(String(aISO).slice(0,10)+'T00:00:00'), b=new Date(String(bISO).slice(0,10)+'T00:00:00'); return Math.round((b-a)/86400000); }
function nfLastActivity(code){
  var P=(scMasterProgress||{})[code]||{}, last='';
  Object.keys(P).forEach(function(m){ var days=P[m]||{}; Object.keys(days).forEach(function(k){ var d=days[k]||{};
    [d.updatedAt,d.verifiedAt,d.sentBackAt].forEach(function(t){ if(t&&String(t)>last) last=String(t); }); }); });
  return last||'';
}
function nfFacilityRows(){
  var F=scMasterFacilities||{}, today=scTodayStr(), L=(_nfBiz.leads)||{};
  return Object.keys(F).filter(function(c){ return F[c]&&!F[c].migratedTo; }).sort().map(function(c){
    var f=F[c], st=f.subscriptionStatus||'contract', prog=getProg(f.progId||'nqas_12A')||{}, staff=f.staff||{};
    var cho=Object.keys(staff).map(function(m){ return Object.assign({mob:m},staff[m]); }).find(function(s){ return !s.disabled&&(s.role||'CHO')==='CHO'; })||{};
    var day=nfDayOf(f), agg=null; try{ agg=scFacAggFor(c); }catch(e){}
    var last=nfLastActivity(c), idle=last?nfDaysBetween(last,today):null, ti=nfTrialInfo(f), price=nfPriceFor(f.progId);
    var started=day!=null&&day>=1, done=started&&day>=(prog.days||60);
    var follow=[];
    if(ti&&ti.ended) follow.push('Trial ended '+ti.daysOver+' day'+(ti.daysOver===1?'':'s')+' ago — not paid');
    else if(ti&&ti.daysOver>=-2) follow.push('Trial ends '+(ti.daysOver===0?'today':'in '+(-ti.daysOver)+' day'+(ti.daysOver===-1?'':'s')));
    if(!f.startDate) follow.push('Start date not set');
    if(started&&!done&&(idle==null||idle>=NF_IDLE_DAYS)) follow.push(idle==null?'No card saved yet':'No activity for '+idle+' days');
    if(!cho.mob) follow.push('No CHO on the roster');
    return {code:c, name:f.name||c, district:f.district||'', state:f.state||'', block:f.block||'', package:prog.name||f.progId||'', type:(f.progId||'').indexOf('12B')>=0?'B':'A',
      status:st==='paid'?'Paid':st==='trial'?'Trial':'Contract', demo:(f.isDemo||f.convertedFromDemoCode)?'Yes':'No', converted:(f.isDemo||f.convertedFromDemoCode)&&st==='paid'?'Yes':'',
      enrolled:String(f.enrolledAt||f.trialStartDate||'').slice(0,10), start:f.startDate||'', day:day==null?'':(day<1?'Not started':Math.min(day,prog.days||60)),
      phase:!started?'Not started':done?'Completed':'In progress', readiness:agg&&agg.coverage&&agg.coverage.assessed?agg.pct:'',
      staff:Object.keys(staff).filter(function(m){ return staff[m]&&!staff[m].disabled; }).length, choName:cho.name||'', choMobile:cho.mob||f.contactMobile||'',
      lastActivity:last?String(last).slice(0,10):'', idleDays:idle==null?'':idle, trialEnds:ti?ti.endISO:'', expected:ti&&ti.ended&&price?price:'',
      paidAmount:f.lastPayment&&f.lastPayment.amount?Number(f.lastPayment.amount):'', paidOn:f.lastPayment&&f.lastPayment.at?String(f.lastPayment.at).slice(0,10):'',
      paidRef:f.lastPayment?(f.lastPayment.id||(f.lastPayment.confirmedBy?'Confirmed by HealSol':'')):'', followUp:follow.join(' · '), _idle:started&&!done&&(idle==null||idle>=NF_IDLE_DAYS), _ti:ti};
  });
}
// nfBusinessReport / nfEnsureBizReportCard: see <script id="nf-biz-dash"> (preview, dates, Excel and PDF)
(function(){
  if(typeof nfAdminApply==='function'){ var o=nfAdminApply; nfAdminApply=function(){ try{ nfEnsureBizReportCard(); }catch(e){} return o.apply(this,arguments); }; }
})();
