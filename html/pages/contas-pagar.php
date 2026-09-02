<div class="page" id="pg-contas_pagar">
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'cp2-tb')" placeholder="🔍 Buscar por cliente, placa, fornecedor, descrição..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div id="fv-cp-bar"></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">💸 Contas a Pagar</div><button class="btn bw btn-sm no-print" onclick="abrirImportacao('contas_pagar')" style="margin-left:auto" title="Importar planilha CSV">📥 Importar</button><button class="btn bd btn-sm no-print" onclick="limparModulo('contas_pagar')" title="Apagar TODOS os dados desta aba (somente admin)">🗑 Limpar Tudo</button>
        </div>
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Fornecedor</th>
                        <th>Vencimento</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody id="cp2-tb"></tbody>
            </table>
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--rg);border-radius:8px;text-align:right">
            <span style="font-size:12px;color:var(--mt)">Total Pendente: </span>
            <span id="cp2-total" style="font-size:20px;font-weight:700;color:var(--or)">R$ 0,00</span>
        </div>
    </div>
</div>