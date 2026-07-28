-- Secciones de la página de inicio como bloques editables.
-- Reproduce exactamente la home actual: al conectarse el renderizador, la
-- página se ve igual, pero el orden y la visibilidad pasan a ser datos.
-- Compatible con SQLite (D1) y MySQL (puerto cPanel).

DELETE FROM content_blocks WHERE page_id = 'page-home';

INSERT INTO content_blocks (id, page_id, block_key, type, title, body, config_json, sort_order, is_active) VALUES
('blk-home-trustbar','page-home','trustbar','trustbar','','','{}',0,1),
('blk-home-hero','page-home','hero','hero','','','{"autoplaySeconds":6}',1,1),
('blk-home-categorias','page-home','categorias','categorias','COMPRA POR CATEGORÍA','Encuentra lo que necesitas','{"limite":4}',2,1),
('blk-home-asesor','page-home','asesor','asesor','ASESOR DE PRODUCTO','¿No sabes cuál elegir?','{}',3,1),
('blk-home-productos','page-home','productos','productos','PRODUCTOS DESTACADOS','Los favoritos de nuestros clientes','{"limite":8}',4,1),
('blk-home-faq','page-home','faq','faq','','','{"limite":3}',5,1);
