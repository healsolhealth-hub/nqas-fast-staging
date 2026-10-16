
// ══════════════════════════════════════════════════════════════
// STEP B — PER-CHECKPOINT PROGRESS
//  • Staff answer each MoV item Met / Not met; the score follows the agreed rule:
//      all met = Full (2) · 50–99% = Partial (1) · below 50% = Non (0) · one item: met = Full, not met = Non
//  • Day record keeps the ticks (cpTicks.c{ci} = "1-0…", 1 met · 0 not met · - unanswered)
//  • History per checkpoint: sc_cpprog/{code}/{mob}/{cpId} =
//      {score, ticks, n, at, di, kind, by, role, hist:{key:{score,ticks,at,di,kind,by}}}
//    kind: assessment (first appearance) · recheck (2nd) · revision (3rd) · reassess (gap re-attempt) · direct
//  • Facility score of a checkpoint = lowest latest score among the staff who own it
//  • HealSol can reset progress per facility; a facility progressEpoch makes phones drop old cards
// ══════════════════════════════════════════════════════════════
Object.assign(HINDI_UI,{'Met':'पूरा','Not met':'पूरा नहीं','answered':'उत्तर दिए','Answer every item to get the score':'स्कोर पाने के लिए हर बात का उत्तर दें',
  'checkpoints still need an answer':'चेकपॉइंट का उत्तर अभी बाकी है','Tick the items that are now met':'जो बातें अब पूरी हैं उन्हें चुनें',
  'Score':'स्कोर','Full':'पूर्ण','Partial':'आंशिक','Non':'शून्य','of':'में से','met':'पूरी','Use the items below to score this checkpoint.':'इस चेकपॉइंट को स्कोर करने के लिए नीचे की बातें चुनें।'});

// ── the rule ───────────────────────────────────────────────────
function scMovScore(ticks){
  if(!ticks||!ticks.length) return null;
  if(ticks.some(function(x){ return x!==0&&x!==1; })) return null;
  var met=ticks.filter(function(x){ return x===1; }).length, n=ticks.length;
  if(met===n) return 2;
  return met*2>=n?1:0;
}
function scTicksToStr(t){ return (t||[]).map(function(x){ return x===1?'1':x===0?'0':'-'; }).join(''); }
function scTicksFromStr(s,n){ var a=String(s||'').split('').map(function(ch){ return ch==='1'?1:ch==='0'?0:null; }); while(a.length<(n||0)) a.push(null); return n?a.slice(0,n):a; }
function scCpItemsAt(di,ci){ var d=getDay(di), cp=d&&d.cps&&d.cps[ci]; return (cp&&cp.items)||[]; }
function scTicksFor(c,ci,n){
  var t=(c.cpTicks||{})[ci]; if(Array.isArray(t)) t=t.slice(); else t=scTicksFromStr(t,n);
  while(t.length<n) t.push(null); return t.slice(0,n);
}
function scScoreLabel(s){ return s===2?t('Full'):s===1?t('Partial'):s===0?t('Non'):''; }

// ── which assessment is this? (first appearance / re-check / revision) ──
function scCpKind(cpId,di){
  var pk=scPkgCode(choState.progId), days=scCpmUsage(cpId).filter(function(u){ return u.pkg===pk; }).map(function(u){ return u.day-1; }).sort(function(a,b){ return a-b; });
  var i=days.indexOf(di); return ['assessment','recheck','revision'][i]||'assessment';
}

// ── history: queued with the normal sync, written to sc_cpprog ──
var _scCpPending={};
function scCpRecord(di,ci,kindOverride,extra){
  var d=getDay(di), cp=d&&d.cps&&d.cps[ci]; if(!cp||!cp.id||!choState.facilityCode||!choState.staffMobile) return;
  var c=getCHOCard(di), n=(cp.items||[]).length, s=scNormScore((c.cpScores||[])[ci]);
  var kind=kindOverride||(n?scCpKind(cp.id,di):'direct');
  if(!n&&!kindOverride) kind=scCpKind(cp.id,di);
  var now=scNowIso(), ticks=n?scTicksToStr(scTicksFor(c,ci,n)):'';
  var entry=scClean(Object.assign({score:s===null?-1:s,ticks:ticks,at:now,di:di,kind:kind,by:choState.staffName||choState.staffMobile},extra||{}));
  var key=kind==='reassess'?('r'+Date.now()):('d'+di+'_'+kind);
  var p=_scCpPending[cp.id]||{hist:{}};
  Object.assign(p,{score:s===null?-1:s,ticks:ticks,n:n,at:now,di:di,kind:kind,by:entry.by,role:choState.roleId||''});
  p.hist[key]=entry; _scCpPending[cp.id]=p;
}
async function scCpFlush(){
  if(!db||!choState.facilityCode||!choState.staffMobile) return;
  var ids=Object.keys(_scCpPending); if(!ids.length) return;
  var base='sc_cpprog/'+choState.facilityCode+'/'+choState.staffMobile+'/';
  for(var i=0;i<ids.length;i++){
    var id=ids[i], p=_scCpPending[id], upd={};
    ['score','ticks','n','at','di','kind','by','role'].forEach(function(k){ upd[k]=p[k]; });
    Object.keys(p.hist).forEach(function(k){ upd['hist/'+k]=p.hist[k]; });
    try{ await db.ref(base+id).update(scClean(upd)); if(_scCpPending[id]===p) delete _scCpPending[id]; }catch(e){ console.warn('[SC] checkpoint history sync failed',e); return; }
  }
}

// ── read side (used by dashboards in Step C) ───────────────────
async function scCpLoadFacility(code){ return await fbGet('sc_cpprog/'+code)||{}; }
function scCpHistList(rec){ return Object.keys((rec&&rec.hist)||{}).map(function(k){ return rec.hist[k]; }).sort(function(a,b){ return String(a.at).localeCompare(String(b.at)); }); }
function scCpBaseline(rec){ var h=scCpHistList(rec).filter(function(x){ return x.score>=0; }); return h.length?h[0]:null; }
// owners: roster members whose role scores this checkpoint (General = CHO/ANM/ASHA/MPW; CHO fallback when the role is absent)
function scCpOwners(cp,roster){
  var present=scRolesFromRoster(roster||{});
  return Object.keys(roster||{}).filter(function(m){ var s=roster[m]; if(!s||s.disabled) return false; var r=s.role||'CHO';
    return scCpForRoleIn(cp,r,present); });
}
function scCpForRoleIn(cp,role,present){
  var rs=scCpRoles(cp);
  if(rs.indexOf(role)>=0) return true;
  if(rs.indexOf('General')>=0&&['CHO','ANM','ASHA','MPW'].indexOf(role)>=0) return true;
  return role==='CHO'&&scCpFallbackToCho(cp,present);
}
// Facility score for one checkpoint: lowest latest score among owners who have scored it, with who gave what
function scCpFacilityScore(cpId,data,roster){
  var cp=scCpmGet(cpId); if(!cp) return null;
  var owners=scCpOwners(cp,roster), by=[];
  owners.forEach(function(m){ var r=((data||{})[m]||{})[cpId]; var st=roster[m]||{};
    by.push({mob:m,name:st.name||m,role:st.role||'CHO',score:(r&&r.score>=0)?r.score:null,at:r&&r.at||'',ticks:r&&r.ticks||''}); });
  var scored=by.filter(function(x){ return x.score!==null; });
  var min=scored.length?Math.min.apply(null,scored.map(function(x){ return x.score; })):null;
  return {id:cpId,score:min,owners:owners.length,scored:scored.length,by:by,lowest:scored.filter(function(x){ return x.score===min; })};
}

// ══════════════════════════════════════════════════════════════
// DAY CARD — Met / Not met for each item
// ══════════════════════════════════════════════════════════════
function scTicksHTML(di,ci,cp,c,editable){
  var items=cp.items||[], n=items.length, tk=scTicksFor(c,ci,n), s=scMovScore(tk), hi=_appLang==='hi';
  var answered=tk.filter(function(x){ return x===0||x===1; }).length, met=tk.filter(function(x){ return x===1; }).length;
  var rows=items.map(function(it,k){
    var v=tk[k];
    return '<div class="scmt-row'+(v===1?' met':v===0?' not':'')+'"><div class="scmt-t"><span class="scmt-n">'+(k+1)+'</span>'+scEsc(hi&&it.h?it.h:it.t)+'</div>'
      +(editable?'<div class="scmt-b"><button type="button" class="scmt-btn y'+(v===1?' on':'')+'" onclick="event.stopPropagation();tickCP('+di+','+ci+','+k+',1)">✓ '+scEsc(t('Met'))+'</button>'
        +'<button type="button" class="scmt-btn n'+(v===0?' on':'')+'" onclick="event.stopPropagation();tickCP('+di+','+ci+','+k+',0)">✗ '+scEsc(t('Not met'))+'</button></div>'
        :'<div class="scmt-ro">'+(v===1?'✓ '+scEsc(t('Met')):v===0?'✗ '+scEsc(t('Not met')):'—')+'</div>')+'</div>';
  }).join('');
  var sum='<div class="scmt-sum s'+(s===null?'n':s)+'">'+(s===null
      ?scEsc(answered+'/'+n+' '+t('answered'))+(editable?' · '+scEsc(t('Answer every item to get the score')):'')
      :'<b>'+scEsc(t('Score'))+': '+scEsc(scScoreLabel(s))+' ('+s+')</b> · '+(hi?(n+' में से '+met+' पूरी'):(met+' of '+n+' met')))+'</div>';
  return '<div class="scmt" onclick="event.stopPropagation()">'+rows+sum+'</div>';
}
function tickCP(di,ci,k,val){
  if(!scDayUnlocked(di)){ showToast(t('This card is not open yet.'),'err'); return; }
  var c=getCHOCard(di); if(c.taskDone) return;
  if(!scMyCp(di,ci)){ showToast(t('This checkpoint is assigned to other staff.'),'err'); return; }
  var items=scCpItemsAt(di,ci), n=items.length; if(!n||k<0||k>=n) return;
  var tk=scTicksFor(c,ci,n); tk[k]=(tk[k]===val)?null:val;
  if(!c.cpTicks) c.cpTicks={}; c.cpTicks[ci]=tk;
  c.cpScores[ci]=scMovScore(tk); c.updatedAt=scNowIso();
  scCpRecord(di,ci);
  saveCHOState(); renderCard(di);
}
(function(){
  // replace the Full/Half/Zero row with the items for MoV checkpoints
  var oItem=cpItemHTML;
  cpItemHTML=function(di,ci,cp,d,c,isLocked){
    var h=oItem.apply(this,arguments), n=(cp&&cp.items||[]).length;
    if(!n) return h;
    var editable=!isLocked&&!c.taskDone&&scMyCp(di,ci);
    var block=(editable||((c.cpTicks||{})[ci]&&scMyCp(di,ci)))?scTicksHTML(di,ci,cp,c,editable):'';
    if(/<div class="cp-score-row">[\s\S]*?<\/div>/.test(h)) h=h.replace(/<div class="cp-score-row">[\s\S]*?<\/div>/,block);
    else if(block){ var i=h.lastIndexOf('</div>'); h=h.slice(0,i)+block+h.slice(i); }
    return h;
  };
  // MoV checkpoints are scored only through their items
  var oSet=setCP;
  setCP=function(di,ci,val){
    if(scCpItemsAt(di,ci).length){ showToast(t('Use the items below to score this checkpoint.'),'err'); return; }
    var r=oSet.apply(this,arguments); try{ scCpRecord(di,ci); }catch(e){} return r;
  };
  var oCycle=cycleCP;
  cycleCP=function(di,ci){ if(scCpItemsAt(di,ci).length) return; var r=oCycle.apply(this,arguments); try{ scCpRecord(di,ci); }catch(e){} return r; };
  // Mark Done: every own checkpoint must be answered — nothing defaults to Full any more
  var oDone=markDone;
  markDone=function(di){
    var c=getCHOCard(di); if(c.taskDone) return oDone.apply(this,arguments);
    var open=scMyCpIdx(di).filter(function(ci){ return scNormScore((c.cpScores||[])[ci])===null; });
    if(open.length){ showToast(open.length+' '+t('checkpoints still need an answer'),'err');
      try{ var el=document.getElementById('cp-'+di+'-'+open[0]); if(el&&el.scrollIntoView) el.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){}
      return; }
    var r=oDone.apply(this,arguments);
    try{ if(getCHOCard(di).taskDone) scMyCpIdx(di).forEach(function(ci){ scCpRecord(di,ci); }); saveCHOState(); }catch(e){}
    return r;
  };
  // Gap re-attempt: re-tick the items
  var oRetry=gapRetry;
  gapRetry=async function(di,ci){
    var items=scCpItemsAt(di,ci); if(!items.length){ var r0=await oRetry.apply(this,arguments); try{ scCpRecord(di,ci,'reassess'); }catch(e){} return r0; }
    var c=getCHOCard(di), d=getDay(di), cp=d.cps[ci];
    if(!cp||!c.taskDone) return;
    if(!scMyCp(di,ci)){ showToast(t('This checkpoint is assigned to other staff.'),'err'); return; }
    var cur=scNormScore(c.cpScores[ci]); if(cur===2) return;
    var hi=_appLang==='hi', tk=scTicksFor(c,ci,items.length), act=scMyActionFor(di,ci);
    var v=await scDialog({title:t('Re-attempt')+' — Day '+(di+1),icon:'🔁',
      message:getCPText(cp)+(act?'\n\n📌 '+act.action:'')+'\n\n'+t('Tick the items that are now met')+'. The gap closes only when every item is met.',
      fields:[{key:'met',label:t('Tick the items that are now met'),type:'checklist',value:items.map(function(_,k){ return tk[k]===1?String(k):null; }).filter(function(x){ return x!==null; }),
        options:items.map(function(it,k){ return {value:String(k),label:(k+1)+'. '+(hi&&it.h?it.h:it.t)}; })}]});
    if(!v) return;
    var nt=items.map(function(_,k){ return v.met.indexOf(String(k))>=0?1:0; }), s=scMovScore(nt);
    if(!c.gapRetries) c.gapRetries={};
    var gr=c.gapRetries[ci]||{orig:cur,attempts:[]}; if(!Array.isArray(gr.attempts)) gr.attempts=scAsList(gr.attempts); if(gr.orig==null) gr.orig=cur;
    var now=scNowIso(); gr.attempts.push({score:s,ticks:scTicksToStr(nt),at:now,by:choState.staffName||choState.staffMobile}); gr.score=s; gr.lastAt=now;
    if(!c.cpTicks) c.cpTicks={};
    if(s===2){
      gr.closed=true; gr.closedAt=now; gr.verified=true; c.cpTicks[ci]=nt; c.cpScores[ci]=2; c.gapRetries[ci]=gr; c.score=getDayScore(di);
      await scCloseActionsForGap(di,ci); showToast('Gap closed — every item is met ✓','ok'); try{ launchConfetti(); }catch(e){}
    } else {
      c.gapRetries[ci]=gr;
      showToast('Re-attempt recorded ('+nt.filter(function(x){ return x===1; }).length+' of '+nt.length+' met — '+scScoreLabel(s)+'). The gap stays open until every item is met.','');
    }
    c.updatedAt=now;
    scCpRecord(di,ci,'reassess',{ticks:scTicksToStr(nt),score:s});
    saveCHOState(); buildDaySelector(); renderCard(di); if(choState.view==='board') buildBoard();
  };
  // ticks travel with the day record; history flushes with every sync
  var oFrom=scCardFromRecord;
  scCardFromRecord=function(rec,n){
    var c=oFrom.apply(this,arguments), t0=(rec&&rec.cpTicks)||{}; c.cpTicks={};
    Object.keys(t0).forEach(function(k){ var m=/^c(\d+)$/.exec(k); if(m) c.cpTicks[+m[1]]=scTicksFromStr(t0[k]); });
    return c;
  };
  var oSync=scSyncProgress;
  scSyncProgress=async function(di){
    var ok=await oSync.apply(this,arguments);
    if(ok){ var c=choState.cards[di]; if(c&&c.cpTicks&&Object.keys(c.cpTicks).length){
      var tk={}; Object.keys(c.cpTicks).forEach(function(k){ if(c.cpTicks[k]) tk['c'+k]=scTicksToStr(c.cpTicks[k]); });
      try{ await db.ref(scProgressPath(choState.facilityCode,choState.staffMobile,di)+'/cpTicks').set(tk); }catch(e){ return false; } } }
    return ok;
  };
  var oFlush=scFlushSync;
  scFlushSync=async function(){ var r=await oFlush.apply(this,arguments); try{ await scCpFlush(); }catch(e){} return r; };
  // Clean start after a HealSol reset: drop cards saved on this phone before the reset
  var oStart=scStartApp;
  scStartApp=async function(){
    try{
      if(choState.facilityCode&&choState.staffMobile){
        var ep=await fbGet(scFacilityPath(choState.facilityCode)+'/progressEpoch');
        var key='sc_epoch_'+choState.facilityCode+'_'+choState.staffMobile, mine=localStorage.getItem(key);
        if(ep&&mine!==String(ep)){
          try{ localStorage.removeItem(getChoStateKey()); }catch(e){}
          choState.cards={}; choState.streak=0; _scCpPending={};
          localStorage.setItem(key,String(ep));
        } else if(!ep&&mine===null){ localStorage.setItem(key,'0'); }
      }
    }catch(e){ console.warn(e); }
    return oStart.apply(this,arguments);
  };
})();

// ══════════════════════════════════════════════════════════════
// HEALSOL — reset progress (test & demo data)
// ══════════════════════════════════════════════════════════════
async function scResetProgress(){
  if(appMode!=='sc-admin'){ showToast('Only HealSol Admin can reset progress.','err'); return; }
  var opts=_scFacilityOptions();
  if(!opts.length){ await scAlert('No facilities enrolled.','Reset progress','ℹ️'); return; }
  var v=await scDialog({title:'Reset progress',icon:'🧹',wide:true,okLabel:'Reset now',okColor:'var(--red)',
    message:'Deletes the scores, MoV ticks, checkpoint history and verifications of the chosen facilities. Facilities, staff, logins and the Checkpoint Master are kept. Phones that still hold old cards clear them at their next login.',
    fields:[
      {key:'codes',label:'Facilities',type:'checklist',value:opts.map(function(o){ return o.value; }),options:opts},
      {key:'also',label:'Also delete',type:'checklist',value:['actions','sessions'],options:[{value:'actions',label:'Corrective actions (Gap Register)'},{value:'sessions',label:'Peer review sessions of these facilities'}]},
      {key:'confirm',label:'Type RESET to confirm',required:true,placeholder:'RESET'}
    ],
    validate:function(v){ if(!v.codes.length) return 'Choose at least one facility.'; if(String(v.confirm).trim()!=='RESET') return 'Type RESET (capital letters) to confirm.'; return null; }});
  if(!v) return;
  var epoch=Date.now(), sess={}, n=0;
  if(v.also.indexOf('sessions')>=0){ try{ sess=await fbGet('sc_review_sessions')||{}; }catch(e){} }
  for(var i=0;i<v.codes.length;i++){
    var code=v.codes[i];
    try{
      await db.ref('sc_progress/'+code).remove();
      await db.ref('sc_cpprog/'+code).remove();
      if(v.also.indexOf('actions')>=0) await db.ref('sc_corrective/'+code).remove();
      if(v.also.indexOf('sessions')>=0){ var ids=Object.keys(sess).filter(function(id){ return sess[id]&&sess[id].code===code; });
        for(var j=0;j<ids.length;j++) await db.ref('sc_review_sessions/'+ids[j]).remove(); }
      await fbSet(scFacilityPath(code)+'/progressEpoch',epoch);
      n++;
    }catch(e){ console.warn('[SC] reset failed for',code,e); }
  }
  await fbSet('shared/progress_reset',{at:scNowIso(),by:'HealSol Admin',facilities:v.codes.length,epoch:epoch});
  showToast('Progress reset for '+n+' facilit'+(n===1?'y':'ies')+'.','ok');
  try{ await scLoadMasterData(); scRenderMasterDashboard(); }catch(e){}
}
function scResetEnsureButton(){
  if(appMode!=='sc-admin') return;
  var host=document.getElementById('scq-champ-panel')||document.getElementById('sc-sup-list'); if(!host) return;
  if(document.getElementById('scb-reset-panel')) return;
  var el=document.createElement('div'); el.id='scb-reset-panel'; el.className='hs-only';
  el.style.cssText='background:var(--bgc);border-radius:14px;border:1px solid #FECACA;padding:14px 16px;margin-bottom:14px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;';
  el.innerHTML='<div style="flex:1;min-width:220px;"><div style="font-size:13px;font-weight:800;color:var(--t1);font-family:\'Poppins\',sans-serif;"><i class="ti ti-eraser" style="color:#DC2626;"></i> Progress data</div>'
    +'<div style="font-size:11px;color:var(--t3);">Reset scores, MoV ticks, history and verifications — e.g. to clear test data before the pilot.</div></div>'
    +'<button class="scx-btn sm danger" style="flex:0 0 auto;" onclick="scResetProgress()"><i class="ti ti-eraser"></i> Reset progress…</button>';
  var anchor=host.closest('.hs-only')||host.parentNode; anchor.parentNode.insertBefore(el,anchor.nextSibling);
}
(function(){
  var oDash=scRenderMasterDashboard;
  scRenderMasterDashboard=function(){ var r=oDash.apply(this,arguments); try{ scResetEnsureButton(); }catch(e){} return r; };
})();
