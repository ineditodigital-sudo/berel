import { env } from "cloudflare:workers";
import { requireAdminApi } from "@/lib/admin-auth";
import { getCmsResource } from "@/lib/cms-resources";

type RouteContext = { params: Promise<{ resource: string; id: string }> };
type RuntimeEnv = { DB: D1Database };

function normalizeValue(type: string | undefined, value: unknown) {
  if (type === "boolean") return value ? 1 : 0;
  if (type === "number") return value === "" || value == null ? null : Number(value);
  if (type === "money") {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number * 100) : null;
  }
  return typeof value === "string" ? value.trim() : value ?? "";
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { resource: key, id } = await context.params;
  const resource = getCmsResource(key);
  if (!resource) return Response.json({ error: "Recurso desconocido." }, { status: 404 });
  const payload = (await request.json()) as Record<string, unknown>;
  const changed = resource.fields.filter((field) => field.key in payload);
  if (!changed.length) return Response.json({ error: "No hay cambios." }, { status: 400 });
  const set = changed.map((field) => `${field.key} = ?`).join(",");
  const values = changed.map((field) => normalizeValue(field.type, payload[field.key]));
  const db = (env as unknown as RuntimeEnv).DB;
  const identityColumn = key === "settings" ? "key" : "id";
  await db
    .prepare(`UPDATE ${resource.table} SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE ${identityColumn} = ?`)
    .bind(...values, id)
    .run();
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { resource: key, id } = await context.params;
  const resource = getCmsResource(key);
  if (!resource || key === "orders" || key === "settings") {
    return Response.json({ error: "Este recurso no se puede eliminar." }, { status: 400 });
  }
  const db = (env as unknown as RuntimeEnv).DB;
  await db.prepare(`DELETE FROM ${resource.table} WHERE id = ?`).bind(id).run();
  return Response.json({ ok: true });
}
