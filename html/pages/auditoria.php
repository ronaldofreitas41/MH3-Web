<div class="page" id="pg-auditoria">
    <div class="panel">
        <div class="ph">
            <div class="pt">🕵️ Auditoria do Sistema</div>
        </div>
        <div class="pb">
            <p style="font-size:12px;color:var(--mt);margin-bottom:12px">Acompanhe as ações dos usuários no sistema</p>
            <div id="audit-resumo" style="margin-bottom:16px"></div>
            <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
                <select id="af-user" onchange="filtrarAudit()" style="flex:1;min-width:120px;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx)">
                    <option value="">Todos os usuários</option>
                </select>
                <select id="af-acao" onchange="filtrarAudit()" style="flex:1;min-width:120px;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx)">
                    <option value="">Todas as ações</option>
                </select>
                <select id="af-mod" onchange="filtrarAudit()" style="flex:1;min-width:120px;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx)">
                    <option value="">Todos os módulos</option>
                </select>
                <select id="af-mes" onchange="filtrarAudit()" style="flex:1;min-width:120px;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx)">
                    <option value="">Todos os meses</option>
                </select>
                <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--tx);white-space:nowrap;cursor:pointer"><input id="af-susp" onchange="filtrarAudit()" type="checkbox" /> ⚠️ Só suspeitas</label>
                <button class="btn bp btn-sm" onclick="filtrarAudit()">🔍 Filtrar</button>
            </div>
            <div class="tw">
                <table>
                    <thead>
                        <tr>
                            <th>Data/Hora</th>
                            <th>Usuário</th>
                            <th>Ação</th>
                            <th>Módulo</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody id="audit-tb"></tbody>
                </table>
            </div>
            <div style="margin-top:8px;font-size:11px;color:var(--mt)">Total de registros: <span id="audit-total">0</span> <span id="audit-susp" style="color:var(--red);font-weight:700"></span></div>
        </div>
    </div>
</div>