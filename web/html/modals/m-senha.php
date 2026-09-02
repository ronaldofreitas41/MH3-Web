<div class="mo" id="m-senha"><div class="mbox">
<div class="mh"><div class="mt2">🔑 Trocar Minha Senha</div><button class="mc" onclick="closeM('m-senha')">×</button></div>
<div class="mb2">
<p style="color:#9aa7b8;font-size:14px;margin:0 0 16px;">Digite sua nova senha abaixo. Regra: mínimo <b>8 caracteres</b>, com pelo menos <b>uma letra e um número</b>.</p>
<label style="display:block;margin-bottom:6px;font-size:13px;color:#9aa7b8;">Nova senha</label>
<input id="senha-nova" oninput="checarForcaSenha()" placeholder="Digite a nova senha" style="width:100%;padding:14px;font-size:16px;background:var(--cd2);border:1px solid var(--br);border-radius:8px;color:var(--tx);box-sizing:border-box;margin-bottom:6px;" type="password"/>
<div id="senha-forca" style="font-size:12px;margin-bottom:14px;min-height:16px"></div>
<label style="display:block;margin-bottom:6px;font-size:13px;color:#9aa7b8;">Confirmar nova senha</label>
<input id="senha-conf" placeholder="Digite a senha de novo" style="width:100%;padding:14px;font-size:16px;background:var(--cd2);border:1px solid var(--br);border-radius:8px;color:var(--tx);box-sizing:border-box;margin-bottom:8px;" type="password"/>
<div id="senha-msg" style="display:none;font-size:13px;margin:8px 0;padding:10px;border-radius:6px;"></div>
</div>
<div class="mf">
<button class="btn bg" onclick="closeM('m-senha')">Cancelar</button>
<button class="btn pr" id="senha-btn" onclick="trocarMinhaSenha()">Salvar Nova Senha</button>
</div>
</div></div>
