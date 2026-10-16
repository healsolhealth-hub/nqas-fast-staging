
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
      +'<div style="font-size:11px;color:var(--t3);margin-bottom:10px;">View-only access to readiness dashboards and reports for the facilities you allot (from one or several districts). They log in from the map button on the login screen.</div>'
      +'<div id="scd-dist-list"></div>';
    var host=sup.parentNode; host.parentNode.insertBefore(el,host.nextSibling);
  }
  return el;
}
function scRenderDistrictAdmin(){
  if(appMode!=='sc-admin'||!scDistEnsurePanel()) return;
  var list=document.getElementById('scd-dist-list'); if(!list) return;
  var ids=Object.keys(_scDistricts||{}).sort();
  if(!ids.length){ list.innerHTML='<div class="scx-empty" style="padding:10px;">No District Admins yet.</div>'; return; }
  list.innerHTML=ids.map(function(id){
    var d=_scDistricts[id]||{}, facs=scDistFacilities(d), I=scJs(id), dn=scDistNames(facs);
    return '<div class="scx-sup-row"'+(d.disabled?' style="opacity:0.6;"':'')+'><div class="scx-av">'+scEsc(String(d.name||id).charAt(0).toUpperCase())+'</div>'
      +'<div style="flex:1;min-width:180px;"><div style="font-size:12px;font-weight:800;color:var(--t1);">'+scEsc(d.name||id)+(d.disabled?' <span class="scx-chip end">Disabled</span>':'')+'</div>'
      +'<div style="font-size:10px;color:var(--t3);font-weight:700;">ID: '+scEsc(id)+' · '+facs.length+' facilit'+(facs.length===1?'y':'ies')+(dn.length?' · '+scEsc(dn.join(', ')):'')+'</div></div>'
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
  var v=await scDialog({title:d?'Edit District Admin':'Add District Admin',icon:'🗺️',wide:true,okLabel:d?'Save':'Create District Admin',
    message:d?null:'District Admins can only view readiness and download reports for the facilities you tick. They cannot verify, assign actions or change anything.',
    fields:[
      d?{key:'_id',label:'District Admin ID',type:'info',value:id}:{key:'id',label:'District Admin ID (used to log in)',required:true,placeholder:'e.g. dpm-jaipur'},
      {key:'name',label:'Full name and designation',required:true,value:d?d.name:'',placeholder:'e.g. Dr. R. Meena, DPM Jaipur'},
      {key:'password',label:d?'New password (leave blank to keep)':'Password',type:'text',required:!d,minLength:d?0:4,placeholder:d?'••••':'min 4 characters'},
      {key:'facilities',label:'Facilities (grouped by district)',type:'checklist',value:d?scDistFacilities(d):[],options:scDistFacilityOptions(),emptyText:'No facilities enrolled yet.'}
    ],
    validate:function(v){
      if(!d){ var k=scSupKey(v.id); if(!k) return 'Enter a valid ID (letters, numbers, - and _).'; if(_scDistricts[k]) return 'That District Admin ID already exists.'; }
      if(v.password&&v.password.length<4) return 'Password must be at least 4 characters.';
      if(!v.facilities.length) return 'Allot at least one facility.';
      return null;
    }});
  if(!v) return;
  var key=d?id:scSupKey(v.id), fmap={}; v.facilities.forEach(function(c){ fmap[c]=true; });
  var rec=Object.assign({},d||{createdAt:scNowIso(),createdBy:'HealSol Admin',disabled:false},{name:v.name.trim(),facilities:fmap,updatedAt:scNowIso()});
  if(v.password) rec.password=v.password;
  if(!await fbSet('sc_district_admins/'+key,scClean(rec))){ showToast('Could not save — check connection.','err'); return; }
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
  scActor=function(){ if(scIsDistrict()) return {name:_scSup.name||_scSup.id,role:'District Admin',id:_scSup.id}; return oActor.apply(this,arguments); };
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
