
// Firebase: shared/cp_master/links = {edits:{'L-012':{s,both,why,whyHi,a,ak,b,bk,removed}}, added:{'N-…':{a,ak,b,bk,s,both,why,whyHi,removed}}, updatedAt, updatedBy, lastImport}
// NF_LINKS (used by the contradiction notes) is rebuilt from the built-in draft + these edits whenever the checkpoint master loads.
var NF_LINKS_BASE=NF_LINKS.map(function(l,i){ var x=l.slice(); x.lid='L-'+('00'+(i+1)).slice(-3); return x; });
var _nfLxAll=[], _nfLxUi={cp:null,q:'',s:'',st:'active',limit:80};
function nfLxData(){ var L=_scCpm.links; return (L&&typeof L==='object')?L:{}; }
function nfLxRebuild(){
  var D=nfLxData(), E=D.edits||{}, A=D.added||{}, all=[];
  NF_LINKS_BASE.forEach(function(l){ var e=E[l.lid], x=l.slice(); x.lid=l.lid;
    if(e){ if(e.a){ x[0]=e.a; x[1]=+e.ak||0; } if(e.b){ x[2]=e.b; x[3]=+e.bk||0; } if(e.s) x[4]=e.s==='S'?'S':'C'; if(e.both!=null) x[5]=e.both?1:0;
      if(e.why!=null) x[6]=e.why; if(e.whyHi!=null) x[7]=e.whyHi; x.edited=Object.keys(e).some(function(k){ return k!=='removed'&&k!=='at'; }); x.removed=!!e.removed; }
    all.push(x); });
  Object.keys(A).sort().forEach(function(k){ var a=A[k]; if(!a||!a.a||!a.b) return;
    var x=[a.a,+a.ak||0,a.b,+a.bk||0,a.s==='S'?'S':'C',a.both?1:0,a.why||'',a.whyHi||'']; x.lid=k; x.added=true; x.removed=!!a.removed; all.push(x); });
  _nfLxAll=all; NF_LINKS=all.filter(function(x){ return !x.removed; }); _nfLkByCp=null;
}
function nfLxGet(lid){ return _nfLxAll.find(function(x){ return x.lid===lid; })||null; }
function nfLxBase(lid){ return NF_LINKS_BASE.find(function(x){ return x.lid===lid; })||null; }
// load: the checkpoint master already fetches shared/cp_master — keep its links part too
(function(){ var oL=scCpmLoad;
  scCpmLoad=async function(force){ var fresh=force||!_scCpm.loadedAt||(Date.now()-_scCpm.loadedAt)>=60000;
    if(!_scCpm.links){ try{ var c=JSON.parse(localStorage.getItem('sc_cpm_links_v1')||'null'); if(c) _scCpm.links=c; }catch(e){} }
    var r=await oL.apply(this,arguments);
    if(fresh){ try{ var v=await fbGet('shared/cp_master/links'); _scCpm.links=v||{}; try{ localStorage.setItem('sc_cpm_links_v1',JSON.stringify(_scCpm.links)); }catch(e){} }catch(e){} }
    nfLxRebuild(); return r; }; })();
nfLxRebuild();
// ── helpers: MoV text, baseline day ──
function nfLxItem(id,k){ var c=scCpmGet(id); if(!c) return null; var n=(c.items||[]).length; k=+k||0;
  if(k<0||k>n||k!==Math.floor(k)) return null; return {c:c,k:k,t:k?(c.items[k-1].t||''):c.t+(n?' (whole checkpoint)':''),retired:!!c.retired}; }
function nfLxDay(id){ var P=(nfCpPos('nqas_12B')[id]||[]).filter(function(p){ return p.di<7; })[0]||(nfCpPos('nqas_12A')[id]||[]).filter(function(p){ return p.di<7; })[0]; return P?P.di+1:''; }
function nfLxEnd(id,k){ var it=nfLxItem(id,k), d=nfLxDay(id);
  return '<span class="k">'+scEsc(id)+(k?' / MoV '+k:'')+(d?' · Day '+d:'')+'</span> '+(it?scEsc(it.t.length>130?it.t.slice(0,127)+'…':it.t):'<i style="color:#B91C1C">missing item</i>'); }
function nfLxBroken(x){ var a=nfLxItem(x[0],x[1]), b=nfLxItem(x[2],x[3]); return !a||!b||a.retired||b.retired; }
function nfLxCount(id){ return (nfLkByCp()[id]||[]).length; }
// ── save one link ──
async function nfLxPersist(obj){ obj.updatedAt=scNowIso(); obj.updatedBy='HealSol Admin';
  var ok=await fbSet('shared/cp_master/links',scClean(obj)); if(ok){ _scCpm.links=obj; try{ localStorage.setItem('sc_cpm_links_v1',JSON.stringify(obj)); }catch(e){} nfLxRebuild(); } return ok; }
function nfLxClone(){ return JSON.parse(JSON.stringify(nfLxData())); }
// patch fields: a,ak,b,bk,s,both,why,whyHi,removed → into the edits/added object (only what differs from the draft)
function nfLxApply(D,lid,p){
  if(/^N-/.test(lid)){ D.added=D.added||{}; D.added[lid]=Object.assign({},D.added[lid]||{},p); if(!p.removed) delete D.added[lid].removed; return; }
  var b=nfLxBase(lid); if(!b) return; D.edits=D.edits||{}; var e=Object.assign({},D.edits[lid]||{},p), out={};
  if(e.a&&(e.a!==b[0]||(+e.ak||0)!==(+b[1]||0))){ out.a=e.a; out.ak=+e.ak||0; }
  if(e.b&&(e.b!==b[2]||(+e.bk||0)!==(+b[3]||0))){ out.b=e.b; out.bk=+e.bk||0; }
  if(e.s&&e.s!==b[4]) out.s=e.s; if(e.both!=null&&(e.both?1:0)!==(b[5]?1:0)) out.both=e.both?1:0;
  if(e.why!=null&&e.why!==b[6]) out.why=e.why; if(e.whyHi!=null&&e.whyHi!==b[7]) out.whyHi=e.whyHi; if(e.removed) out.removed=true;
  if(Object.keys(out).length) D.edits[lid]=out; else delete D.edits[lid];
}
function nfLxDup(a,ak,b,bk,except){ return NF_LINKS.some(function(x){ return x.lid!==except&&x[0]===a&&(+x[1]||0)===ak&&x[2]===b&&(+x[3]||0)===bk; }); }
function nfLxCheckEnds(v,except){
  var a=String(v.a||'').trim().toUpperCase(), b=String(v.b||'').trim().toUpperCase(), ak=+v.ak||0, bk=+v.bk||0;
  if(!nfLxItem(a,ak)) return {err:'IF: '+(scCpmGet(a)?'MoV '+ak+' does not exist in '+a:'checkpoint "'+a+'" not found')+'.'};
  if(!nfLxItem(b,bk)) return {err:'THEN: '+(scCpmGet(b)?'MoV '+bk+' does not exist in '+b:'checkpoint "'+b+'" not found')+'.'};
  if(a===b&&ak===bk) return {err:'IF and THEN are the same item.'};
  if(nfLxDup(a,ak,b,bk,except)) return {err:'This link already exists.'};
  return {a:a,ak:ak,b:b,bk:bk};
}
// ── edit / add dialog (MoV text shows as you type) ──
async function nfLxEdit(lid,preCp){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit linked checks.','err'); return; }
  var x=lid?nfLxGet(lid):null;
  var v=await scDialog({title:x?'Edit linked check '+lid:'Add a linked check',icon:'🔗',wide:true,okLabel:x?'Save':'Add link',
    message:'IF the first item is marked Met, THEN the second should also be Met. MoV number 0 = the whole checkpoint.',
    fields:[{key:'a',label:'IF: checkpoint ID',value:x?x[0]:(preCp||''),placeholder:'e.g. A-049'},{key:'ak',label:'IF: MoV number',type:'number',min:0,value:x?(+x[1]||0):1},
      {key:'pa',type:'info',value:''},
      {key:'b',label:'THEN: checkpoint ID',value:x?x[2]:'',placeholder:'e.g. C-003'},{key:'bk',label:'THEN: MoV number',type:'number',min:0,value:x?(+x[3]||0):1},
      {key:'pb',type:'info',value:''},
      {key:'s',label:'Strength',type:'select',value:x?x[4]:'C',options:[{value:'S',label:'Strong — the first cannot honestly be Met without the second'},{value:'C',label:'Check — usually needed; worth a re-check'}]},
      {key:'both',label:'Also warn the other way',type:'checklist',value:x&&x[5]?['1']:[],options:[{value:'1',label:'Yes — second Met but first Not met is also worth a note'}]},
      {key:'why',label:'Why (English) — shown to staff',type:'textarea',rows:2,value:x?x[6]:''},
      {key:'whyHi',label:'Why (Hindi)',type:'textarea',rows:2,value:x?x[7]:''}],
    onRender:function(I){ function upd(s){ var id=String(I[s].el.value||'').trim().toUpperCase(), it=nfLxItem(id,I[s+'k'].el.value), el=I['p'+s].el;
        el.className='nflx-prev'+(it?'':' bad'); el.textContent=it?it.t+(nfLxDay(id)?'  · Day '+nfLxDay(id):'')+(it.retired?'  (retired)':''):(id?(scCpmGet(id)?'No such MoV in '+id:'Checkpoint not found'):'Type a checkpoint ID'); }
      ['a','b'].forEach(function(s){ upd(s); [I[s].el,I[s+'k'].el].forEach(function(e){ e.addEventListener('input',function(){ upd(s); }); }); }); },
    validate:function(v){ var r=nfLxCheckEnds(v,lid); if(r.err) return r.err; if(!String(v.why||'').trim()) return 'Write why (English) — staff see it with the note.'; return null; }});
  if(!v) return; var r=nfLxCheckEnds(v,lid), D=nfLxClone(), id=lid||('N-'+Date.now().toString(36));
  nfLxApply(D,id,{a:r.a,ak:r.ak,b:r.b,bk:r.bk,s:v.s==='S'?'S':'C',both:v.both.length?1:0,why:String(v.why).trim(),whyHi:String(v.whyHi||'').trim(),at:scNowIso()});
  if(/^N-/.test(id)) D.added[id].at=D.added[id].at||scNowIso(); else if(D.edits&&D.edits[id]) delete D.edits[id].at;
  var ok=await nfLxPersist(D); showToast(ok?(lid?'Linked check '+lid+' saved.':'Linked check added.'):'Could not save — check connection.',ok?'ok':'err'); if(ok) nfLxRefresh();
}
async function nfLxRemove(lid,restore){
  if(!scCpmCanEdit()) return; var D=nfLxClone();
  if(/^N-/.test(lid)){ D.added=D.added||{}; if(D.added[lid]){ if(restore) delete D.added[lid].removed; else D.added[lid].removed=true; } }
  else { D.edits=D.edits||{}; var e=Object.assign({},D.edits[lid]||{}); if(restore) delete e.removed; else e.removed=true; if(Object.keys(e).length) D.edits[lid]=e; else delete D.edits[lid]; }
  var ok=await nfLxPersist(D); showToast(ok?(restore?lid+' restored.':lid+' removed — it no longer flags. You can restore it from "Removed".'):'Could not save — check connection.',ok?'ok':'err'); if(ok) nfLxRefresh();
}
// ── panel: one checkpoint's links, or all links ──
function nfLxShown(){ var u=_nfLxUi, q=u.q.trim().toLowerCase();
  return _nfLxAll.filter(function(x){
    if(u.cp&&x[0]!==u.cp&&x[2]!==u.cp) return false;
    if(u.st==='active'&&x.removed) return false; if(u.st==='removed'&&!x.removed) return false; if(u.st==='edited'&&!(x.edited||x.added)) return false; if(u.st==='broken'&&(x.removed||!nfLxBroken(x))) return false;
    if(u.s&&x[4]!==u.s) return false;
    if(q){ var a=nfLxItem(x[0],x[1]), b=nfLxItem(x[2],x[3]); if((x.lid+' '+x[0]+' '+x[2]+' '+x[6]+' '+(a?a.t:'')+' '+(b?b.t:'')).toLowerCase().indexOf(q)<0) return false; }
    return true; }); }
function nfLxRowHTML(x){ var L=scJs(x.lid);
  return '<div class="nflx-row'+(x.removed?' rm':'')+'" data-lid="'+scEsc(x.lid)+'"><div class="nflx-hd"><b>'+scEsc(x.lid)+'</b><span class="nflx-chip'+(x[4]==='S'?' s':'')+'">'+(x[4]==='S'?'Strong':'Check')+'</span>'
    +(x[5]?'<span class="nflx-chip g">↔ both ways</span>':'')+(x.added?'<span class="nflx-chip n">Added</span>':'')+(x.edited?'<span class="nflx-chip n">Edited</span>':'')+(x.removed?'<span class="nflx-chip x">Removed</span>':'')
    +(!x.removed&&nfLxBroken(x)?'<span class="nflx-chip s">Check the items</span>':'')
    +'<span class="nflx-btns">'+(x.removed?'<button class="scx-btn sm ghost" onclick="nfLxRemove(\''+L+'\',true)">Restore</button>':'<button class="scx-btn sm ghost" onclick="nfLxEdit(\''+L+'\')">Edit</button><button class="scx-btn sm ghost" onclick="nfLxRemove(\''+L+'\')">Remove</button>')+'</span></div>'
    +'<div class="nflx-txt">IF '+nfLxEnd(x[0],x[1])+' <b>is Met</b> →<br>THEN '+nfLxEnd(x[2],x[3])+' <b>should be Met</b></div>'
    +'<div class="nflx-why">'+scEsc(x[6])+(x[7]?' · '+scEsc(x[7]):'')+'</div></div>'; }
function nfLxOpen(cp){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit linked checks.','err'); return; }
  _nfLxUi.cp=cp||null; _nfLxUi.limit=80; if(cp) _nfLxUi.q='';
  var old=document.getElementById('nflx-ov'); if(old) old.remove();
  var ov=document.createElement('div'); ov.className='scx-ov nflx-ov'; ov.id='nflx-ov';
  ov.innerHTML='<div class="scx-box wide"><div class="scx-hd"><div class="scx-hd-icon">🔗</div><div class="scx-hd-title" id="nflx-title"></div></div>'
    +'<div class="nflx-tools">'+(cp?'':'<input class="scx-in" id="nflx-q" placeholder="Search ID or text" oninput="_nfLxUi.q=this.value;_nfLxUi.limit=80;clearTimeout(window._nflxT);window._nflxT=setTimeout(nfLxRender,200)">')
    +'<select class="scx-in" onchange="_nfLxUi.s=this.value;nfLxRender()"><option value="">Strong + Check</option><option value="S">Strong</option><option value="C">Check</option></select>'
    +'<select class="scx-in" id="nflx-st" onchange="_nfLxUi.st=this.value;_nfLxUi.limit=80;nfLxRender()"><option value="active">Active</option><option value="edited">Edited / added</option><option value="broken">Items to check</option><option value="removed">Removed</option><option value="">All</option></select></div>'
    +'<div class="nflx-tools"><button class="scx-btn sm" onclick="nfLxEdit(null,_nfLxUi.cp)">＋ Add link</button>'+(cp?'<button class="scx-btn sm ghost" onclick="nfLxOpen(null)">All linked checks</button>':'<button class="scx-btn sm ghost" onclick="nfLxImportPick()">📥 Import review</button><button class="scx-btn sm ghost" onclick="nfLxExport()"><i class="ti ti-download"></i> Download Excel</button>')
    +'<button class="scx-btn sm ghost" style="margin-left:auto" onclick="nfLxClose()">Close</button></div>'
    +'<div class="nflx-sum" id="nflx-sum"></div><div class="nflx-list" id="nflx-list"></div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) nfLxClose(); });
  document.body.appendChild(ov); var st=document.getElementById('nflx-st'); if(st) st.value=_nfLxUi.st; var q=document.getElementById('nflx-q'); if(q) q.value=_nfLxUi.q; nfLxRender();
}
function nfLxClose(){ var o=document.getElementById('nflx-ov'); if(o) o.remove(); try{ scCpmRender(); }catch(e){} }
function nfLxRefresh(){ if(document.getElementById('nflx-ov')) nfLxRender(); else try{ scCpmRender(); }catch(e){} }
function nfLxRender(){
  var u=_nfLxUi, L=nfLxShown(), c=u.cp?scCpmGet(u.cp):null, act=NF_LINKS.length, rm=_nfLxAll.length-act;
  var T=document.getElementById('nflx-title'); if(T) T.textContent=u.cp?'Linked checks — '+u.cp:'Linked checks';
  var S=document.getElementById('nflx-sum'); if(S) S.innerHTML=u.cp?scEsc((c?c.t:'')+' · '+L.length+' shown'):('<b>'+act+'</b> active · '+rm+' removed · <b>'+L.length+'</b> shown'+(nfLxData().lastImport?' · last import '+scEsc(String(nfLxData().lastImport.at||'').slice(0,10)):''));
  var B=document.getElementById('nflx-list'); if(!B) return;
  B.innerHTML=L.slice(0,u.limit).map(nfLxRowHTML).join('')+(L.length>u.limit?'<button class="scx-btn ghost" style="width:100%;margin:8px 0;" onclick="_nfLxUi.limit+=100;nfLxRender()">Show more ('+(L.length-u.limit)+')</button>':'')
    +(L.length?'':'<div class="scx-empty">'+(u.cp?'No linked checks for this checkpoint yet. Use “＋ Add link”.':'Nothing matches.')+'</div>');
}
// ── Card Editor: 🔗 n on each row, "Has linked checks" filter, toolbar button ──
(function(){
  var oRow=scCpmRowHTML;
  scCpmRowHTML=function(c){ var h=oRow.apply(this,arguments); if(c.kind!=='nqas') return h; var n=nfLxCount(c.id);
    var btn='<button class="scx-btn sm ghost nflx-cnt" title="Linked checks" onclick="nfLxOpen(\''+scJs(c.id)+'\')">🔗'+(n?' '+n:'')+'</button>';
    var at=h.indexOf('<button class="scx-btn sm ghost" style="flex:0 0 auto;" title="How to fix"'); if(at<0) at=h.lastIndexOf('<button');
    return at>=0?h.slice(0,at)+btn+h.slice(at):h; };
  var oF=scCpmFiltered;
  scCpmFiltered=function(){ var L=oF.apply(this,arguments); return _scCpmUi.lk?L.filter(function(c){ return nfLxCount(c.id)>0; }):L; };
  var oR=scCpmRender;
  scCpmRender=function(){ var r=oR.apply(this,arguments);
    try{ var p=document.getElementById('scm-panel'); if(!p) return r; var f=p.querySelector('.scm-filters');
      if(f&&!f.querySelector('.scm-lkf')) f.insertAdjacentHTML('beforeend','<label class="scm-lkf"><input type="checkbox" '+(_scCpmUi.lk?'checked':'')+' onchange="_scCpmUi.lk=this.checked;scCpmRender()"> Has linked checks</label>');
      var bar=p.querySelector('.scm-bar > span:last-child'); if(bar&&!bar.querySelector('.nflx-open')) bar.insertAdjacentHTML('afterbegin','<button class="scx-btn sm ghost nflx-open" onclick="nfLxOpen(null)">🔗 Linked checks</button>'); }catch(e){}
    return r; };
  if(typeof scCpmChecks==='function'){ var oC=scCpmChecks;
    scCpmChecks=function(){ var out=oC.apply(this,arguments), ids={};
      NF_LINKS.forEach(function(x){ if(nfLxBroken(x)){ if(!nfLxItem(x[0],x[1])||nfLxItem(x[0],x[1]).retired) ids[x[0]]=1; if(!nfLxItem(x[2],x[3])||nfLxItem(x[2],x[3]).retired) ids[x[2]]=1; } });
      var L=Object.keys(ids);
      out.push({key:'brokenLinks',level:L.length?'warn':'ok',label:'Links to retired checkpoints or missing MoVs',detail:'A linked check points to a retired checkpoint or a MoV number that no longer exists. Open 🔗 Linked checks → "Items to check" and edit or remove them.',ids:L,n:L.length,view:'cps'});
      return out; }; }
})();
// ── Import the expert's reviewed Excel (same layout as NQAS-FAST-Linked-checks.xlsx or the downloaded file) ──
function nfLxImportPick(){ var i=document.createElement('input'); i.type='file'; i.accept='.xlsx,.xls,.csv';
  i.onchange=async function(){ var f=i.files&&i.files[0]; if(!f) return;
    try{ var X=await nfLoadXlsx(), wb=X.read(await f.arrayBuffer(),{type:'array'}), sh=wb.Sheets['Linked checks']||wb.Sheets[wb.SheetNames.find(function(n){ return n!=='Read me'&&n!=='Summary'; })||wb.SheetNames[0]];
      await nfLxImportRows(X.utils.sheet_to_json(sh,{header:1,defval:'',raw:false}),f.name);
    }catch(e){ console.warn(e); showToast('Could not read that file. Use the Linked checks Excel.','err'); } };
  i.click(); }
function nfLxPlan(rows){
  var H=(rows[0]||[]).map(function(h){ return String(h||'').trim(); }), col=function(fn){ return H.findIndex(fn); };
  var C={id:col(function(h){ return h==='Link ID'; }),a:col(function(h){ return /^IF: checkpoint/.test(h); }),b:col(function(h){ return /^THEN: checkpoint/.test(h); }),
    s:col(function(h){ return h==='Strength'; }),both:col(function(h){ return /^Also warn/.test(h); }),why:col(function(h){ return h==='Why (English)'; }),whyHi:col(function(h){ return h==='Why (Hindi)'; }),
    ok:col(function(h){ return /^Expert: OK/.test(h); }),note:col(function(h){ return /^Expert: what/.test(h); })};
  if(C.id<0||C.a<0||C.b<0) return {err:'This is not the Linked checks sheet (columns "Link ID", "IF: checkpoint", "THEN: checkpoint" are needed).'};
  var cell=function(r,i){ return i<0?'':String(r[i]==null?'':r[i]).trim(); };
  var P={ops:[],removed:[],restored:[],changed:[],added:[],notes:[],errors:[],same:0}, seen={};
  rows.slice(1).forEach(function(r,ri){ var lid=cell(r,C.id).toUpperCase(), okv=cell(r,C.ok).toLowerCase(), note=cell(r,C.note), a=cell(r,C.a).toUpperCase(), b=cell(r,C.b).toUpperCase();
    if(!lid&&!a&&!b) return; var rowNo=ri+2, x=lid?_nfLxAll.find(function(y){ return y.lid.toUpperCase()===lid; })||null:null; if(x) lid=x.lid;
    var vals={a:a,ak:+cell(r,C.a+1)||0,b:b,bk:+cell(r,C.b+1)||0}, sv=cell(r,C.s).toLowerCase(), bv=cell(r,C.both).toLowerCase();
    if(sv) vals.s=/^s/.test(sv)?'S':'C'; if(bv) vals.both=/^(y|1|true|हाँ)/.test(bv)?1:0; if(C.why>=0&&cell(r,C.why)) vals.why=cell(r,C.why); if(C.whyHi>=0&&cell(r,C.whyHi)) vals.whyHi=cell(r,C.whyHi);
    if(x){ if(seen[lid]) return; seen[lid]=1;
      if(/^remove/.test(okv)){ if(!x.removed){ P.ops.push({lid:lid,p:{removed:true}}); P.removed.push(lid); } else P.same++; return; }
      var p={}, diff=[];
      if(a&&b&&(a!==x[0]||vals.ak!==(+x[1]||0)||b!==x[2]||vals.bk!==(+x[3]||0))){ var r2=nfLxCheckEnds(vals,lid); if(r2.err){ P.errors.push('Row '+rowNo+' ('+lid+'): '+r2.err); return; } Object.assign(p,{a:r2.a,ak:r2.ak,b:r2.b,bk:r2.bk}); diff.push('items'); }
      if(vals.s&&vals.s!==x[4]){ p.s=vals.s; diff.push(vals.s==='S'?'→ Strong':'→ Check'); }
      if(vals.both!=null&&vals.both!==(x[5]?1:0)){ p.both=vals.both; diff.push(vals.both?'warn both ways':'one way only'); }
      if(vals.why!=null&&vals.why!==x[6]){ p.why=vals.why; diff.push('why'); } if(vals.whyHi!=null&&vals.whyHi!==x[7]){ p.whyHi=vals.whyHi; diff.push('why (Hindi)'); }
      if(x.removed){ P.restored.push(lid); diff.push('restored'); }
      if(diff.length){ P.ops.push({lid:lid,p:p,restore:x.removed}); if(!x.removed||diff.length>1) P.changed.push(lid+' ('+diff.filter(function(d){ return d!=='restored'; }).join(', ')+')'); } else P.same++;
      if(note) P.notes.push({lid:lid,ok:okv,t:note});
      return; }
    if(a&&b){ var r3=nfLxCheckEnds(vals,null), dk='@'+a+'|'+(r3.ak||0)+'|'+b+'|'+(r3.bk||0); if(!r3.err&&seen[dk]) return; if(r3.err){ P.errors.push('Row '+rowNo+(lid?' ('+lid+')':'')+': '+r3.err); return; }
      var why=vals.why||note; if(!why){ P.errors.push('Row '+rowNo+': new link '+a+' → '+b+' has no "Why (English)".'); return; }
      P.ops.push({lid:null,p:{a:r3.a,ak:r3.ak,b:r3.b,bk:r3.bk,s:vals.s||'C',both:vals.both||0,why:why,whyHi:vals.whyHi||''}}); P.added.push(a+(r3.ak?'/'+r3.ak:'')+' → '+b+(r3.bk?'/'+r3.bk:''));
      seen[dk]=1; return; }
    if(note) P.notes.push({lid:lid||('row '+rowNo),ok:okv,t:note}); });
  return P;
}
async function nfLxImportRows(rows,name){
  if(!scCpmCanEdit()) return false; var P=nfLxPlan(rows);
  if(P.err){ showToast(P.err,'err'); return false; }
  var lines=[P.removed.length+' removed · '+P.changed.length+' changed · '+P.added.length+' new links · '+P.restored.length+' restored · '+P.same+' unchanged'];
  if(P.removed.length) lines.push('\nRemove: '+P.removed.join(', '));
  if(P.changed.length) lines.push('\nChange: '+P.changed.slice(0,40).join('; ')+(P.changed.length>40?' …':''));
  if(P.added.length) lines.push('\nNew: '+P.added.join('; '));
  if(P.errors.length) lines.push('\nSkipped (fix in the sheet, or add by hand): \n• '+P.errors.join('\n• '));
  if(P.notes.length) lines.push('\nExpert notes to apply by hand ('+P.notes.length+'):\n• '+P.notes.map(function(n){ return n.lid+': '+n.t; }).join('\n• '));
  if(!P.ops.length){ await scDialog({title:'Import review — nothing to apply',icon:'🔗',wide:true,hideCancel:true,okLabel:'OK',message:lines.join('\n')}); return false; }
  var v=await scDialog({title:'Import review'+(name?' — '+name:''),icon:'🔗',wide:true,okLabel:'Apply '+P.ops.length+' changes',message:'Nothing is applied until you confirm. Changes apply to every facility right away.',
    fields:[{type:'info',key:'sum',value:lines.join('\n')}],onRender:function(I){ I.sum.el.style.whiteSpace='pre-wrap'; I.sum.el.style.fontSize='12px'; I.sum.el.style.maxHeight='50vh'; I.sum.el.style.overflow='auto'; }});
  if(!v) return false;
  var D=nfLxClone(), t=Date.now().toString(36);
  P.ops.forEach(function(o,i){ if(o.lid){ nfLxApply(D,o.lid,o.p);
      if(o.restore){ if(/^N-/.test(o.lid)){ if(D.added&&D.added[o.lid]) delete D.added[o.lid].removed; } else if(D.edits&&D.edits[o.lid]){ delete D.edits[o.lid].removed; if(!Object.keys(D.edits[o.lid]).length) delete D.edits[o.lid]; } } }
    else { D.added=D.added||{}; D.added['N-'+t+'-'+i]=Object.assign({},o.p,{at:scNowIso()}); } });
  D.lastImport={at:scNowIso(),file:name||'',removed:P.removed.length,changed:P.changed.length,added:P.added.length,restored:P.restored.length,notes:P.notes.length};
  var ok=await nfLxPersist(D); showToast(ok?'Review applied: '+P.removed.length+' removed, '+P.changed.length+' changed, '+P.added.length+' added.':'Could not save — check connection.',ok?'ok':'err');
  if(ok) nfLxRefresh(); return ok;
}
// ── Download: current links (with all edits) in the review layout — send it for the next round ──
var NF_LX_AREA=['General (Days 1–3)','General (Days 1–3)','General (Days 1–3)','RMNCH+A','FP, Communicable diseases, Eye & ENT','NCD, Oral, Mental health, Emergency','Elderly, health promotion, outcomes'];
function nfLxSheetRows(){
  var H=['Link ID','Area','IF: checkpoint','MoV #','Day','IF this is Met…','THEN: checkpoint','MoV #','Day','…this should be Met','Strength','Also warn the other way','Why (English)','Why (Hindi)','Expert: OK?','Expert: what to change'];
  var L=_nfLxAll.filter(function(x){ return !x.removed; }).concat(_nfLxAll.filter(function(x){ return x.removed; }));
  return [H].concat(L.map(function(x){ var a=nfLxItem(x[0],x[1]), b=nfLxItem(x[2],x[3]), da=nfLxDay(x[0]), db=nfLxDay(x[2]);
    return [x.lid,da?NF_LX_AREA[da-1]:'',x[0],+x[1]||0,da,a?a.t:'(missing)',x[2],+x[3]||0,db,b?b.t:'(missing)',x[4]==='S'?'Strong':'Check',x[5]?'Yes':'No',x[6],x[7],x.removed?'Remove':'','']; }));
}
async function nfLxExport(){
  try{ var X=await nfLoadXlsx(), wb=X.utils.book_new();
    var rd=X.utils.aoa_to_sheet([['NQAS | FAST — Linked checks'],['Downloaded '+scNowIso().slice(0,10)+' from the Card Editor (includes all edits).'],[''],
      ['How to review: fill "Expert: OK?" with OK, Change or Remove, and write changes in "Expert: what to change".'],
      ['You may change Strength (Strong/Check), "Also warn the other way" (Yes/No), the Why texts, or the checkpoint / MoV numbers directly.'],
      ['To add a link: add a row at the bottom with IF and THEN checkpoint + MoV # and Why (leave Link ID empty).'],
      ['Then upload the file in Card Editor → 🔗 Linked checks → Import review. Nothing is applied until you confirm.']]);
    rd['!cols']=[{wch:120}]; X.utils.book_append_sheet(wb,rd,'Read me');
    var ws=X.utils.aoa_to_sheet(nfLxSheetRows()); ws['!cols']=[8,18,11,6,5,46,11,6,5,46,10,11,40,40,11,40].map(function(w){ return {wch:w}; });
    ws['!autofilter']={ref:'A1:P'+(NF_LINKS_BASE.length+400)}; X.utils.book_append_sheet(wb,ws,'Linked checks');
    X.writeFile(wb,'NQAS-FAST-Linked-checks-'+scNowIso().slice(0,10)+'.xlsx'); showToast('Linked checks downloaded.','ok');
  }catch(e){ console.warn(e); showToast('Could not create the Excel file — check connection.','err'); }
}
