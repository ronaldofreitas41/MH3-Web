
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

