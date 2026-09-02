<div class="mo" id="m-pneu-sai">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📤 Saída de Pneu</div><button class="mc" onclick="closeM('m-pneu-sai')">×</button>
        </div>
        <div class="mb2">
            <div class="fg"><label>Nº Controle MH3 *</label><input id="psai-num" placeholder="MH3-0001" /></div>
            <div class="fg"><label>Tipo de Saída *</label>
                <select id="psai-tipo" onchange="toggleSaiTipo()">
                    <option value="reforma">Envio para Reforma</option>
                    <option value="inutilizacao">Inutilização</option>
                </select>
                <p style="font-size:11px;color:var(--mt);margin-top:6px">ℹ️ Saída por placa só acontece automaticamente via OS ou Venda</p>
            </div>
            <div id="psai-placa-box">
                <div class="fg"><label>Placa *</label>
                    <select id="psai-placa">
                        <option value="">Selecionar...</option>
                    </select>
                </div>
                <div class="fg"><label>Eixo</label>
                    <select id="psai-eixo">
                        <option value="1">1º Eixo</option>
                        <option value="2">2º Eixo</option>
                        <option value="3">3º Eixo</option>
                        <option value="4">4º Eixo</option>
                    </select>
                </div>
            </div>
            <div id="psai-reforma-box" style="display:none">
                <div class="fg"><label>Reformadora *</label><input id="psai-reform" placeholder="Nome da reformadora" /></div>
                <div class="fg"><label>Previsão de Retorno</label><input id="psai-prev" type="date" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Data *</label><input id="psai-dt" type="date" /></div>
                <div class="fg"><label>Observações</label><input id="psai-ob" /></div>
            </div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-pneu-sai')">Cancelar</button><button class="btn bp" onclick="savePneuSai()">Registrar Saída</button></div>
    </div>
</div>