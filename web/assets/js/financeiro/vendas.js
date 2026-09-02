// ============ VENDA ============
function addVendaEstq(){const disp=D.estoque.filter(e=>e.qt>0);if(!disp.length){toast('Sem itens','er');return;}const opts=disp.map((e,i)=>`${i+1}. ${e.ds} (${e.qt}${e.un} / Venda: ${fmt(e.pv||e.cv*1.3)})`);const s=prompt('Selecione:\n'+opts.join('\n'));const idx=parseInt(s)-1;if(isNaN(idx)||idx<0||idx>=disp.length)return;const item=disp[idx];const qtd=parseFloat(prompt('Quantidade:','1')||0);if(!qtd||qtd>item.qt){toast('Qtd inválida','er');return;}const preco=item.pv||Math.round(item.cv*(1+(D.config.margem||30)/100)*100)/100;vdItems.push({id:uid(),desc:item.ds,qtd,val:preco,custo:item.cv,tipo:'Produto',estqId:item.id});item.qt-=qtd;sv();rdVdItems();}
function addVendaManual(){const desc=prompt('Descrição do item/serviço:');if(!desc)return;const qtd=parseFloat(prompt('Quantidade:','1')||1);const val=parseFloat(prompt('Valor unitário (R$):','0')||0);const tipo=confirm('É PRODUTO?\nOK=Produto / Cancelar=Serviço')?'Produto':'Serviço';vdItems.push({id:uid(),desc,qtd,val,tipo,fonte:'manual'});rdVdItems();}
function rdVdItems(){const el=document.getElementById('vd-items-list');if(!el)return;const sub=vdItems.reduce((s,i)=>s+i.qtd*i.val,0);const desc=parseFloat(document.getElementById('vd-desc').value)||0;const tot=sub*(1-desc/100);el.innerHTML=vdItems.length?vdItems.map(i=>`<div class="lanc-row"><div><div style="font-size:11px;font-weight:500">${i.desc}</div><div style="font-size:9px;color:var(--mt)">${i.tipo} · ${i.qtd}x · ${fmt(i.val)}</div></div><div style="display:flex;align-items:center;gap:5px"><span style="font-family:'Barlow Condensed';font-size:12px;font-weight:700;color:var(--gn)">${fmt(i.qtd*i.val)}</span><button class="btn bw btn-xs" onclick="editVdItem('${i.id}')" title="Editar este item">✏️</button> <button class="btn bd btn-xs" onclick="rmVdItem('${i.id}')">×</button></div></div>`).join(''):'<div class="empty"><div class="ei">🛒</div>Adicione itens</div>';document.getElementById('vd-total').textContent=fmt(tot);}
function calcVenda(){rdVdItems();}
function rmVdItem(id){const i=vdItems.find(x=>x.id===id);if(i&&i.estqId){const e=D.estoque.find(x=>x.id===i.estqId);if(e)e.qt+=i.qtd;sv();}if(i&&i.fonte==='pneu'&&i.pneuId){var p=(D.pneus||[]).find(function(x){return x.id===i.pneuId;});if(p&&p.st==='vendido'){p.st='estoque';p.vdNum='';p.dtVenda='';p.local='Estoque';sv();}}vdItems=vdItems.filter(x=>x.id!==id);rdVdItems();}
function addVendaPneu(){
  var disp=(D.pneus||[]).filter(function(p){return p.st==='estoque';});
  if(!disp.length){toast('Nenhum pneu em estoque.','er');return;}
  var jaAdd=vdItems.filter(function(x){return x.fonte==='pneu';}).map(function(x){return x.pneuId;});
  disp=disp.filter(function(p){return jaAdd.indexOf(p.id)<0;});
  if(!disp.length){toast('Todos os pneus do estoque já foram adicionados.','er');return;}
  var opts=disp.map(function(p,i){return (i+1)+'. '+(p.num||'?')+' — '+(p.mk||'')+' '+(p.med||'')+' ('+(p.cond||'')+')';});
  var s=prompt('Selecione o pneu para vender (baixa do estoque, SEM gerar pendência):\n'+opts.join('\n'));
  if(s===null)return;
  var idx=parseInt(s)-1; if(isNaN(idx)||idx<0||idx>=disp.length){toast('Opção inválida.','er');return;}
  var p=disp[idx];
  var val=parseFloat((prompt('Valor de venda do pneu '+(p.num||'')+' (R$):','0')||'0').replace(',','.'))||0;
  vdItems.push({id:uid(),desc:'Pneu '+(p.num||'')+' '+(p.mk||'')+' '+(p.med||''),qtd:1,val:val,tipo:'Produto',fonte:'pneu',pneuId:p.id});
  rdVdItems();
  toast('Pneu adicionado à venda (sai do estoque ao salvar).','ok');
}
function processarPneusVenda(itens, vdNum, cli){
  if(!Array.isArray(D.pneus))return;
  if(!Array.isArray(D.pneus_hist))D.pneus_hist=[];
  var hoje=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  (itens||[]).forEach(function(it){
    if(it.fonte==='pneu' && it.pneuId){
      var p=D.pneus.find(function(x){return x.id===it.pneuId;});
      if(p && p.st==='estoque'){
        p.st='vendido'; p.vdNum=vdNum; p.dtVenda=hoje; p.local='Vendido';
        D.pneus_hist.push({num:p.num,tipo:'venda',destino:'Venda '+(vdNum||'')+(cli?' — '+cli:''),dt:hoje});
      }
    }
  });
}
function editVdItem(id){
  const i=vdItems.find(x=>x.id===id);if(!i)return;
  const desc=prompt('Descrição do item/serviço:', i.desc||'');if(desc===null)return;
  const qtdStr=prompt('Quantidade:', String(i.qtd!=null?i.qtd:1));if(qtdStr===null)return;
  const qtd=parseFloat(qtdStr)||0; if(qtd<=0){toast('Quantidade inválida','er');return;}
  const valStr=prompt('Valor unitário (R$):', String(i.val!=null?i.val:0));if(valStr===null)return;
  const val=parseFloat(valStr)||0;
  // Se o item veio do estoque, ajusta a quantidade reservada conforme a diferença
  if(i.estqId){
    const e=D.estoque.find(x=>x.id===i.estqId);
    if(e){ const diff=qtd-i.qtd; if(diff>e.qt){ toast('Quantidade maior que o estoque disponível ('+e.qt+').','er'); return; } e.qt-=diff; sv(); }
  }
  i.desc=(desc.trim()||i.desc); i.qtd=qtd; i.val=val;
  rdVdItems();
  toast('Item atualizado');
}


// ---- IMPRESSÃO PDF + COMPARTILHAR ----
function imprimirPDF(titulo){
  // Usa a impressão nativa do navegador (que permite salvar como PDF)
  // e oferece compartilhamento via Web Share API quando disponível
  window.print();
}

async function compartilhar(titulo, texto){
  // Web Share API - compartilha em apps do celular (WhatsApp, email, etc)
  if(navigator.share){
    try{
      await navigator.share({title:titulo||'MH3 Rental',text:texto||'Documento do sistema MH3'});
    }catch(e){/* usuário cancelou */}
  }else{
    // Fallback: copia para área de transferência
    if(navigator.clipboard&&texto){
      navigator.clipboard.writeText(texto);
      toast('Conteúdo copiado! Cole onde quiser compartilhar.','ok');
    }else{
      toast('Use o botão Imprimir e salve como PDF para compartilhar.','ok');
    }
  }
}

