// ---- MOBILIZAÇÃO (página) ----
function rdMob(){
  const el=document.getElementById('mob-lista');
  if(!el) return;
  const mobs=[...(D.mobilizacoes||[])].reverse();
  if(!mobs.length){
    el.innerHTML='<div class="empty"><div class="ei">📸</div>Nenhuma mobilização registrada. Clique em "+ Nova" para começar.</div>';
    return;
  }
  const stLbl={aguardando:'⏳ Aguardando',vigente:'🟢 Vigente',finalizado:'✅ Finalizado'};
  const stBadge={aguardando:'b-yw',vigente:'b-gn',finalizado:'b-gr'};
  el.innerHTML=`<div class="tw"><table>
    <thead><tr><th>Tipo</th><th>Placa</th><th>Cliente/Obra</th><th>Saída</th><th>Chegada</th><th>Status</th><th>Ações</th></tr></thead>
    <tbody>${mobs.map(m=>`<tr>
      <td><span class="badge ${m.tipo==='desmobilizacao'?'b-pu':'b-bl'}">${m.tipo==='desmobilizacao'?'📥 Desmob.':'📤 Mob.'}</span></td>
      <td><b>${m.placa}</b></td>
      <td style="font-size:11px">${m.cliente||'-'}</td>
      <td style="font-size:11px">${fmtData(m.saida)}</td>
      <td style="font-size:11px">${fmtData(m.chegada)}</td>
      <td><span class="badge ${stBadge[m.status]||'b-gr'}">${stLbl[m.status]||m.status}</span></td>
      <td style="display:flex;gap:4px">
        <button class="btn bb btn-xs" onclick="perguntarImprimirMob('${m.id}')" title="Imprimir (com ou sem fotos)">🖨</button>
        <button class="btn bg btn-xs" onclick="editMob('${m.id}')" title="Editar">✏️</button>
        <button class="btn bd btn-xs" onclick="delMob('${m.id}')" title="Excluir">×</button>
      </td>
    </tr>`).join('')}</tbody></table></div>`;
}

function openMob(){
  document.getElementById('mob-eid').value='';
  document.getElementById('mob-saida').value=new Date().toISOString().substring(0,10);
  document.getElementById('mob-chegada').value='';
  document.getElementById('mob-status').value='aguardando';
  const tipoEl=document.getElementById('mob-tipo');
  if(tipoEl){tipoEl.value='mobilizacao';toggleTipoMob();}
  ['mob-pe-mk','mob-pe-num','mob-pe-med'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('mob-cliente').value='';
  document.getElementById('mob-local').value='';
  document.getElementById('mob-obs').value='';
  ['mob-p1-mk','mob-p1-num','mob-p1-med','mob-p2-mk','mob-p2-num','mob-p2-med','mob-p3-mk','mob-p3-num','mob-p3-med','mob-p4-mk','mob-p4-num','mob-p4-med'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  mobModalFotos=[];if(typeof renderMobModalFotos==='function')renderMobModalFotos();
  // Popula contratos (placa/cliente/cidade vêm do contrato)
  popContratosMob();
  popChecklistsMob();
  document.getElementById('mob-contrato').value='';
  document.getElementById('mob-cliente').value='';
  document.getElementById('mob-local').value='';
  mobClIs=[]; if(typeof rdMobCl==='function')rdMobCl();
  document.querySelector('#m-mob .mt2').textContent='📸 Nova Mobilização';
  openM('m-mob');
}

function toggleTipoMob(){
  const tipo=document.getElementById('mob-tipo').value;
  const saidaBox=document.getElementById('mob-saida-box');
  const chegadaBox=document.getElementById('mob-chegada-box');
  if(tipo==='mobilizacao'){
    // MOBILIZAÇÃO = saída → NÃO aparece chegada
    if(saidaBox)saidaBox.style.display='';
    if(chegadaBox){chegadaBox.style.display='none';document.getElementById('mob-chegada').value='';}
  }else{
    // DESMOBILIZAÇÃO = retorno → aparece chegada (e saída como referência)
    if(saidaBox)saidaBox.style.display='';
    if(chegadaBox)chegadaBox.style.display='';
  }
}

function sugereStatusMob(){
  const tipo=document.getElementById('mob-tipo')?document.getElementById('mob-tipo').value:'mobilizacao';
  const saida=document.getElementById('mob-saida').value;
  const chegada=document.getElementById('mob-chegada').value;
  const stSel=document.getElementById('mob-status');
  const hoje=new Date().toISOString().substring(0,10);
  // Sugestão automática (usuário pode mudar)
  if(tipo==='desmobilizacao' && chegada && chegada<=hoje){
    stSel.value='finalizado';
  } else if(saida && saida<=hoje){
    stSel.value='vigente';
  } else {
    stSel.value='aguardando';
  }
}

function gv(id){const el=document.getElementById(id);return el?el.value:'';}
let mobModalFotos=[];
function addMobModalFoto(inp){
  Array.from(inp.files).forEach(file=>{
    _comprimirImg(file, 1600, 0.72, function(src, nm){
      if(!src) return;
      mobModalFotos.push(src); renderMobModalFotos();
      _uploadFoto(src, nm, function(u){
        if(u && u!==src){ var i=mobModalFotos.indexOf(src); if(i>=0){ mobModalFotos[i]=u; renderMobModalFotos(); } }
      });
    });
  });
  inp.value='';
}
function renderMobModalFotos(){
  const grid=document.getElementById('mob-foto-grid');
  if(!grid)return;
  const add=grid.querySelector('label');
  grid.querySelectorAll('img').forEach(i=>i.remove());
  mobModalFotos.forEach((src,i)=>{
    const img=document.createElement('img');img.src=src;
    img.style.cssText='width:60px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer';
    img.onclick=()=>{if(confirm('Remover foto?')){mobModalFotos.splice(i,1);renderMobModalFotos();}};
    grid.insertBefore(img,add);
  });
}
function saveMob(){
  if(typeof _fotosEnviando!=='undefined' && _fotosEnviando>0){ toast('⏳ Aguarde — ainda enviando '+_fotosEnviando+' foto(s) ao servidor. Tente salvar daqui a alguns segundos.','er'); return; }
  const ctIdMob=document.getElementById('mob-contrato')?document.getElementById('mob-contrato').value:'';
  const placa=document.getElementById('mob-placa').value;
  const saida=document.getElementById('mob-saida').value;
  var avulso=(ctIdMob==='__avulso__');
  if(!ctIdMob){toast('Selecione o contrato (ou Avulso)','er');return;}
  if(!placa){toast(avulso?'Informe a placa do veículo':'Contrato sem placa — verifique o contrato','er');return;}
  if(!saida){toast('Informe a data de saída','er');return;}
  const eid=document.getElementById('mob-eid').value;
  const data={
    ctId:avulso?'':ctIdMob,
    avulso:avulso,
    placa,saida,
    chegada:document.getElementById('mob-chegada').value,
    status:document.getElementById('mob-status').value,
    cliente:document.getElementById('mob-cliente').value,
    local:document.getElementById('mob-local').value,
    obs:document.getElementById('mob-obs').value,
    tipo:document.getElementById('mob-tipo')?document.getElementById('mob-tipo').value:'mobilizacao',
    pneus:{
      p1:{mk:gv('mob-p1-mk'),num:gv('mob-p1-num'),med:gv('mob-p1-med'),ref:gv('mob-p1-ref')},
      p2:{mk:gv('mob-p2-mk'),num:gv('mob-p2-num'),med:gv('mob-p2-med'),ref:gv('mob-p2-ref')},
      p3:{mk:gv('mob-p3-mk'),num:gv('mob-p3-num'),med:gv('mob-p3-med'),ref:gv('mob-p3-ref')},
      p4:{mk:gv('mob-p4-mk'),num:gv('mob-p4-num'),med:gv('mob-p4-med'),ref:gv('mob-p4-ref')},
      pe:{mk:gv('mob-pe-mk'),num:gv('mob-pe-num'),med:gv('mob-pe-med'),ref:gv('mob-pe-ref')}
    },
    fotos:[...mobModalFotos],
    checklist:[...mobClIs]
  };
  if(eid){
    const idx=D.mobilizacoes.findIndex(m=>m.id===eid);
    if(idx>-1) D.mobilizacoes[idx]={...D.mobilizacoes[idx],...data};
    toast('Mobilização atualizada!','ok');
  }else{
    data.id=uid();
    D.mobilizacoes.push(data);
    toast('Mobilização criada!','ok');
  }
  sv();if(window.emailAutoSe)window.emailAutoSe('mobilizacao', eid?D.mobilizacoes.find(function(m){return m.id===eid;}):data);closeM('m-mob');rdMob();
}

function editMob(id){if(_bloqEditar('mob'))return;
  const m=D.mobilizacoes.find(x=>x.id===id);
  if(!m) return;
  openMob();
  document.getElementById('mob-eid').value=id;
  mobClIs=(m.checklist||[]).slice(); if(typeof rdMobCl==='function')rdMobCl();
  // Tipo (mobilização/desmobilização)
  const tipoSel=document.getElementById('mob-tipo');
  if(tipoSel){tipoSel.value=m.tipo||'mobilizacao';toggleTipoMob();}
  // Contrato
  const ctSel=document.getElementById('mob-contrato');
  if(ctSel&&m.ctId)ctSel.value=m.ctId;
  document.getElementById('mob-placa').value=m.placa||'';
  document.getElementById('mob-saida').value=m.saida||'';
  document.getElementById('mob-chegada').value=m.chegada||'';
  document.getElementById('mob-status').value=m.status||'aguardando';
  document.getElementById('mob-cliente').value=m.cliente||'';
  document.getElementById('mob-local').value=m.local||'';
  document.getElementById('mob-obs').value=m.obs||'';
  // RESTAURA PNEUS (bug corrigido: antes a edição apagava os pneus salvos)
  const px=m.pneus||{};
  ['p1','p2','p3','p4','pe'].forEach(p=>{
    const dados=px[p]||{};
    const set=(suf,v)=>{const el=document.getElementById('mob-'+p+'-'+suf);if(el)el.value=v||(suf==='ref'?'nao':'');};
    set('mk',dados.mk);set('num',dados.num);set('med',dados.med);set('ref',dados.ref);
  });
  // RESTAURA FOTOS (bug corrigido)
  mobModalFotos=m.fotos?[...m.fotos]:[];
  if(typeof renderMobModalFotos==='function')renderMobModalFotos();
  document.querySelector('#m-mob .mt2').textContent=(m.tipo==='desmobilizacao'?'📥 Editar Desmobilização':'📤 Editar Mobilização');
}

function delMob(id){
  reqSenha(()=>{
    if(!confirm('Excluir esta mobilização?')) return;
    D.mobilizacoes=D.mobilizacoes.filter(m=>m.id!==id);
    if(typeof auditarExclusao==='function')auditarExclusao('mobilizacao','Excluiu mobilização: '+id);
    sv();rdMob();toast('Mobilização excluída','ok');
  });
}


