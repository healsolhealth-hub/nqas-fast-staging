
// ══════════════════════════════════════════════════════════════
// 1. REVIEW & ACTION PLAN — compliance tiles + Full / Partial / Non-compliance tabs
//    Every MoV item: Met → Request re-check · Not met → Assign action (Supervisor). District/HealSol view only.
// ══════════════════════════════════════════════════════════════
function scRvAllCps(st){
  var prog=st.progress||{}, byCp={};
  st.agg.staff.forEach(function(s){ Object.keys(s.res.latest||{}).forEach(function(cpId){
    var L=s.res.latest[cpId], cp=scCpmGet(cpId); if(!cp) return;
    var rec=((prog[s.mob]||{})['day_'+L.di])||{}, n=(cp.items||[]).length, tk=n?scTicksFromStr(((rec.cpTicks||{})['c'+L.ci])||'',n):[];
    var unmet=n?tk.map(function(v,k){ return v===0?k:-1; }).filter(function(k){ return k>=0; }):(L.score<2?[null]:[]);
    if(n&&L.score<2&&!unmet.length&&tk.every(function(v){ return v!==0&&v!==1; })) unmet=[null];
    var g=byCp[cpId]||(byCp[cpId]={cp:cp,owners:[],unmet:{}});
    g.owners.push({mob:s.mob,name:s.name,role:s.role,score:L.score,ticks:tk,di:L.di,ci:L.ci,verified:scCpvValid(rec,L.ci),v:(rec.cpVerify||{})['c'+L.ci]});
    unmet.forEach(function(k){ (g.unmet[k==null?'x':k]=g.unmet[k==null?'x':k]||[]).push(s.mob); });
  }); });
  return Object.keys(byCp).map(function(id){ var g=byCp[id], x=(st.agg.cps||{})[id]; g.score=x?x.score:null; g.verified=g.owners.length&&g.owners.every(function(o){ return o.verified; }); return g; })
    .sort(function(a,b){ return (a.cp.ord||9e4)-(b.cp.ord||9e4); });
}
var SC_RV_TABS=[['non','Non-compliance',0,'var(--red-dk)'],['partial','Partial compliance',1,'var(--amber-dk)'],['full','Full compliance',2,'var(--green-dk)']];
function scRvCpBoxHTML(st,g,can,acts){
  var H=scJs(st.hostId), cp=g.cp;
  var who=g.owners.map(function(o){ return '<span class="s'+o.score+'">'+scEsc(o.role)+' '+scEsc(String(o.name).split(' ')[0])+': '+(o.score===2?'Full':o.score===1?'Partial':'Non')+'</span>'; }).join(' ');
  var ver=g.verified?'<span class="scrv-vb">✓ Verified'+(g.owners[0].v&&g.owners[0].v.by?' by '+scEsc(g.owners[0].v.by):'')+'</span>':'';
  var rows=(cp.items||[]).length?cp.items.map(function(it,k){ return {k:k,t:it.t}; }):[];
  if(!(cp.items||[]).length||g.unmet.x) rows.push({k:null,t:(cp.items||[]).length?'Whole checkpoint (scored without MoV ticks)':'Whole checkpoint (no MoV items)'});
  var body=rows.map(function(row){
    var key=row.k==null?'x':row.k, miss=g.unmet[key]||[], met=g.owners.filter(function(o){ return row.k!=null?o.ticks[row.k]===1:o.score===2; }), right='';
    if(miss.length) right=miss.map(function(m){ var o=g.owners.find(function(x){ return x.mob===m; })||{name:m}, a=scRvFindAct(acts,cp.id,row.k,m)||scRvFindAct(acts,cp.id,row.k,null);
        return '<div class="scrv-own">✗ '+scEsc(o.name)+' '+(a?scRvChip(scRvStatus(a,st.progId,st.progress||{})):(can?'<button class="scx-btn sm" onclick="scRvAssign(\''+H+'\',\''+scJs(cp.id)+'\','+(row.k==null?'null':row.k)+',\''+scJs(m)+'\')"><i class="ti ti-user-plus"></i> Assign action</button>':''))+'</div>'; }).join('');
    if(met.length) right+='<div class="scrv-own ok">✓ Met'+(can?' <button class="scx-btn sm ghost" onclick="scRvRecheck(\''+H+'\',\''+scJs(cp.id)+'\','+(row.k==null?'null':row.k)+',\''+scJs(met[0].mob)+'\')">Request re-check</button>':'')+'</div>';
    return '<div class="scrv-row'+(miss.length?' miss':'')+'"><div class="scrv-row-t">'+(row.k!=null?(row.k+1)+'. ':'')+scEsc(row.t)+'</div><div>'+right+'</div></div>'; }).join('');
  return '<div class="scrv-cpbox"><div class="scrv-cp-h"><b>'+scEsc(cp.id)+'</b> · '+scEsc(cp.me)+' · AoC '+scEsc(cp.aoc)+'<span class="scc-who">'+who+'</span>'+ver+'</div><div class="scrv-cp">'+scEsc(cp.t)+'</div>'+body+'</div>';
}
function scRvComplianceHTML(st){
  var H=scJs(st.hostId), can=scRvCanAssign(st.code), acts=st.actions||{}, all=scRvAllCps(st);
  var f=st.rvc||(st.rvc={tab:'non',show:'need',q:'',limit:40});
  var cnt={0:0,1:0,2:0}; all.forEach(function(g){ if(g.score!=null) cnt[g.score]++; });
  var notA=st.agg.total-cnt[0]-cnt[1]-cnt[2], assessed=cnt[0]+cnt[1]+cnt[2], ver=all.filter(function(g){ return g.verified; }).length;
  var tile=function(v,l,c,click){ return '<div class="scx-tile'+(click?' rvc-click':'')+'"'+(click?' onclick="'+click+'"':'')+'><div class="scx-tile-v" style="color:'+(c||'var(--t1)')+';">'+v+'</div><div class="scx-tile-l">'+l+'</div></div>'; };
  var h='<div class="scx-sub">Compliance <span class="scc-hint">each checkpoint at its current score · lowest when staff differ</span></div><div class="scx-tiles rvc-tiles">'
    +tile(cnt[2],'Full compliance','var(--green-dk)',"_scIns['"+H+"'].rvc.tab='full';scInsRender('"+H+"')")
    +tile(cnt[1],'Partial compliance','var(--amber-dk)',"_scIns['"+H+"'].rvc.tab='partial';scInsRender('"+H+"')")
    +tile(cnt[0],'Non-compliance','var(--red-dk)',"_scIns['"+H+"'].rvc.tab='non';scInsRender('"+H+"')")
    +tile(notA,'Not assessed yet','var(--t3)')+tile(ver+' / '+assessed,'Checkpoints verified','var(--teal-dk)')+'</div>';
  h+='<div class="rvc-tabs">'+SC_RV_TABS.map(function(x){ return '<button type="button" class="'+(f.tab===x[0]?'on':'')+'" style="--c:'+x[3]+'" onclick="_scIns[\''+H+'\'].rvc.tab=\''+x[0]+'\';_scIns[\''+H+'\'].rvc.limit=40;scInsRender(\''+H+'\')">'+x[1]+' <b>'+cnt[x[2]]+'</b></button>'; }).join('')+'</div>';
  var score=SC_RV_TABS.find(function(x){ return x[0]===f.tab; })[2];
  var opts=f.tab==='full'?[['all','All Full checkpoints'],['unver','Not yet verified']]:[['need','Gaps without an action'],['all','All checkpoints']];
  if(!opts.some(function(o){ return o[0]===f.show; })) f.show=opts[0][0];
  h+='<div class="scx-filters"><select onchange="_scIns[\''+H+'\'].rvc.show=this.value;scInsRender(\''+H+'\')">'+opts.map(function(o){ return '<option value="'+o[0]+'"'+(f.show===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select>'
    +'<input type="search" placeholder="Search checkpoint, ME, staff…" value="'+scEsc(f.q)+'" onchange="_scIns[\''+H+'\'].rvc.q=this.value;scInsRender(\''+H+'\')"/></div>';
  var shown=all.filter(function(g){
    if(g.score!==score) return false;
    if(f.show==='need'&&!Object.keys(g.unmet).some(function(k){ return !scRvFindAct(acts,g.cp.id,k==='x'?null:+k,null); })) return false;
    if(f.show==='unver'&&g.verified) return false;
    if(f.q&&(g.cp.id+' '+g.cp.t+' '+g.cp.me+' '+g.owners.map(function(o){ return o.name; }).join(' ')).toLowerCase().indexOf(f.q.toLowerCase())<0) return false;
    return true; });
  if(!shown.length) h+='<div class="scx-empty">'+(cnt[score]?(f.show==='need'?'Every MoV gap here has an action.':f.show==='unver'?'Every Full checkpoint is verified.':'No checkpoint matches.'):'No checkpoints in this group.')+'</div>';
  h+=shown.slice(0,f.limit).map(function(g){ return scRvCpBoxHTML(st,g,can,acts); }).join('');
  if(shown.length>f.limit) h+='<button class="scx-btn ghost" style="width:100%;" onclick="_scIns[\''+H+'\'].rvc.limit+=40;scInsRender(\''+H+'\')">Show more ('+(shown.length-f.limit)+')</button>';
  return h;
}
(function(){
  var oRev=scRvReviewHTML;
  scRvReviewHTML=function(st){
    var h=oRev.apply(this,arguments);
    try{ var i=h.indexOf('<div class="scx-sub">MoV gaps</div>'); if(i>=0) h=h.slice(0,i); h+=scRvComplianceHTML(st); }catch(e){ console.warn('[SC] compliance tabs',e); }
    return h;
  };
})();

// ══════════════════════════════════════════════════════════════
// 2. QUALITY CHAMPION — facility view (view only): KPI strip + Readiness · Baseline report · Action Plan
//    No By Staff, no downloads, no assign / verify-for-others / edit / publish buttons.
// ══════════════════════════════════════════════════════════════
function nfChampKpis(code){
  var me=(_scq.me||{}).id, pr=_scq.prog[code]||{}, pend=0, mine=0, dP=0, dD=0;
  try{ var ctx=scVCtx(code); if(ctx) pend=scVPending(ctx).length; }catch(e){}
  Object.keys(pr).forEach(function(m){ Object.keys(pr[m]||{}).forEach(function(k){ var v=(pr[m][k]||{}).cpVerify||{}; Object.keys(v).forEach(function(c){ if(v[c]&&v[c].byMob===me) mine++; }); }); });
  var acts=_scChampActs[code]||{}; Object.keys(acts).forEach(function(k){ var a=acts[k]; if(!a||a.source!=='champion-doubt'||a.suggestedById!==me) return; if(a.status==='suggested') dP++; else dD++; });
  var ss=scqVisibleSessions().filter(function(s){ return s.code===code; });
  var held=ss.filter(function(s){ return ['ended','submitted','approved','returned'].indexOf(scqPhase(s))>=0; }).length;
  var next=ss.filter(function(s){ return ['proposed','upcoming','live'].indexOf(scqPhase(s))>=0; }).sort(function(a,b){ return String(a.startAt).localeCompare(String(b.startAt)); })[0];
  var k=function(v,l,s,c){ return '<div class="scx-tile"><div class="scx-tile-v" style="color:'+(c||'var(--t1)')+';">'+v+'</div><div class="scx-tile-l">'+l+'</div>'+(s?'<div class="nfck-s">'+s+'</div>':'')+'</div>'; };
  return '<div class="scx-tiles nfck">'+k(pend,'Cards waiting for my verification','',pend?'var(--amber-dk)':'var(--t3)')+k(mine,'Checkpoints I\'ve verified','','var(--teal-dk)')
    +k(dP+dD,'Doubts I\'ve raised',dP+' pending · '+dD+' decided by the Supervisor',dP?'var(--qi)':'var(--t1)')
    +k(held,'Peer review sessions held',next?'Next: '+scEsc(scFmtDateTime(next.startAt)):'No session planned','var(--t1)')+'</div>';
}
var _scChampActs={};
async function nfChampFacility(code){
  if(appMode!=='sc-champion'||!scqChampionCan(code)) return;
  var f=_scq.facs[code]; if(!f) return;
  try{ _scChampActs[code]=await fbGet('sc_corrective/'+code)||{}; }catch(e){ _scChampActs[code]={}; }
  var old=document.getElementById('nfcf-ov'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='nfcf-ov'; ov.className='scx-ov open';
  ov.innerHTML='<div class="scx-box wide nfcf-box"><div class="nfcf-head"><span style="font-size:22px;">🏥</span><div style="flex:1;min-width:0;"><b>'+scEsc(f.name||code)+'</b><div style="font-size:11.5px;color:var(--t3);font-weight:600;">'+scEsc(code)+' · '+scEsc(scPkgShort(f.progId))+' · view only</div></div>'
    +'<button class="scx-btn ghost sm" style="flex:0 0 auto;" onclick="document.getElementById(\'nfcf-ov\').remove()"><i class="ti ti-x"></i></button></div>'
    +nfChampKpis(code)+'<div id="nfcf-ins"></div></div>';
  document.body.appendChild(ov);
  await scMountInsights('nfcf-ins',{code:code,fac:f,staff:f.staff||{},progress:_scq.prog[code]||{}});
}
(function(){
  // champion: Readiness · Baseline report · Action Plan (read only); no By Staff, no downloads, no write buttons
  var oRender=scInsRender;
  scInsRender=function(hostId){
    var st=_scIns[hostId]; var champ=appMode==='sc-champion'&&st;
    if(champ&&st.tab==='staff') st.tab='readiness';
    var r=oRender.apply(this,arguments);
    if(!champ) return r;
    try{ var host=document.getElementById(hostId); if(!host) return r;
      host.querySelectorAll('.scx-tabs .scx-tab').forEach(function(b){ if(/By Staff/.test(b.textContent)) b.remove(); if(/Review & Action Plan|Gap Register/.test(b.textContent)) b.textContent='📋 Action Plan (view)'; });
      if(st.tab==='gaps'){ var tabs=host.querySelector('.scx-tabs'); while(tabs&&tabs.nextSibling) host.removeChild(tabs.nextSibling); var d=document.createElement('div'); d.innerHTML=scRvFacilityPlanHTML(st,{}); host.appendChild(d); }
      host.querySelectorAll('button').forEach(function(b){ var t=b.textContent||'', oc=b.getAttribute('onclick')||'';
        if(/CSV|PDF|Generate draft|Create action plan|Publish|Assign|Verify|Mark done|Ready for re-check|Request re-check|Confirm|Reopen/i.test(t)||/scRvAssign|scRvPublish|scBaselinePlan|scRvConfirm|scRvRecheck|scRvMarkDone|nfBaselinePdf|scBaselineCsv|scInsExport/.test(oc)) b.remove(); });
      host.querySelectorAll('input[type=checkbox]').forEach(function(c){ c.disabled=true; });
    }catch(e){ console.warn('[SC] champion view',e); }
    return r;
  };
})();

// ══════════════════════════════════════════════════════════════
// 3. STAFF PROGRESS — Areas of Concern | Service packages
// ══════════════════════════════════════════════════════════════
var _nfProgView='aoc';
(function(){
  var oD=nfStaffPhaseDecorate;
  nfStaffPhaseDecorate=function(){ oD.apply(this,arguments);
    try{ var page=document.getElementById('nf-progress'), aoc=page&&page.querySelector('.nf-aoc'); if(!aoc) return;
      var sec=aoc.previousElementSibling, hi=_appLang==='hi';
      if(sec&&sec.classList.contains('nf-sec')) sec.innerHTML='<div class="nfpv"><button type="button" class="'+(_nfProgView==='aoc'?'on':'')+'" onclick="_nfProgView=\'aoc\';nfStaffPhaseDecorate()">'+(hi?'चिंता क्षेत्र':'Areas of Concern')+'</button><button type="button" class="'+(_nfProgView==='svc'?'on':'')+'" onclick="_nfProgView=\'svc\';nfStaffPhaseDecorate()">'+(hi?'सेवा पैकेज':'Service packages')+'</button></div>';
      if(_nfProgView!=='svc') return;
      var S=nfStaffPhases(), R=S.R, order=SC_SVC_GROUPS.service;
      var mk=function(k){ return '<div class="nf-aoc3"><div class="nf-aoc3-h"><span title="'+scEsc(k)+'">'+scEsc(k)+'</span>'+nfPhGrowth(S.B.byService&&S.B.byService[k],S.I&&S.I.byService[k],S.E&&S.E.byService[k])+'</div>'+nfBar3HTML(S.B.byService&&S.B.byService[k],S.I&&S.I.byService[k],S.E&&S.E.byService[k])+'</div>'; };
      var own=Object.keys(R.byService||{}).filter(function(k){ return R.byService[k]&&R.byService[k].n; });
      var pk=own.filter(function(k){ return scSvcGroup(k)==='service'; }).sort(function(a,b){ return order.indexOf(a)-order.indexOf(b); }), cc=own.filter(function(k){ return scSvcGroup(k)!=='service'; }).sort();
      aoc.innerHTML=(pk.length?pk.map(mk).join(''):'<div class="nf-empty">'+(hi?'आपके कोई सेवा पैकेज चेकपॉइंट नहीं हैं।':'None of your checkpoints belong to a service package.')+'</div>')
        +(cc.length?'<details class="nfpv-cc"><summary>'+(hi?'क्रॉस-कटिंग क्षेत्र':'Cross-cutting areas')+' ('+cc.length+')</summary>'+cc.map(mk).join('')+'</details>':'');
    }catch(e){ console.warn(e); } };
})();

// ══════════════════════════════════════════════════════════════
// 4. TODAY — "My actions | Cards to verify" tabs (no inner scroll boxes); no 60-day timeline
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{'My actions':'मेरे कार्य','Show all':'सभी देखें','Show less':'कम देखें','No corrective actions — all clear.':'कोई सुधारात्मक कार्य नहीं — सब ठीक है।'});
var _nfTT=null, _nfTTAll={};
function nfTTCounts(){ var a=[],v=[]; try{ a=scMyOpenActions(); }catch(e){} try{ if(scIsVerifier()) v=scPendingVerifications(); }catch(e){} var od=a.filter(function(x){ return x.dueDate&&x.dueDate<scTodayStr(); }).length; return {a:a.length,od:od,v:v.length,ver:scIsVerifier()}; }
function nfTTPlace(){
  var host=document.getElementById('nf-today'), slot=host&&host.querySelector('#nf-tt'); if(!slot) return;
  var c=nfTTCounts(); if(!_nfTT) _nfTT=c.od||!c.v?'a':'v'; if(!c.ver) _nfTT='a';
  var pa=document.getElementById('ws-actions-section'), pv=document.getElementById('ws-verify-section');
  slot.innerHTML='<div class="nftt-tabs">'
    +'<button type="button" class="'+(_nfTT==='a'?'on':'')+'" onclick="_nfTT=\'a\';nfTTPlace()">📌 '+scEsc(t('My actions'))+' <b class="'+(c.od?'r':'')+'">'+c.a+'</b></button>'
    +(c.ver?'<button type="button" class="'+(_nfTT==='v'?'on':'')+'" onclick="_nfTT=\'v\';nfTTPlace()">🛡️ '+scEsc(t('Cards to verify'))+' <b>'+c.v+'</b></button>':'')+'</div>'
    +'<div class="nftt-pane'+(_nfTTAll[_nfTT]?' all':'')+'" id="nftt-pane"></div>';
  var pane=slot.querySelector('#nftt-pane');
  if(_nfTT==='a'){ if(pa){ pane.appendChild(pa); } if(!c.a) pane.insertAdjacentHTML('beforeend','<div class="nftt-empty">'+scEsc(t('No corrective actions — all clear.'))+'</div>'); }
  else if(pv) pane.appendChild(pv);
  var n=_nfTT==='a'?c.a:Math.min(c.v,6);
  if(n>3) pane.insertAdjacentHTML('afterend','<button type="button" class="nftt-more" onclick="_nfTTAll[\''+_nfTT+'\']=!_nfTTAll[\''+_nfTT+'\'];nfTTPlace()">'+scEsc(_nfTTAll[_nfTT]?t('Show less'):t('Show all'))+(_nfTTAll[_nfTT]?'':' ('+n+')')+'</button>');
  // the inactive section waits outside, hidden
  var park=document.getElementById('nftt-park'); if(!park){ park=document.createElement('div'); park.id='nftt-park'; park.style.display='none'; document.getElementById('welcome-screen').appendChild(park); }
  [pa,pv].forEach(function(el){ if(el&&!pane.contains(el)) park.appendChild(el); });
}
(function(){
  var oT=nfRenderToday;
  nfRenderToday=function(){
    // keep the legacy sections safe while Today is redrawn
    var park=document.getElementById('nftt-park')||(function(){ var p=document.createElement('div'); p.id='nftt-park'; p.style.display='none'; var ws=document.getElementById('welcome-screen'); if(ws) ws.appendChild(p); return p; })();
    ['ws-actions-section','ws-verify-section'].forEach(function(id){ var el=document.getElementById(id); if(el&&park) park.appendChild(el); });
    var r=oT.apply(this,arguments);
    try{ var host=document.getElementById('nf-today'); if(host&&!host.querySelector('#nf-tt')&&!wsIsPre()){
        var ms=[].slice.call(host.querySelectorAll('.nf-sec')).find(function(x){ return /Team mission|टीम मिशन/.test(x.textContent); });
        var slot=document.createElement('div'); slot.id='nf-tt'; if(ms) host.insertBefore(slot,ms); else host.appendChild(slot); nfTTPlace(); } }catch(e){ console.warn('[SC] today tabs',e); }
    return r;
  };
  ['scRenderWsActions','scRenderWsVerify'].forEach(function(fn){ var o=window[fn]; if(typeof o!=='function') return;
    window[fn]=function(){ var r=o.apply(this,arguments); try{ if(document.getElementById('nf-tt')) nfTTPlace(); }catch(e){} return r; }; });
})();
