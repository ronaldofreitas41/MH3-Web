// ---- SAÍDA DE MATERIAL (Almoxarifado, nota mensal) ----
function mesAtualSM(){
  const el=document.getElementById('sm-mes');
  return (el&&el.value)?el.value:new Date().toISOString().substring(0,7);
}
function rdSaidaMaterial(){
  // Popula produtos da categoria Almoxarifado
  const sel=document.getElementById('sm-prod');
  if(sel){
    const atual=sel.value;
    sel.innerHTML='<option value="">Selecionar produto...</option>';
    D.estoque.filter(e=>(e.cat||'').toLowerCase().includes('almoxarifado')).forEach(e=>{
      sel.innerHTML+=`<option value="${e.id}">${e.cd?e.cd+' — ':''}${e.ds} (estoque: ${e.qt||0})</option>`;
    });
    if(atual)sel.value=atual;
  }
  const dtEl=document.getElementById('sm-dt');
  if(dtEl&&!dtEl.value)dtEl.value=new Date().toISOString().substring(0,10);
  const mesEl=document.getElementById('sm-mes');
  if(mesEl&&!mesEl.value)mesEl.value=new Date().toISOString().substring(0,7);
  // Render nota do mês
  const mes=mesAtualSM();
  const tb=document.getElementById('sm-tb');
  if(!tb)return;
  const itens=(D.saidasMaterial||[]).filter(s=>s.dt&&s.dt.startsWith(mes));
  const fechada=(D.saidasMaterial||[]).some(s=>s.dt&&s.dt.startsWith(mes)&&s.fechada);
  const total=itens.reduce((s,i)=>s+(i.qtd*i.vlUnit),0);
  tb.innerHTML=itens.length?itens.map(s=>`<tr>
    <td style="font-size:11px">${fmtData(s.dt)}</td>
    <td><b>${s.prodNome}</b></td>
    <td>${s.qtd}</td>
    <td>${fmt(s.vlUnit)}</td>
    <td style="color:var(--or);font-weight:600">${fmt(s.qtd*s.vlUnit)}</td>
    <td>${s.fechada?'🔒':`<button class="btn bd btn-xs" onclick="delSaidaMaterial('${s.id}')" title="Excluir lançamento">×</button>`}</td>
  </tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhuma saída lançada neste mês</td></tr>';
  const tEl=document.getElementById('sm-total');if(tEl)tEl.textContent=fmt(total);
  const stEl=document.getElementById('sm-status');
  if(stEl)stEl.textContent=fechada?'🔒 NOTA FECHADA — já lançada como despesa':'📂 Nota ABERTA (fecha no último dia do mês ou pelo botão Fechar Mês)';
}
function addSaidaMaterial(){
  const prodId=document.getElementById('sm-prod').value;
  const qtd=parseFloat(document.getElementById('sm-qtd').value)||0;
  const dt=document.getElementById('sm-dt').value;
  if(!prodId){toast('Selecione o produto (categoria Almoxarifado)','er');return;}
  if(!qtd||qtd<=0){toast('Informe a quantidade','er');return;}
  if(!dt){toast('Informe a data','er');return;}
  const prod=D.estoque.find(e=>e.id===prodId);
  if(!prod){toast('Produto não encontrado','er');return;}
  if((prod.qt||0)<qtd){toast('Estoque insuficiente! Disponível: '+(prod.qt||0),'er');return;}
  const mes=dt.substring(0,7);
  if((D.saidasMaterial||[]).some(s=>s.dt&&s.dt.startsWith(mes)&&s.fechada)){
    toast('🔒 A nota deste mês já foi FECHADA. Não é possível lançar.','er');return;
  }
  // Baixa do estoque + lançamento na nota
  prod.qt=(prod.qt||0)-qtd;
  D.saidasMaterial.push({
    id:uid(),dt,prodId,prodNome:prod.ds,cod:prod.cd||'',
    qtd,vlUnit:parseFloat(prod.cv)||0,fechada:false
  });
  auditar('CRIACAO','saida_material','Saída: '+qtd+'x '+prod.ds+' ('+fmtData(dt)+')');
  document.getElementById('sm-qtd').value='';
  sv();rdSaidaMaterial();rdEstq&&rdEstq();
  toast('Saída lançada! Estoque baixado.','ok');
}
function delSaidaMaterial(id){
  reqSenha(()=>{
    const s=(D.saidasMaterial||[]).find(x=>x.id===id);
    if(!s)return;
    if(s.fechada){toast('Nota fechada não pode ser alterada','er');return;}
    if(!confirm('Excluir este lançamento? A quantidade volta ao estoque.'))return;
    const prod=D.estoque.find(e=>e.id===s.prodId);
    if(prod)prod.qt=(prod.qt||0)+s.qtd;
    D.saidasMaterial=D.saidasMaterial.filter(x=>x.id!==id);
    auditar('EXCLUSAO','saida_material','Saída excluída: '+s.qtd+'x '+s.prodNome);
    sv();rdSaidaMaterial();
    toast('Lançamento excluído, estoque devolvido','ok');
  });
}
function fecharNotaMes(){
  const mes=mesAtualSM();
  const itens=(D.saidasMaterial||[]).filter(s=>s.dt&&s.dt.startsWith(mes)&&!s.fechada);
  if(!itens.length){toast('Nenhum lançamento aberto neste mês','er');return;}
  const total=itens.reduce((s,i)=>s+(i.qtd*i.vlUnit),0);
  reqSenha(()=>{
    if(!confirm('FECHAR a nota de '+mes+'?\n\nTotal: '+fmt(total)+'\nSerá lançado como DESPESA (−) nos resultados da empresa.\nApós o fechamento não pode mais lançar neste mês.'))return;
    itens.forEach(s=>s.fechada=true);
    // Lança como despesa nos resultados
    const ultimoDia=new Date(parseInt(mes.substring(0,4)),parseInt(mes.substring(5,7)),0).getDate();
    D.despesas.push({
      id:uid(),desc:'CONSUMO ALMOXARIFADO — '+mes,cat:'Almoxarifado',
      vl:total,dt:mes+'-'+String(ultimoDia).padStart(2,'0'),vc:mes+'-'+String(ultimoDia).padStart(2,'0'),
      st:'pendente',fluxo:'sim',cp:'sim',forn:'Almoxarifado MH3',origemSM:mes
    });
    auditar('FECHAMENTO','saida_material','Nota '+mes+' FECHADA: '+fmt(total)+' lançado como despesa');
    sv();rdSaidaMaterial();
    toast('🔒 Nota fechada! '+fmt(total)+' lançado como despesa nos resultados.','ok');
  });
}
function verNotaMes(){
  const mes=mesAtualSM();
  const itens=(D.saidasMaterial||[]).filter(s=>s.dt&&s.dt.startsWith(mes));
  if(!itens.length){toast('Nenhum lançamento neste mês','er');return;}
  rdSaidaMaterial();
  toast('🔍 Nota de '+mes+' exibida na tabela ('+itens.length+' lançamentos)','ok');
}
function imprimirNotaMes(){
  const mes=mesAtualSM();
  const itens=(D.saidasMaterial||[]).filter(s=>s.dt&&s.dt.startsWith(mes));
  if(!itens.length){toast('Nenhum lançamento neste mês para imprimir','er');return;}
  const total=itens.reduce((s,i)=>s+(i.qtd*i.vlUnit),0);
  const fechada=itens.some(s=>s.fechada);
  // Agrupa por produto (somatório)
  const porProd={};
  itens.forEach(s=>{
    if(!porProd[s.prodNome])porProd[s.prodNome]={qtd:0,vlUnit:s.vlUnit,cod:s.cod};
    porProd[s.prodNome].qtd+=s.qtd;
  });
  let h=`<html><head><title>Nota Almoxarifado ${mes}</title>
  <style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}h1{font-size:18px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:6px;font-size:12px;text-align:left}</style>
  </head><body>
  <h1>MH3 RENTAL — NOTA DE SAÍDA DE MATERIAL (ALMOXARIFADO)</h1>
  <p><b>Mês:</b> ${mes} | <b>Status:</b> ${fechada?'🔒 FECHADA':'📂 ABERTA'}</p>
  <h3>Resumo por Produto</h3>
  <table><tr><th>Código</th><th>Produto</th><th>Qtd Total</th><th>Valor Unit.</th><th>Total</th></tr>`;
  Object.keys(porProd).forEach(p=>{
    const d=porProd[p];
    h+=`<tr><td>${d.cod||'-'}</td><td>${p}</td><td>${d.qtd}</td><td>${fmt(d.vlUnit)}</td><td>${fmt(d.qtd*d.vlUnit)}</td></tr>`;
  });
  h+=`</table>
  <h3>Lançamentos Detalhados</h3>
  <table><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Total</th></tr>`;
  itens.forEach(s=>{h+=`<tr><td>${fmtData(s.dt)}</td><td>${s.prodNome}</td><td>${s.qtd}</td><td>${fmt(s.qtd*s.vlUnit)}</td></tr>`;});
  h+=`</table>
  <p style="font-size:16px"><b>TOTAL DO MÊS: ${fmt(total)}</b></p>
  <p style="font-size:10px;color:#666">Impresso em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
  </body></html>`;
  const w=window.open('','_blank');
  w.document.write(h);w.document.close();
  setTimeout(()=>w.print(),500);
  auditar('IMPRESSAO','saida_material','Nota '+mes+' impressa');
}

