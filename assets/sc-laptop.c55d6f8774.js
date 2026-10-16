
// ══════════════════════════════════════════════════════════════
// BUILD 4.4 — LAPTOP DASHBOARDS: Supervisor · HealSol · District · Quality Champion
//  One shell (side menu + top bar) and one Overview (hero, counts to act on, sortable facility
//  table, Needs attention, Most improved, Standards heat-map) for every role. Existing sections
//  are grouped under the menu instead of stacked; their logic is unchanged.
// ══════════════════════════════════════════════════════════════
var _nfOv={sort:'readiness',dir:-1,q:'',allStd:false,view:'overview',prev:'overview'};
function nfGreet(){ var h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; }
function nfDayOf(f){ if(!f||!f.startDate) return null; if(scTodayStr()<f.startDate) return 0; var p=getProg(f.progId||'nqas_12A'); return Math.min(computeCurrentDay(f.startDate,p.days),p.days); }
// ── rows for the facility table ────────────────────────────────
function nfAdminRows(){
  var codes=scVisibleFacilityCodes().filter(function(c){ var f=(scMasterFacilities||{})[c]; return f&&!f.migratedTo; });   // moved facilities keep an old record — count them once
  return codes.map(function(code){
    var f=(scMasterFacilities||{})[code]||{}, a=scFacAggFor(code), acts=scRvList((_scRvAll||{})[code]||{}), raw=(_scRvAll||{})[code]||{};
    var prog=(scMasterProgress||{})[code]||{}, pid=f.progId||'nqas_12A', today=scTodayStr();
    var bl=scBaselineStatus(pid,prog,f.staff||{}), blDone=bl.every(function(x){ return x.complete; });
    var published=acts.some(function(x){ return x.status&&x.status!=='draft'; });
    var overdue=acts.filter(function(x){ return x.status!=='draft'&&x.status!=='closed'&&x.dueDate&&x.dueDate<today; }).length;
    var confirm=acts.filter(function(x){ var s=scRvStatus(x,pid,prog); return s==='done'||s==='awaiting'; }).length;
    var doubts=Object.keys(raw).filter(function(k){ return (raw[k]||{}).status==='suggested'; }).length;
    var acted={}; Object.keys(raw).forEach(function(k){ var x=raw[k]; if(x&&x.cpId&&['closed','accepted','resolved','suggested'].indexOf(x.status)<0) acted[x.cpId]=1; });
    var noAct=Object.keys(a.cps||{}).filter(function(id){ var x=a.cps[id]; return x.score!==null&&x.score<2&&!acted[id]; }).length;
    var toVerify=0; try{ var ctx=scVCtx(code); if(ctx) toVerify=scVPending(ctx).length; }catch(e){}
    return {code:code,name:f.name||code,district:f.district||'',day:nfDayOf(f),agg:a,overdue:overdue,confirm:confirm,doubts:doubts,noAct:noAct,toVerify:toVerify,
      planMissing:blDone&&!published&&(nfDayOf(f)||0)>=8,trial:f.subscriptionStatus==='trial'};
  });
}
function nfChampRows(){
  return Object.keys(_scq.facs||{}).filter(scqChampionCan).map(function(code){
    var f=_scq.facs[code], pr=_scq.prog[code]||{}, a=scFacilityReadiness(f.progId||'nqas_12A',pr,f.staff||{});
    var toVerify=0; try{ var ctx=scVCtx(code); if(ctx) toVerify=scVPending(ctx).length; }catch(e){}
    var next=scqVisibleSessions().filter(function(s){ return s.code===code&&['proposed','upcoming','live'].indexOf(scqPhase(s))>=0; })[0];
    return {code:code,name:f.name||code,district:f.district||'',day:nfDayOf(f),agg:a,toVerify:toVerify,next:next};
  });
}
// ── Overview pieces ────────────────────────────────────────────
function nfStatusChip(r){
  var a=r.agg;
  if(r.planMissing) return '<span class="nfo-chip red">Plan not published</span>';
  if(!a.coverage||!a.coverage.assessed) return '<span class="nfo-chip grey">Not assessed yet</span>';
  if(a.nqas.meets) return '<span class="nfo-chip green">✓ Meets NQAS</span>';
  var n=a.nqas.stdFails.length; return '<span class="nfo-chip amber">'+(n?n+' Std below':'Overall below 70%')+'</span>';
}
function nfSortRows(rows){
  var k=_nfOv.sort, d=_nfOv.dir, val=function(r){ var a=r.agg, b=a.baseline||{};
    return k==='name'?String(r.name).toLowerCase():k==='day'?(r.day||0):k==='change'?(b.assessed?a.pct-b.pct:-999):k==='overdue'?(r.overdue||0):k==='verify'?(r.toVerify||0):(a.coverage&&a.coverage.assessed?a.pct:-1); };
  return rows.slice().sort(function(x,y){ var a=val(x), b=val(y); return (a<b?-1:a>b?1:0)*d||String(x.name).localeCompare(y.name); });
}
function nfOvSort(k){ if(_nfOv.sort===k) _nfOv.dir=-_nfOv.dir; else { _nfOv.sort=k; _nfOv.dir=(k==='name'?1:-1); } nfRenderOverview(); }
function nfOvSearch(v){ _nfOv.q=v; nfRenderOverview(); var s=document.getElementById('nfo-search'); if(s){ s.focus(); s.setSelectionRange(v.length,v.length); } }
function nfTableHTML(rows,champ){
  var th=function(k,l,cls){ return '<th class="'+(cls||'')+'"><button type="button" onclick="nfOvSort(\''+k+'\')">'+l+(_nfOv.sort===k?(_nfOv.dir<0?' ↓':' ↑'):'')+'</button></th>'; };
  var q=_nfOv.q.trim().toLowerCase(), list=nfSortRows(rows).filter(function(r){ return !q||(r.name+' '+r.code+' '+r.district).toLowerCase().indexOf(q)>=0; });
  var h='<table class="nfo-t"><thead><tr>'+th('name','Facility')+th('day','Day','c')+th('readiness','Readiness','w')+th('change','Baseline')+'<th>NQAS</th>'
    +(champ?th('verify','To verify','c')+'<th>Next session</th><th></th>':th('overdue','Overdue','c')+th('verify','To verify','c'))+'</tr></thead><tbody>';
  if(!list.length) h+='<tr><td colspan="8" class="nfo-empty">'+(rows.length?'No facility matches "'+scEsc(_nfOv.q)+'".':'No facilities yet.')+'</td></tr>';
  list.forEach(function(r){ var a=r.agg, b=a.baseline||{}, has=a.coverage&&a.coverage.assessed, ch=b.assessed?a.pct-b.pct:null;
    h+='<tr class="nfo-row" onclick="'+(champ?'nfChampFacility(\''+scJs(r.code)+'\')':'scDrillIn(\''+scJs(r.code)+'\')')+'"><td><b>'+scEsc(r.name)+'</b>'+nfProBadge(((champ?_scq.facs:scMasterFacilities)||{})[r.code])+(r.trial?' <span class="nfo-chip blue sm">Trial</span>':'')+'<small>'+scEsc(r.district||r.code)+'</small></td>'
      +'<td class="c">'+(r.day==null?'—':r.day<1?'<small>starts '+scEsc(scFmtDate(((champ?_scq.facs:scMasterFacilities)[r.code]||{}).startDate))+'</small>':r.day)+'</td>'
      +'<td class="w"><div class="nfo-rb"><div class="nf-bar"><i style="width:'+(has?a.pct:0)+'%;background:'+scPctColor(a.pct)+'"></i></div><b>'+(has?a.pct+'%':'—')+'</b></div></td>'
      +'<td>'+(b.assessed?b.pct+'% <b class="'+(ch>0?'up':ch<0?'down':'')+'">'+(ch>0?'+':'')+ch+'</b>':'<small>—</small>')+'</td><td>'+nfStatusChip(r)+'</td>'
      +(champ?'<td class="c">'+(r.toVerify||'—')+'</td><td><small>'+(r.next?scEsc(scFmtDateTime(r.next.startAt)):'None planned')+'</small></td>'
          +'<td class="nfo-acts"><button class="scx-btn sm ghost" onclick="event.stopPropagation();scqOpenActionPlan(\''+scJs(r.code)+'\')"><i class="ti ti-list-check"></i> Action Plan</button><button class="scx-btn sm" onclick="event.stopPropagation();scqEditSession(null,\''+scJs(r.code)+'\')"><i class="ti ti-calendar-plus"></i> Session</button></td>'
        :'<td class="c'+(r.overdue?' red':'')+'">'+(r.overdue||0)+'</td><td class="c">'+(r.toVerify||0)+'</td>')+'</tr>'; });
  return h+'</tbody></table>';
}
function nfHeatHTML(rows){
  var withData=rows.filter(function(r){ return r.agg.coverage&&r.agg.coverage.assessed; });
  if(!withData.length) return '<div class="nfo-empty">The heat-map fills in once facilities complete their baseline.</div>';
  var stds=Object.keys(withData[0].agg.byStd||{}).sort(scStdCmp);
  var avg={}; stds.forEach(function(s){ var v=withData.map(function(r){ return (r.agg.byStd[s]||{}).pct||0; }); avg[s]=v.reduce(function(a,b){ return a+b; },0)/v.length-scNqasStdMin(s); });
  var cols=_nfOv.allStd?stds:stds.slice().sort(function(a,b){ return avg[a]-avg[b]; }).slice(0,12).sort(scStdCmp);
  var cell=function(b,s){ if(!b||!b.assessed) return '<td><span class="nfo-h na">—</span></td>'; var m=scNqasStdMin(s), cls=b.pct>=Math.max(70,m)?'g':b.pct>=m?'a':'r';
    return '<td><span class="nfo-h '+cls+'" title="'+scEsc(s)+' '+b.pct+'% (min '+m+'%)">'+b.pct+'</span></td>'; };
  return '<div class="nfo-heat-wrap"><table class="nfo-heat"><thead><tr><th>Facility</th>'+cols.map(function(s){ return '<th title="'+scEsc(scRegTitle('std',s)||s)+'">'+s+(scNqasStdMin(s)>50?'<i>60</i>':'')+'</th>'; }).join('')+'</tr></thead><tbody>'
    +nfSortRows(withData).map(function(r){ return '<tr><td>'+scEsc(r.name)+'</td>'+cols.map(function(s){ return cell(r.agg.byStd[s],s); }).join('')+'</tr>'; }).join('')+'</tbody></table></div>';
}
function nfImprovedHTML(rows){
  var L=rows.filter(function(r){ var b=r.agg.baseline||{}; return b.assessed&&r.agg.pct-b.pct>0; }).sort(function(x,y){ return (y.agg.pct-y.agg.baseline.pct)-(x.agg.pct-x.agg.baseline.pct); }).slice(0,5);
  if(!L.length) return '<div class="nfo-empty sm">Appears once facilities improve on their baseline.</div>';
  return L.map(function(r,i){ return '<div class="nfo-imp"><span>'+(i+1)+'</span><b>'+scEsc(r.name)+'</b><em>+'+(r.agg.pct-r.agg.baseline.pct)+'</em></div>'; }).join('');
}
function nfOverviewHTML(rows,opts){
  var withData=rows.filter(function(r){ return r.agg.coverage&&r.agg.coverage.assessed; }), withBase=rows.filter(function(r){ return r.agg.baseline&&r.agg.baseline.assessed; });
  var avg=withData.length?Math.round(withData.reduce(function(s,r){ return s+r.agg.pct; },0)/withData.length):null;
  var gain=withBase.length?Math.round(withBase.reduce(function(s,r){ return s+(r.agg.pct-r.agg.baseline.pct); },0)/withBase.length):null;
  var meets=withData.filter(function(r){ return r.agg.nqas.meets; }).length;
  var h='<div class="nfo-top"><div><h1>'+scEsc(nfGreet())+', '+scEsc(opts.name)+'</h1><small>'+scEsc(opts.sub)+'</small></div>'
    +'<div class="nfo-search"><i class="ti ti-search"></i><input id="nfo-search" placeholder="Search facility…" value="'+scEsc(_nfOv.q)+'" oninput="nfOvSearch(this.value)"></div>'
    +'<button type="button" class="nfo-ic" title="Refresh" onclick="'+opts.refresh+'"><i class="ti ti-refresh"></i></button></div>'
    +'<div class="nfo-kpis"><div class="nfo-hero"><small>Average readiness</small><div><b>'+(avg===null?'—':avg+'%')+'</b>'+(gain!==null?'<span><i class="ti ti-trending-up"></i> '+(gain>=0?'+':'')+gain+' since baseline</span>':'')+'</div>'
    +'<small>'+meets+' of '+rows.length+' facilit'+(rows.length===1?'y meets':'ies meet')+' NQAS criteria</small></div>'
    +opts.kpis.map(function(k){ return '<div class="nfo-kpi'+(k.onclick?' click':'')+'"'+(k.onclick?' onclick="'+k.onclick+'"':'')+'><small>'+scEsc(k.l)+'</small><b style="color:'+k.c+'">'+k.v+'</b><small>'+scEsc(k.s)+'</small></div>'; }).join('')+'</div>'
    +'<div class="nfo-grid"><div class="nfo-col">'
    +'<div class="nfo-card"><div class="nfo-ch"><b>Facilities</b><span>'+rows.length+' · click a column to sort · click a row to open'+(opts.champ?' (view only)':'')+'</span></div><div class="nfo-tw">'+nfTableHTML(rows,opts.champ)+'</div></div>'
    +'<div class="nfo-card"><div class="nfo-ch"><b>Standards across facilities</b><span>green ≥70% · amber at minimum · red below minimum'
    +' · <button type="button" class="nfo-link" onclick="_nfOv.allStd=!_nfOv.allStd;nfRenderOverview()">'+(_nfOv.allStd?'Show the weakest 12':'Show all Standards')+'</button></span></div>'+nfHeatHTML(rows)+'</div></div>'
    +'<div class="nfo-side">'+(opts.attention!=null?'<div class="nfo-card"><div class="nfo-ch"><b><i class="ti ti-alert-triangle" style="color:var(--red-dk)"></i> Needs attention</b></div>'+opts.attention+'</div>':'')
    +(opts.extraSide||'')
    +'<div class="nfo-card nfo-q"><div class="nfo-ch"><b><i class="ti ti-trending-up" style="color:var(--qi)"></i> Most improved since baseline</b></div>'+nfImprovedHTML(rows)+'</div></div></div>';
  return h;
}
function nfAttentionHTML(){
  var items=[]; try{ items=scRvAttention(); }catch(e){}
  if(!items.length) return '<div class="nfo-empty sm">✓ Nothing pending</div>';
  return items.slice(0,12).map(function(x){ var f=(scMasterFacilities||{})[x.code]||{};
    return '<button type="button" class="nfo-att '+x.lvl+'" onclick="scDrillIn(\''+scJs(x.code)+'\')"><b>'+scEsc(f.name||x.code)+'</b><span>'+scEsc(x.txt)+'</span></button>'; }).join('');
}
// ── shell (side menu) ──────────────────────────────────────────
function nfShellHTML(items,user){
  return '<div class="nfs-brand"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS.QI"><small>NQAS<i>|</i>FAST · by <img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></small></div>'
    +'<nav class="nfs-nav">'+items.map(function(it){ return '<button type="button" data-v="'+it.v+'" class="'+(_nfOv.view===it.v?'on':'')+'" onclick="'+it.onclick+'"><i class="ti '+it.icon+'"></i><span>'+scEsc(it.l)+'</span>'+(it.badge?'<em>'+it.badge+'</em>':'')+'</button>'; }).join('')+'</nav>'
    +'<div class="nfs-user"><span>'+scEsc(String(user.name||'?').charAt(0).toUpperCase())+'</span><div><b>'+scEsc(user.name)+'</b><small>'+scEsc(user.role)+'</small></div><button type="button" title="Log out" onclick="'+user.logout+'"><i class="ti ti-logout"></i></button></div>';
}

// ══════════════════════════════════════════════════════════════
// SUPERVISOR · HEALSOL · DISTRICT (admin-app)
// ══════════════════════════════════════════════════════════════
function nfAdminRole(){ return appMode==='sc-admin'?'admin':scIsDistrict()?'district':appMode==='sc-supervisor'?'supervisor':''; }
function nfAdminTag(){
  var main=document.querySelector('#admin-app .admin-main'); if(!main) return null;
  var tag=function(el,v){ if(el&&!el.dataset.nfv) el.dataset.nfv=v; };
  [].forEach.call(main.children,function(el){
    if(el.dataset.nfv) return; var id=el.id||'';
    if(id==='nf-ov') return tag(el,'overview');
    if(id==='admin-editor-section') return tag(el,'editor');
    if(id==='sc-master-back'||id==='sc-drill-panel') return tag(el,'drill');
    if(id==='sc-master-grid'||id==='leads-box'||id==='demo-facilities-box') return tag(el,'facilities');
    if(id==='scrv-attn') return tag(el,'legacy');
    if(el.classList.contains('sc-report-bar')) return tag(el,'reports');
    if(id==='scd-dist-panel'||id==='scb-reset-panel'||el.classList.contains('hs-only')||el.querySelector('#scq-champ-panel,#sc-sup-list')) return tag(el,'setup');
    if(el.tagName==='BUTTON'&&/logout/i.test(el.getAttribute('onclick')||'')) return tag(el,'legacy');
    return tag(el,'legacy');   // old heading, tiles, package strip
  });
  return main;
}
function nfAdminItems(){
  var r=nfAdminRole(), items=[{v:'overview',l:'Overview',icon:'ti-layout-dashboard',onclick:"nfAdminView('overview')"},{v:'facilities',l:'Facilities',icon:'ti-building-hospital',onclick:"nfAdminView('facilities')"}];
  if(r!=='district'){ var pend=0; try{ scVisibleFacilityCodes().forEach(function(c){ var ctx=scVCtx(c); if(ctx) pend+=scVPending(ctx).length; }); }catch(e){}
    items.push({v:'review',l:'Review & Actions',icon:'ti-shield-check',onclick:'scAdmOpenVerify()',badge:pend||''});
    items.push({v:'peer',l:'Peer reviews',icon:'ti-award',onclick:'scqOpenReviews()'}); }
  items.push({v:'live',l:'Live sessions',icon:'ti-broadcast',onclick:'scOpenLiveSessions()'});
  items.push({v:'reports',l:'Reports',icon:'ti-file-text',onclick:"nfAdminView('reports')"});
  if(r==='admin'){ items.push({v:'editor',l:'Card editor',icon:'ti-pencil',onclick:"nfAdminView('editor')"}); items.push({v:'setup',l:'Setup',icon:'ti-settings',onclick:"nfAdminView('setup')"}); }
  return items;
}
function nfAdminView(v){
  if(v==='editor'){ var ed=document.getElementById('admin-editor-section'); if(ed&&ed.style.display==='none') toggleAdminEditor(); }
  else { var ed2=document.getElementById('admin-editor-section'); if(ed2&&ed2.style.display!=='none'&&_nfOv.view==='editor') toggleAdminEditor(); }
  if(v!=='drill'&&_nfOv.view==='drill'){ try{ scDrillBack(); }catch(e){} }
  if(v!=='drill') _nfOv.prev=v;
  _nfOv.view=v; nfAdminApply();
  try{ window.scrollTo(0,0); }catch(e){}
}
function nfAdminApply(){
  var app=document.getElementById('admin-app'); if(!app) return;
  ['overview','facilities','reports','editor','setup','drill'].forEach(function(v){ document.body.classList.toggle('nfv-'+v,_nfOv.view===v); });
  var side=document.getElementById('nfs-side'); if(side) side.querySelectorAll('.nfs-nav button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-v')===_nfOv.view||(_nfOv.view==='drill'&&b.getAttribute('data-v')===_nfOv.prev)); });
}
function nfRenderOverview(){
  if(document.body.classList.contains('nf-champ')) return nfRenderChampOverview();
  var main=nfAdminTag(); if(!main) return;
  var ov=document.getElementById('nf-ov'); if(!ov){ ov=document.createElement('div'); ov.id='nf-ov'; ov.dataset.nfv='overview'; main.insertBefore(ov,main.firstChild); }
  var r=nfAdminRole(), rows=nfAdminRows(), sum=function(k){ return rows.reduce(function(s,x){ return s+(x[k]||0); },0); };
  var name=r==='admin'?'HealSol Admin':((_scSup||{}).name||'');
  var dist={}; rows.forEach(function(x){ if(x.district) dist[x.district]=1; });
  var sub=rows.length+' facilit'+(rows.length===1?'y':'ies')+(Object.keys(dist).length?' · '+Object.keys(dist).sort().join(', '):'')+(r==='district'?' · view only':'');
  if(r==='district'&&typeof _scSup!=='undefined'&&_scSup&&_scSup.scope==='block') sub=rows.length+' sub-centre'+(rows.length===1?'':'s')+' · '+(_scSup.block||_scSup.chcName||'')+' block · MOIC · view only';
  var kpis=r==='district'
    ?[{l:'Facilities assessed',v:rows.filter(function(x){ return x.agg.coverage&&x.agg.coverage.assessed; }).length,s:'baseline started',c:'var(--teal-dk)'},
      {l:'Below NQAS minimum',v:rows.filter(function(x){ return x.agg.coverage&&x.agg.coverage.assessed&&!x.agg.nqas.meets; }).length,s:'facilities',c:'var(--amber-dk)'},
      {l:'Overdue actions',v:sum('overdue'),s:'across facilities',c:sum('overdue')?'var(--red-dk)':'var(--t3)'}]
    :[{l:'Gaps without an action',v:sum('noAct'),s:'checkpoints, across '+rows.filter(function(x){ return x.noAct; }).length+' facilities',c:sum('noAct')?'var(--red-dk)':'var(--t3)',onclick:"nfAdminView('facilities')"},
      {l:'To confirm',v:sum('confirm'),s:'actions done or fixed',c:sum('confirm')?'var(--amber-dk)':'var(--t3)'},
      {l:'Champion doubts',v:sum('doubts'),s:'re-checks suggested',c:sum('doubts')?'var(--qi)':'var(--t3)'}];
  ov.innerHTML=nfOverviewHTML(rows,{name:name,sub:sub,kpis:kpis,refresh:'scRefreshDashboard()',attention:r==='district'?null:nfAttentionHTML()});
  nfAdminApply();
}
function nfAdminShell(){
  var app=document.getElementById('admin-app'); if(!app||!nfAdminRole()) return;
  document.body.classList.add('nf-admin');
  var side=document.getElementById('nfs-side'); if(!side){ side=document.createElement('aside'); side.id='nfs-side'; side.className='nfs-side'; app.insertBefore(side,app.firstChild); }
  var r=nfAdminRole(), user={name:r==='admin'?'HealSol Admin':((_scSup||{}).name||''),role:r==='admin'?'Administrator':r==='district'?'District Admin · '+((_scSup||{}).facilities||[]).length+' facilities':'Supervisor · '+((_scSup||{}).facilities||[]).length+' facilities',logout:'logoutAdmin()'};
  side.innerHTML=nfShellHTML(nfAdminItems(),user);
  var leg=document.querySelector('#admin-app .admin-main > [data-nfv="legacy"]');
}
(function(){
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments);
    try{ if(nfAdminRole()){ nfAdminShell(); nfRenderOverview(); if(_nfOv.view==='drill'&&document.getElementById('sc-drill-panel').style.display==='none') _nfOv.view=_nfOv.prev; nfAdminApply(); } }catch(e){ console.warn('[SC] laptop dashboard',e); }
    return r; };
  var oIn=scDrillIn;
  scDrillIn=async function(){ if(nfAdminRole()&&_nfOv.view!=='drill'){ _nfOv.prev=_nfOv.view; } var r=await oIn.apply(this,arguments);
    try{ if(nfAdminRole()&&document.getElementById('sc-drill-panel').style.display!=='none'){ _nfOv.view='drill'; nfAdminApply(); window.scrollTo(0,0); } }catch(e){} return r; };
  var oBack=scDrillBack;
  scDrillBack=function(){ var r=oBack.apply(this,arguments); if(nfAdminRole()&&_nfOv.view==='drill'){ _nfOv.view=_nfOv.prev||'overview'; nfAdminApply(); } return r; };
  var oLogout=logoutAdmin;
  logoutAdmin=async function(){ var r=await oLogout.apply(this,arguments);
    if(!document.getElementById('admin-app').classList.contains('vis')){ document.body.classList.remove('nf-admin'); _nfOv.view='overview'; _nfOv.q='';
      ['overview','facilities','reports','editor','setup','drill'].forEach(function(v){ document.body.classList.remove('nfv-'+v); }); var s=document.getElementById('nfs-side'); if(s) s.remove(); }
    return r; };
  // District Admins see actions too (overdue counts), read-only
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){ var r=await oLoad.apply(this,arguments); try{ if(scIsDistrict()) await scRvLoadAll(scVisibleFacilityCodes()); }catch(e){} return r; };
})();

// ══════════════════════════════════════════════════════════════
// QUALITY CHAMPION PORTAL
// ══════════════════════════════════════════════════════════════
function nfChampView(v){ _nfOv.view=v; nfChampApply(); try{ window.scrollTo(0,0); var m=document.querySelector('#scq-app .scq-main'); if(m) m.scrollTop=0; }catch(e){} }
function nfChampApply(){
  ['overview','sessions'].forEach(function(v){ document.body.classList.toggle('nfv-'+v,_nfOv.view===v); });
  var side=document.getElementById('nfs-cside'); if(side) side.querySelectorAll('.nfs-nav button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-v')===_nfOv.view); });
}
function nfRenderChampOverview(){
  var app=document.getElementById('scq-app'), main=app&&app.querySelector('.scq-main'); if(!main) return;
  var ov=document.getElementById('nf-cov'); if(!ov){ ov=document.createElement('div'); ov.id='nf-cov'; ov.dataset.nfv='overview'; main.insertBefore(ov,main.firstChild); }
  var rows=nfChampRows(), list=scqVisibleSessions(), ph=function(p){ return list.filter(function(s){ return scqPhase(s)===p; }); };
  var attention=list.filter(function(s){ return ['live','ended','missed','returned'].indexOf(scqPhase(s))>=0; });
  var pend=rows.reduce(function(s,r){ return s+(r.toVerify||0); },0), me=_scq.me||{};
  var att=main.querySelector('[data-nfsec="attention"]');
  ov.innerHTML=nfOverviewHTML(rows,{name:me.name||me.id||'',sub:rows.length+' allotted facilit'+(rows.length===1?'y':'ies')+(me.homeName||me.homeCode?' · home: '+(me.homeName||me.homeCode):'')+(me.accreditationYear?' · NQAS '+me.accreditationYear:''),champ:true,refresh:'scqChampionReload()',
    kpis:[{l:'Cards to verify',v:pend,s:'CHO & MO cards',c:pend?'var(--amber-dk)':'var(--t3)',onclick:'scqOpenReview()'},
          {l:'Upcoming sessions',v:ph('upcoming').length+ph('proposed').length,s:'proposed or scheduled',c:'var(--teal-dk)',onclick:"nfChampView('sessions')"},
          {l:'Needs your action',v:attention.length,s:'sessions to finish',c:attention.length?'var(--red-dk)':'var(--t3)'}],
    attention:null,extraSide:att?'<div class="nfo-card" id="nfc-att-host"></div>':''});
  if(att){ var host=document.getElementById('nfc-att-host'); if(host) host.appendChild(att); }
  nfChampApply();
}
(function(){
  var oApp=scqRenderChampionApp;
  scqRenderChampionApp=function(){ var r=oApp.apply(this,arguments);
    try{ var app=document.getElementById('scq-app'); if(!app||appMode!=='sc-champion'||!_scq.me) return r;
      document.body.classList.add('nf-champ');
      var main=app.querySelector('.scq-main');
      if(main){ [].forEach.call(main.children,function(el){
          var t=(el.querySelector('.scq-sec-t')||{}).textContent||'';
          if(el.classList.contains('scx-tiles')) el.dataset.nfv='legacy';
          else if(/Needs your action/.test(t)){ el.dataset.nfsec='attention'; }
          else if(/My facilities/.test(t)) el.dataset.nfv='legacy';
          else if(/All sessions/.test(t)) el.dataset.nfv='sessions'; }); }
      var side=document.createElement('aside'); side.id='nfs-cside'; side.className='nfs-side';
      var pend=0; try{ pend=scqReviewCount(); }catch(e){}
      side.innerHTML=nfShellHTML([{v:'overview',l:'Overview',icon:'ti-layout-dashboard',onclick:"nfChampView('overview')"},
        {v:'review',l:'Review cards',icon:'ti-shield-check',onclick:'scqOpenReview()',badge:pend||''},
        {v:'sessions',l:'Peer review sessions',icon:'ti-calendar',onclick:"nfChampView('sessions')"},
        {v:'live',l:'Live sessions',icon:'ti-broadcast',onclick:'scOpenLiveSessions()'}],
        {name:(_scq.me.name||_scq.me.id),role:'Quality Champion',logout:'scqLogout()'});
      app.insertBefore(side,app.firstChild);
      if(['overview','sessions'].indexOf(_nfOv.view)<0) _nfOv.view='overview';
      nfRenderChampOverview();
    }catch(e){ console.warn('[SC] champion dashboard',e); }
    return r; };
  var oOut=scqLogout;
  scqLogout=async function(){ var r=await oOut.apply(this,arguments); if(appMode!=='sc-champion'){ document.body.classList.remove('nf-champ','nfv-overview','nfv-sessions'); _nfOv.view='overview'; _nfOv.q=''; } return r; };
})();
