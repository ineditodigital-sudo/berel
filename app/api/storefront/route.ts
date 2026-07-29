import { env } from "cloudflare:workers";

type RuntimeEnv = { DB: D1Database };

function parseJson<T>(value: unknown, fallback: T): T {
  try {
    return typeof value === "string" ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Columnas del listado. Se enumeran en lugar de usar p.* para dejar fuera
// `description`: son ~1.5 KB por producto que sólo necesita la ficha, y con 140
// productos inflaban esta respuesta de ~55 KB a 272 KB en cada carga de la
// tienda. La ficha pide la suya con ?producto=<slug>.
const COLUMNAS_LISTADO = `p.id, p.sku, p.slug, p.name, p.short_description,
  p.price_cents, p.compare_at_cents, p.stock, p.image_url, p.gallery_json,
  p.benefits_json, p.uses, p.technical_sheet_url, p.whatsapp_message,
  p.category_id, p.is_active, p.is_featured`;

export async function GET(request: Request) {
  const db = (env as unknown as RuntimeEnv).DB;

  // Una sola ficha, con todos sus campos.
  const slug = new URL(request.url).searchParams.get("producto");
  if (slug) {
    const producto = await db
      .prepare(
        `SELECT p.*, c.name AS category_name, c.slug AS category_slug
         FROM products p LEFT JOIN categories c ON c.id=p.category_id
         WHERE p.slug=? AND p.is_active=1`,
      )
      .bind(slug)
      .first();
    return Response.json({ producto: producto ?? null });
  }

  const [products, categories, slides, branches, faqs, settings, blocks] = await db.batch([
    db.prepare(`SELECT ${COLUMNAS_LISTADO}, c.name AS category_name, c.slug AS category_slug
      FROM products p LEFT JOIN categories c ON c.id=p.category_id
      WHERE p.is_active=1 ORDER BY p.is_featured DESC,p.name ASC`),
    db.prepare("SELECT * FROM categories WHERE is_active=1 ORDER BY sort_order,name"),
    db.prepare("SELECT * FROM carousel_slides WHERE is_active=1 ORDER BY sort_order"),
    db.prepare("SELECT * FROM branches WHERE is_active=1 ORDER BY name"),
    db.prepare("SELECT * FROM faqs WHERE is_active=1 ORDER BY sort_order"),
    db.prepare("SELECT * FROM site_settings ORDER BY key"),
    // Las secciones de cada página, en el orden en que deben dibujarse.
    db.prepare(`SELECT b.*, p.slug AS page_slug FROM content_blocks b
      JOIN pages p ON p.id=b.page_id
      WHERE b.is_active=1 ORDER BY p.slug, b.sort_order`),
  ]);
  const settingsObject = Object.fromEntries(
    settings.results.map((row) => [
      String(row.key),
      parseJson(row.value_json, {}),
    ]),
  );
  return Response.json({
    products: products.results,
    categories: categories.results,
    slides: slides.results,
    branches: branches.results,
    faqs: faqs.results,
    blocks: blocks.results,
    settings: settingsObject,
  });
}
