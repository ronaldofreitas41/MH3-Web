<?php
/* ============================================================
   MH3 — MEDIDOR DA LENTIDAO  (v1)
   Arquivo: mh3_medir.php
   O QUE FAZ: mede onde vao os ~9 segundos do action=buscar_tudo.
   SO LE. Nao grava, nao apaga, nao altera nada. Nenhum INSERT,
   UPDATE, DELETE, CREATE ou ALTER neste arquivo.

   COMO USAR
   1) Suba este arquivo na MESMA PASTA do seu api.php (por FTP).
   2) Abra no navegador:
        .../mh3_medir.php?chave=MH3-MEDIR-2026
   3) Copie TUDO que aparecer e cole no chat.
   4) Depois de usar, APAGUE o arquivo do servidor.

   A senha do banco NAO esta escrita aqui: o medidor le a que ja
   existe no seu proprio api.php. Ele nunca mostra a senha.
   ============================================================ */

@ini_set('display_errors', '0');
@ini_set('memory_limit', '512M');
@set_time_limit(300);
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex');

$CHAVE = 'MH3-MEDIR-2026';
if (($_GET['chave'] ?? '') !== $CHAVE) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'msg' => 'Chave incorreta. Use ?chave=MH3-MEDIR-2026'], JSON_UNESCAPED_UNICODE);
    exit;
}

function ms($t0)
{
    return round((microtime(true) - $t0) * 1000, 1);
}
function mb_($b)
{
    return round(((float)$b) / 1048576, 2);
}

$R = ['ok' => true, 'medido_em' => date('Y-m-d H:i:s')];

/* ---------- 1. DE ONDE VEM A SENHA DO BANCO ---------- */
$cfg = ['host' => null, 'nome' => null, 'user' => null, 'pass' => null];
$fonte = null;
$candidatos = [__DIR__ . '/api.php', __DIR__ . '/core/config.php', __DIR__ . '/config.php', dirname(__DIR__) . '/api.php'];
foreach ($candidatos as $arq) {
    if (!@is_file($arq)) continue;
    $txt = @file_get_contents($arq);
    if ($txt === false) continue;
    $achou = 0;
    foreach ([['host', 'DB_HOST'], ['nome', 'DB_NAME'], ['user', 'DB_USER'], ['pass', 'DB_PASS']] as $par) {
        if (preg_match("/define\\s*\\(\\s*['\"]" . $par[1] . "['\"]\\s*,\\s*['\"](.*?)['\"]\\s*\\)/s", $txt, $m)) {
            $cfg[$par[0]] = $m[1];
            $achou++;
        }
    }
    if ($achou < 4) {
        foreach ([['host', 'host'], ['nome', 'db|dbname|database|banco'], ['user', 'user|usuario'], ['pass', 'pass|senha']] as $par) {
            if ($cfg[$par[0]] !== null) continue;
            if (preg_match("/\\\$(" . $par[1] . ")\\s*=\\s*['\"](.*?)['\"]\\s*;/i", $txt, $m)) {
                $cfg[$par[0]] = $m[2];
                $achou++;
            }
        }
    }
    unset($txt);
    if ($cfg['host'] && $cfg['nome'] && $cfg['user']) {
        $fonte = basename(dirname($arq)) . '/' . basename($arq);
        break;
    }
}
$R['config'] = [
    'lida_de'  => $fonte ?: 'NAO ENCONTRADA',
    'host'     => $cfg['host'],
    'banco'    => $cfg['nome'],
    'usuario'  => $cfg['user'],
    'senha'    => $cfg['pass'] === null ? 'nao achei' : ('achei (' . strlen($cfg['pass']) . ' caracteres)'),
];
if (!$fonte) {
    $R['ok'] = false;
    $R['msg'] = 'Nao achei os dados do banco. Coloque este arquivo na mesma pasta do api.php.';
    echo json_encode($R, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/* ---------- 2. AMBIENTE ---------- */
$R['ambiente'] = [
    'php'                 => PHP_VERSION,
    'memory_limit'        => ini_get('memory_limit'),
    'zlib_output'         => ini_get('zlib.output_compression') ? 'ligado' : 'desligado',
    'tem_gzencode'        => function_exists('gzencode') ? 'sim' : 'nao',
    'tem_json_validate'   => function_exists('json_validate') ? 'sim' : 'nao',
    'pasta'               => __DIR__,
];

/* ---------- 3. CONEXAO ---------- */
$t = microtime(true);
try {
    $pdo = new PDO(
        "mysql:host={$cfg['host']};dbname={$cfg['nome']};charset=utf8mb4",
        $cfg['user'],
        (string)$cfg['pass'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (Throwable $e) {
    $R['ok'] = false;
    $R['msg'] = 'Conexao com o banco falhou: ' . $e->getMessage();
    echo json_encode($R, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
$R['tempos_ms']['1_conectar_no_banco'] = ms($t);

try {
    $R['ambiente']['mysql'] = $pdo->query("SELECT VERSION()")->fetchColumn();
} catch (Throwable $e) {
}

/* ---------- 4. PESO POR MODULO ---------- */
$t = microtime(true);
$R['por_modulo'] = [];
$totalBytes = 0;
$totalLinhas = 0;
try {
    $q = $pdo->query("SELECT modulo, COUNT(*) AS linhas, SUM(LENGTH(dados)) AS bytes,
                             MAX(LENGTH(dados)) AS maior_linha, AVG(LENGTH(dados)) AS media
                      FROM mh3_dados GROUP BY modulo ORDER BY bytes DESC");
    foreach ($q as $r) {
        $R['por_modulo'][] = [
            'modulo'      => $r['modulo'],
            'linhas'      => (int)$r['linhas'],
            'MB'          => mb_($r['bytes']),
            'maior_linha_KB' => round(((float)$r['maior_linha']) / 1024, 1),
            'media_KB'    => round(((float)$r['media']) / 1024, 1),
        ];
        $totalBytes += (float)$r['bytes'];
        $totalLinhas += (int)$r['linhas'];
    }
} catch (Throwable $e) {
    $R['por_modulo'] = 'ERRO: ' . $e->getMessage();
}
$R['total_mh3_dados'] = ['linhas' => $totalLinhas, 'MB' => mb_($totalBytes)];
$R['tempos_ms']['2_peso_por_modulo'] = ms($t);

/* ---------- 5. A HIPOTESE: FOTOS AINDA GRAVADAS DENTRO DE dados ---------- */
$t = microtime(true);
try {
    $r = $pdo->query("SELECT COUNT(*) AS linhas, COALESCE(SUM(LENGTH(dados)),0) AS bytes
                      FROM mh3_dados WHERE dados LIKE '%data:image%'")->fetch();
    $R['fotos_dentro_do_banco'] = [
        'linhas_com_foto_embutida' => (int)$r['linhas'],
        'MB_dessas_linhas'         => mb_($r['bytes']),
        'leitura'                  => ((int)$r['linhas'] > 0)
            ? 'CONFIRMADO: ainda tem foto gravada dentro da coluna dados'
            : 'NAO: nenhuma foto embutida sobrou (a hipotese cai)',
    ];
} catch (Throwable $e) {
    $R['fotos_dentro_do_banco'] = 'ERRO: ' . $e->getMessage();
}
$R['tempos_ms']['3_procurar_fotos'] = ms($t);

/* ---------- 6. AS 10 LINHAS MAIS PESADAS ---------- */
try {
    $q = $pdo->query("SELECT modulo, id, LENGTH(dados) AS n,
                             (LOCATE('data:image', dados) > 0) AS tem_foto
                      FROM mh3_dados ORDER BY LENGTH(dados) DESC LIMIT 10");
    $R['dez_linhas_mais_pesadas'] = [];
    foreach ($q as $r) {
        $R['dez_linhas_mais_pesadas'][] = [
            'modulo' => $r['modulo'],
            'id' => $r['id'],
            'KB' => round(((float)$r['n']) / 1024, 1),
            'tem_foto_embutida' => ((int)$r['tem_foto'] === 1 ? 'sim' : 'nao'),
        ];
    }
} catch (Throwable $e) {
    $R['dez_linhas_mais_pesadas'] = 'ERRO: ' . $e->getMessage();
}

/* ---------- 7. O buscar_tudo, PASSO A PASSO ---------- */
/* Repete EXATAMENTE o que o api.php faz, cronometrando cada etapa. */
$passo = [];
$memIni = memory_get_usage(true);

$t = microtime(true);
try {
    $stmt = $pdo->query("SELECT modulo,dados,atualizado_em FROM mh3_dados
                         WHERE modulo <> 'pneus_hist' ORDER BY criado_em ASC");
    $passo['a_o_banco_pensar_ms'] = ms($t);

    $t = microtime(true);
    $byMod = [];
    $byModTs = [];
    $lidos = 0;
    $ignorados = 0;
    $bytesLidos = 0;
    foreach ($stmt as $row) {
        $d = $row['dados'];
        if ($d === null || $d === '') {
            $ignorados++;
            continue;
        }
        $dec = json_decode($d);
        if ($dec === null && strtolower(trim($d)) !== 'null') {
            $ignorados++;
            continue;
        }
        unset($dec);
        $bytesLidos += strlen($d);
        $m = $row['modulo'];
        if (!isset($byMod[$m])) {
            $byMod[$m] = [];
            $byModTs[$m] = [];
        }
        $byMod[$m][] = $d;
        $byModTs[$m][] = json_encode($row['atualizado_em']);
        $lidos++;
    }
    $passo['b_puxar_as_linhas_e_conferir_ms'] = ms($t);
    $passo['linhas_lidas'] = $lidos;
    $passo['linhas_ignoradas'] = $ignorados;
    $passo['MB_saidos_do_banco'] = mb_($bytesLidos);

    $t = microtime(true);
    $parts = [];
    $partsTs = [];
    foreach ($byMod as $m => $arr) {
        $parts[]   = json_encode((string)$m, JSON_UNESCAPED_UNICODE) . ':[' . implode(',', $arr) . ']';
        $partsTs[] = json_encode((string)$m, JSON_UNESCAPED_UNICODE) . ':[' . implode(',', $byModTs[$m]) . ']';
    }
    $saida = '{"ok":true,"dados":{' . implode(',', $parts) . '},"ts":{' . implode(',', $partsTs) . '}}';
    $passo['c_montar_o_texto_ms'] = ms($t);
    $passo['MB_da_resposta_crua'] = mb_(strlen($saida));

    if (function_exists('gzencode')) {
        $t = microtime(true);
        $gz6 = gzencode($saida, 6);
        $passo['d_compactar_nivel6_ms'] = ms($t);
        $passo['MB_compactado_nivel6'] = mb_(strlen($gz6));
        unset($gz6);

        $t = microtime(true);
        $gz1 = gzencode($saida, 1);
        $passo['d2_compactar_nivel1_ms'] = ms($t);
        $passo['MB_compactado_nivel1'] = mb_(strlen($gz1));
        unset($gz1);
    }
    unset($saida, $byMod, $byModTs, $parts, $partsTs);
} catch (Throwable $e) {
    $passo['ERRO'] = $e->getMessage();
}
$passo['memoria_usada_MB'] = mb_(memory_get_peak_usage(true) - $memIni);
$passo['memoria_pico_MB']  = mb_(memory_get_peak_usage(true));
$R['buscar_tudo_passo_a_passo'] = $passo;

/* ---------- 8. TESTE: E SE NAO ORDENAR? ---------- */
try {
    $t = microtime(true);
    $st = $pdo->query("SELECT modulo,dados,atualizado_em FROM mh3_dados WHERE modulo <> 'pneus_hist'");
    $n = 0;
    foreach ($st as $row) {
        $n++;
    }
    $R['sem_ordenar'] = [
        'ms' => ms($t),
        'linhas' => $n,
        'para_que_serve' => 'se for MUITO mais rapido que o item 7, o ORDER BY criado_em e o culpado'
    ];
} catch (Throwable $e) {
    $R['sem_ordenar'] = 'ERRO: ' . $e->getMessage();
}

/* ---------- 9. INDICES E PLANO DA CONSULTA ---------- */
try {
    $R['indices_mh3_dados'] = $pdo->query("SHOW INDEX FROM mh3_dados")->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $R['indices_mh3_dados'] = 'ERRO: ' . $e->getMessage();
}
try {
    $R['plano_da_consulta'] = $pdo->query("EXPLAIN SELECT modulo,dados,atualizado_em FROM mh3_dados WHERE modulo <> 'pneus_hist' ORDER BY criado_em ASC")->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $R['plano_da_consulta'] = 'ERRO: ' . $e->getMessage();
}

/* ---------- 10. TAMANHO DAS TABELAS ---------- */
try {
    $q = $pdo->prepare("SELECT table_name, table_rows,
                        ROUND(data_length/1048576,2) AS dados_MB,
                        ROUND(index_length/1048576,2) AS indice_MB
                        FROM information_schema.tables
                        WHERE table_schema = ? ORDER BY data_length DESC");
    $q->execute([$cfg['nome']]);
    $R['tabelas'] = $q->fetchAll(PDO::FETCH_ASSOC);
} catch (Throwable $e) {
    $R['tabelas'] = 'ERRO: ' . $e->getMessage();
}

/* ---------- 11. BACKUPS E AUDITORIA (peso morto) ---------- */
try {
    $r = $pdo->query("SELECT COUNT(*) AS n, COALESCE(SUM(LENGTH(conteudo)),0) AS b FROM mh3_backups")->fetch();
    $R['backups'] = ['copias' => (int)$r['n'], 'MB' => mb_($r['b'])];
} catch (Throwable $e) {
    $R['backups'] = 'tabela nao existe ou sem acesso';
}
try {
    $r = $pdo->query("SELECT COUNT(*) AS n FROM mh3_log")->fetch();
    $R['auditoria_linhas'] = (int)$r['n'];
} catch (Throwable $e) {
    $R['auditoria_linhas'] = 'tabela nao existe';
}

/* ---------- 12. QUAIS ACOES O api.php DESTA PASTA TEM ---------- */
try {
    $arqApi = __DIR__ . '/api.php';
    if (@is_file($arqApi)) {
        $txt = @file_get_contents($arqApi);
        preg_match_all("/case\\s*'([a-z0-9_]+)'\\s*:/i", $txt, $m);
        $R['api_php_desta_pasta'] = [
            'tamanho_bytes' => strlen($txt),
            'md5'           => md5($txt),
            'modificado_em' => date('Y-m-d H:i:s', @filemtime($arqApi)),
            'acoes'         => array_values(array_unique($m[1])),
        ];
        unset($txt);
    } else {
        $R['api_php_desta_pasta'] = 'nao existe api.php nesta pasta';
    }
} catch (Throwable $e) {
    $R['api_php_desta_pasta'] = 'ERRO: ' . $e->getMessage();
}

/* ---------- 13. QUE ARQUIVOS EXISTEM AQUI ---------- */
try {
    $lista = [];
    foreach (@scandir(__DIR__) ?: [] as $f) {
        if ($f === '.' || $f === '..') continue;
        $p = __DIR__ . '/' . $f;
        $lista[] = [
            'nome' => $f,
            'tipo' => (is_dir($p) ? 'pasta' : 'arquivo'),
            'KB' => is_dir($p) ? null : round(@filesize($p) / 1024, 1),
            'modificado' => date('Y-m-d H:i', @filemtime($p))
        ];
    }
    $R['arquivos_na_pasta'] = $lista;
} catch (Throwable $e) {
    $R['arquivos_na_pasta'] = 'ERRO';
}

echo json_encode($R, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_PARTIAL_OUTPUT_ON_ERROR);
