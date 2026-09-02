// ---- EMPRESAS (cadastro; OS só para placas de empresa cadastrada) ----
function getEmpresas(){
  if(!D.config.empresas)D.config.empresas=[];
  return D.config.empresas;
}
function popEmpresas(){
  // Popula selects de empresa (veículo)
  const sel=document.getElementById('eq-empresa');
  if(sel){
    const atual=sel.value;
    sel.innerHTML='<option value="">Selecionar...</option>';
    getEmpresas().forEach(e=>{sel.innerHTML+=`<option value="${e.nome}">${e.nome}</option>`;});
    if(atual)sel.value=atual;
  }
}
function novaEmpresa(){
  const nome=prompt('Nome da empresa:');
  if(!nome||!nome.trim())return;
  const n=nome.trim();
  const lista=getEmpresas();
  if(lista.some(e=>e.nome.toLowerCase()===n.toLowerCase())){toast('Empresa já cadastrada','er');return;}
  const cnpj=prompt('CNPJ da empresa (opcional):')||'';
  lista.push({id:uid(),nome:n,cnpj:cnpj.trim()});
  // Se é a 1ª empresa, oferece atribuir todos os veículos sem empresa a ela
  const semEmpresa=D.equips.filter(e=>!e.empresa);
  if(lista.length===1 && semEmpresa.length>0){
    if(confirm('Deseja atribuir os '+semEmpresa.length+' veículos atuais à empresa "'+n+'"?\n\n(Necessário para poder gerar OS para eles.)')){
      semEmpresa.forEach(e=>{e.empresa=n;});
      toast(semEmpresa.length+' veículos atribuídos a '+n,'ok');
    }
  }
  sv();
  if(document.getElementById('eq-empresa')){popEmpresas();document.getElementById('eq-empresa').value=n;}
  if(typeof rdEmpresas==='function')rdEmpresas();
  toast('Empresa "'+n+'" cadastrada!','ok');
}
function delEmpresa(id){
  reqSenha(()=>{
    const e=getEmpresas().find(x=>x.id===id);
    if(!e)return;
    if(!confirm('Excluir a empresa "'+e.nome+'"?\n\nOs veículos dela ficarão sem empresa (não poderão gerar OS até serem reatribuídos).'))return;
    D.config.empresas=getEmpresas().filter(x=>x.id!==id);
    if(typeof auditarExclusao==='function')auditarExclusao('empresas','Excluiu empresa: '+(e.nome||id));
    sv();if(typeof rdEmpresas==='function')rdEmpresas();
    toast('Empresa excluída','ok');
  });
}

function toggleEmpresasPanel(){
  const p=document.getElementById('empresas-panel');
  if(!p)return;
  p.style.display=p.style.display==='none'?'':'none';
  if(p.style.display!=='none')rdEmpresas();
}
function rdEmpresas(){
  const el=document.getElementById('empresas-lista');
  if(!el)return;
  const lista=getEmpresas();
  if(!lista.length){el.innerHTML='<p class="empty" style="padding:8px">Nenhuma empresa cadastrada. Cadastre ao menos uma para poder gerar OS.</p>';return;}
  el.innerHTML='<div class="tw"><table><thead><tr><th>Empresa</th><th>CNPJ</th><th>Veículos</th><th></th></tr></thead><tbody>'+
    lista.map(e=>{
      const qtd=D.equips.filter(v=>v.empresa===e.nome).length;
      return `<tr><td><b>${e.nome}</b></td><td style="font-size:11px">${e.cnpj||'-'}</td><td>${qtd}</td>
      <td><button class="btn bd btn-xs" onclick="delEmpresa('${e.id}')" title="Excluir">×</button></td></tr>`;
    }).join('')+'</tbody></table></div>';
}

// ---- RESPONSÁVEIS DE OS (cadastrável) ----
function getResponsaveis(){
  if(!D.config.responsaveis)D.config.responsaveis=[];
  if(!D.config.responsaveis)D.config.responsaveis=[];
  if(!D.config.empresas)D.config.empresas=[];
  return D.config.responsaveis;
}
function popResponsaveis(){
  const sel=document.getElementById('mn-re');
  if(!sel)return;
  const atual=sel.value;
  sel.innerHTML='<option value="">Selecionar...</option>';
  getResponsaveis().forEach(r=>{sel.innerHTML+=`<option value="${r}">${r}</option>`;});
  sel.innerHTML+='<option value="__manual__">✏️ Digitar manual...</option>';
  if(atual)sel.value=atual;
}
function novoResponsavel(){
  const nome=prompt('Nome do novo responsável:');
  if(!nome||!nome.trim())return;
  const n=nome.trim();
  const lista=getResponsaveis();
  if(lista.some(r=>r.toLowerCase()===n.toLowerCase())){toast('Responsável já cadastrado','er');return;}
  lista.push(n);
  sv();popResponsaveis();
  document.getElementById('mn-re').value=n;
  toggleRespManual();
  toast('Responsável "'+n+'" cadastrado!','ok');
}
function toggleRespManual(){
  const sel=document.getElementById('mn-re');
  const man=document.getElementById('mn-re-manual');
  if(!sel||!man)return;
  if(sel.value==='__manual__'){man.style.display='';man.focus();}
  else{man.style.display='none';man.value='';}
}

function popSels(){
  if(typeof popResponsaveis==='function')popResponsaveis();
  if(typeof popEmpresas==='function')popEmpresas();
  const empresasCad=getEmpresas().map(e=>e.nome);
  // mn-eq: SÓ veículos de empresa cadastrada (regra da OS). ct-eq: todos disponíveis.
  ['mn-eq','ct-eq'].forEach(id=>{const el=document.getElementById(id);if(!el)return;el.innerHTML='<option value="">Selecionar...</option>';let lista=D.equips.filter(e=>e.st!=='vendido'&&e.st!=='imobilizado');if(id==='mn-eq')lista=lista.filter(e=>e.empresa&&empresasCad.includes(e.empresa));lista.forEach(e=>{el.innerHTML+=`<option value="${e.id}">${e.placa} — ${e.mk} ${e.mo}${e.empresa?' ['+e.empresa+']':''}</option>`;});});
  const mct=document.getElementById('med-ct');if(mct){mct.innerHTML='<option value="">Selecionar...</option>';D.contratos.filter(c=>c.status==='ativo').forEach(c=>{mct.innerHTML+=`<option value="${c.id}">${c.cl} — ${c.placa||'?'}</option>`;});}
  const eqMobCl=document.getElementById('eq-mob-cl');
  if(eqMobCl){eqMobCl.innerHTML='<option value="">Selecionar checklist...</option>';D.checklists.forEach(c=>{eqMobCl.innerHTML+=`<option value="${c.id}">${c.nm}</option>`;});}
  const clm=document.getElementById('mn-cl-mod');if(clm){clm.innerHTML='<option value="">➕ Adicionar checklist...</option>';D.checklists.forEach(c=>{clm.innerHTML+=`<option value="${c.id}">${c.nm}</option>`;});}
  const cici=document.getElementById('ct-ci');if(cici){cici.innerHTML='<option value="">Selecionar...</option>';(D.config.ciclos||[]).forEach(c=>{cici.innerHTML+=`<option value="${c}">${c}</option>`;});}
  const mntp=document.getElementById('mn-tp');if(mntp){mntp.innerHTML='';(D.config.tiposOS||['Revisão Preventiva']).forEach(t=>{mntp.innerHTML+=`<option>${t}</option>`;});}
  const dp=document.getElementById('desp-placa');if(dp){dp.innerHTML='<option value="">Geral (sem placa)</option>';D.equips.forEach(e=>{dp.innerHTML+=`<option value="${e.placa}">${e.placa} — ${e.mk} ${e.mo}</option>`;});}
}

// ============ EQUIP ============
function addEqFotos(inp){Array.from(inp.files).forEach(f=>{_comprimirImg(f,1600,0.72,function(src,nm){var o={id:uid(),src:src,name:nm};eqFotos.push(o);rdEqFotos();_uploadFoto(src,nm,function(u){if(u&&u!==src){o.src=u;rdEqFotos();}});});});}
function rdEqFotos(){const g=document.getElementById('eq-foto-grid');if(!g)return;g.innerHTML='<label class="foto-add" for="eq-foto-inp">+</label><input type="file" id="eq-foto-inp" accept="image/*" multiple style="display:none" onchange="addEqFotos(this)">';eqFotos.forEach(f=>{const wrap=document.createElement('div');wrap.style.cssText='position:relative;display:inline-block';const i=document.createElement('img');i.src=f.src;i.className='foto-thumb';i.onclick=()=>openLB(f.src);const b=document.createElement('button');b.type='button';b.textContent='×';b.title='Excluir foto';b.style.cssText='position:absolute;top:2px;right:2px;width:20px;height:20px;border:none;border-radius:50%;background:rgba(200,16,46,.92);color:#fff;font-weight:700;cursor:pointer;line-height:1;font-size:13px;padding:0';b.onclick=(ev)=>{ev.stopPropagation();delEqFoto(f.id);};wrap.appendChild(i);wrap.appendChild(b);g.appendChild(wrap);});}
function delEqFoto(id){if(!confirm('Excluir esta foto?'))return;eqFotos=eqFotos.filter(x=>x.id!==id);rdEqFotos();}
function addEqArq(inp){Array.from(inp.files).forEach(f=>{_comprimirImg(f,1600,0.72,function(src,nm,tp,sz){eqArqs.push({id:uid(),name:nm,type:tp,size:sz,src:src});rdEqArqs();});});}
function rdEqArqs(){const el=document.getElementById('eq-arq-list');if(!el)return;el.innerHTML=eqArqs.length?eqArqs.map(a=>`<div class="doc-item"><span>${a.type&&a.type.includes('pdf')?'📄':'🖼'}</span><span class="doc-name">${a.name}</span><span style="font-size:9px;color:var(--mt)">${Math.round(a.size/1024)}KB</span><button class="btn bd btn-xs" onclick="rmEqArq('${a.id}')">×</button></div>`).join(''):'<div style="font-size:10px;color:var(--mt)">Nenhum arquivo</div>';}
function rmEqArq(id){eqArqs=eqArqs.filter(x=>x.id!==id);rdEqArqs();}
function gerarCamposParc(){
  const n=parseInt(document.getElementById('eq-nparc').value)||0;
  if(!n||n<1){toast('Informe a quantidade de parcelas primeiro','er');return;}
  if(n>120){toast('Máximo 120 parcelas','er');return;}
  const d1=document.getElementById('eq-d1parc').value;
  const tipo=document.getElementById('eq-tparc').value;
  const valorFixo=parseFloat(document.getElementById('eq-vparc').value)||0;
  const lista=document.getElementById('eq-parc-var-lista');
  if(!lista) return;
  if(tipo==='fixa'&&!valorFixo){toast('Para parcela fixa, informe o valor da parcela primeiro','er');return;}
  lista.innerHTML='';
  for(let i=1;i<=n;i++){
    let vc='';
    if(d1){
      const dt=new Date(d1);
      dt.setMonth(dt.getMonth()+(i-1));
      vc=dt.toISOString().substring(0,10);
    }
    // Fixa: preenche todos com mesmo valor; Variável: campo vazio
    const valorCampo = tipo==='fixa' ? valorFixo.toFixed(2) : '';
    const readonly = tipo==='fixa' ? 'readonly' : '';
    const bg = tipo==='fixa' ? 'var(--cd2)' : 'var(--cd)';
    lista.innerHTML+=`<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;background:var(--cd2);padding:6px;border-radius:6px">
      <span style="font-size:11px;color:var(--mt);min-width:70px">Parcela ${i}/${n}</span>
      <input type="number" id="eq-pv-val-${i}" value="${valorCampo}" placeholder="R$ 0,00" step="0.01" ${readonly} style="flex:1;padding:6px;border:1px solid var(--br);border-radius:5px;background:${bg};color:var(--tx);font-size:13px">
      <input type="date" id="eq-pv-vc-${i}" value="${vc}" style="flex:1;padding:6px;border:1px solid var(--br);border-radius:5px;background:var(--cd);color:var(--tx);font-size:13px">
    </div>`;
  }
  if(tipo==='fixa') toast(`${n} parcelas geradas com valor fixo de ${fmt(valorFixo)}!`,'ok');
  else toast(`${n} campos gerados! Preencha o valor de cada parcela.`,'ok');
}

function lancarParcelasContaPagar(eq, nParc, tParc, vParc, d1Parc, banco, situ){
  // Launch installments to Contas a Pagar (D.nfs which is the bills module)
  const desc=`${situ.toUpperCase()} - ${eq.placa} ${eq.mk} ${eq.mo} - ${banco||''}`;
  for(let i=1;i<=nParc;i++){
    let vc='';
    let vl=parseFloat(vParc)||0;
    if(tParc==='variavel'){
      const valEl=document.getElementById('eq-pv-val-'+i);
      const vcEl=document.getElementById('eq-pv-vc-'+i);
      vl=parseFloat(valEl?valEl.value:0)||0;
      vc=vcEl?vcEl.value:'';
    } else {
      if(d1Parc){
        const dt=new Date(d1Parc);
        dt.setMonth(dt.getMonth()+(i-1));
        vc=dt.toISOString().substring(0,10);
      }
    }
    D.nfs.push({
      id:uid(),
      num:`PARC-${eq.placa}-${String(i).padStart(3,'0')}`,
      forn:`Financiamento ${eq.placa}`,
      desc:`${desc} — Parcela ${i}/${nParc}`,
      vl:vl,
      vc:vc,
      dt:new Date().toISOString().substring(0,10),
      st:'pendente',
      cp:'sim',
      cat:'Financiamento',
      placa:eq.placa,
      eqId:eq.id,
      parcela:i,
      totalParc:nParc,
      travada:true
    });
  }
}

function alertaVenc(inputId, alertId){
  const val=document.getElementById(inputId).value;
  const el=document.getElementById(alertId);
  if(!el||!val) return;
  const dias=Math.ceil((new Date(val)-new Date())/(1000*60*60*24));
  if(dias<0) el.textContent='⚠️ VENCIDO há '+Math.abs(dias)+' dias';
  else if(dias<=30) el.textContent='⚠️ Vence em '+dias+' dias';
  else el.textContent='';
}

function toggleImplemento(){var s=document.getElementById('eq-tem-impl');var box=document.getElementById('eq-impl-campos');if(box)box.style.display=(s&&s.value==='sim')?'':'none';}
function toggleParc(){
  const s=document.getElementById('eq-situ').value;
  document.getElementById('eq-parc-box').style.display=['financiado','consorcio'].includes(s)?'':'none';
}
function toggleParcTipo(){
  const t=document.getElementById('eq-tparc').value;
  document.getElementById('eq-parc-fixa-box').style.display=t==='fixa'?'':'none';
  document.getElementById('eq-parc-var-box').style.display=t==='variavel'?'':'none';
}
function saveEq(){
  if(typeof _fotosEnviando!=='undefined' && _fotosEnviando>0){ toast('⏳ Aguarde — ainda enviando '+_fotosEnviando+' foto(s) ao servidor. Tente salvar daqui a alguns segundos.','er'); return; }
  const pl=document.getElementById('eq-pl').value.trim().toUpperCase();
  const ch=document.getElementById('eq-ch').value.trim();
  const rv=document.getElementById('eq-rv').value.trim();
  const crv=document.getElementById('eq-crv')?document.getElementById('eq-crv').value.trim():'';
  const empresa=document.getElementById('eq-empresa')?document.getElementById('eq-empresa').value:'';
  const mo=document.getElementById('eq-mo').value.trim();
  const an=document.getElementById('eq-an').value.trim();
  if(!pl){toast('Placa é obrigatória','er');return;}
  if(!ch){toast('Chassi é obrigatório','er');return;}
  if(!rv){toast('Renavam é obrigatório','er');return;}
  if(!mo){toast('Modelo é obrigatório','er');return;}
  if(!an){toast('Ano é obrigatório','er');return;}
  const situ=document.getElementById('eq-situ').value;
  const vaql=document.getElementById('eq-vaql').value;
  const daql=document.getElementById('eq-daql').value;
  if(!vaql){toast('Valor de aquisição é obrigatório','er');return;}
  if(!daql){toast('Data de aquisição é obrigatória','er');return;}
  if(['financiado','consorcio'].includes(situ)){
    if(!document.getElementById('eq-nparc').value){toast('Informe a quantidade de parcelas','er');return;}
    const tp=document.getElementById('eq-tparc').value;
    if(tp==='fixa'&&!document.getElementById('eq-vparc').value){toast('Informe o valor da parcela','er');return;}
  }
  const eid=document.getElementById('eq-eid').value;
  const cond=document.querySelector('input[name="eq-cond"]:checked');
  const data={
    placa:pl,ano:an,mk:document.getElementById('eq-mk').value,
    mo:mo,pr:empresa,ch:ch,
    im:document.getElementById('eq-im').value,st:document.getElementById('eq-st').value,
    km:document.getElementById('eq-km').value,hr:document.getElementById('eq-hr').value,
    cond:cond?cond.value:'novo',ob:document.getElementById('eq-ob').value,
    rv:rv,crv:crv,empresa:empresa,crlv:document.getElementById('eq-crlv').value,
    /* seguro agora é por apólice na aba Seguro */
    antt:document.getElementById('eq-antt')?document.getElementById('eq-antt').value:'',
    crono:document.getElementById('eq-crono')?document.getElementById('eq-crono').value:'',
    docMan:document.getElementById('eq-doc-man')?document.getElementById('eq-doc-man').value:'',
    docManVc:document.getElementById('eq-doc-man-vc')?document.getElementById('eq-doc-man-vc').value:'',
    vaql:vaql,daql:daql,situ:situ,
    nparc:document.getElementById('eq-nparc').value,
    tparc:document.getElementById('eq-tparc').value,
    vparc:document.getElementById('eq-vparc').value,
    parcpg:document.getElementById('eq-parcpg').value,
    d1parc:document.getElementById('eq-d1parc').value,
    banco:document.getElementById('eq-banco').value,
    dtLevant:document.getElementById('eq-dt-levant')?document.getElementById('eq-dt-levant').value:'',
    vlQuitacao:parseFloat(document.getElementById('eq-vl-quitacao')?document.getElementById('eq-vl-quitacao').value:0)||0,
    vlAtual:parseFloat(document.getElementById('eq-vl-atual')?document.getElementById('eq-vl-atual').value:0)||0,
    desval12:parseFloat(document.getElementById('eq-desval12')?document.getElementById('eq-desval12').value:0)||0,
    desval35:parseFloat(document.getElementById('eq-desval35')?document.getElementById('eq-desval35').value:0)||0,
    im_mk:document.getElementById('eq-im-mk').value,
    im_mo:document.getElementById('eq-im-mo').value,
    im_vl:document.getElementById('eq-im-vl').value,
    im_dt:document.getElementById('eq-im-dt').value,
    im_ob:document.getElementById('eq-im-ob').value,
    fotos:[...eqFotos],arqs:[...eqArqs]
  };
  const _temImpl=document.getElementById('eq-tem-impl')?document.getElementById('eq-tem-impl').value:'nao';
  data.temImpl=_temImpl;
  if(_temImpl!=='sim'){data.im='';data.im_mk='';data.im_mo='';data.im_vl='';data.im_dt='';data.im_ob='';}
  ;(function(){var _kmN=((data.km||'')+''),_hrN=((data.hr||'')+'');if(eid){var _ant=D.equips.find(function(x){return x.id===eid;})||{};if(_kmN!==((_ant.km||'')+'')||_hrN!==((_ant.hr||'')+''))data.kmDt=today();}else{if(_kmN!==''||_hrN!=='')data.kmDt=today();}})();if(eid){const idx=D.equips.findIndex(x=>x.id===eid);if(idx>-1)D.equips[idx]={...D.equips[idx],...data};}
  else{data.id=uid();D.equips.push(data);}
  document.getElementById('eq-eid').value='';
  // Parcelas em Contas a Pagar (financiado/consórcio). Regra: apaga as automáticas deste veículo e refaz.
  const _eqId = eid || (D.equips[D.equips.length-1]||{}).id;
  const _eqRef = D.equips.find(x=>x.id===_eqId) || D.equips[D.equips.length-1];
  const _antesNfs = (D.nfs||[]).length;
  D.nfs = (D.nfs||[]).filter(n=>!(n.eqId===_eqId && n.travada && n.parcela));
  const _removidas = _antesNfs - D.nfs.length;
  if(['financiado','consorcio'].includes(situ)){
    const nParc=parseInt(document.getElementById('eq-nparc').value)||0;
    if(nParc>0 && _eqRef){
      const tParc=document.getElementById('eq-tparc').value;
      const vParc=document.getElementById('eq-vparc').value;
      const d1Parc=document.getElementById('eq-d1parc').value;
      const banco=document.getElementById('eq-banco').value;
      lancarParcelasContaPagar(_eqRef, nParc, tParc, vParc, d1Parc, banco, situ);
      toast(`Veículo salvo + ${nParc} parcela(s) em Contas a Pagar!`,'ok');
    } else {
      toast(eid?'Veículo/Equipamento atualizado!':'Veículo/Equipamento salvo!');
    }
  } else {
    if(_removidas>0) toast('Veículo salvo. Parcelas anteriores removidas do Contas a Pagar.','ok');
    else toast(eid?'Veículo/Equipamento atualizado!':'Veículo/Equipamento salvo!');
  }

  sv();closeM('m-eq');rdFrota();rdFin();
}
function _podeEditarDocsVeic(){
  if(typeof ehAdminAtual==='function' && ehAdminAtual()) return true;
  if(authUser && authUser.perms && authUser.perms['doc-veiculo']) return true;
  var nome=(authUser&&authUser.nome)||'';
  var u=(D.usuarios||[]).find(function(x){return (x.nm===nome)||(x.nome===nome);});
  return !!(u && u.perms && u.perms['doc-veiculo']);
}
function _travarTabsEdicao(restrito){
  window._eqTravado = !!restrito;
  ['teq-d','teq-fin','teq-impl'].forEach(function(tid){
    var t=document.getElementById(tid); if(!t)return;
    t.querySelectorAll('input,select,textarea,button').forEach(function(el){
      if(restrito){ el.setAttribute('disabled','disabled'); el.style.opacity='.55'; }
      else { el.removeAttribute('disabled'); el.style.opacity=''; }
    });
  });
  // As 3 abas sensíveis ficam SEMPRE visíveis. Quando trancadas, ganham um
  // cadeado (🔒); o clique nelas (tratado na função stab) pede a senha de admin.
  var tabs=document.querySelectorAll('#m-eq .tabs .tab');
  tabs.forEach(function(tab){
    var oc=tab.getAttribute('onclick')||'';
    var sensivel = oc.indexOf("'teq-d'")>=0 || oc.indexOf("'teq-fin'")>=0 || oc.indexOf("'teq-impl'")>=0;
    tab.style.display='';
    if(sensivel){
      if(!tab.getAttribute('data-lbl')) tab.setAttribute('data-lbl', tab.textContent.replace(/^🔒\s*/,''));
      var base=tab.getAttribute('data-lbl');
      tab.textContent = restrito ? ('🔒 '+base) : base;
      tab.style.opacity = restrito ? '.75' : '';
    }
  });
  var banner=document.getElementById('eq-restrito-aviso');
  if(banner) banner.style.display = restrito ? 'block' : 'none';
  if(restrito){
    var docTab=Array.prototype.slice.call(tabs).find(function(t){return (t.getAttribute('onclick')||'').indexOf("'teq-doc'")>=0;});
    if(docTab && typeof stab==='function') stab(docTab,'teq-doc');
  }
}
function openEditEq(id){if(_bloqEditar('frota'))return;
  var _adm = (typeof ehAdminAtual==='function' && ehAdminAtual());
  if(_adm){
    // Admin: abre com tudo liberado, sem pedir senha.
    _abrirEditEq(id,false);
  } else if(typeof _podeEditarDocsVeic==='function' && _podeEditarDocsVeic()){
    // Usuário liberado pelo admin: Documentos/Fotos/Arquivos livres. As abas
    // Dados/Financeiro/Implemento ficam VISÍVEIS porém trancadas (🔒); ao clicar
    // nelas, o sistema pede a senha de administrador.
    _abrirEditEq(id,true);
  } else {
    // Não-admin e SEM liberação: precisa da senha de administrador para abrir.
    reqSenha(function(){ _abrirEditEq(id,false); });
  }
}
function _abrirEditEq(id, restrito){const e=D.equips.find(x=>x.id===id);if(!e)return;eqFotos=[...(e.fotos||[])];eqArqs=[...(e.arqs||[])];document.getElementById('eq-eid').value=id;document.getElementById('eq-mtitle').textContent='✏️ Editar Veíc./Equip.';[['pl','placa'],['an','ano'],['mo','mo'],['pr','pr'],['ch','ch'],['ob','ob'],['rv','rv'],['apl','apl'],['crv','crv'],['empresa','empresa']].forEach(p=>{const el=document.getElementById('eq-'+p[0]);if(el)el.value=e[p[1]]||'';});['mk','im','st'].forEach(k=>{const el=document.getElementById('eq-'+k);if(el)el.value=e[k]||(el.options&&el.options[0]?el.options[0].value:'');});['km','hr'].forEach(k=>{const el=document.getElementById('eq-'+k);if(el)el.value=e[k]||'';});['crlv','vseg'].forEach(k=>{const el=document.getElementById('eq-'+k);if(el)el.value=e[k]||'';});var _si=document.getElementById('eq-seguro-info');if(_si)_si.innerHTML=_seguroInfoHtml(e.placa);const ce=document.querySelector(`input[name="eq-cond"][value="${e.cond||'novo'}"]`);if(ce)ce.checked=true;
    const setV=(i,v)=>{const el=document.getElementById(i);if(el)el.value=(v!==undefined&&v!==null)?v:'';};
    setV('eq-dt-levant',e.dtLevant);setV('eq-vl-quitacao',e.vlQuitacao);setV('eq-vl-atual',e.vlAtual);
    setV('eq-situ',e.situ);setV('eq-banco',e.banco);setV('eq-vaql',e.vaql);setV('eq-daql',e.daql);
    setV('eq-nparc',e.nparc);setV('eq-parcpg',e.parcpg);setV('eq-tparc',e.tparc);
    setV('eq-desval12',e.desval12);setV('eq-desval35',e.desval35);
    setV('eq-vparc',e.vparc);setV('eq-d1parc',e.d1parc);setV('eq-antt',e.antt);setV('eq-crono',e.crono);
    setV('eq-im-mk',e.im_mk);setV('eq-im-mo',e.im_mo);setV('eq-im-vl',e.im_vl);setV('eq-im-dt',e.im_dt);setV('eq-im-ob',e.im_ob);
    var _ti=document.getElementById('eq-tem-impl');if(_ti)_ti.value=((e.temImpl==='sim')||(!e.temImpl&&(e.im||e.im_mk||e.im_vl)))?'sim':'nao';
    if(typeof toggleImplemento==='function')toggleImplemento();
    if(typeof calcDesvalEq==='function')setTimeout(calcDesvalEq,50);
    if(typeof toggleParc==='function')toggleParc();
    rdEqFotos();rdEqArqs();if(typeof popEmpresas==='function')popEmpresas();_travarTabsEdicao(!!restrito);document.getElementById('m-eq').classList.add('op');}
function delEq(id){reqSenha(()=>{if(!confirm('Excluir este veículo/equipamento?'))return;const ct=D.contratos.find(c=>c.eqId===id&&c.status==='ativo');if(ct){toast('Contrato ativo vinculado!','er');return;}var _e=D.equips.find(x=>x.id===id);if(typeof auditarExclusao==='function')auditarExclusao('frota','Excluiu veículo: '+((_e&&_e.placa)||id));D.equips=D.equips.filter(x=>x.id!==id);sv();rdFrota();toast('Excluído.');});}
function chgStatus(id){const e=D.equips.find(x=>x.id===id);if(!e)return;const opts=['disponivel','alocado','imobilizado','vendido','uso_empresa'];const lbl={disponivel:'Disponível',alocado:'Alocado',imobilizado:'Imobilizado',vendido:'Vendido',uso_empresa:'Uso Empresa'};const cur=opts.indexOf(e.st);const next=opts[(cur+1)%opts.length];if(!confirm(`Alterar status de ${lbl[e.st]} para ${lbl[next]}?`))return;e.st=next;sv();rdFrota();toast('Status: '+lbl[next]);}
