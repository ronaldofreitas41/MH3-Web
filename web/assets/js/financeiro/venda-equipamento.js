function venderEq(id){
  const eq=D.equips.find(e=>e.id===id);
  if(!eq){toast('Veículo/Equipamento não encontrado','er');return;}
  if(eq.st==='vendido'){toast('Este veículo/equipamento já foi vendido','er');return;}
  document.getElementById('veq-eid').value=id;
  document.getElementById('veq-dt').value=new Date().toISOString().substring(0,10);
  document.getElementById('veq-comprador').value='';
  document.getElementById('veq-doc').value='';
  document.getElementById('veq-vl').value='';
  document.getElementById('veq-ob').value='';
  if(document.getElementById('veq-senha'))document.getElementById('veq-senha').value='';
  // Show equipment info
  const vaql=parseFloat(eq.vaql)||0;
  const info=document.getElementById('veq-info');
  if(info){
    info.innerHTML=`<b>${eq.placa}</b> — ${eq.mk} ${eq.mo} ${eq.an||''}<br>
    Valor aquisição: <b>${fmt(vaql)}</b> | Situação: <b>${eq.situ||'Quitado'}</b>
    ${eq.im?`<br>Implemento: ${eq.im_mk||''} ${eq.im_mo||''} — Valor: ${fmt(eq.im_vl||0)}`:''}`;
  }
  openM('m-venda-eq');
}


function toggleCondVendaEq(){
  const c=document.getElementById('veq-cond').value;
  const box=document.getElementById('veq-parc-box');
  if(box)box.style.display=c==='parcelado'?'':'none';
}

async function confirmarVendaEq(){
  const eid=document.getElementById('veq-eid').value;
  const eq=D.equips.find(e=>e.id===eid);
  if(!eq){toast('Veículo/Equipamento não encontrado','er');return;}
  const comprador=document.getElementById('veq-comprador').value.trim();
  const vl=parseFloat(document.getElementById('veq-vl').value)||0;
  const dt=document.getElementById('veq-dt').value;
  const tipo=document.getElementById('veq-tipo').value;
  if(!comprador){toast('Informe o comprador','er');return;}
  if(!vl){toast('Informe o valor de venda','er');return;}
  if(!dt){toast('Informe a data da venda','er');return;}
  const _senha=document.getElementById('veq-senha')?document.getElementById('veq-senha').value:'';
  if(!_senha){toast('Digite sua senha para confirmar a venda.','er');return;}
  const _ok=await _validarSenhaSolicitante(_senha);
  if(!_ok){toast('❌ Senha incorreta. Venda cancelada.','er');var _s=document.getElementById('veq-senha');if(_s){_s.value='';_s.focus();}return;}
  // Baixa automática na frota
  if(tipo==='ambos'||tipo==='equip'){
    eq.st='vendido';
    eq.dtVenda=dt;
    eq.comprador=comprador;
    eq.vlVenda=vl;
  }
  if(tipo==='impl'&&eq.im){
    eq.imVendido=true;
    eq.imDtVenda=dt;
    eq.imComprador=comprador;
    eq.imVlVenda=vl;
  }
  // Lança em Contas a Receber
  const vlVenda=tipo==='impl'?(parseFloat(eq.im_vl)||vl):vl;
  // CONDIÇÕES DA VENDA: à vista = 1 lançamento; parcelado = N lançamentos mensais
  const cond=document.getElementById('veq-cond')?document.getElementById('veq-cond').value:'avista';
  const nParcV=cond==='parcelado'?(parseInt(document.getElementById('veq-nparc').value)||2):1;
  const vc1=document.getElementById('veq-vc1')&&document.getElementById('veq-vc1').value?document.getElementById('veq-vc1').value:dt;
  const vlParcV=Math.round((vlVenda/nParcV)*100)/100;
  for(let pi=0;pi<nParcV;pi++){
    const dtV=new Date(vc1+'T12:00');dtV.setMonth(dtV.getMonth()+pi);
    D.medicoes.push({
      id:uid(),
      cl:comprador,
      de:'Venda '+tipo+(nParcV>1?' — Parcela '+(pi+1)+'/'+nParcV:''),
      at:dt,
      vc:dtV.toISOString().substring(0,10),
      vl:vlParcV,
      dc:0,
      total:vlParcV,
      placa:eq.placa,
      eqId:eid,
      st:'pendente',
      fluxo:'sim',
      tipo:'venda_equip',
      ob:document.getElementById('veq-ob').value,
      pag:document.getElementById('veq-pag')?document.getElementById('veq-pag').value:''
    });
  }
  auditar('CRIACAO','vendas','Venda equipamento '+eq.placa+' — '+fmt(vlVenda)+(nParcV>1?' em '+nParcV+'x':' à vista')+' → Contas a Receber');
  sv();closeM('m-venda-eq');
  rdFrota();rdFin();
  toast(`✅ Venda registrada! ${eq.placa} baixada da frota e lançada em Contas a Receber.`,'ok');
}


