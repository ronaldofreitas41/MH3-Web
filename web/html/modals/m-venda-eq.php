<div class="mo" id="m-venda-eq"><div class="mbox">
<div class="mh"><div class="mt2">💰 Venda de Veículo/Equipamento/Implemento</div><button class="mc" onclick="closeM('m-venda-eq')">×</button></div>
<div class="mb2">
<input id="veq-eid" type="hidden"/>
<div id="veq-info" style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px"></div>
<div class="fg"><label>O que está sendo vendido? *</label>
<select id="veq-tipo">
<option value="equip">Veículo/Equipamento</option>
<option value="impl">Implemento</option>
<option value="ambos">Veículo/Equipamento + Implemento</option>
</select>
</div>
<div style="background:var(--cd2);border-radius:8px;padding:10px;margin:8px 0">
<div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">💳 CONDIÇÕES DA VENDA</div>
<div class="fr">
<div class="fg"><label>Forma de Recebimento *</label>
<select id="veq-cond" onchange="toggleCondVendaEq()">
<option value="avista">À Vista</option>
<option value="parcelado">Parcelado</option>
</select>
</div>
<div class="fg" id="veq-parc-box" style="display:none"><label>Nº de Parcelas</label><input id="veq-nparc" min="2" placeholder="3" type="number"/></div>
<div class="fg"><label>1º Vencimento</label><input id="veq-vc1" type="date"/></div>
</div>
<p style="font-size:10px;color:var(--mt)">A venda entra automaticamente no Contas a Receber conforme estas condições.</p>
</div>
<div class="fr">
<div class="fg"><label>Comprador *</label><input id="veq-comprador" placeholder="Nome do comprador"/></div>
<div class="fg"><label>CPF/CNPJ</label><input id="veq-doc" oninput="fmtDocFiscal(this)" placeholder="000.000.000-00"/></div>
</div>
<div class="fr">
<div class="fg"><label>Valor de Venda (R$) *</label><input id="veq-vl" placeholder="0,00" step="0.01" type="number"/></div>
<div class="fg"><label>Data da Venda *</label><input id="veq-dt" type="date"/></div>
</div>
<div class="fr">
<div class="fg"><label>Forma de Pagamento</label><select id="veq-pag"><option>À Vista</option><option>PIX</option><option>Financiado</option><option>Troca/Permuta</option></select></div>
<div class="fg"><label>Status Recebimento</label><input id="veq-st" readonly="" style="background:var(--cd2);color:var(--mt);font-size:12px" value="Pendente (Financeiro confirma)"/></div><div style="display:none"><input id="veq-st-val" type="hidden" value="pendente"/></div></div>
</div>
<div class="fg"><label>Observações</label><textarea id="veq-ob" rows="2"></textarea></div>
<div class="fg"><label>🔒 Sua senha (confirmação obrigatória)</label><input id="veq-senha" placeholder="sua senha de acesso" type="password"/></div>
</div>
<div class="mf">
<button class="btn bg" onclick="closeM('m-venda-eq')">Cancelar</button>
<button class="btn bp" onclick="confirmarVendaEq()">Confirmar Venda</button>
</div>
</div>
