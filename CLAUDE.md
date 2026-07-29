# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Qué es este proyecto

Tienda en línea + CMS de **Berel México** para operación local en Aguascalientes (pinturas, impermeabilizantes, esmaltes, selladores). Todo el contenido de cara al usuario está en español mexicano.

El repositorio contiene **tres implementaciones/salidas del mismo producto** que conviven y deben mantenerse coherentes:

1. **App canónica** — Next.js 16 + React 19 sobre `vinext` (adaptador Vite/RSC), destino nativo **Cloudflare Workers** con **D1** (SQLite) y **R2** (media). Es el código en `app/`, `lib/`, `components/`, `db/`, `worker/`.
2. **Puerto PHP** (`php-cpanel/`) — PHP 8.1 + MySQL/MariaDB para hosting cPanel compartido sin Node. Replica el mismo esquema, las mismas rutas de API y **reutiliza el CMS de React compilado** (`admin-app.html`).
3. **Export estático** (`scripts/export-cpanel.ps1`) — pre-renderiza las rutas contra un `vinext start` y las sube por FTP. Pierde las funciones server-side (orden de catálogo y búsqueda `?q=`).

## Comandos

```bash
npm install            # Node >= 22.13
npm run dev            # vinext dev + Miniflare (D1/R2 locales) en :3000
npm run db:local       # aplica drizzle/*.sql al D1 local (--reset para rehacerlo)
npm run build          # -> dist/ (client + server + .openai/hosting.json)
npm run start          # servidor de producción en :3000
npm test               # ejecuta build y luego node --test
npm run lint           # eslint (ignora dist, .next, work, outputs, .codex-artifacts)
npm run db:generate    # drizzle-kit generate a partir de db/schema.ts -> drizzle/
```

**Primer arranque en una máquina nueva:** `npm run dev` una vez (Miniflare crea el SQLite local), detenerlo, `npm run db:local`, y volver a levantar. Sin ese paso la base local queda vacía y la tienda no muestra nada — ya no hay catálogo de respaldo que lo disimule.

Para correr los tests sin rebuild (si `dist/` ya existe): `node --test`. La suite es rápida y no levanta servidor; hay además una prueba de humo real que solo corre si se le pasa una URL:

```bash
BEREL_TEST_BASE_URL=http://localhost:3000 node --test
```

`tests/invariants.test.mjs` verifica contratos entre archivos, no textos de la interfaz: que cada campo del registro del CMS exista como columna en la migración, que el puerto PHP administre los mismos recursos, que no reaparezca un catálogo hardcodeado y que el bypass de `/admin` siga exigiendo las dos condiciones. Cambiar un titular o un copy no debe romper la suite; romper uno de esos contratos sí.

## Arquitectura

### Acceso a bindings de Cloudflare

Las rutas de API **no usan Drizzle**: importan `env` desde `cloudflare:workers` y ejecutan SQL preparado directo sobre D1:

```ts
import { env } from "cloudflare:workers";
type RuntimeEnv = { DB: D1Database };
const db = (env as unknown as RuntimeEnv).DB;
```

`db/index.ts` expone `getDb()` con Drizzle, pero hoy `db/schema.ts` sirve sobre todo como **fuente de las migraciones**. Los nombres de binding (`DB`, `MEDIA`) vienen de `.openai/hosting.json` y `vite.config.ts` los inyecta a Miniflare en dev.

### Flujo de datos del storefront

**D1 es la única fuente de la tienda.** No existe catálogo, menú ni campaña hardcodeada: si la base falla, la tienda se muestra vacía o con un aviso explícito y el error queda en consola. Nunca reintroducir listas de respaldo — enmascaran justamente el síntoma "edité el CMS y la tienda no cambia".

Hay dos caminos y conviene saber cuál toca cada página:

- **Client components** (`app/page.tsx`, ficha de producto, `StoreHeader`) usan `loadStorefront()` de `lib/storefront-client.ts`, que memoiza una única petición a `/api/storefront` por carga de página y devuelve productos, categorías, slides y settings ya adaptados.
- **Server components** (`app/tienda/[categoria]`) usan `lib/catalog-data.ts`, que registra el error y lo relanza; la página lo captura para pintar "No pudimos cargar el catálogo".

`cmsProductToStore()` en `store-data.ts` es el adaptador fila-D1 → modelo de UI; ese archivo ya solo contiene tipos y helpers (`slugify`, `money`).

La home deriva del CMS también el carrusel (`carousel_slides`), las tarjetas de categoría (con el conteo real de productos), las preguntas frecuentes de la sección `#ayuda` y **las condiciones comerciales**: cobertura de envío y compra mínima salen de `site_settings.commerce`, nunca de un texto fijo. Antes existían textos como "Envíos en CDMX" y "desde $999" que contradecían la configuración real — no reintroducir copy operativo hardcodeado.

En `StoreHeader` la barra principal muestra las primeras `NAV_CATEGORY_LIMIT` categorías por `sort_order`: el resto se alcanza desde "Todos los productos" y el filtro lateral del catálogo.

### Páginas por bloques (en construcción)

`lib/page-blocks.ts` es el registro de tipos de bloque (`hero`, `trustbar`, `categorias`, `asesor`, `productos`, `faq`, `texto`, `banner`): define qué campos pide el CMS y qué componente dibuja la tienda. Las filas viven en `content_blocks` y `/api/storefront` las publica ya unidas a su página (`page_slug`), ordenadas por `sort_order`. `drizzle/bloques-inicio.sql` siembra la home actual.

`components/blocks/` tiene un componente por tipo y `PageBlocks` los dibuja en `sort_order`. La home (`app/page.tsx`, 169 líneas) solo aporta el marco —splash, barra de utilidades, encabezado y pie—; todo lo demás son bloques. Cada uno se basta a sí mismo: lee lo que necesita de `useStorefront()` y maneja su propio estado, así que agregar un tipo es sumar el componente y su entrada en el mapa de `PageBlocks`.

### Modo edición

`lib/edit-mode.tsx` consulta `GET /api/admin/session` en cada carga. Si hay sesión válida aparece una barra flotante y, al activarla, cada bloque se envuelve en `BlockFrame`: mover arriba/abajo (intercambia `sort_order` con el vecino, dos PATCH), ocultar y editar sus textos, sin salir de la tienda.

`/api/admin/session` es la **única** ruta de admin del puerto PHP que no exige el header CSRF, porque es la que lo entrega; sin ella el storefront estático no tendría forma de obtenerlo. Solo responde a quien ya trae la cookie de sesión.

`lib/storefront-context.tsx` comparte el payload entre todos los bloques; los componentes nuevos deben usar `useStorefront()` en lugar de repetir `loadStorefront()`.

**Regla del despliegue estático:** ninguna página puede depender de `searchParams` o `params` en el servidor, porque el HTML exportado congela ese valor para todos los visitantes. `/tienda/[categoria]` y `/pedido/confirmado` leen la URL con `useSyncExternalStore` en el navegador. El `.htaccess` de `php-cpanel/` sirve el documento de catálogo para todo `/tienda/*`, así que una categoría nueva del CMS funciona sin volver a exportar.

### Anclas: el hash nunca debe llegar a la URL

Mientras `location.hash` tenga valor, **el restaurador de scroll de vinext vuelve a llamar a `scrollIntoView` sobre esa sección en cada render**. El visitante subía y la página lo devolvía al ancla varias veces por segundo: eso era `/#asesoria` "trabando" el scroll. Su respaldo se activa cuando `history.state` no trae la marca `__vinext_scrollY`, que es el caso normal en el sitio exportado.

Por eso el hash se elimina y el desplazamiento se hace a mano, en dos piezas:

- El script inline del `<head>` en `app/layout.tsx` guarda el ancla en `window.__berelAncla` y la borra de la URL. **Tiene que correr ahí**: para cuando React monta, vinext ya parcheó `history.replaceState` y su re-sincronización repone el hash.
- `lib/ancla-de-pagina.ts` (`useAnclaDePagina`) consume ese destino cuando las secciones del CMS ya están dibujadas, e intercepta los clics en `a[href^="#"]` con `preventDefault()` para que el hash tampoco entre al navegar dentro de la página. Las páginas de servidor lo activan con `<AnclaDePagina />`.

Dos cosas que **no** funcionan y ya se intentaron: limpiar el hash desde un `useEffect` (vinext lo repone) y escuchar `hashchange` para volver a limpiarlo (los dos manejadores se realimentan y el tirón se duplica — se midieron 28 llamadas de scroll en 2.5 s, alternando `{behavior:"smooth"}` propio con `{behavior:"auto"}` de vinext).

Contrapartida aceptada: la barra de direcciones ya no muestra `#seccion`. `npm test` fija el contrato.

### CMS genérico dirigido por registro

`lib/cms-resources.ts` es el **registro único** que define tablas, etiquetas, orden y campos. De ahí salen:

- `app/api/admin/[resource]/route.ts` y `[id]/route.ts` — CRUD genérico que interpola `resource.table` y `resource.orderBy` en el SQL (sólo llaves del registro, nunca entrada del usuario).
- `components/admin/AdminDashboard.tsx` — un único componente (~420 líneas) que renderiza formularios a partir de `fields`.

Agregar un campo requiere tocar **cuatro sitios**: `db/schema.ts` → migración en `drizzle/` → `lib/cms-resources.ts` → `php-cpanel/src/Resources.php` + `php-cpanel/schema.sql`. `npm test` falla si alguno queda desincronizado.

`orders`, `settings` y `media` no aceptan `POST` genérico; tienen rutas propias.

### Autenticación del CMS

`app/chatgpt-auth.ts` lee los headers `oai-authenticated-user-email` / `-full-name` que inyecta el hosting de Sites. `lib/admin-auth.ts` valida el correo contra `ADMIN_EMAILS` (fallback `ineditodigital@gmail.com`).

`requireAdminPage()` y `requireAdminApi()` omiten la autenticación **solo si se cumplen las dos condiciones a la vez**: `ADMIN_PREVIEW === "true"` **y** `NODE_ENV === "development"` (helper `isLocalPreview()`). Así, si `ADMIN_PREVIEW` se filtrara a producción el CMS seguiría protegido. El `.env.local` de desarrollo trae `ADMIN_PREVIEW=true`; sin él, `/admin` redirige a `/signin-with-chatgpt`, que en local no existe (404).

En el puerto PHP la autenticación es distinta: sesión + contraseña hasheada en `config.php` (`php-cpanel/src/Auth.php`) con token CSRF que el CMS de React lee de `window.BEREL_PHP_CSRF`.

### Pedidos y pagos

`app/api/orders/route.ts` concentra la lógica de negocio: valida contra `site_settings.commerce` (compra mínima, estado de entrega, promesa de horas), recalcula precios **desde la base** (nunca confía en el cliente), inserta pedido + líneas y **descuenta stock en el mismo `db.batch()`**. Después crea la preferencia de Mercado Pago y envía correos por Resend.

`app/api/payments/mercadopago/route.ts` es el webhook: consulta el pago en la API de MP y **sólo marca `paid` si el monto coincide** con `total_cents` del pedido.

Si `payments.enabled` es `false` en `site_settings`, el proveedor cae a `manual` y no se genera cobro.

### Dinero

Todo se guarda en **centavos** (`price_cents`, `total_cents`, `minimumOrderCents`). Los campos de tipo `money` en el CMS reciben pesos y se multiplican por 100 en `normalizeValue()`.

### Media

Subida por `POST /api/admin/media` (multipart, máx. 15 MB, JPG/PNG/WebP/AVIF/PDF) → objeto en R2 con clave `YYYY-MM-DD/uuid.ext` → fila en `media`. Se sirve por `app/api/media/[...key]/route.ts` con `cache-control: immutable`. El worker además intercepta `/_vinext/image` para optimización con el binding `IMAGES`.

### Estilos

`app/globals.css` y `app/modern.css` se cargan en ese orden y **compiten**: reglas base de `modern.css` sobrescriben media queries de `globals.css` (ver `AUDITORIA_RESPONSIVA.md`, hallazgo P1 del asesor móvil). Antes de "arreglar" responsividad, revisar el orden de la cascada, no sólo el breakpoint. Los ajustes del hero viven al final de `modern.css` dentro de `@media(min-width:701px)`.

## Migraciones y datos semilla

`drizzle/0000_melodic_talos.sql` contiene el DDL **y las semillas** (17 categorías, 8 productos, 4 páginas, 3 slides, 3 FAQ, 1 sucursal y los 5 registros de `site_settings`: `commerce`, `contact`, `branding`, `payments`, `notifications`). `drizzle-kit generate` **no regenera esos INSERT** — si se regenera la migración hay que reinyectarlos a mano. `php-cpanel/schema.sql` es el equivalente MySQL.

Defaults de operación (editables desde el módulo Configuración): MXN, compra mínima $800, envío sólo Aguascalientes, envío gratis, promesa 24 h, retiro en sucursal activo.

## Importación CSV

`app/api/admin/import-products/route.ts` trae su propio parser de CSV (comillas y CRLF incluidos). Encabezados en inglés o español (`nombre`, `categoria`, `precio`, `existencia`, `imagen`, `descripcion`, `ficha_tecnica`); precio en pesos; se hace upsert por SKU o slug.

## Entorno y despliegue

`.env.example` → `.env.local`. Secretos: `MERCADO_PAGO_ACCESS_TOKEN`, `RESEND_API_KEY`, `ORDER_EMAIL_FROM`, `ADMIN_EMAILS`. Nunca se guardan en D1 ni se muestran en el CMS.

Las credenciales FTP (`BEREL_FTP_HOST/USER/PASSWORD`, destino `/public_html/berel.inedito.digital`) sólo se leen del entorno; los scripts (`deploy-inteligente.py`, `subir-berel-ftp.ps1`, `SUBIR-BEREL.cmd`) abortan si faltan. `deploy-inteligente.py` sube incremental por tamaño y siempre reenvía `.html`, `.htaccess` y `_headers`; no borra nada del servidor. El `.htaccess` de la raíz fuerza HTTPS vía `X-Forwarded-Proto` (el sitio va detrás de un proxy nginx, `%{HTTPS}` daría bucle).

`HANDOFF-DEPLOY-BEREL.md` documenta el proceso de deploy y los pendientes abiertos.

## Compresión: bloqueada por el proxy del hosting

**Nada se sirve comprimido, y no es un descuido de configuración.** El sitio va detrás de un proxy nginx que habla HTTP/1.0 con Apache y **descarta la cabecera `Accept-Encoding`**. Se comprobó con un PHP de diagnóstico: Apache la recibe ausente, mientras que una cabecera inventada sí llegaba. Por eso fallan a la vez:

- `mod_deflate` — además no está instalado: `AddOutputFilterByType DEFLATE` en un `.htaccess` de prueba devuelve 500.
- `zlib.output_compression` en PHP — sin `Accept-Encoding` no comprime.
- La regla de gemelos `.gz` del `.htaccess` — su `RewriteCond %{HTTP:Accept-Encoding} gzip` nunca se cumple.

`scripts/export-cpanel.ps1` ya publica un `.gz` junto a cada `.css`, `.js` y `.html` (785 KB → 219 KB), y el `.htaccess` trae las reglas listas. **El día que se habilite gzip en nginx —panel del hosting o soporte— la compresión empieza a funcionar sola.** No se sirve el `.gz` sin condición a propósito: quien no acepte gzip recibiría bytes ilegibles.

Es el techo del rendimiento móvil: con ~1 MB de texto sin comprimir, Lighthouse no pasa de ~64.

## Convenciones

- Alias de import `@/*` → raíz del repo.
- Los archivos generados/locales están fuera de git: `dist/`, `work/`, `outputs/`, `.wrangler/`, `.codex-*`, zips y tarballs del repositorio.
- `eslint.config.mjs` **no ignora `php-cpanel/`**, así que los assets JS del puerto PHP entran al lint (`assets/admin.js` produce un error `no-assign-module-variable`).
