<div class="mo" id="m-import">
    <div class="md">
        <div class="mh">
            <div class="mt2" id="imp-titulo">📥 Importar Planilha</div><button class="x" onclick="closeM('m-import')">×</button>
        </div>
        <div class="mb">
            <input id="imp-modulo" type="hidden" />
            <div style="background:var(--cd2);border-radius:8px;padding:12px;margin-bottom:12px">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">📋 Como importar:</div>
                <ol style="font-size:12px;color:var(--mt);margin:0;padding-left:18px">
                    <li>Baixe o modelo CSV e preencha no Excel (ou organize sua planilha com estas colunas)</li>
                    <li>No Excel, salve como <b>CSV</b> (Arquivo → Salvar Como → CSV)</li>
                    <li>Escolha o arquivo abaixo e confira a prévia antes de importar</li>
                </ol>
                <div style="margin-top:8px"><b style="font-size:11px">Colunas esperadas:</b> <span id="imp-colunas" style="font-size:11px;color:var(--bl)"></span></div>
                <button class="btn bw btn-sm" onclick="baixarModeloCSV()" style="margin-top:8px" title="Baixar modelo CSV para preencher">⬇ Baixar Modelo CSV</button>
            </div>
            <div class="fg"><label>Arquivo CSV</label><input accept=".csv,.txt" id="imp-file" onchange="lerArquivoImport()" type="file" /></div>
            <div class="fg"><label>Ou cole os dados (copiados do Excel)</label><textarea id="imp-paste" oninput="processarPasteImport()" placeholder="Cole aqui as linhas copiadas do Excel..." rows="4"></textarea></div>
            <div id="imp-preview" style="margin-top:10px"></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-import')">Cancelar</button><button class="btn bp" id="imp-btn-confirmar" onclick="confirmarImport()" style="display:none">Importar</button></div>
    </div>
</div>