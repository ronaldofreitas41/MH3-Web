<div class="page" id="pg-contratos">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Contratos de locação</span><button class="btn bp" onclick="popClientesCt();openM('m-ct')" title="Novo contrato">+ Contrato</button></div>
<div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'ct-tb')" placeholder="🔍 Buscar por cliente, placa..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search"/></div>
<div class="panel"><div class="tw"><table><thead><tr><th>Cliente</th><th>Equip.</th><th>Turno/H</th><th>H.Extra/h</th><th>Valor/Mês</th><th>Início</th><th>Ciclo</th><th>Assinatura</th><th>Status</th><th></th></tr></thead><tbody id="ct-tb"></tbody></table></div></div>
</div>
