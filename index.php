<?php


@ini_set('zlib.output_compression', 'Off');
@ini_set('memory_limit', '256M');

$D   = __DIR__;
$VER = 'idx37';

$PARTES = array(
  'parte1.txt' => 200000,
  'parte2.txt' => 200000,
  'parte3.txt' => 200000,
  'parte4.txt' => 400000,
  'parte5.txt' => 400000,
);


$P6 = $D.'/parte6.txt';
$TEM_P6 = is_file($P6) && (int)@filesize($P6) > 100000;
if ($TEM_P6) $PARTES['parte6.txt'] = 100000;

/* impressoes digitais conhecidas (primeiros 16 caracteres do sha256) */
$CONHECIDOS = array(
  '1585ce2e5358a4eb' => 'parte1 base (correto)',
  '5521a9187147120b' => 'parte2 base (correto)',
  '0e6f8da4efa460bc' => 'parte3 base (correto)',
  'cc0439c38501beb6' => 'parte4 base (correto)',
  '4582c3e3245d3931' => 'parte5 v31 FINAL (correto — e este que tem que estar no ar)',
  '56f13a3698e4d8a7' => 'parte5 v30 (antigo — foi substituido pelo v31)',
  'd745638963982359' => 'parte5 v29 (antigo)',
  'af2d3b02114deff6' => 'parte5 v28 (antigo)',
  '45550114f0de84d9' => 'parte5 v27 (antigo)',
  '8fe13ac46139a4a2' => 'parte5 v28 intermediario — NAO USAR',
);

/* ---------------------------------------------------------------------------
   FUNCOES
   --------------------------------------------------------------------------- */
function telaAtualizando($erros) {
    http_response_code(503);
    header('Content-Type: text/html; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Retry-After: 60');
    echo '<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8">';
    echo '<meta name="viewport" content="width=device-width,initial-scale=1"><title>MH3 &mdash; atualizando</title></head>';
    echo '<body style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:60px auto;padding:0 18px;line-height:1.6;color:#222;text-align:center">';
    echo '<div style="font-size:46px">&#9881;</div>';
    echo '<h2 style="margin:6px 0 10px">O sistema esta sendo atualizado</h2>';
    echo '<p style="color:#555">Aguarde cerca de um minuto e atualize a pagina (F5).</p>';
    echo '<div style="margin-top:34px;text-align:left;background:#fdecec;border:1px solid #f0b4b4;border-radius:10px;padding:14px 16px;font-size:13px;color:#a01818">';
    echo '<b>Para o administrador &mdash; o upload nao completou:</b><ul style="margin:8px 0 0 18px">';
    foreach ($erros as $e) echo '<li>'.htmlspecialchars($e).'</li>';
    echo '</ul><div style="margin-top:10px">Suba o arquivo de novo pelo FileZilla em modo <b>Binario</b>.</div>';
    echo '</div></body></html>';
    exit;
}

/* Onde guardar o sistema ja montado.
   PRIORIDADE: pasta do proprio site (UNC share — nao e apagada quando o IIS
   recicla o processo). O temp do Windows e tentado so como ultimo recurso
   porque o IIS pode limpa-lo a qualquer momento, jogando os modulos fora.
   Os nomes terminam em .txt de proposito: o web.config bloqueia .txt,
   entao ninguem baixa o sistema montado pela internet. */
function pastaCache($D) {
    $cands = array(
        $D.'/cache',   /* subpasta dentro do site — persiste entre reinicios */
        $D,            /* raiz do site — ultimo recurso local                */
    );
    /* temp do sistema so se nada acima funcionar (pode ser limpo pelo Windows) */
    $tmp = @sys_get_temp_dir();
    if ($tmp) $cands[] = rtrim(str_replace('\\', '/', $tmp), '/').'/mh3cache';
    foreach ($cands as $c) {
        if ($c === '') continue;
        if (!is_dir($c)) @mkdir($c, 0777, true);
        if (is_dir($c) && is_writable($c)) return $c;
    }
    return '';
}

/* grava com nome provisorio e so depois renomeia: nunca existe cache pela metade */
function gravaSeguro($destino, $dados) {
    $tmp = $destino.'.'.uniqid('', true).'.tmp';
    $n = @file_put_contents($tmp, $dados);
    if ($n === false || $n !== strlen($dados)) { @unlink($tmp); return false; }
    if (@rename($tmp, $destino)) return true;
    @unlink($destino);                        /* no Windows, renomear por cima falha */
    if (@rename($tmp, $destino)) return true;
    @unlink($tmp);
    return false;
}

function limpaAntigos($dir, $sig) {
    $lista = @glob($dir.'/mh3sys_*.txt');
    if (!is_array($lista)) return;
    foreach ($lista as $f) if (strpos(basename($f), $sig) === false) @unlink($f);
}

function entregaArquivo($arquivo, $comprimido, $soCabecalho) {
    $tam = @filesize($arquivo);
    if ($tam === false || $tam <= 0) return false;
    if ($comprimido) header('Content-Encoding: gzip');
    header('Content-Length: '.$tam);
    if ($soCabecalho) return true;
    return (@readfile($arquivo) !== false);
}

/* monta os pedacos num texto so. Nao desiste se o navegador cansar. */
function montaTudo($D, $PARTES, &$falha) {
    @set_time_limit(300);
    @ignore_user_abort(true);
    $html = '';
    foreach (array_keys($PARTES) as $arq) {
        $c = @file_get_contents($D.'/'.$arq);
        if ($c === false || $c === '') { $falha = $arq.' nao pode ser lido agora (disco de rede da hospedagem)'; return ''; }
        $html .= $c;
    }
    if (strpos(substr($html, -300), '</html>') === false) { $falha = 'o sistema montado nao terminou em </html>. Se voce acabou de subir o parte5.txt novo (o curto, de ~718 KB), falta subir o parte6.txt — e ele que fecha a pagina. Suba o parte6.txt e atualize.'; return ''; }
    $falha = '';
    return $html;
}

function tam($b) { if ($b === false || $b === null) return '-'; return number_format((float)$b, 0, ',', '.').' B'; }

/* ---------------------------------------------------------------------------
   1) CONFERE OS 5 ARQUIVOS  (so olha tamanho e data — nao le o conteudo)
   --------------------------------------------------------------------------- */
$erros    = array();
$assina   = $VER;
$maisNovo = 0;

foreach ($PARTES as $arq => $min) {
    $p = $D.'/'.$arq;
    if (!is_file($p))              { $erros[] = "$arq nao esta no servidor"; continue; }
    $t = @filesize($p);
    $m = @filemtime($p);
    if ($t === false || $t < $min) { $erros[] = "$arq subiu pela metade (".(int)$t." bytes)"; continue; }
    if ($m > $maisNovo) $maisNovo = (int)$m;
    $assina .= '|'.$arq.':'.$t.':'.(int)$m;
}

if (!$erros) {
    /* quem FECHA a pagina e o ultimo arquivo da lista: parte6 se ele existir,
       senao o parte5. Conferir o arquivo errado daria alarme falso. */
    $ultimo = $TEM_P6 ? 'parte6.txt' : 'parte5.txt';
    $fp = @fopen($D.'/'.$ultimo, 'rb');
    if ($fp) {
        @fseek($fp, -30, SEEK_END); $fim = @fread($fp, 30); @fclose($fp);
        if (strpos((string)$fim, '</html>') === false) $erros[] = $ultimo.' esta cortado (nao termina em </html>)';
    } else $erros[] = 'nao consegui ler o '.$ultimo;
}

$sig  = md5($assina);
$etag = '"mh3-'.$sig.'"';

$dirC   = pastaCache($D);
$fPlano = $dirC !== '' ? $dirC.'/mh3sys_'.$sig.'.txt'    : '';
$fGz    = $dirC !== '' ? $dirC.'/mh3sys_'.$sig.'.gz.txt' : '';

/* ===========================================================================
   RAIO-X  —  index.php?raiox=mh3        (texto simples, sem senha de banco)
   =========================================================================== */
if (isset($_GET['raiox']) && $_GET['raiox'] === 'mh3') {
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    $comFing = isset($_GET['f']) && $_GET['f'] === '1';
    $L = array();
    $L[] = '=== RAIO-X DO SERVIDOR MH3 ===';
    $L[] = 'index.php instalado : VERSAO '.$VER.'  <<< se aparecer idx36 ou menos, o arquivo novo NAO subiu';
    $L[] = 'data/hora no servidor: '.date('d/m/Y H:i:s');
    $L[] = 'PHP                 : '.PHP_VERSION;
    $L[] = 'pasta do site       : '.$D;
    $L[] = '';
    $L[] = '--- OS ARQUIVOS DO SISTEMA ---';
    foreach ($PARTES as $arq => $min) {
        $p = $D.'/'.$arq;
        if (!is_file($p)) { $L[] = sprintf('%-12s FALTANDO', $arq); continue; }
        $lin = sprintf('%-12s %14s   %s', $arq, tam(@filesize($p)), date('d/m/Y H:i', (int)@filemtime($p)));
        if ($comFing && function_exists('hash_file')) {
            $h = @hash_file('sha256', $p);
            $h = $h ? substr($h, 0, 16) : '?';
            $lin .= '   '.$h.'  '.(isset($CONHECIDOS[$h]) ? $CONHECIDOS[$h] : '*** DESCONHECIDO ***');
        }
        $L[] = $lin;
    }
    if (!$comFing) $L[] = '(para ver as impressoes digitais, acrescente  &f=1  no endereco)';
    $L[] = '';
    $L[] = 'conferencia: '.($erros ? 'COM PROBLEMA -> '.implode(' | ', $erros) : 'os '.count($PARTES).' arquivos passaram');
    $L[] = '';
    $L[] = '--- SISTEMA JA MONTADO (cache) ---';
    $L[] = 'assinatura da versao atual: '.$sig;
    if ($dirC === '') {
        $L[] = 'NAO ACHEI PASTA GRAVAVEL — o sistema vai remontar a cada abertura (lento).';
    } else {
        $L[] = 'pasta do cache : '.$dirC;
        $L[] = 'montado normal : '.(is_file($fPlano) ? tam(@filesize($fPlano)).'  '.date('d/m/Y H:i', (int)@filemtime($fPlano)) : 'AINDA NAO MONTADO');
        $L[] = 'montado zipado : '.(is_file($fGz)    ? tam(@filesize($fGz)).'  '.date('d/m/Y H:i', (int)@filemtime($fGz))    : 'AINDA NAO MONTADO');
        $L[] = '(se aparecer AINDA NAO MONTADO, abra  index.php?montar=mh3  uma vez)';
    }
    $L[] = '';
    $L[] = '--- LEITOR DE PDF (proposta virar imagem no contrato) ---';
    $pj = $D.'/pdf.min.js'; $pw = $D.'/pdf.worker.min.js';
    $p1 = $D.'/pdfw1.txt';  $p2 = $D.'/pdfw2.txt'; $pp = $D.'/pdfworker.php';
    $L[] = 'pdf.min.js        : '.(is_file($pj) ? tam(@filesize($pj)) : 'nao esta no servidor');
    $L[] = 'pdf.worker.min.js : '.(is_file($pw) ? tam(@filesize($pw)) : 'nao esta no servidor');
    $L[] = 'pdfw1.txt         : '.(is_file($p1) ? tam(@filesize($p1)) : 'nao esta no servidor');
    $L[] = 'pdfw2.txt         : '.(is_file($p2) ? tam(@filesize($p2)) : 'nao esta no servidor');
    $L[] = 'pdfworker.php     : '.(is_file($pp) ? tam(@filesize($pp)) : 'nao esta no servidor');
    $temMotor = (is_file($pw) && @filesize($pw) > 900000) || (is_file($pp) && is_file($p1) && is_file($p2));
    if (is_file($pj) && !$temMotor) {
        $L[] = '';
        $L[] = '*** ATENCAO — COMBINACAO RUIM ***';
        $L[] = 'O pdf.min.js esta no servidor mas o MOTOR nao. Nessa combinacao a';
        $L[] = 'proposta NUNCA vira imagem e sempre sai como "(parte integrante)".';
        $L[] = 'SOLUCAO IMEDIATA: renomeie pdf.min.js para pdf.min.js.desligado';
    } elseif (is_file($pj) && $temMotor) {
        $L[] = 'situacao: OK — leitor completo no proprio servidor.';
    } else {
        $L[] = 'situacao: sem leitor local — o sistema busca na internet (funciona, mas depende da rede).';
    }
    $L[] = '';
    $L[] = '--- TUDO QUE ESTA NESTA PASTA (mais novo primeiro) ---';
    $itens = array();
    $dh = @opendir($D);
    if ($dh) {
        while (($n = readdir($dh)) !== false) {
            if ($n === '.' || $n === '..') continue;
            $fp2 = $D.'/'.$n;
            $itens[] = array($n, is_dir($fp2) ? -1 : (int)@filesize($fp2), (int)@filemtime($fp2));
        }
        closedir($dh);
    }
    usort($itens, function($a, $b) { return $b[2] - $a[2]; });
    foreach ($itens as $it) {
        $L[] = sprintf('%-34s %14s   %s', $it[0], ($it[1] < 0 ? '<pasta>' : tam($it[1])), date('d/m/Y H:i', $it[2]));
    }
    $L[] = '';
    $L[] = 'total de itens na pasta: '.count($itens);
    echo implode("\n", $L)."\n";
    exit;
}

/* ===========================================================================
   MONTAR AGORA  —  index.php?montar=mh3
   =========================================================================== */
if (isset($_GET['montar']) && $_GET['montar'] === 'mh3') {
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store');
    if ($erros) { echo "NAO DA PRA MONTAR:\n- ".implode("\n- ", $erros)."\n"; exit; }
    $t0 = microtime(true);
    $falha = '';
    $html = montaTudo($D, $PARTES, $falha);
    if ($falha !== '') { echo "FALHOU: $falha\n"; exit; }
    $seg = round(microtime(true) - $t0, 1);
    echo "Montou o sistema em {$seg} segundos — ".tam(strlen($html))."\n";
    if ($dirC === '') { echo "MAS NAO CONSEGUI GUARDAR: nenhuma pasta gravavel.\n"; exit; }
    $ok1 = gravaSeguro($fPlano, $html);
    $ok2 = false;
    if (function_exists('gzencode')) {
        $g = @gzencode($html, 6);
        if ($g !== false && $g !== null && strlen($g) > 0) { $ok2 = gravaSeguro($fGz, $g); echo "Versao zipada: ".tam(strlen($g))."\n"; unset($g); }
    }
    limpaAntigos($dirC, $sig);
    echo "guardado normal: ".($ok1 ? 'SIM' : 'NAO')."\n";
    echo "guardado zipado: ".($ok2 ? 'SIM' : 'NAO')."\n";
    echo "pasta do cache : $dirC\n";
    echo ($ok1 || $ok2) ? "\nPRONTO. Agora o sistema abre rapido. Pode fechar esta pagina.\n"
                        : "\nNao consegui guardar. Me avise.\n";
    exit;
}

/* ---------------------------------------------------------------------------
   2) ENTREGA NORMAL DO SISTEMA
   --------------------------------------------------------------------------- */
if ($erros) telaAtualizando($erros);

header('Content-Type: text/html; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
/* "no-cache" nao quer dizer "nao guarde". Quer dizer "guarde, mas SEMPRE
   pergunte antes de usar" — e o que impede ficar preso em versao velha.
   "private": descoberto em 28/07/2026 que a Locaweb tem um cache DELA na
   frente do site (acelerador) que estava entregando copia velha da pagina
   mesmo depois do upload — Ctrl+Shift+R e aba anonima nao resolviam porque
   a copia velha estava na Locaweb, nao no navegador. "private" proibe esse
   cache intermediario de guardar a pagina (só o navegador do usuario pode). */
header('Cache-Control: private, no-cache, must-revalidate, max-age=0');
header('ETag: '.$etag);
if ($maisNovo > 0) header('Last-Modified: '.gmdate('D, d M Y H:i:s', $maisNovo).' GMT');
header('Vary: Accept-Encoding');

$inm = isset($_SERVER['HTTP_IF_NONE_MATCH'])     ? trim($_SERVER['HTTP_IF_NONE_MATCH'])     : '';
$ims = isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) ? trim($_SERVER['HTTP_IF_MODIFIED_SINCE']) : '';
$jaTem = false;
if ($inm !== '')                             { if (strpos($inm, $sig) !== false) $jaTem = true; }
elseif ($ims !== '' && $maisNovo > 0)        { $q = @strtotime($ims); if ($q !== false && $q >= $maisNovo) $jaTem = true; }
if ($jaTem) { http_response_code(304); exit; }

$aceitaGz = function_exists('gzencode')
    && stripos((string)(isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : ''), 'gzip') !== false;
$soCabecalho = (isset($_SERVER['REQUEST_METHOD']) && strtoupper($_SERVER['REQUEST_METHOD']) === 'HEAD');

if ($dirC !== '') {
    if ($aceitaGz && is_file($fGz)) {
        if (entregaArquivo($fGz, true, $soCabecalho)) { limpaAntigos($dirC, $sig); exit; }
    } elseif (!$aceitaGz && is_file($fPlano)) {
        if (entregaArquivo($fPlano, false, $soCabecalho)) { limpaAntigos($dirC, $sig); exit; }
    }
}

/* nao estava montado: monta agora, guarda e entrega */
$falha = '';
$html = montaTudo($D, $PARTES, $falha);
if ($falha !== '') telaAtualizando(array($falha));

if ($dirC !== '') {
    gravaSeguro($fPlano, $html);
    if (function_exists('gzencode')) {
        $g = @gzencode($html, 6);
        if ($g !== false && $g !== null && strlen($g) > 0) { gravaSeguro($fGz, $g); unset($g); }
    }
    limpaAntigos($dirC, $sig);
}

if ($aceitaGz) {
    $saida = @gzencode($html, 6);
    if ($saida === false || $saida === null) $saida = $html;
    else header('Content-Encoding: gzip');
} else {
    $saida = $html;
}
unset($html);

header('Content-Length: '.strlen($saida));
if (!$soCabecalho) echo $saida;
