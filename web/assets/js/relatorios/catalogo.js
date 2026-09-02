// ---- RELATÓRIOS GERENCIAIS (4 tipos) ----

// ======== CATÁLOGO COMPLETO DE RELATÓRIOS (todos os módulos + extras de mercado) ========
const REL_HOJE = ()=>new Date().toISOString().substring(0,10);
const REL_CATALOGO = {
  // ===================== FINANCEIRO =====================
  'fat-cliente':{label:'Faturamento por Cliente',cat:'💰 Financeiro',perm:'fin',build:(noP)=>{
    const g={};(D.medicoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.vc||(m.ms?m.ms+'-01':''))).forEach(m=>{const k=m.cl||m.cliente||'(sem cliente)';g[k]=g[k]||{q:0,t:0};g[k].q++;g[k].t+=(m.total||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].q,fmt(g[k].t)];});
    return {cols:['Cliente','Qtd Medições','Total Faturado'],linhas,total};}},
  'desp-cat':{label:'Despesas por Categoria',cat:'💰 Financeiro',perm:'fin',build:(noP)=>{
    const g={};(D.despesas||[]).filter(d=>!d.antigo&&noP(d.vc||d.dt)).forEach(d=>{const k=d.cat||d.categoria||'(sem categoria)';g[k]=g[k]||{q:0,t:0};g[k].q++;g[k].t+=(parseFloat(d.vl||d.total||d.valor)||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].q,fmt(g[k].t)];});
    return {cols:['Categoria','Qtd','Total'],linhas,total};}},
  'desp-forn':{label:'Despesas por Fornecedor',cat:'💰 Financeiro',perm:'fin',build:(noP)=>{
    const g={};(D.despesas||[]).filter(d=>!d.antigo&&noP(d.vc||d.dt)).forEach(d=>{const k=d.forn||d.fornecedor||'(sem fornecedor)';g[k]=g[k]||{q:0,t:0};g[k].q++;g[k].t+=(parseFloat(d.vl||d.total||d.valor)||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].q,fmt(g[k].t)];});
    return {cols:['Fornecedor','Qtd','Total'],linhas,total};}},
  'cpagar':{label:'Contas a Pagar (detalhado)',cat:'💰 Financeiro',perm:'cpagar',build:(noP)=>{
    let total=0;const itens=[...(D.despesas||[]).map(d=>({...d,_t:'Despesa'})),...(D.nfs||[]).map(n=>({...n,_t:'NF'}))].filter(x=>noP(x.vc||x.dt));
    const linhas=itens.sort((a,b)=>String(a.vc||'').localeCompare(String(b.vc||''))).map(x=>{const v=parseFloat(x.vl||x.total||x.valor)||0;total+=v;return [x.desc||x.descricao||x.forn||'-',x.forn||x.fornecedor||'-',fmtData(x.vc)||'-',(x.st==='pago'?'✅ Pago'+(x.contaBanco?' ('+x.contaBanco+')':''):'⏳ Pendente'),fmt(v)];});
    return {cols:['Descrição','Fornecedor','Vencimento','Status','Valor'],linhas,total};}},
  'cpagar-venc':{label:'Contas a Pagar VENCIDAS',cat:'💰 Financeiro',perm:'cpagar',build:(noP)=>{
    const hoje=REL_HOJE();let total=0;const itens=[...(D.despesas||[]),...(D.nfs||[])].filter(x=>x.st!=='pago'&&x.vc&&x.vc<hoje&&noP(x.vc));
    const linhas=itens.sort((a,b)=>String(a.vc).localeCompare(String(b.vc))).map(x=>{const v=parseFloat(x.vl||x.total||x.valor)||0;total+=v;const dias=Math.floor((new Date(hoje)-new Date(x.vc))/86400000);return [x.desc||x.descricao||x.forn||'-',x.forn||x.fornecedor||'-',fmtData(x.vc),dias+' dias',fmt(v)];});
    return {cols:['Descrição','Fornecedor','Venceu em','Atraso','Valor'],linhas,total};}},
  'creceber':{label:'Contas a Receber (detalhado)',cat:'💰 Financeiro',perm:'creceber',build:(noP)=>{
    let total=0;const itens=[...(D.medicoes||[]).map(m=>({...m,_t:'Medição',cli:m.cl||m.cliente})),...(D.vendas||[]).map(v=>({...v,_t:'Venda'}))].filter(x=>noP(x.vc||(x.ms?x.ms+'-01':'')));
    const linhas=itens.sort((a,b)=>String(a.vc||'').localeCompare(String(b.vc||''))).map(x=>{const v=(x.total||0);total+=v;return [x.cli||x.cl||'-',x._t,fmtData(x.vc)||'-',((x.st==='pago'||x.st==='paga')?'✅ Recebido'+(x.contaBanco?' ('+x.contaBanco+')':''):'⏳ Pendente'),fmt(v)];});
    return {cols:['Cliente','Origem','Vencimento','Status','Valor'],linhas,total};}},
  'creceber-venc':{label:'Contas a Receber VENCIDAS (inadimplência)',cat:'💰 Financeiro',perm:'creceber',build:(noP)=>{
    const hoje=REL_HOJE();let total=0;const itens=[...(D.medicoes||[]).map(m=>({...m,cli:m.cl||m.cliente})),...(D.vendas||[])].filter(x=>x.st!=='pago'&&x.st!=='paga'&&x.vc&&x.vc<hoje&&noP(x.vc));
    const linhas=itens.sort((a,b)=>String(a.vc).localeCompare(String(b.vc))).map(x=>{const v=(x.total||0);total+=v;const dias=Math.floor((new Date(hoje)-new Date(x.vc))/86400000);return [x.cli||x.cl||'-',fmtData(x.vc),dias+' dias',fmt(v)];});
    return {cols:['Cliente','Venceu em','Atraso','Valor'],linhas,total};}},
  'fluxo-resumo':{label:'Resumo de Fluxo (Entradas x Saídas)',cat:'💰 Financeiro',perm:'fin',build:(noP)=>{
    const ent=[...(D.medicoes||[]).map(m=>({d:m.vc,v:m.total})),...(D.vendas||[]).map(v=>({d:v.vc,v:v.total}))].filter(x=>noP(x.d)).reduce((s,x)=>s+(x.v||0),0);
    const sai=[...(D.despesas||[]),...(D.nfs||[])].filter(x=>noP(x.vc||x.dt)).reduce((s,x)=>s+(parseFloat(x.vl||x.total||x.valor)||0),0);
    return {cols:['Movimento','Valor'],linhas:[['🟢 Entradas (a receber/recebido)',fmt(ent)],['🔴 Saídas (a pagar/pago)',fmt(sai)],['💵 Resultado do período',fmt(ent-sai)]],total:null};}},
  'saldo-banco':{label:'Saldo por Conta Bancária',cat:'💰 Financeiro',perm:'fin',build:()=>{
    let total=0;const linhas=(D.contasBanco||[]).map(c=>{const s=(c.saldo||0)+(c.saldoPA||0);total+=s;return [c.nome,c.banco||'-',(c.tipo||'-'),fmt(c.saldo||0),fmt(c.saldoPA||0),fmt(s)];});
    return {cols:['Conta','Banco','Tipo','Saldo','Poup./Aplic.','Total'],linhas,total};}},
  'dre':{label:'Resultado Gerencial (Receitas − Despesas)',cat:'💰 Financeiro',perm:'fin',build:(noP)=>{
    const rec=(D.medicoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.vc||(m.ms?m.ms+'-01':''))).reduce((s,m)=>s+(m.total||0),0)+(D.vendas||[]).filter(v=>!v.antigo&&noP(v.vc)).reduce((s,v)=>s+(v.total||0),0);
    const desp=(D.despesas||[]).filter(d=>!d.antigo&&noP(d.vc||d.dt)).reduce((s,d)=>s+(parseFloat(d.vl||d.total||d.valor)||0),0);
    const manut=(D.manutencoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.dt||m.data||m.en)).reduce((s,m)=>s+(parseFloat(m.total)||0),0);
    return {cols:['Conta','Valor'],linhas:[['(+) Receitas (medições/vendas)',fmt(rec)],['(−) Despesas',fmt(desp)],['(−) Manutenções',fmt(manut)],['(=) Resultado',fmt(rec-desp-manut)]],total:null};}},
  'resultado-placa':{label:'Resultado por Veículo/Placa',cat:'💰 Financeiro',perm:'resultado',build:(noP)=>{
    const g={};const add=(pl,campo,v)=>{if(!pl)return;const k=pl;g[k]=g[k]||{rec:0,desp:0,man:0};g[k][campo]+=v;};
    (D.medicoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.vc)).forEach(m=>add(m.placa,'rec',m.total||0));
    (D.despesas||[]).filter(d=>!d.antigo&&noP(d.vc||d.dt)).forEach(d=>add(d.placa,'desp',parseFloat(d.vl||d.total||d.valor)||0));
    (D.manutencoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.dt||m.data||m.en)).forEach(m=>add(m.placa,'man',parseFloat(m.total)||0));
    let total=0;const linhas=Object.keys(g).sort((a,b)=>(g[b].rec-g[b].desp-g[b].man)-(g[a].rec-g[a].desp-g[a].man)).map(k=>{const r=g[k].rec-g[k].desp-g[k].man;total+=r;return [k,fmt(g[k].rec),fmt(g[k].desp+g[k].man),fmt(r)];});
    return {cols:['Placa','Receita','Gastos','Resultado'],linhas,total};}},
  'investimentos':{label:'Investimentos / Consórcios',cat:'💰 Financeiro',perm:'fin',build:()=>{
    let total=0;const linhas=(D.investimentos||[]).map(i=>{const vc=parseFloat(i.valorCarta||i.valor||0)||0;total+=vc;return [i.desc||'-',(i.tipo||'-'),(i.adm||'-'),((i.parcpg||0)+'/'+(i.nparc||'-')),fmt(parseFloat(i.vparc||0)||0),fmt(vc)];});
    return {cols:['Descrição','Tipo','Administradora','Parcelas','Vlr Parcela','Vlr Carta/Total'],linhas,total};}},

  // ===================== FROTA & MANUTENÇÃO =====================
  'frota-lista':{label:'Frota — Inventário Completo',cat:'🚛 Frota & Manutenção',perm:'frota',build:()=>{
    const linhas=(D.equips||[]).map(e=>[e.placa||e.pl||'-',(e.mk||'')+' '+(e.mo||''),e.an||'-',(e.empresa||'-'),(e.st||e.situacao||'-')]);
    return {cols:['Placa','Marca/Modelo','Ano','Empresa','Situação'],linhas,total:null};}},
  'frota-situacao':{label:'Frota por Situação',cat:'🚛 Frota & Manutenção',perm:'frota',build:()=>{
    const g={};(D.equips||[]).forEach(e=>{const k=e.st||e.situacao||'(sem situação)';g[k]=(g[k]||0)+1;});
    const linhas=Object.keys(g).sort((a,b)=>g[b]-g[a]).map(k=>[k,g[k]]);
    return {cols:['Situação','Quantidade'],linhas,total:null};}},
  'manut-veic':{label:'Manutenções por Veículo',cat:'🚛 Frota & Manutenção',perm:'manut',build:(noP)=>{
    const g={};(D.manutencoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.dt||m.data||m.en)).forEach(m=>{const k=m.placa||'(sem placa)';g[k]=g[k]||{q:0,t:0};g[k].q++;g[k].t+=(parseFloat(m.total)||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].q,fmt(g[k].t)];});
    return {cols:['Placa','Qtd OS','Custo Total'],linhas,total};}},
  'manut-tipo':{label:'Manutenções por Tipo',cat:'🚛 Frota & Manutenção',perm:'manut',build:(noP)=>{
    const g={};(D.manutencoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.dt||m.data||m.en)).forEach(m=>{const k=m.tipo||'(sem tipo)';g[k]=g[k]||{q:0,t:0};g[k].q++;g[k].t+=(parseFloat(m.total)||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].q,fmt(g[k].t)];});
    return {cols:['Tipo de OS','Qtd','Custo Total'],linhas,total};}},
  'manut-aberto':{label:'OS em Aberto / Aguardando',cat:'🚛 Frota & Manutenção',perm:'manut',build:()=>{
    const linhas=(D.manutencoes||[]).filter(m=>m.st!=='concluida').map(m=>[m.placa||'-',(m.tipo||'-'),(m.st||'-'),fmtData(m.en||m.dt||m.data)||'-',fmt(parseFloat(m.total)||0)]);
    return {cols:['Placa','Tipo','Status','Entrada','Custo'],linhas,total:null};}},
  'pneus-dot':{label:'Pneus com DOT acima de 5 anos',cat:'🚛 Frota & Manutenção',perm:'pneus',build:()=>{
    const venc=(typeof pneusDotVencidos==='function')?pneusDotVencidos():[];
    const linhas=venc.sort((a,b)=>{const ia=pneuIdadeDot(a.dot),ib=pneuIdadeDot(b.dot);return (ib?ib.idade:0)-(ia?ia.idade:0);}).map(p=>{const i=pneuIdadeDot(p.dot);return [p.num,(p.mk||'')+' '+(p.mo||''),p.med||'',p.dot||'',i?i.ano:'-',(i?i.idade:'?')+' anos',p.st||'-'];});
    return {cols:['Nº MH3','Marca/Modelo','Medida','DOT','Ano Fab.','Idade','Situação'],linhas,total:null};}},
  'pneus-situacao':{label:'Pneus por Situação',cat:'🚛 Frota & Manutenção',perm:'pneus',build:()=>{
    const g={};(D.pneus||[]).forEach(p=>{const k=p.st||'(sem situação)';g[k]=(g[k]||0)+1;});
    const linhas=Object.keys(g).sort((a,b)=>g[b]-g[a]).map(k=>[k,g[k]]);
    return {cols:['Situação','Quantidade'],linhas,total:null};}},
  'mobilizacoes':{label:'Mobilizações por Período',cat:'🚛 Frota & Manutenção',perm:'mob',build:(noP)=>{
    const linhas=(D.mobilizacoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.data||m.dt)).sort((a,b)=>String(b.data||'').localeCompare(String(a.data||''))).map(m=>[fmtData(m.data||m.dt)||'-',m.placa||'-',m.cliente||m.cli||'-',m.cidade||'-',(m.tipo||'-')]);
    return {cols:['Data','Placa','Cliente','Cidade','Tipo'],linhas,total:null};}},

  // ===================== COMERCIAL =====================
  'contratos-ativos':{label:'Contratos Ativos',cat:'📋 Comercial',perm:'cts',build:()=>{
    const linhas=(D.contratos||[]).filter(c=>c.st!=='encerrado'&&c.st!=='cancelado').map(c=>[c.cliente||c.cl||'-',c.placa||'-',fmtData(c.inicio||c.dt)||'-',(c.st||'ativo'),fmt(parseFloat(c.vl||c.valor)||0)]);
    return {cols:['Cliente','Placa','Início','Status','Valor'],linhas,total:null};}},
  'medicoes-periodo':{label:'Medições por Período',cat:'📋 Comercial',perm:'meds',build:(noP)=>{
    let total=0;const linhas=(D.medicoes||[]).filter(m=>!m.antigo&&!ehImpressao(m)&&noP(m.vc||(m.ms?m.ms+'-01':''))).sort((a,b)=>String(b.vc||'').localeCompare(String(a.vc||''))).map(m=>{total+=(m.total||0);return [m.cl||m.cliente||'-',m.numMed?'Nº'+String(m.numMed).padStart(3,'0'):'-',m.placa||'-',fmtData(m.vc)||'-',((m.st==='pago'||m.st==='paga')?'✅':'⏳'),fmt(m.total||0)];});
    return {cols:['Cliente','Medição','Placa','Vencimento','St','Valor'],linhas,total};}},
  'vendas-periodo':{label:'Vendas por Período',cat:'📋 Comercial',perm:'vend',build:(noP)=>{
    let total=0;const linhas=(D.vendas||[]).filter(v=>!v.antigo&&noP(v.vc||v.dt)).sort((a,b)=>String(b.dt||b.vc||'').localeCompare(String(a.dt||a.vc||''))).map(v=>{total+=(v.total||0);return [v.cli||'-',fmtData(v.dt||v.vc)||'-',((v.st==='pago'||v.st==='paga')?'✅':'⏳'),fmt(v.total||0)];});
    return {cols:['Cliente','Data','St','Valor'],linhas,total};}},

  // ===================== PESSOAS =====================
  'ajuda-mot':{label:'Ajudas de Custo por Motorista',cat:'👥 Pessoas',perm:'cts',build:(noP)=>{
    const g={};(D.ajudasMotorista||[]).filter(a=>!a.antigo&&noP(a.data)).forEach(a=>{const k=a.motorista||'(sem nome)';g[k]=g[k]||{e:a.empresa||'-',q:0,t:0};g[k].q++;g[k].t+=(a.valor||0);});
    let total=0;const linhas=Object.keys(g).sort((a,b)=>g[b].t-g[a].t).map(k=>{total+=g[k].t;return [k,g[k].e,g[k].q,fmt(g[k].t)];});
    return {cols:['Motorista','Empresa','Qtd','Total'],linhas,total};}},
  'func-lista':{label:'Funcionários — Lista',cat:'👥 Pessoas',perm:'func',build:()=>{
    const linhas=(D.funcionarios||[]).map(f=>[f.nome||'-',(f.funcao||f.cargo||'-'),f.tel||f.telefone||'-',fmtData(f.nasc||f.nascimento)||'-']);
    return {cols:['Nome','Função','Telefone','Nascimento'],linhas,total:null};}},
  'aniversariantes':{label:'Aniversariantes do Mês',cat:'👥 Pessoas',perm:'func',build:()=>{
    const mes=new Date().getMonth()+1;const linhas=(D.funcionarios||[]).filter(f=>{const n=f.nasc||f.nascimento;return n&&parseInt(String(n).substring(5,7))===mes;}).sort((a,b)=>String(a.nasc||a.nascimento).substring(8,10).localeCompare(String(b.nasc||b.nascimento).substring(8,10))).map(f=>{const n=f.nasc||f.nascimento;return [f.nome||'-',(f.funcao||f.cargo||'-'),String(n).substring(8,10)+'/'+String(n).substring(5,7)];});
    return {cols:['Nome','Função','Aniversário'],linhas,total:null};}}
};
function popRelTipos(){
  const sel=document.getElementById('relg-tipo'); if(!sel)return;
  const admin=(typeof ehAdminAtual==='function')?ehAdminAtual():true;
  const perms=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};
  const podeVer=(p)=>admin||!!perms[p]||!!perms['rel'];
  const cats={};
  Object.keys(REL_CATALOGO).forEach(k=>{const r=REL_CATALOGO[k];if(!podeVer(r.perm))return;(cats[r.cat]=cats[r.cat]||[]).push({k,label:r.label});});
  let html='';
  Object.keys(cats).forEach(cat=>{html+='<optgroup label="'+cat+'">'+cats[cat].map(o=>'<option value="'+o.k+'">'+o.label+'</option>').join('')+'</optgroup>';});
  sel.innerHTML=html||'<option value="">(Sem relatórios liberados)</option>';
}

function popRelSubmenu(){
  const cont=document.getElementById('rel-submenu'); if(!cont)return;
  const nacc=cont.previousElementSibling;
  const admin=(typeof ehAdminAtual==='function')?ehAdminAtual():true;
  const perms=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};
  const podeVer=(p)=>admin||!!perms[p]||!!perms['rel']||!!perms['relatorios'];
  const cats={};
  Object.keys(REL_CATALOGO).forEach(k=>{const r=REL_CATALOGO[k];if(!podeVer(r.perm))return;(cats[r.cat]=cats[r.cat]||[]).push({k,label:r.label});});
  const catKeys=Object.keys(cats);
  if(!catKeys.length){ cont.innerHTML=''; if(nacc&&nacc.classList&&nacc.classList.contains('nacc'))nacc.style.display='none'; return; }
  if(nacc&&nacc.classList&&nacc.classList.contains('nacc'))nacc.style.display='';
  let h='<a class="ni" href="?p=relatorios" onclick="go(\'relatorios\');return false;" title="Abrir a central de relatórios"><span class="ic">📊</span>Central de Relatórios</a>';
  catKeys.forEach(cat=>{
    h+='<div style="font-size:9px;font-weight:800;color:var(--mt);text-transform:uppercase;letter-spacing:.5px;padding:8px 14px 2px;opacity:.65">'+cat+'</div>';
    cats[cat].forEach(o=>{ h+='<div class="ni" onclick="abrirRelatorio(\''+o.k+'\')" title="'+o.label+'"><span class="ic">📄</span>'+o.label+'</div>'; });
  });
  cont.innerHTML=h;
}
function abrirRelatorio(key){
  go('relatorios');
  setTimeout(()=>{
    const sel=document.getElementById('relg-tipo');
    if(sel){ sel.value=key; }
    if(typeof gerarRelGerencial==='function') gerarRelGerencial();
  },90);
}


function dadosRelGerencial(){
  const de=document.getElementById('relg-de').value;
  const ate=document.getElementById('relg-ate').value;
  const noP=(d)=>{if(!de&&!ate)return true;if(!d)return false;if(de&&d<de)return false;if(ate&&d>ate)return false;return true;};
  const tipo=document.getElementById('relg-tipo').value;
  const rel=REL_CATALOGO[tipo];
  if(!rel){return {titulo:'',cols:[],linhas:[],total:0};}
  const r=rel.build(noP);
  return {titulo:rel.label, cols:r.cols, linhas:r.linhas, total:r.total};
}
function gerarRelGerencial(){
  const r=dadosRelGerencial();
  const el=document.getElementById('relg-resultado');
  if(!r.linhas.length){el.innerHTML='<p class="empty">Nenhum dado para este relatório/período</p>';return;}
  let h=`<h4 style="margin:6px 0">${r.titulo}</h4><div class="tw"><table><thead><tr>${r.cols.map(c=>'<th>'+c+'</th>').join('')}</tr></thead><tbody>`;
  r.linhas.forEach(l=>{h+='<tr>'+l.map((v,i)=>`<td${(r.total!==null&&i===l.length-1)?' style="font-weight:600;color:var(--gn)"':''}>${v}</td>`).join('')+'</tr>';});
  if(r.total!==null){h+=`</tbody><tfoot><tr style="font-weight:700;background:var(--cd2)"><td colspan="${r.cols.length-1}">TOTAL</td><td style="color:var(--gn)">${fmt(r.total)}</td></tr></tfoot></table></div>`;}
  else{h+='</tbody></table></div>';}
  el.innerHTML=h;
  auditar('RELATORIO','relatorios','Relatório gerencial: '+r.titulo);
}
function imprimirRelGerencial(){
  const r=dadosRelGerencial();
  if(!r.linhas.length){toast('Nenhum dado para imprimir','er');return;}
  let h=`<html><head><title>${r.titulo}</title><style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:6px;font-size:12px;text-align:left}tfoot td{font-weight:700;background:#eee}</style></head><body>
  <h1>MH3 RENTAL — ${r.titulo}</h1><p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
  <table><thead><tr>${r.cols.map(c=>'<th>'+c+'</th>').join('')}</tr></thead><tbody>
  ${r.linhas.map(l=>'<tr>'+l.map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')}
  </tbody>${r.total!==null?'<tfoot><tr><td colspan="'+(r.cols.length-1)+'">TOTAL</td><td>'+fmt(r.total)+'</td></tr></tfoot>':''}</table>
  </body></html>`;
  const w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(()=>w.print(),500);
  auditar('IMPRESSAO','relatorios','Relatório gerencial impresso: '+r.titulo);
}

