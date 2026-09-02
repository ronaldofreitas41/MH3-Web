<div class="mo" id="m-func"><div class="mbox lg">
<div class="mh"><div class="mt2">👷 Funcionário</div><button class="mc" onclick="closeM('m-func')">×</button></div>
<div class="mb2"><input id="func-eid" type="hidden"/>
<div class="tabs">
<div class="tab on" onclick="stab(this,'tf-dados')">Dados Pessoais</div>
<div class="tab" onclick="stab(this,'tf-prof')">Profissional</div>
<div class="tab" onclick="stab(this,'tf-seguro')">Salário e Seguro</div>
<div class="tab" onclick="stab(this,'tf-fotos')">Fotos</div>
<div class="tab" onclick="stab(this,'tf-docs')">Documentos</div>
</div>
<!-- DADOS PESSOAIS -->
<div class="tab-p on" id="tf-dados">
<div class="fg"><label>Nome Completo *</label><input id="func-nome" placeholder="NOME COMPLETO"/></div>
<div class="fr">
<div class="fg"><label>CPF *</label><input id="func-cpf" oninput="fmtDocFiscal(this)" placeholder="000.000.000-00"/></div>
<div class="fg"><label>RG</label><input id="func-rg" placeholder="MG-00.000.000"/></div>
</div>
<div class="fr">
<div class="fg"><label>CNH</label><input id="func-cnh" placeholder="Número da CNH"/></div>
<div class="fg"><label>Validade CNH <span id="func-cnh-alerta" style="color:var(--red);font-size:10px"></span></label><input id="func-cnh-val" onchange="alertaVenc('func-cnh-val','func-cnh-alerta')" type="date"/></div>
</div>
<div class="fg"><label>Endereço</label><input id="func-end" placeholder="Rua, número, bairro, cidade"/></div>
<div class="fr">
<div class="fg"><label>Telefone</label><input id="func-tel" placeholder="(31) 9xxxx-xxxx"/></div>
<div class="fg"><label>Data de Nascimento</label><input id="func-nasc" type="date"/></div>
</div>
<div style="background:var(--cd2);border-radius:8px;padding:10px;margin-top:8px">
<div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">🆘 CONTATO DE EMERGÊNCIA</div>
<div class="fr">
<div class="fg"><label>Nome</label><input id="func-emerg-nome" placeholder="Nome do contato"/></div>
<div class="fg"><label>Telefone</label><input id="func-emerg-tel" placeholder="(31) 9xxxx-xxxx"/></div>
</div>
</div>
<div class="fg"><label>Observações</label><textarea id="func-obs" rows="2"></textarea></div>
</div>
<!-- PROFISSIONAL -->
<div class="tab-p" id="tf-prof">
<div class="fr">
<div class="fg"><label>Carteira de Trabalho</label><input id="func-ctps" placeholder="Número + série"/></div>
<div class="fg"><label>PIS/PASEP</label><input id="func-pis" placeholder="000.00000.00-0"/></div>
</div>
<div class="fr">
<div class="fg"><label>Função/Cargo</label><input id="func-cargo" placeholder="Ex: MOTORISTA"/></div>
<div class="fg"><label>Data de Admissão</label><input id="func-admissao" type="date"/></div>
</div>
</div>
<!-- SALÁRIO E SEGURO -->
<div class="tab-p" id="tf-seguro">
<div class="fr">
<div class="fg"><label>Salário (R$)</label><input id="func-salario" placeholder="0,00" step="0.01" type="number"/></div>
<div class="fg"><label>Benefícios (R$)</label><input id="func-beneficio" placeholder="0,00" step="0.01" type="number"/></div>
</div>
<div style="background:var(--cd2);border-radius:8px;padding:10px;margin-top:8px">
<div style="font-size:12px;font-weight:700;color:var(--mt);margin-bottom:6px">🛡️ SEGURO DE VIDA</div>
<div class="fr">
<div class="fg"><label>Valor Indenização (R$)</label><input id="func-seg-valor" placeholder="0,00" step="0.01" type="number"/></div>
<div class="fg"><label>Vigência até <span id="func-seg-alerta" style="color:var(--red);font-size:10px"></span></label><input id="func-seg-vig" onchange="alertaVenc('func-seg-vig','func-seg-alerta')" type="date"/></div>
</div>
<div class="fg"><label>Seguradora</label><input id="func-seg-seguradora" placeholder="Nome da seguradora"/></div>
</div>
</div>
<!-- FOTOS -->
<div class="tab-p" id="tf-fotos">
<p style="font-size:10px;color:var(--mt);margin-bottom:7px">Fotos do funcionário</p>
<div class="foto-grid" id="func-foto-grid">
<label class="foto-add" for="func-foto-inp">+</label>
<input accept="image/*" id="func-foto-inp" multiple="" onchange="addFuncFoto(this)" style="display:none" type="file"/>
</div>
</div>
<!-- DOCUMENTOS -->
<div class="tab-p" id="tf-docs">
<p style="font-size:10px;color:var(--mt);margin-bottom:7px">Documentos e arquivos (PDF, imagens)</p>
<div id="func-arq-list"></div>
<label class="btn bg btn-sm" for="func-arq-inp" style="cursor:pointer;margin-top:7px;display:inline-flex">📎 Anexar Documento</label>
<input accept=".pdf,.jpg,.jpeg,.png" id="func-arq-inp" multiple="" onchange="addFuncArq(this)" style="display:none" type="file"/>
</div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-func')">Cancelar</button><button class="btn bp" onclick="saveFunc()">Salvar Funcionário</button></div>
</div></div>
