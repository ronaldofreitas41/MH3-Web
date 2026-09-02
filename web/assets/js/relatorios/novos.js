// ---- RELATÓRIOS NOVOS (centralizados) ----
function rdRelCPagar(){
  const el=document.getElementById('rel-cpagar-c');
  if(!el) return;
  const items=[...D.nfs.filter(n=>n.cp==='sim'),...D.despesas].sort((a,b)=>new Date(a.vc||'9999')-new Date(b.vc||'9999'));
  const tot=items.reduce((s,c)=>s+(parseFloat(c.vl)||0),0);
  const pend=items.filter(c=>c.st!=='pago').reduce((s,c)=>s+(parseFloat(c.vl)||0),0);
  el.innerHTML=`<div style="display:flex;gap:10px;margin-bottom:12px">
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">TOTAL</div><div style="font-size:18px;font-weight:700">${fmt(tot)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">PENDENTE</div><div style="font-size:18px;font-weight:700;color:var(--or)">${fmt(pend)}</div></div>
  </div>
  <div class="tw"><table><thead><tr><th>Descrição</th><th>Fornecedor</th><th>Valor</th><th>Venc.</th><th>Status</th></tr></thead>
  <tbody>${items.map(c=>`<tr><td>${c.desc||'NF '+(c.num||'')}</td><td>${c.forn||'-'}</td><td style="color:var(--or)">${fmt(c.vl)}</td><td>${fmtData(c.vc)}</td><td>${c.st==='pago'?'✅ Pago':'⏳ Pendente'}</td></tr>`).join('')||'<tr><td colspan=5 class=empty>Vazio</td></tr>'}</tbody></table></div>`;
}
function rdRelCReceber(){
  const el=document.getElementById('rel-creceber-c');
  if(!el) return;
  const items=[...D.medicoes.map(m=>({...m,cli:m.cl,origem:'Medição'})),...D.vendas.map(v=>({...v,cli:v.cli,origem:'Venda'}))];
  const tot=items.reduce((s,x)=>s+(x.total||0),0);
  const rec=items.filter(x=>x.st==='paga'||x.st==='pago').reduce((s,x)=>s+(x.total||0),0);
  el.innerHTML=`<div style="display:flex;gap:10px;margin-bottom:12px">
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">TOTAL</div><div style="font-size:18px;font-weight:700">${fmt(tot)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">RECEBIDO</div><div style="font-size:18px;font-weight:700;color:var(--gn)">${fmt(rec)}</div></div>
  </div>
  <div class="tw"><table><thead><tr><th>Cliente</th><th>Origem</th><th>Valor</th><th>Venc.</th><th>Status</th></tr></thead>
  <tbody>${items.map(x=>`<tr><td>${x.cli||'-'}</td><td>${x.origem}</td><td style="color:var(--gn)">${fmt(x.total)}</td><td>${fmtData(x.vc)}</td><td>${x.st==='paga'||x.st==='pago'?'✅ Recebido':'⏳ Pendente'}</td></tr>`).join('')||'<tr><td colspan=5 class=empty>Vazio</td></tr>'}</tbody></table></div>`;
}
function rdRelResPlaca(){
  const el=document.getElementById('rel-resplaca-c');
  if(!el) return;
  el.innerHTML='<p style="color:var(--mt);font-size:13px;padding:12px">Use a aba <b>Relatórios → Resultado por Placa</b> no menu lateral para o relatório completo com filtros.</p><div id="rel-resplaca-tab"></div>';
  // Reuse resultado calculation
  let rows=[];
  D.equips.forEach(eq=>{
    const meds=D.medicoes.filter(m=>m.eqId===eq.id&&m.st==='paga');
    const rec=meds.reduce((s,m)=>s+(m.total||0),0);
    const oss=D.manutencoes.filter(m=>m.eqId===eq.id&&!ehImpressao(m));
    const custoOS=oss.reduce((s,m)=>s+((m.lancs||[]).reduce((ss,l)=>ss+l.qtd*l.val,0)),0);
    const desps=D.despesas.filter(d=>d.placa===eq.placa);
    const custoDesp=desps.reduce((s,d)=>s+(parseFloat(d.vl)||0),0);
    rows.push({eq,rec,custoOS,custoDesp,res:rec-custoOS-custoDesp});
  });
  document.getElementById('rel-resplaca-tab').innerHTML=`<div class="tw"><table>
    <thead><tr><th>Placa</th><th>Receitas</th><th>OS</th><th>Despesas</th><th>Resultado</th></tr></thead>
    <tbody>${rows.map(r=>`<tr><td><b>${r.eq.placa}</b></td><td style="color:var(--gn)">${fmt(r.rec)}</td><td style="color:var(--red)">${fmt(r.custoOS)}</td><td style="color:var(--red)">${fmt(r.custoDesp)}</td><td style="font-weight:700;color:${r.res>=0?'var(--gn)':'var(--red)'}">${fmt(r.res)}</td></tr>`).join('')}</tbody></table></div>`;
}



