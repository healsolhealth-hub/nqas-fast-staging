
// ══════════════════════════════════════════════════════════════
// PDF FILES (jsPDF + AutoTable, loaded from a CDN on first use) — receipt PDF and the business report PDF.
//  Poppins with the ₹ sign is embedded (NF_PDF_FONT_R/B); if that ever fails, amounts fall back to "Rs.".
// ══════════════════════════════════════════════════════════════
var NF_PDF_URLS=[
  ['https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js','https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js','https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js'],
  ['https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js','https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js','https://unpkg.com/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js']];
// ── saving files: normal browsers download directly; in-app web views (One HealSol app) get a one-time link that
//    opens in the phone's browser, because those views ignore downloads (server: prepareDownload / fileDownload)
function nfInWebView(){ if(window.NF_FORCE_WEBVIEW) return true; var ua=navigator.userAgent||'';
  return /; wv\)/.test(ua)||(/(iPhone|iPad|iPod)/.test(ua)&&!/Safari\//.test(ua)); }
async function nfBlobB64(blob){
  if(blob&&blob.arrayBuffer){ var u=new Uint8Array(await blob.arrayBuffer()), out='', CH=0x8000; for(var i=0;i<u.length;i+=CH) out+=String.fromCharCode.apply(null,u.subarray(i,i+CH)); return btoa(out); }
  return new Promise(function(res,rej){ var fr=new FileReader(); fr.onload=function(){ res(String(fr.result).split(',')[1]||''); }; fr.onerror=rej; fr.readAsDataURL(blob); }); }
async function nfSaveBlob(blob,name){
  var b64=await nfBlobB64(blob), r=await nfCall('prepareDownload',{name:name,b64:b64});
  var old=document.getElementById('nf-dl-ov'); if(old) old.remove();
  var hi=typeof _appLang!=='undefined'&&_appLang==='hi', isRpt=/\.html$/i.test(name), ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-dl-ov';
  ov.innerHTML='<div class="scx-box" style="max-width:380px;text-align:center;"><div style="font-size:34px;">📄</div>'
    +'<div style="font-size:16px;font-weight:700;margin:6px 0 4px;">'+(hi?'आपकी फ़ाइल तैयार है':'Your file is ready')+'</div>'
    +'<div style="font-size:12.5px;color:var(--t3,#64748B);word-break:break-all;margin-bottom:12px;">'+scEsc(name)+'</div>'
    +'<a class="scx-btn" id="nf-dl-go" href="'+scEsc(r.url)+'" target="_blank" rel="noopener" style="display:block;text-decoration:none;padding:12px;font-size:14px;">'+(isRpt?(hi?'📄 रिपोर्ट खोलें':'📄 Open report'):'⬇ '+(hi?'डाउनलोड करें':'Download'))+'</a>'
    +'<div style="font-size:11.5px;color:var(--t3,#64748B);margin:10px 0 4px;">'+(isRpt?(hi?'रिपोर्ट आपके फ़ोन के ब्राउज़र में खुलेगी। PDF के लिए 🖨 Print / Save as PDF दबाएँ और "Save as PDF" चुनें। लिंक 10 मिनट तक चलेगा।':'The report opens in your phone\'s browser. For a PDF, tap 🖨 Print / Save as PDF and choose "Save as PDF". The link works for 10 minutes.'):(hi?'यह आपके फ़ोन के ब्राउज़र में खुलेगा और Downloads में सेव होगा। लिंक 10 मिनट तक चलेगा।':'Opens in your phone\'s browser and saves to Downloads. The link works for 10 minutes.'))+'</div>'
    +'<button type="button" class="scx-btn ghost" id="nf-dl-close" style="margin-top:6px;">'+(hi?'बंद करें':'Close')+'</button></div>';
  document.body.appendChild(ov);
  ov.querySelector('#nf-dl-close').onclick=function(){ ov.remove(); };
  ov.querySelector('#nf-dl-go').addEventListener('click',function(){ setTimeout(function(){ if(document.body.contains(ov)) ov.remove(); },1500); });
  return 'link';
}
// Any "<a download href=blob:…>.click()" (CSV exports etc.) is ignored by the One HealSol web view — send it through the link instead.
(function(){
  var map={}, keys=[], oC=URL.createObjectURL;
  URL.createObjectURL=function(o){ var u=oC.apply(URL,arguments); try{ if(o&&typeof o.size==='number'){ map[u]=o; keys.push(u); if(keys.length>30) delete map[keys.shift()]; } }catch(e){} return u; };
  var oClick=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    try{ var b=map[this.href], n=this.getAttribute('download');
      if(b&&n&&nfInWebView()&&!/password/i.test(n)&&/\.(csv|pdf|xlsx)$/i.test(n)){ nfSaveBlob(b,n).catch(function(){ showToast('Could not prepare the file — check connection.','err'); }); return; } }catch(e){}
    return oClick.apply(this,arguments);
  };
})();
async function nfSaveDoc(doc,name){ if(nfInWebView()) return nfSaveBlob(doc.output('blob'),name); doc.save(name); return 'browser'; }
async function nfSaveWb(X,wb,name){ if(nfInWebView()){ var a=X.write(wb,{bookType:'xlsx',type:'array'}); return nfSaveBlob(new Blob([a],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),name); } X.writeFile(wb,name); return 'browser'; }
function nfDoneToast(how){ if(how==='browser') showToast(typeof _appLang!=='undefined'&&_appLang==='hi'?'डाउनलोड शुरू — अपना Downloads फ़ोल्डर देखें।':'Download started — check your Downloads folder.','ok'); }
function nfLoadScriptAny(urls,ready){
  return new Promise(function(res,rej){ var i=0;
    (function next(){ if(ready()) return res(); if(i>=urls.length) return rej(new Error('load'));
      var s=document.createElement('script'); s.src=urls[i++]; s.onload=function(){ ready()?res():next(); }; s.onerror=next; document.head.appendChild(s); })(); });
}
function nfLoadPdf(){
  var J=function(){ return window.jspdf&&window.jspdf.jsPDF; };
  return nfLoadScript('pdf-fonts').catch(function(){}).then(function(){ return nfLoadScriptAny(NF_PDF_URLS[0],J); })
    .then(function(){ return nfLoadScriptAny(NF_PDF_URLS[1],function(){ return !!(J()&&J().API&&typeof J().API.autoTable==='function'); }); })
    .then(function(){ return J(); });
}
function nfPdfNew(J,orient){
  var doc=new J({orientation:orient||'p',unit:'mm',format:'a4',compress:true});
  try{ doc.addFileToVFS('Poppins-R.ttf',NF_PDF_FONT_R); doc.addFont('Poppins-R.ttf','Poppins','normal');
    doc.addFileToVFS('Poppins-B.ttf',NF_PDF_FONT_B); doc.addFont('Poppins-B.ttf','Poppins','bold'); doc.setFont('Poppins','normal'); doc._nfFont='Poppins'; }
  catch(e){ doc._nfFont='helvetica'; doc.setFont('helvetica','normal'); }
  return doc;
}
function nfPdfMoney(doc,n){ var s=nfMoney(n); return doc&&doc._nfFont==='Poppins'?s:s.replace('₹','Rs. '); }
function nfPdfTxt(doc,s){ s=String(s==null?'':s); return doc&&doc._nfFont==='Poppins'?s:s.replace(/₹/g,'Rs. '); }
function nfPdfImg(doc,src,x,y,h,alignRight){
  try{ var p=doc.getImageProperties(src), w=p.width/p.height*h; doc.addImage(src,/png/i.test(src.slice(0,30))?'PNG':'JPEG',alignRight?x-w:x,y,w,h); return w; }catch(e){ return 0; }
}
// PRO tag drawn in a PDF: teal "PRO" + light "12A"; returns its width
function nfPdfProTag(doc,tier,x,y){
  if(!tier) return 0; var F=doc._nfFont, h=4.4; doc.setFont(F,'bold'); doc.setFontSize(7);
  var w1=doc.getTextWidth('PRO')+3.2, w2=doc.getTextWidth(tier)+3.2;
  doc.setDrawColor(19,90,85); doc.setLineWidth(0.25); doc.setFillColor(230,242,240); doc.roundedRect(x,y,w1+w2,h,1,1,'FD');
  doc.setFillColor(19,90,85); doc.roundedRect(x,y,w1,h,1,1,'F'); doc.rect(x+w1-1,y,1,h,'F');
  doc.setTextColor(255,255,255); doc.text('PRO',x+1.6,y+3.1); doc.setTextColor(19,90,85); doc.text(tier,x+w1+1.6,y+3.1);
  return w1+w2;
}
// ── receipt as a PDF file ──
async function nfReceiptPdf(r){
  var J=await nfLoadPdf(), doc=nfPdfNew(J,'p'), F=doc._nfFont, M=function(n){ return nfPdfMoney(doc,n); }, T=function(s){ return nfPdfTxt(doc,s); };
  var L=18, R=192, y=18, TEAL=[19,90,85], GREY=[100,116,139], INK=[15,23,42];
  var lw=nfPdfImg(doc,SC_BRAND.logoHealsol,L,y-1.5,7.5);   // the logo is the "HealSol Academy" wordmark
  if(!lw){ doc.setFont(F,'bold'); doc.setFontSize(15); doc.setTextColor.apply(doc,TEAL); doc.text('HealSol Academy',L,y+4.5); }
  doc.setFont(F,'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc,GREY); doc.text('NQAS | FAST',L,y+10);
  nfPdfProTag(doc,nfProTier({subscriptionStatus:'paid',progId:r.package||r.packageLabel||''}),L+doc.getTextWidth('NQAS | FAST')+3,y+7.1);
  doc.setFont(F,'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc,TEAL); doc.text('PAYMENT RECEIPT',R,y+4,{align:'right'});
  doc.setFontSize(10); doc.setTextColor.apply(doc,GREY); doc.text(T(r.receiptNo||''),R,y+9.5,{align:'right'});
  y+=15; doc.setDrawColor.apply(doc,TEAL); doc.setLineWidth(0.7); doc.line(L,y,R,y); y+=8;
  var d=r.paidAt?new Date(r.paidAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';
  var kv=function(k,v){ doc.setFont(F,'normal'); doc.setFontSize(10); doc.setTextColor.apply(doc,GREY); doc.text(k,L,y);
    doc.setTextColor.apply(doc,INK); var lines=doc.splitTextToSize(T(v||'—'),R-L-62); doc.text(lines,L+62,y); y+=6.2*Math.max(1,lines.length); };
  kv('Date',d); kv('Facility',(r.facilityName||'')+' ('+(r.code||'')+')'); kv('District / State',[r.district,r.state].filter(Boolean).join(', ')); kv('CHO',[r.choName,r.choMobile].filter(Boolean).join(' · '));
  y+=2;
  doc.autoTable({startY:y,margin:{left:L,right:210-R},theme:'plain',
    head:[['Description','Amount']],
    body:[[T('NQAS | FAST subscription — '+(r.packageLabel||r.package||'')),M(r.base)],['GST @ '+(r.gstRate||18)+'%',M(r.gst)]],
    foot:[['Total paid',M(r.total)]],
    styles:{font:F,fontSize:10,textColor:INK,cellPadding:{top:2.6,bottom:2.6,left:0,right:0}},
    headStyles:{font:F,fontStyle:'bold',fontSize:8.5,textColor:GREY,lineWidth:{bottom:0.2},lineColor:[226,232,240]},
    bodyStyles:{lineWidth:{bottom:0.2},lineColor:[241,245,249]},
    footStyles:{font:F,fontStyle:'bold',fontSize:12,textColor:INK,lineWidth:{bottom:0.7},lineColor:TEAL},
    columnStyles:{1:{halign:'right',cellWidth:40}},
    didParseCell:function(h){ if(h.column.index===1&&h.section!=='body') h.cell.styles.halign='right'; }});
  y=doc.lastAutoTable.finalY+8;
  kv('Paid by',r.method||''); kv(r.paymentId?'Razorpay payment ID':'Payment reference',r.paymentId||r.reference||'');
  y+=4; doc.setFontSize(8.5); doc.setTextColor.apply(doc,GREY); doc.text('This is a payment receipt, not a tax invoice. Keep it for your records.',L,y);
  doc.setFontSize(7.5); doc.text('NQAS | FAST · by HealSol Academy · generated '+new Date().toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}),L,287);
  return doc;
}
async function nfDownloadReceiptPdf(r,btn){
  var old=btn?btn.innerHTML:''; if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
  try{ var doc=await nfReceiptPdf(r); nfDoneToast(await nfSaveDoc(doc,'Receipt-'+String(r.receiptNo||'').replace(/[^A-Za-z0-9-]+/g,'-')+'.pdf')); }
  catch(e){ console.warn('[SC] receipt pdf',e); showToast(e&&e.message==='load'?'Could not load the PDF tool — check the internet connection, or use Print.':'Could not make the PDF — use Print.','err'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } }
}
