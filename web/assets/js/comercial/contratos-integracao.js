// ---- CONTRATOS ----
function rdRelContratos(){
  const busca=(document.getElementById('rel-busca').value||'').toLowerCase();
  let cts=D.contratos;if(busca)cts=cts.filter(c=>`${c.cl} ${c.placa||''} ${c.ob||''}`.toLowerCase().includes(busca));
  const ativos=cts.filter(c=>c.status==='ativo');const enc=cts.filter(c=>c.status==='encerrado');
  const recMes=ativos.reduce((s,c)=>s+(c.vl||0),0);

  const kpis=`<div class="krow c4" style="margin-bottom:12px">
    <div class="kpi gn"><div class="klbl">Contratos Ativos</div><div class="kval">${ativos.length}</div></div>
    <div class="kpi gr"><div class="klbl">Encerrados</div><div class="kval" style="color:var(--mt)">${enc.length}</div></div>
    <div class="kpi bl"><div class="klbl">Receita/Mês</div><div class="kval">${fmtk(recMes)}</div></div>
    <div class="kpi yw"><div class="klbl">Pend. Assinatura</div><div class="kval">${cts.filter(c=>c.ass==='pendente').length}</div></div>
  </div>`;

  const tabRes=`<div class="panel"><div class="ph"><div class="pt">Todos os Contratos</div><span style="font-size:9px;color:var(--mt)">${cts.length} registros</span></div><div class="tw"><table><thead><tr><th>Cliente</th><th>Equip.</th><th>Turno/H</th><th>H.Extra/h</th><th>Valor/Mês</th><th>Início</th><th>Ciclo</th><th>Assinatura</th><th>Status</th></tr></thead><tbody>
  ${cts.length?cts.map(c=>`<tr><td><b>${c.cl}</b><br><span style="font-size:8px;color:var(--mt)">${c.ob||''}</span></td><td><span class="tag-p">${c.placa||'-'}</span></td><td>${c.tn}T/${c.hr}h</td><td style="color:var(--pu)">${c.vhe?fmt(c.vhe)+'/h':'—'}</td><td style="color:var(--gn);font-weight:600">${fmt(c.vl)}</td><td style="font-size:9px">${c.ini||'-'}</td><td style="font-size:9px">${c.ci||'-'}</td><td>${c.ass==='assinado'?'<span class="badge b-gn">✅</span>':'<span class="badge b-yw">Pendente</span>'}</td><td>${bdg(c.status)}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabAna=`<div class="panel"><div class="ph"><div class="pt">Análise de Receita Contratada</div></div><div class="tw"><table><thead><tr><th>Cliente</th><th>Placa</th><th>Ciclo</th><th>Valor/Mês</th><th>H.Extra/h</th><th>Medições pagas</th><th>A receber</th></tr></thead><tbody>
  ${ativos.map(c=>{const mCt=D.medicoes.filter(m=>m.ctId===c.id);const pg=mCt.filter(m=>m.st==='paga').reduce((s,m)=>s+(m.total||0),0);const ap=mCt.filter(m=>m.st!=='paga').reduce((s,m)=>s+(m.total||0),0);return`<tr><td><b>${c.cl}</b></td><td><span class="tag-p">${c.placa||'-'}</span></td><td>${c.ci||'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(c.vl)}</td><td style="color:var(--pu)">${c.vhe?fmt(c.vhe):'-'}</td><td style="color:var(--gn)">${pg?fmt(pg):'-'}</td><td style="color:var(--cy)">${ap?fmt(ap):'-'}</td></tr>`;}).join('')||'<tr><td colspan="7" class="empty">Sem contratos ativos</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-contratos-c').innerHTML=granBlock('',kpis+tabRes,kpis+tabRes,kpis+tabRes+tabAna);}

