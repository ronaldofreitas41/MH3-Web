<div class="page" id="pg-saida_material">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Saída de material do Almoxarifado — nota mensal (abre dia 1º, fecha no último dia do mês)</span></div>
<div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'sm-tb')" placeholder="🔍 Buscar por produto..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search"/></div>
<div class="panel">
<div class="ph"><div class="pt">📤 Lançar Saída de Material</div></div>
<div class="pb">
<div class="fr">
<div class="fg"><label>Produto (categoria Almoxarifado) *</label>
<select id="sm-prod"><option value="">Selecionar produto...</option></select>
</div>
<div class="fg"><label>Quantidade *</label><input id="sm-qtd" min="0.01" placeholder="1" step="0.01" type="number"/></div>
<div class="fg"><label>Data</label><input id="sm-dt" type="date"/></div>
<div class="fg" style="display:flex;align-items:flex-end">
<button class="btn bp btn-sm" onclick="addSaidaMaterial()" title="Lançar saída">+ Lançar</button>
</div>
</div>
<p style="font-size:11px;color:var(--mt)">O mesmo produto pode ser lançado várias vezes no mês (hoje 1 fita, amanhã +3...)</p>
</div>
</div>
<div class="panel">
<div class="ph"><div class="pt">📋 Nota do Mês</div>
<div style="display:flex;gap:8px;align-items:center">
<input id="sm-mes" onchange="rdSaidaMaterial()" style="padding:6px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx)" type="month"/>
<button class="btn bb btn-sm" onclick="verNotaMes()" title="Ver nota detalhada do mês">🔍 Ver Nota</button>
<button class="btn bw btn-sm" onclick="imprimirNotaMes()" title="Imprimir nota do mês selecionado">🖨 Imprimir</button>
<button class="btn bd btn-sm" onclick="fecharNotaMes()" title="Fechar a nota: lança o total como despesa nos resultados">🔒 Fechar Mês</button>
</div>
</div>
<div class="tw"><table>
<thead><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Valor Unit.</th><th>Total</th><th></th></tr></thead>
<tbody id="sm-tb"></tbody>
</table></div>
<div style="margin-top:12px;padding:12px;background:var(--rg);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
<span id="sm-status" style="font-size:12px;color:var(--mt)"></span>
<div><span style="font-size:12px;color:var(--mt)">Total do Mês: </span>
<span id="sm-total" style="font-size:20px;font-weight:700;color:var(--or)">R$ 0,00</span></div>
</div>
</div>
</div>
