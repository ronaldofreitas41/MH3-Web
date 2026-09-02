<div class="mo" id="m-rev">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">🔄 Lançar KM / Horímetro</div><button class="mc" onclick="closeM('m-rev')">×</button>
        </div>
        <div class="mb2"><input id="rev-eqid" type="hidden" />
            <div class="fg"><label>Veículo/Equipamento</label><input id="rev-eq-lbl" readonly="" style="color:var(--mt)" /></div>
            <div class="fr">
                <div class="fg"><label>KM Atual</label><input id="rev-km" type="number" /></div>
                <div class="fg"><label>Horímetro Atual (h)</label><input id="rev-hr" type="number" /></div>
            </div>
            <div class="fg"><label>Data do Lançamento</label><input id="rev-dt" type="date" /></div>
            <div class="fg"><label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;background:var(--cd);padding:10px;border-radius:6px;border:1px solid var(--br)"><input id="rev-revisao" style="width:18px;height:18px;margin-top:2px" type="checkbox" /> <span><b>🔧 Esta é uma REVISÃO realizada</b><br /><span style="font-size:10px;color:var(--mt);font-weight:400">Marque se a manutenção foi feita agora — o KM/horímetro acima vira a <b>última revisão</b> e a contagem reinicia. Deixe desmarcado para apenas atualizar o KM atual.</span></span></label></div>
            <div class="fg"><label>Observações</label><textarea id="rev-ob" rows="2"></textarea></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-rev')">Cancelar</button><button class="btn bp" onclick="saveRev()">Salvar</button></div>
    </div>
</div>