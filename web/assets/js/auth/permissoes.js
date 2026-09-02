// ---- VERIFICAÇÃO DE ACESSO (permissões extras) ----

// ---- APLICAÇÃO DE PERMISSÕES NA TELA (Ver / Criar) ----
const PERM_MENU_MOD = {frota:'frota',manutencao:'manut',revisao:'manut',contratos:'cts',medicoes:'meds',vendas:'vend',estoque:'estq',despesas:'desp',fluxo:'fin',pneus:'pneus',resultado:'resultado',clientes:'clientes',mobilizacao:'mob',funcionarios:'func',prejuizos:'prej',saida_material:'sm',sistema:'sist',config:'sist',contas_pagar:'cpagar',contas_receber:'creceber',nf:'desp',investimento:'fin',ajuda_motorista:'cts',usuarios:'gerenciar-usuarios',auditoria:'ver-auditoria',relatorios:'rel',checklist:'sist',proposta:'prop',tratativas:'tratativas',financeiro:'fin',seguro:'seguro',whatsapp:'whatsapp'};
const PERM_CRIAR_SIG = [["openNewEq","frota"],["openM('m-mn')","manut"],["openM('m-ct')","cts"],["openM('m-med')","meds"],["openM('m-venda')","vend"],["openM('m-estq')","estq"],["openM('m-desp')","desp"],["openM('m-nf')","desp"],["openContaBanco","fin"],["openCliente","clientes"],["openMob","mob"],["openFunc","func"],["addSaidaMaterial","sm"],["addInvestimento","fin"],["addAjudaMotorista","cts"],["abrirImportacao('despesas')","desp"],["abrirImportacao('contas_pagar')","cpagar"],["abrirImportacao('contas_receber')","creceber"],["abrirImportacao('manutencao')","manut"],["abrirImportacao('mobilizacao')","mob"],["toggleEmpresasPanel","manut"],["importarFrotaPlanilha","frota"]];
const PERM_EXCLUIR_SIG = [["limparModulo('despesas')","desp"],["limparModulo('contas_pagar')","cpagar"],["limparModulo('contas_receber')","creceber"],["limparModulo('manutencao')","manut"],["limparModulo('mobilizacao')","mob"]];
const PERM_EDITAR_SIG = [["openEditEq","frota"],["editMn(","manut"],["openEditCt","cts"],["editMed(","meds"],["editVenda","vend"],["openEditEstq","estq"],["openEditDesp","desp"],["editContaBanco","fin"],["editLancPneu","pneus"],["editPneu(","pneus"],["editCliente","clientes"],["editMob(","mob"],["editFunc","func"],["editTratativa","tratativas"],["editProposta","prop"]];
function permUsuarioAtual(){
  var base;
  if(authUser && authUser.perms) base=authUser.perms; // permissões autoritativas do servidor
  else { const nome=(authUser&&authUser.nome)||''; const u=(D.usuarios||[]).find(x=>(x.nm===nome)||(x.nome===nome)); base=(u&&u.perms)||{}; }
  // Tratativas é exclusiva de admin/financeiro (combinados do comercial p/ o financeiro acompanhar)
  try{ var ehFin=(typeof _ehFinanceiro==='function')&&_ehFinanceiro(); if(base&&base['tratativas']!==ehFin){ base=Object.assign({}, base, {tratativas:ehFin}); } }catch(e){}
  return base;
}
function ehAdminAtual(){
  const perfil=(authUser&&authUser.perfil)||'';
  const nome=(authUser&&authUser.nome)||'';
  return perfil==='admin'||nome.toLowerCase().includes('noninho');
}
// Bloqueia a edição quando o usuário não tem a permissão "-editar" do módulo.
// Retorna true (e avisa) se NÃO pode editar; false se pode.
function _bloqEditar(mod){
  if(typeof ehAdminAtual==='function'&&ehAdminAtual())return false; // admin edita tudo
  var p=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};
  if(p && p[mod+'-editar'])return false;
  if(typeof toast==='function')toast('Você não tem permissão para editar nesta área.','er');
  return true;
}
function aplicarPermissoes(){var _elv=document.getElementById('btn-edicao-livre');if(_elv)_elv.style.display=(typeof ehAdminAtual==='function'&&ehAdminAtual())?'':'none';
  if(ehAdminAtual())return; // administrador vê tudo
  const perms=permUsuarioAtual();
  // 1) Menu lateral: esconde módulos sem permissão de Ver
  document.querySelectorAll('.ni').forEach(ni=>{
    const oc=ni.getAttribute('onclick')||'';
    const m=oc.match(/go\('([^']+)'\)/);
    if(!m)return;
    const alvo=m[1];
    if(!(alvo in PERM_MENU_MOD))return; // dashboard/agenda/pendências: sempre visível
    ni.style.display = perms[PERM_MENU_MOD[alvo]] ? '' : 'none';
  });
  // Esconde grupos de menu (acordeão) que ficaram totalmente vazios
  document.querySelectorAll('.nsub').forEach(sub=>{
    const itens=Array.from(sub.querySelectorAll('.ni'));
    const algumVisivel=itens.some(i=>i.style.display!=='none');
    const acc=sub.previousElementSibling;
    if(acc&&acc.classList&&acc.classList.contains('nacc')){
      acc.style.display = (itens.length && !algumVisivel) ? 'none' : '';
    }
  });
  // 2) Botões de Criar/Editar/Excluir: esconde conforme a permissão do usuário
  document.querySelectorAll('button[onclick]').forEach(b=>{
    const oc=b.getAttribute('onclick')||'';
    let tratado=false;
    for(const sig of PERM_CRIAR_SIG){
      if(oc.includes(sig[0])){b.style.display = perms[sig[1]+'-criar'] ? '' : 'none';tratado=true;break;}
    }
    if(tratado)return;
    for(const sig of PERM_EDITAR_SIG){
      if(oc.includes(sig[0])){b.style.display = perms[sig[1]+'-editar'] ? '' : 'none';tratado=true;break;}
    }
    if(tratado)return;
    for(const sig of PERM_EXCLUIR_SIG){
      if(oc.includes(sig[0])){b.style.display = perms[sig[1]+'-excluir'] ? '' : 'none';break;}
    }
  });

  if(typeof popRelSubmenu==='function')popRelSubmenu();
}

function temAcesso(perm){
  const perfil=(authUser&&authUser.perfil)||'';
  const nome=(authUser&&authUser.nome)||'';
  if(perfil==='admin'||nome.toLowerCase().includes('noninho')) return true;
  if(authUser&&authUser.perms) return !!authUser.perms[perm];
  const u=(D.usuarios||[]).find(x=>(x.nome===nome)||(x.nm===nome));
  return !!(u&&u.perms&&u.perms[perm]);
}

// ---- MENSAGEM DE MOTIVAÇÃO POR PERFIL (item 5a) ----
function rdMotivacao(){
  const el=document.getElementById('d-motivacao');
  if(!el)return;
  if(!temAcesso('motivacao')){el.innerHTML='';return;}
  const perfil=(authUser&&authUser.perfil)||'';
  const nome=((authUser&&authUser.nome)||'').split(' ')[0];
  const msgs={
    admin:['Liderar é servir. Sua visão move a MH3 adiante! 🚀','Grandes decisões constroem grandes empresas. Bom trabalho! 💪','Cada dia é uma chance de fazer a MH3 crescer. Conte comigo!'],
    financeiro:['Números organizados, empresa saudável. Você é essencial! 📊','Cada conta no lugar certo é a base do sucesso. Excelente! 💰','Controle financeiro é poder. Mantenha o ótimo trabalho!'],
    operacional:['A operação é o coração da MH3. Você faz acontecer! ⚙️','Eficiência no campo, resultado na empresa. Mandou bem! 🔧','Cada tarefa bem feita move a frota adiante. Valeu!'],
    motorista:['Estrada segura, missão cumprida. Conte com a MH3! 🚛','Seu cuidado leva a MH3 longe. Boa viagem e bom trabalho!','Cada km rodado com responsabilidade faz a diferença! 🛣️']
  };
  const lista=msgs[perfil]||['Bom trabalho! Juntos fazemos a MH3 mais forte. 💪'];
  const msg=lista[new Date().getDate()%lista.length];
  el.innerHTML=`<div class="panel" style="background:linear-gradient(135deg,var(--cd2),var(--cd));border-left:4px solid var(--rd)">
    <div class="pb" style="padding:14px"><div style="font-size:13px;color:var(--tx)">${nome?'Olá, '+nome+'! ':''}${msg}</div></div>
  </div>`;
}
// ---- LEMBRETE DE ANIVERSÁRIO (item 5b) ----
function getAniversariantesAmanha(){
  const amanha=new Date();amanha.setDate(amanha.getDate()+1);
  const mm=String(amanha.getMonth()+1).padStart(2,'0');
  const dd=String(amanha.getDate()).padStart(2,'0');
  return (D.funcionarios||[]).filter(f=>{
    if(!f.nasc)return false;
    const m=f.nasc.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m && m[2]===mm && m[3]===dd;
  });
}
function rdAniversarios(){
  const el=document.getElementById('d-aniversarios');
  if(!el)return;
  // Só usuários autorizados (lista em D.config.aniversarioUsers; admin sempre vê)
  if(!temAcesso('aniversarios')){el.innerHTML='';return;}
  const aniv=getAniversariantesAmanha();
  if(!aniv.length){el.innerHTML='';return;}
  el.innerHTML=`<div class="panel" style="border:2px solid var(--pu)">
    <div class="ph"><div class="pt">🎂 Aniversário Amanhã!</div></div>
    <div class="pb">${aniv.map(f=>`<div style="padding:6px 0;font-size:13px">🎉 <b>${f.nome}</b>${f.cargo?' — '+f.cargo:''} faz aniversário amanhã!</div>`).join('')}</div>
  </div>`;
}

// ---- AJUDAS RECORRENTES (confirmação mensal) ----
function ajudasAConfirmar(){
  const mes=new Date().toISOString().substring(0,7);
  const user=(authUser&&authUser.nome)||'';
  if(!temAcesso('confirma-ajuda') && !((D.usuarios||[]).find(x=>x.nome===user))) return [];
  return (D.ajudasMotorista||[]).filter(a=>
    a.recorrente && a.confirmaUser===user && !(a.mesesTratados||[]).includes(mes)
  );
}
function rdAjudasRecorrentes(){
  const el=document.getElementById('d-ajudas-recorrentes');
  if(!el)return;
  const pend=ajudasAConfirmar();
  if(!pend.length){el.innerHTML='';return;}
  const mes=new Date().toISOString().substring(0,7);
  el.innerHTML=`<div class="panel" style="border:2px solid var(--or)">
    <div class="ph"><div class="pt">🔁 Ajudas de Custo a Confirmar (${mes})</div><span class="badge b-or">${pend.length}</span></div>
    <div class="pb">
      <p style="font-size:11px;color:var(--mt)">Confirme se cada ajuda recorrente entra no Contas a Pagar este mês:</p>
      ${pend.map(a=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;border-bottom:1px solid var(--br)">
        <div><b>${a.motorista}</b> — ${a.empresa} <span class="badge b-bl" style="font-size:9px">${a.placa||''}</span><br>
        <span style="font-size:11px;color:var(--red)">${fmt(a.valor)}</span></div>
        <div style="display:flex;gap:6px">
          <button class="btn bp btn-sm" onclick="confirmarAjudaRecorrente('${a.id}')" title="Lançar no Contas a Pagar">✅ Confirmar</button>
          <button class="btn bg btn-sm" onclick="pularAjudaRecorrente('${a.id}')" title="Não lançar este mês">⏭ Pular</button>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}
function confirmarAjudaRecorrente(id){
  const a=(D.ajudasMotorista||[]).find(x=>x.id===id);
  if(!a)return;
  const mes=new Date().toISOString().substring(0,7);
  const hoje=new Date().toISOString().substring(0,10);
  const bancario=dadosBancariosTexto(a);
  D.despesas.push({
    id:uid(),desc:'AJUDA DE CUSTO — '+a.empresa+' — '+a.motorista+' (recorrente '+mes+')',
    cat:'Ajuda de Custo',vl:a.valor,dt:hoje,vc:hoje,st:'pendente',fluxo:'sim',cp:'sim',
    forn:a.empresa,placa:a.placa||'',
    ob:bancario+(a.obs?' | Obs: '+a.obs:'')+(a.telefone?' | Tel: '+a.telefone:''),origemAjuda:id
  });
  a.mesesTratados=a.mesesTratados||[];a.mesesTratados.push(mes);
  auditar('CRIACAO','ajuda_motorista','Ajuda recorrente CONFIRMADA: '+a.motorista+' '+mes+' → Contas a Pagar');
  sv();rdAjudasRecorrentes();if(typeof rdDash==='function')rdDash();
  toast('Ajuda confirmada e lançada em Contas a Pagar!','ok');
}
function pularAjudaRecorrente(id){
  const a=(D.ajudasMotorista||[]).find(x=>x.id===id);
  if(!a)return;
  const mes=new Date().toISOString().substring(0,7);
  a.mesesTratados=a.mesesTratados||[];a.mesesTratados.push(mes);
  auditar('ALTERACAO','ajuda_motorista','Ajuda recorrente PULADA: '+a.motorista+' '+mes);
  sv();rdAjudasRecorrentes();
  toast('Ajuda pulada este mês (não lançada).','ok');
}

