# MH3 Rental — estrutura refatorada

## O que foi alterado

- `index.php` agora é somente o ponto de entrada/layout.
- `core/router.php` mantém o mapa das páginas.
- Cada `pg-*` virou um arquivo em `html/pages/`.
- CSS principal foi extraído para `assets/css/app.css`.
- JavaScript inline foi centralizado em `assets/js/app.js`, preservando a ordem original de execução.
- Bibliotecas `html2canvas` e `jsPDF` foram para `assets/js/vendor/`.
- Modais foram separados em `html/modals/`.
- Os `parte*.txt` e o `index.php` anterior ficaram em `legacy/` para rollback.

## Importante

A lógica existente de navegação (`go('dashboard')`, `go('frota')`, etc.) foi preservada: todas as páginas continuam presentes no DOM, mas agora cada uma está em seu próprio arquivo PHP. Isso reduz drasticamente a complexidade do `index.php` sem alterar a forma como o JavaScript existente encontra os elementos.

A próxima etapa, se desejada, é separar `assets/js/app.js` por módulo (`dashboard`, `frota`, `financeiro`, `estoque`, etc.). Essa etapa deve ser feita com testes, porque existem funções compartilhadas e dependências de ordem no JavaScript atual.
