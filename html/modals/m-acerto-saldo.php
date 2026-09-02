<div class="mo" id="m-acerto-saldo"><div class="md">
<div class="mh"><div class="mt2">⚖️ Acerto de Saldo</div><button class="x" onclick="closeM('m-acerto-saldo')">×</button></div>
<div class="mb">
<input id="as-id" type="hidden"/>
<div class="ab a-yw" style="margin-bottom:10px;font-size:11px">Ajuste manual do saldo da conta. Exige <b>motivo</b> e a <b>senha do usuário logado</b> — tudo fica registrado na auditoria.</div>
<div class="fr">
<div class="fg"><label>Conta</label><input id="as-conta" readonly="" style="opacity:.8"/></div>
<div class="fg"><label>Saldo atual</label><input id="as-atual" readonly="" style="opacity:.8"/></div>
</div>
<div class="fg"><label>Qual saldo ajustar?</label><select id="as-qual" onchange="_acertoTrocaQual()"><option value="saldo">Saldo corrente</option><option value="saldoPA">Saldo poupança / aplicação</option></select></div>
<div class="fg"><label>Novo saldo (R$) *</label><input id="as-novo" inputmode="decimal" placeholder="Ex: 1500,00"/></div>
<div class="fg"><label>Motivo do acerto * (obrigatório)</label><textarea id="as-motivo" placeholder="Ex: conciliação bancária, tarifa não lançada, correção de saldo inicial..." rows="2"></textarea></div>
<div class="fg"><label id="as-senha-lbl">Sua senha *</label><input id="as-senha" placeholder="senha do usuário logado" type="password"/></div>
<p id="as-status" style="font-size:11px;color:var(--rd);margin-top:2px"></p>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-acerto-saldo')">Cancelar</button><button class="btn bp" onclick="confirmarAcertoSaldo()">⚖️ Confirmar acerto</button></div>
</div></div>
