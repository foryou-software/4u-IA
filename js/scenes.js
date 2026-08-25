/* FOURYOU · scenes — 15 ventanas de software vivo. FY.mountScene(slug, host, {stage}) → api */
window.FY=window.FY||{};
(function(){
var R=FY.reduced;
function h(host,html){host.innerHTML=html;return host.firstElementChild}
function rd(txt){return '<div class="rd">'+txt+'</div>'}
/* SVG helpers */
var NS='http://www.w3.org/2000/svg';
function unitKF(name){return name}

var S={};

/* 1 · TRACK — mapa vivo + roster */
S.track=function(o){
 var html='<div class="scn sc-track">'
 +'<div class="tmap"><svg viewBox="0 0 200 140" preserveAspectRatio="none">'
 +'<path class="rt r1" d="M14 118 L52 92 L58 60 L96 44 L128 30"/>'
 +'<path class="rt r2" d="M20 28 L58 40 L92 78 L124 92 L164 112"/>'
 +'<rect class="gf" x="118" y="18" width="42" height="30" rx="6"/>'
 +'<rect class="gfp" x="118" y="18" width="42" height="30" rx="6"/>'
 +'<rect class="un u1 ok" x="-3.5" y="-3.5" width="7" height="7" rx="2"/>'
 +'<rect class="un u2 ok" x="-3.5" y="-3.5" width="7" height="7" rx="2"/>'
 +'<rect class="un u3 acc" x="-3.5" y="-3.5" width="7" height="7" rx="2"/>'
 +'</svg>'
 +'<span class="chip ok ci">CHECK-IN · GEOFENCE 044</span></div>'
 +'<div class="tros">'
 +'<button class="rr" data-r="1"><i class="st ok"></i><span class="nm">M. RANGEL</span><span class="mt">sales · on-route · 09:42</span></button>'
 +'<button class="rr" data-r="2"><i class="st warn"></i><span class="nm">A. DUARTE</span><span class="mt">sales · on-site · 18 min</span></button>'
 +'<button class="rr" data-r="3"><i class="st ok"></i><span class="nm">J. OSORIO</span><span class="mt">tech · on-route</span></button>'
 +'<button class="rr off" data-r="0"><i class="st"></i><span class="nm">R. LEMUS</span><span class="mt">sales · off-shift</span></button>'
 +'<div class="tkpi mono">12/14 visits · 96% route · 18 min on-site</div>'
 +'</div></div>';
 var el=h(o.host,html),sel=null;
 if(o.stage){
  el.querySelectorAll('.rr').forEach(function(btn){
   btn.addEventListener('click',function(){
    var r=btn.getAttribute('data-r');
    el.querySelectorAll('.rr').forEach(function(b){b.classList.toggle('sel',b===btn&&sel!==r)});
    if(sel===r){sel=null;el.classList.remove('hl1','hl2','hl3')}
    else{sel=r;el.classList.remove('hl1','hl2','hl3');if(r!=='0')el.classList.add('hl'+r)}
   });
  });
 }else{el.querySelectorAll('.rr').forEach(function(b){b.disabled=true;b.tabIndex=-1})}
 return {};
};

/* 2 · FLEET — carriles + unidades */
S.fleet=function(o){
 var html='<div class="scn sc-fleet">'
 +'<div class="lane l1"><i class="un ok uA"></i></div>'
 +'<div class="lane l2"><i class="un ok uB" id="fyFollowU"></i></div>'
 +'<div class="lane l3"><i class="un ok uC"></i></div>'
 +'<div class="gf2"></div>'
 +rd('fix 640 ms · 2,340 units · 37 geofence alerts')+'</div>';
 var el=h(o.host,html),f=false,r=el.querySelector('.rd'),base=r.textContent;
 var lane=el.querySelector('.lane');
 requestAnimationFrame(function(){el.style.setProperty('--lw',Math.max(60,lane.clientWidth-12)+'px')});
 return {follow:function(){
   f=!f;el.classList.toggle('following',f);
   r.textContent=f?'following · unit MX-1207 · fix 640 ms':base;
   return f;
 }};
};

/* 3 · MAP — capas isométricas */
S.map=function(o){
 var html='<div class="scn sc-map"><div class="iso">'
 +'<div class="lyr ly1"></div><div class="lyr ly2"><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lyr ly3"></div>'
 +'</div>'+rd('19.4326° N · 99.1332° W · <span class="lyn">3</span> layers')+'</div>';
 var el=h(o.host,html),on=true;
 return {toggle:function(){
   on=!on;el.classList.toggle('l2off',!on);
   el.querySelector('.lyn').textContent=on?'3':'2';
   return on;
 }};
};

/* 4 · LEDGER — match banco | libro mayor */
S.ledger=function(o){
 var rows='';
 var amts=['12,480.00','8,214.50','96,300.00','1,204.99','45,090.10'];
 for(var i=0;i<5;i++){rows+='<div class="prw" data-i="'+i+'"><span class="cell l mono">'+amts[i]+'</span><span class="cell r mono">'+amts[i]+'</span></div>'}
 var html='<div class="scn sc-ledger">'
 +'<div class="cols mono"><span>BANCO</span><span>LIBRO MAYOR</span></div>'
 +'<div class="beam"></div><div class="rows">'+rows+'</div>'
 +'<span class="chip ok dz">Δ 0.00</span></div>';
 var el=h(o.host,html),n=0;
 if(o.stage){el.classList.add('manual');}
 return {match:function(){
   if(n>=5){n=0;el.querySelectorAll('.prw').forEach(function(r){r.classList.remove('lit')})}
   el.querySelector('.prw[data-i="'+n+'"]').classList.add('lit');n++;
   if(n===5)el.querySelector('.dz').classList.add('pulse');
   return n;
 }};
};

/* 5 · TAX — documento + sello */
S.tax=function(o){
 var html='<div class="scn sc-tax">'
 +'<div class="doc"><i class="dl w80"></i><i class="dl w60"></i><i class="dl w90"></i><i class="dl w50"></i><i class="dl w70"></i><i class="dl w40"></i>'
 +'<div class="chk mono"></div>'
 +'<span class="stamp mono">UUID A1F4-88C2 <b>✓</b></span></div>'
 +rd('cfdi 4.0 · pac · evidencia por uuid')+'</div>';
 var el=h(o.host,html),busy=false;
 if(o.stage)el.classList.add('manual');
 return {stamp:function(){
   if(busy)return;busy=true;
   var chk=el.querySelector('.chk'),st=el.querySelector('.stamp');
   st.classList.remove('on');chk.innerHTML='';
   var lines=['✓ xml schema','✓ sello CSD','✓ PAC'];
   lines.forEach(function(t,i){setTimeout(function(){var s=document.createElement('span');s.textContent=t;chk.appendChild(s)},i*420)});
   setTimeout(function(){st.classList.add('on');busy=false},lines.length*420+180);
 }};
};

/* 6 · BANK — stream + ecualizador */
S.bank=function(o){
 var tx=['SPEI 4,210.00 · ok','TDC 1,890.50 · ok','SPEI 12,400.00 · ok','TDD 320.00 · ok','SPEI 98,000.00 · hold'];
 var rows='';tx.forEach(function(t,i){rows+='<div class="brw mono" style="--i:'+i+'">'+t+'</div>'});
 var bars='';for(var i=0;i<8;i++){bars+='<i style="--i:'+i+'"></i>'}
 var html='<div class="scn sc-bank"><div class="btx">'+rows+'</div><div class="beq">'+bars+'</div>'
 +'<span class="chip warn al">SCORE ALERT · p99 0.91</span>'
 +rd('1,240 tps · score p99 0.97')+'</div>';
 var el=h(o.host,html),r=el.querySelector('.rd'),t=null;
 return {spike:function(){
   el.classList.add('spike');r.textContent='2,180 tps · score p99 0.91';
   clearTimeout(t);t=setTimeout(function(){el.classList.remove('spike');r.textContent='1,240 tps · score p99 0.97'},4200);
 }};
};

/* 7 · SHOP — POS offline-first */
S.shop=function(o){
 var prods=[['CAFÉ 500g','95.00'],['LECHE 1L','28.50'],['PAN BOLILLO','9.00'],['AZÚCAR 1kg','32.00']];
 var tiles='';prods.forEach(function(p,i){tiles+='<button class="tile" data-i="'+i+'" style="--i:'+i+'"><span class="tn">'+p[0]+'</span><span class="tp mono">$'+p[1]+'</span></button>'});
 var html='<div class="scn sc-shop"><div class="tiles">'+tiles+'</div>'
 +'<div class="tick"><div class="tt mono">TICKET #0448</div><div class="tls mono"></div><div class="tot mono">TOTAL $0.00</div></div>'
 +'<span class="chip warn off mono">OFFLINE · queue <b>3</b></span></div>';
 var el=h(o.host,html),total=0,q=3,sold={};
 if(o.stage)el.classList.add('manual');
 var tls=el.querySelector('.tls'),tot=el.querySelector('.tot'),qb=el.querySelector('.off b');
 function sell(i){
   var p=prods[i];if(sold[i])return;sold[i]=true;
   var t=el.querySelector('.tile[data-i="'+i+'"]');t.classList.add('sold');
   var l=document.createElement('div');l.textContent='1× '+p[0]+' — $'+p[1];tls.appendChild(l);
   total+=parseFloat(p[1].replace(',',''));q++;
   tot.textContent='TOTAL $'+total.toFixed(2);qb.textContent=q;
   if(Object.keys(sold).length===4){setTimeout(function(){sold={};total=0;tls.innerHTML='';tot.textContent='TOTAL $0.00';el.querySelectorAll('.tile').forEach(function(x){x.classList.remove('sold')})},1600)}
 }
 if(o.stage){el.querySelectorAll('.tile').forEach(function(t){t.addEventListener('click',function(){sell(+t.getAttribute('data-i'))})})}
 else{el.querySelectorAll('.tile').forEach(function(b){b.disabled=true;b.tabIndex=-1})}
 var next=0;
 return {sell:function(){var tries=0;while(sold[next%4]&&tries<4){next++;tries++}sell(next%4);next++}};
};

/* 8 · FLOW — curva + umbral */
S.flow=function(o){
 var html='<div class="scn sc-flow"><svg viewBox="0 0 200 120" preserveAspectRatio="none">'
 +'<line class="thr" x1="0" x2="200" y1="34" y2="34"/>'
 +'<path class="crv" d="M0 84 C18 82 26 60 40 58 S64 92 80 88 S104 40 118 44 S142 78 158 74 S186 52 200 58" pathLength="100"/>'
 +'</svg><span class="chip acc psi mono">PSI 62.4</span><span class="chip warn xw mono">UMBRAL EXCEDIDO</span>'
 +rd('kafka · timescaledb · 12k lecturas/min')+'</div>';
 var el=h(o.host,html),thr=el.querySelector('.thr'),psi=el.querySelector('.psi');
 return {threshold:function(v){ /* v: 40–80 PSI → y 100→10 */
   var y=100-((v-40)/40)*90;
   thr.setAttribute('y1',y);thr.setAttribute('y2',y);
   el.classList.toggle('exceed',v<66);
   psi.textContent='PSI 62.4 · thr '+v.toFixed(0);
 }};
};

/* 9 · GOV — stepper de trámite */
S.gov=function(o){
 var labels=['recepción','revisión','dictamen','entrega'];
 var steps='';labels.forEach(function(l,i){steps+='<div class="gst" data-i="'+i+'"><i class="gbx mono">'+(i<2?'✓':i+1)+'</i><span class="gl mono">'+l+'</span></div>'+(i<3?'<i class="gln"></i>':'')});
 var html='<div class="scn sc-gov"><div class="gflow">'+steps+'</div>'
 +'<span class="chip ok done mono">TRÁMITE COMPLETO</span>'
 +rd('FOLIO GB-2201-044')+'</div>';
 var el=h(o.host,html),cur=2;
 el.querySelectorAll('.gst').forEach(function(s,i){if(i<2)s.classList.add('ok');if(i===2)s.classList.add('cur')});
 return {advance:function(){
   if(cur>=4){cur=2;el.classList.remove('complete');el.querySelectorAll('.gst').forEach(function(s,i){s.classList.remove('ok','cur');s.querySelector('.gbx').textContent=i<2?'✓':i+1;if(i<2)s.classList.add('ok');if(i===2)s.classList.add('cur')});return cur}
   var s=el.querySelector('.gst[data-i="'+cur+'"]');
   s.classList.remove('cur');s.classList.add('ok');s.querySelector('.gbx').textContent='✓';
   cur++;
   if(cur<4){var nx=el.querySelector('.gst[data-i="'+cur+'"]');nx.classList.add('cur')}
   else{el.classList.add('complete');cur=4}
   return cur;
 }};
};

/* 10 · CAR — barras de amortización */
S.car=function(o){
 var bars='';for(var i=0;i<5;i++){bars+='<div class="cbar" style="--i:'+i+'"><i></i></div>'}
 var html='<div class="scn sc-car"><div class="cbars">'+bars+'</div>'
 +rd('<span class="cq">$ 8,420 /mes · 48 meses</span>')+'</div>';
 var el=h(o.host,html);
 var PRICE=378900,RATE=0.149/12;
 function calc(n,engPct){
   var P=PRICE*(1-engPct/100);
   var m=P*RATE/(1-Math.pow(1+RATE,-n));
   return m;
 }
 var api={set:function(n,eng){
   var m=calc(n,eng);
   el.querySelector('.cq').textContent='$ '+Math.round(m).toLocaleString('en-US')+' /mes · '+n+' meses · '+eng+'%';
   var fr=[1,.8,.58,.34,.1];
   el.querySelectorAll('.cbar i').forEach(function(b,i){
     var f=fr[i]*(n/48)* (1-(eng-20)/160);
     b.style.transform='scaleY('+Math.max(.06,Math.min(1,f))+')';
   });
 }};
 if(o.stage){el.classList.add('manual');api.set(48,20);el.querySelector('.cq').textContent='$ 8,420 /mes · 48 meses · 20%'}
 return api;
};

/* 11 · CARE — EKG PQRST */
S.care=function(o){
 var seg='l6 0 l3 -5 l3 5 l4 0 l2 4 l3 -26 l3 32 l3 -12 l1 2 l6 0 l4 -7 l5 7 l7 0';
 var d='M-10 60 '+seg+' '+seg+' '+seg+' l40 0';
 var html='<div class="scn sc-care"><svg viewBox="0 0 200 120" preserveAspectRatio="none">'
 +'<path class="ekg" d="'+d+'" pathLength="100"/></svg>'
 +'<span class="chip warn hr mono">HR ALERT · 118 bpm</span>'
 +rd('<b class="bpm">72</b> bpm · SpO₂ 98% · HL7 1,204 msg')+'</div>';
 var el=h(o.host,html),tachy=false,t=null,bpm=72;
 var b=el.querySelector('.bpm');
 function step(){
   var target=tachy?118:72;
   if(bpm===target)return;
   bpm+=bpm<target?2:-2;
   b.textContent=bpm;
   el.style.setProperty('--ekg-t',(60/bpm*6.25)+'s');
   el.classList.toggle('alert',bpm>100);
   t=setTimeout(step,120);
 }
 return {tachy:function(){tachy=!tachy;clearTimeout(t);step();return tachy}};
};

/* 12 · VAULT — RAG citado */
S.vault=function(o){
 var html='<div class="scn sc-vault">'
 +'<div class="lock"><svg viewBox="0 0 24 24" fill="none"><path d="M7 10 V7 a5 5 0 0 1 10 0 v3" stroke="currentColor" stroke-width="1.75" stroke-linecap="square"/><rect x="5" y="10" width="14" height="10" rx="3" stroke="currentColor" stroke-width="1.75"/></svg></div>'
 +'<div class="ans">'
 +'<i class="al w90"></i>'
 +'<div class="ac" data-c="1"><i class="al w75"></i><button class="cit mono" data-c="1">[1]</button></div>'
 +'<i class="al w85"></i>'
 +'<div class="ac" data-c="2"><i class="al w60"></i><button class="cit mono" data-c="2">[2]</button></div>'
 +'</div>'
 +'<div class="srcs mono"><span class="src" data-s="1">política-datos.pdf · p.12</span><span class="src" data-s="2">contrato-marco.docx · §4.2</span></div>'
 +rd('0 datos fuera · 100% citado')+'</div>';
 var el=h(o.host,html),sel=null;
 function pick(c){
   sel=sel===c?null:c;
   el.querySelectorAll('.ac').forEach(function(a){a.classList.toggle('hl',a.getAttribute('data-c')===sel)});
   el.querySelectorAll('.src').forEach(function(s){s.classList.toggle('hl',s.getAttribute('data-s')===sel)});
 }
 if(o.stage){el.querySelectorAll('.cit').forEach(function(cb){cb.addEventListener('click',function(){pick(cb.getAttribute('data-c'))})})}
 else{el.querySelectorAll('.cit').forEach(function(b){b.disabled=true;b.tabIndex=-1})}
 return {cite:pick};
};

/* 13 · TURN — turnos */
S.turn=function(o){
 var dots='';for(var i=0;i<5;i++){dots+='<i style="--i:'+i+'"></i>'}
 var big=o.stage?'A-18':'042';
 var html='<div class="scn sc-turn"><div class="tnum mono"><span class="tv">'+big+'</span></div>'
 +'<div class="tdots">'+dots+'</div>'
 +rd('now serving · window 3')+'</div>';
 var el=h(o.host,html),n=18;
 if(o.stage)el.classList.add('manual');
 return {next:function(){
   n++;var tv=el.querySelector('.tv');
   tv.classList.remove('swap');void tv.offsetWidth;
   tv.textContent='A-'+n;tv.classList.add('swap');
   return n;
 }};
};

/* 14 · DEV — pipeline nodos */
S.dev=function(o){
 var labels=['build','test','e2e','scan','deploy'];
 var nodes='';labels.forEach(function(l,i){nodes+='<div class="dnd" style="--i:'+i+'"><i class="nbx"></i><span class="nl mono">'+l+'</span></div>'+(i<4?'<i class="dln" style="--i:'+i+'"></i>':'')});
 var html='<div class="scn sc-dev"><div class="dflow">'+nodes+'</div>'
 +rd('<span class="dvr">348 tests · coverage 94%</span>')+'</div>';
 var el=h(o.host,html),busy=false;
 if(o.stage)el.classList.add('manual');
 return {run:function(){
   if(busy)return;busy=true;
   var r=el.querySelector('.dvr'),nds=el.querySelectorAll('.dnd'),lns=el.querySelectorAll('.dln');
   nds.forEach(function(x){x.classList.remove('on','fin')});lns.forEach(function(x){x.classList.remove('on')});
   var i=0,tests=0;
   var tick=setInterval(function(){tests=Math.min(348,tests+29);r.textContent=tests+' tests · coverage 94%';if(tests>=348)clearInterval(tick)},90);
   (function nextN(){
     if(i>=nds.length){el.classList.add('deployed');r.textContent='348 tests · coverage 94% · deployed 42 ms';setTimeout(function(){el.classList.remove('deployed');busy=false},1400);return}
     nds[i].classList.add('on');
     if(i>0)lns[i-1].classList.add('on');
     if(i===nds.length-1)nds[i].classList.add('fin');
     i++;setTimeout(nextN,440);
   })();
 }};
};

/* 15 · DATE — agenda semanal */
S.date=function(o){
 var seed=FY.prng(44),cells='',occ=0,map=[];
 for(var c=0;c<5;c++){for(var r=0;r<6;r++){
   var v=seed();var on=v<.64;var tone=v<.3?' t2':'';
   if(on)occ++;map.push(on);
   cells+='<button class="slot'+(on?' on'+tone:'')+'" data-i="'+(c*6+r)+'" style="--i:'+(c*6+r)+'"></button>';
 }}
 var html='<div class="scn sc-date"><div class="dgrid">'+cells+'</div>'
 +'<span class="chip ok wa mono">CONFIRMACIÓN ENVIADA · WHATSAPP</span>'
 +rd('<span class="dvo">'+Math.round(occ/30*100)+'%</span> ocupación · 2 sucursales')+'</div>';
 var el=h(o.host,html),t=null;
 if(o.stage)el.classList.add('manual');
 function book(i){
   var s=el.querySelector('.slot[data-i="'+i+'"]');
   if(!s||s.classList.contains('on'))return;
   s.classList.add('on','new');occ++;
   el.querySelector('.dvo').textContent=Math.round(occ/30*100)+'%';
   el.classList.add('sent');clearTimeout(t);t=setTimeout(function(){el.classList.remove('sent')},1800);
 }
 if(o.stage){el.querySelectorAll('.slot').forEach(function(s){s.addEventListener('click',function(){book(+s.getAttribute('data-i'))})})}
 else{el.querySelectorAll('.slot').forEach(function(b){b.disabled=true;b.tabIndex=-1})}
 return {book:book};
};

/* ---- iconos de sistema (trazados propios, 24×24) ---- */
FY.ICONS={
 track:'<path d="M4 19c4 0 4-7 8-7s4-7 8-7"/><rect x="2.5" y="17.5" width="3" height="3"/><rect x="18.5" y="3.5" width="3" height="3"/>',
 fleet:'<rect x="2" y="7" width="11" height="8"/><path d="M13 10h4l4 3v2h-3"/><path d="M9 17h4.5"/><circle cx="7" cy="17" r="1.7"/><circle cx="16.5" cy="17" r="1.7"/>',
 map:'<path d="M12 3 21 8 12 13 3 8Z"/><path d="M3 12l9 5 9-5"/><path d="M3 16l9 5 9-5"/>',
 ledger:'<path d="M12 5C10 3.6 6 3.6 4 5v14c2-1.4 6-1.4 8 0 2-1.4 6-1.4 8 0V5c-2-1.4-6-1.4-8 0Z"/><path d="M12 5v14"/>',
 tax:'<path d="M6 3h9l4 4v14H6Z"/><path d="M15 3v4h4"/><path d="M9 13l2.5 2.5L16 11"/>',
 bank:'<path d="M3 7h11M3 12h18M3 17h8"/><rect x="16.5" y="4.5" width="5" height="5"/><rect x="13.5" y="14.5" width="5" height="5"/>',
 shop:'<path d="M4 8h16l-1.6 12H5.6Z"/><path d="M9 8c0-4 6-4 6 0"/>',
 flow:'<path d="M4 19a8 8 0 0 1 16 0"/><path d="M12 19l4.5-6"/><path d="M2 19h20"/>',
 gov:'<path d="M3 21h18"/><path d="M12 3l8 5H4Z"/><path d="M5.5 21V11m4.4 10V11m4.2 10V11m4.4 10V11"/>',
 car:'<path d="M3 16.5h18"/><path d="M4.5 16.5V13L7 8h10l2.5 5v3.5"/><path d="M7.5 12.5h9"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="18" r="1.6"/>',
 care:'<path d="M3 12h4l2-5 3 10 2-5h7"/>',
 vault:'<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><path d="M12 14v2.5"/>',
 turn:'<path d="M4 6h16v4.5a1.8 1.8 0 0 0 0 3V18H4v-4.5a1.8 1.8 0 0 0 0-3Z"/><path d="M9.5 6v12" stroke-dasharray="2.4 2.4"/>',
 dev:'<path d="M8 5 3 12l5 7"/><path d="M16 5l5 7-5 7"/><rect x="10.5" y="10.5" width="3" height="3"/>',
 date:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/><rect x="13" y="13" width="4" height="4"/>'
};
FY.icon=function(slug){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(FY.ICONS[slug]||'')+'</svg>'};
FY.mountScene=function(slug,host,opts){
 opts=opts||{};opts.host=host;
 host.classList.add('fy-winbody');host.setAttribute('data-loop','');
 var api=S[slug]?S[slug](opts):{};
 if(FY.loop)FY.loop(host);
 return api;
};
})();
