
/* ===== AUTOCOMPLETE REUTILIZÁVEL — sugestões do banco em qualquer campo =====
   Uso: <input data-ac="email"> ou data-ac="marcaPneu" / data-ac="marcaVeiculo".
   As fontes de opções ficam em window._fontesAC. minLetras define a partir de quantas letras sugere. */
(function(){
  window._fontesAC = {
    email: function(){
      var arr=[];
      function add(e){ if(e && typeof e==='string' && e.indexOf('@')>0) arr.push(e.trim()); }
      (D.clientes||[]).forEach(function(c){ add(c.email); add(c.emailCobranca); });
      (D.contratos||[]).forEach(function(c){ add(c.email); });
      (D.funcionarios||[]).forEach(function(f){ add(f.email); });
      (D.fornecedores||[]).forEach(function(f){ add(f.email); });
      (window._emailsConhecidos||[]).forEach(add);
      return arr;
    },
    marcaPneu:    function(){ return (D.config&&D.config.marcasPneu)||[]; },
    marcaVeiculo: function(){ return (D.config&&D.config.marcasVeiculo)||[]; }
  };
  // Histórico de e-mails já enviados (fica salvo no navegador e alimenta as sugestões)
  try{ window._emailsConhecidos = JSON.parse(localStorage.getItem('mh3_emails_conhecidos')||'[]'); }catch(e){ window._emailsConhecidos=[]; }
  window.lembrarEmail = function(emails){
    if(!emails) return;
    var lista = Array.isArray(emails) ? emails : String(emails).split(/[;,]+/);
    var mudou=false;
    lista.forEach(function(e){
      e=String(e||'').trim();
      if(e && e.indexOf('@')>0 && window._emailsConhecidos.indexOf(e)<0){ window._emailsConhecidos.push(e); mudou=true; }
    });
    if(mudou){ try{ localStorage.setItem('mh3_emails_conhecidos', JSON.stringify(window._emailsConhecidos.slice(-200))); }catch(e){} }
  };
  function mh3AC(input, getOpcoes, minL, multi){
    if(!input || input._acReady) return; input._acReady=true;
    input.setAttribute('autocomplete','off');
    var box=document.createElement('div');
    box.style.cssText='position:absolute;z-index:99999;background:var(--cd,#fff);border:1px solid var(--br,#ccc);border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.20);max-height:230px;overflow-y:auto;display:none;font-size:13px;color:var(--tx,#222)';
    document.body.appendChild(box);
    function fechar(){ box.style.display='none'; }
    function parte(){
      var v=input.value||'';
      if(!multi) return { termo:v.trim(), antes:'' };
      var i=Math.max(v.lastIndexOf(','), v.lastIndexOf(';'));
      var ult=(i>=0)? v.slice(i+1) : v;
      var antes=(i>=0)? v.slice(0,i+1)+' ' : '';
      return { termo:ult.trim(), antes:antes };
    }
    function abrir(){
      var pa=parte(); var termo=pa.termo.toLowerCase();
      if(termo.length<minL){ fechar(); return; }
      var ops=(getOpcoes()||[]).filter(function(o){ return String(o).toLowerCase().indexOf(termo)>=0; });
      var vistos={}; ops=ops.filter(function(o){ var k=String(o).toLowerCase(); if(vistos[k])return false; vistos[k]=1; return true; });
      // não sugerir se já está exatamente igual
      ops=ops.filter(function(o){ return String(o).toLowerCase()!==termo; });
      if(!ops.length){ fechar(); return; }
      box.innerHTML='';
      ops.slice(0,8).forEach(function(o){
        var item=document.createElement('div');
        item.style.cssText='padding:9px 12px;cursor:pointer;border-bottom:1px solid var(--br,#eee)';
        item.textContent=o;
        item.onmouseenter=function(){ item.style.background='var(--cd2,#f0f0f0)'; };
        item.onmouseleave=function(){ item.style.background=''; };
        item.onmousedown=function(ev){ ev.preventDefault(); input.value = multi ? (pa.antes+o+', ') : o; fechar(); input.dispatchEvent(new Event('input',{bubbles:true})); input.dispatchEvent(new Event('change',{bubbles:true})); try{input.focus();}catch(e){} };
        box.appendChild(item);
      });
      var r=input.getBoundingClientRect();
      box.style.left=(r.left+window.scrollX)+'px';
      box.style.top=(r.bottom+window.scrollY+2)+'px';
      box.style.minWidth=r.width+'px';
      box.style.display='block';
    }
    input.addEventListener('input', abrir);
    input.addEventListener('focus', abrir);
    input.addEventListener('blur', function(){ setTimeout(fechar,160); });
    input.addEventListener('keydown', function(e){ if(e.key==='Escape')fechar(); });
  }
  window.mh3AC=mh3AC;
  window.initAutocompletes=function(){
    document.querySelectorAll('[data-ac]').forEach(function(inp){
      var f=inp.getAttribute('data-ac');
      if(window._fontesAC[f]) mh3AC(inp, window._fontesAC[f], f==='email'?2:1, f==='email');
    });
  };
  window.addEventListener('load', function(){ setTimeout(function(){
    try{
      if(D.config && !D.config.marcasPneu)    D.config.marcasPneu=['Bridgestone','Continental','Firestone','Goodyear','Michelin','Pirelli'];
      if(D.config && !D.config.marcasVeiculo) D.config.marcasVeiculo=['DAF','Ford','Iveco','MAN','Mercedes-Benz','Scania','Volkswagen','Volvo'];
    }catch(e){}
    window.initAutocompletes();
  }, 1500); });
})();

