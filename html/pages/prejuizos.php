<div class="page" id="pg-prejuizos">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Prejuízos — medições, vendas e contas marcadas como ATRASADO. Use "Retornar" se o cliente regularizar.</span></div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'prej-tb')" placeholder="🔍 Buscar por cliente, placa..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">⚠️ Prejuízos Operacionais</div>
        </div>
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Origem</th>
                        <th>Valor</th>
                        <th>Venc. Original</th>
                        <th>Placa</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="prej-tb"></tbody>
            </table>
        </div>
        <div style="margin-top:12px;padding:14px;background:var(--rg);border-radius:8px;display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;color:var(--mt)">Este valor entra como NEGATIVO (−) no Resultado Geral da empresa</span>
            <div><span style="font-size:12px;color:var(--mt)">Total Prejuízo: </span>
                <span id="prej-total" style="font-size:22px;font-weight:700;color:var(--red)">R$ 0,00</span>
            </div>
        </div>
    </div>
</div>