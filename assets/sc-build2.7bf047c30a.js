
// ══════════════════════════════════════════════════════════════
// BUILD 2 — date rule
// ══════════════════════════════════════════════════════════════
var SC_TL_ROLES=['CHO','ANM','ASHA','MPW','MO'];
var _scb2Open={};              // week index → expanded in the Timeline view
var _scb2Model=null;           // last computed model (for sheets)

Object.assign(HINDI_UI,{
  'Timeline':'टाइमलाइन','60-day timeline':'60 दिन की टाइमलाइन','Facility view':'स्वास्थ्य केंद्र दृश्य','Your days are highlighted':'आपके दिन हाइलाइट हैं',
  'Upcoming':'आगामी','Today':'आज','Done · awaiting verification':'पूर्ण · सत्यापन बाकी','Awaiting verification':'सत्यापन बाकी','Verified':'सत्यापित',
  'Overdue':'बकाया','Sent back':'वापस भेजा गया','None for you':'आपके लिए कुछ नहीं','Locked (trial)':'लॉक (ट्रायल)','Not registered':'पंजीकृत नहीं',
  'Week':'सप्ताह','Days':'दिन','gaps':'कमियाँ','gap':'कमी','Session':'सत्र','Open card':'कार्ड खोलें','What to keep ready':'क्या तैयार रखें',
  'Records & registers':'रिकॉर्ड और रजिस्टर','Items & equipment':'सामान और उपकरण','Displays & signage':'डिस्प्ले और साइनबोर्ड','People to arrange':'किन्हें तैयार रखें',
  'Checkpoints':'चेकपॉइंट','Scoring opens on':'स्कोरिंग शुरू होगी','Scoring is open — open the card to score.':'स्कोरिंग खुली है — स्कोर करने के लिए कार्ड खोलें।',
  'Programme has not started yet. Scoring opens on':'कार्यक्रम अभी शुरू नहीं हुआ। स्कोरिंग शुरू होगी',
  'This day is part of the full programme. Subscribe to unlock it.':'यह दिन पूरे कार्यक्रम का हिस्सा है। खोलने के लिए सदस्यता लें।',
  'Start date not set':'प्रारंभ तिथि तय नहीं','Staff on this day':'इस दिन का स्टाफ','Close':'बंद करें','Open timeline':'टाइमलाइन खोलें',
  'Your 60-day timeline':'आपकी 60 दिन की टाइमलाइन','Facility 60-day timeline':'स्वास्थ्य केंद्र की 60 दिन की टाइमलाइन','Loading staff progress…':'स्टाफ प्रगति लोड हो रही है…',
  'more for other staff':'अन्य स्टाफ के लिए','checkpoint':'चेकपॉइंट','Prep list':'तैयारी सूची','for you':'आपके लिए','checkpoints':'चेकपॉइंट'
});
function scb2L(k){ return t(k); }
function scb2Cps(n){ return n+' '+scEsc(scb2L(n===1?'checkpoint':'checkpoints')); }

function scb2Pre(){ try{ return wsIsPre(); }catch(e){ return false; } }
// Keep "today" correct: recomputed from the start date (also after midnight)
function scb2SyncToday(){
  if(!choState||!choState.startDate) return;
  var p=getProg(choState.progId);
  choState.currentDay=computeCurrentDay(choState.startDate,p.days);
}
function scb2TodayIdx(){ scb2SyncToday(); return scb2Pre()?-1:(choState.currentDay||1)-1; }
// The one rule: a day can be opened/scored when the programme has started, the day has
// arrived, and the subscription allows it (7-day trial rule in phcCheckAccess).
function scDayUnlocked(di){
  if(scb2Pre()) return false;
  scb2SyncToday();
  if(di<0||(di+1)>(choState.currentDay||1)) return false;
  try{ return phcCheckAccess(di,getDay(di)); }catch(e){ return true; }
}
function scb2DayShort(di){
  if(!choState.startDate) return '';
  var p=choState.startDate.split('-'); var d=new Date(+p[0],+p[1]-1,+p[2]+di);
  return d.toLocaleDateString('en-IN',{day:'numeric',month:'short'});
}
function scb2DayLong(di){ return (typeof scb1DayDate==='function')?scb1DayDate(di):scb2DayShort(di); }
function scb2DateToDi(dt){
  if(!choState.startDate) return -1;
  var p=choState.startDate.split('-'); var st=new Date(+p[0],+p[1]-1,+p[2]);
  var d=new Date(dt.getFullYear(),dt.getMonth(),dt.getDate());
  return Math.round((d-st)/86400000);
}

// ══════════════════════════════════════════════════════════════
// MARKERS — Live Sessions now; Build 3 pushes review sessions here
// provider() → [{di, kind, icon, label, at}]
// ══════════════════════════════════════════════════════════════
var SC_TIMELINE_MARKERS=[];
SC_TIMELINE_MARKERS.push(function(){
  var out=[], aud=(typeof scLiveAudience==='function')?scLiveAudience():null;
  Object.keys(_scLive||{}).forEach(function(id){
    var s=_scLive[id]; if(!s||!scLiveVisible(s,aud)) return;
    var ts=Date.parse(s.startAt||''); if(isNaN(ts)) return;
    out.push({di:scb2DateToDi(new Date(ts)),kind:'live',icon:'ti-broadcast',label:s.title||'Live session',at:s.startAt});
  });
  return out;
});
function scb2Markers(){
  var out={};
  SC_TIMELINE_MARKERS.forEach(function(fn){
    try{ (fn()||[]).forEach(function(m){ if(m&&m.di>=0){ (out[m.di]=out[m.di]||[]).push(m); } }); }catch(e){ console.warn('[SC] marker provider',e); }
  });
  return out;
}

// ══════════════════════════════════════════════════════════════
// MODEL — status of every day
// ══════════════════════════════════════════════════════════════
var SC_ST_RANK={none:0,verified:2,awaiting:3,today:4,overdue:5,sentback:6};
var SC_ST_LABEL={upcoming:'Upcoming',today:'Today',awaiting:'Done · awaiting verification',verified:'Verified',overdue:'Overdue',
  sentback:'Sent back',none:'None for you',trial:'Locked (trial)',unreg:'Not registered'};
var SC_ST_ICON={upcoming:'ti-calendar',today:'ti-player-play',awaiting:'ti-clock',verified:'ti-shield-check',overdue:'ti-alert-triangle',
  sentback:'ti-arrow-back-up',none:'ti-minus',trial:'ti-lock',unreg:'ti-user-question'};
function scb2RoleCount(d,role){ return (d&&d.cps||[]).filter(function(cp){ return scCpForRole(cp,role); }).length; }
function scb2OpenGaps(c,di,role){
  if(!c||!c.taskDone) return 0;
  var d=getDay(di), n=0;
  (d&&d.cps||[]).forEach(function(cp,ci){
    if(!scCpForRole(cp,role)) return;
    var s=scNormScore((c.cpScores||[])[ci]);
    if(s===0||s===1) n++;
  });
  return n;
}
// Status of one person's card on a day that has already opened
function scb2CardStatus(c,di,todayIdx){
  if(c&&c.verified) return 'verified';
  if(c&&c.taskDone) return 'awaiting';
  if(c&&c.sentBackAt) return 'sentback';
  return di===todayIdx?'today':'overdue';
}
function scb2IsFacilityView(){ return appMode==='cho'&&scb1Role()==='CHO'; }
// CHO facility view: everyone on the roster (the CHO's own cards come from this device)
function scb2People(){
  var me=choState.staffMobile, out=[{mob:me,name:choState.staffName||me,role:'CHO',self:true}];
  var roster=(_scVQ&&_scVQ.roster)||null;
  if(roster) Object.keys(roster).forEach(function(mob){
    if(mob===me) return; var r=roster[mob]||{};
    out.push({mob:mob,name:r.name||mob,role:r.role||'CHO',self:false});
  });
  return out;
}
function scb2PersonCard(p,di){
  if(p.self) return choState.cards[di]||null;
  var rec=((_scVQ&&_scVQ.progress)||{})[p.mob]; rec=rec&&rec['day_'+di];
  if(!rec) return null;
  return scCardFromRecord(rec,((getDay(di)||{}).cps||[]).length);
}
function scb2BuildModel(){
  scb2SyncToday();
  var arr=getDaysArr(choState.progId), fac=scb2IsFacilityView(), role=scb1Role();
  var todayIdx=scb2TodayIdx(), pre=scb2Pre(), markers=scb2Markers();
  var people=fac?scb2People():null, rosterLoaded=!fac||!!(_scVQ&&_scVQ.roster);
  var days=arr.map(function(_,di){
    var d=getDay(di);
    var m={di:di,day:d.day,title:d.title,service:d.service,isBoss:!!d.isBoss,isToday:di===todayIdx,
      date:scb2DayShort(di),total:(d.cps||[]).length,mine:scb2RoleCount(d,role),roles:[],people:[],
      gaps:0,markers:markers[di]||[],status:'upcoming'};
    var open=!pre&&di<=todayIdx, trial=!phcCheckAccess(di,d);
    SC_TL_ROLES.forEach(function(r){ var n=scb2RoleCount(d,r); if(n) m.roles.push({role:r,n:n,status:open?'none':(trial?'trial':'upcoming'),staff:0}); });
    if(trial){ m.status='trial'; m.roles.forEach(function(r){ r.status='trial'; }); return m; }
    if(!open){ m.status=fac||m.mine?'upcoming':'none'; return m; }
    if(fac){
      var worst='none';
      m.roles.forEach(function(r){
        var rw='none';
        people.forEach(function(p){
          if(p.role!==r.role) return;
          var c=scb2PersonCard(p,di), st=scb2CardStatus(c,di,todayIdx), g=scb2OpenGaps(c,di,p.role);
          r.staff++; m.gaps+=g;
          m.people.push({name:p.name,role:p.role,self:p.self,status:st,gaps:g,n:r.n});
          if(SC_ST_RANK[st]>SC_ST_RANK[rw]) rw=st;
        });
        r.status=r.staff?rw:(rosterLoaded?'unreg':'none');
        if(SC_ST_RANK[r.status]>SC_ST_RANK[worst]) worst=r.status;
      });
      m.status=worst;
    }else{
      if(!m.mine){ m.status='none'; return m; }
      var c=choState.cards[di]||null;
      m.status=scb2CardStatus(c,di,todayIdx); m.gaps=scb2OpenGaps(c,di,role);
    }
    return m;
  });
  var sum={}; days.forEach(function(x){ sum[x.status]=(sum[x.status]||0)+1; if(x.gaps) sum.gapDays=(sum.gapDays||0)+1; });
  _scb2Model={days:days,fac:fac,todayIdx:todayIdx,pre:pre,sum:sum,rosterLoaded:rosterLoaded};
  return _scb2Model;
}

// ══════════════════════════════════════════════════════════════
// DAY STRIP (Daily Cards) — replaces buildDaySelector
// ══════════════════════════════════════════════════════════════
function scb2Wd(di){ try{ var iso=nfDayISO(di); if(!iso) return ''; var w=new Date(iso+'T00:00:00').getDay(); return (_appLang==='hi'?['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि']:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[w]; }catch(e){ return ''; } }
buildDaySelector=function(){
  var scroll=document.getElementById('ds-scroll'); if(!scroll) return;
  var M=scb2BuildModel(); scroll.innerHTML='';
  var sel=(typeof window._scLastDi==='number')?window._scLastDi:M.todayIdx;
  M.days.forEach(function(m){
    var div=document.createElement('div');
    var cls='ds-day scb2-d scb2-st-'+m.status+(m.isBoss?' boss-day':'');
    if(m.isToday) cls+=' active today-ring'; else if(m.di===sel) cls+=' scb2-sel';
    if(!M.fac&&!m.mine) cls+=' scx-no-cps';
    div.className=cls;
    var mid=m.date||('AoC '+(m.isBoss?'★':''));
    var low=m.status==='trial'?'<i class="ti ti-lock"></i>':(!M.fac?(m.mine?'<i class="ti ti-user"></i>'+m.mine:'—'):'');
    div.innerHTML=(m.markers.length?'<i class="ti ti-broadcast scb2-mk"></i>':'')+(m.gaps?'<span class="scb2-dot"></span>':'')
      +'<div class="dd-w">'+scEsc(scb2Wd(m.di))+'</div><div class="dd-n">'+String(m.day).padStart(2,'0')+'</div><div class="dd-z">'+scEsc(mid)+'</div>'
      +(low?'<div class="scb2-dm">'+low+'</div>':'');
    div.title='Day '+m.day+': '+m.title+' · '+scb2L(SC_ST_LABEL[m.status]||m.status)+(M.fac?'':' · '+(m.mine?m.mine+' checkpoints for you':'No checkpoints for your role'));
    div.onclick=function(){ scb2DayTap(m.di,'strip'); };
    scroll.appendChild(div);
  });
};

// ══════════════════════════════════════════════════════════════
// TIMELINE VIEW
// ══════════════════════════════════════════════════════════════
function scb2EnsureTimelineView(){
  var main=document.getElementById('cho-main'); if(!main) return null;
  var v=document.getElementById('view-timeline');
  if(!v){ v=document.createElement('div'); v.id='view-timeline'; v.style.display='none'; main.appendChild(v); }
  var tabs=document.querySelector('#cho-nav .cho-nav-tabs');
  if(tabs&&!document.getElementById('bnav-timeline')){
    var b=document.createElement('button'); b.className='cho-tab'; b.id='bnav-timeline';
    b.setAttribute('onclick',"switchView('timeline')");
    b.innerHTML='<i class="ti ti-timeline"></i><span data-i18n="Timeline">'+scEsc(scb2L('Timeline'))+'</span>';
    var board=document.getElementById('bnav-board'); tabs.insertBefore(b,board||null);
  }
  return v;
}
function scb2Pill(st,extra){ return '<span class="scb2-pill scb2-st-'+st+'"><i class="ti '+SC_ST_ICON[st]+'"></i> '+scEsc(scb2L(SC_ST_LABEL[st]))+(extra!=null?' · '+extra:'')+'</span>'; }
function scb2RenderTimeline(){
  var v=scb2EnsureTimelineView(); if(!v) return;
  var M=scb2BuildModel(), prog=getProg(choState.progId), n=M.days.length;
  var dayTxt=M.pre?(scb2L('Programme has not started yet. Scoring opens on')+' '+formatDate(choState.startDate))
    :(!choState.startDate?scb2L('Start date not set'):('Day '+(M.todayIdx+1)+' / '+n));
  var sumOrder=M.fac?['verified','awaiting','today','overdue','sentback']:['verified','awaiting','today','overdue','sentback','none'];
  var h='<div class="scb2-tl"><div class="scb2-hd">'
    +'<div class="scb2-title"><i class="ti ti-timeline"></i> '+scEsc(scb2L('60-day timeline'))+'</div>'
    +'<div class="scb2-sub">'+scEsc(prog.name)+' · '+scEsc(dayTxt)+' · '+scEsc(M.fac?scb2L('Facility view'):scb2L('Your days are highlighted'))+'</div>'
    +'<div class="scb2-sum">'+sumOrder.filter(function(k){ return M.sum[k]; }).map(function(k){ return scb2Pill(k,M.sum[k]); }).join('')
    +(M.sum.gapDays?'<span class="scb2-pill" style="--sc:var(--org-dk);--sb:var(--org-lt);"><i class="ti ti-alert-circle"></i> '+scEsc(scb2L('gaps'))+' · '+M.sum.gapDays+'</span>':'')+'</div>'
    +'<div class="scb2-legend">'+['upcoming','today','awaiting','verified','overdue','sentback'].concat(M.fac?[]:['none']).map(function(k){ return scb2Pill(k); }).join('')
    +'<span class="scb2-pill" style="--sc:#2563EB;--sb:#EFF6FF;"><i class="ti ti-broadcast"></i> '+scEsc(scb2L('Session'))+'</span></div>'
    +(M.fac&&!M.rosterLoaded?'<div class="scb2-note"><i class="ti ti-loader"></i> '+scEsc(scb2L('Loading staff progress…'))+'</div>':'')
    +'</div>';
  var todayWk=M.todayIdx>=0?Math.floor(M.todayIdx/7):0;
  if(_scb2Open[todayWk]===undefined) _scb2Open[todayWk]=true;
  for(var w=0;w*7<n;w++){
    var wd=M.days.slice(w*7,w*7+7), a=wd[0], z=wd[wd.length-1];
    h+='<div class="scb2-wk'+(_scb2Open[w]?' open':'')+'" id="scb2-wk-'+w+'">'
      +'<button type="button" class="scb2-wk-hd" onclick="scb2ToggleWeek('+w+')">'
      +'<div class="scb2-wk-t"><div class="scb2-wk-n">'+scEsc(scb2L('Week'))+' '+(w+1)+'</div>'
      +'<div class="scb2-wk-d">'+scEsc(scb2L('Days'))+' '+a.day+'–'+z.day+(a.date?' · '+scEsc(a.date)+' – '+scEsc(z.date):'')+'</div></div>'
      +'<div class="scb2-sq">'+wd.map(function(m){ return '<span class="scb2-st-'+m.status+(m.isToday?' scb2-now':'')+'"></span>'; }).join('')+'</div>'
      +'<i class="ti ti-chevron-down"></i></button><div class="scb2-wk-b">'
      +wd.map(scb2RowHTML).join('')+'</div></div>';
  }
  v.innerHTML=h+'</div>';
}
function scb2RowHTML(m){
  var M=_scb2Model, faded=!M.fac&&!m.mine;
  var chips=m.roles.map(function(r){
    return '<span class="scb2-chip scb2-st-'+r.status+'" title="'+scEsc(r.role+' · '+r.n+' checkpoints · '+scb2L(SC_ST_LABEL[r.status]))+'"><i class="ti '+SC_ST_ICON[r.status]+'"></i>'+scEsc(r.role)+'</span>';
  }).join('');
  var mine=M.fac?'':'<span class="scb2-mine">'+(m.mine?scb2Cps(m.mine)+' '+scEsc(scb2L('for you')):scEsc(scb2L('None for you')))+'</span>';
  return '<button type="button" class="scb2-row scb2-st-'+m.status+(m.isToday?' scb2-today':'')+(faded?' scb2-faded':'')+'" onclick="scb2DayTap('+m.di+',\'timeline\')">'
    +'<div class="scb2-dn"><b>'+m.day+'</b><span>'+scEsc(m.date||'')+'</span></div>'
    +'<div class="scb2-rm"><div class="scb2-rt">'+scEsc(m.title)+'</div><div class="scb2-chips">'+(M.fac?chips:mine)+'</div></div>'
    +'<div class="scb2-rs">'+scb2Pill(m.status)
    +(m.gaps?'<span class="scb2-gap"><i class="ti ti-alert-circle"></i> '+m.gaps+' '+scEsc(scb2L(m.gaps===1?'gap':'gaps'))+'</span>':'')
    +(m.markers.length?'<span class="scb2-sess"><i class="ti '+scEsc(m.markers[0].icon||'ti-broadcast')+'"></i> '+scEsc(scb2L('Session'))+(m.markers.length>1?' ×'+m.markers.length:'')+'</span>':'')
    +'</div></button>';
}
function scb2ToggleWeek(w){
  _scb2Open[w]=!_scb2Open[w];
  var el=document.getElementById('scb2-wk-'+w); if(el) el.classList.toggle('open',!!_scb2Open[w]);
}

// ══════════════════════════════════════════════════════════════
// WELCOME MINI-GRID
// ══════════════════════════════════════════════════════════════
function scb2RenderWsMini(){
  var body=document.querySelector('#welcome-screen .ws-body'); if(!body) return;
  var el=document.getElementById('scb2-ws-mini');
  if(!el){
    el=document.createElement('div'); el.id='scb2-ws-mini'; el.className='scb2-mini';
    var guide=document.getElementById('ws-guide-sections'); body.insertBefore(el,guide||null);
  }
  if(!choState.staffMobile||scb1Role()==='MO'){ el.style.display='none'; return; }
  var M=scb2BuildModel();
  el.style.display='';
  el.innerHTML='<div class="scb2-mini-hd"><div><div class="scb2-title" style="font-size:13px;">'+scEsc(scb2L(M.fac?'Facility 60-day timeline':'Your 60-day timeline'))+'</div>'
    +'<div class="scb2-sub">'+(M.pre?scEsc(scb2L('Upcoming')):(choState.startDate?'Day '+(M.todayIdx+1)+' / '+M.days.length:scEsc(scb2L('Start date not set'))))+'</div></div>'
    +'<button type="button" class="scb2-btn sm" onclick="scb2OpenTimeline()"><i class="ti ti-timeline"></i> '+scEsc(scb2L('Open timeline'))+'</button></div>'
    +'<div class="scb2-mini-g">'+M.days.map(function(m){
      return '<span class="scb2-st-'+m.status+(m.isToday?' scb2-now':'')+(!M.fac&&!m.mine?' scb2-faded':'')+'" title="Day '+m.day+' · '+scEsc(scb2L(SC_ST_LABEL[m.status]))+'"></span>';
    }).join('')+'</div>'
    +'<div class="scb2-sum" style="margin-top:9px;">'+['today','awaiting','verified','overdue','sentback','upcoming'].filter(function(k){ return M.sum[k]; })
      .map(function(k){ return scb2Pill(k,M.sum[k]); }).join('')+'</div>';
}
function scb2OpenTimeline(){
  var ws=document.getElementById('welcome-screen');
  if(ws&&ws.classList.contains('vis')){ try{ wsMarkSeen(); }catch(e){} ws.classList.remove('vis'); showCHOMain(); }
  switchView('timeline');
  try{ window.scrollTo(0,0); }catch(e){}
}

// ══════════════════════════════════════════════════════════════
// TAP A DAY — open card / prep preview / facility day sheet
// ══════════════════════════════════════════════════════════════
function scb2DayTap(di,from){
  var d=getDay(di); if(!d) return;
  if(!phcCheckAccess(di,d)){ scb2OpenCardDay(di); return; }   // shows the subscription card
  var M=_scb2Model||scb2BuildModel();
  if(M.fac&&from==='timeline'){ scb2OpenDaySheet(di); return; }
  if(scDayUnlocked(di)){ scb2OpenCardDay(di); return; }
  scb2OpenPrep(di);
}
function scb2OpenCardDay(di){
  document.querySelectorAll('.scx-ov.scb2-ov').forEach(function(o){ o.remove(); });
  var ws=document.getElementById('welcome-screen');
  if(ws&&ws.classList.contains('vis')){ try{ wsMarkSeen(); }catch(e){} ws.classList.remove('vis'); showCHOMain(); }
  if(choState.view!=='cards') switchView('cards');
  selectDay(di+1);
  try{ var el=document.getElementById('ds-scroll'); el=el&&el.children[di]; if(el) el.scrollIntoView({inline:'center',behavior:'smooth'}); }catch(e){}
}
function scb2Overlay(inner){
  var ov=document.createElement('div'); ov.className='scx-ov scb2-ov';
  ov.innerHTML='<div class="scx-box wide"><div class="scx-body" style="max-height:78vh;overflow:auto;">'+inner+'</div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov||(e.target.closest&&e.target.closest('[data-x]'))) ov.remove(); });
  document.body.appendChild(ov);
  return ov;
}
function scb2SheetHead(m,d){
  return '<div class="scb2-sheet-hd"><div class="scb2-sheet-dn scb2-st-'+m.status+'"><b>'+m.day+'</b><span>'+scEsc(m.date||'Day')+'</span></div>'
    +'<div style="flex:1;min-width:0;"><div class="scb2-sheet-t">'+scEsc(d.title)+'</div>'
    +'<div class="scb2-sheet-s">'+scEsc(scb2L('Day'))+' '+m.day+(m.date?' · '+scEsc(scb2DayLong(m.di)):'')+' · '+scEsc(d.aoc==='AE'?'AoC A+E':d.aoc==='Boss'?'All AoCs':'AoC '+d.aoc)+'</div>'
    +'<div style="margin-top:6px;">'+scb2Pill(m.status)+'</div></div></div>';
}
function scb2MarkersHTML(m){
  if(!m.markers.length) return '';
  return '<div class="scb2-sec"><div class="scb2-sec-t"><i class="ti ti-broadcast"></i> '+scEsc(scb2L('Session'))+'</div>'
    +m.markers.map(function(x){
      return '<div class="scb2-person" style="--sc:#2563EB;"><i class="ti '+scEsc(x.icon||'ti-broadcast')+'" style="color:#2563EB;font-size:16px;"></i><div style="flex:1;"><b>'+scEsc(x.label)+'</b><br><small>'+scEsc(x.at?scFmtDateTime(x.at):'')+'</small></div>'
        +(x.kind==='live'?'<button type="button" class="scb2-btn sm ghost" data-x="1" onclick="scOpenLiveSessions()">'+scEsc(scb2L('Open'))+'</button>':'')+'</div>';
    }).join('')+'</div>';
}
function scb2OpenDaySheet(di){
  var M=_scb2Model||scb2BuildModel(), m=M.days[di], d=getDay(di), unlocked=scDayUnlocked(di);
  var people=m.people.length?m.people.map(function(p){
      return '<div class="scb2-person scb2-st-'+p.status+'"><div style="flex:1;min-width:0;"><b>'+scEsc(p.name)+(p.self?' ('+scEsc(scb2L('You'))+')':'')+'</b><br><small>'+scEsc(p.role)+' · '+scb2Cps(p.n)+(p.gaps?' · '+p.gaps+' '+scEsc(scb2L(p.gaps===1?'gap':'gaps')):'')+'</small></div>'+scb2Pill(p.status)+'</div>';
    }).join('')
    :m.roles.map(function(r){
      return '<div class="scb2-person scb2-st-'+r.status+'"><div style="flex:1;"><b>'+scEsc(r.role)+'</b><br><small>'+scb2Cps(r.n)+'</small></div>'+scb2Pill(r.status)+'</div>';
    }).join('');
  scb2Overlay(scb2SheetHead(m,d)
    +'<div class="scb2-sec"><div class="scb2-sec-t"><i class="ti ti-users"></i> '+scEsc(scb2L('Staff on this day'))+'</div>'+people+'</div>'
    +scb2MarkersHTML(m)
    +'<div class="scb2-foot" style="margin-top:14px;"><button type="button" class="scb2-btn ghost" data-x="1">'+scEsc(scb2L('Close'))+'</button>'
    +'<button type="button" class="scb2-btn ghost" data-x="1" onclick="scb2OpenPrep('+di+')"><i class="ti ti-clipboard-list"></i> '+scEsc(scb2L('What to keep ready'))+'</button>'
    +(unlocked?'<button type="button" class="scb2-btn" data-x="1" onclick="scb2OpenCardDay('+di+')"><i class="ti ti-cards"></i> '+scEsc(scb2L('Open card'))+'</button>':'')
    +'</div>');
}

// ══════════════════════════════════════════════════════════════
// PREP PREVIEW — read-only checkpoints + what to keep ready
// ══════════════════════════════════════════════════════════════
// [regex, category, English, Hindi]. Categories: rec (records), item (items & equipment), disp (displays)
var SC_PREP_RULES=[
  [/\bANC\b|antenatal|pregnan/i,'rec','ANC register & MCP cards','ANC रजिस्टर और MCP कार्ड'],
  [/high risk|line list/i,'rec','High-risk pregnancy line list','हाई-रिस्क गर्भावस्था लाइन लिस्ट'],
  [/labou?r|delivery|partograph|episiotomy|uterotonic|third stage|cord clamp/i,'rec','Delivery register & partographs','प्रसव रजिस्टर और पार्टोग्राफ'],
  [/post ?natal|puerper/i,'rec','Postnatal care records','प्रसवोत्तर देखभाल रिकॉर्ड'],
  [/immuni[sz]|vaccin|VVM|open vial|pentavalent/i,'rec','Immunisation register & due list','टीकाकरण रजिस्टर और ड्यू लिस्ट'],
  [/AEFI/i,'rec','AEFI reporting forms','AEFI रिपोर्टिंग फॉर्म'],
  [/tickler|tracking bag/i,'rec','Tickler box / tracking bag','टिकलर बॉक्स / ट्रैकिंग बैग'],
  [/family planning|contracep|\bIUD\b|sterili[sz]|eligible couple/i,'rec','Eligible couple & family planning register','योग्य दंपति और परिवार नियोजन रजिस्टर'],
  [/malaria|NVBDCP|dengue|vector/i,'rec','NVBDCP (malaria) register','NVBDCP (मलेरिया) रजिस्टर'],
  [/NTEP|\bTB\b|tubercul|presumptive/i,'rec','NTEP / Ni-kshay records','NTEP / नि-क्षय रिकॉर्ड'],
  [/leprosy|NLEP/i,'rec','Leprosy (NLEP) records','कुष्ठ (NLEP) रिकॉर्ड'],
  [/IDSP|IHIP|form S\b|syndrom/i,'rec','IDSP / IHIP S-form reports','IDSP / IHIP S-फॉर्म रिपोर्ट'],
  [/\bHIV\b|NACP|AIDS/i,'rec','HIV / NACP referral records','HIV / NACP रेफरल रिकॉर्ड'],
  [/hepatitis|NVHCP/i,'rec','NVHCP (hepatitis) records','NVHCP (हेपेटाइटिस) रिकॉर्ड'],
  [/hypertension|diabet|\bNCD\b|cancer|NAFLD/i,'rec','NCD screening records (CBAC forms)','NCD स्क्रीनिंग रिकॉर्ड (CBAC फॉर्म)'],
  [/ophthalm|\beye\b|refractive|\bENT\b|\bear\b|nose|oral|dental|mental|\bMNS\b|geriatric|elderly|palliative/i,'rec','Screening & referral register for this service','इस सेवा का स्क्रीनिंग और रेफरल रजिस्टर'],
  [/referr|follow ?up/i,'rec','Referral & follow-up register','रेफरल और फॉलो-अप रजिस्टर'],
  [/\bOPD\b|case specific|^No\.? of|^Percentage|drop ?out rate|per month|acceptance rate|completion rate/i,'rec','Monthly reports / HMIS for the last 3 months','पिछले 3 महीने की मासिक रिपोर्ट / HMIS'],
  [/\bdrug|medicine|\bEDL\b|stock|indent|consumption/i,'rec','Drug stock register & indent records','दवा स्टॉक रजिस्टर और इंडेंट रिकॉर्ड'],
  [/diagnos|\bRDK\b|\blab\b|laborator|\btest\b|haemoglobin/i,'rec','Lab / diagnostics register','लैब / जाँच रजिस्टर'],
  [/duty roster|field visit/i,'rec','Duty roster & field visit plans','ड्यूटी रोस्टर और फील्ड विज़िट प्लान'],
  [/trained|training|competen/i,'rec','Training certificates / records','प्रशिक्षण प्रमाणपत्र / रिकॉर्ड'],
  [/performance evaluation|proficiency|skills/i,'rec','Staff performance evaluation records','स्टाफ प्रदर्शन मूल्यांकन रिकॉर्ड'],
  [/availability of (community health officer|anm|multipurpose|asha)/i,'rec','Staff appointment & attendance records','स्टाफ नियुक्ति और उपस्थिति रिकॉर्ड'],
  [/minutes|meeting|\bJAS\b|Jan Arogya|VHSNC|quality team|\bPSG|support group|committee/i,'rec','Meeting minutes (JAS / VHSNC / quality team)','बैठक का विवरण (JAS / VHSNC / गुणवत्ता टीम)'],
  [/satisfaction|feedback|survey/i,'rec','Patient / client satisfaction surveys','मरीज़ / लाभार्थी संतुष्टि सर्वे'],
  [/kayakalp|NQAS|assessment|checklist|non ?complian|root cause|action plan|corrective|gaps? /i,'rec','Internal assessment reports & action plans','आंतरिक मूल्यांकन रिपोर्ट और कार्य योजना'],
  [/work instruction|\bWI\b|\bSOP|protocol|guideline|instructions/i,'rec','SOPs / work instructions','SOP / कार्य निर्देश'],
  [/bio ?medical|\bBMW\b|waste/i,'rec','BMW authorisation & waste records','BMW प्राधिकरण और अपशिष्ट रिकॉर्ड'],
  [/yoga|wellness/i,'rec','Yoga / wellness session register','योग / वेलनेस सत्र रजिस्टर'],
  [/VHND|VHSND|outreach|campaign|\bcamps?\b|household visit/i,'rec','VHND / outreach session records','VHND / आउटरीच सत्र रिकॉर्ड'],
  [/tele ?consult|hubs are identified/i,'rec','Teleconsultation records','टेलीकंसल्टेशन रिकॉर्ड'],
  [/IT platform|portal|digital|electronic record|\bICT\b|software|hardware/i,'rec','Portal / digital records (keep login ready)','पोर्टल / डिजिटल रिकॉर्ड (लॉगिन तैयार रखें)'],
  [/calibrat|maintenance|break ?down/i,'rec','Equipment maintenance & calibration log','उपकरण रखरखाव और कैलिब्रेशन लॉग'],
  [/temperature|refrigerator|cold chain|\bILR\b/i,'rec','Temperature log (fridge / ILR)','तापमान लॉग (फ्रिज / ILR)'],
  [/grievance|complaint/i,'rec','Complaint / grievance register','शिकायत रजिस्टर'],
  [/untied fund|funds/i,'rec','Untied fund records','अनटाइड फंड रिकॉर्ड'],
  [/medical check-?up/i,'rec','Staff medical check-up & immunisation records','स्टाफ मेडिकल जाँच और टीकाकरण रिकॉर्ड'],
  [/evidence folder|all registers/i,'rec','Evidence folders for all Areas of Concern','सभी AoC के साक्ष्य फ़ोल्डर'],
  [/clinical record|patient record|case sheet|records? (are|is) (kept|maintained)|register (&|and) records/i,'rec','Patient records kept safe and in order','मरीज़ रिकॉर्ड सुरक्षित और व्यवस्थित'],
  [/anaphylaxis|adrenaline/i,'item','AEFI / anaphylaxis kit (check adrenaline expiry)','AEFI / एनाफिलेक्सिस किट (एड्रेनालिन की एक्सपायरी देखें)'],
  [/vaccine|diluent|reconstitut|vit(amin)? A/i,'item','Vaccines, diluents & vaccine carrier','टीके, डाइल्यूएंट और वैक्सीन कैरियर'],
  [/needle cutter|hub cutter|sharp|puncture/i,'item','Needle cutter & sharps container','नीडल कटर और शार्प्स कंटेनर'],
  [/colou?r coded|segregat|mixing of the/i,'item','Colour-coded bins & bags','रंग-कोडित डिब्बे और थैलियाँ'],
  [/\bPPE\b|gloves|masks?\b/i,'item','PPE (gloves, masks, aprons)','PPE (दस्ताने, मास्क, एप्रन)'],
  [/hand ?wash|washbasin|hand hygiene/i,'item','Hand-washing station with soap & running water','साबुन और बहते पानी के साथ हाथ धोने की जगह'],
  [/disinfect|decontamina|cleaning (material|agent)|\bmop\b|bucket/i,'item','Disinfectants & cleaning material (2-bucket set)','कीटाणुनाशक और सफ़ाई सामग्री (2-बाल्टी सेट)'],
  [/fire extinguisher/i,'item','Fire extinguisher (check refill date)','अग्निशामक यंत्र (रीफ़िल तिथि देखें)'],
  [/equipment|instrument|diagnostic tools|geriatric tools|assistive device/i,'item','Examination & monitoring equipment in working order','जाँच और निगरानी उपकरण चालू हालत में'],
  [/emergency drug tray|injectables/i,'item','Emergency drug tray','आपातकालीन दवा ट्रे'],
  [/rapid diagnostic|\bRDK\b/i,'item','Rapid diagnostic kits','रैपिड डायग्नोस्टिक किट'],
  [/linen/i,'item','Clean linen','साफ़ लिनन'],
  [/home care kit/i,'item','Home care kit','होम केयर किट'],
  [/curtain|screen\/|privacy/i,'item','Privacy screens / curtains','प्राइवेसी स्क्रीन / पर्दे'],
  [/furniture|fixture/i,'item','Furniture & fixtures in order','फर्नीचर और फिक्स्चर ठीक हालत में'],
  [/racks|shel(f|ves)|labell?ing|place to store medicines/i,'item','Drug racks with labels','लेबल लगे दवा रैक'],
  [/expir/i,'item','Check medicines for expiry','दवाओं की एक्सपायरी जाँचें'],
  [/availability of .*(drug|medicine|anti|IV fluid|vitamin|contracept|antidote|oxytocin|analgesic|diuretic|anaesthetic)/i,'item','Medicines on the EDL, in stock','EDL की दवाएँ, स्टॉक में'],
  [/delivery (services|room)|newborn resuscitation|new born resuscitation/i,'item','Delivery room & newborn resuscitation kit','प्रसव कक्ष और नवजात पुनर्जीवन किट'],
  [/water supply|electricity|running water/i,'item','Running water & power supply','बहता पानी और बिजली आपूर्ति'],
  [/junk|condemned|premises|clean & hygienic|well maintained|barrier|obstacle/i,'item','Premises clean, clear and obstacle-free','परिसर साफ़, खाली और बाधा-रहित'],
  [/citizen charter/i,'disp','Citizen charter','नागरिक चार्टर'],
  [/\bIEC\b|eat right/i,'disp','IEC material for services offered','सेवाओं की IEC सामग्री'],
  [/displayed|display board|signage|no smoking|branding|name of (the )?(facility|AAM)|list of services|regional language/i,'disp','Facility name board, services & drugs list, signage','स्वास्थ्य केंद्र नाम बोर्ड, सेवाओं और दवाओं की सूची, साइनबोर्ड'],
  [/patient rights|responsibilit/i,'disp','Patient rights & responsibilities display','मरीज़ अधिकार और ज़िम्मेदारियाँ डिस्प्ले']
];
// "Availability of anti-malarial / drugs for hypertension …" is a stock check, not a disease-register check
var SC_PREP_DRUG_AVAIL=/^\s*availability (of|on)\b.*\b(drugs?|medicines?|anti|iv fluids?|vitamins|contraceptives|antidotes|oxytocin|analgesics|diuretics|anaesthetics?|injectables|antispetics|antiseptics)/i;
function scb2PrepFor(cps){
  var hi=_appLang==='hi', cats={rec:{},item:{},disp:{}}, order={rec:[],item:[],disp:[]};
  var siRoles={}, ci=0, ob=0, obHit=0;
  cps.forEach(function(cp){
    var txt=String(cp.t||''), ms=cp.method||[], hitItem=false;
    var drugAvail=SC_PREP_DRUG_AVAIL.test(txt);
    SC_PREP_RULES.forEach(function(r){
      if(!r[0].test(txt)) return;
      if(drugAvail&&r[1]==='rec'&&r[2]!=='Drug stock register & indent records') return;
      if(r[1]==='rec'&&ms.indexOf('RR')<0&&ms.length&&!/register|record|report|minutes|form/i.test(txt)) return; // records only when records are reviewed
      var key=r[2];
      if(!cats[r[1]][key]){ cats[r[1]][key]={en:r[2],hi:r[3],n:0}; order[r[1]].push(key); }
      cats[r[1]][key].n++;
      if(r[1]!=='rec') hitItem=true;
    });
    if(ms.indexOf('SI')>=0) scCpRoles(cp).forEach(function(r){ siRoles[r==='General'?'All staff':r]=1; });
    if(ms.indexOf('CI')>=0) ci++;
    if(ms.indexOf('OB')>=0){ ob++; if(hitItem) obHit++; }
  });
  var people=[];
  var roles=Object.keys(siRoles);
  if(roles.length) people.push(hi?('स्टाफ इंटरव्यू के लिए तैयार रखें: '+roles.join(', ')):('Staff to brief for interview questions: '+roles.join(', ')));
  if(ci) people.push(hi?'2–3 मरीज़ / लाभार्थी जो बात करने को तैयार हों':'2–3 clients / beneficiaries willing to speak with the assessor');
  if(ob>obHit) cats.item['__ob']={en:'Areas to be observed kept ready and in order',hi:'जिन जगहों का निरीक्षण होगा वे तैयार और व्यवस्थित रखें',n:ob-obHit}, order.item.push('__ob');
  function list(c){ return order[c].map(function(k){ var x=cats[c][k]; return {text:hi?x.hi:x.en,n:x.n}; }); }
  return {rec:list('rec'),item:list('item'),disp:list('disp'),people:people};
}
function scb2PrepListHTML(title,icon,items){
  if(!items.length) return '';
  return '<div class="scb2-sec"><div class="scb2-sec-t"><i class="ti '+icon+'"></i> '+scEsc(scb2L(title))+'</div><ul class="scb2-prep">'
    +items.map(function(x){ return '<li><i class="ti ti-square-check"></i><span>'+scEsc(typeof x==='string'?x:x.text)+(x.n>1?' <small>×'+x.n+'</small>':'')+'</span></li>'; }).join('')+'</ul></div>';
}
function scb2OpenPrep(di){
  document.querySelectorAll('.scx-ov.scb2-ov').forEach(function(o){ o.remove(); });
  var M=_scb2Model||scb2BuildModel(), m=M.days[di], d=getDay(di); if(!m||!d) return;
  if(!phcCheckAccess(di,d)){ scb2OpenCardDay(di); return; }
  var role=scb1Role(), all=(d.cps||[]).map(function(cp,ci){ return {cp:cp,ci:ci}; });
  var shown=M.fac?all:all.filter(function(x){ return scCpForRole(x.cp,role); });
  var others=all.length-shown.length;
  var prep=scb2PrepFor(shown.map(function(x){ return x.cp; }));
  var unlocked=scDayUnlocked(di);
  var lock=unlocked?scb2L('Scoring is open — open the card to score.')
    :(M.pre?scb2L('Programme has not started yet. Scoring opens on')+' '+scb2DayLong(di)
      :scb2L('Scoring opens on')+' '+(choState.startDate?scb2DayLong(di):('Day '+m.day)));
  var hi=_appLang==='hi';
  var cpsHTML=shown.length?shown.map(function(x){
      var cp=x.cp, txt=(hi&&cp.hi)?cp.hi:cp.t;
      return '<div class="scb2-cp"><div class="scb2-cp-t">'+scEsc(txt)+'</div><div class="scb2-cp-m">'
        +(cp.me?'<span>'+scEsc(cp.me)+'</span>':'')
        +(cp.method||[]).map(function(mt){ return '<span>'+scEsc(mt)+'</span>'; }).join('')
        +(M.fac?'<span class="r">'+scEsc(scCpRoleText(cp))+'</span>':'')+'</div></div>';
    }).join('')
    :'<div class="scb2-note">'+scEsc(scb2L('None for you'))+'</div>';
  scb2Overlay(scb2SheetHead(m,d)
    +'<div class="scb2-lock"><i class="ti '+(unlocked?'ti-lock-open':'ti-lock')+'" style="font-size:15px;"></i><span>'+scEsc(lock)+'</span></div>'
    +'<div class="scb2-sec-t" style="margin-top:14px;font-size:12px;color:var(--teal-dk);"><i class="ti ti-clipboard-list"></i> '+scEsc(scb2L('What to keep ready'))+'</div>'
    +scb2PrepListHTML('Records & registers','ti-notebook',prep.rec)
    +scb2PrepListHTML('Items & equipment','ti-box',prep.item)
    +scb2PrepListHTML('Displays & signage','ti-presentation',prep.disp)
    +scb2PrepListHTML('People to arrange','ti-users',prep.people)
    +scb2MarkersHTML(m)
    +'<div class="scb2-sec"><div class="scb2-sec-t"><i class="ti ti-list-check"></i> '+scEsc(scb2L('Checkpoints'))+' ('+shown.length+')'
    +(others?' · '+others+' '+scEsc(scb2L('more for other staff')):'')+'</div>'+cpsHTML+'</div>'
    +'<div class="scb2-foot" style="margin-top:14px;"><button type="button" class="scb2-btn ghost" data-x="1">'+scEsc(scb2L('Close'))+'</button>'
    +(unlocked?'<button type="button" class="scb2-btn" data-x="1" onclick="scb2OpenCardDay('+di+')"><i class="ti ti-cards"></i> '+scEsc(scb2L('Open card'))+'</button>':'')+'</div>');
}

// ══════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════
(function(){
  Object.assign(HINDI_UI,{'You':'आप','Open':'खोलें'});
  // Scoring functions refuse days that have not opened (not just hidden buttons)
  function guard(name){
    var fn=window[name]; if(typeof fn!=='function') return;
    window[name]=function(di){
      if(!scDayUnlocked(+di)){ showToast(t('This card is not open yet.'),'err'); return; }
      return fn.apply(this,arguments);
    };
  }
  Object.assign(HINDI_UI,{'This card is not open yet.':'यह कार्ड अभी खुला नहीं है।'});
  ['setCP','cycleCP','markDone','gapRetry','gapReVerify'].forEach(guard);

  // Viewing another day keeps "today" intact; closed days open the prep preview instead
  var oSel=selectDay;
  selectDay=function(day){
    var di=(+day)-1; scb2SyncToday();
    var d=getDay(di);
    if(d&&phcCheckAccess(di,d)&&!scDayUnlocked(di)){ scb2OpenPrep(di); return; }
    return oSel.apply(this,arguments);
  };
  // Timeline tab
  var oView=switchView;
  switchView=function(v){
    var tl=document.getElementById('view-timeline')||scb2EnsureTimelineView();
    var btn=document.getElementById('bnav-timeline');
    if(v==='timeline'){
      if(scb1Role()==='MO') v='cards';
      else{
        choState.view='timeline';
        ['cards','board'].forEach(function(id){ var el=document.getElementById('view-'+id); if(el) el.style.display='none';
          var b=document.getElementById('bnav-'+id); if(b) b.className='cho-tab'; });
        if(tl) tl.style.display='';
        if(btn) btn.className='cho-tab active';
        scb2RenderTimeline();
        return;
      }
    }
    if(tl) tl.style.display='none';
    if(btn) btn.className='cho-tab';
    return oView.call(this,v);
  };
  var oMain=showCHOMain;
  showCHOMain=function(){
    scb2SyncToday(); scb2EnsureTimelineView();
    var want=choState.view;
    var r=oMain.apply(this,arguments);
    if(want==='timeline'&&scb1Role()!=='MO') switchView('timeline');
    else if(document.getElementById('view-timeline')&&choState.view!=='timeline') document.getElementById('view-timeline').style.display='none';
    return r;
  };
  var oWsBody=wsRenderBody;
  wsRenderBody=function(){ scb2SyncToday(); var r=oWsBody.apply(this,arguments); try{ scb2RenderWsMini(); }catch(e){ console.warn(e); } return r; };
  // When the CHO's staff data arrives (or refreshes), redraw facility views
  var oVer=scRenderWsVerify;
  scRenderWsVerify=function(){
    var r=oVer.apply(this,arguments);
    try{
      scb2RenderWsMini();
      var tl=document.getElementById('view-timeline'); if(tl&&tl.style.display!=='none') scb2RenderTimeline();
      var main=document.getElementById('cho-main'); if(main&&main.style.display!=='none') buildDaySelector();
    }catch(e){}
    return r;
  };
  var oLang=setLang;
  setLang=function(){
    var r=oLang.apply(this,arguments);
    try{ var b=document.querySelector('#bnav-timeline span'); if(b) b.textContent=t('Timeline');
      var tl=document.getElementById('view-timeline'); if(tl&&tl.style.display!=='none') scb2RenderTimeline();
      scb2RenderWsMini(); }catch(e){}
    return r;
  };
  // Live sessions loaded later → redraw markers
  var oLive=scLoadLive;
  scLoadLive=async function(){ var r=await oLive.apply(this,arguments); try{ scb2RenderWsMini(); }catch(e){} return r; };
  // Start of every staff session: fresh week state
  var oStart=scStartApp;
  scStartApp=async function(){ _scb2Open={}; _scb2Model=null; return oStart.apply(this,arguments); };
})();
