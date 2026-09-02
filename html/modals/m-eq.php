<div class="mo" id="m-eq">
    <div class="mbox lg">
        <div class="mh">
            <div class="mt2" id="eq-mtitle">🚛 Veículo/Equipamento</div><button class="mc" onclick="closeM('m-eq')">×</button>
        </div>
        <div class="mb2"><input id="eq-eid" type="hidden" />
            <div class="tabs">
                <div class="tab on" onclick="stab(this,'teq-d')">Dados</div>
                <div class="tab" onclick="stab(this,'teq-fin')">Financeiro</div>
                <div class="tab" onclick="stab(this,'teq-impl')">Implemento</div>
                <div class="tab" onclick="stab(this,'teq-doc')">Documentos</div>
                <div class="tab" onclick="stab(this,'teq-fotos')">Fotos</div>
                <div class="tab" onclick="stab(this,'teq-arq')">Arquivos</div>
            </div>
            <div id="eq-restrito-aviso" style="display:none;background:#fff3cd;border:1px solid #f59e0b;border-radius:7px;padding:8px 11px;margin:6px 0;font-size:12px;color:#92400e">📎 Você tem acesso liberado a <b>Documentos, Fotos e Arquivos</b>. Para abrir <b>Dados, Financeiro</b> ou <b>Implemento</b>, clique na aba (🔒) e informe a senha de administrador.</div>
            <!-- ABA DADOS -->
            <div class="tab-p on" id="teq-d">
                <p style="font-size:11px;color:var(--red);margin-bottom:8px">* Campos obrigatórios</p>
                <div class="fr">
                    <div class="fg"><label>Placa *</label><input id="eq-pl" placeholder="ABC-1234" style="text-transform:uppercase" /></div>
                    <div class="fg"><label>Ano *</label><input id="eq-an" placeholder="2022" /></div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Chassi *</label><input id="eq-ch" placeholder="9BM..." /></div>
                    <div class="fg"><label>Renavam *</label><input id="eq-rv" placeholder="00000000000" /></div>
                    <div class="fg"><label>CRV</label><input id="eq-crv" placeholder="Certificado de Registro" /></div>
                    <div class="fg"><label>Empresa Proprietária</label>
                        <div style="display:flex;gap:6px">
                            <select id="eq-empresa" style="flex:1">
                                <option value="">Selecionar...</option>
                            </select>
                            <button class="btn bg btn-sm" onclick="novaEmpresa()" title="Cadastrar empresa" type="button">+</button>
                        </div>
                    </div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Marca</label><input data-ac="marcaVeiculo" id="eq-mk" placeholder="Selecione a cadastrada ou digite" /></div>
                    <div class="fg"><label>Modelo *</label><input id="eq-mo" placeholder="Accelo 815 CE" /></div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Status Frota</label><select id="eq-st">
                            <option value="disponivel">Disponível</option>
                            <option value="alocado">Alocado</option>
                            <option value="imobilizado">Imobilizado</option>
                            <option value="vendido">Vendido</option>
                            <option value="uso_empresa">Uso Empresa</option>
                        </select></div>
                </div>
                <div class="fr">
                    <div class="fg"><label>KM inicial</label><input id="eq-km" placeholder="0" type="number" /></div>
                    <div class="fg"><label>Horímetro inicial (h)</label><input id="eq-hr" placeholder="0" type="number" /></div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Condição *</label>
                        <div class="radio-row" style="margin-top:6px"><label><input checked="" name="eq-cond" type="radio" value="novo" /> Novo</label><label><input name="eq-cond" type="radio" value="usado" /> Usado</label></div>
                    </div>
                </div>
                <div class="fg"><label>Observações</label><textarea id="eq-ob"></textarea></div>
            </div>
            <!-- ABA FINANCEIRO DO VEÍCULO -->
            <div class="tab-p" id="teq-fin">
                <div class="fr">
                    <div class="fg"><label>Valor de Aquisição (R$) *</label><input id="eq-vaql" placeholder="0,00" step="0.01" type="number" /></div>
                    <div class="fg"><label>Data de Aquisição *</label><input id="eq-daql" type="date" /></div>
                </div>
                <div class="fg"><label>Situação Financeira *</label>
                    <select id="eq-situ" onchange="toggleParc()">
                        <option value="quitado">Quitado</option>
                        <option value="financiado">Financiado</option>
                        <option value="consorcio">Consórcio</option>
                    </select>
                </div>
                <div id="eq-parc-box" style="display:none">
                    <div class="fr">
                        <div class="fg"><label>Qtd. Parcelas *</label><input id="eq-nparc" min="1" placeholder="48" type="number" /></div>
                        <div class="fg"><label>Tipo de Parcela *</label>
                            <select id="eq-tparc" onchange="toggleParcTipo()">
                                <option value="fixa">Fixa</option>
                                <option value="variavel">Variável (lançar manual)</option>
                            </select>
                        </div>
                    </div>
                    <div id="eq-parc-fixa-box">
                        <div class="fg"><label>Valor da Parcela (R$) *</label><input id="eq-vparc" placeholder="0,00" step="0.01" type="number" /></div>
                    </div>
                    <div id="eq-parc-var-box" style="display:none">
                        <p style="font-size:12px;color:var(--mt);margin:8px 0">Informe valor e vencimento de cada parcela. Serão lançadas automaticamente em Contas a Pagar.</p>
                        <div id="eq-parc-var-lista" style="max-height:280px;overflow-y:auto;padding:4px 0"></div>
                        <button class="btn bg btn-sm" onclick="gerarCamposParc()" style="margin-top:6px" type="button">🔄 Gerar campos</button>
                    </div>
                    <div class="fr">
                        <div class="fg"><label>Parcelas Pagas</label><input id="eq-parcpg" min="0" placeholder="0" type="number" /></div>
                        <div class="fg"><label>Data 1ª Parcela</label><input id="eq-d1parc" type="date" /></div>
                    </div>
                    <div class="fg"><label>Banco/Financeira</label><input id="eq-banco" placeholder="Ex: Banco do Brasil, Votorantim..." /></div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px;margin-top:8px">
                    <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">📊 LEVANTAMENTO PATRIMONIAL</div>
                    <div class="fr">
                        <div class="fg"><label>Data do Levantamento</label><input id="eq-dt-levant" type="date" /></div>
                        <div class="fg"><label>Valor de Quitação Atual (R$)</label><input id="eq-vl-quitacao" placeholder="0,00" step="0.01" type="number" /></div>
                        <div class="fg"><label>Valor Atualizado (manual, opcional)</label><input id="eq-vl-atual" placeholder="0,00" step="0.01" type="number" /></div>
                    </div>
                    <div class="fr">
                        <div class="fg"><label>Desval. Período Ano 1-2 (% total)</label><input id="eq-desval12" oninput="calcDesvalEq()" placeholder="Ex: 20" step="0.1" type="number" /></div>
                        <div class="fg"><label>Desval. Período Ano 3-5 (% total)</label><input id="eq-desval35" oninput="calcDesvalEq()" placeholder="Ex: 40" step="0.1" type="number" /></div>
                        <div class="fg"><label>Valor Calculado <span id="eq-periodo-lbl" style="font-size:10px;color:var(--bl)"></span></label><input id="eq-vl-calc" readonly="" style="background:var(--cd2);font-weight:700;color:var(--bl)" /></div>
                    </div>
                    <p style="font-size:10px;color:var(--mt)">Informe a % TOTAL de desvalorização de cada período. O sistema verifica a idade do bem pela data de aquisição: até 2 anos aplica a % do período Ano 1-2; de 3 anos em diante aplica a % do período Ano 3-5. Desconto sobre o valor de compra.</p>
                </div>
            </div>
            <!-- ABA IMPLEMENTO -->
            <div class="tab-p" id="teq-impl">
                <div class="fg"><label>Possui implemento?</label><select id="eq-tem-impl" onchange="toggleImplemento()">
                        <option value="nao">Não</option>
                        <option value="sim">Sim</option>
                    </select></div>
                <div id="eq-impl-campos" style="display:none">
                    <div class="fg"><label>Tipo de Implemento</label>
                        <select id="eq-im">
                            <option value="">Sem implemento</option>
                            <option>Carroceria</option>
                            <option>Comboio</option>
                            <option>Pipa</option>
                            <option>Munck</option>
                            <option>Basculante</option>
                            <option>Retroescavadeira</option>
                            <option>Outro</option>
                        </select>
                    </div>
                    <div class="fr">
                        <div class="fg"><label>Marca do Implemento</label><input id="eq-im-mk" placeholder="Ex: Randon, Guerra..." /></div>
                        <div class="fg"><label>Modelo do Implemento</label><input id="eq-im-mo" placeholder="Ex: SR B5 2E" /></div>
                    </div>
                    <div class="fr">
                        <div class="fg"><label>Valor de Aquisição (R$)</label><input id="eq-im-vl" placeholder="0,00" step="0.01" type="number" /></div>
                        <div class="fg"><label>Data de Aquisição</label><input id="eq-im-dt" type="date" /></div>
                    </div>
                    <div class="fg"><label>Observações do Implemento</label><textarea id="eq-im-ob" rows="2"></textarea></div>
                </div>
            </div>
            <!-- ABA MOBILIZAÇÃO/DESMOBILIZAÇÃO -->
            <!-- ABA DOCUMENTOS -->
            <div class="tab-p" id="teq-doc">
                <div class="fr">
                    <div class="fg"><label>Venc. CRLV <span id="eq-crlv-alerta" style="color:var(--red);font-size:10px"></span></label>
                        <input id="eq-crlv" onchange="alertaVenc('eq-crlv','eq-crlv-alerta')" type="date" />
                    </div>
                    <div class="fg"><label>Venc. Licença/ANTT <span id="eq-antt-alerta" style="color:var(--red);font-size:10px"></span></label>
                        <input id="eq-antt" onchange="alertaVenc('eq-antt','eq-antt-alerta')" type="date" />
                    </div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Cronotacógrafo — Venc. Calibração <span id="eq-crono-alerta" style="color:var(--red);font-size:10px"></span></label>
                        <input id="eq-crono" onchange="alertaVenc('eq-crono','eq-crono-alerta')" type="date" />
                    </div>
                </div>
                <div class="fr">
                    <div class="fg"><label>🛡️ Seguro <span style="font-size:10px;color:var(--mt)">(cadastrado na aba Seguro)</span></label>
                        <div id="eq-seguro-info" style="padding:9px 11px;border:1px solid var(--br,#e2e8f0);border-radius:7px;background:var(--cd2,#f8fafc);font-size:12px;color:var(--mt,#64748b)">Abra um veículo já cadastrado para ver o seguro dele.</div>
                    </div>
                    <div class="fg"><label>Doc. Manual (descreva)</label><input id="eq-doc-man" placeholder="Ex: Autorização especial..." /></div>
                </div>
                <div class="fr">
                    <div class="fg"><label>Venc. Doc. Manual <span id="eq-doc-man-alerta" style="color:var(--red);font-size:10px"></span></label>
                        <input id="eq-doc-man-vc" onchange="alertaVenc('eq-doc-man-vc','eq-doc-man-alerta')" type="date" />
                    </div>
                    <div class="fg"></div>
                </div>
            </div>
            <div class="tab-p" id="teq-fotos">
                <p style="font-size:10px;color:var(--mt);margin-bottom:7px">Fotos do veículo (JPG, PNG, GIF)</p>
                <div class="foto-grid" id="eq-foto-grid"><label class="foto-add" for="eq-foto-inp">+</label><input accept="image/*" id="eq-foto-inp" multiple="" onchange="addEqFotos(this)" style="display:none" type="file" /></div>
            </div>
            <div class="tab-p" id="teq-arq">
                <p style="font-size:10px;color:var(--mt);margin-bottom:7px">Documentos (PDF, imagens)</p>
                <div id="eq-arq-list"></div><label class="btn bg btn-sm" for="eq-arq-inp" style="cursor:pointer;margin-top:7px;display:inline-flex">📎 Anexar</label><input accept=".pdf,.jpg,.jpeg,.png,.gif" id="eq-arq-inp" multiple="" onchange="addEqArq(this)" style="display:none" type="file" />
            </div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-eq')">Cancelar</button><button class="btn bp" onclick="saveEq()">Salvar Veículo/Equipamento</button></div>
    </div>
</div>