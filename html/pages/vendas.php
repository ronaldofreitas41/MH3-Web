<div class="page" id="pg-vendas">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Venda de peças e serviços para cliente final</span><button class="btn bp" onclick="popClientesVenda();openM('m-venda')">+ Nova Venda</button></div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'venda-tb')" placeholder="🔍 Buscar por cliente, VD..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div class="krow c3">
        <div class="kpi gn">
            <div class="klbl">Receita Vendas</div>
            <div class="kval" id="v-rec">R$0</div>
            <div class="ksub">pagas</div>
        </div>
        <div class="kpi yw">
            <div class="klbl">A Receber</div>
            <div class="kval" id="v-pend">R$0</div>
            <div class="ksub">pendentes</div>
        </div>
        <div class="kpi bl">
            <div class="klbl">Total Vendas</div>
            <div class="kval" id="v-tot">0</div>
            <div class="ksub">registradas</div>
        </div>
    </div>
    <div class="panel">
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Nº</th>
                        <th>Cliente</th>
                        <th>Data</th>
                        <th>Itens</th>
                        <th>Total</th>
                        <th>Pagamento</th>
                        <th>Status</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="venda-tb"></tbody>
            </table>
        </div>
    </div>
</div>