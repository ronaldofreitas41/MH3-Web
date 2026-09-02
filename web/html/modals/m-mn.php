<div class="mo" id="m-mn"><div class="mbox xl"><input id="mn-eid" type="hidden"/>
<div class="mh"><div class="mt2">🔧 OS — <span id="mn-num-label" style="color:var(--cy);font-size:13px"></span></div><button class="mc" onclick="closeM('m-mn')">×</button></div>
<div class="mb2">
<div class="tabs"><div class="tab on" onclick="stab(this,'tmn-g')">Geral</div><div class="tab" onclick="stab(this,'tmn-l')">Produtos/Peças</div><div class="tab" onclick="stab(this,'tmn-c')">Checklist</div><div class="tab" onclick="stab(this,'tmn-f')">Fotos</div></div>
<div class="tab-p on" id="tmn-g">
<div class="fr"><div class="fg"><label>Veículo/Equipamento</label><select id="mn-eq" onchange="autoFillEq()"><option value="">Selecionar...</option></select></div><div class="fg"><label>Tipo de OS</label><select id="mn-tp" onchange="togProxRev()"><option>Revisão Preventiva</option></select></div></div>
<div class="fr"><div class="fg"><label>Entrada</label><input id="mn-en" type="date"/></div><div class="fg"><label>Saída (conclusão)</label><input id="mn-sa" type="date"/></div></div>
<div class="fr"><div class="fg"><label>KM na Entrada</label><input id="mn-km" type="number"/></div><div class="fg"><label>Horímetro</label><input id="mn-hr" type="number"/></div></div>
<div class="fr" id="mn-prox-rev-row"><div class="fg"><label>Próx. Revisão KM</label><input id="mn-pkm"/></div><div class="fg"><label>Próx. Revisão H</label><input id="mn-phr"/></div></div>
<div class="fr"><div class="fg"><label>Custo desta OS</label><div class="radio-row" style="margin-top:3px"><label><input checked="" name="mn-custo" type="radio" value="mh3"/> Para MH3 (custo interno)</label></div><div style="font-size:10px;color:var(--mt);margin-top:4px">💡 Cobranças ao cliente devem ser lançadas em <b>Vendas</b>, para não misturar as informações.</div></div><div class="fg"><label>Status</label><select id="mn-status"><option value="aberta">Aberta</option><option value="aguardando">Aguardando Peças/Aprova.</option><option value="concluida">Concluída</option></select></div></div>
<div class="fg"><label>Responsável</label>
<div style="display:flex;gap:6px">
<select id="mn-re" onchange="toggleRespManual()" style="flex:1"><option value="">Selecionar...</option></select>
<button class="btn bg btn-sm" onclick="novoResponsavel()" title="Cadastrar novo responsável" type="button">+ Resp.</button>
</div>
<input id="mn-re-manual" placeholder="Digite o nome do responsável" style="display:none;margin-top:6px"/></div>
<div class="fg"><label>Observações</label><textarea id="mn-ob"></textarea></div>
</div>
<div class="tab-p" id="tmn-l">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-size:10px;color:var(--mt)">Produtos/Peças utilizados</span><div style="display:flex;gap:5px"><button class="btn bs btn-sm" onclick="addLancEstq()">📦 Do Estoque</button><button class="btn bp btn-sm" onclick="addLancManual()">+ Manual</button></div></div>
<div id="mn-lanc-list"></div>
<div class="divider" style="margin:14px 0"></div>
<div style="font-size:10px;color:var(--mt);margin-bottom:6px">🛞 Pneus do estoque <span style="color:var(--cy)">(saem do estoque e geram pendência de entrada dos pneus retirados)</span></div>
<div style="display:flex;gap:6px;margin-bottom:8px">
<select id="mn-pneu-sel" style="flex:1"><option value="">Selecionar pneu do estoque...</option></select>
<button class="btn bp btn-sm" onclick="addPneuOS()">+ Adicionar pneu</button>
</div>
<div id="mn-pneus-list"></div>
<div class="divider"></div>
<div style="display:flex;justify-content:space-between"><span style="font-size:10px;color:var(--mt)">Total OS:</span><span id="mn-tot" style="font-family:'Bebas Neue';font-size:17px;color:var(--gn)">R$ 0,00</span></div>
</div>
<div class="tab-p" id="tmn-c">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><select id="mn-cl-mod" onchange="loadClMod()" style="width:auto;min-width:190px"><option value="">➕ Adicionar checklist...</option></select><span style="font-size:9px;color:var(--mt)">Pode somar vários (ex: Mob. I, II, PIPA)</span></div>
<div id="mn-cl-list"></div>
</div>
<div class="tab-p" id="tmn-f"><p style="font-size:10px;color:var(--mt);margin-bottom:7px">Fotos da manutenção</p><div class="foto-grid" id="mn-foto-grid"><label class="foto-add" for="mn-foto-inp">+</label><input accept="image/*" id="mn-foto-inp" multiple="" onchange="addFotos(this)" style="display:none" type="file"/></div></div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-mn')">Cancelar</button><button class="btn bp" onclick="saveMn()">Salvar OS</button></div>
</div></div>
