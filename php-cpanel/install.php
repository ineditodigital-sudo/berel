<?php
declare(strict_types=1);

$root = __DIR__;
$configFile = $root . '/config.php';
$locked = is_file($root . '/.installed');
$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$locked) {
    try {
        $data = [
            'app_url' => rtrim((string)($_POST['app_url'] ?? ''), '/'),
            'db' => [
                'host' => trim((string)($_POST['db_host'] ?? 'localhost')),
                'port' => 3306,
                'name' => trim((string)($_POST['db_name'] ?? '')),
                'user' => trim((string)($_POST['db_user'] ?? '')),
                'pass' => (string)($_POST['db_pass'] ?? ''),
                'charset' => 'utf8mb4',
            ],
            'security' => [
                'session_name' => 'berel_admin',
                'admin_user' => mb_strtolower(trim((string)($_POST['admin_user'] ?? ''))),
                'admin_password_hash' => password_hash((string)($_POST['admin_password'] ?? ''), PASSWORD_DEFAULT),
            ],
            'payments' => ['mercadopago_access_token' => ''],
            'mail' => [
                'from' => trim((string)($_POST['mail_from'] ?? 'pedidos@berel.inedito.digital')),
                'admin' => mb_strtolower(trim((string)($_POST['admin_email'] ?? ''))),
            ],
            'uploads' => ['directory' => $root . '/uploads', 'max_bytes' => 15000000],
        ];
        if (!$data['db']['name'] || !$data['db']['user'] || strlen((string)($_POST['admin_password'] ?? '')) < 10) {
            throw new RuntimeException('Completa la base de datos y usa una contraseña de al menos 10 caracteres.');
        }
        require_once $root . '/src/Database.php';
        $pdo = Database::connect($data['db']);
        $sql = (string)file_get_contents($root . '/schema.sql');
        $pdo->exec($sql);
        $content = "<?php\ndeclare(strict_types=1);\n\nreturn " . var_export($data, true) . ";\n";
        if (file_put_contents($configFile, $content, LOCK_EX) === false) {
            throw new RuntimeException('No se pudo escribir config.php. Revisa permisos.');
        }
        file_put_contents($root . '/.installed', date(DATE_ATOM), LOCK_EX);
        $message = 'Instalación terminada. El CMS ya está listo.';
        $locked = true;
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}
?>
<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Instalar Berel Commerce</title><link rel="stylesheet" href="/assets/app.css">
</head>
<body class="installer-page">
<main class="installer-card">
  <img src="/assets/img/berel-icono.png" alt="Berel">
  <p class="eyebrow">CONFIGURACIÓN SEGURA</p><h1>Instalar Berel Commerce</h1>
  <?php if ($message): ?><div class="notice success"><?=htmlspecialchars($message)?></div><a class="button primary" href="/admin">Abrir CMS</a>
  <?php elseif ($locked): ?><div class="notice">La instalación ya fue completada.</div><a class="button primary" href="/admin">Abrir CMS</a>
  <?php else: ?>
    <?php if ($error): ?><div class="notice error"><?=htmlspecialchars($error)?></div><?php endif; ?>
    <form method="post" autocomplete="off">
      <h2>Dominio</h2><label>URL del sitio<input name="app_url" value="https://berel.inedito.digital" required></label>
      <h2>Base de datos MySQL</h2>
      <div class="form-grid"><label>Servidor<input name="db_host" value="localhost" required></label><label>Nombre<input name="db_name" required></label><label>Usuario<input name="db_user" required></label><label>Contraseña<input type="password" name="db_pass"></label></div>
      <h2>Administrador</h2>
      <label>Usuario del CMS<input name="admin_user" value="berel" required></label>
      <label>Contraseña del CMS<input type="password" name="admin_password" minlength="10" required></label>
      <label>Correo del administrador<input type="email" name="admin_email" value="ineditodigital@gmail.com" required></label>
      <label>Correo remitente<input type="email" name="mail_from" value="pedidos@berel.inedito.digital" required></label>
      <button class="button primary" type="submit">Crear tienda y CMS</button>
    </form>
  <?php endif; ?>
</main>
</body></html>
