<div class="page" id="pg-estoque">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Produtos, peças e materiais</span>
        <div style="display:flex;gap:6px;"><button class="btn bg btn-sm" onclick="printEstq()">🖨 Relatório</button><button class="btn bp" onclick="openM('m-estq')">+ Item</button></div>
    </div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'estq-tb')" placeholder="🔍 Buscar por código, descrição, categoria..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div class="krow c3">
        <div class="kpi bl">
            <div class="klbl">Total Itens</div>
            <div class="kval" id="estq-tot">0</div>
        </div>
        <div class="kpi yw">
            <div class="klbl">Estoque Baixo</div>
            <div class="kval" id="estq-bx">0</div>
        </div>
        <div class="kpi gn">
            <div class="klbl">Valor Total</div>
            <div class="kval" id="estq-vl">R$0</div>
        </div>
    </div>
    <div class="search-bar"><input id="estq-srch" oninput="rdEstq()" placeholder="🔍 Buscar produto/peça..." /></div>
    <div class="panel">
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Cód.</th>
                        <th>Descrição</th>
                        <th>Cat.</th>
                        <th>Qtd</th>
                        <th>Mín</th>
                        <th>Un</th>
                        <th>Custo</th>
                        <th>Venda</th>
                        <th>Total</th>
                        <th>Sit.</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody id="estq-tb"></tbody>
            </table>
        </div>
    </div>
</div>