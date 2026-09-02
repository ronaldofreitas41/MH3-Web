// ============ DESPESA ============


function togglePrazoManualDesp(){
  const v=document.getElementById('desp-prazo-sel').value;
  const box=document.getElementById('desp-prazo-man-box');
  if(box)box.style.display=v==='__manual__'?'':'none';
}

function togglePrazoDesp(){
  const v=document.getElementById('desp-pag').value;
  const box=document.getElementById('desp-prazo-box');
  if(box) box.style.display=v==='prazo'?'':'none';
  if(v==='prazo'){
    const sel=document.getElementById('desp-prazo-sel');
    if(sel){
      sel.innerHTML='<option value="">Selecionar prazo...</option><option value="__manual__">✏️ Digitar prazo manual</option>';
      (D.config.prazos||[]).forEach(p=>{sel.innerHTML+=`<option value="${p.id}">${p.nome} (${p.detalhe})</option>`;});
    }
  }
}

function saveDesp(){const desc=document.getElementById('desp-desc').value.trim();if(!desc){toast('Informe a descrição','er');return;}const eid=document.getElementById('desp-eid').value;const doc=document.querySelector('input[name="desp-doc"]:checked');const flx=null; /* fluxo automático: sempre sim, exceto atrasado */const pag=document.getElementById('desp-pag')?document.getElementById('desp-pag').value:'eletronico';const prazoSel=document.getElementById('desp-prazo-sel')?document.getElementById('desp-prazo-sel').value:'';const data={desc,pag,prazoSel,cp:'sim',dt:document.getElementById('desp-dt').value,cat:document.getElementById('desp-cat').value,placa:document.getElementById('desp-placa').value,forn:document.getElementById('desp-forn').value,vl:parseFloat(document.getElementById('desp-vl').value)||0,vc:document.getElementById('desp-vc').value,doc:doc?doc.value:'Avulso',ndoc:document.getElementById('desp-ndoc').value,st:document.getElementById('desp-st').value,fluxo:'sim'};if(eid){
    const idx=D.despesas.findIndex(x=>x.id===eid);
    if(idx>-1)D.despesas[idx]={...D.despesas[idx],...data};
  }else if(pag==='prazo'&&prazoSel){
    // BUG CORRIGIDO: prazo com parcelas/dias gera MÚLTIPLOS lançamentos no Contas a Pagar
    let prz=(D.config.prazos||[]).find(p=>p.id===prazoSel);
    if(prazoSel==='__manual__'){
      const man=document.getElementById('desp-prazo-man')?document.getElementById('desp-prazo-man').value.trim():'';
      if(man)prz={tipo:'dias',detalhe:man};
    }
    let parcelas=[];
    if(prz){
      if(prz.tipo==='parcelas'){
        // Ex: 2x → 2 lançamentos mensais
        const n=parseInt(prz.detalhe)||1;
        const base=data.vc?new Date(data.vc+'T12:00'):new Date();
        for(let i=0;i<n;i++){
          const dt=new Date(base);dt.setMonth(dt.getMonth()+i);
          parcelas.push({vcParc:dt.toISOString().substring(0,10),nParc:i+1,total:n});
        }
      }else{
        // dias ou intervalo: ex 28/56 → lançamento a cada data
        const dias=String(prz.detalhe).split('/').map(d=>parseInt(d)).filter(d=>d>0);
        const base=data.dt?new Date(data.dt+'T12:00'):new Date();
        dias.forEach((d,i)=>{
          const dt=new Date(base);dt.setDate(dt.getDate()+d);
          parcelas.push({vcParc:dt.toISOString().substring(0,10),nParc:i+1,total:dias.length});
        });
      }
    }
    if(parcelas.length>1){
      const vlParc=Math.round((data.vl/parcelas.length)*100)/100;
      parcelas.forEach(p=>{
        D.despesas.push({...data,id:uid(),
          desc:data.desc+' — Parcela '+p.nParc+'/'+p.total,
          vl:vlParc,vc:p.vcParc,parcela:p.nParc,totalParc:p.total});
      });
      toast(parcelas.length+' lançamentos gerados no Contas a Pagar ('+fmt(vlParc)+' cada)!','ok');
    }else{
      data.id=uid();D.despesas.push(data);
    }
  }else{
    data.id=uid();D.despesas.push(data);
  }document.getElementById('desp-eid').value='';auditar(eid?'ALTERACAO':'CRIACAO','despesas',(eid?'Despesa ALTERADA':'Despesa criada')+': '+desc+' '+fmt(parseFloat(document.getElementById('desp-vl').value)||0));sv();closeM('m-desp');toast('Despesa salva!');rdDesp();rdFin();}
function openEditDesp(id){if(_bloqEditar('desp'))return;reqSenha(()=>{const e=D.despesas.find(x=>x.id===id);if(!e)return;popSels();document.getElementById('desp-eid').value=id;document.getElementById('desp-mtitle').textContent='✏️ Editar Despesa';document.getElementById('desp-desc').value=e.desc||'';document.getElementById('desp-dt').value=e.dt||'';document.getElementById('desp-cat').value=e.cat||'Outros';document.getElementById('desp-placa').value=e.placa||'';document.getElementById('desp-forn').value=e.forn||'';document.getElementById('desp-vl').value=e.vl||0;document.getElementById('desp-vc').value=e.vc||'';document.getElementById('desp-ndoc').value=e.ndoc||'';document.getElementById('desp-st').value=e.st||'pendente';const de=document.querySelector(`input[name="desp-doc"][value="${e.doc||'Avulso'}"]`);if(de)de.checked=true;document.getElementById('m-desp').classList.add('op');});}
function delDesp(id){reqSenha(()=>{if(!confirm('Excluir despesa?'))return;auditarExclusao('despesas','Despesa excluída');D.despesas=D.despesas.filter(x=>x.id!==id);sv();rdDesp();rdFin();toast('Excluída.');});}
function advDesp(id){const d=D.despesas.find(x=>x.id===id);if(!d)return;d.st=d.st==='pago'?'pendente':'pago';sv();rdDesp();rdFin();}
function pagarNf(id){const n=D.nfs.find(x=>x.id===id);if(!n)return;n.st='pago';sv();rdNf();rdFin();toast('NF marcada como paga.');}

