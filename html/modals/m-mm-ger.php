<div class="mo" id="m-mm-ger">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">➕ Gerar Medição Manual</div><button class="mc" onclick="closeM('m-mm-ger')">×</button>
        </div>
        <div class="mb2">
            <input id="mm-ger-eid" type="hidden" />
            <div id="mm-ger-info" style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px"></div>
            <div class="fr">
                <div class="fg"><label>Mês / Referência *</label><input id="mm-ger-ms" placeholder="Ex.: 06/2026" /></div>
                <div class="fg"><label>Vencimento *</label><input id="mm-ger-vc" type="date" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor da medição (R$) *</label><input id="mm-ger-vl" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Desconto (R$)</label><input id="mm-ger-dc" placeholder="0,00" step="0.01" type="number" /></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="mm-ger-obs" rows="2"></textarea></div>
            <p style="font-size:10px;color:var(--mt)">A medição entra no Financeiro (Contas a Receber) como as demais.</p>
        </div>
        <div class="mf">
            <button class="btn bg" onclick="closeM('m-mm-ger')">Cancelar</button>
            <button class="btn bp" onclick="salvarMedManGer()">Gerar Medição</button>
        </div>
    </div>
</div>