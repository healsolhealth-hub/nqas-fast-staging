
// ══════════════════════════════════════════════════════════════
// STEP 4 — STATE / DONOR DASHBOARD (view only), built on the nightly views (functions/views.js)
//  Logins: sc_viewers/{id} = {name, kind: 'state'|'donor', portfolio, org, disabled}; the sign-in carries claim "view".
//  Data:   sc_views/{portfolio} — totals, drill-down roll-ups, facility rows (numbers only), trend, common gaps, staff levels.
//  HealSol: left menu "State & Donor" — portfolios (states / districts / blocks / facilities), logins, public page.
//  Staff names and mobile numbers are never part of these dashboards.
// ══════════════════════════════════════════════════════════════
var NF_AOC_NAMES={A:'Service Provision',B:'Patient Rights',C:'Inputs',D:'Support Services',E:'Clinical Services',F:'Infection Control',G:'Quality Management',H:'Outcome'};
var _nfD={v:null,lvl:'all',st:'',di:'',bl:'',mode:'',who:null,tab:'ports',ports:null,viewers:null,cfg:null};
function nfDSlug(x){ return String(x||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
function nfDInr(n){ return Number(n||0).toLocaleString('en-IN'); }
function nfDBig(n){ n=Number(n||0); if(n>=1e7) return (n/1e7).toFixed(n>=1e8?0:1).replace(/\.0$/,'')+' crore'; if(n>=1e5) return (n/1e5).toFixed(n>=1e6?0:1).replace(/\.0$/,'')+' lakh'; return nfDInr(n); }
function nfDPct(a,b){ return b?Math.round(a/b*100):0; }
// the roll-up for the current place, and its key prefix
function nfDKeys(){ var sk=nfDSlug(_nfD.st), dk=sk+'__'+nfDSlug(_nfD.di), bk=dk+'__'+nfDSlug(_nfD.bl||'no-block'); return {sk:sk,dk:dk,bk:bk}; }
function nfDRoll(v){ var R=v.roll||{}, K=nfDKeys(); return _nfD.lvl==='state'?(R.state||{})[K.sk]:_nfD.lvl==='district'?(R.district||{})[K.dk]:_nfD.lvl==='block'?(R.block||{})[K.bk]:R.all; }
function nfDRows(v){ var F=v.fac||{}; return Object.keys(F).map(function(c){ return Object.assign({code:c},F[c]); }).filter(function(r){
  if(_nfD.lvl==='all') return true; if(r.st!==_nfD.st) return false; if(_nfD.lvl==='state') return true; if(nfDSlug(r.di)!==nfDSlug(_nfD.di)) return false; if(_nfD.lvl==='district') return true; return nfDSlug(r.bl||'no-block')===nfDSlug(_nfD.bl||'no-block'); }); }
function nfDChildren(v){ var R=v.roll||{}, K=nfDKeys(), pick=function(obj,pre){ return Object.keys(obj||{}).filter(function(k){ return !pre||k.indexOf(pre+'__')===0&&k.split('__').length===pre.split('__').length+1; }).map(function(k){ return Object.assign({key:k},obj[k]); }).sort(function(a,b){ return String(a.name).localeCompare(String(b.name)); }); };
  if(_nfD.lvl==='all') return {lvl:'state',label:'State',rows:pick(R.state)};
  if(_nfD.lvl==='state') return {lvl:'district',label:'District',rows:pick(R.district,K.sk)};
  if(_nfD.lvl==='district') return {lvl:'block',label:'Block',rows:pick(R.block,K.dk)};
  return null; }
function nfDGo(lvl,name){ if(lvl==='all'){ _nfD.lvl='all'; _nfD.st=_nfD.di=_nfD.bl=''; }
  else if(lvl==='state'){ _nfD.lvl='state'; _nfD.st=name; _nfD.di=_nfD.bl=''; }
  else if(lvl==='district'){ _nfD.lvl='district'; _nfD.di=name; _nfD.bl=''; }
  else if(lvl==='block'){ _nfD.lvl='block'; _nfD.bl=name; }
  nfDRender(); try{ var el=document.getElementById('nfd-body'); if(el) el.scrollIntoView({block:'start'}); }catch(e){} }
function nfDGoIdx(i){ var c=nfDChildren(_nfD.v); if(!c) return; var r=c.rows[i]; if(r) nfDGo(c.lvl,r.name); }
function nfDTile(v,l,s,cls){ return '<div class="nfd-t '+(cls||'')+'"><b>'+v+'</b><span>'+scEsc(l)+'</span>'+(s?'<small>'+s+'</small>':'')+'</div>'; }
function nfDGapsHTML(v){ var rows=nfDLevelRows(v), g;
  if(_nfD.lvl==='all'&&!_nfD.type) g=(v.gaps||{}).aoc||[];
  else { var o={}; rows.forEach(function(r){ if(!(r.assessed>0)) return; Object.keys(r.aoc||{}).forEach(function(k){ if(r.aoc[k]<70) o[k]=(o[k]||0)+1; }); }); g=Object.keys(o).map(function(k){ return {k:k,n:o[k]}; }).sort(function(a,b){ return b.n-a.n; }).slice(0,6); }
  var n=Math.max(1,rows.filter(function(r){ return r.assessed>0; }).length), std=_nfD.lvl==='all'&&!_nfD.type?((v.gaps||{}).std||[]):[];
  if(!g.length&&!std.length) return '<p class="nfd-muted">No common gaps — every assessed area is at the NQAS line.</p>';
  return g.map(function(x){ var p=nfDPct(x.n,n); return '<div class="nfd-gap"><span><b>AoC '+x.k+'</b> '+scEsc(NF_AOC_NAMES[x.k]||'')+'</span><i><em style="width:'+p+'%"></em></i><small>'+x.n+' facilit'+(x.n===1?'y':'ies')+' below 70%</small></div>'; }).join('')
    +(std.length?'<p class="nfd-std"><b>Standards most often below 50%:</b> '+std.map(function(x){ return scEsc(x.k)+' ('+x.n+')'; }).join(' · ')+'</p>':''); }
function nfDTrendHTML(v){ var T=(v.trend||[]).filter(function(x){ return x.avg!=null||x.ready; }); if(T.length<2) return '<p class="nfd-muted">The month-by-month line appears after two month-ends of data.</p>';
  var W=600,H=170,P=28, mx=Math.max(1,Math.max.apply(null,T.map(function(x){ return x.ready||0; }))), xs=function(i){ return P+i*(W-2*P)/(T.length-1); }, ys=function(p){ return H-P-(p/100)*(H-2*P); };
  var bars=T.map(function(x,i){ var h=(x.ready||0)/mx*(H-2*P)*0.6; return '<rect x="'+(xs(i)-7)+'" y="'+(H-P-h)+'" width="14" height="'+h+'" rx="3" class="b"><title>'+x.m+': '+(x.ready||0)+' NQAS Ready</title></rect>'; }).join('');
  var pts=T.filter(function(x){ return x.avg!=null; }).map(function(x){ var i=T.indexOf(x); return xs(i)+','+ys(x.avg); }).join(' ');
  var dots=T.map(function(x,i){ return x.avg==null?'':'<circle cx="'+xs(i)+'" cy="'+ys(x.avg)+'" r="4" class="d"><title>'+x.m+': average '+x.avg+'%</title></circle><text x="'+xs(i)+'" y="'+(ys(x.avg)-8)+'" class="v">'+x.avg+'%</text>'; }).join('');
  var lbl=T.map(function(x,i){ var d=new Date(x.m+'-01T00:00:00'); return '<text x="'+xs(i)+'" y="'+(H-8)+'" class="m">'+d.toLocaleString('en-IN',{month:'short'})+'</text>'; }).join('');
  return '<svg viewBox="0 0 '+W+' '+H+'" class="nfd-svg" role="img" aria-label="Average readiness and NQAS Ready facilities by month"><line x1="'+P+'" x2="'+(W-P)+'" y1="'+ys(70)+'" y2="'+ys(70)+'" class="l70"/><text x="'+(W-P)+'" y="'+(ys(70)-4)+'" class="t70">NQAS line 70%</text>'+bars+'<polyline points="'+pts+'" class="ln"/>'+dots+lbl+'</svg>'
    +'<div class="nfd-leg"><span class="a">● Average readiness</span><span class="r">▮ NQAS Ready facilities</span></div>'; }
function nfDStatusChip(r){ var done=r.grad||r.phase==='complete'||(r.day&&r.day>60); var c=r.comp==='g'?['On track','g']:r.comp==='a'?['Slipping','a']:r.comp==='r'?['Behind','r']:done?['Completed','n']:['Not started','n']; if(r.cu) c=['Catch-up','a']; return '<span class="nfd-chip '+c[1]+'">'+c[0]+'</span>'; }
function nfDResult(r){ if(r.nh==='certified') return '<span class="nfd-chip gd">🏅 Certified'+(r.ns!=null?' '+r.ns+'%':'')+'</span>'; if(r.grad==='ready') return '<span class="nfd-chip g">NQAS Ready</span>'; if(r.grad==='almost') return '<span class="nfd-chip a">Almost ready</span>'; if(r.grad) return '<span class="nfd-chip n">Not yet</span>'; return '<span class="nfd-muted">In programme</span>'; }
// ── B (22 Oct 2026): every facility type, the shared result words, State → District → Block → Facility, phone layout ──
var NF_D_RES=[['ready','NQAS Ready','g'],['almost','Almost ready','a'],['notyet','Not yet ready','r'],['early','Too early','e'],['none','Not started','n']];
function nfDResOf(r){ var k=r.res;
  if(!k) k=r.grad?r.grad:!(r.assessed>0)?'none':(r.cov!=null&&r.cov<50)?'early':r.meets?'ready':(r.pct||0)>=70?'almost':'notyet';
  if(k==='incomplete') k='notyet'; if(k==='none'&&r.day>0) k='early'; return k; }
function nfDTypes(v){ var t={}; Object.keys(v.fac||{}).forEach(function(c){ var x=(v.fac[c].t||'sc'); t[x]=(t[x]||0)+1; }); return t; }
function nfDType(t){ _nfD.type=t; nfDRender(); }
function nfDTypeLbl(t){ return t==='sc'?'SC':String(t||'').toUpperCase(); }
function nfDAgg(rows){ var A={n:rows.length,started:0,assessed:0,sum:0,sumB:0,nb:0,certified:0,onTrack:0,slipping:0,behind:0,pop:0,popReady:0,res:{},types:{}};
  rows.forEach(function(r){ var k=nfDResOf(r); A.res[k]=(A.res[k]||0)+1; A.types[r.t||'sc']=(A.types[r.t||'sc']||0)+1;
    if(r.day>0) A.started++; if(r.assessed>0&&r.pct!=null){ A.assessed++; A.sum+=r.pct; if(r.base!=null){ A.nb++; A.sumB+=r.base; } }
    if(r.nh==='certified') A.certified++; if(r.comp==='g') A.onTrack++; else if(r.comp==='a') A.slipping++; else if(r.comp==='r') A.behind++;
    if(r.pop){ A.pop+=r.pop; if(r.grad==='ready'||r.nh==='certified') A.popReady+=r.pop; } });
  A.avg=A.assessed?Math.round(A.sum/A.assessed):null; A.avgB=A.nb?Math.round(A.sumB/A.nb):null;
  var withB=rows.filter(function(r){ return r.assessed>0&&r.pct!=null&&r.base!=null; }); A.gain=withB.length?Math.round(withB.reduce(function(n,r){ return n+r.pct-r.base; },0)/withB.length):null;
  return A; }
function nfDTypesTxt(T){ return ['sc','uphc','phc','chc'].filter(function(t){ return T[t]; }).map(function(t){ return nfDTypeLbl(t)+' '+T[t]; }).join(' · '); }
function nfDLevelRows(v){ return nfDRows(v).filter(function(r){ return !_nfD.type||(r.t||'sc')===_nfD.type; }); }
function nfDKids(rows){ var lvl=_nfD.lvl==='all'?'state':_nfD.lvl==='state'?'district':_nfD.lvl==='district'?'block':null; if(!lvl) return null;
  var G={}; rows.forEach(function(r){ var k=lvl==='state'?r.st:lvl==='district'?r.di:(r.bl||'No block'); (G[k]=G[k]||[]).push(r); });
  var list=Object.keys(G).sort(function(a,b){ return a.localeCompare(b); }).map(function(k){ return {name:k,A:nfDAgg(G[k])}; });
  return {lvl:lvl,label:lvl==='state'?'States':lvl==='district'?'Districts':'Blocks',rows:list}; }
function nfDKid(i){ var K=nfDKids(nfDLevelRows(_nfD.v)); if(!K) return; var r=K.rows[i]; if(r) nfDGo(K.lvl,r.name); }
function nfDResChip(r){ var k=nfDResOf(r), d=NF_D_RES.filter(function(x){ return x[0]===k; })[0]||NF_D_RES[4]; if(r.nh==='certified') return '<span class="nfd-chip gd">NHSRC certified</span>'; return '<span class="nfd-rc '+d[2]+'">'+d[1]+'</span>'; }
function nfDResBar(A){ var tot=Math.max(1,A.n), seg=NF_D_RES.map(function(x){ var n=A.res[x[0]]||0; return n?'<i class="'+x[2]+'" style="width:'+(100*n/tot)+'%" title="'+x[1]+': '+n+'"><span>'+n+'</span></i>':''; }).join('');
  return '<div class="nfd-card"><div class="nfd-h"><h3>If they graduated today</h3><small>the same words as every facility screen</small></div><div class="nfd-rbar">'+seg+'</div>'
    +'<div class="nfd-rleg">'+NF_D_RES.map(function(x){ return '<span><i class="'+x[2]+'"></i>'+x[1]+' <b>'+(A.res[x[0]]||0)+'</b></span>'; }).join('')+'</div></div>'; }
function nfDHTML(v){
  var T=nfDTypes(v), rows=nfDLevelRows(v), A=nfDAgg(rows), K=nfDKids(rows), S=v.staff||{}, donor=v.kind!=='state', names=v.names!==false;
  var crumbs=[['all',v.kind==='state'?'All':'Portfolio']];
  if(_nfD.lvl!=='all') crumbs.push(['state',_nfD.st]); if(_nfD.lvl==='district'||_nfD.lvl==='block') crumbs.push(['district',_nfD.di]); if(_nfD.lvl==='block') crumbs.push(['block',_nfD.bl||'No block']);
  var h='<nav class="nfd-crumbs" aria-label="Breadcrumb">'+crumbs.map(function(c,i){ return i===crumbs.length-1?'<b>'+scEsc(c[1])+'</b>':'<a href="#" onclick="event.preventDefault();nfDGo(\''+c[0]+'\',\''+scJs(c[1])+'\')">'+scEsc(c[1])+'</a>'; }).join(' › ')+'</nav>';
  if(Object.keys(T).length>1){ var all=nfDRows(v), cnt={}; all.forEach(function(r){ cnt[r.t||'sc']=(cnt[r.t||'sc']||0)+1; });
    h+='<div class="nfd-types" role="group" aria-label="Facility type">'+[['','All',all.length]].concat(['sc','uphc','phc','chc'].filter(function(t){ return cnt[t]; }).map(function(t){ return [t,nfDTypeLbl(t),cnt[t]]; })).map(function(x){ return '<button type="button" class="'+((_nfD.type||'')===x[0]?'on':'')+'" aria-pressed="'+((_nfD.type||'')===x[0])+'" onclick="nfDType(\''+x[0]+'\')">'+x[1]+' '+x[2]+'</button>'; }).join('')+'</div>'; }
  var tRead='<div class="nfd-t '+(donor?'':'hero')+'"><span>Average readiness</span><b>'+(A.avg!=null?A.avg+'%':'—')+'</b><small>'+(A.gain!=null?(A.gain>=0?'+':'')+A.gain+' since baseline'+(A.avgB!=null?' ('+A.avgB+'%)':''):'baseline not yet')+'</small></div>';
  var tPeople='<div class="nfd-t '+(donor?'hero':'')+'"><span>People served by NQAS Ready facilities</span><b>'+nfDBig(A.popReady)+'</b><small>of '+nfDBig(A.pop)+' covered</small></div>';
  h+='<div class="nfd-tiles">'+(donor?tPeople+tRead:tRead)
    +'<div class="nfd-t"><span>Facilities</span><b>'+nfDInr(A.n)+'</b><small>'+nfDInr(A.started)+' started · '+nfDInr(A.n-A.started)+' not yet</small></div>'
    +'<div class="nfd-t g"><span>NQAS Ready</span><b>'+nfDInr(A.res.ready||0)+'</b><small>+'+nfDInr(A.res.almost||0)+' almost ready</small></div>'
    +'<div class="nfd-t gd"><span>NHSRC certified</span><b>'+nfDInr(A.certified)+'</b><small>'+(A.n?nfDPct(A.certified,A.n)+'% of facilities':'')+'</small></div>'
    +(donor?'':tPeople)+'</div>';
  h+=nfDResBar(A);
  // main column: the next level down (or the facilities), side column: trend + gaps
  var main='';
  if(K&&K.rows.length&&!(K.lvl==='block'&&K.rows.length===1&&K.rows[0].name==='No block')){
    main+='<div class="nfd-card"><div class="nfd-h"><h3>'+K.label+'</h3><small>click a row → '+(K.lvl==='state'?'districts':K.lvl==='district'?'blocks':'facilities')+'</small></div><div class="nfd-tw"><table class="nfd-tb nfd-kids"><thead><tr><th>'+K.label.replace(/s$/,'')+'</th><th>Readiness (baseline → now)</th><th class="c">Ready</th><th class="c">Almost</th><th class="c">Not yet</th><th class="c">Too early</th><th>On schedule</th></tr></thead><tbody>'
      +K.rows.map(function(x,i){ var a=x.A; return '<tr onclick="nfDKid('+i+')" class="'+(a.behind>a.onTrack/2&&a.behind>1?'w':'')+'"><td data-l=""><b>'+scEsc(x.name)+'</b><small>'+a.n+' · '+scEsc(nfDTypesTxt(a.types))+'</small></td>'
        +'<td data-l="Readiness">'+(a.avg==null?'—':(a.avgB!=null?a.avgB+'% → ':'')+'<b>'+a.avg+'%</b>'+(a.gain!=null?' <b class="'+(a.gain>=0?'up':'down')+'">'+(a.gain>=0?'+':'')+a.gain+'</b>':''))+'</td>'
        +'<td data-l="Ready" class="c">'+(a.res.ready||0)+'</td><td data-l="Almost" class="c">'+(a.res.almost||0)+'</td><td data-l="Not yet" class="c">'+(a.res.notyet||0)+'</td><td data-l="Too early" class="c">'+(a.res.early||0)+'</td>'
        +'<td data-l="On schedule">'+a.onTrack+' on track'+(a.behind?' · <span class="nfd-bh">'+a.behind+' behind</span>':'')+'</td></tr>'; }).join('')+'</tbody></table></div></div>'; }
  if(_nfD.lvl==='block'||_nfD.lvl==='district'&&(!K||K.rows.length<=1)||rows.length<=40&&_nfD.lvl!=='all'){
    var fr=rows.slice().sort(function(a,b){ return String(a.n||'').localeCompare(String(b.n||''))||String(a.code).localeCompare(String(b.code)); });
    main+='<div class="nfd-card"><div class="nfd-h"><h3>Facilities ('+fr.length+')</h3>'+(names?'':'<small>names shown only with HealSol\'s permission</small>')+'</div><div class="nfd-tw"><table class="nfd-tb nfd-facs"><thead><tr><th>Facility</th><th>Day</th><th>Readiness</th><th>Result</th><th>Timeline</th></tr></thead><tbody>'
      +fr.map(function(r,i){ var nm=r.n||(nfDTypeLbl(r.t)+' '+(i+1)); return '<tr onclick="nfDFac(\''+scJs(r.code)+'\')"><td data-l=""><b>'+scEsc(nm)+'</b> <span class="nfd-ty">'+nfDTypeLbl(r.t)+'</span><small>'+scEsc([r.bl,r.di].filter(Boolean).join(' · '))+'</small></td>'
        +'<td data-l="Day">'+(r.grad?'Graduated':r.day>0?r.day:'Not started')+'</td><td data-l="Readiness">'+(r.assessed&&r.pct!=null?(r.base!=null?r.base+'% → ':'')+'<b>'+r.pct+'%</b>':'—')+'</td>'
        +'<td data-l="Result">'+nfDResChip(r)+'</td><td data-l="Timeline">'+nfDStatusChip(r)+'</td></tr>'; }).join('')+'</tbody></table></div></div>'; }
  var side='<div class="nfd-card"><h3>Readiness over time</h3>'+(_nfD.lvl==='all'&&!_nfD.type?nfDTrendHTML(v):'<p class="nfd-muted">Shown for the whole portfolio, all types.</p>')+'</div>'
    +'<div class="nfd-card"><h3>Most common gaps</h3>'+nfDGapsHTML(v)+'</div>'
    +(_nfD.lvl==='all'&&!_nfD.type?'<div class="nfd-card"><h3>Staff recognised</h3><p class="nfd-st">'+nfDInr(S.total||0)+' staff · '+nfDInr(S.achiever||0)+' Quality Achievers · '+nfDInr(S.champion||0)+' Quality Champions</p></div>':'');
  h+='<div class="nfd-cols"><div class="nfd-main">'+(main||'<div class="nfd-card"><p class="nfd-muted">No facilities here'+(_nfD.type?' of this type':'')+'.</p></div>')+'</div><div class="nfd-side">'+side+'</div></div>';
  return h; }
function nfDFac(code){ var r=(_nfD.v.fac||{})[code]; if(!r) return; var A=r.aoc||{};
  var ov=document.createElement('div'); ov.className='nfd-ov';
  ov.innerHTML='<div class="nfd-modal" role="dialog" aria-modal="true"><div class="nfd-mh"><div><b>'+scEsc(r.n||nfDTypeLbl(r.t))+' <span class="nfd-ty">'+nfDTypeLbl(r.t)+'</span></b><small>'+scEsc([r.bl,r.di,r.st].filter(Boolean).join(' · '))+'</small></div><button type="button" onclick="this.closest(\'.nfd-ov\').remove()" aria-label="Close">✕</button></div>'
    +'<div class="nfd-mt">'+nfDTile(r.assessed&&r.pct!=null?r.pct+'%':'—','Readiness now',r.base!=null?'baseline '+r.base+'%':'')+nfDTile(r.day?(r.day>60?'Done':'Day '+r.day):'—','Programme',nfDStatusChip(r))+nfDTile(r.pop?nfDInr(r.pop):'—','People covered','')+'</div>'
    +'<p>'+nfDResChip(r)+(r.gp!=null?' <span class="nfd-muted">graduation score '+r.gp+'%</span>':'')+'</p><h4>Areas of Concern</h4>'
    +'ABCDEFGH'.split('').filter(function(k){ return A[k]!=null; }).map(function(k){ var p=A[k]; return '<div class="nfd-aoc"><span><b>'+k+'</b> '+scEsc(NF_AOC_NAMES[k])+'</span><i><em class="'+(p>=70?'ok':'lo')+'" style="width:'+p+'%"></em></i><b>'+p+'%</b></div>'; }).join('')
    +'<p class="nfd-muted">'+(r.gaps?r.gaps+' open gaps · ':'')+(r.stdB?r.stdB+' standards below 50% · ':'')+'NQAS line: every area 70%+, every standard 50%+.</p></div>';
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); }); document.body.appendChild(ov); }
// the page (State Admin / Donor app, or HealSol preview)
function nfDHeader(v){ var lg=v.logo?'<img class="nfd-plogo" src="'+v.logo+'" alt="">':'';
  return '<div class="nfd-top"><div class="nfd-brand"><img src="'+SC_BRAND.logoNqas+'" alt="NQAS"><img src="'+SC_BRAND.logoHealsol+'" alt="HealSol Academy">'+lg+'</div>'
    +'<div class="nfd-who">'+(_nfD.mode==='preview'?'<button type="button" class="nfd-btn ghost" onclick="nfDClose()">✕ Close preview</button>':'<span>'+scEsc((_nfD.who&&_nfD.who.name)||'')+'</span><button type="button" class="nfd-btn ghost" onclick="nfDLogout()"><i class="ti ti-logout"></i> Log out</button>')+'</div></div>'
    +'<div class="nfd-title"><div><h1>'+scEsc(v.name||'')+'</h1><small>'+(v.kind==='state'?'State dashboard':'Partner dashboard')+' · NQAS | FAST · updated '+scEsc(scFmtDate(String(v.at||'').slice(0,10)))+(v.demo?' · <b class="nfd-demo">includes demo facilities</b>':'')+'</small></div>'
    +'<div class="nfd-dl"><button type="button" class="nfd-btn" onclick="nfDPdf(this)"><i class="ti ti-download"></i> Report (PDF)</button><button type="button" class="nfd-btn ghost" onclick="nfDXlsx(this)"><i class="ti ti-download"></i> Excel</button></div></div>'; }
function nfDRender(){ var app=document.getElementById('nf-dash-app'); if(!app) return; var v=_nfD.v;
  if(!v){ app.innerHTML='<div class="nfd-wrap">'+nfDHeader({name:(_nfD.who&&_nfD.who.portName)||'Dashboard',kind:(_nfD.who&&_nfD.who.kind)||'donor'})+'<div class="nfd-card"><p>The dashboard is prepared every night. Please check again tomorrow, or ask HealSol to update it now.</p></div></div>'; return; }
  app.innerHTML='<div class="nfd-wrap">'+nfDHeader(v)+'<div id="nfd-body">'+nfDHTML(v)+'</div><p class="nfd-foot">Facility-level figures from NQAS | FAST · staff names are never shown · HealSol Academy</p></div>'; }
function nfDShow(){ var app=document.getElementById('nf-dash-app'); if(!app){ app=document.createElement('div'); app.id='nf-dash-app'; document.body.appendChild(app); } app.style.display='block'; document.body.classList.add('nfd-on'); nfDRender(); try{ window.scrollTo(0,0); }catch(e){} }
async function nfDOpenViewer(acc){
  var ls=document.getElementById('login-screen'); if(ls) ls.style.display='none';
  var w=acc.rec||await fbGet('sc_viewers/'+acc.id)||{}; _nfD.who={id:acc.id,name:w.name||acc.id,kind:w.kind,portName:''}; _nfD.mode='viewer'; _nfD.lvl='all'; _nfD.type=''; _nfD.st=_nfD.di=_nfD.bl='';
  _nfD.v=null; try{ _nfD.v=await fbGet('sc_views/'+w.portfolio); }catch(e){} nfDShow(); return true; }
function nfDClose(){ var app=document.getElementById('nf-dash-app'); if(app) app.style.display='none'; document.body.classList.remove('nfd-on'); _nfD.mode=''; }
async function nfDLogout(){ nfDClose(); _nfD.v=null; var ls=document.getElementById('login-screen'); if(ls) ls.style.display=''; try{ await nfSecureSignOut(); }catch(e){} try{ nfBack(); }catch(e){} }
// ── downloads ──
function nfDFile(){ return 'NQAS-FAST-'+String((_nfD.v&&_nfD.v.name)||'dashboard').replace(/[^A-Za-z0-9]+/g,'-')+'-'+scTodayStr(); }
async function nfDXlsx(btn){ var v=_nfD.v; if(!v) return; var old=btn&&btn.innerHTML; if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
  try{ var X=await nfLoadXlsx(), wb=X.utils.book_new(), R=v.roll.all||{}, S=v.staff||{};
    var sum=[['NQAS | FAST — '+v.name],['Updated',String(v.at||'').slice(0,10)],[],['Facilities',R.n],['Started',R.started],['Assessed',R.assessed],['Graduated',R.graduated],['NQAS Ready',R.ready],['NHSRC certified',R.certified],
      ['Average readiness %',R.avgPct],['Average gain since baseline (points)',R.avgGain],['On track',R.onTrack],['Slipping',R.slipping],['Behind',R.behind],['In catch-up',R.catchup],['People covered',R.pop],['People served by Ready / certified facilities',R.popReady],
      ['Staff recognised',S.total],['Quality Starters',S.starter],['Quality Practitioners',S.practitioner],['Quality Achievers',S.achiever],['Quality Champions',S.champion]];
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(sum),'Summary');
    var lvl=function(obj){ return [['Name','State','District','Facilities','Started','Average %','Gain','NQAS Ready','Certified','On track','Slipping','Behind','People']].concat(Object.keys(obj||{}).map(function(k){ var r=obj[k]; return [r.name,r.state||'',r.district||'',r.n,r.started,r.avgPct,r.avgGain,r.ready,r.certified,r.onTrack,r.slipping,r.behind,r.pop]; })); };
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(lvl(v.roll.district)),'Districts'); X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet(lvl(v.roll.block)),'Blocks');
    var F=v.fac||{}; X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([['Facility','Type','State','District','Block','Programme day','Readiness %','Baseline %','Timeline','Result','Graduation %','NHSRC','NHSRC score','People','Open gaps'].concat('ABCDEFGH'.split('').map(function(k){ return 'AoC '+k+' %'; }))].concat(Object.keys(F).map(function(c,i){ var r=F[c];
      return [r.n||(nfDTypeLbl(r.t)+' '+(i+1)),nfDTypeLbl(r.t),r.st,r.di,r.bl,r.day,r.assessed?r.pct:null,r.base,{g:'On track',a:'Slipping',r:'Behind'}[r.comp]||'',(NF_D_RES.filter(function(x){ return x[0]===nfDResOf(r); })[0]||NF_D_RES[4])[1],r.gp,r.nh||'',r.ns,r.pop,r.gaps].concat('ABCDEFGH'.split('').map(function(k){ return (r.aoc||{})[k]!=null?r.aoc[k]:null; })); }))),'Facilities');
    X.utils.book_append_sheet(wb,X.utils.aoa_to_sheet([['Month','Facilities','Average readiness %','NQAS Ready']].concat((v.trend||[]).map(function(t){ return [t.m,t.n,t.avg,t.ready]; }))),'By month');
    var how=await nfSaveWb(X,wb,nfDFile()+'.xlsx'); nfDoneToast(how); }
  catch(e){ showToast('Could not make the Excel file — check the internet.','err'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } } }
async function nfDPdf(btn){ var v=_nfD.v; if(!v) return; var old=btn&&btn.innerHTML; if(btn){ btn.disabled=true; btn.textContent='Preparing…'; }
  try{ var J=await nfLoadPdf(), doc=nfPdfNew(J,'p'), R=v.roll.all||{}, S=v.staff||{}, y=14, W=210;
    var x0=14; x0+=nfPdfImg(doc,SC_BRAND.logoNqas,14,10,10)+4; nfPdfImg(doc,SC_BRAND.logoHealsol,x0,11,8); if(v.logo) nfPdfImg(doc,v.logo,W-14,10,10,true);
    y=28; doc.setFontSize(15); doc.setFont(doc._nfFont,'bold'); doc.text(nfPdfTxt(doc,v.name),14,y); doc.setFont(doc._nfFont,'normal'); doc.setFontSize(9.5); doc.setTextColor(100);
    doc.text(nfPdfTxt(doc,(v.kind==='state'?'State':'Partner')+' report · NQAS | FAST by HealSol Academy · data of '+scFmtDate(String(v.at||'').slice(0,10))),14,y+6); doc.setTextColor(0);
    var T=[['Facilities',nfDInr(R.n)],['NQAS Ready',nfDInr(R.ready||0)],['NHSRC certified',nfDInr(R.certified||0)],['Average readiness',R.avgPct!=null?R.avgPct+'%':'—'],['Gain since baseline',R.avgGain!=null?'+'+R.avgGain+' pts':'—'],['People covered',nfDBig(R.pop||0)],['Served by Ready / certified',nfDBig(R.popReady||0)],['Staff recognised',nfDInr(S.total||0)]];
    y+=12; T.forEach(function(t,i){ var cx=14+(i%4)*46, cy=y+Math.floor(i/4)*20; doc.setDrawColor(226,232,240); doc.setFillColor(248,250,252); doc.roundedRect(cx,cy,43,17,2,2,'FD'); doc.setFontSize(13); doc.setFont(doc._nfFont,'bold'); doc.text(nfPdfTxt(doc,t[1]),cx+3,cy+8); doc.setFont(doc._nfFont,'normal'); doc.setFontSize(7.5); doc.setTextColor(90); doc.text(nfPdfTxt(doc,t[0]),cx+3,cy+13.5); doc.setTextColor(0); });
    y+=44; doc.setFontSize(11); doc.setFont(doc._nfFont,'bold'); doc.text('Journey and schedule',14,y); doc.setFont(doc._nfFont,'normal'); doc.setFontSize(9.5);
    doc.text(nfPdfTxt(doc,'Enrolled '+R.n+' → Started '+(R.started||0)+' → Assessed '+(R.assessed||0)+' → Graduated '+(R.graduated||0)+' → NQAS Ready '+(R.ready||0)+' → Certified '+(R.certified||0)),14,y+6);
    doc.text(nfPdfTxt(doc,'On track '+(R.onTrack||0)+' · Slipping '+(R.slipping||0)+' · Behind '+(R.behind||0)+' · In catch-up '+(R.catchup||0)),14,y+12);
    var g=(v.gaps||{}).aoc||[]; y+=22; doc.setFontSize(11); doc.setFont(doc._nfFont,'bold'); doc.text('Most common gaps',14,y); doc.setFont(doc._nfFont,'normal'); doc.setFontSize(9.5);
    if(!g.length) doc.text('No common gaps — every assessed area is at the NQAS line.',14,y+6); g.forEach(function(x,i){ doc.text(nfPdfTxt(doc,'Area of Concern '+x.k+' — '+(NF_AOC_NAMES[x.k]||'')+': below 70% in '+x.n+' facilities'),14,y+6+i*5.5); });
    y+=10+Math.max(1,g.length)*5.5;
    var dist=Object.keys(v.roll.district||{}).map(function(k){ var r=v.roll.district[k]; return [r.name,r.state||'',r.n,r.avgPct!=null?r.avgPct+'%':'—',r.avgGain!=null?'+'+r.avgGain:'—',r.ready||0,r.certified||0,r.behind||0]; });
    doc.autoTable({startY:y,head:[['District','State','Facilities','Average','Gain','Ready','Certified','Behind']],body:dist,styles:{font:doc._nfFont,fontSize:8.5},headStyles:{fillColor:[19,90,85]},margin:{left:14,right:14}});
    var F=v.fac||{}, rows=Object.keys(F).map(function(c,i){ var r=F[c]; return [r.n||(nfDTypeLbl(r.t)+' '+(i+1)),[r.di,r.bl].filter(Boolean).join(' · '),r.day?(r.day>60?'Done':r.day):'—',r.assessed&&r.pct!=null?r.pct+'%':'—',r.base!=null&&r.pct!=null?'+'+Math.max(0,r.pct-r.base):'—',{g:'On track',a:'Slipping',r:'Behind'}[r.comp]||'—',r.nh==='certified'?'NHSRC certified':(NF_D_RES.filter(function(x){ return x[0]===nfDResOf(r); })[0]||NF_D_RES[4])[1]]; })
      .sort(function(a,b){ return String(a[0]).localeCompare(String(b[0])); });
    doc.autoTable({startY:doc.lastAutoTable.finalY+8,head:[['Facility','District · block','Day','Readiness','Gain','Timeline','Result']],body:rows,styles:{font:doc._nfFont,fontSize:8},headStyles:{fillColor:[19,90,85]},margin:{left:14,right:14}});
    var pages=doc.getNumberOfPages(); for(var p=1;p<=pages;p++){ doc.setPage(p); doc.setFontSize(7.5); doc.setTextColor(120); doc.text(nfPdfTxt(doc,'NQAS | FAST · HealSol Academy · facility-level figures; staff names are never shown · page '+p+' of '+pages),14,290); }
    var how=await nfSaveDoc(doc,nfDFile()+'.pdf'); nfDoneToast(how); }
  catch(e){ console.warn('[SC] dashboard pdf',e); showToast('Could not make the PDF — check the internet.','err'); }
  finally{ if(btn){ btn.disabled=false; btn.innerHTML=old; } } }

// ══ HealSol: "State & Donor" (portfolios, logins, public page) ══
function nfDScopeMatch(sc,f,code){ if(!sc) return false; var c=nfrStateCode(f.state), d=nfDSlug(f.district), b=nfDSlug(f.block||'');
  if(sc.fac&&sc.fac[code]) return true; if(sc.st&&c&&sc.st[c]) return true;
  if(sc.di&&Object.keys(sc.di).some(function(k){ var p=k.split('|'); return sc.di[k]&&p[0]===c&&nfDSlug(p[1])===d; })) return true;
  if(sc.bl&&Object.keys(sc.bl).some(function(k){ var p=k.split('|'); return sc.bl[k]&&p[0]===c&&nfDSlug(p[1])===d&&nfDSlug(p[2])===b; })) return true; return false; }
function nfDMatchCount(sc,demo){ var F=scMasterFacilities||{}, inc=!!demo||!!((_nfD.cfg||{}).includeDemo); return Object.keys(F).filter(function(c){ var f=F[c]; return f&&!f.migratedTo&&(inc||!f.isDemo)&&nfDScopeMatch(sc,f,c); }).length; }
function nfDScopeText(sc){ sc=sc||{}; var a=[]; var n=function(o){ return Object.keys(o||{}).filter(function(k){ return o[k]; }); };
  var st=n(sc.st), di=n(sc.di), bl=n(sc.bl), fa=n(sc.fac);
  if(st.length) a.push(st.map(nfrStateName).join(', ')); if(di.length) a.push(di.length+' district'+(di.length>1?'s':'')); if(bl.length) a.push(bl.length+' block'+(bl.length>1?'s':'')); if(fa.length) a.push(fa.length+' facilit'+(fa.length>1?'ies':'y'));
  return a.join(' + ')||'Nothing chosen yet'; }
async function nfDAdminLoad(force){ if(force||!_nfD.ports){ try{ _nfD.ports=await fbGet('sc_portfolios')||{}; _nfD.viewers=await fbGet('sc_viewers')||{}; _nfD.cfg=await fbGet('shared/sc_views_config')||{}; }catch(e){ _nfD.ports=_nfD.ports||{}; _nfD.viewers=_nfD.viewers||{}; _nfD.cfg=_nfD.cfg||{}; } } }
async function nfDAdminRender(load){
  if(appMode!=='sc-admin') return; var main=document.querySelector('#admin-app .admin-main'); if(!main) return;
  var box=document.getElementById('nf-stdon'); if(!box){ box=document.createElement('div'); box.id='nf-stdon'; box.dataset.nfv='stdon'; main.insertBefore(box,main.firstChild); }
  if(load||!_nfD.ports){ if(!box.innerHTML) box.innerHTML='<div class="nfr-empty">Loading…</div>'; await nfDAdminLoad(load); }
  var P=_nfD.ports||{}, VW=_nfD.viewers||{}, t=_nfD.tab;
  var h='<div class="nfo-top"><div><h1>State &amp; Donor dashboards</h1><small>HealSol only · view-only dashboards for State Admins and Donors / Partners, and the public impact page</small></div><button type="button" class="nfo-ic" title="Refresh" onclick="nfDAdminRender(\'force\')"><i class="ti ti-refresh"></i></button></div>'
    +'<div class="nfr-tabs" role="tablist">'+[['ports','🗂 Portfolios',Object.keys(P).length],['logins','🔑 Logins',Object.keys(VW).length],['public','🌐 Public page','']].map(function(x){ return '<button type="button" role="tab" class="'+(t===x[0]?'on':'')+'" onclick="_nfD.tab=\''+x[0]+'\';nfDAdminRender()">'+x[1]+(x[2]!==''?' <em>'+x[2]+'</em>':'')+'</button>'; }).join('')+'</div>';
  if(t==='logins') h+=nfDLoginsHTML(); else if(t==='public') h+=nfDPublicHTML(); else h+=nfDPortsHTML();
  h+='<div class="nfr-row"><button type="button" class="nfr-btn ghost" id="nfd-upd" onclick="nfDUpdateNow()"><i class="ti ti-refresh"></i> Update dashboards now</button><small class="nfr-muted">Dashboards and the public page are prepared every night at 2 AM. Use this after changing a portfolio.</small></div>';
  box.innerHTML=h; }
function nfDPortsHTML(){ var P=_nfD.ports||{}, VW=_nfD.viewers||{}, ids=Object.keys(P).sort(function(a,b){ return String(P[a].name).localeCompare(String(P[b].name)); });
  var cnt=function(pid){ return Object.keys(VW).filter(function(k){ return VW[k]&&VW[k].portfolio===pid&&!VW[k].disabled; }).length; };
  return '<div class="nfr-card"><div class="nfr-head"><div><h3>Portfolios</h3><p>A portfolio is the set of facilities one dashboard shows: whole states, districts, blocks and/or hand-picked facilities (a facility in any of them counts). Give a State Admin a state portfolio, and a Donor the facilities they fund.</p></div>'
    +'<button type="button" class="nfr-btn" onclick="nfDPortForm()"><i class="ti ti-plus"></i> New portfolio</button></div>'
    +(ids.length?'<div class="nfr-tw"><table class="nfr-t"><thead><tr><th>Portfolio</th><th>Type</th><th>Covers</th><th>Facilities now</th><th>Logins</th><th></th></tr></thead><tbody>'
      +ids.map(function(pid){ var p=P[pid]; return '<tr class="'+(p.off?'dim':'')+'"><td>'+(p.logo?'<img src="'+p.logo+'" alt="" style="height:22px;vertical-align:middle;margin-right:6px;">':'')+'<b>'+scEsc(p.name)+'</b>'+(p.off?' <span class="nfr-chip n">Off</span>':'')+'</td><td>'+(p.kind==='state'?'State':'Donor / Partner')+'</td><td>'+scEsc(nfDScopeText(p.scope))+'</td><td>'+nfDMatchCount(p.scope)+'</td><td>'+cnt(pid)+'</td>'
        +'<td class="nfr-act"><button type="button" title="Preview the dashboard" onclick="nfDPreview(\''+scJs(pid)+'\')"><i class="ti ti-eye"></i></button><button type="button" title="Edit" onclick="nfDPortForm(\''+scJs(pid)+'\')"><i class="ti ti-pencil"></i></button><button type="button" class="del" title="Remove" onclick="nfDPortDel(\''+scJs(pid)+'\')"><i class="ti ti-trash"></i></button></td></tr>'; }).join('')+'</tbody></table></div>'
      :'<div class="nfr-empty">No portfolios yet. Create one, then add a login for it.</div>')
    +'<label class="nfr-sw" style="margin-top:10px;"><input type="checkbox"'+((_nfD.cfg||{}).includeDemo?' checked':'')+' onchange="nfDDemo(this.checked)"><i></i> Count demo facilities too <small class="nfr-muted">(for testing — switch off for real use; applies to dashboards and the public page)</small></label></div>'; }
async function nfDDemo(on){ var ok=await fbSet('shared/sc_views_config/includeDemo',on?true:null); if(ok){ _nfD.cfg=_nfD.cfg||{}; _nfD.cfg.includeDemo=!!on; } showToast(ok?(on?'Demo facilities counted from the next update.':'Demo facilities left out from the next update.'):'Could not save.',ok?'ok':'err'); nfDAdminRender(); }
async function nfDPortDel(pid){ var p=(_nfD.ports||{})[pid]; if(!p) return; var used=Object.keys(_nfD.viewers||{}).filter(function(k){ return _nfD.viewers[k]&&_nfD.viewers[k].portfolio===pid; });
  if(used.length){ showToast('Remove its '+used.length+' login(s) first (Logins tab).','err'); return; }
  var v=await scDialog({title:'Remove portfolio?',icon:'🗑️',okLabel:'Remove',message:p.name+' — its dashboard is removed at the next update.',fields:[]}); if(!v) return;
  var ok=await fbSet('sc_portfolios/'+pid,null); if(ok) delete _nfD.ports[pid]; showToast(ok?'Removed.':'Could not remove.',ok?'ok':'err'); nfDAdminRender(); }
// portfolio form
function nfDPortForm(pid){ var p=pid?(_nfD.ports||{})[pid]||{}:{kind:'donor',scope:{}}; _nfD.edit={pid:pid||'',sc:JSON.parse(JSON.stringify(p.scope||{})),logo:p.logo||'',demo:!!p.demo};
  var stOpts='<option value="">State…</option>'+(NF_STATE_LIST||[]).slice().sort(function(a,b){ return a[0].localeCompare(b[0]); }).map(function(s){ return '<option value="'+s[1]+'">'+scEsc(s[0])+'</option>'; }).join('');
  var ov=document.createElement('div'); ov.className='nfr-ov'; ov.id='nfr-ov';
  ov.innerHTML='<form class="nfr-form" onsubmit="event.preventDefault();nfDPortSave();"><div class="nfr-fh"><b>'+(pid?'Edit portfolio':'New portfolio')+'</b><button type="button" onclick="nfrClose()" title="Close">✕</button></div>'
    +'<fieldset><legend>1 · Portfolio</legend><label>Name <small>(shown at the top of the dashboard)</small><input id="nfd-pn" maxlength="80" placeholder="e.g. Uttar Pradesh — NHM, or ABC Foundation (Jhansi)" value="'+scEsc(p.name||'')+'"></label>'
    +'<label>Type<select id="nfd-pk"><option value="donor"'+(p.kind!=='state'?' selected':'')+'>Donor / Partner</option><option value="state"'+(p.kind==='state'?' selected':'')+'>State</option></select></label>'
    +'<div class="nfr-logo"><div id="nfd-lgp">'+nfDLogoPrev()+'</div><label class="nfr-btn ghost">📥 '+(p.logo?'Change logo':'Logo (optional)')+'<input type="file" accept="image/png,image/jpeg" hidden onchange="nfDPickLogo(this)"></label><small>Shown on the dashboard and the PDF report. Use only with the partner\'s permission.</small></div>'
    +'<label class="nfr-tick" style="margin-top:8px;"><input type="checkbox" id="nfd-names"'+(p.showNames?' checked':'')+'> Partner may see facility names <small class="nfr-muted">(State dashboards always do; partners see "SC 1, SC 2…" when this is off)</small></label>'
    +'<label class="nfr-tick" style="margin-top:6px;"><input type="checkbox" id="nfd-off"'+(p.off?' checked':'')+'> Switched off (the dashboard is hidden)</label>'
    +'<label class="nfr-tick" style="margin-top:6px;"><input type="checkbox" id="nfd-demo"'+(p.demo?' checked':'')+' onchange="_nfD.edit.demo=this.checked;nfDChips()"> Demo portfolio — also counts demo / self-registered facilities <small class="nfr-muted">(for showing partners — add your own demo facilities one by one, not a whole state; public totals never include them)</small></label></fieldset>'
    +'<fieldset><legend>2 · Facilities it covers</legend><p class="nfr-muted" style="margin:0 0 8px;">Add any mix — a facility in any of them counts.</p>'
    +'<div class="nfd-add"><b>Whole state</b><select id="nfd-s1">'+stOpts+'</select><button type="button" class="nfr-btn ghost sm" onclick="nfDAdd(\'st\')">Add</button></div>'
    +'<div class="nfd-add"><b>District</b><select id="nfd-s2" onchange="nfDFillD(\'2\')">'+stOpts+'</select><select id="nfd-d2"><option value="">District…</option></select><button type="button" class="nfr-btn ghost sm" onclick="nfDAdd(\'di\')">Add</button></div>'
    +'<div class="nfd-add"><b>Block</b><select id="nfd-s3" onchange="nfDFillD(\'3\')">'+stOpts+'</select><select id="nfd-d3" onchange="nfDFillB()"><option value="">District…</option></select><input id="nfd-b3" list="nfd-bl" placeholder="Block name"><datalist id="nfd-bl"></datalist><button type="button" class="nfr-btn ghost sm" onclick="nfDAdd(\'bl\')">Add</button></div>'
    +'<div class="nfd-add"><b>Facility</b><input id="nfd-fq" list="nfd-fl" placeholder="Type a facility name or code"><datalist id="nfd-fl">'+Object.keys(scMasterFacilities||{}).filter(function(c){ var f=scMasterFacilities[c]; return f&&!f.migratedTo; }).map(function(c){ var f=scMasterFacilities[c]; return '<option value="'+scEsc(c)+'">'+scEsc((f.name||c)+' · '+[f.district,f.state].filter(Boolean).join(', '))+'</option>'; }).join('')+'</datalist><button type="button" class="nfr-btn ghost sm" onclick="nfDAdd(\'fac\')">Add</button></div>'
    +'<div class="nfr-chips" id="nfd-chips"></div><p class="nfd-match" id="nfd-match"></p></fieldset>'
    +'<div class="nfr-err" id="nfr-err"></div><div class="nfr-fb"><button type="button" class="nfr-btn ghost" onclick="nfrClose()">Cancel</button><button type="submit" class="nfr-btn">'+(pid?'Save changes':'Create portfolio')+'</button></div></form>';
  ov.addEventListener('click',function(e){ if(e.target===ov) nfrClose(); }); document.body.appendChild(ov); nfDChips(); }
function nfDLogoPrev(){ var l=_nfD.edit&&_nfD.edit.logo; return l?'<div class="nfr-strip"><img src="'+l+'" alt="Logo"> <button type="button" class="nfr-btn ghost sm" onclick="_nfD.edit.logo=\'\';document.getElementById(\'nfd-lgp\').innerHTML=nfDLogoPrev()">Remove</button></div>':'<div class="nfr-strip none">No logo</div>'; }
async function nfDPickLogo(inp){ var f=inp.files&&inp.files[0]; if(!f) return; if(!/^image\/(png|jpeg)$/.test(f.type)||f.size>300000){ document.getElementById('nfr-err').textContent='Use a PNG or JPG logo under 300 KB.'; return; } _nfD.edit.logo=await nfImpShrink(f); document.getElementById('nfd-lgp').innerHTML=nfDLogoPrev(); }
function nfDFillD(n){ var s=document.getElementById('nfd-s'+n).value, d=document.getElementById('nfd-d'+n); d.innerHTML='<option value="">District…</option>'+(((typeof NF_DISTRICTS!=='undefined'&&NF_DISTRICTS[s])||[]).map(function(x){ return '<option>'+scEsc(x)+'</option>'; }).join('')); if(n==='3') nfDFillB(); }
function nfDFillB(){ var s=document.getElementById('nfd-s3').value, d=document.getElementById('nfd-d3').value, o={}; Object.keys(scMasterFacilities||{}).forEach(function(c){ var f=scMasterFacilities[c]; if(f&&nfrStateCode(f.state)===s&&nfDSlug(f.district)===nfDSlug(d)&&f.block) o[f.block]=1; });
  document.getElementById('nfd-bl').innerHTML=Object.keys(o).sort().map(function(b){ return '<option value="'+scEsc(b)+'">'; }).join(''); }
function nfDAdd(t){ var E=_nfD.edit.sc, g=function(i){ var e=document.getElementById(i); return e?String(e.value||'').trim():''; }, err=document.getElementById('nfr-err'); err.textContent='';
  if(t==='st'){ var s=g('nfd-s1'); if(!s) return; (E.st=E.st||{})[s]=true; }
  else if(t==='di'){ var s2=g('nfd-s2'), d2=g('nfd-d2'); if(!s2||!d2){ err.textContent='Choose the state and the district.'; return; } (E.di=E.di||{})[s2+'|'+d2]=true; }
  else if(t==='bl'){ var s3=g('nfd-s3'), d3=g('nfd-d3'), b3=g('nfd-b3'); if(!s3||!d3||!b3){ err.textContent='Choose the state, the district and the block.'; return; } (E.bl=E.bl||{})[s3+'|'+d3+'|'+b3]=true; document.getElementById('nfd-b3').value=''; }
  else if(t==='fac'){ var c=g('nfd-fq'); if(!(scMasterFacilities||{})[c]){ err.textContent='Choose a facility from the list.'; return; } (E.fac=E.fac||{})[c]=true; document.getElementById('nfd-fq').value=''; }
  nfDChips(); }
function nfDDel(t,k){ var E=_nfD.edit.sc; if(E[t]) delete E[t][k]; nfDChips(); }
function nfDChips(){ var E=_nfD.edit.sc, F=scMasterFacilities||{}, h=[], lbl={st:'State',di:'District',bl:'Block',fac:'Facility'};
  ['st','di','bl','fac'].forEach(function(t){ Object.keys(E[t]||{}).forEach(function(k){ if(!E[t][k]) return; var p=k.split('|'), txt=t==='st'?nfrStateName(k):t==='di'?p[1]+', '+nfrStateName(p[0]):t==='bl'?p[2]+' block, '+p[1]:((F[k]||{}).name||k);
    h.push('<span class="nfr-pill"><small>'+lbl[t]+':</small> '+scEsc(txt)+' <button type="button" title="Remove" onclick="nfDDel(\''+t+'\',\''+scJs(k)+'\')">✕</button></span>'); }); });
  var c=document.getElementById('nfd-chips'); if(c) c.innerHTML=h.join('')||'<span class="nfr-muted">Nothing added yet.</span>';
  var m=document.getElementById('nfd-match'); if(m) m.textContent='Covers '+nfDMatchCount(E,_nfD.edit.demo)+' facilities today'+((_nfD.edit.demo||(_nfD.cfg||{}).includeDemo)?' (demo facilities counted)':' (demo facilities not counted)')+'.'; }
async function nfDPortSave(){ var g=function(i){ var e=document.getElementById(i); return e?String(e.value||'').trim():''; }, err=document.getElementById('nfr-err'), E=_nfD.edit;
  var name=g('nfd-pn'); if(name.length<3){ err.textContent='Enter the portfolio name.'; return; }
  var sc={}; ['st','di','bl','fac'].forEach(function(t){ var o={}; Object.keys(E.sc[t]||{}).forEach(function(k){ if(E.sc[t][k]) o[k]=true; }); if(Object.keys(o).length) sc[t]=o; });
  if(!Object.keys(sc).length){ err.textContent='Add at least one state, district, block or facility.'; return; }
  var pid=E.pid||('P'+Date.now().toString(36)), old=(_nfD.ports||{})[pid]||{}, by=nfrBy(), now=scNowIso();
  var rec={name:name,kind:g('nfd-pk')==='state'?'state':'donor',logo:E.logo||null,scope:sc,off:document.getElementById('nfd-off').checked?true:null,showNames:document.getElementById('nfd-names').checked?true:null,demo:document.getElementById('nfd-demo').checked?true:null,by:old.by||by,at:old.at||now,updatedBy:by,updatedAt:now};
  var ok=await fbSet('sc_portfolios/'+pid,JSON.parse(JSON.stringify(rec))); if(!ok){ err.textContent='Could not save.'; return; }
  _nfD.ports[pid]=rec; nfrClose(); showToast('Saved. Tap "Update dashboards now" to prepare its dashboard.','ok'); nfDAdminRender(); }
// logins
function nfDLoginsHTML(){ var VW=_nfD.viewers||{}, P=_nfD.ports||{}, ids=Object.keys(VW).sort();
  return '<div class="nfr-card"><div class="nfr-head"><div><h3>Logins</h3><p>Each login sees one portfolio, view only. They sign in on the normal NQAS | FAST login screen with their ID and password (a temporary password is shown once, to send them).</p></div>'
    +'<button type="button" class="nfr-btn" onclick="nfDLoginForm()"'+(Object.keys(P).length?'':' disabled title="Create a portfolio first"')+'><i class="ti ti-plus"></i> New login</button></div>'
    +(ids.length?'<div class="nfr-tw"><table class="nfr-t"><thead><tr><th>Login ID</th><th>Name</th><th>Type</th><th>Portfolio</th><th>Status</th><th></th></tr></thead><tbody>'
      +ids.map(function(id){ var w=VW[id]||{}; return '<tr class="'+(w.disabled?'dim':'')+'"><td><b>'+scEsc(id)+'</b></td><td>'+scEsc(w.name||'')+'<small>'+scEsc(w.org||'')+'</small></td><td>'+(w.kind==='state'?'State Admin':'Donor / Partner')+'</td><td>'+scEsc(((P[w.portfolio]||{}).name)||w.portfolio||'—')+'</td><td>'+(w.disabled?'<span class="nfr-chip n">Blocked</span>':'<span class="nfr-chip g">Active</span>')+'</td>'
        +'<td class="nfr-act"><button type="button" title="Reset password" onclick="nfDLoginReset(\''+scJs(id)+'\')"><i class="ti ti-key"></i></button><button type="button" title="'+(w.disabled?'Unblock':'Block')+'" onclick="nfDLoginBlock(\''+scJs(id)+'\','+(!w.disabled)+')"><i class="ti '+(w.disabled?'ti-lock-open':'ti-lock')+'"></i></button><button type="button" class="del" title="Remove" onclick="nfDLoginDel(\''+scJs(id)+'\')"><i class="ti ti-trash"></i></button></td></tr>'; }).join('')+'</tbody></table></div>'
      :'<div class="nfr-empty">No logins yet.</div>')+'</div>'; }
function nfDLoginForm(){ var P=_nfD.ports||{};
  var ov=document.createElement('div'); ov.className='nfr-ov'; ov.id='nfr-ov';
  ov.innerHTML='<form class="nfr-form" onsubmit="event.preventDefault();nfDLoginSave();"><div class="nfr-fh"><b>New login</b><button type="button" onclick="nfrClose()" title="Close">✕</button></div>'
    +'<fieldset><label>Name<input id="nfd-ln" maxlength="80" placeholder="e.g. Dr A. Kumar"></label><label>Organisation / designation <small>(optional)</small><input id="nfd-lo" maxlength="80" placeholder="e.g. NHM Uttar Pradesh, or ABC Foundation"></label>'
    +'<label>Login ID <small>(letters and numbers, at least 3 — not a mobile number)</small><input id="nfd-li" maxlength="30" placeholder="e.g. nhm-up or abc-foundation"></label>'
    +'<label>Portfolio it can see<select id="nfd-lp">'+Object.keys(P).sort(function(a,b){ return String(P[a].name).localeCompare(String(P[b].name)); }).map(function(pid){ return '<option value="'+scEsc(pid)+'">'+scEsc(P[pid].name)+' ('+(P[pid].kind==='state'?'State':'Donor')+')</option>'; }).join('')+'</select></label></fieldset>'
    +'<div class="nfr-err" id="nfr-err"></div><div class="nfr-fb"><button type="button" class="nfr-btn ghost" onclick="nfrClose()">Cancel</button><button type="submit" class="nfr-btn" id="nfd-lsave">Create login</button></div></form>';
  ov.addEventListener('click',function(e){ if(e.target===ov) nfrClose(); }); document.body.appendChild(ov); }
async function nfDLoginSave(){ var g=function(i){ var e=document.getElementById(i); return e?String(e.value||'').trim():''; }, err=document.getElementById('nfr-err'), btn=document.getElementById('nfd-lsave');
  var name=g('nfd-ln'), id=g('nfd-li').toLowerCase(), pid=g('nfd-lp'), P=(_nfD.ports||{})[pid];
  if(name.length<3){ err.textContent='Enter the name.'; return; } if(!/^[a-z0-9][a-z0-9._-]{2,29}$/.test(id)||/^\d{10}$/.test(id)){ err.textContent='Login ID: at least 3 letters / numbers (dots and dashes allowed), not a mobile number.'; return; } if(!P){ err.textContent='Choose the portfolio.'; return; }
  btn.disabled=true; btn.textContent='Creating…';
  try{ var r=await nfCall('createAccount',{kind:'viewer',id:id,name:name,org:g('nfd-lo'),portfolio:pid,viewKind:P.kind}); nfrClose(); await nfDAdminLoad(true); nfDAdminRender();
    nfShowTempPassword(name,r.identifier,r.tempPassword,'Login created — '+(P.kind==='state'?'State Admin':'Donor / Partner')); }
  catch(e){ err.textContent=nfErrText?nfErrText(e):(e.message||'Could not create the login.'); btn.disabled=false; btn.textContent='Create login'; } }
async function nfDLoginReset(id){ var w=(_nfD.viewers||{})[id]||{}; try{ var r=await nfCall('resetPassword',{identifier:id}); nfShowTempPassword(w.name||id,r.identifier,r.tempPassword,'Password reset'); }catch(e){ showToast(nfErrText(e),'err'); } }
async function nfDLoginBlock(id,block){ try{ await nfCall('setAccountDisabled',{identifier:id,disabled:!!block}); await fbSet('sc_viewers/'+id+'/disabled',block?true:null); if(_nfD.viewers[id]){ if(block) _nfD.viewers[id].disabled=true; else delete _nfD.viewers[id].disabled; }
    showToast(block?'Login blocked.':'Login unblocked.','ok'); }catch(e){ showToast(nfErrText(e),'err'); } nfDAdminRender(); }
async function nfDLoginDel(id){ var v=await scDialog({title:'Remove login?',icon:'🗑️',okLabel:'Remove',message:id+' — they can no longer sign in.',fields:[]}); if(!v) return;
  try{ await nfCall('removeAccount',{kind:'viewer',key:id}); delete _nfD.viewers[id]; showToast('Login removed.','ok'); }catch(e){ showToast(nfErrText(e),'err'); } nfDAdminRender(); }
// public page
function nfDStatsUrl(hi){ return nfImpCardBase().replace(/\/card$/,'/impactStats')+(hi?'?l=hi':''); }
function nfDPublicHTML(){ var u=nfDStatsUrl(false), uh=nfDStatsUrl(true);
  return '<div class="nfr-card"><h3>🌐 Public impact page</h3><p>Headline totals for everyone — facilities enrolled, NQAS Ready, NHSRC certified, people reached and staff recognised. No facility or staff names. Updated every night.</p>'
    +'<div class="nfd-urls"><div><b>English</b><code>'+scEsc(u)+'</code><button type="button" class="nfr-btn ghost sm" onclick="nfImpCopy(\''+scJs(u)+'\');showToast(\'Copied.\',\'ok\')">Copy</button><a class="nfr-btn ghost sm" href="'+scEsc(u)+'" target="_blank" rel="noopener">Open</a></div>'
    +'<div><b>हिंदी</b><code>'+scEsc(uh)+'</code><button type="button" class="nfr-btn ghost sm" onclick="nfImpCopy(\''+scJs(uh)+'\');showToast(\'Copied.\',\'ok\')">Copy</button><a class="nfr-btn ghost sm" href="'+scEsc(uh)+'" target="_blank" rel="noopener">Open</a></div></div>'
    +'<h4 style="margin:14px 0 4px;">Put it on thehealsol.com (Wix)</h4><ol class="nfd-steps"><li>In the Wix Editor, add a new page, e.g. <b>NQAS FAST Impact</b> (address: nqas-fast-impact).</li><li><b>Add Elements → Embed Code → Embed a Site</b>, and paste the English address above.</li>'
    +'<li>Stretch the box to the full width and about <b>620 px</b> high (on Mobile view about <b>1,100 px</b>).</li><li>Publish. The numbers update by themselves every night.</li></ol></div>'; }
async function nfDUpdateNow(){ var b=document.getElementById('nfd-upd'); if(b){ b.disabled=true; b.innerHTML='<i class="ti ti-loader"></i> Updating…'; }
  try{ var r=await nfCall('refreshSummary',{all:true}); showToast('Dashboards updated'+(r&&r.views!=null?' ('+r.views+' portfolio'+(r.views===1?'':'s')+')':'')+'.','ok'); }catch(e){ showToast(e.message||'Could not update.','err'); }
  if(b){ b.disabled=false; b.innerHTML='<i class="ti ti-refresh"></i> Update dashboards now'; } }
async function nfDPreview(pid){ showToast('Opening the dashboard…','ok'); var v=null; try{ v=await fbGet('sc_views/'+pid); }catch(e){}
  var p=(_nfD.ports||{})[pid]||{}; _nfD.v=v; _nfD.mode='preview'; _nfD.who={name:'HealSol preview',portName:p.name,kind:p.kind}; _nfD.lvl='all'; _nfD.type=''; _nfD.st=_nfD.di=_nfD.bl=''; nfDShow(); }
// left menu (HealSol), login routing (State Admin / Donor)
(function(){
  var oItems=nfAdminItems;
  nfAdminItems=function(){ var L=oItems.apply(this,arguments); if(nfAdminRole()!=='admin') return L;
    var i=L.findIndex(function(it){ return it.v==='reports'; }); L.splice(i<0?L.length:i+1,0,{v:'stdon',l:'State & Donor',icon:'ti-chart-bar',onclick:"nfAdminView('stdon')"}); return L; };
  var oApply=nfAdminApply; nfAdminApply=function(){ document.body.classList.toggle('nfv-stdon',_nfOv.view==='stdon'); return oApply.apply(this,arguments); };
  var oView=nfAdminView; nfAdminView=function(v){ var r=oView.apply(this,arguments); if(v==='stdon') nfDAdminRender(true); return r; };
  var oGo=nfGo; nfGo=async function(acc){ if(acc&&acc.kind==='viewer') return nfDOpenViewer(acc); return oGo.apply(this,arguments); };
})();
