// ===== WhatsApp (link wa.me — abre o WhatsApp com a mensagem já escrita) =====
function _telWhats(tel){var d=String(tel||'').replace(/\D/g,'');if(!d)return '';if(d.length<=11)d='55'+d;return d;}
function _telCliente(nome){var c=(D.clientes||[]).find(function(x){return (x.nome||'').trim().toLowerCase()===String(nome||'').trim().toLowerCase();});return c?(c.tel||''):'';}
function abrirWhats(tel,msg){var num=_telWhats(tel);var txt=encodeURIComponent(msg||'');var web='https://wa.me/'+(num||'')+'?text='+txt;var app='whatsapp://send?'+(num?('phone='+num+'&'):'')+'text='+txt;_abrirWaPreferindoApp(app,web);}
function _abrirWaPreferindoApp(app,web){var abriu=false;function vc(){if(document.hidden){abriu=true;document.removeEventListener('visibilitychange',vc);}}document.addEventListener('visibilitychange',vc);function bl(){abriu=true;window.removeEventListener('blur',bl);}window.addEventListener('blur',bl);try{window.location.href=app;}catch(e){}setTimeout(function(){document.removeEventListener('visibilitychange',vc);window.removeEventListener('blur',bl);if(!abriu){window.open(web,'_blank');}},1800);}
function abrirWhatsAppGeral(){_abrirWaPreferindoApp('whatsapp://','https://web.whatsapp.com');}
function _waDefault(aba){var d={revisao:'🔧 *Revisão* — veículo {placa} ({marca} {modelo})\nOlá {nome}! Precisamos agendar a revisão deste veículo. Quando podemos combinar?',medicao:'📐 *Medição* — {cliente}\n{periodo}\nHoras: {horas}h\nValor: {valor}\nVencimento: {vencimento}',cobranca:'💰 *Cobrança* — {cliente}\nPlaca {placa}\nValor: {valor}\nVencimento: {vencimento}',os:'🔧 *OS {os}*\nVeículo: {veiculo}\nData: {data}\nTotal: {total}'};return d[aba]||'';}
function _waTpl(aba){var m=(D.config&&D.config.waMsg)?D.config.waMsg[aba]:'';return (m&&m.trim())?m:_waDefault(aba);}
function _preench(tpl,dados){return String(tpl||'').replace(/\{(\w+)\}/g,function(_,k){return (dados[k]!=null&&dados[k]!=='')?String(dados[k]):'';});}
function abrirWaModal(tel,msg){var _e=(typeof escH==='function')?escH:function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};document.getElementById('wa-tel').value=tel||'';document.getElementById('wa-msg').value=msg||'';var sel=document.getElementById('wa-cli-sel');if(sel){var cls=(D.clientes||[]).filter(function(c){return c.tel&&String(c.tel).trim();}).sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');});sel.innerHTML='<option value="">— escolher cliente cadastrado —</option>'+cls.map(function(c){return '<option value="'+_e(c.tel)+'">'+_e(c.nome)+' — '+_e(c.tel)+'</option>';}).join('');}openM('m-wa-send');}
function waSelCliente(){var v=document.getElementById('wa-cli-sel').value;if(v)document.getElementById('wa-tel').value=v;}
function waEnviar(){var tel=document.getElementById('wa-tel').value;var msg=document.getElementById('wa-msg').value;if(!String(tel).replace(/\D/g,'')){toast('Informe um número ou escolha um cliente','er');return;}closeM('m-wa-send');abrirWhats(tel,msg);}
function whatsRev(eqId,qual){var e=(D.equips||[]).find(function(x){return x.id===eqId;});if(!e){toast('Veículo não encontrado','er');return;}var pt=e.patio||{};var tel=(qual==='mot')?(pt.motTel||''):(pt.respTel||'');var nome=(qual==='mot')?(pt.motNome||''):(pt.respNome||'');var msg=_preench(_waTpl('revisao'),{placa:(e.placa||''),marca:(e.mk||''),modelo:(e.mo||''),nome:nome});abrirWhats(tel,msg);}
function whatsMed(id){var m=(D.medicoes||[]).find(function(x){return x.id===id;});if(!m){toast('Medição não encontrada','er');return;}var f=(typeof fmt==='function')?fmt:function(v){return v;};var fd=(typeof fmtData==='function')?fmtData:function(v){return v;};var periodo=(m.ms?m.ms+': ':'')+(m.de?fd(m.de):'')+(m.at?' a '+fd(m.at):'');var msg=_preench(_waTpl('medicao'),{cliente:(m.cl||''),periodo:periodo,horas:(m.hr||'-'),valor:f(m.total),vencimento:(m.vc?fd(m.vc):'-')});abrirWaModal(_telCliente(m.cl),msg);}
function whatsCobranca(id,tipo){var x=(tipo==='venda')?(D.vendas||[]).find(function(v){return v.id===id;}):(D.medicoes||[]).find(function(m){return m.id===id;});if(!x){toast('Lançamento não encontrado','er');return;}var f=(typeof fmt==='function')?fmt:function(v){return v;};var fd=(typeof fmtData==='function')?fmtData:function(v){return v;};var cli=x.cl||x.cli||'';var msg=_preench(_waTpl('cobranca'),{cliente:cli,placa:(x.placa||'-'),valor:f(x.total),vencimento:(x.vc?fd(x.vc):'-')});abrirWaModal(_telCliente(cli),msg);}
function whatsOS(id){var m=(D.manutencoes||[]).find(function(x){return x.id===id;});if(!m){toast('OS não encontrada','er');return;}var f=(typeof fmt==='function')?fmt:function(v){return v;};var fd=(typeof fmtData==='function')?fmtData:function(v){return v;};var msg=_preench(_waTpl('os'),{os:(m.osNum||'-'),veiculo:(m.eqLbl||'-'),data:(m.en?fd(m.en):'-'),tipo:(m.tipo||'-'),total:(m.total?f(m.total):'-')});abrirWaModal('',msg);}
function popWaMsgs(){var w=(D.config&&D.config.waMsg)||{};['revisao','medicao','cobranca','os'].forEach(function(a){var el=document.getElementById('wamsg-'+a);if(el)el.value=(w[a]&&w[a].trim())?w[a]:_waDefault(a);});}
function salvarWaMsgs(){if(!D.config)D.config={};D.config.waMsg={revisao:document.getElementById('wamsg-revisao').value,medicao:document.getElementById('wamsg-medicao').value,cobranca:document.getElementById('wamsg-cobranca').value,os:document.getElementById('wamsg-os').value};sv();toast('Mensagens padrão salvas!','ok');}// ----- Aba WhatsApp (central: número, envio e mensagens prontas) -----
function salvarWaNumero(){if(!D.config)D.config={};D.config.waNumero=document.getElementById('wa-empresa-num').value.trim();sv();toast('Número salvo!','ok');}
function waUsarPronta(id){if(!id)return;var pr=(D.config&&D.config.waProntas)||[];var p=pr.find(function(x){return x.id===id;});if(p)document.getElementById('wac-msg').value=p.texto||'';}
function waEnviarCentral(){var tel=document.getElementById('wac-tel').value;var msg=document.getElementById('wac-msg').value;if(!String(tel).replace(/\D/g,'')){toast('Informe um número ou escolha um cliente','er');return;}if(!msg.trim()){toast('Escreva a mensagem','er');return;}abrirWhats(tel,msg);}
function waProntaNova(){document.getElementById('wap-id').value='';document.getElementById('wap-titulo').value='';document.getElementById('wap-texto').value='';openM('m-wa-pronta');}
function waProntaEditar(id){var pr=(D.config&&D.config.waProntas)||[];var p=pr.find(function(x){return x.id===id;});if(!p)return;document.getElementById('wap-id').value=p.id;document.getElementById('wap-titulo').value=p.titulo||'';document.getElementById('wap-texto').value=p.texto||'';openM('m-wa-pronta');}
function waProntaSalvar(){var t=document.getElementById('wap-titulo').value.trim();var x=document.getElementById('wap-texto').value.trim();if(!t&&!x){toast('Preencha a mensagem','er');return;}if(!D.config)D.config={};if(!Array.isArray(D.config.waProntas))D.config.waProntas=[];var id=document.getElementById('wap-id').value;if(id){var p=D.config.waProntas.find(function(y){return y.id===id;});if(p){p.titulo=t;p.texto=x;}}else{D.config.waProntas.push({id:(typeof uid==='function'?uid():String(Date.now())),titulo:t,texto:x});}sv();closeM('m-wa-pronta');if(typeof rdWhats==='function')rdWhats();toast('Mensagem salva!','ok');}
function waProntaExcluir(id){if(!confirm('Excluir esta mensagem pronta?'))return;if(!D.config||!Array.isArray(D.config.waProntas))return;D.config.waProntas=D.config.waProntas.filter(function(p){return p.id!==id;});sv();if(typeof rdWhats==='function')rdWhats();toast('Mensagem excluída.','ok');}
function rdWhats(){
  var _e=(typeof escH==='function')?escH:function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
  var ne=document.getElementById('wa-empresa-num'); if(ne)ne.value=(D.config&&D.config.waNumero)||'';
  var selC=document.getElementById('wac-cli');
  if(selC){var cls=(D.clientes||[]).filter(function(c){return c.tel&&String(c.tel).trim();}).sort(function(a,b){return (a.nome||'').localeCompare(b.nome||'');});selC.innerHTML='<option value="">— escolher cliente —</option>'+cls.map(function(c){return '<option value="'+_e(c.tel)+'">'+_e(c.nome)+' — '+_e(c.tel)+'</option>';}).join('');}
  var pr=(D.config&&D.config.waProntas)||[];
  var selP=document.getElementById('wac-pronta');
  if(selP){selP.innerHTML='<option value="">— escolher mensagem pronta —</option>'+pr.map(function(p){return '<option value="'+p.id+'">'+_e(p.titulo||'(sem título)')+'</option>';}).join('');}
  var lst=document.getElementById('wa-prontas-list');
  if(lst){lst.innerHTML=pr.length?pr.map(function(p){return '<div style="background:var(--cd2);border:1px solid var(--br);border-radius:6px;padding:8px;margin-bottom:6px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><div style="flex:1"><div style="font-weight:600;font-size:12px">'+_e(p.titulo||'(sem título)')+'</div><div style="font-size:11px;color:var(--mt);white-space:pre-wrap;margin-top:3px">'+_e(p.texto||'')+'</div></div><div style="display:flex;gap:4px;flex-shrink:0"><button class="btn bw btn-xs" onclick="waProntaEditar(\''+p.id+'\')" title="Editar">✏️</button><button class="btn bd btn-xs" onclick="waProntaExcluir(\''+p.id+'\')" title="Excluir">×</button></div></div></div>';}).join(''):'<div style="font-size:12px;color:var(--mt)">Nenhuma mensagem pronta cadastrada ainda. Clique em "Nova mensagem".</div>';}
  if(typeof popWaMsgs==='function')popWaMsgs();
}

function imprimirComOpcoes(titulo){
  // REGRA GERAL: toda impressão pergunta Simplificada ou Detalhada
  const detalhada=confirm('📄 TIPO DE IMPRESSÃO\n\nOK = DETALHADA (todos os dados)\nCancelar = SIMPLIFICADA (resumo)');
  // Aplica modo de impressão via classe CSS
  document.body.classList.remove('print-simples','print-detalhada');
  document.body.classList.add(detalhada?'print-detalhada':'print-simples');
  auditar('IMPRESSAO', cur||'sistema', (detalhada?'Detalhada':'Simplificada')+': '+(titulo||document.title));
  setTimeout(()=>{
    window.print();
    setTimeout(()=>{document.body.classList.remove('print-simples','print-detalhada');},1000);
  },100);
}

// REGRA GERAL: ao imprimir com uma janela de visualização aberta, imprime SÓ ela (não o fundo)
window.addEventListener('beforeprint', function(){
  try{
    var m=document.querySelector('.mo.op');
    if(m){ document.body.classList.add('imprimindo-modal'); m.classList.add('modal-print-alvo'); }
  }catch(e){}
});
window.addEventListener('afterprint', function(){
  try{
    document.body.classList.remove('imprimindo-modal');
    var a=document.querySelector('.modal-print-alvo'); if(a)a.classList.remove('modal-print-alvo');
  }catch(e){}
});

// REGRA GERAL: todos os campos de texto exibidos/salvos em MAIÚSCULAS,
// exceto e-mail, senha, login e dados técnicos (servidor SMTP, etc.).
(function(){
  var IDS_SEM_UPPER = ['usr-lg','usr-pw','lg-user','lg-pass','pe-para','em-para','cli-email','emc-default','emc-financeiro','emc-operacional','emc-admin'];
  function semUpper(el){
    if(!el || (el.tagName!=='INPUT' && el.tagName!=='TEXTAREA')) return true;
    if(el.hasAttribute('data-no-upper')) return true;
    var t=(el.getAttribute('type')||'text').toLowerCase();
    if(['email','password','number','date','datetime-local','time','month','week','url','tel','color','range','file','checkbox','radio','hidden'].indexOf(t)>=0) return true;
    var id=(el.id||'').toLowerCase(), nm=(el.name||'').toLowerCase(), key=id+'|'+nm;
    if(/mail|senha|login|host|smtp|porta|remetente|imap|token|chave|usuario|\burl\b|http|\bsite\b/.test(key)) return true;
    if(IDS_SEM_UPPER.indexOf(id)>=0) return true;
    if(id.indexOf('ce-')===0 || id.indexOf('lg-')===0 || id.indexOf('emc-')===0) return true;
    return false;
  }
  document.addEventListener('input', function(e){
    if(e.isComposing) return;
    var el=e.target;
    if(semUpper(el)) return;
    var v=el.value; if(!v) return;
    var up=v.toUpperCase(); if(up===v) return;
    var s=null,en=null;
    try{ s=el.selectionStart; en=el.selectionEnd; }catch(_){}
    el.value=up;
    try{ if(s!=null) el.setSelectionRange(s,en); }catch(_){}
  });
})();


// REGRA GERAL: todas as datas exibidas em DD/MM/AAAA

// ---- BUSCA UNIVERSAL (lupa em todos os módulos) ----

// REGRA: todo botão mostra o nome da opção ao passar o mouse (tooltip automático)
function aplicarTooltips(){
  document.querySelectorAll('button:not([title]), .btn:not([title])').forEach(b=>{
    const txt=(b.textContent||'').trim();
    const mapa={'×':'Excluir','✏️':'Editar','🔍':'Ver detalhes','→':'Avançar status','🖨':'Imprimir','👁':'Visualizar','↩️':'Retornar','✅':'Confirmar','＋':'Adicionar','+':'Adicionar'};
    b.title=mapa[txt]||txt||'Ação';
  });
}

function filtrarTabela(inp, tbodyId){
  const q=(inp.value||'').toLowerCase().trim();
  const linhas=document.querySelectorAll('#'+tbodyId+' tr');
  let visiveis=0;
  linhas.forEach(tr=>{
    if(tr.querySelector('.empty')){return;}
    const mostra=!q||tr.textContent.toLowerCase().includes(q);
    tr.style.display=mostra?'':'none';
    if(mostra)visiveis++;
  });
}

function fmtData(iso){
  if(!iso) return '-';
  if(typeof iso!=='string') return iso;
  // já está DD/MM/AAAA?
  if(/^\d{2}\/\d{2}\/\d{4}/.test(iso)) return iso;
  // ISO AAAA-MM-DD → DD/MM/AAAA
  const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return m[3]+'/'+m[2]+'/'+m[1];
  return iso;
}

function fmtMoeda(el){
  // Remove tudo exceto dígitos
  let v=el.value.replace(/\D/g,'');
  if(!v){el.value='';return;}
  // Converte para centavos
  v=(parseInt(v)/100).toFixed(2);
  // Formata com separadores brasileiros
  el.value=v.replace('.',',').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
}
function moedaParaNum(str){
  if(typeof str==='number') return str;
  if(!str) return 0;
  return parseFloat(String(str).replace(/\./g,'').replace(',','.'))||0;
}

function fmtDocFiscal(el){
  let v=el.value.replace(/\D/g,'');
  if(v.length<=11){v=v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');}
  else{v=v.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/,'$1.$2.$3/$4-$5');}
  el.value=v.replace(/-$/,'').replace(/\.$/,'').replace(/\/$/,'');
}


function popClientesVenda(){
  const sel=document.getElementById('vd-cli-sel');
  if(!sel) return;
  sel.innerHTML='<option value="">— Digitar manual —</option>';
  (D.clientes||[]).forEach(c=>{
    sel.innerHTML+=`<option value="${c.id}">${c.nome}</option>`;
  });
}
function usarClienteVenda(){
  const cid=document.getElementById('vd-cli-sel').value;
  const inp=document.getElementById('vd-cli');
  if(!cid){inp.value='';inp.readOnly=false;return;}
  const c=(D.clientes||[]).find(x=>x.id===cid);
  if(c){inp.value=c.nome;inp.readOnly=true;}
}

function saveVenda(){
  const cli=document.getElementById('vd-cli').value.trim();if(!cli){toast('Informe o cliente','er');return;}
  if(!vdItems.length){toast('Adicione itens','er');return;}
  const sub=vdItems.reduce((s,i)=>s+i.qtd*i.val,0);
  const desc=parseFloat(document.getElementById('vd-desc').value)||0;
  const tot=sub*(1-desc/100);
  const dados={cli,dt:document.getElementById('vd-dt').value,doc:document.getElementById('vd-doc')?document.getElementById('vd-doc').value:'',tdoc:document.getElementById('vd-tdoc')?document.getElementById('vd-tdoc').value:'nf_simples',con:document.getElementById('vd-con').value,pag:document.getElementById('vd-pag').value,ob:document.getElementById('vd-ob').value,items:[...vdItems],sub,desc,total:tot};
  const eid=document.getElementById('vd-eid')?document.getElementById('vd-eid').value:'';
  if(eid){
    const v=D.vendas.find(x=>x.id===eid);
    if(v){
      if(v.faturada===true){toast('Venda já faturada não pode ser editada.','er');return;}
      Object.assign(v,dados);processarPneusVenda(v.items,v.num,cli);
      auditar('EDICAO','vendas','Venda '+v.num+' editada: '+fmt(tot));
      sv();closeM('m-venda');toast('Venda '+v.num+' atualizada!');updPendCnt();rp(cur);return;
    }
  }
  const num=nextNum('venda');
  D.vendas.push(Object.assign({id:uid(),num:'VD-'+num},dados,{st:'pendente',faturada:false}));processarPneusVenda(vdItems,'VD-'+num,cli);
  auditar('CRIACAO','vendas','Venda VD-'+num+' criada (a faturar): '+fmt(tot));
  sv();closeM('m-venda');toast('Venda VD-'+num+' salva! Clique em 💰 Faturar para enviar ao Contas a Receber.');updPendCnt();rp(cur);
}
function advVenda(id){
  // REGRA: status financeiro só muda no módulo FINANCEIRO
  toast('⚠️ Status de pagamento só pode ser alterado no módulo Financeiro (Contas a Receber)','er');
}
function delVenda(id){reqSenha(()=>{if(!confirm('Excluir venda?'))return;const v=D.vendas.find(x=>x.id===id);if(v)v.items.forEach(i=>{if(i.estqId){const e=D.estoque.find(x=>x.id===i.estqId);if(e)e.qt+=i.qtd;}if(i.fonte==='pneu'&&i.pneuId){var p=(D.pneus||[]).find(x=>x.id===i.pneuId);if(p&&p.st==='vendido'){p.st='estoque';p.vdNum='';p.dtVenda='';p.local='Estoque';}}});auditarExclusao('vendas','Venda excluída');D.vendas=D.vendas.filter(x=>x.id!==id);sv();rdVendas();toast('Venda excluída.');});}
function editVenda(id){if(_bloqEditar('vend'))return;
  const v=D.vendas.find(x=>x.id===id);if(!v)return;
  if(v.faturada===true){toast('Venda já faturada não pode ser editada. Para o pagamento, use o Contas a Receber.','er');return;}
  if(typeof popClientesVenda==='function')popClientesVenda();
  openM('m-venda');
  document.getElementById('vd-eid').value=v.id;
  document.getElementById('vd-mtitle').textContent='✏️ Editar Venda '+v.num;
  document.getElementById('vd-cli').value=v.cli||'';
  document.getElementById('vd-dt').value=v.dt||'';
  if(document.getElementById('vd-doc'))document.getElementById('vd-doc').value=v.doc||'';
  if(document.getElementById('vd-tdoc'))document.getElementById('vd-tdoc').value=v.tdoc||'nf_simples';
  if(document.getElementById('vd-con'))document.getElementById('vd-con').value=v.con||'';
  if(document.getElementById('vd-pag'))document.getElementById('vd-pag').value=v.pag||'';
  if(document.getElementById('vd-ob'))document.getElementById('vd-ob').value=v.ob||'';
  if(document.getElementById('vd-desc'))document.getElementById('vd-desc').value=v.desc||0;
  vdItems=(v.items||[]).map(i=>Object.assign({},i));
  rdVdItems();
}
function faturarVenda(id){
  const v=D.vendas.find(x=>x.id===id);if(!v)return;
  if(v.faturada===true){toast('Esta venda já foi faturada.','er');return;}
  if(!confirm('Faturar a venda '+v.num+' no valor de '+fmt(v.total)+'?\n\nEla será enviada para o Contas a Receber.'))return;
  v.faturada=true;
  if(!v.vc) v.vc=v.dt||(typeof today==='function'?today():new Date().toISOString().slice(0,10));
  if(!v.st||v.st==='rascunho') v.st='pendente';
  auditar('FATURAMENTO','vendas','Venda '+v.num+' faturada: '+fmt(v.total));
  sv();rdVendas();toast('✅ Venda '+v.num+' faturada e enviada ao Contas a Receber!');
}

