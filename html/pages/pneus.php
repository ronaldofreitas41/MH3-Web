<div class="page" id="pg-pneus">
    <div id="pneu-alerta-dot"></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">🔵 Módulo Pneus</div>
            <div style="display:flex;gap:6px">
                <button class="btn bg btn-sm" onclick="abrirEntradaPneu()">📥 Entrada</button>
                <button class="btn bp btn-sm" onclick="openM('m-pneu-sai')">📤 Saída</button> <button class="btn bcy btn-sm" onclick="abrirRelPneus()" title="Relatórios de pneus por situação, medida, marca, tipo ou condição">📊 Relatório</button>
                <button class="btn bw btn-sm" id="pneu-perm-btn" onclick="abrirPermPneu()" style="display:none" title="Selecionar quais usuários podem editar pneus">⚙️ Quem pode editar</button>
            </div>
        </div>
        <div class="tabs" style="margin-bottom:12px">
            <div class="tab on" onclick="stab(this,'tp-estoque')">Estoque <span id="cnt-pneu-est" style="background:var(--cd2);color:var(--mt);border-radius:8px;padding:0 6px;font-size:9px"></span></div>
            <div class="tab" onclick="stab(this,'tp-pend')">⚠️ Entradas Pendentes <span id="pneu-pend-badge" style="display:none;background:var(--red);color:#fff;border-radius:10px;padding:0 6px;font-size:9px;margin-left:3px">0</span></div>
            <div class="tab" onclick="stab(this,'tp-reforma')">Em Reforma <span id="cnt-pneu-ref" style="background:var(--cd2);color:var(--mt);border-radius:8px;padding:0 6px;font-size:9px"></span></div>
            <div class="tab" onclick="stab(this,'tp-hist')">Histórico <span id="cnt-pneu-hist" style="background:var(--cd2);color:var(--mt);border-radius:8px;padding:0 6px;font-size:9px"></span></div>
        </div>
        <div class="tab-p on" id="tp-estoque">
            <div id="pneu-resumo"></div>
            <div style="margin:0 0 10px"><input oninput="filtrarTabela(this,'pneu-estq-tb')" placeholder="🔍 Buscar pneu por número ou marca..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Nº MH3</th>
                            <th>Marca</th>
                            <th>Tipo</th>
                            <th>Medida</th>
                            <th>DOT</th>
                            <th>Situação</th>
                            <th>Local</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pneu-estq-tb"></tbody>
                </table>
            </div>
        </div>
        <div class="tab-p" id="tp-pend">
            <div style="font-size:11px;color:var(--mt);margin-bottom:8px">Pneus retirados das placas em OS de manutenção, aguardando entrada no estoque. Dê entrada de cada pneu retirado (informe condição: usado, reformado, etc.).</div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>OS</th>
                            <th>Data</th>
                            <th>Pneus retirados</th>
                            <th>Entrada feita</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pneu-pend-tb"></tbody>
                </table>
            </div>
        </div>
        <div class="tab-p" id="tp-reforma">
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Nº MH3</th>
                            <th>Marca</th>
                            <th>Medida</th>
                            <th>Reformadora</th>
                            <th>Saída</th>
                            <th>Previsão</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="pneu-reform-tb"></tbody>
                </table>
            </div>
        </div>
        <div class="tab-p" id="tp-hist">
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Nº MH3</th>
                            <th>Tipo</th>
                            <th>Placa/Destino</th>
                            <th>Data</th>
                            <th>Obs</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody id="pneu-hist-tb"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>