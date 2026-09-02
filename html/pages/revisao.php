<div class="page" id="pg-revisao">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Acompanhamento de revisão preventiva</span>
        <div style="display:flex;gap:5px"><button class="btn bd btn-sm no-print" onclick="limparReiniciarRevisoes()" title="Apaga os lançamentos e define a última revisão = KM/horímetro inicial do cadastro">🧹 Limpar e reiniciar</button><button class="btn bw btn-sm no-print" onclick="abrirImportRev()" title="Importar revisões do relatório de OS">📥 Importar Revisões</button><button class="btn bg btn-sm" onclick="rdRev()">🔄 Atualizar</button></div>
    </div>
    <div style="margin-bottom:10px"><input id="rev-srch" oninput="rdRev()" placeholder="🔍 Buscar por placa, modelo, veículo..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
    <div id="rev-list"></div>
</div>