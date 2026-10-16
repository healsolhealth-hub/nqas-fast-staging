
// ══════════════════════════════════════════════════════════════
// STEP D — 7-DAY RAPID-AUDIT BASELINE
//  Days 1–7 are generated from the Checkpoint Master: every NQAS checkpoint of the package
//  is audited once, grouped by AoC. Scores on these days are the baseline (history kind
//  'baseline'). From Day 7 the baseline report turns the gaps into an action plan.
// ══════════════════════════════════════════════════════════════
var SC_BASELINE_DAYS=7;
// day cards expect roles as {prime, support:[…]} — the CHO leads every generated day
function scDayRoles(set){ var sup=['ANM','ASHA','MPW','MO'].filter(function(r){ return set[r]||set.General&&r!=='MO'; }); return {prime:'CHO',support:sup}; }
// generated days show a note in the day editor — without destroying the editor itself
function scAeGenNote(p,html){
  if(!p) return;
  var note=p.querySelector(':scope > .scd-ae');
  if(html===null){ if(note) note.remove(); [].forEach.call(p.children,function(ch){ if(ch.dataset.scdHid){ ch.style.display=ch.dataset.scdHid==='-'?'':ch.dataset.scdHid; delete ch.dataset.scdHid; } }); return; }
  [].forEach.call(p.children,function(ch){ if(ch!==note&&!ch.dataset.scdHid){ ch.dataset.scdHid=ch.style.display||'-'; ch.style.display='none'; } });
  if(!note){ note=document.createElement('div'); note.className='scd-ae'; p.insertBefore(note,p.firstChild); }
  note.innerHTML=html; p.style.display='';
}
// Baseline order (8 Oct 2026): structure → process → outcome; AoC A + E together by service package
function scDayGroup(c){
  var a=c.aoc, n=+String(c.std||'').slice(1)||0, s=c.svc||c.service||'';
  if(a==='C'||a==='B') return 0;
  if(a==='D'||(a==='A'&&String(c.std)==='A2')) return 1;
  if(a==='F'||a==='G'||(a==='E'&&n<=6)) return 2;
  if(a==='H'||(a==='A'&&/A1\.14$/.test(c.me||''))||s==='Elderly & Palliative Care') return 6;
  if(['Pregnancy & Child Birth','Neonatal & Infant Care','Childhood & Adolescent Health'].indexOf(s)>=0) return 3;
  if(['Family Planning','Management of Communicable Diseases','Care of Common Ophthalmic and ENT'].indexOf(s)>=0) return 4;
  if(['Management of Non-Communicable Diseases','Oral Health Care','Mental Health','Emergency'].indexOf(s)>=0) return 5;
  if(a==='E'){ if(n>=13) return 3; if(n===10||n===8) return 4; return 5; }   // E with no service tag: by standard
  return a==='A'?5:6;
}
var SC_BASELINE=[
  {key:'C+B',title:'AoC C · Inputs and AoC B · Patient Rights',hi:'AoC C · इनपुट और AoC B · मरीज़ अधिकार',match:function(c){ return scDayGroup(c)===0; }},
  {key:'D+A2',title:'AoC D · Support Services and A2 · Drugs & Diagnostics',hi:'AoC D · सहायक सेवाएँ और A2 · दवाएँ व जाँच',match:function(c){ return scDayGroup(c)===1; }},
  {key:'F+G+E',title:'AoC F · Infection Control, AoC G · Quality Management and E1–E6 · General clinical processes',hi:'AoC F · संक्रमण नियंत्रण, AoC G · गुणवत्ता प्रबंधन और E1–E6 · सामान्य चिकित्सा प्रक्रियाएँ',match:function(c){ return scDayGroup(c)===2; }},
  {key:'A+E',title:'Pregnancy & Child Birth, Neonatal & Infant Care, Childhood & Adolescent Health (AoC A + E)',hi:'गर्भावस्था व प्रसव, नवजात व शिशु देखभाल, बाल व किशोर स्वास्थ्य (AoC A + E)',match:function(c){ return scDayGroup(c)===3; }},
  {key:'A+E',title:'Family Planning, Communicable Diseases, Eye & ENT care (AoC A + E)',hi:'परिवार नियोजन, संचारी रोग, आँख व ENT देखभाल (AoC A + E)',match:function(c){ return scDayGroup(c)===4; }},
  {key:'A+E',title:'Non-Communicable Diseases, Oral Health, Mental Health and Emergency (AoC A + E)',hi:'गैर-संचारी रोग, मुख स्वास्थ्य, मानसिक स्वास्थ्य और आपातकाल (AoC A + E)',match:function(c){ return scDayGroup(c)===5; }},
  {key:'A+E+H',title:'Elderly & Palliative Care, Health Promotion (A1.14) and AoC H · Outcome',hi:'बुज़ुर्ग व पैलिएटिव देखभाल, स्वास्थ्य संवर्धन (A1.14) और AoC H · परिणाम',match:function(c){ return scDayGroup(c)===6; }}
];
Object.assign(HINDI_UI,{'Baseline audit':'बेसलाइन ऑडिट','Baseline audit (rapid)':'बेसलाइन ऑडिट (त्वरित)','All met':'सभी पूरे','Baseline report':'बेसलाइन रिपोर्ट',
  'answered today':'आज उत्तर दिए','Answer each item Met or Not met. Gaps found this week become your action plan from Day 8.':'हर बात पर "पूरा" या "पूरा नहीं" चुनें। इस सप्ताह मिली कमियाँ दिन 8 से आपकी कार्य योजना बनेंगी।'});
SC_BASELINE.forEach(function(g){ HINDI_UI['Baseline audit — '+g.title]='बेसलाइन ऑडिट — '+g.hi; });
var _scBlCache={};
function scIsBaselineDay(di){ return di>=0&&di<SC_BASELINE_DAYS; }
function scBaselineDay(progId,di){
  if(!scIsBaselineDay(di)) return null;
  var k=progId+'|'+di+'|'+_scCpm.ver; if(_scBlCache[k]) return _scBlCache[k];
  var g=SC_BASELINE[di];
  // positions must never shift (scores are stored by position): retired checkpoints keep their slot
  // but nobody scores them; new checkpoints sort to the end of their day
  var cps=scCpmAll({pkg:progId,includeRetired:true,kind:'nqas'}).filter(g.match).map(function(c){ return scCpmApply({},c.id); });
  var roles={}; cps.forEach(function(c){ scCpRoles(c).forEach(function(r){ roles[r]=1; }); });
  var aocs={}; cps.forEach(function(c){ aocs[c.aoc]=1; });
  var day={day:di+1,aoc:g.key,service:'Baseline audit',title:'Baseline audit — '+g.title,titleHi:'बेसलाइन ऑडिट — '+g.hi,
    task:'Rapid audit of '+g.title+': answer each item Met or Not met for your checkpoints. Gaps found this week become the action plan from Day 8.',
    me:'',aocTags:Object.keys(aocs).sort(),methods:['SI','RR','OB','CI'],roles:scDayRoles(roles),cps:cps,isBaseline:true,phase:'baseline'};
  _scBlCache[k]=day; return day;
}
function scBaselineGroupOf(cpId){ var c=scCpmGet(cpId); if(!c) return -1; for(var i=0;i<SC_BASELINE.length;i++){ if(SC_BASELINE[i].match(c)) return i; } return -1; }
function tickAllCP(di,ci,val){
  var n=scCpItemsAt(di,ci).length; for(var k=0;k<n;k++){ var c=getCHOCard(di), cur=scTicksFor(c,ci,n)[k]; if(cur!==val) tickCP(di,ci,k,val); }
}
(function(){
  // a retired checkpoint is never assigned to anyone
  var oFor=scCpForRole; scCpForRole=function(cp){ if(cp&&cp.retired) return false; return oFor.apply(this,arguments); };
  var oIn=scCpForRoleIn; scCpForRoleIn=function(cp){ if(cp&&cp.retired) return false; return oIn.apply(this,arguments); };
  // Days 1–7 come from the master (all other days unchanged until Step E)
  var oDef=scDayDef;
  scDayDef=function(progId,di){ return scBaselineDay(progId,di)||oDef.apply(this,arguments); };
  var oGet=getDay;
  getDay=function(di){ return scBaselineDay(choState.progId,di)||oGet.apply(this,arguments); };
  // history: scores on Days 1–7 are the baseline
  var oKind=scCpKind;
  scCpKind=function(cpId,di){ return scIsBaselineDay(di)?'baseline':oKind.apply(this,arguments); };
  // rapid audit layout: banner with progress, Standard headings, "All met" per checkpoint
  var oCard=renderCard;
  renderCard=function(di){
    var r=oCard.apply(this,arguments);
    try{
      if(!scIsBaselineDay(di)||appMode!=='cho') return r;
      var cont=document.getElementById('card-container'); if(!cont) return r;
      var d=getDay(di), c=getCHOCard(di), mine=scMyCpIdx(di), hi=_appLang==='hi';
      var answered=mine.filter(function(ci){ return scNormScore((c.cpScores||[])[ci])!==null; }).length;
      var ban=document.createElement('div'); ban.className='scd-banner';
      ban.innerHTML='<div class="scd-b-t"><i class="ti ti-clipboard-search"></i> '+scEsc(t('Baseline audit (rapid)'))+' · '+scEsc(t('Day'))+' '+(di+1)+' / '+SC_BASELINE_DAYS+'</div>'
        +'<div class="scd-b-s">'+scEsc(hi?SC_BASELINE[di].hi:SC_BASELINE[di].title)+'</div>'
        +'<div class="scd-b-p"><div><div style="width:'+(mine.length?Math.round(answered/mine.length*100):0)+'%"></div></div><b>'+answered+'/'+mine.length+'</b> '+scEsc(t('answered today'))+'</div>'
        +'<div class="scd-b-h">'+scEsc(t('Answer each item Met or Not met. Gaps found this week become your action plan from Day 8.'))+'</div>';
      cont.insertBefore(ban,cont.firstChild);
      var lastStd='';
      (d.cps||[]).forEach(function(cp,ci){
        var el=document.getElementById('cp-'+di+'-'+ci); if(!el) return;
        if(cp.std&&cp.std!==lastStd){ lastStd=cp.std; var h=document.createElement('div'); h.className='scd-std';
          h.innerHTML='<b>'+scEsc(cp.std)+'</b> '+scEsc(scRegTitle('std',cp.std)||(hi?'':'Standard '+cp.std))+'<span>≥'+scNqasStdMin(cp.std)+'%</span>'; el.parentNode.insertBefore(h,el); }
        if(!c.taskDone&&scMyCp(di,ci)&&(cp.items||[]).length>1){
          var sum=el.querySelector('.scmt-sum'); if(sum&&!sum.querySelector('.scd-all')){
            var b=document.createElement('button'); b.type='button'; b.className='scd-all'; b.textContent='✓ '+t('All met');
            b.setAttribute('onclick','event.stopPropagation();tickAllCP('+di+','+ci+',1)'); sum.appendChild(b); }
        }
      });
    }catch(e){ console.warn('[SC] baseline card',e); }
    return r;
  };
  // Card Editor: Days 1–7 are generated — show them, but edit checkpoints in the master
  var oArr=aeGetActiveArray;
  aeGetActiveArray=function(){ var arr=oArr.apply(this,arguments)||[], progId=scCpmEditorLetterToProg(adminActiveProg||'C');
    return arr.map(function(d,di){ return scBaselineDay(progId,di)||d; }); };
  var oOpen=aeOpenDay;
  aeOpenDay=function(di){
    if(scIsBaselineDay(di)){
      var progId=scCpmEditorLetterToProg(adminActiveProg||'C'), d=scBaselineDay(progId,di);
      adminEditorDay=null;
      var p=document.getElementById('ae-editor-panel');
      scAeGenNote(p,'<b>Day '+(di+1)+' · '+scEsc(d.title)+'</b><br>'+d.cps.length+' checkpoints. Baseline audit days are built automatically from the Checkpoint Master, so every checkpoint of the package is audited once in Days 1–7. Edit checkpoints in the <a href="#" onclick="scCpmTab(\'master\');return false;">Checkpoint Master</a>.');
      return;
    }
    scAeGenNote(document.getElementById('ae-editor-panel'),null);
    return oOpen.apply(this,arguments);
  };
})();

// ══════════════════════════════════════════════════════════════
// BASELINE REPORT + ACTION PLAN (insights tab)
// ══════════════════════════════════════════════════════════════
// AoC/Standard → the implementation week that works on it (end day of that week)
function scThemeEndDay(cp){
  var n=+String(cp.std||'').slice(1);
  if(cp.aoc==='C'||cp.aoc==='D') return 14;
  if(cp.aoc==='B'||cp.aoc==='F') return 21;
  if(cp.aoc==='A') return ['Pregnancy & Child Birth','Neonatal & Infant Care','Childhood & Adolescent Health','Family Planning'].indexOf(cp.svc)>=0?28:35;
  if(cp.aoc==='E') return n>=13?28:(n>=7?35:42);
  if(cp.aoc==='G') return 42;
  return 49;
}
function scBaselineStatus(progId,progressByMob,staffMap){
  var present=scRolesFromRoster(staffMap||{}), out=[];
  for(var di=0;di<SC_BASELINE_DAYS;di++){
    var d=scDayDef(progId,di), need=[], done=[];
    Object.keys(staffMap||{}).forEach(function(m){ var s=staffMap[m]; if(!s||s.disabled) return;
      if(!(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,s.role||'CHO',present); })) return;
      need.push(m); var rec=((progressByMob||{})[m]||{})['day_'+di]; if(rec&&rec.taskDone) done.push(m); });
    out.push({di:di,title:SC_BASELINE[di].title,need:need.length,done:done.length,pending:need.filter(function(m){ return done.indexOf(m)<0; }).map(function(m){ return (staffMap[m]||{}).name||m; }),complete:need.length>0&&done.length===need.length});
  }
  return out;
}
function scBaselineGaps(agg,progId,progressByMob){
  // facility-level baseline gaps that are still open: lowest scorer, unmet items
  var out=[];
  Object.keys(agg.cps||{}).forEach(function(id){
    var x=agg.cps[id]; if(x.base===null||x.base>=2) return;
    var cp=scCpmGet(id); if(!cp) return;
    var low=x.by.filter(function(b){ return b.base!==null; }).sort(function(a,b){ return a.base-b.base||((a.score==null?3:a.score)-(b.score==null?3:b.score)); })[0];
    var gi=scBaselineGroupOf(id), d=gi>=0?scDayDef(progId,gi):null, ci=d?(d.cps||[]).findIndex(function(c){ return c.id===id; }):-1;
    var rec=gi>=0&&low?(((progressByMob||{})[low.mob]||{})['day_'+gi]||{}):{};
    var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',(cp.items||[]).length);
    var unmet=(cp.items||[]).filter(function(_,k){ return tk[k]===0; });
    out.push({id:id,cp:cp,base:x.base,current:x.score,owner:low,di:gi,ci:ci,unmet:unmet,open:x.score===null||x.score<2,dueDay:scThemeEndDay(cp)});
  });
  out.sort(function(a,b){ return (a.dueDay-b.dueDay)||(a.base-b.base)||(a.id<b.id?-1:1); });
  return out;
}
async function scBaselinePlan(hostId){
  var st=_scIns[hostId]; if(!st) return;
  if(!scCanWriteFacility(st.code)){ showToast('You cannot create actions for this facility.','err'); return; }
  var fac=st.fac||{};
  var prog=st.progress||{}, gaps=scBaselineGaps(st.agg,st.progId,prog).filter(function(g){ return g.open&&g.owner&&g.di>=0&&g.ci>=0; });
  var existing=await fbGet('sc_corrective/'+st.code)||{}, have={};
  Object.keys(existing).forEach(function(k){ var a=existing[k]; if(a&&a.status!=='closed') have[a.gapKey]=1; });
  var todo=gaps.filter(function(g){ return !have[scGapKey(g.owner.mob,g.di,g.ci)]; });
  if(!todo.length){ showToast('Every open baseline gap already has an action.','ok'); return; }
  var ok=await showConfirm('Create '+todo.length+' corrective action'+(todo.length===1?'':'s')+' from the baseline gaps? Each goes to the staff member who gave the lowest score, with the unmet MoV items as the action and a due date at the end of the implementation week for its area. You can edit or reassign them in the Gap Register.','📋','Create action plan','Create','var(--teal)');
  if(!ok) return;
  var a=scActor(), now=scNowIso(), upd={};
  todo.forEach(function(g){
    var hi=false, items=g.unmet.map(function(it){ return it.t; });
    var due=fac.startDate?scAddDays(fac.startDate,g.dueDay-1):scAddDays(scTodayStr(),7);
    upd[scUid('ca')]=scClean({gapKey:scGapKey(g.owner.mob,g.di,g.ci),ownerMob:g.owner.mob,di:g.di,ci:g.ci,progId:st.progId,cpText:g.cp.t,aoc:g.cp.aoc,me:g.cp.me,service:g.cp.svc,
      ownerName:g.owner.name,action:items.length?'Baseline gap — make these met: '+items.join(' · '):'Baseline gap — reach Full compliance on this checkpoint',
      dueDate:due,assignedTo:g.owner.mob,assignedToName:g.owner.name,status:'open',assignedBy:a.name,assignedByRole:a.role||'',assignedAt:now,source:'baseline-plan',cpId:g.id});
  });
  try{ await db.ref('sc_corrective/'+st.code).update(upd); }catch(e){ showToast('Could not create the actions — check connection.','err'); return; }
  showToast(todo.length+' action'+(todo.length===1?'':'s')+' created in the Gap Register.','ok');
  try{ st.actions=await fbGet('sc_corrective/'+st.code)||{}; }catch(e){}
  scInsRender(hostId);
}
function scBaselineCsv(hostId){
  var st=_scIns[hostId]; if(!st) return '';
  var rows=[['Checkpoint ID','AoC','Standard','ME','Checkpoint','Baseline','Current','Lowest scorer','Role','Unmet MoV items','Implementation week ends (day)']];
  scBaselineGaps(st.agg,st.progId,st.progress||{}).forEach(function(g){
    rows.push([g.id,g.cp.aoc,g.cp.std,g.cp.me,g.cp.t,g.base===1?'Partial':'Non',g.current===2?'Full':g.current===1?'Partial':g.current===0?'Non':'—',g.owner?g.owner.name:'',g.owner?g.owner.role:'',g.unmet.map(function(i){ return i.t; }).join(' | '),g.dueDay]); });
  var csv=rows.map(function(r){ return r.map(function(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(','); }).join('\n');
  try{ var el=document.createElement('a'); el.href=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv'})); el.download='baseline-report-'+st.code+'.csv'; document.body.appendChild(el); el.click(); el.remove(); }catch(e){}
  return csv;
}
function scBaselineHTML(st){
  var A=st.agg, B=A.baseline||{}, stat=scBaselineStatus(st.progId,st.progress||{},st.staff||{}), H=scJs(st.hostId);
  var done=stat.filter(function(x){ return x.complete; }).length;
  var Bc=Object.assign({},B,{coverage:{assessed:B.assessed||0}}), nq=scNqasCheckV2(Bc);
  var gaps=scBaselineGaps(A,st.progId,st.progress||{}), open=gaps.filter(function(g){ return g.open; });
  var html='<div class="scd-rep-h"><div><div class="scd-rep-t">Baseline — 7-day rapid audit</div><div class="scc-hint">The first assessment of every checkpoint. It stays fixed so progress can be compared against it.</div></div>'
    +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scBaselineCsv(\''+H+'\')"><i class="ti ti-download"></i> Baseline report CSV</button></div>'
    +'<div class="scd-days">'+stat.map(function(x){ return '<div class="scd-day '+(x.complete?'ok':x.done?'part':'')+'" title="'+scEsc(x.title+(x.pending.length?' — waiting for '+x.pending.join(', '):''))+'"><b>D'+(x.di+1)+'</b><span>'+x.done+'/'+x.need+'</span></div>'; }).join('')+'</div>'
    +'<div class="scx-tiles">'
    +'<div class="scx-tile"><div class="scx-tile-v">'+done+'/'+SC_BASELINE_DAYS+'</div><div class="scx-tile-l">Baseline days completed</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v">'+(B.assessed||0)+'/'+A.total+'</div><div class="scx-tile-l">Checkpoints with a baseline</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v" style="color:'+(B.assessed?scPctText(B.pct):'var(--t3)')+';">'+(B.assessed?B.pct+'%':'—')+'</div><div class="scx-tile-l">Baseline readiness</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v" style="color:var(--amber-dk);">'+gaps.length+'</div><div class="scx-tile-l">Gaps found at baseline</div></div>'
    +'<div class="scx-tile"><div class="scx-tile-v">'+(gaps.length-open.length)+'</div><div class="scx-tile-l">Already fixed since</div></div>'
    +'</div>';
  if(!B.assessed) return html+'<div class="scx-empty">No baseline yet — it fills in as staff complete Days 1–7.</div>';
  html+=scNqasBoxHTML(Object.assign({},Bc,{nqas:nq})).replace('NQAS criteria','NQAS criteria at baseline');
  html+='<div class="scx-sub">Structure · Process · Outcome (baseline)</div>'+SC_AOC_CATS.map(function(k){ var b=B.byCat[k]; return b?scBar2(k,b,null):''; }).join('');
  html+='<div class="scx-sub">By Area of Concern (baseline)</div>'+Object.keys(SC_CPM_AOC).map(function(k){ var b=B.byAoc[k]; return b?scBar2('AoC '+k+' · '+SC_CPM_AOC[k],b,null):''; }).join('');
  var weak=Object.keys(B.byStd).filter(function(s){ return B.byStd[s].assessed; }).sort(function(a,b){ return (B.byStd[a].pct-scNqasStdMin(a))-(B.byStd[b].pct-scNqasStdMin(b)); }).slice(0,10);
  html+='<div class="scx-sub">Weakest Standards at baseline</div><div class="scc-std"><table><thead><tr><th>Standard</th><th>Baseline</th><th>Min</th><th>Now</th></tr></thead><tbody>'
    +weak.map(function(s){ var b=B.byStd[s], m=scNqasStdMin(s), c=A.byStd[s]; return '<tr class="'+(b.pct>=m?'ok':'no')+'"><td><b>'+s+'</b> <span>'+scEsc((scRegTitle('std',s)||'').slice(0,46))+'</span></td><td style="color:'+scPctText(b.pct)+';"><b>'+b.pct+'%</b></td><td>'+m+'%</td><td>'+(c?c.pct+'%':'—')+'</td></tr>'; }).join('')+'</tbody></table></div>';
  var byOwner={}; open.forEach(function(g){ var k=g.owner?g.owner.name+' ('+g.owner.role+')':'—'; byOwner[k]=(byOwner[k]||0)+1; });
  var byWeek={}; open.forEach(function(g){ byWeek[g.dueDay]=(byWeek[g.dueDay]||0)+1; });
  html+='<div class="scx-sub">Action plan</div><div class="scd-plan">'
    +'<div>'+open.length+' baseline gap'+(open.length===1?' is':'s are')+' still open. The Supervisor turns them into a weekly focus plan: up to 3 actions per person each week, this week\'s theme first; the rest wait in the backlog.</div>'
    +'<div class="scd-plan-g"><div><b>By staff</b>'+Object.keys(byOwner).map(function(k){ return '<span>'+scEsc(k)+': '+byOwner[k]+'</span>'; }).join('')+'</div>'
    +'<div><b>By implementation week</b>'+Object.keys(byWeek).sort(function(a,b){ return a-b; }).map(function(d){ return '<span>Week ending Day '+d+': '+byWeek[d]+'</span>'; }).join('')+'</div></div>'
    +(scRvCanAssign(st.code)?'<button class="scx-btn" onclick="scBaselinePlan(\''+H+'\')"><i class="ti ti-list-check"></i> Suggest this week\'s focus actions</button>':'<div class="scc-hint">The Supervisor sets the weekly focus plan in Review &amp; Action Plan.</div>')
    +'</div>';
  return html;
}
(function(){
  var oRender=scInsRender;
  scInsRender=function(hostId){
    var st=_scIns[hostId]; if(!st) return oRender.apply(this,arguments);
    var want=st.tab;
    if(want==='baseline') st.tab='readiness';
    var r=oRender.apply(this,arguments);
    st.tab=want;
    try{
      var host=document.getElementById(hostId), tabs=host&&host.querySelector('.scx-tabs'); if(!tabs) return r;
      var b=document.createElement('button'); b.className='scx-tab'+(want==='baseline'?' on':''); b.textContent='🧭 '+t('Baseline report');
      b.setAttribute('onclick',"scInsTab('"+scJs(hostId)+"','baseline')"); tabs.insertBefore(b,tabs.children[1]||null);
      if(want==='baseline'){
        [].forEach.call(tabs.querySelectorAll('.scx-tab'),function(x){ if(x!==b) x.classList.remove('on'); });
        while(tabs.nextSibling) host.removeChild(tabs.nextSibling);
        var div=document.createElement('div'); div.innerHTML=scBaselineHTML(st); host.appendChild(div);
      }
    }catch(e){ console.warn('[SC] baseline tab',e); }
    return r;
  };
})();
