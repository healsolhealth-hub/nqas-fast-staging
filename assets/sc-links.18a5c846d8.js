
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
// ── HealSol: Setup → PHC & CHC links ───────────────────────────
var _nfUnits={}, _nfLk={facs:{},view:'',area:'',q:'',all:{},stOpen:{}};
async function nfEnsureLinks(){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nfl-setup')) return;
  var c=document.createElement('div'); c.id='nfl-setup'; c.className='nf-ho'; c.dataset.nfv='setup';
  c.innerHTML='<h3><i class="ti ti-building-hospital"></i> PHC &amp; CHC links · MO and MOIC logins</h3><p>Links are now made once, in the facility tree: <b>Facilities → Registry</b>. Pick each PHC&rsquo;s block (CHC or Block PHC) and each Sub-Centre&rsquo;s PHC, and type the CHC&rsquo;s MOIC and the PHC&rsquo;s MO in-charge on their records — their logins, the block view and the MO&rsquo;s Sub-Centres follow by themselves. District Admins can do the same for their district. Who has which login: Settings → People.</p><div id="nfl-body">Loading…</div>';
  main.appendChild(c); await nfLinksLoad(); nfLinksRender();
}
async function nfLinksLoad(){ try{ _nfLk.facs=await fbGet('sc_facilities')||{}; }catch(e){} try{ _nfUnits=await fbGet('sc_units')||{}; }catch(e){} }
// Settings → PHC & CHC links as a to-do list (24 Oct 2026, canvas "Settings · PHC & CHC links and logins"):
//  tiles Waiting · Missing logins · Not linked · Linked, logins done; lists show 3 rows until opened; one search;
//  an area filter (state / district); "Link a Sub-Centre" by name or code; By state (opens to districts) → the Registry.
function nflLow(x){ return String(x==null?'':x).trim().toLowerCase(); }
function nflKind(f){ var L=f.links;
  if(f.linkProposal) return 'wait';
  if(!L) return 'un';
  if((L.phc&&L.phc.nin&&!L.moMobile)||(L.chc&&L.chc.nin&&!L.moicId)) return 'miss';
  return 'done'; }
function nflArea(f){ var a=_nfLk.area||''; if(!a) return true; if(a.indexOf('S:')===0) return nflLow(f.state)===a.slice(2); return nflLow(f.state)+'|'+nflLow(f.district)===a; }
function nflSet(k,v){ _nfLk[k]=v; nfLinksRender(); }
function nflQ(v){ _nfLk.q=v; clearTimeout(window._nflT); window._nflT=setTimeout(function(){ nfLinksRender(); var i=document.getElementById('nfl-q'); if(i){ i.focus(); try{ i.setSelectionRange(i.value.length,i.value.length); }catch(e){} } },250); }
function nflPickLink(){ var v=String((document.getElementById('nfl-pick')||{}).value||'').trim(); if(!v){ showToast('Type a Sub-Centre name or code.','err'); return; }
  var F=_nfLk.facs, m=/·\s*([A-Z0-9-]+)\s*$/.exec(v), code=m&&F[m[1]]?m[1]:(F[v.toUpperCase()]?v.toUpperCase():null);
  if(!code){ var hits=Object.keys(F).filter(function(k){ return F[k]&&nflLow(F[k].name)===nflLow(v); }); if(hits.length===1) code=hits[0]; }
  if(!code){ showToast('No enrolled Sub-Centre matches "'+v+'". Pick one from the list.','err'); return; }
  nfLinkConfirm(code,false); }
function nflOpenRegistry(state,district){ try{ nfAdminView('hsfac'); }catch(e){} if(!state){ setTimeout(function(){ if(typeof rgSet==='function') rgSet('tab','registry'); },60); return; }
  setTimeout(function(){ if(typeof rgOpenState!=='function') return; if(district){ _rg.tab='registry'; _rg.dist=rgDk(state,district); _rg.sel=null; _rg.open={}; rgRender(); } else rgOpenState(state); },60); }
function nfLinksRender(){
  var body=document.getElementById('nfl-body'); if(!body) return;
  var F=_nfLk.facs, U=_nfUnits||{}, codes=Object.keys(F).filter(function(k){ return F[k]&&!F[k].migratedTo&&!(typeof nfTypeOf==='function'&&nfTypeOf(F[k])!=='sc'); });   // links are for Sub-Centres (UPHC / PHC / CHC are not linked here)
  var inArea=codes.filter(function(k){ return nflArea(F[k]); }), q=nflLow(_nfLk.q);
  var match=function(k){ if(!q) return true; var f=F[k], L=f.links||f.linkProposal||{}; return (f.name+' '+k+' '+((L.phc||{}).name||'')+' '+((L.chc||{}).name||'')+' '+((L.chc||{}).block||'')+' '+(f.district||'')).toLowerCase().indexOf(q)>=0; };
  var G={wait:[],miss:[],un:[],done:[]}; inArea.forEach(function(k){ G[nflKind(F[k])].push(k); });
  var byName=function(a,b){ return String(F[a].name||a).localeCompare(String(F[b].name||b)); };
  Object.keys(G).forEach(function(g){ G[g].sort(byName); });
  var view=_nfLk.view||'', open=_nfLk.all||(_nfLk.all={});
  // area filter: states, then their districts
  var SD={}; codes.forEach(function(k){ var f=F[k]; if(!f.state&&!f.district) return; var st=f.state||'No state'; (SD[st]=SD[st]||{})[nflLow(f.state)+'|'+nflLow(f.district)]=f.district||'No district'; });
  var areaSel='<label class="nfl-area">Area<select onchange="nflSet(\'area\',this.value)"><option value="">All states and districts</option>'+Object.keys(SD).sort().map(function(st){ var sk='S:'+nflLow(st);
      return '<optgroup label="'+scEsc(st)+'"><option value="'+scEsc(sk)+'"'+(_nfLk.area===sk?' selected':'')+'>'+scEsc(st)+' · whole state</option>'+Object.keys(SD[st]).sort(function(a,b){ return SD[st][a].localeCompare(SD[st][b]); }).map(function(dk){ return '<option value="'+scEsc(dk)+'"'+(_nfLk.area===dk?' selected':'')+'>'+scEsc(SD[st][dk])+'</option>'; }).join('')+'</optgroup>'; }).join('')+'</select></label>';
  var tile=function(k,label,sub,cls){ return '<button type="button" class="nfl-tile '+(cls||'')+(view===k?' on':'')+'" aria-pressed="'+(view===k)+'" onclick="nflSet(\'view\',_nfLk.view===\''+k+'\'?\'\':\''+k+'\')"><span>'+label+'</span><b>'+G[k].length+'</b><small>'+sub+'</small></button>'; };
  var h='<div class="nfl-top">'+areaSel+'<label class="nfl-qw"><span class="rg-sr">Find</span><input id="nfl-q" type="search" placeholder="Find a Sub-Centre, PHC or CHC" value="'+scEsc(_nfLk.q||'')+'" oninput="nflQ(this.value)"></label>'
    +'</div>'
    +'<div class="nfl-tiles" role="group" aria-label="Show">'+tile('wait','Waiting for you','CHO proposals to confirm')+tile('miss','Missing logins','linked, but no MO or MOIC login',G.miss.length?'warn':'')
    +tile('un','Not linked yet','enrolled Sub-Centres, no PHC / CHC')+tile('done','Linked, logins done','nothing to do','ok')+'</div>';
  var list=function(k,title,rowFn,always){ if(view&&view!==k) return ''; if(!view&&!always) return '';
    var L=G[k].filter(match), all=!!open[k]||!!q||view===k, shown=all?L:L.slice(0,3);
    return '<div class="nfl-sec"><h4 class="scx-sub">'+title+' · '+L.length+'</h4>'+(L.length?'<div class="nfl-list">'+shown.map(rowFn).join('')
      +(L.length>shown.length?'<div class="nfl-more"><button type="button" class="hs-link" onclick="_nfLk.all.'+k+'=true;nfLinksRender()">Show all '+L.length+'</button></div>':'')+'</div>'
      :'<div class="scx-empty" style="padding:8px;">'+(q?'Nothing matches.':k==='wait'?'No proposals waiting.':k==='miss'?'Every linked Sub-Centre has its logins.':k==='un'?'Every enrolled Sub-Centre is linked.':'None yet.')+'</div>')+'</div>'; };
  var where=function(f){ return scEsc([f.district,(f.links&&f.links.chc&&f.links.chc.block)?f.links.chc.block+' block':''].filter(Boolean).join(' · ')); };
  h+=list('wait','Waiting for you',function(k){ var f=F[k], p=f.linkProposal;
    return '<div class="nfl-row"><div><b>'+scEsc(f.name||k)+'</b> <span class="scq-muted">'+scEsc(k)+(f.district?' · '+scEsc(f.district):'')+'</span><small>Proposed by '+scEsc(p.proposedBy||'CHO')+' · '+scEsc(scFmtDate(p.proposedAt))+(f.links?' · changes an existing link':'')+'</small>'+nfLinkSummaryHTML(null,p)+'</div>'
      +'<button class="scx-btn sm" onclick="nfLinkConfirm(\''+scJs(k)+'\',true)"><i class="ti ti-checks"></i> Review &amp; confirm</button></div>'; },true);
  h+=list('miss','Missing logins',function(k){ var f=F[k], L=f.links||{}, miss=[];
    if(L.phc&&L.phc.nin&&!L.moMobile) miss.push('MO'); if(L.chc&&L.chc.nin&&!L.moicId) miss.push('MOIC');
    return '<div class="nfl-row"><div><b>'+scEsc(f.name||k)+'</b> <span class="scq-muted">'+where(f)+'</span><small>'+scEsc([L.phc&&L.phc.name,L.chc&&L.chc.name].filter(Boolean).join(' · '))+'</small><div class="nfl-miss">'+miss.map(function(m){ return '<span>No '+m+' login</span>'; }).join('')+'</div></div>'
      +'<button class="scx-btn sm o" onclick="nfLinkConfirm(\''+scJs(k)+'\',false)">Give logins</button></div>'; },true);
  h+=list('un','Not linked yet',function(k){ var f=F[k];
    return '<div class="nfl-row"><div><b>'+scEsc(f.name||k)+'</b> <span class="scq-muted">'+scEsc(k)+(f.district?' · '+scEsc(f.district):'')+'</span></div><button class="scx-btn sm o" onclick="nfLinkConfirm(\''+scJs(k)+'\',false)">Link</button></div>'; },true);
  h+=list('done','Linked, logins done',function(k){ var f=F[k], L=f.links||{};
    return '<div class="nfl-row"><div><b>'+scEsc(f.name||k)+'</b> <span class="scq-muted">'+where(f)+'</span><small>'+scEsc([L.phc&&L.phc.name,L.chc&&L.chc.name].filter(Boolean).join(' · '))+(L.moName?' · MO '+scEsc(L.moName):'')+(L.moicId?' · MOIC '+scEsc(L.moicId):'')+'</small></div><button class="scx-btn sm o" onclick="nfLinkConfirm(\''+scJs(k)+'\',false)">Change</button></div>'; },false);
  // link any Sub-Centre by name or code
  h+='<div class="nfl-pickw"><label>Link or change any enrolled Sub-Centre<input id="nfl-pick" list="nfl-dl" placeholder="Type a name or code, e.g. Rampur or UP-AGR-SC-0001" autocomplete="off"></label>'
    +'<datalist id="nfl-dl">'+codes.slice().sort(byName).map(function(k){ return '<option value="'+scEsc((F[k].name||k)+' · '+k)+'">'+(F[k].links?'linked':'not linked')+'</option>'; }).join('')+'</datalist>'
    +'<button class="scx-btn" onclick="nflPickLink()"><i class="ti ti-building-hospital"></i> Link a Sub-Centre</button></div>';
  // by state → districts
  var S={}; inArea.forEach(function(k){ var f=F[k], st=f.state||'No state', dn=f.district||'No district', L=f.links||{};
    var a=S[st]=S[st]||{name:st,d:{},chc:{},phc:{},mo:{},moic:{},n:0,ln:0}, d=a.d[dn]=a.d[dn]||{name:dn,chc:{},phc:{},mo:{},moic:{},n:0,ln:0};
    [a,d].forEach(function(x){ x.n++; if(f.links){ x.ln++; if(L.chc&&L.chc.nin){ x.chc[L.chc.nin]=1; if(L.moicId) x.moic[L.chc.nin]=1; } if(L.phc&&L.phc.nin){ x.phc[L.phc.nin]=1; if(L.moMobile||(U[L.phc.nin]&&U[L.phc.nin].mo)) x.mo[L.phc.nin]=1; } } }); });
  var nk=function(o){ return Object.keys(o).length; }, stOpen=_nfLk.stOpen||(_nfLk.stOpen={});
  var cells=function(x){ return '<td>'+nk(x.chc)+'</td><td>'+nk(x.phc)+'</td><td>'+x.ln+' of '+x.n+'</td><td>'+nk(x.mo)+' of '+nk(x.phc)+'</td><td>'+nk(x.moic)+' of '+nk(x.chc)+'</td>'; };
  var sks=Object.keys(S).sort();
  h+='<div class="nfl-sec"><h4 class="scx-sub">By state</h4><div class="nfl-stt"><table><thead><tr><th scope="col">State · district</th><th scope="col">CHCs</th><th scope="col">PHCs</th><th scope="col">Sub-Centres linked</th><th scope="col">MO logins</th><th scope="col">MOIC logins</th><th scope="col"><span class="rg-sr">Open</span></th></tr></thead><tbody>'
    +(sks.length?sks.map(function(st){ var a=S[st], o=!!stOpen[st]||sks.length===1;
      return '<tr class="nfl-st0"><td><button type="button" class="rg-car" aria-expanded="'+o+'" onclick="_nfLk.stOpen[\''+scJs(st)+'\']=!_nfLk.stOpen[\''+scJs(st)+'\'];nfLinksRender()"><span aria-hidden="true">'+(o?'▾':'▸')+'</span><b>'+scEsc(st)+'</b></button> <span class="scq-muted">'+nk(a.d)+' district'+(nk(a.d)===1?'':'s')+'</span></td>'+cells(a)
        +'<td class="r">'+(st!=='No state'?'<button type="button" class="hs-link" onclick="nflOpenRegistry(\''+scJs(st)+'\')">Open the state in Registry</button>':'')+'</td></tr>'
        +(o?Object.keys(a.d).sort().map(function(dn){ var d=a.d[dn]; return '<tr class="nfl-st1"><td>'+scEsc(dn)+'</td>'+cells(d)+'<td class="r">'+(st!=='No state'&&dn!=='No district'?'<button type="button" class="hs-link" onclick="nflOpenRegistry(\''+scJs(st)+'\',\''+scJs(dn)+'\')">Open in Registry</button>':'')+'</td></tr>'; }).join(''):''); }).join('')
      :'<tr><td colspan="7" class="scq-muted">No enrolled Sub-Centres here yet.</td></tr>')
    +'</tbody></table></div><div class="scq-muted nfl-foot">A state opens to its districts. "Open the state in Registry" shows the whole chain: state → district → block → CHC → PHC → SC. UPHCs are not here: they are urban and do not report to a PHC or CHC.</div></div>';
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
  showToast((f.name||code)+' linked.','ok'); if(typeof _rg!=='undefined') _rg.at=0; if(typeof rgRefreshLinks==='function') rgRefreshLinks([code]); await nfLinksLoad(); nfLinksRender(); nfLinkResult(f,r||{},nfLinkNest(v));
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

// 28 Oct 2026: the Settings links list is replaced by the facility tree (Facilities → Registry); this card points there
nfLinksRender=function(){
  var body=document.getElementById('nfl-body'); if(!body) return;
  var F=_nfLk.facs||{}, wait=Object.keys(F).filter(function(c){ return F[c]&&F[c].linkProposal&&!F[c].migratedTo; }).length;
  body.innerHTML='<div class="nfl-ptr"><button type="button" class="hs-btn p" onclick="nflOpenRegistry()">Open Facilities → Registry</button>'
    +(wait?'<span class="nfl-st wait">'+wait+' suggestion'+(wait===1?'':'s')+' from facilities waiting in the Registry</span>':'<span class="one-dim">No suggestions from facilities waiting.</span>')+'</div>';
};
