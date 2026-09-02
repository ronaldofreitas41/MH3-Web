// ============ MEDIÇÃO MANUAL (autorização por placa + geração pelo Financeiro) ============
function _ehFinanceiro(){
  if(typeof ehAdminAtual==='function' && ehAdminAtual()) return true;
  var pf=(authUser&&(authUser.perfil||authUser.pf))||'';
  if(pf==='financeiro') return true;
  var nome=(authUser&&authUser.nome)||'';
  var u=(D.usuarios||[]).find(function(x){return (x.nm===nome)||(x.nome===nome);});
  return !!(u && ((u.pf==='financeiro')||(u.perfil==='financeiro')));
}
function _popClientesMM(selId,val){
  var sel=document.getElementById(selId); if(!sel)return;
  sel.innerHTML='<option value="">Selecionar cliente cadastrado...</option>';
  (D.clientes||[]).forEach(function(c){ var nm=c.nome||c.nm||c.razao||c.fantasia||'?'; sel.innerHTML+='<option value="'+c.id+'">'+nm+'</option>'; });
  if(val)sel.value=val;
}
function openMedManAut(id){
  if(typeof ehAdminAtual==='function' && ehAdminAtual()){ _abrirMedManAut(id); }
  else { reqSenha(function(){ _abrirMedManAut(id); }); }
}
function _abrirMedManAut(id){
  var e=D.equips.find(function(x){return x.id===id;}); if(!e)return;
  if(e.st==='vendido'){ toast('Veículo vendido não pode ser autorizado.','er'); return; }
  document.getElementById('mm-aut-eid').value=id;
  document.getElementById('mm-aut-info').innerHTML='<b>'+e.placa+'</b> — '+(e.mk||'')+' '+(e.mo||'');
  _popClientesMM('mm-aut-cli',(e.medManual&&e.medManual.clienteId)||'');
  document.getElementById('mm-aut-venc').value=(e.medManual&&e.medManual.venc)||'';
  document.getElementById('mm-aut-obs').value=(e.medManual&&e.medManual.obs)||'';
  openM('m-mm-aut');
}
function salvarMedManAut(){
  var id=document.getElementById('mm-aut-eid').value;
  var e=D.equips.find(function(x){return x.id===id;}); if(!e)return;
  var cliId=document.getElementById('mm-aut-cli').value;
  var venc=document.getElementById('mm-aut-venc').value;
  if(!cliId){ toast('Selecione o cliente','er'); return; }
  if(!venc){ toast('Informe o vencimento/prazo','er'); return; }
  var c=(D.clientes||[]).find(function(x){return x.id===cliId;});
  var nm=(c&&(c.nome||c.nm||c.razao))||'';
  e.medManual={venc:venc,clienteId:cliId,cliente:nm,obs:document.getElementById('mm-aut-obs').value,por:(authUser&&authUser.nome)||'',em:(typeof today==='function'?today():new Date().toISOString().slice(0,10))};
  if(e.st==='disponivel'||e.st==='alocado'||!e.st){ e.st='alocado'; }
  if(typeof auditar==='function')auditar('CRIACAO','frota','Autorizou Medição Manual: '+e.placa+' (cliente '+nm+', venc '+venc+')');
  sv(); closeM('m-mm-aut'); if(typeof rdFrota==='function')rdFrota(); toast('Medição manual autorizada. Placa → Alocado.','ok');
}
function finalizarMedMan(id){
  reqSenha(function(){
    var e=D.equips.find(function(x){return x.id===id;}); if(!e)return;
    if(!e.medManual){ toast('Esta placa não tem autorização ativa.','er'); return; }
    if(!confirm('Finalizar a autorização de medição manual de '+e.placa+'?\nA placa volta para Disponível (se não houver contrato ativo).'))return;
    var nm=(e.medManual&&e.medManual.cliente)||'';
    delete e.medManual;
    var temCt=(D.contratos||[]).find(function(c){return c.eqId===id && c.status==='ativo';});
    if(!temCt && e.st==='alocado'){ e.st='disponivel'; }
    if(typeof auditar==='function')auditar('ALTERACAO','frota','Finalizou Medição Manual: '+e.placa+' (cliente '+nm+')');
    sv(); if(typeof rdFrota==='function')rdFrota(); toast('Autorização finalizada.','ok');
  });
}
function openMedManGer(id){
  var e=D.equips.find(function(x){return x.id===id;}); if(!e)return;
  if(!e.medManual){ toast('Placa não autorizada para medição manual. Peça ao administrador.','er'); return; }
  if(!_ehFinanceiro()){ toast('Apenas o Financeiro (ou admin) pode gerar medição manual.','er'); return; }
  document.getElementById('mm-ger-eid').value=id;
  document.getElementById('mm-ger-info').innerHTML='<b>'+e.placa+'</b> — '+(e.mk||'')+' '+(e.mo||'')+'<br>Cliente: <b>'+(e.medManual.cliente||'-')+'</b> · Autorizado até '+(e.medManual.venc||'-');
  document.getElementById('mm-ger-ms').value='';
  document.getElementById('mm-ger-vc').value=e.medManual.venc||'';
  document.getElementById('mm-ger-vl').value='';
  document.getElementById('mm-ger-dc').value='';
  document.getElementById('mm-ger-obs').value='';
  openM('m-mm-ger');
}
function salvarMedManGer(){
  var id=document.getElementById('mm-ger-eid').value;
  var e=D.equips.find(function(x){return x.id===id;}); if(!e)return;
  if(!e.medManual){ toast('Autorização não encontrada.','er'); return; }
  if(!_ehFinanceiro()){ toast('Apenas o Financeiro pode gerar.','er'); return; }
  var vl=parseFloat(document.getElementById('mm-ger-vl').value)||0;
  var dc=parseFloat(document.getElementById('mm-ger-dc').value)||0;
  var ms=document.getElementById('mm-ger-ms').value;
  var vc=document.getElementById('mm-ger-vc').value;
  if(!ms){ toast('Informe o mês/referência','er'); return; }
  if(!vc){ toast('Informe o vencimento','er'); return; }
  if(vl<=0){ toast('Informe o valor da medição','er'); return; }
  D.medicoes.push({id:uid(),ctId:'',manual:true,numMed:((D.medicoes||[]).filter(function(x){return x.manual&&x.placa===e.placa;}).length+1),cl:(e.medManual.cliente||''),clienteId:(e.medManual.clienteId||''),placa:(e.placa||''),ms:ms,de:'',at:'',hr:'',he:0,vhe:0,vl:vl,dc:dc,total:vl-dc,vc:vc,st:'pendente',obs:document.getElementById('mm-ger-obs').value,fluxo:'sim'});
  if(typeof auditar==='function')auditar('CRIACAO','medicoes','Medição MANUAL gerada: '+(e.medManual.cliente||'')+' ('+e.placa+') '+fmt(vl-dc));
  sv(); if(window.emailAutoSe)window.emailAutoSe('medicao',D.medicoes[D.medicoes.length-1]);
  closeM('m-mm-ger'); if(typeof rdFrota==='function')rdFrota(); if(typeof updPendCnt==='function')updPendCnt(); if(typeof rp==='function')rp(cur);
  toast('Medição manual gerada! Entrou no Financeiro.','ok');
}
function _btnsMedMan(e){
  var admin=(typeof ehAdminAtual==='function' && ehAdminAtual());
  var aut=!!e.medManual;
  var out='';
  if(admin){
    out+=' <button class="btn '+(aut?'bp':'bw')+' btn-xs" onclick="openMedManAut(\''+e.id+'\')" title="'+(aut?'Medição manual AUTORIZADA — clique para editar':'Autorizar medição manual')+'">📋</button>';
    if(aut) out+=' <button class="btn bg btn-xs" onclick="finalizarMedMan(\''+e.id+'\')" title="Finalizar autorização (volta a Disponível)">✔</button>';
  }
  return out;
}

