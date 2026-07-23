import { env } from "cloudflare:workers";
import { requireAdminApi } from "@/lib/admin-auth";

type RuntimeEnv = { DB: D1Database; MEDIA: R2Bucket };
const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "application/pdf",
]);

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const runtime = env as unknown as RuntimeEnv;
  const result = await runtime.DB.prepare(
    "SELECT * FROM media ORDER BY created_at DESC LIMIT 500",
  ).all();
  return Response.json({ items: result.results });
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (!auth.ok) return auth.response;
  const form = await request.formData();
  const file = form.get("file");
  const altText = String(form.get("altText") ?? "").trim();
  if (!(file instanceof File) || !allowedTypes.has(file.type)) {
    return Response.json(
      { error: "Sube JPG, PNG, WebP, AVIF o PDF." },
      { status: 400 },
    );
  }
  if (file.size > 15_000_000) {
    return Response.json({ error: "El archivo no puede superar 15 MB." }, { status: 400 });
  }
  const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "bin";
  const objectKey = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${extension}`;
  const runtime = env as unknown as RuntimeEnv;
  await runtime.MEDIA.put(objectKey, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name },
  });
  const id = crypto.randomUUID();
  const url = `/api/media/${objectKey}`;
  await runtime.DB.prepare(
    "INSERT INTO media (id,name,object_key,url,mime_type,size,alt_text) VALUES (?,?,?,?,?,?,?)",
  )
    .bind(id, file.name, objectKey, url, file.type, file.size, altText)
    .run();
  return Response.json({ id, url, name: file.name }, { status: 201 });
}
