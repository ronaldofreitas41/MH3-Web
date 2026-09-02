<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>MH3 Rental — Sistema de Gestão</title>
  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@300;400;500;600;700&family=Barlow+Condensed:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="assets/css/main.css" rel="stylesheet">
  <link href="assets/css/forms.css" rel="stylesheet">
  <link href="assets/css/tables.css" rel="stylesheet">
  <link href="assets/css/modals.css" rel="stylesheet">
  <meta name="application-name" content="MH3 Gestão">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="MH3 Gestão">
  <meta name="theme-color" content="#C8102E">
  <link href="manifest.json" rel="manifest">
  <link href="icon-192.png" rel="icon" sizes="192x192" type="image/png">
  <link href="icon-512.png" rel="icon" sizes="512x512" type="image/png">
  <script src="html2canvas.min.js"></script>
  <script src="jspdf.umd.min.js"></script>
</head>
<body>
  <?php include __DIR__ . '/html/layout/login.php'; ?>
  <?php include __DIR__ . '/html/layout/pwa.php'; ?>
  <?php include __DIR__ . '/html/layout/sidebar-overlay.php'; ?>
  <?php include __DIR__ . '/html/layout/sidebar.php'; ?>
  <div class="main">
    <?php include __DIR__ . '/html/layout/topbar.php'; ?>
    <div class="content">
      <?php include __DIR__ . '/html/pages/pg-dashboard.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-pendencias.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-tratativas.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-whatsapp.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-caixaemail.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-frota.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-seguro.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-manutencao.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-revisao.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-proposta.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-contratos.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-medicoes.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-vendas.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-estoque.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-nf.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-despesas.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-financeiro.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-fluxo.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-relatorios.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-checklist.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-usuarios.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-config.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-resultado.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-pneus.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-auditoria.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-mobilizacao.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-contas_pagar.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-contas_receber.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-sistema.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-funcionarios.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-clientes.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-prejuizos.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-saida_material.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-agenda.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-investimento.php'; ?>
      <?php include __DIR__ . '/html/pages/pg-ajuda_motorista.php'; ?>
    </div>
    <?php include __DIR__ . '/html/modals/m-acerto-saldo.php'; ?>
    <?php include __DIR__ . '/html/modals/m-audit-det.php'; ?>
    <?php include __DIR__ . '/html/modals/m-cl.php'; ?>
    <?php include __DIR__ . '/html/modals/m-cliente.php'; ?>
    <?php include __DIR__ . '/html/modals/m-conta-banco.php'; ?>
    <?php include __DIR__ . '/html/modals/m-ct.php'; ?>
    <?php include __DIR__ . '/html/modals/m-desp.php'; ?>
    <?php include __DIR__ . '/html/modals/m-eq.php'; ?>
    <?php include __DIR__ . '/html/modals/m-estq.php'; ?>
    <?php include __DIR__ . '/html/modals/m-frota-rel.php'; ?>
    <?php include __DIR__ . '/html/modals/m-func.php'; ?>
    <?php include __DIR__ . '/html/modals/m-imp-kmhr.php'; ?>
    <?php include __DIR__ . '/html/modals/m-import-rev.php'; ?>
    <?php include __DIR__ . '/html/modals/m-import.php'; ?>
    <?php include __DIR__ . '/html/modals/m-med.php'; ?>
    <?php include __DIR__ . '/html/modals/m-mm-aut.php'; ?>
    <?php include __DIR__ . '/html/modals/m-mm-ger.php'; ?>
    <?php include __DIR__ . '/html/modals/m-mn.php'; ?>
    <?php include __DIR__ . '/html/modals/m-mob.php'; ?>
    <?php include __DIR__ . '/html/modals/m-nf.php'; ?>
    <?php include __DIR__ . '/html/modals/m-patio-contato.php'; ?>
    <?php include __DIR__ . '/html/modals/m-pneu-ent.php'; ?>
    <?php include __DIR__ . '/html/modals/m-pneu-lanc.php'; ?>
    <?php include __DIR__ . '/html/modals/m-pneu-perm.php'; ?>
    <?php include __DIR__ . '/html/modals/m-pneu-rel.php'; ?>
    <?php include __DIR__ . '/html/modals/m-pneu-sai.php'; ?>
    <?php include __DIR__ . '/html/modals/m-print-os.php'; ?>
    <?php include __DIR__ . '/html/modals/m-rev.php'; ?>
    <?php include __DIR__ . '/html/modals/m-seguro.php'; ?>
    <?php include __DIR__ . '/html/modals/m-senha.php'; ?>
    <?php include __DIR__ . '/html/modals/m-tratativa.php'; ?>
    <?php include __DIR__ . '/html/modals/m-usr.php'; ?>
    <?php include __DIR__ . '/html/modals/m-venda-eq.php'; ?>
    <?php include __DIR__ . '/html/modals/m-venda.php'; ?>
    <?php include __DIR__ . '/html/modals/m-view.php'; ?>
    <?php include __DIR__ . '/html/modals/m-wa-pronta.php'; ?>
    <?php include __DIR__ . '/html/modals/m-wa-send.php'; ?>
    <?php include __DIR__ . '/html/modals/m-xml.php'; ?>
    <?php include __DIR__ . '/html/modals/senha-overlay.php'; ?>
    <?php include __DIR__ . '/html/layout/lb.php'; ?>
    <?php include __DIR__ . '/html/layout/fixed-toast.php'; ?>
  </div>

  <!-- Scripts: carregados separados e na mesma ordem lógica do arquivo original -->
  <script src="assets/js/app.js"></script>
  <script src="assets/js/frota/frota.js"></script>
  <script src="assets/js/financeiro/medicoes.js"></script>
  <script src="assets/js/frota/manutencao.js"></script>
  <script src="assets/js/comercial/contratos.js"></script>
  <script src="assets/js/financeiro/vendas.js"></script>
  <script src="assets/js/utils.js"></script>
  <script src="assets/js/estoque/estoque.js"></script>
  <script src="assets/js/estoque/notas-fiscais.js"></script>
  <script src="assets/js/financeiro/despesas.js"></script>
  <script src="assets/js/frota/revisao.js"></script>
  <script src="assets/js/frota/checklist.js"></script>
  <script src="assets/js/auth.js"></script>
  <script src="assets/js/config.js"></script>
  <script src="assets/js/dashboard.js"></script>
  <script src="assets/js/frota/vencimentos.js"></script>
  <script src="assets/js/dashboard/renders.js"></script>
  <script src="assets/js/tratativas.js"></script>
  <script src="assets/js/relatorios/relatorios.js"></script>
  <script src="assets/js/auditoria.js"></script>
  <script src="assets/js/financeiro/prejuizos.js"></script>
  <script src="assets/js/sistema/limpeza.js"></script>
  <script src="assets/js/financeiro/ajuda-motoristas.js"></script>
  <script src="assets/js/agenda.js"></script>
  <script src="assets/js/utils/busca-global.js"></script>
  <script src="assets/js/importacao.js"></script>
  <script src="assets/js/frota/importacao.js"></script>
  <script src="assets/js/financeiro/investimentos.js"></script>
  <script src="assets/js/financeiro/bancos-fluxo.js"></script>
  <script src="assets/js/auth/permissoes.js"></script>
  <script src="assets/js/estoque/saida-material.js"></script>
  <script src="assets/js/clientes.js"></script>
  <script src="assets/js/estoque/integracoes.js"></script>
  <script src="assets/js/frota/os.js"></script>
  <script src="assets/js/comercial/contratos-integracao.js"></script>
  <script src="assets/js/financeiro/fluxo.js"></script>
  <script src="assets/js/utils/exportacao.js"></script>
  <script src="assets/js/utils/visualizacao.js"></script>
  <script src="assets/js/api.js"></script>
  <script src="assets/js/auth/login.js"></script>
  <script src="assets/js/auth/inatividade.js"></script>
  <script src="assets/js/sync.js"></script>
  <script src="assets/js/sync/manual.js"></script>
  <script src="assets/js/backup.js"></script>
  <script src="assets/js/backup/atualizacao-incremental.js"></script>
  <script src="assets/js/auditoria/registros.js"></script>
  <script src="assets/js/frota/pneus.js"></script>
  <script src="assets/js/estoque/melhorias.js"></script>
  <script src="assets/js/financeiro/venda-equipamento.js"></script>
  <script src="assets/js/financeiro/contas.js"></script>
  <script src="assets/js/funcionarios.js"></script>
  <script src="assets/js/clientes/crud.js"></script>
  <script src="assets/js/comercial/mobilizacao-integracao.js"></script>
  <script src="assets/js/comercial/mobilizacao.js"></script>
  <script src="assets/js/relatorios/novos.js"></script>
  <script src="assets/js/frota/desvalorizacao.js"></script>
  <script src="assets/js/relatorios/catalogo.js"></script>
  <script src="assets/js/relatorios/patrimonial.js"></script>
  <script src="assets/js/relatorios/analitico.js"></script>
  <script src="assets/js/relatorios/resultado-placa.js"></script>
  <script src="assets/js/documentos/email-config.js"></script>
  <script src="assets/js/utils/autocomplete.js"></script>
  <script src="assets/js/pwa.js"></script>
  <script src="assets/js/documentos/email-contas.js"></script>
  <script src="assets/js/documentos/caixa-email.js"></script>
  <script src="assets/js/comercial/proposta.js"></script>
  <script src="assets/js/app/finalizacao.js"></script>
</body>
</html>
