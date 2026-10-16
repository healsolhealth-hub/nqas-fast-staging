
// ══════════════════════════════════════════════════════════════
// REVIEW & ACTION PLAN — corrective actions per MoV item, assigned only by the Supervisor
//  sc_corrective/{code}/{id} gains: cpId, item (MoV index, null = whole checkpoint), itemText, status
//   status: draft (Supervisor's unpublished plan) → open → done ("ready for re-check", set by CHO/staff)
//           → [awaiting confirmation: the item is now ticked Met] → closed (Supervisor confirms)
//  Who: Supervisor assigns, publishes, confirms closure · CHO + staff implement and mark "done"
//       · Quality Champion views · HealSol and District Admin view
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{'Action Plan':'कार्य योजना','Done — ready for re-check':'पूरा — दोबारा जाँच के लिए तैयार','Re-check by':'दोबारा जाँच तक',
  'Awaiting Supervisor confirmation':'सुपरवाइज़र की पुष्टि बाकी','Assigned by':'द्वारा सौंपा गया'});
var _scRvActs={};   // code → actions (cache for the verification overlay)
function scRvCanAssign(code){ return appMode==='sc-supervisor'&&!scIsDistrict()&&scSupAllowed(code); }
function scRvList(acts){ return Object.keys(acts||{}).map(function(id){ return Object.assign({id:id},acts[id]); }); }
async function scRvLoadActs(code){ try{ _scRvActs[code]=await fbGet('sc_corrective/'+code)||{}; }catch(e){ _scRvActs[code]=_scRvActs[code]||{}; } return _scRvActs[code]; }
// latest occurrence (marked-done day) of a checkpoint for one staff member → {di, ci, score, ticks[]}
function scRvLatest(progId,progress,mob,cpId){
  var recs=(progress||{})[mob]||{}, best=null;
  Object.keys(recs).forEach(function(k){ var m=/^day_(\d+)$/.exec(k); if(!m) return; var di=+m[1], r=recs[k]; if(!r||!r.taskDone) return;
    if(r.progId&&r.progId!==progId) return;
    var d=scDayDef(progId,di), ci=(d&&d.cps||[]).findIndex(function(c){ return c.id===cpId; }); if(ci<0) return;
    var s=scNormScore((r.cpScores||[])[ci]); if(s===null) return;
    if(!best||di>best.di){ var cp=d.cps[ci]; best={di:di,ci:ci,score:s,ticks:scTicksFromStr(((r.cpTicks||{})['c'+ci])||'',(cp.items||[]).length)}; } });
  return best;
}
function scRvStatus(a,progId,progress){
  if(!a) return 'none';
  if(a.status==='draft') return 'draft';
  if(a.status==='closed') return 'closed';
  var L=a.cpId&&a.ownerMob?scRvLatest(progId,progress,a.ownerMob,a.cpId):null;
  if(L&&L.di>=((a.di==null)?0:a.di)&&(a.item!=null?L.ticks[a.item]===1:L.score===2)&&(!a.assignedAt||true)){
    // met again after the action was raised → waiting for the Supervisor
    if(a.source!=='recheck'||a.status==='done') return 'awaiting';
  }
  if(a.status==='done') return 'done';
  if(a.dueDate&&a.dueDate<scTodayStr()) return 'overdue';
  return 'open';
}
var SC_RV_ST={draft:{l:'Draft',c:'#64748B',b:'#F1F5F9'},open:{l:'Action assigned',c:'#1D4ED8',b:'#DBEAFE'},overdue:{l:'Overdue',c:'#B91C1C',b:'#FEE2E2'},
  done:{l:'Done — ready for re-check',c:'#7C3AED',b:'#EDE9FE'},awaiting:{l:'Awaiting Supervisor confirmation',c:'#B45309',b:'#FEF3C7'},closed:{l:'Closed',c:'#15803D',b:'#DCFCE7'},none:{l:'No action yet',c:'#B91C1C',b:'#FEF2F2'}};
function scRvChip(s){ var d=SC_RV_ST[s]||SC_RV_ST.open; return '<span class="scrv-chip" style="color:'+d.c+';background:'+d.b+';">'+scEsc(s==='awaiting'||s==='done'?t(d.l):d.l)+'</span>'; }
function scRvFindAct(acts,cpId,k,mob,includeClosed){
  return scRvList(acts).filter(function(a){ return a.cpId===cpId&&(a.item==null?null:+a.item)===(k==null?null:+k)&&(!mob||a.ownerMob===mob)&&(includeClosed||a.status!=='closed'); })
    .sort(function(x,y){ return String(y.assignedAt||'').localeCompare(String(x.assignedAt||'')); })[0]||null;
}
// ── MoV-level gaps of a facility, grouped by checkpoint ────────
function scRvGaps(st){
  var A=st.agg, prog=st.progress||{}, byCp={};
  A.staff.forEach(function(s){
    Object.keys(s.res.latest||{}).forEach(function(cpId){
      var L=s.res.latest[cpId], cp=scCpmGet(cpId); if(!cp) return;
      var rec=((prog[s.mob]||{})['day_'+L.di])||{}, n=(cp.items||[]).length;
      var tk=n?scTicksFromStr(((rec.cpTicks||{})['c'+L.ci])||'',n):[];
      var unmet=n?tk.map(function(v,k){ return v===0?k:-1; }).filter(function(k){ return k>=0; }):(L.score<2?[null]:[]);
      // scored before MoV ticking existed (or without ticks): the gap is the whole checkpoint
      if(n&&L.score<2&&!unmet.length&&tk.every(function(v){ return v!==0&&v!==1; })) unmet=[null];
      var g=byCp[cpId]||(byCp[cpId]={cp:cp,owners:[],unmet:{}});
      g.owners.push({mob:s.mob,name:s.name,role:s.role,score:L.score,ticks:tk,di:L.di,ci:L.ci});
      unmet.forEach(function(k){ (g.unmet[k==null?'x':k]=g.unmet[k==null?'x':k]||[]).push(s.mob); });
    });
  });
  return Object.keys(byCp).map(function(id){ return byCp[id]; }).filter(function(g){ return Object.keys(g.unmet).length; })
    .sort(function(a,b){ return ((a.cp.ord||9e4)-(b.cp.ord||9e4)); });
}
function scRvDueFor(cp,fac){ var d=scThemeEndDay(cp); return fac&&fac.startDate?scAddDays(fac.startDate,d-1):scAddDays(scTodayStr(),7); }
function scRvNewAction(st,cp,k,owner,extra){
  var a=scActor(), L=scRvLatest(st.progId,st.progress||{},owner.mob,cp.id)||{di:-1,ci:-1}, it=k!=null?(cp.items||[])[k]:null;
  return scClean(Object.assign({cpId:cp.id,item:k==null?null:+k,itemText:it?it.t:'',gapKey:scGapKey(owner.mob,L.di,L.ci),ownerMob:owner.mob,ownerName:owner.name,
    di:L.di,ci:L.ci,progId:st.progId,cpText:cp.t,aoc:cp.aoc,me:cp.me,std:cp.std,service:cp.svc,
    action:it?'Make this met: '+it.t:'Reach Full compliance on this checkpoint',dueDate:scRvDueFor(cp,st.fac),
    assignedTo:owner.mob,assignedToName:owner.name,assignedBy:a.name,assignedByRole:a.role,assignedById:a.id,assignedAt:scNowIso(),status:'open',source:'review'},extra||{}));
}
async function scRvSaveAct(code,id,rec){ try{ await db.ref('sc_corrective/'+code+'/'+id).set(rec); return true; }catch(e){ showToast('Could not save — check connection.','err'); return false; } }
async function scRvUpdate(code,id,upd){ try{ await db.ref('sc_corrective/'+code+'/'+id).update(scClean(upd)); return true; }catch(e){ showToast('Could not save — check connection.','err'); return false; } }
async function scRvRefresh(hostId){ var st=_scIns[hostId]; if(!st) return; st.actions=await fbGet('sc_corrective/'+st.code)||{}; _scRvActs[st.code]=st.actions; scInsRender(hostId); }

// ── Supervisor actions ─────────────────────────────────────────
async function scRvAssign(hostId,cpId,k,mob,editId){
  var st=_scIns[hostId]; if(!st) return;
  if(!scRvCanAssign(st.code)){ showToast('Corrective actions are assigned by the Supervisor.','err'); return; }
  var cp=scCpmGet(cpId), roster=st.staff||{}, ex=editId?Object.assign({id:editId},(st.actions||{})[editId]):null;
  var owner=ex?{mob:ex.assignedTo,name:ex.assignedToName}:{mob:mob,name:(roster[mob]||{}).name||mob};
  var it=k!=null&&k!=='x'?(cp.items||[])[+k]:null;
  var opts=Object.keys(roster).filter(function(m){ return roster[m]&&!roster[m].disabled; }).map(function(m){ return {value:m,label:(roster[m].name||m)+' ('+(roster[m].role||'CHO')+')'}; });
  var v=await scDialog({title:ex?'Edit corrective action':'Assign corrective action',icon:'📌',wide:true,okLabel:ex&&ex.status==='draft'?'Save draft':(ex?'Save':'Assign'),
    message:cp.id+' · '+cp.me+' · '+cp.t+(it?'\n\nMoV item: '+it.t:''),
    fields:[{key:'action',label:'Action',type:'textarea',required:true,value:ex?ex.action:(it?'Make this met: '+it.t:'Reach Full compliance on this checkpoint')},
      {key:'to',label:'Responsible staff',type:'select',value:owner.mob,options:opts},
      {key:'due',label:'Re-check by',type:'date',required:true,value:ex?ex.dueDate:scRvDueFor(cp,st.fac)}]});
  if(!v) return;
  var to={mob:v.to,name:(roster[v.to]||{}).name||v.to};
  if(ex){ await scRvUpdate(st.code,ex.id,{action:v.action.trim(),assignedTo:to.mob,assignedToName:to.name,dueDate:v.due,updatedBy:scActor().name,updatedByRole:'Supervisor',updatedAt:scNowIso()}); }
  else { var rec=scRvNewAction(st,cp,(k==null||k==='x')?null:+k,{mob:mob,name:(roster[mob]||{}).name||mob},{action:v.action.trim(),assignedTo:to.mob,assignedToName:to.name,dueDate:v.due});
    await scRvSaveAct(st.code,scUid('ca'),rec); }
  showToast(ex?'Action updated.':'Action assigned.','ok'); await scRvRefresh(hostId);
}
async function scRvRecheck(hostId,cpId,k,mob){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  var cp=scCpmGet(cpId), it=(cp.items||[])[k];
  var v=await scDialog({title:'Request a re-check',icon:'🔁',message:cp.id+' · '+cp.t+'\n\n'+(it?'MoV item marked Met: '+it.t:'Whole checkpoint scored Full'),
    fields:[{key:'why',label:'Why should it be re-checked?',type:'textarea',required:true,placeholder:'e.g. Register entries look incomplete'},{key:'due',label:'Re-check by',type:'date',required:true,value:scRvDueFor(cp,st.fac)}]});
  if(!v) return;
  var rec=scRvNewAction(st,cp,k,{mob:mob,name:(st.staff[mob]||{}).name||mob},{action:'Re-check requested: '+v.why.trim(),dueDate:v.due,source:'recheck'});
  await scRvSaveAct(st.code,scUid('ca'),rec); showToast('Re-check requested.','ok'); await scRvRefresh(hostId);
}
async function scRvConfirm(hostId,id){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  var a=(st.actions||{})[id]; if(!a) return;
  if(!await showConfirm('Confirm this action is complete and close it?','✅','Confirm closure','Close action','var(--teal)')) return;
  await scRvUpdate(st.code,id,{status:'closed',closedAt:scNowIso(),closedBy:scActor().name,closedByRole:'Supervisor'});
  showToast('Action closed.','ok'); await scRvRefresh(hostId);
}
async function scRvReopen(hostId,id){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  var v=await scDialog({title:'Not yet complete',icon:'↩️',fields:[{key:'c',label:'What is still missing?',type:'textarea',required:true}]}); if(!v) return;
  await scRvUpdate(st.code,id,{status:'open',reviewNote:v.c.trim(),reviewedAt:scNowIso(),reviewedBy:scActor().name});
  showToast('Sent back to the facility.','ok'); await scRvRefresh(hostId);
}
async function scRvDeleteDraft(hostId,id){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  try{ await db.ref('sc_corrective/'+st.code+'/'+id).remove(); }catch(e){ return; } await scRvRefresh(hostId);
}
async function scRvPublish(hostId){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  var drafts=scRvList(st.actions).filter(function(a){ return a.status==='draft'; }); if(!drafts.length) return;
  if(!await showConfirm('Publish '+drafts.length+' action'+(drafts.length===1?'':'s')+'? The facility and its Quality Champion will see the Action Plan, and each staff member sees their own actions.','📢','Publish Action Plan','Publish','var(--teal)')) return;
  var now=scNowIso(), upd={};
  drafts.forEach(function(a){ upd[a.id+'/status']='open'; upd[a.id+'/publishedAt']=now; upd[a.id+'/publishedBy']=scActor().name; upd[a.id+'/assignedAt']=now; });
  try{ await db.ref('sc_corrective/'+st.code).update(upd); }catch(e){ showToast('Could not publish — check connection.','err'); return; }
  await fbSet(scFacilityPath(st.code)+'/actionPlanPublishedAt',now);
  showToast('Action Plan published ('+drafts.length+').','ok'); await scRvRefresh(hostId);
}
// Baseline gaps → one draft per unmet MoV item (Supervisor reviews and publishes)
scBaselinePlan=async function(hostId){
  var st=_scIns[hostId]; if(!st) return;
  if(!scRvCanAssign(st.code)){ showToast('The Supervisor generates the action plan.','err'); return; }
  var gaps=scBaselineGaps(st.agg,st.progId,st.progress||{}).filter(function(g){ return g.open&&g.owner; });
  var acts=await fbGet('sc_corrective/'+st.code)||{}, upd={}, n=0;
  gaps.forEach(function(g){
    var ks=(g.cp.items||[]).length?g.unmet.map(function(it){ return g.cp.items.indexOf(it); }):[null];
    if(!ks.length) ks=[null];
    ks.forEach(function(k){ if(scRvFindAct(acts,g.id,k,g.owner.mob)) return;
      upd[scUid('ca')]=scRvNewAction(st,g.cp,k,g.owner,{status:'draft',source:'baseline-plan'}); n++; });
  });
  if(!n){ showToast('Every open baseline gap already has an action or draft.','ok'); return; }
  try{ await db.ref('sc_corrective/'+st.code).update(upd); }catch(e){ showToast('Could not create the drafts — check connection.','err'); return; }
  showToast(n+' draft action'+(n===1?'':'s')+' created — review and publish them in Review & Action Plan.','ok');
  st.tab='gaps'; await scRvRefresh(hostId);
};
// CHO / staff: "done — ready for re-check"
async function scRvMarkDone(code,id,hostId){
  var a=null; try{ a=await fbGet('sc_corrective/'+code+'/'+id); }catch(e){}
  if(!a||a.status==='draft'||a.status==='closed') return;
  var mine=appMode==='cho'&&(a.assignedTo===choState.staffMobile||a.ownerMob===choState.staffMobile||!!(a.members&&a.members[choState.staffMobile])||choState.roleId==='CHO');
  var cho=appMode==='sc-cho'&&code===scSubAdminCode;
  if(!mine&&!cho){ showToast('Only the facility team can mark its actions done.','err'); return; }
  var v=await scDialog({title:t('Done — ready for re-check'),icon:'✅',fields:[{key:'note',label:'What was done? (optional)',type:'textarea',placeholder:'e.g. ANC register updated for the last 3 months'}]});
  if(!v) return;
  var who=appMode==='cho'?(choState.staffName||choState.staffMobile):scActor().name;
  await scRvUpdate(code,id,{status:'done',doneAt:scNowIso(),doneBy:who,doneNote:(v.note||'').trim()});
  showToast('Marked done — it will be re-checked.','ok');
  if(hostId) await scRvRefresh(hostId); else { await scLoadMyActions(); scRenderWsActions(); }
}

// ══════════════════════════════════════════════════════════════
// VIEWS
// ══════════════════════════════════════════════════════════════
function scRvActCardHTML(st,a,opts){
  opts=opts||{}; var s=scRvStatus(a,st.progId,st.progress||{}), H=scJs(st.hostId), I=scJs(a.id), cp=scCpmGet(a.cpId)||{t:a.cpText,me:a.me};
  var btn='';
  if(opts.reviewer&&scRvCanAssign(st.code)){
    if(s==='draft') btn='<button class="scx-btn sm ghost" onclick="scRvAssign(\''+H+'\',\''+scJs(a.cpId)+'\','+(a.item==null?'null':a.item)+',\''+scJs(a.ownerMob)+'\',\''+I+'\')">Edit</button><button class="scx-btn sm danger" onclick="scRvDeleteDraft(\''+H+'\',\''+I+'\')">Remove</button>';
    else if(s==='awaiting'||s==='done') btn='<button class="scx-btn sm" onclick="scRvConfirm(\''+H+'\',\''+I+'\')"><i class="ti ti-check"></i> Confirm closed</button><button class="scx-btn sm ghost" onclick="scRvReopen(\''+H+'\',\''+I+'\')">Not yet</button>';
    else if(s!=='closed') btn='<button class="scx-btn sm ghost" onclick="scRvAssign(\''+H+'\',\''+scJs(a.cpId)+'\','+(a.item==null?'null':a.item)+',\''+scJs(a.ownerMob)+'\',\''+I+'\')">Edit</button>';
  }
  if(opts.facility&&(s==='open'||s==='overdue')) btn+='<button class="scx-btn sm" onclick="scRvMarkDone(\''+scJs(st.code)+'\',\''+I+'\',\''+H+'\')"><i class="ti ti-circle-check"></i> '+scEsc(t('Done — ready for re-check'))+'</button>';
  return '<div class="scrv-act scrv-'+s+'"><div class="scrv-act-top">'+scRvChip(s)+'<span class="scq-muted">'+scEsc(a.cpId||'')+' · '+scEsc(cp.me||a.me||'')+' · '+scEsc(a.assignedToName||a.assignedTo||'')+(a.members&&Object.keys(a.members).length?' ('+scEsc(t('Lead'))+') + '+scEsc(Object.keys(a.members).map(function(m){ return String(a.members[m]).split(' ')[0]; }).join(', ')):'')+'</span></div>'
    +'<div class="scrv-cp">'+scEsc(cp.t||a.cpText||'')+'</div>'
    +(a.itemText?'<div class="scrv-item">MoV: '+scEsc(a.itemText)+'</div>':'')
    +(a.itemText&&a.action==='Make this met: '+a.itemText?'':'<div class="scrv-text">'+scEsc(a.action||'')+'</div>')
    +'<div class="scq-muted">'+scEsc(t('Re-check by'))+' '+scEsc(a.dueDate?scFmtDate(a.dueDate):'—')+' · '+scEsc(t('Assigned by'))+' '+scEsc(a.assignedBy||'—')+(a.assignedByRole?' ('+scEsc(a.assignedByRole)+')':'')
    +(a.source==='peer-review'?' · from peer review':a.source==='recheck'?' · re-check request':a.source==='baseline-plan'?' · baseline plan':a.source==='week-plan'?' · Week '+scEsc(a.week)+' focus':'')+'</div>'
    +(a.doneAt?'<div class="scrv-note">✓ Done '+scEsc(scFmtDate(a.doneAt))+' by '+scEsc(a.doneBy||'')+(a.doneNote?' — '+scEsc(a.doneNote):'')+'</div>':'')
    +(a.reviewNote&&s!=='closed'?'<div class="scrv-note bad">Supervisor: '+scEsc(a.reviewNote)+'</div>':'')
    +(a.closedAt?'<div class="scrv-note ok">Closed '+scEsc(scFmtDate(a.closedAt))+' by '+scEsc(a.closedBy||'')+'</div>':'')
    +(btn?'<div class="scrv-btns">'+btn+'</div>':'')+'</div>';
}
function scRvPlanGroups(st,list){
  var order=['overdue','open','done','awaiting','closed'], g={};
  list.forEach(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); if(s==='draft') return; (g[s]=g[s]||[]).push(a); });
  return order.filter(function(s){ return g[s]; }).map(function(s){ return {s:s,list:g[s].sort(function(x,y){ return String(x.dueDate||'9').localeCompare(String(y.dueDate||'9')); })}; });
}
// CHO / Champion: read-only Action Plan (published actions only)
function scRvFacilityPlanHTML(st,opts){
  var list=scRvList(st.actions).filter(function(a){ return a.status!=='draft'; });
  if(!list.length) return '<div class="scx-empty">No Action Plan published yet. The Supervisor publishes it after the baseline (Days 1–7).</div>';
  var groups=scRvPlanGroups(st,list), openN=list.filter(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); return s!=='closed'; }).length;
  return '<div class="scrv-intro">Corrective actions from your Supervisor, one per MoV item. Work on each, mark it done when ready, and it is re-checked by the date shown. '+openN+' still open.</div>'
    +groups.map(function(G){ var d=SC_RV_ST[G.s];
      return '<details class="scrv-grp"'+(G.s==='closed'?'':' open')+'><summary><span style="color:'+d.c+';">'+scEsc(G.s==='awaiting'||G.s==='done'?t(d.l):d.l)+'</span> ('+G.list.length+')</summary>'
        +G.list.slice(0,200).map(function(a){ return scRvActCardHTML(st,a,opts); }).join('')+'</details>'; }).join('');
}
// Supervisor / HealSol / District: Review & Action Plan
function scRvReviewHTML(st){
  var H=scJs(st.hostId), can=scRvCanAssign(st.code), acts=st.actions||{}, list=scRvList(acts);
  var drafts=list.filter(function(a){ return a.status==='draft'; });
  var gaps=scRvGaps(st), noAct=0;
  // an item is covered once it has an action, whoever holds it (one fix serves the whole facility)
  gaps.forEach(function(g){ Object.keys(g.unmet).forEach(function(k){ if(!scRvFindAct(acts,g.cp.id,k==='x'?null:+k,null)) noAct++; }); });
  var stat={}; list.forEach(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); stat[s]=(stat[s]||0)+1; });
  var ctx=scAdmCanVerify()?scVCtx(st.code):null, pend=ctx?scVPending(ctx):[];
  var f=st.rvf||(st.rvf={show:'need',q:'',limit:40});
  var tile=function(v,l,c){ return '<div class="scx-tile"><div class="scx-tile-v"'+(c?' style="color:'+c+';"':'')+'>'+v+'</div><div class="scx-tile-l">'+l+'</div></div>'; };
  var h='<div class="scx-tiles">'+tile(noAct,'MoV gaps without an action',noAct?'var(--red-dk)':'')+tile(drafts.length,'Draft actions')+tile((stat.open||0)+(stat.overdue||0),'Open actions')
    +tile(stat.overdue||0,'Overdue',stat.overdue?'var(--red-dk)':'')+tile((stat.awaiting||0)+(stat.done||0),'To confirm',(stat.awaiting||stat.done)?'var(--amber-dk)':'')+tile(pend.length,'Cards to verify')+'</div>';
  if(!can) h+='<div class="scrv-intro">'+(appMode==='sc-admin'?'HealSol view: corrective actions are assigned and closed by the facility\'s Supervisor.':'View only.')+'</div>';
  if(drafts.length) h+='<div class="scrv-drafts"><div><b>'+drafts.length+' draft action'+(drafts.length===1?'':'s')+'</b> — not visible to the facility until published.</div>'
    +(can?'<button class="scx-btn" style="flex:0 0 auto;" onclick="scRvPublish(\''+H+'\')"><i class="ti ti-send"></i> Publish Action Plan</button>':'')+'</div>'
    +'<details class="scrv-grp"><summary>Review drafts ('+drafts.length+')</summary>'+drafts.slice(0,300).map(function(a){ return scRvActCardHTML(st,a,{reviewer:true}); }).join('')+'</details>';
  var conf=list.filter(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); return s==='awaiting'||s==='done'; });
  if(conf.length) h+='<div class="scx-sub">To confirm ('+conf.length+')</div>'+conf.map(function(a){ return scRvActCardHTML(st,a,{reviewer:true}); }).join('');
  if(pend.length) h+='<div class="scx-sub">Cards to verify ('+pend.length+')</div>'+pend.map(function(p){ return scVqItemHTML(p,'scRvOpenCard(\''+scJs(st.code)+'\',\''+scJs(p.mob)+'\','+p.di+')'); }).join('');
  // MoV-level gaps
  var shown=gaps.filter(function(g){
    var need=Object.keys(g.unmet).some(function(k){ return !scRvFindAct(acts,g.cp.id,k==='x'?null:+k,null); });
    if(f.show==='need'&&!need) return false;
    if(f.q&&(g.cp.id+' '+g.cp.t+' '+g.cp.me+' '+g.owners.map(function(o){ return o.name; }).join(' ')).toLowerCase().indexOf(f.q.toLowerCase())<0) return false;
    return true; });
  h+='<div class="scx-sub">MoV gaps</div><div class="scx-filters"><select onchange="_scIns[\''+H+'\'].rvf.show=this.value;scInsRender(\''+H+'\')">'
    +[['need','Gaps without an action'],['all','All gaps']].map(function(o){ return '<option value="'+o[0]+'"'+(f.show===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('')+'</select>'
    +'<input type="search" placeholder="Search checkpoint, ME, staff…" value="'+scEsc(f.q)+'" onchange="_scIns[\''+H+'\'].rvf.q=this.value;scInsRender(\''+H+'\')"/></div>';
  if(!shown.length) h+='<div class="scx-empty">'+(gaps.length?'Every MoV gap has an action.':'No MoV gaps recorded.')+'</div>';
  h+=shown.slice(0,f.limit).map(function(g){
    var cp=g.cp;
    var who=g.owners.map(function(o){ return '<span class="s'+o.score+'">'+scEsc(o.role)+' '+scEsc(String(o.name).split(' ')[0])+': '+(o.score===2?'Full':o.score===1?'Partial':'Non')+'</span>'; }).join(' ');
    var rows=((cp.items||[]).length?cp.items.map(function(it,k){ return {k:k,t:it.t}; }):[]);
    if(!(cp.items||[]).length||g.unmet.x) rows.push({k:null,t:(cp.items||[]).length?'Whole checkpoint (scored without MoV ticks)':'Whole checkpoint (no MoV items)'});
    rows=rows.map(function(row){
      var key=row.k==null?'x':row.k, miss=g.unmet[key]||[];
      var met=g.owners.filter(function(o){ return row.k!=null&&o.ticks[row.k]===1; });
      var right='';
      if(miss.length) right=miss.map(function(m){ var o=g.owners.find(function(x){ return x.mob===m; })||{name:m}, a=scRvFindAct(acts,cp.id,row.k,m)||scRvFindAct(acts,cp.id,row.k,null);
          return '<div class="scrv-own">✗ '+scEsc(o.name)+' '+(a?scRvChip(scRvStatus(a,st.progId,st.progress||{}))+(a.ownerMob!==m?' <span class="scq-muted">via '+scEsc(a.assignedToName||'')+'</span>':''):(can?'<button class="scx-btn sm" onclick="scRvAssign(\''+H+'\',\''+scJs(cp.id)+'\','+(row.k==null?'null':row.k)+',\''+scJs(m)+'\')"><i class="ti ti-user-check"></i> Assign action</button>':scRvChip('none')))+'</div>'; }).join('');
      else if(met.length) right='<div class="scrv-own ok">✓ Met'+(can?' <button class="scx-btn sm ghost" onclick="scRvRecheck(\''+H+'\',\''+scJs(cp.id)+'\','+row.k+',\''+scJs(met[0].mob)+'\')">Request re-check</button>':'')+'</div>';
      return '<div class="scrv-row'+(miss.length?' miss':'')+'"><div class="scrv-row-t">'+(row.k!=null?(row.k+1)+'. ':'')+scEsc(row.t)+'</div><div>'+right+'</div></div>'; }).join('');
    return '<div class="scrv-cpbox"><div class="scrv-cp-h"><b>'+scEsc(cp.id)+'</b> · '+scEsc(cp.me)+' · AoC '+scEsc(cp.aoc)+'<span class="scc-who">'+who+'</span></div><div class="scrv-cp">'+scEsc(cp.t)+'</div>'+rows+'</div>';
  }).join('');
  if(shown.length>f.limit) h+='<button class="scx-btn ghost" style="width:100%;" onclick="_scIns[\''+H+'\'].rvf.limit+=40;scInsRender(\''+H+'\')">Show more ('+(shown.length-f.limit)+')</button>';
  return h;
}
async function scRvOpenCard(code,mob,di){ await scAdmOpenVerify(); await scRvLoadActs(code); scAdmOpenCard(code,mob,di); }

// ══════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════
(function(){
  // only the Supervisor writes corrective actions (CHO and HealSol view)
  var oWrite=scCanWriteFacility;
  scCanWriteFacility=function(code){ if(appMode==='sc-cho'||appMode==='sc-admin') return false; return oWrite.apply(this,arguments); };
  // the Gap Register tab becomes "Action Plan" (CHO) or "Review & Action Plan" (Supervisor, HealSol, District)
  var oRender=scInsRender;
  scInsRender=function(hostId){
    var st=_scIns[hostId]; if(!st) return oRender.apply(this,arguments);
    var want=st.tab; if(want==='gaps') st.tab='readiness';
    var r=oRender.apply(this,arguments); st.tab=want;
    try{
      var host=document.getElementById(hostId), tabs=host&&host.querySelector('.scx-tabs'); if(!tabs) return r;
      var fac=appMode==='sc-cho', list=scRvList(st.actions).filter(function(a){ return a.status!=='draft'&&a.status!=='closed'; });
      var gbtn=[].slice.call(tabs.querySelectorAll('.scx-tab')).find(function(b){ return /Gap Register/.test(b.textContent); });
      if(gbtn) gbtn.textContent=fac?'📋 '+t('Action Plan')+' ('+list.length+')':'🛡️ Review & Action Plan';
      if(want==='gaps'){
        [].forEach.call(tabs.querySelectorAll('.scx-tab'),function(x){ x.classList.toggle('on',x===gbtn); });
        while(tabs.nextSibling) host.removeChild(tabs.nextSibling);
        var div=document.createElement('div'); div.innerHTML=fac?scRvFacilityPlanHTML(st,{facility:true}):scRvReviewHTML(st); host.appendChild(div);
      }
      // baseline tab: the Supervisor generates drafts; others are told who does it
      if(want==='baseline'){ var b=[].slice.call(host.querySelectorAll('button')).find(function(x){ return /Create action plan|Suggest this week/.test(x.textContent); });
        if(b){ b.innerHTML='<i class="ti ti-list-check"></i> Suggest this week\'s focus actions (max 3 per person)'; }
        else { var p=host.querySelector('.scd-plan .scc-hint'); if(p) p.textContent='Your Supervisor generates and publishes the Action Plan; it then appears under Action Plan.'; } }
    }catch(e){ console.warn('[SC] review tab',e); }
    return r;
  };
  // verification rows show the MoV ticks; the Supervisor can act on each item there
  var oRow=scVCpRowHTML;
  scVCpRowHTML=function(ctx,mob,di,ci,rec,interactive,tag){
    var h=oRow.apply(this,arguments);
    try{
      var d=scDayDef(ctx.progId,di), cp=d&&d.cps&&d.cps[ci]; if(!cp||!(cp.items||[]).length) return h;
      var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',cp.items.length), acts=_scRvActs[ctx.code]||{}, can=scRvCanAssign(ctx.code);
      var box='<div class="scrv-vticks">'+cp.items.map(function(it,k){ var v=tk[k], a=v===0?scRvFindAct(acts,cp.id,k,mob):null;
        return '<div class="scrv-vt '+(v===1?'met':v===0?'not':'')+'"><span>'+(v===1?'✓':v===0?'✗':'—')+'</span><div>'+scEsc(it.t)+'</div>'
          +(v===0&&a?scRvChip(scRvStatus(a,ctx.progId,ctx.progress)):'')+'</div>'; }).join('')+'</div>';
      // inside the checkpoint's content column, right under its role/ME line (above the verify form)
      var m=h.indexOf('<div class="scx-vp-meta">'); if(m<0) return h;
      var e=h.indexOf('</div>',m)+6; return h.slice(0,e)+box+h.slice(e);
    }catch(e){ return h; }
  };
  var oCard=scAdmOpenCard;
  scAdmOpenCard=function(code){ var args=arguments; scRvLoadActs(code).then(function(){ oCard.apply(null,args); }); };
  // staff never see drafts; their action cards get "Done — ready for re-check"
  var oLoad=scLoadMyActions;
  scLoadMyActions=async function(){ var r=await oLoad.apply(this,arguments); Object.keys(_scAllActions||{}).forEach(function(k){ if((_scAllActions[k]||{}).status==='draft') delete _scAllActions[k]; }); return r; };
  var oWs=scRenderWsActions;
  scRenderWsActions=function(){
    var r=oWs.apply(this,arguments);
    try{ var cards=document.querySelectorAll('#ws-actions-section .scx-act-card'), list=scMyOpenActions();
      [].forEach.call(cards,function(el,i){ var a=list[i]; if(!a) return;
        if(a.status==='done'){ el.insertAdjacentHTML('beforeend','<div class="scrv-note">✓ '+scEsc(t('Done — ready for re-check'))+'</div>'); return; }
        el.insertAdjacentHTML('beforeend','<button class="scx-btn sm ghost" style="margin-top:8px;margin-left:6px;" onclick="scRvMarkDone(\''+scJs(choState.facilityCode)+'\',\''+scJs(a.id)+'\')">✓ '+scEsc(t('Done — ready for re-check'))+'</button>'); }); }catch(e){}
    return r;
  };
  // nav button: Verification → Review
  var oBadge=scAdmUpdateBadge;
  scAdmUpdateBadge=function(){ var r=oBadge.apply(this,arguments); var b=document.getElementById('scx-adm-vq-btn'); if(b&&b.firstChild&&b.childNodes[1]&&/Verification/.test(b.textContent)) b.childNodes[1].textContent=' Review'; return r; };
})();
async function scRvAssignFromCard(code,cpId,k,mob){
  // open the facility's Review state off-screen so the same dialog and rules apply
  var hostId='scrv-card-host'; var host=document.getElementById(hostId);
  if(!host){ host=document.createElement('div'); host.id=hostId; host.style.display='none'; document.body.appendChild(host); }
  var fac=(scMasterFacilities||{})[code]||{};
  await scMountInsights(hostId,{code:code,fac:fac,staff:fac.staff||{},progress:(scMasterProgress||{})[code]});
  await scRvAssign(hostId,cpId,k,mob);
  await scRvLoadActs(code); if(typeof scAdmVRender==='function') scAdmVRender();
}

// ── Quality Champion: Action Plan of allotted facilities ───────
async function scqOpenActionPlan(code){
  if(!scqChampionCan(code)) return;
  var f=_scq.facs[code]||{}, prog=_scq.prog[code]||{}, acts=await fbGet('sc_corrective/'+code)||{};
  var st={hostId:'scq-ap',code:code,progId:f.progId||'nqas_12A',progress:prog,actions:acts,staff:f.staff||{},fac:f};
  var ov=document.createElement('div'); ov.className='scx-ov';
  ov.innerHTML='<div class="scx-box wide" style="max-width:860px;"><div class="scx-hd"><div class="scx-hd-icon">📋</div><div class="scx-hd-title">Action Plan — '+scEsc(f.name||code)+'</div><button class="scx-x" data-x="1"><i class="ti ti-x"></i></button></div>'
    +'<div class="scx-body" style="max-height:70vh;overflow:auto;">'+scRvFacilityPlanHTML(st,{})+'</div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov||(e.target.closest&&e.target.closest('[data-x]'))) ov.remove(); });
  document.body.appendChild(ov);
}
(function(){
  var oApp=scqRenderChampionApp;
  scqRenderChampionApp=function(){ var r=oApp.apply(this,arguments);
    try{ document.querySelectorAll('#scq-app .scq-fac').forEach(function(el){ var b=el.querySelector('button[onclick*="scqEditSession"]'); if(!b) return;
      var code=(/scqEditSession\(null,'([^']+)'\)/.exec(b.getAttribute('onclick'))||[])[1]; if(!code) return;
      var ap=document.createElement('button'); ap.className='scx-btn sm ghost'; ap.style.cssText='margin-top:8px;margin-left:6px;'; ap.innerHTML='<i class="ti ti-list-check"></i> Action Plan'; ap.setAttribute('onclick',"scqOpenActionPlan('"+code+"')"); b.parentNode.insertBefore(ap,b.nextSibling); }); }catch(e){}
    return r; };
})();

// ── HealSol / Supervisor: what needs attention ─────────────────
var _scRvAll={};
async function scRvLoadAll(codes){ _scRvAll={}; for(var i=0;i<codes.length;i++){ try{ _scRvAll[codes[i]]=await fbGet('sc_corrective/'+codes[i])||{}; }catch(e){} } }
function scRvAttention(){
  var out=[], today=scTodayStr();
  scVisibleFacilityCodes().forEach(function(code){
    var f=scMasterFacilities[code]||{}, acts=scRvList(_scRvAll[code]||{}), prog=(scMasterProgress||{})[code]||{};
    var bl=scBaselineStatus(f.progId||'nqas_12A',prog,f.staff||{}), blDone=bl.every(function(x){ return x.complete; });
    var published=acts.some(function(a){ return a.status&&a.status!=='draft'; }), drafts=acts.filter(function(a){ return a.status==='draft'; }).length;
    var day=f.startDate?Math.floor((Date.parse(today)-Date.parse(f.startDate))/86400000)+1:0;
    if(blDone&&!published&&day>=9) out.push({code:code,lvl:'red',txt:'Baseline complete but no Action Plan published (Day '+day+')'+(drafts?' — '+drafts+' drafts waiting':'')});
    else if(drafts) out.push({code:code,lvl:'amber',txt:drafts+' draft action'+(drafts===1?'':'s')+' not yet published'});
    var od=acts.filter(function(a){ return a.status!=='draft'&&a.status!=='closed'&&a.dueDate&&a.dueDate<today; }).length;
    if(od) out.push({code:code,lvl:'red',txt:od+' overdue action'+(od===1?'':'s')});
    var conf=acts.filter(function(a){ return a.status==='done'&&a.doneAt&&(Date.parse(today)-Date.parse(a.doneAt.slice(0,10)))/86400000>3; }).length;
    if(conf) out.push({code:code,lvl:'amber',txt:conf+' action'+(conf===1?'':'s')+' marked done over 3 days ago, awaiting Supervisor confirmation'});
  });
  return out;
}
function scRvRenderAttention(){
  if(appMode!=='sc-admin'&&!(appMode==='sc-supervisor'&&!scIsDistrict())) return;
  var grid=document.getElementById('sc-master-grid'); if(!grid) return;
  var el=document.getElementById('scrv-attn'); if(!el){ el=document.createElement('div'); el.id='scrv-attn'; grid.parentNode.insertBefore(el,grid); }
  var items=scRvAttention();
  el.className='scrv-attn'+(items.length?'':' ok');
  el.innerHTML='<div class="scrv-attn-h"><i class="ti ti-alert-circle"></i> Needs attention'+(items.length?' ('+items.length+')':' — nothing pending')+'</div>'
    +items.slice(0,30).map(function(x){ var f=scMasterFacilities[x.code]||{}; return '<div class="scrv-attn-i '+x.lvl+'"><b>'+scEsc(f.name||x.code)+'</b> · '+scEsc(x.txt)+' <button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scDrillIn(\''+scJs(x.code)+'\')">Open</button></div>'; }).join('');
}
(function(){
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){ var r=await oLoad.apply(this,arguments); try{ if(appMode==='sc-admin'||(appMode==='sc-supervisor'&&!scIsDistrict())) await scRvLoadAll(scVisibleFacilityCodes()); }catch(e){} return r; };
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments); try{ scRvRenderAttention(); }catch(e){ console.warn(e); } return r; };
  // peer-review findings become actions for the Supervisor's plan (still created only on summary approval)
  var oFin=scqFinalize;
  scqFinalize=async function(id){ var fin=await oFin.apply(this,arguments);
    try{ var s=await fbGet('sc_review_sessions/'+id), acts=await fbGet('sc_corrective/'+s.code)||{}, upd={};
      Object.keys(acts).forEach(function(k){ var a=acts[k]; if(a&&a.sessionId===id&&a.source==='peer-review'&&!a.cpId){ var d=scDayDef(a.progId,a.di), cp=d&&d.cps&&d.cps[a.ci];
        if(cp&&cp.id){ upd[k+'/cpId']=cp.id; upd[k+'/item']=null; upd[k+'/proposedBy']=a.assignedBy; upd[k+'/assignedBy']=scActor().name; upd[k+'/assignedByRole']=appMode==='sc-admin'?'HealSol Admin':'Supervisor'; } } });
      if(Object.keys(upd).length) await db.ref('sc_corrective/'+s.code).update(upd); }catch(e){ console.warn(e); }
    return fin; };
})();
