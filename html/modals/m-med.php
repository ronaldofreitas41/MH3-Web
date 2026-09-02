<div class="mo" id="m-med">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📐 Medição</div><button class="mc" onclick="closeM('m-med')">×</button>
        </div>
        <div class="mb2"><input id="med-eid" type="hidden" />
            <div class="fg"><label>Tipo de Medição</label>
                <select id="med-tipo" onchange="togMedTipo()">
                    <option value="cadastrado">Cadastrado (pelo contrato)</option>
                    <option value="manual">Manual (placa autorizada pelo administrador)</option>
                </select>
            </div>
            <div class="fr">
                <div class="fg" id="med-ct-wrap"><label>Contrato</label><select id="med-ct" onchange="autoFillMed();numMedicaoAuto()">
                        <option value="">Selecionar...</option>
                    </select></div>
                <div class="fg" id="med-placa-man-wrap" style="display:none"><label>Placa autorizada</label><select id="med-placa-man" onchange="autoFillMedMan()">
                        <option value="">Selecionar placa autorizada...</option>
                    </select></div>
                <div class="fg"><label>Nº da Medição <span style="font-size:10px;color:var(--mt)">(automático pelo contrato)</span></label>
                    <input id="med-num" placeholder="Selecione o contrato" readonly="" style="background:var(--cd2);font-weight:700" />
                </div>
                <div class="fg"><label>Mês Ref.</label><input id="med-ms" type="month" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Período De</label><input id="med-de" type="date" /></div>
                <div class="fg"><label>Período Até</label><input id="med-at" type="date" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Horas Medidas</label><input id="med-hr" placeholder="200" type="number" /></div>
                <div class="fg"><label>Horas Extras (h)</label><input id="med-he" oninput="calcMed()" type="number" value="0" /></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Valor Base (R$)</label><input id="med-vl" oninput="calcMed()" type="number" /></div>
                <div class="fg"><label>Valor H.Extra (R$/h)</label><input id="med-vhe" oninput="calcMed()" type="number" value="0" /></div>
            </div>
            <div class="fg"><label>Desconto Manual (R$)</label><input id="med-dc" oninput="calcMed()" type="number" value="0" /></div>
            <div class="fg" style="margin-top:4px"><label>Incluir venda (Avaria / Reparos)</label>
                <div style="display:flex;gap:6px"><input id="med-vd-num" onkeydown="if(event.key==='Enter'){event.preventDefault();medIncluirVenda();}" placeholder="Nº da venda — ex.: VD-00108 ou 108" style="flex:1" /><button class="btn bp btn-sm" onclick="medIncluirVenda()" type="button">+ Incluir</button></div>
                <div id="med-vd-lista" style="margin-top:6px"></div>
            </div>
            <div style="background:var(--cd2);border:1px solid var(--br);border-radius:5px;padding:9px;margin:5px 0">
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--mt);margin-bottom:3px"><span>Subtotal</span><span id="med-sub">R$ 0,00</span></div>
                <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--red);margin-bottom:3px"><span>— Desconto</span><span id="med-dc-show">R$ 0,00</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--br);padding-top:5px"><span style="font-size:11px;font-weight:600">Total</span><span id="med-tot-p" style="font-family:'Bebas Neue';font-size:22px;color:var(--gn)">R$ 0,00</span></div>
            </div>
            <div class="fr">
                <div class="fg"><label>Vencimento</label><input id="med-vc" type="date" /></div>
                <div class="fg"><label>Status</label><select id="med-st">
                        <option value="pendente">Pendente</option>
                        <option value="enviada">Enviada</option>
                        <option value="aprovada">Aprovada</option>
                    </select>
                    <p style="font-size:10px;color:var(--mt);margin-top:4px">ℹ️ Aprovada → entra automático em Contas a Receber e Fluxo de Caixa. Recebimento é confirmado pelo Financeiro.</p>
                </div>
            </div>
        </div>
        <div class="mf"><button class="btn" onclick="abrirEnvioEmail('medicao')" style="background:var(--cy);color:#fff">📧 E-mail</button><button class="btn bg" onclick="closeM('m-med')">Cancelar</button><button class="btn bp" onclick="saveMed()">Salvar</button></div>
    </div>
</div>