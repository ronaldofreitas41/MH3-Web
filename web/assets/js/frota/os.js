// ---- MANUTENÇÕES / OS ----
function rdRelManut(){
  const{mns}=getRelData();
  const tot=mns.reduce((s,m)=>s+(m.total||0),0);const ab=mns.filter(m=>m.status!=='concluida').length;const cc=mns.filter(m=>m.status==='concluida').length;

  const kpis=`<div class="krow c4" style="margin-bottom:12px">
    <div class="kpi bl"><div class="klbl">Total OS</div><div class="kval">${mns.length}</div></div>
    <div class="kpi yw"><div class="klbl">Abertas/Aguardando</div><div class="kval">${ab}</div></div>
    <div class="kpi gn"><div class="klbl">Concluídas</div><div class="kval">${cc}</div></div>
    <div class="kpi rd"><div class="klbl">Custo Total</div><div class="kval">${fmtk(tot)}</div></div>
  </div>`;

  const tabCusto=`<div class="panel"><div class="ph"><div class="pt">Custo por Veículo/Equipamento</div></div><div class="tw"><table><thead><tr><th>Placa</th><th>Equip.</th><th>Qtd OS</th><th>Custo MH3</th><th>Custo Cliente</th><th>Total</th></tr></thead><tbody>
  ${D.equips.map(eq=>{const osEq=mns.filter(m=>m.eqId===eq.id);if(!osEq.length)return'';const cm=osEq.filter(m=>m.custo==='mh3').reduce((s,m)=>s+(m.total||0),0);const cc2=osEq.filter(m=>m.custo==='cliente').reduce((s,m)=>s+(m.total||0),0);return`<tr><td><span class="tag-p">${eq.placa}</span></td><td>${eq.mk} ${eq.mo}</td><td>${osEq.length}</td><td style="color:var(--bl)">${cm?fmt(cm):'-'}</td><td style="color:var(--or)">${cc2?fmt(cc2):'-'}</td><td style="color:var(--red);font-weight:600">${fmt(cm+cc2)}</td></tr>`;}).filter(Boolean).join('')||'<tr><td colspan="6" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabTipo=`<div class="panel"><div class="ph"><div class="pt">Por Tipo de OS</div></div><div class="tw"><table><thead><tr><th>Tipo</th><th>Qtd</th><th>Custo Total</th><th>Custo Médio</th></tr></thead><tbody>
  ${[...new Set(mns.map(m=>m.tipo))].map(tipo=>{const osT=mns.filter(m=>m.tipo===tipo);const vt=osT.reduce((s,m)=>s+(m.total||0),0);return`<tr><td><b>${tipo}</b></td><td>${osT.length}</td><td style="color:var(--or)">${fmt(vt)}</td><td>${fmt(osT.length?vt/osT.length:0)}</td></tr>`;}).join('')||'<tr><td colspan="4" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabAll=`<div class="panel"><div class="ph"><div class="pt">Todas as OS — Analítico</div><span style="font-size:9px;color:var(--mt)">${mns.length} registros</span></div><div class="tw"><table><thead><tr><th>Nº OS</th><th>Placa</th><th>Tipo</th><th>Entrada</th><th>Saída</th><th>KM</th><th>H</th><th>Resp.</th><th>Itens</th><th>Custo</th><th>Status</th></tr></thead><tbody>
  ${mns.length?mns.map(m=>`<tr><td class="os-num">${m.osNum||'—'}</td><td><span class="tag-p">${m.placa||'-'}</span></td><td style="font-size:9px">${m.tipo}</td><td style="font-size:9px">${m.en||'-'}</td><td style="font-size:9px">${m.sa||'—'}</td><td style="font-size:9px">${m.km||'-'}</td><td style="font-size:9px">${m.hr||'-'}</td><td style="font-size:9px">${m.resp||'-'}</td><td>${(m.lancs||[]).length}</td><td style="color:var(--or);font-weight:600">${m.total?fmt(m.total):'-'}</td><td>${bdg(m.status||'aberta')}</td></tr>`).join(''):'<tr><td colspan="11" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-manut-c').innerHTML=granBlock('',kpis+tabCusto,kpis+tabCusto+tabTipo,kpis+tabCusto+tabTipo+tabAll);}

