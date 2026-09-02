<div class="page" id="pg-clientes">
<div class="shdr"><span style="color:var(--mt);font-size:11px">Cadastro de clientes</span>
<button class="btn bp" onclick="openCliente()" title="Cadastrar cliente">+ Novo Cliente</button>
<button class="btn bw" onclick="abrirEnvioColetivo()" title="Enviar e-mail para todos os clientes (Natal, comunicados...)">📧 Envio coletivo</button>
</div>
<div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'cli-tb')" placeholder="🔍 Buscar por nome, CNPJ, obra..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search"/></div>
<div class="panel">
<div class="tw"><table>
<thead><tr><th>Cliente</th><th>CNPJ</th><th>Obra</th><th>Contratos</th><th>Ações</th></tr></thead>
<tbody id="cli-tb"></tbody>
</table></div>
</div>
</div>
