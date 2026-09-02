<div class="mo" id="m-xml">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">📎 Importar XML NF</div><button class="mc" onclick="closeM('m-xml')">×</button>
        </div>
        <div class="mb2">
            <p style="font-size:11px;color:var(--mt);margin-bottom:9px">Cole o conteúdo do XML da NF abaixo. O sistema extrairá os dados automaticamente.</p>
            <div class="fg"><label>XML da Nota Fiscal</label><textarea id="xml-inp" placeholder='&lt;?xml version="1.0"...&gt;
&lt;nfeProc...&gt;' rows="8" style="font-family:monospace;font-size:10px"></textarea></div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-xml')">Cancelar</button><button class="btn bp" onclick="parseXML()">Processar XML</button></div>
    </div>
</div>