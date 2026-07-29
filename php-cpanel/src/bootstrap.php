<?php
declare(strict_types=1);

if (!is_file(dirname(__DIR__) . '/config.php')) {
    http_response_code(503);
    exit('Berel Commerce requiere configuración. Copia config.example.php como config.php.');
}

$config = require dirname(__DIR__) . '/config.php';

ini_set('display_errors', '0');
ini_set('log_errors', '1');

// Este Apache no trae mod_deflate, así que la respuesta de PHP se comprime
// desde PHP. Importa sobre todo para /api/storefront: son 272 KB de catálogo
// que la tienda pide en cada carga y que bajan a una fracción comprimidos.
// Va antes de cualquier salida; si zlib no está, la línea simplemente no surte
// efecto y todo sigue igual.
if (!headers_sent() && extension_loaded('zlib')) {
    ini_set('zlib.output_compression', '1');
    ini_set('zlib.output_compression_level', '6');
}
date_default_timezone_set('America/Mexico_City');

session_name((string)($config['security']['session_name'] ?? 'berel_admin'));
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/emails.php';
require_once __DIR__ . '/Database.php';
require_once __DIR__ . '/Auth.php';
require_once __DIR__ . '/Resources.php';

$db = Database::connect($config['db']);
