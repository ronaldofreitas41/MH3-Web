// ---- CONTAS A PAGAR / RECEBER (páginas separadas) ----


function badgeAntigo(x){ return (x&&x.antigo)?' <span class="badge" title="Lançamento importado (histórico anterior)" style="background:rgba(120,120,120,.18);color:#888;font-size:8px;font-weight:800;padding:1px 6px;border-radius:6px;vertical-align:middle">ANTIGO</span>':''; }
function marcarImportadosAntigos(){
  if(!confirm('Marcar TODAS as receitas (medições/vendas) e despesas (despesas/NFs) atuais como ANTIGO (importação inicial)?\n\nIsto facilita distinguir o histórico importado dos lançamentos novos. Os lançamentos que você criar a partir de agora NÃO serão marcados.')) return;
  let n=0;
  ['despesas','nfs','medicoes','vendas'].forEach(mod=>{(D[mod]||[]).forEach(x=>{ if(!x.antigo){x.antigo=true;n++;} });});
  sv();
  if(typeof rdContasPagar==='function')rdContasPagar();
  if(typeof rdContasReceber==='function')rdContasReceber();
  if(typeof rdFin==='function')rdFin();
  const st=document.getElementById('cfg-antigo-status'); if(st)st.textContent='✅ '+n+' lançamento(s) marcado(s) como ANTIGO.';
  toast(n+' lançamentos marcados como ANTIGO','ok');
}

// ---- FILTRO REUTILIZÁVEL POR VENCIMENTO ----
const _filtroVenc={cp:'venc-asc',cr:'venc-asc'};
function setFiltroVenc(key,val){
  _filtroVenc[key]=val;
  const de=document.getElementById('fv-'+key+'-de'), ate=document.getElementById('fv-'+key+'-ate');
  const show=(val==='periodo')?'':'none';
  if(de)de.style.display=show; if(ate)ate.style.display=show;
  if(key==='cp'&&typeof rdContasPagar==='function')rdContasPagar();
  if(key==='cr'&&typeof rdContasReceber==='function')rdContasReceber();
}
function _dataNum(d){
  if(!d) return 0;
  d=String(d).trim();
  let m=d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);            // ISO AAAA-MM-DD
  if(m) return parseInt(m[1]+String(m[2]).padStart(2,'0')+String(m[3]).padStart(2,'0'));
  m=d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);            // BR DD/MM/AAAA ou DD/MM/AA
  if(m){ let y=m[3]; if(y.length===2)y='20'+y; return parseInt(y+String(m[2]).padStart(2,'0')+String(m[1]).padStart(2,'0')); }
  return 0;
}
function aplicarFiltroVenc(items,key,campo){
  campo=campo||'vc';
  const modo=_filtroVenc[key]||'venc-asc';
  const h=new Date();
  const hojeN=h.getFullYear()*10000+(h.getMonth()+1)*100+h.getDate();
  const mesIni=h.getFullYear()*10000+(h.getMonth()+1)*100+1;
  const mesFim=h.getFullYear()*10000+(h.getMonth()+1)*100+31;
  const num=(x)=>_dataNum(x[campo]);
  const asc=(a,b)=>{const na=num(a)||99999999, nb=num(b)||99999999; return na-nb;};
  let arr=items.slice();
  if(modo==='vencidos'){ arr=arr.filter(x=>{const n=num(x);return n&&n<hojeN&&x.st!=='pago'&&x.st!=='paga';}).sort(asc); }
  else if(modo==='hoje'){ arr=arr.filter(x=>num(x)===hojeN).sort(asc); }
  else if(modo==='mes'){ arr=arr.filter(x=>{const n=num(x);return n>=mesIni&&n<=mesFim;}).sort(asc); }
  else if(modo==='periodo'){
    const deN=_dataNum((document.getElementById('fv-'+key+'-de')||{}).value);
    const ateN=_dataNum((document.getElementById('fv-'+key+'-ate')||{}).value);
    arr=arr.filter(x=>{const n=num(x);if(!n)return false;if(deN&&n<deN)return false;if(ateN&&n>ateN)return false;return true;}).sort(asc);
  }
  else if(modo==='venc-desc'){ arr.sort((a,b)=>(num(b)||0)-(num(a)||0)); }
  else { arr.sort(asc); }   // venc-asc (crescente)
  return arr;
}
function filtroVencBar(key){
  return '<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px;font-size:12px">'+
    '<span style="color:var(--mt)">🔻 Vencimento:</span>'+
    '<select id="fv-'+key+'" onchange="setFiltroVenc(\''+key+'\',this.value)" style="font-size:12px;padding:6px 9px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)">'+
    '<option value="venc-asc">Crescente (mais próximo primeiro)</option>'+
    '<option value="venc-desc">Decrescente (mais distante primeiro)</option>'+
    '<option value="vencidos">Somente vencidos</option>'+
    '<option value="hoje">Do dia (hoje)</option>'+
    '<option value="mes">Este mês</option>'+
    '<option value="periodo">Período personalizado</option>'+
    '</select>'+
    '<input type="date" id="fv-'+key+'-de" style="display:none;font-size:12px;padding:5px 7px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" onchange="setFiltroVenc(\''+key+'\',\'periodo\')">'+
    '<input type="date" id="fv-'+key+'-ate" style="display:none;font-size:12px;padding:5px 7px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" onchange="setFiltroVenc(\''+key+'\',\'periodo\')">'+
    '</div>';
}

function podeEnviarEmail(){ return (typeof temAcesso==='function') ? temAcesso('enviar-email') : true; }
function enviarEmailCR(id,tipo){ var rec=(tipo==='med'?D.medicoes:D.vendas).find(function(x){return x.id===id;}); if(!rec){toast('Registro não encontrado','er');return;} window.abrirEnvioEmailLanc(tipo==='med'?'medicao':'venda', rec); }
function enviarEmailCP(id,tipo){ var rec=(tipo==='NF'?D.nfs:D.despesas).find(function(x){return x.id===id;}); if(!rec){toast('Registro não encontrado','er');return;} window.abrirEnvioEmailLanc('conta_pagar', rec); }
function enviarEmailOS(id){ var rec=(D.manutencoes||[]).find(function(x){return x.id===id;}); if(!rec){toast('OS não encontrada','er');return;} window.abrirEnvioEmailLanc('os', rec); }
function verContaLanc(id,tipo){
  if(tipo==='NF') return verNf(id);
  if(tipo==='Despesa') return verDesp(id);
  if(tipo==='med') return verMed(id);
  if(tipo==='venda') return verVenda(id);
}
// ===== Item 7: alterar lançamento (Contas a Pagar/Receber) com justificativa + senha; excluir só admin =====
function _achaLanc(id, ctx){
  var arr=null, vf='vl';
  if(ctx==='NF'){ arr=D.nfs; vf='vl'; }
  else if(ctx==='Despesa'){ arr=D.despesas; vf='vl'; }
  else if(ctx==='med'){ arr=D.medicoes; vf='total'; }
  else if(ctx==='venda'){ arr=D.vendas; vf='total'; }
  if(!arr) return null;
  var obj=arr.find(function(x){ return x.id===id; });
  if(!obj) return null;
  var nome=obj.desc||obj.cl||obj.cli||obj.forn||'Lançamento';
  return { obj:obj, arr:arr, vf:vf, nome:nome };
}
function abrirAlterarLanc(id, ctx){
  var r=_achaLanc(id, ctx);
  if(!r){ if(typeof toast==='function') toast('Lançamento não encontrado','er'); return; }
  var valAtual=parseFloat(r.obj[r.vf]||0)||0;
  var vcAtual=r.obj.vc||'';
  window._altLancCtx={ id:id, ctx:ctx };
  var ov=document.getElementById('mh3-alt-lanc'); if(ov) ov.remove();
  ov=document.createElement('div');
  ov.id='mh3-alt-lanc';
  ov.style.cssText='position:fixed;inset:0;z-index:99998;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px;';
  var nomeSafe=(r.nome||'').replace(/</g,'&lt;');
  ov.innerHTML=`<div style="background:var(--cd,#fff);color:var(--tx,#1e293b);border-radius:12px;max-width:420px;width:100%;padding:18px;box-shadow:0 10px 40px rgba(0,0,0,.4);font-family:sans-serif">
    <div style="font-size:16px;font-weight:800;margin-bottom:3px">✏️ Alterar lançamento</div>
    <div style="font-size:12px;color:var(--mt,#64748b);margin-bottom:14px">${nomeSafe}</div>
    <label style="font-size:11px;font-weight:700;color:var(--mt,#64748b)">Valor (R$)</label>
    <input id="alt-lanc-valor" type="number" step="0.01" value="${valAtual}" style="width:100%;padding:9px;margin:3px 0 12px;border:1px solid var(--br,#e2e8f0);border-radius:7px;font-size:14px;color:var(--tx,#1e293b);background:var(--cd2,#f8fafc)">
    <label style="font-size:11px;font-weight:700;color:var(--mt,#64748b)">Vencimento</label>
    <input id="alt-lanc-vc" type="date" value="${vcAtual}" style="width:100%;padding:9px;margin:3px 0 12px;border:1px solid var(--br,#e2e8f0);border-radius:7px;font-size:14px;color:var(--tx,#1e293b);background:var(--cd2,#f8fafc)">
    <label style="font-size:11px;font-weight:700;color:var(--mt,#64748b)">Justificativa (obrigatória)</label>
    <textarea id="alt-lanc-just" placeholder="Por que está alterando?" style="width:100%;min-height:60px;padding:9px;margin:3px 0 14px;border:1px solid var(--br,#e2e8f0);border-radius:7px;font-size:13px;color:var(--tx,#1e293b);background:var(--cd2,#f8fafc)"></textarea>
    <label style="font-size:11px;font-weight:700;color:var(--mt,#64748b)">Sua senha (de quem está editando)</label>
    <input id="alt-lanc-senha" type="password" placeholder="sua senha de acesso" style="width:100%;padding:9px;margin:3px 0 14px;border:1px solid var(--br,#e2e8f0);border-radius:7px;font-size:14px;color:var(--tx,#1e293b);background:var(--cd2,#f8fafc)">
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button onclick="document.getElementById('mh3-alt-lanc').remove()" style="padding:9px 14px;border:1px solid var(--br,#e2e8f0);background:var(--cd2,#f8fafc);color:var(--tx,#1e293b);border-radius:7px;cursor:pointer;font-weight:600">Cancelar</button>
      <button onclick="_salvarAlterarLanc()" style="padding:9px 16px;border:none;background:var(--red,#C8102E);color:#fff;border-radius:7px;cursor:pointer;font-weight:700">Salvar</button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  setTimeout(function(){ var el=document.getElementById('alt-lanc-just'); if(el) el.focus(); },60);
}
async function _salvarAlterarLanc(){
  var ctx=window._altLancCtx; if(!ctx) return;
  var justEl=document.getElementById('alt-lanc-just');
  var just=((justEl&&justEl.value)||'').trim();
  if(!just){ if(typeof toast==='function') toast('Escreva a justificativa.','er'); if(justEl) justEl.focus(); return; }
  var senhaEl=document.getElementById('alt-lanc-senha');
  var senha=(senhaEl&&senhaEl.value)||'';
  if(!senha){ if(typeof toast==='function') toast('Digite a sua senha.','er'); if(senhaEl) senhaEl.focus(); return; }
  var novoValor=parseFloat((document.getElementById('alt-lanc-valor')||{}).value||0)||0;
  var novoVc=(document.getElementById('alt-lanc-vc')||{}).value||'';
  var r=_achaLanc(ctx.id, ctx.ctx);
  if(!r){ if(typeof toast==='function') toast('Lançamento não encontrado','er'); return; }
  var valAntigo=parseFloat(r.obj[r.vf]||0)||0;
  var vcAntigo=r.obj.vc||'';
  var resumo='Confirma a alteração?\n\nValor: '+fmt(valAntigo)+'  ->  '+fmt(novoValor)+'\nVencimento: '+(vcAntigo||'(sem)')+'  ->  '+(novoVc||'(sem)')+'\n\nJustificativa: '+just;
  if(!confirm(resumo)) return;
  var ok=await _validarSenhaSolicitante(senha);
  if(!ok){ if(typeof toast==='function') toast('❌ Senha incorreta. Alteração cancelada.','er'); if(senhaEl){senhaEl.value='';senhaEl.focus();} return; }
  r.obj[r.vf]=novoValor;
  r.obj.vc=novoVc;
  var modAud=(ctx.ctx==='med'||ctx.ctx==='venda')?'contas_receber':'contas_pagar';
  var quem=(authUser&&authUser.nome)||'?';
  var desc='Alterou "'+r.nome+'": valor '+fmt(valAntigo)+'->'+fmt(novoValor)+', venc '+(vcAntigo||'-')+'->'+(novoVc||'-')+'. Por: '+quem+'. Motivo: '+just;
  if(typeof auditar==='function') auditar('ALTERACAO', modAud, desc);
  if(typeof sv==='function') sv();
  var ov=document.getElementById('mh3-alt-lanc'); if(ov) ov.remove();
  try{ if(typeof rp==='function') rp(cur); }catch(e){}
  if(typeof toast==='function') toast('Lançamento alterado e registrado no histórico.','ok');
}
function excluirLanc(id, ctx){
  if(typeof ehAdminAtual==='function' && !ehAdminAtual()){ if(typeof toast==='function') toast('Apenas o administrador pode excluir lançamentos.','er'); return; }
  var r=_achaLanc(id, ctx);
  if(!r){ if(typeof toast==='function') toast('Lançamento não encontrado','er'); return; }
  var valor=parseFloat(r.obj[r.vf]||0)||0;
  if(!confirm('EXCLUIR este lançamento?\n\n'+r.nome+' - '+fmt(valor)+'\n\nEsta ação não pode ser desfeita.\n(Vou pedir sua senha em seguida.)')) return;
  reqSenha(function(){
    var idx=r.arr.findIndex(function(x){ return x.id===id; });
    if(idx>-1) r.arr.splice(idx,1);
    var modAud=(ctx==='med'||ctx==='venda')?'contas_receber':'contas_pagar';
    if(typeof auditar==='function') auditar('EXCLUSAO', modAud, 'Excluiu lançamento: '+r.nome+' ('+fmt(valor)+')');
    if(typeof sv==='function') sv();
    try{ if(typeof rp==='function') rp(cur); }catch(e){}
    if(typeof toast==='function') toast('Lançamento excluído.','ok');
  });
}
function rdContasPagar(){
  const tb=document.getElementById('cp2-tb');
  if(!tb) return;
  const bar=document.getElementById('fv-cp-bar'); if(bar&&!bar.innerHTML)bar.innerHTML=filtroVencBar('cp');
  const selF=document.getElementById('fv-cp'); if(selF)selF.value=_filtroVenc.cp;
  const itemsBase=[...D.nfs.filter(n=>n.cp==='sim').map(n=>({...n,tipo:'NF',desc:n.desc||'NF '+n.num,forn:n.forn})),
               ...D.despesas.map(d=>({...d,tipo:'Despesa',desc:d.desc,forn:d.forn}))];
  const items=aplicarFiltroVenc(itemsBase,'cp','vc');
  const totalPend=items.filter(c=>c.st!=='pago').reduce((s,c)=>s+(parseFloat(c.vl)||0),0);
  tb.innerHTML=items.length?items.map(c=>`<tr>
    <td style="font-size:11px"><b>${c.desc||'-'}</b>${badgeAntigo(c)}</td>
    <td>${c.antigo?'<span class="badge" style="background:rgba(120,120,120,.18);color:#888;font-weight:800">Antigo</span>':'<span class="badge b-gr">'+c.tipo+'</span>'}</td>
    <td style="font-size:10px">${c.forn||'-'}</td>
    <td>${fmtDataUrg(c.vc, c.st==='pago')}</td>
    <td style="color:var(--or);font-weight:600">${fmt(c.vl)}</td>
    <td>${c.st==='pago'?'<span class="badge b-gn">✅ Pago</span>':'<span class="badge b-yw">⏳ Pendente</span>'}${c.travada?' 🔒':''}</td>
    <td style="white-space:nowrap"><button class="btn bcy btn-xs" onclick="verContaLanc('${c.id}','${c.tipo}')" title="Ver detalhes">🔍</button> ${podeEnviarEmail()?`<button class="btn btn-xs" style="background:var(--cy);color:#fff" onclick="enviarEmailCP('${c.id}','${c.tipo}')" title="Enviar por e-mail">📧</button> `:''}${c.st!=='pago'?`<button class="btn bg btn-xs" onclick="baixarCp('${c.id}','${c.tipo}')" title="Marcar como pago">✓ Baixar</button>`:'<span style="font-size:9px;color:var(--mt)">Quitado</span>'} <button class="btn bw btn-xs" onclick="abrirAlterarLanc('${c.id}','${c.tipo}')" title="Alterar (com justificativa e senha)">✏️</button> <button class="btn bd btn-xs" onclick="excluirLanc('${c.id}','${c.tipo}')" title="Excluir (somente administrador)">🗑</button></td>
  </tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma conta a pagar</td></tr>';
  const el=document.getElementById('cp2-total'); if(el) el.textContent=fmt(totalPend);
}

function rdContasReceber(){
  const tb=document.getElementById('cr2-tb');
  if(!tb) return;
  const bar=document.getElementById('fv-cr-bar'); if(bar&&!bar.innerHTML)bar.innerHTML=filtroVencBar('cr');
  const selF=document.getElementById('fv-cr'); if(selF)selF.value=_filtroVenc.cr;
  const itemsBase=[...D.medicoes.map(m=>({...m,origem:'Medição',cli:m.cl,tipo:'med'})),
               ...D.vendas.filter(v=>v.faturada!==false&&!_vendaVinculada(v.id)).map(v=>({...v,origem:'Venda',cli:v.cli,total:v.total,tipo:'venda'}))]
    .filter(x=>x.st!=='paga'&&x.st!=='pago');
  const items=aplicarFiltroVenc(itemsBase,'cr','vc');
  const total=items.reduce((s,x)=>s+(x.total||0),0);
  tb.innerHTML=items.length?items.map(x=>`<tr>
    <td><b>${x.cli||'-'}</b>${badgeAntigo(x)}</td>
    <td>${x.antigo?'<span class="badge" style="background:rgba(120,120,120,.18);color:#888;font-weight:800">Antigo</span>':'<span class="badge b-bl">'+x.origem+(x.numMed?' Nº'+String(x.numMed).padStart(3,'0'):'')+'</span>'}</td>
    <td style="color:var(--gn);font-weight:600">${fmt(x.total)}</td>
    <td style="font-size:10px;${x.vc&&dTo(x.vc)<0?'color:var(--red);font-weight:700':''}">${fmtDataUrg(x.vc, x.st==='recebido'||x.st==='pago')}</td>
    <td style="font-size:10px">${x.placa||'-'}</td>
    <td>
      <select style="font-size:11px;padding:3px 5px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" onchange="setStCR('${x.id}','${x.tipo}',this.value,this)">
        <option value="pendente" ${!x.st||x.st==='pendente'||x.st==='enviada'||x.st==='aprovada'?'selected':''}>⏳ Pendente</option>
        <option value="pago">✅ Pago</option>
        <option value="atrasado" ${x.st==='atrasado'?'selected':''}>🔴 Atrasado</option>
        <option value="remarcado" ${x.st==='remarcado'?'selected':''}>📅 Remarcado</option>
      </select>
      <button class="btn btn-xs" style="background:#25D366;color:#fff;border:none;margin-top:5px" onclick="whatsCobranca('${x.id}','${x.tipo}')" title="Enviar WhatsApp">📲</button> <button class="btn bcy btn-xs" onclick="verContaLanc('${x.id}','${x.tipo}')" title="Ver detalhes" style="margin-top:5px">🔍 Ver</button>${podeEnviarEmail()?`<button class="btn btn-xs" style="background:var(--cy);color:#fff;margin-top:5px;margin-left:4px" onclick="enviarEmailCR('${x.id}','${x.tipo}')" title="Enviar cobrança por e-mail">📧</button>`:''} <button class="btn bw btn-xs" style="margin-top:5px;margin-left:4px" onclick="abrirAlterarLanc('${x.id}','${x.tipo}')" title="Alterar (com justificativa e senha)">✏️</button> <button class="btn bd btn-xs" style="margin-top:5px;margin-left:4px" onclick="excluirLanc('${x.id}','${x.tipo}')" title="Excluir (somente administrador)">🗑</button>
    </td>
  </tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhuma conta a receber</td></tr>';
  const el=document.getElementById('cr2-total'); if(el) el.textContent=fmt(total);
}

function setStCR(id, tipo, novoSt, sel){
  // Status no Contas a Receber: Pago / Atrasado / Remarcado (com nova data)
  const lista=tipo==='med'?D.medicoes:D.vendas;
  const x=lista.find(i=>i.id===id);
  if(!x){toast('Registro não encontrado','er');return;}
  if(novoSt==='remarcado'){
    const nd=prompt('Nova data de vencimento (AAAA-MM-DD):', x.vc||'');
    if(!nd){sel.value=x.st||'pendente';return;}
    x.vc=nd; // ALTERA A INFORMAÇÃO PARA A NOVA DATA
    x.st='remarcado';
    x.fluxo='sim';
    if(typeof auditarExclusao==='function')auditarExclusao(tipo==='med'?'medicoes':'vendas','REMARCADO para '+nd+': '+(x.cli||x.cl||'')+' '+fmt(x.total||0));
    toast('📅 Remarcado! Nova data: '+nd,'ok');
  } else if(novoSt==='atrasado'){
    x.st='atrasado';x.prejuizo=true;x.fluxo='nao';
    if(typeof auditarExclusao==='function')auditarExclusao(tipo==='med'?'medicoes':'vendas','marcado ATRASADO: '+(x.cli||x.cl||'')+' '+fmt(x.total||0));
    toast('🔴 Marcado como Atrasado — vai para Prejuízos','er');
  } else if(novoSt==='pago'){
    const okb=abrirSelBanco('receber', id, tipo, parseFloat(x.total||0)||0, (x.cli||x.cl||'Recebimento'));
    if(!okb){ sel.value=x.st||'pendente'; }
    return;
  } else {
    x.st=novoSt;
  }
  sv();rdContasReceber();
  if(typeof rdFluxo==='function')rdFluxo();
}


