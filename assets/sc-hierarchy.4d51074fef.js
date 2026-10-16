
// ══════════════════════════════════════════════════════════════
// STEP A.2 — NQAS HIERARCHY: AoC → Standard → ME → Checkpoint
// The Standard is always the ME's prefix (ME A1.1 → Standard A1 → AoC A), so it can
// never disagree with the ME. Titles live in a registry HealSol can fill in:
//   shared/cp_master/registry = {std:{A1:{title,hi}}, me:{'ME A1-1':{title,hi}}}   ('.' is not allowed in Firebase keys)
// ══════════════════════════════════════════════════════════════
var _scReg={std:{},me:{}};
function scCpmStdOf(me){ var m=/^ME ([A-H]\d+)\.\d+$/.exec(scCpmNormMe(me)); return m?m[1]:''; }
function scCpmNormStd(s){ s=String(s||'').replace(/^\s*standard\s*/i,'').replace(/\s+/g,'').toUpperCase(); return /^[A-H]\d+$/.test(s)?s:''; }
function scStdCmp(a,b){ return a.charAt(0)<b.charAt(0)?-1:a.charAt(0)>b.charAt(0)?1:(+a.slice(1))-(+b.slice(1)); }
function scMeCmp(a,b){ var x=/([A-H])(\d+)\.(\d+)/.exec(a)||[0,'',0,0], y=/([A-H])(\d+)\.(\d+)/.exec(b)||[0,'',0,0];
  return x[1]<y[1]?-1:x[1]>y[1]?1:(+x[2]-y[2])||(+x[3]-y[3]); }
function scRegKey(me){ return String(me).replace(/\./g,'-'); }
function scRegUnkey(k){ return String(k).replace(/^(ME [A-H]\d+)-(\d+)$/,'$1.$2'); }
function scRegTitle(type,code){ var e=(_scReg[type]||{})[code]; return (e&&e.title)||''; }

// Full hierarchy for a package: everything in the registry + everything checkpoints use
function scCpmHierarchy(pkg){
  var H={aoc:{},std:{},me:{}};
  Object.keys(SC_CPM_AOC).forEach(function(a){ H.aoc[a]={code:a,title:SC_CPM_AOC[a],std:[],cps:0}; });
  function addStd(s){ if(!s||!H.aoc[s.charAt(0)]) return null;
    if(!H.std[s]){ H.std[s]={code:s,aoc:s.charAt(0),title:scRegTitle('std',s),hi:((_scReg.std[s]||{}).hi)||'',me:[],cps:0,inReg:!!_scReg.std[s]}; H.aoc[s.charAt(0)].std.push(s); }
    return H.std[s]; }
  function addMe(m){ var s=scCpmStdOf(m); if(!s||!addStd(s)) return null;
    if(!H.me[m]){ H.me[m]={code:m,std:s,title:scRegTitle('me',m),hi:((_scReg.me[m]||{}).hi)||'',cps:0,ids:[],inReg:!!_scReg.me[m]}; H.std[s].me.push(m); }
    return H.me[m]; }
  Object.keys(_scReg.std||{}).forEach(addStd); Object.keys(_scReg.me||{}).forEach(addMe);
  scCpmAll({pkg:pkg}).forEach(function(c){ if(c.kind!=='nqas') return; var e=addMe(c.me); if(!e) return; e.cps++; e.ids.push(c.id); H.std[e.std].cps++; H.aoc[e.std.charAt(0)].cps++; });
  Object.keys(H.aoc).forEach(function(a){ H.aoc[a].std.sort(scStdCmp); });
  Object.keys(H.std).forEach(function(s){ H.std[s].me.sort(scMeCmp); });
  return H;
}
async function scRegSave(type,code,vals){
  if(!scCpmCanEdit()) return false;
  var k=type==='me'?scRegKey(code):code, rec=scClean({title:(vals.title||'').trim(),hi:(vals.hi||'').trim(),updatedAt:scNowIso()});
  var ok=await fbSet('shared/cp_master/registry/'+type+'/'+k,rec);
  if(ok) _scReg[type][code]=rec;
  return ok;
}
// Paste titles from the official checklist: "A1 | title", "Standard A1 - title", "ME A1.1<TAB>title"
function scRegParse(text){
  var out={std:{},me:{},bad:[]};
  String(text||'').split(/\r?\n/).forEach(function(line){
    var l=line.trim(); if(!l) return;
    var m=/^(ME\s*[A-H]\s*\d+\s*\.\s*\d+)\s*(?:\t|\||:|–|—|-)\s*(.+)$/i.exec(l);
    if(m){ var me=scCpmNormMe(m[1].replace(/\s*\.\s*/,'.')); if(scCpmStdOf(me)){ out.me[me]=m[2].trim(); return; } }
    m=/^(?:standard\s*)?([A-H]\s*\d+)\s*(?:\t|\||:|–|—|-)\s*(.+)$/i.exec(l);
    if(m){ var s=scCpmNormStd(m[1]); if(s){ out.std[s]=m[2].trim(); return; } }
    out.bad.push(l);
  });
  return out;
}
async function scRegImport(){
  if(!scCpmCanEdit()) return;
  var v=await scDialog({title:'Paste Standard and ME titles',icon:'📥',wide:true,okLabel:'Import titles',
    message:'Paste from the official NQAS checklist, one per line. Examples:\nA1 | Facility provides curative services\nME A1.1 | Facility provides ANC services\nNew codes are added to the hierarchy (so you can add Standards and MEs before writing their checkpoints).',
    fields:[{key:'txt',label:'Titles',type:'textarea',rows:10,required:true,placeholder:'A1 | …\nME A1.1 | …'}],
    validate:function(v){ var p=scRegParse(v.txt); return (Object.keys(p.std).length+Object.keys(p.me).length)?null:'No lines recognised. Use "A1 | title" or "ME A1.1 | title".'; }});
  if(!v) return;
  var p=scRegParse(v.txt), n=0, newCodes=0, H=scCpmHierarchy(null);
  for(var s in p.std){ if(!H.std[s]) newCodes++; if(await scRegSave('std',s,{title:p.std[s],hi:((_scReg.std[s]||{}).hi)||''})) n++; }
  for(var m in p.me){ if(!H.me[m]) newCodes++; if(await scRegSave('me',m,{title:p.me[m],hi:((_scReg.me[m]||{}).hi)||''})) n++; }
  showToast(n+' title'+(n===1?'':'s')+' saved'+(newCodes?' · '+newCodes+' new code'+(newCodes===1?'':'s')+' added':'')+(p.bad.length?' · '+p.bad.length+' line'+(p.bad.length===1?'':'s')+' not recognised':'')+'.',p.bad.length?'':'ok');
  scCpmRender();
}
async function scRegEdit(type,code){
  if(!scCpmCanEdit()) return;
  var e=(_scReg[type]||{})[code]||{};
  var v=await scDialog({title:(type==='std'?'Standard ':'')+code,icon:type==='std'?'📘':'📗',okLabel:'Save title',
    message:type==='std'?'Area of Concern '+code.charAt(0)+' · '+SC_CPM_AOC[code.charAt(0)]:'Standard '+scCpmStdOf(code)+(scRegTitle('std',scCpmStdOf(code))?' · '+scRegTitle('std',scCpmStdOf(code)):''),
    fields:[{key:'title',label:'Title (English)',type:'textarea',rows:2,required:true,value:e.title||''},{key:'hi',label:'Title (Hindi)',type:'textarea',rows:2,value:e.hi||''}]});
  if(!v) return;
  showToast(await scRegSave(type,code,v)?'Title saved.':'Could not save — check connection.','ok'); scCpmRender();
}

// ── hierarchy on every checkpoint and day card ────────────────
(function(){
  var oGet=scCpmGet;
  scCpmGet=function(){ var o=oGet.apply(this,arguments); if(o) o.std=o.kind==='nqas'?scCpmStdOf(o.me):''; return o; };
  var oApply=scCpmApply;
  scCpmApply=function(cp,id){ var o=oApply.apply(this,arguments); if(o&&o.id){ o.std=o.kind==='nqas'?scCpmStdOf(o.me):''; } return o; };
  var oLoad=scCpmLoad;
  scCpmLoad=async function(force){
    var fresh=force||!_scCpm.loadedAt||(Date.now()-_scCpm.loadedAt)>=60000;
    var r=await oLoad.apply(this,arguments);
    if(fresh){ try{ var reg=await fbGet('shared/cp_master/registry')||{};
      _scReg={std:reg.std||{},me:{}}; Object.keys(reg.me||{}).forEach(function(k){ _scReg.me[scRegUnkey(k)]=reg.me[k]; }); }catch(e){} }
    return r;
  };
})();

// ══════════════════════════════════════════════════════════════
// CHECKS — everything worth fixing before the content is finalised
// ══════════════════════════════════════════════════════════════
var SC_CHECK_LEVEL={error:{c:'#B91C1C',b:'#FEF2F2',i:'ti-circle-x'},warn:{c:'#B45309',b:'#FFFBEB',i:'ti-alert-triangle'},info:{c:'#1D4ED8',b:'#EFF6FF',i:'ti-info-circle'},ok:{c:'#15803D',b:'#F0FDF4',i:'ti-circle-check'}};
function scCpmChecks(pkgCode){
  var pkg=pkgCode&&pkgCode!=='all'?'nqas_'+pkgCode:null;
  var all=scCpmAll({pkg:pkg}), nq=all.filter(function(c){ return c.kind==='nqas'; }), H=scCpmHierarchy(pkg), out=[];
  function add(key,level,label,detail,ids,view){ out.push({key:key,level:level,label:label,detail:detail||'',ids:ids||[],n:(ids||[]).length,view:view||'cps'}); }
  // integrity (should always be zero)
  var mis=nq.filter(function(c){ return !/^ME [A-H]\d+\.\d+$/.test(c.me)||c.aoc!==c.me.charAt(3)||c.std.charAt(0)!==c.aoc; }).map(function(c){ return c.id; });
  add('mismatch',mis.length?'error':'ok','AoC / Standard / ME do not match',mis.length?'Each ME must sit under its own Standard and AoC.':'Every checkpoint sits correctly under its ME, Standard and AoC.',mis);
  var badV=all.filter(function(c){ return c.video&&!isVideoUrl(c.video); }).map(function(c){ return c.id; });
  add('badVideo',badV.length?'error':'ok','Video links the player cannot play','Use YouTube, Vimeo, Wix (video.wixstatic.com) or a direct .mp4 link.',badV);
  var byTxt={}; all.forEach(function(c){ var k=scCpmNormT(c.t).toLowerCase(); (byTxt[k]=byTxt[k]||[]).push(c.id); });
  var dup=[]; Object.keys(byTxt).forEach(function(k){ if(byTxt[k].length>1) dup=dup.concat(byTxt[k]); });
  add('dupText',dup.length?'warn':'ok','Same wording in more than one checkpoint','Usually one is redundant, or the wording should say what differs.',dup);
  var noHi=all.filter(function(c){ return !c.hi; }).map(function(c){ return c.id; });
  add('noHindi',noHi.length?'warn':'ok','Checkpoints without Hindi text','Shown in English to staff using Hindi.',noHi);
  var stdNoT=Object.keys(H.std).filter(function(s){ return !H.std[s].title; }).sort(scStdCmp);
  add('stdNoTitle',stdNoT.length?'warn':'ok','Standards without a title',stdNoT.slice(0,12).join(', ')+(stdNoT.length>12?'…':''),stdNoT,'tree');
  var meNoT=Object.keys(H.me).filter(function(m){ return !H.me[m].title; }).sort(scMeCmp);
  add('meNoTitle',meNoT.length?'warn':'ok','MEs without a title',meNoT.length?meNoT.length+' MEs':'',meNoT,'tree');
  var meEmpty=Object.keys(H.me).filter(function(m){ return !H.me[m].cps; }).sort(scMeCmp);
  add('meEmpty',meEmpty.length?'warn':'ok','MEs with no checkpoints'+(pkgCode&&pkgCode!=='all'?' in '+pkgCode:''),meEmpty.slice(0,12).join(', ')+(meEmpty.length>12?'…':''),meEmpty,'tree');
  var gaps=[]; Object.keys(H.aoc).forEach(function(a){ var nums=H.aoc[a].std.map(function(s){ return +s.slice(1); }); if(!nums.length) return;
    var mx=Math.max.apply(null,nums), miss=[]; for(var i=1;i<=mx;i++){ if(nums.indexOf(i)<0) miss.push(a+i); }
    if(miss.length) gaps.push(miss.length>2?miss[0]+'–'+miss[miss.length-1]:miss.join(', ')); });
  add('stdGaps',gaps.length?'info':'ok','Gaps in Standard numbering',gaps.length?'Missing: '+gaps.join('; ')+'. Check against the official SC checklist — add them if they apply.':'',gaps,'tree');
  var single=Object.keys(H.me).filter(function(m){ return H.me[m].cps===1; });
  add('meSingle','info','MEs with only one checkpoint','A single Half or Zero decides the whole ME score.',single,'tree');
  var cho=nq.filter(function(c){ return c.r.length===1&&c.r[0]==='CHO'; }).length, share=nq.length?Math.round(cho/nq.length*100):0;
  add('choLoad',share>60?'warn':'ok','CHO-only checkpoints: '+share+'%',share>60?'Move suitable checkpoints to ANM, ASHA or MPW to share the daily load.':'',nq.filter(function(c){ return c.r.length===1&&c.r[0]==='CHO'; }).map(function(c){ return c.id; }));
  var noVid=all.filter(function(c){ return !c.video; }).map(function(c){ return c.id; });
  add('noVideo','info','Checkpoints without a video','Optional — add where a short demo helps.',noVid);
  return out;
}

// ══════════════════════════════════════════════════════════════
// PANEL — Checkpoints · Standards & MEs · Checks
// ══════════════════════════════════════════════════════════════
_scCpmUi.view='cps'; _scCpmUi.std=''; _scCpmUi.me=''; _scCpmUi.check=''; _scCpmUi.openAoc={};
scCpmFiltered=function(){
  var u=_scCpmUi, q=u.q.trim().toLowerCase(), chk=null;
  if(u.check){ var c=scCpmChecks(u.pkg).find(function(x){ return x.key===u.check; }); chk={}; (c?c.ids:[]).forEach(function(id){ chk[id]=1; }); }
  return scCpmAll({pkg:u.pkg==='all'?null:'nqas_'+u.pkg,includeRetired:u.kind==='retired'}).filter(function(c){
    if(chk&&!chk[c.id]) return false;
    if(u.kind==='retired'){ if(!c.retired) return false; } else if(u.kind&&!chk&&c.kind!==u.kind) return false;
    if(u.aoc&&c.aoc!==u.aoc) return false;
    if(u.std&&c.std!==u.std) return false;
    if(u.me&&c.me!==u.me) return false;
    if(u.svc&&c.svc!==u.svc&&!(typeof nfCcOf==='function'&&nfCcOf(c).indexOf(u.svc)>=0)) return false;
    if(u.role&&c.r.indexOf(u.role)<0) return false;
    if(q&&(c.id+' '+c.t+' '+(c.hi||'')+' '+c.me+' '+c.std).toLowerCase().indexOf(q)<0) return false;
    return true;
  });
};
scCpmRowHTML=function(c){
  var I=scJs(c.id), edited=!!_scCpm.edits[c.id], added=!!_scCpm.added[c.id];
  var hier=c.kind==='nqas'?'<span class="a" title="'+scEsc(SC_CPM_AOC[c.aoc]+' › '+(scRegTitle('std',c.std)||'Standard '+c.std)+' › '+(scRegTitle('me',c.me)||c.me))+'">AoC '+scEsc(c.aoc)+' › '+scEsc(c.std)+' › '+scEsc(c.me.replace(/^ME /,''))+'</span>':'<span class="m">Milestone</span>';
  return '<div class="scm-row'+(c.retired?' retired':'')+'"><input type="checkbox" '+(_scCpmUi.sel[c.id]?'checked':'')+' onchange="_scCpmUi.sel[\''+I+'\']=this.checked;scCpmRender()">'
    +'<div class="scm-id">'+scEsc(c.id)+(edited?'<i title="Edited">✎</i>':'')+(added?'<i title="Added">＋</i>':'')+'</div>'
    +'<div class="scm-main"><div class="scm-t">'+scEsc(c.t)+'</div>'+(c.hi?'<div class="scm-hi">'+scEsc(c.hi)+'</div>':'<div class="scm-hi miss">No Hindi text</div>')
    +'<div class="scm-meta">'+hier+'<span>'+scEsc(c.svc||'—')+'</span>'+c.r.map(function(r){ return '<span class="r">'+scEsc(r)+'</span>'; }).join('')
    +c.method.map(function(m){ return '<span>'+scEsc(m)+'</span>'; }).join('')+(c.video?'<span'+(isVideoUrl(c.video)?'':' class="bad"')+'><i class="ti ti-video"></i> video</span>':'')
    +'<span class="pk">'+c.pk.join(' · ')+'</span>'+(c.retired?'<span class="m">Retired</span>':'')+'</div></div>'
    +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCpmEdit(\''+I+'\')"><i class="ti ti-pencil"></i> Edit</button></div>';
};
function scCpmViewTabs(){
  var u=_scCpmUi, ch=scCpmChecks(u.pkg), nIss=ch.filter(function(c){ return c.level==='error'||c.level==='warn'; }).length;
  var t=function(k,l){ return '<button type="button" class="'+(u.view===k?'on':'')+'" onclick="_scCpmUi.view=\''+k+'\';_scCpmUi.check=\'\';scCpmRender()">'+l+'</button>'; };
  return '<div class="scm-views">'+t('cps','<i class="ti ti-list-details"></i> Checkpoints')+t('tree','<i class="ti ti-sitemap"></i> Standards &amp; MEs')
    +t('checks','<i class="ti ti-checklist"></i> Checks'+(nIss?' <b class="scm-badge">'+nIss+'</b>':''))
    +'<select onchange="_scCpmUi.pkg=this.value;_scCpmUi.limit=60;scCpmRender()" style="margin-left:auto;">'+['12B','12A','all'].map(function(p){ return '<option value="'+p+'"'+(u.pkg===p?' selected':'')+'>'+(p==='all'?'Both packages':p)+'</option>'; }).join('')+'</select></div>';
}
var _scCpmRenderCps=scCpmRender;
scCpmRender=function(){
  var p=scCpmEnsurePanel(); if(!p||_scCpmUi.tab!=='master') return;
  var u=_scCpmUi;
  if(u.view==='tree'){ p.innerHTML='<div class="scm-wrap">'+scCpmViewTabs()+scCpmTreeHTML()+'</div>'; return; }
  if(u.view==='checks'){ p.innerHTML='<div class="scm-wrap">'+scCpmViewTabs()+scCpmChecksHTML()+'</div>'; return; }
  _scCpmRenderCps();
  var wrap=p.querySelector('.scm-wrap'); if(!wrap) return;
  wrap.insertAdjacentHTML('afterbegin',scCpmViewTabs());
  // package selector now lives in the view bar; add Standard / ME filters and the active check
  var f=wrap.querySelector('.scm-filters'); if(f){
    var pkgSel=f.querySelector('select'); if(pkgSel) pkgSel.remove();
    var H=scCpmHierarchy(u.pkg==='all'?null:'nqas_'+u.pkg);
    var stds=Object.keys(H.std).filter(function(s){ return !u.aoc||s.charAt(0)===u.aoc; }).sort(scStdCmp);
    var mes=u.std?H.std[u.std]?H.std[u.std].me:[]:[];
    var sS=document.createElement('select'); sS.setAttribute('onchange',"_scCpmUi.std=this.value;_scCpmUi.me='';scCpmRender()");
    sS.innerHTML='<option value="">All Standards</option>'+stds.map(function(s){ return '<option value="'+s+'"'+(u.std===s?' selected':'')+'>'+s+(H.std[s].title?' — '+scEsc(H.std[s].title.slice(0,40)):'')+'</option>'; }).join('');
    var mS=document.createElement('select'); mS.setAttribute('onchange',"_scCpmUi.me=this.value;scCpmRender()"); mS.disabled=!u.std;
    mS.innerHTML='<option value="">'+(u.std?'All MEs in '+u.std:'ME (choose a Standard)')+'</option>'+mes.map(function(m){ return '<option value="'+scEsc(m)+'"'+(u.me===m?' selected':'')+'>'+scEsc(m)+(H.me[m].title?' — '+scEsc(H.me[m].title.slice(0,40)):'')+'</option>'; }).join('');
    var aocSel=f.querySelectorAll('select')[1]; if(aocSel){ aocSel.setAttribute('onchange',"_scCpmUi.aoc=this.value;_scCpmUi.std='';_scCpmUi.me='';scCpmRender()"); aocSel.parentNode.insertBefore(mS,aocSel.nextSibling); aocSel.parentNode.insertBefore(sS,mS); }
  }
  if(u.check){ var c=scCpmChecks(u.pkg).find(function(x){ return x.key===u.check; });
    if(c) wrap.querySelector('.scm-bar').insertAdjacentHTML('beforebegin','<div class="scm-active-check"><i class="ti ti-filter"></i> Showing: <b>'+scEsc(c.label)+'</b> ('+c.n+') <button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="_scCpmUi.check=\'\';scCpmRender()">Clear</button></div>'); }
};
function scCpmTreeHTML(){
  var u=_scCpmUi, H=scCpmHierarchy(u.pkg==='all'?null:'nqas_'+u.pkg);
  var nStd=Object.keys(H.std).length, nMe=Object.keys(H.me).length, nT=Object.keys(H.std).filter(function(s){ return H.std[s].title; }).length+Object.keys(H.me).filter(function(m){ return H.me[m].title; }).length;
  var h='<div class="scm-bar"><span><b>8</b> AoCs · <b>'+nStd+'</b> Standards · <b>'+nMe+'</b> MEs · titles '+nT+'/'+(nStd+nMe)+'</span>'
    +'<span style="display:flex;gap:6px;"><button class="scx-btn sm" onclick="scRegImport()"><i class="ti ti-clipboard-text"></i> Paste titles / add codes</button></span></div>';
  Object.keys(H.aoc).forEach(function(a){
    var A=H.aoc[a], open=!!u.openAoc[a];
    h+='<div class="scm-aoc'+(open?' open':'')+'"><button type="button" class="scm-aoc-hd" onclick="_scCpmUi.openAoc[\''+a+'\']=!_scCpmUi.openAoc[\''+a+'\'];scCpmRender()">'
      +'<b>AoC '+a+'</b> '+scEsc(A.title)+'<span>'+A.std.length+' standards · '+A.std.reduce(function(n,s){ return n+H.std[s].me.length; },0)+' MEs · '+A.cps+' checkpoints</span><i class="ti ti-chevron-down"></i></button>';
    if(open) h+='<div class="scm-aoc-b">'+A.std.map(function(s){
      var S=H.std[s];
      return '<div class="scm-std"><div class="scm-std-hd"><b>'+s+'</b><span class="'+(S.title?'':'miss')+'">'+scEsc(S.title||'No title yet')+'</span><em>'+S.me.length+' ME · '+S.cps+' cp</em>'
        +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scRegEdit(\'std\',\''+s+'\')">Title</button></div>'
        +S.me.map(function(m){ var M=H.me[m], mj=scJs(m);
          return '<div class="scm-me"><b>'+scEsc(m.replace(/^ME /,''))+'</b><span class="'+(M.title?'':'miss')+'">'+scEsc(M.title||'No title yet')+'</span>'
            +'<em class="'+(M.cps?'':'zero')+'">'+M.cps+' cp</em>'
            +'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scRegEdit(\'me\',\''+mj+'\')">Title</button>'
            +(M.cps?'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="_scCpmUi.view=\'cps\';_scCpmUi.aoc=\''+a+'\';_scCpmUi.std=\''+s+'\';_scCpmUi.me=\''+mj+'\';_scCpmUi.kind=\'nqas\';scCpmRender()">View</button>'
               :'<button class="scx-btn sm" style="flex:0 0 auto;" onclick="scCpmEdit(null,\''+mj+'\')">+ Checkpoint</button>')+'</div>';
        }).join('')+'</div>';
    }).join('')+'</div>';
    h+='</div>';
  });
  return h;
}
function scCpmChecksHTML(){
  var u=_scCpmUi, list=scCpmChecks(u.pkg), rank={error:0,warn:1,info:2,ok:3};
  list.sort(function(a,b){ return rank[a.level]-rank[b.level]; });
  var nErr=list.filter(function(c){ return c.level==='error'; }).length, nWarn=list.filter(function(c){ return c.level==='warn'; }).length;
  return '<div class="scm-check-sum '+(nErr?'error':nWarn?'warn':'ok')+'">'+(nErr?'<b>'+nErr+' must be fixed</b> before finalising · ':'')+(nWarn?nWarn+' to review':'')+(!nErr&&!nWarn?'<b>Ready to finalise</b> — no errors or warnings.':'')+'</div>'
    +list.map(function(c){ var L=SC_CHECK_LEVEL[c.level];
      var act=c.n&&c.level!=='ok'?(c.view==='tree'?'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="_scCpmUi.view=\'tree\';Object.keys(SC_CPM_AOC).forEach(function(a){_scCpmUi.openAoc[a]=true;});scCpmRender()">Open tree</button>'
        :'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="_scCpmUi.view=\'cps\';_scCpmUi.check=\''+c.key+'\';_scCpmUi.aoc=\'\';_scCpmUi.std=\'\';_scCpmUi.me=\'\';_scCpmUi.svc=\'\';_scCpmUi.role=\'\';_scCpmUi.q=\'\';scCpmRender()">Show '+c.n+'</button>'):'';
      return '<div class="scm-check" style="border-left-color:'+L.c+';background:'+L.b+';"><i class="ti '+L.i+'" style="color:'+L.c+';"></i><div style="flex:1;min-width:0;"><b>'+scEsc(c.label)+(c.n&&c.level!=='ok'&&c.view!=='tree'?' ('+c.n+')':'')+'</b>'
        +(c.detail?'<div>'+scEsc(c.detail)+'</div>':'')+'</div>'+act+'</div>';
    }).join('');
}

// ══════════════════════════════════════════════════════════════
// EDITOR — AoC → Standard → ME cascade, with checks before saving
// ══════════════════════════════════════════════════════════════
function scCpmRolesClean(r){
  r=scCpmRoles(r);
  if(r.indexOf('General')>=0) r=r.filter(function(x){ return ['CHO','ANM','ASHA','MPW'].indexOf(x)<0; }); // General already covers them
  return r;
}
scCpmEdit=async function(id,presetMe){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit the Checkpoint Master.','err'); return; }
  var c=id?scCpmGet(id):null, used=id?scCpmUsage(id):[], H=scCpmHierarchy(null);
  var me0=c?c.me:(presetMe||''), std0=c?c.std:scCpmStdOf(presetMe), aoc0=c?c.aoc:(std0?std0.charAt(0):'A');
  if(c&&c.kind==='milestone'){ aoc0=''; std0=''; me0=''; }
  var stdOpts=function(){ return Object.keys(H.std).sort(scStdCmp).map(function(s){ return {value:s,label:s+(H.std[s].title?' — '+H.std[s].title:'')}; }); };
  var meOpts=function(){ return Object.keys(H.me).sort(scMeCmp).map(function(m){ return {value:m,label:m+(H.me[m].title?' — '+H.me[m].title:'')+' ('+H.me[m].cps+' cp)'}; }); };
  var v=await scDialog({title:c?'Edit checkpoint '+id:'New checkpoint',icon:'📋',wide:true,okLabel:c?'Save — applies to every day':'Add to master',
    message:c?('Used on '+(used.length?used.map(function(x){ return x.pkg+' Day '+x.day; }).join(', '):'no day yet')+'. Changes apply everywhere it is used.'):'Choose where it sits in the NQAS checklist, then write the checkpoint.',
    fields:[
      {key:'aoc',label:'Area of Concern',type:'select',value:aoc0,options:[{value:'',label:'— Programme milestone (not an NQAS checkpoint) —'}].concat(Object.keys(SC_CPM_AOC).map(function(a){ return {value:a,label:a+' · '+SC_CPM_AOC[a]}; }))},
      {key:'std',label:'Standard',type:'select',value:std0,options:[{value:'',label:'— choose —'}].concat(stdOpts(),[{value:'__new',label:'+ New Standard…'}])},
      {key:'stdNew',label:'New Standard code',value:'',placeholder:'e.g. A3'},
      {key:'me',label:'Measurable Element',type:'select',value:me0,options:[{value:'',label:'— choose —'}].concat(meOpts(),[{value:'__new',label:'+ New ME under this Standard…'}])},
      {key:'meNew',label:'New ME code',value:'',placeholder:'e.g. ME A3.1'},
      {key:'t',label:'Checkpoint (English)',type:'textarea',required:true,value:c?c.t:''},
      {key:'hi',label:'Checkpoint (Hindi)',type:'textarea',value:c?c.hi||'':''},
      {key:'svc',label:'Service / area',type:'select',value:c?c.svc:'',options:[{value:'',label:'—'}].concat(scCpmServices().map(function(s){ return {value:s,label:s+' · '+SC_SVC_GROUP_LABEL[scSvcGroup(s)]}; }))},
      {key:'r',label:'Who scores it',type:'checklist',value:c?c.r:['CHO'],options:SC_KNOWN_ROLES.map(function(r){ return {value:r,label:r==='General'?'General (CHO, ANM, ASHA, MPW)':r}; })},
      {key:'method',label:'Assessment methods',type:'checklist',value:c?c.method:['SI','RR'],options:[{value:'SI',label:'SI — Staff Interview'},{value:'RR',label:'RR — Record Review'},{value:'OB',label:'OB — Observation'},{value:'CI',label:'CI — Client Interview'}]},
      {key:'video',label:'Video link (optional)',value:c?c.video||'':'',placeholder:'YouTube, Vimeo, Wix or .mp4 link'},
      {key:'pk',label:'Packages',type:'checklist',value:c?c.pk:['12A','12B'],options:[{value:'12A',label:'12A'},{value:'12B',label:'12B'}]},
      {key:'retired',label:'Status',type:'checklist',value:c&&c.retired?['retired']:[],options:[{value:'retired',label:'Retired — no longer used in readiness or new day plans'}]}
    ],
    onRender:function(inp){ scCpmCascade(inp,H,stdOpts,meOpts); },
    validate:function(v){ return scCpmValidate(v,c,H); }});
  if(!v) return;
  var R=scCpmResolve(v), vals={t:v.t,hi:(v.hi||'').trim(),me:R.me,aoc:R.aoc,kind:R.kind,svc:v.svc,r:scCpmRolesClean(v.r),method:v.method,video:(v.video||'').trim(),pk:v.pk,retired:v.retired.indexOf('retired')>=0};
  // Confirmations — things that are allowed but should be deliberate
  var notes=[];
  if(c&&c.kind==='nqas'&&R.kind==='nqas'&&c.me!==R.me) notes.push('Moves '+id+' from '+c.me+' (Standard '+c.std+') to '+R.me+' (Standard '+R.std+'). Its ID stays '+id+'.');
  if(c&&c.kind!==R.kind) notes.push(R.kind==='milestone'?'Turns this NQAS checkpoint into a programme milestone — it will stop counting in readiness.':'Turns this milestone into an NQAS checkpoint under '+R.me+' — it will count in readiness.');
  var same=scCpmAll({}).filter(function(x){ return x.id!==id&&scCpmNormT(x.t).toLowerCase()===scCpmNormT(v.t).toLowerCase(); });
  if(same.length) notes.push('The same wording is already used by '+same.map(function(x){ return x.id+' ('+(x.me||'milestone')+')'; }).join(', ')+'.');
  if(vals.retired&&!(c&&c.retired)&&R.kind==='nqas'){
    vals.pk.forEach(function(p){ var others=scCpmAll({pkg:'nqas_'+p}).filter(function(x){ return x.me===R.me&&x.id!==id; }); if(!others.length) notes.push('This is the last active checkpoint of '+R.me+' in '+p+' — the ME would no longer be assessed.'); });
  }
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
function scCpmResolve(v){
  if(!v.aoc) return {kind:'milestone',aoc:'',std:'',me:''};
  var std=v.std==='__new'?scCpmNormStd(v.stdNew):v.std, me=v.me==='__new'?scCpmNormMe(v.meNew):v.me;
  return {kind:'nqas',aoc:v.aoc,std:std,me:me,newStd:v.std==='__new',newMe:v.me==='__new'};
}
function scCpmValidate(v,c,H){
  var R=scCpmResolve(v);
  if(R.kind==='nqas'){
    if(v.std==='__new'&&!R.std) return 'Write the new Standard like "A3" (AoC letter + number).';
    if(!R.std) return 'Choose the Standard.';
    if(R.std.charAt(0)!==R.aoc) return 'Standard '+R.std+' belongs to AoC '+R.std.charAt(0)+', not AoC '+R.aoc+'.';
    if(v.std==='__new'&&H.std[R.std]) return 'Standard '+R.std+' already exists — choose it from the list.';
    if(v.me==='__new'&&!/^ME [A-H]\d+\.\d+$/.test(R.me)) return 'Write the new ME like "ME '+R.std+'.1".';
    if(!R.me) return 'Choose the Measurable Element.';
    if(scCpmStdOf(R.me)!==R.std) return R.me+' belongs to Standard '+(scCpmStdOf(R.me)||'?')+', not '+R.std+'.';
    if(v.me==='__new'&&H.me[R.me]) return R.me+' already exists — choose it from the list.';
  }
  if(!scCpmNormT(v.t)) return 'Write the checkpoint.';
  if(scCpmNormT(v.t).length<8) return 'The checkpoint is too short to assess — describe what is checked.';
  var dup=scCpmAll({includeRetired:true}).find(function(x){ return (!c||x.id!==c.id)&&x.me===R.me&&scCpmNormT(x.t).toLowerCase()===scCpmNormT(v.t).toLowerCase(); });
  if(dup) return 'This checkpoint already exists as '+dup.id+(dup.retired?' (retired — edit that one instead)':'')+'.';
  if(!v.r.length) return 'Choose who scores it.';
  if(!v.method.length) return 'Choose at least one assessment method.';
  if(v.video&&!isVideoUrl(v.video)) return 'This video link cannot be played. Use YouTube, Vimeo, Wix (video.wixstatic.com) or a direct .mp4 link.';
  if(!v.pk.length) return 'Choose at least one package.';
  return null;
}
// Keep the dropdowns consistent while editing
function scCpmCascade(inp,H,stdOpts,meOpts){
  var A=inp.aoc.el, S=inp.std.el, SN=inp.stdNew.el, M=inp.me.el, MN=inp.meNew.el;
  var show=function(el,on){ el.parentNode.style.display=on?'':'none'; };
  var fill=function(sel,opts,keep,firstLbl,newLbl){
    var cur=keep?sel.value:''; sel.innerHTML='';
    [{value:'',label:firstLbl}].concat(opts,[{value:'__new',label:newLbl}]).forEach(function(o){ var op=document.createElement('option'); op.value=o.value; op.textContent=o.label; sel.appendChild(op); });
    sel.value=opts.some(function(o){ return o.value===cur; })||cur==='__new'?cur:'';
  };
  function sync(changed){
    var aoc=A.value, nq=!!aoc;
    show(S,nq); show(M,nq);
    if(changed==='aoc'||!changed) fill(S,stdOpts().filter(function(o){ return o.value.charAt(0)===aoc; }),true,'— choose a Standard in AoC '+aoc+' —','+ New Standard in AoC '+aoc+'…');
    var std=S.value==='__new'?scCpmNormStd(SN.value):S.value;
    show(SN,nq&&S.value==='__new');
    if(changed!=='me') fill(M,meOpts().filter(function(o){ return std&&scCpmStdOf(o.value)===std; }),true,std?'— choose an ME in Standard '+std+' —':'— choose a Standard first —','+ New ME under '+(std||'this Standard')+'…');
    show(MN,nq&&M.value==='__new');
    if(M.value==='__new'&&!MN.value&&std) MN.value='ME '+std+'.';
  }
  A.addEventListener('change',function(){ sync('aoc'); });
  S.addEventListener('change',function(){ sync('std'); });
  SN.addEventListener('input',function(){ sync('stdNew'); });
  M.addEventListener('change',function(){ sync('me'); });
  sync();
}
// Standard (and its title) in the CSV
scCpmCsv=function(){
  var rows=[['ID','Kind','Packages','AoC','AoC title','Standard','Standard title','ME','ME title','Service','Group','Roles','Methods','Checkpoint','Hindi','Video','Retired','Used on']];
  scCpmAll({includeRetired:true}).forEach(function(c){
    rows.push([c.id,c.kind,c.pk.join(' '),c.aoc,c.aoc?SC_CPM_AOC[c.aoc]:'',c.std,scRegTitle('std',c.std),c.me,scRegTitle('me',c.me),c.svc,SC_SVC_GROUP_LABEL[scSvcGroup(c.svc)],
      c.r.join(' '),c.method.join(' '),c.t,c.hi||'',c.video||'',c.retired?'yes':'',scCpmUsage(c.id).map(function(x){ return x.pkg+' D'+x.day; }).join(' ')]);
  });
  return rows.map(function(r){ return r.map(function(v){ v=String(v==null?'':v); return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v; }).join(','); }).join('\n');
};
