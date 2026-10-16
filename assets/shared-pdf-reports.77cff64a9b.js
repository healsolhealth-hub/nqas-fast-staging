
// ══════════════════════════════════════════════════════════════
// BRANDED PDF REPORTS — NQAS | FAST by HealSol Academy
//  One report frame (A4, logos, header, footer on every page, bundled Poppins, print colours)
//  for: facility report (drill-in / Facility dashboard), Reports menu (facility, role, programme),
//  and the Baseline report PDF.
// ══════════════════════════════════════════════════════════════
function nfRptFonts(){
  var css=''; [].forEach.call(document.querySelectorAll('style'),function(s){ var m=(s.textContent||'').match(/@font-face\{font-family:'NF Poppins'[^}]*\}/g); if(m) css+=m.join(''); });
  return css;
}
function nfRptColor(p){ return p>=80?'#15803D':p>=70?'#135A55':p>=50?'#B45309':'#B91C1C'; }
function nfRptFill(p){ return p>=80?'#22C55E':p>=70?'#135A55':p>=50?'#F59E0B':'#EF4444'; }
function nfRptBar(p,base){ p=p||0; return '<div class="rb"><i style="width:'+p+'%;background:'+nfRptFill(p)+'"></i>'+(base!=null?'<em style="left:'+base+'%"></em>':'')+'</div>'; }
function nfRptChange(cur,base){ if(base==null) return '<span class="ch na">—</span>'; var d=cur-base; return '<span class="ch '+(d>0?'up':d<0?'down':'eq')+'">'+(d>0?'+':'')+d+'</span>'; }
function nfRptDonut(label,sub,b,base){
  var size=110, st=13, r=(size-st)/2, c=2*Math.PI*r, p=b&&b.assessed?b.pct:0, a=p/100*c;
  var tick=base&&base.assessed?'<circle cx="55" cy="55" r="'+r+'" stroke="#E9963A" stroke-width="'+(st+4)+'" fill="none" stroke-dasharray="3 '+c+'" stroke-dashoffset="'+(-(base.pct/100*c)+1.5)+'" transform="rotate(-90 55 55)"/>':'';
  return '<div class="dn"><div class="dn-c"><svg viewBox="0 0 110 110" width="110" height="110"><circle cx="55" cy="55" r="'+r+'" stroke="#EAEFEE" stroke-width="'+st+'" fill="none"/>'
    +'<circle cx="55" cy="55" r="'+r+'" stroke="'+nfRptFill(p)+'" stroke-width="'+st+'" fill="none" stroke-linecap="round" stroke-dasharray="'+a+' '+c+'" transform="rotate(-90 55 55)"/>'+tick+'</svg>'
    +'<span><b style="color:'+nfRptColor(p)+'">'+(b&&b.assessed?p+'%':'—')+'</b><small>'+(b?b.assessed+'/'+b.n:'')+'</small></span></div>'
    +'<div><b>'+scEsc(label)+'</b><small>'+scEsc(sub)+'</small><div class="dn-b">Baseline '+(base&&base.assessed?base.pct+'%':'—')+' '+nfRptChange(p,base&&base.assessed?base.pct:null)+'</div></div></div>';
}
function nfRptCard(title,sub,b,base){
  var p=b&&b.assessed?b.pct:0, bp=base&&base.assessed?base.pct:null;
  return '<div class="cd"><b class="cd-t">'+scEsc(title)+'</b>'+(sub?'<small>'+scEsc(sub)+'</small>':'')
    +'<div class="cd-v"><b style="color:'+(b&&b.assessed?nfRptColor(p):'#94A3B8')+'">'+(b&&b.assessed?p+'%':'—')+'</b>'+nfRptChange(p,bp)+'</div>'
    +nfRptBar(p,bp)+'<div class="cd-f"><span>Baseline '+(bp!=null?bp+'%':'—')+'</span><span>'+(b?b.assessed+'/'+b.n:'')+'</span></div></div>';
}
var NF_RPT_CSS=`
@page{size:A4;margin:14mm 12mm 18mm;}
*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
body{font-family:'NF Poppins',system-ui,Arial,sans-serif;color:#13201F;margin:0;font-size:10.5px;line-height:1.45;background:#fff;}
.pg{max-width:190mm;margin:0 auto;padding:0 2mm;}
.hd{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 0 10px;border-bottom:3px solid #135A55;}
.hd .nq{height:38px;border-radius:7px;} .hd .hs{height:15px;}
.hd-r{text-align:right;font-size:9px;color:#6B7A78;} .hd-r b{display:block;font-size:12px;color:#135A55;letter-spacing:.3px;} .hd-r b i{font-style:normal;color:#E9963A;margin:0 4px;font-weight:400;}
.tt{margin:14px 0 4px;} .tt h1{font-size:20px;margin:0;color:#13201F;letter-spacing:-.2px;} .tt h1 small{font-size:12px;color:#6B7A78;font-weight:500;margin-left:6px;}
.meta{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:9.5px;color:#3D4B49;margin-bottom:10px;} .meta span b{color:#13201F;}
h2{font-size:12.5px;color:#135A55;margin:16px 0 7px;padding-bottom:4px;border-bottom:1px solid #E3EAE8;break-after:avoid;}
h2 small{font-weight:500;color:#6B7A78;font-size:9.5px;margin-left:6px;}
.kp{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;} .kp div{border:1px solid #E3EAE8;border-radius:9px;padding:7px 9px;} .kp b{display:block;font-size:16px;line-height:1.2;} .kp small{font-size:8.5px;color:#6B7A78;text-transform:uppercase;letter-spacing:.3px;}
.nq-l{margin:8px 0 2px;padding:8px 11px;border-radius:9px;font-size:10px;} .nq-l.no{background:#FEF2F2;border:1px solid #FECACA;color:#991B1B;} .nq-l.ok{background:#F0FDF4;border:1px solid #BBF7D0;color:#166534;} .nq-l.na{background:#F5F8F7;border:1px solid #E3EAE8;color:#6B7A78;}
.nq-l b{font-size:11px;}
.dns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;break-inside:avoid;}
.dn{min-width:0;display:flex;align-items:center;gap:9px;border:1px solid #E3EAE8;border-radius:11px;padding:8px;} .dn-c{position:relative;width:110px;height:110px;flex-shrink:0;}
.dn-c span{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.1;} .dn-c b{font-size:19px;} .dn-c small{font-size:8.5px;color:#6B7A78;}
.dn > div:last-child b{display:block;font-size:12px;} .dn > div:last-child small{display:block;font-size:9px;color:#6B7A78;} .dn-b{font-size:9.5px;margin-top:4px;}
.cds{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;} .cds.c3{grid-template-columns:repeat(3,minmax(0,1fr));}
.cd{border:1px solid #E3EAE8;border-radius:9px;padding:7px 9px;break-inside:avoid;min-width:0;overflow:hidden;} .cd-t{display:block;font-size:9.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;} .cd small{font-size:8.5px;color:#6B7A78;}
.cd-v{display:flex;align-items:center;justify-content:space-between;margin:3px 0 4px;} .cd-v b{font-size:16px;line-height:1;} .cd-f{display:flex;justify-content:space-between;font-size:8.5px;color:#6B7A78;margin-top:3px;}
.rb{position:relative;height:6px;border-radius:6px;background:#EAEFEE;} .rb i{display:block;height:100%;border-radius:6px;} .rb em{position:absolute;top:-2px;bottom:-2px;width:2px;margin-left:-1px;background:#E9963A;border-radius:2px;}
.ch{display:inline-block;font-size:8.5px;font-weight:700;border-radius:10px;padding:1px 6px;} .ch.up{background:#DCFCE7;color:#15803D;} .ch.down{background:#FEE2E2;color:#B91C1C;} .ch.eq,.ch.na{background:#F1F5F4;color:#6B7A78;}
table{width:100%;border-collapse:collapse;font-size:9.5px;} thead{display:table-header-group;} tr{break-inside:avoid;}
th{background:#135A55;color:#fff;text-align:left;padding:5px 7px;font-size:8.5px;text-transform:uppercase;letter-spacing:.3px;font-weight:600;}
td{padding:5px 7px;border-bottom:1px solid #EEF2F1;vertical-align:middle;} tbody tr:nth-child(even) td{background:#F8FAF9;}
td.c,th.c{text-align:center;} td small{display:block;color:#6B7A78;font-size:8.5px;} .ok{color:#15803D;font-weight:700;} .no{color:#B91C1C;font-weight:700;}
.pill{display:inline-block;font-size:8.5px;font-weight:700;border-radius:10px;padding:1px 7px;} .pill.g{background:#DCFCE7;color:#15803D;} .pill.a{background:#FEF3C7;color:#92400E;} .pill.r{background:#FEE2E2;color:#B91C1C;} .pill.n{background:#F1F5F4;color:#6B7A78;}
.rbw{display:flex;align-items:center;gap:6px;} .rbw .rb{flex:1;min-width:60px;} .rbw b{width:32px;text-align:right;}
.sm{font-size:8.5px;color:#6B7A78;}
.ft{position:fixed;bottom:0;left:0;right:0;font-size:8px;color:#6B7A78;display:flex;justify-content:space-between;padding:4px 12mm;border-top:1px solid #E3EAE8;background:#fff;}
.ft b{color:#135A55;} .ft b i{font-style:normal;color:#E9963A;margin:0 3px;}
.sig{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:26px;break-inside:avoid;} .sig div{border-top:1px solid #94A3B8;padding-top:4px;font-size:9px;color:#6B7A78;}
.pb{break-before:page;}
.pro{display:inline-flex;vertical-align:middle;margin-left:8px;border:1px solid #135A55;border-radius:5px;overflow:hidden;font-size:9px;font-weight:700;letter-spacing:.05em;} .pro i{font-style:normal;background:#135A55;color:#fff;padding:2px 5px;} .pro b{background:#E6F2F0;color:#135A55;padding:2px 5px;letter-spacing:0;}
@media screen{ body{background:#E9EEED;} .pg{background:#fff;padding:14mm 12mm 22mm;margin:16px auto;box-shadow:0 4px 20px rgba(0,0,0,.12);} .ft{position:static;margin-top:14px;padding:6px 0 0;} .bar{position:fixed;bottom:16px;right:16px;display:flex;gap:8px;} .bar button{font:inherit;font-size:12px;font-weight:600;border:0;border-radius:10px;padding:9px 16px;cursor:pointer;color:#fff;background:#135A55;box-shadow:0 4px 12px rgba(0,0,0,.2);} .bar button.g{background:#64748B;} }
@media print{ .bar{display:none;} }`;
function nfRptDoc(o){
  var a=scActor?scActor():{name:'',role:''}, when=new Date().toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=840"><title>'+scEsc(o.title)+' — NQAS | FAST</title><style>'+nfRptFonts()+NF_RPT_CSS+'html{-webkit-text-size-adjust:100%;text-size-adjust:100%;}</style></head><body><div class="pg">'
    +'<div class="hd"><img class="nq" src="'+SC_BRAND.logoNqas+'" alt="NQAS.QI"><div class="hd-r"><b>NQAS<i>|</i>FAST</b>by <img class="hs" src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy" style="vertical-align:middle;"></div></div>'
    +'<div class="tt"><h1>'+scEsc(o.title)+(o.subtitle?'<small>'+scEsc(o.subtitle)+'</small>':'')+(o.badge?'<span class="pro"><i>PRO</i><b>'+scEsc(o.badge)+'</b></span>':'')+'</h1></div>'
    +'<div class="meta">'+(o.meta||[]).map(function(m){ return '<span>'+scEsc(m[0])+': <b>'+scEsc(m[1])+'</b></span>'; }).join('')
    +'<span>Generated: <b>'+scEsc(when)+'</b></span>'+(a&&a.name?'<span>By: <b>'+scEsc(a.name)+(a.role?' ('+scEsc(a.role)+')':'')+'</b></span>':'')+'</div>'
    +o.body
    +'<div class="ft"><span><b>NQAS<i>|</i>FAST</b> · by HealSol Academy · '+scEsc(o.title)+'</span><span>Confidential — for facility improvement · '+scEsc(when)+'</span></div></div>'
    +(o.preview?'<div class="bar"><button onclick="window.print()">🖨 Print / Save as PDF</button><button class="g" onclick="window.close()">Close</button></div>':'')
    +(o.preview?'':'<script>setTimeout(function(){window.print();},700)<\/script>')+'</body></html>';
}
function nfRptOpen(html){
  if(typeof nfInWebView==='function'&&nfInWebView()){
    // One HealSol app: pop-up windows are blocked — open the report in the phone's browser via a one-time link
    var t=(/<title>([^<]*)<\/title>/.exec(html)||[])[1]||'NQAS FAST report';
    t=t.replace(/&amp;/g,'&').replace(/&[a-z#0-9]+;/gi,'').replace(/\s*—\s*NQAS \| FAST\s*$/,'').replace(/[^A-Za-z0-9._ -]+/g,'-').replace(/-+/g,'-').replace(/^[-\s]+|[-\s]+$/g,'').slice(0,90)||'report';
    html=html.replace(/<script>setTimeout\(function\(\)\{window\.print\(\);\},700\)<\/script>/,'');
    if(html.indexOf('class="bar"')<0) html=html.replace('</body>','<div class="bar"><button onclick="window.print()">🖨 Print / Save as PDF</button></div></body>');
    showToast('Preparing the report…','ok');
    nfSaveBlob(new Blob([html],{type:'text/html'}),t+'.html').catch(function(e){ showToast('Could not prepare the report — check connection.','err'); });
    return null;
  }
  var w=window.open('','_blank'); if(!w){ showToast('Allow pop-ups to open the report.','err'); return null; }
  w.document.write(html); w.document.close(); return w;
}
function nfRptStatus(a){
  var n=a.nqas||scNqasCheckV2(a);
  if(!a.coverage||!a.coverage.assessed) return {cls:'n',txt:'Not assessed yet'};
  if(n.meets) return {cls:'g',txt:'✓ Meets NQAS'};
  return {cls:n.stdFails.length?'a':'r',txt:n.stdFails.length?n.stdFails.length+' Std below min':'Overall below 70%'};
}
function nfRptActions(code){
  var acts=((_scRvAll||{})[code])||null;
  if(!acts){ var st=Object.keys(_scIns||{}).map(function(k){ return _scIns[k]; }).find(function(s){ return s&&s.code===code&&s.actions; }); acts=st?st.actions:{}; }
  return Object.keys(acts||{}).map(function(k){ return Object.assign({id:k},acts[k]); }).filter(function(x){ return x&&['closed','draft','suggested','accepted','resolved'].indexOf(x.status)<0; });
}
// ── single-facility report ─────────────────────────────────────
function nfFacilityReportHTML(code,preview){
  var f=(scMasterFacilities||{})[code]||{}, pr=(scMasterProgress||{})[code]||{}, pid=f.progId||'nqas_12A';
  var A=scFacilityReadiness(pid,pr,f.staff||{}), B=A.baseline||{}, hasB=!!B.assessed, n=A.nqas||scNqasCheckV2(A), day=nfDayOf(f);
  var ph=day==null?'—':day<1?'Starts '+scFmtDate(f.startDate):day<=7?'Baseline audit':day<=49?'Implementation':day<=56?'Revision':'Readiness week';
  var cho=Object.keys(f.staff||{}).map(function(m){ return f.staff[m]; }).find(function(s){ return s&&(s.role||'CHO')==='CHO'; });
  var acts=nfRptActions(code), today=scTodayStr(), od=acts.filter(function(x){ return x.dueDate&&x.dueDate<today; }).length;
  var k=function(v,l,c){ return '<div><b style="color:'+(c||'#13201F')+'">'+v+'</b><small>'+l+'</small></div>'; };
  var body='<div class="kp">'+k(A.coverage.assessed?A.pct+'%':'—','Current readiness',A.coverage.assessed?nfRptColor(A.pct):'#94A3B8')+k(hasB?B.pct+'%':'—','Baseline',hasB?nfRptColor(B.pct):'#94A3B8')
    +k(hasB?(A.pct-B.pct>=0?'+':'')+(A.pct-B.pct):'—','Change since baseline',hasB?(A.pct-B.pct>0?'#15803D':A.pct-B.pct<0?'#B91C1C':'#6B7A78'):'#94A3B8')
    +k(A.coverage.assessed+'/'+A.total,'Checkpoints assessed')+k(A.assessed?A.compliance+'%':'—','Compliance on assessed')
    +k(A.gaps.filter(function(g){ return !g.closed; }).length,'Open gaps','#B45309')+k(acts.length,'Open actions')+k(od,'Overdue actions',od?'#B91C1C':'#6B7A78')
    +k(A.daysComplete+'/'+A.totalDays,'Days completed')+k(A.daysVerified+'/'+A.daysDone,'Cards verified')+'</div>';
  body+='<div class="nq-l '+(!n.hasData?'na':n.meets?'ok':'no')+'"><b>'+(!n.hasData?'NQAS: no assessment yet':n.meets?'✓ Meets NQAS criteria':'✗ Not yet at NQAS criteria')+'</b>'
    +(n.hasData?' — overall '+A.pct+'% (needs '+n.overallMin+'%)'+(n.stdFails.length?'; '+n.stdFails.length+' of '+Object.keys(A.byStd).length+' Standards below minimum: '+n.stdFails.map(function(s){ return s+' '+A.byStd[s].pct+'% (≥'+scNqasStdMin(s)+'%)'; }).join(', '):''):'')+'</div>';
  var aocsOf=function(c){ return Object.keys(SC_CPM_AOC).filter(function(x){ return scAocCat(x)===c; }).join(', '); };
  body+='<h2>Structure · Process · Outcome<small>orange tick = baseline</small></h2><div class="dns">'+SC_AOC_CATS.map(function(c){ return nfRptDonut(c,'AoC '+aocsOf(c),A.byCat[c],B.byCat&&B.byCat[c]); }).join('')+'</div>';
  body+='<h2>Areas of Concern</h2><div class="cds">'+Object.keys(SC_CPM_AOC).map(function(x){ return nfRptCard('AoC '+x+' · '+SC_CPM_AOC[x],scAocCat(x),A.byAoc[x],B.byAoc&&B.byAoc[x]); }).join('')+'</div>';
  var order=SC_SVC_GROUPS.service, svc=Object.keys(A.byService).filter(function(s){ return scSvcGroup(s)==='service'; }).sort(function(x,y){ return order.indexOf(x)-order.indexOf(y); });
  var cc=Object.keys(A.byService).filter(function(s){ return scSvcGroup(s)!=='service'; }).sort();
  body+='<h2>Service packages<small>'+svc.length+'</small></h2><div class="cds">'+svc.map(function(s){ return nfRptCard(s,'',A.byService[s],B.byService&&B.byService[s]); }).join('')+'</div>';
  if(cc.length) body+='<h2>Cross-cutting areas<small>'+cc.length+'</small></h2><div class="cds">'+cc.map(function(s){ return nfRptCard(s,'',A.byService[s],B.byService&&B.byService[s]); }).join('')+'</div>';
  var stds=Object.keys(A.byStd).sort(scStdCmp);
  var hasT=stds.some(function(s){ return !!scRegTitle('std',s); });
  body+='<h2 class="pb">Standards<small>minimum to pass NQAS shown for each</small></h2><table><thead><tr><th>Standard</th>'+(hasT?'<th>Title</th>':'')+'<th class="c">Current</th><th class="c">Min</th><th class="c">Status</th><th class="c">Baseline</th><th class="c">Assessed</th></tr></thead><tbody>'
    +stds.map(function(s){ var b=A.byStd[s], m=scNqasStdMin(s), ok=b.pct>=m, bb=B.byStd&&B.byStd[s];
      return '<tr><td><b>'+s+'</b></td>'+(hasT?'<td>'+scEsc((scRegTitle('std',s)||'').slice(0,70))+'</td>':'')+'<td class="c" style="color:'+nfRptColor(b.pct)+'"><b>'+b.pct+'%</b></td><td class="c">'+m+'%</td><td class="c '+(ok?'ok':'no')+'">'+(ok?'✓':'✗')+'</td><td class="c">'+(bb&&bb.assessed?bb.pct+'%':'—')+'</td><td class="c">'+b.assessed+'/'+b.n+'</td></tr>'; }).join('')+'</tbody></table>';
  body+='<h2>Staff<small>own checkpoints, whole package</small></h2><table><thead><tr><th>Name</th><th>Role</th><th style="width:30%">Readiness</th><th class="c">Assessed</th><th class="c">Cards done</th><th class="c">Verified</th></tr></thead><tbody>'
    +A.staff.map(function(s){ var r=s.res, bp=r.baseline&&r.baseline.assessed?r.baseline.pct:null;
      return '<tr><td><b>'+scEsc(s.name)+'</b>'+(s.inRoster?'':'<small>(removed)</small>')+'</td><td>'+scEsc(s.role)+'</td><td><div class="rbw">'+nfRptBar(r.pct,bp)+'<b>'+r.pct+'%</b></div></td><td class="c">'+r.assessed+'/'+r.total+'</td><td class="c">'+r.daysDone+'</td><td class="c">'+r.daysVerified+'</td></tr>'; }).join('')+'</tbody></table>';
  if(acts.length){ acts.sort(function(x,y){ return String(x.dueDate||'9').localeCompare(String(y.dueDate||'9')); });
    body+='<h2>Open corrective actions<small>'+acts.length+' · '+od+' overdue</small></h2><table><thead><tr><th>Checkpoint</th><th>MoV item / action</th><th>Assigned to</th><th class="c">Re-check by</th><th class="c">Status</th></tr></thead><tbody>'
      +acts.slice(0,60).map(function(x){ var late=x.dueDate&&x.dueDate<today;
        return '<tr><td><b>'+scEsc(x.cpId||'')+'</b><small>'+scEsc((x.cpText||'').slice(0,60))+'</small></td><td>'+(x.itemText?'<small>MoV: '+scEsc(x.itemText.slice(0,80))+'</small>':'')+scEsc((x.action||'').slice(0,110))+'</td><td>'+scEsc(x.assignedToName||x.ownerName||'')+'</td>'
          +'<td class="c'+(late?' no':'')+'">'+scEsc(x.dueDate?scFmtDate(x.dueDate):'—')+'</td><td class="c"><span class="pill '+(late?'r':x.status==='done'?'g':'a')+'">'+(late?'Overdue':x.status==='done'?'Done':'Open')+'</span></td></tr>'; }).join('')+'</tbody></table>'
      +(acts.length>60?'<div class="sm">… and '+(acts.length-60)+' more in the app.</div>':''); }
  body+='<div class="sig"><div>CHO / Facility in-charge — name, signature, date</div><div>Supervisor — name, signature, date</div></div>';
  return nfRptDoc({title:'Facility readiness report',subtitle:f.name||code,badge:nfProTier(f),preview:preview,body:body,
    meta:[['Facility',(f.name||code)+' · '+code],['District',[f.district,f.state].filter(Boolean).join(', ')||'—'],['Package',scPkgLabel(pid)],['CHO',(cho&&cho.name)||f.choName||'—'],['Day',day==null?'—':day<1?'not started':day+' / '+getProg(pid).days+' · '+ph],['Start',f.startDate?scFmtDate(f.startDate):'—']]});
}
// ── Reports menu (facility · role · programme) ─────────────────
function nfRptSummary(list){
  var withData=list.filter(function(x){ return x.a.coverage&&x.a.coverage.assessed; });
  var avg=withData.length?Math.round(withData.reduce(function(s,x){ return s+x.a.pct; },0)/withData.length):null;
  var wb=list.filter(function(x){ return x.a.baseline&&x.a.baseline.assessed; }), gain=wb.length?Math.round(wb.reduce(function(s,x){ return s+(x.a.pct-x.a.baseline.pct); },0)/wb.length):null;
  var meets=withData.filter(function(x){ return x.a.nqas.meets; }).length;
  var k=function(v,l,c){ return '<div><b style="color:'+(c||'#13201F')+'">'+v+'</b><small>'+l+'</small></div>'; };
  return '<div class="kp">'+k(list.length,'Facilities')+k(avg===null?'—':avg+'%','Average readiness',avg===null?'#94A3B8':nfRptColor(avg))+k(gain===null?'—':(gain>=0?'+':'')+gain,'Average change since baseline',gain>0?'#15803D':gain<0?'#B91C1C':'#6B7A78')
    +k(meets+' / '+withData.length,'Meet NQAS criteria')+k(list.reduce(function(s,x){ return s+x.a.daysVerified; },0)+' / '+list.reduce(function(s,x){ return s+x.a.daysDone; },0),'Cards verified / done')+'</div>';
}
rptGenerate=function(action){
  var sel=rptGetSelectedFacs(), progF=_rptProg, roleF=_rptRole, list=[];
  sel.forEach(function(code){ var f=(scMasterFacilities||{})[code]; if(!f||f.migratedTo) return; if(progF&&f.progId!==progF) return;
    list.push({code:code,f:f,a:scFacilityReadiness(f.progId||'nqas_12A',(scMasterProgress||{})[code]||{},f.staff||{})}); });
  if(!list.length){ scAlert('No facilities match the selected filters. Please adjust your selection.','No facilities','🔍'); return; }
  list.sort(function(x,y){ return String(x.f.district||'').localeCompare(String(y.f.district||''))||String(x.f.name||x.code).localeCompare(String(y.f.name||y.code)); });
  var typeLabel=_rptType==='facility'?'Facility report':_rptType==='role'?'Role-wise report':'Programme report';
  var meta=[['Scope',list.length+' facilit'+(list.length===1?'y':'ies')]]; if(progF) meta.push(['Package',scPkgLabel(progF)]); if(roleF) meta.push(['Role',roleF]);
  var row=function(x){ var a=x.a, b=a.baseline||{}, has=a.coverage&&a.coverage.assessed, st=nfRptStatus(a);
    return '<td><b>'+scEsc(x.f.name||x.code)+'</b><small>'+scEsc(x.code)+'</small></td><td>'+scEsc(x.f.district||'—')+'</td>'
      +'<td><div class="rbw">'+nfRptBar(has?a.pct:0,b.assessed?b.pct:null)+'<b>'+(has?a.pct+'%':'—')+'</b></div></td><td class="c">'+(b.assessed?b.pct+'% '+nfRptChange(a.pct,b.pct):'—')+'</td><td><span class="pill '+st.cls+'">'+scEsc(st.txt)+'</span></td>'; };
  var body=nfRptSummary(list);
  if(_rptType==='facility'){
    body+='<h2>Facilities<small>bar = current readiness · orange tick = baseline</small></h2><table><thead><tr><th>Facility</th><th>District</th><th style="width:24%">Readiness</th><th class="c">Baseline</th><th>NQAS</th><th>Package</th><th class="c">Staff</th><th class="c">Cards verified</th></tr></thead><tbody>'
      +list.map(function(x){ return '<tr>'+row(x)+'<td>'+scEsc(scPkgShort(x.f.progId))+'</td><td class="c">'+Object.keys(x.f.staff||{}).length+'</td><td class="c">'+x.a.daysVerified+'/'+x.a.daysDone+'</td></tr>'; }).join('')+'</tbody></table>';
  } else if(_rptType==='role'){
    var rows=[]; list.forEach(function(x){ x.a.staff.forEach(function(s){ if(roleF&&s.role!==roleF) return; rows.push({x:x,s:s}); }); });
    body+='<h2>Staff<small>'+rows.length+' · own checkpoints, whole package</small></h2><table><thead><tr><th>Facility</th><th>Name</th><th>Role</th><th style="width:26%">Readiness</th><th class="c">Assessed</th><th class="c">Cards done</th><th class="c">Verified</th></tr></thead><tbody>'
      +rows.map(function(o){ var r=o.s.res, bp=r.baseline&&r.baseline.assessed?r.baseline.pct:null;
        return '<tr><td>'+scEsc(o.x.f.name||o.x.code)+'</td><td><b>'+scEsc(o.s.name)+'</b></td><td>'+scEsc(o.s.role)+'</td><td><div class="rbw">'+nfRptBar(r.pct,bp)+'<b>'+r.pct+'%</b></div></td><td class="c">'+r.assessed+'/'+r.total+'</td><td class="c">'+r.daysDone+'</td><td class="c">'+r.daysVerified+'</td></tr>'; }).join('')+'</tbody></table>';
  } else {
    var groups={}; list.forEach(function(x){ (groups[x.f.progId||'nqas_12A']=groups[x.f.progId||'nqas_12A']||[]).push(x); });
    Object.keys(groups).sort().forEach(function(p){ var g=groups[p];
      body+='<h2>Package: '+scEsc(scPkgLabel(p))+'<small>'+g.length+' facilit'+(g.length===1?'y':'ies')+'</small></h2><table><thead><tr><th>Facility</th><th>District</th><th style="width:24%">Readiness</th><th class="c">Baseline</th><th>NQAS</th><th>CHO</th><th class="c">Day</th></tr></thead><tbody>'
        +g.map(function(x){ var d=nfDayOf(x.f); return '<tr>'+row(x)+'<td>'+scEsc(x.f.choName||'—')+'</td><td class="c">'+(d==null?'—':d<1?'—':d)+'</td></tr>'; }).join('')+'</tbody></table>';
      var aoc={}; g.forEach(function(x){ Object.keys(x.a.byAoc).forEach(function(k){ var b=x.a.byAoc[k]; if(!b.assessed) return; (aoc[k]=aoc[k]||[]).push(b.pct); }); });
      if(Object.keys(aoc).length) body+='<div class="cds" style="margin-top:6px;">'+Object.keys(SC_CPM_AOC).filter(function(k){ return aoc[k]; }).map(function(k){ var v=Math.round(aoc[k].reduce(function(s,y){ return s+y; },0)/aoc[k].length);
          return '<div class="cd"><b class="cd-t">AoC '+k+' · '+scEsc(SC_CPM_AOC[k])+'</b><small>average of '+aoc[k].length+'</small><div class="cd-v"><b style="color:'+nfRptColor(v)+'">'+v+'%</b></div>'+nfRptBar(v,null)+'</div>'; }).join('')+'</div>';
    });
  }
  nfRptOpen(nfRptDoc({title:typeLabel,subtitle:'',meta:meta,body:body,preview:action==='preview'}));
  closeReportModal();
};
// ── drill-in / Facility dashboard PDF ──────────────────────────
scGenerateReport=async function(type,code){
  if(code&&(scMasterFacilities||{})[code]){ nfRptOpen(nfFacilityReportHTML(code,false)); return; }
  _rptType=type||'facility'; _rptProg=''; _rptRole='';
  var save=rptGetSelectedFacs; rptGetSelectedFacs=function(){ return Object.keys(scMasterFacilities||{}); };
  try{ rptGenerate('print'); } finally { rptGetSelectedFacs=save; }
};
// ── Baseline report PDF ────────────────────────────────────────
function nfBaselinePdf(hostId){
  var st=_scIns[hostId]; if(!st) return;
  var A=st.agg, B=A.baseline||{}, f=st.fac||{}, gaps=scBaselineGaps(A,st.progId,st.progress||{}), open=gaps.filter(function(g){ return g.open; });
  var stat=scBaselineStatus(st.progId,st.progress||{},st.staff||{}), done=stat.filter(function(x){ return x.complete; }).length;
  var Bc=Object.assign({},B,{coverage:{assessed:B.assessed||0}}), n=scNqasCheckV2(Bc);
  var k=function(v,l,c){ return '<div><b style="color:'+(c||'#13201F')+'">'+v+'</b><small>'+l+'</small></div>'; };
  var body='<div class="kp">'+k(done+'/7','Baseline days completed')+k((B.assessed||0)+'/'+A.total,'Checkpoints with a baseline')+k(B.assessed?B.pct+'%':'—','Baseline readiness',B.assessed?nfRptColor(B.pct):'#94A3B8')
    +k(gaps.length,'Gaps found at baseline','#B45309')+k(gaps.length-open.length,'Fixed since','#15803D')+'</div>';
  body+='<div class="nq-l '+(!n.hasData?'na':n.meets?'ok':'no')+'"><b>'+(!n.hasData?'No baseline yet':n.meets?'✓ Met NQAS criteria at baseline':'✗ Not at NQAS criteria at baseline')+'</b>'
    +(n.hasData?' — overall '+B.pct+'%'+(n.stdFails.length?'; '+n.stdFails.length+' Standards below minimum':''):'')+'</div>';
  body+='<h2>Baseline days</h2><table><thead><tr><th>Day</th><th>Rapid audit</th><th class="c">Staff done</th><th>Waiting for</th></tr></thead><tbody>'
    +stat.map(function(x){ return '<tr><td><b>Day '+(x.di+1)+'</b></td><td>'+scEsc(x.title)+'</td><td class="c '+(x.complete?'ok':'')+'">'+x.done+'/'+x.need+'</td><td>'+scEsc(x.pending.join(', ')||'—')+'</td></tr>'; }).join('')+'</tbody></table>';
  if(B.assessed){
    body+='<h2>Structure · Process · Outcome at baseline</h2><div class="dns">'+SC_AOC_CATS.map(function(c){ return nfRptDonut(c,'',B.byCat[c],null); }).join('')+'</div>';
    body+='<h2>Areas of Concern at baseline</h2><div class="cds">'+Object.keys(SC_CPM_AOC).map(function(x){ return nfRptCard('AoC '+x+' · '+SC_CPM_AOC[x],scAocCat(x),B.byAoc[x],null); }).join('')+'</div>';
    var weak=Object.keys(B.byStd).filter(function(s){ return B.byStd[s].assessed; }).sort(function(a,b){ return (B.byStd[a].pct-scNqasStdMin(a))-(B.byStd[b].pct-scNqasStdMin(b)); }).slice(0,12);
    var hasT=weak.some(function(s){ return !!scRegTitle('std',s); });
    body+='<h2>Weakest Standards at baseline</h2><table><thead><tr><th>Standard</th>'+(hasT?'<th>Title</th>':'')+'<th class="c">Baseline</th><th class="c">Min</th><th class="c">Now</th></tr></thead><tbody>'
      +weak.map(function(s){ var b=B.byStd[s], c=A.byStd[s]; return '<tr><td><b>'+s+'</b></td>'+(hasT?'<td>'+scEsc((scRegTitle('std',s)||'').slice(0,70))+'</td>':'')+'<td class="c" style="color:'+nfRptColor(b.pct)+'"><b>'+b.pct+'%</b></td><td class="c">'+scNqasStdMin(s)+'%</td><td class="c">'+(c?c.pct+'%':'—')+'</td></tr>'; }).join('')+'</tbody></table>';
  }
  if(gaps.length){
    body+='<h2 class="pb">Baseline gaps<small>'+gaps.length+' · '+open.length+' still open · by implementation day</small></h2><table><thead><tr><th>Checkpoint</th><th>Unmet MoV items</th><th class="c">Baseline</th><th class="c">Now</th><th>Lowest scorer</th><th class="c">Re-check day</th></tr></thead><tbody>'
      +gaps.slice(0,120).map(function(g){ return '<tr><td><b>'+scEsc(g.cp.id)+'</b><small>'+scEsc((g.cp.t||'').slice(0,70))+'</small></td><td>'+scEsc(g.unmet.map(function(i){ return i.t; }).join(' · ').slice(0,160)||'—')+'</td>'
        +'<td class="c">'+(g.base===1?'<span class="pill a">Partial</span>':'<span class="pill r">Non</span>')+'</td><td class="c">'+(g.current===2?'<span class="pill g">Full</span>':g.current===1?'<span class="pill a">Partial</span>':g.current===0?'<span class="pill r">Non</span>':'—')+'</td>'
        +'<td>'+scEsc(g.owner?g.owner.name+' ('+g.owner.role+')':'—')+'</td><td class="c">'+g.dueDay+'</td></tr>'; }).join('')+'</tbody></table>'
      +(gaps.length>120?'<div class="sm">… and '+(gaps.length-120)+' more — see the Baseline report CSV.</div>':'');
  }
  nfRptOpen(nfRptDoc({title:'Baseline report',subtitle:f.name||st.code,badge:nfProTier(f),preview:false,body:body,
    meta:[['Facility',(f.name||st.code)+' · '+st.code],['District',[f.district,f.state].filter(Boolean).join(', ')||'—'],['Package',scPkgLabel(st.progId)]]}));
}
(function(){
  var oR=scInsRender;
  scInsRender=function(hostId){ var r=oR.apply(this,arguments);
    try{ var st=_scIns[hostId]; if(!st||st.tab!=='baseline') return r; var host=document.getElementById(hostId); if(!host||host.querySelector('.nf-bl-pdf')) return r;
      var csv=[].slice.call(host.querySelectorAll('button')).find(function(b){ return /Baseline report CSV/.test(b.textContent); });
      if(csv){ var b=document.createElement('button'); b.className=csv.className+' nf-bl-pdf'; b.style.cssText=csv.getAttribute('style')||''; b.innerHTML='<i class="ti ti-file-text"></i> Baseline report PDF';
        b.setAttribute('onclick',"nfBaselinePdf('"+scJs(hostId)+"')"); csv.parentNode.insertBefore(b,csv); } }catch(e){}
    return r; };
})();
