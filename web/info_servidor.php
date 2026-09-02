<?php
/* info_servidor.php — Mostra o que o servidor da Locaweb suporta, para planejar a
   caixa de e-mail (leitura via IMAP). Não recebe nada, não altera nada.
   Suba este arquivo e abra no navegador: https://SEU-SITE/info_servidor.php */

header('Content-Type: application/json; charset=utf-8');
$ext = get_loaded_extensions();
$relevantes = array_values(array_filter($ext, function($e){
    $e = strtolower($e);
    return strpos($e,'imap')!==false || strpos($e,'ssl')!==false ||
           strpos($e,'mbstring')!==false || strpos($e,'iconv')!==false ||
           strpos($e,'curl')!==false;
}));

echo json_encode(array(
    'php'                  => phpversion(),
    'imap_open'            => function_exists('imap_open'),            // jeito fácil de ler e-mail
    'stream_socket_client' => function_exists('stream_socket_client'),// jeito "na mão" (já usamos no envio)
    'fsockopen'            => function_exists('fsockopen'),
    'openssl'              => extension_loaded('openssl'),            // necessário p/ conexão segura
    'mbstring'             => extension_loaded('mbstring'),           // p/ acentuação dos e-mails
    'iconv'                => function_exists('iconv'),               // idem
    'curl'                 => function_exists('curl_init'),
    'extensoes_relevantes' => $relevantes
), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);