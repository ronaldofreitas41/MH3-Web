<div class="page" id="pg-whatsapp">
<div style="background:var(--cd);border-left:4px solid var(--yw,#f59e0b);border-radius:6px;padding:11px;margin-bottom:14px;font-size:12px;line-height:1.5">
<b>📲 Esta aba (Fase 1):</b> enviar mensagens e guardar mensagens prontas. Os botões abrem o WhatsApp do próprio usuário com o texto já pronto.<br/>
    Para <b>RECEBER mensagens</b>, ter um <b>número único da empresa</b> e a <b>assinatura automática por usuário</b> (ex.: "Comercial MH3 - Noninho"), é preciso ativar a <b>API oficial (Twilio)</b> com o número da Vivo — isso é a <b>Fase 2</b>, que eu monto quando o número estiver conectado.
  </div>
<div style="margin-bottom:14px"><button class="btn" onclick="abrirWhatsAppGeral()" style="background:#25D366;color:#fff;border:none;width:100%;padding:12px;font-size:14px">💬 Abrir o WhatsApp (abre o aplicativo no PC; se não tiver, abre o WhatsApp Web)</button></div>
<div class="panel" style="margin-bottom:14px;border:2px solid #25D366">
<div class="ph"><div class="pt">📱 Número da empresa</div><button class="btn btn-sm" onclick="salvarWaNumero()" style="background:#25D366;color:#fff;border:none">💾 Salvar</button></div>
<div class="pb"><div class="fg"><label>Número de WhatsApp da empresa (será usado na Fase 2)</label><input id="wa-empresa-num" placeholder="(31) 90000-0000"/></div></div>
</div>
<div class="panel" style="margin-bottom:14px">
<div class="ph"><div class="pt">✉️ Enviar mensagem</div></div>
<div class="pb">
<div class="fr"><div class="fg"><label>Para qual número?</label><input id="wac-tel" placeholder="(00) 00000-0000"/></div><div class="fg"><label>Ou escolher cliente cadastrado</label><select id="wac-cli" onchange="if(this.value)document.getElementById('wac-tel').value=this.value"><option value="">— escolher cliente —</option></select></div></div>
<div class="fg"><label>Usar uma mensagem pronta</label><select id="wac-pronta" onchange="waUsarPronta(this.value)"><option value="">— escolher mensagem pronta —</option></select></div>
<div class="fg"><label>Mensagem</label><textarea id="wac-msg" placeholder="Escreva a mensagem ou escolha uma pronta acima" rows="5"></textarea></div>
<button class="btn" onclick="waEnviarCentral()" style="background:#25D366;color:#fff;border:none">📲 Enviar no WhatsApp</button>
</div>
</div>
<div class="panel" style="margin-bottom:14px">
<div class="ph"><div class="pt">📝 Mensagens já prontas</div><button class="btn bp btn-sm" onclick="waProntaNova()">➕ Nova mensagem</button></div>
<div class="pb"><p style="font-size:11px;color:var(--mt);margin-bottom:10px">Cadastre mensagens que você usa sempre (cobrança, agendamento de revisão, aviso de medição, etc.) para escolher rapidinho na hora de enviar.</p><div id="wa-prontas-list"></div></div>
</div>
<div class="panel" style="margin-bottom:14px">
<div class="ph"><div class="pt">⚙️ Mensagens automáticas por tela</div><button class="btn btn-sm" onclick="salvarWaMsgs()" style="background:#25D366;color:#fff;border:none">💾 Salvar</button></div>
<div class="pb">
<p style="font-size:11px;color:var(--mt);margin-bottom:10px">Mensagem que já vem pronta ao clicar no 📲 de cada tela. Os campos entre chaves são preenchidos sozinhos:</p>
<div class="fg"><label>🔧 Revisão — campos: {placa} {marca} {modelo} {nome}</label><textarea id="wamsg-revisao" rows="3"></textarea></div>
<div class="fg"><label>📐 Medição — campos: {cliente} {periodo} {horas} {valor} {vencimento}</label><textarea id="wamsg-medicao" rows="3"></textarea></div>
<div class="fg"><label>💰 Cobrança — campos: {cliente} {placa} {valor} {vencimento}</label><textarea id="wamsg-cobranca" rows="3"></textarea></div>
<div class="fg"><label>🔧 OS — campos: {os} {veiculo} {data} {tipo} {total}</label><textarea id="wamsg-os" rows="3"></textarea></div>
</div>
</div>
</div>
