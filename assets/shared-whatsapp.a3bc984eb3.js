
// ══════════════════════════════════════════════════════════════
// WHATSAPP
//  1. "Need help? Chat with us" for staff (Me page), Quality Champions, Supervisors and District Admins (side menu),
//     and "Trouble logging in? WhatsApp us" on the login screen. The message says who is asking.
//  2. One-tap WhatsApp messages for HealSol: enquiries, payment due, payment received (receipt), not moving.
//     The message opens in WhatsApp ready to send; HealSol taps Send. (Automatic messages via the WhatsApp
//     Business Platform can be added later in a server function — same wording becomes the templates.)
//  Settings (HealSol → Setup → WhatsApp support): shared/sc_support_config {waNumber, hours, upi, payLink} — public read.
// ══════════════════════════════════════════════════════════════
var NF_WA_ICON='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.3-1.7-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.6.6-.9 1.4-.9 2.2.1.9.4 1.8 1 2.6 1.1 1.6 2.5 2.9 4.2 3.7.5.2.9.4 1.4.5.6.2 1.2.2 1.7.1.6-.1 1.1-.5 1.4-1 .2-.4.2-.8.1-1.2l-.4-.2z"/></svg>';
var _nfSup={cfg:null,loaded:false};
function nfWaNum(m){ var d=String(m||'').replace(/\D/g,''); if(d.length===10) d='91'+d; else if(d.length===11&&d.charAt(0)==='0') d='91'+d.slice(1); return d.length>=11?d:''; }
function nfWaUrl(mob,text){ var n=nfWaNum(mob); return 'https://wa.me/'+(n||'')+'?text='+encodeURIComponent(text||''); }
function nfWaOpen(mob,text){ var a=document.createElement('a'); a.href=nfWaUrl(mob,text); a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove(); }
async function nfSupportLoad(force){
  if(_nfSup.loaded&&!force) return _nfSup.cfg;
  try{ if(typeof db==='undefined'||!db) initFirebase(); }catch(e){}
  for(var i=0;i<40&&(typeof db==='undefined'||!db);i++) await new Promise(function(r){ setTimeout(r,100); });
  var c=null; try{ c=await fbGet('shared/sc_support_config'); }catch(e){}
  _nfSup={cfg:c&&nfWaNum(c.waNumber)?c:null,loaded:true}; nfSupportApply(); return _nfSup.cfg;
}
function nfSupportOn(){ return !!(_nfSup.cfg&&nfWaNum(_nfSup.cfg.waNumber)); }
function nfSupportHours(){ return (_nfSup.cfg&&_nfSup.cfg.hours)||''; }
// who is asking — built from whoever is logged in
function nfSupportText(where){
  var L=['Hello HealSol Academy, I need help with NQAS | FAST.'];
  try{
    if(where==='login'){ var id=((document.getElementById('nf-id')||{}).value||'').trim(); L=['Hello HealSol Academy, I need help logging in to NQAS | FAST.','My mobile number / ID: '+(id||'')]; }
    else if(appMode==='cho'&&typeof choState!=='undefined'&&choState){ var f=choState.facility||{}, d=null; try{ d=scb1TodayIdx(); }catch(e){}
      L.push('Name: '+(choState.staffName||'')+' · Role: '+(choState.roleId||'CHO')); L.push('Facility: '+(f.name||'')+' ('+(choState.facilityCode||'')+')'+(d!=null&&d>=0?' · Day '+(d+1):'')); L.push('Mobile: '+(choState.staffMobile||'')); }
    else if(typeof _scq!=='undefined'&&_scq&&_scq.me&&document.body.classList.contains('nf-champ')){ L.push('Name: '+(_scq.me.name||'')+' · Role: Quality Champion'); L.push('Mobile: '+(_scq.me.id||'')); }
    else if(typeof nfAdminRole==='function'&&nfAdminRole()&&nfAdminRole()!=='admin'){ var s=(typeof _scSup!=='undefined'&&_scSup)||{};
      L.push('Name: '+(s.name||'')+' · Role: '+(nfAdminRole()==='district'?'District Admin':'Supervisor')+' · ID: '+(s.id||'')); L.push('Facilities: '+((s.facilities||[]).length)); }
  }catch(e){}
  L.push(''); L.push('My question: ');
  return L.join('\n');
}
function nfOpenSupport(where){ if(!nfSupportOn()){ showToast('WhatsApp support is not set up yet — please contact HealSol Academy.','err'); return; } nfWaOpen(_nfSup.cfg.waNumber,nfSupportText(where)); }
function nfHelpCardHTML(){
  if(!nfSupportOn()) return ''; var hi=_appLang==='hi', h=nfSupportHours();
  return '<div class="nf-help" id="nf-help"><span>'+NF_WA_ICON+'</span><div><b>'+(hi?'मदद चाहिए?':'Need help?')+'</b><small>'+(hi?'तुरंत सहायता के लिए WhatsApp पर बात करें':'Chat with us on WhatsApp for quick support')+(h?' · '+scEsc(h):'')+'</small></div>'
    +'<button type="button" class="nf-wa-btn" onclick="nfOpenSupport(\'me\')">'+NF_WA_ICON+(hi?'संपर्क करें':'Contact us')+'</button></div>';
}
function nfSupportApply(){
  // login screen link
  try{ var lead=document.querySelector('.nf-l-body button[onclick="phcOpenLeadModal()"]'), ex=document.getElementById('nf-l-wa');
    if(lead&&!ex&&nfSupportOn()){ var b=document.createElement('button'); b.type='button'; b.id='nf-l-wa'; b.className='nf-l-plain nf-l-wa'; b.onclick=function(){ nfOpenSupport('login'); };
      b.innerHTML=NF_WA_ICON+' '+(_appLang==='hi'?'लॉग इन में समस्या? WhatsApp करें':'Trouble logging in? WhatsApp us'); lead.parentNode.insertBefore(b,lead.nextSibling); }
    if(ex&&!nfSupportOn()) ex.remove();
    else if(ex) ex.innerHTML=NF_WA_ICON+' '+(_appLang==='hi'?'लॉग इन में समस्या? WhatsApp करें':'Trouble logging in? WhatsApp us'); }catch(e){}
  // staff Me page
  try{ var me=document.getElementById('nf-me'); if(me&&!document.getElementById('nf-help')&&nfSupportOn()){ var rows=me.querySelector('.nf-card.nf-rows'); if(rows){ var w=document.createElement('div'); w.innerHTML=nfHelpCardHTML(); rows.parentNode.insertBefore(w.firstChild,rows); } } }catch(e){}
}
// ── HealSol: one-tap messages ──
function nfWaPayInfo(){ var c=_nfSup.cfg||{}, a=[]; if(c.upi) a.push('UPI: '+c.upi); if(c.payLink) a.push('Payment link: '+c.payLink); return a.join('\n'); }
function nfChoOf(f){ var st=(f&&f.staff)||{}, m=Object.keys(st).find(function(k){ return st[k]&&!st[k].disabled&&(st[k].role||'CHO')==='CHO'; }); return m?{mob:m,name:st[m].name||''}:{mob:(f&&f.contactMobile)||'',name:(f&&f.choName)||''}; }
function nfWaMsg(kind,code,extra){
  var f=(scMasterFacilities||{})[code]||{}, cho=nfChoOf(f), nm=f.name||code, first=String(cho.name||'').split(' ')[0];
  var price=null; try{ price=nfPriceFor(f.progId); }catch(e){}
  if(kind==='due') return {mob:cho.mob,text:'Namaste'+(first?' '+first:'')+' ji,\nThe free 7-day Baseline for '+nm+' ('+code+') has ended. To continue the 60-day NQAS | FAST programme, please complete the payment'+(price?' of '+nfMoney(price*1.18)+' ('+nfMoney(price)+' + 18% GST)':'')+' — open the app and tap "Pay & Unlock".'+(nfWaPayInfo()?'\nYou can also pay here:\n'+nfWaPayInfo()+'\nand reply with the payment reference.':'')+'\n\nNeed help? Just reply here.\n— HealSol Academy'};
  if(kind==='paid'){ var lp=extra||f.lastPayment||{}; return {mob:cho.mob,text:'Namaste'+(first?' '+first:'')+' ji,\nWe have received your payment'+(lp.amount||lp.total?' of '+nfMoney(lp.amount||lp.total):'')+' for '+nm+' ('+code+')'+(lp.receiptNo?'. Receipt: '+lp.receiptNo:'')+'.\nYour NQAS | FAST programme is unlocked — open the app to continue. The receipt is in the app under Me → Payment receipts.\n\nThank you!\n— HealSol Academy'}; }
  if(kind==='idle'){ var d=null; try{ d=nfDayOf(f); }catch(e){} return {mob:cho.mob,text:'Namaste'+(first?' '+first:'')+' ji,\nWe noticed no cards have been saved at '+nm+' ('+code+') for '+((extra&&extra.idle)||'some')+' days.'+(d?' Today is Day '+d+' of 60.':'')+' Please open NQAS | FAST and continue today\'s card with your team.\n\nNeed help? Just reply here.\n— HealSol Academy'}; }
  return {mob:cho.mob,text:'Namaste'+(first?' '+first:'')+' ji,\nThis is HealSol Academy about NQAS | FAST for '+nm+' ('+code+').\n'};
}
function nfWaSend(kind,code,extra){ var m=nfWaMsg(kind,code,extra); if(!nfWaNum(m.mob)){ showToast('No mobile number for this facility\'s CHO.','err'); return; } nfWaOpen(m.mob,m.text); }
function nfWaLead(id){
  var x=((typeof _phcLeadsCache!=='undefined'&&_phcLeadsCache)||{})[id]||((_nfBiz&&_nfBiz.leads)||{})[id]||{}; if(!nfWaNum(x.mobile)){ showToast('This enquiry has no valid mobile number.','err'); return; }
  var first=String(x.contactName||'').replace(/^(dr\.?|mr\.?|ms\.?|mrs\.?)\s+/i,'').split(' ')[0];
  nfWaOpen(x.mobile,'Namaste'+(first?' '+first:'')+' ji,\nThank you for your enquiry about NQAS | FAST'+(x.orgName?' for '+x.orgName:'')+(x.facilityCount?' (~'+x.facilityCount+' facilities)':'')+'. I am from HealSol Academy.\nWhen would be a good time to talk about the programme and the next steps?\n\n— HealSol Academy');
}
function nfWaBtn(onclick,label,cls){ return '<button type="button" class="nf-wa-btn '+(cls||'sm')+'" onclick="event.stopPropagation();'+onclick+'" title="'+scEsc(label||'WhatsApp')+'">'+NF_WA_ICON+(label?scEsc(label):'')+'</button>'; }
// ── HealSol Setup: WhatsApp support settings ──
async function nfEnsureSupportSetup(){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main||document.getElementById('nf-supset')) return;
  var c=document.createElement('div'); c.id='nf-supset'; c.className='nf-supset'; c.dataset.nfv='setup';
  c.innerHTML='<h3>'+NF_WA_ICON.replace('<svg','<svg style="width:18px;height:18px;color:#15803D"')+' WhatsApp support</h3><p>The number staff, Champions, Supervisors and District Admins reach from "Need help? Chat with us" and the login screen. UPI and payment link are added to payment reminders you send from the app (optional).</p>'
    +'<div class="row"><label>WhatsApp number<input id="nf-sup-num" inputmode="tel" placeholder="e.g. 98765 43210" maxlength="16"></label><label>Support hours (shown to users)<input id="nf-sup-hrs" placeholder="Mon–Sat, 10 am – 6 pm" maxlength="40"></label></div>'
    +'<div class="row" style="margin-top:8px;"><label>UPI ID for payments (optional)<input id="nf-sup-upi" placeholder="healsol@bank" maxlength="60"></label><label>Payment link (optional)<input id="nf-sup-link" placeholder="https://rzp.io/…" maxlength="120"></label><button type="button" onclick="nfSaveSupportSetup(this)">Save</button></div>';
  main.appendChild(c);
  var cfg=await fbGet('shared/sc_support_config')||{}; var set=function(id,v){ var e=document.getElementById(id); if(e) e.value=v||''; };
  set('nf-sup-num',cfg.waNumber); set('nf-sup-hrs',cfg.hours); set('nf-sup-upi',cfg.upi); set('nf-sup-link',cfg.payLink);
}
async function nfSaveSupportSetup(btn){
  var g=function(id){ return (document.getElementById(id).value||'').trim(); }, n=g('nf-sup-num'), link=g('nf-sup-link');
  if(n&&!nfWaNum(n)){ showToast('Enter a valid WhatsApp number (10 digits, or with country code).','err'); return; }
  if(link&&!/^https:\/\//.test(link)){ showToast('The payment link must start with https://','err'); return; }
  btn.disabled=true; var ok=await fbSet('shared/sc_support_config',{waNumber:n?nfWaNum(n):'',hours:g('nf-sup-hrs'),upi:g('nf-sup-upi'),payLink:link,updatedAt:scNowIso()}); btn.disabled=false;
  if(ok){ await nfSupportLoad(true); showToast(n?'Saved — "Need help?" now opens WhatsApp '+nfWaNum(n)+'.':'Saved — WhatsApp help is switched off.','ok'); } else showToast('Could not save — check the connection.','err');
}
(function(){
  // side menus: Supervisors, District Admins, Quality Champions (not HealSol)
  var oShell=nfShellHTML;
  nfShellHTML=function(items,user){ try{ if(nfSupportOn()&&user&&user.role!=='Administrator'&&!items.some(function(i){ return i.v==='help'; })) items=items.concat([{v:'help',l:'Help on WhatsApp',icon:'ti-message',onclick:"nfOpenSupport('menu')"}]); }catch(e){} return oShell.call(this,items,user); };
  var oMe=nfRenderMe; nfRenderMe=function(){ var r=oMe.apply(this,arguments); try{ nfSupportApply(); }catch(e){} return r; };
  var oPaint=nfPaint; nfPaint=function(){ var r=oPaint.apply(this,arguments); try{ nfSupportApply(); }catch(e){} return r; };
  var oApply=nfAdminApply; nfAdminApply=function(){ try{ nfEnsureSupportSetup(); }catch(e){} return oApply.apply(this,arguments); };
  // receipt shown to HealSol (after Confirm Payment, or from a list): send it to the CHO on WhatsApp
  var oRc=nfShowReceipt; nfShowReceipt=function(r){ var out=oRc.apply(this,arguments);
    try{ if(appMode==='sc-admin'&&r&&nfWaNum(r.choMobile)){ var acts=document.querySelector('#nf-rcpt-ov .nf-tmp-acts'); if(acts&&!acts.querySelector('.nf-wa-btn')){ var w=document.createElement('div'); w.innerHTML=nfWaBtn('',' Send to CHO','');
      var b=w.firstChild; b.onclick=function(){ var m=nfWaMsg('paid',r.code,r); nfWaOpen(r.choMobile,m.text); }; acts.insertBefore(b,acts.firstChild); } } }catch(e){}
    return out; };
  var go=function(){ nfSupportLoad(); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else setTimeout(go,0);
})();
