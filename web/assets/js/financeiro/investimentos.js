// ---- INVESTIMENTOS (consórcios e bens em pagamento) ----
function addInvestimento(){
  const desc=document.getElementById('inv-desc').value.trim();
  if(!desc){toast('Informe a descrição','er');return;}
  const inv={
    id:uid(),desc,
    tipo:document.getElementById('inv-tipo').value,
    adm:document.getElementById('inv-adm').value.trim(),
    valorCarta:parseFloat(document.getElementById('inv-valor-carta').value)||0,
    nparc:parseInt(document.getElementById('inv-nparc').value)||0,
    parcpg:parseInt(document.getElementById('inv-parcpg').value)||0,
    vparc:parseFloat(document.getElementById('inv-vparc').value)||0,
    dt:document.getElementById('inv-dt').value,
    diaVenc:parseInt(document.getElementById('inv-dia-venc').value)||10,
    obs:document.getElementById('inv-obs').value.trim(),
    status:'andamento',reajustes:[]
  };
  D.investimentos.push(inv);
  // Lança TODAS as parcelas restantes no Contas a Pagar (igual financiamento de frota)
  const lancadas=lancarParcelasInvestimento(inv);
  auditar('CRIACAO','financeiro','Investimento cadastrado: '+desc+' ('+lancadas+' parcelas no Contas a Pagar)');
  ['inv-desc','inv-adm','inv-valor-carta','inv-nparc','inv-parcpg','inv-vparc','inv-obs'].forEach(i=>{const el=document.getElementById(i);if(el)el.value='';});
  sv();rdInvestimento();
  toast('Investimento cadastrado! '+lancadas+' parcelas lançadas no Contas a Pagar.','ok');
}

function lancarParcelasInvestimento(inv){
  // Lança as parcelas RESTANTES (das já pagas+1 até o total) no Contas a Pagar, uma por mês
  const total=inv.nparc||0;
  const jaPagas=inv.parcpg||0;
  if(total<=jaPagas) return 0;
  // Base: data de início é o vencimento da 1ª parcela. Parcela N vence em início + (N-1) meses.
  const base=inv.dt?new Date(inv.dt+'T12:00'):new Date();
  const dia=inv.diaVenc||base.getDate();
  let count=0;
  for(let i=jaPagas+1;i<=total;i++){
    const dt=new Date(base);
    dt.setMonth(dt.getMonth()+(i-1));
    dt.setDate(Math.min(dia, new Date(dt.getFullYear(),dt.getMonth()+1,0).getDate()));
    D.despesas.push({
      id:uid(),
      desc:'INVESTIMENTO — '+inv.desc+' (parcela '+i+'/'+total+')',
      cat:'Investimento',
      vl:inv.vparc||0,
      dt:new Date().toISOString().substring(0,10),
      vc:dt.toISOString().substring(0,10),
      st:'pendente',fluxo:'sim',cp:'sim',
      forn:inv.adm||inv.desc,
      ob:'Consórcio/Investimento'+(inv.obs?' — '+inv.obs:''),
      origemInv:inv.id,
      parcela:i,totalParc:total,
      travada:true
    });
    count++;
  }
  return count;
}

function statusInvLabel(s){return s==='contemplado'?'Contemplado':s==='utilizado'?'Na Frota':s==='quitado'?'Quitado':'Em Andamento';}
/* ===== MÓDULO SEGURO (apólices por placa) ===== */
function _segNorm(p){return String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function _segAtivoVeic(placa){
  var pl=_segNorm(placa); if(!pl) return null;
  var c=(D.seguros||[]).filter(function(s){return (s.placas||[]).some(function(p){return _segNorm(p)===pl;});});
  if(!c.length) return null;
  c.sort(function(a,b){return (b.venc||'').localeCompare(a.venc||'');});
  return c[0];
}
function _segStatus(venc){
  if(!venc) return {txt:'sem vencimento',sty:'background:#e5e7eb;color:#374151',dias:null};
  var h=new Date();h.setHours(0,0,0,0);
  var d=new Date(venc+'T00:00:00');
  var dias=Math.round((d-h)/86400000);
  if(dias<0) return {txt:'VENCIDO há '+(-dias)+'d',sty:'background:#fee2e2;color:#b91c1c',dias:dias};
  if(dias<=15) return {txt:'vence em '+dias+'d',sty:'background:#fef3c7;color:#b45309',dias:dias};
  return {txt:'em dia',sty:'background:#dcfce7;color:#15803d',dias:dias};
}
function _segBadge(venc){var st=_segStatus(venc);return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;'+st.sty+'">'+st.txt+'</span>';}
function _seguroInfoHtml(placa){
  var s=_segAtivoVeic(placa);
  if(!s) return '<span style="color:#C8102E;font-weight:700">⚠️ SEM SEGURO</span> — marque esta placa numa apólice na aba Seguro.';
  return '<b>'+escH(s.seguradora||'-')+'</b>'+(s.apolice?(' · Apólice '+escH(s.apolice)):'')+' · vence '+fmtData(s.venc)+'<br>'+_segBadge(s.venc);
}
function rdSeguro(){
  var tb=document.getElementById('seg-tb'); if(!tb) return;
  var lista=(D.seguros||[]).slice().sort(function(a,b){return (a.venc||'').localeCompare(b.venc||'');});
  tb.innerHTML = !lista.length
    ? '<tr><td colspan="6" class="empty">Nenhuma apólice cadastrada. Clique em "+ Apólice".</td></tr>'
    : lista.map(function(s){
        var placas=(s.placas||[]); var pt=placas.join(', ')||'—';
        return '<tr>'+
          '<td><b>'+escH(s.seguradora||'-')+'</b></td>'+
          '<td style="font-size:11px">'+escH(s.apolice||'-')+'</td>'+
          '<td style="font-size:11px">'+(s.inicio?fmtData(s.inicio)+' a ':'')+'<b>'+fmtData(s.venc)+'</b><br>'+_segBadge(s.venc)+'</td>'+
          '<td style="font-size:11px">'+(s.valor?fmt(s.valor):'-')+'</td>'+
          '<td style="font-size:10px;color:var(--mt)" title="'+escH(pt)+'"><b>'+placas.length+'</b> placa(s)<br>'+escH(pt.length>50?pt.slice(0,50)+'…':pt)+'</td>'+
          '<td style="white-space:nowrap"><button class="btn bw btn-xs" onclick="editSeguro(\''+s.id+'\')">✏</button> <button class="btn bd btn-xs" onclick="delSeguro(\''+s.id+'\')">×</button></td>'+
        '</tr>';
      }).join('');
  var cob={}; (D.seguros||[]).forEach(function(s){(s.placas||[]).forEach(function(p){cob[_segNorm(p)]=1;});});
  var sem=(D.equips||[]).filter(function(e){return e.st!=='vendido' && !cob[_segNorm(e.placa)];});
  var ss=document.getElementById('seg-semseguro');
  if(ss){ ss.innerHTML = !sem.length
    ? '<div style="color:#15803d;font-size:12px">✅ Todos os veículos ativos estão em alguma apólice.</div>'
    : '<div style="font-weight:700;color:#C8102E;font-size:12px;margin-bottom:6px">⚠️ '+sem.length+' veículo(s) SEM SEGURO:</div><div style="display:flex;flex-wrap:wrap;gap:5px">'+sem.map(function(e){return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:#fee2e2;color:#b91c1c">'+escH(e.placa||'?')+' '+escH(e.mo||'')+'</span>';}).join('')+'</div>';
  }
  var al=document.getElementById('seg-alertas');
  if(al){
    var av=lista.filter(function(s){var st=_segStatus(s.venc);return st.dias!==null && st.dias<=15;});
    if(!av.length){ al.style.display='none'; al.innerHTML=''; }
    else { al.style.display='block'; al.innerHTML='<b>🔔 Seguros a vencer / vencidos:</b>'+av.map(function(s){var st=_segStatus(s.venc);return '<div style="margin-top:3px">• <b>'+escH(s.seguradora||'-')+'</b> (apólice '+escH(s.apolice||'-')+') — '+st.txt+'. Gere a renovação ou tire as placas.</div>';}).join(''); }
  }
}
function openSeguro(){ window._segEdit=null; _segPreencheModal({}); openM('m-seguro'); }
function editSeguro(id){ var s=(D.seguros||[]).find(function(x){return x.id===id;}); if(!s)return; window._segEdit=id; _segPreencheModal(s); openM('m-seguro'); }
function _segPreencheModal(s){
  s=s||{};
  var set=function(id,v){var el=document.getElementById(id);if(el)el.value=(v===undefined||v===null)?'':v;};
  set('seg-seguradora',s.seguradora); set('seg-apolice',s.apolice);
  set('seg-inicio',s.inicio); set('seg-venc',s.venc);
  set('seg-valor', s.valor?(''+s.valor).replace('.',','):''); set('seg-obs',s.obs);
  var ttl=document.getElementById('seg-mtitle'); if(ttl) ttl.textContent=(window._segEdit?'✏️ Editar Apólice':'🛡️ Nova Apólice');
  var box=document.getElementById('seg-placas');
  if(box){
    var sel=(s.placas||[]).map(_segNorm);
    var eqs=(D.equips||[]).filter(function(e){return e.st!=='vendido';}).slice().sort(function(a,b){return (a.placa||'').localeCompare(b.placa||'');});
    box.innerHTML = eqs.length ? eqs.map(function(e){
      var ck=sel.indexOf(_segNorm(e.placa))>=0?'checked':'';
      return '<label style="display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:12px;cursor:pointer"><input type="checkbox" class="seg-pl-chk" value="'+escH(e.placa||'')+'" '+ck+'> <b>'+escH(e.placa||'?')+'</b> <span style="color:var(--mt)">'+escH((e.mk||'')+' '+(e.mo||''))+'</span></label>';
    }).join('') : '<div style="color:var(--mt);font-size:12px">Nenhum veículo cadastrado.</div>';
  }
  setTimeout(function(){var b=document.getElementById('seg-busca-placa'); if(b)b.value='';},30);
}
function _segFiltraPlacas(q){ q=(q||'').toLowerCase(); document.querySelectorAll('#seg-placas label').forEach(function(l){ l.style.display=l.textContent.toLowerCase().indexOf(q)>=0?'flex':'none'; }); }
function _segMarcarTodas(v){ document.querySelectorAll('#seg-placas .seg-pl-chk').forEach(function(c){ var lab=c.closest('label'); if(!lab||lab.style.display!=='none') c.checked=v; }); }
function saveSeguro(){
  var g=function(id){var el=document.getElementById(id);return el?(el.value||'').trim():'';};
  var seguradora=g('seg-seguradora'), venc=g('seg-venc');
  if(!seguradora){ if(typeof toast==='function')toast('Informe a seguradora.','er'); return; }
  if(!venc){ if(typeof toast==='function')toast('Informe o vencimento.','er'); return; }
  var placas=[]; document.querySelectorAll('#seg-placas .seg-pl-chk:checked').forEach(function(c){ placas.push(c.value); });
  var valNum = (typeof _parseValorBR==='function') ? _parseValorBR(g('seg-valor')) : (parseFloat((g('seg-valor')||'0').replace(/\./g,'').replace(',','.'))||0);
  var obj={ seguradora:seguradora, apolice:g('seg-apolice'), inicio:g('seg-inicio'), venc:venc, valor:valNum, obs:g('seg-obs'), placas:placas };
  if(window._segEdit){
    var i=(D.seguros||[]).findIndex(function(x){return x.id===window._segEdit;});
    if(i>=0){ obj.id=window._segEdit; D.seguros[i]={...D.seguros[i],...obj}; }
    if(typeof auditar==='function') auditar('ALTERACAO','seguro','Editou apólice '+seguradora+' ('+placas.length+' placas), venc '+venc);
  } else {
    obj.id='seg_'+Date.now()+'_'+Math.floor(Math.random()*999);
    D.seguros=D.seguros||[]; D.seguros.push(obj);
    if(typeof auditar==='function') auditar('CRIACAO','seguro','Nova apólice '+seguradora+' ('+placas.length+' placas), venc '+venc);
  }
  if(typeof sv==='function') sv();
  if(typeof closeM==='function') closeM('m-seguro');
  rdSeguro();
  if(typeof toast==='function') toast('Apólice salva.','ok');
}
function delSeguro(id){
  if(typeof ehAdminAtual==='function' && !ehAdminAtual()){ if(typeof toast==='function')toast('Apenas o administrador pode excluir apólices.','er'); return; }
  var s=(D.seguros||[]).find(function(x){return x.id===id;}); if(!s)return;
  if(!confirm('Excluir a apólice da '+(s.seguradora||'?')+'?\nAs placas dela ficarão SEM SEGURO.')) return;
  reqSenha(function(){
    D.seguros=(D.seguros||[]).filter(function(x){return x.id!==id;});
    if(typeof auditarExclusao==='function') auditarExclusao('seguro','Excluiu apólice '+(s.seguradora||'?'));
    if(typeof sv==='function') sv();
    rdSeguro();
    if(typeof toast==='function') toast('Apólice excluída.','ok');
  });
}
function imprimirSeguro(){ if(typeof imprimirComOpcoes==='function') imprimirComOpcoes('Seguro — Apólices e Vencimentos'); else window.print(); }

function rdInvestimento(){
  const dtEl=document.getElementById('inv-dt');
  if(dtEl&&!dtEl.value)dtEl.value=new Date().toISOString().substring(0,10);
  const tb=document.getElementById('inv-tb');
  if(!tb)return;
  const lista=D.investimentos||[];
  let totalPago=0;
  tb.innerHTML=lista.length?lista.map(inv=>{
    const pagoAcum=(inv.parcpg||0)*(inv.vparc||0);
    totalPago+=pagoAcum;
    const faltam=Math.max(0,(inv.nparc||0)-(inv.parcpg||0));
    const badge=inv.status==='utilizado'?'b-gn':inv.status==='contemplado'?'b-cy':inv.status==='quitado'?'b-pu':'b-yw';
    return `<tr>
      <td><b>${inv.desc}</b>${inv.adm?'<br><span style="font-size:10px;color:var(--mt)">'+inv.adm+'</span>':''}</td>
      <td style="font-size:11px">${inv.tipo}</td>
      <td>${fmt(inv.valorCarta)}</td>
      <td style="font-size:11px">${inv.parcpg||0}/${inv.nparc||0}${faltam>0?'<br><span style="color:var(--red);font-size:10px">faltam '+faltam+'</span>':''}</td>
      <td>${fmt(inv.vparc)}</td>
      <td style="color:var(--bl);font-weight:600">${fmt(pagoAcum)}</td>
      <td><span class="badge ${badge}">${statusInvLabel(inv.status)}</span></td>
      <td style="white-space:nowrap">
        ${inv.status!=='utilizado'?`<button class="btn bw btn-xs" onclick="reajusteInv('${inv.id}')" title="Reajustar parcela (atualiza as futuras no Contas a Pagar)">📊 Reajuste</button>
        <button class="btn bb btn-xs" onclick="enviarInvFrota('${inv.id}')" title="Contemplado: enviar para a Frota">🚚 Frota</button>`:''}
        <button class="btn bd btn-xs" onclick="delInvestimento('${inv.id}')" title="Excluir">×</button>
      </td>
    </tr>`;
  }).join(''):'<tr><td colspan="8" class="empty">Nenhum investimento cadastrado</td></tr>';
  const tEl=document.getElementById('inv-total');if(tEl)tEl.textContent=fmt(totalPago);
}
function pagarParcelaInv(id){
  const inv=D.investimentos.find(x=>x.id===id);
  if(!inv)return;
  if((inv.parcpg||0)>=(inv.nparc||0)){toast('Todas as parcelas já foram pagas','er');return;}
  const hoje=new Date();
  const venc=new Date(hoje.getFullYear(),hoje.getMonth(),inv.diaVenc||10).toISOString().substring(0,10);
  inv.parcpg=(inv.parcpg||0)+1;
  // Lança em Contas a Pagar
  D.despesas.push({
    id:uid(),desc:'INVESTIMENTO — '+inv.desc+' (parcela '+inv.parcpg+'/'+inv.nparc+')',
    cat:'Investimento',vl:inv.vparc,dt:venc,vc:venc,st:'pendente',fluxo:'sim',cp:'sim',
    forn:inv.adm||inv.desc,ob:'Consórcio/Investimento'+(inv.obs?' — '+inv.obs:''),origemInv:id
  });
  if(inv.parcpg>=inv.nparc)inv.status='quitado';
  auditar('CRIACAO','financeiro','Parcela investimento paga: '+inv.desc+' ('+inv.parcpg+'/'+inv.nparc+') → Contas a Pagar');
  sv();rdInvestimento();
  toast('Parcela '+inv.parcpg+'/'+inv.nparc+' lançada em Contas a Pagar!','ok');
}
function reajusteInv(id){
  const inv=D.investimentos.find(x=>x.id===id);
  if(!inv)return;
  const novo=prompt('Reajuste de '+inv.desc+'\nValor atual da parcela: '+fmt(inv.vparc)+'\n\nNovo valor da parcela (R$):');
  if(novo===null)return;
  const nv=parseFloat(novo.replace(',','.'))||0;
  if(nv<=0){toast('Valor inválido','er');return;}
  const mes=new Date().toISOString().substring(0,7);
  inv.reajustes=inv.reajustes||[];
  inv.reajustes.push({mes,de:inv.vparc,para:nv});
  inv.vparc=nv;
  // Atualiza as parcelas FUTURAS ainda pendentes no Contas a Pagar com o novo valor
  let atualizadas=0;
  D.despesas.forEach(d=>{if(d.origemInv===inv.id && d.st!=='pago'){d.vl=nv;atualizadas++;}});
  auditar('ALTERACAO','financeiro','Reajuste investimento '+inv.desc+': '+fmt(inv.reajustes[inv.reajustes.length-1].de)+' → '+fmt(nv)+' ('+atualizadas+' parcelas pendentes atualizadas)');
  sv();rdInvestimento();
  toast('Reajuste aplicado! '+atualizadas+' parcelas pendentes atualizadas para '+fmt(nv),'ok');
}
function enviarInvFrota(id){
  const inv=D.investimentos.find(x=>x.id===id);
  if(!inv)return;
  if(!confirm('Enviar "'+inv.desc+'" para a Frota?\n\nSerá criado um veículo/equipamento com os dados do investimento ('+inv.parcpg+' parcelas pagas, '+fmt(inv.parcpg*inv.vparc)+' investido).'))return;
  // Cria entrada na frota vinculada ao investimento
  const novoEq={
    id:uid(),
    pl:'(definir placa)',placa:'(definir placa)',
    mk:inv.desc,mo:'',an:'',ch:'',
    st:'disponivel',cond:'novo',
    situ:inv.tipo==='consorcio'?'consorcio':'financiado',
    vaql:inv.valorCarta||0,
    daql:new Date().toISOString().substring(0,10),
    nparc:inv.nparc||0,parcpg:inv.parcpg||0,
    vparc:inv.vparc||0,banco:inv.adm||'',
    origemInvestimento:id,
    ob:'Originado do investimento: '+inv.desc+' | '+inv.parcpg+' parcelas pagas | Investido: '+fmt(inv.parcpg*inv.vparc)+(inv.obs?' | '+inv.obs:'')
  };
  D.equips.push(novoEq);
  inv.status='utilizado';inv.eqId=novoEq.id;
  auditar('CRIACAO','frota','Investimento contemplado enviado à Frota: '+inv.desc);
  sv();rdInvestimento();
  toast('Enviado para a Frota! Edite o veículo para definir a placa e completar os dados.','ok');
  setTimeout(()=>{if(confirm('Ir para a Frota agora para completar o cadastro?'))go('frota');},800);
}
function delInvestimento(id){
  reqSenha(()=>{
    const inv=D.investimentos.find(x=>x.id===id);
    if(!inv)return;
    if(!confirm('Excluir o investimento "'+inv.desc+'"?'))return;
    D.investimentos=D.investimentos.filter(x=>x.id!==id);
    // Remove as parcelas pendentes deste investimento do Contas a Pagar (mantém as já pagas)
    const antes=D.despesas.length;
    D.despesas=D.despesas.filter(d=>!(d.origemInv===id && d.st!=='pago'));
    const removidas=antes-D.despesas.length;
    auditar('EXCLUSAO','financeiro','Investimento excluído: '+inv.desc+' ('+removidas+' parcelas pendentes removidas)');
    sv();rdInvestimento();
    toast('Investimento excluído ('+removidas+' parcelas pendentes removidas do Contas a Pagar)','ok');
  });
}

