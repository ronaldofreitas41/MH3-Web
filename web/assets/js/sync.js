// ---- AUTO-SYNC: puxa dados de todos automaticamente (a cada 45s) ----
let _autoSyncTimer=null;
function _avisarServidorVelho(){
  if(document.getElementById('aviso-sv-velho'))return;
  var d=document.createElement('div');
  d.id='aviso-sv-velho';
  d.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#dc2626;color:#fff;padding:10px 14px;text-align:center;font-size:13px;font-weight:600;box-shadow:0 2px 10px rgba(0,0,0,.35)';
  d.innerHTML='\u26a0\ufe0f O arquivo <b>api.php</b> do servidor est\u00e1 DESATUALIZADO. A auditoria e a atualiza\u00e7\u00e3o entre usu\u00e1rios s\u00f3 voltam a funcionar quando voc\u00ea subir o <b>api.php</b> novo (junto com o index.php). &nbsp;<span style="text-decoration:underline;cursor:pointer" onclick="document.getElementById(\'aviso-sv-velho\').remove()">fechar</span>';
  document.body.appendChild(d);
}
function _ocultarAvisoServidorVelho(){var d=document.getElementById('aviso-sv-velho');if(d)d.remove();}

function iniciarAutoSync(){
  if(_autoSyncTimer) return; // já está rodando
  // Verificação LEVE a cada 7s: só puxa tudo se algo mudou no servidor (rápido p/ vários usuários)
  _autoSyncTimer=setInterval(_verificarMudancaServidor, 7000);
  // Pull completo de segurança a cada 60s
  if(!window._autoSyncFullTimer) window._autoSyncFullTimer=setInterval(_autoSyncPull, 60000);
}
async function _verificarMudancaServidor(){
  try{
    if(!(typeof syncAtivo!=='undefined' && syncAtivo)) return;
    if(!authToken || String(authToken).indexOf('local_')===0) return;
    if(_editandoAgora()) return;
    const r = await apiCall('ultima_alteracao');
    if(r && r.ok){ if(!r.mods){ if(typeof _avisarServidorVelho==='function')_avisarServidorVelho(); return; } else { if(typeof _ocultarAvisoServidorVelho==='function')_ocultarAvisoServidorVelho(); } }
    if(!(r && r.ok && r.mods)) return;
    var atuais = r.mods;
    // primeira leitura: só guarda a referência
    if(!window._verMods){ window._verMods = atuais; return; }
    // se EU mesmo acabei de salvar, atualizo a referência e NÃO puxo (evita re-render à toa)
    if(window._localSaveTs && (Date.now()-window._localSaveTs < 5000)){ window._verMods = atuais; return; }
    // descobre quais módulos mudaram
    var mudaram=[];
    for(var m in atuais){ if(!Object.prototype.hasOwnProperty.call(atuais,m))continue; if(atuais[m]!==window._verMods[m]) mudaram.push(m); }
    window._verMods = atuais;
    if(mudaram.length){ await _pullModulos(mudaram); }
  }catch(e){}
}
async function _pullModulos(mods){
  try{
    for(var i=0;i<mods.length;i++){
      var mod=mods[i];
      try{ var r=await apiCall('buscar&modulo='+encodeURIComponent(mod)); if(r && r.ok && Array.isArray(r.dados)){ D[mod]=r.dados; } }catch(e){}
    }
    try{_capturarSids();}catch(e){}
    try{localStorage.setItem('mh3v5', JSON.stringify(D));}catch(e){}
    if(_editandoAgora()) return; // abriu algo enquanto buscava
    try{ if(typeof cur!=='undefined' && typeof rp==='function') rp(cur); }catch(e){}
  }catch(e){}
}
function _editandoAgora(){
  if(document.querySelector('.mo.op')) return true; // modal aberto
  var ae=document.activeElement;
  if(ae && (ae.tagName==='INPUT'||ae.tagName==='TEXTAREA'||ae.tagName==='SELECT')) return true; // digitando
  return false;
}
async function _autoSyncPull(){
  try{
    if(!(typeof syncAtivo!=='undefined' && syncAtivo)) return;          // só online
    if(!authToken || String(authToken).indexOf('local_')===0) return;
    if(_editandoAgora()) return;                                         // não interrompe edição
    const controller=new AbortController();
    const tid=setTimeout(function(){controller.abort();},30000);
    const res=await fetch('api.php?action=buscar_tudo&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:'{}',signal:controller.signal});
    clearTimeout(tid);
    const r=await res.json();
    if(r && r.ok && r.dados){
      ['equips','contratos','medicoes','manutencoes','vendas','despesas','estoque','nfs','revisoes','checklists','usuarios','funcionarios','clientes','pneus','mobilizacoes','saidasMaterial','ajudasMotorista','contasBanco','investimentos','tratativas','pneus_pend','seguros'].forEach(function(mod){ if(r.dados[mod]) D[mod]=r.dados[mod]; });
      try{_syncMergeExtra(r.dados);}catch(e){}
      try{_capturarSids();}catch(e){}
      try{localStorage.setItem('mh3v5', JSON.stringify(D));}catch(e){}
      if(_editandoAgora()) return;                                       // abriu algo enquanto buscava
      try{ if(typeof cur!=='undefined' && typeof rp==='function') rp(cur); }catch(e){}
    }
  }catch(e){}
}

// ---- SYNC CARREGAR ----
async function syncCarregar() {
    // Inicia o sistema imediatamente — sem loading bloqueante
    _initCore();
    try{iniciarAutoSync();}catch(e){}

    // Sincroniza com banco em background (sem bloquear)
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 45000);

        const res = await fetch('api.php?action=buscar_tudo&token=' + encodeURIComponent(authToken), {
            method: 'POST',
            headers: {'Content-Type':'application/json', 'X-Token': authToken},
            body: '{}',
            signal: controller.signal
        });

        const r = await res.json();

        if (r.ok && r.dados) {
            ['equips','contratos','medicoes','manutencoes','vendas','despesas',
             'estoque','nfs','revisoes','checklists','usuarios','funcionarios','clientes','pneus','mobilizacoes','saidasMaterial','ajudasMotorista','contasBanco','investimentos','tratativas','pneus_pend','seguros'].forEach(mod => {
                if (r.dados[mod]) D[mod] = r.dados[mod];
            }); try{_syncMergeExtra(r.dados);}catch(e){} try{_capturarSids();}catch(e){}
            try{normalizarUsuarios();}catch(e){}
            try{localStorage.setItem('mh3_ultima_sync', String(Date.now()));}catch(e){}
            mostrarStatusConexao(true);
            rp(cur);

            try {
                const cf = await fetch('api.php?action=buscar_config&token=' + encodeURIComponent(authToken), {
                    method:'POST',
                    headers:{'Content-Type':'application/json', 'X-Token': authToken},
                    body:'{}'
                });
                const cfg = await cf.json();
                if (cfg.ok && cfg.config) D.config = {...D.config, ...cfg.config};
                // Restaura usuários vindos das configurações (cross-PC)
                if (D.config && D.config.usuarios && D.config.usuarios.length) {
                    D.usuarios = D.config.usuarios;
                    try{ localStorage.setItem('mh3v5', JSON.stringify(D)); }catch(e){}
                }
            } catch(e) {}
        } else if (r.msg === 'sessao' || res.status === 401) {
            // Token realmente recusado pelo servidor
            syncAtivo = false;
            mostrarStatusConexao(false);
        } else {
            // Banco respondeu (mesmo vazio) — conexão OK, mantém sync ativo
            mostrarStatusConexao(true);
        }
    } catch(e) {
        // Erro de rede/timeout no carregamento. Se o login foi pelo SERVIDOR (token real),
        // a conexão está OK — mantém ONLINE (a sincronização tenta de novo ao salvar).
        if (authToken && authToken.indexOf('local_') === 0) { syncAtivo = false; mostrarStatusConexao(false); }
        else { mostrarStatusConexao(true); }
    }
}


