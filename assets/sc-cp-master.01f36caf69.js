
// ══════════════════════════════════════════════════════════════
// STEP A — CHECKPOINT MASTER
// One record per unique checkpoint (stable ID). Day cards reference these IDs.
//   kind 'nqas'      — NQAS checklist item (has an ME) → counts in readiness
//   kind 'milestone' — programme milestone (no ME)     → never counts in readiness
// Firebase: shared/cp_master = {edits:{id:{field:value}}, added:{id:{…full}}, importedAt, updatedAt, updatedBy}
// Base data (SC_CPM_BASE, SC_CPM_REFS) was generated from the 12A/12B day cards.
// ══════════════════════════════════════════════════════════════
var SC_CPM_FIELDS=['t','hi','me','aoc','svc','r','method','video','pk','kind','retired'];
var SC_CPM_AOC={A:'Service Provision',B:'Patient Rights',C:'Inputs',D:'Support Services',E:'Clinical Services',F:'Infection Control',G:'Quality Management',H:'Outcome'};
var SC_SVC_GROUPS={
  service:['Pregnancy & Child Birth','Neonatal & Infant Care','Childhood & Adolescent Health','Family Planning','Management of Communicable Diseases',
    'Management of Non-Communicable Diseases','Care of Common Ophthalmic and ENT','Oral Health Care','Mental Health','Elderly & Palliative Care','Emergency','Drugs & Diagnostics'],
  support:['Patient Rights','Human Resources','Drugs & Equipment','Infrastructure','BMW & Housekeeping','Sterilisation','Records & MIS','Hand Hygiene','QI System','Patient Safety','Outcomes'],
  programme:['Boss Battle','Consolidation','Mock Assessment','Grand Finale']
};
var SC_SVC_GROUP_LABEL={service:'Service packages',support:'Cross-cutting areas',programme:'Programme days'};
function scSvcGroup(svc){ for(var g in SC_SVC_GROUPS){ if(SC_SVC_GROUPS[g].indexOf(svc)>=0) return g; } return 'support'; }
function scPkgCode(progId){ return ({nqas_12A:'12A',nqas_12B:'12B'})[progId]||progId; }

var _scCpm={edits:{},added:{},loadedAt:0,ver:1,byId:null,byKey:null,dayCache:{},meta:{}};
function scCpmNormT(s){ return String(s||'').replace(/\s+/g,' ').trim(); }
function scCpmNormMe(me){ me=scCpmNormT(me); if(!me) return ''; var m=/^ME\s*([A-H])\s*([0-9.]+)$/i.exec(me); return m?('ME '+m[1].toUpperCase()+m[2]):me; }
function scCpmKey(me,t){ return scCpmNormMe(me).toLowerCase()+'|'+scCpmNormT(t).toLowerCase(); }
function scCpmRoles(r){
  var raw=(Array.isArray(r)?r:(r&&typeof r==='object'?Object.keys(r).map(function(k){ return r[k]; }):[r])).filter(Boolean).map(String);
  var k=raw.filter(function(x){ return SC_KNOWN_ROLES.indexOf(x)>=0; });
  return k.length?k:['General'];
}
function scCpmIndex(){
  if(_scCpm.byId) return;
  var byId={}, byKey={};
  SC_CPM_BASE.forEach(function(b){ byId[b.id]=b; byKey[scCpmKey(b.me,b.t)]=b.id; });
  Object.keys(_scCpm.added||{}).forEach(function(id){ var a=_scCpm.added[id]; if(a){ byId[id]=Object.assign({id:id},a); byKey[scCpmKey(a.me,a.t)]=id; } });
  // current (edited) wording also matches
  Object.keys(_scCpm.edits||{}).forEach(function(id){ var m=scCpmGet(id,byId); if(m) byKey[scCpmKey(m.me,m.t)]=id; });
  _scCpm.byId=byId; _scCpm.byKey=byKey;
}
function scCpmInvalidate(){ _scCpm.byId=null; _scCpm.byKey=null; _scCpm.dayCache={}; _scCpm.ver++; }
function scCpmGet(id,byIdOpt){
  var byId=byIdOpt||(scCpmIndex(),_scCpm.byId); var b=byId[id]; if(!b) return null;
  var e=(_scCpm.edits||{})[id]||{}, o=Object.assign({},b,e,{id:id});
  o.r=scCpmRoles(o.r); o.method=Array.isArray(o.method)?o.method:(o.method?[o.method]:[]); o.pk=Array.isArray(o.pk)?o.pk:[];
  if(o.kind==='nqas'){ o.me=scCpmNormMe(o.me); }
  return o;
}
function scCpmAll(opts){
  opts=opts||{}; scCpmIndex();
  var pk=opts.pkg?scPkgCode(opts.pkg):null;
  return Object.keys(_scCpm.byId).map(function(id){ return scCpmGet(id); }).filter(function(c){
    if(!c) return false;
    if(!opts.includeRetired&&c.retired) return false;
    if(pk&&c.pk.indexOf(pk)<0) return false;
    if(opts.kind&&c.kind!==opts.kind) return false;
    return true;
  }).sort(function(a,b){ return a.id<b.id?-1:a.id>b.id?1:0; });
}
function scCpmMatch(cp){ if(!cp) return null; scCpmIndex(); return cp.id&&_scCpm.byId[cp.id]?cp.id:(_scCpm.byKey[scCpmKey(cp.me,cp.t)]||null); }
// Master values onto a day's checkpoint (day-only extras are kept)
function scCpmApply(cp,id){
  var m=scCpmGet(id); if(!m) return cp;
  return Object.assign({},cp,{id:id,t:m.t,hi:m.hi||cp.hi||'',me:m.me,aoc:m.kind==='nqas'?m.aoc:'',svc:m.svc,r:m.r.slice(),method:m.method.slice(),
    video:m.video||cp.video||'',kind:m.kind,retired:!!m.retired});
}
function scCpmOverlayCps(progId,di,cps,edited){
  var refs=((SC_CPM_REFS[progId]||[])[di])||[];
  return (cps||[]).map(function(cp,ci){
    var id=cp&&cp.id&&_scCpm.byId&&_scCpm.byId[cp.id]?cp.id:(edited?scCpmMatch(cp):(refs[ci]||scCpmMatch(cp)));
    return id?scCpmApply(cp,id):cp;
  });
}
function scCpmOverlayDay(progId,di,day,edited){
  if(!day) return day; scCpmIndex();
  if(!edited){ var ck=progId+'|'+di+'|'+_scCpm.ver, hit=_scCpm.dayCache[ck]; if(hit&&hit.src===day) return hit.out; }
  var out=Object.assign({},day,{cps:scCpmOverlayCps(progId,di,day.cps,edited)});
  if(!edited) _scCpm.dayCache[progId+'|'+di+'|'+_scCpm.ver]={src:day,out:out};
  return out;
}
// Which day cards use each checkpoint — built once per master version
var _scCpmUse={ver:-1,map:{}};
function scCpmUsageMap(){
  var sig=_scCpm.ver+'|'+JSON.stringify(Object.keys(adminEdits||{}).length);
  if(_scCpmUse.ver===sig) return _scCpmUse.map;
  var map={};
  Object.keys(SC_CPM_REFS).forEach(function(pid){
    getDaysArr(pid).forEach(function(_,di){
      var d=scDayDef(pid,di), seen={};
      (d&&d.cps||[]).forEach(function(cp){ if(cp.id&&!seen[cp.id]){ seen[cp.id]=1; (map[cp.id]=map[cp.id]||[]).push({pkg:scPkgCode(pid),day:di+1}); } });
    });
  });
  _scCpmUse={ver:sig,map:map}; return map;
}
function scCpmUsage(id){ return (scCpmUsageMap()[id]||[]).slice(); }
async function scCpmLoad(force){
  if(!force&&_scCpm.loadedAt&&(Date.now()-_scCpm.loadedAt)<60000) return _scCpm;
  try{ var c=JSON.parse(localStorage.getItem('sc_cpm_v1')||'null'); if(c&&!_scCpm.loadedAt){ _scCpm.edits=c.edits||{}; _scCpm.added=c.added||{}; scCpmInvalidate(); } }catch(e){}
  try{
    if(!db){ initFirebase(); await new Promise(function(r){ setTimeout(r,800); }); }
    var remote=await fbGet('shared/cp_master');
    _scCpm.edits=(remote&&remote.edits)||{}; _scCpm.added=(remote&&remote.added)||{};
    _scCpm.meta={importedAt:remote&&remote.importedAt||'',updatedAt:remote&&remote.updatedAt||'',updatedBy:remote&&remote.updatedBy||''};
    _scCpm.loadedAt=Date.now(); scCpmInvalidate();
    try{ localStorage.setItem('sc_cpm_v1',JSON.stringify({edits:_scCpm.edits,added:_scCpm.added})); }catch(e){}
  }catch(e){ console.warn('[SC] checkpoint master load failed',e); }
  return _scCpm;
}
// ── writes (HealSol Admin only) ────────────────────────────────
function scCpmCanEdit(){ return appMode==='sc-admin'; }
function scCpmDiff(id,vals){
  var base=(_scCpm.byId[id]&&!_scCpm.added[id])?SC_CPM_BASE.find(function(b){ return b.id===id; }):null;
  var ref=base||_scCpm.added[id]||{}, d={};
  SC_CPM_FIELDS.forEach(function(f){
    if(vals[f]===undefined) return;
    var a=JSON.stringify(vals[f]==null?'':vals[f]), b=JSON.stringify(ref[f]==null?'':ref[f]);
    if(a!==b) d[f]=vals[f];
  });
  return d;
}
async function scCpmSave(id,vals){
  if(!scCpmCanEdit()) return false;
  scCpmIndex(); if(!_scCpm.byId[id]) return false;
  var cur=scCpmGet(id), merged=Object.assign({},cur,vals);
  merged.r=scCpmRoles(merged.r); merged.me=scCpmNormMe(merged.me); merged.t=scCpmNormT(merged.t);
  var now=scNowIso(), ok;
  if(_scCpm.added[id]){
    var rec=scClean(Object.assign({},_scCpm.added[id],merged)); delete rec.id;
    ok=await fbSet('shared/cp_master/added/'+id,rec); if(ok) _scCpm.added[id]=rec;
  } else {
    var diff=scCpmDiff(id,merged);
    ok=await fbSet('shared/cp_master/edits/'+id,Object.keys(diff).length?scClean(diff):null);
    if(ok){ if(Object.keys(diff).length) _scCpm.edits[id]=diff; else delete _scCpm.edits[id]; }
  }
  if(ok){ await fbSet('shared/cp_master/updatedAt',now); await fbSet('shared/cp_master/updatedBy','HealSol Admin'); scCpmInvalidate();
    try{ localStorage.setItem('sc_cpm_v1',JSON.stringify({edits:_scCpm.edits,added:_scCpm.added})); }catch(e){} }
  return ok;
}
function scCpmNextId(prefix){
  scCpmIndex(); var n=0;
  Object.keys(_scCpm.byId).forEach(function(id){ var m=new RegExp('^'+prefix+'-(\\d+)$').exec(id); if(m) n=Math.max(n,+m[1]); });
  return prefix+'-'+String(n+1).padStart(3,'0');
}
async function scCpmAdd(vals){
  if(!scCpmCanEdit()) return null;
  var me=scCpmNormMe(vals.me), kind=me?'nqas':'milestone', aoc=kind==='nqas'?(me.charAt(3)||String(vals.aoc||'A')):'';
  var id=scCpmNextId(kind==='nqas'?aoc:'M');
  var rec=scClean({t:scCpmNormT(vals.t),hi:vals.hi||'',me:me,aoc:aoc,svc:vals.svc||'',r:scCpmRoles(vals.r),method:vals.method||[],video:vals.video||'',
    pk:vals.pk&&vals.pk.length?vals.pk:['12A','12B'],kind:kind,createdAt:scNowIso()});
  if(!await fbSet('shared/cp_master/added/'+id,rec)) return null;
  _scCpm.added[id]=rec; scCpmInvalidate();
  return id;
}

// ══════════════════════════════════════════════════════════════
// CARD EDITOR — day cards show master values; saving a day writes checkpoint
// changes to the master, so every day that uses the checkpoint updates.
// ══════════════════════════════════════════════════════════════
function scCpmEditorLetterToProg(L){ return ({C:'nqas_12A',D:'nqas_12B'})[L]||'nqas_12A'; }
var SC_CPM_DAY_FIELDS=['t','hi','me','aoc','svc','r','method','video'];
async function scCpmSyncDayToMaster(letter,di){
  var key=letter+'_'+di, ed=adminEdits[key]; if(!ed||!ed.cps) return {changed:0,added:0,other:0};
  var progId=scCpmEditorLetterToProg(letter), pk=scPkgCode(progId), changed=0, added=0, ids={};
  for(var ci=0;ci<ed.cps.length;ci++){
    var cp=ed.cps[ci]; if(!cp) continue;
    var id=scCpmMatch(cp);
    if(!id){
      id=await scCpmAdd({t:cp.t,hi:cp.hi,me:cp.me,aoc:cp.aoc,svc:cp.svc||(getDaysArr(progId)[di]||{}).service||'',r:cp.r,method:cp.method,video:cp.video,pk:[pk]});
      if(id){ cp.id=id; added++; ids[id]=1; }
      continue;
    }
    cp.id=id; ids[id]=1;
    var m=scCpmGet(id), vals={};
    SC_CPM_DAY_FIELDS.forEach(function(f){ if(cp[f]!==undefined) vals[f]=f==='r'?scCpmRoles(cp[f]):cp[f]; });
    var diff=false; SC_CPM_DAY_FIELDS.forEach(function(f){ if(vals[f]!==undefined&&JSON.stringify(vals[f]||'')!==JSON.stringify(m[f]||'')) diff=true; });
    if(diff&&await scCpmSave(id,vals)) changed++;
  }
  var other=0; Object.keys(ids).forEach(function(id){ other+=Math.max(0,scCpmUsage(id).length-1); });
  return {changed:changed,added:added,other:other};
}
// Existing Card Editor edits made before the master existed → fold them into the master once
async function scCpmImportDayEdits(){
  if(!scCpmCanEdit()) return null;
  await scCpmLoad(true);
  var keys=Object.keys(adminEdits||{}).filter(function(k){ return /^[CD]_\d+$/.test(k)&&adminEdits[k]&&adminEdits[k].cps; });
  var res={days:0,changed:0,added:0};
  for(var i=0;i<keys.length;i++){
    var L=keys[i].charAt(0), di=+keys[i].slice(2), progId=scCpmEditorLetterToProg(L), refs=(SC_CPM_REFS[progId]||[])[di]||[];
    var cps=adminEdits[keys[i]].cps; if(!Array.isArray(cps)) cps=adminEdits[keys[i]].cps=Object.keys(cps).sort(function(a,b){return a-b;}).map(function(k){ return cps[k]; });
    var base=(getDaysArr(progId)[di]||{}).cps||[];
    // same position and same ME, edited wording → the same checkpoint
    cps.forEach(function(cp,ci){ if(cp&&!cp.id&&!scCpmMatch(cp)&&refs[ci]&&base[ci]&&scCpmNormMe(cp.me)===scCpmNormMe(base[ci].me)) cp.id=refs[ci]; });
    var r=await scCpmSyncDayToMaster(L,di); res.days++; res.changed+=r.changed; res.added+=r.added;
  }
  await fbSet('shared/admin_edits',adminEdits);
  await fbSet('shared/cp_master/importedAt',scNowIso()); _scCpm.meta.importedAt=scNowIso();
  return res;
}
function scCpmPendingImport(){
  return Object.keys(adminEdits||{}).filter(function(k){ return /^[CD]_\d+$/.test(k)&&adminEdits[k]&&adminEdits[k].cps; }).length>0&&!_scCpm.meta.importedAt;
}

// ══════════════════════════════════════════════════════════════
// CHECKPOINT MASTER PANEL (HealSol Admin, inside the Card Editor)
// ══════════════════════════════════════════════════════════════
var _scCpmUi={tab:'days',pkg:'12B',aoc:'',svc:'',role:'',kind:'nqas',q:'',sel:{},limit:60};
function scCpmEnsurePanel(){
  var sec=document.getElementById('admin-editor-section'); if(!sec) return null;
  if(!document.getElementById('scm-tabs')){
    var hdr=sec.firstElementChild;
    var tabs=document.createElement('div'); tabs.id='scm-tabs'; tabs.className='scm-tabs';
    tabs.innerHTML='<button type="button" data-t="days" onclick="scCpmTab(\'days\')"><i class="ti ti-cards"></i> Day cards</button>'
      +'<button type="button" data-t="master" onclick="scCpmTab(\'master\')"><i class="ti ti-list-details"></i> Checkpoint Master</button>';
    hdr.parentNode.insertBefore(tabs,hdr.nextSibling);
    var p=document.createElement('div'); p.id='scm-panel'; p.style.display='none'; sec.appendChild(p);
  }
  return document.getElementById('scm-panel');
}
function scCpmTab(t){
  _scCpmUi.tab=t; scCpmEnsurePanel();
  var sec=document.getElementById('admin-editor-section');
  [].forEach.call(sec.children,function(ch){ if(ch.id==='scm-tabs'||ch===sec.firstElementChild) return; ch.style.display=(t==='master')===(ch.id==='scm-panel')?'':'none'; });
  if(t==='days'){ var ep=document.getElementById('ae-editor-panel'); if(ep) ep.style.display=(adminEditorDay!=null)?'':'none'; }
  [].forEach.call(document.querySelectorAll('#scm-tabs button'),function(b){ b.classList.toggle('on',b.getAttribute('data-t')===t); });
  if(t==='master') scCpmRender();
}
function scCpmFiltered(){
  var u=_scCpmUi, q=u.q.trim().toLowerCase();
  return scCpmAll({pkg:u.pkg==='all'?null:'nqas_'+u.pkg,includeRetired:u.kind==='retired'}).filter(function(c){
    if(u.kind==='retired'){ if(!c.retired) return false; } else if(u.kind&&c.kind!==u.kind) return false;
    if(u.aoc&&c.aoc!==u.aoc) return false;
    if(u.svc&&c.svc!==u.svc&&!(typeof nfCcOf==='function'&&nfCcOf(c).indexOf(u.svc)>=0)) return false;
    if(u.role&&c.r.indexOf(u.role)<0) return false;
    if(q&&(c.id+' '+c.t+' '+(c.hi||'')+' '+c.me).toLowerCase().indexOf(q)<0) return false;
    return true;
  });
}
function scCpmStats(list){
  var s={total:list.length,aoc:{},role:{},grp:{},method:{}};
  list.forEach(function(c){
    if(c.kind==='nqas') s.aoc[c.aoc]=(s.aoc[c.aoc]||0)+1;
    c.r.forEach(function(r){ s.role[r]=(s.role[r]||0)+1; });
    var g=scSvcGroup(c.svc); s.grp[g]=(s.grp[g]||0)+1;
    c.method.forEach(function(m){ s.method[m]=(s.method[m]||0)+1; });
  });
  return s;
}
function scCpmRender(){
  var p=scCpmEnsurePanel(); if(!p||_scCpmUi.tab!=='master') return;
  var u=_scCpmUi, all=scCpmAll({pkg:u.pkg==='all'?null:'nqas_'+u.pkg});
  var nq=all.filter(function(c){ return c.kind==='nqas'; }), st=scCpmStats(nq), list=scCpmFiltered();
  var svcs={}; all.forEach(function(c){ if(c.svc) svcs[c.svc]=1; });
  var sel=Object.keys(u.sel).filter(function(k){ return u.sel[k]; });
  var opt=function(v,l,cur){ return '<option value="'+scEsc(v)+'"'+(cur===v?' selected':'')+'>'+scEsc(l)+'</option>'; };
  var roleTot=nq.length||1;
  p.innerHTML='<div class="scm-wrap">'
    +(scCpmPendingImport()?'<div class="scm-import"><i class="ti ti-database-import"></i><div style="flex:1;"><b>Card Editor edits found from before the Checkpoint Master.</b><br>Import them once so the master has your latest wording, Hindi text, roles and videos.</div><button class="scx-btn sm" style="flex:0;" onclick="scCpmDoImport()">Import edits</button></div>':'')
    +'<div class="scm-stats">'
    +'<div class="scm-stat"><b>'+nq.length+'</b><span>NQAS checkpoints</span></div>'
    +'<div class="scm-stat"><b>'+(all.length-nq.length)+'</b><span>Programme milestones</span></div>'
    +'<div class="scm-stat wide"><span>By AoC</span><div class="scm-bars">'+Object.keys(SC_CPM_AOC).map(function(a){ return '<em title="'+scEsc(SC_CPM_AOC[a])+'">'+a+' <b>'+(st.aoc[a]||0)+'</b></em>'; }).join('')+'</div></div>'
    +'<div class="scm-stat wide"><span>By role (NQAS) — balance the load</span><div class="scm-bars">'+['CHO','ANM','ASHA','MPW','MO','General'].map(function(r){ var n=st.role[r]||0; return '<em>'+r+' <b>'+n+'</b> <i>'+Math.round(n/roleTot*100)+'%</i></em>'; }).join('')+'</div></div>'
    +'</div>'
    +'<div class="scm-filters">'
    +'<select onchange="_scCpmUi.pkg=this.value;scCpmRender()">'+opt('12B','12B',u.pkg)+opt('12A','12A',u.pkg)+opt('all','Both packages',u.pkg)+'</select>'
    +'<select onchange="_scCpmUi.kind=this.value;scCpmRender()">'+opt('nqas','NQAS checkpoints',u.kind)+opt('milestone','Programme milestones',u.kind)+opt('','All items',u.kind)+opt('retired','Retired',u.kind)+'</select>'
    +'<select onchange="_scCpmUi.aoc=this.value;scCpmRender()">'+opt('','All AoCs',u.aoc)+Object.keys(SC_CPM_AOC).map(function(a){ return opt(a,'AoC '+a+' · '+SC_CPM_AOC[a],u.aoc); }).join('')+'</select>'
    +'<select onchange="_scCpmUi.svc=this.value;scCpmRender()">'+opt('','All services / areas',u.svc)+['service','support','programme'].map(function(g){
        var names=Object.keys(svcs).filter(function(s){ return scSvcGroup(s)===g; }).sort(); if(!names.length) return '';
        return '<optgroup label="'+scEsc(SC_SVC_GROUP_LABEL[g])+'">'+names.map(function(s){ return opt(s,s,u.svc); }).join('')+'</optgroup>'; }).join('')+'</select>'
    +'<select onchange="_scCpmUi.role=this.value;scCpmRender()">'+opt('','All roles',u.role)+SC_KNOWN_ROLES.map(function(r){ return opt(r,r,u.role); }).join('')+'</select>'
    +'<input class="scx-in" placeholder="Search ID, text or ME" value="'+scEsc(u.q)+'" oninput="_scCpmUi.q=this.value;clearTimeout(window._scmT);window._scmT=setTimeout(scCpmRender,250)">'
    +'</div>'
    +'<div class="scm-bar"><span><b>'+list.length+'</b> shown'+(sel.length?' · <b>'+sel.length+'</b> selected':'')+'</span>'
    +'<span style="display:flex;gap:6px;flex-wrap:wrap;">'+(sel.length?'<button class="scx-btn sm" onclick="scCpmBulkRoles()"><i class="ti ti-users"></i> Set roles</button><button class="scx-btn sm ghost" onclick="_scCpmUi.sel={};scCpmRender()">Clear</button>':'')
    +'<button class="scx-btn sm ghost" onclick="scCpmSelectShown()">Select shown</button><button class="scx-btn sm ghost" onclick="scCpmExport()"><i class="ti ti-download"></i> CSV</button>'
    +'<button class="scx-btn sm" onclick="scCpmEdit(null)"><i class="ti ti-plus"></i> New checkpoint</button></span></div>'
    +'<div class="scm-list">'+list.slice(0,u.limit).map(scCpmRowHTML).join('')
    +(list.length>u.limit?'<button class="scx-btn ghost" style="width:100%;margin-top:8px;" onclick="_scCpmUi.limit+=100;scCpmRender()">Show more ('+(list.length-u.limit)+' more)</button>':'')
    +(list.length?'':'<div class="scx-empty">No checkpoints match these filters.</div>')+'</div></div>';
}
function scCpmRowHTML(c){
  var I=scJs(c.id), edited=!!_scCpm.edits[c.id], added=!!_scCpm.added[c.id];
  return '<div class="scm-row'+(c.retired?' retired':'')+'"><input type="checkbox" '+(_scCpmUi.sel[c.id]?'checked':'')+' onchange="_scCpmUi.sel[\''+I+'\']=this.checked;scCpmRender()">'
    +'<div class="scm-id">'+scEsc(c.id)+(edited?'<i title="Edited">✎</i>':'')+(added?'<i title="Added">＋</i>':'')+'</div>'
    +'<div class="scm-main"><div class="scm-t">'+scEsc(c.t)+'</div>'+(c.hi?'<div class="scm-hi">'+scEsc(c.hi)+'</div>':'')
    +'<div class="scm-meta">'+(c.kind==='nqas'?'<span class="a">'+scEsc(c.me)+' · AoC '+scEsc(c.aoc)+'</span>':'<span class="m">Milestone</span>')
    +'<span>'+scEsc(c.svc||'—')+'</span>'+c.r.map(function(r){ return '<span class="r">'+scEsc(r)+'</span>'; }).join('')
    +c.method.map(function(m){ return '<span>'+scEsc(m)+'</span>'; }).join('')+(c.video?'<span><i class="ti ti-video"></i></span>':'')
    +'<span class="pk">'+c.pk.join(' · ')+'</span>'+(c.retired?'<span class="m">Retired</span>':'')+'</div></div>'
    +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCpmEdit(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button></div>';
}
function scCpmSelectShown(){ scCpmFiltered().slice(0,_scCpmUi.limit).forEach(function(c){ _scCpmUi.sel[c.id]=true; }); scCpmRender(); }
function scCpmServices(){ var s={}; scCpmAll({includeRetired:true}).forEach(function(c){ if(c.svc) s[c.svc]=1; }); Object.keys(SC_SVC_GROUPS).forEach(function(g){ SC_SVC_GROUPS[g].forEach(function(n){ s[n]=1; }); }); return Object.keys(s).sort(); }
async function scCpmEdit(id){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit the Checkpoint Master.','err'); return; }
  var c=id?scCpmGet(id):null;
  var used=id?scCpmUsage(id):[];
  var v=await scDialog({title:c?'Edit checkpoint '+id:'New checkpoint',icon:'📋',wide:true,okLabel:c?'Save — applies to every day':'Add to master',
    message:c?('Used on '+(used.length?used.map(function(u){ return u.pkg+' Day '+u.day; }).join(', '):'no day yet')+'. Changes apply everywhere it is used.'):'New checkpoints are added to the master. Step E places them on implementation days; you can also add one to a day card now.',
    fields:[
      {key:'t',label:'Checkpoint (English)',type:'textarea',required:true,value:c?c.t:''},
      {key:'hi',label:'Checkpoint (Hindi)',type:'textarea',value:c?c.hi||'':''},
      {key:'me',label:'Measurable Element (blank = programme milestone)',value:c?c.me:'',placeholder:'e.g. ME A1.1'},
      {key:'svc',label:'Service / area',type:'select',value:c?c.svc:'',options:[{value:'',label:'—'}].concat(scCpmServices().map(function(s){ return {value:s,label:s+' · '+SC_SVC_GROUP_LABEL[scSvcGroup(s)]}; }))},
      {key:'r',label:'Who scores it',type:'checklist',value:c?c.r:['CHO'],options:SC_KNOWN_ROLES.map(function(r){ return {value:r,label:r==='General'?'General (CHO, ANM, ASHA, MPW)':r}; })},
      {key:'method',label:'Assessment methods',type:'checklist',value:c?c.method:['SI','RR'],options:[{value:'SI',label:'SI — Staff Interview'},{value:'RR',label:'RR — Record Review'},{value:'OB',label:'OB — Observation'},{value:'CI',label:'CI — Client Interview'}]},
      {key:'video',label:'Video link (optional)',value:c?c.video||'':'',placeholder:'https://…'},
      {key:'pk',label:'Packages',type:'checklist',value:c?c.pk:['12A','12B'],options:[{value:'12A',label:'12A'},{value:'12B',label:'12B'}]},
      {key:'retired',label:'Status',type:'checklist',value:c&&c.retired?['retired']:[],options:[{value:'retired',label:'Retired — no longer used in readiness or new day plans'}]}
    ],
    validate:function(v){
      var me=scCpmNormMe(v.me);
      if(me&&!/^ME [A-H][0-9.]+$/.test(me)) return 'Write the ME like "ME A1.1" (letter A–H and number), or leave it blank for a milestone.';
      if(!v.r.length) return 'Choose at least one role.';
      if(!v.pk.length) return 'Choose at least one package.';
      if(v.video&&!scIsHttpUrl(v.video)) return 'Video link must start with https://';
      return null;
    }});
  if(!v) return;
  var me=scCpmNormMe(v.me), vals={t:v.t,hi:(v.hi||'').trim(),me:me,aoc:me?me.charAt(3):'',kind:me?'nqas':'milestone',svc:v.svc,r:v.r,method:v.method,video:(v.video||'').trim(),pk:v.pk,retired:v.retired.indexOf('retired')>=0};
  var ok=c?await scCpmSave(id,vals):!!(await scCpmAdd(vals));
  showToast(ok?(c?'Saved — '+id+' updated on '+(used.length||0)+' day card'+(used.length===1?'':'s')+'.':'Checkpoint added to the master.'):'Could not save — check connection.',ok?'ok':'err');
  scCpmRender(); if(adminEditorDay!=null) aeRenderCPs(adminEditorDay);
}
async function scCpmBulkRoles(){
  var ids=Object.keys(_scCpmUi.sel).filter(function(k){ return _scCpmUi.sel[k]; }); if(!ids.length) return;
  var v=await scDialog({title:'Set roles for '+ids.length+' checkpoint'+(ids.length===1?'':'s'),icon:'👥',okLabel:'Apply',
    fields:[{key:'r',label:'Who scores these',type:'checklist',value:['CHO'],options:SC_KNOWN_ROLES.map(function(r){ return {value:r,label:r}; })}],
    validate:function(v){ return v.r.length?null:'Choose at least one role.'; }});
  if(!v) return;
  var n=0; for(var i=0;i<ids.length;i++){ if(await scCpmSave(ids[i],{r:v.r})) n++; }
  _scCpmUi.sel={}; showToast('Roles updated on '+n+' checkpoint'+(n===1?'':'s')+'.','ok'); scCpmRender();
}
function scCpmCsv(){
  var rows=[['ID','Kind','Packages','AoC','ME','Service','Group','Roles','Methods','Checkpoint','Hindi','Video','Retired','Used on']];
  scCpmAll({includeRetired:true}).forEach(function(c){
    rows.push([c.id,c.kind,c.pk.join(' '),c.aoc,c.me,c.svc,SC_SVC_GROUP_LABEL[scSvcGroup(c.svc)],c.r.join(' '),c.method.join(' '),c.t,c.hi||'',c.video||'',c.retired?'yes':'',
      scCpmUsage(c.id).map(function(u){ return u.pkg+' D'+u.day; }).join(' ')]);
  });
  return rows.map(function(r){ return r.map(function(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(','); }).join('\n');
}
function scCpmExport(){
  var csv=scCpmCsv();
  try{ var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'})); a.download='checkpoint-master.csv'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){}
  return csv;
}
async function scCpmDoImport(){
  var ok=await showConfirm('Import existing Card Editor edits into the Checkpoint Master? Edited wording, Hindi text, roles, methods and videos become the master values and apply to every day that uses each checkpoint.','📥','Import edits','Import','var(--teal)');
  if(!ok) return;
  var r=await scCpmImportDayEdits();
  if(!r){ showToast('Import failed.','err'); return; }
  showToast('Imported from '+r.days+' edited day'+(r.days===1?'':'s')+': '+r.changed+' checkpoint'+(r.changed===1?'':'s')+' updated, '+r.added+' added.','ok');
  scCpmRender();
}

// ══════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════
(function(){
  // Programme milestones never count towards an Area of Concern
  var oAoc=scAocKey;
  scAocKey=function(cp,day){ if(cp&&cp.kind==='milestone') return '?'; return oAoc.apply(this,arguments); };
  // Day resolvers: every day card shows master values and carries checkpoint IDs
  var oDef=scDayDef;
  scDayDef=function(progId,di){
    var d=oDef.apply(this,arguments); if(!d) return d;
    var edited=!!((typeof adminEdits!=='undefined'&&adminEdits)||{})[(_SC_AE_LETTER[progId]||'C')+'_'+di];
    return scCpmOverlayDay(progId,di,d,edited);
  };
  var oGet=getDay;
  getDay=function(di){
    var d=oGet.apply(this,arguments); if(!d) return d;
    var arr=getDaysArr(choState.progId); if(!arr[di]) return d;
    var edited=!!(adminEdits||{})[(_SC_PROGID_TO_AELETTER[choState.progId]||'C')+'_'+di];
    return scCpmOverlayDay(choState.progId,di,d,edited);
  };
  // Card Editor: show master values, write changes through to the master
  var oArr=aeGetActiveArray;
  aeGetActiveArray=function(){
    var arr=oArr.apply(this,arguments)||[], progId=scCpmEditorLetterToProg(adminActiveProg||'C');
    return arr.map(function(d,di){ return scCpmOverlayDay(progId,di,d,false); });
  };
  function edCps(di){ var ed=adminEdits[(adminActiveProg||'C')+'_'+di]; if(!ed||!ed.cps) return null;
    if(!Array.isArray(ed.cps)) ed.cps=Object.keys(ed.cps).sort(function(a,b){return a-b;}).map(function(k){ return ed.cps[k]; });
    return ed; }
  // Opening a day: refresh its saved copy with current master values
  var oOpen=aeOpenDay;
  aeOpenDay=function(di){
    try{ var ed=edCps(di); if(ed) ed.cps=scCpmOverlayCps(scCpmEditorLetterToProg(adminActiveProg||'C'),di,ed.cps,true); }catch(e){ console.warn(e); }
    return oOpen.apply(this,arguments);
  };
  // Re-rendering (after add/delete): keep unsaved typing, only attach IDs
  var oRender=aeRenderCPs;
  aeRenderCPs=function(di){
    try{ var diU=(di!==undefined&&di!==null)?di:adminEditorDay, ed=edCps(diU);
      if(ed) ed.cps.forEach(function(cp){ if(cp&&!cp.id){ var id=scCpmMatch(cp); if(id) cp.id=id; } }); }catch(e){ console.warn(e); }
    return oRender.apply(this,arguments);
  };
  var oSave=aeSaveDay;
  aeSaveDay=async function(){
    var di=adminEditorDay, L=adminActiveProg||'C', r=null;
    if(di!==null&&di!==undefined&&adminEdits[L+'_'+di]){ try{ r=await scCpmSyncDayToMaster(L,di); }catch(e){ console.warn(e); } }
    var out=await oSave.apply(this,arguments);
    if(r&&(r.changed||r.added)) showToast('Checkpoint Master: '+r.changed+' updated'+(r.added?', '+r.added+' added':'')+(r.other?' — also applied to '+r.other+' other day card'+(r.other===1?'':'s'):'')+'.','ok');
    return out;
  };
  var oToggle=toggleAdminEditor;
  toggleAdminEditor=function(){ var r=oToggle.apply(this,arguments); try{ scCpmEnsurePanel(); scCpmTab(_scCpmUi.tab||'days'); }catch(e){} return r; };
  // Load the master wherever Card Editor edits are loaded
  var oEnsure=scEnsureAdminEdits;
  scEnsureAdminEdits=async function(force){ var r=await oEnsure.apply(this,arguments); try{ await scCpmLoad(force); }catch(e){} return r; };
  var oStart=scStartApp;
  scStartApp=async function(){ try{ await scCpmLoad(true); }catch(e){} return oStart.apply(this,arguments); };
  var oAdmin=scStartAdminApp;
  scStartAdminApp=async function(){ try{ await scCpmLoad(true); }catch(e){} return oAdmin.apply(this,arguments); };
})();
