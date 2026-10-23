
// ══════════════════════════════════════════════════════════════
// DAY PLACEMENT — see which day each checkpoint is on, and (during testing) move one
//  Master fields: blDay (1–7, baseline day) · implDay (8–49, implementation day). Empty = automatic.
//  The revision day (50–56) always mirrors the baseline day.
//  A move changes only the two days involved: the checkpoint leaves its day and joins the end of the
//  new day; every other day keeps the same checkpoints in the same order.
// ══════════════════════════════════════════════════════════════
SC_CPM_FIELDS.push('blDay','implDay');
var _scDpImpl={}, _scDpBl={};
(function(){
  // implementation plan with overrides
  var oPlan=scImplPlan;
  scImplPlan=function(progId){
    var key=progId+'|'+_scCpm.ver; if(_scDpImpl[key]) return _scDpImpl[key];
    var nat=oPlan.apply(this,arguments), plan={days:{},dayOf:{}};
    Object.keys(nat.days).forEach(function(di){ var p=nat.days[di]; plan.days[di]={week:p.week,k:p.k,ids:p.ids.slice()}; });
    var moves=scCpmAll({pkg:progId,includeRetired:true,kind:'nqas'}).filter(function(c){ var t=+c.implDay; return t>=8&&t<=49&&nat.dayOf[c.id]&&nat.dayOf[c.id]!==t; });
    moves.forEach(function(c){ var from=nat.dayOf[c.id]-1, to=+c.implDay-1;
      plan.days[from].ids=plan.days[from].ids.filter(function(id){ return id!==c.id; }); plan.days[to].ids.push(c.id); });
    Object.keys(plan.days).forEach(function(di){ plan.days[di].ids.forEach(function(id){ plan.dayOf[id]=+di+1; }); });
    _scDpImpl[key]=plan; return plan;
  };
  // baseline (and therefore revision) days with overrides
  var oBl=scBaselineDay, oGrp=scBaselineGroupOf;
  scBaselineGroupOf=function(cpId){ var c=scCpmGet(cpId), t=c&&+c.blDay; if(t>=1&&t<=7) return t-1; return oGrp.apply(this,arguments); };
  scBaselineDay=function(progId,di){
    var nat=oBl.apply(this,arguments); if(!nat) return nat;
    var key=progId+'|'+di+'|'+_scCpm.ver; if(_scDpBl[key]) return _scDpBl[key];
    var all=scCpmAll({pkg:progId,includeRetired:true,kind:'nqas'});
    var natGroup=function(c){ for(var i=0;i<SC_BASELINE.length;i++){ if(SC_BASELINE[i].match(c)) return i; } return -1; };
    var moved=all.filter(function(c){ var t=+c.blDay; return t>=1&&t<=7&&natGroup(c)!==t-1; });
    if(!moved.length){ _scDpBl[key]=nat; return nat; }
    var out=nat.cps.filter(function(cp){ return !moved.some(function(m){ return m.id===cp.id; }); });
    moved.filter(function(m){ return +m.blDay-1===di; }).forEach(function(m){ out.push(scCpmApply({},m.id)); });
    var day=Object.assign({},nat,{cps:out}); _scDpBl[key]=day; return day;
  };
})();
function scCpDays(progId,cpId){
  var c=scCpmGet(cpId); if(!c||c.kind!=='nqas') return null;
  var g=scBaselineGroupOf(cpId), impl=scImplDayOf(progId,cpId);
  return {bl:g+1,impl:impl,rev:g+50,blMoved:!!(+c.blDay),implMoved:!!(+c.implDay)};
}
function scDpWeekOf(day){ return Math.floor((day-8)/7); }
function scDpDayLabel(day){
  if(day<=7) return 'Day '+day+' · Baseline · '+SC_BASELINE[day-1].title;
  if(day<=49){ var w=scDpWeekOf(day); return 'Day '+day+' · Week '+(w+2)+' · '+SC_IMPL_WEEKS[w].title; }
  return 'Day '+day;
}
// facilities with saved progress on given days (to warn before a move)
function scDpFacilitiesOn(days,progId){
  var out=[]; Object.keys(scMasterProgress||{}).forEach(function(code){ var f=(scMasterFacilities||{})[code]; if(!f||(f.progId||'nqas_12A')!==progId&&progId!=='*') return;
    var P=scMasterProgress[code]||{}, hit=Object.keys(P).some(function(m){ return days.some(function(d){ var r=(P[m]||{})['day_'+(d-1)]; return r&&(r.taskDone||(r.cpScores||[]).some(function(s){ return s!==null&&s!==undefined&&s>=0; })); }); });
    if(hit) out.push(f.name||code); });
  return out;
}
async function scCpMoveDay(id){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can move checkpoints.','err'); return; }
  var c=scCpmGet(id); if(!c||c.kind!=='nqas') return;
  var pk=c.pk.indexOf('12B')>=0?'nqas_12B':'nqas_12A', cur=scCpDays(pk,id);
  var natBl=(function(){ for(var i=0;i<SC_BASELINE.length;i++){ if(SC_BASELINE[i].match(c)) return i+1; } return cur.bl; })();
  var natImpl=(function(){ var save=c.implDay; return save; })();
  var blOpts=[{value:'',label:'Automatic — Day '+natBl+' ('+SC_BASELINE[natBl-1].title+')'}];
  for(var d=1;d<=7;d++) blOpts.push({value:String(d),label:scDpDayLabel(d)});
  var implOpts=[{value:'',label:'Automatic (by theme week)'}];
  for(var e=8;e<=49;e++) implOpts.push({value:String(e),label:scDpDayLabel(e)});
  var v=await scDialog({title:'Move '+id+' to another day',icon:'📅',wide:true,okLabel:'Move',
    message:c.t+'\n\nNow on: Baseline Day '+cur.bl+' · Implementation Day '+cur.impl+' · End-line Day '+cur.rev+'. The end-line day always follows the baseline day.',
    fields:[{key:'bl',label:'Baseline day (1–7)',type:'select',value:c.blDay?String(c.blDay):'',options:blOpts},
            {key:'impl',label:'Implementation day (8–49)',type:'select',value:c.implDay?String(c.implDay):'',options:implOpts}]});
  if(!v) return;
  var newBl=v.bl?+v.bl:null, newImpl=v.impl?+v.impl:null;
  // where would it land?
  var after={bl:newBl||natBl};
  var notes=[], days=[];
  if((newBl||natBl)!==cur.bl){ days.push(cur.bl,after.bl,cur.bl+49,after.bl+49); if(newBl&&newBl!==natBl) notes.push('Baseline Day '+newBl+' is not its AoC group ('+SC_BASELINE[natBl-1].title+').'); }
  var oldImpl=cur.impl;
  if(newImpl&&newImpl!==oldImpl){ days.push(oldImpl,newImpl);
    var themeW=(function(){ for(var i=0;i<SC_IMPL_WEEKS.length;i++){ if(SC_IMPL_WEEKS[i].match(c)) return i; } return -1; })();
    if(scDpWeekOf(newImpl)!==themeW) notes.push('Implementation Day '+newImpl+' is outside its theme week (Week '+(themeW+2)+' · '+SC_IMPL_WEEKS[themeW].title+').'); }
  if(!newImpl&&c.implDay) days.push(oldImpl);
  var facs=scDpFacilitiesOn(days.filter(function(x,i,a){ return a.indexOf(x)===i; }),'*');
  if(facs.length) notes.push(facs.length+' facilit'+(facs.length===1?'y has':'ies have')+' saved progress on these days ('+facs.slice(0,5).join(', ')+(facs.length>5?' …':'')+'). Scores on those two days may attach to the wrong checkpoint — reset that test progress after moving.');
  if(notes.length&&!(await showConfirm(notes.join('\n\n'),'⚠️','Please confirm the move','Move','var(--teal)'))) return;
  if(!await scCpmSave(id,{blDay:newBl,implDay:newImpl})){ showToast('Could not save — check connection.','err'); return; }
  var now=scCpDays(pk,id);
  showToast(id+' now on Baseline Day '+now.bl+' · Implementation Day '+now.impl+' · End-line Day '+now.rev+'.','ok');
  try{ scCpmRender(); }catch(e){}
  try{ if(_scCpmUi.tab==='days'){ buildAeDayStrip(); if(_scDpOpenDay!=null) aeOpenDay(_scDpOpenDay); } }catch(e){}
}

// ── Checkpoint Master: day chips and Phase/Day filter ──────────
_scCpmUi.phase=''; _scCpmUi.day='';
(function(){
  var oRow=scCpmRowHTML;
  scCpmRowHTML=function(c){
    var h=oRow.apply(this,arguments); if(c.kind!=='nqas') return h;
    var pk=_scCpmUi.pkg==='12A'?'nqas_12A':'nqas_12B'; if(c.pk.indexOf(scPkgCode(pk))<0) pk=c.pk.indexOf('12B')>=0?'nqas_12B':'nqas_12A';
    var d=scCpDays(pk,c.id); if(!d) return h;
    var chip='<span class="dy" title="'+scEsc(scPkgCode(pk))+' day cards — click to move" onclick="event.stopPropagation();scCpMoveDay(\''+scJs(c.id)+'\')">📅 Baseline D'+d.bl+(d.blMoved?'✎':'')+' · Implementation D'+d.impl+(d.implMoved?'✎':'')+' · End-line D'+d.rev+'</span>';
    return h.replace('<span class="pk">',chip+'<span class="pk">');
  };
  var oFil=scCpmFiltered;
  scCpmFiltered=function(){
    var L=oFil.apply(this,arguments), u=_scCpmUi; if(!u.phase||!u.day) return L;
    var pk=u.pkg==='12A'?'nqas_12A':'nqas_12B', day=+u.day;
    var ids={}; (scDayDef(pk,day-1).cps||[]).forEach(function(c){ ids[c.id]=1; });
    return L.filter(function(c){ return ids[c.id]; }).sort(function(a,b){ var p=scDayDef(pk,day-1).cps.map(function(x){ return x.id; }); return p.indexOf(a.id)-p.indexOf(b.id); });
  };
  var oRender=scCpmRender;
  scCpmRender=function(){
    var r=oRender.apply(this,arguments);
    try{
      var u=_scCpmUi; if(u.view&&u.view!=='cps') return r;
      var f=document.querySelector('#scm-panel .scm-filters'); if(!f||f.querySelector('.scdp-phase')) return r;
      var ph=document.createElement('select'); ph.className='scdp-phase';
      ph.innerHTML=[['','All days'],['bl','Baseline (Days 1–7)'],['impl','Implementation (Days 8–49)'],['rev','End-line (Days 50–56)']].map(function(o){ return '<option value="'+o[0]+'"'+(u.phase===o[0]?' selected':'')+'>'+o[1]+'</option>'; }).join('');
      ph.setAttribute('onchange',"_scCpmUi.phase=this.value;_scCpmUi.day='';scCpmRender()");
      var dy=document.createElement('select'); dy.className='scdp-day'; dy.disabled=!u.phase;
      var rng=u.phase==='bl'?[1,7]:u.phase==='impl'?[8,49]:u.phase==='rev'?[50,56]:null, pk=u.pkg==='12A'?'nqas_12A':'nqas_12B';
      var opts='<option value="">'+(u.phase?'— choose a day —':'Day (choose a phase)')+'</option>';
      if(rng) for(var d=rng[0];d<=rng[1];d++){ var n=(scDayDef(pk,d-1).cps||[]).length; opts+='<option value="'+d+'"'+(String(u.day)===String(d)?' selected':'')+'>'+scEsc(d<=49?scDpDayLabel(d):'Day '+d+' · End-line · '+SC_BASELINE[d-50].title)+' ('+n+')</option>'; }
      dy.innerHTML=opts; dy.setAttribute('onchange',"_scCpmUi.day=this.value;scCpmRender()");
      f.appendChild(ph); f.appendChild(dy);
      if(u.phase&&u.day){ var bar=document.querySelector('#scm-panel .scm-bar span'); if(bar) bar.insertAdjacentHTML('beforeend',' · in day-card order'); }
    }catch(e){ console.warn(e); }
    return r;
  };
})();

// ── Day cards tab: counts on the strip, checkpoint list for generated days ──
var _scDpOpenDay=null;
(function(){
  var oStrip=buildAeDayStrip;
  buildAeDayStrip=function(){
    var r=oStrip.apply(this,arguments);
    try{ var strip=document.getElementById('ae-day-strip'), arr=aeGetActiveArray(); if(!strip) return r;
      [].forEach.call(strip.children,function(b,di){ var d=arr[di]; if(!d||b.querySelector('.scdp-n')) return;
        var n=(d.cps||[]).filter(function(c){ return c.kind==='nqas'; }).length, cls=di<7?'bl':di<49?'impl':di<56?'rev':'mk';
        b.classList.add('scdp-'+cls); if(n>20) b.classList.add('scdp-heavy');
        b.title=(d.title||'')+' · '+n+' NQAS checkpoints'; b.insertAdjacentHTML('beforeend','<span class="scdp-n">'+(n||'')+'</span>'); });
    }catch(e){}
    return r;
  };
  var oOpen=aeOpenDay;
  aeOpenDay=function(di){
    _scDpOpenDay=di;
    var r=oOpen.apply(this,arguments);
    try{
      if(!(di<56)) return r;
      var progId=scCpmEditorLetterToProg(adminActiveProg||'C'), d=scDayDef(progId,di), p=document.getElementById('ae-editor-panel');
      var note=p&&p.querySelector(':scope > .scd-ae'); if(!note) return r;
      var rows=(d.cps||[]).map(function(cp,i){ var m=scCpmGet(cp.id)||cp, moved=(di<7||di>=49)?!!(+m.blDay):!!(+m.implDay);
        return '<tr'+(cp.retired?' class="ret"':'')+'><td>'+(i+1)+'</td><td><b>'+scEsc(cp.id)+'</b>'+(moved?' ✎':'')+'</td><td>'+scEsc(cp.me||'')+'</td><td>'+scEsc(cp.svc||'')+'</td><td>'+scEsc(scCpRoles(cp).join(', '))+'</td><td>'+scEsc(cp.t)+(cp.retired?' <em>(retired)</em>':'')+'</td>'
          +'<td>'+(di>=49?'<span class="scq-muted">follows baseline</span>':'<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCpMoveDay(\''+scJs(cp.id)+'\')">Move</button>')+'</td></tr>'; }).join('');
      note.insertAdjacentHTML('beforeend','<div class="scdp-list"><table><thead><tr><th>#</th><th>ID</th><th>ME</th><th>Service / area</th><th>Who scores</th><th>Checkpoint</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>');
    }catch(e){ console.warn(e); }
    return r;
  };
})();
