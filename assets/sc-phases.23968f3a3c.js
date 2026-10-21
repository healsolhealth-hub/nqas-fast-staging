
// ══════════════════════════════════════════════════════════════
// PHASES — Baseline · Implementation · Endline (+ weekly progress, Standards heat-map)
//  Baseline = first assessment (Days 1–7). Implementation = readiness using cards up to Day 49.
//  Endline = readiness using cards up to Day 56 (shown once any revision card is done).
//  Weekly progress = the same snapshot at the end of each programme week.
// ══════════════════════════════════════════════════════════════
var NF_WEEK_START=[0,7,14,21,28,35,42,49,56], NF_WEEK_END=[6,13,20,27,34,41,48,55,59];
var NF_PH_COL={B:'#94A3B8',I:'#135A55',E:'#5048B4'};
var NF_PHASES=[{k:'Baseline',a:1,b:7},{k:'Implementation',a:8,b:49},{k:'End-line',a:50,b:56},{k:'Readiness week',a:57,b:60}];
function nfFilterProg(progress,maxDi){ var out={}; Object.keys(progress||{}).forEach(function(m){ var recs=progress[m]||{}, o={};
  Object.keys(recs).forEach(function(k){ var x=/^day_(\d+)$/.exec(k); if(!x||+x[1]<=maxDi) o[k]=recs[k]; }); out[m]=o; }); return out; }
function nfHasDone(progress,a,b){ return Object.keys(progress||{}).some(function(m){ return Object.keys(progress[m]||{}).some(function(k){ var x=/^day_(\d+)$/.exec(k); return x&&+x[1]>=a&&+x[1]<=b&&(progress[m][k]||{}).taskDone; }); }); }
// facility phases (cached per insights state / report call)
// which checkpoints were (re-)scored within a day range, and the buckets they belong to
function nfTouchedAdd(t,cp){ if(!cp||!cp.id||t.ids[cp.id]) return; t.ids[cp.id]=1; t.n++; var c=scCpmGet(cp.id)||cp;
  if(c.aoc){ t.aoc[c.aoc]=1; t.cat[scAocCat(c.aoc)]=1; } if(c.std) t.std[c.std]=1; if(c.svc) t.svc[c.svc]=1; }
function nfTouchedNew(){ return {n:0,ids:{},aoc:{},cat:{},std:{},svc:{}}; }
function nfTouched(pid,progress,a,b){
  var t=nfTouchedNew();
  Object.keys(progress||{}).forEach(function(m){ Object.keys(progress[m]||{}).forEach(function(k){ var x=/^day_(\d+)$/.exec(k); if(!x) return; var di=+x[1]; if(di<a||di>b) return;
    var rec=progress[m][k]||{}, d=scDayDef(pid,di); (rec.cpScores||[]).forEach(function(v,ci){ if(scNormScore(v)!==null&&d&&d.cps&&d.cps[ci]&&d.cps[ci].kind!=='milestone') nfTouchedAdd(t,d.cps[ci]); }); }); });
  return t;
}
function nfTouchedCards(pid,cards,a,b){
  var t=nfTouchedNew();
  Object.keys(cards||{}).forEach(function(k){ var di=+k; if(di<a||di>b) return; var c=cards[k]||{}, d=scDayDef(pid,di);
    (c.cpScores||[]).forEach(function(v,ci){ if(scNormScore(v)!==null&&d&&d.cps&&d.cps[ci]&&d.cps[ci].kind!=='milestone') nfTouchedAdd(t,d.cps[ci]); }); });
  return t;
}
// keep a phase value only for buckets with at least one checkpoint re-scored in that phase
function nfMask(agg,t){
  if(!agg) return null; var f=function(o,keys){ var out={}; Object.keys(o||{}).forEach(function(k){ out[k]=keys[k]?o[k]:{assessed:0,n:(o[k]||{}).n||0,pct:0}; }); return out; };
  return Object.assign({},agg,{byAoc:f(agg.byAoc,t.aoc),byCat:f(agg.byCat,t.cat),byStd:f(agg.byStd,t.std),byService:f(agg.byService,t.svc),touched:t.n});
}
function nfFacPhases(o){
  var key=o.progId+'|'+_scCpm.ver+'|'+JSON.stringify(o.progress||{}).length+'|'+(o.fac&&o.fac.startDate);
  if(o._ph&&o._ph.key===key) return o._ph;
  var day=nfDayOf(o.fac||{}), todayDi=day==null||day<1?-1:day-1, pid=o.progId, pr=o.progress||{}, st=o.staff||{};
  var A=o.agg||scFacilityReadiness(pid,pr,st), B=A.baseline||{}, I=null, E=null, weeks=[];
  var tI=nfTouched(pid,pr,7,48), tE=nfTouched(pid,pr,49,55);
  if(tI.n) I=nfMask(scFacilityReadiness(pid,nfFilterProg(pr,48),st),tI);
  if(tE.n) E=nfMask(scFacilityReadiness(pid,nfFilterProg(pr,55),st),tE);
  for(var w=0;w<9;w++){
    if(NF_WEEK_START[w]>todayDi&&!nfHasDone(pr,NF_WEEK_START[w],NF_WEEK_END[w])) break;
    if(!nfTouched(pid,pr,NF_WEEK_START[w],NF_WEEK_END[w]).n) continue;   // nothing scored that week → no point (no copied value)
    var s=scFacilityReadiness(pid,nfFilterProg(pr,NF_WEEK_END[w]),st);
    var cv=function(k){ var b=s.byCat[k]; return b&&b.assessed?b.pct:null; }; weeks.push({w:w+1,pct:s.coverage.assessed?s.pct:null,cov:s.coverage.pct,n:s.coverage.assessed,of:s.coverage.total,S:cv('Structure'),P:cv('Process'),O:cv('Outcome')});
  }
  var blDone=0; try{ blDone=scBaselineStatus(pid,pr,st).filter(function(x){ return x.complete; }).length; }catch(e){}
  o._ph={key:key,A:A,B:B,I:I,E:E,weeks:weeks,day:day,todayDi:todayDi,blDone:blDone}; return o._ph;
}
// ── shared pieces (app + PDF) ──────────────────────────────────
function nfPhVal(b){ return b&&b.assessed?b.pct:null; }
function nfPhGrowth(bB,bI,bE){ var base=nfPhVal(bB), last=nfPhVal(bE)!=null?nfPhVal(bE):nfPhVal(bI); if(base==null||last==null) return '<span class="phc na">—</span>'; var d=last-base; return '<span class="phc '+(d>0?'up':d<0?'dn':'eq')+'">'+(d>0?'+':'')+d+'</span>'; }
function nfRing3SVG(b,i,e,size){
  size=size||120; var c=size/2, st=Math.round(size/11), gap=Math.round(size/30), out='<svg viewBox="0 0 '+size+' '+size+'" width="'+size+'" height="'+size+'">';
  [[e,NF_PH_COL.E],[i,NF_PH_COL.I],[b,NF_PH_COL.B]].forEach(function(x,k){ var p=x[0], col=x[1], r=c-st/2-k*(st+gap), C=2*Math.PI*r;
    if(p==null){ out+='<circle cx="'+c+'" cy="'+c+'" r="'+r+'" stroke="#E3E7F0" stroke-width="'+st+'" fill="none" stroke-dasharray="2 5"/>'; return; }
    out+='<circle cx="'+c+'" cy="'+c+'" r="'+r+'" stroke="'+col+'" stroke-opacity=".14" stroke-width="'+st+'" fill="none"/>'
      +'<circle cx="'+c+'" cy="'+c+'" r="'+r+'" stroke="'+col+'" stroke-width="'+st+'" fill="none" stroke-linecap="round" stroke-dasharray="'+(Math.max(0,p)/100*C)+' '+C+'" transform="rotate(-90 '+c+' '+c+')"/>'; });
  return out+'</svg>';
}
function nfPhRows(bB,bI,bE,opts){
  opts=opts||{}; var row=function(lbl,col,b,chip,note){ var v=nfPhVal(b);
    return '<div class="phr'+(v==null?' mut':'')+'"><i style="background:'+col+'"></i><span>'+lbl+'</span><b>'+(v==null?'—':v+'%')+'</b>'+(v==null?'<em>'+(note||'')+'</em>':(chip||'<em></em>'))+'</div>'; };
  var base=nfPhVal(bB), ch=function(b){ var v=nfPhVal(b); if(base==null||v==null) return ''; var d=v-base; return '<span class="phc '+(d>0?'up':d<0?'dn':'eq')+'">'+(d>0?'+':'')+d+'</span>'; };
  return row(opts.hi?'बेसलाइन':'Baseline',NF_PH_COL.B,bB,'<em></em>','')+row(opts.hi?'क्रियान्वयन':'Implementation',NF_PH_COL.I,bI,ch(bI),opts.hi?'दिन 8 से':'from Day 8')+row(opts.hi?'एंड-लाइन':'End-line',NF_PH_COL.E,bE,ch(bE),opts.hi?'दिन 50 से':'from Day 50');
}
function nfRingCardHTML(title,sub,bB,bI,bE,size){
  return '<div class="phrc">'+nfRing3SVG(nfPhVal(bB),nfPhVal(bI),nfPhVal(bE),size||112)+'<div class="phrc-l"><b>'+scEsc(title)+'</b><small>'+scEsc(sub||'')+'</small>'+nfPhRows(bB,bI,bE)+'</div></div>';
}
function nfBar3HTML(bB,bI,bE){
  return [['B',NF_PH_COL.B,bB],['I',NF_PH_COL.I,bI],['E',NF_PH_COL.E,bE]].map(function(x){ var v=nfPhVal(x[2]);
    return '<div class="ph3"><span>'+x[0]+'</span><div><i style="width:'+(v||0)+'%;background:'+x[1]+'"></i></div><b>'+(v==null?'—':v+'%')+'</b></div>'; }).join('');
}
function nfCard3HTML(title,sub,bB,bI,bE){
  return '<div class="phcd"><div class="phcd-h"><b title="'+scEsc(title)+'">'+scEsc(title)+'</b>'+nfPhGrowth(bB,bI,bE)+'</div>'+(sub?'<small>'+scEsc(sub)+'</small>':'<small>&nbsp;</small>')+nfBar3HTML(bB,bI,bE)+'</div>';
}
function nfWeekChartSVG(weeks,todayDi,W,H){
  W=W||760; H=H||250; var L=40,T=16,R=14,Bm=28, n=9, x=function(k){ return L+k*(W-L-R)/(n-1); }, y=function(v){ return T+(100-v)*(H-T-Bm)/100; }, hw=(x(1)-x(0))/2;
  var s='<svg viewBox="0 0 '+W+' '+H+'" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block;width:100%;height:auto;font-family:inherit">';
  [[0,0,'Baseline','#F1F5F9'],[1,6,'Implementation','#E7F2F0'],[7,7,'End-line','#EEEDFA'],[8,8,'Mock','#FDF0E1']].forEach(function(b){ var x0=Math.max(x(b[0])-hw,L), x1=Math.min(x(b[1])+hw,W-R);
    s+='<rect x="'+x0+'" y="'+T+'" width="'+(x1-x0)+'" height="'+(H-T-Bm)+'" fill="'+b[3]+'"/><text x="'+((x0+x1)/2)+'" y="'+(T+12)+'" font-size="10" text-anchor="middle" fill="#6B7A78">'+b[2]+'</text>'; });
  [0,25,50,75,100].forEach(function(g){ s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(g)+'" y2="'+y(g)+'" stroke="#E3EAE8"/><text x="'+(L-6)+'" y="'+(y(g)+4)+'" font-size="10" text-anchor="end" fill="#8A9896">'+g+'%</text>'; });
  s+='<line x1="'+L+'" x2="'+(W-R)+'" y1="'+y(70)+'" y2="'+y(70)+'" stroke="#E9963A" stroke-dasharray="6 4" stroke-width="1.5"/><text x="'+(W-R-4)+'" y="'+(y(70)-5)+'" font-size="10" text-anchor="end" fill="#C47A24">NQAS 70%</text>';
  var line=function(key,col,w,dash){ var pts=weeks.filter(function(q){ return q[key]!=null; }).map(function(q){ return [x(q.w-1),y(q[key])]; }); if(!pts.length) return '';
    return '<path d="M'+pts.map(function(p){ return p[0]+' '+p[1]; }).join(' L')+'" fill="none" stroke="'+col+'" stroke-width="'+w+'"'+(dash?' stroke-dasharray="'+dash+'"':'')+' stroke-linejoin="round"/>'
      +pts.map(function(p){ return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="'+(w+1.5)+'" fill="#fff" stroke="'+col+'" stroke-width="2"/>'; }).join(''); };
  s+=line('S','#22C55E',1.6,'4 3')+line('P','#F59E0B',1.6,'4 3')+line('O','#3B82F6',1.6,'4 3')+line('pct','#135A55',3);
  if(todayDi>=0&&todayDi<60){ var wk=todayDi<7?0:todayDi<49?1+Math.floor((todayDi-7)/7):todayDi<56?7:8, lastV=(weeks.filter(function(q){ return q.pct!=null; }).pop()||{}).pct;
    s+='<line x1="'+x(wk)+'" x2="'+x(wk)+'" y1="'+T+'" y2="'+(H-Bm)+'" stroke="#13201F" stroke-dasharray="2 3"/><text x="'+(wk>=7?x(wk)-4:x(wk)+4)+'" y="'+(H-Bm-6)+'" font-size="10" text-anchor="'+(wk>=7?'end':'start')+'" fill="#13201F">today'+(lastV!=null?' · '+lastV+'%':'')+'</text>'; }
  for(var k=0;k<n;k++) s+='<text x="'+x(k)+'" y="'+(H-9)+'" font-size="10.5" text-anchor="middle" fill="#6B7A78">W'+(k+1)+'</text>';
  if(!weeks.length) s+='<text x="'+(W/2)+'" y="'+(H/2)+'" font-size="12" text-anchor="middle" fill="#94A3B8">The line starts once the baseline begins.</text>';
  return s+'</svg>';
}
function nfWeekLegend(){ return [['#135A55','Overall'],['#22C55E','Structure'],['#F59E0B','Process'],['#3B82F6','Outcome'],['#E9963A','NQAS 70%']].map(function(x){ return '<span><i style="background:'+x[0]+'"></i>'+x[1]+'</span>'; }).join(''); }
function nfPhLegend(){ return [['B',NF_PH_COL.B,'Baseline'],['I',NF_PH_COL.I,'Implementation'],['E',NF_PH_COL.E,'End-line']].map(function(x){ return '<span><i style="background:'+x[1]+'"></i>'+x[2]+'</span>'; }).join(''); }
// Standards heat-map: rows by AoC, tile per Standard (current %, coloured against its minimum)
function nfStdHeatHTML(A,limitLow){
  var byAoc={}, stds=Object.keys(A.byStd||{}).sort(scStdCmp);
  var ranked=stds.filter(function(s){ return A.byStd[s].assessed; }).sort(function(a,b){ return (A.byStd[a].pct-scNqasStdMin(a))-(A.byStd[b].pct-scNqasStdMin(b)); });
  var low={}; ranked.slice(0,limitLow||8).forEach(function(s){ if(A.byStd[s].pct<70) low[s]=1; });
  stds.forEach(function(s){ (byAoc[s.charAt(0)]=byAoc[s.charAt(0)]||[]).push(s); });
  return '<div class="phhm">'+Object.keys(SC_CPM_AOC).filter(function(k){ return byAoc[k]; }).map(function(k){
    return '<div class="phhm-r"><span class="phhm-a" title="'+scEsc(SC_CPM_AOC[k])+'"><b>'+k+'</b>'+scEsc(SC_CPM_AOC[k])+'</span><div>'+byAoc[k].map(function(s){ var b=A.byStd[s], m=scNqasStdMin(s);
      var cls=!b.assessed?'na':b.pct>=Math.max(70,m)?'g':b.pct>=m?'a':'r';
      return '<span class="phhm-t '+cls+(low[s]?' low':'')+'" title="'+scEsc(s+' '+(scRegTitle('std',s)||'')+' — '+(b.assessed?b.pct+'%':'not assessed')+' (min '+m+'%)')+'"><b>'+s+'</b>'+(b.assessed?b.pct:'—')+'</span>'; }).join('')+'</div></div>'; }).join('')
    +'<div class="phhm-k"><span class="r">below minimum</span><span class="a">at minimum, under 70%</span><span class="g">70% or more</span><span class="lowk">outlined = lowest Standards</span></div></div>';
}
function nfPhaseCardHTML(fac,day,blDone){
  var start=fac&&fac.startDate, idx=day==null?-1:day<1?-1:day<=7?0:day<=49?1:day<=56?2:day<=60?3:4;
  var dt=function(d){ return start?scFmtDate(scAddDays(start,d-1)).replace(/ \d{4}$/,''):''; };
  var name=idx<0?'Not started':idx>3?'Programme complete':NF_PHASES[idx].k;
  var sub=idx<0?(start?'Starts '+scFmtDate(start):'Start date not set'):idx===0?'Day '+day+' of 7 · rapid audit of every checkpoint':idx===1?'Week '+(2+Math.floor((day-8)/7))+' of 7 · Day '+day+' / 60<br>This week: '+scEsc(SC_IMPL_WEEKS[Math.floor((day-8)/7)].title)+' · '+(6-((day-8)%7))+' day'+(6-((day-8)%7)===1?'':'s')+' left':idx===2?'Day '+day+' / 60 · end-line re-score of every checkpoint':idx===3?'Day '+day+' / 60 · end-line verification, final review and graduation':'All 60 days done';
  var pct=day==null||day<1?0:Math.min(100,Math.round(day/60*100));
  var warn=(day!=null&&day>7&&blDone!=null&&blDone<7)?'<div class="phx-w">⚠ Baseline incomplete: '+blDone+' of 7 days done</div>':'';
  return '<div class="phx"><div class="phx-l"><small>Current phase</small><b>'+scEsc(name)+'</b><span>'+sub+'</span>'+warn+'</div><div class="phx-s">'
    +NF_PHASES.map(function(p,i){ var bad=(i===0&&idx>0&&blDone!=null&&blDone<7), c=bad?'warn':i<idx?'done':i===idx?'cur':''; return '<div class="phx-st '+c+'"><i>'+(bad?'!':i<idx?'✓':(i+1))+'</i><b>'+p.k+'</b><small>Days '+p.a+'–'+p.b+(start?' · '+dt(p.a)+'–'+dt(p.b):'')+'</small></div>'; }).join('')
    +'</div><div class="phx-p"><div><i style="width:'+pct+'%"></i></div><small>'+pct+'% of the 60-day programme</small></div></div>';
}
// ══════════════════════════════════════════════════════════════
// FACILITY READINESS TAB (drill-in, Facility dashboard)
// ══════════════════════════════════════════════════════════════
scInsReadinessHTML=function(st,openCnt,overdueCnt){
  var o={progId:st.progId,progress:st.progress||{},staff:st.staff||{},fac:st.fac||{},agg:st.agg}; if(st._phO&&st._phO.agg===st.agg) o=st._phO; else st._phO=o;
  var P=nfFacPhases(o), A=P.A, B=P.B||{}, I=P.I, E=P.E, hasB=!!B.assessed;
  var tile=function(v,l,col,title){ return '<div class="scx-tile"'+(title?' title="'+scEsc(title)+'"':'')+'><div class="scx-tile-v"'+(col?' style="color:'+col+';"':'')+'>'+v+'</div><div class="scx-tile-l">'+l+'</div></div>'; };
  var gain=hasB?A.pct-B.pct:null, ev=E?E.pct:null;
  var h=nfPhaseCardHTML(st.fac,P.day,P.blDone)
    +'<div class="scx-tiles">'+tile(A.coverage.assessed?A.pct+'%':'—','Current readiness',A.coverage.assessed?scPctText(A.pct):'var(--t3)')
    +tile(hasB?B.pct+'%':'—','Baseline',hasB?scPctText(B.pct):'var(--t3)')+tile(gain==null?'—':(gain>=0?'+':'')+gain,'Growth since baseline',gain==null?'var(--t3)':gain>0?'var(--green-dk)':gain<0?'var(--red-dk)':'var(--t3)')
    +tile(ev==null?'—':ev+'%',ev==null?'End-line (from Day 50)':'End-line',ev==null?'var(--t3)':scPctText(ev))
    +tile(A.coverage.assessed+'/'+A.total,'Checkpoints assessed')+tile(openCnt,'Open gaps','var(--amber-dk)')+tile(overdueCnt,'Overdue actions',overdueCnt?'var(--red-dk)':'var(--t3)')+tile(A.daysVerified+'/'+A.daysDone,'Cards verified')+'</div>'
    +rdNqasLine(A,st.hostId);
  var aocsOf=function(k){ return Object.keys(SC_CPM_AOC).filter(function(x){ return scAocCat(x)===k; }).join(', '); };
  h+='<div class="ph2"><div><div class="scx-sub">Weekly progress <span class="phlg">'+nfWeekLegend()+'</span></div><div class="phbox">'+nfWeekChartSVG(P.weeks,P.todayDi,760,430)+'</div></div>'
    +'<div><div class="scx-sub">Structure · Process · Outcome <span class="phlg">'+nfPhLegend()+'</span></div><div class="phrings">'
    +SC_AOC_CATS.map(function(k){ return nfRingCardHTML(k,'AoC '+aocsOf(k),B.byCat&&B.byCat[k],I&&I.byCat[k],E&&E.byCat[k],96); }).join('')+'</div></div></div>';
  h+=nfHeatBlockHTML(st.hostId,P);
  var stds=Object.keys(A.byStd).sort(scStdCmp), pv=function(x){ return x&&x.assessed?x.pct+'%':'—'; };
  h+='<div class="scc-std nf-stdtbl'+(_nfStdOpen[st.hostId]?' open':'')+'" id="nfstd-'+scEsc(st.hostId)+'"><div class="nf-stdtbl-h">By Standard — minimum to pass NQAS shown for each</div><table><thead><tr><th>Standard</th><th>Current</th><th>Min</th><th></th><th>Baseline</th><th>Implementation</th><th>End-line</th><th>Assessed</th></tr></thead><tbody>'
    +stds.map(function(s){ var b=A.byStd[s], m=scNqasStdMin(s), ok=b.pct>=m;
      return '<tr class="'+(ok?'ok':'no')+'"><td><b>'+s+'</b> <span>'+scEsc((scRegTitle('std',s)||'').slice(0,40))+'</span></td><td style="color:'+scPctText(b.pct)+';"><b>'+b.pct+'%</b></td><td>'+m+'%</td><td>'+(ok?'✓':'✗')+'</td><td>'+pv(B.byStd&&B.byStd[s])+'</td><td>'+pv(I&&I.byStd[s])+'</td><td>'+pv(E&&E.byStd[s])+'</td><td>'+b.assessed+'/'+b.n+'</td></tr>'; }).join('')+'</tbody></table></div>';
  h+='<div class="scx-sub">Areas of Concern <span class="scc-hint">B baseline · I implementation · E end-line · chip = growth since baseline</span></div><div class="phgrid">'
    +Object.keys(SC_CPM_AOC).map(function(k){ return nfCard3HTML('AoC '+k+' · '+SC_CPM_AOC[k],scAocCat(k),B.byAoc&&B.byAoc[k],I&&I.byAoc[k],E&&E.byAoc[k]); }).join('')+'</div>';
  ['service','support'].forEach(function(g){
    var order=SC_SVC_GROUPS[g], names=Object.keys(A.byService).filter(function(k){ return scSvcGroup(k)===g; });
    names.sort(function(x,y){ return (order.indexOf(x)<0?99:order.indexOf(x))-(order.indexOf(y)<0?99:order.indexOf(y)); });
    if(names.length) h+='<div class="scx-sub">'+scEsc(SC_SVC_GROUP_LABEL[g])+' <span class="scc-hint">'+names.length+'</span></div><div class="phgrid">'
      +names.map(function(k){ return nfCard3HTML(k,'',B.byService&&B.byService[k],I&&I.byService[k],E&&E.byService[k]); }).join('')+'</div>';
  });
  return h;
};
// Baseline tab: NQAS status as one line with ⓘ
(function(){
  var oB=scBaselineHTML;
  scBaselineHTML=function(st){ var h=oB.apply(this,arguments);
    try{ var A=st.agg, B=A.baseline||{}; if(!B.assessed) return h; var Bc=Object.assign({},B,{coverage:{assessed:B.assessed},nqas:scNqasCheckV2(Object.assign({},B,{coverage:{assessed:B.assessed}}))});
      var i=h.indexOf('<div class="scx-nqas'); if(i<0) return h; var j=h.indexOf('</div>',i)+6;
      var line=rdNqasLine(Bc,'bl-'+st.hostId).replace('✗ Not yet at NQAS criteria','✗ Not yet at NQAS criteria at baseline').replace('✓ Meets NQAS criteria','✓ Met NQAS criteria at baseline');
      return h.slice(0,i)+line+h.slice(j); }catch(e){ return h; } };
})();
// ══════════════════════════════════════════════════════════════
// PDF facility report — same B / I / E style
// ══════════════════════════════════════════════════════════════
(function(){
  var oF=nfFacilityReportHTML;
  nfFacilityReportHTML=function(code,preview){
    var html=oF.apply(this,arguments);
    try{
      var f=(scMasterFacilities||{})[code]||{}, pr=(scMasterProgress||{})[code]||{}, pid=f.progId||'nqas_12A';
      var P=nfFacPhases({progId:pid,progress:pr,staff:f.staff||{},fac:f}), A=P.A, B=P.B||{}, I=P.I, E=P.E;
      var aocsOf=function(k){ return Object.keys(SC_CPM_AOC).filter(function(x){ return scAocCat(x)===k; }).join(', '); };
      var extraCss='.phx{border:1px solid #E3EAE8;border-radius:10px;padding:8px 10px;margin:8px 0;display:grid;grid-template-columns:150px 1fr;gap:4px 10px;align-items:center;break-inside:avoid;}'
        +'.phx-l{grid-row:1/3;} .phx-l small{font-size:8px;color:#6B7A78;} .phx-l b{display:block;font-size:14px;color:#135A55;} .phx-l span{font-size:8.5px;color:#3D4B49;}'
        +'.phx-s{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;} .phx-st{border:1px solid #E3EAE8;border-radius:7px;padding:4px 6px;font-size:8px;} .phx-st i{font-style:normal;font-weight:700;margin-right:3px;} .phx-st b{font-size:8.5px;} .phx-st small{display:block;color:#6B7A78;font-size:7.5px;}'
        +'.phx-st.done{background:#F0FDF4;border-color:#BBF7D0;} .phx-st.cur{background:#E7F2F0;border-color:#135A55;} .phx-p{display:flex;align-items:center;gap:6px;} .phx-p div{flex:1;height:5px;border-radius:5px;background:#EAEFEE;} .phx-p i{display:block;height:100%;border-radius:5px;background:linear-gradient(90deg,#135A55,#E9963A);} .phx-p small{font-size:7.5px;color:#6B7A78;}'
        +'.phrc{display:flex;align-items:center;gap:8px;border:1px solid #E3EAE8;border-radius:10px;padding:6px 8px;min-width:0;break-inside:avoid;} .phrc-l{flex:1;min-width:0;} .phrc-l > b{font-size:11px;} .phrc-l > small{display:block;font-size:8px;color:#6B7A78;margin-bottom:2px;}'
        +'.phr{display:flex;align-items:center;gap:4px;font-size:8.5px;margin:1px 0;} .phr i{width:7px;height:7px;border-radius:50%;} .phr b{margin-left:auto;} .phr em{font-style:normal;font-size:7.5px;color:#94A3B8;min-width:32px;text-align:right;} .phr.mut{color:#94A3B8;}'
        +'.phc{display:inline-block;font-size:7.5px;font-weight:700;border-radius:8px;padding:1px 5px;min-width:26px;text-align:center;} .phc.up{background:#DCFCE7;color:#15803D;} .phc.dn{background:#FEE2E2;color:#B91C1C;} .phc.eq,.phc.na{background:#F1F5F4;color:#6B7A78;}'
        +'.phcd{border:1px solid #E3EAE8;border-radius:9px;padding:6px 8px;min-width:0;break-inside:avoid;overflow:hidden;} .phcd-h{display:flex;justify-content:space-between;gap:4px;} .phcd-h b{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .phcd small{font-size:7.5px;color:#6B7A78;}'
        +'.ph3{display:flex;align-items:center;gap:4px;font-size:8px;margin-top:2px;} .ph3 span{width:8px;color:#6B7A78;font-weight:700;} .ph3 div{flex:1;height:5px;border-radius:5px;background:#EEF2F1;} .ph3 i{display:block;height:100%;border-radius:5px;} .ph3 b{width:26px;text-align:right;}'
        +'.phhm{border:1px solid #E3EAE8;border-radius:9px;padding:6px 8px;break-inside:avoid;} .phhm-r{display:flex;gap:6px;align-items:center;margin:2px 0;} .phhm-a{width:92px;font-size:8px;color:#3D4B49;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .phhm-a b{margin-right:3px;}'
        +'.phhm-r > div{display:flex;flex-wrap:wrap;gap:3px;} .phhm-t{display:inline-flex;flex-direction:column;align-items:center;min-width:34px;border-radius:5px;padding:2px 3px;font-size:8px;font-weight:700;line-height:1.1;} .phhm-t b{font-size:7px;font-weight:600;opacity:.8;}'
        +'.phhm-t.g{background:#DCF3E4;color:#15803D;} .phhm-t.a{background:#FEF3E2;color:#B45309;} .phhm-t.r{background:#FDE2E2;color:#B91C1C;} .phhm-t.na{background:#F1F5F4;color:#94A3B8;} .phhm-t.low{outline:1.5px solid #B91C1C;outline-offset:0;}'
        +'.phhm-k{display:flex;gap:10px;font-size:7.5px;color:#6B7A78;margin-top:4px;} .phhm-k span:before{content:"";display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:3px;vertical-align:-1px;} .phhm-k .r:before{background:#FDE2E2;} .phhm-k .a:before{background:#FEF3E2;} .phhm-k .g:before{background:#DCF3E4;} .phhm-k .lowk:before{outline:1.5px solid #B91C1C;background:#fff;}'
        +'.phlg{display:inline-flex;gap:8px;font-size:8px;color:#6B7A78;font-weight:500;margin-left:6px;} .phlg i{display:inline-block;width:10px;height:3px;border-radius:2px;vertical-align:middle;margin-right:3px;} .phw{border:1px solid #E3EAE8;border-radius:9px;padding:4px;break-inside:avoid;}';
      html=html.replace('</style>',extraCss+'</style>');
      // phase card after the meta line
      html=html.replace('<div class="kp">',nfPhaseCardHTML(f,P.day,P.blDone)+'<div class="kp">');
      // donuts → triple rings + weekly chart
      var d0=html.indexOf('<h2>Structure · Process · Outcome'), d1=html.indexOf('<h2>Areas of Concern');
      if(d0>0&&d1>d0) html=html.slice(0,d0)+'<h2>Weekly progress<span class="phlg">'+nfWeekLegend()+'</span></h2><div class="phw">'+nfWeekChartSVG(P.weeks,P.todayDi,760,210)+'</div>'
        +'<h2>Structure · Process · Outcome<span class="phlg">'+nfPhLegend()+'</span></h2><div class="dns">'+SC_AOC_CATS.map(function(k){ return nfRingCardHTML(k,'AoC '+aocsOf(k),B.byCat&&B.byCat[k],I&&I.byCat[k],E&&E.byCat[k],86); }).join('')+'</div>'
        +'<h2>Standards heat-map<small>'+nfHeatLatest(P).label+' · outlined = lowest</small></h2>'+nfStdHeatHTML(nfHeatLatest(P).agg)+html.slice(d1);
      // AoC / services / cross-cutting cards → B / I / E bars
      var rebuild=function(title,keys,mk){ var a=html.indexOf('<h2>'+title); if(a<0) return; var c0=html.indexOf('<div class="cds">',a); var c1=html.indexOf('<h2',c0); if(c0<0||c1<0) return;
        html=html.slice(0,c0)+'<div class="cds">'+keys.map(mk).join('')+'</div>'+html.slice(c1); };
      rebuild('Areas of Concern',Object.keys(SC_CPM_AOC),function(k){ return nfCard3HTML('AoC '+k+' · '+SC_CPM_AOC[k],scAocCat(k),B.byAoc&&B.byAoc[k],I&&I.byAoc[k],E&&E.byAoc[k]); });
      var order=SC_SVC_GROUPS.service, svc=Object.keys(A.byService).filter(function(s){ return scSvcGroup(s)==='service'; }).sort(function(x,y){ return order.indexOf(x)-order.indexOf(y); }), cc=Object.keys(A.byService).filter(function(s){ return scSvcGroup(s)!=='service'; }).sort();
      rebuild('Service packages',svc,function(k){ return nfCard3HTML(k,'',B.byService&&B.byService[k],I&&I.byService[k],E&&E.byService[k]); });
      rebuild('Cross-cutting areas',cc,function(k){ return nfCard3HTML(k,'',B.byService&&B.byService[k],I&&I.byService[k],E&&E.byService[k]); });
      // Standards table: Baseline · Implementation · Endline columns
      html=html.replace('<th class="c">Baseline</th><th class="c">Assessed</th></tr></thead>','<th class="c">Baseline</th><th class="c">Implementation</th><th class="c">End-line</th><th class="c">Assessed</th></tr></thead>');
      Object.keys(A.byStd).forEach(function(s){ var re=new RegExp('(<tr><td><b>'+s+'</b></td>(?:(?!</tr>).)*?<td class="c">(?:\\d+%|—)</td>)(<td class="c">\\d+/\\d+</td></tr>)');
        var pv=function(x){ return x&&x.assessed?x.pct+'%':'—'; }; html=html.replace(re,'$1<td class="c">'+pv(I&&I.byStd[s])+'</td><td class="c">'+pv(E&&E.byStd[s])+'</td>$2'); });
    }catch(e){ console.warn('[SC] phase report',e); }
    return html;
  };
})();
// ══════════════════════════════════════════════════════════════
// STAFF PROGRESS SCREEN — my Baseline · Implementation · Endline
// ══════════════════════════════════════════════════════════════
function nfStaffPhases(){
  var pid=choState.progId, role=choState.roleId||'CHO', cards=choState.cards||{}, today=scb1TodayIdx();
  var cut=function(maxDi){ var o={}; Object.keys(cards).forEach(function(k){ if(+k<=maxDi) o[k]=cards[k]; }); return o; };
  var done=function(a,b){ return Object.keys(cards).some(function(k){ return +k>=a&&+k<=b&&cards[k]&&cards[k].taskDone; }); };
  var R=scReadiness(pid,cards,role), tI=nfTouchedCards(pid,cards,7,48), tE=nfTouchedCards(pid,cards,49,55), I=tI.n?nfMask(scReadiness(pid,cut(48),role),tI):null, E=tE.n?nfMask(scReadiness(pid,cut(55),role),tE):null;
  return {R:R,B:R.baseline||{},I:I,E:E};
}
(function(){
  var oP=nfRenderProgress;
  nfRenderProgress=async function(){ var r=await oP.apply(this,arguments); try{ nfStaffPhaseDecorate(); }catch(e){ console.warn(e); } return r; };
})();
function nfStaffPhaseDecorate(){
  var page=document.getElementById('nf-progress'); if(!page) return;
  var S=nfStaffPhases(), hi=_appLang==='hi', fac=_nfFac.code===choState.facilityCode?_nfFac:null;
  var rings=page.querySelector('.nf-rings');
  if(rings){ rings.classList.add('ph-st');
    rings.innerHTML='<div class="nf-rr3">'+nfRing3SVG(nfPhVal(S.B),nfPhVal(S.I),nfPhVal(S.E),118)+'<b>'+S.R.pct+'%</b></div><div class="nf-rl3">'
      +'<div class="phr-h">'+(hi?'मेरी तैयारी':'My readiness')+'</div>'+nfPhRows(S.B,S.I,S.E,{hi:hi})
      +(fac&&fac.agg?'<div class="phr-f">'+(hi?'स्वास्थ्य केंद्र':'Facility')+' <b>'+fac.agg.pct+'%</b></div>':'')+'</div>'; }
  var aoc=page.querySelector('.nf-aoc');
  if(aoc){ aoc.classList.add('ph-st');
    aoc.innerHTML=Object.keys(SC_CPM_AOC).filter(function(k){ return S.R.byAoc[k]&&S.R.byAoc[k].n; }).map(function(k){
      return '<div class="nf-aoc3"><div class="nf-aoc3-h"><span>'+k+' · '+scEsc(SC_CPM_AOC[k])+'</span>'+nfPhGrowth(S.B.byAoc&&S.B.byAoc[k],S.I&&S.I.byAoc[k],S.E&&S.E.byAoc[k])+'</div>'
        +nfBar3HTML(S.B.byAoc&&S.B.byAoc[k],S.I&&S.I.byAoc[k],S.E&&S.E.byAoc[k])+'</div>'; }).join(''); }
}
