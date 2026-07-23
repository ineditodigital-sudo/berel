CREATE TABLE `branches` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text DEFAULT 'Aguascalientes' NOT NULL,
	`state` text DEFAULT 'Aguascalientes' NOT NULL,
	`postal_code` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`whatsapp` text DEFAULT '' NOT NULL,
	`map_url` text DEFAULT '' NOT NULL,
	`schedule` text DEFAULT '' NOT NULL,
	`is_pickup_enabled` integer DEFAULT true NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `carousel_slides` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`eyebrow` text DEFAULT '' NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`button_label` text DEFAULT '' NOT NULL,
	`button_url` text DEFAULT '' NOT NULL,
	`theme` text DEFAULT 'red' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`block_key` text NOT NULL,
	`type` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`config_json` text DEFAULT '{}' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`object_key` text NOT NULL,
	`url` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`alt_text` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_object_key_unique` ON `media` (`object_key`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`sku` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price_cents` integer NOT NULL,
	`total_cents` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`status` text DEFAULT 'pending_payment' NOT NULL,
	`payment_provider` text DEFAULT 'manual' NOT NULL,
	`payment_reference` text DEFAULT '' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`fulfillment_type` text NOT NULL,
	`branch_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text NOT NULL,
	`address_json` text DEFAULT '{}' NOT NULL,
	`subtotal_cents` integer NOT NULL,
	`shipping_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`branch_id`) REFERENCES `branches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `orders_order_number_unique` ON `orders` (`order_number`);--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`seo_title` text DEFAULT '' NOT NULL,
	`seo_description` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text DEFAULT '' NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`category_id` text,
	`short_description` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`price_cents` integer DEFAULT 0 NOT NULL,
	`compare_at_cents` integer,
	`stock` integer DEFAULT 0 NOT NULL,
	`image_url` text DEFAULT '' NOT NULL,
	`gallery_json` text DEFAULT '[]' NOT NULL,
	`technical_sheet_url` text DEFAULT '' NOT NULL,
	`benefits_json` text DEFAULT '[]' NOT NULL,
	`uses` text DEFAULT '' NOT NULL,
	`whatsapp_message` text DEFAULT '' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `categories` (`id`,`name`,`slug`,`sort_order`) VALUES
('cat-uncategorized','Sin categorizar','sin-categorizar',0),
('cat-aerosoles','AEROSOLES','aerosoles',1),
('cat-barnices','Barnices','barnices',2),
('cat-base-agua','Base Agua','base-agua',3),
('cat-construccion','Construcción','construccion',4),
('cat-corona','Corona','corona',5),
('cat-decorativos','Decorativos','decorativos',6),
('cat-epoxicos','EPOXICOS','epoxicos',7),
('cat-esmalte','Esmalte','esmalte',8),
('cat-fandeli','Fandeli','fandeli',9),
('cat-impermeabilizante','Impermeabilizante','impermeabilizante',10),
('cat-industriales','Industriales','industriales',11),
('cat-kover','kover','kover-promociones',12),
('cat-maderas','MADERAS','maderas',13),
('cat-otros','Otros Productos','otros-productos',14),
('cat-primarios','Primarios','primarios',15),
('cat-sellador','SELLADOR','sellador',16);
--> statement-breakpoint
INSERT INTO `products` (`id`,`sku`,`name`,`slug`,`category_id`,`short_description`,`description`,`price_cents`,`compare_at_cents`,`stock`,`image_url`,`benefits_json`,`uses`,`whatsapp_message`,`is_featured`) VALUES
('prod-pisos-3800','BER-3800','Pintura para Pisos Serie 3800','pintura-pisos-3800','cat-base-agua','Acabado satinado base agua para pisos.','Protege y decora pisos de concreto y mortero.',138500,NULL,25,'/berel/pisos.png','["Interior y exterior","Acabado antideslizante","Sin plomo","Fácil aplicación"]','Pisos con tránsito peatonal y vehicular ligero.','Hola, me gustaría más información sobre Pintura para Pisos Serie 3800.',1),
('prod-salitre-530','BER-530','Sellador Anti-Salitre No. 530','sellador-anti-salitre-530','cat-sellador','Sellador para superficies con sales y humedad.','Mejora la adherencia sobre muros de concreto, cemento, yeso y mampostería.',19500,NULL,30,'/berel/salitre.png','["Bloquea el salitre","Mejora la adherencia","Secado rápido","Uso interior"]','Muros con humedad alcalina.','Hola, me gustaría más información sobre Sellador Anti-Salitre No. 530.',1),
('prod-playa','BER-PLAYA','Berelex Pintura para Playa','berelex-playa','cat-base-agua','Recubrimiento para ambientes costeros.','Protección de alto desempeño ante humedad y radiación UV.',83500,NULL,18,'/berel/playa.png','["Resiste humedad","Protección UV","Lavable","Gran cobertura"]','Fachadas y muros exteriores.','Hola, me gustaría más información sobre Berelex Pintura para Playa.',1),
('prod-pizarron','BER-4600','Pintura para Pizarrón Serie 4600','pintura-pizarron-4600','cat-decorativos','Convierte superficies lisas en pizarrón.','Acabado uniforme y lavable para escribir con gis.',28350,37500,20,'/berel/pizarron.png','["Acabado uniforme","Fácil limpieza","Gran adherencia","Uso creativo"]','Escuelas, oficinas, cocinas y habitaciones infantiles.','Hola, me gustaría más información sobre Pintura para Pizarrón Serie 4600.',1),
('prod-imper','BER-IMP','Impermeabilizante Acrílico Berel','impermeabilizante-acrilico','cat-impermeabilizante','Sistema flexible para techos y azoteas.','Protección impermeable para losas y cubiertas residenciales.',129900,NULL,15,'/berel/imper.png','["Alta elasticidad","Reflectivo","Fácil aplicación","Larga duración"]','Losas de concreto y azoteas.','Hola, me gustaría más información sobre Impermeabilizante Acrílico Berel.',1),
('prod-summa','BER-SUMMA','Esmalte Summa Berel','esmalte-summa','cat-esmalte','Esmalte de excelente nivelación.','Gran poder cubriente para metal y madera.',39900,NULL,22,'/berel/summa.png','["Acabado brillante","Alta resistencia","Gran adherencia","Lavable"]','Metal, madera y superficies preparadas.','Hola, me gustaría más información sobre Esmalte Summa Berel.',1),
('prod-barniz','BER-BARNIZ','Barniz Protector para Maderas','barniz-maderas','cat-barnices','Protección transparente para madera.','Realza la veta natural y protege contra humedad y rayos UV.',44900,NULL,12,'/berel/summa.png','["Protección UV","Repelente al agua","Acabado durable","Resalta la veta"]','Puertas, muebles y elementos decorativos.','Hola, me gustaría más información sobre Barniz Protector para Maderas.',0),
('prod-kit','BER-KIT','Kit Profesional de Aplicación','kit-aplicacion','cat-otros','Herramientas esenciales para pintar.','Incluye rodillo, brocha y charola para una aplicación uniforme.',28900,NULL,40,'/berel/pisos.png','["Rodillo profesional","Brocha de precisión","Charola resistente","Reutilizable"]','Proyectos residenciales de pintura y mantenimiento.','Hola, me gustaría más información sobre Kit Profesional de Aplicación.',0);
--> statement-breakpoint
INSERT INTO `pages` (`id`,`slug`,`title`,`seo_title`,`seo_description`) VALUES
('page-home','inicio','Inicio','Berel México | Pinturas e impermeabilizantes','Compra productos Berel en Aguascalientes con entrega en menos de 24 horas.'),
('page-about','nosotros','Quiénes somos','Quiénes somos | Berel Aguascalientes','Conoce nuestra tienda y servicio especializado.'),
('page-privacy','privacidad','Aviso de privacidad','Aviso de privacidad | Berel','Conoce cómo protegemos tus datos.'),
('page-terms','terminos','Términos y condiciones','Términos y condiciones | Berel','Condiciones de compra y entrega.');
--> statement-breakpoint
INSERT INTO `carousel_slides` (`id`,`name`,`eyebrow`,`title`,`body`,`image_url`,`button_label`,`button_url`,`theme`,`sort_order`) VALUES
('slide-main','Campaña principal','TIENDA BEREL AGUASCALIENTES','Todo para pintar, proteger y renovar.','Productos originales, asesoría especializada y entrega local en menos de 24 horas.','/hero-modern-berel.webp','Comprar ahora','/tienda/todos','yellow',0),
('slide-rain','Impermeabilizantes','PROTECCIÓN TODO EL AÑO','Que la lluvia no detenga tus proyectos.','Impermeabilizantes de alto desempeño para cuidar tu hogar.','/hero-impermeabilizante-v2.webp','Ver impermeabilizantes','/tienda/impermeabilizante','blue',1),
('slide-outdoor','Exteriores','COLOR PARA EXTERIORES','Fachadas que resisten y se ven increíbles.','Recubrimientos diseñados para sol, humedad y ambientes exigentes.','/hero-exteriores-v2.webp','Explorar productos','/tienda/base-agua','red',2);
--> statement-breakpoint
INSERT INTO `faqs` (`id`,`question`,`answer`,`sort_order`) VALUES
('faq-delivery','¿Dónde realizan entregas?','Por ahora entregamos únicamente dentro del estado de Aguascalientes.',0),
('faq-time','¿En cuánto tiempo llega mi pedido?','Entregamos en un plazo máximo de 24 horas después de confirmar el pago.',1),
('faq-pickup','¿Puedo recoger mi compra?','Sí. Selecciona retiro en sucursal durante la compra.',2);
--> statement-breakpoint
INSERT INTO `branches` (`id`,`name`,`address`,`phone`,`whatsapp`,`schedule`) VALUES
('branch-main','Sucursal Aguascalientes','Configura la dirección desde el CMS','', '', 'Lunes a sábado');
--> statement-breakpoint
INSERT INTO `site_settings` (`key`,`value_json`) VALUES
('commerce','{"currency":"MXN","minimumOrderCents":80000,"deliveryState":"Aguascalientes","freeShipping":true,"deliveryPromiseHours":24,"pickupEnabled":true}'),
('contact','{"phone":"","whatsapp":"","email":"ineditodigital@gmail.com"}'),
('branding','{"primaryFont":"Quicksand","logoUrl":"/berel-icono.png","primaryColor":"#e5252a","secondaryColor":"#1428a0","accentColor":"#ffd326"}'),
('payments','{"provider":"mercadopago","enabled":false,"testMode":true}'),
('notifications','{"adminEmail":"ineditodigital@gmail.com","customerConfirmation":true,"adminNewOrder":true}');
