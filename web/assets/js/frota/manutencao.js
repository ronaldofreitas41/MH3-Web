// ============ MANUTENÇÃO ============
function togProxRev(){var tp=document.getElementById('mn-tp');var row=document.getElementById('mn-prox-rev-row');if(!tp||!row)return;var ehPrev=(tp.value||'').toLowerCase().indexOf('preventiva')>=0;row.style.display=ehPrev?'':'none';}
function autoFillEq(){const sel=document.getElementById('mn-eq');const eq=D.equips.find(e=>e.id===sel.value);if(!eq)return;var kmA=kmAtualVeic(eq),hrA=hrAtualVeic(eq);if(kmA)document.getElementById('mn-km').value=kmA;if(hrA)document.getElementById('mn-hr').value=hrA;var tp=document.getElementById('mn-tp');var ehPrev=tp&&(tp.value||'').toLowerCase().indexOf('preventiva')>=0;if(ehPrev){document.getElementById('mn-pkm').value=kmA+(D.config.rkm||10000);document.getElementById('mn-phr').value=hrA+(D.config.rhr||500);}}
function addLancManual(){const desc=prompt('Descrição:');if(!desc)return;const qtd=parseFloat(prompt('Quantidade:','1')||1);const val=parseFloat(prompt('Valor unitário (R$):','0')||0);const tipo=confirm('É PEÇA?\nOK=Peça / Cancelar=Serviço')?'Peça':'Serviço';mnLancs.push({id:uid(),desc,qtd,val,tipo,fonte:'manual'});rdMLanc();}
function addLancEstq(){const disp=D.estoque.filter(e=>e.qt>0);if(!disp.length){toast('Sem itens em estoque','er');return;}const opts=disp.map((e,i)=>`${i+1}. [${e.cd||'?'}] ${e.ds} (${e.qt}${e.un} / ${fmt(e.cv)})`);const s=prompt('Selecione o item:\n'+opts.join('\n'));const idx=parseInt(s)-1;if(isNaN(idx)||idx<0||idx>=disp.length)return;const item=disp[idx];const qtd=parseFloat(prompt('Quantidade:','1')||0);if(!qtd||qtd>item.qt){toast('Qtd inválida ou acima do estoque','er');return;}mnLancs.push({id:uid(),desc:item.ds,qtd,val:item.cv,tipo:'Peça',fonte:'estoque',estqId:item.id});item.qt-=qtd;sv();rdMLanc();}
function rdMLanc(){const el=document.getElementById('mn-lanc-list');if(!el)return;const tot=mnLancs.reduce((s,l)=>s+l.qtd*l.val,0);el.innerHTML=mnLancs.length?mnLancs.map(l=>`<div class="lanc-row"><div><div style="font-size:11px;font-weight:500">${l.desc}${l.fonte==='estoque'?'<span style="font-size:8px;color:var(--gn);margin-left:5px">📦</span>':''}</div><div style="font-size:9px;color:var(--mt)">${l.tipo} · ${l.qtd}x · ${fmt(l.val)}</div></div><div style="display:flex;align-items:center;gap:5px"><span style="font-family:'Barlow Condensed';font-size:12px;font-weight:700;color:${l.tipo==='Peça'?'var(--bl)':'var(--pu)'}">${fmt(l.qtd*l.val)}</span><button class="btn bd btn-xs" onclick="rmLanc('${l.id}')">×</button></div></div>`).join(''):'<div class="empty"><div class="ei">🔩</div>Nenhum item</div>';document.getElementById('mn-tot').textContent=fmt(tot);}
function rmLanc(id){const l=mnLancs.find(x=>x.id===id);if(l&&l.fonte==='estoque'&&l.estqId){const ei=D.estoque.find(e=>e.id===l.estqId);if(ei)ei.qt+=l.qtd;sv();}mnLancs=mnLancs.filter(x=>x.id!==id);rdMLanc();}
function popPneusOS(){
  var sel=document.getElementById('mn-pneu-sel'); if(!sel) return;
  var usados=mnPneus.map(function(p){return p.id;});
  sel.innerHTML='<option value="">Selecionar pneu do estoque...</option>';
  (D.pneus||[]).filter(function(p){return p.st==='estoque' && usados.indexOf(p.id)<0;}).forEach(function(p){
    sel.innerHTML+='<option value="'+p.id+'">'+(p.num||'?')+' — '+(p.mk||'')+' '+(p.med||'')+'</option>';
  });
}
function addPneuOS(){
  var sel=document.getElementById('mn-pneu-sel');
  var id=sel?sel.value:''; if(!id){toast('Selecione um pneu do estoque.','er');return;}
  var p=(D.pneus||[]).find(function(x){return x.id===id;});
  if(!p||p.st!=='estoque'){toast('Pneu indisponível no estoque.','er');return;}
  mnPneus.push({id:p.id,num:p.num,mk:p.mk,med:p.med});
  popPneusOS(); rdMnPneus();
}
function rmPneuOS(id){ mnPneus=mnPneus.filter(function(p){return p.id!==id;}); popPneusOS(); rdMnPneus(); }
function processarPneusOS(osId, osNum, placa){
  if(!Array.isArray(D.pneus)) D.pneus=[];
  if(!Array.isArray(D.pneus_pend)) D.pneus_pend=[];
  if(!Array.isArray(D.pneus_hist)) D.pneus_hist=[];
  var idsAtuais=mnPneus.map(function(p){return p.id;});
  var hoje=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  // aplicar os pneus escolhidos que ainda não estão aplicados nesta OS
  mnPneus.forEach(function(mp){
    var p=D.pneus.find(function(x){return x.id===mp.id;});
    if(!p) return;
    if(!(p.st==='aplicado' && p.osId===osId)){
      p.st='aplicado'; p.placa=placa; p.osId=osId; p.osNum=osNum; p.dtAplic=hoje; p.local='Placa '+(placa||'');
      D.pneus_hist.push({num:p.num,tipo:'aplicação',destino:(placa||'')+' (OS '+osNum+')',dt:hoje});
    }
  });
  // devolver ao estoque os pneus que estavam aplicados nesta OS mas foram retirados da lista
  D.pneus.forEach(function(p){
    if(p.st==='aplicado' && p.osId===osId && idsAtuais.indexOf(p.id)<0){
      p.st='estoque'; p.placa=''; p.osId=''; p.osNum=''; p.local='Estoque';
      D.pneus_hist.push({num:p.num,tipo:'retorno ao estoque',destino:'Estoque (OS '+osNum+' editada)',dt:hoje});
    }
  });
  // total aplicado nesta OS = nº de pneus retirados da placa que precisam dar entrada
  var totalAplicados=D.pneus.filter(function(p){return p.st==='aplicado' && p.osId===osId;}).length;
  var pend=D.pneus_pend.find(function(x){return x.osId===osId;});
  if(totalAplicados>0){
    if(pend){
      pend.qtd=totalAplicados; pend.placa=placa; pend.osNum=osNum;
      if(pend.feitos>pend.qtd)pend.feitos=pend.qtd;
      pend.st=pend.feitos>=pend.qtd?'resolvida':'pendente';
    } else {
      D.pneus_pend.push({id:uid(),osId:osId,osNum:osNum,placa:placa,qtd:totalAplicados,feitos:0,data:hoje,st:'pendente'});
    }
  } else if(pend && (pend.feitos||0)===0){
    D.pneus_pend=D.pneus_pend.filter(function(x){return x.osId!==osId;});
  }
  if(typeof updPneuPendCnt==='function')updPneuPendCnt();
}
function rdMnPneus(){
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  var el=document.getElementById('mn-pneus-list'); if(!el) return;
  if(!mnPneus.length){ el.innerHTML='<div style="font-size:10px;color:var(--mt);padding:4px 0">Nenhum pneu lançado.</div>'; return; }
  el.innerHTML='<div style="font-size:9px;color:var(--mt);margin-bottom:4px">'+mnPneus.length+' pneu(s) — saem do estoque ao salvar e geram '+mnPneus.length+' entrada(s) pendente(s)</div>'+mnPneus.map(function(p){
    return '<div class="lanc-row"><div><div style="font-size:11px;font-weight:500">🛞 '+escH(p.num||'?')+' <span style="font-size:8px;color:var(--gn)">📦 estoque</span></div><div style="font-size:9px;color:var(--mt)">'+escH(p.mk||'')+' · '+escH(p.med||'')+'</div></div><button class="btn bd btn-xs" onclick="rmPneuOS(\''+p.id+'\')">×</button></div>';
  }).join('');
}
function loadClMod(){
  const sel=document.getElementById('mn-cl-mod');
  const cl=D.checklists.find(c=>c.id===sel.value);
  if(!cl){return;}
  if(mnClIs.some(function(i){return (i.grupo||'')===cl.nm;})){ toast('Este checklist já foi adicionado.','er'); sel.value=''; return; }
  (cl.items||[]).forEach(function(i){ mnClIs.push({id:uid(),txt:i.txt,ck:false,grupo:cl.nm}); });
  sel.value='';
  rdMCl();
  toast('Checklist "'+cl.nm+'" adicionado.','ok');
}
function rmGrupoCl(grupo){
  mnClIs=mnClIs.filter(function(i){return (i.grupo||'Itens')!==grupo;});
  rdMCl();
}
function rdMCl(){
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  const el=document.getElementById('mn-cl-list');if(!el)return;
  if(!mnClIs.length){el.innerHTML='<div class="empty"><div class="ei">☑️</div>Selecione um ou mais checklists acima</div>';return;}
  const ck=mnClIs.filter(i=>i.ck).length;
  var grupos={}, ordem=[];
  mnClIs.forEach(function(i){var g=i.grupo||'Itens';if(!grupos[g]){grupos[g]=[];ordem.push(g);}grupos[g].push(i);});
  var html='<div style="font-size:9px;color:var(--mt);margin-bottom:6px">'+ck+'/'+mnClIs.length+' marcados · '+ordem.length+' checklist(s)</div>';
  ordem.forEach(function(g){
    html+='<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;align-items:center;background:var(--cd);border:1px solid var(--br);border-radius:4px 4px 0 0;padding:4px 8px"><span style="font-size:10px;font-weight:700;color:var(--cy)">📋 '+escH(g)+'</span><button class="btn bd btn-xs" data-g="'+escH(g)+'" onclick="rmGrupoCl(this.dataset.g)" title="Remover este checklist">×</button></div>';
    html+=grupos[g].map(function(i){return '<div style="display:flex;align-items:center;gap:6px;padding:5px 7px;background:var(--cd2);border:1px solid var(--br);border-top:none"><div style="width:13px;height:13px;border-radius:2px;border:2px solid '+(i.ck?'var(--gn)':'var(--br2)')+';background:'+(i.ck?'var(--gn)':'transparent')+';cursor:pointer;flex-shrink:0" onclick="togCl(\''+i.id+'\')"></div><span style="font-size:11px;'+(i.ck?'text-decoration:line-through;color:var(--mt)':'')+'">'+escH(i.txt)+'</span></div>';}).join('');
    html+='</div>';
  });
  el.innerHTML=html;
}
function togCl(id){const i=mnClIs.find(x=>x.id===id);if(i){i.ck=!i.ck;rdMCl();}}
function addFotos(inp){Array.from(inp.files).forEach(f=>{_comprimirImg(f,1600,0.72,function(src,nm){var o={id:uid(),src:src,name:nm};mnFotos.push(o);rdMFotos();_uploadFoto(src,nm,function(u){if(u&&u!==src){o.src=u;rdMFotos();}});});});}
function rdMFotos(){const g=document.getElementById('mn-foto-grid');if(!g)return;g.innerHTML='<label class="foto-add" for="mn-foto-inp">+</label><input type="file" id="mn-foto-inp" accept="image/*" multiple style="display:none" onchange="addFotos(this)">';mnFotos.forEach(f=>{const i=document.createElement('img');i.src=f.src;i.className='foto-thumb';i.onclick=()=>openLB(f.src);g.appendChild(i);});}
function saveMn(){if(typeof _fotosEnviando!=='undefined' && _fotosEnviando>0){ toast('⏳ Aguarde — ainda enviando '+_fotosEnviando+' foto(s) ao servidor. Tente salvar daqui a alguns segundos.','er'); return; }const eqId=document.getElementById('mn-eq').value;
  if(getEmpresas().length===0){toast('Cadastre ao menos uma empresa antes de gerar OS (botão Empresas).','er');return;}
  if(!eqId){toast('Selecione o veículo/equipamento/placa da frota','er');return;}const eq=D.equips.find(e=>e.id===eqId);
  const empresasCad=getEmpresas().map(e=>e.nome);
  if(eq&&(!eq.empresa||!empresasCad.includes(eq.empresa))){toast('Este veículo não está vinculado a uma empresa cadastrada. Edite o veículo e defina a empresa proprietária.','er');return;}const custo=document.querySelector('input[name="mn-custo"]:checked');const tot=mnLancs.reduce((s,l)=>s+l.qtd*l.val,0);const dados={eqId,eqLbl:eq?`${eq.placa} ${eq.mo}`:'-',placa:eq?eq.placa:'-',tipo:document.getElementById('mn-tp').value,en:document.getElementById('mn-en').value,sa:document.getElementById('mn-sa').value,km:document.getElementById('mn-km').value,hr:document.getElementById('mn-hr').value,pkm:document.getElementById('mn-pkm').value,phr:document.getElementById('mn-phr').value,custo:custo?custo.value:'mh3',status:document.getElementById('mn-status').value,resp:(document.getElementById('mn-re').value==='__manual__'?(document.getElementById('mn-re-manual').value||'').trim():document.getElementById('mn-re').value),ob:document.getElementById('mn-ob').value,lancs:[...mnLancs],checklist:[...mnClIs],fotos:[...mnFotos],total:tot};const _eid=(document.getElementById('mn-eid')||{}).value||'';if(_eid){const idx=D.manutencoes.findIndex(x=>x.id===_eid);if(idx<0){toast('OS não encontrada.','er');return;}if(D.manutencoes[idx].status==='concluida'){toast('Esta OS já está concluída e não pode ser editada.','er');return;}D.manutencoes[idx]=Object.assign({},D.manutencoes[idx],dados);processarPneusOS(D.manutencoes[idx].id,D.manutencoes[idx].osNum,dados.placa);auditar('ALTERACAO','manutencoes','OS '+(D.manutencoes[idx].osNum||'')+' editada');sv();if(window.emailAutoSe)window.emailAutoSe('os',D.manutencoes[idx]);closeM('m-mn');toast('OS '+(D.manutencoes[idx].osNum||'')+' atualizada!','ok');updPendCnt();rp(cur);return;}const osNum=D._pendingOsNum||(nextNum('os'));delete D._pendingOsNum;const m=Object.assign({id:uid(),osNum,finStatus:'pendente'},dados);D.manutencoes.push(m);processarPneusOS(m.id,m.osNum,dados.placa);auditar('CRIACAO','manutencoes','OS '+osNum+' criada');sv();if(window.emailAutoSe)window.emailAutoSe('os',m);closeM('m-mn');toast(`OS ${osNum} salva!`);updPendCnt();rp(cur);}
function editMn(id){if(_bloqEditar('manut'))return;
  var m=D.manutencoes.find(function(x){return x.id===id;}); if(!m) return;
  if(m.status==='concluida'){ toast('Esta OS está CONCLUÍDA e não pode mais ser editada. Para alterar, exclua e recrie.','er'); return; }
  popSels();
  var setV=function(i,v){var el=document.getElementById(i);if(el)el.value=(v==null?'':v);};
  document.getElementById('mn-eid').value=m.id;
  document.getElementById('mn-num-label').textContent=m.osNum||'';
  delete D._pendingOsNum;
  setV('mn-eq',m.eqId); setV('mn-tp',m.tipo); setV('mn-en',m.en); setV('mn-sa',m.sa);
  setV('mn-km',m.km); setV('mn-hr',m.hr); setV('mn-pkm',m.pkm); setV('mn-phr',m.phr); if(typeof togProxRev==='function')togProxRev();
  var rc=document.querySelector('input[name="mn-custo"][value="'+(m.custo||'mh3')+'"]'); if(rc)rc.checked=true;
  setV('mn-status',m.status||'aberta');
  var reSel=document.getElementById('mn-re');
  var existe=reSel && Array.prototype.some.call(reSel.options,function(o){return o.value===m.resp && o.value!=='' && o.value!=='__manual__';});
  if(m.resp && existe){ reSel.value=m.resp; }
  else if(m.resp){ if(reSel)reSel.value='__manual__'; var man=document.getElementById('mn-re-manual'); if(man)man.value=m.resp; }
  else if(reSel){ reSel.value=''; }
  if(typeof toggleRespManual==='function')toggleRespManual();
  setV('mn-ob',m.ob);
  mnLancs=(m.lancs||[]).slice(); mnClIs=(m.checklist||[]).slice(); mnFotos=(m.fotos||[]).slice();
  mnPneus=(D.pneus||[]).filter(function(p){return p.st==='aplicado' && p.osId===m.id;}).map(function(p){return {id:p.id,num:p.num,mk:p.mk,med:p.med};});
  if(typeof rdMLanc==='function')rdMLanc();
  if(typeof rdMCl==='function')rdMCl();
  if(typeof rdMFotos==='function')rdMFotos();
  if(typeof popPneusOS==='function')popPneusOS();
  if(typeof rdMnPneus==='function')rdMnPneus();
  document.getElementById('m-mn').classList.add('op');
}
function delMn(id){reqSenha(()=>{if(!confirm('Excluir esta OS?'))return;const m=D.manutencoes.find(x=>x.id===id);if(m)m.lancs.forEach(l=>{if(l.fonte==='estoque'&&l.estqId){const e=D.estoque.find(x=>x.id===l.estqId);if(e)e.qt+=l.qtd;}});var _hj=(typeof today==='function')?today():new Date().toISOString().slice(0,10);(D.pneus||[]).forEach(function(p){if(p.st==='aplicado'&&p.osId===id){p.st='estoque';p.placa='';p.osId='';p.osNum='';p.local='Estoque';if(Array.isArray(D.pneus_hist))D.pneus_hist.push({num:p.num,tipo:'retorno ao estoque',destino:'Estoque (OS excluída)',dt:_hj});}});if(Array.isArray(D.pneus_pend))D.pneus_pend=D.pneus_pend.filter(function(x){return x.osId!==id;});D.manutencoes=D.manutencoes.filter(x=>x.id!==id);sv();rdManut();if(typeof rdPneus==='function')rdPneus();toast('OS excluída.');});}
function openPrintOS(id){document.getElementById('print-os-id').value=id;openM('m-print-os');}
function execPrintOS(){const id=document.getElementById('print-os-id').value;const m=D.manutencoes.find(x=>x.id===id);if(!m)return;const fotos=document.getElementById('pi-fotos').checked;const valor=document.getElementById('pi-valor').checked;const clCheck=document.getElementById('pi-cl').checked;const tipo=document.querySelector('input[name="pi-tipo"]:checked').value;closeM('m-print-os');document.getElementById('view-title').textContent=`🔧 OS ${m.osNum} — ${m.eqLbl}`;let html=`<div style="text-align:center;margin-bottom:14px"><div style="font-family:'Bebas Neue';font-size:32px;color:var(--red)">MH3 RENTAL LTDA</div><div style="font-size:9px;color:var(--mt)">ORDEM DE SERVIÇO — ${m.osNum}</div></div>`;html+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">`;html+=`<div class="rel-card"><div class="stat-label">Nº OS</div><div class="stat-value" style="color:var(--cy)">${m.osNum}</div></div>`;html+=`<div class="rel-card"><div class="stat-label">Tipo</div><div class="stat-value">${m.tipo}</div></div>`;html+=`<div class="rel-card"><div class="stat-label">Veículo/Equipamento</div><div class="stat-value"><span class="tag-p">${m.placa}</span></div></div>`;html+=`<div class="rel-card"><div class="stat-label">Status</div>${bdg(m.status)}</div>`;html+=`<div class="rel-card"><div class="stat-label">Entrada / Saída</div><div class="stat-value">${m.en||'-'} → ${m.sa||'Em aberto'}</div></div>`;html+=`<div class="rel-card"><div class="stat-label">KM / Horímetro</div><div class="stat-value">${m.km||'-'} / ${m.hr||'-'}h</div></div>`;if(tipo!=='simples'){html+=`<div class="rel-card"><div class="stat-label">Próxima Revisão</div><div class="stat-value">${m.pkm||'-'}km / ${m.phr||'-'}h</div></div><div class="rel-card"><div class="stat-label">Responsável</div><div class="stat-value">${m.resp||'-'}</div></div>`;}html+=`<div class="rel-card"><div class="stat-label">Custo Para</div><div class="stat-value">${m.custo==='cliente'?'Cliente':'MH3'}</div></div>`;html+=`</div>`;if(clCheck&&m.checklist&&m.checklist.length){html+=`<div class="rel-card" style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">CHECKLIST (${m.checklist.filter(i=>i.ck).length}/${m.checklist.length})</div>${m.checklist.map(i=>`<div style="display:flex;align-items:center;gap:5px;padding:3px 0;border-bottom:1px solid var(--br)"><span style="color:${i.ck?'var(--gn)':'var(--mt)'};font-size:12px">${i.ck?'✓':'○'}</span><span style="font-size:10px;${i.ck?'text-decoration:line-through;color:var(--mt)':''}">${i.txt}</span></div>`).join('')}</div>`;}if(tipo!=='simples'&&m.lancs&&m.lancs.length){html+=`<div class="rel-card" style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">PRODUTOS / PEÇAS</div>${m.lancs.map(l=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--br)"><div><span style="font-size:10px;font-weight:500">${l.desc}</span><span style="font-size:9px;color:var(--mt);margin-left:5px">${l.tipo} · ${l.qtd}x</span></div>${valor?`<span style="font-size:11px;font-weight:600">${fmt(l.qtd*l.val)}</span>`:''}</div>`).join('')}${valor?`<div style="text-align:right;margin-top:6px;font-family:'Bebas Neue';font-size:18px;color:var(--gn)">TOTAL: ${fmt(m.total)}</div>`:''}</div>`;}if(fotos&&m.fotos&&m.fotos.length){html+=`<div class="rel-card"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">FOTOS</div><div class="foto-grid">${m.fotos.map(f=>`<img class="foto-thumb" src="${f.src}" onclick="openLB('${f.src}')">`).join('')}</div></div>`;}if(m.ob)html+=`<div class="rel-card"><div class="stat-label">Observações</div><div style="font-size:10px;margin-top:4px">${m.ob}</div></div>`;document.getElementById('view-body').innerHTML=html;openM('m-view');}

