# Berel Commerce

Tienda en línea y CMS de Berel para operación local en Aguascalientes.

## Funciones

- Catálogo, categorías, fichas de producto, carruseles y contenido administrables.
- CMS protegido en `/admin`.
- CRUD de productos, categorías, páginas, bloques, FAQ, sucursales y pedidos.
- Biblioteca de imágenes y fichas PDF en Cloudflare R2.
- Importación y actualización masiva de productos por CSV.
- Carrito, compra mínima configurable, envío local y retiro en sucursal.
- Pedidos persistentes en Cloudflare D1.
- Checkout Pro de Mercado Pago y webhook de confirmación.
- Correo al cliente y al administrador mediante Resend.
- WhatsApp general y mensaje configurable por producto.

## Desarrollo

Requiere Node.js 22.13 o superior.

```bash
npm install
npm run dev
npm test
npm run lint
```

El proyecto usa Vinext, React 19, Cloudflare D1 y R2. La configuración lógica de
recursos está en `.openai/hosting.json` y las migraciones en `drizzle/`.

## Acceso al CMS

El CMS usa Sign in with ChatGPT y valida el correo en el servidor. Configura
`ADMIN_EMAILS` como una lista separada por comas. Nunca confíes solamente en
ocultar enlaces del panel.

## CSV de productos

Columnas reconocidas:

```csv
sku,name,slug,category,short_description,description,price,stock,image_url,technical_sheet_url
```

También se aceptan los encabezados en español `nombre`, `categoria`, `precio`,
`existencia`, `imagen`, `descripcion` y `ficha_tecnica`. El precio se expresa
en pesos mexicanos. Un producto existente se actualiza por SKU o slug.

## Pagos y notificaciones

Copia `.env.example` a `.env.local` para desarrollo. En producción, registra
los valores como secretos del entorno:

- `MERCADO_PAGO_ACCESS_TOKEN`
- `RESEND_API_KEY`
- `ORDER_EMAIL_FROM`
- `ADMIN_EMAILS`

Activa Mercado Pago desde el registro `payments` del módulo Configuración
después de colocar el token. Los secretos nunca se guardan en D1 ni se muestran
en el CMS.

## Operación predeterminada

- Moneda: MXN.
- Compra mínima: $800 MXN.
- Envíos: únicamente Aguascalientes.
- Costo de envío: gratis.
- Promesa: máximo 24 horas después de confirmar el pago.
- Retiro en sucursal: habilitado.

Estos valores se pueden editar desde el módulo Configuración del CMS.
