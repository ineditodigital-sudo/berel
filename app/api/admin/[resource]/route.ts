import { env } from "cloudflare:workers";
import { requireAdminApi } from "@/lib/admin-auth";
import { getCmsResource } from "@/lib/cms-resources";

type RouteContext = { params: Promise<{ resource: string }> };
type RuntimeEnv = { DB: D1Database };

function normalizeValue(type: string | undefined, value: unknown) {
  if (type === "boolean") return value ? 1 : 0;
  if (type === "number") {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  }
  if (type === "money") {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) : null;
  }
  return typeof value === "string" ? value.trim() : value ?? "";
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { resource: key } = await context.params;
  const resource = getCmsResource(key);
  if (!resource) return Response.json({ error: "Recurso desconocido." }, { status: 404 });
  const db = (env as unknown as RuntimeEnv).DB;
  const result = await db
    .prepare(`SELECT * FROM ${resource.table} ORDER BY ${resource.orderBy} LIMIT 500`)
    .all();
  return Response.json({ items: result.results, resource });
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { resource: key } = await context.params;
  const resource = getCmsResource(key);
  if (!resource || key === "orders" || key === "settings") {
    return Response.json({ error: "Recurso no editable." }, { status: 400 });
  }
  const payload = (await request.json()) as Record<string, unknown>;
  const missing = resource.fields.find(
    (field) => field.required && !String(payload[field.key] ?? "").trim(),
  );
  if (missing) {
    return Response.json({ error: `${missing.label} es obligatorio.` }, { status: 400 });
  }
  const fields = resource.fields.map((field) => field.key);
  const values = resource.fields.map((field) => normalizeValue(field.type, payload[field.key]));
  const id = crypto.randomUUID();
  const columns = ["id", ...fields].join(",");
  const placeholders = fields.map(() => "?").join(",");
  const db = (env as unknown as RuntimeEnv).DB;
  await db
    .prepare(`INSERT INTO ${resource.table} (${columns}) VALUES (?,${placeholders})`)
    .bind(id, ...values)
    .run();
  return Response.json({ id }, { status: 201 });
}
