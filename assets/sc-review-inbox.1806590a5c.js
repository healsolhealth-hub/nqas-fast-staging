
// ══════════════════════════════════════════════════════════════
// REVIEW INBOX (sidebar) — what needs the Supervisor / HealSol today, across facilities.
//  Every line opens the facility's Review & Action Plan tab, where actions are taken.
//  The verification card view is verification only (no Assign / Re-check buttons there).
// ══════════════════════════════════════════════════════════════
async function nfOpenReview(code,preset){
  try{ scAdmCloseVerify(); }catch(e){}
  await scDrillIn(code);
  try{ var st=_scIns['sc-drill-insights']; if(st){ if(preset) st.rvc=Object.assign({tab:'non',show:'need',q:'',limit:40},preset); st.tab='gaps'; scInsRender('sc-drill-insights'); } }catch(e){}
}
function nfInboxData(){
  var rows=nfAdminRows(), ver=[], champ=[];
  rows.forEach(function(r){ var f=(scMasterFacilities||{})[r.code]||{}, raw=(_scRvAll||{})[r.code]||{};
    r.drafts=Object.keys(raw).filter(function(k){ return (raw[k]||{}).status==='draft'; }).length;
    var day=nfDayOf(f); r.blDone=7; try{ r.blDone=scBaselineStatus(f.progId||'nqas_12A',(scMasterProgress||{})[r.code]||{},f.staff||{}).filter(function(x){ return x.complete; }).length; }catch(e){}
    r.blLate=day!=null&&day>7&&r.blDone<7; r.day=day; if(r.dept){ r.blDone=7; r.blLate=false; }   // the 7-day baseline rule is the Sub-Centre one
    var ctx=null; try{ ctx=scVCtx(r.code); }catch(e){}
    if(ctx){ if(!scQvIsOversight(r.code)) scVPending(ctx).forEach(function(p){ ver.push(Object.assign({code:r.code,fname:r.name},p)); });
      Object.keys(ctx.progress||{}).forEach(function(mob){ Object.keys(ctx.progress[mob]||{}).forEach(function(k){ var m=/^day_(\d+)$/.exec(k), rec=ctx.progress[mob][k]; if(m&&rec&&rec.verified&&rec.verifiedByRole==='Quality Champion') champ.push({code:r.code,fname:r.name,mob:mob,di:+m[1],rec:rec,name:(ctx.roster[mob]||{}).name||mob,role:(ctx.roster[mob]||{}).role||'CHO'}); }); }); }
  });
  champ.sort(function(a,b){ return String(b.rec.verifiedAt||'').localeCompare(String(a.rec.verifiedAt||'')); });
  var act=rows.filter(function(r){ return r.drafts||r.confirm||r.overdue||r.doubts||r.noAct||r.planMissing||r.blLate; });
  var sum=function(k){ return rows.reduce(function(s,r){ return s+(r[k]||0); },0); };
  return {rows:rows,ver:ver,champ:champ,act:act,tot:{ver:ver.length,confirm:sum('confirm'),overdue:sum('overdue'),doubts:sum('doubts'),drafts:sum('drafts'),noAct:sum('noAct'),plans:rows.filter(function(r){ return r.planMissing; }).length,bl:rows.filter(function(r){ return r.blLate; }).length}};
}
function nfInboxBadge(){ try{ var t=nfInboxData().tot; return t.ver+t.confirm+t.overdue+t.doubts; }catch(e){ return 0; } }
var _nfIbAll=false;
function nfRenderInbox(){
  var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-inbox'); if(!box){ box=document.createElement('div'); box.id='nf-inbox'; box.dataset.nfv='inbox'; main.insertBefore(box,main.firstChild); }
  var D=nfInboxData(), T=D.tot, J=function(x){ return scJs(x); };
  var chip=function(n,l,c){ return '<div class="nfib-k'+(n?'':' z')+'"><b style="color:'+(n?c:'var(--t3)')+'">'+n+'</b><small>'+l+'</small></div>'; };
  var h='<div class="nfo-top"><div><h1>Review inbox</h1><small>What needs you today across '+D.rows.length+' facilit'+(D.rows.length===1?'y':'ies')+' · open any line to act in the facility\'s Review & Action Plan</small></div>'
    +'<button type="button" class="nfo-ic" title="Refresh" onclick="scRefreshDashboard()"><i class="ti ti-refresh"></i></button></div>'
    +'<div class="nfib-sum">'+chip(T.ver,'Cards to verify','var(--amber-dk)')+chip(T.confirm,'Actions to confirm','var(--amber-dk)')+chip(T.overdue,'Overdue actions','var(--red-dk)')+chip(T.doubts,'Champion doubts','var(--qi)')
    +chip(T.drafts,'Draft actions','var(--teal-dk)')+chip(T.plans,'Plans not published','var(--red-dk)')+chip(T.bl,'Baselines incomplete','var(--red-dk)')+'</div>';
  // actions by facility
  var cell=function(r,n,cls,preset){ return '<td class="c">'+(n?'<button type="button" class="nfib-n '+cls+'" onclick="nfOpenReview(\''+J(r.code)+'\','+(preset?JSON.stringify(preset).replace(/"/g,'&quot;'):'null')+')">'+n+'</button>':'<span class="nfib-0">—</span>')+'</td>'; };
  h+='<div class="nfo-card"><div class="nfo-ch"><b><i class="ti ti-list-check"></i> Actions to handle</b><span>'+D.act.length+' facilit'+(D.act.length===1?'y':'ies')+' · click a number to open it</span></div>';
  h+=D.act.length?'<div class="nfo-tw"><table class="nfo-t nfib-t"><thead><tr><th>Facility</th><th class="c">Drafts</th><th class="c">To confirm</th><th class="c">Overdue</th><th class="c">Champion doubts</th><th class="c">Gaps without action</th><th>Flags</th><th></th></tr></thead><tbody>'
    +D.act.map(function(r){ var fl=[]; if(r.blLate) fl.push('<span class="nfo-chip red">Baseline '+r.blDone+'/7 · Day '+r.day+'</span>'); if(r.planMissing) fl.push('<span class="nfo-chip red">Plan not published</span>');
      return '<tr><td><b>'+scEsc(r.name)+'</b><small>'+scEsc(r.district||r.code)+'</small></td>'+cell(r,r.drafts,'t')+cell(r,r.confirm,'a')+cell(r,r.overdue,'r')+cell(r,r.doubts,'q')
        +cell(r,r.noAct,'r',{tab:'non',show:'need'})+'<td>'+fl.join(' ')+'</td><td><button type="button" class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="nfOpenReview(\''+J(r.code)+'\')">Open</button></td></tr>'; }).join('')+'</tbody></table></div>'
    :'<div class="nfo-empty sm">✓ Nothing to handle — every facility is up to date.</div>';
  h+='</div>';
  // verification
  h+='<div class="nfo-card"><div class="nfo-ch"><b><i class="ti ti-shield-check"></i> Verification</b><span>CHO & MO cards · facilities without a Quality Champion are verified by you</span></div>';
  var vlim=_nfIbAll?D.ver.length:5;
  h+=D.ver.length?D.ver.slice(0,vlim).map(function(p){ return '<div class="nfib-vf"><span class="nfib-fac">'+scEsc(p.fname)+'</span>'+scVqItemHTML(p,"scRvOpenCard('"+J(p.code)+"','"+J(p.mob)+"',"+p.di+")")+'</div>'; }).join('')+(D.ver.length>5?'<button type="button" class="nftt-more" onclick="_nfIbAll=!_nfIbAll;nfRenderInbox()">'+(_nfIbAll?'Show less':'Show all ('+D.ver.length+')')+'</button>':'')
    :'<div class="nfo-empty sm">✓ No cards waiting for your verification.</div>';
  if(D.champ.length) h+='<details class="nfib-ch"><summary>Verified by Quality Champions ('+D.champ.length+')</summary>'+D.champ.slice(0,30).map(function(p){
      return '<button type="button" class="nfib-row" onclick="scRvOpenCard(\''+J(p.code)+'\',\''+J(p.mob)+'\','+p.di+')"><b>'+scEsc(p.name)+'</b> · '+scEsc(p.role)+' · '+scEsc(p.fname)+' · Day '+(p.di+1)+'<span>✓ '+scEsc(p.rec.verifiedBy||'')+' · '+scEsc(p.rec.verifiedAt?scFmtDate(p.rec.verifiedAt):'')+'</span></button>'; }).join('')+'</details>';
  h+='</div>';
  box.innerHTML=h;
}
(function(){
  // menu: "Review inbox" replaces the old queue button (Supervisor, HealSol)
  var oItems=nfAdminItems;
  nfAdminItems=function(){ var L=oItems.apply(this,arguments);
    return L.map(function(it){ return it.v==='review'?{v:'inbox',l:'Review inbox',icon:'ti-inbox',onclick:"nfAdminView('inbox')",badge:nfInboxBadge()||''}:it; }); };
  var oApply=nfAdminApply;
  nfAdminApply=function(){ document.body.classList.toggle('nfv-inbox',_nfOv.view==='inbox'); return oApply.apply(this,arguments); };
  var oView=nfAdminView;
  nfAdminView=function(v){ var r=oView.apply(this,arguments); if(v==='inbox') nfRenderInbox(); return r; };
  var oOv=nfRenderOverview;
  nfRenderOverview=function(){ var r=oOv.apply(this,arguments); try{ if(nfAdminRole()&&_nfOv.view==='inbox') nfRenderInbox(); }catch(e){} return r; };
  // the card view: verification only, with a way into the facility's Review & Action Plan
  var oStaff=scVStaffHTML;
  scVStaffHTML=function(ctx,mob,di){ var h=oStaff.apply(this,arguments);
    if(!(appMode==='sc-admin'||(appMode==='sc-supervisor'&&!scIsDistrict()))||!ctx||!h) return h;
    return '<div class="nfib-link"><span>Actions and re-checks are handled in the facility\'s Review & Action Plan.</span><button type="button" class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="nfOpenReview(\''+scJs(ctx.code)+'\')"><i class="ti ti-arrow-right"></i> Open in Review & Action Plan</button></div>'+h; };
})();
