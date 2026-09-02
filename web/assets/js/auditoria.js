// ---- AUDITORIA GERAL (regra: TODA movimentação registrada com horário) ----
function auditar(acao, modulo, descricao){
  // Registra qualquer movimentação: criação, alteração, exclusão — com data/hora
  try{
    const agora=new Date();
    const registro={
      acao:acao,
      modulo:modulo,
      descricao:descricao,
      usuario:authUser?authUser.nome:'?',
      dataHora:agora.toLocaleDateString('pt-BR')+' '+agora.toLocaleTimeString('pt-BR')
    };
    // Guarda localmente também (visível mesmo offline)
    if(!D.auditLocal)D.auditLocal=[];
    D.auditLocal.unshift(registro);
    D.auditLocal=D.auditLocal.slice(0,500); // últimos 500 registros
    // Envia ao servidor
    if(typeof authToken!=='undefined'&&authToken){
      fetch('api.php?action=log_action&token='+authToken,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(registro)
      }).catch(()=>{});
    }
  }catch(e){}
}
// Mantém compatibilidade com chamadas antigas
function auditarExclusao(modulo, descricao){
  auditar('EXCLUSAO', modulo, descricao);
}


