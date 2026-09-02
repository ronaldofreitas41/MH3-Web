// ---- RELATÓRIO ANALÍTICO POR PERÍODO ----
function coletarRelPeriodo(){
  const de=document.getElementById('relp-de').value;
  const ate=document.getElementById('relp-ate').value;
  const tipo=document.getElementById('relp-tipo').value;
  if(!de||!ate){toast('Informe o período (De e Até)','er');return null;}
  const noPeriodo=(d)=>d&&d>=de&&d<=ate;
  let receber=[],pagar=[];
  if(tipo!=='pagar'){
    receber=[...D.medicoes.filter(m=>noPeriodo(m.vc||m.ms?(m.vc||m.ms+'-01'):'')).map(m=>({dt:m.vc||(m.ms+'-01'),cli:m.cl,desc:'Medição'+(m.numMed?' Nº'+String(m.numMed).padStart(3,'0'):''),placa:m.placa||'',vl:m.total||0,st:m.st})),
             ...D.vendas.filter(v=>noPeriodo(v.vc||v.dt)).map(v=>({dt:v.vc||v.dt,cli:v.cli,desc:'Venda '+(v.num?'VD-'+v.num:''),placa:'',vl:v.total||0,st:v.st}))];
  }
  if(tipo!=='receber'){
    pagar=[...D.despesas.filter(d=>noPeriodo(d.vc||d.dt)).map(d=>({dt:d.vc||d.dt,cli:d.forn||'',desc:d.desc,placa:d.placa||'',vl:parseFloat(d.vl)||0,st:d.st})),
           ...D.nfs.filter(n=>noPeriodo(n.vc||n.dt)).map(n=>({dt:n.vc||n.dt,cli:n.forn||'',desc:'NF '+(n.num||''),placa:'',vl:parseFloat(n.vl)||0,st:n.st||'pendente'}))];
  }
  receber.sort((a,b)=>(a.dt||'').localeCompare(b.dt||''));
  pagar.sort((a,b)=>(a.dt||'').localeCompare(b.dt||''));
  return {de,ate,tipo,receber,pagar};
}
function gerarRelPeriodo(){
  const r=coletarRelPeriodo();
  if(!r)return;
  const el=document.getElementById('relp-resultado');
  const totR=r.receber.reduce((s,x)=>s+x.vl,0);
  const totP=r.pagar.reduce((s,x)=>s+x.vl,0);
  let h='';
  const tabela=(itens,titulo,cor)=>{
    if(!itens.length)return '';
    let t=`<h4 style="margin:10px 0 6px;color:${cor}">${titulo} (${itens.length})</h4>
    <div class="tw"><table><thead><tr><th>Venc.</th><th>Cliente/Fornec.</th><th>Descrição</th><th>Placa</th><th>Valor</th><th>Status</th></tr></thead><tbody>`;
    itens.forEach(x=>{t+=`<tr><td style="font-size:11px">${fmtData(x.dt)}</td><td>${x.cli||'-'}</td><td style="font-size:11px">${x.desc||'-'}</td><td style="font-size:11px">${x.placa||'-'}</td><td style="color:${cor};font-weight:600">${fmt(x.vl)}</td><td style="font-size:10px">${x.st||'-'}</td></tr>`;});
    t+='</tbody></table></div>';
    return t;
  };
  if(r.tipo!=='pagar')h+=tabela(r.receber,'💰 A RECEBER — Total: '+fmt(totR),'var(--gn)');
  if(r.tipo!=='receber')h+=tabela(r.pagar,'💸 A PAGAR — Total: '+fmt(totP),'var(--red)');
  if(r.tipo==='tudo')h+=`<div style="margin-top:10px;padding:12px;background:var(--rg);border-radius:8px;text-align:right;font-size:15px"><b>SALDO DO PERÍODO: <span style="color:${totR-totP>=0?'var(--gn)':'var(--red)'}">${fmt(totR-totP)}</span></b></div>`;
  el.innerHTML=h||'<p class="empty">Nenhum lançamento no período</p>';
  auditar('RELATORIO','relatorios','Relatório período '+fmtData(r.de)+' a '+fmtData(r.ate)+' ('+r.tipo+')');
}
function imprimirRelPeriodo(){
  const r=coletarRelPeriodo();
  if(!r)return;
  gerarRelPeriodo();
  const conteudo=document.getElementById('relp-resultado').innerHTML;
  const w=window.open('','_blank');
  w.document.write(`<html><head><title>Relatório ${fmtData(r.de)} a ${fmtData(r.ate)}</title>
  <style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{border:1px solid #ccc;padding:5px;font-size:11px;text-align:left}h1{font-size:16px}h4{margin:12px 0 4px}</style></head><body>
  <h1>MH3 RENTAL — RELATÓRIO ANALÍTICO POR PERÍODO</h1>
  <p><b>Período:</b> ${fmtData(r.de)} a ${fmtData(r.ate)} | <b>Tipo:</b> ${r.tipo==='tudo'?'Receber + Pagar':r.tipo==='receber'?'Somente a Receber':'Somente a Pagar'}</p>
  ${conteudo}
  <p style="font-size:10px;color:#666;margin-top:16px">Impresso em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
  </body></html>`);
  w.document.close();
  setTimeout(()=>w.print(),500);
  auditar('IMPRESSAO','relatorios','Relatório por período impresso');
}

function rdRelResGeral(){
  const el=document.getElementById('rel-resgeral-c');
  if(!el) return;
  const totRec=D.medicoes.filter(m=>m.st==='paga').reduce((s,m)=>s+(m.total||0),0)+D.vendas.filter(v=>v.st==='pago').reduce((s,v)=>s+(v.total||0),0);
  const totOS=D.manutencoes.filter(m=>!ehImpressao(m)).reduce((s,m)=>s+((m.lancs||[]).reduce((ss,l)=>ss+l.qtd*l.val,0)),0);
  const totDesp=D.despesas.reduce((s,d)=>s+(parseFloat(d.vl)||0),0);
  const totNf=D.nfs.filter(n=>n.cp==='sim').reduce((s,n)=>s+(parseFloat(n.vl)||0),0);
  // PREJUÍZOS (atrasados) entram como NEGATIVO no resultado geral
  const totPrej=(typeof totalPrejuizos==='function')?totalPrejuizos():0;
  const res=totRec-totOS-totDesp-totNf-totPrej;
  el.innerHTML=`<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px">
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">RECEITAS TOTAIS</div><div style="font-size:20px;font-weight:700;color:var(--gn)">${fmt(totRec)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">CUSTOS OS</div><div style="font-size:20px;font-weight:700;color:var(--red)">−${fmt(totOS)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">DESPESAS</div><div style="font-size:20px;font-weight:700;color:var(--red)">−${fmt(totDesp)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">NF/COMPRAS</div><div style="font-size:20px;font-weight:700;color:var(--red)">−${fmt(totNf)}</div></div>
    <div class="kpi" style="border-color:var(--red)"><div style="font-size:10px;color:var(--mt)">⚠️ PREJUÍZOS (atrasados)</div><div style="font-size:20px;font-weight:700;color:var(--red)">−${fmt(totPrej)}</div></div>
    <div class="kpi" style="border-color:${res>=0?'var(--gn)':'var(--red)'}"><div style="font-size:10px;color:var(--mt)">RESULTADO GERAL</div><div style="font-size:20px;font-weight:700;color:${res>=0?'var(--gn)':'var(--red)'}">${fmt(res)}</div></div>
  </div>
  <p style="font-size:11px;color:var(--mt);margin-top:10px">Fórmula: Receitas − Custos OS − Despesas − NF/Compras − Prejuízos = Resultado Geral</p>`;
}

