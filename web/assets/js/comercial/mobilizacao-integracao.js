// ---- MOBILIZAÇÃO ↔ CONTRATO (integração) ----
function popContratosMob(){
  const sel=document.getElementById('mob-contrato');
  if(!sel) return;
  sel.innerHTML='<option value="">Selecionar contrato...</option><option value="__avulso__">🚛 Avulso — sem contrato / veículo não cadastrado</option>';
  D.contratos.filter(c=>c.status!=='encerrado').forEach(c=>{
    sel.innerHTML+=`<option value="${c.id}">${c.placa||'?'} — ${c.cl} ${c.ob?'('+c.ob+')':''}</option>`;
  });
}

function puxarDadosContratoMob(){
  const ctId=document.getElementById('mob-contrato').value;
  var pl=document.getElementById('mob-placa'),cli=document.getElementById('mob-cliente'),loc=document.getElementById('mob-local');
  if(ctId==='__avulso__'){
    [pl,cli,loc].forEach(function(el){if(el){el.readOnly=false;el.style.background='';el.value='';}});
    if(pl)pl.placeholder='Digite a placa';if(cli)cli.placeholder='Digite o cliente';if(loc)loc.placeholder='Digite a cidade';
    return;
  }
  [pl,cli,loc].forEach(function(el){if(el){el.readOnly=true;el.style.background='var(--cd2)';}});
  const ct=D.contratos.find(c=>c.id===ctId);
  if(!ct){
    if(pl)pl.value='';if(cli)cli.value='';if(loc)loc.value='';
    return;
  }
  // Puxa automaticamente do contrato (cidade vem do cadastro do cliente)
  document.getElementById('mob-placa').value=ct.placa||'';
  document.getElementById('mob-cliente').value=ct.cl||'';
  const cliCad=(D.clientes||[]).find(c=>c.id===ct.clienteId);
  document.getElementById('mob-local').value=cliCad?(cliCad.cidade||''):'';
  toast('Dados puxados do contrato!','ok');
}

function popChecklistsMob(){
  const sel=document.getElementById('mob-checklist');
  if(!sel) return;
  sel.innerHTML='<option value="">➕ Adicionar checklist...</option>';
  (D.checklists||[]).forEach(function(c){
    sel.innerHTML+='<option value="'+c.id+'">'+(c.nm||c.nome||c.titulo||'Checklist')+'</option>';
  });
}

function carregarChecklistMob(){
  const sel=document.getElementById('mob-checklist');
  if(!sel) return;
  const clId=sel.value;
  if(!clId){return;}
  const cl=(D.checklists||[]).find(function(c){return c.id===clId;});
  if(!cl){return;}
  var nome=cl.nm||cl.nome||cl.titulo||'Checklist';
  if(mobClIs.some(function(i){return (i.grupo||'')===nome;})){ toast('Este checklist já foi adicionado.','er'); sel.value=''; return; }
  var itens=cl.items||cl.itens||cl.its||[];
  itens.forEach(function(item){
    var txt=(typeof item==='string')?item:(item.txt||item.texto||item.nome||'Item');
    mobClIs.push({id:uid(),txt:txt,ck:false,grupo:nome});
  });
  sel.value='';
  rdMobCl();
  toast('Checklist "'+nome+'" adicionado.','ok');
}
function togMobCl(id){var i=mobClIs.find(function(x){return x.id===id;});if(i){i.ck=!i.ck;rdMobCl();}}
function rmGrupoMobCl(grupo){mobClIs=mobClIs.filter(function(i){return (i.grupo||'Itens')!==grupo;});rdMobCl();}
function rdMobCl(){
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  var box=document.getElementById('mob-cl-items'); if(!box) return;
  if(!mobClIs.length){box.innerHTML='';return;}
  var ck=mobClIs.filter(function(i){return i.ck;}).length;
  var grupos={}, ordem=[];
  mobClIs.forEach(function(i){var g=i.grupo||'Itens';if(!grupos[g]){grupos[g]=[];ordem.push(g);}grupos[g].push(i);});
  var html='<div style="font-size:9px;color:var(--mt);margin-bottom:6px">'+ck+'/'+mobClIs.length+' marcados · '+ordem.length+' checklist(s)</div>';
  ordem.forEach(function(g){
    html+='<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;background:var(--cd);border:1px solid var(--br);border-radius:5px 5px 0 0;padding:4px 8px"><span style="font-size:10px;font-weight:700;color:var(--cy)">📋 '+escH(g)+'</span><button class="btn bd btn-xs" data-g="'+escH(g)+'" onclick="rmGrupoMobCl(this.dataset.g)" title="Remover este checklist">×</button></div>';
    html+=grupos[g].map(function(i){return '<label style="display:flex;align-items:center;gap:8px;padding:6px;background:var(--cd2);border:1px solid var(--br);border-top:none;font-size:12px;cursor:pointer"><input type="checkbox" '+(i.ck?'checked':'')+' onclick="togMobCl(\''+i.id+'\')"> <span style="'+(i.ck?'text-decoration:line-through;color:var(--mt)':'')+'">'+escH(i.txt)+'</span></label>';}).join('');
    html+='</div>';
  });
  box.innerHTML=html;
}

function imprimirMob(id, comFotos, detalhada){
  if(detalhada===undefined)detalhada=true;
  const m=D.mobilizacoes.find(x=>x.id===id);
  if(!m){toast('Mobilização não encontrada','er');return;}
  const stLbl={aguardando:'⏳ Aguardando',vigente:'🟢 Vigente',finalizado:'✅ Finalizado'};
  const tipoLbl=m.tipo==='desmobilizacao'?'DESMOBILIZAÇÃO':'MOBILIZAÇÃO';
  let htmlImp=`<html><head><title>${tipoLbl} ${m.placa}</title>
    <style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}h1{font-size:18px}h3{font-size:14px;margin-top:16px}table{width:100%;border-collapse:collapse;margin:10px 0}td,th{border:1px solid #ccc;padding:6px;font-size:12px;text-align:left}img{max-width:200px;margin:5px;border-radius:4px}.vazio{color:#999}</style>
    </head><body>
    <h1>MH3 RENTAL — ${tipoLbl}</h1>
    <table>
      <tr><th>Tipo</th><td>${tipoLbl}</td><th>Status</th><td>${stLbl[m.status]||m.status||'-'}</td></tr>
      <tr><th>Placa</th><td>${m.placa||'-'}</td><th>Cliente</th><td>${m.cliente||'-'}</td></tr>
      <tr><th>Cidade</th><td>${m.local||'-'}</td><th>Saída</th><td>${fmtData(m.saida)}</td></tr>
      ${m.tipo==='desmobilizacao'||m.chegada?`<tr><th>Chegada/Retorno</th><td colspan="3">${fmtData(m.chegada)}</td></tr>`:''}
    </table>`;
  // PNEUS: regra geral — DETALHADA mostra TODOS os campos (preenchidos ou não)
  if(detalhada){
    const px=m.pneus||{};
    const nomes={p1:'1º Eixo',p2:'2º Eixo',p3:'3º Eixo',p4:'4º Eixo',pe:'🛞 Estepe'};
    htmlImp+='<h3>Pneus por Eixo (completo)</h3><table><tr><th>Eixo</th><th>Marca</th><th>Nº MH3</th><th>Medida</th><th>Reformado</th></tr>';
    ['p1','p2','p3','p4','pe'].forEach(p=>{
      const d=px[p]||{};
      const tem=d.mk||d.num||d.med;
      htmlImp+=`<tr${tem?'':' class="vazio"'}><td>${nomes[p]}</td><td>${d.mk||'—'}</td><td>${d.num||'—'}</td><td>${d.med||'—'}</td><td>${d.ref==='sim'?'Sim':'Não'}</td></tr>`;
    });
    htmlImp+='</table>';
    // Observações sempre na detalhada (mesmo vazia)
    htmlImp+=`<h3>Observações</h3><p>${m.obs||'<span class="vazio">— sem observações —</span>'}</p>`;
  }
  // Fotos (opcional, só na detalhada)
  if(detalhada&&comFotos&&m.fotos&&m.fotos.length){
    htmlImp+='<h3>Fotos ('+m.fotos.length+')</h3>';
    m.fotos.forEach(f=>{htmlImp+=`<img src="${f}">`;});
  }
  htmlImp+=`<p style="margin-top:20px;font-size:10px;color:#666">Impresso em ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} — Modo: ${detalhada?'DETALHADO':'SIMPLIFICADO'}</p>`;
  htmlImp+='</body></html>';
  const w=window.open('','_blank');
  w.document.write(htmlImp);
  w.document.close();
  setTimeout(()=>w.print(),500);
}

function perguntarImprimirMob(id){
  const m=D.mobilizacoes.find(x=>x.id===id);
  const detalhada=confirm('📄 TIPO DE IMPRESSÃO\n\nOK = DETALHADA (pneus, checklist, observações)\nCancelar = SIMPLIFICADA (dados básicos)');
  let comFotos=false;
  if(detalhada&&m&&m.fotos&&m.fotos.length>0){
    comFotos=confirm('Incluir as fotos?\n\nOK = Com fotos\nCancelar = Sem fotos');
  }
  auditar('IMPRESSAO','mobilizacao',(detalhada?'Detalhada':'Simplificada')+(comFotos?' com fotos':'')+': '+(m?m.placa:id));
  imprimirMob(id, comFotos, detalhada);
}

