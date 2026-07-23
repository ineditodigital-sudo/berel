import { env } from "cloudflare:workers";

type RuntimeEnv = { DB: D1Database };

export async function POST(request: Request) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return Response.json({ ok: false }, { status: 503 });
  const url = new URL(request.url);
  const payload = (await request.json().catch(() => ({}))) as { data?: { id?: string }; id?: string };
  const paymentId = payload.data?.id ?? payload.id ?? url.searchParams.get("data.id");
  if (!paymentId) return Response.json({ ok: true });
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  if (!response.ok) return Response.json({ ok: false }, { status: 502 });
  const payment = (await response.json()) as {
    status?: string;
    external_reference?: string;
    transaction_amount?: number;
  };
  if (!payment.external_reference) return Response.json({ ok: true });
  const db = (env as unknown as RuntimeEnv).DB;
  const order = await db
    .prepare("SELECT total_cents FROM orders WHERE order_number=?")
    .bind(payment.external_reference)
    .first<{ total_cents: number }>();
  const amountMatches =
    order && Math.round(Number(payment.transaction_amount ?? 0) * 100) === order.total_cents;
  const paid = payment.status === "approved" && amountMatches;
  await db
    .prepare(
      "UPDATE orders SET payment_status=?,status=?,payment_reference=?,updated_at=CURRENT_TIMESTAMP WHERE order_number=?",
    )
    .bind(
      paid ? "paid" : payment.status ?? "pending",
      paid ? "processing" : "pending_payment",
      paymentId,
      payment.external_reference,
    )
    .run();
  return Response.json({ ok: true });
}
