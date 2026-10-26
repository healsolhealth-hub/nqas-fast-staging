
// ══════════════════════════════════════════════════════════════
// CERTIFICATE — earned, graded, signed, verifiable (server function issueCertificate decides)
//  Conditions: Baseline 7/7 · at least 48 of 60 daily cards done · at least half of the done cards verified · from Day 60 · PRO facility
//  Grade from the facility score: Distinction ≥80 · Merit 70–79 · Completion below 70
//  Signers (digital): Supervisor (printed as Quality Mentor), Quality Champion, HealSol Academy Coordinator (Setup → Certificate signatory)
//  Every certificate has a number and a QR code → public Verify page (?cert=NUMBER).
// ══════════════════════════════════════════════════════════════
var NF_CERT={days:60,baseline:7,minDone:48,share:0.5};
// public Verify address printed on certificates (Wix page that shows this app's Verify page) and the app's home on the website
var NF_CERT_VERIFY_BASE=NF_APP.verifyBase, NF_APP_HOME=NF_APP.appHome;
var _nfCert={rec:null,code:'',mob:'',loaded:false};
// the signature font (vendor/sign-font.js, ~70 KB) is loaded only when a certificate is shown or printed (speed, 26 Oct 2026)
function nfSignFont(){
  return nfLoadScript('sign-font').then(function(){ try{ if(document.getElementById('nf-sign-font')||typeof NF_PDF_FONT_SIGN==='undefined') return; var st=document.createElement('style'); st.id='nf-sign-font'; st.textContent="@font-face{font-family:'NF Sign';font-style:normal;font-weight:400;font-display:swap;src:url(data:font/ttf;base64,"+NF_PDF_FONT_SIGN+") format('truetype');}"; document.head.appendChild(st); }catch(e){} }).catch(function(){});
}
function nfCertGradeOf(p){ return p>=80?'Distinction':p>=70?'Merit':'Completion'; }
function nfCertTitle(g){ return g==='Completion'?'CERTIFICATE OF COMPLETION':'CERTIFICATE OF ACHIEVEMENT'; }
function nfCertBase(){ return NF_CERT_VERIFY_BASE; }
// the programme sentence and the third score box (Sub-Centre or department core: UPHC / PHC / CHC, Step 3)
function nfCertText(r){
  if(r.kind==='dept') return 'has completed the '+(r.programmeDays||90)+'-day NQAS | FAST readiness programme ('+(r.packageLabel||r.tier)+')'+(r.depts?' in '+r.depts:'')+', '+scFmtDate(r.startDate)+' – '+scFmtDate(r.endDate)+', meeting every condition: '
    +(r.lead?r.daysVerified+' of '+r.totalDays+' department-days checked as lead.':r.daysDone+' of '+r.totalDays+' card days done and '+r.daysVerified+' checked by the department lead.');
  return 'has completed the 60-day NQAS | FAST readiness programme ('+(r.packageLabel||r.tier)+'), '+scFmtDate(r.startDate)+' – '+scFmtDate(r.endDate)+', meeting every condition: baseline '+r.baselineDays+'/7, '+r.daysDone+' of '+r.totalDays+' daily cards done and '+r.daysVerified+' verified by mentors.';
}
function nfCertBoxes(r){
  var d=r.kind==='dept';
  return {staff:d?'MY DEPARTMENTS':'STAFF READINESS',third:d?(r.lead?'DAYS CHECKED':'CARD DAYS'):'DAILY CARDS',val:(d&&r.lead?r.daysVerified:r.daysDone)+'/'+r.totalDays,sub:d?(r.lead?'as lead':r.daysVerified+' checked'):r.daysVerified+' verified'};
}
function nfCertEval(){
  var cards=(choState&&choState.cards)||{}, done=0, ver=0, base=0;
  Object.keys(cards).forEach(function(k){ var i=+k, c=cards[k]; if(!c||!c.taskDone||i>=NF_CERT.days) return; done++; if(c.verified) ver++; if(i<NF_CERT.baseline) base++; });
  var need=Math.ceil(done*NF_CERT.share), day=scb1TodayIdx();
  return {day:day,dayOk:day>=NF_CERT.days-1,base:base,done:done,ver:ver,need:Math.max(need,1),
    okBase:base>=NF_CERT.baseline,okDone:done>=NF_CERT.minDone,okVer:done>0&&ver>=need,
    ok:base>=NF_CERT.baseline&&done>=NF_CERT.minDone&&done>0&&ver>=need};
}
async function nfCertLoad(force){
  var code=choState&&choState.facilityCode, mob=choState&&choState.staffMobile; if(!code||!mob) return null;
  if(!force&&_nfCert.loaded&&_nfCert.code===code&&_nfCert.mob===mob) return _nfCert.rec;
  var r=null; try{ r=await fbGet('sc_certs/'+code+'/'+mob); }catch(e){}
  _nfCert={rec:r,code:code,mob:mob,loaded:true}; return r;
}
function nfCertCardHTML(){
  var hi=_appLang==='hi', E=nfCertEval(), rec=_nfCert.loaded&&_nfCert.code===choState.facilityCode?_nfCert.rec:null;
  var title=hi?'उपलब्धि प्रमाणपत्र':'Certificate of Achievement';
  if(rec) return '<div class="nf-cert nfc won on"><span><i class="ti ti-certificate"></i></span><div><b>'+scEsc(title)+'</b>'
    +'<small>'+scEsc(hi?'आपने यह अर्जित किया है':'You earned it')+' · '+scEsc(rec.certId)+'</small><div><span class="nfc-grade">'+scEsc(rec.grade.toUpperCase())+' · '+rec.facPct+'%</span></div>'
    +'<div class="nfc-acts"><button type="button" onclick="nfShowCert(_nfCert.rec)">'+scEsc(hi?'प्रमाणपत्र देखें':'View certificate')+'</button><button type="button" onclick="nfCertDownload(_nfCert.rec,this)">'+scEsc(hi?'PDF डाउनलोड':'Download PDF')+'</button></div></div></div>';
  var title2=hi?'मेरा NQAS | FAST प्रमाणपत्र':'My NQAS | FAST certificate';
  if(!nfProTier(choState.facility)) return oneCert({title:title2,sub:hi?'पूर्ण प्रोग्राम (PRO) में उपलब्ध':'Available with the full programme (PRO).',rows:[]}).replace('class="one-card one-cert"','class="one-card one-cert nf-cert nfc"');
  var gd=choState.startDate?nfDateTxt(nfDayISO(NF_CERT.days-1),true):'';
  var rows=[[E.okBase?'ok':'todo',hi?'बेसलाइन दिन पूरे':'Baseline days done',hi?'सभी 7 बेसलाइन दिन':'all 7 baseline days',E.base+' / '+NF_CERT.baseline],
    [E.okDone?'ok':'todo',hi?'दैनिक कार्ड पूरे':'Day cards done',(hi?'60 में से कम से कम ':'at least ')+NF_CERT.minDone+(hi?'':' of 60'),E.done+' / '+NF_CERT.minDone],
    [E.okVer?'ok':'todo',hi?'सुपरवाइज़र या CHO द्वारा जाँचे':'Checked by your Supervisor or CHO',hi?'पूरे कार्डों में से कम से कम आधे':'at least half of your done cards',E.ver+' / '+E.need],
    [E.dayOk?'ok':'wait',hi?'स्वास्थ्य केंद्र का ग्रेजुएशन':'Facility graduates',(hi?'दिन 60':'Day 60')+(gd?' · '+gd:''),E.dayOk?'✓':'—']];
  var sub=!E.dayOk?(hi?'दिन 60 पर खुलेगा — जो अभी बाकी है:':'Unlocks on Day 60 — what is still needed:'):!E.ok?(hi?'अभी अर्जित नहीं — जो बाकी है उसे पूरा करें':'Not earned yet — complete what is still open'):(hi?'बधाई! आपने सभी शर्तें पूरी कीं':'Well done — all conditions met');
  var btn=E.ok&&E.dayOk?'<button type="button" onclick="nfClaimCert(this)">'+scEsc(hi?'मेरा प्रमाणपत्र लें':'Get my certificate')+'</button>':'';
  return oneCert({title:title2,sub:sub,rows:rows,note:hi?'ग्रेड स्वास्थ्य केंद्र के स्कोर से: डिस्टिंक्शन 80%+, मेरिट 70–79%।':'Grade from the facility score: Distinction 80%+, Merit 70–79%.',btn:btn}).replace('class="one-card one-cert"','class="one-card one-cert nf-cert nfc'+(E.ok&&E.dayOk?' on':'')+'"');
}
function nfCertPaintMe(){ var p=document.getElementById('nf-me'); if(!p) return; var old=p.querySelector('.nf-cert'); if(!old) return; var w=document.createElement('div'); w.innerHTML=nfCertCardHTML(); old.replaceWith(w.firstChild); }
async function nfCertScores(){
  await nfLoadFacility(true);
  var R=scReadiness(choState.progId,choState.cards,choState.roleId||'CHO'), B=R.baseline||{}, A=(_nfFac&&_nfFac.agg)||null, AB=(A&&A.baseline)||{};
  return {staffPct:R.pct,staffBase:B.assessed?B.pct:null,facPct:A?A.pct:null,facBase:AB.assessed?AB.pct:null};
}
async function nfClaimCert(btn){
  var old=btn?btn.innerHTML:''; if(btn){ btn.disabled=true; btn.textContent=_appLang==='hi'?'तैयार हो रहा है…':'Preparing…'; }
  try{
    var sc=await nfCertScores(); if(sc.facPct==null) throw new Error('Could not read the facility score — check the connection and try again.');
    var r=await nfCall('issueCertificate',{code:choState.facilityCode,scores:sc,base:nfCertBase(),packageLabel:scPkgLabel(choState.progId)});
    _nfCert={rec:r.cert,code:choState.facilityCode,mob:choState.staffMobile,loaded:true};
    nfCertPaintMe(); nfShowCert(r.cert); 
  }catch(e){ showToast(e.message||'Could not issue the certificate.','err'); }
  finally{ if(btn&&document.body.contains(btn)){ btn.disabled=false; btn.innerHTML=old; } }
}
// kept name: the Me page used to call nfCertificate()
function nfCertificate(){ if(_nfCert.rec) nfShowCert(_nfCert.rec); else nfClaimCert(); }
function nfCertQrSvg(text){ try{ var q=qrcode(0,'M'); q.addData(text); q.make(); return q.createSvgTag({cellSize:4,margin:0,scalable:true}); }catch(e){ return ''; } }
function nfCertDate(iso){ return iso?scFmtDate(nfIsoLocal(iso)):''; }
function nfCertHTML(r){
  var g=r.grade||'Completion', sealCls=g==='Distinction'?'d':g==='Merit'?'m':'c';
  var gain=function(p,b){ return b==null?'':'<em>Baseline '+b+'% · '+(p-b>=0?'+':'')+(p-b)+'</em>'; };
  var signed=nfCertDate(r.issuedAt);
  return '<div class="nfcd" id="nfcd"><div class="b1"></div><div class="b2"></div>'
    +'<div class="seal '+sealCls+'"><span>'+scEsc(g.toUpperCase())+'<br><i>'+r.facPct+'% · NQAS | FAST</i></span></div>'
    +'<div class="qr">'+nfCertQrSvg(r.verifyUrl||r.certId)+'<div>Scan to verify</div></div>'
    +'<div class="in"><div class="lg"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div>'
    +'<h1>'+nfCertTitle(g)+'</h1>'+(g!=='Completion'?'<div class="gr">with '+scEsc(g)+'</div>':'<div class="gr">NQAS | FAST readiness programme</div>')
    +'<div class="ct">This is to certify that</div><div class="nm">'+scEsc(r.name)+'</div>'
    +'<div class="fc">'+scEsc(r.role)+' · '+scEsc(r.facilityName)+' ('+scEsc(r.code)+')'+(r.district?' · '+scEsc([r.district,r.state].filter(Boolean).join(', ')):'')+' <span class="nf-pro"><i class="p">PRO</i><i class="t">'+scEsc(r.tier)+'</i></span></div>'
    +'<div class="tx">'+scEsc(nfCertText(r))+'</div>'
    +(function(){ var bx=nfCertBoxes(r), cap=function(t){ return t.charAt(0)+t.slice(1).toLowerCase(); }; return '<div class="sc"><div><small>Facility score</small><b>'+r.facPct+'%</b>'+gain(r.facPct,r.facBase)+'</div><div><small>'+cap(bx.staff)+'</small><b>'+r.staffPct+'%</b>'+gain(r.staffPct,r.staffBase)+'</div>'
    +'<div><small>'+cap(bx.third)+'</small><b>'+bx.val+'</b><em>'+scEsc(bx.sub)+'</em></div></div>'; })()
    +'<div class="sg">'+(r.signers||[]).map(function(s){ return '<div><div class="s">'+scEsc(s.name)+'</div><hr><b>'+scEsc(s.name)+'</b><small>'+scEsc(s.role)+(s.title&&s.title!==s.role?' · '+scEsc(s.title):'')+'</small><small>Digitally signed · '+scEsc(signed)+'</small></div>'; }).join('')+'</div></div>'
    +'<div class="ft"><span>Certificate No. <b>'+scEsc(r.certId)+'</b> · Issued '+scEsc(signed)+'</span><span>Verify: '+scEsc(String(r.verifyUrl||'').replace(/^https:\/\/(www\.)?/,''))+'</span></div></div>';
}
function nfCertLinkedIn(r){
  var d=new Date(r.issuedAt||Date.now());
  return 'https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name='+encodeURIComponent('NQAS | FAST — '+nfCertTitle(r.grade).replace('CERTIFICATE OF ','Certificate of ').replace('ACHIEVEMENT','Achievement').replace('COMPLETION','Completion')+(r.grade!=='Completion'?' ('+r.grade+')':''))
    +'&organizationName='+encodeURIComponent('HealSol Academy')+'&issueYear='+d.getFullYear()+'&issueMonth='+(d.getMonth()+1)+'&certUrl='+encodeURIComponent(r.verifyUrl||'')+'&certId='+encodeURIComponent(r.certId);
}
function nfCertShareText(r){ return 'I earned the NQAS | FAST '+(r.grade==='Completion'?'Certificate of Completion':'Certificate of Achievement with '+r.grade)+' from HealSol Academy — '+r.facilityName+', facility score '+r.facPct+'%. Verify: '+(r.verifyUrl||r.certId); }
function nfShowCert(r){ nfSignFont();
  if(!r) return; var old=document.getElementById('nfcv'); if(old) old.remove();
  var ov=document.createElement('div'); ov.id='nfcv'; ov.className='nfcv-ov'; ov.onclick=function(e){ if(e.target===ov) ov.remove(); };
  ov.innerHTML='<div class="nfcv-box"><div class="nfcv-bar"><b>'+scEsc(r.grade==='Completion'?'Certificate of Completion':'Certificate of Achievement · '+r.grade)+'<small>'+scEsc(r.certId)+'</small></b>'
    +'<button type="button" class="p" onclick="nfCertDownload(_nfCertOpen,this)"><i class="ti ti-download"></i> PDF</button>'
    +'<button type="button" class="wa" onclick="nfCertShare(_nfCertOpen,this)"><i class="ti ti-send"></i> Share</button>'
    +'<a class="li" href="'+scEsc(nfCertLinkedIn(r))+'" target="_blank" rel="noopener">in · LinkedIn</a>'
    +'<button type="button" onclick="nfCopyText(_nfCertOpen.verifyUrl||_nfCertOpen.certId);showToast(\'Verify link copied.\',\'ok\')"><i class="ti ti-clipboard-text"></i> Copy link</button>'
    +'<button type="button" onclick="document.getElementById(\'nfcv\').remove()" aria-label="Close"><i class="ti ti-x"></i></button></div>'
    +'<div class="nfcv-wrap">'+nfCertHTML(r)+'</div></div>';
  window._nfCertOpen=r; document.body.appendChild(ov);
}
// ── PDF (A4 landscape) ──
async function nfCertPdf(r){ await nfSignFont();
  var J=await nfLoadPdf(), doc=nfPdfNew(J,'l'), F=doc._nfFont, T=function(s){ return nfPdfTxt(doc,s); }, W=297, H=210, cx=W/2;
  var TEAL=[19,90,85], ORG=[233,150,58], GREY=[107,122,120], INK=[19,32,31], g=r.grade||'Completion';
  try{ doc.addFileToVFS('Sign.ttf',NF_PDF_FONT_SIGN); doc.addFont('Sign.ttf','Sign','normal'); }catch(e){}
  doc.setDrawColor.apply(doc,TEAL); doc.setLineWidth(1.4); doc.roundedRect(8,8,W-16,H-16,3,3,'S');
  doc.setDrawColor.apply(doc,ORG); doc.setLineWidth(0.4); doc.roundedRect(11,11,W-22,H-22,2.4,2.4,'S');
  nfPdfImg(doc,SC_BRAND.logoNqas,20,17,15); nfPdfImg(doc,SC_BRAND.logoHealsol,W-20,19.5,9,true);
  doc.setFont(F,'bold'); doc.setFontSize(25); doc.setTextColor.apply(doc,TEAL); doc.text(nfCertTitle(g),cx,44,{align:'center',charSpace:1});
  doc.setFont(F,'normal'); doc.setFontSize(13); doc.setTextColor(180,83,9); doc.text(g!=='Completion'?'with '+g:'NQAS | FAST readiness programme',cx,52,{align:'center'});
  doc.setFontSize(9.5); doc.setTextColor.apply(doc,GREY); doc.text('This is to certify that',cx,61,{align:'center'});
  doc.setFont(F,'bold'); doc.setFontSize(25); doc.setTextColor.apply(doc,INK); doc.text(T(r.name),cx,72,{align:'center'});
  doc.setFont(F,'normal'); doc.setFontSize(10.5); doc.setTextColor(61,75,73);
  var fl=T(r.role+' · '+r.facilityName+' ('+r.code+')'+(r.district?' · '+[r.district,r.state].filter(Boolean).join(', '):'')), fw=doc.getTextWidth(fl), tw=nfPdfProTagWidth(doc,r.tier);
  doc.setFont(F,'normal'); doc.setFontSize(10.5); doc.setTextColor(61,75,73); doc.text(fl,cx-(fw+tw+3)/2,80);
  nfPdfProTag(doc,r.tier,cx-(fw+tw+3)/2+fw+3,76.9);
  doc.setFont(F,'normal'); doc.setFontSize(9.5); doc.setTextColor(61,75,73);
  var tx=nfCertText(r), bx=nfCertBoxes(r);
  doc.text(doc.splitTextToSize(T(tx),190),cx,88,{align:'center'});
  // scores
  var boxes=[['FACILITY SCORE',r.facPct+'%',r.facBase!=null?'Baseline '+r.facBase+'% · '+(r.facPct-r.facBase>=0?'+':'')+(r.facPct-r.facBase):''],[bx.staff,r.staffPct+'%',r.staffBase!=null?'Baseline '+r.staffBase+'% · '+(r.staffPct-r.staffBase>=0?'+':'')+(r.staffPct-r.staffBase):''],[bx.third,bx.val,bx.sub]];
  var bw=44, gap=6, bx=cx-(bw*3+gap*2)/2, by=101;
  boxes.forEach(function(b,i){ var x=bx+i*(bw+gap); doc.setDrawColor(221,230,228); doc.setLineWidth(0.3); doc.roundedRect(x,by,bw,23,2.5,2.5,'S');
    doc.setFont(F,'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc,GREY); doc.text(b[0],x+bw/2,by+5.5,{align:'center',charSpace:0.3});
    doc.setFont(F,'bold'); doc.setFontSize(17); doc.setTextColor.apply(doc,TEAL); doc.text(b[1],x+bw/2,by+14,{align:'center'});
    if(b[2]){ doc.setFont(F,'normal'); doc.setFontSize(7.5); doc.setTextColor(21,128,61); doc.text(b[2],x+bw/2,by+19.5,{align:'center'}); } });
  // seal
  var sc=g==='Distinction'?[183,121,31]:g==='Merit'?[71,85,105]:TEAL, sx=46, sy=113, rr=17;
  doc.setFillColor(255,255,255); doc.setDrawColor.apply(doc,sc); doc.setLineWidth(0.8); doc.circle(sx,sy,rr+2,'S'); doc.setFillColor.apply(doc,sc); doc.circle(sx,sy,rr,'F');
  doc.setTextColor(255,255,255); doc.setFont(F,'bold'); doc.setFontSize(g==='Distinction'?9.5:11); doc.text(g.toUpperCase(),sx,sy-1,{align:'center',charSpace:0.4});
  doc.setFont(F,'normal'); doc.setFontSize(7); doc.text(r.facPct+'% · NQAS | FAST',sx,sy+4.5,{align:'center'});
  // QR
  try{ var q=qrcode(0,'M'); q.addData(r.verifyUrl||r.certId); q.make(); var n=q.getModuleCount(), qs=30, cell=qs/n, qx=W-46-qs/2+8, qy=96; doc.setFillColor(19,32,31);
    for(var y=0;y<n;y++) for(var x=0;x<n;x++) if(q.isDark(y,x)) doc.rect(qx+x*cell,qy+y*cell,cell+0.02,cell+0.02,'F');
    doc.setFont(F,'normal'); doc.setFontSize(6.5); doc.setTextColor.apply(doc,GREY); doc.text('Scan to verify',qx+qs/2,qy+qs+3.5,{align:'center'}); }catch(e){}
  // signatures
  var S=r.signers||[], sw=62, sg=14, sx0=cx-(S.length*sw+(S.length-1)*sg)/2, syy=160, signed=nfCertDate(r.issuedAt);
  S.forEach(function(s,i){ var x=sx0+i*(sw+sg), mid=x+sw/2;
    try{ doc.setFont('Sign','normal'); doc.setFontSize(21); doc.setTextColor(30,58,138); doc.text(T(s.name),mid,syy,{align:'center'}); }catch(e){}
    doc.setDrawColor(148,163,184); doc.setLineWidth(0.3); doc.line(x,syy+2.5,x+sw,syy+2.5);
    doc.setFont(F,'bold'); doc.setFontSize(8.5); doc.setTextColor.apply(doc,INK); doc.text(T(s.name),mid,syy+7,{align:'center'});
    doc.setFont(F,'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc,GREY);
    doc.text(doc.splitTextToSize(T(s.role+(s.title&&s.title!==s.role?' · '+s.title:'')),sw)[0],mid,syy+10.8,{align:'center'});
    doc.text('Digitally signed · '+signed,mid,syy+14.3,{align:'center'}); });
  doc.setFont(F,'normal'); doc.setFontSize(7.5); doc.setTextColor.apply(doc,GREY);
  doc.text('Certificate No. '+r.certId+' · Issued '+signed,20,190); doc.text('Verify: '+String(r.verifyUrl||'').replace(/^https:\/\/(www\.)?/,''),W-20,190,{align:'right'});
  doc.setProperties({title:'NQAS | FAST certificate '+r.certId,subject:r.name+' — '+r.grade,author:'HealSol Academy'});
  return doc;
}
function nfPdfProTagWidth(doc,tier){ if(!tier) return 0; doc.setFont(doc._nfFont,'bold'); doc.setFontSize(7); return doc.getTextWidth('PRO')+doc.getTextWidth(tier)+6.4; }
function nfCertFileName(r){ return 'NQAS-FAST-Certificate-'+String(r.certId||'').replace(/[^A-Za-z0-9-]+/g,'-')+'-'+String(r.name||'').replace(/[^A-Za-z0-9]+/g,'-').slice(0,30)+'.pdf'; }
async function nfCertDownload(r,btn){
  if(!r) return; var old=btn?btn.innerHTML:''; if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
  try{ var doc=await nfCertPdf(r); nfDoneToast(await nfSaveDoc(doc,nfCertFileName(r))); }
  catch(e){ console.warn('[SC] certificate pdf',e); showToast(e&&e.message==='load'?'Could not load the PDF tool — check the internet connection.':'Could not make the PDF.','err'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } }
}
async function nfCertShare(r,btn){
  if(!r) return; var text=nfCertShareText(r), old=btn?btn.innerHTML:'';
  try{
    if(navigator.share&&navigator.canShare){ if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
      var doc=await nfCertPdf(r), file=new File([doc.output('blob')],nfCertFileName(r),{type:'application/pdf'});
      if(navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:'NQAS | FAST certificate',text:text}); return; } }
  }catch(e){ if(e&&e.name==='AbortError') return; }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } }
  window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener');
}
// ── public Verify page: <app address>?cert=NQF-SC-2026-00001 ──
async function nfVerifyBoot(){
  var id=''; try{ id=(new URLSearchParams(location.search).get('cert')||'').trim().toUpperCase(); }catch(e){}
  if(!id) return false;
  nfSignFont();
  var pg=document.createElement('div'); pg.id='nf-verify';
  pg.innerHTML='<div class="nfv-top"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div><div class="nfv-st" style="background:#fff;">Checking certificate '+scEsc(id)+'…</div>';
  document.body.appendChild(pg);
  var rec=null;
  if(/^NQF-[A-Z]+-\d{4}-\d{5}$/.test(id)){ try{ if(typeof db==='undefined'||!db) initFirebase(); }catch(e){}
    for(var i=0;i<50&&(typeof db==='undefined'||!db);i++) await new Promise(function(r){ setTimeout(r,100); });
    rec=await fbGet('sc_cert_public/'+id); }
  var home=NF_APP_HOME;
  pg.innerHTML='<div class="nfv-top"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div>'
    +(rec?'<div class="nfv-st ok"><i class="ti ti-shield-check"></i><div><b>Genuine certificate</b><small>Issued by HealSol Academy on '+scEsc(nfCertDate(rec.issuedAt))+' to '+scEsc(rec.name)+' — '+scEsc(rec.grade)+', facility score '+rec.facPct+'%. Certificate No. '+scEsc(rec.certId)+'.</small></div></div>'
      +'<div class="nfv-c">'+nfCertHTML(rec)+'</div>'
      :'<div class="nfv-st no"><i class="ti ti-alert-triangle"></i><div><b>Certificate not found</b><small>No NQAS | FAST certificate has the number “'+scEsc(id)+'”. Check the number, or contact HealSol Academy.</small></div></div>')
    +'<div class="nfv-foot">NQAS | FAST · by HealSol Academy · <a href="'+scEsc(home)+'" target="_blank" rel="noopener" onclick="return nfOpenOut(this.href)">Open NQAS | FAST</a></div>';
  return true;
}
// ── HealSol Setup: who signs for HealSol Academy ──
// one HealSol signatory per facility type (HealSol 21 Oct): Sub-Centre = coordName / coordTitle (as before), others under byType/{type};
// a type left blank uses the Sub-Centre name. The other signatories are taken from the records when the certificate is issued.
async function nfEnsureCertSetup(){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nf-certset')) return;
  var c=document.createElement('div'); c.id='nf-certset'; c.className='nf-certset'; c.dataset.nfv='setup';
  var T=Object.keys(NF_LEVELS);
  c.innerHTML='<h3><i class="ti ti-certificate"></i> Certificate signatory</h3><p>HealSol Academy signs every new certificate. Set one name for each facility type (left blank: the Sub-Centre name is used). Certificates already issued keep the names they were signed with.</p>'
    +'<div class="nf-cs-grid"><b>Facility type</b><b>Name</b><b>Title</b><b>Signs next to (taken automatically)</b>'
    +T.map(function(t){ var L=NF_LEVELS[t]; return '<span class="nf-cs-t">'+scEsc(L.plural)+'</span><input id="nf-cs-name-'+t+'" placeholder="'+(t==='sc'?'e.g. Meera Kapoor':'Same as Sub-Centres')+'" maxlength="60"><input id="nf-cs-title-'+t+'" placeholder="Programme Coordinator" maxlength="60">'
      +'<small>'+(t==='sc'?'Quality Mentor (the Supervisor) · Quality Champion':scEsc(L.inChargeLabel)+' · Quality Mentor (the Supervisor)')+'</small>'; }).join('')+'</div>'
    +'<div class="row" style="justify-content:flex-end"><button type="button" onclick="nfSaveCertSetup(this)">Save</button></div>'
    +'<details class="nf-cs-how"><summary>How the other signatures come on the certificate</summary><p>They are automatic. When a certificate is issued the app takes each name from the records: the Supervisor who looks after the facility, the Quality Champion from the Champion allotted to it, and for UPHC · PHC · CHC the in-charge from the facility\'s staff list (never the person receiving the certificate). Each name is printed in a signature-style font with “Digitally signed · date”, and the QR code on the certificate proves it is genuine. Nobody uploads a signature image; if a person is missing (for example no Supervisor yet), that box is left out.</p></details>';
  main.appendChild(c);
  var cfg=await fbGet('shared/sc_cert_config')||{}, set=function(id,v){ var el=document.getElementById(id); if(el) el.value=v||''; };
  set('nf-cs-name-sc',cfg.coordName); set('nf-cs-title-sc',cfg.coordTitle);
  T.forEach(function(t){ if(t==='sc') return; var b=(cfg.byType||{})[t]||{}; set('nf-cs-name-'+t,b.name); set('nf-cs-title-'+t,b.title); });
}
async function nfSaveCertSetup(btn){
  var g=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); }, n=g('nf-cs-name-sc');
  if(!n){ showToast('Enter the name that signs Sub-Centre certificates (used for any type left blank).','err'); return; }
  var up={coordName:n,coordTitle:g('nf-cs-title-sc')||'Programme Coordinator',updatedAt:scNowIso()};
  Object.keys(NF_LEVELS).forEach(function(t){ if(t==='sc') return; var nm=g('nf-cs-name-'+t); up['byType/'+t]=nm?{name:nm,title:g('nf-cs-title-'+t)||'Programme Coordinator'}:null; });
  btn.disabled=true; var ok=false; try{ await db.ref('shared/sc_cert_config').update(up); ok=true; }catch(e){} btn.disabled=false;
  showToast(ok?'Saved — new certificates will be signed by these names.':'Could not save — check the connection.',ok?'ok':'err');
}
// ── Mentor / HealSol: certificate chip on the facility's staff list ──
async function nfDrillCertChips(code){
  var sc=document.getElementById('sc-drill-staff'); if(!sc) return; var certs=await fbGet('sc_certs/'+code)||{};
  sc.querySelectorAll('[data-mob]').forEach(function(row){ var c=certs[row.getAttribute('data-mob')]; if(!c||row.querySelector('.nfc-chip')) return;
    var nm=row.querySelector('div[style*="font-weight:800"]'); if(nm) nm.insertAdjacentHTML('beforeend','<span class="nfc-chip" title="'+scEsc(c.certId)+'">🎓 '+scEsc(c.grade)+' · '+c.facPct+'%</span>'); });
}
(function(){
  var oMe=nfRenderMe;
  nfRenderMe=function(){ var r=oMe.apply(this,arguments); try{ nfCertPaintMe(); nfCertLoad().then(function(){ nfCertPaintMe(); }); }catch(e){} return r; };
  var oApply=nfAdminApply;
  nfAdminApply=function(){ try{ nfEnsureCertSetup(); }catch(e){} return oApply.apply(this,arguments); };
  var oDrill=scDrillIn;
  scDrillIn=async function(code){ var r=await oDrill.apply(this,arguments); try{ await nfDrillCertChips(code); }catch(e){} return r; };
  var go=function(){ nfVerifyBoot(); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else setTimeout(go,0);
})();
