"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import StoreFooter from "@/components/StoreFooter";

function subscribeToNavigation(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

export default function OrderConfirmation() {
  // El número de pedido llega en la URL. Esta página se publica como documento
  // estático, así que leerlo en el servidor congelaría el valor del momento de
  // la exportación y todos los clientes verían el mismo número de pedido.
  const search = useSyncExternalStore(
    subscribeToNavigation,
    () => window.location.search,
    () => "",
  );
  const params = new URLSearchParams(search);
  const order = params.get("order");
  const status = params.get("status");

  return (
    <>
      <main id="main-content" style={{ minHeight: "min(70vh, 720px)", display: "grid", placeItems: "center", padding: 24, background: "#f5f6f8" }}>
      <section style={{ maxWidth: 560, padding: 48, borderRadius: 24, background: "#fff", textAlign: "center", boxShadow: "0 20px 60px #1111" }}>
        <CheckCircle size={58} color="#20a75a" />
        <h1>{status === "pending" ? "Tu pago está pendiente" : "Recibimos tu pedido"}</h1>
        {order ? (
          <p>Pedido <b>{order}</b>. Enviaremos la confirmación y los siguientes pasos a tu correo.</p>
        ) : (
          <p>Enviaremos la confirmación y los siguientes pasos a tu correo.</p>
        )}
        <p>Las entregas se realizan en un máximo de 24 horas después de confirmar el pago.</p>
        <Link href="/" style={{ display: "inline-block", marginTop: 18, padding: "13px 20px", borderRadius: 24, background: "#e5252a", color: "#fff", fontWeight: 800 }}>Volver a la tienda</Link>
      </section>
      </main>
      <StoreFooter />
    </>
  );
}
