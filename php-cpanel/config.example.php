<?php
declare(strict_types=1);

return [
    'app_url' => 'https://berel.inedito.digital',
    'db' => [
        'host' => 'localhost',
        'port' => 3306,
        'name' => 'CPANEL_DATABASE',
        'user' => 'CPANEL_DATABASE_USER',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'security' => [
        'session_name' => 'berel_admin',
        'admin_user' => 'berel',
        // Genera uno con: password_hash('TU_PASSWORD', PASSWORD_DEFAULT)
        'admin_password_hash' => 'CHANGE_ME',
    ],
    'payments' => [
        'mercadopago_access_token' => '',
    ],
    'mail' => [
        'from' => 'pedidos@berel.inedito.digital',
        'admin' => 'ineditodigital@gmail.com',
    ],
    'uploads' => [
        'directory' => __DIR__ . '/uploads',
        'max_bytes' => 15_000_000,
    ],
];
