// ---- ESTOQUE ----
function rdRelEstq(){
  const{mns,vends}=getRelData();
  const busca=(document.getElementById('rel-busca').value||'').toLowerCase();
  let items=D.estoque;if(busca)items=items.filter(e=>`${e.ds} ${e.cat} ${e.cd||''}`.toLowerCase().includes(busca));
  const vl=items.reduce((s,e)=>s+((Number(e.qt)||0)*(Number(e.cv)||0)),0);const bx=items.filter(e=>e.qt<=e.mn).length;
  const cats=[...new Set(items.map(e=>e.cat))];

  const kpis=`<div class="krow c3" style="margin-bottom:12px">
    <div class="kpi bl"><div class="klbl">Itens Cadastrados</div><div class="kval">${items.length}</div></div>
    <div class="kpi yw"><div class="klbl">Estoque Baixo</div><div class="kval">${bx}</div><div class="ksub">abaixo do mínimo</div></div>
    <div class="kpi gn"><div class="klbl">Valor em Estoque</div><div class="kval">${fmtk(vl)}</div></div>
  </div>`;

  const tabRes=`<div class="panel"><div class="ph"><div class="pt">Produtos — Resumo por Categoria</div></div><div class="tw"><table><thead><tr><th>Categoria</th><th>Itens</th><th>Qtd Total</th><th>Valor Estoque</th><th>Baixo Estoque</th></tr></thead><tbody>
  ${cats.map(cat=>{const its=items.filter(e=>e.cat===cat);const v=its.reduce((s,e)=>s+((Number(e.qt)||0)*(Number(e.cv)||0)),0);const bxc=its.filter(e=>e.qt<=e.mn).length;return`<tr><td><b>${cat}</b></td><td>${its.length}</td><td>${its.reduce((s,e)=>s+e.qt,0)}</td><td style="color:var(--gn)">${fmt(v)}</td><td>${bxc?`<span class="badge b-yw">${bxc} baixo</span>`:'-'}</td></tr>`;}).join('')||'<tr><td colspan="5" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabDet=`<div class="panel"><div class="ph"><div class="pt">Todos os Itens — Detalhado</div><span style="font-size:9px;color:var(--mt)">${items.length} itens</span></div><div class="tw"><table><thead><tr><th>Cód.</th><th>Descrição</th><th>Cat.</th><th>Qtd</th><th>Mín</th><th>Un</th><th>Custo</th><th>Venda</th><th>Margem</th><th>Total</th><th>Situação</th></tr></thead><tbody>
  ${items.map(e=>{const mg=e.pv&&e.cv?Math.round((e.pv-e.cv)/e.cv*100):0;return`<tr><td style="font-size:9px;color:var(--mt)">${e.cd||'-'}</td><td><b>${e.ds}</b></td><td style="font-size:9px">${e.cat}</td><td style="font-weight:700;${e.qt<=e.mn?'color:var(--yw)':''}">${e.qt}</td><td style="font-size:9px">${e.mn}</td><td style="font-size:9px">${e.un}</td><td>${fmt(e.cv)}</td><td style="color:var(--pu)">${fmt(e.pv||0)}</td><td style="color:${mg>0?'var(--gn)':'var(--mt)'};">${e.pv&&e.cv?mg+'%':'-'}</td><td style="color:var(--gn)">${fmt((Number(e.qt)||0)*(Number(e.cv)||0))}</td><td>${e.qt<=0?'<span class="badge b-rd">Zerado</span>':e.qt<=e.mn?'<span class="badge b-yw">Baixo</span>':'<span class="badge b-gn">OK</span>'}</td></tr>`;}).join('')||'<tr><td colspan="11" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabGiro=`<div class="panel"><div class="ph"><div class="pt">Giro de Estoque — Analítico</div></div><div class="tw"><table><thead><tr><th>Cód.</th><th>Descrição</th><th>Estoque Atual</th><th>Usado em OS</th><th>Usado em Vendas</th><th>Total Saídas</th><th>Custo Saídas</th></tr></thead><tbody>
  ${items.map(e=>{const usOS=mns.reduce((s,m)=>{const l=(m.lancs||[]).filter(l=>l.estqId===e.id);return s+l.reduce((ss,l)=>ss+l.qtd,0);},0);const usV=vends.reduce((s,v)=>{const i=(v.items||[]).filter(i=>i.estqId===e.id);return s+i.reduce((ss,i)=>ss+i.qtd,0);},0);if(!usOS&&!usV)return'';return`<tr><td style="font-size:9px">${e.cd||'-'}</td><td><b>${e.ds}</b></td><td>${e.qt} ${e.un}</td><td style="color:var(--yw)">${usOS?usOS+' '+e.un:'-'}</td><td style="color:var(--pu)">${usV?usV+' '+e.un:'-'}</td><td style="font-weight:600">${(usOS+usV)} ${e.un}</td><td style="color:var(--red)">${fmt((usOS+usV)*e.cv)}</td></tr>`;}).filter(Boolean).join('')||'<tr><td colspan="7" class="empty">Sem movimentações no período</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-estq-c').innerHTML=granBlock('',kpis+tabRes,kpis+tabDet,kpis+tabDet+tabGiro);}

