
NF_ROLE_META.mo={icon:'ti-building-hospital',cls:'o'};
Object.assign(HINDI_UI,{'PHC overview':'PHC अवलोकन','All my sub-centres':'मेरे सभी उप-केंद्र','CHO cards to verify':'CHO कार्ड सत्यापन हेतु','Open':'खोलें'});
// ── shared form: PHC (MO) and CHC (block, MOIC) ─────────────────
function nfLinkFields(v,hs){
  v=v||{};
  return [{type:'info',value:'PHC — the Primary Health Centre this Sub-Centre reports to, and its Medical Officer'},
    {key:'phcName',label:'PHC name',value:v.phcName||'',placeholder:'e.g. PHC Rampur'},
    {key:'phcNin',label:'PHC NIN',value:v.phcNin||'',placeholder:'NIN of the PHC'},
    {key:'moName',label:'Medical Officer — name',value:v.moName||'',placeholder:'e.g. Dr Mehta'},
    {key:'moMobile',label:'Medical Officer — mobile',type:'tel',value:v.moMobile||'',placeholder:'10-digit mobile'},
    {type:'info',value:'CHC — the Community Health Centre of the block, and its MOIC'},
    {key:'chcName',label:'CHC name',value:v.chcName||'',placeholder:'e.g. CHC Babina'},
    {key:'chcNin',label:'CHC NIN',value:v.chcNin||'',placeholder:'NIN of the CHC'},
    {key:'block',label:'Block',value:v.block||'',placeholder:'e.g. Babina'},
    {key:'moicName',label:'MOIC — name',value:v.moicName||'',placeholder:'e.g. Dr Verma'},
    {key:'moicMobile',label:'MOIC — mobile',type:'tel',value:v.moicMobile||'',placeholder:'10-digit mobile'}];
}
function nfLinkCheck(v){
  var nin=function(x){ return String(x||'').replace(/[^0-9A-Za-z]/g,''); }, mob=function(x){ return !x||!!nfMobile(x); };
  if(!nin(v.phcNin)&&!nin(v.chcNin)) return 'Enter the PHC or the CHC, with its NIN.';
  if(nin(v.phcNin)&&nin(v.phcNin).length<6) return 'The PHC NIN looks too short.';
  if(nin(v.chcNin)&&nin(v.chcNin).length<6) return 'The CHC NIN looks too short.';
  if(nin(v.phcNin)&&!String(v.phcName||'').trim()&&!(_nfUnits[nin(v.phcNin).toUpperCase()])) return 'Enter the PHC name.';
  if(nin(v.chcNin)&&!String(v.chcName||'').trim()&&!(_nfUnits[nin(v.chcNin).toUpperCase()])) return 'Enter the CHC name.';
  if(!mob(v.moMobile)) return 'Enter the MO\'s 10-digit mobile number.';
  if(!mob(v.moicMobile)) return 'Enter the MOIC\'s 10-digit mobile number.';
  return null;
}
function nfLinkFlat(L){ L=L||{}; var p=L.phc||{}, c=L.chc||{};
  return {phcName:p.name||'',phcNin:p.nin||'',moName:L.moName||p.moName||'',moMobile:L.moMobile||p.moMobile||'',chcName:c.name||'',chcNin:c.nin||'',block:c.block||'',moicName:L.moicName||c.moicName||'',moicMobile:L.moicMobile||c.moicMobile||''}; }
function nfLinkNest(v){ var t=function(x){ return String(x||'').trim(); };
  return {phc:{nin:t(v.phcNin),name:t(v.phcName),moName:t(v.moName),moMobile:nfMobile(v.moMobile)||''},chc:{nin:t(v.chcNin),name:t(v.chcName),block:t(v.block),moicName:t(v.moicName),moicMobile:nfMobile(v.moicMobile)||''}}; }
function nfLinkSummaryHTML(L,prop){
  var x=nfLinkFlat(L||prop), row=function(k,v){ return v?'<span>'+k+'</span><b>'+scEsc(v)+'</b>':''; };
  return '<div class="nfl-kv">'+row('PHC',x.phcName+(x.phcNin?' · NIN '+x.phcNin:''))+row('MO',x.moName+(x.moMobile?' · '+x.moMobile:''))
    +row('CHC',x.chcName+(x.chcNin?' · NIN '+x.chcNin:''))+row('Block',x.block)+row('MOIC',x.moicName+(x.moicMobile?' · '+x.moicMobile:''))+'</div>';
}
// ── CHO: Facility dashboard → More → PHC & CHC ─────────────────
function nfLinkStatus(f){ return f&&f.links?'ok':(f&&f.linkProposal?'wait':'none'); }
async function nfLinkCho(){
  var f=faFac(), code=scSubAdminCode; if(!code) return;
  var st=nfLinkStatus(f);
  var v=await scDialog({title:'PHC & CHC',icon:'🏥',wide:true,okLabel:st==='ok'?'Send changes to HealSol':'Send to HealSol',
    message:(st==='ok'?'Linked. To change it, edit and send — HealSol confirms the change.':st==='wait'?'Sent — waiting for HealSol to confirm. You can still correct it.':'Which PHC and CHC does '+(f.name||code)+' report to? HealSol checks and confirms it. The MO then sees your Sub-Centre, and the block MOIC gets a view-only login.'),
    fields:nfLinkFields(nfLinkFlat(f.linkProposal||f.links)),validate:nfLinkCheck});
  if(!v) return;
  var rec=Object.assign(nfLinkNest(v),{proposedAt:scNowIso(),proposedBy:choState.staffName||scActor().name||'CHO',proposedByMob:choState.staffMobile||null});
  try{ await db.ref(scFacilityPath(code)+'/linkProposal').set(scClean(rec)); }catch(e){ showToast('Could not send — check connection.','err'); return; }
  if(typeof scSubAdminData!=='undefined'&&scSubAdminData) scSubAdminData.linkProposal=rec;
  showToast('Sent to HealSol for confirmation.','ok'); faMore();
}
(function(){
  if(typeof faMore!=='function') return;
  var oM=faMore;
  faMore=function(){ var r=oM.apply(this,arguments);
    try{ var a=document.getElementById('fa-acct'); if(!a) return r; var f=faFac(), st=nfLinkStatus(f), L=f.links||{};
      var sub=st==='ok'?((L.phc&&L.phc.name)||'')+(L.chc?' · '+(L.chc.name||'')+(L.chc.block?' ('+L.chc.block+')':''):''):st==='wait'?'Waiting for HealSol to confirm':'Not linked yet — tap to add';
      a.insertAdjacentHTML('afterbegin','<button type="button" class="nf-row" id="nfl-row" onclick="nfLinkCho()"><i class="ti ti-building-hospital"></i><span>PHC &amp; CHC <span class="nfl-st '+st+'">'+(st==='ok'?'Linked':st==='wait'?'Waiting':'Not set')+'</span><small style="display:block;color:var(--t3);font-size:11.5px;">'+scEsc(sub)+'</small></span><i class="ti ti-chevron-right nf-row-chev"></i></button>');
    }catch(e){ console.warn('[SC] links row',e); }
    return r; };
})();
// ── HealSol: Setup → PHC & CHC links ───────────────────────────
var _nfUnits={}, _nfLk={facs:{}};
async function nfEnsureLinks(){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nfl-setup')) return;
  var c=document.createElement('div'); c.id='nfl-setup'; c.className='nf-ho'; c.dataset.nfv='setup';
  c.innerHTML='<h3><i class="ti ti-building-hospital"></i> PHC &amp; CHC links</h3><p>Each Sub-Centre reports to a PHC (its Medical Officer) and a CHC (block MOIC). Confirming a link adds the MO as staff of the Sub-Centre and gives the block one view-only MOIC login.</p><div id="nfl-body">Loading…</div>';
  main.appendChild(c); await nfLinksLoad(); nfLinksRender();
}
async function nfLinksLoad(){ try{ _nfLk.facs=await fbGet('sc_facilities')||{}; }catch(e){} try{ _nfUnits=await fbGet('sc_units')||{}; }catch(e){} }
function nfLinksRender(){
  var body=document.getElementById('nfl-body'); if(!body) return;
  var F=_nfLk.facs, codes=Object.keys(F).filter(function(k){ return F[k]&&!F[k].migratedTo; });
  var pend=codes.filter(function(k){ return F[k].linkProposal; }), un=codes.filter(function(k){ return !F[k].links&&!F[k].linkProposal; });
  var h='<div class="scx-sub" style="margin-top:4px;">Waiting for you ('+pend.length+')</div>';
  h+=pend.length?pend.map(function(k){ var f=F[k], p=f.linkProposal;
    return '<div class="nfl-row"><div><b>'+scEsc(f.name||k)+'</b> <span class="scq-muted">'+scEsc(k)+'</span><small>Proposed by '+scEsc(p.proposedBy||'CHO')+' · '+scEsc(scFmtDate(p.proposedAt))+(f.links?' · changes an existing link':'')+'</small>'+nfLinkSummaryHTML(null,p)+'</div>'
      +'<button class="scx-btn sm" onclick="nfLinkConfirm(\''+scJs(k)+'\',true)"><i class="ti ti-checks"></i> Review &amp; confirm</button></div>'; }).join(''):'<div class="scx-empty" style="padding:8px;">No proposals waiting.</div>';
  h+='<div class="nfl-btns" style="margin:10px 0;"><select id="nfl-fac" class="scx-in" style="max-width:100%;margin-bottom:6px;">'+codes.sort(function(a,b){ return String(F[a].name||a).localeCompare(String(F[b].name||b)); })
      .map(function(k){ return '<option value="'+scEsc(k)+'">'+scEsc((F[k].name||k)+' · '+k+(F[k].links?' · linked':''))+'</option>'; }).join('')+'</select>'
    +'<button class="scx-btn" onclick="nfLinkConfirm(document.getElementById(\'nfl-fac\').value,false)"><i class="ti ti-building-hospital"></i> Link a facility</button></div>';
  // the network: CHC → PHC → Sub-Centres
  var U=_nfUnits, chcs=Object.keys(U).filter(function(n){ return U[n]&&U[n].type==='CHC'; }), phcs=Object.keys(U).filter(function(n){ return U[n]&&U[n].type==='PHC'; });
  var scs=function(u){ return Object.keys((u&&u.facilities)||{}).map(function(k){ return '<div class="s">• '+scEsc((F[k]||{}).name||k)+' <span class="scq-muted">'+scEsc(k)+'</span></div>'; }).join(''); };
  var ph=function(n){ var u=U[n]; return '<div class="p">'+scEsc(/^phc/i.test(u.name||'')?u.name:'PHC '+(u.name||n))+' <span class="scq-muted">NIN '+scEsc(n)+(u.mo?' · MO '+scEsc(u.mo.name||'')+' '+scEsc(u.mo.mobile||''):'')+'</span></div>'+scs(u); };
  h+='<div class="scx-sub">Linked network</div><div class="nfl-tree">'+(chcs.length||phcs.length?chcs.map(function(n){ var u=U[n];
      return '<div class="c">'+scEsc(/^chc/i.test(u.name||'')?u.name:'CHC '+(u.name||n))+' · '+scEsc(u.block||'')+' block <span class="scq-muted">NIN '+scEsc(n)+' · MOIC login '+scEsc(u.moicId||'—')+(u.moic?' · '+scEsc(u.moic.name||'')+' '+scEsc(u.moic.mobile||''):'')+'</span></div>'
        +phcs.filter(function(p){ return U[p].chcNin===n; }).map(ph).join(''); }).join('')
      +phcs.filter(function(p){ return !U[p].chcNin||!U[U[p].chcNin]; }).map(function(p){ return '<div class="c">No CHC yet</div>'+ph(p); }).join('')
    :'<div class="scx-empty" style="padding:8px;">Nothing linked yet.</div>')+'</div>'
    +(un.length?'<div class="scq-muted" style="margin-top:6px;">'+un.length+' facilit'+(un.length===1?'y is':'ies are')+' not linked yet.</div>':'');
  body.innerHTML=h;
}
async function nfLinkConfirm(code,fromProposal){
  var f=_nfLk.facs[code]; if(!f) return;
  var start=nfLinkFlat(fromProposal&&f.linkProposal?f.linkProposal:f.links);
  var v=await scDialog({title:(f.links?'Change link — ':'Link — ')+(f.name||code),icon:'🏥',wide:true,okLabel:'Confirm link',
    message:'Type a NIN that is already known and the PHC / CHC details fill in. Confirming adds the MO as staff of this Sub-Centre (new login if needed) and adds the Sub-Centre to the block\'s MOIC login.',
    fields:nfLinkFields(start,true),validate:nfLinkCheck,
    onRender:function(I){ var fill=function(ninKey,map){ var el=I[ninKey]&&I[ninKey].el; if(!el) return; el.addEventListener('change',function(){ var u=_nfUnits[String(el.value||'').replace(/[^0-9A-Za-z]/g,'').toUpperCase()]; if(!u) return;
        Object.keys(map).forEach(function(k){ var src=map[k](u); if(I[k]&&!I[k].el.value&&src) I[k].el.value=src; }); }); };
      fill('phcNin',{phcName:function(u){ return u.name; },moName:function(u){ return u.mo&&u.mo.name; },moMobile:function(u){ return u.mo&&u.mo.mobile; }});
      fill('chcNin',{chcName:function(u){ return u.name; },block:function(u){ return u.block; },moicName:function(u){ return u.moic&&u.moic.name; },moicMobile:function(u){ return u.moic&&u.moic.mobile; }}); }});
  if(!v) return;
  var r; try{ r=await nfCall('linkFacility',Object.assign({code:code},nfLinkNest(v))); }catch(e){ showToast(e.message||'Could not link.','err'); return; }
  showToast((f.name||code)+' linked.','ok'); await nfLinksLoad(); nfLinksRender(); nfLinkResult(f,r||{},nfLinkNest(v));
}
function nfLinkResult(f,r,n){
  var lines=[], cred=function(who,id,pw,mob,name){ var msg='NQAS | FAST login for '+(name||who)+'\nLogin ID: '+id+'\nTemporary password: '+pw+'\nYou will choose your own password at first login.';
    return '<div class="nfl-row"><div><b>'+scEsc(who)+'</b><small>Login ID</small><b>'+scEsc(id)+'</b><small>Temporary password (shown once)</small><b class="pw" style="font-family:monospace;font-size:15px;">'+scEsc(pw)+'</b></div>'
      +(nfMobile(mob)?nfWaBtn("nfWaOpen('"+scJs(mob)+"',"+JSON.stringify(msg).replace(/"/g,'&quot;')+")",'Send',''):'')+'</div>'; };
  if(r.mo){ if(r.mo.tempPassword) lines.push(cred('Medical Officer — '+(r.mo.name||''),r.mo.identifier,r.mo.tempPassword,r.mo.identifier,r.mo.name));
    else lines.push('<div class="nfl-row"><div><b>Medical Officer</b><small>'+scEsc(r.mo.note?('Mobile '+r.mo.identifier+' is '+r.mo.note+' — not changed.'):(r.mo.added?'Added as staff; uses their existing login.':'Already staff here.'))+'</small></div></div>'); }
  if(r.moic){ if(r.moic.tempPassword) lines.push(cred('MOIC — '+(r.moic.name||''),r.moic.identifier,r.moic.tempPassword,n.chc.moicMobile,r.moic.name));
    else lines.push('<div class="nfl-row"><div><b>MOIC · block login '+scEsc(r.moic.identifier)+'</b><small>Existing login — '+scEsc(f.name||'')+' added to it.</small></div></div>'); }
  if(!lines.length) return;
  var ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nfl-res';
  ov.innerHTML='<div class="scx-box"><div class="scx-hd"><div class="scx-hd-icon">🔑</div><div class="scx-hd-title">Logins for '+scEsc(f.name||'')+'</div></div>'+lines.join('')
    +'<div class="scx-hint" style="margin:6px 0 10px;">They log in once with the temporary password and choose their own. Nobody can see passwords afterwards.</div><button class="scx-btn" style="width:100%;" onclick="document.getElementById(\'nfl-res\').remove()">Done</button></div>';
  document.body.appendChild(ov);
}
(function(){ if(typeof nfAdminApply==='function'){ var o=nfAdminApply; nfAdminApply=function(){ try{ nfEnsureLinks(); }catch(e){} return o.apply(this,arguments); }; } })();

// ── MO: one PHC overview across their Sub-Centres ──────────────
var _nfMoCodes=[], _nfMo={};
function nfMoAddEntry(list,mob){
  var mo=list.filter(function(a){ return a.kind==='staff'&&/^MO · /.test(a.title||''); });
  _nfMoCodes=mo.map(function(a){ return a.code; });
  if(_nfMoCodes.length<2) return list;
  return [{kind:'mo',key:'mo:'+mob,title:'Medical Officer · PHC overview',sub:_nfMoCodes.length+' sub-centres · verify and support each'}].concat(list);
}
(function(){
  var oGo=nfGo;
  nfGo=async function(acc,pwd){
    if(acc&&acc.kind==='mo'){ var last=''; try{ last=localStorage.getItem('nf_mo_last')||''; }catch(e){}
      var code=_nfMoCodes.indexOf(last)>=0?last:_nfMoCodes[0]; var ok=await oGo({kind:'staff',key:'staff:'+code,code:code},pwd); if(ok) setTimeout(nfMoOpen,300); return ok; }
    return oGo.apply(this,arguments);
  };
})();
async function nfMoLoad(){
  var out=[];
  for(var i=0;i<_nfMoCodes.length;i++){ var code=_nfMoCodes[i];
    try{ var f=await fbGet(scFacilityPath(code))||{}, pr=await fbGet('sc_progress/'+code)||{}, acts={}; try{ acts=await fbGet('sc_corrective/'+code)||{}; }catch(e){}
      out.push({code:code,f:f,pr:pr,acts:acts}); }catch(e){ out.push({code:code,f:{name:code},pr:{},acts:{},err:true}); } }
  return out;
}
function nfMoStats(x,me){
  var f=x.f, staff=f.staff||{}, pr=x.pr, today=scTodayStr(), R=null;
  try{ R=scFacilityReadiness(f.progId||'nqas_12A',pr,staff); }catch(e){}
  var ver=0, blLeft=0, mine=0, d=nfDayOf(f);
  Object.keys(pr).forEach(function(m){ var role=(staff[m]||{}).role||'CHO'; Object.keys(pr[m]||{}).forEach(function(k){ var mm=/^day_(\d+)$/.exec(k); if(!mm) return; var di=+mm[1], r=pr[m][k]||{};
    if(m===me&&r.taskDone) mine++;
    if(role==='CHO'&&m!==me&&r.taskDone&&!r.verified&&di>=SC_BASELINE_DAYS) ver++; }); });
  Object.keys(staff).forEach(function(m){ var s=staff[m]; if(!s||s.disabled) return; for(var di=0;di<SC_BASELINE_DAYS&&d!=null&&di<d;di++){ var r=((pr[m]||{})['day_'+di])||{}; if(!r.taskDone){ blLeft++; break; } } });
  var od=0, open=0; Object.keys(x.acts||{}).forEach(function(k){ var a=x.acts[k]; if(!a||['open','done'].indexOf(a.status)<0) return; open++; if(a.status==='open'&&a.dueDate&&a.dueDate<today) od++; });
  return {pct:R?R.pct:0,day:d,ver:ver,mine:mine,blLeft:blLeft,open:open,od:od,cho:nfChoOf(f)};
}
async function nfMoOpen(){
  if(_nfMoCodes.length<2) return;
  var old=document.getElementById('nf-mo'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='nf-mo';
  var L=(choState.facility&&choState.facility.name)||'';
  ov.innerHTML='<div class="nfmo-hd"><span style="font-size:22px;">🏥</span><div><b>'+scEsc(t('PHC overview'))+'</b><small id="nfmo-sub">'+_nfMoCodes.length+' sub-centres</small></div><button type="button" aria-label="Close" onclick="nfMoClose()">✕</button></div><div class="nfmo-body" id="nfmo-body"><div class="scx-empty">Loading…</div></div>';
  document.body.appendChild(ov);
  _nfMo.list=await nfMoLoad(); nfMoRender();
}
function nfMoClose(){ var o=document.getElementById('nf-mo'); if(o) o.remove(); }
function nfMoRender(){
  var body=document.getElementById('nfmo-body'); if(!body) return;
  var me=choState.staffMobile, rows=(_nfMo.list||[]).map(function(x){ return {x:x,s:nfMoStats(x,me)}; });
  var phc=null; rows.some(function(r){ var L=r.x.f.links; if(L&&L.phc){ phc=L.phc.name; return true; } });
  var sub=document.getElementById('nfmo-sub'); if(sub) sub.textContent=(phc?phc+' · ':'')+rows.length+' sub-centres';
  rows.sort(function(a,b){ return (b.s.ver+b.s.od*2+b.s.blLeft)-(a.s.ver+a.s.od*2+a.s.blLeft)||a.s.pct-b.s.pct; });
  var tot=function(k){ return rows.reduce(function(n,r){ return n+r.s[k]; },0); };
  var h='<div class="nfmo-sum"><div><b>'+tot('ver')+'</b><span>'+scEsc(t('CHO cards to verify'))+'</span></div><div><b style="color:var(--red-dk);">'+tot('od')+'</b><span>Overdue actions</span></div><div><b>'+Math.round(rows.reduce(function(n,r){ return n+r.s.pct; },0)/(rows.length||1))+'%</b><span>Average readiness</span></div></div>'
    +'<div class="scq-muted" style="margin:0 2px 10px;">Sub-centres needing you most are on top. Verify CHO cards and fill your own MO cards in each; corrective actions come from the HealSol mentor.</div>';
  h+=rows.map(function(r){ var x=r.x, s=r.s, f=x.f, cur=x.code===choState.facilityCode, col=s.pct>=70?'var(--green-dk)':s.pct>=50?'var(--amber-dk)':'var(--red-dk)';
    return '<div class="nfmo-sc'+(cur?' cur':'')+'"><div class="nfmo-top"><b>'+scEsc(f.name||x.code)+'</b>'+(cur?'<span class="nfl-st ok">open now</span>':'')+'<span class="pct" style="color:'+col+';">'+s.pct+'%</span></div>'
      +'<div class="nfmo-meta">'+scEsc(x.code)+(s.day!=null?' · Day '+s.day+' of 60':' · not started')+(s.cho.name?' · CHO '+scEsc(s.cho.name):'')+'</div>'
      +'<div class="nfmo-chips">'+(s.ver?'<span class="v">🛡️ '+s.ver+' CHO card'+(s.ver===1?'':'s')+' to verify</span>':'')+(s.od?'<span class="od">⏰ '+s.od+' overdue action'+(s.od===1?'':'s')+'</span>':'')
        +(s.blLeft?'<span class="bl">'+s.blLeft+' staff behind on baseline</span>':'')+'<span>📋 Your MO cards: '+s.mine+' done</span><span>'+s.open+' open action'+(s.open===1?'':'s')+'</span></div>'
      +'<div class="nfmo-btns"><button class="scx-btn sm" onclick="nfMoSwitch(\''+scJs(x.code)+'\')"><i class="ti ti-arrow-right"></i> '+scEsc(cur?t('Back to it'):t('Open'))+'</button>'
        +(nfWaNum(s.cho.mob)?nfWaBtn("nfNudge('mo','"+scJs(x.code)+"')",'CHO',''):'')+'</div></div>'; }).join('');
  body.innerHTML=h;
}
async function nfMoSwitch(code){
  try{ localStorage.setItem('nf_mo_last',code); }catch(e){}
  if(code===choState.facilityCode){ nfMoClose(); return; }
  try{ clearTimeout(_scSyncTimer); await scFlushSync(); }catch(e){}
  nfMoClose();
  if(typeof nfCoverOn==='function') nfCoverOn();
  try{ await nfGo({kind:'staff',key:'staff:'+code,code:code},'__auth__'); } finally { if(typeof nfCoverDone==='function') nfCoverDone(); }
}
// staff Today: the way back to the overview
(function(){
  if(typeof nfRenderToday!=='function') return;
  var oT=nfRenderToday;
  nfRenderToday=function(){ var r=oT.apply(this,arguments);
    try{ var host=document.getElementById('nf-today'); if(host&&_nfMoCodes.length>1&&choState.roleId==='MO'&&!document.getElementById('nfmo-chip')){
      host.insertAdjacentHTML('afterbegin','<button type="button" class="nfmo-chip" id="nfmo-chip" onclick="nfMoOpen()"><i class="ti ti-building-hospital"></i> '+scEsc(t('All my sub-centres'))+' <small>'+_nfMoCodes.length+' · '+scEsc(t('PHC overview'))+' ›</small></button>'); } }catch(e){}
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
  if(kind==='mo'){ var x=(_nfMo.list||[]).find(function(y){ return y.code===code; }); if(!x) return; f=x.f; s=nfMoStats(x,choState.staffMobile); me={name:choState.staffName,role:'Medical Officer'}; }
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
