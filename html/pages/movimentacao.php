<div class="page" id="pg-movimentacao">
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;font-size:12px">
        <span style="color:var(--mt)">Período:</span>
        <select id="mov-periodo" onchange="setMovPeriodo(this.value)" style="font-size:12px;padding:6px 9px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)">
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="semana">Últimos 7 dias</option>
            <option value="mes">Este mês</option>
            <option value="periodo">Período personalizado</option>
        </select>
        <input id="mov-de" onchange="rdMovDia()" style="display:none;font-size:12px;padding:5px 7px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" type="date" />
        <input id="mov-ate" onchange="rdMovDia()" style="display:none;font-size:12px;padding:5px 7px;border-radius:6px;border:1px solid var(--br);background:var(--cd2);color:var(--tx)" type="date" />
        <button class="btn bs btn-xs" onclick="rdMovDia(true)">🔄 Atualizar</button>
        <label style="font-size:11px;color:var(--mt);display:flex;align-items:center;gap:4px"><input id="mov-tudo" onchange="rdMovDia()" type="checkbox" /> ver tudo (logins, sistema)</label>
    </div>
    <div id="mov-resumo"></div>
    <div id="mov-feed" style="margin-top:10px"></div>
</div>