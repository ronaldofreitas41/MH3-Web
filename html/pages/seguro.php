<div class="page" id="pg-seguro">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Apólices de seguro e vencimentos por placa</span><div style="display:flex;gap:5px"><button class="btn bp" onclick="openSeguro()">+ Apólice</button><button class="btn bg btn-sm no-print" onclick="imprimirSeguro()" title="Imprimir / Salvar PDF">🖨 Relatório</button><button class="btn bg btn-sm" onclick="rdSeguro()">🔄 Atualizar</button></div></div>
<div class="panel" id="seg-alertas" style="display:none;border-left:4px solid #C8102E;background:rgba(200,16,46,.06);padding:10px 14px;margin-bottom:10px;font-size:12px;color:var(--tx)"></div>
<div class="panel" style="margin-bottom:10px"><div class="ph"><div class="pt">⚠️ Veículos sem seguro</div></div><div class="pb" id="seg-semseguro" style="padding:10px 14px"></div></div>
<div class="panel"><div class="tw"><table><thead><tr><th>Seguradora</th><th>Apólice</th><th>Vigência / Vencimento</th><th>Valor</th><th>Placas cobertas</th><th></th></tr></thead><tbody id="seg-tb"></tbody></table></div></div>
</div>
