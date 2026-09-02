// ---- MÓDULO PREJUÍZOS (atrasados, com opção de retorno) ----
function totalPrejuizos(){
  const meds=D.medicoes.filter(m=>m.st==='atrasado').reduce((s,m)=>s+(m.total||0),0);
  const vends=D.vendas.filter(v=>v.st==='atrasado').reduce((s,v)=>s+(v.total||0),0);
  return meds+vends;
}

function rdPrejuizos(){
  const tb=document.getElementById('prej-tb');
  if(!tb) return;
  const items=[...D.medicoes.filter(m=>m.st==='atrasado').map(m=>({...m,origem:'Medição',cli:m.cl,tipo:'med'})),
               ...D.vendas.filter(v=>v.st==='atrasado').map(v=>({...v,origem:'Venda',cli:v.cli,tipo:'venda'}))]
    .sort((a,b)=>new Date(a.vc||'9999')-new Date(b.vc||'9999'));
  tb.innerHTML=items.length?items.map(x=>`<tr>
    <td><b>${x.cli||'-'}</b>${badgeAntigo(x)}</td>
    <td><span class="badge b-rd">${x.origem}${x.numMed?' Nº'+String(x.numMed).padStart(3,'0'):''}</span></td>
    <td style="color:var(--red);font-weight:700">${fmt(x.total)}</td>
    <td style="font-size:11px">${fmtData(x.vc)}</td>
    <td style="font-size:11px">${x.placa||'-'}</td>
    <td style="display:flex;gap:4px">
      <button class="btn bs btn-xs" onclick="retornarPrejuizo('${x.id}','${x.tipo}')" title="Cliente regularizou: retorna ao Contas a Receber e Fluxo">↩️ Retornar</button>
      <button class="btn bg btn-xs" onclick="retornarPrejuizoPago('${x.id}','${x.tipo}')" title="Cliente pagou: marca como recebido">✅ Recebido</button>
    </td>
  </tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhum prejuízo registrado 🎉</td></tr>';
  const el=document.getElementById('prej-total');
  if(el) el.textContent=fmt(totalPrejuizos());
}

function retornarPrejuizo(id, tipo){
  // RETORNO: sai do prejuízo, volta para Pendente no Contas a Receber + Fluxo
  const lista=tipo==='med'?D.medicoes:D.vendas;
  const x=lista.find(i=>i.id===id);
  if(!x){toast('Registro não encontrado','er');return;}
  const nd=prompt('Nova data de vencimento (AAAA-MM-DD)\nDeixe vazio para manter '+(x.vc||'sem data')+':', x.vc||'');
  if(nd===null) return; // cancelou
  if(nd) x.vc=nd;
  x.st=tipo==='med'?'aprovada':'pendente';
  x.prejuizo=false;
  x.fluxo='sim';
  auditar('RETORNO','prejuizos','RETORNADO do prejuízo: '+(x.cli||x.cl||'')+' '+fmt(x.total||0)+(nd?' nova data '+nd:''));
  sv();rdPrejuizos();
  if(typeof rdContasReceber==='function')rdContasReceber();
  if(typeof rdFluxo==='function')rdFluxo();
  toast('↩️ Retornado ao Contas a Receber e Fluxo de Caixa!','ok');
}

function retornarPrejuizoPago(id, tipo){
  // Cliente pagou direto: marca recebido
  const lista=tipo==='med'?D.medicoes:D.vendas;
  const x=lista.find(i=>i.id===id);
  if(!x){toast('Registro não encontrado','er');return;}
  if(!confirm('Confirma que o cliente PAGOU este valor?\n'+fmt(x.total||0)+' — '+(x.cli||x.cl||''))) return;
  x.st=tipo==='med'?'paga':'pago';
  x.prejuizo=false;
  x.fluxo='sim';
  x.dtPag=new Date().toISOString().substring(0,10);
  auditar('RECEBIMENTO','prejuizos','Prejuízo RECEBIDO: '+(x.cli||x.cl||'')+' '+fmt(x.total||0));
  sv();rdPrejuizos();
  if(typeof rdFluxo==='function')rdFluxo();
  toast('✅ Recebido! Saiu do prejuízo.','ok');
}



