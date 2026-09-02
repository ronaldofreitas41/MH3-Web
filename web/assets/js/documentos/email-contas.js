
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

