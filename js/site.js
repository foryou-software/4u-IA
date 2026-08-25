/* FOURYOU · site.js — hero vivo + bento + chrome */
(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
FY.bindTheme();FY.bindLang();FY.applyI18n();
/* ---- capacidades (9, con iconos propios) ---- */
var CAPICONS=[
 '<path d="M12 3 20 7v10l-8 4-8-4V7Z"/><path d="M4 7l8 4 8-4"/><path d="M12 11v10"/>',
 '<path d="M4 9V4h5"/><path d="M4 4l6 6"/><path d="M20 15v5h-5"/><path d="M20 20l-6-6"/>',
 '<path d="M9 12h6"/><rect x="3" y="8" width="6" height="8" rx="1.5"/><rect x="15" y="8" width="6" height="8" rx="1.5"/>',
 '<path d="M12 3l7 3v6c0 4-3 6.5-7 9-4-2.5-7-5-7-9V6Z"/><rect x="10.8" y="9.5" width="2.4" height="4.5"/>',
 '<path d="M13 3 5 14h6l-1 7 8-11h-6Z"/>',
 '<path d="M12 21s-6-5.2-6-10a6 6 0 1 1 12 0c0 4.8-6 10-6 10Z"/><rect x="10.5" y="9" width="3" height="3"/>',
 '<path d="M6.5 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.8 1.2A3.5 3.5 0 0 1 17 18Z"/>',
 '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 '<path d="M4 13a8 8 0 0 1 16 0"/><path d="M4 13v5h4v-5Z"/><path d="M20 13v5h-4v-5Z"/>'
];
var capsHost=$('#caps');
function renderCaps(){
  if(!capsHost)return;
  var out='';
  for(var i=1;i<=9;i++){out+='<div class="cap" style="--ci:'+((i-1)%3)+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+CAPICONS[i-1]+'</svg><h3>'+FY.t('cap.'+i+'.t')+'</h3><p>'+FY.t('cap.'+i+'.d')+'</p></div>'}
  capsHost.innerHTML=out;
}
renderCaps();
/* ---- heatmap determinista ---- */
var heat=$('#heat');if(heat){var rnd=FY.prng(42),html='';for(var i=0;i<35;i++){var v=rnd();var l=v<.2?0:v<.45?1:v<.7?2:v<.9?3:4;html+='<i class="l'+l+'"></i>'}heat.innerHTML=html}
/* ---- contadores one-shot ---- */
$$('[data-count]').forEach(function(el){
  var target=+el.getAttribute('data-count'),suf=el.getAttribute('data-suffix')||'';
  if(FY.reduced)return;
  FY.onEnterOnce(el,function(){
    var t0=performance.now();
    (function tick(now){
      var p=Math.min(1,(now-t0)/900);p=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*p)+suf;
      if(p<1)requestAnimationFrame(tick);
    })(t0);
  });
});
/* ---- oscilación determinista del estado ---- */
var oscRun=true,inst=$('#instStatus');
if(inst){FY.loop(inst,function(r){oscRun=r});
  var rnd2=FY.prng(7),ph=rnd2()*6;
  setInterval(function(){
    if(!oscRun||FY.reduced)return;
    var t=Date.now()/1000;
    $('#st1').textContent=(87+Math.round(Math.sin(t*.6+ph)*1))+'%';
    $('#st4').textContent=(42+Math.round(Math.sin(t*.4+ph*2)*2))+' ms';
  },2400);
}
/* ---- instrumentos: entrada + feed de commits + celdas vivas ---- */
['instStatus','instAct'].forEach(function(id){var el=$('#'+id);if(el)FY.onEnterOnce(el,function(){el.classList.add('go')})});
var act=$('#instAct'),cl=$('#commitLine');
if(act&&cl){
  var heatEl=$('#heat'),cells=[];
  if(heatEl){var rndH=FY.prng(42),hh='';for(var hi=0;hi<60;hi++){var hv=rndH();var lv=hv<.2?0:hv<.45?1:hv<.7?2:hv<.9?3:4;hh+='<i class="l'+lv+'" style="--d:'+hi+'"></i>'}heatEl.innerHTML=hh;cells=$$('#heat i')}
  var COMMITS=[['a41f2c','fix: conciliación Δ 0.00'],['7d90e1','feat: geocercas v2'],['c3b8aa','test: 348 verdes · e2e 96/96'],['f12d04','perf: fix 640 ms sostenido']];
  var cIdx=0,actRun=true;FY.loop(act,function(r){actRun=r});
  var setC=function(){cl.innerHTML='<b>●</b> '+COMMITS[cIdx][0]+' — '+COMMITS[cIdx][1]};
  setC();
  if(!FY.reduced){setInterval(function(){
    if(!actRun||document.hidden)return;
    cIdx=(cIdx+1)%COMMITS.length;
    cl.classList.add('fade');setTimeout(function(){setC();cl.classList.remove('fade')},280);
    var c=cells[Math.floor(Math.random()*cells.length)];
    if(c){c.classList.add('hot');setTimeout(function(){c.classList.remove('hot')},700)}
  },3400)}
}
/* ---- tilt del emblema (±12°, persp 620) ---- */
var em=$('#emblem');
if(em&&!FY.reduced){
  var core=$('.fy-core',em);
  em.addEventListener('pointermove',function(e){
    var b=em.getBoundingClientRect();
    var x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
    core.style.transform='rotateY('+(x*24)+'deg) rotateX('+(-y*24)+'deg)';
  });
  em.addEventListener('pointerleave',function(){core.style.transform=''});
}
/* ---- consola: guiones ley ---- */
var SCRIPTS={
 deploy:[['p','$ fouryou deploy --prod'],['m','› affected: 3 of 15 apps'],['g','✓ build 12.4s · cache 87%'],['g','✓ 348 tests · coverage 94%'],['g','✓ e2e · playwright 96/96'],['g','✓ security scan · 0 findings'],['p','▲ deployed · 42 ms · zero downtime']],
 legacy:[['p','$ fouryou analyze ./legacy-erp'],['m','› language: VB.NET · 214k LOC'],['g','✓ dependency map built'],['g','✓ 37 modules documented'],['g','✓ risk hotspots: 4 flagged'],['g','✓ test harness generated'],['p','▲ modernization plan ready']]
};
var cbody=$('#cbody'),consoleEl=$('#console'),session=0,running=true,curTab='deploy';
function pulse(){
  if(FY.reduced)return;
  [consoleEl,$('#instStatus'),$('#instAct')].forEach(function(w,i){
    if(!w)return;
    setTimeout(function(){w.classList.add('pulse-run');setTimeout(function(){w.classList.remove('pulse-run')},950)},i*120);
  });
  if(em){em.classList.add('lit');setTimeout(function(){em.classList.remove('lit')},1500)}
}
function typer(){
  if(!cbody)return;
  var sid=++session,lines=SCRIPTS[curTab],li=0,ci=0;
  cbody.innerHTML='';
  if(FY.reduced){ /* estado final, sin teclear */
    cbody.innerHTML=lines.map(function(l){return '<span class="ln '+l[0]+'">'+l[1]+'</span>'}).join('');
    return;
  }
  var cur=document.createElement('span');cur.className='ln '+lines[0][0];cbody.appendChild(cur);
  var caret=document.createElement('span');caret.className='caret';cur.appendChild(caret);
  function step(){
    if(sid!==session)return;
    if(!running||document.hidden){setTimeout(step,400);return}
    var l=lines[li],txt=l[1];
    if(ci<txt.length){
      ci++;caret.remove();cur.textContent=txt.slice(0,ci);cur.appendChild(caret);
      setTimeout(step,16+Math.random()*26);
    }else{
      li++;ci=0;
      if(li>=lines.length){
        caret.remove();pulse();
        setTimeout(function(){if(sid===session)typer()},5200);
        return;
      }
      cur=document.createElement('span');cur.className='ln '+lines[li][0];cbody.appendChild(cur);cur.appendChild(caret);
      setTimeout(step,li===1?500:260);
    }
  }
  setTimeout(step,300);
}
if(consoleEl){
  FY.loop(consoleEl,function(r){running=r});
  $$('.tabs button',consoleEl).forEach(function(b){
    b.addEventListener('click',function(){
      curTab=b.getAttribute('data-tab');
      $$('.tabs button',consoleEl).forEach(function(x){x.setAttribute('aria-selected',String(x===b))});
      typer();
    });
  });
  typer();
}
/* ---- bento: 15 tarjetas desde el registro ---- */
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
function card(s){
  var L=FY.sysT(s);
  var span=s.star?' span3':(s.wide?' span2':'');
  return '<article class="card'+span+'" data-slug="'+s.slug+'">'
  +'<figure class="fy-window" style="view-transition-name:stage-'+s.slug+'">'
  +'<div class="scene-host"></div></figure>'
  +'<div class="card-body">'
  +'<div class="card-head"><span class="sic tile">'+FY.icon(s.slug)+'</span><div class="card-id">'
  +'<h3 class="card-title"><a href="demo.html?s='+s.slug+'"><em class="fu">4U</em>'+s.name+'</a>'+(s.star?'<span class="badge-new">'+FY.t('card.new')+'</span>':'')+'</h3>'
  +'<span class="card-sec">'+esc(L.sec)+'</span></div></div>'
  +'<p class="card-desc">'+esc(L.d)+'</p>'
  +'<a class="btn btn-ghost btn-sm" href="demo.html?s='+s.slug+'">'+FY.t('card.cta')+'</a>'
  +'</div></article>';
}
function renderBento(){
  [1,2,3].forEach(function(cl){
    var host=$('#bento'+cl);if(!host)return;
    host.innerHTML=FY.SYS.filter(function(s){return s.cluster===cl}).map(card).join('');
  });
  $$('.card').forEach(function(c,ci){
    c.style.setProperty('--ci',ci%6);
    var slug=c.getAttribute('data-slug');
    FY.mountScene(slug,$('.scene-host',c),{stage:false});
  });
  var fs=$('#footSys');
  if(fs){fs.innerHTML=FY.SYS.map(function(s){return '<li><a href="demo.html?s='+s.slug+'"><span class="fu">4U</span>'+s.name+'</a></li>'}).join('')}
}
renderBento();
document.addEventListener('fy:lang',function(){renderBento();renderCaps()});
/* ---- formulario front-only → mailto ---- */
var form=$('#conForm');
if(form){form.addEventListener('submit',function(e){
  e.preventDefault();
  var d=new FormData(form);
  var body=d.get('nombre')+' · '+(d.get('empresa')||'—')+' · '+d.get('correo')+'\n\n'+d.get('msg');
  location.href='mailto:eddy.penaloza@fouryou.io?subject='+encodeURIComponent(FY.t('con.subject'))+'&body='+encodeURIComponent(body);
})}
FY.reveal();
FY.scrollFx();
})();
