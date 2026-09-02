<div class="mo" id="m-patio-contato">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📞 Contato Contratante</div><button class="mc" onclick="closeM('m-patio-contato')">×</button>
        </div>
        <div class="mb2">
            <input id="patio-eqid" type="hidden" />
            <p style="font-size:11px;color:var(--mt);margin-bottom:8px">Contato de quem está com o veículo — no contratante (quando alocado) ou no pátio (quando disponível). Útil para combinar a revisão. Ao lançar um novo contrato, o contato anterior é apagado para você cadastrar o novo.</p>
            <div class="fr">
                <div class="fg"><label>Responsável (nome)</label><input id="patio-resp-nome" placeholder="Nome do responsável" /></div>
                <div class="fg"><label>Telefone responsável</label><input id="patio-resp-tel" placeholder="(00) 00000-0000" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Motorista (nome)</label><input id="patio-mot-nome" placeholder="Nome do motorista" /></div>
                <div class="fg"><label>Telefone motorista</label><input id="patio-mot-tel" placeholder="(00) 00000-0000" /></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="patio-obs" placeholder="Anotações sobre o contato, local, horários para revisão, etc." rows="3"></textarea></div>
            <div style="margin-top:12px;display:flex;gap:8px"><button class="btn bp" onclick="savePatioContato()">Salvar</button><button class="btn bg" onclick="closeM('m-patio-contato')">Cancelar</button></div>
        </div>
    </div>
</div>