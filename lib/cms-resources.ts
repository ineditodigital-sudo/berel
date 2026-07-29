export type CmsField = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "money" | "boolean" | "url" | "json" | "image";
  required?: boolean;
};

export type CmsResource = {
  table: string;
  label: string;
  singular: string;
  fields: CmsField[];
  orderBy: string;
};

export const cmsResources: Record<string, CmsResource> = {
  products: {
    table: "products",
    label: "Productos",
    singular: "producto",
    orderBy: "updated_at DESC",
    fields: [
      { key: "sku", label: "SKU" },
      { key: "name", label: "Nombre", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "category_id", label: "Categoría" },
      { key: "short_description", label: "Descripción corta", type: "textarea" },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "price_cents", label: "Precio (MXN)", type: "money", required: true },
      { key: "compare_at_cents", label: "Precio anterior (MXN)", type: "money" },
      { key: "stock", label: "Existencia", type: "number" },
      { key: "image_url", label: "Imagen", type: "image" },
      { key: "gallery_json", label: "Galería (JSON)", type: "json" },
      { key: "technical_sheet_url", label: "Ficha técnica", type: "url" },
      { key: "benefits_json", label: "Beneficios (JSON)", type: "json" },
      { key: "uses", label: "Usos", type: "textarea" },
      { key: "whatsapp_message", label: "Mensaje de WhatsApp", type: "textarea" },
      { key: "is_active", label: "Activo", type: "boolean" },
      { key: "is_featured", label: "Destacado", type: "boolean" },
    ],
  },
  categories: {
    table: "categories",
    label: "Categorías",
    singular: "categoría",
    orderBy: "sort_order ASC, name ASC",
    fields: [
      { key: "name", label: "Nombre", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "description", label: "Descripción", type: "textarea" },
      { key: "image_url", label: "Imagen", type: "image" },
      { key: "sort_order", label: "Orden", type: "number" },
      { key: "is_active", label: "Activa", type: "boolean" },
    ],
  },
  pages: {
    table: "pages",
    label: "Páginas",
    singular: "página",
    orderBy: "title ASC",
    fields: [
      { key: "title", label: "Título", required: true },
      { key: "slug", label: "Slug", required: true },
      { key: "status", label: "Estado" },
      { key: "seo_title", label: "Título SEO" },
      { key: "seo_description", label: "Descripción SEO", type: "textarea" },
    ],
  },
  content: {
    table: "content_blocks",
    label: "Contenido",
    singular: "bloque",
    orderBy: "page_id ASC, sort_order ASC",
    fields: [
      { key: "page_id", label: "Página", required: true },
      { key: "block_key", label: "Clave", required: true },
      { key: "type", label: "Tipo", required: true },
      { key: "title", label: "Título" },
      { key: "body", label: "Contenido", type: "textarea" },
      { key: "config_json", label: "Diseño y enlaces (JSON)", type: "json" },
      { key: "sort_order", label: "Orden", type: "number" },
      { key: "is_active", label: "Activo", type: "boolean" },
    ],
  },
  slides: {
    table: "carousel_slides",
    label: "Carruseles",
    singular: "diapositiva",
    orderBy: "sort_order ASC",
    fields: [
      { key: "name", label: "Nombre interno", required: true },
      { key: "eyebrow", label: "Antetítulo" },
      { key: "title", label: "Título", required: true },
      { key: "body", label: "Texto", type: "textarea" },
      { key: "image_url", label: "Imagen", type: "image" },
      { key: "button_label", label: "Texto del botón" },
      { key: "button_url", label: "Enlace del botón", type: "url" },
      { key: "theme", label: "Tema" },
      { key: "sort_order", label: "Orden", type: "number" },
      { key: "is_active", label: "Activo", type: "boolean" },
    ],
  },
  faqs: {
    table: "faqs",
    label: "Preguntas frecuentes",
    singular: "pregunta",
    orderBy: "sort_order ASC",
    fields: [
      { key: "question", label: "Pregunta", required: true },
      { key: "answer", label: "Respuesta", type: "textarea", required: true },
      { key: "sort_order", label: "Orden", type: "number" },
      { key: "is_active", label: "Activa", type: "boolean" },
    ],
  },
  branches: {
    table: "branches",
    label: "Sucursales",
    singular: "sucursal",
    orderBy: "name ASC",
    fields: [
      { key: "name", label: "Nombre", required: true },
      { key: "address", label: "Dirección", type: "textarea", required: true },
      { key: "city", label: "Ciudad" },
      { key: "state", label: "Estado" },
      { key: "postal_code", label: "Código postal" },
      { key: "phone", label: "Teléfono" },
      { key: "whatsapp", label: "WhatsApp" },
      { key: "map_url", label: "Enlace de mapa", type: "url" },
      { key: "schedule", label: "Horario" },
      { key: "is_pickup_enabled", label: "Permite retiro", type: "boolean" },
      { key: "is_active", label: "Activa", type: "boolean" },
    ],
  },
  orders: {
    table: "orders",
    label: "Pedidos",
    singular: "pedido",
    orderBy: "created_at DESC",
    fields: [
      { key: "status", label: "Estado" },
      { key: "payment_status", label: "Estado de pago" },
      { key: "notes", label: "Notas", type: "textarea" },
    ],
  },
  settings: {
    table: "site_settings",
    label: "Ajustes de la tienda",
    singular: "configuración",
    orderBy: "key ASC",
    fields: [
      {
        key: "value_json",
        label: "Valores de configuración (JSON)",
        type: "json",
        required: true,
      },
    ],
  },
  media: {
    table: "media",
    label: "Biblioteca multimedia",
    singular: "archivo",
    orderBy: "created_at DESC",
    fields: [
      { key: "alt_text", label: "Texto alternativo", type: "textarea" },
    ],
  },
};

export function getCmsResource(resource: string): CmsResource | null {
  return cmsResources[resource] ?? null;
}
