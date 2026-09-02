// ---- MÓDULO PNEUS ----

// ---- DOT DOS PNEUS (idade e alerta acima de 5 anos) ----
function pneuIdadeDot(dot){
  if(!dot)return null;
  const d=String(dot).replace(/\D/g,'');
  if(d.length<2)return null;
  const yy=parseInt(d.slice(-2),10);
  if(isNaN(yy))return null;
  const ano=2000+yy;
  const idade=new Date().getFullYear()-ano;
  if(idade<0||idade>40)return null;
  return {ano,idade};
}
function pneuDotBadge(dot){
  const info=pneuIdadeDot(dot);
  if(!info)return (dot||'-');
  const alerta=info.idade>5;
  return `${dot} <span style="font-size:9px;font-weight:700;color:${alerta?'#fff':'var(--mt)'};background:${alerta?'var(--red)':'transparent'};padding:${alerta?'1px 5px':'0'};border-radius:3px">${info.idade} ${info.idade===1?'ano':'anos'}${alerta?' ⚠️':''}</span>`;
}
function pneusDotVencidos(){
  return (D.pneus||[]).filter(p=>{const i=pneuIdadeDot(p.dot);return i&&i.idade>5;});
}
function rdPneusAlerta(){
  const el=document.getElementById('pneu-alerta-dot');
  if(!el)return;
  const venc=pneusDotVencidos();
  if(!venc.length){el.innerHTML='';return;}
  el.innerHTML=`<div class="panel" style="border:2px solid var(--red);margin-bottom:12px">
    <div class="ph"><div class="pt">⚠️ Pneus com DOT acima de 5 anos (${venc.length})</div>
      <button class="btn bw btn-sm" onclick="imprimirPneusDot()" title="Imprimir lista">🖨 Imprimir</button></div>
    <div class="pb">
      <p style="font-size:11px;color:var(--mt);margin-bottom:8px">Estes pneus têm fabricação (DOT) acima de 5 anos — atenção à segurança e troca.</p>
      <div class="tw"><table>
        <thead><tr><th>Nº MH3</th><th>Marca / Tipo</th><th>Medida</th><th>DOT</th><th>Ano Fab.</th><th>Idade</th><th>Situação</th><th>Local</th></tr></thead>
        <tbody>${venc.map(p=>{const i=pneuIdadeDot(p.dot);return `<tr style="background:rgba(220,50,50,0.06)">
          <td><b>${p.num}</b></td><td style="font-size:11px">${p.mk} ${p.mo}</td><td>${p.med}</td>
          <td>${p.dot}</td><td>${i.ano}</td><td style="color:var(--red);font-weight:700">${i.idade} anos</td>
          <td><span class="badge b-yw">${p.st||'-'}</span></td><td style="font-size:10px">${p.local||'-'}</td></tr>`;}).join('')}</tbody>
      </table></div>
    </div></div>`;
}
function relatorioPneus(criterio){
  criterio=criterio||'situacao';
  var P=D.pneus||[];
  if(!P.length){if(typeof toast==='function')toast('Nenhum pneu cadastrado','er');return;}
  function escH(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  var rotSit={estoque:'Em estoque',reforma:'Em reforma',aplicado:'Aplicados em veículos',vendido:'Vendidos',inutilizado:'Inutilizados'};
  function chave(p){
    if(criterio==='medida')return p.med||'(sem medida)';
    if(criterio==='marca')return p.mk||'(sem marca)';
    if(criterio==='tipo')return p.mo||'(sem tipo)';
    if(criterio==='condicao')return p.cond||'(sem condição)';
    return p.st||'estoque';
  }
  function rotuloGrupo(k){ return criterio==='situacao'?(rotSit[k]||k):k; }
  var titulos={situacao:'por Situação',medida:'por Medida',marca:'por Marca',tipo:'por Tipo',condicao:'por Condição'};
  function detalhe(p){
    if(p.st==='aplicado')return 'Placa '+(p.placa||'-')+(p.osNum?' (OS '+p.osNum+')':'')+(p.dtAplic?' — desde '+p.dtAplic:'');
    if(p.st==='reforma')return (p.reformadora||'-')+(p.dtSaida?' — saiu '+p.dtSaida:'')+(p.prevRetorno?' — prev. retorno '+p.prevRetorno:'');
    if(p.st==='vendido')return 'Venda '+(p.vdNum||'-')+(p.dtVenda?' — '+p.dtVenda:'');
    if(p.st==='inutilizado')return 'Baixado'+(p.local?' — '+p.local:'');
    return p.local||'Estoque';
  }
  var grupos={};P.forEach(function(p){var k=chave(p);(grupos[k]=grupos[k]||[]).push(p);});
  var chaves=Object.keys(grupos).sort();
  if(criterio==='situacao')chaves=['estoque','reforma','aplicado','vendido','inutilizado'].filter(function(k){return grupos[k];});
  var total=P.length;
  var h='<html><head><title>Relatorio de Pneus - MH3 RENTAL</title><style>@page{margin:14mm}body{font-family:Arial;padding:20px;color:#111}h1{font-size:17px;margin:0 0 4px}h2{font-size:13px;margin:18px 0 6px;padding:5px 8px;background:#f1f5f9;border-left:4px solid #2563eb}.sub{color:#555;font-size:12px;margin-bottom:10px}.kpis{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 4px}.kpi{border:1px solid #ddd;border-radius:6px;padding:6px 12px;font-size:11px;text-align:center}.kpi b{font-size:16px;display:block;margin-bottom:2px}table{width:100%;border-collapse:collapse;margin-top:4px}td,th{border:1px solid #ccc;padding:5px 6px;font-size:11px;text-align:left}th{background:#f8fafc}@media print{body{padding:0}}</style></head><body>';
  h+='<h1>MH3 RENTAL — Relatório de Pneus ('+escH(titulos[criterio]||'')+')</h1>';
  h+='<div class="sub">Gerado em '+new Date().toLocaleString('pt-BR')+'</div>';
  h+='<div class="kpis">';
  chaves.forEach(function(k){h+='<div class="kpi"><b>'+grupos[k].length+'</b>'+escH(rotuloGrupo(k))+'</div>';});
  h+='<div class="kpi" style="border-color:#111;border-width:2px"><b>'+total+'</b>Total cadastrado</div>';
  h+='</div>';
  chaves.forEach(function(k){
    var arr=grupos[k];
    h+='<h2>'+escH(rotuloGrupo(k))+' — '+arr.length+' pneu(s)</h2>';
    h+='<table><thead><tr><th>Nº MH3</th><th>Marca</th><th>Tipo</th><th>Medida</th><th>DOT</th><th>Condição</th><th>Situação</th><th>Detalhe / Local</th></tr></thead><tbody>';
    arr.forEach(function(p){
      h+='<tr><td>'+escH(p.num)+'</td><td>'+escH(p.mk)+'</td><td>'+escH(p.mo)+'</td><td>'+escH(p.med)+'</td><td>'+escH(p.dot||'-')+'</td><td>'+escH(p.cond||'-')+'</td><td>'+escH(rotSit[p.st]||p.st||'-')+'</td><td>'+escH(detalhe(p))+'</td></tr>';
    });
    h+='</tbody></table>';
  });
  h+='</body></html>';
  var w=window.open('','_blank');
  if(!w){if(typeof toast==='function')toast('Permita pop-ups para imprimir o relatório.','er');return;}
  w.document.write(h);w.document.close();setTimeout(function(){w.print();},500);
}
function abrirRelPneus(){ if(typeof openM==='function')openM('m-pneu-rel'); }
function gerarRelPneus(){
  var sel=document.getElementById('pneu-rel-criterio');
  var c=sel?sel.value:'situacao';
  if(typeof closeM==='function')closeM('m-pneu-rel');
  relatorioPneus(c);
}

function imprimirPneusDot(){
  const venc=pneusDotVencidos();
  if(!venc.length){toast('Nenhum pneu com DOT vencido','er');return;}
  let h=`<html><head><title>Pneus DOT acima de 5 anos</title><style>@page{margin:15mm}@media print{body{padding:0!important}}body{font-family:Arial;padding:20px}h1{font-size:16px}table{width:100%;border-collapse:collapse;margin-top:10px}td,th{border:1px solid #ccc;padding:6px;font-size:12px;text-align:left}</style></head><body>
  <h1>MH3 RENTAL — Pneus com DOT acima de 5 anos</h1><p>Gerado em ${new Date().toLocaleDateString('pt-BR')} — ${venc.length} pneu(s)</p>
  <table><thead><tr><th>Nº MH3</th><th>Marca / Tipo</th><th>Medida</th><th>DOT</th><th>Ano Fab.</th><th>Idade</th><th>Situação</th><th>Local</th></tr></thead><tbody>
  ${venc.map(p=>{const i=pneuIdadeDot(p.dot);return '<tr><td>'+p.num+'</td><td>'+p.mk+' '+p.mo+'</td><td>'+p.med+'</td><td>'+p.dot+'</td><td>'+i.ano+'</td><td>'+i.idade+' anos</td><td>'+(p.st||'-')+'</td><td>'+(p.local||'-')+'</td></tr>';}).join('')}
  </tbody></table></body></html>`;
  const w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(()=>w.print(),500);
}

function rdPneusPend(){
  var tb=document.getElementById('pneu-pend-tb'); if(!tb) return;
  var pend=(D.pneus_pend||[]).filter(function(p){return p.st!=='resolvida' && (p.qtd||0)>(p.feitos||0);});
  pend.sort(function(a,b){return (b.data||'').localeCompare(a.data||'');});
  if(!pend.length){ tb.innerHTML='<tr><td colspan="6" class="empty">Nenhuma entrada pendente de pneus 🎉</td></tr>'; return; }
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  tb.innerHTML=pend.map(function(p){
    var restante=(p.qtd||0)-(p.feitos||0);
    return '<tr>'+
      '<td><span class="tag-p">'+escH(p.placa||'-')+'</span></td>'+
      '<td><b>'+escH(p.osNum||'-')+'</b></td>'+
      '<td style="font-size:10px">'+(p.data&&typeof fmtData==='function'?fmtData(p.data):(p.data||'-'))+'</td>'+
      '<td><b style="color:var(--or)">'+restante+'</b> de '+(p.qtd||0)+' a dar entrada</td>'+
      '<td style="font-size:10px;color:var(--gn)">'+(p.feitos||0)+' feito(s)</td>'+
      '<td><button class="btn bp btn-xs" onclick="darEntradaPneu(\''+p.id+'\')">📥 Dar entrada</button></td>'+
      '</tr>';
  }).join('');
}
function updPneuPendCnt(){
  var n=(D.pneus_pend||[]).filter(function(p){return p.st!=='resolvida' && (p.qtd||0)>(p.feitos||0);}).reduce(function(s,p){return s+((p.qtd||0)-(p.feitos||0));},0);
  var b=document.getElementById('pneu-pend-badge');
  if(b){ b.textContent=n; b.style.display=n>0?'':'none'; }
}
function darEntradaPneu(pendId){
  var pend=(D.pneus_pend||[]).find(function(x){return x.id===pendId;});
  if(!pend){toast('Pendência não encontrada.','er');return;}
  if((pend.feitos||0)>=(pend.qtd||0)){toast('Esta pendência já foi totalmente atendida.','ok');return;}
  if(typeof openM==='function')openM('m-pneu-ent'); else document.getElementById('m-pneu-ent').classList.add('op');
  window._pneuPendId=pendId;
  var ide=document.getElementById('pneu-edit-id'); if(ide)ide.value='';
  ['pneu-num','pneu-dot','pneu-mk','pneu-mo','pneu-med','pneu-vl'].forEach(function(i){var el=document.getElementById(i);if(el)el.value='';});
  var dt=document.getElementById('pneu-dt'); if(dt)dt.value=(typeof today==='function')?today():'';
  var cond=document.getElementById('pneu-cond'); if(cond)cond.value='usado';
  var ob=document.getElementById('pneu-ob'); if(ob)ob.value='Pneu retirado da placa '+(pend.placa||'')+' (OS '+(pend.osNum||'')+')';
  var btn=document.getElementById('pneu-ent-btn'); if(btn)btn.textContent='Registrar Entrada do Pneu Retirado';
}
function rdPneus(){
  (function(){var P=D.pneus||[];var byst={};P.forEach(function(p){var s=p.st||'estoque';byst[s]=(byst[s]||0)+1;});var est=byst['estoque']||0;var ref=byst['reforma']||0;var his=(D.pneus_hist||[]).length;var e1=document.getElementById('cnt-pneu-est');if(e1)e1.textContent='('+est+')';var e2=document.getElementById('cnt-pneu-ref');if(e2)e2.textContent='('+ref+')';var e3=document.getElementById('cnt-pneu-hist');if(e3)e3.textContent='('+his+')';var rz=document.getElementById('pneu-resumo');if(rz){function _bd(c,t,n){return '<span style="background:'+c+';color:#fff;border-radius:6px;padding:3px 9px;font-size:11px;font-weight:600;white-space:nowrap">'+t+' '+n+'</span>';}rz.innerHTML='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;align-items:center">'+_bd('#16a34a','📦 Em estoque:',est)+_bd('#2563eb','🔧 Em reforma:',ref)+_bd('#0891b2','🚛 Aplicados:',byst['aplicado']||0)+_bd('#64748b','💰 Vendidos:',byst['vendido']||0)+_bd('#dc2626','🗑️ Inutilizados:',byst['inutilizado']||0)+'<span style="background:transparent;color:var(--tx,#334155);border:1px solid var(--bd,#cbd5e1);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:700;white-space:nowrap">Σ Total cadastrado: '+P.length+'</span></div>';}})();
  if(typeof rdPneusAlerta==='function')rdPneusAlerta();
  if(typeof rdPneusPend==='function')rdPneusPend();
  if(typeof updPneuPendCnt==='function')updPneuPendCnt();
  var _pb=document.getElementById('pneu-perm-btn'); if(_pb)_pb.style.display=(typeof ehAdminAtual==='function'&&ehAdminAtual())?'inline-block':'none';
  // Populate plate selector in saída modal
  const sel=document.getElementById('psai-placa');
  if(sel){
    sel.innerHTML='<option value="">Selecionar...</option>';
    D.equips.filter(e=>e.st!=='vendido').forEach(e=>{
      sel.innerHTML+=`<option value="${e.placa}">${e.placa} — ${e.mk} ${e.mo}</option>`;
    });
  }
  // Estoque tab
  const estqTb=document.getElementById('pneu-estq-tb');
  if(estqTb){
    const estq=D.pneus.filter(p=>p.st==='estoque');
    estqTb.innerHTML=estq.length?estq.map(p=>`<tr>
      <td><b>${p.num}</b></td>
      <td>${p.mk}</td>
      <td style="font-size:11px">${p.mo}</td>
      <td>${p.med}</td>
      <td style="font-size:10px">${pneuDotBadge(p.dot)}</td>
      <td><span class="badge ${p.cond==='novo'?'b-gn':p.cond==='reformado'?'b-bl':'b-yw'}">${p.cond}</span></td>
      <td style="font-size:10px">${p.local||'Estoque'}</td>
      <td style="display:flex;gap:4px">
        ${(typeof temAcesso==='function'&&temAcesso('pneu-edit'))?`<button class="btn bw btn-xs" onclick="editPneu('${p.id}')" title="Editar pneu">✏️</button>`:''}
        <button class="btn bg btn-xs" onclick="pneuReforma('${p.id}')">🔧 Reforma</button>
        <button class="btn bd btn-xs" onclick="pneuBaixa('${p.id}')">× Baixa</button>
      </td>
    </tr>`).join(''):'<tr><td colspan="8" class="empty">Nenhum pneu em estoque</td></tr>';
  }
  // Reforma tab
  const reformTb=document.getElementById('pneu-reform-tb');
  if(reformTb){
    const reform=D.pneus.filter(p=>p.st==='reforma');
    reformTb.innerHTML=reform.length?reform.map(p=>`<tr>
      <td><b>${p.num}</b></td>
      <td>${p.mk}</td>
      <td>${p.med}</td>
      <td>${p.reformadora||'-'}</td>
      <td style="font-size:10px">${p.dtSaida||'-'}</td>
      <td style="font-size:10px">${p.prevRetorno||'-'}</td>
      <td><button class="btn bg btn-xs" onclick="pneuRetornoReforma('${p.id}')">✓ Retornou</button></td>
    </tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhum pneu em reforma</td></tr>';
  }
  // Histórico
  const histTb=document.getElementById('pneu-hist-tb');
  if(histTb){
    const podeEdH=(typeof temAcesso==='function'&&temAcesso('pneu-edit'));
    const hist=(D.pneus_hist||[]).map((h,idx)=>({h:h,idx:idx})).reverse().slice(0,50);
    histTb.innerHTML=hist.length?hist.map(o=>{var h=o.h;return `<tr>
      <td>${h.num}</td>
      <td><span class="badge ${h.tipo==='entrada'?'b-gn':h.tipo==='reforma'?'b-bl':'b-rd'}">${h.tipo}</span></td>
      <td>${h.destino||'-'}</td>
      <td style="font-size:10px">${h.dt||'-'}</td>
      <td style="font-size:10px">${h.obs||'-'}</td>
      <td>${podeEdH?`<button class="btn bw btn-xs" onclick="editLancPneu(${o.idx})" title="Editar lançamento">✏️</button>`:''}</td>
    </tr>`;}).join(''):'<tr><td colspan="6" class="empty">Sem histórico</td></tr>';
  }
}

function toggleSaiTipo(){
  const t=document.getElementById('psai-tipo').value;
  const placaBox=document.getElementById('psai-placa-box');
  if(placaBox) placaBox.style.display='none';
  document.getElementById('psai-reforma-box').style.display=t==='reforma'?'block':'none';
}

function savePneuEnt(){
  const editId=((document.getElementById('pneu-edit-id')||{}).value||'').trim();
  const num=document.getElementById('pneu-num').value.trim();
  const mk=document.getElementById('pneu-mk').value.trim();
  const mo=document.getElementById('pneu-mo').value.trim();
  const med=document.getElementById('pneu-med').value.trim();
  const dot=document.getElementById('pneu-dot').value.trim();
  if(!num||!mk||!med||!dot){toast('Preencha todos os campos obrigatórios','er');return;}
  if(editId){
    // ===== MODO EDIÇÃO (requer autorização "Editar pneus do estoque") =====
    if(typeof temAcesso==='function' && !temAcesso('pneu-edit')){ toast('Você não tem autorização para editar pneus.','er'); return; }
    const p=D.pneus.find(x=>x.id===editId);
    if(!p){ toast('Pneu não encontrado.','er'); return; }
    if(D.pneus.find(x=>x.num===num && x.id!==editId)){ toast('Número MH3 já cadastrado em outro pneu.','er'); return; }
    p.num=num; p.mk=mk; if(p.saiuReforma)p.mo=mo; p.med=med; p.dot=dot;
    p.cond=document.getElementById('pneu-cond').value;
    p.vl=document.getElementById('pneu-vl').value;
    p.dt=document.getElementById('pneu-dt').value;
    p.ob=document.getElementById('pneu-ob').value;
    if(typeof auditar==='function')auditar('ALTERACAO','pneus','Pneu editado: '+num+(authUser?(' por '+authUser.nome):''));
    document.getElementById('pneu-edit-id').value='';
    sv();closeM('m-pneu-ent');toast('Pneu atualizado!','ok');rdPneus();
    return;
  }
  // ===== MODO ENTRADA (novo pneu) =====
  if(!mo){toast('Selecione o tipo do pneu','er');return;}
  if(D.pneus.find(p=>p.num===num)){toast('Número MH3 já cadastrado','er');return;}
  const pneu={
    id:uid(),num,mk,mo,med,dot,
    cond:document.getElementById('pneu-cond').value,
    vl:document.getElementById('pneu-vl').value,
    dt:document.getElementById('pneu-dt').value,
    ob:document.getElementById('pneu-ob').value,
    st:'estoque',local:'Estoque'
  };
  D.pneus.push(pneu);
  D.pneus_hist.push({num,tipo:'entrada',destino:'Estoque',dt:pneu.dt,obs:pneu.ob});
  if(window._pneuPendId){var _pp=(D.pneus_pend||[]).find(function(x){return x.id===window._pneuPendId;});if(_pp){_pp.feitos=(_pp.feitos||0)+1;if(_pp.feitos>=_pp.qtd)_pp.st='resolvida';}window._pneuPendId=null;if(typeof updPneuPendCnt==='function')updPneuPendCnt();}
  sv();closeM('m-pneu-ent');toast('Pneu registrado no estoque!');rdPneus();
}

// Abre o modal em modo ENTRADA (limpo) — garante que não fica em modo edição.
function abrirEntradaPneu(){
  window._pneuPendId=null;
  ['pneu-num','pneu-dot','pneu-mk','pneu-mo','pneu-med','pneu-vl','pneu-ob'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
  var ec=document.getElementById('pneu-cond'); if(ec)ec.value='novo';
  (function(){var moSel=document.getElementById('pneu-mo');if(moSel){Array.prototype.slice.call(moSel.querySelectorAll('option[data-legado]')).forEach(function(o){o.remove();});moSel.disabled=false;moSel.title='';moSel.value='';}})();
  var ide=document.getElementById('pneu-edit-id'); if(ide)ide.value='';
  var tit=document.querySelector('#m-pneu-ent .mt2'); if(tit)tit.textContent='📥 Entrada de Pneu';
  var btn=document.getElementById('pneu-ent-btn'); if(btn)btn.textContent='Registrar Entrada';
  openM('m-pneu-ent');
}

// Abre o modal em modo EDIÇÃO de um pneu do estoque (requer autorização).
function editPneu(id){if(_bloqEditar('pneus'))return;
  if(typeof temAcesso==='function' && !temAcesso('pneu-edit')){ toast('Você não tem autorização para editar pneus.','er'); return; }
  var p=(D.pneus||[]).find(function(x){return x.id===id;});
  if(!p){ toast('Pneu não encontrado.','er'); return; }
  document.getElementById('pneu-num').value=p.num||'';
  document.getElementById('pneu-dot').value=p.dot||'';
  document.getElementById('pneu-mk').value=p.mk||'';
  (function(){var moSel=document.getElementById('pneu-mo');if(!moSel)return;Array.prototype.slice.call(moSel.querySelectorAll('option[data-legado]')).forEach(function(o){o.remove();});if(p.mo&&!Array.prototype.some.call(moSel.options,function(o){return o.value===p.mo;})){var op=document.createElement('option');op.value=p.mo;op.textContent=p.mo;op.setAttribute('data-legado','1');moSel.appendChild(op);}moSel.value=p.mo||'';moSel.disabled=!p.saiuReforma;moSel.title=p.saiuReforma?'':'O tipo só pode ser alterado em pneus que voltaram da reformadora';})();
  document.getElementById('pneu-med').value=p.med||'';
  document.getElementById('pneu-cond').value=p.cond||'novo';
  document.getElementById('pneu-vl').value=p.vl||'';
  document.getElementById('pneu-dt').value=p.dt||'';
  document.getElementById('pneu-ob').value=p.ob||'';
  var ide=document.getElementById('pneu-edit-id'); if(ide)ide.value=id;
  var tit=document.querySelector('#m-pneu-ent .mt2'); if(tit)tit.textContent='✏️ Editar Pneu';
  var btn=document.getElementById('pneu-ent-btn'); if(btn)btn.textContent='Salvar Alterações';
  openM('m-pneu-ent');
}

// ===== EDITAR LANÇAMENTO DO HISTÓRICO (requer autorização "pneu-edit") =====
function editLancPneu(idx){if(_bloqEditar('pneus'))return;
  if(typeof temAcesso==='function' && !temAcesso('pneu-edit')){ toast('Você não tem autorização para editar lançamentos.','er'); return; }
  var h=(D.pneus_hist||[])[idx];
  if(!h){ toast('Lançamento não encontrado.','er'); return; }
  document.getElementById('lanc-idx').value=idx;
  document.getElementById('lanc-num').value=h.num||'';
  document.getElementById('lanc-tipo').value=h.tipo||'entrada';
  document.getElementById('lanc-destino').value=h.destino||'';
  document.getElementById('lanc-dt').value=h.dt||'';
  document.getElementById('lanc-obs').value=h.obs||'';
  openM('m-pneu-lanc');
}
function saveLancPneu(){
  if(typeof temAcesso==='function' && !temAcesso('pneu-edit')){ toast('Sem autorização.','er'); return; }
  var idx=parseInt(document.getElementById('lanc-idx').value);
  var h=(D.pneus_hist||[])[idx];
  if(!h){ toast('Lançamento não encontrado.','er'); return; }
  h.num=document.getElementById('lanc-num').value.trim();
  h.tipo=document.getElementById('lanc-tipo').value;
  h.destino=document.getElementById('lanc-destino').value.trim();
  h.dt=document.getElementById('lanc-dt').value;
  h.obs=document.getElementById('lanc-obs').value.trim();
  if(typeof auditar==='function')auditar('ALTERACAO','pneus','Lançamento de pneu editado: '+h.num+(authUser?(' por '+authUser.nome):''));
  sv(); closeM('m-pneu-lanc'); toast('Lançamento atualizado!','ok'); rdPneus();
}
function excluirLancPneu(){
  if(typeof temAcesso==='function' && !temAcesso('pneu-edit')){ toast('Sem autorização.','er'); return; }
  var idx=parseInt(document.getElementById('lanc-idx').value);
  var h=(D.pneus_hist||[])[idx];
  if(!h){ return; }
  if(!confirm('Excluir este lançamento do histórico? Essa ação não pode ser desfeita.'))return;
  D.pneus_hist.splice(idx,1);
  if(typeof auditar==='function')auditar('EXCLUSAO','pneus','Lançamento de pneu excluído: '+(h.num||'')+(authUser?(' por '+authUser.nome):''));
  sv(); closeM('m-pneu-lanc'); toast('Lançamento excluído.','ok'); rdPneus();
}

// ===== SELECIONAR QUAIS USUÁRIOS PODEM EDITAR PNEUS (admin) =====
function abrirPermPneu(){
  if(typeof ehAdminAtual==='function' && !ehAdminAtual()){ toast('Apenas o administrador pode alterar permissões.','er'); return; }
  var lista=document.getElementById('pneu-perm-list');
  var us=(D.usuarios||[]);
  if(!us.length){ lista.innerHTML='<div style="font-size:12px;color:var(--mt)">Nenhum usuário cadastrado. Cadastre usuários em <b>Usuários</b>.</div>'; }
  else{
    lista.innerHTML=us.map(function(u){
      var marcado=!!(u.perms&&u.perms['pneu-edit']);
      var ehAdm=(u.pf==='admin');
      return '<div class="perm-row" style="display:flex;justify-content:space-between;align-items:center;padding:9px 4px;border-bottom:1px solid var(--br)">'
        +'<div><div style="font-size:13px;font-weight:600">'+(u.nm||'-')+'</div><div style="font-size:10px;color:var(--mt)">'+(u.lg||'')+(ehAdm?' · admin (sempre pode)':'')+'</div></div>'
        +(ehAdm?'<span class="badge b-gn">✓ sempre</span>':'<div class="toggle'+(marcado?' on':'')+'" data-uid="'+u.id+'" onclick="this.classList.toggle(\'on\')"></div>')
        +'</div>';
    }).join('');
  }
  openM('m-pneu-perm');
}
async function salvarPermPneu(){
  var toggles=document.querySelectorAll('#pneu-perm-list .toggle[data-uid]');
  var alterados=[];
  toggles.forEach(function(t){
    var uid=t.getAttribute('data-uid');
    var u=(D.usuarios||[]).find(function(x){return x.id===uid;});
    if(!u)return;
    if(!u.perms)u.perms={};
    var novo=t.classList.contains('on');
    if(!!u.perms['pneu-edit']!==novo){ u.perms['pneu-edit']=novo; alterados.push(u); }
    else { u.perms['pneu-edit']=novo; }
  });
  sv();
  toast('Permissões salvas!','ok');
  closeM('m-pneu-perm');
  rdPneus();
  // sincroniza os usuários alterados no servidor (para valer em todos os PCs)
  if(typeof syncUsuarioServidor==='function' && typeof syncAtivo!=='undefined' && syncAtivo){
    for(var i=0;i<alterados.length;i++){ try{ await syncUsuarioServidor(alterados[i]); }catch(e){} }
  }
}
function savePneuSai(){
  const num=document.getElementById('psai-num').value.trim();
  const tipo=document.getElementById('psai-tipo').value;
  const dt=document.getElementById('psai-dt').value;
  if(!num){toast('Informe o número MH3','er');return;}
  const pneu=D.pneus.find(p=>p.num===num&&p.st==='estoque');
  if(!pneu){toast('Pneu não encontrado em estoque','er');return;}
  if(!dt){toast('Informe a data','er');return;}
  if(tipo==='reforma'){
    const reform=document.getElementById('psai-reform').value;
    if(!reform){toast('Informe a reformadora','er');return;}
    pneu.st='reforma';pneu.reformadora=reform;pneu.dtSaida=dt;pneu.saiuReforma=true;
    pneu.prevRetorno=document.getElementById('psai-prev').value;
    D.pneus_hist.push({num,tipo:'reforma',destino:reform,dt,obs:document.getElementById('psai-ob').value});
  } else if(tipo==='venda'){
    pneu.st='vendido';
    D.pneus_hist.push({num,tipo:'venda',destino:'Vendido',dt,obs:document.getElementById('psai-ob').value});
  } else {
    pneu.st='inutilizado';
    D.pneus_hist.push({num,tipo:'inutilização',destino:'Inutilizado',dt,obs:document.getElementById('psai-ob').value});
  }
  sv();closeM('m-pneu-sai');toast('Saída registrada!');rdPneus();
}

function pneuReforma(id){
  const p=D.pneus.find(x=>x.id===id);
  if(!p) return;
  const reform=prompt('Nome da reformadora:');
  if(!reform) return;
  const prev=prompt('Previsão de retorno (AAAA-MM-DD):');
  p.st='reforma';p.reformadora=reform;p.dtSaida=new Date().toISOString().substring(0,10);p.prevRetorno=prev||'';p.saiuReforma=true;
  D.pneus_hist.push({num:p.num,tipo:'reforma',destino:reform,dt:p.dtSaida});
  sv();rdPneus();toast('Pneu enviado para reforma!');
}

function pneuRetornoReforma(id){
  const p=D.pneus.find(x=>x.id===id);
  if(!p) return;
  var tipos=['MISTO','LISO','BORRACHUDO','USADO','CARCAÇA','RECUSADA'];
  var resp=prompt('Pneu '+p.num+' voltou da reforma (saiu como '+(p.mo||'?')+'). Informe o NOVO tipo — digite o número ou o nome: 1=MISTO  2=LISO  3=BORRACHUDO  4=USADO  5=CARCAÇA  6=RECUSADA');
  if(resp===null) return;
  resp=resp.trim().toUpperCase();
  var novoTipo='';
  var n=parseInt(resp,10);
  if(n>=1&&n<=tipos.length) novoTipo=tipos[n-1];
  else if(tipos.indexOf(resp)>=0) novoTipo=resp;
  if(!novoTipo){ toast('Tipo inválido. Operação cancelada.','er'); return; }
  var antigo=p.mo||'';
  p.st='estoque';p.cond='reformado';p.reformadora=null;p.mo=novoTipo;p.saiuReforma=true;
  D.pneus_hist.push({num:p.num,tipo:'retorno reforma',destino:'Estoque',dt:new Date().toISOString().substring(0,10),obs:'Tipo: '+antigo+' para '+novoTipo});
  sv();rdPneus();toast('Pneu voltou da reforma como '+novoTipo+'!','ok');
}

function pneuBaixa(id){
  if(!confirm('Confirma baixa/inutilização deste pneu?')) return;
  const p=D.pneus.find(x=>x.id===id);
  if(!p) return;
  p.st='inutilizado';
  D.pneus_hist.push({num:p.num,tipo:'inutilização',destino:'Inutilizado',dt:new Date().toISOString().substring(0,10)});
  sv();rdPneus();toast('Pneu baixado!');
}



