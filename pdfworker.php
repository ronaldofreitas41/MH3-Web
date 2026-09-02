<?php
/* ============================================================================
   pdfworker.php — ENTREGA O MOTOR DO LEITOR DE PDF EM 2 PEDACOS
   ----------------------------------------------------------------------------
   PARA QUE SERVE
     O leitor de PDF (pdf.js) precisa de um arquivo "motor" chamado
     pdf.worker.min.js, que tem cerca de 1 MB. Se o seu FTP nao aguentar
     subir esse arquivo de uma vez, use ESTE caminho:

        suba  pdfw1.txt  (543.606 bytes)
        suba  pdfw2.txt  (543.606 bytes)
        suba  pdfworker.php  (este arquivo)
        NAO precisa subir o pdf.worker.min.js

     Cada pedaco e MENOR que o parte4.txt (639.639 bytes) que voce ja sobe
     sem problema hoje. Este arquivo cola os dois de volta na hora de usar.

   COMO O SISTEMA ACHA ISSO SOZINHO
     O bloco novo do sistema (incremento 67) procura o motor em duas formas:
     primeiro o pdf.worker.min.js inteiro; se nao existir, o pdfworker.php.
     Voce nao precisa configurar nada — o que estiver na pasta, ele usa.

   SE NENHUM DOS DOIS ESTIVER LA
     Este arquivo responde "nao encontrado" e o sistema volta a se virar do
     jeito antigo (buscando na internet). Nada quebra.

   Versao: 1.0 — 27/07/2026
   ============================================================================ */

$D  = __DIR__;
$p1 = $D.'/pdfw1.txt';
$p2 = $D.'/pdfw2.txt';

/* os dois pedacos precisam existir; senao e melhor dizer que nao tem nada */
if (!is_file($p1) || !is_file($p2)) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo "faltam os pedacos pdfw1.txt e/ou pdfw2.txt";
    exit;
}

$tam = filesize($p1) + filesize($p2);

header('Content-Type: application/javascript; charset=utf-8');
header('Content-Length: '.$tam);
/* o motor nunca muda: pode ficar guardado no navegador por 1 ano */
header('Cache-Control: public, max-age=31536000, immutable');
header('X-Robots-Tag: noindex, nofollow');

/* o sistema pergunta primeiro "voce existe?" com um HEAD:
   nesse caso respondemos so o cabecalho, sem mandar 1 MB a toa */
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'HEAD') exit;

readfile($p1);
readfile($p2);
