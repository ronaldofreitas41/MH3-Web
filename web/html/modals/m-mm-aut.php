<div class="mo" id="m-mm-aut"><div class="mbox">
<div class="mh"><div class="mt2">📋 Autorizar Medição Manual</div><button class="mc" onclick="closeM('m-mm-aut')">×</button></div>
<div class="mb2">
<input id="mm-aut-eid" type="hidden"/>
<div id="mm-aut-info" style="background:var(--cd2);border-radius:8px;padding:10px;margin-bottom:12px;font-size:13px"></div>
<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Libera a geração de medição manual (sem contrato) para esta placa, usando um cliente já cadastrado. Enquanto a autorização estiver ativa, a placa fica com status <b>Alocado</b>.</p>
<div class="fg"><label>Cliente cadastrado *</label>
<select id="mm-aut-cli"><option value="">Selecionar cliente cadastrado...</option></select>
</div>
<div class="fr">
<div class="fg"><label>Vencimento / Prazo da autorização *</label><input id="mm-aut-venc" type="date"/></div>
<div class="fg"><label>Status da placa</label><input readonly="" style="background:var(--cd2);color:var(--mt);font-size:12px" value="Passa a Alocado"/></div>
</div>
<div class="fg"><label>Observações</label><textarea id="mm-aut-obs" placeholder="Ex.: condições, valor combinado, contato..." rows="2"></textarea></div>
</div>
<div class="mf">
<button class="btn bg" onclick="closeM('m-mm-aut')">Cancelar</button>
<button class="btn bp" onclick="salvarMedManAut()">Autorizar</button>
</div>
</div></div>
