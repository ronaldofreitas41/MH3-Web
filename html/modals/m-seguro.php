<div class="mo" id="m-seguro">
    <div class="md">
        <div class="mh">
            <div class="mt2" id="seg-mtitle">🛡️ Nova Apólice</div><button class="x" onclick="closeM('m-seguro')">×</button>
        </div>
        <div class="mb">
            <div class="ab a-yw" style="margin-bottom:10px;font-size:11px">Cadastre a apólice e marque <b>todas as placas</b> que ela cobre. Placas não marcadas ficam <b>sem seguro</b>. O sistema avisa <b>15 dias antes</b> do vencimento.</div>
            <div class="fr">
                <div class="fg"><label>Seguradora *</label><input id="seg-seguradora" placeholder="Ex: Porto Seguro" /></div>
                <div class="fg"><label>Nº da Apólice / Cobertura</label><input id="seg-apolice" placeholder="Número da apólice" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Início da vigência</label><input id="seg-inicio" type="date" /></div>
                <div class="fg"><label>Vencimento *</label><input id="seg-venc" type="date" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor do prêmio (R$)</label><input id="seg-valor" placeholder="0,00" /></div>
                <div class="fg"><label>Observações</label><input id="seg-obs" placeholder="Opcional" /></div>
            </div>
            <label style="font-size:12px;font-weight:700;margin-top:6px;display:block">Placas cobertas por esta apólice</label>
            <div style="display:flex;gap:6px;margin:4px 0 6px;flex-wrap:wrap">
                <input id="seg-busca-placa" oninput="_segFiltraPlacas(this.value)" placeholder="🔍 filtrar placa..." style="flex:1;min-width:150px;padding:6px 9px;border:1px solid var(--br,#e2e8f0);border-radius:6px;background:var(--cd2,#f8fafc);color:var(--tx);font-size:12px" />
                <button class="btn bg btn-sm" onclick="_segMarcarTodas(true)" type="button">Marcar todas</button>
                <button class="btn bg btn-sm" onclick="_segMarcarTodas(false)" type="button">Limpar</button>
            </div>
            <div id="seg-placas" style="max-height:220px;overflow:auto;border:1px solid var(--br,#e2e8f0);border-radius:7px;padding:5px;background:var(--cd2,#f8fafc)"></div>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:14px">
                <button class="btn bg" onclick="closeM('m-seguro')">Cancelar</button>
                <button class="btn bp" onclick="saveSeguro()">💾 Salvar apólice</button>
            </div>
        </div>
    </div>
</div>