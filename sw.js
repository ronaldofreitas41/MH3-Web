// sw.js — MATA-CACHE — 21/07/2026
// Substitui o service worker antigo do "Instalar no celular" (PWA).
// Função: apagar qualquer cópia velha do sistema guardada no aparelho
// e se remover sozinho. Depois disso o sistema vem SEMPRE do servidor.
self.addEventListener('install', function (e) {
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(
    (async function () {
      try {
        var nomes = await caches.keys();
        await Promise.all(nomes.map(function (n) { return caches.delete(n); }));
      } catch (err) {}
      try { await self.registration.unregister(); } catch (err) {}
      try {
        var abas = await self.clients.matchAll({ type: 'window' });
        abas.forEach(function (a) { try { a.navigate(a.url); } catch (err) {} });
      } catch (err) {}
    })()
  );
});
// Sem interceptação de nada: este service worker não guarda cache nenhum.