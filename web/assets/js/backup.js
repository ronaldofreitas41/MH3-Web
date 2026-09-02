// ============ BACKUP & SEGURANÇA ============

// Backup completo dos dados em JSON
function fazerBackup() {
    try {
        const backup = {
            versao: 'MH3 v6',
            gerado_em: new Date().toISOString(),
            empresa: 'MH3 Rental Ltda',
            dados: {
                equips:       D.equips,
                contratos:    D.contratos,
                medicoes:     D.medicoes,
                manutencoes:  D.manutencoes,
                vendas:       D.vendas,
                despesas:     D.despesas,
                estoque:      D.estoque,
                nfs:          D.nfs,
                revisoes:     D.revisoes||[],
                checklists:   D.checklists,
                usuarios:     D.usuarios,
                config:       D.config
            },
            totais: {
                equipamentos: D.equips.length,
                contratos:    D.contratos.length,
                medicoes:     D.medicoes.length,
                manutencoes:  D.manutencoes.length,
                vendas:       D.vendas.length,
                despesas:     D.despesas.length,
                estoque:      D.estoque.length,
                nfs:          D.nfs.length
            }
        };
        const json    = JSON.stringify(backup, null, 2);
        const blob    = new Blob([json], {type:'application/json'});
        const url     = URL.createObjectURL(blob);
        const data    = new Date().toISOString().slice(0,10);
        const a       = document.createElement('a');
        a.href        = url;
        a.download    = `MH3_Backup_${data}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast(`✓ Backup gerado — ${Object.values(backup.totais).reduce((s,v)=>s+v,0)} registros salvos`,'ok');
        // Loga o backup
        if(syncAtivo) apiCall('log_action',{acao:'BACKUP_GERADO',modulo:'sistema'});
    } catch(e) {
        toast('Erro ao gerar backup: '+e.message,'er');
    }
}

// Restaurar backup de arquivo JSON
function restaurarBackup() {
    if(!confirm('⚠️ ATENÇÃO\n\nRestaurar um backup irá SUBSTITUIR todos os dados atuais.\n\nDeseja continuar?')) return;
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept= '.json';
    input.onchange = async (e) => {
        const file   = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if(!backup.dados) { toast('Arquivo inválido — não é um backup MH3','er'); return; }
                const d = backup.dados;
                if(d.equips)      D.equips      = d.equips;
                if(d.contratos)   D.contratos   = d.contratos;
                if(d.medicoes)    D.medicoes    = d.medicoes;
                if(d.manutencoes) D.manutencoes = d.manutencoes;
                if(d.vendas)      D.vendas      = d.vendas;
                if(d.despesas)    D.despesas    = d.despesas;
                if(d.estoque)     D.estoque     = d.estoque;
                if(d.nfs)         D.nfs         = d.nfs;
                if(d.revisoes)    D.revisoes    = d.revisoes;
                if(d.checklists)  D.checklists  = d.checklists;
                if(d.config)      D.config      = {...D.config,...d.config};
                sv();
                toast(`✓ Backup restaurado de ${backup.gerado_em?.slice(0,10)||'?'}`,'ok');
                setTimeout(()=>location.reload(),1500);
            } catch(err) {
                toast('Arquivo corrompido ou inválido','er');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

