<?php
declare(strict_types=1);

function pageMap(): array
{
    return [
        'dashboard' => 'dashboard.php',
        'pendencias' => 'pendencias.php',
        'tratativas' => 'tratativas.php',
        'whatsapp' => 'whatsapp.php',
        'caixaemail' => 'caixaemail.php',
        'frota' => 'frota.php',
        'seguro' => 'seguro.php',
        'manutencao' => 'manutencao.php',
        'revisao' => 'revisao.php',
        'proposta' => 'proposta.php',
        'contratos' => 'contratos.php',
        'medicoes' => 'medicoes.php',
        'vendas' => 'vendas.php',
        'estoque' => 'estoque.php',
        'nf' => 'nf.php',
        'despesas' => 'despesas.php',
        'financeiro' => 'financeiro.php',
        'fluxo' => 'fluxo.php',
        'relatorios' => 'relatorios.php',
        'checklist' => 'checklist.php',
        'usuarios' => 'usuarios.php',
        'config' => 'config.php',
        'resultado' => 'resultado.php',
        'pneus' => 'pneus.php',
        'movimentacao' => 'movimentacao.php',
        'auditoria' => 'auditoria.php',
        'mobilizacao' => 'mobilizacao.php',
        'contas_pagar' => 'contas-pagar.php',
        'contas_receber' => 'contas-receber.php',
        'sistema' => 'sistema.php',
        'funcionarios' => 'funcionarios.php',
        'clientes' => 'clientes.php',
        'prejuizos' => 'prejuizos.php',
        'saida_material' => 'saida-material.php',
        'agenda' => 'agenda.php',
        'investimento' => 'investimento.php',
        'ajuda_motorista' => 'ajuda-motorista.php'
    ];
}

function resolvePage(string $page): string
{
    $pages = pageMap();
    $page = trim($page);

    if ($page === '' || !isset($pages[$page])) {
        $page = 'dashboard';
    }

    return __DIR__ . '/../html/pages/' . $pages[$page];
}
