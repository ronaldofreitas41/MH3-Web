// ---- FUNCIONÁRIOS ----
let funcFotos=[], funcArqs=[];
function rdFunc(){
  const tb=document.getElementById('func-tb');
  if(!tb) return;
  const fs=D.funcionarios||[];
  tb.innerHTML=fs.length?fs.map(f=>`<tr>
    <td><b>${f.nome}</b></td>
    <td style="font-size:11px">${f.cpf||'-'}</td>
    <td style="font-size:11px">${f.cnh||'-'}${f.cnhVal&&dTo(f.cnhVal)<0?' ⚠️':''}</td>
    <td style="font-size:11px">${f.tel||'-'}</td>
    <td>${f.salario?fmt(f.salario):'-'}</td>
    <td style="display:flex;gap:4px">
      <button class="btn bg btn-xs" onclick="editFunc('${f.id}')" title="Editar">✏️</button>
      <button class="btn bd btn-xs" onclick="delFunc('${f.id}')" title="Excluir">×</button>
    </td>
  </tr>`).join(''):'<tr><td colspan="6" class="empty">Nenhum funcionário cadastrado</td></tr>';
}
function openFunc(){
  document.getElementById('func-eid').value='';
  ['func-nome','func-cpf','func-rg','func-cnh','func-cnh-val','func-end','func-tel','func-nasc','func-emerg-nome','func-emerg-tel','func-obs','func-ctps','func-pis','func-cargo','func-admissao','func-salario','func-beneficio','func-seg-valor','func-seg-vig','func-seg-seguradora'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  funcFotos=[];funcArqs=[];
  renderFuncFotos();renderFuncArqs();
  document.querySelector('#m-func .mt2').textContent='👷 Novo Funcionário';
  openM('m-func');
}
function saveFunc(){
  const nome=document.getElementById('func-nome').value.trim();
  const cpf=document.getElementById('func-cpf').value.trim();
  if(!nome){toast('Informe o nome','er');return;}
  if(!cpf){toast('Informe o CPF','er');return;}
  const eid=document.getElementById('func-eid').value;
  const data={
    nome,cpf,rg:document.getElementById('func-rg').value,
    cnh:document.getElementById('func-cnh').value,cnhVal:document.getElementById('func-cnh-val').value,
    end:document.getElementById('func-end').value,tel:document.getElementById('func-tel').value,
    nasc:document.getElementById('func-nasc').value,
    emergNome:document.getElementById('func-emerg-nome').value,emergTel:document.getElementById('func-emerg-tel').value,
    obs:document.getElementById('func-obs').value,
    ctps:document.getElementById('func-ctps').value,pis:document.getElementById('func-pis').value,
    cargo:document.getElementById('func-cargo').value,admissao:document.getElementById('func-admissao').value,
    salario:document.getElementById('func-salario').value,beneficio:document.getElementById('func-beneficio').value,
    segValor:document.getElementById('func-seg-valor').value,segVig:document.getElementById('func-seg-vig').value,
    segSeguradora:document.getElementById('func-seg-seguradora').value,
    fotos:[...funcFotos],arqs:[...funcArqs]
  };
  if(eid){const idx=D.funcionarios.findIndex(f=>f.id===eid);if(idx>-1)D.funcionarios[idx]={...D.funcionarios[idx],...data};toast('Funcionário atualizado!','ok');}
  else{data.id=uid();D.funcionarios.push(data);toast('Funcionário cadastrado!','ok');}
  sv();closeM('m-func');rdFunc();
}
function editFunc(id){if(_bloqEditar('func'))return;
  const f=D.funcionarios.find(x=>x.id===id);
  if(!f) return;
  openFunc();
  document.getElementById('func-eid').value=id;
  const set=(i,v)=>{const el=document.getElementById(i);if(el)el.value=v||'';};
  set('func-nome',f.nome);set('func-cpf',f.cpf);set('func-rg',f.rg);set('func-cnh',f.cnh);
  set('func-cnh-val',f.cnhVal);set('func-end',f.end);set('func-tel',f.tel);set('func-nasc',f.nasc);
  set('func-emerg-nome',f.emergNome);set('func-emerg-tel',f.emergTel);set('func-obs',f.obs);
  set('func-ctps',f.ctps);set('func-pis',f.pis);set('func-cargo',f.cargo);set('func-admissao',f.admissao);
  set('func-salario',f.salario);set('func-beneficio',f.beneficio);set('func-seg-valor',f.segValor);
  set('func-seg-vig',f.segVig);set('func-seg-seguradora',f.segSeguradora);
  funcFotos=f.fotos?[...f.fotos]:[];funcArqs=f.arqs?[...f.arqs]:[];
  renderFuncFotos();renderFuncArqs();
  document.querySelector('#m-func .mt2').textContent='👷 Editar: '+f.nome;
}
function delFunc(id){
  reqSenha(()=>{
    if(!confirm('Excluir este funcionário?'))return;
    var _f=(D.funcionarios||[]).find(f=>f.id===id);
    D.funcionarios=D.funcionarios.filter(f=>f.id!==id);
    if(typeof auditarExclusao==='function')auditarExclusao('funcionarios','Excluiu funcionário: '+((_f&&(_f.nome||_f.nm))||id));
    sv();rdFunc();toast('Funcionário excluído','ok');
  });
}
function addFuncFoto(inp){
  Array.from(inp.files).forEach(file=>{
    const r=new FileReader();
    r.onload=e=>{funcFotos.push(e.target.result);renderFuncFotos();};
    r.readAsDataURL(file);
  });
}
function renderFuncFotos(){
  const grid=document.getElementById('func-foto-grid');
  if(!grid)return;
  const add=grid.querySelector('label');
  grid.querySelectorAll('img').forEach(i=>i.remove());
  funcFotos.forEach((src,i)=>{
    const img=document.createElement('img');img.src=src;
    img.style.cssText='width:60px;height:60px;object-fit:cover;border-radius:4px;cursor:pointer';
    img.onclick=()=>{if(confirm('Remover foto?')){funcFotos.splice(i,1);renderFuncFotos();}};
    grid.insertBefore(img,add);
  });
}
function addFuncArq(inp){
  Array.from(inp.files).forEach(file=>{
    const r=new FileReader();
    r.onload=e=>{funcArqs.push({nome:file.name,data:e.target.result});renderFuncArqs();};
    r.readAsDataURL(file);
  });
}
function renderFuncArqs(){
  const el=document.getElementById('func-arq-list');
  if(!el)return;
  el.innerHTML=funcArqs.map((a,i)=>`<div style="display:flex;justify-content:space-between;padding:6px;background:var(--cd2);border-radius:5px;margin-bottom:4px;font-size:12px"><span>📄 ${a.nome}</span><button class="btn bd btn-xs" onclick="funcArqs.splice(${i},1);renderFuncArqs()">×</button></div>`).join('');
}


