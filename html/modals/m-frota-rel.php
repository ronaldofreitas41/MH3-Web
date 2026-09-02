<div class="mo" id="m-frota-rel">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📊 Relatórios da Frota</div><button class="mc" onclick="closeM('m-frota-rel')">×</button>
        </div>
        <div class="mb2">
            <p style="font-size:12px;color:var(--mt);margin-bottom:10px">Escolha o tipo de relatório. Abre em nova aba para imprimir ou salvar em PDF.</p>
            <button class="btn bp" onclick="closeM('m-frota-rel');relFrotaCompleto()" style="width:100%;margin-bottom:8px">📋 Completo — todas as informações cadastradas</button>
            <button class="btn bp" onclick="closeM('m-frota-rel');relFrotaSimples()" style="width:100%;margin-bottom:8px">📄 Simples — placa, modelo, ano, status, KM/h</button>
            <button class="btn bp" onclick="closeM('m-frota-rel');imprimirRelFrota()" style="width:100%;margin-bottom:8px">💰 Patrimonial — valores e financiamento</button>
            <button class="btn bp" onclick="closeM('m-frota-rel');relFrotaVencimentos()" style="width:100%">📅 Vencimentos — documentos a vencer</button>
            <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--br)">
                <label style="font-size:11px;font-weight:700;color:var(--mt);display:block;margin-bottom:5px">🔎 Por tipo de documento — lista todos, <b>inclusive os EM BRANCO</b> (pra conferência)</label>
                <div style="display:flex;gap:6px">
                    <select id="relf-tipo-doc" style="flex:1;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx);font-size:12px">
                        <option value="crlv">CRLV</option>
                        <option value="antt">Licença / ANTT</option>
                        <option value="crono">Cronotacógrafo</option>
                        <option value="docManVc">Doc. Manual</option>
                        <option value="seguro">Seguro</option>
                    </select>
                    <button class="btn bp btn-sm" onclick="relFrotaPorTipo(document.getElementById('relf-tipo-doc').value);closeM('m-frota-rel')">Gerar</button>
                </div>
            </div>
        </div>
    </div>
</div>