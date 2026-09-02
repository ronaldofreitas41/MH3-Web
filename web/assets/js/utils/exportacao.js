// ---- EXPORTAR CSV ----
function exportRelCSV(){
  const{meds,desps,vends,mns}=getRelData();
  const csv={
    'tr-fin':['Cliente,Mês,Horas,Total,Status',...meds.map(m=>`${m.cl},${m.ms||''},${m.hr||0},${m.total||0},${m.st}`)].join('\n'),
    'tr-receitas':['Cliente,Tipo,Mês,Valor',...meds.map(m=>`${m.cl},Medição,${m.ms||''},${m.total||0}`),...vends.map(v=>`${v.cli},Venda,${v.dt||''},${v.total||0}`)].join('\n'),
    'tr-desp':['Data,Descrição,Categoria,Placa,Valor,Status',...desps.map(d=>`${d.dt||''},${d.desc},${d.cat},${d.placa||''},${d.vl||0},${d.st}`)].join('\n'),
    'tr-manut':['Nº OS,Placa,Tipo,Entrada,Saída,KM,Custo,Status',...mns.map(m=>`${m.osNum||''},${m.placa||''},${m.tipo},${m.en||''},${m.sa||''},${m.km||''},${m.total||0},${m.status||''}`)].join('\n'),
    'tr-frota':['Placa,Marca,Modelo,Condição,Proprietário,KM,Status',...D.equips.map(e=>`${e.placa},${e.mk},${e.mo},${e.cond||''},${e.pr||''},${e.km||''},${e.st}`)].join('\n'),
    'tr-contratos':['Cliente,Placa,Turno,Horas,Valor,Início,Ciclo,Assinatura,Status',...D.contratos.map(c=>`${c.cl},${c.placa||''},${c.tn},${c.hr},${c.vl},${c.ini||''},${c.ci||''},${c.ass},${c.status}`)].join('\n'),
    'tr-estq':['Código,Descrição,Categoria,Qtd,Mínimo,Un,Custo,Venda',...D.estoque.map(e=>`${e.cd||''},${e.ds},${e.cat},${e.qt},${e.mn},${e.un},${e.cv},${e.pv||0}`)].join('\n'),
  };
  const content=csv[relAba]||'Sem dados para exportar';
  const blob=new Blob(['\uFEFF'+content],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`MH3_${relAba.replace('tr-','')}_${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url);
  toast('CSV exportado!');
}

function rdCl(){const con=document.getElementById('cl-container');if(!D.checklists.length){con.innerHTML='<div class="empty"><div class="ei">☑️</div>Nenhum checklist</div>';return;}con.innerHTML=D.checklists.map(c=>`<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">${c.nm} <span style="font-size:8px;font-weight:400;color:var(--mt)">${c.cat}</span></div><div style="display:flex;gap:5px;align-items:center"><span style="font-size:9px;color:var(--mt)">${c.items.length} itens</span><button class="btn bw btn-xs" onclick="editCl('${c.id}')" title="Editar checklist">✏️ Editar</button><button class="btn bd btn-xs" onclick="delCl('${c.id}')">Excluir</button></div></div><div class="pb">${c.items.map((i,idx)=>(window._clEditItem&&window._clEditItem.cl===c.id&&window._clEditItem.item===i.id)?`<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--br)"><input id="cledit-${i.id}" value="${(i.txt||'').replace(/"/g,'&quot;')}" style="flex:1" onkeydown="if(event.key==='Enter')salvarEdicaoItem('${c.id}','${i.id}')"><button class="btn bp btn-xs" onclick="salvarEdicaoItem('${c.id}','${i.id}')">✓ Salvar</button><button class="btn bg btn-xs" onclick="cancelarEdicaoItem()">Cancelar</button></div>`:`<div draggable="true" ondragstart="clDragStart(event,'${c.id}',${idx})" ondragover="clDragOver(event)" ondrop="clDrop(event,'${c.id}',${idx})" style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--br)"><span style="cursor:grab;color:var(--mt);font-size:14px" title="Arraste para reordenar">⠿</span><span style="color:var(--mt);font-size:11px">○</span><span style="font-size:11px;flex:1">${i.txt}</span><button class="btn bg btn-xs" onclick="moveClItem('${c.id}','${i.id}',-1)" title="Subir" ${idx===0?'disabled':''}>↑</button><button class="btn bg btn-xs" onclick="moveClItem('${c.id}','${i.id}',1)" title="Descer" ${idx===c.items.length-1?'disabled':''}>↓</button><button class="btn bw btn-xs" onclick="editClItem('${c.id}','${i.id}')" title="Editar item">✏️</button><button class="btn bd btn-xs" onclick="delClItem('${c.id}','${i.id}')" title="Excluir item">×</button></div>`).join('')}<div style="margin-top:7px;display:flex;gap:5px"><input placeholder="Novo item..." id="clnew-${c.id}" style="flex:1" onkeydown="if(event.key==='Enter')addClIE('${c.id}')"><button class="btn bg btn-sm" onclick="addClIE('${c.id}')">+ Item</button></div></div></div>`).join('');}

function rdUsr(){
  const con=document.getElementById('usr-container');
  if(!D.usuarios.length){con.innerHTML='<div class="empty"><div class="ei">👥</div>Nenhum usuário cadastrado</div>';return;}
  const perfs={admin:'🔴 Admin',operacional:'🟡 Operacional',motorista:'🟢 Motorista',financeiro:'🔵 Financeiro',custom:'⚙️ Personalizado'};
  con.innerHTML=`<div class="panel"><div class="tw"><table>
    <thead><tr><th>Nome</th><th>Login</th><th>Perfil</th><th>Acessos</th><th>Ações</th></tr></thead>
    <tbody>${D.usuarios.map(u=>`<tr>
      <td><b>${u.nm}</b></td>
      <td style="font-size:11px;color:var(--mt)">${u.lg||'-'}</td>
      <td><span class="badge b-bl">${perfs[u.pf]||u.pf}</span></td>
      <td style="font-size:10px;color:var(--mt)">${Object.values(u.perms||{}).filter(Boolean).length}/11 módulos</td>
      <td style="display:flex;gap:4px">
        <button class="btn bg btn-xs" onclick="editUsr('${u.id}')">✏️ Editar</button>
        <button class="btn bd btn-xs" onclick="delUsr('${u.id}')">× Excluir</button>
      </td>
    </tr>`).join('')}
    </tbody></table></div></div>`;
}

function editUsr(id){
  const u=D.usuarios.find(x=>x.id===id);
  if(!u){toast('Usuário não encontrado','er');return;}
  // Fill the modal with user data
  document.getElementById('usr-eid').value=id;
  document.getElementById('usr-nm').value=u.nm||'';
  document.getElementById('usr-lg').value=u.lg||'';
  document.getElementById('usr-pw').value='';
  document.getElementById('usr-pw').placeholder='Deixe em branco para manter a senha atual';
  document.getElementById('usr-pf').value=u.pf||'operacional';
  // Load permissions
  const perms=u.perms||{};
  const modCrud=['frota','manut','cts','meds','vend','estq','desp','fin','pneus','resultado','clientes','mob','func','prej','sm','sist','cpagar','creceber','prop','tratativas'];
  const allPerms=['dash','whatsapp','adm','custo','preco','desc','estq-edit','venda-eq','pneu-edit','rel',
    'rel-fin','rel-os','rel-frota','rel-resultado','rel-estq','rel-cpagar','rel-creceber',
    'rel-fin-imp','rel-os-imp','rel-frota-imp','rel-resultado-imp','rel-estq-imp','rel-cpagar-imp','rel-creceber-imp','seguro','doc-veiculo'];
  modCrud.forEach(m=>{allPerms.push(m);allPerms.push(m+'-criar');allPerms.push(m+'-editar');allPerms.push(m+'-excluir');});
  allPerms.forEach(p=>{
    const el=document.getElementById('pr-'+p);
    if(!el) return;
    if(el.type==='checkbox') el.checked=!!perms[p];
    else { if(perms[p]) el.classList.add('on'); else el.classList.remove('on'); }
  });
  document.querySelector('#m-usr .mt2').textContent='✏️ Editar Usuário: '+u.nm;
  openM('m-usr');
}

function rdCfg(){document.getElementById('cfg-t1').value=D.config.t1||200;document.getElementById('cfg-t2').value=D.config.t2||300;document.getElementById('cfg-t3').value=D.config.t3||420;document.getElementById('cfg-hextra').value=D.config.hextraVl||0;document.getElementById('cfg-alert').value=D.config.alertDias||5;document.getElementById('cfg-rkm').value=D.config.rkm||10000;document.getElementById('cfg-rhr').value=D.config.rhr||500;document.getElementById('cfg-margem').value=D.config.margem||30;document.getElementById('cfg-adm-pw').value=D.config.admPw||'mh3admin';
const ciclos=D.config.ciclos||[];document.getElementById('ciclos-list').innerHTML=ciclos.map((c,i)=>`<div class="ciclo-item"><span style="font-size:9px;color:var(--mt);width:16px">${i+1}.</span><input value="${c}" onchange="updCiclo(${i},this.value)" style="flex:1;max-width:140px"><button class="btn bd btn-xs" onclick="rmCiclo(${i})">×</button></div>`).join('')+`<p style="margin-top:7px;font-size:9px;color:var(--mt)">Ciclos: ${ciclos.join(' · ')}</p>`;
rdCfgExtra();
  if(typeof popWaMsgs==='function')popWaMsgs();
  // Logo button in config
  const logoarea = document.getElementById('cfg-logo-area');
  if(!logoarea){
    const logoDiv = document.createElement('div');
    logoDiv.id='cfg-logo-area';
    logoDiv.style.cssText='margin-bottom:12px';
    logoDiv.innerHTML='<label style="font-size:11px;font-weight:700;color:var(--mt);text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:6px;">Logo da Empresa</label><div style="display:flex;align-items:center;gap:10px;"><div id="logo-preview" style="width:60px;height:60px;border:1px solid var(--br);border-radius:8px;display:flex;align-items:center;justify-content:center;background:var(--cd2);overflow:hidden;font-family:\'Bebas Neue\',sans-serif;font-size:22px;color:var(--red)">M</div><div><button class="btn bb btn-sm" onclick="carregarLogo()">📷 Carregar Logo</button><div style="font-size:10px;color:var(--mt);margin-top:4px">PNG, JPG ou SVG · recomendado 200×200px</div></div></div>';
    const cfgRs = document.getElementById('cfg-rs');
    if(cfgRs && cfgRs.closest('.panel')) cfgRs.closest('.panel').querySelector('.pb').prepend(logoDiv);
  }
  const tipos=D.config.tiposOS||[];document.getElementById('tipos-os-list').innerHTML=tipos.map((t,i)=>`<div class="tipo-os-item"><span style="font-size:11px;font-weight:500">${t}</span><div style="display:flex;gap:4px"><button class="btn bg btn-xs" onclick="editTipoOS(${i})">✏</button><button class="btn bd btn-xs" onclick="rmTipoOS(${i})">×</button></div></div>`).join('')||'<div style="font-size:10px;color:var(--mt)">Nenhum tipo</div>';  if(typeof rdMarcas==='function')rdMarcas();  if(typeof rdTabelas==='function')rdTabelas();  if(typeof cfgEmpRender==='function')cfgEmpRender();
  if(typeof rdPrazos==='function')rdPrazos();
  if(typeof loadTopicos==='function')loadTopicos();
}

