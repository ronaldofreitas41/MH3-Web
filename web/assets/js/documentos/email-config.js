
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

