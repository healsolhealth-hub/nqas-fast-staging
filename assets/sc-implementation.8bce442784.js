
// ══════════════════════════════════════════════════════════════
// STEP E — IMPLEMENTATION (Days 8–49), REVISION (Days 50–56), MOCK (57–60 unchanged)
//  • Six theme weeks; each week's checkpoints are split into 7 fixed daily slices (same for every
//    facility, so stored scores never shift). A checkpoint's implementation day is its re-check date.
//  • Personalised: on an implementation day a staff member must answer only their FOCUS checkpoints —
//    own gaps (latest score below Full or never assessed), actions assigned to them, re-check requests.
//    Their other checkpoints of the day (Full last time) sit in "Full — re-check if needed".
//  • Days 50–56 re-score everything in the baseline groupings (revision / end-line).
// ══════════════════════════════════════════════════════════════
var SC_MCH_SVC=['Pregnancy & Child Birth','Neonatal & Infant Care','Childhood & Adolescent Health','Family Planning'];
var SC_IMPL_WEEKS=[   // same grouping as the baseline days: each week works on what that baseline day found
  {key:'C+B',start:8,title:'AoC C · Inputs and AoC B · Patient Rights',hi:'AoC C · इनपुट और AoC B · मरीज़ अधिकार',match:function(c){ return scDayGroup(c)===0; }},
  {key:'D+A2',start:15,title:'AoC D · Support Services and A2 · Drugs & Diagnostics',hi:'AoC D · सहायक सेवाएँ और A2 · दवाएँ व जाँच',match:function(c){ return scDayGroup(c)===1; }},
  {key:'F+G+E',start:22,title:'Infection Control, Quality Management and general clinical processes (F, G, E1–E6)',hi:'संक्रमण नियंत्रण, गुणवत्ता प्रबंधन और सामान्य चिकित्सा प्रक्रियाएँ (F, G, E1–E6)',match:function(c){ return scDayGroup(c)===2; }},
  {key:'A+E',start:29,title:'RMNCH+A: pregnancy, newborn, child and adolescent health (A + E)',hi:'RMNCH+A: गर्भावस्था, नवजात, बाल व किशोर स्वास्थ्य (A + E)',match:function(c){ return scDayGroup(c)===3; }},
  {key:'A+E',start:36,title:'Family Planning, Communicable Diseases, Eye & ENT (A + E)',hi:'परिवार नियोजन, संचारी रोग, आँख व ENT (A + E)',match:function(c){ return scDayGroup(c)===4; }},
  {key:'A+E+H',start:43,title:'NCD, Oral, Mental Health, Emergency, Elderly care and Outcomes (A + E + H)',hi:'NCD, मुख, मानसिक स्वास्थ्य, आपातकाल, बुज़ुर्ग देखभाल और परिणाम (A + E + H)',match:function(c){ var g=scDayGroup(c); return g===5||g===6; }}
];
var SC_IMPL_FIRST=7, SC_IMPL_LAST=48, SC_REV_FIRST=49, SC_REV_LAST=55;   // day indexes (Day 8–49, Day 50–56)
Object.assign(HINDI_UI,{'Implementation':'क्रियान्वयन','Revision (end-line)':'पुनरीक्षण (एंड-लाइन)','Week':'सप्ताह',
  'to work on today':'आज सुधारने के लिए','Full last time — re-check if needed':'पिछली बार पूर्ण — ज़रूरत हो तो दोबारा जाँचें',
  'Nothing to fix today — re-check any Full checkpoint if you are unsure, then mark the card done.':'आज सुधारने को कुछ नहीं — किसी पूर्ण चेकपॉइंट पर संदेह हो तो दोबारा जाँचें, फिर कार्ड पूरा करें।',
  'Re-score every item of your checkpoints. This is the end-line, compared with your baseline.':'अपने चेकपॉइंट की हर बात दोबारा स्कोर करें। यह एंड-लाइन है, जिसकी तुलना बेसलाइन से होगी।',
  'Last time':'पिछली बार','Action':'कार्य'});
SC_IMPL_WEEKS.forEach(function(w,i){ HINDI_UI['Implementation · Week '+(i+2)+' · '+w.title]='क्रियान्वयन · सप्ताह '+(i+2)+' · '+w.hi; });
SC_BASELINE.forEach(function(g){ HINDI_UI['Revision (end-line) — '+g.title]='पुनरीक्षण (एंड-लाइन) — '+g.hi; });

// ── fixed daily slices ─────────────────────────────────────────
var _scImplCache={};
function scImplPlan(progId){
  var key=progId+'|'+_scCpm.ver; if(_scImplCache[key]) return _scImplCache[key];
  var plan={days:{},dayOf:{}}, all=scCpmAll({pkg:progId,includeRetired:true,kind:'nqas'});
  SC_IMPL_WEEKS.forEach(function(w,wi){
    var L=all.filter(w.match), base=L.filter(function(c){ return c.ord&&c.ord<9000; }), added=L.filter(function(c){ return !(c.ord&&c.ord<9000); });
    var n=base.length, q=Math.floor(n/7), r=n%7, pos=0;
    for(var k=0;k<7;k++){
      var size=q+(k<r?1:0), ids=base.slice(pos,pos+size).map(function(c){ return c.id; }); pos+=size;
      if(k===6) ids=ids.concat(added.map(function(c){ return c.id; }));          // new checkpoints join the last day of their week
      var di=w.start-1+k; plan.days[di]={week:wi,k:k,ids:ids};
      ids.forEach(function(id){ plan.dayOf[id]=di+1; });
    }
  });
  _scImplCache[key]=plan; return plan;
}
function scImplDayOf(progId,cpId){ return scImplPlan(progId).dayOf[cpId]||49; }
function scIsImplDay(di){ return di>=SC_IMPL_FIRST&&di<=SC_IMPL_LAST; }
function scIsRevisionDay(di){ return di>=SC_REV_FIRST&&di<=SC_REV_LAST; }
var _scImplDayCache={};
function scImplDay(progId,di){
  if(!scIsImplDay(di)) return null;
  var key=progId+'|'+di+'|'+_scCpm.ver; if(_scImplDayCache[key]) return _scImplDayCache[key];
  var p=scImplPlan(progId).days[di]; if(!p) return null;
  var w=SC_IMPL_WEEKS[p.week], cps=p.ids.map(function(id){ return scCpmApply({},id); });
  var stds=[]; cps.forEach(function(c){ if(c.std&&stds.indexOf(c.std)<0) stds.push(c.std); });
  var roles={}; cps.forEach(function(c){ scCpRoles(c).forEach(function(r){ roles[r]=1; }); });
  var title='Implementation · Week '+(p.week+2)+' · '+w.title;
  var day={day:di+1,aoc:w.key,service:'Implementation',title:title,titleHi:'क्रियान्वयन · सप्ताह '+(p.week+2)+' · '+w.hi,
    task:'Week '+(p.week+2)+', day '+(p.k+1)+' of 7 ('+stds.join(', ')+'): fix your gaps and finish the actions your Supervisor assigned, then re-score those checkpoints. Full checkpoints only need a re-check if you are unsure.',
    me:'',aocTags:w.key.split('+'),methods:['SI','RR','OB','CI'],roles:scDayRoles(roles),cps:cps,isImpl:true,phase:'implementation',week:p.week+2,weekDay:p.k+1,stds:stds};
  _scImplDayCache[key]=day; return day;
}
var _scRevDayCache={};
function scRevisionDay(progId,di){
  if(!scIsRevisionDay(di)) return null;
  var key=progId+'|'+di+'|'+_scCpm.ver; if(_scRevDayCache[key]) return _scRevDayCache[key];
  var b=scBaselineDay(progId,di-SC_REV_FIRST); if(!b) return null;
  var g=SC_BASELINE[di-SC_REV_FIRST];
  var day=Object.assign({},b,{day:di+1,service:'Revision',title:'Revision (end-line) — '+g.title,titleHi:'पुनरीक्षण (एंड-लाइन) — '+g.hi,
    task:'End-line re-score of '+g.title+': answer each item Met or Not met again for your checkpoints. The result is compared with your baseline.',
    isBaseline:false,isRevision:true,phase:'revision'});
  _scRevDayCache[key]=day; return day;
}

// ── personalised focus (staff app) ─────────────────────────────
function scOwnLatestElsewhere(cpId,skipDi){
  var best=null;
  Object.keys(choState.cards||{}).forEach(function(k){ var di=+k; if(di===skipDi) return; var c=choState.cards[k]; if(!c||!c.taskDone) return;
    var d=getDay(di), ci=(d&&d.cps||[]).findIndex(function(x){ return x.id===cpId; }); if(ci<0) return;
    var s=scNormScore((c.cpScores||[])[ci]); if(s===null) return;
    if(!best||di>best.di) best={di:di,ci:ci,score:s,ticks:scTicksFor(c,ci,(d.cps[ci].items||[]).length)}; });
  return best;
}
function scMyActsForCp(cpId){
  var me=choState.staffMobile;
  return Object.keys(_scAllActions||{}).map(function(id){ return Object.assign({id:id},_scAllActions[id]); })
    .filter(function(a){ return a.cpId===cpId&&a.status!=='draft'&&a.status!=='closed'&&(a.assignedTo===me||a.ownerMob===me); });
}
function scFocusFor(di,ci){
  var d=getDay(di), cp=d&&d.cps&&d.cps[ci]; if(!cp||!cp.id) return false;
  if(scMyActsForCp(cp.id).length) return true;
  var L=scOwnLatestElsewhere(cp.id,di);
  return !L||L.score<2;
}
(function(){
  // Days 8–56 come from the master
  var oDef=scDayDef;
  scDayDef=function(progId,di){ return scImplDay(progId,di)||scRevisionDay(progId,di)||oDef.apply(this,arguments); };
  var oGet=getDay;
  getDay=function(di){ return scImplDay(choState.progId,di)||scRevisionDay(choState.progId,di)||oGet.apply(this,arguments); };
  // history labels
  var oKind=scCpKind;
  scCpKind=function(cpId,di){ if(scIsImplDay(di)) return 'implementation'; if(scIsRevisionDay(di)) return 'revision'; if(di>SC_REV_LAST) return 'mock'; return oKind.apply(this,arguments); };
  // on an implementation day, a staff member's required checkpoints are their focus checkpoints
  var oMine=scMyCpIdx, _scRenderAllOwn=false;
  scMyCpIdx=function(di){ var all=oMine.apply(this,arguments); if(appMode!=='cho'||!scIsImplDay(di)||_scRenderAllOwn) return all;
    return all.filter(function(ci){ return scFocusFor(di,ci); }); };
  // Mark Done on an implementation day: focus checkpoints must be answered; optional ones keep only
  // real answers (the old rule filled unanswered checkpoints with Full — never on these days)
  var oDone=markDone;
  markDone=function(di){
    if(appMode!=='cho'||!scIsImplDay(di)) return oDone.apply(this,arguments);
    var c=getCHOCard(di); if(c.taskDone) return;
    var d=getDay(di), own=oMine(di);
    if(!own.length){ showToast(t('No checkpoints are assigned to your role on this day.'),'err'); return; }
    var open=scMyCpIdx(di).filter(function(ci){ return scNormScore((c.cpScores||[])[ci])===null; });
    if(open.length){ showToast(open.length+' '+t('checkpoints still need an answer'),'err');
      try{ var el=document.getElementById('cp-'+di+'-'+open[0]); if(el&&el.scrollIntoView) el.scrollIntoView({block:'center',behavior:'smooth'}); }catch(e){} return; }
    c.cpScores=d.cps.map(function(cp,ci){ if(own.indexOf(ci)<0) return null; var s=scNormScore((c.cpScores||[])[ci]); return s===null?null:s; });
    c.taskDone=true; c.score=getDayScore(di); c.updatedAt=scNowIso();
    choState.streak=(choState.streak||0)+1;
    own.forEach(function(ci){ if(c.cpScores[ci]!==null) scCpRecord(di,ci); });
    saveCHOState(); buildDaySelector(); renderCard(di); if(choState.view==='board') buildBoard();
  };
  // re-check dates: the checkpoint's implementation day
  scThemeEndDay=function(cp,progId){ return scImplDayOf(progId||((cp.pk||[]).indexOf('12B')>=0?'nqas_12B':'nqas_12A'),cp.id); };
  var oGaps=scBaselineGaps;
  scBaselineGaps=function(agg,progId){ var out=oGaps.apply(this,arguments); out.forEach(function(g){ g.dueDay=scImplDayOf(progId,g.id); });
    out.sort(function(a,b){ return (a.dueDay-b.dueDay)||(a.base-b.base)||(a.id<b.id?-1:1); }); return out; };
  scRvDueFor=function(cp,fac){ var d=scImplDayOf((fac&&fac.progId)||'nqas_12A',cp.id); return fac&&fac.startDate?scAddDays(fac.startDate,d-1):scAddDays(scTodayStr(),7); };
  // card layout for implementation and revision days
  var oCard=renderCard;
  renderCard=function(di){
    _scRenderAllOwn=true; var r; try{ r=oCard.apply(this,arguments); } finally { _scRenderAllOwn=false; }
    try{
      if(appMode!=='cho'||!(scIsImplDay(di)||scIsRevisionDay(di))) return r;
      var cont=document.getElementById('card-container'); if(!cont) return r;
      var d=getDay(di), c=getCHOCard(di), hi=_appLang==='hi', ban=document.createElement('div'); ban.className='scd-banner scd-'+(d.isImpl?'impl':'rev');
      if(d.isImpl){
        var focus=scMyCpIdx(di), own=oMine(di), opt=own.filter(function(ci){ return focus.indexOf(ci)<0; });
        var answered=focus.filter(function(ci){ return scNormScore((c.cpScores||[])[ci])!==null; }).length;
        ban.innerHTML='<div class="scd-b-t"><i class="ti ti-tools"></i> '+scEsc(t('Implementation'))+' · '+scEsc(t('Week'))+' '+d.week+' · '+scEsc(t('Day'))+' '+(di+1)+'</div>'
          +'<div class="scd-b-s">'+scEsc(hi?d.titleHi.replace(/^क्रियान्वयन · सप्ताह \d+ · /,''):SC_IMPL_WEEKS[d.week-2].title)+' · '+scEsc(d.stds.join(', '))+'</div>'
          +'<div class="scd-b-p"><div><div style="width:'+(focus.length?Math.round(answered/focus.length*100):100)+'%"></div></div><b>'+answered+'/'+focus.length+'</b> '+scEsc(t('to work on today'))+'</div>'
          +(focus.length?'':'<div class="scd-b-h">'+scEsc(t('Nothing to fix today — re-check any Full checkpoint if you are unsure, then mark the card done.'))+'</div>');
        cont.insertBefore(ban,cont.firstChild);
        // action and last result under each focus checkpoint
        focus.forEach(function(ci){ var el=document.getElementById('cp-'+di+'-'+ci), cp=d.cps[ci]; if(!el||!cp) return;
          var L=scOwnLatestElsewhere(cp.id,di), acts=scMyActsForCp(cp.id), extra='';
          if(L) extra+='<div class="sce-last">'+scEsc(t('Last time'))+': '+scScoreLabel(L.score)+(L.ticks&&L.ticks.length?' · '+L.ticks.filter(function(x){ return x===1; }).length+'/'+L.ticks.length+' '+scEsc(t('met')):'')+' (Day '+(L.di+1)+')</div>';
          acts.forEach(function(a){ extra+='<div class="sce-act">📌 '+scEsc(t('Action'))+': '+scEsc(a.action)+(a.itemText?' <span>· '+scEsc(a.itemText)+'</span>':'')+(a.dueDate?' · '+scEsc(t('Re-check by'))+' '+scEsc(scFmtDate(a.dueDate)):'')+'</div>'; });
          if(extra){ var anchor=el.querySelector('.scmt')||el.lastElementChild; var box=document.createElement('div'); box.innerHTML=extra; anchor.parentNode.insertBefore(box,anchor); }
        });
        // Full checkpoints: available, not required
        if(opt.length){
          var det=document.createElement('details'); det.className='sce-opt';
          det.innerHTML='<summary>✓ '+scEsc(t('Full last time — re-check if needed'))+' ('+opt.length+')</summary>';
          var first=document.getElementById('cp-'+di+'-'+opt[0]); if(first){ first.parentNode.appendChild(det); opt.forEach(function(ci){ var el=document.getElementById('cp-'+di+'-'+ci); if(el) det.appendChild(el); }); }
        }
      } else {
        var mine=scMyCpIdx(di), ans=mine.filter(function(ci){ return scNormScore((c.cpScores||[])[ci])!==null; }).length;
        ban.innerHTML='<div class="scd-b-t"><i class="ti ti-refresh"></i> '+scEsc(t('Revision (end-line)'))+' · '+scEsc(t('Day'))+' '+(di+1)+' / 56</div>'
          +'<div class="scd-b-s">'+scEsc(hi?SC_BASELINE[di-SC_REV_FIRST].hi:SC_BASELINE[di-SC_REV_FIRST].title)+'</div>'
          +'<div class="scd-b-p"><div><div style="width:'+(mine.length?Math.round(ans/mine.length*100):0)+'%"></div></div><b>'+ans+'/'+mine.length+'</b> '+scEsc(t('answered today'))+'</div>'
          +'<div class="scd-b-h">'+scEsc(t('Re-score every item of your checkpoints. This is the end-line, compared with your baseline.'))+'</div>';
        cont.insertBefore(ban,cont.firstChild);
      }
    }catch(e){ console.warn('[SC] implementation card',e); }
    return r;
  };
  // Card Editor: Days 8–56 are generated too
  var oArr=aeGetActiveArray;
  aeGetActiveArray=function(){ var arr=oArr.apply(this,arguments)||[], progId=scCpmEditorLetterToProg(adminActiveProg||'C');
    return arr.map(function(d,di){ return scImplDay(progId,di)||scRevisionDay(progId,di)||d; }); };
  var oOpen=aeOpenDay;
  aeOpenDay=function(di){
    if(scIsImplDay(di)||scIsRevisionDay(di)){
      var progId=scCpmEditorLetterToProg(adminActiveProg||'C'), d=scImplDay(progId,di)||scRevisionDay(progId,di); adminEditorDay=null;
      var p=document.getElementById('ae-editor-panel');
      scAeGenNote(p,'<b>Day '+(di+1)+' · '+scEsc(d.title)+'</b><br>'+d.cps.length+' checkpoints. '
        +(d.isImpl?'Implementation days are built from the Checkpoint Master: each theme week\'s checkpoints are split into 7 fixed days, and each staff member works only on their own gaps and assigned actions.':'End-line days re-score every checkpoint in the baseline groupings.')
        +' Edit checkpoints in <a href="#" onclick="scCpmTab(\'master\');return false;">Content → Checkpoints</a>.');
      return;
    }
    return oOpen.apply(this,arguments);
  };
})();
