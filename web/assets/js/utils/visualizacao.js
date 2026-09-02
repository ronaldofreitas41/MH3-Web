// ============ VISUALIZAÇÃO DETALHADA (LUPA) ============
function verOSClHTML(m){
  if(!m.checklist||!m.checklist.length)return '';
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  var concluida=(m.status||'aberta')==='concluida';
  var clOk=m.checklist.filter(function(i){return i.ck;}).length, clTot=m.checklist.length;
  var grupos={}, ordem=[];
  m.checklist.forEach(function(i,idx){var g=i.grupo||'Itens';if(!grupos[g]){grupos[g]=[];ordem.push(g);}grupos[g].push({i:i,idx:idx});});
  var aviso=concluida?'<span style="font-size:9px;color:var(--mt)">🔒 OS concluída — somente leitura</span>':'<span style="font-size:9px;color:var(--cy)">toque para marcar ✓</span>';
  var html='<div class="rel-card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px">CHECKLIST ('+clOk+'/'+clTot+')</div>'+aviso+'</div>';
  ordem.forEach(function(g){
    if(ordem.length>1 || g!=='Itens') html+='<div style="font-size:10px;font-weight:700;color:var(--cy);margin:6px 0 3px">📋 '+escH(g)+'</div>';
    html+=grupos[g].map(function(o){
      var i=o.i, idx=o.idx;
      var clickAttr=concluida?'':' onclick="togVerOSCl(\''+m.id+'\','+idx+')"';
      var cursor=concluida?'':'cursor:pointer;';
      var box='<span style="display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:3px;border:2px solid '+(i.ck?'var(--gn)':'var(--br2)')+';background:'+(i.ck?'var(--gn)':'transparent')+';color:#fff;font-size:11px;flex-shrink:0">'+(i.ck?'✓':'')+'</span>';
      return '<div'+clickAttr+' style="display:flex;align-items:center;gap:7px;padding:4px 2px;border-radius:4px;'+cursor+'">'+box+'<span style="font-size:11px;'+(i.ck?'text-decoration:line-through;color:var(--mt)':'')+'">'+escH(i.txt)+'</span></div>';
    }).join('');
  });
  html+='</div>';
  return html;
}
function togVerOSCl(osId, idx){
  var m=D.manutencoes.find(function(x){return x.id===osId;});
  if(!m||!m.checklist||!m.checklist[idx])return;
  if((m.status||'aberta')==='concluida'){ toast('OS concluída — checklist não pode ser alterado.','er'); return; }
  m.checklist[idx].ck=!m.checklist[idx].ck;
  sv();
  verOS(osId);
}
function verOS(id){
  const m=D.manutencoes.find(x=>x.id===id);if(!m)return;
  const eq=D.equips.find(e=>e.id===m.eqId);
  document.getElementById('view-title').textContent=`🔍 OS ${m.osNum||'—'} — ${m.eqLbl}`;
  const clOk=m.checklist?m.checklist.filter(i=>i.ck).length:0;
  const clTot=m.checklist?m.checklist.length:0;
  document.getElementById('view-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--red)">
      <div><div style="font-family:'Bebas Neue';font-size:22px;color:var(--cy)">${m.osNum||'OS'}</div><div style="font-size:10px;color:var(--mt)">${m.tipo} · ${m.en||'-'} → ${m.sa||'Em aberto'}</div></div>
      <div style="text-align:right">${bdg(m.status||'aberta')} ${bdg(m.custo||'mh3')}<div style="font-family:'Bebas Neue';font-size:20px;color:var(--gn);margin-top:2px">${fmt(m.total)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
      <div class="rel-card"><div class="stat-label">Veículo/Equipamento</div><div class="stat-value"><span class="tag-p">${m.placa||'-'}</span></div>${eq?`<div style="font-size:9px;color:var(--mt)">${eq.mk} ${eq.mo}</div>`:''}</div>
      <div class="rel-card"><div class="stat-label">KM / Horímetro</div><div class="stat-value">${m.km||'-'} / ${m.hr||'-'}h</div></div>
      <div class="rel-card"><div class="stat-label">Próxima Revisão</div><div class="stat-value">${m.pkm||'-'}km / ${m.phr||'-'}h</div></div>
      <div class="rel-card"><div class="stat-label">Responsável</div><div class="stat-value">${m.resp||'-'}</div></div>
      <div class="rel-card"><div class="stat-label">Checklist</div><div class="stat-value">${clOk}/${clTot} <span style="font-size:9px;color:var(--mt)">itens</span></div></div>
      <div class="rel-card"><div class="stat-label">Produtos/Peças</div><div class="stat-value">${m.lancs?m.lancs.length:0} <span style="font-size:9px;color:var(--mt)">lançamentos</span></div></div>
    </div>
    ${m.ob?`<div class="rel-card" style="margin-bottom:10px"><div class="stat-label">Observações</div><div style="font-size:11px;margin-top:4px">${m.ob}</div></div>`:''}
    ${verOSClHTML(m)}
    ${m.lancs&&m.lancs.length?`<div class="rel-card" style="margin-bottom:10px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">PRODUTOS / PEÇAS (${m.lancs.length})</div>
    ${m.lancs.map(l=>`<div class="lanc-row"><div><div style="font-size:11px;font-weight:500">${l.desc}${l.fonte==='estoque'?'<span style="font-size:8px;color:var(--gn);margin-left:4px">📦 Estoque</span>':''}</div><div style="font-size:9px;color:var(--mt)">${l.tipo} · ${l.qtd}x · ${fmt(l.val)}/un</div></div><span style="font-family:'Barlow Condensed';font-size:13px;font-weight:700;color:${l.tipo==='Peça'?'var(--bl)':'var(--pu)'}">${fmt(l.qtd*l.val)}</span></div>`).join('')}
    <div style="text-align:right;margin-top:8px;font-family:'Bebas Neue';font-size:18px;color:var(--gn)">TOTAL: ${fmt(m.total)}</div></div>`:''}
    ${m.fotos&&m.fotos.length?`<div class="rel-card"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">FOTOS (${m.fotos.length})</div><div class="foto-grid">${m.fotos.map(f=>`<img class="foto-thumb" src="${f.src}" onclick="openLB('${f.src}')" title="${f.name}">`).join('')}</div></div>`:''}
    <div style="margin-top:14px;display:flex;justify-content:center;gap:8px"><button class="btn" style="background:#25D366;color:#fff;border:none" onclick="whatsOS('${m.id}')">📲 WhatsApp</button><button class="btn bp" onclick="openPrintOS('${m.id}')">🖨 Opções de Impressão</button></div>`;
  openM('m-view');
}

function verMed(id){
  const m=D.medicoes.find(x=>x.id===id);if(!m)return;
  const ct=D.contratos.find(c=>c.id===m.ctId);
  document.getElementById('view-title').textContent=`🔍 Medição — ${m.cl}`;
  document.getElementById('view-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--red)">
      <div><div style="font-family:'Bebas Neue';font-size:20px;color:var(--tx)">${m.cl}</div><div style="font-size:10px;color:var(--mt)">${m.ms||''} · ${fmtData(m.de)} – ${fmtData(m.at)}</div></div>
      <div style="text-align:right">${bdg(m.st)}<div style="font-family:'Bebas Neue';font-size:22px;color:var(--gn)">${fmt(m.total)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
      ${(ct||m.placa)?`<div class="rel-card"><div class="stat-label">Veículo/Equipamento</div><div class="stat-value"><span class="tag-p">${(ct&&ct.placa)||m.placa||'-'}</span>${m.manual?' <span class="badge b-pu" style="font-size:8px">📋 Manual</span>':''}</div></div>`:''}
      <div class="rel-card"><div class="stat-label">Horas Medidas</div><div class="stat-value">${m.hr||'-'}h</div></div>
      <div class="rel-card"><div class="stat-label">H. Extras</div><div class="stat-value">${m.he||0}h × ${fmt(m.vhe||0)}</div></div>
      <div class="rel-card"><div class="stat-label">Vencimento</div><div class="stat-value ${m.vc&&dTo(m.vc)<0?'rd':''}">${fmtData(m.vc)}</div></div>
      <div class="rel-card"><div class="stat-label">Fluxo de Caixa</div><div class="stat-value">${m.fluxo==='nao'?'Fora do fluxo':'Incluído'}</div></div>
    </div>
    <div class="rel-card" style="margin-bottom:10px">
      <div class="stat-row"><div class="stat-label">Valor Base</div><div class="stat-value">${fmt(m.vl)}</div></div>
      ${m.he?`<div class="stat-row"><div class="stat-label">+ H. Extras (${m.he}h × ${fmt(m.vhe)})</div><div class="stat-value">${fmt(m.he*(m.vhe||0))}</div></div>`:''}
      ${m.dc?`<div class="stat-row"><div class="stat-label">— Desconto</div><div class="stat-value rd">- ${fmt(m.dc)}</div></div>`:''}
      <div class="stat-row" style="border-top:2px solid var(--br);margin-top:4px;padding-top:4px"><div style="font-size:12px;font-weight:700">TOTAL A RECEBER</div><div style="font-family:'Bebas Neue';font-size:22px;color:var(--gn)">${fmt(m.total)}</div></div>
    </div>
    <div style="display:flex;gap:7px;justify-content:center;margin-top:12px">
      <button class="btn bg" onclick="gerarMedicaoDoc('${m.id}')">🖨 Imprimir / PDF</button>
      <button class="btn bp" onclick="advMed('${m.id}');closeM('m-view')">→ Avançar Status</button>
    </div>`;
  openM('m-view');
}

function buildMedicaoDoc(m){
  var ct=(D.contratos||[]).find(function(c){return c.id===m.ctId;})||null;
  var eq=ct?null:((D.equips||[]).find(function(e){return e.placa===m.placa;})||null);
  var equipNome = ct ? (((ct.mk||'')+' '+(ct.mo||'')).trim()) : (eq?(((eq.mk||'')+' '+(eq.mo||'')).trim()):'');
  if(!equipNome) equipNome='—';
  var placa = (ct&&ct.placa) || m.placa || '—';
  var horasCtr = ct ? ct.hr : (m.hr||'');
  var valorMes = ct ? (parseFloat(ct.vl)||0) : (parseFloat(m.vl)||0);
  var turnos = (ct&&ct.tn) ? ct.tn : '—';
  var hrMed = parseFloat(m.hr)||0;
  var vh = (valorMes && parseFloat(horasCtr)) ? (valorMes/parseFloat(horasCtr)) : 0;
  var sub = parseFloat(m.vl)||0;
  var extras = (parseFloat(m.he)||0)*(parseFloat(m.vhe)||0);
  var desc = parseFloat(m.dc)||0;
  var total = (m.total!=null) ? (parseFloat(m.total)||0) : (sub+extras-desc);
  var per = (m.de||m.at) ? ((m.de?fmtData(m.de):'—')+' à '+(m.at?fmtData(m.at):'—')) : '—';
  var meses=['JANEIRO','FEVEREIRO','MARÇO','ABRIL','MAIO','JUNHO','JULHO','AGOSTO','SETEMBRO','OUTUBRO','NOVEMBRO','DEZEMBRO'];
  var baseDt = m.de||m.at||'';
  var mesRef = (m.ms||'').toString().trim();
  if(!mesRef && baseDt){ var _mm=parseInt(String(baseDt).slice(5,7),10); if(_mm>=1&&_mm<=12) mesRef=meses[_mm-1]; }
  mesRef = (mesRef||'').toUpperCase() || '—';
  var ano = baseDt ? String(baseDt).slice(0,4) : '';
  var dias='';
  if(m.de && m.at){ var _d1=new Date(m.de), _d2=new Date(m.at); if(!isNaN(_d1.getTime())&&!isNaN(_d2.getTime())){ dias=Math.round((_d2-_d1)/86400000)+1; if(dias<0)dias=''; } }
  var _h=new Date(); var dataEmis=('0'+_h.getDate()).slice(-2)+'/'+('0'+(_h.getMonth()+1)).slice(-2)+'/'+_h.getFullYear();
  var numTxt = m.numMed ? String(m.numMed).padStart(3,'0') : '—';
  var _empL=(D.config&&D.config.empresasProp)||[];
  var _empP=_empL[0]||null;
  var logo=_empP?(_empP.logo||''):((D.config&&D.config.propLogo)||'');
  var logoHtml = logo ? ('<img src="'+logo+'" alt="Logomarca" class="logo-img">') : '<div class="logo-txt">MH3</div>';
  var rodNome=(_empP&&_empP.rodapeNome!=null)?_empP.rodapeNome:'MH3 RENTAL LTDA';
  var rodTextoDefault='CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  comercial@mh3rental.com.br';
  var rodTexto=(_empP&&_empP.rodapeTexto!=null)?_empP.rodapeTexto:rodTextoDefault;
  var rodTextoHtml=String(rodTexto).split('\n').filter(function(x){return x.trim();}).map(function(x){return '<div class="ln">'+escH(x.trim())+'</div>';}).join('');
  var totLinhas='<tr><td>Subtotal</td><td>'+fmt(sub)+'</td></tr>';
  if(extras>0) totLinhas+='<tr><td>Horas extras ('+(m.he||0)+'h × '+fmt(m.vhe||0)+')</td><td>'+fmt(extras)+'</td></tr>';
  if(desc>0) totLinhas+='<tr><td>Desconto</td><td style="color:#c00000">- '+fmt(desc)+'</td></tr>';
  (m.vendasVinc||[]).forEach(function(vv){ totLinhas+='<tr><td>Avaria / Reparos ('+escH(vv.num||'')+')</td><td>'+fmt(vv.total||0)+'</td></tr>'; });
  totLinhas+='<tr class="receber"><td>A RECEBER</td><td>'+fmt(total)+'</td></tr>';
  return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resumo da Medição - ${escH(m.cl||'')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#2b2b2b;background:#eef0f3;font-size:13px;line-height:1.5;padding:20px}
  .folha{max-width:830px;margin:0 auto;background:#fff;box-shadow:0 6px 28px rgba(0,0,0,.13);border-radius:6px;overflow:hidden}
  .cab{display:flex;justify-content:space-between;align-items:center;padding:26px 36px 20px;border-bottom:4px solid #c00000}
  .logo-img{max-height:68px;max-width:240px;object-fit:contain}
  .logo-txt{font-size:50px;font-weight:900;color:#c00000;font-style:italic;letter-spacing:-3px;font-family:'Arial Black',Arial,sans-serif;line-height:1}
  .cab-dir{text-align:right}
  .cab-dir .tit{font-size:23px;font-weight:800;color:#c00000;letter-spacing:.5px}
  .cab-dir .sub{font-size:10px;color:#999;margin-top:4px;text-transform:uppercase;letter-spacing:1.5px}
  .corpo{padding:24px 36px}
  .dados{background:#fafbfc;border:1px solid #ececf0;border-radius:8px;padding:14px 18px;margin-bottom:14px}
  .dados .row{display:flex;flex-wrap:wrap;gap:8px 26px}
  .dados .row+.row{margin-top:11px;border-top:1px solid #eee;padding-top:11px}
  .campo{flex:1 1 130px;min-width:0;font-size:12.5px}
  .campo .lbl{color:#9a9a9a;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:2px}
  .campo .val{font-weight:700;color:#222;word-wrap:break-word}
  .campo .val.red{color:#c00000}
  .sec{margin:22px 0 9px;display:flex;align-items:center;gap:9px}
  .sec .bar{width:4px;height:18px;background:#c00000;border-radius:2px}
  .sec h3{font-size:13.5px;font-weight:800;color:#c00000;letter-spacing:.4px;text-transform:uppercase}
  table.vals{width:100%;border-collapse:collapse;margin:4px 0;border-radius:8px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.07)}
  table.vals th{background:#c00000;color:#fff;padding:10px 6px;font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
  table.vals td{border:1px solid #ececec;padding:10px 6px;text-align:center;font-size:12px}
  table.vals td.eq{text-align:left;font-weight:700;color:#222}
  table.vals td.money{color:#c00000;font-weight:800}
  .tot-wrap{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:18px;flex-wrap:wrap}
  table.tot{border-collapse:collapse;min-width:280px;border:1px solid #ececec;border-radius:8px;overflow:hidden}
  table.tot td{padding:8px 14px;font-size:13px}
  table.tot td:last-child{text-align:right;font-weight:700;color:#222}
  table.tot tr+tr td{border-top:1px solid #eee}
  table.tot tr.receber td{background:#c00000;color:#fff;font-size:17px;font-weight:800;border:none}
  .venc .lbl{color:#9a9a9a;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:3px}
  .venc .val{font-weight:800;color:#c00000;font-size:18px}
  .rodape{background:#1a1a1a;color:#cfcfcf;padding:18px 34px;text-align:center;font-size:11px;line-height:1.8;margin-top:26px}
  .rodape .emp{color:#fff;font-size:24px;font-weight:900;font-style:italic;letter-spacing:-1px;font-family:'Arial Black',Arial,sans-serif}
  .rodape .ln{margin-top:5px}
  .btn-print{position:fixed;top:14px;right:14px;background:#c00000;color:#fff;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(192,0,0,.35);z-index:9}
  .btn-print:hover{background:#a00000}
  @page{margin:12mm} @media print{ .btn-print{display:none} body{background:#fff;padding:0;margin:0} .folha{box-shadow:none;max-width:100%;border-radius:0;margin:0} }
</style></head><body>
<button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
<div class="folha">
  <div class="cab">${logoHtml}<div class="cab-dir"><div class="tit">RESUMO DA MEDIÇÃO</div><div class="sub">Locação de Veículos &amp; Equipamentos</div></div></div>
  <div class="corpo">
    <div class="dados">
      <div class="row">
        <div class="campo"><span class="lbl">Cliente</span><span class="val">${escH(m.cl||'—')}</span></div>
        <div class="campo" style="flex:0 1 120px"><span class="lbl">Medição Nº</span><span class="val red">${numTxt}</span></div>
        <div class="campo"><span class="lbl">Obra / Localização</span><span class="val">${escH((ct&&ct.ob)||'—')}</span></div>
      </div>
      <div class="row">
        <div class="campo"><span class="lbl">Período de apuração</span><span class="val">${per}</span></div>
        <div class="campo" style="flex:0 1 110px"><span class="lbl">Data</span><span class="val">${dataEmis}</span></div>
        <div class="campo" style="flex:0 1 90px"><span class="lbl">Mês de ref.</span><span class="val red">${mesRef}</span></div>
        <div class="campo" style="flex:0 1 60px"><span class="lbl">Ano</span><span class="val red">${ano||'—'}</span></div>
        <div class="campo" style="flex:0 1 50px"><span class="lbl">Dias</span><span class="val red">${dias!==''?dias:'—'}</span></div>
      </div>
    </div>
    <div class="sec"><span class="bar"></span><h3>Contrato &amp; Medição</h3></div>
    <table class="vals">
      <thead><tr><th style="text-align:left">Equipamento / Veículo</th><th>Chassi / Placa</th><th>Horas</th><th>Valor Mês</th><th>Turno(s)</th><th>Valor Hora</th><th>Horas Medidas</th><th>Subtotal</th></tr></thead>
      <tbody>
        <tr>
          <td class="eq">${escH(equipNome)}</td>
          <td>${escH(placa)}</td>
          <td>${(horasCtr!==''&&horasCtr!=null)?horasCtr:'—'}</td>
          <td class="money">${fmt(valorMes)}</td>
          <td>${turnos}</td>
          <td class="money">${vh?fmt(vh):'—'}</td>
          <td><b>${hrMed||'—'}</b></td>
          <td class="money">${fmt(sub)}</td>
        </tr>
      </tbody>
    </table>
    <div class="tot-wrap">
      <div class="venc"><span class="lbl">Vencimento</span><span class="val">${m.vc?fmtData(m.vc):'—'}</span></div>
      <table class="tot">${totLinhas}</table>
    </div>
  </div>
  <div class="rodape">
    <div class="emp">${escH(rodNome)}</div>
    ${rodTextoHtml}
  </div>
</div>
</body></html>`;
}
window._buildMedicaoDoc = buildMedicaoDoc;

window.gerarMedicaoDoc = function(id){
  var m=(D.medicoes||[]).find(function(x){return x.id===id;}); if(!m){ if(typeof toast==='function')toast('Medição não encontrada','er'); return; }
  var w=window.open('','_blank');
  if(!w){ if(typeof toast==='function')toast('Permita pop-ups para gerar o documento','er'); return; }
  w.document.write(buildMedicaoDoc(m));
  w.document.close();
};


function verDesp(id){
  const d=D.despesas.find(x=>x.id===id);if(!d)return;
  const eq=D.equips.find(e=>e.placa===d.placa);
  document.getElementById('view-title').textContent=`🔍 Despesa — ${d.desc}`;
  document.getElementById('view-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--or)">
      <div><div style="font-family:'Bebas Neue';font-size:20px;color:var(--tx)">${d.desc}</div><div style="font-size:10px;color:var(--mt)">${d.cat} · ${fmtData(d.dt)}</div></div>
      <div style="text-align:right">${d.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">Pendente</span>'}<div style="font-family:'Bebas Neue';font-size:22px;color:var(--or)">${fmt(d.vl)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:12px">
      <div class="rel-card"><div class="stat-label">Categoria</div><div class="stat-value">${d.cat}</div></div>
      <div class="rel-card"><div class="stat-label">Fornecedor</div><div class="stat-value">${d.forn||'-'}</div></div>
      <div class="rel-card"><div class="stat-label">Placa / Equip.</div><div class="stat-value">${d.placa?`<span class="tag-p">${d.placa}</span> ${eq?eq.mk+' '+eq.mo:''}`:'-'}</div></div>
      <div class="rel-card"><div class="stat-label">Documentação</div><div class="stat-value">${d.doc||'-'}${d.ndoc?' — Nº '+d.ndoc:''}</div></div>
      <div class="rel-card"><div class="stat-label">Vencimento</div><div class="stat-value ${d.vc&&dTo(d.vc)<0&&d.st!=='pago'?'rd':''}">${fmtData(d.vc)}</div></div>
      <div class="rel-card"><div class="stat-label">Fluxo de Caixa</div><div class="stat-value">${d.fluxo==='nao'?'🚫 Fora do fluxo':'✅ Incluído'}</div></div>
      <div class="rel-card"><div class="stat-label">Valor</div><div class="stat-value" style="font-size:16px;color:var(--or)">${fmt(d.vl)}</div></div>
      <div class="rel-card"><div class="stat-label">Status</div>${d.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">Pendente</span>'}</div>
    </div>
    <div style="display:flex;gap:7px;justify-content:center;margin-top:12px">
      <button class="btn bg" onclick="window.print()">🖨 Imprimir</button>
      ${d.st!=='pago'?`<button class="btn bs" onclick="advDesp('${d.id}');closeM('m-view')">✓ Marcar como Pago</button>`:''}
      <button class="btn bw" onclick="closeM('m-view');openEditDesp('${d.id}')">✏ Editar</button>
    </div>`;
  openM('m-view');
}

function verEstqItem(id){
  const e=D.estoque.find(x=>x.id===id);if(!e)return;
  const usadoOS=D.manutencoes.reduce((s,m)=>{const l=m.lancs?m.lancs.filter(l=>l.estqId===id):[];return s+l.reduce((ss,l)=>ss+l.qtd,0);},0);
  const usadoVenda=D.vendas.reduce((s,v)=>{const i=v.items?v.items.filter(i=>i.estqId===id):[];return s+i.reduce((ss,i)=>ss+i.qtd,0);},0);
  const margem=e.pv&&e.cv?Math.round((e.pv-e.cv)/e.cv*100):0;
  document.getElementById('view-title').textContent=`🔍 Estoque — ${e.ds}`;
  document.getElementById('view-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--pu)">
      <div><div style="font-family:'Bebas Neue';font-size:20px;color:var(--tx)">${e.ds}</div><div style="font-size:10px;color:var(--mt)">${e.cat}${e.cd?' · Cód: '+e.cd:''}</div></div>
      <div style="text-align:right">${e.qt<=0?'<span class="badge b-rd">Zerado</span>':e.qt<=e.mn?'<span class="badge b-yw">Estoque Baixo</span>':'<span class="badge b-gn">OK</span>'}<div style="font-family:'Bebas Neue';font-size:22px;color:var(--gn)">${fmt((Number(e.qt)||0)*(Number(e.cv)||0))}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
      <div class="rel-card" style="text-align:center"><div class="stat-label">Qtd em Estoque</div><div style="font-family:'Bebas Neue';font-size:28px;${e.qt<=e.mn?'color:var(--yw)':'color:var(--gn)'}">${e.qt}</div><div style="font-size:9px;color:var(--mt)">${e.un} · mín: ${e.mn}</div></div>
      <div class="rel-card" style="text-align:center"><div class="stat-label">Custo Unit.</div><div style="font-family:'Bebas Neue';font-size:20px;color:var(--bl)">${fmt(e.cv)}</div></div>
      <div class="rel-card" style="text-align:center"><div class="stat-label">Preço Venda</div><div style="font-family:'Bebas Neue';font-size:20px;color:var(--pu)">${fmt(e.pv||0)}</div><div style="font-size:9px;color:var(--gn)">Margem: ${margem}%</div></div>
      <div class="rel-card"><div class="stat-label">Localização</div><div class="stat-value">${e.loc||'-'}</div></div>
      <div class="rel-card"><div class="stat-label">Usado em OS</div><div class="stat-value">${usadoOS} ${e.un}</div></div>
      <div class="rel-card"><div class="stat-label">Vendido</div><div class="stat-value">${usadoVenda} ${e.un}</div></div>
    </div>
    <div style="display:flex;gap:7px;justify-content:center;margin-top:12px">
      <button class="btn bg" onclick="window.print()">🖨 Imprimir</button>
      <button class="btn bp" onclick="mvEstq('${e.id}',1);closeM('m-view')">+ Entrada</button>
      <button class="btn bd" onclick="mvEstq('${e.id}',-1);closeM('m-view')">− Saída</button>
      <button class="btn bw" onclick="closeM('m-view');openEditEstq('${e.id}')">✏ Editar</button>
    </div>`;
  openM('m-view');
}

function verNf(id){
  const n=D.nfs.find(x=>x.id===id);if(!n)return;
  document.getElementById('view-title').textContent=`🔍 NF ${n.num} — ${n.forn}`;
  document.getElementById('view-body').innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid var(--bl)">
      <div><div style="font-family:'Bebas Neue';font-size:22px;color:var(--bl)">NF ${n.num}</div><div style="font-size:10px;color:var(--mt)">${n.forn}${n.cnpj?' · '+n.cnpj:''} · ${fmtData(n.dt)}</div></div>
      <div style="text-align:right">${n.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">Pendente</span>'}<div style="font-family:'Bebas Neue';font-size:22px;color:var(--gn)">${fmt(n.vl)}</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:12px">
      <div class="rel-card"><div class="stat-label">Data Emissão</div><div class="stat-value">${fmtData(n.dt)}</div></div>
      <div class="rel-card"><div class="stat-label">Vencimento C.Pagar</div><div class="stat-value ${n.vc&&dTo(n.vc)<0&&n.st!=='pago'?'rd':''}">${fmtData(n.vc)}</div></div>
      <div class="rel-card"><div class="stat-label">Total de Itens</div><div class="stat-value">${n.items.length}</div></div>
    </div>
    <div class="rel-card" style="margin-bottom:10px">
      <div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;margin-bottom:7px">ITENS DA NF</div>
      ${n.items.map(i=>`<div class="lanc-row"><div><div style="font-size:11px;font-weight:500">${i.desc}</div><div style="font-size:9px;color:var(--mt)">${i.qtd}x · ${fmt(i.val)}/un</div></div><span style="font-family:'Barlow Condensed';font-size:13px;font-weight:700">${fmt(i.qtd*i.val)}</span></div>`).join('')}
      <div style="text-align:right;margin-top:8px;font-family:'Bebas Neue';font-size:18px;color:var(--gn)">TOTAL NF: ${fmt(n.vl)}</div>
    </div>
    ${n.ob?`<div class="rel-card"><div class="stat-label">Observações</div><div style="font-size:10px;margin-top:3px">${n.ob}</div></div>`:''}
    <div style="display:flex;gap:7px;justify-content:center;margin-top:12px">
      <button class="btn bg" onclick="window.print()">🖨 Imprimir</button>
      ${n.st!=='pago'?`<button class="btn bs" onclick="pagarNf('${n.id}');closeM('m-view')">✓ Marcar como Paga</button>`:''}
    </div>`;
  openM('m-view');
}



