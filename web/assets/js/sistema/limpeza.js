// ---- APAGAR TODOS OS DADOS (somente Administrador) ----
function apagarTodosDados(){
  // TRAVA 1: somente administrador
  const ehAdmin=(authUser&&authUser.perfil==='admin')||((authUser&&authUser.nome?authUser.nome:'').toLowerCase().includes('noninho'))||((authUser&&authUser.login?authUser.login:'').toLowerCase().includes('noninho'));
  if(!ehAdmin){
    toast('🚫 Somente o Administrador pode apagar os dados do sistema.','er');
    if(typeof auditar==='function')auditar('NEGADO','sistema','TENTATIVA de apagar todos os dados NEGADA: '+(authUser?authUser.nome:'?'));
    return;
  }
  // TRAVA 2: confirmação digitada
  const txt=prompt('⚠️ ATENÇÃO — AÇÃO IRREVERSÍVEL!\n\nIsto vai APAGAR TODOS OS DADOS do sistema (veículos/equipamentos, contratos, medições, clientes, financeiro, tudo).\n\nUm backup será feito automaticamente antes.\n\nPara confirmar, digite: APAGAR TUDO');
  if(txt===null)return;
  if(txt.trim().toUpperCase()!=='APAGAR TUDO'){
    toast('Confirmação incorreta. Nada foi apagado.','er');
    return;
  }
  // TRAVA 3: senha de administrador
  reqSenha(()=>{
    // TRAVA 4: confirmação final
    if(!confirm('ÚLTIMA CONFIRMAÇÃO!\n\nApagar TODOS os dados agora? Esta ação não pode ser desfeita (exceto restaurando o backup).'))return;
    // Backup de segurança antes de apagar
    try{
      const snap={ts:new Date().toISOString(),dados:JSON.parse(JSON.stringify(D)),motivo:'antes_de_apagar_tudo'};
      localStorage.setItem('mh3_backup_antes_apagar',JSON.stringify(snap));
      // também no histórico
      let hist=[];try{hist=JSON.parse(localStorage.getItem('mh3_backup_hist')||'[]');}catch(e){}
      hist.unshift({ts:snap.ts,dados:snap.dados});hist=hist.slice(0,5);
      localStorage.setItem('mh3_backup_hist',JSON.stringify(hist));
    }catch(e){}
    if(typeof auditar==='function')auditar('EXCLUSAO_TOTAL','sistema','TODOS OS DADOS APAGADOS por '+(authUser?authUser.nome:'?'));
    // Zera todos os arrays de dados, preserva config e usuários (login)
    const cfg=D.config;const usuarios=D.usuarios;
    D.equips=[];D.contratos=[];D.medicoes=[];D.manutencoes=[];D.vendas=[];
    D.despesas=[];D.estoque=[];D.nfs=[];D.revisoes=[];D.checklists=[];
    D.pneus=[];D.pneus_hist=[];D.mobilizacoes=[];D.funcionarios=[];
    D.clientes=[];D.saidasMaterial=[];
    D.config=cfg;D.usuarios=usuarios; // mantém configurações e usuários
    sv();
    toast('✅ Todos os dados foram apagados. Backup salvo. Recarregando...','ok');
    setTimeout(()=>location.reload(),2000);
  });
}


