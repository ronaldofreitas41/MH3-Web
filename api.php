<?php
// ============================================================
// MH3 RENTAL — API v2
// Arquivo: api.php
// ============================================================

// ---- BLINDAGEM: nunca deixar a resposta sair vazia/cortada ----
// Em vez de devolver nada (que vira "Unexpected end of JSON input" no sistema),
// aumentamos os limites e garantimos um JSON com a causa, mesmo em erro fatal.
@ini_set('display_errors', '0');           // erros do PHP não vazam no meio do JSON
@ini_set('memory_limit', '512M');          // dados grandes não estouram a memória
@set_time_limit(120);                      // mais tempo para montar a resposta
// COMPACTAR A RESPOSTA (gzip) — ESTE E O CONSERTO PRINCIPAL DA LENTIDAO.
// Quando o sistema abre, ele baixa TODOS os dados de uma vez. Sem compactar,
// isso sao varios MB; num tablet fora do Wi-Fi passa dos 45 segundos que o
// sistema espera e da "nao consegui carregar os dados do servidor" — por isso
// funcionava em uns horarios e em outros nao. Compactado, o mesmo conteudo
// viaja cerca de 8x menor e chega em poucos segundos.
// SE ALGO DER ERRADO: troque true por false na linha abaixo e volte a subir
// o arquivo — tudo volta a ser como era, sem perder nenhum dado.
define('MH3_GZIP', true);
$mh3AceitaGzip = stripos($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip') !== false;
if (MH3_GZIP && $mh3AceitaGzip && function_exists('ob_gzhandler') && !ini_get('zlib.output_compression')) {
    if (!@ob_start('ob_gzhandler')) { ob_start(); }
} else {
    ob_start();                            // segura a saida para poder limpar se der erro
}
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR])) {
        while (ob_get_level() > 0) { @ob_end_clean(); }   // descarta saída parcial
        if (!headers_sent()) { header('Content-Type: application/json; charset=utf-8'); http_response_code(500); }
        echo json_encode(['ok' => false, 'erro_servidor' => $e['message'] . ' (linha ' . $e['line'] . ')']);
    }
});

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
// ---- CONEXAO COM O BANCO (v48) -------------------------------------------
// A senha do banco estava escrita aqui dentro, em texto aberto. Quem abrisse
// este arquivo — por descuido de permissao, por um backup exposto, por um
// erro do PHP que mostrasse o codigo — lia a senha do banco inteiro.
//
// Agora ela mora em conexao.php, um arquivo separado, so com isso dentro.
// Vantagens praticas:
//   . trocar a senha e mexer em UM arquivo de 6 linhas, nao neste de 2 mil;
//   . este api.php pode ser mandado por e-mail, guardado, versionado, sem
//     levar a senha junto;
//   . se um dia o servidor servir .php como texto, o estrago e menor.
//
// SE conexao.php NAO EXISTIR, os valores de baixo continuam valendo. Ou seja:
// subir este api.php sozinho NAO derruba nada. O ganho so aparece quando o
// conexao.php estiver no ar — ate la, funciona exatamente como antes.
$mh3conf = @include __DIR__ . '/conexao.php';
if (!is_array($mh3conf)) $mh3conf = [];
define('DB_HOST', $mh3conf['host'] ?? 'mh3sistema.mysql.dbaas.com.br');
define('DB_NAME', $mh3conf['nome'] ?? 'mh3sistema');
define('DB_USER', $mh3conf['usuario'] ?? 'mh3sistema');
define('DB_PASS', $mh3conf['senha'] ?? 'Fraga62970123#');
define('MH3_SENHA_CENTRALIZADA', isset($mh3conf['senha']));
define('SMTP_FROM', 'sistema@mh3rental.com.br');
define('SMTP_NAME', 'MH3 Rental Sistema');
define('SESSION_HOURS', 12);

// ============ BANCO ============
// v49 — O RELOGIO DE 15 SEGUNDOS
// ---------------------------------------------------------------------------
// O diagnostico do dia 17/08 mostrou isto no banco da Locaweb:
//
//     wait_timeout = 15
//
// E o tempo que o MySQL espera uma conexao parada antes de fechar ela na
// nossa cara. O normal e 28.800 (oito horas). Quinze segundos e valor de
// servidor compartilhado apertado.
//
// Era essa a raiz do "erro servidor" e do 503 que apareciam de vez em quando:
// enquanto o buscar_tudo levava 11 segundos lendo 34 MB, faltavam 4 segundos
// para o banco desligar no meio do caminho. Em horario de pouco movimento
// dava tempo; em horario cheio, nao dava — por isso funcionava as vezes.
//
// A copia leve (v47) derrubou aquele tempo de 11s para 8 milesimos, entao o
// aperto quase sumiu. Mas o relogio de 15 segundos continua correndo, e ainda
// pega as tarefas demoradas: migrar_leve, conferir_fotos, diagnostico,
// gravacao de registro com foto grande.
//
// O QUE MUDA AQUI
// Logo depois de conectar, pedimos ao banco mais folga PARA ESTA CONEXAO:
//
//     SET SESSION wait_timeout = 300
//
// Cinco minutos, e so enquanto este pedido durar. Nao altera a configuracao
// do servidor, nao afeta outros sistemas, nao precisa de permissao especial.
// Se a hospedagem nao deixar, o pedido e recusado em silencio e tudo segue
// exatamente como estava — por isso vai dentro de um try sem alarde.
//
// A segunda rede: mh3Reconectar(). Se mesmo assim a conexao cair no meio de
// uma tarefa longa, em vez de devolver "erro servidor" a gente abre outra e
// continua. Quem chama e a propria tarefa demorada.
// ---------------------------------------------------------------------------
function mh3Conectar() {
    $pdo = new PDO("mysql:host=".DB_HOST.";dbname=".DB_NAME.";charset=utf8mb4", DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
    // pede folga so para esta conexao; se o servidor nao deixar, segue igual
    try { $pdo->exec("SET SESSION wait_timeout=300, interactive_timeout=300"); } catch (Exception $e) {}
    return $pdo;
}

// Devolve uma conexao viva. Se a de agora caiu, abre outra.
// Use antes de um trecho demorado: $pdo = mh3Reconectar($pdo);
function mh3Reconectar($pdo) {
    try { $pdo->query("SELECT 1")->fetch(); return $pdo; }
    catch (Exception $e) { try { return mh3Conectar(); } catch (Exception $e2) { return $pdo; } }
}

try {
    $pdo = mh3Conectar();
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['erro'=>'Conexão falhou: '.$e->getMessage()]); exit();
}

// ============ ESTRUTURA DO BANCO — CONFERIDA 1x POR DIA ============
// POR QUE ISSO MUDOU (o sistema estava lento e as vezes nao abria):
// Antes, TODA chamada ao api.php — inclusive a checagem automatica que
// cada aparelho faz a cada 20 segundos — rodava 8 "CREATE TABLE IF NOT
// EXISTS", 2 "SHOW COLUMNS", mais 3 "CREATE TABLE" e 1 "SELECT COUNT".
// Sao cerca de 14 idas e voltas ao banco ANTES de fazer qualquer coisa
// util. Com o sistema aberto em varios aparelhos ao mesmo tempo, isso
// sozinho entupia o banco compartilhado da Locaweb — por isso ficava
// lento e as vezes dava "nao consegui carregar os dados do servidor"
// justamente nos horarios de mais uso.
// AGORA: a estrutura e conferida no maximo 1 vez por dia. Nas outras
// chamadas gasta 1 consulta rapidinha por chave primaria.
// Para forcar a conferencia na hora: api.php?action=instalar
$mh3HojeStr = date('Y-m-d') . '|v55';   // v47: mudar o sufixo força reconferir o schema quando esta versao sobe (cria a mh3_leve)
$mh3ConferirBanco = true;
if (($_GET['action'] ?? '') !== 'instalar') {
    try {
        $mh3St = $pdo->query("SELECT valor FROM mh3_config WHERE chave='__schema_ok'");
        $mh3Row = $mh3St ? $mh3St->fetch() : null;
        if ($mh3Row && ($mh3Row['valor'] ?? '') === $mh3HojeStr) $mh3ConferirBanco = false;
    } catch (Exception $e) { $mh3ConferirBanco = true; }
}

if ($mh3ConferirBanco) {
    // ============ CRIAR TABELAS ============
    $pdo->exec("
    CREATE TABLE IF NOT EXISTS mh3_dados (
        id VARCHAR(60) PRIMARY KEY,
        modulo VARCHAR(50) NOT NULL,
        dados LONGTEXT NOT NULL,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_modulo (modulo),
        INDEX idx_criado (criado_em),
        INDEX idx_mod_criado (modulo, criado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

    CREATE TABLE IF NOT EXISTS mh3_config (
        chave VARCHAR(100) PRIMARY KEY,
        valor LONGTEXT,
        versao INT NOT NULL DEFAULT 1,
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
    garantirTabelaBackups($pdo);
    garantirTabelaEmailEventos($pdo);
    garantirColunaVersaoConfig($pdo);
garantirTabelaLeve($pdo);          // vs284 v47
    garantirTabelaLocal($pdo);         // vs284 v54: copia local, tabela propria: tabela da copia leve pre-pronta (buscar_tudo rapido)

    // Cria admin padrão se não existir
    $chk = $pdo->query("SELECT COUNT(*) as n FROM mh3_usuarios")->fetch();
    if ($chk['n'] == 0) {
        $pdo->prepare("INSERT INTO mh3_usuarios (id,nome,login,senha,perfil,ativo) VALUES (?,?,?,?,?,1)")
            ->execute([uniqid(), 'Noninho Fraga', 'noninho', password_hash('mh3@2025', PASSWORD_DEFAULT), 'admin']);
    }

    // indices que faltavam (a listagem geral ordena por criado_em e, sem
    // indice, o banco tinha que varrer e reordenar a tabela inteira —
    // com textao grande dentro, isso ia pro disco e demorava)
    garantirIndicesDados($pdo);
    garantirColunaCodigo($pdo);
    // faxina barata: sessoes vencidas e tentativas de login velhas
    limpezaLeve($pdo);

    try {
        $pdo->prepare("INSERT INTO mh3_config (chave,valor) VALUES ('__schema_ok',?)
                       ON DUPLICATE KEY UPDATE valor=VALUES(valor)")->execute([$mh3HojeStr]);
    } catch (Exception $e) { /* se nao der, confere de novo na proxima — sem problema */ }
}

// ============ RESET DE EMERGENCIA — RETIRADO NA v48 ============
// Aqui existia:
//     api.php?action=reset_admin&chave=...&senha=...
// Quem chamasse esse endereco trocava a senha do administrador do sistema
// pelo navegador, sem estar logado, sem deixar rastro de quem foi. A unica
// defesa era a chave estar escrita neste mesmo arquivo — a mesma senha que
// protegia a porta estava pregada na porta.
//
// Foi retirado. Nao ha mais como redefinir senha de administrador por URL.
//
// SE VOCE PERDER A SENHA DO ADMINISTRADOR:
// entre no phpMyAdmin da Locaweb e rode, no banco mh3sistema:
//
//     UPDATE mh3_usuarios
//        SET senha = '$2y$10$COLE.AQUI.O.HASH', ativo = 1
//      WHERE login = 'noninho';
//
// O hash se gera com password_hash('suasenha', PASSWORD_DEFAULT) — me peca
// que eu gero e te mando. Da um pouco mais de trabalho de proposito: e uma
// porta que so abre de dentro.
//
// Se alguem chamar o endereco antigo, recebe uma recusa clara:
if (($_GET['action'] ?? '') === 'reset_admin') {
    http_response_code(410);
    echo json_encode(['ok'=>false,
        'msg'=>'Este recurso foi retirado do sistema na versao 48, por seguranca.'],
        JSON_UNESCAPED_UNICODE);
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

// Auto-conserto: garante a coluna "versao" em mh3_config — usada pra
// detectar conflito de forma confiável (contador inteiro, não depende
// de precisão de relógio, diferente de comparar por timestamp).
function garantirColunaVersaoConfig($pdo) {
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM mh3_config")->fetchAll(PDO::FETCH_COLUMN);
        if (is_array($cols) && !in_array('versao', $cols)) {
            $pdo->exec("ALTER TABLE mh3_config ADD COLUMN versao INT NOT NULL DEFAULT 1");
        }
    } catch (Exception $e) { /* silencioso */ }
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

// ============================================================
// FOTOS: saem do download de entrada, sem nunca se perder
// ============================================================
// Dentro do registro (que e um JSON) uma foto aparece assim:
//     "data:image\/jpeg;base64,\/9j\/4AAQSkZJRg...=="
// e, quando esta dentro de um HTML guardado, assim:
//     ...<img src=\"data:image\/jpeg;base64,...==\">...
// No lugar do miolo entra uma etiqueta curta:
//     mh3foto:123456        (123456 = tamanho do pedaco original)
define('MH3_FOTO_ETIQUETA', 'mh3foto:');
define('MH3_FOTO_MIN', 20000);          // so tira foto acima de ~20 KB

// Acha as fotos ANDANDO A MAO pelo texto. Devolve [[inicio,tamanho],...].
// Feito sem expressao de busca de proposito: nao tem limite de tamanho e,
// principalmente, para ANTES da barra invertida que fecha uma aspa — que
// foi o erro que quebrou o JSON do contrato na primeira versao.
function mh3AcharFotos($txt) {
    $achados = []; $pos = 0; $n = strlen($txt);
    while (($p = strpos($txt, ';base64,', $pos)) !== false) {
        // volta no maximo 60 caracteres procurando o "data:"
        $limite = max(0, $p - 60);
        $d = strrpos(substr($txt, $limite, $p - $limite), 'data:');
        if ($d === false) { $pos = $p + 8; continue; }
        $ini = $limite + $d;
        // anda para a frente enquanto for caractere de base64
        $i = $p + 8;
        while ($i < $n) {
            $c = $txt[$i];
            if (($c >= 'A' && $c <= 'Z') || ($c >= 'a' && $c <= 'z') ||
                ($c >= '0' && $c <= '9') || $c === '+' || $c === '=' || $c === '/') { $i++; continue; }
            // a barra dentro do JSON vem como \/ — isso faz parte da foto
            if ($c === '\\' && $i + 1 < $n && $txt[$i + 1] === '/') { $i += 2; continue; }
            break;   // qualquer outra coisa (inclusive \" ) encerra a foto
        }
        $tam = $i - $ini;
        if ($tam >= MH3_FOTO_MIN) $achados[] = [$ini, $tam];
        $pos = $i;
    }
    return $achados;
}

// Troca as fotos por etiquetas.
function mh3TirarFotos($txt) {
    if ($txt === null || $txt === '') return $txt;
    if (strpos($txt, ';base64,') === false) return $txt;
    $fotos = mh3AcharFotos($txt);
    if (!count($fotos)) return $txt;
    $saida = ''; $de = 0;
    foreach ($fotos as $f) {
        $saida .= substr($txt, $de, $f[0] - $de) . MH3_FOTO_ETIQUETA . $f[1];
        $de = $f[0] + $f[1];
    }
    $saida .= substr($txt, $de);
    // CINTO DE SEGURANCA: se por qualquer motivo o resultado nao for um
    // JSON valido, devolve o texto ORIGINAL. Melhor mandar pesado do que
    // mandar quebrado — um registro quebrado derruba a resposta inteira.
    if (function_exists('json_validate')) { if (!json_validate($saida)) return $txt; }
    elseif (json_decode($saida) === null) return $txt;
    return $saida;
}

function mh3TemEtiqueta($txt) {
    return $txt !== null && $txt !== '' && strpos($txt, MH3_FOTO_ETIQUETA) !== false;
}

// TRAVA CONTRA PERDA DE FOTO.
// Recebe o registro que veio do navegador (pode ter etiquetas) e o que
// esta guardado no banco (tem as fotos), e devolve o do navegador com as
// fotos POSTAS DE VOLTA, na mesma ordem. Se faltar foto para alguma
// etiqueta, devolve false — e quem chamou NAO grava.
function mh3DevolverFotos($novoTxt, $guardadoTxt) {
    if (!mh3TemEtiqueta($novoTxt)) return $novoTxt;
    if ($guardadoTxt === null || $guardadoTxt === '') return false;
    $fotos = mh3AcharFotos($guardadoTxt);
    if (!count($fotos)) return false;

    $et = MH3_FOTO_ETIQUETA; $let = strlen($et);
    $saida = ''; $pos = 0; $k = 0; $n = strlen($novoTxt);
    while (($p = strpos($novoTxt, $et, $pos)) !== false) {
        // le os digitos do tamanho logo depois da etiqueta
        $i = $p + $let;
        while ($i < $n && $novoTxt[$i] >= '0' && $novoTxt[$i] <= '9') $i++;
        if ($i === $p + $let) { $pos = $p + $let; continue; }   // etiqueta sem numero: nao e nossa
        if (!isset($fotos[$k])) return false;                   // faltou foto guardada
        $f = $fotos[$k++];
        $saida .= substr($novoTxt, $pos, $p - $pos) . substr($guardadoTxt, $f[0], $f[1]);
        $pos = $i;
    }
    $saida .= substr($novoTxt, $pos);
    if (function_exists('json_validate')) { if (!json_validate($saida)) return false; }
    elseif (json_decode($saida) === null) return false;
    return $saida;
}

// Garante os indices que deixam a listagem geral rapida.
// Sem indice em criado_em, o "ORDER BY criado_em" da chamada buscar_tudo
// obriga o banco a varrer a tabela toda e reordenar na mao. Como a coluna
// "dados" e um LONGTEXT (texto gigante), essa reordenacao vai pro disco e
// e o que mais demora quando o sistema tem muito registro.
// Coluna do codigo de acesso (segundo fator do login).
// Vazia = aquele usuario nao precisa de codigo.
function garantirColunaCodigo($pdo){
    try {
        $cols = $pdo->query("SHOW COLUMNS FROM mh3_usuarios")->fetchAll(PDO::FETCH_COLUMN);
        if (is_array($cols) && !in_array('codigo_acesso', $cols)) {
            $pdo->exec("ALTER TABLE mh3_usuarios ADD COLUMN codigo_acesso VARCHAR(40) DEFAULT ''");
        }
    } catch (Exception $e) { /* silencioso */ }
}

function garantirIndicesDados($pdo){
    try {
        $idx = $pdo->query("SHOW INDEX FROM mh3_dados")->fetchAll(PDO::FETCH_ASSOC);
        $nomes = [];
        foreach ($idx as $i) { $nomes[] = $i['Key_name']; }
        if (!in_array('idx_criado', $nomes))     $pdo->exec("ALTER TABLE mh3_dados ADD INDEX idx_criado (criado_em)");
        if (!in_array('idx_mod_criado', $nomes)) $pdo->exec("ALTER TABLE mh3_dados ADD INDEX idx_mod_criado (modulo, criado_em)");
    } catch (Exception $e) { /* silencioso */ }
}

// Faxina barata e sem risco: so joga fora o que ja nao vale mais.
// NAO mexe em auditoria nem em backup — isso so sai se voce mandar,
// pela chamada action=limpar_log.
function limpezaLeve($pdo){
    try { $pdo->exec("DELETE FROM mh3_sessoes WHERE expira_em < NOW()"); } catch (Exception $e) {}
    try { $pdo->exec("DELETE FROM mh3_tentativas WHERE criado_em < DATE_SUB(NOW(), INTERVAL 7 DAY)"); } catch (Exception $e) {}
}

// Auto-cria a tabela de backups no servidor (snapshot dos dados em JSON).
function garantirTabelaBackups($pdo){
    $pdo->exec("CREATE TABLE IF NOT EXISTS mh3_backups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        origem VARCHAR(150),
        app_versao VARCHAR(80),
        tamanho INT,
        conteudo LONGTEXT,
        INDEX idx_bkp_criado (criado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}

// ============================================================
// vs284 v47 — A COPIA LEVE PRE-PRONTA (mata os 9-11s do buscar_tudo)
// ------------------------------------------------------------
// O buscar_tudo lia 34 MB do banco e TIRAVA as fotos toda vez que
// alguem abria o sistema — 11s de servidor pensando, e a causa do
// 503 (conexoes presas) e do "erro servidor". Agora a versao SEM
// fotos e gravada PRONTA no momento do salvar, numa tabela a parte
// (mh3_leve). O buscar_tudo so entrega o que ja esta pronto, sem
// processar nada. mh3_dados NAO e tocado (as fotos seguem la para
// a tela buscar depois por action=registro). Reversivel: e so
// dropar mh3_leve e o buscar_tudo volta a ler mh3_dados.
// ============================================================
// ============================================================
// vs284 v54 — A COPIA LOCAL SAI DE DENTRO DA TABELA DO SISTEMA
// ------------------------------------------------------------
// ERRO MEU, DO DIA 17/08, E O ESTRAGO QUE ELE CAUSOU.
//
// Criei a copia de seguranca das listas que so existem no navegador
// (inc132) e guardei em mh3_dados, com o nome de modulo
// "so_no_aparelho". Parecia inofensivo: e so mais uma linha numa
// tabela que ja tem 130 mil.
//
// Nao era. mh3_dados e a tabela que o sistema INTEIRO varre. Em
// cadeia, aconteceu isto:
//
//   1. a cada 10 min a copia era gravada;
//   2. a cada 20 segundos TODO aparelho chama ultima_alteracao, que
//      faz "GROUP BY modulo" sem filtro nenhum — e via que aquele
//      modulo tinha mudado;
//   3. cada aparelho entao chamava buscar&modulo=so_no_aparelho e
//      BAIXAVA as copias de todos os outros aparelhos;
//   4. isso entrava em D, ia parar no localStorage junto com os
//      dados de verdade, e disparava rp(cur) — redesenhando a tela
//      do usuario no meio do trabalho.
//
// Medido no aparelho dele: o armazenamento do navegador saiu de
// 470 KB para 8.545 KB em um dia. O aviso vermelho que ele mandou
// tirar ontem estava certo — e quem tinha enchido era eu.
//
// A CORRECAO NAO E FILTRAR PONTO A PONTO.
// Eu poderia sair acrescentando "AND modulo <> 'so_no_aparelho'" em
// cada consulta — sao 29 lugares que leem mh3_dados. Bastaria
// esquecer um, hoje ou daqui a seis meses, para tudo voltar.
//
// A copia passa a morar em TABELA PROPRIA (mh3_local). Fora de
// mh3_dados, nao ha o que filtrar: nenhuma consulta do sistema
// alcanca. O problema deixa de existir em vez de ficar contornado.
// ============================================================
function garantirTabelaLocal($pdo){
    $pdo->exec("CREATE TABLE IF NOT EXISTS mh3_local (
        id VARCHAR(120) PRIMARY KEY,
        aparelho VARCHAR(40) NOT NULL,
        lista VARCHAR(60) NOT NULL,
        quantos INT DEFAULT 0,
        conteudo LONGTEXT NOT NULL,
        atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_local_ap (aparelho),
        INDEX idx_local_lista (lista)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}

function garantirTabelaLeve($pdo){
    $pdo->exec("CREATE TABLE IF NOT EXISTS mh3_leve (
        id VARCHAR(60) PRIMARY KEY,
        modulo VARCHAR(50) NOT NULL,
        dados_leve LONGTEXT NOT NULL,
        src_ts TIMESTAMP NULL,
        INDEX idx_leve_mod (modulo)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}

// A versao leve de UM registro = o mesmo que o buscar_tudo produzia na
// hora (foto -> etiqueta), so que calculado uma vez, ao salvar.
function mh3CalcularLeve($txt){
    if ($txt === null || $txt === '') return $txt;
    if (strlen($txt) > MH3_FOTO_MIN) { return mh3TirarFotos($txt); }
    return $txt;
}

// Grava/atualiza a copia leve de um registro. Le o atualizado_em real
// do proprio mh3_dados para casar o src_ts (assim o buscar_tudo sabe
// que a copia esta em dia). Nunca derruba o salvamento: se falhar, o
// registro so cai no fallback do buscar_tudo na proxima leitura.
function mh3GravarLeve($pdo, $id, $modulo, $txtCompleto){
    // v50: nenhum dos dois entra no buscar_tudo, entao nao precisam de copia leve
    if ($modulo === 'pneus_hist' || $modulo === 'so_no_aparelho') return;
    try {
        $q = $pdo->prepare("SELECT atualizado_em FROM mh3_dados WHERE id=?");
        $q->execute([$id]);
        $ts = $q->fetchColumn();
        if ($ts === false) return;
        $leve = mh3CalcularLeve($txtCompleto);
        $pdo->prepare("INSERT INTO mh3_leve (id,modulo,dados_leve,src_ts) VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE dados_leve=VALUES(dados_leve), modulo=VALUES(modulo), src_ts=VALUES(src_ts)")
            ->execute([$id, $modulo, $leve, $ts]);
    } catch (Exception $e) { /* silencioso: o fallback cobre */ }
}

function mh3RemoverLeve($pdo, $id){
    try { $pdo->prepare("DELETE FROM mh3_leve WHERE id=?")->execute([$id]); } catch (Exception $e) {}
}


// Auto-conserto: tabela de rastreio de e-mails (enviado / aberto / confirmado).
function garantirTabelaEmailEventos($pdo){
    $pdo->exec("CREATE TABLE IF NOT EXISTS mh3_email_eventos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(40) NOT NULL,
        lancamento_id VARCHAR(60),
        tipo VARCHAR(40),
        destinatario VARCHAR(200),
        assunto VARCHAR(300),
        enviado_por VARCHAR(120),
        enviado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        aberto_em DATETIME NULL,
        confirmado_em DATETIME NULL,
        ip_abertura VARCHAR(60),
        ip_confirmacao VARCHAR(60),
        UNIQUE KEY uq_token (token),
        INDEX idx_lanc (lancamento_id),
        INDEX idx_env (enviado_em)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
}


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

    // CODIGO DE ACESSO (segundo fator) — conferido AQUI, no servidor.
    // Na tela isso nunca funcionou: existe um bloco que grava o codigo
    // digitado como se fosse o certo antes de conferir, entao qualquer
    // codigo entrava. Aqui a tela nao tem como interferir.
    // Se o usuario nao tiver codigo cadastrado, nada e exigido.
    $codEsperado = isset($user['codigo_acesso']) ? trim((string)$user['codigo_acesso']) : '';
    if ($codEsperado !== '') {
        $codDigitado = trim((string)($body['codigo'] ?? ''));
        if ($codDigitado !== $codEsperado) {
            $pdo->prepare("INSERT INTO mh3_tentativas (login,ip,sucesso) VALUES (?,?,0)")->execute([$login, $ip]);
            logAction($pdo, $login, 'LOGIN_CODIGO_ERRADO');
            err('Código de acesso inválido.', 401);
        }
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
    // v48: por padrao devolve SO quem esta ativo.
    //
    // Antes vinham todos, inclusive os desativados. E ha um bloco na tela
    // (o inc94/v51) que pega essa lista e acrescenta na tela quem estiver
    // faltando — entao o usuario que voce tirava voltava sozinho em ate um
    // minuto, sempre. Era o "excluo e ele retorna".
    //
    // O conserto ja foi feito no navegador (inc130 filtra ao receber), mas o
    // lugar certo de filtrar e aqui: assim vale para qualquer tela, qualquer
    // aparelho, inclusive os que ainda nao atualizaram.
    //
    // Para ver todos, inclusive os desativados: &todos=1
    requerAuth($pdo);
    $todos = ($_GET['todos'] ?? '') === '1';
    $sql = "SELECT id,nome,login,perfil,ativo,ultimo_acesso,criado_em FROM mh3_usuarios "
         . ($todos ? "" : "WHERE ativo=1 ")
         . "ORDER BY nome";
    $rows = $pdo->query($sql)->fetchAll();
    resp(['ok'=>true,'dados'=>$rows,'inclui_desativados'=>$todos]);

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
    // SEGURANÇA: o módulo "usuarios" é o único onde escrever sem ser admin
    // seria uma escalada de privilégio real (alguém dar admin pra si mesmo
    // direto pela API, sem passar pela tela). Os demais módulos ficam como
    // estavam — a maioria não tem uma permissão 1:1 clara (várias telas
    // escrevem no mesmo módulo), então travar errado quebraria uso legítimo.
    if ($modulo === 'usuarios') { requerPermissao($pdo, 'gerenciar-usuarios'); }
    $itens  = $body['dados']  ?? [];
    $excluir = $body['excluir'] ?? [];
    if (!$modulo) err('Módulo não informado');
    // IMPORTANTE: NÃO apagamos mais o módulo inteiro. Antes havia um
    // "DELETE FROM mh3_dados WHERE modulo=?" que fazia um usuário apagar o
    // trabalho do outro ao salvar ao mesmo tempo. Agora atualizamos registro
    // por registro (upsert) e removemos APENAS os IDs explicitamente marcados.
    //
    // DETECÇÃO DE CONFLITO (novo): se o item vier com "_baseTs" (o
    // atualizado_em que o navegador tinha quando começou a editar),
    // comparamos com o atualizado_em ATUAL no banco. Se alguém salvou
    // esse mesmo registro depois disso, NÃO sobrescrevemos — devolvemos
    // esse id em "conflitos" pra tela avisar o usuário, em vez de perder
    // silenciosamente a mudança de quem salvou primeiro. Item sem
    // "_baseTs" (registro novo, ou cliente antigo ainda sem essa
    // checagem) continua funcionando exatamente como antes.
    $checaTs = $pdo->prepare("SELECT atualizado_em FROM mh3_dados WHERE id=? AND modulo=?");
    $upsert  = $pdo->prepare("INSERT INTO mh3_dados (id,modulo,dados) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE dados=VALUES(dados), atualizado_em=NOW()");
    $conflitos = [];
    $salvos = 0;
    foreach ($itens as $item) {
        $id = $item['id'] ?? uniqid();
        $baseTs = $item['_baseTs'] ?? null;
        unset($item['_baseTs']); // nunca grava esse campo de controle junto do dado real
        if ($baseTs) {
            $checaTs->execute([$id, $modulo]);
            $atual = $checaTs->fetch();
            if ($atual && $atual['atualizado_em'] && strtotime($atual['atualizado_em']) > strtotime($baseTs)) {
                // alguém já salvou esse registro depois que este navegador o carregou
                $conflitos[] = ['id'=>$id, 'servidorTs'=>$atual['atualizado_em']];
                continue;
            }
        }
        $txtNovo = json_encode($item, JSON_UNESCAPED_UNICODE);
        // TRAVA CONTRA PERDA DE FOTO: o navegador pode ter recebido este
        // registro com ETIQUETAS no lugar das fotos (para o sistema abrir
        // rapido). Se ele devolver assim, o servidor poe as fotos de volta
        // ANTES de gravar. Se nao conseguir casar, NAO grava esse registro:
        // melhor deixar como esta do que apagar foto de servico.
        if (mh3TemEtiqueta($txtNovo)) {
            $vel = $pdo->prepare("SELECT dados FROM mh3_dados WHERE id=? AND modulo=?");
            $vel->execute([$id, $modulo]);
            $linha = $vel->fetch();
            $recomposto = mh3DevolverFotos($txtNovo, $linha ? $linha['dados'] : null);
            if ($recomposto === false) {
                $conflitos[] = ['id'=>$id, 'motivo'=>'foto_nao_recomposta'];
                continue;
            }
            $txtNovo = $recomposto;
        }
        $upsert->execute([$id, $modulo, $txtNovo]);
        mh3GravarLeve($pdo, $id, $modulo, $txtNovo);   // v47: copia leve pronta
        $salvos++;
    }
    if (is_array($excluir) && count($excluir) > 0) {
        $del = $pdo->prepare("DELETE FROM mh3_dados WHERE modulo=? AND id=?");
        foreach ($excluir as $delId) { if ($delId !== '' && $delId !== null) { $del->execute([$modulo, $delId]); mh3RemoverLeve($pdo, $delId); } }
    }
    logAction($pdo, $s['usuario_nome'], 'SALVAR', $modulo, ['desc'=>'Sync: '.$salvos.' reg / '.(is_array($excluir)?count($excluir):0).' excl'.(count($conflitos)?' / '.count($conflitos).' conflito(s)':'')]);
    resp(['ok'=>true,'total'=>$salvos,'excluidos'=>(is_array($excluir)?count($excluir):0),'conflitos'=>$conflitos]);

case 'ultima_alteracao':
    // Verificação LEVE para sync automático: versão de cada módulo
    // (maior data de alteração + total de registros). Muda em criação, edição e exclusão.
    requerAuth($pdo);
    // v54: fora os dois que o navegador nao usa. O 'so_no_aparelho' era o
    // pior: mudava a cada 10 min e fazia TODO aparelho baixar as copias
    // dos outros, encher o D e redesenhar a tela no meio do trabalho.
    $rows = $pdo->query("SELECT modulo, MAX(atualizado_em) as ts, COUNT(*) as cnt FROM mh3_dados
                         WHERE modulo NOT IN ('pneus_hist','so_no_aparelho') GROUP BY modulo")->fetchAll();
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
    // v54: cinto de seguranca. Mesmo que sobre alguma linha antiga em
    // mh3_dados, este modulo nunca mais desce para o navegador — foi por
    // aqui que ele entrou em D e encheu o localStorage.
    if ($modulo === 'so_no_aparelho') resp(['ok'=>true,'dados'=>[],'ts'=>[]]);
    $stmt = $pdo->prepare("SELECT dados, atualizado_em FROM mh3_dados WHERE modulo=? ORDER BY criado_em ASC");
    $stmt->execute([$modulo]);
    // A1: monta o JSON concatenando os blocos já gravados (sem decodificar tudo = bem menos memória)
    // "ts" é um array paralelo (mesma ordem/posição de "dados") com o atualizado_em de
    // cada registro — a tela usa isso pra saber se alguém mexeu no registro depois
    // dela ter carregado, antes de sobrescrever ao salvar.
    $arr = []; $ts = [];
    foreach ($stmt as $row) {
        $d = $row['dados'];
        if ($d === null || $d === '') continue;
        $dec = json_decode($d);
        if ($dec === null && strtolower(trim($d)) !== 'null') continue;
        unset($dec);
        $arr[] = $d;
        $ts[]  = json_encode($row['atualizado_em']);
    }
    echo '{"ok":true,"dados":[' . implode(',', $arr) . '],"ts":[' . implode(',', $ts) . ']}';
    exit();

case 'buscar_delta':
    // SINCRONIZACAO INTELIGENTE: traz so os registros do modulo alterados a partir de 'since'
    requerAuth($pdo);
    $modulo = $_GET['modulo'] ?? $body['modulo'] ?? '';
    $since  = $_GET['since']  ?? $body['since']  ?? '';
    if (!$modulo) resp(['ok'=>false,'dados'=>[]]);
    if ($since === '' || $since === null) $since = '1970-01-01 00:00:00';
    $stmt = $pdo->prepare("SELECT dados, atualizado_em FROM mh3_dados WHERE modulo=? AND atualizado_em >= ? ORDER BY atualizado_em ASC");
    $stmt->execute([$modulo, $since]);
    $arr = []; $ts = [];
    foreach ($stmt as $row) {
        $d = $row['dados'];
        if ($d === null || $d === '') continue;
        $dec = json_decode($d);
        if ($dec === null && strtolower(trim($d)) !== 'null') continue;
        unset($dec);
        $arr[] = $d;
        $ts[]  = json_encode($row['atualizado_em']);
    }
    echo '{"ok":true,"dados":[' . implode(',', $arr) . '],"ts":[' . implode(',', $ts) . ']}';
    exit();

case 'buscar_tudo':
    requerAuth($pdo);
    // vs284 v47 — LE A COPIA LEVE PRONTA, nao processa 34 MB.
    // Passo 1: indice de mh3_dados SO com metadados (id, modulo, ts) —
    //          NAO traz a coluna "dados" (34 MB) do disco.
    // Passo 2: as copias leves ja prontas (mh3_leve, ~0,4 MB no total).
    // Passo 3: o que ainda nao tem copia (registro antigo nao migrado,
    //          ou salvo por um caminho antigo) cai no fallback: le so
    //          ESSES de mh3_dados e tira a foto na hora. Some conforme
    //          a migracao roda. Ordem determinística (criado_em, id) para
    //          a saida ser identica byte a byte a de antes.
    // v50: fora do carregamento ficam DOIS modulos, nao um.
    //
    // 'pneus_hist'      — historico de pneu, ja era assim.
    // 'so_no_aparelho'  — as copias de seguranca das listas que vivem so no
    //                     navegador de cada computador (inc132). Elas sao
    //                     GUARDADAS aqui, mas nunca devem ser BAIXADAS: a tela
    //                     nem conhece esse modulo e jogaria fora. Sem esta
    //                     linha, cada aparelho baixava as copias de todos os
    //                     outros em toda abertura — megabytes de download
    //                     inutil, desmanchando o ganho da copia leve.
    $idx = $pdo->query("SELECT id,modulo,atualizado_em FROM mh3_dados WHERE modulo NOT IN ('pneus_hist','so_no_aparelho') ORDER BY criado_em ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
    $leves = [];
    foreach ($pdo->query("SELECT id,dados_leve,src_ts FROM mh3_leve") as $r) { $leves[$r['id']] = $r; }
    // quem falta (sem copia ou copia desatualizada)
    $faltam = [];
    foreach ($idx as $row) {
        $id = $row['id'];
        if (!(isset($leves[$id]) && $leves[$id]['src_ts'] === $row['atualizado_em'])) $faltam[$id] = 1;
    }
    $doBanco = [];
    if ($faltam) {
        $ids = array_keys($faltam);
        // le em blocos para nao montar um IN() gigante
        foreach (array_chunk($ids, 200) as $bloco) {
            $mk = implode(',', array_fill(0, count($bloco), '?'));
            $st = $pdo->prepare("SELECT id,dados FROM mh3_dados WHERE id IN ($mk)");
            $st->execute($bloco);
            foreach ($st as $r) {
                $d = $r['dados'];
                if ($d === null || $d === '') { $doBanco[$r['id']] = null; continue; }
                if (function_exists('json_validate')) { if (!json_validate($d)) { $doBanco[$r['id']] = null; continue; } }
                else { $dec = json_decode($d); if ($dec === null && strtolower(trim($d)) !== 'null') { $doBanco[$r['id']] = null; continue; } unset($dec); }
                if (strlen($d) > MH3_FOTO_MIN) { $d = mh3TirarFotos($d); }
                $doBanco[$r['id']] = $d;
            }
        }
    }
    // monta UMA vez, na ordem do indice (preserva a ordem exata)
    $byMod = []; $byModTs = [];
    foreach ($idx as $row) {
        $id = $row['id']; $m = $row['modulo'];
        if (isset($leves[$id]) && $leves[$id]['src_ts'] === $row['atualizado_em']) {
            $d = $leves[$id]['dados_leve'];
        } elseif (array_key_exists($id, $doBanco)) {
            $d = $doBanco[$id];
            if ($d === null) continue; // registro vazio/corrompido: ignora, como antes
        } else {
            continue;
        }
        if (!isset($byMod[$m])) { $byMod[$m] = []; $byModTs[$m] = []; }
        $byMod[$m][] = $d;
        $byModTs[$m][] = json_encode($row['atualizado_em']);
    }
    $parts = []; $partsTs = [];
    foreach ($byMod as $m => $arr) {
        $parts[]   = json_encode((string)$m, JSON_UNESCAPED_UNICODE) . ':[' . implode(',', $arr) . ']';
        $partsTs[] = json_encode((string)$m, JSON_UNESCAPED_UNICODE) . ':[' . implode(',', $byModTs[$m]) . ']';
    }
    echo '{"ok":true,"dados":{' . implode(',', $parts) . '},"ts":{' . implode(',', $partsTs) . '}}';
    exit();

case 'migrar_leve':
    // vs284 v47 — preenche a tabela de copias leves em LOTES.
    // Chamar com ?action=migrar_leve&chave=MH3-DIAG-2026&limite=50
    // ate "restam":0. So leitura de mh3_dados + escrita em mh3_leve;
    // nao altera nenhum dado do cliente. Seguro rodar com o sistema no ar.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    @set_time_limit(300);
    $pdo = mh3Reconectar($pdo);   // v49: tarefa demorada — garante conexao viva
    garantirTabelaLeve($pdo);
    $limite = max(1, min(300, (int)($_GET['limite'] ?? 50)));
    $lote = $pdo->query("SELECT d.id, d.modulo, d.dados, d.atualizado_em
        FROM mh3_dados d LEFT JOIN mh3_leve l ON l.id = d.id
        WHERE d.modulo NOT IN ('pneus_hist','so_no_aparelho') AND (l.id IS NULL OR l.src_ts <> d.atualizado_em)
        ORDER BY d.criado_em ASC, d.id ASC
        LIMIT $limite")->fetchAll(PDO::FETCH_ASSOC);
    $feitos = 0;
    if ($lote) {
        $up = $pdo->prepare("INSERT INTO mh3_leve (id,modulo,dados_leve,src_ts) VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE dados_leve=VALUES(dados_leve), modulo=VALUES(modulo), src_ts=VALUES(src_ts)");
        foreach ($lote as $r) {
            $leve = mh3CalcularLeve($r['dados']);
            $up->execute([$r['id'], $r['modulo'], $leve, $r['atualizado_em']]);
            $feitos++;
        }
    }
    $restam = (int)$pdo->query("SELECT COUNT(*) FROM mh3_dados d LEFT JOIN mh3_leve l ON l.id = d.id
        WHERE d.modulo NOT IN ('pneus_hist','so_no_aparelho') AND (l.id IS NULL OR l.src_ts <> d.atualizado_em)")->fetchColumn();
    resp(['ok'=>true, 'migrados_agora'=>$feitos, 'restam'=>$restam,
          'tabela_leve_mb'=> round(((int)$pdo->query("SELECT COALESCE(SUM(LENGTH(dados_leve)),0) FROM mh3_leve")->fetchColumn())/1048576, 3)]);

case 'salvar_config':
    $s = requerAuth($pdo);
    $config = $body['config'] ?? [];
    $versaoCliente = isset($body['_configVersao']) ? intval($body['_configVersao']) : null;
    // MESMA PROTEÇÃO do 'salvar' normal: D.config é um bloco ÚNICO com
    // MUITAS configurações diferentes (contas de e-mail, dados de
    // empresa, modelos, etc.). Antes, salvar QUALQUER configuração
    // sobrescrevia o bloco INTEIRO sem checar nada — se duas pessoas
    // mexessem em configurações diferentes por perto uma da outra,
    // quem salvasse por último apagava silenciosamente o que a outra
    // tinha acabado de configurar (foi isso que apagou as contas de
    // e-mail). Usa um CONTADOR (não relógio) porque comparar por
    // timestamp tem só precisão de segundo — dois salvamentos no
    // mesmo segundo passariam batido.
    if ($versaoCliente !== null) {
        $atual = $pdo->query("SELECT versao FROM mh3_config WHERE chave='geral'")->fetch();
        if ($atual && intval($atual['versao']) > $versaoCliente) {
            $configAtual = $pdo->query("SELECT valor FROM mh3_config WHERE chave='geral'")->fetch();
            resp(['ok'=>false, 'conflito'=>true, 'servidorVersao'=>intval($atual['versao']),
                  'configAtual'=> $configAtual ? json_decode($configAtual['valor'],true) : null]);
        }
    }
    $pdo->prepare("INSERT INTO mh3_config (chave,valor,versao) VALUES ('geral',?,1)
        ON DUPLICATE KEY UPDATE valor=VALUES(valor), versao=versao+1")
        ->execute([json_encode($config, JSON_UNESCAPED_UNICODE)]);
    $novo = $pdo->query("SELECT versao FROM mh3_config WHERE chave='geral'")->fetch();
    resp(['ok'=>true, 'versao'=>intval($novo['versao'] ?? 1)]);

case 'buscar_config':
    requerAuth($pdo);
    $stmt = $pdo->prepare("SELECT valor, versao FROM mh3_config WHERE chave='geral'");
    $stmt->execute();
    $row = $stmt->fetch();
    resp(['ok'=>true,'config'=> $row ? json_decode($row['valor'],true) : null, 'versao'=> $row ? intval($row['versao']) : 1]);

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
    mh3RemoverLeve($pdo, $id);   // v47: tira tambem a copia leve
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

case 'proximo_numero':
    // SEGURANÇA/CONCORRÊNCIA: gera o próximo número de forma atômica no
    // banco, pra dois usuários nunca poderem pegar o MESMO número de
    // venda/OS mesmo criando ao mesmo tempo (o cálculo antigo, feito no
    // navegador de cada um olhando os dados que já tinha, podia dar o
    // mesmo número pros dois se ambos criassem no mesmo instante).
    $s = requerAuth($pdo);
    $tipo = preg_replace('/[^a-z0-9_]/', '', strtolower($body['tipo'] ?? $_GET['tipo'] ?? ''));
    if (!$tipo) err('Tipo não informado');
    $pdo->exec("CREATE TABLE IF NOT EXISTS mh3_sequencias (
        tipo VARCHAR(40) PRIMARY KEY,
        valor INT NOT NULL DEFAULT 0
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    // Se o cliente sabe que já existe um número maior nos dados locais
    // (ex.: depois de um import), pode mandar "minimo" pra garantir que
    // o contador nunca ande pra trás.
    $minimo = intval($body['minimo'] ?? $_GET['minimo'] ?? 0);
    // Upsert atômico: cria a linha com o maior entre (0,minimo)+1, ou,
    // se já existe, incrementa — nunca deixa dois pedidos simultâneos
    // saírem com o mesmo valor (é uma única instrução SQL, o próprio
    // MySQL serializa isso). Usa LAST_INSERT_ID(expr) pra "reivindicar"
    // o valor com segurança: um SELECT separado depois do UPDATE teria
    // risco de pegar o valor que OUTRO pedido concorrente gravou nesse
    // meio-tempo. LAST_INSERT_ID() é por conexão — não tem esse risco.
    $stmt = $pdo->prepare("INSERT INTO mh3_sequencias (tipo, valor) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE valor = LAST_INSERT_ID(GREATEST(valor, ?) + 1)");
    $inicial = max(0, $minimo);
    $stmt->execute([$tipo, $inicial + 1, $minimo]);
    $valor = (int)$pdo->lastInsertId();
    if (!$valor) { // primeira linha (INSERT puro, sem duplicata) nao passa por LAST_INSERT_ID
        $novo = $pdo->prepare("SELECT valor FROM mh3_sequencias WHERE tipo=?");
        $novo->execute([$tipo]);
        $valor = (int)($novo->fetch()['valor'] ?? ($inicial + 1));
    }
    resp(['ok'=>true, 'numero'=>$valor, 'formatado'=>str_pad($valor, 5, '0', STR_PAD_LEFT)]);

case 'ping':
    resp(['ok'=>true,'versao'=>'24/08/2026 v56','msg'=>'MH3 API funcionando','ts'=>date('Y-m-d H:i:s'),'php'=>phpversion()]);

case 'registro':
    // Devolve registros COMPLETOS, com as fotos. E o que a tela chama
    // depois que o sistema ja abriu, para preencher as fotos que vieram
    // como etiqueta no download de entrada.
    requerAuth($pdo);
    $ids = $body['ids'] ?? ($_GET['id'] ?? '');
    if (!is_array($ids)) $ids = array_filter(array_map('trim', explode(',', (string)$ids)));
    if (!count($ids)) err('Informe o id');
    if (count($ids) > 3) $ids = array_slice($ids, 0, 3);
    $marcas = implode(',', array_fill(0, count($ids), '?'));
    $st = $pdo->prepare("SELECT id, modulo, dados FROM mh3_dados WHERE id IN ($marcas)");
    $st->execute(array_values($ids));
    $pedacos = [];
    foreach ($st as $r) {
        $pedacos[] = '{"id":' . json_encode($r['id'], JSON_UNESCAPED_UNICODE) .
                     ',"modulo":' . json_encode($r['modulo'], JSON_UNESCAPED_UNICODE) .
                     ',"dados":' . $r['dados'] . '}';
    }
    echo '{"ok":true,"registros":[' . implode(',', $pedacos) . ']}';
    exit();

case 'pesados':
    // Lista os registros que tem foto. E daqui que sai a FILA de busca de
    // fotos do navegador (bloco mh3foto49): ele pede esta lista, ve quais
    // registros na tela ainda estao com etiqueta no lugar da foto, e vai
    // buscando UM POR VEZ, com pausa de 1,2s entre cada.
    //
    // v53 — DOIS CONSERTOS AQUI, E O PRIMEIRO E ERRO MEU:
    //
    // 1) 'so_no_aparelho' entrou na lista.
    //    Esse modulo eu criei ontem (inc132) para guardar copia das listas
    //    que so existem no navegador. Ele nao tem foto nenhuma, mas passa
    //    dos 20 KB — entao entrava na fila e roubava o lugar de quem tinha
    //    foto de verdade. Como a fila anda de um em um, cada copia dessas
    //    empurrava as mobilizacoes mais para o fim.
    //
    // 2) A ordem era do mais LEVE para o mais pesado.
    //    Parece cuidadoso, e e o contrario: as mobilizacoes sao os maiores
    //    registros do banco (9 MB cada, as tres maiores), entao ficavam
    //    sempre em ultimo. Com fila de um em um e pausa, elas eram as que
    //    mais demoravam a aparecer — e o usuario via a tela sem imagem.
    //    Agora vem primeiro quem esta na tela do usuario esperando: as
    //    mobilizacoes na frente, o resto depois.
    requerAuth($pdo);
    $st = $pdo->query("SELECT id, modulo, LENGTH(dados) AS tam FROM mh3_dados
                       WHERE modulo NOT IN ('pneus_hist','so_no_aparelho')
                         AND LENGTH(dados) > 20000
                       ORDER BY (modulo = 'mobilizacoes') DESC, LENGTH(dados) ASC");
    resp(['ok'=>true, 'registros'=>$st->fetchAll()]);

case 'conferir_fotos':
    // SO LEITURA. Passa por TODOS os registros, aplica a retirada das fotos
    // e confere registro a registro se o resultado continua sendo um JSON
    // valido. E a prova de que a resposta do sistema nao vai quebrar.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    @set_time_limit(300);
    $pdo = mh3Reconectar($pdo);   // v49: tarefa demorada — garante conexao viva
    $antes = 0; $depois = 0; $quebrados = []; $mexidos = 0; $total = 0;
    $st = $pdo->query("SELECT id, modulo, dados FROM mh3_dados WHERE modulo <> 'pneus_hist'");
    foreach ($st as $r) {
        $d = $r['dados']; $total++;
        $antes += strlen($d);
        $novo = (strlen($d) > 20000) ? mh3TirarFotos($d) : $d;
        if ($novo !== $d) $mexidos++;
        $depois += strlen($novo);
        $vale = function_exists('json_validate') ? json_validate($novo) : (json_decode($novo) !== null);
        if (!$vale) $quebrados[] = ['id'=>$r['id'], 'modulo'=>$r['modulo']];
        unset($d, $novo);
    }
    resp(['ok'=>true, 'registros'=>$total, 'registros_com_foto_retirada'=>$mexidos,
          'mb_antes'=>round($antes/1048576,2), 'mb_depois'=>round($depois/1048576,3),
          'registros_que_quebrariam'=>$quebrados,
          'memoria_pico_mb'=>round(memory_get_peak_usage(true)/1048576,1)]);

case 'codigo_acesso':
    // Cadastra, troca ou tira o codigo de acesso de um usuario.
    //   ...&action=codigo_acesso&chave=MH3-DIAG-2026&login=noninho&codigo=04003135610
    //   ...&action=codigo_acesso&chave=MH3-DIAG-2026&login=noninho&codigo=        (tira)
    // Sem "login", apenas LISTA quem tem codigo (nao mostra o codigo).
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    garantirColunaCodigo($pdo);
    $lg = trim((string)($_GET['login'] ?? ''));
    if ($lg === '') {
        $q = $pdo->query("SELECT login, nome, perfil,
                 CASE WHEN codigo_acesso IS NULL OR codigo_acesso='' THEN 'nao exige'
                      ELSE CONCAT('exige (', CHAR_LENGTH(codigo_acesso), ' digitos)') END AS codigo
               FROM mh3_usuarios ORDER BY login");
        resp(['ok'=>true, 'usuarios'=>$q->fetchAll(),
              'como_cadastrar'=>'acrescente &login=USUARIO&codigo=NUMERO no mesmo endereco',
              'como_tirar'=>'acrescente &login=USUARIO&codigo= (vazio)']);
    }
    if (!isset($_GET['codigo'])) err('Informe &codigo= (pode ser vazio para tirar a exigencia)');
    $cod = trim((string)$_GET['codigo']);
    $st = $pdo->prepare("UPDATE mh3_usuarios SET codigo_acesso=? WHERE login=?");
    $st->execute([$cod, $lg]);
    if (!$st->rowCount()) {
        $existe = $pdo->prepare("SELECT COUNT(*) FROM mh3_usuarios WHERE login=?");
        $existe->execute([$lg]);
        if (!(int)$existe->fetchColumn()) err('Usuario nao encontrado: '.$lg);
    }
    logAction($pdo, 'sistema', 'CODIGO_ACESSO', 'usuarios', ['desc'=>($cod===''?'retirado':'definido').' para '.$lg]);
    resp(['ok'=>true, 'msg'=> $cod===''
            ? ('O usuario "'.$lg.'" nao precisa mais de codigo de acesso.')
            : ('O usuario "'.$lg.'" passa a exigir codigo de acesso no login.')]);

case 'seguranca':
    // v51 — QUEM ESTA BATENDO NA PORTA
    //
    // POR QUE ISTO EXISTE
    // Entre dois diagnosticos com 4 minutos de diferenca, a tabela de
    // tentativas de login pulou de 72 para 152 linhas — 80 tentativas — e
    // no mesmo periodo abriu UMA sessao so. Tentativa que vira sessao e
    // login que deu certo; as outras 79 falharam. Nao dava para saber de
    // quem eram: a tabela guarda tudo, mas nada no sistema mostrava.
    //
    // Isto aqui SO LE. Nao apaga tentativa, nao derruba sessao, nao muda
    // senha. Mostra de qual login e de qual endereco vieram as batidas.
    //
    //   api.php?action=seguranca&chave=MH3-DIAG-2026
    //   ...&horas=24     (padrao: 2 horas)
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $horas = max(1, min(168, (int)($_GET['horas'] ?? 2)));
    $out = ['ok'=>true, 'janela'=>$horas.' hora(s)', 'agora'=>date('Y-m-d H:i:s')];

    // 1) resumo por login: quantas falharam, quantas deram certo
    try {
        $q = $pdo->prepare("SELECT login,
                 SUM(CASE WHEN sucesso=0 THEN 1 ELSE 0 END) AS falhou,
                 SUM(CASE WHEN sucesso=1 THEN 1 ELSE 0 END) AS entrou,
                 COUNT(DISTINCT ip) AS de_quantos_enderecos,
                 MIN(criado_em) AS primeira,
                 MAX(criado_em) AS ultima
               FROM mh3_tentativas
               WHERE criado_em > DATE_SUB(NOW(), INTERVAL ? HOUR)
               GROUP BY login ORDER BY falhou DESC, entrou DESC");
        $q->execute([$horas]);
        $out['por_login'] = $q->fetchAll();
    } catch (Exception $e) { $out['erro_por_login'] = $e->getMessage(); }

    // 2) resumo por endereco (IP): de onde vem a insistencia
    try {
        $q = $pdo->prepare("SELECT ip,
                 SUM(CASE WHEN sucesso=0 THEN 1 ELSE 0 END) AS falhou,
                 SUM(CASE WHEN sucesso=1 THEN 1 ELSE 0 END) AS entrou,
                 COUNT(DISTINCT login) AS quantos_logins_tentou,
                 GROUP_CONCAT(DISTINCT login ORDER BY login SEPARATOR ', ') AS logins,
                 MAX(criado_em) AS ultima
               FROM mh3_tentativas
               WHERE criado_em > DATE_SUB(NOW(), INTERVAL ? HOUR)
               GROUP BY ip ORDER BY falhou DESC");
        $q->execute([$horas]);
        $out['por_endereco'] = $q->fetchAll();
    } catch (Exception $e) { $out['erro_por_endereco'] = $e->getMessage(); }

    // 3) o ritmo: falhas por minuto. Gente digitando errado nao faz 20 por
    //    minuto; programa tentando senha faz.
    try {
        $q = $pdo->prepare("SELECT DATE_FORMAT(criado_em,'%Y-%m-%d %H:%i') AS minuto,
                 COUNT(*) AS tentativas,
                 SUM(CASE WHEN sucesso=0 THEN 1 ELSE 0 END) AS falhas,
                 GROUP_CONCAT(DISTINCT login SEPARATOR ', ') AS logins,
                 GROUP_CONCAT(DISTINCT ip SEPARATOR ', ') AS enderecos
               FROM mh3_tentativas
               WHERE criado_em > DATE_SUB(NOW(), INTERVAL ? HOUR)
               GROUP BY minuto HAVING tentativas > 2
               ORDER BY tentativas DESC LIMIT 20");
        $q->execute([$horas]);
        $out['minutos_com_muita_tentativa'] = $q->fetchAll();
    } catch (Exception $e) {}

    // 4) as ultimas, uma a uma
    try {
        $q = $pdo->prepare("SELECT criado_em, login, ip,
                 CASE WHEN sucesso=1 THEN 'entrou' ELSE 'recusado' END AS resultado
               FROM mh3_tentativas
               WHERE criado_em > DATE_SUB(NOW(), INTERVAL ? HOUR)
               ORDER BY criado_em DESC LIMIT 60");
        $q->execute([$horas]);
        $out['ultimas'] = $q->fetchAll();
    } catch (Exception $e) {}

    // 5) sessoes abertas — 41 para 3 pessoas e muita aba/aparelho esquecido
    try {
        $q = $pdo->query("SELECT usuario_nome, usuario_perfil, COUNT(*) AS sessoes,
                 MIN(criado_em) AS mais_antiga, MAX(criado_em) AS mais_nova
               FROM mh3_sessoes WHERE expira_em > NOW()
               GROUP BY usuario_nome, usuario_perfil ORDER BY sessoes DESC");
        $out['sessoes_abertas_por_pessoa'] = $q->fetchAll();
    } catch (Exception $e) {}

    // 6) o que a auditoria registrou de recusa
    try {
        $q = $pdo->prepare("SELECT acao, COUNT(*) AS vezes, MAX(criado_em) AS ultima,
                 GROUP_CONCAT(DISTINCT usuario_nome SEPARATOR ', ') AS quem
               FROM mh3_log
               WHERE criado_em > DATE_SUB(NOW(), INTERVAL ? HOUR)
                 AND (acao LIKE 'LOGIN%' OR acao LIKE 'ACESSO_NEGADO%')
               GROUP BY acao ORDER BY vezes DESC");
        $q->execute([$horas]);
        $out['registros_de_login_na_auditoria'] = $q->fetchAll();
    } catch (Exception $e) {}

    // 7) leitura em portugues do que os numeros dizem
    $leitura = [];
    try {
        foreach (($out['por_endereco'] ?? []) as $r) {
            $f = (int)$r['falhou'];
            if ($f >= 20 && (int)$r['quantos_logins_tentou'] >= 3)
                $leitura[] = 'O endereco '.$r['ip'].' errou a senha '.$f.' vezes em '.$r['quantos_logins_tentou'].' logins diferentes ('.$r['logins'].'). Isso tem cara de programa tentando adivinhar, nao de pessoa.';
            elseif ($f >= 20)
                $leitura[] = 'O endereco '.$r['ip'].' errou a senha '.$f.' vezes no login "'.$r['logins'].'". Tem cara de aparelho com senha velha guardada, repetindo sozinho.';
        }
        if (!$leitura) $leitura[] = 'Nada fora do normal nesta janela de '.$horas.'h. Se as batidas foram antes disso, chame de novo com &horas=24.';
    } catch (Exception $e) {}
    $out['leitura'] = $leitura;
    $out['bloqueio_ativo'] = '5 erros no mesmo login em 15 minutos travam aquele login por 15 minutos';
    resp($out);

case 'local_guardar':
    // v54 — guarda a copia de UMA lista deste aparelho, na tabela propria.
    // Nunca encosta em mh3_dados, entao nao aparece em ultima_alteracao,
    // nao entra em buscar_tudo, nao entra na fila de fotos, nao vira D.
    $s = requerAuth($pdo);
    garantirTabelaLocal($pdo);
    $ap    = trim((string)($body['aparelho'] ?? ''));
    $lista = trim((string)($body['lista'] ?? ''));
    $cont  = $body['conteudo'] ?? null;
    if ($ap === '' || $lista === '') err('aparelho e lista sao obrigatorios');
    if ($cont === null) err('conteudo vazio');
    $txt = json_encode($cont, JSON_UNESCAPED_UNICODE);
    if (strlen($txt) > 2000000) err('lista grande demais para copia (acima de 2 MB)');
    $qtd = is_array($cont) ? count($cont) : 0;
    $pdo->prepare("INSERT INTO mh3_local (id,aparelho,lista,quantos,conteudo) VALUES (?,?,?,?,?)
        ON DUPLICATE KEY UPDATE conteudo=VALUES(conteudo), quantos=VALUES(quantos),
                                atualizado_em=CURRENT_TIMESTAMP")
        ->execute([$ap.'|'.$lista, $ap, $lista, $qtd, $txt]);
    resp(['ok'=>true, 'lista'=>$lista, 'quantos'=>$qtd, 'bytes'=>strlen($txt)]);

case 'local_listar':
    // o que existe guardado, SEM o conteudo (resposta leve)
    requerAuth($pdo);
    garantirTabelaLocal($pdo);
    $q = $pdo->query("SELECT id, aparelho, lista, quantos, LENGTH(conteudo) AS bytes, atualizado_em
                      FROM mh3_local ORDER BY lista, atualizado_em DESC");
    resp(['ok'=>true, 'copias'=>$q->fetchAll()]);

case 'local_obter':
    // devolve o conteudo de UMA copia — so quando alguem pede para restaurar
    requerAuth($pdo);
    garantirTabelaLocal($pdo);
    $ap    = trim((string)($body['aparelho'] ?? $_GET['aparelho'] ?? ''));
    $lista = trim((string)($body['lista'] ?? $_GET['lista'] ?? ''));
    if ($lista === '') err('informe a lista');
    if ($ap !== '') {
        $q = $pdo->prepare("SELECT * FROM mh3_local WHERE aparelho=? AND lista=?");
        $q->execute([$ap, $lista]);
    } else {
        $q = $pdo->prepare("SELECT * FROM mh3_local WHERE lista=? ORDER BY atualizado_em DESC");
        $q->execute([$lista]);
    }
    $rows = $q->fetchAll();
    foreach ($rows as &$r) { $r['conteudo'] = json_decode($r['conteudo'], true); }
    resp(['ok'=>true, 'copias'=>$rows]);

case 'local_faxina':
    // v54 — TIRA DE mh3_dados o que eu gravei la por engano no dia 17/08.
    //
    // Passa o que da para aproveitar para a tabela nova e apaga o resto.
    // So leitura de um modulo especifico e exclusao dele: nao encosta em
    // nenhum dado do sistema.
    //
    //   api.php?action=local_faxina&chave=MH3-DIAG-2026
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    garantirTabelaLocal($pdo);
    $movidas = 0; $apagadas = 0; $erros = [];
    try {
        $velhos = $pdo->query("SELECT id, dados FROM mh3_dados WHERE modulo='so_no_aparelho'")->fetchAll();
        foreach ($velhos as $v) {
            try {
                $d = json_decode($v['dados'], true);
                if (is_array($d) && !empty($d['lista']) && !empty($d['aparelho'])) {
                    $txt = json_encode($d['conteudo'] ?? [], JSON_UNESCAPED_UNICODE);
                    $pdo->prepare("INSERT INTO mh3_local (id,aparelho,lista,quantos,conteudo) VALUES (?,?,?,?,?)
                        ON DUPLICATE KEY UPDATE conteudo=VALUES(conteudo), quantos=VALUES(quantos)")
                        ->execute([$d['aparelho'].'|'.$d['lista'], $d['aparelho'], $d['lista'],
                                   (int)($d['quantos'] ?? 0), $txt]);
                    $movidas++;
                }
            } catch (Exception $e) { $erros[] = $v['id'].': '.$e->getMessage(); }
        }
        $st = $pdo->prepare("DELETE FROM mh3_dados WHERE modulo='so_no_aparelho'");
        $st->execute();
        $apagadas = $st->rowCount();
        try { $pdo->exec("DELETE FROM mh3_leve WHERE modulo='so_no_aparelho'"); } catch (Exception $e) {}
    } catch (Exception $e) { resp(['ok'=>false,'msg'=>$e->getMessage()]); }
    resp(['ok'=>true,
          'copias_movidas_para_a_tabela_certa'=>$movidas,
          'linhas_tiradas_de_mh3_dados'=>$apagadas,
          'erros'=>$erros,
          'msg'=>'Pronto. A copia local nao mora mais na tabela do sistema.',
          'agora_no_navegador'=>'rode limparLixo132MH3() em cada computador para tirar o que ja tinha descido']);

case 'fotos_enxugar':
    // ============================================================
    // v55 — AS FOTOS ANTIGAS SAEM DE DENTRO DO REGISTRO
    // ------------------------------------------------------------
    // O PROBLEMA, MEDIDO
    // O banco tem 35 MB. Tres registros de mobilizacao sozinhos
    // ocupam 25,7 MB — 73% do total. Sao fotos gravadas em texto
    // (base64) dentro do proprio registro. Um PDF de vistoria sai
    // com 10 MB por causa disso.
    //
    // POR QUE ISTO NAO MUDA NENHUMA REGRA DO SISTEMA
    // O sistema JA guarda foto como arquivo. Esta no parte1:
    //
    //     function _uploadFoto(base64, nome, cb){
    //       fetch('api.php?action=upload_foto', ...)
    //       if(j && j.ok && j.url){ cb(j.url, nome); }
    //     }
    //
    // Toda foto tirada hoje vira "uploads/f_xxx.jpg" e o registro
    // guarda so o endereco. As pesadas sao as ANTIGAS, de antes
    // desse recurso existir.
    //
    // Entao aqui nao se inventa formato novo: as antigas passam a
    // ser guardadas do mesmo jeito que as de hoje ja sao. A tela
    // nao muda, o PDF nao muda, nenhuma funcao e alterada.
    //
    // AS TRAVAS — NENHUMA FOTO PODE SE PERDER
    //  1. modo simulacao por padrao: sem &confirmar=1 nao grava nada;
    //  2. um registro por chamada — nunca varre o banco de uma vez;
    //  3. antes de tocar no registro, o ORIGINAL INTEIRO vai para
    //     mh3_backups;
    //  4. cada foto e gravada em arquivo e RELIDA do disco: so vale
    //     se o que voltou for igual, byte a byte, ao que entrou;
    //  5. se UMA foto que seja falhar, o registro nao e alterado —
    //     e tudo ou nada, nunca pela metade;
    //  6. o JSON final e conferido antes de gravar; se nao for
    //     valido, nada e gravado.
    //
    //   simular:  api.php?action=fotos_enxugar&chave=MH3-DIAG-2026
    //   fazer:    ...&confirmar=1
    //   um certo: ...&confirmar=1&id=msxh0f104xr4j
    // ============================================================
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    @set_time_limit(300);
    $pdo = mh3Reconectar($pdo);
    $confirmar = ($_GET['confirmar'] ?? '') === '1';
    $idPedido  = trim((string)($_GET['id'] ?? ''));

    // 1) escolhe UM registro: o pedido, ou o maior que ainda tem foto em texto
    if ($idPedido !== '') {
        $q = $pdo->prepare("SELECT id, modulo, dados FROM mh3_dados WHERE id=?");
        $q->execute([$idPedido]);
    } else {
        $q = $pdo->prepare("SELECT id, modulo, dados FROM mh3_dados
                            WHERE modulo NOT IN ('pneus_hist','so_no_aparelho')
                              AND LENGTH(dados) > 200000
                              AND dados LIKE '%;base64,%'
                            ORDER BY LENGTH(dados) DESC LIMIT 1");
        $q->execute();
    }
    $reg = $q->fetch();
    if (!$reg) resp(['ok'=>true,'terminou'=>true,'msg'=>'Nao ha mais registro com foto em texto. Banco enxuto.']);

    $antesBytes = strlen($reg['dados']);
    $obj = json_decode($reg['dados'], true);
    if (!is_array($obj)) resp(['ok'=>false,'msg'=>'Registro nao e um JSON valido — nao vou encostar nele.','id'=>$reg['id']]);

    // 2) acha as fotos em texto, em qualquer profundidade
    $fotos = [];
    $achar = function (&$no, $caminho) use (&$achar, &$fotos) {
        if (is_array($no)) {
            foreach ($no as $k => &$v) { $achar($v, $caminho.'/'.$k); }
            unset($v);
        } elseif (is_string($no) && strpos($no, ';base64,') !== false && strpos($no, 'data:') === 0) {
            if (strlen($no) > 20000) $fotos[] = ['caminho'=>$caminho, 'bytes'=>strlen($no), 'ref'=>&$no];
        }
    };
    $achar($obj, '');

    if (!count($fotos)) {
        resp(['ok'=>true,'id'=>$reg['id'],'modulo'=>$reg['modulo'],
              'msg'=>'Este registro nao tem foto em texto (as fotos dele ja sao arquivo).',
              'KB'=>round($antesBytes/1024)]);
    }

    $plano = [];
    foreach ($fotos as $f) { $plano[] = ['onde'=>$f['caminho'], 'KB'=>round($f['bytes']/1024)]; }

    if (!$confirmar) {
        $somaFotos = 0; foreach ($fotos as $f) { $somaFotos += $f['bytes']; }
        resp(['ok'=>true, 'SIMULACAO'=>'nada foi alterado', 'id'=>$reg['id'], 'modulo'=>$reg['modulo'],
              'registro_hoje_KB'=>round($antesBytes/1024),
              'fotos_em_texto'=>count($fotos),
              'peso_das_fotos_KB'=>round($somaFotos/1024),
              'registro_ficaria_com_KB'=>round(($antesBytes-$somaFotos)/1024),
              'detalhe'=>$plano,
              'para_fazer'=>'acrescente &confirmar=1 no mesmo endereco']);
    }

    // 3) pasta de uploads (a mesma que o sistema ja usa)
    $dir = __DIR__ . '/uploads';
    if (!is_dir($dir)) { @mkdir($dir, 0775, true); }
    if (!is_dir($dir) || !is_writable($dir)) err('Pasta de uploads indisponivel no servidor', 500);

    // 4) BACKUP DO ORIGINAL INTEIRO, antes de qualquer coisa
    garantirTabelaBackups($pdo);
    $pdo->prepare("INSERT INTO mh3_backups (origem, app_versao, tamanho, conteudo) VALUES (?,?,?,?)")
        ->execute(['fotos_enxugar '.$reg['modulo'].' '.$reg['id'], 'v55', $antesBytes,
                   json_encode(['id'=>$reg['id'],'modulo'=>$reg['modulo'],'dados'=>$reg['dados']], JSON_UNESCAPED_UNICODE)]);
    $idBackup = (int)$pdo->lastInsertId();

    // 5) grava cada foto em arquivo e CONFERE relendo do disco
    $trocadas = 0; $falhas = [];
    foreach ($fotos as $i => $f) {
        $b64 = $f['ref'];
        $mime = 'image/jpeg';
        if (preg_match('#^data:([a-zA-Z0-9/+.\-]+);base64,#', $b64, $mm)) $mime = $mm[1];
        $ext  = (stripos($mime,'png') !== false) ? 'png' : ((stripos($mime,'webp') !== false) ? 'webp' : 'jpg');
        $puro = substr($b64, strpos($b64, ',') + 1);
        $bin  = base64_decode($puro, true);
        if ($bin === false || strlen($bin) < 100) { $falhas[] = $f['caminho'].': conteudo invalido'; continue; }

        $nome = 'f_' . date('Ymd_His') . '_' . substr(md5($reg['id'].$i.$f['caminho']), 0, 12) . '.' . $ext;
        $caminhoArq = $dir . '/' . $nome;
        if (file_put_contents($caminhoArq, $bin) === false) { $falhas[] = $f['caminho'].': nao gravou'; continue; }

        // RELE do disco e compara byte a byte
        $volta = @file_get_contents($caminhoArq);
        if ($volta === false || strlen($volta) !== strlen($bin) || md5($volta) !== md5($bin)) {
            @unlink($caminhoArq);
            $falhas[] = $f['caminho'].': o arquivo gravado nao confere com a foto';
            continue;
        }
        $fotos[$i]['ref'] = 'uploads/' . $nome;   // mesmo formato do upload_foto de hoje
        $fotos[$i]['arquivo'] = 'uploads/' . $nome;
        $trocadas++;
    }

    // 6) TUDO OU NADA
    if (count($falhas)) {
        foreach ($fotos as $f) { if (!empty($f['arquivo'])) @unlink($dir.'/'.basename($f['arquivo'])); }
        resp(['ok'=>false, 'id'=>$reg['id'],
              'msg'=>'Alguma foto nao passou na conferencia — o registro NAO foi alterado.',
              'falhas'=>$falhas, 'backup_id'=>$idBackup]);
    }

    $novo = json_encode($obj, JSON_UNESCAPED_UNICODE);
    $vale = function_exists('json_validate') ? json_validate($novo) : (json_decode($novo) !== null);
    if (!$vale || strlen($novo) < 50) {
        foreach ($fotos as $f) { if (!empty($f['arquivo'])) @unlink($dir.'/'.basename($f['arquivo'])); }
        resp(['ok'=>false,'id'=>$reg['id'],'msg'=>'O registro final nao ficou valido — nada foi gravado.','backup_id'=>$idBackup]);
    }

    // 7) grava, e atualiza a copia leve pelo caminho que ja existe
    $pdo->prepare("UPDATE mh3_dados SET dados=?, atualizado_em=NOW() WHERE id=?")->execute([$novo, $reg['id']]);
    mh3GravarLeve($pdo, $reg['id'], $reg['modulo'], $novo);
    logAction($pdo, 'sistema', 'FOTOS_PARA_ARQUIVO', $reg['modulo'],
              ['id'=>$reg['id'], 'desc'=>$trocadas.' foto(s) viraram arquivo · '.
               round($antesBytes/1024).' KB -> '.round(strlen($novo)/1024).' KB']);

    $resta = (int)$pdo->query("SELECT COUNT(*) FROM mh3_dados
                               WHERE modulo NOT IN ('pneus_hist','so_no_aparelho')
                                 AND LENGTH(dados) > 200000 AND dados LIKE '%;base64,%'")->fetchColumn();
    resp(['ok'=>true, 'id'=>$reg['id'], 'modulo'=>$reg['modulo'],
          'fotos_que_viraram_arquivo'=>$trocadas,
          'antes_KB'=>round($antesBytes/1024),
          'depois_KB'=>round(strlen($novo)/1024),
          'aliviou_KB'=>round(($antesBytes-strlen($novo))/1024),
          'backup_do_original'=>'mh3_backups id '.$idBackup,
          'ainda_faltam'=>$resta,
          'proximo_passo'=>$resta ? 'chame de novo o mesmo endereco com &confirmar=1' : 'acabou — nao ha mais registro pesado']);

case 'instalar':
    // Forca a conferencia da estrutura do banco agora (ja aconteceu la em cima).
    resp(['ok'=>true,'msg'=>'Estrutura do banco conferida e indices garantidos.','ts'=>date('Y-m-d H:i:s')]);

case 'diagnostico':
    // SO LEITURA — nao muda nada. Mostra o tamanho de cada tabela e o tempo
    // que a consulta pesada leva, pra saber se a lentidao e volume de dados
    // ou o banco compartilhado da Locaweb.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $out = ['ok'=>true, 'quando'=>date('Y-m-d H:i:s'), 'php'=>phpversion()];
    $t0 = microtime(true);
    try { $pdo->query("SELECT 1")->fetch(); } catch (Exception $e) {}
    $out['ms_ida_e_volta_banco'] = round((microtime(true)-$t0)*1000);
    try {
        // v52 — A COLUNA "linhas" ERA UM CHUTE, E EU TRATEI COMO CONTAGEM.
        //
        // O information_schema.table_rows nao conta nada: para InnoDB ele
        // ESTIMA, por amostragem do indice, e o numero balanca sozinho entre
        // uma consulta e outra sem nada ter mudado no banco.
        //
        // Foi assim que eu inventei um susto no dia 17/08: vi "72" num
        // diagnostico e "152" no seguinte, quatro minutos depois, e anunciei
        // 80 tentativas de login — possivel invasao. Nao houve tentativa
        // nenhuma. Os dois numeros eram estimativas diferentes da mesma
        // tabela parada. A ferramenta de seguranca, essa sim contando de
        // verdade, mostrou 50 entradas com UMA falha em 24 horas, todas do
        // mesmo endereco, o dele.
        //
        // Agora vem os dois numeros lado a lado: a estimativa e a contagem
        // real (COUNT), que e barata nestas tabelas. Assim ninguem mais le
        // um chute como se fosse fato — a comecar por mim.
        $q = $pdo->query("SELECT table_name AS t, table_rows AS estimativa_do_banco,
                 ROUND((data_length+index_length)/1024/1024,1) AS mb
                 FROM information_schema.tables
                 WHERE table_schema = DATABASE() ORDER BY (data_length+index_length) DESC");
        $tabs = $q->fetchAll();
        foreach ($tabs as &$tb) {
            try {
                $nome = preg_replace('/[^a-zA-Z0-9_]/', '', $tb['t']);
                $tb['linhas_de_verdade'] = (int)$pdo->query("SELECT COUNT(*) FROM `$nome`")->fetchColumn();
            } catch (Exception $e) { $tb['linhas_de_verdade'] = null; }
            $tb['_obs'] = 'use "linhas_de_verdade". A estimativa do banco balanca sozinha e nao serve para comparar.';
        }
        unset($tb);
        $out['tabelas'] = $tabs;
    } catch (Exception $e) { $out['tabelas'] = 'erro: '.$e->getMessage(); }
    try {
        $t1 = microtime(true);
        $n = 0; $bytes = 0;
        $st = $pdo->query("SELECT dados FROM mh3_dados WHERE modulo <> 'pneus_hist' ORDER BY criado_em ASC");
        foreach ($st as $r) { $n++; $bytes += strlen($r['dados']); }
        $out['registros_no_buscar_tudo'] = $n;
        $out['tamanho_mb_do_buscar_tudo'] = round($bytes/1024/1024, 2);
        $out['ms_do_buscar_tudo'] = round((microtime(true)-$t1)*1000);
        $out['_obs_buscar_tudo'] = 'os numeros acima sao o PESO BRUTO no banco (pior caso). O buscar_tudo real usa a copia leve — veja copia_leve_* abaixo.';
    } catch (Exception $e) { $out['erro_buscar_tudo'] = $e->getMessage(); }
    // vs284 v47 — desempenho do caminho NOVO (copia leve pre-pronta)
    try {
        garantirTabelaLeve($pdo);
        $t2 = microtime(true);
        $idxL = $pdo->query("SELECT id,modulo,atualizado_em FROM mh3_dados WHERE modulo NOT IN ('pneus_hist','so_no_aparelho') ORDER BY criado_em ASC, id ASC")->fetchAll(PDO::FETCH_ASSOC);
        $lv = []; $lvBytes = 0;
        foreach ($pdo->query("SELECT id,dados_leve,src_ts FROM mh3_leve") as $r) { $lv[$r['id']] = $r; $lvBytes += strlen($r['dados_leve']); }
        $faltam = 0;
        foreach ($idxL as $row) { $id=$row['id']; if (!(isset($lv[$id]) && $lv[$id]['src_ts']===$row['atualizado_em'])) $faltam++; }
        $out['copia_leve_registros'] = count($lv);
        $out['copia_leve_mb'] = round($lvBytes/1024/1024, 3);
        $out['copia_leve_faltam_migrar'] = $faltam;
        $out['ms_do_buscar_tudo_NOVO'] = round((microtime(true)-$t2)*1000);
        $out['copia_leve_status'] = $faltam===0 ? 'tudo migrado — buscar_tudo no caminho rapido' : ('faltam '.$faltam.' registros: rode action=migrar_leve&chave=MH3-DIAG-2026&limite=100 ate restam=0');
    } catch (Exception $e) { $out['erro_copia_leve'] = $e->getMessage(); }
    try {
        $idx = $pdo->query("SHOW INDEX FROM mh3_dados")->fetchAll(PDO::FETCH_ASSOC);
        $nm = []; foreach ($idx as $i) { $nm[$i['Key_name']] = 1; }
        $out['indices_mh3_dados'] = array_keys($nm);
    } catch (Exception $e) {}
    try { $out['sessoes_abertas'] = (int)$pdo->query("SELECT COUNT(*) c FROM mh3_sessoes")->fetch()['c']; } catch (Exception $e) {}
    try { $out['linhas_auditoria'] = (int)$pdo->query("SELECT COUNT(*) c FROM mh3_log")->fetch()['c']; } catch (Exception $e) {}
    try { $out['backups_guardados'] = (int)$pdo->query("SELECT COUNT(*) c FROM mh3_backups")->fetch()['c']; } catch (Exception $e) {}
    // DETALHE: onde estao os megabytes.
    // As contas sao feitas DENTRO do banco (SUM/LENGTH). A primeira versao
    // lia os 42 MB pelo PHP e estourava o tempo da pagina.
    if (($_GET['detalhe'] ?? '') === '1') {
        try {
            $q = $pdo->query("SELECT modulo,
                     COUNT(*) AS registros,
                     ROUND(SUM(LENGTH(dados))/1048576,2) AS mb,
                     ROUND(MAX(LENGTH(dados))/1024) AS maior_kb,
                     ROUND(AVG(LENGTH(dados))/1024) AS media_kb
                   FROM mh3_dados GROUP BY modulo ORDER BY SUM(LENGTH(dados)) DESC");
            $out['por_modulo'] = $q->fetchAll();
        } catch (Exception $e) { $out['erro_por_modulo'] = $e->getMessage(); }
        try {
            $q = $pdo->query("SELECT modulo, id, ROUND(LENGTH(dados)/1024) AS kb
                   FROM mh3_dados ORDER BY LENGTH(dados) DESC LIMIT 15");
            $out['registros_gigantes'] = $q->fetchAll();
        } catch (Exception $e) { $out['erro_gigantes'] = $e->getMessage(); }
        try {
            $q = $pdo->query("SELECT
                 ROUND(SUM(CASE WHEN dados LIKE '%__htmlDireto%' THEN LENGTH(dados) ELSE 0 END)/1048576,2) AS mb_html_do_contrato,
                 SUM(CASE WHEN dados LIKE '%__htmlDireto%' THEN 1 ELSE 0 END) AS qtd_html_do_contrato,
                 ROUND(SUM(CASE WHEN dados LIKE '%__ctmAnexos%' THEN LENGTH(dados) ELSE 0 END)/1048576,2) AS mb_com_anexo,
                 SUM(CASE WHEN dados LIKE '%__ctmAnexos%' THEN 1 ELSE 0 END) AS qtd_com_anexo,
                 ROUND(SUM(CASE WHEN dados LIKE '%data:image%' OR dados LIKE '%data:application%' THEN LENGTH(dados) ELSE 0 END)/1048576,2) AS mb_arquivo_virado_texto,
                 SUM(CASE WHEN dados LIKE '%data:image%' OR dados LIKE '%data:application%' THEN 1 ELSE 0 END) AS qtd_arquivo_virado_texto,
                 ROUND(SUM(LENGTH(dados))/1048576,2) AS mb_total
               FROM mh3_dados");
            $out['onde_esta_o_peso'] = $q->fetch();
        } catch (Exception $e) { $out['erro_peso'] = $e->getMessage(); }
    }
    // QUEM SAO OS USUARIOS e como estao os perfis/permissoes.
    // NAO mostra senha nem hash — so o FORMATO, para saber se esta sadia.
    try {
        $q = $pdo->query("SELECT login, nome, perfil, ativo, permissoes, ultimo_acesso FROM mh3_usuarios ORDER BY login");
        $us = [];
        foreach ($q as $u) {
            $perm = $u['permissoes'];
            $permDec = $perm ? json_decode($perm, true) : null;
            $criar = 0; $total = 0;
            if (is_array($permDec)) {
                foreach ($permDec as $k => $v) { $total++; if (substr($k, -6) === '-criar' && $v) $criar++; }
            }
            $us[] = [
                'login' => $u['login'],
                'nome' => $u['nome'],
                'perfil' => $u['perfil'],
                'e_admin_pela_regra' => ($u['perfil'] === 'admin' || stripos($u['nome'], 'noninho') !== false) ? 'SIM' : 'nao',
                'ativo' => (int)$u['ativo'],
                'permissoes' => $perm === null ? 'NULO (o sistema trata como: ve tudo)'
                                : ($permDec === null ? 'TEXTO INVALIDO' : ($total . ' chaves, ' . $criar . ' de criar')),
                'ultimo_acesso' => $u['ultimo_acesso'],
            ];
        }
        $out['usuarios'] = $us;
    } catch (Exception $e) { $out['erro_usuarios'] = $e->getMessage(); }

    // A senha de cada usuario esta guardada como hash de verdade?
    try {
        $q = $pdo->query("SELECT login, senha FROM mh3_usuarios ORDER BY login");
        $fmt = [];
        foreach ($q as $u) {
            $sn = (string)$u['senha'];
            if ($sn === '') $f = 'VAZIA — PERIGO';
            elseif (substr($sn, 0, 4) === '$2y$' || substr($sn, 0, 4) === '$2a$') $f = 'hash bcrypt (correto)';
            elseif (substr($sn, 0, 3) === '$1$' || substr($sn, 0, 3) === '$6$') $f = 'hash antigo';
            else $f = 'NAO E HASH (' . strlen($sn) . ' caracteres) — PERIGO';
            $fmt[$u['login']] = $f;
        }
        $out['formato_das_senhas'] = $fmt;
    } catch (Exception $e) { $out['erro_senhas'] = $e->getMessage(); }

    // Prova viva: uma senha errada e mesmo recusada?
    try {
        $u = $pdo->query("SELECT login, senha FROM mh3_usuarios WHERE ativo=1 ORDER BY login LIMIT 1")->fetch();
        if ($u) {
            $errada = 'senha-errada-de-proposito-' . substr(md5((string)$u['senha']), 0, 10);
            $passou = password_verify($errada, (string)$u['senha']);
            $out['teste_senha_errada'] = [
                'usuario_testado' => $u['login'],
                'senha_errada_foi_aceita' => $passou ? 'SIM — FALHA GRAVE DE SEGURANCA' : 'nao (correto)',
            ];
        }
    } catch (Exception $e) { $out['erro_teste_senha'] = $e->getMessage(); }

    // Quantos usuarios existem tambem guardados dentro das configuracoes
    // (o sistema tem DUAS listas de usuario — esta e uma fonte conhecida de confusao)
    try {
        $c = $pdo->query("SELECT valor FROM mh3_config WHERE chave='geral'")->fetch();
        $cfg = $c ? json_decode($c['valor'], true) : null;
        $out['usuarios_dentro_das_configuracoes'] = (is_array($cfg) && isset($cfg['usuarios']) && is_array($cfg['usuarios']))
            ? count($cfg['usuarios']) : 0;
    } catch (Exception $e) {}

    // LIMITES DO BANCO — para saber se algum registro grande pode estar
    // deixando de ser gravado. Se o registro passar do "maior pacote",
    // a gravacao FALHA (nao trunca), e a foto nova simplesmente nao entra.
    try {
        $lim = [];
        foreach (['max_allowed_packet','wait_timeout','innodb_log_file_size'] as $v) {
            $r = $pdo->query("SHOW VARIABLES LIKE '$v'")->fetch();
            if ($r) $lim[$v] = (int)$r['Value'];
        }
        $lim['max_allowed_packet_mb'] = isset($lim['max_allowed_packet'])
            ? round($lim['max_allowed_packet']/1048576, 1) : null;
        // v49: o do servidor e o desta conexao sao coisas diferentes.
        // O primeiro e 15 e nao esta na nossa mao; o segundo e o que vale
        // de verdade para os pedidos do sistema.
        try {
            $r = $pdo->query("SELECT @@session.wait_timeout AS s, @@global.wait_timeout AS g")->fetch();
            $lim['wait_timeout_do_servidor'] = (int)$r['g'];
            $lim['wait_timeout_desta_conexao'] = (int)$r['s'];
            $lim['folga_conseguida'] = ((int)$r['s'] > (int)$r['g'])
                ? ('sim — de '.$r['g'].'s para '.$r['s'].'s')
                : 'nao — a hospedagem nao deixou aumentar';
        } catch (Exception $e) {}
        $g = $pdo->query("SELECT id, modulo, LENGTH(dados) AS tam FROM mh3_dados
                          ORDER BY LENGTH(dados) DESC LIMIT 3")->fetchAll();
        foreach ($g as &$x) { $x['mb'] = round($x['tam']/1048576, 2); }
        $lim['tres_maiores'] = $g;
        $lim['cabe_o_maior'] = (isset($lim['max_allowed_packet']) && count($g))
            ? (($g[0]['tam'] * 1.1 < $lim['max_allowed_packet']) ? 'sim, com folga' : 'PERTO DO LIMITE')
            : null;
        $out['limites_do_banco'] = $lim;
    } catch (Exception $e) { $out['erro_limites'] = $e->getMessage(); }

    try {
        garantirColunaCodigo($pdo);
        $q = $pdo->query("SELECT login,
                 CASE WHEN codigo_acesso IS NULL OR codigo_acesso='' THEN 'nao exige' ELSE 'EXIGE' END AS c
               FROM mh3_usuarios ORDER BY login");
        $cc = []; foreach ($q as $u) { $cc[$u['login']] = $u['c']; }
        $out['codigo_de_acesso'] = $cc;
    } catch (Exception $e) {}
    $out['senha_do_banco_fora_do_api'] = MH3_SENHA_CENTRALIZADA ? 'sim (conexao.php)' : 'NAO — ainda esta escrita no api.php';
    $out['reset_admin_por_url'] = 'retirado na v48';
    $out['gzip_ligado_no_arquivo'] = MH3_GZIP ? 'sim' : 'nao';
    $out['navegador_aceita_gzip'] = $mh3AceitaGzip ? 'sim' : 'nao';
    $out['gzip_valendo_agora'] = (MH3_GZIP && $mh3AceitaGzip) ? 'sim' : 'nao';
    $out['memoria_pico_mb'] = round(memory_get_peak_usage(true)/1024/1024, 1);
    resp($out);

case 'fotos_analisar':
    // SO LEITURA — nao muda nada. Abre os registros mais pesados e conta
    // as fotos que estao guardadas DENTRO deles (em texto), dizendo
    // formato, tamanho e medidas de cada uma. E o que diz se compactar
    // resolve, e quanto resolve.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    @set_time_limit(300);
    $pdo = mh3Reconectar($pdo);   // v49: tarefa demorada — garante conexao viva
    $limite = max(1, (int)($_GET['limite'] ?? 20));
    $minKb  = max(50, (int)($_GET['min_kb'] ?? 200));
    $out = ['ok'=>true, 'gd_disponivel'=> function_exists('imagecreatefromstring') ? 'sim' : 'nao'];
    $out['imagick_disponivel'] = class_exists('Imagick') ? 'sim' : 'nao';
    $out['extensoes_de_imagem'] = array_values(array_intersect(get_loaded_extensions(), ['gd','imagick','vips','exif','zlib']));
    if (function_exists('gd_info')) { $g = @gd_info(); $out['gd_formatos'] = ['jpeg'=>!empty($g['JPEG Support']), 'png'=>!empty($g['PNG Support']), 'webp'=>!empty($g['WebP Support'])]; }
    $regs = []; $totBytes = 0; $totEstimado = 0; $porFormato = [];
    try {
        $st = $pdo->prepare("SELECT id, modulo, dados FROM mh3_dados
                             WHERE LENGTH(dados) > ? ORDER BY LENGTH(dados) DESC LIMIT " . (int)$limite);
        $st->execute([$minKb * 1024]);
        foreach ($st as $r) {
            $d = $r['dados'];
            $totBytes += strlen($d);
            // O registro e um JSON: dentro dele a barra vem escapada
            // (data:image\/jpeg). Desfazendo isso, o padrao simples
            // volta a encontrar as fotos. Sem esta linha o analisador
            // dizia ZERO fotos num registro de 8 MB.
            $d = str_replace('\/', '/', $d);
            $fotos = [];
            // acha cada "data:...;base64,XXXX" dentro do registro
            if (preg_match_all('#data:([a-zA-Z0-9/+.\-]+);base64,([A-Za-z0-9+/=]+)#', $d, $m, PREG_SET_ORDER)) {
                foreach ($m as $um) {
                    $mime = $um[1];
                    $b64  = $um[2];
                    $bytes = (int)(strlen($b64) * 3 / 4);
                    $info = ['tipo'=>$mime, 'kb'=>round($bytes/1024)];
                    $porFormato[$mime] = ($porFormato[$mime] ?? 0) + $bytes;
                    // so mede as grandes, pra nao gastar memoria a toa
                    if ($bytes > 100000 && strpos($mime, 'image/') === 0 && function_exists('getimagesizefromstring')) {
                        $bin = @base64_decode($b64, true);
                        if ($bin !== false) {
                            $t = @getimagesizefromstring($bin);
                            if ($t) { $info['largura'] = $t[0]; $info['altura'] = $t[1]; }
                            // estimativa do tamanho depois de encolher para 1600px e qualidade 70
                            if ($t && function_exists('imagecreatefromstring')) {
                                $lado = max($t[0], $t[1]);
                                $fator = $lado > 1600 ? (1600 / $lado) : 1;
                                $info['estimado_kb'] = round($bytes / 1024 * $fator * $fator * 0.35);
                                $totEstimado += $info['estimado_kb'] * 1024;
                            } else { $totEstimado += $bytes; }
                            unset($bin);
                        }
                    } else { $totEstimado += $bytes; }
                    $fotos[] = $info;
                }
            }
            usort($fotos, function($a,$b){ return $b['kb'] <=> $a['kb']; });
            $somaFotos = 0; foreach ($fotos as $f) { $somaFotos += $f['kb']; }
            $regs[] = ['modulo'=>$r['modulo'], 'id'=>$r['id'], 'kb_do_registro'=>round(strlen($d)/1024),
                       'quantas_fotos'=>count($fotos), 'kb_em_fotos'=>$somaFotos,
                       'kb_fora_das_fotos'=>max(0, round(strlen($d)/1024) - $somaFotos),
                       'inicio_do_registro'=>substr(preg_replace('#(base64,)[^"]{40,}#', '$1(...)', substr($d, 0, 600)), 0, 320),
                       'fotos'=>array_slice($fotos, 0, 8)];
            unset($d);
        }
    } catch (Exception $e) { $out['erro'] = $e->getMessage(); }
    $out['registros'] = $regs;
    $out['mb_examinados'] = round($totBytes/1048576, 2);
    $out['mb_estimado_depois_de_compactar'] = round($totEstimado/1048576, 2);
    foreach ($porFormato as $k=>$v) $out['mb_por_formato'][$k] = round($v/1048576, 2);
    $out['memoria_pico_mb'] = round(memory_get_peak_usage(true)/1048576, 1);
    resp($out);

case 'limpar_backups':
    // So roda se VOCE pedir. Guarda os N mais novos e apaga o resto.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $manter = max(3, (int)($_GET['manter'] ?? 5));
    try {
        $ids = $pdo->query("SELECT id FROM mh3_backups ORDER BY id DESC")->fetchAll(PDO::FETCH_COLUMN);
        if (count($ids) <= $manter) resp(['ok'=>true,'msg'=>'Nada a apagar. Ha '.count($ids).' backup(s).']);
        $corte = $ids[$manter-1];
        $st = $pdo->prepare("DELETE FROM mh3_backups WHERE id < ?");
        $st->execute([$corte]);
        $n = $st->rowCount();
        try { $pdo->exec("OPTIMIZE TABLE mh3_backups"); } catch (Exception $e) {}
        resp(['ok'=>true,'msg'=>'Backups antigos apagados, mantidos os '.$manter.' mais novos.','apagados'=>$n]);
    } catch (Exception $e) { resp(['ok'=>false,'msg'=>$e->getMessage()]); }

case 'limpar_log':
    // So roda se VOCE pedir, com a chave. Apaga auditoria mais velha que N dias.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $dias = max(30, (int)($_GET['dias'] ?? 180));
    $apagou = 0;
    try {
        $st = $pdo->prepare("DELETE FROM mh3_log WHERE criado_em < DATE_SUB(NOW(), INTERVAL ? DAY)");
        $st->execute([$dias]);
        $apagou = $st->rowCount();
    } catch (Exception $e) { resp(['ok'=>false,'msg'=>$e->getMessage()]); }
    try { $pdo->exec("OPTIMIZE TABLE mh3_log"); } catch (Exception $e) {}
    resp(['ok'=>true,'msg'=>'Auditoria com mais de '.$dias.' dias apagada.','linhas_apagadas'=>$apagou]);

case 'versao_sistema':
    // Checagem leve (só stat do arquivo, não lê o conteúdo) pra tela saber
    // se o parte5.txt mudou no servidor desde que ela carregou — usado
    // pelo aviso automático de atualização disponível.
    $mt = @filemtime(__DIR__.'/parte5.txt');
    resp(['ok'=>true, 'mtime'=>$mt]);


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
    $txtUpsert = json_encode($item, JSON_UNESCAPED_UNICODE);
    $pdo->prepare("INSERT INTO mh3_dados (id,modulo,dados) VALUES (?,?,?)
        ON DUPLICATE KEY UPDATE dados=VALUES(dados), atualizado_em=NOW()")
        ->execute([$id, $modulo, $txtUpsert]);
    mh3GravarLeve($pdo, $id, $modulo, $txtUpsert);   // v47: copia leve pronta
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
    logAction($pdo, $usr, $acao, $mod, ['desc'=>($body['descricao'] ?? null), 'id'=>($body['dado_id'] ?? null)]);
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

case 'backup_salvar':
    $s = requerAuth($pdo);
    garantirTabelaBackups($pdo);
    $conteudo = $body['conteudo'] ?? '';
    if (!is_string($conteudo) || strlen($conteudo) < 2) err('Conteúdo do backup vazio');
    $origem = substr(($body['origem'] ?? ($s['usuario_nome'] ?? 'sistema')), 0, 150);
    $appv   = substr(($body['app_versao'] ?? ''), 0, 80);
    $pdo->prepare("INSERT INTO mh3_backups (origem, app_versao, tamanho, conteudo) VALUES (?,?,?,?)")
        ->execute([$origem, $appv, strlen($conteudo), $conteudo]);
    $novoId = $pdo->lastInsertId();
    // Mantém apenas os 20 backups mais recentes (não deixa o banco encher)
    try {
        $ids = $pdo->query("SELECT id FROM mh3_backups ORDER BY id DESC LIMIT 20")->fetchAll(PDO::FETCH_COLUMN);
        if ($ids && count($ids) > 0) {
            $menor = (int)min($ids);
            $pdo->prepare("DELETE FROM mh3_backups WHERE id < ?")->execute([$menor]);
        }
    } catch (Exception $e) {}
    $n = $pdo->query("SELECT COUNT(*) FROM mh3_backups")->fetchColumn();
    logAction($pdo, $s['usuario_nome'] ?? '?', 'BACKUP_SALVAR', 'backup', ['desc'=>'Backup no servidor ('.strlen($conteudo).' bytes)']);
    resp(['ok'=>true, 'id'=>(int)$novoId, 'total'=>(int)$n]);

case 'backup_listar':
    requerAuth($pdo);
    garantirTabelaBackups($pdo);
    $rows = $pdo->query("SELECT id, criado_em, origem, app_versao, tamanho FROM mh3_backups ORDER BY id DESC")->fetchAll(PDO::FETCH_ASSOC);
    resp(['ok'=>true, 'lista'=>$rows]);

case 'backup_obter':
    requerAuth($pdo);
    garantirTabelaBackups($pdo);
    $id = (int)($body['id'] ?? 0);
    if (!$id) err('ID do backup não informado');
    $stmt = $pdo->prepare("SELECT id, criado_em, conteudo FROM mh3_backups WHERE id=?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) err('Backup não encontrado');
    resp(['ok'=>true, 'id'=>(int)$row['id'], 'criado_em'=>$row['criado_em'], 'conteudo'=>$row['conteudo']]);

case 'backup_apagar':
    $s = requerAuth($pdo);
    if (($s['usuario_perfil'] ?? '') !== 'admin') err('Apagar backup é restrito ao administrador', 403);
    garantirTabelaBackups($pdo);
    $id = (int)($body['id'] ?? 0);
    if (!$id) err('ID do backup não informado');
    $pdo->prepare("DELETE FROM mh3_backups WHERE id=?")->execute([$id]);
    logAction($pdo, $s['usuario_nome'] ?? '?', 'BACKUP_APAGAR', 'backup', ['desc'=>'Apagou backup #'.$id]);
    resp(['ok'=>true]);

// ============ E-MAIL: RASTREIO (enviado / aberto / confirmado) ============
case 'email_evento_registrar':
    $s = requerAuth($pdo);
    $token = trim($body['token'] ?? '');
    if ($token === '') err('token obrigatório');
    $pdo->prepare("INSERT INTO mh3_email_eventos (token,lancamento_id,tipo,destinatario,assunto,enviado_por) VALUES (?,?,?,?,?,?)
                   ON DUPLICATE KEY UPDATE lancamento_id=VALUES(lancamento_id),tipo=VALUES(tipo),destinatario=VALUES(destinatario),assunto=VALUES(assunto)")
        ->execute([$token, trim($body['lancamento_id'] ?? ''), trim($body['tipo'] ?? ''), trim($body['destinatario'] ?? ''), trim($body['assunto'] ?? ''), ($s['usuario_nome'] ?? '')]);
    resp(['ok'=>true]);

case 'email_pixel':
    // PÚBLICO: o programa de e-mail do destinatário carrega esta imagem ao abrir a mensagem
    $token = trim($_GET['t'] ?? '');
    if ($token !== '') {
        try {
            $pdo->prepare("UPDATE mh3_email_eventos SET aberto_em=COALESCE(aberto_em,NOW()), ip_abertura=COALESCE(ip_abertura,?) WHERE token=?")
                ->execute([($_SERVER['REMOTE_ADDR'] ?? ''), $token]);
        } catch (Exception $e) {}
    }
    while (ob_get_level() > 0) { @ob_end_clean(); }
    header_remove('Content-Type');
    header('Content-Type: image/gif');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    echo base64_decode('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    exit;

case 'email_confirmar':
    // PÚBLICO: o destinatário clica no botão "Confirmar recebimento"
    $token = trim($_GET['t'] ?? '');
    if ($token !== '') {
        try {
            $pdo->prepare("UPDATE mh3_email_eventos SET confirmado_em=COALESCE(confirmado_em,NOW()), aberto_em=COALESCE(aberto_em,NOW()), ip_confirmacao=COALESCE(ip_confirmacao,?) WHERE token=?")
                ->execute([($_SERVER['REMOTE_ADDR'] ?? ''), $token]);
        } catch (Exception $e) {}
    }
    while (ob_get_level() > 0) { @ob_end_clean(); }
    header_remove('Content-Type');
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="pt-br"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recebimento confirmado</title></head><body style="font-family:Arial,sans-serif;background:#f4f5f7;margin:0;padding:48px 16px;text-align:center"><div style="max-width:430px;margin:0 auto;background:#fff;border-radius:14px;padding:34px 26px;box-shadow:0 4px 18px rgba(0,0,0,.08)"><div style="font-size:58px;line-height:1">✅</div><h1 style="color:#16a34a;font-size:23px;margin:14px 0 8px">Recebimento confirmado!</h1><p style="color:#555;font-size:15px;line-height:1.55;margin:0">Obrigado. Avisamos a MH3 Rental que você recebeu o documento.</p><p style="color:#aaa;font-size:12px;margin-top:22px">MH3 Rental · mh3rental.com.br</p></div></body></html>';
    exit;

case 'email_eventos_listar':
    requerAuth($pdo);
    $rows = $pdo->query("SELECT token,lancamento_id,tipo,destinatario,assunto,enviado_por,
                         DATE_FORMAT(enviado_em,'%Y-%m-%dT%H:%i:%s') AS enviado_em,
                         DATE_FORMAT(aberto_em,'%Y-%m-%dT%H:%i:%s') AS aberto_em,
                         DATE_FORMAT(confirmado_em,'%Y-%m-%dT%H:%i:%s') AS confirmado_em
                         FROM mh3_email_eventos
                         WHERE enviado_em > DATE_SUB(NOW(), INTERVAL 120 DAY)
                         ORDER BY enviado_em DESC")->fetchAll();
    resp(['ok'=>true,'eventos'=>$rows]);


/* ================================================================
   v56 — O QUE FALTAVA PARA CONSERTAR SEM DEPENDER DE NINGUEM
   ----------------------------------------------------------------
   POR QUE ISTO EXISTE
   Em 24/08/2026 o dono do sistema ficou de fora do proprio app e
   nao havia UM caminho dentro do sistema para conferir por que.
   Todo o diagnostico teve que ser feito por fora, na mao, com o
   sistema parado do lado dele.

   Pior: na v48 eu retirei o reset por URL — por seguranca, e a
   retirada estava certa — mas nao deixei substituto. Se o usuario
   administrador tivesse sido desativado, nao existiria caminho
   nenhum de volta sem mexer no banco pelo painel da Locaweb.

   AS TRES ACOES ABAIXO SAO ADITIVAS
   Nada do que ja existia foi tocado. Sao casos novos no mesmo
   switch, no fim do arquivo.

   TODAS EXIGEM A CHAVE e TODAS FICAM REGISTRADAS no mh3_log.
   Nenhuma delas revela nem define senha — isso continua sendo
   coisa de quem tem o painel do banco, de proposito.
   ================================================================ */

case 'destravar_login':
    // Apaga as tentativas falhas de UM login, soltando o bloqueio de 15 min.
    //   api.php?action=destravar_login&chave=MH3-DIAG-2026&login=noninho
    //
    // POR QUE E SEGURO O BASTANTE
    // Nao entra no lugar de ninguem: a senha continua sendo exigida
    // normalmente no proximo login. Isto so zera o CONTADOR de erros.
    // Quem tem a chave ja podia, antes disto, tirar o codigo de acesso
    // de qualquer usuario (action=codigo_acesso) — que e poder maior.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $lg = trim((string)($_GET['login'] ?? ''));
    if ($lg === '') err('Informe &login=');

    $ex = $pdo->prepare("SELECT COUNT(*) FROM mh3_usuarios WHERE login=?");
    $ex->execute([$lg]);
    if (!(int)$ex->fetchColumn()) err('Usuario nao encontrado: '.$lg);

    $q = $pdo->prepare("SELECT COUNT(*) FROM mh3_tentativas
                        WHERE login=? AND sucesso=0
                          AND criado_em > DATE_SUB(NOW(), INTERVAL 15 MINUTE)");
    $q->execute([$lg]);
    $travando = (int)$q->fetchColumn();

    $st = $pdo->prepare("DELETE FROM mh3_tentativas WHERE login=? AND sucesso=0");
    $st->execute([$lg]);
    $apagadas = $st->rowCount();

    logAction($pdo, 'ferramenta', 'LOGIN_DESTRAVADO', 'usuarios',
              ['desc'=>$lg.' — '.$apagadas.' tentativa(s) falha(s) apagada(s)']);

    resp(['ok'=>true, 'login'=>$lg,
          'estava_travado' => $travando >= 5 ? 'sim' : 'nao',
          'tentativas_na_janela_de_15min' => $travando,
          'tentativas_apagadas' => $apagadas,
          'msg' => $travando >= 5
              ? 'O login "'.$lg.'" estava travado e foi solto. Pode entrar agora.'
              : 'O login "'.$lg.'" nao estava travado. As falhas antigas foram limpas do mesmo jeito.']);

case 'reativar_usuario':
    // Devolve um usuario desativado a lista de quem pode entrar.
    //   api.php?action=reativar_usuario&chave=MH3-DIAG-2026&login=noninho
    //
    // O usuario_deletar do sistema nao apaga: marca ativo=0. E o login
    // so aceita ativo=1. Nao havia nada que desfizesse isso — nem a tela
    // de usuarios, que ao salvar nao mexe nesse campo.
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $lg = trim((string)($_GET['login'] ?? ''));
    if ($lg === '') {
        $q = $pdo->query("SELECT login, nome, perfil, ativo FROM mh3_usuarios WHERE ativo=0 ORDER BY login");
        resp(['ok'=>true, 'desativados'=>$q->fetchAll(),
              'como_reativar'=>'acrescente &login=USUARIO no mesmo endereco']);
    }
    $st = $pdo->prepare("SELECT id,nome,perfil,ativo FROM mh3_usuarios WHERE login=?");
    $st->execute([$lg]);
    $u = $st->fetch();
    if (!$u) err('Usuario nao encontrado: '.$lg);
    if ((int)$u['ativo'] === 1) resp(['ok'=>true,'ja_estava_ativo'=>true,
        'msg'=>'O usuario "'.$lg.'" ja estava ativo. Nada foi mudado.']);

    $pdo->prepare("UPDATE mh3_usuarios SET ativo=1 WHERE id=?")->execute([$u['id']]);
    logAction($pdo, 'ferramenta', 'USUARIO_REATIVADO', 'usuarios', ['desc'=>$lg]);
    resp(['ok'=>true, 'login'=>$lg, 'nome'=>$u['nome'], 'perfil'=>$u['perfil'],
          'msg'=>'O usuario "'.$lg.'" voltou a poder entrar. A senha dele continua a mesma de antes.']);

case 'sessoes_faxina':
    // Derruba SO as sessoes ja vencidas. As de agora ficam de pe —
    // ninguem e posto para fora enquanto trabalha.
    //   api.php?action=sessoes_faxina&chave=MH3-DIAG-2026
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $antes = (int)$pdo->query("SELECT COUNT(*) FROM mh3_sessoes")->fetchColumn();
    $st = $pdo->prepare("DELETE FROM mh3_sessoes WHERE expira_em < NOW()");
    $st->execute();
    $tirou = $st->rowCount();
    logAction($pdo, 'ferramenta', 'SESSOES_FAXINA', 'sessoes', ['desc'=>$tirou.' vencida(s)']);
    resp(['ok'=>true, 'antes'=>$antes, 'vencidas_derrubadas'=>$tirou,
          'ainda_abertas'=>(int)$pdo->query("SELECT COUNT(*) FROM mh3_sessoes")->fetchColumn(),
          'msg'=>'Só as vencidas saíram. Quem está trabalhando agora não foi interrompido.']);


case 'conferir_arquivos':
    // O sistema e montado colando index.php + parte1..parte6. Se UM falta
    // ou sobe pela metade, tudo para — e a tela nao aponta o culpado.
    //
    // POR QUE ISTO E FEITO AQUI, E NAO PELO NAVEGADOR
    // Os .txt nao tem liberacao de origem cruzada (so o api.php tem). Uma
    // ferramenta aberta do computador tentando buscar parte1.txt leva bloqueio
    // do navegador e nao consegue distinguir "arquivo faltando" de "navegador
    // barrou" — e daria alarme falso de arquivo sumido, que e justamente o
    // susto que a gente quer evitar. Aqui o PHP le o disco e nao ha duvida.
    //
    //   api.php?action=conferir_arquivos&chave=MH3-DIAG-2026
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $lista = ['index.php','api.php','conexao.php',
              'parte1.txt','parte2.txt','parte3.txt','parte4.txt','parte5.txt','parte6.txt'];
    $out = []; $faltando = []; $vazios = [];
    foreach ($lista as $nome) {
        $caminho = __DIR__ . '/' . $nome;
        $existe = is_file($caminho);
        $tam = $existe ? (int)filesize($caminho) : 0;
        $item = [
            'arquivo' => $nome,
            'existe'  => $existe,
            'bytes'   => $tam,
            'kb'      => $existe ? round($tam/1024, 1) : 0,
            'alterado_em' => $existe ? date('Y-m-d H:i:s', filemtime($caminho)) : null,
        ];
        // o parte6 e o que mais apanha: confere se os blocos de script fecham
        if ($existe && substr($nome, 0, 5) === 'parte' && $tam > 0 && $tam < 3000000) {
            $txt = file_get_contents($caminho);
            $abre  = preg_match_all('/<script[\s>]/i', $txt);
            $fecha = preg_match_all('/<\/script>/i', $txt);
            $item['blocos_de_script'] = ['abre'=>$abre, 'fecha'=>$fecha,
                                         'fecham_todos'=> $abre === $fecha];
            unset($txt);
        }
        if (!$existe) $faltando[] = $nome;
        elseif ($tam < 500 && $nome !== 'conexao.php') $vazios[] = $nome;
        $out[] = $item;
    }
    $semScript = [];
    foreach ($out as $i) {
        if (isset($i['blocos_de_script']) && !$i['blocos_de_script']['fecham_todos']) $semScript[] = $i['arquivo'];
    }
    resp(['ok'=>true, 'pasta'=>basename(__DIR__), 'arquivos'=>$out,
          'faltando'=>$faltando, 'suspeitos_de_subir_pela_metade'=>$vazios,
          'com_script_sem_fechar'=>$semScript,
          'veredito' => (!$faltando && !$vazios && !$semScript)
              ? 'todos os arquivos do sistema estao no lugar e inteiros'
              : 'ha arquivo faltando, vazio ou com script sem fechar — o sistema pode nao abrir']);

case 'usuario_obter':
    // Devolve UM cadastro inteiro, permissoes incluidas.
    //
    // POR QUE PRECISA EXISTIR
    // O usuarios_listar nao traz as permissoes. E o usuario_salvar grava
    // sempre a coluna permissoes com o que recebeu — quem editar um usuario
    // sem reenviar as permissoes ZERA as 123 dele, calado. Ja aconteceu aqui
    // uma vez, num bloco de tela que foi retirado.
    // Sem esta leitura nao ha como editar preservando o que existe.
    //
    // Nao devolve a senha nem o hash. Nunca.
    $s = requerPermissao($pdo, 'adm');
    $lg = trim((string)($body['login'] ?? ($_GET['login'] ?? '')));
    $id = trim((string)($body['id'] ?? ($_GET['id'] ?? '')));
    if ($lg === '' && $id === '') err('Informe login ou id');
    if ($id !== '') { $st = $pdo->prepare("SELECT * FROM mh3_usuarios WHERE id=?");    $st->execute([$id]); }
    else            { $st = $pdo->prepare("SELECT * FROM mh3_usuarios WHERE login=?"); $st->execute([$lg]); }
    $u = $st->fetch();
    if (!$u) err('Usuario nao encontrado');
    resp(['ok'=>true, 'usuario'=>[
        'id'=>$u['id'], 'nome'=>$u['nome'], 'login'=>$u['login'],
        'perfil'=>$u['perfil'], 'ativo'=>(int)$u['ativo'],
        'permissoes'=> $u['permissoes'] ? json_decode($u['permissoes'], true) : null,
        'tem_codigo_acesso'=> isset($u['codigo_acesso']) && trim((string)$u['codigo_acesso']) !== '',
        'ultimo_acesso'=>$u['ultimo_acesso'],
    ]]);

case 'travados':
    // QUEM ESTA TRANCADO NESTE MOMENTO — com o MESMO criterio do login.
    //
    // POR QUE ISTO EXISTE
    // A ferramenta tentava deduzir isso do action=seguranca, que agrupa por
    // periodo longo. Nao da: quem entrou ontem e errou 5 vezes agora aparece
    // como "ja entrou", e o bloqueio passava despercebido. Errei assim no
    // primeiro teste — a ferramenta dizia "ninguem trancado" com o login
    // trancado de verdade.
    //
    // A conta certa e a mesma linha que o login usa: falhas com sucesso=0
    // nos ultimos 15 minutos. Quem responde e o servidor, que e quem decide.
    //
    //   api.php?action=travados&chave=MH3-DIAG-2026
    if (($_GET['chave'] ?? '') !== 'MH3-DIAG-2026') { http_response_code(403); resp(['ok'=>false,'msg'=>'Chave incorreta']); }
    $q = $pdo->query("SELECT login,
                 COUNT(*) AS falhas_em_15min,
                 MAX(criado_em) AS ultima_falha,
                 TIMESTAMPDIFF(SECOND, NOW(),
                     DATE_ADD(MIN(criado_em), INTERVAL 15 MINUTE)) AS solta_em_segundos
               FROM mh3_tentativas
               WHERE sucesso=0 AND criado_em > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
               GROUP BY login
               ORDER BY falhas_em_15min DESC");
    $todos = $q->fetchAll();
    $travados = [];
    foreach ($todos as $t) {
        if ((int)$t['falhas_em_15min'] >= 5) {
            $seg = max(0, (int)$t['solta_em_segundos']);
            $travados[] = [
                'login' => $t['login'],
                'falhas_em_15min' => (int)$t['falhas_em_15min'],
                'ultima_falha' => $t['ultima_falha'],
                'solta_em_minutos' => (int)ceil($seg/60),
                'aviso' => 'Enquanto esta assim, o servidor recusa ATE a senha certa. '
                         . 'A tela mostra "usuario e senha incorretos" do mesmo jeito.',
            ];
        }
    }
    resp(['ok'=>true, 'agora'=>date('Y-m-d H:i:s'),
          'regra'=>'5 falhas no mesmo login em 15 minutos trancam aquele login',
          'travados'=>$travados,
          'errando_mas_ainda_nao_travados'=>array_values(array_filter($todos, function($t){
              return (int)$t['falhas_em_15min'] < 5; })),
          'veredito'=> $travados ? (count($travados).' login(s) trancado(s) agora')
                                 : 'nenhum login trancado neste momento']);

default:
    err('Ação não reconhecida: '.$action);
}
?>