<div class="mo" id="m-tratativa"><div class="mbox">
<div class="mh"><div class="mt2" id="trat-mtitle">🤝 Nova Tratativa</div><button class="mc" onclick="closeM('m-tratativa')">×</button></div>
<div class="mb2">
<input id="trat-eid" type="hidden"/>
<div class="fr">
<div class="fg"><label>Data</label><input id="trat-dt" type="date"/></div>
<div class="fg"><label>Com quem <span style="font-size:10px;color:var(--mt)">(ex: José)</span></label><input class="no-upper" data-no-upper="" id="trat-com" placeholder="Nome da pessoa"/></div>
</div>
<div class="fg"><label>Veículo / Placa <span style="font-size:10px;color:var(--mt)">(da lista ou digite manual)</span></label>
<select id="trat-veic-sel" onchange="tratVeicTrocar(this.value)" style="margin-bottom:6px"><option value="">— Selecionar placa cadastrada —</option><option value="__manual__">✏️ Outro (digitar manual)</option></select>
<input id="trat-veic-manual" placeholder="Digite o veículo ou placa" style="display:none"/>
</div>
<div class="fg"><label>Tratativa — o que foi combinado</label><textarea id="trat-nota" placeholder="Ex: Combinei com José o conserto do motor do caminhão..." rows="4"></textarea></div>
<div class="fr">
<div class="fg"><label>Prazo / Condição de pagamento <span style="font-size:10px;color:var(--mt)">(opcional)</span></label><input class="no-upper" data-no-upper="" id="trat-prazo" placeholder="Ex: Pagar com 30 dias"/></div>
<div class="fg"><label>Status</label><select id="trat-st"><option value="pendente">⏳ Pendente</option><option value="resolvida">✅ Resolvida</option></select></div>
</div>
<div style="display:flex;gap:8px;margin-top:16px">
<button class="btn bp" onclick="saveTratativa()" style="flex:1">Salvar Tratativa</button>
<button class="btn bg" onclick="closeM('m-tratativa')">Cancelar</button>
</div>
</div>
</div></div>
