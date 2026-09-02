// ============ PENDÊNCIAS ============
// Mostra ao usuário apenas os alertas/pendências dos módulos que ele tem permissão de ver.
function _filtrarPendsPorPermissao(pends){
  try{
    if(typeof ehAdminAtual==='function' && ehAdminAtual()) return pends; // admin vê todos
    var perms=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};
    return (pends||[]).filter(function(p){
      if(!p || !p.modulo) return true; // alerta sem módulo: mostra
      var chave=(typeof PERM_MENU_MOD!=='undefined' && PERM_MENU_MOD[p.modulo]) ? PERM_MENU_MOD[p.modulo] : p.modulo;
      return !!perms[chave];
    });
  }catch(e){ return pends; }
}
function calcPends(){const pends=[];const hoje=new Date();const mesAtual=hoje.getFullYear()+'-'+String(hoje.getMonth()+1).padStart(2,'0');
D.contratos.filter(c=>c.status==='ativo').forEach(ct=>{const eq=D.equips.find(e=>e.id===ct.eqId);if(!eq)return;const mns=[...D.manutencoes].filter(m=>m.eqId===ct.eqId&&m.tipo&&m.tipo.toLowerCase().includes('preventiva')).sort((a,b)=>new Date(b.en)-new Date(a.en));const lastMn=mns[0];const lastRev=(D.revisoes||[]).filter(r=>r.eqId===ct.eqId).sort((a,b)=>new Date(b.dt)-new Date(a.dt))[0];
if(lastMn&&lastRev){const km=parseFloat(lastRev.km)||0;const pkm=parseFloat(lastMn.pkm)||0;if(pkm&&km>=pkm)pends.push({tipo:'rd',icon:'🚨',txt:`Revisão VENCIDA — ${eq.placa}`,sub:`KM ${km} passou de ${pkm}`,modulo:'revisao'});else if(pkm&&km>=(pkm-1000))pends.push({tipo:'yw',icon:'⚠️',txt:`Revisão próxima — ${eq.placa}`,sub:`KM ${km} / Próx.: ${pkm}`,modulo:'revisao'});}
const revMes=(D.revisoes||[]).filter(r=>r.eqId===ct.eqId&&r.dt&&r.dt.startsWith(mesAtual));if(!revMes.length)pends.push({tipo:'yw',icon:'📍',txt:`Acomp. revisão não lançado — ${eq.placa}`,sub:`Contrato com ${ct.cl}`,modulo:'revisao'});
const medMes=D.medicoes.filter(m=>m.ctId===ct.id&&m.ms===mesAtual);if(!medMes.length)pends.push({tipo:'bl',icon:'📐',txt:`Medição não lançada — ${ct.cl}`,sub:`Equip.: ${ct.placa||'?'} · Mês: ${mesAtual}`,modulo:'medicoes'});
if(ct.ass==='pendente')pends.push({tipo:'yw',icon:'✍️',txt:`Contrato pendente assinatura — ${ct.cl}`,sub:`Equip.: ${ct.placa||'?'}`,modulo:'contratos'});});
D.medicoes.filter(m=>m.st!=='paga'&&m.vc).forEach(m=>{const d=dTo(m.vc);if(d!==null&&d<0)pends.push({tipo:'rd',icon:'💸',txt:`Medição VENCIDA — ${m.cl}`,sub:`Venc: ${m.vc} | ${fmt(m.total)}`,modulo:'financeiro'});else if(d!==null&&d<=(D.config.alertDias||5))pends.push({tipo:'yw',icon:'⏰',txt:`Medição vence em ${d}d — ${m.cl}`,sub:`Venc: ${m.vc} | ${fmt(m.total)}`,modulo:'financeiro'});});
D.vendas.filter(v=>v.st==='pendente').forEach(v=>{const d=dTo(v.dt);if(d!==null&&d<-7)pends.push({tipo:'yw',icon:'🛒',txt:`Venda pendente — ${v.cli}`,sub:`${v.num} | ${fmt(v.total)}`,modulo:'financeiro'});});
