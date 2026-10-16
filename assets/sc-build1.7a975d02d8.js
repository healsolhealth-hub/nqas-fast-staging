
// ══════════════════════════════════════════════════════════════
// BUILD 1 — state
// ══════════════════════════════════════════════════════════════
var _scDual=null;              // {code} while a CHO signed in via Staff Login (both tabs available)
var _scb1StaffScreen='home';   // staff screen to restore when returning to My Cards: 'home' | 'main'
var _scb1Busy=false;

Object.assign(HINDI_UI,{
  'My Cards':'मेरे कार्ड','Facility Dashboard':'स्वास्थ्य केंद्र डैशबोर्ड','Signed in as':'लॉगिन किया है',
  'Not you? Log out':'आप नहीं? लॉगआउट करें','Facility ID':'स्वास्थ्य केंद्र आईडी','Mobile':'मोबाइल',
  'for you':'आपके लिए','No checkpoints for you today':'आज आपके लिए कोई चेकपॉइंट नहीं',
  'Your next checkpoints':'आपके अगले चेकपॉइंट','No more checkpoints for you in this programme.':'इस कार्यक्रम में आपके लिए और कोई चेकपॉइंट नहीं।',
  'Your main task is to verify staff cards.':'आपका मुख्य कार्य स्टाफ के कार्ड सत्यापित करना है।',
  'Open cards to verify':'सत्यापन के लिए कार्ड खोलें','checkpoints':'चेकपॉइंट','Day':'दिन'
});

function scb1Role(){ return choState.roleId||'CHO'; }
function scb1IsLight(){ var r=scb1Role(); return r==='MO'||r==='MPW'; }
function scb1TodayIdx(){
  var p=getProg(choState.progId);
  return Math.min(computeCurrentDay(choState.startDate,p.days),p.days)-1;
}
// Own checkpoints on day di — by role, independent of appMode
function scb1MyCount(di){
  var d=getDay(di), role=scb1Role();
  return (d&&d.cps||[]).filter(function(cp){ return scCpForRole(cp,role); }).length;
}
function scb1DayDate(di){
  if(!choState.startDate) return '';
  var p=choState.startDate.split('-');
  var d=new Date(+p[0],+p[1]-1,+p[2]+di);
  return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
}
function scb1Mask(mob){ mob=String(mob||''); return mob.length>4?'••••••'+mob.slice(-4):mob; }

// ══════════════════════════════════════════════════════════════
// IDENTITY STRIP — who is signed in, at which facility
// ══════════════════════════════════════════════════════════════
function scb1RenderWho(){
  var hero=document.querySelector('#welcome-screen .ws-hero'); if(!hero) return;
  var el=document.getElementById('scb1-who');
  if(!el){
    el=document.createElement('div'); el.id='scb1-who'; el.className='scb1-who';
    var top=hero.querySelector('.ws-hero-top');
    if(top&&top.nextSibling) hero.insertBefore(el,top.nextSibling); else hero.appendChild(el);
  }
  if(!choState.staffMobile){ el.style.display='none'; return; }
  el.style.display='';
  var f=choState.facility||{}, nm=choState.staffName||choState.staffMobile;
  el.innerHTML='<div class="scb1-av">'+scEsc(String(nm).charAt(0).toUpperCase())+'</div>'
    +'<div class="scb1-who-t">'
    +'<div class="scb1-who-lbl">'+scEsc(t('Signed in as'))+'</div>'
    +'<div class="scb1-who-n">'+scEsc(nm)+'<span class="scb1-role">'+scEsc(scb1Role())+'</span></div>'
    +'<div class="scb1-who-f"><i class="ti ti-building-hospital"></i> '+scEsc(f.name||choState.facilityCode||'')+'</div>'
    +'<div class="scb1-who-m">'+scEsc(t('Facility ID'))+': '+scEsc(choState.facilityCode||'')+' · '+scEsc(t('Mobile'))+': '+scEsc(scb1Mask(choState.staffMobile))+'</div>'
    +'</div>'
    +'<button class="scb1-notyou" onclick="logoutCHO()">'+scEsc(t('Not you? Log out'))+'</button>';
}
// Staff app header: "Name · Role" under the facility name
function scb1RenderNavWho(){
  var sub=document.querySelector('#cho-nav .cho-nav-sub'); if(!sub||!choState.staffMobile) return;
  sub.textContent=(choState.staffName||scb1Mask(choState.staffMobile))+' · '+scb1Role();
}
// Facility Dashboard header: who is signed in (single-login CHO only)
function scb1RenderDashWho(){
  var code=document.getElementById('sc-cho-fac-code'); if(!code) return;
  var host=code.parentNode&&code.parentNode.parentNode; if(!host) return;
  var el=document.getElementById('scb1-dash-who');
  if(!el){ el=document.createElement('div'); el.id='scb1-dash-who'; el.className='scb1-dash-who'; host.appendChild(el); }
  if(_scDual){ el.style.display=''; el.textContent=t('Signed in as')+': '+(choState.staffName||scb1Mask(choState.staffMobile))+' · CHO'; }
  else el.style.display='none';
}

// ══════════════════════════════════════════════════════════════
// TABS — My Cards / Facility Dashboard
// ══════════════════════════════════════════════════════════════
function scb1EnsureTabs(){
  var bar=document.getElementById('scb1-tabs');
  if(!bar){
    bar=document.createElement('nav'); bar.id='scb1-tabs'; bar.className='scb1-tabs'; bar.style.display='none';
    bar.innerHTML='<div class="scb1-tabs-in">'
      +'<button type="button" data-tab="cards" onclick="scb1ShowTab(\'cards\')"><i class="ti ti-cards"></i><span data-i18n="My Cards">My Cards</span></button>'
      +'<button type="button" data-tab="dash" onclick="scb1ShowTab(\'dash\')"><i class="ti ti-building-hospital"></i><span data-i18n="Facility Dashboard">Facility Dashboard</span></button>'
      +'</div>';
    document.body.appendChild(bar);
  }
  return bar;
}
function scb1SyncTabs(){
  var on=!!_scDual&&(appMode==='cho'||appMode==='sc-cho');
  var bar=scb1EnsureTabs();
  bar.style.display=on?'':'none';
  document.body.classList.toggle('scb1-tabs-on',on);
  bar.querySelectorAll('button[data-tab]').forEach(function(b){
    b.classList.toggle('on',(b.getAttribute('data-tab')==='dash')===(appMode==='sc-cho'));
  });
  bar.querySelectorAll('[data-i18n]').forEach(function(el){ el.textContent=t(el.getAttribute('data-i18n')); });
}
async function scb1ShowTab(tab){
  if(!_scDual||_scb1Busy) return;
  if(tab==='dash'&&appMode==='sc-cho') return;
  if(tab==='cards'&&appMode==='cho') return;
  _scb1Busy=true;
  try{ if(tab==='dash') await scb1OpenDashboard(); else await scb1OpenCards(); }
  catch(e){ console.warn('[SC] tab switch failed',e); showToast('Could not switch — check your connection.','err'); }
  finally{ _scb1Busy=false; scb1SyncTabs(); }
}
async function scb1OpenDashboard(){
  // Push any unsaved card changes before leaving My Cards
  try{ clearTimeout(_scSyncTimer); await scFlushSync(); }catch(e){}
  if(!db){ initFirebase(); await new Promise(function(r){setTimeout(r,800);}); }
  var code=_scDual.code;
  var fac=await fbGet(scFacilityPath(code));
  if(!fac){ await scAlert('This facility could not be found.','Facility Dashboard','⚠️'); return; }
  if(fac.suspended){ await scAlert('This facility is currently suspended. Contact HealSol Academy.','Facility Dashboard','⚠️'); return; }
  // Re-check on every open: still registered here, still the CHO
  var me=(fac.staff||{})[choState.staffMobile];
  if(!me||(me.role||'CHO')!=='CHO'){
    await scAlert('The Facility Dashboard is only for the CHO of this facility.','Facility Dashboard','🔒');
    _scDual=null; return;
  }
  // Older facilities: one-time activation key (same rule as the Facility Admin login)
  if(!fac.accessKeyVerified){
    var v=await scDialog({title:'Activate Facility Dashboard',icon:'🔑',okLabel:'Activate',
      message:'Enter the one-time activation key from HealSol Academy. You will not be asked again.',
      fields:[{key:'ak',label:'Activation key',required:true,placeholder:'Activation key'}]});
    if(!v) return;
    if(typeof NF_SECURE!=='undefined'&&NF_SECURE){ try{ await nfCall('activateFacility',{code:code,key:v.ak}); }catch(e){ await scAlert(e.message||'Invalid activation key.','Activation','❌'); return; } }
    else {
    var pubKey=await fbGet('shared/accesskey_sc');
    if(pubKey&&String(v.ak||'').trim().toUpperCase()!==String(pubKey).toUpperCase()){
      await scAlert('Invalid activation key.','Activation','❌'); return;
    }
    await fbSet(scFacilityPath(code)+'/accessKeyVerified',true);
    }
    fac.accessKeyVerified=true;
  }
  var ws=document.getElementById('welcome-screen');
  _scb1StaffScreen=(ws&&ws.classList.contains('vis'))?'home':'main';
  if(ws) ws.classList.remove('vis');
  document.getElementById('cho-app').classList.remove('vis');
  scSubAdminCode=code; scSubAdminData=fac;
  await scStartChoPanel(code,fac);   // sets appMode='sc-cho', loads roster + readiness
  try{ window.scrollTo(0,0); }catch(e){}
}
async function scb1OpenCards(){
  var panel=document.getElementById('sc-cho-app'); if(panel) panel.classList.remove('vis');
  appMode='cho';
  document.getElementById('cho-app').classList.add('vis');
  // The start date may have been changed on the dashboard
  try{
    var fac=await fbGet(scFacilityPath(choState.facilityCode));
    if(fac&&fac.startDate&&fac.startDate!==choState.startDate){
      choState.startDate=fac.startDate;
      var prog=getProg(choState.progId);
      choState.currentDay=computeCurrentDay(choState.startDate,prog.days);
    }
  }catch(e){}
  if(_scb1StaffScreen==='main') showCHOMain();
  else{
    var nav=document.getElementById('cho-nav'), main=document.getElementById('cho-main');
    if(nav) nav.style.display='none'; if(main) main.style.display='none';
    showWelcomeScreen();
  }
  if(scIsVerifier()){ try{ await scLoadVerifyData(true); scRenderWsVerify(); scUpdateVerifyBadge(); }catch(e){} }
  try{ window.scrollTo(0,0); }catch(e){}
}
function scb1ClearDual(){
  _scDual=null; scSubAdminCode=''; scSubAdminData={}; scSubAdminStaff={};
  var p=document.getElementById('sc-cho-app'); if(p) p.classList.remove('vis');
  document.body.classList.remove('scb1-light','scb1-role-mo','scb1-role-mpw');
  scb1SyncTabs();
}

// ══════════════════════════════════════════════════════════════
// LIGHTER MO / MPW (and "nothing for you today" for all non-CHO staff)
// ══════════════════════════════════════════════════════════════
function scb1Lighten(){
  var role=scb1Role(), light=scb1IsLight();
  document.body.classList.toggle('scb1-light',light);
  document.body.classList.toggle('scb1-role-mo',role==='MO');
  document.body.classList.toggle('scb1-role-mpw',role==='MPW');
  // Guide sections: MO keeps only "About"; MPW keeps "About" + "Scoring Guide"
  [['features',light],['howto',light],['scoring',role==='MO']].forEach(function(x){
    var g=document.getElementById('ws-gt-'+x[0]); var box=g&&g.closest('.ws-guide');
    if(box) box.style.display=x[1]?'none':'';
  });
  var note=document.getElementById('scb1-today-none');
  if(note) note.style.display='none';
  var ws=document.getElementById('welcome-screen');
  if(!ws||!ws.classList.contains('vis')||role==='CHO') return;
  if(wsIsPre()||wsIsComplete()) return;
  var ti=scb1TodayIdx(), n=scb1MyCount(ti);
  var sec=document.getElementById('ws-today-section');
  if(n){
    var meta=document.getElementById('ws-today-meta');
    if(meta&&!meta.querySelector('.scb1-mine'))
      meta.insertAdjacentHTML('afterbegin','<div class="ws-today-chip scb1-mine"><i class="ti ti-user-check" style="font-size:10px;"></i> '+n+' '+scEsc(t('for you'))+'</div>');
  }else{
    if(sec) sec.style.display='none';
    if(!note){
      note=document.createElement('div'); note.id='scb1-today-none'; note.className='scb1-none';
      if(sec&&sec.parentNode) sec.parentNode.insertBefore(note,sec.nextSibling);
    }
    var arr=getDaysArr(choState.progId), next=-1;
    for(var di=ti+1;di<arr.length;di++){ if(scb1MyCount(di)){ next=di; break; } }
    var sub=next>=0
      ? scEsc(t('Your next checkpoints'))+': <b>'+scEsc(t('Day'))+' '+(next+1)+'</b> · '+scEsc(scb1DayDate(next))+' · '+scb1MyCount(next)+' '+scEsc(t('checkpoints'))
      : scEsc(t('No more checkpoints for you in this programme.'));
    if(role==='MO') sub=scEsc(t('Your main task is to verify staff cards.'))+'<br>'+sub;
    note.innerHTML='<div class="scb1-none-t"><i class="ti ti-calendar-off"></i> '+scEsc(t('No checkpoints for you today'))+'</div><div class="scb1-none-s">'+sub+'</div>';
    note.style.display='';
  }
  // MO with no MO-tagged checkpoints anywhere: the main button opens the verification queue
  if(role==='MO'){
    var any=false, a2=getDaysArr(choState.progId);
    for(var j=0;j<a2.length&&!any;j++) if(scb1MyCount(j)) any=true;
    if(!any){
      var btn=document.getElementById('ws-cta-btn'), lbl=document.getElementById('ws-cta-label'), ico=document.getElementById('ws-cta-icon');
      if(btn&&lbl){ btn.className='ws-cta-btn'; lbl.textContent=t('Open cards to verify'); if(ico) ico.className='ti ti-shield-check'; btn.onclick=scOpenVerifyQueue; }
    }
  }
}

// ══════════════════════════════════════════════════════════════
// HOOKS
// ══════════════════════════════════════════════════════════════
(function(){
  // Every staff login: start clean, then decide whether this is a single-login CHO
  var oStart=scStartApp;
  scStartApp=async function(){
    _scDual=null; scSubAdminCode=''; scSubAdminData={}; scSubAdminStaff={};
    var sp=document.getElementById('sc-cho-app'); if(sp) sp.classList.remove('vis');
    var r=await oStart.apply(this,arguments);
    if(scb1Role()==='CHO'&&choState.facilityCode&&choState.staffMobile) _scDual={code:choState.facilityCode};
    scb1RenderWho(); scb1Lighten(); scb1SyncTabs();
    return r;
  };
  var oWs=showWelcomeScreen;
  showWelcomeScreen=function(){ oWs.apply(this,arguments); try{ scb1RenderWho(); scb1Lighten(); scb1SyncTabs(); }catch(e){ console.warn(e); } };
  var oBody=wsRenderBody;
  wsRenderBody=function(){ var r=oBody.apply(this,arguments); try{ scb1Lighten(); }catch(e){} return r; };
  var oUI=updateCHOUI;
  updateCHOUI=function(){ var r=oUI.apply(this,arguments); try{ scb1RenderNavWho(); }catch(e){} return r; };
  var oMain=showCHOMain;
  showCHOMain=function(){
    var r=oMain.apply(this,arguments);
    try{ if(scb1IsLight()&&choState.view==='board') switchView('cards'); scb1SyncTabs(); }catch(e){}
    return r;
  };
  var oLang=setLang;
  setLang=function(){ var r=oLang.apply(this,arguments); try{ scb1RenderWho(); scb1RenderDashWho(); scb1SyncTabs(); }catch(e){} return r; };
  var oPanel=scStartChoPanel;
  scStartChoPanel=async function(){ var r=await oPanel.apply(this,arguments); try{ scb1RenderDashWho(); scb1SyncTabs(); }catch(e){} return r; };

  // Dashboard actions are recorded under the CHO's own name when signed in once
  var oActor=scActor;
  scActor=function(){
    if(appMode==='sc-cho'&&_scDual) return {name:choState.staffName||('CHO · '+scSubAdminCode),role:'Facility Admin',id:scSubAdminCode,mob:choState.staffMobile};
    return oActor.apply(this,arguments);
  };

  // One logout for both tabs
  var oLogout=logoutCHO;
  logoutCHO=async function(){
    if(_scDual&&appMode==='sc-cho'){
      var ok=await showConfirm('Logout and return to login screen?','👋','Logout','Logout','var(--teal)');
      if(!ok) return;
      appMode='cho';
      var realConfirm=showConfirm;
      showConfirm=function(){ return Promise.resolve(true); };  // already confirmed above
      try{ await oLogout.apply(this,arguments); } finally{ showConfirm=realConfirm; }
      scb1ClearDual(); return;
    }
    await oLogout.apply(this,arguments);
    if(document.getElementById('cho-app').classList.contains('vis')) return; // cancelled
    scb1ClearDual();
  };
  var oChoLogout=scChoLogout;
  scChoLogout=async function(){ if(_scDual) return logoutCHO(); return oChoLogout.apply(this,arguments); };

  // The signed-in CHO can't remove their own record; own password change keeps them signed in
  var oRemove=scRemoveStaff;
  scRemoveStaff=async function(mob){
    if(_scDual&&String(mob)===String(choState.staffMobile)){
      await scAlert('You cannot remove yourself while signed in. Ask HealSol Academy if the CHO has changed.','Remove staff','🔒');
      return;
    }
    return oRemove.apply(this,arguments);
  };
  var oPwd=scResetStaffPwd;
  scResetStaffPwd=async function(mob){
    var r=await oPwd.apply(this,arguments);
    try{
      if(_scDual&&String(mob)===String(choState.staffMobile)){
        var np=(scSubAdminStaff[mob]||{}).password;
        var saved=JSON.parse(localStorage.getItem('sc_autologin')||'null');
        if(np&&saved&&saved.mob===choState.staffMobile){ saved.pwd=np; localStorage.setItem('sc_autologin',JSON.stringify(saved)); }
      }
    }catch(e){}
    return r;
  };
})();
