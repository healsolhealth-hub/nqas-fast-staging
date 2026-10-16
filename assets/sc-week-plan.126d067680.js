
var NF_WP={perWeek:3};
Object.assign(HINDI_UI,{'Lead':'प्रमुख','Together with':'साथ में','You are the Lead':'आप प्रमुख हैं','Make lead':'प्रमुख बनाएँ'});
// ── which implementation week a facility is in (Days 8–49) ──────
function nfWpWeek(fac){
  if(!fac||!fac.startDate) return null;
  var day=computeCurrentDay(fac.startDate,999), i=-1;
  (SC_IMPL_WEEKS||[]).forEach(function(w,j){ if(day>=w.start) i=j; });
  if(day<SC_IMPL_WEEKS[0].start) i=0; if(day>SC_IMPL_WEEKS[SC_IMPL_WEEKS.length-1].start+6) return null;
  if(i>=0&&day>=SC_IMPL_WEEKS[i].start+5&&SC_IMPL_WEEKS[i+1]) i++;   // last day or two of a week → plan the next one
  var w=SC_IMPL_WEEKS[i]; if(!w) return null;
  return {i:i,n:i+2,w:w,day:day,from:w.start,to:w.start+6,fromDate:scAddDays(fac.startDate,w.start-1),toDate:scAddDays(fac.startDate,w.start+5),upcoming:day<w.start};
}
// a MoV item every person must show for themselves (knowledge / skill) — not one shared fix
function nfEachPerson(text){ return /\b(is|are) aware\b|\baware (of|about)\b|\bknowledge of\b|\bknows?\b|\bcan (tell|explain|describe|demonstrate|show|name)\b|\bexplains?\b|\bdemonstrat|\bdescribes?\b|\bskill|\btrained\b|\binterview|\bask (the|a|any|staff)\b|\bable to\b/i.test(String(text||'')); }
function nfActive(staff){ return Object.keys(staff||{}).filter(function(m){ return staff[m]&&!staff[m].disabled; }); }
function nfRoleMobs(staff,role){ return nfActive(staff).filter(function(m){ return (staff[m].role||'CHO')===role; }).sort(function(a,b){ return String(staff[a].name||a).localeCompare(String(staff[b].name||b)); }); }
// role Lead: the one marked lead, else the first by name (auto)
function nfLeadOf(staff,role,among){
  var L=nfRoleMobs(staff,role); if(among) L=L.filter(function(m){ return among.indexOf(m)>=0; });
  var m=L.find(function(x){ return staff[x].lead; }); return m?{mob:m,auto:false}:(L[0]?{mob:L[0],auto:true}:null);
}
function nfActPeople(a){ var P=[a.assignedTo||a.ownerMob]; Object.keys(a.members||{}).forEach(function(m){ if(P.indexOf(m)<0) P.push(m); }); return P; }
function nfWithNames(a,me,staff,lead){ staff=staff||{}; return nfActPeople(a).filter(function(m){ return m!==me; }).map(function(m){ return String((staff[m]||{}).name||(a.members||{})[m]||(m===a.assignedTo?a.assignedToName:m)).split(' ')[0]+(lead&&m===a.assignedTo?' ('+lead+')':''); }).join(', '); }
// ── the plan: who has room this week, and the next focus actions ──
function nfWpPlan(st){
  var wk=nfWpWeek(st.fac); if(!wk) return null;
  var staff=st.staff||{}, acts=st.actions||{}, list=scRvList(acts), people={};
  nfActive(staff).forEach(function(m){ people[m]={mob:m,name:staff[m].name||m,role:staff[m].role||'CHO',week:0,carried:0}; });
  list.forEach(function(a){ if(a.status==='closed'||a.status==='suggested'||a.status==='accepted') return;
    var s=a.status==='draft'?'draft':scRvStatus(a,st.progId,st.progress||{});
    nfActPeople(a).forEach(function(m){ var p=people[m]; if(!p) return;
      if(+a.week===wk.n) p.week++; else if(s==='open'||s==='overdue') p.carried++; }); });
  Object.keys(people).forEach(function(m){ var p=people[m], c=nfRoleMobs(staff,p.role); p.lead=c.length>1?nfLeadOf(staff,p.role):null; p.isLead=!!(p.lead&&p.lead.mob===m); p.cap=Math.max(0,NF_WP.perWeek-p.week); });
  // candidates: unmet MoV items with no action yet (one action covers an item for the whole facility)
  var C=[];
  scRvAllCps(st).forEach(function(g){ var cp=g.cp, inWk=false; try{ inWk=!!wk.w.match(cp); }catch(e){}
    Object.keys(g.unmet).forEach(function(key){ var k=key==='x'?null:+key; if(scRvFindAct(acts,cp.id,k,null)) return;
      var text=k!=null?(cp.items[k]||{}).t:cp.t, each=(typeof nfIsEach==='function'?nfIsEach(cp,k,text):nfEachPerson(text)), miss=g.unmet[key].filter(function(m){ return people[m]; });
      var sc=function(m){ var o=g.owners.find(function(x){ return x.mob===m; }); return o?o.score:1; };
      var byRole={}; miss.forEach(function(m){ (byRole[people[m].role]=byRole[people[m].role]||[]).push(m); });
      Object.keys(byRole).forEach(function(r){ var M=byRole[r];
        if(!each&&M.length>1){ var ld=nfLeadOf(staff,r,M)||{mob:M[0]}; C.push({cp:cp,k:k,text:text,lead:ld.mob,members:M.filter(function(m){ return m!==ld.mob; }),wk:inWk,sc:Math.min.apply(null,M.map(sc)),key:cp.id+'|'+key,shared:true}); }
        else M.forEach(function(m){ C.push({cp:cp,k:k,text:text,lead:m,members:[],wk:inWk,sc:sc(m),key:cp.id+'|'+key+(each?'|'+m:''),shared:!each}); }); });
    }); });
  C.sort(function(a,b){ return (b.wk-a.wk)||(a.sc-b.sc)||((a.cp.ord||9e4)-(b.cp.ord||9e4))||((a.k==null?99:a.k)-(b.k==null?99:b.k)); });
  var cap={}, used={}, picks=[]; Object.keys(people).forEach(function(m){ cap[m]=people[m].cap; });
  C.forEach(function(c){ if(used[c.key]) return; if(!(cap[c.lead]>0)) return;
    used[c.key]=1; picks.push(c); [c.lead].concat(c.members).forEach(function(m){ cap[m]=Math.max(0,(cap[m]||0)-1); }); });
  var gapsLeft=0, seen={}; C.forEach(function(c){ if(!used[c.key]&&!seen[c.key]){ seen[c.key]=1; gapsLeft++; } });
  return {wk:wk,people:Object.keys(people).map(function(m){ return people[m]; }).sort(function(a,b){ return String(a.role).localeCompare(String(b.role))||(b.isLead-a.isLead)||String(a.name).localeCompare(String(b.name)); }),
    picks:picks,backlog:gapsLeft,drafts:list.filter(function(a){ return a.status==='draft'&&a.source==='week-plan'; }).length};
}
async function nfWpSuggest(hostId){
  var st=_scIns[hostId]; if(!st) return;
  if(!scRvCanAssign(st.code)){ showToast('Focus actions are assigned by the Supervisor.','err'); return; }
  st.actions=await fbGet('sc_corrective/'+st.code)||{};
  var P=nfWpPlan(st); if(!P){ showToast('The weekly focus plan runs in the implementation weeks (Days 8–49).','err'); return; }
  if(!P.picks.length){ showToast(P.people.some(function(p){ return p.cap>0; })?'No MoV gaps without an action.':'Everyone already has '+NF_WP.perWeek+' focus actions this week.','ok'); return; }
  var staff=st.staff||{}, upd={};
  P.picks.forEach(function(c){
    var owner={mob:c.lead,name:(staff[c.lead]||{}).name||c.lead}, mem=null, mg=null;
    if(c.members.length){ mem={}; mg={}; c.members.forEach(function(m){ mem[m]=(staff[m]||{}).name||m; var L=scRvLatest(st.progId,st.progress||{},m,c.cp.id); if(L) mg[m]={di:L.di,ci:L.ci}; }); }
    upd[scUid('ca')]=scRvNewAction(st,c.cp,c.k,owner,{status:'draft',source:'week-plan',week:P.wk.n,dueDate:P.wk.toDate<scTodayStr()?scAddDays(scTodayStr(),3):P.wk.toDate,members:mem,memberGaps:mg,shared:c.shared||null});
  });
  try{ await db.ref('sc_corrective/'+st.code).update(upd); }catch(e){ showToast('Could not create the focus actions — check connection.','err'); return; }
  showToast(P.picks.length+' focus action'+(P.picks.length===1?'':'s')+' suggested for Week '+P.wk.n+' — check them, then Publish week plan.','ok');
  st.tab='gaps'; await scRvRefresh(hostId);
}
function nfWpCardHTML(st){
  var P=nfWpPlan(st); if(!P) return '';
  var H=scJs(st.hostId), can=scRvCanAssign(st.code), wk=P.wk;
  var dots=function(n){ var h=''; for(var i=0;i<NF_WP.perWeek;i++) h+='<i class="'+(i<n?'on':'')+'"></i>'; return '<span class="nfwp-dots">'+h+'</span>'; };
  return '<div class="nfwp" id="nfwp-'+scEsc(st.hostId)+'"><div class="nfwp-h">🎯 Week '+wk.n+' focus plan <small>Day '+wk.from+'–'+wk.to+(wk.upcoming?' · starts '+scFmtDate(wk.fromDate):'')+'</small></div>'
    +'<div class="nfwp-th">Theme: <b>'+scEsc(wk.w.title)+'</b></div>'
    +'<div class="nfwp-intro">Up to '+NF_WP.perWeek+' actions per person each week — this week\'s theme first, then the weakest items. A fix the whole team shares (register, display, stock) goes once to the role\'s Lead, together with the others; knowledge and skill items go to each person.</div>'
    +P.people.map(function(p){ return '<div class="nfwp-p"><div><b>'+scEsc(p.name)+'</b><span class="fa-chip">'+scEsc(p.role)+'</span>'+(p.isLead?'<span class="fa-chip lead">⭐ Lead</span>':'')+'</div>'
      +'<div class="r">'+dots(p.week)+p.week+'/'+NF_WP.perWeek+' this week'+(p.carried?'<small>+'+p.carried+' still open from earlier</small>':'')+'</div></div>'; }).join('')
    +'<div class="nfwp-bl">🗂️ Backlog: <b>'+P.backlog+'</b> MoV gap'+(P.backlog===1?'':'s')+' wait for later weeks'+(P.picks.length?' · <b>'+P.picks.length+'</b> ready to suggest now':'')+'.</div>'
    +(can?'<div class="nfwp-btns">'+(P.picks.length?'<button class="scx-btn" onclick="nfWpSuggest(\''+H+'\')"><i class="ti ti-checks"></i> Suggest focus actions ('+P.picks.length+')</button>':'')
      +(P.drafts?'<button class="scx-btn" style="background:var(--teal-dk);" onclick="scRvPublish(\''+H+'\')"><i class="ti ti-send"></i> Publish week plan ('+P.drafts+')</button>':'')+'</div>':'')
    +'</div>';
}
(function(){
  // Review & Action Plan: the week plan sits on top
  var oR=scRvReviewHTML;
  scRvReviewHTML=function(st){ var h=oR.apply(this,arguments); try{ var w=nfWpCardHTML(st); if(w){ var i=h.indexOf('<div class="scx-tiles">'); h=i>=0?h.slice(0,i)+w+h.slice(i):w+h; } }catch(e){ console.warn('[SC] week plan',e); } return h; };
  // "Create action plan from baseline gaps" → this week's focus actions (no flood of drafts)
  scBaselinePlan=async function(hostId){ return nfWpSuggest(hostId); };
  // Staff: actions shared with them (group actions) appear in My actions too
  var oM=scMyOpenActions;
  scMyOpenActions=function(){ var L=oM.apply(this,arguments), me=choState.staffMobile, seen={}; L.forEach(function(a){ seen[a.id]=1; });
    var hi=typeof _appLang!=='undefined'&&_appLang==='hi';
    Object.keys(_scAllActions||{}).forEach(function(id){ var a=_scAllActions[id]; if(!a||seen[id]||!a.members||!a.members[me]) return;
      if(a.status==='closed'||a.status==='draft'||a.status==='suggested'||a.status==='accepted') return; if(a.progId&&a.progId!==choState.progId) return;
      var g=(a.memberGaps||{})[me]; if(g&&scLocalGapClosed(g.di,g.ci)) return;
      var x=Object.assign({id:id},a); if(hi) x.action=nfActText(x,'hi'); L.push(x); });
    return L.sort(function(a,b){ return String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999')); });
  };
  var oWs=scRenderWsActions;
  scRenderWsActions=function(){ var r=oWs.apply(this,arguments);
    try{ var me=choState.staffMobile, staff=(typeof choState.facilityStaff==='object'&&choState.facilityStaff)||{}, cards=document.querySelectorAll('#ws-actions-section .scx-act-card'), list=scMyOpenActions();
      [].forEach.call(cards,function(el,i){ var a=list[i]; if(!a||!a.members||!Object.keys(a.members).length) return;
        el.querySelector('.scx-act-text').insertAdjacentHTML('afterend','<div class="nfwp-with">👥 '+scEsc(t('Together with'))+' '+scEsc(nfWithNames(a,me,staff,t('Lead')))+(a.assignedTo===me?' · ⭐ '+scEsc(t('You are the Lead')):'')+'</div>');
        var g=(a.memberGaps||{})[me]; if(a.ownerMob!==me&&g){ var b=el.querySelector('.scx-btn'); el.insertAdjacentHTML('beforeend','<button class="scx-btn sm" style="margin-top:8px;" onclick="scOpenActionCard('+(+g.di)+')"><i class="ti ti-arrow-right"></i> Open Day '+(+g.di+1)+' card</button>'); }
        var meta=el.querySelector('.scx-act-meta'); if(meta) meta.innerHTML=meta.innerHTML.replace(/ · for [^<]*$/,''); }); }catch(e){ console.warn('[SC] group actions',e); }
    return r; };
  // WhatsApp: group actions go to every person on them, "together with …"
  nfPwPeople=function(st){
    var by={}, staff=st.staff||{};
    scRvList(st.actions).forEach(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); if(s!=='open'&&s!=='overdue') return;
      nfActPeople(a).forEach(function(m){ if(!m) return; var w=a.members?nfWithNames(a,m,staff,'Lead'):'', wh=a.members?nfWithNames(a,m,staff,'प्रमुख'):''; (by[m]=by[m]||[]).push(Object.assign({_s:s,_with:w,_withHi:wh},a)); }); });
    return Object.keys(by).map(function(m){ var s=staff[m]||{}, L=by[m].sort(function(x,y){ return String(x.dueDate||'9999').localeCompare(String(y.dueDate||'9999')); });
      return {mob:m,name:s.name||(L[0].members||{})[m]||L[0].assignedToName||L[0].ownerName||m,role:s.role||'',acts:L,od:L.filter(function(a){ return a._s==='overdue'; }).length};
    }).filter(function(p){ return !staff[p.mob]||!staff[p.mob].disabled; })
      .sort(function(a,b){ return (b.od-a.od)||String(a.name).localeCompare(String(b.name)); });
  };
})();
// ── Facility dashboard → Staff: mark the Lead of a role with 2+ people ──
async function nfSetLead(mob){
  var S=(typeof scSubAdminStaff!=='undefined'&&scSubAdminStaff)||{}, code=scSubAdminCode, s=S[mob]; if(!s||!code) return;
  var role=s.role||'CHO', upd={}; nfRoleMobs(S,role).forEach(function(m){ upd[m+'/lead']=m===mob?true:null; });
  try{ await db.ref(scFacilityPath(code)+'/staff').update(upd); }catch(e){ showToast('Could not save — check connection.','err'); return; }
  nfRoleMobs(S,role).forEach(function(m){ if(m===mob) S[m].lead=true; else delete S[m].lead; });
  showToast((s.name||mob)+' is now the '+role+' Lead.','ok'); faStaffRender();
}
(function(){
  if(typeof faStaffRender!=='function') return;
  var oS=faStaffRender;
  faStaffRender=function(){ var r=oS.apply(this,arguments);
    try{ var S=(typeof scSubAdminStaff!=='undefined'&&scSubAdminStaff)||{};
      document.querySelectorAll('#sc-cho-staff-roster .fa-p').forEach(function(el){ var m=el.getAttribute('data-mob'), s=S[m]; if(!s) return;
        var role=s.role||'CHO'; if(nfRoleMobs(S,role).length<2) return;
        var ld=nfLeadOf(S,role), chip=el.querySelector('small .fa-chip');
        if(ld&&ld.mob===m&&chip) chip.insertAdjacentHTML('afterend','<span class="fa-chip lead" title="'+(ld.auto?'Lead until you choose one':'Lead')+'">⭐ '+scEsc(t('Lead'))+(ld.auto?' (auto)':'')+'</span>');
        if(!(ld&&ld.mob===m&&!ld.auto)){ var acts=el.querySelector('.fa-acts'); if(acts) acts.insertAdjacentHTML('afterbegin','<button type="button" onclick="nfSetLead(\''+scJs(m)+'\')"><i class="ti ti-circle-check"></i> Make '+scEsc(role)+' Lead</button>'); } });
      document.querySelectorAll('.nfwp-lead-note').forEach(function(x){ x.remove(); });
      var meta=document.getElementById('fa-staff-miss'), multi=FA_ROLES.filter(function(r){ return nfRoleMobs(S,r).length>1; });
      if(meta&&multi.length) meta.insertAdjacentHTML('afterend','<div class="nfwp-lead-note" style="font-size:12px;color:var(--t3);margin-top:4px;">⭐ The Lead takes shared fixes (registers, displays, stock) for their role, together with the others. Tap ⋮ to change.</div>');
    }catch(e){ console.warn('[SC] leads',e); }
    return r; };
})();
