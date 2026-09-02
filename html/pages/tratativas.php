<div class="page" id="pg-tratativas">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Combinados, acordos e notas — registre o que ficou tratado, com quem e o prazo de pagamento</span><button class="btn bp" onclick="openNovaTratativa()">+ Nova Tratativa</button></div>
<div class="krow c3">
<div class="kpi yw"><div class="klbl">Pendentes</div><div class="kval" id="trat-pend">0</div><div class="ksub">a resolver</div></div>
<div class="kpi gn"><div class="klbl">Resolvidas</div><div class="kval" id="trat-resolv">0</div><div class="ksub">concluídas</div></div>
<div class="kpi cy"><div class="klbl">Total</div><div class="kval" id="trat-total">0</div><div class="ksub">tratativas</div></div>
</div>
<div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'trat-tb')" placeholder="🔍 Buscar por pessoa, placa, nota..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search"/></div>
<div class="panel"><div class="tw"><table><thead><tr><th>Data</th><th>Veículo</th><th>Com quem</th><th>Tratativa</th><th>Prazo / Pagamento</th><th>Status</th><th></th></tr></thead><tbody id="trat-tb"></tbody></table></div></div>
</div>
