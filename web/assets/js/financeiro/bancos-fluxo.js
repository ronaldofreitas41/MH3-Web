// ---- CONTAS BANCÁRIAS MH3 (item 2) ----
function openContaBanco(){
  document.getElementById('cb-id').value='';
  document.getElementById('cb-mtitle').textContent='🏦 Nova Conta Bancária';
  ['cb-nome','cb-banco','cb-ag','cb-conta','cb-saldo','cb-saldo-pa'].forEach(i=>document.getElementById(i).value='');
  document.getElementById('cb-tipo').value='corrente';
  document.getElementById('cb-fluxo').checked=true;
  // Conta nova: pode digitar o saldo inicial
  var _s1=document.getElementById('cb-saldo'),_s2=document.getElementById('cb-saldo-pa');
  if(_s1){_s1.readOnly=false;_s1.style.opacity='1';_s1.title='';}
  if(_s2){_s2.readOnly=false;_s2.style.opacity='1';_s2.title='';}
  openM('m-conta-banco');
}
function saveContaBanco(){
  const id=document.getElementById('cb-id').value;
  const nome=document.getElementById('cb-nome').value.trim();
  if(!nome){toast('Informe o nome da conta','er');return;}
  const data={
    nome,banco:document.getElementById('cb-banco').value.trim(),
    ag:document.getElementById('cb-ag').value.trim(),
    conta:document.getElementById('cb-conta').value.trim(),
    tipo:document.getElementById('cb-tipo').value,
    noFluxo:document.getElementById('cb-fluxo').checked
  };
  if(id){
    // EDIÇÃO: NÃO mexe no saldo aqui — o saldo só muda pelo botão "Acerto de Saldo".
    const idx=D.contasBanco.findIndex(c=>c.id===id);
    if(idx>-1)D.contasBanco[idx]={...D.contasBanco[idx],...data};
    auditar('ALTERACAO','financeiro','Conta bancária editada (saldo não alterado aqui): '+nome);
  }else{
    // CONTA NOVA: aqui sim define o saldo inicial.
    data.saldo=parseFloat(document.getElementById('cb-saldo').value)||0;
    data.saldoPA=parseFloat(document.getElementById('cb-saldo-pa').value)||0;
    data.id=uid();D.contasBanco.push(data);
    auditar('CRIACAO','financeiro','Conta bancária cadastrada: '+nome);
  }
  sv();closeM('m-conta-banco');rdContasBanco();if(typeof rdFluxo==='function')rdFluxo();
  toast('Conta bancária salva!','ok');
}
function editContaBanco(id){if(_bloqEditar('fin'))return;
  const c=D.contasBanco.find(x=>x.id===id);
  if(!c)return;
  document.getElementById('cb-id').value=id;
  document.getElementById('cb-mtitle').textContent='✏️ Editar Conta';
  document.getElementById('cb-nome').value=c.nome||'';
  document.getElementById('cb-banco').value=c.banco||'';
  document.getElementById('cb-ag').value=c.ag||'';
  document.getElementById('cb-conta').value=c.conta||'';
  document.getElementById('cb-tipo').value=c.tipo||'corrente';
  document.getElementById('cb-saldo').value=c.saldo||'';
  document.getElementById('cb-saldo-pa').value=c.saldoPA||'';
  document.getElementById('cb-fluxo').checked=c.noFluxo!==false;
  // Edição: saldo fica TRAVADO aqui — só muda pelo botão "⚖️ Acerto de Saldo"
  var _s1=document.getElementById('cb-saldo'),_s2=document.getElementById('cb-saldo-pa');
  if(_s1){_s1.readOnly=true;_s1.style.opacity='.6';_s1.title='Para mudar o saldo, use o botão Acerto de Saldo';}
  if(_s2){_s2.readOnly=true;_s2.style.opacity='.6';_s2.title='Para mudar o saldo, use o botão Acerto de Saldo';}
  openM('m-conta-banco');
}
function delContaBanco(id){
  reqSenha(()=>{
    const c=D.contasBanco.find(x=>x.id===id);
    if(!c)return;
    if(!confirm('Excluir a conta "'+c.nome+'"?'))return;
    D.contasBanco=D.contasBanco.filter(x=>x.id!==id);
    auditar('EXCLUSAO','financeiro','Conta bancária excluída: '+c.nome);
    sv();rdContasBanco();
    toast('Conta excluída','ok');
  });
}
function tipoContaLabel(t){return t==='poupanca'?'Poupança':t==='aplicacao'?'Aplicação':'Corrente';}
function rdContasBanco(){
  const el=document.getElementById('contas-banco-lista');
  if(!el)return;
  const contas=D.contasBanco||[];
  if(!contas.length){el.innerHTML='<p class="empty" style="padding:10px">Nenhuma conta cadastrada. Clique em + Conta.</p>';
    const st=document.getElementById('saldo-total-banco');if(st)st.textContent=fmt(0);return;}
  el.innerHTML='<div class="tw"><table><thead><tr><th>Conta</th><th>Banco</th><th>Ag/Conta</th><th>Tipo</th><th>Saldo</th><th>Poup./Aplic.</th><th>Fluxo</th><th></th></tr></thead><tbody>'+
    contas.map(c=>`<tr>
      <td><b>${c.nome}</b></td>
      <td style="font-size:11px">${c.banco||'-'}</td>
      <td style="font-size:11px">${c.ag||'-'} / ${c.conta||'-'}</td>
      <td><span class="badge ${c.tipo==='aplicacao'?'b-pu':c.tipo==='poupanca'?'b-cy':'b-bl'}">${tipoContaLabel(c.tipo)}</span></td>
      <td style="color:var(--gn);font-weight:600">${fmt(c.saldo)}</td>
      <td style="color:var(--bl)">${fmt(c.saldoPA)}</td>
      <td>${c.noFluxo!==false?'<span class="badge b-gn">Sim</span>':'<span class="badge b-gr">Não</span>'}</td>
      <td style="display:flex;gap:4px"><button class="btn bw btn-xs" onclick="ajustarSaldoBanco('${c.id}')" title="Acerto de saldo (motivo + senha do solicitante)">⚖️ Acerto</button><button class="btn bw btn-xs" onclick="editContaBanco('${c.id}')" title="Editar">✏️</button><button class="btn bd btn-xs" onclick="delContaBanco('${c.id}')" title="Excluir">×</button></td>
    </tr>`).join('')+'</tbody></table></div>';
  // Saldo total das contas que entram no fluxo
  const total=contas.filter(c=>c.noFluxo!==false).reduce((s,c)=>s+(c.saldo||0)+(c.saldoPA||0),0);
  const st=document.getElementById('saldo-total-banco');if(st)st.textContent=fmt(total);
}

// ---- FLUXO BANCÁRIO: pagar/receber selecionando conta e abatendo/somando saldo ----
let _opBanco=null;
function _parseValorBR(s){ if(s==null)return NaN; s=String(s).trim().replace(/\s/g,''); if(s.indexOf(',')>-1){s=s.replace(/\./g,'').replace(',','.');} return parseFloat(s); }
function abrirSelBanco(modo, id, tipo, valor, desc){
  const bancos=D.contasBanco||[];
  if(!bancos.length){ alert('Cadastre uma conta bancária primeiro (Financeiro → Fluxo de Caixa → + Conta).'); return false; }
  _opBanco={modo,id,tipo,valor,desc};
  const tit=document.getElementById('selbanco-titulo');
  const sub=document.getElementById('selbanco-sub');
  const cont=document.getElementById('selbanco-lista');
  if(tit)tit.textContent=(modo==='pagar'?'💸 Pagar ':'💰 Receber ')+fmt(valor);
  if(sub)sub.textContent=(desc||'')+' — selecione a conta bancária:';
  if(cont)cont.innerHTML=bancos.map(c=>`<button class="btn bp" style="width:100%;margin-bottom:7px;text-align:left;padding:11px 13px" onclick="confirmarOpBanco('${c.id}')">🏦 <b>${c.nome}</b>${c.banco?' ('+c.banco+')':''}<span style="float:right;color:var(--gn)">${fmt((c.saldo||0)+(c.saldoPA||0))}</span></button>`).join('');
  openM('m-sel-banco');
  return true;
}
function confirmarOpBanco(contaId){
  if(!_opBanco)return;
  const c=(D.contasBanco||[]).find(x=>x.id===contaId);
  if(!c){toast('Conta não encontrada','er');return;}
  const op=_opBanco; _opBanco=null;
  if(op.modo==='pagar'){
    c.saldo=(c.saldo||0)-op.valor;
    const item = op.tipo==='NF'? (D.nfs||[]).find(n=>n.id===op.id) : (D.despesas||[]).find(d=>d.id===op.id);
    if(item){ item.st='pago'; item.dtPag=new Date().toISOString().substring(0,10); item.contaBanco=c.nome; item.contaBancoId=c.id; }
    if(typeof auditarExclusao==='function')auditarExclusao('contasBanco','PAGAMENTO '+fmt(op.valor)+' de '+c.nome+' ('+(op.desc||'')+')');
    toast('✅ Pago e abatido de '+c.nome,'ok');
  } else {
    c.saldo=(c.saldo||0)+op.valor;
    const lista=op.tipo==='med'?D.medicoes:D.vendas;
    const x=(lista||[]).find(i=>i.id===op.id);
    if(x){ x.st=op.tipo==='med'?'paga':'pago'; x.prejuizo=false; x.fluxo='sim'; x.dtPag=new Date().toISOString().substring(0,10); x.contaBanco=c.nome; x.contaBancoId=c.id; }
    if(typeof auditarExclusao==='function')auditarExclusao('contasBanco','RECEBIMENTO '+fmt(op.valor)+' em '+c.nome+' ('+(op.desc||'')+')');
    toast('✅ Recebido e somado em '+c.nome,'ok');
  }
  closeM('m-sel-banco');
  sv();
  if(typeof rdFin==='function')rdFin();
  if(typeof rdContasReceber==='function')rdContasReceber();
  if(typeof rdFluxo==='function')rdFluxo();
  if(typeof rdContasBanco==='function')rdContasBanco();
}
function ajustarSaldoBanco(id){
  const c=(D.contasBanco||[]).find(x=>x.id===id);
  if(!c)return;
  document.getElementById('as-id').value=id;
  document.getElementById('as-conta').value=c.nome+(c.banco?' ('+c.banco+')':'');
  var _q=document.getElementById('as-qual'); if(_q)_q.value='saldo';
  document.getElementById('as-atual').value=fmt(c.saldo||0);
  document.getElementById('as-novo').value=String((c.saldo||0)).replace('.',',');
  document.getElementById('as-motivo').value='';
  document.getElementById('as-senha').value='';
  var lbl=document.getElementById('as-senha-lbl'); if(lbl)lbl.textContent='Senha de '+((authUser&&authUser.nome)||'usuário logado')+' *';
  var st=document.getElementById('as-status'); if(st)st.textContent='';
  openM('m-acerto-saldo');
}
function _acertoTrocaQual(){
  var id=document.getElementById('as-id').value;
  var c=(D.contasBanco||[]).find(function(x){return x.id===id;}); if(!c)return;
  var qual=(document.getElementById('as-qual')||{}).value||'saldo';
  var atual=(qual==='saldoPA'?(c.saldoPA||0):(c.saldo||0));
  document.getElementById('as-atual').value=fmt(atual);
  document.getElementById('as-novo').value=String(atual).replace('.',',');
}
async function _validarSenhaSolicitante(senha){
  if(!senha) return false;
  var login=(authUser&&authUser.login)||'';
  if(!login){var _lu=(D.usuarios||[]).find(function(x){return (x.nm||x.nome||'')===((authUser&&authUser.nome)||'');});if(_lu)login=(_lu.lg||_lu.login||'');}
  try{
    if(typeof syncAtivo!=='undefined' && syncAtivo && typeof authToken!=='undefined' && authToken && !String(authToken).startsWith('local_') && login){
      var r=await fetch('api.php?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:login,senha:senha})});
      var j=await r.json();
      if(j&&j.ok) return true; // servidor confirmou
      // se o servidor recusou, ainda tenta a checagem local (senha do usuário OU senha de administrador)
    }
  }catch(e){}
  var nome=(authUser&&authUser.nome)||'';
  var u=(D.usuarios||[]).find(function(x){var xl=(x.lg||x.login||'').toLowerCase(),xn=(x.nm||x.nome||'');return (login&&xl===login.toLowerCase())||(nome&&xn===nome);});
  var upw=u&&(u.pw||u.senha);
  if(upw!=null&&upw!=='' && String(upw)===String(senha)) return true;
  if(D.config&&D.config.admPw && String(D.config.admPw)===String(senha)) return true;
  return false;
}
async function confirmarAcertoSaldo(){
  var id=document.getElementById('as-id').value;
  var c=(D.contasBanco||[]).find(x=>x.id===id);
  var st=document.getElementById('as-status'); var setSt=function(m){if(st){st.style.color='var(--rd)';st.textContent=m;}};
  if(!c){setSt('Conta não encontrada.');return;}
  var qual=(document.getElementById('as-qual')||{}).value||'saldo';
  var qualLbl=(qual==='saldoPA')?'Saldo poupança/aplicação':'Saldo corrente';
  var v=_parseValorBR(document.getElementById('as-novo').value);
  if(isNaN(v)){setSt('Informe um novo saldo válido.');return;}
  var motivo=(document.getElementById('as-motivo').value||'').trim();
  if(!motivo){setSt('O motivo é obrigatório.');return;}
  var senha=document.getElementById('as-senha').value;
  if(!senha){setSt('Digite sua senha.');return;}
  if(st){st.style.color='var(--mt)';st.textContent='Validando senha...';}
  var ok=await _validarSenhaSolicitante(senha);
  if(!ok){setSt('❌ Senha incorreta. Acerto cancelado.');return;}
  var antigo=(qual==='saldoPA'?(c.saldoPA||0):(c.saldo||0));
  if(qual==='saldoPA') c.saldoPA=v; else c.saldo=v;
  var quem=(authUser&&authUser.nome)||'?'; var login=(authUser&&authUser.login)||'';
  c.ajustesSaldo=c.ajustesSaldo||[];
  c.ajustesSaldo.push({data:new Date().toISOString(), quem:quem, login:login, qual:qual, de:antigo, para:v, motivo:motivo});
  if(typeof auditarExclusao==='function')auditarExclusao('contasBanco','ACERTO DE SALDO ('+qualLbl+') — '+c.nome+': '+fmt(antigo)+' → '+fmt(v)+' | Solicitante: '+quem+(login?' ('+login+')':'')+' | Motivo: '+motivo);
  sv(); if(typeof rdContasBanco==='function')rdContasBanco(); if(typeof rdFluxo==='function')rdFluxo(); if(typeof carregarBancosCfg==='function')carregarBancosCfg();
  closeM('m-acerto-saldo');
  toast(qualLbl+' de '+c.nome+' ajustado para '+fmt(v),'ok');
}

function saldoBancarioFluxo(){
  return (D.contasBanco||[]).filter(c=>c.noFluxo!==false).reduce((s,c)=>s+(c.saldo||0)+(c.saldoPA||0),0);
}

