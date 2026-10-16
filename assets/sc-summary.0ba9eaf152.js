
// ══════════════════════════════════════════════════════════════
// NIGHTLY SUMMARIES
//  The nightlySummary function (functions/summary.js) opens THIS page on the server every night at 2 AM IST, loads the
//  checkpoint master / Card Editor edits / criteria, and calls nfSumFacility() for each facility — so the summary always
//  matches what the dashboards show. Written to sc_summary/fac/{code} (+ roll-ups, daily 90 days, month-end forever).
//  HealSol with more facilities than shared/sc_summary_config.lightAt (default 300) loads summaries instead of every card
//  ("light" dashboards); opening a facility still loads its live cards.
//  Staff / reviewer card writes mark sc_dirty/{code} so the job also recalculates facilities outside the programme window.
// ══════════════════════════════════════════════════════════════
var NF_SUM_VER=1;
function nfSumFacility(st){
  var f=st.fac||{}, pid=f.progId||st.progId||'nqas_12A', S=st.staff||f.staff||{}; st.progId=pid; st.staff=S;
  var A=scFacilityReadiness(pid,st.progress||{},S); st.agg=A;
  var c=nfgComp(st), D=nfgDates(f), idx=nfgIdx(f), g=f.graduation, cu=f.catchup, L=f.links||{}, n=f.nhsrc, due=nfgNhsrcDue(n), p=f.population||{};
  var byAoc={}, byStd={}, ms={};
  Object.keys(A.byAoc||{}).forEach(function(a){ var b=A.byAoc[a]; if(/^[A-H]$/.test(a)&&b&&b.max>0) byAoc[a]=b.pct; });
  Object.keys(A.byStd||{}).forEach(function(s){ var b=A.byStd[s]; if(/^[A-H]\d{1,2}$/.test(s)&&b&&b.max>0) byStd[s]=b.pct; });
  c.ms.forEach(function(m){ ms[m.key]=m.s; });
  var nq=A.nqas||{}, active=Object.keys(S).filter(function(m){ return S[m]&&!S[m].disabled; }).length;
  var phase=f.phase||(idx==null||idx<0?'notstarted':g?'complete':idx<=NF_GRAD.days-1?'running':'grace');
  return scClean({v:NF_SUM_VER,code:st.code,name:f.name||st.code,state:f.state||'',district:f.district||'',block:f.block||(L.chc&&L.chc.block)||'',
    phc:(L.phc&&L.phc.name)||null,chc:(L.chc&&L.chc.name)||null,progId:pid,staff:active,startDate:f.startDate||null,day:idx==null?null:idx+1,phase:phase,close:D?D.close:null,
    pct:A.pct,base:A.baseline&&A.baseline.assessed?A.baseline.pct:null,assessed:A.coverage?A.coverage.assessed:0,total:A.total||0,meets:!!nq.meets,overallOk:!!nq.overallOk,
    stdBelow:(nq.stdFails||[]).length,aocBelow:(nq.aocFails||[]).length,byAoc:byAoc,byStd:byStd,openGaps:(A.gaps||[]).filter(function(x){ return !x.closed; }).length,
    daysDone:A.daysDone||0,daysVerified:A.daysVerified||0,
    grad:g?{result:g.result,overall:g.overall,base:g.base!=null?g.base:null,at:g.at||null}:null,
    catchup:cu&&cu.on?{round:cu.round||1,start:cu.start||null,end:cu.end||null,done:!!cu.done,free:!!cu.free,paid:!!cu.paid}:null,
    comp:{state:c.state,pct:c.pct,on:c.onTime,late:c.late,miss:c.missing,oldMiss:c.oldMiss,ms:ms,open:c.acts.open,od:c.acts.od,plans:c.plans.made,plansDue:c.plans.due},
    pop:p.n||null,villages:p.villages||null,households:p.households||null,
    nhsrc:n&&n.status?{status:n.status,certifiedOn:n.certifiedOn||null,score:n.score!=null?n.score:null,due:due?due.date:null,dueLabel:due?due.label:null}:null,
    suspended:!!f.suspended,sub:f.subscriptionStatus||'',demo:!!f.isDemo,at:scNowIso()});
}
// ── light dashboards (HealSol, many facilities) ──
var NF_SUM={lightAt:300,freshHours:36}, _nfSum={map:null,meta:null}, _nfLight=false;
function nfHasProg(code){ var p=(typeof scMasterProgress!=='undefined'&&scMasterProgress||{})[code]; return !!(p&&Object.keys(p).length); }
async function nfSumCfg(){ try{ var c=await fbGet('shared/sc_summary_config'); if(c&&c.lightAt!=null) NF_SUM.lightAt=+c.lightAt; }catch(e){} }
(function(){
  var oL=scLoadMasterData;
  scLoadMasterData=async function(){
    _nfLight=false;
    if(appMode==='sc-admin'){ try{ await nfSumCfg(); var meta=await fbGet('sc_summary/meta'); _nfSum.meta=meta||null;   // last run details: shown on the Programme & timeline card
      if(meta&&meta.at&&(+meta.count||0)>NF_SUM.lightAt&&(Date.now()-Date.parse(meta.at))<NF_SUM.freshHours*3600e3){ var m=await fbGet('sc_summary/fac'); if(m){ _nfSum={map:m,meta:meta}; _nfLight=true; } } }catch(e){} }
    return oL.apply(this,arguments); };
  var oG=fbGet; fbGet=function(p){ if(_nfLight&&p==='sc_progress') return Promise.resolve({}); return oG.apply(this,arguments); };   // light: no full card download
  var oA=scFacAggFor; scFacAggFor=function(code){ if(_nfLight&&!nfHasProg(code)&&_nfSum.map&&_nfSum.map[code]) return nfSumAgg(_nfSum.map[code]); return oA.apply(this,arguments); };
  var oD=scDrillIn; scDrillIn=async function(code){ if(_nfLight&&!nfHasProg(code)){ try{ scMasterProgress[code]=await oG('sc_progress/'+code)||{}; }catch(e){} } return oD.apply(this,arguments); };
})();
function nfSumAgg(s){
  var bA={}, bS={}; Object.keys(s.byAoc||{}).forEach(function(a){ bA[a]={pct:s.byAoc[a],xp:s.byAoc[a],max:100,n:1,assessed:1}; });
  Object.keys(s.byStd||{}).forEach(function(k){ bS[k]={pct:s.byStd[k],xp:s.byStd[k],max:100,n:1,assessed:1}; });
  var stdFails=Object.keys(s.byStd||{}).filter(function(k){ return s.byStd[k]<scNqasStdMin(k); }).sort(scStdCmp);
  var aocMin=_scCrit.aoc!=null?+_scCrit.aoc:70, aocFails=Object.keys(s.byAoc||{}).filter(function(a){ return s.byAoc[a]<aocMin; }).sort();
  var hasData=(s.assessed||0)>0, overallOk=s.pct>=_scCrit.overall;
  return {light:true,xp:Math.round((s.pct||0)*(s.total||0)*2/100),max:(s.total||0)*2,pct:s.pct||0,total:s.total||0,assessed:s.assessed||0,daysDone:s.daysDone||0,daysVerified:s.daysVerified||0,
    coverage:{assessed:s.assessed||0,total:s.total||0,pct:s.total?Math.round((s.assessed||0)/s.total*100):0},baseline:{assessed:s.base!=null?1:0,pct:s.base||0,xp:0,max:0},
    byAoc:bA,byStd:bS,byService:{},cps:{},staff:[],gaps:Array.apply(null,Array(s.openGaps||0)).map(function(){ return {closed:false}; }),progId:s.progId,
    nqas:{hasData:hasData,overallOk:overallOk,stdFails:stdFails,aocFails:aocFails,aocMin:aocMin,meets:hasData&&overallOk&&!stdFails.length&&!aocFails.length,overallMin:_scCrit.overall}};
}
function nfgCompFor(code,f,pr,acts){
  if(_nfLight&&!nfHasProg(code)&&_nfSum.map&&_nfSum.map[code]&&_nfSum.map[code].comp){ var c=_nfSum.map[code].comp;
    return {state:f.graduation?'complete':c.state,pct:c.pct,onTime:c.on||0,late:c.late||0,missing:c.miss||0,oldMiss:c.oldMiss||0,people:[],ms:[],acts:{open:c.open||0,od:c.od||0},plans:{made:c.plans||0,due:c.plansDue||0},idx:nfgIdx(f),D:nfgDates(f),light:true}; }
  return nfgComp({code:code,fac:f,staff:f.staff||{},progress:pr||{},actions:acts||null,progId:f.progId||'nqas_12A'});
}
function nfSumWhen(){ var m=_nfSum.meta; if(!m||!m.at) return ''; try{ var d=new Date(m.at); return d.toLocaleString('en-IN',{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); }catch(e){ return String(m.at).slice(0,16); } }
(function(){ if(typeof nfOverviewHTML!=='function') return; var oO=nfOverviewHTML;
  nfOverviewHTML=function(rows,opts){ if(_nfLight) opts=Object.assign({},opts,{sub:(opts.sub||'')+' · from the nightly summary ('+nfSumWhen()+') — open a facility for live data'}); return oO.call(this,rows,opts); }; })();
// ── HealSol: refresh now ──
async function nfSumRefresh(code){
  if(appMode!=='sc-admin') return;
  showToast(code?'Updating the summary for '+code+'…':'Updating all summaries — this can take a few minutes…','');
  try{ var r=await nfCall('refreshSummary',code?{code:code}:{all:true}); try{ _nfSum.meta=await fbGet('sc_summary/meta'); if(typeof nfRenderOverview==='function') nfRenderOverview(); }catch(e){} showToast('Summary updated: '+(r.computed||0)+' facilit'+((r.computed||0)===1?'y':'ies')+(r.errors&&r.errors.length?' · '+r.errors.length+' problem(s)':'')+'.','ok'); }
  catch(e){ showToast(e.message||'Could not update the summary.','err'); }
}
(function(){
  var oP=nfgProgHTML; nfgProgHTML=function(st){ var h=oP.apply(this,arguments); if(appMode!=='sc-admin') return h;
    var T, b='<button class="scx-btn sm ghost" onclick="nfSumRefresh(\''+scJs(st.code)+'\')">↻ Refresh summary</button>', T='<div class="nfg-btns">', i=h.lastIndexOf(T);
    return i>=0?h.slice(0,i+T.length)+b+h.slice(i+T.length):h.replace(/<\/div>$/,'<div class="nfg-btns">'+b+'</div></div>'); };
  var oC=nfgOvCardHTML; nfgOvCardHTML=function(rows){ var h=oC.apply(this,arguments); if(!h||appMode!=='sc-admin') return h;
    var m=_nfSum.meta, err=m&&m.errors&&m.errors.length?' · <span style="color:var(--red-dk)">'+m.errors.length+' problem'+(m.errors.length===1?'':'s')+'</span>':'';
    var note='<div class="nfg-note" style="padding:0 2px 6px;">'+(m&&m.at?'Nightly summary: '+scEsc(nfSumWhen())+(m.by&&m.by!=='schedule'?' (refreshed by '+scEsc(m.by)+')':'')+' · '+(+m.count||0)+' facilities'+err+'<br>':'Nightly summary: not run yet<br>')
      +'<button type="button" class="nfo-link" onclick="nfSumRefresh()">↻ Refresh all summaries</button></div>';
    var i=h.indexOf('</div>',h.indexOf('class="nfo-ch"')); return i>=0?h.slice(0,i+6)+note+h.slice(i+6):h; };
})();
// ── card writes mark the facility for tonight's summary ──
var _nfDirty={};
(function(){ var oP=scProgressPath; scProgressPath=function(code){ try{ if(code&&appMode&&appMode!=='sc-admin'&&!_nfDirty[code]&&typeof db!=='undefined'&&db){ _nfDirty[code]=1; db.ref('sc_dirty/'+code).set(scTodayStr()).catch(function(){}); setTimeout(function(){ delete _nfDirty[code]; },3600000); } }catch(e){} return oP.apply(this,arguments); }; })();
