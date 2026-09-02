// ---- LOGIN ---- (autenticacao real via MySQL)

// ---- VERIFICA SE O SERVIDOR ESTÁ ONLINE NA TELA DE LOGIN ----
async function verificarServidorLogin(){
  const msg=document.getElementById('lg-offline-msg');
  if(!msg)return;
  try{
    const controller=new AbortController();
    setTimeout(()=>controller.abort(),8000);
    const res=await fetch('api.php?action=ping',{signal:controller.signal});
    const r=await res.json();
    msg.style.display=(r&&r.ok)?'none':'block';
  }catch(e){
    msg.style.display='block';
  }
}

// ---- SALVAR USUÁRIO/SENHA NA TELA DE LOGIN ----
function salvarCredLogin(){
  try{
    const c=document.getElementById('lg-salvar');
    if(c && c.checked){
      const u=document.getElementById('lg-user').value;
      const p=document.getElementById('lg-pass').value;
      localStorage.setItem('mh3_cred', btoa(unescape(encodeURIComponent(JSON.stringify({u,p})))));
    } else {
      localStorage.removeItem('mh3_cred');
    }
  }catch(e){}
}
function carregarCredLogin(){
  try{
    const raw=localStorage.getItem('mh3_cred');
    if(!raw)return;
    const obj=JSON.parse(decodeURIComponent(escape(atob(raw))));
    const eu=document.getElementById('lg-user'), ep=document.getElementById('lg-pass'), ec=document.getElementById('lg-salvar');
    if(eu&&obj.u)eu.value=obj.u;
    if(ep&&obj.p)ep.value=obj.p;
    if(ec)ec.checked=true;
  }catch(e){}
}

async function fazerLogin() {
    const btn  = document.getElementById('lg-btn');
    const erro = document.getElementById('login-erro');
    const user = (document.getElementById('lg-user').value || '').trim();
    const pass = document.getElementById('lg-pass').value || '';

    erro.style.display = 'none';

    if (!user || !pass) {
        erro.textContent = 'Preencha usuário e senha';
        erro.style.display = 'block';
        return;
    }

    btn.textContent = 'Entrando...';
    btn.disabled = true;

    // Credenciais locais de fallback (caso o banco esteja fora)
    const usuariosLocal = {
        'noninho':   {senha:'mh3@2025', nome:'Noninho Fraga',   perfil:'admin'},
        'arthur':    {senha:'mh3@2025', nome:'Arthur',          perfil:'motorista'}
    };

    // 1) Tenta login REAL no servidor (MySQL) — gera token válido
    let servidorRespondeu = false;
    try {
        const res = await fetch('api.php?action=login', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({login: user.toLowerCase(), senha: pass})
        });
        servidorRespondeu = true;
        const r = await res.json();
        if (r.ok && r.token) {
            authToken = r.token;
            authUser  = {nome: r.nome, perfil: r.perfil, perms: r.permissoes||null, login: user.toLowerCase()};
            localStorage.setItem('mh3_token', authToken);
            localStorage.setItem('mh3_user', JSON.stringify(authUser));
            salvarCredLogin();
            entrarSistema(r.nome, r.perfil);
            syncAtivo = true;
            mostrarStatusConexao(true);
            // sincroniza em background, SEM bloquear nem mudar o token
            syncCarregar();
            return;
        }
        // Servidor respondeu mas não autenticou (ex: usuário criado no app, ainda não no servidor)
        // NÃO retorna aqui — cai na verificação local (usuários criados + fixos) abaixo.
    } catch(e) {
        // Mostrar erro real para diagnóstico
        window._loginErro = e.message + ' | ' + e.name;
    }

    // ONLINE-ONLY: este sistema NÃO trabalha offline.
    // Servidor respondeu mas não autenticou -> usuário/senha errado.
    // Servidor não respondeu (sem internet / servidor fora) -> avisa e NÃO entra.
    if (servidorRespondeu) {
        erro.textContent = 'Usuário ou senha incorretos';
    } else {
        erro.textContent = '⚠️ Sem conexão com o servidor. Este sistema só funciona online — verifique a internet e tente novamente.';
    }
    erro.style.display = 'block';
    btn.textContent = 'Entrar no Sistema';
    btn.disabled = false;
    return;
}

function entrarSistema(nome, perfil) {
    const ls = document.getElementById('login-screen');
    if (ls) ls.style.display = 'none';
    const sbUn = document.querySelector('.sb-un');
    if (sbUn) sbUn.textContent = nome;
    const sbUr = document.querySelector('.sb-ur');
    if (sbUr) sbUr.textContent = perfil === 'admin' ? 'Administrador' : perfil === 'operacional' ? 'Operacional' : perfil === 'motorista' ? 'Motorista' : perfil;
    const sbAv = document.querySelector('.sb-av');
    if (sbAv) sbAv.textContent = (nome||'U').charAt(0).toUpperCase();
    const niAudit = document.getElementById('ni-audit');
    if (niAudit) niAudit.style.display = perfil === 'admin' ? '' : 'none';
    if(typeof aplicarPermissoes==='function')setTimeout(aplicarPermissoes,100);

  setTimeout(function(){ if(typeof popRelSubmenu==='function')popRelSubmenu(); },180);
  setTimeout(function(){
    try{
      var pm=new URLSearchParams(location.search).get('p');
      if(pm && document.getElementById('pg-'+pm)){ go(pm); }
    }catch(e){}
  }, 240);
  if(typeof iniciarMonitorInatividade==='function')iniciarMonitorInatividade();
}

async function trocarMinhaSenha() {
  const _sn=document.getElementById('senha-nova').value;
  if(_sn.length<8||!/[A-Za-z]/.test(_sn)||!/[0-9]/.test(_sn)){toast('Senha fraca: mínimo 8 caracteres com letra e número','er');return;}
    const nova = document.getElementById('senha-nova').value;
    const conf = document.getElementById('senha-conf').value;
    const msg  = document.getElementById('senha-msg');
    const btn  = document.getElementById('senha-btn');

    function mostrarMsg(texto, cor) {
        msg.style.display = 'block';
        msg.textContent = texto;
        msg.style.background = cor === 'erro' ? '#fee2e2' : '#dcfce7';
        msg.style.color = cor === 'erro' ? '#b91c1c' : '#15803d';
    }

    // Só bloqueia se o login foi LOCAL
    if (!authToken || authToken.indexOf('local_') === 0) {
        mostrarMsg('Sem conexão com o servidor. Saia e entre de novo com internet.', 'erro');
        return;
    }
    if (!nova || !conf) { mostrarMsg('Preencha os dois campos.', 'erro'); return; }
    if (nova.length < 6) { mostrarMsg('A senha precisa ter pelo menos 6 caracteres.', 'erro'); return; }
    if (nova !== conf) { mostrarMsg('As duas senhas não são iguais. Verifique.', 'erro'); return; }

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const r = await apiCall('trocar_senha', { nova: nova });
        if (r && r.ok) {
            mostrarMsg('Senha alterada com sucesso! Use a nova senha no próximo login.', 'ok');
            document.getElementById('senha-nova').value = '';
            document.getElementById('senha-conf').value = '';
            setTimeout(() => { closeM('m-senha'); msg.style.display='none'; }, 2500);
        } else {
            mostrarMsg((r && r.msg) ? r.msg : 'Não foi possível alterar agora. Tente mais tarde.', 'erro');
        }
    } catch(e) {
        mostrarMsg('Erro de conexão. Verifique a internet e tente de novo.', 'erro');
    }
    btn.disabled = false;
    btn.textContent = 'Salvar Nova Senha';
}


