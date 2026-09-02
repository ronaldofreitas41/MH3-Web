// ---- CALENDÁRIO DE COMPROMISSOS ----
let agendaRef=new Date();
function mudarMesAgenda(d){agendaRef.setMonth(agendaRef.getMonth()+d);rdAgenda();}
function agendaHoje(){agendaRef=new Date();rdAgenda();}
function eventosDoMes(ano,mes){
  // Retorna {dia: [eventos]} para o mês (mes 0-11)
  const mm=String(mes+1).padStart(2,'0');
  const pref=ano+'-'+mm;
  const ev={};
  const add=(dia,cor,txt)=>{if(!ev[dia])ev[dia]=[];ev[dia].push({cor,txt});};
  // A receber (medições/vendas pendentes)
  (D.medicoes||[]).forEach(m=>{const d=m.vc||(m.ms?m.ms+'-01':'');if(d&&d.startsWith(pref)&&m.st!=='recebido'&&m.st!=='pago')add(parseInt(d.substring(8,10)),'var(--gn)','💵 '+(m.cl||'Medição')+' '+fmt(m.total||0));});
  (D.vendas||[]).forEach(v=>{if(v.vc&&v.vc.startsWith(pref)&&v.st!=='recebido')add(parseInt(v.vc.substring(8,10)),'var(--gn)','💵 Venda '+fmt(v.total||0));});
  // A pagar (despesas/nfs pendentes)
  (D.despesas||[]).forEach(dp=>{const d=dp.vc||dp.dt;if(d&&d.startsWith(pref)&&dp.st!=='pago')add(parseInt(d.substring(8,10)),'var(--red)','💸 '+(dp.desc||'Despesa').substring(0,18)+' '+fmt(parseFloat(dp.vl)||0));});
  (D.nfs||[]).forEach(n=>{const d=n.vc||n.dt;if(d&&d.startsWith(pref)&&n.st!=='pago')add(parseInt(d.substring(8,10)),'var(--red)','💸 NF '+(n.num||'')+' '+fmt(parseFloat(n.vl)||0));});
  // Manutenções
  (D.manutencoes||[]).forEach(m=>{const d=m.dt||m.data||m.en;if(d&&d.startsWith(pref))add(parseInt(d.substring(8,10)),'var(--or)','🔧 OS '+(m.placa||''));});
  // Revisões agendadas
  (D.revisoes||[]).forEach(r=>{const d=r.prox||r.data||r.dt;if(d&&d.startsWith(pref))add(parseInt(d.substring(8,10)),'var(--or)','🔄 Revisão '+(r.placa||''));});
  // Aniversários (qualquer ano)
  (D.funcionarios||[]).forEach(f=>{if(f.nasc){const mt=f.nasc.match(/^\d{4}-(\d{2})-(\d{2})/);if(mt&&mt[1]===mm)add(parseInt(mt[2]),'var(--pu)','🎂 '+f.nome);}});
  return ev;
}
function rdAgenda(){
  const grid=document.getElementById('agenda-grid');
  if(!grid)return;
  const ano=agendaRef.getFullYear(),mes=agendaRef.getMonth();
  const meses=['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const lbl=document.getElementById('agenda-mes-lbl');if(lbl)lbl.textContent=meses[mes]+' '+ano;
  const ev=eventosDoMes(ano,mes);
  const primeiroDia=new Date(ano,mes,1).getDay();
  const diasNoMes=new Date(ano,mes+1,0).getDate();
  const hojeStr=new Date().toISOString().substring(0,10);
  const dias=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  let h='<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px">';
  dias.forEach(d=>h+=`<div style="text-align:center;font-size:11px;font-weight:700;color:var(--mt);padding:4px">${d}</div>`);
  for(let i=0;i<primeiroDia;i++)h+='<div></div>';
  for(let dia=1;dia<=diasNoMes;dia++){
    const dataStr=ano+'-'+String(mes+1).padStart(2,'0')+'-'+String(dia).padStart(2,'0');
    const ehHoje=dataStr===hojeStr;
    const evs=ev[dia]||[];
    h+=`<div style="min-height:80px;border:1px solid var(--br);border-radius:6px;padding:4px;${ehHoje?'background:var(--rg);border-color:var(--rd)':''}">
      <div style="font-size:11px;font-weight:${ehHoje?'700':'500'};color:${ehHoje?'var(--rd)':'var(--tx)'};margin-bottom:2px">${dia}</div>
      ${evs.slice(0,4).map(e=>`<div style="font-size:9px;padding:1px 3px;margin-bottom:1px;border-radius:3px;background:${e.cor};color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.txt}">${e.txt}</div>`).join('')}
      ${evs.length>4?`<div style="font-size:9px;color:var(--mt)">+${evs.length-4} mais</div>`:''}
    </div>`;
  }
  h+='</div>';
  grid.innerHTML=h;
}

