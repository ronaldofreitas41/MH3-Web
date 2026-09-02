// ============ TRATATIVAS (combinados e notas) ============
function popVeiculosTratativa(){
  var esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
  var sel=document.getElementById('trat-veic-sel'); if(!sel) return;
  var atual=sel.value;
  var opts='<option value="">— Selecionar placa cadastrada —</option>';
  (D.equips||[]).forEach(function(e){
    var lbl=((e.placa||'')+(e.mo?(' — '+(e.mk||'')+' '+e.mo):'')).trim();
    var val=(e.placa||'').replace(/"/g,'&quot;');
    if(val) opts+='<option value="'+val+'">'+esc(lbl)+'</option>';
  });
  opts+='<option value="__manual__">✏️ Outro (digitar manual)</option>';
  sel.innerHTML=opts;
  if(atual) sel.value=atual;
}
function tratVeicTrocar(v){
  var man=document.getElementById('trat-veic-manual');
  if(man) man.style.display = (v==='__manual__') ? 'block' : 'none';
}
function openNovaTratativa(){
  document.getElementById('trat-eid').value='';
  document.getElementById('trat-mtitle').textContent='🤝 Nova Tratativa';
  document.getElementById('trat-dt').value=today();
  document.getElementById('trat-com').value='';
  popVeiculosTratativa();
  document.getElementById('trat-veic-sel').value='';
  document.getElementById('trat-veic-manual').value='';
  document.getElementById('trat-veic-manual').style.display='none';
  document.getElementById('trat-nota').value='';
  document.getElementById('trat-prazo').value='';
  document.getElementById('trat-st').value='pendente';
  openM('m-tratativa');
}
function saveTratativa(){
  if(typeof _ehFinanceiro==='function' && !_ehFinanceiro()){ toast('Tratativas são exclusivas do Financeiro.','er'); return; }
  var nota=(document.getElementById('trat-nota').value||'').trim();
  if(!nota){ toast('Escreva o que foi combinado na tratativa.','er'); return; }
  var sel=document.getElementById('trat-veic-sel').value;
  var veic=(sel==='__manual__')?(document.getElementById('trat-veic-manual').value||'').trim():sel;
  var dados={
    dt:document.getElementById('trat-dt').value||today(),
    com:(document.getElementById('trat-com').value||'').trim(),
    veic:veic,
    nota:nota,
    prazo:(document.getElementById('trat-prazo').value||'').trim(),
    st:document.getElementById('trat-st').value||'pendente'
  };
  var eid=document.getElementById('trat-eid').value;
  if(!Array.isArray(D.tratativas)) D.tratativas=[];
  if(eid){
    var idx=D.tratativas.findIndex(function(t){return t.id===eid;});
    if(idx>-1) D.tratativas[idx]=Object.assign({},D.tratativas[idx],dados);
    auditar('ALTERACAO','tratativas','Tratativa alterada'+(dados.com?(' com '+dados.com):''));
  } else {
    dados.id=uid(); dados.criadoEm=Date.now(); dados.criadoPor=(authUser&&authUser.nome)||'';
    D.tratativas.unshift(dados);
    auditar('CRIACAO','tratativas','Tratativa criada'+(dados.com?(' com '+dados.com):''));
  }
  sv(); closeM('m-tratativa');
  toast(eid?'Tratativa atualizada!':'Tratativa salva!','ok');
  updTratCnt(); rdTratativas();
}
function editTratativa(id){if(_bloqEditar('tratativas'))return;
  var t=(D.tratativas||[]).find(function(x){return x.id===id;}); if(!t) return;
  document.getElementById('trat-eid').value=t.id;
  document.getElementById('trat-mtitle').textContent='🤝 Editar Tratativa';
  document.getElementById('trat-dt').value=t.dt||today();
  document.getElementById('trat-com').value=t.com||'';
  popVeiculosTratativa();
  var sel=document.getElementById('trat-veic-sel'), man=document.getElementById('trat-veic-manual');
  var existe=Array.prototype.some.call(sel.options,function(o){return o.value===t.veic && o.value!=='' && o.value!=='__manual__';});
  if(t.veic && existe){ sel.value=t.veic; man.style.display='none'; man.value=''; }
  else if(t.veic){ sel.value='__manual__'; man.style.display='block'; man.value=t.veic; }
  else { sel.value=''; man.style.display='none'; man.value=''; }
  document.getElementById('trat-nota').value=t.nota||'';
  document.getElementById('trat-prazo').value=t.prazo||'';
  document.getElementById('trat-st').value=t.st||'pendente';
  openM('m-tratativa');
}
function resolverTratativa(id){
  var t=(D.tratativas||[]).find(function(x){return x.id===id;}); if(!t) return;
  t.st=(t.st==='resolvida')?'pendente':'resolvida';
  auditar('ALTERACAO','tratativas','Tratativa marcada como '+t.st);
  sv(); updTratCnt(); rdTratativas();
  toast(t.st==='resolvida'?'Tratativa resolvida! ✅':'Tratativa reaberta.','ok');
}
function delTratativa(id){
  reqSenha(function(){
    if(!confirm('Excluir esta tratativa?')) return;
    auditarExclusao('tratativas','Tratativa excluída');
    D.tratativas=(D.tratativas||[]).filter(function(x){return x.id!==id;});
    sv(); updTratCnt(); rdTratativas();
    toast('Tratativa excluída.');
  });
}
function updTratCnt(){
  var pend=(D.tratativas||[]).filter(function(t){return t.st!=='resolvida';}).length;
  var b=document.getElementById('ni-trat');
  if(b){ b.textContent=pend; b.style.display=pend>0?'':'none'; }
}
function rdTratativas(){
  var esc=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');};
  updTratCnt();
  var ts=(D.tratativas||[]).slice();
  var pend=ts.filter(function(t){return t.st!=='resolvida';}).length;
  var resolv=ts.filter(function(t){return t.st==='resolvida';}).length;
  var _setK=function(id,v){var e=document.getElementById(id);if(e)e.textContent=v;};
  _setK('trat-pend',pend); _setK('trat-resolv',resolv); _setK('trat-total',ts.length);
  var tb=document.getElementById('trat-tb'); if(!tb) return;
  if(!ts.length){ tb.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--mt);padding:20px">Nenhuma tratativa registrada. Clique em <b>+ Nova Tratativa</b> para começar.</td></tr>'; return; }
  ts.sort(function(a,b){
    var ap=a.st==='resolvida'?1:0, bp=b.st==='resolvida'?1:0;
    if(ap!==bp) return ap-bp;
    return (b.dt||'').localeCompare(a.dt||'');
  });
  tb.innerHTML=ts.map(function(t){
    var stBadge=t.st==='resolvida'
      ? '<span class="b-gn" style="font-size:10px;padding:2px 8px;border-radius:10px">✅ Resolvida</span>'
      : '<span class="b-or" style="font-size:10px;padding:2px 8px;border-radius:10px">⏳ Pendente</span>';
    var btnResolver=t.st==='resolvida'
      ? '<button class="btn bg btn-xs" onclick="resolverTratativa(\''+t.id+'\')" title="Reabrir">↩️</button>'
      : '<button class="btn bs btn-xs" onclick="resolverTratativa(\''+t.id+'\')" title="Marcar como resolvida">✅</button>';
    return '<tr>'+
      '<td style="white-space:nowrap">'+(t.dt?fmtData(t.dt):'-')+'</td>'+
      '<td>'+(esc(t.veic)||'-')+'</td>'+
      '<td>'+(esc(t.com)||'-')+'</td>'+
      '<td style="max-width:320px;white-space:pre-wrap">'+(esc(t.nota)||'-')+'</td>'+
      '<td>'+(esc(t.prazo)||'-')+'</td>'+
      '<td style="white-space:nowrap">'+stBadge+'</td>'+
      '<td style="white-space:nowrap">'+btnResolver+'<button class="btn bw btn-xs" onclick="editTratativa(\''+t.id+'\')" title="Editar">✏️</button><button class="btn bd btn-xs" onclick="delTratativa(\''+t.id+'\')" title="Excluir">×</button></td>'+
      '</tr>';
  }).join('');
}
function rdIdentificacao(){
  var body=document.getElementById('d-ident-body'); if(!body) return;
  var versao=(window.APP_BUILD||(typeof APP_BUILD!=='undefined'?APP_BUILD:''))||'—';
  var temToken=(typeof authToken!=='undefined' && authToken && String(authToken).indexOf('local_')!==0);
  var online=(typeof syncAtivo!=='undefined' && syncAtivo) && temToken;
  var connTxt=online?'🟢 ONLINE — conectado ao servidor':'🟠 OFFLINE / modo local';
  var connCor=online?'#16a34a':'#d97706';
  var ts=parseInt(localStorage.getItem('mh3_ultima_sync')||'0',10)||0;
  var syncTxt;
  if(ts){
    var d=new Date(ts), p=function(n){return String(n).padStart(2,'0');};
    syncTxt='🕐 '+p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' às '+p(d.getHours())+'h'+p(d.getMinutes());
  } else { syncTxt='🕐 — (ainda não sincronizado nesta sessão)'; }
  var cards='<div style="display:flex;flex-wrap:wrap;gap:14px">'+
    '<div style="flex:1;min-width:170px"><div style="font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.5px">Última atualização (subiu no FTP)</div><div style="font-size:13px;font-weight:700;color:var(--tx)">🔄 '+versao+'</div></div>'+
    '<div style="flex:1;min-width:170px"><div style="font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.5px">Conexão</div><div style="font-size:13px;font-weight:700;color:'+connCor+'">'+connTxt+'</div></div>'+
    '<div style="flex:1;min-width:170px"><div style="font-size:10px;color:var(--mt);text-transform:uppercase;letter-spacing:.5px">Última sincronização de dados</div><div style="font-size:13px;font-weight:700;color:var(--tx)">'+syncTxt+'</div></div>'+
    '</div>';
  var logins='';
  if(typeof ehAdminAtual==='function' && ehAdminAtual()){
    var us=(D.usuarios||[]).slice();
    if(us.length){
      logins='<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--br)"><div style="font-size:11px;color:var(--mt);margin-bottom:6px">👥 <b>'+us.length+'</b> login(s) cadastrado(s) no sistema:</div>'+
        us.map(function(u){
          var pf=u.pf==='admin'?'Administrador':u.pf==='operacional'?'Operacional':u.pf==='motorista'?'Motorista':(u.pf||'-');
          return '<div style="font-size:12px;padding:3px 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center"><b style="color:var(--tx);min-width:130px">'+(u.nm||'-')+'</b><span style="color:var(--mt)">login: <b style="color:var(--tx)">'+(u.lg||'-')+'</b></span><span style="color:var(--mt)">· '+pf+'</span></div>';
        }).join('')+'<div style="font-size:10px;color:var(--mt);margin-top:6px">Para criar, editar ou excluir, abra o menu <b>Usuários</b>.</div></div>';
    } else {
      logins='<div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--br);font-size:12px;color:var(--mt)">👥 Nenhum login extra carregado ainda. Toque em <b>🔄 Sincronizar agora</b> para puxar a lista de logins do servidor.</div>';
    }
  }
  body.innerHTML=cards+logins;
}
function rdDash(){
  if(typeof rdIdentificacao==='function')rdIdentificacao();
  if(typeof rdMotivacao==='function')rdMotivacao();
  if(typeof rdAniversarios==='function')rdAniversarios();
  if(typeof rdContasHoje==='function')rdContasHoje();
  if(typeof rdAjudasRecorrentes==='function')rdAjudasRecorrentes();
  const _hd=new Date(), _mIni=_hd.getFullYear()*10000+(_hd.getMonth()+1)*100+1, _mFim=_hd.getFullYear()*10000+(_hd.getMonth()+1)*100+31;
  const _noMes=(d)=>{const n=(typeof _dataNum==='function')?_dataNum(d):0;return n>=_mIni&&n<=_mFim;};
  const al=D.equips.filter(e=>e.st==='alocado').length,di=D.equips.filter(e=>e.st==='disponivel').length,osAb=D.manutencoes.filter(m=>m.status!=='concluida'&&!ehImpressao(m)).length;
  // RECEITA PREVISTA NO MÊS = só lançamentos NOVOS (não importados), por vencimento no mês
  const rc=[...D.medicoes,...D.vendas].filter(x=>!x.antigo&&_noMes(x.vc)).reduce((s,x)=>s+(x.total||0),0);
  // A RECEBER NO MÊS = pendentes com vencimento no mês (inclui importados — é caixa a receber)
  const ar=[...D.medicoes.filter(m=>m.st!=='paga'&&m.st!=='pago'),...D.vendas.filter(v=>v.st!=='pago'&&v.st!=='paga')].filter(x=>_noMes(x.vc)).reduce((s,x)=>s+(x.total||0),0);
  // A PAGAR NO MÊS = pendentes com vencimento no mês (inclui importados — é caixa a pagar)
  const ap=[...D.nfs.filter(n=>n.cp==='sim'&&n.st!=='pago'),...D.despesas.filter(d=>d.st!=='pago')].filter(x=>_noMes(x.vc||x.dt)).reduce((s,x)=>s+(parseFloat(x.vl)||0),0);
  // DESPESAS DO MÊS = só lançamentos NOVOS (não importados), por vencimento no mês
  const dp=D.despesas.filter(d=>!d.antigo&&_noMes(d.vc||d.dt)).reduce((s,d)=>s+(parseFloat(d.vl)||0),0);
  const ev=D.estoque.reduce((s,e)=>s+((Number(e.qt)||0)*(Number(e.cv)||0)),0);
  const _setK=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};_setK('kpi-al',al);_setK('kpi-di',di);_setK('kpi-os',osAb);_setK('kpi-rc',fmtk(rc));_setK('kpi-ar',fmtk(ar));_setK('kpi-ap',fmtk(ap));_setK('kpi-dp',fmtk(dp));_setK('kpi-ev',fmtk(ev));
  // Indicadores do mês: ocupação da frota, inadimplência (vencidos), resultado
  const _totFrota=D.equips.length, _baseOcup=di+al, _ocup=_baseOcup?Math.round(al/_baseOcup*100):0;
  const _inadL=[...D.medicoes.filter(m=>m.st!=='paga'&&m.st!=='pago'),...D.vendas.filter(v=>v.st!=='pago'&&v.st!=='paga')].filter(x=>{const d=dTo(x.vc);return d!==null&&d<0;});
  const _inad=_inadL.reduce((s,x)=>s+(x.total||0),0), _lucro=rc-dp;
  _setK('kpi-ocup',_ocup+'%');_setK('kpi-inad',fmtk(_inad));_setK('kpi-lucro',fmtk(_lucro));
  (function(){var os=document.getElementById('kpi-ocup-sub');if(os)os.textContent=al+' de '+_baseOcup+' (disp.+aloc.)';var is=document.getElementById('kpi-inad-sub');if(is)is.textContent=_inadL.length+' título(s) vencido(s)';var le=document.getElementById('kpi-lucro');if(le)le.style.color=_lucro<0?'var(--red)':'var(--gn)';})();
  (function(){var verFin=(typeof temAcesso==='function')?temAcesso('kpi-fin'):true;var fr=document.getElementById('kpi-fin-row');if(fr)fr.style.display=verFin?'':'none';var ir=document.getElementById('kpi-ind-row');if(ir)ir.style.display=verFin?'':'none';var rcc=document.getElementById('kpi-rc-card');if(rcc)rcc.style.visibility=verFin?'':'hidden';})();
  const pends=calcPends();const pb=document.getElementById('pend-banner');pb.innerHTML=pends.length?`<div class="pend-bar" onclick="go('pendencias')"><span style="font-size:16px">🚨</span><div style="flex:1"><strong style="font-size:12px;color:#ff6b6b">${pends.length} Pendência(s) Crítica(s)</strong><span style="font-size:10px;color:var(--mt);display:block;margin-top:1px">Clique para detalhes</span></div><span style="font-family:'Bebas Neue';font-size:26px;color:var(--red)">${pends.length}</span></div>`:`<div class="ab a-gn">✅ Nenhuma pendência crítica</div>`;
  let al2='';D.medicoes.filter(m=>!m.antigo).forEach(m=>{const d=dTo(m.vc);if(d!==null&&d<=(D.config.alertDias||5)&&m.st!=='paga')al2+=`<div class="ab ${d<=0?'a-rd':'a-yw'}">${d<=0?'🚨':'⚠️'} Medição de <b>${m.cl}</b> ${d<=0?'VENCIDA há '+(d*-1)+' dia(s)':'vence em '+d+' dia(s)'} — ${fmt(m.total)}</div>`;});
  const eb=D.estoque.filter(e=>e.qt<=e.mn);if(eb.length)al2+=`<div class="ab a-yw">📦 Estoque baixo: ${eb.map(e=>e.ds).join(', ')}</div>`;
  document.getElementById('d-alerts').innerHTML=al2;
  const meds=[...D.medicoes].filter(m=>m.st!=='paga'&&!m.antigo).sort((a,b)=>new Date(a.vc)-new Date(b.vc)).slice(0,5);
  document.getElementById('d-meds').innerHTML=meds.length?meds.map(m=>{const d=dTo(m.vc);const cs=d===null?'':d<=0?'color:var(--red)':d<=3?'color:var(--yw)':'color:var(--mt)';return`<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--br)"><div><div style="font-size:11px;font-weight:600">${m.cl}</div><div style="font-size:9px;color:var(--mt)">${m.ms||''} · ${fmt(m.total)}</div></div><div style="text-align:right">${bdg(m.st)}<div style="font-size:9px;margin-top:1px;${cs}">${fmtData(m.vc)}</div></div></div>`;}).join(''):'<div class="empty"><div class="ei">📐</div>Sem pendências</div>';
  const critRev=calcPends().filter(p=>p.modulo==='revisao').slice(0,4);
  document.getElementById('d-revs').innerHTML=critRev.length?critRev.map(p=>`<div class="ab ${p.tipo==='rd'?'a-rd':'a-yw'}">${p.icon} ${p.txt}</div>`).join(''):'<div class="empty"><div class="ei">🔄</div>Revisões em dia</div>';
  const dc=document.getElementById('d-cts');if(!dc)return;if(!D.contratos.length){dc.innerHTML='<div class="empty"><div class="ei">📋</div>Nenhum contrato</div>';return;}dc.innerHTML=`<div class="tw"><table><thead><tr><th>Cliente</th><th>Equip.</th><th>Turno/H</th><th>Valor/Mês</th><th>Assinatura</th><th>Status</th></tr></thead><tbody>${D.contratos.map(c=>`<tr><td><b>${c.cl}</b><br><span style="font-size:8px;color:var(--mt)">${c.ob||''}</span></td><td><span class="tag-p">${c.placa||'-'}</span></td><td>${c.tn}T/${c.hr}h</td><td style="color:var(--gn);font-weight:600">${fmt(c.vl)}</td><td>${c.ass==='assinado'?'<span class="badge b-gn">✅ Assinado</span>':'<span class="badge b-yw">Pendente</span>'}</td><td>${bdg(c.status)}</td></tr>`).join('')}</tbody></table></div>`;
}

function rdPend(){const pends=calcPends();const el=document.getElementById('pend-list');if(!pends.length){el.innerHTML='<div class="ab a-gn">✅ Nenhuma pendência!</div>';return;}el.innerHTML=pends.map(p=>`<div class="pend-item pend-${p.tipo}" onclick="go('${p.modulo}')"><div class="pend-dot ${p.tipo}"></div><div><div style="font-size:12px;font-weight:600">${p.icon} ${p.txt}</div><div style="font-size:10px;color:var(--mt);margin-top:2px">${p.sub}</div><div style="font-size:9px;color:var(--mt);margin-top:2px">Clique →</div></div></div>`).join('');}

function frotaSelTodos(chk){
  var cks=document.querySelectorAll('.fr-chk');
  for(var i=0;i<cks.length;i++){
    var tr=cks[i].closest('tr');
    if(tr && tr.style.display==='none')continue;
    cks[i].checked=chk.checked;
  }
}
function excluirFrotaSelecionados(){
  var cks=document.querySelectorAll('.fr-chk:checked');
  if(!cks.length){if(typeof toast==='function')toast('Marque pelo menos um veículo para excluir.','er');return;}
  var ids=[]; for(var i=0;i<cks.length;i++)ids.push(cks[i].value);
  var bloqueados=[], ok=[];
  ids.forEach(function(id){
    var ct=(D.contratos||[]).find(function(c){return c.eqId===id&&c.status==='ativo';});
    var eq=(D.equips||[]).find(function(e){return e.id===id;});
    if(ct){bloqueados.push(eq?(eq.placa||eq.pl||id):id);}
    else{ok.push(id);}
  });
  if(!ok.length){if(typeof toast==='function')toast('Todos os selecionados têm contrato ativo e não podem ser excluídos.','er');return;}
  var msg='Excluir '+ok.length+' veículo(s)?\n\nEsta ação NÃO pode ser desfeita.';
  if(bloqueados.length)msg+='\n\nATENÇÃO: '+bloqueados.length+' com contrato ativo será(ão) PULADO(S):\n'+bloqueados.join(', ');
  var fazer=function(){
    if(!confirm(msg))return;
    var setIds={}; ok.forEach(function(id){setIds[id]=true;});
    D.equips=(D.equips||[]).filter(function(e){return !setIds[e.id];});
    if(typeof auditar==='function')auditar('EXCLUSAO','frota','Exclusão em massa: '+ok.length+' veículo(s)');
    if(typeof sv==='function')sv();
    if(typeof rdFrota==='function')rdFrota();
    if(typeof toast==='function')toast(ok.length+' veículo(s) excluído(s).'+(bloqueados.length?' ('+bloqueados.length+' pulado(s) por contrato ativo)':''),'ok');
  };
  if(typeof reqSenha==='function')reqSenha(fazer); else fazer();
}

function rdFrota(){const q=document.getElementById('frota-srch').value.toLowerCase();const st=document.getElementById('frota-st').value;const tb=document.getElementById('frota-tb');const stmap={disponivel:'b-bl',alocado:'b-gn',imobilizado:'b-yw',vendido:'b-gr',uso_empresa:'b-pu'};const stlbl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};let eq=D.equips;if(st)eq=eq.filter(e=>e.st===st);if(q)eq=eq.filter(e=>`${e.placa} ${e.mk} ${e.mo} ${e.pr||''}`.toLowerCase().includes(q));if(!eq.length){tb.innerHTML='<tr><td colspan="10" class="empty">Nenhum resultado</td></tr>';return;}tb.innerHTML=eq.map(e=>{const ct=D.contratos.find(c=>c.eqId===e.id&&c.status==='ativo');return`<tr><td style="text-align:center"><input type="checkbox" class="fr-chk" value="${e.id}"></td><td><span class="tag-p" onclick="verEq('${e.id}')" style="cursor:pointer" title="Clique para ver detalhes do cadastro">${e.placa} 🔍</span></td><td><b>${e.mk||''} ${e.mo||''}</b>${ct?`<div style="font-size:8px;color:var(--gn)">🏗 ${ct.cl}</div>`:''}</td><td style="font-size:10px">${e.ano||'-'}</td><td><span class="badge ${e.cond==='novo'?'b-gn':'b-or'}">${e.cond==='novo'?'Novo':'Usado'}</span></td><td style="font-size:9px;color:var(--bl)">${e.im||'—'}</td><td style="font-size:10px">${e.pr||'-'}</td><td style="font-size:9px;color:var(--mt)">${fmtN(kmAtualVeic(e))}</td><td style="font-size:9px;color:var(--mt)">${fmtN(hrAtualVeic(e))}h</td><td><button class="btn ${stmap[e.st]||'bg'} btn-xs" onclick="chgStatus('${e.id}')" title="Clique para alterar">${stlbl[e.st]||e.st}</button></td><td style="white-space:nowrap"><button class="btn bb btn-xs" onclick="verEq('${e.id}')">👁</button> <button class="btn bw btn-xs" onclick="openEditEq('${e.id}')">✏</button>${_btnsMedMan(e)} <button class="btn bg btn-xs" onclick="venderEq('${e.id}')" title="Vender veículo/equipamento" style="${e.st==='vendido'?'display:none':''}">💰 Vender</button> <button class="btn bd btn-xs" onclick="delEq('${e.id}')">×</button></td></tr>`;}).join('');}

function verEq(id){const e=D.equips.find(x=>x.id===id);if(!e)return;const ct=D.contratos.find(c=>c.eqId===id&&c.status==='ativo');const mns=D.manutencoes.filter(m=>m.eqId===id||(m.placa&&typeof _normPlacaImp==='function'&&_normPlacaImp(m.placa)===_normPlacaImp(e.placa)));document.getElementById('view-title').textContent='🚛 '+e.placa;const stlbl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};document.getElementById('view-body').innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px"><div class="rel-card"><div class="stat-label">Placa</div><div class="stat-value" style="font-size:14px">${e.placa}</div></div><div class="rel-card"><div class="stat-label">Status</div><div>${stlbl[e.st]||e.st}</div></div><div class="rel-card"><div class="stat-label">Marca / Modelo</div><div class="stat-value">${e.mk} ${e.mo}</div></div><div class="rel-card"><div class="stat-label">Condição</div><div>${e.cond==='novo'?'✅ Novo':'🔧 Usado'}</div></div><div class="rel-card"><div class="stat-label">Proprietário</div><div class="stat-value">${e.pr||'-'}</div></div><div class="rel-card"><div class="stat-label">KM atual / H atual</div><div class="stat-value">${fmtN(kmAtualVeic(e))} / ${fmtN(hrAtualVeic(e))}h</div></div></div>${ct?`<div class="ab a-gn" style="margin-bottom:8px">🏗 Contrato ativo: ${ct.cl} · ${fmt(ct.vl)}/mês</div>`:''}<div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;margin-bottom:6px">OS (${mns.length})</div>${mns.length?mns.map(m=>`<div style="display:flex;justify-content:space-between;padding:5px;background:var(--cd2);border-radius:3px;margin-bottom:3px"><div><span class="os-num">${m.osNum}</span> <span style="font-size:10px;font-weight:500">${m.tipo}</span><div style="font-size:9px;color:var(--mt)">${m.en||'-'} · ${(m.lancs||[]).length} itens · ${fmt(m.total)}</div></div><button class="btn bg btn-xs" onclick="openPrintOS('${m.id}')">🖨</button></div>`).join(''):'<div style="font-size:10px;color:var(--mt)">Sem OS</div>'}${e.fotos&&e.fotos.length?`<div style="margin-top:8px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;margin-bottom:5px">Fotos</div><div class="foto-grid">${e.fotos.map(f=>`<img class="foto-thumb" src="${f.src}" onclick="openLB('${f.src}')">`).join('')}</div></div>`:''}${e.arqs&&e.arqs.length?`<div style="margin-top:8px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;margin-bottom:5px">Documentos</div>${e.arqs.map(a=>`<div class="doc-item"><span>${a.type&&a.type.includes('pdf')?'📄':'🖼'}</span><span class="doc-name">${a.name}</span><a href="${a.src}" download="${a.name}" class="btn bg btn-xs">⬇</a></div>`).join('')}</div>`:''}`; _veqAtual=id; injetarGastosVeic(); openM('m-view');}

let _veqAtual=null;
function injetarGastosVeic(){
  const vb=document.getElementById('view-body'); if(!vb) return;
  const h=`<div style="margin-top:12px;border-top:1px solid var(--br);padding-top:8px">
    <div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;margin-bottom:6px">💰 Gastos do Veículo</div>
    <div style="display:flex;gap:5px;margin-bottom:6px;flex-wrap:wrap;align-items:center">
      <select id="veq-f-modo" onchange="onVeqFiltro()" style="font-size:11px;padding:3px 6px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)">
        <option value="tudo">Tudo</option><option value="mes">Este mês</option><option value="ano">Este ano</option><option value="periodo">Período…</option>
      </select>
      <input type="date" id="veq-f-d1" onchange="renderGastosVeic()" style="display:none;font-size:11px;padding:2px 4px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)">
      <input type="date" id="veq-f-d2" onchange="renderGastosVeic()" style="display:none;font-size:11px;padding:2px 4px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)">
    </div>
    <div id="veq-gastos"></div>
  </div>`;
  vb.insertAdjacentHTML('beforeend', h);
  renderGastosVeic();
}
function onVeqFiltro(){
  const modo=document.getElementById('veq-f-modo').value;
  const disp=modo==='periodo'?'':'none';
  document.getElementById('veq-f-d1').style.display=disp;
  document.getElementById('veq-f-d2').style.display=disp;
  renderGastosVeic();
}
function renderGastosVeic(){
  const cont=document.getElementById('veq-gastos'); if(!cont) return;
  const e=D.equips.find(x=>x.id===_veqAtual); if(!e){cont.innerHTML='';return;}
  const modo=(document.getElementById('veq-f-modo')||{}).value||'tudo';
  const now=new Date();
  const ymAtual=now.getFullYear()*100+(now.getMonth()+1);
  const yAtual=now.getFullYear();
  let d1=null,d2=null;
  if(modo==='periodo'){ const a=(document.getElementById('veq-f-d1')||{}).value, b=(document.getElementById('veq-f-d2')||{}).value; d1=a?_dataNum(a):null; d2=b?_dataNum(b):null; }
  function noFiltro(dt){
    const n=_dataNum(dt);
    if(modo==='tudo') return true;
    if(!n) return false;
    if(modo==='mes') return Math.floor(n/100)===ymAtual;
    if(modo==='ano') return Math.floor(n/10000)===yAtual;
    if(modo==='periodo'){ if(d1&&n<d1)return false; if(d2&&n>d2)return false; return true; }
    return true;
  }
  let itens=[];
  D.despesas.filter(x=>x.placa===e.placa).forEach(x=>{ if(noFiltro(x.dt)) itens.push({dt:x.dt,tipo:'Despesa',desc:(x.cat?x.cat+' · ':'')+(x.desc||'-'),val:parseFloat(x.vl)||0}); });
  D.manutencoes.filter(m=>m.eqId===_veqAtual).forEach(m=>{ const dt=m.en||m.sa||m.dt; if(noFiltro(dt)) itens.push({dt:dt,tipo:'OS '+(m.osNum||''),desc:m.tipo||'Manutenção',val:parseFloat(m.total)||0}); });
  itens.sort((a,b)=>(_dataNum(b.dt)||0)-(_dataNum(a.dt)||0));
  const total=itens.reduce((s,i)=>s+i.val,0);
  if(!itens.length){ cont.innerHTML='<div style="font-size:10px;color:var(--mt);padding:6px">Nenhum gasto no período.</div>'; return; }
  cont.innerHTML='<div class="tw"><table style="font-size:11px"><thead><tr><th>Data</th><th>Tipo</th><th>Descrição</th><th style="text-align:right">Valor</th></tr></thead><tbody>'+itens.map(i=>'<tr><td style="font-size:10px">'+fmtData(i.dt)+'</td><td style="font-size:10px">'+i.tipo+'</td><td>'+i.desc+'</td><td style="text-align:right;color:var(--or);font-weight:600">'+fmt(i.val)+'</td></tr>').join('')+'</tbody><tfoot><tr><td colspan="3" style="text-align:right;font-weight:700">Total</td><td style="text-align:right;font-weight:700;color:var(--rd)">'+fmt(total)+'</td></tr></tfoot></table></div>';
}






function rdManut(){const q=document.getElementById('mn-srch').value.toLowerCase();(function(){var c=document.getElementById('mn-cnt');if(c){var ab=D.manutencoes.filter(function(m){return m.status!=='concluida'&&!ehImpressao(m);}).length;var tot=D.manutencoes.filter(function(m){return !ehImpressao(m);}).length;c.textContent=ab+' aberta(s) · '+tot+' no total';}})();const fst=document.getElementById('mn-fst').value;const tb=document.getElementById('mn-tb');let mns=[...D.manutencoes].reverse();if(fst)mns=mns.filter(m=>m.status===fst);if(q)mns=mns.filter(m=>`${m.osNum||''} ${m.placa||''} ${m.tipo||''} ${m.custo||''}`.toLowerCase().includes(q));if(!mns.length){tb.innerHTML='<tr><td colspan="10" class="empty">Nenhuma OS</td></tr>';return;}tb.innerHTML=mns.map(m=>`<tr><td><span class="os-num">${m.osNum||'—'}</span></td><td><span class="tag-p">${m.placa||'-'}</span></td><td style="font-size:10px">${m.tipo}</td><td style="font-size:9px">${m.en||'-'}</td><td style="font-size:9px">${m.sa||'—'}</td><td style="font-size:9px;color:var(--mt)">${m.km||'-'}/${m.hr||'-'}h</td><td style="color:var(--gn);font-weight:600">${m.total?fmt(m.total):'-'}</td><td>${bdg(m.custo||'mh3')}</td><td>${bdg(m.status||'aberta')}</td><td style="white-space:nowrap"><button class="btn bcy btn-xs" onclick="verOS('${m.id}')">🔍</button> ${m.status!=='concluida'?`<button class="btn bw btn-xs" onclick="editMn('${m.id}')" title="Editar OS (só enquanto aberta)">✏️</button> `:''}${podeEnviarEmail()?`<button class="btn btn-xs" style="background:var(--cy);color:#fff" onclick="enviarEmailOS('${m.id}')" title="Enviar OS por e-mail">📧</button> `:''}<button class="btn bg btn-xs" onclick="openPrintOS('${m.id}')">🖨</button> <button class="btn bd btn-xs" onclick="delMn('${m.id}')">×</button></td></tr>`).join('');}

function rdRev(){const el=document.getElementById('rev-list');if(!el)return;var np=(typeof _normPlacaImp==='function')?_normPlacaImp:function(p){return String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');};var fN=(typeof fmtN==='function')?fmtN:function(v){return v;};function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}function acharEq(m){if(m.eqId){var e1=D.equips.find(function(e){return e.id===m.eqId;});if(e1)return e1;}if(m.placa){return D.equips.find(function(e){return np(e.placa)===np(m.placa);});}return null;}var eqIds={};(D.manutencoes||[]).forEach(function(m){if(!(m.tipo&&m.tipo.toLowerCase().indexOf('preventiva')>=0))return;var eqx=acharEq(m);if(eqx)eqIds[eqx.id]=true;});var statusOk={disponivel:1,alocado:1,uso_empresa:1};var eqs=(D.equips||[]).filter(function(e){return e&&statusOk[e.st];});var _qrev=(document.getElementById('rev-srch')?document.getElementById('rev-srch').value:'').toLowerCase().trim();if(_qrev)eqs=eqs.filter(function(e){return (((e.placa||'')+' '+(e.mk||'')+' '+(e.mo||'')).toLowerCase().indexOf(_qrev)>=0);});if(!eqs.length){el.innerHTML='<div class="empty"><div class="ei">\u{1F4CB}</div>Nenhuma revis\u00e3o preventiva para ve\u00edculos ativos</div>';return;}eqs.sort(function(a,b){return (a.placa||'').localeCompare(b.placa||'');});var rkmCfg=parseInt(D.config.rkm)||10000, rhrCfg=parseInt(D.config.rhr)||500;el.innerHTML=eqs.map(function(eq){var ct=D.contratos.find(function(c){return c.eqId===eq.id&&c.status==='ativo';});var mns=D.manutencoes.filter(function(m){return (m.eqId===eq.id||(m.placa&&np(m.placa)===np(eq.placa)))&&m.tipo&&m.tipo.toLowerCase().indexOf('preventiva')>=0;}).sort(function(a,b){return new Date(b.en)-new Date(a.en);});var lastMn=mns[0];var revs=(D.revisoes||[]).filter(function(r){return r.eqId===eq.id;}).sort(function(a,b){return new Date(b.dt)-new Date(a.dt);});var lastRev=revs[0];var _kmA0=parseInt(_numLimpo(eq.km))||0;var _hrA0=parseInt(_numLimpo(eq.hr))||0;var _urKm=parseInt(_numLimpo(eq.urKm))||0;var _urHr=parseInt(_numLimpo(eq.urHr))||0;var _osKm=lastMn?(parseInt(lastMn.km)||0):0;var _osHr=lastMn?(parseInt(lastMn.hr)||0):0;var _baseKm=Math.max(_urKm,_osKm,_kmA0);var _baseHr=Math.max(_urHr,_osHr,_hrA0);var _baseDt=(_urKm>=_osKm?(eq.urDt||''):(lastMn?(lastMn.en||''):''))||'';var _baseTxt=_baseDt?((typeof fmtData==='function')?fmtData(_baseDt):_baseDt):(_urKm?'Última revisão':(lastMn?'OS preventiva':'Cadastro inicial'));var pkmEff=_baseKm?String(_baseKm+rkmCfg):'';var phrEff=_baseHr?String(_baseHr+rhrCfg):'';var kmAtual=kmAtualVeic(eq)||'';var hrAtual=hrAtualVeic(eq)||'';var dtAtual=lastRev?lastRev.dt:(lastMn?lastMn.en:'');var _akm=pkmEff&&kmAtual&&parseFloat(kmAtual)>=parseFloat(pkmEff);var _ahr=phrEff&&hrAtual&&parseFloat(hrAtual)>=parseFloat(phrEff);var _wkm=pkmEff&&kmAtual&&parseFloat(kmAtual)>=(parseFloat(pkmEff)-1000);var _whr=phrEff&&hrAtual&&parseFloat(hrAtual)>=(parseFloat(phrEff)-100);var alertKm=_akm||_ahr;var warnKm=(!alertKm)&&(_wkm||_whr);var origem=ct?('\u{1F3D7} '+ct.cl+' \u00b7 '+(ct.ob||'-')):'\u{1F69B} Frota pr\u00f3pria';var patioHTML='';if(eq.st==='disponivel'||eq.st==='alocado'){var _aloc=(eq.st==='alocado');var pt=eq.patio||{};var temP=pt.respNome||pt.respTel||pt.motNome||pt.motTel||pt.obs;var _cor=_aloc?'var(--bp,#3b82f6)':'var(--yw)';var _tit=_aloc?('\u{1F4DE} Contato Contratante'+(ct?(' \u00b7 '+esc(ct.cl)):'')):'\u{1F17F}\ufe0f Contato Contratante (no p\u00e1tio)';patioHTML='<div style="background:var(--cd);border-radius:4px;padding:6px;margin-top:6px;border-left:3px solid '+_cor+'"><div style="font-size:9px;color:'+_cor+';font-weight:700;margin-bottom:4px">'+_tit+'</div>';if(temP){patioHTML+='<div style="font-size:10px;line-height:1.8">'+((pt.respNome||pt.respTel)?('<div>\u{1F464} <b>Respons\u00e1vel:</b> '+esc(pt.respNome||'-')+(pt.respTel?(' \u00b7 '+esc(pt.respTel)+' <button class="btn btn-xs" style="background:#25D366;color:#fff;border:none;padding:1px 6px" onclick="whatsRev(\''+eq.id+'\',\'resp\')" title="Enviar WhatsApp">\u{1F4F2}</button>'):'')+'</div>'):'')+((pt.motNome||pt.motTel)?('<div>\u{1F69B} <b>Motorista:</b> '+esc(pt.motNome||'-')+(pt.motTel?(' \u00b7 '+esc(pt.motTel)+' <button class="btn btn-xs" style="background:#25D366;color:#fff;border:none;padding:1px 6px" onclick="whatsRev(\''+eq.id+'\',\'mot\')" title="Enviar WhatsApp">\u{1F4F2}</button>'):'')+'</div>'):'')+(pt.obs?('<div>\u{1F4DD} <b>Obs:</b> '+esc(pt.obs)+'</div>'):'')+'</div><div style="margin-top:4px"><button class="btn bw btn-xs" onclick="abrirPatioContato(\''+eq.id+'\')">\u270f\ufe0f Editar</button> <button class="btn bd btn-xs" onclick="excluirPatioContato(\''+eq.id+'\')">\u00d7 Excluir</button></div>';}else{patioHTML+='<button class="btn bg btn-xs" onclick="abrirPatioContato(\''+eq.id+'\')">+ Adicionar contato do contratante</button>';}patioHTML+='</div>';}return '<div class="rev-card '+(alertKm?'alert-rev':warnKm?'warn-rev':'ok-rev')+'"><div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:7px"><div><div style="font-family:\'Barlow Condensed\';font-size:14px;font-weight:700"><span class="tag-p">'+eq.placa+'</span> '+(eq.mk||'')+' '+(eq.mo||'')+'</div><div style="font-size:9px;color:var(--mt)">'+origem+'</div></div><button class="btn bp btn-sm" onclick="openRevLanc(\''+eq.id+'\')">\u{1F4CD} Lan\u00e7ar</button></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:7px"><div style="background:var(--cd);border-radius:3px;padding:6px"><div style="font-size:8px;color:var(--mt)">\u00daltima Preventiva</div><div style="font-size:11px;font-weight:600">'+_baseTxt+'</div><div style="font-size:9px;color:var(--mt)">'+(fN(_baseKm)+'km / '+fN(_baseHr)+'h')+'</div></div><div style="background:var(--cd);border-radius:3px;padding:6px"><div style="font-size:8px;color:var(--mt)">KM/Hr Atual</div><div style="font-size:11px;font-weight:600">'+(kmAtual?fN(kmAtual)+' km':'-')+'</div><div style="font-size:9px;color:var(--mt)">'+(hrAtual?fN(hrAtual)+'h':'-')+(dtAtual?' \u00b7 '+((typeof fmtData==='function')?fmtData(dtAtual):dtAtual):'')+'</div></div><div style="background:var(--cd);border-radius:3px;padding:6px"><div style="font-size:8px;color:var(--mt)">Pr\u00f3xima Revis\u00e3o</div><div style="font-size:11px;font-weight:600;'+(alertKm?'color:var(--red)':warnKm?'color:var(--yw)':'')+'">'+(pkmEff?fN(pkmEff)+'km':'\u2014')+'</div><div style="font-size:9px;color:var(--mt)">'+(phrEff?fN(phrEff)+'h':'\u2014')+'</div></div></div>'+(alertKm?'<div style="font-size:10px;color:var(--red);font-weight:600">\u{1F6A8} REVIS\u00c3O VENCIDA</div>':warnKm?'<div style="font-size:10px;color:var(--yw)">\u26a0\ufe0f Revis\u00e3o pr\u00f3xima</div>':'<div style="font-size:9px;color:var(--gn)">\u2705 Em dia</div>')+patioHTML+'</div>';}).join('');}

function rdCts(){const tb=document.getElementById('ct-tb');if(!D.contratos.length){tb.innerHTML='<tr><td colspan="10" class="empty">Nenhum contrato</td></tr>';return;}tb.innerHTML=D.contratos.map(c=>`<tr><td><b>${c.cl}</b><br><span style="font-size:8px;color:var(--mt)">${c.ob||''}</span></td><td><span class="tag-p">${c.placa||'-'}</span></td><td>${c.tn}T/${c.hr}h</td><td style="font-size:9px;color:var(--pu)">${c.vhe?fmt(c.vhe)+'/h':'—'}</td><td style="color:var(--gn);font-weight:600">${fmt(c.vl)}</td><td style="font-size:9px">${c.ini||'-'}</td><td style="font-size:9px">${c.ci||'-'}</td><td>${c.ass==='assinado'?'<span class="badge b-gn">✅</span>':'<span class="badge b-yw">Pendente</span>'}</td><td>${bdg(c.status)}</td><td style="white-space:nowrap"><button class="btn bb btn-xs" onclick="viewCt('${c.id}')">👁</button> <button class="btn bw btn-xs" onclick="aditivarContrato('${c.id}')" title="Aditivo: adicionar meses ao contrato">➕ Aditivo</button> <button class="btn bw btn-xs" onclick="openEditCt('${c.id}')">✏</button> <button class="btn bd btn-xs" onclick="encCt('${c.id}')">×</button></td></tr>`).join('');}
function viewCt(id){const c=D.contratos.find(x=>x.id===id);if(!c)return;document.getElementById('view-title').textContent='📋 Contrato — '+c.cl;document.getElementById('view-body').innerHTML=`<div style="text-align:center;margin-bottom:14px"><div style="font-family:'Bebas Neue';font-size:30px;color:var(--red)">MH3 RENTAL LTDA</div><div style="font-size:9px;color:var(--mt)">CONTRATO DE LOCAÇÃO</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px"><div class="rel-card"><div class="stat-label">Contratante</div><div class="stat-value" style="font-size:13px">${c.cl}</div></div><div class="rel-card"><div class="stat-label">Obra</div><div class="stat-value">${c.ob||'-'}</div></div><div class="rel-card"><div class="stat-label">Veículo/Equipamento</div><div class="stat-value"><span class="tag-p">${c.placa||'-'}</span> ${c.mk||''} ${c.mo||''}</div></div><div class="rel-card"><div class="stat-label">Início</div><div class="stat-value">${c.ini||'-'}</div></div><div class="rel-card"><div class="stat-label">Turno / Horas</div><div class="stat-value">${c.tn} turno(s) / ${c.hr}h/mês</div></div><div class="rel-card"><div class="stat-label">Ciclo</div><div class="stat-value">${c.ci||'-'}</div></div><div class="rel-card"><div class="stat-label">Valor Mensal</div><div class="stat-value gn" style="font-size:15px">${fmt(c.vl)}</div></div><div class="rel-card"><div class="stat-label">H.Extra</div><div class="stat-value">${fmt(c.vhe||0)}/h</div></div><div class="rel-card"><div class="stat-label">Mobilização</div><div class="stat-value">${c.mob||'-'}</div></div><div class="rel-card"><div class="stat-label">Assinatura</div><div class="stat-value">${c.ass==='assinado'?'✅ Assinado':'⏳ Pendente'}</div></div></div>${c.obs?`<div class="rel-card"><div class="stat-label">Obs.</div><div style="font-size:10px;margin-top:4px">${c.obs}</div></div>`:''}<div style="margin-top:18px;display:grid;grid-template-columns:1fr 1fr;gap:24px"><div style="border-top:1px solid var(--br);padding-top:5px;text-align:center;font-size:9px;color:var(--mt)">MH3 Rental — Contratada</div><div style="border-top:1px solid var(--br);padding-top:5px;text-align:center;font-size:9px;color:var(--mt)">${c.cl} — Contratante</div></div>`;openM('m-view');}

function rdMeds(){const con=document.getElementById('med-container');if(!D.medicoes.length){con.innerHTML='<div class="empty"><div class="ei">📐</div>Nenhuma medição</div>';return;}const g={};D.medicoes.forEach(m=>{if(!g[m.cl])g[m.cl]=[];g[m.cl].push(m);});con.innerHTML=Object.entries(g).map(([cl,meds])=>{const pend=meds.filter(m=>m.st!=='paga').reduce((s,m)=>s+(m.total||0),0);return`<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">${cl}</div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:9px;color:var(--mt)">${meds.length} med.</span><span style="font-family:'Bebas Neue';font-size:16px;color:var(--gn)">${fmt(pend)}</span></div></div><div class="pb">${meds.map(m=>{const d=dTo(m.vc);const cs=d===null?'':d<=0?'color:var(--red)':d<=3?'color:var(--yw)':'';return`<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:var(--cd2);border:1px solid var(--br);border-radius:4px;margin-bottom:3px"><div><div style="font-size:11px;font-weight:500">${m.ms||''} · ${fmtData(m.de)} – ${fmtData(m.at)}</div><div style="font-size:9px;color:var(--mt)">${m.hr||'-'}h${m.dc?' · Desc:'+fmt(m.dc):''}${m.fluxo==='nao'?' · 🚫 Fora fluxo':''}</div></div><div style="display:flex;align-items:center;gap:4px">${bdg(m.st)}<span style="font-family:'Barlow Condensed';font-size:12px;font-weight:700;color:var(--gn)">${fmt(m.total)}</span><span style="font-size:9px;${cs}">${m.vc||''}</span><button class="btn btn-xs" style="background:#25D366;color:#fff;border:none" onclick="whatsMed('${m.id}')" title="Enviar WhatsApp">📲</button><button class="btn bcy btn-xs" onclick="verMed('${m.id}')" title="Ver">🔍</button><button class="btn bw btn-xs" onclick="editMed('${m.id}')" title="Editar medição">✏️</button><button class="btn bg btn-xs" onclick="advMed('${m.id}')" title="Avançar status">→</button><button class="btn bd btn-xs" onclick="delMed('${m.id}')" title="Excluir">×</button></div></div>`;}).join('')}</div></div>`;}).join('');}

function rdVendas(){const tot=D.vendas.length;const rec=D.vendas.filter(v=>v.st==='pago').reduce((s,v)=>s+(v.total||0),0);const pend=D.vendas.filter(v=>v.st!=='pago').reduce((s,v)=>s+(v.total||0),0);document.getElementById('v-rec').textContent=fmtk(rec);document.getElementById('v-pend').textContent=fmtk(pend);document.getElementById('v-tot').textContent=tot;const tb=document.getElementById('venda-tb');if(!D.vendas.length){tb.innerHTML='<tr><td colspan="8" class="empty">Nenhuma venda</td></tr>';return;}tb.innerHTML=[...D.vendas].reverse().map(v=>`<tr><td><span class="os-num">${v.num}</span></td><td><b>${v.cli}</b></td><td style="font-size:9px">${fmtData(v.dt)}</td><td>${(v.items||[]).length}</td><td style="color:var(--gn);font-weight:600">${fmt(v.total)}</td><td style="font-size:9px">${v.pag}</td><td>${v.faturada===false?'<span class="badge b-or">⏳ A Faturar</span>':(v.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-bl">Faturada</span>')}</td><td style="white-space:nowrap"><button class="btn bg btn-xs" onclick="verVenda('${v.id}')">👁</button> ${v.faturada===false?`<button class="btn bw btn-xs" onclick="editVenda('${v.id}')" title="Editar valor/itens antes de faturar">✏️</button> <button class="btn bs btn-xs" onclick="faturarVenda('${v.id}')" title="Faturar e enviar ao Contas a Receber">💰 Faturar</button> `:''}<button class="btn bd btn-xs" onclick="delVenda('${v.id}')">×</button></td></tr>`).join('');}
function verVenda(id){const v=D.vendas.find(x=>x.id===id);if(!v)return;document.getElementById('view-title').textContent='🛒 Venda '+v.num;document.getElementById('view-body').innerHTML=`<div style="text-align:center;margin-bottom:12px"><div style="font-family:'Bebas Neue';font-size:30px;color:var(--red)">MH3 RENTAL LTDA</div><div style="font-size:9px;color:var(--mt)">NOTA DE VENDA — ${v.num}</div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px"><div class="rel-card"><div class="stat-label">Cliente</div><div class="stat-value">${v.cli}</div></div><div class="rel-card"><div class="stat-label">Data</div><div class="stat-value">${fmtData(v.dt)}</div></div><div class="rel-card"><div class="stat-label">Pagamento</div><div class="stat-value">${v.pag}</div></div><div class="rel-card"><div class="stat-label">Status</div>${v.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">Pendente</span>'}</div></div><div class="rel-card" style="margin-bottom:8px"><div style="font-size:9px;font-weight:700;color:var(--mt);text-transform:uppercase;margin-bottom:6px">Itens</div>${v.items.map(i=>`<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--br)"><div><span style="font-size:10px;font-weight:500">${i.desc}</span><span style="font-size:9px;color:var(--mt);margin-left:5px">${i.tipo} · ${i.qtd}x · ${fmt(i.val)}</span></div><span style="font-size:11px;font-weight:600">${fmt(i.qtd*i.val)}</span></div>`).join('')}${v.desc?`<div style="display:flex;justify-content:space-between;padding:4px 0;color:var(--red)"><span style="font-size:10px">Desconto ${v.desc}%</span><span>-${fmt(v.sub*v.desc/100)}</span></div>`:''}<div style="display:flex;justify-content:space-between;margin-top:6px;font-family:'Bebas Neue';font-size:18px"><span>TOTAL</span><span style="color:var(--gn)">${fmt(v.total)}</span></div></div>`;openM('m-view');}

function rdEstq(){
  if(typeof popTabelasEstq==='function')popTabelasEstq();
  if(typeof popCategorias==='function')popCategorias();const q=document.getElementById('estq-srch').value.toLowerCase();const tot=D.estoque.length,bx=D.estoque.filter(e=>e.qt<=e.mn).length,vl=D.estoque.reduce((s,e)=>s+((Number(e.qt)||0)*(Number(e.cv)||0)),0);document.getElementById('estq-tot').textContent=tot;document.getElementById('estq-bx').textContent=bx;document.getElementById('estq-vl').textContent=fmtk(vl);const tb=document.getElementById('estq-tb');let items=D.estoque;if(q)items=items.filter(e=>`${e.ds||''} ${e.cd||''} ${e.cat||''}`.toLowerCase().includes(q));if(!items.length){tb.innerHTML='<tr><td colspan="11" class="empty">Nenhum item</td></tr>';return;}tb.innerHTML=items.map(e=>`<tr><td style="font-size:9px;color:var(--mt)">${e.cd||'-'}</td><td><b>${e.ds}</b></td><td style="font-size:9px">${e.cat}</td><td style="font-weight:700;${e.qt<=e.mn?'color:var(--yw)':''}">${e.qt}</td><td style="font-size:9px">${e.mn}</td><td style="font-size:9px">${e.un}</td><td>${fmt(e.cv)}</td><td style="color:var(--pu)">${fmt(e.pv||0)}</td><td style="color:var(--gn)">${fmt((Number(e.qt)||0)*(Number(e.cv)||0))}</td><td>${e.qt<=0?'<span class="badge b-rd">Zerado</span>':e.qt<=e.mn?'<span class="badge b-yw">Baixo</span>':'<span class="badge b-gn">OK</span>'}</td><td style="white-space:nowrap"><button class="btn bcy btn-xs" onclick="verEstqItem('${e.id}')">🔍</button> <button class="btn bg btn-xs" onclick="mvEstq('${e.id}',1)">+</button> <button class="btn bd btn-xs" onclick="mvEstq('${e.id}',-1)">−</button> <button class="btn bw btn-xs" onclick="openEditEstq('${e.id}')">✏</button> <button class="btn bd btn-xs" onclick="delEstq('${e.id}')">×</button></td></tr>`).join('');}
function printEstq(){document.getElementById('view-title').textContent='📦 Estoque';const tot=D.estoque.reduce((s,e)=>s+((Number(e.qt)||0)*(Number(e.cv)||0)),0);document.getElementById('view-body').innerHTML=`<div style="text-align:center;margin-bottom:12px"><div style="font-family:'Bebas Neue';font-size:30px;color:var(--red)">MH3 RENTAL LTDA</div><div style="font-size:9px;color:var(--mt)">RELATÓRIO DE ESTOQUE · ${new Date().toLocaleDateString('pt-BR')}</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:10px"><div class="rel-card" style="text-align:center"><div class="stat-label">Itens</div><div style="font-family:'Bebas Neue';font-size:26px">${D.estoque.length}</div></div><div class="rel-card" style="text-align:center"><div class="stat-label">Estoque Baixo</div><div style="font-family:'Bebas Neue';font-size:26px;color:var(--yw)">${D.estoque.filter(e=>e.qt<=e.mn).length}</div></div><div class="rel-card" style="text-align:center"><div class="stat-label">Valor Total</div><div style="font-family:'Bebas Neue';font-size:26px;color:var(--gn)">${fmt(tot)}</div></div></div><div class="tw"><table><thead><tr><th>Cód.</th><th>Descrição</th><th>Cat.</th><th>Qtd</th><th>Un</th><th>Custo</th><th>Venda</th><th>Total</th><th>Sit.</th></tr></thead><tbody>${D.estoque.map(e=>`<tr><td style="font-size:9px">${e.cd||'-'}</td><td><b>${e.ds}</b></td><td style="font-size:9px">${e.cat}</td><td style="font-weight:700;${e.qt<=e.mn?'color:var(--yw)':''}">${e.qt}</td><td style="font-size:9px">${e.un}</td><td>${fmt(e.cv)}</td><td>${fmt(e.pv||0)}</td><td style="color:var(--gn)">${fmt((Number(e.qt)||0)*(Number(e.cv)||0))}</td><td>${e.qt<=0?'<span class="badge b-rd">Zerado</span>':e.qt<=e.mn?'<span class="badge b-yw">Baixo</span>':'<span class="badge b-gn">OK</span>'}</td></tr>`).join('')}</tbody></table></div>`;openM('m-view');}

function rdNf(){const tb=document.getElementById('nf-tb');if(!D.nfs.length){tb.innerHTML='<tr><td colspan="8" class="empty">Nenhuma NF</td></tr>';return;}tb.innerHTML=[...D.nfs].reverse().map(n=>`<tr><td style="font-family:'Barlow Condensed';font-size:11px;font-weight:700;color:var(--bl)">NF ${n.num}</td><td><b>${n.forn||'-'}</b></td><td style="font-size:9px">${fmtData(n.dt)}</td><td>${n.items.length}</td><td style="color:var(--gn);font-weight:600">${fmt(n.vl)}</td><td style="font-size:9px;${n.vc&&dTo(n.vc)<0&&n.st!=='pago'?'color:var(--red)':''}">${fmtData(n.vc)}</td><td>${n.cp==='sim'?(n.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">C.Pagar</span>'):'<span class="badge b-gr">Fora</span>'}</td><td style="white-space:nowrap"><button class="btn bcy btn-xs" onclick="verNf('${n.id}')">🔍</button> <button class="btn bs btn-xs" onclick="pagarNf('${n.id}')">✓</button> <button class="btn bd btn-xs" onclick="delNf('${n.id}')">×</button></td></tr>`).join('');}

function rdDesp(){const q=document.getElementById('desp-srch').value.toLowerCase();const cat=document.getElementById('desp-fcat').value;let items=D.despesas;if(cat)items=items.filter(d=>d.cat===cat);if(q)items=items.filter(d=>`${d.desc||''} ${d.placa||''} ${d.forn||''}`.toLowerCase().includes(q));const tot=items.reduce((s,d)=>s+(d.vl||0),0);const ap=items.filter(d=>d.st==='pendente').reduce((s,d)=>s+(d.vl||0),0);const pg=items.filter(d=>d.st==='pago').reduce((s,d)=>s+(d.vl||0),0);document.getElementById('desp-tot').textContent=fmtk(tot);document.getElementById('desp-ap').textContent=fmtk(ap);document.getElementById('desp-pg').textContent=fmtk(pg);const tb=document.getElementById('desp-tb');if(!items.length){tb.innerHTML='<tr><td colspan="10" class="empty">Nenhuma despesa</td></tr>';return;}tb.innerHTML=[...items].reverse().map(d=>`<tr><td style="font-size:9px">${fmtData(d.dt)}</td><td><b>${d.desc}</b></td><td style="font-size:9px">${d.cat}</td><td>${d.placa?`<span class="tag-p">${d.placa}</span>`:'-'}</td><td style="font-size:9px">${d.doc||'-'}${d.ndoc?' #'+d.ndoc:''}</td><td style="color:var(--or);font-weight:600">${fmt(d.vl)}</td><td style="font-size:9px;${d.vc&&dTo(d.vc)<0&&d.st!=='pago'?'color:var(--red)':''}">${fmtData(d.vc)}</td><td>${d.fluxo==='nao'?'<span class="badge b-gr">Fora</span>':'<span class="badge b-bl">Fluxo</span>'}</td><td>${d.st==='pago'?'<span class="badge b-gn">Pago</span>':'<span class="badge b-yw">Pendente</span>'}</td><td style="white-space:nowrap"><button class="btn bcy btn-xs" onclick="verDesp('${d.id}')">🔍</button> <button class="btn bs btn-xs" onclick="advDesp('${d.id}')">✓</button> <button class="btn bw btn-xs" onclick="openEditDesp('${d.id}')">✏</button> <button class="btn bd btn-xs" onclick="delDesp('${d.id}')">×</button></td></tr>`).join('');}


function baixarCp(id, tipo){
  const item = tipo==='NF'? (D.nfs||[]).find(n=>n.id===id) : (D.despesas||[]).find(d=>d.id===id);
  if(!item){toast('Conta não encontrada','er');return;}
  const valor = parseFloat(item.vl||item.total||item.valor||0)||0;
  const desc = item.desc||item.descricao||item.forn||item.fornecedor||'Conta';
  abrirSelBanco('pagar', id, tipo, valor, desc);
}

function rdFin(){const prev=D.contratos.filter(c=>c.status==='ativo').reduce((s,c)=>s+(parseFloat(c.vl)||0),0);const rec=D.medicoes.filter(m=>m.st==='paga').reduce((s,m)=>s+(m.total||0),0)+D.vendas.filter(v=>v.st==='pago').reduce((s,v)=>s+(v.total||0),0);const ar=D.medicoes.filter(m=>m.st!=='paga').reduce((s,m)=>s+(m.total||0),0)+D.vendas.filter(v=>v.st!=='pago'&&v.faturada!==false).reduce((s,v)=>s+(v.total||0),0);const ap=D.nfs.filter(n=>n.st!=='pago'&&n.cp==='sim').reduce((s,n)=>s+(n.vl||0),0)+D.despesas.filter(d=>d.st==='pendente').reduce((s,d)=>s+(d.vl||0),0);document.getElementById('f-prev').textContent=fmtk(prev);document.getElementById('f-rec').textContent=fmtk(rec);document.getElementById('f-ar').textContent=fmtk(ar);document.getElementById('f-ap2').textContent=fmtk(ap);

  // Render Prejuízos
  const prejTb=document.getElementById('fin-prej-tb');
  if(prejTb){
    const atrasadas=D.medicoes.filter(m=>m.st==='atrasado'||m.prejuizo);
    const totalPrej=atrasadas.reduce((s,m)=>s+(m.total||0),0);
    prejTb.innerHTML=atrasadas.length?atrasadas.map(m=>`<tr>
      <td><b>${m.cl}</b></td>
      <td style="font-size:10px">${fmtData(m.de)} – ${fmtData(m.at)}</td>
      <td style="color:var(--red);font-weight:600">${fmt(m.total)}</td>
      <td style="font-size:10px;color:var(--red)">${fmtData(m.vc)}</td>
      <td style="font-size:10px">${m.placa||'-'}</td>
      <td><span class="badge b-rd">⚠️ Atrasado</span></td>
    </tr>`).join(''):'<tr><td colspan="6" class="empty">Sem prejuízos registrados</td></tr>';
    const el=document.getElementById('fin-prej-total');
    if(el) el.textContent=fmt(totalPrej);
  }
const medtb=document.getElementById('fin-med-tb');medtb.innerHTML=D.medicoes.length?[...D.medicoes].reverse().map(m=>`<tr><td><b>${m.cl}</b></td><td style="font-size:9px">${fmtData(m.de)} – ${fmtData(m.at)}</td><td>${fmt(m.vl)}</td><td style="color:var(--red)">${m.dc?fmt(m.dc):'-'}</td><td style="color:var(--gn);font-weight:600">${fmt(m.total)}</td><td style="font-size:9px;${m.vc&&dTo(m.vc)<0&&m.st!=='paga'?'color:var(--red)':''}">${fmtData(m.vc)}</td><td>${m.fluxo==='nao'?'<span class="badge b-gr">Fora</span>':'<span class="badge b-bl">Fluxo</span>'}</td><td>
  <select style="font-size:11px;padding:2px 4px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" 
    onchange="setStMed('${m.id}',this.value,this)">
    <option value="pendente" ${m.st==='pendente'||!m.st?'selected':''}>⏳ Pendente</option>
    <option value="paga" ${m.st==='paga'?'selected':''}>✅ Recebido</option>
    <option value="atrasado" ${m.st==='atrasado'?'selected':''}>🔴 Atrasado</option>
    <option value="remarcado" ${m.st==='remarcado'?'selected':''}>📅 Remarcado</option>
  </select>
</td><td><button class="btn bg btn-xs" onclick="advMed('${m.id}')">→</button></td></tr>`).join(''):'<tr><td colspan="9" class="empty">Sem lançamentos</td></tr>';
const vendtb=document.getElementById('fin-vend-tb');vendtb.innerHTML=D.vendas.length?[...D.vendas].reverse().map(v=>`<tr><td class="os-num">${v.num}</td><td><b>${v.cli}</b></td><td style="font-size:9px">${fmtData(v.dt)}</td><td style="color:var(--gn);font-weight:600">${fmt(v.total)}</td><td style="font-size:9px">${v.pag}</td><td>
  <select style="font-size:11px;padding:2px 4px;border-radius:5px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" onchange="setStVenda('${v.id}',this.value,this)">
    <option value="pendente" ${v.st==='pendente'||!v.st?'selected':''}>⏳ Pendente</option>
    <option value="pago" ${v.st==='pago'?'selected':''}>✅ Recebido</option>
    <option value="atrasado" ${v.st==='atrasado'?'selected':''}>🔴 Atrasado</option>
    <option value="remarcado" ${v.st==='remarcado'?'selected':''}>📅 Remarcado</option>
  </select>
</td><td><button class="btn bs btn-xs" onclick="advVenda('${v.id}')">✓</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">Sem vendas</td></tr>';

const cptb=document.getElementById('fin-cp-tb');const cpItems=[...D.nfs.filter(n=>n.cp==='sim').map(n=>({...n,tipo:'NF',desc:'NF '+n.num,forn:n.forn,vl:n.vl,vc:n.vc,st:n.st})),...D.despesas.map(d=>({...d,tipo:'Despesa',desc:d.desc,forn:d.forn,st:d.st}))].sort((a,b)=>new Date(a.vc||'9999')-new Date(b.vc||'9999'));cpItems.length?cpItems.forEach(()=>{}):'';cptb.innerHTML=cpItems.length?cpItems.map(c=>`<tr><td style="font-size:9px">${fmtData(c.dt)}</td><td style="font-size:10px"><b>${c.desc}</b></td><td><span class="badge b-gr">${c.tipo}</span></td><td style="font-size:9px">${c.forn||'-'}</td><td style="color:var(--or);font-weight:600">${fmt(c.vl)}</td><td style="font-size:9px;${c.vc&&dTo(c.vc)<0&&c.st!=='pago'?'color:var(--red)':''}">${fmtData(c.vc)}</td><td>${c.st==='pago'?'<span class="badge b-gn">✅ Pago</span>':'<span class="badge b-yw">⏳ Pendente</span>'}</td>
      <td>${c.st!=='pago'?`<button class="btn bg btn-xs" onclick="baixarCp('${c.id}','${c.tipo}')">✓ Baixar</button>`:'<span style="font-size:9px;color:var(--mt)">Quitado</span>'}</td></tr>`).join(''):'<tr><td colspan="7" class="empty">Nenhuma conta a pagar</td></tr>';}
function fatOS(id){if(!confirm('Marcar como faturado?'))return;const m=D.manutencoes.find(x=>x.id===id);if(m){m.finStatus='faturado';sv();rdFin();toast('OS faturada!');}}

function rdFluxo(){
  if(typeof rdContasBanco==="function")rdContasBanco();const sel=document.getElementById('fluxo-mes');const meses=[];const hoje=new Date();for(let i=5;i>=0;i--){const d=new Date(hoje.getFullYear(),hoje.getMonth()-i,1);meses.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0'));}if(!sel.innerHTML.trim()||sel.options.length<meses.length){sel.innerHTML=meses.map(m=>`<option value="${m}">${m}</option>`).join('');sel.value=meses[meses.length-1];}const mes=sel.value;
const entradas=[...D.medicoes.filter(m=>m.ms===mes&&m.st!=='atrasado').map(m=>({desc:`Medição ${m.cl}`,val:m.total||0})),...D.vendas.filter(v=>v.dt&&v.dt.startsWith(mes)&&v.st!=='atrasado'&&v.faturada!==false).map(v=>({desc:`Venda ${v.num} ${v.cli}`,val:v.total||0}))];
const saidas=[...D.despesas.filter(d=>d.dt&&d.dt.startsWith(mes)&&d.st!=='atrasado').map(d=>({desc:d.desc+(d.placa?' ['+d.placa+']':''),val:d.vl||0})),...D.nfs.filter(n=>n.dt&&n.dt.startsWith(mes)&&n.cp==='sim').map(n=>({desc:`NF ${n.num} ${n.forn}`,val:n.vl||0}))];
const totEnt=entradas.reduce((s,i)=>s+(i.val||0),0);const totSai=saidas.reduce((s,i)=>s+(i.val||0),0);const sal=totEnt-totSai;document.getElementById('fl-ent').textContent=fmtk(totEnt);document.getElementById('fl-sai').textContent=fmtk(totSai);document.getElementById('fl-sal').textContent=fmtk(sal)
;document.getElementById('fl-sal').style.color=sal>=0?'var(--gn)':'var(--red)';
const todasEnt=D.medicoes.filter(m=>m.st!=='atrasado').reduce((s,m)=>s+(m.total||0),0)+D.vendas.filter(v=>v.st!=='atrasado'&&v.faturada!==false).reduce((s,v)=>s+(v.total||0),0);const todasSai=D.despesas.filter(d=>d.st!=='atrasado').reduce((s,d)=>s+(d.vl||0),0)+D.nfs.filter(n=>n.cp==='sim').reduce((s,n)=>s+(n.vl||0),0);(function(){const sb=(typeof saldoBancarioFluxo==='function')?saldoBancarioFluxo():0;const acum=todasEnt-todasSai+sb;const el=document.getElementById('fl-acu');el.textContent=fmtk(acum);el.style.color=acum>=0?'var(--gn)':'var(--red)';})();
document.getElementById('fl-ent-list').innerHTML=entradas.length?entradas.map(i=>`<div class="stat-row"><div class="stat-label">${i.desc}</div><div class="stat-value gn">${fmt(i.val)}</div></div>`).join(''):'<div style="font-size:10px;color:var(--mt)">Sem entradas no mês</div>';
document.getElementById('fl-sai-list').innerHTML=saidas.length?saidas.map(i=>`<div class="stat-row"><div class="stat-label">${i.desc}</div><div class="stat-value rd">${fmt(i.val)}</div></div>`).join(''):'<div style="font-size:10px;color:var(--mt)">Sem saídas no mês</div>';
const barData=meses.map(m=>{const e=D.medicoes.filter(x=>x.ms===m&&x.st!=='atrasado').reduce((s,x)=>s+(x.total||0),0)+D.vendas.filter(x=>x.dt&&x.dt.startsWith(m)&&x.st==='pago').reduce((s,x)=>s+(x.total||0),0);const s=D.despesas.filter(x=>x.dt&&x.dt.startsWith(m)&&x.fluxo!=='nao').reduce((s,x)=>s+(x.vl||0),0);return{m,e,s};});const maxV=Math.max(...barData.map(b=>Math.max(b.e,b.s)),1);document.getElementById('fl-chart').innerHTML=barData.map(b=>`<div class="chart-bar-col"><div style="display:flex;gap:2px;align-items:flex-end"><div class="chart-bar" style="height:${Math.round(b.e/maxV*90)}px;background:var(--gn);opacity:.85;width:12px"></div><div class="chart-bar" style="height:${Math.round(b.s/maxV*90)}px;background:var(--red);opacity:.75;width:12px"></div></div><div class="chart-bar-lbl">${b.m.substr(5)}</div></div>`).join('');}

