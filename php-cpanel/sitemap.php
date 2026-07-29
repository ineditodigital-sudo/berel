<?php
declare(strict_types=1);

/**
 * Sitemap generado desde la base, no un archivo fijo.
 *
 * El catálogo se administra desde el CMS: una categoría o un producto que se
 * publique hoy tiene que aparecer en el sitemap sin volver a exportar el sitio.
 * Un sitemap.xml estático quedaría desactualizado en cuanto alguien agregue un
 * producto, que es justo lo que este proyecto evita en todo lo demás.
 */

require __DIR__ . '/src/bootstrap.php';

header('Content-Type: application/xml; charset=utf-8');
header('Cache-Control: public, max-age=3600');

$host = (string)($_SERVER['HTTP_HOST'] ?? 'berel.inedito.digital');
$base = 'https://' . $host;

// Solo rutas con contenido indexable. Checkout, cuenta y la confirmación de
// pedido quedan fuera a propósito: no aportan nada a un buscador y algunas
// dependen de datos de la sesión.
$rutas = [
    ['/', 'daily', '1.0'],
    ['/tienda/todos', 'daily', '0.9'],
    ['/nosotros', 'monthly', '0.4'],
    ['/privacidad', 'yearly', '0.2'],
    ['/terminos', 'yearly', '0.2'],
];

foreach ($db->query('SELECT slug FROM categories WHERE is_active=1 ORDER BY sort_order,name') as $c) {
    $rutas[] = ['/tienda/' . $c['slug'], 'weekly', '0.8'];
}
foreach ($db->query('SELECT slug FROM products WHERE is_active=1 ORDER BY name') as $p) {
    $rutas[] = ['/producto/' . $p['slug'], 'weekly', '0.7'];
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($rutas as [$loc, $freq, $prioridad]) {
    echo '  <url>'
        . '<loc>' . htmlspecialchars($base . $loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>'
        . '<changefreq>' . $freq . '</changefreq>'
        . '<priority>' . $prioridad . '</priority>'
        . '</url>' . "\n";
}
echo '</urlset>' . "\n";
