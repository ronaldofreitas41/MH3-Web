<div class="mo" id="m-cliente">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">🏢 Cliente</div><button class="mc" onclick="closeM('m-cliente')">×</button>
        </div>
        <div class="mb2"><input id="cli-eid" type="hidden" />
            <div class="fg"><label>Nome do Cliente *</label><input id="cli-nome" placeholder="RAZÃO SOCIAL OU NOME" /></div>
            <div class="fg"><label>CNPJ *</label><input id="cli-cnpj" oninput="fmtDocFiscal(this)" placeholder="00.000.000/0001-00" /></div>
            <div class="fg"><label>Obra</label><input id="cli-obra" placeholder="NOME DA OBRA / LOCAL" /></div>
            <div class="fr">
                <div class="fg"><label>Cidade</label><input id="cli-cidade" placeholder="CIDADE" /></div>
                <div class="fg"><label>Telefone</label><input id="cli-tel" placeholder="(31) 9xxxx-xxxx" /></div>
            </div>
            <div class="fg"><label>E-mail (para cobrança)</label><input data-ac="email" id="cli-email" placeholder="cliente@empresa.com.br" type="email" /></div>
            <div class="fg"><label>Observações</label><textarea id="cli-obs" rows="2"></textarea></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-cliente')">Cancelar</button><button class="btn bp" onclick="saveCliente()">Salvar Cliente</button></div>
    </div>
</div>