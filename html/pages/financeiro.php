<div class="page" id="pg-financeiro">
    <div class="krow c4">
        <div class="kpi gn">
            <div class="klbl">Receita Prevista</div>
            <div class="kval" id="f-prev">R$0</div>
            <div class="ksub">contratos ativos</div>
        </div>
        <div class="kpi bl">
            <div class="klbl">Recebido</div>
            <div class="kval" id="f-rec">R$0</div>
            <div class="ksub">no período</div>
        </div>
        <div class="kpi rd">
            <div class="klbl">A Receber</div>
            <div class="kval" id="f-ar">R$0</div>
            <div class="ksub">pendente</div>
        </div>
        <div class="kpi or">
            <div class="klbl">A Pagar</div>
            <div class="kval" id="f-ap2">R$0</div>
            <div class="ksub">NFs + despesas</div>
        </div>
    </div>
    <div class="tabs" style="margin-bottom:0">
        <div class="tab on" onclick="stab(this,'tf-med')">Medições</div>
        <div class="tab" onclick="stab(this,'tf-vend')">Vendas</div>
        <div class="tab" onclick="stab(this,'tf-cp')">Contas a Pagar</div>
        <div class="tab" onclick="stab(this,'tf-prej')">⚠️ Prejuízos</div>
    </div>
    <div class="tab-p on" id="tf-med" style="margin-top:1px">
        <div class="panel">
            <div class="ph">
                <div class="pt">📐 Medições — Contas a Receber</div>
            </div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Período</th>
                            <th>Bruto</th>
                            <th>Desc.</th>
                            <th>Total</th>
                            <th>Venc.</th>
                            <th>Fluxo</th>
                            <th>Situação</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="fin-med-tb"></tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="tab-p" id="tf-vend" style="margin-top:1px">
        <div class="panel">
            <div class="ph">
                <div class="pt">🛒 Vendas — Contas a Receber</div>
            </div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Nº</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Total</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="fin-vend-tb"></tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="tab-p" id="tf-cp" style="margin-top:1px">
        <div class="panel">
            <div class="ph">
                <div class="pt">💸 Contas a Pagar (NFs + Despesas)</div>
            </div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Tipo</th>
                            <th>Fornecedor</th>
                            <th>Valor</th>
                            <th>Venc.</th>
                            <th>Status</th>
                            <th>Ação</th>
                        </tr>
                    </thead>
                    <tbody id="fin-cp-tb"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>