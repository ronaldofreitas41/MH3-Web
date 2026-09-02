<div class="mo" id="m-print-os">
    <div class="mbox">
        <div class="mh">
            <div class="mt2">🖨 Opções de Impressão OS</div><button class="mc" onclick="closeM('m-print-os')">×</button>
        </div>
        <div class="mb2"><input id="print-os-id" type="hidden" />
            <div style="display:flex;flex-direction:column;gap:7px">
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input checked="" id="pi-fotos" type="checkbox" /> Incluir Fotos</label>
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input checked="" id="pi-valor" type="checkbox" /> Incluir Valores</label>
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input checked="" id="pi-cl" type="checkbox" /> Checklist Detalhado</label>
            </div>
            <div class="divider"></div>
            <div style="display:flex;flex-direction:column;gap:6px">
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input checked="" name="pi-tipo" type="radio" value="completa" /> Completa (todos os dados)</label>
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input name="pi-tipo" type="radio" value="simples" /> Simples (resumo)</label>
                <label style="display:flex;align-items:center;gap:7px;font-size:12px;color:var(--tx);text-transform:none;letter-spacing:0;cursor:pointer"><input name="pi-tipo" type="radio" value="cliente" /> Via do Cliente (sem custos internos)</label>
            </div>
        </div>
        <div class="mf"><button class="btn bg" onclick="closeM('m-print-os')">Cancelar</button><button class="btn bp" onclick="execPrintOS()">🖨 Imprimir</button></div>
    </div>
</div>