
// ══════════════════════════════════════════════════════════════
// SC 3-TIER LOGIN SYSTEM
// ══════════════════════════════════════════════════════════════

function scSwitchTab(tab){
  ['staff','cho','admin'].forEach(t=>{
    const btn=document.getElementById('tab-'+t);
    if(btn) btn.classList.toggle('active', t===tab);
    const panel=document.getElementById(t==='staff'?'sc-staff-panel':t==='cho'?'sc-cho-panel':'sc-admin-panel');
    if(panel) panel.style.display = t===tab ? '' : 'none';
  });
}

// ── Staff Login ────────────────────────────────────────────────
async function scStaffLogin(){
  const fid  = (document.getElementById('sc-staff-fid')?.value||'').trim().toUpperCase();
  const mob  = (document.getElementById('sc-staff-mob')?.value||'').trim();
  const pwd  = (document.getElementById('sc-staff-pwd')?.value||'').trim();
  const err  = document.getElementById('sc-staff-err');
  const btn  = document.getElementById('sc-staff-btn');

  if(!fid){err.textContent='Please enter your Facility ID.';err.classList.add('show');return;}
  if(!mob||mob.length<10){err.textContent='Please enter your 10-digit mobile number.';err.classList.add('show');return;}
  if(!pwd){err.textContent='Please enter your password.';err.classList.add('show');return;}
  err.classList.remove('show');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="ti ti-loader" style="animation:spin 1s linear infinite;font-size:15px;"></i> Verifying...';}

  if(!db){ initFirebase(); await new Promise(r=>setTimeout(r,1000)); }

  try{
    const facData = await fbGet(scFacilityPath(fid));
    if(!facData){
      err.textContent='Facility ID not found. Contact your CHO or HealSol Academy.';err.classList.add('show');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
      return;
    }
    if(facData.migratedTo){
      err.textContent='This facility has been upgraded. Please use your new Facility ID: '+facData.migratedTo;err.classList.add('show');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
      return;
    }
    if(facData.suspended){
      err.textContent='This facility is currently suspended. Contact HealSol Academy.';err.classList.add('show');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
      return;
    }
    const staffRec = await fbGet(scStaffPath(fid, mob));
    if(!staffRec){
      err.textContent='Mobile number not registered. Contact your CHO.';err.classList.add('show');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
      return;
    }
    const expectedPwd = staffRec.password || mob.slice(-4);
    if(!nfAuthOK('staff',mob) && pwd !== expectedPwd){
      err.textContent='Incorrect password. Use the password you were given, or tap Forgot? to get help.';err.classList.add('show');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
      return;
    }
    err.classList.remove('show');
    // Load state
    choState.facilityCode  = fid;
    choState.roleId        = staffRec.role || 'CHO';
    choState.staffName     = staffRec.name || '';
    choState.staffMobile   = mob;
    choState.roleDone      = true;
    choState.progId        = facData.progId || 'nqas_12A';
    choState.facility.name     = facData.name || fid;
    choState.facility.district = facData.district || '';
    choState.facility.state    = facData.state || '';
    choState.facility.subscriptionStatus = facData.subscriptionStatus || null;
    choState.facility.progId   = facData.progId || 'nqas_12A';
    if(facData.startDate) choState.startDate = facData.startDate;
    // Mark setup done — all facility data loaded from Firebase
    choState.setupDone = true;
    try{ localStorage.setItem('sc_autologin', JSON.stringify((typeof NF_SECURE!=='undefined'&&NF_SECURE)?{fid, mob}:{fid, mob, pwd})); }catch(e){}
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
    await scStartApp();
  }catch(e){
    err.textContent='Connection error. Check internet and try again.';err.classList.add('show');
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-rocket" style="font-size:15px;"></i> Enter SC App';}
  }
}

// ── CHO (Facility Admin) Login ─────────────────────────────────
async function scChoLogin(){
  const fid  = (document.getElementById('sc-cho-fid')?.value||'').trim().toUpperCase();
  const pwd  = (document.getElementById('sc-cho-pwd')?.value||'').trim();
  const ak   = (document.getElementById('sc-cho-ak')?.value||'').trim();
  const err  = document.getElementById('sc-cho-err');
  if(!fid){err.textContent='Please enter your Facility ID.';err.classList.add('show');return;}
  if(!pwd){err.textContent='Please enter your admin password.';err.classList.add('show');return;}
  err.classList.remove('show');
  if(!db){ initFirebase(); await new Promise(r=>setTimeout(r,1000)); }
  try{
    const facData = await fbGet(scFacilityPath(fid));
    if(!facData){err.textContent='Facility ID not found. Contact HealSol Academy.';err.classList.add('show');return;}
    if(facData.migratedTo){err.textContent='This facility has been upgraded. Please use the new Facility ID: '+facData.migratedTo;err.classList.add('show');return;}
    if(facData.suspended){err.textContent='Facility suspended. Contact HealSol Academy.';err.classList.add('show');return;}
    if(pwd !== facData.choPassword){err.textContent='Incorrect admin password.';err.classList.add('show');return;}
    // One-time activation key
    if(!facData.accessKeyVerified){
      document.getElementById('sc-cho-ak-field').style.display='';
      if(!ak){err.textContent='Enter your one-time activation key from HealSol Academy.';err.classList.add('show');return;}
      const pubKey = await fbGet('shared/accesskey_sc');
      if(pubKey && ak.toUpperCase()!==pubKey.toUpperCase()){
        err.textContent='Invalid activation key.';err.classList.add('show');return;
      }
      await fbSet(scFacilityPath(fid)+'/accessKeyVerified', true);
    }
    err.classList.remove('show');
    scSubAdminCode = fid;
    scSubAdminData = facData;
    document.getElementById('login-screen').style.display='none';
    await scStartChoPanel(fid, facData);
  }catch(e){
    err.textContent='Connection error: '+e.message;err.classList.add('show');
  }
}

// ── Admin Login (override old function) ───────────────────────
function adminLogin(){
  const pwd = document.getElementById('admin-pwd')?.value||'';
  const err = document.getElementById('admin-err');
  if(!nfAuthOK('admin')&&(SC_ADMIN_PASSWORD===null||pwd !== SC_ADMIN_PASSWORD)){err.textContent='Incorrect password.';err.classList.add('show');return;}
  err.classList.remove('show');
  scStartAdminApp();
}

// ── Auto-login ────────────────────────────────────────────────
window.addEventListener('load', async function(){
  if(typeof NF_SECURE!=='undefined'&&NF_SECURE){   // secure sign-in restores sessions itself; wipe any password the old app saved
    try{ var old=JSON.parse(localStorage.getItem('sc_autologin')||'null'); if(old&&old.pwd) localStorage.removeItem('sc_autologin'); }catch(e){}
    return;
  }
  try{
    const saved = localStorage.getItem('sc_autologin');
    if(saved){
      const {fid,mob,pwd} = JSON.parse(saved);
      if(fid&&mob&&pwd){
        initFirebase();
        await new Promise(r=>setTimeout(r,1000));
        try{
          const facData = await fbGet(scFacilityPath(fid));
          if(!facData||facData.suspended||facData.migratedTo) throw new Error('Facility not available');
          const staffRec = await fbGet(scStaffPath(fid, mob));
          if(!staffRec) throw new Error('Staff not found');
          if(pwd !== (staffRec.password||mob.slice(-4))) throw new Error('Password changed');
          choState.facilityCode  = fid;
          choState.roleId        = staffRec.role||'CHO';
          choState.staffName     = staffRec.name||'';
          choState.staffMobile   = mob;
          choState.roleDone      = true;
          choState.progId        = facData.progId||'nqas_12A';
          choState.facility.name = facData.name||fid;
          choState.facility.district = facData.district||'';
          choState.facility.state    = facData.state||'';
          choState.facility.subscriptionStatus = facData.subscriptionStatus||null;
          choState.facility.progId   = facData.progId||'nqas_12A';
          if(facData.startDate) choState.startDate = facData.startDate;
          await scStartApp();
            choState.setupDone = true;
          return;
        }catch(e){
          localStorage.removeItem('sc_autologin');
        }
      }
    }
  }catch(e){}
  initFirebase();
});

// ── scStartApp: replaces old startCHOApp ─────────────────────
// scStartApp() → see SC v2 module

// Load/save state using mobile number as unique key
function scLoadState(){
  // Start clean for every login so a previous user's cards on a shared phone
  // can never show (or be synced) under the next user's mobile number.
  choState.cards={}; choState.streak=0;
  try{
    const key = getChoStateKey();
    const r = localStorage.getItem(key);
    if(r){
      const s = JSON.parse(r);
      // Only restore cards, streak, questTab from cache
      // ALL identity/facility/date fields come from Firebase — always
      if(s.cards)        choState.cards     = s.cards;
      if(s.streak)       choState.streak    = s.streak;
      if(s.questTab)     choState.questTab  = s.questTab;
      if(s.view)         choState.view      = s.view;
    }
    // NO fallback to old shared key — prevents cross-user contamination
  }catch(e){}
  // Always recalculate currentDay from Firebase startDate
  if(choState.startDate){
    const prog = getProg(choState.progId);
    choState.currentDay = computeCurrentDay(choState.startDate, prog ? prog.days : 30);
  }
}
function scSaveState(){
  try{ localStorage.setItem(getChoStateKey(), JSON.stringify(choState)); }catch(e){}
  scQueueSync();
}
// Aliases so old code still works
function loadChoState(){ scLoadState(); }
function scShowSetup(){ $('setup-screen').style.display='flex'; }

// ── Progress sync to Firebase ──────────────────────────────────
// scSyncProgress() → see SC v2 module

// ── Progress key (uses mobile) ────────────────────────────────
function getChoStateKey(){
  const mob = choState.staffMobile || scSafeName(choState.staffName) || choState.progId;
  return 'cho_prog_v2_'+(choState.facilityCode||'local')+'_'+mob;
}


// ══════════════════════════════════════════════════════════════
// SC CHO ADMIN PANEL (Facility Admin)
// ══════════════════════════════════════════════════════════════
async function scStartChoPanel(code, facData){
  appMode = 'sc-cho';
  document.getElementById('sc-cho-app').classList.add('vis');
  document.getElementById('sc-cho-fac-name').textContent = facData.name||code;
  document.getElementById('sc-cho-fac-code').textContent = code;
  // Load staff
  const staffData = await fbGet(scFacilityPath(code)+'/staff') || {};
  scSubAdminStaff = staffData;
  // Load start date
  const sdInp = document.getElementById('sc-cho-start-date');
  if(sdInp && facData.startDate) sdInp.value = facData.startDate;
  // Render
  scRenderChoStaff();
  scRenderChoProgress();
}

function scRenderChoStaff(){
  const cont = document.getElementById('sc-cho-staff-roster');
  if(!cont) return;
  cont.innerHTML = '';
  const ROLE_ORDER = ['CHO','MO','ANM','ASHA','MPW'];
  const byRole = {};
  ROLE_ORDER.forEach(r => byRole[r] = []);
  Object.entries(scSubAdminStaff).forEach(([mob,s])=>{
    const r = s.role||'CHO';
    if(!byRole[r]) byRole[r]=[];
    byRole[r].push({mob,...s});
  });
  ROLE_ORDER.forEach(roleId=>{
    const rd = getScRole(roleId);
    const members = byRole[roleId]||[];
    const sec = document.createElement('div');
    sec.style.cssText='margin-bottom:14px;';
    sec.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <span style="font-size:16px;">${rd.icon}</span>
          <div>
            <div style="font-size:11px;font-weight:800;color:var(--t1);">${rd.label}</div>
            <div style="font-size:9px;color:var(--t3);font-weight:600;">${members.length} registered</div>
          </div>
        </div>
        <button onclick="scOpenAddStaff('${roleId}')"
          style="background:var(--teal);color:#fff;border:none;border-radius:18px;padding:5px 13px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit;">
          + Add ${rd.label}
        </button>
      </div>`;
    if(!members.length){
      const empty = document.createElement('div');
      empty.style.cssText='background:var(--bgs);border-radius:9px;padding:9px 12px;border:1px dashed var(--br);font-size:11px;color:var(--t3);text-align:center;';
      empty.textContent='No '+rd.label+' added yet.';
      sec.appendChild(empty);
    } else {
      members.forEach(s=>{
        const card = document.createElement('div');
        card.style.cssText='background:var(--bgs);border-radius:10px;padding:10px 12px;margin-bottom:5px;border:1px solid var(--br);';
        card.innerHTML=`
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:28px;height:28px;border-radius:7px;background:var(--teal);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${scEsc((s.name||'?')[0].toUpperCase())}</div>
            <div style="flex:1;">
              <div style="font-size:11px;font-weight:800;color:var(--t1);">${scEsc(s.name||s.mob)}</div>
              <div style="font-size:9px;color:var(--t3);">📱 ${scEsc(s.mob)} · 🔑 Pwd: ${scEsc(s.password||s.mob.slice(-4))}</div>
            </div>
            <div style="display:flex;gap:5px;">
              <button onclick="scResetStaffPwd('${scJs(s.mob)}')"
                style="border:1.5px solid var(--br);border-radius:7px;padding:3px 8px;font-size:9px;font-weight:800;cursor:pointer;background:transparent;color:var(--t2);font-family:inherit;">
                <i class="ti ti-key" style="font-size:9px;"></i> Pwd
              </button>
              <button onclick="scRemoveStaff('${scJs(s.mob)}')"
                style="border:1.5px solid #FECACA;border-radius:7px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;color:#DC2626;font-size:12px;">
                <i class="ti ti-x"></i>
              </button>
            </div>
          </div>`;
        sec.appendChild(card);
      });
    }
    cont.appendChild(sec);
  });
}

function scOpenAddStaff(roleId){
  const rd = getScRole(roleId);
  document.getElementById('sc-add-role-id').value = roleId;
  document.getElementById('sc-add-role-label').textContent = rd.label;
  document.getElementById('sc-add-name').value='';
  document.getElementById('sc-add-mob').value='';
  document.getElementById('sc-add-pwd').value='';
  document.getElementById('sc-add-err').textContent='';
  document.getElementById('sc-add-modal').classList.add('open');
}
function scCloseAddStaff(){ document.getElementById('sc-add-modal').classList.remove('open'); }

function scAddMobileInput(){
  const mob=(document.getElementById('sc-add-mob')?.value||'').trim();
  if(mob.length>=4) document.getElementById('sc-add-pwd').value=mob.slice(-4);
}

async function scSaveNewStaff(){
  const roleId = document.getElementById('sc-add-role-id')?.value||'';
  const name   = (document.getElementById('sc-add-name')?.value||'').trim();
  const mob    = (document.getElementById('sc-add-mob')?.value||'').trim();
  const pwd    = (document.getElementById('sc-add-pwd')?.value||'').trim()||mob.slice(-4);
  const errEl  = document.getElementById('sc-add-err');
  if(!name){errEl.textContent='Name is required.';errEl.style.display='block';return;}
  if(!mob||mob.length!==10||isNaN(Number(mob))){errEl.textContent='Enter a valid 10-digit mobile number.';errEl.style.display='block';return;}
  if(scSubAdminStaff[mob]){errEl.textContent='This mobile number is already registered.';errEl.style.display='block';return;}
  const rec={name,mobile:mob,role:roleId,password:pwd,addedAt:new Date().toISOString(),addedBy:'cho'};
  const ok = await fbSet(scStaffPath(scSubAdminCode, mob), rec);
  if(!ok){errEl.textContent='Failed to save. Check connection.';errEl.style.display='block';return;}
  scSubAdminStaff[mob]=rec;
  scCloseAddStaff();
  scRenderChoStaff();
  showToast(name+' added successfully.','ok');
}

async function scResetStaffPwd(mob){
  const s=scSubAdminStaff[mob]||{};
  const v=await scDialog({title:'Reset password',icon:'🔑',okLabel:'Reset password',
    message:'Set a new password for '+(s.name||mob)+' ('+mob+').',
    fields:[{key:'pwd',label:'New password',required:true,minLength:4,placeholder:'min 4 characters'}]});
  if(!v) return;
  const ok = await fbSet(scStaffPath(scSubAdminCode,mob)+'/password', v.pwd);
  if(ok){if(scSubAdminStaff[mob])scSubAdminStaff[mob].password=v.pwd;scRenderChoStaff();showToast('Password reset.','ok');}
  else showToast('Failed to reset.','err');
}

async function scRemoveStaff(mob){
  const ok = await showConfirm('Remove this staff member?','🗑️','Remove','Remove','var(--red-dk)');
  if(!ok) return;
  try{await db.ref(scStaffPath(scSubAdminCode,mob)).remove();}catch(e){}
  delete scSubAdminStaff[mob];
  scRenderChoStaff();
  showToast('Staff member removed.','ok');
}

async function scChoSetStartDate(){
  const val = document.getElementById('sc-cho-start-date')?.value;
  if(!val){showToast('Please select a date.','err');return;}
  const ok = await fbSet(scFacilityPath(scSubAdminCode)+'/startDate', val);
  if(ok) showToast('Start date set: '+val,'ok');
  else showToast('Failed to save date.','err');
}

// scRenderChoProgress() → see SC v2 module

async function scChoLogout(){
  const ok = await showConfirm('Logout of Facility Admin panel?','👋','Logout','Logout','var(--teal)');
  if(!ok) return;
  document.getElementById('sc-cho-app').classList.remove('vis');
  document.getElementById('login-screen').style.display='';
  scSubAdminCode='';scSubAdminData={};scSubAdminStaff={};
  appMode=null; if(typeof scCloseLiveSessions==='function') scCloseLiveSessions();
}


// ══════════════════════════════════════════════════════════════
// SC HEALSOL MASTER DASHBOARD
// ══════════════════════════════════════════════════════════════
async function scStartAdminApp(){
  appMode='sc-admin';
  document.getElementById('login-screen').style.display='none';
  document.getElementById('admin-app').classList.add('vis');
  const grid=document.getElementById('sc-master-grid');
  if(grid) grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--t3);"><i class="ti ti-loader" style="animation:spin 1s linear infinite;font-size:24px;display:block;margin-bottom:10px;"></i>Loading facilities...</div>';
  if(!db){initFirebase();await new Promise(r=>setTimeout(r,1500));}
  let retries=0;while(!db&&retries<3){await new Promise(r=>setTimeout(r,800));retries++;}
  if(!db){
    if(grid)grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--red-dk);font-size:13px;line-height:1.6;"><i class="ti ti-wifi-off" style="font-size:28px;display:block;margin-bottom:12px;"></i><strong>Firebase not connected.</strong><br>Check that:<br>1. healsolhealth-hub.github.io is in Firebase Authorized Domains<br>2. Database rules allow read/write<br>3. API key is correct in the app<br><br><button onclick="scStartAdminApp()" style="background:var(--teal);color:#fff;border:none;border-radius:10px;padding:9px 20px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit;">Retry</button></div>';
    return;
  }
  await scLoadMasterData();
  scRenderMasterDashboard();
}

// scLoadMasterData() → see SC v2 module

// scRenderMasterDashboard() → see SC v2 module

async function scEnrollFacility(){
  const code=(document.getElementById('sc-enroll-code')?.value||'').trim().toUpperCase();
  const name=(document.getElementById('sc-enroll-name')?.value||'').trim();
  const district=(document.getElementById('sc-enroll-district')?.value||'').trim();
  const state=(document.getElementById('sc-enroll-state')?.value||'').trim();
  const progId=document.getElementById('sc-enroll-prog')?.value||'nqas_12A';
  const choName=(document.getElementById('sc-enroll-choname')?.value||'').trim();
  const choPwd=(document.getElementById('sc-enroll-chopwd')?.value||'').trim();
  const choMob=(document.getElementById('sc-enroll-chomob')?.value||'').trim();
  if(!code||!name){showToast('Facility ID and name are required.','err');return;}
  if(!choPwd){showToast('CHO admin password is required.','err');return;}
  if(!/^\d{10}$/.test(choMob)){showToast('Enter the CHO\'s 10-digit mobile number.','err');return;}
  const btn=document.querySelector('[onclick="scEnrollFacility()"]');
  if(btn){btn.disabled=true;btn.innerHTML='<i class="ti ti-loader" style="animation:spin 1s linear infinite;font-size:14px;"></i> Enrolling...';}

  // Ensure Firebase is connected
  if(!db){ initFirebase(); await new Promise(r=>setTimeout(r,1500)); }
  let retries=0;
  while(!db && retries<3){ await new Promise(r=>setTimeout(r,800)); retries++; }
  if(!db){
    showToast('Firebase not connected. Check your internet and reload.','err');
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-circle-plus" style="font-size:14px;"></i> Enroll Facility';}
    return;
  }

  try{
    const existing=await fbGet(scFacilityPath(code));
    if(existing){
      showToast('Facility ID "'+code+'" already exists.','err');
      if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-circle-plus" style="font-size:14px;"></i> Enroll Facility';}
      return;
    }
    const accessLevel=(document.querySelector('input[name="enroll-access"]:checked')||{}).value||'contract';
    const facData={name,district,state,progId,choName,choPassword:choPwd,
      enrolledAt:new Date().toISOString(),active:true,suspended:false,
      subscriptionStatus:accessLevel,accessKeyVerified:true,
      staff:{[choMob]:{name:choName||'CHO',mobile:choMob,role:'CHO',password:choMob.slice(-4),addedAt:new Date().toISOString(),addedBy:'healsol'}}};
    if(accessLevel==='trial'){
      facData.trialStartDate=new Date().toISOString();
    }
    const ok=await fbSet(scFacilityPath(code),facData);
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-circle-plus" style="font-size:14px;"></i> Enroll Facility';}
    if(!ok){showToast('Write failed. Check Firebase rules allow write access.','err');return;}
  }catch(err){
    console.error('Enroll error:',err);
    showToast('Error: '+err.message,'err');
    if(btn){btn.disabled=false;btn.innerHTML='<i class="ti ti-circle-plus" style="font-size:14px;"></i> Enroll Facility';}
    return;
  }
  ['sc-enroll-code','sc-enroll-name','sc-enroll-district','sc-enroll-state','sc-enroll-choname','sc-enroll-chomob','sc-enroll-chopwd'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  const fullRadio=document.getElementById('enroll-access-full');if(fullRadio){fullRadio.checked=true;enrollAccessToggle();}
  await scLoadMasterData();
  scRenderMasterDashboard();
  showToast('"'+name+'" enrolled successfully!','ok');
}

async function scEditFacility(code){
  const fac=scMasterFacilities[code]||{};
  const v=await scDialog({title:'Edit facility',icon:'🏥',okLabel:'Save changes',
    message:'Facility ID: '+code,
    fields:[
      {key:'name',label:'Facility name',required:true,value:fac.name||code},
      {key:'district',label:'District',value:fac.district||''},
      {key:'block',label:'Block',value:fac.block||((fac.links||{}).chc||{}).block||'',hint:'Used for block and state dashboards. Filled from the CHC link when linked.'},
      {key:'state',label:'State',value:fac.state||''},
      {key:'choName',label:'CHO name',value:fac.choName||''},
      {key:'choPwd',label:'CHO password',placeholder:'Leave blank to keep current',hint:'Only fill this in to change the Facility Admin password.'}
    ],
    validate:v=>v.choPwd&&v.choPwd.length<4?'CHO password must be at least 4 characters.':null});
  if(!v) return;
  const updated={...fac,name:v.name,district:v.district,block:(v.block||'').trim()||null,state:v.state,choName:v.choName};
  if(v.choPwd) updated.choPassword=v.choPwd;
  const ok=await fbSet(scFacilityPath(code),updated);
  if(!ok){showToast('Save failed — check connection.','err');return;}
  scMasterFacilities[code]=updated;
  scRenderMasterDashboard();
  showToast('Facility updated.','ok');
}

async function scSuspendFacility(code){
  const fac=scMasterFacilities[code]||{};
  const isSuspended=fac.suspended;
  const ok=await showConfirm((isSuspended?'Reactivate':'Suspend')+' "'+fac.name+'"?',isSuspended?'▶️':'⏸️',(isSuspended?'Reactivate':'Suspend')+' Facility',(isSuspended?'Reactivate':'Suspend'),'var(--teal)');
  if(!ok)return;
  const updated={...fac,suspended:!isSuspended,suspendedAt:!isSuspended?new Date().toISOString():null};
  await fbSet(scFacilityPath(code),updated);
  scMasterFacilities[code]=updated;
  scRenderMasterDashboard();
  showToast('Facility '+(isSuspended?'reactivated':'suspended')+'.','ok');
}

async function scCancelFacility(code){
  const fac=scMasterFacilities[code]||{};
  const ok1=await showConfirm('Permanently cancel "'+fac.name+'"?','⛔','Cancel Programme','Cancel','var(--red)');if(!ok1)return;
  const ok2=await showConfirm('Are you sure? All data will be removed.','⛔','Final Confirmation','Yes, Cancel','var(--red)');if(!ok2)return;
  try{await db.ref(scFacilityPath(code)).remove();delete scMasterFacilities[code];scRenderMasterDashboard();showToast('Facility removed.','ok');}
  catch(e){showToast('Failed: '+e.message,'err');}
}

async function scAdminSetDate(code){
  document.getElementById('sc-date-fac-name').textContent=scMasterFacilities[code]?.name||code;
  document.getElementById('sc-date-fac-code').textContent=code;
  document.getElementById('sc-date-input').value=scMasterFacilities[code]?.startDate||'';
  document.getElementById('sc-date-modal').classList.add('open');
}
async function scSaveAdminDate(){
  const code=document.getElementById('sc-date-fac-code').textContent;
  const val=document.getElementById('sc-date-input').value;
  if(!val){showToast('Select a date.','err');return;}
  await fbSet(scFacilityPath(code)+'/startDate',val);
  if(scMasterFacilities[code]) scMasterFacilities[code].startDate=val;
  document.getElementById('sc-date-modal').classList.remove('open');
  scRenderMasterDashboard();
  showToast('Start date set for '+code,'ok');
}

// scDrillIn() → see SC v2 module
function scDrillBack(){
  document.getElementById('sc-drill-panel').style.display='none';
  document.getElementById('sc-master-grid').style.display='';
  document.getElementById('sc-master-back').style.display='none';
}

async function scAdminResetPwd(code,mob){
  const s=((scMasterFacilities[code]||{}).staff||{})[mob]||{};
  const v=await scDialog({title:'Reset password',icon:'🔑',okLabel:'Reset password',
    message:'Set a new password for '+(s.name||mob)+' ('+mob+').',
    fields:[{key:'pwd',label:'New password',required:true,minLength:4,placeholder:'min 4 characters'}]});
  if(!v) return;
  const ok=await fbSet(scStaffPath(code,mob)+'/password',v.pwd);
  showToast(ok?'Password reset.':'Failed to reset.',ok?'ok':'err');
}

async function scGenerateReport(type,code){
  const facs=code?{[code]:scMasterFacilities[code]}:scMasterFacilities;
  const progs=code?{[code]:scMasterProgress[code]}:scMasterProgress;
  const now=new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  let html='<html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;margin:24px;color:#111;}h1{color:#1E6B5E;}h2{color:#1E6B5E;border-bottom:2px solid #1E6B5E;padding-bottom:4px;}table{width:100%;border-collapse:collapse;margin-bottom:16px;}th{background:#1E6B5E;color:#fff;padding:7px 10px;font-size:11px;text-align:left;}td{padding:7px 10px;font-size:11px;border-bottom:1px solid #eee;}.footer{margin-top:24px;font-size:10px;color:#9CA3AF;text-align:center;border-top:1px solid #eee;padding-top:12px;}</style></head><body>';
  html+=`<h1>NQAS | FAST — ${NF_CFG.name}</h1><h2>${type==='facility'?'Facility Report':type==='role'?'Role-wise Report':'Programme Report'}</h2><p><strong>Generated:</strong> ${now}</p>`;
  html+='<table><tr><th>Facility</th><th>Package</th><th>CHO</th><th>Staff</th><th>Cards Verified / Done</th><th>Readiness</th></tr>';
  Object.entries(facs).forEach(([code,fac])=>{
    if(!fac)return;
    const staff=fac.staff||{};
    const agg=scFacilityReadiness(fac.progId,progs[code]||{},staff);
    const pct=agg.pct;
    const col=pct>=80?'#22C55E':pct>=70?'#1E6B5E':pct>=50?'#F59E0B':'#EF4444';
    html+=`<tr><td><strong>${scEsc(fac.name||code)}</strong><br><span style="font-size:10px;color:#666;">${scEsc([fac.district,fac.state].filter(Boolean).join(', '))}</span></td><td>${scEsc(scPkgShort(fac.progId))}</td><td>${scEsc(fac.choName||'—')}</td><td>${Object.keys(staff).length}</td><td>${agg.daysVerified}/${agg.daysDone}</td><td style="color:${col};font-weight:800;">${agg.max>0?pct+'%':'—'}</td></tr>`;
  });
  html+=`</table><div class="footer">NQAS | FAST · HealSol Academy · ${NF_CFG.name} · ${now}</div>
<style>
.rpt-filter-btn{padding:5px 13px;border-radius:20px;font-size:11px;font-weight:700;border:1.5px solid var(--br);background:var(--bgc);color:var(--t3);cursor:pointer;font-family:inherit;transition:all 0.12s;}
.rpt-filter-btn.active{background:var(--teal);color:#fff;border-color:var(--teal);}
</style>


<!-- ══ Report Filter Modal (SC style) ══════════════════════ -->


</body></html>`;
  const win=window.open('','_blank');win.document.write(html);win.document.close();setTimeout(()=>win.print(),500);
}

async function scAdminSetAccessKey(){
  const key=document.getElementById('sc-ak-input')?.value.trim();
  if(!key){showToast('Enter a key.','err');return;}
  const ok=await fbSet('shared/accesskey_sc',key.toUpperCase());
  if(ok) showToast(NF_CFG.short+' access key set.','ok');else showToast('Failed.','err');
}

function scSetupShowFacSetup(){
  const el=document.getElementById('sc-fac-setup-section');
  if(el) el.style.display=el.style.display==='none'?'':'none';
}



// ══════════════════════════════════════════════════════════════
// REPORT FILTER MODAL
// ══════════════════════════════════════════════════════════════
var _rptType = 'facility';
var _rptProg = '';
var _rptRole = '';

function openReportModal(type){
  try{
  _rptType = type;
  _rptProg = '';
  _rptRole = '';
  var modal = document.getElementById('rpt-filter-modal');
  if(!modal){ showToast('Report dialog is unavailable — please reload.','err'); return; }
  modal.classList.add('open');

  // Set title
  var titles = {facility:'📊 Facility Report',role:'👤 Role-wise Report',prog:'📋 Programme Report'};
  document.getElementById('rpt-title').textContent = titles[type] || 'Report';

  // Show/hide role row
  document.getElementById('rpt-role-row').style.display = type==='role' ? '' : 'none';

  // Populate facility checkboxes
  var list = document.getElementById('rpt-fac-list');
  list.innerHTML = '';
  Object.entries(scMasterFacilities||{}).forEach(function(entry){
    var code=entry[0], fac=entry[1];
    if(!fac) return;
    var label = document.createElement('label');
    label.style.cssText = 'display:flex;align-items:center;gap:8px;font-size:12px;color:#374151;cursor:pointer;padding:3px 0;';
    var cb = document.createElement('input');
    cb.type='checkbox'; cb.value=code; cb.checked=true;
    cb.style.cssText = 'width:14px;height:14px;accent-color:#1E6B5E;cursor:pointer;';
    cb.addEventListener('change', rptUpdatePreview);
    label.appendChild(cb);
    label.appendChild(document.createTextNode((fac.name||code)+' · '+(fac.progId||'—')));
    list.appendChild(label);
  });

  // Reset prog/role buttons
  document.querySelectorAll('.rpt-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  var allBtn = document.querySelector('#rpt-prog-btns .rpt-filter-btn');
  if(allBtn) allBtn.classList.add('active');
  var allRoleBtn = document.querySelector('#rpt-role-btns .rpt-filter-btn');
  if(allRoleBtn) allRoleBtn.classList.add('active');

  // Set today's date as default
  var today = new Date().toISOString().split('T')[0];
  var fromEl = document.getElementById('rpt-date-from');
  var toEl   = document.getElementById('rpt-date-to');
  if(toEl) toEl.value = today;

  rptUpdatePreview();
  }catch(e){ console.error(e); showToast('Could not open report options: '+e.message,'err'); }
}

function closeReportModal(){
  document.getElementById('rpt-filter-modal').classList.remove('open');
}

function rptSelectAllFacs(val){
  document.querySelectorAll('#rpt-fac-list input[type=checkbox]').forEach(function(cb){
    cb.checked = val;
  });
  rptUpdatePreview();
}

function rptToggleProg(btn, prog){
  _rptProg = prog;
  document.querySelectorAll('#rpt-prog-btns .rpt-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  rptUpdatePreview();
}

function rptToggleRole(btn, role){
  _rptRole = role;
  document.querySelectorAll('#rpt-role-btns .rpt-filter-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  rptUpdatePreview();
}

function rptGetSelectedFacs(){
  var selected = [];
  document.querySelectorAll('#rpt-fac-list input[type=checkbox]').forEach(function(cb){
    if(cb.checked) selected.push(cb.value);
  });
  return selected;
}

function rptUpdatePreview(){
  var selected = rptGetSelectedFacs();
  var progFilter = _rptProg;
  var roleFilter = _rptRole;
  var filtered = selected.filter(function(code){
    var fac = (scMasterFacilities||{})[code];
    if(!fac) return false;
    if(progFilter && fac.progId !== progFilter) return false;
    return true;
  });
  var totalStaff = 0;
  filtered.forEach(function(code){
    var fac = (scMasterFacilities||{})[code]||{};
    var staff = fac.staff||{};
    if(roleFilter){
      totalStaff += Object.values(staff).filter(function(s){ return s.role===roleFilter; }).length;
    } else {
      totalStaff += Object.keys(staff).length;
    }
  });
  var prev = document.getElementById('rpt-preview');
  if(prev){
    prev.innerHTML = '<strong>Will include:</strong> '
      + '<span style="color:#1E6B5E;font-weight:800;">'+filtered.length+' facilities</span>'
      + (roleFilter?' · <span style="color:#1E6B5E;font-weight:800;">'+roleFilter+' role only</span>':'')
      + (progFilter?' · <span style="color:#1E6B5E;font-weight:800;">'+progFilter+' only</span>':'')
      + ' · <span style="color:#1E6B5E;font-weight:800;">'+totalStaff+' staff members</span>';
  }
}

function rptGenerate(action){
  var selected = rptGetSelectedFacs();
  var progFilter = _rptProg;
  var roleFilter = _rptRole;
  var filtered = {};
  selected.forEach(function(code){
    var fac = (scMasterFacilities||{})[code];
    if(!fac) return;
    if(progFilter && fac.progId !== progFilter) return;
    filtered[code] = fac;
  });

  if(Object.keys(filtered).length === 0){
    scAlert('No facilities match the selected filters. Please adjust your selection.','No facilities','🔍');
    return;
  }

  // Build report HTML
  var now = new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'});
  var typeLabel = _rptType==='facility'?'Facility Report':_rptType==='role'?'Role-wise Report':'Programme Report';
  var filterDesc = [];
  if(progFilter) filterDesc.push('Programme: '+progFilter);
  if(roleFilter) filterDesc.push('Role: '+roleFilter);
  filterDesc.push(Object.keys(filtered).length+' facilities selected');

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<style>body{font-family:Arial,sans-serif;margin:28px;color:#111;}'
    + 'h1{color:#1E6B5E;margin-bottom:4px;}h2{color:#1E6B5E;border-bottom:2px solid #1E6B5E;padding-bottom:6px;margin-top:20px;}'
    + 'table{width:100%;border-collapse:collapse;margin-bottom:20px;}'
    + 'th{background:#1E6B5E;color:#fff;padding:8px 10px;font-size:11px;text-align:left;}'
    + 'td{padding:7px 10px;font-size:11px;border-bottom:1px solid #eee;}'
    + 'tr:nth-child(even){background:#F8FAFC;}'
    + '.badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;}'
    + '.green{background:#DCFCE7;color:#15803D;}.amber{background:#FEF3C7;color:#92400E;}.red{background:#FEE2E2;color:#DC2626;}'
    + '.footer{margin-top:28px;font-size:10px;color:#9CA3AF;text-align:center;border-top:1px solid #eee;padding-top:14px;}'
    + '@media print{.no-print{display:none;}}'
    + '</style></head><body>';

  html += '<h1>NQAS | FAST — '+NF_CFG.name+'</h1>';
  html += '<h2>'+typeLabel+'</h2>';
  html += '<p><strong>Generated:</strong> '+now+'</p>';
  if(filterDesc.length) html += '<p><strong>Filters:</strong> '+filterDesc.join(' · ')+'</p>';

  if(_rptType === 'facility'){
    html += '<table><tr><th>Facility</th><th>District</th><th>Package</th><th>CHO</th><th>Staff</th><th>Cards Verified / Done</th><th>Readiness</th></tr>';
    Object.entries(filtered).forEach(function(entry){
      var code=entry[0], fac=entry[1];
      var staff=fac.staff||{};
      var agg=scFacilityReadiness(fac.progId,(scMasterProgress||{})[code]||{},staff);
      var pct=agg.pct;
      var cls=pct>=80?'green':pct>=50?'amber':'red';
      html+='<tr><td><strong>'+scEsc(fac.name||code)+'</strong><br><small>'+scEsc(code)+'</small></td>'
        +'<td>'+scEsc(fac.district||'—')+'</td>'
        +'<td>'+scEsc(scPkgShort(fac.progId))+'</td>'
        +'<td>'+scEsc(fac.choName||'—')+'</td>'
        +'<td>'+Object.keys(staff).length+'</td>'
        +'<td>'+agg.daysVerified+'/'+agg.daysDone+'</td>'
        +'<td><span class="badge '+cls+'">'+(agg.max>0?pct+'%':'—')+'</span>'+(agg.max>0?(agg.nqas.meets?' ✓ NQAS':' ✗ NQAS'):'')+'</td></tr>';
    });
    html += '</table>';
  }

  else if(_rptType === 'role'){
    html += '<table><tr><th>Facility</th><th>Staff Name</th><th>Role</th><th>Mobile</th><th>Cards Verified / Done</th><th>Readiness</th></tr>';
    Object.entries(filtered).forEach(function(entry){
      var code=entry[0], fac=entry[1];
      var staff=fac.staff||{};
      var agg=scFacilityReadiness(fac.progId,(scMasterProgress||{})[code]||{},staff);
      var byMob={}; agg.staff.forEach(function(x){ byMob[x.mob]=x.res; });
      Object.entries(staff).forEach(function(se){
        var mob=se[0], s=se[1];
        if(roleFilter && s.role!==roleFilter) return;
        var r=byMob[mob]||{pct:0,daysVerified:0,daysDone:0,max:0};
        var pct=r.pct;
        var cls=pct>=80?'green':pct>=50?'amber':'red';
        html+='<tr><td>'+scEsc(fac.name||code)+'</td>'
          +'<td>'+scEsc(s.name||'—')+'</td>'
          +'<td>'+scEsc(s.role||'—')+'</td>'
          +'<td>'+scEsc(mob)+'</td>'
          +'<td>'+r.daysVerified+'/'+r.daysDone+'</td>'
          +'<td><span class="badge '+cls+'">'+(r.max>0?pct+'%':'—')+'</span></td></tr>';
      });
    });
    html += '</table>';
  }

  else if(_rptType === 'prog'){
    var progGroups={};
    Object.entries(filtered).forEach(function(entry){
      var code=entry[0], fac=entry[1];
      var p=fac.progId||'Unknown';
      if(!progGroups[p]) progGroups[p]=[];
      progGroups[p].push({code,fac});
    });
    Object.entries(progGroups).forEach(function(pe){
      var prog=pe[0], items=pe[1];
      html+='<h2>Package: '+scEsc(scPkgLabel(prog))+'</h2>';
      html+='<table><tr><th>Facility</th><th>District</th><th>CHO</th><th>Staff</th><th>Readiness</th></tr>';
      items.forEach(function(item){
        var code=item.code, fac=item.fac;
        var staff=fac.staff||{};
        var agg=scFacilityReadiness(fac.progId,(scMasterProgress||{})[code]||{},staff);
        var pct=agg.pct;
        var cls=pct>=80?'green':pct>=50?'amber':'red';
        html+='<tr><td><strong>'+scEsc(fac.name||code)+'</strong></td>'
          +'<td>'+scEsc(fac.district||'—')+'</td>'
          +'<td>'+scEsc(fac.choName||'—')+'</td>'
          +'<td>'+Object.keys(staff).length+'</td>'
          +'<td><span class="badge '+cls+'">'+(agg.max>0?pct+'%':'—')+'</span></td></tr>';
      });
      html+='</table>';
    });
  }

  html += '<div class="footer">NQAS | FAST · HealSol Academy · '+NF_CFG.name+' · Generated: '+now+'</div>';
  html += '</body></html>';

  if(action === 'preview'){
    // Show in a new window WITHOUT auto-printing
    var win = window.open('','_blank','width=900,height=700');
    win.document.write(html
      + '<div class="no-print" style="position:fixed;bottom:20px;right:20px;display:flex;gap:10px;">'
      + '<button onclick="window.print()" style="background:#1E6B5E;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:800;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.2);">🖨 Print / Save PDF</button>'
      + '<button onclick="window.close()" style="background:#64748B;color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:800;cursor:pointer;">✕ Close</button>'
      + '</div>');
    win.document.close();
  } else {
    // Print directly
    var win = window.open('','_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(function(){ win.print(); }, 800);
  }
  closeReportModal();
}
