// ============ RELATÓRIOS — MOTOR COMPLETO ============
let relGran='resumido', relAba='tr-fin';

function setGran(g){
  relGran=g;
  ['res','det','ana'].forEach(k=>{const el=document.getElementById('gn-'+k);if(el){el.className=el.className.replace(/\bbp\b|\bbg\b/g,'');}});
  const map={resumido:'gn-res',detalhado:'gn-det',analitico:'gn-ana'};
  const el=document.getElementById(map[g]);if(el)el.className=el.className.replace('bg','bp').replace('bp bp','bp');
  rdRelAtivo();
}

function relTab(btn,pid){
  document.getElementById('rel-tabs-bar').querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('#pg-relatorios .tab-p').forEach(p=>p.classList.remove('on'));
  btn.classList.add('on');
  relAba=pid;
  document.getElementById(pid).classList.add('on');
  rdRelAtivo();
}

function rdRelAtivo(){
  const map={
    'tr-fin':rdRelFin,'tr-receitas':rdRelReceitas,'tr-desp':rdRelDesp,
    'tr-frota':rdRelFrota,'tr-cli':rdRelCli,'tr-estq':rdRelEstq,
    'tr-manut':rdRelManut,'tr-contratos':rdRelContratos,'tr-fluxo2':rdRelFluxo2,
    'tr-cpagar':rdRelCPagar,'tr-creceber':rdRelCReceber,
    'tr-resplaca':rdRelResPlaca,'tr-resgeral':rdRelResGeral
  };
  if(map[relAba])map[relAba]();
}

function rdRel(){rdRelAtivo();}

function getRelData(){
  const periodo=document.getElementById('rel-periodo').value;
  const busca=(document.getElementById('rel-busca').value||'').toLowerCase();
  const hoje=new Date();
  const mesAtual=hoje.getFullYear()+'-'+String(hoje.getMonth()+1).padStart(2,'0');
  const filtrar=(arr,campo,textCampos)=>{
    let r=arr;
    if(periodo==='mes')r=r.filter(x=>x[campo]&&x[campo].startsWith(mesAtual));
    else if(periodo==='trim'){const m3=new Date(hoje.getFullYear(),hoje.getMonth()-3,1);const ms3=m3.getFullYear()+'-'+String(m3.getMonth()+1).padStart(2,'0');r=r.filter(x=>x[campo]&&x[campo]>=ms3);}
    else if(periodo==='ano')r=r.filter(x=>x[campo]&&x[campo].startsWith(hoje.getFullYear()+''));
    if(busca&&textCampos)r=r.filter(x=>textCampos.some(c=>String(x[c]||'').toLowerCase().includes(busca)));
    return r;
  };
  const meds=filtrar(D.medicoes,'ms',['cl','placa']);
  const desps=filtrar(D.despesas,'dt',['desc','cat','placa','forn']);
  const vends=filtrar(D.vendas,'dt',['cli']);
  const mns=filtrar(D.manutencoes,'en',['placa','tipo','resp']);
  const nfsFilt=filtrar(D.nfs,'dt',['forn','num']);
  return{meds,desps,vends,mns,nfsFilt,busca,periodo};
}

function barChart(data,maxV,colorVar){
  if(!data.length)return'<div class="empty"><div class="ei">📊</div>Sem dados no período</div>';
  return`<div class="chart-bar-wrap">${data.map(d=>{const h=Math.max(4,Math.round((d.v||0)/Math.max(maxV,1)*90));return`<div class="chart-bar-col"><div class="chart-bar-val">${fmtk(d.v)}</div><div class="chart-bar" style="height:${h}px;background:${colorVar};opacity:.85"></div><div class="chart-bar-lbl">${d.l}</div></div>`;}).join('')}</div>`;}

function granBlock(titulo,resumido,detalhado,analitico){
  const map={resumido,detalhado,analitico};
  return(map[relGran]||resumido);}

// ---- FINANCEIRO ----
function rdRelFin(){
  const{meds,desps,vends}=getRelData();
  const rec=meds.filter(m=>m.st==='paga').reduce((s,m)=>s+(m.total||0),0)+vends.filter(v=>v.st==='pago').reduce((s,v)=>s+(v.total||0),0);
  const ar=meds.filter(m=>m.st!=='paga').reduce((s,m)=>s+(m.total||0),0)+vends.filter(v=>v.st!=='pago').reduce((s,v)=>s+(v.total||0),0);
  const despTot=desps.reduce((s,d)=>s+(d.vl||0),0);
  const margem=rec-despTot;
  const prev=D.contratos.filter(c=>c.status==='ativo').reduce((s,c)=>s+(c.vl||0),0);

  const porMes={};meds.forEach(m=>{if(m.ms){if(!porMes[m.ms])porMes[m.ms]=0;porMes[m.ms]+=(m.total||0);}});vends.forEach(v=>{const ms=v.dt?v.dt.substr(0,7):'';if(ms){if(!porMes[ms])porMes[ms]=0;porMes[ms]+=(v.total||0);}});
  const mesData=Object.entries(porMes).sort((a,b)=>a[0].localeCompare(b[0])).slice(-8).map(([ms,v])=>({l:ms.substr(5),v}));
  const maxMes=Math.max(...mesData.map(d=>d.v),1);

  const kpis=`<div class="krow c4" style="margin-bottom:12px">
    <div class="kpi gn"><div class="klbl">Receita Recebida</div><div class="kval">${fmtk(rec)}</div><div class="ksub">no período</div></div>
    <div class="kpi cy"><div class="klbl">A Receber</div><div class="kval">${fmtk(ar)}</div><div class="ksub">pendente</div></div>
    <div class="kpi rd"><div class="klbl">Despesas</div><div class="kval">${fmtk(despTot)}</div><div class="ksub">total</div></div>
    <div class="kpi ${margem>=0?'gn':'rd'}"><div class="klbl">Margem Líquida</div><div class="kval">${fmtk(margem)}</div><div class="ksub">${margem>=0?'positiva':'negativa'}</div></div>
  </div>`;

  const grafico=`<div class="panel"><div class="ph"><div class="pt">Receita por Mês</div></div><div class="pb">${barChart(mesData,maxMes,'var(--gn)')}</div></div>`;

  const tabelaMeds=`<div class="panel"><div class="ph"><div class="pt">Medições — Detalhado</div><span style="font-size:9px;color:var(--mt)">${meds.length} registros</span></div><div class="tw"><table><thead><tr><th>Cliente</th><th>Placa</th><th>Mês</th><th>Período</th><th>Hrs</th><th>Bruto</th><th>Desc.</th><th>Total</th><th>Venc.</th><th>Status</th></tr></thead><tbody>
  ${meds.length?meds.map(m=>`<tr><td><b>${m.cl}</b></td><td><span class="tag-p">${m.placa||'-'}</span></td><td>${m.ms||'-'}</td><td style="font-size:9px">${fmtData(m.de)} – ${fmtData(m.at)}</td><td>${m.hr||'-'}h${m.he?'+'+m.he+'Hex':''}</td><td>${fmt(m.vl)}</td><td style="color:var(--red)">${m.dc?fmt(m.dc):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(m.total)}</td><td style="font-size:9px;${m.vc&&dTo(m.vc)<0&&m.st!=='paga'?'color:var(--red)':''}">${fmtData(m.vc)}</td><td>${bdg(m.st)}</td></tr>`).join(''):'<tr><td colspan="10" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabelaVends=`<div class="panel"><div class="ph"><div class="pt">Vendas — Detalhado</div><span style="font-size:9px;color:var(--mt)">${vends.length} registros</span></div><div class="tw"><table><thead><tr><th>Nº</th><th>Cliente</th><th>Data</th><th>Itens</th><th>Desc.%</th><th>Total</th><th>Pgto</th><th>Status</th></tr></thead><tbody>
  ${vends.length?vends.map(v=>`<tr><td class="os-num">${v.num}</td><td><b>${v.cli}</b></td><td style="font-size:9px">${fmtData(v.dt)}</td><td>${v.items?(v.items||[]).length:0}</td><td>${v.desc||0}%</td><td style="color:var(--gn);font-weight:600">${fmt(v.total)}</td><td style="font-size:9px">${v.pag}</td><td>${bdg(v.st)}</td></tr>`).join(''):'<tr><td colspan="8" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const resumo=`${kpis}<div class="g2">${grafico}<div class="panel"><div class="ph"><div class="pt">Resumo Geral</div></div><div class="pb">
    <div class="stat-row"><div class="stat-label">Receita contratada/mês</div><div class="stat-value gn">${fmt(prev)}</div></div>
    <div class="stat-row"><div class="stat-label">Receita recebida</div><div class="stat-value gn">${fmt(rec)}</div></div>
    <div class="stat-row"><div class="stat-label">A receber</div><div class="stat-value" style="color:var(--cy)">${fmt(ar)}</div></div>
    <div class="stat-row"><div class="stat-label">Total despesas</div><div class="stat-value rd">${fmt(despTot)}</div></div>
    <div class="stat-row" style="border-top:2px solid var(--br);margin-top:4px;padding-top:4px"><div style="font-size:11px;font-weight:600">Margem líquida</div><div style="font-size:13px;font-weight:700;color:${margem>=0?'var(--gn)':'var(--red)'}">${fmt(margem)}</div></div>
  </div></div></div>`;

  document.getElementById('rel-fin').innerHTML=granBlock('',resumo,resumo+tabelaMeds+tabelaVends,resumo+tabelaMeds+tabelaVends+`<div class="panel"><div class="ph"><div class="pt">Análise Analítica</div></div><div class="pb">
    <div class="stat-row"><div class="stat-label">Ticket médio medições</div><div class="stat-value">${meds.length?fmt(meds.reduce((s,m)=>s+(m.total||0),0)/meds.length):'-'}</div></div>
    <div class="stat-row"><div class="stat-label">Ticket médio vendas</div><div class="stat-value">${vends.length?fmt(vends.reduce((s,v)=>s+(v.total||0),0)/vends.length):'-'}</div></div>
    <div class="stat-row"><div class="stat-label">% medições pagas</div><div class="stat-value gn">${meds.length?Math.round(meds.filter(m=>m.st==='paga').length/meds.length*100):0}%</div></div>
    <div class="stat-row"><div class="stat-label">% vendas pagas</div><div class="stat-value gn">${vends.length?Math.round(vends.filter(v=>v.st==='pago').length/vends.length*100):0}%</div></div>
    <div class="stat-row"><div class="stat-label">Margem sobre receita</div><div class="stat-value ${margem>=0?'gn':'rd'}">${rec?Math.round(margem/rec*100):0}%</div></div>
  </div></div>`);}

// ---- RECEITAS ----
function rdRelReceitas(){
  const{meds,vends}=getRelData();
  const recMed=meds.reduce((s,m)=>s+(m.total||0),0);
  const recVend=vends.reduce((s,v)=>s+(v.total||0),0);
  const recTotal=recMed+recVend;
  const porCli={};meds.forEach(m=>{if(!porCli[m.cl])porCli[m.cl]={med:0,venda:0};porCli[m.cl].med+=(m.total||0);});vends.forEach(v=>{if(!porCli[v.cli])porCli[v.cli]={med:0,venda:0};porCli[v.cli].venda+=(v.total||0);});
  const topCli=Object.entries(porCli).map(([cl,r])=>({cl,tot:r.med+r.venda,med:r.med,venda:r.venda})).sort((a,b)=>b.tot-a.tot);

  const kpis=`<div class="krow c3" style="margin-bottom:12px">
    <div class="kpi gn"><div class="klbl">Receita Total</div><div class="kval">${fmtk(recTotal)}</div></div>
    <div class="kpi bl"><div class="klbl">De Medições</div><div class="kval">${fmtk(recMed)}</div><div class="ksub">${recTotal?Math.round(recMed/recTotal*100):0}% do total</div></div>
    <div class="kpi pu"><div class="klbl">De Vendas</div><div class="kval">${fmtk(recVend)}</div><div class="ksub">${recTotal?Math.round(recVend/recTotal*100):0}% do total</div></div>
  </div>`;

  const tabCli=`<div class="panel"><div class="ph"><div class="pt">Receita por Cliente</div><span style="font-size:9px;color:var(--mt)">${topCli.length} clientes</span></div><div class="tw"><table><thead><tr><th>#</th><th>Cliente</th><th>Medições</th><th>Vendas</th><th>Total</th><th>% Participação</th></tr></thead><tbody>
  ${topCli.length?topCli.map((c,i)=>{const pct=recTotal?Math.round(c.tot/recTotal*100):0;return`<tr><td style="font-size:10px;color:var(--mt)">${i+1}</td><td><b>${c.cl}</b></td><td style="color:var(--gn)">${c.med?fmt(c.med):'-'}</td><td style="color:var(--pu)">${c.venda?fmt(c.venda):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(c.tot)}</td><td><div style="display:flex;align-items:center;gap:6px"><div class="prog" style="flex:1;width:80px"><div class="prog-f gn" style="width:${pct}%"></div></div><span style="font-size:9px">${pct}%</span></div></td></tr>`;}).join(''):'<tr><td colspan="6" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabMes=`<div class="panel"><div class="ph"><div class="pt">Receita por Mês</div></div><div class="tw"><table><thead><tr><th>Mês</th><th>Medições</th><th>Vendas</th><th>Total Mês</th><th>Acumulado</th></tr></thead><tbody>
  ${(()=>{const pm={};meds.forEach(m=>{if(!pm[m.ms])pm[m.ms]={med:0,venda:0};pm[m.ms].med+=(m.total||0);});vends.forEach(v=>{const ms=v.dt?v.dt.substr(0,7):'?';if(!pm[ms])pm[ms]={med:0,venda:0};pm[ms].venda+=(v.total||0);});let acu=0;return Object.entries(pm).sort((a,b)=>a[0].localeCompare(b[0])).map(([ms,r])=>{const tot=r.med+r.venda;acu+=tot;return`<tr><td><b>${ms}</b></td><td style="color:var(--gn)">${r.med?fmt(r.med):'-'}</td><td style="color:var(--pu)">${r.venda?fmt(r.venda):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(tot)}</td><td style="color:var(--mt)">${fmt(acu)}</td></tr>`;}).join('')||'<tr><td colspan="5" class="empty">Sem dados</td></tr>';})()}</tbody></table></div></div>`;

  document.getElementById('rel-receitas').innerHTML=granBlock('',kpis+tabCli,kpis+tabCli+tabMes,kpis+tabCli+tabMes+`<div class="panel"><div class="ph"><div class="pt">Todas as Medições — Analítico</div></div><div class="tw"><table><thead><tr><th>Cliente</th><th>Placa</th><th>Mês</th><th>Hrs</th><th>Valor Base</th><th>HExtra</th><th>Desconto</th><th>Total</th><th>Status</th></tr></thead><tbody>
  ${meds.map(m=>`<tr><td><b>${m.cl}</b></td><td><span class="tag-p">${m.placa||'-'}</span></td><td>${m.ms}</td><td>${m.hr||'-'}h</td><td>${fmt(m.vl)}</td><td style="color:var(--pu)">${m.he?m.he+'h × '+fmt(m.vhe):'-'}</td><td style="color:var(--red)">${m.dc?fmt(m.dc):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(m.total)}</td><td>${bdg(m.st)}</td></tr>`).join('')||'<tr><td colspan="9" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`);}

// ---- DESPESAS ----
function rdRelDesp(){
  const{desps}=getRelData();
  const tot=desps.reduce((s,d)=>s+(d.vl||0),0);
  const pg=desps.filter(d=>d.st==='pago').reduce((s,d)=>s+(d.vl||0),0);
  const cats=['Combustível','Manutenção','Pneus','Seguros','IPVA/Licenciamento','Administrativo','Salários','Outros'];

  const kpis=`<div class="krow c3" style="margin-bottom:12px">
    <div class="kpi rd"><div class="klbl">Total Despesas</div><div class="kval">${fmtk(tot)}</div></div>
    <div class="kpi gn"><div class="klbl">Pagas</div><div class="kval">${fmtk(pg)}</div><div class="ksub">${tot?Math.round(pg/tot*100):0}%</div></div>
    <div class="kpi yw"><div class="klbl">A Pagar</div><div class="kval">${fmtk(tot-pg)}</div></div>
  </div>`;

  const tabCat=`<div class="panel"><div class="ph"><div class="pt">Por Categoria</div></div><div class="tw"><table><thead><tr><th>Categoria</th><th>Lançamentos</th><th>Valor Total</th><th>% do Total</th><th>Pago</th><th>A Pagar</th></tr></thead><tbody>
  ${cats.map(cat=>{const items=desps.filter(d=>d.cat===cat);const v=items.reduce((s,d)=>s+(d.vl||0),0);const vpg=items.filter(d=>d.st==='pago').reduce((s,d)=>s+(d.vl||0),0);if(!items.length)return'';const pct=tot?Math.round(v/tot*100):0;return`<tr><td><b>${cat}</b></td><td>${items.length}</td><td style="color:var(--or);font-weight:600">${fmt(v)}</td><td><div style="display:flex;align-items:center;gap:6px"><div class="prog" style="flex:1;width:70px"><div class="prog-f rd" style="width:${pct}%"></div></div><span style="font-size:9px">${pct}%</span></div></td><td style="color:var(--gn)">${fmt(vpg)}</td><td style="color:var(--yw)">${fmt(v-vpg)}</td></tr>`;}).join('')||'<tr><td colspan="6" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabPlaca=`<div class="panel"><div class="ph"><div class="pt">Por Placa / Veículo/Equipamento</div></div><div class="tw"><table><thead><tr><th>Placa</th><th>Equip.</th><th>Lançamentos</th><th>Total</th><th>Categorias</th></tr></thead><tbody>
  ${D.equips.map(eq=>{const items=desps.filter(d=>d.placa===eq.placa);const v=items.reduce((s,d)=>s+(d.vl||0),0);if(!items.length&&!desps.find(d=>d.placa===eq.placa))return'';const cats2=[...new Set(items.map(d=>d.cat))].join(', ');return`<tr><td><span class="tag-p">${eq.placa}</span></td><td>${eq.mk} ${eq.mo}</td><td>${items.length}</td><td style="color:var(--or);font-weight:600">${v?fmt(v):'-'}</td><td style="font-size:9px;color:var(--mt)">${cats2||'-'}</td></tr>`;}).filter(Boolean).join('')}
  ${(()=>{const semPlaca=desps.filter(d=>!d.placa);const v=semPlaca.reduce((s,d)=>s+(d.vl||0),0);return semPlaca.length?`<tr><td><span class="tag-p">GERAL</span></td><td style="color:var(--mt)">Sem placa</td><td>${semPlaca.length}</td><td style="color:var(--or);font-weight:600">${fmt(v)}</td><td style="font-size:9px;color:var(--mt)">${[...new Set(semPlaca.map(d=>d.cat))].join(', ')}</td></tr>`:''})()}
  </tbody></table></div></div>`;

  const tabDet=`<div class="panel"><div class="ph"><div class="pt">Lançamentos Individuais</div><span style="font-size:9px;color:var(--mt)">${desps.length} registros</span></div><div class="tw"><table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Placa</th><th>Fornecedor</th><th>Doc.</th><th>Valor</th><th>Venc.</th><th>Status</th></tr></thead><tbody>
  ${desps.length?desps.map(d=>`<tr><td style="font-size:9px">${fmtData(d.dt)}</td><td><b>${d.desc}</b></td><td style="font-size:9px">${d.cat}</td><td>${d.placa?`<span class="tag-p">${d.placa}</span>`:'-'}</td><td style="font-size:9px">${d.forn||'-'}</td><td style="font-size:9px">${d.doc||'-'}${d.ndoc?' #'+d.ndoc:''}</td><td style="color:var(--or);font-weight:600">${fmt(d.vl)}</td><td style="font-size:9px;${d.vc&&dTo(d.vc)<0&&d.st!=='pago'?'color:var(--red)':''}">${fmtData(d.vc)}</td><td>${bdg(d.st)}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-desp').innerHTML=granBlock('',kpis+tabCat,kpis+tabCat+tabPlaca,kpis+tabCat+tabPlaca+tabDet);}

// ---- FROTA ----
function rdRelFrota(){
  const{desps,mns}=getRelData();
  const busca=(document.getElementById('rel-busca').value||'').toLowerCase();
  let equips=D.equips;if(busca)equips=equips.filter(e=>`${e.placa} ${e.mk} ${e.mo} ${e.pr||''}`.toLowerCase().includes(busca));
  const stlbl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};
  const al=equips.filter(e=>e.st==='alocado').length,di=equips.filter(e=>e.st==='disponivel').length,im=equips.filter(e=>e.st==='imobilizado').length,vd=equips.filter(e=>e.st==='vendido').length;
  const taxaOcup=(di+al)?Math.round(al/(di+al)*100):0;

  const kpis=`<div class="krow c4" style="margin-bottom:12px">
    <div class="kpi gn"><div class="klbl">Alocados</div><div class="kval">${al}</div><div class="ksub">em obra</div></div>
    <div class="kpi bl"><div class="klbl">Disponíveis</div><div class="kval">${di}</div></div>
    <div class="kpi yw"><div class="klbl">Imobilizados</div><div class="kval">${im}</div></div>
    <div class="kpi or"><div class="klbl">Taxa Ocupação</div><div class="kval">${taxaOcup}%</div><div class="ksub">${al} de ${di+al} (disp.+aloc.)</div></div>
  </div>`;

  const tabRes=`<div class="panel"><div class="ph"><div class="pt">Status da Frota</div><span style="font-size:9px;color:var(--mt)">${equips.length} equip.</span></div><div class="pb">
  ${equips.map(e=>{const ct=D.contratos.find(c=>c.eqId===e.id&&c.status==='ativo');const stmap={disponivel:'b-bl',alocado:'b-gn',imobilizado:'b-yw',vendido:'b-gr',uso_empresa:'b-pu'};return`<div class="stat-row"><div class="stat-label"><span class="tag-p">${e.placa}</span> ${e.mk} ${e.mo} <span class="badge ${e.cond==='novo'?'b-gn':'b-or'}">${e.cond==='novo'?'Novo':'Usado'}</span>${e.pr?` · 👤${e.pr}`:''}</div><div style="display:flex;align-items:center;gap:7px">${ct?`<span style="font-size:9px;color:var(--gn)">${ct.cl}</span>`:''}<span class="badge ${stmap[e.st]||'b-gr'}">${stlbl[e.st]||e.st}</span></div></div>`;}).join('')||'<div class="empty">Sem equip.</div>'}</div></div>`;

  const tabDet=`<div class="panel"><div class="ph"><div class="pt">Frota — Detalhado por Veículo/Equipamento</div></div><div class="tw"><table><thead><tr><th>Placa</th><th>Marca / Tipo</th><th>Ano</th><th>Cond.</th><th>Proprietário</th><th>KM Ini.</th><th>Contrato Ativo</th><th>OS no período</th><th>Desp. Placa</th><th>Status</th></tr></thead><tbody>
  ${equips.map(e=>{const ct=D.contratos.find(c=>c.eqId===e.id&&c.status==='ativo');const osEq=mns.filter(m=>m.eqId===e.id);const dp=desps.filter(d=>d.placa===e.placa).reduce((s,d)=>s+(d.vl||0),0);return`<tr><td><span class="tag-p">${e.placa}</span></td><td><b>${e.mk} ${e.mo}</b></td><td style="font-size:9px">${e.ano||'-'}</td><td><span class="badge ${e.cond==='novo'?'b-gn':'b-or'}">${e.cond==='novo'?'Novo':'Usado'}</span></td><td style="font-size:9px">${e.pr||'-'}</td><td style="font-size:9px">${e.km||'-'}</td><td>${ct?`<span style="font-size:9px;color:var(--gn)">${ct.cl} · ${fmt(ct.vl)}/mês</span>`:'-'}</td><td style="font-size:9px">${osEq.length?osEq.length+' OS':'-'}</td><td style="color:var(--or)">${dp?fmt(dp):'-'}</td><td>${bdg(e.st||'disponivel')}</td></tr>`;}).join('')||'<tr><td colspan="10" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  const tabAna=`<div class="panel"><div class="ph"><div class="pt">Custo Total por Veículo/Equipamento — Analítico</div></div><div class="tw"><table><thead><tr><th>Placa</th><th>Equip.</th><th>Desp. Diretas</th><th>Custo OS</th><th>Custo Total</th><th>Receita Contrato/mês</th><th>Resultado</th></tr></thead><tbody>
  ${equips.map(e=>{const ct=D.contratos.find(c=>c.eqId===e.id&&c.status==='ativo');const dp=desps.filter(d=>d.placa===e.placa).reduce((s,d)=>s+(d.vl||0),0);const os=mns.filter(m=>m.eqId===e.id&&m.custo==='mh3').reduce((s,m)=>s+(m.total||0),0);const custo=dp+os;const rec=ct?ct.vl:0;const res=rec-custo;return`<tr><td><span class="tag-p">${e.placa}</span></td><td>${e.mk} ${e.mo}</td><td style="color:var(--or)">${dp?fmt(dp):'-'}</td><td style="color:var(--yw)">${os?fmt(os):'-'}</td><td style="color:var(--red);font-weight:600">${custo?fmt(custo):'-'}</td><td style="color:var(--gn)">${rec?fmt(rec):'-'}</td><td style="color:${res>=0?'var(--gn)':'var(--red)'};font-weight:600">${(rec||custo)?fmt(res):'-'}</td></tr>`;}).join('')||'<tr><td colspan="7" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-frota-c').innerHTML=granBlock('',kpis+tabRes,kpis+tabDet,kpis+tabDet+tabAna);}


// ---- INTEGRAÇÃO CLIENTE→CONTRATO + SALDO ----
function popClientesCt(){
  const sel=document.getElementById('ct-cliente-sel');
  if(!sel) return;
  const atual=sel.value;
  sel.innerHTML='<option value="">Selecionar cliente cadastrado...</option>';
  (D.clientes||[]).forEach(c=>{
    sel.innerHTML+=`<option value="${c.id}">${c.nome} — ${c.obra||c.cnpj||''}</option>`;
  });
  if(atual) sel.value=atual;
}

function puxarDadosCliente(){
  const cid=document.getElementById('ct-cliente-sel').value;
  const c=(D.clientes||[]).find(x=>x.id===cid);
  if(!c) return;
  // Preenche automaticamente: nome, obra, cidade
  document.getElementById('ct-cl').value=c.nome;
  const ob=document.getElementById('ct-ob'); if(ob) ob.value=c.obra||'';
  toast('Dados do cliente preenchidos automaticamente','ok');
}

function calcSaldoCt(){
  const tipo=document.getElementById('ct-tipo-vl')?document.getElementById('ct-tipo-vl').value:'mensal';
  const vl=parseFloat(document.getElementById('ct-vl').value)||0;
  const dur=parseInt(document.getElementById('ct-dur').value)||0;
  const hr=parseInt(document.getElementById('ct-hr')?document.getElementById('ct-hr').value:0)||200;
  // Valor total: mensal × meses OU hora × (horas/mês × meses)
  let total=0;
  if(tipo==='mensal') total=vl*dur;
  else total=vl*hr*dur; // valor hora × horas franquia/mês × meses
  // Medições já geradas deste contrato
  const eid=document.getElementById('ct-eid').value;
  const medido=eid?D.medicoes.filter(m=>m.ctId===eid).reduce((s,m)=>s+(m.total||0),0):0;
  const saldo=total-medido;
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=fmt(v);};
  set('ct-saldo-total',total);
  set('ct-saldo-medido',medido);
  set('ct-saldo-atual',saldo);
}

function saldoContrato(ctId){
  // Calcula saldo de um contrato (usado em listagens)
  const ct=D.contratos.find(c=>c.id===ctId);
  if(!ct) return {total:0,medido:0,saldo:0};
  const dur=parseInt(ct.dur)||0;
  const vl=parseFloat(ct.vl)||0;
  const hr=parseInt(ct.hr)||200;
  const total=(ct.tipoVl==='hora')?vl*hr*dur:vl*dur;
  const medido=D.medicoes.filter(m=>m.ctId===ctId).reduce((s,m)=>s+(m.total||0),0);
  return {total,medido,saldo:total-medido};
}


