<?php
/* testar_email.php — Teste autônomo de conta de e-mail (SMTP) para o MH3 Rental.
   Recebe os dados de uma conta SMTP, conecta no servidor, autentica e envia um
   e-mail de teste. Retorna JSON {ok, msg, log}. Não armazena nada. */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Token');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) { $in = $_POST; }

// Proteção simples contra uso aberto
$chave = isset($in['chave']) ? $in['chave'] : '';
if ($chave !== 'mh3-smtp-test-2026') {
    echo json_encode(['ok'=>false, 'msg'=>'Acesso negado.']); exit;
}

$host  = trim(isset($in['host'])?$in['host']:'');
$porta = intval(isset($in['porta'])?$in['porta']:587);
$seg   = strtolower(trim(isset($in['seg'])?$in['seg']:'tls')); // tls | ssl | nenhuma
$login = trim(isset($in['login'])?$in['login']:'');
$senha = isset($in['senha'])?$in['senha']:'';
$remetente = trim(isset($in['remetente'])?$in['remetente']:$login);
$nome_remetente = trim(isset($in['nome_remetente'])?$in['nome_remetente']:'MH3 Rental');
$para  = trim(isset($in['para'])?$in['para']:$remetente);
if ($remetente === '') $remetente = $login;
if ($para === '') $para = $remetente;

if (!$host || !$login || $senha === '') {
    echo json_encode(['ok'=>false, 'msg'=>'Preencha servidor, login e senha.']); exit;
}

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

$timeout = 15; $errno = 0; $errstr = '';
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

// Autenticou. Tenta enviar um e-mail de teste.
$r = _cmd($fp, 'MAIL FROM:<' . $remetente . '>', $log);
if (substr($r, 0, 3) !== '250') { fclose($fp); echo json_encode(['ok'=>true, 'parcial'=>true, 'msg'=>'Login OK, mas o remetente ' . $remetente . ' foi recusado: ' . trim($r), 'log'=>$log]); exit; }
$r = _cmd($fp, 'RCPT TO:<' . $para . '>', $log);
if (substr($r, 0, 3) !== '250' && substr($r, 0, 3) !== '251') { fclose($fp); echo json_encode(['ok'=>true, 'parcial'=>true, 'msg'=>'Login OK, mas o destino ' . $para . ' foi recusado: ' . trim($r), 'log'=>$log]); exit; }
$r = _cmd($fp, 'DATA', $log);
if (substr($r, 0, 3) !== '354') { fclose($fp); echo json_encode(['ok'=>true, 'parcial'=>true, 'msg'=>'Login OK, mas DATA foi recusado: ' . trim($r), 'log'=>$log]); exit; }

$corpo  = "From: " . $nome_remetente . " <" . $remetente . ">\r\n";
$corpo .= "To: <" . $para . ">\r\n";
$corpo .= "Subject: =?UTF-8?B?" . base64_encode('Teste de e-mail - MH3 Rental') . "?=\r\n";
$corpo .= "MIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n";
$corpo .= "Este e um e-mail de teste enviado pelo sistema MH3 Rental.\r\nSe voce recebeu esta mensagem, a configuracao da conta esta correta.\r\n";
fputs($fp, $corpo . "\r\n.\r\n");
$r = _ler($fp, $log);
_cmd($fp, 'QUIT', $log);
fclose($fp);

if (substr($r, 0, 3) === '250') {
    echo json_encode(['ok'=>true, 'msg'=>'Sucesso! Conexão, login e envio funcionaram. Um e-mail de teste foi enviado para ' . $para . '.', 'log'=>$log]);
} else {
    echo json_encode(['ok'=>true, 'parcial'=>true, 'msg'=>'Login OK, mas o envio final retornou: ' . trim($r), 'log'=>$log]);
}
