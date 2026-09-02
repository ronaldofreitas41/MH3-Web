<div class="page" id="pg-funcionarios">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Funcionários</span>
<button class="btn bp" onclick="openFunc()" title="Cadastrar funcionário">+ Novo Funcionário</button>
</div>
<div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'func-tb')" placeholder="🔍 Buscar por nome, CPF..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search"/></div>
<div class="panel">
<div class="tw"><table>
<thead><tr><th>Nome</th><th>CPF</th><th>CNH</th><th>Telefone</th><th>Salário</th><th>Ações</th></tr></thead>
<tbody id="func-tb"></tbody>
</table></div>
</div>
</div>
