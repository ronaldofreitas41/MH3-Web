<div class="page" id="pg-fluxo">
<div class="panel" style="margin-bottom:12px">
<div class="ph"><div class="pt">🏦 Contas Bancárias MH3</div>
<button class="btn bp btn-sm" onclick="openContaBanco()" title="Cadastrar conta bancária">+ Conta</button>
</div>
<div class="pb">
<div id="contas-banco-lista"></div>
<div style="margin-top:10px;padding:10px;background:var(--rg);border-radius:8px;display:flex;justify-content:space-between">
<span style="font-size:12px;color:var(--mt)">Saldo Total (contas + poupança/aplicação):</span>
<span id="saldo-total-banco" style="font-size:18px;font-weight:700;color:var(--gn)">R$ 0,00</span>
</div>
</div>
</div>
<div class="shdr"><span style="color:var(--mt);font-size:11px">Fluxo de caixa — entradas e saídas</span><div style="display:flex;gap:6px;align-items:center;"><select id="fluxo-mes" onchange="rdFluxo()" style="width:auto"></select><button class="btn bg btn-sm" onclick="window.print()">🖨</button></div></div>
<div class="krow c4"><div class="kpi gn"><div class="klbl">Entradas do Mês</div><div class="kval" id="fl-ent">R$0</div></div><div class="kpi rd"><div class="klbl">Saídas do Mês</div><div class="kval" id="fl-sai">R$0</div></div><div class="kpi bl"><div class="klbl">Saldo do Mês</div><div class="kval" id="fl-sal">R$0</div></div><div class="kpi or"><div class="klbl">Saldo Acumulado</div><div class="kval" id="fl-acu">R$0</div></div></div>
<div class="g2">
<div class="panel"><div class="ph"><div class="pt">📈 Entradas</div></div><div class="pb" id="fl-ent-list"></div></div>
<div class="panel"><div class="ph"><div class="pt">📉 Saídas</div></div><div class="pb" id="fl-sai-list"></div></div>
</div>
<div class="panel"><div class="ph"><div class="pt">📊 Gráfico Mensal</div></div><div class="pb"><div class="chart-bar-wrap" id="fl-chart"></div></div></div>
</div>
