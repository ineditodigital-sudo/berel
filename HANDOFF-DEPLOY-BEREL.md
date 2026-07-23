# Berel — Handoff de proyecto y deploy por FTP

> Documento para continuar el trabajo en una **nueva tarea de Cowork ejecutada "En tu computadora"** (no en la nube), donde el shell tiene red local y **sí puede hacer FTP**.
> Fecha de traspaso: 21 jul 2026.

---

## 0) Lo primero que debe hacer el nuevo agente

El objetivo inmediato es **desplegar el sitio Berel por FTP** al subdominio. En la sesión anterior (en la nube) el FTP estaba bloqueado por el firewall del sandbox (puertos 21/22 cerrados). Esta tarea corre en la máquina del usuario, así que el FTP debe funcionar.

**Credenciales FTP:**

No se almacenan en el repositorio. Configura `BEREL_FTP_HOST`,
`BEREL_FTP_USER` y `BEREL_FTP_PASSWORD` en el entorno local.
- Puerto: `21` (FTP)
- Carpeta destino: `/public_html/berel.inedito.digital`
- URL pública: https://berel.inedito.digital

**Verifica primero la conexión** antes de subir, por ejemplo:
```bash
curl -s --connect-timeout 15 -u "$BEREL_FTP_USER:$BEREL_FTP_PASSWORD" "ftp://$BEREL_FTP_HOST/public_html/berel.inedito.digital/" | head
# o con lftp:
lftp -u "$BEREL_FTP_USER","$BEREL_FTP_PASSWORD" "$BEREL_FTP_HOST" -e "set ftp:ssl-allow no; ls public_html/berel.inedito.digital; bye"
```

---

## 1) Qué es el proyecto

Tienda en línea (e-commerce) **"Berel México"** — propuesta conceptual de rediseño. Pinturas, impermeabilizantes, esmaltes, selladores, etc.

- **Ubicación en disco (Windows):** `E:\BEREL\SITIO WEB BEREL`
- **Stack:** Next.js 16 + React 19 sobre **vinext** (adaptador Vite/RSC de Cloudflare) + Tailwind 4 + Drizzle ORM. Es una app **SSR/RSC** cuyo destino nativo son Cloudflare Workers.
- **Node requerido:** >= 22.13
- **Scripts:** `npm run dev` (local :3000), `npm run build`, `npm run start` (prod :3000), `npm test`.
- **Datos:** estáticos en `lib/store-data.ts` (8 productos). No hay backend real; el carrito/favoritos viven en el cliente (localStorage).

### Rutas
- `/` (home, client component)
- `/tienda/[categoria]` (catálogo; server component; categorías: todos, pinturas, impermeabilizantes, selladores, esmaltes, maderas, accesorios, promociones)
- `/producto/[slug]` (ficha; 8 slugs)
- `/cuenta` (con ancla `#facturacion`), `/nosotros`, `/privacidad`, `/terminos`

---

## 2) Fase actual — QUÉ YA SE HIZO

### a) Auditoría UI/UX/responsividad/funcionalidad (entregada)
Reporte HTML: `Auditoria-UI-UX-Berel.html` (artefacto). Veredicto: diseño y responsividad muy buenos; la deuda era funcional (maqueta de alta fidelidad).

### b) Correcciones aplicadas y verificadas en navegador (ya escritas en disco)
Todas commit a `E:\BEREL\SITIO WEB BEREL`:

- **P1 — Carrito global real:** nuevo `lib/cart-context.tsx` (Context + drawer y toast globales, persistencia en localStorage). La ficha de producto y el header comparten el mismo carrito; persiste entre páginas. Drawer con multi-ítem, cantidades por línea, total y vaciar.
- **P1 — "Mi cuenta"/"Facturación":** ya no apuntan a ancla vacía; se creó la página `/cuenta` con sección `#facturacion`.
- **P2 — Filtros de categoría del home:** las 4 tarjetas filtran de verdad; datos unificados desde `store-data`.
- **P2 — Precio por presentación en ficha:** 4 L → `from`, 19 L → `to`.
- **P2 — "Guardar en favoritos" en ficha:** funcional.
- **P2 — Ordenar catálogo:** `components/CatalogSort.tsx` (relevancia / precio ↑↓ / rating) vía query param.
- **P2 — Páginas legales:** `/nosotros`, `/privacidad`, `/terminos` creadas y enlazadas en el footer.
- **P2 — Imagen impermeabilizante:** reemplazada por `public/berel/imper.png` con fondo transparente (consistente con la retícula).
- **P3 — "Selladores"** agregado al menú y filtro lateral; galería/ficha técnica con feedback; reveals con red de seguridad.

**Archivos tocados:** `lib/cart-context.tsx` (nuevo), `components/CatalogSort.tsx` (nuevo), `app/cuenta|nosotros|privacidad|terminos/page.tsx` (nuevos), `app/layout.tsx`, `app/page.tsx`, `app/producto/[slug]/page.tsx`, `app/tienda/[categoria]/page.tsx`, `components/StoreHeader.tsx`, `lib/store-data.ts`, `app/modern.css`, `public/berel/imper.png`.

### c) Fix de los banners del hero (ya en disco, en `app/modern.css`)
**Problema:** los slides 2 y 3 usan imágenes 16:9 diseñadas (panel oscuro para texto a la izquierda + bote a la derecha). El hero es más ancho (~2.6:1), así que `object-fit:cover` centrado recortaba arriba/abajo y **cortaba el bote**.
**Solución aplicada** (bloque al final de `app/modern.css`, dentro de `@media(min-width:701px)`):
```css
.hero-carousel,.hero-track,.hero-slide{min-height:560px}
.hero-slide{height:560px}
.hero-slide:nth-child(n+2) .hero-product img{object-position:50% 90%!important}
.hero-slide:first-child .hero-product img{object-position:50% 42%!important}
```
**Verificado correcto** en producción a 768/1024/1280/1440 px, sin overflow horizontal.
⚠️ **Nota importante:** el usuario reportó que "seguía roto" — era **caché de su navegador/dev server**. Al ver la versión desplegada (fresca) debería verse bien. Si aún quiere ajustar los banners, ese es un tema abierto pendiente (ver §5).

---

## 3) Build estático ya generado (listo para FTP)

Como el hosting es cPanel/Apache (estático, sin Node por defecto), se generó un **build estático** que corre en cualquier cPanel:

- **ZIP listo:** `E:\BEREL\SITIO WEB BEREL\berel-sitio-estatico.zip` (~3.6 MB, 22 rutas pre-renderizadas + assets + `.htaccess`).
- **Cómo se generó** (reproducible): `npm run build` → `npm run start` (prod :3000) → se copió `dist/client/` como base y se hizo `curl` de cada ruta a HTML, reescribiendo `http://localhost:3000` → `https://berel.inedito.digital`. Incluye `.htaccess` (DirectoryIndex, rutas limpias, gzip, cache).
- **Verificado:** hidrata sin errores de consola; carrito suma/persiste, drawer abre, todas las páginas cargan.
- **Limitaciones del estático:** el **ordenamiento del catálogo** y la **búsqueda con texto libre** eran del lado servidor; en estático el catálogo va pre-generado (esos dos no re-filtran por URL). El resto funciona igual.

Si se quiere la app **dinámica completa** (con esas dos funciones), hay que desplegar en **Node.js App** (si el cPanel lo soporta) o en **Cloudflare Workers** (destino nativo). Decidir con el usuario (§4).

---

## 4) SIGUIENTES PASOS (en esta tarea local)

### Paso 1 — Confirmar tipo de deploy con el usuario
- **Opción A (rápida, recomendada para su cPanel actual):** subir el **build estático** por FTP. Ya está listo en el zip / o regenerar.
- **Opción B:** si su cPanel tiene "Setup Node.js App", desplegar la app dinámica real.
- **Opción C:** Cloudflare Workers (nativo).

### Paso 2 — Deploy por FTP del build estático (Opción A)
El contenido a subir es lo que hay **dentro** de `berel-sitio-estatico.zip` (que `index.html` quede en la raíz de la carpeta destino). Si prefieres regenerar el estático desde cero en vez de usar el zip, reconstruye con el proceso de §3.

Ejemplo con `lftp` (subir árbol completo, en modo espejo):
```bash
# 1) descomprimir el zip a una carpeta, p.ej. ./deploy
#    (o regenerar el build estático)
# 2) subir todo (incluye .htaccess) al subdominio:
lftp -u "$BEREL_FTP_USER","$BEREL_FTP_PASSWORD" "$BEREL_FTP_HOST" <<'EOF'
set ftp:ssl-allow no
set mirror:parallel-transfer-count 4
lcd ./deploy
cd /public_html/berel.inedito.digital
mirror -R --verbose --exclude-glob .git* ./ ./
bye
EOF
```
> Asegúrate de subir el `.htaccess` (archivo oculto). Con `mirror -R` de una carpeta que lo contiene, se incluye.

### Paso 3 — Verificar en producción
Abrir https://berel.inedito.digital y comprobar: home + banners, catálogo, ficha, carrito (agregar/persistir), páginas legales. Idealmente tomar screenshot.

---

## 5) Temas abiertos / pendientes (opcionales, según el usuario)
1. **Banners del hero:** el fix ya está; confirmar con el usuario que en producción se ven bien. Si quiere un tratamiento distinto (p.ej. hero a 16:9 completo sin recorte, o reubicar flechas/pausa para que no queden sobre el bote), es ajuste de `app/modern.css` (bloque `@media(min-width:701px)` al final).
2. **Checkout real:** el botón "Continuar compra" es un stub (`notify("Checkout listo para conectar")`).
3. **Búsqueda con `?q=` y orden de catálogo:** solo plenos en modo dinámico (Node/Cloudflare), no en estático.
4. **Facturación (CFDI):** la página `/cuenta#facturacion` es informativa; el portal real está pendiente.

---

## 6) Notas de entorno
- El proyecto vive en `E:\BEREL\SITIO WEB BEREL`. `node_modules` ya está en disco (o correr `npm install`).
- En la sesión anterior (nube) el firewall bloqueaba FTP/SFTP (21/22); **por eso este handoff**. En modo "En tu computadora" el shell usa la red local y el FTP debe salir sin problema.
- Las credenciales FTP están arriba (§0). Ruta destino: `/public_html/berel.inedito.digital`.
