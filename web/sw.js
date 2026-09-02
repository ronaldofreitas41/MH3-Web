/* ===== MH3 Service Worker =====
   Estratégia: o SISTEMA (index.php / páginas) sempre vem fresquinho da internet,
   e os arquivos fixos (imagens, ícones, bibliotecas) ficam em cache pra abrir rápido.
   Isso acaba com o problema de "subi a correção mas continua mostrando o antigo".
   Para forçar uma atualização geral, basta mudar a versão abaixo. */
const CACHE = 'mh3-2026-06-17-1';

self.addEventListener('install', function(e){
  // assume o controle imediatamente, sem esperar fechar as abas
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(chaves){
      return Promise.all(chaves.map(function(k){ if(k !== CACHE) return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if(req.method !== 'GET') return; // só trata leitura (GET)

  var url;
  try { url = new URL(req.url); } catch(_) { return; }

  // 1) Chamadas de dados (api.php / ?action=...): SEMPRE direto da internet, nunca do cache
  if(url.pathname.indexOf('/api.php') !== -1 || url.search.indexOf('action=') !== -1){
    return; // deixa o navegador buscar direto
  }

  // 2) Arquivos fixos (js, css, imagens, fontes, ícones, manifest): cache primeiro (rápido)
  if(/\.(js|css|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|json)$/i.test(url.pathname)){
    e.respondWith(
      caches.match(req).then(function(c){
        return c || fetch(req).then(function(r){
          try { var cp = r.clone(); caches.open(CACHE).then(function(x){ x.put(req, cp); }); } catch(_){}
          return r;
        });
      })
    );
    return;
  }

  // 3) O SISTEMA (index.php, login.html, navegação): INTERNET PRIMEIRO (sempre a versão nova).
  //    Se estiver offline, usa a última versão guardada como reserva.
  e.respondWith(
    fetch(req).then(function(r){
      try { var cp = r.clone(); caches.open(CACHE).then(function(x){ x.put(req, cp); }); } catch(_){}
      return r;
    }).catch(function(){ return caches.match(req); })
  );
});
