// ══════════════════════════════════════════════════════════════
// BUSINESS TAB + REPORT (HealSol only) — business numbers only (redesign agreed 23 Oct 2026, canvas "Business — business-only redesign")
//  Money (revenue vs the previous period, to collect, pipeline, average per paying facility) · Customers today
//  (Paid · Contract · On trial · Trial ended) · Growth (new facilities, trial → paid, enquiries, catch-ups sold) · charts ·
//  breakdown by type / district / package · lists (money to collect, payments, registrations, enquiries).
//  Facility-type tabs (All · SC · UPHC · PHC · CHC) and the dates filter everything; the Excel / PDF report follows them.
//  Cards saved and "not moving" live on Today (no repetition). One data model feeds the page, the preview, Excel and PDF.
// ══════════════════════════════════════════════════════════════
var _nfBd={preset:'fy',from:'',to:'',type:'',tab:'collect',brk:'type',q:'',pays:null,paysAt:0,pvSheet:0,contacts:false};
var NF_BIZ_TYPES=['sc','uphc','phc','chc'];
async function nfBizLoad(force){
  if(appMode!=='sc-admin') return;
  if(force||!_nfBiz.at||Date.now()-_nfBiz.at>60000){ try{ _nfBiz.leads=await fbGet('shared/sc_leads')||{}; _nfBiz.pricing=await fbGet('shared/sc_pricing_config')||null; _nfBiz.at=Date.now(); }catch(e){} }
  if(force||!_nfBd.pays||Date.now()-_nfBd.paysAt>60000){ try{ _nfBd.pays=await fbGet('sc_payments')||{}; _nfBd.paysAt=Date.now(); }catch(e){ _nfBd.pays=_nfBd.pays||{}; } }
}
function nfIsoLocal(iso){ if(!iso) return ''; iso=String(iso); if(iso.length<=10) return iso.slice(0,10); var d=new Date(iso); if(isNaN(d)) return iso.slice(0,10);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nfBizAddDays(iso,n){ var p=String(iso).split('-'), d=new Date(+p[0],+p[1]-1,+p[2]+n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
function nfBizDayDiff(a,b){ var pa=String(a).split('-'), pb=String(b).split('-'); return Math.round((new Date(+pb[0],+pb[1]-1,+pb[2])-new Date(+pa[0],+pa[1]-1,+pa[2]))/864e5); }
function nfBizDmy(iso){ var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso||'')); return m?m[3]+'/'+m[2]+'/'+m[1]:''; }
function nfBizFromDmy(s){ var m=/^\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\s*$/.exec(String(s||'')); if(!m) return ''; var d=+m[1], mo=+m[2], y=+m[3]; if(mo<1||mo>12||d<1||d>31) return ''; return y+'-'+String(mo).padStart(2,'0')+'-'+String(d).padStart(2,'0'); }
function nfBizRange(){
  var t=scTodayStr(), y=+t.slice(0,4), m=+t.slice(5,7), p=_nfBd.preset, pad=function(n){ return String(n).padStart(2,'0'); }, rg;
  if(p==='month') rg={from:y+'-'+pad(m)+'-01',to:t,label:'This month'};
  else if(p==='lastmonth'){ var ly=m===1?y-1:y, lm=m===1?12:m-1; rg={from:ly+'-'+pad(lm)+'-01',to:ly+'-'+pad(lm)+'-'+pad(new Date(ly,lm,0).getDate()),label:'Last month'}; }
  else if(p==='fy'){ var fy=m>=4?y:y-1; rg={from:fy+'-04-01',to:t,label:'Financial year '+fy+'-'+pad((fy+1)%100)}; }
  else if(p==='all') rg={from:'',to:'',label:'All time'};
  else { var f=_nfBd.from||'', to=_nfBd.to||''; if(f&&to&&f>to){ var x=f; f=to; to=x; } rg={from:f,to:to,label:'Selected dates'}; }
  rg.text=rg.from||rg.to?(rg.from?nfDateTxt(rg.from):'Start')+' – '+nfDateTxt(rg.to||t):'everything so far';
  return rg;
}
function nfR2(n){ return Math.round((Number(n)||0)*100)/100; }
// the price of a facility, before GST (Settings → Pricing): Sub-Centre / UPHC / PHC by package; CHC = base (FRU / Non-FRU) + each optional department it has
function nfBizPriceMap(){ var P={}; (((_nfBiz.pricing||{}).items)||[]).forEach(function(it){ if(it&&it.id&&it.price!=null&&it.price!=='') P[it.id]=Number(it.price); }); return P; }
function nfFacPrice(f,P){
  P=P||nfBizPriceMap(); f=f||{}; var t=typeof nfTypeOf==='function'?nfTypeOf(f):'sc';
  if(t==='chc'){ var base=P['nqas_chc_'+(f.chcKind==='nonfru'?'nonfru':'fru')]; if(base==null) return null; var add=0, C=NF_LEVELS.chc||{};
    (C.departments||[]).filter(function(d){ return d.optional&&!(((f.depts||{})[d.id]||{}).off); }).forEach(function(d){ var v=P['chc_dept_'+d.id]; if(v!=null) add+=v; });
    return base+add; }
  var v=P[f.progId]; return v==null?null:v;
}
function nfBizWithGst(n){ return n==null?null:Math.round(n*(1+(typeof NF_GST!=='undefined'?NF_GST:0.18))); }
function nfBizTypeOf(f){ return typeof nfTypeOf==='function'?nfTypeOf(f||{}):'sc'; }
function nfBizTypeLbl(t){ return t==='sc'?'Sub-Centre':((NF_LEVELS[t]||{}).short||String(t||'').toUpperCase()); }
function nfBizTypeShort(t){ return t==='sc'?'SC':((NF_LEVELS[t]||{}).short||String(t||'').toUpperCase()); }
function nfBizPkgName(f){ var t=nfBizTypeOf(f); if(t==='chc') return 'CHC '+(f.chcKind==='nonfru'?'(Non-FRU)':'(FRU)'); var p=null; try{ p=getProg(f.progId); }catch(e){}
  if(t==='sc') return 'Package '+(String(f.progId||'').indexOf('12B')>=0?'12B':'12A'); return (p&&p.name)||((NF_LEVELS[t]||{}).short||t.toUpperCase()); }
function nfBizInCharge(f){ var t=nfBizTypeOf(f), LV=NF_LEVELS[t]||{}, ic=LV.inCharge||'CHO', st=f.staff||{}, m=Object.keys(st).find(function(k){ return st[k]&&!st[k].disabled&&(st[k].role||ic)===ic; });
  return {label:LV.inChargeLabel||ic,mob:m||f.contactMobile||'',name:m?(st[m].name||''):(f.choName||'')}; }
function nfBizData(){
  var rg=nfBizRange(), today=scTodayStr(), F=scMasterFacilities||{}, L=_nfBiz.leads||{}, P=nfBizPriceMap(), T=_nfBd.type||'';
  var inR=function(iso,allowEmpty){ var d=nfIsoLocal(iso); if(!d) return !!allowEmpty&&!rg.from&&!rg.to; return (!rg.from||d>=rg.from)&&(!rg.to||d<=rg.to); };
  // every facility (business view), then the chosen type
  var all=Object.keys(F).filter(function(c){ return F[c]&&!F[c].migratedTo; }).sort().map(function(c){ var f=F[c], st=f.subscriptionStatus||'contract', t=nfBizTypeOf(f), ti=nfTrialInfo(f), price=nfFacPrice(f,P), ic=nfBizInCharge(f);
    var status=st==='paid'?'paid':st==='trial'?(ti&&ti.ended?'ended':'trial'):'contract';
    return {code:c,f:f,name:f.name||c,type:t,district:(f.district||'').trim()||'—',state:f.state||'',pkg:nfBizPkgName(f),status:status,self:!!(f.isDemo||f.convertedFromDemoCode),
      enrolled:nfIsoLocal(f.enrolledAt||f.trialStartDate||''),trialStart:nfIsoLocal(f.trialStartDate||((f.isDemo||f.convertedFromDemoCode||st==='trial')?f.startDate:'')||''),trialEnds:ti?ti.endISO:'',trialOver:ti?ti.daysOver:null,
      price:price,priceGst:nfBizWithGst(price),icLabel:ic.label,icName:ic.name,icMob:ic.mob}; });
  var R=T?all.filter(function(r){ return r.type===T; }):all, byCode={}; all.forEach(function(r){ byCode[r.code]=r; });
  // payments: receipts, plus payments recorded before receipts existed
  var pays=[], withR={}, PS=_nfBd.pays||{};
  Object.keys(PS).forEach(function(c){ Object.values(PS[c]||{}).forEach(function(x){ if(!x) return; var code=x.code||c; withR[code]=1; var r=byCode[code];
    pays.push({receiptNo:x.receiptNo||'',date:nfIsoLocal(x.paidAt),code:code,name:x.facilityName||(r&&r.name)||code,district:x.district||(r&&r.district)||'',type:r?r.type:nfBizTypeOf(F[code]),
      pkg:x.packageLabel||x.package||'',catchup:/catch/i.test(String(x.package||'')+' '+String(x.packageLabel||'')),base:x.base!=null?Number(x.base):'',gst:x.gst!=null?Number(x.gst):'',total:Number(x.total)||0,method:x.method||'',ref:x.paymentId||x.reference||'',how:x.source==='razorpay'?'In-app (Razorpay)':'Recorded by HealSol'}); }); });
  all.forEach(function(r){ var lp=r.f.lastPayment; if(lp&&lp.amount&&!withR[r.code]) pays.push({receiptNo:'(before receipts)',date:nfIsoLocal(lp.at),code:r.code,name:r.name,district:r.district,type:r.type,pkg:r.pkg,catchup:false,base:'',gst:'',total:Number(lp.amount)||0,method:'',ref:lp.id||(lp.confirmedBy?'Confirmed by HealSol':''),how:''}); });
  pays.sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
  var payT=T?pays.filter(function(p){ return p.type===T; }):pays, PP=payT.filter(function(p){ return inR(p.date,true); });
  var sum=function(a,k){ return nfR2(a.reduce(function(s,x){ return s+(Number(x[k])||0); },0)); };
  // previous period of the same length (not for "All time")
  var prev=null; if(rg.from){ var len=nfBizDayDiff(rg.from,rg.to||today)+1, pTo=nfBizAddDays(rg.from,-1), pFrom=nfBizAddDays(rg.from,-len);
    var pp=payT.filter(function(p){ return p.date&&p.date>=pFrom&&p.date<=pTo; }); prev={from:pFrom,to:pTo,days:len,sum:sum(pp,'total')}; }
  var paySum=sum(PP,'total'), payers={}; PP.forEach(function(p){ if(!p.catchup) payers[p.code]=1; });
  // customers today
  var cust={paid:0,contract:0,trial:0,ended:0}; R.forEach(function(r){ cust[r.status]++; });
  var ended=R.filter(function(r){ return r.status==='ended'; }), running=R.filter(function(r){ return r.status==='trial'; });
  var val=function(a){ var s=0, miss=0; a.forEach(function(r){ if(r.priceGst==null) miss++; else s+=r.priceGst; }); return {sum:s,miss:miss,n:a.length}; };
  var collect=val(ended), pipe=val(running);
  var leads=Object.keys(L).map(function(k){ return Object.assign({_k:k},L[k]||{}); });
  var open=leads.filter(function(x){ return x.status!=='closed'; }), openFac=open.reduce(function(s,x){ return s+(parseInt(x.facilityCount,10)||0); },0);
  // growth
  var regs=R.filter(function(r){ return inR(r.enrolled,true); }), selfR=regs.filter(function(r){ return r.self; });
  R.forEach(function(r){ r.trialEndAny=r.trialStart?nfBizAddDays(r.trialStart,7):''; });
  var trialsEnded=R.filter(function(r){ return r.trialEndAny&&r.trialEndAny<=today&&inR(r.trialEndAny)&&r.status!=='trial'&&r.status!=='contract'; });
  var converted=trialsEnded.filter(function(r){ return r.status==='paid'; }), dtp=[];
  converted.forEach(function(r){ var fp=pays.filter(function(p){ return p.code===r.code&&!p.catchup&&p.date; })[0]; if(fp&&r.trialStart){ var d=nfBizDayDiff(r.trialStart,fp.date); if(d>=0) dtp.push(d); } });
  var enq=leads.filter(function(x){ return inR(x.submittedAt,true); }).sort(function(a,b){ return String(b.submittedAt||'').localeCompare(String(a.submittedAt||'')); });
  var cu=PP.filter(function(p){ return p.catchup; });
  // months across the period (max 24)
  var mFrom=rg.from, mTo=rg.to||today;
  if(!mFrom) mFrom=[].concat(regs.map(function(r){ return r.enrolled; }),PP.map(function(p){ return p.date; })).filter(Boolean).sort()[0]||today;
  var months=[], d0=new Date(+mFrom.slice(0,4),+mFrom.slice(5,7)-1,1), end=new Date(+mTo.slice(0,4),+mTo.slice(5,7)-1,1);
  while(d0<=end&&months.length<120){ months.push({k:d0.getFullYear()+'-'+String(d0.getMonth()+1).padStart(2,'0'),l:NF_MON[d0.getMonth()]+' '+String(d0.getFullYear()).slice(2),regH:0,regS:0,payN:0,amt:0}); d0.setMonth(d0.getMonth()+1); }
  if(months.length>24) months=months.slice(-24);
  var mi={}; months.forEach(function(m){ mi[m.k]=m; });
  regs.forEach(function(r){ var M=mi[String(r.enrolled).slice(0,7)]; if(M) M[r.self?'regS':'regH']++; });
  PP.forEach(function(p){ var M=mi[String(p.date).slice(0,7)]; if(M){ M.payN++; M.amt=nfR2(M.amt+p.total); } });
  // breakdown rows
  var brk=function(rows,keyOf,payKey){ var G={}, order=[]; rows.forEach(function(r){ var k=keyOf(r); if(!G[k]){ G[k]={name:k,n:0,paid:0,contract:0,trial:0,ended:0,rev:0,collect:0}; order.push(k); } var g=G[k]; g.n++; g[r.status]++; if(r.status==='ended'&&r.priceGst!=null) g.collect+=r.priceGst; });
    PP.forEach(function(p){ var r=byCode[p.code], k=r?keyOf(r):null; if(k!=null&&G[k]) G[k].rev=nfR2(G[k].rev+p.total); });
    return order.map(function(k){ return G[k]; }); };
  var byType=brk(all,function(r){ return nfBizTypeLbl(r.type); });
  byType=NF_BIZ_TYPES.map(function(t){ return byType.find(function(x){ return x.name===nfBizTypeLbl(t); }); }).filter(Boolean);
  if(T){ var PPall=pays.filter(function(p){ return inR(p.date,true); }); byType.forEach(function(g){ g.rev=0; }); PPall.forEach(function(p){ var r=byCode[p.code]; if(!r) return; var g=byType.find(function(x){ return x.name===nfBizTypeLbl(r.type); }); if(g) g.rev=nfR2(g.rev+p.total); }); }
  var byDist=brk(R,function(r){ return r.district; }).sort(function(a,b){ return a.name.localeCompare(b.name); });
  var byPkg=brk(R,function(r){ return r.pkg; }).sort(function(a,b){ return a.name.localeCompare(b.name); });
  // lists
  var collectList=R.filter(function(r){ return r.status==='ended'||(r.status==='trial'&&r.trialOver!=null&&r.trialOver>=-7); })
    .sort(function(a,b){ return (b.trialOver||0)-(a.trialOver||0); });
  var types={}; all.forEach(function(r){ types[r.type]=(types[r.type]||0)+1; });
  return {rg:rg,today:today,type:T,types:types,all:all,R:R,pays:PP,payAll:payT,paySum:paySum,payBase:sum(PP,'base'),payGst:sum(PP,'gst'),prev:prev,
    change:prev&&prev.sum?Math.round((paySum-prev.sum)/prev.sum*100):null,avg:Object.keys(payers).length?Math.round(sum(PP.filter(function(p){ return !p.catchup; }),'total')/Object.keys(payers).length):null,payers:Object.keys(payers).length,
    cust:cust,collect:collect,pipe:pipe,open:open,openFac:openFac,regs:regs,selfR:selfR,trialsEnded:trialsEnded,converted:converted,conv:trialsEnded.length?Math.round(converted.length/trialsEnded.length*100):null,
    daysToPay:dtp.length?Math.round(dtp.reduce(function(s,x){ return s+x; },0)/dtp.length):null,enq:enq,enqOpen:enq.filter(function(x){ return x.status!=='closed'; }).length,enqFac:enq.reduce(function(s,x){ return s+(parseInt(x.facilityCount,10)||0); },0),
    cu:cu,cuSum:sum(cu,'total'),months:months,byType:byType,byDist:byDist,byPkg:byPkg,collectList:collectList};
}
// ── the report's sheets (Excel = all; PDF = Summary, Monthly, Money to collect, Payments, By type, By district) ──
function nfBizStatusTxt(s){ return {paid:'Paid',contract:'Contract',trial:'On trial',ended:'Trial ended (not paid)'}[s]||s; }
function nfBizWhy(r){ if(r.status==='ended') return 'Trial ended '+(r.trialOver===0?'today':r.trialOver+' day'+(r.trialOver===1?'':'s')+' ago')+' — not paid'; if(r.status==='trial') return r.trialOver>=0?'Trial ends today':'Trial ends in '+(-r.trialOver)+' day'+(r.trialOver===-1?'':'s'); return ''; }
function nfBizSheets(D){
  var out=[], C=!!_nfBd.contacts, add=function(name,rows,widths){ out.push({name:name,rows:rows,widths:widths}); };
  var tl=D.type?nfBizTypeLbl(D.type)+'s only':'All facility types';
  add('Summary',[
    ['NQAS | FAST — HealSol business report'],['Period',D.rg.label+' ('+D.rg.text+')'],['Facilities',tl],['As of',nfDateTxt(D.today)],[],
    ['Money','Value','Detail'],
    ['Revenue received (₹)',D.paySum,D.pays.length+' payment(s)'+(D.payBase?' · price '+nfMoney(D.payBase)+' + GST '+nfMoney(D.payGst):'')+(D.change!=null?' · '+(D.change>=0?'+':'')+D.change+'% vs previous period':'')],
    ['To collect (₹)',D.collect.sum,D.collect.n+' trial(s) ended, not paid'+(D.collect.miss?' · '+D.collect.miss+' without a price':'')],
    ['Pipeline (₹)',D.pipe.sum,D.pipe.n+' on trial · '+D.open.length+' open enquiries ('+D.openFac+' facilities)'],
    ['Average per paying facility (₹)',D.avg==null?'':D.avg,D.payers+' facilities paid in the period'],
    [],['Customers today','Value',''],
    ['Paid',D.cust.paid,''],['Contract (government / district)',D.cust.contract,''],['On trial',D.cust.trial,''],['Trial ended, not paid',D.cust.ended,''],
    [],['Growth','Value','Detail'],
    ['New facilities',D.regs.length,'HealSol '+(D.regs.length-D.selfR.length)+' · self-registered '+D.selfR.length],
    ['Trial → paid (%)',D.conv==null?'':D.conv,D.converted.length+' of '+D.trialsEnded.length+' trials that ended in the period'+(D.daysToPay!=null?' · '+D.daysToPay+' days to pay on average':'')],
    ['Enquiries',D.enq.length,D.enqOpen+' still open · '+D.enqFac+' facilities asked about'],
    ['Catch-ups sold',D.cu.length,D.cuSum?nfMoney(D.cuSum):'']
  ],[34,16,60]);
  var tot=D.months.reduce(function(t,m){ t.h+=m.regH; t.s+=m.regS; t.n+=m.payN; t.a=nfR2(t.a+m.amt); return t; },{h:0,s:0,n:0,a:0});
  add('Monthly',[['Month','New (HealSol)','New (self-registered)','New total','Payments','Received ₹']]
    .concat(D.months.map(function(m){ return [m.l,m.regH,m.regS,m.regH+m.regS,m.payN,m.amt]; })).concat([['Total',tot.h,tot.s,tot.h+tot.s,tot.n,tot.a]]),[10,13,18,10,10,12]);
  add('Money to collect',[['Facility ID','Name','Type','District','Package','Why','Amount ₹ (incl. GST)','In-charge'].concat(C?['Mobile']:[])].concat(D.collectList.map(function(r){ return [r.code,r.name,nfBizTypeShort(r.type),r.district,r.pkg,nfBizWhy(r),r.priceGst==null?'no price set':r.priceGst,r.icName].concat(C?[r.icMob]:[]); })),[14,24,6,14,18,34,16,20,13]);
  add('Payments',[['Receipt no','Paid on','Facility ID','Name','Type','District','Package','Price ₹','GST ₹','Total ₹','Paid by','Payment ID / reference','How']].concat(D.pays.map(function(x){ return [x.receiptNo,x.date,x.code,x.name,nfBizTypeShort(x.type),x.district,x.pkg,x.base,x.gst,x.total,x.method,x.ref,x.how]; })),[18,11,14,24,6,14,22,10,9,10,13,24,18]);
  add('Registrations',[['Facility ID','Name','Type','District','State','Registered','How','Status','Package','Price ₹ (incl. GST)','In-charge'].concat(C?['Mobile']:[])].concat(D.regs.map(function(r){ return [r.code,r.name,nfBizTypeShort(r.type),r.district,r.state,r.enrolled,r.self?'Self-registered':'HealSol',nfBizStatusTxt(r.status),r.pkg,r.priceGst==null?'':r.priceGst,r.icName].concat(C?[r.icMob]:[]); })),[14,24,6,14,12,11,14,18,18,14,20,13]);
  add('Enquiries',[['Submitted','Organisation','Contact','Designation','District','State','Facilities','Packages','Status'].concat(C?['Mobile','Email']:[]).concat(['Message'])].concat(D.enq.map(function(x){ return [String(x.submittedAt||'').slice(0,10),x.orgName||'',x.contactName||'',x.designation||'',x.district||'',x.state||'',x.facilityCount||'',x.packages||'',x.status||'new'].concat(C?[x.mobile||'',x.email||'']:[]).concat([x.message||'']); })),[11,24,18,16,14,12,9,16,9,13,22,40]);
  var bh=function(l){ return [[l,'Facilities','Paid','Contract','On trial','Trial ended','Revenue in period ₹','To collect ₹']]; }, br=function(g){ return [g.name,g.n,g.paid,g.contract,g.trial,g.ended,g.rev,g.collect]; };
  add('By type',bh('Type').concat(D.byType.map(br)),[14,10,8,9,9,11,18,14]);
  add('By district',bh('District').concat(D.byDist.map(br)),[18,10,8,9,9,11,18,14]);
  add('By package',bh('Package').concat(D.byPkg.map(br)),[22,10,8,9,9,11,18,14]);
  add('Facilities',[['Facility ID','Name','Type','District','State','Package','Status','Self-registered','Registered','Trial ends','Price ₹ (before GST)','In-charge'].concat(C?['Mobile']:[])].concat(D.R.map(function(r){ return [r.code,r.name,nfBizTypeShort(r.type),r.district,r.state,r.pkg,nfBizStatusTxt(r.status),r.self?'Yes':'No',r.enrolled,r.trialEnds,r.price==null?'':r.price,r.icName].concat(C?[r.icMob]:[]); })),[14,24,6,14,12,18,18,8,11,11,14,20,13]);
  return out;
}
function nfBizFileName(D,ext){ return 'NQAS-FAST-business-report-'+(D.type?D.type+'-':'')+(D.rg.from||D.rg.to?(D.rg.from||'start')+'-to-'+(D.rg.to||D.today):'all-time-'+D.today)+'.'+ext; }
async function nfBizExcel(D){
  var X=await nfLoadXlsx(), wb=X.utils.book_new();
  nfBizSheets(D).forEach(function(s){ var ws=X.utils.aoa_to_sheet(s.rows); ws['!cols']=s.widths.map(function(w){ return {wch:w}; }); X.utils.book_append_sheet(wb,ws,s.name); });
  return nfSaveWb(X,wb,nfBizFileName(D,'xlsx'));
}
// ── PDF: landscape A4, logos and page numbers on every page ──
async function nfBizPdf(D){
  var J=await nfLoadPdf(), doc=nfPdfNew(J,'l'), F=doc._nfFont, M=function(n){ return nfPdfMoney(doc,n); }, T=function(s){ return nfPdfTxt(doc,s); }, C=!!_nfBd.contacts;
  var W=297, H=210, L=12, R=W-12, TEAL=[19,74,65], GREY=[79,94,89], INK=[31,45,41], LINE=[220,228,225], RED=[179,64,42], y=31;
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
  doc.setFont(F,'bold'); doc.setFontSize(18); doc.setTextColor.apply(doc,INK); doc.text('Business report',L,y+2);
  doc.setFont(F,'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc,GREY);
  doc.text(T('Period: '+D.rg.label+' ('+D.rg.text+')  ·  '+(D.type?nfBizTypeLbl(D.type)+'s only':'All facility types')+'  ·  Customers as of '+nfDateTxt(D.today)),L,y+8); y+=15;
  title('Money',D.rg.text);
  row([['Revenue received',M(D.paySum),(D.change!=null?(D.change>=0?'+':'')+D.change+'% vs previous period · ':'')+D.pays.length+' payments',TEAL],['To collect',M(D.collect.sum),D.collect.n+' trial(s) ended, not paid',RED],
    ['Pipeline',M(D.pipe.sum),D.pipe.n+' on trial · '+D.open.length+' open enquiries'],['Average per paying facility',D.avg==null?'—':M(D.avg),D.payers+' paid in the period']]);
  title('Customers today');
  row([['Paid',D.cust.paid,''],['Contract',D.cust.contract,'government / district'],['On trial',D.cust.trial,''],['Trial ended, not paid',D.cust.ended,'',RED]]);
  title('Growth',D.rg.text);
  row([['New facilities',D.regs.length,'HealSol '+(D.regs.length-D.selfR.length)+' · self '+D.selfR.length],['Trial → paid',D.conv==null?'—':D.conv+'%',D.converted.length+' of '+D.trialsEnded.length+(D.daysToPay!=null?' · '+D.daysToPay+' days to pay':'')],
    ['Enquiries',D.enq.length,D.enqOpen+' open · '+D.enqFac+' facilities'],['Catch-ups sold',D.cu.length,D.cuSum?M(D.cuSum):'']]);
  var ms=D.months.slice(-12);
  if(ms.length&&D.paySum){ title('Revenue by month',ms.length<D.months.length?'last 12 months of the period':'');
    var ch=34, cy=y+3, mx=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.amt; }))), gw=(R-L)/ms.length, bw=Math.min(16,gw*0.6);
    if(cy+ch+12>H-14){ doc.addPage(); y=31; cy=y+3; }
    doc.setDrawColor.apply(doc,LINE); doc.line(L,cy+ch,R,cy+ch);
    ms.forEach(function(m,i){ var h=m.amt/mx*ch, x=L+i*gw+(gw-bw)/2; if(h>0){ doc.setFillColor(30,107,94); doc.roundedRect(x,cy+ch-h,bw,h,1,1,'F'); }
      doc.setFont(F,'normal'); doc.setFontSize(6.5); doc.setTextColor.apply(doc,GREY); doc.text(m.l,x+bw/2,cy+ch+4,{align:'center'});
      if(m.amt){ doc.setTextColor.apply(doc,INK); doc.text(M(m.amt),x+bw/2,cy+ch-h-1.5,{align:'center'}); } });
    y=cy+ch+11; }
  title('Money to collect','today · '+D.collectList.length);
  table(['Facility','Type','District','Why','Amount (incl. GST)','In-charge'],D.collectList.map(function(r){ return [r.name+'\n'+r.code,nfBizTypeShort(r.type),r.district,nfBizWhy(r),r.priceGst==null?'no price set':M(r.priceGst),r.icName+(C&&r.icMob?'\n'+r.icMob:'')]; }),{0:{cellWidth:56},4:{halign:'right'}});
  title('Payments','in the period · '+D.pays.length);
  table(['Receipt','Paid on','Facility','Package','Price','GST','Total','Paid by','Reference'],D.pays.map(function(x){ return [x.receiptNo,x.date?nfDateTxt(x.date):'',x.name+'\n'+x.code,x.pkg,x.base!==''?M(x.base):'',x.gst!==''?M(x.gst):'',M(x.total),x.method||x.how,x.ref]; }),{4:{halign:'right'},5:{halign:'right'},6:{halign:'right',fontStyle:'bold'}});
  var bt=function(g){ return [g.name,g.n,g.paid,g.contract,g.trial,g.ended,M(g.rev),M(g.collect)]; }, bhd=function(l){ return [l,'Facilities','Paid','Contract','On trial','Trial ended','Revenue in period','To collect']; };
  title('By type'); table(bhd('Type'),D.byType.map(bt),{6:{halign:'right'},7:{halign:'right'}});
  title('By district'); table(bhd('District'),D.byDist.map(bt),{6:{halign:'right'},7:{halign:'right'}});
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
// ── filters: facility type tabs, period chips, Indian-order dates (page and preview share them) ──
function nfBizTypeTabsHTML(D,ctx){ var T=D.type||'', n=D.all.length;
  return '<div class="bz-types" role="tablist" aria-label="Facility type">'+[['','All',n]].concat(NF_BIZ_TYPES.filter(function(t){ return D.types[t]; }).map(function(t){ return [t,nfBizTypeLbl(t),D.types[t]]; }))
    .map(function(x){ return '<button type="button" role="tab" aria-selected="'+(T===x[0])+'" class="'+(T===x[0]?'on':'')+'" onclick="nfBizSetType(\''+x[0]+'\',\''+ctx+'\')">'+scEsc(x[1])+' <em>'+x[2]+'</em></button>'; }).join('')+'</div>'; }
function nfBizRangeHTML(ctx){
  var rg=nfBizRange(), p=_nfBd.preset;
  var chip=function(v,l){ return '<button type="button" class="bz-chip'+(p===v?' on':'')+'" onclick="nfBizSetPreset(\''+v+'\',\''+ctx+'\')">'+l+'</button>'; };
  return '<div class="bz-range">'+chip('month','This month')+chip('lastmonth','Last month')+chip('fy','This financial year')+chip('all','All time')
    +'<label>From <input type="text" inputmode="numeric" placeholder="dd/mm/yyyy" id="nfbd-from-'+ctx+'" value="'+nfBizDmy(rg.from)+'" onchange="nfBizSetDate(\'from\',this.value,\''+ctx+'\')"></label>'
    +'<label>To <input type="text" inputmode="numeric" placeholder="dd/mm/yyyy" id="nfbd-to-'+ctx+'" value="'+nfBizDmy(rg.to||(rg.from?scTodayStr():''))+'" onchange="nfBizSetDate(\'to\',this.value,\''+ctx+'\')"></label></div>';
}
function nfBizSetType(t,ctx){ _nfBd.type=t||''; nfBizRerender(ctx); }
function nfBizSetPreset(p,ctx){ _nfBd.preset=p; nfBizRerender(ctx); }
function nfBizSetDate(k,v,ctx){ var iso=nfBizFromDmy(v); if(v&&!iso){ showToast('Type the date as dd/mm/yyyy, e.g. 01/04/2026.','err'); return; } var rg=nfBizRange(); _nfBd.from=rg.from; _nfBd.to=rg.to; _nfBd[k]=iso||''; _nfBd.preset='custom'; nfBizRerender(ctx); }
function nfBizRerender(ctx){ if(document.getElementById('nf-bizpv')) nfBizPvRender(); if(_nfOv.view==='business') nfRenderBizDash(); }
// ── the page ──
function nfRupeeShort(n){ n=Number(n)||0; if(n>=1e7) return '₹'+(n/1e7).toFixed(n>=1e8?0:1).replace(/\.0$/,'')+' Cr'; if(n>=1e5) return '₹'+(n/1e5).toFixed(1).replace(/\.0$/,'')+' L'; if(n>=1e3) return '₹'+(n/1e3).toFixed(1).replace(/\.0$/,'')+'k'; return '₹'+Math.round(n); }
function nfBizKpi(label,val,sub,cls,go){ return '<'+(go?'button type="button" onclick="'+go+'"':'div')+' class="bz-k '+(cls||'')+'"><small>'+scEsc(label)+'</small><b>'+val+'</b><span>'+sub+'</span></'+(go?'button':'div')+'>'; }
async function nfRenderBizDash(load){
  if(appMode!=='sc-admin') return;
  var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-biz'); if(!box){ box=document.createElement('div'); box.id='nf-biz'; box.dataset.nfv='business'; main.insertBefore(box,main.firstChild); }
  if(load||!_nfBd.pays){ if(!box.innerHTML) box.innerHTML='<div class="nfbd-empty">Loading…</div>'; await nfBizLoad(load==='force'); }
  var D=nfBizData(); _nfBd._D=D;
  var cu=D.cust, tot=Math.max(1,cu.paid+cu.contract+cu.trial+cu.ended), pct=function(n){ return (100*n/tot).toFixed(2)+'%'; };
  var seg=function(k,l,n){ return n?'<button type="button" class="'+k+'" style="width:'+pct(n)+'" onclick="nfBizCust(\''+k+'\')" title="'+scEsc(l+': '+n)+'"><span>'+scEsc(l)+' '+n+'</span></button>':''; };
  var h='<div class="nfo-top"><div><h1>Business</h1><small>HealSol only · money, customers and growth · '+scEsc(D.rg.label)+' · '+scEsc(D.rg.text)+'</small></div>'
    +'<button type="button" class="nfo-ic" title="Refresh" aria-label="Refresh" onclick="nfRenderBizDash(\'force\')"><i class="ti ti-refresh"></i></button>'
    +'<button type="button" class="nfbd-dl" onclick="nfBizPreview()"><i class="ti ti-download"></i> Download (Excel / PDF)</button></div>'
    +'<div class="bz-bar">'+nfBizTypeTabsHTML(D,'dash')+nfBizRangeHTML('dash')+'</div>'
    +'<div class="bz-sec"><b>Money</b><span>in the period'+(D.prev?' · compared with the previous '+D.prev.days+' days':'')+'</span></div><div class="bz-kg">'
    +nfBizKpi('Revenue received',nfRupee(D.paySum),(D.change!=null?'<em class="'+(D.change>=0?'up':'down')+'">'+(D.change>=0?'+':'')+D.change+'% vs previous period</em><br>':(D.prev?'<em>nothing in the previous period</em><br>':''))+(D.payBase?nfRupee(D.payBase)+' + GST '+nfRupee(D.payGst)+' · ':'')+D.pays.length+' payment'+(D.pays.length===1?'':'s'),'hero',"nfBizTab('pays',true)")
    +nfBizKpi('To collect',D.collect.n&&D.collect.miss===D.collect.n?'—':nfRupee(D.collect.sum),D.collect.n?D.collect.n+' trial'+(D.collect.n===1?'':'s')+' ended, not paid'+(D.collect.miss?' · '+D.collect.miss+' without a price':''):'nothing to collect',D.collect.n?'r':'',"nfBizTab('collect',true)")
    +nfBizKpi('Pipeline',nfRupee(D.pipe.sum),D.pipe.n+' on trial · '+D.open.length+' open enquir'+(D.open.length===1?'y':'ies')+(D.openFac?' ('+D.openFac+' facilities)':''),'',"nfBizTab('collect',true)")
    +nfBizKpi('Average per paying facility',D.avg==null?'—':nfRupee(D.avg),D.payers+' facilit'+(D.payers===1?'y':'ies')+' paid in the period','')+'</div>'
    +'<div class="nfo-card bz-cust"><div class="bz-ch"><b>Customers today</b><span>'+(cu.paid+cu.contract+cu.trial+cu.ended)+' facilities · tap a part to see the list</span></div>'
    +'<div class="bz-cbar">'+seg('paid','Paid',cu.paid)+seg('contract','Contract',cu.contract)+seg('trial','On trial',cu.trial)+seg('ended','Trial ended',cu.ended)+'</div>'
    +'<div class="bz-leg"><span><i class="paid"></i>Paid <b>'+cu.paid+'</b></span><span><i class="contract"></i>Contract <b>'+cu.contract+'</b></span><span><i class="trial"></i>On trial <b>'+cu.trial+'</b></span><span><i class="ended"></i>Trial ended, not paid <b>'+cu.ended+'</b></span></div></div>'
    +'<div class="bz-sec"><b>Growth</b><span>in the period</span></div><div class="bz-kg">'
    +nfBizKpi('New facilities',D.regs.length,'HealSol enrolled '+(D.regs.length-D.selfR.length)+' · self-registered '+D.selfR.length,'',"nfBizTab('regs',true)")
    +nfBizKpi('Trial → paid',D.conv==null?'—':D.conv+'%',D.trialsEnded.length?D.converted.length+' of '+D.trialsEnded.length+' ended trials paid'+(D.daysToPay!=null?' · '+D.daysToPay+' days to pay on average':''):'no trial ended in the period','')
    +nfBizKpi('Enquiries',D.enq.length,D.enqOpen+' still open · '+D.enqFac+' facilities asked about','',"nfBizTab('enq',true)")
    +nfBizKpi('Catch-ups sold',D.cu.length,D.cuSum?nfRupee(D.cuSum):'none in the period','')+'</div>'
    +'<div class="bz-charts">'+nfBizChartsHTML(D)+'</div>'
    +'<div class="nfo-card"><div class="bz-ch"><b>Breakdown</b><div class="bz-seg" role="tablist" aria-label="Breakdown">'+[['type','By type'],['dist','By district'],['pkg','By package']].map(function(x){ return '<button type="button" role="tab" aria-selected="'+(_nfBd.brk===x[0])+'" class="'+(_nfBd.brk===x[0]?'on':'')+'" onclick="_nfBd.brk=\''+x[0]+'\';nfBizBrk()">'+x[1]+'</button>'; }).join('')+'</div></div><div id="bz-brk"></div></div>'
    +'<div class="nfo-card"><div class="nfbd-tabs" id="nfbd-tabs"></div><div id="nfbd-list"></div></div>';
  box.innerHTML=h; nfBizBrk(); nfBizList();
  try{ nfAdminApply(); }catch(e){}
}
function nfBizCust(k){ _nfBd.tab=k==='paid'||k==='contract'?'cust_'+k:'collect'; nfBizList(); var el=document.getElementById('nfbd-tabs'); try{ el&&el.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} }
function nfBizChartsHTML(D){
  var ms=D.months.slice(-12), mxA=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.amt; }).concat([0]))), mxR=Math.max(1,Math.max.apply(null,ms.map(function(m){ return m.regH+m.regS; }).concat([0])));
  var sub=ms.length<D.months.length?'last 12 months of the period':'by month';
  var anyA=ms.some(function(m){ return m.amt; }), anyR=ms.some(function(m){ return m.regH+m.regS; });
  var a=ms.map(function(m){ return '<div class="nfb-bar"><b>'+(m.amt?nfRupeeShort(m.amt):'')+'</b><i class="amt" style="height:'+Math.round(m.amt/mxA*120)+'px" title="'+scEsc(m.l+': '+nfRupee(m.amt)+' · '+m.payN+' payment(s)')+'"></i><small>'+scEsc(m.l)+'</small></div>'; }).join('');
  var r=ms.map(function(m){ var t=m.regH+m.regS; return '<div class="nfb-bar"><b>'+(t||'')+'</b><div class="nfb-stack" style="height:'+Math.round(t/mxR*120)+'px"><i class="dm" style="flex:'+m.regS+'"></i><i class="dr" style="flex:'+m.regH+'"></i></div><small>'+scEsc(m.l)+'</small></div>'; }).join('');
  return '<div class="nfo-card"><div class="bz-ch"><b>Revenue by month</b><span>'+sub+' · total '+nfRupee(D.paySum)+'</span></div>'+(anyA?'<div class="nfbd-chart">'+a+'</div>':'<p class="bz-none">No payments in this period.</p>')+'</div>'
    +'<div class="nfo-card"><div class="bz-ch"><b>New facilities by month</b><span><i class="nfb-k dr"></i> HealSol <i class="nfb-k dm"></i> self-registered</span></div>'+(anyR?'<div class="nfbd-chart">'+r+'</div>':'<p class="bz-none">No new facilities in this period.</p>')+'</div>';
}
function nfBizBrk(){
  var D=_nfBd._D, box=document.getElementById('bz-brk'); if(!D||!box) return;
  var k=_nfBd.brk||'type', rows=k==='dist'?D.byDist:k==='pkg'?D.byPkg:D.byType, lab=k==='dist'?'District':k==='pkg'?'Package':'Type';
  if(!rows.length){ box.innerHTML='<div class="nfbd-empty">No facilities.</div>'; document.querySelectorAll('#nf-biz .bz-seg button').forEach(function(b){ b.classList.toggle('on',b.getAttribute('onclick').indexOf("'"+k+"'")>0); }); return; }
  var t={n:0,paid:0,contract:0,trial:0,ended:0,rev:0,collect:0}; rows.forEach(function(g){ Object.keys(t).forEach(function(x){ t[x]+=g[x]||0; }); });
  var r=function(g,tot){ return '<tr'+(tot?' class="tot"':'')+'><td data-l=""><b>'+scEsc(g.name)+'</b></td><td data-l="Facilities" class="n">'+g.n+'</td><td data-l="Paid" class="n">'+g.paid+'</td><td data-l="Contract" class="n">'+g.contract+'</td><td data-l="On trial" class="n">'+g.trial+'</td><td data-l="Trial ended" class="n">'+g.ended+'</td><td data-l="Revenue in period" class="n">'+(g.rev?nfRupee(g.rev):'—')+'</td><td data-l="To collect" class="n'+(g.collect?' r':'')+'">'+(g.collect?nfRupee(g.collect):'—')+'</td></tr>'; };
  box.innerHTML='<div class="nfo-tw"><table class="nfo-t bz-t"><thead><tr><th>'+lab+'</th><th class="n">Facilities</th><th class="n">Paid</th><th class="n">Contract</th><th class="n">On trial</th><th class="n">Trial ended</th><th class="n">Revenue in period</th><th class="n">To collect</th></tr></thead><tbody>'
    +rows.map(function(g){ return r(g); }).join('')+(rows.length>1?r(Object.assign({name:k==='type'&&D.type?'All types':'Total'},t),true):'')+'</tbody></table></div>'
    +(k==='type'&&D.type?'<p class="bz-note">By type always shows every type; the other numbers on this page are for '+scEsc(nfBizTypeLbl(D.type))+'s only.</p>':'');
  document.querySelectorAll('#nf-biz .bz-seg button').forEach(function(b){ var on=b.getAttribute('onclick').indexOf("'"+k+"'")>0; b.classList.toggle('on',on); b.setAttribute('aria-selected',String(on)); });
}
function nfBizTab(t,scroll){ _nfBd.tab=t; _nfBd.q=''; nfBizList(); if(scroll){ var el=document.getElementById('nfbd-tabs'); try{ el&&el.scrollIntoView({behavior:'smooth',block:'start'}); }catch(e){} } }
function nfBizStatusTag(s){ return '<span class="nfbd-tag '+({paid:'g',contract:'v',trial:'a',ended:'r'}[s]||'v')+'">'+scEsc(nfBizStatusTxt(s))+'</span>'; }
function nfBizListDefs(D){
  var fac=function(r){ return '<b>'+scEsc(r.name)+'</b> <span class="bz-ty">'+scEsc(nfBizTypeShort(r.type))+'</span><small>'+scEsc(r.code+' · '+r.pkg)+'</small>'; };
  var who=function(n,m,l){ return scEsc(n||'—')+(l?'<small>'+scEsc(l)+'</small>':'')+(m?'<small>'+scEsc(m)+'</small>':''); };
  var msg=function(code,kind){ return '<button type="button" class="bz-msg" onclick="event.stopPropagation();nfBizMsg(\''+kind+'\',\''+scJs(code)+'\')">Message</button>'; };
  var custRows=function(st){ return D.R.filter(function(r){ return r.status===st; }); };
  return {
    collect:{l:'Money to collect',rows:D.collectList,head:['Facility','District','Why','Amount (incl. GST)','In-charge',''],go:1,cls:function(r){ return r.status==='ended'?'hot':''; },
      cell:function(r){ return [fac(r),scEsc(r.district),'<span class="'+(r.status==='ended'?'r':'a')+'">'+scEsc(nfBizWhy(r))+'</span>',r.priceGst==null?'<button type="button" class="hs-link" onclick="event.stopPropagation();nfAdminView(\'settings\')">Set price</button>':'<b>'+nfRupee(r.priceGst)+'</b>',who(r.icName,r.icMob,r.icLabel),r.icMob?msg(r.code,r.status==='ended'?'due':'trial'):'']; },
      txt:function(r){ return [r.name,r.code,r.district,r.icName,r.icMob].join(' '); },lab:['','District','Why','Amount','In-charge','']},
    pays:{l:'Payments',rows:D.pays.slice().reverse(),head:['Receipt','Paid on','Facility','Package','Total','Paid by','Reference'],go:1,cell:function(x){ return [scEsc(x.receiptNo),x.date?scEsc(nfDateTxt(x.date)):'','<b>'+scEsc(x.name)+'</b> <span class="bz-ty">'+scEsc(nfBizTypeShort(x.type))+'</span><small>'+scEsc(x.code)+'</small>',scEsc(x.pkg)+(x.catchup?' <span class="bz-ty o">catch-up</span>':''),'<b>'+nfMoney(x.total)+'</b>'+(x.gst!==''?'<small>incl. GST '+nfMoney(x.gst)+'</small>':''),scEsc(x.method||x.how),'<small>'+scEsc(x.ref)+'</small>']; },
      txt:function(x){ return [x.receiptNo,x.name,x.code,x.pkg,x.method,x.ref,x.district].join(' '); },lab:['Receipt','Paid on','','Package','Total','Paid by','Reference']},
    regs:{l:'Registrations',rows:D.regs.slice().sort(function(a,b){ return String(b.enrolled).localeCompare(String(a.enrolled)); }),head:['Facility','District','Registered','How','Status','In-charge'],go:1,cell:function(r){ return [fac(r),scEsc(r.district),r.enrolled?scEsc(nfDateTxt(r.enrolled)):'—',r.self?'Self-registered':'HealSol',nfBizStatusTag(r.status),who(r.icName,r.icMob,r.icLabel)]; },
      txt:function(r){ return [r.name,r.code,r.district,r.icName,r.icMob].join(' '); },lab:['','District','Registered','How','Status','In-charge']},
    enq:{l:'Enquiries',rows:D.enq,head:['Submitted','Organisation','Contact','District','Facilities','Status',''],cell:function(x){ return [x.submittedAt?scEsc(nfDateTxt(x.submittedAt)):'','<b>'+scEsc(x.orgName||'')+'</b>'+(x.message?'<small>'+scEsc(String(x.message).slice(0,90))+'</small>':''),who(x.contactName,[x.mobile,x.email].filter(Boolean).join(' · ')),scEsc([x.district,x.state].filter(Boolean).join(', ')),scEsc(x.facilityCount||''),scEsc(x.status||'new'),x.mobile?'<button type="button" class="bz-msg" onclick="event.stopPropagation();nfBizMsg(\'lead\',\''+scJs(x._k)+'\')">Message</button>':'']; },
      txt:function(x){ return [x.orgName,x.contactName,x.mobile,x.email,x.district,x.state].join(' '); },lab:['Submitted','','Contact','District','Facilities','Status','']},
    cust_paid:{l:'Paid',hide:1,rows:custRows('paid'),head:['Facility','District','Package','In-charge'],go:1,cell:function(r){ return [fac(r),scEsc(r.district),scEsc(r.pkg),who(r.icName,r.icMob,r.icLabel)]; },txt:function(r){ return [r.name,r.code,r.district].join(' '); },lab:['','District','Package','In-charge']},
    cust_contract:{l:'Contract',hide:1,rows:custRows('contract'),head:['Facility','District','Package','In-charge'],go:1,cell:function(r){ return [fac(r),scEsc(r.district),scEsc(r.pkg),who(r.icName,r.icMob,r.icLabel)]; },txt:function(r){ return [r.name,r.code,r.district].join(' '); },lab:['','District','Package','In-charge']}
  };
}
function nfBizList(){
  var D=_nfBd._D, tabs=document.getElementById('nfbd-tabs'), box=document.getElementById('nfbd-list'); if(!D||!tabs||!box) return;
  var T=nfBizListDefs(D), t=T[_nfBd.tab]?_nfBd.tab:'collect';
  tabs.innerHTML='<div class="bz-tabs" role="tablist" aria-label="Lists">'+Object.keys(T).filter(function(k){ return !T[k].hide||k===t; }).map(function(k){ return '<button type="button" role="tab" aria-selected="'+(k===t)+'" class="nfbd-tab'+(k===t?' on':'')+'" onclick="nfBizTab(\''+k+'\')">'+T[k].l+'<em>'+T[k].rows.length+'</em></button>'; }).join('')+'</div>'
    +'<label class="nfbd-q"><i class="ti ti-search"></i><input id="nfbd-q" aria-label="Search this list" placeholder="Search this list…" value="'+scEsc(_nfBd.q||'')+'" oninput="_nfBd.q=this.value;nfBizListBody()"></label>';
  nfBizListBody(T);
}
function nfBizListBody(T0){
  if(!T0){ var pos=null, el=document.getElementById('nfbd-q'); if(el) pos=el.selectionStart; nfBizList(); el=document.getElementById('nfbd-q'); if(el){ el.focus(); try{ el.setSelectionRange(pos,pos); }catch(e){} } return; }
  var box=document.getElementById('nfbd-list'), C=T0[_nfBd.tab]||T0.collect, q=String(_nfBd.q||'').toLowerCase().trim();
  var rows=q?C.rows.filter(function(r){ return C.txt(r).toLowerCase().indexOf(q)>=0; }):C.rows, LIM=100;
  if(!rows.length){ box.innerHTML='<div class="nfbd-empty">'+(q?'Nothing matches “'+scEsc(_nfBd.q)+'”.':_nfBd.tab==='collect'?'Nothing to collect — no trial has ended unpaid or ends in the next 7 days.':'Nothing here for this period.')+'</div>'; return; }
  box.innerHTML='<div class="nfo-tw"><table class="nfo-t bz-lt"><thead><tr>'+C.head.map(function(x){ return '<th>'+scEsc(x)+'</th>'; }).join('')+'</tr></thead><tbody>'
    +rows.slice(0,LIM).map(function(r){ var code=r.code, cls=C.cls?C.cls(r):''; return '<tr class="'+cls+(C.go&&code&&(scMasterFacilities||{})[code]?' go" onclick="scDrillIn(\''+scJs(code)+'\')"':'"')+'>'+C.cell(r).map(function(v,i){ return '<td data-l="'+scEsc((C.lab||[])[i]||'')+'">'+v+'</td>'; }).join('')+'</tr>'; }).join('')
    +'</tbody></table></div>'+(rows.length>LIM?'<div class="nfbd-more">Showing '+LIM+' of '+rows.length+' — download the report for the full list.</div>':'');
}
// ── Message: shows the WhatsApp text first, then opens WhatsApp ──
function nfBizMsgText(kind,id){
  if(kind==='lead'){ var x=((_nfBiz&&_nfBiz.leads)||{})[id]||{}, first=String(x.contactName||'').replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i,'').split(' ')[0];
    return {mob:x.mobile,to:(x.contactName||'')+(x.orgName?' · '+x.orgName:''),text:'Namaste'+(first?' '+first:'')+' ji,\nThank you for your enquiry about NQAS | FAST'+(x.orgName?' for '+x.orgName:'')+(x.facilityCount?' (~'+x.facilityCount+' facilities)':'')+'. I am from HealSol Academy.\nWhen would be a good time to talk about the programme and the next steps?\n\n— HealSol Academy'}; }
  var f=(scMasterFacilities||{})[id]||{}, ic=nfBizInCharge(f), first=String(ic.name||'').split(' ')[0], price=nfFacPrice(f), ti=nfTrialInfo(f), pay=typeof nfWaPayInfo==='function'?nfWaPayInfo():'';
  var amt=price!=null?' of '+nfMoney(nfBizWithGst(price))+' ('+nfMoney(price)+' + 18% GST)':'';
  if(kind==='due') return {mob:ic.mob,to:ic.name+' · '+(f.name||id),text:'Namaste'+(first?' '+first:'')+' ji,\nThe free 7-day Baseline for '+(f.name||id)+' ('+id+') has ended. To continue the NQAS | FAST programme, please complete the payment'+amt+' — open the app and tap "Pay & Unlock".'+(pay?'\nYou can also pay here:\n'+pay+'\nand reply with the payment reference.':'')+'\n\n— HealSol Academy'};
  return {mob:ic.mob,to:ic.name+' · '+(f.name||id),text:'Namaste'+(first?' '+first:'')+' ji,\nYour free 7-day Baseline for '+(f.name||id)+' ('+id+') ends '+(ti&&ti.daysOver===0?'today':ti&&ti.daysOver<0?'in '+(-ti.daysOver)+' day'+(ti.daysOver===-1?'':'s'):'soon')+'. To continue without a break, please complete the payment'+amt+' in the app ("Pay & Unlock").\n\n— HealSol Academy'};
}
function nfBizMsg(kind,id){
  var m=nfBizMsgText(kind,id); if(!nfWaNum(m.mob)){ showToast('No mobile number to message.','err'); return; }
  var old=document.getElementById('bz-msg-ov'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='bz-msg-ov'; ov.className='scx-ov open'; ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  ov.innerHTML='<div class="scx-box bz-msgbox" role="dialog" aria-modal="true" aria-labelledby="bz-msg-h"><b id="bz-msg-h">WhatsApp message</b><small>To '+scEsc(m.to)+' · '+scEsc(m.mob)+' — you can change the text before sending.</small>'
    +'<textarea id="bz-msg-t" rows="9" aria-label="Message text">'+scEsc(m.text)+'</textarea>'
    +'<div class="bz-msgf"><button type="button" class="s" onclick="document.getElementById(\'bz-msg-ov\').remove()">Cancel</button><button type="button" class="p" id="bz-msg-go" onclick="nfBizMsgSend(\''+scJs(m.mob)+'\')">Open WhatsApp</button></div></div>';
  document.body.appendChild(ov); try{ document.getElementById('bz-msg-t').focus(); }catch(e){}
}
function nfBizMsgSend(mob){ var t=(document.getElementById('bz-msg-t')||{}).value||''; var ov=document.getElementById('bz-msg-ov'); if(ov) ov.remove(); nfWaOpen(mob,t); }
// ── preview before download ──
async function nfBizPreview(){ await nfBizLoad(); _nfBd.pvSheet=_nfBd.pvSheet||0; nfBizPvRender(); }
function nfBizPvRender(){
  var ov=document.getElementById('nf-bizpv');
  if(!ov){ ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-bizpv'; ov.onclick=function(e){ if(e.target===ov) nfBizPvClose(); }; document.body.appendChild(ov); }
  var D=nfBizData(), SH=nfBizSheets(D), i=Math.min(_nfBd.pvSheet||0,SH.length-1), s=SH[i]; _nfBd._pvD=D;
  var pdfSheets={'Summary':1,'Monthly':1,'Money to collect':1,'Payments':1,'By type':1,'By district':1};
  var tabs=SH.map(function(x,k){ var n=x.name==='Summary'?'':(x.rows.length-1); return '<button type="button" class="nfbd-tab'+(k===i?' on':'')+'" onclick="_nfBd.pvSheet='+k+';nfBizPvRender()">'+scEsc(x.name)+(n!==''?'<em>'+n+'</em>':'')+'</button>'; }).join('');
  var LIM=12, tbl;
  if(s.name==='Summary'){
    tbl='<table class="nf-bizpv-t"><tbody>'+s.rows.slice(5).map(function(r){ if(!r.length) return ''; if(r[1]==='Value') return '<tr><td class="sec" colspan="3">'+scEsc(r[0])+'</td></tr>';
      return '<tr><td>'+scEsc(r[0])+'</td><td><b>'+scEsc(/\(₹\)$/.test(r[0])&&r[1]!==''?nfMoney(r[1]):r[1])+'</b></td><td>'+scEsc(r[2]||'')+'</td></tr>'; }).join('')+'</tbody></table>';
  } else {
    var body=s.rows.slice(1);
    tbl=body.length?'<table class="nf-bizpv-t"><thead><tr>'+s.rows[0].map(function(x){ return '<th>'+scEsc(x)+'</th>'; }).join('')+'</tr></thead><tbody>'
      +body.slice(0,LIM).map(function(r){ return '<tr>'+r.map(function(v){ return '<td>'+scEsc(v==null?'':String(v))+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table>'
      :'<div class="nfbd-empty">No rows for this period.</div>';
    if(body.length>LIM) tbl+='<div class="nfbd-more" style="padding:8px 10px;">Preview shows the first '+LIM+' of '+body.length+' rows — the file has them all.</div>';
  }
  ov.innerHTML='<div class="scx-box nf-bizpv-box" role="dialog" aria-label="Business report preview">'
    +'<div class="nf-bizpv-h"><b>Preview — business report<small>'+scEsc(D.rg.label)+' · '+scEsc(D.rg.text)+' · '+scEsc(D.type?nfBizTypeLbl(D.type)+'s only':'all facility types')+' · customers as of '+scEsc(nfDateTxt(D.today))+'</small></b><button type="button" class="nf-bizpv-x" onclick="nfBizPvClose()" aria-label="Close"><i class="ti ti-x"></i></button></div>'
    +'<div class="nf-bizpv-b"><div class="bz-bar">'+nfBizTypeTabsHTML(D,'pv')+nfBizRangeHTML('pv')+'</div>'
    +'<label class="bz-tick"><input type="checkbox" id="bz-contacts"'+(_nfBd.contacts?' checked':'')+' onchange="_nfBd.contacts=this.checked;nfBizPvRender()"> Include mobile numbers and e-mails</label>'
    +'<div class="nfbd-tabs">'+tabs+'</div><div class="nf-bizpv-tw">'+tbl+'</div>'
    +'<div class="nfbd-more">'+(pdfSheets[s.name]?'This sheet is in both the Excel file and the PDF.':'This sheet is in the Excel file only.')+'</div></div>'
    +'<div class="nf-bizpv-f"><small>Excel: all '+SH.length+' sheets. PDF: Summary, revenue by month, Money to collect, Payments, By type and By district — for meetings.</small>'
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
    +'<div class="nf-bizrep-p">Choose the facility type and the dates, preview, then download as Excel (Summary, Monthly, Money to collect, Payments, Registrations, Enquiries, By type, By district, By package, Facilities) or as a PDF for meetings. The same figures are on the Business tab.</div>'
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
