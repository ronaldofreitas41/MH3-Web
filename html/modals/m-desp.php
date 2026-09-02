<div class="mo" id="m-desp">
    <div class="mbox">
        <div class="mh">
            <div class="mt2" id="desp-mtitle">💸 Despesa / Compra</div><button class="mc" onclick="closeM('m-desp')">×</button>
        </div>
        <div class="mb2"><input id="desp-eid" type="hidden" />
            <div class="fr">
                <div class="fg"><label>Data</label><input id="desp-dt" type="date" /></div>
                <div class="fg"><label>Categoria</label><select id="desp-cat">
                        <option>Combustível</option>
                        <option>Manutenção</option>
                        <option>Pneus</option>
                        <option>Seguros</option>
                        <option>IPVA/Licenciamento</option>
                        <option>Administrativo</option>
                        <option>Salários</option>
                        <option>Outros</option>
                    </select></div>
            </div>
            <div class="fg"><label>Descrição</label><input id="desp-desc" placeholder="Descrição da despesa" /></div>
            <div class="fr">
                <div class="fg"><label>Placa / Veículo/Equipamento</label><select id="desp-placa">
                        <option value="">Geral (sem placa)</option>
                    </select></div>
                <div class="fg"><label>Fornecedor</label><input id="desp-forn" placeholder="Nome do fornecedor" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor (R$)</label><input id="desp-vl" type="number" /></div>
                <div class="fg"><label>Vencimento</label><input id="desp-vc" type="date" /></div>
            </div>
            <div class="fg"><label>Documentação</label>
                <div class="radio-row" style="margin-top:3px"><label><input id="dd-nf" name="desp-doc" type="radio" value="NF" /> Nota Fiscal</label><label><input id="dd-rec" name="desp-doc" type="radio" value="Recibo" /> Recibo</label><label><input checked="" id="dd-avul" name="desp-doc" type="radio" value="Avulso" /> Pagamento Avulso</label></div>
            </div>
            <div class="fg"><label>Nº Documento (NF/Recibo)</label><input id="desp-ndoc" placeholder="Opcional" /></div>
            <div class="fr">
                <div class="fg"><label>Forma de Pagamento</label>
                    <select id="desp-pag" onchange="togglePrazoDesp()">
                        <option value="eletronico">Pagamento Eletrônico (PIX/Cartão/TED)</option>
                        <option value="prazo">A Prazo (boleto/parcelado)</option>
                    </select>
                </div>
                <div class="fg" id="desp-prazo-box" style="display:none"><label>Prazo</label>
                    <select id="desp-prazo-sel" onchange="togglePrazoManualDesp()">
                        <option value="">Selecionar prazo cadastrado...</option>
                        <option value="__manual__">✏️ Digitar prazo manual</option>
                    </select>
                </div>
                <div class="fg" id="desp-prazo-man-box" style="display:none"><label>Prazo Manual (dias separados por /)</label>
                    <input id="desp-prazo-man" placeholder="Ex: 30/60/90 ou 28/56" />
                </div>
                <div class="fg"><label>Status</label><input readonly="" style="background:var(--cd2);color:var(--mt);font-size:12px" value="Pendente (Financeiro confirma o pagamento)" /><input id="desp-st" type="hidden" value="pendente" /></div>
            </div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-desp')">Cancelar</button><button class="btn bp" onclick="saveDesp()">Salvar</button></div>
    </div>
</div>