<div class="mo" id="m-usr">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">👤 Usuário</div><button class="mc" onclick="closeM('m-usr')">×</button>
        </div>
        <div class="mb2">
            <input id="usr-eid" type="hidden" />
            <div class="fr">
                <div class="fg"><label>Nome *</label><input id="usr-nm" placeholder="Nome completo" /></div>
                <div class="fg"><label>Login *</label><input id="usr-lg" placeholder="login sem espaços" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Senha</label><input id="usr-pw" placeholder="••••••••" type="password" /></div>
                <div class="fg"><label>Perfil</label><select id="usr-pf" onchange="setPP()">
                        <option value="admin">Administrador</option>
                        <option value="operacional">Operacional</option>
                        <option value="motorista">Motorista</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="custom">Personalizado</option>
                    </select></div>
            </div>
            <div class="divider"></div>
            <div id="perm-list">
                <div style="font-size:11px;font-weight:700;color:var(--mt);margin:4px 0 8px">MÓDULOS E AÇÕES</div>
                <p style="font-size:10px;color:var(--mt);margin-bottom:8px">Para cada módulo: marque o que o usuário pode fazer</p>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Dashboard</div>
                    <div class="toggle on" id="pr-dash" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">💬 WhatsApp</div>
                    <div class="toggle" id="pr-whatsapp" onclick="this.classList.toggle('on')"></div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:8px;margin-bottom:8px">
                    <table style="width:100%;font-size:10px">
                        <thead>
                            <tr style="color:var(--mt)">
                                <th style="text-align:left">Módulo</th>
                                <th>Ver</th>
                                <th>Criar</th>
                                <th>Editar</th>
                                <th>Excluir</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Frota</td>
                                <td style="text-align:center"><input checked="" id="pr-frota" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-frota-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-frota-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-frota-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Manutenções/OS</td>
                                <td style="text-align:center"><input checked="" id="pr-manut" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-manut-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-manut-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-manut-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Contratos</td>
                                <td style="text-align:center"><input checked="" id="pr-cts" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-cts-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-cts-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-cts-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Propostas</td>
                                <td style="text-align:center"><input id="pr-prop" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prop-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prop-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prop-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Tratativas</td>
                                <td style="text-align:center"><input id="pr-tratativas" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-tratativas-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-tratativas-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-tratativas-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Medições</td>
                                <td style="text-align:center"><input checked="" id="pr-meds" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-meds-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-meds-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-meds-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Vendas</td>
                                <td style="text-align:center"><input checked="" id="pr-vend" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-vend-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-vend-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-vend-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Estoque</td>
                                <td style="text-align:center"><input checked="" id="pr-estq" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-estq-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-estq-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-estq-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Despesas</td>
                                <td style="text-align:center"><input checked="" id="pr-desp" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-desp-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-desp-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-desp-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Financeiro</td>
                                <td style="text-align:center"><input checked="" id="pr-fin" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-fin-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-fin-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-fin-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Resultado</td>
                                <td style="text-align:center"><input checked="" id="pr-resultado" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-resultado-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-resultado-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-resultado-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Pneus</td>
                                <td style="text-align:center"><input checked="" id="pr-pneus" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-pneus-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input checked="" id="pr-pneus-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-pneus-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Clientes</td>
                                <td style="text-align:center"><input id="pr-clientes" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-clientes-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-clientes-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-clientes-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Mobilização</td>
                                <td style="text-align:center"><input id="pr-mob" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-mob-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-mob-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-mob-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Funcionários</td>
                                <td style="text-align:center"><input id="pr-func" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-func-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-func-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-func-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Prejuízos</td>
                                <td style="text-align:center"><input id="pr-prej" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prej-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prej-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-prej-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Saída de Material</td>
                                <td style="text-align:center"><input id="pr-sm" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sm-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sm-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sm-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Sistema (Tabelas/Prazos)</td>
                                <td style="text-align:center"><input id="pr-sist" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sist-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sist-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-sist-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Contas a Pagar</td>
                                <td style="text-align:center"><input id="pr-cpagar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-cpagar-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-cpagar-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-cpagar-excluir" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Contas a Receber</td>
                                <td style="text-align:center"><input id="pr-creceber" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-creceber-criar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-creceber-editar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-creceber-excluir" type="checkbox" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Usuários &amp; Config</div>
                    <div class="toggle" id="pr-adm" onclick="this.classList.toggle('on')"></div>
                </div>
                <div style="font-size:11px;font-weight:700;color:var(--mt);margin:12px 0 8px">PERMISSÕES ESPECÍFICAS</div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Ver preço de custo</div>
                    <div class="toggle" id="pr-custo" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Alterar preço de venda</div>
                    <div class="toggle" id="pr-preco" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Dar desconto em vendas</div>
                    <div class="toggle" id="pr-desc" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Alterar estoque (entrada/saída)</div>
                    <div class="toggle" id="pr-estq-edit" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Vender veículo/equipamento</div>
                    <div class="toggle" id="pr-venda-eq" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">Editar pneus (estoque e lançamentos)</div>
                    <div class="toggle" id="pr-pneu-edit" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">🛡️ Acessar a aba Seguro</div>
                    <div class="toggle" id="pr-seguro" onclick="this.classList.toggle('on')"></div>
                </div>
                <div class="perm-row">
                    <div style="font-size:11px;font-weight:500">📎 Editar Documentos/Fotos/Arquivos do veículo<br /><span style="font-size:9px;color:var(--mt)">(não altera Dados, Financeiro nem Implemento)</span></div>
                    <div class="toggle" id="pr-doc-veiculo" onclick="this.classList.toggle('on')"></div>
                </div>
                <div style="font-size:11px;font-weight:700;color:var(--mt);margin:12px 0 8px">RELATÓRIOS — VER E IMPRIMIR</div>
                <div style="background:var(--cd2);border-radius:8px;padding:8px;margin-bottom:8px">
                    <table style="width:100%;font-size:10px">
                        <thead>
                            <tr style="color:var(--mt)">
                                <th style="text-align:left">Relatório</th>
                                <th>Ver</th>
                                <th>Imprimir</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Financeiro</td>
                                <td style="text-align:center"><input id="pr-rel-fin" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-fin-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">OS/Manutenções</td>
                                <td style="text-align:center"><input id="pr-rel-os" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-os-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Frota</td>
                                <td style="text-align:center"><input id="pr-rel-frota" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-frota-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Resultado</td>
                                <td style="text-align:center"><input id="pr-rel-resultado" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-resultado-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Estoque</td>
                                <td style="text-align:center"><input id="pr-rel-estq" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-estq-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Contas a Pagar</td>
                                <td style="text-align:center"><input id="pr-rel-cpagar" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-cpagar-imp" type="checkbox" /></td>
                            </tr>
                            <tr>
                                <td style="text-align:left;padding:3px 0">Contas a Receber</td>
                                <td style="text-align:center"><input id="pr-rel-creceber" type="checkbox" /></td>
                                <td style="text-align:center"><input id="pr-rel-creceber-imp" type="checkbox" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div style="background:var(--cd2);border-radius:8px;padding:12px;margin-top:10px">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">⭐ ACESSOS EXTRAS (selecione o que este usuário pode ver/fazer)</div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:12px">
                    <label><input id="pr-contas-dia" style="width:auto;margin-right:6px" type="checkbox" />Ver Contas do Dia (a pagar/receber)</label>
                    <label><input id="pr-aniversarios" style="width:auto;margin-right:6px" type="checkbox" />Ver Aniversários de Funcionários</label>
                    <label><input id="pr-confirma-ajuda" style="width:auto;margin-right:6px" type="checkbox" />Confirmar Ajudas Recorrentes</label>
                    <label><input id="pr-motivacao" style="width:auto;margin-right:6px" type="checkbox" />Ver Mensagem de Motivação</label>
                    <label><input id="pr-kpi-fin" style="width:auto;margin-right:6px" type="checkbox" />Ver Indicadores Financeiros (KPIs)</label>
                    <label><input id="pr-contas-banco" style="width:auto;margin-right:6px" type="checkbox" />Acessar Contas Bancárias MH3</label>
                    <label><input id="pr-enviar-email" style="width:auto;margin-right:6px" type="checkbox" />Enviar e-mails (cobrança, OS, documentos)</label>
                    <label><input id="pr-backup-manual" style="width:auto;margin-right:6px" type="checkbox" />Fazer Backup Manual</label>
                    <label><input id="pr-exportar" style="width:auto;margin-right:6px" type="checkbox" />Exportar/Baixar Dados</label>
                    <label><input id="pr-ajuda-custo" style="width:auto;margin-right:6px" type="checkbox" />Lançar Ajuda de Custo</label>
                    <label><input id="pr-ver-auditoria" style="width:auto;margin-right:6px" type="checkbox" />Ver Auditoria/Logs</label>
                    <label><input id="pr-ver-resultado-placa" style="width:auto;margin-right:6px" type="checkbox" />Ver Resultado por Placa</label>
                    <label><input id="pr-gerenciar-usuarios" style="width:auto;margin-right:6px" type="checkbox" />Gerenciar Usuários</label>
                </div>
            </div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-usr')">Cancelar</button><button class="btn bp" onclick="saveUsr()">Salvar</button></div>
    </div>
</div>