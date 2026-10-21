
// ══════════════════════════════════════════════════════════════
// FACILITY TYPES — one app and one Firebase project for SC, UPHC, PHC and CHC.
// NF_APP = app-wide settings (Firebase project, App Check, sign-in domain, home / Verify pages).
// NF_LEVELS = what differs per facility type (wording, roles, in-charge, verifiers, pass marks, which card system).
// NF_CFG = the type in use: Sub-Centre until a facility is opened; nfSetLevel(type) switches it when a staff
// member opens a facility (sc_facilities/{code}/type; none = Sub-Centre). The card system is a "core" that
// registers itself with nfRegisterCore(); NF_CFG.core names the one this type uses. Database paths keep their
// sc_ names for every type (sc_facilities holds UPHCs too).
// ══════════════════════════════════════════════════════════════
// STAGING (test copy): the same app opened at staging.thehealsol.com (repository nqas-fast-staging) uses the separate
// Firebase project healsol-nqas-uphc — test logins and test data only, never the live database. A ribbon says so.
var NF_STAGE=(function(){ try{ return location.hostname==='staging.thehealsol.com'; }catch(e){ return false; } })();
var NF_APP_LIVE_FIREBASE={
    apiKey:"AIzaSyD_GvvKgGM4CZRE2fRKhhrg8kEIEP2kGjQ",
    authDomain:"healsol-nqas.firebaseapp.com",
    databaseURL:"https://healsol-nqas-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"healsol-nqas",
    storageBucket:"healsol-nqas.firebasestorage.app",
    messagingSenderId:"282745702969",
    appId:"1:282745702969:web:fa279bfdc881d155229be8"
};
var NF_APP_STAGE_FIREBASE={
    apiKey:"AIzaSyCDp461H7ZpZtt7BllZ2hYvGWTRf5EmVy8",
    authDomain:"healsol-nqas-uphc.firebaseapp.com",
    databaseURL:"https://healsol-nqas-uphc-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:"healsol-nqas-uphc",
    storageBucket:"healsol-nqas-uphc.firebasestorage.app",
    messagingSenderId:"566144651764",
    appId:"1:566144651764:web:ec32abaaa06c57bbc2a9a1"
};
var NF_APP={
  firebase:NF_STAGE?NF_APP_STAGE_FIREBASE:NF_APP_LIVE_FIREBASE,
  appCheckKey:'6Lf7xd8tAAAAACG20kXsbRb0-2dgg9eWvuEhJTjn',   // Fraud Defense (reCAPTCHA Enterprise) site key, registered in Firebase App Check (live only — cleared below for staging)
  emailDomain:'accounts.nqasfast.app',
  // where "open the app" links point: the one-app address when running there (repository nqas-fast), otherwise the
  // SC page on thehealsol.com (repository nqas-app, live SC pilot)
  appHome:(function(){ try{ var h=location.hostname; if(h==='app.thehealsol.com'||h==='staging.thehealsol.com') return 'https://'+h+'/'; }catch(e){} return 'https://www.thehealsol.com/nqas-fast-sc'; })(),
  // certificates: the Wix Verify page reads the live database; on staging the app's own Verify page (?cert=) is used
  verifyBase:NF_STAGE?'https://staging.thehealsol.com/':'https://www.thehealsol.com/nqas-fast-sc-certificate'
};
if(NF_STAGE) NF_APP.appCheckKey='';   // staging runs without App Check (its functions do not enforce it)
// staging ribbon, so nobody mistakes the test copy for the live app
if(NF_STAGE) document.addEventListener('DOMContentLoaded',function(){ try{ var r=document.createElement('div'); r.id='nf-stage-ribbon';
  r.textContent='TEST SITE · staging data (healsol-nqas-uphc) — not the live app';
  r.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483000;background:#B91C1C;color:#fff;font:700 11px/1.6 system-ui,sans-serif;text-align:center;padding:2px 6px;pointer-events:none;opacity:.92';
  document.body.appendChild(r); document.body.classList.add('nf-stage'); document.title='[TEST] '+document.title; }catch(e){} });
var NF_LEVELS={
  sc:{
    id:'sc', core:'sc', ready:true,
    name:'Sub-Centre', plural:'Sub-Centres', short:'SC', nameHi:'उप-केंद्र',
    tagline:'Get your Sub-Centre NQAS-ready in 60 days',
    inCharge:'CHO', inChargeLabel:'CHO',
    verifierRoles:['CHO','MO'],
    roles:[
      {id:'General',label:'All Staff (General)',       icon:'👥', canVerify:false, requireName:false},
      {id:'CHO',    label:'Community Health Officer', icon:'🏥', canVerify:true,  requireName:false},
      {id:'ANM',    label:'ANM',                      icon:'💉', canVerify:false, requireName:true},
      {id:'ASHA',   label:'ASHA',                     icon:'🌸', canVerify:false, requireName:true},
      {id:'MPW',    label:'MPW',                      icon:'🌿', canVerify:false, requireName:false},
      {id:'MO',     label:'Medical Officer',          icon:'🩺', canVerify:true,  requireName:false}
    ],
    passMark:{overall:70, aoc:70}
  },
  uphc:{
    id:'uphc', core:'dept', ready:false,     // department core (dept/core.js); ready: open for self-registration (when tested)
    name:'UPHC', plural:'UPHCs', short:'UPHC', nameHi:'शहरी प्राथमिक स्वास्थ्य केंद्र',
    tagline:'Get your UPHC NQAS-ready in 60 days',
    inCharge:'Coordinator', inChargeLabel:'UPHC Coordinator',
    clinicalInCharge:'MOIC',
    verifierRoles:[],          // verification is by department leads (UPHC core)
    checklist:'uphc-checklist',   // data file (app/src/data/uphc/checklist.json), loaded when a UPHC opens
    days:60,
    // packages (prices later): without / with delivery services — the same 12-department checklist (HealSol 16 Oct: no
    // delivery department; Maternity Health as it is). All departments start the baseline together (one start date).
    programmes:[{id:'nqas_uphcA',label:'UPHC — without delivery services (60 days)'},{id:'nqas_uphcB',label:'UPHC — with delivery services (60 days)'}],
    // departments (HealSol 17 Oct): the staff posted in a department fill the card; its lead compares, settles disputes and assigns
    // actions (does not fill). Until the Coordinator names a lead, the MO in-charge leads the clinical ones and the Coordinator the
    // others. One person filling → her card counts as checked; the lead spot-checks 1 in 10 Met and assigns the rest.
    // Outreach: USHAs fill, the ANM / Field Monitor compares (xcheck), only real disputes go to the Outreach lead.
    departments:[
      {id:'GC', name:'General Clinic',            clinical:true,  lead:'MOIC'},
      {id:'MH', name:'Maternity Health',          clinical:true,  lead:'MOIC'},
      {id:'NB', name:'New Born & Child Health',   clinical:true,  lead:'MOIC'},
      {id:'IM', name:'Immunization',              clinical:true,  lead:'MOIC'},
      {id:'FP', name:'Family Planning',           clinical:true,  lead:'MOIC'},
      {id:'CD', name:'Communicable Disease',      clinical:true,  lead:'MOIC'},
      {id:'NCD',name:'Non-Communicable Disease',  clinical:true,  lead:'MOIC'},
      {id:'ER', name:'Dressing Room & Emergency', clinical:true,  lead:'MOIC'},
      {id:'PH', name:'Pharmacy',                  clinical:false, lead:'Coordinator'},
      {id:'LAB',name:'Laboratory',                clinical:false, lead:'Coordinator'},
      {id:'OR', name:'Outreach',                  clinical:false, lead:'OutreachSup'},
      {id:'GA', name:'General Administration',    clinical:false, lead:'Coordinator'}
    ],
    // who works on which department until the Coordinator changes it (Set-up → Departments). Coordinator and MO in-charge see all.
    defaultTeams:{
      MO:['GC','MH','NB','IM','FP','CD','NCD','ER'], StaffNurse:['GC','MH','NB','IM','ER'], ANM:['MH','NB','IM','FP','OR'],
      LHV:['MH','NB','FP','OR'], Pharmacist:['PH'], LabTech:['LAB'], OutreachSup:['OR'], SupportStaff:['GA','ER'], USHA:['OR']
    },
    seeAll:['Coordinator','MOIC'],
    // USHA cards are cross-checked: the in-charge names a cross-checker per department; new staff of these roles become it by default
    xcheckDepts:['OR'], xcheckRoles:['OutreachSup','LHV','ANM'],
    roles:[
      {id:'Coordinator',  label:'UPHC Coordinator',      icon:'🗂️', requireName:false},
      {id:'MOIC',         label:'Medical Officer In-charge', icon:'🩺', requireName:false},
      {id:'MO',           label:'Medical Officer',       icon:'🩺', requireName:true},
      {id:'StaffNurse',   label:'Staff Nurse',           icon:'🏥', requireName:true},
      {id:'ANM',          label:'ANM',                   icon:'💉', requireName:true},
      {id:'LHV',          label:'LHV',                   icon:'👩‍⚕️', requireName:true},
      {id:'Pharmacist',   label:'Pharmacist',            icon:'💊', requireName:true},
      {id:'LabTech',      label:'Lab Technician',        icon:'🔬', requireName:true},
      {id:'OutreachSup',  label:'Outreach Supervisor',   icon:'🌿', requireName:true},
      {id:'SupportStaff', label:'Support Staff',         icon:'🧹', requireName:true},
      {id:'USHA',         label:'USHA',                  icon:'🌸', requireName:true}
    ],
    passMark:{overall:70, aoc:70, dept:70}
  },
  // PHC and CHC (HealSol 19 Oct 2026): the same department core as UPHC. Checklists from the official toolkits
  // (developer/phc-chc-checklist); roles, leads and teams from the old PHC / CHC apps (developer/phc-chc-reference).
  // Day plans are made fresh in the UPHC style (plan below); the departments a facility has are ticked at enrolment.
  phc:{
    id:'phc', core:'dept', ready:false,
    name:'PHC', plural:'PHCs', short:'PHC', nameHi:'प्राथमिक स्वास्थ्य केंद्र',
    tagline:'Get your PHC NQAS-ready in 60 days',
    // HealSol 19 Oct: a Facility Nodal Officer (non-clinical) oversees Laboratory and General Administration; until one is
    // added the MO in-charge does (default leads fall back to the in-charge)
    inCharge:'MOIC', inChargeLabel:'MO In-charge', clinicalInCharge:'MOIC', coordinator:'FacilityNodal',
    verifierRoles:[], checklist:'phc-checklist', days:60,
    plan:{base:7, implWeeks:6, end:7, ready:4},
    programmes:[{id:'nqas_phc',label:'PHC — NQAS (60 days)'}],
    departments:[
      {id:'OPD', name:'OPD',                        clinical:true,  lead:'MOIC'},
      {id:'NHP', name:'National Health Programmes', clinical:true,  lead:'MOIC'},
      {id:'LR',  name:'Labour Room',                clinical:true,  lead:'MOIC', optional:true},
      {id:'IND', name:'Indoor',                     clinical:true,  lead:'MOIC', optional:true},
      {id:'LAB', name:'Laboratory',                 clinical:false, lead:'FacilityNodal'},
      {id:'GA',  name:'General Administration',     clinical:false, lead:'FacilityNodal'}
    ],
    defaultTeams:{
      MO:['OPD','NHP','LR','IND'], StaffNurse:['OPD'], StaffNurseIPD:['LR','IND'], ANM:['OPD','NHP'], LHV:['NHP','LR'],
      Pharmacist:['OPD','GA'], LabTech:['LAB'], OutreachSup:['NHP'], SupportStaff:['OPD','GA'], WardAttendant:['IND'], ASHA:['NHP']
    },
    seeAll:['MOIC','FacilityNodal'],
    xcheckDepts:['NHP'], xcheckRoles:['ANM','LHV','OutreachSup'],
    roles:[
      {id:'MOIC',          label:'MO In-charge',                 icon:'🩺', requireName:false},
      {id:'MO',            label:'Medical Officer',              icon:'🩺', requireName:true},
      {id:'FacilityNodal', label:'Facility Nodal Officer (non-clinical)', icon:'🗂️', requireName:true},
      {id:'StaffNurse',    label:'Staff Nurse (OPD)',            icon:'🏥', requireName:true},
      {id:'StaffNurseIPD', label:'Staff Nurse (Labour Room / Indoor)', icon:'🏥', requireName:true},
      {id:'ANM',           label:'ANM',                          icon:'💉', requireName:true},
      {id:'LHV',           label:'LHV',                          icon:'👩‍⚕️', requireName:true},
      {id:'Pharmacist',    label:'Pharmacist',                   icon:'💊', requireName:true},
      {id:'LabTech',       label:'Lab Technician',               icon:'🔬', requireName:true},
      {id:'OutreachSup',   label:'Outreach Supervisor',          icon:'🌿', requireName:true},
      {id:'SupportStaff',  label:'Support Staff',                icon:'🧹', requireName:true},
      {id:'WardAttendant', label:'Ward Attendant',               icon:'🛏️', requireName:true},
      {id:'ASHA',          label:'ASHA',                         icon:'🌸', requireName:true}
    ],
    passMark:{overall:70, aoc:70, dept:70}
  },
  chc:{
    id:'chc', core:'dept', ready:false,
    name:'CHC', plural:'CHCs', short:'CHC', nameHi:'सामुदायिक स्वास्थ्य केंद्र',
    tagline:'Get your CHC NQAS-ready in 90 days',
    inCharge:'MOIC', inChargeLabel:'MO In-charge (MOIC)', clinicalInCharge:'MOIC', coordinator:'FacilityNodal',
    verifierRoles:[], checklist:'chc-checklist', days:90,
    // 90 days: baseline 14 · implementation 8 weeks · end-line 14 · readiness 6 (verification 85–88, final review 89, graduation 90)
    plan:{base:14, implWeeks:8, end:14, ready:6},
    programmes:[{id:'nqas_chc',label:'CHC — NQAS · LaQshya · MusQan (90 days)'}],
    departments:[
      {id:'OPD',  name:'OPD',                        clinical:true,  lead:'MOIC'},
      {id:'EM',   name:'Accident & Emergency',       clinical:true,  lead:'MOIC'},
      {id:'IPD',  name:'IPD (Indoor)',               clinical:true,  lead:'MOIC'},
      {id:'PAED', name:'Paediatric OPD (MusQan)',    clinical:true,  lead:'MOIC', prog:'MusQan', optional:true},
      {id:'LR',   name:'Labour Room (LaQshya)',      clinical:true,  lead:'MOIC', prog:'LaQshya', optional:true},
      {id:'NBSU', name:'NBSU (MusQan)',              clinical:true,  lead:'MOIC', prog:'MusQan', optional:true},
      {id:'MOT',  name:'Maternity OT (LaQshya)',     clinical:true,  lead:'MOIC', prog:'LaQshya', optional:true},
      {id:'OT',   name:'Operation Theatre',          clinical:true,  lead:'MOIC', optional:true},
      {id:'LAB',  name:'Laboratory',                 clinical:false, lead:'FacilityNodal'},
      {id:'RAD',  name:'Radiology',                  clinical:false, lead:'FacilityNodal', optional:true},
      {id:'PH',   name:'Pharmacy & Stores',          clinical:false, lead:'FacilityNodal'},
      {id:'BSU',  name:'Blood Storage Unit',         clinical:false, lead:'FacilityNodal', optional:true},
      {id:'AUX',  name:'Auxiliary Services',         clinical:false, lead:'FacilityNodal'},
      {id:'GA',   name:'General Administration',     clinical:false, lead:'FacilityNodal'}
    ],
    defaultTeams:{
      GenSurgeon:['OT'], Physician:['OPD','EM','IPD'], ObGyn:['LR','MOT'], Paediatrician:['PAED','LR','NBSU','MOT'], Anaesthesiologist:['OT','MOT'],
      PHSpecialist:['GA'], Ophthalmologist:['OPD'], Orthopaedic:['OPD','EM','OT'], MicroPath:['LAB','BSU'], PMR:['OPD','IPD'], GDMO:['OPD','PAED','IPD'],
      DentalMO:['OPD'], AYUSHMO:['OPD'], Matron:['IPD','EM','LR','NBSU','MOT','OT'], SNIPD:['IPD','EM'], SNMat:['LR','MOT'], SNNBSU:['NBSU'], SNOT:['OT','MOT'],
      NCDNurse:['OPD'], Pharmacist:['PH'], AYUSHPharmacist:['PH'], LabTech:['LAB'], Radiographer:['RAD'], Optometrist:['OPD'], DentalTech:['OPD'],
      Physio:['OPD','IPD'], ColdChain:['PH'], OTTech:['OT','MOT'], Counselor:['LR','NBSU'], BPM:['GA'], AccountsOfficer:['GA'], DEO:['GA'],
      HealthEducator:['OPD'], SanitaryInspector:['AUX'], HospitalAttendant:['IPD','EM'], Housekeeping:['AUX'], SecurityGuard:['AUX'], LaundryAttendant:['AUX'], BMWHandler:['AUX']
    },
    seeAll:['MOIC','FacilityNodal'],
    xcheckDepts:[], xcheckRoles:[],
    roleGroups:[{id:'clinical',label:'Clinical staff'},{id:'nursing',label:'Nursing staff'},{id:'allied',label:'Allied health & paramedical'},{id:'admin',label:'Public health & administration'},{id:'support',label:'Support & facility management'}],
    roles:[
      {id:'MOIC',label:'MO In-charge (MOIC)',icon:'🩺',group:'admin',requireName:false},
      {id:'FacilityNodal',label:'Facility Nodal Officer',icon:'🗂️',group:'admin',requireName:true},
      {id:'GenSurgeon',label:'General Surgeon',icon:'🩺',group:'clinical'},{id:'Physician',label:'Physician',icon:'🩺',group:'clinical'},
      {id:'ObGyn',label:'Obstetrician & Gynaecologist',icon:'🩺',group:'clinical'},{id:'Paediatrician',label:'Paediatrician',icon:'🩺',group:'clinical'},
      {id:'Anaesthesiologist',label:'Anaesthesiologist',icon:'🩺',group:'clinical'},{id:'PHSpecialist',label:'Public Health Specialist',icon:'🩺',group:'clinical'},
      {id:'Ophthalmologist',label:'Ophthalmologist',icon:'🩺',group:'clinical'},{id:'Orthopaedic',label:'Orthopaedic Specialist',icon:'🩺',group:'clinical'},
      {id:'MicroPath',label:'Microbiologist / Pathologist',icon:'🔬',group:'clinical'},{id:'PMR',label:'Physical Medicine & Rehab Specialist',icon:'🩺',group:'clinical'},
      {id:'GDMO',label:'General Duty Medical Officer',icon:'🩺',group:'clinical'},{id:'DentalMO',label:'Dental Medical Officer',icon:'🦷',group:'clinical'},
      {id:'AYUSHMO',label:'AYUSH Medical Officer',icon:'🌿',group:'clinical'},
      {id:'Matron',label:'Nursing Superintendent / Matron',icon:'🏥',group:'nursing'},{id:'SNIPD',label:'Staff Nurse (IPD)',icon:'🏥',group:'nursing'},
      {id:'SNMat',label:'Staff Nurse (Maternity)',icon:'🏥',group:'nursing'},{id:'SNNBSU',label:'Staff Nurse (NBSU)',icon:'🏥',group:'nursing'},
      {id:'SNOT',label:'Staff Nurse (OT)',icon:'🏥',group:'nursing'},{id:'NCDNurse',label:'NCD Clinic Nurse',icon:'🏥',group:'nursing'},
      {id:'Pharmacist',label:'Pharmacist',icon:'💊',group:'allied'},{id:'AYUSHPharmacist',label:'AYUSH Pharmacist',icon:'💊',group:'allied'},
      {id:'LabTech',label:'Lab Technologist / Technician',icon:'🔬',group:'allied'},{id:'Radiographer',label:'Radiographer / X-ray Technician',icon:'🩻',group:'allied'},
      {id:'Optometrist',label:'Ophthalmic Assistant / Optometrist',icon:'👁️',group:'allied'},{id:'DentalTech',label:'Dental Technician / Hygienist',icon:'🦷',group:'allied'},
      {id:'Physio',label:'Physiotherapist / Occupational Therapist',icon:'🦵',group:'allied'},{id:'ColdChain',label:'Cold Chain & Vaccine Logistics Assistant',icon:'❄️',group:'allied'},
      {id:'OTTech',label:'OT Technician',icon:'🔧',group:'allied'},{id:'Counselor',label:'Counsellor (RMNCH+A)',icon:'💬',group:'allied'},
      {id:'BPM',label:'Block Programme Manager',icon:'🗂️',group:'admin'},{id:'AccountsOfficer',label:'Accounts Officer',icon:'🧾',group:'admin'},
      {id:'DEO',label:'Data Entry Operator',icon:'⌨️',group:'admin'},{id:'HealthEducator',label:'Health Educator / BCPM',icon:'📣',group:'admin'},
      {id:'SanitaryInspector',label:'Sanitary Inspector',icon:'🧽',group:'support'},{id:'HospitalAttendant',label:'Hospital Attendant',icon:'🧑‍⚕️',group:'support'},
      {id:'Housekeeping',label:'Housekeeping Staff',icon:'🧹',group:'support'},{id:'SecurityGuard',label:'Security Guard',icon:'🛡️',group:'support'},
      {id:'LaundryAttendant',label:'Laundry Attendant',icon:'🧺',group:'support'},{id:'BMWHandler',label:'Bio-Medical Waste Handler',icon:'♻️',group:'support'}
    ],
    passMark:{overall:70, aoc:70, dept:70}
  }
};
var NF_LEVEL_DEFAULT='sc';
function nfTypeOf(fac){ var t=fac&&fac.type; return (typeof t==='string'&&Object.prototype.hasOwnProperty.call(NF_LEVELS,t))?t:NF_LEVEL_DEFAULT; }
// before sign-in, ?type=uphc shows that type's wording (and registers that type, once it is ready)
var NF_LEVEL_ID=(function(){ try{ var t=(new URLSearchParams(location.search).get('type')||'').toLowerCase(); if(Object.prototype.hasOwnProperty.call(NF_LEVELS,t)) return t; }catch(e){} return NF_LEVEL_DEFAULT; })();
var NF_CFG=NF_LEVELS[NF_LEVEL_ID];
// switch the facility type in use; returns the settings. Role lists (SC_ROLES, SC_VERIFIER_ROLES) are refilled in place
// so every screen that already holds them sees the new type.
function nfSetLevel(t){
  var id=Object.prototype.hasOwnProperty.call(NF_LEVELS,t)?t:NF_LEVEL_DEFAULT;
  NF_LEVEL_ID=id; NF_CFG=NF_LEVELS[id];
  try{ if(typeof SC_ROLES!=='undefined'){ SC_ROLES.length=0; Array.prototype.push.apply(SC_ROLES,NF_CFG.roles); } }catch(e){}
  try{ if(typeof SC_VERIFIER_ROLES!=='undefined'){ SC_VERIFIER_ROLES.length=0; Array.prototype.push.apply(SC_VERIFIER_ROLES,NF_CFG.verifierRoles); } }catch(e){}
  try{ nfLvlApply(); }catch(e){}
  return NF_CFG;
}
// ── core registry: the card system plugs in here ──
var NF_CORES={};
function nfRegisterCore(id,impl){ NF_CORES[id]=impl; }
function nfCore(){ return NF_CORES[NF_CFG.core]||null; }
// wording helpers for shared screens
function nfLvl(k){ return NF_CFG[k]; }
// SC wording → this type's wording (no change for Sub-Centres)
function nfLvlText(s){
  if(typeof s!=='string'||NF_CFG.id==='sc') return s;
  var L=NF_CFG;
  return s.replace(/Sub-Centres/g,L.plural).replace(/Sub-Centre/g,L.name).replace(/sub-centres/g,L.plural).replace(/sub-centre/g,L.name)
    .replace(/उप-केंद्रों/g,L.nameHi).replace(/उप-केंद्र/g,L.nameHi)
    .replace(/\(CHO\)/g,'('+L.inChargeLabel+')').replace(/\bthe CHO\b/g,'the '+L.inChargeLabel);
}
// static page text marked data-nf-lvl (and placeholders marked data-nf-lvl-ph) follows the type; the SC text is kept
// on the element so switching back (sign out, another facility) restores it
function nfLvlApply(root){
  // text another screen wrote since our last change (e.g. a portal's own subheading) becomes the new original
  (root||document).querySelectorAll('[data-nf-lvl]').forEach(function(el){ if(el.__nfLvl==null||el.textContent!==el.__nfLvlSet) el.__nfLvl=el.textContent; el.textContent=el.__nfLvlSet=nfLvlText(el.__nfLvl); });
  (root||document).querySelectorAll('[data-nf-lvl-ph]').forEach(function(el){ if(el.__nfLvlPh==null||el.placeholder!==el.__nfLvlPhSet) el.__nfLvlPh=el.placeholder; el.placeholder=el.__nfLvlPhSet=nfLvlText(el.__nfLvlPh); });
}
// HealSol enrolment: one option per facility type (types not ready yet are marked "testing")
function nfFillTypeSelect(sel){
  if(!sel||sel.options.length) return;
  Object.keys(NF_LEVELS).forEach(function(k){ var L=NF_LEVELS[k], o=document.createElement('option'); o.value=k; o.textContent=L.name; sel.appendChild(o); });
}
// CHC (FRU) / CHC (Non-FRU) — HealSol 21 Oct. A Non-FRU CHC usually has no Maternity OT, Operation Theatre or Blood
// Storage Unit; picking the kind pre-ticks the departments (they can still be changed). Saved as sc_facilities/{code}/chcKind.
var NF_CHC_KINDS={fru:{label:'CHC (FRU)',off:[]},nonfru:{label:'CHC (Non-FRU)',off:['MOT','OT','BSU']}};
function nfChcKindLabel(fac){ var k=fac&&fac.chcKind; return (NF_CHC_KINDS[k]||{}).label||''; }
// example facility names and ID codes on the enrolment form
var NF_ENROLL_EG={sc:['e.g. Rampur Sub-Centre','UP-JHS-SC-0001'],uphc:['e.g. Aliganj UPHC','UP-LKO-UPHC-0001'],phc:['e.g. Bakshi Ka Talab PHC','UP-LKO-PHC-0001'],chc:['e.g. Malihabad CHC','UP-LKO-CHC-0001']};
// the Programme list follows the facility type: SC keeps its own options (12A / 12B), other types list NF_LEVELS[type].programmes
function nfEnrollTypeChanged(sel){
  var p=document.getElementById('sc-enroll-prog'); if(!p||!sel) return;
  if(p.__nfSc==null) p.__nfSc=p.innerHTML;
  var L=NF_LEVELS[sel.value]||NF_LEVELS.sc, t=L.id;
  if(sel.value==='sc'||!L.programmes){ p.innerHTML=p.__nfSc; }
  else p.innerHTML=L.programmes.map(function(x){ return '<option value="'+x.id+'">'+x.label+'</option>'; }).join('');
  p.parentNode.style.display=''; p.onchange=function(){ try{ nfEnrollPriceLine(); }catch(e){} };
  // wording: the in-charge of this type, example name and Facility ID
  var set=function(id,prop,v){ var el=document.getElementById(id); if(el) el[prop]=v; };
  var lab=L.inChargeLabel, eg=NF_ENROLL_EG[t]||NF_ENROLL_EG.sc;
  set('sc-enroll-choname-lbl','textContent',lab+' name'); set('sc-enroll-choname','placeholder',lab+' name');
  set('sc-enroll-chomob-lbl','textContent',lab+' mobile *'); set('sc-enroll-chomob','placeholder','10-digit mobile ('+lab+' login)');
  set('sc-enroll-name','placeholder',eg[0]); set('sc-enroll-idex','textContent',eg[1]); set('sc-enroll-incharge','textContent',lab);
  // department-core types: tick the departments this facility has (the optional ones; the others are always there)
  var box=document.getElementById('sc-enroll-depts');
  if(!box){ var grid=p.closest('.sc-enroll-grid'); if(grid){ box=document.createElement('div'); box.id='sc-enroll-depts'; box.style.cssText='margin:-2px 0 12px;'; grid.parentNode.insertBefore(box,grid.nextSibling); } }
  if(!box) return;
  var ds=(L.core==='dept'&&L.departments)||[];
  if(!ds.some(function(d){ return d.optional; })){ box.innerHTML=''; box.style.display='none'; try{ nfEnrollPriceLine(); }catch(e){} return; }
  box.style.display='';
  var kind=t==='chc'?((document.querySelector('input[name="nf-chc-kind"]:checked')||{}).value||'fru'):'', off=kind?NF_CHC_KINDS[kind].off:[];
  var kindRow=t==='chc'?'<div class="lc-label" style="margin-bottom:6px;">CHC kind</div><div style="display:flex;gap:8px;margin-bottom:10px;">'+Object.keys(NF_CHC_KINDS).map(function(k){
      return '<label style="flex:1;display:flex;align-items:center;gap:7px;padding:9px 12px;border:1.5px solid '+(k===kind?'var(--teal);background:var(--teal-lt)':'var(--br)')+';border-radius:10px;cursor:pointer;font-size:12px;font-weight:700;"><input type="radio" name="nf-chc-kind" value="'+k+'"'+(k===kind?' checked':'')+' onchange="nfEnrollTypeChanged(document.getElementById(\'sc-enroll-type\'))"> '+NF_CHC_KINDS[k].label
        +' <span style="color:var(--t3);font-weight:600;">'+(k==='fru'?'(First Referral Unit — C-section, blood storage)':'(no Maternity OT, OT or Blood Storage)')+'</span></label>'; }).join('')+'</div>':'';
  box.innerHTML=kindRow+'<div class="lc-label" style="margin-bottom:6px;">Departments at this '+L.name+' <span style="font-weight:600;color:var(--t3);">— untick the ones it does not have (can be switched on later)</span></div>'
    +'<div style="display:flex;flex-wrap:wrap;gap:6px;">'+ds.map(function(d){ return d.optional
      ?'<label style="display:inline-flex;align-items:center;gap:6px;border:1.5px solid var(--br);border-radius:10px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;"><input type="checkbox" data-nf-dept="'+d.id+'"'+(off.indexOf(d.id)<0?' checked':'')+' onchange="try{nfEnrollPriceLine()}catch(e){}"> '+d.name+'</label>'
      :'<span style="display:inline-flex;align-items:center;gap:6px;background:var(--bgs);border-radius:10px;padding:6px 10px;font-size:12px;font-weight:700;color:var(--t2);" title="Every '+L.name+' has this department">✓ '+d.name+'</span>'; }).join('')+'</div>'
    +'<div id="nf-enroll-price" style="margin-top:8px;font-size:12px;font-weight:700;color:var(--teal-dk);"></div>';
  try{ nfEnrollPriceLine(); }catch(e){}
}
// the departments unticked on the enrolment form (saved as switched off once the facility is created)
function nfEnrollDeptsOff(){ return [].map.call(document.querySelectorAll('#sc-enroll-depts input[data-nf-dept]'),function(c){ return c.checked?null:c.getAttribute('data-nf-dept'); }).filter(Boolean); }
document.addEventListener('DOMContentLoaded',function(){ try{ nfLvlApply(); }catch(e){} try{ nfFillTypeSelect(document.getElementById('sc-enroll-type')); }catch(e){} });
