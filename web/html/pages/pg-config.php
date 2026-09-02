<div class="page" id="pg-config">
<div class="panel" style="margin-bottom:14px;border:2px solid var(--yw,#f59e0b)">
<div class="ph"><div class="pt">🩺 Diagnóstico de Conexão</div><button class="btn bp btn-sm" onclick="rodarDiagnostico()">▶️ Testar agora</button></div>
<div class="pb">
<p style="font-size:12px;color:var(--mt);margin-bottom:8px">Se o sistema der erro de atualização (principalmente com vários usuários conectados), clique em <b>"Testar agora"</b>, tire um print do resultado e me envie. Ele mostra exatamente o que está falhando.</p>
<div id="diag-resultado" style="font-size:12px"></div>
</div>
</div>
<div class="panel" id="cfg-empresas-box" style="margin-bottom:14px;border:2px solid var(--bp,#3b82f6)">
<div class="ph"><div class="pt">🏢 Empresas para Proposta</div><button class="btn bw btn-sm" onclick="cfgEmpNova()">➕ Adicionar empresa</button></div>
<div class="pb">
<p style="font-size:12px;color:var(--mt);margin-bottom:10px">Cadastre aqui as empresas que emitem propostas (logo, razão social, CNPJ, rodapé). Na hora de criar uma proposta, você apenas <b>seleciona</b> qual empresa usar — alterar uma empresa aqui <b>não muda</b> as outras nem as propostas já salvas com outra empresa.</p>
<div class="fg" style="margin-bottom:10px"><label>Empresa que está editando</label>
<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
<select id="cfg-emp-sel" onchange="cfgEmpTrocar(this.value)" style="flex:1;min-width:200px"></select>
<button class="btn bg btn-sm" id="cfg-emp-remover" onclick="cfgEmpRemover()" style="display:none" type="button">🗑️ Remover esta</button>
</div>
</div>
<div class="fg"><label>Apelido (como aparece na lista de seleção)</label><input class="no-upper" data-no-upper="" id="cfg-emp-apelido" placeholder="Ex: MH3 Rental"/></div>
<div class="fg"><label>Logomarca</label>
<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
<img id="cfg-emp-logo-preview" style="max-height:54px;max-width:180px;display:none;border:1px solid var(--br);border-radius:6px;background:#fff;padding:3px"/>
<span id="cfg-emp-logo-vazio" style="font-size:11px;color:var(--mt)">Sem logo — será usado o nome "MH3" em texto</span>
<label class="btn bw btn-sm" style="cursor:pointer;margin:0">📁 Escolher logo<input accept="image/*" onchange="cfgEmpLogoUpload(this)" style="display:none" type="file"/></label>
<button class="btn bg btn-sm" id="cfg-emp-logo-rm" onclick="cfgEmpLogoRemover()" style="display:none" type="button">Remover logo</button>
</div>
</div>
<div class="fg"><label>Razão social / nome no rodapé</label><input class="no-upper" data-no-upper="" id="cfg-emp-rodape-nome" placeholder="MH3 RENTAL LTDA"/></div>
<div class="fg"><label>Demais linhas do rodapé (CNPJ, endereço, telefone, e-mail — uma por linha)</label><textarea class="no-upper" data-no-upper="" id="cfg-emp-rodape-texto" placeholder="CNPJ: 00.000.000/0001-00
Rodovia / endereço
Telefone · e-mail" style="min-height:70px"></textarea></div>
<button class="btn bp" onclick="cfgEmpSalvar()">💾 Salvar dados desta empresa</button>
<button class="btn bg" onclick="cfgEmpRestaurarMH3()" style="margin-left:6px" title="Recupera a logo e o rodapé originais da MH3 que estavam salvos no sistema">🔄 Restaurar dados da MH3 nesta empresa</button>
</div>
</div>
<div class="g2">
<div class="panel"><div class="ph"><div class="pt">🏢 Dados da Empresa</div></div><div class="pb">
<div class="fg"><label>Razão Social</label><input id="cfg-rs" value="MH3 RENTAL LTDA"/></div>
<div class="fr"><div class="fg"><label>CNPJ</label><input id="cfg-cnpj" value="26.881.195/0001-10"/></div><div class="fg"><label>Telefone</label><input id="cfg-tel" value="(31) 99648-6515"/></div></div>
<div class="fg"><label>Endereço</label><input id="cfg-end" value="BR 381, KM 361 - João Monlevade/MG"/></div>
<div class="fr"><div class="fg"><label>Email Comercial</label><input id="cfg-em1" value="comercial@mh3rental.com.br"/></div><div class="fg"><label>Email Adm</label><input id="cfg-em2" value="adm@mh3rental.com.br"/></div></div>
<div class="fr"><div class="fg"><label>Senha Administrador</label><input id="cfg-adm-pw" placeholder="Senha para editar/excluir" type="password" value="mh3admin"/></div><div class="fg"><label>Margem de Venda Padrão (%)</label><input id="cfg-margem" type="number" value="30"/></div></div>
<button class="btn bp" onclick="saveCfg()">Salvar</button>
</div></div>
<div class="panel"><div class="ph"><div class="pt">⏱ Horas &amp; Alertas</div></div><div class="pb">
<div class="fr3"><div class="fg"><label>1 Turno (h)</label><input id="cfg-t1" type="number" value="200"/></div><div class="fg"><label>2 Turnos (h)</label><input id="cfg-t2" type="number" value="300"/></div><div class="fg"><label>3 Turnos (h)</label><input id="cfg-t3" type="number" value="420"/></div></div>
<div class="fr"><div class="fg"><label>Alerta Medição (dias antes)</label><input id="cfg-alert" type="number" value="5"/></div><div class="fg"><label>H.Extra valor/hora (R$)</label><input id="cfg-hextra" type="number" value="0"/></div></div>
<div class="fr"><div class="fg"><label>Intervalo Revisão KM</label><input id="cfg-rkm" type="number" value="10000"/></div><div class="fg"><label>Intervalo Revisão H</label><input id="cfg-rhr" type="number" value="500"/></div></div>
<button class="btn bp" onclick="saveCfg()">Salvar</button>
</div></div>
</div>
<div class="g2">
<div class="panel"><div class="ph"><div class="pt">🔧 Tipos de OS</div><button class="btn bp btn-sm" onclick="addTipoOS()">+ Tipo</button></div><div class="pb"><div id="tipos-os-list"></div></div></div>
<div class="panel"><div class="ph"><div class="pt">📅 Ciclos de Medição</div><button class="btn bp btn-sm" onclick="addCiclo()">+ Ciclo</button></div><div class="pb"><div id="ciclos-list"></div></div></div>
</div>
<div class="g2">
<div class="panel"><div class="ph"><div class="pt">🛞 Marcas de Pneus</div><button class="btn bp btn-sm" onclick="addMarca('pneu')">+ Marca</button></div><div class="pb"><div style="font-size:11px;color:var(--mt);margin-bottom:8px">Aparecem como sugestão nos campos de marca de pneu (entrada, mobilização...).</div><div id="marcas-pneu-list"></div></div></div>
<div class="panel"><div class="ph"><div class="pt">🚛 Marcas de Veículos</div><button class="btn bp btn-sm" onclick="addMarca('veiculo')">+ Marca</button></div><div class="pb"><div style="font-size:11px;color:var(--mt);margin-bottom:8px">Aparecem como sugestão nos campos de marca de caminhão/equipamento.</div><div id="marcas-veic-list"></div></div></div>
</div>
</div>
