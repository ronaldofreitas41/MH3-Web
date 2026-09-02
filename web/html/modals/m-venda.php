<div class="mo" id="m-venda"><div class="mbox lg">
<div class="mh"><div class="mt2" id="vd-mtitle">🛒 Venda de Peças/Serviços</div><button class="mc" onclick="closeM('m-venda')">×</button></div>
<div class="mb2">
<input id="vd-eid" type="hidden"/>
<div class="fr"><div class="fg"><label>Cliente Final <span style="font-size:10px;color:var(--mt)">(cadastrado ou digite manual)</span></label>
<select id="vd-cli-sel" onchange="usarClienteVenda()" style="margin-bottom:6px"><option value="">— Digitar manual —</option></select>
<input id="vd-cli" placeholder="Nome do cliente"/></div><div class="fg"><label>Data</label><input id="vd-dt" type="date"/></div></div>
<div class="fr">
<div class="fg"><label>CPF / CNPJ <span style="font-size:10px;color:var(--mt)">(para documento não fiscal)</span></label>
<input id="vd-doc" maxlength="18" oninput="fmtDocFiscal(this)" placeholder="000.000.000-00 ou 00.000.000/0001-00"/>
</div>
<div class="fg"><label>Contato / WhatsApp</label><input id="vd-con" placeholder="(31) 9xxxx-xxxx"/></div>
</div>
<div class="fr"><div class="fg"><label>Forma de Pagamento</label><select id="vd-pag"><option>À Vista</option><option>PIX</option><option>Boleto</option><option>Cartão</option><option>Prazo 30d</option><option>Prazo 60d</option></select></div>
<div class="fg"><label>Tipo de Documento</label><select id="vd-tdoc"><option value="nf_simples">Documento Não Fiscal</option><option value="orcamento">Orçamento</option><option value="recibo">Recibo</option></select></div></div>
<div class="fg"><label>Observações</label><textarea id="vd-ob" rows="2"></textarea></div>
<div class="divider"></div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px"><span style="font-size:10px;color:var(--mt)">Itens da venda</span><div style="display:flex;gap:5px"><button class="btn bs btn-sm" onclick="addVendaEstq()">📦 Do Estoque</button><button class="btn bw btn-sm" onclick="addVendaPneu()">🛞 Pneu</button><button class="btn bp btn-sm" onclick="addVendaManual()">+ Manual</button></div></div>
<div id="vd-items-list"></div>
<div class="divider"></div>
<div style="display:flex;justify-content:space-between;align-items:center">
<div><div style="font-size:9px;color:var(--mt)">Desconto (%)</div><input id="vd-desc" oninput="calcVenda()" style="width:70px" type="number" value="0"/></div>
<div style="text-align:right"><div style="font-size:9px;color:var(--mt)">Total da Venda</div><div id="vd-total" style="font-family:'Bebas Neue';font-size:26px;color:var(--gn)">R$ 0,00</div></div>
</div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-venda')">Cancelar</button><button class="btn bp" onclick="saveVenda()">Salvar Venda</button></div>
</div></div>
