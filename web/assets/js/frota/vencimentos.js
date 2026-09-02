// === VENCIMENTOS (todos respeitam a permissão pelo modulo) ===
// Seguros vencendo / vencidos (avisa 15 dias antes)
(D.seguros||[]).forEach(function(s){
  if(!s||!s.venc)return; var d=dTo(s.venc); if(d===null)return;
  var pl=(s.placas&&s.placas.length)?(' · '+s.placas.length+' placa(s)'):'';
  if(d<0)pends.push({tipo:'rd',icon:'🛡️',txt:`Seguro VENCIDO — ${s.seguradora||'apólice'}`,sub:`Venceu ${fmtData(s.venc)}${pl}`,modulo:'seguro'});
  else if(d<=15)pends.push({tipo:'yw',icon:'🛡️',txt:`Seguro vence em ${d}d — ${s.seguradora||'apólice'}`,sub:`Venc: ${fmtData(s.venc)}${pl}`,modulo:'seguro'});
});
// Documentos da frota: CRLV e ANTT
(D.equips||[]).forEach(function(e){
  if(!e||e.st==='vendido')return;
  [['crlv','CRLV'],['antt','ANTT / Licença']].forEach(function(p){
    var dt=e[p[0]]; if(!dt)return; var d=dTo(dt); if(d===null)return;
    if(d<0)pends.push({tipo:'rd',icon:'📄',txt:`${p[1]} VENCIDO — ${e.placa||'veículo'}`,sub:`Venceu ${fmtData(dt)}`,modulo:'frota'});
    else if(d<=(D.config.alertDias||5))pends.push({tipo:'yw',icon:'📄',txt:`${p[1]} vence em ${d}d — ${e.placa||'veículo'}`,sub:`Venc: ${fmtData(dt)}`,modulo:'frota'});
  });
});
// Contas a pagar (despesas) vencidas / a vencer
(D.despesas||[]).forEach(function(x){
  if(!x||x.st==='pago'||!x.vc||x.antigo)return; var d=dTo(x.vc); if(d===null)return;
  var nm=(x.cat||x.desc||x.forn||x.hist||'Conta'); var vl=x.vl?(' · '+fmt(x.vl)):'';
  if(d<0)pends.push({tipo:'rd',icon:'💸',txt:`Conta a pagar VENCIDA — ${nm}`,sub:`Venceu ${fmtData(x.vc)}${vl}`,modulo:'contas_pagar'});
  else if(d<=(D.config.alertDias||5))pends.push({tipo:'yw',icon:'💸',txt:`Conta a pagar vence em ${d}d — ${nm}`,sub:`Venc: ${fmtData(x.vc)}${vl}`,modulo:'contas_pagar'});
});
return _filtrarPendsPorPermissao(pends);}
function updPendCnt(){const p=calcPends().length;['ni-pend','ni-pend2'].forEach(id=>{const el=document.getElementById(id);if(el){el.textContent=p;el.style.display=p>0?'':'none';}});}

