// ---- CLIENTES ----
function rdRelCli(){
  const{meds,vends,desps}=getRelData();
  const busca=(document.getElementById('rel-busca').value||'').toLowerCase();
  const todos=[...new Set([...meds.map(m=>m.cl),...vends.map(v=>v.cli),...D.contratos.map(c=>c.cl)])].filter(Boolean).filter(c=>!busca||c.toLowerCase().includes(busca));

  const tabRes=`<div class="panel"><div class="ph"><div class="pt">Clientes — Resumo</div><span style="font-size:9px;color:var(--mt)">${todos.length} clientes</span></div><div class="tw"><table><thead><tr><th>#</th><th>Cliente</th><th>Contratos</th><th>Rec. Medições</th><th>Rec. Vendas</th><th>Total Geral</th></tr></thead><tbody>
  ${todos.map((cl,i)=>{const nct=D.contratos.filter(c=>c.cl===cl).length;const rm=meds.filter(m=>m.cl===cl).reduce((s,m)=>s+(m.total||0),0);const rv=vends.filter(v=>v.cli===cl).reduce((s,v)=>s+(v.total||0),0);return`<tr><td style="font-size:9px;color:var(--mt)">${i+1}</td><td><b>${cl}</b></td><td>${nct}</td><td style="color:var(--gn)">${rm?fmt(rm):'-'}</td><td style="color:var(--pu)">${rv?fmt(rv):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(rm+rv)}</td></tr>`;}).join('')||'<tr><td colspan="6" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabDet=todos.map(cl=>{
    const cts=D.contratos.filter(c=>c.cl===cl);const mCl=meds.filter(m=>m.cl===cl);const vCl=vends.filter(v=>v.cli===cl);const rm=mCl.reduce((s,m)=>s+(m.total||0),0);const rv=vCl.reduce((s,v)=>s+(v.total||0),0);
    return`<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">👤 ${cl}</div><div style="font-family:'Bebas Neue';font-size:18px;color:var(--gn)">${fmt(rm+rv)}</div></div><div class="pb">
    <div class="g2" style="margin-bottom:10px">
      <div><div style="font-size:9px;color:var(--mt);margin-bottom:5px">CONTRATOS (${cts.length})</div>${cts.map(c=>`<div class="stat-row"><div class="stat-label"><span class="tag-p">${c.placa||'-'}</span> ${c.ob||''}</div><div class="stat-value">${fmt(c.vl)}/mês · ${bdg(c.status)}</div></div>`).join('')||'-'}</div>
      <div><div style="font-size:9px;color:var(--mt);margin-bottom:5px">MEDIÇÕES (${mCl.length})</div>${mCl.map(m=>`<div class="stat-row"><div class="stat-label">${m.ms||''}</div><div style="display:flex;align-items:center;gap:6px;font-size:11px">${fmt(m.total)} ${bdg(m.st)}</div></div>`).join('')||'-'}</div>
    </div>
    ${vCl.length?`<div style="font-size:9px;color:var(--mt);margin-bottom:5px">VENDAS (${vCl.length})</div>${vCl.map(v=>`<div class="stat-row"><div class="stat-label">${v.num} · ${v.dt||''}</div><div style="display:flex;align-items:center;gap:6px;font-size:11px">${fmt(v.total)} ${bdg(v.st)}</div></div>`).join('')}`:''}
    </div></div>`;}).join('');

  document.getElementById('rel-cli').innerHTML=granBlock('',tabRes,tabRes+tabDet,tabRes+tabDet);}

