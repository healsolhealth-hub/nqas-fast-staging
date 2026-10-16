
Object.assign(HINDI_UI,{'My gaps':'मेरी कमियाँ','This week':'इस सप्ताह','Fix & re-score':'सुधारें और दोबारा स्कोर करें','No open gaps — well done!':'कोई खुली कमी नहीं — बहुत बढ़िया!',
  'Action assigned':'कार्य सौंपा गया','Other gaps — for later weeks':'अन्य कमियाँ — अगले सप्ताहों के लिए','Not met':'पूरा नहीं','Not met yet:':'अभी पूरा नहीं:',
  'Your open gaps. Fix what you can — simple things like a register, display or stock — then open the card and re-score. This week\'s theme comes first.':'आपकी खुली कमियाँ। जो आप ठीक कर सकते हैं — जैसे रजिस्टर, डिस्प्ले या स्टॉक — ठीक करें, फिर कार्ड खोलकर दोबारा स्कोर करें। इस सप्ताह का विषय पहले है।'});
// action text in the reader's language (standard "make this met" actions follow the MoV item; a Supervisor's own words stay as written)
function nfActText(a,lang){
  lang=lang||((typeof _appLang!=='undefined'&&_appLang==='hi')?'hi':'en');
  var std=/^(Make this met: |Baseline gap — make these met: |Reach Full compliance on this checkpoint)/.test(a.action||'');
  if(lang!=='hi'||!std) return a.action||'';
  var cp=(typeof scCpmGet==='function'&&a.cpId)?scCpmGet(a.cpId):null, it=cp&&a.item!=null?(cp.items||[])[+a.item]:null;
  if(it&&it.h) return 'यह पूरा करें: '+it.h;
  if(/^Reach Full compliance/.test(a.action)) return 'इस चेकपॉइंट पर पूर्ण अनुपालन प्राप्त करें';
  return a.action||'';
}
(function(){
  if(typeof scMyOpenActions==='function'){ var oM=scMyOpenActions;
    scMyOpenActions=function(){ var L=oM.apply(this,arguments); if(typeof _appLang==='undefined'||_appLang!=='hi') return L;
      return L.map(function(a){ return Object.assign({},a,{action:nfActText(a,'hi')}); }); }; }
})();
// ── My gaps (staff Today) ─────────────────────────────────────
function nfThisWeek(){ var d=(typeof scb1TodayIdx==='function'?scb1TodayIdx():-1)+1, w=null; (SC_IMPL_WEEKS||[]).forEach(function(x){ if(d>=x.start) w=x; }); return d>=8&&d<=49?w:null; }
function nfMyGaps(){
  if(typeof choState==='undefined'||!choState||!choState.cards) return [];
  var R=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), wk=nfThisWeek(), acts=[]; try{ acts=scMyOpenActions(); }catch(e){}
  return (R.gaps||[]).filter(function(g){ return !g.closed; }).map(function(g){
    var c=choState.cards[g.di]||{}, n=(g.cp.items||[]).length, tk=n?scTicksFor(c,g.ci,n):[], unmet=n?g.cp.items.map(function(it,k){ return {it:it,k:k}; }).filter(function(u){ return tk[u.k]===0; }):[];
    var inWk=!!(wk&&wk.match&&(function(){ try{ return wk.match(g.cp); }catch(e){ return false; } })());
    var act=acts.find(function(a){ return a.cpId===g.cp.id; })||null;
    return {g:g,unmet:unmet,wk:inWk,act:act};
  }).sort(function(a,b){ return (b.wk-a.wk)||(a.g.score-b.g.score)||(a.g.di-b.g.di); });
}
function nfGapsHTML(){
  var L=nfMyGaps(), hi=typeof _appLang!=='undefined'&&_appLang==='hi';
  if(!L.length) return '<div class="nftt-empty">'+scEsc(t('No open gaps — well done!'))+'</div>';
  var one=function(x){ var g=x.g;
      return '<div class="nfg-it'+(x.wk?' wk':'')+'"><div class="nfg-meta">'+(x.wk?'<span class="wk">⭐ '+scEsc(t('This week'))+'</span>':'')+(x.act?'<span class="act">📌 '+scEsc(t('Action assigned'))+'</span>':'')
        +'<span>Day '+(g.di+1)+' · '+scEsc(g.cp.id)+' · AoC '+scEsc(g.aoc||g.cp.aoc||'')+'</span><span>· '+scEsc(g.score===1?t('Partial'):t('Not met'))+'</span></div>'
        +'<div class="nfg-cp">'+scEsc(getCPText(g.cp)||g.cp.t||'')+'</div>'
        +(x.unmet.length?x.unmet.slice(0,4).map(function(u){ return '<div class="nfg-mov">'+scEsc(hi&&u.it.h?u.it.h:u.it.t)+'</div>'+(typeof nfFixHTML==='function'?nfFixHTML(g.cp,u.k,false):''); }).join(''):(typeof nfFixHTML==='function'?nfFixHTML(g.cp,null,false):''))
        +'<button class="scx-btn sm" onclick="scOpenActionCard('+(+g.di)+')"><i class="ti ti-arrow-right"></i> '+scEsc(t('Fix & re-score'))+'</button></div>'; };
  var now=L.filter(function(x){ return x.wk||x.act; }), later=L.filter(function(x){ return !(x.wk||x.act); });
  if(!now.length){ now=later; later=[]; }
  return '<div class="nfg-intro">'+scEsc(t('Your open gaps. Fix what you can — simple things like a register, display or stock — then open the card and re-score. This week\'s theme comes first.'))+'</div>'
    +now.map(one).join('')
    +(later.length?'<details class="nfg-later"><summary>'+scEsc(t('Other gaps — for later weeks'))+' ('+later.length+')</summary>'+later.map(one).join('')+'</details>':'');
}
(function(){
  if(typeof nfTTPlace!=='function') return;
  var oP=nfTTPlace;
  nfTTPlace=function(){
    var want=_nfTT; oP.apply(this,arguments);
    try{
      var slot=document.querySelector('#nf-today #nf-tt'), tabs=slot&&slot.querySelector('.nftt-tabs'); if(!tabs) return;
      var n=nfMyGaps().length;
      tabs.insertAdjacentHTML('beforeend','<button type="button" class="'+(want==='g'?'on':'')+'" onclick="_nfTT=\'g\';nfTTPlace()">🔧 '+scEsc(t('My gaps'))+' <b>'+n+'</b></button>');
      if(want==='g'){ _nfTT='g';
        tabs.querySelectorAll('button').forEach(function(b){ b.classList.toggle('on',/My gaps|मेरी कमियाँ/.test(b.textContent)); });
        var pane=slot.querySelector('#nftt-pane'), park=document.getElementById('nftt-park');
        if(pane){ [].slice.call(pane.children).forEach(function(ch){ if(park&&(ch.id==='ws-actions-section'||ch.id==='ws-verify-section')) park.appendChild(ch); });
          pane.classList.add('all'); pane.innerHTML=nfGapsHTML(); }
        var more=slot.querySelector('.nftt-more'); if(more) more.remove(); }
    }catch(e){ console.warn('[SC] my gaps',e); }
  };
})();
// ── WhatsApp: Hindi or English per message ─────────────────────
var _nfPwLang='hi';
(function(){
  if(typeof nfPwText!=='function') return;
  var oT=nfPwText;
  nfPwText=function(st,p){
    if(_nfPwLang!=='hi') return oT.apply(this,arguments);
    var f=st.fac||{}, nm=f.name||st.code, first=String(p.name||'').split(' ')[0], me=scActor()||{}, L=p.acts, N=6;
    var lines=['नमस्ते'+(first?' '+first:'')+' जी,',nm+' की NQAS | FAST कार्य योजना तैयार है। आपके '+L.length+' कार्य हैं'+(p.od?' ('+p.od+' समय से पीछे)':'')+':',''];
    L.slice(0,N).forEach(function(a,i){ lines.push((i+1)+'. '+nfActText(a,'hi')+(a.cpId?' ['+a.cpId+']':'')+(a._with?' ('+(a._withHi||a._with)+' के साथ)':'')+(a.dueDate?' — '+scFmtDate(a.dueDate)+' तक':'')+(a._s==='overdue'?' (समय निकल गया)':'')); });
    if(L.length>N) lines.push('…और '+(L.length-N)+' कार्य ऐप में।');
    lines.push('','NQAS | FAST खोलें → Today → मेरे कार्य। काम पूरा होने पर "Done — ready for re-check" दबाएँ।');
      lines.push('— '+(me.name||'')+(me.role?' ('+me.role+')':''));
    return lines.join('\n');
  };
  if(typeof nfPlanNotify==='function'){ var oN=nfPlanNotify;
    nfPlanNotify=function(hostId,justPublished){ var r=oN.apply(this,arguments);
      try{ var box=document.querySelector('#nf-pw-ov .scx-box'), list=box&&box.querySelector('.nfpw-list'); if(list&&!box.querySelector('.nfpw-lang')){
        list.insertAdjacentHTML('beforebegin','<div style="text-align:center;"><div class="nfpw-lang"><button type="button" data-l="hi" class="'+(_nfPwLang==='hi'?'on':'')+'">हिंदी</button><button type="button" data-l="en" class="'+(_nfPwLang==='en'?'on':'')+'">English</button></div><div style="font-size:11px;color:var(--t3);">Message language</div></div>');
        box.querySelectorAll('.nfpw-lang button').forEach(function(b){ b.onclick=function(){ _nfPwLang=b.getAttribute('data-l'); box.querySelectorAll('.nfpw-lang button').forEach(function(x){ x.classList.toggle('on',x===b); }); }; }); } }catch(e){}
      return r; }; }
})();
