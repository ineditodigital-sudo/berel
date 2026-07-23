import { env } from "cloudflare:workers";

type RuntimeEnv = { DB: D1Database };
type CheckoutItem = { slug: string; quantity: number; presentation?: string };
type CheckoutPayload = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  fulfillmentType?: "delivery" | "pickup";
  branchId?: string;
  address?: Record<string, string>;
  notes?: string;
  items?: CheckoutItem[];
};

function readJson<T>(value: unknown, fallback: T): T {
  try {
    return typeof value === "string" ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.ORDER_EMAIL_FROM;
  if (!key || !from || !to) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  return response.ok;
}

async function createMercadoPagoPreference(
  orderNumber: string,
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>,
  customerEmail: string,
  origin: string,
) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!token) return null;
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      items: items.map((item) => ({
        title: item.name,
        quantity: item.quantity,
        currency_id: "MXN",
        unit_price: item.unitPriceCents / 100,
      })),
      payer: { email: customerEmail },
      external_reference: orderNumber,
      back_urls: {
        success: `${origin}/pedido/confirmado?order=${orderNumber}`,
        pending: `${origin}/pedido/confirmado?order=${orderNumber}&status=pending`,
        failure: `${origin}/checkout?payment=failed`,
      },
      auto_return: "approved",
      notification_url: `${origin}/api/payments/mercadopago`,
    }),
  });
  if (!response.ok) throw new Error("Mercado Pago rechazó la creación del cobro.");
  const data = (await response.json()) as { init_point?: string; sandbox_init_point?: string; id?: string };
  return { url: data.init_point ?? data.sandbox_init_point ?? null, reference: data.id ?? "" };
}

export async function POST(request: Request) {
  const payload = (await request.json()) as CheckoutPayload;
  const name = payload.customerName?.trim();
  const email = payload.customerEmail?.trim().toLowerCase();
  const phone = payload.customerPhone?.trim();
  const items = payload.items?.filter((item) => item.slug && item.quantity > 0) ?? [];
  if (!name || !email || !phone || !items.length) {
    return Response.json({ error: "Completa tus datos y agrega productos." }, { status: 400 });
  }
  if (!["delivery", "pickup"].includes(payload.fulfillmentType ?? "")) {
    return Response.json({ error: "Selecciona envío o retiro en sucursal." }, { status: 400 });
  }
  if (payload.fulfillmentType === "delivery" && !payload.address?.street) {
    return Response.json({ error: "Completa la dirección de entrega." }, { status: 400 });
  }
  const db = (env as unknown as RuntimeEnv).DB;
  const commerceRow = await db
    .prepare("SELECT value_json FROM site_settings WHERE key='commerce'")
    .first<{ value_json: string }>();
  const paymentRow = await db
    .prepare("SELECT value_json FROM site_settings WHERE key='payments'")
    .first<{ value_json: string }>();
  const notificationRow = await db
    .prepare("SELECT value_json FROM site_settings WHERE key='notifications'")
    .first<{ value_json: string }>();
  const commerce = readJson(commerceRow?.value_json, {
    minimumOrderCents: 80000,
    deliveryState: "Aguascalientes",
    deliveryPromiseHours: 24,
  });
  const slugs = [...new Set(items.map((item) => item.slug))];
  const placeholders = slugs.map(() => "?").join(",");
  const productResult = await db
    .prepare(`SELECT id,sku,name,slug,price_cents,stock FROM products WHERE is_active=1 AND slug IN (${placeholders})`)
    .bind(...slugs)
    .all<{ id: string; sku: string; name: string; slug: string; price_cents: number; stock: number }>();
  const bySlug = new Map(productResult.results.map((product) => [product.slug, product]));
  const orderLines = items.map((item) => {
    const product = bySlug.get(item.slug);
    if (!product) throw new Error(`Producto no disponible: ${item.slug}`);
    if (product.stock < item.quantity) throw new Error(`Existencia insuficiente para ${product.name}.`);
    return { ...product, quantity: item.quantity, totalCents: product.price_cents * item.quantity };
  });
  const subtotalCents = orderLines.reduce((sum, line) => sum + line.totalCents, 0);
  if (subtotalCents < Number(commerce.minimumOrderCents ?? 80000)) {
    return Response.json(
      { error: `La compra mínima es de $${(Number(commerce.minimumOrderCents ?? 80000) / 100).toLocaleString("es-MX")} MXN.` },
      { status: 400 },
    );
  }
  if (
    payload.fulfillmentType === "delivery" &&
    String(payload.address?.state ?? "").toLowerCase() !==
      String(commerce.deliveryState ?? "Aguascalientes").toLowerCase()
  ) {
    return Response.json(
      { error: "Por ahora solo realizamos envíos dentro de Aguascalientes." },
      { status: 400 },
    );
  }
  if (payload.fulfillmentType === "pickup" && !payload.branchId) {
    return Response.json({ error: "Selecciona una sucursal." }, { status: 400 });
  }
  const orderId = crypto.randomUUID();
  const orderNumber = `BER-${Date.now().toString().slice(-8)}`;
  const payment = readJson(paymentRow?.value_json, {
    provider: "mercadopago",
    enabled: false,
  });
  const provider = payment.enabled ? String(payment.provider) : "manual";
  await db.batch([
    db.prepare(
      `INSERT INTO orders
       (id,order_number,payment_provider,fulfillment_type,branch_id,customer_name,
        customer_email,customer_phone,address_json,subtotal_cents,shipping_cents,total_cents,notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).bind(
      orderId,
      orderNumber,
      provider,
      payload.fulfillmentType,
      payload.branchId || null,
      name,
      email,
      phone,
      JSON.stringify(payload.address ?? {}),
      subtotalCents,
      0,
      subtotalCents,
      payload.notes?.trim() ?? "",
    ),
    ...orderLines.flatMap((line) => [
      db.prepare(
        `INSERT INTO order_items (id,order_id,product_id,sku,name,quantity,unit_price_cents,total_cents)
         VALUES (?,?,?,?,?,?,?,?)`,
      ).bind(
        crypto.randomUUID(),
        orderId,
        line.id,
        line.sku,
        line.name,
        line.quantity,
        line.price_cents,
        line.totalCents,
      ),
      db.prepare("UPDATE products SET stock=stock-?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
        .bind(line.quantity, line.id),
    ]),
  ]);
  let paymentUrl: string | null = null;
  if (provider === "mercadopago") {
    const preference = await createMercadoPagoPreference(
      orderNumber,
      orderLines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        unitPriceCents: line.price_cents,
      })),
      email,
      new URL(request.url).origin,
    );
    paymentUrl = preference?.url ?? null;
    if (preference?.reference) {
      await db.prepare("UPDATE orders SET payment_reference=? WHERE id=?")
        .bind(preference.reference, orderId)
        .run();
    }
  }
  const notifications = readJson(notificationRow?.value_json, {
    adminEmail: "",
    customerConfirmation: true,
    adminNewOrder: true,
  });
  const summary = orderLines.map((line) => `${line.quantity} × ${line.name}`).join("<br>");
  const emailHtml = `<h1>Pedido ${orderNumber}</h1><p>${summary}</p><p>Total: $${(subtotalCents / 100).toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN</p><p>${payload.fulfillmentType === "pickup" ? "Retiro en sucursal" : "Entrega en Aguascalientes en un máximo de 24 horas después del pago."}</p>`;
  const notificationResults = await Promise.all([
    notifications.customerConfirmation ? sendEmail(email, `Recibimos tu pedido ${orderNumber}`, emailHtml) : false,
    notifications.adminNewOrder && notifications.adminEmail
      ? sendEmail(String(notifications.adminEmail), `Nueva venta ${orderNumber}`, `<p>Cliente: ${name} · ${email} · ${phone}</p>${emailHtml}`)
      : false,
  ]);
  return Response.json({
    orderNumber,
    paymentUrl,
    notificationSent: notificationResults.some(Boolean),
    confirmationUrl: `/pedido/confirmado?order=${orderNumber}`,
  });
}
