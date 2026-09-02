
/* ============ MÓDULO PROPOSTA COMERCIAL ============ */
(function(){
  if(!D.propostas) D.propostas = [];

  function fmtBRL(n){ n=parseFloat(n)||0; return 'R$ ' + n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}); }
  function esc(s){ return (s==null?'':String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function dt(s){ return s? s.split('-').reverse().join('/') : ''; }
  function hoje(){ var d=new Date(); var off=d.getTimezoneOffset(); d=new Date(d.getTime()-off*60000); return d.toISOString().slice(0,10); }

  var RESP_PADRAO = [
    'Operador devidamente treinado e qualificado para tal operação.',
    'Abastecimento do veículo.',
    'Guarda do veículo/equipamento.',
    'Realizar a lavagem e lubrificação a cada 15 dias.',
    'Cumprir plano de manutenção.',
    'Material de desgaste (Lâmpadas, fusíveis, disco/bobina tacógrafo, sirene de ré, furos e corte em pneus, desgaste pré-maturo de pneus e peças).',
    'Material desgaste implemento.',
    'Solicitar a contratada a manutenção PREVENTIVA de acordo com plano de manutenção e CORRETIVA.',
    'Avarias por mau uso e desgaste anormal.',
    'Qualquer alteração ou manutenção no veículo/equipamento, sem autorização da CONTRATADA.',
    'Ceder a CONTRATADA (1) um dia por mês para realizar manutenções sem desconto em medição.'
  ].join('\n');

  var SEGURO_PADRAO = [
    'Colisão terceiro (SIM)',
    'Cobertura contra furto 80% fipe, roubo e colisão (Casco) e incêndio proveniente de acidente. (SIM)',
    'Guincho (NÃO) Quando o defeito é de responsabilidade da CONTRATADA.',
    'Cobertura operação em locais de risco, próximo a água, barragens. (NÃO)',
    'Cobertura de vidros (NÃO)',
    'Cobertura dos implementos (NÃO)'
  ].join('\n');

  function propLogoAtual(){ var e=propEmpresaSel(); return (e&&e.logo)||''; }
  function propLogoAtualizarUI(){
    var logo=propLogoAtual();
    var img=document.getElementById('prop-logo-preview');
    var vazio=document.getElementById('prop-logo-vazio');
    var rm=document.getElementById('prop-logo-rm');
    if(!img)return;
    if(logo){ img.src=logo; img.style.display='inline-block'; if(vazio)vazio.style.display='none'; if(rm)rm.style.display='inline-block'; }
    else { img.style.display='none'; if(vazio)vazio.style.display='inline'; if(rm)rm.style.display='none'; }
  }
  window.propLogoUpload = function(input){
    var f=input.files&&input.files[0]; if(!f)return;
    if(f.size>800*1024){ toast('Imagem muito grande (máx 800 KB). Use uma menor.','er'); input.value=''; return; }
    var r=new FileReader();
    r.onload=function(e){ var emp=propEmpresaSel(); if(emp){ emp.logo=e.target.result; sv(); propLogoAtualizarUI(); toast('Logomarca salva — será usada nas propostas desta empresa'); } };
    r.readAsDataURL(f); input.value='';
  };
  window.propLogoRemover = function(){ var emp=propEmpresaSel(); if(emp){ emp.logo=''; sv(); propLogoAtualizarUI(); toast('Logomarca removida'); } };
  window.propMobilToggle = function(){
    var s=document.getElementById('prop-mobil-tipo'); if(!s)return;
    var box=document.getElementById('prop-mobil-valor-box');
    if(box) box.style.display=(s.value==='contratante')?'block':'none';
  };
  window.propKmHrToggle = function(){
    var c=document.getElementById('prop-mostrar-kmhr'); if(!c)return;
    var box=document.getElementById('prop-kmhr-box');
    if(box) box.style.display=c.checked?'grid':'none';
  };
  function _numExtenso(n){
    n=parseInt(n); if(isNaN(n)||n<0)return String(n);
    if(n===0)return 'zero';
    if(n===100)return 'cem';
    var u=['','um','dois','três','quatro','cinco','seis','sete','oito','nove','dez','onze','doze','treze','quatorze','quinze','dezesseis','dezessete','dezoito','dezenove'];
    var d=['','','vinte','trinta','quarenta','cinquenta','sessenta','setenta','oitenta','noventa'];
    var c=['','cento','duzentos','trezentos','quatrocentos','quinhentos','seiscentos','setecentos','oitocentos','novecentos'];
    var partes=[], centena=Math.floor(n/100), resto=n%100;
    if(centena>0) partes.push(c[centena]);
    if(resto>0){
      if(resto<20) partes.push(u[resto]);
      else{ var dez=Math.floor(resto/10), uni=resto%10; partes.push(d[dez]+(uni>0?' e '+u[uni]:'')); }
    }
    return partes.join(' e ');
  }
  function _mesExt(n){ n=parseInt(n)||0; return n+' ('+_numExtenso(n)+') '+(n===1?'mês':'meses'); }
  function propMontarTextoDuracao(meses, tipo, fidelidade, multaPct){
    meses = parseInt(meses)||12;
    fidelidade = parseInt(fidelidade); if(isNaN(fidelidade)||fidelidade<0) fidelidade=Math.min(6,meses);
    multaPct = parseFloat(multaPct); if(isNaN(multaPct)) multaPct=30;
    var pctNum = (multaPct % 1 === 0 ? multaPct.toFixed(0) : String(multaPct));
    var pctExt = pctNum+'% ('+_numExtenso(Math.round(multaPct))+' por cento)';
    var oM=meses+'º', oF=fidelidade+'º';
    if(tipo==='sem'){
      return 'O presente contrato vigorará pelo prazo de '+_mesExt(meses)+', contados a partir da data de início da locação, não havendo incidência de multa na hipótese de rescisão antecipada por qualquer das partes.';
    }
    if(fidelidade<=0 || fidelidade>=meses){
      return '1. DO PRAZO: O presente contrato vigorará pelo prazo de '+_mesExt(meses)+', contados a partir da data de início da locação, vigorando fidelidade integral durante todo o período.\n'
        +'2. DA RESCISÃO ANTECIPADA: Na hipótese de rescisão antecipada por iniciativa da CONTRATANTE, será devida multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes até o termo final da vigência contratual ('+oM+' mês).';
    }
    return '1. DO PRAZO: O presente contrato vigorará pelo prazo mínimo de '+_mesExt(meses)+', contados a partir da data de início da locação.\n'
      +'2. DA FIDELIDADE: Os primeiros '+_mesExt(fidelidade)+' de vigência constituem período de fidelidade integral.\n'
      +'3. DA RESCISÃO ATÉ O '+oF+' MÊS: Caso a rescisão ocorra antes de completado o '+oF+' mês de vigência, a CONTRATANTE obriga-se ao pagamento dos aluguéis mensais vincendos até o encerramento do período de fidelidade, acrescidos de multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes do período subsequente, compreendido entre o '+oF+' e o '+oM+' mês.\n'
      +'4. DA RESCISÃO APÓS O '+oF+' MÊS: Ocorrendo a rescisão após o '+oF+' mês de vigência, será devida multa compensatória de '+pctExt+', incidente sobre o somatório dos aluguéis mensais remanescentes até o termo final da vigência contratual ('+oM+' mês).';
  }
  window.propDuracaoMontar = function(){
    var m=document.getElementById('prop-tempo-locacao'), t=document.getElementById('prop-multa-tipo'), d=document.getElementById('prop-duracao');
    var f=document.getElementById('prop-fidelidade'), mp=document.getElementById('prop-multa-pct');
    if(!m||!t||!d)return;
    var sem=(t.value==='sem');
    var fb=document.getElementById('prop-fid-box'), mpb=document.getElementById('prop-multapct-box');
    if(fb)fb.style.opacity=sem?'0.45':'1'; if(mpb)mpb.style.opacity=sem?'0.45':'1';
    if(f)f.disabled=sem; if(mp)mp.disabled=sem;
    d.value = propMontarTextoDuracao(m.value, t.value, f?f.value:6, mp?mp.value:30);
  };
  var RODAPE_NOME_PADRAO='MH3 RENTAL LTDA';
  var RODAPE_TEXTO_PADRAO='CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br';
  function propRodapeNome(){ return (D.config&&D.config.propRodapeNome!=null)?D.config.propRodapeNome:RODAPE_NOME_PADRAO; }
  function propRodapeTexto(){ return (D.config&&D.config.propRodapeTexto!=null)?D.config.propRodapeTexto:RODAPE_TEXTO_PADRAO; }
  // ===== EMPRESAS EMITENTES DA PROPOSTA (permite emitir em nome de 2+ empresas diferentes) =====
  function propEmpresas(){
    if(!D.config) D.config={};
    if(!Array.isArray(D.config.empresasProp) || !D.config.empresasProp.length){
      D.config.empresasProp = [{
        id:'emp1',
        apelido:(D.config.propRodapeNome||'MH3 Rental'),
        logo:(D.config.propLogo||''),
        rodapeNome:(D.config.propRodapeNome!=null?D.config.propRodapeNome:RODAPE_NOME_PADRAO),
        rodapeTexto:(D.config.propRodapeTexto!=null?D.config.propRodapeTexto:RODAPE_TEXTO_PADRAO)
      }];
      try{ sv(); }catch(e){}
    }
    return D.config.empresasProp;
  }
  function propEmpresaSel(){
    var lista=propEmpresas();
    var e=lista.find(function(x){return x.id===window._propEmpresaSelId;});
    return e || lista[0];
  }
  window.propRenderSeletorEmpresa = function(){
    var sel=document.getElementById('prop-empresa-sel'); if(!sel) return;
    var lista=propEmpresas();
    if(!window._propEmpresaSelId || !lista.some(function(e){return e.id===window._propEmpresaSelId;})) window._propEmpresaSelId=lista[0].id;
    sel.innerHTML=lista.map(function(e){return '<option value="'+e.id+'"'+(e.id===window._propEmpresaSelId?' selected':'')+'>'+esc(e.apelido||e.rodapeNome||'Empresa')+'</option>';}).join('');
    var ger=document.getElementById('prop-empresa-gerenciar'); if(ger) ger.style.display=(window.ehAdminAtual&&ehAdminAtual())?'inline-block':'none';
    propEmpresaPreview();
  };
  function propEmpresaPreview(){
    var box=document.getElementById('prop-empresa-preview'); if(!box) return;
    var emp=propEmpresaSel(); if(!emp){ box.innerHTML=''; return; }
    var logoHtml = emp.logo ? ('<img src="'+emp.logo+'" style="max-height:42px;max-width:130px;border:1px solid var(--br);border-radius:4px;background:#fff;padding:2px">') : '<span style="font-weight:900;color:#c00000;font-style:italic;font-size:18px">MH3</span>';
    var linha1=(emp.rodapeTexto||'').split('\n').filter(function(x){return x.trim();})[0]||'';
    box.innerHTML = logoHtml + '<div style="line-height:1.4"><b style="color:var(--tx)">'+esc(emp.rodapeNome||emp.apelido||'')+'</b><br>'+esc(linha1)+'</div>';
  }
  window.propEmpresaTrocar = function(id){ window._propEmpresaSelId=id; propEmpresaPreview(); };
  window.propIrGerenciarEmpresas = function(){
    if(!(window.ehAdminAtual&&ehAdminAtual())){ if(typeof toast==='function')toast('Apenas o administrador pode cadastrar empresas.','er'); return; }
    closeM('m-prop'); go('config');
    setTimeout(function(){ var el=document.getElementById('cfg-empresas-box'); if(el) el.scrollIntoView({block:'center'}); }, 350);
  };

  // ===== GERENCIAMENTO DE EMPRESAS (Configurações — somente administrador) =====
  window._cfgEmpEditId = null;
  function cfgEmpAtual(){ var lista=propEmpresas(); return lista.find(function(e){return e.id===window._cfgEmpEditId;})||lista[0]; }
  window.cfgEmpRender = function(){
    var sel=document.getElementById('cfg-emp-sel'); if(!sel) return;
    var lista=propEmpresas();
    if(!window._cfgEmpEditId || !lista.some(function(e){return e.id===window._cfgEmpEditId;})) window._cfgEmpEditId=lista[0].id;
    sel.innerHTML=lista.map(function(e){return '<option value="'+e.id+'"'+(e.id===window._cfgEmpEditId?' selected':'')+'>'+esc(e.apelido||e.rodapeNome||'Empresa')+'</option>';}).join('');
    var emp=cfgEmpAtual();
    var ap=document.getElementById('cfg-emp-apelido'); if(ap) ap.value=emp.apelido||'';
    var rn=document.getElementById('cfg-emp-rodape-nome'); if(rn) rn.value=emp.rodapeNome||'';
    var rt=document.getElementById('cfg-emp-rodape-texto'); if(rt) rt.value=emp.rodapeTexto||'';
    var img=document.getElementById('cfg-emp-logo-preview'); var vz=document.getElementById('cfg-emp-logo-vazio'); var rmL=document.getElementById('cfg-emp-logo-rm');
    if(img){ if(emp.logo){ img.src=emp.logo; img.style.display='inline-block'; if(vz)vz.style.display='none'; if(rmL)rmL.style.display='inline-block'; } else { img.style.display='none'; if(vz)vz.style.display='inline'; if(rmL)rmL.style.display='none'; } }
    var btnRm=document.getElementById('cfg-emp-remover'); if(btnRm) btnRm.style.display=(lista.length>1?'inline-block':'none');
  };
  window.cfgEmpTrocar = function(id){ window._cfgEmpEditId=id; cfgEmpRender(); };
  window.cfgEmpNova = function(){
    var nome=prompt('Nome da nova empresa (ex: DMS Serviços):'); if(nome==null) return; nome=nome.trim(); if(!nome) return;
    var lista=propEmpresas();
    var nova={id:'emp'+Date.now(), apelido:nome, logo:'', rodapeNome:nome.toUpperCase(), rodapeTexto:''};
    lista.push(nova); window._cfgEmpEditId=nova.id; try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Empresa "'+nome+'" criada. Preencha os dados e escolha a logo abaixo.');
  };
  window.cfgEmpSalvar = function(){
    var emp=cfgEmpAtual(); if(!emp) return;
    var ap=document.getElementById('cfg-emp-apelido').value.trim();
    if(ap) emp.apelido=ap;
    emp.rodapeNome=document.getElementById('cfg-emp-rodape-nome').value;
    emp.rodapeTexto=document.getElementById('cfg-emp-rodape-texto').value;
    try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Dados da empresa salvos');
  };
  window.cfgEmpLogoUpload = function(input){
    var f=input.files&&input.files[0]; if(!f) return;
    if(f.size>800*1024){ if(typeof toast==='function')toast('Imagem muito grande (máx 800 KB). Use uma menor.','er'); input.value=''; return; }
    var r=new FileReader();
    r.onload=function(e){ var emp=cfgEmpAtual(); if(emp){ emp.logo=e.target.result; try{sv();}catch(er){} cfgEmpRender(); if(typeof toast==='function')toast('Logo salva'); } };
    r.readAsDataURL(f); input.value='';
  };
  window.cfgEmpLogoRemover = function(){ var emp=cfgEmpAtual(); if(emp){ emp.logo=''; try{sv();}catch(e){} cfgEmpRender(); if(typeof toast==='function')toast('Logo removida'); } };
  window.cfgEmpRestaurarMH3 = function(){
    var emp=cfgEmpAtual(); if(!emp) return;
    var temOrig = (D.config && (D.config.propLogo || D.config.propRodapeNome!=null || D.config.propRodapeTexto!=null));
    if(!temOrig){ if(typeof toast==='function')toast('Não há dados originais da MH3 guardados para restaurar.','er'); return; }
    if(!confirm('Preencher ESTA empresa com a logo e o rodapé originais da MH3 que estavam salvos no sistema?')) return;
    if(D.config.propLogo) emp.logo=D.config.propLogo;
    if(D.config.propRodapeNome!=null) emp.rodapeNome=D.config.propRodapeNome;
    if(D.config.propRodapeTexto!=null) emp.rodapeTexto=D.config.propRodapeTexto;
    if(!emp.apelido) emp.apelido='MH3 Rental';
    try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Dados originais da MH3 restaurados nesta empresa');
  };
  window.cfgEmpRemover = function(){
    var lista=propEmpresas(); if(lista.length<=1){ if(typeof toast==='function')toast('É preciso manter ao menos uma empresa.','er'); return; }
    var emp=cfgEmpAtual(); if(!emp) return;
    if(!confirm('Remover a empresa "'+(emp.apelido||emp.rodapeNome)+'"?\n\nAs propostas já salvas com ela continuam como estão.')) return;
    D.config.empresasProp=lista.filter(function(e){return e.id!==emp.id;});
    window._cfgEmpEditId=D.config.empresasProp[0].id; try{sv();}catch(e){}
    cfgEmpRender();
    if(typeof toast==='function') toast('Empresa removida');
  };
  function propRodapeAtualizarUI(){
    var emp=propEmpresaSel();
    var n=document.getElementById('prop-rodape-nome'); var t=document.getElementById('prop-rodape-texto');
    if(n) n.value=(emp&&emp.rodapeNome!=null)?emp.rodapeNome:propRodapeNome();
    if(t) t.value=(emp&&emp.rodapeTexto!=null)?emp.rodapeTexto:propRodapeTexto();
  }
  window.propRodapeSalvar = function(){
    var emp=propEmpresaSel(); if(!emp) return;
    emp.rodapeNome=document.getElementById('prop-rodape-nome').value;
    emp.rodapeTexto=document.getElementById('prop-rodape-texto').value;
    sv(); toast('Rodapé salvo');
  };

  window.calcMensalProp = function(i){
    var vh = parseFloat(document.getElementById('prop-vh-'+i).value)||0;
    var gar = parseFloat(document.getElementById('prop-gar-'+i).value)||0;
    document.getElementById('prop-vm-'+i).value = (vh*gar)? (vh*gar).toFixed(2) : '';
    if(typeof propTotalDica==='function')propTotalDica();
  };
  window.propCobrancaToggle = function(){
    var modo=(document.getElementById('prop-cobranca-modo')||{}).value||'hora';
    var bh=document.getElementById('prop-cobranca-hora'), bf=document.getElementById('prop-cobranca-fechado');
    if(bh)bh.style.display=(modo==='fechado')?'none':'block';
    if(bf)bf.style.display=(modo==='fechado')?'block':'none';
    if(typeof propTotalDica==='function')propTotalDica();
  };
  window.propTotalDica = function(){
    var qe=document.getElementById('prop-qtd'); var dica=document.getElementById('prop-total-dica');
    if(!qe||!dica)return;
    var qtd=parseInt(qe.value)||1;
    var modo=(document.getElementById('prop-cobranca-modo')||{}).value||'hora';
    var base = (modo==='fechado') ? (parseFloat((document.getElementById('prop-valor-fechado')||{}).value)||0) : (parseFloat(document.getElementById('prop-vm-1').value)||0);
    var rotulo = (modo==='fechado') ? 'valor fechado' : 'turno 1';
    if(qtd<=1||base<=0){ dica.style.display='none'; return; }
    dica.style.display='block';
    dica.textContent='💡 '+qtd+' equipamentos × '+fmtBRL(base)+' ('+rotulo+') = '+fmtBRL(base*qtd)+' por mês no total';
  };

  window.openNovaProposta = function(){
    if(typeof temAcesso==='function' && !ehAdminAtual() && !temAcesso('prop-criar')){ toast('Sem permissão para criar propostas','er'); return; }
    document.getElementById('prop-eid').value='';
    document.getElementById('prop-mtitulo').textContent='📝 Nova Proposta';
    document.getElementById('prop-data').value=hoje();
    document.getElementById('prop-validade').value=hoje();
    ['contratante','obra','veiculo','modelo','ano','franquia','obs'].forEach(function(f){document.getElementById('prop-'+f).value='';});
    document.getElementById('prop-qtd').value=1;
    document.getElementById('prop-cobranca-modo').value='hora';
    document.getElementById('prop-turno-fechado').value='1';
    document.getElementById('prop-valor-fechado').value='';
    if(typeof propCobrancaToggle==='function')propCobrancaToggle();
    if(typeof propTotalDica==='function')propTotalDica();
    [1,2,3].forEach(function(i){document.getElementById('prop-vh-'+i).value='';document.getElementById('prop-gar-'+i).value='';document.getElementById('prop-vm-'+i).value='';});
    document.getElementById('prop-mobil-tipo').value='contratante';
    document.getElementById('prop-mobil-valor').value='';
    propMobilToggle();
    document.getElementById('prop-km').value='';
    document.getElementById('prop-horimetro').value='';
    document.getElementById('prop-mostrar-kmhr').checked=false;
    propKmHrToggle();
    propRenderSeletorEmpresa();
    document.getElementById('prop-tempo-locacao').value=12;
    document.getElementById('prop-multa-tipo').value='com';
    document.getElementById('prop-fidelidade').value=6;
    document.getElementById('prop-multa-pct').value=30;
    propDuracaoMontar();
    document.getElementById('prop-resp').value=RESP_PADRAO;
    document.getElementById('prop-seguro').value=SEGURO_PADRAO;
    document.getElementById('prop-ciclo').value='21 à 20 ou 01 à 30/31 (vide contrato)';
    document.getElementById('prop-pagamento').value='FATURA + 30 DIAS';
    openM('m-prop');
  };

  window.editProposta = function(id){if(_bloqEditar('prop'))return;
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    document.getElementById('prop-eid').value=p.id;
    document.getElementById('prop-mtitulo').textContent='✏️ Editar Proposta';
    document.getElementById('prop-data').value=p.data||'';
    document.getElementById('prop-validade').value=p.validade||'';
    document.getElementById('prop-contratante').value=p.contratante||'';
    document.getElementById('prop-obra').value=p.obra||'';
    document.getElementById('prop-veiculo').value=p.veiculo||'';
    document.getElementById('prop-modelo').value=p.modelo||'';
    document.getElementById('prop-ano').value=p.ano||'';
    document.getElementById('prop-qtd').value=p.qtd||1;
    document.getElementById('prop-cobranca-modo').value=p.cobrancaModo||'hora';
    document.getElementById('prop-turno-fechado').value=p.turnoFechado||1;
    document.getElementById('prop-valor-fechado').value=p.valorFechado||'';
    if(typeof propCobrancaToggle==='function')propCobrancaToggle();
    document.getElementById('prop-franquia').value=p.franquia||'';
    document.getElementById('prop-obs').value=p.obs||'';
    [1,2,3].forEach(function(i){
      var l=(p.linhas||[]).find(function(x){return x.turno===i;})||{};
      document.getElementById('prop-vh-'+i).value=(l.vh!=null&&l.vh!==0)?l.vh:'';
      document.getElementById('prop-gar-'+i).value=(l.gar!=null&&l.gar!==0)?l.gar:'';
      document.getElementById('prop-vm-'+i).value=(l.vm!=null&&l.vm!==0)?l.vm:'';
    });
    document.getElementById('prop-mobil-tipo').value=(p.mobilTipo==='mh3')?'mh3':'contratante';
    document.getElementById('prop-mobil-valor').value=(p.mobilValor!=null&&p.mobilValor!==0)?p.mobilValor:'';
    propMobilToggle();
    document.getElementById('prop-km').value=p.km||'';
    document.getElementById('prop-horimetro').value=p.horimetro||'';
    document.getElementById('prop-mostrar-kmhr').checked=!!p.mostrarKmHr;
    propKmHrToggle();
    window._propEmpresaSelId=p.empresaId||(propEmpresas()[0]||{}).id;
    propRenderSeletorEmpresa();
    document.getElementById('prop-tempo-locacao').value=p.tempoLocacao||12;
    document.getElementById('prop-multa-tipo').value=p.multaTipo||'com';
    document.getElementById('prop-fidelidade').value=(p.fidelidade!=null?p.fidelidade:6);
    document.getElementById('prop-multa-pct').value=(p.multaPct!=null?p.multaPct:30);
    document.getElementById('prop-duracao').value=p.duracao||'';
    document.getElementById('prop-resp').value=p.resp||'';
    document.getElementById('prop-seguro').value=p.seguro||'';
    document.getElementById('prop-ciclo').value=p.ciclo||'';
    document.getElementById('prop-pagamento').value=p.pagamento||'';
    if(typeof propTotalDica==='function')propTotalDica();
    openM('m-prop');
  };

  window.saveProposta = function(){
    var eid=document.getElementById('prop-eid').value;
    var contratante=document.getElementById('prop-contratante').value.trim();
    if(!contratante){ toast('Informe o contratante','er'); return; }
    var p = {
      id: eid || uid(),
      empresaId: window._propEmpresaSelId || ((D.config&&D.config.empresasProp&&D.config.empresasProp[0])?D.config.empresasProp[0].id:'emp1'),
      data: document.getElementById('prop-data').value,
      validade: document.getElementById('prop-validade').value,
      contratante: contratante,
      obra: document.getElementById('prop-obra').value.trim(),
      veiculo: document.getElementById('prop-veiculo').value.trim(),
      modelo: document.getElementById('prop-modelo').value.trim(),
      ano: document.getElementById('prop-ano').value.trim(),
      qtd: parseInt(document.getElementById('prop-qtd').value)||1,
      cobrancaModo: (document.getElementById('prop-cobranca-modo')||{}).value||'hora',
      turnoFechado: parseInt((document.getElementById('prop-turno-fechado')||{}).value)||1,
      valorFechado: parseFloat((document.getElementById('prop-valor-fechado')||{}).value)||0,
      km: document.getElementById('prop-km').value.trim(),
      horimetro: document.getElementById('prop-horimetro').value.trim(),
      mostrarKmHr: document.getElementById('prop-mostrar-kmhr').checked,
      linhas: [1,2,3].map(function(i){return {turno:i, vh:parseFloat(document.getElementById('prop-vh-'+i).value)||0, gar:parseFloat(document.getElementById('prop-gar-'+i).value)||0, vm:parseFloat(document.getElementById('prop-vm-'+i).value)||0};}),
      franquia: document.getElementById('prop-franquia').value.trim(),
      obs: document.getElementById('prop-obs').value,
      mobilTipo: document.getElementById('prop-mobil-tipo').value,
      mobilValor: parseFloat(document.getElementById('prop-mobil-valor').value)||0,
      duracao: document.getElementById('prop-duracao').value,
      tempoLocacao: parseInt(document.getElementById('prop-tempo-locacao').value)||12,
      multaTipo: document.getElementById('prop-multa-tipo').value,
      fidelidade: parseInt(document.getElementById('prop-fidelidade').value)||0,
      multaPct: parseFloat(document.getElementById('prop-multa-pct').value)||0,
      resp: document.getElementById('prop-resp').value,
      seguro: document.getElementById('prop-seguro').value,
      ciclo: document.getElementById('prop-ciclo').value,
      pagamento: document.getElementById('prop-pagamento').value
    };
    if(eid){
      var idx=D.propostas.findIndex(function(x){return x.id===eid;});
      if(idx>=0){ p.criadoEm=D.propostas[idx].criadoEm; p.criadoPor=D.propostas[idx].criadoPor; D.propostas[idx]=p; }
    } else {
      p.criadoEm=new Date().toISOString();
      p.criadoPor=(authUser&&authUser.nome)||'';
      D.propostas.unshift(p);
    }
    sv(); closeM('m-prop'); rdProposta(); toast('Proposta salva');
  };

  window.delProposta = function(id){
    if(typeof temAcesso==='function' && !ehAdminAtual() && !temAcesso('prop-excluir')){ toast('Sem permissão para excluir','er'); return; }
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    if(!confirm('Excluir a proposta de "'+(p.contratante||'')+'"?'))return;
    D.propostas=D.propostas.filter(function(x){return x.id!==id;});
    sv(); rdProposta(); toast('Proposta excluída');
  };

  window.duplicarProposta = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var c=JSON.parse(JSON.stringify(p));
    c.id=uid(); c.contratante=(c.contratante||'')+' (cópia)'; c.criadoEm=new Date().toISOString(); c.criadoPor=(authUser&&authUser.nome)||'';
    D.propostas.unshift(c); sv(); rdProposta(); toast('Proposta duplicada');
  };

  window._propBadgeAprov=function(p){
  return (p&&p.aprovada)
    ? ' <span style="font-size:9px;font-weight:700;background:#16a34a;color:#fff;padding:2px 7px;border-radius:6px">✓ APROVADA</span>'
    : ' <span style="font-size:9px;font-weight:700;background:#f59e0b;color:#fff;padding:2px 7px;border-radius:6px">AGUARDANDO</span>';
};
window._propBotoesAprov=function(p){
  if(!p)return '';
  if(p.aprovada){
    return '<button class="btn bp btn-xs" onclick="gerarContratoDaProposta(\''+p.id+'\')" title="Gerar contrato a partir desta proposta">📑 Gerar Contrato</button>'
         + '<button class="btn bw btn-xs" onclick="aprovarProposta(\''+p.id+'\')" title="Reabrir (desfaz a aprovação)">↩</button>';
  }
  return '<button class="btn bg btn-xs" onclick="aprovarProposta(\''+p.id+'\')" title="Aprovar esta proposta">✓ Aprovar</button>';
};
window.aprovarProposta=function(id){
  var p=(D.propostas||[]).find(function(x){return x.id===id;});
  if(!p)return;
  p.aprovada=!p.aprovada;
  if(typeof auditar==='function')auditar(p.aprovada?'APROVACAO':'ALTERACAO','propostas',(p.aprovada?'Proposta APROVADA':'Aprovação desfeita')+': '+(p.contratante||''));
  if(typeof sv==='function')sv();
  if(typeof rdProposta==='function')rdProposta();
  if(typeof toast==='function')toast(p.aprovada?'Proposta aprovada! Agora você pode gerar o contrato.':'Aprovação desfeita.','ok');
};
window.gerarContratoDaProposta=function(id){
  var p=(D.propostas||[]).find(function(x){return x.id===id;});
  if(!p){if(typeof toast==='function')toast('Proposta não encontrada','er');return;}
  if(!p.aprovada){if(typeof toast==='function')toast('Aprove a proposta antes de gerar o contrato.','er');return;}
  if(typeof go==='function')go('contratos');
  setTimeout(function(){
    if(typeof popSels==='function')popSels();
    if(typeof popClientesCt==='function')popClientesCt();
    if(typeof openM==='function')openM('m-ct');
    function setV(idf,v){var el=document.getElementById(idf);if(el&&v!=null&&v!=='')el.value=v;}
    var nome=((p.contratante||'')+'').trim();
    var cli=(D.clientes||[]).find(function(c){return (((c.nome||c.nm||'')+'')).trim().toLowerCase()===nome.toLowerCase();});
    var selC=document.getElementById('ct-cliente-sel');
    if(cli&&selC){selC.value=cli.id; if(typeof puxarDadosCliente==='function')puxarDadosCliente();}
    setV('ct-cl',nome);
    setV('ct-ob',p.obra||'');
    var vl=p.valorFechado||((p.linhas&&p.linhas[0])?p.linhas[0].vm:0);
    if(vl)setV('ct-vl',vl);
    if(p.vh)setV('ct-vhe',p.vh);
    var veic=((p.veiculo||'')+'').toUpperCase().replace(/[^A-Z0-9]/g,'');
    if(veic){var eq=(D.equips||[]).find(function(e){return ((e.placa||'')+'').toUpperCase().replace(/[^A-Z0-9]/g,'')===veic;});var selE=document.getElementById('ct-eq');if(eq&&selE)selE.value=eq.id;}
    var obs=document.getElementById('ct-obs');if(obs&&!obs.value)obs.value='Gerado a partir da proposta'+(p.data?' de '+p.data:'')+'.';
    if(typeof toast==='function')toast('Contrato pré-preenchido pela proposta. Confira placa, datas e assinatura.','ok');
  },120);
};

  window.rdProposta = function(){
    var root=document.getElementById('prop-root'); if(!root)return;
    var podeCriar = ehAdminAtual() || (typeof temAcesso!=='function') || temAcesso('prop-criar');
    var lista=D.propostas||[];
    var srch=(window._propSrch||'').toLowerCase();
    if(srch) lista=lista.filter(function(p){return ((p.contratante||'')+' '+(p.obra||'')+' '+(p.veiculo||'')).toLowerCase().indexOf(srch)>=0;});
    var html='<div class="shdr" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px"><div><span style="font-size:13px;font-weight:700">📝 Propostas Comerciais</span><div style="font-size:11px;color:var(--mt)">Gere modelos de proposta de locação, com cálculo automático e impressão</div></div>'+(podeCriar?'<button class="btn bp" onclick="openNovaProposta()">+ Nova Proposta</button>':'')+'</div>';
    html+='<div class="search-bar"><input placeholder="🔍 Buscar por contratante, obra ou equipamento..." value="'+esc(window._propSrch||'')+'" oninput="window._propSrch=this.value;rdProposta()"></div>';
    if(!lista.length){ html+='<div class="empty"><div class="ei">📝</div>Nenhuma proposta '+(srch?'encontrada':'cadastrada ainda')+'</div>'; root.innerHTML=html; return; }
    html+=lista.map(function(p){
      var vm1=(p.linhas&&p.linhas[0])?p.linhas[0].vm:0;
      return '<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">'+esc(p.contratante||'(sem contratante)')+_propBadgeAprov(p)+' <span style="font-size:9px;font-weight:400;color:var(--mt)">'+esc(p.obra||'')+'</span></div><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap"><button class="btn bp btn-xs" onclick="gerarProposta(\''+p.id+'\')" title="Gerar / Imprimir / PDF">📄 Gerar</button><button class="btn bw btn-xs" onclick="enviarPropostaEmail(\''+p.id+'\')" title="Enviar por e-mail">📧 E-mail</button><button class="btn bw btn-xs" onclick="editProposta(\''+p.id+'\')" title="Editar">✏️</button><button class="btn bg btn-xs" onclick="duplicarProposta(\''+p.id+'\')" title="Duplicar para criar outro modelo">📋</button><button class="btn bd btn-xs" onclick="delProposta(\''+p.id+'\')" title="Excluir">🗑️</button>'+_propBotoesAprov(p)+'</div></div><div class="pb" style="font-size:11px;color:var(--mt)">'+esc(p.veiculo||'—')+(p.modelo?' · '+esc(p.modelo):'')+(p.ano?' · '+esc(p.ano):'')+' &nbsp;|&nbsp; Mensal (turno 1): <b style="color:var(--tx)">'+fmtBRL(vm1)+'</b>'+(p.data?' &nbsp;|&nbsp; Data: '+esc(dt(p.data)):'')+'</div></div>';
    }).join('');
    root.innerHTML=html;
  };

  function destacaSimNao(t){
    return t.replace(/\((SIM)\)/g,'<b style="color:#0a7d28">($1)</b>').replace(/\((N[ÃA]O)\)/g,'<b style="color:#c00000">($1)</b>');
  }

  function buildPropostaHTML(p){
    var qtd=parseInt(p.qtd)||1; if(qtd<1)qtd=1;
    var temQtd=qtd>1;
    var modoFechado=(p.cobrancaModo==='fechado');
    var tabelaValores;
    if(modoFechado){
      var nturnos=parseInt(p.turnoFechado)||1;
      var vfech=parseFloat(p.valorFechado)||0;
      var totF=vfech*qtd;
      var turnoTxt=nturnos+(nturnos>1?' turnos':' turno');
      var linhaF='<tr><td class="tn">'+turnoTxt+'</td><td class="vm">'+fmtBRL(vfech)+'</td>'+(temQtd?'<td class="qt" style="text-align:center;font-weight:700">'+qtd+'</td><td class="vt" style="font-weight:700">'+fmtBRL(totF)+'</td>':'')+'<td class="fr">'+esc(p.franquia||'—')+'</td></tr>';
      tabelaValores='<table class="vals"><thead><tr><th>Turno(s) de Trabalho</th><th>'+(temQtd?'Valor Mensal (unit.)':'Valor Mensal Fechado')+'</th>'+(temQtd?'<th>Qtd</th><th>Valor Mensal Total</th>':'')+'<th>Franquia KM/Mês</th></tr></thead><tbody>'+linhaF+'</tbody></table>';
    } else {
      var linhasValidas = [1,2,3].map(function(i){
        return (p.linhas||[]).find(function(x){return x.turno===i;})||{turno:i,vh:0,gar:0,vm:0};
      }).filter(function(l){ return (l.vh||l.gar||l.vm); });
      if(!linhasValidas.length) linhasValidas=[{turno:1,vh:0,gar:0,vm:0}];
      var nLin=linhasValidas.length;
      var linhasTab = linhasValidas.map(function(l,idx){
        var totMes=(parseFloat(l.vm)||0)*qtd;
        return '<tr><td class="vh">'+fmtBRL(l.vh)+'</td><td class="tn">'+l.turno+'</td><td class="gar">'+(l.gar||0)+' HR</td><td class="vm">'+fmtBRL(l.vm)+'</td>'+(temQtd?'<td class="qt" style="text-align:center;font-weight:700">'+qtd+'</td><td class="vt" style="font-weight:700">'+fmtBRL(totMes)+'</td>':'')+(idx===0?'<td class="fr" rowspan="'+nLin+'">'+esc(p.franquia||'—')+'</td>':'')+'</tr>';
      }).join('');
      tabelaValores='<table class="vals"><thead><tr><th>Valor da Hora</th><th>Turno(s)</th><th>Garantia</th><th>'+(temQtd?'Valor Mensal (unit.)':'Valor Mensal')+'</th>'+(temQtd?'<th>Qtd</th><th>Valor Mensal Total</th>':'')+'<th>Franquia KM/Mês</th></tr></thead><tbody>'+linhasTab+'</tbody></table>';
    }
    var resp=(p.resp||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<li>'+esc(x.trim())+'</li>';}).join('');
    var seg=(p.seguro||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<div class="seg-item">'+destacaSimNao(esc(x.trim()))+'</div>';}).join('');
    var obs=(p.obs||'').split('\n').filter(function(x){return x.trim();}).map(function(x){return '<li>'+esc(x.trim())+'</li>';}).join('');
    var _empL=(D.config&&D.config.empresasProp)||[];
    var _empP=_empL.find(function(e){return e.id===p.empresaId;})||_empL[0]||null;
    var logo=_empP?(_empP.logo||''):((D.config&&D.config.propLogo)||'');
    var logoHtml = logo ? ('<img src="'+logo+'" alt="Logomarca" class="logo-img">') : '<div class="logo-txt">MH3</div>';
    var mobilTxt;
    if(p.mobilTipo==='mh3'){ mobilTxt='Por conta da <b>MH3 Rental</b>.'; }
    else if(p.mobilTipo==='contratante'){ mobilTxt='Por conta da <b>CONTRATANTE</b>'+(p.mobilValor?(' &mdash; <b>'+fmtBRL(p.mobilValor)+'</b>'):'')+'.'; }
    else { mobilTxt=esc(p.mobil||'Por conta da CONTRATANTE.'); }
    var kmHrHtml = (p.mostrarKmHr && (p.km||p.horimetro)) ? ('<div class="campo"><span class="lbl">KM atual</span><span class="val">'+esc(p.km||'—')+'</span></div><div class="campo"><span class="lbl">Horímetro atual</span><span class="val">'+esc(p.horimetro||'—')+'</span></div>') : '';
    var rodNome=_empP?(_empP.rodapeNome!=null?_empP.rodapeNome:'MH3 RENTAL LTDA'):((D.config&&D.config.propRodapeNome!=null)?D.config.propRodapeNome:'MH3 RENTAL LTDA');
    var rodTexto=_empP?(_empP.rodapeTexto!=null?_empP.rodapeTexto:'CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br'):((D.config&&D.config.propRodapeTexto!=null)?D.config.propRodapeTexto:'CNPJ: 26.881.195/0001-10  •  Rodovia BR 381, km 361 – João Monlevade/MG\n(31) 99977-6105  ·  Noninho  ·  comercial@mh3rental.com.br');
    var rodTextoHtml=String(rodTexto).split('\n').filter(function(x){return x.trim();}).map(function(x){return '<div class="ln">'+esc(x.trim())+'</div>';}).join('');
    return `<!DOCTYPE html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Proposta - ${esc(p.contratante||'')}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#2b2b2b;background:#eef0f3;font-size:13px;line-height:1.5;padding:20px}
  .folha{max-width:830px;margin:0 auto;background:#fff;box-shadow:0 6px 28px rgba(0,0,0,.13);border-radius:6px;overflow:hidden}
  .cab{display:flex;justify-content:space-between;align-items:center;padding:26px 36px 20px;border-bottom:4px solid #c00000}
  .logo-img{max-height:68px;max-width:240px;object-fit:contain}
  .logo-txt{font-size:50px;font-weight:900;color:#c00000;font-style:italic;letter-spacing:-3px;font-family:'Arial Black',Arial,sans-serif;line-height:1}
  .cab-dir{text-align:right}
  .cab-dir .tit{font-size:23px;font-weight:800;color:#c00000;letter-spacing:.5px}
  .cab-dir .sub{font-size:10px;color:#999;margin-top:4px;text-transform:uppercase;letter-spacing:1.5px}
  .corpo{padding:24px 36px}
  .saud{font-size:13px;color:#444;margin-bottom:18px;line-height:1.65}
  .saud b{color:#c00000}
  .dados{background:#fafbfc;border:1px solid #ececf0;border-radius:8px;padding:14px 18px;margin-bottom:14px}
  .dados .row{display:flex;flex-wrap:wrap;gap:8px 26px}
  .dados .row+.row{margin-top:11px;border-top:1px solid #eee;padding-top:11px}
  .campo{flex:1 1 130px;min-width:0;font-size:12.5px}
  .campo .lbl{color:#9a9a9a;font-size:9.5px;text-transform:uppercase;letter-spacing:.6px;display:block;margin-bottom:2px}
  .campo .val{font-weight:700;color:#222;word-wrap:break-word}
  .sec{margin:22px 0 9px;display:flex;align-items:center;gap:9px}
  .sec .bar{width:4px;height:18px;background:#c00000;border-radius:2px}
  .sec h3{font-size:13.5px;font-weight:800;color:#c00000;letter-spacing:.4px;text-transform:uppercase}
  table.vals{width:100%;border-collapse:collapse;margin:4px 0;border-radius:8px;overflow:hidden;box-shadow:0 1px 5px rgba(0,0,0,.07)}
  table.vals th{background:#c00000;color:#fff;padding:10px 8px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.4px}
  table.vals td{border:1px solid #ececec;padding:10px 8px;text-align:center;font-size:13px}
  table.vals td.vh,table.vals td.vm{color:#c00000;font-weight:800}
  table.vals td.tn,table.vals td.gar{font-weight:700;color:#333}
  table.vals td.fr{font-weight:800;color:#c00000;vertical-align:middle;font-size:16px;background:#fff7f7}
  table.vals tr:nth-child(even) td{background:#fcfcfc}
  table.vals tr:nth-child(even) td.fr{background:#fff7f7}
  ul.lst{margin:4px 0;padding-left:0;list-style:none}
  ul.lst li{position:relative;padding:3px 0 3px 18px;font-size:12.5px;color:#444}
  ul.lst li:before{content:'';position:absolute;left:2px;top:9px;width:6px;height:6px;background:#c00000;border-radius:50%}
  .seg-box{background:#fafbfc;border:1px solid #ececf0;border-radius:8px;padding:10px 15px}
  .seg-item{padding:3px 0;font-size:12.5px;color:#444}
  .destaque{background:linear-gradient(90deg,#fff2a8,#ffe98a);border-left:4px solid #e0a800;color:#7a5c00;font-weight:700;padding:10px 14px;border-radius:6px;margin:10px 0;font-size:13px}
  .destaque b{color:#c00000}
  .info{margin:8px 0;font-size:13px}
  .info b{color:#222}
  .fecho{margin:24px 0 4px;font-size:12.5px;color:#555;line-height:1.65;border-top:1px dashed #ddd;padding-top:16px}
  .fecho b{color:#c00000}
  .rodape{background:#1a1a1a;color:#cfcfcf;padding:18px 34px;text-align:center;font-size:11px;line-height:1.8}
  .rodape .emp{color:#fff;font-size:24px;font-weight:900;font-style:italic;letter-spacing:-1px;font-family:'Arial Black',Arial,sans-serif}
  .rodape .emp span{color:#ff5050}
  .rodape .contato{color:#ffb0b0}
  .rodape .ln{margin-top:5px}
  .btn-print{position:fixed;top:14px;right:14px;background:#c00000;color:#fff;border:none;padding:12px 20px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;box-shadow:0 4px 14px rgba(192,0,0,.35);z-index:9}
  .btn-print:hover{background:#a00000}
  @page{margin:12mm} @media print{ .btn-print{display:none} body{background:#fff;padding:0;margin:0} .folha{box-shadow:none;max-width:100%;border-radius:0;margin:0} }
</style></head><body>
<button class="btn-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
<div class="folha">
  <div class="cab">${logoHtml}<div class="cab-dir"><div class="tit">PROPOSTA DE LOCAÇÃO</div><div class="sub">Veículos &amp; Equipamentos</div></div></div>
  <div class="corpo">
    <div class="saud">Prezado(a) <b>${esc(p.contratante||'cliente')}</b>,<br>É com satisfação que a <b>MH3 Rental</b> apresenta sua proposta comercial para locação, elaborada com as melhores condições para atender às necessidades da sua operação.</div>
    <div class="dados">
      <div class="row">
        <div class="campo"><span class="lbl">Data</span><span class="val">${dt(p.data)||'—'}</span></div>
        <div class="campo"><span class="lbl">Validade da proposta</span><span class="val">${dt(p.validade)||'—'}</span></div>
        <div class="campo"><span class="lbl">Empresa / Solicitante</span><span class="val">${esc(p.contratante||'—')}</span></div>
      </div>
      <div class="row">
        <div class="campo"><span class="lbl">Obra / Cidade</span><span class="val">${esc(p.obra||'—')}</span></div>
        <div class="campo"><span class="lbl">Veículo / Equipamento</span><span class="val">${esc(p.veiculo||'—')}</span></div>
      </div>
      <div class="row">
        <div class="campo"><span class="lbl">Modelo</span><span class="val">${esc(p.modelo||'—')}</span></div>
        <div class="campo"><span class="lbl">Ano</span><span class="val">${esc(p.ano||'—')}</span></div>
        ${kmHrHtml}
      </div>
    </div>
    <div class="sec"><span class="bar"></span><h3>Valores</h3></div>
    ${tabelaValores}
    ${obs?('<div class="sec"><span class="bar"></span><h3>Observações</h3></div><ul class="lst">'+obs+'</ul>'):''}
    <div class="info" style="margin-top:18px"><b>Mobilização / Desmobilização:</b> ${mobilTxt}</div>
    <div class="destaque">📋 PRAZO, FIDELIDADE E RESCISÃO:<br>${esc(p.duracao||'').replace(/\n/g,'<br>')}</div>
    ${resp?('<div class="sec"><span class="bar"></span><h3>Responsabilidades da Contratante</h3></div><ul class="lst">'+resp+'</ul>'):''}
    ${seg?('<div class="sec"><span class="bar"></span><h3>Seguro</h3></div><div class="seg-box">'+seg+'</div>'):''}
    <div class="dados" style="margin-top:18px">
      <div class="row">
        <div class="campo"><span class="lbl">Ciclo de medição</span><span class="val">${esc(p.ciclo||'—')}</span></div>
        <div class="campo"><span class="lbl">Condição de pagamento</span><span class="val">${esc(p.pagamento||'—')}</span></div>
      </div>
    </div>
    <div class="fecho">Agradecemos a oportunidade e a confiança em nossos serviços. Permanecemos à inteira disposição para esclarecer dúvidas e ajustar esta proposta conforme a sua necessidade.<br><br>Atenciosamente,<br><b>Equipe MH3 Rental</b></div>
  </div>
  <div class="rodape">
    <div class="emp">${esc(rodNome)}</div>
    ${rodTextoHtml}
  </div>
</div>
</body></html>`;
  }
  window._buildPropostaHTML = buildPropostaHTML;

  window.gerarProposta = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var w=window.open('','_blank');
    if(!w){ toast('Permita pop-ups para gerar a proposta','er'); return; }
    w.document.write(buildPropostaHTML(p));
    w.document.close();
  };

  function carregarLibsPDF(cb){
    function temLibs(){ return !!(window.html2canvas && window.jspdf && window.jspdf.jsPDF); }
    if(temLibs()){ cb(true); return; }
    var precisa=[];
    if(!window.html2canvas) precisa.push('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
    if(!(window.jspdf&&window.jspdf.jsPDF)) precisa.push('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js');
    if(!precisa.length){ cb(temLibs()); return; }
    var restantes=precisa.length, falhou=false;
    precisa.forEach(function(src){
      var s=document.createElement('script'); s.src=src;
      s.onload=function(){ restantes--; if(restantes<=0) cb(temLibs()&&!falhou); };
      s.onerror=function(){ falhou=true; restantes--; if(restantes<=0) cb(false); };
      document.head.appendChild(s);
    });
  }
  function propGerarPDF(p, cb){
    carregarLibsPDF(function(ok){
      if(!ok || !window.html2canvas || !(window.jspdf&&window.jspdf.jsPDF)){ cb(null); return; }
      var ifr=document.createElement('iframe');
      ifr.style.cssText='position:fixed;left:-9999px;top:0;width:820px;height:1400px;border:none';
      document.body.appendChild(ifr);
      var doc=ifr.contentDocument||ifr.contentWindow.document;
      doc.open(); doc.write(buildPropostaHTML(p)); doc.close();
      setTimeout(function(){
        try{ var btn=doc.querySelector('.btn-print'); if(btn) btn.parentNode.removeChild(btn); }catch(e){}
        try{
          doc.body.style.margin='0'; doc.body.style.padding='0'; doc.body.style.background='#ffffff';
          var folha0=doc.querySelector('.folha');
          if(folha0){ folha0.style.margin='0'; folha0.style.maxWidth='none'; folha0.style.width='794px'; folha0.style.boxShadow='none'; folha0.style.borderRadius='0'; }
        }catch(e){}
        var folha=doc.querySelector('.folha')||doc.body;
        // Coletar pontos de quebra SEGUROS (limite inferior de cada bloco/linha) p/ não cortar conteúdo no meio
        var fTop=folha.getBoundingClientRect().top;
        var pontos=[];
        try{
          folha.querySelectorAll('.cab, .corpo > *, table.vals tr, ul.lst li, .rodape').forEach(function(el){
            if(el.classList && el.classList.contains('sec')) return; // não quebrar logo após um título de seção (evita título órfão)
            var bot=el.getBoundingClientRect().bottom - fTop;
            if(bot>0) pontos.push(bot);
          });
        }catch(e){}
        var alturaCss=folha.scrollHeight;
        if(pontos.indexOf(alturaCss)<0) pontos.push(alturaCss);
        pontos=pontos.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a-b;});
        try{
          window.html2canvas(folha,{scale:2,backgroundColor:'#ffffff',useCORS:true,scrollX:0,scrollY:0,windowWidth:794}).then(function(canvas){
            try{
              var pdf=new window.jspdf.jsPDF('p','mm','a4');
              var pageW=pdf.internal.pageSize.getWidth(), pageH=pdf.internal.pageSize.getHeight();
              var escala=canvas.height/alturaCss;          // px-canvas por px-css
              var pxPorMm=canvas.width/pageW;              // px-canvas por mm
              var margemMm=6;                              // respiro no topo e na base de cada página
              var utilCanvas=(pageH-margemMm*2)*pxPorMm;   // altura útil por página (em px-canvas)
              var pts=pontos.map(function(v){return v*escala;});
              var total=canvas.height, y=0, primeira=true, guard=0;
              while(y<total-1 && guard<80){
                guard++;
                var limite=y+utilCanvas;
                var corte=0;
                for(var i=0;i<pts.length;i++){ if(pts[i]>y+12 && pts[i]<=limite+0.5) corte=pts[i]; }
                if(corte<=y) corte=Math.min(limite,total);  // bloco maior que a página: corta no limite (raro)
                var sliceH=Math.round(corte-y);
                if(sliceH<=0) break;
                var sc=document.createElement('canvas'); sc.width=canvas.width; sc.height=sliceH;
                var ctx=sc.getContext('2d'); ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,sc.width,sc.height);
                ctx.drawImage(canvas,0,Math.round(y),canvas.width,sliceH,0,0,canvas.width,sliceH);
                var imgSlice=sc.toDataURL('image/jpeg',0.95);
                var imgHmm=sliceH/pxPorMm;
                if(!primeira) pdf.addPage();
                pdf.addImage(imgSlice,'JPEG',0,margemMm,pageW,imgHmm);
                primeira=false; y=corte;
              }
              try{ document.body.removeChild(ifr); }catch(e){}
              cb(pdf.output('datauristring'));
            }catch(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); }
          }).catch(function(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); });
        }catch(e){ try{ document.body.removeChild(ifr); }catch(_){} cb(null); }
      }, 450);
    });
  }
  window.enviarPropostaEmail = function(id){
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var cs=window._mh3MinhasContas();
    if(!cs.length){ toast('Você não tem uma conta de e-mail liberada para enviar. Peça ao administrador para liberar uma em Configurações → Contas de E-mail.','er'); return; }
    document.getElementById('pe-prop-id').value=id;
    document.getElementById('pe-conta').innerHTML=cs.map(function(c){return '<option value="'+esc(c.id)+'">'+esc(c.remetente||c.apelido||c.host)+'</option>';}).join('');
    var emailCli = (typeof emailDoCliente==='function')? emailDoCliente(p.contratante) : '';
    document.getElementById('pe-para').value=emailCli||'';
    document.getElementById('pe-assunto').value='Proposta de Locação - '+(p.contratante||'MH3 Rental');
    document.getElementById('pe-msg').value='Prezado(a) '+(p.contratante||'cliente')+',\n\nSegue em anexo, em PDF, a nossa proposta comercial para locação.\nFicamos à inteira disposição para qualquer dúvida.\n\nAtenciosamente,\nEquipe MH3 Rental';
    document.getElementById('pe-status').innerHTML='';
    var pcf=document.getElementById('pe-confirmar'); if(pcf) pcf.checked=!!(D.config&&D.config.emailConfirmarSempre);
    openM('m-prop-email');
  };
  // ===== Envio unificado de e-mail (usado por proposta, OS, medição, contas, etc.) =====
  // Escolhe a conta do usuário logado (ou a primeira ativa) e envia pelo enviar_doc.php,
  // permitindo solicitar CONFIRMAÇÃO DE RECEBIMENTO. Faz fallback para api.php quando
  // permitido (envios sem anexo) e quando não há conta ou o enviar_doc.php não está no servidor.
  window._mh3MinhasContas = function(){
    var cs=(D.config&&D.config.contasEmail)||[];
    var nome=(typeof authUser!=='undefined'&&authUser)?(authUser.nome||''):'';
    var ids=[]; var fixos={ 'Noninho Fraga':'noninho', 'Arthur':'arthur' };
    (D.usuarios||[]).forEach(function(u){ if((u.nm||'')===nome) ids.push(u.id); });
    if(fixos[nome]) ids.push(fixos[nome]);
    return cs.filter(function(c){ return ids.indexOf(c.usuario_id)>=0; });
  };
  window._mh3ContaEnvio = function(){
    var cs=window._mh3MinhasContas();
    return cs.find(function(x){return x.ativo!=0;}) || cs[0] || null;  // PRIVACIDADE: só contas do usuário logado
  };
  // opts: {para, assunto, corpoHtml, pdfBase64, pdfNome, confirmar, permitirFallback, onProgress, onOk(j,confirmou), onErr(msg)}
  window.mh3EnviarEmail = function(opts){
    opts=opts||{};
    var para=(opts.para||'').trim(), assunto=(opts.assunto||'').trim(), corpoHtml=opts.corpoHtml||'';
    var prog=opts.onProgress||function(){}, ok=opts.onOk||function(){}, err=opts.onErr||function(){};
    var confirmar=!!opts.confirmar, permitirFallback=!!opts.permitirFallback;
    var conta=window._mh3ContaEnvio();
    function viaApi(){ // fallback: api.php (não suporta confirmação de recebimento)
      prog('Enviando…');
      fetch(API+'?action=enviar_email',{method:'POST',headers:{'Content-Type':'application/json','X-Token':authToken},body:JSON.stringify({para:para,assunto:assunto,corpo:corpoHtml})})
        .then(function(r){return r.json();})
        .then(function(j){ if(j&&j.ok) ok(j,false); else err((j&&j.msg)||'Não foi possível enviar.'); })
        .catch(function(){ err('Falha de conexão ao enviar e-mail.'); });
    }
    if(!conta){ if(permitirFallback){ viaApi(); } else { err('Cadastre uma conta de e-mail em Configurações → Contas de E-mail para poder enviar.'); } return; }
    prog(confirmar?'📤 Enviando (com confirmação de recebimento)…':'📤 Enviando…');
    var payload={
      chave:'mh3-envio-doc-2026',
      host:conta.host, porta:conta.porta||587, seg:conta.seg||'tls',
      login:conta.usuario||conta.remetente, senha:conta.senha,
      remetente:conta.remetente, nome_remetente:conta.nome_remetente||'MH3 Rental',
      para:para, assunto:assunto, corpo_html:corpoHtml,
      confirmar_recebimento: confirmar?1:0
    };
    if(opts.pdfBase64){ payload.pdf_base64=opts.pdfBase64; payload.pdf_nome=opts.pdfNome||'documento.pdf'; }
    fetch('enviar_doc.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
      .then(function(r){ if(r.status===404){ throw new Error('ARQUIVO_AUSENTE'); } return r.text().then(function(t){ try{return JSON.parse(t);}catch(e){throw new Error('RESPOSTA_INVALIDA:'+t.slice(0,140));} }); })
      .then(function(j){ if(j&&j.ok) ok(j,confirmar); else { if(permitirFallback){ viaApi(); } else err((j&&j.msg)||'Não foi possível enviar.'); } })
      .catch(function(e){
        var m=String(e&&e.message||e);
        if(m.indexOf('ARQUIVO_AUSENTE')>=0){ if(permitirFallback){ viaApi(); } else err('O arquivo enviar_doc.php não foi encontrado no servidor. Suba-o via Web FTP na mesma pasta do sistema.'); }
        else if(permitirFallback){ viaApi(); }
        else err(m.indexOf('RESPOSTA_INVALIDA')>=0 ? 'O servidor respondeu algo inesperado (possível erro de PHP no enviar_doc.php).' : 'Falha de conexão com o servidor ao enviar.');
      });
  };

  window.confirmarEnvioProposta = function(){
    var id=document.getElementById('pe-prop-id').value;
    var p=(D.propostas||[]).find(function(x){return x.id===id;}); if(!p)return;
    var cs=window._mh3MinhasContas();
    var conta=cs.find(function(c){return c.id===document.getElementById('pe-conta').value;})||cs[0];
    var para=document.getElementById('pe-para').value.trim();
    var assunto=document.getElementById('pe-assunto').value.trim();
    var msg=document.getElementById('pe-msg').value.trim();
    var st=document.getElementById('pe-status'), btn=document.getElementById('pe-btn');
    var listaPara=para.split(/[;,]+/).map(function(e){return e.trim();}).filter(Boolean);
    if(!conta){ toast('Selecione a conta de envio','er'); return; }
    if(!listaPara.length || !listaPara.every(function(e){return /.+@.+\..+/.test(e);})){ toast('Informe ao menos um e-mail de destino válido (separe vários por vírgula)','er'); return; }
    if(window.lembrarEmail) window.lembrarEmail(listaPara);
    if(!assunto){ toast('Informe o assunto','er'); return; }
    btn.disabled=true; st.style.color='var(--mt)'; st.innerHTML='⏳ Gerando o PDF da proposta…';
    propGerarPDF(p, function(dataUri){
      if(!dataUri){
        btn.disabled=false; st.style.color='var(--rd)';
        st.innerHTML='❌ Não consegui gerar o PDF (verifique a conexão com a internet). Você pode usar o botão 📄 Gerar e salvar o PDF manualmente.';
        return;
      }
      st.style.color='var(--mt)'; st.innerHTML='📤 Enviando o e-mail com o anexo…';
      var corpoHtml='<div style="font-family:Arial,sans-serif;font-size:13px">'+esc(msg).replace(/\n/g,'<br>')+'</div>';
      var nomeArq='Proposta_'+((p.contratante||'cliente').replace(/[^A-Za-z0-9]/g,'_')).slice(0,30)+'.pdf';
      var pedirConf=(document.getElementById('pe-confirmar')&&document.getElementById('pe-confirmar').checked)?1:0;
      fetch('enviar_doc.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        chave:'mh3-envio-doc-2026',
        host:conta.host, porta:conta.porta||587, seg:conta.seg||'tls', login:conta.usuario||conta.remetente, senha:conta.senha,
        remetente:conta.remetente, nome_remetente:conta.nome_remetente||'MH3 Rental',
        para:para, assunto:assunto, corpo_html:corpoHtml, pdf_base64:dataUri, pdf_nome:nomeArq,
        confirmar_recebimento: pedirConf
      })}).then(function(r){
        if(r.status===404){ throw new Error('ARQUIVO_AUSENTE'); }
        return r.text().then(function(t){ try{ return JSON.parse(t); }catch(e){ throw new Error('RESPOSTA_INVALIDA:'+t.slice(0,120)); } });
      }).then(function(j){
        btn.disabled=false;
        if(j&&j.ok){ st.style.color='var(--gn)'; st.innerHTML='✅ '+esc(j.msg)+(pedirConf?'<br><span style="font-size:11px;color:var(--mt)">📩 Confirmação de recebimento solicitada — o aviso chegará na sua caixa quando o cliente abrir.</span>':''); if(typeof toast==='function')toast('Proposta enviada para '+para+'!','ok'); setTimeout(function(){closeM('m-prop-email');},1900); }
        else { st.style.color='var(--rd)'; st.innerHTML='❌ '+esc((j&&j.msg)||'Não foi possível enviar.')+'<br><span style="font-size:10px;color:var(--mt)">Verifique os dados da conta de e-mail (servidor, porta, login e senha) em Configurações → Contas de E-mail.</span>'; }
      }).catch(function(e){
        btn.disabled=false; st.style.color='var(--rd)';
        var m=String(e&&e.message||e);
        if(m.indexOf('ARQUIVO_AUSENTE')>=0){
          st.innerHTML='❌ O arquivo <b>enviar_doc.php</b> não foi encontrado no servidor.<br><span style="font-size:11px;color:var(--mt)">Suba o arquivo <b>enviar_doc.php</b> (que eu te enviei) via Web FTP, na <b>mesma pasta</b> onde estão o sistema e o api.php.</span>';
        } else if(m.indexOf('RESPOSTA_INVALIDA')>=0){
          st.innerHTML='❌ O servidor respondeu algo inesperado (pode ser erro de PHP no enviar_doc.php).<br><span style="font-size:10px;color:var(--mt)">Detalhe: '+esc(m.replace('Error: RESPOSTA_INVALIDA:',''))+'</span>';
        } else {
          st.innerHTML='❌ Falha de conexão com o servidor ao enviar.<br><span style="font-size:11px;color:var(--mt)">Confira sua internet. Se persistir, confirme que o <b>enviar_doc.php</b> está no servidor.</span>';
        }
      });
    });
  };

})();

