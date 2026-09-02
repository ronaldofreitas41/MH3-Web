<div class="mo" id="m-estq"><div class="mbox lg">
<div class="mh"><div class="mt2" id="estq-mtitle">📦 Produto / Peça</div><button class="mc" onclick="closeM('m-estq')">×</button></div>
<div class="mb2"><input id="estq-eid" type="hidden"/>
<div class="tabs">
<div class="tab on" onclick="stab(this,'testq-dados')">Dados</div>
<div class="tab" onclick="stab(this,'testq-nf')">Entrada por NF</div>
<div class="tab" onclick="stab(this,'testq-xml')">Importar XML</div>
</div>
<!-- ABA DADOS -->
<div class="tab-p on" id="testq-dados">
<div class="fr">
<div class="fg">
<label>Código</label>
<div style="display:flex;gap:6px">
<input id="estq-cd" placeholder="PEC-001" style="flex:1"/>
<button class="btn bg btn-sm" onclick="gerarCodEstq()" title="Gerar código automático" type="button">🔄 Auto</button>
</div>
</div>
<div class="fg"><label>Categoria</label><select id="estq-cat"></select></div>
</div>
<div class="fg"><label>Descrição *</label><input id="estq-ds" placeholder="Ex: Óleo Motor 15W40 - 1L"/></div>
<div class="fr3">
<div class="fg"><label>Quantidade</label><input id="estq-qt" placeholder="10" type="number"/></div>
<div class="fg"><label>Mínimo</label><input id="estq-mn" placeholder="2" type="number"/></div>
<div class="fg"><label>Unidade</label><select id="estq-un"><option>UN</option><option>L</option><option>KG</option><option>MT</option><option>CX</option><option>JG</option></select></div>
</div>
<div class="fr">
<div class="fg"><label>Custo Unitário (R$)</label><input id="estq-cv" oninput="calcPvEstq()" placeholder="45.00" step="0.01" type="number"/></div>
<div class="fg">
<label>Tabela de Preço <span style="font-size:10px;color:var(--mt)">(cadastrar em Configurações)</span></label>
<select id="estq-tab-venda" onchange="calcPvEstq()">
<option value="mh3">Tabela MH3 (custo — veículos cadastrados)</option>
</select>
</div>
</div>
<div class="fr">
<div class="fg">
<label>Margem % <span style="font-size:10px;color:var(--mt)">(mín 40% tabela final)</span></label>
<input id="estq-margem" min="0" oninput="calcPvEstq()" placeholder="40" step="0.1" type="number"/>
</div>
<div class="fg"><label>Preço de Venda (R$) <span style="font-size:10px;color:var(--mt)">(calculado automático)</span></label>
<input id="estq-pv" placeholder="65.00" step="0.01" type="number"/>
</div>
</div>
<div class="fg"><label>Localização</label><input id="estq-loc" placeholder="Prateleira A1"/></div>
<div class="fg"><label>Nº NF de Entrada (opcional)</label><input id="estq-nf-num" placeholder="Número da NF de origem"/></div>
</div>
<!-- ABA ENTRADA POR NF -->
<div class="tab-p" id="testq-nf">
<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Informe os dados da NF de entrada. O destinatário deve ser MH3 Rental Ltda.</p>
<div class="fr">
<div class="fg"><label>Número da NF *</label><input id="nf-num-est" placeholder="000001"/></div>
<div class="fg"><label>Data da NF *</label><input id="nf-dt-est" type="date"/></div>
</div>
<div class="fr">
<div class="fg"><label>Fornecedor *</label><input id="nf-forn-est" placeholder="Nome do fornecedor"/></div>
<div class="fg"><label>CNPJ Fornecedor</label><input id="nf-cnpj-est" oninput="fmtDocFiscal(this)" placeholder="00.000.000/0001-00"/></div>
</div>
<div class="fg"><label>Destinatário (deve ser MH3 Rental)</label>
<input id="nf-dest-est" readonly="" style="background:var(--cd2)" value="MH3 Rental Ltda"/>
</div>
<div class="fr">
<div class="fg"><label>Valor Total NF (R$)</label><input id="nf-vl-est" placeholder="0,00" step="0.01" type="number"/></div>
<div class="fg"><label>Qtd. Itens</label><input id="nf-qt-est" min="1" placeholder="1" type="number"/></div>
</div>
<button class="btn bp btn-sm" onclick="entradaNfEstq()" style="margin-top:8px" type="button">📥 Registrar Entrada por NF</button>
</div>
<!-- ABA XML -->
<div class="tab-p" id="testq-xml">
<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Importe o arquivo XML da NF-e emitida para MH3 Rental Ltda.</p>
<div style="border:2px dashed var(--br);border-radius:8px;padding:24px;text-align:center">
<div style="font-size:32px;margin-bottom:8px">📄</div>
<p style="font-size:13px;color:var(--mt)">Selecione o arquivo XML da NF-e</p>
<input accept=".xml" id="nf-xml-inp" onchange="importarXmlNF(this)" style="margin-top:8px" type="file"/>
</div>
<div id="xml-preview" style="margin-top:12px"></div>
</div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-estq')">Cancelar</button><button class="btn bp" onclick="saveEstq()">Salvar Produto</button></div>
</div></div>
