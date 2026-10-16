
// ══════════════════════════════════════════════════════════════
// BUSINESS TAB + REPORT (HealSol Admin only)
//  Dates From–To (or This month / Last month / This financial year / All time) filter the EVENTS in the period:
//  registrations, payments, enquiries and saved cards. Status lists (follow-up, payment due, not moving, districts)
//  always show today's position. One data model feeds the dashboard, the preview, the Excel file and the PDF.
// ══════════════════════════════════════════════════════════════
var _nfBd={preset:'fy',from:'',to:'',tab:'follow',q:'',pays:null,paysAt:0,pvSheet:0};
async function nfBizLoad(force){
  if(appMode!=='sc-admin') return;
  if(force||!_nfBiz.at||Date.now()-_nfBiz.at>60000){ try{ _nfBiz.leads=await fbGet('shared/sc_leads')||{}; _nfBiz.pricing=await fbGet('shared/sc_pricing_config')||null; _nfBiz.at=Date.now(); }catch(e){} }
  if(force||!_nfBd.pays||Date.now()-_nfBd.paysAt>60000){ try{ _nfBd.pays=await fbGet('sc_payments')||{}; _nfBd.paysAt=Date.now(); }catch(e){ _nfBd.pays=_nfBd.pays||{}; } }
}
function nfIsoLocal(iso){ if(!iso) return ''; iso=String(iso); if(iso.length<=10) return iso.slice(0,10); var d=new Date(iso); if(isNaN(d)) return iso.slice(0,10);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nfBizRange(){
  var t=scTodayStr(), y=+t.slice(0,4), m=+t.slice(5,7), p=_nfBd.preset, pad=function(n){ return String(n).padStart(2,'0'); }, rg;
  if(p==='month') rg={from:y+'-'+pad(m)+'-01',to:t,label:'This month'};
  else if(p==='lastmonth'){ var ly=m===1?y-1:y, lm=m===1?12:m-1; rg={from:ly+'-'+pad(lm)+'-01',to:ly+'-'+pad(lm)+'-'+pad(new Date(ly,lm,0).getDate()),label:'Last month'}; }
  else if(p==='fy'){ var fy=m>=4?y:y-1; rg={from:fy+'-04-01',to:t,label:'Financial year '+fy+'-'+pad((fy+1)%100)}; }
  else if(p==='all') rg={from:'',to:'',label:'All time'};
  else { var f=_nfBd.from||'', to=_nfBd.to||''; if(f&&to&&f>to){ var x=f; f=to; to=x; } rg={from:f,to:to,label:'Selected dates'}; }
  rg.text=rg.from||rg.to?(rg.from?scFmtDate(rg.from):'Start')+' – '+(rg.to?scFmtDate(rg.to):scFmtDate(t)):'everything so far';
  return rg;
}
function nfR2(n){ return Math.round((Number(n)||0)*100)/100; }
function nfBizData(){
  var rg=nfBizRange(), today=scTodayStr();
  var inR=function(iso,allowEmpty){ var d=nfIsoLocal(iso); if(!d) return !!allowEmpty&&!rg.from&&!rg.to; return (!rg.from||d>=rg.from)&&(!rg.to||d<=rg.to); };
  var S=nfBizStats(), R=nfFacilityRows(), F=scMasterFacilities||{}, L=_nfBiz.leads||{};
  // payments: receipts, plus payments recorded before receipts existed
  var all=[], withR={}, PS=_nfBd.pays||{};
  Object.keys(PS).forEach(function(c){ Object.values(PS[c]||{}).forEach(function(x){ if(!x) return; var code=x.code||c; withR[code]=1;
    all.push({receiptNo:x.receiptNo||'',date:nfIsoLocal(x.paidAt),code:code,name:x.facilityName||(F[code]||{}).name||code,district:x.district||(F[code]||{}).district||'',pkg:x.packageLabel||x.package||'',
      base:x.base!=null?Number(x.base):'',gst:x.gst!=null?Number(x.gst):'',total:Number(x.total)||0,method:x.method||'',ref:x.paymentId||x.reference||'',how:x.source==='razorpay'?'In-app (Razorpay)':'Recorded by HealSol'}); }); });
  R.forEach(function(r){ if(r.paidAmount!==''&&!withR[r.code]) all.push({receiptNo:'(before receipts)',date:r.paidOn,code:r.code,name:r.name,district:r.district,pkg:r.package,base:'',gst:'',total:Number(r.paidAmount)||0,method:'',ref:r.paidRef,how:''}); });
  all.sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
  var P=all.filter(function(p){ return inR(p.date,true); });
  var regs=R.filter(function(r){ return inR(r.enrolled,true); }), selfR=regs.filter(function(r){ return r.demo==='Yes'; }), selfPaid=selfR.filter(function(r){ return r.status==='Paid'; });
  var enq=Object.keys(L).map(function(k){ return Object.assign({_k:k},L[k]||{}); }).filter(function(x){ return inR(x.submittedAt,true); })
    .sort(function(a,b){ return String(b.submittedAt||'').localeCompare(String(a.submittedAt||'')); });
  var cards=0, active={}, Pg=scMasterProgress||{};
  Object.keys(Pg).forEach(function(c){ if(!F[c]||F[c].migratedTo) return; var P1=Pg[c]||{};
    Object.keys(P1).forEach(function(m){ var ds=P1[m]||{}; Object.keys(ds).forEach(function(k){ var d=ds[k]||{}; if(d.updatedAt&&inR(d.updatedAt)){ cards++; active[c]=1; } }); }); });
  // months across the period (max 24)
  var mFrom=rg.from, mTo=rg.to||today;
  if(!mFrom) mFrom=[].concat(regs.map(function(r){ return r.enrolled; }),P.map(function(p){ return p.date; })).filter(Boolean).sort()[0]||today;
  var months=[], d0=new Date(+mFrom.slice(0,4),+mFrom.slice(5,7)-1,1), end=new Date(+mTo.slice(0,4),+mTo.slice(5,7)-1,1);
  while(d0<=end&&months.length<120){ months.push({k:d0.getFullYear()+'-'+String(d0.getMonth()+1).padStart(2,'0'),l:d0.toLocaleDateString('en-IN',{month:'short',year:'2-digit'}),regH:0,regS:0,payN:0,amt:0}); d0.setMonth(d0.getMonth()+1); }
  if(months.length>24) months=months.slice(-24);
  var mi={}; months.forEach(function(m){ mi[m.k]=m; });
  regs.forEach(function(r){ var M=mi[String(r.enrolled).slice(0,7)]; if(M) M[r.demo==='Yes'?'regS':'regH']++; });
  P.forEach(function(p){ var M=mi[String(p.date).slice(0,7)]; if(M){ M.payN++; M.amt=nfR2(M.amt+p.total); } });
  var dkey=function(s){ return (s||'').trim()||'—'; };
  var dist=Object.keys(S.districts).sort().map(function(k){ var D=S.districts[k];
    return {name:k,n:D.n,a:D.a,b:D.b,paid:D.paid,trial:D.trial,contract:D.contract,avg:D.pctN?Math.round(D.pctSum/D.pctN):'',
      newN:regs.filter(function(r){ return dkey(r.district)===k; }).length,amt:nfR2(P.filter(function(p){ return dkey(p.district)===k; }).reduce(function(s,p){ return s+p.total; },0))}; });
  var sum=function(a,k){ return nfR2(a.reduce(function(s,x){ return s+(Number(x[k])||0); },0)); };
  return {rg:rg,today:today,S:S,R:R,pays:P,payAll:all,paySum:sum(P,'total'),payBase:sum(P,'base'),payGst:sum(P,'gst'),payAllSum:sum(all,'total'),
    regs:regs,selfR:selfR,selfPaid:selfPaid,enq:enq,cards:cards,active:Object.keys(active).length,months:months,dist:dist,
    follow:R.filter(function(r){ return r.followUp; }),idle:R.filter(function(r){ return r._idle; })};
}
// ── the report's sheets (Excel = all; PDF = Summary, Monthly, Follow-up, Payments, Districts) ──
function nfBizSheets(D){
  var S=D.S, conv=S.demos?Math.round(S.converted/S.demos*100):0, nd=Object.keys(S.districts).filter(function(d){ return d!=='—'; }).length, out=[];
  var add=function(name,rows,widths){ out.push({name:name,rows:rows,widths:widths}); };
  add('Summary',[
    ['NQAS | FAST — HealSol business report'],['Period',D.rg.label+' ('+D.rg.text+')'],['As of',scFmtDate(D.today)],[],
    ['In the period','Value','Detail'],
    ['New registrations',D.regs.length,'enrolled by HealSol '+(D.regs.length-D.selfR.length)+' · self-registered '+D.selfR.length],
    ['Self-registrations (new)',D.selfR.length,D.selfPaid.length+' of them paid'],
    ['Payments received (₹)',D.paySum,D.pays.length+' payment(s)'+(D.payBase?' · price '+nfMoney(D.payBase)+' + GST '+nfMoney(D.payGst):'')],
    ['Enquiries received',D.enq.length,''],
    ['Cards saved',D.cards,'by '+D.active+' facilit'+(D.active===1?'y':'ies')],
    [],
    ['Position today','Value','Detail'],
    ['Registered '+NF_CFG.plural,S.total,'Type A '+S.typeA+' · Type B '+S.typeB],
    ['Paid',S.paid,''],['Contract (government / district)',S.contract,''],['On trial',S.trial,S.due.length+' trial(s) ended, not paid'],
    ['Self-registrations (all)',S.demos,S.converted+' paid ('+conv+'%)'],
    ['Payments received to date (₹)',D.payAllSum,D.payAll.length+' payment(s)'],
    ['Payment due',S.due.length,S.dueValue?nfMoney(S.dueValue)+' expected':''],
    ['Need follow-up',D.follow.length,'see Follow-up sheet'],
    ['Not moving',D.idle.length,'programme running, no card saved for '+NF_IDLE_DAYS+'+ days'],
    ['Programme in progress',S.started,''],['Programme completed',S.completed,''],['Not started',S.notStarted,''],
    ['Districts',nd,Object.keys(S.states).length+' state(s)'],
    ['Active staff accounts',S.staff,''],['Open enquiries',S.leadsOpen.length,S.leadsFac?'~'+S.leadsFac+' facilities requested':'']
  ],[34,16,50]);
  var tot=D.months.reduce(function(t,m){ t.h+=m.regH; t.s+=m.regS; t.n+=m.payN; t.a=nfR2(t.a+m.amt); return t; },{h:0,s:0,n:0,a:0});
  add('Monthly',[['Month','New (HealSol)','New (self-registered)','New total','Payments','Received ₹']]
    .concat(D.months.map(function(m){ return [m.l,m.regH,m.regS,m.regH+m.regS,m.payN,m.amt]; })).concat([['Total',tot.h,tot.s,tot.h+tot.s,tot.n,tot.a]]),[10,13,18,10,10,12]);
  var head=['Facility ID','Name','District','State','Package','Type','Status','Self-registered','Enrolled','Start date','Programme day','Phase','Readiness %','Staff','CHO','CHO mobile','Last activity','Days since activity','Trial ends','Expected ₹','Last payment ₹','Paid on','Payment ref','Follow-up'];
  add('Facilities',[head].concat(D.R.map(function(r){ return [r.code,r.name,r.district,r.state,r.package,r.type,r.status,r.demo,r.enrolled,r.start,r.day,r.phase,r.readiness,r.staff,r.choName,r.choMobile,r.lastActivity,r.idleDays,r.trialEnds,r.expected,r.paidAmount,r.paidOn,r.paidRef,r.followUp]; })),
    [14,24,14,12,26,6,9,6,11,11,12,12,11,6,20,13,12,10,11,10,12,11,22,44]);
  add('Follow-up',[['Facility ID','Name','District','Status','CHO','CHO mobile','Follow-up','Expected ₹','Last activity']].concat(D.follow.map(function(r){ return [r.code,r.name,r.district,r.status,r.choName,r.choMobile,r.followUp,r.expected,r.lastActivity]; })),[14,24,14,9,20,13,52,10,12]);
  add('Self-registrations',[['Facility ID','Name','District','Registered','Free days end','Status','Paid','CHO','CHO mobile','Readiness %']].concat(D.selfR.map(function(r){ return [r.code,r.name,r.district,r.enrolled,r.trialEnds,r.status,r.converted||'No',r.choName,r.choMobile,r.readiness]; })),[14,24,14,11,11,9,10,20,13,11]);
  add('Payments',[['Receipt no','Paid on','Facility ID','Name','District','Package','Price ₹','GST ₹','Total ₹','Paid by','Payment ID / reference','How']].concat(D.pays.map(function(x){ return [x.receiptNo,x.date,x.code,x.name,x.district,x.pkg,x.base,x.gst,x.total,x.method,x.ref,x.how]; })),[18,11,14,24,14,26,10,9,10,13,24,18]);
  add('Not moving',[['Facility ID','Name','District','Programme day','Last activity','Days since activity','CHO','CHO mobile','Readiness %']].concat(D.idle.map(function(r){ return [r.code,r.name,r.district,r.day,r.lastActivity||'Never',r.idleDays,r.choName,r.choMobile,r.readiness]; })),[14,24,14,12,12,10,20,13,11]);
  add('Districts',[['District','Facilities','Type A','Type B','Paid','Trial','Contract','Avg readiness %','New in period','Received in period ₹']].concat(D.dist.map(function(x){ return [x.name,x.n,x.a,x.b,x.paid,x.trial,x.contract,x.avg,x.newN,x.amt]; })),[18,10,8,8,8,8,9,14,12,16]);
  add('Enquiries',[['Submitted','Organisation','Contact','Designation','Mobile','Email','District','State','Facilities','Packages','Status','Message']].concat(D.enq.map(function(x){ return [String(x.submittedAt||'').slice(0,10),x.orgName||'',x.contactName||'',x.designation||'',x.mobile||'',x.email||'',x.district||'',x.state||'',x.facilityCount||'',x.packages||'',x.status||'',x.message||'']; })),[11,24,18,16,13,22,14,12,9,16,9,40]);
  return out;
}
function nfBizFileName(D,ext){ return 'NQAS-FAST-business-report-'+(D.rg.from||D.rg.to?(D.rg.from||'start')+'-to-'+(D.rg.to||D.today):'all-time-'+D.today)+'.'+ext; }
async function nfBizExcel(D){
  var X=await nfLoadXlsx(), wb=X.utils.book_new();
  nfBizSheets(D).forEach(function(s){ var ws=X.utils.aoa_to_sheet(s.rows); ws['!cols']=s.widths.map(function(w){ return {wch:w}; }); X.utils.book_append_sheet(wb,ws,s.name); });
  return nfSaveWb(X,wb,nfBizFileName(D,'xlsx'));
}
// ── PDF: landscape A4, logos and page numbers on every page ──
async function nfBizPdf(D){
  var J=await nfLoadPdf(), doc=nfPdfNew(J,'l'), F=doc._nfFont, M=function(n){ return nfPdfMoney(doc,n); }, T=function(s){ return nfPdfTxt(doc,s); };
  var W=297, H=210, L=12, R=W-12, TEAL=[19,90,85], GREY=[100,116,139], INK=[19,32,31], LINE=[227,234,232], S=D.S, y=31;
  var title=function(t,sub){ if(y>H-34){ doc.addPage(); y=31; } doc.setFont(F,'bold'); doc.setFontSize(12); doc.setTextColor.apply(doc,TEAL); doc.text(t,L,y);
    if(sub){ var tw=doc.getTextWidth(t); doc.setFont(F,'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc,GREY); doc.text(T(sub),L+tw+3,y); } y+=3; };
  var tile=function(x,yy,w,h,label,val,sub,col){ doc.setDrawColor.apply(doc,LINE); doc.setLineWidth(0.3); doc.roundedRect(x,yy,w,h,2,2,'S');
    doc.setFont(F,'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc,GREY); doc.text(T(label).toUpperCase(),x+3,yy+5);
    doc.setFont(F,'bold'); doc.setFontSize(14); doc.setTextColor.apply(doc,col||INK); doc.text(T(String(val)),x+3,yy+12.5);
    if(sub){ doc.setFont(F,'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc,GREY); doc.text(doc.splitTextToSize(T(sub),w-6)[0],x+3,yy+17.5); } };
  var row=function(items){ var n=items.length, g=4, w=(R-L-g*(n-1))/n; items.forEach(function(it,i){ tile(L+i*(w+g),y,w,21,it[0],it[1],it[2],it[3]); }); y+=26; };
  var table=function(head,body,colStyles){ if(!body.length){ doc.setFont(F,'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc,GREY); doc.text('None.',L,y+4); y+=11; return; }
    doc.autoTable({startY:y+1,head:[head],body:body,margin:{left:L,right:L,top:30,bottom:14},
      styles:{font:F,fontSize:8,cellPadding:1.7,textColor:INK,lineColor:[238,242,241],lineWidth:{bottom:0.2},overflow:'linebreak'},
      headStyles:{font:F,fontStyle:'bold',fillColor:TEAL,textColor:255,fontSize:7.5},alternateRowStyles:{fillColor:[248,250,249]},columnStyles:colStyles||{},
      didParseCell:function(h){ var cs=(colStyles||{})[h.column.index]; if(h.section==='head'&&cs&&cs.halign) h.cell.styles.halign=cs.halign; }});
    y=doc.lastAutoTable.finalY+9; };
  // title block
  doc.setFont(F,'bold'); doc.setFontSize(18); doc.setTextColor.apply(doc,INK); doc.text('Business report',L,y+2);
  doc.setFont(F,'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc,GREY);
  doc.text(T('Period: '+D.rg.label+' ('+D.rg.text+')  ·  Position as of '+scFmtDate(D.today)),L,y+8); y+=15;
  title('In the period',D.rg.text);
  row([['New registrations',D.regs.length,'HealSol '+(D.regs.length-D.selfR.length)+' · self '+D.selfR.length,TEAL],['Self-registrations',D.selfR.length,D.selfPaid.length+' paid',[29,78,216]],
    ['Payments received',M(D.paySum),D.pays.length+' payment'+(D.pays.length===1?'':'s'),[21,128,61]],['Enquiries',D.enq.length,'district / bulk',[109,40,217]],['Cards saved',D.cards,'by '+D.active+' facilit'+(D.active===1?'y':'ies'),[146,64,14]]]);
  title('Position today');
  row([['Registered',S.total,'Type A '+S.typeA+' · Type B '+S.typeB,TEAL],['Paid',S.paid,'contract '+S.contract,[21,128,61]],['On trial',S.trial,S.due.length+' ended, not paid',[146,64,14]],
    ['Payment due',S.due.length,S.dueValue?M(S.dueValue)+' expected':'nothing due',[185,28,28]],['Need follow-up',D.follow.length,'not moving '+D.idle.length,[185,28,28]],['Received to date',M(D.payAllSum),D.payAll.length+' payments',[21,128,61]]]);
  // money by month chart
  var ms=D.months.slice(-12);
  if(ms.length){ title('Money received by month',ms.length<D.months.length?'last 12 months of the period':'');
    var ch=34, cy=y+3, mx=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.amt; }))), gw=(R-L)/ms.length, bw=Math.min(16,gw*0.6);
    if(cy+ch+12>H-14){ doc.addPage(); y=31; cy=y+3; }
    doc.setDrawColor.apply(doc,LINE); doc.line(L,cy+ch,R,cy+ch);
    ms.forEach(function(m,i){ var h=m.amt/mx*ch, x=L+i*gw+(gw-bw)/2; if(h>0){ doc.setFillColor(21,128,61); doc.roundedRect(x,cy+ch-h,bw,h,1,1,'F'); }
      doc.setFont(F,'normal'); doc.setFontSize(6.5); doc.setTextColor.apply(doc,GREY); doc.text(m.l,x+bw/2,cy+ch+4,{align:'center'});
      if(m.amt){ doc.setTextColor.apply(doc,INK); doc.text(M(m.amt),x+bw/2,cy+ch-h-1.5,{align:'center'}); } });
    y=cy+ch+11; }
  title('Monthly'); table(['Month','New (HealSol)','New (self-registered)','New total','Payments','Received'],D.months.map(function(m){ return [m.l,m.regH,m.regS,m.regH+m.regS,m.payN,M(m.amt)]; }),{5:{halign:'right'}});
  title('Follow-up','position today · '+D.follow.length);
  table(['Facility','District','Status','CHO','Follow-up','Expected'],D.follow.map(function(r){ return [r.name+'\n'+r.code,r.district,r.status,[r.choName,r.choMobile].filter(Boolean).join('\n'),r.followUp,r.expected!==''?M(r.expected):'']; }),{0:{cellWidth:48},4:{cellWidth:88},5:{halign:'right'}});
  title('Payments','in the period · '+D.pays.length);
  table(['Receipt','Paid on','Facility','Package','Price','GST','Total','Paid by','Reference'],D.pays.map(function(x){ return [x.receiptNo,x.date?scFmtDate(x.date):'',x.name+'\n'+x.code,x.pkg,x.base!==''?M(x.base):'',x.gst!==''?M(x.gst):'',M(x.total),x.method||x.how,x.ref]; }),{4:{halign:'right'},5:{halign:'right'},6:{halign:'right',fontStyle:'bold'}});
  title('Districts','position today, with new registrations and money in the period');
  table(['District','Facilities','A / B','Paid','Trial','Contract','Avg readiness','New in period','Received in period'],D.dist.map(function(x){ return [x.name,x.n,x.a+' / '+x.b,x.paid,x.trial,x.contract,x.avg!==''?x.avg+'%':'—',x.newN,M(x.amt)]; }),{8:{halign:'right'}});
  // header + footer on every page
  var n=doc.getNumberOfPages(), when=new Date().toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
  for(var i=1;i<=n;i++){ doc.setPage(i);
    nfPdfImg(doc,SC_BRAND.logoNqas,L,8,12);
    var hw=nfPdfImg(doc,SC_BRAND.logoHealsol,R,9.5,5.5,true);
    doc.setFont(F,'bold'); doc.setFontSize(10); doc.setTextColor.apply(doc,TEAL); doc.text('NQAS | FAST',R-(hw?hw+3:0),13.5,{align:'right'});
    doc.setFont(F,'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc,GREY); doc.text('HealSol business report · '+T(D.rg.label),R,18.5,{align:'right'});
    doc.setDrawColor.apply(doc,TEAL); doc.setLineWidth(0.8); doc.line(L,22,R,22);
    doc.setDrawColor.apply(doc,LINE); doc.setLineWidth(0.2); doc.line(L,H-10,R,H-10);
    doc.setFontSize(7); doc.setTextColor.apply(doc,GREY); doc.text('NQAS | FAST · by HealSol Academy · Confidential — HealSol internal · generated '+when,L,H-6);
    doc.text('Page '+i+' of '+n,R,H-6,{align:'right'}); }
  return nfSaveDoc(doc,nfBizFileName(D,'pdf'));
}
// ── date range bar (dashboard and preview share one range) ──
function nfBizRangeHTML(ctx){
  var rg=nfBizRange(), p=_nfBd.preset, t=scTodayStr();
  var chip=function(v,l){ return '<button type="button" class="nfbd-chip'+(p===v?' on':'')+'" onclick="nfBizSetPreset(\''+v+'\',\''+ctx+'\')">'+l+'</button>'; };
  return '<div class="nfbd-range">'+chip('month','This month')+chip('lastmonth','Last month')+chip('fy','This financial year')+chip('all','All time')
    +'<span class="nfbd-dates"><label>From <input type="date" id="nfbd-from-'+ctx+'" value="'+(rg.from||'')+'" max="'+t+'" onchange="nfBizSetDate(\'from\',this.value,\''+ctx+'\')"></label>'
    +'<label>To <input type="date" id="nfbd-to-'+ctx+'" value="'+(rg.to||'')+'" max="'+t+'" onchange="nfBizSetDate(\'to\',this.value,\''+ctx+'\')"></label></span></div>';
}
function nfBizSetPreset(p,ctx){ _nfBd.preset=p; nfBizRerender(ctx); }
function nfBizSetDate(k,v,ctx){ var rg=nfBizRange(); _nfBd.from=rg.from; _nfBd.to=rg.to; _nfBd[k]=v||''; _nfBd.preset='custom'; nfBizRerender(ctx); }
function nfBizRerender(ctx){ if(document.getElementById('nf-bizpv')) nfBizPvRender(); if(_nfOv.view==='business') nfRenderBizDash(); }
// ── dashboard ──
function nfRupeeShort(n){ n=Number(n)||0; if(n>=1e7) return '₹'+(n/1e7).toFixed(n>=1e8?0:1).replace(/\.0$/,'')+' Cr'; if(n>=1e5) return '₹'+(n/1e5).toFixed(1).replace(/\.0$/,'')+' L'; if(n>=1e3) return '₹'+(n/1e3).toFixed(1).replace(/\.0$/,'')+'k'; return '₹'+Math.round(n); }
function nfBizCard(icon,cls,label,val,sub,tab){ return '<div class="nfb-card '+cls+(tab?' click':'')+'"'+(tab?' onclick="nfBizTab(\''+tab+'\',true)"':'')+'><span class="nfb-i"><i class="ti '+icon+'"></i></span><div><small>'+scEsc(label)+'</small><b>'+val+'</b><em>'+sub+'</em></div></div>'; }
async function nfRenderBizDash(load){
  if(appMode!=='sc-admin') return;
  var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-biz'); if(!box){ box=document.createElement('div'); box.id='nf-biz'; box.dataset.nfv='business'; main.insertBefore(box,main.firstChild); }
  if(load||!_nfBd.pays){ if(!box.innerHTML) box.innerHTML='<div class="nfbd-empty">Loading…</div>'; await nfBizLoad(load==='force'); }
  var D=nfBizData(), S=D.S; _nfBd._D=D;
  var conv=D.selfR.length?Math.round(D.selfPaid.length/D.selfR.length*100):0;
  var h='<div class="nfo-top"><div><h1>Business</h1><small>HealSol only · '+scEsc(D.rg.label)+' · '+scEsc(D.rg.text)+'</small></div>'
    +'<button type="button" class="nfo-ic" title="Refresh" onclick="nfRenderBizDash(\'force\')"><i class="ti ti-refresh"></i></button>'
    +'<button type="button" class="nfbd-dl" onclick="nfBizPreview()"><i class="ti ti-download"></i> Preview &amp; download</button></div>'
    +nfBizRangeHTML('dash')
    +'<div class="nfbd-sec"><b><i class="ti ti-calendar"></i> In this period</b><span>'+scEsc(D.rg.text)+'</span></div><div class="nfb-grid">'
    +nfBizCard('ti-building-plus','t','New registrations',D.regs.length,'HealSol '+(D.regs.length-D.selfR.length)+' · self-registered '+D.selfR.length,'regs')
    +nfBizCard('ti-rocket','b','Self-registrations',D.selfR.length,D.selfPaid.length+' paid'+(D.selfR.length?' ('+conv+'%)':''),'regs')
    +nfBizCard('ti-currency-rupee','g','Payments received',nfRupee(D.paySum),D.pays.length+' payment'+(D.pays.length===1?'':'s')+(D.payGst?' · GST '+nfRupee(D.payGst):''),'pays')
    +nfBizCard('ti-mail-opened','v','Enquiries received',D.enq.length,'district / bulk enrolment','enq')
    +nfBizCard('ti-cards','a','Cards saved',D.cards,'by '+D.active+' facilit'+(D.active===1?'y':'ies'),'')
    +'</div><div class="nfbd-sec"><b><i class="ti ti-layout-dashboard"></i> Position today</b><span>'+scEsc(scFmtDate(D.today))+'</span></div><div class="nfb-grid">'
    +nfBizCard('ti-building-hospital','t','Registered '+NF_CFG.plural,S.total,'Type A '+S.typeA+' · Type B '+S.typeB,'dist')
    +nfBizCard('ti-circle-check','g','Paid',S.paid,'contract '+S.contract+' · received to date '+nfRupee(D.payAllSum),'')
    +nfBizCard('ti-hourglass','a','On trial',S.trial,S.due.length?'<span class="r">'+S.due.length+' ended, not paid</span>':'none ended yet','due')
    +nfBizCard('ti-alert-circle','r','Payment due',S.due.length,S.due.length?(S.dueValue?nfRupee(S.dueValue)+' expected':'trial ended, not paid'):'nothing due','due')
    +nfBizCard('ti-list-check','r','Need follow-up',D.follow.length,'not moving '+D.idle.length+' · tap to see why','follow')
    +'</div><div class="nfbd-charts">'+nfBizChartsHTML(D)+'</div>'
    +'<div class="nfo-card"><div class="nfbd-tabs" id="nfbd-tabs"></div><div id="nfbd-list"></div></div>';
  box.innerHTML=h; nfBizList();
  try{ nfAdminApply(); }catch(e){}
}
function nfBizChartsHTML(D){
  var ms=D.months.slice(-12), mxA=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.amt; }).concat([0]))), mxR=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.regH+m.regS; }).concat([0])));
  var sub=ms.length<D.months.length?'last 12 months of the period':'by month';
  var a=ms.map(function(m){ return '<div class="nfb-bar"><b>'+(m.amt?nfRupeeShort(m.amt):'')+'</b><i class="amt" style="height:'+Math.round(m.amt/mxA*120)+'px" title="'+scEsc(m.l+': '+nfRupee(m.amt)+' · '+m.payN+' payment(s)')+'"></i><small>'+scEsc(m.l)+'</small></div>'; }).join('');
  var r=ms.map(function(m){ var t=m.regH+m.regS; return '<div class="nfb-bar"><b>'+(t||'')+'</b><div class="nfb-stack" style="height:'+Math.round(t/mxR*120)+'px"><i class="dm" style="flex:'+m.regS+'"></i><i class="dr" style="flex:'+m.regH+'"></i></div><small>'+scEsc(m.l)+'</small></div>'; }).join('');
  return '<div class="nfo-card"><div class="nfo-ch"><b>Money received</b><span>'+sub+' · total '+nfRupee(D.paySum)+'</span></div><div class="nfbd-chart">'+(a||'<div class="nfbd-empty">No payments in this period.</div>')+'</div></div>'
    +'<div class="nfo-card"><div class="nfo-ch"><b>New registrations</b><span><i class="nfb-k dr"></i> HealSol <i class="nfb-k dm"></i> self-registered</span></div><div class="nfbd-chart">'+(r||'<div class="nfbd-empty">No registrations in this period.</div>')+'</div></div>';
}
function nfBizTab(t,scroll){ _nfBd.tab=t; _nfBd.q=''; nfBizList(); if(scroll){ var el=document.getElementById('nfbd-tabs'); try{ el&&el.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} } }
function nfBizStatusTag(s){ return '<span class="nfbd-tag '+(s==='Paid'?'g':s==='Trial'?'a':'v')+'">'+scEsc(s)+'</span>'; }
function nfBizList(){
  var D=_nfBd._D, tabs=document.getElementById('nfbd-tabs'), box=document.getElementById('nfbd-list'); if(!D||!tabs||!box) return;
  var S=D.S, J=function(x){ return scJs(x); };
  var fac=function(name,code){ return '<b>'+scEsc(name)+'</b>'+nfProBadge((scMasterFacilities||{})[code])+'<small>'+scEsc(code)+'</small>'; };
  var who=function(n,m){ return scEsc(n||'—')+(m?'<small>'+scEsc(m)+'</small>':''); };
  var T={
    follow:{l:'Follow-up',rows:D.follow,head:['Facility','District','Status','CHO','Why','Expected',''],go:1,cell:function(r){ return [fac(r.name,r.code),scEsc(r.district),nfBizStatusTag(r.status),who(r.choName,r.choMobile),scEsc(r.followUp),r.expected!==''?nfRupee(r.expected):'',r.choMobile?nfWaBtn('nfWaSend(\''+(r._ti&&r._ti.ended?'due':r._idle?'idle':'hello')+'\',\''+scJs(r.code)+'\','+(r._idle?'{idle:'+(Number(r.idleDays)||0)+'}':'null')+')','','sm ic'):'']; },txt:function(r){ return [r.name,r.code,r.district,r.choName,r.choMobile,r.followUp].join(' '); }},
    due:{l:'Payment due',rows:S.due,head:['Facility','District','Trial ended','Expected','Contact',''],go:1,cell:function(x){ return [fac(x.name,x.code),scEsc(x.district),x.days===0?'today':x.days+' day'+(x.days===1?'':'s')+' ago',x.price?nfRupee(x.price):'—',scEsc(x.contact||''),nfWaBtn('nfWaSend(\'due\',\''+scJs(x.code)+'\')',' Remind','sm')]; },txt:function(x){ return [x.name,x.code,x.district,x.contact].join(' '); }},
    pays:{l:'Payments',rows:D.pays.slice().reverse(),head:['Receipt','Paid on','Facility','Package','Total','Paid by','Reference'],go:1,cell:function(x){ return [scEsc(x.receiptNo),x.date?scEsc(scFmtDate(x.date)):'',fac(x.name,x.code),scEsc(x.pkg),'<b>'+nfMoney(x.total)+'</b>'+(x.gst!==''?'<small>incl. GST '+nfMoney(x.gst)+'</small>':''),scEsc(x.method||x.how),'<small>'+scEsc(x.ref)+'</small>']; },txt:function(x){ return [x.receiptNo,x.name,x.code,x.pkg,x.method,x.ref,x.district].join(' '); }},
    regs:{l:'Registrations',rows:D.regs.slice().sort(function(a,b){ return String(b.enrolled).localeCompare(String(a.enrolled)); }),head:['Facility','District','Registered','How','Status','CHO'],go:1,cell:function(r){ return [fac(r.name,r.code),scEsc(r.district),r.enrolled?scEsc(scFmtDate(r.enrolled)):'—',r.demo==='Yes'?'Self-registered':'HealSol',nfBizStatusTag(r.status),who(r.choName,r.choMobile)]; },txt:function(r){ return [r.name,r.code,r.district,r.choName,r.choMobile].join(' '); }},
    idle:{l:'Not moving',rows:D.idle,head:['Facility','District','Programme day','Last activity','Days idle','CHO',''],go:1,cell:function(r){ return [fac(r.name,r.code),scEsc(r.district),scEsc(String(r.day)),r.lastActivity?scEsc(scFmtDate(r.lastActivity)):'Never',r.idleDays===''?'—':r.idleDays,who(r.choName,r.choMobile),r.choMobile?nfWaBtn('nfWaSend(\'idle\',\''+scJs(r.code)+'\',{idle:'+(Number(r.idleDays)||0)+'})',' Nudge','sm'):'']; },txt:function(r){ return [r.name,r.code,r.district,r.choName,r.choMobile].join(' '); }},
    dist:{l:'Districts',rows:D.dist,head:['District','SCs','A / B','Paid','Trial','Contract','Avg readiness','New in period','Received in period'],cell:function(x){ return ['<b>'+scEsc(x.name)+'</b>',x.n,x.a+' / '+x.b,x.paid,x.trial,x.contract,x.avg!==''?'<b style="color:'+scPctText(x.avg)+'">'+x.avg+'%</b>':'—',x.newN,x.amt?nfRupee(x.amt):'—']; },txt:function(x){ return x.name; }},
    enq:{l:'Enquiries',rows:D.enq,head:['Submitted','Organisation','Contact','District','Facilities','Status',''],cell:function(x){ return [x.submittedAt?scEsc(scFmtDate(x.submittedAt)):'',scEsc(x.orgName||'')+(x.message?'<small>'+scEsc(String(x.message).slice(0,90))+'</small>':''),who(x.contactName,[x.mobile,x.email].filter(Boolean).join(' · ')),scEsc([x.district,x.state].filter(Boolean).join(', ')),scEsc(x.facilityCount||''),scEsc(x.status||'new'),x.mobile?nfWaBtn('nfWaLead(\''+scJs(x._k)+'\')',' Reply','sm'):'']; },txt:function(x){ return [x.orgName,x.contactName,x.mobile,x.email,x.district,x.state,x.message].join(' '); }}
  };
  var t=T[_nfBd.tab]?_nfBd.tab:'follow', C=T[t], q=String(_nfBd.q||'').toLowerCase().trim();
  tabs.innerHTML=Object.keys(T).map(function(k){ return '<button type="button" class="nfbd-tab'+(k===t?' on':'')+'" onclick="nfBizTab(\''+k+'\')">'+T[k].l+'<em>'+T[k].rows.length+'</em></button>'; }).join('')
    +'<label class="nfbd-q"><i class="ti ti-search"></i><input id="nfbd-q" placeholder="Search this list…" value="'+scEsc(_nfBd.q||'')+'" oninput="_nfBd.q=this.value;nfBizListBody()"></label>';
  nfBizListBody(T);
}
function nfBizListBody(T0){
  if(!T0){ var pos=null, el=document.getElementById('nfbd-q'); if(el) pos=el.selectionStart; nfBizList(); el=document.getElementById('nfbd-q'); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(e){} } return; }
  var box=document.getElementById('nfbd-list'), C=T0[_nfBd.tab]||T0.follow, q=String(_nfBd.q||'').toLowerCase().trim();
  var rows=q?C.rows.filter(function(r){ return C.txt(r).toLowerCase().indexOf(q)>=0; }):C.rows, LIM=100;
  if(!rows.length){ box.innerHTML='<div class="nfbd-empty">'+(q?'Nothing matches “'+scEsc(_nfBd.q)+'”.':'Nothing here for this period.')+'</div>'; return; }
  box.innerHTML='<div class="nfo-tw"><table class="nfo-t"><thead><tr>'+C.head.map(function(x){ return '<th>'+scEsc(x)+'</th>'; }).join('')+'</tr></thead><tbody>'
    +rows.slice(0,LIM).map(function(r){ var code=r.code; return '<tr'+(C.go&&code&&(scMasterFacilities||{})[code]?' class="go" onclick="scDrillIn(\''+scJs(code)+'\')"':'')+'>'+C.cell(r).map(function(v){ return '<td>'+v+'</td>'; }).join('')+'</tr>'; }).join('')
    +'</tbody></table></div>'+(rows.length>LIM?'<div class="nfbd-more">Showing '+LIM+' of '+rows.length+' — download the report for the full list.</div>':'');
}
// ── preview before download ──
async function nfBizPreview(){
  await nfBizLoad(); _nfBd.pvSheet=_nfBd.pvSheet||0; nfBizPvRender();
}
function nfBizPvRender(){
  var ov=document.getElementById('nf-bizpv');
  if(!ov){ ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-bizpv'; ov.onclick=function(e){ if(e.target===ov) nfBizPvClose(); }; document.body.appendChild(ov); }
  var D=nfBizData(), SH=nfBizSheets(D), i=Math.min(_nfBd.pvSheet||0,SH.length-1), s=SH[i]; _nfBd._pvD=D;
  var pdfSheets={'Summary':1,'Monthly':1,'Follow-up':1,'Payments':1,'Districts':1};
  var tabs=SH.map(function(x,k){ var n=x.name==='Summary'?'':(x.rows.length-1); return '<button type="button" class="nfbd-tab'+(k===i?' on':'')+'" onclick="_nfBd.pvSheet='+k+';nfBizPvRender()">'+scEsc(x.name)+(n!==''?'<em>'+n+'</em>':'')+'</button>'; }).join('');
  var LIM=12, tbl;
  if(s.name==='Summary'){
    tbl='<table class="nf-bizpv-t"><tbody>'+s.rows.slice(4).map(function(r){ if(!r.length) return ''; if(r[1]==='Value') return '<tr><td class="sec" colspan="3">'+scEsc(r[0])+'</td></tr>';
      return '<tr><td>'+scEsc(r[0])+'</td><td><b>'+scEsc(/\(₹\)$/.test(r[0])?nfMoney(r[1]):r[1])+'</b></td><td>'+scEsc(r[2]||'')+'</td></tr>'; }).join('')+'</tbody></table>';
  } else {
    var body=s.rows.slice(1);
    tbl=body.length?'<table class="nf-bizpv-t"><thead><tr>'+s.rows[0].map(function(x){ return '<th>'+scEsc(x)+'</th>'; }).join('')+'</tr></thead><tbody>'
      +body.slice(0,LIM).map(function(r){ return '<tr>'+r.map(function(v){ return '<td>'+scEsc(v==null?'':String(v))+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table>'
      :'<div class="nfbd-empty">No rows for this period.</div>';
    if(body.length>LIM) tbl+='<div class="nfbd-more" style="padding:8px 10px;">Preview shows the first '+LIM+' of '+body.length+' rows — the file has them all.</div>';
  }
  ov.innerHTML='<div class="scx-box nf-bizpv-box" role="dialog" aria-label="Business report preview">'
    +'<div class="nf-bizpv-h"><b>Preview — business report<small>'+scEsc(D.rg.label)+' · '+scEsc(D.rg.text)+' · position as of '+scEsc(scFmtDate(D.today))+'</small></b><button type="button" class="nf-bizpv-x" onclick="nfBizPvClose()" aria-label="Close"><i class="ti ti-x"></i></button></div>'
    +'<div class="nf-bizpv-b">'+nfBizRangeHTML('pv')+'<div class="nfbd-tabs">'+tabs+'</div><div class="nf-bizpv-tw">'+tbl+'</div>'
    +'<div class="nfbd-more">'+(pdfSheets[s.name]?'This sheet is in both the Excel file and the PDF.':'This sheet is in the Excel file only.')+'</div></div>'
    +'<div class="nf-bizpv-f"><small>Excel: all '+SH.length+' sheets. PDF: Summary, Monthly, Follow-up, Payments and Districts — for meetings.</small>'
    +'<button type="button" class="s" onclick="nfBizPvClose()">Cancel</button>'
    +'<button type="button" class="p" id="nf-bizpv-pdf" onclick="nfBizDownload(\'pdf\',this)"><i class="ti ti-file-text"></i> Download PDF</button>'
    +'<button type="button" class="p" id="nf-bizpv-xlsx" onclick="nfBizDownload(\'xlsx\',this)"><i class="ti ti-download"></i> Download Excel</button></div></div>';
}
function nfBizPvClose(){ var ov=document.getElementById('nf-bizpv'); if(ov) ov.remove(); }
async function nfBizDownload(kind,btn){
  var D=_nfBd._pvD||nfBizData(), old=btn?btn.innerHTML:'';
  if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
  try{ nfDoneToast(kind==='pdf'?await nfBizPdf(D):await nfBizExcel(D)); }
  catch(e){ console.warn('[SC] business report',e); showToast(e&&e.message==='load'?'Could not load the '+(kind==='pdf'?'PDF':'Excel')+' tool — check the internet connection and try again.':'Could not prepare the report.','err'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } }
}
// Reports page card → preview; kept under the old name
function nfBusinessReport(){ return nfBizPreview(); }
function nfEnsureBizReportCard(){
  if(appMode!=='sc-admin') return;
  var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nf-bizrep')) return;
  var c=document.createElement('div'); c.id='nf-bizrep'; c.dataset.nfv='reports'; c.className='nf-bizrep';
  c.innerHTML='<div class="nf-bizrep-h"><i class="ti ti-briefcase"></i> Business report <span>HealSol only</span></div>'
    +'<div class="nf-bizrep-p">Choose the dates, preview, then download as Excel (all sheets: Summary, Monthly, Facilities, Follow-up, Self-registrations, Payments, Not moving, Districts, Enquiries) or as a PDF for meetings. The same figures are on the Business tab.</div>'
    +'<button type="button" class="nf-bizrep-btn" id="nf-bizrep-btn" onclick="nfBusinessReport()"><i class="ti ti-eye"></i> Preview &amp; download</button> '
    +'<button type="button" class="nf-bizrep-btn" style="background:#F1F5F4;color:var(--t1,#0F172A);" onclick="nfAdminView(\'business\')"><i class="ti ti-briefcase"></i> Open Business tab</button>';
  var bar=main.querySelector('.sc-report-bar'); if(bar&&bar.parentNode===main) main.insertBefore(c,bar); else main.appendChild(c);
}
(function(){
  var oItems=nfAdminItems;
  nfAdminItems=function(){ var L=oItems.apply(this,arguments); if(nfAdminRole()!=='admin') return L;
    var i=L.findIndex(function(it){ return it.v==='overview'; }); L.splice(i+1,0,{v:'business',l:'Business',icon:'ti-briefcase',onclick:"nfAdminView('business')"}); return L; };
  var oApply=nfAdminApply;
  nfAdminApply=function(){ document.body.classList.toggle('nfv-business',_nfOv.view==='business'); try{ nfEnsureBizReportCard(); }catch(e){} return oApply.apply(this,arguments); };
  var oView=nfAdminView;
  nfAdminView=function(v){ var r=oView.apply(this,arguments); if(v==='business') nfRenderBizDash(true); return r; };
  var oOv=nfRenderOverview;
  nfRenderOverview=function(){ var r=oOv.apply(this,arguments); try{ if(appMode==='sc-admin'&&_nfOv.view==='business') nfRenderBizDash(); }catch(e){} return r; };
})();
