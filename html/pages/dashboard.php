<div class="page on" id="pg-dashboard">
    <div id="pend-banner"></div>
    <div id="d-motivacao"></div>
    <div id="d-aniversarios"></div>
    <div class="panel no-print" id="d-identificacao" style="border:2px solid var(--bp,#3b82f6)">
        <div class="ph">
            <div class="pt">🛡️ Identificação do Sistema</div><button class="btn bg btn-sm" onclick="recarregarDados()" title="Puxar os dados do servidor agora">🔄 Sincronizar agora</button>
        </div>
        <div class="pb" id="d-ident-body"></div>
    </div>
    <div class="krow c3">
        <div class="kpi gn">
            <div class="klbl">Alocados</div>
            <div class="kval" id="kpi-al">0</div>
            <div class="ksub">contratos ativos</div>
        </div>
        <div class="kpi yw">
            <div class="klbl">OS Abertas</div>
            <div class="kval" id="kpi-os">0</div>
            <div class="ksub">manutenção</div>
        </div>
        <div class="kpi rd" id="kpi-rc-card">
            <div class="klbl">Receita/Mês</div>
            <div class="kval" id="kpi-rc">R$0</div>
            <div class="ksub">previsto no mês</div>
        </div>
    </div>
    <div class="krow c3" id="kpi-fin-row">
        <div class="kpi cy">
            <div class="klbl">A Receber</div>
            <div class="kval" id="kpi-ar">R$0</div>
            <div class="ksub">a receber no mês</div>
        </div>
        <div class="kpi rd">
            <div class="klbl">A Pagar</div>
            <div class="kval" id="kpi-ap">R$0</div>
            <div class="ksub">a pagar no mês</div>
        </div>
        <div class="kpi or">
            <div class="klbl">Despesa do Mês</div>
            <div class="kval" id="kpi-dp">R$0</div>
            <div class="ksub">no mês (novas)</div>
        </div>
    </div>
    <div class="krow c3" id="kpi-ind-row">
        <div class="kpi bl">
            <div class="klbl">Ocupação da Frota</div>
            <div class="kval" id="kpi-ocup">0%</div>
            <div class="ksub" id="kpi-ocup-sub">alocados</div>
        </div>
        <div class="kpi rd">
            <div class="klbl">Inadimplência</div>
            <div class="kval" id="kpi-inad">R$0</div>
            <div class="ksub" id="kpi-inad-sub">vencidos</div>
        </div>
        <div class="kpi gn">
            <div class="klbl">Resultado do Mês</div>
            <div class="kval" id="kpi-lucro">R$0</div>
            <div class="ksub">receita − despesa</div>
        </div>
    </div>
    <div id="d-alerts"></div>
    <div id="d-ajudas-recorrentes"></div>
    <div id="d-contas-hoje"></div>
    <div class="g2">
        <div class="panel">
            <div class="ph">
                <div class="pt">📐 Medições Próximas</div><button class="btn bg btn-sm" onclick="go('medicoes')">Ver</button>
            </div>
            <div class="pb" id="d-meds"></div>
        </div>
        <div class="panel">
            <div class="ph">
                <div class="pt">🔄 Revisões — Alertas</div><button class="btn bg btn-sm" onclick="go('revisao')">Ver</button>
            </div>
            <div class="pb" id="d-revs"></div>
        </div>
    </div>
    <div style="text-align:center;margin-top:16px;padding:12px;font-size:12px;color:var(--mt);background:var(--cd2);border-radius:8px">🔄 Última atualização do sistema: <b id="dash-build" style="color:var(--tx)">—</b></div>
</div>