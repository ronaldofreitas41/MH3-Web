<div class="page" id="pg-ajuda_motorista">
    <div class="shdr"><span style="color:var(--mt);font-size:11px">Lance a ajuda de custo do motorista. Ao lançar, entra automaticamente em Contas a Pagar como "Ajuda de Custo".</span></div>
    <div class="panel">
        <div class="ph">
            <div class="pt">🚚 Nova Ajuda de Custo</div>
        </div>
        <div class="pb">
            <div class="fr">
                <div class="fg"><label>Empresa *</label><input id="am-empresa" placeholder="Nome da empresa" /></div>
                <div class="fg"><label>Motorista *</label><input id="am-motorista" placeholder="Nome do motorista" /></div>
                <div class="fg"><label>Telefone</label><input id="am-telefone" placeholder="(00) 00000-0000" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor (R$) *</label><input id="am-valor" placeholder="0,00" step="0.01" type="number" /></div>
                <div class="fg"><label>Data *</label><input id="am-data" type="date" /></div>
                <div class="fg"><label>Veículo/Equipamento (entra no resultado)</label>
                    <select id="am-placa">
                        <option value="">Sem vínculo (despesa geral)</option>
                    </select>
                </div>
            </div>
            <div style="background:var(--cd2);border-radius:8px;padding:10px;margin:8px 0">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">🏦 DADOS BANCÁRIOS</div>
                <div class="fr">
                    <div class="fg"><label>Agência</label><input id="am-ag" placeholder="0000" /></div>
                    <div class="fg"><label>Conta</label><input id="am-conta" placeholder="00000-0" /></div>
                    <div class="fg"><label>Tipo de Conta</label>
                        <select id="am-tipo-conta" onchange="toggleTipoContaAM()">
                            <option value="corrente">Conta Corrente</option>
                            <option value="poupanca">Conta Poupança</option>
                            <option value="pix">PIX</option>
                        </select>
                    </div>
                </div>
                <div class="fg" id="am-pix-box" style="display:none"><label>Chave PIX</label><input id="am-pix" placeholder="CPF, telefone, e-mail ou chave aleatória" /></div>
            </div>
            <div class="fg"><label>Observações</label><textarea id="am-obs" placeholder="Observações sobre a ajuda de custo" rows="2"></textarea></div>
            <div style="background:var(--cd2);border-radius:8px;padding:10px;margin:8px 0">
                <div class="fr">
                    <div class="fg"><label><input id="am-recorrente" style="width:auto;margin-right:6px" type="checkbox" />Repetir todo mês (relembrar para confirmar)</label></div>
                    <div class="fg"><label>Quem confirma a recorrência</label>
                        <select id="am-confirma">
                            <option value="">Selecionar usuário...</option>
                        </select>
                    </div>
                </div>
                <p style="font-size:10px;color:var(--mt)">Se marcado, todo mês o sistema lembra o usuário escolhido de confirmar se essa ajuda entra no Contas a Pagar — sem precisar recadastrar.</p>
            </div>
            <button class="btn bp" onclick="addAjudaMotorista()" title="Lançar ajuda de custo (vai para Contas a Pagar)">+ Lançar Ajuda de Custo</button>
        </div>
    </div>
    <div class="panel">
        <div class="ph">
            <div class="pt">📋 Ajudas Lançadas</div>
        </div>
        <div style="margin-bottom:10px"><input oninput="filtrarTabela(this,'am-tb')" placeholder="🔍 Buscar por empresa, motorista..." style="width:100%;max-width:400px;padding:9px 12px;border:1px solid var(--br);border-radius:8px;background:var(--cd2);color:var(--tx);font-size:13px" type="search" /></div>
        <div class="tw">
            <table>
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Empresa</th>
                        <th>Motorista</th>
                        <th>Telefone</th>
                        <th>Valor</th>
                        <th>Dados Bancários</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody id="am-tb"></tbody>
            </table>
        </div>
    </div>
</div>