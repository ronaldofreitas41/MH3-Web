<div class="mo" id="m-cl"><div class="mbox">
<div class="mh"><div class="mt2">☑️ Checklist</div><button class="mc" onclick="closeM('m-cl')">×</button></div>
<div class="mb2">
<input id="cl-eid" type="hidden"/>
<div class="fr"><div class="fg"><label>Nome</label><input id="cl-nm" placeholder="Ex: Mobilização Passo I"/></div><div class="fg"><label>Categoria</label><select id="cl-cat"><option>Mobilização</option><option>Revisão Preventiva</option><option>Desmobilização</option><option>Avaria</option><option>Geral</option></select></div></div>
<div class="divider"></div>
<div id="cl-items-list"></div>
<div style="display:flex;gap:5px;margin-top:6px"><input id="cl-new-item" placeholder="Novo item..." style="flex:1"/><button class="btn bg btn-sm" onclick="addClItemM()">+</button></div>
<div style="margin-top:8px"><button class="btn bg btn-xs" onclick="toggleImportCl()">📋 Colar vários itens de uma vez</button></div>
<div id="cl-import-area" style="display:none;margin-top:6px">
<textarea id="cl-import-txt" placeholder="Cole aqui os itens — um por linha" style="width:100%;min-height:130px;padding:8px;border:1px solid var(--br);border-radius:6px;background:var(--cd2);color:var(--tx);font-size:12px"></textarea>
<div style="display:flex;gap:5px;margin-top:5px"><button class="btn bp btn-sm" onclick="importarClItens()">Adicionar todos</button><button class="btn bg btn-sm" onclick="toggleImportCl()">Fechar</button></div>
</div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-cl')">Cancelar</button><button class="btn bp" onclick="saveCl()">Salvar</button></div>
</div></div>
