
// ══════════════════════════════════════════════════════════════
// PROGRAMME END (Step 1 of CQI)
//  Days 57–60 = Readiness week: end-line verification (Days 57–58, the baseline-review engine on Days 50–56), final team review (59), graduation (60).
//  Graduation: on Day 60 when the end-line and its verification are done, else on the close date (Day 60 + grace) with what is done.
//   Result from the verified end-line: NQAS Ready (overall, every AoC and every Standard at minimum) · Almost ready · Not yet ready · Incomplete.
//   Frozen by the graduateFacility function. After the close date cards are read-only.
//  Catch-up (HealSol, free or paid): 30 days — weeks 1–3 the three weakest areas, week 4 re-check on the end-line cards — then graduation runs again.
//  sc_facilities/{code}: graduation (function) · catchup (HealSol) · nhsrc (District Admin / HealSol) · population (CHO / HealSol) · phase
//  Timeline compliance card: cards on time / late / missing, milestones, actions, weekly focus plans → On track / Slipping / Behind.
//  Settings: shared/sc_grad_config (HealSol).
// ══════════════════════════════════════════════════════════════
var NF_GRAD={days:60,grace:7,catchDays:30,maxCatch:1,green:80,amber:60,missDays:3,blLate:10,certYears:3};
var NF_GRAD_RES={ready:{en:'NQAS Ready',hi:'NQAS तैयार',ic:'🎓',c:'g'},almost:{en:'Almost ready',hi:'लगभग तैयार',ic:'🟡',c:'a'},notyet:{en:'Not yet ready',hi:'अभी तैयार नहीं',ic:'⏳',c:'r'},incomplete:{en:'Incomplete',hi:'अधूरा',ic:'⚠️',c:'r'}};
var NF_NHSRC_ST=[['ready','NQAS Ready (not applied yet)'],['applied','Applied'],['state','State assessment done'],['national','National assessment done'],['certified','Certified'],['notcertified','Not certified']];
Object.assign(HINDI_UI,{'Readiness week':'तैयारी सप्ताह','Programme complete':'कार्यक्रम पूरा','On track':'समय पर','Slipping':'पिछड़ रहे','Behind':'बहुत पीछे',
  'on time':'समय पर','late':'देर से','missing':'बाकी','Population served':'सेवित जनसंख्या','Catch-up':'कैच-अप'});
async function nfgCfgLoad(){ try{ var c=await fbGet('shared/sc_grad_config'); _nfgRaw=c||{}; if(c) Object.keys(NF_GRAD).forEach(function(k){ if(c[k]!=null&&!isNaN(+c[k])) NF_GRAD[k]=+c[k]; }); }catch(e){}
  if(typeof NF_BL!=='undefined') NF_BL.autoEnd=NF_GRAD.days+NF_GRAD.grace; return NF_GRAD; }
(function(){ var oL=scCpmLoad, at=0; scCpmLoad=async function(){ var r=await oL.apply(this,arguments); if(Date.now()-at>300000){ at=Date.now(); await nfgCfgLoad(); } return r; }; })();
// ── dates ──
function nfgPad(n){ return String(n).padStart(2,'0'); }
function nfgAdd(ymd,n){ var p=String(ymd).split('-'), d=new Date(+p[0],+p[1]-1,+p[2]+n); return d.getFullYear()+'-'+nfgPad(d.getMonth()+1)+'-'+nfgPad(d.getDate()); }
function nfgIdx(f){ var n=nfBlDayNo(f); return n==null?null:n-1; }                         // 0-based programme day, not capped
function nfgDates(f){ var s=f&&f.startDate; if(!s) return null; var last=NF_GRAD.days-1; return {start:s,last:nfgAdd(s,last),close:nfgAdd(s,last+NF_GRAD.grace),lastIdx:last,closeIdx:last+NF_GRAD.grace}; }
function nfgFmt(ymd){ try{ return scFmtDate(ymd); }catch(e){ return ymd; } }
function nfgHi(){ return typeof _appLang!=='undefined'&&_appLang==='hi'; }
function nfgSF(){ var f=choState&&choState.facility; if(f&&!f.startDate&&choState.startDate) f.startDate=choState.startDate; if(f&&!f.progId&&choState.progId) f.progId=choState.progId; return f||{}; }   // staff app: the facility record with its start date
function nfgCatchup(f){ var c=f&&f.catchup; return c&&c.on?c:null; }
function nfgCatchActive(f){ var c=nfgCatchup(f), t=scTodayStr(); return !!(c&&!c.done&&c.start&&c.end&&t>=c.start&&t<=c.end); }
// ── Readiness week: Days 57–60 (replace the old milestone days; old milestones retired) ──
var NF_RW=[
  {t:'Readiness week · End-line verification (1)',hi:'तैयारी सप्ताह · एंड-लाइन सत्यापन (1)',
   task:'Your Quality Champion or Supervisor re-checks a sample of the items you marked Met on Days 50–56. Keep your registers and records ready, show each item when asked, then mark this card done.',
   cps:[['RW-1','My end-line cards (Days 50–56) are all done','मेरे एंड-लाइन कार्ड (दिन 50–56) सभी पूरे हैं','General'],['RW-2','Registers and records for my Met items are ready to show','मेरे पूरे (Met) आइटम के रजिस्टर और रिकॉर्ड दिखाने के लिए तैयार हैं','General']]},
  {t:'Readiness week · End-line verification (2)',hi:'तैयारी सप्ताह · एंड-लाइन सत्यापन (2)',
   task:'Verification continues. Note every item the verifier changed to Not met and open My gaps to see how to fix it.',
   cps:[['RW-3','Items the verifier changed to Not met are noted, and I know how to fix them','सत्यापनकर्ता ने जो आइटम "पूरा नहीं" किए, वे नोट हैं और मुझे पता है उन्हें कैसे सुधारना है','General'],['RW-4','Display boards and premises checked — patient rights, services list, cleanliness','डिस्प्ले बोर्ड और परिसर जाँचे — मरीज़ अधिकार, सेवाओं की सूची, सफ़ाई','CHO']]},
  {t:'Readiness week · Final review with the team',hi:'तैयारी सप्ताह · टीम के साथ अंतिम समीक्षा',
   task:'Sit together with your team: look at the final score, the Areas of Concern and the gaps still open (Facility dashboard → Readiness). Agree who fixes each remaining gap — this is your carry-forward list.',
   cps:[['RW-5','Team final review held — score, Areas of Concern and remaining gaps seen together','टीम की अंतिम समीक्षा हुई — स्कोर, क्षेत्र और बची कमियाँ साथ में देखीं','CHO'],['RW-6','Carry-forward list agreed — who fixes each remaining gap','आगे की सूची तय — हर बची कमी कौन सुधारेगा','CHO'],['RW-7','I know my remaining gaps and the steps to fix them (My gaps)','मुझे अपनी बची कमियाँ और उन्हें सुधारने के कदम पता हैं (मेरी कमियाँ)','General']]},
  {t:'Readiness week · Graduation day',hi:'तैयारी सप्ताह · स्नातक दिवस',
   task:'Today the programme result is worked out from your verified end-line scores. See it on Home with your team. If you earned it, download your certificate.',
   cps:[['RW-8','Graduation result seen with the team','टीम के साथ परिणाम देखा','CHO'],['RW-9','My certificate downloaded (if earned)','मेरा प्रमाणपत्र डाउनलोड किया (यदि अर्जित)','General']]}
];
NF_RW.forEach(function(x){ HINDI_UI[x.t]=x.hi; });
var _nfgRwCache={};
function nfgRwDay(progId,di){
  if(di<56||di>59) return null; var key=progId+'|'+di; if(_nfgRwCache[key]) return _nfgRwCache[key]; var x=NF_RW[di-56];
  return (_nfgRwCache[key]={day:di+1,aoc:'Boss',isBoss:true,service:'Readiness week',title:x.t,titleHi:x.hi,task:x.task,me:'',aocTags:['Readiness week'],methods:['SI','OB'],
    roles:{prime:'CHO',support:['ANM','ASHA','MPW']},phase:'readiness',isReadiness:true,
    cps:x.cps.map(function(c){ return {id:c[0],t:c[1],hi:c[2],r:[c[3]],aoc:'',me:'',kind:'milestone',method:['SI'],svc:'Readiness week'}; })});
}
(function(){
  var oDef=scDayDef; scDayDef=function(progId,di){ return nfgRwDay(progId,di)||oDef.apply(this,arguments); };
  var oGet=getDay; getDay=function(di){ return nfgRwDay(choState.progId,di)||oGet.apply(this,arguments); };
  SC_SVC_GROUPS.programme.push('Readiness week');
  // Card Editor (day view): Days 57–60 are built in, like Days 8–56
  if(typeof aeGetActiveArray==='function'){ var oArr=aeGetActiveArray; aeGetActiveArray=function(){ var arr=oArr.apply(this,arguments)||[], pid=scCpmEditorLetterToProg(adminActiveProg||'C'); return arr.map(function(d,di){ return nfgRwDay(pid,di)||d; }); }; }
  if(typeof aeOpenDay==='function'){ var oOpen=aeOpenDay; aeOpenDay=function(di){ var d=nfgRwDay('nqas_12B',di); if(!d) return oOpen.apply(this,arguments); adminEditorDay=null;
    scAeGenNote(document.getElementById('ae-editor-panel'),'<b>Day '+(di+1)+' · '+scEsc(d.title)+'</b><br>Readiness week (Days 57–60) is built in: end-line verification by the Quality Champion / Supervisor (Days 57–58), the final team review (Day 59) and graduation (Day 60). '+d.cps.length+' short milestone items, not scored for readiness.'); }; }
  nfScDataThen(function(){ SC_CPM_BASE.forEach(function(c){ if(c.kind==='milestone'&&/^M-\d+$/.test(c.id)) c.retired=true; });   // old Boss Battle / Consolidation / Mock / Grand Finale items
    try{ scCpmInvalidate(); }catch(e){} });
})();
// ── end-line + verification status, graduation snapshot ──
function nfgCtx(st){ return {code:st.code,fac:st.fac||{},progId:st.progId||(st.fac||{}).progId||'nqas_12A',roster:st.staff||{},progress:st.progress||{}}; }
function nfgEndline(st){
  var S=st.staff||{}, P=st.progress||{}, pid=st.progId, present=scRolesFromRoster(S), days=0, miss=0;
  for(var di=49;di<=55;di++){ var d=scDayDef(pid,di)||{}, need=Object.keys(S).filter(function(m){ var s=S[m]; return s&&!s.disabled&&(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,s.role||'CHO',present); }); });
    var left=need.filter(function(m){ return !(((P[m]||{})['day_'+di])||{}).taskDone; }).length; if(need.length&&!left) days++; miss+=left; }
  return {days:days,done:days===7,missing:miss};
}
function nfgVerif(st){ var S=nfBlSummary(nfgCtx(st),'end'); return {S:S,done:S.n.reviewed+S.n.auto===7,reviewed:S.n.reviewed}; }
function nfgSnap(st){
  var A=st.agg||scFacilityReadiness(st.progId,st.progress||{},st.staff||{}), byAoc={}, byStd={};
  Object.keys(A.byAoc||{}).forEach(function(a){ var b=A.byAoc[a]; if(/^[A-H]$/.test(a)&&b&&b.max>0) byAoc[a]=b.pct; });
  Object.keys(A.byStd||{}).forEach(function(s){ var b=A.byStd[s]; if(/^[A-H]\d{1,2}$/.test(s)&&b&&b.max>0) byStd[s]=b.pct; });
  return {overall:A.pct,base:A.baseline&&A.baseline.assessed?A.baseline.pct:null,byAoc:byAoc,byStd:byStd,openGaps:(A.gaps||[]).filter(function(g){ return !g.closed; }).length,agg:A};
}
function nfgPreview(sn,endDone){   // same rule as the server
  var n=sn.agg.nqas||scNqasCheckV2(sn.agg); if(!endDone) return 'incomplete'; return n.meets?'ready':n.overallOk?'almost':'notyet';
}
var _nfgTried={};
async function nfgMaybeGraduate(st){
  try{
    var f=st.fac||{}, D=nfgDates(f), idx=nfgIdx(f); if(!D||idx==null||idx<D.lastIdx||!st.code) return null;
    var g=f.graduation, cu=nfgCatchup(f), due=!g||(cu&&(+cu.round||1)>(+g.round||0)&&cu.end&&scTodayStr()>=cu.end);
    if(!due) return null; if(_nfgTried[st.code]&&Date.now()-_nfgTried[st.code]<600000) return null;
    var E=nfgEndline(st), V=nfgVerif(st), complete=E.done&&V.done;
    if(!g&&!complete&&idx<D.closeIdx) return null;
    _nfgTried[st.code]=Date.now(); var sn=nfgSnap(st);
    var r=await nfCall('graduateFacility',{code:st.code,complete:complete,endlineDone:E.done,verified:V.done,openGaps:sn.openGaps,scores:{overall:sn.overall,base:sn.base,byAoc:sn.byAoc,byStd:sn.byStd}});
    if(r&&r.graduation){ nfgPutFac(st.code,{graduation:r.graduation,phase:'complete'}); f.graduation=r.graduation; if(f.catchup&&r.graduation.round) f.catchup.done=true; return r.graduation; }
  }catch(e){ console.warn('[SC] graduation',e&&e.message); }
  return null;
}
function nfgPutFac(code,patch){
  [typeof scMasterFacilities!=='undefined'?(scMasterFacilities||{})[code]:null,(choState&&choState.facilityCode===code)?choState.facility:null,
   (typeof scSubAdminCode!=='undefined'&&scSubAdminCode===code&&typeof scSubAdminData!=='undefined')?scSubAdminData:null].forEach(function(o){ if(o) Object.assign(o,patch); });
  Object.keys(_scIns||{}).forEach(function(h){ var s=_scIns[h]; if(s&&s.code===code&&s.fac) Object.assign(s.fac,patch); });
}
// ── read-only after the close date (and before-Day-57 cards after graduation); catch-up re-opens the end-line cards ──
function nfgLocked(di){
  if(appMode!=='cho'||!choState||!choState.facility) return false; var f=nfgSF(), D=nfgDates(f), idx=nfgIdx(f); if(!D||idx==null) return false;
  var closed=idx>D.closeIdx||(idx===D.closeIdx&&!!f.graduation)||(!!f.graduation&&di<56); if(!closed) return false;
  if(nfgCatchActive(f)&&nfBlIsEnd(di)) return false; return true;
}
function nfgLockMsg(){ var D=nfgDates(nfgSF())||{}; showToast((nfgHi()?'कार्यक्रम बंद हो चुका है':'The programme has closed')+(D.close?' ('+nfgFmt(D.close)+')':'')+' — '+(nfgHi()?'कार्ड अब केवल देखने के लिए हैं।':'cards are view-only now.'),'err'); }
(function(){ ['setCP','tickCP','markDone','resetCard'].forEach(function(fn){ if(typeof window[fn]!=='function') return; var o=window[fn];
  window[fn]=function(di){ if(nfgLocked(+di)){ nfgLockMsg(); return; } return o.apply(this,arguments); }; }); })();
// ── timeline compliance ──
function nfgComp(st){
  var f=st.fac||{}, D=nfgDates(f), idx=nfgIdx(f), S=st.staff||{}, P=st.progress||{}, pid=st.progId||f.progId||'nqas_12A';
  var out={state:'notstarted',onTime:0,late:0,missing:0,total:0,pct:null,oldMiss:0,people:[],ms:[],acts:{open:0,od:0},plans:{made:0,due:0},idx:idx,D:D};
  if(!D||idx==null||idx<0) return out;
  var present=scRolesFromRoster(S), top=Math.min(idx,NF_GRAD.days-1), today=scTodayStr();
  Object.keys(S).forEach(function(m){ var s=S[m]; if(!s||s.disabled) return; var p={mob:m,name:s.name||m,role:s.role||'CHO',on:0,late:0,miss:0};
    for(var di=0;di<=top;di++){ var d=scDayDef(pid,di); if(!d||!(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,p.role,present); })) continue;
      var r=(P[m]||{})['day_'+di]||{};
      if(r.taskDone){ var w=r.doneAt||r.updatedAt; if(w&&nfLocalISO(w)<=nfgAdd(D.start,di)) p.on++; else p.late++; }
      else if(di<idx){ p.miss++; out.oldMiss=Math.max(out.oldMiss,idx-di); } }
    out.onTime+=p.on; out.late+=p.late; out.missing+=p.miss; out.people.push(p); });
  out.total=out.onTime+out.late+out.missing; out.pct=out.total?Math.round(out.onTime/out.total*100):null;
  // milestones
  function all(a,z){ var last='', ok=true; Object.keys(S).forEach(function(m){ var s=S[m]; if(!s||s.disabled) return; for(var di=a;di<=z;di++){ var d=scDayDef(pid,di);
      if(!d||!(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,s.role||'CHO',present); })) continue; var r=(P[m]||{})['day_'+di]||{};
      if(!r.taskDone) ok=false; else { var w=nfLocalISO(r.doneAt||r.updatedAt||''); if(w>last) last=w; } } }); return {ok:ok,last:last}; }
  function ms(key,label,a,z,dueIdx){ var x=all(a,z), due=nfgAdd(D.start,dueIdx), s=x.ok?(x.last&&x.last<=due?'done':'late'):(idx>dueIdx?'overdue':'upcoming'); out.ms.push({key:key,label:label,due:due,dueDay:dueIdx+1,s:s}); return s; }
  var bl=ms('baseline','Baseline done',0,6,6); ms('endline','End-line done',49,55,55);
  var V=nfgVerif(st), vs=V.done?'done':idx>57?'overdue':'upcoming'; out.ms.push({key:'verify',label:'End-line verified',due:nfgAdd(D.start,57),dueDay:58,s:vs});
  // actions and weekly focus plans
  var A=st.actions||{}, weeks={};
  Object.keys(A).forEach(function(k){ var a=A[k]||{}; if(a.source==='week-plan'&&a.week) weeks[a.week]=1;
    if(['draft','suggested','done','closed','cancelled'].indexOf(a.status)>=0) return; out.acts.open++; if(a.dueDate&&a.dueDate<today) out.acts.od++; });
  for(var w=2;w<=7;w++){ if(idx>=(w-1)*7) { out.plans.due++; if(weeks[w]) out.plans.made++; } }
  out.hasActs=!!st.actions;
  // status
  if(f.graduation){ out.state='complete'; }
  else if(out.pct===null) out.state='g';
  else if(out.pct<NF_GRAD.amber||(idx>=NF_GRAD.blLate&&bl!=='done'&&bl!=='late')) out.state='r';
  else if(out.pct<NF_GRAD.green||out.oldMiss>NF_GRAD.missDays) out.state='a';
  else out.state='g';
  return out;
}
function nfgStateLabel(s){ var hi=nfgHi(); return s==='g'?(hi?'🟢 समय पर':'🟢 On track'):s==='a'?(hi?'🟡 पिछड़ रहे':'🟡 Slipping'):s==='r'?(hi?'🔴 बहुत पीछे':'🔴 Behind'):s==='complete'?(hi?'✓ कार्यक्रम पूरा':'✓ Programme complete'):(hi?'शुरू नहीं हुआ':'Not started'); }
function nfgStateCls(s){ return s==='g'?'g':s==='a'?'a':s==='r'?'r':s==='complete'?'g':'n'; }
function nfgDayLine(f){ var D=nfgDates(f), idx=nfgIdx(f), hi=nfgHi(); if(!D||idx==null) return hi?'प्रारंभ तिथि तय नहीं':'No start date'; if(idx<0) return (hi?'शुरू ':'Starts ')+nfgFmt(D.start);
  if(f.graduation) return (hi?'पूरा ':'Completed ')+nfgFmt(String(f.graduation.at||'').slice(0,10));
  if(idx<=D.lastIdx) return (hi?'दिन ':'Day ')+(idx+1)+' / '+NF_GRAD.days+' · '+(hi?'बंद ':'closes ')+nfgFmt(D.close);
  if(idx>D.closeIdx) return (hi?'बंद ':'Closed ')+nfgFmt(D.close)+(hi?' · परिणाम खोलने पर':' · graduation runs when the facility is opened');
  return (hi?'छूट सप्ताह · बंद ':'Grace week · closes ')+nfgFmt(D.close); }
function nfgCompHTML(st,c){
  c=c||nfgComp(st); var f=st.fac||{}, hi=nfgHi();
  if(c.state==='notstarted') return '';
  var msIc={done:'✓',late:'✓',overdue:'⚠️',upcoming:'·'}, msTx={done:hi?'समय पर':'on time',late:hi?'देर से':'late',overdue:hi?'देर हो गई':'overdue',upcoming:hi?'बाकी':'due'};
  var h='<div class="nfg-box nfg-comp" data-code="'+scEsc(st.code||'')+'"><h4>⏱ '+scEsc(hi?'समय-सारिणी पालन':'Timeline compliance')+' <span class="nfg-st '+nfgStateCls(c.state)+'">'+scEsc(nfgStateLabel(c.state))+'</span> <small>'+scEsc(nfgDayLine(f))+'</small></h4>'
    +'<div class="nfg-grid"><div><b style="color:var(--green-dk,#166534)">'+c.onTime+'</b><small>'+scEsc(hi?'समय पर':'cards on time')+'</small></div><div><b style="color:var(--amber-dk,#92400E)">'+c.late+'</b><small>'+scEsc(hi?'देर से':'done late')+'</small></div><div><b style="color:var(--red-dk,#991B1B)">'+c.missing+'</b><small>'+scEsc(hi?'बाकी':'missing')+'</small></div></div>'
    +(c.pct!=null?'<div class="nfg-note">'+c.pct+'% '+scEsc(hi?'कार्ड अपने दिन पर पूरे':'of cards done on their day')+(c.oldMiss>NF_GRAD.missDays?' · '+scEsc(hi?'सबसे पुराना बाकी कार्ड '+c.oldMiss+' दिन पहले का':'oldest missing card is '+c.oldMiss+' days old'):'')+'</div>':'')
    +'<div class="nfg-ms">'+c.ms.map(function(m){ return '<div><span>'+msIc[m.s]+'</span> '+scEsc(m.label)+' — '+scEsc(msTx[m.s])+' <small style="color:var(--t3)">('+(hi?'दिन ':'Day ')+m.dueDay+')</small></div>'; }).join('')
    +(c.hasActs?'<div><span>'+(c.acts.od?'⚠️':'✓')+'</span> '+scEsc(hi?'कार्य':'Actions')+': '+c.acts.open+' '+scEsc(hi?'खुले':'open')+' · '+c.acts.od+' '+scEsc(hi?'समय से पीछे':'overdue')+'</div>'
      +(c.plans.due?'<div><span>'+(c.plans.made>=c.plans.due?'✓':'⚠️')+'</span> '+scEsc(hi?'साप्ताहिक फ़ोकस योजना':'Weekly focus plans')+': '+c.plans.made+' / '+c.plans.due+'</div>':''):'')+'</div>';
  var ppl=c.people.filter(function(p){ return p.on+p.late+p.miss>0; });
  if(ppl.length>1||(ppl.length&&appMode!=='cho')) h+='<div class="nfg-ppl">'+ppl.sort(function(a,b){ return (b.miss-a.miss)||(b.late-a.late); }).map(function(p){ return '<div><span>'+scEsc(p.name)+' · '+scEsc(p.role)+'</span><span>'+p.on+' ✓ · '+p.late+' '+scEsc(hi?'देर':'late')+' · <b style="color:'+(p.miss?'var(--red-dk,#991B1B)':'inherit')+'">'+p.miss+' '+scEsc(hi?'बाकी':'missing')+'</b></span></div>'; }).join('')+'</div>';
  return h+'</div>';
}
function nfgChipsHTML(f,c){
  var hi=nfgHi(), out=[], g=f.graduation, cu=nfgCatchup(f), n=f.nhsrc;
  if(c&&c.state!=='notstarted'&&c.state!=='complete') out.push('<span class="nfg-chip '+nfgStateCls(c.state)+'">'+scEsc(nfgStateLabel(c.state))+(c.pct!=null?' · '+c.pct+'% '+scEsc(hi?'समय पर':'on time'):'')+'</span>');
  if(g){ var R=NF_GRAD_RES[g.result]||NF_GRAD_RES.notyet; out.push('<span class="nfg-chip '+R.c+'">'+R.ic+' '+scEsc(hi?R.hi:R.en)+' · '+g.overall+'%</span>'); }
  else if(c&&c.D&&c.idx!=null&&c.idx>c.D.closeIdx) out.push('<span class="nfg-chip a">⏳ '+scEsc(hi?'बंद — परिणाम बाकी':'Closed — graduation pending')+'</span>');
  else if(c&&c.D&&c.idx!=null&&c.idx>=49) out.push('<span class="nfg-chip b">📅 '+scEsc(hi?'बंद ':'Closes ')+nfgFmt(c.D.close)+'</span>');
  if(cu&&!cu.done) out.push('<span class="nfg-chip p">🔁 '+scEsc(hi?'कैच-अप':'Catch-up')+' '+(cu.free?(hi?'निःशुल्क':'free'):(cu.paid?(hi?'भुगतान हुआ':'paid'):(hi?'भुगतान बाकी':'payment due')))+'</span>');
  if(n&&n.status){ var lab=(NF_NHSRC_ST.find(function(x){ return x[0]===n.status; })||[])[1]||n.status; out.push('<span class="nfg-chip '+(n.status==='certified'?'g':'b')+'">🏛 NHSRC: '+scEsc(lab)+'</span>'); var due=nfgNhsrcDue(n); if(due&&due.soon) out.push('<span class="nfg-chip a">🗓 '+scEsc(due.label)+' '+scEsc(hi?'देय':'due')+' '+nfgFmt(due.date)+'</span>'); }
  return out.join('');
}
// ── NHSRC record ──
function nfgNhsrcDue(n){
  if(!n||n.status!=='certified'||!n.certifiedOn) return null; var y=function(k){ return nfgAdd(n.certifiedOn,0).replace(/^(\d{4})/,function(m){ return String(+m+k); }); };
  var L=[{label:'Surveillance year 1',date:y(1),done:n.s1Done},{label:'Surveillance year 2',date:y(2),done:n.s2Done},{label:'Re-certification',date:y(NF_GRAD.certYears),done:null}].filter(function(x){ return !x.done; });
  var x=L[0]; if(!x) return null; var days=Math.round((new Date(x.date+'T00:00:00')-new Date(scTodayStr()+'T00:00:00'))/86400000);
  return {label:x.label,date:x.date,days:days,soon:days<=60};
}
function nfgCanNhsrc(){ return appMode==='sc-admin'||(typeof scIsDistrict==='function'&&scIsDistrict()&&!(_scSup&&_scSup.scope==='block')); }
async function nfgNhsrcEdit(code){
  if(!nfgCanNhsrc()){ showToast('District Admin or HealSol updates the NHSRC record.','err'); return; }
  var f=nfgFacOf(code)||{}, n=f.nhsrc||{};
  var v=await scDialog({title:'NHSRC certification — '+(f.name||code),icon:'🏛',wide:true,okLabel:'Save',
    message:'Record each step of the NHSRC (national) certification. Reminders appear 60 and 30 days before each surveillance visit. As understood, certification is valid '+NF_GRAD.certYears+' years with a surveillance visit every year — please follow the current NHSRC guidelines.',
    fields:[{key:'status',label:'Status',type:'select',value:n.status||'ready',options:NF_NHSRC_ST.map(function(x){ return {value:x[0],label:x[1]}; })},
      {key:'appliedOn',label:'Applied on',type:'date',value:n.appliedOn||''},{key:'stateOn',label:'State assessment on',type:'date',value:n.stateOn||''},{key:'nationalOn',label:'National assessment on',type:'date',value:n.nationalOn||''},
      {key:'certifiedOn',label:'Certified on (date on the certificate)',type:'date',value:n.certifiedOn||''},{key:'score',label:'NHSRC score (%)',type:'number',value:n.score!=null?n.score:''},
      {key:'certNo',label:'Certificate number',value:n.certNo||''},{key:'s1Done',label:'Surveillance year 1 done on',type:'date',value:n.s1Done||''},{key:'s2Done',label:'Surveillance year 2 done on',type:'date',value:n.s2Done||''},
      {key:'note',label:'Note',type:'textarea',rows:2,value:n.note||''}],
    validate:function(v){ if(v.status==='certified'&&!v.certifiedOn) return 'Enter the certification date.'; if(v.status==='certified'&&v.score==='') return 'Enter the NHSRC score (%) — it is printed on the certification report.'; if(v.score!==''&&!(+v.score>=0&&+v.score<=100)) return 'Score must be 0–100.'; return null; }});
  if(!v) return;
  var rec=scClean({status:v.status,appliedOn:v.appliedOn||null,stateOn:v.stateOn||null,nationalOn:v.nationalOn||null,certifiedOn:v.certifiedOn||null,score:v.score===''?null:+v.score,certNo:v.certNo||null,
    s1Done:v.s1Done||null,s2Done:v.s2Done||null,note:v.note||null,validUntil:v.certifiedOn?nfgAdd(v.certifiedOn,0).replace(/^(\d{4})/,function(m){ return String(+m+NF_GRAD.certYears); }):null,updatedAt:scNowIso(),updatedBy:scActor().name||appMode});
  var ok=await fbSet(scFacilityPath(code)+'/nhsrc',rec); showToast(ok?'NHSRC record saved.':'Could not save — check connection.',ok?'ok':'err'); if(ok){ nfgPutFac(code,{nhsrc:rec}); nfgRefresh(code); }
}
function nfgNhsrcWa(code){ var f=nfgFacOf(code)||{}, d=nfgNhsrcDue(f.nhsrc); if(!d) return;
  var txt='NQAS reminder — '+(f.name||code)+': '+d.label+' is due on '+nfgFmt(d.date)+' ('+d.days+' days). Please keep the evidence folder and registers ready.';
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank'); }
// ── population ──
function nfgFacOf(code){ return (typeof scMasterFacilities!=='undefined'&&(scMasterFacilities||{})[code])||((typeof scSubAdminCode!=='undefined'&&scSubAdminCode===code&&typeof scSubAdminData!=='undefined')?scSubAdminData:null)||((choState&&choState.facilityCode===code)?choState.facility:null)||(Object.keys(_scIns||{}).map(function(h){ return _scIns[h]; }).filter(function(s){ return s&&s.code===code; })[0]||{}).fac||null; }
function nfgCanPop(code){ if(appMode==='sc-admin') return true; if(appMode==='cho'&&choState&&choState.facilityCode===code) return (choState.roleId||'CHO')==='CHO'; var f=nfgFacOf(code)||{}, me=choState&&choState.staffMobile, s=me&&(f.staff||{})[me]; return !!(s&&!s.disabled&&(s.role||'CHO')==='CHO'); }
async function nfgPopEdit(code){
  code=code||(choState&&choState.facilityCode)||(typeof scSubAdminCode!=='undefined'?scSubAdminCode:''); if(!code) return;
  if(!nfgCanPop(code)){ showToast('The CHO fills the population (HealSol may edit).','err'); return; }
  var f=nfgFacOf(code)||{}, p=f.population||{}, hi=nfgHi();
  var v=await scDialog({title:hi?'सेवित जनसंख्या — '+(f.name||code):'Population served — '+(f.name||code),icon:'👪',okLabel:hi?'सहेजें':'Save',
    message:hi?'आपके उप-केंद्र के क्षेत्र की जनसंख्या (HMIS / आशा सर्वे के अनुसार)।':'The population of your sub-centre area (as per HMIS / ASHA survey).',
    fields:[{key:'n',label:hi?'जनसंख्या':'Population served',type:'number',required:true,value:p.n||''},{key:'villages',label:hi?'गाँवों की संख्या (वैकल्पिक)':'Number of villages (optional)',type:'number',value:p.villages||''},
      {key:'households',label:hi?'परिवारों की संख्या (वैकल्पिक)':'Number of households (optional)',type:'number',value:p.households||''},{key:'confirm',type:'checklist',value:[],options:[{value:'1',label:hi?'संख्या सही है (500 से कम या 30,000 से अधिक होने पर)':'The number is correct (needed below 500 or above 30,000)'}]}],
    validate:function(v){ var n=+v.n; if(!(n>=1&&n<=1000000)||Math.floor(n)!==n) return hi?'जनसंख्या सही संख्या में लिखें।':'Enter the population as a whole number.';
      if((n<500||n>30000)&&!(v.confirm||[]).length) return hi?'यह संख्या असामान्य है — कृपया दोबारा जाँचें और "संख्या सही है" चुनें।':'This number looks unusual for a sub-centre — please re-check and tick "The number is correct".';
      if(v.villages!==''&&!(+v.villages>=1&&+v.villages<=500)) return hi?'गाँवों की संख्या 1–500 के बीच हो।':'Villages: 1–500.';
      if(v.households!==''&&!(+v.households>=1&&+v.households<=200000)) return hi?'परिवारों की संख्या जाँचें।':'Check the number of households.'; return null; }});
  if(!v) return;
  var rec=scClean({n:+v.n,villages:v.villages===''?null:+v.villages,households:v.households===''?null:+v.households,at:scNowIso(),by:(choState&&choState.staffName)||scActor().name||appMode});
  var ok=await fbSet(scFacilityPath(code)+'/population',rec); showToast(ok?(hi?'सहेजा गया।':'Population saved.'):(hi?'सहेज नहीं सका — इंटरनेट जाँचें।':'Could not save — check connection.'),ok?'ok':'err');
  if(ok){ nfgPutFac(code,{population:rec}); nfgRefresh(code); }
}
function nfgPopLine(f){ var p=f&&f.population, hi=nfgHi(); if(!p||!p.n) return ''; return Number(p.n).toLocaleString('en-IN')+' '+(hi?'लोग':'people')+(p.villages?' · '+p.villages+' '+(hi?'गाँव':'villages'):'')+(p.households?' · '+Number(p.households).toLocaleString('en-IN')+' '+(hi?'परिवार':'households'):''); }
// ── catch-up (HealSol) ──
function nfgWeakGroups(st){
  var A=nfgSnap(st).agg, G={}; scPkgNqas(st.progId).forEach(function(cp){ var g=scDayGroup(cp), x=A.cps[cp.id]; if(g==null||!x) return; var b=G[g]||(G[g]={g:g,s:0,n:0}); b.n++; b.s+=x.score||0; });
  return Object.keys(G).map(function(k){ var b=G[k]; return {g:+k,pct:b.n?Math.round(b.s/(2*b.n)*100):100}; }).sort(function(a,b){ return a.pct-b.pct; });
}
async function nfgCatchupStart(code){
  if(appMode!=='sc-admin') return; var st=nfgStOf(code); if(!st) { showToast('Open the facility first.','err'); return; }
  var f=st.fac, g=f.graduation, cu=f.catchup||{}; if(!g){ showToast('Catch-up is offered after graduation.','err'); return; }
  var used=+cu.round||0; if(used>=NF_GRAD.maxCatch&&cu.on){ showToast('This facility has had '+used+' catch-up'+(used===1?'':'s')+' (limit '+NF_GRAD.maxCatch+' — change it in Timeline settings).','err'); return; }
  var W=nfgWeakGroups(st).slice(0,3);
  var v=await scDialog({title:'Offer a 30-day catch-up — '+(f.name||code),icon:'🔁',wide:true,okLabel:'Start catch-up',
    message:'Result: '+(NF_GRAD_RES[g.result]||{}).en+' ('+g.overall+'%). Weeks 1–3 work on the three weakest areas, week 4 re-checks them on the end-line cards (Days 50–56, re-opened), then graduation runs again.',
    fields:[{key:'w',type:'info',value:'Weakest areas: '+W.map(function(x,i){ return 'Week '+(i+1)+': '+SC_BASELINE[x.g].title+' ('+x.pct+'%)'; }).join(' · ')},
      {key:'fee',label:'Fee',type:'select',value:'free',options:[{value:'free',label:'Free'},{value:'paid',label:'Paid — payment due'}]},
      {key:'start',label:'Starts on',type:'date',value:scTodayStr()}],
    validate:function(v){ return v.start?null:'Choose the start date.'; }});
  if(!v) return;
  var rec=scClean({on:true,round:used+1,free:v.fee==='free',paid:v.fee==='free'?null:false,start:v.start,end:nfgAdd(v.start,NF_GRAD.catchDays-1),groups:W.map(function(x){ return x.g; }),
    fromResult:g.result,fromScore:g.overall,at:scNowIso(),by:scActor().name||'HealSol'});
  var ok=await fbSet(scFacilityPath(code)+'/catchup',rec)&&await fbSet(scFacilityPath(code)+'/phase','catchup')&&await fbSet(scFacilityPath(code)+'/phaseHistory/c'+Date.now(),{phase:'catchup',at:scNowIso()});
  showToast(ok?'Catch-up started: '+nfgFmt(rec.start)+' – '+nfgFmt(rec.end)+'.':'Could not save — check connection.',ok?'ok':'err'); if(ok){ nfgPutFac(code,{catchup:rec,phase:'catchup'}); nfgRefresh(code); }
}
async function nfgCatchupPaid(code){ if(appMode!=='sc-admin') return; if(!await showConfirm('Mark the catch-up fee as paid?')) return;
  var ok=await fbSet(scFacilityPath(code)+'/catchup/paid',true); if(ok){ var f=nfgFacOf(code); if(f&&f.catchup) f.catchup.paid=true; nfgRefresh(code); } showToast(ok?'Marked as paid.':'Could not save.',ok?'ok':'err'); }
function nfgCatchWeek(cu){ var d=Math.round((new Date(scTodayStr()+'T00:00:00')-new Date(cu.start+'T00:00:00'))/86400000); return {day:d+1,week:Math.min(4,Math.floor(d/7)+1)}; }
function nfgCatchText(cu){ var hi=nfgHi(), w=nfgCatchWeek(cu), gs=cu.groups||[];
  if(w.week<=3&&gs[w.week-1]!=null){ var B=SC_BASELINE[gs[w.week-1]]; return (hi?'सप्ताह '+w.week+': '+B.hi+' — मेरी कमियाँ में इस क्षेत्र की कमियाँ सुधारें।':'Week '+w.week+': '+B.title+' — fix this area\'s gaps from My gaps.'); }
  return hi?'सप्ताह 4: दोबारा जाँच — एंड-लाइन कार्ड (दिन '+gs.map(function(g){ return 50+g; }).join(', ')+') खोलें और अपने चेकपॉइंट फिर से स्कोर करें।':'Week 4: re-check — open the end-line cards (Day '+gs.map(function(g){ return 50+g; }).join(', ')+') and re-score your checkpoints.'; }
// ── HealSol: re-run / override, timeline settings ──
async function nfgRerun(code){
  if(appMode!=='sc-admin') return; var st=nfgStOf(code); if(!st) return; var sn=nfgSnap(st), E=nfgEndline(st), V=nfgVerif(st), pv=nfgPreview(sn,E.done);
  var v=await scDialog({title:'Run graduation again — '+(st.fac.name||code),icon:'🎓',wide:true,okLabel:'Run graduation',
    message:'Today\'s scores: overall '+sn.overall+'% · end-line '+(E.done?'done':'not finished')+' · verification '+(V.done?'done':'not finished')+'. Worked-out result: '+NF_GRAD_RES[pv].en+'. The earlier result is kept in the history.',
    fields:[{key:'result',label:'Result',type:'select',value:'',options:[{value:'',label:'As worked out ('+NF_GRAD_RES[pv].en+')'}].concat(Object.keys(NF_GRAD_RES).map(function(k){ return {value:k,label:'Override: '+NF_GRAD_RES[k].en}; }))},
      {key:'reason',label:'Reason (required)',type:'textarea',rows:2,required:true}],validate:function(v){ return String(v.reason||'').trim()?null:'Write the reason.'; }});
  if(!v) return;
  try{ var r=await nfCall('graduateFacility',{code:code,complete:E.done&&V.done,endlineDone:E.done,verified:V.done,openGaps:sn.openGaps,result:v.result||null,reason:v.reason,
      scores:{overall:sn.overall,base:sn.base,byAoc:sn.byAoc,byStd:sn.byStd}});
    nfgPutFac(code,{graduation:r.graduation,phase:'complete'}); showToast('Graduation saved: '+NF_GRAD_RES[r.graduation.result].en+'.','ok'); nfgRefresh(code); }
  catch(e){ showToast(e.message||'Could not run graduation.','err'); }
}
// Timeline settings per facility type (HealSol 21 Oct): Sub-Centre at the top level of shared/sc_grad_config (as before, so the
// live SC app reads the same keys); UPHC / PHC / CHC under shared/sc_grad_config/byType/{type}, each key falling back to the SC value.
var NFG_KEYS=['grace','catchDays','maxCatch','green','amber','missDays','blLate','certYears'];
var _nfgRaw=null;
function nfgCfgFor(t,raw){ raw=raw||_nfgRaw||{}; var o={}; NFG_KEYS.forEach(function(k){ o[k]=raw[k]!=null&&!isNaN(+raw[k])?+raw[k]:NF_GRAD[k]; });
  var b=(raw.byType||{})[t]; if(t&&t!=='sc'&&b) NFG_KEYS.forEach(function(k){ if(b[k]!=null&&!isNaN(+b[k])) o[k]=+b[k]; });
  if(t&&t!=='sc'){ o.catchDays=28; o.maxCatch=1; }   // department core: one catch-up of 3 weeks on the gaps + 1 week end-line again (fixed)
  return o; }
async function nfgSettings(){
  if(appMode!=='sc-admin') return;
  try{ _nfgRaw=await fbGet('shared/sc_grad_config')||{}; }catch(e){ _nfgRaw=_nfgRaw||{}; }
  var types=Object.keys(NF_LEVELS), cur=(typeof _hs!=='undefined'&&_hs&&_hs.type&&NF_LEVELS[_hs.type])?_hs.type:'sc', buf={};
  types.forEach(function(t){ buf[t]=nfgCfgFor(t); });
  var lab=function(t){ var d=t==='sc'?60:(NF_LEVELS[t].days||60); return [['grace','Grace days after Day '+d+' (close date)'],['catchDays','Catch-up length (days)'],['maxCatch','Catch-ups allowed per facility'],['green','On track: cards on time at least (%)'],
    ['amber','Slipping from (%) — below this is Behind'],['missDays','On track only if no card is missing for more than (days)'],['blLate','Behind if baseline not finished by Day'],['certYears','NHSRC certificate valid (years)']]; };
  var F=lab('sc');
  var v=await scDialog({title:'Programme timeline settings',icon:'⏱',wide:true,okLabel:'Save settings',message:'Each facility type has its own timeline. Used for the close date, catch-up and the Timeline compliance card on every dashboard.',
    fields:F.map(function(x){ return {key:x[0],label:x[1],type:'number',required:true,value:buf[cur][x[0]]}; }),
    onRender:function(I){
      var first=I.grace.el.closest('.scx-field'), bar=document.createElement('div'); bar.className='hs-tabs nfg-ttabs'; bar.setAttribute('role','tablist');
      var read=function(){ NFG_KEYS.forEach(function(k){ buf[cur][k]=+I[k].el.value; }); };
      var show=function(){ var L=lab(cur); NFG_KEYS.forEach(function(k,i){ I[k].el.value=buf[cur][k]; var l=I[k].el.parentNode.querySelector('.scx-lbl'); if(l) l.textContent=L[i][1]+' *'; });
        I.catchDays.el.disabled=I.maxCatch.el.disabled=cur!=='sc'; var h=I.catchDays.el.parentNode.querySelector('.nfg-h'); if(!h){ h=document.createElement('div'); h.className='scx-hint nfg-h'; I.catchDays.el.parentNode.appendChild(h); }
        h.textContent=cur==='sc'?'':'Fixed for '+NF_LEVELS[cur].plural+': one catch-up — 3 weeks on the weakest departments, then 1 week of end-line again.';
        bar.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-t')===cur); }); };
      types.forEach(function(t){ var b=document.createElement('button'); b.type='button'; b.className='hs-tab'; b.setAttribute('data-t',t); b.textContent=NF_LEVELS[t].plural; b.onclick=function(){ read(); cur=t; show(); }; bar.appendChild(b); });
      first.parentNode.insertBefore(bar,first); show();
      // keep the visible tab's numbers in the buffer for validate / save
      NFG_KEYS.forEach(function(k){ I[k].el.addEventListener('input',function(){ buf[cur][k]=+I[k].el.value; }); });
    },
    validate:function(){ for(var i=0;i<types.length;i++){ var t=types[i], x=buf[t];
      if(NFG_KEYS.some(function(k){ return !(x[k]>=0&&x[k]<=1000); })) return NF_LEVELS[t].plural+': use numbers between 0 and 1000.';
      if(x.amber>x.green) return NF_LEVELS[t].plural+': Slipping must start below On track.'; } return null; }});
  if(!v) return;
  var up={updatedAt:scNowIso()}; NFG_KEYS.forEach(function(k){ up[k]=buf.sc[k]; });
  types.forEach(function(t){ if(t==='sc') return; var o={}; NFG_KEYS.forEach(function(k){ if(k!=='catchDays'&&k!=='maxCatch') o[k]=buf[t][k]; }); up['byType/'+t]=o; });
  var ok=false; try{ await db.ref('shared/sc_grad_config').update(up); ok=true; }catch(e){}
  if(ok){ NFG_KEYS.forEach(function(k){ NF_GRAD[k]=buf.sc[k]; }); _nfgRaw=Object.assign({},_nfgRaw,{byType:Object.assign({},(_nfgRaw||{}).byType)}); types.forEach(function(t){ if(t!=='sc') _nfgRaw.byType[t]=up['byType/'+t]; }); NF_BL.autoEnd=NF_GRAD.days+NF_GRAD.grace; }
  showToast(ok?'Timeline settings saved for every facility type.':'Could not save.',ok?'ok':'err');
}
// ── the Programme block (facility views: Supervisor / HealSol / District / MOIC drill-in, CHO facility dashboard, Champion facility view) ──
function nfgStOf(code){ var L=Object.keys(_scIns||{}).map(function(h){ return _scIns[h]; }).filter(function(s){ return s&&s.code===code; }); return L[0]||null; }
function nfgRefresh(code){ Object.keys(_scIns||{}).forEach(function(h){ var s=_scIns[h]; if(s&&s.code===code) try{ scInsRender(h); }catch(e){} });
  try{ if(appMode==='cho'&&typeof nfRenderToday==='function') nfRenderToday(); }catch(e){} try{ if((appMode==='sc-admin'||appMode==='sc-supervisor')&&document.getElementById('sc-master-grid')) scRenderMasterDashboard(); }catch(e){} }
function nfgProgHTML(st){
  var f=st.fac||{}, hi=nfgHi(), D=nfgDates(f), idx=nfgIdx(f), g=f.graduation, cu=nfgCatchup(f), C=scJs(st.code), hs=appMode==='sc-admin';
  var h='<div class="nfg-box nfg-prog"><h4>🎓 '+scEsc(hi?'कार्यक्रम':'Programme')+' <small>'+scEsc(nfgDayLine(f))+'</small></h4>';
  if(g){ var R=NF_GRAD_RES[g.result]||NF_GRAD_RES.notyet;
    h+='<div class="nfg-res '+g.result+'"><b>'+R.ic+' '+scEsc(hi?R.hi:R.en)+' · '+g.overall+'%</b><small>'+(g.base!=null?(hi?'बेसलाइन ':'Baseline ')+g.base+'% → '+g.overall+'% · ':'')
      +(g.aocFails&&g.aocFails.length?(hi?'70% से कम क्षेत्र: ':'AoC below minimum: ')+g.aocFails.join(', ')+' · ':'')+(g.stdFails&&g.stdFails.length?g.stdFails.length+(hi?' मानक न्यूनतम से कम · ':' Standards below minimum · '):'')
      +(g.openGaps!=null?g.openGaps+(hi?' कमियाँ आगे ले जाएँ':' gaps to carry forward'):'')+'<br>'+scEsc((hi?'घोषित ':'Graduated ')+nfgFmt(String(g.at||'').slice(0,10))+' · '+(g.byRole||''))+(g.override?' · '+scEsc((hi?'HealSol द्वारा बदला: ':'set by HealSol: ')+(g.reason||'')):'')+'</small></div>';
  } else if(D&&idx!=null&&idx>=49){
    var E=nfgEndline(st), V=nfgVerif(st), pv=nfgPreview(nfgSnap(st),true);
    h+='<div class="nfg-ms"><div><span>'+(E.done?'✓':'·')+'</span> '+scEsc(hi?'एंड-लाइन (दिन 50–56)':'End-line (Days 50–56)')+': '+E.days+'/7 '+scEsc(hi?'दिन पूरे':'days complete')+(E.missing?' · '+E.missing+' '+scEsc(hi?'कार्ड बाकी':'cards left'):'')+'</div>'
      +'<div><span>'+(V.done?'✓':'·')+'</span> '+scEsc(hi?'सत्यापन':'Verification')+': '+V.reviewed+'/7 '+scEsc(hi?'दिन जाँचे':'days reviewed')+'</div>'
      +'<div><span>📅</span> '+scEsc(hi?'परिणाम: दिन 60 ('+nfgFmt(D.last)+') — या बंद होने की तिथि '+nfgFmt(D.close)+' को':'Graduation: Day 60 ('+nfgFmt(D.last)+') when both are done — otherwise on the close date '+nfgFmt(D.close))+'</div>'
      +'<div><span>🎯</span> '+scEsc(hi?'आज के स्कोर पर: ':'On today\'s scores: ')+'<b>'+scEsc(hi?NF_GRAD_RES[pv].hi:NF_GRAD_RES[pv].en)+'</b></div></div>';
    if(nfBlCanView(st.code)) h+='<div class="nfg-note">'+scEsc(hi?'एंड-लाइन सत्यापन — दिन चुनें:':'End-line verification — tap a day:')+'</div>'+nfBlDaysHTML(nfgCtx(st),appMode==='sc-champion'?"nfBlStart('"+C+"',%D)":"nfBlOpen('"+C+"',%D,'visit')",'end');
  } else if(D) h+='<div class="nfg-note">'+scEsc(hi?'दिन 60 ('+nfgFmt(D.last)+') को परिणाम; बंद होने की तिथि '+nfgFmt(D.close)+'।':'Graduation on Day 60 ('+nfgFmt(D.last)+'); the programme closes on '+nfgFmt(D.close)+'.')+'</div>';
  if(cu){ h+='<div class="nfg-banner b"><b>🔁 '+scEsc(hi?'कैच-अप':'Catch-up')+' '+nfgFmt(cu.start)+' – '+nfgFmt(cu.end)+' · '+(cu.free?(hi?'निःशुल्क':'free'):(cu.paid?(hi?'भुगतान हुआ':'paid'):(hi?'भुगतान बाकी':'payment due')))+(cu.done?' · '+(hi?'पूरा':'done'):'')+'</b>'
    +scEsc((cu.groups||[]).map(function(x,i){ return (hi?'सप्ताह ':'Week ')+(i+1)+': '+(hi?SC_BASELINE[x].hi:SC_BASELINE[x].title); }).join(' · ')+(hi?' · सप्ताह 4: दोबारा जाँच':' · Week 4: re-check'))
    +(nfgCatchActive(f)?'<br>'+scEsc(nfgCatchText(cu)):'')+'</div>'; }
  var pop=nfgPopLine(f);
  h+='<div class="nfg-row">'+nfgChipsHTML(f,null)+'<span class="nfg-chip">👪 '+scEsc(pop||(hi?'जनसंख्या दर्ज नहीं':'Population not entered'))+'</span></div>';
  var d=nfgNhsrcDue(f.nhsrc); if(d&&d.soon) h+='<div class="nfg-banner"><b>🗓 '+scEsc(d.label)+' — '+nfgFmt(d.date)+' ('+d.days+(hi?' दिन)':' days)')+'</b>'+scEsc(hi?'साक्ष्य फ़ोल्डर और रजिस्टर तैयार रखें।':'Keep the evidence folder and registers ready.')
    +'<br><button class="scx-btn sm ghost" onclick="nfgNhsrcWa(\''+C+'\')">WhatsApp reminder</button></div>';
  var b=[];
  if(nfgCanPop(st.code)) b.push('<button class="scx-btn sm ghost" onclick="nfgPopEdit(\''+C+'\')">👪 '+scEsc(pop?(hi?'जनसंख्या बदलें':'Edit population'):(hi?'जनसंख्या जोड़ें':'Add population'))+'</button>');
  if(nfgCanNhsrc()) b.push('<button class="scx-btn sm ghost" onclick="nfgNhsrcEdit(\''+C+'\')">🏛 '+scEsc(f.nhsrc?'Update NHSRC':'NHSRC record')+'</button>');
  if(hs){ if(g&&g.result!=='ready'&&!(cu&&cu.on&&(+cu.round||0)>=NF_GRAD.maxCatch)) b.push('<button class="scx-btn sm ghost" onclick="nfgCatchupStart(\''+C+'\')">🔁 Offer 30-day catch-up</button>');
    if(cu&&!cu.free&&!cu.paid) b.push('<button class="scx-btn sm ghost" onclick="nfgCatchupPaid(\''+C+'\')">Mark catch-up paid</button>');
    if(g||(D&&idx!=null&&idx>=D.lastIdx)) b.push('<button class="scx-btn sm ghost" onclick="nfgRerun(\''+C+'\')">🎓 '+(g?'Run graduation again':'Run graduation now')+'</button>');
    b.push('<button class="scx-btn sm ghost" onclick="nfgSettings()">⏱ Timeline settings</button>'); }
  if(b.length) h+='<div class="nfg-btns">'+b.join('')+'</div>';
  return h+'</div>';
}
(function(){
  var oR=scInsRender;
  scInsRender=function(hostId){ var r=oR.apply(this,arguments);
    try{ var st=_scIns[hostId], host=document.getElementById(hostId); if(!st||!host||st.tab!=='readiness') return r;
      host.insertAdjacentHTML('afterbegin',nfgProgHTML(st)+nfgCompHTML(st));
      nfgMaybeGraduate(st).then(function(g){ if(g){ st.fac.graduation=g; scInsRender(hostId); } });
    }catch(e){ console.warn('[SC] programme block',e); }
    return r; };
})();
// ── facility lists (HealSol, Supervisor, District Admin, MOIC): chips, worst first ──
(function(){
  var oM=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oM.apply(this,arguments);
    try{ var grid=document.getElementById('sc-master-grid'); if(!grid) return r; var rank={r:0,a:1,g:2,complete:3,notstarted:4}, cards=[];
      var byName={}; Object.keys(scMasterFacilities||{}).forEach(function(c){ var f=scMasterFacilities[c]; byName[((f&&f.name)||c).trim()]=c; });
      [].slice.call(grid.querySelectorAll('.master-fac-card')).forEach(function(card){ if(card.querySelector('.nfg-row')||card.classList.contains('nf-dept-fac')) return; var m=/scDrillIn\('([^']+)'\)/.exec(card.outerHTML), nm=card.querySelector('.mfc-name');
        var code=m?m[1]:nm?byName[String((nm.childNodes[0]||{}).textContent||'').trim()]:null; if(!code) return;
        var f=(scMasterFacilities||{})[code]||{}, c=(typeof nfgCompFor==='function')?nfgCompFor(code,f,(scMasterProgress||{})[code],null):nfgComp({code:code,fac:f,staff:f.staff||{},progress:(scMasterProgress||{})[code]||{},progId:f.progId||'nqas_12A'});
        var chips=nfgChipsHTML(f,c), pop=nfgPopLine(f); if(pop) chips+='<span class="nfg-chip">👪 '+scEsc(pop)+'</span>';
        var meta=card.querySelector('.mfc-meta'); if(chips&&meta) meta.insertAdjacentHTML('afterend','<div class="nfg-row">'+chips+'</div>');
        cards.push({el:card,k:rank[c.state]!=null?rank[c.state]:5,p:c.pct==null?101:c.pct}); });
      cards.sort(function(a,b){ return (a.k-b.k)||(a.p-b.p); }).forEach(function(x){ grid.appendChild(x.el); });
    }catch(e){ console.warn('[SC] facility chips',e); }
    return r; };
})();
// ── laptop Overview (HealSol, Supervisor, District, MOIC, Champion): Programme & timeline card, worst first ──
function nfgOvCardHTML(rows){
  var L=rows.map(function(r){ var code=r.code, f=((typeof scMasterFacilities!=='undefined'&&scMasterFacilities)||{})[code]||((typeof _scq!=='undefined'&&_scq.facs)||{})[code]||{};
      var pr=((typeof scMasterProgress!=='undefined'&&scMasterProgress)||{})[code]||((typeof _scq!=='undefined'&&_scq.prog)||{})[code]||{};
      var acts=(typeof _scRvAll!=='undefined'&&_scRvAll&&_scRvAll[code])||null;
      var c=(typeof nfgCompFor==='function')?nfgCompFor(code,f,pr,acts):nfgComp({code:code,fac:f,staff:f.staff||{},progress:pr,actions:acts,progId:f.progId||'nqas_12A'}); return {code:code,f:f,c:c}; })
    .filter(function(x){ return x.c.state!=='notstarted'; });
  if(!L.length) return '';
  var rank={r:0,a:1,g:2,complete:3}, n={g:0,a:0,r:0}, res={}; L.forEach(function(x){ if(n[x.c.state]!=null) n[x.c.state]++; var g=x.f.graduation; if(g) res[g.result]=(res[g.result]||0)+1; });
  L.sort(function(a,b){ return ((rank[a.c.state]||0)-(rank[b.c.state]||0))||((a.c.pct==null?101:a.c.pct)-(b.c.pct==null?101:b.c.pct)); });
  return '<div class="nfo-card"><div class="nfo-ch"><b>⏱ Programme &amp; timeline</b><span>'+n.g+' on track · '+n.a+' slipping · '+n.r+' behind'+(Object.keys(res).length?' · graduated: '+Object.keys(res).map(function(k){ return res[k]+' '+NF_GRAD_RES[k].en; }).join(', '):'')+'</span></div>'
    +L.slice(0,12).map(function(x){ return '<button type="button" class="nfo-att" onclick="scDrillIn(\''+scJs(x.code)+'\')" style="text-align:left;"><b>'+scEsc(x.f.name||x.code)+'</b><span style="display:block;color:var(--t3);font-size:11px;">'+scEsc(nfgDayLine(x.f))+'</span><span class="nfg-row" style="display:flex;">'+nfgChipsHTML(x.f,x.c)+'</span></button>'; }).join('')
    +(L.length>12?'<div class="nfo-empty sm">+'+(L.length-12)+' more in Facilities</div>':'')+'</div>';
}
(function(){ if(typeof nfOverviewHTML!=='function') return; var oO=nfOverviewHTML;
  nfOverviewHTML=function(rows,opts){ try{ var c=nfgOvCardHTML(rows||[]); if(c) opts=Object.assign({},opts,{extraSide:c+((opts&&opts.extraSide)||'')}); }catch(e){ console.warn('[SC] programme card',e); } return oO.call(this,rows,opts); }; })();
// ── MO overview: status chip per sub-centre ──
(function(){ if(typeof nfMoRender!=='function') return; var oR=nfMoRender;
  nfMoRender=function(){ var r=oR.apply(this,arguments);
    try{ var body=document.getElementById('nfmo-body'); if(!body) return r;
      (_nfMo.list||[]).forEach(function(x){ var b=body.querySelector('[onclick^="nfMoSwitch(\''+x.code+'\'"]'), card=b&&b.closest('.nfmo-sc'); if(!card) return;
        var c=nfgComp({code:x.code,fac:x.f,staff:x.f.staff||{},progress:x.pr||{},actions:x.acts,progId:x.f.progId||'nqas_12A'}), chips=nfgChipsHTML(x.f,c);
        var at=card.querySelector('.nfmo-chips'); if(chips&&at) at.insertAdjacentHTML('afterbegin',chips); }); }catch(e){}
    return r; }; })();
// ── Champion portal: end-line verification block ──
(function(){ if(typeof scqRenderChampionApp!=='function') return; var oA=scqRenderChampionApp;
  scqRenderChampionApp=function(){ var r=oA.apply(this,arguments);
    try{ if(appMode!=='sc-champion') return r; var app=document.getElementById('scq-app'); if(!app) return r; var old=app.querySelector('#nfg-champ'); if(old) old.remove();
      var codes=Object.keys(_scq.facs||{}).filter(scqChampionCan).filter(function(c){ var i=nfgIdx(_scq.facs[c]); return i!=null&&i>=49&&!(_scq.facs[c]||{}).graduation; }); if(!codes.length) return r;
      var h='<div class="scq-sec" id="nfg-champ"><div class="scq-sec-t"><i class="ti ti-clipboard-check"></i> End-line verification (Days 50–56)</div>'+codes.map(function(code){ var f=_scq.facs[code], ctx={code:code,fac:f,progId:f.progId||'nqas_12A',roster:f.staff||{},progress:_scq.prog[code]||{}}, S=nfBlSummary(ctx,'end'), nt=nfBlNoteText(S,'end'), D=nfgDates(f);
        return '<div class="nfbl-box"><b>'+scEsc(f.name||code)+'</b><small>'+scEsc(nt.t)+'. Readiness week: Days 57–58 ('+nfgFmt(nfgAdd(f.startDate,56))+' – '+nfgFmt(nfgAdd(f.startDate,57))+'). Re-check a sample of Met items — on a field visit or a live session.</small>'+nfBlDaysHTML(ctx,"nfBlStart('"+scJs(code)+"',%D)",'end')+'</div>'; }).join('')+'</div>';
      var main=app.querySelector('.scq-main')||app; main.insertAdjacentHTML('afterbegin',h); }catch(e){ console.warn('[SC] end-line block',e); }
    return r; }; })();
// ── staff app: Home banners (programme end, catch-up), team timeline, population prompt ──
var _nfgFresh={at:0,code:''};
async function nfgStaffFresh(){ var code=choState&&choState.facilityCode; if(!code||(_nfgFresh.code===code&&Date.now()-_nfgFresh.at<120000)) return false; _nfgFresh={at:Date.now(),code:code};
  try{ var f=await fbGet(scFacilityPath(code)); if(f&&choState.facility){ var ch=['graduation','catchup','nhsrc','population','phase'].some(function(k){ return JSON.stringify(f[k]||null)!==JSON.stringify(choState.facility[k]||null); });
      ['graduation','catchup','nhsrc','population','phase'].forEach(function(k){ if(f[k]!=null) choState.facility[k]=f[k]; else delete choState.facility[k]; }); return ch; } }catch(e){} return false; }
function nfgStaffSt(){ var fac=_nfFac&&_nfFac.code===choState.facilityCode?_nfFac:null; if(!fac||!fac.progress) return null;
  return {code:choState.facilityCode,fac:nfgSF(),progId:choState.progId,staff:fac.staff||{},progress:fac.progress||{},agg:fac.agg}; }
function nfgStaffHTML(){
  var f=nfgSF(), hi=nfgHi(), D=nfgDates(f), idx=nfgIdx(f), g=f.graduation, cu=nfgCatchup(f), st=nfgStaffSt(), h='';
  if(!D||idx==null||idx<0) return '';
  if(g){ var R=NF_GRAD_RES[g.result]||NF_GRAD_RES.notyet;
    h+='<div class="nfg-res '+g.result+'"><b>'+R.ic+' '+scEsc(hi?R.hi:R.en)+' — '+g.overall+'%</b><small>'+(g.base!=null?(hi?'बेसलाइन ':'Baseline ')+g.base+'% → '+g.overall+'%. ':'')
      +scEsc(g.result==='ready'?(hi?'बधाई! आपकी टीम ने NQAS मानक पूरे किए।':'Congratulations — your team meets the NQAS criteria.'):(hi?'मेरी कमियाँ में बचे कार्य जारी रखें।':'Keep working on the remaining gaps in My gaps.'))+'</small></div>';
  } else if(idx>D.lastIdx) h+='<div class="nfg-banner"><b>⏳ '+scEsc(hi?'कार्यक्रम '+nfgFmt(D.close)+' को बंद होगा':'Programme closes on '+nfgFmt(D.close))+'</b>'+scEsc(hi?'बचे कार्ड और सत्यापन उससे पहले पूरे करें। उसके बाद कार्ड केवल देखने के लिए होंगे।':'Finish any missing cards and the verification before then. After that, cards become view-only.')+'</div>';
  else if(idx>=56) h+='<div class="nfg-banner b"><b>🎓 '+scEsc(hi?'तैयारी सप्ताह':'Readiness week')+'</b>'+scEsc(hi?'दिन 60 ('+nfgFmt(D.last)+') को परिणाम।':'Graduation on Day 60 ('+nfgFmt(D.last)+').')+'</div>';
  if(cu&&nfgCatchActive(f)){ var w=nfgCatchWeek(cu); h+='<div class="nfg-banner b"><b>🔁 '+scEsc((hi?'कैच-अप · दिन ':'Catch-up · Day ')+w.day+' / '+NF_GRAD.catchDays)+'</b>'+scEsc(nfgCatchText(cu))+'</div>'; }
  if(st&&!g){ var c=nfgComp(st), me=c.people.find(function(p){ return p.mob===choState.staffMobile; });
    if(c.state!=='notstarted') h+='<div class="nfg-row"><span class="nfg-chip '+nfgStateCls(c.state)+'">'+scEsc(hi?'टीम: ':'Team: ')+scEsc(nfgStateLabel(c.state))+(c.pct!=null?' · '+c.pct+'% '+scEsc(hi?'समय पर':'on time'):'')+'</span>'
      +(me&&me.miss?'<span class="nfg-chip r">'+scEsc(hi?'आप '+me.miss+' कार्ड पीछे हैं — आज पूरा करें':'You are '+me.miss+' card'+(me.miss===1?'':'s')+' behind — catch up today')+'</span>':'')+'</div>'; }
  var role=choState.roleId||'CHO'; if(role==='CHO'&&!(f.population&&f.population.n)) h+='<div class="nfg-banner b"><b>👪 '+scEsc(hi?'अपने उप-केंद्र की जनसंख्या जोड़ें':'Add your sub-centre\'s population')+'</b>'+scEsc(hi?'HMIS / आशा सर्वे के अनुसार। इससे आपकी टीम का सामाजिक प्रभाव दिखेगा।':'As per HMIS / ASHA survey. It shows how many people your team\'s work reaches.')+'<br><button class="scx-btn sm" onclick="nfgPopEdit()">'+scEsc(hi?'अभी जोड़ें':'Add now')+'</button></div>';
  return h?'<div id="nfg-staff">'+h+'</div>':'';
}
(function(){ if(typeof nfRenderToday!=='function') return; var oT=nfRenderToday;
  nfRenderToday=function(){ var r=oT.apply(this,arguments);
    try{ var host=document.getElementById('nf-today'); if(!host) return r; var old=document.getElementById('nfg-staff'); if(old) old.remove();
      var hero=host.querySelector('.nf-hero'), h=nfgStaffHTML(); if(h){ if(hero) hero.insertAdjacentHTML('afterend',h); else host.insertAdjacentHTML('afterbegin',h); }
      if(!_nfgFresh.busy){ _nfgFresh.busy=true; nfgStaffFresh().then(function(ch){ _nfgFresh.busy=false; var st=nfgStaffSt(); if(ch) nfRenderToday(); if(st) nfgMaybeGraduate(st).then(function(g){ if(g){ choState.facility.graduation=g; nfRenderToday(); } }); }); }
    }catch(e){ console.warn('[SC] staff programme',e); }
    return r; }; })();
// ── CHO More: population row under PHC & CHC ──
(function(){ if(typeof faMore!=='function') return; var oM=faMore;
  faMore=function(){ var r=oM.apply(this,arguments);
    try{ var a=document.getElementById('fa-acct'); if(!a||document.getElementById('nfg-pop-row')) return r; var f=faFac(), pop=nfgPopLine(f), hi=nfgHi(), row=document.getElementById('nfl-row');
      var html='<button type="button" class="nf-row" id="nfg-pop-row" onclick="nfgPopEdit(scSubAdminCode)"><i class="ti ti-users"></i><span>'+scEsc(hi?'सेवित जनसंख्या':'Population served')+' <span class="nfl-st '+(pop?'ok':'no')+'">'+(pop?(hi?'दर्ज':'Added'):(hi?'नहीं':'Not set'))+'</span><small style="display:block;color:var(--t3);font-size:11.5px;">'+scEsc(pop||(hi?'जोड़ने के लिए टैप करें':'Tap to add — population, villages, households'))+'</small></span><i class="ti ti-chevron-right nf-row-chev"></i></button>';
      if(row) row.insertAdjacentHTML('afterend',html); else a.insertAdjacentHTML('afterbegin',html); }catch(e){ console.warn('[SC] population row',e); }
    return r; }; })();
