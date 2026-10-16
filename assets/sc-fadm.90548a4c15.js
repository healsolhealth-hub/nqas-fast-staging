
// ══════════════════════════════════════════════════════════════
// FACILITY ADMIN DASHBOARD — new look, same data and functions underneath.
//   Header (facility, PRO, day · Live · My cards) and its own bottom tabs: Home · Staff · Readiness · More.
//   The old blocks are moved, not rewritten: #sc-cho-staff-roster, #sc-cho-progress and #sc-cho-start-date
//   keep their ids, so scRenderChoStaff / scMountInsights / scChoSetStartDate work as before.
// ══════════════════════════════════════════════════════════════
var _faTab='home', _faBuilt=false, _faStepped=false;
var FA_HI={'Facility dashboard':'सुविधा डैशबोर्ड','Home':'होम','Staff':'स्टाफ','Readiness':'तैयारी','More':'और','My cards':'मेरे कार्ड','Day':'दिन','of':'में से',
  'Needs your attention':'आपका ध्यान चाहिए','Quick actions':'त्वरित कार्य','Add staff':'स्टाफ जोड़ें','Download':'डाउनलोड','Live session':'लाइव सत्र',
  'All clear':'सब ठीक है','Nothing needs your attention right now.':'अभी किसी बात पर ध्यान देने की ज़रूरत नहीं है।','Open readiness':'तैयारी देखें',
  'Facility readiness':'सुविधा की तैयारी','Baseline':'बेसलाइन','Growth':'बढ़त','Checkpoints':'चेकपॉइंट','Loading…':'लोड हो रहा है…',
  'Programme':'कार्यक्रम','Account':'खाता','Change my password':'मेरा पासवर्ड बदलें','Help on WhatsApp':'WhatsApp पर मदद','Logout':'लॉग आउट','Live sessions':'लाइव सत्र',
  'Programme start date':'कार्यक्रम शुरू होने की तारीख','Set date':'तारीख सेट करें','people':'लोग','person':'व्यक्ति','Close':'बंद करें','you':'आप',
  'Reset password':'Reset password','Remove':'हटाएँ','cards done':'कार्ड पूरे','readiness':'तैयारी','Who do you want to add?':'किसे जोड़ना है?',
  'Downloads':'डाउनलोड','Refresh':'रीफ़्रेश'};
function faT(k){ return (typeof _appLang!=='undefined'&&_appLang==='hi'&&FA_HI[k])?FA_HI[k]:k; }
function faOn(){ var a=document.getElementById('sc-cho-app'); return !!(a&&a.classList.contains('fa')); }
function faSt(){ return (typeof _scIns!=='undefined'&&_scIns)?_scIns['sc-cho-progress']:null; }
function faFac(){ return Object.assign({},(typeof scSubAdminData!=='undefined'&&scSubAdminData)||{}); }
function faDual(){ return typeof _scDual!=='undefined'&&!!_scDual; }

function faBuild(){
  var app=document.getElementById('sc-cho-app'); if(!app) return;
  if(_faBuilt&&app.classList.contains('fa')) return;
  var main=app.querySelector('.sc-cho-main'); if(!main) return;
  app.classList.add('fa');
  var hd=document.createElement('div'); hd.className='fa-hd'; hd.id='fa-hd'; app.insertBefore(hd,main);
  var mk=function(id){ var p=document.createElement('section'); p.className='fa-pane'; p.id=id; main.appendChild(p); return p; };
  var home=mk('fa-home'), staff=mk('fa-staff'), ready=mk('fa-ready'), more=mk('fa-more');
  // Staff: heading + roster (moved) + the temporary-password note (moved)
  var roster=document.getElementById('sc-cho-staff-roster');
  staff.innerHTML='<div class="fa-sec"><div><b id="fa-staff-t">'+faT('Staff')+'</b><br><small id="fa-staff-n"></small></div><button type="button" class="fa-btn" onclick="faAddStaff()"><i class="ti ti-user-plus"></i><span>'+faT('Add staff')+'</span></button></div>'
    +'<div class="nf-card fa-staff" id="fa-staff-card"></div><div class="fa-miss" id="fa-staff-miss"></div>';
  if(roster) staff.querySelector('#fa-staff-card').appendChild(roster);
  var note=roster&&roster.parentNode&&[].slice.call(document.querySelectorAll('#sc-cho-app .sc-panel-body > div')).find(function(d){ return /temporary password/i.test(d.textContent)&&d!==roster; });
  var nd=document.createElement('div'); nd.className='fa-note'; nd.id='fa-staff-note';
  nd.innerHTML='<i class="ti ti-info-circle"></i><span>'+scEsc(note?note.textContent.trim():'Each person gets a temporary password once, then logs in with their mobile number and chooses their own password.')+'</span>';
  staff.appendChild(nd); if(note) note.style.display='none';
  // Readiness: heading + insights (moved)
  var prog=document.getElementById('sc-cho-progress');
  ready.innerHTML='<div class="fa-sec"><div><b>'+faT('Readiness')+'</b></div><div style="display:flex;gap:8px;">'
    +'<button type="button" class="fa-ib" title="'+faT('Refresh')+'" aria-label="Refresh" onclick="faRefresh()"><i class="ti ti-refresh"></i></button>'
    +'<button type="button" class="fa-btn" onclick="faDownloads()"><i class="ti ti-download"></i><span>'+faT('Download')+'</span></button></div></div>';
  if(prog){ prog.style.padding='0'; ready.appendChild(prog); }
  // More: programme start date (moved) + account
  var sd=document.getElementById('sc-cho-start-date'), row=sd&&sd.parentNode;
  more.innerHTML='<div class="fa-sec"><b>'+faT('Programme')+'</b></div><div class="nf-card fa-set" id="fa-set"><label for="sc-cho-start-date">'+faT('Programme start date')+'</label><div class="fa-set-h" id="fa-set-h"></div></div>'
    +'<div class="fa-sec"><b>'+faT('Account')+'</b></div><div class="nf-card nf-rows" id="fa-acct" style="margin-top:0;"></div>';
  if(row){ more.querySelector('#fa-set').insertBefore(row,more.querySelector('#fa-set-h')); }
  // bottom tabs
  var nav=document.createElement('nav'); nav.id='fa-nav'; nav.setAttribute('aria-label','Facility dashboard');
  app.appendChild(nav);
  _faBuilt=true;
}
function faNavHTML(){
  return [['home','ti-home','Home'],['staff','ti-users','Staff'],['ready','ti-chart-bar','Readiness'],['more','ti-settings','More']].map(function(x){
    return '<button type="button" data-fa="'+x[0]+'" class="'+(_faTab===x[0]?'on':'')+'" onclick="faTab(\''+x[0]+'\')"><i class="ti '+x[1]+'"></i><span>'+faT(x[2])+'</span>'+(x[0]==='home'&&faAttCount()?'<em>'+faAttCount()+'</em>':'')+'</button>'; }).join('');
}
function faHeader(){
  var hd=document.getElementById('fa-hd'); if(!hd) return;
  var f=faFac(), code=(typeof scSubAdminCode!=='undefined'&&scSubAdminCode)||'', d=typeof nfDayOf==='function'?nfDayOf(f):null;
  var sub=(d!=null&&d>0?faT('Day')+' '+d+' '+faT('of')+' 60 · ':'')+faT('Facility dashboard');
  hd.innerHTML='<div class="fa-hd-l"><small>'+sub+'</small><h1><span class="n">'+scEsc(f.name||code)+'</span>'+(typeof nfProBadge==='function'?nfProBadge(f,''):'')+'</h1></div>'
    +'<button type="button" class="fa-ib" title="'+faT('Live sessions')+'" aria-label="Live sessions" onclick="scOpenLiveSessions()"><i class="ti ti-broadcast"></i></button>'
    +(faDual()?'<button type="button" class="fa-mc" onclick="faMyCards()"><i class="ti ti-cards"></i><span>'+faT('My cards')+'</span></button>':'');
  var nav=document.getElementById('fa-nav'); if(nav) nav.innerHTML=faNavHTML();
}
function faTab(tab,o){
  o=o||{}; if(!faOn()) return;
  var prev=_faTab; _faTab=tab;
  ['home','staff','ready','more'].forEach(function(k){ var p=document.getElementById('fa-'+k); if(p) p.classList.toggle('on',k===tab); });
  if(tab==='home') faHome(); else if(tab==='more') faMore(); else if(tab==='staff') faStaffMeta();
  var nav=document.getElementById('fa-nav'); if(nav) nav.innerHTML=faNavHTML();
  if(!o.noStep&&prev==='home'&&tab!=='home'&&!_faStepped&&typeof window.nfBackPush==='function'){ window.nfBackPush(); _faStepped=true; }
  if(tab==='home') _faStepped=false;
  if(!o.keepScroll){ try{ window.scrollTo(0,0); }catch(e){} }
}
// phone Back inside the dashboard: other tab → Home → My cards
window.nfFaBack=function(){
  if(!faOn()) return false;
  if(_faTab!=='home'){ _faStepped=false; faTab('home',{noStep:true}); return true; }
  if(faDual()){ faMyCards(); return true; }
  return false;
};
async function faMyCards(){
  if(!faDual()) return;
  try{ if(typeof _nfTab!=='undefined') _nfTab='today'; await scb1ShowTab('cards'); }catch(e){}
  try{ if(typeof nfSync==='function') nfSync(); }catch(e){}
}
function faRefresh(){ try{ scRenderChoProgress(); }catch(e){} showToast(faT('Refresh')+'…','ok'); }

// ── Home ───────────────────────────────────────────────────────
function faItems(){
  var st=faSt(), f=faFac(), out=[]; if(!st||!st.agg) return out;
  var A=st.agg, d=typeof nfDayOf==='function'?nfDayOf(f):null, staff=st.staff||{};
  var others=Object.keys(staff).filter(function(m){ var s=staff[m]; return s&&!s.disabled&&(!faDual()||String(m)!==String(choState.staffMobile)); });
  if(!f.startDate) out.push({ic:'ti-calendar',cls:'p',t:'Set the programme start date',s:'Day 1 unlocks for all staff on this date.',go:"faTab('more')"});
  if(!others.length) out.push({ic:'ti-user-plus',cls:'w',t:'Add your staff',s:'Add the MO, ANM, ASHA and MPW of this facility.',go:"faTab('staff')"});
  try{
    var bs=scBaselineStatus(st.progId,st.progress||{},staff), due=bs.filter(function(x){ return d!=null&&d>=x.di+1&&x.need>0&&!x.complete; });
    if(due.length&&due.length<=2) due.forEach(function(x){ out.push({ic:'ti-clipboard-check',cls:'n',t:'Baseline Day '+(x.di+1)+' not finished',s:'Waiting for: '+x.pending.join(', '),go:"faOpenReady('baseline')"}); });
    else if(due.length){ var who={}; due.forEach(function(x){ x.pending.forEach(function(n){ who[n]=1; }); });
      out.push({ic:'ti-clipboard-check',cls:'n',t:due.length+' baseline days not finished (Day '+due.map(function(x){ return x.di+1; }).join(', ')+')',s:'Waiting for: '+Object.keys(who).join(', '),go:"faOpenReady('baseline')"}); }
  }catch(e){}
  try{ var rows=scInsRows(st), od=rows.filter(function(r){ return r.status==='overdue'; }).length;
    if(od) out.push({ic:'ti-clock',cls:'n',t:od+' overdue action'+(od===1?'':'s'),s:'Corrective actions past their due date.',go:"faOpenReady('gaps')"}); }catch(e){}
  var wait=Math.max(0,(A.daysDone||0)-(A.daysVerified||0));
  if(wait) out.push({ic:'ti-checks',cls:'p',t:wait+' card'+(wait===1?'':'s')+' waiting to be verified',s:faDual()?'Done by staff, not yet checked — open My cards to verify.':'Done by staff, not yet checked.',go:faDual()?'faMyCards()':"faOpenReady('staff')"});
  if(d!=null&&d>=2){ var idle=(A.staff||[]).filter(function(s){ return s.inRoster&&!(staff[s.mob]||{}).disabled&&!(s.res&&s.res.daysDone); });
    if(idle.length) out.push({ic:'ti-user-question',cls:'p',t:idle.length===1?idle[0].name+' has not completed any card yet':idle.length+' staff have not completed any card yet',s:idle.length===1?'Day '+d+' of the programme.':idle.map(function(s){ return s.name; }).join(', '),go:"faTab('staff')"}); }
  return out;
}
function faAttCount(){ try{ return faItems().filter(function(x){ return x.cls==='n'; }).length; }catch(e){ return 0; } }
function faOpenReady(tab){ faTab('ready'); try{ scInsTab('sc-cho-progress',tab); }catch(e){} }
function faHome(){
  var host=document.getElementById('fa-home'); if(!host) return;
  var st=faSt(), f=faFac();
  if(!st||!st.agg){ host.innerHTML='<div class="nf-card" style="margin-top:6px;text-align:center;color:var(--t3);font-size:13px;padding:28px;"><i class="ti ti-loader" style="animation:spin 1s linear infinite;"></i> '+faT('Loading…')+'</div>'; return; }
  var A=st.agg, P=null; try{ P=nfFacPhases({progId:st.progId,progress:st.progress||{},staff:st.staff||{},fac:st.fac||f,agg:A}); }catch(e){}
  var B=(P&&P.B)||A.baseline||{}, hasB=!!B.assessed, cur=A.coverage&&A.coverage.assessed?A.pct:null, d=P?P.day:(typeof nfDayOf==='function'?nfDayOf(f):null);
  var idx=d==null||d<1?-1:d<=7?0:d<=49?1:d<=56?2:d<=60?3:4, ph=idx<0?'Not started':idx>3?'Programme complete':(typeof NF_PHASES!=='undefined'?NF_PHASES[idx].k:'');
  var gain=hasB&&cur!=null?cur-B.pct:null, n=null; try{ n=A.nqas||scNqasCheckV2(A); }catch(e){}
  var nq=!n||!n.hasData?'Readiness appears once staff mark day cards as done.':n.meets?'<b>✓ Meets NQAS criteria</b> — overall '+A.pct+'%':'<b>Not yet at NQAS criteria</b> — overall '+A.pct+'% (needs 70%)'+(n.stdFails&&n.stdFails.length?' · '+n.stdFails.length+' Standards below minimum':'');
  var h='<div class="nf-hero fa-hero" style="margin-top:6px;"><div class="nf-hero-row"><div class="nf-hero-txt"><div class="nf-hero-k">'+faT('Facility readiness')+'</div>'
    +'<div class="nf-hero-t">'+scEsc(ph)+'</div><div class="nf-hero-s">'+(d!=null&&d>0?faT('Day')+' '+d+' '+faT('of')+' 60':(f.startDate?'Starts '+scFmtDate(f.startDate):'Start date not set'))+'</div></div>'
    +'<div class="nf-hero-ring">'+nfRing(cur||0,hasB?B.pct:null,88,9,'#fff','rgba(255,255,255,.2)')+'<span><b>'+(cur==null?'—':cur+'%')+'</b><small>'+faT('readiness')+'</small></span></div></div>'
    +'<div class="nf-hero-nums"><div><b class="acc">'+(hasB?B.pct+'%':'—')+'</b><small>'+faT('Baseline')+'</small></div><i></i><div><b>'+(gain==null?'—':(gain>=0?'+':'')+gain)+'</b><small>'+faT('Growth')+'</small></div><i></i><div><b>'+((A.coverage&&A.coverage.assessed)||0)+'<span style="font-size:13px;opacity:.75;">/'+A.total+'</span></b><small>'+faT('Checkpoints')+'</small></div></div>'
    +'<div class="fa-nq">'+nq+'</div>'
    +'<button type="button" class="nf-cta" onclick="faTab(\'ready\')"><i class="ti ti-chart-bar"></i> '+faT('Open readiness')+'</button></div>';
  var items=faItems();
  h+='<div class="fa-sec"><b>'+faT('Needs your attention')+'</b>'+(items.length?'<small>'+items.length+'</small>':'')+'</div>';
  if(items.length) h+='<div class="nf-card nf-list fa-att">'+items.map(function(x){ return '<button type="button" class="nf-task" onclick="'+x.go+'"><span class="nf-ti '+x.cls+'"><i class="ti '+x.ic+'"></i></span><span class="nf-tt"><b>'+scEsc(x.t)+'</b><small>'+scEsc(x.s)+'</small></span><i class="ti ti-chevron-right"></i></button>'; }).join('')+'</div>';
  else h+='<div class="nf-card nf-list"><div class="fa-ok"><span class="nf-ti"><i class="ti ti-circle-check"></i></span><div><b>'+faT('All clear')+'</b><small>'+faT('Nothing needs your attention right now.')+'</small></div></div></div>';
  h+='<div class="fa-sec"><b>'+faT('Quick actions')+'</b></div><div class="fa-qa">'
    +'<button type="button" onclick="faAddStaff()"><i class="ti ti-user-plus"></i>'+faT('Add staff')+'</button>'
    +'<button type="button" onclick="faDownloads()"><i class="ti ti-download"></i>'+faT('Download')+'</button>'
    +'<button type="button" onclick="scOpenLiveSessions()"><i class="ti ti-broadcast"></i>'+faT('Live session')+'</button></div>';
  host.innerHTML=h;
  var nav=document.getElementById('fa-nav'); if(nav) nav.innerHTML=faNavHTML();
}

// ── Staff ──────────────────────────────────────────────────────
var FA_ROLES=['CHO','MO','ANM','ASHA','MPW'];
function faStaffList(){
  var S=(typeof scSubAdminStaff!=='undefined'&&scSubAdminStaff)||{};
  return Object.keys(S).filter(function(m){ return S[m]&&!S[m].disabled; }).map(function(m){ return Object.assign({mob:m},S[m]); })
    .sort(function(a,b){ var ra=FA_ROLES.indexOf(a.role||'CHO'), rb=FA_ROLES.indexOf(b.role||'CHO'); return ((ra<0?9:ra)-(rb<0?9:rb))||String(a.name||'').localeCompare(String(b.name||'')); });
}
function faStaffRender(){
  var cont=document.getElementById('sc-cho-staff-roster'); if(!cont) return;
  var st=faSt(), by={}; ((st&&st.agg&&st.agg.staff)||[]).forEach(function(s){ by[s.mob]=s; });
  var list=faStaffList(), me=faDual()?String(choState.staffMobile):'';
  if(!list.length){ cont.innerHTML='<div class="nf-empty">No staff added yet. Tap <b>'+faT('Add staff')+'</b> to start.</div>'; faStaffMeta(); return; }
  cont.innerHTML=list.map(function(s){
    var rd=getScRole(s.role||'CHO')||{}, r=(by[s.mob]||{}).res, you=String(s.mob)===me, m=scJs(s.mob);
    var pg=r?'<div class="fa-pg"><div class="nf-bar"><i style="width:'+Math.max(0,Math.min(100,r.pct||0))+'%"></i></div><span>'+(r.daysDone||0)+' '+faT('cards done')+' · '+(r.pct||0)+'%</span></div>':'';
    return '<div class="fa-p" data-mob="'+scEsc(s.mob)+'"><div class="fa-p-r"><span class="fa-av">'+scEsc(String(s.name||s.mob||'?').charAt(0).toUpperCase())+'</span>'
      +'<div class="fa-pb"><b>'+scEsc(s.name||s.mob)+'</b><small><span class="fa-chip" title="'+scEsc(rd.label||s.role)+'">'+scEsc(s.role||'CHO')+'</span>'+(you?'<span class="fa-chip you">'+faT('you')+'</span>':'')+'<span>📱 '+scEsc(s.mob)+'</span></small>'+pg+'</div>'
      +'<button type="button" class="fa-dots" aria-label="More options" onclick="faToggle(this)"><i class="ti ti-dots-vertical"></i></button></div>'
      +'<div class="fa-acts"><button type="button" onclick="scResetStaffPwd(\''+m+'\')"><i class="ti ti-key"></i> Reset password</button>'
      +(you?'':'<button type="button" class="danger" onclick="scRemoveStaff(\''+m+'\')"><i class="ti ti-trash"></i> '+faT('Remove')+'</button>')+'</div></div>';
  }).join('');
  faStaffMeta();
}
function faStaffMeta(){
  var list=faStaffList(), n=document.getElementById('fa-staff-n'), miss=document.getElementById('fa-staff-miss');
  if(n) n.textContent=list.length+' '+faT(list.length===1?'person':'people');
  if(miss){ var have={}; list.forEach(function(s){ have[s.role||'CHO']=1; }); var no=FA_ROLES.filter(function(r){ return !have[r]; });
    miss.textContent=no.length?'Not added yet: '+no.map(function(r){ return (getScRole(r)||{}).label||r; }).join(' · '):''; }
}
function faToggle(btn){ var p=btn.closest('.fa-p'); if(!p) return; var open=!p.classList.contains('open');
  document.querySelectorAll('#sc-cho-staff-roster .fa-p.open').forEach(function(x){ x.classList.remove('open'); }); if(open) p.classList.add('open'); }
function faSheet(title,sub,rows){
  var old=document.getElementById('fa-sh'); if(old) old.remove();
  var ov=document.createElement('div'); ov.className='fa-sh'; ov.id='fa-sh';
  ov.innerHTML='<div class="fa-sh-b" role="dialog" aria-label="'+scEsc(title)+'"><h3>'+scEsc(title)+'</h3>'+(sub?'<p>'+scEsc(sub)+'</p>':'')
    +'<div class="nf-list" style="padding:0;">'+rows.map(function(x,i){ return '<button type="button" class="nf-task" data-i="'+i+'"><span class="nf-ti '+(x.cls||'w')+'"><i class="ti '+x.ic+'"></i></span><span class="nf-tt"><b>'+scEsc(x.t)+'</b>'+(x.s?'<small>'+scEsc(x.s)+'</small>':'')+'</span></button>'; }).join('')+'</div>'
    +'<button type="button" class="fa-sh-x">'+faT('Close')+'</button></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
  ov.querySelector('.fa-sh-x').onclick=function(){ ov.remove(); };
  ov.querySelectorAll('.nf-task').forEach(function(b){ b.onclick=function(){ var x=rows[+b.getAttribute('data-i')]; ov.remove(); try{ x.go(); }catch(e){ console.warn('[SC] dashboard action',e); } }; });
  document.body.appendChild(ov); return ov;
}
function faAddStaff(){
  var have={}; faStaffList().forEach(function(s){ have[s.role||'CHO']=(have[s.role||'CHO']||0)+1; });
  faSheet(faT('Add staff'),faT('Who do you want to add?'),FA_ROLES.map(function(r){ var rd=getScRole(r)||{};
    return {ic:'ti-user-plus',cls:have[r]?'w':'p',t:(rd.label&&rd.label!==r?rd.label+' ('+r+')':r),s:have[r]?have[r]+' already added':'Not added yet',go:function(){ scOpenAddStaff(r); }}; }));
}
function faDownloads(){
  var H='sc-cho-progress', ok=!!faSt();
  if(!ok){ showToast(faT('Loading…'),''); return; }
  faSheet(faT('Downloads'),'In the One HealSol app, reports open in your phone\'s browser.',[
    {ic:'ti-file-text',t:'Facility readiness report (PDF)',s:'Readiness, Areas of Concern, Standards and staff.',go:function(){ scChoReport(); }},
    {ic:'ti-file-text',cls:'p',t:'Baseline report (PDF)',s:'The 7-day rapid audit and the gaps it found.',go:function(){ nfBaselinePdf(H); }},
    {ic:'ti-download',cls:'f',t:'Baseline report (CSV)',s:'Every baseline gap — opens in Excel.',go:function(){ scBaselineCsv(H); }},
    {ic:'ti-download',cls:'f',t:'Gap list (CSV)',s:'Open gaps and corrective actions — opens in Excel.',go:function(){ scInsExportCsv(H); }}
  ]);
}

// ── More ───────────────────────────────────────────────────────
function faMore(){
  var f=faFac(), h=document.getElementById('fa-set-h');
  if(h){ var d=typeof nfDayOf==='function'?nfDayOf(f):null;
    h.textContent=f.startDate?('Day 1 was '+scFmtDate(f.startDate)+' · the 60 days end '+scFmtDate(scAddDays(f.startDate,59))+(d!=null&&d>0?' · today is Day '+d:'')+'. Changing it moves every staff member\'s days.'):'Choose the date Day 1 unlocks for all staff at this facility.'; }
  var setBtn=document.querySelector('#fa-set button'); if(setBtn) setBtn.textContent=faT('Set date');
  var a=document.getElementById('fa-acct'); if(!a) return;
  var row=function(ic,txt,on,cls){ return '<button type="button" class="nf-row'+(cls?' '+cls:'')+'" onclick="'+on+'"><i class="ti '+ic+'"></i><span>'+txt+'</span><i class="ti ti-chevron-right nf-row-chev"></i></button>'; };
  var who=faDual()?'<div class="nf-row" style="cursor:default;"><i class="ti ti-user"></i><span>'+scEsc(choState.staffName||'')+' <small style="color:var(--t3);">· CHO · '+scEsc(choState.staffMobile||'')+'</small></span></div>':'';
  a.innerHTML=who
    +(faDual()?row('ti-cards',faT('My cards'),'faMyCards()'):'')
    +(faDual()&&typeof nfChangeMyPassword==='function'?row('ti-key',faT('Change my password'),'nfChangeMyPassword()'):'')
    +row('ti-broadcast',faT('Live sessions'),'scOpenLiveSessions()')
    +(typeof nfSupportOn==='function'&&nfSupportOn()?row('ti-message',faT('Help on WhatsApp'),"nfOpenSupport('fadm')"):'')
    +row('ti-logout',faT('Logout'),'scChoLogout()','danger');
}

// ── wiring ─────────────────────────────────────────────────────
function faEnter(){
  faBuild(); if(!faOn()) return;
  document.body.classList.add('nf-fadm');
  try{ if(typeof nfSync==='function') nfSync(); }catch(e){}
  faHeader(); faStaffRender(); faTab(_faTab||'home',{noStep:true});
}
(function(){
  var app=document.getElementById('sc-cho-app');
  if(app&&window.MutationObserver) new MutationObserver(function(){
    var vis=app.classList.contains('vis'); document.body.classList.toggle('nf-fadm',vis&&faOn());
    if(!vis){ _faStepped=false; var sh=document.getElementById('fa-sh'); if(sh) sh.remove(); }
  }).observe(app,{attributes:true,attributeFilter:['class']});
  var oPanel=scStartChoPanel;
  scStartChoPanel=async function(code){ var same=_faBuilt&&typeof scSubAdminCode!=='undefined'&&scSubAdminCode===code; if(!same) _faTab='home';
    faBuild(); document.body.classList.add('nf-fadm'); faHeader(); faHome();
    var r=await oPanel.apply(this,arguments); try{ faEnter(); }catch(e){ console.warn('[SC] dashboard',e); } return r; };
  var oProg=scRenderChoProgress;
  scRenderChoProgress=async function(){ var r=await oProg.apply(this,arguments); try{ if(faOn()){ faHome(); faStaffRender(); faHeader(); } }catch(e){} return r; };
  var oRoster=scRenderChoStaff;
  scRenderChoStaff=function(){ if(!faOn()) return oRoster.apply(this,arguments); faStaffRender(); };
  var oIns=scInsRender;
  scInsRender=function(hostId){ var r=oIns.apply(this,arguments);
    if(hostId==='sc-cho-progress'&&faOn()){ try{
      var host=document.getElementById(hostId), h=host&&host.querySelector('.scd-rep-h');
      if(h&&!h.querySelector('.fa-btn')){ var b=document.createElement('button'); b.type='button'; b.className='fa-btn ghost'; b.innerHTML='<i class="ti ti-download"></i><span>'+faT('Download')+'</span>'; b.onclick=faDownloads; h.appendChild(b); }
      if(_faTab==='home') faHome(); else { var nav=document.getElementById('fa-nav'); if(nav) nav.innerHTML=faNavHTML(); }
    }catch(e){} }
    return r; };
  var oSet=scChoSetStartDate;
  scChoSetStartDate=async function(){ var v=(document.getElementById('sc-cho-start-date')||{}).value; var r=await oSet.apply(this,arguments);
    try{ if(v&&typeof scSubAdminData!=='undefined'&&scSubAdminData) scSubAdminData.startDate=v; if(faOn()){ faHeader(); faMore(); } }catch(e){} return r; };
  if(typeof setLang==='function'){ var oLang=setLang; setLang=function(){ var r=oLang.apply(this,arguments); try{ if(faOn()&&document.getElementById('sc-cho-app').classList.contains('vis')){ faHeader(); faTab(_faTab,{noStep:true,keepScroll:true}); faStaffRender(); } }catch(e){} return r; }; }
  // WhatsApp help from the dashboard says which facility
  if(typeof nfSupportText==='function'){ var oTxt=nfSupportText; nfSupportText=function(where){ var s=oTxt.apply(this,arguments);
    if(where==='fadm'){ try{ var f=faFac(); s=s.replace('My question: ','Facility: '+(f.name||'')+' ('+(scSubAdminCode||'')+') · Facility dashboard'+(faDual()?'\nName: '+(choState.staffName||'')+' · CHO · '+(choState.staffMobile||''):'')+'\n\nMy question: '); }catch(e){} }
    return s; }; }
})();
