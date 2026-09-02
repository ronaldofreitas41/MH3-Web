// ---- IMPORTAÇÃO DA FROTA (planilha FROTA_MH3 08/06) ----
const FROTA_PLANILHA = [{"pl":"","placa":"","mk":"JHON DEERE RETROESCAVADEIRA","mo":"310L 4X4","an":"2020","ch":"","rv":"","crv":"","st":"disponivel","cond":"usado"},{"pl":"GXM-9I74","placa":"GXM-9I74","mk":"MERCEDES-BENZ","mo":"MB 2423","an":"2006/2006","ch":"9BM6933866B483162","rv":"889027706","crv":"254257761601","st":"disponivel","cond":"usado"},{"pl":"RMK-2F99","placa":"RMK-2F99","mk":"MERCEDES-BENZ","mo":"MB 3131","an":"2020/2021","ch":"9BM958264MB199906","rv":"1252809651","crv":"213030383148","st":"disponivel","cond":"usado"},{"pl":"RMO-0I33","placa":"RMO-0I33","mk":"MERCEDES-BENZ","mo":"MB 3131","an":"2021/2021","ch":"9BM958264MB205486","rv":"1256148072","crv":"213053972700","st":"disponivel","cond":"usado"},{"pl":"RNA-5H20","placa":"RNA-5H20","mk":"VOLKSWAGEN","mo":"VW 26.260","an":"2021/2022","ch":"9536K8264NR014468","rv":"1263671397","crv":"233666003648","st":"disponivel","cond":"usado"},{"pl":"RNC-1F80","placa":"RNC-1F80","mk":"VOLKSWAGEN","mo":"VW 26.260 - ING","an":"2021/2022","ch":"9536K8268NR014957","rv":"1264226192","crv":"213124239237","st":"disponivel","cond":"usado"},{"pl":"RNA-6E40","placa":"RNA-6E40","mk":"VOLKSWAGEN","mo":"VW 26.260 - PIPA","an":"2021/2022","ch":"9536K8263NR014512","rv":"1263813620","crv":"244183489016","st":"disponivel","cond":"usado"},{"pl":"PUT-3C49","placa":"PUT-3C49","mk":"MERCEDES-BENZ","mo":"MB 1719","an":"2014/2014","ch":"9BM693186EB962227","rv":"1019836927","crv":"254387969156","st":"disponivel","cond":"usado"},{"pl":"RNX-4A99","placa":"RNX-4A99","mk":"VOLKSWAGEN","mo":"VW 26.260  - Madal","an":"2021/2022","ch":"9536K826XNR017200","rv":"1277452587","crv":"213244539165","st":"disponivel","cond":"usado"},{"pl":"RTE-0A82","placa":"RTE-0A82","mk":"MERCEDES-BENZ","mo":"MB 815 - ACELO","an":"2021/2022","ch":"9BM979026NB242532","rv":"1281579472","crv":"264706381363","st":"disponivel","cond":"usado"},{"pl":"RTE-0A83","placa":"RTE-0A83","mk":"MERCEDES-BENZ","mo":"MB 815 - ACELO","an":"2021/2022","ch":"9BM979026NB244740","rv":"1281590972","crv":"264706417678","st":"disponivel","cond":"usado"},{"pl":"RTF-4B17","placa":"RTF-4B17","mk":"MERCEDES-BENZ","mo":"MB 815 - ACELO","an":"2021/2022","ch":"9BM979026NB244620","rv":"1282362965","crv":"213289201848","st":"disponivel","cond":"usado"},{"pl":"GHS-3E07","placa":"GHS-3E07","mk":"VOLKSWAGEN","mo":"VW 11.180","an":"2021/2022","ch":"9535V6TB3NR035623","rv":"1290117427","crv":"243977619063","st":"disponivel","cond":"usado"},{"pl":"RUK-6F81","placa":"RUK-6F81","mk":"MERCEDES-BENZ","mo":"MB 1016","an":"2022/2022","ch":"9BM951104NB289382","rv":"1320221669","crv":"243964017280","st":"disponivel","cond":"usado"},{"pl":"RUW-9H26","placa":"RUW-9H26","mk":"MERCEDES-BENZ","mo":"MB 2730","an":"2022/2022","ch":"9BM958174NB283413","rv":"1318776080","crv":"223509417674","st":"disponivel","cond":"usado"},{"pl":"RUZ-2E12","placa":"RUZ-2E12","mk":"MERCEDES-BENZ","mo":"MB 3131","an":"2022/2022","ch":"9BM958264NB286743","rv":"1319501238","crv":"223516984864","st":"disponivel","cond":"usado"},{"pl":"RVG-0D57","placa":"RVG-0D57","mk":"MERCEDES-BENZ","mo":"MB 3131","an":"2022/2022","ch":"9BM958264NB288173","rv":"1324252364","crv":"223552745220","st":"disponivel","cond":"usado"},{"pl":"RVT-9F89","placa":"RVT-9F89","mk":"VOLKSWAGEN","mo":"WV 26.280","an":"2022/2023","ch":"953658264PR031037","rv":"1328196698","crv":"223600296507","st":"disponivel","cond":"usado"},{"pl":"RVV-2I71","placa":"RVV-2I71","mk":"VOLKSWAGEN","mo":"VW 17.190 - COMBOIO","an":"2022/2023","ch":"9536E823XPR038533","rv":"1331385706","crv":"223606608527","st":"disponivel","cond":"usado"},{"pl":"SDZ-6I86","placa":"SDZ-6I86","mk":"VOLVO","mo":"VOLVO AIZ","an":"2022/2022","ch":"93KK0R1DXNE186037","rv":"1327198280","crv":"233625452758","st":"disponivel","cond":"usado"},{"pl":"SHH-3J32","placa":"SHH-3J32","mk":"MERCEDES-BENZ","mo":"MB 3131  (Cardiesel)","an":"2022/2023","ch":"9BM958264PB304958","rv":"1341166080","crv":"243933441374","st":"disponivel","cond":"usado"},{"pl":"SHC-4C33","placa":"SHC-4C33","mk":"MERCEDES-BENZ","mo":"MB 3131","an":"2022/2023","ch":"9BM958264PB295968","rv":"1334063890","crv":"233630273599","st":"disponivel","cond":"usado"},{"pl":"SHU-3J85","placa":"SHU-3J85","mk":"VOLKSWAGEN","mo":"VW 17.190 - COMBOIO","an":"2022/2023","ch":"9536E8236PR037587","rv":"1345862838","crv":"233715497912","st":"disponivel","cond":"usado"},{"pl":"SIA-3D79","placa":"SIA-3D79","mk":"VOLKSWAGEN","mo":"VW 17.190 - COMBOIO","an":"2022/2023","ch":"9536E8230PR037584","rv":"1349870320","crv":"233749988633","st":"disponivel","cond":"usado"},{"pl":"SJB-9E12","placa":"SJB-9E12","mk":"VOLKSWAGEN","mo":"VW 17.190 - COMB LUBSERT","an":"2022/2023","ch":"9536E8237PR038117","rv":"1367301219","crv":"233867293635","st":"disponivel","cond":"usado"},{"pl":"GLJ-1G26","placa":"GLJ-1G26","mk":"FIAT","mo":"UNO - PRATA","an":"1991/1991","ch":"9BD146000M3683291","rv":"248957643","crv":"244140437057","st":"disponivel","cond":"usado"},{"pl":"SHK-6I50","placa":"SHK-6I50","mk":"TOYOTA","mo":"SW4","an":"2023/2023","ch":"8AJBA3FS4P0333388","rv":"1343682077","crv":"244180384124","st":"disponivel","cond":"usado"},{"pl":"FIQ-7287","placa":"FIQ-7287","mk":"GM CREVROLET","mo":"MONTANA","an":"2013/2014","ch":"9BGCA80X0EB216550","rv":"593046854","crv":"254525222760","st":"disponivel","cond":"usado"},{"pl":"HFI-4415","placa":"HFI-4415","mk":"YAMAHA","mo":"MOTO YBR","an":"2008/2009","ch":"9C6KE122090011797","rv":"123759161","crv":"264595268700","st":"disponivel","cond":"usado"},{"pl":"SHX-0G62","placa":"SHX-0G62","mk":"TOYOTA","mo":"HILUX","an":"2023/2023","ch":"8AJDA3CDXP1832950","rv":"1347831859","crv":"264706417678","st":"disponivel","cond":"usado"},{"pl":"","placa":"","mk":"JHON DEERE TRATOR 4X4","mo":"5078","an":"17/17","ch":"","rv":"","crv":"","st":"disponivel","cond":"usado"}];
function abrirImportKmHr(){
  var p=document.getElementById('imp-kmhr-paste'); if(p)p.value='';
  var pv=document.getElementById('imp-kmhr-preview'); if(pv)pv.innerHTML='';
  var bt=document.getElementById('imp-kmhr-btn'); if(bt)bt.style.display='none';
  var ck=document.getElementById('imp-kmhr-km'); if(ck)ck.checked=true;
  var ch=document.getElementById('imp-kmhr-hr'); if(ch)ch.checked=true;
  window._impKmHrLinhas=[];
  if(typeof openM==='function')openM('m-imp-kmhr');
}
function processarImportKmHr(){
  var txt=(document.getElementById('imp-kmhr-paste')||{}).value||'';
  var linhas=(typeof parseCSV==='function')?parseCSV(txt):[];
  var pv=document.getElementById('imp-kmhr-preview');
  var bt=document.getElementById('imp-kmhr-btn');
  if(!linhas.length){if(typeof toast==='function')toast('Cole a planilha primeiro.','er');return;}
  var impKm=document.getElementById('imp-kmhr-km').checked;
  var impHr=document.getElementById('imp-kmhr-hr').checked;
  if(!impKm&&!impHr){if(typeof toast==='function')toast('Marque pelo menos KM ou Horímetro.','er');return;}
  var header=linhas[0].map(function(h){return (h||'').toLowerCase();});
  var idxPlaca=-1,idxKm=-1,idxHr=-1;
  header.forEach(function(h,i){
    if(idxPlaca<0&&h.indexOf('placa')>=0)idxPlaca=i;
    if(idxHr<0&&h.indexOf('hori')>=0)idxHr=i;
    if(idxKm<0&&h.indexOf('km')>=0)idxKm=i;
  });
  var temHeader=idxPlaca>=0;
  if(!temHeader){idxPlaca=0;idxKm=1;idxHr=2;}
  var soNum=function(s){return parseInt(String(s||'').replace(/\./g,'').replace(/[^0-9]/g,''))||0;};
  var dados=temHeader?linhas.slice(1):linhas;
  var np=function(p){return (typeof _normPlacaImp==='function')?_normPlacaImp(p):String(p||'').toUpperCase().replace(/[^A-Z0-9]/g,'');};
  var res=[];
  dados.forEach(function(c){
    var placaCSV=(c[idxPlaca]||'').trim();
    if(!placaCSV)return;
    var npc=np(placaCSV);
    var eq=(D.equips||[]).find(function(e){return np(e.placa||e.pl)===npc;});
    var kmNovo=(impKm&&idxKm>=0)?soNum(c[idxKm]):null;
    var hrNovo=(impHr&&idxHr>=0)?soNum(c[idxHr]):null;
    res.push({placaCSV:placaCSV,achou:!!eq,eqId:eq?eq.id:'',placaSis:eq?(eq.placa||eq.pl||''):'',
              kmAtual:eq?(eq.km||'0'):'',hrAtual:eq?(eq.hr||'0'):'',kmNovo:kmNovo,hrNovo:hrNovo});
  });
  window._impKmHrLinhas=res;
  window._impKmHrFlags={km:impKm,hr:impHr};
  var achados=res.filter(function(l){return l.achou;}).length;
  var escH=function(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');};
  if(!res.length){pv.innerHTML='<p class="empty">Nenhuma linha válida.</p>';bt.style.display='none';return;}
  var h='<div style="font-size:12px;margin-bottom:6px"><b>'+achados+'</b> de <b>'+res.length+'</b> placa(s) encontrada(s) na frota.';
  if(achados<res.length)h+=' <span style="color:var(--rd)">As não encontradas serão ignoradas.</span>';
  h+='</div>';
  h+='<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr style="background:var(--cd2)"><th style="padding:5px;text-align:left">Placa</th>';
  if(impKm)h+='<th style="padding:5px;text-align:left">KM: atual &rarr; novo</th>';
  if(impHr)h+='<th style="padding:5px;text-align:left">Horímetro: atual &rarr; novo</th>';
  h+='<th style="padding:5px;text-align:left">Situação</th></tr></thead><tbody>';
  res.forEach(function(l){
    var op=l.achou?'':'opacity:.5';
    h+='<tr style="border-bottom:1px solid var(--br);'+op+'"><td style="padding:5px">'+escH(l.placaCSV)+'</td>';
    if(impKm)h+='<td style="padding:5px">'+(l.achou?(escH(l.kmAtual||'0')+' &rarr; <b>'+escH(l.kmNovo)+'</b>'):'—')+'</td>';
    if(impHr)h+='<td style="padding:5px">'+(l.achou?(escH(l.hrAtual||'0')+' &rarr; <b>'+escH(l.hrNovo)+'</b>'):'—')+'</td>';
    h+='<td style="padding:5px">'+(l.achou?'<span style="color:var(--gr)">✓ encontrada</span>':'<span style="color:var(--rd)">✗ não cadastrada</span>')+'</td></tr>';
  });
  h+='</tbody></table>';
  pv.innerHTML=h;
  bt.style.display=achados?'':'none';
}
function confirmarImportKmHr(){
  var linhas=window._impKmHrLinhas||[];
  var flags=window._impKmHrFlags||{};
  var ok=linhas.filter(function(l){return l.achou;});
  if(!ok.length){if(typeof toast==='function')toast('Nenhuma placa bateu com a frota.','er');return;}
  var hoje=(typeof today==='function')?today():new Date().toISOString().slice(0,10);
  var n=0;
  ok.forEach(function(l){
    var eq=(D.equips||[]).find(function(e){return e.id===l.eqId;});
    if(!eq)return;
    var mudou=false;
    if(flags.km&&l.kmNovo!=null){eq.km=String(l.kmNovo);mudou=true;}
    if(flags.hr&&l.hrNovo!=null){eq.hr=String(l.hrNovo);mudou=true;}
    if(mudou){eq.kmDt=hoje;n++;}
  });
  if(typeof auditar==='function')auditar('IMPORTACAO','frota','Atualização em massa de KM/Horímetro: '+n+' veículo(s)');
  if(typeof sv==='function')sv();
  if(typeof toast==='function')toast(n+' veículo(s) atualizado(s)! Os valores antigos errados deixam de atrapalhar.','ok');
  if(typeof closeM==='function')closeM('m-imp-kmhr');
  if(typeof rdFrota==='function')rdFrota();
}

function importarFrotaPlanilha(){
  if(!confirm('Importar '+FROTA_PLANILHA.length+' veículos da planilha?\n\nVeículos com placa que já existe serão ignorados (não duplica). Os demais entram como "disponível" para você completar os dados depois.'))return;
  let add=0, pulou=0;
  FROTA_PLANILHA.forEach(v=>{
    const pl=(v.pl||'').toUpperCase().trim();
    // Evita duplicar: por placa (quando tem) ou por marca+modelo (quando sem placa)
    if(pl){
      if(D.equips.some(e=>((e.pl||e.placa||'').toUpperCase().trim())===pl)){pulou++;return;}
    } else {
      const chave=((v.mk||'')+' '+(v.mo||'')).toUpperCase().trim();
      if(D.equips.some(e=>!e.pl&&((e.mk||'')+' '+(e.mo||'')).toUpperCase().trim()===chave)){pulou++;return;}
    }
    D.equips.push({
      id:uid(),
      pl:pl, placa:pl,
      mk:v.mk||'', mo:v.mo||'', an:v.an||'',
      ch:v.ch||'', rv:v.rv||'', crv:v.crv||'',
      st:'disponivel', cond:'usado',
      ob:'Importado da planilha FROTA_MH3 08/06'
    });
    add++;
  });
  auditar('IMPORTACAO','frota','Importação da planilha: '+add+' veículos adicionados, '+pulou+' ignorados (já existiam)');
  sv();rdFrota();
  toast(add+' veículos importados! '+(pulou?pulou+' ignorados (já existiam).':''),'ok');
}

