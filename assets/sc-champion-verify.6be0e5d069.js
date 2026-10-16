
// ══════════════════════════════════════════════════════════════
// QUALITY CHAMPION VERIFICATION
//  • The Quality Champion verifies the CHO and MO cards of their allotted facilities (replacing the
//    Supervisor), at any time, from a Review tab: every checkpoint with a Met item, one Verify per
//    checkpoint; any Met item can be marked Doubtful with a comment. Not-met items are view only.
//  • Doubts reach the Supervisor's Review & Action Plan as "Re-check suggested by Champion"
//    (sc_corrective status 'suggested'): request a re-check, assign an action, or accept.
//  • Verifying a checkpoint closes, automatically, the actions whose MoV item is now Met.
//  • Supervisor / HealSol: oversight (who verified what, when). They verify only where a facility has
//    no active Champion (fallback).
// ══════════════════════════════════════════════════════════════
var _scQvDoubts={};   // 'code|mob|di|ci' → {k: comment}  (pending until Verify)
var SC_QV_LABEL='Quality Champion';
function scFacChampions(code){
  var C=(_scq&&_scq.champions)||{};
  return Object.keys(C).filter(function(m){ var c=C[m]; return c&&!c.disabled&&c.facilities&&c.facilities[code]; }).map(function(m){ return {mob:m,name:C[m].name||m}; });
}
function scHasChampion(code){ return scFacChampions(code).length>0; }
function scQvIsOversight(code){ return (appMode==='sc-supervisor'||appMode==='sc-admin')&&scHasChampion(code); }
function scQvKey(code,mob,di,ci){ return code+'|'+mob+'|'+di+'|'+ci; }
function scQvHasMet(rec,cp,ci){
  var n=(cp.items||[]).length;
  if(n){ var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n); if(tk.some(function(x){ return x===0||x===1; })) return tk.indexOf(1)>=0; }
  var s=scNormScore((rec.cpScores||[])[ci]); return s!==null&&s>=1;
}
// ── context, rights and plan for the Champion ──────────────────
(function(){
  var oCan=scAdmCanVerify; scAdmCanVerify=function(){ if(appMode==='sc-champion') return true; return oCan.apply(this,arguments); };
  var oVis=scVisibleFacilityCodes; scVisibleFacilityCodes=function(){ if(appMode==='sc-champion') return Object.keys(_scq.facs||{}).filter(scqChampionCan); return oVis.apply(this,arguments); };
  var oCtx=scVCtx;
  scVCtx=function(code){
    if(appMode==='sc-champion'){
      if(!scqChampionCan(code)) return null;
      var f=_scq.facs[code]; if(!f) return null; if(!_scq.prog[code]) _scq.prog[code]={};
      return {code:code,progId:f.progId||'nqas_12A',roster:f.staff||{},progress:_scq.prog[code],facility:f,
        actor:{name:_scq.me.name||_scq.me.id,role:SC_QV_LABEL,label:SC_QV_LABEL,mob:_scq.me.id}};
    }
    return oCtx.apply(this,arguments);
  };
  var oMob=scVCanMob;
  scVCanMob=function(ctx,mob){
    if(ctx&&ctx.actor&&ctx.actor.label===SC_QV_LABEL){ var st=ctx.roster[mob]; return !!st&&!st.disabled&&['CHO','MO'].indexOf(st.role||'CHO')>=0; }
    return oMob.apply(this,arguments);
  };
  var oPlan=scVPlan;
  scVPlan=function(ctx,mob,di,rec){
    if(!(ctx&&ctx.actor&&ctx.actor.label===SC_QV_LABEL)) return oPlan.apply(this,arguments);
    var role=(ctx.roster[mob]||{}).role||'CHO', idx=scVIdx(ctx.progId,di,role), d=scDayDef(ctx.progId,di);
    idx=idx.filter(function(ci){ return scNormScore((rec.cpScores||[])[ci])!==null; });
    var req=idx.filter(function(ci){ return scQvHasMet(rec,d.cps[ci],ci); });
    return {idx:idx,required:req,optional:[],viewOnly:idx.filter(function(ci){ return req.indexOf(ci)<0; }),sampled:false,champion:true};
  };
  // Supervisor / HealSol verify only where there is no active Champion
  var oGuard=scVGuard;
  scVGuard=function(code){
    if(scQvIsOversight(code)){ showToast('These cards are verified by the Quality Champion ('+scFacChampions(code).map(function(c){ return c.name; }).join(', ')+'). You can view who verified what.','err'); return null; }
    return oGuard.apply(this,arguments);
  };
})();

// ── card view: doubts, view-only red items, oversight ──────────
var _scQvRO=false;
(function(){
  var oRow=scVCpRowHTML;
  scVCpRowHTML=function(ctx,mob,di,ci,rec,interactive,tag){
    var h=oRow.call(this,ctx,mob,di,ci,rec,_scQvRO?false:interactive,tag);
    try{
      var d=scDayDef(ctx.progId,di), cp=d&&d.cps&&d.cps[ci]; if(!cp) return h;
      var v=rec.cpVerify&&rec.cpVerify['c'+ci], doubts=(v&&v.doubts)||{}, champ=ctx.actor&&ctx.actor.label===SC_QV_LABEL;
      var pend=_scQvDoubts[scQvKey(ctx.code,mob,di,ci)]||{}, n=(cp.items||[]).length, extra='';
      if(n){
        var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n);
        // Champion: "Doubtful" on each Met item's own row, while the checkpoint is not yet verified
        if(champ&&interactive&&!scCpvValid(rec,ci)){
          var pos=0, out='';
          for(var k=0;k<n;k++){
            var st=h.indexOf('<div class="scrv-vt ',pos); if(st<0) break;
            var e1=h.indexOf('</div>',h.indexOf('<div>',st)), e2=h.indexOf('</div>',e1+6); if(e1<0||e2<0) break;
            var ctl='';
            if(tk[k]===1){ var c=pend[k];
              ctl=c?'<em class="scqv-em">⚠ Doubtful: '+scEsc(c)+'</em><button class="scx-linkbtn" onclick="scQvDoubt(\''+scJs(ctx.code)+'\',\''+scJs(mob)+'\','+di+','+ci+','+k+',true)">Remove</button>'
                   :'<button class="scx-btn sm ghost scqv-db" onclick="scQvDoubt(\''+scJs(ctx.code)+'\',\''+scJs(mob)+'\','+di+','+ci+','+k+')">⚠ Doubtful</button>'; }
            out+=h.slice(pos,e2)+ctl; pos=e2;
          }
          h=out+h.slice(pos);
        }
        Object.keys(doubts).forEach(function(k){ extra+='<div class="scqv-dd">⚠ Doubtful — item '+(+k+1)+': '+scEsc(doubts[k])+' <span>('+scEsc(v.by||'')+', '+scEsc(v.at?scFmtDate(v.at):'')+')</span></div>'; });
      }
      if(extra){ var i=h.indexOf('<div class="scx-cpv-'); if(i<0) i=h.lastIndexOf('</div></div>'); if(i<0) return h+extra; h=h.slice(0,i)+'<div class="scqv-box">'+extra+'</div>'+h.slice(i); }
    }catch(e){ console.warn(e); }
    return h;
  };
  var oStaff=scVStaffHTML;
  scVStaffHTML=function(ctx,mob,di){
    var ro=ctx&&scQvIsOversight(ctx.code); _scQvRO=ro;
    var h; try{ h=oStaff.apply(this,arguments); } finally { _scQvRO=false; }
    try{
      var rec=scVRec(ctx,mob,di); if(!h||!rec) return h;
      var plan=scVPlan(ctx,mob,di,rec);
      if(plan.champion&&!rec.verified){
        if(plan.viewOnly&&plan.viewOnly.length){ var fin=h.indexOf('<div class="scx-cpv-final">');
          var blk='<details class="scx-vopt" open><summary>'+plan.viewOnly.length+' not-met checkpoint'+(plan.viewOnly.length===1?'':'s')+' — view only (the Supervisor assigns actions)</summary>'
            +plan.viewOnly.map(function(ci){ return scVCpRowHTML(ctx,mob,di,ci,rec,false); }).join('')+'</details>';
          h=fin>=0?h.slice(0,fin)+blk+h.slice(fin):h+blk; }
        h=h.replace(/<div class="scx-vsample">[\s\S]*?<\/div>/,'').replace('<div class="scx-vp-meta" style="margin:3px 0 4px;">','<div class="scqv-intro">Verify every checkpoint with a Met item — one Verify confirms all its Met items. Mark any item you doubt as Doubtful; the Supervisor decides on it.</div><div class="scx-vp-meta" style="margin:3px 0 4px;">');
      }
      if(ro){
        var champs=scFacChampions(ctx.code).map(function(c){ return c.name; }).join(', ');
        h=h.replace(/<textarea class="scx-vp-ta"[^>]*><\/textarea>/,'').replace(/<div class="scx-vp-acts">[\s\S]*?<\/div>/,'<div class="scqv-ro"><i class="ti ti-eye"></i> View only — this facility\'s cards are verified by its Quality Champion ('+scEsc(champs)+').</div>');
        if(rec.verified){ // which checkpoints were verified, by whom, when
          var vs=Object.keys(rec.cpVerify||{}).map(function(k){ return +k.slice(1); }).sort(function(a,b){ return a-b; });
          if(vs.length) h+='<details class="scx-vopt" open><summary>'+vs.length+' checkpoint'+(vs.length===1?'':'s')+' verified — by whom and when</summary>'+vs.map(function(ci){ return scVCpRowHTML(ctx,mob,di,ci,rec,false); }).join('')+'</details>';
        }
      }
    }catch(e){ console.warn('[SC] champion card view',e); }
    return h;
  };
  // queue (list view): Champion wording; oversight shows who verifies and the cards already verified
  var oV=scAdmVRender;
  scAdmVRender=function(){
    var r=oV.apply(this,arguments);
    try{
      var ov=document.getElementById('scx-adm-vov'); if(!ov||_scAdmV.mode!=='list') return r;
      if(appMode==='sc-champion'){ var sub=ov.querySelector('.scx-title div'); if(sub) sub.textContent='CHO & MO cards of your facilities · verify every checkpoint with a Met item · not-met items are view only'; return r; }
      ov.querySelectorAll('.scx-vfac').forEach(function(g){ var hd=g.querySelector('.scx-vfac-hd span'); if(!hd) return;
        var code=(/^([^ ]+)/.exec(hd.textContent)||[])[1]; var ch=code?scFacChampions(code):[]; if(ch.length) hd.insertAdjacentHTML('beforeend',' · <b>verified by Quality Champion: '+scEsc(ch.map(function(c){ return c.name; }).join(', '))+'</b>'); });
      var done=[], body=ov.querySelector('.scx-body')||ov.querySelector('.scx-box');
      scVisibleFacilityCodes().forEach(function(code){ if(!scHasChampion(code)) return; var ctx=scVCtx(code); if(!ctx) return;
        Object.keys(ctx.progress||{}).forEach(function(mob){ Object.keys(ctx.progress[mob]||{}).forEach(function(k){ var m=/^day_(\d+)$/.exec(k); if(!m) return; var rec=ctx.progress[mob][k];
          if(rec&&rec.verified&&rec.verifiedByRole===SC_QV_LABEL) done.push({code:code,mob:mob,di:+m[1],rec:rec,name:(ctx.roster[mob]||{}).name||mob,role:(ctx.roster[mob]||{}).role||'CHO'}); }); }); });
      if(done.length&&body){ done.sort(function(a,b){ return String(b.rec.verifiedAt||'').localeCompare(String(a.rec.verifiedAt||'')); });
        body.insertAdjacentHTML('beforeend','<div class="scx-sub" style="margin-top:14px;">Verified by Quality Champions ('+done.length+')</div>'+done.slice(0,40).map(function(p){ var f=(scMasterFacilities||{})[p.code]||{};
          return '<div class="scx-vq-item" onclick="scAdmOpenCard(\''+scJs(p.code)+'\',\''+scJs(p.mob)+'\','+p.di+')"><div class="scx-vq-day"><small>DAY</small>'+String(p.di+1).padStart(2,'0')+'</div>'
            +'<div style="flex:1;min-width:0;"><div style="font-weight:800;font-size:12.5px;color:var(--t1);">'+scEsc(p.name)+' <span style="color:var(--t3);font-weight:700;">· '+scEsc(p.role)+' · '+scEsc(f.name||p.code)+'</span></div>'
            +'<div style="font-size:11px;color:#15803D;font-weight:700;">✓ Verified by '+scEsc(p.rec.verifiedBy||'')+' (Quality Champion) · '+scEsc(p.rec.verifiedAt?scFmtDate(p.rec.verifiedAt):'')+' · '+Object.keys(p.rec.cpVerify||{}).length+' checkpoints</div></div><i class="ti ti-chevron-right" style="color:#93C5FD;"></i></div>'; }).join('')); }
    }catch(e){ console.warn(e); }
    return r;
  };
  var oOpen=scAdmOpenVerify;
  scAdmOpenVerify=async function(){
    if(appMode==='sc-supervisor'||appMode==='sc-admin'){ try{ await scqLoadChampions(); }catch(e){} }
    if(appMode==='sc-champion'){ scMasterFacilities=_scq.facs; scMasterProgress=_scq.prog; }
    return oOpen.apply(this,arguments);
  };
})();
async function scQvDoubt(code,mob,di,ci,k,remove){
  var key=scQvKey(code,mob,di,ci), m=_scQvDoubts[key]||(_scQvDoubts[key]={});
  if(remove){ delete m[k]; }
  else {
    var v=await scDialog({title:'Doubtful MoV item',icon:'⚠️',fields:[{key:'c',label:'What is doubtful? (the Supervisor will see this)',type:'textarea',required:true,placeholder:'e.g. Register shows only 2 of the last 3 months'}]});
    if(!v) return; m[k]=v.c.trim();
  }
  scAdmVRender();
}
// ── on Verify (Champion): save doubts, suggest re-checks, close fixed actions ──
(function(){
  var oVer=scVerifyCp;
  scVerifyCp=async function(code,mob,di,ci){
    var ctx=scVCtx(code), champ=ctx&&ctx.actor&&ctx.actor.label===SC_QV_LABEL;
    var r=await oVer.apply(this,arguments);
    if(!champ) return r;
    try{
      var rec=scVRec(ctx,mob,di), v=rec&&rec.cpVerify&&rec.cpVerify['c'+ci]; if(!v||v.byMob!==ctx.actor.mob) return r;
      var key=scQvKey(code,mob,di,ci), doubts=_scQvDoubts[key]||{}, d=scDayDef(ctx.progId,di), cp=d.cps[ci], st=ctx.roster[mob]||{};
      var now=scNowIso(), upd={};
      if(Object.keys(doubts).length){
        await db.ref(scProgressPath(code,mob,di)+'/cpVerify/c'+ci+'/doubts').set(doubts); v.doubts=doubts;
        Object.keys(doubts).forEach(function(k){ upd[scUid('sg')]=scClean({status:'suggested',source:'champion-doubt',cpId:cp.id,item:+k,itemText:((cp.items||[])[+k]||{}).t||'',comment:doubts[k],
          ownerMob:mob,ownerName:st.name||mob,di:di,ci:ci,progId:ctx.progId,cpText:cp.t,aoc:cp.aoc,me:cp.me,std:cp.std,service:cp.svc,
          suggestedBy:ctx.actor.name,suggestedById:ctx.actor.mob,suggestedAt:now}); });
      }
      // actions on items that are now Met (and not doubted) close automatically
      var acts=await fbGet('sc_corrective/'+code)||{}, n=(cp.items||[]).length, tk=n?scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n):[], s=scNormScore((rec.cpScores||[])[ci]), closed=0;
      Object.keys(acts).forEach(function(id){ var a=acts[id];
        if(!a||a.cpId!==cp.id||['closed','draft','suggested','accepted','resolved'].indexOf(a.status)>=0) return;
        if(a.ownerMob!==mob&&a.assignedTo!==mob) return;
        var met=(a.item!=null&&n)?(tk[a.item]===1&&doubts[a.item]===undefined):s===2;
        if(!met) return;
        upd[id+'/status']='closed'; upd[id+'/closedAt']=now; upd[id+'/closedBy']=ctx.actor.name; upd[id+'/closedByRole']=SC_QV_LABEL; upd[id+'/closedVia']='verification'; upd[id+'/closedOnDay']=di+1; closed++; });
      if(Object.keys(upd).length) await db.ref('sc_corrective/'+code).update(upd);
      delete _scQvDoubts[key];
      if(closed) showToast(closed+' action'+(closed===1?'':'s')+' closed — the MoV item'+(closed===1?' is':'s are')+' now Met.','ok');
      if(Object.keys(doubts).length) showToast(Object.keys(doubts).length+' doubtful item'+(Object.keys(doubts).length===1?'':'s')+' sent to the Supervisor.','ok');
      scAdmVRender();
    }catch(e){ console.warn('[SC] champion verify follow-up',e); }
    return r;
  };
})();

// ── Champion portal: Review button ─────────────────────────────
function scqReviewCount(){ var n=0; Object.keys(_scq.facs||{}).forEach(function(code){ if(scqChampionCan(code)) n+=scVPending(scVCtx(code)).length; }); return n; }
async function scqOpenReview(){ if(appMode!=='sc-champion') return; await scAdmOpenVerify(); }
(function(){
  var oApp=scqRenderChampionApp;
  scqRenderChampionApp=function(){
    var r=oApp.apply(this,arguments);
    try{ var app=document.getElementById('scq-app'); if(!app||app.querySelector('#scqv-btn')) return r;
      var ref=[].slice.call(app.querySelectorAll('button')).find(function(b){ return /Refresh/.test(b.textContent); });
      var n=scqReviewCount(), b=document.createElement('button'); b.id='scqv-btn'; b.className=ref?ref.className:'scx-btn sm';
      b.innerHTML='<i class="ti ti-shield-check"></i> Review'+(n?' <span class="scqv-badge">'+n+'</span>':''); b.onclick=scqOpenReview;
      if(ref) ref.parentNode.insertBefore(b,ref); else app.insertBefore(b,app.firstChild);
      var tiles=app.querySelector('.scx-tiles'); if(tiles&&!tiles.querySelector('.scqv-tile')) tiles.insertAdjacentHTML('afterbegin','<div class="scx-tile scqv-tile" onclick="scqOpenReview()" style="cursor:pointer;"><div class="scx-tile-v" style="color:'+(n?'var(--amber-dk)':'')+';">'+n+'</div><div class="scx-tile-l">Cards to verify</div></div>');
    }catch(e){ console.warn(e); }
    return r;
  };
})();

// ── Supervisor: "Re-check suggested by Champion" in Review & Action Plan ──
(function(){
  var oList=scRvList;
  scRvList=function(acts){ return oList.apply(this,arguments).filter(function(a){ return ['suggested','accepted','resolved'].indexOf(a.status)<0; }); };
  var oLoad=scLoadMyActions;
  scLoadMyActions=async function(){ var r=await oLoad.apply(this,arguments); Object.keys(_scAllActions||{}).forEach(function(k){ if(['suggested','accepted','resolved'].indexOf((_scAllActions[k]||{}).status)>=0) delete _scAllActions[k]; }); return r; };
  var oRev=scRvReviewHTML;
  scRvReviewHTML=function(st){
    var h=oRev.apply(this,arguments);
    try{
      var sg=Object.keys(st.actions||{}).map(function(id){ return Object.assign({id:id},st.actions[id]); }).filter(function(a){ return a.status==='suggested'; });
      if(!sg.length) return h;
      var can=scRvCanAssign(st.code), H=scJs(st.hostId);
      var blk='<div class="scx-sub">Re-check suggested by Champion ('+sg.length+')</div>'+sg.map(function(a){ var I=scJs(a.id);
        return '<div class="scrv-act scrv-awaiting"><div class="scrv-act-top"><span class="scrv-chip" style="color:#9A3412;background:#FFEDD5;">Re-check suggested by Champion</span><span class="scq-muted">'+scEsc(a.cpId)+' · '+scEsc(a.me||'')+' · '+scEsc(a.ownerName||'')+' · Day '+(a.di+1)+'</span></div>'
          +'<div class="scrv-cp">'+scEsc(a.cpText||'')+'</div>'+(a.itemText?'<div class="scrv-item" style="color:#92400E;">MoV marked Met: '+scEsc(a.itemText)+'</div>':'')
          +'<div class="scrv-note bad">⚠ '+scEsc(a.comment||'')+' — '+scEsc(a.suggestedBy||'')+', '+scEsc(a.suggestedAt?scFmtDate(a.suggestedAt):'')+'</div>'
          +(can?'<div class="scrv-btns"><button class="scx-btn sm" onclick="scQvDecide(\''+H+'\',\''+I+'\',\'recheck\')">Request re-check</button><button class="scx-btn sm" onclick="scQvDecide(\''+H+'\',\''+I+'\',\'action\')">Assign action</button><button class="scx-btn sm ghost" onclick="scQvDecide(\''+H+'\',\''+I+'\',\'accept\')">Accept (keep as Met)</button></div>':'')+'</div>'; }).join('');
      var i=h.indexOf('<div class="scx-sub">'); return i>=0?h.slice(0,i)+blk+h.slice(i):h+blk;
    }catch(e){ return h; }
  };
})();
async function scQvDecide(hostId,id,what){
  var st=_scIns[hostId]; if(!st||!scRvCanAssign(st.code)) return;
  var a=(st.actions||{})[id]; if(!a) return;
  var before=Object.keys(st.actions||{}).length;
  if(what==='recheck') await scRvRecheck(hostId,a.cpId,a.item,a.ownerMob);
  else if(what==='action') await scRvAssign(hostId,a.cpId,a.item,a.ownerMob);
  else if(!(await showConfirm('Accept the Met answer and close this suggestion?','✅','Accept','Accept','var(--teal)'))) return;
  st=_scIns[hostId]; if(what!=='accept'&&Object.keys(st.actions||{}).length===before) return;   // dialog cancelled
  await scRvUpdate(st.code,id,{status:what==='accept'?'accepted':'resolved',resolution:what,decidedBy:scActor().name,decidedAt:scNowIso()});
  showToast(what==='accept'?'Accepted — the item stays Met.':'Suggestion handled.','ok'); await scRvRefresh(hostId);
}
(function(){
  var oLoad=scLoadMasterData;
  scLoadMasterData=async function(){ var r=await oLoad.apply(this,arguments); if(appMode==='sc-supervisor'||appMode==='sc-admin'){ try{ await scqLoadChampions(); }catch(e){} } return r; };
})();
