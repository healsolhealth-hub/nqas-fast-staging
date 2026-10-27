
// ══════════════════════════════════════════════════════════════
// SECURE MODE — Firebase Authentication + server functions (the live app)
//  Active whenever the Firebase Auth and Functions libraries are present. Passwords never touch the
//  database or the phone; accounts, resets and sensitive tools run on the server.
// ══════════════════════════════════════════════════════════════
var NF_SECURE=!!(window.firebase&&typeof firebase.auth==='function'&&typeof firebase.functions==='function');
var NF_EMAIL_DOMAIN=NF_APP.emailDomain;
var NF_FN_REGION='asia-south1';
// NF_APPCHECK_SITE_KEY is set next to FIREBASE_CONFIG (it must exist before Firebase starts)
var NF_IDLE_MIN=30;
var _nfAuth=null;                      // { uid, email, claims }
Object.assign(HINDI_UI,{'Set your new password':'अपना नया पासवर्ड बनाएँ','New password':'नया पासवर्ड','Confirm new password':'नया पासवर्ड दोबारा',
  'Save and continue':'सहेजें और आगे बढ़ें','Use at least 8 characters, with letters and numbers.':'कम से कम 8 अक्षर, जिनमें अक्षर और अंक दोनों हों।',
  'The two passwords do not match.':'दोनों पासवर्ड मेल नहीं खाते।','Your sign-in has expired. Tap Back and log in again.':'आपका साइन-इन समाप्त हो गया है। वापस जाएँ और फिर से लॉग इन करें।','Your new password is saved. Tap Back and log in with it.':'आपका नया पासवर्ड सेव हो गया है। वापस जाएँ और उससे लॉग इन करें।','Saving…':'सेव हो रहा है…','Incorrect mobile number / ID or password.':'मोबाइल नंबर / ID या पासवर्ड ग़लत है।',
  'This account is blocked. Contact HealSol Academy.':'यह खाता बंद है। HealSol Academy से संपर्क करें।','Too many attempts. Please wait a few minutes and try again.':'बहुत अधिक प्रयास। कुछ मिनट बाद फिर कोशिश करें।',
  'You are signing in with a temporary password. Choose your own password to continue.':'आप अस्थायी पासवर्ड से लॉग इन कर रहे हैं। आगे बढ़ने के लिए अपना पासवर्ड बनाएँ।',
  'Change my password':'मेरा पासवर्ड बदलें'});

function nfSecureKey(id){ var m=nfMobile(id); if(m) return m; var k=String(id||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,''); return k.length>=3?k:''; }
function nfAuthOK(kind,key){
  if(!NF_SECURE||!_nfAuth) return false; var c=_nfAuth.claims||{}; if(c.mc) return false;
  if(kind==='admin') return c.hs===true;
  if(kind==='supervisor') return !!c.sup&&c.sup===scSupKey(key);
  if(kind==='district') return !!c.dist&&c.dist===scSupKey(key);
  if(kind==='staff'||kind==='champion') return !!c.mob&&c.mob===nfMobile(key);
  return false;
}
function nfFns(){ return firebase.app().functions(NF_FN_REGION); }
function nfErrText(e){ var m=(e&&e.message)||'Something went wrong. Please try again.'; return String(m).replace(/^(FirebaseError|Error):\s*/,''); }
async function nfCall(name,data){ try{ var r=await nfFns().httpsCallable(name)(data||{}); return r.data; }catch(e){ throw new Error(nfErrText(e)); } }

// ── sign-in ────────────────────────────────────────────────────
function nfAuthErr(e){
  var c=(e&&e.code)||'';
  if(/user-disabled/.test(c)) return t('This account is blocked. Contact HealSol Academy.');
  if(/too-many-requests/.test(c)) return t('Too many attempts. Please wait a few minutes and try again.');
  if(/network/.test(c)) return 'No internet connection. Please check and try again.';
  return t('Incorrect mobile number / ID or password.');
}
async function nfSecureSubmit(){
  if(_nfLogin.busy) return;
  var id=((document.getElementById('nf-id')||{}).value||'').trim(), pwd=((document.getElementById('nf-pwd')||{}).value||'');
  nfError('');
  if(!id){ nfError(t('Please enter your mobile number or ID.')); return; }
  if(!pwd){ nfError(t('Please enter your password.')); return; }
  var key=nfSecureKey(id); if(!key){ nfError(t('Incorrect mobile number / ID or password.')); return; }
  _nfLogin.npSaved=false;
  var btn=document.getElementById('nf-btn'); _nfLogin.busy=true; if(btn){ btn.disabled=true; btn.textContent=t('Checking…'); }
  try{
    if(_nfSignOutP){ var sp=_nfSignOutP; _nfSignOutP=null; await nfWithin(sp,3000).catch(function(){}); }   // previous sign-out: wait briefly, never forever
    if(!db){ initFirebase(); await new Promise(function(r){ setTimeout(r,300); }); }
    var remember=(document.getElementById('nf-remember')||{}).checked!==false;
    try{ await firebase.auth().setPersistence(remember?firebase.auth.Auth.Persistence.LOCAL:firebase.auth.Auth.Persistence.SESSION); }catch(e){}
    try{ await nfWithin(firebase.auth().signInWithEmailAndPassword(key+'@'+NF_EMAIL_DOMAIN,pwd),25000); }
    catch(e){ nfError(e&&e.nfTimeout?t('Could not reach the server. Check your internet and try again.'):nfAuthErr(e)); return; }
    nfCoverOn();
    try{ await nfAfterSignIn(); } finally { nfCoverDone(); }
  } finally { _nfLogin.busy=false; if(btn){ btn.disabled=false; btn.textContent=t('Log in'); } }
}
async function nfAfterSignIn(){
  var u=firebase.auth().currentUser; if(!u) return;
  var tok=await u.getIdTokenResult(true);
  _nfAuth={uid:u.uid,email:u.email,claims:tok.claims||{}};
  if(_nfAuth.claims.mc){ nfShowSetPassword(); return; }
  await nfRouteAuthed();
}
async function nfRouteAuthed(){
  var c=_nfAuth.claims, list=[];
  if(c.hs) list.push({kind:'admin',key:'admin',pwd:'',title:'HealSol Admin',sub:'All facilities, setup and content'});
  if(c.sup){ var s=await fbGet('sc_supervisors/'+c.sup); if(s&&!s.disabled) list.push({kind:'supervisor',key:'sup:'+c.sup,id:c.sup,title:'Supervisor',sub:(s.name||c.sup)+' · '+Object.keys(s.facilities||{}).length+' facilities'}); }
  if(c.dist){ var d=await fbGet('sc_district_admins/'+c.dist); if(d&&!d.disabled) list.push({kind:'district',key:'dist:'+c.dist,id:c.dist,title:d.scope==='block'?'Block view · '+(d.block||d.chcName||'Block'):'District Admin',sub:(d.name||c.dist)+(d.scope==='block'?' · MOIC · every facility of the block, view only':' · view readiness and reports')}); }
  if(c.view){ var vw=await fbGet('sc_viewers/'+c.view); if(vw&&!vw.disabled) list.push({kind:'viewer',key:'view:'+c.view,id:c.view,rec:vw,title:vw.kind==='state'?'State dashboard':'Partner dashboard',sub:(vw.name||c.view)+(vw.org?' · '+vw.org:'')+' · view only'}); }
  if(c.mob){
    var idx=await fbGet('sc_staff_index/'+c.mob)||{};
    for(var code in idx){ var rec=await fbGet(scStaffPath(code,c.mob)); if(!rec||rec.disabled) continue; var fname=await fbGet(scFacilityPath(code)+'/name');
      var ftype=nfTypeOf({type:await fbGet(scFacilityPath(code)+'/type')});
      list.push({kind:'staff',key:'staff:'+code,code:code,type:ftype,title:(rec.role||NF_LEVELS[ftype].inCharge)+' · '+(fname||code),sub:(rec.name||'')+' · '+code}); }
    var ch=await fbGet('sc_champions/'+c.mob); if(ch&&!ch.disabled) list.push({kind:'champion',key:'champ:'+c.mob,mob:c.mob,title:'Quality Champion',sub:(ch.name||c.mob)+' · '+Object.keys(ch.facilities||{}).length+' facilities'});
  }
  try{ if(typeof nfMoAddEntry==='function') list=nfMoAddEntry(list,c.mob); }catch(e){}
  _nfLogin.id=c.mob||c.sup||c.dist||c.view||'healsol'; _nfLogin.pwd='__auth__'; _nfLogin.matches=list;
  if(!list.length){ nfError('Your account has no active role. Contact HealSol Academy.'); _nfAuth=null; try{ await firebase.auth().signOut(); }catch(e){} return; }
  if(list.length===1){ await nfGo(list[0],'__auth__'); return; }
  // a switch asked for inside the app (CHC MOIC: My block ⇄ My CHC) opens that entry once after the reload (27 Oct)
  var sw=''; try{ sw=sessionStorage.getItem('nf_role_switch')||''; sessionStorage.removeItem('nf_role_switch'); }catch(e){}
  var swPick=sw&&list.find(function(a){ return a.key===sw; }); if(swPick){ await nfGo(swPick,'__auth__'); return; }
  var rem=nfRememberedKey(_nfLogin.id), pick=list.find(function(a){ return a.key===rem; });
  if(pick){ await nfGo(pick,'__auth__'); return; }
  nfShowRoles(list);
}
// first login / after a reset: the person chooses their own password
function nfShowSetPassword(){
  var f=document.getElementById('nf-l-form'), r=document.getElementById('nf-l-roles'); if(!f||!r) return;
  f.style.display='none'; r.style.display='';
  r.innerHTML='<div class="nf-l-hi">'+scEsc(t('Set your new password'))+' <span class="nf-l-namaste">🔐</span></div>'
    +'<div class="nf-l-sub">'+scEsc(t('You are signing in with a temporary password. Choose your own password to continue.'))+'</div>'
    +'<label class="nf-l-lbl" for="nf-np1">'+scEsc(t('New password'))+'</label><div class="nf-l-in"><i class="ti ti-lock"></i><input id="nf-np1" type="password" autocomplete="new-password"></div>'
    +'<label class="nf-l-lbl" for="nf-np2">'+scEsc(t('Confirm new password'))+'</label><div class="nf-l-in"><i class="ti ti-lock"></i><input id="nf-np2" type="password" autocomplete="new-password" onkeydown="if(event.key===\'Enter\')nfSaveNewPassword()"></div>'
    +'<div class="nf-l-rem">'+scEsc(t('Use at least 8 characters, with letters and numbers.'))+'</div>'
    +'<div class="nf-l-err" id="nf-err3" role="alert"></div>'
    +'<button type="button" class="nf-l-btn" id="nf-np-btn" onclick="nfSaveNewPassword()">'+scEsc(t('Save and continue'))+'</button>'
    +'<button type="button" class="nf-l-back" style="margin-top:10px;" onclick="nfSecureSignOut();nfBack()"><i class="ti ti-arrow-left"></i> '+scEsc(t('Back'))+'</button>';
}
async function nfSaveNewPassword(){
  var a=(document.getElementById('nf-np1')||{}).value||'', b=(document.getElementById('nf-np2')||{}).value||'', err=document.getElementById('nf-err3'), btn=document.getElementById('nf-np-btn');
  var show=function(m){ if(err){ err.textContent=m; err.style.display=m?'block':'none'; } };
  if(a.length<8||!/[A-Za-z]/.test(a)||!/[0-9]/.test(a)) return show(t('Use at least 8 characters, with letters and numbers.'));
  if(a!==b) return show(t('The two passwords do not match.'));
  if(_nfLogin.npSaved) return show(t('Your new password is saved. Tap Back and log in with it.'));
  if(!firebase.auth().currentUser||!_nfAuth) return show(t('Your sign-in has expired. Tap Back and log in again.'));
  show(''); if(btn){ btn.disabled=true; btn.textContent=t('Saving…'); }
  var email=_nfAuth&&_nfAuth.email, saved=false;
  try{
    await nfCall('setNewPassword',{newPassword:a}); saved=true;
    await firebase.auth().signInWithEmailAndPassword(email,a);    // old sessions were signed out by the server
    await nfAfterSignIn();
  }catch(e){
    if(saved){ _nfLogin.npSaved=true; show(t('Your new password is saved. Tap Back and log in with it.')); }   // never ask to save it twice
    else show(nfErrText(e));
  }
  finally{ if(btn){ btn.disabled=false; btn.textContent=t('Save and continue'); } }
}
var _nfSignOutP=null;
function nfLoginSwitched(other){
  if(document.getElementById('nf-switch-ov')) return;
  var c=(_nfAuth&&_nfAuth.claims)||{}, who=c.mob||c.sup||(c.hs?'HealSol admin':'')||'';
  _nfAuth=null;
  var ov=document.createElement('div'); ov.id='nf-switch-ov';
  ov.setAttribute('style','position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.6);display:flex;align-items:center;justify-content:center;padding:20px;');
  ov.innerHTML='<div role="alertdialog" aria-modal="true" style="background:#fff;border-radius:20px;max-width:380px;width:100%;padding:22px;font-family:inherit;box-shadow:0 20px 50px rgba(0,0,0,.3);">'
    +'<div style="font-size:17px;font-weight:700;margin-bottom:8px;color:#0F172A;">'+(other?'Someone else logged in':'You were logged out')+'</div>'
    +'<div style="font-size:13.5px;line-height:1.5;color:#475569;margin-bottom:16px;">'+(other?'A different login was used in another window or tab of this browser'+(who?' (this window was '+scEsc(String(who))+')':'')+'. One browser keeps only one login, so this window has stopped to avoid saving work under the wrong name.<br><br>To test several people at once, use a different browser (or a different Chrome profile) for each.':'This browser was logged out in another window or tab.')+'</div>'
    +'<button type="button" id="nf-switch-go" style="width:100%;min-height:46px;border:0;border-radius:14px;background:#1E6B5E;color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer;">Reload</button></div>';
  document.body.appendChild(ov);
  document.getElementById('nf-switch-go').onclick=function(){ location.reload(); };
  try{ if(typeof db!=='undefined'&&db) db.goOffline(); }catch(e){}   // nothing more is sent from this window
}
function nfSecureSignOut(){ _nfAuth=null; try{ nfSetLevel(NF_LEVEL_DEFAULT); }catch(e){}
  ['nf-id','nf-pwd'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; }); nfError(''); _nfSignOutP=(async function(){ try{ await firebase.auth().signOut(); }catch(e){} })(); return _nfSignOutP; }
// change my own password (re-confirms the current one)
async function nfChangeMyPassword(){
  if(!NF_SECURE||!firebase.auth().currentUser) return;
  var v=await scDialog({title:t('Change my password'),icon:'🔐',okLabel:t('Save and continue'),fields:[
    {key:'cur',label:'Current password',type:'password',required:true},{key:'np',label:t('New password'),type:'password',required:true},{key:'np2',label:t('Confirm new password'),type:'password',required:true}],
    validate:function(v){ if(v.np.length<8||!/[A-Za-z]/.test(v.np)||!/[0-9]/.test(v.np)) return t('Use at least 8 characters, with letters and numbers.'); if(v.np!==v.np2) return t('The two passwords do not match.'); return null; }});
  if(!v) return;
  var u=firebase.auth().currentUser;
  try{ await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,v.cur)); await u.updatePassword(v.np); showToast('Password changed.','ok'); }
  catch(e){ showToast(/wrong-password|invalid-credential/.test(e.code||'')?'Current password is incorrect.':nfErrText(e),'err'); }
}

// ── temporary password dialog (shown once) ─────────────────────
// Copy that also works inside an embedded page (thehealsol.com, One HealSol), where the clipboard API is often blocked
function nfCopyText(text,selectEl){
  var done=function(){ showToast('Copied — paste it in WhatsApp or SMS.','ok'); };
  var fallback=function(){
    var ok=false;
    try{ var ta=document.createElement('textarea'); ta.value=text; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
      document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,text.length); ok=document.execCommand('copy'); ta.remove(); }catch(e){ ok=false; }
    if(ok) return done();
    try{ if(selectEl){ var r=document.createRange(); r.selectNodeContents(selectEl); var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(r); } }catch(e){}
    showToast('Copying is blocked here — the password is selected: press Ctrl+C (or long-press → Copy).','');
  };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,fallback); return; } }catch(e){}
  fallback();
}
function nfShowTempPassword(name,identifier,pw,title){
  if(!pw){ showToast((name||identifier)+' already has an account — they keep their own password.','ok'); return; }
  var mob=nfMobile(identifier), msg='NQAS | FAST login for '+(name||identifier)+'\nMobile/ID: '+identifier+'\nTemporary password: '+pw+'\nYou will choose your own password at first login.';
  var ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-tmp-ov';
  ov.innerHTML='<div class="scx-box"><div class="nfcf-head"><span style="font-size:22px;">🔑</span><div style="flex:1;"><b>'+scEsc(title||'Temporary password')+'</b><div style="font-size:11.5px;color:var(--t3);">Shown only once — share it now by phone or WhatsApp</div></div></div>'
    +'<div class="nf-tmp"><div><small>Name</small><b>'+scEsc(name||'')+'</b></div><div><small>Mobile / ID</small><b>'+scEsc(identifier)+'</b></div><div><small>Temporary password</small><b class="pw">'+scEsc(pw)+'</b></div></div>'
    +'<div class="nf-tmp-note">They log in with it once and must then choose their own password. Nobody — not even HealSol — can see passwords afterwards.</div>'
    +'<div class="nf-tmp-acts"><button class="scx-btn ghost" id="nf-tmp-copy">Copy</button>'+'<a class="scx-btn" target="_blank" rel="noopener" href="https://wa.me/'+(mob?'91'+mob:'')+'?text='+encodeURIComponent(msg)+'">WhatsApp</a>'+'<button class="scx-btn" id="nf-tmp-done">Done</button></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#nf-tmp-copy').onclick=function(){ nfCopyText(msg,ov.querySelector('.nf-tmp .pw')); };
  ov.querySelector('#nf-tmp-done').onclick=function(){ ov.remove(); };
}

// ── screens that change in secure mode ─────────────────────────
(function(){
  if(!NF_SECURE) return;
  document.documentElement.classList.add('nf-secure');
  nfStartAppCheck();   // no-op until Firebase has started; initFirebase() starts App Check
  nfSubmit=nfSecureSubmit;
  // automatic sign-in on return visits (Remember me), never with a stored password
  window.addEventListener('load',function(){
    try{ if(!db) initFirebase(); }catch(e){}
    var done=false;
    firebase.auth().onAuthStateChanged(function(u){ if(done||!u) return; done=true;
      if(_nfLogin.busy) return;                       // a login from the form is already opening the screen
      var ls=document.getElementById('login-screen'); if(ls&&ls.style.display==='none') return;
      nfCoverOn(); nfAfterSignIn().catch(function(e){ console.warn('[SC] auto sign-in',e); }).then(nfCoverDone); });
    if(location.hash==='#setup') setTimeout(nfShowBootstrap,400);
    // one browser keeps one login for all its windows and tabs (Incognito windows share one too): if someone logs in as another
    // person, or logs out, in another window, this window stops at once instead of acting under the wrong name
    firebase.auth().onAuthStateChanged(function(u){
      if(!_nfAuth||_nfLogin.busy) return;                 // not signed in here yet, or this window is logging in itself
      if(u&&u.uid===_nfAuth.uid) return;                  // same person (token refresh, password change)
      nfLoginSwitched(!!u);
    });
  });
  // sign out of Firebase whenever someone logs out
  ['logoutCHO','logoutAdmin','scqLogout','scChoLogout'].forEach(function(fn){ var o=window[fn]; if(typeof o!=='function') return;
    window[fn]=function(){ var r=o.apply(this,arguments); Promise.resolve(r).then(function(){ var ls=document.getElementById('login-screen'); if(!ls||ls.style.display!=='none') nfSecureSignOut(); }); return r; }; });
  // CHO roster
  scSaveNewStaff=async function(){
    var roleId=(document.getElementById('sc-add-role-id')||{}).value||'', name=((document.getElementById('sc-add-name')||{}).value||'').trim(), mob=((document.getElementById('sc-add-mob')||{}).value||'').trim(), errEl=document.getElementById('sc-add-err');
    var bad=function(m){ errEl.textContent=m; errEl.style.display='block'; };
    if(!name) return bad('Name is required.'); if(!/^\d{10}$/.test(mob)) return bad('Enter a valid 10-digit mobile number.');
    if(scSubAdminStaff[mob]&&!scSubAdminStaff[mob].disabled) return bad('This mobile number is already registered.');
    try{ var r=await nfCall('createAccount',{kind:'staff',code:scSubAdminCode,role:roleId,mobile:mob,name:name});
      scSubAdminStaff[mob]={name:name,mobile:mob,role:roleId,addedAt:scNowIso()}; scCloseAddStaff(); scRenderChoStaff(); nfShowTempPassword(name,r.identifier,r.tempPassword,name+' added'); }
    catch(e){ bad(nfErrText(e)); }
  };
  scResetStaffPwd=async function(mob){
    var s=scSubAdminStaff[mob]||{};
    if(_scDual&&String(mob)===String(choState.staffMobile)){ nfChangeMyPassword(); return; }
    if(!await showConfirm('Give '+(s.name||mob)+' a new temporary password? They will be signed out and must choose a new password at their next login.','🔑','Reset password','Reset','var(--teal)')) return;
    try{ var r=await nfCall('resetPassword',{identifier:mob,code:scSubAdminCode}); nfShowTempPassword(s.name||mob,r.identifier,r.tempPassword,'Password reset'); }catch(e){ showToast(nfErrText(e),'err'); }
  };
  scRemoveStaff=async function(mob){
    if(_scDual&&String(mob)===String(choState.staffMobile)){ await scAlert('You cannot remove yourself while signed in. Ask HealSol Academy if the CHO has changed.','Remove staff','🔒'); return; }
    if(!await showConfirm('Remove this staff member? Their history is kept; they can no longer log in to this facility.','🗑️','Remove','Remove','var(--red-dk)')) return;
    try{ await nfCall('removeStaff',{code:scSubAdminCode,mobile:mob}); delete scSubAdminStaff[mob]; scRenderChoStaff(); showToast('Staff member removed.','ok'); }catch(e){ showToast(nfErrText(e),'err'); }
  };
  var oRoster=scRenderChoStaff;
  function nfCleanRoster(){ try{ document.querySelectorAll('[onclick^="scResetStaffPwd"]').forEach(function(b){ if(!/Reset password/.test(b.textContent)) b.innerHTML='<i class="ti ti-key" style="font-size:9px;"></i> Reset password'; });
      document.querySelectorAll('div').forEach(function(d){ if(d.children.length===0&&/🔑 Pwd:/.test(d.textContent)) d.textContent=d.textContent.replace(/\s*·\s*🔑 Pwd:.*$/,''); }); }catch(e){} }
  scRenderChoStaff=function(){ var r=oRoster.apply(this,arguments); nfCleanRoster(); Promise.resolve(r).then(nfCleanRoster); setTimeout(nfCleanRoster,0); return r; };
  var oOpenAdd=scOpenAddStaff;
  scOpenAddStaff=function(){ var r=oOpenAdd.apply(this,arguments); var p=document.getElementById('sc-add-pwd'); if(p){ var w=p.parentNode; p.style.display='none'; [].forEach.call(w.children,function(ch){ if(ch.tagName==='LABEL'&&/pass/i.test(ch.textContent)) ch.style.display='none'; }); } return r; };
  // HealSol: staff password reset, enrolment, access key, reset tool
  scAdminResetPwd=async function(code,mob){
    var s=((scMasterFacilities[code]||{}).staff||{})[mob]||{};
    if(!await showConfirm('Give '+(s.name||mob)+' a new temporary password? They will be signed out everywhere.','🔑','Reset password','Reset','var(--teal)')) return;
    try{ var r=await nfCall('resetPassword',{identifier:mob,code:code}); nfShowTempPassword(s.name||mob,r.identifier,r.tempPassword,'Password reset'); }catch(e){ showToast(nfErrText(e),'err'); }
  };
  scEnrollFacility=async function(){
    var g=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); };
    var name=g('sc-enroll-name'), state=g('sc-enroll-state'), district=g('sc-enroll-district'), choName=g('sc-enroll-choname'), choMob=g('sc-enroll-chomob').replace(/\D/g,''), progId=(document.getElementById('sc-enroll-prog')||{}).value||'';
    if(!name){ showToast('Enter the facility name.','err'); return; }
    if(!state||!district){ showToast('Choose the state and district — the Facility ID is made from them.','err'); return; }
    var ftype0=(document.getElementById('sc-enroll-type')||{}).value||'sc', inLab=(NF_LEVELS[ftype0]||NF_LEVELS.sc).inChargeLabel;
    if(!/^\d{10}$/.test(choMob)){ showToast('Enter the '+inLab+'\'s 10-digit mobile number.','err'); return; }
    var access=(document.querySelector('input[name="enroll-access"]:checked')||{}).value||'contract';
    var btn=document.querySelector('[onclick="scEnrollFacility()"]'), old=btn?btn.innerHTML:'';
    if(btn){ btn.disabled=true; btn.innerHTML='Enrolling…'; }
    try{
      var ftype=(document.getElementById('sc-enroll-type')||{}).value||'sc';
      var off=typeof nfEnrollDeptsOff==='function'?nfEnrollDeptsOff():[];
      var kind=ftype==='chc'?((document.querySelector('input[name="nf-chc-kind"]:checked')||{}).value||'fru'):'';
      var r=await nfCall('enrollFacility',{type:ftype,name:name,state:state,district:district,progId:progId,choName:choName||inLab,choMobile:choMob,access:access,nin:g('sc-enroll-nin'),chcKind:kind||undefined});
      if(off.length){ var up={}; off.forEach(function(d){ up[d]={off:true}; }); try{ await db.ref(scFacilityPath(r.code)+'/depts').update(up); }catch(e){ showToast('Enrolled — switch off '+off.join(', ')+' in its Set-up.','err'); } }
      ['sc-enroll-name','sc-enroll-district','sc-enroll-choname','sc-enroll-chomob','sc-enroll-nin'].forEach(function(id){ var el=document.getElementById(id); if(el) el.value=''; });
      var full=document.getElementById('enroll-access-full'); if(full){ full.checked=true; try{ enrollAccessToggle(); }catch(e){} }
      try{ var dsel=document.getElementById('sc-enroll-district'); if(dsel) dsel.value=''; nfEnrollTypeChanged(document.getElementById('sc-enroll-type')); }catch(e){}
      if(r.tempPassword) nfShowTempPassword(choName||inLab,r.identifier,r.tempPassword,name+' enrolled as '+r.code+' — '+inLab+' login');
      else await scAlert(name+' is enrolled as '+r.code+'. The '+inLab+' ('+r.identifier+') already has a login — they use their existing password.','Facility enrolled','✅');
      showToast('Enrolled: '+r.code,'ok');
    }catch(e){ showToast(nfErrText(e),'err'); }
    finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } }
    try{ await scLoadMasterData(); scRenderMasterDashboard(); }catch(e){}
  };
  // State list and district suggestions on the enrol form (same list as self-registration)
  window.nfEnrollPrepare=function(){
    var st=document.getElementById('sc-enroll-state'); if(!st||typeof NF_STATE_LIST==='undefined') return;
    var fill=function(){ var d=document.getElementById('sc-enroll-district'); if(!d) return; var c=(NF_STATE_LIST.find(function(x){ return x[0]===st.value; })||[])[1];
      if(d.tagName==='SELECT') d.innerHTML='<option value="">Choose a district…</option>'+(NF_DISTRICTS[c]||[]).map(function(n){ return '<option value="'+n+'">'+n+'</option>'; }).join(''); };
    if(!st.options.length){ st.innerHTML=NF_STATE_LIST.map(function(x){ return '<option value="'+x[0]+'"'+(x[1]==='UP'?' selected':'')+'>'+x[0]+'</option>'; }).join(''); fill();
      st.onchange=fill; }
    var ty=document.getElementById('sc-enroll-type'); if(ty&&!ty.__nfInit){ ty.__nfInit=true; try{ nfEnrollTypeChanged(ty); }catch(e){} }
  };
  (function(){ var oA=nfAdminApply; nfAdminApply=function(){ try{ nfEnrollPrepare(); }catch(e){} return oA.apply(this,arguments); }; })();
  scAdminSetAccessKey=async function(){
    var key=((document.getElementById('sc-ak-input')||{}).value||'').trim(); if(!key){ showToast('Enter a key.','err'); return; }
    try{ await nfCall('setAccessKey',{key:key}); showToast(NF_CFG.short+' access key set.','ok'); }catch(e){ showToast(nfErrText(e),'err'); }
  };
  scResetProgress=async function(){
    if(appMode!=='sc-admin') return; var opts=_scFacilityOptions(); if(!opts.length){ await scAlert('No facilities enrolled.','Reset progress','ℹ️'); return; }
    var v=await scDialog({title:'Reset progress',icon:'🧹',wide:true,okLabel:'Reset now',okColor:'var(--red)',
      message:'Deletes the scores, MoV ticks, checkpoint history and verifications of the chosen facilities. Facilities, staff, logins and the Checkpoint Master are kept.',
      fields:[{key:'codes',label:'Facilities',type:'checklist',value:[],options:opts},
        {key:'also',label:'Also delete',type:'checklist',value:[],options:[{value:'actions',label:'Corrective actions'},{value:'sessions',label:'Peer review sessions of these facilities'}]},
        {key:'confirm',label:'Type RESET to confirm',required:true,placeholder:'RESET'}],
      validate:function(v){ if(!v.codes.length) return 'Choose at least one facility.'; if(String(v.confirm).trim()!=='RESET') return 'Type RESET (capital letters) to confirm.'; return null; }});
    if(!v) return;
    try{ var r=await nfCall('resetProgress',{codes:v.codes,includeActions:v.also.indexOf('actions')>=0,includeSessions:v.also.indexOf('sessions')>=0}); showToast('Progress reset for '+r.count+' facilit'+(r.count===1?'y':'ies')+'.','ok'); }
    catch(e){ showToast(nfErrText(e),'err'); }
    try{ await scLoadMasterData(); scRenderMasterDashboard(); }catch(e){}
  };
  // HealSol editors (Supervisor, District Admin, Champion): no password fields; sign-in created by the server
  var oDlg=scDialog;
  scDialog=function(o){ if(o&&Array.isArray(o.fields)&&o.fields.some(function(f){ return f&&f.key==='password'; })){ o=Object.assign({},o,{fields:o.fields.filter(function(f){ return !(f&&f.key==='password'); })}); } return oDlg.call(this,o); };
  [['scEditSupervisor','supervisor',function(){ return _scSupervisors; }],['scEditDistrict','district',function(){ return _scDistricts; }],['scqEditChampion','champion',function(){ return _scq.champions; }]].forEach(function(x){
    var o=window[x[0]]; if(typeof o!=='function') return;
    window[x[0]]=async function(){ var before=Object.keys(x[2]()||{}); var r=await o.apply(this,arguments);
      var after=x[2]()||{}, added=Object.keys(after).filter(function(k){ return before.indexOf(k)<0; });
      for(var i=0;i<added.length;i++){ try{ var p=await nfCall('provisionAccount',{kind:x[1],key:added[i]}); nfShowTempPassword((after[added[i]]||{}).name,p.identifier,p.tempPassword,'Login created'); }catch(e){ showToast('Saved, but the login failed: '+nfErrText(e),'err'); } }
      return r; };
  });
  [['scRemoveSupervisor','supervisor',function(){ return _scSupervisors; },function(){ scRenderSupervisorAdmin(); },'Supervisor'],
   ['scRemoveDistrict','district',function(){ return _scDistricts; },function(){ scRenderDistrictAdmin(); },'District Admin'],
   ['scqRemoveChampion','champion',function(){ return _scq.champions; },function(){ scqRenderChampionAdmin(); },'Quality Champion']].forEach(function(x){
    window[x[0]]=async function(id){ var rec=(x[2]()||{})[id]; if(!rec) return;
      if(!await showConfirm('Remove '+x[4]+' "'+(rec.name||id)+'"? They will no longer be able to log in.','🗑️','Remove '+x[4],'Remove','var(--red)')) return;
      try{ await nfCall('removeAccount',{kind:x[1],key:id}); delete x[2]()[id]; x[3](); showToast(x[4]+' removed.','ok'); }catch(e){ showToast(nfErrText(e),'err'); } };
  });
  window.nfResetAccount=async function(kind,id,name){
    if(!await showConfirm('Give '+(name||id)+' a new temporary password? They will be signed out everywhere.','🔑','Reset password','Reset','var(--teal)')) return;
    try{ var r=await nfCall('resetPassword',{identifier:id}); nfShowTempPassword(name||id,r.identifier,r.tempPassword,'Password reset'); }catch(e){ showToast(nfErrText(e),'err'); }
  };
  [['scRenderSupervisorAdmin','scEditSupervisor','supervisor',function(){ return _scSupervisors; }],['scRenderDistrictAdmin','scEditDistrict','district',function(){ return _scDistricts; }],['scqRenderChampionAdmin','scqEditChampion','champion',function(){ return _scq.champions; }]].forEach(function(x){
    var o=window[x[0]]; if(typeof o!=='function') return;
    window[x[0]]=function(){ var r=o.apply(this,arguments);
      try{ document.querySelectorAll('[onclick^="'+x[1]+'"]').forEach(function(b){ if(b.nextElementSibling&&b.nextElementSibling.classList.contains('nf-rst')) return; var id=(/\('([^']+)'/.exec(b.getAttribute('onclick'))||[])[1]; if(!id) return;
        var rec=(x[3]()||{})[id]||{}; var k=document.createElement('button'); k.className=b.className+' nf-rst'; k.title='Reset password'; k.innerHTML='<i class="ti ti-key"></i>'; k.style.cssText=b.getAttribute('style')||'';
        k.onclick=function(ev){ ev.stopPropagation(); nfResetAccount(x[2],id,rec.name); }; b.parentNode.insertBefore(k,b.nextSibling); }); }catch(e){}
      return r; };
  });
  // public forms
  phcSubmitDemoSignup=async function(){
    var g=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); }, errEl=document.getElementById('demo-signup-err'), btn=document.querySelector('#demo-signup-body .fc-add-btn');
    if(errEl) errEl.style.display='none';
    if(!g('demo-fac-name')||!g('demo-fac-state')||!g('demo-fac-district')||!g('demo-contact-name')||!/^\d{10}$/.test(g('demo-contact-mobile'))){ if(errEl){ errEl.textContent=nfRegT('Please fill all fields marked * (mobile: 10 digits).'); errEl.style.display='block'; } return; }
    if(btn){ btn.disabled=true; btn.innerHTML=nfRegT('Registering…'); }
    try{ var r=await nfCall('demoSignup',{type:NF_CFG.id,name:g('demo-fac-name'),district:g('demo-fac-district'),state:g('demo-fac-state'),progId:(document.getElementById('demo-fac-pkg')||{}).value||'nqas_12A',contactName:g('demo-contact-name'),mobile:g('demo-contact-mobile')});
      var body=document.getElementById('demo-signup-body');
      if(body) body.innerHTML='<div style="text-align:center;padding:10px 0;"><div style="font-size:40px;margin-bottom:10px;">🎉</div><div style="font-size:15px;font-weight:800;margin-bottom:6px;">'+nfRegT('Your facility is registered!')+'</div>'
        +'<div style="font-size:12px;color:var(--t3);margin-bottom:14px;">'+nfRegT('Facility ID')+' <b>'+scEsc(r.code)+'</b>. '+nfRegT('Log in with your mobile number and this temporary password — you will then choose your own.')+'</div>'
        +'<div class="nf-tmp"><div><small>Mobile</small><b>'+scEsc(r.identifier)+'</b></div><div><small>Temporary password</small><b class="pw">'+scEsc(r.tempPassword||'')+'</b></div></div>'
        +'<button class="fc-add-btn" style="width:100%;padding:12px;border-radius:10px;font-size:13px;margin-top:12px;" onclick="phcCloseDemoSignup();var i=document.getElementById(\'nf-id\');if(i)i.value=\''+r.identifier+'\';var p=document.getElementById(\'nf-pwd\');if(p)p.focus();">'+nfRegT('Log in now')+'</button></div>';
    }catch(e){ if(errEl){ errEl.textContent=nfErrText(e); errEl.style.display='block'; } if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-check" style="font-size:14px;"></i> '+nfRegT('Register'); } }
  };
  phcSubmitLead=async function(){
    var g=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); }, errEl=document.getElementById('lead-signup-err'), btn=document.querySelector('#lead-signup-body .fc-add-btn');
    if(errEl) errEl.style.display='none';
    if(!g('lead-org-name')||!g('lead-state')||!g('lead-contact-name')||!/^\d{10}$/.test(g('lead-contact-mobile'))){ if(errEl){ errEl.textContent=nfRegT('Please fill all fields marked * (mobile: 10 digits).'); errEl.style.display='block'; } return; }
    if(btn){ btn.disabled=true; btn.innerHTML=nfRegT('Submitting…'); }
    try{ await nfCall('submitEnquiry',{orgName:g('lead-org-name'),state:g('lead-state'),district:g('lead-district'),contactName:g('lead-contact-name'),mobile:g('lead-contact-mobile'),facilityCount:g('lead-fac-count')});
      var body=document.getElementById('lead-signup-body'); if(body) body.innerHTML='<div style="text-align:center;padding:16px 0;"><div style="font-size:40px;">✅</div><div style="font-size:15px;font-weight:800;margin:8px 0;">Thank you — we will contact you soon.</div></div>'; }
    catch(e){ if(errEl){ errEl.textContent=nfErrText(e); errEl.style.display='block'; } if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-send" style="font-size:14px;"></i> '+nfRegT('Submit Enquiry'); } }
  };
  // inactivity sign-out on dashboards
  var last=Date.now(); ['click','keydown','mousemove','touchstart','scroll'].forEach(function(ev){ window.addEventListener(ev,function(){ last=Date.now(); },{passive:true}); });
  setInterval(function(){ if(['sc-admin','sc-supervisor','sc-champion'].indexOf(appMode)<0) return; if(Date.now()-last<NF_IDLE_MIN*60000) return; last=Date.now();
    showToast('Signed out after '+NF_IDLE_MIN+' minutes without activity.','');
    try{ if(appMode==='sc-champion') scqLogout(true); else logoutAdmin(); }catch(e){} nfSecureSignOut(); },60000);
})();

// ── HealSol Security panel (Setup): HealSol Admins + go-live migration ──
async function nfRenderSecurityPanel(){
  if(!NF_SECURE||appMode!=='sc-admin') return;
  var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-sec-panel'); if(!box){ box=document.createElement('div'); box.id='nf-sec-panel'; box.dataset.nfv='setup'; box.className='sc-panel'; main.appendChild(box); }
  var admins=await fbGet('sc_healsol_admins')||{}, mig=await fbGet('shared/security_migrated');
  box.innerHTML='<div class="nfs-card"><h3><i class="ti ti-shield-lock"></i> HealSol Admins</h3><div class="nfs-sub">Each HealSol person has their own login; the audit log shows who did what.</div>'
    +Object.keys(admins).map(function(k){ var a=admins[k]||{}; return '<div class="nfs-row"><b>'+scEsc(a.name||k)+'</b><span>'+scEsc(k)+'</span>'
      +'<button class="scx-btn sm ghost" onclick="nfResetAccount(\'healsol\',\''+scJs(k)+'\',\''+scJs(a.name||k)+'\')"><i class="ti ti-key"></i> Reset password</button>'
      +'<button class="scx-btn sm ghost" onclick="nfRemoveHealsol(\''+scJs(k)+'\')"><i class="ti ti-trash"></i></button></div>'; }).join('')
    +'<button class="scx-btn" onclick="nfAddHealsol()"><i class="ti ti-user-plus"></i> Add HealSol Admin</button>'
    +'<button class="scx-btn ghost" onclick="nfChangeMyPassword()"><i class="ti ti-lock"></i> Change my password</button></div>'
    +'<div class="nfs-card"><h3><i class="ti ti-database-export"></i> Security migration (once, at go-live)</h3>'
    +(mig?'<div class="nfs-ok">✓ Completed '+scEsc(scFmtDate(mig))+'. All logins now use secure accounts; no passwords are stored in the database.</div>'
       :'<div class="nfs-sub">Creates a secure login for every staff member, CHO, Supervisor, District Admin and Champion, removes all stored passwords, and deletes test facilities that have no CHO. Run the preview first.</div>'
        +'<button class="scx-btn ghost" onclick="nfMigrate(true)">Preview (changes nothing)</button><button class="scx-btn" style="background:var(--red-dk)" onclick="nfMigrate(false)">Run migration</button>')
    +'<div id="nf-mig-out"></div></div>';
}
async function nfAddHealsol(){
  var v=await scDialog({title:'Add HealSol Admin',icon:'🛡️',fields:[{key:'id',label:'Login ID (letters, at least 3)',required:true,placeholder:'e.g. ravi'},{key:'name',label:'Full name',required:true}]}); if(!v) return;
  try{ var r=await nfCall('createAccount',{kind:'healsol',id:v.id,name:v.name}); nfShowTempPassword(v.name,r.identifier,r.tempPassword,'HealSol Admin added'); nfRenderSecurityPanel(); }catch(e){ showToast(nfErrText(e),'err'); }
}
async function nfRemoveHealsol(id){
  if(!await showConfirm('Remove HealSol Admin "'+id+'"? They will no longer be able to log in.','🗑️','Remove','Remove','var(--red)')) return;
  try{ await nfCall('removeAccount',{kind:'healsol',key:id}); showToast('Removed.','ok'); nfRenderSecurityPanel(); }catch(e){ showToast(nfErrText(e),'err'); }
}
async function nfMigrate(dry){
  if(!dry&&!await showConfirm('Run the security migration now? Every person gets a new temporary password (shown once, here). Test facilities without a CHO are deleted.','⚠️','Run migration','Run','var(--red)')) return;
  var out=document.getElementById('nf-mig-out'); if(out) out.innerHTML='<div class="nfs-sub">Working…</div>';
  try{ var r=await nfCall('migrateAccounts',{dryRun:dry}); window._nfMigLast=r;
    var rows=r.accounts.map(function(a){ return '<tr><td>'+scEsc(a.name||'')+'</td><td>'+scEsc(a.identifier)+'</td><td>'+scEsc(a.roles.join(' · '))+'</td>'+(dry?'':'<td class="pw">'+scEsc(a.tempPassword||'(kept own)')+'</td>')+'</tr>'; }).join('');
    out.innerHTML=(dry?'<div class="nfs-sub"><b>Preview</b> — nothing has changed yet.</div>':'<div class="nfs-ok">✓ Migration complete. Share each temporary password now — this list is shown only once.</div><button class="scx-btn ghost" onclick="nfMigCsv()"><i class="ti ti-download"></i> Download list (CSV)</button>')
      +'<div class="nfs-sub">'+r.accounts.length+' logins · '+r.deletedFacilities.length+' test facilit'+(r.deletedFacilities.length===1?'y':'ies')+' without a CHO'+(dry?' to delete':' deleted')+(r.deletedFacilities.length?': '+r.deletedFacilities.map(function(d){ return scEsc(d.name); }).join(', '):'')+(r.skipped.length?' · '+r.skipped.length+' roster entries need fixing (invalid mobile)':'')+'</div>'
      +'<div class="nfo-tw"><table class="nfo-t"><thead><tr><th>Name</th><th>Mobile / ID</th><th>Roles</th>'+(dry?'':'<th>Temporary password</th>')+'</tr></thead><tbody>'+rows+'</tbody></table></div>';
    if(!dry) setTimeout(nfRenderSecurityPanelKeep,0);
  }catch(e){ if(out) out.innerHTML='<div class="nf-l-err" style="display:block">'+scEsc(nfErrText(e))+'</div>'; }
}
function nfRenderSecurityPanelKeep(){ var o=document.getElementById('nf-mig-out'), html=o?o.innerHTML:''; nfRenderSecurityPanel().then(function(){ var n=document.getElementById('nf-mig-out'); if(n) n.innerHTML=html; }); }
function nfMigCsv(){
  var r=window._nfMigLast; if(!r) return;
  var esc=function(x){ return '"'+String(x==null?'':x).replace(/"/g,'""')+'"'; };
  var csv='Name,Mobile / ID,Roles,Temporary password\n'+r.accounts.map(function(a){ return [a.name,a.identifier,a.roles.join(' · '),a.tempPassword||'(kept own)'].map(esc).join(','); }).join('\n');
  var a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download='NQAS-FAST-temporary-passwords.csv'; a.click();
}
(function(){
  if(!NF_SECURE) return;
  var oV=nfAdminView; nfAdminView=function(v){ var r=oV.apply(this,arguments); if(v==='setup') nfRenderSecurityPanel(); return r; };
  var oD=scRenderMasterDashboard; scRenderMasterDashboard=function(){ var r=oD.apply(this,arguments); if(appMode==='sc-admin'&&_nfOv.view==='setup') nfRenderSecurityPanel(); return r; };
  // "Change my password" for staff (Me) and dashboards (side menu user card)
  var oMe=nfRenderMe; nfRenderMe=function(){ var r=oMe.apply(this,arguments); try{ var rows=document.querySelector('#nf-me .nf-rows'), out=rows&&[].slice.call(rows.children).find(function(b){ return /logoutCHO/.test(b.getAttribute('onclick')||''); });
    if(rows&&!rows.querySelector('.nf-chpw')){ var b=document.createElement('button'); b.type='button'; b.className='nf-row nf-chpw'; b.onclick=nfChangeMyPassword; b.innerHTML='<i class="ti ti-lock"></i><span>'+scEsc(t('Change my password'))+'</span><i class="ti ti-chevron-right nf-row-chev"></i>'; rows.insertBefore(b,out||null); } }catch(e){} return r; };
  var oSh=nfShellHTML; nfShellHTML=function(items,user){ return oSh.apply(this,arguments).replace('<button type="button" title="Log out"','<button type="button" title="Change my password" onclick="nfChangeMyPassword()"><i class="ti ti-lock"></i></button><button type="button" title="Log out"'); };
})();
// ── role-scoped loading (secure mode) ──────────────────────────
//  The database rules let each role read only its own scope. A few screens used to load a whole list and
//  filter it in the app; here those loads become filtered requests that the rules can check.
//  Corrective actions: staff, the CHO and Champions get published actions only (open, done, closed) —
//  drafts and Champion suggestions stay with the Supervisor and HealSol.
var NF_PUBLISHED_ACTIONS=['open','done','closed'];
async function nfQuery(path,child,value){
  try{ if(!db||value==null||value==='') return {}; var s=await db.ref(path).orderByChild(child).equalTo(value).get(); return s.exists()?(s.val()||{}):{}; }catch(e){ return {}; }
}
async function nfQueryMany(path,child,values){
  var out={}, list=values.filter(function(v,i){ return v&&values.indexOf(v)===i; });
  var parts=await Promise.all(list.map(function(v){ return nfQuery(path,child,v); }));
  parts.forEach(function(p){ Object.assign(out,p); }); return out;
}
function nfScopeCodes(){
  if(appMode==='sc-supervisor') return ((_scSup&&_scSup.facilities)||[]).slice();
  if(appMode==='sc-champion') return (_scq&&_scq.me)?scqFacList(_scq.me):[];
  if(appMode==='sc-cho') return scSubAdminCode?[scSubAdminCode]:[];
  if(appMode==='cho') return choState.facilityCode?[choState.facilityCode]:[];
  return [];
}
(function(){
  if(!NF_SECURE) return;
  var oGet=fbGet;
  fbGet=async function(path){
    var p=String(path||''), m;
    if(appMode==='sc-admin'||!_nfAuth) return oGet(path);           // HealSol and the public pages: unchanged
    if((m=/^sc_corrective\/([^/]+)$/.exec(p))&&['cho','sc-cho','sc-champion'].indexOf(appMode)>=0){
      var acts={}, parts=await Promise.all(NF_PUBLISHED_ACTIONS.map(function(s){ return nfQuery(p,'status',s); }));
      parts.forEach(function(x){ Object.assign(acts,x); }); return Object.keys(acts).length?acts:null;
    }
    if(p==='sc_review_sessions'){
      var r=appMode==='sc-champion'?await nfQuery(p,'championId',(_scq&&_scq.me&&_scq.me.id)||''):await nfQueryMany(p,'code',nfScopeCodes());
      return Object.keys(r).length?r:null;
    }
    if(p==='sc_champions'&&appMode==='sc-supervisor'){
      var c=scIsDistrict()?{}:await nfQuery(p,'supervisorId',(_scSup&&_scSup.id)||''); return Object.keys(c).length?c:null;
    }
    return oGet(path);
  };
  // HealSol: deleting a facility goes through the server (logged; staff without another role lose their sign-in)
  scCancelFacility=async function(code){
    var fac=scMasterFacilities[code]||{};
    var v=await scDialog({title:'Delete facility',icon:'⛔',okLabel:'Delete permanently',okColor:'var(--red)',
      message:'Deletes "'+(fac.name||code)+'" with its staff list, scores, checkpoint history and corrective actions. This cannot be undone (daily backups are kept for 30 days).',
      fields:[{key:'confirm',label:'Type the facility ID ('+code+') to confirm',required:true,placeholder:code}],
      validate:function(v){ return String(v.confirm).trim()===code?null:'Type '+code+' exactly to confirm.'; }});
    if(!v) return;
    try{ await nfCall('deleteFacility',{code:code,confirm:String(v.confirm).trim()}); delete scMasterFacilities[code]; scRenderMasterDashboard(); showToast('Facility deleted.','ok'); }
    catch(e){ showToast(nfErrText(e),'err'); }
  };
})();

// first HealSol Admin (only while none exists) — open the app with #setup
function nfShowBootstrap(){
  var f=document.getElementById('nf-l-form'), r=document.getElementById('nf-l-roles'); if(!f||!r) return;
  f.style.display='none'; r.style.display='';
  r.innerHTML='<div class="nf-l-hi">First-time setup <span class="nf-l-namaste">🛡️</span></div><div class="nf-l-sub">Creates the first HealSol Admin. Needs the setup code you saved when deploying.</div>'
    +'<label class="nf-l-lbl">Setup code</label><div class="nf-l-in"><i class="ti ti-key"></i><input id="nf-bs-code" type="password"></div>'
    +'<label class="nf-l-lbl">Your login ID (letters, at least 3)</label><div class="nf-l-in"><i class="ti ti-user"></i><input id="nf-bs-id" placeholder="e.g. meera"></div>'
    +'<label class="nf-l-lbl">Your full name</label><div class="nf-l-in"><i class="ti ti-id"></i><input id="nf-bs-name"></div>'
    +'<div class="nf-l-err" id="nf-err4" role="alert"></div><button type="button" class="nf-l-btn" onclick="nfBootstrap()">Create HealSol Admin</button>'
    +'<button type="button" class="nf-l-back" style="margin-top:10px;" onclick="nfBack()"><i class="ti ti-arrow-left"></i> Back</button>';
}
async function nfBootstrap(){
  var g=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); }, err=document.getElementById('nf-err4');
  try{ if(!db){ initFirebase(); } var r=await nfCall('bootstrapAdmin',{setupCode:g('nf-bs-code'),id:g('nf-bs-id'),name:g('nf-bs-name')});
    nfShowTempPassword(g('nf-bs-name'),r.identifier,r.tempPassword,'First HealSol Admin created'); nfBack(); var i=document.getElementById('nf-id'); if(i) i.value=r.identifier; }
  catch(e){ if(err){ err.textContent=nfErrText(e); err.style.display='block'; } }
}
