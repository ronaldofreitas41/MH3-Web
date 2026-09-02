// ============ CONFIG ============
function saveCfg(){D.config.t1=parseInt(document.getElementById('cfg-t1').value)||200;D.config.t2=parseInt(document.getElementById('cfg-t2').value)||300;D.config.t3=parseInt(document.getElementById('cfg-t3').value)||420;D.config.hextraVl=parseFloat(document.getElementById('cfg-hextra').value)||0;D.config.alertDias=parseInt(document.getElementById('cfg-alert').value)||5;D.config.rkm=parseInt(document.getElementById('cfg-rkm').value)||10000;D.config.rhr=parseInt(document.getElementById('cfg-rhr').value)||500;D.config.margem=parseInt(document.getElementById('cfg-margem').value)||30;D.config.admPw=document.getElementById('cfg-adm-pw').value||'mh3admin';sv();toast('Configurações salvas!');rdCfg();}

// ---- TABELAS DE PREÇO ----

// ---- CATEGORIAS (cadastráveis) ----
function getCategorias(){
  if(!D.config.categorias||!D.config.categorias.length){
    D.config.categorias=['Pneus','Óleos & Filtros','Freios','Elétrica','Suspensão','Motor','Peças Gerais','Serviços','Almoxarifado','Geral'];
  }
  return D.config.categorias;
}
function popCategorias(){
  const cats=getCategorias();
  ['tab-cat','estq-cat'].forEach(id=>{
    const sel=document.getElementById(id);
    if(!sel) return;
    const atual=sel.value;
    sel.innerHTML=cats.map(c=>`<option>${c}</option>`).join('');
    if(atual&&cats.includes(atual)) sel.value=atual;
  });
}
function novaCategoria(){
  const nome=prompt('Nome da nova categoria:');
  if(!nome||!nome.trim()) return;
  const cats=getCategorias();
  const nomeU=nome.trim().toUpperCase();
  if(cats.some(c=>c.toUpperCase()===nomeU)){toast('Categoria já existe','er');return;}
  cats.push(nome.trim());
  sv();popCategorias();
  auditar('CRIACAO','sistema','Categoria criada: '+nome.trim());
  toast('Categoria "'+nome.trim()+'" cadastrada!','ok');
}
function editTabela(id){
  const t=(D.config.tabelas||[]).find(x=>x.id===id);
  if(!t){toast('Tabela não encontrada','er');return;}
  document.getElementById('tab-nome').value=t.nome;
  popCategorias();
  document.getElementById('tab-cat').value=t.cat;
  document.getElementById('tab-margem').value=t.margem;
  // Remove a antiga; ao adicionar, recria (edição simples)
  D.config.tabelas=D.config.tabelas.filter(x=>x.id!==id);
  rdTabelas();
  auditar('ALTERACAO','sistema','Tabela aberta para edição: '+t.nome);
  toast('Tabela carregada nos campos. Ajuste e clique + Adicionar para salvar.','ok');
}

function addTabela(){
  const nome=document.getElementById('tab-nome').value.trim();
  const cat=document.getElementById('tab-cat').value;
  const margem=parseFloat(document.getElementById('tab-margem').value)||0;
  if(!nome){toast('Informe o nome da tabela','er');return;}
  if(!margem){toast('Informe a margem','er');return;}
  if(!D.config.tabelas) D.config.tabelas=[];
  D.config.tabelas.push({id:uid(),nome,cat,margem});
  document.getElementById('tab-nome').value='';
  document.getElementById('tab-margem').value='';
  sv();rdTabelas();toast('Tabela adicionada!','ok');
}
function rdSistema(){
  popCategorias();
  if(typeof rdTabelas==='function')rdTabelas();
  if(typeof rdPrazos==='function')rdPrazos();
}
function rdTabelas(){
  const tb=document.getElementById('tab-lista');
  if(!tb) return;
  const tabs=D.config.tabelas||[];
  tb.innerHTML=tabs.length?tabs.map(t=>`<tr>
    <td><b>${t.nome}</b></td>
    <td>${t.cat}</td>
    <td>${t.margem}%</td>
    <td style="color:var(--gn)">${fmt(100*(1+t.margem/100))}</td>
    <td style="display:flex;gap:4px"><button class="btn bw btn-xs" onclick="editTabela('${t.id}')" title="Editar tabela">✏️</button><button class="btn bd btn-xs" onclick="delTabela('${t.id}')" title="Excluir">×</button></td>
  </tr>`).join(''):'<tr><td colspan="5" class="empty">Nenhuma tabela cadastrada</td></tr>';
}
function delTabela(id){
  reqSenha(()=>{
    if(!confirm('Excluir esta tabela de preço?'))return;
    D.config.tabelas=(D.config.tabelas||[]).filter(t=>t.id!==id);
    if(typeof auditarExclusao==='function')auditarExclusao('config','Excluiu tabela de preço: '+id);
    sv();rdTabelas();toast('Tabela removida','ok');
  });
}

// ---- PRAZOS ----
function togglePrzTipo(){
  const t=document.getElementById('prz-tipo').value;
  document.getElementById('prz-dias-box').style.display=t==='dias'?'':'none';
  document.getElementById('prz-parc-box').style.display=t==='parcelas'?'':'none';
  const ib=document.getElementById('prz-int-box'),iq=document.getElementById('prz-int-qtd-box');
  if(ib)ib.style.display=t==='intervalo'?'':'none';
  if(iq)iq.style.display=t==='intervalo'?'':'none';
}
function addPrazo(){
  const nome=document.getElementById('prz-nome').value.trim();
  const tipo=document.getElementById('prz-tipo').value;
  if(!nome){toast('Informe o nome do prazo','er');return;}
  let detalhe='';
  if(tipo==='dias'){
    detalhe=document.getElementById('prz-dias').value.trim();
    if(!detalhe){toast('Informe os dias','er');return;}
  }else if(tipo==='intervalo'){
    // Intervalo: 28 dias x 2 vezes = 28/56
    const intD=parseInt(document.getElementById('prz-int-dias').value)||0;
    const qtd=parseInt(document.getElementById('prz-int-qtd').value)||0;
    if(!intD||!qtd){toast('Informe o intervalo e a quantidade','er');return;}
    const dias=[];
    for(let i=1;i<=qtd;i++)dias.push(intD*i);
    detalhe=dias.join('/');
  }else{
    detalhe=document.getElementById('prz-parc').value+'x';
    if(!parseInt(document.getElementById('prz-parc').value)){toast('Informe o número de parcelas','er');return;}
  }
  if(!D.config.prazos) D.config.prazos=[];
  D.config.prazos.push({id:uid(),nome,tipo,detalhe});
  document.getElementById('prz-nome').value='';
  document.getElementById('prz-dias').value='';
  document.getElementById('prz-parc').value='';
  sv();rdPrazos();toast('Prazo adicionado!','ok');
}

function editPrazo(id){
  const p=(D.config.prazos||[]).find(x=>x.id===id);
  if(!p){toast('Prazo não encontrado','er');return;}
  document.getElementById('prz-nome').value=p.nome;
  document.getElementById('prz-tipo').value=p.tipo==='intervalo'?'dias':p.tipo;
  togglePrzTipo();
  if(p.tipo==='dias'||p.tipo==='intervalo')document.getElementById('prz-dias').value=p.detalhe;
  else document.getElementById('prz-parc').value=parseInt(p.detalhe)||'';
  D.config.prazos=D.config.prazos.filter(x=>x.id!==id);
  rdPrazos();
  auditar('ALTERACAO','sistema','Prazo aberto para edição: '+p.nome);
  toast('Prazo carregado. Ajuste e clique + Adicionar.','ok');
}

function rdPrazos(){
  const tb=document.getElementById('prz-lista');
  if(!tb) return;
  const przs=D.config.prazos||[];
  tb.innerHTML=przs.length?przs.map(p=>`<tr>
    <td><b>${p.nome}</b></td>
    <td>${p.tipo==='dias'?'Dias para pagar':'Parcelamento'}</td>
    <td>${p.detalhe}${p.tipo==='dias'?' dias':''}</td>
    <td style="display:flex;gap:4px"><button class="btn bw btn-xs" onclick="editPrazo('${p.id}')" title="Editar prazo">✏️</button><button class="btn bd btn-xs" onclick="delPrazo('${p.id}')" title="Excluir">×</button></td>
  </tr>`).join(''):'<tr><td colspan="4" class="empty">Nenhum prazo cadastrado</td></tr>';
}
function delPrazo(id){
  reqSenha(()=>{
    if(!confirm('Excluir este prazo?'))return;
    D.config.prazos=(D.config.prazos||[]).filter(p=>p.id!==id);
    if(typeof auditarExclusao==='function')auditarExclusao('config','Excluiu prazo: '+id);
    sv();rdPrazos();toast('Prazo removido','ok');
  });
}

function saveTopicos(){
  const tps=['op-os','op-frota','op-meds','op-estq','op-fin',
              'fin-fin','fin-resultado','fin-fluxo','fin-desp','fin-nf',
              'mot-os','mot-frota','mot-manut'];
  const topicos={};
  tps.forEach(t=>{
    const el=document.getElementById('tp-'+t);
    topicos[t]=el?el.checked:false;
  });
  D.config.topicos=topicos;
  sv();toast('Tópicos salvos!','ok');
}

function loadTopicos(){
  const topicos=D.config.topicos||{};
  ['op-os','op-frota','op-meds','op-estq','op-fin',
   'fin-fin','fin-resultado','fin-fluxo','fin-desp','fin-nf',
   'mot-os','mot-frota','mot-manut'].forEach(t=>{
    const el=document.getElementById('tp-'+t);
    if(el) el.checked=topicos[t]!==undefined?topicos[t]:true;
  });
}


function addCiclo(){const v=prompt('Novo ciclo (ex: 06-05):');if(!v||!v.trim())return;D.config.ciclos=D.config.ciclos||[];D.config.ciclos.push(v.trim());sv();rdCfg();toast('Ciclo adicionado!');}
function updCiclo(i,v){if(D.config.ciclos)D.config.ciclos[i]=v;sv();}
function rmCiclo(i){reqSenha(()=>{D.config.ciclos.splice(i,1);sv();rdCfg();});}

// ===== MARCAS CADASTRÁVEIS (pneus e veículos) — reutilizadas como sugestão em todo o sistema =====
function _listaMarca(tipo){
  if(tipo==='pneu'){ if(!D.config.marcasPneu)D.config.marcasPneu=[]; return D.config.marcasPneu; }
  if(!D.config.marcasVeiculo)D.config.marcasVeiculo=[]; return D.config.marcasVeiculo;
}
function addMarca(tipo){
  var nome=prompt(tipo==='pneu'?'Nome da marca de pneu:':'Nome da marca de veículo:');
  if(!nome||!nome.trim())return;
  nome=nome.trim();
  var lista=_listaMarca(tipo);
  if(lista.some(function(m){return m.toLowerCase()===nome.toLowerCase();})){ toast('Essa marca já está cadastrada.','er'); return; }
  lista.push(nome);
  lista.sort(function(a,b){return a.localeCompare(b);});
  sv(); rdMarcas(); toast('Marca adicionada!');
}
function rmMarca(tipo,i){
  var lista=_listaMarca(tipo);
  var nome=lista[i];
  if(!confirm('Remover a marca "'+nome+'"?'))return;
  lista.splice(i,1); sv(); rdMarcas(); toast('Marca removida.');
}
function rdMarcas(){
  var esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
  var lp=document.getElementById('marcas-pneu-list');
  if(lp){ var mp=_listaMarca('pneu'); lp.innerHTML=mp.length?mp.map(function(m,i){return '<div class="tipo-os-item"><span style="font-size:11px;font-weight:500">'+esc(m)+'</span><button class="btn bd btn-xs" onclick="rmMarca(\'pneu\','+i+')">×</button></div>';}).join(''):'<div style="font-size:10px;color:var(--mt)">Nenhuma marca cadastrada</div>'; }
  var lv=document.getElementById('marcas-veic-list');
  if(lv){ var mv=_listaMarca('veiculo'); lv.innerHTML=mv.length?mv.map(function(m,i){return '<div class="tipo-os-item"><span style="font-size:11px;font-weight:500">'+esc(m)+'</span><button class="btn bd btn-xs" onclick="rmMarca(\'veiculo\','+i+')">×</button></div>';}).join(''):'<div style="font-size:10px;color:var(--mt)">Nenhuma marca cadastrada</div>'; }
}
function addTipoOS(){const v=prompt('Nome do tipo de OS:');if(!v||!v.trim())return;D.config.tiposOS=D.config.tiposOS||[];D.config.tiposOS.push(v.trim());sv();rdCfg();toast('Tipo adicionado!');}
function editTipoOS(i){const v=prompt('Editar:',D.config.tiposOS[i]);if(v&&v.trim()){D.config.tiposOS[i]=v.trim();sv();rdCfg();}}
function rmTipoOS(i){reqSenha(()=>{D.config.tiposOS.splice(i,1);sv();rdCfg();});}

