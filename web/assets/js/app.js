
// ============ DADOS ============
let D={equips:[],contratos:[],medicoes:[],manutencoes:[],vendas:[],despesas:[],estoque:[],nfs:[],revisoes:[],checklists:[],usuarios:[],config:{ciclos:['01-30','21-20'],t1:200,t2:300,t3:420,alertDias:5,hextraVl:0,rkm:10000,rhr:500,tiposOS:['Revisão Preventiva','Reparo Corretivo','Mobilização','Desmobilização','Avaria','Troca de Pneus','Elétrica','Impressão'],admPw:'mh3admin',margem:30,prazos:[],tabelas:[],responsaveis:[],empresas:[]},seq:{os:1,venda:1,pneu:1},pneus:[],pneus_hist:[],mobilizacoes:[],funcionarios:[],clientes:[],saidasMaterial:[],ajudasMotorista:[],contasBanco:[],investimentos:[],tratativas:[],pneus_pend:[],seguros:[]};
let mnLancs=[],mnClIs=[],mnFotos=[],clIMs=[],nfIs=[],eqFotos=[],eqArqs=[],vdItems=[],mobClIs=[],mnPneus=[];
let senhaCallback=null;

function normalizarUsuarios(){
  if(!D || !D.usuarios) return;
  D.usuarios.forEach(function(u){
    if(!u) return;
    var nm=u.nm||u.nome||u.lg||u.login||'';
    var lg=u.lg||u.login||'';
    var pf=u.pf||u.perfil||'';
    u.nm=u.nm||nm; u.nome=u.nome||nm;
    u.lg=u.lg||lg; u.login=u.login||lg;
    u.pf=u.pf||pf; u.perfil=u.perfil||pf;
  });
}
// ===== MAIÚSCULAS automáticas (regra geral) — converte o VALOR digitado, exceto e-mail/senha/login/servidor =====
(function(){
  function _semUpper(el){
    var t=(el.type||'').toLowerCase();
    if(['email','password','url','number','tel','date','time','datetime-local','month','week','color','range','file','hidden','checkbox','radio'].indexOf(t)>=0) return true;
    var h=((el.id||'')+' '+(el.name||'')+' '+(el.placeholder||'')).toLowerCase();
    if(/e-?mail|\bmail|remet|destinat|-para\b|senha|password|\bpw\b|login|-lg\b|\bhost\b|smtp|imap|\burl\b|@/.test(h)) return true;
    if(el.classList && el.classList.contains('no-upper')) return true;
    return false;
  }
  document.addEventListener('input', function(e){
    var el=e.target;
    if(!el || (el.tagName!=='INPUT' && el.tagName!=='TEXTAREA')) return;
    if(_semUpper(el)) return;
    var v=el.value; if(!v) return;
    var up=v.toUpperCase();
    if(v!==up){
      var s=el.selectionStart, en=el.selectionEnd;
      el.value=up;
      try{ el.setSelectionRange(s,en); }catch(_){}
    }
  }, true);
})();
function ld(){try{const s=localStorage.getItem('mh3v5');if(s){const p=JSON.parse(s);D={...D,...p};if(p.config)D.config={...D.config,...p.config};if(p.seq)D.seq={...D.seq,...p.seq};}}catch(e){} try{if(D.config&&Array.isArray(D.config.tiposOS)){D.config.tiposOS=D.config.tiposOS.map(function(t){return (t&&String(t).toLowerCase()==='outro')?'Impressão':t;});}}catch(e){} try{normalizarUsuarios();}catch(e){}}
function sv(){
  window._localSaveTs = Date.now();
  // 1) Envia ao servidor IMEDIATAMENTE — é a fonte oficial dos dados (seguro p/ vários usuários ao mesmo tempo)
  if(syncAtivo && authToken) _pushServidorAgora();
  // 2) Cache local agendado — não trava a tela; o servidor já guardou os dados
  _agendarSalvarLocal();
}
var _tmrLocalSv=null;
function _agendarSalvarLocal(){ if(_tmrLocalSv) return; _tmrLocalSv=setTimeout(function(){ _tmrLocalSv=null; _salvarLocalAgora(); }, 700); }
function _salvarLocalAgora(){
  try{ localStorage.setItem('mh3v5', JSON.stringify(D)); }
  catch(e){
    // Memória do navegador cheia: grava SEM as fotos pesadas (elas já ficam no servidor)
    try{ localStorage.setItem('mh3v5', JSON.stringify(_dadosLeves())); }
    catch(e2){ try{ console.warn('[MH3] Cache local cheio — dados seguem salvos no servidor (modo online).'); }catch(_){} }
  }
}
function _pushServidorAgora(){
  if(!(syncAtivo && authToken)) return;
  window._sidsServer = window._sidsServer || {};
  window._modJson = window._modJson || {};
  var _pushMod = function(mod){
    if(D[mod]===undefined) return;
    var _json = JSON.stringify(D[mod]||[]);
    if(window._modJson[mod] === _json) return; // módulo não mudou — não reenvia (alivia o servidor com vários usuários)
    window._modJson[mod] = _json;
    var atuais = (D[mod]||[]).map(function(r){return r&&r.id;}).filter(function(x){return x!==undefined&&x!==null&&x!=='';});
    var conhecidos = window._sidsServer[mod] || [];
    var excluir = conhecidos.filter(function(id){return atuais.indexOf(id)<0;});
    syncSalvar(mod, D[mod], excluir);
    window._sidsServer[mod] = atuais;
  };
  ['equips','contratos','medicoes','manutencoes','vendas','despesas','estoque','nfs','revisoes','checklists','usuarios','funcionarios','clientes','pneus','mobilizacoes','saidasMaterial','ajudasMotorista','contasBanco','investimentos','tratativas','pneus_pend','seguros','propostas','pneus_hist'].forEach(_pushMod);
  try{
    fetch('api.php?action=salvar_config&token=' + encodeURIComponent(authToken),{
      method:'POST',
      headers:{'Content-Type':'application/json','X-Token':authToken},
      body:JSON.stringify({config:D.config})
    });
  }catch(e){}
}
try{ window.addEventListener('beforeunload', function(){ try{ if(_tmrLocalSv){clearTimeout(_tmrLocalSv);_tmrLocalSv=null;} _salvarLocalAgora(); }catch(e){} }); }catch(e){}
// ===== Conserto de salvamento: avisos de falha + backup leve + compressão de fotos =====
window._falhaSalvarTs = window._falhaSalvarTs || 0;
function _avisarFalhaSalvar(tipo, err){
  try{
    var agora = Date.now();
    if (agora - (window._falhaSalvarTs||0) < 8000) return; // não repetir em excesso
    window._falhaSalvarTs = agora;
    var msg = (tipo==='memoria')
      ? '⚠️ ATENÇÃO: o último salvamento NÃO foi gravado na memória deste aparelho (memória cheia). Seus dados podem se perder — evite cadastrar muitas fotos pesadas e avise o suporte.'
      : '⚠️ ATENÇÃO: o último salvamento NÃO foi confirmado pelo servidor. Seus dados podem não ter sido gravados. Confira a internet e tente de novo.';
    try{ if(typeof toast==='function') toast(msg,'er'); }catch(e){}
    try{ _mostrarBannerFalha(msg); }catch(e){}
    try{ console.error('[MH3] Falha ao salvar ('+tipo+'):', err); }catch(e){}
  }catch(e){}
}
function _mostrarBannerFalha(msg){
  var id='mh3-falha-salvar';
  var el=document.getElementById(id);
  if(!el){
    el=document.createElement('div');
    el.id=id;
    el.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;background:#b91c1c;color:#fff;font-family:sans-serif;font-size:13px;font-weight:700;padding:11px 46px 11px 14px;box-shadow:0 2px 10px rgba(0,0,0,.35);line-height:1.4;';
    var tx=document.createElement('span'); tx.id='mh3-falha-salvar-tx';
    el.appendChild(tx);
    var bt=document.createElement('button');
    bt.textContent='✕'; bt.title='Fechar aviso';
    bt.style.cssText='position:absolute;top:7px;right:10px;background:transparent;border:none;color:#fff;font-size:18px;cursor:pointer;line-height:1;';
    bt.onclick=function(){ var b=document.getElementById(id); if(b) b.remove(); };
    el.appendChild(bt);
    document.body.appendChild(el);
  }
  var t=document.getElementById('mh3-falha-salvar-tx'); if(t) t.textContent=msg;
}
function _dadosLeves(){
  var leve={};
  try{
    for(var k in D){
      if(!Object.prototype.hasOwnProperty.call(D,k)) continue;
      if(Array.isArray(D[k])){
        leve[k]=D[k].map(function(it){
          if(it && typeof it==='object' && (('fotos' in it)||('arqs' in it))){
            var c=Object.assign({},it);
            if('fotos' in c) c.fotos=[];
            if('arqs' in c) c.arqs=[];
            return c;
          }
          return it;
        });
      } else { leve[k]=D[k]; }
    }
  }catch(e){ return D; }
  return leve;
}
let _fotosEnviando=0;
function _uploadFoto(base64, nome, cb){
  // Envia a foto pro servidor e devolve a URL. Se não estiver online ou der erro,
  // mantém o base64 (jeito atual) — rede de segurança: nunca quebra o cadastro.
  try{
    var online = (typeof syncAtivo!=='undefined' && syncAtivo) && (typeof authToken!=='undefined' && authToken) && String(authToken).indexOf('local_')!==0;
    if(!online || !base64 || String(base64).indexOf('data:')!==0){ cb(base64, nome); return; }
    _fotosEnviando++;
    fetch('api.php?action=upload_foto', {
      method:'POST',
      headers:{'Content-Type':'application/json','X-Token':authToken},
      body: JSON.stringify({data:base64, nome:(nome||'foto')})
    }).then(function(r){return r.json();}).then(function(j){
      _fotosEnviando=Math.max(0,_fotosEnviando-1);
      if(j && j.ok && j.url){ cb(j.url, nome); } else { cb(base64, nome); }
    }).catch(function(){ _fotosEnviando=Math.max(0,_fotosEnviando-1); cb(base64, nome); });
  }catch(e){ cb(base64, nome); }
}
function _comprimirImg(file, maxDim, q, cb){
  try{
    if(!file || !/^image\//.test(file.type||'')){
      var r0=new FileReader();
      r0.onload=function(e){ cb(e.target.result, file.name, file.type, file.size); };
      r0.onerror=function(){ cb('', file.name, file.type, file.size); };
      r0.readAsDataURL(file);
      return;
    }
    var rd=new FileReader();
    rd.onload=function(ev){
      var img=new Image();
      img.onload=function(){
        var w=img.width, h=img.height;
        if(w>maxDim || h>maxDim){ if(w>=h){ h=Math.round(h*maxDim/w); w=maxDim; } else { w=Math.round(w*maxDim/h); h=maxDim; } }
        try{
          var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
          var cx=cv.getContext('2d'); cx.drawImage(img,0,0,w,h);
          var out=cv.toDataURL('image/jpeg', q||0.72);
          cb(out, file.name, 'image/jpeg', out.length);
        }catch(err){ cb(ev.target.result, file.name, file.type, file.size); }
      };
      img.onerror=function(){ cb(ev.target.result, file.name, file.type, file.size); };
      img.src=ev.target.result;
    };
    rd.onerror=function(){ cb('', file.name, file.type, file.size); };
    rd.readAsDataURL(file);
  }catch(e){
    try{ var r2=new FileReader(); r2.onload=function(ee){ cb(ee.target.result, file.name, file.type, file.size); }; r2.readAsDataURL(file); }catch(e2){ cb('', file.name, '', 0); }
  }
}
function uid(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5);}
function fmt(v){return'R$ '+(Number(v)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtN(v){if(v===''||v===null||v===undefined)return'';var s=String(v);var n=parseInt(s.replace(/[^0-9-]/g,''),10);if(isNaN(n))return s;return n.toLocaleString('pt-BR');}
function ehImpressao(m){return !!(m&&m.tipo&&m.tipo.toLowerCase().indexOf('impress')>=0);}
function _numLimpo(v){return parseInt(String(v==null?'':v).replace(/[^0-9]/g,''),10)||0;}
// Máscara da medida de pneu: formata os dígitos no padrão 000/00R00,0 (com vírgula, padrão BR)
function _maskMedidaPneu(el){
  if(!el) return;
  var d = String(el.value||'').replace(/\D/g,'').slice(0,8);
  var o='';
  if(d.length>0) o = d.slice(0,3);
  if(d.length>3) o += '/'+d.slice(3,5);
  if(d.length>5) o += 'R'+d.slice(5,7);
  if(d.length>7) o += ','+d.slice(7,8);
  el.value = o;
}
try{ document.addEventListener('input', function(e){ var t=e.target; if(t&&t.id&&(t.id==='pneu-med'||/^mob-p\d+-med$/.test(t.id))) _maskMedidaPneu(t); }); }catch(e){}
function _npVeic(p){return String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function _osDoVeic(eq,m){return eq&&m&&(m.eqId===eq.id||(m.placa&&eq.placa&&_npVeic(m.placa)===_npVeic(eq.placa)));}
window._edicaoLivre=false;
function aplicarEdicaoLivre(root){
  root=root||document;
  var campos=root.querySelectorAll('input,select,textarea');
  for(var i=0;i<campos.length;i++){
    var el=campos[i];
    if(window._edicaoLivre){
      if(el.readOnly){el.setAttribute('data-rl','1');el.readOnly=false;}
      if(el.disabled){el.setAttribute('data-dl','1');el.disabled=false;}
    } else {
      if(el.getAttribute('data-rl')){el.readOnly=true;el.removeAttribute('data-rl');}
      if(el.getAttribute('data-dl')){el.disabled=true;el.removeAttribute('data-dl');}
    }
  }
}
function toggleEdicaoLivre(){
  if(typeof ehAdminAtual==='function' && !ehAdminAtual()){if(typeof toast==='function')toast('Apenas o administrador pode usar a edição livre.','er');return;}
  window._edicaoLivre=!window._edicaoLivre;
  try{aplicarEdicaoLivre(document);}catch(e){}
  var b=document.getElementById('btn-edicao-livre');
  if(b){b.textContent=window._edicaoLivre?'🔓 Edição livre ON':'🔒 Edição livre';b.className=window._edicaoLivre?'btn bd btn-sm no-print':'btn bg btn-sm no-print';}
  if(typeof toast==='function')toast(window._edicaoLivre?'Edição livre LIGADA — campos travados liberados. Cuidado ao alterar!':'Edição livre desligada.','ok');
}
function kmAtualVeic(eq){if(!eq)return 0;var max=_numLimpo(eq.km);var corte=(eq.kmDt||'')+'';(D.manutencoes||[]).forEach(function(m){if(_osDoVeic(eq,m)){var dm=(m.en||m.sa||'')+'';if(corte&&dm&&dm<corte)return;var k=_numLimpo(m.km);if(k>max)max=k;}});(D.revisoes||[]).forEach(function(r){if(r.eqId===eq.id||(r.placa&&eq.placa&&_npVeic(r.placa)===_npVeic(eq.placa))){var dr=(r.data||'')+'';if(corte&&dr&&dr<corte)return;var k=_numLimpo(r.km);if(k>max)max=k;}});return max;}
function hrAtualVeic(eq){if(!eq)return 0;var max=_numLimpo(eq.hr);var corte=(eq.kmDt||'')+'';(D.manutencoes||[]).forEach(function(m){if(_osDoVeic(eq,m)){var dm=(m.en||m.sa||'')+'';if(corte&&dm&&dm<corte)return;var h=_numLimpo(m.hr);if(h>max)max=h;}});(D.revisoes||[]).forEach(function(r){if(r.eqId===eq.id||(r.placa&&eq.placa&&_npVeic(r.placa)===_npVeic(eq.placa))){var dr=(r.data||'')+'';if(corte&&dr&&dr<corte)return;var h=_numLimpo(r.hr);if(h>max)max=h;}});return max;}


function fmtk(v){return fmt(v);}
function today(){return new Date().toISOString().split('T')[0];}
function dTo(ds){if(!ds)return null;return Math.round((new Date(ds+'T12:00:00')-new Date())/86400000);}
function nextNum(key){D.seq=D.seq||{};D.seq[key]=(D.seq[key]||0)+1;return String(D.seq[key]).padStart(5,'0');}
function bdg(s){const m={alocado:['b-gn','Alocado'],disponivel:['b-bl','Disponível'],imobilizado:['b-yw','Imobilizado'],vendido:['b-gr','Vendido'],uso_empresa:['b-pu','Uso Empresa'],pendente:['b-yw','Pendente'],enviada:['b-bl','Enviada'],aprovada:['b-pu','Aprovada'],paga:['b-gn','Paga'],negociando:['b-or','Negociando'],fechada:['b-gn','Fechada'],perdida:['b-rd','Perdida'],ativo:['b-gn','Ativo'],encerrado:['b-gr','Encerrado'],aberta:['b-yw','Aberta'],aguardando:['b-or','Aguardando'],concluida:['b-gn','Concluída'],mh3:['b-bl','MH3'],cliente:['b-or','Cliente'],assinado:['b-gn','Assinado'],pendente_ass:['b-yw','Pend.Ass.'],faturado:['b-gn','Faturado'],nao_faturado:['b-or','A Faturar'],pago:['b-gn','Pago'],entrada:['b-gn','OK']};const r=m[s]||['b-gr',s];return`<span class="badge ${r[0]}">${r[1]}</span>`;}

// ============ SENHA ADMIN ============
function reqSenha(cb){senhaCallback=cb;document.getElementById('senha-inp').value='';document.getElementById('senha-overlay').classList.add('op');}
function senhaOk(){
  const v=document.getElementById('senha-inp').value;
  const admPw = (D.config&&D.config.admPw) ? D.config.admPw : 'mh3admin';
  if(v===admPw){
    document.getElementById('senha-overlay').classList.remove('op');
    document.getElementById('senha-inp').value='';
    if(senhaCallback){senhaCallback();senhaCallback=null;}
  }else{
    toast('Senha incorreta. Senha admin: configurada em Configurações','er');
    document.getElementById('senha-inp').value='';
    document.getElementById('senha-inp').focus();
  }
}
function senhaCancel(){document.getElementById('senha-overlay').classList.remove('op');senhaCallback=null;}

// ============ NAV ============
let cur='dashboard';
const ttls={dashboard:'Dashboard',pendencias:'Pendências',tratativas:'Tratativas — Combinados e Notas',frota:'Frota',manutencao:'Manutenções / OS',revisao:'Acompanhamento de Revisão',contratos:'Contratos',medicoes:'Medições',vendas:'Venda Peças & Serviços',estoque:'Estoque',nf:'NF Entrada',despesas:'Despesas & Compras',financeiro:'Financeiro',fluxo:'Fluxo de Caixa',relatorios:'Relatórios',checklist:'Checklists',usuarios:'Usuários',resultado:'Resultado por Placa',pneus:'Pneus',mobilizacao:'Mobilização / Desmobilização',seguro:'Seguro — Apólices e Vencimentos',contas_pagar:'Contas a Pagar',contas_receber:'Contas a Receber',sistema:'Sistema — Tabelas e Prazos',funcionarios:'Funcionários',clientes:'Clientes',prejuizos:'Prejuízos',saida_material:'Saída de Material — Almoxarifado',ajuda_motorista:'Ajuda Motoristas — Ajuda de Custo',investimento:'Investimentos — Consórcios e Bens em Pagamento',agenda:'Calendário de Compromissos',auditoria:'Auditoria',config:'Configurações',auditoria:'Auditoria — Rastreamento de Ações',caixaemail:'Caixa de E-mail',whatsapp:'WhatsApp — Envio e Mensagens',proposta:'Propostas Comerciais'};
function go(p){if(typeof ehAdminAtual==='function'&&!ehAdminAtual()&&typeof PERM_MENU_MOD!=='undefined'&&(p in PERM_MENU_MOD)){var _pm=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};if(!_pm[PERM_MENU_MOD[p]]){if(typeof toast==='function')toast('Você não tem permissão para acessar esta área.','er');p='dashboard';}}if(typeof aplicarPermissoes==='function')setTimeout(aplicarPermissoes,50);document.querySelectorAll('.page').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.ni').forEach(x=>x.classList.remove('on'));document.getElementById('pg-'+p).classList.add('on');document.getElementById('ptitle').textContent=ttls[p]||p;cur=p;document.querySelectorAll('.ni').forEach(x=>{if(x.getAttribute('onclick')&&x.getAttribute('onclick').includes("'"+p+"'"))x.classList.add('on');});closeSB();rp(p);if(p==='relatorios'&&typeof popRelTipos==='function')popRelTipos();}
function rp(p){const r={dashboard:rdDash,auditoria:rdAudit,pendencias:rdPend,tratativas:rdTratativas,frota:rdFrota,manutencao:rdManut,revisao:rdRev,contratos:rdCts,medicoes:rdMeds,vendas:rdVendas,estoque:rdEstq,nf:rdNf,despesas:rdDesp,financeiro:rdFin,fluxo:rdFluxo,relatorios:rdRel,checklist:rdCl,usuarios:rdUsr,config:rdCfg,resultado:goResultado,pneus:rdPneus,mobilizacao:rdMob,seguro:rdSeguro,contas_pagar:rdContasPagar,contas_receber:rdContasReceber,sistema:rdSistema,funcionarios:rdFunc,clientes:rdClientes,prejuizos:rdPrejuizos,saida_material:rdSaidaMaterial,ajuda_motorista:rdAjudaMotorista,investimento:rdInvestimento,agenda:rdAgenda,caixaemail:window.abrirCaixaInicial,whatsapp:rdWhats,proposta:window.rdProposta};if(r[p])r[p]();  setTimeout(aplicarTooltips,150);if(typeof aplicarPermissoes==='function')setTimeout(aplicarPermissoes,60);
}
function toggleAcc(el){
  const sub=el.nextElementSibling;
  const isOpen=el.classList.contains('open');
  // Close all others
  document.querySelectorAll('.nacc').forEach(a=>{a.classList.remove('open');if(a.nextElementSibling)a.nextElementSibling.classList.remove('open');});
  // Toggle this one
  if(!isOpen){el.classList.add('open');if(sub)sub.classList.add('open');}
}

function toggleSB(){document.getElementById('sb').classList.toggle('op');document.getElementById('sbov').classList.toggle('op');}
function closeSB(){document.getElementById('sb').classList.remove('op');document.getElementById('sbov').classList.remove('op');}
function toast(msg,type='ok'){const t=document.getElementById('toast-el');t.textContent=(type==='ok'?'✓ ':'✕ ')+msg;t.className='toast sh '+type;setTimeout(()=>t.className='toast',3000);}
function openLB(src){document.getElementById('lb-img').src=src;document.getElementById('lb').classList.add('op');}
function stab(btn,pid){if((pid==='teq-d'||pid==='teq-fin'||pid==='teq-impl')&&window._eqTravado){if(typeof reqSenha==='function'){reqSenha(function(){if(typeof _travarTabsEdicao==='function')_travarTabsEdicao(false);stab(btn,pid);});}return;}const wrap=btn.closest('.mb2')||btn.closest('.content')||document.body;wrap.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));wrap.querySelectorAll('.tab-p').forEach(p=>p.classList.remove('on'));btn.classList.add('on');document.getElementById(pid).classList.add('on');}
function quickAdd(){const m={dashboard:'m-eq',frota:'m-eq',manutencao:'m-mn',contratos:'m-ct',medicoes:'m-med',vendas:'m-venda',estoque:'m-estq',nf:'m-nf',despesas:'m-desp',checklist:'m-cl',usuarios:'m-usr'};openM(m[cur]||'m-eq');}

// ============ MODAL ============
function openM(id){popSels();if(id==='m-mn'){var _mne=document.getElementById('mn-eid');if(_mne)_mne.value='';mnLancs=[];mnClIs=[];mnFotos=[];mnPneus=[];const num=nextNum('os');document.getElementById('mn-num-label').textContent='OS-'+num;D._pendingOsNum='OS-'+num;rdMLanc();rdMCl();rdMFotos();if(typeof popPneusOS==='function')popPneusOS();if(typeof rdMnPneus==='function')rdMnPneus();if(typeof togProxRev==='function')togProxRev();}if(id==='m-cl'){clIMs=[];document.getElementById('cl-items-list').innerHTML='';var _cle=document.getElementById('cl-eid');if(_cle)_cle.value='';document.getElementById('cl-nm').value='';document.getElementById('cl-cat').selectedIndex=0;var _cit=document.getElementById('cl-import-txt');if(_cit)_cit.value='';var _cia=document.getElementById('cl-import-area');if(_cia)_cia.style.display='none';}if(id==='m-nf'){nfIs=[];rdNfIs();}if(id==='m-ct'){document.getElementById('ct-eid').value='';document.getElementById('ct-mtitle').textContent='📋 Contrato';}if(id==='m-estq'){document.getElementById('estq-eid').value='';document.getElementById('estq-mtitle').textContent='📦 Produto / Peça';}if(id==='m-desp'){document.getElementById('desp-eid').value='';document.getElementById('desp-mtitle').textContent='💸 Despesa / Compra';}if(id==='m-venda'){vdItems=[];document.getElementById('vd-items-list').innerHTML='';document.getElementById('vd-total').textContent='R$ 0,00';var _vde=document.getElementById('vd-eid');if(_vde)_vde.value='';var _vdt=document.getElementById('vd-mtitle');if(_vdt)_vdt.textContent='🛒 Venda de Peças/Serviços';}if(id==='m-med'){var _me=document.getElementById('med-eid');if(_me)_me.value='';var _mt=document.getElementById('med-tipo');if(_mt)_mt.value='cadastrado';if(typeof togMedTipo==='function')togMedTipo();window._medVendas=[];if(typeof _rdMedVendas==='function')_rdMedVendas();if(typeof calcMed==='function')calcMed();}document.getElementById(id).classList.add('op');if(window._edicaoLivre&&typeof aplicarEdicaoLivre==='function'){try{aplicarEdicaoLivre(document.getElementById(id));}catch(e){}}}
function closeM(id){if(id==='m-pneu-ent')window._pneuPendId=null;document.getElementById(id).classList.remove('op');}
function openNewEq(){
  if(typeof ehAdminAtual==='function' && !ehAdminAtual()){var _pm=(typeof permUsuarioAtual==='function')?permUsuarioAtual():{};if(_pm && _pm['doc-veiculo'] && !_pm['frota-criar']){if(typeof toast==='function')toast('No modo de documentos você não cadastra veículos novos — só edita os existentes.','er');return;}}
  eqFotos=[];eqArqs=[];
  document.querySelectorAll('#m-eq input, #m-eq textarea').forEach(function(el){if(el.type==='checkbox'||el.type==='radio')el.checked=false;else el.value='';});
  document.querySelectorAll('#m-eq select').forEach(function(el){el.selectedIndex=0;});
  var _c=document.querySelector('input[name="eq-cond"]');if(_c)_c.checked=true;
  document.getElementById('eq-eid').value='';document.getElementById('eq-mtitle').textContent='🚛 Veículo/Equipamento';
  rdEqFotos();rdEqArqs();if(typeof popEmpresas==='function')popEmpresas();
  if(typeof toggleParc==='function')toggleParc();if(typeof toggleImplemento==='function')toggleImplemento();
  if(typeof _travarTabsEdicao==='function')_travarTabsEdicao(false);
  document.getElementById('m-eq').classList.add('op');}



