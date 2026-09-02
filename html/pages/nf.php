<div class="page" id="pg-nf">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Notas Fiscais de Entrada — Contas a Pagar</span>
        <div style="display:flex;gap:6px;"><button class="btn bg btn-sm" onclick="openM('m-xml')">📎 Colar XML</button><button class="btn bp" onclick="openM('m-nf')">+ NF Manual</button></div>
    </div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'nf-tb')" placeholder="🔍 Buscar por número, fornecedor..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div class="panel">
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Nº NF</th>
                        <th>Fornecedor</th>
                        <th>Data</th>
                        <th>Itens</th>
                        <th>Valor</th>
                        <th>Vencimento</th>
                        <th>Status C.Pagar</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="nf-tb"></tbody>
            </table>
        </div>
    </div>
</div>