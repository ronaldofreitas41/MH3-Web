<div class="mo" id="m-import-rev"><div class="md">
<div class="mh"><div class="mt2">📥 Importar Revisões (relatório de OS)</div><button class="x" onclick="closeM('m-import-rev')">×</button></div>
<div class="mb">
<div style="background:var(--cd2);border-radius:8px;padding:12px;margin-bottom:12px;font-size:12px;color:var(--mt)">
      Cole abaixo o conteúdo do <b>Relatório de Ordem de Serviço</b> (com o cabeçalho). Cada linha vira uma <b>OS de Revisão Preventiva</b> ligada ao veículo pela placa, alimentando o <b>Acompanhamento de Revisão</b>. O KM e o horímetro são lidos juntos (ex: <i>58.606 H- 5.977</i>) e a próxima revisão é calculada automaticamente pelos intervalos definidos em Configurações (KM e horímetro). <b>Os veículos precisam estar cadastrados na Frota.</b>
</div>
<div class="fg"><label>Cole o relatório (do Excel ou do sistema antigo)</label><textarea id="imp-rev-paste" placeholder="OS;PLACA;TIPO;Km;HORIMETRO;Data Inclusao
773;RMO-0I33;REVISÃO PREVENTIVA;58.606;5977;08/06/2026" rows="6" style="width:100%;font-family:monospace;font-size:11px"></textarea></div>
<div><button class="btn bp btn-sm" onclick="processarImportRev()">Conferir antes de importar</button></div>
<div id="imp-rev-preview" style="margin-top:10px"></div>
</div>
<div class="mf"><button class="btn bg" onclick="closeM('m-import-rev')">Cancelar</button><button class="btn bp" id="imp-rev-btn" onclick="confirmarImportRev()" style="display:none">Importar</button></div>
</div></div>
