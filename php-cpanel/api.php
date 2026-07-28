<?php
declare(strict_types=1);

require __DIR__ . '/src/bootstrap.php';

$route = trim((string)($_GET['route'] ?? ''), '/');
$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));

try {
    if ($route === 'storefront' && $method === 'GET') {
        $products = $db->query("SELECT p.*,c.name category_name,c.slug category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.is_active=1 ORDER BY p.is_featured DESC,p.name")->fetchAll();
        $categories = $db->query("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order,name")->fetchAll();
        $slides = $db->query("SELECT * FROM carousel_slides WHERE is_active=1 ORDER BY sort_order")->fetchAll();
        $branches = $db->query("SELECT * FROM branches WHERE is_active=1 ORDER BY name")->fetchAll();
        $faqs = $db->query("SELECT * FROM faqs WHERE is_active=1 ORDER BY sort_order")->fetchAll();
        $blocks = $db->query("SELECT b.*,p.slug page_slug FROM content_blocks b JOIN pages p ON p.id=b.page_id WHERE b.is_active=1 ORDER BY p.slug,b.sort_order")->fetchAll();
        $settings = [];
        foreach ($db->query("SELECT `key`,value_json FROM site_settings")->fetchAll() as $row) {
            $settings[$row['key']] = json_decode((string)$row['value_json'], true) ?: [];
        }
        json_response(compact('products', 'categories', 'slides', 'branches', 'faqs', 'blocks', 'settings'));
    }

    if ($route === 'orders' && $method === 'POST') {
        create_order($db, $config, json_input());
    }

    if ($route === 'payments/mercadopago' && $method === 'POST') {
        mercado_pago_webhook($db, $config);
    }

    if (!str_starts_with($route, 'admin/')) {
        json_response(['error' => 'Ruta no encontrada.'], 404);
    }

    Auth::requireApi();
    $parts = array_values(array_filter(explode('/', substr($route, 6)), 'strlen'));

    if (($parts[0] ?? '') === 'meta' && $method === 'GET') {
        json_response(['resources' => Resources::publicMap(), 'csrf' => Auth::csrf()]);
    }
    if (($parts[0] ?? '') === 'import-products' && $method === 'POST') {
        import_products($db);
    }
    if (($parts[0] ?? '') === 'media-upload' && $method === 'POST') {
        upload_media($db, $config);
    }

    $resourceName = (string)($parts[0] ?? '');
    $resource = Resources::get($resourceName);
    if (!$resource) json_response(['error' => 'Módulo no válido.'], 404);
    $id = (string)($parts[1] ?? '');
    $primary = (string)($resource['primary'] ?? 'id');
    $table = (string)$resource['table'];

    if ($method === 'GET' && !$id) {
        $sql = "SELECT * FROM `$table` ORDER BY {$resource['order']} LIMIT 1000";
        json_response(['items' => $db->query($sql)->fetchAll()]);
    }
    if ($method === 'POST' && !$id) {
        if (in_array($resourceName, ['orders', 'media', 'settings'], true)) {
            json_response(['error' => 'Este elemento se crea desde su flujo específico.'], 405);
        }
        $payload = normalize_payload($resource, json_input());
        $payload['id'] = uid(substr($resourceName, 0, 4) . '-');
        $columns = array_keys($payload);
        $marks = implode(',', array_fill(0, count($columns), '?'));
        $db->prepare("INSERT INTO `$table` (`" . implode('`,`', $columns) . "`) VALUES ($marks)")->execute(array_values($payload));
        json_response(['id' => $payload['id']], 201);
    }
    if (in_array($method, ['PATCH', 'PUT'], true) && $id) {
        $payload = normalize_payload($resource, json_input());
        if (!$payload) json_response(['error' => 'No hay cambios válidos.'], 422);
        $sets = implode(',', array_map(static fn(string $column) => "`$column`=?", array_keys($payload)));
        $stmt = $db->prepare("UPDATE `$table` SET $sets WHERE `$primary`=?");
        $stmt->execute([...array_values($payload), $id]);
        json_response(['ok' => true]);
    }
    if ($method === 'DELETE' && $id) {
        if ($resourceName === 'media') {
            $stmt = $db->prepare('SELECT object_key FROM media WHERE id=?');
            $stmt->execute([$id]);
            $key = $stmt->fetchColumn();
            if ($key) @unlink(__DIR__ . '/uploads/' . basename((string)$key));
        }
        $db->prepare("DELETE FROM `$table` WHERE `$primary`=?")->execute([$id]);
        json_response(['ok' => true]);
    }
    json_response(['error' => 'Operación no permitida.'], 405);
} catch (PDOException $exception) {
    error_log($exception->__toString());
    json_response(['error' => 'No se pudo completar la operación en la base de datos.'], 500);
} catch (Throwable $exception) {
    error_log($exception->__toString());
    json_response(['error' => $exception->getMessage() ?: 'Ocurrió un error inesperado.'], 500);
}

function normalize_payload(array $resource, array $input): array
{
    $result = [];
    foreach ($resource['fields'] as $field) {
        if (!array_key_exists($field, $input)) continue;
        $value = $input[$field];
        if (str_starts_with($field, 'is_')) $value = $value ? 1 : 0;
        if (in_array($field, ['price_cents','compare_at_cents','stock','sort_order'], true)) {
            $value = $value === '' || $value === null ? null : (int)$value;
        }
        if (str_ends_with($field, '_json')) {
            if (is_array($value)) $value = json_encode($value, JSON_UNESCAPED_UNICODE);
            json_decode((string)$value, true, 512, JSON_THROW_ON_ERROR);
        }
        $result[$field] = $value;
    }
    if (isset($result['name']) && empty($result['slug']) && in_array('slug', $resource['fields'], true)) {
        $result['slug'] = slugify((string)$result['name']);
    }
    return $result;
}

function import_products(PDO $db): never
{
    if (empty($_FILES['file']['tmp_name']) || (int)$_FILES['file']['size'] > 5_000_000) {
        json_response(['error' => 'Selecciona un CSV de hasta 5 MB.'], 422);
    }
    $handle = fopen((string)$_FILES['file']['tmp_name'], 'rb');
    if (!$handle) json_response(['error' => 'No se pudo leer el CSV.'], 422);
    $headers = fgetcsv($handle);
    if (!$headers) json_response(['error' => 'El CSV está vacío.'], 422);
    $headers = array_map(static fn($h) => str_replace('-', '_', slugify((string)$h)), $headers);
    $aliases = ['nombre'=>'name','categoria'=>'category','precio'=>'price','existencia'=>'stock','imagen'=>'image_url','descripcion'=>'description','ficha_tecnica'=>'technical_sheet_url'];
    $headers = array_map(static fn($h) => $aliases[$h] ?? $h, $headers);
    if (!in_array('name', $headers, true)) json_response(['error' => 'El CSV debe incluir nombre o name.'], 422);
    $categories = [];
    foreach ($db->query('SELECT id,name,slug FROM categories')->fetchAll() as $category) {
        $categories[mb_strtolower($category['name'])] = $category['id'];
        $categories[mb_strtolower($category['slug'])] = $category['id'];
    }
    $created = 0; $updated = 0; $errors = []; $line = 1;
    while (($values = fgetcsv($handle)) !== false) {
        $line++;
        $raw = array_combine($headers, array_pad($values, count($headers), '')) ?: [];
        $name = trim((string)($raw['name'] ?? ''));
        if (!$name) { $errors[] = "Fila $line: nombre vacío."; continue; }
        $slug = slugify((string)($raw['slug'] ?? $name));
        $sku = trim((string)($raw['sku'] ?? ''));
        $categoryKey = mb_strtolower(trim((string)($raw['category'] ?? 'sin-categorizar')));
        $categoryId = $categories[$categoryKey] ?? $categories[slugify($categoryKey)] ?? 'cat-uncategorized';
        $price = (float)preg_replace('/[^0-9.]/', '', (string)($raw['price'] ?? '0'));
        $priceCents = (int)round($price * 100);
        $find = $db->prepare("SELECT id FROM products WHERE (sku<>'' AND sku=?) OR slug=? LIMIT 1");
        $find->execute([$sku, $slug]);
        $existing = $find->fetchColumn();
        $payload = [$sku,$name,$slug,$categoryId,(string)($raw['short_description'] ?? ''),(string)($raw['description'] ?? ''),$priceCents,(int)($raw['stock'] ?? 0),(string)($raw['image_url'] ?? ''),(string)($raw['technical_sheet_url'] ?? '')];
        if ($existing) {
            $db->prepare('UPDATE products SET sku=?,name=?,slug=?,category_id=?,short_description=?,description=?,price_cents=?,stock=?,image_url=?,technical_sheet_url=? WHERE id=?')->execute([...$payload,$existing]);
            $updated++;
        } else {
            $db->prepare('INSERT INTO products(id,sku,name,slug,category_id,short_description,description,price_cents,stock,image_url,technical_sheet_url,gallery_json,benefits_json,uses,whatsapp_message) VALUES(?,?,?,?,?,?,?,?,?,?,?,"[]","[]","","")')->execute([uid('prod-'),...$payload]);
            $created++;
        }
    }
    fclose($handle);
    json_response(['created' => $created, 'updated' => $updated, 'errors' => array_slice($errors, 0, 30)]);
}

function upload_media(PDO $db, array $config): never
{
    $allowed = ['image/jpeg'=>'jpg','image/png'=>'png','image/webp'=>'webp','image/avif'=>'avif','application/pdf'=>'pdf'];
    $file = $_FILES['file'] ?? null;
    if (!$file || !is_uploaded_file((string)$file['tmp_name'])) json_response(['error' => 'Selecciona un archivo.'], 422);
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file((string)$file['tmp_name']);
    if (!isset($allowed[$mime]) || (int)$file['size'] > (int)$config['uploads']['max_bytes']) {
        json_response(['error' => 'Sube JPG, PNG, WebP, AVIF o PDF de hasta 15 MB.'], 422);
    }
    $key = date('Ymd') . '-' . uid() . '.' . $allowed[$mime];
    $directory = (string)$config['uploads']['directory'];
    if (!is_dir($directory)) mkdir($directory, 0755, true);
    if (!move_uploaded_file((string)$file['tmp_name'], $directory . '/' . $key)) {
        json_response(['error' => 'No se pudo guardar el archivo.'], 500);
    }
    $id = uid('media-'); $url = '/uploads/' . $key;
    $db->prepare('INSERT INTO media(id,name,object_key,url,mime_type,size,alt_text) VALUES(?,?,?,?,?,?,?)')->execute([$id,basename((string)$file['name']),$key,$url,$mime,(int)$file['size'],trim((string)($_POST['alt_text'] ?? ''))]);
    json_response(['id'=>$id,'url'=>$url,'name'=>basename((string)$file['name'])], 201);
}

function create_order(PDO $db, array $config, array $payload): never
{
    $name = trim((string)($payload['customerName'] ?? ''));
    $email = filter_var($payload['customerEmail'] ?? '', FILTER_VALIDATE_EMAIL);
    $phone = trim((string)($payload['customerPhone'] ?? ''));
    $items = is_array($payload['items'] ?? null) ? $payload['items'] : [];
    $fulfillment = (string)($payload['fulfillmentType'] ?? '');
    if (!$name || !$email || !$phone || !$items || !in_array($fulfillment, ['delivery','pickup'], true)) {
        json_response(['error' => 'Completa tus datos, entrega y productos.'], 422);
    }
    $commerce = setting($db, 'commerce', ['minimumOrderCents'=>80000,'deliveryState'=>'Aguascalientes']);
    if ($fulfillment === 'delivery' && mb_strtolower((string)($payload['address']['state'] ?? '')) !== mb_strtolower((string)$commerce['deliveryState'])) {
        json_response(['error' => 'Por ahora solo entregamos dentro de Aguascalientes.'], 422);
    }
    $lines = []; $subtotal = 0;
    foreach ($items as $item) {
        $stmt = $db->prepare('SELECT id,sku,name,slug,price_cents,stock FROM products WHERE slug=? AND is_active=1');
        $stmt->execute([(string)($item['slug'] ?? '')]); $product = $stmt->fetch();
        $qty = max(1, (int)($item['quantity'] ?? 1));
        if (!$product || (int)$product['stock'] < $qty) json_response(['error'=>'Uno de los productos no tiene existencia suficiente.'], 409);
        $product['quantity']=$qty; $product['line_total']=(int)$product['price_cents']*$qty; $subtotal += $product['line_total']; $lines[]=$product;
    }
    // La compra mínima solo condiciona el envío a domicilio; el retiro en
    // sucursal no tiene monto mínimo.
    if ($fulfillment === 'delivery' && $subtotal < (int)$commerce['minimumOrderCents']) {
        json_response(['error'=>'El envío a domicilio requiere una compra mínima de '.money((int)$commerce['minimumOrderCents']).' MXN. También puedes recoger en sucursal sin monto mínimo.'], 422);
    }
    $orderId=uid('order-'); $orderNumber='BER-'.date('ymd').'-'.strtoupper(substr(bin2hex(random_bytes(3)),0,6));
    $payments=setting($db,'payments',['enabled'=>false,'provider'=>'manual']);
    $provider=!empty($payments['enabled'])?(string)$payments['provider']:'manual';
    $db->beginTransaction();
    $db->prepare('INSERT INTO orders(id,order_number,payment_provider,fulfillment_type,branch_id,customer_name,customer_email,customer_phone,address_json,subtotal_cents,total_cents,notes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')->execute([$orderId,$orderNumber,$provider,$fulfillment,$payload['branchId']??null,$name,$email,$phone,json_encode($payload['address']??[],JSON_UNESCAPED_UNICODE),$subtotal,$subtotal,trim((string)($payload['notes']??''))]);
    foreach ($lines as $line) {
        $db->prepare('INSERT INTO order_items(id,order_id,product_id,sku,name,quantity,unit_price_cents,total_cents) VALUES(?,?,?,?,?,?,?,?)')->execute([uid('item-'),$orderId,$line['id'],$line['sku'],$line['name'],$line['quantity'],$line['price_cents'],$line['line_total']]);
        $db->prepare('UPDATE products SET stock=stock-? WHERE id=? AND stock>=?')->execute([$line['quantity'],$line['id'],$line['quantity']]);
    }
    $db->commit();
    $summary=implode("\n",array_map(static fn($l)=>$l['quantity'].' × '.$l['name'],$lines));
    $body="Pedido $orderNumber\n\n$summary\n\nTotal: ".money($subtotal)." MXN\n".($fulfillment==='pickup'?'Retiro en sucursal':'Entrega en Aguascalientes en máximo 24 horas después del pago.');
    @mail((string)$email,"Recibimos tu pedido $orderNumber",$body,"From: {$config['mail']['from']}\r\nContent-Type: text/plain; charset=UTF-8");
    @mail((string)$config['mail']['admin'],"Nueva venta $orderNumber","Cliente: $name · $email · $phone\n\n$body","From: {$config['mail']['from']}\r\nContent-Type: text/plain; charset=UTF-8");
    $paymentUrl = $provider === 'mercadopago' ? create_mp_preference($config,$orderNumber,$email,$lines) : null;
    json_response(['orderNumber'=>$orderNumber,'paymentUrl'=>$paymentUrl,'confirmationUrl'=>'/pedido/confirmado?order='.urlencode($orderNumber)],201);
}

function create_mp_preference(array $config, string $orderNumber, string $email, array $lines): ?string
{
    $token=(string)($config['payments']['mercadopago_access_token']??''); if(!$token)return null;
    $items=array_map(static fn($l)=>['title'=>$l['name'],'quantity'=>(int)$l['quantity'],'unit_price'=>(int)$l['price_cents']/100,'currency_id'=>'MXN'],$lines);
    $payload=['items'=>$items,'payer'=>['email'=>$email],'external_reference'=>$orderNumber,'back_urls'=>['success'=>$config['app_url'].'/pedido/confirmado?order='.$orderNumber,'failure'=>$config['app_url'].'/checkout','pending'=>$config['app_url'].'/pedido/confirmado?order='.$orderNumber],'auto_return'=>'approved','notification_url'=>$config['app_url'].'/api/payments/mercadopago'];
    $ch=curl_init('https://api.mercadopago.com/checkout/preferences');
    curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$token,'Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode($payload)]);
    $response=curl_exec($ch); $status=(int)curl_getinfo($ch,CURLINFO_RESPONSE_CODE); curl_close($ch);
    $data=json_decode((string)$response,true); return $status<300?(string)($data['init_point']??$data['sandbox_init_point']??''):null;
}

function mercado_pago_webhook(PDO $db, array $config): never
{
    $token=(string)($config['payments']['mercadopago_access_token']??'');
    $payload=json_input(); $paymentId=(string)($payload['data']['id']??$payload['id']??$_GET['data.id']??'');
    if(!$token||!$paymentId)json_response(['ok'=>true]);
    $ch=curl_init('https://api.mercadopago.com/v1/payments/'.rawurlencode($paymentId));
    curl_setopt_array($ch,[CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$token]]);
    $data=json_decode((string)curl_exec($ch),true); curl_close($ch);
    $reference=(string)($data['external_reference']??''); if(!$reference)json_response(['ok'=>true]);
    $stmt=$db->prepare('SELECT total_cents FROM orders WHERE order_number=?');$stmt->execute([$reference]);$total=(int)$stmt->fetchColumn();
    $paid=($data['status']??'')==='approved' && (int)round((float)($data['transaction_amount']??0)*100)===$total;
    $db->prepare('UPDATE orders SET payment_status=?,status=?,payment_reference=? WHERE order_number=?')->execute([$paid?'paid':(string)($data['status']??'pending'),$paid?'processing':'pending_payment',$paymentId,$reference]);
    json_response(['ok'=>true]);
}
