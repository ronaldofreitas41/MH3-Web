// ---- LIMPAR DADOS POR MÓDULO (sub-aba) ----
const LIMPAR_CONFIG = {
  contas_pagar:   {nome:'Contas a Pagar',        arrays:['despesas','nfs'],     render:'rdContasPagar'},
  contas_receber: {nome:'Contas a Receber',      arrays:['medicoes','vendas'],  render:'rdContasReceber'},
  despesas:       {nome:'Despesas',              arrays:['despesas'],           render:'rdDespesas'},
  manutencao:     {nome:'Manutenções / OS',      arrays:['manutencoes'],        render:'rdMn'},
  mobilizacao:    {nome:'Mobilizações',          arrays:['mobilizacoes'],       render:'rdMobilizacao'},
  medicoes:       {nome:'Medições',              arrays:['medicoes'],           render:'rdMedicoes'},
  estoque:        {nome:'Estoque',               arrays:['estoque'],            render:'rdEstoque'},
  saida_material: {nome:'Saída de Material',     arrays:['saidasMaterial'],     render:'rdSaidaMaterial'},
  ajuda_motorista:{nome:'Ajuda Motoristas',      arrays:['ajudasMotorista'],    render:'rdAjudaMotorista'},
  investimento:   {nome:'Investimentos',         arrays:['investimentos'],      render:'rdInvestimento'},
  prejuizos:      {nome:'Prejuízos',             arrays:['prejuizos'],          render:'rdPrejuizos'}
};
function limparModulo(modulo){
  const cfg=LIMPAR_CONFIG[modulo];
  if(!cfg){toast('Módulo desconhecido','er');return;}
  // TRAVA 1: somente administrador
  const ehAdmin=(authUser&&authUser.perfil==='admin')||((authUser&&authUser.nome?authUser.nome:'').toLowerCase().includes('noninho'));
  if(!ehAdmin){
    toast('🚫 Somente o Administrador pode limpar os dados.','er');
    if(typeof auditar==='function')auditar('NEGADO',modulo,'TENTATIVA de limpar '+cfg.nome+' NEGADA: '+(authUser?authUser.nome:'?'));
    return;
  }
  // conta quantos registros existem
  let qtd=0;cfg.arrays.forEach(a=>{qtd+=(D[a]||[]).length;});
  if(qtd===0){toast('Não há registros para limpar em '+cfg.nome,'er');return;}
  // TRAVA 2: confirmação digitada
  const txt=prompt('⚠️ ATENÇÃO — AÇÃO IRREVERSÍVEL!\n\nIsto vai APAGAR TODOS os '+qtd+' registros de "'+cfg.nome+'".\n\nUm backup será feito automaticamente antes.\n\nPara confirmar, digite: LIMPAR');
  if(txt===null)return;
  if(txt.trim().toUpperCase()!=='LIMPAR'){toast('Confirmação incorreta. Nada foi apagado.','er');return;}
  // TRAVA 3: senha de administrador
  reqSenha(()=>{
    // TRAVA 4: confirmação final
    if(!confirm('ÚLTIMA CONFIRMAÇÃO!\n\nApagar TODOS os '+qtd+' registros de "'+cfg.nome+'" agora? Não pode ser desfeito (exceto restaurando o backup).'))return;
    // Backup antes de limpar
    try{localStorage.setItem('mh3_backup_antes_limpar_'+modulo, JSON.stringify(D));}catch(e){}
    cfg.arrays.forEach(a=>{D[a]=[];});
    if(typeof auditar==='function')auditar('EXCLUSAO',modulo,'LIMPEZA TOTAL de '+cfg.nome+': '+qtd+' registros apagados');
    sv();
    if(cfg.render&&typeof window[cfg.render]==='function')window[cfg.render]();
    if(typeof rp==='function')rp(cur);
    toast(cfg.nome+' limpo! '+qtd+' registros apagados (backup salvo).','ok');
  });
}

// ---- SISTEMA DE IMPORTAÇÃO REUTILIZÁVEL (CSV) ----
const IMPORT_CONFIG = {
  despesas: {
    titulo:'📥 Importar Despesas',
    colunas:['descricao','categoria','fornecedor','valor','vencimento','placa'],
    exemplo:['Combustível posto X','Combustível','Posto ABC','1500,00','2026-06-20','ABC-1234'],
    criar:(c)=>({id:uid(),antigo:true,desc:c.descricao||'',cat:c.categoria||'Geral',forn:c.fornecedor||'',vl:parseValor(c.valor),vc:c.vencimento||'',dt:c.vencimento||new Date().toISOString().substring(0,10),placa:c.placa||'',st:'pendente',cp:'sim',fluxo:'sim',pag:'eletronico',ob:'Importado'}),
    destino:'despesas'
  },
  contas_pagar: {
    titulo:'📥 Importar Contas a Pagar',
    colunas:['descricao','fornecedor','valor','vencimento','placa'],
    exemplo:['Parcela financiamento','Banco X','2500,00','2026-06-15','ABC-1234'],
    criar:(c)=>({id:uid(),antigo:true,desc:c.descricao||'',forn:c.fornecedor||'',vl:parseValor(c.valor),vc:c.vencimento||'',dt:new Date().toISOString().substring(0,10),placa:c.placa||'',st:'pendente',cp:'sim',cat:'Geral',ob:'Importado'}),
    destino:'despesas'
  },
  contas_receber: {
    titulo:'📥 Importar Contas a Receber',
    colunas:['cliente','descricao','valor','vencimento','placa'],
    exemplo:['Cliente A','Medição obra X','5000,00','2026-06-30','ABC-1234'],
    criar:(c)=>({id:uid(),antigo:true,cl:c.cliente||'',de:c.descricao||'Recebimento',at:'',vc:c.vencimento||'',vl:parseValor(c.valor),dc:0,total:parseValor(c.valor),placa:c.placa||'',st:'pendente',fluxo:'sim',tipo:'avulso',ob:'Importado'}),
    destino:'medicoes'
  },
  manutencao: {
    titulo:'📥 Importar Manutenções/OS',
    colunas:['placa','tipo','descricao','custo','data'],
    exemplo:['ABC-1234','Reparo Corretivo','Troca de óleo','800,00','2026-06-08'],
    criar:(c)=>({id:uid(),antigo:true,osNum:'IMP-'+Math.floor(Math.random()*9000+1000),placa:c.placa||'',eqId:(function(){var _e=(D.equips||[]).find(function(x){return _normPlacaImp(x.placa)===_normPlacaImp(c.placa||'');});return _e?_e.id:'';})(),eqLbl:c.placa||'-',tipo:c.tipo||'Reparo Corretivo',ob:c.descricao||'',en:c.data||'',total:parseValor(c.custo),custo:parseValor(c.custo),status:'concluida',finStatus:'pendente',lancs:[],fotos:[],dt:c.data||new Date().toISOString().substring(0,10)}),
    destino:'manutencoes'
  },
  mobilizacao: {
    titulo:'📥 Importar Mobilizações',
    colunas:['placa','cliente','cidade','data','tipo'],
    exemplo:['ABC-1234','Cliente A','João Monlevade','2026-06-08','mobilizacao'],
    criar:(c)=>({id:uid(),antigo:true,placa:c.placa||'',cliente:c.cliente||'',cidade:c.cidade||'',saida:c.data||'',tipo:c.tipo||'mobilizacao',ob:'Importado',fotos:[],eixos:[]}),
    destino:'mobilizacoes'
  }
};
function parseValor(v){
  if(!v)return 0;
  v=String(v).replace(/[R$\s.]/g,'').replace(',','.');
  return parseFloat(v)||0;
}
let importLinhas=[];
let importRevLinhas=[];
function _normPlacaImp(p){return String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function _parseKmHrImp(s){
  s=String(s||'').replace(/\./g,'').trim();
  var m=s.split(/[Hh]/);
  var km=parseInt((m[0]||'').replace(/[^0-9]/g,''))||0;
  var hr=0; if(m.length>1) hr=parseInt((m[1]||'').replace(/[^0-9]/g,''))||0;
  return {km:km,hr:hr};
}
function _parseDataBRImp(s){
  s=String(s||'').trim();
  var m=s.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if(m) return m[3]+'-'+('0'+m[2]).slice(-2)+'-'+('0'+m[1]).slice(-2);
  return s;
}
function abrirImportRev(){
  var ta=document.getElementById('imp-rev-paste'); if(ta)ta.value='';
  var pv=document.getElementById('imp-rev-preview'); if(pv)pv.innerHTML='';
  var btn=document.getElementById('imp-rev-btn'); if(btn)btn.style.display='none';
  importRevLinhas=[];
  openM('m-import-rev');
}
function processarImportRev(){
  var txt=(document.getElementById('imp-rev-paste')||{}).value||'';
  var linhas=parseCSV(txt);
  if(!linhas.length){toast('Cole o relatório primeiro.','er');return;}
  var header=linhas[0].map(function(h){return (h||'').toLowerCase();});
  var idxPlaca=-1, idxKm=-1, idxHr=-1, idxData=-1, idxOS=-1, idxSit=-1;
  header.forEach(function(h,i){
    if(idxPlaca<0 && h.indexOf('placa')>=0) idxPlaca=i;
    if(idxHr<0 && h.indexOf('hori')>=0) idxHr=i;
    if(idxKm<0 && h.indexOf('km')>=0) idxKm=i;
    if(idxData<0 && h.indexOf('data')>=0) idxData=i;
    if(idxOS<0 && (h.indexOf('ordem')>=0||h==='os'||h.indexOf('servic')>=0||h.indexOf('serviç')>=0)) idxOS=i;
    if(idxSit<0 && (h.indexOf('situac')>=0||h.indexOf('tipo')>=0)) idxSit=i;
  });
  var temHeader = idxPlaca>=0;
  if(!temHeader){ idxOS=0; idxPlaca=1; idxSit=2; idxKm=3; idxHr=4; idxData=5; }
  var soNumImp=function(s){return parseInt(String(s||'').replace(/\./g,'').replace(/[^0-9]/g,''))||0;};
  var dados = temHeader ? linhas.slice(1) : linhas;
  var rkm=parseInt(D.config.rkm)||10000, rhr=parseInt(D.config.rhr)||500;
  importRevLinhas=[];
  dados.forEach(function(c){
    var placaCSV=(c[idxPlaca]||'').trim();
    if(!placaCSV)return;
    var km, hr;
    if(idxHr>=0){ km=soNumImp(c[idxKm]); hr=soNumImp(c[idxHr]); }
    else { var kh=_parseKmHrImp(idxKm>=0?c[idxKm]:''); km=kh.km; hr=kh.hr; }
    var data=_parseDataBRImp(idxData>=0?c[idxData]:'');
    var osNum=(idxOS>=0?(c[idxOS]||'').trim():'');
    var sit=((idxSit>=0?(c[idxSit]||'').trim():'')||'PREVENTIVA');
    var np=_normPlacaImp(placaCSV);
    var eq=(D.equips||[]).find(function(e){return _normPlacaImp(e.placa)===np;});
    importRevLinhas.push({placaCSV:placaCSV, eqId:eq?eq.id:'', placaSis:eq?eq.placa:'', eqMo:eq?(eq.mo||''):'', achou:!!eq, km:km, hr:hr, data:data, osNum:osNum, sit:sit, pkm:km+rkm, phr:hr+rhr});
  });
  var pv=document.getElementById('imp-rev-preview');
  if(!importRevLinhas.length){pv.innerHTML='<p class="empty">Nenhuma linha válida.</p>';document.getElementById('imp-rev-btn').style.display='none';return;}
  var achados=importRevLinhas.filter(function(l){return l.achou;}).length;
  var naoAchados=importRevLinhas.length-achados;
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  var h='<div style="font-size:12px;font-weight:700;margin-bottom:6px">Prévia: '+importRevLinhas.length+' linha(s) — <span style="color:var(--gn)">'+achados+' encontrada(s)</span>'+(naoAchados?' · <span style="color:var(--red)">'+naoAchados+' sem veículo</span>':'')+'</div>';
  h+='<div class="tw" style="max-height:240px;overflow-y:auto"><table><thead><tr><th>Placa (relatório)</th><th>Veículo na Frota</th><th>KM</th><th>Hr</th><th>Data</th><th>Próx. revisão</th></tr></thead><tbody>';
  h+=importRevLinhas.map(function(l){
    return '<tr style="'+(l.achou?'':'background:rgba(220,38,38,.08)')+'"><td>'+escH(l.placaCSV)+'</td><td>'+(l.achou?'<span class="badge b-gn">✓ '+escH(l.placaSis)+'</span>':'<span class="badge b-rd">✗ não cadastrado</span>')+'</td><td>'+(l.km||'-')+'</td><td>'+(l.hr||'-')+'</td><td style="font-size:10px">'+(l.data||'-')+'</td><td style="font-size:10px">'+l.pkm+'km / '+l.phr+'h</td></tr>';
  }).join('');
  h+='</tbody></table></div>';
  if(naoAchados)h+='<div style="font-size:10px;color:var(--mt);margin-top:6px">As linhas em vermelho não têm veículo com placa correspondente na Frota e serão ignoradas. Cadastre/ajuste a placa e clique em "Conferir" de novo.</div>';
  pv.innerHTML=h;
  var btn=document.getElementById('imp-rev-btn');
  btn.style.display=achados?'':'none';
  btn.textContent='Importar '+achados+' revisão(ões)';
}
function confirmarImportRev(){
  var ok=importRevLinhas.filter(function(l){return l.achou;});
  if(!ok.length){toast('Nenhuma revisão para importar.','er');return;}
  var hoje=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  var n=0;
  ok.forEach(function(l){
    var os={id:uid(),antigo:true,importadoRev:true,
      osNum:(l.osNum?(l.osNum+' (antigo)'):('ANT-'+Math.floor(Math.random()*9000+1000))),
      eqId:l.eqId, placa:l.placaSis, eqLbl:l.placaSis+(l.eqMo?(' '+l.eqMo):''),
      tipo:'Revisão Preventiva', en:l.data||'', sa:l.data||'',
      km:String(l.km||''), hr:String(l.hr||''), pkm:String(l.pkm||''), phr:String(l.phr||''),
      custo:'mh3', status:'concluida', finStatus:'pendente', resp:'',
      ob:'Importado do relatório de OS ('+(l.sit||'PREVENTIVA')+')',
      lancs:[], checklist:[], fotos:[], total:0, dt:(l.data||hoje)};
    D.manutencoes.push(os);
    var eq=D.equips.find(function(e){return e.id===l.eqId;});
    if(eq){
      if(!eq.km || (parseInt(l.km)||0) > (parseInt(eq.km)||0)) eq.km=String(l.km||eq.km||'');
      if(!eq.hr || (parseInt(l.hr)||0) > (parseInt(eq.hr)||0)) eq.hr=String(l.hr||eq.hr||'');
    }
    n++;
  });
  if(!D.seq)D.seq={};
  if((parseInt(D.seq.os)||0)<799)D.seq.os=799;
  if(typeof auditar==='function')auditar('IMPORTACAO','manutencoes',n+' revisões preventivas importadas do relatório de OS');
  sv();
  closeM('m-import-rev');
  toast(n+' revisão(ões) importada(s)! Veja em Acompanhamento de Revisão.','ok');
  if(typeof rdManut==='function')rdManut();
  if(typeof rdRev==='function')rdRev();
  if(typeof updPendCnt==='function')updPendCnt();
}
function abrirImportacao(modulo){
  const cfg=IMPORT_CONFIG[modulo];
  if(!cfg){toast('Módulo sem importação','er');return;}
  document.getElementById('imp-modulo').value=modulo;
  document.getElementById('imp-titulo').textContent=cfg.titulo;
  document.getElementById('imp-colunas').textContent=cfg.colunas.join(', ');
  document.getElementById('imp-file').value='';
  document.getElementById('imp-paste').value='';
  document.getElementById('imp-preview').innerHTML='';
  document.getElementById('imp-btn-confirmar').style.display='none';
  importLinhas=[];
  openM('m-import');
}
function baixarModeloCSV(){
  const cfg=IMPORT_CONFIG[document.getElementById('imp-modulo').value];
  if(!cfg)return;
  const csv=cfg.colunas.join(';')+'\n'+cfg.exemplo.join(';');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='modelo_'+document.getElementById('imp-modulo').value+'.csv';
  a.click();
}
function parseCSV(texto){
  // Detecta separador (; ou , ou tab)
  const linhas=texto.trim().split(/\r?\n/).filter(l=>l.trim());
  if(!linhas.length)return [];
  const sep=linhas[0].includes(';')?';':(linhas[0].includes('\t')?'\t':',');
  return linhas.map(l=>{
    // parser simples respeitando aspas
    const campos=[];let atual='';let dentro=false;
    for(let i=0;i<l.length;i++){
      const ch=l[i];
      if(ch==='"'){dentro=!dentro;}
      else if(ch===sep&&!dentro){campos.push(atual);atual='';}
      else atual+=ch;
    }
    campos.push(atual);
    return campos.map(c=>c.trim());
  });
}
function lerArquivoImport(){
  const file=document.getElementById('imp-file').files[0];
  if(!file)return;
  const r=new FileReader();
  r.onload=e=>{processarDadosImport(parseCSV(e.target.result));};
  r.readAsText(file,'UTF-8');
}
function processarPasteImport(){
  const txt=document.getElementById('imp-paste').value;
  if(txt.trim())processarDadosImport(parseCSV(txt));
}
function processarDadosImport(linhas){
  const cfg=IMPORT_CONFIG[document.getElementById('imp-modulo').value];
  if(!linhas.length){return;}
  // Primeira linha = cabeçalho? Detecta se a primeira linha contém nomes de colunas
  let header=linhas[0].map(h=>h.toLowerCase().replace(/[^a-z]/g,''));
  const colunasNorm=cfg.colunas.map(c=>c.toLowerCase().replace(/[^a-z]/g,''));
  const temHeader=header.some(h=>colunasNorm.includes(h));
  let dados=linhas;
  let mapa=cfg.colunas; // ordem padrão
  if(temHeader){
    mapa=header.map(h=>{const idx=colunasNorm.indexOf(h);return idx>=0?cfg.colunas[idx]:null;});
    dados=linhas.slice(1);
  }
  importLinhas=dados.map(linha=>{
    const obj={};
    mapa.forEach((col,i)=>{if(col)obj[col]=linha[i]||'';});
    return obj;
  }).filter(o=>Object.values(o).some(v=>v));
  // Prévia
  const prev=document.getElementById('imp-preview');
  if(!importLinhas.length){prev.innerHTML='<p class="empty">Nenhuma linha válida</p>';document.getElementById('imp-btn-confirmar').style.display='none';return;}
  let h='<div style="font-size:12px;font-weight:700;margin-bottom:6px">Prévia ('+importLinhas.length+' registros):</div><div class="tw" style="max-height:200px;overflow-y:auto"><table><thead><tr>'+cfg.colunas.map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>';
  importLinhas.slice(0,8).forEach(o=>{h+='<tr>'+cfg.colunas.map(c=>'<td style="font-size:11px">'+(o[c]||'-')+'</td>').join('')+'</tr>';});
  h+='</tbody></table></div>'+(importLinhas.length>8?'<p style="font-size:10px;color:var(--mt)">+'+(importLinhas.length-8)+' mais...</p>':'');
  prev.innerHTML=h;
  document.getElementById('imp-btn-confirmar').style.display='';
  document.getElementById('imp-btn-confirmar').textContent='Importar '+importLinhas.length+' registros';
}
function confirmarImport(){
  const modulo=document.getElementById('imp-modulo').value;
  const cfg=IMPORT_CONFIG[modulo];
  if(!cfg||!importLinhas.length)return;
  if(!confirm('Importar '+importLinhas.length+' registros para '+cfg.titulo.replace('📥 Importar ','')+'?'))return;
  let add=0;
  importLinhas.forEach(c=>{
    const reg=cfg.criar(c);
    D[cfg.destino].push(reg);
    add++;
  });
  auditar('IMPORTACAO',modulo,'Importação CSV: '+add+' registros em '+cfg.destino);
  sv();closeM('m-import');
  toast(add+' registros importados!','ok');
  if(typeof rp==='function')rp(cur);
}

