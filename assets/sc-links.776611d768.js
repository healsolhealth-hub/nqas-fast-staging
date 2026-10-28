
NF_ROLE_META.mo={icon:'ti-building-hospital',cls:'o'};
Object.assign(HINDI_UI,{'PHC overview':'PHC अवलोकन','All my sub-centres':'मेरे सभी उप-केंद्र','CHO cards to verify':'CHO कार्ड सत्यापन हेतु','Open':'खोलें'});
// ── CHO: Facility dashboard → More → PHC & CHC ─────────────────
function nfLinkStatus(f){ return f&&f.links?'ok':(f&&f.linkProposal?'wait':'none'); }
// CHO: "Suggest my PHC / CHC" — picked from the district's list (typed only when missing); the District Admin or HealSol accepts (28 Oct)
async function nfLinkCho(){
  var f=faFac(), code=scSubAdminCode; if(!code) return;
  var st=nfLinkStatus(f), rows=[]; try{ var r=await nfCall('parentChoices',{code:code}); rows=(r&&r.rows)||[]; }catch(e){}
  var cur=f.linkProposal||{}, L=f.links||{}, curP=((cur.phc||L.phc||{}).nin)||'', curC=((cur.chc||L.chc||{}).nin)||'';
  var phcs=rows.filter(function(x){ return x.t==='phc'; }), heads=rows.filter(function(x){ return x.t==='chc'||x.bhead; });
  var opt=function(L2,none){ return [{value:'',label:none}].concat(L2.map(function(x){ return {value:x.nin,label:x.name+(x.block?' · '+x.block+' block':'')+(x.t==='phc'&&x.bhead?' (Block PHC)':'')}; })).concat([{value:'_other',label:'Not in the list — type it below'}]); };
  var v=await scDialog({title:'My PHC & block',icon:'🏥',wide:true,okLabel:'Send',
    message:(st==='ok'?'Linked. To change it, pick again and send — your District Admin or HealSol confirms.':st==='wait'?'Sent — waiting for confirmation. You can still change it.':'Which PHC does '+(f.name||code)+' report to, and which block (CHC)? Your District Admin or HealSol confirms it. The MO then sees your Sub-Centre, and the block MOIC gets a view-only dashboard.'),
    fields:[{key:'phc',label:'PHC',type:'select',value:phcs.some(function(x){ return x.nin===curP; })?curP:'',options:opt(phcs,'— choose the PHC —')},
      {key:'chc',label:'Block (CHC or Block PHC)',type:'select',value:heads.some(function(x){ return x.nin===curC; })?curC:'',options:opt(heads,'— choose the block —')},
      {type:'info',value:'Not in the list? Type the name and NIN (national facility number).'},
      {key:'phcName',label:'PHC name (if not in the list)',value:''},{key:'phcNin',label:'PHC NIN (if not in the list)',value:''},
      {key:'chcName',label:'CHC name (if not in the list)',value:''},{key:'chcNin',label:'CHC NIN (if not in the list)',value:''},{key:'block',label:'Block (if not in the list)',value:''}],
    validate:function(x){ var nn=function(y){ return String(y||'').replace(/[^0-9A-Za-z]/g,''); };
      if(!x.phc&&!x.chc) return 'Choose your PHC or your block.';
      if(x.phc==='_other'&&(!String(x.phcName||'').trim()||nn(x.phcNin).length<6)) return 'Type the PHC name and its NIN (6 or more characters).';
      if(x.chc==='_other'&&(!String(x.chcName||'').trim()||nn(x.chcNin).length<6)) return 'Type the CHC name and its NIN (6 or more characters).';
      return null; }});
  if(!v) return;
  var by=function(n){ return rows.find(function(x){ return x.nin===n; })||{}; }, nn=function(y){ return String(y||'').replace(/[^0-9A-Za-z]/g,'').toUpperCase(); };
  var P=v.phc==='_other'?{nin:nn(v.phcNin),name:String(v.phcName).trim()}:v.phc?{nin:v.phc,name:by(v.phc).name||''}:null;
  var C=v.chc==='_other'?{nin:nn(v.chcNin),name:String(v.chcName).trim(),block:String(v.block||'').trim()}:v.chc?{nin:v.chc,name:by(v.chc).name||'',block:by(v.chc).block||''}:null;
  if(!C&&P&&by(P.nin).chc){ var b=by(by(P.nin).chc); if(b.nin) C={nin:b.nin,name:b.name||'',block:b.block||''}; }
  var rec={phc:P,chc:C,proposedAt:scNowIso(),proposedBy:choState.staffName||scActor().name||'CHO',proposedByMob:choState.staffMobile||null};
  try{ await db.ref(scFacilityPath(code)+'/linkProposal').set(scClean(rec)); }catch(e){ showToast('Could not send — check connection.','err'); return; }
  if(typeof scSubAdminData!=='undefined'&&scSubAdminData) scSubAdminData.linkProposal=rec;
  showToast('Sent — your District Admin or HealSol confirms it.','ok'); faMore();
}
(function(){
  if(typeof faMore!=='function') return;
  var oM=faMore;
  faMore=function(){ var r=oM.apply(this,arguments);
    try{ var a=document.getElementById('fa-acct'); if(!a) return r; var f=faFac(), st=nfLinkStatus(f), L=f.links||{};
      var sub=st==='ok'?((L.phc&&L.phc.name)||'')+(L.chc?' · '+(L.chc.name||'')+(L.chc.block?' ('+L.chc.block+')':''):''):st==='wait'?'Waiting for confirmation':'Not linked yet — tap to add';
      a.insertAdjacentHTML('afterbegin','<button type="button" class="nf-row" id="nfl-row" onclick="nfLinkCho()"><i class="ti ti-building-hospital"></i><span>PHC &amp; CHC <span class="nfl-st '+st+'">'+(st==='ok'?'Linked':st==='wait'?'Waiting':'Not set')+'</span><small style="display:block;color:var(--t3);font-size:11.5px;">'+scEsc(sub)+'</small></span><i class="ti ti-chevron-right nf-row-chev"></i></button>');
    }catch(e){ console.warn('[SC] links row',e); }
    return r; };
})();
// Settings → PHC & CHC links (link form, proposals list, "Link a Sub-Centre", by-state table) retired 28 Oct 2026 —
// links are made once, in Facilities → Registry (the facility tree); the CHO's suggestion is accepted there.

// ── MO: "My facilities" — the PHC (when enrolled) and its linked Sub-Centres, in the one design (B, 22 Oct 2026) ──
var _nfMoCodes=[], _nfMo={}, _nfMoEnt={};
function nfMoAddEntry(list,mob){
  var mo=list.filter(function(a){ return a.kind==='staff'&&(a.type||'sc')==='sc'&&/^MO · /.test(a.title||''); });
  var phc=list.filter(function(a){ return a.kind==='staff'&&a.type==='phc'; });
  _nfMoEnt={}; mo.concat(phc).forEach(function(a){ _nfMoEnt[a.code]=a; });
  _nfMoCodes=phc.map(function(a){ return a.code; }).concat(mo.map(function(a){ return a.code; }));
  if(!mo.length||(mo.length===1&&!phc.length)) return list;   // 28 Oct: one Sub-Centre → straight to Today; "My facilities" chip there (PHC line / join card)
  return [{kind:'mo',key:'mo:'+mob,title:'Medical Officer · My facilities',sub:(phc.length?phc.length+' PHC · ':'')+mo.length+' sub-centre'+(mo.length===1?'':'s')+' · verify and support each'}].concat(list);
}
function nfMoEntry(code){ var e=_nfMoEnt[code]; return e?{kind:'staff',key:e.key,code:code,type:e.type}:{kind:'staff',key:'staff:'+code,code:code}; }
(function(){
  var oGo=nfGo;
  nfGo=async function(acc,pwd){
    if(acc&&acc.kind==='mo'){ var last=''; try{ last=localStorage.getItem('nf_mo_last')||''; }catch(e){}
      var code=_nfMoCodes.indexOf(last)>=0?last:_nfMoCodes[0]; var ok=await oGo(nfMoEntry(code),pwd); if(ok!==false) setTimeout(nfMoOpen,300); return ok; }
    return oGo.apply(this,arguments);
  };
})();
function nfMoMe(){ return (typeof _nfAuth!=='undefined'&&_nfAuth&&_nfAuth.claims&&_nfAuth.claims.mob)||(typeof choState!=='undefined'&&choState.staffMobile)||''; }
function nfMoCur(){ var dv=document.getElementById('nf-dept-app'); if(dv&&dv.offsetParent!==null&&typeof _nd!=='undefined'&&_nd&&_nd.code) return _nd.code; return (typeof choState!=='undefined'&&choState.facilityCode)||''; }
async function nfMoLoadOne(code){
  var f=await fbGet(scFacilityPath(code))||{}, T=nfTypeOf(f);
  if(T!=='sc'){ var cfg=NF_LEVELS[T]||{};
    var r=await Promise.all([nfLoadData(cfg.checklist),typeof nfDeptLive==='function'?nfDeptLive(T).catch(function(){ return null; }):null,fbGet('sc_pcards/'+code).catch(function(){ return {}; }),fbGet('sc_dcards/'+code).catch(function(){ return {}; }),fbGet('sc_dactions/'+code).catch(function(){ return {}; })]);
    var sum=nfDeptSumFacility({code:code,fac:f,cl:r[0],live:r[1],pcards:r[2]||{},dcards:r[3]||{},actions:r[4]||{},today:ndToday()});
    return {code:code,f:f,type:T,sum:sum}; }
  var pr=await fbGet('sc_progress/'+code)||{}, acts={}; try{ acts=typeof nfQueryMany==='function'?await nfQueryMany('sc_corrective/'+code,'status',['open','done']):(await fbGet('sc_corrective/'+code)||{}); }catch(e){}
  return {code:code,f:f,type:'sc',pr:pr,acts:acts};
}
async function nfMoLoad(){
  return Promise.all(_nfMoCodes.map(function(code){ return nfMoLoadOne(code).catch(function(e){ console.warn('[MO] load',code,e); return {code:code,f:{name:code},type:'sc',pr:{},acts:{},err:true}; }); }));
}
function nfMoStats(x,me){
  var f=x.f||{}, today=scTodayStr();
  if(x.type&&x.type!=='sc'){ var s=x.sum||{}, LV=NF_LEVELS[x.type]||{}, R=nfResult(nfResultDept(s,f.graduation||null)), st=null;
    if(s.tl){ var G=typeof nfgCfgFor==='function'?nfgCfgFor(x.type):{green:80,amber:60,missDays:3,blLate:10}; st=s.tl.pct<G.amber||(s.day||0)>G.blLate&&!s.tl.blDone?'r':s.tl.pct<G.green||s.tl.oldMiss>G.missDays?'a':'g'; }
    return {dept:true,pct:s.assessed?s.pct:null,base:s.base,day:s.day,days:s.days||60,phase:s.phase,ver:s.checksDue||0,mine:0,blLeft:0,open:(s.acts||{}).open||0,od:(s.acts||{}).od||0,
      cho:{},res:R,state:st,onTime:s.tl?s.tl.pct:null,nDept:Object.keys(s.byDept||{}).length,inLabel:LV.inChargeLabel||'MO In-charge'}; }
  var staff=f.staff||{}, pr=x.pr||{}, A=null; try{ A=scFacilityReadiness(f.progId||'nqas_12A',pr,staff); }catch(e){}
  var ver=0, blLeft=0, mine=0, d=nfDayOf(f);
  Object.keys(pr).forEach(function(m){ var role=(staff[m]||{}).role||'CHO'; Object.keys(pr[m]||{}).forEach(function(k){ var mm=/^day_(\d+)$/.exec(k); if(!mm) return; var di=+mm[1], r=pr[m][k]||{};
    if(m===me&&r.taskDone) mine++;
    if(role==='CHO'&&m!==me&&r.taskDone&&!r.verified&&di>=SC_BASELINE_DAYS) ver++; }); });
  Object.keys(staff).forEach(function(m){ var s=staff[m]; if(!s||s.disabled) return; for(var di=0;di<SC_BASELINE_DAYS&&d!=null&&di<d;di++){ var r=((pr[m]||{})['day_'+di])||{}; if(!r.taskDone){ blLeft++; break; } } });
  var od=0, open=0; Object.keys(x.acts||{}).forEach(function(k){ var a=x.acts[k]; if(!a||['open','done'].indexOf(a.status)<0) return; open++; if(a.status==='open'&&a.dueDate&&a.dueDate<today) od++; });
  var has=A&&A.coverage&&A.coverage.assessed, B=A&&A.baseline&&A.baseline.assessed?A.baseline.pct:null, comp=null; try{ comp=nfgCompFor(x.code,f,pr,null); }catch(e){}
  var R=A?nfResult(nfResultSc(A,f.graduation||null)):{cls:'grey',txt:'Not assessed yet',word:'—'};
  return {pct:has?A.pct:(A?A.pct:0),hasPct:!!has,base:B,day:d,days:60,ver:ver,mine:mine,blLeft:blLeft,open:open,od:od,cho:nfChoOf(f),res:R,state:comp?comp.state:null,onTime:comp&&comp.pct!=null?comp.pct:null};
}
async function nfMoOpen(){
  if(!_nfMoCodes.length) return;
  var old=document.getElementById('nf-mo'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='nf-mo'; ov.className='nfmo2';
  ov.innerHTML='<div class="nfmo-body" id="nfmo-body"><div class="nfmo-top2"><div><small id="nfmo-k">'+scEsc(t('Medical Officer'))+'</small><h1>'+scEsc(t('My facilities'))+'</h1></div>'
    +'<button type="button" class="nfmo-ic" aria-label="Refresh" onclick="nfMoRefresh()"><i class="ti ti-refresh"></i></button><button type="button" class="nfmo-cards" onclick="nfMoClose()">'+scEsc(t('My cards'))+'</button></div>'
    +'<div id="nfmo-in"><div class="scx-empty">'+scEsc(t('Loading…'))+'</div></div></div>';
  document.body.appendChild(ov);
  _nfMo.list=await nfMoLoad(); nfMoRender();
}
async function nfMoRefresh(){ var b=document.getElementById('nfmo-in'); if(b) b.style.opacity='.5'; _nfMo.list=await nfMoLoad(); nfMoRender(); }
function nfMoClose(){ var o=document.getElementById('nf-mo'); if(o) o.remove(); }
function nfMoTag(r){ var w=r.txt||'', m=/^Too early · (\d+)% checked$/.exec(w); if(m) w=m[1]+'% '+t('of the checklist checked');
  return '<span class="one-tag '+(r.cls||'')+'">'+scEsc(r.word==='—'?r.txt:r.word)+'</span>'+(r.word!=='—'&&r.cls!=='green'&&w&&w!==r.word?'<small>'+scEsc(w)+'</small>':''); }
function nfMoRender(){
  var body=document.getElementById('nfmo-in'); if(!body) return; body.style.opacity='';
  var me=nfMoMe(), cur=nfMoCur(), rows=(_nfMo.list||[]).map(function(x){ return {x:x,s:nfMoStats(x,me)}; });
  var phcRow=rows.find(function(r){ return r.x.type==='phc'; }), phcName=phcRow?(phcRow.x.f.name||phcRow.x.code):'';
  if(!phcName) rows.some(function(r){ var L=r.x.f.links; if(L&&L.phc){ phcName=L.phc.name; return true; } });
  var k=document.getElementById('nfmo-k'); if(k) k.textContent=t('Medical Officer')+(phcName?' · '+phcName:'');
  // 28 Oct: the CHC above them — its name only; their PHC not enrolled → a way to ask to join
  var chcL=null, phcL=null; rows.some(function(r){ var L=r.x.f.links; if(L&&L.chc&&L.chc.name){ chcL=L.chc; phcL=L.phc||null; return true; } if(L&&L.phc&&!phcL) phcL=L.phc; return false; });
  var need=function(r){ return r.s.ver+r.s.od*2+r.s.blLeft+(r.s.state==='r'?3:0); };
  rows.sort(function(a,b){ return (b.x.type==='phc')-(a.x.type==='phc')||need(b)-need(a)||(a.s.pct||0)-(b.s.pct||0); });
  var withPct=rows.filter(function(r){ return r.s.dept?r.s.pct!=null:r.s.hasPct; }), withB=rows.filter(function(r){ return r.s.base!=null; });
  var avg=withPct.length?Math.round(withPct.reduce(function(n,r){ return n+r.s.pct; },0)/withPct.length):null, avgB=withB.length?Math.round(withB.reduce(function(n,r){ return n+r.s.base; },0)/withB.length):null;
  var gain=avg!=null&&avgB!=null?avg-avgB:null, ready=rows.filter(function(r){ return r.s.res&&r.s.res.cls==='green'; }).length, nSc=rows.filter(function(r){ return !r.s.dept; }).length, nPhc=rows.length-nSc;
  var tot=function(k){ return rows.reduce(function(n,r){ return n+(r.s[k]||0); },0); }, mine=tot('mine');
  var h='<div class="nf-hero fa-hero nfmo-hero"><div class="nf-hero-row"><div class="nf-hero-txt"><div class="nf-hero-k">'+scEsc(t('Average readiness'))+'</div><div class="nf-hero-t">'+rows.length+' '+scEsc(t('facilities'))+'</div>'
      +'<div class="nf-hero-s">'+(nPhc?nPhc+' PHC · ':'')+nSc+' '+scEsc(nSc===1?t('sub-centre'):t('sub-centres'))+'</div></div>'
      +'<div class="nf-hero-ring">'+nfRing(avg||0,avgB,88,9,'#fff','rgba(255,255,255,.2)')+'<span><b>'+(avg==null?'—':avg+'%')+'</b><small>'+scEsc(t('readiness'))+'</small></span></div></div>'
    +'<div class="nf-hero-nums"><div><b class="acc">'+(avgB==null?'—':avgB+'%')+'</b><small>'+scEsc(t('Baseline'))+'</small></div><i></i><div><b>'+(gain==null?'—':(gain>=0?'+':'')+gain)+'</b><small>'+scEsc(t('Growth'))+'</small></div><i></i><div><b>'+ready+'<span style="font-size:13px;opacity:.75;">/'+rows.length+'</span></b><small>'+scEsc(t('NQAS Ready'))+'</small></div></div>'
    +'<div class="fa-nq">'+scEsc(t('Your MO cards'))+': <b>'+mine+' '+scEsc(t('done'))+'</b>'+(nSc?' · '+scEsc(t('fill them in each sub-centre')):'')+'</div></div>';
  if(chcL) h='<div class="nfmo-under">'+scEsc(t('Under'))+' <b>'+scEsc(chcL.name)+'</b>'+(chcL.block?' · '+scEsc(chcL.block)+' '+scEsc(t('block')):'')+' · '+scEsc(t('view only'))+'</div>'+h;
  if(!phcRow&&phcL&&phcL.name) h+='<div class="one-card nfmo-join"><div><b>'+scEsc(t('Bring')==='Bring'?'Bring '+phcL.name+' into NQAS FAST':phcL.name+' '+t('into NQAS FAST')+' '+t('Bring'))+'</b><div class="one-dim">'+scEsc(t('Your PHC is not enrolled yet — you support its sub-centres here. Its own cards start once it joins.'))+'</div></div><button type="button" class="nf-l-btn" style="width:auto;padding:10px 16px;" onclick="nfJoinAsk(\'phc\',\''+scJs(phcL.name)+'\',\''+scJs(phcL.nin||'')+'\',\''+scJs((chcL&&chcL.block)||'')+'\')">'+scEsc(t('Request to join'))+'</button></div>';
  h+=oneCounters([[tot('ver'),t('cards to verify'),tot('ver')?'o':''],[tot('od'),t('overdue actions'),tot('od')?'r':''],[tot('blLeft'),t('staff behind on baseline'),'']]);
  h+='<div class="one-sec"><b>'+scEsc(t('Facilities'))+'</b><span>'+scEsc(t('needing you most on top'))+'</span></div><div class="one-card nfmo-list">';
  h+=rows.map(function(r){ var x=r.x, s=r.s, f=x.f, isCur=x.code===cur, pct=s.dept?s.pct:(s.hasPct?s.pct:null), col=pct==null?'#B9C8C3':pct>=70?'#1E6B5E':pct>=50?'#D4912A':'#B3402A';
    var meta=[], nd=[];
    if(s.day==null||s.day<1) meta.push(f.startDate?t('Starts')+' '+nfDateTxt(f.startDate,true):t('Start date not set'));
    else if(f.graduation) meta.push(t('Graduated')+(f.graduation.at?' '+nfDateTxt(String(f.graduation.at).slice(0,10),true):''));
    else meta.push(t('Day')+' '+s.day+' '+t('of')+' '+s.days);
    if(s.dept){ if(s.nDept) meta.push(s.nDept+' '+t('departments')); } else if(s.cho&&s.cho.name) meta.push('CHO '+s.cho.name);
    if(s.onTime!=null&&!f.graduation&&s.day>0) meta.push(s.onTime+'% '+t('on time'));
    if(s.state==='r'&&!f.graduation) nd.push(t('Behind'));
    if(s.ver) nd.push(s.ver+' '+(s.dept?t('department-days to check'):t('CHO cards to verify')));
    if(s.blLeft) nd.push(s.blLeft+' '+t('staff behind on baseline'));
    if(s.od) nd.push(s.od+' '+t('overdue')+' '+(s.od===1?t('action'):t('actions')));
    var hot=s.state==='r'||s.od>0;
    return '<div class="nfmo-r'+(hot?' hot':'')+(isCur?' cur':'')+'"><div class="nfmo-r1"><div><div class="nfmo-nm"><b>'+scEsc(f.name||x.code)+'</b><span class="nfmo-ty">'+scEsc((x.type||'sc').toUpperCase())+'</span>'
        +(x.type==='phc'?'<span class="nfmo-ty o">'+scEsc(t('Your PHC'))+'</span>':'')+(isCur?'<span class="nfmo-ty g">'+scEsc(t('open now'))+'</span>':'')+'</div><small>'+scEsc(meta.join(' · '))+'</small></div><b class="nfmo-p">'+(pct==null?'—':pct+'%')+'</b></div>'
      +'<div class="nfmo-bar"><i style="width:'+(pct||0)+'%;background:'+col+'"></i></div>'
      +'<div class="nfmo-res">'+nfMoTag(s.res||{})+'</div>'
      +(nd.length?'<div class="nfmo-nd'+(hot?' w':'')+'">'+scEsc(nd.join(' · '))+'</div>':'')
      +'<div class="nfmo-btns2"><button type="button" class="'+(nd.length||isCur?'p':'')+'" onclick="nfMoSwitch(\''+scJs(x.code)+'\')">'+scEsc(isCur?t('Back to it'):t('Open'))+'</button>'
        +(!s.dept&&s.cho&&nfWaNum(s.cho.mob)?'<button type="button" onclick="nfNudge(\'mo\',\''+scJs(x.code)+'\')">'+scEsc(t('Message CHO'))+'</button>':'')+'</div></div>'; }).join('');
  h+='</div><p class="one-dim" style="margin:10px 4px 30px;">'+scEsc(t('Verify cards and fill your own MO cards after you open a facility. Corrective actions come from the HealSol mentor.'))+'</p>';
  body.innerHTML=h;
}
async function nfMoSwitch(code){
  try{ localStorage.setItem('nf_mo_last',code); }catch(e){}
  if(code===nfMoCur()){ nfMoClose(); return; }
  try{ clearTimeout(_scSyncTimer); await scFlushSync(); }catch(e){}
  nfMoClose();
  if(typeof nfCoverOn==='function') nfCoverOn();
  try{ await nfGo(nfMoEntry(code),'__auth__'); } finally { if(typeof nfCoverDone==='function') nfCoverDone(); }
}
// department app (the MO at their PHC): the same way back
(function(){ var hook=function(){ ['ndTodayHTML','nxFaHomeHTML'].forEach(function(fn){
  var oT=window[fn]; if(typeof oT!=='function'||oT._mo) return;
  window[fn]=function(){ var h=oT.apply(this,arguments);
    try{ if(_nfMoCodes.length>=1&&_nd&&_nfMoCodes.indexOf(_nd.code)>=0&&h.indexOf('nfmo-chip')<0) h='<button type="button" class="nfmo-chip" id="nfmo-chip" onclick="nfMoOpen()"><i class="ti ti-building-hospital"></i> '+scEsc(t(_nfMoCodes.length>1?'All my facilities':'My facilities'))+' <small>'+_nfMoCodes.length+' ›</small></button>'+h; }catch(e){}
    return h; }; window[fn]._mo=1; }); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hook); else setTimeout(hook,0);
})();
// staff Today: the way back to the overview
(function(){
  if(typeof nfRenderToday!=='function') return;
  var oT=nfRenderToday;
  nfRenderToday=function(){ var r=oT.apply(this,arguments);
    try{ var host=document.getElementById('nf-today'); if(host&&_nfMoCodes.length>=1&&choState.roleId==='MO'&&!document.getElementById('nfmo-chip')){
      host.insertAdjacentHTML('afterbegin','<button type="button" class="nfmo-chip" id="nfmo-chip" onclick="nfMoOpen()"><i class="ti ti-building-hospital"></i> '+scEsc(t(_nfMoCodes.length>1?'All my facilities':'My facilities'))+' <small>'+_nfMoCodes.length+' ›</small></button>'); } }catch(e){}
    return r; };
})();

// ── WhatsApp nudge to a CHO (MO overview, MOIC / District view) ──
function nfNudgeText(kind,f,s,me){
  var cho=s.cho, first=String(cho.name||'').split(' ')[0], nm=f.name||'';
  var lines=['Namaste'+(first?' '+first:'')+' ji,','NQAS | FAST at '+nm+': '+(s.day!=null?'Day '+s.day+' of 60, ':'')+'readiness '+s.pct+'%.'];
  if(s.blLeft) lines.push(s.blLeft+' staff member'+(s.blLeft===1?' has':'s have')+' not finished the 7-day baseline yet.');
  if(s.od) lines.push(s.od+' corrective action'+(s.od===1?' is':'s are')+' overdue — please complete and mark them done.');
  if(kind==='mo'&&s.ver) lines.push('I will verify your '+s.ver+' card'+(s.ver===1?'':'s')+' — please keep them complete.');
  lines.push('Please keep going with today\'s cards. Let me know if you need any help.','— '+(me.name||'')+(me.role?' ('+me.role+')':''));
  return lines.join('\n');
}
async function nfNudge(kind,code){
  var f, s, me;
  if(kind==='mo'){ var x=(_nfMo.list||[]).find(function(y){ return y.code===code; }); if(!x) return; f=x.f; s=nfMoStats(x,nfMoMe()); me={name:(typeof choState!=='undefined'&&choState.staffName)||'',role:'Medical Officer'}; }
  else { f=(scMasterFacilities||{})[code]||{}; s=nfMoStats({f:f,pr:(scMasterProgress||{})[code]||{},acts:{}},''); s.od=0; me=scActor()||{}; }
  if(!nfWaNum(s.cho.mob)){ showToast('No mobile number for this facility\'s CHO.','err'); return; }
  nfWaOpen(s.cho.mob,nfNudgeText(kind,f,s,me));
}

// ── MOIC: the District Admin portal limited to the block ───────
(function(){
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){
    if(scIsDistrict()){ try{ var d=await fbGet('sc_district_admins/'+_scSup.id)||{}; _scSup.scope=d.scope||''; _scSup.block=d.block||''; _scSup.chcName=d.chcName||''; }catch(e){} }
    return oLoad.apply(this,arguments);
  };
  var oChrome=scSetDashboardChrome;
  scSetDashboardChrome=function(){ var r=oChrome.apply(this,arguments);
    if(scIsDistrict()&&_scSup.scope==='block'){ var set=function(id,txt){ var el=document.getElementById(id); if(el) el.textContent=txt; }, n=(_scSup.facilities||[]).length;
      set('sc-nav-title','Block Dashboard'); set('sc-nav-badge-text','MOIC');
      set('sc-master-heading','Block Dashboard — '+(_scSup.block||_scSup.chcName||'')+(_scSup.chcName?' ('+_scSup.chcName+')':''));
      set('sc-master-subheading',n+' sub-centre'+(n===1?'':'s')+' · '+(_scSup.name||'')+' (MOIC) · readiness · reports · view only');
      set('sc-master-total-lbl','Sub-centres in the block'); }
    return r; };
  var oActor=scActor;
  scActor=function(){ if(scIsDistrict()&&_scSup.scope==='block') return {name:_scSup.name||_scSup.id,role:'MOIC',id:_scSup.id}; return oActor.apply(this,arguments); };
  // drill-in: who the Sub-Centre reports to, and a WhatsApp nudge (District Admin / MOIC)
  var oDrill=scDrillIn;
  scDrillIn=async function(code){ var r=await oDrill.apply(this,arguments);
    try{ var info=document.getElementById('sc-drill-info'), f=(scMasterFacilities||{})[code]||{}, L=f.links; if(info&&!info.querySelector('.nfl-drill')){
      var h=(L?'<span>🏥 '+scEsc((L.phc&&L.phc.name)||'—')+(L.chc?' · '+scEsc(L.chc.name||'')+(L.chc.block?' ('+scEsc(L.chc.block)+')':''):'')+(L.moName?' · MO '+scEsc(L.moName):'')+'</span>':'')
        +(scIsDistrict()&&nfWaNum(nfChoOf(f).mob)?nfWaBtn("nfNudge('dist','"+scJs(code)+"')",'Nudge the CHO',''):'');
      if(h) info.insertAdjacentHTML('beforeend','<div class="nfl-drill">'+h+'</div>'); } }catch(e){ console.warn('[SC] drill links',e); }
    return r; };
})();

// ── CHC MOIC: their CHC dashboard ⇄ their block view, one tap, no new sign-in (27 Oct 2026) ──
function nfBlockEntry(){ return ((typeof _nfLogin!=='undefined'&&_nfLogin.matches)||[]).find(function(a){ return a.kind==='district'&&/^Block view/.test(a.title||''); })||null; }
function nfChcEntry(){ return ((typeof _nfLogin!=='undefined'&&_nfLogin.matches)||[]).find(function(a){ return a.kind==='staff'&&a.type==='chc'; })||null; }
async function nfSwitchEntry(key){
  try{ clearTimeout(_scSyncTimer); await scFlushSync(); }catch(e){}
  try{ sessionStorage.setItem('nf_role_switch',key); }catch(e){ return; }
  if(typeof nfCoverOn==='function') nfCoverOn();
  location.reload();
}
function nfBlockChip(){ var b=nfBlockEntry(); if(!b||typeof _nd==='undefined'||!_nd||!_nd.cfg||_nd.cfg.id!=='chc') return '';
  return '<button type="button" class="nfmo-chip" id="nf-blk-chip" onclick="nfSwitchEntry(\''+scJs(b.key)+'\')"><i class="ti ti-map-2"></i> '+scEsc(t('My block'))+' <small>'+scEsc(String(b.title||'').replace(/^Block view · /,''))+' ›</small></button>'; }
function nfChcChip(){ var c=nfChcEntry(); if(!c) return '';
  return '<button type="button" class="nfmo-chip" id="nf-chc-chip" onclick="nfSwitchEntry(\''+scJs(c.key)+'\')"><i class="ti ti-building-hospital"></i> '+scEsc(t('My CHC'))+' <small>'+scEsc(String(c.title||'').replace(/^[^·]*· /,''))+' ›</small></button>'; }
(function(){ var hook=function(){ ['ndTodayHTML','nxFaHomeHTML'].forEach(function(fn){
  var oT=window[fn]; if(typeof oT!=='function'||oT._blk) return;
  window[fn]=function(){ var h=oT.apply(this,arguments); try{ if(h.indexOf('nf-blk-chip')<0){ var c=nfBlockChip(); if(c) h=c+h; } }catch(e){} return h; }; window[fn]._blk=1; }); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hook); else setTimeout(hook,0);
})();


