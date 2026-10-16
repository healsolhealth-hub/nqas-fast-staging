
// ══════════════════════════════════════════════════════════════
// BUILD 4.2 — ONE LOGIN FOR EVERYONE
//  Mobile number or ID + password. The app finds the account(s) — staff (any facility), Quality
//  Champion, Supervisor, District Admin, HealSol — keeps those whose password matches, and opens the
//  right space (or asks "Continue as…" when one person has two roles). The proven login functions
//  of each role still do the actual sign-in, so every existing check (trial, disabled, keys) applies.
//  sc_staff_index/{mobile}/{facilityCode} = true speeds up staff lookup; it repairs itself.
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{'Namaste':'नमस्ते','Log in with your mobile number or ID — we\'ll open the right space for you.':'अपने मोबाइल नंबर या ID से लॉग इन करें — हम आपके लिए सही जगह खोल देंगे।',
  'Mobile number or ID':'मोबाइल नंबर या ID','Password':'पासवर्ड','Show':'दिखाएँ','Hide':'छिपाएँ','Remember me on this phone':'इस फ़ोन पर याद रखें','Forgot?':'भूल गए?','Log in':'लॉग इन',
  'Get your Sub-Centre NQAS-ready in 60 days':'60 दिनों में अपने उप-केंद्र को NQAS के लिए तैयार करें','New facility? Register — first 7 days (Baseline) free':'नया स्वास्थ्य केंद्र? पंजीकरण करें — पहले 7 दिन (बेसलाइन) मुफ़्त',
  'District / bulk enrolment? Contact us':'ज़िला / बल्क नामांकन? संपर्क करें','You have two roles. Where do you want to go?':'आपकी दो भूमिकाएँ हैं। आप कहाँ जाना चाहते हैं?',
  'Remember my choice on this phone':'इस फ़ोन पर मेरी पसंद याद रखें','Back':'वापस','Checking…':'जाँच हो रही है…','change':'बदलें',
  'Please enter your mobile number or ID.':'कृपया अपना मोबाइल नंबर या ID डालें।','Please enter your password.':'कृपया अपना पासवर्ड डालें।',
  'Incorrect password.':'पासवर्ड ग़लत है।','We could not find an account with this mobile number or ID.':'इस मोबाइल नंबर या ID से कोई खाता नहीं मिला।',
  'You will continue as':'आप इस रूप में जारी रखेंगे','Everyone uses this same login':'सभी इसी लॉग इन का उपयोग करते हैं'});
var _nfLogin={busy:false,matches:[],id:''};
function nfMobile(id){ var d=String(id||'').replace(/[^0-9]/g,''); if(d.length===12&&d.indexOf('91')===0) d=d.slice(2); if(d.length===11&&d.charAt(0)==='0') d=d.slice(1); return d.length===10?d:''; }
function nfIdKey(id){ var m=nfMobile(id); return m||String(id||'').trim().toLowerCase(); }
var NF_ROLE_META={staff:{icon:'ti-clipboard-check',cls:'t'},champion:{icon:'ti-award',cls:'q'},supervisor:{icon:'ti-shield-check',cls:'o'},district:{icon:'ti-map-2',cls:'g'},admin:{icon:'ti-settings',cls:'g'},facadmin:{icon:'ti-building-hospital',cls:'t'}};

// ── staff index (mobile → facilities) ──────────────────────────
async function nfIndexStaff(code,mob){ try{ if(code&&mob) await db.ref('sc_staff_index/'+mob+'/'+code).set(true); }catch(e){} }
(function(){
  var oSet=fbSet;
  fbSet=async function(path,val){
    var r=await oSet.apply(this,arguments);
    try{ if(r){ var m=/^sc_facilities\/([^\/]+)\/staff\/([^\/]+)$/.exec(path); if(m&&val&&typeof val==='object') nfIndexStaff(m[1],m[2]);
      var f=/^sc_facilities\/([^\/]+)$/.exec(path); if(f&&val&&val.staff) Object.keys(val.staff).forEach(function(mob){ nfIndexStaff(f[1],mob); }); } }catch(e){}
    return r;
  };
})();
async function nfStaffAccounts(mob){
  var codes=Object.keys(await fbGet('sc_staff_index/'+mob)||{}), out=[];
  if(!codes.length){                                   // not indexed yet → search once and fill the index
    var all=await fbGet('sc_facilities')||{};
    codes=Object.keys(all).filter(function(c){ var s=all[c]&&all[c].staff; return s&&s[mob]&&!all[c].migratedTo; });
    codes.forEach(function(c){ nfIndexStaff(c,mob); });
  }
  for(var i=0;i<codes.length;i++){
    var c=codes[i], rec=await fbGet(scStaffPath(c,mob)); if(!rec) continue;    // stale index entry → skip
    var name=await fbGet(scFacilityPath(c)+'/name'), mig=await fbGet(scFacilityPath(c)+'/migratedTo'); if(mig) continue;
    out.push({kind:'staff',key:'staff:'+c,code:c,pwd:String(rec.password||''),disabled:!!rec.disabled,
      title:(rec.role||'CHO')+' · '+(name||c),sub:(rec.name||'')+' · '+c});
  }
  return out;
}
async function nfFindAccounts(id){
  var raw=String(id||'').trim(), mob=nfMobile(raw), key=scSupKey(raw), out=[];
  if(/^(healsol|healsol-admin|admin)$/i.test(raw)) out.push({kind:'admin',key:'admin',pwd:String(SC_ADMIN_PASSWORD),title:'HealSol Admin',sub:'All facilities, setup and content'});
  var jobs=[];
  if(key){
    jobs.push(fbGet('sc_supervisors/'+key).then(function(s){ if(s) out.push({kind:'supervisor',key:'sup:'+key,id:key,pwd:String(s.password||''),disabled:!!s.disabled,title:'Supervisor',sub:(s.name||key)+' · '+Object.keys(s.facilities||{}).length+' facilities'}); }).catch(function(){}));
    jobs.push(fbGet('sc_district_admins/'+key).then(function(d){ if(d) out.push({kind:'district',key:'dist:'+key,id:key,pwd:String(d.password||''),disabled:!!d.disabled,title:'District Admin',sub:(d.name||key)+' · view readiness and reports'}); }).catch(function(){}));
  }
  if(mob){
    jobs.push(fbGet('sc_champions/'+mob).then(function(c){ if(c) out.push({kind:'champion',key:'champ:'+mob,mob:mob,pwd:String(c.password||''),disabled:!!c.disabled,title:'Quality Champion',sub:(c.name||mob)+' · '+Object.keys(c.facilities||{}).length+' facilities'}); }).catch(function(){}));
    jobs.push(nfStaffAccounts(mob).then(function(L){ out.push.apply(out,L); }).catch(function(){}));
  }
  if(!mob&&/^[A-Za-z0-9][A-Za-z0-9\-]{3,}$/.test(raw)){      // older facilities without a CHO login: facility code + Facility Admin password
    jobs.push(fbGet(scFacilityPath(raw.toUpperCase())).then(function(f){ if(f&&f.choPassword&&!f.migratedTo) out.push({kind:'facadmin',key:'fac:'+raw.toUpperCase(),code:raw.toUpperCase(),pwd:String(f.choPassword),title:'Facility dashboard',sub:(f.name||raw)+' · '+raw.toUpperCase()}); }).catch(function(){}));
  }
  await Promise.all(jobs);
  var order={staff:0,facadmin:1,champion:2,supervisor:3,district:4,admin:5};
  return out.sort(function(a,b){ return order[a.kind]-order[b.kind]; });
}
// ── sign in through the proven per-role functions ───────────────
function nfVal(id,v){ var el=document.getElementById(id); if(el) el.value=v; }
function nfText(id){ var el=document.getElementById(id); return el&&el.classList.contains('show')?el.textContent:''; }
async function nfGo(acc,pwd){
  var loginEl=document.getElementById('login-screen'), err='';
  ['sc-staff-err','sc-sup-err','admin-err','sc-cho-err','scq-login-err','scd-login-err'].forEach(function(e){ var x=document.getElementById(e); if(x){ x.textContent=''; x.classList.remove('show'); } });
  // the facility type: a staff member's facility decides it; portals covering many facilities use the Sub-Centre core for now
  var ftype=acc.type||NF_LEVEL_DEFAULT;
  if(!acc.type&&acc.code&&(acc.kind==='staff'||acc.kind==='facadmin')){ try{ ftype=nfTypeOf({type:await fbGet(scFacilityPath(acc.code)+'/type')}); }catch(e){} }
  nfSetLevel(ftype);
  var core=nfCore(), open=core&&core.open&&core.open[acc.kind];
  if(open) err=(await open(acc,pwd))||'';
  else err=core?t('This role is not available here.'):(NF_CFG.name+' — '+t('this app is not ready yet. Contact HealSol Academy.'));
  var still=loginEl&&loginEl.style.display!=='none'&&getComputedStyle(loginEl).display!=='none';
  if(err&&still){ nfError(err); return false; }
  return true;
}
// ── SC card system (core 'sc'): what each signed-in role opens ──
// Another level registers its own core with the same shape (open[kind] returns an error text or '').
nfRegisterCore('sc',{
  open:{
    staff:async function(acc,pwd){ nfVal('sc-staff-fid',acc.code); nfVal('sc-staff-mob',nfMobile(_nfLogin.id)); nfVal('sc-staff-pwd',pwd); await scStaffLogin(); var err=nfText('sc-staff-err');
      if(!err&&!(document.getElementById('nf-remember')||{}).checked){ try{ localStorage.removeItem('sc_autologin'); }catch(e){} } return err; },
    supervisor:async function(acc,pwd){ nfVal('sc-sup-id',acc.id); nfVal('sc-sup-pwd',pwd); await scSupervisorLogin(); return nfText('sc-sup-err'); },
    district:async function(acc,pwd){ scDistEnsureLogin(); nfVal('scd-login-id',acc.id); nfVal('scd-login-pwd',pwd); await scDistrictLogin(); return nfText('scd-login-err'); },
    champion:async function(acc,pwd){ scqEnsureLogin(); nfVal('scq-login-mob',acc.mob); nfVal('scq-login-pwd',pwd); await scqLogin(); return nfText('scq-login-err'); },
    admin:async function(acc,pwd){ nfVal('admin-pwd',pwd); adminLogin(); return nfText('admin-err'); },
    facadmin:async function(acc,pwd){ nfVal('sc-cho-fid',acc.code); nfVal('sc-cho-pwd',pwd); await scChoLogin(); return nfText('sc-cho-err'); }
  }
});
// ── UI ─────────────────────────────────────────────────────────
function nfError(m){ var e=document.getElementById('nf-err'); if(e){ e.textContent=m||''; e.style.display=m?'block':'none'; } }
function nfLoginHTML(){
  return '<div class="nf-l-top"><img class="nf-l-logo" src="'+SC_BRAND.logoNqas+'" alt="NQAS.QI"><div class="nf-l-lang"><button type="button" data-lang="en" onclick="setLang(\'en\')">EN</button><button type="button" data-lang="hi" onclick="setLang(\'hi\')">हिं</button></div></div>'
    +'<div class="nf-l-hero"><div class="nf-l-name">NQAS<i>|</i>FAST</div><div class="nf-l-tag" data-nf="Get your Sub-Centre NQAS-ready in 60 days"></div></div>'
    +'<div class="nf-l-body" id="nf-l-form">'
      +'<div class="nf-l-hi"><span data-nf="Namaste"></span> <span class="nf-l-namaste" aria-hidden="true">🙏</span></div>'
      +'<div class="nf-l-sub" data-nf="Log in with your mobile number or ID — we\'ll open the right space for you."></div>'
      +'<label class="nf-l-lbl" for="nf-id" data-nf="Mobile number or ID"></label>'
      +'<div class="nf-l-in"><i class="ti ti-device-mobile"></i><input id="nf-id" autocomplete="username" inputmode="text" autocapitalize="none" placeholder="98765 43210" onkeydown="if(event.key===\'Enter\')document.getElementById(\'nf-pwd\').focus()" oninput="nfShowRemembered()"></div>'
      +'<label class="nf-l-lbl" for="nf-pwd" data-nf="Password"></label>'
      +'<div class="nf-l-in"><i class="ti ti-lock"></i><input id="nf-pwd" type="password" autocomplete="current-password" placeholder="••••" onkeydown="if(event.key===\'Enter\')nfSubmit()"><button type="button" class="nf-l-show" onclick="nfTogglePwd(this)" data-nf="Show"></button></div>'
      +'<div class="nf-l-row"><label class="nf-l-chk"><input type="checkbox" id="nf-remember" checked> <span data-nf="Remember me on this phone"></span></label><button type="button" class="nf-l-link" onclick="nfForgot()" data-nf="Forgot?"></button></div>'
      +'<div class="nf-l-err" id="nf-err" role="alert"></div>'
      +'<div class="nf-l-rem" id="nf-rem"></div>'
      +'<button type="button" class="nf-l-btn" id="nf-btn" onclick="nfSubmit()" data-nf="Log in"></button>'
      +'<button type="button" class="nf-l-ghost" onclick="phcOpenDemoSignup()"><i class="ti ti-rocket"></i> <span data-nf="New facility? Register — first 7 days (Baseline) free"></span></button>'
      +'<button type="button" class="nf-l-plain" onclick="phcOpenLeadModal()"><i class="ti ti-building"></i> <span data-nf="District / bulk enrolment? Contact us"></span></button>'
    +'</div>'
    +'<div class="nf-l-body" id="nf-l-roles" style="display:none;"></div>'
    +'<div class="nf-l-foot">by <img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div>';
}
function nfPaint(){
  var root=document.getElementById('nf-login'); if(!root) return;
  root.querySelectorAll('[data-nf]').forEach(function(el){ el.textContent=nfLvlText(t(el.getAttribute('data-nf'))); });
  root.querySelectorAll('.nf-l-lang button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('data-lang')===(_appLang||'en')); });
  nfShowRemembered();
}
function nfMount(){
  var ls=document.getElementById('login-screen'); if(!ls||document.getElementById('nf-login')) return;
  var box=document.createElement('div'); box.id='nf-login'; box.innerHTML=nfLoginHTML();
  ls.insertBefore(box,ls.firstChild); ls.classList.add('nf-on');
  [].forEach.call(ls.children,function(ch){ if(ch!==box&&!ch.classList.contains('login-card')) ch.style.display='none'; });   // old header row
  nfPaint();
}
function nfTogglePwd(b){ var i=document.getElementById('nf-pwd'); var show=i.type==='password'; i.type=show?'text':'password'; b.setAttribute('data-nf',show?'Hide':'Show'); b.textContent=t(show?'Hide':'Show'); }
function nfForgot(){ scAlert('Staff: ask your CHO to reset your password from the Facility dashboard.\nCHO, Supervisor, Quality Champion and District Admin: contact HealSol Academy.','Forgot password','🔑'); }
function nfRememberedKey(id){ try{ return localStorage.getItem('nf_role_'+nfIdKey(id))||''; }catch(e){ return ''; } }
function nfShowRemembered(){
  var el=document.getElementById('nf-rem'), id=(document.getElementById('nf-id')||{}).value||'', k=id?nfRememberedKey(id):'';
  if(!el) return; var lbl=k?((localStorage.getItem('nf_role_lbl_'+nfIdKey(id)))||''):'';
  el.innerHTML=k&&lbl?t('You will continue as')+': <b>'+scEsc(lbl)+'</b> · <button type="button" class="nf-l-link" onclick="nfForget()">'+scEsc(t('change'))+'</button>':''; }
function nfForget(){ var id=(document.getElementById('nf-id')||{}).value||''; try{ localStorage.removeItem('nf_role_'+nfIdKey(id)); localStorage.removeItem('nf_role_lbl_'+nfIdKey(id)); }catch(e){} nfShowRemembered(); }
async function nfSubmit(){
  if(_nfLogin.busy) return;
  var id=((document.getElementById('nf-id')||{}).value||'').trim(), pwd=((document.getElementById('nf-pwd')||{}).value||'').trim();
  nfError('');
  if(!id){ nfError(t('Please enter your mobile number or ID.')); return; }
  if(!pwd){ nfError(t('Please enter your password.')); return; }
  var btn=document.getElementById('nf-btn'); _nfLogin.busy=true; if(btn){ btn.disabled=true; btn.textContent=t('Checking…'); }
  try{
    if(!db){ initFirebase(); await new Promise(function(r){ setTimeout(r,800); }); }
    _nfLogin.id=id;
    var all=await nfFindAccounts(id);
    if(!all.length){ nfError(t('We could not find an account with this mobile number or ID.')); return; }
    var ok=all.filter(function(a){ return a.pwd===pwd; });
    if(!ok.length){ nfError(t('Incorrect password.')); return; }
    _nfLogin.matches=ok; _nfLogin.pwd=pwd;
    if(ok.length===1){ await nfGo(ok[0],pwd); return; }
    var rem=nfRememberedKey(id), pick=ok.find(function(a){ return a.key===rem; });
    if(pick){ await nfGo(pick,pwd); return; }
    nfShowRoles(ok);
  } finally { _nfLogin.busy=false; if(btn){ btn.disabled=false; btn.textContent=t('Log in'); } }
}
function nfShowRoles(list){
  var f=document.getElementById('nf-l-form'), r=document.getElementById('nf-l-roles'); if(!f||!r) return;
  f.style.display='none'; r.style.display='';
  r.innerHTML='<button type="button" class="nf-l-back" onclick="nfBack()"><i class="ti ti-arrow-left"></i> '+scEsc(t('Back'))+'</button>'
    +'<div class="nf-l-hi" style="margin-top:6px;">'+scEsc(t('Namaste'))+' <span class="nf-l-namaste">🙏</span></div><div class="nf-l-sub">'+scEsc(t('You have two roles. Where do you want to go?'))+'</div>'
    +list.map(function(a,i){ var m=NF_ROLE_META[a.kind]||NF_ROLE_META.staff;
      return '<button type="button" class="nf-l-role" onclick="nfPick('+i+')"><span class="nf-l-ri '+m.cls+'"><i class="ti '+m.icon+'"></i></span><span class="nf-l-rt"><b>'+scEsc(a.title)+'</b><small>'+scEsc(a.sub||'')+'</small></span><i class="ti ti-chevron-right"></i></button>'; }).join('')
    +'<label class="nf-l-chk" style="margin-top:14px;"><input type="checkbox" id="nf-rem-choice" checked> <span>'+scEsc(t('Remember my choice on this phone'))+'</span></label>'
    +'<div class="nf-l-err" id="nf-err2" role="alert"></div>';
}
function nfBack(){ var f=document.getElementById('nf-l-form'), r=document.getElementById('nf-l-roles'); if(f) f.style.display=''; if(r) r.style.display='none'; }
async function nfPick(i){
  var a=_nfLogin.matches[i]; if(!a) return;
  if((document.getElementById('nf-rem-choice')||{}).checked){ try{ localStorage.setItem('nf_role_'+nfIdKey(_nfLogin.id),a.key); localStorage.setItem('nf_role_lbl_'+nfIdKey(_nfLogin.id),a.title); }catch(e){} }
  var ok=await nfGo(a,_nfLogin.pwd);
  if(!ok){ var e2=document.getElementById('nf-err2'), e=document.getElementById('nf-err'); if(e2&&e){ e2.textContent=e.textContent; e2.style.display='block'; } }
  else nfBack();
}
(function(){
  var oLang=setLang; setLang=function(){ var r=oLang.apply(this,arguments); try{ nfPaint(); }catch(e){} return r; };
  // after any logout the login form is clean again
  var oShow=scShowLoginPanel; scShowLoginPanel=function(){ var r=oShow.apply(this,arguments); try{ nfBack(); var p=document.getElementById('nf-pwd'); if(p) p.value=''; nfError(''); }catch(e){} return r; };
  try{ nfMount(); }catch(e){ console.warn('[SC] early login mount',e); }   // the login box is already on the page: show the new login straight away
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',nfMount);
  // HealSol: facilities whose CHO has no login yet
  if(typeof scRvAttention==='function'){
    var oAtt=scRvAttention;
    scRvAttention=function(){ var out=oAtt.apply(this,arguments);
      if(appMode==='sc-admin') Object.keys(scMasterFacilities||{}).forEach(function(code){ var f=scMasterFacilities[code]; if(!f||f.migratedTo) return;
        var hasCho=Object.keys(f.staff||{}).some(function(m){ var s=f.staff[m]; return s&&!s.disabled&&(s.role||'CHO')==='CHO'; });
        if(!hasCho) out.push({code:code,lvl:'amber',txt:'No CHO login yet — add the CHO\'s mobile number so the facility can use the single login'}); });
      return out; };
  }
})();
