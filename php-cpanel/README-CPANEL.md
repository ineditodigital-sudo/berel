# Berel Commerce para cPanel

Versión PHP 8.1+ y MySQL/MariaDB. No requiere Node.js, Composer ni procesos
residentes en el servidor.

## Instalación

1. Crea una base de datos y usuario MySQL desde cPanel y asígnale todos los
   privilegios sobre esa base.
2. Sube el contenido de esta carpeta al document root de
   `berel.inedito.digital`.
3. Abre `https://berel.inedito.digital/install.php`.
4. Introduce los datos MySQL y crea la contraseña del CMS.
5. Al finalizar, elimina o renombra `install.php`.

La tienda queda en `/` y el CMS en `/admin`.

## Configuración sensible

`config.php` se genera durante la instalación y está bloqueado por `.htaccess`.
Mercado Pago se habilita colocando el access token en `config.php` y activando
la pasarela desde Configuración en el CMS.

## Requisitos de PHP

- PHP 8.1 o superior.
- Extensiones PDO MySQL, cURL, fileinfo, mbstring y JSON.
- `mod_rewrite` habilitado.
- Función `mail()` configurada o sustituida posteriormente por SMTP.

## CSV

Columnas: `sku,name,slug,category,short_description,description,price,stock,image_url,technical_sheet_url`.
También acepta `nombre`, `categoria`, `precio`, `existencia`, `imagen`,
`descripcion` y `ficha_tecnica`.
