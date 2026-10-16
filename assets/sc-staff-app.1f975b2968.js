
// ══════════════════════════════════════════════════════════════
// BUILD 4.3 — STAFF APP: Today · Cards · Progress · Me
//  • A bottom bar (with an orange "today's card" button) replaces the old tab bars for staff.
//  • Today = the home screen: greeting, readiness ring, "Continue today's card", to-do, team mission;
//    the live-session banner, staff cards to verify (CHO) and Supervisor actions stay below.
//  • Progress = rings (me · facility · baseline), on-time streak, verified, AoC bars, badges, missions.
//  • Me = profile, language, Facility dashboard (CHO), live sessions, help, certificate, log out.
//  • Gamification is tied to real progress: no XP. "On time" = card marked done on its own day.
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{'Today':'आज','Cards':'कार्ड','Progress':'प्रगति','Me':'मैं','Namaste':'नमस्ते','Continue today\'s card':'आज का कार्ड जारी रखें',
  'done':'पूरे','of':'में से','To do today':'आज के काम','Team mission':'टीम मिशन','Team missions':'टीम मिशन','My progress':'मेरी प्रगति','My readiness':'मेरी तैयारी',
  'Facility':'स्वास्थ्य केंद्र','Baseline':'बेसलाइन','since baseline':'बेसलाइन से','days on time in a row':'लगातार दिन समय पर','checkpoints verified':'चेकपॉइंट सत्यापित',
  'By Area of Concern':'चिंता क्षेत्र के अनुसार','Badges':'बैज','Language':'भाषा','Facility dashboard':'स्वास्थ्य केंद्र डैशबोर्ड','Staff cards to verify':'सत्यापन के लिए स्टाफ़ कार्ड',
  'Live sessions':'लाइव सत्र','Help':'सहायता','Refresh':'रीफ़्रेश','Log out':'लॉग आउट','Participation certificate':'भागीदारी प्रमाणपत्र',
  'Unlocks on Day 60':'दिन 60 पर उपलब्ध','Download certificate':'प्रमाणपत्र डाउनलोड करें','days to go':'दिन बाकी','Nothing to do today':'आज कोई काम नहीं',
  'Programme starts':'कार्यक्रम शुरू होगा','On time':'समय पर','Day':'दिन','Week':'सप्ताह','new badge':'नया बैज','All done for today':'आज के सभी काम पूरे',
  'Baseline audit':'बेसलाइन ऑडिट','Implementation':'क्रियान्वयन','Revision':'पुनरीक्षण','Mock assessment':'मॉक मूल्यांकन','Readiness week':'तैयारी सप्ताह'});

// ── on-time: remember when each card was marked done ───────────
(function(){
  var oDone=markDone;
  markDone=function(di){ var before=!!getCHOCard(di).taskDone; var r=oDone.apply(this,arguments);
    try{ var c=getCHOCard(di); if(!before&&c.taskDone&&!c.doneAt){ c.doneAt=scNowIso(); saveCHOState(); if(typeof scQueueSync==='function') scQueueSync(di); } }catch(e){}
    return r; };
  var oFrom=scCardFromRecord;
  scCardFromRecord=function(rec){ var c=oFrom.apply(this,arguments); if(rec&&rec.doneAt) c.doneAt=rec.doneAt; return c; };
  var oSync=scSyncProgress;
  scSyncProgress=async function(di){ var ok=await oSync.apply(this,arguments);
    if(ok){ var c=choState.cards[di]; if(c&&c.doneAt){ try{ await db.ref(scProgressPath(choState.facilityCode,choState.staffMobile,di)+'/doneAt').set(c.doneAt); }catch(e){} } }
    return ok; };
  var oLbl=scVerifierLabel;
  scVerifierLabel=function(role){ if(['CHO','MO'].indexOf(role)>=0) return 'Quality Champion'; return oLbl.apply(this,arguments); };
})();
function nfDayISO(di){ if(!choState.startDate) return ''; var p=choState.startDate.split('-'), d=new Date(+p[0],+p[1]-1,+p[2]+di); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nfLocalISO(ts){ var d=new Date(ts); if(isNaN(d)) return ''; return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nfOnTime(di,c){ c=c||getCHOCard(di); if(!c||!c.taskDone) return false; var when=c.doneAt||c.updatedAt; if(!when) return false; return nfLocalISO(when)<=nfDayISO(di); }
function nfOwn(di){ try{ return _scRenderAllOwnSafe(di); }catch(e){ return []; } }
function _scRenderAllOwnSafe(di){ var d=getDay(di); return (d&&d.cps||[]).map(function(cp,ci){ return ci; }).filter(function(ci){ return scMyCp(di,ci); }); }
// streak: consecutive working days (with own checkpoints) completed on their day, counting back from today
function nfStreaks(){
  var today=scb1TodayIdx(), cur=0, best=0, run=0, started=false;
  for(var di=0;di<=today;di++){ if(!nfOwn(di).length) continue; var c=getCHOCard(di);
    if(nfOnTime(di,c)){ run++; best=Math.max(best,run); } else if(di<today){ run=0; } }
  for(var k=today;k>=0;k--){ if(!nfOwn(k).length) continue; var cc=getCHOCard(k);
    if(k===today&&!cc.taskDone) continue;                // today still open: doesn't break the streak
    if(nfOnTime(k,cc)) cur++; else break; }
  return {current:cur,best:Math.max(best,cur)};
}
// ── facility data (for the facility ring, missions, NQAS badge) ─
var _nfFac={at:0,agg:null,progress:null,staff:null,code:''};
async function nfLoadFacility(force){
  var code=choState.facilityCode; if(!code) return null;
  if(!force&&_nfFac.code===code&&_nfFac.agg&&Date.now()-_nfFac.at<180000) return _nfFac;
  try{ var st=await fbGet(scFacilityPath(code)+'/staff')||{}, pr=await fbGet('sc_progress/'+code)||{};
    _nfFac={at:Date.now(),code:code,staff:st,progress:pr,agg:scFacilityReadiness(choState.progId,pr,st)}; }catch(e){}
  return _nfFac;
}
// ── badges ─────────────────────────────────────────────────────
var NF_BADGES=[
  {id:'baseline',icon:'ti-clipboard-check',c:'t',en:'Baseline done',hi:'बेसलाइन पूरी'},
  {id:'firstgap',icon:'ti-circle-check',c:'o',en:'First gap closed',hi:'पहली कमी दूर'},
  {id:'streak7',icon:'ti-flame',c:'o',en:'7 days on time',hi:'7 दिन समय पर'},
  {id:'streak14',icon:'ti-flame',c:'o',en:'14 days on time',hi:'14 दिन समय पर'},
  {id:'aoc70',icon:'ti-star',c:'q',en:'An AoC at 70%+',hi:'एक AoC 70%+'},
  {id:'gain20',icon:'ti-trending-up',c:'q',en:'+20 since baseline',hi:'बेसलाइन से +20'},
  {id:'ver10',icon:'ti-shield-check',c:'t',en:'10 verified',hi:'10 सत्यापित'},
  {id:'ver50',icon:'ti-shield-check',c:'t',en:'50 verified',hi:'50 सत्यापित'},
  {id:'actions',icon:'ti-checklist',c:'o',en:'All actions done',hi:'सभी कार्य पूरे'},
  {id:'standards',icon:'ti-target',c:'q',en:'All my Standards OK',hi:'मेरे सभी मानक ठीक'},
  {id:'revision',icon:'ti-refresh',c:'t',en:'Revision done',hi:'पुनरीक्षण पूरा'},
  {id:'nqas',icon:'ti-award',c:'q',en:'Facility NQAS-ready',hi:'स्वास्थ्य केंद्र NQAS-तैयार'}];
function nfBadgeState(R,fac){
  var st=nfStreaks(), today=scb1TodayIdx(), earned={};
  var daysDone=function(a,b){ for(var di=a;di<=b;di++){ if(nfOwn(di).length&&!getCHOCard(di).taskDone) return false; } return true; };
  if(today>=6&&daysDone(0,6)) earned.baseline=1;
  if((R.gaps||[]).some(function(g){ return g.closed; })) earned.firstgap=1;
  if(st.best>=7) earned.streak7=1; if(st.best>=14) earned.streak14=1;
  if(Object.keys(R.byAoc||{}).some(function(k){ var b=R.byAoc[k]; return b.assessed>=3&&b.pct>=70; })) earned.aoc70=1;
  if(R.baseline&&R.baseline.assessed&&R.pct-R.baseline.pct>=20) earned.gain20=1;
  var ver=0; Object.keys(choState.cards||{}).forEach(function(k){ var c=choState.cards[k]; if(c&&c.cpVerify) ver+=Object.keys(c.cpVerify).length; });
  if(ver>=10) earned.ver10=1; if(ver>=50) earned.ver50=1;
  var mine=Object.keys(_scAllActions||{}).map(function(k){ return _scAllActions[k]; }).filter(function(a){ return a&&(a.assignedTo===choState.staffMobile||a.ownerMob===choState.staffMobile)&&a.status!=='draft'; });
  if(mine.length&&mine.every(function(a){ return a.status==='closed'; })) earned.actions=1;
  var stds=Object.keys(R.byStd||{}).filter(function(s){ return R.byStd[s].assessed; });
  if(R.coverage&&R.coverage.pct>=90&&stds.length&&stds.every(function(s){ return R.byStd[s].pct>=scNqasStdMin(s); })) earned.standards=1;
  if(today>=55&&daysDone(49,55)) earned.revision=1;
  if(fac&&fac.agg&&fac.agg.nqas&&fac.agg.nqas.meets) earned.nqas=1;
  return {earned:earned,verified:ver,streak:st};
}
function nfCelebrate(earned){
  try{ var key='nf_badges_'+choState.facilityCode+'_'+choState.staffMobile, seen=JSON.parse(localStorage.getItem(key)||'null');
    var now=Object.keys(earned);
    if(seen){ var fresh=now.filter(function(id){ return seen.indexOf(id)<0; });
      if(fresh.length){ var b=NF_BADGES.find(function(x){ return x.id===fresh[0]; }); showToast('🏅 '+t('new badge')+': '+(_appLang==='hi'?b.hi:b.en),'ok'); try{ launchConfetti(); }catch(e){} } }
    localStorage.setItem(key,JSON.stringify(now)); }catch(e){}
}
// ── team missions (whole team, this week) ──────────────────────
function nfMissions(fac){
  var out=[], today=scb1TodayIdx(), progId=choState.progId; if(!fac||!fac.agg) return out;
  var A=fac.agg, P=fac.progress||{}, S=fac.staff||{};
  var weekStart=today<7?0:today<49?7+Math.floor((today-7)/7)*7:today<56?49:56, weekEnd=today<7?6:today<49?weekStart+6:today<56?55:59;
  var hi=_appLang==='hi';
  if(today<7){
    var bl=scBaselineStatus(progId,P,S); out.push({icon:'ti-clipboard-check',title:hi?'टीम के रूप में 7 दिन की बेसलाइन पूरी करें':'Finish the 7-day baseline as a team',done:bl.filter(function(x){ return x.complete; }).length,target:7,ends:7});
  } else if(today<49){
    var wi=Math.floor((today-7)/7), W=SC_IMPL_WEEKS[wi], ids=scPkgNqas(progId).filter(W.match).map(function(c){ return c.id; });
    var gaps=ids.filter(function(id){ var x=A.cps[id]; return x&&x.base!==null&&x.base<2; });
    var fixed=gaps.filter(function(id){ return A.cps[id].score===2; }).length, target=Math.min(5,gaps.length);
    out.push({icon:'ti-target',title:target?(hi?(target+' कमियाँ दूर करें — '+W.hi):('Close '+target+' gaps — '+W.title)):(hi?'इस सप्ताह के सभी चेकपॉइंट पूर्ण रखें':'Keep this week\'s checkpoints Full'),done:Math.min(fixed,target||1),target:target||1,ends:weekEnd+1});
  } else if(today<56){
    var rv=0; for(var d=49;d<=55;d++){ var need=Object.keys(S).filter(function(m){ return S[m]&&!S[m].disabled&&(scDayDef(progId,d).cps||[]).some(function(cp){ return scCpForRoleIn(cp,S[m].role||'CHO',scRolesFromRoster(S)); }); });
      if(need.length&&need.every(function(m){ return ((P[m]||{})['day_'+d]||{}).taskDone; })) rv++; }
    out.push({icon:'ti-refresh',title:hi?'सभी 7 पुनरीक्षण दिन दोबारा स्कोर करें':'Re-score all 7 revision days',done:rv,target:7,ends:56});
  } else {
    out.push({icon:'ti-award',title:hi?'स्वास्थ्य केंद्र को NQAS-तैयार बनाएँ (70%+, सभी मानक)':'Get the facility NQAS-ready (70%+, all Standards)',done:Math.min(A.pct,70),target:70,ends:60,pct:true});
  }
  // every card done on its day this week (team)
  var tot=0, ont=0;
  for(var dd=weekStart;dd<=Math.min(weekEnd,today);dd++){ Object.keys(S).forEach(function(m){ var s=S[m]; if(!s||s.disabled) return;
      if(!(scDayDef(progId,dd).cps||[]).some(function(cp){ return scCpForRoleIn(cp,s.role||'CHO',scRolesFromRoster(S)); })) return;
      var rec=(P[m]||{})['day_'+dd]; if(dd<today||(rec&&rec.taskDone)){ tot++; if(rec&&rec.taskDone){ var w=rec.doneAt||rec.updatedAt; if(w&&nfLocalISO(w)<=nfDayISO(dd)) ont++; } } }); }
  out.push({icon:'ti-calendar-check',title:hi?'इस सप्ताह हर कार्ड अपने दिन पर पूरा':'Every card done on its day this week',done:ont,target:Math.max(tot,1),ends:weekEnd+1});
  // this week's cards verified
  var dn=0, vf=0; for(var d2=weekStart;d2<=Math.min(weekEnd,today);d2++){ Object.keys(P).forEach(function(m){ var rec=(P[m]||{})['day_'+d2]; if(rec&&rec.taskDone){ dn++; if(rec.verified) vf++; } }); }
  if(dn) out.push({icon:'ti-shield-check',title:hi?'इस सप्ताह के कार्ड सत्यापित कराएँ':'Get this week\'s cards verified',done:vf,target:dn,ends:weekEnd+1});
  return out;
}
function nfMissionHTML(m){
  var pct=Math.round(Math.min(m.done,m.target)/m.target*100), ok=m.done>=m.target;
  return '<div class="nf-ms'+(ok?' ok':'')+'"><span class="nf-ms-i"><i class="ti '+(ok?'ti-circle-check':m.icon)+'"></i></span><div class="nf-ms-b"><b>'+scEsc(m.title)+'</b>'
    +'<div class="nf-bar"><i style="width:'+pct+'%"></i></div><small>'+(ok?'🎉 '+(_appLang==='hi'?'पूरा!':'Completed!'):(_appLang==='hi'?'दिन '+m.ends+' तक':'ends Day '+m.ends))+'</small></div>'
    +'<span class="nf-ms-n">'+(m.pct?m.done+'%':m.done+'/'+m.target)+'</span></div>';
}
// ── helpers ────────────────────────────────────────────────────
function nfPhase(di){ return di<7?t('Baseline audit'):di<49?t('Implementation'):di<56?t('Revision'):t('Readiness week'); }
function nfRing(pct,base,size,stroke,col,track){
  var r=(size-stroke)/2, c=2*Math.PI*r, a=Math.max(0,Math.min(100,pct))/100*c;
  var b=base!=null?'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="var(--org)" stroke-width="'+stroke+'" fill="none" stroke-dasharray="3 '+c+'" stroke-dashoffset="'+(-(base/100*c)+1.5)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>':'';
  return '<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+track+'" stroke-width="'+stroke+'" fill="none"/>'
    +'<circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" stroke="'+col+'" stroke-width="'+stroke+'" fill="none" stroke-linecap="round" stroke-dasharray="'+a+' '+c+'" transform="rotate(-90 '+size/2+' '+size/2+')"/>'+b+'</svg>';
}
function nfFirstName(){ return String(choState.staffName||'').split(' ')[0]||''; }
function nfIsStaff(){ return appMode==='cho'&&!!choState.facilityCode; }

// ── TODAY ──────────────────────────────────────────────────────
function nfRenderToday(){
  var ws=document.getElementById('welcome-screen'); if(!ws||!nfIsStaff()) return;
  var host=document.getElementById('nf-today'); if(!host){ host=document.createElement('div'); host.id='nf-today'; var hero=ws.querySelector('.ws-hero'); ws.insertBefore(host,hero?hero.nextSibling:ws.firstChild); }
  var pre=wsIsPre(), today=scb1TodayIdx(), R=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), B=R.baseline||{};
  var st=nfStreaks(), fac=_nfFac.code===choState.facilityCode?_nfFac:null, hi=_appLang==='hi';
  var focus=pre?[]:scMyCpIdx(today), c=getCHOCard(today), d=getDay(today);
  var answered=focus.filter(function(ci){ return scNormScore((c.cpScores||[])[ci])!==null; }).length;
  var theme=today<7?(hi?SC_BASELINE[today].hi:SC_BASELINE[today].title):today<49?(hi?SC_IMPL_WEEKS[Math.floor((today-7)/7)].hi:SC_IMPL_WEEKS[Math.floor((today-7)/7)].title):today<56?(hi?SC_BASELINE[today-49].hi:SC_BASELINE[today-49].title):(d.title||'');
  var wk=today<7?'':today<49?t('Week')+' '+(Math.floor((today-7)/7)+2)+' · ':'';
  var role=choState.roleId||'CHO', fname=(((choState.facility||{}).name||''));
  var html='<div class="nf-top"><div class="nf-top-l"><small>'+scEsc(fname)+nfProBadge(choState.facility)+' · '+scEsc(role)+'</small><h1>'+scEsc(t('Namaste'))+', '+scEsc(nfFirstName())+' <span aria-hidden="true">🙏</span></h1></div>'
    +'<button type="button" class="nf-streak" onclick="nfTab(\'progress\')" title="'+scEsc(t('days on time in a row'))+'"><i class="ti ti-flame"></i>'+st.current+'</button></div>';
  if(pre){
    var days=Math.max(0,Math.ceil((new Date(choState.startDate+'T00:00:00')-new Date())/86400000));
    html+='<div class="nf-hero"><div class="nf-hero-k">'+scEsc(t('Programme starts'))+' · '+scEsc(scFmtDate(choState.startDate))+'</div><div class="nf-hero-t">'+days+' '+scEsc(t('days to go'))+'</div><div class="nf-hero-s">'+scEsc(hi?'दिन 1 पर बेसलाइन ऑडिट शुरू होगा।':'Day 1 starts the 7-day baseline audit.')+'</div></div>';
  } else {
    var fp=fac&&fac.agg?fac.agg.pct:null, gain=B.assessed?R.pct-B.pct:null;
    html+='<div class="nf-hero"><div class="nf-hero-row"><div class="nf-hero-txt"><div class="nf-hero-k">'+scEsc(t('Day'))+' '+(today+1)+' / 60 · '+scEsc(nfPhase(today))+'</div>'
      +'<div class="nf-hero-t">'+scEsc(wk+theme)+'</div>'
      +'<div class="nf-hero-nums"><div><b>'+R.pct+'%</b><small>'+scEsc(t('My readiness'))+'</small></div>'+(gain!==null?'<i></i><div><b class="acc">'+(gain>=0?'+':'')+gain+'</b><small>'+scEsc(t('since baseline'))+'</small></div>':'')+'</div></div>'
      +'<div class="nf-hero-ring">'+nfRing(R.pct,B.assessed?B.pct:null,88,9,'#fff','rgba(255,255,255,.2)')+'<span><b>'+R.pct+'%</b>'+(fp!==null?'<small>'+scEsc(t('Facility'))+' '+fp+'%</small>':'')+'</span></div></div>'
      +'<button type="button" class="nf-cta" onclick="nfOpenToday()">'+(focus.length&&answered===focus.length||c.taskDone?'✓ '+scEsc(c.taskDone?t('All done for today'):t('Continue today\'s card')):scEsc(t('Continue today\'s card'))+(focus.length?' · '+answered+' '+scEsc(t('of'))+' '+focus.length+' '+scEsc(t('done')):''))+' <i class="ti ti-chevron-right"></i></button></div>';
    html+='<div class="nf-sec"><b>'+scEsc(t('To do today'))+'</b><span>'+scEsc(t('Day'))+' '+(today+1)+'</span></div><div class="nf-card nf-list">';
    if(!focus.length) html+='<div class="nf-empty">'+scEsc(c.taskDone?t('All done for today'):t('Nothing to do today'))+'</div>';
    focus.slice(0,5).forEach(function(ci){ var cp=d.cps[ci], s=scNormScore((c.cpScores||[])[ci]), n=(cp.items||[]).length;
      var cls=s===2?'f':s===1?'p':s===0?'n':'';
      html+='<button type="button" class="nf-task" onclick="nfOpenToday('+ci+')"><span class="nf-ti '+(cls||'w')+'"><i class="ti '+(s===null?'ti-clipboard-list':s===2?'ti-check':'ti-alert-triangle')+'"></i></span>'
        +'<span class="nf-tt"><b>'+scEsc(getCPText(cp))+'</b><small>'+scEsc(cp.id||'')+(n?' · '+n+' MoV':'')+(s!==null?' · '+scScoreLabel(s):'')+'</small></span><span class="nf-ck'+(s!==null?' on':'')+'">'+(s!==null?'<i class="ti ti-check"></i>':'')+'</span></button>'; });
    if(focus.length>5) html+='<button type="button" class="nf-more" onclick="nfOpenToday()">+'+(focus.length-5)+' '+(hi?'और':'more')+'</button>';
    html+='</div>';
    var ms=nfMissions(fac);
    if(ms.length) html+='<div class="nf-sec"><b>'+scEsc(t('Team mission'))+'</b><span onclick="nfTab(\'progress\')">'+ms.length+' '+(hi?'मिशन':'missions')+'</span></div><div class="nf-card nf-q">'+nfMissionHTML(ms[0])+'</div>';
    if(role==='CHO'&&_scDual) html+='<button type="button" class="nf-link-card" onclick="scb1ShowTab(\'dash\')"><i class="ti ti-building-hospital"></i><span>'+scEsc(t('Facility dashboard'))+'</span><i class="ti ti-chevron-right"></i></button>';
  }
  host.innerHTML=html;
}
function nfOpenToday(ci){
  var today=scb1TodayIdx();
  nfTab('cards');
  try{ selectDay(today+1); if(ci!=null){ var el=document.getElementById('cp-'+today+'-'+ci); if(el&&el.scrollIntoView) el.scrollIntoView({block:'center',behavior:'smooth'}); } }catch(e){}
}

// ── PROGRESS ───────────────────────────────────────────────────
function nfPage(id){ var p=document.getElementById(id); if(!p){ p=document.createElement('div'); p.id=id; p.className='nf-page'; p.style.display='none'; document.body.appendChild(p); } return p; }
async function nfRenderProgress(){
  var p=nfPage('nf-progress'); var draw=function(){
    var R=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), B=R.baseline||{}, fac=_nfFac.code===choState.facilityCode?_nfFac:null, hi=_appLang==='hi';
    var bs=nfBadgeState(R,fac), fp=fac&&fac.agg?fac.agg.pct:null;
    var h='<div class="nf-ph"><h1>'+scEsc(t('My progress'))+'</h1></div>'
      +'<div class="nf-card nf-rings"><div class="nf-rr">'+nfRing(R.pct,null,112,12,'var(--qi)','var(--qi-lt)')+'<div class="nf-rr-in">'+(fp!==null?nfRing(fp,null,76,9,'var(--teal)','var(--teal-lt)'):'')+'</div><b>'+R.pct+'%</b></div>'
      +'<div class="nf-rl"><div><i style="background:var(--qi)"></i>'+scEsc(t('My readiness'))+'<b>'+R.pct+'%</b></div>'
      +(fp!==null?'<div><i style="background:var(--teal)"></i>'+scEsc(t('Facility'))+'<b>'+fp+'%</b></div>':'')
      +'<div class="mut"><i style="background:#D5DDDB"></i>'+scEsc(t('Baseline'))+'<b>'+(B.assessed?B.pct+'%':'—')+'</b></div>'
      +(B.assessed?'<span class="nf-gain'+(R.pct-B.pct<0?' neg':'')+'"><i class="ti ti-trending-up"></i> '+(R.pct-B.pct>=0?'+':'')+(R.pct-B.pct)+' '+scEsc(t('since baseline'))+'</span>':'')+'</div></div>'
      +'<div class="nf-two"><div class="nf-card"><div class="nf-big"><i class="ti ti-flame" style="color:var(--org)"></i>'+bs.streak.current+'</div><small>'+scEsc(t('days on time in a row'))+'</small></div>'
      +'<div class="nf-card"><div class="nf-big"><i class="ti ti-shield-check" style="color:var(--green-dk)"></i>'+bs.verified+'</div><small>'+scEsc(t('checkpoints verified'))+'</small></div></div>'
      +'<div class="nf-sec"><b>'+scEsc(t('By Area of Concern'))+'</b><span>'+Object.keys(R.byAoc).length+'</span></div><div class="nf-card nf-aoc">'
      +Object.keys(SC_CPM_AOC).filter(function(k){ return R.byAoc[k]&&R.byAoc[k].n; }).map(function(k){ var b=R.byAoc[k];
        return '<div><span>'+k+' · '+scEsc(SC_CPM_AOC[k])+'</span><div class="nf-bar"><i style="width:'+b.pct+'%;background:'+scPctColor(b.pct)+'"></i></div><b>'+b.pct+'%</b></div>'; }).join('')+'</div>'
      +'<div class="nf-sec"><b>'+scEsc(t('Badges'))+'</b><span>'+Object.keys(bs.earned).length+' / '+NF_BADGES.length+'</span></div><div class="nf-badges">'
      +NF_BADGES.map(function(b){ var on=!!bs.earned[b.id]; return '<div class="nf-bd'+(on?' '+b.c:' lock')+'"><span><i class="ti '+(on?b.icon:'ti-lock')+'"></i></span>'+scEsc(hi?b.hi:b.en)+'</div>'; }).join('')+'</div>';
    var ms=nfMissions(fac);
    if(ms.length) h+='<div class="nf-sec"><b>'+scEsc(t('Team missions'))+'</b><span>'+ms.filter(function(m){ return m.done>=m.target; }).length+' / '+ms.length+'</span></div><div class="nf-card nf-q">'+ms.map(nfMissionHTML).join('')+'</div>';
    p.innerHTML=h; nfCelebrate(bs.earned);
  };
  draw(); await nfLoadFacility(); if(p.style.display!=='none') draw();
}

// ── ME ─────────────────────────────────────────────────────────
function nfRenderMe(){
  var p=nfPage('nf-me'), today=scb1TodayIdx(), st=nfStreaks(), hi=_appLang==='hi', role=choState.roleId||'CHO';
  var fname=((choState.facility||{}).name||''), cert=today>=59;
  var row=function(icon,label,onclick,right,cls){ return '<button type="button" class="nf-row'+(cls?' '+cls:'')+'" onclick="'+onclick+'"><i class="ti '+icon+'"></i><span>'+scEsc(label)+'</span>'+(right||'<i class="ti ti-chevron-right nf-row-chev"></i>')+'</button>'; };
  p.innerHTML='<div class="nf-ph"><h1>'+scEsc(t('Me'))+'</h1></div>'
    +'<div class="nf-card nf-prof"><div class="nf-av">'+scEsc((choState.staffName||'?').charAt(0).toUpperCase())+'</div><b>'+scEsc(choState.staffName||'')+'</b>'
    +'<small>'+scEsc(role)+' · '+scEsc(fname)+' · '+scEsc(scPkgCode(choState.progId))+'</small><div class="nf-chips">'+nfProBadge(choState.facility,'lg')+'<span class="t">'+scEsc(t('Day'))+' '+(today+1)+' / 60</span><span class="o">🔥 '+st.current+' '+scEsc(t('On time'))+'</span></div></div>'
    +'<div class="nf-cert'+(cert?' on':'')+'"><span><i class="ti ti-certificate"></i></span><div><b>'+scEsc(t('Participation certificate'))+'</b><small>'+(cert?scEsc(hi?'आपका प्रमाणपत्र तैयार है':'Your certificate is ready'):scEsc(t('Unlocks on Day 60'))+' · '+(59-today)+' '+scEsc(t('days to go')))+'</small>'
    +(cert?'<button type="button" onclick="nfCertificate()">'+scEsc(t('Download certificate'))+'</button>':'<div class="nf-bar lt"><i style="width:'+Math.round((today+1)/60*100)+'%"></i></div>')+'</div></div>'
    +'<div class="nf-card nf-rows">'
    +'<div class="nf-row"><i class="ti ti-language"></i><span>'+scEsc(t('Language'))+'</span><span class="nf-lang"><button type="button" class="'+(hi?'':'on')+'" onclick="setLang(\'en\')">EN</button><button type="button" class="'+(hi?'on':'')+'" onclick="setLang(\'hi\')">हिं</button></span></div>'
    +(role==='CHO'&&_scDual?row('ti-building-hospital',t('Facility dashboard'),"scb1ShowTab('dash')"):'')
    +(scIsVerifier()?row('ti-shield-check',t('Staff cards to verify'),'scOpenVerifyQueue()'):'')
    +row('ti-broadcast',t('Live sessions'),'scOpenLiveSessions()')
    +row('ti-refresh',t('Refresh'),'scStaffRefresh(this)')
    +row('ti-help-circle',t('Help'),'nfHelp()')
    +row('ti-logout',t('Log out'),'logoutCHO()','','danger')
    +'</div><div class="nf-byline">NQAS<i>|</i>FAST · by <img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div>';
}
function nfHelp(){ scAlert(_appLang==='hi'
  ?'आज: आज का कार्ड खोलें और हर MoV बात पर "पूरा" या "पूरा नहीं" चुनें, फिर कार्ड पूरा करें।\nकार्ड: सप्ताह के दिन चुनें; समयरेखा में पूरा कार्यक्रम देखें।\nप्रगति: आपकी तैयारी, बैज और टीम मिशन।\nसमस्या हो तो अपने CHO या HealSol Academy से संपर्क करें।'
  :'Today: open today\'s card and answer each MoV item Met or Not met, then mark the card done.\nCards: pick any day of the week; Timeline shows the whole programme.\nProgress: your readiness, badges and team missions.\nNeed help? Ask your CHO or HealSol Academy.', t('Help'),'❓'); }
function nfCertificate(){
  var R=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), B=R.baseline||{}, fname=((choState.facility||{}).name||'');
  var html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Certificate — '+scEsc(choState.staffName||'')+'</title><style>'
    +'@page{size:A4 landscape;margin:0}body{margin:0;font-family:Georgia,serif;color:#13201F}.c{width:297mm;height:210mm;box-sizing:border-box;padding:18mm;position:relative;background:#fff}'
    +'.b{position:absolute;inset:9mm;border:3px solid #135A55;border-radius:10px}.b2{position:absolute;inset:12mm;border:1px solid #E9963A;border-radius:8px}'
    +'.top{display:flex;justify-content:space-between;align-items:center;position:relative}.top img{height:16mm}'
    +'h1{font-size:30pt;color:#135A55;text-align:center;margin:14mm 0 4mm;letter-spacing:1px}.s{text-align:center;font-size:12pt;color:#6B7A78}'
    +'.n{text-align:center;font-size:28pt;margin:8mm 0 2mm;color:#13201F}.d{text-align:center;font-size:12.5pt;line-height:1.6;max-width:210mm;margin:4mm auto}'
    +'.f{position:absolute;bottom:22mm;left:24mm;right:24mm;display:flex;justify-content:space-between;font-size:10pt;color:#6B7A78}'
    +'.pro{display:inline-flex;vertical-align:middle;margin-left:6px;border:1.5px solid #135A55;border-radius:6px;overflow:hidden;font:700 9pt/1 Arial,sans-serif;letter-spacing:.06em;-webkit-print-color-adjust:exact;print-color-adjust:exact}.pro i{font-style:normal;background:#135A55;color:#fff;padding:3px 7px}.pro b{background:#E6F2F0;color:#135A55;padding:3px 7px;letter-spacing:0}</style></head><body><div class="c"><div class="b"></div><div class="b2"></div>'
    +'<div class="top"><img src="'+SC_BRAND.logoNqas+'"><img src="'+SC_BRAND.logoHealsol+'"></div>'
    +'<h1>Certificate of Participation</h1><div class="s">NQAS | FAST · 60-day NQAS readiness programme'+(nfProTier(choState.facility)?' <span class="pro"><i>PRO</i><b>'+nfProTier(choState.facility)+'</b></span>':'')+'</div>'
    +'<div class="n">'+scEsc(choState.staffName||'')+'</div>'
    +'<div class="d">'+scEsc(choState.roleId||'CHO')+', '+scEsc(fname)+' — for completing the 60-day NQAS | FAST programme'
    +(B.assessed?', improving readiness from '+B.pct+'% at baseline to '+R.pct+'%':'')+'.</div>'
    +'<div class="f"><span>Programme: '+scEsc(scFmtDate(choState.startDate))+' – '+scEsc(scFmtDate(nfDayISO(59)))+'</span><span>Issued '+scEsc(scFmtDate(scTodayStr()))+' · HealSol Academy</span></div></div>'
    +'<script>setTimeout(function(){window.print();},400)<\/script></body></html>';
  var w=window.open('','_blank'); if(!w){ showToast('Allow pop-ups to download the certificate.','err'); return; }
  w.document.write(html); w.document.close();
}

// ── NAVIGATION ─────────────────────────────────────────────────
var _nfTab='today';
function nfEnsureNav(){
  var n=document.getElementById('nf-nav'); if(n) return n;
  n=document.createElement('nav'); n.id='nf-nav'; n.setAttribute('aria-label','Main');
  n.innerHTML=[['today','ti-home','Today'],['cards','ti-cards','Cards'],null,['progress','ti-chart-bar','Progress'],['me','ti-user','Me']].map(function(x){
    if(!x) return '<span class="nf-gap"></span>';
    return '<button type="button" data-tab="'+x[0]+'" onclick="nfTab(\''+x[0]+'\')"><i class="ti '+x[1]+'"></i><span data-i18n="'+x[2]+'">'+x[2]+'</span></button>'; }).join('')
    +'<button type="button" class="nf-fab" onclick="nfOpenToday()" aria-label="Today\'s card"><i class="ti ti-player-play"></i></button>';
  document.body.appendChild(n); return n;
}
function nfSync(){
  var on=nfIsStaff()&&(document.getElementById('cho-app').classList.contains('vis')||document.getElementById('welcome-screen').classList.contains('vis'));
  var nav=nfEnsureNav(); nav.style.display=on?'':'none'; document.body.classList.toggle('nf-staff',on);
  if(!on){ ['nf-progress','nf-me'].forEach(function(id){ var p=document.getElementById(id); if(p) p.style.display='none'; }); return; }
  nav.querySelectorAll('button[data-tab]').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-tab')===_nfTab); });
  nav.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent=t(el.getAttribute('data-i18n')); });
}
function nfTab(tab){
  if(!nfIsStaff()) return;
  var ws=document.getElementById('welcome-screen'), app=document.getElementById('cho-app');
  ['nf-progress','nf-me'].forEach(function(id){ var p=document.getElementById(id); if(p) p.style.display='none'; });
  if(tab==='today'){
    var nav=document.getElementById('cho-nav'), main=document.getElementById('cho-main'); if(nav) nav.style.display='none'; if(main) main.style.display='none';
    _nfTab='today'; showWelcomeScreen();
  } else if(tab==='cards'){
    if(wsIsPre()){ showToast(t('Programme starts')+' · '+scFmtDate(choState.startDate),''); _nfTab='today'; nfSync(); return; }
    _nfTab='cards'; if(ws.classList.contains('vis')) wsEnterApp(); else showCHOMain();
    if(choState.view==='board') switchView('cards');
  } else {
    _nfTab=tab; var p=nfPage('nf-'+tab); p.style.display='';
    if(tab==='progress') nfRenderProgress(); else nfRenderMe();
    try{ p.scrollTop=0; }catch(e){}
  }
  nfSync(); try{ window.scrollTo(0,0); }catch(e){}
}
// Cards: slim header (title, week, day) above the Day/Timeline switch
function nfCardsHead(){
  var nav=document.getElementById('cho-nav'); if(!nav) return;
  var h=document.getElementById('nf-cards-head'); if(!h){ h=document.createElement('div'); h.id='nf-cards-head'; nav.insertBefore(h,nav.firstChild); }
  var today=scb1TodayIdx(), wk=today<7?t('Baseline audit'):today<49?t('Week')+' '+(Math.floor((today-7)/7)+2):today<56?t('Revision'):t('Readiness week');
  h.innerHTML='<h1>'+scEsc(t('Cards'))+'</h1><span class="nf-chip"><i class="ti ti-calendar"></i>'+scEsc(wk)+'</span><span class="nf-chip o">'+scEsc(t('Day'))+' '+(today+1)+' / 60</span>';
}
(function(){
  var oWel=showWelcomeScreen; showWelcomeScreen=function(){ var r=oWel.apply(this,arguments); try{ if(nfIsStaff()){ _nfTab='today'; nfRenderToday(); nfLoadFacility().then(function(){ if(_nfTab==='today') nfRenderToday(); }); } nfSync(); }catch(e){ console.warn(e); } return r; };
  var oMain=showCHOMain; showCHOMain=function(){ var r=oMain.apply(this,arguments); try{ if(nfIsStaff()){ _nfTab='cards'; nfCardsHead(); } nfSync(); }catch(e){ console.warn(e); } return r; };
  var oLogout=logoutCHO; logoutCHO=function(){ var r=oLogout.apply(this,arguments); setTimeout(nfSync,0); return r; };
  var oTab=scb1ShowTab; scb1ShowTab=async function(){ var r=await oTab.apply(this,arguments); nfSync(); return r; };
  var oLang=setLang; setLang=function(){ var r=oLang.apply(this,arguments); try{ if(nfIsStaff()){ if(_nfTab==='today'&&document.getElementById('welcome-screen').classList.contains('vis')) nfRenderToday(); if(_nfTab==='progress') nfRenderProgress(); if(_nfTab==='me') nfRenderMe(); if(_nfTab==='cards') nfCardsHead(); } nfSync(); }catch(e){} return r; };
  // day card: no XP, no "Full / Half / Zero", streak = on time
  var oCard=renderCard; renderCard=function(di){ var r=oCard.apply(this,arguments);
    try{ var cont=document.getElementById('card-container'); if(!cont) return r;
      cont.querySelectorAll('.xp-pill').forEach(function(x){ x.remove(); });
      cont.querySelectorAll('.tag.cp-t').forEach(function(x){ x.innerHTML=x.innerHTML.replace(/\s·\s\d+\/\d+ XP/,''); });
      cont.querySelectorAll('.sec span').forEach(function(x){ if(/Full|Half|Zero|पूर्ण|आंशिक/.test(x.textContent)) x.textContent='— '+(_appLang==='hi'?'मार्गदर्शन के लिए ⓘ दबाएँ':'tap ⓘ for guidance'); });
      // fold the day's reference info (micro-task, AoC, methods) into "About this day" for staff
      if(document.body.classList.contains('nf-staff')){ var body=cont.querySelector('.cbody');
        if(body&&!body.querySelector('.nf-about')){ var kids=[].slice.call(body.children), first=kids.findIndex(function(k){ return k.classList.contains('sec'); });
          var cpHead=kids.findIndex(function(k,i){ return i>first&&k.classList.contains('sec')&&/ⓘ/.test(k.textContent); });
          if(first>=0&&cpHead>first){ var det=document.createElement('details'); det.className='nf-about';
            det.innerHTML='<summary><i class="ti ti-info-circle"></i> '+(_appLang==='hi'?'इस दिन के बारे में':'About this day')+'</summary>';
            body.insertBefore(det,kids[first]); kids.slice(first,cpHead).forEach(function(k){ if(k.tagName!=='HR') det.appendChild(k); else k.remove(); }); } } }
      var sa=cont.querySelector('.streak-area'); if(sa) sa.innerHTML='<i class="ti ti-flame" style="font-size:18px;color:var(--org)"></i><span class="streak-lbl">'+scEsc(t('On time'))+'</span><span class="streak-num">'+nfStreaks().current+'</span>';
    }catch(e){} return r; };
})();
