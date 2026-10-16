
// ══════════════════════════════════════════════════════════════
// HEALSOL BUSINESS INDICATORS (HealSol Admin only)
//  Registered SCs (Type A/B), paid / contract / trial, demos and conversion, payments received,
//  payment due (trial ended, unpaid), districts, open enquiries, programme status;
//  registrations by month and a district table. Payment due also appears in Needs attention.
// ══════════════════════════════════════════════════════════════
var _nfBiz={leads:{},pricing:null,at:0};
function nfRupee(n){ n=Math.round(n||0); var s=String(n), last=s.slice(-3), rest=s.slice(0,-3); if(rest) last=','+last; return '₹'+rest.replace(/\B(?=(\d{2})+(?!\d))/g,',')+last; }
function nfMonthKey(iso){ return iso?String(iso).slice(0,7):''; }
function nfTrialInfo(f){
  if(!f||f.subscriptionStatus!=='trial') return null;
  var start=f.startDate||(f.trialStartDate?String(f.trialStartDate).slice(0,10):null); if(!start) return null;
  var p=start.split('-'), end=new Date(+p[0],+p[1]-1,+p[2]+7), today=new Date(); today.setHours(0,0,0,0);
  var over=Math.floor((today-end)/86400000);
  return {ended:over>=0,daysOver:over,endISO:end.getFullYear()+'-'+String(end.getMonth()+1).padStart(2,'0')+'-'+String(end.getDate()).padStart(2,'0')};
}
function nfPriceFor(progId){ var items=((_nfBiz.pricing||{}).items)||[]; var it=items.find(function(x){ return x&&x.id===progId; }); return it&&it.price!=null?Number(it.price):null; }
function nfBizStats(){
  var F=scMasterFacilities||{}, codes=Object.keys(F).filter(function(c){ var f=F[c]; return f&&!f.migratedTo; });
  var thisMonth=nfMonthKey(new Date().toISOString()), S={total:codes.length,typeA:0,typeB:0,paid:0,contract:0,trial:0,demos:0,demosMonth:0,converted:0,
    paidSum:0,paidCount:0,paidMonth:0,due:[],dueValue:0,districts:{},states:{},started:0,completed:0,notStarted:0,staff:0,byMonth:{}};
  codes.forEach(function(c){ var f=F[c], st=f.subscriptionStatus||'contract';
    if((f.progId||'').indexOf('12B')>=0) S.typeB++; else S.typeA++;
    if(st==='paid') S.paid++; else if(st==='trial') S.trial++; else S.contract++;
    var wasDemo=f.isDemo||!!f.convertedFromDemoCode;
    if(wasDemo){ S.demos++; if(nfMonthKey(f.enrolledAt||f.trialStartDate)===thisMonth) S.demosMonth++; if(st==='paid') S.converted++; }
    if(f.lastPayment&&f.lastPayment.amount){ S.paidSum+=Number(f.lastPayment.amount)||0; S.paidCount++; if(nfMonthKey(f.lastPayment.at)===thisMonth) S.paidMonth+=Number(f.lastPayment.amount)||0; }
    var ti=nfTrialInfo(f); if(ti&&ti.ended){ var pr=nfPriceFor(f.progId); S.due.push({code:c,name:f.name||c,days:ti.daysOver,price:pr,contact:f.contactMobile||'',district:f.district||''}); if(pr) S.dueValue+=pr; }
    var d=(f.district||'—').trim(); if(!S.districts[d]) S.districts[d]={n:0,a:0,b:0,paid:0,trial:0,contract:0,pctSum:0,pctN:0}; var D=S.districts[d];
    D.n++; if((f.progId||'').indexOf('12B')>=0) D.b++; else D.a++; D[st==='paid'?'paid':st==='trial'?'trial':'contract']++;
    if(f.state) S.states[f.state]=1;
    var day=nfDayOf(f); if(day==null||day<1) S.notStarted++; else if(day>=getProg(f.progId||'nqas_12A').days&&scTodayStr()>=(function(){ var p=f.startDate.split('-'), e=new Date(+p[0],+p[1]-1,+p[2]+getProg(f.progId||'nqas_12A').days); return e.getFullYear()+'-'+String(e.getMonth()+1).padStart(2,'0')+'-'+String(e.getDate()).padStart(2,'0'); })()) S.completed++; else S.started++;
    try{ var a=scFacAggFor(c); if(a&&a.coverage&&a.coverage.assessed){ D.pctSum+=a.pct; D.pctN++; } }catch(e){}
    S.staff+=Object.keys(f.staff||{}).filter(function(m){ return f.staff[m]&&!f.staff[m].disabled; }).length;
    var mk=nfMonthKey(f.enrolledAt||f.trialStartDate); if(mk){ var M=S.byMonth[mk]||(S.byMonth[mk]={direct:0,demo:0}); M[wasDemo?'demo':'direct']++; }
  });
  S.due.sort(function(a,b){ return b.days-a.days; });
  var L=_nfBiz.leads||{}; S.leadsOpen=Object.keys(L).filter(function(k){ return L[k]&&L[k].status!=='closed'; });
  S.leadsFac=S.leadsOpen.reduce(function(s,k){ return s+(parseInt(L[k].facilityCount,10)||0); },0);
  return S;
}
function nfBizHTML(){
  var S=nfBizStats(), conv=S.demos?Math.round(S.converted/S.demos*100):0, nd=Object.keys(S.districts).filter(function(d){ return d!=='—'; }).length;
  var card=function(icon,cls,label,val,sub,onclick){ return '<div class="nfb-card '+cls+(onclick?' click':'')+'"'+(onclick?' onclick="'+onclick+'"':'')+'><span class="nfb-i"><i class="ti '+icon+'"></i></span><div><small>'+scEsc(label)+'</small><b>'+val+'</b><em>'+sub+'</em></div></div>'; };
  var h='<div class="nfb-head"><b><i class="ti ti-briefcase"></i> Business</b><span>HealSol only · as of '+scEsc(scFmtDate(scTodayStr()))+' · <button type="button" class="nfo-link" onclick="nfAdminView(\'business\')">Open Business tab — dates, charts, downloads</button></span></div><div class="nfb-grid">'
    +card('ti-building-hospital','t','Registered '+NF_CFG.plural,S.total,'Type A '+S.typeA+' · Type B '+S.typeB,"nfAdminView('facilities')")
    +card('ti-circle-check','g','Paid',S.paid,nfRupee(S.paidSum)+' received')
    +card('ti-file-certificate','v','Contract',S.contract,'government / district contracts')
    +card('ti-hourglass','a','On trial',S.trial,S.due.length?'<span class="r">'+S.due.length+' trial'+(S.due.length===1?'':'s')+' ended</span>':'none ended yet')
    +card('ti-rocket','b','Self-registrations',S.demos,S.demosMonth+' this month · '+S.converted+' paid ('+conv+'%)',"nfAdminView('facilities')")
    +card('ti-currency-rupee','g','Payments received',nfRupee(S.paidSum),S.paidCount+' payment'+(S.paidCount===1?'':'s')+' · '+nfRupee(S.paidMonth)+' this month')
    +card('ti-alert-circle','r','Payment due',S.due.length,S.due.length?(S.dueValue?nfRupee(S.dueValue)+' expected':'trial ended, not paid'):'nothing due',S.due.length?'nfBizDueList()':'')
    +card('ti-map-2','t','Districts',nd,Object.keys(S.states).length+' state'+(Object.keys(S.states).length===1?'':'s'))
    +card('ti-mail-opened','v','Open enquiries',S.leadsOpen.length,S.leadsFac?'~'+S.leadsFac+' facilities requested':'district / bulk enrolment',"nfAdminView('facilities')")
    +card('ti-player-play','a','Programme status',S.started,'in progress · '+S.completed+' completed · '+S.notStarted+' not started')
    +'</div>';
  // registrations by month (last 6)
  var months=[], d0=new Date(); d0.setDate(1);
  for(var i=5;i>=0;i--){ var d=new Date(d0.getFullYear(),d0.getMonth()-i,1); months.push({k:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'),l:d.toLocaleDateString('en-IN',{month:'short'})}); }
  var mx=Math.max(1,Math.max.apply(null,months.map(function(m){ var M=S.byMonth[m.k]||{}; return (M.direct||0)+(M.demo||0); })));
  var bars=months.map(function(m){ var M=S.byMonth[m.k]||{direct:0,demo:0}, tot=M.direct+M.demo;
    return '<div class="nfb-bar"><b>'+(tot||'')+'</b><div class="nfb-stack" style="height:'+Math.round(tot/mx*110)+'px"><i class="dm" style="flex:'+M.demo+'"></i><i class="dr" style="flex:'+M.direct+'"></i></div><small>'+scEsc(m.l)+'</small></div>'; }).join('');
  var dist=Object.keys(S.districts).sort(function(a,b){ return S.districts[b].n-S.districts[a].n||a.localeCompare(b); });
  h+='<div class="nfb-panels"><div class="nfo-card"><div class="nfo-ch"><b>New registrations — last 6 months</b><span><i class="nfb-k dr"></i> enrolled by HealSol <i class="nfb-k dm"></i> self-registered</span></div><div class="nfb-chart">'+bars+'</div></div>'
    +'<div class="nfo-card"><div class="nfo-ch"><b>Districts</b><span>'+dist.length+'</span></div><div class="nfo-tw"><table class="nfo-t nfb-dt"><thead><tr><th>District</th><th class="c">SCs</th><th class="c">A / B</th><th class="c">Paid</th><th class="c">Trial</th><th class="c">Contract</th><th class="c">Avg readiness</th></tr></thead><tbody>'
    +dist.map(function(k){ var D=S.districts[k], av=D.pctN?Math.round(D.pctSum/D.pctN):null;
      return '<tr><td><b>'+scEsc(k)+'</b></td><td class="c">'+D.n+'</td><td class="c">'+D.a+' / '+D.b+'</td><td class="c">'+D.paid+'</td><td class="c">'+D.trial+'</td><td class="c">'+D.contract+'</td><td class="c" style="color:'+(av===null?'var(--t3)':scPctText(av))+';font-weight:700;">'+(av===null?'—':av+'%')+'</td></tr>'; }).join('')
    +'</tbody></table></div></div></div>';
  return h;
}
function nfBizDueList(){
  var S=nfBizStats(); if(!S.due.length) return;
  scAlert(S.due.map(function(x){ return x.name+' ('+x.code+')'+(x.district?' · '+x.district:'')+' — trial ended '+(x.days===0?'today':x.days+' day'+(x.days===1?'':'s')+' ago')+(x.price?' · '+nfRupee(x.price):'')+(x.contact?' · '+x.contact:''); }).join('\n'),'Payment due — '+S.due.length+' facilit'+(S.due.length===1?'y':'ies'),'💳');
}
(function(){
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){ var r=await oLoad.apply(this,arguments);
    if(appMode==='sc-admin'){ try{ _nfBiz.leads=await fbGet('shared/sc_leads')||{}; _nfBiz.pricing=await fbGet('shared/sc_pricing_config')||null; _nfBiz.at=Date.now(); }catch(e){} }
    return r; };
  var oOv=nfRenderOverview;
  nfRenderOverview=function(){ var r=oOv.apply(this,arguments);
    try{ if(appMode!=='sc-admin') return r; var ov=document.getElementById('nf-ov'); if(!ov) return r;
      var k=ov.querySelector('.nfo-kpis'); if(!k||ov.querySelector('#nfb')) return r;
      var box=document.createElement('div'); box.id='nfb'; box.innerHTML=nfBizHTML(); ov.insertBefore(box,k);
      var hd=document.createElement('div'); hd.className='nfb-head'; hd.innerHTML='<b><i class="ti ti-chart-donut"></i> Programme readiness</b><span>all facilities</span>'; ov.insertBefore(hd,k);
    }catch(e){ console.warn('[SC] business indicators',e); }
    return r; };
  var oAtt=scRvAttention;
  scRvAttention=function(){ var out=oAtt.apply(this,arguments);
    if(appMode==='sc-admin'){ try{ nfBizStats().due.forEach(function(x){ out.unshift({code:x.code,lvl:'amber',txt:'Trial ended '+(x.days===0?'today':x.days+' day'+(x.days===1?'':'s')+' ago')+' — payment due'+(x.price?' ('+nfRupee(x.price)+')':'')}); }); }catch(e){} }
    return out; };
})();
