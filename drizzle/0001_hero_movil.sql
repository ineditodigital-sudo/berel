-- Imagen propia para móvil en las campañas del hero.
-- Los banners se diseñan en 16:9 para escritorio; recortados a vertical
-- pierden el producto. Cada diapositiva puede llevar su propia versión.
ALTER TABLE carousel_slides ADD COLUMN image_url_mobile text NOT NULL DEFAULT '';
