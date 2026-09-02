<?php
/* enviar_doc.php — Envia um e-mail com um documento PDF anexado, via SMTP, para o MH3 Rental.
   Recebe os dados de uma conta SMTP + destinatário + assunto + corpo (HTML) + PDF (base64).
   Conecta no servidor, autentica e envia a mensagem com o anexo. Retorna JSON {ok, msg, log}.
   Baseado no testar_email.php. Não armazena nada.
   ATUALIZADO 30/06/2026: após enviar com sucesso, grava uma cópia na pasta "Enviados"
   da conta (via IMAP / imap_append), para que os e-mails enviados pelo sistema apareçam
   em Enviados igual aos enviados pelo webmail. */

header('Content-Type: application/json; charset=utf-8');
@date_default_timezone_set('America/Sao_Paulo');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Token');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { $in = $_POST; }

// Proteção simples contra uso aberto
$chave = isset($in['chave']) ? $in['chave'] : '';
if ($chave !== 'mh3-envio-doc-2026') {
    echo json_encode(['ok'=>false, 'msg'=>'Acesso negado.']); exit;
}

$host  = trim(isset($in['host'])?$in['host']:'');
$porta = intval(isset($in['porta'])?$in['porta']:587);
$seg   = strtolower(trim(isset($in['seg'])?$in['seg']:'tls')); // tls | ssl | nenhuma
$login = trim(isset($in['login'])?$in['login']:'');
$senha = isset($in['senha'])?$in['senha']:'';
$remetente = trim(isset($in['remetente'])?$in['remetente']:$login);
$nome_remetente = trim(isset($in['nome_remetente'])?$in['nome_remetente']:'MH3 Rental');
$para  = trim(isset($in['para'])?$in['para']:'');
$assunto = trim(isset($in['assunto'])?$in['assunto']:'Documento - MH3 Rental');
$corpo_html = isset($in['corpo_html']) ? $in['corpo_html'] : '';
$pdf_base64 = isset($in['pdf_base64']) ? $in['pdf_base64'] : '';
$pdf_nome   = trim(isset($in['pdf_nome'])?$in['pdf_nome']:'documento.pdf');
$confirmar_receb = !empty($in['confirmar_recebimento']); // solicitar confirmação de leitura/recebimento

// Servidor IMAP (para gravar a cópia em "Enviados"). Se não vier, usa o padrão da Locaweb.
$imap_host  = trim(isset($in['imap_host'])?$in['imap_host']:'');
$imap_porta = intval(isset($in['imap_porta'])?$in['imap_porta']:0);
if ($imap_host === '') { $imap_host = 'email-ssl.com.br'; }
if ($imap_porta <= 0) { $imap_porta = 993; }

if ($remetente === '') $remetente = $login;
if (!$host || !$login || $senha === '') {
    echo json_encode(['ok'=>false, 'msg'=>'Conta de envio incompleta (servidor, login e senha).']); exit;
}
// Aceita múltiplos destinatários separados por vírgula ou ponto-e-vírgula
$lista_para = preg_split('/[;,]+/', $para);
$lista_para = array_values(array_filter(array_map('trim', $lista_para), function($e){ return $e !== ''; }));
if (count($lista_para) === 0) {
    echo json_encode(['ok'=>false, 'msg'=>'Informe ao menos um e-mail de destino.']); exit;
}
foreach ($lista_para as $e) {
    if (!preg_match('/.+@.+\..+/', $e)) {
        echo json_encode(['ok'=>false, 'msg'=>'E-mail de destino inválido: ' . $e]); exit;
    }
}

// Limpa o PDF: aceita data URI (data:application/pdf;base64,XXXX) ou base64 puro
if (strpos($pdf_base64, 'base64,') !== false) {
    $pdf_base64 = substr($pdf_base64, strpos($pdf_base64, 'base64,') + 7);
}
$pdf_base64 = preg_replace('/\s+/', '', $pdf_base64);
$tem_anexo = ($pdf_base64 !== '');
// sanitiza o nome do arquivo
$pdf_nome = preg_replace('/[^A-Za-z0-9 ._\-]/', '_', $pdf_nome);
if ($pdf_nome === '') $pdf_nome = 'documento.pdf';

$log = array();
function _ler($fp, &$log) {
    $data = '';
    while ($str = fgets($fp, 515)) {
        $data .= $str;
        $log[] = rtrim($str);
        if (isset($str[3]) && $str[3] === ' ') break;
    }
    return $data;
}
function _cmd($fp, $c, &$log, $mostrar = true) {
    fputs($fp, $c . "\r\n");
    $log[] = $mostrar ? ('> ' . $c) : '> ********';
    return _ler($fp, $log);
}

$timeout = 25; $errno = 0; $errstr = '';
$remote = ($seg === 'ssl') ? ('ssl://' . $host) : $host;
$ctx = stream_context_create(['ssl'=>['verify_peer'=>false, 'verify_peer_name'=>false, 'allow_self_signed'=>true]]);
$fp = @stream_socket_client($remote . ':' . $porta, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT, $ctx);
if (!$fp) {
    echo json_encode(['ok'=>false, 'msg'=>'Não conectou em ' . $host . ':' . $porta . ' — ' . $errstr . ' (' . $errno . ')', 'log'=>$log]); exit;
}
stream_set_timeout($fp, $timeout);

$resp = _ler($fp, $log);
if (substr($resp, 0, 3) !== '220') {
    fclose($fp);
    echo json_encode(['ok'=>false, 'msg'=>'Servidor não respondeu 220 (saudação). Resposta: ' . trim($resp), 'log'=>$log]); exit;
}

_cmd($fp, 'EHLO mh3rental.com.br', $log);

if ($seg === 'tls') {
    $r = _cmd($fp, 'STARTTLS', $log);
    if (substr($r, 0, 3) !== '220') {
        fclose($fp);
        echo json_encode(['ok'=>false, 'msg'=>'STARTTLS falhou: ' . trim($r) . ' — tente a porta 465 com SSL.', 'log'=>$log]); exit;
    }
    if (!@stream_socket_enable_crypto($fp, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        fclose($fp);
        echo json_encode(['ok'=>false, 'msg'=>'Não foi possível ativar a criptografia TLS.', 'log'=>$log]); exit;
    }
    _cmd($fp, 'EHLO mh3rental.com.br', $log);
}

$r = _cmd($fp, 'AUTH LOGIN', $log);
if (substr($r, 0, 3) !== '334') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'Servidor não aceitou AUTH LOGIN: ' . trim($r), 'log'=>$log]); exit; }
$r = _cmd($fp, base64_encode($login), $log);
if (substr($r, 0, 3) !== '334') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'Login não aceito nesta etapa: ' . trim($r), 'log'=>$log]); exit; }
$r = _cmd($fp, base64_encode($senha), $log, false);
if (substr($r, 0, 3) !== '235') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'Autenticação recusada (login ou senha incorretos): ' . trim($r), 'log'=>$log]); exit; }

$r = _cmd($fp, 'MAIL FROM:<' . $remetente . '>', $log);
if (substr($r, 0, 3) !== '250') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'Remetente ' . $remetente . ' recusado: ' . trim($r), 'log'=>$log]); exit; }
foreach ($lista_para as $dest) {
    $r = _cmd($fp, 'RCPT TO:<' . $dest . '>', $log);
    if (substr($r, 0, 3) !== '250' && substr($r, 0, 3) !== '251') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'Destino ' . $dest . ' recusado: ' . trim($r), 'log'=>$log]); exit; }
}
$r = _cmd($fp, 'DATA', $log);
if (substr($r, 0, 3) !== '354') { fclose($fp); echo json_encode(['ok'=>false, 'msg'=>'DATA recusado: ' . trim($r), 'log'=>$log]); exit; }

// Monta a mensagem MIME (multipart/mixed) com corpo HTML + anexo PDF
$bound = '=_MH3_' . md5(uniqid('', true));
if ($corpo_html === '') {
    $corpo_html = '<p style="font-family:Arial,sans-serif;font-size:13px">Segue documento em anexo (PDF).</p>';
}

$msg  = "From: " . $nome_remetente . " <" . $remetente . ">\r\n";
$msg .= "Date: " . date('r') . "\r\n";
$msg .= "Message-ID: <" . md5(uniqid('', true)) . "@" . (preg_replace('/^.*@/', '', $remetente) ?: 'mh3rental.com.br') . ">\r\n";
if ($confirmar_receb) {
    // Solicita confirmação de leitura/recebimento. O cliente de e-mail do destinatário
    // (Outlook, Thunderbird, alguns webmails) pode perguntar se deseja enviar a confirmação.
    $msg .= "Disposition-Notification-To: " . $nome_remetente . " <" . $remetente . ">\r\n";
    $msg .= "Return-Receipt-To: " . $nome_remetente . " <" . $remetente . ">\r\n";
    $msg .= "X-Confirm-Reading-To: <" . $remetente . ">\r\n";
}
$to_header = implode(', ', array_map(function($e){ return '<' . $e . '>'; }, $lista_para));
$msg .= "To: " . $to_header . "\r\n";
$msg .= "Subject: =?UTF-8?B?" . base64_encode($assunto) . "?=\r\n";
$msg .= "MIME-Version: 1.0\r\n";

if ($tem_anexo) {
    $msg .= "Content-Type: multipart/mixed; boundary=\"" . $bound . "\"\r\n\r\n";
    $msg .= "--" . $bound . "\r\n";
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($corpo_html)) . "\r\n";
    $msg .= "--" . $bound . "\r\n";
    $msg .= "Content-Type: application/pdf; name=\"" . $pdf_nome . "\"\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n";
    $msg .= "Content-Disposition: attachment; filename=\"" . $pdf_nome . "\"\r\n\r\n";
    $msg .= chunk_split($pdf_base64) . "\r\n";
    $msg .= "--" . $bound . "--\r\n";
} else {
    $msg .= "Content-Type: text/html; charset=UTF-8\r\n";
    $msg .= "Content-Transfer-Encoding: base64\r\n\r\n";
    $msg .= chunk_split(base64_encode($corpo_html)) . "\r\n";
}

// envia o corpo e finaliza com <CRLF>.<CRLF>
fputs($fp, $msg . "\r\n.\r\n");
$r = _ler($fp, $log);
_cmd($fp, 'QUIT', $log);
fclose($fp);

if (substr($r, 0, 3) === '250') {
    // ===== Grava uma cópia na pasta "Enviados" (via IMAP) =====
    // Assim os e-mails enviados pelo sistema aparecem em Enviados, igual aos do webmail.
    $salvou_enviados = false;
    $enviados_msg = '';
    if (function_exists('imap_open')) {
        $ref = '{' . $imap_host . ':' . $imap_porta . '/imap/ssl/novalidate-cert}';
        $mbox = @imap_open($ref . 'INBOX', $login, $senha, 0, 1);
        if ($mbox) {
            // Descobre o nome real da pasta de enviados (Sent, INBOX.Sent, Enviados, etc.)
            $pasta_sent = '';
            $lista = @imap_list($mbox, $ref, '*');
            if (is_array($lista)) {
                foreach ($lista as $l) {
                    $n = str_replace($ref, '', $l);
                    $low = strtolower($n);
                    if ($low === 'inbox') { continue; }
                    if (strpos($low, 'sent') !== false || strpos($low, 'enviad') !== false) { $pasta_sent = $n; break; }
                }
            }
            if ($pasta_sent === '') { $pasta_sent = 'INBOX.Sent'; } // padrão Locaweb
            // imap_append precisa da mensagem completa (cabeçalhos + corpo). Marca como lida.
            $ok_app = @imap_append($mbox, $ref . $pasta_sent, $msg, "\\Seen");
            if ($ok_app) {
                $salvou_enviados = true;
            } else {
                $err = @imap_last_error();
                $enviados_msg = 'Não consegui gravar em "' . $pasta_sent . '"' . ($err ? (': ' . $err) : '');
            }
            @imap_close($mbox);
        } else {
            $err = @imap_last_error();
            $enviados_msg = 'IMAP não conectou' . ($err ? (': ' . $err) : '');
        }
    } else {
        $enviados_msg = 'Extensão IMAP indisponível no servidor.';
    }

    echo json_encode([
        'ok'=>true,
        'msg'=>'E-mail enviado para ' . $para . ($tem_anexo ? ' com o PDF em anexo.' : '.'),
        'salvou_enviados'=>$salvou_enviados,
        'enviados_msg'=>$enviados_msg,
        'log'=>$log
    ]);
} else {
    echo json_encode(['ok'=>false, 'msg'=>'Envio final retornou: ' . trim($r), 'log'=>$log]);
}
