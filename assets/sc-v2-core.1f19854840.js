
// ══════════════════════════════════════════════════════════════
// SC v2 — Shared helpers · In-app dialogs · Readiness · Progress sync
// Live Sessions · Gap Register · Corrective Actions · Supervisor role
// ══════════════════════════════════════════════════════════════

// NQAS certification thresholds used by every readiness dashboard.
var SC_NQAS_OVERALL   = 70;  // overall score must be at least this %
var SC_NQAS_AOC       = 50;  // every Area of Concern must be at least this %
var SC_JOIN_EARLY_MIN = 10;  // live-session Join button opens this many minutes early

// ── Escaping & small utils ─────────────────────────────────────
function scEsc(s){
  return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
// For a value placed inside a single-quoted JS string inside an HTML attribute: onclick="f('…')"
function scJs(s){
  return scEsc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\r?\n/g,' '));
}
function scTodayStr(){
  var d=new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function scAddDays(dateStr,n){
  var p=dateStr.split('-');var d=new Date(+p[0],+p[1]-1,+p[2]);d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function scNowIso(){ return new Date().toISOString(); }
function scUid(prefix){ return (prefix||'id')+'_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function scFmtDate(ds){
  if(!ds) return '—';
  var p=String(ds).slice(0,10).split('-'); if(p.length<3) return ds;
  return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});
}
function scFmtDateTime(iso){
  try{ return new Date(iso).toLocaleString('en-IN',{weekday:'short',day:'numeric',month:'short',hour:'numeric',minute:'2-digit'}); }
  catch(e){ return iso||'—'; }
}
function scPkgShort(id){ return ({nqas_12A:'12A',nqas_12B:'12B'})[id]||id||'—'; }
function scPkgLabel(id){ return (typeof _SC_PKG_LABELS!=='undefined'&&_SC_PKG_LABELS[id])||id||'—'; }
function scPctColor(p){ return p>=80?'var(--green)':p>=70?'var(--teal)':p>=50?'var(--amber)':'var(--red)'; }
function scPctText(p){ return p>=70?'var(--green-dk)':p>=50?'var(--amber-dk)':'var(--red-dk)'; }
function scIsHttpUrl(u){ return /^https?:\/\/[^\s]+$/i.test(String(u||'').trim()); }
function scClean(obj){ return JSON.parse(JSON.stringify(obj,function(k,v){ return v===undefined?null:v; })); }

// Checkpoint roles: a checkpoint may carry one role (string) or several (array).
var SC_KNOWN_ROLES=['General','CHO','ANM','ASHA','MPW','MO'];
function scCpRoles(cp){
  if(!cp) return [];
  var r=cp.r, raw;
  if(Array.isArray(r)) raw=r.filter(Boolean).map(String);
  else if(r&&typeof r==='object') raw=Object.keys(r).map(function(k){return r[k];}).filter(Boolean).map(String);
  else raw=r?[String(r)]:[];
  // Unrecognised tags (e.g. method codes 'OB'/'CI' entered as a role) count as General
  var known=raw.filter(function(x){return SC_KNOWN_ROLES.indexOf(x)>=0;});
  if(raw.length&&!known.length) return ['General'];
  return known;
}
function scCpHasRole(cp,role){ return scCpRoles(cp).indexOf(role)>=0; }
// Who "General / All Staff" (or untagged) checkpoints belong to. MO is a verifier and
// only scores checkpoints explicitly tagged MO.
var SC_GENERAL_ROLES=['CHO','ANM','ASHA','MPW'];
function scCpForRole(cp,role){
  if(!role) return true;
  var rs=scCpRoles(cp);
  if(!rs.length||rs.indexOf('General')>=0) return SC_GENERAL_ROLES.indexOf(role)>=0;
  return rs.indexOf(role)>=0;
}
// Staff app: is checkpoint ci of day di assigned to the logged-in staff member?
function scMyCp(di,ci){
  if(appMode!=='cho') return true;
  var d=getDay(di); var cp=d&&d.cps?d.cps[ci]:null;
  return !!cp&&scCpForRole(cp,choState.roleId||'CHO');
}
function scMyCpIdx(di){
  var d=getDay(di); var out=[];
  (d&&d.cps||[]).forEach(function(cp,ci){ if(scMyCp(di,ci)) out.push(ci); });
  return out;
}
function scCpRoleText(cp){
  var rs=scCpRoles(cp);
  if(!rs.length) return '@All';
  if(rs.indexOf('General')>=0) return '👥 All Staff';
  return rs.map(function(r){return '@'+r;}).join(' ');
}

// ══════════════════════════════════════════════════════════════
// IN-APP DIALOGS (replace native prompt / alert / confirm)
// ══════════════════════════════════════════════════════════════
// scDialog({title, icon, message, fields:[{key,label,type,value,placeholder,options,required,minLength,hint}],
//           okLabel, okColor, cancelLabel, hideCancel, wide, validate(values)->errorString})
// Resolves to an object of field values, or null if cancelled.
function scDialog(opts){
  opts=opts||{};
  return new Promise(function(resolve){
    var ov=document.createElement('div'); ov.className='scx-ov';
    var box=document.createElement('div'); box.className='scx-box'+(opts.wide?' wide':'');
    ov.appendChild(box);

    var hd=document.createElement('div'); hd.className='scx-hd';
    if(opts.icon){ var ic=document.createElement('div'); ic.className='scx-hd-icon'; ic.textContent=opts.icon; hd.appendChild(ic); }
    var tt=document.createElement('div'); tt.className='scx-hd-title'; tt.textContent=opts.title||''; hd.appendChild(tt);
    box.appendChild(hd);

    if(opts.message){ var m=document.createElement('div'); m.className='scx-msg'; m.textContent=opts.message; box.appendChild(m); }

    var inputs={};
    (opts.fields||[]).forEach(function(f){
      var wrap=document.createElement('div'); wrap.className='scx-field';
      if(f.label){ var l=document.createElement('label'); l.className='scx-lbl'; l.textContent=f.label+(f.required?' *':''); wrap.appendChild(l); }
      var el;
      if(f.type==='textarea'){
        el=document.createElement('textarea'); el.className='scx-in'; el.rows=f.rows||3; el.value=f.value||'';
        if(f.placeholder) el.placeholder=f.placeholder; if(f.maxLength) el.maxLength=f.maxLength;
      } else if(f.type==='select'){
        el=document.createElement('select'); el.className='scx-in';
        (f.options||[]).forEach(function(o){
          var op=document.createElement('option'); op.value=o.value; op.textContent=o.label;
          if(String(o.value)===String(f.value==null?'':f.value)) op.selected=true; el.appendChild(op);
        });
      } else if(f.type==='checklist'){
        el=document.createElement('div'); el.className='scx-chk-list';
        var sel=(f.value||[]).map(String);
        (f.options||[]).forEach(function(o){
          var lb=document.createElement('label'); lb.className='scx-chk'+(sel.indexOf(String(o.value))>=0?' on':'');
          var cb=document.createElement('input'); cb.type='checkbox'; cb.value=o.value; cb.checked=sel.indexOf(String(o.value))>=0;
          cb.addEventListener('change',function(){ lb.classList.toggle('on',cb.checked); });
          lb.appendChild(cb); lb.appendChild(document.createTextNode(o.label)); el.appendChild(lb);
        });
        if(!(f.options||[]).length){ el.textContent=f.emptyText||'Nothing to choose from.'; el.style.cssText='font-size:11px;color:var(--t3);'; }
        el._isChecklist=true;
      } else if(f.type==='info'){
        el=document.createElement('div'); el.className='scx-hint'; el.style.fontSize='11px'; el.textContent=f.value||'';
      } else {
        el=document.createElement('input'); el.className='scx-in'; el.type=f.type||'text'; el.value=f.value==null?'':f.value;
        if(f.placeholder) el.placeholder=f.placeholder; if(f.maxLength) el.maxLength=f.maxLength;
        if(f.min!=null) el.min=f.min;
        el.autocomplete='off';
      }
      wrap.appendChild(el);
      if(f.hint){ var h=document.createElement('div'); h.className='scx-hint'; h.textContent=f.hint; wrap.appendChild(h); }
      box.appendChild(wrap);
      if(f.key) inputs[f.key]={el:el,f:f};
    });
    if(typeof opts.onRender==='function'){ try{ opts.onRender(Object.keys(inputs).reduce(function(o,k){ o[k]=inputs[k]; return o; },{})); }catch(e){ console.warn('[SC] dialog onRender',e); } }

    var err=document.createElement('div'); err.className='scx-err'; box.appendChild(err);

    var btns=document.createElement('div'); btns.className='scx-btns';
    var cancel=document.createElement('button'); cancel.className='scx-btn ghost'; cancel.type='button'; cancel.textContent=opts.cancelLabel||'Cancel';
    var ok=document.createElement('button'); ok.className='scx-btn'; ok.type='button'; ok.textContent=opts.okLabel||'OK';
    if(opts.okColor) ok.style.background=opts.okColor;
    if(!opts.hideCancel) btns.appendChild(cancel);
    btns.appendChild(ok); box.appendChild(btns);

    function values(){
      var v={};
      Object.keys(inputs).forEach(function(k){
        var it=inputs[k];
        if(it.el._isChecklist){ v[k]=Array.prototype.slice.call(it.el.querySelectorAll('input:checked')).map(function(c){return c.value;}); }
        else if(it.f.type==='info'){ /* skip */ }
        else v[k]=(it.el.value==null?'':String(it.el.value)).trim();
      });
      return v;
    }
    var done=false;
    function finish(result){
      if(done) return; done=true;
      document.removeEventListener('keydown',onKey,true);
      if(ov.parentNode) ov.parentNode.removeChild(ov);
      resolve(result);
    }
    function showErr(msg){ err.textContent=msg; err.style.display='block'; }
    function submit(){
      var v=values();
      for(var k in inputs){
        var f=inputs[k].f;
        if(f.required&&(!v[k]||(Array.isArray(v[k])&&!v[k].length))){ showErr((f.label||k)+' is required.'); return; }
        if(f.minLength&&v[k]&&v[k].length<f.minLength){ showErr((f.label||k)+' must be at least '+f.minLength+' characters.'); return; }
      }
      if(typeof opts.validate==='function'){ var e=opts.validate(v); if(e){ showErr(e); return; } }
      finish(opts.fields&&opts.fields.length?v:true);
    }
    function onKey(e){
      if(e.key==='Escape'){ e.preventDefault(); finish(null); }
      else if(e.key==='Enter'&&e.target&&e.target.tagName!=='TEXTAREA'&&box.contains(e.target)){ e.preventDefault(); submit(); }
    }
    cancel.onclick=function(){ finish(null); };
    ok.onclick=submit;
    ov.addEventListener('mousedown',function(e){ if(e.target===ov&&!opts.modal) finish(null); });
    document.addEventListener('keydown',onKey,true);
    document.body.appendChild(ov);
    var first=box.querySelector('input.scx-in,textarea.scx-in,select.scx-in');
    setTimeout(function(){ (first||ok).focus(); },30);
  });
}
function scAlert(message,title,icon){
  return scDialog({title:title||'Notice',icon:icon||'ℹ️',message:message,okLabel:'OK',hideCancel:true}).then(function(){});
}
// scChoice({title, icon, message, choices:[{value,label,color}]}) → chosen value or null
function scChoice(opts){
  return new Promise(function(resolve){
    var ov=document.createElement('div'); ov.className='scx-ov';
    var box=document.createElement('div'); box.className='scx-box'; ov.appendChild(box);
    var hd=document.createElement('div'); hd.className='scx-hd';
    var ic=document.createElement('div'); ic.className='scx-hd-icon'; ic.textContent=opts.icon||'❓'; hd.appendChild(ic);
    var tt=document.createElement('div'); tt.className='scx-hd-title'; tt.textContent=opts.title||''; hd.appendChild(tt);
    box.appendChild(hd);
    if(opts.message){ var m=document.createElement('div'); m.className='scx-msg'; m.textContent=opts.message; box.appendChild(m); }
    var row=document.createElement('div'); row.className='scx-choice'; box.appendChild(row);
    var done=false;
    function finish(v){ if(done)return; done=true; document.removeEventListener('keydown',onKey,true); if(ov.parentNode)ov.parentNode.removeChild(ov); resolve(v); }
    (opts.choices||[]).forEach(function(c){
      var b=document.createElement('button'); b.type='button'; b.textContent=c.label;
      b.style.borderColor=c.color||'var(--teal)'; b.style.color=c.color||'var(--teal)';
      b.onclick=function(){ finish(c.value); }; row.appendChild(b);
    });
    var cancel=document.createElement('button'); cancel.className='scx-btn ghost'; cancel.style.cssText='width:100%;margin-top:10px;';
    cancel.textContent='Cancel'; cancel.onclick=function(){ finish(null); }; box.appendChild(cancel);
    function onKey(e){ if(e.key==='Escape'){ e.preventDefault(); finish(null); } }
    document.addEventListener('keydown',onKey,true);
    ov.addEventListener('mousedown',function(e){ if(e.target===ov) finish(null); });
    document.body.appendChild(ov);
  });
}

// ══════════════════════════════════════════════════════════════
// SHARED READINESS CALCULATION
// One function set used by the staff Quest Board, Facility Admin,
// HealSol drill-in and Supervisor drill-in so numbers always match.
// ══════════════════════════════════════════════════════════════
var _SC_AE_LETTER={'nqas_12A':'C','nqas_12B':'D'};
var SC_AOC_KEYS=['A','B','C','D','E','F','G','H'];
var SC_AOC_NAMES={A:'Service Provision',B:'Patient Rights',C:'Inputs',D:'Support Services',E:'Clinical Services',F:'Infection Control',G:'Quality Management',H:'Outcome'};

function scDayDef(progId,di){
  var arr=getDaysArr(progId); var base=arr[di]; if(!base) return null;
  var edit=(typeof adminEdits!=='undefined'&&adminEdits)?adminEdits[(_SC_AE_LETTER[progId]||'C')+'_'+di]:null;
  if(!edit) return base;
  var cps=edit.cps;
  if(cps&&!Array.isArray(cps)&&typeof cps==='object') cps=Object.keys(cps).sort(function(a,b){return a-b;}).map(function(k){return cps[k];});
  return Object.assign({},base,{
    title:edit.title!=null?edit.title:base.title, task:edit.task!=null?edit.task:base.task,
    me:edit.me!=null?edit.me:base.me, methods:edit.methods!=null?edit.methods:base.methods,
    cps:cps||base.cps
  });
}
function scNormScore(v){ return (v===0||v===1||v===2)?v:null; }
function scNormScores(raw,n){
  var out=new Array(n).fill(null);
  if(raw&&typeof raw==='object'){
    Object.keys(raw).forEach(function(k){ var i=parseInt(k,10); if(i>=0&&i<n) out[i]=scNormScore(raw[k]); });
  }
  return out;
}
function scNormRetries(raw){
  var o={};
  if(raw&&typeof raw==='object'){
    Object.keys(raw).forEach(function(k){
      var v=raw[k]; if(!v) return;
      var ci=String(k).replace(/^c/,'');
      var g=Object.assign({},v);
      if(g.attempts&&!Array.isArray(g.attempts)) g.attempts=Object.keys(g.attempts).map(function(x){return g.attempts[x];});
      o[ci]=g;
    });
  }
  return o;
}
function scCardFromRecord(rec,n){
  rec=rec||{};
  return {
    cpScores:scNormScores(rec.cpScores,n), taskDone:!!rec.taskDone, verified:!!rec.verified,
    score:rec.score==null?null:rec.score, verifierComment:rec.verifierComment||'', commentDate:rec.commentDate||'',
    gapRetries:scNormRetries(rec.gapRetries), verifiedBy:rec.verifiedBy||'', verifiedByRole:rec.verifiedByRole||'',
    verifiedAt:rec.verifiedAt||'', verifiedByMob:rec.verifiedByMob||'',
    cpVerify:rec.cpVerify||{}, verifyMode:rec.verifyMode||'',
    sentBackBy:rec.sentBackBy||'', sentBackByRole:rec.sentBackByRole||'', sentBackAt:rec.sentBackAt||'', sentBackReason:rec.sentBackReason||'',
    updatedAt:rec.updatedAt||rec.syncedAt||''
  };
}
function scCardsFromRemote(daysObj,progId){
  var cards={};
  Object.keys(daysObj||{}).forEach(function(k){
    var m=/^day_(\d+)$/.exec(k); if(!m) return;
    var di=+m[1]; var d=scDayDef(progId,di); if(!d) return;
    cards[di]=scCardFromRecord(daysObj[k],(d.cps||[]).length);
  });
  return cards;
}
function scAocKey(cp,day){
  var a=String((cp&&cp.aoc)||(day&&day.aoc)||'').toUpperCase();
  if(a==='AE') a='A';
  return /^[A-H]$/.test(a)?a:'?';
}
function _scAddBucket(map,key,s){ var b=map[key]||(map[key]={xp:0,max:0,pct:0}); b.xp+=s; b.max+=2; }
function _scFinishPcts(r){
  r.pct=r.max>0?Math.round(r.xp/r.max*100):0;
  [r.byAoc,r.byService].forEach(function(m){ Object.keys(m).forEach(function(k){ var b=m[k]; b.pct=b.max>0?Math.round(b.xp/b.max*100):0; }); });
}
// Readiness for ONE staff member's cards on a package.
// Only days marked done count; each scored checkpoint is worth 2 points.
function scReadiness(progId,cards,role){
  var res={xp:0,max:0,pct:0,daysDone:0,daysVerified:0,totalDays:getDaysArr(progId).length,byAoc:{},byService:{},gaps:[]};
  Object.keys(cards||{}).forEach(function(k){
    var di=+k, c=cards[k]; if(!c||!c.taskDone) return;
    var d=scDayDef(progId,di); if(!d) return;
    res.daysDone++; if(c.verified) res.daysVerified++;
    (d.cps||[]).forEach(function(cp,ci){
      if(role&&!scCpForRole(cp,role)) return;
      var s=scNormScore(c.cpScores?c.cpScores[ci]:null); if(s===null) return;
      res.xp+=s; res.max+=2;
      var a=scAocKey(cp,d); _scAddBucket(res.byAoc,a,s);
      var sv=cp.svc||cp.service||d.service||'Other'; _scAddBucket(res.byService,sv,s); (Array.isArray(cp.cc)?cp.cc:[]).forEach(function(a){ if(a&&a!==sv) _scAddBucket(res.byService,a,s); });
      var gr=c.gapRetries?c.gapRetries[ci]:null;
      var att=(gr&&gr.attempts)?gr.attempts:[];
      if(s<2) res.gaps.push({di:di,ci:ci,cp:cp,day:d,score:s,closed:false,attempts:att,aoc:a,service:sv});
      else if(gr&&gr.closed) res.gaps.push({di:di,ci:ci,cp:cp,day:d,score:gr.orig!=null?gr.orig:null,closed:true,closedAt:gr.closedAt||'',attempts:att,aoc:a,service:sv});
    });
  });
  _scFinishPcts(res);
  return res;
}
function scNqasCheck(r){
  var fails=[];
  Object.keys(r.byAoc||{}).sort().forEach(function(a){ if(a==='?')return; var x=r.byAoc[a]; if(x.max>0&&x.pct<SC_NQAS_AOC) fails.push(a); });
  var overallOk=r.max>0&&r.pct>=SC_NQAS_OVERALL;
  return {hasData:r.max>0,overallOk:overallOk,aocFails:fails,meets:r.max>0&&overallOk&&!fails.length};
}
// Readiness for a whole FACILITY (all staff on the facility's package), points-weighted.
function scFacilityReadiness(progId,progressByMob,staffMap){
  progId=progId||'nqas_12A'; progressByMob=progressByMob||{}; staffMap=staffMap||{};
  var agg={xp:0,max:0,pct:0,daysDone:0,daysVerified:0,totalDays:getDaysArr(progId).length,byAoc:{},byService:{},staff:[],gaps:[],progId:progId};
  var mobs={}; Object.keys(staffMap).forEach(function(m){mobs[m]=1;}); Object.keys(progressByMob).forEach(function(m){mobs[m]=1;});
  Object.keys(mobs).forEach(function(mob){
    var s=staffMap[mob]||{};
    var r=scReadiness(progId,scCardsFromRemote(progressByMob[mob],progId),s.role||null);
    agg.staff.push({mob:mob,name:s.name||mob,role:s.role||'—',inRoster:!!staffMap[mob],res:r});
    agg.xp+=r.xp; agg.max+=r.max; agg.daysDone+=r.daysDone; agg.daysVerified+=r.daysVerified;
    ['byAoc','byService'].forEach(function(mk){ Object.keys(r[mk]).forEach(function(k){ var b=agg[mk][k]||(agg[mk][k]={xp:0,max:0,pct:0}); b.xp+=r[mk][k].xp; b.max+=r[mk][k].max; }); });
    r.gaps.forEach(function(g){ g.mob=mob; g.staffName=s.name||mob; g.role=s.role||'—'; agg.gaps.push(g); });
  });
  _scFinishPcts(agg);
  agg.staff.sort(function(a,b){ return (b.res.pct-a.res.pct)||String(a.name).localeCompare(b.name); });
  agg.nqas=scNqasCheck(agg);
  return agg;
}
function scFacAggFor(code){
  var fac=(scMasterFacilities||{})[code]||{};
  return scFacilityReadiness(fac.progId||'nqas_12A',(scMasterProgress||{})[code]||{},fac.staff||{});
}

// ── Admin (Card Editor) edits from Firebase — needed wherever cards are shown or scored ──
var _scEditsLoadedAt=0;
async function scEnsureAdminEdits(force){
  if(!force&&_scEditsLoadedAt&&(Date.now()-_scEditsLoadedAt)<60000) return;
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
  try{
    var remote=await fbGet('shared/admin_edits');
    if(remote&&typeof remote==='object'){
      adminEdits=remote;
      try{ localStorage.setItem('adminEdits_v2',JSON.stringify(remote)); }catch(e){}
    } else {
      try{ var s=localStorage.getItem('adminEdits_v2'); if(s) adminEdits=JSON.parse(s); }catch(e){}
    }
    _scEditsLoadedAt=Date.now();
  }catch(e){}
}

// ══════════════════════════════════════════════════════════════
// STAFF PROGRESS SYNC & HYDRATION
// Every change is pushed to Firebase; on login the staff's own view
// is rebuilt from Firebase (fixes the "day cards always fresh" bug).
// ══════════════════════════════════════════════════════════════
var _scSynced={};      // di → signature last confirmed in Firebase
var _scSyncTimer=null;
function scCardSig(c){
  if(!c) return '';
  return JSON.stringify([!!c.taskDone,!!c.verified,(c.cpScores||[]).map(scNormScore),c.gapRetries||{},c.verifierComment||'',c.commentDate||'']);
}
function scCardIsEmpty(c){
  if(!c) return true;
  if(c.taskDone||c.verified||c.verifierComment) return false;
  if((c.cpScores||[]).some(function(s){return scNormScore(s)!==null;})) return false;
  if(c.gapRetries&&Object.keys(c.gapRetries).length) return false;
  return true;
}
function scQueueSync(){
  if(!choState||!choState.facilityCode||!choState.staffMobile) return;
  clearTimeout(_scSyncTimer);
  _scSyncTimer=setTimeout(scFlushSync,500);
}
async function scFlushSync(){
  if(!db||!choState.facilityCode||!choState.staffMobile) return;
  var changedLocal=false;
  var keys=Object.keys(choState.cards||{});
  for(var i=0;i<keys.length;i++){
    var di=keys[i]; var c=choState.cards[di]; if(!c) continue;
    var sig=scCardSig(c);
    if(_scSynced[di]===sig) continue;
    if(_scSynced[di]===undefined&&scCardIsEmpty(c)) continue; // never-synced blank card: nothing to send
    c.updatedAt=scNowIso(); changedLocal=true;
    var ok=await scSyncProgress(+di);
    if(ok) _scSynced[di]=sig;
  }
  if(changedLocal){ try{ localStorage.setItem(getChoStateKey(),JSON.stringify(choState)); }catch(e){} }
}
async function scSyncProgress(di){
  if(!db||!choState.facilityCode||!choState.staffMobile) return false;
  var c=choState.cards[di]; if(!c) return false;
  var d=getDay(di); var n=Math.max((d&&d.cps||[]).length,(c.cpScores||[]).length);
  var scores=[]; for(var i=0;i<n;i++){ var s=scNormScore((c.cpScores||[])[i]); scores.push(s===null?-1:s); } // -1 = not scored (keeps array dense in Firebase)
  var retries={};
  Object.keys(c.gapRetries||{}).forEach(function(k){ if(c.gapRetries[k]) retries['c'+k]=c.gapRetries[k]; });
  var data=scClean({
    day:di, progId:choState.progId, taskDone:!!c.taskDone, verified:!!c.verified,
    score:c.score==null?null:c.score, cpScores:scores, gapRetries:retries,
    staffName:choState.staffName||'', role:choState.roleId||'',
    updatedAt:c.updatedAt||scNowIso(), syncedAt:scNowIso()
  });
  // Verification fields (verified, verifiedBy…, verifierComment, sentBack…) are written only by
  // a CHO/MO through scVerifyStaffDay / scSendBackStaffDay, so a staff device can never
  // overwrite or fake a sign-off. update() leaves those fields untouched.
  delete data.verified;
  try{ await db.ref(scProgressPath(choState.facilityCode,choState.staffMobile,di)).update(data); return true; }
  catch(e){ console.warn('Sync failed',e); return false; }
}
// Rebuild the staff member's own cards from Firebase. Whichever copy (local or remote)
// was updated most recently wins per day; newer local-only changes are pushed back up.
async function scHydrateProgress(){
  _scSynced={};
  if(!choState.facilityCode||!choState.staffMobile) return;
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
  if(!db) return;
  var remote=null;
  try{ remote=await fbGet('sc_progress/'+choState.facilityCode+'/'+choState.staffMobile); }catch(e){ return; }
  remote=remote||{};
  var remoteCards=scCardsFromRemote(remote,choState.progId);
  var local=choState.cards||{};
  var merged={};
  Object.keys(remoteCards).forEach(function(di){
    var r=remoteCards[di], l=local[di];
    if(!l||scCardIsEmpty(l)||String(r.updatedAt||'')>=String(l.updatedAt||'')){ merged[di]=r; }
    else merged[di]=l;
    _scSynced[di]=scCardSig(r);
  });
  Object.keys(local).forEach(function(di){ if(!merged[di]&&!scCardIsEmpty(local[di])) merged[di]=local[di]; });
  choState.cards=merged;
  choState.streak=Object.keys(merged).filter(function(k){return merged[k]&&merged[k].taskDone;}).length;
  try{ localStorage.setItem(getChoStateKey(),JSON.stringify(choState)); }catch(e){}
  scQueueSync(); // pushes any local-newer days
}

// ══════════════════════════════════════════════════════════════
// VIDEO PLAYER
// • Wix direct files (video.wixstatic.com/…/file.mp4) and other direct files →
//   native <video> with download / cast / PiP / right-click disabled
// • YouTube → real IFrame API with error detection (origin only over http/https)
// • Vimeo → embed
// ══════════════════════════════════════════════════════════════
function scYouTubeId(url){
  var m=String(url||'').match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  return m?m[1]:null;
}
function scIsWixVideo(url){ return /^https?:\/\/video\.wixstatic\.com\//i.test(String(url||'')); }
function scVimeoId(url){ var m=String(url||'').match(/vimeo\.com\/(?:video\/)?(\d+)/i); return m?m[1]:null; }
function isVideoUrl(url){
  if(!url) return false;
  return !!(scYouTubeId(url)||scVimeoId(url)||scIsWixVideo(url)||/\.(mp4|webm|ogg|ogv|m4v|mov)(\?|#|$)/i.test(String(url)));
}
var _scYTApiPromise=null;
function scLoadYTApi(){
  if(window.YT&&window.YT.Player) return Promise.resolve(window.YT);
  if(_scYTApiPromise) return _scYTApiPromise;
  _scYTApiPromise=new Promise(function(resolve,reject){
    var prev=window.onYouTubeIframeAPIReady;
    var timer=setTimeout(function(){ _scYTApiPromise=null; reject(new Error('timeout')); },12000);
    window.onYouTubeIframeAPIReady=function(){
      clearTimeout(timer);
      try{ if(typeof prev==='function') prev(); }catch(e){}
      resolve(window.YT);
    };
    var s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api'; s.async=true;
    s.onerror=function(){ clearTimeout(timer); _scYTApiPromise=null; reject(new Error('load')); };
    document.head.appendChild(s);
  });
  return _scYTApiPromise;
}
function scYTErrorInfo(code){
  if(code===101||code===150) return {msg:'The owner of this video has not allowed it to play inside other apps.',canOpen:true};
  if(code===100) return {msg:'This video is unavailable — it may have been removed or made private.',canOpen:false};
  if(code===2) return {msg:'This video link is not valid. Please ask HealSol Academy to check it.',canOpen:false};
  if(code===5) return {msg:'This video could not be played in this browser.',canOpen:true};
  return {msg:'The video could not be played.',canOpen:true};
}
function showVideoPopup(url){
  url=String(url||'').trim();
  if(!url) return;
  if(!scIsHttpUrl(url)){ showToast('This media link is not valid.','err'); return; }
  if(!isVideoUrl(url)){ window.open(url,'_blank','noopener'); return; }

  var cleanups=[];
  var ov=document.createElement('div');
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.9);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;';
  ov.addEventListener('contextmenu',function(e){ e.preventDefault(); });
  var box=document.createElement('div');
  box.style.cssText='background:#000;border-radius:16px;overflow:hidden;width:min(92vw,860px);position:relative;';
  box.className='nf-vbox';
  var stage=document.createElement('div'); stage.className='nf-vstage';
  stage.style.cssText='position:relative;width:100%;aspect-ratio:16/9;background:#000;';
  box.appendChild(stage);

  function close(){
    cleanups.forEach(function(fn){ try{fn();}catch(e){} });
    document.removeEventListener('keydown',onKey,true);
    if(ov.parentNode) ov.parentNode.removeChild(ov);
  }
  function onKey(e){ if(e.key==='Escape'){ e.preventDefault(); close(); } }
  function showMsg(text,spinner){
    var m=stage.querySelector('.scx-vmsg');
    if(!m){ m=document.createElement('div'); m.className='scx-vmsg'; m.style.cssText='position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;text-align:center;padding:24px;gap:12px;z-index:2;background:#000;'; stage.appendChild(m); }
    m.innerHTML=(spinner?'<i class="ti ti-loader" style="font-size:26px;animation:spin 1s linear infinite;"></i>':'<i class="ti ti-alert-circle" style="font-size:30px;color:#FCA5A5;"></i>')+'<div></div>';
    m.lastChild.textContent=text;
    return m;
  }
  function hideMsg(){ var m=stage.querySelector('.scx-vmsg'); if(m) m.parentNode.removeChild(m); }
  function showErr(info,openUrl){
    var m=showMsg(info.msg,false);
    if(info.canOpen&&openUrl){
      var b=document.createElement('button');
      b.style.cssText='background:#fff;color:#111;border:none;border-radius:10px;padding:9px 16px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;';
      b.textContent='Open on YouTube'; b.onclick=function(){ window.open(openUrl,'_blank','noopener'); };
      m.appendChild(b);
    }
  }

  var ytId=scYouTubeId(url), vmId=scVimeoId(url);
  if(ytId){
    var watchUrl='https://www.youtube.com/watch?v='+ytId;
    var mount=document.createElement('div'); mount.style.cssText='position:absolute;inset:0;';
    stage.appendChild(mount);
    showMsg('Loading video…',true);
    scLoadYTApi().then(function(YT){
      if(!ov.parentNode) return;
      var pv={autoplay:1,rel:0,modestbranding:1,playsinline:1,fs:0};   // fs:0 — our own Full screen button works inside apps
      // Only send origin over real http(s) — never when opened from file:// for testing.
      if(/^https?:$/.test(window.location.protocol)) pv.origin=window.location.origin;
      var player=new YT.Player(mount,{
        videoId:ytId,width:'100%',height:'100%',playerVars:pv,
        events:{
          onReady:function(e){ hideMsg(); try{ e.target.playVideo(); }catch(_){ } },
          onError:function(e){ showErr(scYTErrorInfo(e&&e.data),watchUrl); }
        }
      });
      cleanups.push(function(){ player.destroy(); });
      var f=stage.querySelector('iframe'); if(f){ f.style.position='absolute'; f.style.inset='0'; }
    }).catch(function(){
      showErr({msg:"Couldn't load the YouTube player. Check your internet connection and try again.",canOpen:true},watchUrl);
    });
  } else if(vmId){
    var iframe=document.createElement('iframe');
    iframe.src='https://player.vimeo.com/video/'+vmId+'?autoplay=1';
    iframe.style.cssText='position:absolute;inset:0;width:100%;height:100%;border:none;';
    iframe.allow='autoplay; fullscreen';
    iframe.allowFullscreen=true;
    stage.appendChild(iframe);
  } else {
    // Direct file (incl. Wix video.wixstatic.com) — native player, no download/cast/PiP/right-click
    stage.style.aspectRatio='auto';
    var v=document.createElement('video');
    v.controls=true; v.autoplay=true; v.playsInline=true; v.preload='metadata';
    v.setAttribute('playsinline',''); v.setAttribute('webkit-playsinline','');
    v.setAttribute('controlsList','nodownload noremoteplayback nofullscreen');
    v.disablePictureInPicture=true; v.setAttribute('disablepictureinpicture','');
    v.disableRemotePlayback=true;   v.setAttribute('disableremoteplayback','');
    v.setAttribute('x-webkit-airplay','deny');
    v.style.cssText='width:100%;display:block;max-height:80vh;background:#000;';
    v.addEventListener('contextmenu',function(e){ e.preventDefault(); });
    v.addEventListener('error',function(){ stage.style.minHeight='220px'; showErr({msg:"This video couldn't be loaded. Check your connection, or ask HealSol Academy to check the link.",canOpen:false}); });
    v.src=url;
    stage.appendChild(v);
    cleanups.push(function(){ try{ v.pause(); v.removeAttribute('src'); v.load(); }catch(e){} });
  }

  var closeBtn=document.createElement('button');
  closeBtn.style.cssText='position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);color:#fff;border:1.5px solid rgba(255,255,255,0.3);border-radius:8px;padding:6px 14px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;z-index:5;';
  closeBtn.textContent='✕ Close'; closeBtn.onclick=close;
  box.appendChild(closeBtn);
  // Full screen that works inside One HealSol and the thehealsol.com page (their built-in full screen is blocked):
  // phones: fill the screen and turn the video sideways; computers: normal full screen, with the same fallback
  var fsBtn=document.createElement('button'); fsBtn.className='nf-vfs-btn'; fsBtn.type='button';
  var setFsLabel=function(on){ fsBtn.textContent=on?'⤡ Exit full screen':'⤢ Full screen'; };
  setFsLabel(false);
  // sized from the real window (vh/vw units are unreliable inside apps); turned sideways when the phone is upright
  var fitFs=function(){ if(!ov.classList.contains('nf-vfs')) return; var W=window.innerWidth, H=window.innerHeight, up=H>W;
    box.style.position='fixed'; box.style.top='50%'; box.style.left='50%'; box.style.flexShrink='0'; box.style.maxWidth='none';
    box.style.setProperty('width',(up?H:W)+'px','important'); box.style.height=(up?W:H)+'px';
    box.style.transform='translate(-50%,-50%)'+(up?' rotate(90deg)':''); };
  var cssFs=function(on){ ov.classList.toggle('nf-vfs',on); setFsLabel(on);
    if(on){ fitFs(); } else { box.style.setProperty('width','min(92vw,860px)'); box.style.height=''; box.style.transform=''; box.style.position='relative'; box.style.top=box.style.left=''; } };
  window.addEventListener('resize',fitFs); cleanups.push(function(){ window.removeEventListener('resize',fitFs); });
  var onFsChange=function(){ if(!document.fullscreenElement&&!ov.classList.contains('nf-vfs')) setFsLabel(false); };
  document.addEventListener('fullscreenchange',onFsChange);
  cleanups.push(function(){ document.removeEventListener('fullscreenchange',onFsChange); try{ if(document.fullscreenElement) document.exitFullscreen(); }catch(e){} });
  fsBtn.onclick=function(e){
    e.stopPropagation();
    if(ov.classList.contains('nf-vfs')) return cssFs(false);
    if(document.fullscreenElement){ try{ document.exitFullscreen(); }catch(_){ } setFsLabel(false); return; }
    var phone=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
    if(!phone&&box.requestFullscreen){ box.requestFullscreen().then(function(){ setFsLabel(true); },function(){ cssFs(true); }); return; }
    cssFs(true);
  };
  box.appendChild(fsBtn);
  ov.onclick=function(e){ if(e.target===ov) close(); };
  ov.appendChild(box);
  document.addEventListener('keydown',onKey,true);
  document.body.appendChild(ov);
}
// Card buttons look the URL up by index instead of embedding it in onclick (quote-safe)
function scPlayCpVideo(di,ci){
  var d=getDay(di); var cp=d&&d.cps?d.cps[ci]:null;
  if(cp&&cp.video) showVideoPopup(cp.video);
}

// ══════════════════════════════════════════════════════════════
// LIVE SESSIONS (Zoom / Google Meet)
// Firebase: sc_live_sessions/{id} = {title, description, link, startAt(ISO), durationMin,
//   packages:[progId…] (empty = all), roles:[roleId…] (empty = all), recordingUrl, createdBy…}
// ══════════════════════════════════════════════════════════════
var _scLive={};
var _scLiveTimer=null;
async function scLoadLive(){
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
  try{ _scLive=await fbGet('sc_live_sessions')||{}; }catch(e){ _scLive={}; }
  return _scLive;
}
function scLivePlatform(link){
  var l=String(link||'').toLowerCase();
  if(/zoom\.us|zoom\.com/.test(l)) return {key:'zoom',label:'Zoom'};
  if(/meet\.google\.com/.test(l)) return {key:'meet',label:'Google Meet'};
  return {key:'link',label:'Online'};
}
function scLiveTimes(s){
  var start=Date.parse(s.startAt||''); var dur=Math.max(5,parseInt(s.durationMin,10)||60);
  return {start:start,end:start+dur*60000,dur:dur};
}
function scLiveStatus(s,now){
  now=now||Date.now(); var t=scLiveTimes(s);
  if(isNaN(t.start)) return 'upcoming';
  if(now<t.start-SC_JOIN_EARLY_MIN*60000) return 'upcoming';
  if(now<=t.end) return 'live';
  return 'ended';
}
function scAsList(v){
  if(!v) return [];
  if(Array.isArray(v)) return v.filter(Boolean).map(String);
  if(typeof v==='object') return Object.keys(v).map(function(k){return v[k];}).filter(Boolean).map(String);
  return [String(v)];
}
function scLiveAudience(){
  if(appMode==='cho') return {pkgs:[choState.progId],role:choState.roleId,codes:[choState.facilityCode]};
  if(appMode==='sc-cho') return {pkgs:[(scSubAdminData||{}).progId||'nqas_12A'],codes:[scSubAdminCode]};
  if(appMode==='sc-supervisor'){
    var p={}; Object.keys(scMasterFacilities||{}).forEach(function(c){ var f=scMasterFacilities[c]; if(f&&f.progId) p[f.progId]=1; });
    return {pkgs:Object.keys(p),codes:Object.keys(scMasterFacilities||{})};
  }
  if(appMode==='sc-champion'){
    var cp={}, cc=Object.keys((_scq&&_scq.facs)||{}); cc.forEach(function(c){ var f=_scq.facs[c]; if(f&&f.progId) cp[f.progId]=1; });
    return {pkgs:Object.keys(cp),codes:cc};
  }
  return null; // HealSol admin sees everything
}
// facilities HealSol can target, grouped by district
function scLiveFacilityOptions(){
  var F=scMasterFacilities||{};
  return Object.keys(F).filter(function(c){ return F[c]&&!F[c].migratedTo; })
    .sort(function(a,b){ return String(F[a].district||'~').localeCompare(String(F[b].district||'~'))||String(F[a].name||a).localeCompare(String(F[b].name||b)); })
    .map(function(c){ var f=F[c]; return {value:c,label:(f.district||'No district')+' — '+(f.name||c)+' · '+scPkgShort(f.progId||'nqas_12A')}; });
}
function scLiveVisible(s,aud){
  if(!s) return false;
  if(!aud) return true;
  var pk=scAsList(s.packages);
  if(pk.length&&!aud.pkgs.some(function(p){return pk.indexOf(p)>=0;})) return false;
  if(aud.role){ var rl=scAsList(s.roles); if(rl.length&&rl.indexOf(aud.role)<0) return false; }
  var fc=scAsList(s.facilities);
  if(fc.length&&aud.codes&&!aud.codes.some(function(c){ return fc.indexOf(c)>=0; })) return false;
  return true;
}
function scLiveSorted(aud){
  var now=Date.now();
  var list=Object.keys(_scLive||{}).map(function(id){ return Object.assign({id:id},_scLive[id]); })
    .filter(function(s){ return scLiveVisible(s,aud); });
  var rank={live:0,upcoming:1,ended:2};
  list.sort(function(a,b){
    var sa=scLiveStatus(a,now), sb=scLiveStatus(b,now);
    if(sa!==sb) return rank[sa]-rank[sb];
    var ta=scLiveTimes(a).start, tb=scLiveTimes(b).start;
    return sa==='ended'?(tb-ta):(ta-tb);
  });
  return list;
}
function scCountdown(ms){
  if(ms<=0) return 'now';
  var m=Math.floor(ms/60000), d=Math.floor(m/1440), h=Math.floor((m%1440)/60), mm=m%60;
  if(d>0) return d+'d '+h+'h'; if(h>0) return h+'h '+mm+'m'; return mm+'m';
}
function scLiveCardHTML(s,canManage){
  var now=Date.now(), st=scLiveStatus(s,now), t=scLiveTimes(s), pf=scLivePlatform(s.link);
  var pk=scAsList(s.packages), rl=scAsList(s.roles);
  var chips='<span class="scx-chip '+pf.key+'">'+scEsc(pf.label)+'</span>';
  chips+=pk.length?pk.map(function(p){return '<span class="scx-chip pkg">'+scEsc(scPkgShort(p))+'</span>';}).join(''):'<span class="scx-chip pkg">All packages</span>';
  if(rl.length) chips+=rl.map(function(r){return '<span class="scx-chip role">'+scEsc(r)+'</span>';}).join('');
  var fcs=scAsList(s.facilities), fnm=function(c){ return ((scMasterFacilities||{})[c]||((_scq&&_scq.facs)||{})[c]||{}).name||c; };
  chips+=fcs.length?'<span class="scx-chip fac" title="'+scEsc(fcs.map(fnm).join(', '))+'"><i class="ti ti-building-hospital"></i> '+(fcs.length<=3?scEsc(fcs.map(fnm).join(', ')):fcs.length+' facilities')+'</span>':(canManage?'<span class="scx-chip fac">All facilities</span>':'');
  var stChip=st==='live'?'<span class="scx-chip livenow">● LIVE</span>':st==='upcoming'?'<span class="scx-chip up">Starts in '+scCountdown(t.start-now)+'</span>':'<span class="scx-chip end">Ended</span>';
  var action='';
  if(st==='live') action='<button class="scx-btn sm" style="background:#16A34A;" onclick="scJoinLive(\''+scJs(s.id)+'\')"><i class="ti ti-video"></i> Join now</button>';
  else if(st==='upcoming') action='<button class="scx-btn sm ghost" disabled><i class="ti ti-clock"></i> Join opens '+SC_JOIN_EARLY_MIN+' min before start</button>';
  else if(s.recordingUrl) action='<button class="scx-btn sm" onclick="scWatchRecording(\''+scJs(s.id)+'\')"><i class="ti ti-player-play"></i> Watch recording</button>';
  else action='<span style="font-size:10px;color:var(--t3);font-weight:700;">Recording not posted yet</span>';
  var admin='';
  if(canManage){
    admin='<span style="margin-left:auto;display:flex;gap:5px;">'
      +'<button class="scx-btn sm ghost" onclick="scEditLive(\''+scJs(s.id)+'\')"><i class="ti ti-pencil"></i> Edit</button>'
      +'<button class="scx-btn sm ghost" onclick="scSetRecording(\''+scJs(s.id)+'\')"><i class="ti ti-video"></i> Recording</button>'
      +'<button class="scx-btn sm danger" onclick="scDeleteLive(\''+scJs(s.id)+'\')"><i class="ti ti-trash"></i></button></span>';
  }
  return '<div class="scx-live-card '+st+'">'
    +'<div class="scx-live-top"><div class="scx-live-title">'+scEsc(s.title||'Live session')+'</div>'+stChip+'</div>'
    +'<div class="scx-live-meta"><i class="ti ti-calendar-event"></i> '+scEsc(scFmtDateTime(s.startAt))+' · '+t.dur+' min</div>'
    +(s.description?'<div class="scx-live-desc">'+scEsc(s.description)+'</div>':'')
    +'<div style="display:flex;gap:4px;flex-wrap:wrap;">'+chips+'</div>'
    +'<div class="scx-live-row">'+action+admin+'</div></div>';
}
var _scLiveModal=null;
async function scOpenLiveSessions(){
  if(_scLiveModal) scCloseLiveSessions();
  var canManage=appMode==='sc-admin';
  var ov=document.createElement('div'); ov.className='scx-ov';
  var box=document.createElement('div'); box.className='scx-box wide'; ov.appendChild(box);
  box.innerHTML='<div class="scx-hd"><div class="scx-hd-icon">📡</div><div class="scx-hd-title">Live Sessions</div>'
    +'<button class="scx-x" onclick="scCloseLiveSessions()" title="Close"><i class="ti ti-x"></i></button></div>'
    +(canManage?'<button class="scx-btn" style="width:100%;margin-bottom:12px;" onclick="scEditLive(null)"><i class="ti ti-circle-plus"></i> Schedule a live session</button>':'')
    +'<div id="scx-live-list"><div class="scx-empty"><i class="ti ti-loader" style="animation:spin 1s linear infinite;"></i> Loading sessions…</div></div>';
  ov.addEventListener('mousedown',function(e){ if(e.target===ov) scCloseLiveSessions(); });
  document.body.appendChild(ov);
  _scLiveModal=ov;
  await scLoadLive();
  scRenderLiveList();
  clearInterval(_scLiveTimer);
  _scLiveTimer=setInterval(scRenderLiveList,30000);
}
function scCloseLiveSessions(){
  clearInterval(_scLiveTimer); _scLiveTimer=null;
  if(_scLiveModal&&_scLiveModal.parentNode) _scLiveModal.parentNode.removeChild(_scLiveModal);
  _scLiveModal=null;
}
function scRenderLiveList(){
  var cont=document.getElementById('scx-live-list'); if(!cont) return;
  var canManage=appMode==='sc-admin';
  var list=scLiveSorted(scLiveAudience());
  if(!list.length){ cont.innerHTML='<div class="scx-empty">No live sessions scheduled yet.'+(canManage?'':' Check back soon.')+'</div>'; return; }
  cont.innerHTML=list.map(function(s){ return scLiveCardHTML(s,canManage); }).join('');
}
function scJoinLive(id){
  var s=_scLive[id]; if(!s) return;
  if(scLiveStatus(s)!=='live'){ showToast('This session is not open for joining right now.','err'); scRenderLiveList(); return; }
  if(!scIsHttpUrl(s.link)){ showToast('Meeting link is missing or invalid.','err'); return; }
  window.open(s.link,'_blank','noopener');
}
function scWatchRecording(id){ var s=_scLive[id]; if(s&&s.recordingUrl) showVideoPopup(s.recordingUrl); }
function _scLocalDateTime(iso){
  var d=iso?new Date(iso):new Date(Date.now()+86400000);
  if(isNaN(d.getTime())) d=new Date();
  return {date:d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'),
          time:String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
}
async function scEditLive(id){
  var s=id?_scLive[id]:null;
  var dt=_scLocalDateTime(s?s.startAt:null);
  if(!s) dt.time='16:00';
  var v=await scDialog({
    title:s?'Edit live session':'Schedule live session', icon:'📡', wide:true, okLabel:s?'Save changes':'Schedule',
    fields:[
      {key:'title',label:'Title',required:true,value:s?s.title:'',placeholder:'e.g. AoC E — Clinical Services Q&A',maxLength:120},
      {key:'description',label:'Description',type:'textarea',value:s?s.description:'',placeholder:'What will be covered (optional)'},
      {key:'link',label:'Zoom / Google Meet link',type:'url',required:true,value:s?s.link:'',placeholder:'https://zoom.us/j/… or https://meet.google.com/…'},
      {key:'date',label:'Date',type:'date',required:true,value:dt.date},
      {key:'time',label:'Start time',type:'time',required:true,value:dt.time},
      {key:'durationMin',label:'Duration (minutes)',type:'number',required:true,value:s?s.durationMin:60,min:5},
      {key:'packages',label:'Target packages',type:'checklist',value:s?scAsList(s.packages):[],
        options:PROGRAMS.map(function(p){return {value:p.id,label:scPkgShort(p.id)+' · '+p.name};}),hint:'Leave all unticked to show to every package.'},
      {key:'facilities',label:'Target facilities',type:'checklist',value:s?scAsList(s.facilities):[],options:scLiveFacilityOptions(),emptyText:'No facilities enrolled yet.',hint:'Leave all unticked to show to every facility.'},
      {key:'roles',label:'Target staff roles',type:'checklist',value:s?scAsList(s.roles):[],
        options:SC_ROLES.filter(function(r){return r.id!=='General';}).map(function(r){return {value:r.id,label:r.label};}),hint:'Leave all unticked to show to every role.'},
      {key:'recordingUrl',label:'Recording URL (optional)',type:'url',value:s?s.recordingUrl:'',placeholder:'YouTube, Wix video, or .mp4 link'}
    ],
    validate:function(v){
      if(!scIsHttpUrl(v.link)) return 'Enter a valid meeting link starting with https://';
      if(v.recordingUrl&&!scIsHttpUrl(v.recordingUrl)) return 'Recording URL must start with https://';
      if(!(parseInt(v.durationMin,10)>=5)) return 'Duration must be at least 5 minutes.';
      if(v.facilities&&v.facilities.length&&v.packages&&v.packages.length){
        var miss=v.facilities.filter(function(c){ var f=(scMasterFacilities||{})[c]; return f&&v.packages.indexOf(f.progId||'nqas_12A')<0; });
        if(miss.length) return 'These facilities are not in the ticked packages, so they would not see the session: '+miss.map(function(c){ return ((scMasterFacilities||{})[c]||{}).name||c; }).join(', ')+'. Tick their package too, or untick the packages.'; }
      var p=v.date.split('-'), tm=v.time.split(':');
      var d=new Date(+p[0],+p[1]-1,+p[2],+tm[0],+tm[1]); if(isNaN(d.getTime())) return 'Enter a valid date and time.';
      return null;
    }
  });
  if(!v) return;
  var p=v.date.split('-'), tm=v.time.split(':');
  var start=new Date(+p[0],+p[1]-1,+p[2],+tm[0],+tm[1]);
  var rec=Object.assign({},s||{},{
    title:v.title, description:v.description, link:v.link, startAt:start.toISOString(),
    durationMin:parseInt(v.durationMin,10)||60, packages:v.packages, roles:v.roles, facilities:v.facilities||[], recordingUrl:v.recordingUrl||'',
    updatedAt:scNowIso(), updatedBy:scActor().name
  });
  if(!s){ rec.createdAt=scNowIso(); rec.createdBy=scActor().name; }
  delete rec.id;
  var newId=id||scUid('live');
  var ok=await fbSet('sc_live_sessions/'+newId,scClean(rec));
  if(!ok){ showToast('Could not save session — check connection.','err'); return; }
  _scLive[newId]=rec; scRenderLiveList();
  showToast(s?'Session updated.':'Session scheduled.','ok');
}
async function scSetRecording(id){
  var s=_scLive[id]; if(!s) return;
  var v=await scDialog({title:'Session recording',icon:'🎬',okLabel:'Save',
    message:'Paste the recording link. Staff will be able to watch it from the ended session.',
    fields:[{key:'url',label:'Recording URL',type:'url',value:s.recordingUrl||'',placeholder:'YouTube, Wix video, or .mp4 link',hint:'Leave blank to remove the recording.'}],
    validate:function(v){ return v.url&&!scIsHttpUrl(v.url)?'Recording URL must start with https://':null; }});
  if(!v) return;
  var ok=await fbSet('sc_live_sessions/'+id+'/recordingUrl',v.url||'');
  if(!ok){ showToast('Could not save — check connection.','err'); return; }
  s.recordingUrl=v.url||''; scRenderLiveList(); showToast(v.url?'Recording saved.':'Recording removed.','ok');
}
async function scDeleteLive(id){
  var s=_scLive[id]; if(!s) return;
  var ok=await showConfirm('Delete "'+(s.title||'this session')+'"? Staff will no longer see it.','🗑️','Delete Session','Delete','var(--red)');
  if(!ok) return;
  try{ await db.ref('sc_live_sessions/'+id).remove(); }catch(e){ showToast('Delete failed: '+e.message,'err'); return; }
  delete _scLive[id]; scRenderLiveList(); showToast('Session deleted.','ok');
}
// Live-now banner on the staff Welcome screen
function scRenderWsLive(){
  var el=document.getElementById('ws-live-banner'); if(!el) return;
  var live=scLiveSorted(scLiveAudience()).filter(function(s){ return scLiveStatus(s)==='live'; });
  if(!live.length){ el.innerHTML=''; el.style.display='none'; return; }
  var s=live[0];
  el.style.display='';
  el.innerHTML='<div class="scx-live-banner" onclick="scJoinLive(\''+scJs(s.id)+'\')">'
    +'<i class="ti ti-broadcast" style="font-size:24px;"></i><div style="flex:1;min-width:0;"><b>'+scEsc(s.title||'Live session')+'</b><br><span>Live now · tap to join on '+scEsc(scLivePlatform(s.link).label)+'</span></div>'
    +'<i class="ti ti-arrow-right" style="font-size:18px;"></i></div>';
}

// ══════════════════════════════════════════════════════════════
// ACTOR (who is doing this?) & PERMISSION GUARDS
// ══════════════════════════════════════════════════════════════
var _scSup=null; // {id,name,facilities:[codes]} when a supervisor is logged in
function scActor(){
  if(appMode==='sc-cho'){
    var nm=((scSubAdminData||{}).choName||'').trim();
    return {name:nm||('Facility Admin · '+scSubAdminCode),role:'Facility Admin',id:scSubAdminCode};
  }
  if(appMode==='sc-supervisor'&&_scSup) return {name:_scSup.name||_scSup.id,role:'Supervisor',id:_scSup.id};
  if(appMode==='sc-admin') return {name:'HealSol Admin',role:'HealSol',id:'healsol'};
  if(appMode==='cho') return {name:choState.staffName||choState.staffMobile||'Staff',role:choState.roleId||'Staff',id:choState.staffMobile};
  return {name:'Unknown',role:'—',id:''};
}
function scSupAllowed(code){ return !!(_scSup&&_scSup.facilities.indexOf(code)>=0); }
function scDeny(what){
  if(appMode==='sc-supervisor'){
    console.warn('[SC] Blocked for supervisor:',what);
    showToast('Supervisors have view-only access for this action.','err');
    return true;
  }
  return false;
}
// Can the current actor write corrective actions for this facility?
function scCanWriteFacility(code){
  if(appMode==='sc-admin') return false;   // HealSol views; the Supervisor (mentor) assigns corrective actions
  if(appMode==='sc-cho') return code===scSubAdminCode;
  if(appMode==='sc-supervisor') return scSupAllowed(code);
  return false;
}

// ══════════════════════════════════════════════════════════════
// READINESS + GAP REGISTER COMPONENT
// Mounted in: Facility Admin panel, HealSol drill-in, Supervisor drill-in.
// Firebase: sc_corrective/{code}/{id} = {gapKey:'mob|di|ci', ownerMob, di, ci, progId, cpText, aoc, me,
//   service, assignedTo, assignedToName, action, dueDate, status, assignedBy, assignedByRole, assignedAt,
//   updatedBy, updatedByRole, updatedAt, closedAt, closedBy}
// ══════════════════════════════════════════════════════════════
var _scIns={};
function scGapKey(mob,di,ci){ return mob+'|'+di+'|'+ci; }
function scActionForGap(actions,key){
  var best=null;
  Object.keys(actions||{}).forEach(function(id){
    var a=actions[id]; if(!a||a.gapKey!==key) return;
    var cand=Object.assign({id:id},a);
    var rk=function(x){ return x.status==='closed'?0:1; };
    if(!best||rk(cand)>rk(best)||(rk(cand)===rk(best)&&String(cand.assignedAt||'')>String(best.assignedAt||''))) best=cand;
  });
  return best;
}
function scGapStatus(g,act){
  if(g.closed) return 'closed';
  if(!act||act.status==='closed') return 'unassigned';
  if(act.dueDate&&act.dueDate<scTodayStr()) return 'overdue';
  return 'open';
}
async function scMountInsights(hostId,ctx){
  var host=document.getElementById(hostId); if(!host) return;
  if(appMode==='sc-supervisor'&&!scSupAllowed(ctx.code)){ host.innerHTML='<div class="scx-empty">Not assigned to this facility.</div>'; return; }
  host.innerHTML='<div class="scx-empty"><i class="ti ti-loader" style="animation:spin 1s linear infinite;"></i> Loading readiness…</div>';
  await scEnsureAdminEdits();
  var progress=ctx.progress; if(progress===undefined){ progress=await fbGet('sc_progress/'+ctx.code)||{}; }
  var actions=await fbGet('sc_corrective/'+ctx.code)||{};
  var prev=_scIns[hostId];
  var same=prev&&prev.code===ctx.code;
  var st={
    hostId:hostId, code:ctx.code, fac:ctx.fac||{}, progId:(ctx.fac||{}).progId||'nqas_12A', staff:ctx.staff||{},
    progress:progress, actions:actions, tab:same?prev.tab:(ctx.tab||'readiness'),
    filters:same?prev.filters:{status:'active',mob:'',role:'',aoc:'',service:'',q:''},
    selected:{}, limit:100
  };
  st.agg=scFacilityReadiness(st.progId,progress,st.staff);
  _scIns[hostId]=st;
  scInsRender(hostId);
}
function scInsRows(st){
  return st.agg.gaps.map(function(g){
    var key=scGapKey(g.mob,g.di,g.ci);
    var act=scActionForGap(st.actions,key);
    return {g:g,key:key,act:act,status:scGapStatus(g,act)};
  });
}
function scInsFiltered(st){
  var f=st.filters, q=(f.q||'').toLowerCase();
  return scInsRows(st).filter(function(r){
    if(f.status==='active'&&r.status==='closed') return false;
    if(f.status&&f.status!=='active'&&r.status!==f.status) return false;
    if(f.mob&&r.g.mob!==f.mob) return false;
    if(f.role&&r.g.role!==f.role) return false;
    if(f.aoc&&r.g.aoc!==f.aoc) return false;
    if(f.service&&r.g.service!==f.service) return false;
    if(q){
      var hay=[r.g.cp.t,r.g.cp.hi,r.g.staffName,r.g.cp.me,r.act&&r.act.action].join(' ').toLowerCase();
      if(hay.indexOf(q)<0) return false;
    }
    return true;
  }).sort(function(a,b){
    var rank={overdue:0,open:1,unassigned:2,closed:3};
    return (rank[a.status]-rank[b.status])||(a.g.di-b.g.di)||(a.g.ci-b.g.ci)||String(a.g.staffName).localeCompare(b.g.staffName);
  });
}
function scInsBar(label,b,mark){
  var p=b.pct, col=scPctColor(p);
  return '<div class="scx-bar"><div class="scx-bar-l" title="'+scEsc(label)+'">'+scEsc(label)+'</div>'
    +'<div class="scx-bar-bg"><div class="scx-bar-fill" style="width:'+p+'%;background:'+col+';"></div>'
    +(mark?'<div class="scx-bar-mark" style="left:'+mark+'%;" title="NQAS minimum '+mark+'%"></div>':'')+'</div>'
    +'<div class="scx-bar-p" style="color:'+scPctText(p)+';">'+p+'%</div><div class="scx-bar-x">'+b.xp+'/'+b.max+' pts</div></div>';
}
function scNqasBoxHTML(agg){
  var n=agg.nqas;
  if(!n.hasData) return '<div class="scx-nqas na"><b>NQAS threshold: no data yet</b><br>Readiness appears once staff mark day cards as done.</div>';
  if(n.meets) return '<div class="scx-nqas ok"><b>✓ Meets NQAS threshold</b><br>Overall '+agg.pct+'% (≥'+SC_NQAS_OVERALL+'%) and every Area of Concern ≥'+SC_NQAS_AOC+'%.</div>';
  var why=[];
  if(!n.overallOk) why.push('Overall '+agg.pct+'% is below '+SC_NQAS_OVERALL+'%');
  if(n.aocFails.length) why.push('Below '+SC_NQAS_AOC+'%: '+n.aocFails.map(function(a){return 'AoC '+a+' ('+agg.byAoc[a].pct+'%)';}).join(', '));
  return '<div class="scx-nqas no"><b>✗ Not yet at NQAS threshold</b><br>'+scEsc(why.join(' · '))+'</div>';
}
function scInsRender(hostId){
  var st=_scIns[hostId]; if(!st) return;
  var host=document.getElementById(hostId); if(!host) return;
  var rows=scInsRows(st);
  var openCnt=rows.filter(function(r){return r.status!=='closed';}).length;
  var overdueCnt=rows.filter(function(r){return r.status==='overdue';}).length;
  var tabs='<div class="scx-tabs">'
    +['readiness','staff','gaps'].map(function(tb){
      var lbl=tb==='readiness'?'📊 Readiness':tb==='staff'?'👥 By Staff':'📌 Gap Register ('+openCnt+(overdueCnt?' · '+overdueCnt+' overdue':'')+')';
      return '<button class="scx-tab'+(st.tab===tb?' on':'')+'" onclick="scInsTab(\''+scJs(hostId)+'\',\''+tb+'\')">'+lbl+'</button>';
    }).join('')+'</div>';
  var body='';
  if(st.tab==='readiness') body=scInsReadinessHTML(st,openCnt,overdueCnt);
  else if(st.tab==='staff') body=scInsStaffHTML(st);
  else body=scInsGapsHTML(st);
  host.innerHTML=tabs+body;
}
function scInsTab(hostId,tab){ var st=_scIns[hostId]; if(!st) return; st.tab=tab; scInsRender(hostId); }
function scInsReadinessHTML(st,openCnt,overdueCnt){
  var a=st.agg;
  var html='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:8px;">Package: <span style="color:var(--teal-dk);font-weight:900;">'+scEsc(scPkgLabel(st.progId))+'</span></div>'
    +'<div class="scx-tiles">'
    +'<div class="scx-tile"><div class="scx-tile-v" style="color:'+scPctText(a.pct)+';">'+a.pct+'%</div><div class="scx-tile-l">Package readiness</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v">'+a.daysDone+'</div><div class="scx-tile-l">Day cards done</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v">'+a.daysVerified+'</div><div class="scx-tile-l">Verified</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v" style="color:var(--amber-dk);">'+openCnt+'</div><div class="scx-tile-l">Open gaps</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v" style="color:'+(overdueCnt?'var(--red-dk)':'var(--t3)')+';">'+overdueCnt+'</div><div class="scx-tile-l">Overdue actions</div></div>'
    +'</div>'+scNqasBoxHTML(a);
  var aocs=SC_AOC_KEYS.filter(function(k){return a.byAoc[k]&&a.byAoc[k].max>0;});
  html+='<div class="scx-sub">By Area of Concern</div>';
  html+=aocs.length?aocs.map(function(k){ return scInsBar('AoC '+k+' · '+SC_AOC_NAMES[k],a.byAoc[k],SC_NQAS_AOC); }).join(''):'<div class="scx-empty">No scored checkpoints yet.</div>';
  var svcs=Object.keys(a.byService).filter(function(k){return a.byService[k].max>0;});
  if(svcs.length){
    html+='<div class="scx-sub">By Service</div>';
    var order=(typeof SERVICES!=='undefined'?SERVICES.map(function(s){return s.name;}):[]);
    svcs.sort(function(x,y){ var ix=order.indexOf(x), iy=order.indexOf(y); return (ix<0?99:ix)-(iy<0?99:iy); });
    html+=svcs.map(function(k){ return scInsBar(k,a.byService[k]); }).join('');
  }
  return html;
}
function scInsStaffHTML(st){
  var a=st.agg;
  if(!a.staff.length) return '<div class="scx-empty">No staff registered yet.</div>';
  var rows=scInsRows(st);
  return a.staff.map(function(s){
    var r=s.res, openG=rows.filter(function(x){return x.g.mob===s.mob&&x.status!=='closed';}).length;
    var od=rows.filter(function(x){return x.g.mob===s.mob&&x.status==='overdue';}).length;
    var rd=typeof getScRole==='function'?getScRole(s.role):null;
    return '<div class="scx-staff" onclick="scInsStaffGaps(\''+scJs(st.hostId)+'\',\''+scJs(s.mob)+'\')" title="Show this person\'s gaps">'
      +'<div class="scx-av">'+scEsc(String(s.name||'?').charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(s.name)+(s.inRoster?'':' <span style="font-size:9px;color:var(--t3);">(removed)</span>')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">'+scEsc(rd&&rd.label?rd.label:s.role)+' · '+r.daysDone+'/'+r.totalDays+' days done · '+r.daysVerified+' verified · '+openG+' open gap'+(openG===1?'':'s')+(od?' · <span style="color:var(--red-dk);">'+od+' overdue</span>':'')+'</div>'
      +'<div class="scx-bar-bg" style="margin-top:5px;"><div class="scx-bar-fill" style="width:'+r.pct+'%;background:'+scPctColor(r.pct)+';"></div></div></div>'
      +'<div style="font-size:15px;font-weight:900;color:'+scPctText(r.pct)+';width:44px;text-align:right;">'+r.pct+'%</div></div>';
  }).join('');
}
function scInsStaffGaps(hostId,mob){
  var st=_scIns[hostId]; if(!st) return;
  st.filters=Object.assign({},st.filters,{mob:mob,status:'active'}); st.tab='gaps'; st.selected={}; scInsRender(hostId);
}
function scInsGapsHTML(st){
  var f=st.filters, H=scJs(st.hostId);
  var staffOpts=st.agg.staff.map(function(s){ return '<option value="'+scEsc(s.mob)+'"'+(f.mob===s.mob?' selected':'')+'>'+scEsc(s.name)+'</option>'; }).join('');
  var roles={}; st.agg.staff.forEach(function(s){ roles[s.role]=1; });
  var roleOpts=Object.keys(roles).sort().map(function(r){ return '<option'+(f.role===r?' selected':'')+'>'+scEsc(r)+'</option>'; }).join('');
  var aocOpts=SC_AOC_KEYS.map(function(k){ return '<option value="'+k+'"'+(f.aoc===k?' selected':'')+'>AoC '+k+'</option>'; }).join('');
  var svcs={}; st.agg.gaps.forEach(function(g){ svcs[g.service]=1; });
  var svcOpts=Object.keys(svcs).sort().map(function(s){ return '<option'+(f.service===s?' selected':'')+'>'+scEsc(s)+'</option>'; }).join('');
  var statusOpts=[['active','All open gaps'],['unassigned','Unassigned'],['open','Action assigned'],['overdue','Overdue'],['closed','Closed'],['','Everything']]
    .map(function(o){ return '<option value="'+o[0]+'"'+(f.status===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('');
  var list=scInsFiltered(st);
  var canWrite=scCanWriteFacility(st.code);
  var selKeys=Object.keys(st.selected).filter(function(k){return st.selected[k];});
  var html='<div class="scx-filters">'
    +'<select onchange="scInsFilter(\''+H+'\',\'status\',this.value)">'+statusOpts+'</select>'
    +'<select onchange="scInsFilter(\''+H+'\',\'mob\',this.value)"><option value="">All staff</option>'+staffOpts+'</select>'
    +'<select onchange="scInsFilter(\''+H+'\',\'role\',this.value)"><option value="">All roles</option>'+roleOpts+'</select>'
    +'<select onchange="scInsFilter(\''+H+'\',\'aoc\',this.value)"><option value="">All AoC</option>'+aocOpts+'</select>'
    +'<select onchange="scInsFilter(\''+H+'\',\'service\',this.value)"><option value="">All services</option>'+svcOpts+'</select>'
    +'<input type="search" placeholder="Search checkpoint, staff, action…" value="'+scEsc(f.q)+'" onchange="scInsFilter(\''+H+'\',\'q\',this.value)"/>'
    +'</div>';
  html+='<div class="scx-bulk"><span class="cnt">'+list.length+' gap'+(list.length===1?'':'s')+' shown'+(selKeys.length?' · '+selKeys.length+' selected':'')+'</span>'
    +(canWrite?'<button class="scx-btn sm ghost" onclick="scInsSelectAll(\''+H+'\')"><i class="ti ti-checks"></i> '+(selKeys.length?'Clear selection':'Select shown')+'</button>'
      +'<button class="scx-btn sm" '+(selKeys.length?'':'disabled')+' onclick="scInsBulkAssign(\''+H+'\')"><i class="ti ti-user-check"></i> Assign selected</button>':'')
    +'<button class="scx-btn sm ghost" onclick="scInsExportCsv(\''+H+'\')"><i class="ti ti-download"></i> CSV</button></div>';
  if(!list.length){ return html+'<div class="scx-empty">'+(st.agg.gaps.length?'No gaps match these filters.':'🎉 No gaps recorded — every scored checkpoint is at Full compliance.')+'</div>'; }
  var today=scTodayStr();
  html+=list.slice(0,st.limit).map(function(r){
    var g=r.g, a=r.act, cls=r.status==='overdue'?' overdue':r.status==='closed'?' closed':'';
    var K=scJs(r.key);
    var stLbl={unassigned:'Unassigned',open:'Action assigned',overdue:'Overdue',closed:'Closed'}[r.status];
    var score=g.closed?('Was '+(g.score===0?'Zero':g.score===1?'Half':'—')+' → Full'):(g.score===0?'Zero (0/2)':'Half (1/2)');
    var attempts=(g.attempts||[]).length;
    var actHTML='';
    if(a&&a.status!=='closed'||a&&g.closed){
      var due=a.dueDate?('Due '+scFmtDate(a.dueDate)+(r.status==='overdue'?' · <b style="color:var(--red-dk);">'+Math.max(1,Math.round((Date.parse(today)-Date.parse(a.dueDate))/86400000))+'d overdue</b>':'')):'No due date';
      actHTML='<div class="scx-gap-act"><b>Action:</b> '+scEsc(a.action)
        +'<div style="font-size:10px;color:var(--t3);font-weight:700;margin-top:3px;">→ '+scEsc(a.assignedToName||a.assignedTo||'—')+' · '+due
        +' · Assigned by '+scEsc(a.assignedBy||'—')+(a.assignedByRole?' ('+scEsc(a.assignedByRole)+')':'')
        +(a.updatedBy&&a.updatedBy!==a.assignedBy?' · edited by '+scEsc(a.updatedBy)+(a.updatedByRole?' ('+scEsc(a.updatedByRole)+')':''):'')
        +(g.closed&&g.closedAt?' · closed '+scFmtDate(g.closedAt):'')+'</div></div>';
    }
    var btns='';
    if(canWrite&&!g.closed){
      btns='<div class="scx-gap-btns">'
        +(a&&a.status!=='closed'
          ?'<button class="scx-btn sm ghost" onclick="scInsAssign(\''+H+'\',[\''+K+'\'])"><i class="ti ti-pencil"></i> Edit action</button>'
           +'<button class="scx-btn sm danger" onclick="scInsRemove(\''+H+'\',\''+K+'\')"><i class="ti ti-trash"></i> Remove</button>'
          :'<button class="scx-btn sm" onclick="scInsAssign(\''+H+'\',[\''+K+'\'])"><i class="ti ti-user-check"></i> Assign action</button>')
        +'</div>';
    }
    return '<div class="scx-gap'+cls+'">'
      +(canWrite&&!g.closed?'<input type="checkbox" '+(st.selected[r.key]?'checked':'')+' onchange="scInsToggle(\''+H+'\',\''+K+'\',this.checked)"/>':'<span style="width:15px;flex-shrink:0;"></span>')
      +'<div class="scx-gap-body"><div class="scx-gap-top"><span class="scx-st '+r.status+'">'+stLbl+'</span>'
      +'<span class="scx-gap-meta">'+scEsc(g.staffName)+' ('+scEsc(g.role)+') · Day '+String(g.day.day||g.di+1).padStart(2,'0')+' · AoC '+scEsc(g.aoc)+(g.cp.me?' · '+scEsc(g.cp.me):'')+'</span></div>'
      +'<div class="scx-gap-cp">'+scEsc(g.cp.t)+'</div>'
      +'<div class="scx-gap-meta">'+scEsc(g.service)+' · '+score+(attempts?' · '+attempts+' re-attempt'+(attempts===1?'':'s'):'')+'</div>'
      +actHTML+btns+'</div></div>';
  }).join('');
  if(list.length>st.limit) html+='<button class="scx-btn ghost" style="width:100%;" onclick="scInsMore(\''+H+'\')">Show more ('+(list.length-st.limit)+' remaining)</button>';
  return html;
}
function scInsFilter(hostId,key,val){ var st=_scIns[hostId]; if(!st) return; st.filters[key]=val; st.selected={}; st.limit=100; scInsRender(hostId); }
function scInsToggle(hostId,key,on){ var st=_scIns[hostId]; if(!st) return; st.selected[key]=!!on; scInsRender(hostId); }
function scInsMore(hostId){ var st=_scIns[hostId]; if(!st) return; st.limit+=100; scInsRender(hostId); }
function scInsSelectAll(hostId){
  var st=_scIns[hostId]; if(!st) return;
  var any=Object.keys(st.selected).some(function(k){return st.selected[k];});
  st.selected={};
  if(!any) scInsFiltered(st).slice(0,st.limit).forEach(function(r){ if(!r.g.closed) st.selected[r.key]=true; });
  scInsRender(hostId);
}
function scInsBulkAssign(hostId){
  var st=_scIns[hostId]; if(!st) return;
  var keys=Object.keys(st.selected).filter(function(k){return st.selected[k];});
  if(keys.length) scInsAssign(hostId,keys);
}
async function scInsAssign(hostId,keys){
  var st=_scIns[hostId]; if(!st||!keys||!keys.length) return;
  if(!scCanWriteFacility(st.code)){ showToast('You cannot assign actions for this facility.','err'); return; }
  var rowsByKey={}; scInsRows(st).forEach(function(r){ rowsByKey[r.key]=r; });
  var rows=keys.map(function(k){return rowsByKey[k];}).filter(function(r){return r&&!r.g.closed;});
  if(!rows.length){ showToast('Those gaps are already closed.','err'); return; }
  var single=rows.length===1?rows[0]:null;
  var existing=single&&single.act&&single.act.status!=='closed'?single.act:null;
  var withAct=rows.filter(function(r){return r.act&&r.act.status!=='closed';}).length;
  var staffOpts=[{value:'__owner',label:single?'Gap owner — '+single.g.staffName:"Each gap's owner (the staff who scored it)"}]
    .concat(st.agg.staff.filter(function(s){return s.inRoster;}).map(function(s){return {value:s.mob,label:s.name+' ('+s.role+')'};}));
  var assignee=existing?(existing.assignedTo===existing.ownerMob?'__owner':existing.assignedTo):'__owner';
  var v=await scDialog({
    title:existing?'Edit corrective action':(single?'Assign corrective action':'Assign to '+rows.length+' gaps'),
    icon:'📌', wide:true, okLabel:existing?'Save changes':'Assign',
    message:single?('Day '+(single.g.di+1)+' · '+single.g.staffName+'\n'+single.g.cp.t)
      :(rows.length+' gaps selected'+(withAct?' — '+withAct+' already have an action and will be updated.':'.')),
    fields:[
      {key:'action',label:'Corrective action',type:'textarea',required:true,value:existing?existing.action:'',placeholder:'What needs to be done to reach Full compliance?',maxLength:600},
      {key:'dueDate',label:'Due date',type:'date',required:true,value:existing&&existing.dueDate?existing.dueDate:scAddDays(scTodayStr(),7)},
      {key:'assignee',label:'Assign to',type:'select',value:assignee,options:staffOpts}
    ]
  });
  if(!v) return;
  var actor=scActor(), now=scNowIso(), writes=[];
  rows.forEach(function(r){
    var g=r.g, ownerMob=g.mob;
    var toMob=v.assignee==='__owner'?ownerMob:v.assignee;
    var toStaff=st.staff[toMob]||{};
    var prevAct=r.act&&r.act.status!=='closed'?r.act:null;
    var id=prevAct?prevAct.id:scUid('ca');
    var rec=prevAct?Object.assign({},prevAct):{
      gapKey:r.key, ownerMob:ownerMob, di:g.di, ci:g.ci, progId:st.progId,
      assignedBy:actor.name, assignedByRole:actor.role, assignedAt:now, status:'open'
    };
    delete rec.id;
    Object.assign(rec,{
      cpText:g.cp.t||'', aoc:g.aoc, me:g.cp.me||'', service:g.service, ownerName:g.staffName,
      action:v.action, dueDate:v.dueDate, assignedTo:toMob, assignedToName:toStaff.name||(toMob===ownerMob?g.staffName:toMob)
    });
    if(prevAct){ rec.updatedBy=actor.name; rec.updatedByRole=actor.role; rec.updatedAt=now; }
    writes.push({id:id,rec:scClean(rec)});
  });
  var upd={}; writes.forEach(function(w){ upd[w.id]=w.rec; });
  var ok=false;
  try{ await db.ref('sc_corrective/'+st.code).update(upd); ok=true; }catch(e){ console.error(e); }
  if(!ok){ showToast('Could not save — check connection.','err'); return; }
  writes.forEach(function(w){ st.actions[w.id]=w.rec; });
  st.selected={}; scInsRender(hostId);
  showToast(writes.length===1?(existing?'Action updated.':'Action assigned.'):writes.length+' actions saved.','ok');
}
async function scInsRemove(hostId,key){
  var st=_scIns[hostId]; if(!st) return;
  if(!scCanWriteFacility(st.code)){ showToast('You cannot change actions for this facility.','err'); return; }
  var act=scActionForGap(st.actions,key); if(!act) return;
  var ok=await showConfirm('Remove this corrective action? The gap stays open and can be re-assigned.','🗑️','Remove Action','Remove','var(--red)');
  if(!ok) return;
  try{ await db.ref('sc_corrective/'+st.code+'/'+act.id).remove(); }catch(e){ showToast('Remove failed: '+e.message,'err'); return; }
  delete st.actions[act.id]; scInsRender(hostId); showToast('Action removed.','ok');
}
function scInsExportCsv(hostId){
  var st=_scIns[hostId]; if(!st) return;
  var list=scInsFiltered(st);
  var head=['Facility Code','Facility','Package','Staff','Mobile','Role','Day','AoC','ME','Service','Checkpoint','Score','Re-attempts','Status','Corrective Action','Assigned To','Due Date','Overdue','Assigned By','Assigned By Role','Assigned At','Edited By','Closed At'];
  var q=function(v){ v=v==null?'':String(v); return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; };
  var lines=[head.map(q).join(',')];
  list.forEach(function(r){
    var g=r.g,a=r.act||{};
    lines.push([st.code,st.fac.name||st.code,scPkgShort(st.progId),g.staffName,g.mob,g.role,g.di+1,g.aoc,g.cp.me||'',g.service,g.cp.t,
      g.closed?'Closed at Full':(g.score===0?'Zero':'Half'),(g.attempts||[]).length,r.status,a.action||'',a.assignedToName||'',a.dueDate||'',
      r.status==='overdue'?'Yes':'',a.assignedBy||'',a.assignedByRole||'',a.assignedAt||'',a.updatedBy||'',g.closedAt||''].map(q).join(','));
  });
  var blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
  var url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url; a.download='gap-register_'+st.code+'_'+scTodayStr()+'.csv';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function(){ URL.revokeObjectURL(url); },2000);
  showToast('Exported '+list.length+' rows.','ok');
}

// ══════════════════════════════════════════════════════════════
// STAFF SIDE — corrective actions on Welcome screen + 📌 in cards
// ══════════════════════════════════════════════════════════════
var _scAllActions={};
async function scLoadMyActions(){
  _scAllActions={};
  if(!db||!choState.facilityCode) return;
  try{ _scAllActions=await fbGet('sc_corrective/'+choState.facilityCode)||{}; }catch(e){}
}
function scLocalGapClosed(di,ci){
  var c=choState.cards[di]; if(!c) return false;
  var gr=c.gapRetries&&c.gapRetries[ci]; if(gr&&gr.closed) return true;
  return scNormScore(c.cpScores?c.cpScores[ci]:null)===2;
}
function scMyOpenActions(){
  var me=choState.staffMobile;
  return Object.keys(_scAllActions||{}).map(function(id){ return Object.assign({id:id},_scAllActions[id]); })
    .filter(function(a){
      if(a.status==='closed') return false;
      if(a.progId&&a.progId!==choState.progId) return false;
      if(a.assignedTo!==me&&a.ownerMob!==me) return false;
      if(a.ownerMob===me&&scLocalGapClosed(a.di,a.ci)) return false;
      return true;
    })
    .sort(function(a,b){ return String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')); });
}
function scMyActionFor(di,ci){
  var key=scGapKey(choState.staffMobile,di,ci);
  var list=scMyOpenActions().filter(function(a){ return a.gapKey===key; });
  return list[0]||null;
}
function scRenderWsActions(){
  var el=document.getElementById('ws-actions-section'); if(!el) return;
  var list=scMyOpenActions();
  if(!list.length){ el.innerHTML=''; el.style.display='none'; return; }
  var today=scTodayStr();
  el.style.display='';
  el.innerHTML='<div class="scx-act-sec"><div class="scx-act-hd">📌 '+scEsc(t('Corrective Actions'))+' ('+list.length+')</div>'
    +list.map(function(a){
      var od=a.dueDate&&a.dueDate<today;
      var mine=a.ownerMob===choState.staffMobile;
      var d=scDayDef(choState.progId,a.di)||{};
      var cp=(d.cps||[])[a.ci]||{t:a.cpText};
      return '<div class="scx-act-card'+(od?' overdue':'')+'">'
        +'<div class="scx-act-meta">Day '+String(d.day||a.di+1).padStart(2,'0')+' · AoC '+scEsc(a.aoc||'—')+(a.me?' · '+scEsc(a.me):'')+(mine?'':' · for '+scEsc(a.ownerName||a.ownerMob))+'</div>'
        +'<div class="scx-act-cp">'+scEsc(getCPText(cp)||a.cpText)+'</div>'
        +'<div class="scx-act-text">'+scEsc(a.action)+'</div>'
        +'<div class="scx-act-meta">'+(a.dueDate?'Due '+scFmtDate(a.dueDate)+(od?' · <b style="color:var(--red-dk);">Overdue</b>':''):'No due date')
        +' · Assigned by '+scEsc(a.assignedBy||'—')+(a.assignedByRole?' ('+scEsc(a.assignedByRole)+')':'')+'</div>'
        +(mine?'<button class="scx-btn sm" style="margin-top:8px;" onclick="scOpenActionCard('+(+a.di)+')"><i class="ti ti-arrow-right"></i> Open Day '+(+a.di+1)+' card</button>':'')
        +'</div>';
    }).join('')+'</div>';
}
function scOpenActionCard(di){
  wsMarkSeen();
  $('welcome-screen').classList.remove('vis');
  showCHOMain();
  switchView('cards');
  selectDay(di+1);
  setTimeout(function(){ var g=document.querySelector('.gap-section'); if(g) g.scrollIntoView({behavior:'smooth',block:'center'}); },200);
}
async function scCloseActionsForGap(di,ci){
  var key=scGapKey(choState.staffMobile,di,ci), now=scNowIso(), by=choState.staffName||choState.staffMobile;
  var ids=Object.keys(_scAllActions||{}).filter(function(id){ var a=_scAllActions[id]; return a&&a.gapKey===key&&a.status!=='closed'; });
  for(var i=0;i<ids.length;i++){
    var a=_scAllActions[ids[i]];
    a.status='closed'; a.closedAt=now; a.closedBy=by;
    try{ await db.ref('sc_corrective/'+choState.facilityCode+'/'+ids[i]).update({status:'closed',closedAt:now,closedBy:by}); }catch(e){}
  }
}
// Gap re-attempt: unlimited attempts; the gap closes ONLY at Full compliance.
async function gapRetry(di,ci){
  var c=getCHOCard(di); var d=getDay(di); var cp=d.cps[ci];
  if(!cp||!c.taskDone) return;
  if(!scMyCp(di,ci)){ showToast(t('This checkpoint is assigned to other staff.'),'err'); return; }
  var cur=scNormScore(c.cpScores[ci]); if(cur===2) return;
  var act=scMyActionFor(di,ci);
  var v=await scChoice({
    title:t('Re-attempt')+' — Day '+(di+1), icon:'🔁',
    message:getCPText(cp)+(act?'\n\n📌 Action: '+act.action:'')+'\n\nScore your re-attempt. The gap closes only at Full compliance — you can re-attempt as many times as you need.',
    choices:[{value:2,label:t('Full')+' ✓',color:'#16A34A'},{value:1,label:t('Half')+' ½',color:'#D97706'},{value:0,label:t('Zero')+' ✗',color:'#DC2626'}]
  });
  if(v===null||v===undefined) return;
  if(!c.gapRetries) c.gapRetries={};
  var gr=c.gapRetries[ci]||{orig:cur,attempts:[]};
  if(!Array.isArray(gr.attempts)) gr.attempts=scAsList(gr.attempts);
  if(gr.orig==null) gr.orig=cur;
  var now=scNowIso();
  gr.attempts.push({score:v,at:now,by:choState.staffName||choState.staffMobile});
  gr.score=v; gr.lastAt=now;
  if(v===2){
    gr.closed=true; gr.closedAt=now; gr.verified=true;
    c.cpScores[ci]=2; c.gapRetries[ci]=gr; c.score=getDayScore(di);
    await scCloseActionsForGap(di,ci);
    showToast('Gap closed at Full compliance ✓','ok'); launchConfetti();
  } else {
    c.gapRetries[ci]=gr;
    showToast('Re-attempt recorded ('+(v===1?'Half':'Zero')+'). The gap stays open until Full compliance.','');
  }
  saveCHOState(); buildDaySelector(); renderCard(di);
  if(choState.view==='board') buildBoard();
}
function gapReVerify(di,ci){ return gapRetry(di,ci); } // legacy button name

// ══════════════════════════════════════════════════════════════
// SUPERVISOR ROLE
// Firebase: sc_supervisors/{id} = {name, password, facilities:{CODE:true}, disabled, createdAt, createdBy}
// ══════════════════════════════════════════════════════════════
function scSupKey(id){ return String(id||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,''); }
async function scSupervisorLogin(){
  var idRaw=(document.getElementById('sc-sup-id')||{}).value||'';
  var pwd=((document.getElementById('sc-sup-pwd')||{}).value||'').trim();
  var err=document.getElementById('sc-sup-err');
  var key=scSupKey(idRaw);
  var fail=function(m){ if(err){ err.textContent=m; err.classList.add('show'); } };
  if(!key) return fail('Please enter your Supervisor ID.');
  if(!pwd) return fail('Please enter your password.');
  if(err) err.classList.remove('show');
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,1000);}); }
  var sup=null;
  try{ sup=await fbGet('sc_supervisors/'+key); }catch(e){}
  if(!sup) return fail('Supervisor ID not found. Contact HealSol Academy.');
  if(sup.disabled) return fail('This supervisor account is disabled. Contact HealSol Academy.');
  if(!nfAuthOK('supervisor',key) && pwd!==sup.password) return fail('Incorrect password.');
  var p=document.getElementById('sc-sup-pwd'); if(p) p.value='';
  await scStartSupervisorApp(key,sup);
}
function scSupFacilityList(sup){ var f=(sup&&sup.facilities)||{}; return Object.keys(f).filter(function(k){return f[k];}); }
async function scStartSupervisorApp(key,sup){
  appMode='sc-supervisor';
  _scSup={id:key,name:sup.name||key,facilities:scSupFacilityList(sup)};
  document.getElementById('login-screen').style.display='none';
  var app=document.getElementById('admin-app');
  app.classList.add('vis'); app.classList.add('scx-sup');
  scSetDashboardChrome();
  var grid=document.getElementById('sc-master-grid');
  if(grid) grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--t3);"><i class="ti ti-loader" style="animation:spin 1s linear infinite;font-size:24px;display:block;margin-bottom:10px;"></i>Loading your facilities…</div>';
  await scEnsureAdminEdits(true);
  await scLoadMasterData();
  scRenderMasterDashboard();
}
function scSetDashboardChrome(){
  var sup=appMode==='sc-supervisor';
  var set=function(id,txt){ var el=document.getElementById(id); if(el) el.textContent=txt; };
  set('sc-nav-title',sup?'Supervisor Dashboard':'Admin Dashboard');
  set('sc-nav-badge-text',sup?'Supervisor':'Admin');
  set('sc-master-heading',sup?('Supervisor Dashboard — '+(_scSup.name||_scSup.id)):'HealSol Master Dashboard — SC');
  set('sc-master-subheading',sup?(_scSup.facilities.length+' assigned facilit'+(_scSup.facilities.length===1?'y':'ies')+' · readiness · review & action plan'):'All enrolled Sub-Centre facilities · readiness · staff · reports');
  set('sc-master-total-lbl',sup?'Assigned facilities':'Facilities enrolled');
}

// Master data — supervisors only ever load their assigned facilities (Refresh included).
var _scSupervisors={};
async function scLoadMasterData(){
  if(appMode==='sc-supervisor'){
    if(!_scSup){ scMasterFacilities={}; scMasterProgress={}; return; }
    var sup=await fbGet('sc_supervisors/'+_scSup.id);
    if(!sup||sup.disabled){
      _scSup.facilities=[]; scMasterFacilities={}; scMasterProgress={};
      showToast('Your supervisor access has been changed. Please contact HealSol Academy.','err');
      return;
    }
    _scSup.name=sup.name||_scSup.id; _scSup.facilities=scSupFacilityList(sup);
    var facs={}, prog={};
    for(var i=0;i<_scSup.facilities.length;i++){
      var code=_scSup.facilities[i];
      var f=await fbGet(scFacilityPath(code));
      if(f){ facs[code]=f; prog[code]=await fbGet('sc_progress/'+code)||{}; }
    }
    scMasterFacilities=facs; scMasterProgress=prog;
    scSetDashboardChrome();
    return;
  }
  scMasterFacilities=await fbGet('sc_facilities')||{};
  scMasterProgress=await fbGet('sc_progress')||{};
  if(appMode==='sc-admin') _scSupervisors=await fbGet('sc_supervisors')||{};
}
function scVisibleFacilityCodes(){
  var codes=Object.keys(scMasterFacilities||{});
  if(appMode==='sc-supervisor') codes=codes.filter(scSupAllowed); // second layer: never render unassigned
  return codes;
}
function scRefreshDashboard(){
  return scLoadMasterData().then(function(){
    scRenderMasterDashboard();
    var panel=document.getElementById('sc-drill-panel');
    var code=(document.getElementById('sc-drill-code')||{}).textContent;
    if(panel&&panel.style.display!=='none'&&code){
      if(scVisibleFacilityCodes().indexOf(code)>=0) scDrillIn(code); else scDrillBack();
    }
  });
}

function scRenderMasterDashboard(){
  var grid=document.getElementById('sc-master-grid'); if(!grid) return;
  var isSup=appMode==='sc-supervisor';
  if(!isSup){
    if(typeof adminRenderPricingPanel==='function') adminRenderPricingPanel();
    if(typeof renderDemoFacilitiesPanel==='function') renderDemoFacilitiesPanel();
    if(typeof renderLeadsPanel==='function') renderLeadsPanel();
    scRenderSupervisorAdmin();
  }
  var codes=scVisibleFacilityCodes();
  var demoCount=codes.filter(function(c){ var f=scMasterFacilities[c]; return f&&f.isDemo&&f.subscriptionStatus!=='paid'; }).length;
  var demoEl=document.getElementById('master-demo-count'); if(demoEl) demoEl.textContent=demoCount;
  document.getElementById('sc-master-total').textContent=codes.length;
  var totalPct=0,cnt=0, pkgAgg={};
  var cards=codes.map(function(code){
    var fac=scMasterFacilities[code]||{};
    var agg=scFacAggFor(code);
    if(agg.max>0){ totalPct+=agg.pct; cnt++; }
    var pk=fac.progId||'nqas_12A';
    var pa=pkgAgg[pk]||(pkgAgg[pk]={n:0,xp:0,max:0,meets:0,withData:0});
    pa.n++; pa.xp+=agg.xp; pa.max+=agg.max; if(agg.max>0){ pa.withData++; if(agg.nqas.meets) pa.meets++; }
    return {code:code,fac:fac,agg:agg};
  });
  document.getElementById('sc-master-avg').textContent=cnt>0?Math.round(totalPct/cnt)+'%':'—';
  // Readiness by package
  var strip=document.getElementById('sc-pkg-strip');
  if(strip){
    strip.innerHTML=PROGRAMS.map(function(p){
      var pa=pkgAgg[p.id]; if(!pa) return '<div class="scx-pkg" style="opacity:0.55;"><div class="scx-pkg-n">'+p.icon+' '+scEsc(scPkgShort(p.id))+' · '+scEsc(p.name)+'</div><div class="scx-pkg-v" style="color:var(--t3);">—</div><div class="scx-pkg-s">No facilities</div></div>';
      var pct=pa.max>0?Math.round(pa.xp/pa.max*100):0;
      return '<div class="scx-pkg"><div class="scx-pkg-n">'+p.icon+' '+scEsc(scPkgShort(p.id))+' · '+scEsc(p.name)+'</div>'
        +'<div class="scx-pkg-v" style="color:'+(pa.max?scPctText(pct):'var(--t3)')+';">'+(pa.max?pct+'%':'—')+'</div>'
        +'<div class="scx-pkg-s">'+pa.n+' facilit'+(pa.n===1?'y':'ies')+' · '+pa.meets+'/'+pa.withData+' at NQAS threshold</div></div>';
    }).join('');
  }
  grid.innerHTML='';
  if(!cards.length){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:32px;color:var(--t3);font-size:13px;">'
      +(isSup?'No facilities have been assigned to you yet. Contact HealSol Academy.':'No facilities enrolled yet. Add a facility below.')+'</div>';
    return;
  }
  cards.forEach(function(it){
    var code=it.code, fac=it.fac, agg=it.agg, pct=agg.pct, C=scJs(code);
    var barCol=fac.suspended?'var(--grey-dk)':scPctColor(pct);
    var staffCount=Object.keys(fac.staff||{}).length;
    var nq=agg.max>0?(agg.nqas.meets?'<span class="scx-nq-badge ok">NQAS ✓</span>':'<span class="scx-nq-badge no">Below NQAS</span>'):'';
    var card=document.createElement('div'); card.className='master-fac-card';
    card.style.opacity=fac.suspended?'0.7':'1';
    var adminBtns=isSup?'':(
      '<button class="mfc-btn mfc-btn-report" title="Set start date" onclick="scAdminSetDate(\''+C+'\')"><i class="ti ti-calendar" style="font-size:11px;"></i></button>'
      +'<button class="mfc-btn mfc-btn-report" title="Edit facility" onclick="scEditFacility(\''+C+'\')"><i class="ti ti-pencil" style="font-size:11px;"></i></button>'
      +'<button class="mfc-btn" title="'+(fac.suspended?'Reactivate':'Suspend')+'" onclick="scSuspendFacility(\''+C+'\')" style="border-color:'+(fac.suspended?'var(--green)':'var(--amber)')+';color:'+(fac.suspended?'var(--green-dk)':'var(--amber-dk)')+';">'
        +(fac.suspended?'<i class="ti ti-player-play" style="font-size:11px;"></i>':'<i class="ti ti-player-pause" style="font-size:11px;"></i>')+'</button>'
      +'<button class="mfc-btn" title="Cancel" onclick="scCancelFacility(\''+C+'\')" style="border-color:var(--red);color:var(--red-dk);"><i class="ti ti-trash" style="font-size:11px;"></i></button>');
    card.innerHTML='<div class="mfc-top"><div class="mfc-icon">🏥</div><div style="flex:1;min-width:0;">'
      +'<div class="mfc-name">'+scEsc(fac.name||code)
      +(fac.suspended?' <span style="background:#FEF3C7;color:#92400E;border-radius:8px;padding:1px 6px;font-size:8px;font-weight:800;">Suspended</span>':'')
      +(fac.isDemo?' <span style="background:#DBEAFE;color:#1D4ED8;border-radius:8px;padding:1px 6px;font-size:8px;font-weight:800;">'+(fac.subscriptionStatus==='paid'?'SELF-REGISTERED · PAID':'FREE TRIAL')+'</span>':'')
      +((!fac.isDemo&&fac.subscriptionStatus==='contract')?' <span style="background:#EDE9FE;color:#6D28D9;border-radius:8px;padding:1px 6px;font-size:8px;font-weight:800;">Contract</span>':'')
      +nq+'</div>'
      +'<div class="mfc-loc">'+scEsc([fac.district,fac.state].filter(Boolean).join(', ')||'—')+nfProBadge(fac)+'</div>'
      +'<div style="font-size:9px;color:var(--teal);font-weight:700;margin-top:1px;">📋 '+scEsc(scPkgShort(fac.progId))+' · 👥 '+staffCount+' staff · '+agg.gaps.filter(function(g){return !g.closed;}).length+' open gaps</div>'
      +'</div><div class="mfc-pct" style="color:'+barCol+';">'+(agg.max>0?pct+'%':'—')+'</div></div>'
      +'<div style="height:6px;border-radius:10px;background:var(--br);margin:7px 0;overflow:hidden;"><div style="height:100%;border-radius:10px;width:'+pct+'%;background:'+barCol+';transition:width 0.5s;"></div></div>'
      +'<div class="mfc-meta"><span>'+(fac.startDate?'Started '+scEsc(fac.startDate):'Not started')+'</span><span>CHO: '+scEsc(fac.choName||'Not set')+'</span></div>'
      +'<div style="display:flex;gap:5px;margin-top:8px;flex-wrap:wrap;">'
      +'<button class="mfc-btn" style="flex:2;" onclick="scDrillIn(\''+C+'\')"><i class="ti ti-zoom-in" style="font-size:11px;"></i> Drill In</button>'
      +adminBtns+'</div>';
    grid.appendChild(card);
  });
}

async function scDrillIn(code){
  if(appMode==='sc-supervisor'&&!scSupAllowed(code)){ showToast('This facility is not assigned to you.','err'); return; }
  var fac=scMasterFacilities[code]; if(!fac){ showToast('Facility not found.','err'); return; }
  var staff=fac.staff||{};
  var agg=scFacAggFor(code);
  var isSup=appMode==='sc-supervisor';
  document.getElementById('sc-drill-title').innerHTML=scEsc(fac.name||code)+nfProBadge(fac,'lg');
  document.getElementById('sc-drill-code').textContent=code;
  document.getElementById('sc-drill-info').innerHTML='<span>'+scEsc([fac.district,fac.state].filter(Boolean).join(', ')||'—')+'</span>'
    +'<span>Package: '+scEsc(scPkgLabel(fac.progId))+'</span><span>Start: '+scEsc(fac.startDate||'Not set')+'</span><span>CHO: '+scEsc(fac.choName||'—')+'</span>';
  var sc=document.getElementById('sc-drill-staff'); sc.innerHTML='';
  var byMob={}; agg.staff.forEach(function(s){ byMob[s.mob]=s; });
  var mobs=Object.keys(staff);
  if(!mobs.length) sc.innerHTML='<div class="scx-empty">No staff registered yet.</div>';
  mobs.forEach(function(mob){
    var s=staff[mob]||{}, rd=getScRole(s.role||'CHO'), r=(byMob[mob]||{}).res||{pct:0,daysDone:0,totalDays:0};
    var row=document.createElement('div'); row.setAttribute('data-mob',mob);
    row.style.cssText='display:flex;align-items:center;gap:7px;background:var(--bgs);border-radius:8px;padding:7px 10px;margin-bottom:4px;border:1px solid var(--br);';
    row.innerHTML='<div style="width:24px;height:24px;border-radius:6px;background:var(--teal);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;">'+scEsc(String(s.name||'?').charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:0;"><div style="font-size:10px;font-weight:800;color:var(--t1);">'+scEsc(s.name||mob)+'</div>'
      +'<div style="font-size:8px;color:var(--t3);">'+scEsc(rd.label)+' · 📱'+scEsc(mob)+' · '+r.daysDone+'/'+r.totalDays+' days</div>'
      +'<div style="height:4px;border-radius:10px;background:var(--br);margin-top:3px;overflow:hidden;"><div style="height:100%;border-radius:10px;width:'+r.pct+'%;background:'+scPctColor(r.pct)+';"></div></div></div>'
      +'<div style="display:flex;align-items:center;gap:5px;"><div style="font-size:10px;font-weight:800;color:'+scPctText(r.pct)+';">'+r.pct+'%</div>'
      +(isSup?'':'<button onclick="scAdminResetPwd(\''+scJs(code)+'\',\''+scJs(mob)+'\')" title="Reset password" style="border:1.5px solid var(--br);border-radius:6px;padding:2px 7px;font-size:8px;font-weight:800;cursor:pointer;background:transparent;color:var(--t2);font-family:inherit;"><i class="ti ti-key" style="font-size:9px;"></i></button>')
      +'</div>';
    sc.appendChild(row);
  });
  document.getElementById('sc-drill-panel').style.display='';
  document.getElementById('sc-master-grid').style.display='none';
  document.getElementById('sc-master-back').style.display='';
  await scMountInsights('sc-drill-insights',{code:code,fac:fac,staff:staff,progress:scMasterProgress[code]||{}});
  var p=document.getElementById('sc-drill-panel'); if(p) p.scrollIntoView({behavior:'smooth',block:'start'});
}

// HealSol: manage supervisors
function scRenderSupervisorAdmin(){
  var list=document.getElementById('sc-sup-list'); if(!list) return;
  var ids=Object.keys(_scSupervisors||{}).sort();
  if(!ids.length){ list.innerHTML='<div class="scx-empty" style="padding:10px;">No supervisors yet.</div>'; return; }
  list.innerHTML=ids.map(function(id){
    var s=_scSupervisors[id]||{}, facs=scSupFacilityList(s), I=scJs(id);
    var names=facs.map(function(c){ var f=(scMasterFacilities||{})[c]; return f?(f.name||c):c+' (missing)'; });
    return '<div class="scx-sup-row"'+(s.disabled?' style="opacity:0.6;"':'')+'><div class="scx-av">'+scEsc(String(s.name||id).charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:180px;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(s.name||id)+(s.disabled?' <span class="scx-chip end">Disabled</span>':'')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">ID: '+scEsc(id)+' · '+facs.length+' facilit'+(facs.length===1?'y':'ies')+(names.length?': '+scEsc(names.slice(0,4).join(', '))+(names.length>4?' +'+(names.length-4)+' more':''):'')+'</div></div>'
      +'<button class="scx-btn sm ghost" onclick="scEditSupervisor(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button>'
      +'<button class="scx-btn sm ghost" onclick="scToggleSupervisor(\''+I+'\')">'+(s.disabled?'Enable':'Disable')+'</button>'
      +'<button class="scx-btn sm danger" onclick="scRemoveSupervisor(\''+I+'\')"><i class="ti ti-trash"></i></button></div>';
  }).join('');
}
function _scFacilityOptions(){
  return Object.keys(scMasterFacilities||{}).sort().filter(function(c){ var f=scMasterFacilities[c]; return f&&!f.migratedTo; })
    .map(function(c){ var f=scMasterFacilities[c]; return {value:c,label:(f.name||c)+' · '+c+' · '+scPkgShort(f.progId)}; });
}
async function scEditSupervisor(id){
  var s=id?(_scSupervisors[id]||{}):null;
  var v=await scDialog({
    title:s?'Edit supervisor':'Add supervisor', icon:'🧭', wide:true, okLabel:s?'Save':'Create supervisor',
    message:s?null:'Supervisors log in from the 👁 button on the login screen and can only drill into the facilities you tick below.',
    fields:[
      s?{key:'_id',label:'Supervisor ID',type:'info',value:id}:{key:'id',label:'Supervisor ID (used to log in)',required:true,placeholder:'e.g. dpm-sitapur',hint:'Letters, numbers, - and _ only. Not case-sensitive.'},
      {key:'name',label:'Full name',required:true,value:s?s.name:'',placeholder:'e.g. Dr. Anita Verma'},
      {key:'password',label:s?'New password (leave blank to keep)':'Password',type:'text',required:!s,minLength:s?0:4,placeholder:s?'••••':'min 4 characters'},
      {key:'facilities',label:'Assigned facilities',type:'checklist',value:s?scSupFacilityList(s):[],options:_scFacilityOptions(),emptyText:'No facilities enrolled yet.'}
    ],
    validate:function(v){
      if(!s){ var k=scSupKey(v.id); if(!k) return 'Enter a valid Supervisor ID.'; if(_scSupervisors[k]) return 'That Supervisor ID already exists.'; }
      if(v.password&&v.password.length<4) return 'Password must be at least 4 characters.';
      return null;
    }
  });
  if(!v) return;
  var key=s?id:scSupKey(v.id);
  var fmap={}; v.facilities.forEach(function(c){ fmap[c]=true; });
  var rec=Object.assign({},s||{createdAt:scNowIso(),createdBy:'HealSol Admin',disabled:false},{name:v.name,facilities:fmap,updatedAt:scNowIso()});
  if(v.password) rec.password=v.password;
  var ok=await fbSet('sc_supervisors/'+key,scClean(rec));
  if(!ok){ showToast('Could not save supervisor — check connection.','err'); return; }
  _scSupervisors[key]=rec; scRenderSupervisorAdmin();
  showToast(s?'Supervisor updated.':'Supervisor "'+key+'" created.','ok');
}
async function scToggleSupervisor(id){
  var s=_scSupervisors[id]; if(!s) return;
  var ok=await fbSet('sc_supervisors/'+id+'/disabled',!s.disabled);
  if(!ok){ showToast('Update failed.','err'); return; }
  s.disabled=!s.disabled; scRenderSupervisorAdmin(); showToast('Supervisor '+(s.disabled?'disabled':'enabled')+'.','ok');
}
async function scRemoveSupervisor(id){
  var s=_scSupervisors[id]; if(!s) return;
  var ok=await showConfirm('Remove supervisor "'+(s.name||id)+'"? They will no longer be able to log in.','🗑️','Remove Supervisor','Remove','var(--red)');
  if(!ok) return;
  try{ await db.ref('sc_supervisors/'+id).remove(); }catch(e){ showToast('Remove failed: '+e.message,'err'); return; }
  delete _scSupervisors[id]; scRenderSupervisorAdmin(); showToast('Supervisor removed.','ok');
}

// ══════════════════════════════════════════════════════════════
// FACILITY ADMIN — readiness + gap register replaces the old progress list
// ══════════════════════════════════════════════════════════════
async function scRenderChoProgress(){
  if(!scSubAdminCode) return;
  await scMountInsights('sc-cho-progress',{code:scSubAdminCode,fac:scSubAdminData,staff:scSubAdminStaff});
}

// ══════════════════════════════════════════════════════════════
// FUNCTION-LEVEL GUARDS (defense in depth — not just hidden buttons)
// ══════════════════════════════════════════════════════════════
(function(){
  var denied=['scAdminSetDate','scSaveAdminDate','scEditFacility','scSuspendFacility','scCancelFacility','scEnrollFacility',
    'scAdminResetPwd','scAdminSetAccessKey','toggleAdminEditor','aeOpenDay','aeSaveDay','aeResetDay','aeAddCP','aeDeleteCP',
    'aeDeleteCPByIndex','aePropagateCP','aeUpdateField','aeUpdateMethod','aeUpdateRoles','publishNow','adminSavePricing',
    'confirmDemoPayment','openDemoConvertModal','phcCloseLead','renderLeadsPanel','scEditLive','scSetRecording','scDeleteLive',
    'scEditSupervisor','scToggleSupervisor','scRemoveSupervisor','fcAddCode','fcDeleteCode','fcPublish','adminPublishAccessKey','adminSetStartDate'];
  denied.forEach(function(name){
    var fn=window[name]; if(typeof fn!=='function') return;
    window[name]=function(){ if(scDeny(name)) return; return fn.apply(this,arguments); };
  });
  // Live-session writes are HealSol-only (not Facility Admin or staff either)
  ['scEditLive','scSetRecording','scDeleteLive','scEditSupervisor','scToggleSupervisor','scRemoveSupervisor'].forEach(function(name){
    var fn=window[name]; if(typeof fn!=='function') return;
    window[name]=function(){ if(appMode!=='sc-admin'){ showToast('Only HealSol Admin can do this.','err'); return; } return fn.apply(this,arguments); };
  });
})();

// ══════════════════════════════════════════════════════════════
// STAFF APP WIRING
// ══════════════════════════════════════════════════════════════
async function scStartApp(){
  appMode='cho';
  document.getElementById('login-screen').style.display='none';
  document.getElementById('cho-app').classList.add('vis');
  scLoadState();
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
  // Card Editor edits, own progress and corrective actions all come from Firebase
  await Promise.all([
    scEnsureAdminEdits(true).catch(function(){}),
    scLoadMyActions().catch(function(){}),
    scLoadLive().catch(function(){})
  ]);
  await scHydrateProgress().catch(function(e){ console.warn('Hydration failed',e); });
  if(choState.startDate){
    var prog=getProg(choState.progId);
    choState.currentDay=computeCurrentDay(choState.startDate,prog?prog.days:60);
  }
  choState.setupDone=true;
  showWelcomeScreen();
}
// Refresh live banner & actions whenever the welcome screen shows
(function(){
  var orig=showWelcomeScreen;
  showWelcomeScreen=function(){ orig.apply(this,arguments); try{ scRenderWsLive(); scRenderWsActions(); }catch(e){} };
})();
// Facility Admin panel also needs Card Editor edits for scoring
(function(){
  var orig=scStartChoPanel;
  scStartChoPanel=async function(code,facData){ await scEnsureAdminEdits(true); return orig.apply(this,arguments); };
})();
// HealSol admin: load Firebase edits before any readiness is computed; reset supervisor chrome
(function(){
  var orig=scStartAdminApp;
  scStartAdminApp=async function(){
    _scSup=null; var app=document.getElementById('admin-app'); if(app) app.classList.remove('scx-sup');
    appMode='sc-admin'; scSetDashboardChrome();
    await scEnsureAdminEdits(true);
    return orig.apply(this,arguments);
  };
  var origLogout=logoutAdmin;
  logoutAdmin=async function(){
    var wasSup=appMode==='sc-supervisor';
    await origLogout.apply(this,arguments);
    if(document.getElementById('admin-app').classList.contains('vis')) return; // cancelled
    if(wasSup){ _scSup=null; scMasterFacilities={}; scMasterProgress={}; }
    document.getElementById('admin-app').classList.remove('scx-sup');
    scDrillBack(); appMode=null; scCloseLiveSessions();
  };
})();
// Staff logout clears cached actions/sessions
(function(){
  var orig=logoutCHO;
  logoutCHO=async function(){
    await orig.apply(this,arguments);
    if(document.getElementById('cho-app').classList.contains('vis')) return;
    _scAllActions={}; _scSynced={}; scCloseLiveSessions(); appMode=null;
    try{ localStorage.removeItem('sc_autologin'); }catch(e){}
  };
})();

// ══════════════════════════════════════════════════════════════
// LANGUAGE TOGGLE — login, welcome AND the day-card header
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{
  "Today's Micro-task":'आज का सूक्ष्म-कार्य','Area of Concern · ME · Checkpoints':'चिंता का क्षेत्र · ME · चेकपॉइंट',
  'Assessment Methods':'मूल्यांकन विधियाँ','Responsible Staff':'ज़िम्मेदार स्टाफ','Mark Done':'पूर्ण करें','Done!':'पूर्ण!',
  'Verify':'सत्यापित करें','Re-attempt':'पुनः प्रयास','Gaps to Close':'बंद करने योग्य कमियाँ','Gap closed':'कमी बंद',
  'Daily Cards':'दैनिक कार्ड','Corrective Actions':'सुधारात्मक कार्य','Live Sessions':'लाइव सत्र','Live':'लाइव',
  'Full':'पूर्ण','Half':'आंशिक','Zero':'शून्य','Select Day':'दिन चुनें',"Go to Today's Card":'आज का कार्ड खोलें',
  'Reset — send back for redo':'रीसेट — दोबारा करने के लिए भेजें','Corrective action':'सुधारात्मक कार्य'
});
function setLang(lang,silent){
  _appLang=lang==='hi'?'hi':'en';
  try{ localStorage.setItem('nqas_lang',_appLang); }catch(e){}
  document.querySelectorAll('.lang-tog button[data-lang]').forEach(function(b){
    b.classList.toggle('on',b.getAttribute('data-lang')===_appLang);
  });
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var key=el.getAttribute('data-i18n');
    el.textContent=(_appLang==='hi'&&HINDI_UI[key])?HINDI_UI[key]:key;
  });
  if(!silent&&typeof showToast==='function') showToast(_appLang==='hi'?'हिंदी भाषा चुनी गई ✓':'English selected ✓','ok');
  // Re-render whatever the staff member is looking at right now
  try{
    var ws=document.getElementById('welcome-screen');
    if(ws&&ws.classList.contains('vis')){ wsRenderBody(); scRenderWsActions(); }
    var main=document.getElementById('cho-main');
    if(main&&main.style.display!=='none'&&choState&&choState.setupDone){
      if(choState.view==='board') buildBoard();
      else if(typeof _scLastDi==='number') renderCard(_scLastDi);
    }
  }catch(e){}
}
function initLang(){
  try{ _appLang=localStorage.getItem('nqas_lang')||'en'; }catch(e){ _appLang='en'; }
  setLang(_appLang,true);
}

// ══════════════════════════════════════════════════════════════
// CARD EDITOR — multi-select roles per checkpoint
// ══════════════════════════════════════════════════════════════
var _aeFilt={role:'',aoc:''}; // persists across re-renders, day switches and edits
function aeRoleChipsHTML(cp,ci){
  var sel=scCpRoles(cp);
  return '<div data-kind="roles" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">'
    +'<span style="font-size:10px;font-weight:700;color:#94A3B8;">Roles:</span>'
    +_SC_ROLES.map(function(r){
      var on=sel.indexOf(r)>=0;
      return '<label style="display:flex;align-items:center;gap:3px;font-size:10px;font-weight:700;cursor:pointer;padding:3px 7px;border-radius:6px;border:1.5px solid '+(on?'#93C5FD':'#E2E8F0')+';background:'+(on?'#EFF6FF':'#fff')+';color:'+(on?'#1D4ED8':'#94A3B8')+';">'
        +'<input type="checkbox" data-kind="role" value="'+scEsc(r)+'" data-ci="'+ci+'" '+(on?'checked':'')+' onchange="aeUpdateRoles(this)" style="width:11px;height:11px;cursor:pointer;margin:0;"> '
        +(r==='General'?'👥 All':scEsc(r))+'</label>';
    }).join('')+'</div>';
}
function aeUpdateRoles(cb){
  var ci=parseInt(cb.getAttribute('data-ci'),10);
  aeEnsure(_aeDiU);
  var wrap=cb.closest('[data-kind="roles"]'); if(!wrap) return;
  var boxes=wrap.querySelectorAll('input[data-kind="role"]');
  // "General" (All Staff) is exclusive of individual roles
  if(cb.checked&&cb.value==='General') boxes.forEach(function(b){ if(b!==cb) b.checked=false; });
  else if(cb.checked) boxes.forEach(function(b){ if(b.value==='General') b.checked=false; });
  var roles=[];
  boxes.forEach(function(b){
    if(b.checked) roles.push(b.value);
    var lbl=b.parentElement;
    lbl.style.background=b.checked?'#EFF6FF':'#fff'; lbl.style.color=b.checked?'#1D4ED8':'#94A3B8'; lbl.style.borderColor=b.checked?'#93C5FD':'#E2E8F0';
  });
  var val=roles.length===0?'':roles.length===1?roles[0]:roles;
  var key=adminActiveProg+'_'+_aeDiU;
  if(adminEdits[key]&&adminEdits[key].cps[ci]){ adminEdits[key].cps[ci].r=val; }
  if(_aeCps[ci]) _aeCps[ci].r=val;
}

// Facility Admin PDF (report reads the master maps, so populate them for this facility only)
function scChoReport(){
  if(!scSubAdminCode) return;
  var f=Object.assign({},scSubAdminData,{staff:scSubAdminStaff});
  var st=_scIns['sc-cho-progress'];
  scMasterFacilities={}; scMasterFacilities[scSubAdminCode]=f;
  scMasterProgress={}; scMasterProgress[scSubAdminCode]=st?st.progress:{};
  scGenerateReport('facility',scSubAdminCode);
}

// ── Staff app: Back to Home & Refresh ─────────────────────────
function scGoHome(){
  if(appMode!=='cho') return;
  try{ scFlushSync(); }catch(e){}
  var nav=document.getElementById('cho-nav'), main=document.getElementById('cho-main');
  if(nav) nav.style.display='none';
  if(main) main.style.display='none';
  showWelcomeScreen();
  try{ window.scrollTo(0,0); }catch(e){}
}
var _scRefreshing=false;
async function scStaffRefresh(btn){
  if(appMode!=='cho'||_scRefreshing) return;
  if(!choState.facilityCode||!choState.staffMobile) return;
  _scRefreshing=true;
  var btns=document.querySelectorAll('.scx-refresh-btn'); btns.forEach(function(b){b.classList.add('busy');});
  try{
    if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
    if(!db){ showToast('No connection — check internet and try again.','err'); return; }
    // 1. Push any unsaved local changes first so nothing is lost
    clearTimeout(_scSyncTimer); await scFlushSync();
    // 2. Facility & staff record (package, start date, subscription, removal)
    var fac=await fbGet(scFacilityPath(choState.facilityCode));
    var me=fac?await fbGet(scStaffPath(choState.facilityCode,choState.staffMobile)):null;
    if(!fac||fac.suspended||!me){
      await scAlert(!fac?'This facility could not be found.':fac.suspended?'This facility is currently suspended. Contact HealSol Academy.':'Your mobile number is no longer registered at this facility. Contact your Facility Admin.','Access changed','⚠️');
      try{ localStorage.removeItem('sc_autologin'); }catch(e){}
      location.reload(); return;
    }
    var progChanged=fac.progId&&fac.progId!==choState.progId;
    choState.roleId=me.role||choState.roleId; choState.staffName=me.name||choState.staffName;
    choState.progId=fac.progId||choState.progId;
    choState.facility.name=fac.name||choState.facility.name;
    choState.facility.district=fac.district||''; choState.facility.state=fac.state||'';
    choState.facility.subscriptionStatus=fac.subscriptionStatus||null;
    choState.facility.progId=choState.progId;
    if(fac.startDate) choState.startDate=fac.startDate;
    if(progChanged) choState.cards={};
    // 3. Card Editor edits, corrective actions, live sessions, own progress
    await Promise.all([
      scEnsureAdminEdits(true).catch(function(){}),
      scLoadMyActions().catch(function(){}),
      scLoadLive().catch(function(){}),
      scIsVerifier()?scLoadVerifyData(true).catch(function(){}):Promise.resolve()
    ]);
    await scHydrateProgress();
    scUpdateVerifyBadge();
    var prog=getProg(choState.progId);
    if(choState.startDate) choState.currentDay=computeCurrentDay(choState.startDate,prog?prog.days:60);
    try{ localStorage.setItem(getChoStateKey(),JSON.stringify(choState)); }catch(e){}
    // 4. Re-render whichever screen is showing
    var ws=document.getElementById('welcome-screen');
    if(ws&&ws.classList.contains('vis')){ showWelcomeScreen(); }
    else{
      updateCHOUI(); buildDaySelector();
      var di=(typeof window._scLastDi==='number'&&!progChanged)?window._scLastDi:choState.currentDay-1;
      renderCard(di);
      if(choState.view==='board') buildBoard();
    }
    showToast(t('Up to date')+' ✓','ok');
  }catch(e){
    console.error('Refresh failed',e); showToast('Refresh failed — check connection.','err');
  }finally{
    _scRefreshing=false; btns.forEach(function(b){b.classList.remove('busy');});
  }
}
Object.assign(HINDI_UI,{'other checkpoint is assigned to other staff and scored by them.':'अन्य चेकपॉइंट अन्य स्टाफ को सौंपा गया है और वही स्कोर करेंगे।','other checkpoints are assigned to other staff and scored by them.':'अन्य चेकपॉइंट अन्य स्टाफ को सौंपे गए हैं और वे ही स्कोर करेंगे।',
  'No checkpoints are assigned to your role on this day.':'इस दिन आपकी भूमिका के लिए कोई चेकपॉइंट नहीं है।',
  'checkpoints on this card belong to other staff.':'चेकपॉइंट अन्य स्टाफ के हैं।','You can review and verify their work.':'आप उनके कार्य की समीक्षा और सत्यापन कर सकते हैं।',
  'This checkpoint is assigned to other staff.':'यह चेकपॉइंट अन्य स्टाफ को सौंपा गया है।','of':'में से','yours':'आपके',
  'Refresh':'रीफ़्रेश','Back to Home':'होम पर वापस','Up to date':'अपडेट हो गया'});

// ═══════════════════════════════════════════════════════════════
// VERIFICATION — two tiers
//  Tier 1 (on site): CHO verifies ANM / ASHA / MPW cards (MO may too) — every checkpoint.
//  Tier 2: CHO & MO cards are verified by the HealSol-assigned Supervisor (or HealSol Admin);
//          an MO may also verify CHO cards. Risk-based sample: every Half / Zero / re-attempted
//          checkpoint + a random share of Full scores. Nobody verifies their own card.
// ═══════════════════════════════════════════════════════════════
var SC_VERIFY_MATRIX={ANM:['CHO','MO'],ASHA:['CHO','MO'],MPW:['CHO','MO'],General:['CHO','MO'],CHO:['Supervisor','MO'],MO:['Supervisor']};
var SC_SAMPLED_ROLES=['CHO','MO'];
var SC_VMETHODS={SI:'Staff Interview',RR:'Record Review',CI:'Client Interview',OB:'Observation'};
var _scVCfg={pct:20,min:3};
var _scVQ={roster:null,progress:null,at:0,loading:null};
async function scLoadVerifyConfig(){
  try{
    var c=await fbGet('shared/sc_verify_config');
    if(c){ var p=Math.round(+c.pct), m=Math.round(+c.min);
      _scVCfg={pct:(p>=1&&p<=100)?p:20, min:(m>=0&&m<=50)?m:3}; }
  }catch(e){}
  return _scVCfg;
}
function scVerifiersFor(ownerRole){ return SC_VERIFY_MATRIX[ownerRole]||['CHO','MO']; }
function scCanVerifyFor(verifierRole,ownerRole){ return scVerifiersFor(ownerRole).indexOf(verifierRole)>=0; }
function scVerifierLabel(ownerRole){ return scVerifiersFor(ownerRole).join(' / '); }
function scIsVerifier(){ return appMode==='cho'&&['CHO','MO'].indexOf(choState.roleId||'')>=0; }
function scCanSelfVerify(){ return false; }
// In-facility people who could verify MY cards (a Supervisor counts as always available)
function scOtherVerifiers(){
  var allowed=scVerifiersFor(choState.roleId||'CHO');
  if(allowed.indexOf('Supervisor')>=0) return ['supervisor'];
  var r=_scVQ.roster||{};
  return Object.keys(r).filter(function(m){ return m!==choState.staffMobile&&r[m]&&!r[m].disabled&&allowed.indexOf(r[m].role||'')>=0; });
}

// ── context: the same panel works in the staff app (CHO/MO) and the Supervisor/HealSol app
function scVCtx(code){
  if(appMode==='cho'){
    if(code!==choState.facilityCode||!scIsVerifier()) return null;
    if(!_scVQ.progress) _scVQ.progress={};
    return {code:code,progId:choState.progId,roster:_scVQ.roster||{},progress:_scVQ.progress,
      actor:{name:choState.staffName||choState.staffMobile,role:choState.roleId||'',label:choState.roleId||'',mob:choState.staffMobile}};
  }
  if(appMode==='sc-supervisor'||appMode==='sc-admin'){
    if(appMode==='sc-supervisor'&&!scSupAllowed(code)) return null;
    var f=(scMasterFacilities||{})[code]; if(!f) return null;
    if(!scMasterProgress[code]) scMasterProgress[code]={};
    var a=scActor();
    return {code:code,progId:f.progId||'nqas_12A',roster:f.staff||{},progress:scMasterProgress[code],facility:f,
      actor:{name:a.name,role:'Supervisor',label:appMode==='sc-admin'?'HealSol Admin':'Supervisor',mob:''}};
  }
  return null;
}
function scVCanMob(ctx,mob){
  if(!ctx) return false;
  if(ctx.actor.mob&&mob===ctx.actor.mob) return false;
  var st=ctx.roster[mob]; if(!st||st.disabled) return false;
  return scCanVerifyFor(ctx.actor.role,st.role||'CHO');
}
function scCanVerifyMob(mob){ return scVCanMob(scVCtx(choState.facilityCode),mob); }
function scVRec(ctx,mob,di){
  var r=((ctx.progress||{})[mob]||{})['day_'+di]||null;
  if(r&&r.progId&&r.progId!==ctx.progId) return null;
  return r;
}
function scVSetRec(ctx,mob,di,rec){ (ctx.progress[mob]=ctx.progress[mob]||{})['day_'+di]=rec; }
function scVIdx(progId,di,role){
  var d=scDayDef(progId,di), out=[];
  (d&&d.cps||[]).forEach(function(cp,ci){ if(scCpForRole(cp,role)) out.push(ci); });
  return out;
}
// A checkpoint verification only stands while the staff score is unchanged since it was verified
function scCpvValid(rec,ci){
  var v=rec&&rec.cpVerify?rec.cpVerify['c'+ci]:null; if(!v) return null;
  var cur=scNormScore((rec.cpScores||[])[ci]);
  return (v.score===undefined||v.score===null||v.score===cur)?v:null;
}
function scCpvStale(rec,ci){ return !!(rec&&rec.cpVerify&&rec.cpVerify['c'+ci])&&!scCpvValid(rec,ci); }
function scCpvCount(rec,list){ return list.filter(function(ci){ return !!scCpvValid(rec,ci); }).length; }
function scCpvNote(v){
  return '✓ Verified by '+scEsc(v.by||'—')+(v.byRole?' ('+scEsc(v.byRole)+')':'')+(v.at?' · '+scFmtDate(v.at):'')
    +(v.methods&&v.methods.length?' · <b>'+v.methods.map(scEsc).join(', ')+'</b>':'')
    +(v.comment?'<div class="scx-cpv-cmt">“'+scEsc(v.comment)+'”</div>':'');
}
// ── risk-based sample
function scHashSeed(str){ var h=2166136261>>>0; for(var i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h; }
function scRand(seed){ return function(){ seed=(seed+0x6D2B79F5)|0; var t=Math.imul(seed^(seed>>>15),1|seed); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
function scVPlan(ctx,mob,di,rec){
  var role=(ctx.roster[mob]||{}).role||'CHO';
  var idx=scVIdx(ctx.progId,di,role);
  if(SC_SAMPLED_ROLES.indexOf(role)<0) return {idx:idx,required:idx,optional:[],sampled:false};
  var gaps=[], fulls=[], gr=rec.gapRetries||{};
  idx.forEach(function(ci){ var s=scNormScore((rec.cpScores||[])[ci]); if(s!==2||gr['c'+ci]) gaps.push(ci); else fulls.push(ci); });
  var k=fulls.length?Math.min(fulls.length,Math.max(_scVCfg.min,Math.ceil(fulls.length*_scVCfg.pct/100))):0;
  var rnd=scRand(scHashSeed(ctx.code+'|'+mob+'|'+di+'|'+(rec.sentBackAt||'')));
  var sh=fulls.slice(); for(var i=sh.length-1;i>0;i--){ var j=Math.floor(rnd()*(i+1)); var tmp=sh[i]; sh[i]=sh[j]; sh[j]=tmp; }
  var pick=sh.slice(0,k);
  var req=idx.filter(function(ci){ return gaps.indexOf(ci)>=0||pick.indexOf(ci)>=0; });
  return {idx:idx,required:req,optional:idx.filter(function(ci){ return req.indexOf(ci)<0; }),sampled:true,gapsN:gaps.length,sampleN:k,fullN:fulls.length};
}
function scVPending(ctx){
  var out=[]; if(!ctx) return out;
  Object.keys(ctx.progress||{}).forEach(function(mob){
    if(!scVCanMob(ctx,mob)) return;
    var st=ctx.roster[mob]||{};
    Object.keys(ctx.progress[mob]||{}).forEach(function(k){
      var m=/^day_(\d+)$/.exec(k); if(!m) return;
      var di=+m[1], rec=scVRec(ctx,mob,di);
      if(!rec||!rec.taskDone||rec.verified) return;
      var plan=scVPlan(ctx,mob,di,rec);
      out.push({code:ctx.code,mob:mob,di:di,name:st.name||mob,role:st.role||'CHO',rec:rec,plan:plan,
        left:plan.required.length-scCpvCount(rec,plan.required)});
    });
  });
  out.sort(function(a,b){ return (a.di-b.di)||String(a.name).localeCompare(b.name); });
  return out;
}
function scPendingVerifications(){ return scIsVerifier()&&_scVQ.progress?scVPending(scVCtx(choState.facilityCode)):[]; }

// ── rendering (shared)
function scVId(code,mob,di,ci){ return 'scxv-'+scEsc(code)+'-'+scEsc(mob)+'-'+di+(ci===undefined?'':'-'+ci); }
function scScoreTag(s){
  return s===2?'<span class="scx-vp-sc s2">Full</span>':s===1?'<span class="scx-vp-sc s1">Half</span>':s===0?'<span class="scx-vp-sc s0">Zero</span>':'<span class="scx-vp-sc sn">—</span>';
}
function scVCpRowHTML(ctx,mob,di,ci,rec,interactive,tag){
  var d=scDayDef(ctx.progId,di); var cp=d.cps[ci];
  var sc=scNormScore((rec.cpScores||[])[ci]);
  var gr=(rec.gapRetries||{})['c'+ci];
  var note=gr&&gr.closed?' · re-attempt closed at Full (was '+(gr.orig===0?'Zero':'Half')+')':'';
  var v=scCpvValid(rec,ci), stale=scCpvStale(rec,ci);
  var jc=scJs(ctx.code), jm=scJs(mob);
  var h='<div class="scx-vp-cp'+(v?' done':'')+'" id="'+scVId(ctx.code,mob,di,ci)+'">'+scScoreTag(sc)+'<div style="flex:1;min-width:0;">'
    +(tag?'<span class="scx-vtag '+tag.cls+'">'+tag.txt+'</span>':'')
    +'<div>'+scEsc(getCPText(cp))+'</div><div class="scx-vp-meta">'+scEsc(scCpRoleText(cp))+(cp.me?' · '+scEsc(cp.me):'')+scEsc(note)+'</div>';
  if(v){
    h+='<div class="scx-cpv-ok">'+scCpvNote(v)+(interactive?' <button class="scx-linkbtn" onclick="scUnverifyCp(\''+jc+'\',\''+jm+'\','+di+','+ci+')">Undo</button>':'')+'</div>';
  } else if(interactive){
    var ms=(d.methods&&d.methods.length?d.methods:['SI','RR','CI','OB']);
    var sug=cp.method?String(cp.method).toUpperCase():'';
    h+=(stale?'<div class="scx-cpv-stale">⚠ Score changed since it was verified — please verify again.</div>':'')
      +'<div class="scx-cpv-form"><div class="scx-cpv-methods"><span>Verified by:</span>'+ms.map(function(m){
          return '<button type="button" class="scx-m'+(m===sug?' sug':'')+'" data-m="'+scEsc(m)+'" title="'+scEsc(SC_VMETHODS[m]||m)+(m===sug?' (suggested)':'')+'" onclick="this.classList.toggle(\'on\')">'+scEsc(m)+'</button>';
        }).join('')+'<em>optional</em></div>'
      +'<div class="scx-cpv-row"><input class="scx-cpv-in" placeholder="Comment (optional)" maxlength="300"/>'
      +'<button class="scx-btn sm" onclick="scVerifyCp(\''+jc+'\',\''+jm+'\','+di+','+ci+')"><i class="ti ti-check"></i> Verify</button></div></div>';
  } else if(rec.verified&&rec.verifyMode==='sample'){
    h+='<div class="scx-vp-meta" style="color:#15803D;">Accepted after sample verification</div>';
  }
  return h+'</div></div>';
}
function scVProgressHTML(done,total,sampled){
  var pct=total?Math.round(done/total*100):0;
  return '<div class="scx-cpv-prog"><div class="bar"><i style="width:'+pct+'%"></i></div><span>'+done+' / '+total+' '+(sampled?'sample checkpoints':'checkpoints')+' verified</span></div>';
}
function scVStaffHTML(ctx,mob,di){
  var st=ctx.roster[mob]||{}, role=st.role||'CHO';
  var rec=scVRec(ctx,mob,di); if(!rec||!rec.taskDone) return '';
  var plan=scVPlan(ctx,mob,di,rec); if(!plan.idx.length) return '';
  var who='<div class="scx-vp-who">'+scEsc(st.name||mob)+' <span style="color:var(--t3);font-weight:700;font-size:11px;">· '+scEsc(role)+' · '+plan.idx.length+' CP'+(plan.idx.length===1?'':'s')+'</span>';
  var xp=0,max=0; plan.idx.forEach(function(ci){ var s=scNormScore((rec.cpScores||[])[ci]); if(s!==null){ xp+=s; max+=2; } });
  var pct=max?Math.round(xp/max*100):0;
  var bid=scVId(ctx.code,mob,di), jc=scJs(ctx.code), jm=scJs(mob);
  if(rec.verified){
    return '<div class="scx-vp-staff" id="'+bid+'">'+who+'<span class="scx-vp-pill ok">✓ Verified</span></div>'
      +'<div class="scx-vp-meta" style="margin-top:4px;">By '+scEsc(rec.verifiedBy||'—')+(rec.verifiedByRole?' ('+scEsc(rec.verifiedByRole)+')':'')+(rec.verifiedAt?' · '+scFmtDate(rec.verifiedAt):'')+' · '+xp+'/'+max+' XP ('+pct+'%)'
      +(rec.verifyMode==='sample'?' · sample check: '+(+rec.sampleChecked||0)+' of '+plan.idx.length+' checkpoints':'')
      +(rec.verifierComment?'<br>“'+scEsc(rec.verifierComment)+'”':'')+'</div>'
      +'<details style="margin-top:6px;"><summary style="font-size:11px;font-weight:700;color:#2563EB;cursor:pointer;">Show checkpoints</summary>'
      +plan.idx.map(function(ci){ return scVCpRowHTML(ctx,mob,di,ci,rec,false); }).join('')+'</details></div>';
  }
  var done=scCpvCount(rec,plan.required), all=done===plan.required.length;
  var h='<div class="scx-vp-staff pending" id="'+bid+'">'+who+'<span class="scx-vp-pill wait">Awaiting verification</span></div>'
    +'<div class="scx-vp-meta" style="margin:3px 0 4px;">Marked done'+(rec.updatedAt?' '+scFmtDate(rec.updatedAt):'')+' · '+xp+'/'+max+' XP ('+pct+'%)</div>';
  if(plan.sampled){
    h+='<div class="scx-vsample"><b>🎯 Sample check</b> — '+(plan.gapsN?'all '+plan.gapsN+' Half/Zero/re-attempted score'+(plan.gapsN===1?'':'s')+(plan.sampleN?' + ':''):'')
      +(plan.sampleN?plan.sampleN+' of '+plan.fullN+' Full scores picked at random':'')+(!plan.gapsN&&!plan.sampleN?'nothing to sample':'')
      +'. The other '+plan.optional.length+' Full score'+(plan.optional.length===1?' is':'s are')+' accepted when you complete.</div>';
  }
  h+='<div id="'+bid+'-prog">'+scVProgressHTML(done,plan.required.length,plan.sampled)+'</div>';
  h+=plan.required.map(function(ci){
    var s=scNormScore((rec.cpScores||[])[ci]);
    var tag=plan.sampled?((s!==2||(rec.gapRetries||{})['c'+ci])?{cls:'gap',txt:'Gap / re-attempt'}:{cls:'rnd',txt:'Random sample'}):null;
    return scVCpRowHTML(ctx,mob,di,ci,rec,true,tag);
  }).join('');
  if(plan.optional.length){
    h+='<details class="scx-vopt" id="'+bid+'-opt"><summary>'+plan.optional.length+' other Full score'+(plan.optional.length===1?'':'s')+' — accepted on completion (tap to check any)</summary>'
      +plan.optional.map(function(ci){ return scVCpRowHTML(ctx,mob,di,ci,rec,true); }).join('')+'</details>';
  }
  h+='<div class="scx-cpv-final"><textarea class="scx-vp-ta" id="'+bid+'-cmt" rows="2" placeholder="Overall comment for the card (optional)"></textarea>'
    +'<div class="scx-vp-acts"><button class="scx-btn sm" id="'+bid+'-fin" onclick="scVerifyStaffDay(\''+jc+'\',\''+jm+'\','+di+')" '+(all?'':'disabled')+'><i class="ti ti-shield-check"></i> '
    +(all?'Complete verification':(plan.sampled?'Verify the sample to complete':'Verify all checkpoints to complete'))+'</button>'
    +'<button class="scx-btn sm ghost" style="color:#B91C1C;border-color:#FCA5A5;" onclick="scSendBackStaffDay(\''+jc+'\',\''+jm+'\','+di+')"><i class="ti ti-arrow-back-up"></i> Send back for redo</button></div></div></div>';
  return h;
}
// Re-render one staff block, keeping anything the verifier has typed/ticked elsewhere
function scVRefreshBlock(ctx,mob,di){
  var el=document.getElementById(scVId(ctx.code,mob,di));
  if(!el) return false;
  var keep={};
  el.querySelectorAll('.scx-vp-cp').forEach(function(r){
    var inp=r.querySelector('.scx-cpv-in'); if(!inp) return;
    keep[r.id]={v:inp.value,on:[].map.call(r.querySelectorAll('.scx-m.on'),function(b){ return b.getAttribute('data-m'); })};
  });
  var ta=el.querySelector('.scx-vp-ta'), taV=ta?ta.value:'';
  var opt=el.querySelector('.scx-vopt'), optOpen=opt?opt.open:false;
  var tmp=document.createElement('div'); tmp.innerHTML=scVStaffHTML(ctx,mob,di);
  var neu=tmp.firstChild; if(!neu){ el.remove(); return true; }
  el.replaceWith(neu);
  Object.keys(keep).forEach(function(id){
    var r=document.getElementById(id); if(!r) return; var inp=r.querySelector('.scx-cpv-in'); if(inp) inp.value=keep[id].v;
    keep[id].on.forEach(function(m){ var b=r.querySelector('.scx-m[data-m="'+m+'"]'); if(b) b.classList.add('on'); });
  });
  var ta2=neu.querySelector('.scx-vp-ta'); if(ta2) ta2.value=taV;
  var opt2=neu.querySelector('.scx-vopt'); if(opt2&&optOpen) opt2.open=true;
  return true;
}
function scVAfter(ctx,mob,di,kind){
  if(appMode==='cho'){
    scUpdateVerifyBadge();
    if(kind==='row'&&scVRefreshBlock(ctx,mob,di)){
      var sub=document.querySelector('#scx-vpanel .scx-vp-hd .sub');
      if(sub) sub.textContent=document.querySelectorAll('#scx-vpanel .scx-vp-staff.pending').length+' awaiting your verification';
      return;
    }
    var main=document.getElementById('cho-main');
    if(typeof window._scLastDi==='number'&&main&&main.style.display!=='none') renderCard(window._scLastDi);
    if(choState.view==='board'&&typeof buildBoard==='function') buildBoard();
    scRenderWsVerify();
  } else {
    scAdmUpdateBadge();
    if(kind==='row'&&scVRefreshBlock(ctx,mob,di)) return;
    if(kind==='final') _scAdmV={mode:'list'};
    scAdmVRender();
  }
}

// ── actions (shared)
function scVGuard(code,mob){
  var ctx=scVCtx(code);
  if(!ctx){ showToast(t('You cannot verify this card.'),'err'); return null; }
  if(!scVCanMob(ctx,mob)){
    var st=ctx.roster[mob];
    if(ctx.actor.mob&&mob===ctx.actor.mob) showToast(t('Your cards are verified by')+' '+scVerifierLabel(ctx.actor.role)+'.','err');
    else if(st) showToast((st.role||'CHO')+' '+t('cards are verified by')+' '+scVerifierLabel(st.role||'CHO')+'.','err');
    else showToast('Staff member not found.','err');
    return null;
  }
  return ctx;
}
async function scVFetch(ctx,mob,di){
  var rec=await fbGet(scProgressPath(ctx.code,mob,di));
  if(rec) scVSetRec(ctx,mob,di,rec);
  return rec;
}
async function scVerifyCp(code,mob,di,ci){
  var ctx=scVGuard(code,mob); if(!ctx) return;
  var row=document.getElementById(scVId(code,mob,di,ci));
  var methods=row?[].map.call(row.querySelectorAll('.scx-m.on'),function(b){ return b.getAttribute('data-m'); }):[];
  var inp=row?row.querySelector('.scx-cpv-in'):null, comment=inp?inp.value.trim():'';
  var btn=row?row.querySelector('.scx-cpv-row .scx-btn'):null; if(btn) btn.disabled=true;
  try{
    var rec=await scVFetch(ctx,mob,di);
    if(!rec||!rec.taskDone||rec.verified){ showToast(!rec||!rec.taskDone?'This card is no longer marked done.':'This card is already verified.','err'); scVAfter(ctx,mob,di,'full'); return; }
    var now=scNowIso();
    var entry={by:ctx.actor.name,byRole:ctx.actor.label,byMob:ctx.actor.mob||'',at:now,methods:methods,comment:comment,score:scNormScore((rec.cpScores||[])[ci])};
    var upd={}; upd['cpVerify/c'+ci]=entry; upd.updatedAt=now;
    await db.ref(scProgressPath(code,mob,di)).update(upd);
    rec.cpVerify=rec.cpVerify||{}; rec.cpVerify['c'+ci]=entry; rec.updatedAt=now;
  }catch(e){ console.error(e); showToast('Could not save — check connection.','err'); if(btn) btn.disabled=false; return; }
  scVAfter(ctx,mob,di,'row');
  var r2=scVRec(ctx,mob,di), plan=scVPlan(ctx,mob,di,r2);
  if(scCpvCount(r2,plan.required)===plan.required.length) showToast((plan.sampled?'Sample verified':'All checkpoints verified')+' — tap Complete verification.','ok');
  else{
    var next=plan.required.find(function(c){ return c!==ci&&!scCpvValid(r2,c); });
    var nr=next!=null?document.getElementById(scVId(code,mob,di,next)):null;
    if(nr&&nr.scrollIntoView) nr.scrollIntoView({behavior:'smooth',block:'center'});
  }
}
async function scUnverifyCp(code,mob,di,ci){
  var ctx=scVGuard(code,mob); if(!ctx) return;
  try{
    var rec=await scVFetch(ctx,mob,di);
    if(rec&&rec.verified){ showToast('Card already verified — cannot undo.','err'); scVAfter(ctx,mob,di,'full'); return; }
    var upd={}; upd['cpVerify/c'+ci]=null; upd.updatedAt=scNowIso();
    await db.ref(scProgressPath(code,mob,di)).update(upd);
    if(rec&&rec.cpVerify) delete rec.cpVerify['c'+ci];
  }catch(e){ showToast('Could not undo — check connection.','err'); return; }
  scVAfter(ctx,mob,di,'row');
}
async function scVerifyStaffDay(code,mob,di){
  var ctx=scVGuard(code,mob); if(!ctx) return;
  var bid=scVId(code,mob,di);
  var ta=document.getElementById(bid+'-cmt'), comment=ta?ta.value.trim():'';
  try{
    var rec=await scVFetch(ctx,mob,di);
    if(!rec||!rec.taskDone){ showToast('This card is no longer marked done.','err'); scVAfter(ctx,mob,di,'full'); return; }
    if(rec.verified){ showToast('Already verified by '+(rec.verifiedBy||'another verifier')+'.','ok'); scVAfter(ctx,mob,di,'final'); return; }
    var plan=scVPlan(ctx,mob,di,rec), done=scCpvCount(rec,plan.required);
    if(done<plan.required.length){ showToast('Verify '+(plan.sampled?'the sample':'each checkpoint')+' first ('+done+'/'+plan.required.length+' done).','err'); scVAfter(ctx,mob,di,'row'); return; }
    var now=scNowIso();
    var upd={verified:true,verifiedBy:ctx.actor.name,verifiedByRole:ctx.actor.label,verifiedByMob:ctx.actor.mob||'',verifiedAt:now,updatedAt:now,
      verifyMode:plan.sampled?'sample':'full',sampleChecked:scCpvCount(rec,plan.idx),sampleAccepted:plan.idx.length-scCpvCount(rec,plan.idx)};
    if(comment){ upd.verifierComment=comment; upd.commentDate=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
    await db.ref(scProgressPath(code,mob,di)).update(upd);
    Object.assign(rec,upd);
    showToast('Verified ✓ '+((ctx.roster[mob]||{}).name||mob)+' · Day '+(di+1),'ok');
  }catch(e){ console.error(e); showToast('Could not verify — check connection.','err'); return; }
  scVAfter(ctx,mob,di,'final');
}
async function scSendBackStaffDay(code,mob,di){
  var ctx=scVGuard(code,mob); if(!ctx) return;
  var st=ctx.roster[mob]||{};
  var v=await scDialog({title:'Send back Day '+(di+1),icon:'↩️',okLabel:'Send back',
    message:(st.name||mob)+' ('+(st.role||'—')+') will need to redo and re-score their checkpoints for this day.',
    fields:[{key:'reason',label:'Reason (shown to the staff member)',type:'textarea',placeholder:'e.g. Records not available for this checkpoint — please re-check'}]});
  if(!v) return;
  try{
    var rec=await scVFetch(ctx,mob,di);
    if(!rec||!rec.taskDone){ showToast('This card is no longer marked done.','err'); scVAfter(ctx,mob,di,'full'); return; }
    if(rec.verified){ showToast('Already verified — cannot send back.','err'); scVAfter(ctx,mob,di,'full'); return; }
    var n=Math.max(((scDayDef(ctx.progId,di)||{}).cps||[]).length,(rec.cpScores||[]).length);
    var now=scNowIso();
    var upd={taskDone:false,verified:false,score:null,cpScores:new Array(n).fill(-1),gapRetries:null,cpVerify:null,verifyMode:null,
      sentBackBy:ctx.actor.name,sentBackByRole:ctx.actor.label,sentBackByMob:ctx.actor.mob||'',sentBackAt:now,sentBackReason:(v.reason||'').trim(),updatedAt:now};
    await db.ref(scProgressPath(code,mob,di)).update(upd);
    var cached=Object.assign({},rec,upd); delete cached.gapRetries; delete cached.cpVerify; delete cached.verifyMode;
    scVSetRec(ctx,mob,di,cached);
    showToast('Sent back to '+(st.name||mob),'ok');
  }catch(e){ console.error(e); showToast('Could not send back — check connection.','err'); return; }
  scVAfter(ctx,mob,di,'final');
}
function verifyCard(di){ showToast(t('Your cards are verified by')+' '+scVerifierLabel(choState.roleId||'CHO')+'.','err'); }

// ── staff app (CHO / MO)
async function scLoadVerifyData(force){
  if(!scIsVerifier()) return null;
  if(!force&&_scVQ.at&&(Date.now()-_scVQ.at)<60000) return _scVQ;
  if(_scVQ.loading) return _scVQ.loading;
  _scVQ.loading=(async function(){
    try{
      if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
      var code=choState.facilityCode;
      var res=await Promise.all([fbGet(scFacilityPath(code)+'/staff'),fbGet('sc_progress/'+code),scLoadVerifyConfig()]);
      _scVQ.roster=res[0]||{}; _scVQ.progress=res[1]||{}; _scVQ.at=Date.now();
    }catch(e){ console.warn('Verification data failed',e); }
    finally{ _scVQ.loading=null; }
    return _scVQ;
  })();
  return _scVQ.loading;
}
function scUpdateVerifyBadge(){
  var btn=document.getElementById('scx-vq-btn'), bd=document.getElementById('scx-vq-badge');
  if(!btn) return;
  if(!scIsVerifier()){ btn.style.display='none'; return; }
  btn.style.display='';
  var n=scPendingVerifications().length;
  if(bd){ bd.textContent=n>99?'99+':String(n); bd.style.display=n?'':'none'; }
}
function scVqItemHTML(p,onclick){
  var d=scDayDef(p.rec.progId||choState.progId,p.di)||{};
  return '<div class="scx-vq-item" onclick="'+onclick+'">'
    +'<div class="scx-vq-day"><small>DAY</small>'+String(p.di+1).padStart(2,'0')+'</div>'
    +'<div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:12.5px;color:var(--t1);">'+scEsc(p.name)+' <span style="color:var(--t3);font-weight:700;">· '+scEsc(p.role)+'</span></div>'
    +'<div style="font-size:11px;color:var(--t3);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+scEsc(d.title||d.service||'')
    +' · '+p.left+' of '+p.plan.required.length+' to check'+(p.plan.sampled?' (sample of '+p.plan.idx.length+')':'')+(p.rec.updatedAt?' · '+scFmtDate(p.rec.updatedAt):'')+'</div></div>'
    +'<i class="ti ti-chevron-right" style="color:#93C5FD;"></i></div>';
}
function scRenderWsVerify(){
  var el=document.getElementById('ws-verify-section'); if(!el) return;
  if(!scIsVerifier()){ el.style.display='none'; el.innerHTML=''; return; }
  var list=scPendingVerifications();
  el.style.display='';
  el.innerHTML='<div class="scx-vq-sec"><div class="hd">🛡️ '+scEsc(t('Cards to verify'))+' ('+list.length+')</div>'
    +(list.length?list.slice(0,6).map(function(p){ return scVqItemHTML(p,'scOpenVerifyDay('+(+p.di)+')'); }).join('')
      +(list.length>6?'<button class="scx-btn sm ghost" style="margin-top:10px;" onclick="scOpenVerifyQueue()">View all '+list.length+'</button>':'')
      :'<div class="scx-vp-none">'+scEsc(t('Nothing waiting — all submitted cards are verified.'))+'</div>')+'</div>';
}
function scOpenVerifyQueue(){
  if(!scIsVerifier()) return;
  var list=scPendingVerifications();
  var ov=document.createElement('div'); ov.className='scx-ov';
  ov.innerHTML='<div class="scx-box wide"><div class="scx-hd"><span style="font-size:20px;">🛡️</span><div class="scx-title">'+scEsc(t('Cards to verify'))+' ('+list.length+')</div></div>'
    +'<div class="scx-body" style="max-height:60vh;overflow:auto;">'+(list.length?list.map(function(p){ return scVqItemHTML(p,'scOpenVerifyDay('+(+p.di)+')'); }).join(''):'<div class="scx-vp-none">'+scEsc(t('Nothing waiting — all submitted cards are verified.'))+'</div>')+'</div>'
    +'<div class="scx-foot"><button class="scx-btn ghost" data-x="1">Close</button></div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov||e.target.getAttribute('data-x')||e.target.closest('.scx-vq-item')) ov.remove(); });
  document.body.appendChild(ov);
}
function scOpenVerifyDay(di){
  document.querySelectorAll('.scx-ov').forEach(function(o){ if(o.querySelector('.scx-vq-item')) o.remove(); });
  var ws=document.getElementById('welcome-screen');
  if(ws&&ws.classList.contains('vis')){ try{ wsMarkSeen(); }catch(e){} ws.classList.remove('vis'); showCHOMain(); }
  if(choState.view==='board'&&typeof switchView==='function'){ try{ switchView('cards'); }catch(e){} }
  selectDay(di+1);
  setTimeout(function(){ var p=document.getElementById('scx-vpanel'); if(p&&p.scrollIntoView) p.scrollIntoView({behavior:'smooth',block:'start'}); },150);
}
function scVerifyPanelHTML(di){
  var ctx=scVCtx(choState.facilityCode); if(!ctx) return '';
  var rows=[], notDone=[], pendingN=0;
  Object.keys(ctx.roster).filter(function(m){ return scVCanMob(ctx,m); })
    .sort(function(a,b){ return String(ctx.roster[a].name||a).localeCompare(ctx.roster[b].name||b); })
    .forEach(function(mob){
      var st=ctx.roster[mob]; if(!scVIdx(ctx.progId,di,st.role||'CHO').length) return;
      var rec=scVRec(ctx,mob,di);
      if(!rec||!rec.taskDone){ notDone.push(scEsc(st.name||mob)+(rec&&rec.sentBackAt?' <span class="scx-vp-pill back">sent back</span>':'')); return; }
      if(!rec.verified) pendingN++;
      rows.push(scVStaffHTML(ctx,mob,di));
    });
  return '<div class="scx-vp" id="scx-vpanel"><div class="scx-vp-hd"><i class="ti ti-shield-check" style="font-size:16px;"></i><div>Staff submissions · Day '+String(di+1).padStart(2,'0')
    +'<div class="sub">'+pendingN+' awaiting your verification</div></div><button onclick="scReloadVerifyPanel('+di+')"><i class="ti ti-refresh"></i> Reload</button></div>'
    +'<div class="scx-vp-body">'+(rows.join('')||'<div class="scx-vp-none">No staff have marked this day done yet.</div>')
    +(notDone.length?'<div class="scx-vp-none">Not marked done yet: '+notDone.join(', ')+'</div>':'')+'</div></div>';
}
function scMountVerifyPanel(di){
  var host=document.getElementById('card-container'); if(!host||!scIsVerifier()) return;
  var d=getDay(di); if(!d||!phcCheckAccess(di,d)) return;
  var old=document.getElementById('scx-vpanel'); if(old) old.remove();
  var box=document.createElement('div');
  if(_scVQ.at){ box.innerHTML=scVerifyPanelHTML(di); if(box.firstChild) host.appendChild(box.firstChild); }
  else{
    box.innerHTML='<div class="scx-vp" id="scx-vpanel"><div class="scx-vp-hd"><i class="ti ti-shield-check"></i> Staff submissions</div><div class="scx-vp-body"><div class="scx-vp-none">Loading…</div></div></div>';
    host.appendChild(box.firstChild);
    scLoadVerifyData(false).then(function(){ if(window._scLastDi===di) renderCard(di); scUpdateVerifyBadge(); });
  }
}
async function scReloadVerifyPanel(di){ await scLoadVerifyData(true); scUpdateVerifyBadge(); renderCard(di); }

// ── Supervisor / HealSol app: verification queue across facilities
var _scAdmV={mode:'list'};
function scAdmCanVerify(){ return appMode==='sc-supervisor'||appMode==='sc-admin'; }
function scAdmPendingAll(){
  var out=[]; if(!scAdmCanVerify()) return out;
  scVisibleFacilityCodes().forEach(function(code){ out=out.concat(scVPending(scVCtx(code))); });
  return out;
}
function scAdmUpdateBadge(){
  var btn=document.getElementById('scx-adm-vq-btn'), bd=document.getElementById('scx-adm-vq-badge');
  if(!btn) return;
  if(!scAdmCanVerify()){ btn.style.display='none'; return; }
  btn.style.display='';
  var n=scAdmPendingAll().length;
  if(bd){ bd.textContent=n>99?'99+':String(n); bd.style.display=n?'':'none'; }
}
async function scAdmOpenVerify(){
  if(!scAdmCanVerify()) return;
  await Promise.all([scLoadVerifyConfig(),scEnsureAdminEdits().catch(function(){})]);
  _scAdmV={mode:'list'};
  var ov=document.getElementById('scx-adm-vov');
  if(!ov){
    ov=document.createElement('div'); ov.className='scx-ov'; ov.id='scx-adm-vov';
    ov.addEventListener('click',function(e){ if(e.target===ov) scAdmCloseVerify(); });
    document.body.appendChild(ov);
  }
  scAdmVRender();
}
function scAdmCloseVerify(){ var ov=document.getElementById('scx-adm-vov'); if(ov) ov.remove(); scAdmUpdateBadge(); }
async function scAdmReloadVerify(){
  var ov=document.getElementById('scx-adm-vov'); var b=ov&&ov.querySelector('[data-reload]'); if(b) b.disabled=true;
  await Promise.all([scLoadMasterData(),scLoadVerifyConfig()]);
  try{ scRenderMasterDashboard(); }catch(e){}
  scAdmVRender();
}
function scAdmOpenCard(code,mob,di){ _scAdmV={mode:'card',code:code,mob:mob,di:di}; scAdmVRender(); }
function scAdmVRender(){
  var ov=document.getElementById('scx-adm-vov'); if(!ov) return;
  var head, body;
  if(_scAdmV.mode==='card'){
    var ctx=scVCtx(_scAdmV.code), mob=_scAdmV.mob, di=_scAdmV.di;
    var st=ctx?(ctx.roster[mob]||{}):{}, d=ctx?(scDayDef(ctx.progId,di)||{}):{};
    head='<button class="scx-btn sm ghost" onclick="_scAdmV={mode:\'list\'};scAdmVRender()"><i class="ti ti-arrow-left"></i> All cards</button>'
      +'<div class="scx-title" style="margin-left:6px;">'+scEsc(ctx&&ctx.facility?ctx.facility.name||_scAdmV.code:_scAdmV.code)+' · Day '+String(di+1).padStart(2,'0')
      +'<div style="font-size:11px;font-weight:600;color:var(--t3);">'+scEsc(d.title||'')+'</div></div>';
    body=ctx?(scVStaffHTML(ctx,mob,di)||'<div class="scx-vp-none">This card is no longer waiting for verification.</div>'):'<div class="scx-vp-none">Facility not available.</div>';
    body='<div class="scx-vp" style="border:none;background:none;margin:0;"><div class="scx-vp-body" style="padding:0;">'+body+'</div></div>';
  } else {
    var codes=scVisibleFacilityCodes(), total=0, groups='';
    codes.forEach(function(code){
      var list=scVPending(scVCtx(code)); if(!list.length) return; total+=list.length;
      var f=scMasterFacilities[code]||{};
      groups+='<div class="scx-vfac"><div class="scx-vfac-hd">🏥 '+scEsc(f.name||code)+' <span>'+scEsc(code)+' · '+list.length+' card'+(list.length===1?'':'s')+'</span></div>'
        +list.map(function(p){ return scVqItemHTML(p,'scAdmOpenCard(\''+scJs(code)+'\',\''+scJs(p.mob)+'\','+p.di+')'); }).join('')+'</div>';
    });
    head='<span style="font-size:20px;">🛡️</span><div class="scx-title">Verification queue ('+total+')'
      +'<div style="font-size:11px;font-weight:600;color:var(--t3);">CHO & MO cards · '+codes.length+' facilit'+(codes.length===1?'y':'ies')+' · sample: all gaps + '+_scVCfg.pct+'% of Full scores (min '+_scVCfg.min+')</div></div>';
    body=groups||'<div class="scx-vp-none" style="padding:18px;text-align:center;">Nothing waiting — all submitted CHO/MO cards are verified.</div>';
  }
  ov.innerHTML='<div class="scx-box wide scx-vbox"><div class="scx-hd" style="gap:8px;flex-wrap:wrap;">'+head
    +'<div style="margin-left:auto;display:flex;gap:6px;">'
    +(appMode==='sc-admin'&&_scAdmV.mode==='list'?'<button class="scx-btn sm ghost" onclick="scAdmVerifySettings()"><i class="ti ti-adjustments"></i> Sampling</button>':'')
    +'<button class="scx-btn sm ghost" data-reload="1" onclick="scAdmReloadVerify()"><i class="ti ti-refresh"></i> Reload</button>'
    +'<button class="scx-btn sm ghost" onclick="scAdmCloseVerify()"><i class="ti ti-x"></i></button></div></div>'
    +'<div class="scx-body scx-vbody">'+body+'</div></div>';
}
async function scAdmVerifySettings(){
  if(appMode!=='sc-admin') return scDeny('Verification settings');
  var v=await scDialog({title:'Verification sampling',icon:'🎯',okLabel:'Save',
    message:'For CHO and MO cards, the verifier always checks every Half, Zero and re-attempted checkpoint, plus a random share of the Full scores. The rest are accepted on completion. Set 100% to check every checkpoint.',
    fields:[{key:'pct',label:'Share of Full scores to check (%)',type:'number',value:String(_scVCfg.pct),required:true},
            {key:'min',label:'Minimum Full scores to check per card',type:'number',value:String(_scVCfg.min),required:true}]});
  if(!v) return;
  var p=Math.round(+v.pct), m=Math.round(+v.min);
  if(!(p>=1&&p<=100)||!(m>=0&&m<=50)){ showToast('Enter a share between 1 and 100% and a minimum between 0 and 50.','err'); return; }
  var ok=await fbSet('shared/sc_verify_config',{pct:p,min:m,updatedAt:scNowIso(),updatedBy:'HealSol Admin'});
  if(ok){ _scVCfg={pct:p,min:m}; showToast('Sampling saved.','ok'); scAdmVRender(); } else showToast('Could not save.','err');
}

// Hooks: card view, welcome screen, app start, dashboard
(function(){
  var oRender=renderCard;
  renderCard=function(di){ oRender.apply(this,arguments); try{ if(scIsVerifier()) scMountVerifyPanel(di); }catch(e){ console.warn(e); } };
  var oWs=showWelcomeScreen;
  showWelcomeScreen=function(){ oWs.apply(this,arguments); try{ scRenderWsVerify(); scUpdateVerifyBadge(); }catch(e){} };
  var oStart=scStartApp;
  scStartApp=async function(){
    _scVQ={roster:null,progress:null,at:0,loading:null};
    scUpdateVerifyBadge();
    await oStart.apply(this,arguments);
    if(scIsVerifier()){
      await scLoadVerifyData(true);
      scRenderWsVerify(); scUpdateVerifyBadge();
      var ws=document.getElementById('welcome-screen');
      if(!(ws&&ws.classList.contains('vis'))&&typeof window._scLastDi==='number') renderCard(window._scLastDi);
    } else { scRenderWsVerify(); }
  };
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments); try{ scAdmUpdateBadge(); }catch(e){} return r; };
})();
Object.assign(HINDI_UI,{'Verification has started on this card — ask your verifier to send it back.':'इस कार्ड का सत्यापन शुरू हो चुका है — सत्यापनकर्ता से इसे वापस भेजने को कहें।','You cannot verify this card.':'आप यह कार्ड सत्यापित नहीं कर सकते।','Your cards are verified by':'आपके कार्ड सत्यापित करेंगे:','cards are verified by':'कार्ड सत्यापित करेंगे:',
  'You cannot send back this card.':'आप यह कार्ड वापस नहीं भेज सकते।','Awaiting':'प्रतीक्षा:','verifies':'सत्यापित करेंगे','Verified by':'सत्यापनकर्ता',
  'Only a CHO or MO can verify cards.':'केवल CHO या MO ही कार्ड सत्यापित कर सकते हैं।',
  'Your own cards are verified by another CHO/MO.':'आपके अपने कार्ड किसी अन्य CHO/MO द्वारा सत्यापित होंगे।',
  'Awaiting CHO/MO':'CHO/MO की प्रतीक्षा','CHO/MO verifies':'CHO/MO सत्यापित करेंगे','Verified by CHO / MO':'CHO / MO द्वारा सत्यापित',
  'Cards to verify':'सत्यापन हेतु कार्ड','Nothing waiting — all submitted cards are verified.':'कुछ भी लंबित नहीं — सभी कार्ड सत्यापित हैं।',
  'This card has already been verified.':'यह कार्ड पहले ही सत्यापित हो चुका है।','Undo Mark Done — redo this card':'पूर्ण चिह्न हटाएँ — कार्ड दोबारा करें'});

