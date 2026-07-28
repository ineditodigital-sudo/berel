import { env } from "cloudflare:workers";

type RuntimeEnv = { DB: D1Database };

function parseJson<T>(value: unknown, fallback: T): T {
  try {
    return typeof value === "string" ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function GET() {
  const db = (env as unknown as RuntimeEnv).DB;
  const [products, categories, slides, branches, faqs, settings, blocks] = await db.batch([
    db.prepare(`SELECT p.*, c.name AS category_name, c.slug AS category_slug
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
