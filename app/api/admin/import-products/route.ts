import { env } from "cloudflare:workers";
import { requireAdminApi } from "@/lib/admin-auth";

type RuntimeEnv = { DB: D1Database };

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Selecciona un archivo CSV." }, { status: 400 });
  }
  if (file.size > 5_000_000) {
    return Response.json({ error: "El CSV no puede superar 5 MB." }, { status: 400 });
  }
  const rows = parseCsv(await file.text());
  const headers = rows.shift()?.map((header) => slugify(header).replaceAll("-", "_"));
  if (!headers?.includes("name") && !headers?.includes("nombre")) {
    return Response.json(
      { error: "El CSV debe incluir una columna name o nombre." },
      { status: 400 },
    );
  }
  const db = (env as unknown as RuntimeEnv).DB;
  const categoryResult = await db.prepare("SELECT id, name, slug FROM categories").all<{
    id: string;
    name: string;
    slug: string;
  }>();
  const categories = new Map<string, string>();
  categoryResult.results.forEach((category) => {
    categories.set(category.slug.toLowerCase(), category.id);
    categories.set(category.name.toLowerCase(), category.id);
  });
  let created = 0;
  let updated = 0;
  const errors: string[] = [];
  for (const [index, values] of rows.entries()) {
    const raw = Object.fromEntries(headers.map((header, cell) => [header, values[cell] ?? ""]));
    const name = raw.name || raw.nombre;
    if (!name) {
      errors.push(`Fila ${index + 2}: nombre vacío.`);
      continue;
    }
    const sku = raw.sku?.trim() ?? "";
    const slug = slugify(raw.slug || name);
    const categoryInput = (raw.category || raw.categoria || "sin-categorizar").toLowerCase();
    const categoryId = categories.get(categoryInput) ?? categories.get(slugify(categoryInput)) ?? "cat-uncategorized";
    const price = Number((raw.price || raw.precio || "0").replace(/[$,\s]/g, ""));
    const priceCents = Math.round(price * 100);
    if (!Number.isFinite(priceCents) || priceCents < 0) {
      errors.push(`Fila ${index + 2}: precio inválido.`);
      continue;
    }
    const existing = await db
      .prepare("SELECT id FROM products WHERE (sku != '' AND sku = ?) OR slug = ? LIMIT 1")
      .bind(sku, slug)
      .first<{ id: string }>();
    const payload = [
      sku,
      name.trim(),
      slug,
      categoryId,
      raw.short_description || raw.descripcion_corta || "",
      raw.description || raw.descripcion || "",
      priceCents,
      Number(raw.stock || raw.existencia || 0),
      raw.image_url || raw.imagen || "",
      raw.technical_sheet_url || raw.ficha_tecnica || "",
    ];
    if (existing) {
      await db
        .prepare(
          `UPDATE products SET sku=?,name=?,slug=?,category_id=?,short_description=?,
           description=?,price_cents=?,stock=?,image_url=?,technical_sheet_url=?,
           updated_at=CURRENT_TIMESTAMP WHERE id=?`,
        )
        .bind(...payload, existing.id)
        .run();
      updated += 1;
    } else {
      await db
        .prepare(
          `INSERT INTO products
           (id,sku,name,slug,category_id,short_description,description,price_cents,stock,image_url,technical_sheet_url)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .bind(crypto.randomUUID(), ...payload)
        .run();
      created += 1;
    }
  }
  return Response.json({ created, updated, errors: errors.slice(0, 30) });
}
