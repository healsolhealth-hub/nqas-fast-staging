
// The Champion can flag a Not Met MoV item as "Looks met" (with an optional note). It is saved straight away on that
// day's card (sc_progress/{code}/{mob}/day_x/looksMet/c{ci}/{k}) and shows to the staff member (Today + the card),
// the CHO's Facility dashboard and the Supervisor's Review & Action Plan, so nobody assigns an action for something
// that may already be in place. The staff member re-checks and taps "Re-checked" (or re-scores the item).
Object.assign(HINDI_UI,{'Champion thinks these may already be met':'चैंपियन के अनुसार ये शायद पहले से पूरे हैं','Re-checked':'दोबारा जाँच लिया','Open card':'कार्ड खोलें'});
function nfLmIsChamp(ctx){ return !!(ctx&&ctx.actor&&typeof SC_QV_LABEL!=='undefined'&&ctx.actor.label===SC_QV_LABEL); }
function nfLmOpen(rec,ci,k,n){   // still relevant: not dismissed and the item is still Not Met on that card
  var e=(((rec||{}).looksMet||{})['c'+ci]||{})[k]; if(!e||e.seen) return null;
  var tk=scTicksFromStr((((rec||{}).cpTicks||{})['c'+ci])||'',n||0); return tk[k]===0?e:null;
}
async function nfLmMark(code,mob,di,ci,k,remove){
  var ctx=scVCtx(code); if(!nfLmIsChamp(ctx)){ showToast('Only the Quality Champion can mark this.','err'); return; }
  var path=scProgressPath(code,mob,di)+'/looksMet/c'+ci+'/'+k, val=null;
  if(!remove){
    var v=await scDialog({title:'Looks met?',icon:'👍',okLabel:'Send to staff',message:'The staff member will be asked to re-check this item and re-score it if it is in place.',
      fields:[{key:'n',label:'What did you see? (optional)',type:'textarea',placeholder:'e.g. Citizen charter is displayed at the entrance'}]});
    if(!v) return;
    val={by:ctx.actor.name,byMob:ctx.actor.mob||'',at:scNowIso(),note:(v.n||'').trim()};
  }
  try{ await db.ref(path).set(val); }catch(e){ showToast('Could not save — check connection.','err'); return; }
  var rec=scVRec(ctx,mob,di); if(rec){ rec.looksMet=rec.looksMet||{}; var c=rec.looksMet['c'+ci]=rec.looksMet['c'+ci]||{}; if(val) c[k]=val; else delete c[k]; }
  showToast(remove?'Removed.':'Sent — the staff member will re-check it.','ok');
  scVAfter(ctx,mob,di,'full');
}
// verification rows: chip on Not Met items (Champion); the note for everyone else
(function(){
  var oRow=scVCpRowHTML;
  scVCpRowHTML=function(ctx,mob,di,ci,rec,interactive,tag){
    var h=oRow.apply(this,arguments);
    try{
      var d=scDayDef(ctx.progId,di), cp=d&&d.cps&&d.cps[ci], n=cp?(cp.items||[]).length:0; if(!n||!rec) return h;
      if(typeof SC_BASELINE_DAYS!=='undefined'&&di<SC_BASELINE_DAYS) return h;   // baseline: the reviewer changes the item directly
      var tk=scTicksFromStr(((rec.cpTicks||{})['c'+ci])||'',n), champ=nfLmIsChamp(ctx), lm=((rec.looksMet||{})['c'+ci])||{};
      var out='', pos=0;
      for(var k=0;k<n;k++){
        var st=h.indexOf('<div class="scrv-vt ',pos); if(st<0) break;
        var e1=h.indexOf('</div>',h.indexOf('<div>',st)), e2=h.indexOf('</div>',e1+6); if(e1<0||e2<0) break;
        var ctl='', e=lm[k];
        if(tk[k]===0){
          var J="'"+scJs(ctx.code)+"','"+scJs(mob)+"',"+di+','+ci+','+k;
          if(e&&!e.seen) ctl='<div class="nflm-note">👍 <b>Looks met</b> — '+scEsc(e.by||'Quality Champion')+(e.note?': “'+scEsc(e.note)+'”':'')+(champ?'<button class="scx-linkbtn" onclick="nfLmMark('+J+',true)">Remove</button>':'')+'</div>';
          else if(e&&e.seen) ctl='<div class="nflm-note" style="opacity:.7;">👍 Looks met — re-checked by staff</div>';
          else if(champ) ctl='<button type="button" class="nflm-chip" onclick="nfLmMark('+J+')">👍 Looks met?</button>';
        }
        out+=h.slice(pos,e2)+ctl; pos=e2;
      }
      return out+h.slice(pos);
    }catch(e){ return h; }
  };
})();
// all open "looks met" notes of a facility (from loaded progress)
function nfLmList(code,progId,progress,roster,onlyMob){
  var out=[];
  Object.keys(progress||{}).forEach(function(mob){ if(onlyMob&&mob!==onlyMob) return;
    Object.keys(progress[mob]||{}).forEach(function(key){ var m=/^day_(\d+)$/.exec(key); if(!m) return; var di=+m[1], rec=progress[mob][key]; if(!rec||!rec.looksMet) return;
      var d=scDayDef(progId,di);
      Object.keys(rec.looksMet).forEach(function(c){ var ci=+c.slice(1), cp=d&&d.cps&&d.cps[ci]; if(!cp) return; var n=(cp.items||[]).length;
        Object.keys(rec.looksMet[c]||{}).forEach(function(k){ var e=nfLmOpen(rec,ci,+k,n); if(!e) return;
          out.push({mob:mob,name:((roster||{})[mob]||{}).name||mob,role:((roster||{})[mob]||{}).role||'',di:di,ci:ci,k:+k,cp:cp,item:(cp.items[+k]||{}),e:e}); }); }); }); });
  return out.sort(function(a,b){ return (a.di-b.di)||(a.ci-b.ci)||(a.k-b.k); });
}
function nfLmItemText(x){ return (typeof _appLang!=='undefined'&&_appLang==='hi'&&x.item.h)?x.item.h:(x.item.t||''); }
// ── staff app (Today): my own "looks met" notes ──────────────
var _nfLm={at:0,list:[]};
async function nfLmLoadMine(force){
  if(!choState||!choState.facilityCode||!choState.staffMobile||!db) return _nfLm.list;
  if(!force&&_nfLm.at&&Date.now()-_nfLm.at<60000) return _nfLm.list;
  try{ var p={}; p[choState.staffMobile]=await fbGet('sc_progress/'+choState.facilityCode+'/'+choState.staffMobile)||{};
    _nfLm.list=nfLmList(choState.facilityCode,choState.progId,p,{},choState.staffMobile); _nfLm.at=Date.now(); }catch(e){}
  return _nfLm.list;
}
async function nfLmSeen(di,ci,k){
  try{ await db.ref(scProgressPath(choState.facilityCode,choState.staffMobile,di)+'/looksMet/c'+ci+'/'+k+'/seen').set(scNowIso()); }catch(e){ showToast('Could not save — check connection.','err'); return; }
  await nfLmLoadMine(true); nfLmPaint(); showToast(t('Re-checked'),'ok');
}
function nfLmHTML(list){
  if(!list.length) return '';
  return '<div class="nflm-sec" id="nflm-today"><b>👍 '+scEsc(t('Champion thinks these may already be met'))+' ('+list.length+')</b>'
    +list.slice(0,8).map(function(x){ return '<div class="nflm-it">'+scEsc(nfLmItemText(x))+'<small>Day '+(x.di+1)+' · '+scEsc(x.cp.id||'')+' · '+scEsc(getCPText(x.cp)||'')+'</small>'
      +'<em>'+scEsc(x.e.by||'Quality Champion')+(x.e.note?': “'+scEsc(x.e.note)+'”':'')+'</em>'
      +'<div class="nflm-acts"><button class="scx-btn sm" onclick="scOpenActionCard('+x.di+')"><i class="ti ti-arrow-right"></i> '+scEsc(t('Open card'))+'</button>'
      +'<button class="scx-btn sm ghost" onclick="nfLmSeen('+x.di+','+x.ci+','+x.k+')">✓ '+scEsc(t('Re-checked'))+'</button></div></div>'; }).join('')+'</div>';
}
function nfLmPaint(){
  var old=document.getElementById('nflm-today'); if(old) old.remove();
  var host=document.getElementById('nf-today'), slot=host&&host.querySelector('#nf-tt'); if(!slot) return;
  var h=nfLmHTML(_nfLm.list); if(h) slot.insertAdjacentHTML('beforebegin',h);
}
(function(){
  if(typeof nfRenderToday==='function'){ var oT=nfRenderToday;
    nfRenderToday=function(){ var r=oT.apply(this,arguments); try{ nfLmPaint(); nfLmLoadMine().then(nfLmPaint); }catch(e){} return r; }; }
})();
// ── CHO Facility dashboard (Home) and Supervisor review ──────
(function(){
  if(typeof faItems==='function'){ var oI=faItems;
    faItems=function(){ var out=oI.apply(this,arguments); try{ var st=faSt(); if(!st) return out;
      var L=nfLmList(st.code,st.progId,st.progress||{},st.staff||{});
      if(L.length){ var who={}; L.forEach(function(x){ who[x.name]=1; });
        out.push({ic:'ti-circle-check',cls:'f',t:L.length+' item'+(L.length===1?'':'s')+' the Champion thinks may already be met',s:'Re-check and re-score: '+Object.keys(who).join(', '),go:faDual()?'faMyCards()':"faOpenReady('staff')"}); } }catch(e){} return out; }; }
  if(typeof scRvReviewHTML==='function'){ var oR=scRvReviewHTML;
    scRvReviewHTML=function(st){ var h=oR.apply(this,arguments); try{
      var L=nfLmList(st.code,st.progId,st.progress||{},st.staff||{}); if(!L.length) return h;
      var blk='<details class="nflm-sec" open><summary style="font-weight:700;color:#14532D;cursor:pointer;">👍 Champion: looks met — staff to re-check ('+L.length+')</summary>'
        +'<div style="font-size:11.5px;color:var(--t3);margin:4px 0;">Hold these before assigning an action — the staff member is re-checking them.</div>'
        +L.slice(0,40).map(function(x){ return '<div class="nflm-it"><b>'+scEsc(x.cp.id)+'</b> · '+scEsc(x.item.t||'')+'<small>'+scEsc(x.name)+(x.role?' ('+scEsc(x.role)+')':'')+' · Day '+(x.di+1)+' · '+scEsc(x.e.at?scFmtDate(x.e.at):'')+'</small>'
          +'<em>'+scEsc(x.e.by||'')+(x.e.note?': “'+scEsc(x.e.note)+'”':'')+'</em></div>'; }).join('')+'</details>';
      var i=h.indexOf('<div class="scx-tiles">'); return i>=0?h.slice(0,i)+blk+h.slice(i):blk+h; }catch(e){ return h; } }; }
})();
