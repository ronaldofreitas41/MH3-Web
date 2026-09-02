// ---- ESTOQUE MELHORIAS ----
function gerarCodEstqAuto(){
  const cat=document.getElementById('estq-cat')?document.getElementById('estq-cat').value||'PEC':'PEC';
  const prefix=cat.substring(0,3).toUpperCase();
  const nums=D.estoque.map(e=>e.cd||'').filter(c=>c.startsWith(prefix));
  let maxNum=0;
  nums.forEach(c=>{const n=parseInt(c.replace(prefix+'-',''))||0;if(n>maxNum)maxNum=n;});
  return prefix+'-'+String(maxNum+1).padStart(4,'0');
}
function gerarCodEstq(){
  const cat=document.getElementById('estq-cat').value||'PEC';
  const prefix=cat.substring(0,3).toUpperCase();
  const nums=D.estoque.map(e=>e.cd||'').filter(c=>c.startsWith(prefix));
  let maxNum=0;
  nums.forEach(c=>{const n=parseInt(c.replace(prefix+'-',''))||0;if(n>maxNum)maxNum=n;});
  const newCod=prefix+'-'+String(maxNum+1).padStart(4,'0');
  document.getElementById('estq-cd').value=newCod;
  toast('Código gerado: '+newCod,'ok');
}

function calcPvEstq(){
  const cv=parseFloat(document.getElementById('estq-cv').value)||0;
  const tabSel=document.getElementById('estq-tab-venda').value;
  const margemEl=document.getElementById('estq-margem');
  const pvEl=document.getElementById('estq-pv');
  if(!cv||!pvEl) return;
  if(tabSel==='mh3'){
    // Tabela MH3 = custo (para veículos cadastrados)
    pvEl.value=cv.toFixed(2);
    if(margemEl){margemEl.value=0;margemEl.placeholder='0 (custo)';}
    return;
  }
  // Buscar margem da tabela cadastrada
  const tab=(D.config.tabelas||[]).find(t=>t.id===tabSel);
  if(tab){
    const margem=parseFloat(tab.margem)||0;
    if(margemEl) margemEl.value=margem;
    pvEl.value=(cv*(1+margem/100)).toFixed(2);
  }
}

function popTabelasEstq(){
  // Popula o dropdown de tabelas no modal de estoque
  const sel=document.getElementById('estq-tab-venda');
  if(!sel) return;
  const atual=sel.value;
  sel.innerHTML='<option value="mh3">Tabela MH3 (custo — veículos cadastrados)</option>';
  (D.config.tabelas||[]).forEach(t=>{
    sel.innerHTML+=`<option value="${t.id}">${t.nome} (${t.cat} +${t.margem}%)</option>`;
  });
  if(atual) sel.value=atual;
}

function entradaNfEstq(){
  const num=document.getElementById('nf-num-est').value.trim();
  const dt=document.getElementById('nf-dt-est').value;
  const forn=document.getElementById('nf-forn-est').value.trim();
  const vl=document.getElementById('nf-vl-est').value;
  if(!num||!dt||!forn){toast('Preencha NF, data e fornecedor','er');return;}
  // Auto fill product code from NF number
  document.getElementById('estq-cd').value='NF-'+num;
  document.getElementById('estq-nf-num').value=num;
  // Switch to dados tab
  document.querySelector('#m-estq .tab').click();
  toast('Dados da NF carregados. Complete os dados do produto.','ok');
}

function importarXmlNF(inp){
  const file=inp.files[0];
  if(!file){return;}
  const reader=new FileReader();
  reader.onload=e=>{
    try{
      const parser=new DOMParser();
      const xml=parser.parseFromString(e.target.result,'text/xml');
      // Extract NF-e data
      const dest=xml.querySelector('dest xNome');
      const nNF=xml.querySelector('ide nNF');
      const dhEmi=xml.querySelector('ide dhEmi');
      const emit=xml.querySelector('emit xNome');
      const vNF=xml.querySelector('ICMSTot vNF');
      const prods=xml.querySelectorAll('det prod');
      const destNome=dest?dest.textContent:'';
      // Validate destinatário
      if(destNome&&!destNome.toLowerCase().includes('mh3')){
        document.getElementById('xml-preview').innerHTML=`<div style="background:#fee2e2;color:#b91c1c;padding:10px;border-radius:6px">⚠️ Destinatário: <b>${destNome}</b><br>Esta NF não está em nome de MH3 Rental Ltda.</div>`;
        return;
      }
      let preview=`<div style="background:var(--cd2);border-radius:8px;padding:10px">
        <b>NF:</b> ${nNF?nNF.textContent:'-'} | <b>Emissão:</b> ${dhEmi?dhEmi.textContent.substring(0,10):'-'}<br>
        <b>Emitente:</b> ${emit?emit.textContent:'-'}<br>
        <b>Destinatário:</b> ${destNome} ✓<br>
        <b>Valor Total:</b> R$ ${vNF?parseFloat(vNF.textContent).toFixed(2):'?'}<br>
        <b>Itens:</b> ${prods.length}
        <div style="margin-top:8px">`;
      prods.forEach((p,i)=>{
        const xProd=p.querySelector('xProd');
        const qCom=p.querySelector('qCom');
        const vUnCom=p.querySelector('vUnCom');
        preview+=`<div style="font-size:11px;padding:4px;border-bottom:1px solid var(--br)">${i+1}. ${xProd?xProd.textContent:'-'} — Qtd: ${qCom?qCom.textContent:'-'} — R$ ${vUnCom?parseFloat(vUnCom.textContent).toFixed(2):'-'}</div>`;
      });
      preview+='</div>';
      // Fill main fields
      if(nNF) document.getElementById('nf-num-est').value=nNF.textContent;
      if(emit) document.getElementById('nf-forn-est').value=emit.textContent;
      if(vNF) document.getElementById('nf-vl-est').value=parseFloat(vNF.textContent).toFixed(2);
      if(prods.length>0){
        const xProd=prods[0].querySelector('xProd');
        if(xProd) document.getElementById('estq-ds').value=xProd.textContent;
        const vUnCom=prods[0].querySelector('vUnCom');
        if(vUnCom) document.getElementById('estq-cv').value=parseFloat(vUnCom.textContent).toFixed(2);
        const qCom=prods[0].querySelector('qCom');
        if(qCom) document.getElementById('estq-qt').value=parseFloat(qCom.textContent);
        // Auto-generate code from NF
        document.getElementById('estq-cd').value='NF-'+(nNF?nNF.textContent:'XML');
      }
      document.getElementById('xml-preview').innerHTML=preview+'</div>';
      toast('XML importado com sucesso!','ok');
    }catch(err){
      document.getElementById('xml-preview').innerHTML=`<div style="background:#fee2e2;color:#b91c1c;padding:10px;border-radius:6px">Erro ao ler XML: ${err.message}</div>`;
    }
  };
  reader.readAsText(file);
}

// ---- VENDA DE VEÍCULO/EQUIPAMENTO ----
