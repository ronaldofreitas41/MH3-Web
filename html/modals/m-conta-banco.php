<div class="mo" id="m-conta-banco">
    <div class="md">
        <div class="mh">
            <div class="mt2" id="cb-mtitle">🏦 Conta Bancária</div><button class="x" onclick="closeM('m-conta-banco')">×</button>
        </div>
        <div class="mb">
            <input id="cb-id" type="hidden" />
            <div class="fr">
                <div class="fg"><label>Nome/Apelido da Conta *</label><input id="cb-nome" placeholder="Ex: Conta Bradesco Principal" /></div>
                <div class="fg"><label>Banco</label><input id="cb-banco" placeholder="Ex: Bradesco" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Agência</label><input id="cb-ag" placeholder="0000" /></div>
                <div class="fg"><label>Conta</label><input id="cb-conta" placeholder="00000-0" /></div>
                <div class="fg"><label>Tipo</label>
                    <select id="cb-tipo">
                        <option value="corrente">Conta Corrente</option>
                        <option value="poupanca">Poupança</option>
                        <option value="aplicacao">Aplicação/Investimento</option>
                    </select>
                </div>
            </div>
            <div class="fr">
                <div class="fg"><label>Saldo Atual (R$)</label><input id="cb-saldo" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Saldo Poupança/Aplicação (R$)</label><input id="cb-saldo-pa" placeholder="0,00" step="0.01" type="number" /></div>
            </div>
            <div class="fg"><label><input checked="" id="cb-fluxo" style="width:auto;margin-right:6px" type="checkbox" />Entra no saldo do Fluxo de Caixa</label></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-conta-banco')">Cancelar</button><button class="btn bp" onclick="saveContaBanco()">Salvar</button></div>
    </div>
</div>