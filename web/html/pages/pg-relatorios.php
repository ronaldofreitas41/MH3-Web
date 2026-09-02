<div class="page" id="pg-relatorios">
<div class="panel" style="margin-bottom:12px">
<div class="ph"><div class="pt">📅 Relatório Analítico por Período</div></div>
<div class="pb">
<div class="fr">
<div class="fg"><label>De</label><input id="relp-de" type="date"/></div>
<div class="fg"><label>Até</label><input id="relp-ate" type="date"/></div>
<div class="fg"><label>Tipo</label>
<select id="relp-tipo">
<option value="tudo">Tudo (receber + pagar)</option>
<option value="receber">Somente A Receber</option>
<option value="pagar">Somente A Pagar</option>
</select>
</div>
<div class="fg" style="display:flex;align-items:flex-end;gap:6px">
<button class="btn bp btn-sm" onclick="gerarRelPeriodo()" title="Gerar relatório do período">Gerar</button>
<button class="btn bw btn-sm" onclick="imprimirRelPeriodo()" title="Imprimir relatório do período">🖨</button>
</div>
</div>
<div id="relp-resultado" style="margin-top:10px"></div>
</div>
</div>
<div class="panel" style="margin-bottom:12px">
<div class="ph"><div class="pt">📊 Relatórios Gerenciais</div>
<div style="display:flex;gap:8px">
<button class="btn bp btn-sm" onclick="gerarRelGerencial()" title="Gerar relatório selecionado">Gerar</button>
<button class="btn bw btn-sm" onclick="imprimirRelGerencial()" title="Imprimir relatório">🖨</button>
</div>
</div>
<div class="pb">
<div class="fr">
<div class="fg"><label>Tipo de Relatório</label>
<select id="relg-tipo"><option value="">Carregando relatórios...</option></select>
</div>
<div class="fg"><label>De (opcional)</label><input id="relg-de" type="date"/></div>
<div class="fg"><label>Até (opcional)</label><input id="relg-ate" type="date"/></div>
</div>
<div id="relg-resultado" style="margin-top:10px"><p style="font-size:12px;color:var(--mt)">Escolha o tipo e clique em Gerar.</p></div>
</div>
</div>
<div class="panel" style="margin-bottom:12px">
<div class="ph"><div class="pt">🚛 Relatório Patrimonial da Frota (Analítico)</div>
<div style="display:flex;gap:8px">
<button class="btn bp btn-sm" onclick="gerarRelFrota()" title="Gerar relatório de todos os veículos/equipamentos">Gerar</button>
<button class="btn bw btn-sm" onclick="imprimirRelFrota()" title="Imprimir relatório patrimonial">🖨</button>
</div>
</div>
<div class="pb"><div id="relf-resultado"><p style="font-size:12px;color:var(--mt)">Clique em Gerar para ver todos os veículos/equipamentos com data de levantamento, valor de quitação, valor atualizado e parcelas que faltam.</p></div></div>
</div>
<!-- BARRA DE CONTROLES GLOBAL -->
<div style="background:var(--cd);border:1px solid var(--br);border-radius:8px;padding:12px 16px;margin-bottom:14px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
<div style="display:flex;flex-direction:column;gap:2px"><label style="font-size:9px">Período</label><select id="rel-periodo" onchange="rdRelAtivo()" style="width:auto"><option value="mes">Este mês</option><option value="trim">Último trimestre</option><option value="ano">Este ano</option><option value="tudo">Todo o período</option></select></div>
<div style="display:flex;flex-direction:column;gap:2px"><label style="font-size:9px">Detalhamento</label>
<div style="display:flex;gap:0;border:1px solid var(--br);border-radius:5px;overflow:hidden">
<button class="btn bp btn-sm" id="gn-res" onclick="setGran('resumido')" style="border-radius:0;border:none">Resumido</button>
<button class="btn bg btn-sm" id="gn-det" onclick="setGran('detalhado')" style="border-radius:0;border:none;border-left:1px solid var(--br)">Detalhado</button>
<button class="btn bg btn-sm" id="gn-ana" onclick="setGran('analitico')" style="border-radius:0;border:none;border-left:1px solid var(--br)">Analítico</button>
</div>
</div>
<div style="flex:1;min-width:120px;display:flex;flex-direction:column;gap:2px"><label style="font-size:9px">Buscar / Filtrar</label><input id="rel-busca" oninput="rdRelAtivo()" placeholder="🔍 Cliente, placa, categoria..." style="width:100%"/></div>
<button class="btn bg btn-sm" onclick="window.print()">🖨 Imprimir</button>
<button class="btn bp btn-sm" onclick="exportRelCSV()">⬇ CSV</button>
</div>
<!-- TABS DE RELATÓRIOS -->
<div class="tabs" id="rel-tabs-bar">
<div class="tab on" onclick="relTab(this,'tr-fin')">💰 Financeiro</div>
<div class="tab" onclick="relTab(this,'tr-receitas')">📈 Receitas</div>
<div class="tab" onclick="relTab(this,'tr-desp')">📉 Despesas</div>
<div class="tab" onclick="relTab(this,'tr-frota')">🚛 Frota</div>
<div class="tab" onclick="relTab(this,'tr-cli')">👥 Clientes</div>
<div class="tab" onclick="relTab(this,'tr-estq')">📦 Estoque</div>
<div class="tab" onclick="relTab(this,'tr-manut')">🔧 OS</div>
<div class="tab" onclick="relTab(this,'tr-contratos')">📋 Contratos</div>
<div class="tab" onclick="relTab(this,'tr-fluxo2')">📊 Fluxo Caixa</div>
<div class="tab" onclick="relTab(this,'tr-cpagar')">💸 Contas a Pagar</div>
<div class="tab" onclick="relTab(this,'tr-creceber')">💵 Contas a Receber</div>
<div class="tab" onclick="relTab(this,'tr-resplaca')">📈 Resultado/Placa</div>
<div class="tab" onclick="relTab(this,'tr-resgeral')">📊 Resultado Geral</div>
</div>
<div class="tab-p on" id="tr-fin"><div id="rel-fin"></div></div>
<div class="tab-p" id="tf-prej" style="margin-top:1px">
<div class="panel">
<div class="ph">
<div class="pt">⚠️ Prejuízos Operacionais (Medições Atrasadas)</div>
</div>
<div class="tw"><table>
<thead><tr><th>Cliente</th><th>Período</th><th>Total</th><th>Venc.</th><th>Placa</th><th>Situação</th></tr></thead>
<tbody id="fin-prej-tb"></tbody>
</table></div>
<div style="margin-top:12px;padding:12px;background:var(--rg);border-radius:8px;text-align:right">
<span style="font-size:12px;color:var(--mt)">Total Prejuízo: </span>
<span id="fin-prej-total" style="font-size:20px;font-weight:700;color:var(--red)">R$ 0,00</span>
</div>
</div>
</div><div class="tab-p" id="tr-receitas"><div id="rel-receitas"></div></div>
<div class="tab-p" id="tr-desp"><div id="rel-desp"></div></div>
<div class="tab-p" id="tr-frota"><div id="rel-frota-c"></div></div>
<div class="tab-p" id="tr-cli"><div id="rel-cli"></div></div>
<div class="tab-p" id="tr-estq"><div id="rel-estq-c"></div></div>
<div class="tab-p" id="tr-manut"><div id="rel-manut-c"></div></div>
<div class="tab-p" id="tr-contratos"><div id="rel-contratos-c"></div></div>
<div class="tab-p" id="tr-fluxo2"><div id="rel-fluxo2-c"></div></div>
<div class="tab-p" id="tr-cpagar"><div id="rel-cpagar-c"></div></div>
<div class="tab-p" id="tr-creceber"><div id="rel-creceber-c"></div></div>
<div class="tab-p" id="tr-resplaca"><div id="rel-resplaca-c"></div></div>
<div class="tab-p" id="tr-resgeral"><div id="rel-resgeral-c"></div></div>
</div>
