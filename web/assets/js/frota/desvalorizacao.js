// ---- DESVALORIZAÇÃO DO BEM (por idade desde a aquisição) ----
function valorDesvalorizado(vaql, dataAql, pct12, pct35){
  vaql=parseFloat(vaql)||0;
  pct12=parseFloat(pct12)||0;
  pct35=parseFloat(pct35)||0;
  if(!vaql||!dataAql) return vaql;
  // Idade em anos desde a aquisição
  const aql=new Date(dataAql+'T12:00');
  const hoje=new Date();
  let anos=(hoje-aql)/(1000*60*60*24*365.25);
  if(anos<0)anos=0;
  // Percentual TOTAL do período em que o bem se encontra (linear sobre valor de compra):
  //  até 2 anos completos  -> aplica % do período Ano 1-2
  //  3 anos em diante       -> aplica % do período Ano 3-5
  const pct = anos < 2 ? pct12 : pct35;
  const valor = vaql * (1 - Math.min(pct,95)/100);
  return Math.max(0, Math.round(valor*100)/100);
}
function periodoDesval(dataAql){
  if(!dataAql) return '-';
  const anos=(new Date()-new Date(dataAql+'T12:00'))/(1000*60*60*24*365.25);
  if(anos<0) return '-';
  return anos < 2 ? 'Ano 1-2' : 'Ano 3-5';
}
function calcDesvalEq(){
  const vaql=document.getElementById('eq-vaql')?document.getElementById('eq-vaql').value:0;
  const daql=document.getElementById('eq-daql')?document.getElementById('eq-daql').value:'';
  const t12=document.getElementById('eq-desval12')?document.getElementById('eq-desval12').value:0;
  const t35=document.getElementById('eq-desval35')?document.getElementById('eq-desval35').value:0;
  const calc=valorDesvalorizado(vaql,daql,t12,t35);
  const el=document.getElementById('eq-vl-calc');
  if(el)el.value=fmt(calc);
  const lbl=document.getElementById('eq-periodo-lbl');
  if(lbl)lbl.textContent=daql?'('+periodoDesval(daql)+')':'';
}


