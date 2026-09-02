// ============ ATUALIZAÇÃO INCREMENTAL (não perde dados) ============
// Sobrescreve sv() para usar UPSERT em vez de apagar e recriar
async function syncSalvarIncremental(modulo, lista) {
    if (!syncAtivo || !authToken) return;
    // Envia cada item individualmente com UPSERT
    for (const item of lista) {
        await apiCall('upsert', {modulo, item});
    }
}

// Backup automático a cada 2 horas em localStorage
function getBackupCfg(){
  if(!D.config.backup) D.config.backup={intervaloDias:1, horario:'23:00', ativo:true};
  return D.config.backup;
}
function agendarBackupAuto() {
    // Backup SEMPRE ao logar (qualquer usuário, qualquer dia/hora)
    fazerBackupAuto();
    // Durante a sessão: também faz no horário/intervalo configurado (caso fique aberto)
    setInterval(()=>verificarBackupAgendado(false), 5 * 60 * 1000);
}
function diasDesdeUltimoBackup(){
    const ultimo=localStorage.getItem('mh3_ultimo_backup_auto');
    if(!ultimo) return 9999; // nunca fez
    return (new Date()-new Date(ultimo))/(1000*60*60*24);
}
function verificarBackupAgendado(aoAbrir){
    const cfg=getBackupCfg();
    if(!cfg.ativo) return;
    const intervalo=cfg.intervaloDias||1;
    const dias=diasDesdeUltimoBackup();
    // Já cumpriu o intervalo? (ainda não está na hora de novo backup)
    if(dias < intervalo) return;
    const agora=new Date();
    const [h,m]=(cfg.horario||'23:00').split(':').map(Number);
    const passouHorario = agora.getHours()>h || (agora.getHours()===h && agora.getMinutes()>=m);
    // CATCH-UP: ao abrir o sistema, se está devendo backup (passou o intervalo)
    //   e já passou o horário de hoje OU está MUITO atrasado (mais de 1 dia além do intervalo),
    //   faz o backup atrasado na hora — não importa que horas são.
    if(aoAbrir){
        if(passouHorario || dias >= intervalo + 0.5){
            fazerBackupAuto();
        }
        return;
    }
    // Durante a sessão: só faz quando passar do horário configurado
    if(passouHorario) fazerBackupAuto();
}

function fazerBackupAuto() {
    try {
        const _leve = (typeof _dadosLeves==='function') ? _dadosLeves() : D;
        const snap = {ts: new Date().toISOString(), dados: _leve};
        // Mantém o último backup (leve, sem fotos/arquivos pesados)
        localStorage.setItem('mh3_autobackup', JSON.stringify(snap));
        // Mantém histórico dos últimos 2 backups (leves)
        let hist = [];
        try { hist = JSON.parse(localStorage.getItem('mh3_backup_hist')||'[]'); } catch(e){}
        hist.unshift({ts: snap.ts, dados: snap.dados});
        hist = hist.slice(0, 2);
        localStorage.setItem('mh3_backup_hist', JSON.stringify(hist));
        localStorage.setItem('mh3_ultimo_backup_auto', new Date().toISOString());
        console.log('[MH3] Auto-backup salvo:', new Date().toLocaleTimeString('pt-BR'));
    } catch(e) { console.warn('[MH3] Falha no backup:', e); }
}

function listarBackups() {
    try {
        const hist = JSON.parse(localStorage.getItem('mh3_backup_hist')||'[]');
        return hist;
    } catch(e) { return []; }
}

function restaurarBackupHist(idx) {
    const hist = listarBackups();
    if (!hist[idx]) { toast('Backup não encontrado','er'); return; }
    if (!confirm('Restaurar este backup? Os dados atuais serão substituídos.\n\nRecomendo fazer um backup atual antes.')) return;
    D = hist[idx].dados;
    sv();
    toast('Backup restaurado! Recarregando...','ok');
    setTimeout(()=>location.reload(), 1500);
}

// Verificar integridade dos dados
function verificarIntegridade() {
    const problemas = [];
    // Contratos sem equipamento válido
    D.contratos.forEach(c => {
        if(c.eqId && !D.equips.find(e=>e.id===c.eqId))
            problemas.push(`Contrato de ${c.cl} com veículo/equipamento não encontrado`);
    });
    // Medições sem contrato válido
    D.medicoes.forEach(m => {
        if(m.ctId && !D.contratos.find(c=>c.id===m.ctId))
            problemas.push(`Medição de ${m.cl} sem contrato vinculado`);
    });
    // OS sem equipamento válido
    D.manutencoes.forEach(m => {
        if(m.eqId && !D.equips.find(e=>e.id===m.eqId))
            problemas.push(`OS ${m.osNum||''} com veículo/equipamento não encontrado`);
    });
    if(problemas.length) {
        console.warn('[MH3] Problemas de integridade:', problemas);
        toast(`⚠️ ${problemas.length} inconsistência(s) encontrada(s) — verifique o console`,'er');
    }
    return problemas;
}

// Adiciona botão Restaurar Backup no menu Config
function rdCfgExtra() {
    const el = document.getElementById('pg-config');
    if(!el) return;
    if(typeof ehAdminAtual==='function' && ehAdminAtual()){
      if(!el.querySelector('#contas-email-area')){
      var ce=document.createElement('div'); ce.id='contas-email-area'; ce.className='panel'; ce.style.marginBottom='12px';
      ce.innerHTML='<div class="ph"><div class="pt">📧 Contas de E-mail (envio por usuário)</div></div>'+
        '<div class="pb">'+
        '<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Cadastre as contas e libere <b>uma para cada usuário</b>. Ao enviar uma medição/OS/mobilização, o sistema sai com a conta do usuário logado. As senhas ficam guardadas junto com as configurações do sistema.</p>'+
        '<div id="ce-lista" style="margin-bottom:12px"></div>'+
        '<div style="border-top:1px dashed var(--br);padding-top:10px">'+
          '<div style="font-size:12px;font-weight:700;margin-bottom:8px" id="ce-form-titulo">➕ Nova conta</div>'+
          '<input type="hidden" id="ce-id">'+
          '<div class="fr"><div class="fg"><label>Usuário liberado *</label><select id="ce-user"></select></div><div class="fg"><label>Apelido</label><input id="ce-apelido" placeholder="Ex.: Arthur — Comercial"></div></div>'+
          '<div class="fr"><div class="fg"><label>E-mail remetente *</label><input id="ce-remetente" placeholder="arthur@mh3rental.com.br"></div><div class="fg"><label>Nome remetente</label><input id="ce-nome" placeholder="Arthur Fraga"></div></div>'+
          '<div class="fr"><div class="fg"><label>Servidor de saída (SMTP) *</label><input id="ce-host" placeholder="email-ssl.com.br"></div><div class="fg"><label>Porta *</label><input id="ce-porta" type="number" value="587"></div></div>'+
          '<div class="fr"><div class="fg"><label>Segurança</label><select id="ce-seg"><option value="tls">TLS / STARTTLS (587)</option><option value="ssl">SSL (465)</option><option value="nenhuma">Nenhuma</option></select></div><div class="fg"><label>Login (usuário SMTP) *</label><input id="ce-login" placeholder="normalmente o próprio e-mail"></div></div>'+
          '<div class="fr"><div class="fg"><label>Senha *</label><input id="ce-senha" type="password" placeholder="senha da conta de e-mail"></div><div class="fg"><label>Ativa?</label><select id="ce-ativo"><option value="1">Sim</option><option value="0">Não</option></select></div></div>'+
          '<div style="border-top:1px solid var(--br);margin:10px 0 8px;padding-top:8px;font-size:12px;font-weight:700;color:var(--mt)">📥 RECEBIMENTO (para LER os e-mails na Caixa de Entrada)</div>'+
          '<div class="fr"><div class="fg"><label>Servidor de entrada (IMAP)</label><input id="ce-imap-host" placeholder="em branco = usar o mesmo da saída"></div><div class="fg"><label>Porta IMAP</label><input id="ce-imap-porta" type="number" placeholder="993"></div></div>'+
          '<div style="font-size:11px;color:var(--mt);margin:-4px 0 8px">É de onde o sistema LÊ os e-mails recebidos. Na Locaweb normalmente é o <b>mesmo servidor de saída</b> na <b>porta 993</b> (pode deixar em branco). Em alguns provedores o servidor de entrada começa com <b>imap.</b> (ex.: imap.gmail.com). Se os e-mails antigos aparecem mas os novos não, confira aqui o servidor de entrada correto.</div>'+
          '<div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn bp" onclick="salvarContaEmail()">💾 Salvar conta</button><button class="btn bw" onclick="testarContaEmail()">🔌 Testar conexão</button><button class="btn bg" onclick="limparFormContaEmail()">Limpar</button></div>'+
          '<p style="font-size:11px;color:var(--mt);margin-top:8px" id="ce-status"></p>'+
        '</div></div>';
      el.insertBefore(ce, el.firstChild);
      }
      if(!el.querySelector('#email-auto-area')){
      var ea=document.createElement('div'); ea.id='email-auto-area'; ea.className='panel'; ea.style.marginBottom='12px';
      ea.innerHTML='<div class="ph"><div class="pt">📨 Envio automático de e-mail</div></div><div class="pb"><p style="font-size:12px;color:var(--mt);margin-bottom:10px">Ligado = ao <b>salvar</b> o documento, o e-mail sai sozinho para o destinatário padrão. Desligado = você envia manualmente pelo botão 📧. (Defina o destino padrão no botão ⚙️ dentro da tela de envio.)</p><div class="fr"><div class="fg"><label>Medição</label><select id="ea-medicao"><option value="0">Manual (clico 📧)</option><option value="1">Automático ao salvar</option></select></div><div class="fg"><label>Ordem de Serviço (OS)</label><select id="ea-os"><option value="0">Manual (clico 📧)</option><option value="1">Automático ao salvar</option></select></div></div><div class="fr"><div class="fg"><label>Mobilização</label><select id="ea-mobilizacao"><option value="0">Manual (clico 📧)</option><option value="1">Automático ao salvar</option></select></div><div class="fg"></div></div><div class="fr"><div class="fg"><label>Cobrança (Contas a Receber)</label><select id="ea-cobranca"><option value="manual">Manual (botão 📧)</option><option value="auto">Automático após vencimento</option></select></div><div class="fg"><label>Horas após 00:00 do vencimento</label><input type="number" id="ea-cobranca-horas" value="6" min="0" style="width:100%"></div></div><p style="font-size:11px;color:var(--mt);margin-bottom:8px">Ex.: 6 = envia às 06:00 do dia do vencimento. 30 = 06:00 do dia seguinte. Vai para o e-mail do cliente (cadastre em Clientes).</p><div style="border-top:1px dashed var(--br);margin:10px 0;padding-top:10px"><div class="fr"><div class="fg"><label>📩 Confirmação de recebimento</label><select id="ea-confirmar"><option value="0">Não solicitar (padrão)</option><option value="1">Sempre solicitar</option></select></div><div class="fg"></div></div><p style="font-size:11px;color:var(--mt);margin-bottom:8px">Com <b>Sempre solicitar</b>, a opção já vem marcada na tela de envio (você ainda pode desmarcar em cada e-mail). O aviso chega na sua caixa quando o destinatário <b>abrir</b> o e-mail.</p></div><button class="btn bp" onclick="salvarEmailAuto()">💾 Salvar</button><p style="font-size:11px;color:var(--mt);margin-top:6px" id="ea-status"></p></div>';
      var ref=document.getElementById('contas-email-area'); if(ref&&ref.nextSibling) el.insertBefore(ea, ref.nextSibling); else el.insertBefore(ea, el.firstChild);
      }
      if(!el.querySelector('#email-modelos-area')){
      var em=document.createElement('div'); em.id='email-modelos-area'; em.className='panel'; em.style.marginBottom='12px';
      em.innerHTML='<div class="ph"><div class="pt">📝 Modelos de E-mail (mensagens prontas)</div></div><div class="pb">'+
        '<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Crie mensagens prontas (ex.: Cobrança, Medição) e libere <b>quais perfis</b> podem usar cada uma. Na tela de envio, o usuário escolhe só entre os modelos liberados para ele.</p>'+
        '<div id="em-modelos-lista" style="margin-bottom:12px"></div>'+
        '<div style="border-top:1px dashed var(--br);padding-top:10px">'+
          '<div style="font-size:12px;font-weight:700;margin-bottom:8px" id="em-mod-titulo">➕ Novo modelo</div>'+
          '<input type="hidden" id="em-mod-id">'+
          '<div class="fr"><div class="fg"><label>Nome do modelo *</label><input id="em-mod-nome" placeholder="Ex.: Cobrança"></div><div class="fg"><label>Assunto sugerido</label><input id="em-mod-assunto" placeholder="Ex.: Cobrança — MH3 Rental"></div></div>'+
          '<div class="fg"><label>Corpo da mensagem *</label><textarea id="em-mod-corpo" rows="4" placeholder="Escreva o texto do e-mail..."></textarea></div>'+
          '<div class="fg"><label>Liberar para os perfis:</label><div style="display:flex;gap:16px;flex-wrap:wrap;margin-top:4px">'+
            '<label style="font-size:12px;display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="em-mod-pf-financeiro"> Financeiro</label>'+
            '<label style="font-size:12px;display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="em-mod-pf-operacional"> Operacional</label>'+
            '<label style="font-size:12px;display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="em-mod-pf-admin"> Admin</label>'+
            '<label style="font-size:12px;display:flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;cursor:pointer"><input type="checkbox" id="em-mod-pf-motorista"> Motorista</label>'+
          '</div></div>'+
          '<div style="display:flex;gap:8px;margin-top:8px"><button class="btn bp" onclick="salvarModeloEmail()">💾 Salvar modelo</button><button class="btn bg" onclick="limparFormModeloEmail()">Limpar</button></div>'+
          '<p style="font-size:11px;color:var(--mt);margin-top:8px" id="em-mod-status"></p>'+
        '</div></div>';
      var refm=document.getElementById('email-auto-area'); if(refm&&refm.nextSibling) el.insertBefore(em, refm.nextSibling); else el.insertBefore(em, el.firstChild);
      }
      if(!el.querySelector('#cfg-banco-area')){
      var cba=document.createElement('div'); cba.id='cfg-banco-area'; cba.className='panel'; cba.style.marginBottom='12px';
      cba.innerHTML='<div class="ph"><div class="pt">🏦 Contas Bancárias</div></div><div class="pb"><p style="font-size:12px;color:var(--mt);margin-bottom:10px">Cadastre as contas bancárias da empresa. Elas aparecem no Fluxo de Caixa e nas baixas de pagamento/recebimento.</p><div id="cfg-banco-lista" style="margin-bottom:10px"></div><button class="btn bp" onclick="openContaBanco()">➕ Nova conta bancária</button></div>';
      var refb=document.getElementById('email-auto-area'); if(refb&&refb.nextSibling) el.insertBefore(cba, refb.nextSibling); else el.insertBefore(cba, el.firstChild);
      }
      if(window.carregarContasEmail) setTimeout(window.carregarContasEmail, 30);
      if(window.carregarEmailAuto) setTimeout(window.carregarEmailAuto, 40);
      if(window.carregarModelosEmail) setTimeout(window.carregarModelosEmail, 45);
      if(window.carregarBancosCfg) setTimeout(window.carregarBancosCfg, 50);
    }
    if(el.querySelector('#cfg-backup-area')) return;
    const div = document.createElement('div');
    div.id = 'cfg-backup-area';
    div.className = 'panel';
    div.style.marginBottom = '12px';
    div.innerHTML = `
    <div class="ph"><div class="pt">💾 Backup & Segurança</div></div>
    <div class="pb">
      <p style="font-size:12px;color:var(--mt);margin-bottom:14px">Faça backup regular dos dados. O arquivo JSON pode ser restaurado a qualquer momento.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn bs" onclick="fazerBackup()">💾 Fazer Backup Agora</button>
        <button class="btn bw" onclick="restaurarBackup()">📂 Restaurar de Arquivo</button>
        <button class="btn bg" onclick="verificarIntegridade();toast('Integridade verificada!','ok')">🔍 Verificar Integridade</button>
      </div>
      <div style="margin-top:14px;padding:12px;background:var(--cd2);border-radius:8px">
        <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">⚙️ Configurar Backup Automático</div>
        <div class="fr">
          <div class="fg"><label>Intervalo (dias)</label><input type="number" id="bkp-intervalo" min="1" placeholder="1"></div>
          <div class="fg"><label>Horário</label><input type="time" id="bkp-horario"></div>
          <div class="fg"><label>Ativo</label>
            <select id="bkp-ativo"><option value="sim">Sim</option><option value="nao">Não</option></select>
          </div>
          <div class="fg" style="display:flex;align-items:flex-end">
            <button class="btn bp btn-sm" onclick="salvarBackupCfg()" title="Salvar configuração do backup">Salvar</button>
          </div>
        </div>
        <p style="font-size:10px;color:var(--mt)">Ex: intervalo 1 dia + horário 23:00 = backup todo dia às 23h. O sistema precisa estar aberto no horário.</p>
      </div>
      <div style="margin-top:14px">
        <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">⏱️ Backups Automáticos Recentes</div>
        <div id="cfg-backup-hist" style="font-size:12px"></div>
      </div>
      <div style="margin-top:18px;padding:14px;border:2px solid var(--red);border-radius:8px;background:rgba(220,38,38,0.05)">
        <div style="font-size:13px;font-weight:700;color:var(--red);margin-bottom:6px">⚠️ ZONA DE PERIGO — Somente Administrador</div>
        <p style="font-size:12px;color:var(--mt);margin-bottom:10px">Apaga TODOS os dados operacionais (veículos/equipamentos, contratos, medições, clientes, financeiro). As configurações e usuários são mantidos. Um backup é feito automaticamente antes.</p>
        <button class="btn bd" onclick="apagarTodosDados()" title="Apagar todos os dados do sistema (irreversível)">🗑️ Apagar Todos os Dados do Sistema</button>
      </div>
      <div style="margin-top:14px;padding:10px 13px;background:var(--cd2);border:1px solid rgba(34,197,94,.2);border-radius:6px;">
        <div style="font-size:11px;color:var(--gn);font-weight:600;margin-bottom:6px;">🔒 Segurança ativa</div>
        <div style="font-size:11px;color:var(--mt);line-height:1.7;">
          ✓ Conexão SSL/HTTPS criptografada<br>
          ✓ Autenticação por token de sessão (${SESSION_HOURS||12}h)<br>
          ✓ Backup automático local a cada 2 horas<br>
          ✓ Backup diário automático na Locaweb<br>
          ✓ Log de todas as ações no sistema<br>
          ✓ Senha de administrador para exclusões
        </div>
      </div>
    </div>`;
    // Prepend to config page
    el.insertBefore(div, el.firstChild);
    if(!el.querySelector('#cfg-logoff-area')){
      const dz=document.createElement('div'); dz.id='cfg-logoff-area'; dz.className='panel'; dz.style.marginBottom='12px';
      const cur=(D.config&&D.config.logoffMin)||0;
      dz.innerHTML=`<div class="ph"><div class="pt">⏱️ Logoff automático por inatividade</div></div><div class="pb"><p style="font-size:12px;color:var(--mt);margin-bottom:10px">Desconecta o usuário automaticamente após alguns minutos sem uso (mouse/teclado). Deixe <b>0</b> para desativar.</p><div style="display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap"><div class="fg"><label>Minutos de inatividade</label><input type="number" id="cfg-logoff-min" min="0" max="480" value="${cur}" style="width:120px;background:var(--cd2);border:1px solid var(--br);border-radius:6px;color:var(--tx);padding:8px 10px"></div><button class="btn bp" onclick="salvarLogoffMin()">Salvar</button></div><p style="font-size:11px;color:var(--mt);margin-top:8px" id="cfg-logoff-status">${cur>0?('✅ Ativo: desconecta após '+cur+' min sem uso.'):'⚪ Desativado.'}</p></div>`;
      el.insertBefore(dz, el.firstChild);
    }
    if(!el.querySelector('#cfg-antigo-area')){
      const da=document.createElement('div'); da.id='cfg-antigo-area'; da.className='panel'; da.style.marginBottom='12px';
      da.innerHTML='<div class="ph"><div class="pt">🏷️ Marcar lançamentos importados como ANTIGO</div></div><div class="pb"><p style="font-size:12px;color:var(--mt);margin-bottom:10px">Marca todas as receitas e despesas atuais como <b>ANTIGO</b> (histórico importado), para diferenciar dos lançamentos novos. Os próximos imports já vêm marcados automaticamente.</p><button class="btn bp" onclick="marcarImportadosAntigos()">🏷️ Marcar dados atuais como ANTIGO</button><p style="font-size:11px;color:var(--mt);margin-top:8px" id="cfg-antigo-status"></p></div>';
      el.insertBefore(da, el.firstChild);
    }
    renderBackupHist();
}


function salvarBackupCfg(){
  const cfg=getBackupCfg();
  cfg.intervaloDias=parseInt(document.getElementById('bkp-intervalo').value)||1;
  cfg.horario=document.getElementById('bkp-horario').value||'23:00';
  cfg.ativo=document.getElementById('bkp-ativo').value==='sim';
  sv();
  auditar('ALTERACAO','sistema','Backup configurado: a cada '+cfg.intervaloDias+' dia(s) às '+cfg.horario+(cfg.ativo?'':' (DESATIVADO)'));
  toast('Configuração de backup salva! A cada '+cfg.intervaloDias+' dia(s) às '+cfg.horario,'ok');
}
function carregarBackupCfg(){
  const cfg=getBackupCfg();
  const i=document.getElementById('bkp-intervalo'); if(i)i.value=cfg.intervaloDias||1;
  const h=document.getElementById('bkp-horario'); if(h)h.value=cfg.horario||'23:00';
  const a=document.getElementById('bkp-ativo'); if(a)a.value=cfg.ativo===false?'nao':'sim';
}

function renderBackupHist() {
    if(typeof carregarBackupCfg==="function")carregarBackupCfg();
    const el = document.getElementById('cfg-backup-hist');
    if (!el) return;
    const hist = (typeof listarBackups==='function') ? listarBackups() : [];
    if (!hist.length) { el.innerHTML = '<span style="color:var(--mt)">Nenhum backup automático ainda. O primeiro é feito ao abrir o sistema.</span>'; return; }
    el.innerHTML = hist.map((b,i)=>{
        const d = new Date(b.ts);
        const qtd = (b.dados&&b.dados.equips?b.dados.equips.length:0);
        return `<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:var(--cd2);border-radius:6px;margin-bottom:5px">
            <span>📦 ${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})} — ${qtd} veíc./equip.</span>
            <button class="btn bw btn-xs" onclick="restaurarBackupHist(${i})" title="Restaurar este backup">↩️ Restaurar</button>
        </div>`;
    }).join('');
}
const SESSION_HOURS = 12;

// Logo personalizada
function carregarLogo() {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept= 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            localStorage.setItem('mh3_logo', ev.target.result);
            aplicarLogo(ev.target.result);
            toast('Logo atualizada!','ok');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function aplicarLogo(src) {
    if(!src) return;
    // Atualiza logo do menu lateral
    const img = document.getElementById('logo-img');
    if(img && img.tagName==='IMG') img.src = src;
    // Atualiza logo da tela de login se existir
    const loginImg = document.querySelector('#login-screen img, .login-logo');
    if(loginImg && loginImg.tagName==='IMG') loginImg.src = src;
}

