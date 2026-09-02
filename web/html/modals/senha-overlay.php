<div class="senha-overlay" id="senha-overlay">
<div class="senha-box">
<h3>🔐 Ação Restrita</h3>
<p>Digite a senha de administrador para continuar</p>
<input id="senha-inp" onkeydown="if(event.key==='Enter')senhaOk()" placeholder="••••••" type="password"/>
<div style="display:flex;gap:8px;justify-content:center">
<button class="btn bg" onclick="senhaCancel()">Cancelar</button>
<button class="btn bp" onclick="senhaOk()">Confirmar</button>
</div>
</div>
<div class="panel"><div class="ph"><div class="pt">📋 Tópicos de Relatórios por Perfil</div></div>
<div class="pb">
<p style="font-size:12px;color:var(--mt);margin-bottom:12px">Configure quais tópicos aparecem nos relatórios de cada perfil de usuário</p>
<div class="fr">
<div class="fg">
<label style="font-size:12px;font-weight:700">Perfil Operacional</label>
<div style="margin-top:6px">
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input checked="" id="tp-op-os" type="checkbox"/> OS e Manutenções</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input id="tp-op-frota" type="checkbox"/> Frota Completa</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input id="tp-op-meds" type="checkbox"/> Medições</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input id="tp-op-estq" type="checkbox"/> Estoque</label>
<label style="display:flex;align-items:center;gap:8px;font-size:12px"><input id="tp-op-fin" type="checkbox"/> Financeiro</label>
</div>
</div>
<div class="fg">
<label style="font-size:12px;font-weight:700">Perfil Financeiro</label>
<div style="margin-top:6px">
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input checked="" id="tp-fin-fin" type="checkbox"/> Financeiro Completo</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input checked="" id="tp-fin-resultado" type="checkbox"/> Resultado por Placa</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input checked="" id="tp-fin-fluxo" type="checkbox"/> Fluxo de Caixa</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input id="tp-fin-desp" type="checkbox"/> Despesas</label>
<label style="display:flex;align-items:center;gap:8px;font-size:12px"><input id="tp-fin-nf" type="checkbox"/> NF Entrada</label>
</div>
</div>
<div class="fg">
<label style="font-size:12px;font-weight:700">Perfil Motorista</label>
<div style="margin-top:6px">
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input checked="" id="tp-mot-os" type="checkbox"/> Suas OS</label>
<label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;font-size:12px"><input id="tp-mot-frota" type="checkbox"/> Seus Veículos</label>
<label style="display:flex;align-items:center;gap:8px;font-size:12px"><input id="tp-mot-manut" type="checkbox"/> Manutenções</label>
</div>
</div>
</div>
<button class="btn bp" onclick="saveTopicos()" style="margin-top:12px">Salvar Tópicos</button>
</div></div>
</div>
