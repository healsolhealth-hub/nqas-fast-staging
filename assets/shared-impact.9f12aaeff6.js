
// ══════════════════════════════════════════════════════════════
// SOCIAL IMPACT (levels and stars are worked out on the server every night — functions/impact.js)
//  sc_impact/{mob or supervisor id}: {level, stars, pts, nextAt, nums, pop, facilities, hist, publicId}
//  Card: a 1080×1350 picture made on the phone (canvas) — name, level, stars, 3 numbers, "Ensuring quality of care
//  for N people", QR (Verify page ?impact=ID) and the partner strip (shared/sc_impact_partners, set by HealSol).
// ══════════════════════════════════════════════════════════════
var NF_LEVEL={starter:{en:'Quality Starter',hi:'क्वालिटी स्टार्टर',ic:'🌱',n:1},practitioner:{en:'Quality Practitioner',hi:'क्वालिटी प्रैक्टिशनर',ic:'✅',n:2},
  achiever:{en:'Quality Achiever',hi:'क्वालिटी अचीवर',ic:'🏅',n:3},champion:{en:'Quality Champion',hi:'क्वालिटी चैंपियन',ic:'🤝',n:4},
  leader:{en:'Quality Leader',hi:'क्वालिटी लीडर',ic:'🧭',n:5},pioneer:{en:'Quality Pioneer',hi:'क्वालिटी पायनियर',ic:'🌟',n:6}};
// Leaders / Pioneers: numbers on the card only when HealSol switches them on
function nfImpNoNums(rec){ return !!rec&&(rec.kind==='mentor'||rec.kind==='honorary')&&(!rec.showNums||!(rec.nums&&rec.nums.facilities)); }
// what earns the next level (shown under "My impact")
function nfImpNextHint(rec){ var hi=nfImpHi(), l=rec&&rec.level, c=rec&&rec.champion;
  if(l==='starter') return hi?'अगला स्तर: ✅ क्वालिटी प्रैक्टिशनर — जब आपका केंद्र NQAS तैयार हो।':'Next level: ✅ Quality Practitioner — when your facility is NQAS Ready.';
  if(l==='practitioner') return hi?'अगला स्तर: 🏅 क्वालिटी अचीवर — जब आपका केंद्र NHSRC प्रमाणित हो।':'Next level: 🏅 Quality Achiever — when your facility is NHSRC certified.';
  if(l==='achiever'&&rec.kind==='staff') return c?(hi?'अगला स्तर: 🤝 क्वालिटी चैंपियन — दूसरे केंद्रों के कार्ड जाँचते रहें (पिछले 90 दिनों में)।':'Next level: 🤝 Quality Champion — keep checking other facilities\' cards (in the last 90 days).')
    :(hi?'अगला स्तर: 🤝 क्वालिटी चैंपियन — HealSol / पर्यवेक्षक से क्वालिटी चैंपियन बनकर दूसरे केंद्रों की मदद करें।':'Next level: 🤝 Quality Champion — become a Quality Champion and help other facilities to be NQAS Ready.');
  return ''; }
var NF_IMP_VERIFY=(typeof NF_CERT_VERIFY_BASE!=='undefined'&&NF_CERT_VERIFY_BASE)||'https://www.thehealsol.com/nqas-fast-sc-certificate';   // same Verify page as certificates (Wix page that shows this app)
var _nfImp={rec:null,key:'',at:0,cfg:null,partners:null};
function nfImpHi(){ return typeof _appLang!=='undefined'&&_appLang==='hi'; }
function nfImpLv(l){ var x=NF_LEVEL[l]; return x?(nfImpHi()?x.hi:x.en):''; }
function nfImpStarParts(n){ n=+n||0; var f=Math.floor(n), h=n-f>=0.5?1:0; return {f:f,h:h,e:Math.max(0,5-f-h)}; }
function nfImpStars(n,plain){ if(!n) return ''; var p=nfImpStarParts(n);
  if(plain) return '★'.repeat(p.f)+(p.h?'½':'')+'☆'.repeat(p.e);
  return '<span class="nfi-st" role="img" aria-label="'+n+' / 5">'+'★'.repeat(p.f)+(p.h?'<b class="nfi-half">★</b>':'')+'<i>'+'★'.repeat(p.e)+'</i></span>'; }
function nfImpTagHTML(t){ if(!t||!t.level) return ''; return ' <span class="nfi-tag" title="'+scEsc(nfImpLv(t.level))+'">'+(t.stars?nfImpStars(t.stars,true).replace(/☆/g,''):NF_LEVEL[t.level].ic)+'</span>'; }
function nfImpSlug(x){ return String(x||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
async function nfImpCfg(){ if(_nfImp.cfg&&_nfImp.partners) return; try{ _nfImp.cfg=await fbGet('shared/sc_impact_config')||{}; _nfImp.partners=await fbGet('shared/sc_impact_partners')||{}; }catch(e){ _nfImp.cfg=_nfImp.cfg||{}; _nfImp.partners=_nfImp.partners||{}; } }
async function nfImpLoad(key,force){ if(!key) return null; if(!force&&_nfImp.key===key&&Date.now()-_nfImp.at<120000) return _nfImp.rec;
  var r=null; try{ r=await fbGet('sc_impact/'+key); }catch(e){} _nfImp={rec:r,key:key,at:Date.now(),cfg:_nfImp.cfg,partners:_nfImp.partners,logos:_nfImp.logos}; if(r&&r.level) nfImpPrepare(r); return r; }
function nfImpVerifyUrl(rec){ var b=(_nfImp.cfg&&_nfImp.cfg.verifyBase)||NF_IMP_VERIFY; return b+(b.indexOf('?')>=0?'&':'?')+'cert=IMP-'+encodeURIComponent(rec.publicId||''); }   // carried in ?cert= so the certificate page passes it on
function nfImpMain(rec){ return (rec.facilities||[])[0]||{}; }
function nfImpReady(rec){ return (rec.facilities||[]).some(function(f){ return f.result==='ready'||f.cert; }); }
function nfImpCare(rec,villages){ var hi=nfImpHi(), n=rec.pop||0; if(!n) return '';
  var many=(rec.facilities||[]).length>1, num=Number(n).toLocaleString('en-IN'), ok=nfImpReady(rec);
  if(hi) return (many?(rec.facilities.length+' केंद्रों के '):(villages?villages+' गाँवों के ':''))+num+' लोगों के लिए गुणवत्तापूर्ण देखभाल सुनिश्चित'+(ok?'':' करने की ओर');
  return (ok?'Ensuring':'Working to ensure')+' quality of care for '+num+' people'+(many?' across '+rec.facilities.length+' facilities':(villages?' · '+villages+' villages':''));
}
function nfImpNums(rec){ var hi=nfImpHi(), n=rec.nums||{};
  if(rec.kind==='staff') return [[n.fixed||0,hi?'कमियाँ सुधारीं':'items fixed'],[n.onTime||0,hi?'कार्ड समय पर':'cards on time'],['+'+(n.gain||0),hi?'अंक सुधार':'points better']];
  if(rec.kind==='champion') return [[n.facilities||0,hi?'केंद्रों की मदद':'facilities helped'],[n.verified||0,hi?'कार्ड जाँचे':'cards checked'],[n.ready||0,hi?'NQAS तैयार':'NQAS Ready']];
  return [[n.facilities||0,hi?'केंद्रों का मार्गदर्शन':'facilities mentored'],[n.ready||0,hi?'NQAS तैयार':'NQAS Ready'],['+'+(n.gain||0),hi?'औसत सुधार':'average gain']];
}
function nfImpNameChoice(){ try{ return localStorage.getItem('nfi_name')||'full'; }catch(e){ return 'full'; } }
function nfImpShownName(rec){ var n=String(rec.name||'').trim(); if(nfImpNameChoice()!=='first') return n; return n.split(/\s+/)[0]; }
function nfImpVillages(rec){ try{ if(rec.kind==='staff'&&(rec.facilities||[]).length===1){ var f=(typeof choState!=='undefined'&&choState.facility&&choState.facilityCode===rec.facilities[0].code)?choState.facility:null; return f&&f.population&&f.population.villages||null; } }catch(e){} return null; }
// ── the card (picture) ──
function nfImpLoadImg(src){ return new Promise(function(res){ if(!src) return res(null); var i=new Image(); i.onload=function(){ res(i); }; i.onerror=function(){ res(null); }; i.src=src; }); }
function nfImpPartnersFor(rec){ var P=_nfImp.partners||{}, m=nfImpMain(rec), ds=nfImpSlug(m.state)+'__'+nfImpSlug(m.district);
  var L=((P.district||{})[ds])||((P.state||{})[nfImpSlug(m.state)])||[]; if(!Array.isArray(L)) L=Object.keys(L).map(function(k){ return L[k]; }); return L.filter(function(x){ return x&&x.img&&x.on!==false; }).slice(0,2); }
async function nfImpCanvas(rec){
  await nfImpCfg(); var hi=nfImpHi(), W=1080, H=1350, c=document.createElement('canvas'); c.width=W; c.height=H; var g=c.getContext('2d'); if(!g) return null;
  var F='"Poppins","Noto Sans Devanagari","Mangal",sans-serif';
  var grd=g.createLinearGradient(0,0,W,H); grd.addColorStop(0,'#0F5F56'); grd.addColorStop(1,'#134E4A'); g.fillStyle=grd; g.fillRect(0,0,W,H);
  g.fillStyle='#fff'; g.fillRect(0,0,W,150);
  var l1=await nfImpLoadImg(SC_BRAND.logoNqas), l2=await nfImpLoadImg(SC_BRAND.logoHealsol);
  if(l1) g.drawImage(l1,50,35,80*l1.width/l1.height,80); if(l2) g.drawImage(l2,W-50-60*l2.width/l2.height,45,60*l2.width/l2.height,60);
  g.textAlign='center'; g.fillStyle='#fff';
  var lv=NF_LEVEL[rec.level]||{}; g.font='600 40px '+F; g.fillStyle='#A7F3D0'; g.fillText((hi?'सामाजिक प्रभाव':'SOCIAL IMPACT')+' · NQAS | FAST',W/2,230);
  g.font='700 76px '+F; g.fillStyle='#fff'; var nm=nfImpShownName(rec); while(g.measureText(nm).width>W-120&&nm.length>4) nm=nm.slice(0,-1); g.fillText(nm,W/2,330);
  g.font='600 44px '+F; g.fillStyle='#E2E8F0'; g.fillText((rec.role||'')+(nfImpMain(rec).name&&!nfImpHideFac(rec)&&!nfImpNoNums(rec)&&(rec.facilities||[]).length===1?' · '+nfImpMain(rec).name:''),W/2,395);
  g.font='700 58px '+F; g.fillStyle='#FDE68A'; g.fillText((lv.ic||'')+' '+nfImpLv(rec.level),W/2,500);
  if(rec.stars){ g.font='700 92px '+F; var sp=nfImpStarParts(rec.stars), sw=g.measureText('★').width, tot=sw*5, x0=W/2-tot/2; g.textAlign='left';
    for(var si=0;si<5;si++){ var xx=x0+si*sw; g.fillStyle='rgba(255,255,255,.25)'; g.fillText('★',xx,610);
      if(si<sp.f){ g.fillStyle='#FBBF24'; g.fillText('★',xx,610); } else if(si===sp.f&&sp.h){ g.save(); g.beginPath(); g.rect(xx,500,sw/2,140); g.clip(); g.fillStyle='#FBBF24'; g.fillText('★',xx,610); g.restore(); } }
    g.textAlign='center'; }
  var why=nfImpWhy(rec); if(why&&rec.stars){ g.font='500 32px '+F; g.fillStyle='#CCFBF1'; g.fillText(why,W/2,662); }
  var noNums=nfImpNoNums(rec);
  if(rec.level==='pioneer'&&rec.citation){ g.font='italic 500 '+(noNums?40:34)+'px '+F; g.fillStyle='#FDE68A'; nfImpWrap(g,'“'+rec.citation+'”',W/2,noNums?640:565,W-160,noNums?54:42); }
  if(noNums){ var ms=nfImpMain(rec), yr=rec.pioneerYear||String(rec.leaderSince||rec.levelSince||'').slice(0,4), st0=rec.state||ms.state||'', pl=[(typeof nfrStateCode==='function'&&nfrStateCode(st0)?nfrStateName(nfrStateCode(st0)):st0),yr].filter(Boolean).join(' · '), y0=rec.level==='pioneer'&&rec.citation?820:720;
    if(pl){ g.font='500 40px '+F; g.fillStyle='#CCFBF1'; g.fillText(pl,W/2,y0); }
    g.font='600 36px '+F; g.fillStyle='#A7F3D0'; g.fillText(hi?'हेल्सोल अकादमी द्वारा सम्मानित':'Recognised by HealSol Academy',W/2,y0+(pl?62:0)); }
  var N=noNums?[]:nfImpNums(rec), bw=300, gap=30, bx=(W-3*bw-2*gap)/2, by=690;
  N.forEach(function(x,i){ var X=bx+i*(bw+gap); g.fillStyle='rgba(255,255,255,.12)'; nfImpRound(g,X,by,bw,170,28); g.fill(); g.fillStyle='#fff'; g.font='700 76px '+F; g.fillText(typeof x[0]==='number'?x[0].toLocaleString('en-IN'):String(x[0]),X+bw/2,by+95); g.font='500 32px '+F; g.fillStyle='#CCFBF1'; g.fillText(x[1],X+bw/2,by+145); });
  var care=noNums?'':nfImpCare(rec,nfImpVillages(rec)); if(care){ g.font='600 40px '+F; g.fillStyle='#fff'; g.font='600 36px '+F; nfImpWrap(g,care,W/2,930,W-140,46); }
  // QR + verify note
  var url=nfImpVerifyUrl(rec), qy=1035, qs=170; try{ var q=qrcode(0,'M'); q.addData(url); q.make(); var n=q.getModuleCount(), cell=qs/n; g.fillStyle='#fff'; nfImpRound(g,60,qy,qs+24,qs+24,14); g.fill(); g.fillStyle='#0F172A';
    for(var r=0;r<n;r++) for(var k=0;k<n;k++) if(q.isDark(r,k)) g.fillRect(72+k*cell,qy+12+r*cell,Math.ceil(cell),Math.ceil(cell)); }catch(e){}
  g.textAlign='left'; g.font='600 32px '+F; g.fillStyle='#fff'; g.fillText(hi?'स्कैन करें — असली कार्ड की जाँच':'Scan to verify this card',270,qy+60);
  g.font='400 28px '+F; g.fillStyle='#CCFBF1'; g.fillText((hi?'अपडेट ':'Updated ')+scFmtDate(String(rec.updatedAt||scNowIso()).slice(0,10))+' · HealSol Academy',270,qy+105);
  // partner strip
  var PL=nfImpPartnersFor(rec); g.fillStyle='#fff'; g.fillRect(0,H-120,W,120); g.fillStyle='#475569'; g.font='500 28px '+F;
  if(PL.length){ g.fillText(hi?'सहयोग से':'In partnership with',50,H-50); var x=330; for(var i=0;i<PL.length;i++){ var im=await nfImpLoadImg(PL[i].img); if(im){ var w=70*im.width/im.height; g.drawImage(im,x,H-95,Math.min(w,300),70); x+=Math.min(w,300)+40; } } }
  else { g.fillText('NQAS | FAST · '+(hi?'हेल्सोल अकादमी द्वारा':'by HealSol Academy'),50,H-50); }
  g.textAlign='center'; return c;
}
function nfImpHideFac(rec){ var m=nfImpMain(rec), h=(_nfImp.cfg&&_nfImp.cfg.hideFacility)||{}; return !!h[nfImpSlug(m.state)]; }
function nfImpRound(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function nfImpWrap(g,t,x,y,max,lh){ var w=t.split(' '), line='', yy=y; w.forEach(function(word){ var test=line?line+' '+word:word; if(g.measureText(test).width>max&&line){ g.fillText(line,x,yy); line=word; yy+=lh; } else line=test; }); if(line) g.fillText(line,x,yy); }
async function nfImpBlob(rec){ var c=await nfImpCanvas(rec); if(!c) return null; return await new Promise(function(r){ try{ c.toBlob(function(b){ r(b); },'image/jpeg',0.86); }catch(e){ r(null); } }); }
// ── why these stars (one line) and how stars work (tap the stars) ──
function nfImpWhy(rec){ var w=rec&&rec.why, hi=nfImpHi(); if(!w) return '';
  if(w.k==='bl') return hi?'बेसलाइन जारी है':'Baseline in progress';
  if(w.k==='pts') return hi?'कार्यक्रम के 100 में से '+(w.v||0)+' अंक':(w.v||0)+' of 100 programme points';
  if(w.k==='ready') return w.v!=null?(hi?'NQAS तैयार स्कोर '+w.v+'%':'NQAS Ready score '+w.v+'%'):(hi?'NQAS तैयार':'NQAS Ready');
  if(w.k==='nhsrc') return w.v!=null?(hi?'NHSRC स्कोर '+w.v+'%':'NHSRC score '+w.v+'%'):(hi?'NHSRC प्रमाणित':'NHSRC certified');
  if(w.k==='sup') return !w.v?(hi?'अभी 0 केंद्र — कार्यक्रम बंद होने पर केंद्र गिना जाता है':'0 facilities yet — a facility counts when its programme closes'):(hi?w.v+' केंद्रों को सहयोग':'Supported '+w.v+' facilit'+(w.v===1?'y':'ies'));
  return ''; }
function nfImpHowRows(level){ var hi=nfImpHi();
  if(level==='starter') return {t:hi?'स्टार्टर के सितारे':'Starter stars',p:hi?'अंक (100 में से): समय पर कार्यान्वयन कार्ड (दिन 8–49) 50 + अपनी बेसलाइन की कमियाँ सुधारीं 30 + पुनरावृत्ति / एंड-लाइन कार्ड (दिन 50–56) 20।':'Points out of 100: implementation cards on time (Days 8–49) 50 + your own baseline gaps fixed 30 + revision / end-line cards (Days 50–56) 20.',
    r:[[0.5,hi?'बेसलाइन जारी':'Baseline in progress'],[1,hi?'बेसलाइन पूरी':'Baseline done'],[2,hi?'30+ अंक':'30+ points'],[3,hi?'55+ अंक':'55+ points'],[4,hi?'75+ अंक':'75+ points'],[5,hi?'90+ अंक':'90+ points']]};
  if(level==='practitioner') return {t:hi?'प्रैक्टिशनर के सितारे':'Practitioner stars',p:hi?'आपके केंद्र का NQAS तैयार (ग्रेजुएशन) स्कोर।':'Your facility\'s NQAS Ready (graduation) score.',r:[[3,'70–74%'],[4,'75–79%'],[5,'80%+']]};
  if(level==='achiever') return {t:hi?'अचीवर के सितारे':'Achiever stars',p:hi?'आपके केंद्र का NHSRC प्रमाणन स्कोर।':'Your facility\'s NHSRC certification score.',r:[[4,'70–79%'],[5,'80%+']]};
  if(level==='champion') return {t:hi?'चैंपियन के सितारे':'Champion stars',p:hi?'एक केंद्र तब गिना जाता है जब उसका कार्यक्रम बंद हो और आपने उसके स्टाफ के पूरे किए कार्डों में से 80% या अधिक जाँचे हों (अपना केंद्र नहीं गिना जाता; केंद्र का स्कोर मायने नहीं रखता)।':'A facility counts when its programme has closed and you checked 80% or more of the cards its staff completed (your own facility does not count; the facility\'s score does not matter).',
    r:[[0.5,hi?'1–9 केंद्र':'1–9 facilities'],[1,'10–19'],[2,'20–29'],[3,'30–39'],[4,'40–49'],[5,'50+']]};
  return null; }
function nfImpHow(){ var rec=_nfImp.rec; if(!rec) return; var H=nfImpHowRows(rec.level), hi=nfImpHi(); if(!H) return;
  var cur=+rec.stars||0, ov=document.createElement('div'); ov.className='nfi-how';
  ov.innerHTML='<div role="dialog" aria-modal="true"><h3>'+(NF_LEVEL[rec.level]||{}).ic+' '+scEsc(H.t)+'</h3><p>'+scEsc(H.p)+'</p><table>'+H.r.map(function(x){ return '<tr class="'+(x[0]===cur?'me':'')+'"><td>'+(function(n){ var q=nfImpStarParts(n); return '★'.repeat(q.f)+(q.h?'<b class="nfi-half">★</b>':''); })(x[0])+'</td><td>'+scEsc(x[1])+(x[0]===cur?' ← '+(hi?'आप':'you'):'')+'</td></tr>'; }).join('')+'</table>'
    +(nfImpWhy(rec)?'<p><b>'+scEsc(hi?'अभी:':'Now:')+'</b> '+scEsc(nfImpWhy(rec))+'</p>':'')+'<p>'+scEsc(hi?'सितारे हर रात अपडेट होते हैं और कभी कम नहीं होते। नए स्तर पर सितारे फिर से शुरू होते हैं।':'Stars are updated every night and never go down. At a new level the stars start again.')+'</p>'
    +'<button type="button" onclick="this.closest(\'.nfi-how\').remove()">'+scEsc(hi?'ठीक है':'OK')+'</button></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); }); document.body.appendChild(ov); }
// ── captions (English / Hindi) ──
var NF_IMP_TAGS='#NQAS #QualityOfCare #HealSolAcademy #NQASFAST';
function nfImpTitled(rec){ return rec&&(rec.level==='leader'||rec.level==='pioneer'); }
function nfImpCaption(rec,ig){ var hi=nfImpHi(), lv=nfImpLv(rec.level), st=rec.stars?' '+nfImpStars(rec.stars,true):'', care=nfImpNoNums(rec)?'':(nfImpCare(rec,nfImpVillages(rec))||''), v=ig?(hi?' कार्ड पर QR स्कैन करके जाँचें।':' Scan the QR on the card to verify.'):'';
  if(nfImpTitled(rec)) return hi?'HealSol Academy द्वारा '+lv+' के रूप में सम्मानित होकर गौरवान्वित हूँ — सार्वजनिक स्वास्थ्य में गुणवत्तापूर्ण देखभाल के लिए।'+v+' '+NF_IMP_TAGS:'Honoured to be recognised as a '+lv+' by HealSol Academy for quality of care in public health.'+v+' '+NF_IMP_TAGS;
  return hi?'NQAS | FAST (HealSol Academy) के साथ मेरे NQAS सफ़र में मैं '+lv+st+' हूँ।'+(care?' '+care+'।':'')+v+' '+NF_IMP_TAGS:'I am a '+lv+st+' on my NQAS journey with NQAS | FAST by HealSol Academy.'+(care?' '+care+'.':'')+v+' '+NF_IMP_TAGS; }
function nfImpText(rec,url){ return nfImpCaption(rec,false)+'\n'+(url||nfImpVerifyUrl(rec)); }
function nfImpCopy(t){ try{ if(navigator.clipboard&&window.isSecureContext) navigator.clipboard.writeText(t).catch(function(){}); }catch(e){}
  try{ var ta=document.createElement('textarea'); ta.value=t; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:-1000px;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); }catch(e){} }
// ── the card picture on the server: made here, stored at sc_impact_img/{key}, shown at …/card?id= (link preview) ──
var NF_CARD_BASE='https://asia-south1-healsol-nqas.cloudfunctions.net/card';
function nfImpCardBase(){ return (_nfImp.cfg&&_nfImp.cfg.cardBase)||NF_CARD_BASE; }
function nfImpCardUrl(rec,extra){ return nfImpCardBase()+'?id='+encodeURIComponent(rec.publicId||'')+(nfImpHi()?'&l=hi':'')+(extra||''); }
function nfImpFresh(u){ return u+(u.indexOf('?')>=0?'&':'?')+'t='+Date.now().toString(36); }   // a fresh address each time, so the phone never shows an old copy
var _nfImpUrl={};   // key → card page address once the picture is on the server
async function nfImpPublish(rec){
  await nfImpCfg(); if(!rec||!rec.publicId||!rec.key) return null;
  var sig=[rec.level,rec.stars,rec.updatedAt,rec.name,nfImpNameChoice(),nfImpHi()?'hi':'en',rec.citation||'',rec.showNums?1:0].join('|'), lk='nfi_pub_'+rec.key, done='';
  try{ done=localStorage.getItem(lk)||''; }catch(e){}
  if(done!==sig){
    var c=await nfImpCanvas(rec); if(!c) return null; var d=c.toDataURL('image/jpeg',0.78).split(',')[1]; if(!d) return null;
    var ok=await fbSet('sc_impact_img/'+rec.key,{d:d,at:scNowIso(),sig:sig}); if(!ok) return null;
    try{ localStorage.setItem(lk,sig); }catch(e){}
  }
  return (_nfImpUrl[rec.key+'|'+sig]=nfImpCardUrl(rec)); }
function nfImpReadyUrl(rec){ var sig=[rec.level,rec.stars,rec.updatedAt,rec.name,nfImpNameChoice(),nfImpHi()?'hi':'en',rec.citation||'',rec.showNums?1:0].join('|'); return _nfImpUrl[rec.key+'|'+sig]||null; }
// prepare the picture in the background while "My impact" is on screen, so a tap opens the browser at once
function nfImpPrepare(rec){ if(!rec||!rec.publicId||nfImpReadyUrl(rec)||_nfImp.preparing) return; _nfImp.preparing=true;
  setTimeout(function(){ nfImpPublish(rec).catch(function(){}).then(function(){ _nfImp.preparing=false; }); },1200); }
// open in the phone's browser — a real link tap, never replacing the app page
function nfImpOpen(url){ var a=document.createElement('a'); a.href=url; a.target='_blank'; a.rel='noopener'; a.style.display='none'; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); },500); }
function nfImpBusy(btn,on,old){ if(!btn) return old; if(on){ var o=btn.innerHTML; btn.disabled=true; btn.textContent=nfImpHi()?'तैयार हो रहा है…':'Preparing…'; return o; } btn.disabled=false; btn.innerHTML=old; }
function nfImpEmbedded(){ try{ return window.self!==window.top; }catch(e){ return true; } }
// kind: wa | ig | li | save
async function nfImpGo(kind,btn){
  var rec=_nfImp.rec; if(!rec) return; var hi=nfImpHi();
  var target=function(url){ return kind==='li'?'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url):kind==='save'?nfImpFresh(url+'&img=1&dl=1'):nfImpFresh(url+'&own=1&'+(kind==='ig'?'ig=1':'wa=1')); };
  var tell=function(){ if(kind==='save') return; nfImpCopy(nfImpCaption(rec,kind==='ig'));
    showToast(kind==='li'?(hi?'कैप्शन कॉपी हो गया — LinkedIn में पेस्ट करें।':'Caption copied — paste it in LinkedIn.'):(hi?'खुले पेज पर "तस्वीर साझा करें" दबाएँ और '+(kind==='ig'?'Instagram':'WhatsApp')+' चुनें।':'On the page that opens, tap "Share picture" and choose '+(kind==='ig'?'Instagram':'WhatsApp')+'.'),'ok'); };
  if(kind==='save'&&!(('ontouchstart' in window)||navigator.maxTouchPoints>0)&&!nfImpEmbedded()){ var bl=await nfImpBlob(rec); if(bl){ nfImpDownload(bl); return; } }
  var ready=nfImpReadyUrl(rec); if(ready){ tell(); nfImpOpen(target(ready)); return; }
  var old=nfImpBusy(btn,true), url=null; try{ url=await nfImpPublish(rec); }catch(e){} nfImpBusy(btn,false,old);
  if(!url){ showToast(hi?'कार्ड तैयार नहीं हो सका — इंटरनेट जाँचें।':'Could not prepare the card — check the internet.','err'); return; }
  // the upload took a moment: ask for one more tap so the phone opens the browser (and never reloads the app)
  var ov=document.createElement('div'); ov.className='nfi-ov';
  ov.innerHTML='<div><div style="font-size:40px">✅</div><h2>'+scEsc(hi?'आपका कार्ड तैयार है':'Your card is ready')+'</h2><div class="nfi-btns"><button type="button" class="wa" id="nfi-go">'+scEsc(hi?'कार्ड खोलें':'Open card')+'</button><button type="button" class="sv" onclick="this.closest(\'.nfi-ov\').remove()">'+scEsc(hi?'बाद में':'Later')+'</button></div></div>';
  document.body.appendChild(ov); ov.querySelector('#nfi-go').onclick=function(){ tell(); nfImpOpen(target(url)); ov.remove(); }; }
function nfImpShare(btn){ return nfImpGo('wa',btn); }
function nfImpInstagram(btn){ return nfImpGo('ig',btn); }
function nfImpLinkedIn(btn){ return nfImpGo('li',btn); }
function nfImpSave(btn){ return nfImpGo('save',btn); }
function nfImpDownload(b){ var a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='nqas-fast-card.jpg'; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },1500); }
function nfImpBtnsHTML(rec){ var hi=nfImpHi();
  return '<div class="nfi-btns"><button type="button" class="wa" onclick="nfImpShare(this)">WhatsApp</button>'
    +(nfImpTitled(rec)?'<button type="button" class="li" onclick="nfImpLinkedIn(this)">LinkedIn</button>':'<button type="button" class="ig" onclick="nfImpInstagram(this)">Instagram</button>')
    +'<button type="button" class="sv" onclick="nfImpSave(this)">'+scEsc(hi?'तस्वीर सहेजें':'Save picture')+'</button></div>'; }
function nfImpSetName(v){ try{ localStorage.setItem('nfi_name',v); }catch(e){} }
// ── the "My impact" block ──
function nfImpCardHTML(rec,who){
  var hi=nfImpHi();
  if(!rec||!rec.level){ var msg=who==='staff'?(hi?'7 दिन की बेसलाइन पूरी करें और <b>🌱 क्वालिटी स्टार्टर</b> बनें। आपका प्रभाव हर रात अपडेट होता है।':'Complete your 7 baseline days to become a <b>🌱 Quality Starter</b>. Your impact is updated every night.')
      :who==='champion'?(hi?'<b>🤝 क्वालिटी चैंपियन</b> स्तर तब मिलता है जब आपका अपना केंद्र NHSRC प्रमाणित हो (क्वालिटी अचीवर) और आप दूसरे केंद्रों की मदद कर रहे हों।':'The <b>🤝 Quality Champion</b> level comes when your own facility is NHSRC certified (Quality Achiever) and you are helping other facilities.')
      :who==='mentor'?(hi?'<b>🧭 क्वालिटी लीडर</b> का खिताब HealSol आपके योगदान और लीडर मानदंडों के आधार पर देता है।':'The <b>🧭 Quality Leader</b> title is given by HealSol, based on your contribution and the Leader criteria.')
      :(hi?'आपका प्रभाव हर रात अपडेट होता है — कल फिर देखें।':'Your impact is updated every night — check again tomorrow.');
    return '<div class="nfi-card" id="nfi-card"><div class="lv">'+scEsc(hi?'मेरा प्रभाव':'MY IMPACT')+'</div><div class="nfi-empty">'+msg+'</div></div>'; }
  var lv=NF_LEVEL[rec.level]||{}, nn=nfImpNoNums(rec), N=nn?[]:nfImpNums(rec), care=nn?'':nfImpCare(rec,nfImpVillages(rec)), nm=nfImpNameChoice();
  var how=nfImpHowRows(rec.level), why=nfImpWhy(rec);
  var stars=rec.stars||how?(how?'<button type="button" class="nfi-starbtn" onclick="nfImpHow()" aria-label="'+scEsc(hi?'सितारे कैसे मिलते हैं':'How stars work')+'">'+(nfImpStars(rec.stars)||'<span class="nfi-st"><i>★★★★★</i></span>')+'<small>'+scEsc(hi?'कैसे?':'How?')+'</small></button>':nfImpStars(rec.stars)):'';
  var prog=rec.kind==='champion'&&(rec.progress||[]).length?'<div class="nfi-prog"><b>'+scEsc(hi?'चल रहे कार्यक्रम (80% कार्ड जाँचने हैं)':'Programmes running (check 80% of cards)')+'</b>'+rec.progress.map(function(x){ return scEsc(x.name)+' — '+(x.done!=null?(hi?x.done+' में से '+(x.chk||0)+' कार्ड ':(x.chk||0)+' of '+x.done+' cards '):'')+'('+x.pct+'%)'+(x.close?(hi?' · बंद ':' · closes ')+scEsc(scFmtDate(x.close)):''); }).join('<br>')+'</div>':'';
  var upd='<div class="nfi-upd2">'+scEsc(hi?'हर रात अपडेट होता है · पिछला अपडेट ':'Updated every night · last update ')+scEsc(scFmtDate(String(rec.updatedAt||'').slice(0,10)))+'</div>';
  return '<div class="nfi-card" id="nfi-card"><div class="lv">'+scEsc(hi?'मेरा प्रभाव':'MY IMPACT')+'</div><h3>'+(lv.ic||'')+' '+scEsc(nfImpLv(rec.level))+'</h3>'+stars+(why?'<div class="nfi-why">'+scEsc(why)+'</div>':'')
    +(nn&&rec.citation?'<div class="nfi-care">“'+scEsc(rec.citation)+'”</div>':'')+(nn?'':'<div class="nfi-nums">'+N.map(function(x){ return '<div><b>'+scEsc(typeof x[0]==='number'?x[0].toLocaleString('en-IN'):String(x[0]))+'</b><small>'+scEsc(x[1])+'</small></div>'; }).join('')+'</div>')
    +(care?'<div class="nfi-care">'+scEsc(care)+'</div>':'')+prog+(nfImpNextHint(rec)?'<div class="nfi-next">'+scEsc(nfImpNextHint(rec))+'</div>':'')
    +nfImpBtnsHTML(rec)
    +'<div class="nfi-name">'+scEsc(hi?'कार्ड पर नाम:':'Name on card:')+' <label><input type="radio" name="nfi-nm" '+(nm!=='first'?'checked':'')+' onchange="nfImpSetName(\'full\')"> '+scEsc(hi?'पूरा नाम':'Full name')+'</label><label><input type="radio" name="nfi-nm" '+(nm==='first'?'checked':'')+' onchange="nfImpSetName(\'first\')"> '+scEsc(hi?'केवल पहला नाम':'First name only')+'</label></div>'+upd+'</div>';
}
// level up / new star → one celebration screen (once)
function nfImpCelebrate(rec){
  if(!rec||!rec.level) return; var k='nfi_seen_'+rec.key, full=Math.floor(+rec.stars||0), now=rec.level+':'+full, seen=''; try{ seen=localStorage.getItem(k)||''; }catch(e){}
  if(seen===now) return; try{ localStorage.setItem(k,now); }catch(e){}
  var sp=seen.split(':'), newLevel=!seen||sp[0]!==rec.level; if(!newLevel&&!(full>(+sp[1]||0))) return;   // celebrate only a new level or a new full star
  var hi=nfImpHi(), lv=NF_LEVEL[rec.level]||{};
  var ov=document.createElement('div'); ov.className='nfi-ov';
  ov.innerHTML='<div><div style="font-size:44px">🎉</div><h2>'+scEsc(newLevel?(hi?'बधाई! अब आप '+nfImpLv(rec.level)+' हैं':'You are now a '+nfImpLv(rec.level)):(hi?'नया सितारा!':'A new star!'))+'</h2>'+nfImpStars(rec.stars)
    +(nfImpWhy(rec)?'<p><b>'+scEsc(nfImpWhy(rec))+'</b></p>':'')+'<p>'+scEsc(nfImpNoNums(rec)?'':(nfImpCare(rec,nfImpVillages(rec))||''))+'</p><div class="nfi-btns"><button type="button" class="wa" onclick="nfImpShare(this)">'+scEsc(hi?'WhatsApp पर साझा करें':'Share on WhatsApp')+'</button><button type="button" class="sv" onclick="this.closest(\'.nfi-ov\').remove()">'+scEsc(hi?'बाद में':'Later')+'</button></div></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); }); document.body.appendChild(ov);
}
// staff: Me page + stars next to the name on Home
(function(){
  if(typeof nfRenderMe==='function'){ var oMe=nfRenderMe; nfRenderMe=function(){ var r=oMe.apply(this,arguments);
    try{ var p=document.getElementById('nf-me'); if(!p) return r; var draw=function(rec){ var old=document.getElementById('nfi-card'); if(old) old.remove(); var prof=p.querySelector('.nf-prof'); var h=nfImpCardHTML(rec,'staff'); if(prof) prof.insertAdjacentHTML('afterend',h); else p.insertAdjacentHTML('afterbegin',h); };
      draw(_nfImp.key===choState.staffMobile?_nfImp.rec:null); Promise.all([nfImpCfg(),nfImpLoad(choState.staffMobile)]).then(function(a){ draw(a[1]); }); }catch(e){ console.warn('[SC] impact card',e); }
    return r; }; }
  if(typeof nfRenderToday==='function'){ var oT=nfRenderToday; nfRenderToday=function(){ var r=oT.apply(this,arguments);
    try{ var put=function(tag){ var h=document.querySelector('#nf-today .nf-top h1'); if(h&&tag&&tag.level&&!h.querySelector('.nfi-tag')) h.insertAdjacentHTML('beforeend',nfImpTagHTML(tag)); };
      put(((((choState.facility||{}).staff||{})[choState.staffMobile])||{}).impact||(_nfImp.key===choState.staffMobile?_nfImp.rec:null));
      if(!_nfImp.celebrated&&choState.staffMobile){ _nfImp.celebrated=true; Promise.all([nfImpCfg(),nfImpLoad(choState.staffMobile)]).then(function(a){ put(a[1]); nfImpCelebrate(a[1]); }); } }catch(e){}
    return r; }; }
})();
// Champion / Supervisor (Mentor): "My impact" on their Overview; District / MOIC: none
function nfImpMyKey(){ if(appMode==='sc-champion'&&typeof _scq!=='undefined'&&_scq.me) return {key:_scq.me.id,who:'champion'};
  if(appMode==='sc-supervisor'&&!(typeof scIsDistrict==='function'&&scIsDistrict())&&typeof _scSup!=='undefined'&&_scSup) return {key:_scSup.id,who:'mentor'}; return null; }
(function(){ if(typeof nfOverviewHTML!=='function') return; var oO=nfOverviewHTML;
  nfOverviewHTML=function(rows,opts){ var me=nfImpMyKey(); if(me){ var rec=_nfImp.key===me.key?_nfImp.rec:null;
      opts=Object.assign({},opts,{extraSide:'<div class="nfo-card" id="nfi-side">'+nfImpCardHTML(rec,me.who)+'</div>'+((opts&&opts.extraSide)||'')});
      if(!rec&&!_nfImp.loading){ _nfImp.loading=true; Promise.all([nfImpCfg(),nfImpLoad(me.key)]).then(function(a){ _nfImp.loading=false; var s=document.getElementById('nfi-side'); if(s) s.innerHTML=nfImpCardHTML(a[1],me.who); if(a[1]) nfImpCelebrate(a[1]); }); } }
    return oO.call(this,rows,opts); }; })();
(function(){ if(typeof scqRenderChampionApp!=='function') return; var oA=scqRenderChampionApp;
  scqRenderChampionApp=function(){ var r=oA.apply(this,arguments);
    try{ var app=document.getElementById('scq-app'); var me=nfImpMyKey(); if(!app||!me||document.getElementById('nfi-scq')) return r; var main=app.querySelector('.scq-main')||app;
      var d=document.createElement('div'); d.id='nfi-scq'; d.innerHTML=nfImpCardHTML(_nfImp.key===me.key?_nfImp.rec:null,'champion'); main.insertBefore(d,main.firstChild);
      Promise.all([nfImpCfg(),nfImpLoad(me.key)]).then(function(a){ var x=document.getElementById('nfi-scq'); if(x) x.innerHTML=nfImpCardHTML(a[1],'champion'); }); }catch(e){}
    return r; }; })();
// stars on the facility staff list (drill-in)
(function(){ var oD=scDrillIn; scDrillIn=async function(code){ var r=await oD.apply(this,arguments);
  try{ var f=(scMasterFacilities||{})[code]||{}, sc=document.getElementById('sc-drill-staff'); if(sc) sc.querySelectorAll('[data-mob]').forEach(function(row){ var t=((f.staff||{})[row.getAttribute('data-mob')]||{}).impact; var nm=row.querySelector('div[style*="font-weight:800"]'); if(t&&nm&&!nm.querySelector('.nfi-tag')) nm.insertAdjacentHTML('beforeend',nfImpTagHTML(t)); }); }catch(e){}
  return r; }; })();
// ── public Verify page: <app>?impact=ID ──
// open a link from inside the website's embedded page: new tab → whole page → ask the website page (Wix) to open it
function nfOpenOut(url){ var w=null; try{ w=window.open(url,'_blank','noopener'); }catch(e){} if(w) return false;
  try{ window.top.location.href=url; return false; }catch(e){}
  try{ window.parent.postMessage({nfOpen:url},'*'); }catch(e){} return false; }
async function nfImpVerifyBoot(){
  var id=''; try{ var q=new URLSearchParams(location.search), c=(q.get('cert')||'').trim(); id=(q.get('impact')||'').trim()||(/^IMP-/i.test(c)?c.slice(4):''); id=id.toLowerCase(); }catch(e){} if(!id) return false;
  var pg=document.createElement('div'); pg.id='nf-verify'; pg.innerHTML='<div class="nfv-top"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div><div class="nfv-st" style="background:#fff;">Checking…</div>'; document.body.appendChild(pg);
  var rec=null; if(/^[a-z0-9]{6,20}$/.test(id)){ try{ if(typeof db==='undefined'||!db) initFirebase(); }catch(e){} for(var i=0;i<50&&(typeof db==='undefined'||!db);i++) await new Promise(function(r){ setTimeout(r,100); }); rec=await fbGet('sc_impact_public/'+id); }
  var lv=rec?NF_LEVEL[rec.level]||{}:{};
  pg.className='nfi-vp';
  pg.innerHTML='<div class="nfv-top"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy"></div>'
    +(rec?'<div class="nfi-v"><div class="nfi-ok"><i class="ti ti-shield-check"></i>Genuine NQAS | FAST impact card</div>'
      +'<div style="color:#64748B;font-size:12px;font-weight:700;margin-top:10px;">'+scEsc((rec.role||'').toUpperCase())+'</div><h2>'+scEsc(rec.name)+'</h2><div style="font-weight:700;color:#0F766E;font-size:16px;">'+(lv.ic||'')+' '+scEsc(lv.en||'')+'</div>'+nfImpStars(rec.stars)+(nfImpWhy(rec)?'<div style="font-size:12.5px;color:#64748B;margin-top:2px;">'+scEsc(nfImpWhy(rec))+'</div>':'')
      +'<p style="font-size:13.5px;color:#334155;margin:6px 0;">'+scEsc([rec.facility,rec.district,rec.state].filter(Boolean).join(' · '))+(rec.facilities>1?' · '+rec.facilities+' facilities':'')+'</p>'
      +(rec.pop?'<p style="font-size:13.5px;margin:6px 0;"><b>'+scEsc((rec.cert||rec.result==='ready'?'Ensuring':'Working to ensure')+' quality of care for '+Number(rec.pop).toLocaleString('en-IN')+' people')+'</b></p>':'')
      +(rec.citation?'<p class="nfi-cit">🌟 Quality Pioneer'+(rec.pioneerYear?' '+scEsc(rec.pioneerYear):'')+': “'+scEsc(rec.citation)+'”</p>':'')+'<p class="nfi-upd">'+(rec.honorary?'Title given by HealSol Academy':'Worked out by HealSol Academy from verified programme data')+' · updated '+scEsc(scFmtDate(String(rec.updatedAt||'').slice(0,10)))+'</p></div>'
      :'<div class="nfv-st no"><i class="ti ti-alert-triangle"></i><div><b>Card not found</b><small>This impact card could not be found. Ask the person to share it again from the app.</small></div></div>')
    +'<div class="nfv-foot">NQAS | FAST · by HealSol Academy<a class="nfv-cta" href="'+scEsc(NF_APP_HOME)+'" target="_blank" rel="noopener" onclick="return nfOpenOut(this.href)">'+(rec?'Want your facility NQAS Ready? ':'')+'Learn about NQAS | FAST →</a></div>';
  return true;
}
(function(){ if(typeof nfVerifyBoot==='function'){ var oV=nfVerifyBoot; nfVerifyBoot=function(){ try{ if(/^IMP-/i.test((new URLSearchParams(location.search).get('cert')||'').trim())) return Promise.resolve(false); }catch(e){} return oV.apply(this,arguments); }; } })();
(function(){ var go=function(){ nfImpVerifyBoot(); }; if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go); else setTimeout(go,0); })();
function nfImpShrink(file){ return new Promise(function(res){ var fr=new FileReader(); fr.onload=function(){ var im=new Image(); im.onload=function(){ var h=120, w=Math.round(im.width*h/im.height), c=document.createElement('canvas'); c.width=w; c.height=h; var g=c.getContext('2d'); g.fillStyle='#fff'; g.fillRect(0,0,w,h); g.drawImage(im,0,0,w,h); res(c.toDataURL('image/png')); }; im.onerror=function(){ res(fr.result); }; im.src=fr.result; }; fr.readAsDataURL(file); }); }
// ── HealSol: "Impact & Recognition" (left menu) — Partner logos tab and Quality Pioneer tab ──
//  shared/sc_impact_logos/{id}: {name, type, img, st (state code), state, district ('' = whole state), permBy, permRef, permDate,
//    validUntil ('' = no end), on, addedBy, at, updatedBy, updatedAt}. A logo shows on the card strip only while it is on and in
//    date (expired logos stop automatically). District logos first, else the state's; up to 2 per place.
//  shared/sc_impact_config.hideFacility: {slug of state name: true, state code lower-case: true}
//  sc_supervisors/{id}/pioneer: {year, citation, show (citation on Verify page), by, at}; .../pioneerLog/{key}: {act, year, citation, reason, by, at}
var NF_PARTNER_TYPES={govt:'Government (NHM / Health Dept)',donor:'Donor / CSR',ngo:'NGO / Technical partner',other:'Other'};
var _nfR={tab:'logos',img:'',filter:'',by:''};
function nfrToday(){ return new Date(Date.now()+5.5*3600e3).toISOString().slice(0,10); }
function nfrStateCode(s){ s=String(s||'').trim().toLowerCase(); if(!s) return ''; var L=typeof NF_STATE_LIST!=='undefined'?NF_STATE_LIST:[];
  for(var i=0;i<L.length;i++) if(L[i][0].toLowerCase()===s||L[i][1].toLowerCase()===s) return L[i][1]; return ''; }
function nfrStateName(code){ var L=typeof NF_STATE_LIST!=='undefined'?NF_STATE_LIST:[]; for(var i=0;i<L.length;i++) if(L[i][1]===code) return L[i][0]; return code||''; }
function nfrStatus(x){ if(!x||x.on===false) return 'off'; var t=nfrToday(); if(x.validUntil&&x.validUntil<t) return 'expired';
  if(x.validUntil){ var d=(new Date(x.validUntil)-new Date(t))/864e5; if(d<=30) return 'soon'; } return 'active'; }
function nfrLive(x){ var s=nfrStatus(x); return s==='active'||s==='soon'; }
function nfrPlace(x){ return x.district?x.district+', '+(x.state||nfrStateName(x.st)):(x.state||nfrStateName(x.st))+' (whole state)'; }
function nfrBy(){ if(_nfR.by) return _nfR.by; var k=(typeof _nfAuth!=='undefined'&&_nfAuth&&_nfAuth.email||'').split('@')[0]; _nfR.by=k||'HealSol';
  if(k) fbGet('sc_healsol_admins/'+k+'/name').then(function(n){ if(n) _nfR.by=n; }).catch(function(){}); return _nfR.by; }
// the card strip: logos for the person's (first) facility
nfImpPartnersFor=function(rec){ var m=nfImpMain(rec), st=nfrStateCode(m.state||rec.state), ds=nfImpSlug(m.district), L=_nfImp.logos||{};
  if(!st) return []; var all=Object.keys(L).map(function(k){ return L[k]; }).filter(function(x){ return x&&x.img&&x.st===st&&nfrLive(x); });
  var d=all.filter(function(x){ return x.district&&nfImpSlug(x.district)===ds; }); if(!d.length) d=all.filter(function(x){ return !x.district; });
  return d.sort(function(a,b){ return String(a.at||'').localeCompare(String(b.at||'')); }).slice(0,2); };
(function(){ var o=nfImpCfg; nfImpCfg=async function(){ await o.apply(this,arguments); if(!_nfImp.logos){ try{ _nfImp.logos=await fbGet('shared/sc_impact_logos')||{}; }catch(e){ _nfImp.logos={}; } } }; })();

// ── the view ──
async function nfrRender(load){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-recog'); if(!box){ box=document.createElement('div'); box.id='nf-recog'; box.dataset.nfv='recog'; main.insertBefore(box,main.firstChild); }
  if(load||!_nfImp.logos||!_nfImp.cfg||!_nfR.hon){ if(!box.innerHTML) box.innerHTML='<div class="nfr-empty">Loading…</div>';
    try{ _nfImp.cfg=await fbGet('shared/sc_impact_config')||{}; _nfImp.logos=await fbGet('shared/sc_impact_logos')||{}; if(load==='force') _scSupervisors=await fbGet('sc_supervisors')||{}; _nfR.hon=await fbGet('sc_pioneers')||{}; _nfR.crit={leader:await fbGet('shared/sc_leader_criteria'),pioneer:await fbGet('shared/sc_pioneer_criteria')}; }catch(e){ _nfImp.cfg=_nfImp.cfg||{}; _nfImp.logos=_nfImp.logos||{}; } }
  nfrBy();
  var L=_nfImp.logos||{}, nLive=Object.keys(L).filter(function(k){ return nfrLive(L[k]); }).length, P=nfrPioneers(), LD=nfrTitleList('leader');
  box.innerHTML='<div class="nfo-top"><div><h1>Impact &amp; Recognition</h1><small>HealSol only · partner logos on staff impact cards, Quality Leader and Quality Pioneer titles</small></div>'
    +'<button type="button" class="nfo-ic" title="Refresh" onclick="nfrRender(\'force\')"><i class="ti ti-refresh"></i></button></div>'
    +'<div class="nfr-tabs" role="tablist"><button type="button" role="tab" class="'+(_nfR.tab==='logos'?'on':'')+'" onclick="nfrTab(\'logos\')">🤝 Partner logos <em>'+nLive+'</em></button>'
    +'<button type="button" role="tab" class="'+(_nfR.tab==='leader'?'on':'')+'" onclick="nfrTab(\'leader\')">🧭 Quality Leader <em>'+LD.length+'</em></button>'
    +'<button type="button" role="tab" class="'+(_nfR.tab==='pioneer'?'on':'')+'" onclick="nfrTab(\'pioneer\')">🌟 Quality Pioneer <em>'+P.length+'</em></button></div>'
    +nfrLadderHTML()+(_nfR.tab==='pioneer'?nfrTitleHTML('pioneer'):_nfR.tab==='leader'?nfrTitleHTML('leader'):nfrLogosHTML());
}
function nfrTab(t){ _nfR.tab=t; nfrRender(); }
function nfrLadderHTML(){ var R=[['starter','Baseline done'],['practitioner','Facility NQAS Ready'],['achiever','Facility NHSRC certified'],['champion','Achiever helping other facilities'],['leader','Mentor · title by HealSol'],['pioneer','Highest award by HealSol']];
  return '<div class="nfr-ladder" aria-label="Levels">'+R.map(function(x){ var l=NF_LEVEL[x[0]]; return '<div class="'+(x[0]===_nfR.tab?'on':'')+'"><span>'+l.ic+'</span><b>'+scEsc(l.en)+'</b><small>'+scEsc(x[1])+'</small></div>'; }).join('<i>›</i>')+'</div>'; }

// ── Partner logos tab ──
function nfrStatusChip(s){ var m={active:['Active','g'],soon:['Expiring soon','a'],expired:['Expired','r'],off:['Turned off','n']}[s]; return '<span class="nfr-chip '+m[1]+'">'+m[0]+'</span>'; }
function nfrLogosHTML(){
  var L=_nfImp.logos||{}, ids=Object.keys(L).filter(function(k){ return L[k]; });
  var states={}; ids.forEach(function(k){ states[L[k].st]=1; });
  if(_nfR.filter&&!states[_nfR.filter]) _nfR.filter='';
  var rows=ids.filter(function(k){ return !_nfR.filter||L[k].st===_nfR.filter; }).sort(function(a,b){ var x=L[a], y=L[b]; return (nfrStateName(x.st)+'|'+(x.district||'')).localeCompare(nfrStateName(y.st)+'|'+(y.district||'')); });
  var h='<div class="nfr-card"><div class="nfr-head"><div><h3>Partner logos on impact cards</h3><p>Logos appear in the strip at the bottom of every impact card in the place you choose. A district\'s logos replace the state\'s for that district. Up to 2 logos per place. A logo stops showing by itself after its permission end date.</p></div>'
    +'<button type="button" class="nfr-btn" onclick="nfrLogoForm()"><i class="ti ti-plus"></i> Add partner logo</button></div>'
    +'<div class="nfr-warn"><i class="ti ti-alert-triangle"></i> Add a logo only with the partner\'s written permission (letter or email). Never use the national emblem.</div>';
  if(!ids.length) h+='<div class="nfr-empty">No partner logos yet. Cards show only the NQAS | FAST and HealSol logos.</div>';
  else {
    h+=(Object.keys(states).length>1?'<div class="nfr-filter"><label>Show <select onchange="_nfR.filter=this.value;nfrRender();"><option value="">All states</option>'+Object.keys(states).sort(function(a,b){ return nfrStateName(a).localeCompare(nfrStateName(b)); }).map(function(c){ return '<option value="'+c+'"'+(_nfR.filter===c?' selected':'')+'>'+scEsc(nfrStateName(c))+'</option>'; }).join('')+'</select></label></div>':'')
      +'<div class="nfr-tw"><table class="nfr-t"><thead><tr><th>Logo</th><th>Partner</th><th>Shows on cards in</th><th>Permission</th><th>Valid until</th><th>Status</th><th></th></tr></thead><tbody>'
      +rows.map(function(k){ var x=L[k], s=nfrStatus(x);
        return '<tr class="'+(s==='off'||s==='expired'?'dim':'')+'"><td><img src="'+x.img+'" alt=""></td><td><b>'+scEsc(x.name||'')+'</b><small>'+scEsc(NF_PARTNER_TYPES[x.type]||'')+'</small></td>'
          +'<td>'+scEsc(nfrPlace(x))+'</td><td>'+scEsc(x.permBy||'')+'<small>Ref. '+scEsc(x.permRef||'—')+(x.permDate?' · '+scEsc(scFmtDate(x.permDate)):'')+'</small><small>Added by '+scEsc(x.addedBy||'—')+(x.at?' · '+scEsc(scFmtDate(String(x.at).slice(0,10))):'')+'</small></td>'
          +'<td>'+(x.validUntil?scEsc(scFmtDate(x.validUntil)):'No end date')+'</td><td>'+nfrStatusChip(s)+'</td>'
          +'<td class="nfr-act"><button type="button" title="Edit" onclick="nfrLogoForm(\''+scJs(k)+'\')"><i class="ti ti-pencil"></i></button>'
          +'<button type="button" title="'+(x.on===false?'Turn on':'Turn off')+'" onclick="nfrLogoOn(\''+scJs(k)+'\','+(x.on===false)+')"><i class="ti '+(x.on===false?'ti-eye':'ti-eye-off')+'"></i></button>'
          +'<button type="button" title="Remove" class="del" onclick="nfrLogoDel(\''+scJs(k)+'\')"><i class="ti ti-trash"></i></button></td></tr>'; }).join('')
      +'</tbody></table></div>';
  }
  h+='</div>'+nfrPrivacyHTML();
  return h;
}
function nfrPrivacyHTML(){
  var hide=(_nfImp.cfg||{}).hideFacility||{}, on=(NF_STATE_LIST||[]).filter(function(s){ return hide[nfImpSlug(s[0])]||hide[s[1].toLowerCase()]; });
  return '<div class="nfr-card"><h3><i class="ti ti-lock"></i> Privacy: hide facility names</h3><p>In these states the public Verify page and the card show only the district and state, not the facility name.</p>'
    +'<div class="nfr-chips">'+(on.length?on.map(function(s){ return '<span class="nfr-pill">'+scEsc(s[0])+' <button type="button" title="Remove" onclick="nfrHide(\''+s[1]+'\',false)">✕</button></span>'; }).join(''):'<span class="nfr-muted">None, facility names are shown everywhere.</span>')+'</div>'
    +'<div class="nfr-row"><select id="nfr-hide-st"><option value="">Choose a state…</option>'+(NF_STATE_LIST||[]).filter(function(s){ return on.indexOf(s)<0; }).slice().sort(function(a,b){ return a[0].localeCompare(b[0]); }).map(function(s){ return '<option value="'+s[1]+'">'+scEsc(s[0])+'</option>'; }).join('')+'</select>'
    +'<button type="button" class="nfr-btn ghost" onclick="var v=document.getElementById(\'nfr-hide-st\').value; if(v) nfrHide(v,true);">Hide names in this state</button></div></div>';
}
async function nfrHide(code,on){ var cfg=_nfImp.cfg=_nfImp.cfg||{}; cfg.hideFacility=cfg.hideFacility||{}; var a=nfImpSlug(nfrStateName(code)), b=code.toLowerCase();
  if(on){ cfg.hideFacility[a]=true; cfg.hideFacility[b]=true; } else { delete cfg.hideFacility[a]; delete cfg.hideFacility[b]; }
  var ok=await fbSet('shared/sc_impact_config/hideFacility',Object.keys(cfg.hideFacility).length?cfg.hideFacility:null);
  showToast(ok?(on?'Facility names hidden in '+nfrStateName(code)+' from the next nightly update.':'Facility names shown again in '+nfrStateName(code)+'.'):'Could not save.',ok?'ok':'err'); nfrRender(); }
async function nfrLogoOn(id,on){ var x=(_nfImp.logos||{})[id]; if(!x) return;
  if(on){ var err=nfrPlaceFull(x.st,x.district,id); if(err){ showToast(err,'err'); return; } }
  var ok=await fbSet('shared/sc_impact_logos/'+id+'/on',!!on); if(ok){ x.on=!!on; await fbSet('shared/sc_impact_logos/'+id+'/updatedBy',nfrBy()); }
  showToast(ok?(on?'Logo turned on.':'Logo turned off. It no longer shows on new cards.'):'Could not save.',ok?'ok':'err'); nfrRender(); }
async function nfrLogoDel(id){ var x=(_nfImp.logos||{})[id]; if(!x) return;
  var v=await scDialog({title:'Remove partner logo?',icon:'🗑️',okLabel:'Remove',message:(x.name||'')+' — '+nfrPlace(x)+'. The permission details are removed too. To keep the record, turn the logo off instead.',fields:[]}); if(!v) return;
  var ok=await fbSet('shared/sc_impact_logos/'+id,null); if(ok) delete _nfImp.logos[id]; showToast(ok?'Logo removed.':'Could not remove.',ok?'ok':'err'); nfrRender(); }
function nfrPlaceFull(st,district,except){ var L=_nfImp.logos||{}, n=Object.keys(L).filter(function(k){ var x=L[k]; return k!==except&&x&&x.st===st&&nfImpSlug(x.district||'')===nfImpSlug(district||'')&&nfrLive(x); }).length;
  return n>=2?'Already 2 logos showing for '+(district?district+', ':'')+nfrStateName(st)+'. Turn one off first.':''; }

// the add / edit form
function nfrLogoForm(id){
  var x=id?((_nfImp.logos||{})[id]||{}):{type:'govt',on:true}; _nfR.img=x.img||''; _nfR.edit=id||'';
  var ov=document.createElement('div'); ov.className='nfr-ov'; ov.id='nfr-ov';
  var opt=function(v,l,sel){ return '<option value="'+scEsc(v)+'"'+(sel?' selected':'')+'>'+scEsc(l)+'</option>'; };
  ov.innerHTML='<form class="nfr-form" onsubmit="event.preventDefault();nfrLogoSave();"><div class="nfr-fh"><b>'+(id?'Edit partner logo':'Add partner logo')+'</b><button type="button" onclick="nfrClose()" title="Close">✕</button></div>'
    +'<fieldset><legend>1 · Partner</legend><label>Partner name<input id="nfr-name" maxlength="60" required placeholder="e.g. NHM Uttar Pradesh" value="'+scEsc(x.name||'')+'"></label>'
    +'<label>Partner type<select id="nfr-type">'+Object.keys(NF_PARTNER_TYPES).map(function(k){ return opt(k,NF_PARTNER_TYPES[k],x.type===k); }).join('')+'</select></label>'
    +'<div class="nfr-logo"><div id="nfr-prev">'+nfrPrevHTML()+'</div><label class="nfr-btn ghost">📥 '+(x.img?'Change logo':'Choose logo')+'<input type="file" accept="image/png,image/jpeg" hidden onchange="nfrPickLogo(this)"></label><small>PNG or JPG, under 300 KB. A logo on a white or clear background looks best.</small></div></fieldset>'
    +'<fieldset><legend>2 · Where it shows</legend><label>State<select id="nfr-st" onchange="nfrFillDistricts()" required><option value="">Choose a state…</option>'
    +(NF_STATE_LIST||[]).slice().sort(function(a,b){ return a[0].localeCompare(b[0]); }).map(function(s){ return opt(s[1],s[0],x.st===s[1]); }).join('')+'</select></label>'
    +'<label>District<select id="nfr-dist" data-v="'+scEsc(x.district||'')+'"></select></label></fieldset>'
    +'<fieldset><legend>3 · Permission <span>required</span></legend><label>Permission given by (name and designation)<input id="nfr-by" maxlength="100" required placeholder="e.g. Dr A. Kumar, Mission Director, NHM UP" value="'+scEsc(x.permBy||'')+'"></label>'
    +'<div class="nfr-2"><label>Letter / email reference no.<input id="nfr-ref" maxlength="60" required placeholder="e.g. NHM/UP/QA/2026/145" value="'+scEsc(x.permRef||'')+'"></label>'
    +'<label>Date of letter / email<input id="nfr-pdate" type="date" required max="'+nfrToday()+'" value="'+scEsc(x.permDate||'')+'"></label></div>'
    +'<label>Valid until <small>(optional; the logo stops showing after this date)</small><input id="nfr-until" type="date" value="'+scEsc(x.validUntil||'')+'"></label>'
    +'<label class="nfr-tick"><input type="checkbox" id="nfr-ok"'+(id?' checked':'')+'> We have written permission to use this logo on staff impact cards. It is not the national emblem.</label></fieldset>'
    +'<div class="nfr-err" id="nfr-err"></div><div class="nfr-fb"><button type="button" class="nfr-btn ghost" onclick="nfrClose()">Cancel</button><button type="submit" class="nfr-btn">'+(id?'Save changes':'Add logo')+'</button></div></form>';
  ov.addEventListener('click',function(e){ if(e.target===ov) nfrClose(); });
  document.body.appendChild(ov); nfrFillDistricts();
}
function nfrPrevHTML(){ return _nfR.img?'<div class="nfr-strip"><span>Supported by</span><img src="'+_nfR.img+'" alt="Logo preview"></div>':'<div class="nfr-strip none">No logo chosen</div>'; }
function nfrClose(){ var o=document.getElementById('nfr-ov'); if(o) o.remove(); }
function nfrFillDistricts(){ var st=document.getElementById('nfr-st'), d=document.getElementById('nfr-dist'); if(!st||!d) return; var cur=d.value||d.getAttribute('data-v')||''; d.removeAttribute('data-v');
  var L=(typeof NF_DISTRICTS!=='undefined'&&NF_DISTRICTS[st.value])||[];
  d.innerHTML='<option value="">All districts (whole state)</option>'+L.map(function(n){ return '<option value="'+scEsc(n)+'"'+(n===cur?' selected':'')+'>'+scEsc(n)+'</option>'; }).join(''); d.disabled=!st.value; }
async function nfrPickLogo(inp){ var f=inp.files&&inp.files[0]; if(!f) return; var e=document.getElementById('nfr-err');
  if(!/^image\/(png|jpeg)$/.test(f.type)){ e.textContent='Choose a PNG or JPG picture.'; return; }
  if(f.size>300000){ e.textContent='This logo is '+Math.round(f.size/1024)+' KB. Use one under 300 KB.'; return; }
  e.textContent=''; _nfR.img=await nfImpShrink(f); document.getElementById('nfr-prev').innerHTML=nfrPrevHTML(); }
async function nfrLogoSave(){
  var g=function(i){ var el=document.getElementById(i); return el?String(el.value||'').trim():''; }, err=document.getElementById('nfr-err'), id=_nfR.edit;
  var v={name:g('nfr-name'),type:g('nfr-type'),st:g('nfr-st'),district:g('nfr-dist'),permBy:g('nfr-by'),permRef:g('nfr-ref'),permDate:g('nfr-pdate'),validUntil:g('nfr-until')};
  var msg=!v.name?'Enter the partner name.':!_nfR.img?'Choose the logo picture.':!v.st?'Choose the state.':!v.permBy?'Enter who gave the permission.':!v.permRef?'Enter the letter or email reference number.'
    :!v.permDate?'Enter the date of the letter or email.':v.permDate>nfrToday()?'The letter date cannot be in the future.':(v.validUntil&&v.validUntil<v.permDate)?'"Valid until" must be after the letter date.'
    :!document.getElementById('nfr-ok').checked?'Tick the permission confirmation.':'';
  var old=id?(_nfImp.logos||{})[id]||{}:{};
  if(!msg&&old.on!==false&&!(v.validUntil&&v.validUntil<nfrToday())) msg=nfrPlaceFull(v.st,v.district,id);
  if(msg){ err.textContent=msg; return; }
  var by=nfrBy(), now=scNowIso(), rec=Object.assign({},old,v,{state:nfrStateName(v.st),img:_nfR.img,on:old.on===false?false:true,addedBy:old.addedBy||by,at:old.at||now,updatedBy:by,updatedAt:now});
  if(!rec.district) rec.district=''; if(!rec.validUntil) rec.validUntil='';
  id=id||('L'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36));
  var ok=await fbSet('shared/sc_impact_logos/'+id,rec); if(!ok){ err.textContent='Could not save. Check the internet and try again.'; return; }
  _nfImp.logos=_nfImp.logos||{}; _nfImp.logos[id]=rec; nfrClose();
  showToast(v.validUntil&&v.validUntil<nfrToday()?'Saved, but the permission has expired, so the logo is not shown.':'Saved. The logo shows on cards in '+nfrPlace(rec)+'.','ok'); nfrRender();
}

// ── Quality Leader and Quality Pioneer tabs (titles given by HealSol only, against HealSol's criteria) ──
//  Leader:  Quality Mentors (Supervisors) only     → sc_supervisors/{id}/leader  {note, by, at, updatedBy?, updatedAt?} + leaderLog
//  Pioneer: a Mentor, or someone without a login    → sc_supervisors/{id}/pioneer or sc_pioneers/{id}/pioneer {year, citation, show, by, at} + pioneerLog
//           sc_pioneers/{id} = {name, designation, org, st, state, facilities:{code:true}, removed?}
//  Criteria: shared/sc_leader_criteria, shared/sc_pioneer_criteria = {text (one per line), by, at}; until HealSol edits them the
//  defaults below apply. Giving a title needs the "meets the criteria" tick.
var NF_TITLE={
  leader:{field:'leader',log:'leaderLog',crit:'sc_leader_criteria',en:'Quality Leader',ic:'🧭',hon:false,cit:false,
    intro:'Given by HealSol to a Quality Mentor (Supervisor) after looking at their active contribution, against the Leader criteria below. A Supervisor without this title has no level.',
    def:['At least 5 years of work in public-health quality improvement (NQAS, LaQshya, Kayakalp, MusQan or similar)',
      'Certified NQAS assessor (national or state), or has mentored at least 10 facilities to NQAS Ready or NHSRC certification',
      'Measurable improvement shown in facilities they supported: higher readiness scores, closed gaps, or certifications',
      'Has built capacity of others by training or mentoring CHOs, Quality Champions or Quality Mentors',
      'Recognised contribution to quality of care at district, state or national level (award, programme leadership, published work or innovation)',
      'Upholds integrity: no fabricated scores, no conflict of interest, and respectful conduct with facility staff']},
  pioneer:{field:'pioneer',log:'pioneerLog',crit:'sc_pioneer_criteria',en:'Quality Pioneer',ic:'🌟',hon:true,cit:true,
    intro:'HealSol\'s highest award, for someone whose work has created very good social impact: a Quality Mentor with a login, or someone without a login (for example a national assessor or a senior public-health leader).',
    def:['At least 10 years of work in public health or quality of care',
      'High-impact contribution to public health or quality of care at state, national or international level',
      'Very good, visible social impact: better care for communities, and systems or people that others now follow',
      'Upholds integrity: no conflict of interest, and respectful conduct with everyone']}
};
function nfrFacN(u){ var n=nfrSupFacs(u).length; return n+' facilit'+(n===1?'y':'ies'); }
function nfrSupFacs(u){ var f=u&&u.facilities||{}; return Array.isArray(f)?f:Object.keys(f).filter(function(k){ return f[k]; }); }
function nfrSupStates(u){ var o={}; nfrSupFacs(u).forEach(function(c){ var f=(scMasterFacilities||{})[c]; if(f&&f.state){ var n=nfrStateName(nfrStateCode(f.state))||f.state; o[n]=1; } }); return Object.keys(o).sort(); }
function nfrPioRec(ref){ var k=ref.slice(0,3), id=ref.slice(4); return k==='sup'?(_scSupervisors||{})[id]:(_nfR.hon||{})[id]; }
function nfrPioBase(ref){ return (ref.slice(0,3)==='sup'?'sc_supervisors/':'sc_pioneers/')+ref.slice(4); }
function nfrPioKey(ref){ return ref.slice(0,3)==='sup'?ref.slice(4):'hp_'+ref.slice(4); }   // sc_impact key
function nfrTObj(T,u){ var p=u&&u[NF_TITLE[T].field]; return p&&typeof p==='object'?p:(p?{}:null); }
function nfrPio(u){ return nfrTObj('pioneer',u); }
function nfrPioSub(ref,u){ if(ref.slice(0,3)==='sup'){ var st=nfrSupStates(u); return 'Quality Mentor'+(st.length?' · '+st.join(', '):'')+' · '+nfrFacN(u); }
  return [u.designation,u.org].filter(Boolean).join(', ')+(u.state?' · '+u.state:'')+(nfrSupFacs(u).length?' · '+nfrFacN(u):''); }
function nfrTitleList(T){ var out=[], S=_scSupervisors||{}, P=_nfR.hon||{}, f=NF_TITLE[T].field;
  Object.keys(S).forEach(function(id){ if(S[id]&&S[id][f]&&!S[id].disabled) out.push('sup:'+id); });
  if(NF_TITLE[T].hon) Object.keys(P).forEach(function(id){ if(P[id]&&P[id][f]&&!P[id].removed) out.push('hon:'+id); });
  return out.sort(function(a,b){ return String(nfrPioRec(a).name||'').localeCompare(String(nfrPioRec(b).name||'')); }); }
function nfrPioneers(){ return nfrTitleList('pioneer'); }
// criteria
function nfrCrit(T){ _nfR.crit=_nfR.crit||{}; var c=_nfR.crit[T]||{}; return {text:String(c.text||'').trim()||NF_TITLE[T].def.join('\n'),by:c.by,at:c.at,isDefault:!String(c.text||'').trim()}; }
function nfrCritLines(T){ return nfrCrit(T).text.split('\n').map(function(x){ return x.replace(/^[\s•\-*\d.)]+/,'').trim(); }).filter(Boolean); }
function nfrCriteriaHTML(T){ var c=nfrCrit(T), L=nfrCritLines(T);
  return '<div class="nfr-crit"><div class="nfr-head"><div><b>'+scEsc(NF_TITLE[T].en)+' criteria</b> <small class="nfr-muted">set by HealSol only'+(c.isDefault?' · HealSol default':(c.by?' · last changed by '+scEsc(c.by)+(c.at?' on '+scEsc(scFmtDate(String(c.at).slice(0,10))):''):''))+'</small></div>'
    +'<button type="button" class="nfr-btn ghost sm" onclick="nfrCritEdit(\''+T+'\')"><i class="ti ti-pencil"></i> Edit</button></div>'
    +'<ol>'+L.map(function(x){ return '<li>'+scEsc(x)+'</li>'; }).join('')+'</ol></div>'; }
async function nfrCritEdit(T){ var c=nfrCrit(T);
  var v=await scDialog({title:NF_TITLE[T].en+' criteria',icon:NF_TITLE[T].ic,okLabel:'Save',wide:true,message:'One criterion per line. HealSol confirms these each time the title is given. Titles already given are not affected.',fields:[{key:'text',type:'textarea',rows:8,label:'Criteria',required:true,value:c.text}]}); if(!v) return;
  var rec={text:String(v.text||'').trim(),by:nfrBy(),at:scNowIso()}; var ok=await fbSet('shared/'+NF_TITLE[T].crit,rec); if(ok){ _nfR.crit=_nfR.crit||{}; _nfR.crit[T]=rec; }
  showToast(ok?'Criteria saved.':'Could not save.',ok?'ok':'err'); nfrRender(); }
function nfrCriteriaEdit(){ return nfrCritEdit('pioneer'); }
// the tab
function nfrTitleHTML(T){
  var D=NF_TITLE[T], refs=nfrTitleList(T), log=[], S=_scSupervisors||{}, P=_nfR.hon||{};
  var addLog=function(name,kind,g){ Object.keys(g||{}).forEach(function(k){ if(g[k]) log.push(Object.assign({who:name,kind:kind},g[k])); }); };
  Object.keys(S).forEach(function(id){ if(S[id]) addLog(S[id].name||id,'Quality Mentor',S[id][D.log]); });
  if(D.hon) Object.keys(P).forEach(function(id){ if(P[id]) addLog(P[id].name||id,'No login',P[id][D.log]); });
  log.sort(function(a,b){ return String(b.at||'').localeCompare(String(a.at||'')); });
  var h='<div class="nfr-card"><div class="nfr-head"><div><h3>'+D.ic+' '+scEsc(D.en)+'</h3><p>'+scEsc(D.intro)+' It shows on their impact card and Verify page from the next nightly update, or straight away with "Update cards now".</p></div>'
    +'<button type="button" class="nfr-btn" onclick="nfrTitleForm(\''+T+'\')"><i class="ti ti-plus"></i> Give '+scEsc(D.en)+' title</button></div>'+nfrCriteriaHTML(T);
  if(!refs.length) h+='<div class="nfr-empty">No '+scEsc(D.en)+'s yet.</div>';
  else h+='<div class="nfr-pgrid">'+refs.map(function(ref){ var u=nfrPioRec(ref), p=nfrTObj(T,u)||{}, hon=ref.slice(0,3)==='hon', r=scJs(ref), other=T==='leader'?nfrTObj('pioneer',u):null;
    return '<div class="nfr-pc'+(T==='leader'?' ld':'')+'"><div class="nfr-pt"><span>'+D.ic+'</span><div><b>'+scEsc(u.name||'')+'</b> <span class="nfr-chip '+(hon?'a':'n')+'">'+(hon?'No login':'Quality Mentor')+'</span>'+(other?' <span class="nfr-chip a">🌟 also Pioneer</span>':'')
      +'<small>'+scEsc(D.en)+(p.year?' '+scEsc(p.year):'')+' · '+scEsc(nfrPioSub(ref,u))+'</small></div></div>'
      +(D.cit?(p.citation?'<p class="nfr-cit">“'+scEsc(p.citation)+'”</p>':'<p class="nfr-muted">No citation yet.</p>')
        +'<label class="nfr-sw"><input type="checkbox"'+(p.show!==false?' checked':'')+(p.citation?'':' disabled')+' onchange="nfrTitleShow(\''+T+'\',\''+r+'\',this.checked)"><i></i> Show citation on Verify page</label>'
        :(p.note?'<p class="nfr-note"><b>HealSol note:</b> '+scEsc(p.note)+'</p>':''))
      +(nfrSupFacs(u).length?'<label class="nfr-sw"><input type="checkbox"'+(u.cardNums===true?' checked':'')+' onchange="nfrCardNums(\''+r+'\',this.checked)"><i></i> Show numbers on card <small class="nfr-muted">(facilities mentored, NQAS Ready, average gain)</small></label>':'')
      +'<small class="nfr-muted">Given by '+scEsc(p.by||'HealSol')+(p.at?' on '+scEsc(scFmtDate(String(p.at).slice(0,10))):'')+'</small>'
      +'<div class="nfr-pb"><button type="button" class="nfr-btn ghost sm" onclick="nfrTitleForm(\''+T+'\',\''+r+'\')"><i class="ti ti-pencil"></i> Edit</button>'
      +'<button type="button" class="nfr-btn ghost sm" onclick="nfrPioCard(\''+r+'\')"><i class="ti ti-download"></i> Card</button>'
      +'<button type="button" class="nfr-btn ghost sm" onclick="nfrPioLink(\''+r+'\')"><i class="ti ti-shield-check"></i> Card link</button>'
      +'<button type="button" class="nfr-btn ghost sm del" onclick="nfrTitleRemove(\''+T+'\',\''+r+'\')"><i class="ti ti-x"></i> Remove title</button></div></div>'; }).join('')+'</div>';
  h+='<div class="nfr-row"><button type="button" class="nfr-btn ghost" id="nfr-upd" onclick="nfrUpdateNow()"><i class="ti ti-refresh"></i> Update cards now</button><small class="nfr-muted">Works out all levels and stars again (takes about a minute). Otherwise this happens tonight at 2 AM.</small></div></div>';
  h+='<div class="nfr-card"><h3><i class="ti ti-clock"></i> History</h3>'+(log.length?'<div class="nfr-tw"><table class="nfr-t"><thead><tr><th>Date</th><th>Person</th><th>Action</th><th>Details</th><th>By</th></tr></thead><tbody>'
    +log.slice(0,100).map(function(x){ var a={given:['Given','g'],edited:['Edited','n'],removed:['Removed','r']}[x.act]||[x.act||'',''];
      return '<tr><td>'+scEsc(scFmtDate(String(x.at||'').slice(0,10)))+'</td><td>'+scEsc(x.who)+'<small>'+scEsc(x.kind)+'</small></td><td><span class="nfr-chip '+a[1]+'">'+scEsc(a[0])+'</span></td><td>'+scEsc(x.act==='removed'?('Reason: '+(x.reason||'')):((x.year?x.year+' · ':'')+(x.citation||x.note||'')))+'</td><td>'+scEsc(x.by||'')+'</td></tr>'; }).join('')
    +'</tbody></table></div>':'<div class="nfr-muted">Nothing yet.</div>')+'</div>';
  return h;
}
function nfrPioneerHTML(){ return nfrTitleHTML('pioneer'); }
function nfrFacOpts(st,sel){ var F=scMasterFacilities||{}, L=Object.keys(F).filter(function(c){ var f=F[c]; return f&&!f.migratedTo&&(!st||nfrStateCode(f.state)===st); })
    .sort(function(a,b){ return String(F[a].name||a).localeCompare(String(F[b].name||b)); });
  return L.length?L.map(function(c){ var f=F[c]; return '<label class="nfr-fc"><input type="checkbox" value="'+scEsc(c)+'"'+(sel[c]?' checked':'')+'> '+scEsc(f.name||c)+' <small>'+scEsc([f.district,f.state].filter(Boolean).join(', '))+'</small></label>'; }).join('')
    :'<span class="nfr-muted">No facilities'+(st?' in this state':'')+'.</span>'; }
function nfrPioKind(k){ _nfR.pk=k; var a=document.getElementById('nfr-pk-sup'), b=document.getElementById('nfr-pk-hon'); if(a) a.style.display=k==='sup'?'':'none'; if(b) b.style.display=k==='hon'?'':'none';
  document.querySelectorAll('.nfr-kind label').forEach(function(l){ l.classList.toggle('on',l.getAttribute('data-k')===k); }); }
function nfrHonFacs(){ var st=document.getElementById('nfr-hst'), box=document.getElementById('nfr-hfac'); if(!st||!box) return; var sel={}; box.querySelectorAll('input:checked').forEach(function(i){ sel[i.value]=1; });
  if(!Object.keys(sel).length&&_nfR.hfac) sel=_nfR.hfac; _nfR.hfac=null; box.innerHTML=nfrFacOpts(st.value,sel); }
function nfrTitleForm(T,ref){
  var D=NF_TITLE[T], S=_scSupervisors||{}, y=new Date().getFullYear(), u=ref?nfrPioRec(ref):null, p=nfrTObj(T,u)||{}, kind=ref?ref.slice(0,3):'';
  var cand=Object.keys(S).filter(function(k){ return S[k]&&!S[k].disabled&&!S[k][D.field]; }).sort(function(a,b){ return String(S[a].name||a).localeCompare(String(S[b].name||b)); });
  if(!ref&&!D.hon&&!cand.length){ showToast(Object.keys(S).length?'Every Quality Mentor already has this title.':'Add a Supervisor (Quality Mentor) in Setup first.','err'); return; }
  var stAll={}; cand.forEach(function(k){ nfrSupStates(S[k]).forEach(function(s){ stAll[s]=1; }); });
  var hon=kind==='hon'?u:{}; _nfR.hfac=Object.assign({},(hon&&hon.facilities)||{}); _nfR.tt=T;
  var stOpts=(NF_STATE_LIST||[]).slice().sort(function(a,b){ return a[0].localeCompare(b[0]); }).map(function(s){ return '<option value="'+s[1]+'"'+(hon.st===s[1]?' selected':'')+'>'+scEsc(s[0])+'</option>'; }).join('');
  var n=1, step=function(t){ return ref?t:(n++)+' · '+t; };
  var ov=document.createElement('div'); ov.className='nfr-ov'; ov.id='nfr-ov';
  ov.innerHTML='<form class="nfr-form" onsubmit="event.preventDefault();nfrTitleSave(\''+T+'\',\''+scJs(ref||'')+'\');"><div class="nfr-fh"><b>'+(ref?'Edit '+scEsc(D.en):'Give '+scEsc(D.en)+' title')+'</b><button type="button" onclick="nfrClose()" title="Close">✕</button></div>'
    +(ref||!D.hon?'':'<fieldset><legend>'+step('Who')+'</legend><div class="nfr-kind"><label data-k="sup"'+(cand.length?'':' class="dis"')+'><input type="radio" name="nfr-pk" value="sup"'+(cand.length?'':' disabled')+' onchange="nfrPioKind(\'sup\')"> <b>A Quality Mentor</b><small>'+(cand.length?'Has a Supervisor login':'Every Quality Mentor already has the title')+'</small></label>'
      +'<label data-k="hon"><input type="radio" name="nfr-pk" value="hon" onchange="nfrPioKind(\'hon\')"> <b>Someone without a login</b><small>e.g. assessor, senior official, HealSol leader</small></label></div></fieldset>')
    +((!ref&&cand.length)||kind==='sup'?'<fieldset id="nfr-pk-sup"><legend>'+(ref?'Quality Mentor':step('Quality Mentor'))+'</legend>'+(kind==='sup'?'<b>'+scEsc(u.name||'')+'</b>'
      :'<div class="nfr-2"><label>State<select id="nfr-pst" onchange="nfrPioList()"><option value="">All states</option>'+Object.keys(stAll).sort().map(function(s){ return '<option>'+scEsc(s)+'</option>'; }).join('')+'</select></label>'
      +'<label>Search<input id="nfr-pq" placeholder="Name" oninput="nfrPioList()"></label></div><label>Quality Mentor<select id="nfr-sup" size="5"></select></label>')+'</fieldset>':'')
    +(D.hon&&(!ref||kind==='hon')?'<fieldset id="nfr-pk-hon"><legend>Person</legend><label>Full name<input id="nfr-hn" maxlength="60" placeholder="e.g. Dr. Manish Singh" value="'+scEsc(hon.name||'')+'"></label>'
      +'<div class="nfr-2"><label>Designation<input id="nfr-hd" maxlength="60" placeholder="e.g. Founder &amp; Director" value="'+scEsc(hon.designation||'')+'"></label><label>Organisation <small>(optional)</small><input id="nfr-ho" maxlength="60" placeholder="e.g. HealSol Academy" value="'+scEsc(hon.org||'')+'"></label></div>'
      +'<label>State<select id="nfr-hst" onchange="nfrHonFacs()"><option value="">Choose a state…</option>'+stOpts+'</select></label>'
      +'<label>Facilities they helped <small>(optional; their card then shows facilities mentored, NQAS Ready and people covered)</small></label><div class="nfr-fbox" id="nfr-hfac"></div></fieldset>':'')
    +(D.cit?'<fieldset><legend>'+step('Citation')+'</legend><label>Year<select id="nfr-py">'+[y,y-1].map(function(v){ return '<option'+(String(p.year||y)===String(v)?' selected':'')+'>'+v+'</option>'; }).join('')+'</select></label>'
      +'<label>Citation <small>(one line, up to 160 letters)</small><textarea id="nfr-pc" maxlength="160" rows="2" placeholder="e.g. 20 years of building quality of care in Uttar Pradesh">'+scEsc(p.citation||'')+'</textarea></label>'
      +'<label class="nfr-sw"><input type="checkbox" id="nfr-pshow"'+(p.show!==false?' checked':'')+'><i></i> Show citation on the public Verify page</label></fieldset>'
      :'<fieldset><legend>'+step('Contribution')+'</legend><label>What HealSol looked at <small>(for HealSol only; not shown publicly)</small><textarea id="nfr-pn" maxlength="300" rows="3" placeholder="e.g. State NQAS assessor; mentored 12 sub-centres in Jhansi, 9 NQAS Ready; trains CHOs monthly">'+scEsc(p.note||'')+'</textarea></label></fieldset>')
    +(ref?'':'<fieldset><legend>'+step('Criteria')+'</legend><ol class="nfr-clist">'+nfrCritLines(T).map(function(x){ return '<li>'+scEsc(x)+'</li>'; }).join('')+'</ol>'
      +'<label class="nfr-tick"><input type="checkbox" id="nfr-pok"> I confirm this person meets the '+scEsc(D.en)+' criteria set by HealSol.</label></fieldset>')
    +'<div class="nfr-err" id="nfr-err"></div><div class="nfr-fb"><button type="button" class="nfr-btn ghost" onclick="nfrClose()">Cancel</button><button type="submit" class="nfr-btn">'+(ref?'Save changes':'Give title')+'</button></div></form>';
  ov.addEventListener('click',function(e){ if(e.target===ov) nfrClose(); });
  document.body.appendChild(ov); _nfR.cand=cand;
  if(!ref){ var k0=cand.length||!D.hon?'sup':'hon'; var rb=ov.querySelector('input[name=nfr-pk][value='+k0+']'); if(rb) rb.checked=true; nfrPioKind(k0); if(cand.length) nfrPioList(); }
  else _nfR.pk=kind;
  nfrHonFacs();
}
function nfrPioForm(ref){ return nfrTitleForm('pioneer',ref); }
function nfrPioList(){ var S=_scSupervisors||{}, sel=document.getElementById('nfr-sup'); if(!sel||sel.tagName!=='SELECT') return; var st=document.getElementById('nfr-pst').value, q=document.getElementById('nfr-pq').value.trim().toLowerCase(), cur=sel.value;
  var L=(_nfR.cand||[]).filter(function(k){ var u=S[k]; return (!st||nfrSupStates(u).indexOf(st)>=0)&&(!q||String(u.name||k).toLowerCase().indexOf(q)>=0); });
  sel.innerHTML=L.map(function(k){ var u=S[k], lv=u.impact&&u.impact.level; return '<option value="'+scEsc(k)+'"'+(k===cur?' selected':'')+'>'+scEsc(u.name||k)+' · '+nfrFacN(u)+(nfrSupStates(u).length?' · '+scEsc(nfrSupStates(u).join(', ')):'')+(lv&&NF_LEVEL[lv]?' · '+scEsc(NF_LEVEL[lv].en):'')+'</option>'; }).join('')||'<option value="" disabled>No Quality Mentor matches</option>';
  if(!sel.value&&L.length) sel.value=L[0]; }   // a name is always chosen (the first one) so the form never says "Choose the Quality Mentor" by surprise
async function nfrTitleSave(T,editRef){
  var D=NF_TITLE[T], err=document.getElementById('nfr-err'), g=function(i){ var e=document.getElementById(i); return e?String(e.value||'').trim():''; };
  var kind=editRef?editRef.slice(0,3):(D.hon?(_nfR.pk||'sup'):'sup'), ref=editRef, hon=null, p={};
  if(kind==='sup'&&!ref){ var sid=g('nfr-sup'); if(!sid||!(_scSupervisors||{})[sid]){ err.textContent='Tap a name in the Quality Mentor list.'; return; } ref='sup:'+sid; }
  if(kind==='hon'){ hon={name:g('nfr-hn'),designation:g('nfr-hd'),org:g('nfr-ho'),st:g('nfr-hst')}; var fs={}; document.querySelectorAll('#nfr-hfac input:checked').forEach(function(i){ fs[i.value]=true; }); hon.facilities=Object.keys(fs).length?fs:null;
    if(hon.name.length<3){ err.textContent='Enter the person\'s full name.'; return; } if(!hon.designation){ err.textContent='Enter the designation.'; return; } if(!hon.st){ err.textContent='Choose the state.'; return; }
    hon.state=nfrStateName(hon.st); if(!hon.org) hon.org=null; }
  if(D.cit){ p.citation=g('nfr-pc').replace(/\s+/g,' '); p.year=g('nfr-py'); p.show=!!document.getElementById('nfr-pshow').checked; if(p.citation.length<10){ err.textContent='Write a short citation (why this person is a '+D.en+').'; return; } }
  else { p.note=g('nfr-pn').replace(/\s+/g,' '); if(p.note.length<10){ err.textContent='Write what HealSol looked at (their active contribution).'; return; } }
  if(!editRef&&!(document.getElementById('nfr-pok')||{}).checked){ err.textContent='Confirm that the person meets the '+D.en+' criteria.'; return; }
  var by=nfrBy(), now=scNowIso();
  if(kind==='hon'&&!ref){ ref='hon:H'+Date.now().toString(36)+Math.floor(Math.random()*1296).toString(36); }
  var u=nfrPioRec(ref)||{}, old=nfrTObj(T,u)||{}; p.by=editRef?(old.by||by):by; p.at=editRef?(old.at||now):now; if(editRef){ p.updatedBy=by; p.updatedAt=now; }
  var base=nfrPioBase(ref), ok;
  if(kind==='hon'){ var rec=Object.assign({},u,hon,{removed:null,addedBy:u.addedBy||by,at:u.at||now}); rec[D.field]=p; delete rec.impact; ok=await fbSet(base,JSON.parse(JSON.stringify(rec)));
    if(ok){ _nfR.hon=_nfR.hon||{}; _nfR.hon[ref.slice(4)]=rec; } }
  else ok=await fbSet(base+'/'+D.field,p);
  if(!ok){ err.textContent='Could not save.'; return; }
  var lk='P'+Date.now().toString(36), le={act:editRef?'edited':'given',by:by,at:now}; if(D.cit){ le.year=p.year; le.citation=p.citation; } else le.note=p.note;
  await fbSet(base+'/'+D.log+'/'+lk,le);
  u=nfrPioRec(ref); u[D.field]=p; u[D.log]=u[D.log]||{}; u[D.log][lk]=le; nfrClose();
  showToast(editRef?'Saved.':(u.name||'')+' is now a '+D.en+'. Tap "Update cards now" to make the card.','ok'); nfrRender(); }
function nfrPioSave(r){ return nfrTitleSave('pioneer',r); }
async function nfrTitleShow(T,ref,on){ var u=nfrPioRec(ref), f=NF_TITLE[T].field; var ok=await fbSet(nfrPioBase(ref)+'/'+f+'/show',!!on); if(ok&&u&&typeof u[f]==='object') u[f].show=!!on;
  showToast(ok?(on?'Citation will show on the Verify page from the next update.':'Citation hidden from the Verify page from the next update.'):'Could not save.',ok?'ok':'err'); }
async function nfrCardNums(ref,on){ var u=nfrPioRec(ref); var ok=await fbSet(nfrPioBase(ref)+'/cardNums',on?true:null); if(ok&&u){ if(on) u.cardNums=true; else delete u.cardNums; }
  showToast(ok?(on?'Numbers will show on the card from the next update.':'Numbers hidden on the card from the next update.'):'Could not save.',ok?'ok':'err'); nfrRender(); }
function nfrPioShow(r,on){ return nfrTitleShow('pioneer',r,on); }
async function nfrTitleRemove(T,ref){ var D=NF_TITLE[T], u=nfrPioRec(ref); if(!u) return; var hon=ref.slice(0,3)==='hon';
  var after=hon?'Their impact card and Verify link stop working from the next update.'
    :T==='leader'?(u.pioneer?'They stay a Quality Pioneer.':'They will have no level from the next update; their Verify link stops working.')
    :(u.leader?'They return to Quality Leader from the next update.':'They will have no level from the next update; their Verify link stops working.');
  var v=await scDialog({title:'Remove '+D.en+' title?',icon:'⚠️',okLabel:'Remove title',message:after+' The record stays in History.',fields:[{key:'reason',label:'Reason (kept in history)',required:true,type:'textarea',placeholder:'e.g. Left the programme'}]}); if(!v) return;
  var by=nfrBy(), now=scNowIso(), p=nfrTObj(T,u)||{}, base=nfrPioBase(ref), ok=await fbSet(base+'/'+D.field,null); if(!ok){ showToast('Could not save.','err'); return; }
  if(hon) await fbSet(base+'/removed',true);
  var lk='P'+Date.now().toString(36), le={act:'removed',year:p.year||'',reason:String(v.reason||'').trim(),by:by,at:now}; await fbSet(base+'/'+D.log+'/'+lk,le);
  delete u[D.field]; if(hon) u.removed=true; u[D.log]=u[D.log]||{}; u[D.log][lk]=le; showToast('Title removed. '+after,'ok'); nfrRender(); }
function nfrPioRemove(r){ return nfrTitleRemove('pioneer',r); }
async function nfrPioImpact(ref){ var r=null; try{ r=await fbGet('sc_impact/'+nfrPioKey(ref)); }catch(e){} if(!r||!r.level||!r.publicId){ showToast('The card is made at the next update. Tap "Update cards now" first.','err'); return null; } await nfImpCfg(); return r; }
async function nfrPioCard(ref){ var r=await nfrPioImpact(ref); if(!r) return; showToast('Making the card…','ok');
  var c=await nfImpCanvas(r); if(!c){ showToast('Could not make the card on this device.','err'); return; }
  var a=document.createElement('a'); a.href=c.toDataURL('image/jpeg',0.9); a.download=String((NF_LEVEL[r.level]||{}).en||'Impact').replace(/\s+/g,'-')+'-'+String(r.name||'card').replace(/[^A-Za-z0-9]+/g,'-')+'.jpg'; document.body.appendChild(a); a.click(); a.remove(); }
async function nfrPioLink(ref){ var r=await nfrPioImpact(ref); if(!r) return; showToast('Preparing the card link…','ok'); var url=null; try{ url=await nfImpPublish(r); }catch(e){} if(!url) url=nfImpVerifyUrl(r);
  _nfImp.rec=r; nfImpCopy(url);
  await scDialog({title:'Card link copied',icon:'🔗',okLabel:'Done',message:'Paste it in WhatsApp or LinkedIn — it shows the card picture. On LinkedIn, Copy caption: "'+nfImpCaption(r,false)+'"\n\n'+url,fields:[]}); }
async function nfrUpdateNow(){ var b=document.getElementById('nfr-upd'); if(b){ b.disabled=true; b.innerHTML='<i class="ti ti-loader"></i> Updating…'; }
  try{ var r=await nfCall('refreshSummary',{all:true}); showToast('Cards updated for '+((r&&r.impact)||0)+' people.','ok'); }catch(e){ showToast(e.message||'Could not update.','err'); }
  if(b){ b.disabled=false; b.innerHTML='<i class="ti ti-refresh"></i> Update cards now'; } }
// left menu item (HealSol only), placed after Card editor
(function(){
  var oItems=nfAdminItems;
  nfAdminItems=function(){ var L=oItems.apply(this,arguments); if(nfAdminRole()!=='admin') return L;
    var i=L.findIndex(function(it){ return it.v==='setup'; }); if(i<0) i=L.length; L.splice(i,0,{v:'recog',l:'Impact & Recognition',icon:'ti-trophy',onclick:"nfAdminView('recog')"}); return L; };
  var oApply=nfAdminApply;
  nfAdminApply=function(){ document.body.classList.toggle('nfv-recog',_nfOv.view==='recog'); return oApply.apply(this,arguments); };
  var oView=nfAdminView;
  nfAdminView=function(v){ var r=oView.apply(this,arguments); if(v==='recog') nfrRender(true); return r; };
})();
// the nightly summary carries each person's contribution (used by functions/impact.js)
(function(){ var oS=nfSumFacility; nfSumFacility=function(st){ var s=oS.apply(this,arguments);
  try{ var P=st.progress||{}, S=st.staff||{}, pid=st.progId, present=scRolesFromRoster(S), A=st.agg, comp=nfgComp(st), imp={staff:{},rev:{}}, f=st.fac||{}, D=nfgDates(f);
    var roleDay=function(role,di){ var d=scDayDef(pid,di); return !!(d&&(d.cps||[]).some(function(cp){ return scCpForRoleIn(cp,role,present); })); };
    var onTime=function(r,di){ var w=r.doneAt||r.updatedAt; return !!(r.taskDone&&D&&w&&nfLocalISO(w)<=nfgAdd(D.start,di)); };
    // programme window (Day 1 → close date, or the end of a catch-up) — Champion checks after it do not count
    var cu=f.catchup||{}, wEnd=D?D.close:null; if(cu.on&&cu.end&&(!wEnd||cu.end>wEnd)) wEnd=cu.end;
    var today=scTodayStr(); imp.wEnd=wEnd||null; imp.closed=!!(wEnd&&today>wEnd)||!!(s.grad&&!(cu.on&&cu.end&&today<=cu.end));
    (A.staff||[]).forEach(function(x){ if(!x.inRoster) return; var m=x.mob, any=false, bl=true, started=false, iT=0, iO=0, eT=0, eD=0, PM=P[m]||{};
      for(var di=0;di<7;di++){ if(!roleDay(x.role,di)) continue; any=true; var r0=PM['day_'+di]||{}; if(r0.taskDone) started=true; else bl=false; }
      for(var dj=7;dj<=48;dj++){ if(!roleDay(x.role,dj)) continue; iT++; if(onTime(PM['day_'+dj]||{},dj)) iO++; }
      for(var dk=49;dk<=55;dk++){ if(!roleDay(x.role,dk)) continue; eT++; if((PM['day_'+dk]||{}).taskDone) eD++; }
      var fixed=0, gaps=0, L=(x.res&&x.res.latest)||{}; Object.keys(L).forEach(function(id){ var o=L[id]; if(o&&o.base!=null&&o.base<2){ gaps++; if(o.score===2) fixed++; } });
      var pc=comp.people.find(function(q){ return q.mob===m; })||{};
      imp.staff[m]={baseline:any&&bl,started:started,onTime:pc.on||0,fixed:fixed,gaps:gaps,implOn:iO,implTot:iT,endDone:eD,endTot:eT,name:x.name}; });
    // Champion help: unique cards checked inside the window, out of the cards the staff completed (Days 1–56)
    var R=function(id){ return imp.rev[id]=imp.rev[id]||{cards:0,n:0,ch:0,chk:0}; }, done=0, ok=function(id){ return /^[A-Za-z0-9_-]+$/.test(id||''); }, inWin=function(t){ return !wEnd||!t||nfLocalISO(t)<=wEnd; };
    Object.keys(P).forEach(function(m){ Object.keys(P[m]||{}).forEach(function(k){ var r=P[m][k]||{}, di=+String(k).replace('day_',''); var by={};
      if(r.taskDone&&di>=0&&di<=55) done++;
      if(r.verified&&ok(r.verifiedByMob)){ var q=R(r.verifiedByMob); q.cards++; var t=String(r.verifiedAt||''); if(t>(q.last||'')) q.last=t; if(inWin(t)) by[r.verifiedByMob]=1; }
      Object.keys(r.blRev||{}).forEach(function(ck){ Object.keys(r.blRev[ck]||{}).forEach(function(kk){ var e=r.blRev[ck][kk]; if(!e||!ok(e.byId)) return; var x=R(e.byId); x.n++; if(e.r&&e.r!=='ok') x.ch++; var t2=String(e.at||''); if(t2>(x.last||'')) x.last=t2; if(inWin(t2)) by[e.byId]=1; }); });
      if(r.taskDone&&di>=0&&di<=55) Object.keys(by).forEach(function(id){ R(id).chk++; }); }); });
    imp.done=done;
    s.imp=scClean(imp);
  }catch(e){ console.warn('[SC] impact in summary',e); }
  return s; }; })();
