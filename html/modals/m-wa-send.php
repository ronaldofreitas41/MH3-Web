<div class="mo" id="m-wa-send">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📲 Enviar no WhatsApp</div><button class="mc" onclick="closeM('m-wa-send')">×</button>
        </div>
        <div class="mb2">
            <div class="fr">
                <div class="fg"><label>Para qual número?</label><input id="wa-tel" placeholder="(00) 00000-0000" /></div>
                <div class="fg"><label>Ou escolher cliente cadastrado</label><select id="wa-cli-sel" onchange="waSelCliente()">
                        <option value="">— escolher cliente cadastrado —</option>
                    </select></div>
            </div>
            <div class="fg"><label>Mensagem (edite se precisar)</label><textarea id="wa-msg" rows="6"></textarea></div>
            <div style="margin-top:12px;display:flex;gap:8px"><button class="btn" onclick="waEnviar()" style="background:#25D366;color:#fff;border:none">📲 Enviar no WhatsApp</button><button class="btn bg" onclick="closeM('m-wa-send')">Cancelar</button></div>
        </div>
    </div>
</div>