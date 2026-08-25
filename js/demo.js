/* FOURYOU · demo.js — shell parametrizado de los 15 (?s=slug) */
(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var slug=new URLSearchParams(location.search).get('s')||'track';
var sys=FY.sys(slug);
if(!sys){location.replace('index.html#sistemas');return}
var root=$('#droot');
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;')}
var api=null;
function controlsHTML(L){
  var c='';
  if(sys.slug==='flow'){c='<label>'+esc(L.s1)+'<input type="range" id="ix1" min="40" max="80" value="70" step="1"><output id="ox1">70</output></label>'}
  else if(sys.slug==='car'){
    c='<label>'+esc(L.s1)+'<input type="range" id="ix1" min="12" max="60" value="48" step="12"><output id="ox1">48</output></label>'
     +'<label>'+esc(L.s2)+'<input type="range" id="ix2" min="10" max="50" value="20" step="5"><output id="ox2">20</output></label>';
  }
  else if(L.b){c='<button class="btn btn-primary" id="ixb">'+esc(L.b)+'</button>'}
  return c;
}
function render(){
  var L=FY.sysT(sys);
  document.title='4U'+sys.name+' — FOURYOU';
  root.innerHTML=
  '<header class="dhead container"><span class="card-sec fy-dyn">'+esc(L.sec)+'</span>'
  +'<h1><span class="sic dsic">'+FY.icon(sys.slug)+'</span><em class="fu">4U</em>'+sys.name+'</h1>'
  +'<p class="lead fy-dyn">'+esc(L.d)+'</p></header>'
  +'<div class="container stage-wrap">'
  +'<figure class="fy-window stage" style="view-transition-name:stage-'+sys.slug+'">'
  +'<div class="fy-winbar"><span class="fy-dots"><i></i><i></i><i></i></span><span class="fy-wintitle">'+sys.win+'</span><span class="fy-winchip">'+FY.t('chip.demo')+'</span></div>'
  +'<div class="scene-host"></div></figure>'
  +'<div class="ibar"><span class="kicker">'+FY.t('demo.interact')+'</span><span class="hint fy-dyn">'+esc(L.act)+'</span>'+controlsHTML(L)+'</div>'
  +'<div class="kpis">'+sys.kpi.map(function(k){return '<div class="kpi"><b>'+k[0]+'</b><span>'+esc(k[1][FY.lang])+'</span></div>'}).join('')+'</div>'
  +'</div>'
  +'<div class="container"><div class="dsec"><span class="kicker">'+FY.t('demo.feat')+'</span><div class="feats">'
  +L.f.map(function(f,i){return '<div class="feat"><i>0'+(i+1)+'</i><div><h3>'+esc(f[0])+'</h3><p>'+esc(f[1])+'</p></div></div>'}).join('')
  +'</div></div>'
  +'<div class="dsec"><span class="kicker">'+FY.t('demo.stack')+'</span><div class="layers">'
  +[['BACKEND',sys.stack.b],['FRONTEND',sys.stack.f],['INFRA',sys.stack.i]].map(function(l){return '<div class="layer"><h4>'+l[0]+'</h4><div class="card-chips">'+l[1].map(function(c){return '<span>'+c+'</span>'}).join('')+'</div></div>'}).join('')
  +'</div></div>'
  +'<div class="dcards">'
  +'<div class="dcard"><h3>'+FY.t('demo.want.t')+'</h3><p>'+FY.t('demo.want.d')+'</p>'
  +'<div class="dact">'
  +(sys.full?'<a class="btn btn-primary" href="'+sys.full+'">'+FY.t('demo.open')+'</a>':'')
  +'<a class="btn '+(sys.full?'btn-ghost':'btn-primary')+'" href="mailto:eddy.penaloza@fouryou.io?subject='+encodeURIComponent(FY.t('demo.subject')+' · 4U'+sys.name)+'">'+FY.t('demo.cta')+'</a>'
  +'</div></div>'
  +'<div class="dcard illus"><span class="kicker">'+FY.t('demo.illus.t')+'</span><p>'+FY.t('demo.illus.d')+'</p></div>'
  +'</div>'
  +'<div class="dnext"><a href="demo.html?s='+nextSlug()+'">'+FY.t('demo.next')+'</a></div></div>';
  /* escena operable */
  var host=$('.scene-host',root);
  host.parentElement.classList.add('stage');
  api=FY.mountScene(sys.slug,host,{stage:true});
  wire(L);
}
function nextSlug(){
  var i=FY.SYS.indexOf(sys);return FY.SYS[(i+1)%FY.SYS.length].slug;
}
function wire(L){
  var b=$('#ixb'),x1=$('#ix1'),x2=$('#ix2');
  if(sys.slug==='fleet'&&b){b.addEventListener('click',function(){var f=api.follow();b.textContent=f?L.b2:L.b})}
  else if(sys.slug==='map'&&b){b.addEventListener('click',function(){api.toggle()})}
  else if(sys.slug==='ledger'&&b){b.addEventListener('click',function(){api.match()})}
  else if(sys.slug==='tax'&&b){b.addEventListener('click',function(){api.stamp()})}
  else if(sys.slug==='bank'&&b){b.addEventListener('click',function(){api.spike()})}
  else if(sys.slug==='shop'&&b){b.addEventListener('click',function(){api.sell()})}
  else if(sys.slug==='gov'&&b){b.addEventListener('click',function(){api.advance()})}
  else if(sys.slug==='care'&&b){b.addEventListener('click',function(){var t=api.tachy();b.textContent=t?L.b2:L.b})}
  else if(sys.slug==='turn'&&b){b.addEventListener('click',function(){api.next()})}
  else if(sys.slug==='dev'&&b){b.addEventListener('click',function(){api.run()})}
  else if(sys.slug==='flow'&&x1){
    var o1=$('#ox1');
    var upd=function(){o1.value=x1.value;api.threshold(+x1.value)};
    x1.addEventListener('input',upd);upd();
  }
  else if(sys.slug==='car'&&x1&&x2){
    var oa=$('#ox1'),ob=$('#ox2');
    var updc=function(first){oa.value=x1.value;ob.value=x2.value;if(!first)api.set(+x1.value,+x2.value)};
    x1.addEventListener('input',function(){updc(false)});
    x2.addEventListener('input',function(){updc(false)});
    updc(true);
  }
}
FY.bindTheme();FY.bindLang();FY.applyI18n();
render();
document.addEventListener('fy:lang',function(){FY.applyI18n();render()});
FY.reveal&&FY.reveal();
FY.scrollFx&&FY.scrollFx();
})();
