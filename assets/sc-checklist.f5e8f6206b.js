
// ══════════════════════════════════════════════════════════════
// STEP A.3 — OFFICIAL CHECKLIST (12-Package Type B), MoV ITEMS, NQAS CRITERIA
//   Checkpoint fields added: ord (official order), mov (official MoV text, unchanged), t0 (original wording
//   when a spelling fix was applied), round ('General Round' / 'Community Interaction'),
//   items [{m:[methods], t:English, h:Hindi}] — actionable MoV items, full / fullHi — "what Full looks like"
//   for checkpoints without MoV items.
//   Scoring rule (used from Step B): all items met = Full (2) · 50–99% = Partial (1) · below 50% = Non (0).
//   One item: met = Full, not met = Non.
// ══════════════════════════════════════════════════════════════
SC_CPM_FIELDS.push('items','full','fullHi','round');
SC_SVC_GROUPS.support.push('General Clinical Processes');
// NQAS criteria and AoC categories (HealSol can change them: shared/nqas_criteria)
var SC_NQAS_DEFAULT={overall:70,aoc:70,stdDefault:50,std:{A1:60,D3:60,D4:60,D5:60,G2:60},
  aocCat:{A:'Outcome',B:'Process',C:'Structure',D:'Process',E:'Process',F:'Process',G:'Process',H:'Outcome'}};
var SC_AOC_CATS=['Structure','Process','Outcome'];
var _scCrit=JSON.parse(JSON.stringify(SC_NQAS_DEFAULT));
function scNqasStdMin(std){ return (_scCrit.std&&_scCrit.std[std]!=null)?+_scCrit.std[std]:+_scCrit.stdDefault; }
function scAocCat(aoc){ return (_scCrit.aocCat||{})[aoc]||SC_NQAS_DEFAULT.aocCat[aoc]||''; }
async function scCritLoad(){
  try{ var c=await fbGet('shared/nqas_criteria');
    _scCrit=JSON.parse(JSON.stringify(SC_NQAS_DEFAULT));
    if(c){ if(c.overall!=null) _scCrit.overall=+c.overall; if(c.aoc!=null) _scCrit.aoc=+c.aoc; if(c.stdDefault!=null) _scCrit.stdDefault=+c.stdDefault;
      if(c.std) _scCrit.std=c.std; if(c.aocCat) Object.assign(_scCrit.aocCat,c.aocCat); }
  }catch(e){}
  return _scCrit;
}
async function scCritEdit(){
  if(!scCpmCanEdit()) return;
  var ov=Object.keys(_scCrit.std||{}).sort(scStdCmp).map(function(s){ return s+' '+_scCrit.std[s]; }).join(', ');
  var v=await scDialog({title:'NQAS accreditation criteria',icon:'🎯',wide:true,okLabel:'Save criteria',
    message:'Used by every readiness dashboard and by graduation on Day 60. A facility meets NQAS when the overall score, every Area of Concern and every Standard reach their minimum.',
    fields:[
      {key:'overall',label:'Overall score minimum (%)',type:'number',required:true,value:_scCrit.overall},
      {key:'aoc',label:'Every Area of Concern — minimum (%)',type:'number',required:true,value:_scCrit.aoc!=null?_scCrit.aoc:70},
      {key:'stdDefault',label:'Every Standard — minimum (%)',type:'number',required:true,value:_scCrit.stdDefault},
      {key:'std',label:'Standards with a different minimum (e.g. "A1 60, D3 60")',value:ov,placeholder:'A1 60, D3 60, D4 60, D5 60, G2 60'},
      {key:'cS',label:'Structure — AoCs',value:Object.keys(SC_CPM_AOC).filter(function(a){ return scAocCat(a)==='Structure'; }).join(', ')},
      {key:'cP',label:'Process — AoCs',value:Object.keys(SC_CPM_AOC).filter(function(a){ return scAocCat(a)==='Process'; }).join(', ')},
      {key:'cO',label:'Outcome — AoCs',value:Object.keys(SC_CPM_AOC).filter(function(a){ return scAocCat(a)==='Outcome'; }).join(', ')}
    ],
    validate:function(v){
      var o=+v.overall, d=+v.stdDefault, ao=+v.aoc; if(!(o>0&&o<=100)||!(d>0&&d<=100)||!(ao>0&&ao<=100)) return 'Percentages must be between 1 and 100.';
      var bad=String(v.std||'').split(/[,;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean).filter(function(x){ return !/^[A-H]\d+\s*[:=]?\s*\d{1,3}$/i.test(x); });
      if(bad.length) return 'Write each Standard minimum like "A1 60" — check: '+bad.join(', ');
      var seen={}, err=null;
      ['cS','cP','cO'].forEach(function(k){ String(v[k]||'').toUpperCase().split(/[,\s]+/).filter(Boolean).forEach(function(a){ if(!SC_CPM_AOC[a]) err='Unknown AoC "'+a+'".'; if(seen[a]) err='AoC '+a+' is in two categories.'; seen[a]=1; }); });
      if(err) return err;
      var miss=Object.keys(SC_CPM_AOC).filter(function(a){ return !seen[a]; }); if(miss.length) return 'Put every AoC in a category — missing: '+miss.join(', ');
      return null;
    }});
  if(!v) return;
  var std={}; String(v.std||'').split(/[,;\n]+/).map(function(x){ return x.trim(); }).filter(Boolean).forEach(function(x){ var m=/^([A-H]\d+)\s*[:=]?\s*(\d{1,3})$/i.exec(x); std[m[1].toUpperCase()]=+m[2]; });
  var cat={}; [['cS','Structure'],['cP','Process'],['cO','Outcome']].forEach(function(p){ String(v[p[0]]||'').toUpperCase().split(/[,\s]+/).filter(Boolean).forEach(function(a){ cat[a]=p[1]; }); });
  var rec={overall:+v.overall,aoc:+v.aoc,stdDefault:+v.stdDefault,std:std,aocCat:cat,updatedAt:scNowIso(),updatedBy:'HealSol Admin'};
  if(!await fbSet('shared/nqas_criteria',rec)){ showToast('Could not save — check connection.','err'); return; }
  _scCrit=rec; showToast('NQAS criteria saved.','ok'); scCpmRender();
}

// ── registry: official ME titles are the base; HealSol edits override ──
(function(){
  function merge(fb){
    var out={std:{},me:{}};
    ['std','me'].forEach(function(t){
      var B=(typeof SC_REG_BASE!=='undefined'&&SC_REG_BASE)||{};   // SC data may still be loading (speed, 26 Oct 2026)
      Object.keys(B[t]||{}).forEach(function(k){ out[t][k]=Object.assign({},B[t][k]); });
      Object.keys((fb||{})[t]||{}).forEach(function(k){ var e=fb[t][k]||{}, b=out[t][k]||{};
        out[t][k]={title:e.title||b.title||'',hi:e.hi||b.hi||''}; });
    });
    return out;
  }
  _scReg=merge(_scReg); nfScDataThen(function(){ _scReg=merge(_scReg); });
  var oLoad=scCpmLoad;
  scCpmLoad=async function(force){ var r=await oLoad.apply(this,arguments); _scReg=merge(_scReg); try{ await scCritLoad(); }catch(e){} return r; };
  // Official order everywhere (AoC → Standard → ME → checkpoint as in the checklist)
  var oAll=scCpmAll;
  scCpmAll=function(){ return oAll.apply(this,arguments).sort(function(a,b){ return ((a.ord||99999)-(b.ord||99999))||(a.id<b.id?-1:a.id>b.id?1:0); }); };
  // Day cards carry the MoV items; the short line under each checkpoint says how many things to check
  var oApply=scCpmApply;
  scCpmApply=function(cp,id){
    var o=oApply.apply(this,arguments), m=o&&o.id?scCpmGet(id):null; if(!m) return o;
    o.items=(m.items||[]).slice(); o.full=m.full||''; o.fullHi=m.fullHi||''; o.round=m.round||''; o.movOfficial=m.mov||'';
    var n=o.items.length, hi=_appLang==='hi';
    o.mov=n?(hi?n+' बात'+(n===1?'':'ें')+' जाँचनी है'+(n===1?'':'ं')+' — ⓘ दबाएँ':n+' thing'+(n===1?'':'s')+' to check — tap ⓘ')
      :(m.mov?m.mov:(m.kind==='nqas'?(hi?'सीधे स्कोर करें — पूर्ण का अर्थ जानने के लिए ⓘ दबाएँ':'Score directly — tap ⓘ to see what Full means'):''));
    return o;
  };
  // Hindi checkpoint text comes from the master
  var oTxt=getCPText;
  getCPText=function(cp){ if(cp&&_appLang==='hi'&&cp.hi) return cp.hi; return oTxt.apply(this,arguments); };
  // Language change: day cards rebuild their "things to check" line
  var oLang=setLang;
  setLang=function(){ scCpmInvalidate(); return oLang.apply(this,arguments); };
})();

// ══════════════════════════════════════════════════════════════
// STAFF HELP (ⓘ) — the actionable MoV items and how the score works
// ══════════════════════════════════════════════════════════════
var SC_M_LABEL={SI:{en:'Staff interview',hi:'स्टाफ़ से पूछें',c:'#9D174D',b:'#FFF0F3'},RR:{en:'Record review',hi:'रिकॉर्ड देखें',c:'#166534',b:'#F0FDF4'},
  OB:{en:'Observation',hi:'देखकर जाँचें',c:'#1E6B5E',b:'#EBF8F5'},CI:{en:'Client interview',hi:'लाभार्थी से पूछें',c:'#92400E',b:'#FEF3E0'}};
function scMovRuleHTML(n,hi){
  if(n===1) return hi?'<b>1 बात:</b> पूरी हो = <b>पूर्ण (2)</b> · न हो = <b>शून्य (0)</b>':'<b>1 thing:</b> met = <b>Full (2)</b> · not met = <b>Non (0)</b>';
  var half=Math.ceil(n/2), pr=half===n-1?String(half):half+'–'+(n-1), lo=half-1;
  var nonEn=lo===0?'0 met':lo+' or fewer met', nonHi=lo===0?'0 पूरी':lo+' या कम पूरी';
  return hi?'<b>'+n+' बातें:</b> सभी '+n+' पूरी = <b>पूर्ण (2)</b> · '+pr+' पूरी = <b>आंशिक (1)</b> · '+nonHi+' = <b>शून्य (0)</b>'
    :'<b>'+n+' things:</b> all '+n+' met = <b>Full (2)</b> · '+pr+' met = <b>Partial (1)</b> · '+nonEn+' = <b>Non (0)</b>';
}
function scMovHelpHTML(cp){
  var hi=_appLang==='hi', items=cp.items||[];
  var h='';
  if(items.length){
    h+='<div class="scmv-hd">'+(hi?'जाँचने के लिए':'What to check')+'</div><ol class="scmv-list">'
      +items.map(function(it){
        return '<li><div class="scmv-m">'+(it.m||[]).map(function(m){ var L=SC_M_LABEL[m]||{en:m,hi:m,c:'#374151',b:'#F3F4F6'};
          return '<span style="color:'+L.c+';background:'+L.b+';">'+scEsc(hi?L.hi:L.en)+'</span>'; }).join('')+'</div>'
          +'<div class="scmv-t">'+scEsc(hi&&it.h?it.h:it.t)+'</div></li>';
      }).join('')+'</ol>'
      +'<div class="scmv-rule">'+scMovRuleHTML(items.length,hi)+'</div>';
  } else if(cp.kind==='nqas'){
    var full=hi&&cp.fullHi?cp.fullHi:cp.full;
    h+='<div class="scmv-hd">'+(hi?'इसे सीधे स्कोर करें':'Score this directly')+'</div>'
      +(full?'<div class="scmv-full"><b>'+(hi?'पूर्ण का अर्थ:':'Full means:')+'</b> '+scEsc(full)+'</div>':'')
      +'<div class="scmv-rule">'+(hi?'<b>पूर्ण (2)</b> पूरी तरह लागू · <b>आंशिक (1)</b> कुछ हद तक · <b>शून्य (0)</b> लागू नहीं':'<b>Full (2)</b> fully in place · <b>Partial (1)</b> partly · <b>Non (0)</b> not in place')+'</div>';
  }
  if(cp.movOfficial) h+='<details class="scmv-off"><summary>'+(hi?'आधिकारिक साक्ष्य (चेकलिस्ट से)':'Official means of verification (checklist)')+'</summary><div>'+scEsc(cp.movOfficial).replace(/\n/g,'<br>')+'</div></details>';
  if(cp.round) h+='<div class="scmv-round"><i class="ti ti-walk"></i> '+scEsc(cp.round==='General Round'?(hi?'सामान्य राउंड — सभी स्टाफ़ स्कोर करें; सबसे कम स्कोर गिना जाएगा':'General Round — every staff member scores it; the lowest score counts'):(hi?'सामुदायिक संवाद — ASHA द्वारा':'Community Interaction — scored by the ASHA'))+'</div>';
  return h;
}
(function(){
  var oHelp=showHelp;
  showHelp=function(di,ci){
    var d=getDay(di), cp=d&&d.cps&&d.cps[ci];
    if(!cp||!cp.id) return oHelp.apply(this,arguments);
    var key=di+'-'+ci, drawer=document.getElementById('help-'+key); if(!drawer) return;
    if(openHelpKey&&openHelpKey!==key){ var prev=document.getElementById('help-'+openHelpKey); if(prev){ prev.classList.remove('open'); prev.innerHTML=''; } }
    if(drawer.classList.contains('open')){ drawer.classList.remove('open'); drawer.innerHTML=''; openHelpKey=null; return; }
    drawer.innerHTML=scMovHelpHTML(cp); drawer.classList.add('open'); openHelpKey=key;
  };
})();

// ══════════════════════════════════════════════════════════════
// CHO FALLBACK — a checkpoint whose role nobody holds at this facility is scored by the CHO
// ══════════════════════════════════════════════════════════════
var _scRolesPresent=null;   // {CHO:true, ANM:true, …} for the signed-in staff member's facility
function scRolesFromRoster(roster){ var p={}; Object.keys(roster||{}).forEach(function(m){ var s=roster[m]; if(s&&!s.disabled) p[s.role||'CHO']=true; }); return p; }
function scCpFallbackToCho(cp,present){
  if(!present) return false;
  var rs=scCpRoles(cp); if(rs.indexOf('General')>=0||rs.indexOf('CHO')>=0) return false;
  return rs.length>0&&rs.every(function(r){ return !present[r]; });
}
(function(){
  var oFor=scCpForRole;
  scCpForRole=function(cp,role){
    if(oFor.apply(this,arguments)) return true;
    return role==='CHO'&&scCpFallbackToCho(cp,_scRolesPresent);
  };
  var oStart=scStartApp;
  scStartApp=async function(){
    _scRolesPresent=null;
    try{ if(choState.facilityCode){ var st=await fbGet(scFacilityPath(choState.facilityCode)+'/staff'); _scRolesPresent=scRolesFromRoster(st||{}); } }catch(e){}
    return oStart.apply(this,arguments);
  };
  var oOut=logoutCHO;
  logoutCHO=async function(){ var r=await oOut.apply(this,arguments); if(!document.getElementById('cho-app').classList.contains('vis')) _scRolesPresent=null; return r; };
})();

// ══════════════════════════════════════════════════════════════
// CHECKPOINT MASTER — items in the editor, list, tree, checks and CSV
// ══════════════════════════════════════════════════════════════
function scItemsToText(items,lang){ return (items||[]).map(function(it){ var m=(it.m||[]).join('/'); return (m?'['+m+'] ':'')+(lang==='hi'?(it.h||''):it.t); }).join('\n'); }
function scItemsParse(en,hi){
  var E=String(en||'').split('\n').map(function(x){ return x.trim(); }).filter(Boolean), H=String(hi||'').split('\n').map(function(x){ return x.trim(); }).filter(Boolean);
  var errs=[], out=E.map(function(line,i){
    var m=/^\[([A-Za-z/ ]+)\]\s*(.+)$/.exec(line), ms=[], t=line;
    if(m){ ms=m[1].toUpperCase().split(/[\/\s]+/).filter(Boolean); t=m[2].trim(); }
    var bad=ms.filter(function(x){ return ['SI','RR','OB','CI'].indexOf(x)<0; }); if(bad.length) errs.push('Item '+(i+1)+': unknown method "'+bad.join('/')+'" — use SI, RR, OB or CI.');
    if(t.length<8) errs.push('Item '+(i+1)+' is too short to check.');
    var hl=(H[i]||'').replace(/^\[[A-Za-z/ ]+\]\s*/,'');
    return {m:ms,t:t,h:hl};
  });
  if(H.length&&H.length!==E.length) errs.push('Hindi has '+H.length+' line'+(H.length===1?'':'s')+' but English has '+E.length+' — keep one line per item, in the same order.');
  return {items:out,errs:errs};
}
scCpmEdit=async function(id,presetMe){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit the Checkpoint Master.','err'); return; }
  var c=id?scCpmGet(id):null, used=id?scCpmUsage(id):[], H=scCpmHierarchy(null);
  var me0=c?c.me:(presetMe||''), std0=c?c.std:scCpmStdOf(presetMe), aoc0=c?c.aoc:(std0?std0.charAt(0):'A');
  if(c&&c.kind==='milestone'){ aoc0=''; std0=''; me0=''; }
  var stdOpts=function(){ return Object.keys(H.std).sort(scStdCmp).map(function(s){ return {value:s,label:s+(H.std[s].title?' — '+H.std[s].title:'')}; }); };
  var meOpts=function(){ return Object.keys(H.me).sort(scMeCmp).map(function(m){ return {value:m,label:m+(H.me[m].title?' — '+H.me[m].title:'')+' ('+H.me[m].cps+' cp)'}; }); };
  var fields=[
    {key:'aoc',label:'Area of Concern',type:'select',value:aoc0,options:[{value:'',label:'— Programme milestone (not an NQAS checkpoint) —'}].concat(Object.keys(SC_CPM_AOC).map(function(a){ return {value:a,label:a+' · '+SC_CPM_AOC[a]+' · '+scAocCat(a)}; }))},
    {key:'std',label:'Standard',type:'select',value:std0,options:[{value:'',label:'— choose —'}].concat(stdOpts(),[{value:'__new',label:'+ New Standard…'}])},
    {key:'stdNew',label:'New Standard code',value:'',placeholder:'e.g. A3'},
    {key:'me',label:'Measurable Element',type:'select',value:me0,options:[{value:'',label:'— choose —'}].concat(meOpts(),[{value:'__new',label:'+ New ME under this Standard…'}])},
    {key:'meNew',label:'New ME code',value:'',placeholder:'e.g. ME A3.1'},
    {key:'t',label:'Checkpoint (English)',type:'textarea',required:true,value:c?c.t:''},
    {key:'hi',label:'Checkpoint (Hindi)',type:'textarea',value:c?c.hi||'':''}];
  if(c&&c.mov) fields.push({key:'_mov',label:'Official means of verification (from the checklist)',type:'info',value:c.mov});
  fields.push(
    {key:'itemsEn',label:'MoV items — English (one per line; start with methods, e.g. "[SI/RR] Check …")',type:'textarea',rows:5,value:c?scItemsToText(c.items,'en'):'',placeholder:'[RR] ANC register shows …\n[SI] Ask the CHO …'},
    {key:'itemsHi',label:'MoV items — Hindi (same number of lines, same order)',type:'textarea',rows:5,value:c?scItemsToText(c.items,'hi'):''},
    {key:'full',label:'What Full looks like — only when there are no MoV items (English)',type:'textarea',rows:2,value:c?c.full||'':''},
    {key:'fullHi',label:'What Full looks like (Hindi)',type:'textarea',rows:2,value:c?c.fullHi||'':''},
    {key:'svc',label:'Service / area',type:'select',value:c?c.svc:'',options:[{value:'',label:'—'}].concat(scCpmServices().map(function(s){ return {value:s,label:s+' · '+SC_SVC_GROUP_LABEL[scSvcGroup(s)]}; }))},
    {key:'r',label:'Who scores it',type:'checklist',value:c?c.r:['CHO'],options:SC_KNOWN_ROLES.map(function(r){ return {value:r,label:r==='General'?'General — every staff member (lowest score counts)':r}; })},
    {key:'round',label:'Assessor round',type:'select',value:c?c.round||'':'',options:[{value:'',label:'—'},{value:'General Round',label:'General Round'},{value:'Community Interaction',label:'Community Interaction'}]},
    {key:'method',label:'Assessment methods',type:'checklist',value:c?c.method:['SI','RR'],options:[{value:'SI',label:'SI — Staff Interview'},{value:'RR',label:'RR — Record Review'},{value:'OB',label:'OB — Observation'},{value:'CI',label:'CI — Client Interview'}]},
    {key:'video',label:'Video link (optional)',value:c?c.video||'':'',placeholder:'YouTube, Vimeo, Wix or .mp4 link'},
    {key:'pk',label:'Packages',type:'checklist',value:c?c.pk:['12A','12B'],options:[{value:'12A',label:'12A'},{value:'12B',label:'12B'}]},
    {key:'retired',label:'Status',type:'checklist',value:c&&c.retired?['retired']:[],options:[{value:'retired',label:'Retired — no longer used in readiness or new day plans'}]});
  var v=await scDialog({title:c?'Edit checkpoint '+id:'New checkpoint',icon:'📋',wide:true,okLabel:c?'Save — applies to every day':'Add to master',
    message:c?('Used on '+(used.length?used.map(function(x){ return x.pkg+' Day '+x.day; }).join(', '):'no day card yet')+'. Changes apply everywhere it is used.'):'Choose where it sits in the NQAS checklist, then write the checkpoint and its MoV items.',
    fields:fields,
    onRender:function(inp){ scCpmCascade(inp,H,stdOpts,meOpts); },
    validate:function(v){ var e=scCpmValidate(v,c,H); if(e) return e; var p=scItemsParse(v.itemsEn,v.itemsHi); return p.errs[0]||null; }});
  if(!v) return;
  var R=scCpmResolve(v), P=scItemsParse(v.itemsEn,v.itemsHi);
  var vals={t:v.t,hi:(v.hi||'').trim(),me:R.me,aoc:R.aoc,kind:R.kind,svc:v.svc,r:scCpmRolesClean(v.r),method:v.method,video:(v.video||'').trim(),pk:v.pk,
    retired:v.retired.indexOf('retired')>=0,items:P.items,full:(v.full||'').trim(),fullHi:(v.fullHi||'').trim(),round:v.round||''};
  var notes=[];
  if(c&&c.kind==='nqas'&&R.kind==='nqas'&&c.me!==R.me) notes.push('Moves '+id+' from '+c.me+' (Standard '+c.std+') to '+R.me+' (Standard '+R.std+'). Its ID stays '+id+'.');
  if(c&&c.kind!==R.kind) notes.push(R.kind==='milestone'?'Turns this NQAS checkpoint into a programme milestone — it will stop counting in readiness.':'Turns this milestone into an NQAS checkpoint under '+R.me+' — it will count in readiness.');
  var same=scCpmAll({}).filter(function(x){ return x.id!==id&&scCpmNormT(x.t).toLowerCase()===scCpmNormT(v.t).toLowerCase(); });
  if(same.length) notes.push('The same wording is already used by '+same.map(function(x){ return x.id+' ('+(x.me||'milestone')+')'; }).join(', ')+'.');
  if(vals.retired&&!(c&&c.retired)&&R.kind==='nqas') vals.pk.forEach(function(p){ if(!scCpmAll({pkg:'nqas_'+p}).some(function(x){ return x.me===R.me&&x.id!==id; })) notes.push('This is the last active checkpoint of '+R.me+' in '+p+' — the ME would no longer be assessed.'); });
  if(c&&(c.items||[]).length!==P.items.length&&(c.items||[]).length) notes.push('Changes the number of MoV items from '+c.items.length+' to '+P.items.length+' — this changes how Full / Partial / Non is worked out.');
  if(R.kind==='nqas'&&P.items.length&&P.items.some(function(it){ return !it.h; })) notes.push('Some MoV items have no Hindi yet — staff using Hindi will see English for those.');
  if(R.newStd) notes.push('Adds new Standard '+R.std+' to the hierarchy.');
  if(R.newMe) notes.push('Adds new ME '+R.me+' to the hierarchy.');
  if(JSON.stringify(vals.r)!==JSON.stringify(scCpmRoles(v.r))) notes.push('"General" already includes CHO, ANM, ASHA and MPW, so those ticks were removed.');
  if(notes.length&&!(await showConfirm(notes.join('\n\n'),'⚠️','Please confirm','Save','var(--teal)'))) return;
  if(R.newStd) await scRegSave('std',R.std,{title:'',hi:''});
  if(R.newMe) await scRegSave('me',R.me,{title:'',hi:''});
  var ok=c?await scCpmSave(id,vals):!!(await scCpmAdd(vals));
  showToast(ok?(c?'Saved — '+id+' updated on '+(used.length||0)+' day card'+(used.length===1?'':'s')+'.':'Checkpoint added to the master.'):'Could not save — check connection.',ok?'ok':'err');
  scCpmRender(); if(adminEditorDay!=null) aeRenderCPs(adminEditorDay);
};
(function(){
  // new checkpoints keep their MoV items, notes and round
  var oAdd=scCpmAdd;
  scCpmAdd=async function(vals){ var id=await oAdd.apply(this,arguments); if(id&&(vals.items||vals.full||vals.round)){ await scCpmSave(id,{items:vals.items||[],full:vals.full||'',fullHi:vals.fullHi||'',round:vals.round||''}); } return id; };
  // row: MoV item count, round
  var oRow=scCpmRowHTML;
  scCpmRowHTML=function(c){
    var h=oRow.apply(this,arguments), n=(c.items||[]).length, hiN=(c.items||[]).filter(function(i){ return i.h; }).length;
    var chip=c.kind!=='nqas'?'':(n?'<span class="mv'+(hiN<n?' part':'')+'" title="'+scEsc((c.items||[]).map(function(i){ return '['+(i.m||[]).join('/')+'] '+i.t; }).join('\n'))+'">'+n+' MoV item'+(n===1?'':'s')+(hiN<n?' · Hindi '+hiN+'/'+n:'')+'</span>'
      :(c.mov?'<span class="mv none">MoV items to write</span>':'<span class="mv">No MoV — scored directly</span>'));
    if(c.round) chip+='<span>'+scEsc(c.round)+'</span>';
    return h.replace('<span class="pk">',chip+'<span class="pk">');
  };
  // checks: MoV items
  var oChecks=scCpmChecks;
  scCpmChecks=function(pkgCode){
    var out=oChecks.apply(this,arguments), pkg=pkgCode&&pkgCode!=='all'?'nqas_'+pkgCode:null;
    var nq=scCpmAll({pkg:pkg}).filter(function(c){ return c.kind==='nqas'; });
    function add(key,level,label,detail,ids,view){ out.push({key:key,level:level,label:label,detail:detail||'',ids:ids||[],n:(ids||[]).length,view:view||'cps'}); }
    var noItems=nq.filter(function(c){ return c.mov&&!(c.items||[]).length; }).map(function(c){ return c.id; });
    add('noItems',noItems.length?'warn':'ok','Checkpoints whose MoV items are not written yet','Staff see the official MoV text until the actionable items are written.',noItems);
    var noHiItems=nq.filter(function(c){ return (c.items||[]).some(function(i){ return !i.h; }); }).map(function(c){ return c.id; });
    add('itemsNoHindi',noHiItems.length?'warn':'ok','MoV items without Hindi','',noHiItems);
    var badM=nq.filter(function(c){ return (c.items||[]).some(function(i){ return !(i.m||[]).length; }); }).map(function(c){ return c.id; });
    add('itemsNoMethod',badM.length?'warn':'ok','MoV items without a method (SI/RR/OB/CI)','',badM);
    var noNote=nq.filter(function(c){ return !c.mov&&!(c.items||[]).length&&!c.full; }).map(function(c){ return c.id; });
    add('noFullNote',noNote.length?'info':'ok','Checkpoints without MoV and without a "what Full looks like" note','Staff score these directly — a short note helps them judge.',noNote);
    return out;
  };
  // tree: AoC category and Standard minimums, criteria button
  var oTree=scCpmTreeHTML;
  scCpmTreeHTML=function(){
    var h=oTree.apply(this,arguments);
    var cats=SC_AOC_CATS.map(function(k){ return '<span class="scm-cat '+k.toLowerCase()+'">'+k+': '+Object.keys(SC_CPM_AOC).filter(function(a){ return scAocCat(a)===k; }).join(', ')+'</span>'; }).join('');
    var crit='<div class="scm-crit"><div><b>NQAS criteria</b> · overall ≥'+_scCrit.overall+'% · every AoC ≥'+(_scCrit.aoc!=null?_scCrit.aoc:70)+'% · every Standard ≥'+_scCrit.stdDefault+'%'
      +(Object.keys(_scCrit.std||{}).length?' · '+Object.keys(_scCrit.std).sort(scStdCmp).map(function(s){ return s+' ≥'+_scCrit.std[s]+'%'; }).join(', '):'')+'</div><div class="scm-cats">'+cats+'</div>'
      +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCritEdit()"><i class="ti ti-target"></i> Edit criteria</button></div>';
    h=h.replace('<div class="scm-bar">',crit+'<div class="scm-bar">');
    Object.keys(SC_CPM_AOC).forEach(function(a){ h=h.replace('<b>AoC '+a+'</b> ','<b>AoC '+a+'</b> <span class="scm-cat '+scAocCat(a).toLowerCase()+'">'+scAocCat(a)+'</span> '); });
    h=h.replace(/<div class="scm-std-hd"><b>([A-H]\d+)<\/b>/g,function(_,s){ var m=scNqasStdMin(s); return '<div class="scm-std-hd"><b>'+s+'</b><i class="scm-min'+(m!==_scCrit.stdDefault?' hi':'')+'" title="Minimum score for NQAS">≥'+m+'%</i>'; });
    return h;
  };
  scCpmCsv=function(){
    var rows=[['ID','Order','Kind','Packages','Category','AoC','AoC title','Standard','Standard title','Standard minimum %','ME','ME title','Service','Group','Roles','Assessor round','Methods','Checkpoint','Hindi','Original wording',
      'Official MoV','MoV items (English)','MoV items (Hindi)','What Full looks like','Video','Video (Hindi)','Cross-cutting areas','Retired','Used on']];
    scCpmAll({includeRetired:true}).forEach(function(c){
      rows.push([c.id,c.ord||'',c.kind,c.pk.join(' '),c.aoc?scAocCat(c.aoc):'',c.aoc,c.aoc?SC_CPM_AOC[c.aoc]:'',c.std,scRegTitle('std',c.std),c.std?scNqasStdMin(c.std):'',c.me,scRegTitle('me',c.me),
        c.svc,SC_SVC_GROUP_LABEL[scSvcGroup(c.svc)],c.r.join(' '),c.round||'',c.method.join(' '),c.t,c.hi||'',c.t0||'',c.mov||'',scItemsToText(c.items,'en'),scItemsToText(c.items,'hi'),c.full||'',
        c.video||'',c.videoHi||'',(typeof nfCcOf==='function'?nfCcOf(c):[]).join('; '),c.retired?'yes':'',scCpmUsage(c.id).map(function(x){ return x.pkg+' D'+x.day; }).join(' ')]);
    });
    return rows.map(function(r){ return r.map(function(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(','); }).join('\n');
  };
})();
