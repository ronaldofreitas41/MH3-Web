<?php
// ============================================================
// MH3 RENTAL — API v2
// Arquivo: api.php
// ============================================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Token');
// SEGURANÇA: Headers de proteção
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Referrer-Policy: strict-origin-when-cross-origin');
// HSTS — força HTTPS por 1 ano (só ativa se já estiver em HTTPS, evita quebrar)
if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
    header('Strict-Transport-Security: max-age=31536000');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

// ============ CONFIG ============
define('DB_HOST', 'mh3sistema.mysql.dbaas.com.br');
define('DB_NAME', 'mh3sistema');
define('DB_USER', 'mh3sistema');
define('DB_PASS', 'Fraga62970123#');
define('SMTP_FROM', 'sistema@mh3rental.com.br');
define('SMTP_NAME', 'MH3 Rental Sistema');
define('SESSION_HOURS', 12);

// ============ BANCO ============
try {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro'=>'Conexão falhou: '.$e->getMessage()]); exit();
}

// ============ CRIAR TABELAS ============
$pdo->exec("
CREATE TABLE IF NOT EXISTS mh3_dados (
    id VARCHAR(60) PRIMARY KEY,
    modulo VARCHAR(50) NOT NULL,
    dados LONGTEXT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_modulo (modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_config (
    chave VARCHAR(100) PRIMARY KEY,
    valor LONGTEXT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_usuarios (
    id VARCHAR(60) PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    login VARCHAR(80) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    perfil VARCHAR(50) DEFAULT 'operacional',
    permissoes TEXT,
    ativo TINYINT(1) DEFAULT 1,
    ultimo_acesso TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_sessoes (
    token VARCHAR(64) PRIMARY KEY,
    usuario_id VARCHAR(60) NOT NULL,
    usuario_nome VARCHAR(150),
    usuario_perfil VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expira_em TIMESTAMP NOT NULL,
    INDEX idx_expira (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_tentativas (id INT AUTO_INCREMENT PRIMARY KEY, login VARCHAR(80), ip VARCHAR(45), sucesso TINYINT(1), criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_login_tempo (login, criado_em)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
CREATE TABLE IF NOT EXISTS mh3_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id VARCHAR(60),
    usuario_nome VARCHAR(150),
    usuario_perfil VARCHAR(50),
    acao VARCHAR(200),
    modulo VARCHAR(50),
    descricao TEXT,
    dado_id VARCHAR(100),
    dado_antes LONGTEXT,
    dado_depois LONGTEXT,
    ip VARCHAR(45),
    navegador VARCHAR(255),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_criado (criado_em),
    INDEX idx_usuario (usuario_nome),
    INDEX idx_modulo (modulo),
    INDEX idx_acao (acao)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    referencia VARCHAR(100),
    enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    destinatario VARCHAR(200),
    INDEX idx_ref (referencia)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mh3_email_contas (
    id VARCHAR(60) PRIMARY KEY,
    usuario_id VARCHAR(60) NOT NULL,
    apelido VARCHAR(120),
    remetente VARCHAR(190) NOT NULL,
    nome_remetente VARCHAR(150),
    host VARCHAR(190) NOT NULL,
    porta INT NOT NULL DEFAULT 587,
    seg VARCHAR(10) DEFAULT 'tls',
    usuario VARCHAR(190) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    ativo TINYINT(1) DEFAULT 1,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Auto-conserto: garante que a tabela de auditoria (mh3_log) tenha todas as colunas.
// Em instalações antigas faltavam colunas e por isso a gravação do log falhava silenciosamente.
garantirColunasLog($pdo);

// Cria admin padrão se não existir
$chk = $pdo->query("SELECT COUNT(*) as n FROM mh3_usuarios")->fetch();
if ($chk['n'] == 0) {
    $pdo->prepare("INSERT INTO mh3_usuarios (id,nome,login,senha,perfil,ativo) VALUES (?,?,?,?,?,1)")
        ->execute([uniqid(), 'Noninho Fraga', 'noninho', password_hash('mh3@2025', PASSWORD_DEFAULT), 'admin']);
}

// ============ RESET DE EMERGÊNCIA ============
// Acesse: api.php?action=reset_admin&chave=MH3-JbN1UD18AHP4XOcOmokb&senha=novasenha
// Redefine a senha do noninho. Use só se esquecer a senha.
if (($_GET['action'] ?? '') === 'reset_admin') {
    if (($_GET['chave'] ?? '') !== 'MH3-JbN1UD18AHP4XOcOmokb') { http_response_code(403); echo json_encode(['ok'=>false,'msg'=>'Chave incorreta']); exit(); }
    $novaSenha = $_GET['senha'] ?? 'mh3@2025';
    if (strlen($novaSenha) < 6) { echo json_encode(['ok'=>false,'msg'=>'Senha muito curta (min 6)']); exit(); }
    $hash = password_hash($novaSenha, PASSWORD_DEFAULT);
    $u = $pdo->query("SELECT id FROM mh3_usuarios WHERE login='noninho'")->fetch();
    if ($u) {
        $pdo->prepare("UPDATE mh3_usuarios SET senha=?, ativo=1 WHERE login='noninho'")->execute([$hash]);
        echo json_encode(['ok'=>true,'msg'=>'Senha do noninho redefinida para: '.$novaSenha]);
    } else {
        $pdo->prepare("INSERT INTO mh3_usuarios (id,nome,login,senha,perfil,ativo) VALUES (?,?,?,?,?,1)")
            ->execute([uniqid(), 'Noninho Fraga', 'noninho', $hash, 'admin']);
        echo json_encode(['ok'=>true,'msg'=>'Admin noninho criado com senha: '.$novaSenha]);
    }
    exit();
}

// ============ HELPERS ============
function resp($data) { echo json_encode($data, JSON_UNESCAPED_UNICODE); exit(); }
function err($msg, $code=400) { http_response_code($code); resp(['ok'=>false,'msg'=>$msg]); }
function logAction($pdo, $usr, $acao, $mod='', $opts=[]) {
    try {
        $sessao = validarSessao($pdo);
        $uid    = $sessao['usuario_id'] ?? ($opts['uid'] ?? '');
        $uperfil= $sessao['usuario_perfil'] ?? ($opts['perfil'] ?? '');
        $nav    = substr($_SERVER['HTTP_USER_AGENT']??'', 0, 200);
        $pdo->prepare("INSERT INTO mh3_log 
            (usuario_id,usuario_nome,usuario_perfil,acao,modulo,descricao,dado_id,dado_antes,dado_depois,ip,navegador)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([
                $uid, $usr, $uperfil, $acao, $mod,
                $opts['desc']   ?? null,
                $opts['id']     ?? null,
                isset($opts['antes'])  ? json_encode($opts['antes'],  JSON_UNESCAPED_UNICODE) : null,
                isset($opts['depois']) ? json_encode($opts['depois'], JSON_UNESCAPED_UNICODE) : null,
                $_SERVER['REMOTE_ADDR'] ?? '',
                $nav
            ]);
    } catch(Exception $e){}
}

// Em instalações antigas a tabela mh3_log pode ter menos colunas do que o sistema usa hoje.
// Aqui detectamos o que falta e adicionamos — assim a gravação de auditoria volta a funcionar.
function garantirColunasLog($pdo) {
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM mh3_log")->fetchAll(PDO::FETCH_COLUMN);
        if (!is_array($cols)) return;
        $necessarias = [
            'usuario_id'     => "ADD COLUMN usuario_id VARCHAR(60)",
            'usuario_nome'   => "ADD COLUMN usuario_nome VARCHAR(150)",
            'usuario_perfil' => "ADD COLUMN usuario_perfil VARCHAR(50)",
            'acao'           => "ADD COLUMN acao VARCHAR(200)",
            'modulo'         => "ADD COLUMN modulo VARCHAR(50)",
            'descricao'      => "ADD COLUMN descricao TEXT",
            'dado_id'        => "ADD COLUMN dado_id VARCHAR(100)",
            'dado_antes'     => "ADD COLUMN dado_antes LONGTEXT",
            'dado_depois'    => "ADD COLUMN dado_depois LONGTEXT",
            'ip'             => "ADD COLUMN ip VARCHAR(45)",
            'navegador'      => "ADD COLUMN navegador VARCHAR(255)"
        ];
        $faltam = [];
        foreach ($necessarias as $coluna => $sqlAdd) {
            if (!in_array($coluna, $cols)) $faltam[] = $sqlAdd;
        }
        if (!empty($faltam)) {
            $pdo->exec("ALTER TABLE mh3_log " . implode(", ", $faltam));
        }
    } catch (Exception $e) { /* silencioso: se já estiver tudo certo, não faz nada */ }
}

function getToken() {
    return $_SERVER['HTTP_X_TOKEN'] ?? $_GET['token'] ?? '';
}

function validarSessao($pdo) {
    $token = getToken();
    if (!$token) return null;
    $stmt = $pdo->prepare("SELECT * FROM mh3_sessoes WHERE token=? AND expira_em > NOW()");
    $stmt->execute([$token]);
    return $stmt->fetch() ?: null;
}

function requerAuth($pdo) {
    $s = validarSessao($pdo);
    if (!$s) err('Sessão expirada. Faça login novamente.', 401);
    return $s;
}

// SEGURANÇA: Valida permissão específica no servidor (não confia só no navegador)
function requerPermissao($pdo, $permissao) {
    $s = requerAuth($pdo);
    // Admin tem acesso total
    if (($s['usuario_perfil'] ?? '') === 'admin') return $s;
    // Busca permissões do usuário no banco
    $stmt = $pdo->prepare("SELECT permissoes FROM mh3_usuarios WHERE id=?");
    $stmt->execute([$s['usuario_id']]);
    $row = $stmt->fetch();
    $perms = $row && $row['permissoes'] ? json_decode($row['permissoes'], true) : [];
    if (empty($perms[$permissao])) {
        logAction($pdo, $s['usuario_nome'] ?? '?', 'ACESSO_NEGADO_' . strtoupper($permissao));
        err('Você não tem permissão para esta ação.', 403);
    }
    return $s;
}

// SEGURANÇA: Valida força da senha (mín 8 chars, com letra e número)
function senhaForte($senha) {
    if (strlen($senha) < 8) return 'A senha deve ter pelo menos 8 caracteres';
    if (!preg_match('/[A-Za-z]/', $senha)) return 'A senha deve conter pelo menos uma letra';
    if (!preg_match('/[0-9]/', $senha)) return 'A senha deve conter pelo menos um número';
    return null; // OK
}

// ============ CLIENTE SMTP (login/senha, sem dependências) ============
function smtpRead($fp){
    $data='';
    while(($str = fgets($fp, 600)) !== false){
        $data .= $str;
        if (strlen($str) >= 4 && $str[3] === ' ') break;
    }
    return $data;
}
function smtpCmd($fp, $cmd, $expect){
    if($cmd!==null) fputs($fp, $cmd."\r\n");
    $resp = smtpRead($fp);
    $code = (int)substr($resp,0,3);
    $exp = is_array($expect)?$expect:[$expect];
    return [in_array($code,$exp), trim($resp)];
}
function mh3_mimehdr($s){
    if($s==='' || preg_match('/^[\x20-\x7E]*$/',$s)) return $s; // ASCII puro
    if(function_exists('mb_encode_mimeheader')) return mb_encode_mimeheader($s,'UTF-8','B',"\r\n");
    return '=?UTF-8?B?'.base64_encode($s).'?=';
}
function enviarSMTP($conta, $para, $assunto, $corpoHtml){
    $host=$conta['host']; $porta=(int)$conta['porta']; $seg=strtolower($conta['seg']??'tls');
    $user=$conta['usuario']; $pass=$conta['senha'];
    $from=$conta['remetente']; $fromName=($conta['nome_remetente']!=='' && $conta['nome_remetente']!==null)?$conta['nome_remetente']:$from;
    // Sanitiza contra injeção de cabeçalho/SMTP (remove CR/LF)
    $semQuebra = function($s){ return trim(str_replace(array("\r","\n","\0"), '', (string)$s)); };
    $para=$semQuebra($para); $from=$semQuebra($from); $fromName=$semQuebra($fromName); $assunto=$semQuebra($assunto);
    if($para===''||$from==='') return [false,'Remetente ou destinatario invalido'];
    $remote = ($seg==='ssl') ? "ssl://$host:$porta" : "tcp://$host:$porta";
    $ctx=stream_context_create(['ssl'=>['verify_peer'=>false,'verify_peer_name'=>false,'allow_self_signed'=>true]]);
    $fp=@stream_socket_client($remote,$errno,$errstr,15,STREAM_CLIENT_CONNECT,$ctx);
    if(!$fp) return [false,"Nao conectou ao servidor ($errstr)"];
    stream_set_timeout($fp,15);
    list($ok,$r)=smtpCmd($fp,null,220); if(!$ok){fclose($fp);return [false,'Sem resposta inicial do servidor'];}
    $ehlo='EHLO '.($_SERVER['SERVER_NAME']??'mh3rental.com.br');
    list($ok,$r)=smtpCmd($fp,$ehlo,250); if(!$ok){fclose($fp);return [false,'EHLO recusado: '.$r];}
    if($seg==='tls'){
        list($ok,$r)=smtpCmd($fp,'STARTTLS',220); if(!$ok){fclose($fp);return [false,'STARTTLS recusado: '.$r];}
        if(!@stream_socket_enable_crypto($fp,true,STREAM_CRYPTO_METHOD_TLS_CLIENT|STREAM_CRYPTO_METHOD_TLSv1_2_CLIENT)){fclose($fp);return [false,'Falha ao ativar TLS'];}
        smtpCmd($fp,$ehlo,250);
    }
    list($ok,$r)=smtpCmd($fp,'AUTH LOGIN',334); if(!$ok){fclose($fp);return [false,'Servidor nao aceitou AUTH LOGIN: '.$r];}
    list($ok,$r)=smtpCmd($fp,base64_encode($user),334); if(!$ok){fclose($fp);return [false,'Login recusado'];}
    list($ok,$r)=smtpCmd($fp,base64_encode($pass),235); if(!$ok){fclose($fp);return [false,'Login ou senha incorretos'];}
    list($ok,$r)=smtpCmd($fp,"MAIL FROM:<$from>",250); if(!$ok){fclose($fp);return [false,'Remetente recusado: '.$r];}
    list($ok,$r)=smtpCmd($fp,"RCPT TO:<$para>",[250,251]); if(!$ok){fclose($fp);return [false,'Destinatario recusado: '.$r];}
    list($ok,$r)=smtpCmd($fp,'DATA',354); if(!$ok){fclose($fp);return [false,'DATA recusado: '.$r];}
    $headers ="From: ".mh3_mimehdr($fromName)." <$from>\r\n";
    $headers.="To: <$para>\r\n";
    $headers.="Subject: ".mh3_mimehdr($assunto)."\r\n";
    $headers.="MIME-Version: 1.0\r\n";
    $headers.="Content-Type: text/html; charset=UTF-8\r\n";
    $headers.="Content-Transfer-Encoding: 8bit\r\n";
    $body=preg_replace('/^\./m','..',$corpoHtml);
    fputs($fp,$headers."\r\n".$body."\r\n.\r\n");
    list($ok,$r)=smtpCmd($fp,null,250);
    @smtpCmd($fp,'QUIT',221); fclose($fp);
    if(!$ok) return [false,'Servidor recusou a mensagem: '.$r];
    return [true,'enviado'];
}

// ============ ROTEADOR ============
$action = $_GET['action'] ?? $_POST['action'] ?? '';
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

switch ($action) {

// ============ AUTH ============
case 'login':
    $login = trim($body['login'] ?? '');
    $senha = $body['senha'] ?? '';
    if (!$login || !$senha) err('Login e senha obrigatórios');

    // SEGURANÇA: Anti-força-bruta — bloqueia após 5 tentativas falhas em 15 min
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    $chkStmt = $pdo->prepare("SELECT COUNT(*) FROM mh3_tentativas WHERE login=? AND sucesso=0 AND criado_em > DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
    $chkStmt->execute([$login]);
    $tentativasFalhas = (int)$chkStmt->fetchColumn();
    if ($tentativasFalhas >= 5) {
        logAction($pdo, $login, 'LOGIN_BLOQUEADO');
        err('Muitas tentativas de login. Aguarde 15 minutos e tente novamente.', 429);
    }

    $stmt = $pdo->prepare("SELECT * FROM mh3_usuarios WHERE login=? AND ativo=1");
    $stmt->execute([$login]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($senha, $user['senha'])) {
        // Registra tentativa falha
        $pdo->prepare("INSERT INTO mh3_tentativas (login,ip,sucesso) VALUES (?,?,0)")->execute([$login, $ip]);
        logAction($pdo, $login, 'LOGIN_FALHOU');
        $restantes = 5 - ($tentativasFalhas + 1);
        $msg = $restantes > 0 ? "Login ou senha incorretos. Restam $restantes tentativas." : "Login ou senha incorretos.";
        err($msg, 401);
    }

    // Login OK — registra tentativa bem-sucedida e limpa as falhas antigas
    $pdo->prepare("INSERT INTO mh3_tentativas (login,ip,sucesso) VALUES (?,?,1)")->execute([$login, $ip]);
    $pdo->prepare("DELETE FROM mh3_tentativas WHERE login=? AND sucesso=0")->execute([$login]);

    // Gera token
    $token = bin2hex(random_bytes(32));
    $expira = date('Y-m-d H:i:s', time() + SESSION_HOURS * 3600);
    $pdo->prepare("INSERT INTO mh3_sessoes (token,usuario_id,usuario_nome,usuario_perfil,expira_em) VALUES (?,?,?,?,?)")
        ->execute([$token, $user['id'], $user['nome'], $user['perfil'], $expira]);

    // Atualiza ultimo acesso
    $pdo->prepare("UPDATE mh3_usuarios SET ultimo_acesso=NOW() WHERE id=?")
        ->execute([$user['id']]);

    logAction($pdo, $user['nome'], 'LOGIN_OK');
    resp(['ok'=>true,'token'=>$token,'nome'=>$user['nome'],'perfil'=>$user['perfil'],
          'permissoes'=>$user['permissoes']?json_decode($user['permissoes'],true):null,
          'expira'=>$expira]);

case 'logout':
    $token = getToken();
    if ($token) $pdo->prepare("DELETE FROM mh3_sessoes WHERE token=?")->execute([$token]);
    resp(['ok'=>true]);

case 'verificar':
    $s = validarSessao($pdo);
    if ($s) resp(['ok'=>true,'nome'=>$s['usuario_nome'],'perfil'=>$s['usuario_perfil']]);
    else err('Sessão inválida', 401);

case 'trocar_senha':
    $s = requerAuth($pdo);
    $nova = $body['nova'] ?? '';
    $erroSenha = senhaForte($nova);
    if ($erroSenha) err($erroSenha);
    $hash = password_hash($nova, PASSWORD_DEFAULT);
    $pdo->prepare("UPDATE mh3_usuarios SET senha=? WHERE id=?")->execute([$hash, $s['usuario_id']]);
    logAction($pdo, $s['usuario_nome'], 'SENHA_ALTERADA');
    resp(['ok'=>true]);

// ============ USUÁRIOS ============
case 'usuarios_listar':
    requerAuth($pdo);
    $rows = $pdo->query("SELECT id,nome,login,perfil,ativo,ultimo_acesso,criado_em FROM mh3_usuarios ORDER BY nome")->fetchAll();
    resp(['ok'=>true,'dados'=>$rows]);

case 'usuario_salvar':
    // SEGURANÇA: só admin pode gerenciar usuários
    $s = requerPermissao($pdo, 'adm');
    $nome  = trim($body['nome'] ?? '');
    $login = trim($body['login'] ?? '');
    $senha = $body['senha'] ?? '';
    $perfil= $body['perfil'] ?? 'operacional';
    $perms = $body['permissoes'] ?? null;
    $eid   = $body['id'] ?? '';
    if (!$nome || !$login) err('Nome e login obrigatórios');
    // Senha forte (se foi informada)
    if ($senha) { $erroSenha = senhaForte($senha); if ($erroSenha) err($erroSenha); }

    if ($eid) {
        $sql = "UPDATE mh3_usuarios SET nome=?,login=?,perfil=?,permissoes=?";
        $params = [$nome, $login, $perfil, $perms?json_encode($perms):null];
        if ($senha) { $sql .= ",senha=?"; $params[] = password_hash($senha, PASSWORD_DEFAULT); }
        $sql .= " WHERE id=?"; $params[] = $eid;
        $pdo->prepare($sql)->execute($params);
        logAction($pdo, $s['usuario_nome'], 'USUARIO_EDITADO', $nome);
    } else {
        if (!$senha) err('Senha obrigatória para novo usuário');
        $id = uniqid('usr_');
        $pdo->prepare("INSERT INTO mh3_usuarios (id,nome,login,senha,perfil,permissoes,ativo) VALUES (?,?,?,?,?,?,1)")
            ->execute([$id, $nome, $login, password_hash($senha, PASSWORD_DEFAULT), $perfil, $perms?json_encode($perms):null]);
        logAction($pdo, $s['usuario_nome'], 'USUARIO_CRIADO', $nome);
    }
    resp(['ok'=>true]);

case 'usuario_deletar':
    $s = requerPermissao($pdo, 'adm');
    $id = $body['id'] ?? '';
    if (!$id) err('ID obrigatório');
    $pdo->prepare("UPDATE mh3_usuarios SET ativo=0 WHERE id=?")->execute([$id]);
    logAction($pdo, $s['usuario_nome'], 'USUARIO_DESATIVADO');
    resp(['ok'=>true]);

// ============ DADOS ============
case 'salvar':
    $s = requerAuth($pdo);
    $modulo = $body['modulo'] ?? '';
    $itens  = $body['dados']  ?? [];
    $excluir = $body['excluir'] ?? [];
    if (!$modulo) err('Módulo não informado');
    // IMPORTANTE: NÃO apagamos mais o módulo inteiro. Antes havia um
    // "DELETE FROM mh3_dados WHERE modulo=?" que fazia um usuário apagar o
    // trabalho do outro ao salvar ao mesmo tempo. Agora atualizamos registro
    // por registro (upsert) e removemos APENAS os IDs explicitamente marcados.
    $stmt = $pdo->prepare("INSERT INTO mh3_dados (id,modulo,dados) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE dados=VALUES(dados), atualizado_em=NOW()");
    foreach ($itens as $item) {
        $id = $item['id'] ?? uniqid();
        $stmt->execute([$id, $modulo, json_encode($item, JSON_UNESCAPED_UNICODE)]);
    }
    if (is_array($excluir) && count($excluir) > 0) {
        $del = $pdo->prepare("DELETE FROM mh3_dados WHERE modulo=? AND id=?");
        foreach ($excluir as $delId) { if ($delId !== '' && $delId !== null) $del->execute([$modulo, $delId]); }
    }
    logAction($pdo, $s['usuario_nome'], 'SALVAR', $modulo, ['desc'=>'Sync: '.count($itens).' reg / '.(is_array($excluir)?count($excluir):0).' excl']);
    resp(['ok'=>true,'total'=>count($itens),'excluidos'=>(is_array($excluir)?count($excluir):0)]);

case 'ultima_alteracao':
    // Verificação LEVE para sync automático: versão de cada módulo
    // (maior data de alteração + total de registros). Muda em criação, edição e exclusão.
    requerAuth($pdo);
    $rows = $pdo->query("SELECT modulo, MAX(atualizado_em) as ts, COUNT(*) as cnt FROM mh3_dados GROUP BY modulo")->fetchAll();
    $mods = [];
    foreach($rows as $r){ $mods[$r['modulo']] = ($r['ts'] ?? '').'|'.(int)($r['cnt'] ?? 0); }
    resp(['ok'=>true, 'mods'=>$mods]);

case 'upload_foto':
    $s = requerAuth($pdo);
    $b64  = $body['data'] ?? '';
    $nome = $body['nome'] ?? 'foto';
    if (!$b64) err('Nenhuma imagem recebida');
    // tira o prefixo data:image/...;base64,
    if (strpos($b64, ',') !== false) { $b64 = substr($b64, strpos($b64, ',') + 1); }
    $bin = base64_decode($b64, true);
    if ($bin === false || strlen($bin) < 50) err('Imagem inválida');
    // pasta de uploads (na mesma pasta do api.php)
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
    if (!is_dir($dir) || !is_writable($dir)) err('Pasta de uploads indisponível no servidor', 500);
    $fname = 'f_' . date('Ymd_His') . '_' . substr(md5(uniqid('', true)), 0, 10) . '.jpg';
    if (file_put_contents($dir . '/' . $fname, $bin) === false) err('Falha ao gravar a imagem', 500);
    resp(['ok'=>true, 'url'=>'uploads/' . $fname, 'nome'=>$nome]);

case 'buscar':
    requerAuth($pdo);
    $modulo = $_GET['modulo'] ?? $body['modulo'] ?? '';
    if (!$modulo) resp(['ok'=>false,'dados'=>[]]);
    $stmt = $pdo->prepare("SELECT dados FROM mh3_dados WHERE modulo=? ORDER BY criado_em ASC");
    $stmt->execute([$modulo]);
    $rows = array_map(fn($r) => json_decode($r['dados'],true), $stmt->fetchAll());
    resp(['ok'=>true,'dados'=>$rows]);

case 'buscar_tudo':
    requerAuth($pdo);
    $stmt = $pdo->query("SELECT modulo,dados FROM mh3_dados ORDER BY criado_em ASC");
    $result = [];
    foreach ($stmt->fetchAll() as $row) {
        $mod = $row['modulo'];
        if (!isset($result[$mod])) $result[$mod] = [];
        $result[$mod][] = json_decode($row['dados'],true);
    }
    resp(['ok'=>true,'dados'=>$result]);

case 'salvar_config':
    requerAuth($pdo);
    $config = $body['config'] ?? [];
    $pdo->prepare("REPLACE INTO mh3_config (chave,valor) VALUES ('geral',?)")
        ->execute([json_encode($config, JSON_UNESCAPED_UNICODE)]);
    resp(['ok'=>true]);

case 'buscar_config':
    requerAuth($pdo);
    $stmt = $pdo->prepare("SELECT valor FROM mh3_config WHERE chave='geral'");
    $stmt->execute();
    $row = $stmt->fetch();
    resp(['ok'=>true,'config'=> $row ? json_decode($row['valor'],true) : null]);

case 'deletar':
    $modulo = $body['modulo'] ?? '';
    // SEGURANÇA: requer permissão de excluir no módulo (admin sempre pode)
    $mapPerm = ['frota'=>'frota-excluir','manutencao'=>'manut-excluir','contratos'=>'cts-excluir',
                'medicoes'=>'meds-excluir','vendas'=>'vend-excluir','estoque'=>'estq-excluir',
                'despesas'=>'desp-excluir','financeiro'=>'fin-excluir'];
    $permNecessaria = $mapPerm[$modulo] ?? null;
    $s = $permNecessaria ? requerPermissao($pdo, $permNecessaria) : requerAuth($pdo);
    $id     = $body['id']     ?? '';
    $descr  = $body['desc']   ?? '';
    if (!$id) err('ID obrigatório');
    // Guarda dado antes de deletar
    $ant = $pdo->prepare("SELECT dados, modulo FROM mh3_dados WHERE id=?");
    $ant->execute([$id]);
    $antes = $ant->fetch();
    $pdo->prepare("DELETE FROM mh3_dados WHERE id=?")->execute([$id]);
    logAction($pdo, $s['usuario_nome'], 'EXCLUIR', $antes['modulo']??$modulo, [
        'id'    => $id,
        'desc'  => $descr ?: 'Exclusão em '.($antes['modulo']??$modulo),
        'antes' => $antes ? json_decode($antes['dados'],true) : null
    ]);
    resp(['ok'=>true]);

// ============ ALERTAS POR E-MAIL ============
case 'verificar_alertas':
    requerAuth($pdo);
    $dados_raw = $pdo->query("SELECT dados FROM mh3_dados WHERE modulo IN ('medicoes','contratos','estoque','manutencoes') ORDER BY modulo")->fetchAll();
    $cfg_row = $pdo->prepare("SELECT valor FROM mh3_config WHERE chave='geral'");
    $cfg_row->execute();
    $cfg_r = $cfg_row->fetch();
    $cfg = $cfg_r ? json_decode($cfg_r['valor'],true) : [];
    $email_adm = $cfg['email_adm'] ?? 'adm@mh3rental.com.br';
    $alertas_enviados = 0;
    $hoje = date('Y-m-d');
    $alertas = [];

    foreach ($dados_raw as $row) {
        $item = json_decode($row['dados'],true);
        if (!$item) continue;

        // Medição vencendo
        if (isset($item['vc']) && isset($item['cl'])) {
            $dias = (strtotime($item['vc']) - time()) / 86400;
            $ref = 'med_'.$item['id'];
            $jaEnviou = $pdo->prepare("SELECT id FROM mh3_alertas WHERE referencia=? AND DATE(enviado_em)=?")->execute([$ref,$hoje]);
            if ($dias <= 5 && $dias >= 0 && $item['st'] !== 'paga') {
                $alertas[] = ['tipo'=>'medicao','msg'=>"Medição de {$item['cl']} vence em ".ceil($dias)." dia(s) — R$ ".number_format($item['total']??0,2,',','.'),'ref'=>$ref];
            }
        }
        // Estoque baixo
        if (isset($item['qt']) && isset($item['mn']) && isset($item['ds'])) {
            if ($item['qt'] <= $item['mn']) {
                $alertas[] = ['tipo'=>'estoque','msg'=>"Estoque baixo: {$item['ds']} — {$item['qt']} {$item['un']} restantes",'ref'=>'estq_'.$item['id']];
            }
        }
    }

    if (!empty($alertas)) {
        $corpo = "<h2 style='color:#C8102E;font-family:Arial'>MH3 Rental — Alertas do Sistema</h2><p style='font-family:Arial;color:#333'>".date('d/m/Y H:i')."</p><ul style='font-family:Arial'>";
        foreach ($alertas as $a) $corpo .= "<li style='margin-bottom:8px'><b>".ucfirst($a['tipo']).":</b> {$a['msg']}</li>";
        $corpo .= "</ul><p style='font-family:Arial;color:#999;font-size:12px'>Sistema MH3 Rental — mh3rental.com.br</p>";

        $boundary = md5(time());
        $headers  = "From: ".SMTP_NAME." <".SMTP_FROM.">\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=utf-8\r\n";

        $enviou = @mail($email_adm, "🚨 MH3 — ".count($alertas)." Alerta(s) Pendente(s)", $corpo, $headers);
        if ($enviou) {
            foreach ($alertas as $a) {
                $pdo->prepare("INSERT IGNORE INTO mh3_alertas (tipo,referencia,destinatario) VALUES (?,?,?)")
                    ->execute([$a['tipo'],$a['ref'],$email_adm]);
            }
            $alertas_enviados = count($alertas);
        }
    }
    resp(['ok'=>true,'alertas'=>count($alertas),'enviados'=>$alertas_enviados]);

// ============ VALIDAR SENHA DO USUÁRIO LOGADO (sem lockout, p/ auditoria) ============
case 'validar_senha':
    $s = requerAuth($pdo);
    $senha = $body['senha'] ?? '';
    if ($senha === '') resp(['ok'=>true,'valida'=>false]);
    $stmt = $pdo->prepare("SELECT senha FROM mh3_usuarios WHERE id=?");
    $stmt->execute([$s['usuario_id']]);
    $u = $stmt->fetch();
    $valida = $u && password_verify($senha, $u['senha']);
    resp(['ok'=>true,'valida'=>$valida]);

// ============ CONTAS DE E-MAIL (uma por usuário) ============
case 'email_conta_listar':
    $s = requerAuth($pdo);
    if (($s['usuario_perfil']??'')==='admin') {
        $rows = $pdo->query("SELECT id,usuario_id,apelido,remetente,nome_remetente,host,porta,seg,usuario,ativo FROM mh3_email_contas ORDER BY apelido")->fetchAll();
    } else {
        $stmt=$pdo->prepare("SELECT id,usuario_id,apelido,remetente,nome_remetente,host,porta,seg,usuario,ativo FROM mh3_email_contas WHERE usuario_id=?");
        $stmt->execute([$s['usuario_id']]); $rows=$stmt->fetchAll();
    }
    resp(['ok'=>true,'contas'=>$rows]);

case 'email_conta_minha':
    $s = requerAuth($pdo);
    $stmt=$pdo->prepare("SELECT id,apelido,remetente,nome_remetente,host,porta,seg,usuario,ativo FROM mh3_email_contas WHERE usuario_id=?");
    $stmt->execute([$s['usuario_id']]); $c=$stmt->fetch();
    resp(['ok'=>true,'conta'=>$c?:null]);

case 'email_conta_salvar':
    $s = requerAuth($pdo);
    if (($s['usuario_perfil']??'')!=='admin') err('Apenas o administrador pode cadastrar contas.',403);
    $uid = $body['usuario_id'] ?? '';
    $remetente = trim($body['remetente'] ?? '');
    $host = trim($body['host'] ?? '');
    $usuario = trim($body['usuario'] ?? '');
    if(!$uid||!$remetente||!$host||!$usuario) err('Usuário liberado, remetente, servidor e login são obrigatórios.');
    $porta=(int)($body['porta']??587); if(!$porta)$porta=587;
    $seg=in_array(($body['seg']??'tls'),['ssl','tls','nenhuma'])?$body['seg']:'tls';
    $apelido=trim($body['apelido']??''); $nome=trim($body['nome_remetente']??'');
    $ativo=isset($body['ativo'])?(int)$body['ativo']:1; $senha=$body['senha']??'';
    $ex=$pdo->prepare("SELECT id,senha FROM mh3_email_contas WHERE usuario_id=?"); $ex->execute([$uid]); $cur=$ex->fetch();
    if($cur){
        $senhaFinal = ($senha!=='') ? $senha : $cur['senha'];
        $pdo->prepare("UPDATE mh3_email_contas SET apelido=?,remetente=?,nome_remetente=?,host=?,porta=?,seg=?,usuario=?,senha=?,ativo=? WHERE usuario_id=?")
            ->execute([$apelido,$remetente,$nome,$host,$porta,$seg,$usuario,$senhaFinal,$ativo,$uid]);
    } else {
        if($senha==='') err('Informe a senha da conta de e-mail.');
        $pdo->prepare("INSERT INTO mh3_email_contas (id,usuario_id,apelido,remetente,nome_remetente,host,porta,seg,usuario,senha,ativo) VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([uniqid(),$uid,$apelido,$remetente,$nome,$host,$porta,$seg,$usuario,$senha,$ativo]);
    }
    resp(['ok'=>true,'msg'=>'Conta de e-mail salva.']);

case 'email_conta_deletar':
    $s = requerAuth($pdo);
    if (($s['usuario_perfil']??'')!=='admin') err('Apenas o administrador pode remover contas.',403);
    $id=$body['id']??''; if(!$id) err('id obrigatório');
    $pdo->prepare("DELETE FROM mh3_email_contas WHERE id=?")->execute([$id]);
    resp(['ok'=>true,'msg'=>'Conta removida.']);

// ============ ENVIAR E-MAIL PERSONALIZADO ============
case 'enviar_email':
    $s = requerAuth($pdo);
    $para    = $body['para']    ?? '';
    $assunto = $body['assunto'] ?? '';
    $corpo   = $body['corpo']   ?? '';
    if (!$para || !$assunto || !$corpo) err('Para, assunto e corpo obrigatórios');
    // Conta liberada para o usuário logado (uma por usuário)
    $stmt = $pdo->prepare("SELECT * FROM mh3_email_contas WHERE usuario_id=? AND ativo=1");
    $stmt->execute([$s['usuario_id']]);
    $conta = $stmt->fetch();
    if ($conta) {
        list($okEnv,$msgEnv) = enviarSMTP($conta, $para, $assunto, $corpo);
        resp(['ok'=>$okEnv, 'msg'=>$okEnv ? ('E-mail enviado de '.$conta['remetente']) : ('Falha no envio: '.$msgEnv)]);
    } else {
        // Sem conta liberada: tenta o envio padrão do servidor (legado)
        $headers  = "From: ".SMTP_NAME." <".SMTP_FROM.">\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=utf-8\r\n";
        $ok = @mail($para, $assunto, $corpo, $headers);
        resp(['ok'=>$ok, 'msg'=>$ok ? 'E-mail enviado (conta padrão do sistema).' : 'Você ainda não tem uma conta de e-mail liberada pelo administrador.']);
    }

// ============ LOG ============

case 'auditoria':
    $s = requerAuth($pdo);
    if ($s['usuario_perfil'] !== 'admin') err('Acesso restrito ao administrador', 403);
    $filtro_user   = $_GET['usuario'] ?? '';
    $filtro_modulo = $_GET['modulo']  ?? '';
    $filtro_acao   = $_GET['acao']    ?? '';
    $limite        = min((int)($_GET['limite'] ?? 100), 500);
    $where = ['1=1'];
    $params = [];
    if ($filtro_user)   { $where[] = 'usuario_nome LIKE ?'; $params[] = "%$filtro_user%"; }
    if ($filtro_modulo) { $where[] = 'modulo = ?';          $params[] = $filtro_modulo; }
    if ($filtro_acao)   { $where[] = 'acao = ?';            $params[] = $filtro_acao; }
    $sql = "SELECT * FROM mh3_log WHERE ".implode(' AND ',$where)." ORDER BY criado_em DESC LIMIT $limite";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    // Parse JSON fields (robusto: só se a coluna existir e tiver conteúdo)
    foreach ($rows as &$r) {
        if (!empty($r['dado_antes']))  $r['dado_antes']  = json_decode($r['dado_antes'],  true);
        if (!empty($r['dado_depois'])) $r['dado_depois'] = json_decode($r['dado_depois'], true);
    }
    resp(['ok'=>true,'total'=>count($rows),'dados'=>$rows]);

case 'auditoria_resumo':
    $s = requerAuth($pdo);
    if ($s['usuario_perfil'] !== 'admin') err('Acesso restrito ao administrador', 403);
    // Resumo por usuário
    $porUser = $pdo->query("SELECT usuario_nome, usuario_perfil, COUNT(*) as acoes,
        MAX(criado_em) as ultimo_acesso,
        SUM(CASE WHEN acao='EXCLUIR' THEN 1 ELSE 0 END) as exclusoes,
        SUM(CASE WHEN acao='CRIAR'   THEN 1 ELSE 0 END) as criações,
        SUM(CASE WHEN acao='EDITAR'  THEN 1 ELSE 0 END) as edicoes,
        SUM(CASE WHEN acao='LOGIN_OK' THEN 1 ELSE 0 END) as logins
        FROM mh3_log GROUP BY usuario_nome, usuario_perfil ORDER BY acoes DESC")->fetchAll();
    // Resumo por módulo
    $porModulo = $pdo->query("SELECT modulo, COUNT(*) as total,
        SUM(CASE WHEN acao='EXCLUIR' THEN 1 ELSE 0 END) as exclusoes
        FROM mh3_log WHERE modulo != '' GROUP BY modulo ORDER BY total DESC")->fetchAll();
    // Últimas ações
    $recentes = $pdo->query("SELECT usuario_nome,acao,modulo,descricao,ip,criado_em 
        FROM mh3_log ORDER BY criado_em DESC LIMIT 20")->fetchAll();
    resp(['ok'=>true,'por_usuario'=>$porUser,'por_modulo'=>$porModulo,'recentes'=>$recentes]);

case 'log':
    requerAuth($pdo);
    $rows = $pdo->query("SELECT * FROM mh3_log ORDER BY criado_em DESC LIMIT 100")->fetchAll();
    resp(['ok'=>true,'dados'=>$rows]);

// ============ STATUS ============
case 'status':
    $totais = [];
    $stmt = $pdo->query("SELECT modulo, COUNT(*) as total FROM mh3_dados GROUP BY modulo");
    foreach ($stmt->fetchAll() as $row) $totais[$row['modulo']] = (int)$row['total'];
    $users = $pdo->query("SELECT COUNT(*) as n FROM mh3_usuarios WHERE ativo=1")->fetch();
    $sess  = $pdo->query("SELECT COUNT(*) as n FROM mh3_sessoes WHERE expira_em > NOW()")->fetch();
    resp(['ok'=>true,'registros'=>$totais,'usuarios_ativos'=>(int)$users['n'],'sessoes_ativas'=>(int)$sess['n'],'ts'=>date('Y-m-d H:i:s')]);

case 'ping':
    resp(['ok'=>true,'versao'=>'19/06/2026 01h','msg'=>'MH3 API funcionando','ts'=>date('Y-m-d H:i:s'),'php'=>phpversion()]);


case 'upsert':
    $s = requerAuth($pdo);
    $modulo = $body['modulo'] ?? '';
    $item   = $body['item']   ?? [];
    $descr  = $body['desc']   ?? '';
    if (!$modulo || !$item) err('Módulo e item obrigatórios');
    $id = $item['id'] ?? uniqid();
    $item['id'] = $id;
    // Busca dado anterior para auditoria
    $ant = $pdo->prepare("SELECT dados FROM mh3_dados WHERE id=?");
    $ant->execute([$id]);
    $antes = $ant->fetch();
    $pdo->prepare("INSERT INTO mh3_dados (id,modulo,dados) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE dados=VALUES(dados), atualizado_em=NOW()")
        ->execute([$id, $modulo, json_encode($item, JSON_UNESCAPED_UNICODE)]);
    $acao = $antes ? 'EDITAR' : 'CRIAR';
    logAction($pdo, $s['usuario_nome'], $acao, $modulo, [
        'id'     => $id,
        'desc'   => $descr ?: $acao.' em '.$modulo,
        'antes'  => $antes ? json_decode($antes['dados'],true) : null,
        'depois' => $item
    ]);
    resp(['ok'=>true,'id'=>$id,'acao'=>$acao]);

case 'log_action':
    $s = validarSessao($pdo);
    $acao = $body['acao'] ?? 'ACAO';
    $mod  = $body['modulo'] ?? '';
    $usr  = $s ? $s['usuario_nome'] : 'sistema';
    logAction($pdo, $usr, $acao, $mod);
    resp(['ok'=>true]);

case 'log_test':
    // Diagnóstico: conserta o schema do log, grava uma linha de teste SEM engolir erro,
    // e devolve o total atual OU a mensagem de erro exata (pra sabermos o motivo).
    $s = requerAuth($pdo);
    if (($s['usuario_perfil'] ?? '') !== 'admin') err('Acesso restrito ao administrador', 403);
    garantirColunasLog($pdo);
    try {
        $pdo->prepare("INSERT INTO mh3_log
            (usuario_id,usuario_nome,usuario_perfil,acao,modulo,descricao,dado_id,dado_antes,dado_depois,ip,navegador)
            VALUES (?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([
                $s['usuario_id'] ?? '', $s['usuario_nome'] ?? 'sistema', $s['usuario_perfil'] ?? '',
                'TESTE_LOG', 'diagnostico', 'Teste de gravacao da auditoria',
                null, null, null,
                $_SERVER['REMOTE_ADDR'] ?? '', substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200)
            ]);
        $n = $pdo->query("SELECT COUNT(*) FROM mh3_log")->fetchColumn();
        resp(['ok'=>true,'total'=>(int)$n,'msg'=>'Gravou com sucesso']);
    } catch (Exception $e) {
        resp(['ok'=>false,'erro'=>$e->getMessage()]);
    }

default:
    err('Ação não reconhecida: '.$action);
}
?>
