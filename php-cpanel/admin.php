<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$loginError = '';
if (isset($_GET['logout'])) {
    Auth::logout();
    redirect('/admin');
}
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login'])) {
    if (Auth::attempt($config, (string)($_POST['email'] ?? ''), (string)($_POST['password'] ?? ''))) {
        redirect('/admin');
    }
    $loginError = 'El correo o la contraseña no son correctos.';
}

if (!Auth::check()):
?>
<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Acceso al CMS | Berel</title><link rel="stylesheet" href="/assets/app.css">
</head><body class="login-page">
<main class="login-card">
  <img src="/assets/img/berel-icono.png" alt="Berel">
  <p class="eyebrow">BEREL COMMERCE</p><h1>Bienvenido de nuevo</h1><p>Administra productos, pedidos y contenido desde cualquier dispositivo.</p>
  <?php if ($loginError): ?><div class="notice error"><?=$loginError?></div><?php endif; ?>
  <form method="post">
    <label>Usuario<input type="text" name="email" autocomplete="username" autocapitalize="none" required></label>
    <label>Contraseña<input type="password" name="password" autocomplete="current-password" required></label>
    <button class="button primary" name="login" value="1">Entrar al CMS</button>
  </form>
  <a href="/">Volver a la tienda</a>
</main></body></html>
<?php exit; endif;

$csrf = Auth::csrf();
$resourceMap = Resources::publicMap();

$reactAdminPath = __DIR__ . '/admin-app.html';
if (is_file($reactAdminPath)) {
    $reactAdmin = file_get_contents($reactAdminPath);
    if ($reactAdmin !== false) {
        $bootstrap = '<script>window.BEREL_PHP_CSRF='
            . json_encode($csrf, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
            . ';</script>';
        echo str_replace('</head>', $bootstrap . '</head>', $reactAdmin);
        exit;
    }
}
?>
<!doctype html><html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Berel Commerce — Administración</title>
<link rel="stylesheet" href="/assets/app.css">
</head>
<body class="cms-page">
<div class="cms-shell">
  <aside class="cms-sidebar" id="sidebar">
    <header><img src="/assets/img/berel-icono.png" alt="Berel"><div><b>Berel Commerce</b><span>Administración</span></div><button class="icon-button mobile-only" data-close-menu aria-label="Cerrar menú">×</button></header>
    <nav aria-label="Módulos del CMS">
      <small>MENÚ PRINCIPAL</small>
      <?php
      $icons=['products'=>'cube','categories'=>'grid','orders'=>'bag','pages'=>'page','content'=>'edit','slides'=>'image','media'=>'gallery','faqs'=>'help','branches'=>'store','settings'=>'settings'];
      foreach ($resourceMap as $key=>$resource):
      ?>
      <button data-resource="<?=e($key)?>" class="<?=$key==='products'?'active':''?>"><span class="nav-icon" aria-hidden="true"><?=e($icons[$key] ?? 'dot')?></span><span><?=e($resource['label'])?></span><i>›</i></button>
      <?php endforeach; ?>
    </nav>
    <?php $sessionUser = (string)($_SESSION['admin']['username'] ?? $_SESSION['admin']['email'] ?? 'Admin'); ?>
    <footer><span><?=strtoupper(substr($sessionUser,0,1))?></span><div><b><?=e($sessionUser)?></b><a href="/admin?logout=1">Cerrar sesión</a></div></footer>
  </aside>
  <div class="cms-overlay" data-close-menu></div>
  <main class="cms-workspace">
    <header class="cms-topbar">
      <button class="icon-button menu-button" data-open-menu aria-label="Abrir menú">☰</button>
      <div><p class="eyebrow" id="module-eyebrow">CATÁLOGO</p><h1 id="module-title">Productos</h1><span id="module-description">Organiza productos, precios, existencias e imágenes.</span></div>
      <a class="button secondary" href="/" target="_blank">Ver tienda</a>
    </header>
    <section class="cms-toolbar">
      <label class="search-field"><span>⌕</span><input id="search" type="search" placeholder="Buscar…"></label>
      <label class="button secondary upload-button" id="upload-action" hidden>Subir archivo<input type="file"></label>
      <button class="button primary" id="new-action">+ Nuevo</button>
    </section>
    <div class="notice" id="cms-notice" role="status" hidden></div>
    <section class="resource-grid" id="resource-grid" aria-live="polite"></section>
  </main>
</div>
<dialog class="editor-dialog" id="editor">
  <form method="dialog" id="editor-form">
    <header><div><p class="eyebrow" id="editor-eyebrow">EDITAR</p><h2 id="editor-title">Elemento</h2><span>Completa la información y guarda los cambios.</span></div><button class="icon-button" value="cancel" aria-label="Cerrar">×</button></header>
    <section class="editor-fields" id="editor-fields"></section>
    <footer><button class="button secondary" value="cancel">Cancelar</button><button class="button primary" type="submit" value="default">Guardar cambios</button></footer>
  </form>
</dialog>
<script>
window.BEREL_CMS={
  csrf:<?=json_encode($csrf)?>,
  resources:<?=json_encode($resourceMap,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES)?>
};
</script>
<script src="/assets/admin.js" defer></script>
</body></html>
