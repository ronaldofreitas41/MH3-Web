<div class="page" id="pg-contas_receber">
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'cr2-tb')" placeholder="🔍 Buscar por cliente, placa..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div id="fv-cr-bar"></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">💵 Contas a Receber</div><button class="btn bw btn-sm no-print" onclick="abrirImportacao('contas_receber')" style="margin-left:auto" title="Importar planilha CSV">📥 Importar</button><button class="btn bd btn-sm no-print" onclick="limparModulo('contas_receber')" title="Apagar TODOS os dados desta aba (somente admin)">🗑 Limpar Tudo</button>
        </div>
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Cliente</th>
                        <th>Origem</th>
                        <th>Valor</th>
                        <th>Venc.</th>
                        <th>Placa</th>
                        <th>Situação</th>
                    </tr>
                </thead>
                <tbody id="cr2-tb"></tbody>
            </table>
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--gg);border-radius:8px;text-align:right">
            <span style="font-size:12px;color:var(--mt)">Total a Receber: </span>
            <span id="cr2-total" style="font-size:20px;font-weight:700;color:var(--gn)">R$ 0,00</span>
        </div>
    </div>
</div>