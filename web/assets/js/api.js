// ============ API v2 — AUTH + MYSQL ============
const API = 'api.php';
let syncAtivo = false;
let authToken = localStorage.getItem('mh3_token') || '';
let authUser  = JSON.parse(localStorage.getItem('mh3_user') || 'null');
let deferredInstall = null;

// PWA install event
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstall = e;
    const banner = document.getElementById('pwa-banner');
    if (banner && !localStorage.getItem('pwa_dismissed')) {
        banner.style.display = 'flex';
    }
});

function instalarPWA() {
    if (deferredInstall) {
        deferredInstall.prompt();
        deferredInstall.userChoice.then(() => {
            deferredInstall = null;
            document.getElementById('pwa-banner').style.display = 'none';
            localStorage.setItem('pwa_dismissed','1');
        });
    }
}

// Registro de erros de sincronização (para o diagnóstico)
window._syncErros = window._syncErros || [];
function _logSyncErro(acao, msg){
  try{
    window._syncErros.push({hora:new Date().toLocaleTimeString('pt-BR'), acao:String(acao||'').split('&')[0], msg:String(msg||'').slice(0,140)});
    if(window._syncErros.length>30) window._syncErros = window._syncErros.slice(-30);
  }catch(e){}
}
async function apiCall(action, data={}, useAuth=true) {
    try {
        const headers = {'Content-Type':'application/json'};
        if (useAuth && authToken) headers['X-Token'] = authToken;
        const sep = authToken ? ('&token=' + encodeURIComponent(authToken)) : '';
        const res = await fetch(`${API}?action=${action}${sep}`, {
            method: 'POST', headers,
            body: JSON.stringify(data)
        });
        if (res.status === 401) {
            _logSyncErro(action, 'sessão não reconhecida (401)');
            syncAtivo = false;
            return {ok:false, msg:'sessao'};
        }
        if (!res.ok) { _logSyncErro(action, 'erro do servidor (HTTP '+res.status+')'); }
        return await res.json();
    } catch(e) {
        console.warn('API offline:', e.message);
        _logSyncErro(action, 'sem resposta do servidor ('+(e&&e.message?e.message:'rede')+')');
        return {ok:false, offline:true};
    }
}
async function rodarDiagnostico(){
  var el=document.getElementById('diag-resultado'); if(!el)return;
  el.innerHTML='<div style="color:var(--mt)">⏳ Testando, aguarde...</div>';
  var linhas=[];
  function add(nome,ok,detalhe){ linhas.push('<div style="padding:5px 0;border-bottom:1px solid var(--br)">'+(ok?'✅':'❌')+' <b>'+nome+'</b> <span style="color:var(--mt)">'+(detalhe||'')+'</span></div>'); el.innerHTML=linhas.join(''); }
  // 1) Servidor responde (sem banco)
  var t0=Date.now();
  try{ var r1=await fetch('api.php?action=ping',{method:'GET'}); var j1=await r1.json(); add('Servidor responde', !!(j1&&j1.ok), '('+(Date.now()-t0)+' ms · status '+r1.status+(j1&&j1.php?(' · PHP '+j1.php):'')+')'); add('Versão do servidor (api.php)', !!(j1&&j1.versao==='19/06/2026 01h'), (j1&&j1.versao)?('servidor: '+j1.versao+(j1.versao==='19/06/2026 01h'?' — atualizado':' — DESATUALIZADO! suba o api.php novo')):'NÃO informada — api.php DESATUALIZADO, suba o api.php novo'); }
  catch(e){ add('Servidor responde', false, 'sem resposta — '+(e&&e.message?e.message:'rede')); }
  // 2) Sua sessão (login)
  t0=Date.now();
  try{ var r2=await apiCall('ultima_alteracao'); add('Sua sessão (login válido)', !!(r2&&r2.ok), (r2&&r2.ok)?('('+(Date.now()-t0)+' ms)'):('falhou — '+((r2&&r2.msg==='sessao')?'sessão expirada, refaça o login':'sem confirmação'))); if(r2&&r2.ok){add('Atualização entre usuários', !!r2.mods, r2.mods?'formato atual (rápida) ✅':'FORMATO ANTIGO — api.php desatualizado, suba o novo ⚠️');} }
  catch(e){ add('Sua sessão (login válido)', false, e.message); }
  // 3) Ler dados
  t0=Date.now();
  try{ var r3=await apiCall('buscar&modulo=equips'); add('Ler dados do servidor', !!(r3&&r3.ok), (r3&&r3.ok)?('('+(Date.now()-t0)+' ms · '+((r3.dados||[]).length)+' itens)'):'falhou'); }
  catch(e){ add('Ler dados do servidor', false, e.message); }
  // 3b) Auditoria
  t0=Date.now();
  try{ var ra=await apiCall('auditoria&limite=5'); add('Auditoria (histórico)', !!(ra&&ra.ok), (ra&&ra.ok)?('('+(Date.now()-t0)+' ms · '+((ra.dados||[]).length)+' registros)'):'falhou — verifique o api.php'); }
  catch(e){ add('Auditoria (histórico)', false, e.message); }
  // 3c) Gravação da auditoria (teste real — também conserta o schema do log)
  t0=Date.now();
  try{ var rt=await fetch('api.php?action=log_test&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:'{}'}); var jt=await rt.json(); if(jt&&jt.ok){ add('Gravação da auditoria (log)', true, '('+(Date.now()-t0)+' ms · agora há '+(jt.total||0)+' registro(s)) — funcionando ✅'); } else { add('Gravação da auditoria (log)', false, 'ERRO real: '+((jt&&jt.erro)?jt.erro:'desconhecido')); } }
  catch(e){ add('Gravação da auditoria (log)', false, 'sem resposta — '+(e&&e.message?e.message:'rede')); }
  // 4) Gravar no servidor (salva a configuração — inofensivo)
  t0=Date.now();
  try{ var r4=await fetch('api.php?action=salvar_config&token='+encodeURIComponent(authToken),{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:JSON.stringify({config:D.config})}); var j4=await r4.json(); add('Gravar no servidor', !!(j4&&j4.ok), '('+(Date.now()-t0)+' ms · status '+r4.status+')'); }
  catch(e){ add('Gravar no servidor', false, 'sem resposta — '+(e&&e.message?e.message:'rede')); }
  // 5) Erros recentes registrados
  var errs=window._syncErros||[];
  if(errs.length){
    el.innerHTML = linhas.join('') + '<div style="margin-top:8px"><b style="color:var(--red)">⚠️ Erros recentes registrados ('+errs.length+'):</b><div style="margin-top:4px;background:var(--cd);border-radius:6px;padding:8px;font-size:11px;max-height:150px;overflow:auto">'+errs.slice(-10).reverse().map(function(x){return '• '+x.hora+' — <b>'+x.acao+'</b>: '+x.msg;}).join('<br>')+'</div></div>';
  } else {
    add('Erros recentes registrados', true, 'nenhum 👍');
  }
  el.innerHTML += '<div style="margin-top:10px;padding:8px;background:var(--cd2);border-radius:6px;font-size:11px;color:var(--mt)">📋 <b>Tire um print desta tela inteira e me envie</b> — com isso eu identifico e conserto o erro de vez.</div>';
}

// Toggle senha login
function toggleSenhaLogin() {
    const inp = document.getElementById('lg-pass');
    const eye = document.getElementById('lg-eye');
    if (inp.type === 'password') { inp.type = 'text'; eye.textContent = '🙈'; }
    else { inp.type = 'password'; eye.textContent = '👁'; }
}

