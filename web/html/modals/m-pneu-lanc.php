<div class="mo" id="m-pneu-lanc"><div class="mbox">
<div class="mh"><div class="mt2">✏️ Editar Lançamento</div><button class="mc" onclick="closeM('m-pneu-lanc')">×</button></div>
<div class="mb2">
<input id="lanc-idx" type="hidden"/>
<p style="font-size:11px;color:var(--mt)">Corrija os dados deste lançamento do histórico de pneus.</p>
<div class="fr">
<div class="fg"><label>Nº Controle MH3</label><input id="lanc-num"/></div>
<div class="fg"><label>Tipo</label><select id="lanc-tipo"><option value="entrada">Entrada</option><option value="saida">Saída</option><option value="reforma">Reforma</option><option value="baixa">Baixa</option><option value="retorno">Retorno</option></select></div>
</div>
<div class="fr">
<div class="fg"><label>Placa/Destino</label><input id="lanc-destino"/></div>
<div class="fg"><label>Data</label><input id="lanc-dt" type="date"/></div>
</div>
<div class="fg"><label>Observações</label><textarea id="lanc-obs" rows="2"></textarea></div>
</div>
<div class="mf"><button class="btn bd" onclick="excluirLancPneu()">× Excluir</button><button class="btn bg" onclick="closeM('m-pneu-lanc')">Cancelar</button><button class="btn bp" onclick="saveLancPneu()">Salvar Alterações</button></div>
</div></div>
