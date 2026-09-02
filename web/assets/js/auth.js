// ============ USUÁRIO ============
function setPP(){const pf=document.getElementById('usr-pf').value;const perms={admin:['dash','frota','manut','cts','meds','vend','estq','desp','fin','rel','adm'],operacional:['dash','frota','manut'],motorista:['dash'],financeiro:['dash','meds','vend','desp','fin','rel']};const all=['dash','frota','manut','cts','meds','vend','estq','desp','fin','rel','adm'];all.forEach(p=>{const el=document.getElementById('pr-'+p);if(el){if(pf==='admin'||(perms[pf]&&perms[pf].includes(p)))el.classList.add('on');else el.classList.remove('on');}});}

function openNovoUsr(){
  document.getElementById('usr-eid').value='';
  document.getElementById('usr-nm').value='';
  document.getElementById('usr-lg').value='';
  document.getElementById('usr-pw').value='';
  document.getElementById('usr-pw').placeholder='Mínimo 8 caracteres, com letra e número';
  const pf=document.getElementById('usr-pf'); if(pf)pf.value='operacional';
  // Limpa TODAS as permissões (usuário novo começa sem nada marcado)
  const modCrud=['frota','manut','cts','meds','vend','estq','desp','fin','pneus','resultado','clientes','mob','func','prej','sm','sist','cpagar','creceber','prop','tratativas'];
  const allPerms=['dash','whatsapp','adm','custo','preco','desc','estq-edit','venda-eq','pneu-edit','rel','rel-fin','rel-os','rel-frota','rel-resultado','rel-estq','rel-cpagar','rel-creceber','rel-fin-imp','rel-os-imp','rel-frota-imp','rel-resultado-imp','rel-estq-imp','rel-cpagar-imp','rel-creceber-imp','contas-dia','aniversarios','confirma-ajuda','motivacao','kpi-fin','contas-banco','backup-manual','exportar','ajuda-custo','ver-auditoria','ver-resultado-placa','gerenciar-usuarios','enviar-email','seguro','doc-veiculo'];
  modCrud.forEach(m=>{allPerms.push(m);allPerms.push(m+'-criar');allPerms.push(m+'-editar');allPerms.push(m+'-excluir');});
  allPerms.forEach(p=>{const el=document.getElementById('pr-'+p);if(!el)return;if(el.type==='checkbox')el.checked=false;else el.classList.remove('on');});
  const t=document.querySelector('#m-usr .mt2'); if(t)t.textContent='👤 Novo Usuário';
  openM('m-usr');
}

async function saveUsr(){
  const nm=document.getElementById('usr-nm').value.trim();
  const lg=document.getElementById('usr-lg').value.trim().toLowerCase();
  const pw=document.getElementById('usr-pw').value;
  const pf=document.getElementById('usr-pf').value;
  const eid=document.getElementById('usr-eid').value;
  if(!nm){toast('Informe o nome do usuário','er');return;}
  if(!lg){toast('Informe o login','er');return;}
  if(!eid&&!pw){toast('Informe a senha para novo usuário','er');return;}
  // Check duplicate login
  const dupLogin=D.usuarios.find(u=>u.lg===lg&&u.id!==eid);
  if(dupLogin){toast('Este login já está em uso','er');return;}
  const perms={};
  // Lista completa: módulos base + ações CRUD + permissões específicas + relatórios
  const modCrud=['frota','manut','cts','meds','vend','estq','desp','fin','pneus','resultado','clientes','mob','func','prej','sm','sist','cpagar','creceber','prop','tratativas'];
  const allPerms=['dash','whatsapp','adm','custo','preco','desc','estq-edit','venda-eq','pneu-edit','rel',
    'rel-fin','rel-os','rel-frota','rel-resultado','rel-estq','rel-cpagar','rel-creceber',
    'rel-fin-imp','rel-os-imp','rel-frota-imp','rel-resultado-imp','rel-estq-imp','rel-cpagar-imp','rel-creceber-imp',
    'contas-dia','aniversarios','confirma-ajuda','motivacao','kpi-fin','contas-banco','backup-manual','exportar','ajuda-custo','ver-auditoria','ver-resultado-placa','gerenciar-usuarios','enviar-email','seguro','doc-veiculo'];
  // Add CRUD variants
  modCrud.forEach(m=>{
    allPerms.push(m);
    allPerms.push(m+'-criar');
    allPerms.push(m+'-editar');
    allPerms.push(m+'-excluir');
  });
  allPerms.forEach(p=>{
    const el=document.getElementById('pr-'+p);
    if(!el){perms[p]=false;return;}
    // Checkbox usa .checked, toggle usa classe .on
    if(el.type==='checkbox') perms[p]=el.checked;
    else perms[p]=el.classList.contains('on');
  });
  // Está conectado (online) como admin no servidor?
  const online = syncAtivo && authToken && !String(authToken).startsWith('local_');

  // 1) Sincroniza no SERVIDOR (tabela de login mh3_usuarios) — é isso que faz logar em qualquer PC
  if(online){
    const okServer = await syncUsuarioServidor({nm,lg,pw,pf,perms});
    if(!okServer) return; // servidor recusou (ex: senha fraca) — mensagem já mostrada, não salva
  }

  // 2) Salva localmente (para exibir na tela e funcionar offline)
  if(eid){
    const idx=D.usuarios.findIndex(u=>u.id===eid);
    if(idx>-1){
      D.usuarios[idx]={...D.usuarios[idx],nm,lg,pf,perms};
      if(pw) D.usuarios[idx].pw=pw;
    }
  }else{
    D.usuarios.push({id:uid(),nm,lg,pw,pf,perms});
  }
  document.getElementById('usr-eid').value='';
  document.getElementById('usr-pw').placeholder='••••••••';
  document.querySelector('#m-usr .mt2').textContent='👤 Usuário';
  D.config.usuarios = D.usuarios; // espelho local
  try{normalizarUsuarios();}catch(e){}
  sv();closeM('m-usr');rdUsr();

  if(online) toast(eid?'Usuário atualizado e sincronizado! Já entra em qualquer PC.':'Usuário criado e sincronizado! Já entra em qualquer PC.','ok');
  else toast('Salvo neste PC. Entre como admin conectado (online) para validar em outros PCs.','er');
}

// Cadastra/atualiza o usuário no servidor (tabela mh3_usuarios), via usuario_salvar.
// Procura pelo login para reaproveitar o mesmo ID (cria ou atualiza corretamente).
async function syncUsuarioServidor(u){
  try{
    let serverId='';
    try{
      const lr=await fetch('api.php?action=usuarios_listar&token='+encodeURIComponent(authToken),{headers:{'X-Token':authToken}});
      const lj=await lr.json();
      if(lj && lj.ok && lj.dados){
        const ex=lj.dados.find(x=>(x.login||'').toLowerCase()===u.lg.toLowerCase());
        if(ex) serverId=ex.id;
      }
    }catch(e){}
    const body={id:serverId, nome:u.nm, login:u.lg, perfil:u.pf, permissoes:u.perms};
    if(u.pw) body.senha=u.pw; // só envia senha se foi informada (em edição pode ficar vazia)
    const sr=await fetch('api.php?action=usuario_salvar&token='+encodeURIComponent(authToken),{
      method:'POST', headers:{'Content-Type':'application/json','X-Token':authToken},
      body: JSON.stringify(body)
    });
    const sj=await sr.json();
    if(!sj || !sj.ok){ toast((sj&&sj.msg)||'Erro ao salvar usuário no servidor.','er'); return false; }
    return true;
  }catch(e){ toast('Sem conexão com o servidor para salvar o usuário. Tente novamente.','er'); return false; }
}
function delUsr(id){reqSenha(()=>{if(!confirm('Excluir?'))return;
  const u=D.usuarios.find(x=>x.id===id);
  D.usuarios=D.usuarios.filter(x=>x.id!==id);
  D.config.usuarios=D.usuarios;
  sv();rdUsr();
  // Desativa no servidor (para não logar mais em nenhum PC)
  if(u && syncAtivo && authToken && !String(authToken).startsWith('local_')){
    (async()=>{try{
      const lr=await fetch('api.php?action=usuarios_listar&token='+encodeURIComponent(authToken),{headers:{'X-Token':authToken}});
      const lj=await lr.json();
      if(lj&&lj.ok&&lj.dados){const ex=lj.dados.find(x=>(x.login||'').toLowerCase()===(u.lg||'').toLowerCase());
        if(ex)await fetch('api.php?action=usuario_deletar&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:JSON.stringify({id:ex.id})});}
    }catch(e){}})();
  }
});}

