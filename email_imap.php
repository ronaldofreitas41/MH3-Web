<?php
/* email_imap.php — Leitura de caixa de e-mail (IMAP) para o MH3 Rental.
   Autônomo (não depende do api.php). Recebe credenciais + ação e devolve JSON.
   Ações: 'listar' (mensagens de uma pasta), 'ler' (corpo de uma mensagem),
          'pastas' (lista as pastas da conta).
   Não armazena nada. */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, X-Token');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

if (function_exists('mb_internal_encoding')) mb_internal_encoding('UTF-8');
@date_default_timezone_set('America/Sao_Paulo');

$raw = file_get_contents('php://input');
$in = json_decode($raw, true);
if (!is_array($in)) {
    $in = $_POST;
}

if ((isset($in['chave']) ? $in['chave'] : '') !== 'mh3-imap-2026') {
    echo json_encode(array('ok' => false, 'msg' => 'Acesso negado.'));
    exit;
}
if (!function_exists('imap_open')) {
    echo json_encode(array('ok' => false, 'msg' => 'O servidor não tem o módulo IMAP habilitado.'));
    exit;
}

$acao  = isset($in['acao'])  ? $in['acao']  : 'listar';
$host  = trim(isset($in['host'])  ? $in['host']  : '');
$porta = intval(isset($in['porta']) ? $in['porta'] : 993);
$login = trim(isset($in['login']) ? $in['login'] : '');
$senha = isset($in['senha']) ? $in['senha'] : '';
$pasta = isset($in['pasta']) && $in['pasta'] !== '' ? $in['pasta'] : 'INBOX';

if (!$host || !$login || $senha === '') {
    echo json_encode(array('ok' => false, 'msg' => 'Faltam dados da conta (servidor, login ou senha).'));
    exit;
}

// ---------- helpers ----------
function dec_header($str)
{
    if ($str === null || $str === '') return '';
    $out = '';
    $partes = imap_mime_header_decode($str);
    foreach ($partes as $p) {
        $cs = strtoupper($p->charset);
        $txt = $p->text;
        if ($cs && $cs !== 'DEFAULT' && $cs !== 'UTF-8') {
            $conv = @iconv($cs, 'UTF-8//TRANSLIT', $txt);
            if ($conv !== false) $txt = $conv;
        }
        $out .= $txt;
    }
    return $out;
}
function dec_body($body, $enc)
{
    if ($enc == 3) return base64_decode($body);       // base64
    if ($enc == 4) return quoted_printable_decode($body); // quoted-printable
    return $body;
}
function charset_de($part)
{
    if (!empty($part->parameters)) foreach ($part->parameters as $p) {
        if (strtoupper($p->attribute) === 'CHARSET') return $p->value;
    }
    return 'UTF-8';
}
function conv_cs($txt, $cs)
{
    $cs = strtoupper($cs);
    if ($cs && $cs !== 'UTF-8' && $cs !== 'US-ASCII') {
        $c = @iconv($cs, 'UTF-8//TRANSLIT', $txt);
        if ($c !== false) return $c;
    }
    return $txt;
}
function walk_parts($mbox, $uid, $parts, $prefix, &$html, &$texto, &$anexos)
{
    foreach ($parts as $i => $part) {
        $partno = $prefix ? ($prefix . '.' . ($i + 1)) : (string)($i + 1);
        $subtype = strtoupper(isset($part->subtype) ? $part->subtype : '');
        $nome = '';
        if (!empty($part->dparameters)) foreach ($part->dparameters as $dp) {
            if (strtoupper($dp->attribute) === 'FILENAME') $nome = $dp->value;
        }
        if (!$nome && !empty($part->parameters)) foreach ($part->parameters as $pp) {
            if (strtoupper($pp->attribute) === 'NAME') $nome = $pp->value;
        }
        $isAnexo = (!empty($part->disposition) && strtoupper($part->disposition) === 'ATTACHMENT') || ($nome !== '');
        if ($part->type == 1 && !empty($part->parts)) {
            walk_parts($mbox, $uid, $part->parts, $partno, $html, $texto, $anexos);
        } else if ($isAnexo) {
            $anexos[] = array('nome' => dec_header($nome), 'partno' => $partno, 'tamanho' => isset($part->bytes) ? $part->bytes : 0, 'enc' => isset($part->encoding) ? $part->encoding : 0);
        } else if ($part->type == 0) {
            $body = imap_fetchbody($mbox, $uid, $partno, FT_UID);
            $body = dec_body($body, $part->encoding);
            $body = conv_cs($body, charset_de($part));
            if ($subtype === 'HTML') $html .= $body;
            else $texto .= $body;
        }
    }
}
function fetch_corpo($mbox, $uid)
{
    $st = imap_fetchstructure($mbox, $uid, FT_UID);
    $html = '';
    $texto = '';
    $anexos = array();
    if (empty($st->parts)) {
        $body = imap_fetchbody($mbox, $uid, '1', FT_UID);
        $body = dec_body($body, isset($st->encoding) ? $st->encoding : 0);
        $body = conv_cs($body, charset_de($st));
        if (strtoupper(isset($st->subtype) ? $st->subtype : '') === 'HTML') $html = $body;
        else $texto = $body;
    } else {
        walk_parts($mbox, $uid, $st->parts, '', $html, $texto, $anexos);
    }
    return array('html' => $html, 'texto' => $texto, 'anexos' => $anexos);
}

// ---------- conexão ----------
$ref = '{' . $host . ':' . $porta . '/imap/ssl/novalidate-cert}';

// abre a conta (sempre conecta primeiro, validando login/senha)
$mbox = @imap_open($ref . 'INBOX', $login, $senha, 0, 1);
if (!$mbox) {
    $err = imap_last_error();
    imap_errors();
    echo json_encode(array('ok' => false, 'msg' => 'Não foi possível conectar à caixa. ' . ($err ?: 'Verifique servidor, login e senha.')));
    exit;
}

// resolve a pasta logica (Sent/Trash/Spam) para o nome REAL no servidor
// (na Locaweb costuma ser INBOX.Sent, INBOX.Trash, etc.). INBOX abre direto.
$alvo = strtoupper($pasta);
if ($alvo !== 'INBOX' && $alvo !== '') {
    $low = strtolower($pasta);
    $padroes = array($low);
    if ($low === 'sent' || strpos($low, 'enviad') !== false) $padroes = array('sent', 'enviad');
    elseif ($low === 'trash' || strpos($low, 'lixeira') !== false || strpos($low, 'deleted') !== false) $padroes = array('trash', 'lixeira', 'deleted');
    elseif ($low === 'spam' || strpos($low, 'junk') !== false) $padroes = array('spam', 'junk');
    $lista = @imap_list($mbox, $ref, '*');
    $achou = null;
    if ($lista) foreach ($lista as $l) {
        $nome = str_replace($ref, '', $l);
        $nomeDec = $nome;
        if (function_exists('mb_convert_encoding')) {
            $t = @mb_convert_encoding($nome, 'UTF-8', 'UTF7-IMAP');
            if ($t !== false && $t !== '') $nomeDec = $t;
        }
        $ln = strtolower($nomeDec);
        $bate = false;
        foreach ($padroes as $pad) {
            if (strpos($ln, $pad) !== false) {
                $bate = true;
                break;
            }
        }
        if ($bate) {
            $achou = $nome;
            break;
        }
    }
    if (!$achou) {
        imap_close($mbox);
        echo json_encode(array('ok' => false, 'msg' => 'Não encontrei a pasta "' . $pasta . '" nesta conta de e-mail.'));
        exit;
    }
    @imap_close($mbox);
    $mbox = @imap_open($ref . $achou, $login, $senha, 0, 1);
    if (!$mbox) {
        $err = imap_last_error();
        imap_errors();
        echo json_encode(array('ok' => false, 'msg' => 'Não consegui abrir a pasta "' . $pasta . '". ' . ($err ?: '')));
        exit;
    }
}

if ($acao === 'pastas') {
    $lista = @imap_list($mbox, $ref, '*');
    $pastas = array();
    if ($lista) foreach ($lista as $l) {
        $nome = str_replace($ref, '', $l);
        $nomeDec = $nome;
        if (function_exists('mb_convert_encoding')) {
            $tmp = @mb_convert_encoding($nome, 'UTF-8', 'UTF7-IMAP');
            if ($tmp !== false && $tmp !== '') $nomeDec = $tmp;
        }
        $pastas[] = array('caminho' => $nomeDec, 'nome' => $nomeDec);
    }
    imap_close($mbox);
    echo json_encode(array('ok' => true, 'pastas' => $pastas));
    exit;
}

if ($acao === 'baixar_anexo') {
    $uid = intval(isset($in['uid']) ? $in['uid'] : 0);
    $partno = isset($in['partno']) ? preg_replace('/[^0-9.]/', '', $in['partno']) : '';
    $enc = intval(isset($in['enc']) ? $in['enc'] : 0);
    if (!$uid || $partno === '') {
        imap_close($mbox);
        echo json_encode(array('ok' => false, 'msg' => 'Anexo inválido.'));
        exit;
    }
    $body = imap_fetchbody($mbox, $uid, $partno, FT_UID);
    $body = dec_body($body, $enc);
    imap_close($mbox);
    echo json_encode(array('ok' => true, 'base64' => base64_encode($body)));
    exit;
}

if ($acao === 'ler') {
    $uid = intval(isset($in['uid']) ? $in['uid'] : 0);
    if (!$uid) {
        imap_close($mbox);
        echo json_encode(array('ok' => false, 'msg' => 'Mensagem inválida.'));
        exit;
    }
    $corpo = fetch_corpo($mbox, $uid);
    $h = imap_rfc822_parse_headers(imap_fetchheader($mbox, $uid, FT_UID));
    $de = dec_header(isset($h->fromaddress) ? $h->fromaddress : '');
    $para = dec_header(isset($h->toaddress) ? $h->toaddress : '');
    $assunto = dec_header(isset($h->subject) ? $h->subject : '(sem assunto)');
    $data = isset($h->date) ? date('d/m/Y H:i', strtotime($h->date)) : '';
    @imap_setflag_full($mbox, $uid, "\\Seen", ST_UID);
    imap_close($mbox);
    echo json_encode(array(
        'ok' => true,
        'de' => $de,
        'para' => $para,
        'assunto' => $assunto,
        'data' => $data,
        'html' => $corpo['html'],
        'texto' => $corpo['texto'],
        'anexos' => $corpo['anexos']
    ));
    exit;
}

if ($acao === 'marcar_lida') {
    $uids = isset($in['uids']) ? $in['uids'] : array();
    if (!is_array($uids) || !count($uids)) {
        imap_close($mbox);
        echo json_encode(array('ok' => false, 'msg' => 'Nenhuma mensagem selecionada.'));
        exit;
    }
    $seq = implode(',', array_map('intval', $uids));
    if (!empty($in['nao_lida'])) @imap_clearflag_full($mbox, $seq, "\\Seen", ST_UID);
    else                         @imap_setflag_full($mbox, $seq, "\\Seen", ST_UID);
    imap_close($mbox);
    echo json_encode(array('ok' => true));
    exit;
}

if ($acao === 'excluir') {
    $uids = isset($in['uids']) ? $in['uids'] : array();
    if (!is_array($uids) || !count($uids)) {
        imap_close($mbox);
        echo json_encode(array('ok' => false, 'msg' => 'Nenhuma mensagem selecionada.'));
        exit;
    }
    $seq = implode(',', array_map('intval', $uids));
    // procura a pasta de Lixeira
    $lixeira = null;
    $lista = @imap_list($mbox, $ref, '*');
    if ($lista) foreach ($lista as $l) {
        $nome = str_replace($ref, '', $l);
        $low = strtolower($nome);
        if (strpos($low, 'trash') !== false || strpos($low, 'lixeira') !== false || strpos($low, 'deleted') !== false) {
            $lixeira = $nome;
            break;
        }
    }
    // a pasta atual já é a lixeira? então é exclusão definitiva
    $lowAtual = strtolower($pasta);
    $atualEhLixeira = (strpos($lowAtual, 'trash') !== false || strpos($lowAtual, 'lixeira') !== false || strpos($lowAtual, 'deleted') !== false);
    $movido = false;
    if ($lixeira && !$atualEhLixeira) {
        $movido = @imap_mail_move($mbox, $seq, $lixeira, CP_UID);
    }
    if (!$movido) {
        @imap_delete($mbox, $seq, FT_UID);
    }   // fallback / exclusão definitiva
    @imap_expunge($mbox);
    imap_close($mbox);
    echo json_encode(array('ok' => true, 'movido' => (bool)$movido));
    exit;
}

// acao = listar (padrão) — busca por PERÍODO (últimos N dias OU intervalo de datas) e opcionalmente por REMETENTE
$dias = isset($in['dias']) ? intval($in['dias']) : 60;
$desde_in = isset($in['desde']) ? trim($in['desde']) : '';   // 'YYYY-MM-DD'
$ate_in   = isset($in['ate'])   ? trim($in['ate'])   : '';   // 'YYYY-MM-DD'
$remet    = isset($in['remetente']) ? trim($in['remetente']) : '';
$max = isset($in['max']) ? intval($in['max']) : 500;
if ($max < 1) $max = 500;
if ($max > 1500) $max = 1500;

$criterios = array();
$modo = 'dias';
if ($desde_in !== '' || $ate_in !== '') {
    $modo = 'periodo';
    if ($desde_in !== '') {
        $ts1 = strtotime($desde_in);
        if ($ts1) $criterios[] = 'SINCE "' . date('d-M-Y', $ts1) . '"';
    }
    if ($ate_in !== '') {
        $ts2 = strtotime($ate_in . ' +1 day');
        if ($ts2) $criterios[] = 'BEFORE "' . date('d-M-Y', $ts2) . '"';
    }
} else {
    if ($dias < 1) $dias = 60;
    $criterios[] = 'SINCE "' . date('d-M-Y', strtotime('-' . $dias . ' days')) . '"';
}
if ($remet !== '') {
    $remet_limpo = str_replace(array('"', "\r", "\n"), '', $remet);
    $criterios[] = 'FROM "' . $remet_limpo . '"';
}
$criterioStr = trim(implode(' ', $criterios));
if ($criterioStr === '') $criterioStr = 'ALL';

$total = imap_num_msg($mbox);
$uids = imap_search($mbox, $criterioStr, SE_UID);
if (!$uids) $uids = array();

// GARANTIA ANTI-FUSO: no modo "dias", inclui também os e-mails MAIS RECENTES da caixa
// (pelos últimos números de sequência), para que mensagens de hoje não fiquem de fora
// por diferença de fuso horário ou de interpretação da data interna pelo servidor.
if ($modo === 'dias' && $total > 0) {
    $qtdRec = min(60, $total);
    for ($sq = $total; $sq > $total - $qtdRec && $sq >= 1; $sq--) {
        $u = @imap_uid($mbox, $sq);
        if ($u && !in_array($u, $uids)) $uids[] = $u;
    }
}
// limite inferior do período (com 1 dia de margem p/ fuso) — descarta recentes fora do período
$limiteInf = 0;
if ($modo === 'dias') {
    $limiteInf = strtotime(date('Y-m-d', strtotime('-' . ($dias + 1) . ' days')) . ' 00:00:00');
}

$encontrados = count($uids);
$truncado = false;
if ($encontrados > $max) {
    rsort($uids);
    $uids = array_slice($uids, 0, $max);
    $truncado = true;
}
$msgs = array();
$maisRecente = '';
if (!empty($uids)) {
    $seq = implode(',', $uids);
    $ov = imap_fetch_overview($mbox, $seq, FT_UID);
    if ($ov) foreach ($ov as $m) {
        $ts = (isset($m->date) && $m->date) ? strtotime($m->date) : 0;
        if ($modo === 'dias' && $limiteInf && $ts && $ts < $limiteInf) continue; // descarta antigos vindos da garantia
        $msgs[] = array(
            'uid'     => isset($m->uid) ? $m->uid : 0,
            'de'      => dec_header(isset($m->from) ? $m->from : ''),
            'assunto' => dec_header(isset($m->subject) ? $m->subject : '(sem assunto)'),
            'data'    => $ts ? date('d/m H:i', $ts) : '',
            'data_completa' => $ts ? date('d/m/Y H:i', $ts) : '',
            'lido'    => isset($m->seen) ? (bool)$m->seen : true,
            '_ts'     => $ts
        );
    }
    usort($msgs, function ($a, $b) {
        return $b['_ts'] <=> $a['_ts'];
    });  // mais recente primeiro
    if (count($msgs) && $msgs[0]['_ts']) $maisRecente = date('d/m/Y H:i', $msgs[0]['_ts']);
    foreach ($msgs as &$mm) {
        unset($mm['_ts']);
    }
    unset($mm);
}
imap_close($mbox);
echo json_encode(array('ok' => true, 'total' => $total, 'encontrados' => count($msgs), 'dias' => $dias, 'modo' => $modo, 'criterio' => $criterioStr, 'truncado' => $truncado, 'server_time' => date('d/m/Y H:i:s'), 'mais_recente' => $maisRecente, 'mensagens' => $msgs));
