<?php
/* ============================================================
   conexao.php  —  vs284 v48  —  17/08/2026
   ------------------------------------------------------------
   O QUE ESTE ARQUIVO E
   O unico lugar do sistema onde a senha do banco fica escrita.
   Antes ela estava dentro do api.php, junto com duas mil linhas
   de codigo. Agora esta aqui, sozinha, em seis linhas.

   POR QUE ISSO IMPORTA
   . Trocar a senha do banco vira mexer neste arquivo pequeno,
     sem abrir o api.php e sem risco de esbarrar em outra coisa.
   . O api.php pode ser mandado por e-mail, guardado numa pasta,
     copiado — sem levar a senha junto.
   . Se um dia o servidor servir .php como texto por engano, o
     estrago e menor: um arquivo so, e nao o sistema inteiro.

   ONDE COLOCAR
   Na MESMA pasta do api.php. So isso.

   SE ESTE ARQUIVO SUMIR
   O sistema NAO para. O api.php tem os mesmos valores guardados
   como reserva e continua conectando. Voce so perde a protecao —
   por isso vale conferir de vez em quando, com:

       api.php?action=diagnostico&chave=MH3-DIAG-2026

   Procure a linha "senha_do_banco_fora_do_api". Tem que dizer
   "sim (conexao.php)".

   QUANDO TROCAR A SENHA NA LOCAWEB
   Troque la, depois mude so a linha 'senha' aqui embaixo e suba
   este arquivo. Mais nada precisa ser tocado.
   ============================================================ */

return [
  'host'    => 'mh3sistema.mysql.dbaas.com.br',
  'nome'    => 'mh3sistema',
  'usuario' => 'mh3sistema',
  'senha'   => 'Fraga62970123#',
];
