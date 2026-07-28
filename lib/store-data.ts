export type Product = { slug:string; name:string; category:string; image:string; from:number; to?:number; old?:number; tag:string; rating:number; description:string; details:string; benefits:string[]; uses:string; technicalSheetUrl?:string; whatsappMessage?:string; featured:boolean };

export type CmsProductRow = {
  slug: string;
  name: string;
  category_name?: string;
  image_url?: string;
  price_cents: number;
  compare_at_cents?: number | null;
  short_description?: string;
  description?: string;
  benefits_json?: string;
  uses?: string;
  technical_sheet_url?: string;
  whatsapp_message?: string;
  is_featured?: number | boolean;
};

export function cmsProductToStore(row: CmsProductRow): Product {
  let benefits: string[] = [];
  try {
    benefits = JSON.parse(row.benefits_json || "[]") as string[];
  } catch {
    benefits = [];
  }
  return {
    slug: row.slug,
    name: row.name,
    category: row.category_name || "Sin categorizar",
    image: row.image_url || "/berel-icono.png",
    from: Number(row.price_cents || 0) / 100,
    old: row.compare_at_cents ? Number(row.compare_at_cents) / 100 : undefined,
    tag: row.compare_at_cents ? "Oferta" : "Producto Berel",
    rating: 5,
    // Resumen para las tarjetas y texto completo para la ficha: el
    // catálogo importado trae descripciones de hasta 1800 caracteres que
    // antes se perdían al quedarse solo con el resumen.
    description: row.short_description || row.description || "",
    details: row.description || "",
    benefits,
    uses: row.uses || "",
    technicalSheetUrl: row.technical_sheet_url || "",
    whatsappMessage: row.whatsapp_message || "",
    // "Destacado" en el CMS es lo que decide qué aparece en la home.
    featured: Boolean(Number(row.is_featured ?? 0)),
  };
}

// El catálogo, las categorías y las campañas viven en D1 y se administran desde
// el CMS. No debe existir aquí ninguna lista de productos ni de categorías: un
// catálogo de respaldo hace que la tienda siga mostrando datos viejos cuando la
// base falla, en lugar de exponer el problema.

export const slugify = (value:string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
export const money = (n:number) => n.toLocaleString("es-MX",{style:"currency",currency:"MXN",minimumFractionDigits:2});
