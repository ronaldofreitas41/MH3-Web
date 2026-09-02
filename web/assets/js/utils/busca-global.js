// ---- BUSCA GLOBAL (topo) ----
function buscaGlobal(q){
  const res=document.getElementById('busca-global-res');
  if(!res)return;
  q=(q||'').toLowerCase().trim();
  if(q.length<2){res.style.display='none';return;}
  const achados=[];
  // Veículos/placas
  (D.equips||[]).forEach(e=>{
    const pl=e.pl||e.placa||'';
    if((pl+' '+(e.mk||'')+' '+(e.mo||'')).toLowerCase().includes(q))
      achados.push({tipo:'🚛 Veículo',txt:pl+' — '+((e.mk||'')+' '+(e.mo||'')).trim(),acao:`go('frota')`});
  });
  // Clientes
  (D.clientes||[]).forEach(c=>{
    if(((c.nome||'')+' '+(c.cnpj||'')+' '+(c.obra||'')).toLowerCase().includes(q))
      achados.push({tipo:'🏢 Cliente',txt:c.nome+(c.obra?' — '+c.obra:''),acao:`go('clientes')`});
  });
  // Contratos
  (D.contratos||[]).forEach(c=>{
    if(((c.cl||'')+' '+(c.placa||'')).toLowerCase().includes(q))
      achados.push({tipo:'📋 Contrato',txt:(c.cl||'')+(c.placa?' — '+c.placa:''),acao:`go('contratos')`});
  });
  // OS / Manutenções
  (D.manutencoes||[]).forEach(m=>{
    if(((m.placa||'')+' '+(m.osNum||m.os||'')).toLowerCase().includes(q))
      achados.push({tipo:'🔧 OS',txt:'OS '+(m.osNum||m.os||'')+' — '+(m.placa||''),acao:`go('manutencao')`});
  });
  // Funcionários
  (D.funcionarios||[]).forEach(f=>{
    if((f.nome||'').toLowerCase().includes(q))
      achados.push({tipo:'👷 Funcionário',txt:f.nome+(f.cargo?' — '+f.cargo:''),acao:`go('funcionarios')`});
  });
  if(!achados.length){res.innerHTML='<div style="padding:12px;font-size:12px;color:var(--mt)">Nada encontrado</div>';res.style.display='block';return;}
  res.innerHTML=achados.slice(0,15).map(a=>`<div onclick="${a.acao};document.getElementById('busca-global-res').style.display='none';document.getElementById('busca-global').value='';" style="padding:9px 12px;border-bottom:1px solid var(--br);cursor:pointer;font-size:12px" onmouseover="this.style.background='var(--cd2)'" onmouseout="this.style.background=''">
    <span style="font-size:10px;color:var(--mt)">${a.tipo}</span><br><b>${a.txt}</b>
  </div>`).join('');
  res.style.display='block';
}
// ---- DATAS COLORIDAS POR URGÊNCIA ----
function fmtDataUrg(iso, pago){
  if(!iso) return '<span style="color:var(--mt)">-</span>';
  const txt=fmtData(iso);
  if(pago) return '<span style="color:var(--gn)">'+txt+'</span>'; // pago = verde
  const hoje=new Date().toISOString().substring(0,10);
  let cor='var(--tx)';
  if(iso<hoje) cor='var(--red)';        // vencido = vermelho
  else if(iso===hoje) cor='var(--or)';  // vence hoje = laranja
  else {
    // vence em até 3 dias = amarelo/laranja claro
    const d=(new Date(iso)-new Date(hoje))/(1000*60*60*24);
    if(d<=3) cor='var(--or)';
  }
  return '<span style="color:'+cor+';font-weight:'+(iso<=hoje?'600':'400')+'">'+txt+'</span>';
}




