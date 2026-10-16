
SC_CPM_FIELDS.push('cc','videoHi');
// Cross-cutting areas: HealSol's own list (shared/sc_cc_areas); starts with the real NQAS areas, never the old programme-day names
var NF_CC_DEFAULT=['Patient Rights','Infrastructure','Human Resources','Drugs & Equipment','General Clinical Processes','Hand Hygiene','Sterilisation','BMW & Housekeeping','Records & MIS','Patient Safety','QI System','Outcomes'];
var _nfCcList=null;
function nfCcAreas(){ return (_nfCcList&&_nfCcList.length?_nfCcList:NF_CC_DEFAULT).slice(); }
async function nfCcLoad(){ try{ var v=await fbGet('shared/sc_cc_areas'); var L=Array.isArray(v)?v:(v&&typeof v==='object'?Object.keys(v).map(function(k){ return v[k]; }):null); if(L) _nfCcList=L.filter(function(x){ return typeof x==='string'&&x.trim(); }); }catch(e){} return nfCcAreas(); }
async function nfCcSave(list){ var L=[]; list.forEach(function(x){ x=String(x||'').trim(); if(x&&L.indexOf(x)<0&&SC_SVC_GROUPS.programme.indexOf(x)<0) L.push(x); });
  var ok=await fbSet('shared/sc_cc_areas',L); if(ok) _nfCcList=L; return ok; }
function nfIsPkg(s){ return SC_SVC_GROUPS.service.indexOf(s)>=0; }
// a checkpoint's areas: its own list, else (older records) the single "Service / area" when that was a cross-cutting area
function nfCcOf(c){ if(!c) return []; var L=Array.isArray(c.cc)?c.cc.filter(Boolean):[]; if(!L.length&&c.svc&&!nfIsPkg(c.svc)&&SC_SVC_GROUPS.programme.indexOf(c.svc)<0) L=[c.svc]; return L; }
// master values onto day cards: cross-cutting areas and the Hindi video travel too
(function(){ var oA=scCpmApply; scCpmApply=function(cp,id){ var r=oA.apply(this,arguments), m=scCpmGet(id); if(m&&r!==cp){ r.cc=Array.isArray(m.cc)?m.cc.slice():(cp.cc||null); r.videoHi=m.videoHi||cp.videoHi||''; } return r; }; })();
// ── checkpoint dialog: Service package (one) + Cross-cutting areas (tick any) + "+ add new" · Video (English) + Video (Hindi) ──
var _nfCcEdit={id:null}, _nfCcPending=null;
(function(){
  var oEdit=scCpmEdit;
  scCpmEdit=async function(id){ _nfCcEdit.id=id||null; await nfCcLoad(); return oEdit.apply(this,arguments); };
  var oDlg=scDialog;
  scDialog=function(o){
    var F=(o&&o.fields)||[], i=F.findIndex(function(f){ return f&&f.key==='svc'&&f.label==='Service / area'; });
    if(i<0) return oDlg.apply(this,arguments);
    _nfCcPending=null;
    var c=_nfCcEdit.id?scCpmGet(_nfCcEdit.id):null, cur=F[i].value||'', mine=nfCcOf(c||{svc:cur});
    var areas=nfCcAreas(); mine.forEach(function(a){ if(areas.indexOf(a)<0) areas.push(a); });
    var pk=SC_SVC_GROUPS.service.slice(), fields=F.slice();
    fields.splice(i,1,
      {key:'svcPkg',label:'Service package',type:'select',value:nfIsPkg(cur)?cur:'',options:[{value:'',label:'— none —'}].concat(pk.map(function(s){ return {value:s,label:s}; }))},
      {key:'svcAreas',label:'Cross-cutting areas (tick all that apply)',type:'checklist',value:mine,options:areas.map(function(s){ return {value:s,label:s}; })},
      {key:'svcAreaNew',label:'+ Add a new cross-cutting area (optional)',value:'',placeholder:'e.g. Community Engagement — it is added to the list for every checkpoint'});
    var vi=fields.findIndex(function(f){ return f&&f.key==='video'; });
    if(vi>=0){ fields[vi]=Object.assign({},fields[vi],{label:'Video link — English (optional)'}); fields.splice(vi+1,0,{key:'videoHi',label:'Video link — Hindi (optional)',value:c?c.videoHi||'':'',placeholder:'Shown when the app is in Hindi'}); }
    var o2=Object.assign({},o,{fields:fields}), oVal=o.validate;
    o2.validate=function(v){
      if(v.videoHi&&!(typeof isVideoUrl==='function'?isVideoUrl(v.videoHi):/^https:\/\//.test(v.videoHi))) return 'The Hindi video link cannot be played. Use YouTube, Vimeo, Wix (video.wixstatic.com) or a direct .mp4 link.';
      var nw=String(v.svcAreaNew||'').trim(); if(nw&&(nfIsPkg(nw)||SC_SVC_GROUPS.programme.indexOf(nw)>=0)) return '"'+nw+'" is a service package or programme day, not a cross-cutting area.';
      var A=(v.svcAreas||[]).slice(); if(nw) A.push(nw);
      return oVal?oVal(Object.assign({},v,{svc:v.svcPkg||A[0]||''})):null; };
    return oDlg.call(this,o2).then(async function(v){
      if(!v) return v;
      var A=(v.svcAreas||[]).slice(), nw=String(v.svcAreaNew||'').trim();
      if(nw){ nw.split(',').map(function(x){ return x.trim(); }).filter(Boolean).forEach(function(x){ if(A.indexOf(x)<0) A.push(x); });
        var L=nfCcAreas(); A.forEach(function(x){ if(L.indexOf(x)<0) L.push(x); }); await nfCcSave(L); }
      v.svc=v.svcPkg||A[0]||'';
      _nfCcPending={id:_nfCcEdit.id,cc:A,videoHi:String(v.videoHi||'').trim(),at:Date.now()};
      delete v.svcPkg; delete v.svcAreas; delete v.svcAreaNew; delete v.videoHi;
      return v; });
  };
  var oSave=scCpmSave;
  scCpmSave=async function(id,vals){
    var p=_nfCcPending; if(p&&Date.now()-p.at<180000&&(p.id===id||p.id==null)){ _nfCcPending=null; vals=Object.assign({},vals,{cc:p.cc,videoHi:p.videoHi}); }
    return oSave.call(this,id,vals); };
  var oAdd=scCpmAdd;
  scCpmAdd=async function(vals){ var id=await oAdd.apply(this,arguments); if(id&&_nfCcPending&&_nfCcPending.id==null) await scCpmSave(id,{}); return id; };
})();
// ── Card Editor list: area chips, filter by area, manage the list ──
(function(){
  var oRow=scCpmRowHTML;
  scCpmRowHTML=function(c){ var h=oRow.apply(this,arguments), L=nfCcOf(c).filter(function(a){ return a!==c.svc; });
    if(c.videoHi) L=L; var chips=L.map(function(a){ return '<span class="cc">'+scEsc(a)+'</span>'; }).join('')+(c.videoHi?'<span><i class="ti ti-video"></i> हिंदी</span>':'');
    return chips?h.replace('<span class="pk">',chips+'<span class="pk">'):h; };
  var oR=scCpmRender;
  scCpmRender=function(){ var r=oR.apply(this,arguments);
    try{ var b=document.querySelector('#scm-panel .rd-svcsel:nth-of-type(2)'), sels=[].slice.call(document.querySelectorAll('#scm-panel .rd-svcsel'));
      var cc=sels.find(function(s){ return s.options[0]&&/cross-cutting/i.test(s.options[0].text); });
      if(cc){ var u=_scCpmUi; cc.innerHTML='<option value="">All cross-cutting areas</option>'+nfCcAreas().map(function(n){ return '<option value="'+scEsc(n)+'"'+(u.svc===n?' selected':'')+'>'+scEsc(n)+'</option>'; }).join('');
        if(!document.getElementById('nf-cc-manage')){ var btn=document.createElement('button'); btn.id='nf-cc-manage'; btn.type='button'; btn.className='scx-btn sm ghost'; btn.textContent='Areas…'; btn.title='Cross-cutting areas list'; btn.onclick=nfCcManage; cc.parentNode.insertBefore(btn,cc.nextSibling); } } }catch(e){}
    return r; };
})();
async function nfCcManage(){
  if(!scCpmCanEdit()) return; var L=await nfCcLoad();
  var v=await scDialog({title:'Cross-cutting areas',icon:'🏷️',wide:true,okLabel:'Save list',
    message:'One area per line. These are the areas you can tick for any checkpoint. Removing an area here does not untick it on checkpoints that already have it — edit those checkpoints to move them.',
    fields:[{key:'list',label:'Areas',type:'textarea',rows:14,value:L.join('\n')}]});
  if(!v) return; var ok=await nfCcSave(String(v.list||'').split('\n'));
  showToast(ok?'Cross-cutting areas saved.':'Could not save — check connection.',ok?'ok':'err'); if(ok) scCpmRender();
}
(function(){ if(typeof nfAdminApply==='function'){ var o=nfAdminApply; nfAdminApply=function(){ try{ if(appMode==='sc-admin'&&!_nfCcList) nfCcLoad(); }catch(e){} return o.apply(this,arguments); }; } })();
// ── checks: Hindi video missing ──
(function(){ if(typeof scCpmChecks!=='function') return; var oC=scCpmChecks;
  scCpmChecks=function(pkgCode){ var out=oC.apply(this,arguments), pkg=pkgCode&&pkgCode!=='all'?'nqas_'+pkgCode:null;
    var ids=scCpmAll({pkg:pkg}).filter(function(c){ return c.video&&!c.videoHi; }).map(function(c){ return c.id; });
    out.push({key:'noHindiVideo',level:ids.length?'info':'ok',label:'Video without a Hindi version',detail:'Staff using Hindi see the English video with a note until a Hindi link is added.',ids:ids,n:ids.length,view:'cps'});
    return out; }; })();
// ── staff: play the video in the app's language ──
function nfVidFor(cp){ if(!cp) return null; var hi=typeof _appLang!=='undefined'&&_appLang==='hi';
  if(hi&&cp.videoHi) return {url:cp.videoHi}; if(cp.video) return {url:cp.video,note:hi}; if(cp.videoHi) return {url:cp.videoHi}; return null; }
scPlayCpVideo=function(di,ci){ var d=getDay(di), cp=d&&d.cps?d.cps[ci]:null, v=nfVidFor(cp); if(!v) return;
  if(v.note){ var n=document.createElement('div'); n.className='nf-vidnote'; n.textContent='हिंदी वीडियो जल्द आएगा — अभी अंग्रेज़ी वीडियो'; document.body.appendChild(n); setTimeout(function(){ n.remove(); },3500); }
  showVideoPopup(v.url); };
