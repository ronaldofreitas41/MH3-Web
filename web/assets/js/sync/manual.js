// ---- BOTÃO: ATUALIZAR / RECARREGAR DADOS DO SERVIDOR (manual) ----
window.recarregarDados = async function(){
  if(!authToken){ toast('Faça login primeiro.','er'); return; }
  if(String(authToken).indexOf('local_')===0){ toast('Você entrou em modo LOCAL (offline). Saia e entre de novo com internet para puxar os dados do servidor.','er'); mostrarStatusConexao(false); return; }
  toast('🔄 Buscando dados do servidor...');
  try{
    const controller=new AbortController();
    setTimeout(()=>controller.abort(),45000);
    const res=await fetch('api.php?action=buscar_tudo&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:'{}',signal:controller.signal});
    const r=await res.json();
    if(r.ok && r.dados){
      ['equips','contratos','medicoes','manutencoes','vendas','despesas','estoque','nfs','revisoes','checklists','usuarios','funcionarios','clientes','pneus','mobilizacoes','saidasMaterial','ajudasMotorista','contasBanco','investimentos','tratativas','pneus_pend','seguros'].forEach(function(mod){ if(r.dados[mod]) D[mod]=r.dados[mod]; }); try{_syncMergeExtra(r.dados);}catch(e){} try{_capturarSids();}catch(e){}
      try{normalizarUsuarios();}catch(e){}
      try{
        const cf=await fetch('api.php?action=buscar_config&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:'{}'});
        const cfg=await cf.json();
        if(cfg.ok && cfg.config) D.config=Object.assign({},D.config,cfg.config);
        if(D.config && D.config.usuarios && D.config.usuarios.length) D.usuarios=D.config.usuarios;
      }catch(e){}
      try{ localStorage.setItem('mh3v5', JSON.stringify(D)); }catch(e){}
      try{ localStorage.setItem('mh3_ultima_sync', String(Date.now())); }catch(e){}
      mostrarStatusConexao(true);
      rp(cur);
      toast('✅ Dados atualizados do servidor!','ok');
    } else if(r.msg==='sessao' || res.status===401){
      toast('Sua sessão expirou. Saia e entre novamente.','er');
      mostrarStatusConexao(false);
    } else {
      toast('O servidor respondeu mas não enviou os dados. Tente de novo em instantes.','er');
    }
  }catch(e){
    toast('Não consegui buscar os dados: '+(e.message||e.name)+'. Confira a internet e tente de novo.','er');
  }
};

function _syncMergeExtra(dados){if(!dados)return;['propostas','pneus_hist'].forEach(function(mod){var srv=dados[mod];if(srv&&srv.length>0){D[mod]=srv;}else if(srv&&(!D[mod]||D[mod].length===0)){D[mod]=srv;}});}
// Memoriza os IDs que vieram do servidor, por módulo. Serve para o salvamento
// saber o que foi REALMENTE excluído pelo usuário (e não apagar o resto).
function _capturarSids(){
  try{
    window._sidsServer = window._sidsServer || {};
    window._modJson = window._modJson || {};
    ['equips','contratos','medicoes','manutencoes','vendas','despesas','estoque','nfs','revisoes','checklists','usuarios','funcionarios','clientes','pneus','mobilizacoes','saidasMaterial','ajudasMotorista','contasBanco','investimentos','tratativas','pneus_pend','seguros','propostas','pneus_hist'].forEach(function(m){
      window._sidsServer[m] = (D[m]||[]).map(function(r){return r&&r.id;}).filter(function(x){return x!==undefined&&x!==null&&x!=='';});
      try{ window._modJson[m] = JSON.stringify(D[m]||[]); }catch(e){}
    });
  }catch(e){}
}
async function syncSalvar(modulo, lista, excluir) {
    if (!syncAtivo) return;
    async function _tentar(){
        const _r = await fetch('api.php?action=salvar&token=' + encodeURIComponent(authToken), {
            method:'POST', headers:{'Content-Type':'application/json', 'X-Token': authToken},
            body: JSON.stringify({modulo, dados:lista, excluir: excluir||[]})
        });
        let _ok = !!(_r && _r.ok);
        if (_ok) { try { const _j = await _r.clone().json(); if (_j && _j.ok === false) _ok = false; } catch(_e){} }
        return _ok;
    }
    var ok=false;
    try{ ok = await _tentar(); }catch(e){ ok=false; }
    if(!ok){ // tenta de novo uma vez (evita falso alarme em rede instável / vários usuários)
        await new Promise(function(r){setTimeout(r,800);});
        try{ ok = await _tentar(); }catch(e){ ok=false; }
    }
    if(ok){ window._falhasServidor = 0; }
    else {
        window._falhasServidor = (window._falhasServidor||0) + 1;
        _logSyncErro('salvar '+modulo, 'não confirmou a gravação');
        if(window._falhasServidor >= 3) _avisarFalhaSalvar('servidor', {modulo:modulo}); // só avisa em falha persistente
    }
}



function mostrarStatusConexao(online) {
    let el = document.getElementById('conn-status');
    if (!el) {
        el = document.createElement('div');
        el.id = 'conn-status';
        el.style.cssText = 'position:fixed;bottom:16px;left:16px;font-size:10px;padding:4px 10px;border-radius:20px;z-index:1000;font-family:\'Barlow\',sans-serif;font-weight:600;';
        document.body.appendChild(el);
    }
    // Selo destacado ao lado do nome do usuário
    const badge = document.getElementById('sb-online');
    if (badge) {
        if (online) {
            badge.textContent = '● ONLINE';
            badge.style.background='rgba(34,197,94,.18)'; badge.style.color='#16a34a'; badge.style.border='1px solid rgba(34,197,94,.4)';
        } else {
            badge.textContent = '● OFFLINE';
            badge.style.background='rgba(245,158,11,.18)'; badge.style.color='#d97706'; badge.style.border='1px solid rgba(245,158,11,.35)';
        }
    }
    if (online) {
        el.style.cssText += 'background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);color:#22c55e;';
        el.textContent = '● Online — MySQL';
    } else {
        el.style.cssText += 'background:rgba(245,158,11,.15);border:1px solid rgba(245,158,11,.3);color:#f59e0b;';
        el.textContent = '● Offline — Local';
    }
}

// Verificar alertas a cada 30 minutos
setInterval(() => { if(syncAtivo) apiCall('verificar_alertas'); }, 30*60*1000);
// Cobrança automática: verifica a cada 30 min e ~6s após carregar
setInterval(() => { if(syncAtivo && window.processarCobrancasAgendadas) window.processarCobrancasAgendadas(true); }, 30*60*1000);
setTimeout(() => { if(syncAtivo && window.processarCobrancasAgendadas) window.processarCobrancasAgendadas(true); }, 6000);


