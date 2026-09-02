<div class="page" id="pg-sistema">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Configurações do sistema — tabelas de preço e prazos</span></div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'cr2-tb')" placeholder="🔍 Buscar por cliente, placa..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'cp2-tb')" placeholder="🔍 Buscar por cliente, placa, descrição..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">💲 Tabelas de Preço por Categoria</div>
        </div>
        <div class="pb">
            <p style="font-size:12px;color:var(--mt);margin-bottom:12px">Cadastre tabelas de margem por categoria. Fórmula: Custo + Margem = Valor de Venda</p>
            <div class="fr">
                <div class="fg"><label>Nome da Tabela</label><input id="tab-nome" placeholder="Ex: PEÇAS BALCÃO" /></div>
                <div class="fg"><label>Categoria</label>
                    <div style="display:flex;gap:6px">
                        <select id="tab-cat" style="flex:1"></select>
                        <button class="btn bg btn-sm" onclick="novaCategoria()" title="Cadastrar nova categoria" type="button">+ Cat.</button>
                    </div>
                </div>
                <div class="fg"><label>Margem (%)</label><input id="tab-margem" placeholder="40" step="0.1" type="number" /></div>
                <div class="fg" style="display:flex;align-items:flex-end"><button class="btn bp btn-sm" onclick="addTabela()" title="Adicionar tabela">+ Adicionar</button></div>
            </div>
            <div class="tw" style="margin-top:10px">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Categoria</th>
                            <th>Margem %</th>
                            <th>Exemplo (custo R$100)</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="tab-lista"></tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="panel">
        <div class="ph">
            <div class="pt">📅 Prazos de Pagamento</div>
        </div>
        <div class="pb">
            <p style="font-size:12px;color:var(--mt);margin-bottom:12px">Cadastre prazos para usar nas vendas (dias para pagar ou parcelamento)</p>
            <div class="fr">
                <div class="fg"><label>Nome do Prazo</label><input id="prz-nome" placeholder="Ex: 30/60/90" /></div>
                <div class="fg"><label>Tipo</label><select id="prz-tipo" onchange="togglePrzTipo()">
                        <option value="dias">Dias para pagar</option>
                        <option value="parcelas">Parcelamento</option>
                        <option value="intervalo">Intervalo de dias (ex: 28 = 28/56)</option>
                    </select></div>
                <div class="fg" id="prz-dias-box"><label>Dias (separar por /)</label><input id="prz-dias" placeholder="30/60/90" /></div>
                <div class="fg" id="prz-parc-box" style="display:none"><label>Nº de Parcelas</label><input id="prz-parc" placeholder="3" type="number" /></div>
                <div class="fg" id="prz-int-box" style="display:none"><label>Intervalo (dias)</label><input id="prz-int-dias" placeholder="28" type="number" /></div>
                <div class="fg" id="prz-int-qtd-box" style="display:none"><label>Qtd. Vezes</label><input id="prz-int-qtd" placeholder="2" type="number" /></div>
                <div class="fg" style="display:flex;align-items:flex-end"><button class="btn bp btn-sm" onclick="addPrazo()" title="Adicionar prazo">+ Adicionar</button></div>
            </div>
            <div class="tw" style="margin-top:10px">
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Detalhe</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="prz-lista"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>