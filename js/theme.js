/* FOURYOU · theme pre-paint (cargar síncrono en <head>) */
(function(){
  /* registrado ANTES de cualquier navegación: las View Transitions cross-document
     rechazan su promesa al saltarse (pestaña oculta, reduced-motion) — inofensivo */
  window.addEventListener('unhandledrejection',function(e){
    var m=String((e.reason&&e.reason.message)||e.reason||'').toLowerCase();
    if(m.indexOf('transition')>-1&&(m.indexOf('skip')>-1||m.indexOf('abort')>-1))e.preventDefault();
  });
  var d=document.documentElement,t=null;
  /* en contexto embebido (iframe de preview) las cross-document VT siempre se saltan
     y ensucian la consola: se apagan ahí; en ventana propia quedan activas */
  /* cross-document View Transitions: opt-in solo en ventana propia (en el iframe
     de preview siempre se saltan y ensucian la consola) */
  if(window.self===window.top){
    var st=document.createElement('style');
    st.textContent='@view-transition{navigation:auto}';
    (document.head||d).appendChild(st);
  }
  try{t=localStorage.getItem('fy-theme')}catch(e){}
  if(t!=='light'&&t!=='dark')t='dark';
  d.setAttribute('data-theme',t);d.classList.add('js');
  window.FY=window.FY||{};FY.theme=t;
  FY.toggleTheme=function(){
    FY.theme=FY.theme==='dark'?'light':'dark';
    d.setAttribute('data-theme',FY.theme);
    try{localStorage.setItem('fy-theme',FY.theme)}catch(e){}
    document.querySelectorAll('[data-theme-btn]').forEach(function(b){b.setAttribute('aria-pressed',String(FY.theme==='light'))});
  };
  FY.bindTheme=function(){
    document.querySelectorAll('[data-theme-btn]').forEach(function(b){
      b.addEventListener('click',FY.toggleTheme);
      b.setAttribute('aria-pressed',String(FY.theme==='light'));
    });
  };
})();
