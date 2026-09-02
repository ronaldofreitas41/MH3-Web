<div class="mo" id="m-pneu-ent">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📥 Entrada de Pneu</div><button class="mc" onclick="closeM('m-pneu-ent')">×</button>
        </div>
        <div class="mb2">
            <input id="pneu-edit-id" type="hidden" />
            <p style="font-size:11px;color:var(--red)">* Todos os campos são obrigatórios</p>
            <div class="fr">
                <div class="fg"><label>Nº Controle MH3 *</label><input id="pneu-num" placeholder="MH3-0001" /></div>
                <div class="fg"><label>DOT *</label><input id="pneu-dot" maxlength="4" placeholder="3524" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Marca *</label><input data-ac="marcaPneu" id="pneu-mk" placeholder="Bridgestone, Pirelli..." /></div>
                <div class="fg"><label>Tipo *</label><select id="pneu-mo">
                        <option value="">Selecione...</option>
                        <option value="MISTO">MISTO</option>
                        <option value="LISO">LISO</option>
                        <option value="BORRACHUDO">BORRACHUDO</option>
                        <option value="USADO">USADO</option>
                        <option value="CARCAÇA">CARCAÇA</option>
                        <option value="RECUSADA">RECUSADA</option>
                    </select></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Medida *</label><input id="pneu-med" placeholder="275/80R22,5" /></div>
                <div class="fg"><label>Condição</label><select id="pneu-cond">
                        <option value="novo">Novo</option>
                        <option value="reformado">Reformado</option>
                        <option value="usado">Usado</option>
                    </select></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor Unitário (R$)</label><input id="pneu-vl" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Data Entrada</label><input id="pneu-dt" type="date" /></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="pneu-ob" rows="2"></textarea></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-pneu-ent')">Cancelar</button><button class="btn bp" id="pneu-ent-btn" onclick="savePneuEnt()">Registrar Entrada</button></div>
    </div>
</div>