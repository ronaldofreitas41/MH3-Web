// ============ CONTRATO ============
function autoH(){const t=parseInt(document.getElementById('ct-tn').value);document.getElementById('ct-hr').value={1:D.config.t1||200,2:D.config.t2||300,3:D.config.t3||420}[t]||200;}
function openEditCt(id){if(_bloqEditar('cts'))return;
  if(typeof popClientesCt==='function')popClientesCt();reqSenha(()=>{const c=D.contratos.find(x=>x.id===id);if(!c)return;popSels();document.getElementById('ct-mtitle').textContent='✏️ Editar Contrato';['cl','ob','dur','obs'].forEach(k=>{const el=document.getElementById('ct-'+k);if(el)el.value=c[k]||'';});['eq','tn','ci','mob','ass'].forEach(k=>{const el=document.getElementById('ct-'+k);if(el){const v=c[k]||c[k+'Id']||'';if([...el.options].some(o=>o.value===v))el.value=v;}});['hr','vhe','vl'].forEach(k=>{const el=document.getElementById('ct-'+k);if(el)el.value=c[k]||0;});document.getElementById('ct-ini').value=c.ini||'';document.getElementById('ct-eid').value=id;document.getElementById('m-ct').classList.add('op');});  const selCli=document.getElementById('ct-cliente-sel');
  if(selCli&&c.clienteId) selCli.value=c.clienteId;
  const tipoSel=document.getElementById('ct-tipo-vl');
  if(tipoSel&&c.tipoVl) tipoSel.value=c.tipoVl;
  if(typeof calcSaldoCt==='function') setTimeout(calcSaldoCt,100);
}
function saveCt(){const cl=document.getElementById('ct-cl').value.trim();if(!cl){toast('Informe o cliente','er');return;}const eqId=document.getElementById('ct-eq').value;const eq=D.equips.find(e=>e.id===eqId);const eid=document.getElementById('ct-eid').value;const clienteId=document.getElementById('ct-cliente-sel')?document.getElementById('ct-cliente-sel').value:'';const tipoVl=document.getElementById('ct-tipo-vl')?document.getElementById('ct-tipo-vl').value:'mensal';const data={cl,clienteId,tipoVl,ob:document.getElementById('ct-ob').value,eqId,eqLbl:eq?`${eq.placa} — ${eq.mk} ${eq.mo}`:'—',placa:eq?eq.placa:'',mk:eq?eq.mk:'',mo:eq?eq.mo:'',tn:document.getElementById('ct-tn').value,hr:parseInt(document.getElementById('ct-hr').value)||200,vhe:parseFloat(document.getElementById('ct-vhe').value)||0,vl:parseFloat(document.getElementById('ct-vl').value)||0,ci:document.getElementById('ct-ci').value,ini:document.getElementById('ct-ini').value,mob:document.getElementById('ct-mob').value,dur:document.getElementById('ct-dur').value,ass:document.getElementById('ct-ass').value,obs:document.getElementById('ct-obs').value};if(eid){const idx=D.contratos.findIndex(x=>x.id===eid);if(idx>-1)D.contratos[idx]={...D.contratos[idx],...data};}else{data.id=uid();data.status='ativo';D.contratos.push(data);if(eq){eq.st='alocado';eq.clienteAtual=cl;eq.obraAtual=data.ob;delete eq.patio;}}document.getElementById('ct-eid').value='';auditar(eid?'ALTERACAO':'CRIACAO','contratos',(eid?'Contrato ALTERADO':'Contrato criado')+': '+cl);sv();closeM('m-ct');toast(eid?'Atualizado!':'Contrato salvo!');updPendCnt();rp(cur);}
function encCt(id){reqSenha(()=>{if(!confirm('Encerrar contrato?'))return;const c=D.contratos.find(x=>x.id===id);if(!c)return;c.status='encerrado';const eq=D.equips.find(e=>e.id===c.eqId);if(eq){eq.st='disponivel';delete eq.clienteAtual;delete eq.obraAtual;}sv();rdCts();toast('Encerrado.');});}

// ============ MEDIÇÃO ============
function autoFillMed(){const ct=D.contratos.find(c=>c.id===document.getElementById('med-ct').value);if(!ct)return;document.getElementById('med-vl').value=ct.vl||0;document.getElementById('med-vhe').value=ct.vhe||0;document.getElementById('med-hr').value=ct.hr||200;calcMed();}
window._medVendas = window._medVendas || [];
function _vendaVinculada(id){ return (D.medicoes||[]).some(function(m){ return (m.vendasVinc||[]).some(function(x){return x.id===id;}); }); }
function _medVendasTotal(){ return (window._medVendas||[]).reduce(function(s,x){return s+(parseFloat(x.total)||0);},0); }
function _rdMedVendas(){
  var box=document.getElementById('med-vd-lista'); if(!box) return;
  var arr=window._medVendas||[];
  if(!arr.length){ box.innerHTML='<div style="font-size:10px;color:var(--mt)">Nenhuma venda incluída.</div>'; return; }
  box.innerHTML=arr.map(function(v){return '<div style="display:flex;justify-content:space-between;align-items:center;background:var(--cd2);border:1px solid var(--br);border-radius:4px;padding:5px 8px;margin-bottom:3px"><span style="font-size:11px"><b>'+escH(v.num||'')+'</b> · '+fmt(v.total||0)+(v.cli?(' · '+escH(v.cli)):'')+'</span><button type="button" class="btn bd btn-xs" onclick="medRemoverVenda(\''+v.id+'\')">×</button></div>';}).join('');
}
function medIncluirVenda(){
  var inp=document.getElementById('med-vd-num'); if(!inp) return;
  var raw=(inp.value||'').trim(); if(!raw){ toast('Digite o número da venda','er'); return; }
  var digitos=raw.replace(/\D/g,''); if(!digitos){ toast('Número de venda inválido','er'); return; }
  var alvo=parseInt(digitos,10);
  var v=(D.vendas||[]).find(function(x){ var dx=String(x.num||'').replace(/\D/g,''); return dx && parseInt(dx,10)===alvo; });
  if(!v){ toast('Venda '+raw+' não encontrada','er'); return; }
  window._medVendas = window._medVendas || [];
  if(window._medVendas.some(function(x){return x.id===v.id;})){ toast('Esta venda já foi incluída','er'); return; }
  var meuId=document.getElementById('med-eid')?document.getElementById('med-eid').value:'';
  var outra=(D.medicoes||[]).find(function(m){ return m.id!==meuId && (m.vendasVinc||[]).some(function(x){return x.id===v.id;}); });
  if(outra){ toast('Essa venda já está na medição de '+(outra.cl||'outro cliente'),'er'); return; }
  window._medVendas.push({id:v.id,num:v.num,total:parseFloat(v.total)||0,cli:v.cli||''});
  inp.value=''; _rdMedVendas(); if(typeof calcMed==='function')calcMed();
  toast('Venda '+v.num+' incluída como Avaria/Reparos','ok');
}
function medRemoverVenda(id){
  window._medVendas=(window._medVendas||[]).filter(function(x){return x.id!==id;});
  _rdMedVendas(); if(typeof calcMed==='function')calcMed();
}
function calcMed(){const b=parseFloat(document.getElementById('med-vl').value)||0,d=parseFloat(document.getElementById('med-dc').value)||0,he=parseFloat(document.getElementById('med-he').value)||0,vhe=parseFloat(document.getElementById('med-vhe').value)||0;const vv=(typeof _medVendasTotal==='function')?_medVendasTotal():0;const sub=b+(he*vhe);document.getElementById('med-sub').textContent=fmt(sub);document.getElementById('med-dc-show').textContent=fmt(d);document.getElementById('med-tot-p').textContent=fmt(sub-d+vv);}

function numMedicaoAuto(){
  const ctId=document.getElementById('med-ct').value;
  const numEl=document.getElementById('med-num');
  if(!numEl) return;
  if(!ctId){numEl.value='';return;}
  const ct=D.contratos.find(c=>c.id===ctId);
  const jaFeitas=D.medicoes.filter(m=>m.ctId===ctId).length;
  const proxima=jaFeitas+1;
  const total=ct?parseInt(ct.dur)||0:0;
  numEl.value=`MEDIÇÃO Nº ${String(proxima).padStart(3,'0')}${total?' de '+String(total).padStart(3,'0'):''}`;
  // Mostra saldo do contrato
  if(ct&&typeof saldoContrato==='function'){
    const s=saldoContrato(ctId);
    numEl.value+=` — Saldo: ${fmt(s.saldo)}`;
    if(total&&proxima>total){
      numEl.value=`🚫 SEM SALDO — contrato de ${total} meses já tem ${jaFeitas} medições. Faça um ADITIVO no contrato.`;
      numEl.style.color='var(--red)';
    } else {
      numEl.style.color='';
    }
  }
}

function podeMedirContrato(ctId){
  // Bloqueio: só permite medição se houver saldo (tempo) no contrato
  const ct=D.contratos.find(c=>c.id===ctId);
  if(!ct) return {ok:false,msg:'Contrato não encontrado'};
  const total=parseInt(ct.dur)||0;
  const jaFeitas=D.medicoes.filter(m=>m.ctId===ctId).length;
  if(total&&jaFeitas>=total){
    return {ok:false,msg:`🚫 Contrato sem saldo! ${total} meses = ${total} medições (já feitas: ${jaFeitas}). Faça um ADITIVO no contrato para continuar.`};
  }
  return {ok:true};
}

function aditivarContrato(ctId){
  // Aditivo: aumenta o tempo do contrato (com senha admin)
  reqSenha(()=>{
    const ct=D.contratos.find(c=>c.id===ctId);
    if(!ct){toast('Contrato não encontrado','er');return;}
    const atual=parseInt(ct.dur)||0;
    const mais=prompt(`Contrato atual: ${atual} meses.\nQuantos meses ADICIONAR no aditivo?`);
    const n=parseInt(mais);
    if(!n||n<1){toast('Valor inválido','er');return;}
    ct.dur=atual+n;
    ct.aditivos=ct.aditivos||[];
    ct.aditivos.push({dt:new Date().toISOString().substring(0,10),meses:n,por:authUser?authUser.nome:'?'});
    sv();
    if(typeof auditarExclusao==='function') auditarExclusao('contratos','ADITIVO: +'+n+' meses no contrato '+(ct.placa||''));
    toast(`✅ Aditivo registrado! Contrato agora tem ${ct.dur} meses.`,'ok');
    rdCts();
  });
}


function editMed(id){if(_bloqEditar('meds'))return;
  const m=D.medicoes.find(x=>x.id===id);
  if(!m){toast('Medição não encontrada','er');return;}
  // Medição já em contas a receber: edição exige senha admin (regra geral)
  reqSenha(()=>{
    if(typeof popSels==='function')popSels();
    openM('m-med');
    document.getElementById('med-eid').value=id;
    document.getElementById('med-ct').value=m.ctId||'';
    var _mt=document.getElementById('med-tipo');if(_mt){_mt.value=m.manual?'manual':'cadastrado';if(typeof togMedTipo==='function')togMedTipo();}
    if(m.manual){var _ev=(D.equips||[]).find(function(x){return x.placa===m.placa&&x.medManual;});if(typeof _popPlacasMedMan==='function')_popPlacasMedMan(_ev?_ev.id:'');var _pm=document.getElementById('med-placa-man');if(_pm&&_ev)_pm.value=_ev.id;}
    const set=(i,v)=>{const el=document.getElementById(i);if(el)el.value=v!==undefined&&v!==null?v:'';};
    set('med-ms',m.ms);set('med-de',m.de);set('med-at',m.at);set('med-hr',m.hr);
    set('med-he',m.he);set('med-vl',m.vl);set('med-vhe',m.vhe);set('med-dc',m.dc);
    set('med-vc',m.vc);set('med-st',m.st||'pendente');
    window._medVendas=(m.vendasVinc||[]).slice();if(typeof _rdMedVendas==='function')_rdMedVendas();if(typeof calcMed==='function')calcMed();
    const numEl=document.getElementById('med-num');
    if(numEl)numEl.value=`MEDIÇÃO Nº ${String(m.numMed||'?').padStart(3,'0')} (editando)`;
    if(typeof auditarExclusao==='function')auditarExclusao('medicoes','Medição aberta para EDIÇÃO: '+(m.cl||'')+' '+fmt(m.total||0));
    toast('Editando medição — alterações serão auditadas','ok');
  });
}

function togMedTipo(){
  var t=(document.getElementById('med-tipo')&&document.getElementById('med-tipo').value)||'cadastrado';
  var ctw=document.getElementById('med-ct-wrap');
  var pmw=document.getElementById('med-placa-man-wrap');
  if(t==='manual'){
    if(ctw)ctw.style.display='none';
    if(pmw)pmw.style.display='';
    _popPlacasMedMan();
  } else {
    if(ctw)ctw.style.display='';
    if(pmw)pmw.style.display='none';
  }
}
function _popPlacasMedMan(incluirId){
  var sel=document.getElementById('med-placa-man'); if(!sel)return;
  var atual=sel.value;
  sel.innerHTML='<option value="">Selecionar placa autorizada...</option>';
  var lista=(D.equips||[]).filter(function(e){return e.medManual;});
  (lista||[]).forEach(function(e){ sel.innerHTML+='<option value="'+e.id+'">'+e.placa+' — '+((e.medManual&&e.medManual.cliente)||'')+'</option>'; });
  if(incluirId && !lista.some(function(e){return e.id===incluirId;})){
    var ex=(D.equips||[]).find(function(e){return e.id===incluirId;});
    if(ex) sel.innerHTML+='<option value="'+ex.id+'">'+ex.placa+' (autorização encerrada)</option>';
  }
  if(atual)sel.value=atual;
}
function autoFillMedMan(){
  var e=(D.equips||[]).find(function(x){return x.id===(document.getElementById('med-placa-man')&&document.getElementById('med-placa-man').value);});
  if(!e||!e.medManual)return;
  var n=((D.medicoes||[]).filter(function(x){return x.manual&&x.placa===e.placa;}).length+1);
  var mn=document.getElementById('med-num'); if(mn)mn.value='MANUAL Nº '+String(n).padStart(3,'0');
  var vc=document.getElementById('med-vc'); if(vc&&!vc.value)vc.value=e.medManual.venc||'';
}
function _saveMedManual(){
  var eid=document.getElementById('med-eid')?document.getElementById('med-eid').value:'';
  if(!eid && typeof _ehFinanceiro==='function' && !_ehFinanceiro()){ toast('Apenas o Financeiro (ou admin) pode gerar medição manual.','er'); return; }
  var pmId=document.getElementById('med-placa-man')?document.getElementById('med-placa-man').value:'';
  var e=(D.equips||[]).find(function(x){return x.id===pmId;});
  var cl,placa,clienteId;
  if(e && e.medManual){ cl=e.medManual.cliente||''; placa=e.placa||''; clienteId=e.medManual.clienteId||''; }
  else if(eid){ var antm=D.medicoes.find(function(x){return x.id===eid;}); if(antm){ cl=antm.cl||''; placa=antm.placa||''; clienteId=antm.clienteId||''; } }
  if(!placa && !cl){ toast('Selecione a placa autorizada','er'); return; }
  var b=parseFloat(document.getElementById('med-vl').value)||0;
  var d=parseFloat(document.getElementById('med-dc').value)||0;
  var he=parseFloat(document.getElementById('med-he').value)||0;
  var vhe=parseFloat(document.getElementById('med-vhe').value)||0;
  var _vv=(window._medVendas||[]).slice();var _vvT=_vv.reduce(function(s,x){return s+(parseFloat(x.total)||0);},0);
  var total=(b+(he*vhe))-d+_vvT;
  if(b<=0 && total<=0){ toast('Informe o valor da medição','er'); return; }
  var campos={cl:cl,clienteId:clienteId,placa:placa,manual:true,ctId:'',ms:document.getElementById('med-ms').value,de:document.getElementById('med-de').value,at:document.getElementById('med-at').value,hr:document.getElementById('med-hr').value,he:he,vhe:vhe,vl:b,dc:d,total:total,vendasVinc:_vv,vc:document.getElementById('med-vc').value,st:document.getElementById('med-st').value,fluxo:'sim'};
  if(eid){
    var mIdx=D.medicoes.findIndex(function(x){return x.id===eid;});
    if(mIdx>-1){
      var ant=D.medicoes[mIdx];
      D.medicoes[mIdx]=Object.assign({},ant,campos);
      if(typeof auditarExclusao==='function')auditarExclusao('medicoes','Medição MANUAL alterada: '+(ant.cl||'')+' de '+fmt(ant.total||0)+' para '+fmt(total));
      document.getElementById('med-eid').value='';
      sv(); if(window.emailAutoSe)window.emailAutoSe('medicao',D.medicoes[mIdx]); closeM('m-med'); toast('Medição manual atualizada!','ok'); if(typeof updPendCnt==='function')updPendCnt(); rp(cur);
      return;
    }
  }
  campos.id=uid();
  campos.numMed=((D.medicoes||[]).filter(function(x){return x.manual&&x.placa===placa;}).length+1);
  D.medicoes.push(campos);
  if(typeof auditar==='function')auditar('CRIACAO','medicoes','Medição MANUAL gerada: '+cl+' ('+placa+') '+fmt(total));
  sv(); if(window.emailAutoSe)window.emailAutoSe('medicao',D.medicoes[D.medicoes.length-1]); closeM('m-med'); toast('Medição manual gerada! Entrou no Financeiro.','ok'); if(typeof updPendCnt==='function')updPendCnt(); rp(cur);
}
function saveMed(){if((document.getElementById('med-tipo')&&document.getElementById('med-tipo').value)==='manual'){return _saveMedManual();}const ctId=document.getElementById('med-ct').value;const ct=D.contratos.find(c=>c.id===ctId);if(!ctId){toast('Selecione o contrato','er');return;}
  // BLOQUEIO: sem saldo no contrato = sem medição (precisa aditivo)
  const podeM=podeMedirContrato(ctId);
  if(!podeM.ok){
    if(confirm(podeM.msg+'\n\nDeseja fazer o ADITIVO agora?')) aditivarContrato(ctId);
    return;
  }const b=parseFloat(document.getElementById('med-vl').value)||0,d=parseFloat(document.getElementById('med-dc').value)||0,he=parseFloat(document.getElementById('med-he').value)||0,vhe=parseFloat(document.getElementById('med-vhe').value)||0;const _vv=(window._medVendas||[]).slice();const _vvT=_vv.reduce(function(s,x){return s+(parseFloat(x.total)||0);},0);
  const medEid=document.getElementById('med-eid')?document.getElementById('med-eid').value:'';
  if(medEid){
    const mIdx=D.medicoes.findIndex(x=>x.id===medEid);
    if(mIdx>-1){
      const ant=D.medicoes[mIdx];
      D.medicoes[mIdx]={...ant,
        ms:document.getElementById('med-ms').value,de:document.getElementById('med-de').value,
        at:document.getElementById('med-at').value,hr:document.getElementById('med-hr').value,
        he,vhe,vl:b,dc:d,total:(b+(he*vhe))-d+_vvT,vendasVinc:_vv,
        vc:document.getElementById('med-vc').value,st:document.getElementById('med-st').value};
      if(typeof auditarExclusao==='function')auditarExclusao('medicoes','Medição ALTERADA: '+(ant.cl||'')+' de '+fmt(ant.total||0)+' para '+fmt((b+(he*vhe))-d));
      document.getElementById('med-eid').value='';
      sv();if(window.emailAutoSe)window.emailAutoSe('medicao',D.medicoes[mIdx]);closeM('m-med');toast('Medição atualizada!','ok');updPendCnt();rp(cur);
      return;
    }
  }
  D.medicoes.push({
    numMed:D.medicoes.filter(x=>x.ctId===ctId).length+1,id:uid(),ctId,cl:ct?ct.cl:'',placa:ct?ct.placa:'',ms:document.getElementById('med-ms').value,de:document.getElementById('med-de').value,at:document.getElementById('med-at').value,hr:document.getElementById('med-hr').value,he,vhe,vl:b,dc:d,total:(b+(he*vhe))-d+_vvT,vendasVinc:_vv,vc:document.getElementById('med-vc').value,st:document.getElementById('med-st').value,fluxo:'sim'});auditar('CRIACAO','medicoes','Medição criada: '+(ct?ct.cl:'')+' '+fmt((b+(he*vhe))-d));sv();if(window.emailAutoSe)window.emailAutoSe('medicao',D.medicoes[D.medicoes.length-1]);closeM('m-med');toast('Medição salva!');updPendCnt();rp(cur);}
function delMed(id){reqSenha(()=>{if(!confirm('Excluir?'))return;auditarExclusao('medicoes','Medição excluída');D.medicoes=D.medicoes.filter(x=>x.id!==id);sv();rdMeds();updPendCnt();toast('Excluída.');});}
function advMed(id){const m=D.medicoes.find(x=>x.id===id);if(!m)return;
  // Workflow da medição: pendente→enviada→aprovada (PAGO só no Financeiro)
  if(m.st==='paga'||m.st==='atrasado'||m.st==='remarcado'){toast('⚠️ Status financeiro só muda no módulo Financeiro','er');return;}
  const c=['pendente','enviada','aprovada'];
  const atual=c.indexOf(m.st);
  if(atual===c.length-1){toast('Medição já está Aprovada. Recebimento é confirmado no Financeiro (Contas a Receber).','ok');return;}
  m.st=c[atual+1]||'enviada';
  auditar('ALTERACAO','medicoes','Medição avançou para: '+m.st);
  sv();rdMeds();updPendCnt();}
function setStVenda(id, novoSt, sel){
  const v = D.vendas.find(x=>x.id===id);
  if(!v) return;
  if(novoSt==='remarcado'){
    const nd = prompt('Nova data de vencimento (AAAA-MM-DD):');
    if(!nd){ sel.value=v.st||'pendente'; return; }
    v.vc = nd;
    v.fluxo = 'sim';
    toast('Data remarcada para '+nd,'ok');
  }
  if(novoSt==='atrasado'){
    v.prejuizo = true;
    v.fluxo = 'nao';
    toast('⚠️ Venda marcada como Atrasado — entra como prejuízo!','er');
  } else {
    v.prejuizo = false;
    if(novoSt==='pago') v.fluxo = 'sim';
  }
  v.st = novoSt;
  sv();
  rdFin();
  if(typeof rdFluxo==='function') rdFluxo();
  if(novoSt==='pago') toast('✅ Venda marcada como Recebida!','ok');
}

function setStMed(id, novoSt, sel){
  const m = D.medicoes.find(x=>x.id===id);
  if(!m) return;
  if(novoSt==='remarcado'){
    const nd = prompt('Nova data de vencimento (AAAA-MM-DD):');
    if(!nd){ sel.value=m.st||'pendente'; return; }
    m.vc = nd;
    m.fluxo = 'sim'; // keeps in cash flow with new date
    toast('Data remarcada para '+nd,'ok');
  }
  if(novoSt==='atrasado'){
    // Atrasado: sai do contas a receber, entra como prejuízo operacional
    m.prejuizo = true;
    m.fluxo = 'nao'; // remove from regular cash flow
    toast('⚠️ Marcado como Atrasado — entra como prejuízo operacional!','er');
  } else {
    m.prejuizo = false;
    if(novoSt==='paga') m.fluxo = 'sim';
  }
  m.st = novoSt;
  sv();
  rdFin();
  rdFluxo();
  if(novoSt==='paga') toast('✅ Marcado como Recebido!','ok');
  else if(novoSt==='remarcado') toast('📅 Data remarcada!','ok');
}



