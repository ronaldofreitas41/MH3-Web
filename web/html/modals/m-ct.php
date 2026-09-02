<div class="mo" id="m-ct"><div class="mbox">
<div class="mh"><div class="mt2" id="ct-mtitle">📋 Contrato</div><button class="mc" onclick="closeM('m-ct')">×</button></div>
<div class="mb2"><input id="ct-eid" type="hidden"/>
<div class="fg"><label>Cliente * <span style="font-size:10px;color:var(--mt)">(cadastre antes em Clientes)</span></label>
<select id="ct-cliente-sel" onchange="puxarDadosCliente()"><option value="">Selecionar cliente cadastrado...</option></select>
<input id="ct-cl" type="hidden"/>
</div>
<div class="fg"><label>Obra / Localização</label><input id="ct-ob"/></div>
<div class="fr"><div class="fg"><label>Veículo/Equipamento</label><select id="ct-eq"><option value="">Selecionar...</option></select></div><div class="fg"><label>Turno(s)</label><select id="ct-tn" onchange="autoH()"><option value="1">1 turno</option><option value="2">2 turnos</option><option value="3">3 turnos</option></select></div></div>
<div class="fr"><div class="fg"><label>Horas Garantidas/Mês</label><input id="ct-hr" placeholder="200" type="number"/></div><div class="fg"><label>Valor H.Extra (R$/h)</label><input id="ct-vhe" type="number" value="0"/></div></div>
<div class="fr"><div class="fg"><label>Tipo de Cobrança *</label>
<select id="ct-tipo-vl" onchange="calcSaldoCt()">
<option value="mensal">Valor Mensal</option>
<option value="hora">Valor por Hora</option>
</select>
</div>
<div class="fg"><label>Valor (R$) *</label><input id="ct-vl" onchange="calcSaldoCt()" placeholder="0,00" step="0.01" type="number"/></div><div class="fg"><label>Ciclo de Medição</label><select id="ct-ci"><option value="">Selecionar...</option></select></div></div>
<div class="fr"><div class="fg"><label>Data de Início</label><input id="ct-ini" type="date"/></div><div class="fg"><label>Tempo do Contrato (meses) *</label><input id="ct-dur" min="1" onchange="calcSaldoCt()" placeholder="6" type="number"/></div></div>
<div class="fr"><div class="fg"><label>Mobilização</label><select id="ct-mob"><option>Por conta do cliente</option><option>Por conta da MH3</option><option>Incluso no contrato</option></select></div><div class="fg"><label>Assinatura</label><select id="ct-ass"><option value="assinado">Assinado</option><option value="pendente">Pendente</option></select></div></div>
<div style="background:var(--cd2);border-radius:8px;padding:12px;margin:10px 0">
<div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:8px">💰 SALDO DO CONTRATO</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;text-align:center">
<div><div style="font-size:10px;color:var(--mt)">VALOR TOTAL</div><div id="ct-saldo-total" style="font-size:16px;font-weight:700;color:var(--bl)">R$ 0,00</div></div>
<div><div style="font-size:10px;color:var(--mt)">MEDIÇÕES GERADAS</div><div id="ct-saldo-medido" style="font-size:16px;font-weight:700;color:var(--or)">R$ 0,00</div></div>
<div><div style="font-size:10px;color:var(--mt)">SALDO ATUAL</div><div id="ct-saldo-atual" style="font-size:16px;font-weight:700;color:var(--gn)">R$ 0,00</div></div>
</div>
<p style="font-size:10px;color:var(--mt);margin-top:8px;text-align:center">Fórmula: Valor × Tempo − Medições = Saldo</p>
</div>
<div class="fg"><label>Observações / Seguro</label><textarea id="ct-obs"></textarea></div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-ct')">Cancelar</button><button class="btn bp" onclick="saveCt()">Salvar</button></div>
</div></div>
