<div class="page" id="pg-resultado">
    <div class="panel">
        <div class="ph">
            <div class="pt">📈 Resultado por Veículo/Equipamento</div>
            <button class="btn bp btn-sm" onclick="imprimirResultado()">🖨 Imprimir</button>
        </div>
        <!-- Filtros -->
        <div style="display:flex;gap:12px;flex-wrap:wrap;padding:12px;background:var(--cd2);border-radius:8px;margin-bottom:12px;align-items:flex-end">
            <div class="fg" style="min-width:180px">
                <label>Veículo/Equipamento</label>
                <select id="res-placa" onchange="rdResultado()">
                    <option value="">Todas as placas</option>
                </select>
            </div>
            <div class="fg">
                <label>Período</label>
                <select id="res-periodo" onchange="toggleResPeriodo()">
                    <option value="geral">Geral (acumulado)</option>
                    <option value="30">Últimos 30 dias</option>
                    <option value="60">Últimos 60 dias</option>
                    <option value="90">Últimos 90 dias</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>
            <div id="res-custom-box" style="display:none;display:flex;gap:8px">
                <div class="fg"><label>De</label><input id="res-dt1" onchange="rdResultado()" type="date" /></div>
                <div class="fg"><label>Até</label><input id="res-dt2" onchange="rdResultado()" type="date" /></div>
            </div>
            <div class="fg">
                <label>Visão</label>
                <select id="res-visao" onchange="rdResultado()">
                    <option value="simples">Simples (resumo)</option>
                    <option value="detalhado">Detalhado (por item)</option>
                </select>
            </div>
        </div>
        <!-- Cards de resultado -->
        <div id="res-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-bottom:16px"></div>
        <!-- Tabela detalhada -->
        <div id="res-tabela"></div>
    </div>
</div>