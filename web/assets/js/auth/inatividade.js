// ---- LOGOFF AUTOMÁTICO POR INATIVIDADE ----
let _ultimaAtividade=Date.now();
let _inatInterval=null;
function logoffMinConfig(){ return parseInt((D.config&&D.config.logoffMin)||0)||0; }
function marcarAtividade(){ _ultimaAtividade=Date.now(); }
function logoffPorInatividade(){
  try{ if(typeof apiCall==='function')apiCall('logout'); }catch(e){}
  authToken=''; authUser=null;
  localStorage.removeItem('mh3_token'); localStorage.removeItem('mh3_user');
  alert('Sessão encerrada por inatividade ('+logoffMinConfig()+' min sem uso). Faça login novamente.');
  location.reload();
}
function iniciarMonitorInatividade(){
  ['mousemove','mousedown','keydown','scroll','touchstart','click'].forEach(ev=>{
    document.removeEventListener(ev, marcarAtividade);
    document.addEventListener(ev, marcarAtividade, {passive:true});
  });
  marcarAtividade();
  if(_inatInterval) clearInterval(_inatInterval);
  _inatInterval=setInterval(()=>{
    const min=logoffMinConfig();
    if(!min||min<=0) return;
    const ls=document.getElementById('login-screen');
    if(ls && ls.style.display==='flex') return; // não está logado
    if(Date.now()-_ultimaAtividade >= min*60000){
      clearInterval(_inatInterval);
      logoffPorInatividade();
    }
  }, 15000);
}
function salvarLogoffMin(){
  const inp=document.getElementById('cfg-logoff-min');
  const v=parseInt(inp.value)||0;
  if(v<0||v>480){toast('Use de 0 a 480 minutos','er');return;}
  D.config=D.config||{}; D.config.logoffMin=v;
  sv();
  marcarAtividade(); iniciarMonitorInatividade();
  const st=document.getElementById('cfg-logoff-status');
  if(st)st.textContent = v>0 ? ('✅ Ativo: desconecta após '+v+' min sem uso.') : '⚪ Desativado.';
  toast(v>0?('Logoff automático: '+v+' min'):'Logoff automático desativado','ok');
}

async function fazerLogout() {
    if (!confirm('Deseja sair do sistema?')) return;
    await apiCall('logout');
    authToken = '';
    authUser  = null;
    localStorage.removeItem('mh3_token');
    localStorage.removeItem('mh3_user');
    location.reload();
}

