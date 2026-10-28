
// ══════════════════════════════════════════════════════════════
// DISTRICT ADMIN — read-only dashboards for allotted facilities (any district)
//   sc_district_admins/{id} = {name, password, facilities:{CODE:true}, disabled, createdAt, updatedAt}
//   Runs on the same facility-scoped mode as the Supervisor (so every scoping check applies),
//   flagged district:true — and every write path refuses it. Reports and CSV downloads stay available.
// ══════════════════════════════════════════════════════════════
var _scDistricts={};
function scIsDistrict(){ return appMode==='sc-supervisor'&&!!(_scSup&&_scSup.district); }
function scDistFacilities(d){ var f=(d&&d.facilities)||{}; return Object.keys(f).filter(function(k){ return f[k]; }); }
function scDistNames(codes){ var o={}; codes.forEach(function(c){ var f=(scMasterFacilities||{})[c]; if(f&&f.district) o[f.district]=1; }); return Object.keys(o).sort(); }

// ── HealSol: manage District Admins ────────────────────────────
function scDistEnsurePanel(){
  var sup=document.getElementById('sc-sup-list'); if(!sup) return null;
  var el=document.getElementById('scd-dist-panel');
  if(!el){
    el=document.createElement('div'); el.id='scd-dist-panel'; el.className='hs-only';
    el.style.cssText='background:var(--bgc);border-radius:14px;border:1px solid var(--br);padding:16px;margin-bottom:14px;';
    el.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;flex-wrap:wrap;">'
      +'<div style="font-size:13px;font-weight:800;color:var(--t1);font-family:\'Poppins\',sans-serif;display:flex;align-items:center;gap:6px;"><i class="ti ti-map-2" style="color:var(--teal);font-size:15px;"></i> District Admins</div>'
      +'<button class="scx-btn sm" style="flex:0 0 auto;" onclick="scEditDistrict(null)"><i class="ti ti-user-plus"></i> Add District Admin</button></div>'
      +'<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">View-only access to readiness dashboards and reports for the facilities of one district — ticked one by one, or all of them including ones enrolled later. They log in from the map button on the login screen.</div>'
      +'<div id="scd-dist-list"></div>';
    var host=sup.parentNode; host.parentNode.insertBefore(el,host.nextSibling);
  }
  return el;
}
function scRenderDistrictAdmin(){
  if(appMode!=='sc-admin'||!scDistEnsurePanel()) return;
  var list=document.getElementById('scd-dist-list'); if(!list) return;
  try{ nfPLoginsRender(); }catch(e){ console.warn('[logins]',e); }
  var ids=Object.keys(_scDistricts||{}).filter(function(k){ return ((_scDistricts[k]||{}).scope)!=='block'; }).sort();   // block MOIC views: their own list below (27 Oct)
  if(!ids.length){ list.innerHTML='<div class="scx-empty" style="padding:10px;">No District Admins yet.</div>'; return; }
  list.innerHTML=ids.map(function(id){
    var d=_scDistricts[id]||{}, facs=scDistFacilities(d), I=scJs(id), dn=scDistNames(facs);
    return '<div class="scx-sup-row"'+(d.disabled?' style="opacity:0.6;"':'')+'><div class="scx-av">'+scEsc(String(d.name||id).charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:180px;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(d.name||id)+(d.disabled?' <span class="scx-chip end">Disabled</span>':'')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">ID: '+scEsc(id)+' · '+facs.length+' facilit'+(facs.length===1?'y':'ies')+(dn.length?' · '+scEsc(dn.join(', ')):(d.district?' · '+scEsc(d.district):''))+(d.auto?' · <span class="scx-chip pkg">All of '+scEsc(d.district||'the district')+', incl. new</span>':'')+'</div></div>'
      +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scEditDistrict(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button>'
      +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scToggleDistrict(\''+I+'\')">'+(d.disabled?'Enable':'Disable')+'</button>'
      +'<button class="scx-btn sm danger" style="flex:0 0 auto;" onclick="scRemoveDistrict(\''+I+'\')"><i class="ti ti-trash"></i></button></div>';
  }).join('');
}
function scDistFacilityOptions(){
  return Object.keys(scMasterFacilities||{}).filter(function(c){ var f=scMasterFacilities[c]; return f&&!f.migratedTo; })
    .sort(function(a,b){ var A=scMasterFacilities[a], B=scMasterFacilities[b]; return String(A.district||'~').localeCompare(String(B.district||'~'))||String(A.name||a).localeCompare(String(B.name||b)); })
    .map(function(c){ var f=scMasterFacilities[c]; return {value:c,label:(f.district||'No district')+' — '+(f.name||c)+' · '+c}; });
}
async function scEditDistrict(id){
  if(appMode!=='sc-admin'){ showToast('Only HealSol Admin can manage District Admins.','err'); return; }
  var d=id?(_scDistricts[id]||{}):null;
  // a District Admin is made for one state and district (HealSol 21 Oct); facilities of that district are listed by type.
  // "Including ones enrolled later": the server adds every new facility of the district (enrollFacility / self-registration).
  var st0=(d&&d.state)||'', di0=(d&&d.district)||'';
  if(d&&!st0){ var fs=scDistFacilities(d).map(function(c){ return (scMasterFacilities||{})[c]; }).filter(Boolean); if(fs.length){ st0=fs[0].state||''; di0=fs[0].district||''; } }
  if(!st0) st0='Uttar Pradesh';
  var v=await scDialog({title:d?'Edit District Admin':'Add District Admin',icon:'🗺️',wide:true,okLabel:d?'Save':'Create District Admin',
    message:d?null:'District Admins can only view readiness and download reports for the facilities you tick. They cannot verify, assign actions or change anything.',
    fields:[
      d?{key:'_id',label:'District Admin ID',type:'info',value:id}:{key:'id',label:'District Admin ID (used to log in)',required:true,placeholder:'e.g. dpm-jaipur'},
      {key:'name',label:'Full name and designation',required:true,value:d?d.name:'',placeholder:'e.g. Dr. R. Meena, DPM Jaipur'},
      {key:'password',label:d?'New password (leave blank to keep)':'Password',type:'text',required:!d,minLength:d?0:4,placeholder:d?'••••':'min 4 characters'},
      {key:'state',label:'State',type:'select',required:true,value:st0,options:[]},
      {key:'district',label:'District',type:'select',required:true,value:di0,options:[]},
      {key:'auto',label:'',type:'checklist',value:d&&d.auto?['auto']:[],options:[{value:'auto',label:'All facilities in this district, including ones enrolled later'}]},
      {key:'facilities',label:'Facilities in this district (grouped by type)',type:'checklist',value:[],options:[]}
    ],
    onRender:function(I){
      var stS=I.state.el, diS=I.district.el, au=I.auto.el, fc=I.facilities.el, first=true;
      hsxFillSelect(stS,hsxStates(),st0);
      var fillD=function(keep){ hsxFillSelect(diS,hsxDistricts(stS.value),keep,'Choose a district…'); };
      fillD(di0);
      var autoOn=function(){ return !!au.querySelector('input:checked'); };
      var draw=function(){
        var keep=first?(d?scDistFacilities(d):[]):hsxVals(fc); first=false;
        var items=diS.value?hsxDistItems(stS.value,diS.value):[];
        // facilities already allotted elsewhere stay visible so they are not dropped by mistake
        var have={}; items.forEach(function(it){ have[it.value]=1; });
        hsxFacItems().forEach(function(it){ if(!have[it.value]&&keep.indexOf(it.value)>=0){ it.label+=' · '+(it.district||'no district'); it.type=it.type; items.push(it); } });
        if(autoOn()) keep=items.filter(function(it){ return hsxDistItems(stS.value,diS.value).some(function(x){ return x.value===it.value; }); }).map(function(it){ return it.value; }).concat(keep);
        hsxPicker(fc,items,keep,'type',diS.value?'No facility of '+diS.value+' is enrolled yet.'+(autoOn()?' New ones will be added automatically.':''):'Choose the state and district first.');
        if(autoOn()) fc.querySelectorAll('input').forEach(function(c){ var it=items.find(function(x){ return x.value===c.value; }); if(it&&String(it.district).toLowerCase()===String(diS.value).toLowerCase()){ c.checked=true; c.disabled=true; c.parentNode.classList.add('on'); } });
      };
      stS.addEventListener('change',function(){ fillD(''); draw(); });
      diS.addEventListener('change',draw);
      au.querySelectorAll('input').forEach(function(c){ c.addEventListener('change',draw); });
      draw();
    },
    validate:function(v){
      if(!d){ var k=scSupKey(v.id); if(!k) return 'Enter a valid ID (letters, numbers, - and _).'; if(_scDistricts[k]) return 'That District Admin ID already exists.'; }
      if(v.password&&v.password.length<4) return 'Password must be at least 4 characters.';
      if(!v.state||!v.district) return 'Choose the state and district.';
      if(!v.facilities.length&&!(v.auto||[]).length) return 'Tick at least one facility, or choose "All facilities in this district".';
      return null;
    }});
  if(!v) return;
  var key=d?id:scSupKey(v.id), fmap={}; v.facilities.forEach(function(c){ fmap[c]=true; });
  var auto=(v.auto||[]).length>0;
  if(auto) hsxDistItems(v.state,v.district).forEach(function(it){ fmap[it.value]=true; });
  var rec=Object.assign({},d||{createdAt:scNowIso(),createdBy:'HealSol Admin',disabled:false},{name:v.name.trim(),state:v.state,district:v.district,auto:auto||null,facilities:fmap,updatedAt:scNowIso()});
  if(v.password) rec.password=v.password;
  if(!await fbSet('sc_district_admins/'+key,scClean(rec))){ showToast('Could not save — check connection.','err'); return; }
  if(!auto) delete rec.auto;
  _scDistricts[key]=rec; scRenderDistrictAdmin();
  showToast(d?'District Admin updated.':'District Admin "'+key+'" created.','ok');
}
async function scToggleDistrict(id){
  if(appMode!=='sc-admin') return; var d=_scDistricts[id]; if(!d) return;
  if(!await fbSet('sc_district_admins/'+id+'/disabled',!d.disabled)){ showToast('Update failed.','err'); return; }
  d.disabled=!d.disabled; scRenderDistrictAdmin(); showToast('District Admin '+(d.disabled?'disabled':'enabled')+'.','ok');
}
async function scRemoveDistrict(id){
  if(appMode!=='sc-admin') return; var d=_scDistricts[id]; if(!d) return;
  if(!await showConfirm('Remove District Admin "'+(d.name||id)+'"? They will no longer be able to log in.','🗑️','Remove District Admin','Remove','var(--red)')) return;
  try{ await db.ref('sc_district_admins/'+id).remove(); }catch(e){ showToast('Remove failed.','err'); return; }
  delete _scDistricts[id]; scRenderDistrictAdmin(); showToast('District Admin removed.','ok');
}

// ── login ──────────────────────────────────────────────────────
function scDistEnsureLogin(){
  var sup=document.querySelector('#login-screen button[onclick="scShowSupLogin()"]');
  if(sup&&!document.getElementById('scd-login-btn')){
    var b=sup.cloneNode(true); b.id='scd-login-btn'; b.setAttribute('onclick','scShowDistLogin()'); b.title='District Admin Login';
    b.innerHTML='<i class="ti ti-map-2" style="font-size:17px;"></i>'; sup.parentNode.insertBefore(b,sup.nextSibling);
  }
  var supPanel=document.getElementById('sc-sup-panel');
  if(supPanel&&!document.getElementById('sc-dist-panel')){
    var p=document.createElement('div'); p.className='login-card'; p.id='sc-dist-panel'; p.style.display='none';
    p.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">'
      +'<button onclick="scHideSecondaryLogin()" style="width:28px;height:28px;border-radius:7px;border:1.5px solid var(--br);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t3);font-size:13px;"><i class="ti ti-arrow-left"></i></button>'
      +'<div><div class="lc-title" style="margin-bottom:0;">District Admin Login</div><div style="font-size:10px;color:var(--t3);font-weight:600;">View readiness of the facilities allotted to you</div></div></div>'
      +'<div class="lc-field"><label class="lc-label">District Admin ID</label><input class="lc-input" id="scd-login-id" placeholder="Given by HealSol Academy" autocomplete="off" autocapitalize="none" onkeydown="if(event.key===\'Enter\')document.getElementById(\'scd-login-pwd\').focus()"/></div>'
      +'<div class="lc-field"><label class="lc-label">Password</label><input class="lc-input" id="scd-login-pwd" type="password" placeholder="Enter password" onkeydown="if(event.key===\'Enter\')scDistrictLogin()"/></div>'
      +'<div class="lc-err" id="scd-login-err"></div>'
      +'<button class="lc-btn admin" onclick="scDistrictLogin()"><i class="ti ti-map-2" style="font-size:14px;"></i> Login as District Admin</button>';
    supPanel.parentNode.insertBefore(p,supPanel.nextSibling);
  }
}
function scShowDistLogin(){ scDistEnsureLogin(); scShowLoginPanel('sc-dist-panel'); setTimeout(function(){ var i=document.getElementById('scd-login-id'); if(i) i.focus(); },100); }
async function scDistrictLogin(){
  var key=scSupKey((document.getElementById('scd-login-id')||{}).value), pwd=((document.getElementById('scd-login-pwd')||{}).value||'').trim();
  var err=document.getElementById('scd-login-err'), fail=function(m){ if(err){ err.textContent=m; err.classList.add('show'); } };
  if(!key) return fail('Please enter your District Admin ID.');
  if(!pwd) return fail('Please enter your password.');
  if(err) err.classList.remove('show');
  if(!db){ initFirebase(); await new Promise(function(r){ setTimeout(r,1000); }); }
  var d=null; try{ d=await fbGet('sc_district_admins/'+key); }catch(e){}
  if(!d) return fail('District Admin ID not found. Contact HealSol Academy.');
  if(d.disabled) return fail('This account is disabled. Contact HealSol Academy.');
  if(!nfAuthOK('district',key) && pwd!==d.password) return fail('Incorrect password.');
  var p=document.getElementById('scd-login-pwd'); if(p) p.value='';
  appMode='sc-supervisor';
  _scSup={id:key,name:d.name||key,facilities:scDistFacilities(d),district:true};
  document.getElementById('login-screen').style.display='none';
  var app=document.getElementById('admin-app'); app.classList.add('vis'); app.classList.add('scx-sup'); app.classList.add('scx-dist');
  scSetDashboardChrome();
  await scEnsureAdminEdits(true);
  await scLoadMasterData();
  scRenderMasterDashboard();
}

// ── hooks: data, chrome, and read-only everywhere ──────────────
(function(){
  scDistEnsureLogin();
  var oPanel=scShowLoginPanel;
  scShowLoginPanel=function(which){ oPanel.apply(this,arguments); var c=document.getElementById('sc-dist-panel'); if(c) c.style.display=which==='sc-dist-panel'?'':'none'; };
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){
    if(scIsDistrict()){
      var d=await fbGet('sc_district_admins/'+_scSup.id);
      if(!d||d.disabled){ _scSup.facilities=[]; scMasterFacilities={}; scMasterProgress={}; showToast('Your District Admin access has been changed. Please contact HealSol Academy.','err'); return; }
      _scSup.name=d.name||_scSup.id; _scSup.facilities=scDistFacilities(d);
      var facs={}, prog={};
      for(var i=0;i<_scSup.facilities.length;i++){ var code=_scSup.facilities[i], f=await fbGet(scFacilityPath(code)); if(f){ facs[code]=f; prog[code]=await fbGet('sc_progress/'+code)||{}; } }
      scMasterFacilities=facs; scMasterProgress=prog; scSetDashboardChrome();
      return;
    }
    var r=await oLoad.apply(this,arguments);
    if(appMode==='sc-admin'){ try{ _scDistricts=await fbGet('sc_district_admins')||{}; }catch(e){} }
    return r;
  };
  var oChrome=scSetDashboardChrome;
  scSetDashboardChrome=function(){
    var r=oChrome.apply(this,arguments);
    if(scIsDistrict()){
      var set=function(id,txt){ var el=document.getElementById(id); if(el) el.textContent=txt; };
      var n=_scSup.facilities.length, dn=scDistNames(_scSup.facilities);
      set('sc-nav-title','District Dashboard'); set('sc-nav-badge-text','District');
      set('sc-master-heading','District Dashboard — '+(_scSup.name||_scSup.id));
      set('sc-master-subheading',n+' facilit'+(n===1?'y':'ies')+(dn.length?' · '+dn.join(', '):'')+' · readiness · reports · view only');
      set('sc-master-total-lbl','Allotted facilities');
    }
    return r;
  };
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments); try{ scRenderDistrictAdmin(); }catch(e){} return r; };
  var oActor=scActor;
  scActor=function(){ if(scIsDistrict()) return {name:_scSup.name||_scSup.id,role:_scSup.scope==='block'?'MOIC':'District Admin',id:_scSup.id}; return oActor.apply(this,arguments); };
  // read-only: no writes, no verification, no peer-review management
  var oWrite=scCanWriteFacility; scCanWriteFacility=function(){ if(scIsDistrict()) return false; return oWrite.apply(this,arguments); };
  var oVer=scAdmCanVerify; scAdmCanVerify=function(){ if(scIsDistrict()) return false; return oVer.apply(this,arguments); };
  var oKind=scqActorKind; scqActorKind=function(){ if(scIsDistrict()) return 'district'; return oKind.apply(this,arguments); };
  var oDeny=scDeny; scDeny=function(what){ if(scIsDistrict()){ showToast('District Admins have view-only access.','err'); return true; } return oDeny.apply(this,arguments); };
  ['scAdmOpenVerify','scBaselinePlan','scInsAssign','scInsBulkAssign','scInsRemove','scqOpenReviews','scqApproveSchedule','scqEditSession','scqCancelSession','scqApproveSummary','scqReturnSummary','scResetProgress'].forEach(function(name){
    var fn=window[name]; if(typeof fn!=='function') return;
    window[name]=function(){ if(scIsDistrict()){ showToast('District Admins have view-only access.','err'); return; } return fn.apply(this,arguments); };
  });
  var oLogout=logoutAdmin;
  logoutAdmin=async function(){ var was=scIsDistrict(); await oLogout.apply(this,arguments);
    if(!document.getElementById('admin-app').classList.contains('vis')){ document.getElementById('admin-app').classList.remove('scx-dist'); if(was) _scSup=null; } };
})();

// ── HealSol → People: the logins made by enrolment and PHC / CHC links (27 Oct 2026) ──
// MOIC (block view) — one per CHC, made when a Sub-Centre or PHC is linked to the CHC · MO (PHC) — the PHC's Medical Officer
// on its Sub-Centres (from the link form, or the enrolled PHC's in-charge). Read only here; reset password; open where it belongs.
var _nfPL={units:null,busy:false};
function nfPLoginsEnsure(){
  var host=document.getElementById('scd-dist-panel'); if(!host) return null;
  var el=document.getElementById('nf-plogins');
  if(!el){ el=document.createElement('div'); el.id='nf-plogins'; el.className='hs-only'; el.style.cssText='background:var(--bgc);border-radius:14px;border:1px solid var(--br);padding:16px;margin-bottom:14px;'; host.parentNode.insertBefore(el,host.nextSibling); }
  return el;
}
async function nfPLoginsRender(force){
  var el=nfPLoginsEnsure(); if(!el) return;
  if((!_nfPL.units||force)&&!_nfPL.busy){ _nfPL.busy=true; try{ _nfPL.units=(await fbGet('sc_units'))||{}; }catch(e){ _nfPL.units=_nfPL.units||{}; } _nfPL.busy=false; }
  var U=_nfPL.units||{}, D=_scDistricts||{}, F=scMasterFacilities||{};
  var blk=Object.keys(D).filter(function(k){ return (D[k]||{}).scope==='block'; }).sort();
  var mos={}; Object.keys(U).forEach(function(n){ var u=U[n]||{}; if(String(u.type).toUpperCase()!=='PHC'||!u.mo||!u.mo.mobile) return; var m=u.mo.mobile; (mos[m]=mos[m]||{name:u.mo.name||'',phcs:[],scs:0}).phcs.push({nin:n,name:u.name||n,code:u.facCode||''}); mos[m].scs+=Object.keys(u.facilities||{}).length; });
  var row=function(av,name,sub,btns,off){ return '<div class="scx-sup-row"'+(off?' style="opacity:0.6;"':'')+'><div class="scx-av">'+scEsc(String(av).charAt(0).toUpperCase())+'</div><div style="flex:1;min-width:180px;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+name+'</div><div style="font-size:10px;color:var(--t3);font-weight:700;">'+sub+'</div></div>'+btns+'</div>'; };
  var rs=function(id,nm){ return '<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="nfPLReset(\''+scJs(id)+'\',\''+scJs(nm)+'\')"><i class="ti ti-key"></i> Reset password</button>'; };
  var h='<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px;flex-wrap:wrap;"><div style="font-size:13px;font-weight:800;color:var(--t1);font-family:\'Poppins\',sans-serif;display:flex;align-items:center;gap:6px;"><i class="ti ti-building-hospital" style="color:var(--teal);font-size:15px;"></i> MOIC (block) and MO (PHC) logins</div>'
    +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="nfPLoginsRender(true)"><i class="ti ti-refresh"></i> Refresh</button></div>'
    +'<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">Made by the facility tree when the Registry has a CHC MOIC or PHC MO in-charge (Facilities → Registry) — not added here. A CHC MOIC also signs in with their own mobile; an enrolled PHC\'s in-charge becomes the MO of its Sub-Centres.</div>'
    +'<div style="font-size:11px;font-weight:800;color:var(--t2);margin:6px 0;">MOIC · block view ('+blk.length+')</div>'
    +(blk.length?blk.map(function(id){ var d=D[id]||{}, n=scDistFacilities(d).length, chc=Object.keys(F).find(function(c){ var f=F[c]||{}; return f.type==='chc'&&String(f.nin||'').toUpperCase()===String(d.chcNin||'').toUpperCase(); });
        return row(d.name||id,scEsc(d.name||id)+(d.disabled?' <span class="scx-chip end">Disabled</span>':''),'ID: '+scEsc(id)+' · '+scEsc(d.block||'')+' block · '+scEsc(d.chcName||'CHC')+(d.chcNin?' ('+scEsc(d.chcNin)+')':'')+' · '+n+' facilit'+(n===1?'y':'ies')+(d.mobile?' · own mobile '+scEsc(d.mobile):''),
          (chc?'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scDrillIn(\''+scJs(chc)+'\')">Open CHC</button>':'')+rs(id,d.name||id),d.disabled); }).join('')
      :'<div class="scx-empty" style="padding:8px;">None yet — link a Sub-Centre or PHC to a CHC.</div>')
    +'<div style="font-size:11px;font-weight:800;color:var(--t2);margin:12px 0 6px;">MO · PHC ('+Object.keys(mos).length+')</div>'
    +(Object.keys(mos).length?Object.keys(mos).sort(function(a,b){ return String(mos[a].name).localeCompare(String(mos[b].name)); }).map(function(m){ var x=mos[m];
        return row(x.name||m,scEsc(x.name||'Medical Officer'),scEsc(m)+' · '+x.phcs.map(function(p){ return scEsc(p.name); }).join(', ')+' · '+x.scs+' sub-centre'+(x.scs===1?'':'s'),
          (x.phcs[0]&&x.phcs[0].code?'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scDrillIn(\''+scJs(x.phcs[0].code)+'\')">Open PHC</button>':'')+rs(m,x.name||m)); }).join('')
      :'<div class="scx-empty" style="padding:8px;">None yet — they come with PHC links.</div>');
  el.innerHTML=h;
}
async function nfPLReset(id,name){
  if(!(await showConfirm('Give '+name+' a new temporary password? Their old password stops working.','🔑','Reset password','Reset'))) return;
  try{ var r=await nfCall('resetPassword',{identifier:id}); nfShowTempPassword(name,r.identifier,r.tempPassword,'New password — '+name); }
  catch(e){ showToast(nfErrText(e),'err'); }
}
