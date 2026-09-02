// ============ RENDERS ============

// ---- CONTAS DO DIA (dashboard, só admin e financeiro) ----
function rdContasHoje(){
  const el=document.getElementById('d-contas-hoje');
  if(!el)return;
  // Só administrador e financeiro
  const perfil=(authUser&&authUser.perfil)||'';
  if(!temAcesso('contas-dia') && perfil!=='financeiro'){el.innerHTML='';return;}
  const hoje=new Date().toISOString().substring(0,10);
  // A RECEBER hoje: medições e vendas com vencimento hoje, ainda pendentes
  const receber=[
    ...D.medicoes.filter(m=>(m.vc===hoje)&&m.st!=='recebido'&&m.st!=='pago').map(m=>({cli:m.cl,desc:(m.tipo==='venda_equip'?'Venda ':'Medição '),placa:m.placa||'',vl:m.total||0})),
    ...D.vendas.filter(v=>(v.vc===hoje)&&v.st!=='recebido'&&v.st!=='pago').map(v=>({cli:v.cli,desc:'Venda',placa:'',vl:v.total||0}))
  ];
  // A PAGAR hoje: despesas e NFs com vencimento hoje, ainda pendentes
  const pagar=[
    ...D.despesas.filter(d=>(d.vc===hoje)&&d.st!=='pago').map(d=>({forn:d.forn||'',desc:d.desc,placa:d.placa||'',vl:parseFloat(d.vl)||0})),
    ...D.nfs.filter(n=>(n.vc===hoje)&&n.st!=='pago').map(n=>({forn:n.forn||'',desc:'NF '+(n.num||''),placa:'',vl:parseFloat(n.vl)||0}))
  ];
  const totR=receber.reduce((s,x)=>s+x.vl,0);
  const totP=pagar.reduce((s,x)=>s+x.vl,0);
  const linhaR=receber.length?receber.map(r=>`<tr><td>${r.cli||'-'}</td><td style="font-size:11px">${r.desc}</td><td style="font-size:11px">${r.placa||'-'}</td><td style="color:var(--gn);font-weight:600;text-align:right">${fmt(r.vl)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Nada a receber hoje</td></tr>';
  const linhaP=pagar.length?pagar.map(p=>`<tr><td>${p.forn||'-'}</td><td style="font-size:11px">${p.desc}</td><td style="font-size:11px">${p.placa||'-'}</td><td style="color:var(--red);font-weight:600;text-align:right">${fmt(p.vl)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">Nada a pagar hoje</td></tr>';
  el.innerHTML=`<div class="g2">
    <div class="panel">
      <div class="ph"><div class="pt">💵 A Receber Hoje</div><span class="badge b-gn">${fmt(totR)}</span></div>
      <div class="tw"><table><thead><tr><th>Cliente</th><th>Origem</th><th>Placa</th><th style="text-align:right">Valor</th></tr></thead><tbody>${linhaR}</tbody></table></div>
    </div>
    <div class="panel">
      <div class="ph"><div class="pt">💸 A Pagar Hoje</div><span class="badge b-rd">${fmt(totP)}</span></div>
      <div class="tw"><table><thead><tr><th>Fornecedor</th><th>Descrição</th><th>Placa</th><th style="text-align:right">Valor</th></tr></thead><tbody>${linhaP}</tbody></table></div>
    </div>
  </div>`;
}

