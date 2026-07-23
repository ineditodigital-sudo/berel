import { env } from "cloudflare:workers";
import { requireAdminApi } from "@/lib/admin-auth";

type RuntimeEnv = { DB: D1Database; MEDIA: R2Bucket };
type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const payload = (await request.json()) as { alt_text?: string };
  const runtime = env as unknown as RuntimeEnv;
  await runtime.DB.prepare(
    "UPDATE media SET alt_text=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",
  )
    .bind(payload.alt_text?.trim() ?? "", id)
    .run();
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const runtime = env as unknown as RuntimeEnv;
  const item = await runtime.DB.prepare("SELECT object_key FROM media WHERE id=?")
    .bind(id)
    .first<{ object_key: string }>();
  if (item) await runtime.MEDIA.delete(item.object_key);
  await runtime.DB.prepare("DELETE FROM media WHERE id=?").bind(id).run();
  return Response.json({ ok: true });
}
