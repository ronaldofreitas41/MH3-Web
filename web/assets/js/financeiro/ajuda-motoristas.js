// ---- AJUDA MOTORISTAS (ajuda de custo → Contas a Pagar) ----
function toggleTipoContaAM(){
  const t=document.getElementById('am-tipo-conta').value;
  const box=document.getElementById('am-pix-box');
  if(box)box.style.display=t==='pix'?'':'none';
}
function dadosBancariosTexto(a){
  if(a.tipoConta==='pix') return 'PIX: '+(a.pix||'-');
  const tipo=a.tipoConta==='poupanca'?'Poupança':'Corrente';
  return 'Ag '+(a.ag||'-')+' / Conta '+(a.conta||'-')+' ('+tipo+')';
}
function rdAjudaMotorista(){
  const dtEl=document.getElementById('am-data');
  if(dtEl&&!dtEl.value)dtEl.value=new Date().toISOString().substring(0,10);
  // Popula veículos/equipamentos
  const selP=document.getElementById('am-placa');
  if(selP){
    const atual=selP.value;
    selP.innerHTML='<option value="">Sem vínculo (despesa geral)</option>';
    D.equips.forEach(e=>{const pl=e.pl||e.placa;if(pl)selP.innerHTML+=`<option value="${pl}">${pl} — ${(e.mk||'')+' '+(e.mo||'')}</option>`;});
    if(atual)selP.value=atual;
  }
  const selC=document.getElementById('am-confirma');
  if(selC){
    const at=selC.value;
    selC.innerHTML='<option value="">Selecionar usuário...</option>';
    (D.usuarios||[]).forEach(u=>{var n=u.nm||u.nome||u.lg||u.login||'?';var pf=u.pf||u.perfil||'-';selC.innerHTML+=`<option value="${n}">${n} (${pf})</option>`;});
    if(at)selC.value=at;
  }
  const tb=document.getElementById('am-tb');
  if(!tb)return;
  const lista=(D.ajudasMotorista||[]).slice().sort((a,b)=>(b.data||'').localeCompare(a.data||''));
  tb.innerHTML=lista.length?lista.map(a=>`<tr>
    <td style="font-size:11px">${fmtData(a.data)}</td>
    <td><b>${a.empresa||'-'}</b></td>
    <td>${a.motorista||'-'}</td>
    <td style="font-size:11px">${a.telefone||'-'}</td>
    <td style="color:var(--red);font-weight:600">${fmt(a.valor)}${a.placa?'<br><span class="badge b-bl" style="font-size:9px">'+a.placa+'</span>':''}</td>
    <td style="font-size:10px">${dadosBancariosTexto(a)}${a.obs?'<br><span style="color:var(--mt)">'+a.obs+'</span>':''}</td>
    <td><button class="btn bd btn-xs" onclick="delAjudaMotorista('${a.id}')" title="Excluir ajuda">×</button></td>
  </tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma ajuda lançada</td></tr>';
}
function addAjudaMotorista(){
  const empresa=document.getElementById('am-empresa').value.trim();
  const motorista=document.getElementById('am-motorista').value.trim();
  const telefone=document.getElementById('am-telefone').value.trim();
  const valor=parseFloat(document.getElementById('am-valor').value)||0;
  const data=document.getElementById('am-data').value;
  const ag=document.getElementById('am-ag').value.trim();
  const conta=document.getElementById('am-conta').value.trim();
  const tipoConta=document.getElementById('am-tipo-conta').value;
  const pix=document.getElementById('am-pix').value.trim();
  const obs=document.getElementById('am-obs').value.trim();
  const placa=document.getElementById('am-placa')?document.getElementById('am-placa').value:'';
  const recorrente=document.getElementById('am-recorrente')?document.getElementById('am-recorrente').checked:false;
  const confirmaUser=document.getElementById('am-confirma')?document.getElementById('am-confirma').value:'';
  if(!empresa){toast('Informe a empresa','er');return;}
  if(!motorista){toast('Informe o motorista','er');return;}
  if(!valor||valor<=0){toast('Informe o valor','er');return;}
  if(!data){toast('Informe a data','er');return;}
  if(!placa){toast('Selecione o veículo/equipamento (obrigatório para justificar a saída)','er');return;}
  if(recorrente&&!confirmaUser){toast('Escolha qual usuário confirma a recorrência mensal','er');return;}
  const id=uid();
  const ajuda={id,empresa,motorista,telefone,valor,data,ag,conta,tipoConta,pix,obs,placa,recorrente,confirmaUser,mesesTratados:[data.substring(0,7)]};
  D.ajudasMotorista.push(ajuda);
  // Lança automaticamente em Contas a Pagar como Ajuda de Custo
  const bancario=dadosBancariosTexto(ajuda);
  const despId=uid();
  D.despesas.push({
    id:despId,
    desc:'AJUDA DE CUSTO — '+empresa+' — '+motorista,
    cat:'Ajuda de Custo',
    vl:valor,
    dt:data,
    vc:data,
    st:'pendente',
    fluxo:'sim',
    cp:'sim',
    forn:empresa,
    placa:placa||'',
    ob:bancario+(obs?' | Obs: '+obs:'')+(telefone?' | Tel: '+telefone:''),
    origemAjuda:id
  });
  ajuda.despId=despId; // vínculo para exclusão
  auditar('CRIACAO','ajuda_motorista','Ajuda de custo: '+motorista+' ('+empresa+') '+fmt(valor)+' → Contas a Pagar');
  // Limpa o formulário
  ['am-empresa','am-motorista','am-telefone','am-valor','am-ag','am-conta','am-pix','am-obs','am-placa','am-confirma'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});const rc=document.getElementById('am-recorrente');if(rc)rc.checked=false;
  document.getElementById('am-tipo-conta').value='corrente';toggleTipoContaAM();
  sv();rdAjudaMotorista();
  toast('Ajuda de custo lançada! Entrou em Contas a Pagar.','ok');
}
function delAjudaMotorista(id){
  reqSenha(()=>{
    const a=(D.ajudasMotorista||[]).find(x=>x.id===id);
    if(!a)return;
    if(!confirm('Excluir esta ajuda de custo? O lançamento em Contas a Pagar também será removido.'))return;
    D.ajudasMotorista=D.ajudasMotorista.filter(x=>x.id!==id);
    // Remove a despesa vinculada (se ainda pendente)
    if(a.despId)D.despesas=D.despesas.filter(d=>d.id!==a.despId);
    else D.despesas=D.despesas.filter(d=>d.origemAjuda!==id);
    auditar('EXCLUSAO','ajuda_motorista','Ajuda excluída: '+a.motorista+' ('+a.empresa+')');
    sv();rdAjudaMotorista();
    toast('Ajuda de custo excluída','ok');
  });
}








