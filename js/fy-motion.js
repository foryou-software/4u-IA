/* FOURYOU · fy-motion — gobernanza única de loops: viewport + pestaña */
window.FY=window.FY||{};
(function(){
  /* las View Transitions cross-document rechazan su promesa al saltarse (pestaña oculta, reduced-motion): inofensivo */
  window.addEventListener('unhandledrejection',function(e){
    var m=String((e.reason&&e.reason.message)||e.reason||'').toLowerCase();
    if(m.indexOf('transition')>-1&&(m.indexOf('skip')>-1||m.indexOf('abort')>-1))e.preventDefault();
  });
  FY.reduced=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var io=('IntersectionObserver'in window)?new IntersectionObserver(function(es){
    es.forEach(function(en){
      en.target.classList.toggle('fy-paused',!en.isIntersecting);
      en.target._fyVis=en.isIntersecting;
      (en.target._fyCbs||[]).forEach(function(cb){cb(en.isIntersecting&&!document.hidden)});
    });
  },{rootMargin:'60px'}):null;
  /* registra un loop (CSS: solo pausa clases; JS: cb(running) para timers propios) */
  FY.loop=function(el,cb){
    if(cb){(el._fyCbs=el._fyCbs||[]).push(cb)}
    if(io){io.observe(el)}else if(cb){cb(true)}
  };
  document.addEventListener('visibilitychange',function(){
    var h=document.hidden;
    document.documentElement.classList.toggle('fy-hidden',h);
    document.querySelectorAll('[data-loop]').forEach(function(el){
      (el._fyCbs||[]).forEach(function(cb){cb(!h&&el._fyVis!==false)});
    });
  });
  FY.onEnterOnce=function(el,cb){
    if(!('IntersectionObserver'in window)){cb();return}
    var o=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){cb();o.disconnect()}})},{threshold:.3});
    o.observe(el);
  };
  FY.reveal=function(){
    if(FY.reduced){document.querySelectorAll('[data-reveal]').forEach(function(e){e.classList.add('in')});return}
    var o=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');o.unobserve(en.target)}})},{threshold:.12});
    document.querySelectorAll('[data-reveal]').forEach(function(e){o.observe(e)});
  };
  /* PRNG determinista (LCG) para todo dato simulado */
  /* marca de agua + barra de progreso ligadas al scroll (rAF) */
  FY.scrollFx=function(){
    var wm=document.getElementById('wmMark'),prog=document.getElementById('scrollProg'),tick=false;
    function run(){
      if(tick)return;tick=true;
      requestAnimationFrame(function(){
        var y=window.scrollY||0,max=document.documentElement.scrollHeight-window.innerHeight;
        if(prog)prog.style.transform='scaleX('+(max>0?Math.min(1,y/max):0)+')';
        if(wm&&!FY.reduced)wm.style.transform='translateY('+(y*-.04)+'px) rotate('+(-7+y*.005)+'deg) scale('+(1+Math.min(.1,y*.00003))+')';
        tick=false;
      });
    }
    window.addEventListener('scroll',run,{passive:true});run();
  };
  FY.prng=function(seed){var s=seed>>>0;return function(){s=(s*1664525+1013904223)>>>0;return s/4294967296}};
})();
