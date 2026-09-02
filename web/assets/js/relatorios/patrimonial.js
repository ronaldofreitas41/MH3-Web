// ---- RELATÓRIO PATRIMONIAL DA FROTA ----
function dadosRelFrota(){
  return D.equips.map(e=>{
    const nparc=parseInt(e.nparc)||0;
    const parcpg=parseInt(e.parcpg)||0;
    const faltam=Math.max(0,nparc-parcpg);
    return {
      placa:e.pl||e.placa||'-',
      mkmo:((e.mk||'')+' '+(e.mo||'')).trim()||'-',
      situ:e.situ||'-',
      dtLevant:e.dtLevant||'',
      vlAql:parseFloat(e.vaql)||0,
      vlQuitacao:parseFloat(e.vlQuitacao)||0,
      vlAtual:parseFloat(e.vlAtual)||0,
      vlDesval:valorDesvalorizado(e.vaql,e.daql,e.desval12,e.desval35),
      dtAql:e.daql||'',
      nparc,parcpg,faltam,
      banco:e.banco||'-'
    };
  });
}
function gerarRelFrota(){
  const dados=dadosRelFrota();
  const el=document.getElementById('relf-resultado');
  if(!dados.length){el.innerHTML='<p class="empty">Nenhum veículo/equipamento cadastrado</p>';return;}
  const totAql=dados.reduce((s,d)=>s+d.vlAql,0);
  const totQuit=dados.reduce((s,d)=>s+d.vlQuitacao,0);
  const totAtual=dados.reduce((s,d)=>s+(d.vlDesval||d.vlAtual),0);
  let h='<div class="tw"><table><thead><tr><th>Placa</th><th>Veículo/Equipamento</th><th>Situação</th><th>Dt. Aquisição</th><th>Período</th><th>Vl. Aquisição</th><th>Vl. Quitação</th><th>Vl. Desvalorizado</th><th>Parcelas</th><th>Faltam</th></tr></thead><tbody>';
  dados.forEach(d=>{
    h+=`<tr>
      <td><b>${d.placa}</b></td>
      <td style="font-size:11px">${d.mkmo}</td>
      <td style="font-size:11px">${d.situ}</td>
      <td style="font-size:11px">${fmtData(d.dtAql)}</td>
      <td style="font-size:11px"><span class="badge ${periodoDesval(d.dtAql)==='Ano 1-2'?'b-bl':'b-or'}">${periodoDesval(d.dtAql)}</span></td>
      <td>${fmt(d.vlAql)}</td>
      <td style="color:var(--or)">${fmt(d.vlQuitacao)}</td>
      <td style="color:var(--bl);font-weight:600" title="Valor calculado pela desvalorização">${fmt(d.vlDesval||d.vlAtual)}</td>
      <td style="font-size:11px">${d.parcpg}/${d.nparc}</td>
      <td style="font-weight:700;color:${d.faltam>0?'var(--red)':'var(--gn)'}">${d.faltam>0?d.faltam+'x':'Quitado'}</td>
    </tr>`;
  });
  h+=`</tbody><tfoot><tr style="font-weight:700;background:var(--cd2)">
    <td colspan="4">TOTAIS (${dados.length} veíc./equip.)</td>
    <td>${fmt(totAql)}</td><td style="color:var(--or)">${fmt(totQuit)}</td>
    <td style="color:var(--bl)">${fmt(totAtual)}</td><td colspan="2"></td>
  </tr></tfoot></table></div>`;
  el.innerHTML=h;
  auditar('RELATORIO','frota','Relatório patrimonial gerado ('+dados.length+' equipamentos)');
}
function imprimirRelFrota(){
  const dados=dadosRelFrota();
  if(!dados.length){toast('Nenhum veículo/equipamento','er');return;}
  gerarRelFrota();
  const totAql=dados.reduce((s,d)=>s+d.vlAql,0);
  const totQuit=dados.reduce((s,d)=>s+d.vlQuitacao,0);
  const totAtual=dados.reduce((s,d)=>s+(d.vlDesval||d.vlAtual),0);
  let h=`<html><head><title>Relatório Patrimonial Frota</title>
  <style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:5px;font-size:11px;text-align:left}tfoot td{font-weight:700;background:#eee}</style>
  </head><body>
  <h1>MH3 RENTAL — RELATÓRIO PATRIMONIAL DA FROTA</h1>
  <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} — ${dados.length} veíc./equip.</p>
  <table><thead><tr><th>Placa</th><th>Veículo/Equipamento</th><th>Situação</th><th>Dt. Levant.</th><th>Vl. Aquisição</th><th>Vl. Quitação</th><th>Vl. Atualizado</th><th>Parc. Pagas</th><th>Faltam</th><th>Banco</th></tr></thead><tbody>`;
  dados.forEach(d=>{
    h+=`<tr><td>${d.placa}</td><td>${d.mkmo}</td><td>${d.situ}</td><td>${fmtData(d.dtLevant)}</td><td>${fmt(d.vlAql)}</td><td>${fmt(d.vlQuitacao)}</td><td>${fmt(d.vlAtual)}</td><td>${d.parcpg}/${d.nparc}</td><td>${d.faltam>0?d.faltam+'x':'Quitado'}</td><td>${d.banco}</td></tr>`;
  });
  h+=`</tbody><tfoot><tr><td colspan="4">TOTAIS</td><td>${fmt(totAql)}</td><td>${fmt(totQuit)}</td><td>${fmt(totAtual)}</td><td colspan="3"></td></tr></tfoot></table>
  </body></html>`;
  const w=window.open('','_blank');w.document.write(h);w.document.close();
  setTimeout(()=>w.print(),500);
  auditar('IMPRESSAO','frota','Relatório patrimonial impresso');
}

window.escH=window.escH||function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
function abrirRelFrota(){openM('m-frota-rel');}

function relFrotaCompleto(){
  var eqs=D.equips||[];
  if(!eqs.length){toast('Nenhum veículo/equipamento','er');return;}
  var stl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};
  var sfl={quitado:'Quitado',financiado:'Financiado',consorcio:'Consórcio'};
  var h='<html><head><title>Relatório Completo da Frota</title><style>@page{margin:12mm}body{font-family:Arial;padding:16px;color:#222}h1{font-size:16px;margin:0 0 4px}.sub{font-size:11px;color:#666;margin-bottom:14px}.veic{border:1px solid #bbb;border-radius:6px;padding:10px;margin-bottom:12px;page-break-inside:avoid}.vh{font-size:13px;font-weight:700;border-bottom:2px solid #1E5FAA;color:#1E5FAA;padding-bottom:4px;margin-bottom:6px}.sec{font-size:10px;font-weight:700;color:#1E5FAA;text-transform:uppercase;margin:8px 0 3px}.row{display:flex;flex-wrap:wrap;gap:4px 16px;font-size:11px}.row>div{min-width:150px}.row b{color:#555;font-weight:600}</style></head><body>';
  h+='<h1>MH3 RENTAL — RELATÓRIO COMPLETO DA FROTA</h1><div class="sub">Gerado em '+new Date().toLocaleDateString('pt-BR')+' '+new Date().toLocaleTimeString('pt-BR')+' — '+eqs.length+' veíc./equip.</div>';
  eqs.forEach(function(e){
    h+='<div class="veic"><div class="vh">'+escH(e.placa)+' — '+escH(e.mk||'')+' '+escH(e.mo||'')+'</div>';
    h+='<div class="sec">Dados</div><div class="row">';
    h+='<div><b>Ano:</b> '+escH(e.ano||'-')+'</div><div><b>Status:</b> '+(stl[e.st]||e.st||'-')+'</div>';
    h+='<div><b>Condição:</b> '+(e.cond==='novo'?'Novo':'Usado')+'</div>';
    h+='<div><b>KM atual:</b> '+fmtN(kmAtualVeic(e))+'</div><div><b>Horímetro:</b> '+fmtN(hrAtualVeic(e))+' h</div>';
    h+='<div><b>Proprietário:</b> '+escH(e.pr||'-')+'</div><div><b>Empresa:</b> '+escH(e.empresa||'-')+'</div>';
    h+='<div><b>Chassi:</b> '+escH(e.ch||'-')+'</div><div><b>Renavam:</b> '+escH(e.rv||'-')+'</div><div><b>CRV:</b> '+escH(e.crv||'-')+'</div></div>';
    h+='<div class="sec">Financeiro</div><div class="row">';
    h+='<div><b>Situação:</b> '+(sfl[e.situ]||e.situ||'-')+'</div><div><b>Vl. Aquisição:</b> '+fmt(e.vaql)+'</div><div><b>Dt. Aquisição:</b> '+fmtData(e.daql)+'</div>';
    if(e.situ==='financiado'||e.situ==='consorcio'){
      h+='<div><b>Parcelas:</b> '+(e.parcpg||0)+'/'+(e.nparc||0)+'</div><div><b>Tipo:</b> '+(e.tparc==='variavel'?'Variável':'Fixa')+'</div>';
      h+='<div><b>Vl. Parcela:</b> '+fmt(e.vparc)+'</div><div><b>1ª Parcela:</b> '+fmtData(e.d1parc)+'</div><div><b>Banco:</b> '+escH(e.banco||'-')+'</div>';
    }
    h+='<div><b>Dt. Levantamento:</b> '+fmtData(e.dtLevant)+'</div><div><b>Vl. Quitação:</b> '+fmt(e.vlQuitacao)+'</div><div><b>Vl. Atualizado:</b> '+fmt(e.vlAtual)+'</div></div>';
    h+='<div class="sec">Documentos (vencimentos)</div><div class="row">';
    h+='<div><b>CRLV:</b> '+fmtData(e.crlv)+'</div><div><b>Licença/ANTT:</b> '+fmtData(e.antt)+'</div><div><b>Cronotacógrafo:</b> '+fmtData(e.crono)+'</div><div><b>Seguro:</b> '+(function(){var _s=_segAtivoVeic(e.placa);return _s?(escH(_s.seguradora||'-')+' — vence '+fmtData(_s.venc)):'SEM SEGURO';})()+'</div></div>';
    if(e.temImpl==='sim'||e.im||e.im_mk){
      h+='<div class="sec">Implemento</div><div class="row">';
      h+='<div><b>Tipo:</b> '+escH(e.im||'-')+'</div><div><b>Marca:</b> '+escH(e.im_mk||'-')+'</div><div><b>Modelo:</b> '+escH(e.im_mo||'-')+'</div><div><b>Valor:</b> '+fmt(e.im_vl)+'</div></div>';
    }
    if(e.ob){h+='<div class="sec">Observações</div><div class="row"><div style="min-width:100%">'+escH(e.ob)+'</div></div>';}
    h+='</div>';
  });
  h+='</body></html>';
  var w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(function(){w.print();},500);
  if(typeof auditar==='function')auditar('IMPRESSAO','frota','Relatório completo impresso');
}

function relFrotaSimples(){
  var eqs=D.equips||[];
  if(!eqs.length){toast('Nenhum veículo/equipamento','er');return;}
  var stl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};
  var h='<html><head><title>Relatório Simples da Frota</title><style>@page{margin:14mm}body{font-family:Arial;padding:18px}h1{font-size:16px}p{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:6px;font-size:11px;text-align:left}th{background:#1E5FAA;color:#fff}tr:nth-child(even){background:#f3f3f3}</style></head><body>';
  h+='<h1>MH3 RENTAL — RELATÓRIO SIMPLES DA FROTA</h1><p>Gerado em '+new Date().toLocaleDateString('pt-BR')+' — '+eqs.length+' veíc./equip.</p>';
  h+='<table><thead><tr><th>Placa</th><th>Marca/Modelo</th><th>Ano</th><th>Status</th><th>KM atual</th><th>Horímetro</th></tr></thead><tbody>';
  eqs.forEach(function(e){
    h+='<tr><td>'+escH(e.placa)+'</td><td>'+escH((e.mk||'')+' '+(e.mo||''))+'</td><td>'+escH(e.ano||'-')+'</td><td>'+(stl[e.st]||e.st||'-')+'</td><td>'+fmtN(kmAtualVeic(e))+'</td><td>'+fmtN(hrAtualVeic(e))+' h</td></tr>';
  });
  h+='</tbody></table></body></html>';
  var w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(function(){w.print();},500);
  if(typeof auditar==='function')auditar('IMPRESSAO','frota','Relatório simples impresso');
}

function relFrotaVencimentos(){
  var eqs=D.equips||[];
  if(!eqs.length){toast('Nenhum veículo/equipamento','er');return;}
  var hoje=new Date();hoje.setHours(0,0,0,0);
  var docs=[{k:'crlv',l:'CRLV'},{k:'antt',l:'Licença/ANTT'},{k:'crono',l:'Cronotacógrafo'},{k:'vseg',l:'Seguro'}];
  var linhas=[];
  eqs.forEach(function(e){
    docs.forEach(function(d){
      var v=e[d.k];
      if(v){var dt=new Date(v);var dias=Math.round((dt-hoje)/86400000);linhas.push({placa:e.placa,mkmo:(e.mk||'')+' '+(e.mo||''),doc:d.l,venc:v,dias:dias});}
    });
  });
  linhas.sort(function(a,b){return a.dias-b.dias;});
  var h='<html><head><title>Vencimentos de Documentos — Frota</title><style>@page{margin:14mm}body{font-family:Arial;padding:18px}h1{font-size:16px}p{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:6px;font-size:11px;text-align:left}th{background:#1E5FAA;color:#fff}.venc{background:#ffd6d6;font-weight:700}.prox{background:#fff3cd}</style></head><body>';
  h+='<h1>MH3 RENTAL — VENCIMENTOS DE DOCUMENTOS</h1><p>Gerado em '+new Date().toLocaleDateString('pt-BR')+' — '+linhas.length+' documento(s). Vermelho = vencido; amarelo = vence em até 30 dias.</p>';
  if(!linhas.length){h+='<p>Nenhum documento com data de vencimento cadastrada.</p>';}
  else{
    h+='<table><thead><tr><th>Placa</th><th>Veículo</th><th>Documento</th><th>Vencimento</th><th>Situação</th></tr></thead><tbody>';
    linhas.forEach(function(l){
      var cls=l.dias<0?'venc':(l.dias<=30?'prox':'');
      var sit=l.dias<0?('Vencido há '+Math.abs(l.dias)+' dia(s)'):(l.dias===0?'Vence hoje':('Faltam '+l.dias+' dia(s)'));
      h+='<tr class="'+cls+'"><td>'+escH(l.placa)+'</td><td>'+escH(l.mkmo)+'</td><td>'+escH(l.doc)+'</td><td>'+fmtData(l.venc)+'</td><td>'+sit+'</td></tr>';
    });
    h+='</tbody></table>';
  }
  h+='</body></html>';
  var w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(function(){w.print();},500);
  if(typeof auditar==='function')auditar('IMPRESSAO','frota','Relatório de vencimentos impresso');
}

function relFrotaPorTipo(tipo){
  var eqs=(D.equips||[]).filter(function(e){return e.st!=='vendido';});
  if(!eqs.length){ if(typeof toast==='function')toast('Nenhum veículo/equipamento','er'); return; }
  var nomes={crlv:'CRLV',antt:'Licença / ANTT',crono:'Cronotacógrafo',docManVc:'Doc. Manual',seguro:'Seguro'};
  var nome=nomes[tipo]||tipo;
  var hoje=new Date();hoje.setHours(0,0,0,0);
  var getVal=function(e){
    if(tipo==='seguro'){var s=(typeof _segAtivoVeic==='function')?_segAtivoVeic(e.placa):null;return s?(s.venc||''):'';}
    return e[tipo]||'';
  };
  var linhas=eqs.map(function(e){
    var v=getVal(e); var dias=null, sit='', cls='';
    if(v){ var dt=new Date(String(v).length===10?(v+'T00:00:00'):v); dias=Math.round((dt-hoje)/86400000);
      if(dias<0){sit='Vencido há '+Math.abs(dias)+'d';cls='venc';}
      else if(dias<=30){sit='Vence em '+dias+'d';cls='prox';}
      else {sit='Em dia';cls='';}
    } else { sit='— EM BRANCO —'; cls='branco'; }
    return {placa:e.placa||'?', mkmo:((e.mk||'')+' '+(e.mo||'')).trim(), venc:v, sit:sit, cls:cls, temData:!!v};
  });
  linhas.sort(function(a,b){ if(a.temData!==b.temData) return a.temData?1:-1; return (a.venc||'').localeCompare(b.venc||''); });
  var emBranco=linhas.filter(function(l){return !l.temData;}).length;
  var h='<html><head><title>Conferência — '+escH(nome)+'</title><style>@page{margin:14mm}body{font-family:Arial;padding:18px}h1{font-size:16px}p{font-size:11px;color:#666}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:6px;font-size:11px;text-align:left}th{background:#1E5FAA;color:#fff}.venc{background:#ffd6d6;font-weight:700}.prox{background:#fff3cd}.branco{background:#e9ecef;color:#b91c1c;font-weight:700}</style></head><body>';
  h+='<h1>MH3 RENTAL — CONFERÊNCIA DE '+escH(String(nome).toUpperCase())+'</h1>';
  h+='<p>Gerado em '+new Date().toLocaleDateString('pt-BR')+' — '+linhas.length+' veículo(s) · <b>'+emBranco+' em branco</b> (cinza). Vermelho = vencido; amarelo = vence em até 30 dias.</p>';
  h+='<table><thead><tr><th>Placa</th><th>Veículo</th><th>'+escH(nome)+'</th><th>Situação</th></tr></thead><tbody>';
  linhas.forEach(function(l){
    h+='<tr class="'+l.cls+'"><td>'+escH(l.placa)+'</td><td>'+escH(l.mkmo)+'</td><td>'+(l.venc?fmtData(l.venc):'—')+'</td><td>'+escH(l.sit)+'</td></tr>';
  });
  h+='</tbody></table></body></html>';
  var w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(function(){w.print();},500);
  if(typeof auditar==='function')auditar('IMPRESSAO','frota','Conferência por tipo ('+nome+') — '+emBranco+' em branco');
}

function gerarParcelasFaltantes(){
  var base=(D.equips||[]).filter(function(e){return (e.situ==='financiado'||e.situ==='consorcio') && parseInt(e.nparc||0)>0;});
  if(!base.length){toast('Nenhum veículo financiado/consórcio com parcelas a gerar.','er');return;}
  var jaTem=function(eq){return (D.nfs||[]).some(function(n){return n.eqId===eq.id && n.travada && n.parcela;});};
  var faltantes=base.filter(function(e){return !jaTem(e);});
  var fixas=faltantes.filter(function(e){return (e.tparc||'fixa')!=='variavel';});
  var varsPend=faltantes.length-fixas.length;
  if(!faltantes.length){toast('Todos os veículos financiados/consórcio já têm parcelas no Contas a Pagar.','ok');return;}
  if(!fixas.length){toast(varsPend+' veículo(s) de parcela variável: lance abrindo o cadastro (Editar → Salvar).','er');return;}
  if(!confirm('Gerar parcelas no Contas a Pagar para '+fixas.length+' veículo(s) que ainda não têm?'+(varsPend?' ('+varsPend+' de parcela variável serão ignorados — faça pelo cadastro)':'')+'\nOs que já têm parcelas não serão alterados.'))return;
  var total=0;
  fixas.forEach(function(e){var n=parseInt(e.nparc||0)||0;if(n>0){lancarParcelasContaPagar(e,n,'fixa',e.vparc||0,e.d1parc||'',e.banco||'',e.situ);total+=n;}});
  sv();if(typeof rdFin==='function')rdFin();if(typeof rdFrota==='function')rdFrota();
  toast(fixas.length+' veículo(s) — '+total+' parcela(s) lançada(s) no Contas a Pagar!'+(varsPend?' ('+varsPend+' variável ignorado)':''),'ok');
  if(typeof auditar==='function')auditar('LANCAMENTO','contas_pagar',total+' parcelas geradas (faltantes)');
}


