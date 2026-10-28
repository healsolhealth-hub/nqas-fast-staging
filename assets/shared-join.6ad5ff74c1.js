// ══ Join NQAS FAST (28 Oct 2026; approved mock-up "NQAS FAST · Join (sign-up)") ═══════════════════════════════════
// One "Join NQAS FAST" button on the login screen replaces the old two pop-ups (Register your Sub-Centre / District bulk).
//   Who are you? → I run a facility (SC CHO · UPHC / PHC MO in-charge · CHC MOIC): type → state / district / block → find it
//   in the registry (signupLookup) or type it → package (CHC: FRU / Non-FRU) → about you → demoSignup: a request HealSol
//   approves (Business → Enquiries & sign-ups), or — when Settings switches that type open — enrolled at once with its free baseline.
//   → I work in a facility: "your in-charge adds you", Check my number (checkMobile), WhatsApp to the in-charge.
//   → District, State or Organisation: bulk enquiry with counts per facility type (submitEnquiry).
var JN_HI={'Join NQAS FAST':'NQAS FAST से जुड़ें','New to NQAS FAST?':'NQAS FAST में नए हैं?','Facilities, staff, districts and partners':'स्वास्थ्य केंद्र, स्टाफ, ज़िले और साझेदार',
  'Make your facility NQAS-ready':'अपने स्वास्थ्य केंद्र को NQAS के लिए तैयार करें','Back to log in':'लॉग इन पर वापस','Back':'वापस','Who are you?':'आप कौन हैं?',
  'Pick the one that fits. It takes about 2 minutes.':'जो आप पर लागू हो, उसे चुनें। लगभग 2 मिनट लगेंगे।','I run a facility':'मैं स्वास्थ्य केंद्र का प्रभारी हूँ',
  'CHO of a Sub-Centre · MO in-charge of a UPHC or PHC · MOIC of a CHC':'उप-केंद्र के CHO · UPHC या PHC के MO प्रभारी · CHC के MOIC','I work in a facility':'मैं स्वास्थ्य केंद्र में काम करता/करती हूँ',
  'ANM · Staff Nurse · MPW · ASHA · Pharmacist · Lab Technician and other staff':'ANM · स्टाफ नर्स · MPW · आशा · फार्मासिस्ट · लैब तकनीशियन और अन्य स्टाफ','District, State or Organisation':'ज़िला, राज्य या संस्था',
  'DPM · CMO · NHM · NGO · Donor — many facilities together':'DPM · CMO · NHM · NGO · दानदाता — कई स्वास्थ्य केंद्र एक साथ','Already have a login?':'पहले से लॉगिन है?','Log in':'लॉग इन',
  'Supervisors, District Admins and MOIC block logins are made by HealSol Academy.':'सुपरवाइज़र, ज़िला एडमिन और MOIC ब्लॉक लॉगिन HealSol Academy बनाती है।','Step 1 of 2':'चरण 1 / 2','Step 2 of 2':'चरण 2 / 2',
  'Your facility':'आपका स्वास्थ्य केंद्र','Find it in the national list so its NIN, block and links come with it.':'इसे राष्ट्रीय सूची में खोजें ताकि इसका NIN, ब्लॉक और लिंक साथ आ जाएँ।','Facility type *':'स्वास्थ्य केंद्र का प्रकार *',
  'State *':'राज्य *','District *':'ज़िला *','Block':'ब्लॉक','All blocks':'सभी ब्लॉक','Name or NIN':'नाम या NIN','Package *':'पैकेज *','Next — about you':'आगे — आपके बारे में',
  'Not in the list — type its name and NIN':'सूची में नहीं — नाम और NIN लिखें','Facility name *':'स्वास्थ्य केंद्र का नाम *','NIN (if known)':'NIN (यदि पता हो)','Loading the list…':'सूची लोड हो रही है…',
  'already in NQAS FAST — ask your in-charge':'पहले से NQAS FAST में — अपने प्रभारी से पूछें','About you':'आपके बारे में','You will be the in-charge login for this facility.':'आप इस स्वास्थ्य केंद्र के प्रभारी लॉगिन होंगे।',
  'Your name *':'आपका नाम *','Your role *':'आपकी भूमिका *','Mobile number *':'मोबाइल नंबर *','Your login. We check it has no account yet.':'यही आपका लॉगिन होगा। हम जाँचते हैं कि इस पर पहले से खाता न हो।','Email (optional)':'ईमेल (वैकल्पिक)',
  'CHECK BEFORE SENDING':'भेजने से पहले जाँचें','Facility':'स्वास्थ्य केंद्र','Where':'कहाँ','Under':'के अंतर्गत','Package':'पैकेज',
  'I am the in-charge of this facility, and HealSol Academy may call or WhatsApp me about it.':'मैं इस स्वास्थ्य केंद्र का प्रभारी हूँ, और HealSol Academy इस बारे में मुझे कॉल या WhatsApp कर सकती है।',
  'Send for approval':'स्वीकृति के लिए भेजें','Register — free baseline':'पंजीकरण करें — निःशुल्क बेसलाइन','HealSol Academy checks every new facility, then sends your login.':'HealSol Academy हर नए स्वास्थ्य केंद्र की जाँच करती है, फिर आपका लॉगिन भेजती है।',
  'Request sent':'अनुरोध भेजा गया','WHAT HAPPENS NEXT':'आगे क्या होगा','HealSol Academy checks the facility and calls or WhatsApps you.':'HealSol Academy स्वास्थ्य केंद्र की जाँच करके आपको कॉल या WhatsApp करेगी।',
  'Once approved, you get your login: this mobile and a one-time password.':'स्वीकृति के बाद आपको लॉगिन मिलेगा: यही मोबाइल और एक बार का पासवर्ड।','Log in, add your staff, and start the baseline.':'लॉग इन करें, अपना स्टाफ जोड़ें और बेसलाइन शुरू करें।',
  'Your in-charge adds you':'आपके प्रभारी आपको जोड़ते हैं','Check my number':'मेरा नंबर जाँचें','Check':'जाँचें','Send my in-charge a WhatsApp':'अपने प्रभारी को WhatsApp भेजें',
  'Many facilities together':'कई स्वास्थ्य केंद्र एक साथ','You are *':'आप हैं *','Organisation name *':'संस्था का नाम *','Districts':'ज़िले','Whole state':'पूरा राज्य','How many facilities? (roughly)':'कितने स्वास्थ्य केंद्र? (लगभग)',
  'Total':'कुल','Designation *':'पद *','Mobile *':'मोबाइल *','Email':'ईमेल','Anything else? (optional)':'और कुछ? (वैकल्पिक)','Send enquiry':'पूछताछ भेजें','Thank you':'धन्यवाद','YOUR ENQUIRY':'आपकी पूछताछ',
  'Organisation':'संस्था','Facilities':'स्वास्थ्य केंद्र','Reference':'संदर्भ','Registered — your free baseline has started':'पंजीकरण हो गया — आपकी निःशुल्क बेसलाइन शुरू हो गई है','Log in now':'अभी लॉग इन करें'};
var JN_TYPES=[['sc','SC'],['uphc','UPHC'],['phc','PHC'],['chc','CHC']];
var JN_PKG={sc:[{id:'nqas_12A',label:'12A — 12 Services (60 days)'},{id:'nqas_12B',label:'12B — 12 Services + Delivery (60 days)'}],
  chc:[{id:'fru',label:'CHC (FRU) — NQAS · LaQshya · MusQan (90 days)'},{id:'nonfru',label:'CHC (Non-FRU) — NQAS · LaQshya · MusQan (90 days)'}]};
var JN_ORG=['District Health Society','State NHM','NGO / Partner','Donor / CSR','Other'];
var _jn={step:'who',type:'sc',state:'Uttar Pradesh',district:'',block:'',q:'',pick:'',typed:false,tname:'',tnin:'',pkg:'',name:'',role:'',mob:'',email:'',agree:false,
  look:{}, err:'', busy:false, res:null, staffMob:'', staffRes:null,
  bulk:{org:'District Health Society',oname:'',state:'Uttar Pradesh',districts:[],whole:false,counts:{sc:0,uphc:0,phc:0,chc:0},name:'',desig:'',mob:'',email:'',msg:''}};
function jt(k){ var s=(typeof _appLang!=='undefined'&&_appLang==='hi'&&JN_HI[k])||k; return typeof nfLvlText==='function'?nfLvlText(s):s; }
function jE(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
function jnLv(t){ return (typeof NF_LEVELS!=='undefined'&&NF_LEVELS[t])||{}; }
function jnPkgs(t){ return JN_PKG[t]||(jnLv(t).programmes||[]); }
function jnStates(){ return (typeof NF_STATE_LIST!=='undefined'?NF_STATE_LIST:[['Uttar Pradesh','UP']]); }
function jnDistricts(st){ var c=(jnStates().find(function(x){ return x[0]===st; })||[])[1]; return (typeof NF_DISTRICTS!=='undefined'&&NF_DISTRICTS[c])||[]; }
function jnOpts(list,cur,first){ return (first!=null?'<option value="">'+jE(first)+'</option>':'')+list.map(function(x){ var v=Array.isArray(x)?x[0]:(x.id!=null?x.id:x), l=Array.isArray(x)?x[0]:(x.label||x); return '<option value="'+jE(v)+'"'+(String(v)===String(cur)?' selected':'')+'>'+jE(l)+'</option>'; }).join(''); }
// ── open / close ───────────────────────────────────────────────
function jnOpen(step){
  var root=document.getElementById('nf-login'); if(!root) return;
  var box=document.getElementById('nf-l-join');
  if(!box){ box=document.createElement('div'); box.id='nf-l-join'; box.className='nf-l-body jn'; var foot=root.querySelector('.nf-l-foot'); root.insertBefore(box,foot); }
  root.classList.add('jn-on'); _jn.step=step||'who'; _jn.err=''; jnRender();
  try{ root.scrollIntoView({block:'start'}); var ls=document.getElementById('login-screen'); if(ls) ls.scrollTop=0; }catch(e){}
}
function jnClose(){ var root=document.getElementById('nf-login'); if(root) root.classList.remove('jn-on'); var b=document.getElementById('nf-l-join'); if(b) b.innerHTML=''; }
function jnGo(step){ _jn.step=step; _jn.err=''; jnRender(); try{ var ls=document.getElementById('login-screen'); if(ls) ls.scrollTop=0; }catch(e){} }
// the old buttons and anything else that still calls them open the new flow
function phcOpenDemoSignup(){ jnOpen('fac'); }
function phcOpenLeadModal(){ jnOpen('bulk'); }
function jnRender(){
  var box=document.getElementById('nf-l-join'); if(!box) return;
  var f={who:jnWho,fac:jnFac,you:jnYou,sent:jnSent,staff:jnStaff,bulk:jnBulk,bulksent:jnBulkSent}[_jn.step]||jnWho;
  box.innerHTML=f();
}
function jnTop(back,step){ return '<div class="jn-top"><button type="button" class="nf-l-back" onclick="'+back+'"><i class="ti ti-arrow-left"></i> '+jE(jt(back==='jnClose()'?'Back to log in':'Back'))+'</button>'+(step?'<span class="jn-stepn">'+jE(jt(step))+'</span>':'')+'</div>'
  +(step?'<div class="jn-bar"><i style="width:'+(step==='Step 1 of 2'?50:100)+'%"></i></div>':''); }
function jnErr(){ return '<div class="nf-l-err" id="jn-err" role="alert" style="display:'+(_jn.err?'block':'none')+'">'+jE(_jn.err)+'</div>'; }
// ── Who are you? ───────────────────────────────────────────────
function jnWho(){
  var card=function(go,cls,icon,title,sub){ return '<button type="button" class="nf-l-role jn-who" onclick="jnGo(\''+go+'\')"><span class="nf-l-ri '+cls+'"><i class="ti '+icon+'"></i></span><span class="nf-l-rt"><b>'+jE(jt(title))+'</b><small>'+jE(jt(sub))+'</small></span><i class="ti ti-chevron-right"></i></button>'; };
  return jnTop('jnClose()')+'<div class="jn-kick">'+jE(jt('Join NQAS FAST').toUpperCase())+'</div><div class="nf-l-hi">'+jE(jt('Who are you?'))+'</div><div class="nf-l-sub">'+jE(jt('Pick the one that fits. It takes about 2 minutes.'))+'</div>'
    +card('fac','t','ti-building-hospital','I run a facility','CHO of a Sub-Centre · MO in-charge of a UPHC or PHC · MOIC of a CHC')
    +card('staff','o','ti-users','I work in a facility','ANM · Staff Nurse · MPW · ASHA · Pharmacist · Lab Technician and other staff')
    +card('bulk','q','ti-building-community','District, State or Organisation','DPM · CMO · NHM · NGO · Donor — many facilities together')
    +'<div class="jn-note">'+jE(jt('Already have a login?'))+' <button type="button" class="nf-l-link" onclick="jnClose()">'+jE(jt('Log in'))+'</button> '+jE(jt('Supervisors, District Admins and MOIC block logins are made by HealSol Academy.'))+'</div>';
}
// ── Step 1: your facility ──────────────────────────────────────
function jnKey(){ return _jn.state+'|'+_jn.district; }
async function jnLoadLook(){
  var k=jnKey(); if(!_jn.state||!_jn.district||_jn.look[k]) return;
  _jn.look[k]={loading:true}; jnRender();
  try{ _jn.look[k]=await nfCall('signupLookup',{state:_jn.state,district:_jn.district}); }
  catch(e){ _jn.look[k]={items:[],blocks:[],err:(typeof nfErrText==='function'?nfErrText(e):'Could not load the list.')}; }
  if(_jn.step==='fac') jnRender();
}
function jnSet(k,v,re){ _jn[k]=v; if(k==='type'){ _jn.pick=''; _jn.pkg=''; _jn.role=''; } if(k==='state'){ _jn.district=''; _jn.block=''; _jn.pick=''; } if(k==='district'){ _jn.block=''; _jn.pick=''; jnLoadLook(); }
  if(k==='block') _jn.pick=''; if(re) jnRender(); }
function jnItems(){ var L=_jn.look[jnKey()]||{}; return (L.items||[]).filter(function(x){ return x.t===_jn.type&&(!_jn.block||x.block===_jn.block); }); }
function jnResHTML(){
  var L=_jn.look[jnKey()]||{}; if(!_jn.district) return '';
  if(L.loading) return '<div class="jn-res"><div class="jn-empty">'+jE(jt('Loading the list…'))+'</div></div>';
  var q=String(_jn.q||'').trim().toLowerCase(), it=jnItems().filter(function(x){ return !q||x.name.toLowerCase().indexOf(q)>=0||String(x.nin).indexOf(q)>=0; });
  var shown=it.slice(0,8), h='<div class="jn-res" id="jn-res">';
  shown.forEach(function(x){ var on=_jn.pick===x.rid;
    h+='<button type="button" class="jn-ri'+(on?' on':'')+(x.enrolled?' off':'')+'"'+(x.enrolled?' disabled':'')+' onclick="jnPick(\''+jE(x.rid)+'\')"><span class="jn-rd">'+(on?'<i class="ti ti-check"></i>':'')+'</span><span class="jn-rt"><b>'+jE(x.name)+'</b><small>'+(x.nin?'NIN '+jE(x.nin)+' · ':'')+(x.block?jE(x.block)+' '+jE(jt('Block').toLowerCase())+' · ':'')+(x.enrolled?jE(jt('already in NQAS FAST — ask your in-charge')):(x.under?jE(jt('Under'))+' '+jE(x.under):''))+'</small></span></button>'; });
  if(it.length>shown.length) h+='<div class="jn-more">+ '+(it.length-shown.length)+' more — type more of the name</div>';
  if(!it.length&&!L.err) h+='<div class="jn-empty">No '+jE((jnLv(_jn.type).short||_jn.type.toUpperCase()))+' found'+(q?' for "'+jE(_jn.q)+'"':'')+'.</div>';
  if(L.err) h+='<div class="jn-empty">'+jE(L.err)+'</div>';
  h+='<button type="button" class="jn-ri jn-typed'+(_jn.typed?' on':'')+'" onclick="jnPick(\'typed\')"><span class="jn-rd">'+(_jn.typed?'<i class="ti ti-check"></i>':'+')+'</span><span class="jn-rt"><b>'+jE(jt('Not in the list — type its name and NIN'))+'</b></span></button></div>';
  if(_jn.typed) h+='<label class="nf-l-lbl" for="jn-tname">'+jE(jt('Facility name *'))+'</label><input class="jn-in" id="jn-tname" value="'+jE(_jn.tname)+'" oninput="_jn.tname=this.value"><label class="nf-l-lbl" for="jn-tnin">'+jE(jt('NIN (if known)'))+'</label><input class="jn-in" id="jn-tnin" inputmode="numeric" value="'+jE(_jn.tnin)+'" oninput="_jn.tnin=this.value">';
  return h;
}
function jnPick(rid){ if(rid==='typed'){ _jn.typed=!_jn.typed; _jn.pick=''; } else { _jn.pick=rid; _jn.typed=false; } var r=document.getElementById('jn-resbox'); if(r) r.innerHTML=jnResHTML(); }
function jnQ(v){ _jn.q=v; var r=document.getElementById('jn-resbox'); if(r) r.innerHTML=jnResHTML(); }
function jnFac(){
  var L=_jn.look[jnKey()]||{}, lv=jnLv(_jn.type), pk=jnPkgs(_jn.type); if(!_jn.pkg&&pk[0]) _jn.pkg=pk[0].id;
  var seg=JN_TYPES.map(function(x){ return '<button type="button" class="'+(_jn.type===x[0]?'on':'')+'" aria-pressed="'+(_jn.type===x[0])+'" onclick="jnSet(\'type\',\''+x[0]+'\',1)">'+x[1]+'</button>'; }).join('');
  return jnTop("jnGo('who')",'Step 1 of 2')
    +'<div class="nf-l-hi">'+jE(jt('Your facility'))+'</div><div class="nf-l-sub">'+jE(jt('Find it in the national list so its NIN, block and links come with it.'))+'</div>'
    +'<div class="nf-l-lbl">'+jE(jt('Facility type *'))+'</div><div class="jn-seg">'+seg+'</div>'
    +'<div class="jn-2"><div><label class="nf-l-lbl" for="jn-st">'+jE(jt('State *'))+'</label><select class="jn-in" id="jn-st" onchange="jnSet(\'state\',this.value,1)">'+jnOpts(jnStates(),_jn.state)+'</select></div>'
    +'<div><label class="nf-l-lbl" for="jn-di">'+jE(jt('District *'))+'</label><select class="jn-in" id="jn-di" onchange="jnSet(\'district\',this.value,1)">'+jnOpts(jnDistricts(_jn.state),_jn.district,'—')+'</select></div></div>'
    +((L.blocks||[]).length?'<label class="nf-l-lbl" for="jn-bl">'+jE(jt('Block'))+'</label><select class="jn-in" id="jn-bl" onchange="jnSet(\'block\',this.value,1)">'+jnOpts(L.blocks,_jn.block,jt('All blocks'))+'</select>':'')
    +(_jn.district?'<label class="nf-l-lbl" for="jn-q">Find your '+jE(lv.short||_jn.type.toUpperCase())+' *</label><input class="jn-in jn-q" id="jn-q" placeholder="'+jE(jt('Name or NIN'))+'" value="'+jE(_jn.q)+'" oninput="jnQ(this.value)">':'')
    +'<div id="jn-resbox">'+jnResHTML()+'</div>'
    +'<label class="nf-l-lbl" for="jn-pk">'+jE(jt('Package *'))+'</label><select class="jn-in" id="jn-pk" onchange="_jn.pkg=this.value">'+jnOpts(pk,_jn.pkg)+'</select>'
    +jnErr()+'<button type="button" class="nf-l-btn" onclick="jnNext()">'+jE(jt('Next — about you'))+'</button>';
}
function jnSel(){ if(_jn.typed) return {name:String(_jn.tname||'').trim(),nin:String(_jn.tnin||'').replace(/\D/g,''),block:_jn.block,under:''};
  var x=(jnItems().filter(function(i){ return i.rid===_jn.pick; })[0])||((_jn.look[jnKey()]||{}).items||[]).filter(function(i){ return i.rid===_jn.pick; })[0]; return x||null; }
function jnNext(){
  var s=jnSel();
  if(!_jn.district) _jn.err='Choose your state and district.';
  else if(!s) _jn.err='Pick your facility from the list, or choose "Not in the list" and type its name.';
  else if(!s.name) _jn.err='Type the facility name.';
  else if(_jn.typed&&s.nin&&!/^\d{6,20}$/.test(s.nin)) _jn.err='NIN is digits only.';
  else { jnGo('you'); return; }
  var e=document.getElementById('jn-err'); if(e){ e.textContent=_jn.err; e.style.display='block'; }
}
// ── Step 2: about you ──────────────────────────────────────────
function jnRoles(t){ var lv=jnLv(t), r=[lv.inChargeLabel||'In-charge']; if(t==='uphc') r.push('Medical Officer In-charge'); return r; }
function jnPkgLabel(){ var p=jnPkgs(_jn.type).filter(function(x){ return x.id===_jn.pkg; })[0]; return p?p.label:''; }
function jnYou(){
  var s=jnSel()||{}, roles=jnRoles(_jn.type); if(!_jn.role) _jn.role=roles[0];
  var open=!!(((_jn.look[jnKey()]||{}).open||{})[_jn.type]);
  var row=function(k,v){ return v?'<div class="jn-sr"><span>'+jE(jt(k))+'</span><b>'+jE(v)+'</b></div>':''; };
  return jnTop("jnGo('fac')",'Step 2 of 2')
    +'<div class="nf-l-hi">'+jE(jt('About you'))+'</div><div class="nf-l-sub">'+jE(jt('You will be the in-charge login for this facility.'))+'</div>'
    +'<label class="nf-l-lbl" for="jn-n">'+jE(jt('Your name *'))+'</label><input class="jn-in" id="jn-n" autocomplete="name" value="'+jE(_jn.name)+'" oninput="_jn.name=this.value">'
    +'<label class="nf-l-lbl" for="jn-r">'+jE(jt('Your role *'))+'</label><select class="jn-in" id="jn-r" onchange="_jn.role=this.value">'+jnOpts(roles,_jn.role)+'</select>'
    +'<label class="nf-l-lbl" for="jn-m">'+jE(jt('Mobile number *'))+'</label><input class="jn-in" id="jn-m" type="tel" inputmode="numeric" maxlength="14" value="'+jE(_jn.mob)+'" oninput="_jn.mob=this.value"><div class="jn-hint">'+jE(jt('Your login. We check it has no account yet.'))+'</div>'
    +'<label class="nf-l-lbl" for="jn-e">'+jE(jt('Email (optional)'))+'</label><input class="jn-in" id="jn-e" type="email" value="'+jE(_jn.email)+'" oninput="_jn.email=this.value">'
    +'<div class="jn-sum"><div class="jn-kick">'+jE(jt('CHECK BEFORE SENDING'))+'</div>'+row('Facility',s.name+' · '+(jnLv(_jn.type).short||_jn.type.toUpperCase()))+row('NIN',s.nin)
      +row('Where',[s.block?s.block+' '+jt('Block').toLowerCase():'',_jn.district,_jn.state].filter(Boolean).join(' · '))+row('Under',s.under)+row('Package',jnPkgLabel())+'</div>'
    +'<label class="nf-l-chk jn-agree"><input type="checkbox" id="jn-ag"'+(_jn.agree?' checked':'')+' onchange="_jn.agree=this.checked"> <span>'+jE(jt('I am the in-charge of this facility, and HealSol Academy may call or WhatsApp me about it.'))+'</span></label>'
    +jnErr()+'<button type="button" class="nf-l-btn" id="jn-send" onclick="jnSend()"'+(_jn.busy?' disabled':'')+'>'+jE(jt(open?'Register — free baseline':'Send for approval'))+'</button>'
    +'<div class="jn-hint" style="text-align:center">'+jE(jt('HealSol Academy checks every new facility, then sends your login.'))+'</div>';
}
async function jnSend(){
  var s=jnSel()||{}, mob=String(_jn.mob||'').replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,'');
  var bad=!String(_jn.name||'').trim()?'Enter your name.':!/^[6-9]\d{9}$/.test(mob)?'Enter your 10-digit mobile number.':!_jn.agree?'Tick the box to confirm you are the in-charge.':'';
  if(bad){ _jn.err=bad; var e=document.getElementById('jn-err'); if(e){ e.textContent=bad; e.style.display='block'; } return; }
  _jn.busy=true; var b=document.getElementById('jn-send'); if(b){ b.disabled=true; b.textContent='Sending…'; }
  var d={type:_jn.type,state:_jn.state,district:_jn.district,block:s.block||_jn.block||'',contactName:String(_jn.name).trim(),role:_jn.role,mobile:mob,email:String(_jn.email||'').trim()};
  if(_jn.type==='chc'){ d.chcKind=_jn.pkg==='nonfru'?'nonfru':'fru'; d.progId='nqas_chc'; } else d.progId=_jn.pkg;
  if(_jn.typed){ d.name=s.name; d.nin=s.nin||''; } else { d.rid=_jn.pick; d.name=s.name; }
  try{ _jn.res=await nfCall('demoSignup',d); _jn.res.fname=s.name; _jn.res.mob=mob; _jn.busy=false; jnGo('sent'); }
  catch(err){ _jn.busy=false; _jn.err=typeof nfErrText==='function'?nfErrText(err):(err.message||'Could not send.'); jnRender(); }
}
function jnSent(){
  var r=_jn.res||{};
  if(r.code) return '<div class="jn-done"><span class="jn-ok"><i class="ti ti-check"></i></span><div class="nf-l-hi">'+jE(jt('Registered — your free baseline has started'))+'</div>'
    +'<div class="nf-l-sub">'+jE(r.fname||'')+' · '+jE(r.code)+'</div><div class="nf-tmp"><div><small>Mobile</small><b>'+jE(r.identifier)+'</b></div><div><small>Temporary password</small><b class="pw">'+jE(r.tempPassword||'')+'</b></div></div>'
    +'<button type="button" class="nf-l-btn" onclick="jnLoginWith(\''+jE(r.identifier)+'\',\''+jE(r.tempPassword||'')+'\')">'+jE(jt('Log in now'))+'</button></div>';
  var st=function(n,txt,on){ return '<div class="jn-st"><span class="'+(on?'on':'')+'">'+n+'</span><span>'+jE(jt(txt))+'</span></div>'; };
  return '<div class="jn-done"><span class="jn-ok"><i class="ti ti-check"></i></span><div class="nf-l-hi">'+jE(jt('Request sent'))+'</div>'
    +'<div class="nf-l-sub">'+jE(r.fname||'Your facility')+' is with HealSol Academy for approval. We\'ll contact you on '+jE(r.mob||'')+'.</div>'
    +'<div class="jn-kick">'+jE(jt('WHAT HAPPENS NEXT'))+'</div>'+st(1,'HealSol Academy checks the facility and calls or WhatsApps you.',1)+st(2,'Once approved, you get your login: this mobile and a one-time password.')+st(3,'Log in, add your staff, and start the baseline.')
    +(r.ref?'<div class="jn-ref">'+jE(jt('Reference'))+' <b>'+jE(r.ref)+'</b> — quote it if you call HealSol Academy.</div>':'')
    +'<button type="button" class="nf-l-btn" onclick="jnClose()">'+jE(jt('Back to log in'))+'</button></div>';
}
function jnLoginWith(id,pw){ jnClose(); var i=document.getElementById('nf-id'), p=document.getElementById('nf-pwd'); if(i) i.value=id; if(p) p.value=pw; }
// ── Staff ──────────────────────────────────────────────────────
function jnStaff(){
  var r=_jn.staffRes, res='';
  if(r==='yes') res='<div class="jn-msg ok"><b>You already have a login.</b> <button type="button" class="nf-l-link" onclick="jnLoginWith(\''+jE(_jn.staffMob)+'\',\'\')">'+jE(jt('Log in'))+'</button> — password: the last 4 digits of your mobile until you change it, or ask your in-charge to reset it.</div>';
  else if(r==='no') res='<div class="jn-msg warn"><b>No login yet for this number.</b> Ask your in-charge to add you.</div>';
  else if(r) res='<div class="jn-msg warn">'+jE(r)+'</div>';
  return jnTop("jnGo('who')")+'<div class="nf-l-hi">'+jE(jt('Your in-charge adds you'))+'</div>'
    +'<div class="nf-l-sub">Staff don\'t register. Your CHO, MO in-charge or MOIC adds your mobile in the app (Settings → Staff). Then you log in with your mobile.</div>'
    +'<div class="jn-box"><label class="nf-l-lbl" for="jn-sm" style="margin-top:0">'+jE(jt('Check my number'))+'</label><div class="jn-row"><input class="jn-in" id="jn-sm" type="tel" inputmode="numeric" value="'+jE(_jn.staffMob)+'" oninput="_jn.staffMob=this.value"><button type="button" class="jn-btn2" onclick="jnCheck()">'+jE(jt('Check'))+'</button></div>'+res+'</div>'
    +'<button type="button" class="nf-l-plain jn-wa" onclick="jnStaffWa()">'+(typeof NF_WA_ICON!=='undefined'?NF_WA_ICON:'')+''+jE(jt('Send my in-charge a WhatsApp'))+'</button>'
    +'<div class="jn-hint" style="text-align:center">Opens WhatsApp with a ready message: "Please add me to NQAS FAST — name, role, mobile."</div>'
    +'<div class="jn-note">Is your facility not in NQAS FAST yet? Tell your in-charge — they can <button type="button" class="nf-l-link" onclick="jnGo(\'fac\')">register it</button>.</div>';
}
async function jnCheck(){
  var mob=String(_jn.staffMob||'').replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,''); if(!/^[6-9]\d{9}$/.test(mob)){ _jn.staffRes='Enter your 10-digit mobile number.'; jnRender(); return; }
  try{ var r=await nfCall('checkMobile',{mobile:mob}); _jn.staffMob=mob; _jn.staffRes=r&&r.exists?'yes':'no'; }catch(e){ _jn.staffRes=typeof nfErrText==='function'?nfErrText(e):'Could not check.'; }
  jnRender();
}
function jnStaffWa(){ var txt='Namaste, please add me to NQAS FAST.\nName: \nRole: \nMobile: '+(String(_jn.staffMob||'').replace(/\D/g,'').slice(-10)||'');
  try{ window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank'); }catch(e){} }
// ── District / State / Organisation ────────────────────────────
function jnB(k,v,re){ _jn.bulk[k]=v; if(k==='state'){ _jn.bulk.districts=[]; } if(re) jnRender(); }
function jnBDist(v){ if(v&&_jn.bulk.districts.indexOf(v)<0) _jn.bulk.districts.push(v); jnRender(); }
function jnBDel(i){ _jn.bulk.districts.splice(i,1); jnRender(); }
function jnCnt(t,d,set){ var c=_jn.bulk.counts; c[t]=Math.max(0,Math.min(100000,set!=null?(parseInt(set,10)||0):(c[t]||0)+d)); if(set==null) jnRender(); else { var tot=document.getElementById('jn-tot'); if(tot) tot.textContent=jnTot()+' facilities'; } }
function jnTot(){ var c=_jn.bulk.counts; return (c.sc||0)+(c.uphc||0)+(c.phc||0)+(c.chc||0); }
function jnBulk(){
  var B=_jn.bulk, rows=[['sc','Sub-Centres','HWC-SC'],['uphc','UPHCs','Urban PHC'],['phc','PHCs','incl. Block PHCs'],['chc','CHCs','FRU · Non-FRU']];
  var cnt=rows.map(function(r){ return '<div class="jn-cr"><span><b>'+r[1]+'</b><small>'+r[2]+'</small></span><span class="jn-step"><button type="button" aria-label="Fewer '+r[1]+'" onclick="jnCnt(\''+r[0]+'\',-1)">−</button><input aria-label="'+r[1]+'" inputmode="numeric" value="'+(B.counts[r[0]]||0)+'" oninput="jnCnt(\''+r[0]+'\',0,this.value)"><button type="button" aria-label="More '+r[1]+'" onclick="jnCnt(\''+r[0]+'\',1)">+</button></span></div>'; }).join('');
  var dl=jnDistricts(B.state).filter(function(d){ return B.districts.indexOf(d)<0; });
  return jnTop("jnGo('who')")+'<div class="nf-l-hi">'+jE(jt('Many facilities together'))+'</div><div class="nf-l-sub">Tell us who you are and what you\'d like to cover. HealSol Academy will call you with a plan and pricing.</div>'
    +'<div class="nf-l-lbl">'+jE(jt('You are *'))+'</div><div class="jn-chips">'+JN_ORG.map(function(o){ return '<button type="button" class="'+(B.org===o?'on':'')+'" aria-pressed="'+(B.org===o)+'" onclick="jnB(\'org\',\''+o+'\',1)">'+jE(o)+'</button>'; }).join('')+'</div>'
    +'<label class="nf-l-lbl" for="jn-bo">'+jE(jt('Organisation name *'))+'</label><input class="jn-in" id="jn-bo" placeholder="e.g. District Health Society, Sitapur" value="'+jE(B.oname)+'" oninput="_jn.bulk.oname=this.value">'
    +'<label class="nf-l-lbl" for="jn-bs">'+jE(jt('State *'))+'</label><select class="jn-in" id="jn-bs" onchange="jnB(\'state\',this.value,1)">'+jnOpts(jnStates(),B.state)+'</select>'
    +'<div class="nf-l-lbl">'+jE(jt('Districts'))+'</div><div class="jn-dists">'+B.districts.map(function(d,i){ return '<button type="button" class="jn-dc" onclick="jnBDel('+i+')" aria-label="Remove '+jE(d)+'">'+jE(d)+' ×</button>'; }).join('')
      +(B.whole?'':'<select class="jn-dsel" aria-label="Add a district" onchange="jnBDist(this.value)">'+jnOpts(dl,'','+ add district')+'</select>')+'</div>'
    +'<label class="nf-l-chk" style="margin-top:6px"><input type="checkbox"'+(B.whole?' checked':'')+' onchange="jnB(\'whole\',this.checked,1)"> <span>'+jE(jt('Whole state'))+'</span></label>'
    +'<div class="nf-l-lbl">'+jE(jt('How many facilities? (roughly)'))+'</div><div class="jn-cnt">'+cnt+'<div class="jn-cr tot"><b>'+jE(jt('Total'))+'</b><b id="jn-tot">'+jnTot()+' facilities</b></div></div>'
    +'<div class="jn-2"><div><label class="nf-l-lbl" for="jn-bn">'+jE(jt('Your name *'))+'</label><input class="jn-in" id="jn-bn" value="'+jE(B.name)+'" oninput="_jn.bulk.name=this.value"></div><div><label class="nf-l-lbl" for="jn-bd">'+jE(jt('Designation *'))+'</label><input class="jn-in" id="jn-bd" placeholder="DPM / CMO" value="'+jE(B.desig)+'" oninput="_jn.bulk.desig=this.value"></div></div>'
    +'<div class="jn-2"><div><label class="nf-l-lbl" for="jn-bm">'+jE(jt('Mobile *'))+'</label><input class="jn-in" id="jn-bm" type="tel" inputmode="numeric" value="'+jE(B.mob)+'" oninput="_jn.bulk.mob=this.value"></div><div><label class="nf-l-lbl" for="jn-be">'+jE(jt('Email'))+'</label><input class="jn-in" id="jn-be" type="email" value="'+jE(B.email)+'" oninput="_jn.bulk.email=this.value"></div></div>'
    +'<label class="nf-l-lbl" for="jn-bmsg">'+jE(jt('Anything else? (optional)'))+'</label><textarea class="jn-in jn-ta" id="jn-bmsg" rows="3" placeholder="Timeline, funding, which blocks first…" oninput="_jn.bulk.msg=this.value">'+jE(B.msg)+'</textarea>'
    +jnErr()+'<button type="button" class="nf-l-btn" id="jn-bsend" onclick="jnBulkSend()">'+jE(jt('Send enquiry'))+'</button>';
}
async function jnBulkSend(){
  var B=_jn.bulk, mob=String(B.mob||'').replace(/\D/g,'').replace(/^(91|0)(?=\d{10}$)/,'');
  var bad=!String(B.oname||'').trim()?'Enter the organisation name.':!String(B.name||'').trim()?'Enter your name.':!String(B.desig||'').trim()?'Enter your designation.':!/^[6-9]\d{9}$/.test(mob)?'Enter a 10-digit mobile number.':'';
  if(bad){ _jn.err=bad; var e=document.getElementById('jn-err'); if(e){ e.textContent=bad; e.style.display='block'; } return; }
  var b=document.getElementById('jn-bsend'); if(b){ b.disabled=true; b.textContent='Sending…'; }
  try{ var r=await nfCall('submitEnquiry',{source:'bulk',orgType:B.org,orgName:String(B.oname).trim(),state:B.state,districts:B.whole?[]:B.districts,wholeState:!!B.whole,counts:B.counts,
      contactName:String(B.name).trim(),designation:String(B.desig).trim(),mobile:mob,email:String(B.email||'').trim(),message:String(B.msg||'').trim()});
    _jn.bres={ref:(r&&r.ref)||'',mob:mob}; jnGo('bulksent'); }
  catch(err){ _jn.err=typeof nfErrText==='function'?nfErrText(err):(err.message||'Could not send.'); jnRender(); }
}
function jnBulkSent(){
  var B=_jn.bulk, c=B.counts, parts=[['sc','SC'],['uphc','UPHC'],['phc','PHC'],['chc','CHC']].filter(function(x){ return c[x[0]]; }).map(function(x){ return c[x[0]]+' '+x[1]; });
  var row=function(k,v){ return v?'<div class="jn-sr"><span>'+jE(jt(k))+'</span><b>'+jE(v)+'</b></div>':''; };
  return '<div class="jn-done"><span class="jn-ok q"><i class="ti ti-check"></i></span><div class="nf-l-hi">'+jE(jt('Thank you'))+'</div>'
    +'<div class="nf-l-sub">HealSol Academy will call '+jE(B.name)+' on '+jE((_jn.bres||{}).mob||'')+' with a plan and pricing.</div>'
    +'<div class="jn-sum"><div class="jn-kick">'+jE(jt('YOUR ENQUIRY'))+'</div>'+row('Organisation',B.oname)+row('Districts',B.whole?jt('Whole state')+' · '+B.state:B.districts.join(', '))+row('Facilities',parts.join(' · '))+row('Reference',(_jn.bres||{}).ref)+'</div>'
    +'<div class="jn-note">After the agreement, HealSol enrols your facilities from the national list and makes your District Admin login.</div>'
    +'<button type="button" class="nf-l-btn" onclick="jnClose()">'+jE(jt('Back to log in'))+'</button></div>';
}
// language switch repaints the flow
(function(){ try{ var o=setLang; setLang=function(){ var r=o.apply(this,arguments); try{ if(document.getElementById('nf-login')&&document.getElementById('nf-login').classList.contains('jn-on')) jnRender(); jnPaintLogin(); }catch(e){} return r; }; }catch(e){} })();
// login screen: new tagline (all four types) and one Join button in place of the two old ones
function jnPaintLogin(){
  var root=document.getElementById('nf-login'); if(!root) return;
  var tag=root.querySelector('.nf-l-tag'); if(tag){ tag.removeAttribute('data-nf'); tag.innerHTML=jE(jt('Make your facility NQAS-ready'))+'<span class="jn-types"><i>Sub-Centre</i><i>UPHC</i><i>PHC</i><i>CHC</i></span>'; }
  var f=document.getElementById('nf-l-form'); if(!f) return;
  [].forEach.call(f.querySelectorAll('.nf-l-ghost,.nf-l-plain'),function(b){ if(!b.classList.contains('jn-join')&&b.id!=='nf-l-wa') b.remove(); });
  if(!document.getElementById('jn-join')){ f.insertAdjacentHTML('beforeend','<div class="jn-or"><span></span><b id="jn-or-t"></b><span></span></div><button type="button" class="nf-l-ghost jn-join" id="jn-join" onclick="jnOpen()"><i class="ti ti-user-plus"></i> <span id="jn-join-t"></span></button><div class="jn-hint" id="jn-join-s" style="text-align:center"></div>'); }
  var s=function(id,k){ var el=document.getElementById(id); if(el) el.textContent=jt(k); };
  try{ if(typeof nfSupportApply==='function') nfSupportApply(); }catch(e){}
  s('jn-or-t','New to NQAS FAST?'); s('jn-join-t','Join NQAS FAST'); s('jn-join-s','Facilities, staff, districts and partners');
}
(function(){ try{ var o=nfPaint; nfPaint=function(){ var r=o.apply(this,arguments); try{ jnPaintLogin(); }catch(e){} return r; }; }catch(e){} })();
try{ if(document.readyState!=='loading') jnPaintLogin(); else document.addEventListener('DOMContentLoaded',function(){ try{ jnPaintLogin(); }catch(e){} }); }catch(e){}
