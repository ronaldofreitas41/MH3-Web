<div class="mo" id="m-mob">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📸 Nova Mobilização</div><button class="mc" onclick="closeM('m-mob')">×</button>
        </div>
        <div class="mb2">
            <input id="mob-eid" type="hidden" />
            <div class="fg"><label>Tipo de Operação *</label>
                <select id="mob-tipo" onchange="toggleTipoMob()">
                    <option value="mobilizacao">📤 MOBILIZAÇÃO (saída do veículo/equipamento)</option>
                    <option value="desmobilizacao">📥 DESMOBILIZAÇÃO (retorno do veículo/equipamento)</option>
                </select>
            </div>
            <div class="fg"><label>Contrato * <span style="font-size:10px;color:var(--mt)">(placa, cliente e cidade vêm do contrato)</span></label>
                <select id="mob-contrato" onchange="puxarDadosContratoMob()">
                    <option value="">Selecionar contrato...</option>
                </select>
            </div>
            <div class="fr">
                <div class="fg"><label>Placa *</label><input id="mob-placa" readonly="" style="background:var(--cd2)" /></div>
                <div class="fg"><label>Cliente</label><input id="mob-cliente" readonly="" style="background:var(--cd2)" /></div>
            </div>
            <div class="fg"><label>Cidade</label><input id="mob-local" readonly="" style="background:var(--cd2)" /></div>
            <div class="fr">
                <div class="fg" id="mob-saida-box"><label>Data de Saída *</label><input id="mob-saida" onchange="sugereStatusMob()" type="date" /></div>
                <div class="fg" id="mob-chegada-box"><label>Data de Chegada/Retorno *</label><input id="mob-chegada" onchange="sugereStatusMob()" type="date" /></div>
            </div>
            <div class="fg"><label>Status *</label>
                <select id="mob-status">
                    <option value="aguardando">⏳ Aguardando</option>
                    <option value="vigente">🟢 Vigente</option>
                    <option value="finalizado">✅ Finalizado</option>
                </select>
            </div>
            <div class="fg"><label>Observações</label><textarea id="mob-obs" rows="2"></textarea></div>
            <div style="margin-top:12px">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">🔵 PNEUS POR EIXO</div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:8px">
                    <div style="font-size:11px;font-weight:700;color:var(--mt)">1º EIXO</div>
                    <div class="fr">
                        <div class="fg"><label>Marca</label><input data-ac="marcaPneu" id="mob-p1-mk" /></div>
                        <div class="fg"><label>Nº MH3</label><input id="mob-p1-num" /></div>
                        <div class="fg"><label>Medida</label><input id="mob-p1-med" /></div>
                        <div class="fg"><label>Reformado</label><select id="mob-p1-ref">
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select></div>
                    </div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:8px">
                    <div style="font-size:11px;font-weight:700;color:var(--mt)">2º EIXO</div>
                    <div class="fr">
                        <div class="fg"><label>Marca</label><input data-ac="marcaPneu" id="mob-p2-mk" /></div>
                        <div class="fg"><label>Nº MH3 (até 4)</label><input id="mob-p2-num" /></div>
                        <div class="fg"><label>Medida</label><input id="mob-p2-med" /></div>
                        <div class="fg"><label>Reformado</label><select id="mob-p2-ref">
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select></div>
                    </div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:8px">
                    <div style="font-size:11px;font-weight:700;color:var(--mt)">3º EIXO</div>
                    <div class="fr">
                        <div class="fg"><label>Marca</label><input data-ac="marcaPneu" id="mob-p3-mk" /></div>
                        <div class="fg"><label>Nº MH3 (até 4)</label><input id="mob-p3-num" /></div>
                        <div class="fg"><label>Medida</label><input id="mob-p3-med" /></div>
                        <div class="fg"><label>Reformado</label><select id="mob-p3-ref">
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select></div>
                    </div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px">
                    <div style="font-size:11px;font-weight:700;color:var(--mt)">4º EIXO (opcional)</div>
                    <div class="fr">
                        <div class="fg"><label>Marca</label><input data-ac="marcaPneu" id="mob-p4-mk" /></div>
                        <div class="fg"><label>Nº MH3 (até 4)</label><input id="mob-p4-num" /></div>
                        <div class="fg"><label>Medida</label><input id="mob-p4-med" /></div>
                        <div class="fg"><label>Reformado</label><select id="mob-p4-ref">
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select></div>
                    </div>
                </div>
                <div style="background:var(--cd2);border-radius:8px;padding:10px;margin-top:8px">
                    <div style="font-size:11px;font-weight:700;color:var(--mt)">🛞 ESTEPE</div>
                    <div class="fr">
                        <div class="fg"><label>Marca</label><input data-ac="marcaPneu" id="mob-pe-mk" /></div>
                        <div class="fg"><label>Nº MH3</label><input id="mob-pe-num" /></div>
                        <div class="fg"><label>Medida</label><input id="mob-pe-med" /></div>
                        <div class="fg"><label>Reformado</label><select id="mob-pe-ref">
                                <option value="nao">Não</option>
                                <option value="sim">Sim</option>
                            </select></div>
                    </div>
                </div>
            </div>
            <div style="margin-top:12px">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">☑️ CHECKLIST</div>
                <div class="fg"><label>Modelo de Checklist</label>
                    <select id="mob-checklist" onchange="carregarChecklistMob()">
                        <option value="">Sem checklist</option>
                    </select>
                </div>
                <div id="mob-cl-items" style="margin-top:8px"></div>
            </div>
            <div style="margin-top:12px">
                <div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">📸 FOTOS</div>
                <div class="foto-grid" id="mob-foto-grid">
                    <label class="foto-add" for="mob-foto-inp">+</label>
                    <input accept="image/*" id="mob-foto-inp" multiple="" onchange="addMobModalFoto(this)" style="display:none" type="file" />
                </div>
            </div>
        </div>
        <div class="mf"><button class="btn" onclick="abrirEnvioEmail('mobilizacao')" style="background:var(--cy);color:#fff">📧 E-mail</button><button class="btn bg" onclick="closeM('m-mob')">Cancelar</button><button class="btn bp" onclick="saveMob()">Salvar Mobilização</button></div>
    </div>
</div>