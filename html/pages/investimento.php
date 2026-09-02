<div class="page" id="pg-investimento">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Investimentos: tudo que a MH3 paga mas ainda não utiliza (consórcios, etc). Ao ser contemplado/comprado, envie para a Frota.</span></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">📈 Novo Investimento</div>
        </div>
        <div class="pb">
            <div class="fr">
                <div class="fg"><label>Descrição *</label><input id="inv-desc" placeholder="Ex: Consórcio Caminhão Volvo" /></div>
                <div class="fg"><label>Tipo</label>
                    <select id="inv-tipo">
                        <option value="consorcio">Consórcio</option>
                        <option value="financiamento">Financiamento</option>
                        <option value="poupanca">Poupança Programada</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="fg"><label>Administradora/Banco</label><input id="inv-adm" placeholder="Ex: Embracon" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor da Carta/Bem (R$)</label><input id="inv-valor-carta" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Nº Total de Parcelas</label><input id="inv-nparc" placeholder="80" type="number" /></div>
                <div class="fg"><label>Parcelas Já Pagas</label><input id="inv-parcpg" placeholder="0" type="number" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor da Parcela (R$)</label><input id="inv-vparc" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Data de Início</label><input id="inv-dt" type="date" /></div>
                <div class="fg"><label>Dia do Vencimento</label><input id="inv-dia-venc" max="31" min="1" placeholder="10" type="number" /></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="inv-obs" placeholder="Grupo, cota, lance embutido, etc." rows="2"></textarea></div>
            <button class="btn bp" onclick="addInvestimento()" title="Cadastrar investimento">+ Cadastrar Investimento</button>
        </div>
    </div>
    <div class="panel">
        <div class="ph">
            <div class="pt">📋 Investimentos em Andamento</div>
        </div>
        <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'inv-tb')" placeholder="🔍 Buscar por descrição, administradora..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Descrição</th>
                        <th>Tipo</th>
                        <th>Carta/Bem</th>
                        <th>Parcelas</th>
                        <th>Parcela R$</th>
                        <th>Pago Acum.</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody id="inv-tb"></tbody>
            </table>
        </div>
        <div style="margin-top:12px;padding:12px;background:var(--rg);border-radius:8px;display:flex;justify-content:space-between">
            <span style="font-size:12px;color:var(--mt)">Total Investido (pago acumulado):</span>
            <span id="inv-total" style="font-size:18px;font-weight:700;color:var(--bl)">R$ 0,00</span>
        </div>
    </div>
</div>