
// ══════════════════════════════════════════════════════════════
// PAYMENTS (secure mode): Razorpay checkout for the CHO, verified on the server; receipts; HealSol manual payments
//  Price = package price (Setup → Subscription pricing) + 18% GST, worked out on the server.
// ══════════════════════════════════════════════════════════════
var NF_GST=0.18;
function nfMoney(n){ n=Number(n)||0; var r=Math.round(n*100)/100, s=r.toFixed(2).split('.'); var i=s[0], last=i.slice(-3), rest=i.slice(0,-3); if(rest) last=','+last; return '₹'+rest.replace(/\B(?=(\d{2})+(?!\d))/g,',')+last+(s[1]==='00'?'':'.'+s[1]); }
function nfWithGst(base){ var b=Math.round(Number(base)*100), g=Math.round(b*NF_GST); return {base:b/100,gst:g/100,total:(b+g)/100}; }
function nfIsChoNow(){ return appMode==='cho'&&(choState.roleId||'CHO')==='CHO'; }

// receipt (payment receipt, not a tax invoice)
function nfReceiptHTML(r){
  var row=function(k,v){ return v?'<tr><td>'+scEsc(k)+'</td><td>'+scEsc(v)+'</td></tr>':''; };
  var d=r.paidAt?new Date(r.paidAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'';
  return '<div class="nf-rcpt" id="nf-rcpt-doc"><div class="nf-rcpt-top"><div><b>HealSol Academy</b><small>NQAS | FAST'+nfProBadge({subscriptionStatus:'paid',progId:r.package||r.packageLabel||''})+'</small></div><div class="nf-rcpt-t">PAYMENT RECEIPT<small>'+scEsc(r.receiptNo||'')+'</small></div></div>'
    +'<table class="nf-rcpt-kv">'+row('Date',d)+row('Facility',(r.facilityName||'')+' ('+(r.code||'')+')')+row('District / State',[r.district,r.state].filter(Boolean).join(', '))+row('CHO',[r.choName,r.choMobile].filter(Boolean).join(' · '))+'</table>'
    +'<table class="nf-rcpt-amt"><tr><th>Description</th><th>Amount</th></tr>'
    +'<tr><td>NQAS | FAST subscription — '+scEsc(r.packageLabel||r.package||'')+'</td><td>'+nfMoney(r.base)+'</td></tr>'
    +'<tr><td>GST @ '+(r.gstRate||18)+'%</td><td>'+nfMoney(r.gst)+'</td></tr>'
    +'<tr class="tot"><td>Total paid</td><td>'+nfMoney(r.total)+'</td></tr></table>'
    +'<table class="nf-rcpt-kv">'+row('Paid by',r.method||'')+row(r.paymentId?'Razorpay payment ID':'Payment reference',r.paymentId||r.reference||'')+'</table>'
    +'<div class="nf-rcpt-note">This is a payment receipt, not a tax invoice. Keep it for your records.</div></div>';
}
function nfShowReceipt(r){
  var old=document.getElementById('nf-rcpt-ov'); if(old) old.remove();
  var ov=document.createElement('div'); ov.className='scx-ov open'; ov.id='nf-rcpt-ov';
  ov.innerHTML='<div class="scx-box nf-rcpt-box">'+nfReceiptHTML(r)
    +'<div class="nf-tmp-acts"><button class="scx-btn ghost" id="nf-rcpt-dl">Download PDF</button><button class="scx-btn ghost" id="nf-rcpt-print">Print</button><button class="scx-btn" id="nf-rcpt-close">Done</button></div></div>';
  document.body.appendChild(ov);
  ov.querySelector('#nf-rcpt-close').onclick=function(){ ov.remove(); };
  ov.querySelector('#nf-rcpt-print').onclick=function(){
    // only the receipt is printed; the screen-protection page is skipped for this one print
    var done=function(){ window._nfAllowPrint=false; document.body.classList.remove('nf-printing-rcpt'); window.removeEventListener('afterprint',done); };
    window._nfAllowPrint=true; document.body.classList.add('nf-printing-rcpt'); window.addEventListener('afterprint',done);
    setTimeout(function(){ try{ window.print(); }catch(e){ done(); } },50);
    setTimeout(done,120000);
  };
  ov.querySelector('#nf-rcpt-dl').onclick=function(){ nfDownloadReceiptPdf(r,this); };
}
async function nfOpenReceipts(code){
  code=code||choState.facilityCode; var list=null;
  try{ list=await fbGet('sc_payments/'+code); }catch(e){}
  var recs=Object.values(list||{}).sort(function(a,b){ return String(b.paidAt).localeCompare(String(a.paidAt)); });
  if(!recs.length){ showToast('No payments recorded yet.',''); return; }
  if(recs.length===1) return nfShowReceipt(recs[0]);
  var ov=document.createElement('div'); ov.className='scx-ov open'; window.__nfRecs=recs;
  ov.innerHTML='<div class="scx-box"><div class="nfcf-head"><span style="font-size:20px;">🧾</span><b style="flex:1;">Payment receipts</b></div>'
    +recs.map(function(r,i){ return '<button type="button" class="nf-rcpt-li" onclick="this.closest(\'.scx-ov\').remove();nfShowReceipt(window.__nfRecs['+i+'])"><b>'+scEsc(r.receiptNo)+'</b><span>'+nfMoney(r.total)+' · '+scEsc(String(r.paidAt||'').slice(0,10))+'</span></button>'; }).join('')
    +'<div class="nf-tmp-acts"><button class="scx-btn" onclick="this.closest(\'.scx-ov\').remove()">Close</button></div></div>';
  document.body.appendChild(ov);
}

(function(){
  if(typeof NF_SECURE==='undefined'||!NF_SECURE) return;

  // the pay card: package price + GST = total; only the CHO can pay
  updateUpgradeTotal=function(){
    var base=Object.values(_upgradeSelected).reduce(function(a,b){ return a+b; },0), n=Object.keys(_upgradeSelected).length, g=nfWithGst(base);
    var totalEl=document.getElementById('upgrade-total');
    if(totalEl) totalEl.innerHTML=n?'<span class="nf-gst-break">'+nfMoney(g.base)+' + GST 18% '+nfMoney(g.gst)+'</span> '+nfMoney(g.total):'₹0';
    var payBtn=document.getElementById('upgrade-pay-btn'); if(!payBtn) return;
    if(!n){ payBtn.disabled=true; payBtn.innerHTML='<i class="ti ti-credit-card"></i> Contact HealSol to subscribe'; payBtn.onclick=null; return; }
    if(!nfIsChoNow()){ payBtn.disabled=true; payBtn.innerHTML='<i class="ti ti-lock"></i> Ask your CHO to subscribe'; payBtn.onclick=null; return; }
    payBtn.disabled=false; payBtn.innerHTML='<i class="ti ti-credit-card"></i> Pay '+nfMoney(g.total)+' & Unlock';
    payBtn.onclick=function(){ phcStartCheckout(Object.keys(_upgradeSelected),g.total); };
  };

  phcStartCheckout=async function(){
    if(!nfIsChoNow()){ showToast('Only the CHO can pay for the subscription.','err'); return; }
    if(typeof Razorpay==='undefined'){ showToast('The payment window could not load — check your internet connection.','err'); return; }
    var btn=document.getElementById('upgrade-pay-btn'), label=btn?btn.innerHTML:''; if(btn){ btn.disabled=true; btn.textContent='Preparing payment…'; }
    var o;
    try{ o=await nfCall('createPaymentOrder',{code:choState.facilityCode}); }
    catch(e){ showToast(nfErrText(e),'err'); if(btn){ btn.disabled=false; btn.innerHTML=label; } return; }
    if(btn){ btn.disabled=false; btn.innerHTML=label; }
    var rzp=new Razorpay({
      key:o.keyId, order_id:o.orderId, amount:o.amount, currency:o.currency||'INR',
      name:'HealSol Academy', description:'NQAS | FAST — '+(o.packageLabel||'subscription')+' (incl. 18% GST)',
      prefill:{name:(o.prefill||{}).name||'',contact:(o.prefill||{}).contact||''}, notes:{facility:choState.facilityCode},
      theme:{color:'#1E6B5E'},
      handler:async function(resp){
        showToast('Payment received — confirming…','');
        try{
          var v=await nfCall('verifyPayment',{orderId:resp.razorpay_order_id,paymentId:resp.razorpay_payment_id,signature:resp.razorpay_signature});
          choState.facility=Object.assign(choState.facility||{},{subscriptionStatus:'paid',lastPayment:{amount:v.receipt.total,receiptNo:v.receipt.receiptNo}});
          showToast('Payment successful — your programme is unlocked.','ok');
          try{ if(typeof renderCard==='function'&&choState.currentDay) renderCard(choState.currentDay-1); }catch(e){}
          nfShowReceipt(v.receipt);
        }catch(e){
          scAlert('Your payment ('+resp.razorpay_payment_id+') was received. It will be confirmed automatically within a few minutes — reopen the app shortly. If it is still locked after an hour, send this payment ID to HealSol Academy.','Payment received','⏳');
        }
      },
      modal:{ondismiss:function(){}}
    });
    rzp.on&&rzp.on('payment.failed',function(r){ showToast('Payment failed'+(r&&r.error&&r.error.description?': '+r.error.description:'')+'. No money was taken — you can try again.','err'); });
    rzp.open();
  };

  // CHO: Me page → Payment receipts (when paid)
  if(typeof nfRenderMe==='function'){ var oMe=nfRenderMe; nfRenderMe=function(){ var r=oMe.apply(this,arguments);
    try{ if(nfIsChoNow()&&(choState.facility||{}).subscriptionStatus==='paid'){ var rows=document.querySelector('#nf-me .nf-rows');
      if(rows&&!document.getElementById('nf-me-rcpt')){ var b=document.createElement('button'); b.type='button'; b.className='nf-row'; b.id='nf-me-rcpt'; b.onclick=function(){ nfOpenReceipts(); };
        b.innerHTML='<i class="ti ti-file-text"></i><span>'+scEsc(t('Payment receipts'))+'</span><i class="ti ti-chevron-right"></i>'; rows.appendChild(b); } } }catch(e){}
    return r; }; }

  // HealSol: Confirm Payment → payment link / UPI / bank transfer, recorded on the server with its reference
  openDemoConvertModal=async function(code){
    var fac=scMasterFacilities[code]||{}, cfg=await phcLoadPricing(), it=cfg.items.find(function(x){ return x.id===fac.progId; });
    var g=nfWithGst(it&&it.price!=null?it.price:0), body=document.getElementById('demo-convert-body'), paid=fac.subscriptionStatus==='paid';
    body.innerHTML='<div style="font-size:12px;color:var(--t3);margin-bottom:12px;"><strong>'+scEsc(fac.name||code)+'</strong> ('+scEsc(code)+') · '+scEsc(_SC_PKG_LABELS[fac.progId]||fac.progId)
      +(it&&it.price!=null?'<br>Price '+nfMoney(g.base)+' + GST 18% '+nfMoney(g.gst)+' = <b>'+nfMoney(g.total)+'</b>':'')+(paid?'<br><b style="color:#15803D;">Already paid</b> — receipts are listed below.':'')+'</div>'
      +(paid?'<button class="scx-btn ghost" style="width:100%;margin-bottom:12px;" onclick="nfOpenReceipts(\''+code+'\')"><i class="ti ti-file-text"></i> View receipts</button>':'')
      +'<label class="nf-mp-l">Amount received (incl. GST) ₹</label><input id="nf-mp-total" type="number" min="1" step="0.01" class="nf-mp-i" value="'+(g.total||'')+'">'
      +'<label class="nf-mp-l">Paid by</label><select id="nf-mp-method" class="nf-mp-i"><option>Payment link</option><option>UPI</option><option>Bank transfer</option><option>Cheque</option><option>Other</option></select>'
      +'<label class="nf-mp-l">Reference (Razorpay payment ID, UPI reference or bank UTR)</label><input id="nf-mp-ref" class="nf-mp-i" placeholder="e.g. pay_N3x… or 4278…">'
      +'<label class="nf-mp-l">Payment date</label><input id="nf-mp-date" type="date" class="nf-mp-i" value="'+scTodayStr()+'">'
      +'<div class="nf-mp-err" id="nf-mp-err"></div>'
      +'<button class="fc-add-btn" id="demo-convert-confirm-btn" style="width:100%;padding:12px;border-radius:10px;font-size:13px;"><i class="ti ti-check"></i> Record payment & unlock</button>';
    document.getElementById('demo-convert-confirm-btn').onclick=function(){ nfRecordManualPayment(code); };
    document.getElementById('demo-convert-overlay').classList.add('open');
  };
  window.nfRecordManualPayment=async function(code){
    var v=function(id){ return ((document.getElementById(id)||{}).value||'').trim(); }, err=document.getElementById('nf-mp-err'), btn=document.getElementById('demo-convert-confirm-btn');
    var show=function(m){ if(err){ err.textContent=m; err.style.display=m?'block':'none'; } };
    if(!(Number(v('nf-mp-total'))>0)) return show('Enter the amount received.');
    if(!v('nf-mp-ref')) return show('Enter the payment reference — it appears on the receipt and in the report.');
    show(''); if(btn){ btn.disabled=true; btn.textContent='Recording…'; }
    try{
      var r=await nfCall('confirmManualPayment',{code:code,total:Number(v('nf-mp-total')),method:v('nf-mp-method'),reference:v('nf-mp-ref'),paidOn:v('nf-mp-date')});
      var f=scMasterFacilities[code]||{}; f.subscriptionStatus='paid'; f.lastPayment={amount:r.receipt.total,receiptNo:r.receipt.receiptNo,id:r.receipt.reference,at:r.receipt.paidAt,confirmedBy:'admin'};
      closeDemoConvertModal(); try{ renderDemoFacilitiesPanel(); scRenderMasterDashboard(); }catch(e){}
      showToast('Payment recorded — '+r.receipt.receiptNo,'ok'); nfShowReceipt(r.receipt);
    }catch(e){ show(nfErrText(e)); }
    finally{ if(btn){ btn.disabled=false; btn.innerHTML='<i class="ti ti-check"></i> Record payment & unlock'; } }
  };
  try{ if(typeof HINDI_UI==='object') Object.assign(HINDI_UI,{'Payment receipts':'भुगतान रसीदें'}); }catch(e){}
})();
