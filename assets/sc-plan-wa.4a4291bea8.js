
// After the Supervisor publishes the Action Plan (and any time later, from the Action Plan tab), the Supervisor or the
// facility CHO taps one WhatsApp button per staff member; WhatsApp opens with that person's own open actions written in.
var _nfPwSent={};
function nfPwCan(st){ return !!st&&((appMode==='sc-supervisor'&&typeof scRvCanAssign==='function'&&scRvCanAssign(st.code))||(appMode==='sc-cho'&&st.code===scSubAdminCode)); }
function nfPwPeople(st){
  var by={}, today=scTodayStr();
  scRvList(st.actions).forEach(function(a){ var s=scRvStatus(a,st.progId,st.progress||{}); if(s!=='open'&&s!=='overdue') return;
    var m=a.assignedTo||a.ownerMob; if(!m) return; (by[m]=by[m]||[]).push(Object.assign({_s:s},a)); });
  return Object.keys(by).map(function(m){ var s=(st.staff||{})[m]||{}, L=by[m].sort(function(x,y){ return String(x.dueDate||'9999').localeCompare(String(y.dueDate||'9999')); });
    return {mob:m,name:s.name||L[0].assignedToName||L[0].ownerName||m,role:s.role||'',acts:L,od:L.filter(function(a){ return a._s==='overdue'; }).length};
  }).filter(function(p){ return !(st.staff||{})[p.mob]||!(st.staff[p.mob].disabled); })
    .sort(function(a,b){ return (b.od-a.od)||String(a.name).localeCompare(String(b.name)); });
}
function nfPwText(st,p){
  var f=st.fac||{}, nm=f.name||st.code, first=String(p.name||'').split(' ')[0], me=scActor()||{}, L=p.acts, N=6;
  var lines=['Namaste'+(first?' '+first:'')+' ji,','The NQAS | FAST Action Plan for '+nm+' is ready. You have '+L.length+' action'+(L.length===1?'':'s')+(p.od?' ('+p.od+' overdue)':'')+':',''];
  L.slice(0,N).forEach(function(a,i){ lines.push((i+1)+'. '+(a.action||'')+(a.cpId?' ['+a.cpId+']':'')+(a._with?' (together with '+a._with+')':'')+(a.dueDate?' — due '+scFmtDate(a.dueDate):'')+(a._s==='overdue'?' (overdue)':'')); });
  if(L.length>N) lines.push('…and '+(L.length-N)+' more in the app.');
  lines.push('','Open NQAS | FAST → Today → My actions. When an action is done, tap "Done — ready for re-check".',
    'आपके कार्य ऐप में Today → मेरे कार्य में हैं। काम पूरा होने पर "Done — ready for re-check" दबाएँ।');
  lines.push('— '+(me.name||'')+(me.role?' ('+me.role+')':''));
  return lines.join('\n');
}
function nfPwSend(hostId,mob){
  var st=_scIns[hostId]; if(!nfPwCan(st)) return;
  var p=nfPwPeople(st).find(function(x){ return x.mob===mob; }); if(!p) return;
  if(!nfWaNum(mob)){ showToast('No valid mobile number for '+p.name+'.','err'); return; }
  nfWaOpen(mob,nfPwText(st,p)); _nfPwSent[st.code+'|'+mob]=1;
  var row=document.querySelector('#nf-pw-ov .nfpw-row[data-mob="'+mob+'"]'); if(row){ row.classList.add('sent'); var o=row.querySelector('.nfpw-ok'); if(o) o.textContent='✓ Opened in WhatsApp'; }
}
function nfPlanNotify(hostId,justPublished){
  var st=_scIns[hostId]; if(!nfPwCan(st)) return;
  var ppl=nfPwPeople(st), old=document.getElementById('nf-pw-ov'); if(old) old.remove();
  if(!ppl.length){ showToast('No open actions to tell staff about.','ok'); return; }
  var ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-pw-ov';
  ov.innerHTML='<div class="scx-box" style="max-width:440px;text-align:center;"><div style="font-size:30px;">📢</div>'
    +'<div style="font-size:16px;font-weight:700;margin:6px 0 4px;">'+(justPublished?'Action Plan published — tell your staff':'Tell staff on WhatsApp')+'</div>'
    +'<div style="font-size:12.5px;color:var(--t3);line-height:1.45;">Tap each person. WhatsApp opens with their own actions written in — check it and tap Send.</div>'
    +'<div class="nfpw-list">'+ppl.map(function(p){ var sent=_nfPwSent[st.code+'|'+p.mob];
      return '<div class="nfpw-row'+(sent?' sent':'')+'" data-mob="'+scEsc(p.mob)+'"><div><b>'+scEsc(p.name)+(p.role?' <span class="fa-chip">'+scEsc(p.role)+'</span>':'')+'</b>'
        +'<small class="'+(p.od?'od':'')+'">'+p.acts.length+' action'+(p.acts.length===1?'':'s')+(p.od?' · '+p.od+' overdue':'')+(p.acts[0].dueDate?' · first due '+scFmtDate(p.acts[0].dueDate):'')+'</small>'
        +'<div class="nfpw-ok">'+(sent?'✓ Opened in WhatsApp':'')+'</div></div>'
        +nfWaBtn("nfPwSend('"+scJs(hostId)+"','"+scJs(p.mob)+"')",'Send','')+'</div>'; }).join('')+'</div>'
    +'<button type="button" class="scx-btn ghost" id="nf-pw-close" style="margin-top:8px;width:100%;">Close</button></div>';
  document.body.appendChild(ov);
  ov.querySelector('#nf-pw-close').onclick=function(){ ov.remove(); };
}
(function(){
  function bar(st){ if(!nfPwCan(st)) return ''; var n=nfPwPeople(st); if(!n.length) return '';
    var a=n.reduce(function(s,p){ return s+p.acts.length; },0);
    return '<div class="nfpw-bar"><span><b>'+a+' open action'+(a===1?'':'s')+'</b> for '+n.length+' staff. Remind each person of their own actions on WhatsApp.</span>'
      +nfWaBtn("nfPlanNotify('"+scJs(st.hostId)+"')",'Tell staff on WhatsApp','')+'</div>'; }
  var oRev=scRvReviewHTML;
  scRvReviewHTML=function(st){ var h=oRev.apply(this,arguments); try{ h=bar(st)+h; }catch(e){} return h; };
  var oFac=scRvFacilityPlanHTML;
  scRvFacilityPlanHTML=function(st,opts){ var h=oFac.apply(this,arguments); try{ if(opts&&opts.facility) h=bar(st)+h; }catch(e){} return h; };
  var oPub=scRvPublish;
  scRvPublish=async function(hostId){ var st=_scIns[hostId], before=st?scRvList(st.actions).filter(function(a){ return a.status==='draft'; }).length:0;
    var r=await oPub.apply(this,arguments);
    try{ st=_scIns[hostId]; var after=st?scRvList(st.actions).filter(function(a){ return a.status==='draft'; }).length:before;
      if(before&&after<before) nfPlanNotify(hostId,true); }catch(e){ console.warn('[SC] plan notify',e); }
    return r; };
})();
