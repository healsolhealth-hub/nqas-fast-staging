
// ══════════════════════════════════════════════════════════════
// BASELINE REVIEW (Days 1–7 only)
//  Staff self-assess. The facility's Quality Champion (daily 30-min Peer Review session, or a field visit) — or the
//  Supervisor where there is no Champion — checks Met items ("show me" on camera), switches Met ↔ Not met with a
//  one-tap reason and approves the day. The change is written onto the staff card itself (cpTicks/cpScores), so every
//  report and dashboard shows one verified baseline; the staff member's own values stay in blSelf (shown on their card).
//    day record: blRev/c{ci}/{k|s} = {v, r, by, byId, role, at, via, sid}   blSelf/c{ci} = {t, s}   blApproved = {...}
//  Unreviewed baseline days are accepted as scored from programme Day 14 ("partly reviewed").
// ══════════════════════════════════════════════════════════════
var NF_BL={pick:20,autoDay:14,autoEnd:67,highMin:null};   // autoEnd: unreviewed end-line days (50–56) are accepted as scored from the close date (Day 60 + grace)
var NF_BL_WHY={notseen:'MoV not seen',incomplete:'Register / record incomplete',explain:'Staff could not explain or show',notfunc:'Not available / not functional',inplace:'Actually in place',ok:'Checked — correct'};
var NF_BL_WHY_HI={notseen:'MoV नहीं दिखा',incomplete:'रजिस्टर / रिकॉर्ड अधूरा',explain:'स्टाफ समझा या दिखा नहीं सके',notfunc:'उपलब्ध / चालू नहीं',inplace:'वास्तव में मौजूद है',ok:'जाँचा — सही'};
var _nfBl=null;
function nfBlWhy(r){ return ((typeof _appLang!=='undefined'&&_appLang==='hi')?NF_BL_WHY_HI[r]:NF_BL_WHY[r])||r||''; }
function nfBlIsEnd(di){ return di>=49&&di<=55; }   // end-line verification (Readiness week, Days 57–58)
function nfBlIsDay(di){ return (di>=0&&di<SC_BASELINE_DAYS)||nfBlIsEnd(di); }
function nfBlDayNo(f){ if(!f||!f.startDate) return null; var a=new Date(f.startDate+'T00:00:00'), b=new Date(scTodayStr()+'T00:00:00'); return Math.round((b-a)/86400000)+1; }   // not capped at 60
function nfBlActor(){
  if(appMode==='sc-champion'&&typeof _scq!=='undefined'&&_scq.me) return {name:_scq.me.name||_scq.me.id,id:_scq.me.id,role:'Quality Champion'};
  var a=scActor()||{}; return {name:a.name||'',id:a.id||a.mob||'',role:appMode==='sc-admin'?'HealSol Admin':'Supervisor'};
}
// Quality Champion: review + approve. Supervisor: review + approve where the facility has no active Champion,
// otherwise spot-check only (agree / override items; the Champion approves). HealSol Admin: view only.
function nfBlCanReview(code){
  if(appMode==='sc-champion') return typeof scqChampionCan==='function'&&scqChampionCan(code);
  if(appMode==='sc-supervisor') return typeof scIsDistrict==='function'&&!scIsDistrict()&&scSupAllowed(code);
  return false;
}
function nfBlCanView(code){ return nfBlCanReview(code)||appMode==='sc-admin'||(appMode==='sc-supervisor'&&scSupAllowed(code)); }
function nfBlCanApprove(code){
  if(appMode==='sc-champion') return nfBlCanReview(code);
  if(appMode==='sc-supervisor') return nfBlCanReview(code)&&!(typeof scHasChampion==='function'&&scHasChampion(code));
  return false;
}
async function nfBlLoad(code){
  var r=await Promise.all([fbGet(scFacilityPath(code)),fbGet('sc_progress/'+code)]); var f=r[0]; if(!f) return null;
  return {code:code,fac:f,progId:f.progId||'nqas_12A',roster:f.staff||{},progress:r[1]||{}};
}
function nfBlRec(ctx,mob,di){ var r=((ctx.progress||{})[mob]||{})['day_'+di]||null; return r&&(!r.progId||r.progId===ctx.progId)?r:null; }
function nfBlStdHigh(cp){ var std=cp.std||(typeof scCpmStdOf==='function'?scCpmStdOf(cp.me):''); if(!std) return false;
  var d=(typeof _scCrit!=='undefined'&&_scCrit.stdDefault!=null)?+_scCrit.stdDefault:50; return scNqasStdMin(std)>d; }
// every scored MoV item (or whole checkpoint without items) on day di, for every active staff member who marked it done
function nfBlItems(ctx,di){
  var d=scDayDef(ctx.progId,di), present=scRolesFromRoster(ctx.roster), out=[];
  Object.keys(ctx.roster||{}).forEach(function(mob){ var s=ctx.roster[mob]; if(!s||s.disabled) return; var rec=nfBlRec(ctx,mob,di); if(!rec||!rec.taskDone) return;
    (d&&d.cps||[]).forEach(function(cp,ci){ if(!cp||!cp.id||!scCpForRoleIn(cp,s.role||'CHO',present)) return;
      var sc=scNormScore((rec.cpScores||[])[ci]); if(sc===null) return;
      var rv=((rec.blRev||{})['c'+ci])||{}, self=((rec.blSelf||{})['c'+ci])||null, n=(cp.items||[]).length;
      var base={mob:mob,name:s.name||mob,role:s.role||'CHO',ci:ci,cp:cp,rec:rec};
      if(n){ var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n), st=self?scTicksFromStr(self.t||'',n):tk;
        cp.items.forEach(function(it,k){ if(tk[k]!==0&&tk[k]!==1) return; out.push(Object.assign({k:String(k),text:it.t,hi:it.h,v:tk[k],self:st[k],rev:rv[k]||null},base)); }); }
      else { var ss=self&&self.s!=null?scNormScore(self.s):sc; out.push(Object.assign({k:'s',text:cp.t,hi:cp.hi,v:sc,self:ss,rev:rv.s||null},base)); }
    }); });
  return out;
}
function nfBlMet(x){ return x.k==='s'?x.v===2:x.v===1; }
function nfBlSelfMet(x){ return x.k==='s'?x.self===2:x.self===1; }
function nfBlChanged(x){ return x.v!==x.self; }
// red flags per staff card on this day
function nfBlFlags(ctx,di,items){
  var by={}, fl={}; items.forEach(function(x){ (by[x.mob]=by[x.mob]||[]).push(x); });
  Object.keys(by).forEach(function(m){ var L=by[m];
    if(L.length>=10&&L.every(nfBlSelfMet)) (fl[m]=fl[m]||[]).push('All items Met');
    var ch=0; for(var d=0;d<SC_BASELINE_DAYS;d++){ if(d===di) continue; var r=nfBlRec(ctx,m,d), rv=(r&&r.blRev)||{}; Object.keys(rv).forEach(function(c){ Object.keys(rv[c]||{}).forEach(function(k){ var e=rv[c][k]; if(e&&e.r&&e.r!=='ok'&&e.r!=='inplace') ch++; }); }); }
    if(ch>=3) (fl[m]=fl[m]||[]).push('Often corrected');
  });
  var ms=Object.keys(by);
  for(var i=0;i<ms.length;i++) for(var j=i+1;j<ms.length;j++){
    var A={}, same=0, shared=0; by[ms[i]].forEach(function(x){ A[x.ci+'|'+x.k]=x.self; });
    by[ms[j]].forEach(function(x){ var key=x.ci+'|'+x.k; if(key in A){ shared++; if(A[key]===x.self) same++; } });
    if(shared>=5&&same===shared){ [ms[i],ms[j]].forEach(function(m){ (fl[m]=fl[m]||[]).push('Same scores as another staff member'); }); }
  }
  Object.keys(fl).forEach(function(m){ fl[m]=fl[m].filter(function(v,i,a){ return a.indexOf(v)===i; }); });
  return fl;
}
// the items to check: red-flag cards' Met items, then higher-pass-mark Standards, then a random sample — picked when the review opens
function nfBlPick(items,flags,seed){
  var cand=items.filter(nfBlSelfMet), rnd=scRand(scHashSeed(seed));
  cand.forEach(function(x){ x._p=(flags[x.mob]?0:nfBlStdHigh(x.cp)?1:2); x._r=rnd(); });
  cand.sort(function(a,b){ return (a._p-b._p)||(a._r-b._r); });
  return cand.slice(0,NF_BL.pick);
}
function nfBlDayStatus(ctx,di){
  var items=nfBlItems(ctx,di), mobs={}; items.forEach(function(x){ mobs[x.mob]=1; });
  var appr=Object.keys(mobs).some(function(m){ var r=nfBlRec(ctx,m,di); return r&&r.blApproved; });
  var day=typeof nfDayOf==='function'?nfDayOf(ctx.fac):null;
  if(!items.length) return 'notdone';
  if(appr) return 'reviewed';
  if(nfBlIsEnd(di)){ var dn=nfBlDayNo(ctx.fac); if(dn!=null&&dn>=NF_BL.autoEnd) return 'auto'; }
  else if(day!=null&&day>=NF_BL.autoDay) return 'auto';
  return 'todo';
}
function nfBlSummary(ctx,set){
  var st=[], n={reviewed:0,auto:0,todo:0,notdone:0}, a=set==='end'?49:0, z=set==='end'?56:SC_BASELINE_DAYS; for(var di=a;di<z;di++){ var s=nfBlDayStatus(ctx,di); st.push(s); n[s]++; } return {days:st,n:n};
}
// ── save one item ──────────────────────────────────────────────
async function nfBlSet(mob,di,ci,k,v,r){
  var W=_nfBl; if(!W||!nfBlCanReview(W.ctx.code)||!nfBlIsDay(di)) return;
  var path=scProgressPath(W.ctx.code,mob,di), rec=await fbGet(path); if(!rec||!rec.taskDone){ showToast('This card is not marked done.','err'); return; }
  var d=scDayDef(W.ctx.progId,di), cp=d.cps[ci], n=(cp.items||[]).length, a=nfBlActor(), now=scNowIso(), upd={};
  var entry=scClean({v:v,r:r,by:a.name,byId:a.id,role:a.role,at:now,via:W.via,sid:W.sid||null});
  var prev=(((rec.blRev||{})['c'+ci])||{})[k]||null;
  if(r==='ok'&&prev&&prev.r&&prev.r!=='ok'&&prev.v===v){   // agreeing with an earlier change: keep who changed it and why
    entry=scClean(Object.assign({},prev,{conf:{by:a.name,byId:a.id,role:a.role,at:now,via:W.via}}));
  }
  if(r!=='ok'){
    if(!(rec.blSelf&&rec.blSelf['c'+ci])) upd['blSelf/c'+ci]={t:((rec.cpTicks||{})['c'+ci])||'',s:scNormScore((rec.cpScores||[])[ci])==null?-1:scNormScore((rec.cpScores||[])[ci])};
    var sc;
    if(k==='s'){ sc=v; }
    else { var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n); tk[+k]=v; upd['cpTicks/c'+ci]=scTicksToStr(tk); sc=scMovScore(tk); if(sc==null) sc=scNormScore((rec.cpScores||[])[ci]); }
    upd['cpScores/'+ci]=sc==null?-1:sc;
    if(rec.gapRetries&&rec.gapRetries['c'+ci]) upd['gapRetries/c'+ci+'/orig']=sc==null?-1:sc;
    upd.updatedAt=now;
  }
  upd['blRev/c'+ci+'/'+k]=entry;
  try{ await db.ref(path).update(upd); }catch(e){ console.warn(e); showToast('Could not save — check connection.','err'); return; }
  W.ctx.progress[mob]=W.ctx.progress[mob]||{}; W.ctx.progress[mob]['day_'+di]=await fbGet(path);
  W.why=null; nfBlRender();
}
async function nfBlApprove(){
  var W=_nfBl; if(!W) return; if(!W.canApprove){ showToast('The Quality Champion approves this facility\'s baseline days.','err'); return; }
  var items=nfBlItems(W.ctx,W.di), mobs={}; items.forEach(function(x){ mobs[x.mob]=1; });
  var checked=items.filter(function(x){ return x.rev; }).length, changed=items.filter(nfBlChanged).length;
  var left=W.pick.filter(function(x){ var y=items.find(function(z){ return z.mob===x.mob&&z.ci===x.ci&&z.k===x.k; }); return y&&!y.rev; }).length;
  if(!await showConfirm('Approve the '+(nfBlIsEnd(W.di)?'end-line':'baseline')+' for Day '+(W.di+1)+'?\n\n'+checked+' item'+(checked===1?'':'s')+' checked · '+changed+' changed'+(left?' · '+left+' suggested item'+(left===1?'':'s')+' not checked':'')+'.\nEverything you did not change is accepted as scored by staff.','✅','Approve Day '+(W.di+1),'Approve','var(--teal)')) return;
  var a=nfBlActor(), now=scNowIso(), done=0;
  for(var m in mobs){ var path=scProgressPath(W.ctx.code,m,W.di), rec=await fbGet(path); if(!rec||!rec.taskDone) continue;
    var mine=items.filter(function(x){ return x.mob===m; }), upd={blApproved:scClean({by:a.name,byId:a.id,role:a.role,at:now,via:W.via,sid:W.sid||null,checked:mine.filter(function(x){ return x.rev; }).length,changed:mine.filter(nfBlChanged).length})};
    if(!rec.verified) Object.assign(upd,{verified:true,verifiedBy:a.name,verifiedByRole:a.role,verifiedByMob:appMode==='sc-champion'?a.id:'',verifiedAt:now,verifyMode:nfBlIsEnd(W.di)?'endline-review':'baseline-review',sampleChecked:upd.blApproved.checked,sampleAccepted:Math.max(0,mine.length-upd.blApproved.checked)});
    try{ await db.ref(path).update(upd); done++; }catch(e){ showToast('Could not approve — check connection.','err'); return; } }
  if(W.sid&&appMode==='sc-champion'){ try{ var s=await fbGet('sc_review_sessions/'+W.sid);
    if(s&&['scheduled','returned'].indexOf(s.status)>=0&&+s.dayTo<=W.di+1) await db.ref('sc_review_sessions/'+W.sid).update({status:'submitted',submittedAt:now,updatedAt:now,
      summary:scClean({baseline:true,reviewed:checked,confirmed:checked-changed,needs:changed,actions:0,comment:'Baseline Day '+(W.di+1)+' reviewed: '+checked+' items checked on camera, '+changed+' changed.'})}); }catch(e){} }
  showToast('Day '+(W.di+1)+(nfBlIsEnd(W.di)?' end-line verified (':' baseline approved (')+done+' card'+(done===1?'':'s')+').','ok');
  nfBlClose(); try{ if(appMode==='sc-champion') await scqChampionReload(); else await nfBlRefreshIns(W.ctx.code); }catch(e){}
}
async function nfBlRefreshIns(code){ var hs=Object.keys(_scIns||{}).filter(function(h){ return _scIns[h]&&_scIns[h].code===code; });
  for(var i=0;i<hs.length;i++){ var st=_scIns[hs[i]]; await scMountInsights(hs[i],{code:code,fac:st.fac,staff:st.staff,tab:st.tab}); } }
// ── review screen ──────────────────────────────────────────────
async function nfBlOpen(code,di,via,sid){
  if(!nfBlCanView(code)){ showToast('Only the facility\'s Quality Champion or Supervisor can review the baseline.','err'); return; }
  if(appMode==='sc-supervisor'){ try{ await scqLoadChampions(); }catch(e){} }
  if(!nfBlIsDay(di)){ showToast('Review covers the baseline (Days 1–7) and the end-line (Days 50–56) only.','err'); return; }
  var ctx=await nfBlLoad(code); if(!ctx){ showToast('Facility not found.','err'); return; }
  var items=nfBlItems(ctx,di); if(!items.length){ showToast('No staff card for Day '+(di+1)+' is marked done yet.','err'); return; }
  var flags=nfBlFlags(ctx,di,items), seed=code+'|'+di+'|bl';   // same 20 for the Champion and the Supervisor (stable even if the start date is corrected)
  _nfBl={ctx:ctx,di:di,via:via==='session'?'session':'visit',sid:sid||null,flags:flags,why:null,tab:'pick',ro:!nfBlCanReview(code),canApprove:nfBlCanApprove(code),pick:nfBlPick(items,flags,seed).map(function(x){ return {mob:x.mob,ci:x.ci,k:x.k}; })};
  nfBlRender();
}
function nfBlClose(){ var o=document.getElementById('nfbl-ov'), W=_nfBl; if(o) o.remove(); _nfBl=null; if(W&&appMode!=='sc-champion') nfBlRefreshIns(W.ctx.code).catch(function(){}); }
function nfBlItemHTML(x,fl){
  var key=x.mob+'|'+x.ci+'|'+x.k, met=nfBlMet(x), chg=nfBlChanged(x), J="'"+scJs(x.mob)+"',"+_nfBl.di+','+x.ci+",'"+x.k+"'";
  var on=x.k==='s'?2:1, off=x.k==='s'?0:0, why=_nfBl.why===key;
  var h='<div class="nfbl-it'+(x.rev?(chg?' chg':' done'):'')+'"><div class="nfbl-meta"><b style="color:var(--t1)">'+scEsc(x.name)+'</b><span>'+scEsc(x.role)+'</span><span>· '+scEsc(x.cp.id)+' · '+scEsc(x.cp.me||'')+'</span>'
    +((fl||[]).map(function(f){ return '<span class="fl">⚑ '+scEsc(f)+'</span>'; }).join(''))+'</div>'
    +'<div class="nfbl-cp">'+scEsc(x.cp.t||'')+'</div>'
    +'<div class="nfbl-mov">'+(x.k==='s'?'Whole checkpoint':'MoV '+(+x.k+1)+': ')+(x.k==='s'?'':scEsc(x.text||''))+'</div>'
    +'<div class="nfbl-show">📷 Ask to show this on camera / on site</div>'
    +'<div class="nfbl-row"><span class="nfbl-st '+(met?'m':'n')+'">'+(met?'Met':'Not met')+'</span>'
    +(x.self!==x.v?'<span class="nfbl-st" style="background:#F1F5F9;color:#475569;">staff said '+((x.k==='s'?x.self===2:x.self===1)?'Met':'Not met')+'</span>':'');
  if(_nfBl.ro){ h+='</div>'; }
  else if(met) h+='<button class="nfbl-b ok" onclick="nfBlSet('+J+','+on+',\'ok\')">✓ Correct</button><button class="nfbl-b no'+(why?' on':'')+'" onclick="_nfBl.why=_nfBl.why===\''+key+'\'?null:\''+key+'\';nfBlRender()">✗ Not met</button>';
  else h+='<button class="nfbl-b ok" onclick="nfBlSet('+J+','+on+',\'inplace\')">'+(chg?'↩ Back to Met':'✓ Actually in place')+'</button><button class="nfbl-b" onclick="nfBlSet('+J+','+off+',\'ok\')">'+(chg?'✓ Agree — Not met':'Correct as Not met')+'</button>';
  if(!_nfBl.ro) h+='</div>';
  if(why&&!_nfBl.ro) h+='<div class="nfbl-why">'+['notseen','incomplete','explain','notfunc'].map(function(r){ return '<button onclick="nfBlSet('+J+','+off+',\''+r+'\')">'+scEsc(NF_BL_WHY[r])+'</button>'; }).join('')+'</div>';
  if(x.rev){ var rv=x.rev, who=function(e){ return scEsc(e.by||'')+(e.role?' ('+scEsc(e.role)+')':''); }, via=function(e){ return e.via==='visit'?'field visit':'live session'; };
    h+='<div class="nfbl-done'+(chg?' c':'')+'">'+(chg?'Changed by '+who(rv)+' · '+scEsc(NF_BL_WHY[rv.r]||rv.r||''):'Checked by '+who(rv)+' · '+scEsc(rv.r==='ok'?'correct as scored':(NF_BL_WHY[rv.r]||rv.r||'')))
      +(rv.conf?'<br>✓ Confirmed by '+who(rv.conf):'')+'</div>'; }
  return h+'</div>';
}
function nfBlTabsHTML(W,n){
  var tb=[['pick','To check',n.pickLeft+' of '+n.pick],['checked','Checked',n.checked],['changed','Changed',n.changed],['all','All items',n.all]];
  return '<div class="nfbl-tabs">'+tb.map(function(t){ return '<button type="button" class="'+(W.tab===t[0]?'on ':'')+(t[0]==='changed'&&n.changed?'r':t[0]==='checked'&&n.checked?'g':'')+'" onclick="_nfBl.tab=\''+t[0]+'\';nfBlRender()">'+t[1]+' <b>'+t[2]+'</b></button>'; }).join('')+'</div>'
    +'<div class="nfbl-sub">'+n.all+' items scored by staff on this day · '+n.met+' Met</div>';
}
function nfBlListHTML(W,items,pick,pk,byStaff){
  var row=function(x){ return nfBlItemHTML(x,pk[x.mob+'|'+x.ci+'|'+x.k]?W.flags[x.mob]:null); }, empty=function(t){ return '<div class="nfbl-tip">'+t+'</div>'; };
  if(W.tab==='checked'){ var L=items.filter(function(x){ return x.rev; }); return L.length?L.map(row).join(''):empty('Nothing checked yet.'); }
  if(W.tab==='changed'){ var C=items.filter(nfBlChanged); return C.length?C.map(row).join(''):empty('No item has been changed.'); }
  if(W.tab==='all'){ var by={}; items.forEach(function(x){ (by[x.mob]=by[x.mob]||[]).push(x); });
    return '<div class="nfbl-sub">Correct anything you see on site — not only the suggested items.</div>'+Object.keys(by).map(function(m){ var L=by[m]; return '<div class="nfbl-sec">'+scEsc(L[0].name)+' · '+scEsc(L[0].role)+' ('+L.length+')</div>'+L.map(row).join(''); }).join(''); }
  return pick.length?'<div class="nfbl-sub">The same '+pick.length+' items for the Champion and the Supervisor — checked ones stay here, marked.</div>'+pick.map(row).join(''):empty('No Met items to sample on this day.');
}
function nfBlRender(){
  var W=_nfBl; if(!W) return;
  var old=document.getElementById('nfbl-ov'), sc=old?old.querySelector('.scx-box').scrollTop:0; if(old) old.remove();
  var items=nfBlItems(W.ctx,W.di), find=function(p){ return items.find(function(x){ return x.mob===p.mob&&x.ci===p.ci&&x.k===p.k; }); };
  var pick=W.pick.map(find).filter(Boolean), pk={}; pick.forEach(function(x){ pk[x.mob+'|'+x.ci+'|'+x.k]=1; });
  var checked=items.filter(function(x){ return x.rev; }).length, changed=items.filter(nfBlChanged).length, metN=items.filter(nfBlMet).length;
  var f=W.ctx.fac, appr=items.some(function(x){ return x.rec&&x.rec.blApproved; });
  var flagged=Object.keys(W.flags).map(function(m){ return scEsc(((W.ctx.roster[m]||{}).name)||m)+': '+W.flags[m].map(scEsc).join(', '); });
  var byStaff={}; items.forEach(function(x){ if(pk[x.mob+'|'+x.ci+'|'+x.k]) return; (byStaff[x.mob]=byStaff[x.mob]||[]).push(x); });
  var ov=document.createElement('div'); ov.className='scx-ov open nfbl-ov'; ov.id='nfbl-ov';
  ov.innerHTML='<div class="scx-box" style="max-height:92vh;overflow:auto;">'
    +'<div class="nfbl-hd"><div><b>'+(nfBlIsEnd(W.di)?'End-line verification':'Baseline review')+' · Day '+(W.di+1)+'</b><small>'+scEsc(f.name||W.ctx.code)+' · '+scEsc(W.ctx.code)+' · '+scEsc(scDayDef(W.ctx.progId,W.di).title||'')+'</small></div>'
    +'<span class="nfbl-via'+(W.via==='visit'?' visit':'')+'">'+(W.via==='visit'?'🚶 Field visit':'🎥 Live session')+'</span></div>'
    +(appr?'<div class="nfbl-badge g">✓ Approved'+(W.ro?'':' — you can still correct items until Day '+(nfBlIsEnd(W.di)?NF_BL.autoEnd:NF_BL.autoDay))+'</div>':'')
    +(W.ro?'<div class="nfbl-tip" style="background:#EFF6FF;color:#1E40AF;">View only — the facility\'s Quality Champion or Supervisor reviews the baseline. You can see every check and change here.</div>'
      :(!W.canApprove?'<div class="nfbl-tip" style="background:#EFF6FF;color:#1E40AF;">Spot-check — this facility has a Quality Champion, who approves the day. You can agree with or override any item.</div>':''))
    +(W.ro?'':'<div class="nfbl-tip">Ask the staff member to <b>show</b> each item'+(W.via==='visit'?'':' on camera')+'. Tap <b>✓ Correct</b> if you saw it, or <b>✗ Not met</b> with a reason. Items you don\'t touch keep the staff score. Your change becomes the facility\'s baseline.</div>')
    +nfBlTabsHTML(W,{pick:pick.length,pickLeft:pick.filter(function(x){ return !x.rev; }).length,checked:checked,changed:changed,all:items.length,met:metN})
    +(flagged.length&&W.tab==='pick'?'<div class="nfbl-tip" style="background:#FFFBEB;color:#92400E;">⚑ Red flags — '+flagged.join(' · ')+'</div>':'')
    +nfBlListHTML(W,items,pick,pk,byStaff)
    +'<div class="nfbl-foot">'+(W.canApprove?'<button class="scx-btn" onclick="nfBlApprove()"><i class="ti ti-circle-check"></i> '+(appr?'Approve again':'Approve Day '+(W.di+1))+'</button>':'')+'<button class="scx-btn ghost" onclick="nfBlClose()">Close</button></div></div>';
  document.body.appendChild(ov); try{ ov.querySelector('.scx-box').scrollTop=sc; }catch(e){}
}
// ── entry points ───────────────────────────────────────────────
function nfBlDaysHTML(ctx,open,set){
  var off=set==='end'?49:0, S=nfBlSummary(ctx,set), lab={reviewed:'reviewed',auto:'accepted',todo:'to review',notdone:'not done'};
  return '<div class="nfbl-days">'+S.days.map(function(s,di){ return '<button type="button" class="nfbl-d '+(s==='reviewed'?'rv':s==='todo'?'todo':s==='auto'?'auto':'nd')+'"'+(s==='notdone'||!open?' disabled':' onclick="'+open.replace('%D',di+off)+'"')+'>D'+(di+off+1)+'<small>'+lab[s]+'</small></button>'; }).join('')+'</div>';
}
function nfBlNoteText(S,set){
  if(set==='end'){ if(S.n.reviewed===7) return {t:'Verified end-line — all 7 days reviewed',g:true}; if(S.n.auto) return {t:'End-line partly verified — '+S.n.reviewed+' of 7 days reviewed; '+S.n.auto+' accepted as scored on the close date',g:false}; return {t:'End-line verification — '+S.n.reviewed+' of 7 days reviewed',g:false}; }
  if(S.n.reviewed===SC_BASELINE_DAYS) return {t:'Verified baseline — all 7 days reviewed',g:true};
  if(S.n.auto) return {t:'Baseline partly reviewed — '+S.n.reviewed+' of 7 days reviewed; '+S.n.auto+' accepted as scored (not reviewed by Day '+NF_BL.autoDay+')',g:false};
  return {t:'Baseline review in progress — '+S.n.reviewed+' of 7 days reviewed',g:false};
}
async function nfBlLiveSid(code,di){
  if(appMode!=='sc-champion') return null;
  var L=scqSorted(_scq.sessions||{},function(s){ return s.code===code&&s.championId===_scq.me.id&&['live','ended'].indexOf(scqPhase(s))>=0&&+s.dayFrom<=di+1&&+s.dayTo>=di+1; });
  return L.length?L[L.length-1].id:null;
}
async function nfBlStart(code,di){ var sid=await nfBlLiveSid(code,di); nfBlOpen(code,di,sid?'session':'visit',sid); }
// Champion: plan the daily sessions (Days 2–8 review the previous day) in one go
async function nfBlPlanSessions(code){
  if(appMode!=='sc-champion') return; var f=_scq.facs[code]||{}; if(!f.startDate){ showToast('This facility has no start date yet.','err'); return; }
  var v=await scDialog({title:'Plan daily baseline sessions',icon:'🗓️',okLabel:'Send to Supervisor',
    message:'One 30-minute session a day from Day 2 to Day 8. Each session reviews the previous day\'s cards. Your Supervisor approves them.',
    fields:[{key:'time',label:'Time each day',type:'time',required:true,value:'11:00'},{key:'link',label:'Meeting link (same for all)',required:true,placeholder:'https://meet.google.com/…'}],
    validate:function(v){ return scIsHttpUrl(v.link)?null:'Meeting link must start with https://'; }});
  if(!v) return;
  var ch=(_scq.champions||{})[_scq.me.id]||_scq.me, now=scNowIso(), have={}, n=0;
  Object.keys(_scq.sessions||{}).forEach(function(id){ var s=_scq.sessions[id]; if(s&&s.code===code&&s.status!=='cancelled') for(var d=+s.dayFrom;d<=+s.dayTo;d++) have[d]=1; });
  for(var day=1;day<=SC_BASELINE_DAYS;day++){ if(have[day]) continue;
    var date=scAddDays(f.startDate,day); if(date<scTodayStr()) continue;
    var rec=scClean({code:code,championId:_scq.me.id,championName:ch.name||_scq.me.id,supervisorId:f.supervisorId||ch.supervisorId||'',kind:'baseline',
      startAt:new Date(date+'T'+v.time).toISOString(),durationMin:30,link:v.link.trim(),dayFrom:day,dayTo:day,note:'Baseline review — Day '+day,status:'proposed',createdAt:now,createdBy:_scq.me.name||_scq.me.id,createdByRole:'Quality Champion',updatedAt:now,updatedBy:_scq.me.name||_scq.me.id});
    var sid=scUid('rs'); if(await fbSet('sc_review_sessions/'+sid,rec)){ _scq.sessions[sid]=rec; n++; } }
  showToast(n?n+' session'+(n===1?'':'s')+' sent to your Supervisor for approval.':'Every remaining baseline day already has a session.','ok');
  try{ scqRenderChampionApp(); }catch(e){}
}
(function(){
  // a Peer Review session that covers baseline days opens the baseline review instead of the checkpoint workspace
  if(typeof scqOpenWorkspace==='function'){ var oW=scqOpenWorkspace;
    scqOpenWorkspace=async function(id,preview){ var s=(_scq.sessions||{})[id]||await fbGet('sc_review_sessions/'+id);
      if(!preview&&s&&s.kind==='baseline'&&['live','ended','missed','returned'].indexOf(scqPhase(s))>=0){ _scq.sessions[id]=s; return nfBlOpen(s.code,(+s.dayFrom||1)-1,'session',id); }
      return oW.apply(this,arguments); }; }
  // Champion portal: Baseline review block under each facility
  if(typeof scqRenderChampionApp==='function'){ var oA=scqRenderChampionApp;
    scqRenderChampionApp=function(){ var r=oA.apply(this,arguments);
      try{ if(appMode!=='sc-champion') return r; var app=document.getElementById('scq-app'); if(!app) return r;
        var old=app.querySelector('#nfbl-champ'); if(old) old.remove();
        var codes=Object.keys(_scq.facs||{}).filter(scqChampionCan); if(!codes.length) return r;
        var h='<div class="scq-sec" id="nfbl-champ"><div class="scq-sec-t"><i class="ti ti-clipboard-check"></i> Baseline review (Days 1–7)</div>'
          +codes.map(function(code){ var f=_scq.facs[code], ctx={code:code,fac:f,progId:f.progId||'nqas_12A',roster:f.staff||{},progress:_scq.prog[code]||{}}, S=nfBlSummary(ctx), nt=nfBlNoteText(S);
            return '<div class="nfbl-box"><b>'+scEsc(f.name||code)+'</b><small>'+scEsc(nt.t)+'. Tap a day to review it — in the daily session or on a field visit.</small>'
              +nfBlDaysHTML(ctx,"nfBlStart('"+scJs(code)+"',%D)")
              +'<div style="margin-top:8px;"><button class="scx-btn sm ghost" onclick="nfBlPlanSessions(\''+scJs(code)+'\')"><i class="ti ti-calendar-plus"></i> Plan daily sessions (Day 2–8)</button></div></div>'; }).join('')+'</div>';
        var main=app.querySelector('.scq-main')||app; main.insertAdjacentHTML('afterbegin',h);   // top of the portal during the baseline
      }catch(e){ console.warn('[SC] baseline review block',e); }
      return r; }; }
  // Facility Baseline tab (drill-in, Facility dashboard): review status; Supervisor / HealSol can review here
  if(typeof scBaselineHTML==='function'){ var oB=scBaselineHTML;
    scBaselineHTML=function(st){ var h=oB.apply(this,arguments);
      try{ var ctx={code:st.code,fac:st.fac||{},progId:st.progId,roster:st.staff||{},progress:st.progress||{}}, S=nfBlSummary(ctx), nt=nfBlNoteText(S);
        var can=(appMode==='sc-supervisor'||appMode==='sc-admin')&&nfBlCanView(st.code);
        var blk='<div class="nfbl-box"><span class="nfbl-badge'+(nt.g?' g':'')+'">'+scEsc(nt.t)+'</span>'
          +'<small>The baseline is self-assessed by staff and checked by the Quality Champion'+(appMode==='sc-supervisor'&&can?' (or by you where there is no Champion)':'')+'. Only the reviewed score is used in reports.'+(appMode==='sc-admin'?' Tap a day to view the checks (view only).':'')+'</small>'
          +nfBlDaysHTML(ctx,can?"nfBlOpen('"+scJs(st.code)+"',%D,'visit')":null)+'</div>';
        var i=h.indexOf('<div class="scd-days">'); return i>=0?h.slice(0,i)+blk+h.slice(i):blk+h; }catch(e){ return h; } }; }
})();
// verification queues (CHO/MO, Supervisor, Champion) leave baseline days to the baseline review
(function(){ var oP=scVPending; scVPending=function(ctx){ return oP.apply(this,arguments).filter(function(p){ return !nfBlIsDay(p.di); }); }; })();
// ── staff app: reviewer changes on the card; reviewed baseline protected ──
(function(){
  var oFrom=scCardFromRecord;
  scCardFromRecord=function(rec){ var c=oFrom.apply(this,arguments); if(rec){ if(rec.blRev) c.blRev=rec.blRev; if(rec.blSelf) c.blSelf=rec.blSelf; if(rec.blApproved) c.blApproved=rec.blApproved; } return c; };
  // before a baseline day syncs, the reviewer's values win for every reviewed checkpoint
  var oSync=scSyncProgress;
  scSyncProgress=async function(di){
    try{ if(nfBlIsDay(+di)&&db&&choState.facilityCode&&choState.staffMobile){ var c=choState.cards[di];
      var rec=await fbGet(scProgressPath(choState.facilityCode,choState.staffMobile,di));
      if(c&&rec&&rec.blRev){ var fixed=0; c.blRev=rec.blRev; c.blSelf=rec.blSelf||c.blSelf; if(rec.blApproved) c.blApproved=rec.blApproved;
        Object.keys(rec.blRev).forEach(function(k){ var ci=+k.slice(1), rs=scNormScore((rec.cpScores||[])[ci]);
          if(scNormScore((c.cpScores||[])[ci])!==rs){ c.cpScores[ci]=rs; fixed++; }
          var rt=(rec.cpTicks||{})['c'+ci]; if(rt!=null){ c.cpTicks=c.cpTicks||{}; c.cpTicks[ci]=scTicksFromStr(rt); } });
        if(fixed){ try{ saveCHOState(); }catch(e){} showToast('Reviewed baseline items keep the Quality Champion\'s score.',''); } } } }catch(e){}
    return oSync.apply(this,arguments);
  };
  if(typeof resetCard==='function'){ var oReset=resetCard;
    resetCard=function(di){ var c=(choState.cards||{})[di]; if(c&&(c.blApproved||(c.blRev&&Object.keys(c.blRev).length))){ showToast(t('This baseline card has been reviewed and cannot be redone.'),'err'); return; } return oReset.apply(this,arguments); }; }
  var oCard=renderCard;
  renderCard=function(di){ var r=oCard.apply(this,arguments);
    try{ var c=(choState.cards||{})[di]; if(!c||!c.blRev||!nfBlIsDay(+di)) return r; var d=getDay(di);
      Object.keys(c.blRev).forEach(function(k){ var ci=+k.slice(1), el=document.getElementById('cp-'+di+'-'+ci), cp=d&&d.cps&&d.cps[ci]; if(!el||!cp) return;
        var rv=c.blRev[k]||{}, notes=Object.keys(rv).map(function(kk){ var e=rv[kk]||{}; var lab=kk==='s'?'':((cp.items||[])[+kk]?'MoV '+(+kk+1)+': ':'');
          var sf=((c.blSelf||{})[k]||{}), own=kk==='s'?scNormScore(sf.s):(sf.t!=null?scTicksFromStr(sf.t)[+kk]:e.v), chg=(sf.t!=null||sf.s!=null)?own!==e.v:(e.r&&e.r!=='ok'); return '<div class="nfbl-note'+(chg?'':' ok')+'">'+(chg?'🔎 ':'✓ ')+scEsc(lab)+(chg?(e.v===1||e.v===2?t('Changed to Met'):t('Changed to Not met'))+' — '+scEsc(nfBlWhy(e.r)):t('Checked — correct'))+' · '+scEsc(e.by||'')+(e.role?' ('+scEsc(e.role)+')':'')+'</div>'; });
        if(notes.length) el.insertAdjacentHTML('beforeend','<div class="nfbl-notes">'+notes.join('')+'</div>'); });
    }catch(e){ console.warn('[SC] baseline notes',e); }
    return r; };
})();
Object.assign(HINDI_UI,{'Changed to Met':'Met किया गया','Changed to Not met':'Not met किया गया','Checked — correct':'जाँचा — सही','This baseline card has been reviewed and cannot be redone.':'यह बेसलाइन कार्ड जाँचा जा चुका है, दोबारा नहीं किया जा सकता।'});
