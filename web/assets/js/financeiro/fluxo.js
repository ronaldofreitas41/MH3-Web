// ---- FLUXO DE CAIXA (RELATÓRIO) ----
function rdRelFluxo2(){
  const periodo=document.getElementById('rel-periodo').value;
  const hoje=new Date();
  const meses=[];for(let i=11;i>=0;i--){const d=new Date(hoje.getFullYear(),hoje.getMonth()-i,1);meses.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));}
  const limitado=periodo==='mes'?[meses[meses.length-1]]:periodo==='trim'?meses.slice(-3):periodo==='ano'?meses.filter(m=>m.startsWith(hoje.getFullYear()+'')):meses;

  const rows=limitado.map(ms=>{
    const entMed=D.medicoes.filter(m=>m.ms===ms&&m.st==='paga').reduce((s,m)=>s+(m.total||0),0);
    const entVend=D.vendas.filter(v=>v.dt&&v.dt.startsWith(ms)&&v.st==='pago').reduce((s,v)=>s+(v.total||0),0);
    const saiDesp=D.despesas.filter(d=>d.dt&&d.dt.startsWith(ms)&&d.fluxo!=='nao').reduce((s,d)=>s+(d.vl||0),0);
    const saiNF=D.nfs.filter(n=>n.dt&&n.dt.startsWith(ms)&&n.cp==='sim').reduce((s,n)=>s+(n.vl||0),0);
    const ent=entMed+entVend;const sai=saiDesp+saiNF;const sal=ent-sai;
    return{ms,entMed,entVend,ent,saiDesp,saiNF,sai,sal};});

  let acu=0;const rowsAcu=rows.map(r=>{acu+=r.sal;return{...r,acu};});
  const totEnt=rows.reduce((s,r)=>s+r.ent,0);const totSai=rows.reduce((s,r)=>s+r.sai,0);
  const barData=rows.map(r=>({l:r.ms.substr(5),e:r.ent,s:r.sai}));
  const maxBar=Math.max(...barData.map(b=>Math.max(b.e,b.s)),1);

  const kpis=`<div class="krow c4" style="margin-bottom:12px">
    <div class="kpi gn"><div class="klbl">Total Entradas</div><div class="kval">${fmtk(totEnt)}</div></div>
    <div class="kpi rd"><div class="klbl">Total Saídas</div><div class="kval">${fmtk(totSai)}</div></div>
    <div class="kpi ${totEnt-totSai>=0?'gn':'rd'}"><div class="klbl">Saldo Período</div><div class="kval">${fmtk(totEnt-totSai)}</div></div>
    <div class="kpi bl"><div class="klbl">Acumulado</div><div class="kval">${fmtk(acu)}</div></div>
  </div>`;

  const grafico=`<div class="panel"><div class="ph"><div class="pt">Entradas × Saídas por Mês</div></div><div class="pb">
    <div style="display:flex;align-items:flex-end;gap:5px;height:100px;padding-top:8px">${barData.map(b=>{const he=Math.max(2,Math.round(b.e/maxBar*90));const hs=Math.max(2,Math.round(b.s/maxBar*90));return`<div style="display:flex;flex-direction:column;align-items:center;gap:2px;flex:1"><div style="display:flex;gap:2px;align-items:flex-end"><div style="width:10px;height:${he}px;background:var(--gn);border-radius:2px 2px 0 0;opacity:.85"></div><div style="width:10px;height:${hs}px;background:var(--red);border-radius:2px 2px 0 0;opacity:.75"></div></div><div style="font-size:8px;color:var(--mt)">${b.l}</div></div>`;}).join('')}</div>
    <div style="display:flex;gap:14px;justify-content:center;margin-top:7px;font-size:9px;color:var(--mt)"><span><span style="display:inline-block;width:8px;height:8px;background:var(--gn);border-radius:1px;margin-right:3px"></span>Entradas</span><span><span style="display:inline-block;width:8px;height:8px;background:var(--red);border-radius:1px;margin-right:3px"></span>Saídas</span></div>
  </div></div>`;

  const tabRes=`<div class="panel"><div class="ph"><div class="pt">Fluxo Mensal</div></div><div class="tw"><table><thead><tr><th>Mês</th><th>Entradas</th><th>Saídas</th><th>Saldo Mês</th><th>Acumulado</th></tr></thead><tbody>
  ${rowsAcu.map(r=>`<tr><td><b>${r.ms}</b></td><td style="color:var(--gn)">${fmt(r.ent)}</td><td style="color:var(--red)">${fmt(r.sai)}</td><td style="color:${r.sal>=0?'var(--gn)':'var(--red)'};font-weight:600">${fmt(r.sal)}</td><td style="color:var(--mt)">${fmt(r.acu)}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">Sem dados</td></tr>'}
  <tr style="background:var(--cd2)"><td style="font-weight:700">TOTAL</td><td style="color:var(--gn);font-weight:700">${fmt(totEnt)}</td><td style="color:var(--red);font-weight:700">${fmt(totSai)}</td><td style="color:${totEnt-totSai>=0?'var(--gn)':'var(--red)'};font-weight:700">${fmt(totEnt-totSai)}</td><td></td></tr>
  </tbody></table></div></div>`;

  const tabAna=`<div class="panel"><div class="ph"><div class="pt">Detalhamento por Mês — Analítico</div></div><div class="tw"><table><thead><tr><th>Mês</th><th>Med. Pagas</th><th>Vendas Pagas</th><th>Total Entradas</th><th>Despesas</th><th>NFs Pagas</th><th>Total Saídas</th><th>Saldo</th></tr></thead><tbody>
  ${rowsAcu.map(r=>`<tr><td><b>${r.ms}</b></td><td style="color:var(--gn)">${r.entMed?fmt(r.entMed):'-'}</td><td style="color:var(--pu)">${r.entVend?fmt(r.entVend):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(r.ent)}</td><td style="color:var(--or)">${r.saiDesp?fmt(r.saiDesp):'-'}</td><td style="color:var(--yw)">${r.saiNF?fmt(r.saiNF):'-'}</td><td style="color:var(--red);font-weight:600">${fmt(r.sai)}</td><td style="color:${r.sal>=0?'var(--gn)':'var(--red)'};font-weight:600">${fmt(r.sal)}</td></tr>`).join('')||'<tr><td colspan="8" class="empty">Sem dados</td></tr>'}</tbody></table></div></div>`;

  document.getElementById('rel-fluxo2-c').innerHTML=granBlock('',kpis+grafico+tabRes,kpis+grafico+tabRes,kpis+grafico+tabRes+tabAna);}

