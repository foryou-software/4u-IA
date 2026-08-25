/* FOURYOU · verify — paridad i18n 1:1 (reporte en consola) */
(function(){
  window.addEventListener('load',function(){
    if(!window.FY||!FY.DICT||!FY.SYS){console.warn('[fy-verify] i18n no cargado');return}
    var langs=['es','en','pt'],base=Object.keys(FY.DICT.es),ok=true,rep={keysES:base.length};
    langs.slice(1).forEach(function(l){
      var miss=base.filter(function(k){return !(k in FY.DICT[l])});
      var extra=Object.keys(FY.DICT[l]).filter(function(k){return !(k in FY.DICT.es)});
      if(miss.length||extra.length)ok=false;
      rep[l]={keys:Object.keys(FY.DICT[l]).length,missing:miss,extra:extra};
    });
    var sysBad=[];
    FY.SYS.forEach(function(s){langs.forEach(function(l){
      var o=s[l];
      if(!o||!o.sec||!o.d||!o.act||!o.f||o.f.length!==4){sysBad.push(s.slug+':'+l)}
      s.kpi.forEach(function(k,i){langs.forEach(function(ll){if(!k[1][ll])sysBad.push(s.slug+':kpi'+i+':'+ll)})});
    })});
    if(sysBad.length)ok=false;rep.sys=FY.SYS.length;rep.sysBad=sysBad;
    console.info('%cFOURYOU i18n · paridad '+(ok?'✓ 1:1 verificada':'✗ FALLA'),'font-weight:700;color:'+(ok?'#34C08B':'#E2687A'),rep);
  });
})();
