import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default async function OrderConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; status?: string }>;
}) {
  const { order, status } = await searchParams;
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f5f6f8" }}>
      <section style={{ maxWidth: 560, padding: 48, borderRadius: 24, background: "#fff", textAlign: "center", boxShadow: "0 20px 60px #1111" }}>
        <CheckCircle size={58} color="#20a75a" />
        <h1>{status === "pending" ? "Tu pago está pendiente" : "Recibimos tu pedido"}</h1>
        <p>Pedido <b>{order ?? "Berel"}</b>. Enviaremos la confirmación y los siguientes pasos a tu correo.</p>
        <p>Las entregas en Aguascalientes se realizan en un máximo de 24 horas después de confirmar el pago.</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 18, padding: "13px 20px", borderRadius: 24, background: "#e5252a", color: "#fff", fontWeight: 800 }}>Volver a la tienda</Link>
      </section>
    </main>
  );
}
