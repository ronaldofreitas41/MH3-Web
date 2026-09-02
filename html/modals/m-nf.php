<div class="mo" id="m-nf">
    <div class="mbox lg">
        <div class="mh">
            <div class="mt2">🧾 NF Entrada</div><button class="mc" onclick="closeM('m-nf')">×</button>
        </div>
        <div class="mb2">
            <div class="fr">
                <div class="fg"><label>Número NF</label><input id="nf-num" placeholder="123456" /></div>
                <div class="fg"><label>Data Emissão</label><input id="nf-dt" type="date" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Fornecedor</label><input id="nf-forn" /></div>
                <div class="fg"><label>CNPJ Fornecedor</label><input id="nf-cnpj" /></div>
            </div>
            <div class="divider"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span style="font-size:10px;color:var(--mt)">Itens</span><button class="btn bp btn-sm" onclick="addNfI()">+ Item</button></div>
            <div id="nf-items-list"></div>
            <div class="divider"></div>
            <div class="fr">
                <div class="fg"><label>Valor Total NF</label><input id="nf-vl" type="number" /></div>
                <div class="fg"><label>Vencimento C.Pagar</label><input id="nf-vc" type="date" /></div>
            </div>
            <div class="fg"><label>Lançar em Contas a Pagar</label>
                <div class="radio-row" style="margin-top:3px"><label><input checked="" name="nf-cp" type="radio" value="sim" /> Sim</label><label><input name="nf-cp" type="radio" value="nao" /> Não</label></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="nf-ob" rows="2"></textarea></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-nf')">Cancelar</button><button class="btn bp" onclick="saveNf()">Salvar</button></div>
    </div>
</div>