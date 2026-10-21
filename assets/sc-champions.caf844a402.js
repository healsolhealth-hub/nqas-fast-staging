
// ══════════════════════════════════════════════════════════════
// BUILD 3 — Quality Champions & peer review sessions
// Firebase:
//   sc_champions/{mobile} = {name, mobile, password, homeCode, homeName, accreditationYear, district,
//                            supervisorId, facilities:{CODE:true}, disabled, createdAt, createdBy, updatedAt}
//   sc_review_sessions/{id} = {code, championId, championName, supervisorId, startAt, durationMin, link,
//                              dayFrom, dayTo, note, status, createdBy, createdByRole, createdAt,
//                              scheduleApprovedBy, scheduleApprovedAt, cancelledBy, cancelledAt, cancelReason,
//                              results:{d{di}c{ci}:{result,finding,methods,via,comment,by,byId,at,scores:{mob:score}}},
//                              attendance:{mob:{name,role}}, summary:{…,items:[…]}, submittedAt,
//                              supervisorComment, returnedAt, returnedBy, approvedBy, approvedByRole, approvedAt, finalized:{…}}
//   status: proposed → scheduled → submitted → approved   (returned ↔ submitted; cancelled at any point before approval)
// ══════════════════════════════════════════════════════════════
var SCQ_MISSED_AFTER_H=24;      // no summary this many hours after the end → missed
var SCQ_SUGGESTED_MAX=5;        // facilities per Champion (brief: 3–5)
var _scq={champions:{},sessions:{},me:null,facs:{},prog:{},facSessions:{},loadedAt:0};

Object.assign(HINDI_UI,{
  'Peer review':'सहकर्मी समीक्षा','Peer review on':'सहकर्मी समीक्षा','Quality Champion':'क्वालिटी चैंपियन',
  'Join now':'अभी जुड़ें','Join opens 10 min before start':'शुरू होने से 10 मिनट पहले जुड़ सकेंगे','Prepare':'तैयारी करें',
  'Days':'दिन','Get ready for the peer review':'सहकर्मी समीक्षा की तैयारी',
  'Privacy — do not show patient names or identifiers on camera':'गोपनीयता — कैमरे पर मरीज़ों के नाम या पहचान न दिखाएँ',
  'Cover or fold register columns with patient names, mobile numbers and addresses before showing them.':'रजिस्टर दिखाने से पहले मरीज़ों के नाम, मोबाइल नंबर और पते वाले कॉलम ढक दें या मोड़ दें।',
  'What to show on camera':'कैमरे पर क्या दिखाना है','Checkpoints likely to be reviewed':'जिन चेकपॉइंट की समीक्षा हो सकती है',
  'with':'के साथ','Live now':'अभी लाइव','Scheduled':'निर्धारित'
});

// ── helpers ──────────────────────────────────────────────────
function scqKey(mob){ return String(mob||'').replace(/\D/g,'').slice(-10); }
function scqFacList(ch){ var f=(ch&&ch.facilities)||{}; return Object.keys(f).filter(function(k){ return f[k]; }); }
function scqPhase(s,now){
  now=now||Date.now(); var st=(s&&s.status)||'proposed';
  if(st!=='scheduled') return st;
  var t=scLiveTimes(s);
  if(isNaN(t.start)) return 'upcoming';
  if(now<t.start-SC_JOIN_EARLY_MIN*60000) return 'upcoming';
  if(now<=t.end) return 'live';
  if(now<=t.end+SCQ_MISSED_AFTER_H*3600000) return 'ended';
  return 'missed';
}
var SCQ_PHASE={
  proposed:{l:'Awaiting Supervisor approval',c:'#B45309',b:'#FEF3C7',i:'ti-hourglass'},
  upcoming:{l:'Scheduled',c:'#1D4ED8',b:'#DBEAFE',i:'ti-calendar-event'},
  live:{l:'Live now',c:'#15803D',b:'#DCFCE7',i:'ti-broadcast'},
  ended:{l:'Summary due',c:'#B45309',b:'#FEF3C7',i:'ti-file-pencil'},
  missed:{l:'Missed',c:'#B91C1C',b:'#FEE2E2',i:'ti-calendar-x'},
  submitted:{l:'Summary awaiting approval',c:'#7C3AED',b:'#EDE9FE',i:'ti-send'},
  returned:{l:'Returned for changes',c:'#B91C1C',b:'#FEE2E2',i:'ti-arrow-back-up'},
  approved:{l:'Approved',c:'#15803D',b:'#DCFCE7',i:'ti-circle-check'},
  cancelled:{l:'Cancelled',c:'#64748B',b:'#F1F5F9',i:'ti-ban'}
};
function scqPhaseChip(s){ var p=scqPhase(s), d=SCQ_PHASE[p]||SCQ_PHASE.upcoming;
  return '<span class="scq-chip" style="color:'+d.c+';background:'+d.b+';border-color:'+d.c+';"><i class="ti '+d.i+'"></i> '+scEsc(d.l)+'</span>'; }
function scqSorted(map,filter){
  return Object.keys(map||{}).map(function(id){ return Object.assign({id:id},map[id]); })
    .filter(filter||function(){ return true; })
    .sort(function(a,b){ return (Date.parse(a.startAt)||0)-(Date.parse(b.startAt)||0); });
}
function scqHours(list){ return Math.round(list.reduce(function(a,s){ return a+(Math.max(5,parseInt(s.durationMin,10)||60)); },0)/6)/10; }
function scqFacName(code){ var f=(_scq.facs||{})[code]||(scMasterFacilities||{})[code]; return (f&&f.name)||code; }
function scqFacToday(fac){
  var p=getProg((fac||{}).progId||'nqas_12A');
  if(!fac||!fac.startDate) return 0;
  var q=fac.startDate.split('-'); var st=new Date(+q[0],+q[1]-1,+q[2]); var now=new Date(); st.setHours(0,0,0,0); now.setHours(0,0,0,0);
  if(now<st) return -1;
  return computeCurrentDay(fac.startDate,p.days)-1;
}
function scqDayDateStr(fac,di){
  if(!fac||!fac.startDate) return '';
  var q=fac.startDate.split('-'); var d=new Date(+q[0],+q[1]-1,+q[2]+di);
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
}
function scqScoreTxt(s){ return s===2?'Full':s===1?'Half':s===0?'Zero':'—'; }
function scqScoreCls(s){ return s===2?'s2':s===1?'s1':s===0?'s0':'sn'; }

// ── data loading ─────────────────────────────────────────────
async function scqLoadChampions(){ _scq.champions=await fbGet('sc_champions')||{}; return _scq.champions; }
async function scqLoadSessions(){ _scq.sessions=await fbGet('sc_review_sessions')||{}; _scq.loadedAt=Date.now(); return _scq.sessions; }
function scqActorKind(){
  if(appMode==='sc-champion') return 'champion';
  if(appMode==='sc-supervisor') return 'supervisor';
  if(appMode==='sc-admin') return 'healsol';
  return 'other';
}
// Sessions this dashboard user may see
function scqVisibleSessions(){
  var k=scqActorKind();
  return scqSorted(_scq.sessions,function(s){
    if(k==='healsol') return true;
    if(k==='supervisor') return !!_scSup&&s.supervisorId===_scSup.id&&scSupAllowed(s.code);
    if(k==='champion') return !!_scq.me&&s.championId===_scq.me.id;
    return false;
  });
}
function scqVisibleChampions(){
  var k=scqActorKind();
  return Object.keys(_scq.champions||{}).filter(function(id){
    var c=_scq.champions[id]||{};
    if(k==='healsol') return true;
    if(k==='supervisor') return !!_scSup&&c.supervisorId===_scSup.id;
    return false;
  }).sort();
}
// Facility data context (same shape the verification engine uses)
function scqCtx(code,fac,progress){ return {code:code,progId:(fac||{}).progId||'nqas_12A',roster:(fac||{}).staff||{},progress:progress||{},facility:fac||{}}; }
async function scqFetchCtx(code){
  var r=await Promise.all([fbGet(scFacilityPath(code)),fbGet('sc_progress/'+code)]);
  return r[0]?scqCtx(code,r[0],r[1]||{}):null;
}
function scqRec(ctx,mob,di){
  var r=((ctx.progress||{})[mob]||{})['day_'+di]||null;
  if(r&&r.progId&&r.progId!==ctx.progId) return null;
  return r;
}

// ══════════════════════════════════════════════════════════════
// SCOPE — what a session reviews, in priority order
//   1. multi-role checkpoints where staff scored differently (or anyone gave Half/Zero)
//   2. every Half, Zero or re-attempted checkpoint
//   3. the random sample of Full scores (same seeded picks as Supervisor sampling)
// ══════════════════════════════════════════════════════════════
function scqScope(ctx,dayFrom,dayTo){
  var items=[], notDone=[], todayIdx=scqFacToday(ctx.facility);
  var mobs=Object.keys(ctx.roster||{}).filter(function(m){ var s=ctx.roster[m]; return s&&!s.disabled; });
  for(var di=Math.max(0,dayFrom-1);di<=dayTo-1;di++){
    if(di>todayIdx) break;
    var d=scDayDef(ctx.progId,di); if(!d) continue;
    // sampled Full picks on CHO/MO cards
    var picks={};
    mobs.forEach(function(mob){
      var role=(ctx.roster[mob]||{}).role||'CHO', rec=scqRec(ctx,mob,di);
      if(!rec||!rec.taskDone){
        if(scVIdx(ctx.progId,di,role).length) notDone.push({mob:mob,name:ctx.roster[mob].name||mob,role:role,di:di});
        return;
      }
      if(SC_SAMPLED_ROLES.indexOf(role)<0) return;
      var plan=scVPlan(ctx,mob,di,rec), gr=rec.gapRetries||{};
      plan.required.forEach(function(ci){ var s=scNormScore((rec.cpScores||[])[ci]); if(s===2&&!gr['c'+ci]) picks[ci]=1; });
    });
    (d.cps||[]).forEach(function(cp,ci){
      var owners=[];
      mobs.forEach(function(mob){
        var st=ctx.roster[mob]||{}, role=st.role||'CHO';
        if(!scCpForRole(cp,role)) return;
        var rec=scqRec(ctx,mob,di); if(!rec||!rec.taskDone) return;
        owners.push({mob:mob,name:st.name||mob,role:role,score:scNormScore((rec.cpScores||[])[ci]),
          retried:!!(rec.gapRetries&&rec.gapRetries['c'+ci]),verified:!!rec.verified});
      });
      if(!owners.length) return;
      var roles={}, scores={}; owners.forEach(function(o){ roles[o.role]=1; scores[String(o.score)]=1; });
      var multi=Object.keys(roles).length>1, differ=Object.keys(scores).length>1;
      var low=owners.some(function(o){ return o.score===0||o.score===1; });
      var retry=owners.some(function(o){ return o.retried; });
      var pr=(multi&&(differ||low))?1:(low||retry)?2:picks[ci]?3:0;
      if(!pr) return;
      items.push({key:'d'+di+'c'+ci,di:di,ci:ci,cp:cp,dayTitle:d.title,methods:(cp.method&&cp.method.length?cp.method:d.methods)||[],
        priority:pr,multi:multi,differ:differ,owners:owners});
    });
  }
  items.sort(function(a,b){ return (a.priority-b.priority)||(a.di-b.di)||(a.ci-b.ci); });
  return {items:items,notDone:notDone,todayIdx:todayIdx};
}
var SCQ_PRIORITY={1:'Different scores between staff',2:'Half, Zero or re-attempted',3:'Random sample of Full scores'};

// ══════════════════════════════════════════════════════════════
// FINALISE — only when the Supervisor approves the summary
// ══════════════════════════════════════════════════════════════
async function scqFinalize(id){
  var s=await fbGet('sc_review_sessions/'+id); if(!s) throw new Error('Session not found');
  var ch=(_scq.champions||{})[s.championId]||await fbGet('sc_champions/'+s.championId)||{};
  var ctx=await scqFetchCtx(s.code); if(!ctx) throw new Error('Facility not found');
  var a=scActor(), approver=appMode==='sc-admin'?'HealSol Admin':a.name, now=scNowIso();
  var results=s.results||{}, items=((s.summary||{}).items)||[];
  var byKey={}; items.forEach(function(it){ byKey[it.key]=it; });
  var champName=s.championName||ch.name||'Quality Champion';
  var cards=[], skipped=[];
  var mobs=Object.keys(ctx.roster||{}).filter(function(m){ var st=ctx.roster[m]; return st&&!st.disabled&&SC_SAMPLED_ROLES.indexOf(st.role||'CHO')>=0; });
  for(var i=0;i<mobs.length;i++){
    var mob=mobs[i], role=ctx.roster[mob].role||'CHO';
    for(var di=s.dayFrom-1;di<=s.dayTo-1;di++){
      if(!scVIdx(ctx.progId,di,role).length) continue;
      var rec=scqRec(ctx,mob,di);
      if(!rec||!rec.taskDone){ skipped.push({mob:mob,di:di,reason:'not marked done'}); continue; }
      if(rec.verified){ skipped.push({mob:mob,di:di,reason:'already verified by '+(rec.verifiedBy||'another verifier')}); continue; }
      var mine=items.filter(function(it){ return it.di===di&&(it.owners||[]).some(function(o){ return o.mob===mob; }); });
      var changed=mine.some(function(it){ var r=results[it.key]||{}; var snap=(r.scores||{})[mob];
        return snap!==undefined&&snap!==scNormScore((rec.cpScores||[])[it.ci]); });
      if(changed){ skipped.push({mob:mob,di:di,reason:'scores changed after the review'}); continue; }
      var unreviewed=mine.some(function(it){ return !results[it.key]; });
      if(unreviewed){ skipped.push({mob:mob,di:di,reason:'not all checkpoints reviewed'}); continue; }
      var n=Math.max(((scDayDef(ctx.progId,di)||{}).cps||[]).length,(rec.cpScores||[]).length);
      var scores=[]; for(var k=0;k<n;k++){ var sv=scNormScore((rec.cpScores||[])[k]); scores.push(sv===null?-1:sv); }
      var upd={}, lowered=false;
      mine.forEach(function(it){
        var r=results[it.key], cur=scNormScore((rec.cpScores||[])[it.ci]), sc=cur;
        if(r.result==='needs'&&(r.finding===0||r.finding===1)&&(cur===null||cur>r.finding)){ sc=r.finding; scores[it.ci]=sc; lowered=true; }
        upd['cpVerify/c'+it.ci]={by:champName,byRole:'Quality Champion',byMob:ch.mobile||s.championId,at:r.at||now,
          methods:r.methods||[],via:'video',comment:r.comment||'',score:sc,result:r.result,session:id,approvedBy:approver};
      });
      if(lowered) upd.cpScores=scores;
      var idx=scVIdx(ctx.progId,di,role);
      Object.assign(upd,{verified:true,verifiedBy:champName,verifiedByRole:'Quality Champion',verifiedByMob:ch.mobile||s.championId,
        verifiedAt:now,verifyMode:'peer-session',peerSessionId:id,peerApprovedBy:approver,peerApprovedByRole:appMode==='sc-admin'?'HealSol Admin':'Supervisor',
        peerApprovedAt:now,sampleChecked:mine.length,sampleAccepted:Math.max(0,idx.length-mine.length),updatedAt:now});
      if((s.summary||{}).comment){ upd.verifierComment=s.summary.comment; upd.commentDate=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
      await db.ref(scProgressPath(s.code,mob,di)).update(upd);
      cards.push(mob+'|'+di);
    }
  }
  // Needs work → corrective action (on the CHO's card when it is theirs, else the relevant staff member)
  var existing=await fbGet('sc_corrective/'+s.code)||{}, acts={};
  items.forEach(function(it){
    var r=results[it.key]; if(!r||r.result!=='needs') return;
    var owners=it.owners||[];
    var own=owners.find(function(o){ return SC_SAMPLED_ROLES.indexOf(o.role)>=0&&cards.indexOf(o.mob+'|'+it.di)>=0; })
      ||owners.find(function(o){ return o.score===0||o.score===1; })||owners[0];
    if(!own) return;
    var gapKey=scGapKey(own.mob,it.di,it.ci);
    var open=Object.keys(existing).some(function(k){ var x=existing[k]; return x&&x.gapKey===gapKey&&x.status!=='closed'; });
    if(open) return;
    var cp=(scDayDef(ctx.progId,it.di)||{}).cps||[]; cp=cp[it.ci]||{};
    var d=scDayDef(ctx.progId,it.di)||{};
    acts[scUid('ca')]=scClean({gapKey:gapKey,ownerMob:own.mob,di:it.di,ci:it.ci,progId:ctx.progId,cpText:cp.t||'',
      aoc:scAocKey(cp,d),me:cp.me||'',service:d.service||'',ownerName:own.name,
      action:'Peer review: '+(r.comment||'Needs work — reach Full compliance'),dueDate:scAddDays(scTodayStr(),7),
      assignedTo:own.mob,assignedToName:own.name,status:'open',assignedBy:champName,assignedByRole:'Quality Champion',
      assignedAt:now,source:'peer-review',sessionId:id,approvedBy:approver});
  });
  if(Object.keys(acts).length) await db.ref('sc_corrective/'+s.code).update(acts);
  var fin={cards:cards.length,cardList:cards,skipped:skipped,actions:Object.keys(acts).length,at:now};
  await db.ref('sc_review_sessions/'+id).update({status:'approved',approvedBy:approver,approvedByRole:appMode==='sc-admin'?'HealSol Admin':'Supervisor',
    approvedById:appMode==='sc-admin'?'healsol':((_scSup||{}).id||''),approvedAt:now,finalized:scClean(fin),updatedAt:now});
  return fin;
}

// ══════════════════════════════════════════════════════════════
// HEALSOL — manage Quality Champions
// ══════════════════════════════════════════════════════════════
function scqEnsureAdminPanel(){
  var sup=document.getElementById('sc-sup-list'); if(!sup) return null;
  var el=document.getElementById('scq-champ-panel');
  if(!el){
    el=document.createElement('div'); el.id='scq-champ-panel'; el.className='hs-only';
    el.style.cssText='background:var(--bgc);border-radius:14px;border:1px solid var(--br);padding:16px;margin-bottom:14px;';
    el.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">'
      +'<div style="font-size:13px;font-weight:800;color:var(--t1);font-family:\'Poppins\',sans-serif;display:flex;align-items:center;gap:6px;"><i class="ti ti-award" style="color:var(--teal);font-size:15px;"></i> Quality Champions</div>'
      +'<div style="display:flex;gap:6px;flex-wrap:wrap;">'
      +'<button class="scx-btn sm" onclick="scqEditChampion(null)"><i class="ti ti-user-plus"></i> Add Champion</button></div></div>'
      +'<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">CHOs from NQAS-accredited Sub-Centres who run video peer reviews for up to '+SCQ_SUGGESTED_MAX+' facilities each, under a Supervisor. They log in with their mobile number from the award button on the login screen.</div>'
      +'<div id="scq-champ-list"></div>';
    var host=sup.parentNode; host.parentNode.insertBefore(el,host.nextSibling);
  }
  return el;
}
function scqRenderChampionAdmin(){
  if(appMode!=='sc-admin'||!scqEnsureAdminPanel()) return;
  var list=document.getElementById('scq-champ-list'); if(!list) return;
  var ids=Object.keys(_scq.champions||{}).sort(function(a,b){ return String((_scq.champions[a]||{}).name).localeCompare((_scq.champions[b]||{}).name); });
  if(!ids.length){ list.innerHTML='<div class="scx-empty" style="padding:10px;">No Quality Champions yet.</div>'; return; }
  list.innerHTML=ids.map(function(id){
    var c=_scq.champions[id]||{}, facs=scqFacList(c), I=scJs(id), sup=(_scSupervisors||{})[c.supervisorId]||{};
    var mine=scqSorted(_scq.sessions,function(s){ return s.championId===id; });
    var done=mine.filter(function(s){ return s.status==='approved'; });
    return '<div class="scx-sup-row"'+(c.disabled?' style="opacity:0.6;"':'')+'><div class="scx-av">'+scEsc(String(c.name||id).charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:200px;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(c.name||id)+(c.disabled?' <span class="scx-chip end">Disabled</span>':'')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">'+scEsc(id)+' · '+scEsc(c.homeName||c.homeCode||'—')+(c.accreditationYear?' · accredited '+scEsc(c.accreditationYear):'')+(c.district?' · '+scEsc(c.district):'')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">Supervisor: '+scEsc(sup.name||c.supervisorId||'—')+' · '+facs.length+' facilit'+(facs.length===1?'y':'ies')+' · '+done.length+' approved session'+(done.length===1?'':'s')+' · '+scqHours(done)+' h</div></div>'
      +'<button class="scx-btn sm ghost" onclick="scqEditChampion(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button>'
      +'<button class="scx-btn sm ghost" onclick="scqToggleChampion(\''+I+'\')">'+(c.disabled?'Enable':'Disable')+'</button>'
      +'<button class="scx-btn sm danger" onclick="scqRemoveChampion(\''+I+'\')"><i class="ti ti-trash"></i></button></div>';
  }).join('');
}
async function scqEditChampion(id){
  if(appMode!=='sc-admin'){ showToast('Only HealSol Admin can manage Champions.','err'); return; }
  if(!Object.keys(_scSupervisors||{}).length) _scSupervisors=await fbGet('sc_supervisors')||{};
  var c=id?(_scq.champions[id]||{}):null;
  var supOpts=[{value:'',label:'— choose a Supervisor —'}].concat(Object.keys(_scSupervisors||{}).sort().map(function(k){ var s=_scSupervisors[k]||{}; return {value:k,label:(s.name||k)+' · '+k+(s.disabled?' (disabled)':'')}; }));
  var homeOpts=[{value:'',label:'Not enrolled in this app'}].concat(_scFacilityOptions());
  var v=await scDialog({title:c?'Edit Quality Champion':'Add Quality Champion',icon:'🏅',wide:true,okLabel:c?'Save':'Add Champion',
    message:c?null:'The Champion logs in with this mobile number. Allot only facilities that the chosen Supervisor looks after.',
    fields:[
      c?{key:'_m',label:'Mobile (login)',type:'info',value:id}:{key:'mobile',label:'Mobile number (used to log in)',type:'tel',required:true,placeholder:'10-digit mobile'},
      {key:'name',label:'Full name',required:true,value:c?c.name:'',placeholder:'e.g. Rekha Yadav'},
      {key:'password',label:c?'New password (leave blank to keep)':'Password',type:'text',required:!c,minLength:c?0:4,placeholder:c?'••••':'min 4 characters'},
      {key:'homeCode',label:'Own facility (if enrolled here)',type:'select',value:c?c.homeCode||'':'',options:homeOpts},
      {key:'homeName',label:'Own facility name',value:c?c.homeName||'':'',placeholder:'e.g. AAM-SC Bharatpur (NQAS accredited)'},
      {key:'accreditationYear',label:'NQAS accreditation year',type:'number',value:c?c.accreditationYear||'':'',placeholder:'e.g. 2025'},
      {key:'state',label:'State',type:'select',value:(c&&c.state)||'Uttar Pradesh',options:[]},
      {key:'district',label:'District',type:'select',value:c?c.district||'':'',options:[]},
      {key:'supervisorId',label:'Supervisor',type:'select',value:c?c.supervisorId||'':'',options:supOpts},
      {key:'facilities',label:'Allotted facilities (suggested 3–'+SCQ_SUGGESTED_MAX+')',type:'checklist',value:[],options:[],emptyText:'No facilities enrolled yet.'}
    ],
    onRender:function(I){
      // HealSol 21 Oct: state / district dropdowns; the facility list shows the chosen Supervisor's facilities, filtered by type and district, with search
      var stS=I.state.el, diS=I.district.el, spS=I.supervisorId.el, fc=I.facilities.el, first=true;
      hsxFillSelect(stS,hsxStates(),(c&&c.state)||'Uttar Pradesh');
      var fillD=function(keep){ var ds=hsxDistricts(stS.value); if(keep&&ds.indexOf(keep)<0) ds=[keep].concat(ds); hsxFillSelect(diS,ds,keep,'Choose a district…'); };
      fillD(c?c.district||'':'');
      var fb=hsxFilterBar(fc,['type','fdist','search']), hint=document.createElement('div'); hint.className='scx-hint'; fc.parentNode.insertBefore(hint,fc.nextSibling);
      var draw=function(){
        var keep=first?(c?scqFacList(c):[]):hsxVals(fc); first=false;
        var sf=spS.value?scSupFacilityList(_scSupervisors[spS.value]||{}):null, all=hsxFacItems().filter(function(it){ return !sf||sf.indexOf(it.value)>=0||keep.indexOf(it.value)>=0; });
        var tv=fb.type.value, dv=fb.fdist.value, types={}, dists={};
        all.forEach(function(it){ types[it.type]=1; if(it.district) dists[it.district]=1; });
        hsxFillSelect(fb.type,Object.keys(types).map(function(t){ return {value:t,label:hsxTypeName(t)}; }),tv,'All facility types');
        hsxFillSelect(fb.fdist,Object.keys(dists).sort(),dv,'All districts');
        var items=all.filter(function(it){ return (!fb.type.value||it.type===fb.type.value)&&(!fb.fdist.value||it.district===fb.fdist.value)||keep.indexOf(it.value)>=0; });
        hsxPicker(fc,items,keep,'district',spS.value?'This Supervisor has no facility of this kind yet.':'No facilities enrolled yet.');
        hsxPickerSearch(fc,fb.search.value);
        hint.textContent=spS.value?'Showing the '+all.length+' facilit'+(all.length===1?'y':'ies')+' this Supervisor looks after.':'Choose the Supervisor first — only their facilities can be allotted.';
      };
      stS.addEventListener('change',function(){ fillD(''); });
      [spS,fb.type,fb.fdist].forEach(function(x){ x.addEventListener('change',draw); });
      fb.search.addEventListener('input',function(){ hsxPickerSearch(fc,fb.search.value); });
      draw();
    },
    validate:function(v){
      if(!c){ var k=scqKey(v.mobile); if(!/^\d{10}$/.test(k)) return 'Enter a valid 10-digit mobile number.'; if(_scq.champions[k]) return 'A Champion with this mobile already exists.'; }
      if(v.password&&v.password.length<4) return 'Password must be at least 4 characters.';
      if(!v.supervisorId) return 'Choose the Supervisor who will guide this Champion.';
      var y=parseInt(v.accreditationYear,10); if(v.accreditationYear&&(!(y>=2015&&y<=new Date().getFullYear()))) return 'Enter a valid accreditation year.';
      if(v.homeCode&&v.facilities.indexOf(v.homeCode)>=0) return 'A Champion cannot review their own facility — untick '+v.homeCode+'.';
      var sf=scSupFacilityList(_scSupervisors[v.supervisorId]||{});
      var out=v.facilities.filter(function(f){ return sf.indexOf(f)<0; });
      if(out.length) return 'These facilities are not assigned to the chosen Supervisor: '+out.join(', ')+'. Assign them to the Supervisor first.';
      return null;
    }});
  if(!v) return;
  var key=c?id:scqKey(v.mobile);
  if(v.facilities.length>SCQ_SUGGESTED_MAX){
    var go=await showConfirm(v.facilities.length+' facilities is more than the suggested '+SCQ_SUGGESTED_MAX+'. Save anyway?','⚠️','Heavy load','Save anyway','var(--amber-dk)');
    if(!go) return;
  }
  var fmap={}; v.facilities.forEach(function(f){ fmap[f]=true; });
  var rec=Object.assign({},c||{createdAt:scNowIso(),createdBy:'HealSol Admin',disabled:false,mobile:key},{
    name:v.name.trim(),homeCode:v.homeCode||'',homeName:(v.homeName||'').trim()||(v.homeCode?scqFacName(v.homeCode):''),
    accreditationYear:v.accreditationYear?parseInt(v.accreditationYear,10):null,state:v.state||'',district:(v.district||'').trim(),
    supervisorId:v.supervisorId,facilities:fmap,updatedAt:scNowIso()});
  if(v.password) rec.password=v.password;
  if(!await fbSet('sc_champions/'+key,scClean(rec))){ showToast('Could not save — check connection.','err'); return; }
  _scq.champions[key]=rec; scqRenderChampionAdmin();
  showToast(c?'Champion updated.':'Champion '+rec.name+' added.','ok');
}
async function scqToggleChampion(id){
  if(appMode!=='sc-admin') return; var c=_scq.champions[id]; if(!c) return;
  if(!await fbSet('sc_champions/'+id+'/disabled',!c.disabled)){ showToast('Update failed.','err'); return; }
  c.disabled=!c.disabled; scqRenderChampionAdmin(); showToast('Champion '+(c.disabled?'disabled':'enabled')+'.','ok');
}
async function scqRemoveChampion(id){
  if(appMode!=='sc-admin') return; var c=_scq.champions[id]; if(!c) return;
  var open=scqSorted(_scq.sessions,function(s){ return s.championId===id&&['proposed','scheduled','submitted','returned'].indexOf(s.status)>=0; }).length;
  var ok=await showConfirm('Remove Quality Champion "'+(c.name||id)+'"?'+(open?' They have '+open+' open session'+(open===1?'':'s')+' — cancel or reassign those first.':'')+' Their approved session records are kept.','🗑️','Remove Champion','Remove','var(--red)');
  if(!ok) return;
  try{ await db.ref('sc_champions/'+id).remove(); }catch(e){ showToast('Remove failed.','err'); return; }
  delete _scq.champions[id]; scqRenderChampionAdmin(); showToast('Champion removed.','ok');
}

// ══════════════════════════════════════════════════════════════
// CHAMPION LOGIN & APP
// ══════════════════════════════════════════════════════════════
function scqEnsureLogin(){
  var sup=document.querySelector('#login-screen button[onclick="scShowSupLogin()"]');
  if(sup&&!document.getElementById('scq-login-btn')){
    var b=sup.cloneNode(true); b.id='scq-login-btn'; b.setAttribute('onclick','scqShowLogin()'); b.title='Quality Champion Login';
    b.innerHTML='<i class="ti ti-award" style="font-size:17px;"></i>'; sup.parentNode.insertBefore(b,sup.nextSibling);
  }
  var supPanel=document.getElementById('sc-sup-panel');
  if(supPanel&&!document.getElementById('sc-champ-panel')){
    var p=document.createElement('div'); p.className='login-card'; p.id='sc-champ-panel'; p.style.display='none';
    p.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">'
      +'<button onclick="scHideSecondaryLogin()" style="width:28px;height:28px;border-radius:7px;border:1.5px solid var(--br);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t3);font-size:13px;"><i class="ti ti-arrow-left"></i></button>'
      +'<div><div class="lc-title" style="margin-bottom:0;">Quality Champion Login</div><div style="font-size:10px;color:var(--t3);font-weight:600;">Peer reviews for the facilities allotted to you</div></div></div>'
      +'<div class="lc-field"><label class="lc-label">Mobile Number</label><input class="lc-input" id="scq-login-mob" type="tel" maxlength="10" inputmode="numeric" placeholder="10-digit mobile number" onkeydown="if(event.key===\'Enter\')document.getElementById(\'scq-login-pwd\').focus()"/></div>'
      +'<div class="lc-field"><label class="lc-label">Password</label><input class="lc-input" id="scq-login-pwd" type="password" placeholder="Enter password" onkeydown="if(event.key===\'Enter\')scqLogin()"/></div>'
      +'<div class="lc-err" id="scq-login-err"></div>'
      +'<button class="lc-btn admin" onclick="scqLogin()"><i class="ti ti-award" style="font-size:14px;"></i> Login as Quality Champion</button>';
    supPanel.parentNode.insertBefore(p,supPanel.nextSibling);
  }
}
function scqShowLogin(){ scqEnsureLogin(); scShowLoginPanel('sc-champ-panel'); setTimeout(function(){ var m=document.getElementById('scq-login-mob'); if(m) m.focus(); },100); }
async function scqLogin(){
  var mob=scqKey((document.getElementById('scq-login-mob')||{}).value);
  var pwd=((document.getElementById('scq-login-pwd')||{}).value||'').trim();
  var err=document.getElementById('scq-login-err');
  var fail=function(m){ if(err){ err.textContent=m; err.classList.add('show'); } };
  if(!/^\d{10}$/.test(mob)) return fail('Please enter your 10-digit mobile number.');
  if(!pwd) return fail('Please enter your password.');
  if(err) err.classList.remove('show');
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,1000);}); }
  var c=null; try{ c=await fbGet('sc_champions/'+mob); }catch(e){}
  if(!c) return fail('Mobile number not registered as a Quality Champion. Contact HealSol Academy.');
  if(c.disabled) return fail('This Champion account is disabled. Contact HealSol Academy.');
  if(!nfAuthOK('champion',mob) && pwd!==c.password) return fail('Incorrect password.');
  var p=document.getElementById('scq-login-pwd'); if(p) p.value='';
  await scqStartChampionApp(mob,c);
}
function scqEnsureApp(){
  var el=document.getElementById('scq-app');
  if(!el){ el=document.createElement('div'); el.id='scq-app'; el.className='scq-app'; document.body.appendChild(el); }
  return el;
}
async function scqStartChampionApp(id,c){
  appMode='sc-champion';
  _scq={champions:{},sessions:{},me:Object.assign({id:id},c),facs:{},prog:{},facSessions:{},loadedAt:0};
  _scq.champions[id]=c;
  document.getElementById('login-screen').style.display='none';
  var app=scqEnsureApp(); app.classList.add('vis');
  app.innerHTML='<div class="scx-empty" style="padding:60px 20px;"><i class="ti ti-loader" style="animation:spin 1s linear infinite;font-size:22px;"></i><br>Loading your facilities…</div>';
  await Promise.all([scEnsureAdminEdits(true).catch(function(){}),scLoadVerifyConfig().catch(function(){})]);
  await scqChampionReload();
}
async function scqChampionReload(){
  if(appMode!=='sc-champion'||!_scq.me) return;
  var c=await fbGet('sc_champions/'+_scq.me.id);
  if(!c||c.disabled){ await scAlert('Your Quality Champion access has been changed. Please contact HealSol Academy.','Access changed','🔒'); scqLogout(true); return; }
  _scq.me=Object.assign({id:_scq.me.id},c); _scq.champions[_scq.me.id]=c;
  var codes=scqFacList(c); _scq.facs={}; _scq.prog={};
  for(var i=0;i<codes.length;i++){
    var f=await fbGet(scFacilityPath(codes[i]));
    if(f){ _scq.facs[codes[i]]=f; _scq.prog[codes[i]]=await fbGet('sc_progress/'+codes[i])||{}; }
  }
  var all=await fbGet('sc_review_sessions')||{}, mine={};
  Object.keys(all).forEach(function(k){ if(all[k]&&all[k].championId===_scq.me.id) mine[k]=all[k]; });
  _scq.sessions=mine;
  scqRenderChampionApp();
}
function scqChampionCan(code){ return appMode==='sc-champion'&&!!_scq.me&&scqFacList(_scq.me).indexOf(code)>=0; }
function scqSessionRow(s,actions){
  var fac=(_scq.facs[s.code]||(scMasterFacilities||{})[s.code]||{});
  return '<div class="scq-sess"><div class="scq-sess-top"><div style="min-width:0;"><div class="scq-sess-t">'+scEsc(fac.name||s.code)+' <span class="scq-muted">· '+scEsc(s.code)+'</span></div>'
    +'<div class="scq-sess-m"><i class="ti ti-calendar-event"></i> '+scEsc(scFmtDateTime(s.startAt))+' · '+(parseInt(s.durationMin,10)||60)+' min · Days '+s.dayFrom+'–'+s.dayTo
    +(s.championName&&appMode!=='sc-champion'?' · <i class="ti ti-award"></i> '+scEsc(s.championName):'')+'</div>'
    +(s.status==='returned'&&s.supervisorComment?'<div class="scq-note bad"><i class="ti ti-message"></i> '+scEsc(s.supervisorComment)+'</div>':'')
    +(s.status==='cancelled'&&s.cancelReason?'<div class="scq-note"><i class="ti ti-ban"></i> '+scEsc(s.cancelReason)+'</div>':'')
    +'</div>'+scqPhaseChip(s)+'</div><div class="scq-sess-a">'+actions+'</div></div>';
}
function scqChampionActions(s){
  var p=scqPhase(s), I=scJs(s.id), a='';
  if(p==='proposed') a+='<button class="scx-btn sm ghost" onclick="scqEditSession(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button><button class="scx-btn sm danger" onclick="scqCancelSession(\''+I+'\')"><i class="ti ti-x"></i> Withdraw</button>';
  if(p==='live') a+='<button class="scx-btn sm" style="background:#16A34A;" onclick="scqJoin(\''+I+'\')"><i class="ti ti-video"></i> Join</button>';
  if(p==='upcoming') a+='<button class="scx-btn sm ghost" onclick="scqOpenWorkspace(\''+I+'\',true)"><i class="ti ti-eye"></i> Preview scope</button>';
  if(['live','ended','missed','returned'].indexOf(p)>=0) a+='<button class="scx-btn sm" onclick="scqOpenWorkspace(\''+I+'\')"><i class="ti ti-clipboard-check"></i> '+(p==='returned'?'Revise review':'Open review')+'</button>';
  if(p==='submitted'||p==='approved') a+='<button class="scx-btn sm ghost" onclick="scqOpenSummary(\''+I+'\')"><i class="ti ti-file-text"></i> Summary</button>';
  return a;
}
function scqRenderChampionApp(){
  var app=scqEnsureApp(); if(appMode!=='sc-champion'||!_scq.me) return;
  var me=_scq.me, codes=Object.keys(_scq.facs), list=scqVisibleSessions();
  var ph=function(p){ return list.filter(function(s){ return scqPhase(s)===p; }); };
  var done=ph('approved'), attention=list.filter(function(s){ return ['live','ended','missed','returned'].indexOf(scqPhase(s))>=0; });
  var facCards=codes.map(function(code){
    var f=_scq.facs[code], ctx=scqCtx(code,f,_scq.prog[code]), rd=scFacilityReadiness(ctx.progId,ctx.progress,ctx.roster);
    var next=list.filter(function(s){ return s.code===code&&['proposed','upcoming','live'].indexOf(scqPhase(s))>=0; })[0];
    var maxTo=function(f){ return list.filter(function(s){ return s.code===code&&f(s); }).map(function(s){ return +s.dayTo||0; }).reduce(function(a,b){ return Math.max(a,b); },0); };
    var last=maxTo(function(s){ return s.status==='approved'; }), planned=maxTo(function(s){ return ['cancelled','approved'].indexOf(s.status)<0; });
    var t=scqFacToday(f), days=getProg(ctx.progId).days;
    return '<div class="scq-fac"><div class="scq-fac-t">'+scEsc(f.name||code)+'</div><div class="scq-muted">'+scEsc(code)+' · '+scEsc(scPkgShort(ctx.progId))+' · '+(t<0?'Starts '+scEsc(formatDate(f.startDate)):'Day '+(t+1)+' / '+days)+'</div>'
      +'<div class="scq-fac-r"><b>'+(rd.max?rd.pct+'%':'—')+'</b> readiness · '+(last?'reviewed up to Day '+last:'not reviewed yet')+(planned>last?' · planned to Day '+planned:'')+'</div>'
      +'<div class="scq-muted">'+(next?'Next: '+scEsc(scFmtDateTime(next.startAt))+' · '+scEsc((SCQ_PHASE[scqPhase(next)]||{}).l||''):'No session planned')+'</div>'
      +'<button class="scx-btn sm" style="margin-top:8px;" onclick="scqEditSession(null,\''+scJs(code)+'\')"><i class="ti ti-calendar-plus"></i> Propose session</button></div>';
  }).join('')||'<div class="scx-empty">No facilities are allotted to you yet. HealSol Academy will allot them.</div>';
  app.innerHTML='<div class="scq-nav"><div style="display:flex;align-items:center;gap:10px;min-width:0;"><div class="sc-cho-nav-icon"><i class="ti ti-award"></i></div>'
    +'<div style="min-width:0;"><div class="scq-nav-t">Quality Champion — '+scEsc(me.name||me.id)+'</div><div class="scq-nav-s">'+scEsc(me.homeName||me.homeCode||'')+(me.accreditationYear?' · NQAS '+scEsc(me.accreditationYear):'')+(me.district?' · '+scEsc(me.district):'')+'</div></div></div>'
    +'<div style="display:flex;gap:6px;"><button class="scx-navbtn" onclick="scqChampionReload()"><i class="ti ti-refresh"></i> Refresh</button><button class="scx-navbtn" onclick="scqLogout()"><i class="ti ti-logout"></i> Logout</button></div></div>'
    +'<div class="scq-main">'
    +'<div class="scx-tiles">'+[['Facilities',codes.length],['Upcoming',ph('upcoming').length+ph('proposed').length],['Needs your action',attention.length],['Approved',done.length],['Hours',scqHours(done)]]
      .map(function(x){ return '<div class="scx-tile"><div class="scx-tile-v">'+x[1]+'</div><div class="scx-tile-l">'+x[0]+'</div></div>'; }).join('')+'</div>'
    +(attention.length?'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-bell"></i> Needs your action</div>'+attention.map(function(s){ return scqSessionRow(s,scqChampionActions(s)); }).join('')+'</div>':'')
    +'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-building-hospital"></i> My facilities</div><div class="scq-facs">'+facCards+'</div></div>'
    +'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-calendar"></i> All sessions</div>'
    +(list.length?list.slice().reverse().map(function(s){ return scqSessionRow(s,scqChampionActions(s)); }).join(''):'<div class="scx-empty">No sessions yet. Propose one from a facility card — your Supervisor approves it before it goes live.</div>')
    +'</div></div>';
}
async function scqLogout(force){
  if(!force){ var ok=await showConfirm('Logout of the Quality Champion app?','👋','Logout','Logout','var(--teal)'); if(!ok) return; }
  document.querySelectorAll('.scx-ov').forEach(function(o){ o.remove(); });
  var app=document.getElementById('scq-app'); if(app){ app.classList.remove('vis'); app.innerHTML=''; }
  document.getElementById('login-screen').style.display='';
  _scq={champions:{},sessions:{},me:null,facs:{},prog:{},facSessions:{},loadedAt:0};
  appMode=null; scHideSecondaryLogin();
}

// ══════════════════════════════════════════════════════════════
// SCHEDULING — Champion proposes; Supervisor approves, edits or cancels
// ══════════════════════════════════════════════════════════════
function scqPairsForActor(){
  var k=scqActorKind(), out=[];
  if(k==='champion'){ scqFacList(_scq.me).forEach(function(code){ out.push({code:code,ch:_scq.me.id}); }); return out; }
  scqVisibleChampions().forEach(function(id){
    var c=_scq.champions[id]||{}; if(c.disabled) return;
    scqFacList(c).forEach(function(code){ if(k==='healsol'||scSupAllowed(code)) out.push({code:code,ch:id}); });
  });
  return out;
}
function scqSuggestRange(code,exceptId){
  var last=scqSorted(_scq.sessions,function(s){ return s.code===code&&s.id!==exceptId&&s.status!=='cancelled'; })
    .map(function(s){ return +s.dayTo||0; }).reduce(function(a,b){ return Math.max(a,b); },0);
  var f=_scq.facs[code]||(scMasterFacilities||{})[code]||{}, days=getProg(f.progId||'nqas_12A').days;
  var from=Math.min(days,last+1); return {from:from,to:Math.min(days,from+6),days:days};
}
async function scqEditSession(id,code){
  var k=scqActorKind(); if(['champion','supervisor','healsol'].indexOf(k)<0) return;
  if(k!=='champion'&&!Object.keys(_scq.champions).length) await scqLoadChampions();
  var s=id?Object.assign({id:id},_scq.sessions[id]||{}):null;
  if(s){
    var p=scqPhase(s);
    if(k==='champion'&&p!=='proposed'){ showToast('Only your Supervisor can change a session after it is approved.','err'); return; }
    if(['submitted','approved','cancelled'].indexOf(s.status)>=0){ showToast('This session can no longer be edited.','err'); return; }
    if(k==='supervisor'&&s.supervisorId!==_scSup.id){ showToast('This session belongs to another Supervisor.','err'); return; }
  }
  var pairs=scqPairsForActor();
  if(!pairs.length){ await scAlert(k==='champion'?'No facilities are allotted to you yet.':'No Quality Champions with allotted facilities yet. HealSol Admin sets these up.','Schedule a session','ℹ️'); return; }
  var pairVal=s?(s.code+'|'+s.championId):(code?(code+'|'+(k==='champion'?_scq.me.id:(pairs.find(function(x){ return x.code===code; })||{}).ch)):pairs[0].code+'|'+pairs[0].ch);
  var rg=scqSuggestRange(pairVal.split('|')[0],s&&s.id);
  var dt=_scLocalDateTime(s?s.startAt:new Date(Date.now()+7*86400000).toISOString());
  var fields=[];
  if(k==='champion') fields.push({key:'pair',label:'Facility',type:'select',value:pairVal,options:pairs.map(function(x){ return {value:x.code+'|'+x.ch,label:scqFacName(x.code)+' · '+x.code}; })});
  else fields.push({key:'pair',label:'Facility · Champion',type:'select',value:pairVal,options:pairs.map(function(x){ return {value:x.code+'|'+x.ch,label:scqFacName(x.code)+' · '+x.code+' — '+((_scq.champions[x.ch]||{}).name||x.ch)}; })});
  fields.push({key:'date',label:'Date',type:'date',required:true,value:dt.date},
    {key:'time',label:'Start time',type:'time',required:true,value:s?dt.time:'11:00'},
    {key:'durationMin',label:'Duration (minutes)',type:'number',required:true,value:s?s.durationMin:60},
    {key:'link',label:'Zoom / Google Meet link',required:true,value:s?s.link:'',placeholder:'https://…'},
    {key:'dayFrom',label:'Review from Day',type:'number',required:true,value:s?s.dayFrom:rg.from},
    {key:'dayTo',label:'Review to Day',type:'number',required:true,value:s?s.dayTo:rg.to},
    {key:'note',label:'Note for the facility (optional)',type:'textarea',value:s?s.note||'':'',placeholder:'e.g. Please keep the ANC register and MCP cards ready'});
  var v=await scDialog({title:s?'Edit peer review session':(k==='champion'?'Propose a peer review session':'Schedule a peer review session'),icon:'📅',wide:true,
    okLabel:s?'Save changes':(k==='champion'?'Send for approval':'Schedule'),
    message:k==='champion'&&!s?'Your Supervisor approves the session before it appears in the facility\'s app.':k==='healsol'&&!s?'The facility\'s Supervisor approves the session before it appears in the facility\'s app.':null,
    fields:fields,
    validate:function(v){
      var st=new Date(v.date+'T'+v.time); if(isNaN(st.getTime())) return 'Enter a valid date and time.';
      if(!s&&st.getTime()<Date.now()) return 'Choose a time in the future.';
      var dur=parseInt(v.durationMin,10); if(!(dur>=15&&dur<=240)) return 'Duration must be between 15 and 240 minutes.';
      if(!scIsHttpUrl(v.link)) return 'Enter the full meeting link (starting with https://).';
      var f=_scq.facs[v.pair.split('|')[0]]||(scMasterFacilities||{})[v.pair.split('|')[0]]||{}, days=nfTypeOf(f)!=='sc'?(NF_LEVELS[nfTypeOf(f)].days||60):(getProg(f.progId||'nqas_12A')||{days:60}).days;
      var a=parseInt(v.dayFrom,10), b=parseInt(v.dayTo,10);
      if(!(a>=1&&b>=a&&b<=days)) return 'Day range must be within Days 1–'+days+' (from ≤ to).';
      return null;
    }});
  if(!v) return;
  var pr=v.pair.split('|'), ch=_scq.champions[pr[1]]||(k==='champion'?_scq.me:{})||{};
  if(k==='champion'&&!scqChampionCan(pr[0])){ showToast('This facility is not allotted to you.','err'); return; }
  var a=scActor(), now=scNowIso();
  var fsup=((_scq.facs||{})[pr[0]]||(scMasterFacilities||{})[pr[0]]||{}).supervisorId;
  var rec=Object.assign({},s||{},{code:pr[0],championId:pr[1],championName:ch.name||pr[1],supervisorId:fsup||ch.supervisorId||(s&&s.supervisorId)||'',
    startAt:new Date(v.date+'T'+v.time).toISOString(),durationMin:parseInt(v.durationMin,10),link:v.link.trim(),
    dayFrom:parseInt(v.dayFrom,10),dayTo:parseInt(v.dayTo,10),note:(v.note||'').trim(),updatedAt:now,updatedBy:a.name});
  delete rec.id;
  if(!s){
    Object.assign(rec,{createdAt:now,createdBy:a.name,createdByRole:k==='champion'?'Quality Champion':(k==='healsol'?'HealSol Admin':'Supervisor')});
    if(k==='champion'||k==='healsol') rec.status='proposed';   // HealSol's sessions also go to the Supervisor to approve (21 Oct)
    else Object.assign(rec,{status:'scheduled',scheduleApprovedBy:a.name,scheduleApprovedAt:now});
  }
  var sid=s?s.id:scUid('rs');
  if(!await fbSet('sc_review_sessions/'+sid,scClean(rec))){ showToast('Could not save — check connection.','err'); return; }
  _scq.sessions[sid]=rec;
  showToast(s?'Session updated.':(k==='champion'?'Sent to your Supervisor for approval.':k==='healsol'?'Scheduled — sent to the facility\'s Supervisor to approve.':'Session scheduled.'),'ok');
  scqAfterChange();
}
async function scqApproveSchedule(id){
  var k=scqActorKind(); if(k!=='supervisor'&&k!=='healsol') return;
  var s=await fbGet('sc_review_sessions/'+id);
  if(!s||s.status!=='proposed'){ showToast('This session is no longer waiting for approval.','err'); await scqLoadSessions(); scqAfterChange(); return; }
  if(k==='supervisor'&&(s.supervisorId!==_scSup.id||!scSupAllowed(s.code))){ showToast('This session belongs to another Supervisor.','err'); return; }
  var now=scNowIso();
  await db.ref('sc_review_sessions/'+id).update({status:'scheduled',scheduleApprovedBy:k==='healsol'?'HealSol Admin':scActor().name,scheduleApprovedAt:now,updatedAt:now});
  _scq.sessions[id]=Object.assign(s,{status:'scheduled',scheduleApprovedBy:k==='healsol'?'HealSol Admin':scActor().name,scheduleApprovedAt:now});
  showToast('Session approved — it now shows in the facility\'s app.','ok');
  scqAfterChange();
}
async function scqCancelSession(id){
  var k=scqActorKind(); var s=_scq.sessions[id]; if(!s) return;
  if(k==='champion'&&s.status!=='proposed'){ showToast('Only your Supervisor can cancel an approved session.','err'); return; }
  if(k==='supervisor'&&s.supervisorId!==_scSup.id){ showToast('This session belongs to another Supervisor.','err'); return; }
  if(['submitted','approved','cancelled'].indexOf(s.status)>=0){ showToast('This session can no longer be cancelled.','err'); return; }
  var v=await scDialog({title:k==='champion'?'Withdraw proposed session':'Cancel session',icon:'🚫',okLabel:k==='champion'?'Withdraw':'Cancel session',okColor:'var(--red)',
    message:scqFacName(s.code)+' · '+scFmtDateTime(s.startAt),
    fields:[{key:'reason',label:'Reason',type:'textarea',required:k!=='champion',placeholder:'e.g. Facility closed for a VHND that day'}]});
  if(!v) return;
  var now=scNowIso(), upd={status:'cancelled',cancelledBy:scActor().name,cancelledByRole:k==='champion'?'Quality Champion':(k==='healsol'?'HealSol Admin':'Supervisor'),cancelledAt:now,cancelReason:(v.reason||'').trim(),updatedAt:now};
  try{ await db.ref('sc_review_sessions/'+id).update(upd); }catch(e){ showToast('Could not cancel — check connection.','err'); return; }
  Object.assign(s,upd); showToast(k==='champion'?'Proposal withdrawn.':'Session cancelled.','ok'); scqAfterChange();
}
function scqJoin(id){
  var s=_scq.sessions[id]||_scq.facSessions[id]; if(!s) return;
  if(scqPhase(s)!=='live'){ showToast('The session is not open for joining right now.','err'); return; }
  if(!scIsHttpUrl(s.link)){ showToast('Meeting link is missing or invalid.','err'); return; }
  window.open(s.link,'_blank','noopener');
}
function scqAfterChange(){
  if(appMode==='sc-champion') scqRenderChampionApp();
  else{ scqUpdateBadge(); if(document.getElementById('scq-rv-body')) scqRenderReviews(); }
}

// ══════════════════════════════════════════════════════════════
// CHAMPION WORKSPACE — review each checkpoint in scope
// ══════════════════════════════════════════════════════════════
var _scqWs=null;   // {id, s, ctx, scope, preview, draft:{key:{result,finding,methods}}}
function scqOwnerScores(it){
  return it.owners.map(function(o){ return '<span class="scq-sc '+scqScoreCls(o.score)+'">'+scEsc(o.role)+': '+scqScoreTxt(o.score)+'</span>'; }).join('<span class="scq-dot">·</span>');
}
async function scqOpenWorkspace(id,preview){
  if(appMode!=='sc-champion') return;
  var s=await fbGet('sc_review_sessions/'+id);
  if(!s||s.championId!==_scq.me.id||!scqChampionCan(s.code)){ showToast('This session is not assigned to you.','err'); return; }
  _scq.sessions[id]=s;
  var p=scqPhase(s);
  if(!preview&&['live','ended','missed','returned'].indexOf(p)<0){ showToast(p==='upcoming'?'The review opens '+SC_JOIN_EARLY_MIN+' minutes before the session starts.':'This session cannot be reviewed now.','err'); return; }
  var ctx=await scqFetchCtx(s.code); if(!ctx){ showToast('Facility not found.','err'); return; }
  _scq.facs[s.code]=ctx.facility; _scq.prog[s.code]=ctx.progress;
  _scqWs={id:id,s:s,ctx:ctx,scope:scqScope(ctx,s.dayFrom,s.dayTo),preview:!!preview||p==='upcoming',draft:{}};
  scqRenderWorkspace();
}
function scqRenderWorkspace(){
  var W=_scqWs; if(!W) return;
  document.querySelectorAll('.scx-ov.scq-ws').forEach(function(o){ o.remove(); });
  var s=W.s, res=s.results||{}, items=W.scope.items, fac=W.ctx.facility, p=scqPhase(s);
  var reviewed=items.filter(function(it){ return res[it.key]; }).length;
  var groups=[1,2,3].map(function(pr){
    var g=items.filter(function(it){ return it.priority===pr; }); if(!g.length) return '';
    return '<div class="scq-sec"><div class="scq-sec-t">'+pr+'. '+scEsc(SCQ_PRIORITY[pr])+' ('+g.length+')</div>'+g.map(scqItemHTML).join('')+'</div>';
  }).join('');
  var nd=W.scope.notDone;
  var roster=W.ctx.roster, att=s.attendance||{};
  var attHTML=Object.keys(roster).filter(function(m){ return roster[m]&&!roster[m].disabled; }).map(function(m){
    var st=roster[m]; return '<label class="scq-att"><input type="checkbox" data-att="'+scEsc(m)+'" '+(att[m]?'checked':'')+(W.preview?' disabled':'')+'> '+scEsc(st.name||m)+' <span class="scq-muted">'+scEsc(st.role||'')+'</span></label>';
  }).join('');
  var ov=document.createElement('div'); ov.className='scx-ov scq-ws';
  ov.innerHTML='<div class="scx-box wide scq-wsbox"><div class="scx-hd"><div class="scx-hd-icon">🏅</div><div class="scx-hd-title">'+(W.preview?'Scope preview':'Peer review')+' — '+scEsc(fac.name||s.code)+'</div>'
    +'<button class="scx-x" onclick="scqCloseWorkspace()" title="Close"><i class="ti ti-x"></i></button></div>'
    +'<div class="scq-ws-meta">'+scqPhaseChip(s)+' <span><i class="ti ti-calendar-event"></i> '+scEsc(scFmtDateTime(s.startAt))+'</span> <span>Days '+s.dayFrom+'–'+s.dayTo+'</span>'
    +(p==='live'?' <button class="scx-btn sm" style="background:#16A34A;flex:0 0 auto;white-space:nowrap;" onclick="scqJoin(\''+scJs(s.id)+'\')"><i class="ti ti-video"></i> Join call</button>':'')+'</div>'
    +(s.status==='returned'&&s.supervisorComment?'<div class="scq-note bad"><i class="ti ti-message"></i> Supervisor: '+scEsc(s.supervisorComment)+'</div>':'')
    +(W.preview?'<div class="scq-note"><i class="ti ti-info-circle"></i> Read-only preview. Scoring the review opens '+SC_JOIN_EARLY_MIN+' minutes before the session starts. The scope may grow as staff mark more cards done.</div>':'')
    +'<div class="scq-progress"><div class="scq-bar"><div style="width:'+(items.length?Math.round(reviewed/items.length*100):0)+'%"></div></div><b>'+reviewed+' / '+items.length+'</b> reviewed</div>'
    +(items.length?groups:'<div class="scx-empty">Nothing to review yet in Days '+s.dayFrom+'–'+s.dayTo+': no cards in this range have been marked done.</div>')
    +(nd.length?'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-clock"></i> Not yet marked done ('+nd.length+')</div><div class="scq-muted">'+nd.map(function(x){ return scEsc(x.name)+' ('+scEsc(x.role)+') · Day '+(x.di+1); }).join(' · ')+'</div></div>':'')
    +'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-users"></i> Attendance — who joined from the facility</div><div class="scq-atts">'+(attHTML||'<span class="scq-muted">No staff registered.</span>')+'</div>'
    +(W.preview?'':'<button class="scx-btn sm ghost" style="margin-top:8px;" onclick="scqSaveAttendance()"><i class="ti ti-device-floppy"></i> Save attendance</button>')+'</div>'
    +'<div class="scx-foot" style="display:flex;gap:8px;margin-top:14px;"><button class="scx-btn ghost" onclick="scqCloseWorkspace()">Close</button>'
    +(W.preview?'':'<button class="scx-btn" onclick="scqSubmitSummary()"><i class="ti ti-send"></i> Review summary &amp; submit</button>')+'</div></div>';
  ov.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-act]'); if(!b||W.preview) return;
    var key=b.getAttribute('data-key'), act=b.getAttribute('data-act'), d=W.draft[key]=W.draft[key]||scqDraftFrom(key);
    if(act==='m'){ var m=b.getAttribute('data-m'), i=d.methods.indexOf(m); if(i>=0) d.methods.splice(i,1); else d.methods.push(m); }
    if(act==='confirmed'||act==='needs'){ d.result=act; if(act==='needs'&&d.finding==null) d.finding=1; }
    if(act==='f'){ d.finding=+b.getAttribute('data-f'); }
    if(act==='save'){ scqSaveResult(key); return; }
    scqRefreshItem(key);
  });
  document.body.appendChild(ov);
}
function scqDraftFrom(key){
  var r=(_scqWs.s.results||{})[key]||{}, it=_scqWs.scope.items.find(function(x){ return x.key===key; })||{};
  return {result:r.result||null,finding:r.finding!=null?r.finding:null,methods:(r.methods||[]).slice(),comment:r.comment||'',
    suggested:(it.methods||[])[0]||''};
}
function scqItemHTML(it){
  var W=_scqWs, r=(W.s.results||{})[it.key], d=W.draft[it.key]||scqDraftFrom(it.key), K=scEsc(it.key), dis=W.preview?' disabled':'';
  var stale=r&&it.owners.some(function(o){ var snap=(r.scores||{})[o.mob]; return snap!==undefined&&snap!==o.score; });
  var ms=['SI','RR','CI','OB'].filter(function(m){ return (W.ctx&&(scDayDef(W.ctx.progId,it.di)||{}).methods||[]).indexOf(m)>=0||(it.methods||[]).indexOf(m)>=0; });
  if(!ms.length) ms=['SI','RR','CI','OB'];
  return '<div class="scq-item'+(r&&!stale?' done':'')+(stale?' stale':'')+'" id="scq-it-'+K+'">'
    +'<div class="scq-item-hd"><span class="scq-day">Day '+(it.di+1)+'</span><span class="scq-muted">'+scEsc(it.dayTitle||'')+'</span>'
    +(r&&!stale?'<span class="scq-saved '+(r.result==='needs'?'bad':'')+'"><i class="ti '+(r.result==='needs'?'ti-alert-triangle':'ti-circle-check')+'"></i> '+(r.result==='needs'?'Needs work · '+scqScoreTxt(r.finding):'Confirmed')+'</span>':'')
    +(stale?'<span class="scq-saved bad"><i class="ti ti-refresh-alert"></i> Scores changed — review again</span>':'')+'</div>'
    +'<div class="scq-item-t">'+scEsc(it.cp.t||'')+'</div>'
    +'<div class="scq-item-sc">'+scqOwnerScores(it)+(it.cp.me?'<span class="scq-muted"> · '+scEsc(it.cp.me)+'</span>':'')+'</div>'
    +'<div class="scq-row"><span class="scq-lbl">Checked by</span>'+ms.map(function(m){
      return '<button type="button" class="scx-m'+(d.methods.indexOf(m)>=0?' on':'')+(m===d.suggested?' sug':'')+'" data-act="m" data-key="'+K+'" data-m="'+m+'"'+dis+'>'+m+'</button>';
    }).join('')+'<span class="scq-video"><i class="ti ti-video"></i> via video</span></div>'
    +'<div class="scq-row"><button type="button" class="scq-res ok'+(d.result==='confirmed'?' on':'')+'" data-act="confirmed" data-key="'+K+'"'+dis+'><i class="ti ti-circle-check"></i> Confirmed</button>'
    +'<button type="button" class="scq-res bad'+(d.result==='needs'?' on':'')+'" data-act="needs" data-key="'+K+'"'+dis+'><i class="ti ti-alert-triangle"></i> Needs work</button>'
    +(d.result==='needs'?'<span class="scq-lbl" style="margin-left:6px;">Finding</span><button type="button" class="scx-m'+(d.finding===1?' on':'')+'" data-act="f" data-f="1" data-key="'+K+'"'+dis+'>Half</button><button type="button" class="scx-m'+(d.finding===0?' on':'')+'" data-act="f" data-f="0" data-key="'+K+'"'+dis+'>Zero</button>':'')+'</div>'
    +'<div class="scq-row"><input class="scx-in scq-cmt" data-cmt="'+K+'" placeholder="'+(d.result==='needs'?'What needs to be fixed? (required)':'Comment (optional)')+'" value="'+scEsc(d.comment||'')+'"'+dis+'>'
    +(W.preview?'':'<button type="button" class="scx-btn sm" style="flex:0;" data-act="save" data-key="'+K+'">Save</button>')+'</div></div>';
}
function scqRefreshItem(key){
  var W=_scqWs, el=document.getElementById('scq-it-'+key); if(!el) return;
  var inp=el.querySelector('[data-cmt]'); if(inp) (W.draft[key]=W.draft[key]||scqDraftFrom(key)).comment=inp.value;
  var it=W.scope.items.find(function(x){ return x.key===key; }); if(!it) return;
  var tmp=document.createElement('div'); tmp.innerHTML=scqItemHTML(it); el.parentNode.replaceChild(tmp.firstChild,el);
}
async function scqSaveResult(key){
  var W=_scqWs; if(!W||W.preview) return;
  var el=document.getElementById('scq-it-'+key), inp=el&&el.querySelector('[data-cmt]');
  var d=W.draft[key]=W.draft[key]||scqDraftFrom(key); if(inp) d.comment=inp.value.trim();
  if(!d.result){ showToast('Choose Confirmed or Needs work.','err'); return; }
  if(d.result==='needs'&&!d.comment){ showToast('Say what needs to be fixed — it becomes the corrective action.','err'); return; }
  if(d.result==='needs'&&d.finding!==0&&d.finding!==1){ showToast('Choose the finding: Half or Zero.','err'); return; }
  var fresh=await fbGet('sc_review_sessions/'+W.id);
  if(!fresh||fresh.championId!==_scq.me.id||['scheduled','returned'].indexOf(fresh.status)<0||['live','ended','missed','returned'].indexOf(scqPhase(fresh))<0){
    showToast('This session can no longer be changed.','err'); return; }
  var it=W.scope.items.find(function(x){ return x.key===key; }), scores={};
  it.owners.forEach(function(o){ scores[o.mob]=o.score===null?-1:o.score; });
  var entry=scClean({result:d.result,finding:d.result==='needs'?d.finding:null,methods:d.methods,via:'video',comment:d.comment,
    by:_scq.me.name,byId:_scq.me.id,at:scNowIso(),scores:scores,priority:it.priority});
  if(!await fbSet('sc_review_sessions/'+W.id+'/results/'+key,entry)){ showToast('Could not save — check connection.','err'); return; }
  W.s.results=W.s.results||{}; W.s.results[key]=entry; delete W.draft[key];
  scqRenderWorkspace();
  var next=W.scope.items.find(function(x){ return !W.s.results[x.key]; });
  var ne=next&&document.getElementById('scq-it-'+next.key); if(ne&&ne.scrollIntoView) ne.scrollIntoView({block:'center',behavior:'smooth'});
}
async function scqSaveAttendance(){
  var W=_scqWs; if(!W||W.preview) return;
  var att={}; document.querySelectorAll('.scq-ws [data-att]').forEach(function(cb){ if(cb.checked){ var m=cb.getAttribute('data-att'), st=W.ctx.roster[m]||{}; att[m]={name:st.name||m,role:st.role||''}; } });
  try{ await db.ref('sc_review_sessions/'+W.id).update({attendance:Object.keys(att).length?att:null,updatedAt:scNowIso()}); }catch(e){ showToast('Could not save attendance.','err'); return; }
  W.s.attendance=att; showToast('Attendance saved ('+Object.keys(att).length+').','ok');
}
function scqCloseWorkspace(){ document.querySelectorAll('.scx-ov.scq-ws').forEach(function(o){ o.remove(); }); _scqWs=null; if(appMode==='sc-champion') scqRenderChampionApp(); }
function scqStats(s,items){
  var res=s.results||{}, reviewed=0, conf=0, needs=0;
  items.forEach(function(it){ var r=res[it.key]; if(!r) return; reviewed++; if(r.result==='needs') needs++; else conf++; });
  return {scope:items.length,reviewed:reviewed,confirmed:conf,needs:needs,
    differing:items.filter(function(it){ return it.priority===1&&it.differ; }).length,actions:needs,attendance:Object.keys(s.attendance||{}).length};
}
async function scqSubmitSummary(){
  var W=_scqWs; if(!W||W.preview) return;
  await scqSaveAttendance();
  var fresh=await scqFetchCtx(W.s.code); if(fresh){ W.ctx=fresh; W.scope=scqScope(fresh,W.s.dayFrom,W.s.dayTo); }
  var res=W.s.results||{}, items=W.scope.items;
  var missing=items.filter(function(it){ var r=res[it.key]; return !r||it.owners.some(function(o){ var sn=(r.scores||{})[o.mob]; return sn!==undefined&&sn!==(o.score===null?-1:o.score); }); });
  if(missing.length){ scqRenderWorkspace(); showToast(missing.length+' checkpoint'+(missing.length===1?' still needs':'s still need')+' a result (new or changed scores).','err'); return; }
  var st=scqStats(W.s,items);
  var v=await scDialog({title:'Submit session summary',icon:'📝',wide:true,okLabel:'Submit to Supervisor',
    message:'Checkpoints reviewed: '+st.reviewed+'\nConfirmed: '+st.confirmed+' · Needs work: '+st.needs+'\nDiffering scores found: '+st.differing+'\nCorrective actions to raise: '+st.actions+'\nAttendance: '+st.attendance
      +(W.scope.notDone.length?'\n\n'+W.scope.notDone.length+' card(s) in range are not marked done yet and will not be finalised by this session.':''),
    fields:[{key:'recordingUrl',label:'Recording link (optional)',value:(W.s.summary||{}).recordingUrl||'',placeholder:'https://…'},
      {key:'comment',label:'Overall comment for the facility and Supervisor',type:'textarea',value:(W.s.summary||{}).comment||'',placeholder:'Key strengths, main gaps, what to focus on next'}],
    validate:function(v){ return v.recordingUrl&&!scIsHttpUrl(v.recordingUrl)?'Recording link must start with https://':null; }});
  if(!v) return;
  var summary=scClean(Object.assign({},st,{recordingUrl:(v.recordingUrl||'').trim(),comment:(v.comment||'').trim(),
    notDone:W.scope.notDone.length,items:items.map(function(it){ return {key:it.key,di:it.di,ci:it.ci,priority:it.priority,differ:it.differ,
      owners:it.owners.map(function(o){ return {mob:o.mob,name:o.name,role:o.role,score:o.score===null?-1:o.score}; })}; })}));
  var now=scNowIso();
  try{ await db.ref('sc_review_sessions/'+W.id).update({status:'submitted',submittedAt:now,summary:summary,updatedAt:now}); }
  catch(e){ showToast('Could not submit — check connection.','err'); return; }
  showToast('Summary sent to your Supervisor for approval.','ok');
  scqCloseWorkspace(); await scqChampionReload();
}

// ══════════════════════════════════════════════════════════════
// SUMMARY VIEW (Champion read-only / Supervisor approve-return)
// ══════════════════════════════════════════════════════════════
async function scqOpenSummary(id){
  var s=await fbGet('sc_review_sessions/'+id); if(!s){ showToast('Session not found.','err'); return; }
  var k=scqActorKind();
  if(k==='champion'&&s.championId!==_scq.me.id) return;
  if(k==='supervisor'&&(s.supervisorId!==_scSup.id||!scSupAllowed(s.code))){ showToast('This session belongs to another Supervisor.','err'); return; }
  _scq.sessions[id]=s;
  var sm=s.summary||{}, res=s.results||{}, progId=((_scq.facs[s.code]||(scMasterFacilities||{})[s.code]||{}).progId)||'nqas_12A';
  var canDecide=k==='supervisor'&&s.status==='submitted';
  var tiles=[['Reviewed',sm.reviewed||0],['Confirmed',sm.confirmed||0],['Needs work',sm.needs||0],['Differing scores',sm.differing||0],['Actions',sm.actions||0],['Attendance',sm.attendance||0]];
  var rows=(sm.items||[]).map(function(it){
    var r=res[it.key]||{}, cp=((scDayDef(progId,it.di)||{}).cps||[])[it.ci]||{};
    return '<div class="scq-item '+(r.result==='needs'?'stale':'done')+'"><div class="scq-item-hd"><span class="scq-day">Day '+(it.di+1)+'</span><span class="scq-muted">'+scEsc(SCQ_PRIORITY[it.priority]||'')+'</span>'
      +'<span class="scq-saved '+(r.result==='needs'?'bad':'')+'">'+(r.result==='needs'?'Needs work · '+scqScoreTxt(r.finding):'Confirmed')+'</span></div>'
      +'<div class="scq-item-t">'+scEsc(cp.t||'')+'</div>'
      +'<div class="scq-item-sc">'+(it.owners||[]).map(function(o){ var sc=o.score<0?null:o.score; return '<span class="scq-sc '+scqScoreCls(sc)+'">'+scEsc(o.role)+': '+scqScoreTxt(sc)+'</span>'; }).join('<span class="scq-dot">·</span>')
      +' <span class="scq-muted">· '+scEsc((r.methods||[]).join(', ')||'—')+' via video</span></div>'
      +(r.comment?'<div class="scq-note">'+scEsc(r.comment)+'</div>':'')+'</div>';
  }).join('');
  var att=Object.keys(s.attendance||{}).map(function(m){ var a=s.attendance[m]; return scEsc(a.name||m)+' ('+scEsc(a.role||'')+')'; }).join(', ');
  var fin=s.finalized;
  var ov=document.createElement('div'); ov.className='scx-ov scq-sum';
  ov.innerHTML='<div class="scx-box wide"><div class="scx-hd"><div class="scx-hd-icon">📝</div><div class="scx-hd-title">Session summary — '+scEsc(scqFacName(s.code))+'</div><button class="scx-x" data-x="1"><i class="ti ti-x"></i></button></div>'
    +'<div class="scq-ws-meta">'+scqPhaseChip(s)+' <span>'+scEsc(scFmtDateTime(s.startAt))+'</span> <span>Days '+s.dayFrom+'–'+s.dayTo+'</span> <span><i class="ti ti-award"></i> '+scEsc(s.championName||'')+'</span></div>'
    +'<div class="scx-tiles">'+tiles.map(function(x){ return '<div class="scx-tile"><div class="scx-tile-v">'+x[1]+'</div><div class="scx-tile-l">'+x[0]+'</div></div>'; }).join('')+'</div>'
    +(sm.comment?'<div class="scq-note"><b>Champion:</b> '+scEsc(sm.comment)+'</div>':'')
    +'<div class="scq-muted" style="margin:6px 0;">Attendance: '+(att||'—')+(sm.recordingUrl?' · <a href="'+scEsc(sm.recordingUrl)+'" target="_blank" rel="noopener">Recording</a>':'')+(sm.notDone?' · '+sm.notDone+' card(s) not marked done':'')+'</div>'
    +(s.status==='returned'&&s.supervisorComment?'<div class="scq-note bad">Returned: '+scEsc(s.supervisorComment)+'</div>':'')
    +(fin?'<div class="scq-note ok"><i class="ti ti-circle-check"></i> Approved by '+scEsc(s.approvedBy||'')+' · '+fin.cards+' card(s) verified as peer-session · '+fin.actions+' corrective action(s) raised'
      +((fin.skipped||[]).length?'<br>'+fin.skipped.length+' card(s) not finalised: '+fin.skipped.slice(0,6).map(function(x){ return 'Day '+(x.di+1)+' — '+scEsc(x.reason); }).join('; '):'')+'</div>':'')
    +'<div class="scq-sec"><div class="scq-sec-t">Checkpoints ('+(sm.items||[]).length+') — spot-check as needed</div>'+(rows||'<div class="scx-empty">No checkpoints were in scope.</div>')+'</div>'
    +'<div class="scx-foot" style="display:flex;gap:8px;margin-top:12px;"><button class="scx-btn ghost" data-x="1">Close</button>'
    +(canDecide?'<button class="scx-btn danger" id="scq-return-btn"><i class="ti ti-arrow-back-up"></i> Return with comment</button><button class="scx-btn" id="scq-approve-btn"><i class="ti ti-circle-check"></i> Approve &amp; finalise</button>':'')+'</div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov||(e.target.closest&&e.target.closest('[data-x]'))) ov.remove(); });
  document.body.appendChild(ov);
  if(canDecide){
    ov.querySelector('#scq-approve-btn').onclick=function(){ scqApproveSummary(id,ov); };
    ov.querySelector('#scq-return-btn').onclick=function(){ scqReturnSummary(id,ov); };
  }
}
async function scqApproveSummary(id,ov){
  var k=scqActorKind(); if(k!=='supervisor'&&k!=='healsol') return;
  var s=await fbGet('sc_review_sessions/'+id);
  if(!s||s.status!=='submitted'){ showToast('This summary is no longer waiting for approval.','err'); if(ov) ov.remove(); return; }
  if(k==='supervisor'&&(s.supervisorId!==_scSup.id||!scSupAllowed(s.code))) return;
  var ok=await showConfirm('Approve this summary? CHO/MO cards in Days '+s.dayFrom+'–'+s.dayTo+' that are done and unchanged will be finalised as verified (peer session), and Needs-work items become gaps with corrective actions.','✅','Approve & finalise','Approve','var(--teal)');
  if(!ok) return;
  var btn=ov&&ov.querySelector('#scq-approve-btn'); if(btn){ btn.disabled=true; btn.textContent='Finalising…'; }
  var fin;
  try{ fin=await scqFinalize(id); }catch(e){ console.error(e); showToast('Could not finalise — '+(e.message||'check connection')+'.','err'); if(btn){ btn.disabled=false; btn.textContent='Approve & finalise'; } return; }
  if(ov) ov.remove();
  showToast('Approved · '+fin.cards+' card(s) verified · '+fin.actions+' action(s) raised.','ok');
  await scqLoadSessions();
  if(typeof scLoadMasterData==='function'){ try{ await scLoadMasterData(); scRenderMasterDashboard(); }catch(e){} }
  scqAfterChange();
}
async function scqReturnSummary(id,ov){
  var k=scqActorKind(); if(k!=='supervisor'&&k!=='healsol') return;
  var v=await scDialog({title:'Return summary to the Champion',icon:'↩️',okLabel:'Return',fields:[{key:'c',label:'What should the Champion change?',type:'textarea',required:true}]});
  if(!v) return;
  var s=await fbGet('sc_review_sessions/'+id); if(!s||s.status!=='submitted'){ showToast('This summary is no longer waiting for approval.','err'); return; }
  var now=scNowIso();
  await db.ref('sc_review_sessions/'+id).update({status:'returned',supervisorComment:v.c.trim(),returnedAt:now,returnedBy:k==='healsol'?'HealSol Admin':scActor().name,updatedAt:now});
  if(ov) ov.remove(); showToast('Returned to the Champion.','ok'); await scqLoadSessions(); scqAfterChange();
}

// ══════════════════════════════════════════════════════════════
// SUPERVISOR / HEALSOL — Peer Reviews (approvals, calendar, Champion load)
// ══════════════════════════════════════════════════════════════
var _scqTab='approve';
function scqPending(){ return scqVisibleSessions().filter(function(s){ return s.status==='proposed'||s.status==='submitted'; }); }
function scqEnsureNavBtn(){
  var vq=document.getElementById('scx-adm-vq-btn'); if(!vq) return null;
  var b=document.getElementById('scq-nav-btn');
  if(!b){ b=document.createElement('button'); b.className='scx-navbtn'; b.id='scq-nav-btn'; b.style.position='relative'; b.setAttribute('onclick','scqOpenReviews()'); b.title='Peer reviews';
    b.innerHTML='<i class="ti ti-award" style="font-size:13px;"></i> Peer Reviews<span class="scx-vq-badge" id="scq-nav-badge" style="display:none;"></span>';
    vq.parentNode.insertBefore(b,vq.nextSibling); }
  return b;
}
function scqUpdateBadge(){
  var b=scqEnsureNavBtn(); if(!b) return;
  var k=scqActorKind(); b.style.display=(k==='supervisor'||k==='healsol')?'':'none';
  var n=scqPending().length, bd=document.getElementById('scq-nav-badge');
  if(bd){ bd.textContent=n>99?'99+':String(n); bd.style.display=n?'':'none'; }
}
async function scqOpenReviews(tab){
  var k=scqActorKind(); if(k!=='supervisor'&&k!=='healsol') return;
  _scqTab=(typeof tab==='string'&&tab)?tab:'approve';
  await Promise.all([scqLoadChampions(),scqLoadSessions(),scLoadVerifyConfig().catch(function(){})]);
  document.querySelectorAll('.scx-ov.scq-rv').forEach(function(o){ o.remove(); });
  var ov=document.createElement('div'); ov.className='scx-ov scq-rv';
  ov.innerHTML='<div class="scx-box wide" style="max-width:920px;"><div class="scx-hd"><div class="scx-hd-icon">🏅</div><div class="scx-hd-title">Peer review sessions</div><button class="scx-x" data-x="1"><i class="ti ti-x"></i></button></div><div id="scq-rv-body"></div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov||(e.target.closest&&e.target.closest('[data-x]'))){ ov.remove(); } });
  document.body.appendChild(ov);
  scqRenderReviews(); scqUpdateBadge();
}
function scqReviewActions(s){
  var p=scqPhase(s), I=scJs(s.id), a='';
  if(scqActorKind()==='healsol') return (p==='submitted'||p==='approved')?'<button class="scx-btn sm ghost" onclick="scqOpenSummary(\''+I+'\')"><i class="ti ti-file-text"></i> Summary</button>':'';   // view only
  if(p==='proposed') a+='<button class="scx-btn sm" onclick="scqApproveSchedule(\''+I+'\')"><i class="ti ti-check"></i> Approve</button>';
  if(['proposed','upcoming','live','ended','missed','returned'].indexOf(p)>=0) a+='<button class="scx-btn sm ghost" onclick="scqEditSession(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button>';
  if(['proposed','upcoming','live','ended','missed','returned'].indexOf(p)>=0) a+='<button class="scx-btn sm danger" onclick="scqCancelSession(\''+I+'\')"><i class="ti ti-ban"></i> Cancel</button>';
  if(p==='submitted') a+='<button class="scx-btn sm" onclick="scqOpenSummary(\''+I+'\')"><i class="ti ti-file-check"></i> Review summary</button>';
  if(p==='approved') a+='<button class="scx-btn sm ghost" onclick="scqOpenSummary(\''+I+'\')"><i class="ti ti-file-text"></i> Summary</button>';
  return a;
}
function scqSetTab(t){ _scqTab=t; scqRenderReviews(); }
function scqRenderReviews(){
  var body=document.getElementById('scq-rv-body'); if(!body) return;
  var k=scqActorKind(), all=scqVisibleSessions(), pend=scqPending();
  var tabs=[['approve','Needs approval ('+pend.length+')'],['calendar','Calendar'],['load','Champion load']].concat(k==='healsol'?[['records','Records & hours']]:[]);
  var h='<div class="scx-tabs" style="margin-bottom:12px;">'+tabs.map(function(t){ return '<button class="scx-tab'+(_scqTab===t[0]?' on':'')+'" onclick="scqSetTab(\''+t[0]+'\')">'+scEsc(t[1])+'</button>'; }).join('')+'</div>'
    +(k==='healsol'?'<div class="scrv-intro">Supervisors approve Peer Review sessions and their summaries; you can schedule one with “+ Schedule a peer review”. To move a facility to another Supervisor or Champion, use Settings → People → Hand over a facility.</div>':'<button class="scx-btn" style="width:100%;margin-bottom:12px;" onclick="scqEditSession(null)"><i class="ti ti-calendar-plus"></i> Schedule a session</button>');
  if(_scqTab==='approve'){
    var prop=pend.filter(function(s){ return s.status==='proposed'; }), sub=pend.filter(function(s){ return s.status==='submitted'; });
    h+='<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-calendar-question"></i> Proposed sessions ('+prop.length+')</div>'+(prop.map(function(s){ return scqSessionRow(s,scqReviewActions(s)); }).join('')||'<div class="scx-empty">Nothing waiting.</div>')+'</div>'
      +'<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-file-check"></i> Summaries to approve ('+sub.length+')</div>'+(sub.map(function(s){ return scqSessionRow(s,scqReviewActions(s)); }).join('')||'<div class="scx-empty">Nothing waiting.</div>')+'</div>';
  } else if(_scqTab==='calendar'){
    var live=all.filter(function(s){ return s.status!=='cancelled'; });
    var byDay={}; live.forEach(function(s){ var d=(s.startAt||'').slice(0,10); (byDay[d]=byDay[d]||[]).push(s); });
    var days=Object.keys(byDay).sort(), today=scTodayStr();
    var up=days.filter(function(d){ return d>=today; }), past=days.filter(function(d){ return d<today; }).reverse();
    var render=function(d){ return '<div class="scq-cal-d">'+scEsc(new Date(d+'T00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}))+'</div>'+byDay[d].map(function(s){ return scqSessionRow(s,scqReviewActions(s)); }).join(''); };
    h+='<div class="scq-sec"><div class="scq-sec-t">Upcoming</div>'+(up.map(render).join('')||'<div class="scx-empty">No upcoming sessions.</div>')+'</div>'
      +'<div class="scq-sec"><div class="scq-sec-t">Past</div>'+(past.map(render).join('')||'<div class="scx-empty">No past sessions.</div>')+'</div>';
    var canc=all.filter(function(s){ return s.status==='cancelled'; });
    if(canc.length) h+='<div class="scq-sec"><div class="scq-sec-t">Cancelled ('+canc.length+')</div>'+canc.map(function(s){ return scqSessionRow(s,''); }).join('')+'</div>';
  } else if(_scqTab==='load'){
    var ids=scqVisibleChampions();
    h+=ids.length?'<div style="overflow-x:auto;"><table class="scq-tbl"><thead><tr><th>Champion</th><th>Facilities</th><th>Upcoming</th><th>Awaiting approval</th><th>Completed</th><th>Missed</th><th>Hours</th></tr></thead><tbody>'
      +ids.map(function(id){ var c=_scq.champions[id]||{}, m=all.filter(function(s){ return s.championId===id; });
        var cnt=function(f){ return m.filter(f).length; }, ap=m.filter(function(s){ return s.status==='approved'; });
        var nf=scqFacList(c).length;
        return '<tr><td><b>'+scEsc(c.name||id)+'</b>'+(c.disabled?' <span class="scx-chip end">Disabled</span>':'')+'<div class="scq-muted">'+scEsc(c.homeName||'')+'</div></td>'
          +'<td>'+nf+(nf>SCQ_SUGGESTED_MAX?' <span class="scq-warn">high</span>':'')+'</td>'
          +'<td>'+cnt(function(s){ return ['upcoming','live'].indexOf(scqPhase(s))>=0; })+'</td>'
          +'<td>'+cnt(function(s){ return s.status==='proposed'||s.status==='submitted'; })+'</td>'
          +'<td>'+ap.length+'</td><td>'+cnt(function(s){ return scqPhase(s)==='missed'; })+'</td><td>'+scqHours(ap)+'</td></tr>'; }).join('')
      +'</tbody></table></div>':'<div class="scx-empty">No Quality Champions '+(k==='supervisor'?'assigned to you':'yet')+'.</div>';
  } else {
    h+=scqRecordsHTML();
  }
  body.innerHTML=h;
}
function scqRecordsHTML(){
  var ids=Object.keys(_scq.champions||{}).sort();
  if(!ids.length) return '<div class="scx-empty">No Quality Champions yet.</div>';
  return '<button class="scx-btn sm ghost" style="margin-bottom:10px;" onclick="scqExportRecords()"><i class="ti ti-download"></i> Export CSV</button>'
    +ids.map(function(id){ var c=_scq.champions[id]||{}, ap=scqSorted(_scq.sessions,function(s){ return s.championId===id&&s.status==='approved'; });
      var facs={}; ap.forEach(function(s){ facs[s.code]=1; });
      return '<div class="scq-sec"><div class="scq-sec-t"><i class="ti ti-certificate"></i> '+scEsc(c.name||id)+' — '+ap.length+' approved session'+(ap.length===1?'':'s')+' · '+scqHours(ap)+' h · '+Object.keys(facs).length+' facilit'+(Object.keys(facs).length===1?'y':'ies')+'</div>'
        +(ap.length?'<table class="scq-tbl"><thead><tr><th>Date</th><th>Facility</th><th>Days</th><th>Minutes</th><th>Reviewed</th><th>Needs work</th><th>Approved by</th></tr></thead><tbody>'
          +ap.map(function(s){ var sm=s.summary||{}; return '<tr><td>'+scEsc(scFmtDateTime(s.startAt))+'</td><td>'+scEsc(scqFacName(s.code))+'</td><td>'+s.dayFrom+'–'+s.dayTo+'</td><td>'+(parseInt(s.durationMin,10)||60)+'</td><td>'+(sm.reviewed||0)+'</td><td>'+(sm.needs||0)+'</td><td>'+scEsc(s.approvedBy||'')+'</td></tr>'; }).join('')
          +'</tbody></table>':'<div class="scq-muted">No approved sessions yet.</div>')+'</div>';
    }).join('');
}
async function scqOpenRecords(){ await scqOpenReviews('records'); }
function scqCsvRows(){
  var rows=[['Champion','Champion mobile','Home facility','Accreditation year','District','Session date','Facility code','Facility','Days','Minutes','Checkpoints reviewed','Confirmed','Needs work','Attendance','Approved by','Approved at']];
  scqSorted(_scq.sessions,function(s){ return s.status==='approved'; }).forEach(function(s){
    var c=_scq.champions[s.championId]||{}, sm=s.summary||{};
    rows.push([c.name||s.championName||'',s.championId,c.homeName||c.homeCode||'',c.accreditationYear||'',c.district||'',s.startAt,s.code,scqFacName(s.code),s.dayFrom+'-'+s.dayTo,
      parseInt(s.durationMin,10)||60,sm.reviewed||0,sm.confirmed||0,sm.needs||0,sm.attendance||0,s.approvedBy||'',s.approvedAt||'']);
  });
  return rows;
}
function scqExportRecords(){
  var csv=scqCsvRows().map(function(r){ return r.map(function(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(','); }).join('\n');
  try{ var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='quality-champion-records.csv'; document.body.appendChild(a); a.click(); a.remove(); }catch(e){}
  return csv;
}

// ══════════════════════════════════════════════════════════════
// FACILITY SIDE — session card, card banners, timeline markers, checklist
// ══════════════════════════════════════════════════════════════
async function scqLoadFacilitySessions(){
  _scq.facSessions={};
  if(appMode!=='cho'||!choState.facilityCode) return;
  var all=await fbGet('sc_review_sessions')||{};
  Object.keys(all).forEach(function(id){ var s=all[id];
    if(s&&s.code===choState.facilityCode&&['scheduled','submitted','returned','approved'].indexOf(s.status)>=0) _scq.facSessions[id]=s; });
}
function scqFacUpcoming(){
  return scqSorted(_scq.facSessions,function(s){ var p=scqPhase(s); return p==='upcoming'||p==='live'; });
}
function scqRenderWsCard(){
  var body=document.querySelector('#welcome-screen .ws-body'); if(!body) return;
  var el=document.getElementById('scq-ws-card');
  if(!el){ el=document.createElement('div'); el.id='scq-ws-card'; var lb=document.getElementById('ws-live-banner'); body.insertBefore(el,lb?lb.nextSibling:body.firstChild); }
  var s=scqFacUpcoming()[0];
  if(appMode!=='cho'||!s){ el.style.display='none'; el.innerHTML=''; return; }
  var p=scqPhase(s), I=scJs(s.id);
  el.style.display='';
  el.innerHTML='<div class="scq-fcard'+(p==='live'?' live':'')+'"><div class="scq-fcard-t"><i class="ti ti-award"></i> '+scEsc(t('Peer review'))+' '+scEsc(t('with'))+' '+scEsc(s.championName||t('Quality Champion'))+'</div>'
    +'<div class="scq-fcard-m">'+scEsc(scFmtDateTime(s.startAt))+' · '+(parseInt(s.durationMin,10)||60)+' min · '+scEsc(t('Days'))+' '+s.dayFrom+'–'+s.dayTo+'</div>'
    +(s.note?'<div class="scq-fcard-n">'+scEsc(s.note)+'</div>':'')
    +'<div class="scq-fcard-a">'+(p==='live'?'<button class="scx-btn sm" style="background:#16A34A;" onclick="scqJoin(\''+I+'\')"><i class="ti ti-video"></i> '+scEsc(t('Join now'))+'</button>'
      :'<button class="scx-btn sm ghost" disabled><i class="ti ti-clock"></i> '+scEsc(t('Join opens 10 min before start'))+'</button>')
    +'<button class="scx-btn sm" onclick="scqOpenChecklist(\''+I+'\')"><i class="ti ti-clipboard-list"></i> '+scEsc(t('Prepare'))+'</button></div></div>';
}
function scqOpenChecklist(id){
  var s=_scq.facSessions[id]; if(!s) return;
  var role=scb1Role(), isCho=role==='CHO', cps=[], likely=[];
  for(var di=s.dayFrom-1;di<=s.dayTo-1;di++){ var d=getDay(di); if(!d) continue;
    (d.cps||[]).forEach(function(cp){ if(isCho||scCpForRole(cp,role)) cps.push(cp); }); }
  if(isCho&&_scVQ&&_scVQ.roster){
    var prog={}; Object.keys(_scVQ.progress||{}).forEach(function(m){ prog[m]=_scVQ.progress[m]; });
    var mine={}; Object.keys(choState.cards||{}).forEach(function(k){ var c=choState.cards[k]; if(c) mine['day_'+k]=Object.assign({progId:choState.progId},c,{cpScores:(c.cpScores||[]).map(function(v){ return v==null?-1:v; })}); });
    prog[choState.staffMobile]=mine;
    var fac={progId:choState.progId,startDate:choState.startDate,staff:_scVQ.roster};
    likely=scqScope(scqCtx(choState.facilityCode,fac,prog),s.dayFrom,s.dayTo).items;
  }
  var prep=scb2PrepFor(cps);
  var hi=_appLang==='hi';
  var html='<div class="scb2-sheet-hd"><div style="flex:1;"><div class="scb2-sheet-t"><i class="ti ti-award"></i> '+scEsc(t('Get ready for the peer review'))+'</div>'
    +'<div class="scb2-sheet-s">'+scEsc(scFmtDateTime(s.startAt))+' · '+scEsc(t('Days'))+' '+s.dayFrom+'–'+s.dayTo+' · '+scEsc(s.championName||'')+'</div></div></div>'
    +'<div class="scq-privacy"><i class="ti ti-eye-off"></i><div><b>'+scEsc(t('Privacy — do not show patient names or identifiers on camera'))+'</b><br>'+scEsc(t('Cover or fold register columns with patient names, mobile numbers and addresses before showing them.'))+'</div></div>'
    +'<div class="scb2-sec-t" style="margin-top:14px;font-size:12px;color:var(--teal-dk);"><i class="ti ti-video"></i> '+scEsc(t('What to show on camera'))+'</div>'
    +scb2PrepListHTML('Records & registers','ti-notebook',prep.rec)+scb2PrepListHTML('Items & equipment','ti-box',prep.item)
    +scb2PrepListHTML('Displays & signage','ti-presentation',prep.disp)+scb2PrepListHTML('People to arrange','ti-users',prep.people)
    +(likely.length?'<div class="scb2-sec"><div class="scb2-sec-t"><i class="ti ti-list-search"></i> '+scEsc(t('Checkpoints likely to be reviewed'))+' ('+likely.length+')</div>'
      +likely.map(function(it){ return '<div class="scb2-cp"><div class="scb2-cp-t">'+scEsc((hi&&it.cp.hi)?it.cp.hi:it.cp.t)+'</div><div class="scb2-cp-m"><span>'+scEsc(t('Day'))+' '+(it.di+1)+'</span>'
        +it.owners.map(function(o){ return '<span class="r">'+scEsc(o.role)+': '+scqScoreTxt(o.score)+'</span>'; }).join('')+'</div></div>'; }).join('')+'</div>':'')
    +'<div class="scb2-foot" style="margin-top:14px;"><button type="button" class="scb2-btn ghost" data-x="1">'+scEsc(t('Close'))+'</button></div>';
  scb2Overlay(html);
}
// Timeline marker (Build 2 hook)
SC_TIMELINE_MARKERS.push(function(){
  if(appMode!=='cho') return [];
  return scqSorted(_scq.facSessions,function(s){ return s.status!=='cancelled'; }).map(function(s){
    return {di:scb2DateToDi(new Date(s.startAt)),kind:'review',icon:'ti-award',label:t('Peer review')+' · '+t('Days')+' '+s.dayFrom+'–'+s.dayTo+(s.championName?' · '+s.championName:''),at:s.startAt};
  });
});

// ══════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════
(function(){
  scqEnsureLogin();
  var oPanel=scShowLoginPanel;
  scShowLoginPanel=function(which){ oPanel.apply(this,arguments); var c=document.getElementById('sc-champ-panel'); if(c) c.style.display=which==='sc-champ-panel'?'':'none'; };
  var oActor=scActor;
  scActor=function(){ if(appMode==='sc-champion'&&_scq.me) return {name:_scq.me.name||_scq.me.id,role:'Quality Champion',id:_scq.me.id}; return oActor.apply(this,arguments); };
  // Dashboards: load Champions + sessions, show the Peer Reviews button, HealSol panel
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments); try{ scqUpdateBadge(); scqRenderChampionAdmin(); }catch(e){ console.warn(e); } return r; };
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){ var r=await oLoad.apply(this,arguments);
    if(appMode==='sc-supervisor'||appMode==='sc-admin'){ try{ await Promise.all([scqLoadChampions(),scqLoadSessions()]); }catch(e){} }
    return r; };
  // Clean start for every dashboard / staff login
  var oLogoutAdmin=logoutAdmin;
  logoutAdmin=async function(){ await oLogoutAdmin.apply(this,arguments);
    if(!document.getElementById('admin-app').classList.contains('vis')){ document.querySelectorAll('.scx-ov.scq-rv,.scx-ov.scq-sum').forEach(function(o){ o.remove(); }); _scq={champions:{},sessions:{},me:null,facs:{},prog:{},facSessions:{},loadedAt:0}; } };
  // Staff app: facility sessions
  var oStart=scStartApp;
  scStartApp=async function(){ _scq.facSessions={}; var r=await oStart.apply(this,arguments);
    try{ await scqLoadFacilitySessions(); scqRenderWsCard(); if(typeof scb2RenderWsMini==='function') scb2RenderWsMini(); }catch(e){ console.warn(e); } return r; };
  var oWs=showWelcomeScreen;
  showWelcomeScreen=function(){ oWs.apply(this,arguments); try{ scqRenderWsCard(); }catch(e){} };
  var oRefresh=scStaffRefresh;
  scStaffRefresh=async function(){ var r=await oRefresh.apply(this,arguments); try{ await scqLoadFacilitySessions(); scqRenderWsCard(); }catch(e){} return r; };
  // Cards in scope: "Peer review on {date, time}"
  var oCard=renderCard;
  renderCard=function(di){
    var r=oCard.apply(this,arguments);
    try{
      if(appMode!=='cho') return r;
      var s=scqFacUpcoming().filter(function(x){ return di>=x.dayFrom-1&&di<=x.dayTo-1; })[0];
      var cont=document.getElementById('card-container'); if(!s||!cont) return r;
      var b=document.createElement('div'); b.className='scq-cardbanner';
      b.innerHTML='<i class="ti ti-award"></i><div style="flex:1;"><b>'+scEsc(t('Peer review on'))+' '+scEsc(scFmtDateTime(s.startAt))+'</b><br><span>'+scEsc(s.championName||t('Quality Champion'))+' · '+scEsc(t('Days'))+' '+s.dayFrom+'–'+s.dayTo+'</span></div>'
        +'<button class="scx-btn sm ghost" style="flex:0;" onclick="scqOpenChecklist(\''+scJs(s.id)+'\')">'+scEsc(t('Prepare'))+'</button>';
      cont.insertBefore(b,cont.firstChild);
    }catch(e){}
    return r;
  };
  var oLang=setLang;
  setLang=function(){ var r=oLang.apply(this,arguments); try{ scqRenderWsCard(); }catch(e){} return r; };
})();

