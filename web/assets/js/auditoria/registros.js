// ============ AUDITORIA ============
let auditDados = [];

async function rdAudit() {
    // Verifica se é admin
    if (!authUser || authUser.perfil !== 'admin') {
        document.getElementById('pg-auditoria').innerHTML = '<div class="ab a-rd" style="margin:20px">🔒 Acesso restrito ao administrador do sistema.</div>';
        return;
    }

    try{_popFiltrosAudit();}catch(e){}

    // Resumo por usuário
    const res = await apiCall('auditoria_resumo');
    if (!res.ok) { toast('Erro ao carregar auditoria','er'); return; }

    // Render resumo
    const el = document.getElementById('audit-resumo');
    if (el && res.por_usuario) {
        el.innerHTML = `<div class="tw"><table><thead><tr>
            <th>Usuário</th><th>Perfil</th><th>Total Ações</th><th>Criações</th><th>Edições</th><th>Exclusões</th><th>Logins</th><th>Último Acesso</th>
        </tr></thead><tbody>
        ${res.por_usuario.map(u=>`<tr>
            <td><b>${u.usuario_nome||'-'}</b></td>
            <td>${u.usuario_perfil||'-'}</td>
            <td style="font-weight:700;color:var(--bl)">${u.acoes}</td>
            <td style="color:var(--gn)">${u['criações']||0}</td>
            <td style="color:var(--yw)">${u.edicoes||0}</td>
            <td style="color:${u.exclusoes>0?'var(--red)':'var(--mt)'};font-weight:${u.exclusoes>0?'700':'400'}">${u.exclusoes||0}</td>
            <td style="color:var(--mt)">${u.logins||0}</td>
            <td style="font-size:11px;color:var(--mt)">${u.ultimo_acesso||'-'}</td>
        </tr>`).join('')}
        </tbody></table></div>`;
    }

    // Carrega log detalhado
    window._auditFiltrosProntos=false;
    window._auditAll=null;
    filtrarAudit();
}

// Marca movimentações sensíveis/suspeitas para destaque na auditoria
function _ehSuspeito(r){
  if(!r) return false;
  var a=String(r.acao||'').toUpperCase();
  var d=String(r.descricao||'').toLowerCase();
  var m=String(r.modulo||'').toLowerCase();
  if(a==='EXCLUSAO'||a==='EXCLUIR') return true;                 // qualquer exclusão
  if(a==='SENHA_ALTERADA') return true;                          // troca/reset de senha
  if(d.indexOf('saldo')>=0||d.indexOf('acerto')>=0||d.indexOf('ajust')>=0) return true; // acerto de saldo
  if((a==='ALTERACAO'||a==='EDITAR') && (m==='financeiro'||m==='cpagar'||m==='creceber'||m==='fin'||d.indexOf('valor')>=0)) return true; // alteração financeira
  return false;
}
async function filtrarAudit() {
    // Carrega TODOS os registros UMA vez e filtra no próprio navegador (nunca dá erro de filtragem).
    if (!Array.isArray(window._auditAll)) {
        const res = await apiCall('auditoria&limite=500');
        if (!res || !res.ok) { toast('Não consegui carregar a auditoria. Use o botão Atualizar.','er'); return; }
        window._auditAll = res.dados || [];
    }
    const user = (document.getElementById('af-user')?.value || '').toLowerCase();
    const mod  = document.getElementById('af-mod')?.value || '';
    const acao = document.getElementById('af-acao')?.value || '';
    const mes  = document.getElementById('af-mes')?.value || '';
    const soSusp = !!(document.getElementById('af-susp') && document.getElementById('af-susp').checked);
    auditDados = (window._auditAll||[]).filter(function(r){
        if (user && String(r.usuario_nome||'').toLowerCase() !== user) return false;
        if (mod  && r.modulo !== mod) return false;
        if (acao && r.acao !== acao) return false;
        if (mes  && String(r.criado_em||'').slice(0,7) !== mes) return false;
        if (soSusp && !_ehSuspeito(r)) return false;
        return true;
    });
    var _nSusp = auditDados.filter(_ehSuspeito).length;
    var _spEl = document.getElementById('audit-susp'); if(_spEl) _spEl.textContent = _nSusp ? ('· ⚠️ '+_nSusp+' suspeita(s) no período') : '';
    if(!window._auditFiltrosProntos){try{_popFiltrosAudit();}catch(e){} window._auditFiltrosProntos=true;}

    const tb = document.getElementById('audit-tb');
    const totEl = document.getElementById('audit-total');
    if (totEl) totEl.textContent = auditDados.length + ' registro(s)';

    if (!auditDados.length) {
        tb.innerHTML = '<tr><td colspan="8" class="empty">Nenhum registro encontrado</td></tr>';
        return;
    }

    const corAcao = {
        'CRIAR':'b-gn','EDITAR':'b-yw','EXCLUIR':'b-rd','LOGIN_OK':'b-bl',
        'CRIACAO':'b-gn','ALTERACAO':'b-yw','EXCLUSAO':'b-rd',
        'BACKUP_GERADO':'b-pu','LOGIN_FALHOU':'b-rd','SENHA_ALTERADA':'b-or'
    };
    const lblAcao = {
        'CRIAR':'➕ Criação','EDITAR':'✏️ Edição','EXCLUIR':'🗑 Exclusão',
        'CRIACAO':'➕ Criação','ALTERACAO':'✏️ Edição','EXCLUSAO':'🗑 Exclusão',
        'LOGIN_OK':'🔓 Login','LOGIN_FALHOU':'⚠️ Login Falhou',
        'BACKUP_GERADO':'💾 Backup','SENHA_ALTERADA':'🔑 Senha','SALVAR':'💾 Sync','UPSERT':'💾 Atualiz.'
    };

    tb.innerHTML = auditDados.map((r,i) => `<tr style="${_ehSuspeito(r)?'background:rgba(239,68,68,.10)':''}">
        <td style="font-size:11px;white-space:nowrap">${_ehSuspeito(r)?'<span title="Movimentação sensível">⚠️</span> ':''}${r.criado_em||'-'}</td>
        <td><b>${r.usuario_nome||'-'}</b></td>
        <td style="font-size:11px;color:var(--mt)">${r.usuario_perfil||'-'}</td>
        <td><span class="badge ${corAcao[r.acao]||'b-gr'}">${lblAcao[r.acao]||r.acao}</span></td>
        <td style="font-size:11px">${r.modulo||'-'}</td>
        <td style="font-size:11px;color:var(--mt);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.descricao||''}">${r.descricao||'-'}</td>
        <td style="font-size:10px;color:var(--mt)">${r.ip||'-'}</td>
        <td>${(r.dado_antes||r.dado_depois)?`<button class="btn bcy btn-xs" onclick="verDetalheAudit(${i})">🔍 Ver</button>`:''}</td>
    </tr>`).join('');
}

function _popFiltrosAudit(){
  var selU=document.getElementById('af-user'), selA=document.getElementById('af-acao'), selM=document.getElementById('af-mod');
  // USUÁRIOS: dos cadastrados + dos registros carregados
  if(selU && selU.tagName==='SELECT'){
    var nomes=[];
    (D.usuarios||[]).forEach(function(u){var n=u.nm||u.nome; if(n&&nomes.indexOf(n)<0)nomes.push(n);});
    (typeof auditDados!=='undefined'?auditDados:[]||[]).forEach(function(r){var n=r&&r.usuario_nome; if(n&&nomes.indexOf(n)<0)nomes.push(n);});
    nomes.sort(function(a,b){return String(a).localeCompare(String(b));});
    var atuU=selU.value;
    selU.innerHTML='<option value="">Todos os usuários</option>'+nomes.map(function(n){return '<option value="'+escH(n)+'">'+escH(n)+'</option>';}).join('');
    if(atuU)selU.value=atuU;
  }
  // AÇÕES: lista conhecida + as que aparecerem nos registros
  if(selA && selA.tagName==='SELECT'){
    var lblA={'CRIACAO':'➕ Criação','ALTERACAO':'✏️ Edição','EXCLUSAO':'🗑 Exclusão','LOGIN_OK':'🔓 Login','LOGIN_FALHOU':'⚠️ Login Falhou','SENHA_ALTERADA':'🔑 Senha','BACKUP_GERADO':'💾 Backup','SALVAR':'💾 Sync'};
    var acs=['CRIACAO','ALTERACAO','EXCLUSAO','LOGIN_OK','LOGIN_FALHOU','SENHA_ALTERADA'];
    (typeof auditDados!=='undefined'?auditDados:[]||[]).forEach(function(r){var a=r&&r.acao; if(a&&acs.indexOf(a)<0)acs.push(a);});
    var atuA=selA.value;
    selA.innerHTML='<option value="">Todas as ações</option>'+acs.map(function(a){return '<option value="'+escH(a)+'">'+escH(lblA[a]||a)+'</option>';}).join('');
    if(atuA)selA.value=atuA;
  }
  // MÓDULOS: lista conhecida + os que aparecerem nos registros
  if(selM && selM.tagName==='SELECT'){
    var lblM={'frota':'Frota','financeiro':'Financeiro','contratos':'Contratos','medicoes':'Medições','estoque':'Estoque','clientes':'Clientes','funcionarios':'Funcionários','mobilizacao':'Mobilização','manut':'Manutenção','usuarios':'Usuários','config':'Configurações','empresas':'Empresas','checklist':'Checklist','vendas':'Vendas','tratativas':'Tratativas','seguros':'Seguros'};
    var mods=['frota','financeiro','contratos','medicoes','estoque','clientes','funcionarios','mobilizacao','manut','vendas','tratativas','seguros','config'];
    (typeof auditDados!=='undefined'?auditDados:[]||[]).forEach(function(r){var m=r&&r.modulo; if(m&&mods.indexOf(m)<0)mods.push(m);});
    var atuM=selM.value;
    selM.innerHTML='<option value="">Todos os módulos</option>'+mods.map(function(m){return '<option value="'+escH(m)+'">'+escH(lblM[m]||m)+'</option>';}).join('');
    if(atuM)selM.value=atuM;
  }
  // MESES: a partir das datas dos registros (mais recente primeiro)
  var selMes=document.getElementById('af-mes');
  if(selMes && selMes.tagName==='SELECT'){
    var meses=[];
    (window._auditAll||(typeof auditDados!=='undefined'?auditDados:[])||[]).forEach(function(r){
      var mm=String(r&&r.criado_em||'').slice(0,7);
      if(mm.length===7 && meses.indexOf(mm)<0) meses.push(mm);
    });
    meses.sort(function(a,b){return b.localeCompare(a);});
    var atuMes=selMes.value;
    selMes.innerHTML='<option value="">Todos os meses</option>'+meses.map(function(mm){var p=mm.split('-');return '<option value="'+mm+'">'+p[1]+'/'+p[0]+'</option>';}).join('');
    if(atuMes)selMes.value=atuMes;
  }
}

function verDetalheAudit(idx) {
    const r = auditDados[idx];
    if (!r) return;
    const corAcao = {'CRIAR':'var(--gn)','EDITAR':'var(--yw)','EXCLUIR':'var(--red)'};
    const cor = corAcao[r.acao] || 'var(--bl)';

    let html = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
        <div class="rel-card"><div class="stat-label">Usuário</div><div class="stat-value" style="font-size:15px">${r.usuario_nome}</div><div style="font-size:11px;color:var(--mt)">${r.usuario_perfil}</div></div>
        <div class="rel-card"><div class="stat-label">Ação</div><div class="stat-value" style="color:${cor};font-size:15px">${r.acao}</div></div>
        <div class="rel-card"><div class="stat-label">Módulo</div><div class="stat-value">${r.modulo||'-'}</div></div>
        <div class="rel-card"><div class="stat-label">Data/Hora</div><div class="stat-value" style="font-size:13px">${r.criado_em}</div></div>
        <div class="rel-card"><div class="stat-label">IP de Acesso</div><div class="stat-value">${r.ip||'-'}</div></div>
        <div class="rel-card"><div class="stat-label">Descrição</div><div class="stat-value" style="font-size:12px">${r.descricao||'-'}</div></div>
    </div>`;

    if (r.dado_antes && r.acao === 'EXCLUIR') {
        html += `<div class="rel-card" style="border-color:rgba(200,16,46,.3);background:rgba(200,16,46,.05)">
            <div style="font-size:11px;font-weight:700;color:var(--red);margin-bottom:8px">🗑 DADO EXCLUÍDO (o que foi apagado)</div>
            <div style="font-size:11px;font-family:monospace;line-height:1.7;white-space:pre-wrap;color:var(--tx);overflow:auto;max-height:250px">${formatAuditObj(r.dado_antes)}</div>
        </div>`;
    }
    if (r.dado_antes && r.acao === 'EDITAR') {
        html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <div class="rel-card" style="border-color:rgba(245,158,11,.3)">
                <div style="font-size:11px;font-weight:700;color:var(--yw);margin-bottom:8px">📄 ANTES da edição</div>
                <div style="font-size:11px;font-family:monospace;line-height:1.7;white-space:pre-wrap;color:var(--tx);overflow:auto;max-height:200px">${formatAuditObj(r.dado_antes)}</div>
            </div>
            <div class="rel-card" style="border-color:rgba(34,197,94,.3)">
                <div style="font-size:11px;font-weight:700;color:var(--gn);margin-bottom:8px">✅ DEPOIS da edição</div>
                <div style="font-size:11px;font-family:monospace;line-height:1.7;white-space:pre-wrap;color:var(--tx);overflow:auto;max-height:200px">${formatAuditObj(r.dado_depois)}</div>
            </div>
        </div>`;
    }
    if (r.dado_depois && r.acao === 'CRIAR') {
        html += `<div class="rel-card" style="border-color:rgba(34,197,94,.3)">
            <div style="font-size:11px;font-weight:700;color:var(--gn);margin-bottom:8px">➕ DADO CRIADO</div>
            <div style="font-size:11px;font-family:monospace;line-height:1.7;white-space:pre-wrap;color:var(--tx);overflow:auto;max-height:250px">${formatAuditObj(r.dado_depois)}</div>
        </div>`;
    }

    document.getElementById('audit-det-body').innerHTML = html;
    openM('m-audit-det');
}

function formatAuditObj(obj) {
    if (!obj) return '-';
    const skip = ['fotos','arqs']; // pula campos grandes
    const lines = [];
    for (const [k,v] of Object.entries(obj)) {
        if (skip.includes(k)) { lines.push(`${k}: [arquivo]`); continue; }
        if (typeof v === 'object' && v !== null) {
            if (Array.isArray(v)) lines.push(`${k}: [${v.length} itens]`);
            else lines.push(`${k}: {objeto}`);
        } else {
            lines.push(`${k}: ${v||'-'}`);
        }
    }
    return lines.join('\n');
}
window.abrirCaixaNovaAba=function(){
  try{
    if(typeof authUser!=='undefined' && authUser){
      localStorage.setItem('mh3_sess_temp', JSON.stringify({user:authUser, token:(typeof authToken!=='undefined'?authToken:''), t:Date.now()}));
    }
    var u=location.pathname+'?p=caixaemail&sess=1';
    var w=window.open(u,'_blank');
    if(!w){ if(typeof toast==='function')toast('O navegador bloqueou a nova janela. Permita pop-ups para este site e tente de novo.','er'); }
  }catch(e){ if(typeof toast==='function')toast('Não foi possível abrir a nova janela.','er'); }
};
function init(){
  ld();
  // "Abrir em nova janela": aceita uma sessão passada pela janela de origem (uso único, expira em 30s)
  try{
    var _ps=new URLSearchParams(location.search);
    if(_ps.get('sess')==='1'){
      var _raw=localStorage.getItem('mh3_sess_temp');
      localStorage.removeItem('mh3_sess_temp'); // uso único — remove imediatamente
      if(_raw){
        var _s=JSON.parse(_raw);
        if(_s && _s.user && (Date.now()-(_s.t||0) < 30000)){
          authUser=_s.user; authToken=_s.token||'';
          localStorage.setItem('mh3_user', JSON.stringify(authUser));
          if(authToken) localStorage.setItem('mh3_token', authToken);
          document.getElementById('login-screen').style.display='none';
          entrarSistema(authUser.nome, authUser.perfil);
          _initCore();
          return;
        }
      }
    } else {
      localStorage.removeItem('mh3_sess_temp'); // limpeza em qualquer abertura normal
    }
  }catch(e){}
  // Sem token salvo — mostra login direto
  localStorage.removeItem('mh3_token');
  localStorage.removeItem('mh3_user');
  authToken = '';
  authUser = null;
  document.getElementById('login-screen').style.display = 'flex';
  if(typeof carregarCredLogin==='function')carregarCredLogin();
  if(typeof verificarServidorLogin==='function')verificarServidorLogin();
  _initCore();
}
function _initCore(){
  // === ÚLTIMA ATUALIZAÇÃO DO SOFTWARE — alterar esta data/hora a cada nova versão entregue ===
  window.APP_BUILD = '19/06/2026 às 04h00';
  (function(){
    var b=window.APP_BUILD;
    var e1=document.getElementById('app-build'); if(e1)e1.textContent='versão '+b;
    var e2=document.getElementById('dash-build'); if(e2)e2.textContent=b;
    var e3=document.getElementById('login-build'); if(e3)e3.textContent='🔄 Última atualização: '+b;
  })();
  // Backup automático local
  agendarBackupAuto();
  // Carrega logo salva
  const logoSalva = localStorage.getItem('mh3_logo');
  if(logoSalva) aplicarLogo(logoSalva);
  // Adiciona área de backup em config
  setTimeout(rdCfgExtra, 500);
const now=new Date();document.getElementById('tdate').textContent=now.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});const td=today();['ct-ini','mn-en','cot-dt','nf-dt','desp-dt','rev-dt','vd-dt'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=td;});document.getElementById('med-ms').value=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');document.querySelector('.lb-x').onclick=()=>document.getElementById('lb').classList.remove('op');updPendCnt();updTratCnt();rdDash();}
function addMobFotos(inp, tipo){
  const grid = document.getElementById(tipo==='out'?'eq-mob-out-grid':'eq-mob-ret-grid');
  Array.from(inp.files).forEach(f=>{
    const r=new FileReader();
    r.onload=e=>{
      const img=document.createElement('img');
      img.src=e.target.result;
      img.style.cssText='width:60px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer';
      grid.insertBefore(img,grid.querySelector('label'));
    };
    r.readAsDataURL(f);
  });
}

function loadMobChecklist(){
  const id=document.getElementById('eq-mob-cl').value;
  const cl=D.checklists.find(c=>c.id===id);
  const el=document.getElementById('eq-mob-cl-items');
  if(!cl||!el){if(el)el.innerHTML='';return;}
  el.innerHTML=(cl.its||[]).map((item,i)=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--cd);border-radius:6px;margin-bottom:6px">
      <input type="checkbox" id="mob-cl-${i}" style="width:18px;height:18px">
      <label for="mob-cl-${i}" style="font-size:13px;flex:1">${item}</label>
      <span id="mob-cl-ok-${i}" style="font-size:11px;color:var(--gn)"></span>
    </div>
  `).join('');
  // Add OK button behavior
  el.querySelectorAll('input[type=checkbox]').forEach((cb,i)=>{
    cb.onchange=()=>{
      const ok=document.getElementById('mob-cl-ok-'+i);
      if(ok) ok.textContent=cb.checked?'✓ OK':'';
    };
  });
}

