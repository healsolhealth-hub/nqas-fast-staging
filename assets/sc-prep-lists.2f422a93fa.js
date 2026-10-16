
// ══════════════════════════════════════════════════════════════
// LEFTOVER L1 — prep lists ("what to keep ready") use the MoV items
// ══════════════════════════════════════════════════════════════
(function(){
  var oPrep=scb2PrepFor;
  scb2PrepFor=function(cps){
    // feed the rules the items and the official MoV, not only the checkpoint title
    var rich=(cps||[]).map(function(cp){ var it=(cp.items||[]).map(function(i){ return i.t; }).join(' ');
      return Object.assign({},cp,{t:[cp.t,it,cp.movOfficial||''].join(' ')}); });
    return oPrep.call(this,rich);
  };
  var oOpen=scb2OpenPrep;
  scb2OpenPrep=function(di){
    var r=oOpen.apply(this,arguments);
    try{
      var M=_scb2Model||scb2BuildModel(), d=getDay(di), role=scb1Role(), hi=_appLang==='hi';
      var shown=(d.cps||[]).filter(function(cp){ return M.fac||scCpForRole(cp,role); });
      var ov=[].slice.call(document.querySelectorAll('.scx-ov.scb2-ov')).pop(); if(!ov) return r;
      var boxes=ov.querySelectorAll('.scb2-cp');
      shown.forEach(function(cp,i){ var b=boxes[i]; if(!b||!(cp.items||[]).length) return;
        var ol=document.createElement('ol'); ol.className='scb2-cp-items';
        ol.innerHTML=cp.items.map(function(it){ return '<li><span>'+scEsc((it.m||[]).join('/'))+'</span> '+scEsc(hi&&it.h?it.h:it.t)+'</li>'; }).join('');
        b.appendChild(ol); });
    }catch(e){ console.warn(e); }
    return r;
  };
})();

// ══════════════════════════════════════════════════════════════
// LEFTOVER L2 — re-import a revised checklist (CSV) with a comparison report
// Same columns as the official sheet: Service Name, Area of Concern, Area of Concern Name, Standard,
// ME Reference No, Measurable Elements, Checkpoints, Means of Verification, Assessment Method, Role, Package Type B, Package
// ══════════════════════════════════════════════════════════════
SC_CPM_FIELDS.push('movChanged','mov');   // the official MoV text can be updated by a re-import
var SC_IMP_COLS=['Service Name','Area of Concern','Standard','ME Reference No','Measurable Elements','Checkpoints','Means of Verification','Assessment Method','Role','Package'];
var SC_IMP_FIX=[[/\bAHSA\b/g,'ASHA'],[/\breffering\b/gi,'referring'],[/\bfilarasis\b/gi,'filariasis'],[/\bPallative\b/gi,'Palliative'],[/\baliments\b/gi,'ailments'],
  [/\bchocking\b/gi,'choking'],[/\blife births\b/gi,'live births'],[/\bChinguniya\b/gi,'Chikungunya'],[/\bmusculosketal\b/gi,'musculoskeletal']];
function scCsvParse(text){
  var rows=[], row=[], f='', q=false, i=0, s=String(text||'').replace(/^\ufeff/,'');
  for(;i<s.length;i++){ var ch=s[i];
    if(q){ if(ch==='"'){ if(s[i+1]==='"'){ f+='"'; i++; } else q=false; } else f+=ch; }
    else if(ch==='"') q=true; else if(ch===','){ row.push(f); f=''; }
    else if(ch==='\n'||ch==='\r'){ if(ch==='\r'&&s[i+1]==='\n') i++; row.push(f); rows.push(row); row=[]; f=''; }
    else f+=ch; }
  if(f!==''||row.length){ row.push(f); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(c){ return String(c).trim(); }); });
}
function scImpRole(r){ r=String(r||'').trim(); return {'CHO':['CHO'],'ANM':['ANM'],'ASHA':['ASHA'],'MPW':['MPW'],'General Round':['General'],'Community Interaction':['ASHA']}[r]||['CHO']; }
function scImpMethod(m){ var out=[]; String(m||'').replace(/Record Review/gi,'RR').toUpperCase().split(/[\/,\s]+/).forEach(function(x){ if(x==='PI') x='CI'; if(['SI','RR','OB','CI'].indexOf(x)>=0&&out.indexOf(x)<0) out.push(x); }); return out.length?out:['CI']; }
function scImpQuotes(t){ return String(t||'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"'); }
function scImpFix(t){ var o=scCpmNormT(scImpQuotes(t)); SC_IMP_FIX.forEach(function(p){ o=o.replace(p[0],p[1]); }); return o; }
// → {rows:[…], error}
function scImpRead(text){
  var R=scCsvParse(text); if(!R.length) return {error:'The file is empty.'};
  var H=R[0].map(function(h){ return String(h).trim(); }), C={};
  H.forEach(function(h,i){ C[h]=i; });
  var miss=SC_IMP_COLS.filter(function(c){ return C[c]===undefined; });
  if(miss.length) return {error:'These columns are missing: '+miss.join(', ')+'. Use the same columns as the official checklist.'};
  var out=[], curMe='', meTitle={};
  R.slice(1).forEach(function(r,n){
    var g=function(k){ return String(r[C[k]]==null?'':r[C[k]]).trim(); };
    var me=scCpmNormMe(g('ME Reference No')); if(!me||!g('Checkpoints')) return;
    if(g('Measurable Elements')) meTitle[me]=scImpFix(g('Measurable Elements'));
    var raw=scCpmNormT(scImpQuotes(g('Checkpoints')));
    out.push({row:n+2,me:me,aoc:me.charAt(3),t:scImpFix(raw),raw:raw,mov:String(r[C['Means of Verification']]||'').replace(/\r/g,'').trim(),
      method:scImpMethod(g('Assessment Method')),r:scImpRole(g('Role')),round:/^(General Round|Community Interaction)$/.test(g('Role'))?g('Role'):'',
      pk:/not applicable/i.test(g('Package'))?['12B']:['12A','12B'],svc:(g('Service Name')||'').replace('Elderly & Pallative Care','Elderly & Palliative Care')});
  });
  return {rows:out,meTitle:meTitle};
}
function scImpCompare(parsed){
  var all=scCpmAll({includeRetired:true}).filter(function(c){ return c.kind==='nqas'; }), byKey={};
  all.forEach(function(c){ [c.t,c.t0].forEach(function(t){ if(t){ byKey[scCpmKey(c.me,t)]=c; byKey[scCpmKey(c.me,scImpQuotes(t))]=c; } }); });
  var rep={same:[],changed:[],added:[],missing:[],titles:[],seen:{}};
  parsed.rows.forEach(function(x){
    var c=byKey[scCpmKey(x.me,x.t)]||byKey[scCpmKey(x.me,x.raw)];
    if(!c){ rep.added.push(x); return; }
    if(rep.seen[c.id]){ rep.added.push(x); return; }
    rep.seen[c.id]=1;
    var diff=[];
    if(scCpmNormT(scImpQuotes(c.mov))!==scCpmNormT(scImpQuotes(x.mov))) diff.push('mov');
    if(JSON.stringify(c.method.slice().sort())!==JSON.stringify(x.method.slice().sort())) diff.push('method');
    if(JSON.stringify(c.r)!==JSON.stringify(x.r)) diff.push('roles');
    if(JSON.stringify(c.pk.slice().sort())!==JSON.stringify(x.pk.slice().sort())) diff.push('packages');
    if(x.svc&&c.svc!==x.svc) diff.push('service');
    if(c.retired) diff.push('back in the checklist');
    (diff.length?rep.changed:rep.same).push({id:c.id,cur:c,x:x,diff:diff});
  });
  all.forEach(function(c){ if(!rep.seen[c.id]&&!c.retired) rep.missing.push(c); });
  Object.keys(parsed.meTitle).forEach(function(me){ if(scRegTitle('me',me)!==parsed.meTitle[me]) rep.titles.push({me:me,title:parsed.meTitle[me]}); });
  return rep;
}
async function scImpApply(rep,opts){
  var n={updated:0,added:0,retired:0,titles:0};
  for(var i=0;i<rep.changed.length;i++){ var ch=rep.changed[i], x=ch.x, v={};
    if(ch.diff.indexOf('mov')>=0){ v.mov=x.mov; if((ch.cur.items||[]).length) v.movChanged=true; }
    if(ch.diff.indexOf('method')>=0) v.method=x.method;
    if(ch.diff.indexOf('roles')>=0){ v.r=x.r; v.round=x.round; }
    if(ch.diff.indexOf('packages')>=0) v.pk=x.pk;
    if(ch.diff.indexOf('service')>=0) v.svc=x.svc;
    if(ch.diff.indexOf('back in the checklist')>=0) v.retired=false;
    if(await scCpmSave(ch.id,v)) n.updated++; }
  for(var j=0;j<rep.added.length;j++){ var a=rep.added[j];
    var id=await scCpmAdd({t:a.t,me:a.me,svc:a.svc,r:a.r,method:a.method,pk:a.pk,round:a.round});
    if(id){ await scCpmSave(id,{mov:a.mov}); n.added++; } }
  if(opts&&opts.retire) for(var k=0;k<rep.missing.length;k++){ if(await scCpmSave(rep.missing[k].id,{retired:true})) n.retired++; }
  for(var m=0;m<rep.titles.length;m++){ var tt=rep.titles[m]; if(await scRegSave('me',tt.me,{title:tt.title,hi:((_scReg.me[tt.me]||{}).hi)||''})) n.titles++; }
  await fbSet('shared/cp_master/lastImport',{at:scNowIso(),by:'HealSol Admin',updated:n.updated,added:n.added,retired:n.retired,titles:n.titles});
  return n;
}
function scImpReportHTML(rep){
  var sec=function(title,list,fmt,cls){ if(!list.length) return ''; return '<div class="scimp-sec '+(cls||'')+'"><div class="scimp-t">'+title+' ('+list.length+')</div><div class="scimp-l">'+list.slice(0,60).map(fmt).join('')+(list.length>60?'<div class="scq-muted">… and '+(list.length-60)+' more</div>':'')+'</div></div>'; };
  return '<div class="scx-tiles">'+[['Unchanged',rep.same.length],['Changed',rep.changed.length],['New',rep.added.length],['Not in sheet',rep.missing.length],['ME titles',rep.titles.length]]
      .map(function(x){ return '<div class="scx-tile"><div class="scx-tile-v">'+x[1]+'</div><div class="scx-tile-l">'+x[0]+'</div></div>'; }).join('')+'</div>'
    +sec('Changed',rep.changed,function(c){ return '<div><b>'+scEsc(c.id)+'</b> '+scEsc(c.cur.me)+' · '+scEsc(c.cur.t.slice(0,80))+' <span class="scimp-d">'+scEsc(c.diff.join(', '))+'</span>'+(c.diff.indexOf('mov')>=0&&(c.cur.items||[]).length?' <span class="scimp-w">MoV items need review</span>':'')+'</div>'; },'chg')
    +sec('New checkpoints',rep.added,function(x){ return '<div><b>'+scEsc(x.me)+'</b> '+scEsc(x.t.slice(0,90))+' <span class="scimp-d">row '+x.row+'</span></div>'; },'add')
    +sec('In the app but not in this sheet',rep.missing,function(c){ return '<div><b>'+scEsc(c.id)+'</b> '+scEsc(c.me)+' · '+scEsc(c.t.slice(0,80))+'</div>'; },'mis')
    +sec('ME title changes',rep.titles,function(x){ return '<div><b>'+scEsc(x.me)+'</b> '+scEsc(x.title.slice(0,90))+'</div>'; });
}
async function scImpFromText(text){
  if(!scCpmCanEdit()) return null;
  var p=scImpRead(text); if(p.error){ await scAlert(p.error,'Import checklist','⚠️'); return null; }
  var rep=scImpCompare(p);
  return await new Promise(function(resolve){
    var ov=document.createElement('div'); ov.className='scx-ov scimp-ov';
    ov.innerHTML='<div class="scx-box wide" style="max-width:860px;"><div class="scx-hd"><div class="scx-hd-icon">📥</div><div class="scx-hd-title">Checklist comparison — '+p.rows.length+' rows read</div></div>'
      +'<div class="scx-body" style="max-height:62vh;overflow:auto;">'+scImpReportHTML(rep)+'</div>'
      +(rep.missing.length?'<label class="scimp-opt"><input type="checkbox" id="scimp-retire"> Retire the '+rep.missing.length+' checkpoint'+(rep.missing.length===1?'':'s')+' that are not in this sheet (kept in history)</label>':'')
      +'<div class="scx-foot" style="display:flex;gap:8px;margin-top:10px;"><button class="scx-btn ghost" id="scimp-no">Cancel</button>'
      +'<button class="scx-btn" id="scimp-yes"'+(rep.changed.length+rep.added.length+rep.missing.length+rep.titles.length?'':' disabled')+'>Apply changes</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#scimp-no').onclick=function(){ ov.remove(); resolve(null); };
    ov.querySelector('#scimp-yes').onclick=async function(){ var retire=!!(ov.querySelector('#scimp-retire')||{}).checked; this.disabled=true; this.textContent='Applying…';
      var n=await scImpApply(rep,{retire:retire}); ov.remove();
      showToast('Checklist applied: '+n.updated+' updated, '+n.added+' added'+(n.retired?', '+n.retired+' retired':'')+(n.titles?', '+n.titles+' ME titles':'')+'.','ok');
      scCpmRender(); resolve(n); };
  });
}
function scImpPick(){
  if(!scCpmCanEdit()) return;
  var inp=document.createElement('input'); inp.type='file'; inp.accept='.csv,text/csv';
  inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(!f) return; var rd=new FileReader();
    rd.onload=function(){ var buf=rd.result, txt=new TextDecoder('utf-8').decode(buf); if(txt.indexOf('\ufffd')>=0){ try{ txt=new TextDecoder('windows-1252').decode(buf); }catch(e){} } scImpFromText(txt); };
    rd.readAsArrayBuffer(f); };
  inp.click();
}
(function(){
  // the editor clears the "official MoV changed" flag once the items are reviewed and saved
  var oSave=scCpmSave;
  scCpmSave=async function(id,vals){ if(vals&&vals.items!==undefined&&vals.movChanged===undefined) vals=Object.assign({},vals,{movChanged:false}); return oSave.call(this,id,vals); };
  var oChecks=scCpmChecks;
  scCpmChecks=function(pkgCode){
    var out=oChecks.apply(this,arguments), pkg=pkgCode&&pkgCode!=='all'?'nqas_'+pkgCode:null;
    var ids=scCpmAll({pkg:pkg}).filter(function(c){ return c.movChanged; }).map(function(c){ return c.id; });
    out.push({key:'movChanged',level:ids.length?'warn':'ok',label:'Official MoV changed after the items were written',detail:ids.length?'Review the items against the new MoV, then save.':'',ids:ids,n:ids.length,view:'cps'});
    return out;
  };
  var oRender=scCpmRender;
  scCpmRender=function(){ var r=oRender.apply(this,arguments);
    try{ var bar=document.querySelector('#scm-panel .scm-views'); if(bar&&!bar.querySelector('#scimp-btn')){ var b=document.createElement('button'); b.type='button'; b.id='scimp-btn'; b.innerHTML='<i class="ti ti-file-import"></i> Import revised checklist'; b.onclick=scImpPick; bar.insertBefore(b,bar.querySelector('select')); } }catch(e){}
    return r; };
})();

// ══════════════════════════════════════════════════════════════
// STEP C — READINESS ENGINE (current readiness of the whole package)
//  • every unique NQAS checkpoint of the package counts once; unassessed = 0
//  • a staff member's score = their latest score on that checkpoint (marked-done days only)
//  • facility score = the LOWEST latest score among the staff who own the checkpoint
//  • baseline = first assessment of each checkpoint (lowest among owners)
//  • NQAS: overall ≥ criteria.overall and every Standard ≥ its minimum
// ══════════════════════════════════════════════════════════════
var _scPkgCache={};
function scPkgNqas(progId){ var k=progId+'|'+_scCpm.ver; if(!_scPkgCache[k]) _scPkgCache[k]=scCpmAll({pkg:progId,kind:'nqas'}); return _scPkgCache[k]; }
function scBk(){ return {xp:0,max:0,pct:0,n:0,assessed:0}; }
function scBkAdd(map,key,s,assessed){ var b=map[key]||(map[key]=scBk()); b.max+=2; b.n++; if(assessed){ b.xp+=s; b.assessed++; } }
function scBkFinish(map){ Object.keys(map).forEach(function(k){ var b=map[k]; b.pct=b.max?Math.round(b.xp/b.max*100):0; }); }
function scDimsEmpty(){ return {byAoc:{},byStd:{},byMe:{},byService:{},byCat:{}}; }
function scDimsAdd(R,cp,s,assessed){
  scBkAdd(R.byAoc,cp.aoc,s,assessed); scBkAdd(R.byStd,cp.std,s,assessed); scBkAdd(R.byMe,cp.me,s,assessed);
  scBkAdd(R.byService,cp.svc||'Other',s,assessed); scBkAdd(R.byCat,scAocCat(cp.aoc),s,assessed); (Array.isArray(cp.cc)?cp.cc:[]).forEach(function(a){ if(a&&a!==(cp.svc||'Other')) scBkAdd(R.byService,a,s,assessed); });   // cross-cutting areas count too
}
function scDimsFinish(R){ ['byAoc','byStd','byMe','byService','byCat'].forEach(function(k){ scBkFinish(R[k]); }); R.pct=R.max?Math.round(R.xp/R.max*100):0; }
// a person's occurrences of each checkpoint (marked-done days), oldest first
function scStaffOcc(progId,cards,role,present){
  var occ={};
  Object.keys(cards||{}).forEach(function(k){
    var di=+k, c=cards[k]; if(!c||!c.taskDone) return;
    var d=scDayDef(progId,di); if(!d) return;
    (d.cps||[]).forEach(function(cp,ci){
      if(!cp.id||cp.kind!=='nqas') return;
      if(role&&!scCpForRoleIn(cp,role,present)) return;
      var s=scNormScore((c.cpScores||[])[ci]); if(s===null) return;
      var gr=(c.gapRetries||{})[ci]||null;
      (occ[cp.id]=occ[cp.id]||[]).push({di:di,ci:ci,score:s,orig:(gr&&gr.orig!=null)?scNormScore(gr.orig):s,t:(gr&&gr.lastAt)||c.updatedAt||'',gr:gr,day:d,cp:cp,verified:!!c.verified});
    });
  });
  Object.keys(occ).forEach(function(id){ occ[id].sort(function(a,b){ return a.di-b.di; }); });
  return occ;
}
function scLatestOcc(list){
  var L=list[list.length-1];
  list.forEach(function(o){ if(o!==L&&o.gr&&o.gr.lastAt&&L.t&&String(o.gr.lastAt)>String(L.t)) L=o; });
  return L;
}
function scStaffGaps(list,latest){
  var cp=latest.cp, d=latest.day, aoc=scAocKey(cp,d), svc=cp.svc||d.service||'Other';
  var base={id:cp.id,cp:cp,aoc:aoc,service:svc,std:cp.std};
  if(latest.score<2){
    var lastFull=-1; list.forEach(function(o,i){ if(o.score===2&&o.di<latest.di) lastFull=i; });
    var start=list[lastFull+1]||latest;
    return [Object.assign({},base,{di:start.di,ci:start.ci,day:start.day,score:latest.score,closed:false,attempts:(start.gr&&start.gr.attempts)?scAsList(start.gr.attempts):[],latestDi:latest.di,orig:start.orig})];
  }
  var closedBy=null; list.forEach(function(o){ if(o.gr&&o.gr.closed) closedBy=o; });
  if(closedBy) return [Object.assign({},base,{di:closedBy.di,ci:closedBy.ci,day:closedBy.day,score:closedBy.gr.orig!=null?scNormScore(closedBy.gr.orig):null,closed:true,closedAt:closedBy.gr.closedAt||'',attempts:scAsList(closedBy.gr.attempts),resolvedBy:'reattempt'})];
  var firstLow=list.find(function(o){ return o.orig<2&&o.di<latest.di; });
  if(firstLow) return [Object.assign({},base,{di:firstLow.di,ci:firstLow.ci,day:firstLow.day,score:firstLow.orig,closed:true,closedAt:latest.t||'',attempts:[],resolvedBy:'recheck',resolvedDi:latest.di})];
  return [];
}
function scStaffResult(progId,cards,role,present){
  var cps=scPkgNqas(progId).filter(function(cp){ return !role||scCpForRoleIn(cp,role,present); });
  var occ=scStaffOcc(progId,cards,role,present);
  var R=Object.assign({xp:0,max:0,pct:0,total:cps.length,assessed:0,daysDone:0,daysVerified:0,totalDays:getDaysArr(progId).length,gaps:[],latest:{}},scDimsEmpty());
  var B=Object.assign({xp:0,max:0,pct:0,assessed:0},scDimsEmpty());
  cps.forEach(function(cp){
    var list=occ[cp.id], L=list?scLatestOcc(list):null, s=L?L.score:0, b=list?list[0].orig:null;
    R.max+=2; if(L){ R.xp+=s; R.assessed++; } scDimsAdd(R,cp,s,!!L);
    B.max+=2; if(b!==null){ B.xp+=b; B.assessed++; } scDimsAdd(B,cp,b||0,b!==null);
    if(L){ R.latest[cp.id]={score:s,base:b,di:L.di,ci:L.ci,at:L.t}; R.gaps=R.gaps.concat(scStaffGaps(list,L)); }
  });
  Object.keys(cards||{}).forEach(function(k){ var c=cards[k]; if(c&&c.taskDone){ R.daysDone++; if(c.verified) R.daysVerified++; } });
  scDimsFinish(R); scDimsFinish(B); R.baseline=B;
  R.coverage={assessed:R.assessed,total:R.total,pct:R.total?Math.round(R.assessed/R.total*100):0};
  R.compliance=R.assessed?Math.round(R.xp/(R.assessed*2)*100):0;
  return R;
}
function scNqasCheckV2(R){
  var stdFails=Object.keys(R.byStd||{}).filter(function(s){ var b=R.byStd[s]; return b.max>0&&b.pct<scNqasStdMin(s); }).sort(scStdCmp);
  var hasData=!!(R.coverage&&R.coverage.assessed);
  var overallOk=R.pct>=_scCrit.overall, aocMin=_scCrit.aoc!=null?+_scCrit.aoc:70;
  var aocFails=Object.keys(R.byAoc||{}).filter(function(a){ var b=R.byAoc[a]; return /^[A-H]$/.test(a)&&b&&b.max>0&&b.pct<aocMin; }).sort();   // NQAS: every Area of Concern too
  return {hasData:hasData,overallOk:overallOk,stdFails:stdFails,aocFails:aocFails,aocMin:aocMin,meets:hasData&&overallOk&&!stdFails.length&&!aocFails.length,overallMin:_scCrit.overall};
}
// ── staff app: own readiness across own checkpoints of the whole package ──
scReadiness=function(progId,cards,role){
  var R=scStaffResult(progId,cards,role||null,role?(_scRolesPresent||null):null);
  R.nqas=scNqasCheckV2(R); return R;
};
// ── facility readiness ─────────────────────────────────────────
scFacilityReadiness=function(progId,progressByMob,staffMap){
  progId=progId||'nqas_12A'; progressByMob=progressByMob||{}; staffMap=staffMap||{};
  var present=scRolesFromRoster(staffMap), people=[];
  Object.keys(staffMap).forEach(function(m){ var s=staffMap[m]; if(s&&!s.disabled) people.push({mob:m,name:s.name||m,role:s.role||'CHO',inRoster:true}); });
  Object.keys(progressByMob).forEach(function(m){ if(staffMap[m]&&!staffMap[m].disabled) return;
    var role=''; Object.keys(progressByMob[m]||{}).some(function(k){ var r=progressByMob[m][k]; if(r&&r.role){ role=r.role; return true; } return false; });
    people.push({mob:m,name:((staffMap[m]||{}).name)||Object.keys(progressByMob[m]||{}).map(function(k){ return (progressByMob[m][k]||{}).staffName; }).filter(Boolean)[0]||m,role:role||'CHO',inRoster:false}); });
  var A=Object.assign({xp:0,max:0,pct:0,total:0,assessed:0,daysDone:0,daysVerified:0,daysComplete:0,totalDays:getDaysArr(progId).length,staff:[],gaps:[],cps:{},progId:progId},scDimsEmpty());
  var B=Object.assign({xp:0,max:0,pct:0,assessed:0},scDimsEmpty());
  people.forEach(function(p){
    var cards=scCardsFromRemote(progressByMob[p.mob],progId);
    p.cards=cards; p.res=scStaffResult(progId,cards,p.role,present);
    A.daysDone+=p.res.daysDone; A.daysVerified+=p.res.daysVerified;
  });
  var cps=scPkgNqas(progId); A.total=cps.length;
  cps.forEach(function(cp){
    var by=[];
    people.forEach(function(p){
      if(!scCpForRoleIn(cp,p.role,present)) return;
      var L=p.res.latest[cp.id];
      if(!p.inRoster&&!L) return;
      by.push({mob:p.mob,name:p.name,role:p.role,score:L?L.score:null,base:L?L.base:null});
    });
    var scored=by.filter(function(x){ return x.score!==null; }), bases=by.filter(function(x){ return x.base!==null; });
    var s=scored.length?Math.min.apply(null,scored.map(function(x){ return x.score; })):null;
    var b=bases.length?Math.min.apply(null,bases.map(function(x){ return x.base; })):null;
    A.cps[cp.id]={score:s,base:b,by:by,owners:by.length};
    A.max+=2; if(s!==null){ A.xp+=s; A.assessed++; } scDimsAdd(A,cp,s||0,s!==null);
    B.max+=2; if(b!==null){ B.xp+=b; B.assessed++; } scDimsAdd(B,cp,b||0,b!==null);
  });
  people.forEach(function(p){
    p.res.gaps.forEach(function(g){ A.gaps.push(Object.assign(g,{mob:p.mob,staffName:p.name,role:p.role,others:(A.cps[g.id]||{}).by||[]})); });
    A.staff.push({mob:p.mob,name:p.name,role:p.role,inRoster:p.inRoster,res:p.res});
  });
  // days on which every registered owner has marked their card done
  getDaysArr(progId).forEach(function(_,di){
    var d=scDayDef(progId,di), need=people.filter(function(p){ return p.inRoster&&(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,p.role,present); }); });
    if(need.length&&need.every(function(p){ return p.cards[di]&&p.cards[di].taskDone; })) A.daysComplete++;
  });
  scDimsFinish(A); scDimsFinish(B); A.baseline=B;
  A.coverage={assessed:A.assessed,total:A.total,pct:A.total?Math.round(A.assessed/A.total*100):0};
  A.compliance=A.assessed?Math.round(A.xp/(A.assessed*2)*100):0;
  A.staff.sort(function(a,b){ return (b.res.pct-a.res.pct)||String(a.name).localeCompare(b.name); });
  A.nqas=scNqasCheckV2(A);
  return A;
};

// ══════════════════════════════════════════════════════════════
// STEP C — DASHBOARD VIEWS
// ══════════════════════════════════════════════════════════════
function scBar2(label,cur,base,min,sub){
  var p=cur.pct, col=scPctColor(p), bp=base&&base.assessed?base.pct:null;
  return '<div class="scx-bar"><div class="scx-bar-l" title="'+scEsc(label)+'">'+scEsc(label)+'</div>'
    +'<div class="scx-bar-bg"><div class="scx-bar-fill" style="width:'+p+'%;background:'+col+';"></div>'
    +(bp!==null?'<div class="scc-base" style="left:'+bp+'%;" title="Baseline '+bp+'%"></div>':'')
    +(min?'<div class="scx-bar-mark" style="left:'+min+'%;" title="NQAS minimum '+min+'%"></div>':'')+'</div>'
    +'<div class="scx-bar-p" style="color:'+scPctText(p)+';">'+p+'%</div><div class="scx-bar-x">'+(sub!=null?sub:(cur.assessed+'/'+cur.n+' assessed'))+'</div></div>';
}
scNqasBoxHTML=function(agg){
  var n=agg.nqas||scNqasCheckV2(agg);
  if(!n.hasData) return '<div class="scx-nqas na"><b>NQAS: no assessment yet</b><br>Readiness appears once staff mark day cards as done. Unassessed checkpoints count as 0.</div>';
  if(n.meets) return '<div class="scx-nqas ok"><b>✓ Meets NQAS criteria</b><br>Overall '+agg.pct+'% (≥'+n.overallMin+'%), every Area of Concern (≥'+(n.aocMin||70)+'%) and every Standard at or above its minimum.</div>';
  var why=[];
  if(!n.overallOk) why.push('Overall '+agg.pct+'% — needs '+n.overallMin+'%');
  if((n.aocFails||[]).length) why.push('Area'+(n.aocFails.length===1?'':'s')+' of Concern below '+(n.aocMin||70)+'%: '+n.aocFails.map(function(a){ return a+' '+agg.byAoc[a].pct+'%'; }).join(', '));
  if(n.stdFails.length) why.push(n.stdFails.length+' of '+Object.keys(agg.byStd).length+' Standards below their minimum: '
    +n.stdFails.slice(0,10).map(function(s){ return s+' '+agg.byStd[s].pct+'% (≥'+scNqasStdMin(s)+'%)'; }).join(', ')+(n.stdFails.length>10?' …':''));
  return '<div class="scx-nqas no"><b>✗ Not yet at NQAS criteria</b><br>'+scEsc(why.join(' · '))+'</div>';
};
scInsReadinessHTML=function(st,openCnt,overdueCnt){
  var a=st.agg, B=a.baseline||{}, hasB=!!B.assessed;
  var tile=function(v,l,col,title){ return '<div class="scx-tile"'+(title?' title="'+scEsc(title)+'"':'')+'><div class="scx-tile-v"'+(col?' style="color:'+col+';"':'')+'>'+v+'</div><div class="scx-tile-l">'+l+'</div></div>'; };
  var html='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:8px;">Package: <span style="color:var(--teal-dk);font-weight:900;">'+scEsc(scPkgLabel(st.progId))+'</span> · '+a.total+' NQAS checkpoints · each counted once at its latest score, lowest score when staff differ</div>'
    +'<div class="scx-tiles">'
    +tile(a.pct+'%','Current readiness',scPctText(a.pct),'Points earned ÷ maximum for the whole package (unassessed = 0)')
    +tile(hasB?B.pct+'%':'—','Baseline (pre-assessment)',hasB?scPctText(B.pct):'var(--t3)','First assessment of each checkpoint')
    +tile(a.coverage.assessed+'/'+a.total,'Checkpoints assessed ('+a.coverage.pct+'%)')
    +tile(a.assessed?a.compliance+'%':'—','Compliance on assessed',a.assessed?scPctText(a.compliance):'var(--t3)','Score on the checkpoints assessed so far')
    +tile(openCnt,'Open gaps','var(--amber-dk)')
    +tile(overdueCnt,'Overdue actions',overdueCnt?'var(--red-dk)':'var(--t3)')
    +tile(a.daysComplete+'/'+a.totalDays,'Days completed','', 'Days on which every responsible staff member marked the card done')
    +tile(a.daysVerified+'/'+a.daysDone,'Cards verified')
    +'</div>'+scNqasBoxHTML(a)
    +'<div class="scc-legend"><span><i class="scc-sw cur"></i> Current</span>'+(hasB?'<span><i class="scc-sw base"></i> Baseline</span>':'')+'<span><i class="scc-sw min"></i> NQAS minimum</span></div>';
  html+='<div class="scx-sub">Structure · Process · Outcome</div>'+SC_AOC_CATS.map(function(k){ var b=a.byCat[k]; return b?scBar2(k+' ('+Object.keys(SC_CPM_AOC).filter(function(x){ return scAocCat(x)===k; }).join(', ')+')',b,B.byCat&&B.byCat[k]):''; }).join('');
  html+='<div class="scx-sub">By Area of Concern</div>'+Object.keys(SC_CPM_AOC).map(function(k){ var b=a.byAoc[k]; return b?scBar2('AoC '+k+' · '+SC_CPM_AOC[k],b,B.byAoc&&B.byAoc[k]):''; }).join('');
  var stds=Object.keys(a.byStd).sort(scStdCmp);
  html+='<div class="scx-sub">By Standard <span class="scc-hint">minimum to pass NQAS shown for each</span></div><div class="scc-std">'
    +'<table><thead><tr><th>Standard</th><th>Current</th><th>Min</th><th></th><th>Baseline</th><th>Assessed</th></tr></thead><tbody>'
    +stds.map(function(s){ var b=a.byStd[s], m=scNqasStdMin(s), ok=b.pct>=m, bb=B.byStd&&B.byStd[s];
      return '<tr class="'+(ok?'ok':'no')+'"><td><b>'+s+'</b> <span>'+scEsc((scRegTitle('std',s)||'').slice(0,46))+'</span></td><td style="color:'+scPctText(b.pct)+';"><b>'+b.pct+'%</b></td><td>'+m+'%</td><td>'+(ok?'✓':'✗')+'</td><td>'+(bb&&bb.assessed?bb.pct+'%':'—')+'</td><td>'+b.assessed+'/'+b.n+'</td></tr>'; }).join('')
    +'</tbody></table></div>';
  ['service','support'].forEach(function(g){
    var names=Object.keys(a.byService).filter(function(k){ return scSvcGroup(k)===g; });
    var order=SC_SVC_GROUPS[g]; names.sort(function(x,y){ return (order.indexOf(x)<0?99:order.indexOf(x))-(order.indexOf(y)<0?99:order.indexOf(y)); });
    if(names.length) html+='<div class="scx-sub">'+scEsc(SC_SVC_GROUP_LABEL[g])+'</div>'+names.map(function(k){ return scBar2(k,a.byService[k],B.byService&&B.byService[k]); }).join('');
  });
  return html;
};
scInsStaffHTML=function(st){
  var a=st.agg;
  if(!a.staff.length) return '<div class="scx-empty">No staff registered yet.</div>';
  var rows=scInsRows(st);
  return '<div class="scc-hint" style="margin-bottom:8px;">Each person\'s readiness across their own checkpoints for the whole package (latest score; unassessed = 0).</div>'+a.staff.map(function(s){
    var r=s.res, openG=rows.filter(function(x){ return x.g.mob===s.mob&&x.status!=='closed'; }).length, od=rows.filter(function(x){ return x.g.mob===s.mob&&x.status==='overdue'; }).length;
    var rd=typeof getScRole==='function'?getScRole(s.role):null, bp=r.baseline&&r.baseline.assessed?r.baseline.pct:null;
    return '<div class="scx-staff" onclick="scInsStaffGaps(\''+scJs(st.hostId)+'\',\''+scJs(s.mob)+'\')" title="Show this person\'s gaps">'
      +'<div class="scx-av">'+scEsc(String(s.name||'?').charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(s.name)+(s.inRoster?'':' <span style="font-size:9px;color:var(--t3);">(removed)</span>')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">'+scEsc(rd&&rd.label?rd.label:s.role)+' · '+r.assessed+'/'+r.total+' own checkpoints assessed · '+r.daysDone+' cards done · '+r.daysVerified+' verified · '+openG+' open gap'+(openG===1?'':'s')
      +(od?' · <span style="color:var(--red-dk);">'+od+' overdue</span>':'')+(bp!==null?' · baseline '+bp+'%':'')+'</div>'
      +'<div class="scx-bar-bg" style="margin-top:5px;"><div class="scx-bar-fill" style="width:'+r.pct+'%;background:'+scPctColor(r.pct)+';"></div>'+(bp!==null?'<div class="scc-base" style="left:'+bp+'%;"></div>':'')+'</div></div>'
      +'<div style="font-size:15px;font-weight:900;color:'+scPctText(r.pct)+';width:44px;text-align:right;">'+r.pct+'%</div></div>';
  }).join('');
};
function scGapWhoHTML(g){
  var o=(g.others||[]).filter(function(x){ return x.score!==null||x.mob!==g.mob; });
  if(o.length<2) return '';
  return '<div class="scc-who">Scores on this checkpoint: '+o.map(function(x){ return '<span class="s'+(x.score===null?'n':x.score)+'">'+scEsc(x.role)+' '+scEsc(String(x.name).split(' ')[0])+': '+(x.score===2?'Full':x.score===1?'Half':x.score===0?'Zero':'not yet')+'</span>'; }).join(' ')
    +' <em>(lowest counts)</em></div>';
}

// ── hooks into the existing views ──────────────────────────────
(function(){
  // Gap Register rows: who gave what, and "resolved at re-check"
  var oGaps=scInsGapsHTML;
  scInsGapsHTML=function(st){
    var h=oGaps.apply(this,arguments);
    try{
      var list=scInsFiltered(st).slice(0,st.limit), re=/<div class="scx-gap(?: overdue| closed)?">/g, starts=[], m;
      while((m=re.exec(h))) starts.push(m.index);
      if(!starts.length) return h;
      var out=h.slice(0,starts[0]);
      for(var i=0;i<starts.length;i++){
        var chunk=h.slice(starts[i],i+1<starts.length?starts[i+1]:h.length), g=(list[i]||{}).g;
        if(g){
          if(g.resolvedBy==='recheck') chunk=chunk.replace(/Was (Zero|Half|—) → Full/,'Was $1 → Full at re-check (Day '+(g.resolvedDi+1)+')');
          var who=scGapWhoHTML(g);
          if(who) chunk=chunk.replace('<div class="scx-gap-meta">'+scEsc(g.service),who+'<div class="scx-gap-meta">'+scEsc(g.service));
        }
        out+=chunk;
      }
      return out;
    }catch(e){ return h; }
  };
  // HealSol / Supervisor facility cards and package strip
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){
    var r=oDash.apply(this,arguments);
    try{
      var codes=Object.keys(scMasterFacilities||{}), byName={};
      codes.forEach(function(c){ var f=scMasterFacilities[c]; byName[(f&&f.name)||c]=c; });
      var avgN=0,avgS=0,pk={};
      document.querySelectorAll('#sc-master-grid .master-fac-card, .master-fac-card').forEach(function(card){
        var nm=card.querySelector('.mfc-name'); if(!nm) return; var name=(nm.childNodes[0]||{}).textContent||'';
        var code=byName[name.trim()]; if(!code) return; var a=scFacAggFor(code), f=scMasterFacilities[code]||{};
        if(a.coverage.assessed){ avgN++; avgS+=a.pct; }
        var p=pk[f.progId||'nqas_12A']||(pk[f.progId||'nqas_12A']={n:0,xp:0,max:0,meets:0,withData:0}); p.n++; p.xp+=a.xp; p.max+=a.max; if(a.coverage.assessed){ p.withData++; if(a.nqas.meets) p.meets++; }
        var pc=card.querySelector('.mfc-pct'); if(pc) pc.textContent=a.coverage.assessed?a.pct+'%':'—';
        var badge=card.querySelector('.scx-nq-badge'); if(badge&&!a.coverage.assessed) badge.remove();
        if(!card.querySelector('.scc-card-line')){
          var line=document.createElement('div'); line.className='scc-card-line';
          line.innerHTML='Baseline <b>'+(a.baseline.assessed?a.baseline.pct+'%':'—')+'</b> · Assessed <b>'+a.coverage.assessed+'/'+a.total+'</b> · '
            +(a.coverage.assessed?(a.nqas.stdFails.length?'<span style="color:var(--red-dk);">'+a.nqas.stdFails.length+' Standards below minimum</span>':'All Standards at minimum'):'Not assessed yet');
          var meta=card.querySelector('.mfc-meta'); if(meta) meta.parentNode.insertBefore(line,meta);
        }
      });
      var avg=document.getElementById('sc-master-avg'); if(avg) avg.textContent=avgN?Math.round(avgS/avgN)+'%':'—';
      var strip=document.getElementById('sc-pkg-strip');
      if(strip) strip.querySelectorAll('.scx-pkg').forEach(function(el,i){ var prog=PROGRAMS[i]; var p=prog&&pk[prog.id]; if(!p) return;
        var v=el.querySelector('.scx-pkg-v'), s=el.querySelector('.scx-pkg-s'), pct=p.max?Math.round(p.xp/p.max*100):0;
        if(v){ v.textContent=p.withData?pct+'%':'—'; v.style.color=p.withData?scPctText(pct):'var(--t3)'; }
        if(s) s.textContent=p.n+' facilit'+(p.n===1?'y':'ies')+' · '+p.meets+'/'+p.withData+' meet NQAS criteria'; });
    }catch(e){ console.warn('[SC] dashboard readiness',e); }
    return r;
  };
})();
