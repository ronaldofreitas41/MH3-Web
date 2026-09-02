
(function(){
  function cfgEmails(){ if(!D.config.emailsEnvio) D.config.emailsEnvio={default:'',admin:'',financeiro:'',operacional:''}; return D.config.emailsEnvio; }
  window.emailDestinoPadrao = function(){
    const c=cfgEmails(); const perfil=(authUser&&authUser.perfil)||'';
    return (c[perfil]||c.default||'');
  };
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function linha(lbl,val){ if(val==null||val==='') return ''; return `<tr><td style="padding:4px 10px;color:#666;border-bottom:1px solid #eee">${esc(lbl)}</td><td style="padding:4px 10px;font-weight:600;border-bottom:1px solid #eee">${esc(val)}</td></tr>`; }
  function docMedicao(m){
    const rows=[['Cliente',m.cl],['Nº Medição',m.numMed],['Mês de referência',m.ms],['Placa/Equip.',m.placa],['Vencimento',m.vc?fmtData(m.vc):''],['Status',m.st]];
    return {assunto:`Medição ${m.numMed||''} — ${m.cl||'MH3 Rental'}`, titulo:`MEDIÇÃO ${m.numMed||''}`, rows, total:m.total};
  }
  function docMob(m){
    const rows=[['Tipo',m.tipo],['Cliente',m.cliente||m.cl],['Contrato',m.contrato],['Placa/Equip.',m.placa],['Local',m.local],['Saída',m.saida?fmtData(m.saida):''],['Chegada',m.chegada?fmtData(m.chegada):''],['Status',m.st||m.status]];
    return {assunto:`Mobilização — ${m.cliente||m.placa||'MH3 Rental'}`, titulo:`MOBILIZAÇÃO`, rows, total:m.total||m.valor};
  }
  function docOS(m){
    const rows=[['OS Nº',m.osNum],['Veículo/Equip.',m.eqLbl],['Tipo',m.tipo],['Entrada',m.en?fmtData(m.en):''],['Saída',m.sa?fmtData(m.sa):''],['Status',m.status],['Custo',(m.custo==='mh3'||!m.custo)?'Interno (MH3)':m.custo]];
    return {assunto:`OS ${m.osNum||''} — ${m.eqLbl||'MH3 Rental'}`, titulo:`ORDEM DE SERVIÇO ${m.osNum||''}`, rows, total:m.total};
  }
  function buildHTML(doc){
    let tabela=doc.rows.map(r=>linha(r[0],r[1])).join('');
    let tot = (doc.total!=null&&doc.total!=='')?`<tr><td style="padding:8px 10px;color:#C8102E;font-weight:700;border-top:2px solid #C8102E">TOTAL</td><td style="padding:8px 10px;color:#C8102E;font-weight:700;font-size:16px;border-top:2px solid #C8102E">${fmt(doc.total)}</td></tr>`:'';
    return `<div style="font-family:Arial,sans-serif;max-width:560px;color:#222">
      <div style="background:#C8102E;color:#fff;padding:14px 18px;border-radius:8px 8px 0 0"><div style="font-size:22px;font-weight:800;letter-spacing:1px">MH3 RENTAL</div><div style="font-size:12px;opacity:.9">${esc(doc.titulo)}</div></div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-top:0">${tabela}${tot}</table>
      <div style="font-size:11px;color:#999;padding:10px 4px">Documento gerado pelo Sistema MH3 Rental — mh3rental.com.br · ${new Date().toLocaleString('pt-BR')}</div>
    </div>`;
  }
  let _emailDoc=null;
  window.abrirEnvioEmail = function(tipo){
    let rec=null, doc=null;
    if(tipo==='medicao'){ const id=(document.getElementById('med-eid')||{}).value; rec=D.medicoes.find(x=>x.id===id); if(!rec){toast('Salve a medição antes de enviar por e-mail.','er');return;} doc=docMedicao(rec); }
    else if(tipo==='mobilizacao'){ const id=(document.getElementById('mob-eid')||{}).value; rec=(D.mobilizacoes||[]).find(x=>x.id===id); if(!rec){toast('Salve a mobilização antes de enviar.','er');return;} doc=docMob(rec); }
    else if(tipo==='os'){ const id=window._emailOSId; rec=(D.manutencoes||[]).find(x=>x.id===id); if(!rec){toast('OS não encontrada.','er');return;} doc=docOS(rec); }
    if(!doc) return;
    _emailDoc=doc;
    document.getElementById('em-para').value=emailDestinoPadrao();
    if(window.setEmailTextoModo){ window.setEmailTextoModo('auto'); }
    else { document.getElementById('em-assunto').value=doc.assunto; document.getElementById('em-msg').value=''; document.getElementById('em-preview').innerHTML=buildHTML(doc); }
    const ehAdm=ehAdminAtual();
    document.getElementById('em-cfg-link').style.display=ehAdm?'inline':'none';
    document.getElementById('em-admin-cfg').style.display='none';
    var ec=document.getElementById('em-confirmar'); if(ec) ec.checked=!!(D.config&&D.config.emailConfirmarSempre);
    openM('m-email');
  };
  window.toggleEmailCfg = function(){
    const c=cfgEmails(); const box=document.getElementById('em-admin-cfg');
    document.getElementById('emc-default').value=c.default||'';
    document.getElementById('emc-financeiro').value=c.financeiro||'';
    document.getElementById('emc-operacional').value=c.operacional||'';
    document.getElementById('emc-admin').value=c.admin||'';
    box.style.display=box.style.display==='none'?'block':'none';
  };
  window.salvarEmailsCfg = function(){
    const c=cfgEmails();
    c.default=document.getElementById('emc-default').value.trim();
    c.financeiro=document.getElementById('emc-financeiro').value.trim();
    c.operacional=document.getElementById('emc-operacional').value.trim();
    c.admin=document.getElementById('emc-admin').value.trim();
    sv(); toast('E-mails padrão salvos!','ok');
    document.getElementById('em-para').value=emailDestinoPadrao();
  };
  window.confirmarEnvioEmail = function(){
    const para=document.getElementById('em-para').value.trim();
    const assunto=document.getElementById('em-assunto').value.trim();
    if(!para||!/.+@.+\..+/.test(para)){toast('Informe um e-mail de destino válido.','er');return;}
    if(!assunto){toast('Informe o assunto.','er');return;}
    if(!_emailDoc){toast('Nada para enviar.','er');return;}
    if(window.lembrarEmail) window.lembrarEmail(para);
    const msg=document.getElementById('em-msg').value.trim();
    const corpo=(msg?`<p style="font-family:Arial;font-size:13px">${msg.replace(/</g,'&lt;')}</p>`:'')+buildHTML(_emailDoc);
    var pedirConf=(document.getElementById('em-confirmar')&&document.getElementById('em-confirmar').checked);
    window.mh3EnviarEmail({
      para:para, assunto:assunto, corpoHtml:corpo, confirmar:pedirConf, permitirFallback:true,
      onProgress:function(m){ toast(m,'ok'); },
      onOk:function(j,confirmou){
        toast('E-mail enviado para '+para+'!'+(confirmou?' 📩 (confirmação solicitada)':''),'ok');
        if(pedirConf && !confirmou){ toast('Obs.: a confirmação de recebimento exige a conta de e-mail configurada. O e-mail foi enviado, mas sem a confirmação.','er'); }
        closeM('m-email');
      },
      onErr:function(m){ toast('Não foi possível enviar: '+m,'er'); }
    });
  };
  // Hook verOS para habilitar envio da OS
  const _verOS=window.verOS;
  if(typeof _verOS==='function'){
    window.verOS=function(id){ _verOS(id); window._emailOSId=id;
      const fb=document.getElementById('view-body');
      if(fb && !document.getElementById('btn-email-os')){
        fb.insertAdjacentHTML('beforeend','<div style="margin-top:14px;text-align:center"><button id="btn-email-os" class="btn bp" onclick="abrirEnvioEmail(\u0027os\u0027)">📧 Enviar OS por e-mail</button></div>');
      }
    };
  }

  window._emailRefreshPreview=function(){
    if(!_emailDoc) return;
    var msg=(document.getElementById('em-msg').value||'').trim();
    var intro = msg?'<p style="font-family:Arial;font-size:13px;white-space:pre-wrap">'+msg.replace(/</g,'&lt;')+'</p>':'';
    document.getElementById('em-preview').innerHTML=intro+buildHTML(_emailDoc);
  };
  window.setEmailTextoModo=function(modo){
    if(!_emailDoc) return;
    var ba=document.getElementById('em-modo-auto'), bm=document.getElementById('em-modo-manual');
    if(modo==='manual'){
      document.getElementById('em-assunto').value=document.getElementById('em-assunto').value||_emailDoc.assunto;
      document.getElementById('em-msg').value='';
      if(ba)ba.className='btn bg'; if(bm)bm.className='btn bp';
      window._emailRefreshPreview();
      setTimeout(function(){try{document.getElementById('em-msg').focus();}catch(e){}},60);
    } else {
      document.getElementById('em-assunto').value=_emailDoc.assunto;
      document.getElementById('em-msg').value='Prezados,\n\nSegue o documento para análise.\n\nAtenciosamente,\nMH3 Rental';
      if(ba)ba.className='btn bp'; if(bm)bm.className='btn bg';
      window._emailRefreshPreview();
    }
  };
  window.emailAutoSe=function(tipo, rec){
    try{
      if(!(D.config && D.config.emailAuto && D.config.emailAuto[tipo])) return;
      if(!rec) return;
      var doc=null;
      if(tipo==='medicao') doc=docMedicao(rec);
      else if(tipo==='mobilizacao') doc=docMob(rec);
      else if(tipo==='os') doc=docOS(rec);
      if(!doc) return;
      var para=emailDestinoPadrao();
      if(!para||!/.+@.+\..+/.test(para)){ toast('Envio automático: configure o e-mail de destino padrão nas Configurações.','er'); return; }
      var corpo=buildHTML(doc);
      var pedirConf=!!(D.config && D.config.emailConfirmarSempre);
      window.mh3EnviarEmail({ para:para, assunto:doc.assunto, corpoHtml:corpo, confirmar:pedirConf, permitirFallback:true,
        onOk:function(j,confirmou){ toast('📧 Enviado automaticamente para '+para+(confirmou?' 📩':''),'ok'); },
        onErr:function(m){ toast('Envio automático falhou: '+m,'er'); } });
    }catch(e){ toast('Envio automático: falha de conexão.','er'); }
  };
  // ----- Builders extras (venda / conta) e abertura por lançamento -----
  function docVenda(v){
    var rows=[['Venda',v.num],['Cliente',v.cli||v.cliente],['Data',v.dt?fmtData(v.dt):''],['Pagamento',v.pag],['Status',(v.st==='pago')?'Pago':'Pendente']];
    return {assunto:'Venda '+(v.num||'')+' — '+(v.cli||'MH3 Rental'), titulo:'NOTA DE VENDA '+(v.num||''), rows:rows, total:v.total};
  }
  function docConta(c, modo){
    var venc=c.vc?fmtData(c.vc):'';
    if(modo==='receber'){
      var rows=[['Cliente',c.cli||c.cl||c.cliente],['Descrição',c.de||c.desc||'Cobrança'],['Vencimento',venc],['Placa/Equip.',c.placa||''],['Status',c.st||'pendente']];
      return {assunto:'Cobrança — '+(c.cli||c.cl||'MH3 Rental')+(venc?' (venc. '+venc+')':''), titulo:'COBRANÇA', rows:rows, total:c.total||c.vl};
    } else {
      var rows=[['Descrição',c.desc||c.de||'Conta a pagar'],['Fornecedor',c.forn||''],['Vencimento',venc],['Categoria',c.cat||''],['Status',c.st||'pendente']];
      return {assunto:'Conta a pagar — '+(c.desc||c.forn||'MH3 Rental'), titulo:'CONTA A PAGAR', rows:rows, total:c.vl||c.total};
    }
  }
  window.emailDoCliente=function(nome){
    if(!nome) return '';
    var c=(D.clientes||[]).find(function(x){return (x.nome||'').toLowerCase()===String(nome).toLowerCase();});
    return (c&&c.email)?c.email:'';
  };
  // Abre o modal de envio para um lançamento específico (linha de tabela)
  window.abrirEnvioEmailLanc=function(tipo, rec, paraSugerido){
    if(!rec){ toast('Registro não encontrado.','er'); return; }
    var doc=null, para='';
    if(tipo==='medicao'){ doc=docMedicao(rec); para=emailDoCliente(rec.cl||rec.cliente); }
    else if(tipo==='venda'){ doc=docVenda(rec); para=emailDoCliente(rec.cli||rec.cliente); }
    else if(tipo==='mobilizacao'){ doc=docMob(rec); para=emailDoCliente(rec.cliente||rec.cl); }
    else if(tipo==='os'){ doc=docOS(rec); }
    else if(tipo==='conta_receber'){ doc=docConta(rec,'receber'); para=emailDoCliente(rec.cli||rec.cl||rec.cliente); }
    else if(tipo==='conta_pagar'){ doc=docConta(rec,'pagar'); }
    if(!doc){ toast('Tipo de documento não suportado.','er'); return; }
    _emailDoc=doc;
    document.getElementById('em-para').value=paraSugerido||para||emailDestinoPadrao();
    if(window.setEmailTextoModo){ window.setEmailTextoModo('auto'); }
    else { document.getElementById('em-assunto').value=doc.assunto; document.getElementById('em-msg').value=''; document.getElementById('em-preview').innerHTML=buildHTML(doc); }
    var ehAdm=ehAdminAtual();
    document.getElementById('em-cfg-link').style.display=ehAdm?'inline':'none';
    document.getElementById('em-admin-cfg').style.display='none';
    var ec2=document.getElementById('em-confirmar'); if(ec2) ec2.checked=!!(D.config&&D.config.emailConfirmarSempre);
    openM('m-email');
    try{ if(window._mostrarDeEmail) window._mostrarDeEmail(); }catch(e){}
  };
  // ----- COBRANÇA AUTOMÁTICA X horas após o vencimento (00:00 do venc + X horas) -----
  window.processarCobrancasAgendadas=async function(silencioso){
    try{
      var cfg=(D.config&&D.config.emailCobranca)||{};
      if(cfg.modo!=='auto') return;
      var horas=parseFloat(cfg.horas); if(isNaN(horas)) horas=6;
      var agora=Date.now();
      var alvo=[];
      (D.medicoes||[]).forEach(function(m){ if(m.st!=='paga'&&m.st!=='pago'&&!m.cobrancaEnviada&&m.vc){ alvo.push({tipo:'medicao',rec:m}); }});
      (D.vendas||[]).forEach(function(v){ if(v.st!=='pago'&&v.st!=='paga'&&!v.cobrancaEnviada&&v.vc){ alvo.push({tipo:'venda',rec:v}); }});
      var enviados=0;
      for(var k=0;k<alvo.length;k++){
        var rec=alvo[k].rec, tipo=alvo[k].tipo;
        var base=new Date(rec.vc+'T00:00:00'); if(isNaN(base.getTime())) continue;
        var quando=base.getTime()+horas*3600000;
        if(agora < quando) continue; // ainda não chegou a hora
        var doc=(tipo==='medicao')?docMedicao(rec):docVenda(rec);
        var para=emailDoCliente(rec.cl||rec.cli||rec.cliente)||emailDestinoPadrao();
        if(!para||!/.+@.+\..+/.test(para)){ continue; }
        var corpo=buildHTML(doc);
        try{
          var r=await fetch(API+'?action=enviar_email',{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:JSON.stringify({para:para,assunto:doc.assunto,corpo:corpo})});
          var j=await r.json();
          if(j.ok){ rec.cobrancaEnviada=true; rec.cobrancaEnviadaEm=new Date().toISOString(); enviados++; }
        }catch(e){ /* offline: tenta depois */ }
      }
      if(enviados){ if(typeof sv==='function')sv(); if(!silencioso)toast('📧 '+enviados+' cobrança(s) automática(s) enviada(s).','ok'); if(typeof rdContasReceber==='function')rdContasReceber(); }
    }catch(e){}
  };
})();



/* ===== AUTOCOMPLETE REUTILIZÁVEL — sugestões do banco em qualquer campo =====
   Uso: <input data-ac="email"> ou data-ac="marcaPneu" / data-ac="marcaVeiculo".
   As fontes de opções ficam em window._fontesAC. minLetras define a partir de quantas letras sugere. */
(function(){
  window._fontesAC = {
    email: function(){
      var arr=[];
      function add(e){ if(e && typeof e==='string' && e.indexOf('@')>0) arr.push(e.trim()); }
      (D.clientes||[]).forEach(function(c){ add(c.email); add(c.emailCobranca); });
      (D.contratos||[]).forEach(function(c){ add(c.email); });
      (D.funcionarios||[]).forEach(function(f){ add(f.email); });
      (D.fornecedores||[]).forEach(function(f){ add(f.email); });
      (window._emailsConhecidos||[]).forEach(add);
      return arr;
    },
    marcaPneu:    function(){ return (D.config&&D.config.marcasPneu)||[]; },
    marcaVeiculo: function(){ return (D.config&&D.config.marcasVeiculo)||[]; }
  };
  // Histórico de e-mails já enviados (fica salvo no navegador e alimenta as sugestões)
  try{ window._emailsConhecidos = JSON.parse(localStorage.getItem('mh3_emails_conhecidos')||'[]'); }catch(e){ window._emailsConhecidos=[]; }
  window.lembrarEmail = function(emails){
    if(!emails) return;
    var lista = Array.isArray(emails) ? emails : String(emails).split(/[;,]+/);
    var mudou=false;
    lista.forEach(function(e){
      e=String(e||'').trim();
      if(e && e.indexOf('@')>0 && window._emailsConhecidos.indexOf(e)<0){ window._emailsConhecidos.push(e); mudou=true; }
    });
    if(mudou){ try{ localStorage.setItem('mh3_emails_conhecidos', JSON.stringify(window._emailsConhecidos.slice(-200))); }catch(e){} }
  };
  function mh3AC(input, getOpcoes, minL, multi){
    if(!input || input._acReady) return; input._acReady=true;
    input.setAttribute('autocomplete','off');
    var box=document.createElement('div');
    box.style.cssText='position:absolute;z-index:99999;background:var(--cd,#fff);border:1px solid var(--br,#ccc);border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.20);max-height:230px;overflow-y:auto;display:none;font-size:13px;color:var(--tx,#222)';
    document.body.appendChild(box);
    function fechar(){ box.style.display='none'; }
    function parte(){
      var v=input.value||'';
      if(!multi) return { termo:v.trim(), antes:'' };
      var i=Math.max(v.lastIndexOf(','), v.lastIndexOf(';'));
      var ult=(i>=0)? v.slice(i+1) : v;
      var antes=(i>=0)? v.slice(0,i+1)+' ' : '';
      return { termo:ult.trim(), antes:antes };
    }
    function abrir(){
      var pa=parte(); var termo=pa.termo.toLowerCase();
      if(termo.length<minL){ fechar(); return; }
      var ops=(getOpcoes()||[]).filter(function(o){ return String(o).toLowerCase().indexOf(termo)>=0; });
      var vistos={}; ops=ops.filter(function(o){ var k=String(o).toLowerCase(); if(vistos[k])return false; vistos[k]=1; return true; });
      // não sugerir se já está exatamente igual
      ops=ops.filter(function(o){ return String(o).toLowerCase()!==termo; });
      if(!ops.length){ fechar(); return; }
      box.innerHTML='';
      ops.slice(0,8).forEach(function(o){
        var item=document.createElement('div');
        item.style.cssText='padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--br,#eee)';
        item.textContent=o;
        item.onmouseenter=function(){ item.style.background='var(--cd2,#f0f0f0)'; };
        item.onmouseleave=function(){ item.style.background=''; };
        item.onmousedown=function(ev){ ev.preventDefault(); input.value = multi ? (pa.antes+o+', ') : o; fechar(); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); try{input.focus();}catch(e){} };
        box.appendChild(item);
      });
      var r=input.getBoundingClientRect();
      box.style.left=(r.left+window.scrollX)+'px';
      box.style.top=(r.bottom+window.scrollY+2)+'px';
      box.style.minWidth=r.width+'px';
      box.style.display='block';
    }
    input.addEventListener('input', abrir);
    input.addEventListener('focus', abrir);
    input.addEventListener('blur', function(){ setTimeout(fechar,160); });
    input.addEventListener('keydown', function(e){ if(e.key==='Escape')fechar(); });
  }
  window.mh3AC=mh3AC;
  window.initAutocompletes=function(){
    document.querySelectorAll('[data-ac]').forEach(function(inp){
      var f=inp.getAttribute('data-ac');
      if(window._fontesAC[f]) mh3AC(inp, window._fontesAC[f], f==='email'?2:1, f==='email');
    });
  };
  window.addEventListener('load', function(){ setTimeout(function(){
    try{
      if(D.config && !D.config.marcasPneu)    D.config.marcasPneu=['Bridgestone','Continental','Firestone','Goodyear','Michelin','Pirelli'];
      if(D.config && !D.config.marcasVeiculo) D.config.marcasVeiculo=['DAF','Ford','Iveco','MAN','Mercedes-Benz','Scania','Volkswagen','Volvo'];
    }catch(e){}
    window.initAutocompletes();
  }, 1500); });
})();



if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('sw.js').then(function(reg){
      try{ reg.update(); }catch(e){}
      // Quando um Service Worker novo assumir o controle, recarrega 1x para aplicar a versão nova
      var jaRecarregou=false;
      navigator.serviceWorker.addEventListener('controllerchange', function(){
        if(jaRecarregou) return; jaRecarregou=true;
        window.location.reload();
      });
      // Verifica se há atualização sempre que o app volta ao primeiro plano (útil no celular)
      document.addEventListener('visibilitychange', function(){
        if(document.visibilityState==='visible'){ try{ reg.update(); }catch(e){} }
      });
    }).catch(function(e){ console.log('SW:', e&&e.message); });
  });
}



/* ===== CONTAS DE E-MAIL POR USUÁRIO (admin cadastra, envio sai com a conta do usuário) ===== */
(function(){
  window._ceContas=[];
  window.limparFormContaEmail=function(){
    ['ce-id','ce-apelido','ce-remetente','ce-nome','ce-host','ce-login','ce-senha','ce-imap-host','ce-imap-porta'].forEach(function(id){var e=document.getElementById(id);if(e)e.value='';});
    var p=document.getElementById('ce-porta'); if(p)p.value='587';
    var sg=document.getElementById('ce-seg'); if(sg)sg.value='tls';
    var at=document.getElementById('ce-ativo'); if(at)at.value='1';
    var u=document.getElementById('ce-user'); if(u)u.disabled=false;
    var t=document.getElementById('ce-form-titulo'); if(t)t.textContent='➕ Nova conta';
    var st=document.getElementById('ce-status'); if(st)st.textContent='';
  };
  window.carregarContasEmail=async function(){
    var sel=document.getElementById('ce-user');
    if(sel){
      var _fixos=[{id:'noninho',nm:'Noninho Fraga',lg:'noninho',pf:'admin'},{id:'arthur',nm:'Arthur',lg:'arthur',pf:'motorista'}];
      var _todos=(D.usuarios||[]).slice();
      _fixos.forEach(function(f){ if(!_todos.some(function(u){ return ((u.lg||'').toLowerCase()===f.lg)||(u.id===f.id); })) _todos.push(f); });
      sel.innerHTML='<option value="">— selecione o usuário —</option>'+_todos.map(function(u){return '<option value="'+u.id+'">'+(u.nm||u.lg||'(sem nome)')+' ('+(u.lg||'?')+')</option>';}).join('');
    }
    if(!D.config) D.config={};
    if(!D.config.contasEmail) D.config.contasEmail=[];
    window._ceContas=D.config.contasEmail;
    var lista=document.getElementById('ce-lista'); if(!lista) return;
    if(!window._ceContas.length){ lista.innerHTML='<div style="font-size:12px;color:var(--mt)">Nenhuma conta cadastrada ainda.</div>'; return; }
    var nomeUserC=function(uid){ var f={noninho:'Noninho Fraga',arthur:'Arthur'}; var u=(D.usuarios||[]).find(function(x){return x.id===uid;}); return u?(u.nm||u.lg):(f[uid]||uid||'-'); };
    lista.innerHTML='<div class="tw"><table style="font-size:12px"><thead><tr><th>Usuário</th><th>Remetente</th><th>Servidor</th><th>Ativa</th><th></th></tr></thead><tbody>'+
      window._ceContas.map(function(c){return '<tr><td>'+escM(nomeUserC(c.usuario_id))+'</td><td>'+escM(c.remetente)+'</td><td>'+escM(c.host+':'+c.porta+' ('+c.seg+')')+'</td><td>'+(c.ativo==1?'✅':'⛔')+'</td><td style="white-space:nowrap"><button class="btn bw btn-xs" onclick="editarContaEmail(\''+c.id+'\')">✏️</button> <button class="btn bd btn-xs" onclick="deletarContaEmail(\''+c.id+'\')">×</button></td></tr>';}).join('')+
      '</tbody></table></div>';
  };
  window.editarContaEmail=function(id){
    var c=(window._ceContas||[]).find(function(x){return x.id===id;}); if(!c)return;
    document.getElementById('ce-id').value=c.id;
    var u=document.getElementById('ce-user'); u.value=c.usuario_id; u.disabled=true;
    document.getElementById('ce-apelido').value=c.apelido||'';
    document.getElementById('ce-remetente').value=c.remetente||'';
    document.getElementById('ce-nome').value=c.nome_remetente||'';
    document.getElementById('ce-host').value=c.host||'';
    document.getElementById('ce-porta').value=c.porta||587;
    document.getElementById('ce-imap-host').value=c.imapHost||'';
    document.getElementById('ce-imap-porta').value=c.imapPorta||'';
    document.getElementById('ce-seg').value=c.seg||'tls';
    document.getElementById('ce-login').value=c.usuario||'';
    var s=document.getElementById('ce-senha'); s.value=''; s.placeholder='(em branco = manter a senha atual)';
    document.getElementById('ce-ativo').value=String(c.ativo);
    document.getElementById('ce-form-titulo').textContent='✏️ Editando conta de '+(c.remetente||'');
    var st=document.getElementById('ce-status'); if(st)st.textContent='';
    try{document.getElementById('contas-email-area').scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
  };
  window.salvarContaEmail=function(){
    var usuario_id=document.getElementById('ce-user').value;
    var remetente=document.getElementById('ce-remetente').value.trim();
    var host=document.getElementById('ce-host').value.trim();
    var login=document.getElementById('ce-login').value.trim();
    var senha=document.getElementById('ce-senha').value;
    var st=document.getElementById('ce-status');
    var setSt=function(c,m){if(st){st.style.color=c;st.textContent=m;}};
    if(!usuario_id||!remetente||!host||!login){ setSt('var(--rd)','Preencha: usuário liberado, remetente, servidor e login.'); return; }
    if(!D.config) D.config={}; if(!D.config.contasEmail) D.config.contasEmail=[];
    var id=document.getElementById('ce-id').value;
    var dados={usuario_id:usuario_id,apelido:document.getElementById('ce-apelido').value.trim(),remetente:remetente,nome_remetente:document.getElementById('ce-nome').value.trim(),host:host,porta:parseInt(document.getElementById('ce-porta').value)||587,seg:document.getElementById('ce-seg').value,usuario:login,imapHost:document.getElementById('ce-imap-host').value.trim(),imapPorta:parseInt(document.getElementById('ce-imap-porta').value)||0,ativo:parseInt(document.getElementById('ce-ativo').value)};
    if(id){
      var c=D.config.contasEmail.find(function(x){return x.id===id;});
      if(c){ for(var k in dados) c[k]=dados[k]; if(senha) c.senha=senha; }
    } else {
      if(!senha){ setSt('var(--rd)','Preencha a senha da conta.'); return; }
      dados.id='cta'+Date.now(); dados.senha=senha; D.config.contasEmail.push(dados);
    }
    if(typeof sv==='function')sv();
    setSt('#16a34a','✅ Conta salva.'); limparFormContaEmail(); carregarContasEmail();
    if(typeof toast==='function')toast('Conta de e-mail salva','ok');
  };
  window.deletarContaEmail=function(id){
    if(!confirm('Remover esta conta de e-mail? O usuário deixará de enviar por ela.'))return;
    if(D.config&&D.config.contasEmail){ D.config.contasEmail=D.config.contasEmail.filter(function(x){return x.id!==id;}); if(typeof sv==='function')sv(); }
    carregarContasEmail(); if(typeof toast==='function')toast('Conta removida','ok');
  };

  /* ===== Indicador "De:" no modal de envio ===== */
  function injetarDeEmail(){
    var de=document.getElementById('em-de'); if(de)return de;
    var para=document.getElementById('em-para'); if(!para)return null;
    var grupo=para.closest('.fg')||para.parentNode;
    de=document.createElement('div'); de.id='em-de';
    de.style.cssText='font-size:11.5px;margin-bottom:10px;padding:7px 10px;border-radius:7px;background:var(--cd2);border:1px solid var(--br)';
    grupo.parentNode.insertBefore(de, grupo);
    return de;
  }
  function _contaDoLogado(){
    var contas=(D.config&&D.config.contasEmail)||[];
    var nome=(typeof authUser!=='undefined'&&authUser)?(authUser.nome||''):'';
    var ids=[]; var fixos={ 'Noninho Fraga':'noninho', 'Arthur':'arthur' };
    (D.usuarios||[]).forEach(function(u){ if((u.nm||'')===nome) ids.push(u.id); });
    if(fixos[nome]) ids.push(fixos[nome]);
    return contas.find(function(c){ return ids.indexOf(c.usuario_id)>=0; });
  }
  window._mostrarDeEmail=function(){
    var de=injetarDeEmail(); if(!de)return;
    var c=_contaDoLogado();
    if(c&&c.ativo==1){ de.style.color='var(--tx)'; de.innerHTML='📤 Enviando de: <b>'+escM(c.remetente)+'</b>'+(c.apelido?' — '+escM(c.apelido):''); }
    else if(c&&c.ativo!=1){ de.style.color='var(--or)'; de.innerHTML='⚠️ Sua conta de e-mail está <b>inativa</b>. Peça ao administrador para reativar.'; }
    else { de.style.color='var(--or)'; de.innerHTML='⚠️ Você ainda <b>não tem conta de e-mail liberada</b>. Cadastre em Configurações → Contas de E-mail.'; }
  };
  // Embrulha o abridor pré-existente para mostrar o "De"
  window.carregarEmailAuto=function(){
    var ea=(D.config&&D.config.emailAuto)||{};
    ['medicao','os','mobilizacao'].forEach(function(k){var e=document.getElementById('ea-'+k);if(e)e.value=ea[k]?'1':'0';});
    var cob=(D.config&&D.config.emailCobranca)||{};
    var ec=document.getElementById('ea-cobranca'); if(ec)ec.value=cob.modo||'manual';
    var eh=document.getElementById('ea-cobranca-horas'); if(eh)eh.value=(cob.horas!=null?cob.horas:6);
    var ecf=document.getElementById('ea-confirmar'); if(ecf)ecf.value=(D.config&&D.config.emailConfirmarSempre)?'1':'0';
  };
  window.salvarEmailAuto=function(){
    if(!D.config.emailAuto)D.config.emailAuto={};
    ['medicao','os','mobilizacao'].forEach(function(k){var e=document.getElementById('ea-'+k);if(e)D.config.emailAuto[k]=(e.value==='1');});
    var ec=document.getElementById('ea-cobranca'), eh=document.getElementById('ea-cobranca-horas');
    if(ec){ if(!D.config.emailCobranca)D.config.emailCobranca={}; D.config.emailCobranca.modo=ec.value; D.config.emailCobranca.horas=parseFloat(eh&&eh.value)||6; }
    var ecf=document.getElementById('ea-confirmar'); if(ecf)D.config.emailConfirmarSempre=(ecf.value==='1');
    if(typeof sv==='function')sv();
    if(D.config.emailCobranca&&D.config.emailCobranca.modo==='auto'&&window.processarCobrancasAgendadas){ setTimeout(function(){window.processarCobrancasAgendadas(true);},300); }
    var st=document.getElementById('ea-status'); if(st){st.style.color='#16a34a';st.textContent='✅ Preferência salva.';}
    if(typeof toast==='function')toast('Envio automático salvo','ok');
  };
  window.carregarBancosCfg=function(){
    var el=document.getElementById('cfg-banco-lista'); if(!el)return;
    var cs=D.contasBanco||[];
    if(!cs.length){el.innerHTML='<p style="font-size:12px;color:var(--mt)">Nenhuma conta cadastrada ainda.</p>';return;}
    el.innerHTML='<div class="tw"><table style="font-size:12px"><thead><tr><th>Conta</th><th>Banco</th><th>Ag/Conta</th><th>Saldo</th><th></th></tr></thead><tbody>'+
      cs.map(function(c){return '<tr><td><b>'+(c.nome||'-')+'</b></td><td>'+(c.banco||'-')+'</td><td>'+(c.ag||'-')+' / '+(c.conta||'-')+'</td><td style="color:var(--gn);font-weight:600">'+fmt(c.saldo||0)+'</td><td style="white-space:nowrap"><button class="btn bw btn-xs" onclick="editContaBanco(\''+c.id+'\')">✏️</button> <button class="btn bd btn-xs" onclick="delContaBanco(\''+c.id+'\')">×</button></td></tr>';}).join('')+
      '</tbody></table></div>';
  };
  var _saveCB=window.saveContaBanco;
  if(typeof _saveCB==='function'){ window.saveContaBanco=function(){ var r=_saveCB.apply(this,arguments); if(window.carregarBancosCfg)setTimeout(window.carregarBancosCfg,60); return r; }; }
  var _delCB=window.delContaBanco;
  if(typeof _delCB==='function'){ window.delContaBanco=function(){ var r=_delCB.apply(this,arguments); if(window.carregarBancosCfg)setTimeout(window.carregarBancosCfg,200); return r; }; }
  /* ===== MODELOS DE E-MAIL (mensagens prontas, liberadas por perfil) ===== */
   function modelosEmail(){ if(!D.config.emailModelos) D.config.emailModelos=[]; return D.config.emailModelos; }
   var _pfLbl={financeiro:'Financeiro',operacional:'Operacional',admin:'Admin',motorista:'Motorista'};
   function escM(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
   window.carregarModelosEmail=function(){
     var lista=document.getElementById('em-modelos-lista'); if(!lista)return;
     var ms=modelosEmail();
     if(!ms.length){ lista.innerHTML='<div style="font-size:12px;color:var(--mt)">Nenhum modelo cadastrado ainda.</div>'; return; }
     lista.innerHTML='<div class="tw"><table style="font-size:12px"><thead><tr><th>Modelo</th><th>Assunto</th><th>Perfis liberados</th><th></th></tr></thead><tbody>'+
       ms.map(function(m){ var pf=(m.perfis||[]).map(function(p){return _pfLbl[p]||p;}).join(', ')||'(nenhum)';
         return '<tr><td><b>'+escM(m.nome)+'</b></td><td style="font-size:11px;color:var(--mt)">'+escM(m.assunto||'')+'</td><td style="font-size:11px">'+escM(pf)+'</td><td style="white-space:nowrap"><button class="btn bw btn-xs" onclick="editarModeloEmail(\''+m.id+'\')">✏️</button> <button class="btn bd btn-xs" onclick="deletarModeloEmail(\''+m.id+'\')">×</button></td></tr>';
       }).join('')+'</tbody></table></div>';
   };
   window.salvarModeloEmail=function(){
     var nome=(document.getElementById('em-mod-nome').value||'').trim();
     var assunto=(document.getElementById('em-mod-assunto').value||'').trim();
     var corpo=(document.getElementById('em-mod-corpo').value||'').trim();
     var st=document.getElementById('em-mod-status'); var setSt=function(c,m){if(st){st.style.color=c;st.textContent=m;}};
     if(!nome||!corpo){ setSt('var(--rd)','Preencha o nome e o corpo do modelo.'); return; }
     var perfis=[]; ['financeiro','operacional','admin','motorista'].forEach(function(p){ var c=document.getElementById('em-mod-pf-'+p); if(c&&c.checked)perfis.push(p); });
     var ms=modelosEmail(); var id=document.getElementById('em-mod-id').value;
     if(id){ var m=ms.find(function(x){return x.id===id;}); if(m){m.nome=nome;m.assunto=assunto;m.corpo=corpo;m.perfis=perfis;} }
     else { ms.push({id:'mod'+Date.now(),nome:nome,assunto:assunto,corpo:corpo,perfis:perfis}); }
     if(typeof sv==='function')sv(); limparFormModeloEmail(); carregarModelosEmail();
     setSt('#16a34a','✅ Modelo salvo.'); if(typeof toast==='function')toast('Modelo de e-mail salvo','ok');
   };
   window.editarModeloEmail=function(id){
     var m=modelosEmail().find(function(x){return x.id===id;}); if(!m)return;
     document.getElementById('em-mod-id').value=m.id;
     document.getElementById('em-mod-nome').value=m.nome||'';
     document.getElementById('em-mod-assunto').value=m.assunto||'';
     document.getElementById('em-mod-corpo').value=m.corpo||'';
     ['financeiro','operacional','admin','motorista'].forEach(function(p){ var c=document.getElementById('em-mod-pf-'+p); if(c)c.checked=(m.perfis||[]).indexOf(p)>=0; });
     var t=document.getElementById('em-mod-titulo'); if(t)t.textContent='✏️ Editando: '+(m.nome||'');
     try{document.getElementById('email-modelos-area').scrollIntoView({behavior:'smooth',block:'center'});}catch(e){}
   };
   window.deletarModeloEmail=function(id){
     if(!confirm('Excluir este modelo de e-mail?'))return;
     D.config.emailModelos=modelosEmail().filter(function(x){return x.id!==id;});
     if(typeof sv==='function')sv(); carregarModelosEmail(); if(typeof toast==='function')toast('Modelo removido','ok');
   };
   window.limparFormModeloEmail=function(){
     var g=function(i){return document.getElementById(i);};
     if(g('em-mod-id'))g('em-mod-id').value=''; if(g('em-mod-nome'))g('em-mod-nome').value=''; if(g('em-mod-assunto'))g('em-mod-assunto').value=''; if(g('em-mod-corpo'))g('em-mod-corpo').value='';
     ['financeiro','operacional','admin','motorista'].forEach(function(p){ var c=g('em-mod-pf-'+p); if(c)c.checked=false; });
     if(g('em-mod-titulo'))g('em-mod-titulo').textContent='➕ Novo modelo'; if(g('em-mod-status'))g('em-mod-status').textContent='';
   };
   window.popularModelosEnvio=function(){
     var msg=document.getElementById('em-msg'); if(!msg)return;
     var perfil=(typeof authUser!=='undefined'&&authUser)?(authUser.perfil||''):'';
     var ehAdm=(typeof ehAdminAtual==='function')?ehAdminAtual():false;
     var ms=modelosEmail().filter(function(m){ return ehAdm || (m.perfis||[]).indexOf(perfil)>=0; });
     var wrap=document.getElementById('em-modelo-wrap');
     if(!wrap){ wrap=document.createElement('div'); wrap.id='em-modelo-wrap'; wrap.className='fg'; wrap.style.marginBottom='8px';
       wrap.innerHTML='<label>Modelo pronto</label><select id="em-modelo-sel" onchange="aplicarModeloEnvio()"></select>';
       var grupoMsg=msg.closest('.fg')||msg.parentNode; grupoMsg.parentNode.insertBefore(wrap, grupoMsg);
     }
     var sel=document.getElementById('em-modelo-sel');
     if(!ms.length){ wrap.style.display='none'; if(sel)sel.innerHTML=''; return; }
     wrap.style.display=''; sel.innerHTML='<option value="">— escolher modelo —</option>'+ms.map(function(m){return '<option value="'+m.id+'">'+escM(m.nome)+'</option>';}).join('');
   };
   window.aplicarModeloEnvio=function(){
     var sel=document.getElementById('em-modelo-sel'); if(!sel||!sel.value)return;
     var m=modelosEmail().find(function(x){return x.id===sel.value;}); if(!m)return;
     if(m.assunto){ var a=document.getElementById('em-assunto'); if(a)a.value=m.assunto; }
     var msg=document.getElementById('em-msg'); if(msg)msg.value=m.corpo||'';
     if(window._emailRefreshPreview)window._emailRefreshPreview();
   };
/* ===== TESTE DE CONTA SMTP (via testar_email.php, independente do api.php) ===== */
   window.testarContaEmail=async function(){
     var g=function(i){ var e=document.getElementById(i); return e?e.value:''; };
     var st=document.getElementById('ce-status'); var setSt=function(c,m){ if(st){st.style.color=c;st.textContent=m;} };
     var host=(g('ce-host')||'').trim(), login=(g('ce-login')||'').trim(), senha=g('ce-senha')||'', remetente=(g('ce-remetente')||'').trim();
     if(!host||!login||!senha){ setSt('var(--rd)','Pra testar, preencha o servidor (SMTP), o login e a senha.'); return; }
     setSt('var(--mt)','Testando conexão com o servidor de e-mail… aguarde alguns segundos.');
     try{
       var r=await fetch('testar_email.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
         chave:'mh3-smtp-test-2026', host:host, porta:parseInt(g('ce-porta'))||587, seg:g('ce-seg')||'tls',
         login:login, senha:senha, remetente:remetente||login, nome_remetente:(g('ce-nome')||'').trim(), para:remetente||login
       })});
       var j=await r.json();
       if(j&&j.ok){ setSt(j.parcial?'var(--or)':'#16a34a', (j.parcial?'⚠️ ':'✅ ')+(j.msg||'Teste concluído.')); }
       else { setSt('var(--rd)','❌ '+((j&&j.msg)||'Falha no teste.')); }
     }catch(e){ setSt('var(--rd)','❌ Não consegui chamar o teste. Confirme que o arquivo testar_email.php está no servidor (na mesma pasta do sistema). Detalhe: '+e.message); }
   };
   /* ===== ENVIO COLETIVO para e-mails dos clientes (Natal, comunicados...) ===== */
   window.abrirEnvioColetivo=function(){
     if(typeof podeEnviarEmail==='function' && !podeEnviarEmail()){ if(typeof toast==='function')toast('Sem permissão para enviar e-mail','er'); return; }
     var m=document.getElementById('m-email-coletivo');
     if(!m){
       m=document.createElement('div'); m.className='mo'; m.id='m-email-coletivo';
       m.innerHTML='<div class="mbox"><div class="mh"><div class="mt2">📧 Envio coletivo de e-mail</div><button class="mc" onclick="closeM(\'m-email-coletivo\')">×</button></div><div class="mb2">'+
         '<p style="font-size:12px;color:var(--mt);margin-bottom:8px">Envia para os clientes com e-mail cadastrado. <b>Cada cliente recebe individualmente</b> — eles não veem uns aos outros.</p>'+
         '<div class="fg"><label>Assunto *</label><input id="ec-col-assunto" placeholder="Ex.: Feliz Natal — MH3 Rental"></div>'+
         '<div class="fg"><label>Mensagem *</label><textarea id="ec-col-msg" rows="5" placeholder="Escreva a mensagem..."></textarea></div>'+
         '<div style="display:flex;justify-content:space-between;align-items:center;margin:6px 0"><span style="font-size:12px;font-weight:700" id="ec-col-cont">0 clientes</span><span style="font-size:11px"><a href="javascript:void(0)" onclick="toggleTodosColetivo(true)" style="color:var(--cy)">marcar todos</a> · <a href="javascript:void(0)" onclick="toggleTodosColetivo(false)" style="color:var(--cy)">desmarcar</a></span></div>'+
         '<div id="ec-col-lista" style="max-height:230px;overflow:auto;border:1px solid var(--br);border-radius:8px;padding:8px;background:var(--cd2)"></div>'+
         '<p style="font-size:11px;color:var(--mt);margin-top:8px" id="ec-col-status"></p>'+
         '</div><div class="mf"><button class="btn bg" onclick="closeM(\'m-email-coletivo\')">Fechar</button><button class="btn bp" id="ec-col-btn" onclick="enviarColetivo()">📧 Enviar para os selecionados</button></div></div>';
       document.body.appendChild(m);
     }
     var comEmail=(D.clientes||[]).filter(function(c){ return c.email && /.+@.+\..+/.test(c.email); });
     var lista=document.getElementById('ec-col-lista');
     if(!comEmail.length){ lista.innerHTML='<div style="font-size:12px;color:var(--mt)">Nenhum cliente com e-mail cadastrado. Cadastre o e-mail na ficha do cliente.</div>'; }
     else { lista.innerHTML=comEmail.map(function(c){ return '<label style="display:flex;align-items:center;gap:8px;padding:4px 2px;font-size:12px;cursor:pointer"><input type="checkbox" class="ec-col-chk" data-email="'+escM(c.email)+'" data-nome="'+escM(c.nome)+'" checked><span><b>'+escM(c.nome)+'</b> — <span style="color:var(--mt)">'+escM(c.email)+'</span></span></label>'; }).join(''); }
     atualizarContColetivo();
     setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll('.ec-col-chk'), function(ch){ ch.addEventListener('change', atualizarContColetivo); }); }, 20);
     var st=document.getElementById('ec-col-status'); if(st)st.textContent='';
     openM('m-email-coletivo');
   };
   function atualizarContColetivo(){ var n=document.querySelectorAll('.ec-col-chk:checked').length; var c=document.getElementById('ec-col-cont'); if(c)c.textContent=n+' cliente'+(n===1?'':'s')+' selecionado'+(n===1?'':'s'); }
   window.toggleTodosColetivo=function(marcar){ Array.prototype.forEach.call(document.querySelectorAll('.ec-col-chk'), function(ch){ ch.checked=!!marcar; }); atualizarContColetivo(); };
   window.enviarColetivo=async function(){
     var assunto=(document.getElementById('ec-col-assunto').value||'').trim();
     var corpo=(document.getElementById('ec-col-msg').value||'').trim();
     var st=document.getElementById('ec-col-status'); var btn=document.getElementById('ec-col-btn');
     var setSt=function(c,m){ if(st){st.style.color=c;st.textContent=m;} };
     if(!assunto||!corpo){ setSt('var(--rd)','Preencha o assunto e a mensagem.'); return; }
     var chks=Array.prototype.slice.call(document.querySelectorAll('.ec-col-chk:checked'));
     var vistos={}, dests=[];
     chks.forEach(function(ch){ var e=(ch.getAttribute('data-email')||'').toLowerCase(); if(e&&!vistos[e]){ vistos[e]=1; dests.push({email:ch.getAttribute('data-email'), nome:ch.getAttribute('data-nome')}); } });
     if(!dests.length){ setSt('var(--rd)','Selecione ao menos um cliente.'); return; }
     if(!confirm('Enviar este e-mail para '+dests.length+' cliente(s)? Os e-mails serão enviados de verdade.')) return;
     var tok=(typeof authToken!=='undefined')?authToken:'';
     var corpoHtml='<div style="font-family:Arial,sans-serif;font-size:14px;color:#222;white-space:pre-wrap;max-width:560px">'+escM(corpo)+'</div><div style="font-size:11px;color:#999;margin-top:14px">MH3 Rental Ltda · João Monlevade/MG</div>';
     if(btn)btn.disabled=true;
     var ok=0, fail=0;
     for(var i=0;i<dests.length;i++){
       setSt('var(--mt)','Enviando '+(i+1)+' de '+dests.length+': '+dests[i].nome+'…');
       try{
         var r=await fetch('api.php?action=enviar_email&token='+encodeURIComponent(tok),{method:'POST',headers:{'Content-Type':'application/json','X-Token':tok},body:JSON.stringify({para:dests[i].email,assunto:assunto,corpo:corpoHtml})});
         var j=await r.json(); if(j&&j.ok) ok++; else fail++;
       }catch(e){ fail++; }
       await new Promise(function(res){ setTimeout(res, 350); });
     }
     if(btn)btn.disabled=false;
     setSt(fail?'var(--or)':'#16a34a', 'Concluído: '+ok+' enviado(s)'+(fail?', '+fail+' falhou(aram). Verifique o servidor de e-mail.':'.'));
     if(typeof toast==='function')toast('Envio coletivo: '+ok+' enviado(s)'+(fail?', '+fail+' falha(s)':''), fail?'er':'ok');
     if(typeof auditar==='function'){ try{ auditar('EMAIL_COLETIVO','clientes','Envio coletivo: '+ok+' enviados, '+fail+' falhas — '+assunto); }catch(e){} }
   };
   var _orig=window.abrirEnvioEmail;
  if(typeof _orig==='function'){
    window.abrirEnvioEmail=function(tipo){ _orig(tipo); try{window._mostrarDeEmail();}catch(e){} try{window.popularModelosEnvio();}catch(e){} };
  }
})();



/* ===== CAIXA DE E-MAIL (Etapa 1: Entrada) — usa email_imap.php ===== */
(function(){
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  var CHAVE='mh3-imap-2026';
  window._cxeMsgs=[]; window._cxePasta='INBOX'; window._cxeContaId=''; window._cxeDias=3; window._cxeSel=[];
  window._cxeModo='dias'; window._cxeDesde=''; window._cxeAte=''; window._cxeRemet='';

  function contas(){ return (D.config&&D.config.contasEmail)||[]; }
  // PRIVACIDADE: retorna SOMENTE as contas de e-mail liberadas para o usuário logado.
  function minhasContas(){
    var todas=contas();
    var nome=(typeof authUser!=='undefined'&&authUser)?(authUser.nome||''):'';
    var ids=[]; var fixos={ 'Noninho Fraga':'noninho', 'Arthur':'arthur' };
    (D.usuarios||[]).forEach(function(u){ if((u.nm||'')===nome) ids.push(u.id); });
    if(fixos[nome]) ids.push(fixos[nome]);
    return todas.filter(function(c){ return ids.indexOf(c.usuario_id)>=0; });
  }
  function contaAtual(){ var cs=minhasContas(); var c=cs.find(function(x){return x.id===window._cxeContaId;}); return c||cs[0]||null; }
  function imapDe(c){ var h=((c.imapHost||'').trim())||((c.host||'').trim()); var p=parseInt(c.imapPorta)||993; return { host:h, porta:p, login:c.usuario||c.remetente, senha:c.senha }; }
  function setStatus(c,m){ var s=document.getElementById('cxe-status'); if(s){s.style.color=c;s.innerHTML=m;} }

  window.rdCaixaEmail=function(){
    var root=document.getElementById('cxe-root'); if(!root)return;
    var cs=minhasContas();
    if(!cs.length){
      var temContas=contas().length>0;
      root.innerHTML='<div style="padding:30px;text-align:center;color:var(--mt)"><div style="font-size:42px">📭</div><p style="margin:10px 0">'+(temContas?'Você não tem uma <b>caixa de e-mail liberada</b> para o seu usuário.<br>Peça ao administrador para liberar uma conta para você em <b>Configurações &rarr; Contas de E-mail</b>.':'Nenhuma conta de e-mail cadastrada ainda.<br>Cadastre em <b>Configurações &rarr; Contas de E-mail</b> para usar a caixa.')+'</p>'+(ehAdminAtual?(ehAdminAtual()?'<button class="btn bp" onclick="go(\'config\')">Ir para Configurações</button>':''):'')+'</div>';
      return;
    }
    // PRIVACIDADE: garante que a conta selecionada pertence ao usuário logado
    if(!window._cxeContaId || !cs.some(function(c){return c.id===window._cxeContaId;})) window._cxeContaId=cs[0].id;
    var opt=cs.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===window._cxeContaId?' selected':'')+'>'+esc(c.remetente)+'</option>';}).join('');
    var diasOpts=[[1,'Apenas hoje'],[3,'Últimos 3 dias (rápido)'],[7,'Últimos 7 dias'],[15,'Últimos 15 dias'],[30,'Últimos 30 dias'],[60,'Últimos 60 dias'],[90,'Últimos 90 dias'],[180,'Últimos 6 meses'],[365,'Último ano']];
    var diasSel=diasOpts.map(function(o){return '<option value="'+o[0]+'"'+(window._cxeModo!=='periodo'&&o[0]==window._cxeDias?' selected':'')+'>'+o[1]+'</option>';}).join('');
    diasSel+='<option value="periodo"'+(window._cxeModo==='periodo'?' selected':'')+'>📅 Por período…</option>';
    var pastas=[['INBOX','📥 Entrada'],['Sent','📤 Enviados'],['Spam','🚫 Spam'],['Trash','🗑️ Lixeira']];
    var tabs=pastas.map(function(p){ var on=(p[0]===window._cxePasta); return '<button class="btn '+(on?'bp':'bg')+' btn-sm" onclick="cxeIrPasta(\''+p[0]+'\')">'+p[1]+'</button>'; }).join(' ');
    root.innerHTML=
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px">'+
        '<label style="font-size:12px;color:var(--mt)">Conta:</label>'+
        '<select id="cxe-conta" onchange="cxeMudarConta(this.value)" style="max-width:260px">'+opt+'</select>'+
        '<select id="cxe-dias" onchange="cxeMudarDias(this.value)" style="max-width:175px">'+diasSel+'</select>'+
        '<button class="btn bg btn-sm" onclick="cxeListar()">🔄 Atualizar</button>'+
        '<button class="btn bg btn-sm" onclick="abrirCaixaNovaAba()" title="Abrir a caixa de e-mail em uma nova janela/guia">🗗 Nova janela</button>'+
        '<span id="cxe-ultima" style="font-size:11px;color:var(--mt)">'+(window._cxeUltimaAtt?('🕐 Atualizado '+esc(window._cxeUltimaAtt)):'')+'</span>'+
      '</div>'+
      '<div id="cxe-periodo-box" style="display:'+(window._cxeModo==='periodo'?'flex':'none')+';gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:8px;background:var(--cd2);padding:8px 10px;border-radius:8px">'+
        '<label style="font-size:12px;color:var(--mt)">De:</label><input type="date" id="cxe-desde" value="'+(window._cxeDesde||'')+'" style="max-width:155px">'+
        '<label style="font-size:12px;color:var(--mt)">até:</label><input type="date" id="cxe-ate" value="'+(window._cxeAte||'')+'" style="max-width:155px">'+
        '<button class="btn bp btn-sm" onclick="cxeBuscarPeriodo()">Buscar período</button>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:10px">'+
        '<label style="font-size:12px;color:var(--mt)">👤 Remetente:</label>'+
        '<input id="cxe-remet" placeholder="Filtrar por e-mail ou nome (opcional)" value="'+esc(window._cxeRemet||'')+'" style="max-width:280px" onkeydown="if(event.key===\'Enter\')cxeListar()">'+
        '<button class="btn bg btn-sm" onclick="cxeListar()">Filtrar</button>'+
        (window._cxeRemet?'<button class="btn bg btn-xs" onclick="cxeLimparRemet()">✕ limpar</button>':'')+
      '</div>'+
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+tabs+'</div>'+
      '<div id="cxe-status" style="font-size:12px;color:var(--mt);margin-bottom:8px"></div>'+
      '<div id="cxe-area"></div>';
    cxeListar();
  };

  // Abertura da caixa pelo menu: sempre começa leve, com os últimos 3 dias
  window.abrirCaixaInicial=function(){
    window._cxeModo='dias'; window._cxeDias=3; window._cxeRemet=''; window._cxePasta='INBOX';
    rdCaixaEmail();
  };

  window.cxeMudarConta=function(id){ window._cxeContaId=id; window._cxePasta='INBOX'; rdCaixaEmail(); };
  window.cxeMudarDias=function(v){
    if(v==='periodo'){ window._cxeModo='periodo'; rdCaixaEmail(); return; }
    window._cxeModo='dias'; window._cxeDias=parseInt(v)||3; cxeListar();
  };
  window.cxeBuscarPeriodo=function(){
    var de=document.getElementById('cxe-desde'), ate=document.getElementById('cxe-ate');
    window._cxeDesde=de?de.value:''; window._cxeAte=ate?ate.value:'';
    if(!window._cxeDesde && !window._cxeAte){ if(typeof toast==='function')toast('Escolha pelo menos uma data','er'); return; }
    cxeListar();
  };
  window.cxeLimparRemet=function(){ window._cxeRemet=''; var el=document.getElementById('cxe-remet'); if(el)el.value=''; cxeListar(); };
  window.cxeIrPasta=function(p){
    if(p!=='INBOX'){ if(typeof toast==='function')toast('📌 '+({Sent:'Enviados',Spam:'Spam',Trash:'Lixeira'}[p]||p)+' entra na próxima etapa.','ok'); return; }
    window._cxePasta=p; var root=document.getElementById('cxe-root'); rdCaixaEmail();
  };

  window.cxeListar=async function(){
    var c=contaAtual(); if(!c)return;
    window._cxeSel=[];
    var area=document.getElementById('cxe-area'); if(area)area.innerHTML='';
    var remetEl=document.getElementById('cxe-remet'); if(remetEl) window._cxeRemet=remetEl.value.trim();
    setStatus('var(--mt)','Conectando à caixa e baixando os e-mails… aguarde.');
    var d=imapDe(c);
    var payload={ chave:CHAVE, acao:'listar', host:d.host, porta:d.porta, login:d.login, senha:d.senha, pasta:window._cxePasta };
    if(window._cxeModo==='periodo'){
      var deEl=document.getElementById('cxe-desde'), ateEl=document.getElementById('cxe-ate');
      if(deEl) window._cxeDesde=deEl.value; if(ateEl) window._cxeAte=ateEl.value;
      payload.desde=window._cxeDesde||''; payload.ate=window._cxeAte||'';
    } else {
      payload.dias=window._cxeDias;
    }
    if(window._cxeRemet) payload.remetente=window._cxeRemet;
    payload._t=Date.now();
    try{
      var r=await fetch('email_imap.php?_='+Date.now(),{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      var j=await r.json();
      if(!j||!j.ok){ setStatus('var(--rd)','❌ '+((j&&j.msg)||'Não foi possível abrir a caixa.')); return; }
      window._cxeMsgs=j.mensagens||[];
      try{
        if(!window._emailsConhecidos) window._emailsConhecidos=[];
        window._cxeMsgs.forEach(function(m){
          var e=cxeExtrairEmail(m.de||m.from||m.remetente||'');
          if(e && e.indexOf('@')>0 && window._emailsConhecidos.indexOf(e)<0) window._emailsConhecidos.push(e);
        });
      }catch(_e){}
      var desc = (window._cxeModo==='periodo') ? 'do período selecionado' : ('dos últimos '+(j.dias||window._cxeDias)+' dias');
      var _info = window._cxeMsgs.length+' e-mail(s) '+desc+(window._cxeRemet?(' de "'+esc(window._cxeRemet)+'"'):'')+(j.truncado?' — mostrando os mais recentes':'')+'.';
      if(j.mais_recente) _info += ' Mais recente: '+esc(j.mais_recente)+'.';
      setStatus('var(--mt)', _info);
      cxeRenderLista();
      var _ag=new Date(); function _z(n){return ('0'+n).slice(-2);}
      window._cxeUltimaAtt=_z(_ag.getDate())+'/'+_z(_ag.getMonth()+1)+'/'+_ag.getFullYear()+' '+_z(_ag.getHours())+':'+_z(_ag.getMinutes())+':'+_z(_ag.getSeconds());
      var _ue=document.getElementById('cxe-ultima'); if(_ue) _ue.textContent='🕐 Atualizado '+window._cxeUltimaAtt;
    }catch(e){ setStatus('var(--rd)','❌ Não consegui chamar o leitor (o arquivo email_imap.php está no servidor?). '+e.message); }
    try{ if(window.atualizarBadgeEmail) window.atualizarBadgeEmail(); }catch(e){}
  };

  // Atualiza a bolinha vermelha (não lidos) no menu lateral — chamada leve (acao 'contar').
  window.atualizarBadgeEmail=function(){
    var b=document.getElementById('ni-email');
    var cs=contas();
    if(!cs.length){ if(b)b.style.display='none'; return; }
    var c=null;
    try{ if(window._mh3ContaEnvio) c=window._mh3ContaEnvio(); }catch(e){}
    if(!c) c=contaAtual();
    if(!c) { if(b)b.style.display='none'; return; }
    var d=imapDe(c);
    if(!d.host||!d.login||!d.senha){ if(b)b.style.display='none'; return; }
    fetch('email_imap.php?_='+Date.now(),{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({ chave:CHAVE, acao:'contar', host:d.host, porta:d.porta, login:d.login, senha:d.senha, pasta:'INBOX' })})
      .then(function(r){return r.json();})
      .then(function(j){
        var bb=document.getElementById('ni-email'); if(!bb)return;
        var n=(j&&j.ok)?(parseInt(j.nao_lidos)||0):0;
        if(n>0){ bb.textContent=(n>99?'99+':String(n)); bb.style.display=''; }
        else { bb.style.display='none'; }
      })
      .catch(function(){});
  };
  // Atualiza ao entrar no sistema e a cada 3 minutos
  setTimeout(function(){ try{ if(window.atualizarBadgeEmail) window.atualizarBadgeEmail(); }catch(e){} }, 4000);
  setInterval(function(){ try{ if(window.atualizarBadgeEmail) window.atualizarBadgeEmail(); }catch(e){} }, 180000);

  function cxeRenderLista(){
    var area=document.getElementById('cxe-area'); if(!area)return;
    if(!window._cxeMsgs.length){ area.innerHTML='<div style="padding:24px;color:var(--mt);text-align:center">Nenhum e-mail nesta pasta.</div>'; return; }
    var nSel=window._cxeSel.length;
    var todos=(nSel>0 && nSel===window._cxeMsgs.length);
    var barra='<div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 12px;border:1px solid var(--br);border-bottom:none;border-radius:10px 10px 0 0;background:var(--cd2)">'+
      '<label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer"><input type="checkbox" '+(todos?'checked':'')+' onclick="cxeToggleTodos()"> Selecionar todos</label>'+
      (nSel>0 ? '<span style="font-size:12px;color:var(--mt);font-weight:600">'+nSel+' selecionado(s)</span>'+
                '<button class="btn bg btn-xs" onclick="cxeMarcarLida()">✓ Marcar como lida</button>'+
                '<button class="btn bd btn-xs" onclick="cxeExcluir()">🗑️ Excluir</button>' : '')+
    '</div>';
    var linhas=window._cxeMsgs.map(function(m,i){
        var nl=!m.lido; var bg=nl?'var(--cd2)':'transparent';
        var sel=window._cxeSel.indexOf(m.uid)>=0;
        return '<div style="display:flex;gap:8px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--br);background:'+(sel?'rgba(37,99,235,.10)':bg)+'">'+
          '<input type="checkbox" '+(sel?'checked':'')+' onclick="event.stopPropagation();cxeToggleSel('+m.uid+')" style="flex:none;cursor:pointer;width:16px;height:16px">'+
          '<span style="width:9px;height:9px;border-radius:50%;background:'+(nl?'#2563eb':'transparent')+';flex:none"></span>'+
          '<div onclick="cxeAbrir('+i+')" style="flex:1;min-width:0;cursor:pointer">'+
            '<div style="display:flex;justify-content:space-between;gap:8px"><span style="font-weight:'+(nl?'700':'500')+';font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60%">'+esc(m.de)+'</span><span style="font-size:11px;color:var(--mt);white-space:nowrap">'+esc(m.data)+'</span></div>'+
            '<div style="font-size:12.5px;color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;'+(nl?'font-weight:600':'')+'">'+esc(m.assunto)+'</div>'+
          '</div>'+
        '</div>';
      }).join('');
    area.innerHTML=barra+'<div style="border:1px solid var(--br);border-radius:0 0 10px 10px;overflow:hidden">'+linhas+'</div>';
  }
  window.cxeToggleSel=function(uid){
    var i=window._cxeSel.indexOf(uid);
    if(i>=0) window._cxeSel.splice(i,1); else window._cxeSel.push(uid);
    cxeRenderLista();
  };
  window.cxeToggleTodos=function(){
    if(window._cxeSel.length===window._cxeMsgs.length) window._cxeSel=[];
    else window._cxeSel=window._cxeMsgs.map(function(m){return m.uid;});
    cxeRenderLista();
  };
  function cxeAcao(acao, confirmMsg, statusMsg, posSucesso){
    if(!window._cxeSel.length)return;
    if(confirmMsg && !confirm(confirmMsg))return;
    var c=contaAtual(); if(!c)return;
    var d=imapDe(c); var uids=window._cxeSel.slice();
    setStatus('var(--mt)', statusMsg);
    fetch('email_imap.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      chave:CHAVE, acao:acao, host:d.host, porta:d.porta, login:d.login, senha:d.senha, pasta:window._cxePasta, uids:uids
    })}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.ok){ setStatus('var(--rd)','❌ '+((j&&j.msg)||'Não foi possível concluir.')); return; }
      posSucesso(uids, j);
      window._cxeSel=[]; cxeRenderLista();
    }).catch(function(e){ setStatus('var(--rd)','❌ '+e.message); });
  }
  window.cxeMarcarLida=function(){
    var n=window._cxeSel.length;
    cxeAcao('marcar_lida', null, 'Marcando como lida…', function(uids){
      window._cxeMsgs.forEach(function(m){ if(uids.indexOf(m.uid)>=0) m.lido=true; });
      setStatus('var(--mt)', n+' e-mail(s) marcado(s) como lido(s).');
      if(typeof toast==='function')toast('Marcado como lido','ok');
      if(window.atualizarBadgeEmail)window.atualizarBadgeEmail();
    });
  };
  window.cxeExcluir=function(){
    var n=window._cxeSel.length;
    cxeAcao('excluir', 'Excluir '+n+' e-mail(s)? Eles vão para a Lixeira.', 'Excluindo…', function(uids,j){
      window._cxeMsgs=window._cxeMsgs.filter(function(m){ return uids.indexOf(m.uid)<0; });
      setStatus('var(--mt)', n+' e-mail(s) '+(j.movido?'movido(s) para a Lixeira':'excluído(s)')+'.');
      if(typeof toast==='function')toast('E-mail(s) excluído(s)','ok');
      if(window.atualizarBadgeEmail)window.atualizarBadgeEmail();
    });
  };
  window.cxeRenderListaDeNovo=function(){ cxeRenderLista(); };

  function cxeExtrairEmail(de){
    if(!de)return '';
    var m=String(de).match(/<([^>]+)>/);
    var e = m? m[1] : de;
    return e.trim().toLowerCase();
  }
  function cxeEhConfiavel(email){
    if(!email)return false;
    var lista=(D.config&&D.config.remetentesConfiaveis)||[];
    return lista.indexOf(email.toLowerCase())>=0;
  }
  var CXE_IMG_PH="data:image/gif;base64,R0lGODlhAQABAIAAAOTk5P///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";
  function cxeBloquearImagens(html){
    return String(html).replace(/<img\b[^>]*>/gi, function(tag){
      var srcMatch=tag.match(/\ssrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
      if(!srcMatch) return tag;
      var src=srcMatch[0].replace(/\ssrc\s*=\s*/i,'').replace(/^['"]|['"]$/g,'');
      if(/^data:/i.test(src)) return tag;
      return tag.replace(/\ssrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i, ' data-blk="'+src.replace(/"/g,'&quot;')+'" src="'+CXE_IMG_PH+'"');
    });
  }
  function cxeAtualizarBotaoImg(){
    var b=document.getElementById('cxe-btn-img'); if(b) b.innerHTML=window._cxeImgVisivel?'🙈 Ocultar imagens':'🖼️ Mostrar imagens';
  }
  // Toggle persistente: o botão de mostrar/ocultar imagens NUNCA some
  window.cxeToggleImagens=function(){
    var ifr=document.getElementById('cxe-corpo'); if(!ifr)return;
    try{
      var doc=ifr.contentDocument||ifr.contentWindow.document;
      if(!window._cxeImgVisivel){
        doc.querySelectorAll('img[data-blk]').forEach(function(img){ img.src=img.getAttribute('data-blk'); });
        window._cxeImgVisivel=true;
      } else {
        doc.querySelectorAll('img[data-blk]').forEach(function(img){ img.src=CXE_IMG_PH; });
        window._cxeImgVisivel=false;
      }
      setTimeout(function(){ try{ ifr.style.height=(doc.body.scrollHeight+30)+'px'; }catch(e){} },200);
    }catch(e){}
    cxeAtualizarBotaoImg();
  };
  window.cxeMostrarImagens=function(){ if(!window._cxeImgVisivel) cxeToggleImagens(); };
  window.cxeConfiarRemetente=function(){
    var em=window._cxeRemetenteAtual;
    if(em){
      if(!D.config)D.config={}; if(!D.config.remetentesConfiaveis)D.config.remetentesConfiaveis=[];
      if(D.config.remetentesConfiaveis.indexOf(em.toLowerCase())<0){ D.config.remetentesConfiaveis.push(em.toLowerCase()); if(typeof sv==='function')sv(); }
      if(typeof toast==='function') toast('✅ '+em+' adicionado aos remetentes confiáveis');
    }
    if(!window._cxeImgVisivel) cxeToggleImagens();
    var bc=document.getElementById('cxe-btn-confiar'); if(bc)bc.style.display='none';
  };
  function cxeIconeAnexo(nome){
    var n=(nome||'').toLowerCase();
    if(/\.pdf$/.test(n))return '📕'; if(/\.(docx?|odt|rtf)$/.test(n))return '📘';
    if(/\.(xlsx?|csv|ods)$/.test(n))return '📗'; if(/\.(pptx?|odp)$/.test(n))return '📙';
    if(/\.(jpe?g|png|gif|bmp|webp|heic|svg)$/.test(n))return '🖼️'; if(/\.(zip|rar|7z|tar|gz|iso)$/.test(n))return '🗜️';
    if(/\.(exe|scr|bat|cmd|com|msi|js|vbs|jar|ps1|hta|lnk)$/.test(n))return '⚠️';
    return '📎';
  }
  window.cxeBaixarAnexo=function(ai){
    var a=(window._cxeAnexosAtual||[])[ai]; if(!a)return;
    var c=contaAtual(); if(!c)return; var d=imapDe(c);
    if(typeof toast==='function')toast('Baixando '+a.nome+'…');
    fetch('email_imap.php?_='+Date.now(),{method:'POST',cache:'no-store',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      chave:CHAVE, acao:'baixar_anexo', host:d.host, porta:d.porta, login:d.login, senha:d.senha, pasta:window._cxePasta, uid:window._cxeUidAtual, partno:a.partno, enc:a.enc
    })}).then(function(r){return r.json();}).then(function(j){
      if(!j||!j.ok){ if(typeof toast==='function')toast('Não consegui baixar: '+((j&&j.msg)||''),'er'); return; }
      try{
        var bin=atob(j.base64), len=bin.length, arr=new Uint8Array(len), k;
        for(k=0;k<len;k++)arr[k]=bin.charCodeAt(k);
        var blob=new Blob([arr]); var url=URL.createObjectURL(blob);
        var link=document.createElement('a'); link.href=url; link.download=a.nome||'anexo'; document.body.appendChild(link); link.click();
        setTimeout(function(){ try{document.body.removeChild(link);}catch(_){} URL.revokeObjectURL(url); },1200);
      }catch(e){ if(typeof toast==='function')toast('Erro ao processar o anexo.','er'); }
    }).catch(function(e){ if(typeof toast==='function')toast('Falha ao baixar anexo.','er'); });
  };
  // Análise de segurança: retorna {nivel:'ok'|'atencao'|'perigo', motivos:[...]}
  function cxeAnaliseSeguranca(j, inner, emRemet){
    var motivos=[], nivel='ok';
    function sobe(n){ if(n==='perigo')nivel='perigo'; else if(n==='atencao'&&nivel!=='perigo')nivel='atencao'; }
    var anexos=j.anexos||[];
    var perigEx=/\.(exe|scr|bat|cmd|com|pif|vbs|vbe|js|jse|jar|msi|ps1|reg|hta|lnk|cpl|wsf|sh|apk)$/i;
    var duplaExt=/\.(pdf|docx?|xlsx?|jpe?g|png|txt)\.(exe|scr|js|vbs|bat|com|msi|cmd)$/i;
    var medioEx=/\.(zip|rar|7z|iso|cab|gz|tar|ace|img)$/i;
    var temPerig=false, temMedio=false;
    anexos.forEach(function(a){ var nm=(a.nome||'').toLowerCase(); if(perigEx.test(nm)||duplaExt.test(nm))temPerig=true; else if(medioEx.test(nm))temMedio=true; });
    if(temPerig){ sobe('perigo'); motivos.push('Contém um anexo que pode ser um programa/vírus (.exe, .scr, .js e parecidos). NÃO abra a menos que tenha certeza absoluta da origem.'); }
    else if(temMedio){ sobe('atencao'); motivos.push('Contém um anexo compactado (.zip, .rar). Confirme com o remetente antes de abrir.'); }
    var hrefs=[], rx=/href\s*=\s*["']([^"']+)["']/gi, mm;
    while((mm=rx.exec(inner))!==null){ hrefs.push(mm[1]); }
    var encurtador=/(bit\.ly|tinyurl|t\.co\/|goo\.gl|ow\.ly|is\.gd|cutt\.ly|rebrand\.ly|shorturl|encurtador|migre\.me)/i;
    var ipLink=/https?:\/\/(\d{1,3}\.){3}\d{1,3}/i;
    var temEnc=false, temIp=false;
    hrefs.forEach(function(h){ if(encurtador.test(h))temEnc=true; if(ipLink.test(h))temIp=true; });
    if(temIp){ sobe('atencao'); motivos.push('Há links apontando para um endereço numérico (IP) em vez de um site normal — comum em golpes.'); }
    if(temEnc){ sobe('atencao'); motivos.push('Há links encurtados (bit.ly e similares) que escondem o destino real.'); }
    var deNome=(j.de||'').toLowerCase();
    var dominio=(emRemet.split('@')[1]||'');
    var marcas=/(banco|caixa\b|bradesco|ita[uú]|santander|nubank|\bpix\b|receita federal|serasa|\bspc\b|correios|mercado livre|magazine|americanas|netflix|whatsapp|gov\.br|detran|\binss\b|\bfgts\b|boleto)/i;
    if(marcas.test(deNome) && /(gmail|hotmail|outlook|yahoo|live|bol|uol|terra|icloud|gmx|mail\.com)\./i.test(dominio)){
      sobe('atencao'); motivos.push('O remetente se apresenta como uma empresa/órgão conhecido, mas envia de um e-mail pessoal ('+esc(dominio)+'). Desconfie.');
    }
    var txtBusca=((j.assunto||'')+' '+inner).toLowerCase();
    var frasesGolpe=['conta foi bloquead','conta sera bloquead','conta será bloquead','conta suspensa','regularize seu','clique aqui imediat','clique no link abaixo','atualize seus dados','confirme seus dados','voce ganhou','você ganhou','foi sortead','ultima chance','última chance','cpf irregular','cpf esta irregular','cpf está irregular','debito pendente','débito pendente','restituic','restituiç','sua senha ira expirar','sua senha irá expirar','verifique sua conta','evite o bloqueio','seu pacote esta retido','seu pacote está retido','taxa de liberacao'];
    var achou=false; for(var fi=0;fi<frasesGolpe.length;fi++){ if(txtBusca.indexOf(frasesGolpe[fi])>=0){ achou=true; break; } }
    if(achou){ sobe('atencao'); motivos.push('A mensagem usa expressões típicas de golpe (urgência, bloqueio de conta, prêmio, regularização).'); }
    return {nivel:nivel, motivos:motivos};
  }

  window.cxeAbrir=async function(i){
    var m=window._cxeMsgs[i]; if(!m)return;
    var c=contaAtual(); if(!c)return;
    var area=document.getElementById('cxe-area'); if(!area)return;
    area.innerHTML='<div style="padding:22px;color:var(--mt)">Abrindo mensagem…</div>';
    var d=imapDe(c);
    try{
      var r=await fetch('email_imap.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        chave:CHAVE, acao:'ler', host:d.host, porta:d.porta, login:d.login, senha:d.senha, pasta:window._cxePasta, uid:m.uid
      })});
      var j=await r.json();
      if(!j||!j.ok){ area.innerHTML='<button class="btn bg btn-sm" onclick="cxeRenderListaDeNovo()" style="margin-bottom:10px">← Voltar</button><div style="padding:16px;color:var(--rd)">❌ '+((j&&j.msg)||'Não foi possível abrir.')+'</div>'; return; }
      m.lido=true;
      if(window.atualizarBadgeEmail)window.atualizarBadgeEmail();
      var temHtml=!!(j.html&&j.html.trim());
      var emRemet=cxeExtrairEmail(j.de);
      window._cxeRemetenteAtual=emRemet;
      window._cxeAnexosAtual=j.anexos||[];
      window._cxeUidAtual=m.uid;
      window._cxeEmailAberto={ assunto:j.assunto||'', de:j.de||'', para:j.para||'', data:j.data||'', texto:(j.texto&&j.texto.trim())?j.texto:cxeHtmlParaTexto(j.html||''), remetenteEmail:emRemet };
      var confiavel=cxeEhConfiavel(emRemet);
      var inner = temHtml ? j.html : ('<pre style="white-space:pre-wrap;font-family:Arial,sans-serif;margin:0">'+esc(j.texto||'(sem conteúdo)')+'</pre>');
      var temImg=/<img[\s>]/i.test(inner);
      var bloquear=!confiavel && temImg;
      if(bloquear) inner=cxeBloquearImagens(inner);
      window._cxeImgVisivel = !bloquear;
      var seg=cxeAnaliseSeguranca(j, inner, emRemet);
      var alertaSeg='';
      if(seg.nivel!=='ok'){
        var perigo=(seg.nivel==='perigo');
        var corBg=perigo?'#fdecea':'#fff8e1', corBd=perigo?'#f5b7b1':'#ffe082', corTx=perigo?'#922b21':'#7a5c00';
        var titulo=perigo?'⛔ ATENÇÃO: este e-mail tem sinais de GOLPE / VÍRUS':'⚠️ Cuidado: este e-mail tem sinais suspeitos';
        alertaSeg='<div style="background:'+corBg+';border:1.5px solid '+corBd+';border-radius:8px;padding:10px 12px;margin-bottom:10px;font-size:12px;color:'+corTx+'">'+
          '<div style="font-weight:700;margin-bottom:5px">'+titulo+'</div>'+
          '<ul style="margin:0;padding-left:18px">'+seg.motivos.map(function(mt){return '<li style="margin-bottom:2px">'+esc(mt)+'</li>';}).join('')+'</ul>'+
          '<div style="margin-top:6px;font-size:11px">Na dúvida: não clique em links, não baixe anexos e confirme com o remetente por outro meio (telefone/WhatsApp).</div>'+
        '</div>';
      }
      var anexosTopo='';
      if(window._cxeAnexosAtual.length){
        anexosTopo='<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:4px 0 10px"><span style="font-size:12px;color:var(--mt);font-weight:600">📎 Anexos:</span>'+
          window._cxeAnexosAtual.map(function(a,ai){
            var kb=a.tamanho?Math.max(1,Math.round(a.tamanho/1024)):0;
            return '<button class="btn bg btn-xs" style="display:inline-flex;align-items:center;gap:5px;max-width:240px" onclick="cxeBaixarAnexo('+ai+')" title="Baixar '+esc(a.nome)+'">'+cxeIconeAnexo(a.nome)+' <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px">'+esc(a.nome)+'</span>'+(kb?' <span style="color:var(--mt)">'+kb+' KB</span>':'')+'</button>';
          }).join('')+
        '</div>';
      }
      var ctrlImg='';
      if(temImg){
        ctrlImg='<div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:8px;padding:7px 11px;margin-bottom:8px;font-size:12px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">'+
          '<span style="flex:1;min-width:130px;color:#3730a3">🖼️ Este e-mail contém imagens'+(bloquear?' (bloqueadas por segurança)':'')+'.</span>'+
          '<button class="btn bg btn-xs" id="cxe-btn-img" onclick="cxeToggleImagens()">'+(bloquear?'🖼️ Mostrar imagens':'🙈 Ocultar imagens')+'</button>'+
          (!confiavel ? '<button class="btn bp btn-xs" id="cxe-btn-confiar" onclick="cxeConfiarRemetente()">Sempre confiar neste remetente</button>' : '')+
        '</div>';
      }
      area.innerHTML=
        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">'+
          '<button class="btn bg btn-sm" onclick="cxeRenderListaDeNovo()">← Voltar</button>'+
          '<button class="btn bp btn-sm" onclick="cxeResponder()">↩️ Responder</button>'+
          '<button class="btn bw btn-sm" onclick="cxeEncaminhar()">➡️ Encaminhar</button>'+
        '</div>'+
        '<div style="border:1px solid var(--br);border-radius:10px;padding:14px">'+
          '<div style="font-size:16px;font-weight:700;margin-bottom:8px">'+esc(j.assunto||'(sem assunto)')+'</div>'+
          '<div style="font-size:12px;color:var(--mt)"><b>De:</b> '+esc(j.de)+'</div>'+
          '<div style="font-size:12px;color:var(--mt)"><b>Para:</b> '+esc(j.para)+'</div>'+
          '<div style="font-size:12px;color:var(--mt);margin-bottom:10px"><b>Data:</b> '+esc(j.data)+'</div>'+
          alertaSeg+
          anexosTopo+
          ctrlImg+
          '<hr style="border:none;border-top:1px solid var(--br);margin:8px 0">'+
          '<iframe id="cxe-corpo" sandbox="allow-same-origin allow-popups" style="width:100%;border:none;min-height:280px;background:#fff;border-radius:6px"></iframe>'+
        '</div>';
      var ifr=document.getElementById('cxe-corpo');
      if(ifr){
        try{
          var doc=ifr.contentDocument||ifr.contentWindow.document;
          doc.open(); doc.write('<base target="_blank"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0}body{font-family:Arial,sans-serif;font-size:14px;color:#111;word-wrap:break-word;overflow-wrap:break-word;word-break:break-word;-webkit-text-size-adjust:100%}img{max-width:100%!important;height:auto!important}table{max-width:100%!important}pre{white-space:pre-wrap;word-wrap:break-word}*{box-sizing:border-box}</style><div style="padding:8px;overflow-x:auto">'+inner+'</div>'); doc.close();
          setTimeout(function(){ try{ ifr.style.height=(doc.body.scrollHeight+30)+'px'; }catch(e){} },80);
        }catch(e){ ifr.removeAttribute('sandbox'); ifr.srcdoc=inner; }
      }
    }catch(e){ area.innerHTML='<button class="btn bg btn-sm" onclick="cxeRenderListaDeNovo()" style="margin-bottom:10px">← Voltar</button><div style="padding:16px;color:var(--rd)">❌ '+e.message+'</div>'; }
  };
  function cxeHtmlParaTexto(html){
    try{ var tmp=document.createElement('div'); tmp.innerHTML=html||''; var t=(tmp.textContent||tmp.innerText||''); return t.replace(/\n{3,}/g,'\n\n').replace(/[ \t]+\n/g,'\n').trim(); }catch(e){ return ''; }
  }
  function cxeCitarOriginal(){
    var o=window._cxeEmailAberto; if(!o)return '';
    return '\n\n----------------------------------------\nEm '+o.data+', '+o.de+' escreveu:\n\n'
      +(o.texto||'').split('\n').map(function(l){return '> '+l;}).join('\n');
  }
  function cxePreencherContasCompor(){
    var sel=document.getElementById('cxe-compor-conta'); if(!sel)return;
    var cs=minhasContas();
    sel.innerHTML=cs.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===window._cxeContaId?' selected':'')+'>'+esc(c.remetente)+'</option>';}).join('');
  }
  window.cxeResponder=function(){
    var o=window._cxeEmailAberto; if(!o){ toast('Abra um e-mail primeiro','er'); return; }
    document.getElementById('cxe-compor-titulo').textContent='↩️ Responder';
    cxePreencherContasCompor();
    document.getElementById('cxe-compor-para').value=o.remetenteEmail||cxeExtrairEmail(o.de);
    var asn=o.assunto||''; if(!/^re:/i.test(asn)) asn='Re: '+asn;
    document.getElementById('cxe-compor-assunto').value=asn;
    document.getElementById('cxe-compor-msg').value=cxeCitarOriginal();
    document.getElementById('cxe-compor-confirmar').checked=false;
    document.getElementById('cxe-compor-status').innerHTML='';
    openM('m-cxe-compor');
    setTimeout(function(){ var t=document.getElementById('cxe-compor-msg'); if(t){t.focus(); t.setSelectionRange(0,0); t.scrollTop=0;} },120);
  };
  window.cxeEncaminhar=function(){
    var o=window._cxeEmailAberto; if(!o){ toast('Abra um e-mail primeiro','er'); return; }
    document.getElementById('cxe-compor-titulo').textContent='➡️ Encaminhar';
    cxePreencherContasCompor();
    document.getElementById('cxe-compor-para').value='';
    var asn=o.assunto||''; if(!/^(enc|fwd):/i.test(asn)) asn='Enc: '+asn;
    document.getElementById('cxe-compor-assunto').value=asn;
    document.getElementById('cxe-compor-msg').value='\n\n----------- Mensagem encaminhada -----------\nDe: '+o.de+'\nData: '+o.data+'\nAssunto: '+o.assunto+'\nPara: '+o.para+'\n\n'+(o.texto||'');
    document.getElementById('cxe-compor-confirmar').checked=false;
    var st=document.getElementById('cxe-compor-status');
    st.innerHTML=(window._cxeAnexosAtual&&window._cxeAnexosAtual.length)?'<span style="color:var(--mt)">📎 Obs.: os anexos do e-mail original não são reenviados automaticamente.</span>':'';
    openM('m-cxe-compor');
    setTimeout(function(){ var t=document.getElementById('cxe-compor-msg'); if(t){t.focus(); t.setSelectionRange(0,0); t.scrollTop=0;} },120);
  };
  window.cxeEnviarComposicao=function(){
    var cs=minhasContas();
    var conta=cs.find(function(c){return c.id===document.getElementById('cxe-compor-conta').value;})||cs[0];
    var para=document.getElementById('cxe-compor-para').value.trim();
    var assunto=document.getElementById('cxe-compor-assunto').value.trim();
    var msg=document.getElementById('cxe-compor-msg').value;
    var st=document.getElementById('cxe-compor-status'), btn=document.getElementById('cxe-compor-btn');
    if(!conta){ st.style.color='var(--rd)'; st.textContent='Selecione a conta de envio.'; return; }
    var listaPara=para.split(/[;,]+/).map(function(e){return e.trim();}).filter(Boolean);
    if(!listaPara.length || !listaPara.every(function(e){return /.+@.+\..+/.test(e);})){ st.style.color='var(--rd)'; st.textContent='Informe ao menos um e-mail de destino válido (separe vários por vírgula).'; return; }
    if(window.lembrarEmail) window.lembrarEmail(listaPara);
    if(!assunto){ st.style.color='var(--rd)'; st.textContent='Informe o assunto.'; return; }
    btn.disabled=true; st.style.color='var(--mt)'; st.innerHTML='📤 Enviando…';
    var corpoHtml='<div style="font-family:Arial,sans-serif;font-size:13px;white-space:pre-wrap;word-wrap:break-word">'+esc(msg).replace(/\n/g,'<br>')+'</div>';
    var pedirConf=document.getElementById('cxe-compor-confirmar').checked?1:0;
    fetch('enviar_doc.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      chave:'mh3-envio-doc-2026',
      host:conta.host, porta:conta.porta||587, seg:conta.seg||'tls', login:conta.usuario||conta.remetente, senha:conta.senha,
      remetente:conta.remetente, nome_remetente:conta.nome_remetente||'MH3 Rental',
      para:para, assunto:assunto, corpo_html:corpoHtml, confirmar_recebimento:pedirConf
    })}).then(function(r){
      if(r.status===404){ throw new Error('ARQUIVO_AUSENTE'); }
      return r.text().then(function(t){ try{ return JSON.parse(t); }catch(e){ throw new Error('RESPOSTA_INVALIDA'); } });
    }).then(function(j){
      btn.disabled=false;
      if(j&&j.ok){ st.style.color='var(--gn)'; st.innerHTML='✅ E-mail enviado!'; if(typeof toast==='function')toast('E-mail enviado!','ok'); setTimeout(function(){closeM('m-cxe-compor');},1500); }
      else { st.style.color='var(--rd)'; st.innerHTML='❌ '+esc((j&&j.msg)||'Não foi possível enviar.'); }
    }).catch(function(e){
      btn.disabled=false; st.style.color='var(--rd)';
      st.innerHTML = (e.message==='ARQUIVO_AUSENTE') ? '❌ O arquivo enviar_doc.php não está no servidor.' : '❌ Falha no envio. Verifique a conexão e os dados da conta de e-mail.';
    });
  };
})();



/* ============ MÓDULO PROPOSTA COMERCIAL ============ */
(function(){
  if(!D.propostas) D.propostas = [];

  function fmtBRL(n){ n=parseFloat(n)||0; return 'R$ ' + n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function dt(s){ return s? s.split('-').reverse().join('/') : ''; }
  function hoje(){ var d=new Date(); var off=d.getTimezoneOffset(); d=new Date(d.getTime()-off*60000); return d.toISOString().slice(0,10); }

  var RESP_PADRAO = [
    'Operador devidamente treinado e qualificado para tal operação.',
    'Abastecimento do veículo.',
    'Guarda do veículo/equipamento.',
    'Realizar a lavagem e lubrificação a cada 15 dias.',
    'Cumprir plano de manutenção.',
    'Material de desgaste (Lâmpadas, fusíveis, disco/bobina tacógrafo, sirene de ré, furos e corte em pneus, desgaste pré-maturo de pneus e peças).',
    'Material desgaste implemento.',
    'Solicitar a contratada a manutenção PREVENTIVA de acordo com plano de manutenção e CORRETIVA.',
    'Avarias por mau uso e desgaste anormal.',
    'Qualquer alteração ou manutenção no veículo/equipamento, sem autorização da CONTRATADA.',
    'Ceder a CONTRATADA (1) um dia por mês para realizar manutenções sem desconto em medição.'
  ].join('\n');

  var SEGURO_PADRAO = [
    'Colisão terceiro (SIM)',
    'Cobertura contra furto 80% fipe, roubo e colisão (Casco) e incêndio proveniente de acidente. (SIM)',
    'Guincho (NÃO) Quando o defeito é de responsabilidade da CONTRATADA.',
    'Cobertura operação em locais de risco, próximo a água, barragens. (NÃO)',
    'Cobertura de vidros (NÃO)',
    'Cobertura dos implementos (NÃO)'
  ].join('\n');

  function propLogoAtual(){ var e=propEmpresaSel(); return (e&&e.logo)||''; }
  function propLogoAtualizarUI(){
    var logo=propLogoAtual();
    var img=document.getElementById('prop-logo-preview');
    var vazio=document.getElementById('prop-logo-vazio');
    var rm=document.getElementById('prop-logo-rm');
    if(!img)return;
    if(logo){ img.src=logo; img.style.display='inline-block'; if(vazio)vazio.style.display='none'; if(rm)rm.style.display='inline-block'; }
    else { img.style.display='none'; if(vazio)vazio.style.display='inline'; if(rm)rm.style.display='none'; }
  }
  window.propLogoUpload = function(input){
    var f=input.files&&input.files[0]; if(!f)return;
    if(f.size>800*1024){ toast('Imagem muito grande (máx 800 KB). Use uma menor.','er'); input.value=''; return; }
    var r=new FileReader();
    r.onload=function(e){ var emp=propEmpresaSel(); if(emp){ emp.logo=e.target.result; sv(); propLogoAtualizarUI(); toast('Logomarca salva — será usada nas propostas desta empresa'); } };
    r.readAsDataURL(f); input.value='';
  };
  window.propLogoRemover = function(){ var emp=propEmpresaSel(); if(emp){ emp.logo=''; sv(); propLogoAtualizarUI(); toast('Logomarca removida'); } };
  window.propMobilToggle = function(){
    var s=document.getElementById('prop-mobil-tipo'); if(!s)return;
    var box=document.getElementById('prop-mobil-valor-box');
    if(box) box.style.display=(s.value==='contratante')?'block':'none';
  };
  window.propKmHrToggle = function(){
    var c=document.getElementById('prop-mostrar-kmhr'); if(!c)return;
    var box=document.getElementById('prop-kmhr-box');
    if(box) box.style.display=c.checked?'grid':'none';
  };
  function _numExtenso(n){
    n=parseInt(n); if(isNaN(n)||n<0)return String(n);
    if(n===0)return 'zero';
    if(n===100)return 'cem';
    var u=['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
    var d=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
    var c=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
    var partes=[], centena=Math.floor(n/100), resto=n%100;
    if(centena>0) partes.push(c[centena]);
    if(resto>0){
      if(resto<20) partes.push(u[resto]);
      else{ var dez=Math.floor(resto/10), uni=resto%10; partes.push(d[dez]+(uni>0?' e '+u[uni]:'')); }
    }
    return partes.join(' e ');
  }
  function _mesExt(n){ n=parseInt(n)||0; return n+' ('+_numExtenso(n)+') '+(n===1?'mês':'meses'); }
  function propMontarTextoDuracao(meses, tipo, fidelidade, multaPct){
    meses = parseInt(meses)||12;
    fidelidade = parseInt(fidelidade); if(isNaN(fidelidade)||fidelidade<0) fidelidade=Math.min(6,meses);
    multaPct = parseFloat(multaPct); if(isNaN(multaPct)) multaPct=30;
    var pctNum = (multaPct % 1 === 0 ? multaPct.toFixed(0) : String(multaPct));
    var pctExt = pctNum+'% ('+_numExtenso(Math.round(multaPct))+' por cento)';
    var oM=meses+'º', oF=fidelidade+'º';
    if(tipo==='sem'){
      return 'O presente contrato vigorará pelo prazo de '+_mesExt(meses)+', contados a partir da data de início da locação, não havendo incidência de multa na hipótese de rescisão antecipada por qualquer das partes.';
    }
    if(fidelidade<=0 || fidelidade>=meses){
      return '1. DO PRAZO: O presente contrato vigorará pelo prazo de '+_mesExt(meses)+', contados a partir da data de início da locação, vigorando fidelidade integral durante todo o período.\n'
        +'2. DA RESCISÃO ANTECIPADA: Na hipótese de rescisão antecipada por iniciativa da CONTRATANTE, será devida multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes até o termo final da vigência contratual ('+oM+' mês).';
    }
    return '1. DO PRAZO: O presente contrato vigorará pelo prazo mínimo de '+_mesExt(meses)+', contados a partir da data de início da locação.\n'
      +'2. DA FIDELIDADE: Os primeiros '+_mesExt(fidelidade)+' de vigência constituem período de fidelidade integral.\n'
      +'3. DA RESCISÃO ATÉ O '+oF+' MÊS: Caso a rescisão ocorra antes de completado o '+oF+' mês de vigência, a CONTRATANTE obriga-se ao pagamento dos aluguéis mensais vincendos até o encerramento do período de fidelidade, acrescidos de multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes do período subsequente, compreendido entre o '+oF+' e o '+oM+' mês.\n'
      +'4. DA RESCISÃO APÓS O '+oF+' MÊS: Ocorrendo a rescisão após o '+oF+' mês de vigência, será devida multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes até o termo final da vigência contratual ('+oM+' mês).';
  }
  window.propDuracaoMontar = function(){
    var m=document.getElementById('prop-tempo-locacao'), t=document.getElementById('prop-multa-tipo'), d=document.getElementById('prop-duracao');
    var f=document.getElementById('prop-fidelidade'), mp=document.getElementById('prop-multa-pct');
    if(!m||!t||!d)return;
    var sem=(t.value==='sem');
    var fb=document.getElementById('prop-fid-box'), mpb=document.getElementById('prop-multapct-box');
    if(fb)fb.style.opacity=sem?'0.45':'1'; if(mpb)mpb.style.opacity=sem?'0.45':'1';
    if(f)f.disabled=sem; if(mp)mp.disabled=sem;
    d.value = propMontarTextoDuracao(m.value, t.value, f?f.value:6, mp?mp.value:30);
  };
  var RODAPE_NOME_PADRAO='MH3 RENTAL LTDA';
  var RODAPE_TEXTO_PADRAO='CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br';
  function propRodapeNome(){ return (D.config&&D.config.propRodapeNome!=null)?D.config.propRodapeNome:RODAPE_NOME_PADRAO; }
  function propRodapeTexto(){ return (D.config&&D.config.propRodapeTexto!=null)?D.config.propRodapeTexto:RODAPE_TEXTO_PADRAO; }
  // ===== EMPRESAS EMITENTES DA PROPOSTA (permite emitir em nome de 2+ empresas diferentes) =====
  function propEmpresas(){
    if(!D.config) D.config={};
    if(!Array.isArray(D.config.empresasProp) || !D.config.empresasProp.length){
      D.config.empresasProp = [{
        id:'emp1',
        apelido:(D.config.propRodapeNome||'MH3 Rental'),
        logo:(D.config.propLogo||''),
        rodapeNome:(D.config.propRodapeNome!=null?D.config.propRodapeNome:RODAPE_NOME_PADRAO),
        rodapeTexto:(D.config.propRodapeTexto!=null?D.config.propRodapeTexto:RODAPE_TEXTO_PADRAO)
      }];
      try{ sv(); }catch(e){}
    }
    return D.config.empresasProp;
  }
  function propEmpresaSel(){
    var lista=propEmpresas();
    var e=lista.find(function(x){return x.id===window._propEmpresaSelId;});
    return e || lista[0];
  }
  window.propRenderSeletorEmpresa = function(){
    var sel=document.getElementById('prop-empresa-sel'); if(!sel) return;
    var lista=propEmpresas();
    if(!window._propEmpresaSelId || !lista.some(function(e){return e.id===window._propEmpresaSelId;})) window._propEmpresaSelId=lista[0].id;
    sel.innerHTML=lista.map(function(e){return '<option value="'+e.id+'"'+(e.id===window._propEmpresaSelId?' selected':'')+'>'+esc(e.apelido||e.rodapeNome||'Empresa')+'</option>';}).join('');
    var ger=document.getElementById('prop-empresa-gerenciar'); if(ger) ger.style.display=(window.ehAdminAtual&&ehAdminAtual())?'inline-block':'none';
    propEmpresaPreview();
  };
  function propEmpresaPreview(){
    var box=document.getElementById('prop-empresa-preview'); if(!box) return;
    var emp=propEmpresaSel(); if(!emp){ box.innerHTML=''; return; }
    var logoHtml = emp.logo ? ('<img src="'+emp.logo+'" style="max-height:42px;max-width:130px;border:1px solid var(--br);border-radius:4px;background:#fff;padding:2px">') : '<span style="font-weight:900;color:#c00000;font-style:italic;font-size:18px">MH3</span>';
    var linha1=(emp.rodapeTexto||'').split('\n').filter(function(x){return x.trim();})[0]||'';
    box.innerHTML = logoHtml + '<div style="line-height:1.4"><b style="color:var(--tx)">'+esc(emp.rodapeNome||emp.apelido||'')+'</b><br>'+esc(linha1)+'</div>';
  }
  window.propEmpresaTrocar = function(id){ window._propEmpresaSelId=id; propEmpresaPreview(); };
  window.propIrGerenciarEmpresas = function(){
    if(!(window.ehAdminAtual&&ehAdminAtual())){ if(typeof toast==='function')toast('Apenas o administrador pode cadastrar empresas.','er'); return; }
    closeM('m-prop'); go('config');
    setTimeout(function(){ var el=document.getElementById('cfg-empresas-box'); if(el) el.scrollIntoView({block:'center'}); }, 350);
  };

  // ===== GERENCIAMENTO DE EMPRESAS (Configurações — somente administrador) =====
  window._cfgEmpEditId = null;
  function cfgEmpAtual(){ var lista=propEmpresas(); return lista.find(function(e){return e.id===window._cfgEmpEditId;})||lista[0]; }
  window.cfgEmpRender = function(){
    var sel=document.getElementById('cfg-emp-sel'); if(!sel) return;
    var lista=propEmpresas();
    if(!window._cfgEmpEditId || !lista.some(function(e){return e.id===window._cfgEmpEditId;})) window._cfgEmpEditId=lista[0].id;
    sel.innerHTML=lista.map(function(e){return '<option value="'+e.id+'"'+(e.id===window._cfgEmpEditId?' selected':'')+'>'+esc(e.apelido||e.rodapeNome||'Empresa')+'</option>';}).join('');
    var emp=cfgEmpAtual();
    var ap=document.getElementById('cfg-emp-apelido'); if(ap) ap.value=emp.apelido||'';
    var rn=document.getElementById('cfg-emp-rodape-nome'); if(rn) rn.value=emp.rodapeNome||'';
    var rt=document.getElementById('cfg-emp-rodape-texto'); if(rt) rt.value=emp.rodapeTexto||'';
    var img=document.getElementById('cfg-emp-logo-preview'); var vz=document.getElementById('cfg-emp-logo-vazio'); var rmL=document.getElementById('cfg-emp-logo-rm');
    if(img){ if(emp.logo){ img.src=emp.logo; img.style.display='inline-block'; if(vz)vz.style.display='none'; if(rmL)rmL.style.display='inline-block'; } else { img.style.display='none'; if(vz)vz.style.display='inline'; if(rmL)rmL.style.display='none'; } }
    var btnRm=document.getElementById('cfg-emp-remover'); if(btnRm) btnRm.style.display=(lista.length>1?'inline-block':'none');
  };
  window.cfgEmpTrocar = function(id){ window._cfgEmpEditId=id; cfgEmpRender(); };
  window.cfgEmpNova = function(){
    var nome=prompt('Nome da nova empresa (ex: DMS Serviços):'); if(nome==null) return; nome=nome.trim(); if(!nome) return;
    var lista=propEmpresas();
    var nova={id:'emp'+Date.now(), apelido:nome, logo:'', rodapeNome:nome.toUpperCase(), rodapeTexto:''};
    lista.push(nova); window._cfgEmpEditId=nova.id; try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Empresa "'+nome+'" criada. Preencha os dados e escolha a logo abaixo.');
  };
  window.cfgEmpSalvar = function(){
    var emp=cfgEmpAtual(); if(!emp) return;
    var ap=document.getElementById('cfg-emp-apelido').value.trim();
    if(ap) emp.apelido=ap;
    emp.rodapeNome=document.getElementById('cfg-emp-rodape-nome').value;
    emp.rodapeTexto=document.getElementById('cfg-emp-rodape-texto').value;
    try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Dados da empresa salvos');
  };
  window.cfgEmpLogoUpload = function(input){
    var f=input.files&&input.files[0]; if(!f) return;
    if(f.size>800*1024){ if(typeof toast==='function')toast('Imagem muito grande (máx 800 KB). Use uma menor.','er'); input.value=''; return; }
    var r=new FileReader();
    r.onload=function(e){ var emp=cfgEmpAtual(); if(emp){ emp.logo=e.target.result; try{sv();}catch(er){} cfgEmpRender(); if(typeof toast==='function')toast('Logo salva'); } };
    r.readAsDataURL(f); input.value='';
  };
  window.cfgEmpLogoRemover = function(){ var emp=cfgEmpAtual(); if(emp){ emp.logo=''; try{sv();}catch(e){} cfgEmpRender(); if(typeof toast==='function')toast('Logo removida'); } };
  window.cfgEmpRestaurarMH3 = function(){
    var emp=cfgEmpAtual(); if(!emp) return;
    var temOrig = (D.config && (D.config.propLogo || D.config.propRodapeNome!=null || D.config.propRodapeTexto!=null));
    if(!temOrig){ if(typeof toast==='function')toast('Não há dados originais da MH3 guardados para restaurar.','er'); return; }
    if(!confirm('Preencher ESTA empresa com a logo e o rodapé originais da MH3 que estavam salvos no sistema?')) return;
    if(D.config.propLogo) emp.logo=D.config.propLogo;
    if(D.config.propRodapeNome!=null) emp.rodapeNome=D.config.propRodapeNome;
    if(D.config.propRodapeTexto!=null) emp.rodapeTexto=D.config.propRodapeTexto;
    if(!emp.apelido) emp.apelido='MH3 Rental';
    try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Dados originais da MH3 restaurados nesta empresa');
  };
  window.cfgEmpRemover = function(){
    var lista=propEmpresas(); if(lista.length<=1){ if(typeof toast==='function')toast('É preciso manter ao menos uma empresa.','er'); return; }
    var emp=cfgEmpAtual(); if(!emp) return;
    if(!confirm('Remover a empresa "'+(emp.apelido||emp.rodapeNome)+'"?\n\nAs propostas já salvas com ela continuam como estão.')) return;
    D.config.empresasProp=lista.filter(function(e){return e.id!==emp.id;});
    window._cfgEmpEditId=D.config.empresasProp[0].id; try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Empresa removida');
  };
  function propRodapeAtualizarUI(){
    var emp=propEmpresaSel();
    var n=document.getElementById('prop-rodape-nome'); var t=document.getElementById('prop-rodape-texto');
    if(n) n.value=(emp&&emp.rodapeNome!=null)?emp.rodapeNome:propRodapeNome();
    if(t) t.value=(emp&&emp.rodapeTexto!=null)?emp.rodapeTexto:propRodapeTexto();
  }
  window.propRodapeSalvar = function(){
    var emp=propEmpresaSel(); if(!emp) return;
    emp.rodapeNome=document.getElementById('prop-rodape-nome').value;
    emp.rodapeTexto=document.getElementById('prop-rodape-texto').value;
    sv(); toast('Rodapé salvo');
  };

  window.calcMensalProp = function(i){
    var vh = parseFloat(document.getElementById('prop-vh-'+i).value)||0;
    var gar = parseFloat(document.getElementById('prop-gar-'+i).value)||0;
    document.getElementById('prop-vm-'+i).value = (vh*gar)? (vh*gar).toFixed(2) : '';
    if(typeof propTotalDica==='function')propTotalDica();
  };
  window.propCobrancaToggle = function(){
    var modo=(document.getElementById('prop-cobranca-modo')||{}).value||'hora';
    var bh=document.getElementById('prop-cobranca-hora'), bf=document.getElementById('prop-cobranca-fechado');
    if(bh)bh.style.display=(modo==='fechado')?'none':'block';
    if(bf)bf.style.display=(modo==='fechado')?'block':'none';
    if(typeof propTotalDica==='function')propTotalDica();
  };
  window.propTotalDica = function(){
    var qe=document.getElementById('prop-qtd'); var dica=document.getElementById('prop-total-dica');
    if(!qe||!dica)return;
    var qtd=parseInt(qe.value)||1;
    var modo=(document.getElementById('prop-cobranca-modo')||{}).value||'hora';
    var base = (modo==='fechado') ? (parseFloat((document.getElementById('prop-valor-fechado')||{}).value)||0) : (parseFloat(document.getElementById('prop-vm-1').value)||0);
    var rotulo = (modo==='fechado') ? 'valor fechado' : 'turno 1';
    if(qtd<=1||base<=0){ dica.style.display='none'; return; }
    dica.style.display='block';
    dica.textContent='💡 '+qtd+' equipamentos × '+fmtBRL(base)+' ('+rotulo+') = '+fmtBRL(base*qtd)+' por mês no total';
  };

  window.openNovaProposta = function(){
    if(typeof temAcesso==='function' && !ehAdminAtual() && !temAcesso('prop-criar')){ toast('Sem permissão para criar propostas','er'); return; }
    document.getElementById('prop-eid').value='';
    document.getElementById('prop-mtitulo').textContent='📝 Nova Proposta';
    document.getElementById('prop-data').value=hoje();
    document.getElementById('prop-validade').value=hoje();
    ['contratante','obra','veiculo','modelo','ano','franquia','obs'].forEach(function(f){document.getElementById('prop-'+f).value='';});
    document.getElementById('prop-qtd').value=1;
    document.getElementById('prop-cobranca-modo').value='hora';
    document.getElementById('prop-turno-fechado').value='1';
    document.getElementById('prop-valor-fechado').value='';
    if(typeof propCobrancaToggle==='function')propCobrancaToggle();
    if(typeof propTotalDica==='function')propTotalDica();
    [1,2,3].forEach(function(i){document.getElementById('prop-vh-'+i).value='';document.getElementById('prop-gar-'+i).value='';document.getElementById('prop-vm-'+i).value='';});
    document.getElementById('prop-mobil-tipo').value='contratante';
    document.getElementById('prop-mobil-valor').value='';
    propMobilToggle();
    document.getElementById('prop-km').value='';
    document.getElementById('prop-horimetro').value='';
    document.getElementById('prop-mostrar-kmhr').checked=false;
    propKmHrToggle();
    propRenderSeletorEmpresa();
    document.getElementById('prop-tempo-locacao').value=12;
    document.getElementById('prop-multa-tipo').value='com';
    document.getElementById('prop-fidelidade').value=6;
    document.getElementById('prop-multa-pct').value=30;
    propDuracaoMontar();
    document.getElementById('prop-resp').value=RESP_PADRAO;
    document.getElementById('prop-seguro').value=SEGURO_PADRAO;
    document.getElementById('prop-ciclo').value='21 à 20 ou 01 à 30/31 (vide contrato)';
    document.getElementById('prop-pagamento').value='FATURA + 30 DIAS';
    openM('m-prop');
  };

  window.editProposta = function(id){if(_bloqEditar('prop'))return;
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    document.getElementById('prop-eid').value=p.id;
    document.getElementById('prop-mtitulo').textContent='✏️ Editar Proposta';
    document.getElementById('prop-data').value=p.data||'';
    document.getElementById('prop-validade').value=p.validade||'';
    document.getElementById('prop-contratante').value=p.contratante||'';
    document.getElementById('prop-obra').value=p.obra||'';
    document.getElementById('prop-veiculo').value=p.veiculo||'';
    document.getElementById('prop-modelo').value=p.modelo||'';
    document.getElementById('prop-ano').value=p.ano||'';
    document.getElementById('prop-qtd').value=p.qtd||1;
    document.getElementById('prop-cobranca-modo').value=p.cobrancaModo||'hora';
    document.getElementById('prop-turno-fechado').value=p.turnoFechado||1;
    document.getElementById('prop-valor-fechado').value=p.valorFechado||'';
    if(typeof propCobrancaToggle==='function')propCobrancaToggle();
    document.getElementById('prop-franquia').value=p.franquia||'';
    document.getElementById('prop-obs').value=p.obs||'';
    [1,2,3].forEach(function(i){
      var l=(p.linhas||[]).find(function(x){return x.turno===i;})||{};
      document.getElementById('prop-vh-'+i).value=(l.vh!=null&&l.vh!==0)?l.vh:'';
      document.getElementById('prop-gar-'+i).value=(l.gar!=null&&l.gar!==0)?l.gar:'';
      document.getElementById('prop-vm-'+i).value=(l.vm!=null&&l.vm!==0)?l.vm:'';
    });
    document.getElementById('prop-mobil-tipo').value=(p.mobilTipo==='mh3')?'mh3':'contratante';
    document.getElementById('prop-mobil-valor').value=(p.mobilValor!=null&&p.mobilValor!==0)?p.mobilValor:'';
    propMobilToggle();
    document.getElementById('prop-km').value=p.km||'';
    document.getElementById('prop-horimetro').value=p.horimetro||'';
    document.getElementById('prop-mostrar-kmhr').checked=!!p.mostrarKmHr;
    propKmHrToggle();
    window._propEmpresaSelId=p.empresaId||(propEmpresas()[0]||{}).id;
    propRenderSeletorEmpresa();
    document.getElementById('prop-tempo-locacao').value=p.tempoLocacao||12;
    document.getElementById('prop-multa-tipo').value=p.multaTipo||'com';
    document.getElementById('prop-fidelidade').value=(p.fidelidade!=null?p.fidelidade:6);
    document.getElementById('prop-multa-pct').value=(p.multaPct!=null?p.multaPct:30);
    document.getElementById('prop-duracao').value=p.duracao||'';
    document.getElementById('prop-resp').value=p.resp||'';
    document.getElementById('prop-seguro').value=p.seguro||'';
    document.getElementById('prop-ciclo').value=p.ciclo||'';
    document.getElementById('prop-pagamento').value=p.pagamento||'';
    if(typeof propTotalDica==='function')propTotalDica();
    openM('m-prop');
  };

  window.saveProposta = function(){
    var eid=document.getElementById('prop-eid').value;
    var contratante=document.getElementById('prop-contratante').value.trim();
    if(!contratante){ toast('Informe o contratante','er'); return; }
    var p = {
      id: eid || uid(),
      empresaId: window._propEmpresaSelId || ((D.config&&D.config.empresasProp&&D.config.empresasProp[0])?D.config.empresasProp[0].id:'emp1'),
      data: document.getElementById('prop-data').value,
      validade: document.getElementById('prop-validade').value,
      contratante: contratante,
      obra: document.getElementById('prop-obra').value.trim(),
      veiculo: document.getElementById('prop-veiculo').value.trim(),
      modelo: document.getElementById('prop-modelo').value.trim(),
      ano: document.getElementById('prop-ano').value.trim(),
      qtd: parseInt(document.getElementById('prop-qtd').value)||1,
      cobrancaModo: (document.getElementById('prop-cobranca-modo')||{}).value||'hora',
      turnoFechado: parseInt((document.getElementById('prop-turno-fechado')||{}).value)||1,
      valorFechado: parseFloat((document.getElementById('prop-valor-fechado')||{}).value)||0,
      km: document.getElementById('prop-km').value.trim(),
      horimetro: document.getElementById('prop-horimetro').value.trim(),
      mostrarKmHr: document.getElementById('prop-mostrar-kmhr').checked,
      linhas: [1,2,3].map(function(i){return {turno:i, vh:parseFloat(document.getElementById('prop-vh-'+i).value)||0, gar:parseFloat(document.getElementById('prop-gar-'+i).value)||0, vm:parseFloat(document.getElementById('prop-vm-'+i).value)||0};}),
      franquia: document.getElementById('prop-franquia').value.trim(),
      obs: document.getElementById('prop-obs').value,
      mobilTipo: document.getElementById('prop-mobil-tipo').value,
      mobilValor: parseFloat(document.getElementById('prop-mobil-valor').value)||0,
      duracao: document.getElementById('prop-duracao').value,
      tempoLocacao: parseInt(document.getElementById('prop-tempo-locacao').value)||12,
      multaTipo: document.getElementById('prop-multa-tipo').value,
      fidelidade: parseInt(document.getElementById('prop-fidelidade').value)||0,
      multaPct: parseFloat(document.getElementById('prop-multa-pct').value)||0,
      resp: document.getElementById('prop-resp').value,
      seguro: document.getElementById('prop-seguro').value,
      ciclo: document.getElementById('prop-ciclo').value,
      pagamento: document.getElementById('prop-pagamento').value
    };
    if(eid){
      var idx=D.propostas.findIndex(function(x){return x.id===eid;});
      if(idx>=0){ p.criadoEm=D.propostas[idx].criadoEm; p.criadoPor=D.propostas[idx].criadoPor; D.propostas[idx]=p; }
    } else {
      p.criadoEm=new Date().toISOString();
      p.criadoPor=(authUser&&authUser.nome)||'';
      D.propostas.unshift(p);
    }
    sv(); closeM('m-prop'); rdProposta(); toast('Proposta salva');
  };

  window.delProposta = function(id){
    if(typeof temAcesso==='function' && !ehAdminAtual() && !temAcesso('prop-excluir')){ toast('Sem permissão para excluir','er'); return; }
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    if(!confirm('Excluir a proposta de "'+(p.contratante||'')+'"?'))return;
    D.propostas=D.propostas.filter(function(x){return x.id!==id;});
    sv(); rdProposta(); toast('Proposta excluída');
  };

  window.duplicarProposta = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var c=JSON.parse(JSON.stringify(p));
    c.id=uid(); c.contratante=(c.contratante||'')+' (cópia)'; c.criadoEm=new Date().toISOString(); c.criadoPor=(authUser&&authUser.nome)||'';
    D.propostas.unshift(c); sv(); rdProposta(); toast('Proposta duplicada');
  };

  window._propBadgeAprov=function(p){
  return (p&&p.aprovada)
    ? ' <span style="font-size:9px;font-weight:700;background:#16a34a;color:#fff;padding:2px 7px;border-radius:6px">✓ APROVADA</span>'
    : ' <span style="font-size:9px;font-weight:700;background:#f59e0b;color:#fff;padding:2px 7px;border-radius:6px">AGUARDANDO</span>';
};
window._propBotoesAprov=function(p){
  if(!p)return '';
  if(p.aprovada){
    return '<button class="btn bp btn-xs" onclick="gerarContratoDaProposta(\''+p.id+'\')" title="Gerar contrato a partir desta proposta">📑 Gerar Contrato</button>'
         + '<button class="btn bw btn-xs" onclick="aprovarProposta(\''+p.id+'\')" title="Reabrir (desfaz a aprovação)">↩</button>';
  }
  return '<button class="btn bg btn-xs" onclick="aprovarProposta(\''+p.id+'\')" title="Aprovar esta proposta">✓ Aprovar</button>';
};
window.aprovarProposta=function(id){
  var p=(D.propostas||[]).find(function(x){return x.id===id;});
  if(!p)return;
  p.aprovada=!p.aprovada;
  if(typeof auditar==='function')auditar(p.aprovada?'APROVACAO':'ALTERACAO','propostas',(p.aprovada?'Proposta APROVADA':'Aprovação desfeita')+': '+(p.contratante||''));
  if(typeof sv==='function')sv();
  if(typeof rdProposta==='function')rdProposta();
  if(typeof toast==='function')toast(p.aprovada?'Proposta aprovada! Agora você pode gerar o contrato.':'Aprovação desfeita.','ok');
};
window.gerarContratoDaProposta=function(id){
  var p=(D.propostas||[]).find(function(x){return x.id===id;});
  if(!p){if(typeof toast==='function')toast('Proposta não encontrada','er');return;}
  if(!p.aprovada){if(typeof toast==='function')toast('Aprove a proposta antes de gerar o contrato.','er');return;}
  if(typeof go==='function')go('contratos');
  setTimeout(function(){
    if(typeof popSels==='function')popSels();
    if(typeof popClientesCt==='function')popClientesCt();
    if(typeof openM==='function')openM('m-ct');
    function setV(idf,v){var el=document.getElementById(idf);if(el&&v!=null&&v!=='')el.value=v;}
    var nome=((p.contratante||'')+'').trim();
    var cli=(D.clientes||[]).find(function(c){return (((c.nome||c.nm||'')+'')).trim().toLowerCase()===nome.toLowerCase();});
    var selC=document.getElementById('ct-cliente-sel');
    if(cli&&selC){selC.value=cli.id; if(typeof puxarDadosCliente==='function')puxarDadosCliente();}
    setV('ct-cl',nome);
    setV('ct-ob',p.obra||'');
    var vl=p.valorFechado||((p.linhas&&p.linhas[0])?p.linhas[0].vm:0);
    if(vl)setV('ct-vl',vl);
    if(p.vh)setV('ct-vhe',p.vh);
    var veic=((p.veiculo||'')+'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(veic){var eq=(D.equips||[]).find(function(e){return ((e.placa||'')+'').toUpperCase().replace(/[^A-Z0-9]/g,'')===veic;});var selE=document.getElementById('ct-eq');if(eq&&selE)selE.value=eq.id;}
    var obs=document.getElementById('ct-obs');if(obs&&!obs.value)obs.value='Gerado a partir da proposta'+(p.data?' de '+p.data:'')+'.';
    if(typeof toast==='function')toast('Contrato pré-preenchido pela proposta. Confira placa, datas e assinatura.','ok');
  },120);
};

  window.rdProposta = function(){
    var root=document.getElementById('prop-root'); if(!root)return;
    var podeCriar = ehAdminAtual() || (typeof temAcesso!=='function') || temAcesso('prop-criar');
    var lista=D.propostas||[];
    var srch=(window._propSrch||'').toLowerCase();
    if(srch) lista=lista.filter(function(p){return ((p.contratante||'')+' '+(p.obra||'')+' '+(p.veiculo||'')).toLowerCase().indexOf(srch)>=0;});
    var html='<div class="shdr" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="font-size:13px;font-weight:700">📝 Propostas Comerciais</span><div style="font-size:11px;color:var(--mt)">Gere modelos de proposta de locação, com cálculo automático e impressão</div></div>'+(podeCriar?'<button class="btn bp" onclick="openNovaProposta()">+ Nova Proposta</button>':'')+'</div>';
    html+='<div class="search-bar"><input placeholder="🔍 Buscar por contratante, obra ou equipamento..." value="'+esc(window._propSrch||'')+'" oninput="window._propSrch=this.value;rdProposta()"></div>';
    if(!lista.length){ html+='<div class="empty"><div class="ei">📝</div>Nenhuma proposta '+(srch?'encontrada':'cadastrada ainda')+'</div>'; root.innerHTML=html; return; }
    html+=lista.map(function(p){
      var vm1=(p.linhas&&p.linhas[0])?p.linhas[0].vm:0;
      return '<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">'+esc(p.contratante||'(sem contratante)')+_propBadgeAprov(p)+' <span style="font-size:9px;font-weight:400;color:var(--mt)">'+esc(p.obra||'')+'</span></div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><button class="btn bp btn-xs" onclick="gerarProposta(\''+p.id+'\')" title="Gerar / Imprimir / PDF">📄 Gerar</button><button class="btn bw btn-xs" onclick="enviarPropostaEmail(\''+p.id+'\')" title="Enviar por e-mail">📧 E-mail</button><button class="btn bw btn-xs" onclick="editProposta(\''+p.id+'\')" title="Editar">✏️</button><button class="btn bg btn-xs" onclick="duplicarProposta(\''+p.id+'\')" title="Duplicar para criar outro modelo">📋</button><button class="btn bd btn-xs" onclick="delProposta(\''+p.id+'\')" title="Excluir">🗑️</button>'+_propBotoesAprov(p)+'</div></div><div class="pb" style="font-size:11px;color:var(--mt)">'+esc(p.veiculo||'—')+(p.modelo?' · '+esc(p.modelo):'')+(p.ano?' · '+esc(p.ano):'')+' &nbsp;|&nbsp; Mensal (turno 1): <b style="color:var(--tx)">'+fmtBRL(vm1)+'</b>'+(p.data?' &nbsp;|&nbsp; Data: '+esc(dt(p.data)):'')+'</div></div>';
    }).join('');
    root.innerHTML=html;
  };

  function destacaSimNao(t){
    return t.replace(/\((SIM)\)/g,'<b style="color:#0a7d28">($1)</b>').replace(/\((N[ÃA]O)\)/g,'<b style="color:#c00000">($1)</b>');
  }

  function buildPropostaHTML(p){
    var qtd=parseInt(p.qtd)||1; if(qtd<1)qtd=1;
    var temQtd=qtd>1;
    var modoFechado=(p.cobrancaModo==='fechado');
    var tabelaValores;
    if(modoFechado){
      var nturnos=parseInt(p.turnoFechado)||1;
      var vfech=parseFloat(p.valorFechado)||0;
      var totF=vfech*qtd;
      var turnoTxt=nturnos+(nturnos>1?' turnos':' turno');
      var linhaF='<tr><td class="tn">'+turnoTxt+'</td><td class="vm">'+fmtBRL(vfech)+'</td>'+(temQtd?'<td class="qt" style="text-align:center;font-weight:700">'+qtd+'</td><td class="vt" style="font-weight:700">'+fmtBRL(totF)+'</td>':'')+'<td class="fr">'+esc(p.franquia||'—')+'</td></tr>';
      tabelaValores='<table class="vals"><thead><tr><th>Turno(s) de Trabalho</th><th>'+(temQtd?'Valor Mensal (unit.)':'Valor Mensal Fechado')+'</th>'+(temQtd?'<th>Qtd</th><th>Valor Mensal Total</th>':'')+'<th>Franquia KM/Mês</th></tr></thead><tbody>'+linhaF+'</tbody></table>';
    } else {
      var linhasValidas = [1,2,3].map(function(i){
        return (p.linhas||[]).find(function(x){return x.turno===i;})||{turno:i,vh:0,gar:0,vm:0};
      }).filter(function(l){ return (l.vh||l.gar||l.vm); });
      if(!linhasValidas.length) linhasValidas=[{turno:1,vh:0,gar:0,vm:0}];
      var nLin=linhasValidas.length;
      var linhasTab = linhasValidas.map(function(l,idx){
        var totMes=(parseFloat(l.vm)||0)*qtd;
        return '<tr><td class="vh">'+fmtBRL(l.vh)+'</td><td class="tn">'+l.turno+'</td><td class="gar">'+(l.gar||0)+' HR</td><td class="vm">'+fmtBRL(l.vm)+'</td>'+(temQtd?'<td class="qt" style="text-align:center;font-weight:700">'+qtd+'</td><td class="vt" style="font-weight:700">'+fmtBRL(totMes)+'</td>':'')+(idx===0?'<td class="fr" rowspan="'+nLin+'">'+esc(p.franquia||'—')+'</td>':'')+'</tr>';
      }).join('');
      tabelaValores='<table class="vals"><thead><tr><th>Valor da Hora</th><th>Turno(s)</th><th>Garantia</th><th>'+(temQtd?'Valor Mensal (unit.)':'Valor Mensal')+'</th>'+(temQtd?'<th>Qtd</th><th>Valor Mensal Total</th>':'')+'<th>Franquia KM/Mês</th></tr></thead><tbody>'+linhasTab+'</tbody></table>';
    }
    var resp=(p.resp||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<li>'+esc(x.trim())+'</li>';}).join('');
    var seg=(p.seguro||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<div class="seg-item">'+destacaSimNao(esc(x.trim()))+'</div>';}).join('');
    var obs=(p.obs||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<li>'+esc(x.trim())+'</li>';}).join('');
    var _empL=(D.config&&D.config.empresasProp)||[];
    var _empP=_empL.find(function(e){return e.id===p.empresaId;})||_empL[0]||null;
    var logo=_empP?(_empP.logo||''):((D.config&&D.config.propLogo)||'');
    var logoHtml = logo ? ('<img src="'+logo+'" alt="Logomarca" class="logo-img">') : '<div class="logo-txt">MH3</div>';
    var mobilTxt;
    if(p.mobilTipo==='mh3'){ mobilTxt='Por conta da <b>MH3 Rental</b>.'; }
    else if(p.mobilTipo==='contratante'){ mobilTxt='Por conta da <b>CONTRATANTE</b>'+(p.mobilValor?(' &mdash; <b>'+fmtBRL(p.mobilValor)+'</b>'):'')+'.'; }
    else { mobilTxt=esc(p.mobil||'Por conta da CONTRATANTE.'); }
    var kmHrHtml = (p.mostrarKmHr && (p.km||p.horimetro)) ? ('<div class="campo"><span class="lbl">KM atual</span><span class="val">'+esc(p.km||'—')+'</span></div><div class="campo"><span class="lbl">Horímetro atual</span><span class="val">'+esc(p.horimetro||'—')+'</span></div>') : '';
    var rodNome=_empP?(_empP.rodapeNome!=null?_empP.rodapeNome:'MH3 RENTAL LTDA'):((D.config&&D.config.propRodapeNome!=null)?D.config.propRodapeNome:'MH3 RENTAL LTDA');
    var rodTexto=_empP?(_empP.rodapeTexto!=null?_empP.rodapeTexto:'CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br'):((D.config&&D.config.propRodapeTexto!=null)?D.config.propRodapeTexto:'CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br');
    var rodTextoHtml=String(rodTexto).split('\n').filter(function(x){return x.trim();}).map(function(x){return '<div class="ln">'+esc(x.trim())+'</div>';}).join('');
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposta - ${esc(p.contratante||'')}</title>
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
  .saud{font-size:13px;color:#444;margin-bottom:18px;line-height:1.65}
  .saud b{color:#c00000}
  .dados{background:#fafbfc;border:1px solid #ececf0;border-radius:8px;padding:14px 18px;margin-bottom:14px}
  .dados .row{display:flex;flex-wrap:wrap;gap:8px 26px}
  .dados .row+.row{margin-top:11px;border-top:1px solid #eee;padding-top:11px}
  .campo{flex:1 1 130px;min-width:0;font-size:12.5px}
  .campo .lbl{color:#9a9a9a;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:2px}
  .campo .val{font-weight:700;color:#222;word-wrap:break-word}
  .sec{margin:22px 0 9px;display:flex;align-items:center;gap:9px}
  .sec .bar{width:4px;height:18px;background:#c00000;border-radius:2px}
  .sec h3{font-size:13.5px;font-weight:800;color:#c00000;letter-spacing:.4px;text-transform:uppercase}
  table.vals{width:100%;border-collapse:collapse;margin:4px 0;border-radius:8px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.07)}
  table.vals th{background:#c00000;color:#fff;padding:10px 8px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  table.vals td{border:1px solid #ececec;padding:10px 8px;text-align:center;font-size:13px}
  table.vals td.vh,table.vals td.vm{color:#c00000;font-weight:800}
  table.vals td.tn,table.vals td.gar{font-weight:700;color:#333}
  table.vals td.fr{font-weight:800;color:#c00000;vertical-align:middle;font-size:16px;background:#fff7f7}
  table.vals tr:nth-child(even) td{background:#fcfcfc}
  table.vals tr:nth-child(even) td.fr{background:#fff7f7}
  ul.lst{margin:4px 0;padding-left:0;list-style:none}
  ul.lst li{position:relative;padding:3px 0 3px 18px;font-size:12.5px;color:#444}
  ul.lst li:before{content:'';position:absolute;left:2px;top:9px;width:6px;height:6px;background:#c00000;border-radius:50%}
  .seg-box{background:#fafbfc;border:1px solid #ececf0;border-radius:8px;padding:10px 15px}
  .seg-item{padding:3px 0;font-size:12.5px;color:#444}
  .destaque{background:linear-gradient(90deg,#fff2a8,#ffe98a);border-left:4px solid #e0a800;color:#7a5c00;font-weight:700;padding:10px 14px;border-radius:6px;margin:10px 0;font-size:13px}
  .destaque b{color:#c00000}
  .info{margin:8px 0;font-size:13px}
  .info b{color:#222}
  .fecho{margin:24px 0 4px;font-size:12.5px;color:#555;line-height:1.65;border-top:1px dashed #ddd;padding-top:16px}
  .fecho b{color:#c00000}
  .rodape{background:#1a1a1a;color:#cfcfcf;padding:18px 34px;text-align:center;font-size:11px;line-height:1.8}
  .rodape .emp{color:#fff;font-size:24px;font-weight:900;font-style:italic;letter-spacing:-1px;font-family:'Arial Black',Arial,sans-serif}
  .rodape .emp span{color:#ff5050}
  .rodape .contato{color:#ffb0b0}
  .rodape .ln{margin-top:5px}
  .btn-print{position:fixed;top:14px;right:14px;background:#c00000;color:#fff;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(192,0,0,.35);z-index:9}
  .btn-print:hover{background:#a00000}
  @page{margin:12mm} @media print{ .btn-print{display:none} body{background:#fff;padding:0;margin:0} .folha{box-shadow:none;max-width:100%;border-radius:0;margin:0} }
</style></head><body>
<button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
<div class="folha">
  <div class="cab">${logoHtml}<div class="cab-dir"><div class="tit">PROPOSTA DE LOCAÇÃO</div><div class="sub">Veículos &amp; Equipamentos</div></div></div>
  <div class="corpo">
    <div class="saud">Prezado(a) <b>${esc(p.contratante||'cliente')}</b>,<br>É com satisfação que a <b>MH3 Rental</b> apresenta sua proposta comercial para locação, elaborada com as melhores condições para atender às necessidades da sua operação.</div>
    <div class="dados">
      <div class="row">
        <div class="campo"><span class="lbl">Data</span><span class="val">${dt(p.data)||'—'}</span></div>
        <div class="campo"><span class="lbl">Validade da proposta</span><span class="val">${dt(p.validade)||'—'}</span></div>
        <div class="campo"><span class="lbl">Empresa / Solicitante</span><span class="val">${esc(p.contratante||'—')}</span></div>
      </div>
      <div class="row">
        <div class="campo"><span class="lbl">Obra / Cidade</span><span class="val">${esc(p.obra||'—')}</span></div>
        <div class="campo"><span class="lbl">Veículo / Equipamento</span><span class="val">${esc(p.veiculo||'—')}</span></div>
      </div>
      <div class="row">
        <div class="campo"><span class="lbl">Modelo</span><span class="val">${esc(p.modelo||'—')}</span></div>
        <div class="campo"><span class="lbl">Ano</span><span class="val">${esc(p.ano||'—')}</span></div>
        ${kmHrHtml}
      </div>
    </div>
    <div class="sec"><span class="bar"></span><h3>Valores</h3></div>
    ${tabelaValores}
    ${obs?('<div class="sec"><span class="bar"></span><h3>Observações</h3></div><ul class="lst">'+obs+'</ul>'):''}
    <div class="info" style="margin-top:18px"><b>Mobilização / Desmobilização:</b> ${mobilTxt}</div>
    <div class="destaque">📋 PRAZO, FIDELIDADE E RESCISÃO:<br>${esc(p.duracao||'').replace(/\n/g,'<br>')}</div>
    ${resp?('<div class="sec"><span class="bar"></span><h3>Responsabilidades da Contratante</h3></div><ul class="lst">'+resp+'</ul>'):''}
    ${seg?('<div class="sec"><span class="bar"></span><h3>Seguro</h3></div><div class="seg-box">'+seg+'</div>'):''}
    <div class="dados" style="margin-top:18px">
      <div class="row">
        <div class="campo"><span class="lbl">Ciclo de medição</span><span class="val">${esc(p.ciclo||'—')}</span></div>
        <div class="campo"><span class="lbl">Condição de pagamento</span><span class="val">${esc(p.pagamento||'—')}</span></div>
      </div>
    </div>
    <div class="fecho">Agradecemos a oportunidade e a confiança em nossos serviços. Permanecemos à inteira disposição para esclarecer dúvidas e ajustar esta proposta conforme a sua necessidade.<br><br>Atenciosamente,<br><b>Equipe MH3 Rental</b></div>
  </div>
  <div class="rodape">
    <div class="emp">${esc(rodNome)}</div>
    ${rodTextoHtml}
  </div>
</div>
</body></html>`;
  }
  window._buildPropostaHTML = buildPropostaHTML;

  window.gerarProposta = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var w=window.open('','_blank');
    if(!w){ toast('Permita pop-ups para gerar a proposta','er'); return; }
    w.document.write(buildPropostaHTML(p));
    w.document.close();
  };

  function carregarLibsPDF(cb){
    function temLibs(){ return !!(window.html2canvas && window.jspdf && window.jspdf.jsPDF); }
    if(temLibs()){ cb(true); return; }
    var precisa=[];
    if(!window.html2canvas) precisa.push('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    if(!(window.jspdf&&window.jspdf.jsPDF)) precisa.push('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js');
    if(!precisa.length){ cb(temLibs()); return; }
    var restantes=precisa.length, falhou=false;
    precisa.forEach(function(src){
      var s=document.createElement('script'); s.src=src;
      s.onload=function(){ restantes--; if(restantes<=0) cb(temLibs()&&!falhou); };
      s.onerror=function(){ falhou=true; restantes--; if(restantes<=0) cb(false); };
      document.head.appendChild(s);
    });
  }
  function propGerarPDF(p, cb){
    carregarLibsPDF(function(ok){
      if(!ok || !window.html2canvas || !(window.jspdf&&window.jspdf.jsPDF)){ cb(null); return; }
      var ifr=document.createElement('iframe');
      ifr.style.cssText='position:fixed;left:-9999px;top:0;width:820px;height:1400px;border:none';
      document.body.appendChild(ifr);
      var doc=ifr.contentDocument||ifr.contentWindow.document;
      doc.open(); doc.write(buildPropostaHTML(p)); doc.close();
      setTimeout(function(){
        try{ var btn=doc.querySelector('.btn-print'); if(btn) btn.parentNode.removeChild(btn); }catch(e){}
        try{
          doc.body.style.margin='0'; doc.body.style.padding='0'; doc.body.style.background='#ffffff';
          var folha0=doc.querySelector('.folha');
          if(folha0){ folha0.style.margin='0'; folha0.style.maxWidth='none'; folha0.style.width='794px'; folha0.style.boxShadow='none'; folha0.style.borderRadius='0'; }
        }catch(e){}
        var folha=doc.querySelector('.folha')||doc.body;
        // Coletar pontos de quebra SEGUROS (limite inferior de cada bloco/linha) p/ não cortar conteúdo no meio
        var fTop=folha.getBoundingClientRect().top;
        var pontos=[];
        try{
          folha.querySelectorAll('.cab, .corpo > *, table.vals tr, ul.lst li, .rodape').forEach(function(el){
            if(el.classList && el.classList.contains('sec')) return; // não quebrar logo após um título de seção (evita título órfão)
            var bot=el.getBoundingClientRect().bottom - fTop;
            if(bot>0) pontos.push(bot);
          });
        }catch(e){}
        var alturaCss=folha.scrollHeight;
        if(pontos.indexOf(alturaCss)<0) pontos.push(alturaCss);
        pontos=pontos.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a-b;});
        try{
          window.html2canvas(folha,{scale:2,backgroundColor:'#ffffff',useCORS:true,scrollX:0,scrollY:0,windowWidth:794}).then(function(canvas){
            try{
              var pdf=new window.jspdf.jsPDF('p','mm','a4');
              var pageW=pdf.internal.pageSize.getWidth(), pageH=pdf.internal.pageSize.getHeight();
              var escala=canvas.height/alturaCss;          // px-canvas por px-css
              var pxPorMm=canvas.width/pageW;              // px-canvas por mm
              var margemMm=6;                              // respiro no topo e na base de cada página
              var utilCanvas=(pageH-margemMm*2)*pxPorMm;   // altura útil por página (em px-canvas)
              var pts=pontos.map(function(v){return v*escala;});
              var total=canvas.height, y=0, primeira=true, guard=0;
              while(y<total-1 && guard<80){
                guard++;
                var limite=y+utilCanvas;
                var corte=0;
                for(var i=0;i<pts.length;i++){ if(pts[i]>y+12 && pts[i]<=limite+0.5) corte=pts[i]; }
                if(corte<=y) corte=Math.min(limite,total);  // bloco maior que a página: corta no limite (raro)
                var sliceH=Math.round(corte-y);
                if(sliceH<=0) break;
                var sc=document.createElement('canvas'); sc.width=canvas.width; sc.height=sliceH;
                var ctx=sc.getContext('2d'); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,sc.width,sc.height);
                ctx.drawImage(canvas,0,Math.round(y),canvas.width,sliceH,0,0,canvas.width,sliceH);
                var imgSlice=sc.toDataURL('image/jpeg',0.95);
                var imgHmm=sliceH/pxPorMm;
                if(!primeira) pdf.addPage();
                pdf.addImage(imgSlice,'JPEG',0,margemMm,pageW,imgHmm);
                primeira=false; y=corte;
              }
              try{ document.body.removeChild(ifr); }catch(e){}
              cb(pdf.output('datauristring'));
            }catch(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); }
          }).catch(function(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); });
        }catch(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); }
      }, 450);
    });
  }
  window.enviarPropostaEmail = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var cs=window._mh3MinhasContas();
    if(!cs.length){ toast('Você não tem uma conta de e-mail liberada para enviar. Peça ao administrador para liberar uma em Configurações → Contas de E-mail.','er'); return; }
    document.getElementById('pe-prop-id').value=id;
    document.getElementById('pe-conta').innerHTML=cs.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.remetente||c.apelido||c.host)+'</option>';}).join('');
    var emailCli = (typeof emailDoCliente==='function')? emailDoCliente(p.contratante) : '';
    document.getElementById('pe-para').value=emailCli||'';
    document.getElementById('pe-assunto').value='Proposta de Locação - '+(p.contratante||'MH3 Rental');
    document.getElementById('pe-msg').value='Prezado(a) '+(p.contratante||'cliente')+',\n\nSegue em anexo, em PDF, a nossa proposta comercial para locação.\nFicamos à inteira disposição para qualquer dúvida.\n\nAtenciosamente,\nEquipe MH3 Rental';
    document.getElementById('pe-status').innerHTML='';
    var pcf=document.getElementById('pe-confirmar'); if(pcf) pcf.checked=!!(D.config&&D.config.emailConfirmarSempre);
    openM('m-prop-email');
  };
  // ===== Envio unificado de e-mail (usado por proposta, OS, medição, contas, etc.) =====
  // Escolhe a conta do usuário logado (ou a primeira ativa) e envia pelo enviar_doc.php,
  // permitindo solicitar CONFIRMAÇÃO DE RECEBIMENTO. Faz fallback para api.php quando
  // permitido (envios sem anexo) e quando não há conta ou o enviar_doc.php não está no servidor.
  window._mh3MinhasContas = function(){
    var cs=(D.config&&D.config.contasEmail)||[];
    var nome=(typeof authUser!=='undefined'&&authUser)?(authUser.nome||''):'';
    var ids=[]; var fixos={ 'Noninho Fraga':'noninho', 'Arthur':'arthur' };
    (D.usuarios||[]).forEach(function(u){ if((u.nm||'')===nome) ids.push(u.id); });
    if(fixos[nome]) ids.push(fixos[nome]);
    return cs.filter(function(c){ return ids.indexOf(c.usuario_id)>=0; });
  };
  window._mh3ContaEnvio = function(){
    var cs=window._mh3MinhasContas();
    return cs.find(function(x){return x.ativo!=0;}) || cs[0] || null;  // PRIVACIDADE: só contas do usuário logado
  };
  // opts: {para, assunto, corpoHtml, pdfBase64, pdfNome, confirmar, permitirFallback, onProgress, onOk(j,confirmou), onErr(msg)}
  window.mh3EnviarEmail = function(opts){
    opts=opts||{};
    var para=(opts.para||'').trim(), assunto=(opts.assunto||'').trim(), corpoHtml=opts.corpoHtml||'';
    var prog=opts.onProgress||function(){}, ok=opts.onOk||function(){}, err=opts.onErr||function(){};
    var confirmar=!!opts.confirmar, permitirFallback=!!opts.permitirFallback;
    var conta=window._mh3ContaEnvio();
    function viaApi(){ // fallback: api.php (não suporta confirmação de recebimento)
      prog('Enviando…');
      fetch(API+'?action=enviar_email',{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:JSON.stringify({para:para,assunto:assunto,corpo:corpoHtml})})
        .then(function(r){return r.json();})
        .then(function(j){ if(j&&j.ok) ok(j,false); else err((j&&j.msg)||'Não foi possível enviar.'); })
        .catch(function(){ err('Falha de conexão ao enviar e-mail.'); });
    }
    if(!conta){ if(permitirFallback){ viaApi(); } else { err('Cadastre uma conta de e-mail em Configurações → Contas de E-mail para poder enviar.'); } return; }
    prog(confirmar?'📤 Enviando (com confirmação de recebimento)…':'📤 Enviando…');
    var payload={
      chave:'mh3-envio-doc-2026',
      host:conta.host, porta:conta.porta||587, seg:conta.seg||'tls',
      login:conta.usuario||conta.remetente, senha:conta.senha,
      remetente:conta.remetente, nome_remetente:conta.nome_remetente||'MH3 Rental',
      para:para, assunto:assunto, corpo_html:corpoHtml,
      confirmar_recebimento: confirmar?1:0
    };
    if(opts.pdfBase64){ payload.pdf_base64=opts.pdfBase64; payload.pdf_nome=opts.pdfNome||'documento.pdf'; }
    fetch('enviar_doc.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){ if(r.status===404){ throw new Error('ARQUIVO_AUSENTE'); } return r.text().then(function(t){ try{return JSON.parse(t);}catch(e){throw new Error('RESPOSTA_INVALIDA:'+t.slice(0,140));} }); })
      .then(function(j){ if(j&&j.ok) ok(j,confirmar); else { if(permitirFallback){ viaApi(); } else err((j&&j.msg)||'Não foi possível enviar.'); } })
      .catch(function(e){
        var m=String(e&&e.message||e);
        if(m.indexOf('ARQUIVO_AUSENTE')>=0){ if(permitirFallback){ viaApi(); } else err('O arquivo enviar_doc.php não foi encontrado no servidor. Suba-o via Web FTP na mesma pasta do sistema.'); }
        else if(permitirFallback){ viaApi(); }
        else err(m.indexOf('RESPOSTA_INVALIDA')>=0 ? 'O servidor respondeu algo inesperado (possível erro de PHP no enviar_doc.php).' : 'Falha de conexão com o servidor ao enviar.');
      });
  };

  window.confirmarEnvioProposta = function(){
    var id=document.getElementById('pe-prop-id').value;
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var cs=window._mh3MinhasContas();
    var conta=cs.find(function(c){return c.id===document.getElementById('pe-conta').value;})||cs[0];
    var para=document.getElementById('pe-para').value.trim();
    var assunto=document.getElementById('pe-assunto').value.trim();
    var msg=document.getElementById('pe-msg').value.trim();
    var st=document.getElementById('pe-status'), btn=document.getElementById('pe-btn');
    var listaPara=para.split(/[;,]+/).map(function(e){return e.trim();}).filter(Boolean);
    if(!conta){ toast('Selecione a conta de envio','er'); return; }
    if(!listaPara.length || !listaPara.every(function(e){return /.+@.+\..+/.test(e);})){ toast('Informe ao menos um e-mail de destino válido (separe vários por vírgula)','er'); return; }
    if(window.lembrarEmail) window.lembrarEmail(listaPara);
    if(!assunto){ toast('Informe o assunto','er'); return; }
    btn.disabled=true; st.style.color='var(--mt)'; st.innerHTML='⏳ Gerando o PDF da proposta…';
    propGerarPDF(p, function(dataUri){
      if(!dataUri){
        btn.disabled=false; st.style.color='var(--rd)';
        st.innerHTML='❌ Não consegui gerar o PDF (verifique a conexão com a internet). Você pode usar o botão 📄 Gerar e salvar o PDF manualmente.';
        return;
      }
      st.style.color='var(--mt)'; st.innerHTML='📤 Enviando o e-mail com o anexo…';
      var corpoHtml='<div style="font-family:Arial,sans-serif;font-size:13px">'+esc(msg).replace(/\n/g,'<br>')+'</div>';
      var nomeArq='Proposta_'+((p.contratante||'cliente').replace(/[^A-Za-z0-9]/g,'_')).slice(0,30)+'.pdf';
      var pedirConf=(document.getElementById('pe-confirmar')&&document.getElementById('pe-confirmar').checked)?1:0;
      fetch('enviar_doc.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        chave:'mh3-envio-doc-2026',
        host:conta.host, porta:conta.porta||587, seg:conta.seg||'tls', login:conta.usuario||conta.remetente, senha:conta.senha,
        remetente:conta.remetente, nome_remetente:conta.nome_remetente||'MH3 Rental',
        para:para, assunto:assunto, corpo_html:corpoHtml, pdf_base64:dataUri, pdf_nome:nomeArq,
        confirmar_recebimento: pedirConf
      })}).then(function(r){
        if(r.status===404){ throw new Error('ARQUIVO_AUSENTE'); }
        return r.text().then(function(t){ try{ return JSON.parse(t); }catch(e){ throw new Error('RESPOSTA_INVALIDA:'+t.slice(0,120)); } });
      }).then(function(j){
        btn.disabled=false;
        if(j&&j.ok){ st.style.color='var(--gn)'; st.innerHTML='✅ '+esc(j.msg)+(pedirConf?'<br><span style="font-size:11px;color:var(--mt)">📩 Confirmação de recebimento solicitada — o aviso chegará na sua caixa quando o cliente abrir.</span>':''); if(typeof toast==='function')toast('Proposta enviada para '+para+'!','ok'); setTimeout(function(){closeM('m-prop-email');},1900); }
        else { st.style.color='var(--rd)'; st.innerHTML='❌ '+esc((j&&j.msg)||'Não foi possível enviar.')+'<br><span style="font-size:10px;color:var(--mt)">Verifique os dados da conta de e-mail (servidor, porta, login e senha) em Configurações → Contas de E-mail.</span>'; }
      }).catch(function(e){
        btn.disabled=false; st.style.color='var(--rd)';
        var m=String(e&&e.message||e);
        if(m.indexOf('ARQUIVO_AUSENTE')>=0){
          st.innerHTML='❌ O arquivo <b>enviar_doc.php</b> não foi encontrado no servidor.<br><span style="font-size:11px;color:var(--mt)">Suba o arquivo <b>enviar_doc.php</b> (que eu te enviei) via Web FTP, na <b>mesma pasta</b> onde estão o sistema e o api.php.</span>';
        } else if(m.indexOf('RESPOSTA_INVALIDA')>=0){
          st.innerHTML='❌ O servidor respondeu algo inesperado (pode ser erro de PHP no enviar_doc.php).<br><span style="font-size:10px;color:var(--mt)">Detalhe: '+esc(m.replace('Error: RESPOSTA_INVALIDA:',''))+'</span>';
        } else {
          st.innerHTML='❌ Falha de conexão com o servidor ao enviar.<br><span style="font-size:11px;color:var(--mt)">Confira sua internet. Se persistir, confirme que o <b>enviar_doc.php</b> está no servidor.</span>';
        }
      });
    });
  };

})();

