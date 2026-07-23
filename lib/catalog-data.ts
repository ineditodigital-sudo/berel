import { env } from "cloudflare:workers";
import {
  cmsProductToStore,
  products as fallbackProducts,
  type CmsProductRow,
  type Product,
} from "@/lib/store-data";

type RuntimeEnv = { DB: D1Database };

export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const db = (env as unknown as RuntimeEnv).DB;
    const result = await db
      .prepare(
        `SELECT p.slug,p.name,p.image_url,p.price_cents,p.compare_at_cents,
         p.short_description,p.description,p.benefits_json,p.uses,p.technical_sheet_url,
         p.whatsapp_message,c.name AS category_name
         FROM products p LEFT JOIN categories c ON c.id=p.category_id
         WHERE p.is_active=1 ORDER BY p.is_featured DESC,p.name ASC`,
      )
      .all<CmsProductRow>();
    return result.results.map(cmsProductToStore);
  } catch {
    return fallbackProducts;
  }
}

export async function getCatalogCategories(): Promise<
  Array<{ name: string; slug: string }>
> {
  try {
    const db = (env as unknown as RuntimeEnv).DB;
    const result = await db
      .prepare("SELECT name,slug FROM categories WHERE is_active=1 ORDER BY sort_order,name")
      .all<{ name: string; slug: string }>();
    return result.results;
  } catch {
    return [];
  }
}
