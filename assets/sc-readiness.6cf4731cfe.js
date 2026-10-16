
// ══════════════════════════════════════════════════════════════
// READINESS REDESIGN + SEPARATE SERVICE DROPDOWNS
//  • NQAS status: one line with ⓘ; the full list of Standards below minimum opens on tap.
//  • Structure · Process · Outcome: three donut charts.
//  • 8 AoC cards and 12 service-package cards (+ cross-cutting areas): current, baseline, change.
//  • Card Editor: "Service package" and "Cross-cutting area" are separate dropdowns.
// ══════════════════════════════════════════════════════════════
function rdChange(cur,base){
  if(!base||!base.assessed) return '<span class="rd-ch na">no baseline</span>';
  var d=cur.pct-base.pct; return '<span class="rd-ch '+(d>0?'up':d<0?'down':'eq')+'">'+(d>0?'▲ +':d<0?'▼ ':'')+d+'</span>';
}
function rdDonut(label,sub,cur,base){
  var size=124, st=14, r=(size-st)/2, c=2*Math.PI*r, p=cur.assessed?cur.pct:0, a=p/100*c, col=scPctColor(p);
  var tick=base&&base.assessed?'<circle cx="62" cy="62" r="'+r+'" stroke="var(--org)" stroke-width="'+(st+4)+'" fill="none" stroke-dasharray="3 '+c+'" stroke-dashoffset="'+(-(base.pct/100*c)+1.5)+'" transform="rotate(-90 62 62)"/>':'';
  return '<div class="rd-donut"><div class="rd-dn"><svg viewBox="0 0 124 124" width="124" height="124"><circle cx="62" cy="62" r="'+r+'" stroke="#EAEFEE" stroke-width="'+st+'" fill="none"/>'
    +'<circle cx="62" cy="62" r="'+r+'" stroke="'+col+'" stroke-width="'+st+'" fill="none" stroke-linecap="round" stroke-dasharray="'+a+' '+c+'" transform="rotate(-90 62 62)"/>'+tick+'</svg>'
    +'<span><b style="color:'+scPctText(p)+'">'+(cur.assessed?p+'%':'—')+'</b><small>'+cur.assessed+'/'+cur.n+'</small></span></div>'
    +'<div class="rd-dl"><b>'+scEsc(label)+'</b><small>'+scEsc(sub)+'</small><div>'+(base&&base.assessed?'Baseline '+base.pct+'% ':'')+rdChange(cur,base)+'</div></div></div>';
}
function rdCard(title,sub,cur,base){
  var p=cur.assessed?cur.pct:0, bp=base&&base.assessed?base.pct:null;
  return '<div class="rd-card"><div class="rd-ct"><b title="'+scEsc(title)+'">'+scEsc(title)+'</b>'+(sub?'<small>'+scEsc(sub)+'</small>':'')+'</div>'
    +'<div class="rd-cv"><b style="color:'+(cur.assessed?scPctText(p):'var(--t3)')+'">'+(cur.assessed?p+'%':'—')+'</b>'+rdChange(cur,base)+'</div>'
    +'<div class="rd-cb"><i style="width:'+p+'%;background:'+scPctColor(p)+'"></i>'+(bp!==null?'<em style="left:'+bp+'%"></em>':'')+'</div>'
    +'<div class="rd-cf"><span>Baseline '+(bp!==null?bp+'%':'—')+'</span><span>'+cur.assessed+'/'+cur.n+' assessed</span></div></div>';
}
function rdNqasLine(a,hostId){
  var n=a.nqas||scNqasCheckV2(a), id='rd-nq-'+scJs(hostId);
  var cls=!n.hasData?'na':n.meets?'ok':'no';
  var txt=!n.hasData?'NQAS: no assessment yet':n.meets?'✓ Meets NQAS criteria':'✗ Not yet at NQAS criteria';
  var brief=!n.hasData?'':'Overall '+a.pct+'% (needs '+n.overallMin+'%)'+(n.stdFails.length?' · '+n.stdFails.length+' of '+Object.keys(a.byStd).length+' Standards below minimum':'');
  return '<details class="rd-nq '+cls+'" id="'+id+'"><summary><b>'+scEsc(txt)+'</b><span>'+scEsc(brief)+'</span><i class="ti ti-info-circle" title="Details"></i></summary>'+scNqasBoxHTML(a)+'</details>';
}
scInsReadinessHTML=function(st,openCnt,overdueCnt){
  var a=st.agg, B=a.baseline||{}, hasB=!!B.assessed;
  var tile=function(v,l,col,title){ return '<div class="scx-tile"'+(title?' title="'+scEsc(title)+'"':'')+'><div class="scx-tile-v"'+(col?' style="color:'+col+';"':'')+'>'+v+'</div><div class="scx-tile-l">'+l+'</div></div>'; };
  var h='<div style="font-size:11px;color:var(--t3);font-weight:700;margin-bottom:8px;">Package: <span style="color:var(--teal-dk);font-weight:900;">'+scEsc(scPkgLabel(st.progId))+'</span> · '+a.total+' NQAS checkpoints · each counted once at its latest score, lowest score when staff differ</div>'
    +'<div class="scx-tiles">'
    +tile(a.pct+'%','Current readiness',scPctText(a.pct),'Points earned ÷ maximum for the whole package (unassessed = 0)')
    +tile(hasB?B.pct+'%':'—','Baseline (pre-assessment)',hasB?scPctText(B.pct):'var(--t3)','First assessment of each checkpoint')
    +tile(hasB?((a.pct-B.pct>=0?'+':'')+(a.pct-B.pct)):'—','Change since baseline',hasB?(a.pct-B.pct>0?'var(--green-dk)':a.pct-B.pct<0?'var(--red-dk)':'var(--t3)'):'var(--t3)')
    +tile(a.coverage.assessed+'/'+a.total,'Checkpoints assessed ('+a.coverage.pct+'%)')
    +tile(a.assessed?a.compliance+'%':'—','Compliance on assessed',a.assessed?scPctText(a.compliance):'var(--t3)')
    +tile(openCnt,'Open gaps','var(--amber-dk)')
    +tile(overdueCnt,'Overdue actions',overdueCnt?'var(--red-dk)':'var(--t3)')
    +tile(a.daysComplete+'/'+a.totalDays,'Days completed')
    +tile(a.daysVerified+'/'+a.daysDone,'Cards verified')
    +'</div>'+rdNqasLine(a,st.hostId);
  var aocsOf=function(k){ return Object.keys(SC_CPM_AOC).filter(function(x){ return scAocCat(x)===k; }).join(', '); };
  h+='<div class="scx-sub">Structure · Process · Outcome <span class="scc-hint">orange tick = baseline</span></div><div class="rd-donuts">'
    +SC_AOC_CATS.map(function(k){ var b=a.byCat[k]; return b?rdDonut(k,'AoC '+aocsOf(k),b,B.byCat&&B.byCat[k]):''; }).join('')+'</div>';
  h+='<div class="scx-sub">Areas of Concern</div><div class="rd-grid">'
    +Object.keys(SC_CPM_AOC).map(function(k){ var b=a.byAoc[k]; return b?rdCard('AoC '+k+' · '+SC_CPM_AOC[k],scAocCat(k),b,B.byAoc&&B.byAoc[k]):''; }).join('')+'</div>';
  var stds=Object.keys(a.byStd).sort(scStdCmp);
  h+='<div class="scx-sub">By Standard <span class="scc-hint">minimum to pass NQAS shown for each</span></div><div class="scc-std">'
    +'<table><thead><tr><th>Standard</th><th>Current</th><th>Min</th><th></th><th>Baseline</th><th>Assessed</th></tr></thead><tbody>'
    +stds.map(function(s){ var b=a.byStd[s], m=scNqasStdMin(s), ok=b.pct>=m, bb=B.byStd&&B.byStd[s];
      return '<tr class="'+(ok?'ok':'no')+'"><td><b>'+s+'</b> <span>'+scEsc((scRegTitle('std',s)||'').slice(0,46))+'</span></td><td style="color:'+scPctText(b.pct)+';"><b>'+b.pct+'%</b></td><td>'+m+'%</td><td>'+(ok?'✓':'✗')+'</td><td>'+(bb&&bb.assessed?bb.pct+'%':'—')+'</td><td>'+b.assessed+'/'+b.n+'</td></tr>'; }).join('')
    +'</tbody></table></div>';
  ['service','support'].forEach(function(g){
    var order=SC_SVC_GROUPS[g], names=Object.keys(a.byService).filter(function(k){ return scSvcGroup(k)===g; });
    names.sort(function(x,y){ return (order.indexOf(x)<0?99:order.indexOf(x))-(order.indexOf(y)<0?99:order.indexOf(y)); });
    if(names.length) h+='<div class="scx-sub">'+scEsc(SC_SVC_GROUP_LABEL[g])+' <span class="scc-hint">'+names.length+'</span></div><div class="rd-grid'+(g==='support'?' sm':'')+'">'
      +names.map(function(k){ return rdCard(k,'',a.byService[k],B.byService&&B.byService[k]); }).join('')+'</div>';
  });
  return h;
};

// ── Card Editor: separate "Service package" and "Cross-cutting area" ──
function rdSvcSplit(cur){
  var all=scCpmServices(), pk=all.filter(function(s){ return scSvcGroup(s)==='service'; }), ar=all.filter(function(s){ return scSvcGroup(s)!=='service'; });
  var order=SC_SVC_GROUPS.service; pk.sort(function(x,y){ return order.indexOf(x)-order.indexOf(y); }); ar.sort();
  var isPk=pk.indexOf(cur)>=0;
  return [{key:'svcPkg',label:'Service package',type:'select',value:isPk?cur:'',options:[{value:'',label:'— none —'}].concat(pk.map(function(s){ return {value:s,label:s}; }))},
          {key:'svcArea',label:'Cross-cutting area',type:'select',value:(!isPk&&cur)?cur:'',options:[{value:'',label:'— none —'}].concat(ar.map(function(s){ return {value:s,label:s}; }))}];
}
(function(){
  var oDlg=scDialog;
  scDialog=function(o){
    var i=(o&&o.fields||[]).findIndex(function(f){ return f&&f.key==='svc'&&f.label==='Service / area'; });
    if(i<0) return oDlg.apply(this,arguments);
    var cur=o.fields[i].value||'', o2=Object.assign({},o), fields=o.fields.slice(); fields.splice.apply(fields,[i,1].concat(rdSvcSplit(cur))); o2.fields=fields;
    var oVal=o.validate;
    o2.validate=function(v){ if(v.svcPkg&&v.svcArea) return 'Choose either a service package or a cross-cutting area — not both.';
      var vv=Object.assign({},v,{svc:v.svcPkg||v.svcArea||''}); return oVal?oVal(vv):null; };
    return oDlg.call(this,o2).then(function(v){ if(!v) return v; v.svc=v.svcPkg||v.svcArea||''; delete v.svcPkg; delete v.svcArea; return v; });
  };
  var oRender=scCpmRender;
  scCpmRender=function(){
    var r=oRender.apply(this,arguments);
    try{ var sel=[].slice.call(document.querySelectorAll('#scm-panel .scm-filters select')).find(function(s){ return s.options[0]&&s.options[0].text==='All services / areas'; });
      if(sel){ var u=_scCpmUi, all=[].slice.call(sel.querySelectorAll('option')).map(function(o){ return o.value; }).filter(Boolean);
        var mk=function(lbl,list){ var s=document.createElement('select'); s.className='rd-svcsel';
          s.innerHTML='<option value="">'+scEsc(lbl)+'</option>'+list.map(function(n){ return '<option value="'+scEsc(n)+'"'+(u.svc===n?' selected':'')+'>'+scEsc(n)+'</option>'; }).join('');
          s.onchange=function(){ _scCpmUi.svc=this.value; scCpmRender(); }; return s; };
        var order=SC_SVC_GROUPS.service, pk=all.filter(function(n){ return scSvcGroup(n)==='service'; }).sort(function(x,y){ return order.indexOf(x)-order.indexOf(y); }), ar=all.filter(function(n){ return scSvcGroup(n)!=='service'; }).sort();
        var a=mk('All service packages',pk), b=mk('All cross-cutting areas',ar);
        sel.parentNode.insertBefore(a,sel); sel.parentNode.insertBefore(b,sel); sel.remove(); } }catch(e){ console.warn(e); }
    return r;
  };
})();
