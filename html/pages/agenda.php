<div class="page" id="pg-agenda">
    <div class="panel">
        <div class="ph">
            <div class="pt">📅 Calendário de Compromissos</div>
            <div style="display:flex;gap:6px;align-items:center">
                <button class="btn bg btn-sm" onclick="mudarMesAgenda(-1)" title="Mês anterior">◀</button>
                <span id="agenda-mes-lbl" style="font-weight:700;min-width:140px;text-align:center"></span>
                <button class="btn bg btn-sm" onclick="mudarMesAgenda(1)" title="Próximo mês">▶</button>
                <button class="btn bw btn-sm" onclick="agendaHoje()" title="Voltar para hoje">Hoje</button>
            </div>
        </div>
        <div class="pb">
            <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px;font-size:11px">
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--gn);border-radius:2px"></span> A Receber</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--red);border-radius:2px"></span> A Pagar</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--bl);border-radius:2px"></span> Medição</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--or);border-radius:2px"></span> Manutenção/Revisão</span>
                <span><span style="display:inline-block;width:10px;height:10px;background:var(--pu);border-radius:2px"></span> Aniversário</span>
            </div>
            <div id="agenda-grid"></div>
        </div>
    </div>
</div>