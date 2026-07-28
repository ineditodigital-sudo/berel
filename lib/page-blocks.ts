/**
 * Catálogo de bloques con los que se arman las páginas.
 *
 * Cada fila de `content_blocks` en la base tiene un `type` que corresponde a
 * una de estas claves. El CMS usa esta definición para saber qué campos pedir
 * y la tienda para saber qué componente dibujar, así que agregar un bloque
 * nuevo es agregar una entrada aquí y su componente en `components/blocks/`.
 */

export type BlockFieldType = "text" | "textarea" | "number" | "boolean";

export type BlockField = {
  key: string;
  label: string;
  type?: BlockFieldType;
  help?: string;
};

export type BlockDefinition = {
  label: string;
  description: string;
  /** Campos guardados dentro de `config_json`. */
  fields: BlockField[];
  /** `title` y `body` de la fila se usan como encabezado de la sección. */
  usesHeading: boolean;
};

export const blockTypes: Record<string, BlockDefinition> = {
  hero: {
    label: "Carrusel principal",
    description:
      "Campañas grandes del inicio. Las diapositivas se administran en el módulo Carruseles.",
    usesHeading: false,
    fields: [
      {
        key: "autoplaySeconds",
        label: "Segundos por campaña",
        type: "number",
        help: "0 para no rotar automáticamente.",
      },
    ],
  },
  trustbar: {
    label: "Barra de confianza",
    description: "Envío, asesoría y compra segura, debajo del encabezado.",
    usesHeading: false,
    fields: [],
  },
  categorias: {
    label: "Categorías populares",
    description:
      "Tarjetas con las categorías que más productos tienen publicados.",
    usesHeading: true,
    fields: [
      { key: "limite", label: "Cuántas mostrar", type: "number" },
    ],
  },
  asesor: {
    label: "Asesor de producto",
    description: "Dos preguntas que recomiendan un producto del catálogo.",
    usesHeading: true,
    fields: [],
  },
  productos: {
    label: "Productos destacados",
    description:
      "Carrusel con los productos marcados como Destacado y un botón al catálogo.",
    usesHeading: true,
    fields: [
      { key: "limite", label: "Cuántos mostrar", type: "number" },
      {
        key: "categoria",
        label: "Limitar a una categoría",
        help: "Vacío para tomar de todo el catálogo.",
      },
    ],
  },
  faq: {
    label: "Preguntas frecuentes",
    description:
      "Las preguntas publicadas en el módulo Preguntas frecuentes.",
    usesHeading: false,
    fields: [{ key: "limite", label: "Cuántas mostrar", type: "number" }],
  },
  texto: {
    label: "Texto libre",
    description: "Un bloque de texto con título, para avisos o secciones nuevas.",
    usesHeading: true,
    fields: [],
  },
  banner: {
    label: "Banner con botón",
    description: "Imagen ancha con un mensaje y un botón.",
    usesHeading: true,
    fields: [
      { key: "imagen", label: "Imagen" },
      { key: "imagenMovil", label: "Imagen para móvil" },
      { key: "botonTexto", label: "Texto del botón" },
      { key: "botonUrl", label: "Enlace del botón" },
    ],
  },
};

export type PageBlock = {
  id: string;
  page_id: string;
  block_key: string;
  type: string;
  title: string;
  body: string;
  config_json: string;
  sort_order: number;
};

export type BlockConfig = Record<string, string | number | boolean>;

export function parseBlockConfig(block: PageBlock): BlockConfig {
  try {
    const parsed = JSON.parse(block.config_json || "{}");
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

export function blockNumber(
  config: BlockConfig,
  key: string,
  porDefecto: number,
): number {
  const value = Number(config[key]);
  return Number.isFinite(value) && value > 0 ? value : porDefecto;
}

export function blockText(config: BlockConfig, key: string): string {
  const value = config[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getBlockDefinition(type: string): BlockDefinition | null {
  return blockTypes[type] ?? null;
}
