<?php
declare(strict_types=1);

/**
 * Correos transaccionales de pedidos con la identidad de la tienda.
 *
 * Maquetado con tablas y estilos en linea porque los clientes de correo no
 * soportan CSS moderno. Sin emojis: el tono de la marca es sobrio.
 */

const MAIL_ROJO  = '#e5252a';
const MAIL_TINTA = '#171717';
const MAIL_SUAVE = '#6b7280';
const MAIL_LINEA = '#e8e8e8';
const MAIL_FONDO = '#f5f6f8';

function order_email_rows(array $lines): string
{
    $filas = '';
    foreach ($lines as $l) {
        $filas .= '<tr>'
            . '<td style="padding:14px 0;border-bottom:1px solid ' . MAIL_LINEA . ';font-size:15px;color:' . MAIL_TINTA . ';">'
            . e((string)$l['name'])
            . '<div style="color:' . MAIL_SUAVE . ';font-size:13px;margin-top:3px;">Cantidad: ' . (int)$l['quantity'] . '</div>'
            . '</td>'
            . '<td align="right" style="padding:14px 0;border-bottom:1px solid ' . MAIL_LINEA . ';font-size:15px;font-weight:700;color:' . MAIL_TINTA . ';white-space:nowrap;">'
            . money((int)$l['line_total'])
            . '</td></tr>';
    }
    return $filas;
}

function order_email_delivery(array $d): array
{
    if (($d['fulfillment'] ?? '') === 'pickup') {
        $texto = $d['branch']
            ? e((string)$d['branch']['name']) . '<br>' . e((string)$d['branch']['address'])
            : 'Te confirmaremos la sucursal por este medio.';
        $texto .= '<br><br>Te avisamos en cuanto tu pedido esté listo para recoger.';
        return ['Retiro en sucursal', $texto];
    }

    $dir = is_array($d['address'] ?? null) ? $d['address'] : [];
    $partes = array_values(array_filter([
        trim((string)($dir['street'] ?? '')),
        trim((string)($dir['neighborhood'] ?? '')),
        trim(((string)($dir['postalCode'] ?? '')) . ' ' . ((string)($dir['city'] ?? ''))),
    ], static fn($v) => $v !== ''));

    $texto = $partes
        ? implode('<br>', array_map('e', $partes))
        : 'Dirección registrada en tu pedido.';
    $texto .= '<br><br>Entregamos en un máximo de ' . (int)($d['promiseHours'] ?? 24)
        . ' horas después de confirmar el pago.';

    return ['Envío a domicilio', $texto];
}

function order_email_customer_block(array $d): string
{
    if (empty($d['forAdmin'])) {
        return '';
    }
    $tel = preg_replace('/[^0-9+]/', '', (string)$d['customerPhone']);
    return '<tr><td style="padding:0 32px 8px;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:' . MAIL_FONDO . ';border-radius:10px;">'
        . '<tr><td style="padding:18px 20px;font-size:14px;color:' . MAIL_TINTA . ';line-height:1.7;">'
        . '<strong style="display:block;margin-bottom:6px;">Cliente</strong>'
        . e((string)$d['customerName']) . '<br>'
        . '<a href="mailto:' . e((string)$d['customerEmail']) . '" style="color:' . MAIL_ROJO . ';text-decoration:none;">' . e((string)$d['customerEmail']) . '</a><br>'
        . '<a href="tel:' . e((string)$tel) . '" style="color:' . MAIL_ROJO . ';text-decoration:none;">' . e((string)$d['customerPhone']) . '</a>'
        . (trim((string)($d['notes'] ?? '')) !== ''
            ? '<br><br><strong>Notas del pedido</strong><br>' . e((string)$d['notes'])
            : '')
        . '</td></tr></table></td></tr>';
}

function render_order_email(array $d): string
{
    [$entregaTitulo, $entregaTexto] = order_email_delivery($d);
    $paraAdmin = !empty($d['forAdmin']);

    $encabezado = $paraAdmin ? 'Nueva venta en la tienda en línea' : 'Recibimos tu pedido';
    $bajada = $paraAdmin
        ? 'Se registró un pedido nuevo. Los datos de contacto del cliente están abajo.'
        : 'Gracias por tu compra. Este es el resumen de tu pedido.';
    $cierre = $paraAdmin
        ? 'Puedes dar seguimiento al pedido desde el panel de administración de la tienda.'
        : 'Si necesitas ayuda con tu pedido, responde este correo y te atendemos.';

    return '<!doctype html><html lang="es"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . e($encabezado) . '</title></head>'
        . '<body style="margin:0;padding:24px 12px;background:' . MAIL_FONDO . ';'
        . 'font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif;">'
        . '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'
        . '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;">'

        // Cabecera de marca
        . '<tr><td style="background:' . MAIL_ROJO . ';padding:26px 32px;">'
        . '<span style="color:#ffffff;font-size:13px;letter-spacing:2px;font-weight:700;text-transform:uppercase;">Berel México</span>'
        . '</td></tr>'

        . '<tr><td style="padding:32px 32px 10px;">'
        . '<h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:' . MAIL_TINTA . ';font-weight:800;">' . e($encabezado) . '</h1>'
        . '<p style="margin:0;font-size:15px;color:' . MAIL_SUAVE . ';line-height:1.6;">' . e($bajada) . '</p>'
        . '</td></tr>'

        // Número de pedido
        . '<tr><td style="padding:20px 32px 4px;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ' . MAIL_LINEA . ';border-radius:10px;">'
        . '<tr><td style="padding:16px 20px;">'
        . '<span style="font-size:12px;color:' . MAIL_SUAVE . ';text-transform:uppercase;letter-spacing:1px;">Número de pedido</span>'
        . '<div style="font-size:20px;font-weight:800;color:' . MAIL_TINTA . ';margin-top:4px;">' . e((string)$d['orderNumber']) . '</div>'
        . '</td></tr></table></td></tr>'

        . order_email_customer_block($d)

        // Productos
        . '<tr><td style="padding:18px 32px 0;">'
        . '<span style="font-size:12px;color:' . MAIL_SUAVE . ';text-transform:uppercase;letter-spacing:1px;">Productos</span>'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px;">'
        . order_email_rows($d['lines'])
        . '<tr><td style="padding:16px 0 0;font-size:16px;font-weight:800;color:' . MAIL_TINTA . ';">Total</td>'
        . '<td align="right" style="padding:16px 0 0;font-size:20px;font-weight:800;color:' . MAIL_ROJO . ';">' . money((int)$d['subtotal']) . ' MXN</td>'
        . '</tr></table></td></tr>'

        // Entrega
        . '<tr><td style="padding:22px 32px 0;">'
        . '<table width="100%" cellpadding="0" cellspacing="0" style="background:' . MAIL_FONDO . ';border-radius:10px;">'
        . '<tr><td style="padding:18px 20px;">'
        . '<strong style="font-size:15px;color:' . MAIL_TINTA . ';display:block;margin-bottom:6px;">' . $entregaTitulo . '</strong>'
        . '<span style="font-size:14px;color:' . MAIL_SUAVE . ';line-height:1.7;">' . $entregaTexto . '</span>'
        . '</td></tr></table></td></tr>'

        // Pie
        . '<tr><td style="padding:26px 32px 32px;">'
        . '<div style="border-top:1px solid ' . MAIL_LINEA . ';padding-top:18px;">'
        . '<p style="margin:0;font-size:13px;color:' . MAIL_SUAVE . ';line-height:1.7;">' . e($cierre) . '</p>'
        . '<p style="margin:14px 0 0;font-size:12px;color:#9aa0a6;">Berel México · Aguascalientes</p>'
        . '</div></td></tr>'

        . '</table></td></tr></table></body></html>';
}

/**
 * Version en texto plano. Se envia junto al HTML: mejora la entregabilidad y
 * cubre a los clientes que no muestran HTML.
 */
function render_order_email_text(array $d): string
{
    [$entregaTitulo] = order_email_delivery($d);
    $lineas = [
        !empty($d['forAdmin']) ? 'Nueva venta en la tienda en línea' : 'Recibimos tu pedido',
        '',
        'Pedido: ' . $d['orderNumber'],
        '',
    ];
    if (!empty($d['forAdmin'])) {
        $lineas[] = 'Cliente: ' . $d['customerName'];
        $lineas[] = 'Correo: ' . $d['customerEmail'];
        $lineas[] = 'Teléfono: ' . $d['customerPhone'];
        $lineas[] = '';
    }
    $lineas[] = 'Productos:';
    foreach ($d['lines'] as $l) {
        $lineas[] = '  ' . (int)$l['quantity'] . ' x ' . $l['name'] . '  ' . money((int)$l['line_total']);
    }
    $lineas[] = '';
    $lineas[] = 'Total: ' . money((int)$d['subtotal']) . ' MXN';
    $lineas[] = '';
    $lineas[] = $entregaTitulo;
    $lineas[] = '';
    $lineas[] = 'Berel México - Aguascalientes';

    return implode("\n", $lineas);
}

/**
 * Envia un correo multiparte (texto + HTML) con cabeceras que ayudan a no
 * caer en spam: remitente del propio dominio y Reply-To util.
 */
function send_order_mail(string $para, string $asunto, array $datos, array $config): bool
{
    if (trim($para) === '') {
        return false;
    }
    $de = (string)($config['mail']['from'] ?? 'pedidos@berel.inedito.digital');
    $frontera = 'berel-' . bin2hex(random_bytes(12));

    $cabeceras = implode("\r\n", [
        'From: Berel México <' . $de . '>',
        'Reply-To: ' . $de,
        'MIME-Version: 1.0',
        'Content-Type: multipart/alternative; boundary="' . $frontera . '"',
        'X-Mailer: Berel Commerce',
    ]);

    $cuerpo = "--$frontera\r\n"
        . "Content-Type: text/plain; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . render_order_email_text($datos) . "\r\n\r\n"
        . "--$frontera\r\n"
        . "Content-Type: text/html; charset=UTF-8\r\n"
        . "Content-Transfer-Encoding: 8bit\r\n\r\n"
        . render_order_email($datos) . "\r\n\r\n"
        . "--$frontera--";

    $asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';
    return @mail($para, $asuntoCodificado, $cuerpo, $cabeceras, '-f' . $de);
}
