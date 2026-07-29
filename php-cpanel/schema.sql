SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE IF NOT EXISTS categories (
  id varchar(64) PRIMARY KEY, name varchar(180) NOT NULL, slug varchar(190) NOT NULL UNIQUE,
  description text NOT NULL, image_url varchar(500) NOT NULL DEFAULT '', sort_order int NOT NULL DEFAULT 0,
  is_active tinyint(1) NOT NULL DEFAULT 1, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id varchar(64) PRIMARY KEY, sku varchar(100) NOT NULL DEFAULT '', name varchar(220) NOT NULL,
  slug varchar(190) NOT NULL UNIQUE, category_id varchar(64) NULL, short_description text NOT NULL,
  description longtext NOT NULL, price_cents int unsigned NOT NULL DEFAULT 0, compare_at_cents int unsigned NULL,
  stock int NOT NULL DEFAULT 0, image_url varchar(500) NOT NULL DEFAULT '', gallery_json longtext NOT NULL,
  technical_sheet_url varchar(500) NOT NULL DEFAULT '', benefits_json longtext NOT NULL, uses text NOT NULL,
  whatsapp_message text NOT NULL, is_active tinyint(1) NOT NULL DEFAULT 1, is_featured tinyint(1) NOT NULL DEFAULT 0,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category(category_id), INDEX idx_products_active(is_active), INDEX idx_products_sku(sku),
  CONSTRAINT fk_products_category FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pages (
  id varchar(64) PRIMARY KEY, slug varchar(190) NOT NULL UNIQUE, title varchar(220) NOT NULL,
  status varchar(30) NOT NULL DEFAULT 'published', seo_title varchar(255) NOT NULL DEFAULT '',
  seo_description text NOT NULL, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS content_blocks (
  id varchar(64) PRIMARY KEY, page_id varchar(64) NOT NULL, block_key varchar(150) NOT NULL,
  type varchar(50) NOT NULL, title varchar(255) NOT NULL DEFAULT '', body longtext NOT NULL,
  config_json longtext NOT NULL, sort_order int NOT NULL DEFAULT 0, is_active tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_content_page(page_id), CONSTRAINT fk_content_page FOREIGN KEY(page_id) REFERENCES pages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS carousel_slides (
  id varchar(64) PRIMARY KEY, name varchar(180) NOT NULL, eyebrow varchar(180) NOT NULL DEFAULT '',
  title varchar(255) NOT NULL, body text NOT NULL, image_url varchar(500) NOT NULL DEFAULT '',
  image_url_mobile varchar(500) NOT NULL DEFAULT '',
  button_label varchar(120) NOT NULL DEFAULT '', button_url varchar(500) NOT NULL DEFAULT '',
  theme varchar(30) NOT NULL DEFAULT 'red', sort_order int NOT NULL DEFAULT 0, is_active tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS faqs (
  id varchar(64) PRIMARY KEY, question varchar(255) NOT NULL, answer text NOT NULL,
  sort_order int NOT NULL DEFAULT 0, is_active tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS branches (
  id varchar(64) PRIMARY KEY, name varchar(180) NOT NULL, address text NOT NULL,
  city varchar(120) NOT NULL DEFAULT 'Aguascalientes', state varchar(120) NOT NULL DEFAULT 'Aguascalientes',
  postal_code varchar(12) NOT NULL DEFAULT '', phone varchar(40) NOT NULL DEFAULT '', whatsapp varchar(40) NOT NULL DEFAULT '',
  map_url varchar(500) NOT NULL DEFAULT '', schedule varchar(255) NOT NULL DEFAULT '',
  is_pickup_enabled tinyint(1) NOT NULL DEFAULT 1, is_active tinyint(1) NOT NULL DEFAULT 1,
  created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  `key` varchar(80) PRIMARY KEY, value_json longtext NOT NULL,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media (
  id varchar(64) PRIMARY KEY, name varchar(255) NOT NULL, object_key varchar(255) NOT NULL UNIQUE,
  url varchar(500) NOT NULL, mime_type varchar(100) NOT NULL, size int unsigned NOT NULL,
  alt_text text NOT NULL, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id varchar(64) PRIMARY KEY, order_number varchar(40) NOT NULL UNIQUE,
  status varchar(40) NOT NULL DEFAULT 'pending_payment', payment_provider varchar(40) NOT NULL DEFAULT 'manual',
  payment_reference varchar(150) NOT NULL DEFAULT '', payment_status varchar(40) NOT NULL DEFAULT 'pending',
  fulfillment_type varchar(20) NOT NULL, branch_id varchar(64) NULL, customer_name varchar(220) NOT NULL,
  customer_email varchar(220) NOT NULL, customer_phone varchar(40) NOT NULL, address_json longtext NOT NULL,
  subtotal_cents int unsigned NOT NULL, shipping_cents int unsigned NOT NULL DEFAULT 0,
  total_cents int unsigned NOT NULL, notes text NOT NULL, created_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_created(created_at), CONSTRAINT fk_orders_branch FOREIGN KEY(branch_id) REFERENCES branches(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id varchar(64) PRIMARY KEY, order_id varchar(64) NOT NULL, product_id varchar(64) NULL,
  sku varchar(100) NOT NULL DEFAULT '', name varchar(220) NOT NULL, quantity int unsigned NOT NULL,
  unit_price_cents int unsigned NOT NULL, total_cents int unsigned NOT NULL,
  INDEX idx_items_order(order_id), CONSTRAINT fk_items_order FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT fk_items_product FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO categories(id,name,slug,description,image_url,sort_order,is_active) VALUES
('cat-uncategorized','Sin categorizar','sin-categorizar','','',0,1),
('cat-aerosoles','AEROSOLES','aerosoles','','',1,1),('cat-barnices','Barnices','barnices','','',2,1),
('cat-base-agua','Base Agua','base-agua','','',3,1),('cat-construccion','Construcción','construccion','','',4,1),
('cat-corona','Corona','corona','','',5,1),('cat-decorativos','Decorativos','decorativos','','',6,1),
('cat-epoxicos','EPOXICOS','epoxicos','','',7,1),('cat-esmalte','Esmalte','esmalte','','',8,1),
('cat-fandeli','Fandeli','fandeli','','',9,1),('cat-impermeabilizante','Impermeabilizante','impermeabilizante','','',10,1),
('cat-industriales','Industriales','industriales','','',11,1),('cat-kover','kover','kover-promociones','','',12,1),
('cat-maderas','MADERAS','maderas','','',13,1),('cat-otros','Otros Productos','otros-productos','','',14,1),
('cat-primarios','Primarios','primarios','','',15,1),('cat-sellador','SELLADOR','sellador','','',16,1);

INSERT IGNORE INTO pages(id,slug,title,status,seo_title,seo_description) VALUES
('page-home','inicio','Inicio','published','Berel México | Pinturas e impermeabilizantes','Compra productos Berel en Aguascalientes.'),
('page-about','nosotros','Quiénes somos','published','Quiénes somos | Berel Aguascalientes','Conoce nuestra tienda.'),
('page-privacy','privacidad','Aviso de privacidad','published','Aviso de privacidad | Berel','Conoce cómo protegemos tus datos.'),
('page-terms','terminos','Términos y condiciones','published','Términos y condiciones | Berel','Condiciones de compra y entrega.');

INSERT IGNORE INTO products(id,sku,name,slug,category_id,short_description,description,price_cents,compare_at_cents,stock,image_url,gallery_json,benefits_json,uses,whatsapp_message,is_active,is_featured) VALUES
('prod-pisos-3800','BER-3800','Pintura para Pisos Serie 3800','pintura-pisos-3800','cat-base-agua','Acabado satinado base agua para pisos.','Protege y decora pisos de concreto y mortero.',138500,NULL,25,'/assets/img/pisos.png','[]','["Interior y exterior","Acabado antideslizante","Sin plomo","Fácil aplicación"]','Pisos con tránsito peatonal y vehicular ligero.','Hola, me gustaría más información sobre Pintura para Pisos Serie 3800.',1,1),
('prod-salitre-530','BER-530','Sellador Anti-Salitre No. 530','sellador-anti-salitre-530','cat-sellador','Sellador para superficies con sales y humedad.','Mejora la adherencia sobre muros de concreto, cemento, yeso y mampostería.',19500,NULL,30,'/assets/img/salitre.png','[]','["Bloquea el salitre","Mejora la adherencia","Secado rápido"]','Muros con humedad alcalina.','Hola, me gustaría más información sobre Sellador Anti-Salitre No. 530.',1,1),
('prod-playa','BER-PLAYA','Berelex Pintura para Playa','berelex-playa','cat-base-agua','Recubrimiento para ambientes costeros.','Protección de alto desempeño ante humedad y radiación UV.',83500,NULL,18,'/assets/img/playa.png','[]','["Resiste humedad","Protección UV","Lavable"]','Fachadas y muros exteriores.','Hola, me gustaría más información sobre Berelex Pintura para Playa.',1,1);

INSERT IGNORE INTO carousel_slides(id,name,eyebrow,title,body,image_url,button_label,button_url,theme,sort_order,is_active) VALUES
('slide-main','Campaña principal','TIENDA BEREL AGUASCALIENTES','Todo para pintar, proteger y renovar.','Productos originales, asesoría especializada y entrega local.','/assets/img/hero-modern-berel.webp','Comprar ahora','/tienda/todos','yellow',0,1),
('slide-rain','Impermeabilizantes','PROTECCIÓN TODO EL AÑO','Que la lluvia no detenga tus proyectos.','Impermeabilizantes de alto desempeño para cuidar tu hogar.','/assets/img/hero-impermeabilizante-v2.webp','Ver impermeabilizantes','/tienda/impermeabilizante','blue',1,1);

INSERT IGNORE INTO faqs(id,question,answer,sort_order,is_active) VALUES
('faq-delivery','¿Dónde realizan entregas?','Por ahora entregamos únicamente dentro del estado de Aguascalientes.',0,1),
('faq-time','¿En cuánto tiempo llega mi pedido?','Entregamos en un plazo máximo de 24 horas después de confirmar el pago.',1,1),
('faq-pickup','¿Puedo recoger mi compra?','Sí. Selecciona retiro en sucursal durante la compra.',2,1);

INSERT IGNORE INTO branches(id,name,address,city,state,postal_code,phone,whatsapp,map_url,schedule,is_pickup_enabled,is_active) VALUES
('branch-main','Sucursal Aguascalientes','Configura la dirección desde el CMS','Aguascalientes','Aguascalientes','','','','','Lunes a sábado',1,1);

INSERT IGNORE INTO site_settings(`key`,value_json) VALUES
('commerce','{"currency":"MXN","minimumOrderCents":80000,"deliveryState":"Aguascalientes","freeShipping":true,"deliveryPromiseHours":24,"pickupEnabled":true}'),
('contact','{"phone":"","whatsapp":"","email":"ineditodigital@gmail.com"}'),
('branding','{"primaryFont":"Quicksand","logoUrl":"/assets/img/berel-icono.png","primaryColor":"#e5252a","secondaryColor":"#1428a0","accentColor":"#ffd326"}'),
('payments','{"provider":"mercadopago","enabled":false,"testMode":true}'),
('notifications','{"adminEmail":"ineditodigital@gmail.com","customerConfirmation":true,"adminNewOrder":true}');

SET FOREIGN_KEY_CHECKS=1;
