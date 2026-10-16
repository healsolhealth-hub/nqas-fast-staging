
SC_CPM_FIELDS.push('fix');   // "How to fix" per MoV item, edited in Card Editor
Object.assign(HINDI_UI,{'How to fix':'कैसे सुधारें','Evidence to show':'दिखाने का प्रमाण','Time':'समय','Answers that don\'t match':'जो उत्तर मेल नहीं खाते',
  'Doesn\'t match':'मेल नहीं खाता','you marked':'आपने चिह्नित किया','Met':'पूरा','Not met':'पूरा नहीं','Please re-check one of them.':'कृपया इनमें से एक दोबारा जाँचें।'});
function nfHi(){ return typeof _appLang!=='undefined'&&_appLang==='hi'; }
// ── How to fix ───────────────────────────────────────────────
function nfFixKey(cp,k){ return (cp&&(cp.items||[]).length&&k!=null)?String(+k+1):'0'; }      // app item index (0-based) → sheet MoV number
function nfFixOf(cp,k){
  if(!cp||!cp.id) return null; var key=nfFixKey(cp,k), m=scCpmGet(cp.id), e=m&&m.fix&&m.fix[key];
  if(e) return {who:e.w||'S',fx:e.f||'',fxh:e.fh||'',ev:e.e||'',evh:e.eh||'',tm:e.tm||''};
  var d=(NF_FIX[cp.id]||{})[key]; return d?{who:d[0],fx:d[1],fxh:d[2],ev:d[3],evh:d[4],tm:d[5]}:null;
}
function nfIsEach(cp,k,text){ var f=nfFixOf(cp,k); return f?f.who==='E':nfEachPerson(text); }
function nfFixHTML(cp,k,open){
  var f=nfFixOf(cp,k); if(!f) return ''; var hi=nfHi(), fx=hi&&f.fxh?f.fxh:f.fx, ev=hi&&f.evh?f.evh:f.ev;
  return '<details class="nffx"'+(open?' open':'')+'><summary>'+scEsc(t('How to fix'))+'</summary><div class="nffx-b">'+scEsc(fx)+'</div>'
    +(ev?'<div class="nffx-ev">'+scEsc(t('Evidence to show'))+': '+scEsc(ev)+'</div>':'')+(f.tm?'<div class="nffx-tm">⏱ '+scEsc(f.tm)+'</div>':'')+'</details>';
}
// ── Linked checks: who said Met / Not met where ─────────────────
var _nfLkByCp=null, _nfCpPos={};
function nfLkByCp(){ if(_nfLkByCp) return _nfLkByCp; var I={}; NF_LINKS.forEach(function(l,i){ [l[0],l[2]].forEach(function(id){ (I[id]=I[id]||[]).push(i); }); }); return (_nfLkByCp=I); }
function nfCpPos(progId){
  var key=progId+'|'+_scCpm.ver; if(_nfCpPos[key]) return _nfCpPos[key];
  var P={}, n=(getProg(progId)||{}).days||60;
  for(var di=n-1;di>=0;di--){ var d=scDayDef(progId,di); ((d&&d.cps)||[]).forEach(function(cp,ci){ if(cp&&cp.id) (P[cp.id]=P[cp.id]||[]).push({di:di,ci:ci}); }); }
  return (_nfCpPos[key]=P);
}
// latest answer of one person: get(di) → their card record
function nfAnsOf(progId,get,cpId,K){
  var L=nfCpPos(progId)[cpId]||[];
  for(var i=0;i<L.length;i++){ var p=L[i], rec=get(p.di); if(!rec) continue; var cp=scDayDef(progId,p.di).cps[p.ci], n=(cp.items||[]).length;
    if(!n||!K){ if(K&&!n) return null; var s=scNormScore((rec.cpScores||[])[p.ci]); if(s===null) continue; return {v:s===2?1:0,di:p.di,ci:p.ci,cp:cp,k:null}; }
    if(K>n) return null; var raw=(rec.cpTicks||{})['c'+p.ci]; if(raw==null) raw=(rec.cpTicks||{})[p.ci]; var tk=Array.isArray(raw)?raw:scTicksFromStr(raw||'',n), v=tk[K-1]; if(v===0||v===1) return {v:v,di:p.di,ci:p.ci,cp:cp,k:K-1}; }
  return null;
}
function nfContras(progId,get,onlyCp){
  var out=[], idx=onlyCp?(nfLkByCp()[onlyCp]||[]):NF_LINKS.map(function(_,i){ return i; });
  idx.forEach(function(i){ var l=NF_LINKS[i], a=nfAnsOf(progId,get,l[0],l[1]); if(!a) return; var b=nfAnsOf(progId,get,l[2],l[3]); if(!b) return;
    if(a.v===1&&b.v===0) out.push({i:i,l:l,a:a,b:b,rev:false}); else if(l[5]&&a.v===0&&b.v===1) out.push({i:i,l:l,a:a,b:b,rev:true}); });
  return out.sort(function(x,y){ return (x.l[4]==='S'?0:1)-(y.l[4]==='S'?0:1); });
}
function nfAnsText(x,hi,full){ var it=x.k!=null?(x.cp.items||[])[x.k]:null, s=it?(hi&&it.h?it.h:it.t):(hi&&x.cp.hi?x.cp.hi:x.cp.t); s=String(s||''); return full||s.length<=90?s:s.slice(0,s.lastIndexOf(' ',86)>40?s.lastIndexOf(' ',86):86)+'…'; }
function nfCxWhy(c){ return nfHi()&&c.l[7]?c.l[7]:c.l[6]; }
// ── staff: note under the checkpoint, and a nudge when a tick creates a mismatch ──
function nfMyGet(di){ return (choState.cards||{})[di]; }
(function(){
  var oCard=renderCard;
  renderCard=function(di){ var r=oCard.apply(this,arguments);
    try{ if(appMode!=='cho'||!choState||!choState.cards) return r; di=+di; var hi=nfHi(), L=nfContras(choState.progId,nfMyGet);
      L.forEach(function(c){ [['a','b'],['b','a']].forEach(function(s){ var me=c[s[0]], other=c[s[1]]; if(me.di!==di) return;
        var el=document.getElementById('cp-'+di+'-'+me.ci); if(!el||el.querySelector('.nfcx[data-i="'+c.i+'"]')) return;
        var oth='“'+nfAnsText(other,hi)+'”', where=other.di===di?'':' ('+(hi?'दिन ':'Day ')+(other.di+1)+')';
        var link=other.di!==di?' <a onclick="selectDay('+(other.di+1)+')">'+(hi?'दिन '+(other.di+1)+' खोलें':'Open Day '+(other.di+1))+'</a>':'';
        el.insertAdjacentHTML('beforeend','<div class="nfcx'+(c.l[4]==='S'?' s':'')+'" data-i="'+c.i+'">⚠️ <b>'+scEsc(t('Doesn\'t match'))+':</b> '+scEsc(t('you marked'))+' '+scEsc(oth)+where+' <b>'+scEsc(t(other.v===1?'Met':'Not met'))+'</b>. '+scEsc(nfCxWhy(c))+' '+scEsc(t('Please re-check one of them.'))+link+'</div>'); }); });
    }catch(e){ console.warn('[SC] linked checks',e); }
    return r; };
  var oTick=tickCP;
  tickCP=function(di,ci,k,val){ var cp=((getDay(di)||{}).cps||[])[ci], before=cp&&cp.id?nfContras(choState.progId,nfMyGet,cp.id).length:0;
    var r=oTick.apply(this,arguments);
    try{ if(cp&&cp.id){ var after=nfContras(choState.progId,nfMyGet,cp.id); if(after.length>before) showToast('⚠️ '+nfCxWhy(after[0])+' '+t('Please re-check one of them.'),'err'); } }catch(e){}
    return r; };
})();
// ── Quality Champion / Supervisor baseline review: contradictions first, red flag ──
function nfSelfRec(rec){ if(!rec||!rec.blSelf) return rec; var r=Object.assign({},rec,{cpTicks:Object.assign({},rec.cpTicks||{}),cpScores:(rec.cpScores||[]).slice()});
  Object.keys(rec.blSelf).forEach(function(k){ var s=rec.blSelf[k]||{}, ci=+String(k).slice(1); if(s.t!=null) r.cpTicks[k]=s.t; if(s.s!=null) r.cpScores[ci]=s.s; }); return r; }
var _nfBlCx={};
(function(){
  if(typeof nfBlFlags!=='function') return;
  var oF=nfBlFlags;
  nfBlFlags=function(ctx,di,items){ var fl=oF.apply(this,arguments); _nfBlCx={};
    try{ var mobs={}; items.forEach(function(x){ mobs[x.mob]=1; });
      Object.keys(mobs).forEach(function(m){ var get=function(d){ return nfSelfRec(nfBlRec(ctx,m,d)); }, L=nfContras(ctx.progId,get);   // the staff's own answers: stable while reviewers change items
        L.forEach(function(c){ [c.a,c.b].forEach(function(x,j){ if(x.di!==di) return; var key=m+'|'+x.ci+'|'+(x.k==null?'s':String(x.k)); var o=j?c.a:c.b;
          (_nfBlCx[key]=_nfBlCx[key]||[]).push({c:c,o:o}); }); });
        if(L.some(function(c){ return c.a.di===di||c.b.di===di; })) (fl[m]=fl[m]||[]).push('Answers contradict'); });
    }catch(e){ console.warn('[SC] review contradictions',e); }
    return fl; };
  nfBlPick=function(items,flags,seed){
    var cand=items.filter(nfBlSelfMet), rnd=scRand(scHashSeed(seed));   // still only the staff's own Met items; contradictions go first
    cand.forEach(function(x){ x._p=_nfBlCx[x.mob+'|'+x.ci+'|'+x.k]?0:flags[x.mob]?1:nfBlStdHigh(x.cp)?2:3; x._r=rnd(); });
    cand.sort(function(a,b){ return (a._p-b._p)||(a._r-b._r); });
    return cand.slice(0,NF_BL.pick);
  };
  if(typeof nfBlItemHTML==='function'){ var oI=nfBlItemHTML;
    nfBlItemHTML=function(x){ var h=oI.apply(this,arguments), L=_nfBlCx[x.mob+'|'+x.ci+'|'+x.k]; if(!L||!L.length) return h;
      var note=L.slice(0,2).map(function(e){ return '<div class="nfcx'+(e.c.l[4]==='S'?' s':'')+'">⚠️ Does not match Day '+(e.o.di+1)+': “'+scEsc(nfAnsText(e.o,false))+'” is '+(e.o.v===1?'Met':'Not met')+'. '+scEsc(e.c.l[6])+'</div>'; }).join('');
      var i=h.lastIndexOf('</div>'); return i>0?h.slice(0,i)+note+h.slice(i):h+note; }; }
})();
// ── Supervisor / HealSol / District: Review & Action Plan → answers that don't match ──
function nfCxCardHTML(st){
  var staff=st.staff||{}, rows=[];
  Object.keys(st.progress||{}).forEach(function(m){ var s=staff[m]; if(!s||s.disabled) return; var P=st.progress[m]||{};
    nfContras(st.progId,function(d){ return P['day_'+d]; }).forEach(function(c){ rows.push({m:m,s:s,c:c}); }); });
  if(!rows.length) return '';
  rows.sort(function(x,y){ return (x.c.l[4]==='S'?0:1)-(y.c.l[4]==='S'?0:1)||String(x.s.name).localeCompare(String(y.s.name)); });
  var lim=st._cxAll?rows.length:8, H=scJs(st.hostId);
  return '<div class="nfcx-card"><h4>⚠️ Answers that don\'t match ('+rows.length+')</h4><div class="scq-muted" style="margin-bottom:6px;">Linked items where one is marked Met and the other Not met. Ask the staff member to re-check, or check it on your next visit.</div>'
    +rows.slice(0,lim).map(function(x){ var c=x.c;
      return '<div class="nfcx-row"><span class="nfcx-chip'+(c.l[4]==='S'?'':' c')+'">'+(c.l[4]==='S'?'Strong':'Check')+'</span><b>'+scEsc(x.s.name||x.m)+'</b> ('+scEsc(x.s.role||'CHO')+') · '
        +'<b>Met</b>: '+scEsc(c.l[0])+' “'+scEsc(nfAnsText(c.a,false))+'” (Day '+(c.a.di+1)+') — <b>Not met</b>: '+scEsc(c.l[2])+' “'+scEsc(nfAnsText(c.b,false))+'” (Day '+(c.b.di+1)+')'
        .replace(/^/,'')+(c.rev?' <small>(reverse check)</small>':'')+'<small>'+scEsc(c.l[6])+'</small></div>'; }).join('')
    +(rows.length>lim?'<button class="scx-btn sm ghost" style="margin-top:6px;" onclick="_scIns[\''+H+'\']._cxAll=1;scInsRender(\''+H+'\')">Show all '+rows.length+'</button>':'')+'</div>';
}
(function(){
  var oR=scRvReviewHTML;
  scRvReviewHTML=function(st){ var h=oR.apply(this,arguments); try{ var cx=nfCxCardHTML(st); if(cx){ var i=h.indexOf('<div class="scx-tiles">'); h=i>=0?h.slice(0,i)+cx+h.slice(i):cx+h; } }catch(e){ console.warn('[SC] contradictions card',e); } return h; };
})();
// ── who fixes: the guide decides shared / each person (wording only as a fallback) ──
// ── staff: "How to fix" under My gaps items and on standard actions ──
(function(){
  if(typeof scRenderWsActions==='function'){ var oWs=scRenderWsActions;
    scRenderWsActions=function(){ var r=oWs.apply(this,arguments);
      try{ var cards=document.querySelectorAll('#ws-actions-section .scx-act-card'), list=scMyOpenActions();
        [].forEach.call(cards,function(el,i){ var a=list[i]; if(!a||!a.cpId||el.querySelector('.nffx')) return; var cp=scCpmGet(a.cpId); if(!cp) return;
          var h=nfFixHTML(cp,a.item==null?null:+a.item,false); if(h){ var tx=el.querySelector('.scx-act-text'); if(tx) tx.insertAdjacentHTML('afterend',h); } }); }catch(e){}
      return r; }; }
})();
// ── HealSol: Card Editor → "How to fix" for each MoV item ──
async function nfFixEdit(id){
  if(!scCpmCanEdit()){ showToast('Only HealSol Admin can edit the Checkpoint Master.','err'); return; }
  var c=scCpmGet(id); if(!c) return; var its=(c.items||[]).length?c.items:[{t:c.t+' (whole checkpoint)'}], fields=[];
  its.forEach(function(it,k){ var kk=(c.items||[]).length?k:null, f=nfFixOf(c,kk)||{who:'S',fx:'',fxh:'',ev:'',evh:'',tm:''}, n=k;
    fields.push({type:'info',value:((c.items||[]).length?'MoV '+(k+1)+': ':'')+it.t},
      {key:'w'+n,label:'Who fixes',type:'select',value:f.who,options:[{value:'S',label:'Shared fix — one fix for the Sub-Centre (goes to the role Lead)'},{value:'E',label:'Each person — everyone must show it'}]},
      {key:'f'+n,label:'How to fix — steps (English, one step per line)',type:'textarea',rows:4,value:f.fx},
      {key:'fh'+n,label:'How to fix — steps (Hindi, same steps)',type:'textarea',rows:4,value:f.fxh},
      {key:'e'+n,label:'Evidence to show (English)',value:f.ev},{key:'eh'+n,label:'Evidence to show (Hindi)',value:f.evh},
      {key:'tm'+n,label:'Time to fix',value:f.tm,placeholder:'e.g. 1 week, Ongoing'}); });
  var v=await scDialog({title:'How to fix — '+id,icon:'🔧',wide:true,okLabel:'Save',message:c.t,fields:fields}); if(!v) return;
  var fix={}; its.forEach(function(_,k){ var key=(c.items||[]).length?String(k+1):'0';
    fix[key]={w:v['w'+k]==='E'?'E':'S',f:String(v['f'+k]||'').trim(),fh:String(v['fh'+k]||'').trim(),e:String(v['e'+k]||'').trim(),eh:String(v['eh'+k]||'').trim(),tm:String(v['tm'+k]||'').trim()}; });
  var ok=await scCpmSave(id,{fix:fix}); showToast(ok?'How to fix saved for '+id+'.':'Could not save — check connection.',ok?'ok':'err'); if(ok) scCpmRender();
}
(function(){
  var oRow=scCpmRowHTML;
  scCpmRowHTML=function(c){ var h=oRow.apply(this,arguments); if(c.kind!=='nqas') return h;
    var has=!!(NF_FIX[c.id]||(c.fix&&Object.keys(c.fix).length));
    return h.replace('<button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCpmEdit(','<button class="scx-btn sm ghost" style="flex:0 0 auto;" title="How to fix" onclick="nfFixEdit(\''+scJs(c.id)+'\')">🔧'+(c.fix?'✎':'')+'</button><button class="scx-btn sm ghost" style="flex:0 0 auto;" onclick="scCpmEdit('); };
})();
