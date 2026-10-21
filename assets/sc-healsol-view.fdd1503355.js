
// ── HealSol Admin is view only for work that belongs to Supervisors / Champions / staff ──
(function(){
  var VIEW='View only — this is done by the facility\'s Supervisor or Quality Champion.';
  // card verification (Review cards): read-only for HealSol
  if(typeof scQvIsOversight==='function'){ var oO=scQvIsOversight; scQvIsOversight=function(code){ if(appMode==='sc-admin') return true; return oO.apply(this,arguments); }; }
  if(typeof scVGuard==='function'){ var oG=scVGuard; scVGuard=function(code){ if(appMode==='sc-admin'){ showToast('View only — Supervisors (and the CHO / MO for ANM, ASHA, MPW cards) verify cards.','err'); return null; } return oG.apply(this,arguments); }; }
  if(typeof scVStaffHTML==='function'){ var oS=scVStaffHTML; scVStaffHTML=function(){ var h=oS.apply(this,arguments);
    if(appMode==='sc-admin'&&h) h=h.replace(/View only — this facility's cards are verified by its Qu[^<]*/,'View only — cards are verified by the Supervisor, the Quality Champion or the CHO / MO, not by HealSol.'); return h; }; }
  // Peer Review sessions (HealSol 21 Oct): HealSol may schedule a session; it goes to the facility's Supervisor to approve, like a
  // Champion's proposal. HealSol can change or cancel a session only while it waits for that approval; approving, returning and
  // finalising stay with the Supervisor.
  ['scqApproveSchedule','scqApproveSummary','scqReturnSummary','scqFinalize'].forEach(function(fn){ var o=window[fn]; if(typeof o!=='function') return;
    window[fn]=function(){ if(appMode==='sc-admin'){ showToast('View only — the facility\'s Supervisor approves Peer Review sessions and summaries.','err'); return; } return o.apply(this,arguments); }; });
  ['scqEditSession','scqCancelSession'].forEach(function(fn){ var o=window[fn]; if(typeof o!=='function') return;
    window[fn]=function(id){ if(appMode==='sc-admin'&&id){ var s=((typeof _scq!=='undefined'&&_scq.sessions)||{})[id]; if(s&&s.status!=='proposed'){ showToast('Only the facility\'s Supervisor can change a session after it is approved.','err'); return; } } return o.apply(this,arguments); }; });
})();
// ── Hand over a facility (HealSol Setup) ──────────────────────
var _nfHo={sups:{},champs:{},facs:{}};
async function nfHoLoad(){
  var r=await Promise.all([fbGet('sc_supervisors'),fbGet('sc_champions'),fbGet('sc_facilities')]);
  _nfHo={sups:r[0]||{},champs:r[1]||{},facs:r[2]||{}}; return _nfHo;
}
function nfHoSupsOf(code){ return Object.keys(_nfHo.sups).filter(function(id){ var s=_nfHo.sups[id]; return s&&!s.disabled&&s.facilities&&s.facilities[code]; }); }
function nfHoChampsOf(code){ return Object.keys(_nfHo.champs).filter(function(m){ var c=_nfHo.champs[m]; return c&&!c.disabled&&c.facilities&&c.facilities[code]; }); }
function nfHoActive(c){ return Object.keys((c&&c.facilities)||{}).filter(function(k){ return c.facilities[k]&&_nfHo.facs[k]&&!_nfHo.facs[k].suspended&&!_nfHo.facs[k].migratedTo; }); }
async function nfEnsureHandover(){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nf-ho-card')) return;
  var c=document.createElement('div'); c.id='nf-ho-card'; c.className='nf-ho'; c.dataset.nfv='setup';
  c.innerHTML='<h3><i class="ti ti-users"></i> Hand over a facility</h3><p>When a Supervisor or Quality Champion is unavailable during the programme, move the facility to someone else. Access moves at once; their open and planned Peer Review sessions move too; everything already done keeps the original names.</p><div id="nf-ho-body" class="cur">Loading…</div>';
  main.appendChild(c); await nfHoLoad(); nfHoRender();
}
function nfHoRender(code){
  var body=document.getElementById('nf-ho-body'); if(!body) return; body.className='';
  var codes=Object.keys(_nfHo.facs).filter(function(k){ var f=_nfHo.facs[k]; return f&&!f.migratedTo; }).sort(function(a,b){ return String(_nfHo.facs[a].name||a).localeCompare(String(_nfHo.facs[b].name||b)); });
  code=code||(document.getElementById('nf-ho-fac')||{}).value||codes[0]||'';
  var name=function(id,map){ var x=map[id]||{}; return (x.name||id); };
  var sups=nfHoSupsOf(code), chs=nfHoChampsOf(code), f=_nfHo.facs[code]||{}, d=typeof nfDayOf==='function'?nfDayOf(f):null;
  var supOpts=Object.keys(_nfHo.sups).filter(function(id){ return !_nfHo.sups[id].disabled&&sups.indexOf(id)<0; }).map(function(id){ return '<option value="'+scEsc(id)+'">'+scEsc(name(id,_nfHo.sups))+' · '+nfHoActive(_nfHo.sups[id]).length+' facilities</option>'; }).join('');
  var chOpts=Object.keys(_nfHo.champs).filter(function(m){ return !_nfHo.champs[m].disabled&&chs.indexOf(m)<0; }).map(function(m){ var n=nfHoActive(_nfHo.champs[m]).length; return '<option value="'+scEsc(m)+'">'+scEsc(name(m,_nfHo.champs))+' · '+n+' active SC'+(n===1?'':'s')+(n>=2?' (full)':'')+'</option>'; }).join('');
  var hist=Object.keys(f.handovers||{}).map(function(k){ return f.handovers[k]; }).sort(function(a,b){ return String(b.at).localeCompare(String(a.at)); }).slice(0,5);
  body.innerHTML='<label for="nf-ho-fac">Facility</label><select id="nf-ho-fac" onchange="nfHoRender(this.value)">'+codes.map(function(k){ return '<option value="'+scEsc(k)+'"'+(k===code?' selected':'')+'>'+scEsc(_nfHo.facs[k].name||k)+' · '+scEsc(k)+'</option>'; }).join('')+'</select>'
    +'<div class="cur">'+(d!=null&&d>0?'Day '+d+' of 60':'Not started')+' · Supervisor: <b>'+scEsc(sups.map(function(id){ return name(id,_nfHo.sups); }).join(', ')||'none')+'</b> · Quality Champion: <b>'+scEsc(chs.map(function(m){ return name(m,_nfHo.champs); }).join(', ')||'none')+'</b></div>'
    +'<div class="two" style="margin-top:12px;"><div class="box"><b>New Supervisor</b><label for="nf-ho-sup">Hand over to</label><select id="nf-ho-sup"><option value="">Choose…</option>'+supOpts+'</select>'
    +'<button class="scx-btn" onclick="nfHoSupervisor()"><i class="ti ti-refresh"></i> Hand over Supervisor</button></div>'
    +'<div class="box"><b>New Quality Champion</b><label for="nf-ho-ch">Hand over to</label><select id="nf-ho-ch"><option value="">Choose…</option>'+chOpts+'</select>'
    +'<button class="scx-btn" onclick="nfHoChampion()"><i class="ti ti-refresh"></i> Hand over Champion</button></div></div>'
    +(hist.length?'<div class="hist"><b>Earlier hand-overs</b><br>'+hist.map(function(h){ return scEsc(scFmtDate(h.at))+' · '+scEsc(h.kind==='sup'?'Supervisor':'Champion')+': '+scEsc(h.fromName||'—')+' → '+scEsc(h.toName||'')+(h.note?' — '+scEsc(h.note):''); }).join('<br>')+'</div>':'');
}
async function nfHoSessions(code,fn){   // open / planned sessions of this facility
  var all=await fbGet('sc_review_sessions')||{}, n=0;
  for(var id in all){ var s=all[id]; if(!s||s.code!==code||['proposed','scheduled','returned','submitted'].indexOf(s.status)<0) continue;
    var upd=fn(s); if(upd){ upd.updatedAt=scNowIso(); try{ await db.ref('sc_review_sessions/'+id).update(upd); n++; }catch(e){} } }
  return n;
}
async function nfHoSupervisor(){
  var code=(document.getElementById('nf-ho-fac')||{}).value, to=(document.getElementById('nf-ho-sup')||{}).value; if(!code||!to){ showToast('Choose the facility and the new Supervisor.','err'); return; }
  var from=nfHoSupsOf(code), f=_nfHo.facs[code]||{}, toN=(_nfHo.sups[to]||{}).name||to, fromN=from.map(function(id){ return (_nfHo.sups[id]||{}).name||id; }).join(', ');
  var v=await scDialog({title:'Hand over Supervisor',icon:'🔁',okLabel:'Hand over',message:(f.name||code)+'\n'+(fromN||'No Supervisor')+'  →  '+toN+'\n\nThe new Supervisor gets access now. Open and planned Peer Review sessions move to them. Actions and approvals already done keep the original names.',
    fields:[{key:'note',label:'Reason (optional)',placeholder:'e.g. on leave until 30 Oct'}]}); if(!v) return;
  var upd={}, now=scNowIso(); from.forEach(function(id){ upd['sc_supervisors/'+id+'/facilities/'+code]=null; });
  upd['sc_supervisors/'+to+'/facilities/'+code]=true; upd['sc_facilities/'+code+'/supervisorId']=to;
  upd['sc_facilities/'+code+'/handovers/'+scUid('ho')]=scClean({kind:'sup',from:from.join(','),fromName:fromN,to:to,toName:toN,at:now,by:'HealSol Admin',note:(v.note||'').trim()});
  try{ await db.ref().update(upd); }catch(e){ showToast('Could not hand over — check connection.','err'); return; }
  var n=await nfHoSessions(code,function(s){ return s.supervisorId!==to?{supervisorId:to}:null; });
  // a Champion whose facilities are now all with the new Supervisor moves with them (Champion load, defaults)
  for(var m in _nfHo.champs){ var c=_nfHo.champs[m]; if(!c||!c.facilities||!c.facilities[code]) continue;
    var act=nfHoActive(c).filter(function(k){ return k!==code; }).every(function(k){ return (((_nfHo.sups[to]||{}).facilities)||{})[k]; });
    if(act&&c.supervisorId!==to){ try{ await db.ref('sc_champions/'+m+'/supervisorId').set(to); }catch(e){} } }
  try{ await scSecureSyncClaimsSafe(to); }catch(e){}
  showToast((f.name||code)+' handed over to '+toN+(n?' · '+n+' session'+(n===1?'':'s')+' moved':'')+'.','ok');
  await nfHoLoad(); nfHoRender(code); try{ await scLoadMasterData(); }catch(e){}
}
async function nfHoChampion(){
  var code=(document.getElementById('nf-ho-fac')||{}).value, to=(document.getElementById('nf-ho-ch')||{}).value; if(!code||!to){ showToast('Choose the facility and the new Quality Champion.','err'); return; }
  var from=nfHoChampsOf(code), f=_nfHo.facs[code]||{}, toC=_nfHo.champs[to]||{}, toN=toC.name||to, fromN=from.map(function(m){ return (_nfHo.champs[m]||{}).name||m; }).join(', ');
  var load=nfHoActive(toC).length;
  var v=await scDialog({title:'Hand over Quality Champion',icon:'🔁',okLabel:'Hand over',message:(f.name||code)+'\n'+(fromN||'No Champion')+'  →  '+toN+(load>=2?'\n\n⚠ '+toN+' already has '+load+' active Sub-Centres (the usual limit is 2).':'')+'\n\nThe new Champion gets access now and continues the baseline review where it stopped. Planned sessions move to them (they can change the time). Summaries already submitted stay with the previous Champion.',
    fields:[{key:'note',label:'Reason (optional)',placeholder:'e.g. not available this month'}]}); if(!v) return;
  var upd={}, now=scNowIso(); from.forEach(function(m){ upd['sc_champions/'+m+'/facilities/'+code]=null; });
  upd['sc_champions/'+to+'/facilities/'+code]=true;
  upd['sc_facilities/'+code+'/handovers/'+scUid('ho')]=scClean({kind:'champ',from:from.join(','),fromName:fromN,to:to,toName:toN,at:now,by:'HealSol Admin',note:(v.note||'').trim()});
  try{ await db.ref().update(upd); }catch(e){ showToast('Could not hand over — check connection.','err'); return; }
  var n=await nfHoSessions(code,function(s){ return (s.status!=='submitted'&&from.indexOf(s.championId)>=0)?{championId:to,championName:toN}:null; });
  showToast((f.name||code)+' handed over to '+toN+(n?' · '+n+' planned session'+(n===1?'':'s')+' moved':'')+'.','ok');
  await nfHoLoad(); nfHoRender(code);
}
function scSecureSyncClaimsSafe(){ return Promise.resolve(); }   // roles are read from the database, no claim refresh needed
(function(){ if(typeof nfAdminApply==='function'){ var o=nfAdminApply; nfAdminApply=function(){ try{ nfEnsureHandover(); }catch(e){} return o.apply(this,arguments); }; } })();
