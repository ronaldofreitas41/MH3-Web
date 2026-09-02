// ---- CLIENTES ----
function rdClientes(){
  const tb=document.getElementById('cli-tb');
  if(!tb) return;
  const cs=D.clientes||[];
  tb.innerHTML=cs.length?cs.map(c=>{
    const nCts=D.contratos.filter(ct=>ct.clienteId===c.id).length;
    return `<tr>
      <td><b>${c.nome}</b></td>
      <td style="font-size:11px">${c.cnpj||'-'}</td>
      <td style="font-size:11px">${c.obra||'-'}</td>
      <td><span class="badge b-bl">${nCts}</span></td>
      <td style="display:flex;gap:4px">
        <button class="btn bg btn-xs" onclick="editCliente('${c.id}')" title="Editar">✏️</button>
        <button class="btn bd btn-xs" onclick="delCliente('${c.id}')" title="Excluir">×</button>
      </td>
    </tr>`;
  }).join(''):'<tr><td colspan="5" class="empty">Nenhum cliente cadastrado. Cadastre primeiro o cliente, depois o contrato.</td></tr>';
}
function openCliente(){
  document.getElementById('cli-eid').value='';
  ['cli-nome','cli-cnpj','cli-obra','cli-cidade','cli-tel','cli-email','cli-obs'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  openM('m-cliente');
}
function saveCliente(){
  const nome=document.getElementById('cli-nome').value.trim();
  const cnpj=document.getElementById('cli-cnpj').value.trim();
  if(!nome){toast('Informe o nome do cliente','er');return;}
  if(!cnpj){toast('Informe o CNPJ','er');return;}
  const eid=document.getElementById('cli-eid').value;
  const data={
    nome,cnpj,
    obra:document.getElementById('cli-obra').value,
    cidade:document.getElementById('cli-cidade').value,
    tel:document.getElementById('cli-tel').value,
    email:document.getElementById('cli-email').value.trim(),
    obs:document.getElementById('cli-obs').value
  };
  if(eid){const i=D.clientes.findIndex(c=>c.id===eid);if(i>-1)D.clientes[i]={...D.clientes[i],...data};toast('Cliente atualizado!','ok');}
  else{data.id=uid();D.clientes.push(data);toast('Cliente cadastrado!','ok');}
  auditar(eid?'ALTERACAO':'CRIACAO','clientes',(eid?'Cliente alterado':'Cliente criado')+': '+nome);sv();closeM('m-cliente');rdClientes();
}
function editCliente(id){if(_bloqEditar('clientes'))return;
  const c=D.clientes.find(x=>x.id===id);
  if(!c)return;
  openCliente();
  document.getElementById('cli-eid').value=id;
  document.getElementById('cli-nome').value=c.nome||'';
  document.getElementById('cli-cnpj').value=c.cnpj||'';
  document.getElementById('cli-obra').value=c.obra||'';
  document.getElementById('cli-cidade').value=c.cidade||'';
  document.getElementById('cli-tel').value=c.tel||'';
  document.getElementById('cli-email').value=c.email||'';
  document.getElementById('cli-obs').value=c.obs||'';
}
function delCliente(id){
  // REGRA: somente o usuário NONINHO pode excluir clientes
  const usuarioLogado=(authUser&&authUser.nome?authUser.nome:'').toLowerCase();
  const loginLogado=(authUser&&authUser.login?authUser.login:'').toLowerCase();
  if(!usuarioLogado.includes('noninho')&&!loginLogado.includes('noninho')){
    toast('🚫 Somente o Noninho pode excluir clientes.','er');
    if(typeof auditarExclusao==='function')auditarExclusao('clientes','TENTATIVA de exclusão de cliente NEGADA para: '+(authUser?authUser.nome:'?'));
    return;
  }
  const temCt=D.contratos.some(ct=>ct.clienteId===id);
  if(temCt){toast('Cliente tem contratos vinculados. Exclua os contratos primeiro.','er');return;}
  reqSenha(()=>{
    if(!confirm('Excluir este cliente?'))return;
    const cli=D.clientes.find(c=>c.id===id);
    if(typeof auditarExclusao==='function')auditarExclusao('clientes','Cliente EXCLUÍDO: '+(cli?cli.nome:id));
    D.clientes=D.clientes.filter(c=>c.id!==id);
    sv();rdClientes();toast('Cliente excluído','ok');
  });
}


