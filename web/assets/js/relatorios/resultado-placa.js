// ---- RESULTADO POR PLACA ----
function goResultado(){
  // Populate plate selector
  const sel=document.getElementById('res-placa');
  if(sel){
    sel.innerHTML='<option value="">Todas as placas</option>';
    D.equips.forEach(e=>{sel.innerHTML+=`<option value="${e.id}">${e.placa} — ${e.mk} ${e.mo}</option>`;});
  }
  rdResultado();
}

function toggleResPeriodo(){
  const p=document.getElementById('res-periodo').value;
  const box=document.getElementById('res-custom-box');
  if(box) box.style.display=p==='custom'?'flex':'none';
  rdResultado();
}

function getResDatas(){
  const p=document.getElementById('res-periodo').value;
  const hoje=new Date();
  if(p==='geral') return {d1:null,d2:null};
  if(p==='custom'){
    return {d1:document.getElementById('res-dt1').value,d2:document.getElementById('res-dt2').value};
  }
  const d1=new Date(hoje); d1.setDate(d1.getDate()-parseInt(p));
  return {d1:d1.toISOString().substring(0,10),d2:hoje.toISOString().substring(0,10)};
}

function inPeriodo(data,d1,d2){
  if(!d1&&!d2) return true;
  if(!data) return false;
  if(d1&&data<d1) return false;
  if(d2&&data>d2) return false;
  return true;
}

function rdResultado(){
  const eqId=document.getElementById('res-placa').value;
  const visao=document.getElementById('res-visao').value;
  const {d1,d2}=getResDatas();
  const equips=eqId?D.equips.filter(e=>e.id===eqId):D.equips;

  let totalRec=0,totalOS=0,totalDesp=0,totalSeg=0,totalDoc=0,totalDeprec=0;
  const rows=[];

  equips.forEach(eq=>{
    // + Medições recebidas (receitas)
    const meds=D.medicoes.filter(m=>m.eqId===eq.id&&m.st==='paga'&&inPeriodo(m.vc||m.de,d1,d2));
    const recMed=meds.reduce((s,m)=>s+(m.total||0),0);

    // - OS (custos)
    const oss=D.manutencoes.filter(m=>m.eqId===eq.id&&inPeriodo(m.en,d1,d2)&&!ehImpressao(m));
    const custoOS=oss.reduce((s,m)=>s+(m.custo==='cliente'?0:(m.lancs||[]).reduce((ss,l)=>ss+l.qtd*l.val,0)),0);

    // - Despesas vinculadas à placa
    const desps=D.despesas.filter(d=>d.placa===eq.placa&&inPeriodo(d.dt,d1,d2));
    const custoDesp=desps.reduce((s,d)=>s+(parseFloat(d.vl)||0),0);

    // - Depreciação (anual * período)
    const desval=parseFloat(eq.desval)||0;
    const vaql=parseFloat(eq.vaql)||0;
    let deprec=0;
    if(desval>0&&vaql>0){
      const dias=d1&&d2?(new Date(d2)-new Date(d1))/(1000*60*60*24):365;
      deprec=(vaql*(desval/100))*(dias/365);
    }

    const resultado=recMed-custoOS-custoDesp-deprec;
    totalRec+=recMed; totalOS+=custoOS; totalDesp+=custoDesp; totalDeprec+=deprec;

    rows.push({eq,recMed,custoOS,custoDesp,deprec,resultado,meds,oss,desps});
  });

  const totalRes=totalRec-totalOS-totalDesp-totalDeprec;

  // Cards de totais
  const cards=document.getElementById('res-cards');
  if(cards) cards.innerHTML=`
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">RECEITAS</div><div style="font-size:22px;font-weight:700;color:var(--gn)">${fmt(totalRec)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">CUSTOS OS</div><div style="font-size:22px;font-weight:700;color:var(--red)">${fmt(totalOS)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">DESPESAS</div><div style="font-size:22px;font-weight:700;color:var(--red)">${fmt(totalDesp)}</div></div>
    <div class="kpi"><div style="font-size:10px;color:var(--mt)">DEPRECIAÇÃO</div><div style="font-size:22px;font-weight:700;color:var(--yw)">${fmt(totalDeprec)}</div></div>
    <div class="kpi" style="border-color:${totalRes>=0?'var(--gn)':'var(--red)'}"><div style="font-size:10px;color:var(--mt)">RESULTADO</div><div style="font-size:22px;font-weight:700;color:${totalRes>=0?'var(--gn)':'var(--red)'}">${fmt(totalRes)}</div></div>
  `;

  // Tabela
  const tab=document.getElementById('res-tabela');
  if(!tab) return;
  if(!rows.length){tab.innerHTML='<div class="empty">Nenhum veículo/equipamento encontrado</div>';return;}

  if(visao==='simples'){
    tab.innerHTML=`<div class="tw"><table>
      <thead><tr><th>Placa</th><th>Modelo</th><th>Receitas</th><th>Custos OS</th><th>Despesas</th><th>Depreciação</th><th>Resultado</th></tr></thead>
      <tbody>${rows.map(r=>`<tr>
        <td><b>${r.eq.placa}</b></td>
        <td style="font-size:11px">${r.eq.mk} ${r.eq.mo}</td>
        <td style="color:var(--gn)">${fmt(r.recMed)}</td>
        <td style="color:var(--red)">${fmt(r.custoOS)}</td>
        <td style="color:var(--red)">${fmt(r.custoDesp)}</td>
        <td style="color:var(--yw)">${fmt(r.deprec)}</td>
        <td style="font-weight:700;color:${r.resultado>=0?'var(--gn)':'var(--red)'}">${fmt(r.resultado)}</td>
      </tr>`).join('')}
      <tr style="font-weight:700;background:var(--cd2)">
        <td colspan="2">TOTAL</td>
        <td style="color:var(--gn)">${fmt(totalRec)}</td>
        <td style="color:var(--red)">${fmt(totalOS)}</td>
        <td style="color:var(--red)">${fmt(totalDesp)}</td>
        <td style="color:var(--yw)">${fmt(totalDeprec)}</td>
        <td style="color:${totalRes>=0?'var(--gn)':'var(--red)'}">${fmt(totalRes)}</td>
      </tr>
      </tbody></table></div>`;
  } else {
    // Detalhado: show each row with breakdown
    tab.innerHTML=rows.map(r=>`
      <div class="panel" style="margin-bottom:12px">
        <div class="ph"><div class="pt">${r.eq.placa} — ${r.eq.mk} ${r.eq.mo}</div>
          <span style="font-weight:700;color:${r.resultado>=0?'var(--gn)':'var(--red)'}">${fmt(r.resultado)}</span>
        </div>
        <div class="tw"><table>
          <thead><tr><th>Tipo</th><th>Descrição</th><th>Data</th><th>Valor</th></tr></thead>
          <tbody>
            ${r.meds.map(m=>`<tr><td><span class="badge b-gn">+ Medição</span></td><td>${m.cl||'-'}</td><td style="font-size:10px">${fmtData(m.vc)}</td><td style="color:var(--gn)">${fmt(m.total)}</td></tr>`).join('')}
            ${r.oss.map(o=>`<tr><td><span class="badge b-rd">- OS ${o.osNum||''}</span></td><td>${o.tipo||'-'}</td><td style="font-size:10px">${o.en||'-'}</td><td style="color:var(--red)">${fmt((o.lancs||[]).reduce((s,l)=>s+l.qtd*l.val,0))}</td></tr>`).join('')}
            ${r.desps.map(d=>`<tr><td><span class="badge b-yw">- Despesa</span></td><td>${d.desc||d.cat||'-'}</td><td style="font-size:10px">${fmtData(d.dt)}</td><td style="color:var(--red)">${fmt(d.vl)}</td></tr>`).join('')}
            ${r.deprec>0?`<tr><td><span class="badge b-yw">- Depreciação</span></td><td>Desvalorização ${r.eq.desval}% a.a.</td><td>-</td><td style="color:var(--yw)">${fmt(r.deprec)}</td></tr>`:''}
          </tbody>
        </table></div>
      </div>`).join('');
  }
}

function imprimirResultado(){imprimirComOpcoes("Resultado por Placa");}

function checarForcaSenha(){
  const s=document.getElementById('senha-nova').value;
  const el=document.getElementById('senha-forca');
  if(!el) return;
  if(!s){el.innerHTML='';return;}
  const temLetra=/[A-Za-z]/.test(s);
  const temNum=/[0-9]/.test(s);
  const tam=s.length>=8;
  let pts=0;
  if(tam)pts++; if(temLetra)pts++; if(temNum)pts++;
  if(s.length>=12)pts++;
  if(/[^A-Za-z0-9]/.test(s))pts++;
  let cor,txt;
  if(!tam||!temLetra||!temNum){cor='var(--red)';txt='⚠️ Fraca — precisa 8+ caracteres, letra e número';}
  else if(pts<=3){cor='var(--or)';txt='🟡 Razoável';}
  else if(pts==4){cor='var(--bl)';txt='🔵 Boa';}
  else{cor='var(--gn)';txt='🟢 Forte';}
  el.style.color=cor;el.textContent=txt;
}


init();
