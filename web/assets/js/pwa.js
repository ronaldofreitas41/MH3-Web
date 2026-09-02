
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      try{ reg.update(); }catch(e){}
      // Quando um Service Worker novo assumir o controle, recarrega 1x para aplicar a versão nova
      var jaRecarregou=false;
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        if(jaRecarregou) return; jaRecarregou=true;
        window.location.reload();
      });
      // Verifica se há atualização sempre que o app volta ao primeiro plano (útil no celular)
      document.addEventListener('visibilitychange', function(){
        if(document.visibilityState==='visible'){ try{ reg.update(); }catch(e){} }
      });
    }).catch(function(e){ console.log('SW:', e&&e.message); });
  });
}

